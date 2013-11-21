(function() {
  var $ = document.getElementById.bind(document);

  var myConsole = $("console");
  var touches = new Map();

  for (var id of ["pad_1", "pad_2", "pad_3", "pad_4"]) {
    (function() {
      var id2 = id;
      var elt = $(id);
      var style = elt.style;
      var transform = function(e) {
        var result = "translateX(" + (e.pageX - 15) + "px) translateY(" + (e.pageY - 15) + "px)";
        console.log(result);
        return result;
      };

      // Touch-based control
      elt.addEventListener("touchstart", function(e) {
      });
      elt.addEventListener("touchmove", function(e) {
        style.transform = transform(e);
      });

      // Mouse-based control
      elt.addEventListener("mousemove", function(e) {
        style.transform = transform(e);
      });
      elt.addEventListener("mouseleave", function(e) {
        style.transform = transform(e);
      });
    })();
  }
})();
