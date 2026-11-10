(function(){
  "use strict";
  var todo=document.getElementById("todo"),left=document.getElementById("left");
  function count(){
    var n=todo.querySelectorAll("li:not(.done)").length;
    left.textContent=n===0?"всё сделано 🎉":n+" осталось";
  }
  todo.addEventListener("click",function(e){
    var b=e.target.closest(".chk");if(!b)return;
    var li=b.parentNode,on=!li.classList.contains("done");
    li.classList.toggle("done",on);b.setAttribute("aria-pressed",String(on));count();
  });
  count();
  var sw=document.getElementById("sw"),yearly=false;
  var pro=document.getElementById("proPrice"),team=document.getElementById("teamPrice");
  var per=document.getElementById("per"),per2=document.getElementById("per2");
  var lm=document.getElementById("lblM"),ly=document.getElementById("lblY");
  sw.addEventListener("click",function(){
    yearly=!yearly;sw.setAttribute("aria-checked",String(yearly));
    pro.textContent=yearly?"312":"390";team.textContent=yearly?"632":"790";
    per.textContent=per2.textContent=yearly?"/ мес, при оплате за год":"/ мес";
    lm.classList.toggle("on",!yearly);ly.classList.toggle("on",yearly);
  });
})();
