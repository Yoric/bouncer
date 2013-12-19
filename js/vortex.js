/**
 * Everything dealing with the vortex.
 */
(function() {
  "use strict";

  var Game = window.Game;

  function Vortex(id) {
    Game.Sprite.call(this, id);
  }
  Vortex.prototype = Object.create(Game.Sprite.prototype);

  // Override writeToDOM because the animation already
  // uses `transform`.
  Vortex.prototype.writeToDOM = function() {
    this.style.left = this.nextX + "px";
    this.style.top = this.nextY + "px";
  };
  Game.Vortex = Vortex;
})();
