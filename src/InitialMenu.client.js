import { useState } from 'react';

import Button from './Button.client';

import useNavigate from './useNavigate.client';
import useMutation from './useMutation.client';

export default function InitialMenu() {
  const [roomValue, setRoomValue] = useState('');
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [, navigate] = useNavigate();
  const [, createRoom] = useMutation({
    endpoint: `/room`,
    method: 'POST',
  });

  async function onCreateRoom() {
    const response = await createRoom({ roomId: roomValue || null });
    navigate(response);
  }

  function onShowRoomPicker() {
    setShowRoomPicker(true);
  }

  // eslint-disable-next-line no-unused-vars
  function onHideRoomPicker() {
    setShowRoomPicker(false);
  }

  function onChange(e) {
    setRoomValue(e.target.value);
  }

  return (
    <section className="initial-menu">
      <Button onClick={onCreateRoom}>Nueva reunión</Button>
      <Button outline onClick={onShowRoomPicker}>
        Unirse con un código
      </Button>
      {showRoomPicker && (
        <div className="room-picker-modal">
          <input
            onChange={onChange}
            className="room-input"
            placeholder="Introduce el código de tu reunión"
            value={roomValue}
          />
          <Button onClick={onCreateRoom}>Unirte</Button>
        </div>
      )}
    </section>
  );
}
