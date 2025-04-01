import React from 'react';
import '../styles/ResultModal.css';
import { RankingItem } from '../pages/RacePage';

interface ResultModalProps {
  ranking: RankingItem[];
  onClose: () => void;
}

export default function ResultModal({ ranking, onClose }: ResultModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>🏁 경기 결과</h2>
        {ranking.map((char, idx) => (
          <div key={char.name} className="ranking-row">
            <span>{idx + 1}등</span>
            {/* <img src={char.image} alt={char.name} /> */}
            <span>{char.name}</span>
          </div>
        ))}
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
