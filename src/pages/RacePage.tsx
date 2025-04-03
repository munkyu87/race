import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import '../styles/RacePage.css';
import { Character, RankingItem } from '../types';
import {
  useCatSkill,
  useHorseSkill,
  usePigSkill,
} from '../skills/skillManager';
import { settingsStore } from '../stores/settingsStore';

export default function RacePage() {
  const navigate = useNavigate();
  const storedPlayers = localStorage.getItem('players');
  const storedLaps = localStorage.getItem('laps');

  const characters: Character[] = storedPlayers
    ? JSON.parse(storedPlayers)
    : [];
  const totalLaps = storedLaps ? parseInt(storedLaps) : 3;

  const [angleList, setAngleList] = useState<number[]>(characters.map(() => 0));
  const [lapList, setLapList] = useState<number[]>(characters.map(() => 0));
  const [finishedList, setFinishedList] = useState<boolean[]>(
    characters.map(() => false)
  );
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [racing, setRacing] = useState(false);
  const [effectList, setEffectList] = useState<string[]>(
    characters.map(() => '')
  );
  const [pausedList, setPausedList] = useState<boolean[]>(
    characters.map(() => false)
  );
  const [triggerHorseEffect, setTriggerHorseEffect] = useState(false);

  const lapRef = useRef([...lapList]);
  const finishedRef = useRef([...finishedList]);
  const rankingRef = useRef<RankingItem[]>([]);
  const angleRef = useRef([...angleList]);
  const pausedRef = useRef<boolean[]>([...pausedList]);
  const bonusRef = useRef<number[]>(characters.map(() => 0));
  const lastBoostRef = useRef<number>(Date.now());
  const catSkillTimeRef = useRef<number | null>(null);
  const pigSkillTimeRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { settings } = settingsStore;

  useEffect(() => {
    if (!storedPlayers) navigate('/');
  }, []);

  useEffect(() => {
    if (triggerHorseEffect) {
      const horseIndex = characters.findIndex((c) => c.id === 'horse');
      if (horseIndex !== -1) {
        setEffectList((prev) => {
          const updated = [...prev];
          updated[horseIndex] = 'horse';
          return updated;
        });
        setTimeout(() => {
          setEffectList((prev) => {
            const updated = [...prev];
            updated[horseIndex] = '';
            return updated;
          });
          setTriggerHorseEffect(false);
        }, 2000);
      }
    }
  }, [triggerHorseEffect]);

  const startRace = () => {
    setRacing(true);
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      setAngleList((prevAngles) => {
        const newAngles = [...prevAngles];
        const newFinished = [...finishedRef.current];
        const newRanking = [...rankingRef.current];
        const newLaps = [...lapRef.current];
        const now = Date.now();

        useHorseSkill(
          characters,
          bonusRef,
          lastBoostRef,
          () => setTriggerHorseEffect(true),
          settings.horseSkillCooltime
        );
        usePigSkill(
          characters,
          pausedRef,
          setPausedList,
          (index, type) => {
            setEffectList((prev) => {
              const updated = [...prev];
              updated[index] = type;
              return updated;
            });
            setTimeout(() => {
              setEffectList((prev) => {
                const updated = [...prev];
                updated[index] = '';
                return updated;
              });
            }, 2000);
          },
          pigSkillTimeRef,
          startTimeRef,
          settings.pigSkillCooltime
        );

        newAngles.forEach((angle, i) => {
          if (newFinished[i] || pausedRef.current[i]) return;
          const bonus = bonusRef.current?.[i] || 0;
          const speed = Math.random() * 4 + 1 + bonus;
          newAngles[i] += speed;
          newLaps[i] = Math.floor(newAngles[i] / 360);
          if (newLaps[i] >= totalLaps && !newFinished[i]) {
            newFinished[i] = true;
            newRanking.push({
              id: characters[i].id,
              name: characters[i].name,
              time: now - startTimeRef.current,
            });
          }
        });

        useCatSkill(
          characters,
          newAngles,
          lapRef,
          (index, type) => {
            setEffectList((prev) => {
              const updated = [...prev];
              updated[index] = type;
              return updated;
            });
            setTimeout(() => {
              setEffectList((prev) => {
                const updated = [...prev];
                updated[index] = '';
                return updated;
              });
            }, 2000);
          },
          catSkillTimeRef,
          startTimeRef,
          settings.catSkillCooltime
        );

        finishedRef.current = newFinished;
        rankingRef.current = newRanking;
        angleRef.current = newAngles;
        lapRef.current = newLaps;

        setFinishedList([...newFinished]);
        setLapList([...newLaps]);
        setRanking([...newRanking].sort((a, b) => a.time - b.time));

        if (newFinished.every(Boolean)) {
          clearInterval(interval);
          setRacing(false);
        }

        return newAngles;
      });
    }, 100);
  };

  const getXY = (angle: number, index: number) => {
    const a = 380,
      b = 180,
      centerX = 570,
      centerY = 300;
    const rad = (angle * Math.PI) / 180;
    const xOffset = (index - (characters.length - 1) / 2) * 35;
    return {
      x: centerX + a * Math.cos(rad) + xOffset,
      y: centerY + b * Math.sin(rad) + 10,
    };
  };

  if (characters.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>❗ 참가자 정보가 없습니다.</h2>
        <p>처음 화면으로 돌아가 참가자를 입력해주세요.</p>
      </div>
    );
  }

  return (
    <div className="race-container">
      <div
        className="race-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Button
          variant="contained"
          color="info"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            left: 16,
            top: 16,
            fontSize: '1rem',
            padding: '8px 16px',
          }}
        >
          세팅으로
        </Button>
        <h1 style={{ margin: '1rem 0' }}>🏁 레이스 스타트 🏁</h1>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <ul
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            listStyle: 'none',
            padding: 0,
            flexWrap: 'wrap',
          }}
        >
          <h3>🎯 총 바퀴 수: {totalLaps}바퀴</h3>
          {characters.map((char, i) => (
            <li
              key={char.id}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <img src={char.image} alt={char.name} width={30} />
              <span>
                {i + 1} - {lapList[i]}바퀴
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="oval-track-wrapper">
        <div className="track-markers">
          <div className="start-line" />
          <div className="finish-line" />
        </div>
        <div className="oval-track">
          {characters.map((char, i) => {
            const pos = getXY(angleList[i], i);
            return (
              <motion.img
                key={char.id}
                src={char.image}
                alt={char.name}
                className={`character-img ${
                  effectList[i] ? `effect-${effectList[i]}` : ''
                }`}
                animate={{ left: pos.x, top: pos.y }}
                transition={{ duration: 0.5 }}
                style={{ position: 'absolute' }}
              />
            );
          })}
        </div>
      </div>

      <div
        className="controls"
        style={{ textAlign: 'center', marginTop: '1.5rem' }}
      >
        <Button
          variant="contained"
          color="success"
          startIcon={<PlayArrowIcon />}
          onClick={startRace}
          disabled={racing}
        >
          {racing ? '레이싱 중...' : '레이싱 시작!'}
        </Button>
      </div>

      <div className="ranking-board">
        <div>🏆 순위</div>
        {ranking.map((r, idx) => {
          const char = characters.find((c) => c.id === r.id);
          if (!char) return null;
          return (
            <div key={r.id} className="ranking-item">
              <span>{idx + 1}등</span>
              <img src={char.image} alt={char.name} />
              <span>{char.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
