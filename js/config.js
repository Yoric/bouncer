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
    initialBallSpeed: .3,

    // The interval between balls, in milliseconds
    intervalBetweenBalls: 3000,

    // The maximum number of balls to create
    maxNumberBalls: 10,

    Score: {
      // add point when a ball touch the pad
      bounceOnPad: 10,

      // substract point when a ball touch the wall
      bounceOnWall: -2,
    },

    Health: {
      // default health
      defaultStarting: 100,

      // decrease health when ball touches a border
      hurt: -10,

      // increase health when ball touches a pad
      regenerate: 1,
    },

    // Activate or deactivate several debug utilities/cheat modes
    Debug: {
      // Generally, |false|. If |true|, draw a graphic representation
      // of bounces.
      bounces: false,

      // Generally, |null|. Otherwise, the angle for *all* new balls.
      startAngle: null,
    },

  };
})();
