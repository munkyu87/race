import { makeAutoObservable } from 'mobx';
import { GameSettings } from '../types';
import { defaultSettings } from '../constants/defaultSettings';

class SettingsStore {
  settings: GameSettings = defaultSettings;

  constructor() {
    makeAutoObservable(this);
    this.loadFromLocalStorage();
  }

  updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
    this.settings[key] = value;
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem('skillSettings', JSON.stringify(this.settings));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('skillSettings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
  }

  reset() {
    this.settings = { ...defaultSettings };
    this.saveToLocalStorage();
  }
}

export const settingsStore = new SettingsStore();
