document.getElementById("ping1").onclick=async()=>{
  const url=document.getElementById("domain").value;
  const r=await fetch("https://your-api.onrender.com/ping?url="+encodeURIComponent(url));
  document.getElementById("out").textContent=JSON.stringify(await r.json(),null,2);
};
document.getElementById("autologin").onclick=async()=>{
  const users=[{user:"admin",pass:"123"},{user:"root",pass:"root"}];
  const r=await fetch("https://your-api.onrender.com/autologin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({users})});
  alert("Auto login enviado!");
};
