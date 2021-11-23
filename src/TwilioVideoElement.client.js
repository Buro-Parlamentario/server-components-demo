/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect, useRef } from 'react';
import Video from 'twilio-video';

export default function TwilioVideoElement({ token, roomId, isGuest }) {
  const remoteRef = useRef();
  const mirrorRef = useRef();
  const [guestIsConnected, setGuestIsConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
  }

  useEffect(() => {
    Video.connect(token, {
      name: roomId,
    }).then(
      (newRoom) => {
        setRoom(newRoom);
      },
      (error) => {
        console.trace(error);
      },
    );

    return () => room && room.disconnect();
  }, [roomId]);

  useEffect(() => {
    if (room) {
      room.localParticipant.tracks.forEach((publication) => {
        const { track } = publication;
        mirrorRef.current.appendChild(track.attach());
      });

      if (!isGuest)
        room.once('participantConnected', (participant) => {
          setGuestIsConnected(true);

          participant.tracks.forEach((publication) => {
            if (publication.isSubscribed) {
              const { track } = publication;
              remoteRef.current.appendChild(track.attach());
            }
          });

          participant.on('trackSubscribed', (track) => {
            remoteRef.current.appendChild(track.attach());
          });
        });
      else
        room.participants.forEach((participant) => {
          participant.tracks.forEach((publication) => {
            if (publication.isSubscribed) {
              const { track } = publication;
              remoteRef.current.appendChild(track.attach());
            }
          });

          participant.on('trackSubscribed', (track) => {
            remoteRef.current.appendChild(track.attach());
          });
        });
    }
  }, [room, isGuest]);

  return (
    <div className="twilio-container">
      {!isGuest && !guestIsConnected && (
        <div className="invitation-container">
          <div className="invitation-title">Eres la única persona aquí</div>
          <div className="invitation-text">
            Comparte este código de reunión con el candidato con el que quieras participar
          </div>
          <div className="code-container" onClick={copyToClipboard}>
            <span>{roomId}</span>
            <i className={['material-icons', copied ? 'copied' : ''].join(' ')}>content_copy</i>
          </div>
        </div>
      )}
      <div className="remote-video" ref={remoteRef} />
      <div className="mirror" ref={mirrorRef} />
    </div>
  );
}
