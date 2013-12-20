(function() {
  "use strict";

  var Game = window.Game;
  var Screen = Game.Screen;

  /**
   * A sprite, i.e. a moving object displayed on screen.
   *
   * @param {string} id The id of the DOM element manipulated by
   * this Sprite.
   * @constructor
   */
  function Sprite(id) {
    // The id of the DOM element
    this.id = id;

    // The DOM element and its CSS stylesheet
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
    this.event = {
      // The coordinates of the mouse
      pageX: 0,
      pageY: 0
    };

    this.kind = "";
    this.nextKind = this.kind;

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
      this.style.transform = "translate(" + this.nextX + "px, " + this.nextY + "px)";
      if (this.nextKind != this.kind) {
        if (this.kind) {
          this.element.classList.remove(this.kind);
        }
        if (this.nextKind) {
          this.element.classList.add(this.nextKind);
        }
        this.kind = this.nextKind;
      }
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
          this.nextX = Screen.width - this.width;
          break;
        case 'center':
          this.nextX = (Screen.width - this.width) / 2;
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
          this.nextY = Screen.height - this.height;
          break;
        case 'center':
          this.nextY = (Screen.height - this.height) / 2;
          break;
        default:
          throw new Error("Unknown y position: " + arg);
      }
    },


    /**
     * Set both the x position and the y position
     *
     * @param {string} xpos See the documentation of xpos
     * @param {string} ypos See the documentation of ypos
     */
    setPosition: function(xpos, ypos) {
      this.xpos = xpos;
      this.ypos = ypos;
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
     * @return {number} If there is a collision between `this` sprite
     * and `sprite`, return a number between -0.5 and 0.5 determining
     * where on `this` the collision took place. The return value is
     * close to -0.5 if the collision took place close to the lowest
     * coordinate of `this` (W or N, depending on `comingFrom`) and
     * close to 0.5 if the collision took place close to the highest
     * coordinate of `this` (E or S, depending on `comingFrom`).
     * If there was no collision, return NaN.
     */
    getCollisionWith: function(comingFrom, sprite) {
      var centerX = sprite.centerX;
      var centerY = sprite.centerY;
      var between = Game.Utils.between;
      var getAngle = Game.Utils.getAngle;

      var collision;
      switch (comingFrom) {
        case "W":
            collision = between(sprite.E, this.W, this.E)
              && between(centerY, this.N, this.S);
            break;
        case "E":
            collision = between(sprite.W, this.W, this.E)
              && between(centerY, this.N, this.S);
            break;
        case "N":
            collision = between(sprite.S, this.N, this.S)
              && between(centerX, this.W, this.E);
            break;
        case "S":
            collision = between(sprite.N, this.N, this.S)
              && between(centerX, this.W, this.E);
            break;
        default:
          throw new Error("Unknown direction: " + comingFrom);
      }
      if (!collision) {
        return NaN;
      }
      return getAngle(this.centerX - centerX, this.centerY - centerY);
    },

    getDistanceBetweenCenters: function(sprite) {
      return Game.Utils.getDistance(this.centerX - sprite.centerX,
                                    this.centerY - sprite.centerY);
    }
  };

  Sprite.all = [];
  Game.Sprite = Sprite;

})();
