const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dns = require('dns');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Função para obter IP via DNS
function getIP(host) {
    return new Promise((resolve, reject) => {
        dns.lookup(host, (err, address) => {
            if (err) return reject(err);
            resolve(address);
        });
    });
}

// Ping externo
app.get('/ping', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Informe a URL" });
    try {
        const host = new URL(url).hostname;
        const ip = await getIP(host);
        return res.json({ ip });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Ping interno: pega URLs escritas como texto dentro do HTML (ex: <b>https://exemplo.com</b>)
app.get('/ping-internal', async (req, res) => {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Informe o domínio" });

    try {
        const urlPath = `https://${domain}/omni/accounts/configs.php`;
        const response = await fetch(urlPath);
        const html = await response.text();

        // Divide o HTML em linhas
        const lines = html.split('\n');
        const urlsWithLine = [];

        lines.forEach((line, index) => {
            // Remove espaços no início/fim e busca texto que começa com http ou https
            const match = line.match(/https?:\/\/[^\s"'<>]+/);
            if (match) {
                urlsWithLine.push({
                    url: match[0],       // URL encontrada
                    lineContent: line,   // linha completa, incluindo tags <b>, etc.
                    lineNumber: index + 1
                });
            }
        });

        if (!urlsWithLine.length) {
            return res.json({ ip: null, url: null, msg: "Nenhuma URL encontrada" });
        }

        const firstUrl = urlsWithLine[0].url;
        const firstHost = new URL(firstUrl).hostname;
        const ip = await getIP(firstHost);

        return res.json({
            ip,                     // IP da primeira URL
            url: firstUrl,          // primeira URL
            lineContent: urlsWithLine[0].lineContent, // linha completa para copiar
            allUrls: urlsWithLine   // todas as URLs encontradas
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Ping API rodando na porta ${PORT}`));
