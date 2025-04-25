import { MutableRefObject, RefObject } from 'react';
import { Character, RankingItem } from '../types';

type DogSkillState = {
  phase: 'idle' | 'charging' | 'boosting';
  lastUsed: number | null;
};

export interface Trap {
  angle: number;
  createdAt: number;
  used: boolean;
  ownerId: string;
}

export const types: readonly FoodType[] = ['carrot', 'bone', 'meat'];
export type FoodType = 'carrot' | 'bone' | 'meat';

export type FoodItem = {
  id: string;
  angle: number; // 위치
  type: FoodType;
  bonus: number;
  duration: number;
  eaten: boolean;
  activeAt: number;
};

// 고양이 스킬 (앞지르기)
export function useCatSkill(
  characters: Character[],
  angleList: number[],
  lapRef: RefObject<number[]>,
  effectSetter: (index: number, type: string) => void,
  skillTimeRef: React.MutableRefObject<number | null>,
  startTimeRef: RefObject<number>,
  catSkillCooltime: number,
  catSpeedBonus: number
) {
  catSkillCooltime = catSkillCooltime * 1000;
  const catIndex = characters.findIndex((c) => c.id === 'cat');
  const now = Date.now();
  const lastUsed = skillTimeRef.current;
  if (!startTimeRef.current) return;
  const elapsed = now - startTimeRef.current;

  const lapList = lapRef.current;
  const lapValid = lapList && lapList[catIndex] >= 1;

  const canUse =
    catIndex !== -1 &&
    // lapValid &&
    elapsed >= catSkillCooltime &&
    (!lastUsed || now - lastUsed >= catSkillCooltime);

  if (canUse) {
    const sorted = characters
      .map((_, i) => ({
        index: i,
        lap: lapRef.current![i],
        angle: angleList[i],
      }))
      .sort((a, b) => b.lap - a.lap || b.angle - a.angle);

    const myRank = sorted.findIndex((e) => e.index === catIndex);
    const target = sorted[myRank - 1];

    if (
      target &&
      Math.abs(angleList[catIndex] - angleList[target.index]) > 20
    ) {
      const temp = angleList[catIndex];
      angleList[catIndex] = angleList[target.index];
      angleList[target.index] = temp;

      angleList[catIndex] += catSpeedBonus;

      effectSetter(catIndex, 'cat');
      skillTimeRef.current = now;
    }
  }
}

// 말 스킬 (속도 증가)
export function useHorseSkill(
  characters: Character[],
  bonusRef: RefObject<number[]>,
  lastBoostRef: MutableRefObject<number>,
  effectTrigger: () => void,
  horseSkillCooltime: number,
  horseBoostAmount: number
) {
  horseSkillCooltime = horseSkillCooltime * 1000;
  const horseIndex = characters.findIndex((c) => c.id === 'horse');
  const now = Date.now();

  if (
    horseIndex !== -1 &&
    lastBoostRef.current !== null &&
    now - lastBoostRef.current >= horseSkillCooltime &&
    bonusRef.current
  ) {
    // bonusRef.current[horseIndex] += 0.2;
    bonusRef.current[horseIndex] += horseBoostAmount;
    lastBoostRef.current = now;
    effectTrigger();
  }
}

// 돼지 스킬 (모두 멈춤)
export function usePigSkill(
  characters: Character[],
  pausedRef: MutableRefObject<boolean[]>,
  setPausedList: (list: boolean[]) => void,
  effectSetter: (index: number, type: string) => void,
  pigSkillTimeRef: MutableRefObject<number | null>,
  startTimeRef: RefObject<number>,
  pigSkillCooltime: number,
  pigPauseDuration: number
  // dogSkillStateRef: MutableRefObject<{
  //   phase: 'idle' | 'charging' | 'boosting';
  //   lastUsed: number | null;
  // }>
) {
  pigSkillCooltime = pigSkillCooltime * 1000;
  pigPauseDuration = pigPauseDuration * 1000;
  const pigIndex = characters.findIndex((c) => c.id === 'pig');
  const dogIndex = characters.findIndex((c) => c.id === 'dog');
  const now = Date.now();
  if (!startTimeRef.current) return;
  const elapsed = now - startTimeRef.current;
  const lastUsed = pigSkillTimeRef.current;

  const canUse =
    pigIndex !== -1 &&
    elapsed >= pigSkillCooltime &&
    (!lastUsed || now - lastUsed >= pigSkillCooltime);

  if (canUse) {
    // effectSetter(pigIndex, 'pig');

    const paused = characters.map((_, i) => i !== pigIndex);

    pausedRef.current = paused;
    setPausedList(paused);

    setTimeout(() => {
      const resumed = characters.map(() => false);

      pausedRef.current = resumed;
      setPausedList(resumed);

      // pigSkillTimeRef.current = Date.now();
      // }, 1000);
    }, pigPauseDuration);

    effectSetter(pigIndex, 'pig');
    pigSkillTimeRef.current = now;
  }
}

