const express=require("express");
const axios=require("axios");
const cheerio=require("cheerio");
const app=express();
app.use(express.json());

app.get("/ping", async (req,res)=>{
  try{
    const url=req.query.url;
    const dns=require("dns");
    dns.lookup(new URL(url).hostname,(err,addr)=>{
      if(err) return res.json({error:err.message});
      res.json({ip:addr});
    });
  }catch(e){res.json({error:e.message});}
});

app.get("/internal", async (req,res)=>{
  try{
    const url=req.query.url;
    const page=await axios.get(url);
    const $=cheerio.load(page.data);
    const found=$("a[href*='configs.php']").attr("href");
    res.json({found});
  }catch(e){res.json({error:e.message});}
});

app.post("/autologin",(req,res)=>{
  const users=req.body.users||[];
  res.json({status:"attempted",users});
});

app.listen(3000,()=>console.log("API OK"));
