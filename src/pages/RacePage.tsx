import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/RacePage.css';
import ResultModal from '../components/ResultModal';

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
  const [effectList, setEffectList] = useState<boolean[]>(
    characters.map(() => false)
  );

  const lapRef = useRef([...lapList]);
  const finishedRef = useRef([...finishedList]);
  const rankingRef = useRef<RankingItem[]>([]);
  const angleRef = useRef([...angleList]);
  const catLastSkillTimeRef = useRef<number | null>(null);
  const catColltime = 5000;
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!storedPlayers) navigate('/');
  }, []);

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
        const newEffects = [...effectList];

        newAngles.forEach((angle, i) => {
          if (newFinished[i]) return;

          const speed = Math.random() * 4 + 1;
          const nextAngle = angle + speed;
          newAngles[i] = nextAngle;

          const lap = Math.floor(nextAngle / 360);
          lapRef.current[i] = lap;

          const isFinish = lap >= totalLaps;
          if (isFinish && !newFinished[i]) {
            newFinished[i] = true;
            newRanking.push({
              id: characters[i].id,
              name: characters[i].name,
              time: Date.now() - startTime,
            });
          }
        });

        // 고양이 스킬
        const myIndex = characters.findIndex((c) => c.id === 'cat');
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const lastUsed = catLastSkillTimeRef.current;
        const canUse =
          elapsed >= catColltime &&
          (!lastUsed || now - lastUsed >= catColltime);

        if (myIndex !== -1 && lapRef.current[myIndex] >= 1 && canUse) {
          const sorted = characters
            .map((_, i: number) => ({
              index: i,
              lap: lapRef.current[i],
              angle: newAngles[i],
            }))
            .sort((a, b) => {
              if (a.lap !== b.lap) return b.lap - a.lap;
              return b.angle - a.angle;
            });

          const myRank = sorted.findIndex((entry) => entry.index === myIndex);
          const target = sorted[myRank - 1];

          if (
            target &&
            Math.abs(newAngles[myIndex] - newAngles[target.index]) > 20
          ) {
            console.log('야옹야옹');
            const temp = newAngles[myIndex];
            newAngles[myIndex] = newAngles[target.index];
            newAngles[target.index] = temp;

            newEffects[myIndex] = true;
            setTimeout(() => {
              console.log('앞지르기!!!!');
              setEffectList((prev) => {
                const updated = [...prev];
                updated[myIndex] = false;
                return updated;
              });
            }, 1000);

            catLastSkillTimeRef.current = now;
          }
        }

        finishedRef.current = newFinished;
        rankingRef.current = newRanking;
        angleRef.current = newAngles;

        setFinishedList([...newFinished]);
        setLapList([...lapRef.current]);
        setRanking([...newRanking].sort((a, b) => a.time - b.time));
        setEffectList([...newEffects]);

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
          padding: 0,
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
                className={`character-img ${effectList[i] ? 'effect' : ''}`}
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
