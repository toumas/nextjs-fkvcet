import { useEffect } from 'react';

export default function Screen() {
  var airconsole;
  var paddles;
  var ball;
  var score = [0, 0];
  var canvas;
  var last = null;
  var score_el;

  /**
   * Sets up the communication to game pads.
   */
  function setupConsole() {
    airconsole = new AirConsole();

    airconsole.onConnect = function (deviceId) {
      checkTwoPlayers();
    };

    airconsole.onDisconnect = function (deviceId) {
      var player = airconsole.convertDeviceIdToPlayerNumber(deviceId);
      if (player != undefined) {
        // Player that was in game left the game.
        // Setting active players to length 0.
        airconsole.setActivePlayers(0);
      }
      checkTwoPlayers();
    };

    airconsole.onMessage = function (deviceId, data) {
      this.dispatchEvent(deviceId, data);
      var player = airconsole.convertDeviceIdToPlayerNumber(deviceId);
      if (player != undefined && data.move !== undefined) {
        paddles[player].move.y = data.move;
      }
    };
  }

  /**
   * Checks if two players are connected!
   */
  function checkTwoPlayers() {
    var active_players = airconsole.getActivePlayerDeviceIds();
    var connected_controllers = airconsole.getControllerDeviceIds();
    // Only update if the game didn't have active players.
    if (active_players.length == 0) {
      if (connected_controllers.length >= 2) {
        airconsole.broadcastEvent('DO_SOMETHING', {
          foo: 'bar',
        });
        // Enough controller devices connected to start the game.
        // Setting the first 2 controllers to active players.
        airconsole.setActivePlayers(2);
        resetBall(50, 0);
        score = [0, 0];
        score_el.innerHTML = score.join(':');
        document.getElementById('wait').innerHTML = '';
      } else if (connected_controllers.length == 1) {
        document.getElementById('wait').innerHTML = 'Need 1 more player!';
        resetBall(0, 0);
      } else if (connected_controllers.length == 0) {
        document.getElementById('wait').innerHTML = 'Need 2 more players!';
        resetBall(0, 0);
      }
    }
  }

  /**
   * Sends a message to the device that it should vibrate;
   */
  function vibrate(player) {
    airconsole.message(airconsole.convertPlayerNumberToDeviceId(player), {
      vibrate: 1000,
    });
  }

  /**
   * Shows who scored and updates the score afterwards.
   */
  function displayScore(player) {
    var name = airconsole.getNickname(
      airconsole.convertPlayerNumberToDeviceId(player)
    );
    score_el.innerHTML =
      "<div style='font-size: 20px;margin-top:16px'>" + name + ' scored!</div>';
    window.setTimeout(function () {
      score_el.innerHTML = score.join(':');
    }, 1000);
  }

  /**
   * body.onload function.
   */
  function init() {
    setupConsole();

    // Setting up the game. Nothing AirConsole specific.

    canvas = document.getElementById('canvas');
    score_el = document.getElementById('score');
    paddles = [
      {
        pos: { x: 10, y: 50 },
        move: { x: 0, y: 0 },
        el: document.getElementById('player_1'),
      },
      {
        pos: { x: 190, y: 53 },
        move: { x: 0, y: 0 },
        el: document.getElementById('player_2'),
      },
    ];
    ball = {
      pos: { x: 100, y: 50 },
      move: { x: 0, y: 0 },
      el: document.getElementById('ball'),
    };
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    window.onresize = clearCanvas;
    last = new Date().getTime();
    loop();
  }

  /**
   * Moving an element. Nothing AirConsole specific.
   * @param entity
   */
  function updatePos(entity, delta) {
    entity.pos.x += entity.move.x * delta;
    entity.pos.y += entity.move.y * delta;
  }

  /**
   * Moving the ball and drawing the canvas. Nothing AirConsole specific.
   */
  function loop() {
    var now = new Date().getTime();
    var delta = now - last;
    delta = Math.min(20, delta);
    delta /= 1000;
    last = now;
    draw(true);
    updatePos(paddles[0], delta);
    updatePos(paddles[1], delta);
    updatePos(ball, delta);

    // paddle limit
    paddles[0].pos.y = Math.min(Math.max(10, paddles[0].pos.y), 90);
    paddles[1].pos.y = Math.min(Math.max(10, paddles[1].pos.y), 90);

    // Wall bounce
    if (ball.pos.y <= 1) {
      ball.pos.y = 1;
      ball.move.y *= -1;
      updatePos(ball, 0);
    }
    if (ball.pos.y >= 99) {
      ball.pos.y = 99;
      ball.move.y *= -1;
      updatePos(ball, 0);
    }

    // Paddle bounce
    if (
      ball.pos.x >= paddles[0].pos.x - 2 &&
      ball.pos.x <= paddles[0].pos.x + 2 &&
      ball.pos.y >= paddles[0].pos.y - 10 &&
      ball.pos.y <= paddles[0].pos.y + 10
    ) {
      ball.move.x *= -1;
      ball.move.y += (ball.pos.y - paddles[0].pos.y) * 2;
      ball.pos.x = paddles[0].pos.x + 2;
    }
    if (
      ball.pos.x >= paddles[1].pos.x - 2 &&
      ball.pos.x <= paddles[1].pos.x + 2 &&
      ball.pos.y >= paddles[1].pos.y - 10 &&
      ball.pos.y <= paddles[1].pos.y + 10
    ) {
      ball.move.x *= -1;
      ball.move.y += (ball.pos.y - paddles[1].pos.y) * 2;
      ball.pos.x = paddles[1].pos.x - 2;
    }

    // Score
    if (ball.pos.x >= 200) {
      score[0] += 1;
      displayScore(0);
      resetBall(-ball.move.x, ball.move.y / 2);
      vibrate(1);
    }
    if (ball.pos.x <= 0) {
      score[1] += 1;
      displayScore(1);
      resetBall(-ball.move.x, ball.move.y / 2);
      vibrate(0);
    }
    draw();

    requestAnimationFrame(loop);
  }

  /**
   * Reseting the ball. Nothing Game Console specific.
   * @param move_x
   * @param move_y
   */
  function resetBall(move_x, move_y) {
    clearCanvas();
    ball.pos.x = 100;
    ball.pos.y = 50;
    ball.move.x = move_x;
    ball.move.y = move_y;
  }

  /**
   * Reseting the ball. Nothing Game Console specific.
   * @param move_x
   * @param move_y
   */
  function clearCanvas() {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Drawing the game scene. Nothing Game Console specific.
   * @param clear
   */
  function draw(clear) {
    // Draw
    var ctx = canvas.getContext('2d');
    var zoom = canvas.clientHeight / 100;
    function c(x) {
      x *= zoom;
      return x | 0; // round
    }
    ctx.fillStyle = clear ? 'black' : 'white';

    ctx.fillRect(
      c(paddles[0].pos.x - 1),
      c(paddles[0].pos.y - 10),
      c(2),
      c(20)
    );
    ctx.fillRect(
      c(paddles[1].pos.x - 1),
      c(paddles[1].pos.y - 10),
      c(2),
      c(20)
    );

    ctx.beginPath();
    ctx.arc(
      c(ball.pos.x),
      c(ball.pos.y),
      c(clear ? 3 : 2),
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();
    ctx.closePath();
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div className="game">
        <canvas id="canvas" />
        <div id="score">0:0</div>
        <div id="wait" />
      </div>
      <style global jsx>{`
    @font-face {
      font-family: 'PressStart2P';
      src: url('PressStart2P.ttf') format('truetype');
    }

    html, #__next {
      height: 100vh;
      margin: 0px;
      font-family: 'PressStart2P', sans-serif;
      color: white;
      text-align: center;
    }

    .game {
      background-color: black;
      top: 50%;
      margin-top: -25%;
      padding-bottom: 50%;
      overflow: hidden;
      position: relative;
    }

    #canvas {
      position: absolute;
      top: 0px;
      left:0px;
      width: 100%;
      height: 100%;
    }

    #score {
      position: absolute;
      top: 10%;
      left: 0px;
      width: 100%;
      font-size: 48px;
    }

    #wait {
      position: absolute;
      top: 10%;
      margin-top: 80px;
      left: 0px;
      width: 100%;
      font-size: 24px;
      color: lime;
    }
    `}</style>
    </>
  );
}
