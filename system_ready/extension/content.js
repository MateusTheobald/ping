(function(){
  const btn=document.createElement("div");
  btn.textContent="⚡";
  btn.style.cssText="position:fixed;bottom:20px;right:20px;background:#0008;color:#fff;padding:10px;border-radius:50%;cursor:pointer;z-index:999999;";
  btn.onclick=()=>chrome.runtime.sendMessage({openPopup:true});
  document.body.appendChild(btn);
})();
