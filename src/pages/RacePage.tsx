import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/RacePage.css';

export default function RacePage() {
  const navigate = useNavigate();

  const storedPlayers = localStorage.getItem('players');
  const storedLaps = localStorage.getItem('laps');

  const characters = storedPlayers ? JSON.parse(storedPlayers) : [];
  const totalLaps = storedLaps ? parseInt(storedLaps) : 3;

  const [angleList, setAngleList] = useState<number[]>(characters.map(() => 0));
  const [prevAngleList, setPrevAngleList] = useState<number[]>(
    characters.map(() => 0)
  );
  const [lapList, setLapList] = useState<number[]>(characters.map(() => 0));
  const [finishedList, setFinishedList] = useState<boolean[]>(
    characters.map(() => false)
  );
  const [ranking, setRanking] = useState<string[]>([]);
  const [racing, setRacing] = useState(false);

  const lapRef = useRef<number[]>([...lapList]);
  const finishedRef = useRef<boolean[]>([...finishedList]);
  const rankingRef = useRef<string[]>([]);

  useEffect(() => {
    if (!storedPlayers) {
      navigate('/');
    }
  }, []);

  const startRace = () => {
    setRacing(true);

    const interval = setInterval(() => {
      setAngleList((prevAngles) => {
        const newAngles = [...prevAngles];
        const newFinished = [...finishedList];
        const newRanking = [...ranking];

        newAngles.forEach((angle, i) => {
          if (newFinished[i]) return;

          const speed = Math.random() * 4 + 1;
          const nextAngle = angle + speed;
          newAngles[i] = nextAngle;

          // ✅ 정확한 바퀴 수 계산
          const lap = Math.floor(nextAngle / 360);

          // 도착 판정
          const isFinish = lap >= totalLaps;
          if (isFinish && !newFinished[i]) {
            newFinished[i] = true;
            newRanking.push(characters[i].name);
          }

          // lapList 업데이트도 동기화
          lapRef.current[i] = lap;
        });

        setFinishedList(newFinished);
        setRanking([...newRanking]);
        setLapList([...lapRef.current]); // 화면 반영
        if (newFinished.every(Boolean)) {
          clearInterval(interval);
          setRacing(false);
        }

        return newAngles;
      });
    }, 100);
  };

  const getXY = (angle: number, index: number) => {
    const a = 400 + index * 25;
    const b = 180 + index * 25;
    const centerX = 570;
    const centerY = 300;
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + a * Math.cos(rad),
      y: centerY + b * Math.sin(rad),
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
        {ranking.map((name, idx) => {
          const char = characters.find((c: any) => c.name === name);
          return (
            <div key={name} className="ranking-item">
              <span>{idx + 1}등</span>
              {char && <img src={char.image} alt={name} />}
              <span>{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
