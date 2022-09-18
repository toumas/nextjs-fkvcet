import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function Controller() {
  const [playerId, setPlayerId] = useState(undefined);
  /* navigator.vibrate =
    navigator.vibrate ||
    navigator.webkitVibrate ||
    navigator.mozVibrate ||
    navigator.msVibrate; */

  const airConsoleRef = useRef<AirConsole>();
  /**
   * Tells the screen to move the paddle of this player.
   * @param amount
   */
  function move(amount) {
    airConsoleRef.current.message(AirConsole.SCREEN, { move: amount });
  }
  /**
   * Sets up the communication to the screen.
   */
  useEffect(() => {
    airConsoleRef.current = new AirConsole({
      orientation: AirConsole.ORIENTATION_PORTRAIT,
    });

    airConsoleRef.current.on('DO_SOMETHING', (deviceId, data) => {
      console.log({ deviceId }, { data });
    });

    airConsoleRef.current.onActivePlayersChange = function (playerId) {
      if (typeof playerId !== 'undefined') {
        setPlayerId(playerId);
      }
    };

    /*
     * Makes the device vibrate if the screen says so.
     */
    airConsoleRef.current.onMessage = function (deviceId, data) {
      this.dispatchEvent(deviceId, data);
      if (deviceId == AirConsole.SCREEN && data.vibrate) {
        navigator.vibrate(data.vibrate);
        console.log('Vibrating: ' + data.vibrate);
      }
    };
  }, []);

  return (
    <>
      <div style={{ height: '1%' }}></div>
      <div
        className="button"
        onTouchStart={() => move(-50)}
        onTouchEnd={() => move(0)}
        onMouseDown={() => move(-50)}
        onMouseUp={() => move(0)}
      >
        <div className="button_label">UP</div>
      </div>
      <div style={{ height: '8%' }}></div>
      <div
        className="button"
        onTouchStart={() => move(50)}
        onTouchEnd={() => move(0)}
        onMouseDown={() => move(50)}
        onMouseUp={() => move(0)}
      >
        <div className="button_label">DOWN</div>
      </div>
      <div id="player_id">
        {typeof playerId === 'undefined' && "It's a 2 player game!"}
        {playerId === 0 && 'Left player'}
        {playerId === 1 && 'Right player'}
      </div>
      <style global jsx>{`
        html, #__next {
          height: 100vh;
          margin: 0px;
          color: white;
          text-align: center;
          background-color: black;
        }
    
        .button {
          display: inline-block;
          height: 45%;
          width: 98%;
          background-color: #222;
          position: relative;
        }
    
        .button_label {
          position: absolute;
          left: 0px;
          width: 100%;
          top: 50%;
          margin-top: -6px;
        }
    
        #player_id {
          position: absolute;
          top: 50%;
          left: 0%;
          width: 100%;
          margin-top: -8px;
          color: #777;
        }
      `}</style>
    </>
  );
}
