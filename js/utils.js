/**
 * Utility functions.
 *
 * All these utility functions appear as methods of object
 * `window.Game.Utils`.
 */

(function() {
  "use strict";

  // Depending on loading order, `window.Game` may not exist
  // yet. If it doesn't, create it.
  if (typeof window.Game === "undefined") {
    window.Game = { };
  }

  window.Game.Utils = {
    /**
     * Comparison function
     *
     * @param {number} x
     * @param {number} a
     * @param {number} b
     *
     * @return {boolean} true if `a <= x && x <= b`;
     * @throws {Error} If `a > b`
     */
    between: function(x, a, b) {
      if (a > b) {
        console.error("Incorrect parameters for between", x, a, b, "at", new Error().stack);
        throw new Error("Incorrect parameters for between");
      }
      return a <= x && x <= b;
    },

    /**
     * Restrict the position of point x to the segment define by [a , b]
     *
     * @param {number} x
     * @param {number} a
     * @param {number} b
     *
     * @return {x} if `a <= x <= b`;
     * @return {a} if `x < a`;
     * @return {b} if `x > b`;
     * @throws {Error} If `b > a`
     */
    restrictToSegment: function(x, a, b) {
      if (b < a) {
        console.error("Incorrect parameters for restrictToSegment", x, a, b, "at", new Error().stack);
        throw new Error("Incorrect parameters for restrictToSegment");
      } else if (x < a) {
        return a;
      } else if (x > b) {
        return b;
      } else {
        return x;
      }
    },

    /**
     * An indication of the position of a number in a segment.
     *
     * @param {number} x A number between a and b
     * @param {number} a
     * @param {number} b
     *
     * @return {number} A number in [-1, 1] representing how
     * close `x` is to either `a` or `b`: -1 if x == a,
     * +1 if x == b, 0 if x == (a + b) / 2, etc.
     */
    howCloseTo: function(x, a, b) {
      if (a >= b) {
        throw new Error("Incorrect parameters for closeTo");
      }
      return 2 * (x - (a + b) / 2) / (b - a);
    },

    /**
     * Get the angle corresponding to a vector
     *
     * @param {number} dx A unit vector.
     * @param {number} dy
     *
     * @return {number} An angle r in radians such that `Math.cos(r) == dx`
     * and `Math.sin(r) == dy`.
     */
    getAngle: function(dx, dy) {
      var angle;
      if (dx == 0) {
        angle = Math.PI / 2;
        if (dy < 0) {
          return -angle;
        }
        return angle;
      }
      angle = Math.atan(dy / dx);
      if (dx < 0) {
        return angle + Math.PI;
      }
      return angle;
    },

  };
})();
