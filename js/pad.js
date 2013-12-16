/**
 * Everything dealing with pads.
 */
(function() {
  "use strict";

  var Game = window.Game;

  /**
   * A pad
   *
   * @param {string} id The id of the DOM element manipulated by
   * this Pad.
   * @constructor
   */
  function Pad(id) {
    Game.Sprite.call(this, id);
  }
  Game.Pad = Pad;

  Pad.prototype = Object.create(Game.Sprite.prototype);
})();
