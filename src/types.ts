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

export type EffectType = '' | 'cat' | 'horse' | 'pig' | 'dog' | 'fox' | 'panda';

export interface GameSettings {
  horseSkillCooltime: number;
  horseBoostAmount: number;

  catSkillCooltime: number;
  catSpeedBonus: number;

  pigSkillCooltime: number;
  pigPauseDuration: number;

  dogSkillCooltime: number;
  dogBoostSpeed: number;

  foxSkillCooltime: number;
  foxReverseDistance: number;

  pandaSkillCooltime: number;
  pandaStunDuration: number;
}
