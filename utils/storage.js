/**
 * WishView - 로컬 스토리지 관리 유틸리티
 * Chrome Storage API를 래핑하여 프로젝트 데이터와 사용자 설정을 관리합니다.
 */

class StorageHelper {
  /**
   * 스토리지 키 상수
   */
  static KEYS = {
    USER_SETTINGS: 'wishview_user_settings',
    VIEWED_PROJECTS: 'wishview_viewed_projects'
  };

  /**
   * 기본 사용자 설정
   */
  static DEFAULT_SETTINGS = {
    autoShow: true,                    // 프라이빗 프로젝트 자동 표시
    showNotifications: true,           // 알림 표시
    theme: 'auto',                     // 테마 (auto, light, dark)
    language: 'ko'                     // 언어
  };

  /**
   * Chrome Storage API 사용 가능 여부 확인
   */
  static isStorageAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }

  /**
   * 스토리지에서 데이터 가져오기
   */
  static async get(key) {
    if (!this.isStorageAvailable()) {
      return this.getFromLocalStorage(key);
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  /**
   * 스토리지에 데이터 저장
   */
  static async set(key, value) {
    if (!this.isStorageAvailable()) {
      return this.setToLocalStorage(key, value);
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 스토리지에서 데이터 제거
   */
  static async remove(key) {
    if (!this.isStorageAvailable()) {
      return this.removeFromLocalStorage(key);
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([key], () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 로컬 스토리지 폴백 - 가져오기
   */
  static getFromLocalStorage(key) {
    try {
      const value = localStorage.getItem(`wishview_${key}`);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * 로컬 스토리지 폴백 - 저장
   */
  static setToLocalStorage(key, value) {
    try {
      localStorage.setItem(`wishview_${key}`, JSON.stringify(value));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 로컬 스토리지 폴백 - 제거
   */
  static removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(`wishview_${key}`);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 사용자 설정 가져오기
   */
  static async getUserSettings() {
    try {
      const settings = await this.get(this.KEYS.USER_SETTINGS);
      return { ...this.DEFAULT_SETTINGS, ...settings };
    } catch (error) {
      return this.DEFAULT_SETTINGS;
    }
  }

  /**
   * 사용자 설정 저장
   */
  static async saveUserSettings(settings) {
    try {
      const currentSettings = await this.getUserSettings();
      const newSettings = { ...currentSettings, ...settings };
      await this.set(this.KEYS.USER_SETTINGS, newSettings);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 특정 설정 값 업데이트
   */
  static async updateSetting(key, value) {
    try {
      const settings = await this.getUserSettings();
      settings[key] = value;
      await this.saveUserSettings(settings);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 프로젝트 조회 이력 관리
   */
  static async markProjectAsViewed(projectId) {
    try {
      const viewedProjects = await this.get(this.KEYS.VIEWED_PROJECTS) || {};
      const now = new Date().toISOString();
      const today = new Date().toDateString();

      // 프로젝트별 조회 정보 구조
      if (!viewedProjects[projectId]) {
        viewedProjects[projectId] = {
          firstViewed: now,
          lastViewed: now,
          viewDates: [today]
        };

        await this.set(this.KEYS.VIEWED_PROJECTS, viewedProjects);
        return { isNewView: true, isNewProject: true };
      } else {
        const projectViews = viewedProjects[projectId];

        // 오늘 이미 본 프로젝트인지 확인
        if (projectViews.viewDates.includes(today)) {
          return { isNewView: false, isNewProject: false };
        } else {
          // 새로운 날짜에 조회
          projectViews.lastViewed = now;
          projectViews.viewDates.push(today);

          // 조회 날짜는 최근 30일만 보관
          if (projectViews.viewDates.length > 30) {
            projectViews.viewDates = projectViews.viewDates.slice(-30);
          }

          await this.set(this.KEYS.VIEWED_PROJECTS, viewedProjects);
          return { isNewView: true, isNewProject: false };
        }
      }
    } catch (error) {
      return { isNewView: true, isNewProject: false }; // 에러 시 안전하게 카운팅
    }
  }

  /**
   * 세션별 프로젝트 조회 여부 확인
   */
  static isProjectViewedInSession(projectId) {
    try {
      const sessionViews = sessionStorage.getItem('wishview_session_views');
      const viewedProjects = sessionViews ? JSON.parse(sessionViews) : [];
      return viewedProjects.includes(projectId);
    } catch (error) {
      return false;
    }
  }

  /**
   * 세션별 프로젝트 조회 기록
   */
  static markProjectViewedInSession(projectId) {
    try {
      const sessionViews = sessionStorage.getItem('wishview_session_views');
      const viewedProjects = sessionViews ? JSON.parse(sessionViews) : [];

      if (!viewedProjects.includes(projectId)) {
        viewedProjects.push(projectId);
        sessionStorage.setItem('wishview_session_views', JSON.stringify(viewedProjects));
        return true; // 새로운 조회
      }

      return false; // 이미 조회함
    } catch (error) {
      return true; // 에러 시 안전하게 카운팅
    }
  }

  /**
   * 모든 데이터 내보내기 (백업용)
   */
  static async exportAllData() {
    try {
      const data = {};

      for (const key of Object.values(this.KEYS)) {
        data[key] = await this.get(key);
      }

      data.exportDate = new Date().toISOString();
      data.version = '1.0.0';

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 데이터 가져오기 (복원용)
   */
  static async importData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('유효하지 않은 데이터 형식입니다.');
      }

      for (const key of Object.values(this.KEYS)) {
        if (data[key]) {
          await this.set(key, data[key]);
        }
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 모든 데이터 삭제
   */
  static async clearAllData() {
    try {
      for (const key of Object.values(this.KEYS)) {
        await this.remove(key);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 스토리지 사용량 확인
   */
  static async getStorageUsage() {
    if (!this.isStorageAvailable()) {
      return { used: 0, total: 0, available: 0 };
    }

    return new Promise((resolve) => {
      chrome.storage.local.getBytesInUse((bytesInUse) => {
        const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB 기본값
        resolve({
          used: bytesInUse,
          total: quota,
          available: quota - bytesInUse,
          usagePercentage: (bytesInUse / quota) * 100
        });
      });
    });
  }
}

// 전역 스코프에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  window.StorageHelper = StorageHelper;
}