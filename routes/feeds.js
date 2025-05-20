const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const rssFinder = require("rss-finder");

/* create new feed */
router.post("/create", async (req, res) => {
    if (!checkBody(req.body, ["url"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }

    try {
        const { feedUrls = [] } = await rssFinder(req.body.url);

        if (feedUrls.length) {
            return res.json({ result: true, url: feedUrls[0].url });
        }

        const homepage = new URL(req.body.url).origin;
        const guesses = [
            "/rss.xml",
            "/feed.xml",
            "/rss",
            "/feed",
            "/atom.xml",
            "/index.xml",
            "/alerte-rss",
        ];

        // test des différents lien pour trouver le flux rss
        for (const path of guesses) {
            const candidate = homepage + path;

            const head = await fetch(candidate, {
                method: "HEAD",
                headers: { "user-agent": "Mozilla/5.0" }, // évite les 403 Cloudflare
            }).catch(() => null); // null pour éviter le crash

            const ct = head?.headers.get("content-type") || "";
            if (head?.ok && /xml|rss|atom/i.test(ct)) {
                return res.json({ result: true, url: candidate });
            }
        }

        return res.status(404).json({
            result: false,
            error: "Aucun feed détecté pour cette URL",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ result: false, error: err.message });
    }
});

module.exports = router;
