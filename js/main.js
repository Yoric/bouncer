(function bouncer() {
  var $ = document.getElementById.bind(document);

  function Sprite(id) {
    this.id = id;
    this.element = document.getElementById(id);
    this.style = this.element.style;

    // The position of the sprite, in pixels.
    this.x = null;
    this.y = null;

    // The current destination of the sprite, in pixels.
    this.nextX = null;
    this.nextY = null;

    // The current width/height of the sprite, in pixels.
    this.width = null;
    this.height = null;

    // An object used to store event information for this sprite
    this.event = {};

    this.readFromDOM();
  }
  Sprite.prototype = {
    /**
     * Perform all reads from DOM
     */
    readFromDOM: function() {
      this.x = this.element.offsetLeft;
      this.y = this.element.offsetTop;
      this.width = this.element.offsetWidth;
      this.height = this.element.offsetHeight;
    },

    /**
     * Write to the DOM the values of this.nextX, this.nextY
     */
    writeToDOM: function() {
      this.style.left = this.nextX + "px";
      this.style.top  = this.nextY + "px";
    }
  };

  var sprites = {
    padNorth: new Sprite("pad_north"),
    padSouth: new Sprite("pad_south"),
    padEast: new Sprite("pad_east"),
    padWest: new Sprite("pad_west")
  };

  // Set initial positions

  var padNorth = sprites.padNorth;
  var padSouth = sprites.padSouth;
  var padEast = sprites.padEast;
  var padWest = sprites.padWest;

  var width = window.innerWidth;
  var height = window.innerHeight;

  padNorth.style.top = "0px";
  padNorth.style.left = (width - padNorth.width) / 2 + "px";
  padNorth.writeToDOM();

  padSouth.style.bottom = "0px";
  padSouth.style.left = (width - padSouth.width) / 2 + "px";
  padSouth.writeToDOM();

  padEast.style.top = (height - padEast.height) / 2 + "px";
  padEast.style.right = "0px";
  padEast.writeToDOM();

  padWest.style.left = "0px";
  padWest.style.bottom = (height - padWest.height) / 2 + "px";
  padWest.writeToDOM();


  for (var key of ["padNorth", "padSouth", "padEast", "padWest"]) {
    (function() {
      var sprite = sprites[key];
      var elt = sprite.element;
      var event = sprite.event;

      // Touch-based control
      elt.addEventListener("touchstart", function(e) {
      });
      elt.addEventListener("touchmove", function(e) {
        event.pageX = e.pageX;
        event.pageY = e.pageY;
      });

      // Mouse-based control
      // (used for testing)
      document.body.addEventListener("mousemove", function(e) {
        event.pageX = e.pageX;
        event.pageY = e.pageY;
      });
      elt.addEventListener("mouseleave", function(e) {
      });
    })();
  }


  var nextFrame = function() {
    // Get the position of all items
    // We need to do this *before* doing any change to CSS or position,
    // for performance reasons.
    for (var key of Object.keys(sprites)) {
      sprites[key].readFromDOM();
    }
    var width = window.innerWidth;
    var height = window.innerHeight;

    // From this point on, there should be NO read from DOM.


    // FIXME: Handle pause

    // FIXME: Handle bounce

    padNorth.nextX = padNorth.event.pageX;
    padSouth.nextX = padSouth.event.pageX;
    padEast.nextY = padEast.event.pageY;
    padWest.nextY = padWest.event.pageY;

    // FIXME: Handle ball movement

    // FIXME: Handle health, win/lose

    for (key of Object.keys(sprites)) {
      sprites[key].writeToDOM();
    }
  };

  nextFrame();

  // Main loop
  requestAnimationFrame(function loop() {
    nextFrame();
    requestAnimationFrame(loop);
  });
})();
