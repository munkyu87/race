import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/RacePage.css';

export interface Character {
  id: string;
  name: string;
  image: string;
}

export interface RankingItem {
  id: string;
  name: string;
  time: number;
}

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
  const horseSpeedBonusRef = useRef<number[]>(characters.map(() => 0));
  const horseLastBoostTimeRef = useRef<number>(Date.now());

  const catLastSkillTimeRef = useRef<number | null>(null);
  const catCooltime = 5000;

  const pigLastSkillTimeRef = useRef<number | null>(null);
  const pigCooltime = 7000;
  const pausedRef = useRef<boolean[]>(characters.map(() => false));

  const startTimeRef = useRef<number>(0);
  const charactersRef = useRef(characters);

  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  useEffect(() => {
    if (!storedPlayers) navigate('/');
  }, []);

  // 말 이펙트
  useEffect(() => {
    if (triggerHorseEffect) {
      const horseIndex = charactersRef.current.findIndex(
        (c) => c.id === 'horse'
      );
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
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const interval = setInterval(() => {
      setAngleList((prevAngles) => {
        const newAngles = [...prevAngles];
        const newFinished = [...finishedRef.current];
        const newRanking = [...rankingRef.current];
        const newLaps = [...lapRef.current];
        const now = Date.now();

        // 🐴 말 스킬
        const horseIndex = characters.findIndex((c) => c.id === 'horse');
        if (horseIndex !== -1 && now - horseLastBoostTimeRef.current >= 8000) {
          horseSpeedBonusRef.current[horseIndex] += 0.2;
          setTriggerHorseEffect(true);
          horseLastBoostTimeRef.current = now;
        }

        // 🐷 돼지 스킬
        const pigIndex = characters.findIndex((c) => c.id === 'pig');
        const pigLastUsed = pigLastSkillTimeRef.current;
        const elapsed = now - startTimeRef.current;
        const canUsePig =
          elapsed >= pigCooltime &&
          (!pigLastUsed || now - pigLastUsed >= pigCooltime);

        if (pigIndex !== -1 && canUsePig) {
          const newPaused = characters.map((_, i) => i !== pigIndex);
          pausedRef.current = newPaused;
          setPausedList(newPaused);

          setTimeout(() => {
            pausedRef.current = characters.map(() => false);
            setPausedList(pausedRef.current);
          }, 1000);

          setEffectList((prev) => {
            const updated = [...prev];
            updated[pigIndex] = 'pig';
            return updated;
          });

          setTimeout(() => {
            setEffectList((prev) => {
              const updated = [...prev];
              updated[pigIndex] = '';
              return updated;
            });
          }, 2000);

          pigLastSkillTimeRef.current = now;
        }

        newAngles.forEach((angle, i) => {
          if (newFinished[i] || pausedRef.current[i]) return;

          const bonus = horseSpeedBonusRef.current[i] || 0;
          const speed = Math.random() * 4 + 1 + bonus;
          const nextAngle = angle + speed;
          newAngles[i] = nextAngle;

          const lap = Math.floor(nextAngle / 360);
          lapRef.current[i] = lap;

          if (lap >= totalLaps && !newFinished[i]) {
            newFinished[i] = true;
            newRanking.push({
              id: characters[i].id,
              name: characters[i].name,
              time: now - startTime,
            });
          }
        });

        // 🐱 고양이 스킬
        const catIndex = characters.findIndex((c) => c.id === 'cat');
        const catLastUsed = catLastSkillTimeRef.current;
        const canUseCat =
          elapsed >= catCooltime &&
          (!catLastUsed || now - catLastUsed >= catCooltime);

        if (catIndex !== -1 && lapRef.current[catIndex] >= 1 && canUseCat) {
          const sorted = characters
            .map((_, i) => ({
              index: i,
              lap: lapRef.current[i],
              angle: newAngles[i],
            }))
            .sort((a, b) => b.lap - a.lap || b.angle - a.angle);

          const catRank = sorted.findIndex((e) => e.index === catIndex);
          const target = sorted[catRank - 1];

          if (
            target &&
            Math.abs(newAngles[catIndex] - newAngles[target.index]) > 20
          ) {
            const temp = newAngles[catIndex];
            newAngles[catIndex] = newAngles[target.index];
            newAngles[target.index] = temp;

            setEffectList((prev) => {
              const updated = [...prev];
              updated[catIndex] = 'cat';
              return updated;
            });

            setTimeout(() => {
              setEffectList((prev) => {
                const updated = [...prev];
                updated[catIndex] = '';
                return updated;
              });
            }, 2000);

            catLastSkillTimeRef.current = now;
          }
        }

        finishedRef.current = newFinished;
        rankingRef.current = newRanking;
        angleRef.current = newAngles;

        setFinishedList([...newFinished]);
        setLapList([...lapRef.current]);
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
    const a = 380;
    const b = 180;
    const centerX = 570;
    const centerY = 300;
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
      <h1>🏁 레이스 스타트 🏁</h1>
      <button className="back-button" onClick={() => navigate('/')}>
        ← 세팅으로
      </button>
      <h3>🎯 총 바퀴 수: {totalLaps}바퀴</h3>

      <ul
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          listStyle: 'none',
        }}
      >
        {characters.map((char, i) => (
          <li key={char.id}>
            <img
              src={char.image}
              alt={char.name}
              width={30}
              style={{ verticalAlign: 'middle' }}
            />
            {char.name} - {lapList[i]}바퀴
          </li>
        ))}
      </ul>

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

      <div className="controls">
        <button onClick={startRace} disabled={racing}>
          {racing ? '레이싱 중...' : '레이싱 시작!'}
        </button>
      </div>

      <div className="ranking-board">
        <div>🏆 순위</div>
        {ranking.map((r, idx) => {
          const char = characters.find((c) => c.id === r.id);
          return (
            <div key={r.id} className="ranking-item">
              <span>{idx + 1}등</span>
              {char && <img src={char.image} alt={r.name} />}
              <span>{r.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
