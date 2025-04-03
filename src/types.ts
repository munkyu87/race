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

export type EffectType = '' | 'cat' | 'horse' | 'pig';

export interface GameSettings {
  horseSkillCooltime: number; // 예: 8000 (ms)
  catSkillCooltime: number; // 예: 5000 (ms)
  pigSkillCooltime: number; // 예: 7000 (ms)
  pigPauseDuration: number; // 예: 1000 (ms)
}
