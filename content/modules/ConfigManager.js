/**
 * ConfigManager - 사용자 설정 관리 모듈
 * 설정 로드, 저장, 유효성 검사를 담당합니다.
 */
class ConfigManager {
  constructor() {
    this.defaultSettings = {
      autoShow: true,
      showNotifications: true,
      theme: 'auto',
      language: 'ko'
    };
  }

  /**
   * 사용자 설정 로드
   * @returns {Object} 사용자 설정 객체
   */
  async loadUserSettings() {
    try {
      if (window.StorageHelper) {
        const settings = await window.StorageHelper.getUserSettings();
        return this.validateSettings(settings);
      } else {
        console.warn('StorageHelper를 사용할 수 없어 기본 설정을 사용합니다.');
        return this.defaultSettings;
      }
    } catch (error) {
      console.warn('설정 로드 실패, 기본값 사용:', error);
      return this.defaultSettings;
    }
  }

  /**
   * 사용자 설정 저장
   * @param {Object} newSettings - 새로운 설정
   * @returns {Object} 저장된 설정
   */
  async saveUserSettings(newSettings) {
    try {
      const validatedSettings = this.validateSettings(newSettings);

      if (window.StorageHelper) {
        await window.StorageHelper.saveUserSettings(validatedSettings);
        // console.log('설정 저장 완료:', validatedSettings);
        return validatedSettings;
      } else {
        console.warn('StorageHelper를 사용할 수 없어 설정 저장에 실패했습니다.');
        return validatedSettings;
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 설정 유효성 검사 및 기본값 병합
   * @param {Object} settings - 검사할 설정
   * @returns {Object} 유효한 설정 객체
   */
  validateSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      return { ...this.defaultSettings };
    }

    return {
      autoShow: typeof settings.autoShow === 'boolean' ? settings.autoShow : this.defaultSettings.autoShow,
      showNotifications: typeof settings.showNotifications === 'boolean' ? settings.showNotifications : this.defaultSettings.showNotifications,
      theme: ['auto', 'light', 'dark'].includes(settings.theme) ? settings.theme : this.defaultSettings.theme,
      language: ['ko', 'en'].includes(settings.language) ? settings.language : this.defaultSettings.language
    };
  }

  /**
   * 설정 업데이트 (기존 설정과 병합)
   * @param {Object} currentSettings - 현재 설정
   * @param {Object} updateSettings - 업데이트할 설정
   * @returns {Object} 병합된 설정
   */
  updateSettings(currentSettings, updateSettings) {
    const mergedSettings = { ...currentSettings, ...updateSettings };
    return this.validateSettings(mergedSettings);
  }

  /**
   * 기본 설정으로 리셋
   * @returns {Object} 기본 설정
   */
  getDefaultSettings() {
    return { ...this.defaultSettings };
  }
}

// 전역 접근을 위한 export
window.ConfigManager = ConfigManager;