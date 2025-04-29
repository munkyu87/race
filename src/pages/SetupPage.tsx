import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Slider,
  Typography,
  DialogActions,
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
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null
  );

  const handleOpenSkillDialog = (id: string) => {
    setSelectedCharacterId(id);
    setOpenSkillDialog(true);
  };

  const handleCloseSkillDialog = () => {
    setOpenSkillDialog(false);
  };

  const selectedCharacter = characterList.find(
    (c) => c.id === selectedCharacterId
  );

  const getSkillDescription = (id: string | null) => {
    if (!id) return '';
    switch (id) {
      case 'cat':
        return '앞에 있는 상대를 당겨오며 순간 속도 상승!';
      case 'dog':
        return `트랙에 등장하는 먹이를 먹으면 순간 속도 상승!\n
  🥕 당근 = +1\n🦴 뼈다귀 = +2\n🍖 고기 = +3`;
      case 'fox':
        return '가장 앞에 있는 상대를 잠시 속도감소!';
      case 'horse':
        return '조금씩 속도 상승!';
      case 'panda':
        return '주변상대를 잠시 멈춤!';
      case 'pig':
        return '자신제외 전부 잠시 멈춤!';
      default:
        return '';
    }
  };

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
            <div className="character-slot">
              <img
                src={char.image}
                alt={char.defaultName}
                onClick={() => handleOpenSkillDialog(char.id)}
              />
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
      <Dialog open={openSkillDialog} onClose={handleCloseSkillDialog}>
        <DialogTitle style={{ textAlign: 'center' }}>
          {selectedCharacter?.defaultName}
        </DialogTitle>
        <DialogContent style={{ textAlign: 'center', width: '350px' }}>
          <img
            src={selectedCharacter?.image}
            alt={selectedCharacter?.defaultName}
            style={{
              width: '120px',
              height: '120px',
              marginBottom: '1rem',
              borderRadius: '50%',
            }}
          />
          {getSkillDescription(selectedCharacterId)
            .split('\n')
            .map((line, idx) => (
              <Typography
                key={idx}
                variant="body1"
                align="center"
                style={{ marginTop: idx === 0 ? 0 : 8 }}
              >
                {line}
              </Typography>
            ))}
        </DialogContent>

        <DialogActions style={{ justifyContent: 'center' }}>
          <button
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              marginBottom: '5px',
              borderRadius: '20px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            onClick={handleCloseSkillDialog}
          >
            닫기
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default observer(SetupPage);
