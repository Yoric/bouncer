(function bouncer() {
  "use strict";

  var Game;
  if (typeof window.Game == "undefined") {
    Game = window.Game = { };
  } else {
    Game = window.Game;
  }

  var $ = document.getElementById.bind(document);
  var screen = $("screen");
  var eltMessage = $("message");
  var width = window.innerWidth;
  var height = window.innerHeight;
  var eltScore = $("score");

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
    latestBallLaunch: 0
  };

  /**
  * The different scores of the current game
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
  };

   /**
   * A sprite, i.e. a moving object displayed on screen.
   *
   * @param {string} id The id of the DOM element manipulated by
   * this Sprite.
   * @constructor
   */
  function Sprite(id) {
    // The id of the DOM element
    this.id = id;

    // The DOM element and its CSS stylesheet
    this.element = document.getElementById(id);
    this.style = this.element.style;

    // The position of the sprite, in pixels.
    this.x = null;
    this.y = null;

    // The current destination of the sprite, in pixels.
    this.nextX = null;
    this.nextY = null;

    // The current width/height of the sprite, in pixels.
    this.width = null;
    this.height = null;

    // An object used to store event information for this sprite
    this.event = {
      // The coordinates of the mouse
      pageX: 0,
      pageY: 0
    };

    this.readFromDOM();
  }
  Sprite.prototype = {
    /**
     * Perform all reads from DOM
     */
    readFromDOM: function() {
      var rect = this.element.getBoundingClientRect();
      this.x = Math.round(rect.left);
      this.y = Math.round(rect.top);
      this.width = Math.round(rect.width);
      this.height = Math.round(rect.height);
    },

    /**
     * Write to the DOM the values of this.nextX, this.nextY
     */
    writeToDOM: function() {
      this.style.transform = "translate(" + this.nextX + "px, " + this.nextY + "px)";
    },

    // Utility methods

    get W() {
      return this.x;
    },
    get E() {
      return this.x + this.width;
    },
    get N() {
      return this.y;
    },
    get S() {
      return this.y + this.height;
    },
    get centerX() {
      return this.x + this.width / 2;
    },
    get centerY() {
      return this.y + this.height / 2;
    },

    /**
     * Set the x position
     *
     * @param {string} arg One of "left", "right", "center".
     */
    set xpos(arg) {
      switch(arg) {
        case 'left':
          this.nextX = 0;
          break;
        case 'right':
          this.nextX = width - this.width;
          break;
        case 'center':
          this.nextX = (width - this.width) / 2;
          break;
        default:
          throw new Error("Unknown x position: " + arg);
      }
    },

    /**
     * Set the y position
     *
     * @param {string} arg One of "top", "bottom", "center".
     */
    set ypos(arg) {
      switch(arg) {
        case 'top':
          this.nextY = 0;
          break;
        case 'bottom':
          this.nextY = height - this.height;
          break;
        case 'center':
          this.nextY = (height - this.height) / 2;
          break;
        default:
          throw new Error("Unknown y position: " + arg);
      }
    },


    /**
     * Set both the x position and the y position
     *
     * @param {string} xpos See the documentation of xpos
     * @param {string} ypos See the documentation of ypos
     */
    setPosition: function(xpos, ypos) {
      this.xpos = xpos;
      this.ypos = ypos;
    },

    /**
     * Determine whether an incoming `sprite` can collide/bounce on
     * `this` sprite.
     *
     * @param {string} comingFrom The direction from which `sprite` is
     * coming. Must be one of "W", "E", "N", "S". In the general case,
     * `sprite` is not coming from such a restrictive direction, but
     * rather from e.g. the NW quadrant. In this case, the method should
     * be called once with argument "N" and once with argument "W".
     * @param {Sprite} sprite The incoming sprite.
     *
     * @return {number} If there is a collision between `this` sprite
     * and `sprite`, return a number between -0.5 and 0.5 determining
     * where on `this` the collision took place. The return value is
     * close to -0.5 if the collision took place close to the lowest
     * coordinate of `this` (W or N, depending on `comingFrom`) and
     * close to 0.5 if the collision took place close to the highest
     * coordinate of `this` (E or S, depending on `comingFrom`).
     * If there was no collision, return NaN.
     */
    getCollisionWith: function(comingFrom, sprite) {
      var centerX = sprite.centerX;
      var centerY = sprite.centerY;
      var between = Game.Utils.between; // Import utility functions
      var closeTo = Game.Utils.howCloseTo;

      switch (comingFrom) {
        case "W":
            if (between(sprite.E, this.W, this.E)
              && between(sprite.centerY, this.N, this.S)) {
              return closeTo(sprite.E, this.W, this.E);
            }
            return NaN;
        case "E":
            if (between(sprite.W, this.W, this.E)
              && between(sprite.centerY, this.N, this.S)) {
              return closeTo(sprite.W, this.W, this.E);
            }
            return NaN;
        case "N":
            if (between(sprite.S, this.N, this.S)
              && between(sprite.centerX, this.W, this.E)) {
              return closeTo(sprite.S, this.N, this.S);
            }
            return NaN;
        case "S":
            if (between(sprite.N, this.N, this.S)
              && between(sprite.centerX, this.W, this.E)) {
              return closeTo(sprite.N, this.N, this.S);
            }
            return NaN;
        default:
          throw new Error("Unknown direction: " + comingFrom);
      }
      return NaN;
    }
  };

  /**
   * A sprite representing a ball.
   *
   * @param {string} id The id of the DOM element manipulated by
   * this Sprite.
   * @constructor inherits from Sprite
   */
  function Ball(id) {
    // Inherit constructor
    Sprite.call(this, id);

    // We start our balls with some temporary CSS.
    // Set to false once the temporary CSS has been cleaned up
    this._classInitialized = false;

    // The unit vector of speed for this ball
    this.event.dx = 0;
    this.event.dy = 0;

    // Information on bouncing
    this.bounceX = new Bouncer(this, pads);
    this.bounceY = new Bouncer(this, pads);
  }
  // Inherit prototype
  Ball.prototype = Object.create(Sprite.prototype);

  /**
   * An object holding information regarding bouncing along vertical
   * obstacles (respectively horizontal obstacles).
   */
  function Bouncer(ball, pads) {
    this.ball = ball;
    this.pads = pads;
    this.bounceOnWall = false;
    this.bounceOnPad = false;
    /**
     * An indication of how we need to bounce this ball against a
     * vertical (respectively horizontal) obstacle, as a number
     * between -1 (bounce somewhat towards the North, respectively
     * West) and 1 (bounce somewhat towards the South, respectively
     * East) or NaN if the ball didn't bounce at all on a vertical
     * (respectively vertical) obstacle.
     *
     * Used to represent bouncing on non-flat surfaces.
     */
    this.bounce = NaN;
  }

  /**
   * Determine whether the ball is colliding with any wall or pad,
   * update internal state accordingly.
   *
   * @param {bool} wall Whether the ball is colliding with a wall
   * already.
   * @param {string} comingFrom The direction from which the
   * ball is coming, one of "N", "S", "E", "W".
   * @param {Sprite} exclude A pad to exclude from the search as we
   * already know no collision can take place with that pad.
   */
  Bouncer.prototype.check = function(wall, comingFrom, exclude) {
    if (wall) {
      this.bounceOnWall = true;
      this.bounceOnPad = false;
      this.bounce = 0;
      return;
    }
    for (var pad of this.pads) {
      if (pad == exclude) {
        continue;
      }
      var bounce = pad.getCollisionWith(comingFrom, this.ball);
      if (!Number.isNaN(bounce)) {
        this.bounceOnWall = false;
        this.bounceOnPad = true;
        this.bounce = bounce;
        return;
      }
    }
    this.bounceOnWall = false;
    this.bounceOnPad = false;
    this.bounce = NaN;
  };

  /**
   * A list of CSS values for colors for the ball.
   */
  var COLOR_NAMES = ['blue' , 'red' , 'green' , 'purple' , 'black' , 'orange'];
  /**
   * Change the color of the ball. This function is called when a ball touch a pad.
   * The color is taken randomly from tabColors.
   */
  Ball.prototype.changeBallColor = function() {
    var i = (Math.floor(Math.random() * COLOR_NAMES.length) + 1);
    this.style.borderColor = COLOR_NAMES[i];
  };

  /**
   * All the balls currently on screen.
   */
  Ball.balls = [];

  // The number of balls already launched.
  // Used to generate id of new balls.
  Ball._counter = 0;

  // The number of balls prepared but not launched yet.
  // These balls will be launched on the next call to Ball.flushPending
  Ball._pendingBalls = [];

  /**
   * If necessary, remove any temporary CSS, then write to DOM.
   */
  Ball.prototype.writeToDOM = function() {
    // Clear any temporary CSS
    if (!this._classInitialized) {
      this.element.classList.remove("init");
      this._classInitialized = true;
    }
    Sprite.prototype.writeToDOM.call(this);
  };

  /**
   * Update the current speed unit vector of the ball.
   */
  Ball.prototype.updateVector = function() {
    var bounceX = this.bounceX.bounce;
    var bounceY = this.bounceY.bounce;
    if (Number.isNaN(bounceX) && Number.isNaN(bounceY)) {
      // No bounce at all, don't change the vector.
      return;
    }
    var dx2, dy2, dangle;
    if (Number.isNaN(bounceX)) {
      // No horizontal bounce
      dx2 = this.event.dx;
      dy2 = - this.event.dy;
      dangle = bounceY;
    } else if (Number.isNaN(bounceY)) {
      // No vertical bounce
      dx2 = - this.event.dx;
      dy2 = this.event.dy;
      dangle = bounceX;
    } else {
      dx2 = - this.event.dx;
      dy2 = - this.event.dy;
      dangle = bounceX + bounceY;
    }

    this.event.dxOld = this.event.dx;
    this.event.dyOld = this.event.dy;

    // FIXME: use dangle
    var simpleAngle = Game.Utils.getAngle(dx2, dy2);
    this.event.angle = simpleAngle;
    this.event.dx = Math.cos(this.event.angle);
    this.event.dy = Math.sin(this.event.angle);

    Game.Debug.drawBounce(this,
      simpleAngle);
  };

  /**
   * Prepare a new ball for launch.
   */
  Ball.prepare = function() {
    if (Ball.balls.length >= Game.Config.maxNumberBalls) {
      return;
    }
    var id = "ball_" + Ball._counter++;
    var element = document.createElement("div");
    element.id = id;
    element.classList.add("ball");
    element.classList.add("init");
    element.textContent = "B" + Ball._counter;
    $("screen").appendChild(element);
    this._pendingBalls.push(id);
  };

  /**
   * Launch any prepared ball.
   */
  Ball.flushPending = function() {
    if (!this._pendingBalls.length) {
      return;
    }
    var id = this._pendingBalls.pop();
    var ball = new Ball(id);

    // Set up initial position
    ball.xpos = "center";
    ball.ypos = "center";

    // Set up initial vector
    var angle;
    if (Game.Config.Debug.startAngle == null) {
      angle = 2 * Math.random() * Math.PI;
    } else {
      angle = Game.Config.Debug.startAngle;
    }
    ball.event.angle = angle;
    ball.event.dx = Math.cos(ball.event.angle);
    ball.event.dy = Math.sin(ball.event.angle);
    ball.event.speed = Game.Config.initialBallSpeed;
    // Hack: Initially, we actually display the ball on the top left
    // but we want everything to happen as if it were centered.
    ball.x = ball.nextX;
    ball.y = ball.nextY;

    Ball.balls.push(ball);
    sprites.add(ball);
  };

  /**
   * The set of all sprites
   */
  var sprites = new Set();

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
    sprites.add(pad);
  }

  sprites.forEach(function (sprite) {
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

    sprites.forEach(function (sprite) {
      sprite.readFromDOM();
    });

    Ball.flushPending();

    width = window.innerWidth;
    height = window.innerHeight;

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

      // Update the current score
      if (collisionWithPad) {
        score.current += Game.Config.Score.bounceOnPad;
      } else if (collisionWithWall) {
        score.current += Game.Config.Score.bounceOnWall;
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
    padEast.nextY = Game.Utils.restrictToSegment(padEast.nextY, 0, width - padEast.height);
    padEast.xpos = "right";

    padWest.nextY = padWest.event.pageY - padWest.height / 2;
    padWest.nextY = Game.Utils.restrictToSegment(padWest.nextY, 0, width - padWest.height);
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
      Ball.prepare();
      timeStamps.latestBallLaunch = timeStamps.currentFrame;
    }

    // Update ball colors
    for (ball of Ball.balls) {
      if (ball.bounceX.bounceOnPad || ball.bounceY.bounceOnPad) {
        ball.changeBallColor();
      }
    }
    sprites.forEach(function (sprite) {
      sprite.writeToDOM();
    });
    screen.style.width = width;
    screen.style.height = height;

    // Update the score if it has changed
    if (score.current != score.previous) {
      eltScore.textContent = score.current;
      score.previous = score.current;
    }

    // -------- Write to DOM -------------

    return true;
  };

  nextFrame();

  // Main loop
  function loop() {
    timeStamps.previousFrame = timeStamps.currentFrame;
    timeStamps.currentFrame = Date.now();
    if (nextFrame()) {
      requestAnimationFrame(loop);
    }
  };
  requestAnimationFrame(loop);
})();


