const axios = require("axios");
const xml2js = require("xml2js");
const { htmlToText } = require("html-to-text");
const { tryCatch } = require("../utils/tryCatch");
const { checkBody } = require("../modules/checkBody");
const rssFinder = require("rss-finder");
const https = require("https");
const ArticleModel = require("../models/articles.model");
const FeedModel = require("../models/feeds.model");
const CategoryModel = require("../models/categories.model");

/* Agent https (timeout + keep-alive) */
const makeAgent = (insecure = false) =>
    new https.Agent({
        keepAlive: true,
        timeout: 5_000, // coupe après 5 s d’inactivité
        rejectUnauthorized: !insecure,
    });

const addFeedToBdd = async (siteUrl, categoryId, res) => {
    const domain = siteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const regexUrl = new RegExp(`^https?://(?:www\\.)?${domain}`, "i");
    let feedCreated = await FeedModel.findOne({ url: { $regex: regexUrl } });

    if (!feedCreated) {
        // Étape 1 : Faire une requête HTTP pour récupérer le flux RSS
        const response = await axios.get(siteUrl);
        const xmlData = response.data;

        // Étape 2 : Parser le XML en objet JavaScript
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlData);

        // Étape 3 : Extraire les articles
        const items = result?.feed?.entry || result?.rss?.channel?.item;
        const logo = result?.feed?.logo || result?.rss?.channel?.image?.url;

        const articleArray = await Promise.all(
            items.map(async (item) => {
                const newArticle = new ArticleModel({
                    url: item?.link?.$?.href || item?.link,
                    title: item.title,
                    description: htmlToText(
                        item?.content?._ || item?.description,
                        {
                            wordwrap: false,
                            ignoreHref: true,
                            ignoreImage: true,
                        }
                    ),
                    media:
                        item["media:content"]?.$?.url ||
                        item?.enclosure?.url ||
                        null,
                    date: item.updated || item.pubDate,
                    author: item.author?.name || item.author || "Inconnu",
                    defaultMedia: logo,
                });
                const savedArticle = await newArticle.save();
                return savedArticle._id;
            })
        );

        const domainName = new URL(siteUrl).hostname.replace(/^www\./, "");

        const feed = new FeedModel({
            url: siteUrl,
            name: domainName,
            articles: articleArray,
            defaultMedia: logo,
        });

        feedCreated = await feed.save();
    }

    await CategoryModel.findByIdAndUpdate(categoryId, {
        $addToSet: { feeds: feedCreated._id },
    });

    return res.status(200).json({
        result: true,
        feedId: feedCreated._id,
        feedName: feedCreated.name,
    });
};

exports.createFeed = tryCatch(async (req, res) => {
    if (!checkBody(req.body, ["url", "categoryId"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }

    const { url, categoryId } = req.body;
    const query = url.trim();
    const urlRegex =
        /^(https?:\/\/)(?:[\p{L}\d-]+\.)+[\p{L}]{2,63}(?::\d{2,5})?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/u;

    if (!urlRegex.test(query)) {
        return res.status(400).json({
            result: false,
            error: "l'url entrer n'est pas valide",
        });
    }

    if (!(await CategoryModel.findById(categoryId))) {
        return res
            .status(400)
            .json({ result: false, error: "categoryId invalide" });
    }

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

    if (feedUrls.length && feedUrls[0].url)
        return addFeedToBdd(feedUrls[0].url, categoryId, res);

    const homepage = new URL(query).origin;
    const guesses = [
        "/rss.xml",
        "/feed.xml",
        "/rss",
        "/feed",
        "/feed/rss",
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
            return addFeedToBdd(candidate, categoryId, res);
        }
    }
    return res.status(400).json({
        result: false,
        error: "Aucun feed n'as était trouvé pour cette URL",
    });
});
