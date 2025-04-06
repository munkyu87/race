import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import '../styles/RacePage.css';
import { Character, RankingItem } from '../types';
import {
  useCatSkill,
  useHorseSkill,
  usePigSkill,
  useDogSkill,
  Trap,
} from '../skills/skillManager';
import { settingsStore } from '../stores/settingsStore';
import { useFoxSkill, checkFoxTrapTrigger } from '../skills/skillManager';

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
  const [raceEnded, setRaceEnded] = useState(false);
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
  const dogSkillTimeRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const dogSkillStateRef = useRef<{
    phase: 'idle' | 'charging' | 'boosting';
    lastUsed: number | null;
  }>({
    phase: 'idle',
    lastUsed: null,
  });
  const foxSkillTimeRef = useRef<number | null>(null);
  const trapsRef = useRef<Trap[]>([]);
  const { settings } = settingsStore;
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setTimeout(() => {
        setCountdown(null);
        startRace();
      }, 800);
    } else {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const resetRace = () => {
    const initialAngles = characters.map(() => 0);
    const initialLaps = characters.map(() => 0);
    const initialFinished = characters.map(() => false);
    const initialEffects = characters.map(() => '');
    const initialPaused = characters.map(() => false);
    const initialBonus = characters.map(() => 0);

    setAngleList(initialAngles);
    setLapList(initialLaps);
    setFinishedList(initialFinished);
    setRanking([]);
    setEffectList(initialEffects);
    setPausedList(initialPaused);

    angleRef.current = [...initialAngles];
    lapRef.current = [...initialLaps];
    finishedRef.current = [...initialFinished];
    rankingRef.current = [];
    pausedRef.current = [...initialPaused];
    bonusRef.current = [...initialBonus];

    lastBoostRef.current = Date.now();
    catSkillTimeRef.current = null;
    pigSkillTimeRef.current = null;
    dogSkillTimeRef.current = null;
    foxSkillTimeRef.current = null;
    trapsRef.current = [];

    dogSkillStateRef.current = {
      phase: 'idle',
      lastUsed: null,
    };

    startTimeRef.current = Date.now();
  };

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
          settings.pigSkillCooltime,
          dogSkillStateRef
        );

        useDogSkill(
          characters,
          bonusRef,
          pausedRef,
          setPausedList,
          (index, type) => {
            setEffectList((prev) => {
              const updated = [...prev];
              updated[index] =
                type === 'dog' && dogSkillStateRef.current.phase === 'boosting'
                  ? 'dog-boost'
                  : type;
              return updated;
            });

            setTimeout(() => {
              setEffectList((prev) => {
                const updated = [...prev];
                updated[index] = '';
                return updated;
              });
            }, settings.dogSkillCooltime);
          },
          dogSkillStateRef,
          startTimeRef,
          settings.dogSkillCooltime
        );

        useFoxSkill(
          characters,
          trapsRef,
          foxSkillTimeRef,
          startTimeRef,
          angleRef,
          settings.foxSkillCooltime
        );
        checkFoxTrapTrigger(
          characters,
          trapsRef,
          angleRef,
          pausedRef,
          setPausedList,
          setEffectList,
          settings.foxTrapDuration
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
      b = 220,
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
        <div
          className="controls"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          {countdown !== null && (
            <motion.div
              key={countdown}
              className={`countdown-text ${
                countdown === 0 ? 'start-final' : ''
              }`}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {countdown === 0 ? 'START!' : countdown}
            </motion.div>
          )}
          {!racing && countdown === null && (
            <Button
              variant="outlined"
              onClick={() => {
                resetRace();
                setCountdown(3);
              }}
              startIcon={<PlayArrowIcon />}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50px',
                marginLeft: '0.1rem',
                marginBottom: '0.5rem',
                padding: '0.8rem 0.9rem',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                letterSpacing: '1px',
                boxShadow: '0 0 12px rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 20px rgba(255,255,255,0.5)',
                },
              }}
            >
              START
            </Button>
          )}
        </div>
        <div className="oval-track">
          {trapsRef.current
            .filter((t) => !t.used)
            .map((trap, i) => {
              const rad = (trap.angle * Math.PI) / 180;
              const x = 570 + 380 * Math.cos(rad);
              const y = 300 + 220 * Math.sin(rad);
              return (
                <ReportProblemIcon
                  key={`trap-${i}`}
                  sx={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    color: 'red',
                    fontSize: 36,
                    animation: 'blink 1s infinite',
                  }}
                />
              );
            })}
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
