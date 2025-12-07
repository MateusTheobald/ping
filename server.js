const express = require("express");
const fetch = require("node-fetch");
const dns = require("dns");
const { promisify } = require("util");

const app = express();
const port = process.env.PORT || 3000;
const resolve = promisify(dns.lookup);

// Permitir CORS para chamadas do content.js
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Ping do domínio ou URL
app.get("/ping", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.json({ ip: null, error: "URL não informada" });

    try {
        const hostname = new URL(url).hostname;
        const ipObj = await resolve(hostname);
        res.json({ ip: ipObj.address });
    } catch (err) {
        res.json({ ip: null, error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Ping API rodando em http://localhost:${port}`);
});
