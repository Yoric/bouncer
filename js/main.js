(function bouncer() {
  "use strict";

  var Game = window.Game;

  var $ = document.getElementById.bind(document);
  var screen = $("screen");
  var eltMessage = $("message");
  var width = window.innerWidth;
  var height = window.innerHeight;
  var eltScore = $("score");
  var eltMultiplier = $("multiplier");
  var eltHealth = $("health");

  /**
   * The time at which some events happened, in milliseconds since the epoch.
   */
  var timeStamps = {
    /**
     * The start of the game
     */
    gameStart: Date.now(),

    /**
     * Instant at which the previous frame started being prepared
     */
    previousFrame: Date.now() - 15,

    /**
     * Instant at which the current frame started being prepared
     */
    currentFrame: Date.now(),

    /**
     * Instant at which we launched the latest ball
     */
    latestBallLaunch: 0,

    /**
     * Instant at the lastest score multiplier update
     */
    lastestMultiplierUpdate: Date.now(),
 };

  /**
   * The different scores and the multiplier of the current game
   */
  var score = {
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
  
  /**
   * The different values for health in current game
   */
  var health = {
    /**
     * The health of the older frame
     */
    previous: 0,

    /**
     * The health in the current frame
     */
    current: Game.Config.Health.defaultStarting,
  };

  var Sprite = Game.Sprite;
  var Ball = Game.Ball;


  // Shortcut: an array with all the pads
  var pads = [];

  // Initialize sprites
  var padNorth = new Sprite("pad_north");
  var padSouth = new Sprite("pad_south");
  var padEast = new Sprite("pad_east");
  var padWest = new Sprite("pad_west");

  padNorth.setPosition("center", "top");
  padSouth.setPosition("center", "bottom");
  padEast.setPosition("left", "center");
  padWest.setPosition("right", "center");
  for (var pad of [padNorth, padSouth, padEast, padWest]) {
    pads.push(pad);
    Sprite.all.add(pad);
  }

  Sprite.all.forEach(function (sprite) {
    sprite.writeToDOM();
  });


  // Handle events

  function onmove(e) {
    for (var pad of pads) {
      pad.event.pageX = e.pageX;
      pad.event.pageY = e.pageY;
    }
    e.stopPropagation();
    e.preventDefault();
  }
  function ontouch(e) {
    onmove(e);
    Pause.resume();
  }
  window.addEventListener("mousemove", onmove);
  window.addEventListener("mouseup", ontouch);
  window.addEventListener("touchstart", ontouch);
  window.addEventListener("touchmove", ontouch);

  /**
   * An object centralizing pause information.
   */
  var Pause = Game.Pause = {
    /**
     * true if the game is on pause, false otherwise
     */
    isPaused: false,

    /**
     * Put the game on pause.
     *
     * Has no effect if the game is already on pause.
     */
    start: function() {
      Pause.isPaused = true;
      eltMessage.classList.add("visible");
      eltMessage.textContent = "Pause";
    },

    /**
     * Resume the game.
     *
     * Has no effect if the game is not on pause.
     */
    resume: function() {
      if (!Pause.isPaused) {
        return;
      }
      Pause.isPaused = false;
      eltMessage.classList.remove("visible");

      // Make sure that the game doesn't freak out by launching balls,
      // increasing speed, etc.
      var now = Date.now();
      timeStamps.previousFrame = now - 15;
      timeStamps.currentFrame = now;
      timeStamps.latestBallLaunch = now;

      // Resume game
      requestAnimationFrame(loop);
    },

    /**
     * Switch between on pause/out of pause.
     */
    revert: function() {
      if (Pause.isPaused) {
        Pause.resume();
      } else {
        Pause.start();
      }
    }
  };
  window.addEventListener("keydown", function(event) {
    var code = event.keyCode || event.which || null;
    if (code == null) {
      // No code information, this must be an old version of
      // Internet Explorer
      return;
    }
    if (code != window.KeyEvent.DOM_VK_SPACE) {
      // Not the space key
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    Pause.revert();
  });
  window.addEventListener("blur", function() {
    Pause.start();
  });


  var nextFrame = function() {

    // -------- Read from DOM -------------

    // All reads from DOM *must* happen before the writes to DOM.
    // Otherwise, we end up recomputing the layout several times
    // for a frame, which is very much not good.

    Sprite.all.forEach(function (sprite) {
      sprite.readFromDOM();
    });

    Ball.flushPending(pads);

    Sprite.width = width = window.innerWidth;
    Sprite.height = height = window.innerHeight;

    // --------- Done reading from DOM ----


    var deltaT = timeStamps.currentFrame - timeStamps.previousFrame;

    // Return pause
    if (Pause.isPaused) {
      return false;
    }

    // Handle ball bouncing
    for (var ball of Ball.balls) {

      if (ball.event.dx < 0) {
        ball.bounceX.check(ball.x <= 0, "E", padEast);
      } else if (ball.event.dx > 0) {
        ball.bounceX.check(ball.E >= width, "W", padWest);
      }

      if (ball.event.dy < 0) {
        ball.bounceY.check(ball.y <= 0, "S", padSouth);
      } else if (ball.event.dy > 0) {
        ball.bounceY.check(ball.S >= height, "N", padNorth);
      }

      var collisionWithWall = ball.bounceX.bounceOnWall ||
        ball.bounceY.bounceOnWall;

      var collisionWithPad = !collisionWithWall &&
        ball.bounceX.bounceOnPad ||
        ball.bounceY.bounceOnPad;

      ball.updateVector();

      // Update the current score and current health
      if (collisionWithPad) {
        if (timeStamps.currentFrame - timeStamps.lastestMultiplierUpdate >= 10000) {
          score.multiplier += 0.5;
          timeStamps.lastestMultiplierUpdate = timeStamps.currentFrame;
        }
        score.current += Game.Config.Score.bounceOnPad * score.multiplier;
        health.current += Game.Config.Health.regenerate;
      } else if (collisionWithWall) {
        score.current += Game.Config.Score.bounceOnWall;
        health.current += Game.Config.Health.hurt;
      }
    }

    // Update position of sprites
    // Note that we set both x and y, even for sprites that can move only
    // laterally/vertically, to ensure that we keep the game flowing even
    // in case of screen resize or orientation change.
    padNorth.nextX = padNorth.event.pageX - padNorth.width / 2;
    padNorth.nextX = Game.Utils.restrictToSegment(padNorth.nextX, 0, width - padNorth.width);
    padNorth.ypos = "top";

    padSouth.nextX = padSouth.event.pageX - padSouth.width / 2;
    padSouth.nextX = Game.Utils.restrictToSegment(padSouth.nextX, 0, width - padSouth.width);
    padSouth.ypos = "bottom";

    padEast.nextY = padEast.event.pageY - padEast.height / 2;
    padEast.nextY = Game.Utils.restrictToSegment(padEast.nextY, 0, height - padEast.height);
    padEast.xpos = "right";

    padWest.nextY = padWest.event.pageY - padWest.height / 2;
    padWest.nextY = Game.Utils.restrictToSegment(padWest.nextY, 0, height - padWest.height);
    padWest.xpos = "left";
    
    for (ball of Ball.balls) {
      ball.nextX = ball.x + Math.round(ball.event.dx * ball.event.speed * deltaT);
      ball.nextY = ball.y + Math.round(ball.event.dy * ball.event.speed * deltaT);
    }

    // FIXME: Handle health, win/lose

    // FIXME: Handle game speed

    // FIXME: Handle score

    // -------- Write to DOM -------------

    // Prepare new balls
    if (timeStamps.currentFrame - timeStamps.latestBallLaunch >=
      Game.Config.intervalBetweenBalls) {
      Ball.prepare(screen);
      timeStamps.latestBallLaunch = timeStamps.currentFrame;
    }

    // Update ball colors
    for (ball of Ball.balls) {
      if (ball.bounceX.bounceOnPad || ball.bounceY.bounceOnPad) {
        ball.changeBallColor();
      }
    }
    Sprite.all.forEach(function (sprite) {
      sprite.writeToDOM();
    });
    screen.style.width = width;
    screen.style.height = height;

    // Update the score if it has changed
    if (score.current != score.previous) {
      eltScore.textContent = score.current + " pts";
      score.previous = score.current;
    }
    
    // Update the score multiplier if it has changed
    if (timeStamps.lastestMultiplierUpdate == timeStamps.currentFrame && score.multiplier > 1) {
      eltMultiplier.textContent = "x " + score.multiplier;
    }
    
    // Update the health if it has changed
    if (health.current != health.previous) {
      eltHealth.textContent = health.current + " ❤";
      health.previous = health.current;
    }

    // -------- Write to DOM -------------

    return true;
  };

  nextFrame();

  // Main loop
  function loop() {
    timeStamps.previousFrame = timeStamps.currentFrame;
    timeStamps.currentFrame = Date.now();
    
    if (health.current <= 0) {
      eltHealth.textContent = 0 + " ❤";
      
      if (score.current > 0) {
        eltMessage.textContent = 'Congratulations, you have ' + score.current + " points !";
        eltMessage.classList.add("visible");
      } else {
        eltMessage.textContent = 'You lose :-(';
        eltMessage.classList.add("visible");
      }
    } else {
      nextFrame();
      requestAnimationFrame(loop);
    }
  };
  requestAnimationFrame(loop);
})();


