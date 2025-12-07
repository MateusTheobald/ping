import express from "express";
import cors from "cors";
import dns from "dns/promises";

const app = express();
app.use(cors());

app.get("/ping", async (req, res) => {
    const domain = req.query.domain;
    try {
        const clean = domain.replace("https://","").replace("http://","").split("/")[0];
        const info = await dns.lookup(clean);
        res.json({ ip: info.address });
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.listen(3000, ()=> console.log("API rodando"));
