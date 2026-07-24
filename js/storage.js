/**
 * Storage Manager for SkillInterview
 * Handles persistent state for bookmarks, mastered questions, and app settings.
 */

const STORAGE_KEYS = {
  STARRED: 'skillinterview_starred_v1',
  MASTERED: 'skillinterview_mastered_v1',
  APP_MODE: 'skillinterview_mode_v1'
};

export class StorageManager {
  static getStarred() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STARRED)) || [];
    } catch {
      return [];
    }
  }

  static toggleStar(questionId) {
    const starred = this.getStarred();
    const index = starred.indexOf(questionId);
    if (index === -1) {
      starred.push(questionId);
    } else {
      starred.splice(index, 1);
    }
    localStorage.setItem(STORAGE_KEYS.STARRED, JSON.stringify(starred));
    return starred.includes(questionId);
  }

  static isStarred(questionId) {
    return this.getStarred().includes(questionId);
  }

  static getMastered() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED)) || [];
    } catch {
      return [];
    }
  }

  static toggleMastered(questionId) {
    const mastered = this.getMastered();
    const index = mastered.indexOf(questionId);
    if (index === -1) {
      mastered.push(questionId);
    } else {
      mastered.splice(index, 1);
    }
    localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(mastered));
    return mastered.includes(questionId);
  }

  static isMastered(questionId) {
    return this.getMastered().includes(questionId);
  }

  static getMode() {
    return localStorage.getItem(STORAGE_KEYS.APP_MODE) || 'mobile';
  }

  static setMode(mode) {
    localStorage.setItem(STORAGE_KEYS.APP_MODE, mode);
  }
}
