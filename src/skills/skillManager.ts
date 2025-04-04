import { MutableRefObject, RefObject } from 'react';
import { Character, RankingItem } from '../types';

type DogSkillState = {
  phase: 'idle' | 'charging' | 'boosting';
  lastUsed: number | null;
};

interface Trap {
  angle: number;
  triggered: boolean;
}

// 고양이 스킬 (앞지르기)
export function useCatSkill(
  characters: Character[],
  angleList: number[],
  lapRef: RefObject<number[]>,
  effectSetter: (index: number, type: string) => void,
  skillTimeRef: React.MutableRefObject<number | null>,
  startTimeRef: RefObject<number>,
  catSkillCooltime: number
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
  horseSkillCooltime: number
) {
  const horseIndex = characters.findIndex((c) => c.id === 'horse');
  const now = Date.now();

  if (
    horseIndex !== -1 &&
    lastBoostRef.current !== null &&
    now - lastBoostRef.current >= horseSkillCooltime &&
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
  startTimeRef: RefObject<number>,
  pigSkillCooltime: number,
  dogSkillStateRef: MutableRefObject<{
    phase: 'idle' | 'charging' | 'boosting';
    lastUsed: number | null;
  }>
) {
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
    const paused = characters.map((_, i) => i !== pigIndex);

    pausedRef.current = paused;
    setPausedList(paused);

    setTimeout(() => {
      const resumed = characters.map((_, i) => {
        if (i === dogIndex && dogSkillStateRef.current.phase === 'charging') {
          return true;
        }
        return false;
      });

      pausedRef.current = resumed;
      setPausedList(resumed);
    }, 1000);

    effectSetter(pigIndex, 'pig');
    pigSkillTimeRef.current = now;
  }
}

export function useDogSkill(
  characters: Character[],
  bonusRef: RefObject<number[]>,
  pausedRef: React.MutableRefObject<boolean[]>,
  setPausedList: (list: boolean[]) => void,
  effectSetter: (index: number, type: string) => void,
  dogSkillStateRef: React.MutableRefObject<DogSkillState>,
  startTimeRef: RefObject<number>,
  dogSkillCooltime: number
) {
  const dogIndex = characters.findIndex((c) => c.id === 'dog');
  if (dogIndex === -1 || !startTimeRef.current) return;

  const now = Date.now();
  const state = dogSkillStateRef.current;

  const canUse = state.phase === 'idle';
  if (canUse) {
    state.phase = 'charging';
    state.lastUsed = now;

    // 1단계: 멈춤
    const paused = [...pausedRef.current];
    paused[dogIndex] = true;
    pausedRef.current = paused;
    setPausedList([...paused]);
    effectSetter(dogIndex, 'charge');

    // 2단계: n초 후 질주 시작
    setTimeout(() => {
      paused[dogIndex] = false;
      pausedRef.current = paused;
      setPausedList([...paused]);

      bonusRef.current![dogIndex] += 4;
      state.phase = 'boosting';
      effectSetter(dogIndex, 'dog');

      // 3단계: m초 후 보너스 원상복구 + 상태 초기화
      setTimeout(() => {
        bonusRef.current![dogIndex] -= 4;
        state.phase = 'idle';
      }, 8000);
    }, dogSkillCooltime);
  }
}

export function useFoxSkill(
  characters: Character[],
  angleRef: RefObject<number[]>,
  bonusRef: RefObject<number[]>,
  effectSetter: (index: number, type: string) => void,
  foxSkillTimeRef: MutableRefObject<number | null>,
  startTimeRef: RefObject<number>,
  foxSkillCooltime: number,
  trapsRef: RefObject<Trap[]>,
  addTrapEffect: (angle: number) => void
) {
  const now = Date.now();
  const foxIndex = characters.findIndex((c) => c.id === 'fox');
  if (foxIndex === -1 || !startTimeRef.current || !angleRef.current) return;

  const lastUsed = foxSkillTimeRef.current;
  const canUse = !lastUsed || now - lastUsed >= foxSkillCooltime * 1000;

  if (canUse) {
    // 트랩 설치 (현재 여우 위치 기준)
    const foxAngle = angleRef.current[foxIndex];
    const trap: Trap = { angle: foxAngle + 60, triggered: false }; // +60도 앞에 설치
    if (trapsRef.current) {
      trapsRef.current.push(trap);
      addTrapEffect(trap.angle);
      foxSkillTimeRef.current = now;
    }
  }

  // 모든 캐릭터 트랩 밟았는지 체크
  characters.forEach((char, i) => {
    if (i === foxIndex || !angleRef.current) return;
    const charAngle = angleRef.current[i];
    if (trapsRef.current) {
      trapsRef.current.forEach((trap) => {
        if (!trap.triggered && Math.abs(trap.angle - charAngle) < 10) {
          // 트랩 발동
          trap.triggered = true;
          bonusRef.current![i] -= 2; // 속도 감소 (절반 효과 느낌)
          effectSetter(i, 'foxtrap');
          setTimeout(() => {
            bonusRef.current![i] += 2;
          }, 5000);
        }
      });
    }
  });
}
