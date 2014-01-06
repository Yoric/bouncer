/**
 * Everything dealing with scores.
 */
(function() {
  "use strict";

  var Game = window.Game;
    
  /**
   * The different scores and the multiplier of the current game
   */
  var Score = {
    /**
     * The score of the older frame
     */
    previous: -1,

    /**
     * The score in the current frame
     */
    current: 0,

    /**
     * The score multiplier, increase when the game lasts longer
     */
    multiplier: 1,  
  };
  Game.Score = Score;
})();