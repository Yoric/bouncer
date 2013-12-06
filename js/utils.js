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
        throw new Error("Incorrect parameters for between");
      }
      return a <= x && x <= b;
    }
  };
})();
