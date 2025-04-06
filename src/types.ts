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

export interface LiveRankingItem {
  id: string;
  name: string;
  lap: number;
  angle: number;
}

export type EffectType = '' | 'cat' | 'horse' | 'pig' | 'dog' | 'fox';

export interface GameSettings {
  horseSkillCooltime: number;
  catSkillCooltime: number;
  pigSkillCooltime: number;
  pigPauseDuration: number;
  dogSkillCooltime: number;
  foxSkillCooltime: number;
  foxTrapDuration: number;
}
