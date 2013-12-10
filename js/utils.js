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
      if (b > a) {
        console.error("Incorrect parameters for restrictToSegment", x, a, b, "at", new Error().stack);
        throw new Error("Incorrect parameters for restrictToSegment");
      } else if (x < a) {
        return a;
      } else if(x > b) {
        return b;
      } else {
        return x;
      }
    }
  };
})();
