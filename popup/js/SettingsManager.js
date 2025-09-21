/**
 * WishView - 설정 관리자
 * 사용자 설정 및 사용 통계 관리를 담당
 */

class SettingsManager {
  /**
   * 사용자 설정 로드
   * @returns {Promise<Object>} 사용자 설정 객체
   */
  static async loadUserSettings() {
    try {
      return await StorageHelper.getUserSettings();
    } catch (error) {
      return {
        autoShow: true,
        showNotifications: true,
        theme: 'auto',
        language: 'ko'
      };
    }
  }


  /**
   * 설정 업데이트
   * @param {string} key - 설정 키
   * @param {any} value - 설정 값
   * @param {chrome.tabs.Tab} currentTab - 현재 탭 (Content Script 알림용)
   * @returns {Promise<Object>} 업데이트된 전체 설정
   */
  static async updateSetting(key, value, currentTab) {
    try {
      // 현재 설정 로드
      const currentSettings = await this.loadUserSettings();

      // 설정 업데이트
      const updatedSettings = { ...currentSettings, [key]: value };
      await StorageHelper.updateUserSettings({ [key]: value });

      // Content Script에 설정 변경 알림
      if (currentTab) {
        await MessageHelper.notifySettingsUpdate(currentTab, updatedSettings);
      }

      return updatedSettings;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 여러 설정 한번에 업데이트
   * @param {Object} settings - 업데이트할 설정들
   * @param {chrome.tabs.Tab} currentTab - 현재 탭
   * @returns {Promise<Object>} 업데이트된 전체 설정
   */
  static async updateMultipleSettings(settings, currentTab) {
    try {
      await StorageHelper.updateUserSettings(settings);

      const updatedSettings = await this.loadUserSettings();

      // Content Script에 설정 변경 알림
      if (currentTab) {
        await MessageHelper.notifySettingsUpdate(currentTab, updatedSettings);
      }

      return updatedSettings;
    } catch (error) {
      throw error;
    }
  }





  /**
   * 설정 초기화
   * @param {chrome.tabs.Tab} currentTab - 현재 탭
   * @returns {Promise<Object>} 초기화된 설정
   */
  static async resetSettings(currentTab) {
    const defaultSettings = {
      autoShow: true,
      showNotifications: true,
      theme: 'auto',
      language: 'ko'
    };

    try {
      await StorageHelper.set('wishview_user_settings', defaultSettings);

      // Content Script에 설정 변경 알림
      if (currentTab) {
        await MessageHelper.notifySettingsUpdate(currentTab, defaultSettings);
      }

      return defaultSettings;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 전체 데이터 초기화 (개발/테스트용)
   * @returns {Promise<void>}
   */
  static async resetAllData() {
    if (!confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      // 모든 저장된 데이터 삭제
      await Promise.all([
        StorageHelper.set('wishview_user_settings', null),
        StorageHelper.set('wishview_saved_projects', null),
      ]);

      DOMHelper.showSuccessMessage('모든 데이터가 초기화되었습니다.');
    } catch (error) {
      throw error;
    }
  }
}

// 전역 접근을 위한 window 객체에 등록
window.SettingsManager = SettingsManager;