const axios = require("axios");
const xml2js = require("xml2js");
const { htmlToText } = require("html-to-text");
const { tryCatch } = require("../utils/tryCatch");
const { checkBody } = require("../modules/checkBody");
const rssFinder = require("rss-finder");
const https = require("https");
const ArticleModel = require("../models/articles.model");
const FeedModel = require("../models/feeds");

/* Agent https (timeout + keep-alive) */
const makeAgent = (insecure = false) =>
    new https.Agent({
        keepAlive: true,
        timeout: 5_000, // coupe après 5 s d’inactivité
        rejectUnauthorized: !insecure,
    });

exports.createFeed = tryCatch(async (req, res) => {
    if (!checkBody(req.body, ["url"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }

    const { url } = req.body;
    const query = url.trim();

    /* ----- Détection automatique avec rss-finder ----- */
    const { feedUrls = [] } = await rssFinder(query, {
        gotOptions: {
            headers: { "user-agent": "Mozilla/5.0" },
            timeout: 10_000,
        },
    }).catch(async (err) => {
        // Retente sans vérification pour les sites ou le certificat est invalide
        if (String(err).includes("unable to verify the first certificate")) {
            return rssFinder(query, {
                gotOptions: {
                    headers: { "user-agent": "Mozilla/5.0" },
                    timeout: 10_000,
                    https: { rejectUnauthorized: false },
                },
            });
        }
        throw err;
    });

    if (feedUrls.length) {
        return res.json({ result: true, url: feedUrls[0].url });
    }

    /* ----- Test des différents lien pour trouver le flux rss ----- */
    const homepage = new URL(query).origin;
    const guesses = [
        "/rss.xml",
        "/feed.xml",
        "/rss",
        "/feed",
        "/atom.xml",
        "/index.xml",
        "/alerte-rss",
    ];

    // Boucle sur chaque url du tableau guesses
    for (const path of guesses) {
        const candidate = homepage + path;

        const head = await fetch(candidate, {
            method: "HEAD",
            agent: makeAgent(),
            headers: { "user-agent": "Mozilla/5.0" }, // évite les 403 Cloudflare
        }).catch(() => null); // null pour éviter le crash

        let ok =
            head?.ok &&
            /xml|rss|atom/i.test(head.headers.get("content-type") || "");

        /* Si HEAD ne marche pas, on tente GET  */
        if (!ok && (!head || head.status >= 400)) {
            const ctrl = new AbortController();
            const get = await fetch(candidate, {
                method: "GET",
                agent: makeAgent(),
                headers: {
                    "user-agent": "Mozilla/5.0",
                    Range: "bytes=0-131071", // Premier 128 Kio seulement
                },
                signal: ctrl.signal,
            }).catch(() => null);

            ok =
                get?.ok &&
                /xml|rss|atom/i.test(get.headers.get("content-type") || "");
            ctrl.abort(); // stoppe la lecture au-delà de 128 kio
        }

        if (ok) {
            try {
                // Étape 1 : Faire une requête HTTP pour récupérer le flux RSS
                const response = await axios.get(candidate);
                const xmlData = response.data;

                // Étape 2 : Parser le XML en objet JavaScript
                const parser = new xml2js.Parser({ explicitArray: false });
                const result = await parser.parseStringPromise(xmlData);

                // Étape 3 : Extraire les articles
                const items = result.feed.entry;
                const logo = result.feed.logo;
                const feedId = result.feed.id;

                const articleArray = await Promise.all(
                    items.map(async (item) => {
                        const newArticle = new ArticleModel({
                            url: item.link.$.href,
                            title: item.title,
                            description: htmlToText(item.content._, {
                                wordwrap: false,
                                ignoreHref: true,
                                ignoreImage: true,
                            }),
                            media: item["media:content"]?.$.url || null,
                            date: item.updated,
                            author: item.author?.name || "Inconnu",
                            defaultMedia: logo,
                        });
                        const savedArticle = await newArticle.save();
                        return savedArticle._id;
                    })
                );

                const sendUrl = new URL(url);
                const domainName = sendUrl.hostname.replace(/^www\./, ""); // "lesnumeriques.com"

                const feed = new FeedModel({
                    url: feedId,
                    name: domainName,
                    articles: articleArray,
                    defaultMedia: logo,
                });

                const newFeed = await feed.save();

                // Étape 5 : Envoyer la réponse JSON
                return res
                    .status(200)
                    .json({ success: true, feedId: newFeed._id });
            } catch (error) {
                // Étape 6 : Gestion des erreurs
                console.error("Erreur lors du scraping :", error.message);
                res.status(500).json({
                    success: false,
                    message:
                        "Erreur lors de la récupération ou du traitement des articles",
                    error: error.message,
                });
            }
            return res.json({ result: true, url: candidate });
        }
    }
});
