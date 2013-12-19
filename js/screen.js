(function() {
  "use strict";

  var Game = window.Game;

  var Screen = {
    readFromDOM: function() {
      this.previousWidth = this.width;
      this.width = window.innerWidth;

      this.previousHeight = this.height;
      this.height = window.innerHeight;
    },

    hasChanged: function() {
      return this.width != this.previousWidth ||
        this.height != this.previousHeight;
    },

    // The width of the screen
    width: window.innerWidth,
    previousWidth: -1,

    // The height of the screen
    height: window.innerHeight,
    previousHeight: -1
  };
  Game.Screen = Screen;
})();
