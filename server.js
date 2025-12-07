const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Função para ping real
function pingHost(host) {
    return new Promise((resolve, reject) => {
        let cmd = "";
        if (process.platform === "win32") {
            cmd = `ping -n 1 ${host}`;
        } else {
            cmd = `ping -c 1 ${host}`;
        }

        exec(cmd, (error, stdout, stderr) => {
            if (error) return reject(stderr || error.message);

            // Tenta extrair o IP do resultado do ping
            const ipMatch = stdout.match(/\b\d{1,3}(\.\d{1,3}){3}\b/);
            if (ipMatch) resolve(ipMatch[0]);
            else resolve(null);
        });
    });
}

// PING de qualquer host externo
app.get('/ping', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Informe a URL" });

    try {
        const host = new URL(url).hostname;
        const ip = await pingHost(host);
        return res.json({ ip });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// PING interno: busca a primeira URL dentro do caminho
app.get('/ping-internal', async (req, res) => {
    const { urlPath } = req.query;
    if (!urlPath) return res.status(400).json({ error: "Informe o caminho interno" });

    try {
        const response = await fetch(urlPath);
        const html = await response.text();

        // Procura a primeira URL dentro do conteúdo
        const urlMatch = html.match(/https?:\/\/[^\s"'<>]+/);
        if (!urlMatch) return res.json({ ip: null, url: null, msg: "Nenhuma URL encontrada" });

        const internalUrl = urlMatch[0];
        const internalHost = new URL(internalUrl).hostname;
        const ip = await pingHost(internalHost);

        return res.json({ ip, url: internalUrl });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Ping API rodando na porta ${PORT}`));
