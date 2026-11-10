(function(){
  "use strict";
  var tabs=document.querySelectorAll(".tab"),panels=document.querySelectorAll(".panel");
  tabs.forEach(function(t){t.addEventListener("click",function(){
    tabs.forEach(function(x){x.classList.toggle("is-on",x===t)});
    panels.forEach(function(p){p.classList.toggle("is-on",p.id===t.dataset.tab)});
  });});
  var b=document.getElementById("burger"),n=document.getElementById("nav");
  b.addEventListener("click",function(){var o=n.classList.toggle("is-open");b.setAttribute("aria-expanded",String(o));});
  n.addEventListener("click",function(e){if(e.target.tagName==="A"){n.classList.remove("is-open");b.setAttribute("aria-expanded","false");}});
})();