export function useDogSkill(
  characters: Character[],
  angleRef: React.MutableRefObject<number[]>,
  foodRef: React.MutableRefObject<FoodItem[]>,
  bonusRef: React.MutableRefObject<number[]>,
  effectSetter: (index: number, type: string) => void
) {
  const dogIndex = characters.findIndex((c) => c.id === 'dog');
  if (dogIndex === -1) return;

  const dogAngle = angleRef.current[dogIndex] % 360;
  const now = Date.now();

  for (const food of foodRef.current) {
    if (food.eaten || now < food.activeAt) continue;

    const diff = Math.abs(food.angle - dogAngle);
    const angleDiff = Math.min(diff, 360 - diff);

    if (angleDiff < 10) {
      food.eaten = true;
      bonusRef.current[dogIndex] += food.bonus;
      effectSetter(dogIndex, 'dog-food');

      setTimeout(() => {
        bonusRef.current[dogIndex] -= food.bonus;
        effectSetter(dogIndex, '');
      }, food.duration);
    }
  }
}

export function useFoxSkill(
  characters: Character[],
  angleRef: React.MutableRefObject<number[]>,
  bonusRef: React.MutableRefObject<number[]>,
  foxSkillTimeRef: React.MutableRefObject<number | null>,
  startTimeRef: React.MutableRefObject<number>,
  effectSetter: (index: number, type: string) => void,
  cooltime: number,
  foxReverseDistance: number
) {
  cooltime = cooltime * 1000;
  const now = Date.now();
  const foxIndex = characters.findIndex((c) => c.id === 'fox');
  // const dogIndex = characters.findIndex((c) => c.id === 'dog');

  if (foxIndex === -1 || !startTimeRef.current) return;
  // if (dogIndex === -1 || !startTimeRef.current) return;

  const lastUsed = foxSkillTimeRef.current;
  const canUse =
    now - startTimeRef.current >= 5000 &&
    (!lastUsed || now - lastUsed >= cooltime);

  if (!canUse) return;

  const sorted = characters
    .map((_, i) => ({
      index: i,
      angle: angleRef.current[i],
    }))
    .filter((c) => c.index !== foxIndex)
    // .filter((c) => c.index !== foxIndex && c.index !== dogIndex)
    .sort((a, b) => b.angle - a.angle);

  const target = sorted[0];
  if (!target) return;

  const idx = target.index;
  // bonusRef.current[idx] -= 2;
  bonusRef.current[idx] -= foxReverseDistance;
  effectSetter(idx, 'foxreverse');

  setTimeout(() => {
    // bonusRef.current[idx] += 2;
    bonusRef.current[idx] += foxReverseDistance;
    effectSetter(idx, '');
  }, 2000);

  foxSkillTimeRef.current = now;
}

export function usePandaSkill(
  characters: Character[],
  angleRef: React.MutableRefObject<number[]>,
  pausedRef: React.MutableRefObject<boolean[]>,
  setPausedList: (list: boolean[]) => void,
  effectSetter: (index: number, type: string) => void,
  pandaSkillTimeRef: React.MutableRefObject<number | null>,
  startTimeRef: React.MutableRefObject<number>,
  cooltime: number,
  pandaStunDuration: number
) {
  cooltime = cooltime * 1000;
  pandaStunDuration = pandaStunDuration * 1000;
  const now = Date.now();
  const pandaIndex = characters.findIndex((c) => c.id === 'panda');
  if (pandaIndex === -1 || !startTimeRef.current) return;

  const lastUsed = pandaSkillTimeRef.current;
  const canUse =
    now - startTimeRef.current >= 3000 &&
    (!lastUsed || now - lastUsed >= cooltime);

  if (!canUse) return;

  // 앞에 있는 캐릭터 찾기
  const pandaAngle = angleRef.current[pandaIndex];
  let closestIndex: number | null = null;
  let closestDiff = Infinity;

  characters.forEach((_, i) => {
    if (i === pandaIndex) return;
    const diff = angleRef.current[i] - pandaAngle;
    if (diff > 0 && diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  });

  if (closestIndex !== null && closestDiff < 50) {
    effectSetter(pandaIndex, 'panda');
    effectSetter(closestIndex, 'panda-hit');

    // 타격 처리: 밀기 + 정지
    angleRef.current[closestIndex] -= 20;
    pausedRef.current[closestIndex] = true;
    setPausedList([...pausedRef.current]);

    setTimeout(() => {
      pausedRef.current[closestIndex!] = false;
      setPausedList([...pausedRef.current]);
      effectSetter(closestIndex!, '');
      // }, 500);
    }, pandaStunDuration);

    setTimeout(() => {
      effectSetter(pandaIndex, '');
      pandaSkillTimeRef.current = Date.now();
    }, 1500);
  }
}
