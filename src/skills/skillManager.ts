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

export const useFoxSkill = (
  characters: Character[],
  trapsRef: React.MutableRefObject<Trap[]>,
  foxSkillTimeRef: React.MutableRefObject<number | null>,
  startTimeRef: React.MutableRefObject<number>,
  angleRef: React.MutableRefObject<number[]>,
  cooltime: number
) => {
  const foxIndex = characters.findIndex((c) => c.id === 'fox');
  if (foxIndex === -1) return;

  const now = Date.now();
  const lastUsed = foxSkillTimeRef.current;
  const canUse =
    now - startTimeRef.current >= 5000 &&
    (!lastUsed || now - lastUsed >= cooltime);

  if (canUse) {
    const angle = angleRef.current[foxIndex] % 360;
    trapsRef.current.push({
      angle,
      createdAt: now,
      used: false,
      ownerId: characters[foxIndex].id,
    });
    foxSkillTimeRef.current = now;
  }
};

export const checkFoxTrapTrigger = (
  characters: Character[],
  trapsRef: React.MutableRefObject<Trap[]>,
  angleRef: React.MutableRefObject<number[]>,
  pausedRef: React.MutableRefObject<boolean[]>,
  setPausedList: (list: boolean[]) => void,
  setEffectList: React.Dispatch<React.SetStateAction<string[]>>,
  foxTrapDuration: number
) => {
  const now = Date.now();
  characters.forEach((_, i) => {
    trapsRef.current.forEach((trap) => {
      const angleDiff = Math.abs((angleRef.current[i] % 360) - trap.angle);

      if (
        !trap.used &&
        trap.ownerId !== characters[i].id &&
        now - trap.createdAt >= 1000 && // 생성 1초 이후부터 발동
        angleDiff < 10
      ) {
        trap.used = true;

        // 2초간 정지 처리
        const newPaused = [...pausedRef.current];
        newPaused[i] = true;
        pausedRef.current = newPaused;
        setPausedList(newPaused);

        // 이펙트
        setEffectList((prev) => {
          const updated = [...prev];
          updated[i] = 'foxtrap';
          return updated;
        });

        setTimeout(() => {
          const resumed = [...pausedRef.current];
          resumed[i] = false;
          pausedRef.current = resumed;
          setPausedList(resumed);

          setEffectList((prev) => {
            const updated = [...prev];
            updated[i] = '';
            return updated;
          });
        }, foxTrapDuration);
      }
    });
  });
};
// export const checkFoxTrapTrigger = (
//   characters: Character[],
//   trapsRef: React.MutableRefObject<Trap[]>,
//   angleRef: React.MutableRefObject<number[]>,
//   bonusRef: React.MutableRefObject<number[]>,
//   setEffectList: React.Dispatch<React.SetStateAction<string[]>>
// ) => {
//   const now = Date.now();
//   characters.forEach((_, i) => {
//     trapsRef.current.forEach((trap) => {
//       const angleDiff = Math.abs((angleRef.current[i] % 360) - trap.angle);

//       // ✅ 발동 조건 추가: 생성 후 1초 이상 경과 & 주인 아님 & 각도 근접 & 미사용
//       const canTrigger =
//         !trap.used &&
//         trap.ownerId !== characters[i].id &&
//         angleDiff < 10 &&
//         now - trap.createdAt >= 1000; // 🔥 여기 핵심!

//       if (canTrigger) {
//         trap.used = true;
//         bonusRef.current[i] -= 2.5;

//         setEffectList((prev) => {
//           const updated = [...prev];
//           updated[i] = 'foxtrap';
//           return updated;
//         });

//         setTimeout(() => {
//           bonusRef.current[i] += 2.5;
//           setEffectList((prev) => {
//             const updated = [...prev];
//             updated[i] = '';
//             return updated;
//           });
//         }, 5000);
//       }
//     });
//   });
// };
