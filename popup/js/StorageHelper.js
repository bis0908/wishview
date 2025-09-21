/**
 * WishView - 스토리지 관리 헬퍼
 * Chrome Extension Storage API를 래핑하여 일관된 스토리지 인터페이스 제공
 */

class StorageHelper {
  /**
   * 스토리지에서 데이터 가져오기
   * @param {string} key - 가져올 데이터의 키
   * @returns {Promise<any>} 저장된 데이터
   */
  static get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result[key]);
      });
    });
  }

  /**
   * 스토리지에 데이터 저장
   * @param {string} key - 저장할 데이터의 키
   * @param {any} value - 저장할 데이터
   * @returns {Promise<void>}
   */
  static set(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }

  /**
   * 스토리지에서 여러 키의 데이터 가져오기
   * @param {string[]} keys - 가져올 데이터 키 배열
   * @returns {Promise<Object>} 키-값 쌍 객체
   */
  static getMultiple(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result);
      });
    });
  }

  /**
   * 사용자 설정 로드
   * @returns {Promise<Object>} 사용자 설정 객체
   */
  static async getUserSettings() {
    const settings = await this.get('wishview_user_settings');
    return settings || {
      autoShow: true,
      showNotifications: true,
      theme: 'auto',
      language: 'ko'
    };
  }

  /**
   * 사용자 설정 업데이트
   * @param {Object} settings - 업데이트할 설정 객체
   * @returns {Promise<void>}
   */
  static async updateUserSettings(settings) {
    const currentSettings = await this.getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await this.set('wishview_user_settings', updatedSettings);
  }



}

// 전역 접근을 위한 window 객체에 등록
window.StorageHelper = StorageHelper;