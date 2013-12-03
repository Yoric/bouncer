(function bouncer() {
  var $ = document.getElementById.bind(document);
  var width = window.innerWidth;
  var height = window.innerHeight;

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
      var rect = this.element.getBoundingClientRect();
      this.x = Math.round(rect.left);
      this.y = Math.round(rect.top);
      this.width = Math.round(rect.width);
      this.height = Math.round(rect.height);
    },

    /**
     * Write to the DOM the values of this.nextX, this.nextY
     */
    writeToDOM: function() {
      this.style.left = this.nextX + "px";
      this.style.top  = this.nextY + "px";
    },

    // Utility methods

    /**
     * Set the x position
     *
     * @param {string} arg One of "left", "right", "center".
     */
    set xpos(arg) {
      switch(arg) {
        case 'left':
          this.nextX = 0;
          break;
        case 'right':
          this.nextX = width - this.width;
          console.log("xpos", this.id, "right", width, this.width);
          break;
        case 'center':
          this.nextX = (width - this.width) / 2;
          break;
        default:
          throw new Error("Unknown x position: " + arg);
      }
    },

    /**
     * Set the y position
     *
     * @param {string} arg One of "top", "bottom", "center".
     */
    set ypos(arg) {
      switch(arg) {
        case 'top':
          this.nextY = 0;
          break;
        case 'bottom':
          this.nextY = height - this.height;
          break;
        case 'center':
          this.nextY = (height - this.height) / 2;
          break;
        default:
          throw new Error("Unknown y position: " + arg);
      }
    }

  };

  var sprites = {
    padNorth: new Sprite("pad_north"),
    padSouth: new Sprite("pad_south"),
    padEast: new Sprite("pad_east"),
    padWest: new Sprite("pad_west"),
    ball: new Sprite("ball"),
    readFromDOM: function() {
      for (var key of Object.keys(this)) {
        var sprite = this[key];
        if (sprite instanceof Sprite) {
          sprite.readFromDOM();
        }
      }
    },
    writeToDOM: function() {
      for (var key of Object.keys(this)) {
        var sprite = this[key];
        if (sprite instanceof Sprite) {
          sprite.writeToDOM();
        }
      }
    },
  };

  // Set initial positions
  sprites.readFromDOM();
  sprites.padNorth.xpos = "center";
  sprites.padNorth.ypos = "top";
  sprites.padSouth.xpos = "center";
  sprites.padSouth.ypos = "bottom";
  sprites.padWest.xpos = "left";
  sprites.padWest.ypos = "center";
  sprites.padEast.xpos = "right";
  sprites.padEast.ypos = "center";
  sprites.ball.xpos = "center";
  sprites.ball.ypos = "center";
  sprites.writeToDOM();

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
    // -------- Read from DOM -------------

    sprites.readFromDOM();
    width = window.innerWidth;
    height = window.innerHeight;

    // --------- Done reading from DOM ----


    // FIXME: Handle pause

    // FIXME: Handle bounce

    sprites.padNorth.nextX = sprites.padNorth.event.pageX;
    sprites.padSouth.nextX = sprites.padSouth.event.pageX;
    sprites.padEast.nextY = sprites.padEast.event.pageY;
    sprites.padWest.nextY = sprites.padWest.event.pageY;

    // FIXME: Handle ball movement

    // FIXME: Handle health, win/lose

    // -------- Wrote to DOM -------------

    sprites.writeToDOM();

    // -------- Write to DOM -------------

  };

  nextFrame();

  // Main loop
  requestAnimationFrame(function loop() {
    nextFrame();
    requestAnimationFrame(loop);
  });
})();
