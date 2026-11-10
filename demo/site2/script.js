(function(){
  "use strict";
  var data=[
    [["07:30","HIIT","Анна"],["12:00","Йога","Мария"],["19:00","Силовые","Игорь"]],
    [["08:00","Стретчинг","Мария"],["18:30","HIIT","Анна"],["20:00","Силовые","Игорь"]],
    [["07:30","Силовые","Игорь"],["13:00","HIIT","Анна"],["19:30","Йога","Мария"]],
    [["08:00","HIIT","Анна"],["18:00","Стретчинг","Мария"],["19:30","Силовые","Игорь"]],
    [["07:30","Йога","Мария"],["12:00","HIIT","Анна"],["18:30","Силовые","Игорь"]],
    [["10:00","HIIT","Анна"],["11:30","Йога","Мария"],["13:00","Силовые","Игорь"]]
  ];
  var list=document.getElementById("list"),days=document.querySelectorAll(".day");
  function show(d){
    list.textContent="";
    data[d].forEach(function(r,i){
      var li=document.createElement("li");li.style.animationDelay=(i*70)+"ms";
      var t=document.createElement("time");t.textContent=r[0];
      var w=document.createElement("div");var b=document.createElement("b");b.textContent=r[1];
      var br=document.createElement("br");var s=document.createElement("small");s.textContent="Тренер: "+r[2];
      w.appendChild(b);w.appendChild(br);w.appendChild(s);
      var e=document.createElement("em");e.textContent="есть места";
      li.appendChild(t);li.appendChild(w);li.appendChild(e);list.appendChild(li);
    });
  }
  days.forEach(function(b){b.addEventListener("click",function(){
    days.forEach(function(x){x.classList.toggle("is-on",x===b)});show(Number(b.dataset.d));
  });});
  show(0);
})();
