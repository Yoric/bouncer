(function() {
  var $ = document.getElementById.bind(document);
  var myConsole = $("console");
  for (var id of ["pad_1", "pad_2", "pad_3", "pad_4"]) {
    (function() {
      var id2 = id;
      var pad = $(id);
      pad.addEventListener("touchmove", function() {
        myConsole.innerHTML += "touchmove " + id2 + "<br />";
      });
/*
      pad.addEventListener("mousemove", function() {
        myConsole.innerHTML += "mousemove " + id2 + "<br />";
      });
*/
    })();
  }
})();
