/**
 * Configuration of the game
 *
 * All these configuration options appear as fields of object
 * `window.Game.Config`.
 */

(function() {
  "use strict";

  // Depending on loading order, `window.Game` may not exist
  // yet. If it doesn't, create it.
  if (typeof window.Game === "undefined") {
    window.Game = { };
  }

  window.Game.Config = {
    // The starting speed of balls
    initialBallSpeed: .01,

    // The interval between balls, in milliseconds
    intervalBetweenBalls: 3000,
  };
})();
