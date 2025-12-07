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

// Ping interno (sempre /omni/accounts/configs.php do domínio atual)
app.get('/ping-internal', async (req, res) => {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Informe o domínio" });
    try {
        const urlPath = `https://${domain}/omni/accounts/configs.php`;
        const response = await fetch(urlPath);
        const html = await response.text();

        const urlMatch = html.match(/https?:\/\/[^\s"'<>]+/);
        if (!urlMatch) return res.json({ ip: null, url: null, msg: "Nenhuma URL encontrada" });

        const internalUrl = urlMatch[0];
        const internalHost = new URL(internalUrl).hostname;
        const ip = await getIP(internalHost);

        return res.json({ ip, url: internalUrl });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Ping API rodando na porta ${PORT}`));
