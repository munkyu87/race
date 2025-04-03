import { makeAutoObservable } from 'mobx';
import { GameSettings } from '../types';
import { defaultSettings } from '../constants/defaultSettings';

class SettingsStore {
  settings: GameSettings = defaultSettings;

  constructor() {
    makeAutoObservable(this);
  }

  updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
    this.settings[key] = value;
  }

  reset() {
    this.settings = defaultSettings;
  }
}

export const settingsStore = new SettingsStore();
