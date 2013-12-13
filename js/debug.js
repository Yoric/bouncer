/**
 * Debugging utilities
 */
(function() {
  "use strict";

  // Depending on loading order, `window.Game` may not exist
  // yet. If it doesn't, create it.
  if (typeof window.Game === "undefined") {
    window.Game = { };
  }

  var Game = window.Game;

  var $ = document.getElementById.bind(document);

  Game.Debug = {

    /**
     * Draw a simple line with a given color.
     */
    drawLine: function(x, y, angle, color) {
      x = Math.round(x);
      y = Math.round(y);
      var canvas = this.getCanvas();
      var context = canvas.getContext("2d");
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var LEN = Math.sqrt (canvas.width * canvas.width +
                           canvas.height * canvas.height);
      var x0 = Math.round(x - cos * LEN);
      var y0 = Math.round(y - sin * LEN);
      var x1 = Math.round(x + cos * LEN);
      var y1 = Math.round(y + sin * LEN);
      context.lineWidth = 2;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    },

    /**
     * Get the canvas on which to draw. Create it it doesn't exist
     * yet. Resize it to the size of the window if necessary.
     */
    getCanvas: function() {
      var id = "debugCanvas";
      var canvas = $(id);
      if (canvas == null) {
        // Need to add the canvas first
        canvas = document.createElement("canvas");
        canvas.id = id;
        canvas.classList.add("debug");
        document.body.appendChild(canvas);
      }
      if (canvas.width != window.innerWidth) {
        canvas.width = window.innerWidth;
      }
      if (canvas.height != window.innerHeight) {
        canvas.height = window.innerHeight;
      }
      return canvas;
    },

    /**
     * Clear the canvas.
     */
    clearCanvas: function() {
      var canvas = this.getCanvas();
      var context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    },

    /**
     * Illustrate a bounce.
     */
    drawBounce: function(ball, unalteredAngle) {
      if (!window.Game.Config.Debug.bounces) {
        return;
      }

      this.clearCanvas();
      Game.Pause.start();

      // Draw the symmetry lines in black
      var incomingAngle = Game.Utils.getAngle(ball.event.dxOld, ball.event.dyOld);
      var medianAngle = (incomingAngle + unalteredAngle) / 2;

      this.drawLine(ball.centerX, ball.centerY, medianAngle, "black");
      this.drawLine(ball.centerX, ball.centerY, medianAngle + Math.PI / 2, "black");


      // Draw the incoming line in green
      this.drawLine(ball.centerX, ball.centerY, incomingAngle, "green");

      // Draw the straight bounce in green
      this.drawLine(ball.centerX, ball.centerY, unalteredAngle, "green");
      var outgoingAngle = Game.Utils.getAngle(ball.event.dx, ball.event.dy);

      // Draw the actual bounce in blue
      this.drawLine(ball.centerX, ball.centerY, outgoingAngle, "blue");
    }
  };
})();
