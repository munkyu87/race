import { MutableRefObject, RefObject } from 'react';
import { Character, RankingItem } from '../types';

// 고양이 스킬 (앞지르기)
export function useCatSkill(
  characters: Character[],
  angleList: number[],
  lapRef: RefObject<number[]>,
  effectSetter: (index: number, type: string) => void,
  skillTimeRef: React.MutableRefObject<number | null>,
  startTimeRef: RefObject<number>
) {
  const catIndex = characters.findIndex((c) => c.id === 'cat');
  const now = Date.now();
  const lastUsed = skillTimeRef.current;
  if (!startTimeRef.current) return;
  const elapsed = now - startTimeRef.current;

  const lapList = lapRef.current;
  const lapValid = lapList && lapList[catIndex] >= 1;

  const canUse =
    catIndex !== -1 &&
    lapValid &&
    elapsed >= 5000 &&
    (!lastUsed || now - lastUsed >= 5000);

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
  effectTrigger: () => void
) {
  const horseIndex = characters.findIndex((c) => c.id === 'horse');
  const now = Date.now();

  if (
    horseIndex !== -1 &&
    lastBoostRef.current !== null &&
    now - lastBoostRef.current >= 8000 &&
    bonusRef.current
  ) {
    bonusRef.current[horseIndex] += 0.2;
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
  startTimeRef: RefObject<number>
) {
  const pigIndex = characters.findIndex((c) => c.id === 'pig');
  const now = Date.now();
  if (!startTimeRef.current) return;
  const elapsed = now - startTimeRef.current;
  const lastUsed = pigSkillTimeRef.current;

  const canUse =
    pigIndex !== -1 && elapsed >= 7000 && (!lastUsed || now - lastUsed >= 7000);

  if (canUse) {
    const paused = characters.map((_, i) => i !== pigIndex);
    pausedRef.current = paused;
    setPausedList(paused);

    setTimeout(() => {
      const resumed = characters.map(() => false);
      pausedRef.current = resumed;
      setPausedList(resumed);
    }, 1000);

    effectSetter(pigIndex, 'pig');
    pigSkillTimeRef.current = now;
  }
}
