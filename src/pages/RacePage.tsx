import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/RacePage.css';

interface RankingItem {
  name: string;
  time: number;
}

export default function RacePage() {
  const navigate = useNavigate();

  const storedPlayers = localStorage.getItem('players');
  const storedLaps = localStorage.getItem('laps');

  const characters = storedPlayers ? JSON.parse(storedPlayers) : [];
  const totalLaps = storedLaps ? parseInt(storedLaps) : 3;

  const [angleList, setAngleList] = useState<number[]>(characters.map(() => 0));
  const [lapList, setLapList] = useState<number[]>(characters.map(() => 0));
  const [finishedList, setFinishedList] = useState<boolean[]>(
    characters.map(() => false)
  );
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [racing, setRacing] = useState(false);

  const lapRef = useRef<number[]>([...lapList]);
  const finishedRef = useRef<boolean[]>([...finishedList]);
  const rankingRef = useRef<RankingItem[]>([]);

  useEffect(() => {
    if (!storedPlayers) navigate('/');
  }, []);

  const startRace = () => {
    setRacing(true);

    const interval = setInterval(() => {
      setAngleList((prevAngles) => {
        const newAngles = [...prevAngles];
        const newFinished = [...finishedRef.current];
        const newRanking = [...rankingRef.current];
        const newLaps = [...lapRef.current];

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
            newRanking.push({ name: characters[i].name, time: Date.now() });
          }
        });

        finishedRef.current = newFinished;
        rankingRef.current = newRanking;

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
          padding: 0,
        }}
      >
        {characters.map((char: any, i: number) => (
          <li key={char.name}>
            <img
              src={char.image}
              alt={char.name}
              width={30}
              style={{ verticalAlign: 'middle' }}
            />{' '}
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
          {characters.map((char: any, i: number) => {
            const pos = getXY(angleList[i], i);
            return (
              <motion.img
                key={char.name}
                src={char.image}
                alt={char.name}
                className="character-img"
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
          const char = characters.find((c: any) => c.name === r.name);
          return (
            <div key={r.name} className="ranking-item">
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
