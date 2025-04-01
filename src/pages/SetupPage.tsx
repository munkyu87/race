// src/pages/SetupPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import horse from '../assets/characters/horse.png';
import panda from '../assets/characters/panda.png';
import cat from '../assets/characters/cat.png';
import dog from '../assets/characters/dog.png';
import pig from '../assets/characters/pig.png';
import fox from '../assets/characters/fox.png';

const characterImages = [horse, panda, cat, dog, pig, fox];

export default function SetupPage() {
  const [nameInput, setNameInput] = useState('');
  const [lapCount, setLapCount] = useState(3);
  const navigate = useNavigate();

  const handleStart = () => {
    const names = nameInput
      .split(/[,\\n]/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length < 2) {
      alert('참가자는 최소 2명 이상이어야 합니다.');
      return;
    }

    const players = names.map((name, idx) => ({
      name,
      image: characterImages[idx % characterImages.length],
    }));

    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('laps', lapCount.toString());
    navigate('/race-play');
  };

  return (
    <div className="setup-screen">
      <h1>🏁 이름 경주 세팅 🏁</h1>
      <textarea
        rows={6}
        placeholder="참가자 이름을 쉼표 또는 줄바꿈으로 입력하세요"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
      />
      <div className="lap-input">
        바퀴 수:{' '}
        <input
          type="number"
          value={lapCount}
          min={1}
          max={10}
          onChange={(e) => setLapCount(Number(e.target.value))}
        />
      </div>
      <button onClick={handleStart} className="start-button">
        레이스 시작!
      </button>
    </div>
  );
}
