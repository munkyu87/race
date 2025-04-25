import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Slider,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import '../styles/SetupPage.css';
import { observer } from 'mobx-react-lite';
import SkillSettingsPanel from '../components/SkillSettingsPanel';

import cat from '../assets/characters/cat.png';
import dog from '../assets/characters/dog.png';
import fox from '../assets/characters/fox.png';
import horse from '../assets/characters/horse.png';
import panda from '../assets/characters/panda.png';
import pig from '../assets/characters/pig.png';

const characterList = [
  { id: 'cat', image: cat, defaultName: '고양이' },
  { id: 'dog', image: dog, defaultName: '강아지' },
  { id: 'fox', image: fox, defaultName: '여우' },
  { id: 'horse', image: horse, defaultName: '말' },
  { id: 'panda', image: panda, defaultName: '팬더' },
  { id: 'pig', image: pig, defaultName: '돼지' },
];

function SetupPage() {
  const [names, setNames] = useState<string[]>(
    Array(characterList.length).fill('')
  );
  const [lapCount, setLapCount] = useState<number>(3);
  const [openSettings, setOpenSettings] = useState(false);
  const navigate = useNavigate();

  const handleNameChange = (idx: number, value: string) => {
    const updated = [...names];
    updated[idx] = value;
    setNames(updated);
  };

  const handleStart = () => {
    const players = characterList
      .map((char, idx) => ({
        id: char.id,
        name: names[idx].trim(),
        image: char.image,
      }))
      .filter((p) => p.name !== '');

    if (players.length < 2) {
      alert('참가자는 최소 2명 이상이어야 합니다.');
      return;
    }

    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('laps', lapCount.toString());
    navigate('/race-play');
  };

  return (
    <div className="setup-container">
      <h1>🏁 동물 쇼트트랙 🏁</h1>

      <IconButton
        style={{ position: 'absolute', color: 'white', top: 16, right: 16 }}
        onClick={() => setOpenSettings(true)}
      >
        <SettingsIcon fontSize="large" />
      </IconButton>

      <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
        <DialogTitle>스킬 설정</DialogTitle>
        <DialogContent>
          <SkillSettingsPanel />
        </DialogContent>
      </Dialog>

      <div className="character-grid">
        {characterList.map((char, idx) => (
          <div key={idx} className="character-card">
            <div className="character-slot" key={idx}>
              <img src={char.image} alt={char.defaultName} />
              <input
                type="text"
                placeholder={char.defaultName}
                value={names[idx]}
                onChange={(e) => handleNameChange(idx, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="lap-setting">
        바퀴 수:
        <input
          type="number"
          value={lapCount}
          min={1}
          max={10}
          onChange={(e) => setLapCount(Number(e.target.value))}
        />
      </div>
      <button className="start-button" onClick={handleStart}>
        레이스 시작!
      </button>
    </div>
  );
}

export default observer(SetupPage);
