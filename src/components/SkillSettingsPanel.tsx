import React from 'react';
import { Typography, Slider } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { settingsStore } from '../stores/settingsStore';

const SkillSettingsPanel = () => {
  const renderDualSlider = (
    label: string,
    icon: string,
    cooltimeKey: keyof typeof settingsStore.settings,
    cooltimeLabel: string,
    valueKey: keyof typeof settingsStore.settings,
    valueLabel: string,
    min1: number,
    max1: number,
    min2: number,
    max2: number,
    step: number,
    suffix: string = 's'
  ) => (
    <>
      <Typography gutterBottom>
        {icon} {label}
      </Typography>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem',
          width: '20rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <Typography variant="body2">
            {cooltimeLabel} : {settingsStore.settings[cooltimeKey]}s
          </Typography>
          <Slider
            value={settingsStore.settings[cooltimeKey] as number}
            onChange={(e, val) =>
              settingsStore.updateSetting(cooltimeKey, val as number)
            }
            min={min1}
            max={max1}
            step={1}
            valueLabelDisplay="auto"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography variant="body2">
            {valueLabel} : {settingsStore.settings[valueKey]}
          </Typography>
          <Slider
            value={settingsStore.settings[valueKey] as number}
            onChange={(e, val) =>
              settingsStore.updateSetting(valueKey, val as number)
            }
            min={min2}
            max={max2}
            step={step}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {renderDualSlider(
        '말',
        '🐴',
        'horseSkillCooltime',
        '스킬 쿨타임',
        'horseBoostAmount',
        '속도 증가량',
        3,
        20,
        0.1,
        1,
        0.1
      )}
      {renderDualSlider(
        '고양이',
        '🐱',
        'catSkillCooltime',
        '스킬 쿨타임',
        'catSpeedBonus',
        '가속 보너스',
        3,
        20,
        10,
        30,
        1
      )}
      {renderDualSlider(
        '돼지',
        '🐷',
        'pigSkillCooltime',
        '스킬 쿨타임',
        'pigPauseDuration',
        '기절 시간',
        3,
        20,
        1,
        5,
        0.5
      )}
      {renderDualSlider(
        '강아지',
        '🐶',
        'dogSkillCooltime',
        '스킬 쿨타임',
        'dogBoostSpeed',
        '부스터 속도',
        3,
        20,
        1,
        10,
        1
      )}
      {renderDualSlider(
        '판다',
        '🐼',
        'pandaSkillCooltime',
        '스킬 쿨타임',
        'pandaStunDuration',
        '기절 시간',
        3,
        20,
        1,
        5,
        0.5
      )}
      {renderDualSlider(
        '여우',
        '🦊',
        'foxSkillCooltime',
        '스킬 쿨타임',
        'foxReverseDistance',
        '마이너스 속도',
        3,
        20,
        1,
        10,
        1,
        'px'
      )}
    </>
  );
};

export default observer(SkillSettingsPanel);
