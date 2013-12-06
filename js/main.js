(function bouncer() {
  "use strict";

  var Game;
  if (typeof window.Game == "undefined") {
    Game = window.Game = { };
  } else {
    Game = window.Game;
  }

  var $ = document.getElementById.bind(document);
  var width = window.innerWidth;
  var height = window.innerHeight;

  var timeStamps = {
    gameStart: Date.now(),
    previousFrame: Date.now() - 15,
    currentFrame: Date.now(),
  };

  /**
   * A sprite, i.e. a moving object displayed on screen.
   *
   * @constructor
   */
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

    get W() {
      return this.x;
    },
    get E() {
      return this.x + this.width;
    },
    get N() {
      return this.y;
    },
    get S() {
      return this.y + this.height;
    },
    get centerX() {
      return this.x + this.width / 2;
    },
    get centerY() {
      return this.y + this.height / 2;
    },

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
    },

    /**
     * Determine whether an incoming `sprite` can collide/bounce on
     * `this` sprite.
     *
     * @param {string} comingFrom The direction from which `sprite` is
     * coming. Must be one of "W", "E", "N", "S". In the general case,
     * `sprite` is not coming from such a restrictive direction, but
     * rather from e.g. the NW quadrant. In this case, the method should
     * be called once with argument "N" and once with argument "W".
     * @param {Sprite} sprite The incoming sprite.
     *
     * @return {boolean} true If there is a collision between `this`
     * sprite and `sprite`.
     */
    isCollidingWith: function(comingFrom, sprite) {
      var centerX = sprite.centerX;
      var centerY = sprite.centerY;
      var between = Game.Utils.between; // Import utility function
      var result;
      switch (comingFrom) {
        case "W":
            result = between(sprite.E, this.W, this.E)
              && between(sprite.centerY, this.N, this.S);
            break;
        case "E":
            result = between(sprite.W, this.W, this.E)
              && between(sprite.centerY, this.N, this.S);
          break;
        case "N":
            result = between(sprite.S, this.N, this.S)
              && between(sprite.centerX, this.W, this.E);
            break;
        case "S":
            result = between(sprite.N, this.N, this.S)
              && between(sprite.centerX, this.W, this.E);
          break;
        default:
          throw new Error("Unknown direction: " + comingFrom);
      }
      return result;
    }
  };

  /**
   * An object regrouping all the sprites.
   */
  var sprites = {
    padNorth: new Sprite("pad_north"),
    padSouth: new Sprite("pad_south"),
    padEast: new Sprite("pad_east"),
    padWest: new Sprite("pad_west"),
    ball: new Sprite("ball"),

    /**
     * Call readFromDOM on all the sprites
     */
    readFromDOM: function() {
      for (var key of Object.keys(this)) {
        var sprite = this[key];
        if (sprite instanceof Sprite) {
          sprite.readFromDOM();
        }
      }
    },

    /**
     * Call writeToDOM on all the sprites
     */
    writeToDOM: function() {
      for (var key of Object.keys(this)) {
        var sprite = this[key];
        if (sprite instanceof Sprite) {
          sprite.writeToDOM();
        }
      }
    },
  };

  // Shortcut: an array with all the pads
  var pads = Object.freeze([sprites.padNorth,
    sprites.padSouth,
    sprites.padEast,
    sprites.padWest]);

  /**
   * Determine whether the ball is colliding with any pad.
   *
   * @param {string} comingFrom The direction from which the
   * ball is coming, one of "N", "S", "E", "W".
   * @param {Sprite} exclude A pad to exclude from the search as we
   * already know no collision can take place with that pad.
   *
   * @return {boolean} true If any collision.
   */
  function isCollidingWithAnyPad(comingFrom, exclude) {
      var ball = sprites.ball;
      for (var pad of pads) {
        if (pad == exclude) {
          continue;
        }
        if (pad.isCollidingWith(comingFrom, ball)) {
          return true;
        }
      }
      return false;
    }

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
  sprites.ball.event.angle = 2 * Math.random() * Math.PI;
  sprites.ball.event.dx = Math.round(Math.cos(sprites.ball.event.angle) * 100);
  sprites.ball.event.dy = Math.round(Math.sin(sprites.ball.event.angle) * 100);
  sprites.ball.event.speed = window.Game.Config.initialBallSpeed;
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

    // All reads from DOM *must* happen before the writes to DOM.
    // Otherwise, we end up recomputing the layout several times
    // for a frame, which is very much not good.

    sprites.readFromDOM();
    width = window.innerWidth;
    height = window.innerHeight;

    // --------- Done reading from DOM ----


    var deltaT = timeStamps.currentFrame - timeStamps.previousFrame;

    // FIXME: Handle pause

    // Bounce on walls

    var horizontalBounce = false;
    var verticalBounce = false;

    if (sprites.ball.event.dx < 0) {
      horizontalBounce = sprites.ball.x <= 0 || isCollidingWithAnyPad("E", sprites.padEast);
    } else if (sprites.ball.event.dx > 0) {
      horizontalBounce = sprites.ball.E >= width || isCollidingWithAnyPad("W", sprites.padWest);
    }

    if (sprites.ball.event.dy < 0) {
      verticalBounce = sprites.ball.y <= 0 || isCollidingWithAnyPad("S", sprites.padSouth);
    } else if (sprites.ball.event.dy > 0) {
      verticalBounce = sprites.ball.S >= height|| isCollidingWithAnyPad("N", sprites.padNorth);
    }

    if (horizontalBounce) {
      sprites.ball.event.dx = -sprites.ball.event.dx;
    }
    if (verticalBounce) {
      sprites.ball.event.dy = -sprites.ball.event.dy;
    }

    // FIXME: Bounce on sprites

    // Update position of sprites
    // Note that we set both x and y, even for sprites that can move only
    // laterally/vertically, to ensure that we keep the game flowing even
    // in case of screen resize or orientation change.
    sprites.padNorth.nextX = sprites.padNorth.event.pageX;
    sprites.padNorth.ypos = "top";

    sprites.padSouth.nextX = sprites.padSouth.event.pageX;
    sprites.padSouth.ypos = "bottom";

    sprites.padEast.nextY = sprites.padEast.event.pageY;
    sprites.padEast.xpos = "right";

    sprites.padWest.nextY = sprites.padWest.event.pageY;
    sprites.padWest.xpos = "left";


    sprites.ball.nextX = sprites.ball.x + Math.round(sprites.ball.event.dx * sprites.ball.event.speed * deltaT);
    sprites.ball.nextY = sprites.ball.y + Math.round(sprites.ball.event.dy * sprites.ball.event.speed * deltaT);

    // FIXME: Handle health, win/lose

    // FIXME: Handle game speed

    // FIXME: Handle score

    // -------- Wrote to DOM -------------

    sprites.writeToDOM();

    // -------- Write to DOM -------------

  };

  nextFrame();

  // Main loop
  requestAnimationFrame(function loop() {
    timeStamps.previousFrame = timeStamps.currentFrame;
    timeStamps.currentFrame = Date.now();
    nextFrame();
    requestAnimationFrame(loop);
  });
})();
