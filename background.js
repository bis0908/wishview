/**
 * WishView - Background Script (Service Worker)
 * 확장 프로그램의 생명주기 관리 및 백그라운드 작업 처리
 */

class WishViewBackground {
  constructor() {
    this.activeWishketTabs = new Map();
    this.errorLogs = [];
    this.installationDate = null;

    this.init();
  }

  /**
   * Background Script 초기화
   */
  init() {

    // 확장 설치/업데이트 이벤트
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstalled(details);
    });

    // 확장 시작 이벤트
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // 메시지 리스너 등록
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // 비동기 응답을 위해 true 반환
    });

    // 탭 업데이트 이벤트
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdated(tabId, changeInfo, tab);
    });

    // 탭 제거 이벤트
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      this.handleTabRemoved(tabId, removeInfo);
    });

    // 알람 이벤트 (주기적 작업용)
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });

    // 주기적 정리 작업 설정
    this.setupPeriodicTasks();
  }

  /**
   * 확장 설치/업데이트 처리
   */
  async handleInstalled(details) {

    try {
      if (details.reason === 'install') {
        // 최초 설치
        await this.handleFirstInstall();
      } else if (details.reason === 'update') {
        // 업데이트
        await this.handleUpdate(details.previousVersion);
      }
    } catch (error) {
      console.error('설치/업데이트 처리 실패:', error);
    }
  }

  /**
   * 최초 설치 처리
   */
  async handleFirstInstall() {

    // 기본 설정 저장
    const defaultSettings = {
      autoShow: true,
      showNotifications: true,
      theme: 'auto',
      language: 'ko'
    };

    await this.setStorage('wishview_user_settings', defaultSettings);

    // 설치 날짜 기록
    const installData = {
      installDate: new Date().toISOString(),
      version: '1.0.0'
    };

    await this.setStorage('wishview_install_info', installData);


    // 환영 알림 설정 (설치 후 5초 뒤)
    chrome.alarms.create('welcome-notification', { delayInMinutes: 0.1 });

  }

  /**
   * 업데이트 처리
   */
  async handleUpdate(previousVersion) {

    // 업데이트 로그 기록
    const updateLog = {
      from: previousVersion,
      to: '1.0.0',
      date: new Date().toISOString()
    };

    const updateHistory = await this.getStorage('wishview_update_history') || [];
    updateHistory.push(updateLog);
    await this.setStorage('wishview_update_history', updateHistory);

    // 마이그레이션 로직 (필요시)
    await this.migrateData(previousVersion);

  }

  /**
   * 데이터 마이그레이션
   */
  async migrateData(fromVersion) {

    // 버전별 마이그레이션 로직
    // 현재는 1.0.0이 첫 번째 버전이므로 마이그레이션 없음

    // 예시: 향후 버전 업데이트 시
    // if (fromVersion < '1.1.0') {
    //   // 1.1.0으로 마이그레이션 로직
    // }
  }

  /**
   * 확장 시작 처리
   */
  handleStartup() {

    // 시작 시간 기록
    this.setStorage('wishview_last_startup', new Date().toISOString());

    // 활성 탭 정리
    this.activeWishketTabs.clear();
  }

  /**
   * 메시지 처리
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'ERROR_REPORT':
          await this.handleErrorReport(message.error, sender);
          sendResponse({ success: true });
          break;

        case 'UPDATE_BADGE':
          await this.updateBadge(sender.tab.id, message.text, message.color);
          sendResponse({ success: true });
          break;


        case 'EXPORT_DATA':
          const exportData = await this.exportAllData();
          sendResponse({ success: true, data: exportData });
          break;

        case 'IMPORT_DATA':
          await this.importData(message.data);
          sendResponse({ success: true });
          break;

        case 'CLEAR_DATA':
          await this.clearAllData();
          sendResponse({ success: true });
          break;

        default:
          console.warn('알 수 없는 메시지 타입:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('메시지 처리 실패:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * 탭 업데이트 처리
   */
  handleTabUpdated(tabId, changeInfo, tab) {
    // URL 변경 또는 로딩 완료 시
    if (changeInfo.status === 'complete' && tab.url) {
      this.checkWishketTab(tabId, tab);
    }
  }

  /**
   * 탭 제거 처리
   */
  handleTabRemoved(tabId, removeInfo) {
    // 활성 위시켓 탭 목록에서 제거
    if (this.activeWishketTabs.has(tabId)) {
      this.activeWishketTabs.delete(tabId);
    }
  }

  /**
   * 위시켓 탭 확인 및 관리
   */
  checkWishketTab(tabId, tab) {
    const isWishketProject = /^https:\/\/www\.wishket\.com\/project\/\d+\/$/.test(tab.url);

    if (isWishketProject) {
      if (!this.activeWishketTabs.has(tabId)) {
        this.activeWishketTabs.set(tabId, {
          url: tab.url,
          title: tab.title,
          lastChecked: new Date().toISOString()
        });


        // 배지 업데이트 (선택적)
        this.updateBadge(tabId, '●', '#3BA3C7');
      }
    } else {
      // 위시켓 프로젝트가 아닌 경우 목록에서 제거
      if (this.activeWishketTabs.has(tabId)) {
        this.activeWishketTabs.delete(tabId);
        this.clearBadge(tabId);
      }
    }
  }

  /**
   * 알람 처리
   */
  async handleAlarm(alarm) {

    switch (alarm.name) {
      case 'welcome-notification':
        await this.showWelcomeNotification();
        break;

      case 'periodic-cleanup':
        await this.performPeriodicCleanup();
        break;

      case 'data-backup':
        await this.performDataBackup();
        break;

      default:
        console.warn('알 수 없는 알람:', alarm.name);
    }
  }

  /**
   * 환영 알림 표시
   */
  async showWelcomeNotification() {
    try {
      // 알림 권한 확인
      const permission = await chrome.notifications?.getPermissionLevel?.();

      if (permission === 'granted') {
        chrome.notifications.create('welcome', {
          type: 'basic',
          iconUrl: 'assets/icons/icon-48.png',
          title: 'WishView 설치 완료!',
          message: '위시켓 프라이빗 매칭 프로젝트를 이제 자유롭게 확인하세요.'
        });

        // 5초 후 알림 자동 제거
        setTimeout(() => {
          chrome.notifications.clear('welcome');
        }, 5000);
      }
    } catch (error) {
    }
  }

  /**
   * 주기적 작업 설정
   */
  setupPeriodicTasks() {
    // 하루마다 정리 작업
    chrome.alarms.create('periodic-cleanup', {
      delayInMinutes: 60, // 1시간 후 시작
      periodInMinutes: 1440 // 24시간마다 반복
    });

    // 일주일마다 데이터 백업
    chrome.alarms.create('data-backup', {
      delayInMinutes: 1440, // 24시간 후 시작
      periodInMinutes: 10080 // 7일마다 반복
    });
  }

  /**
   * 주기적 정리 작업
   */
  async performPeriodicCleanup() {

    try {
      // 오래된 에러 로그 정리 (7일 이상)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      this.errorLogs = this.errorLogs.filter(log =>
        new Date(log.timestamp) > sevenDaysAgo
      );

      // 오래된 최근 프로젝트 목록 정리 (100개 이상시 50개만 유지)
      const recentProjects = await this.getStorage('wishview_recent_projects') || [];
      if (recentProjects.length > 100) {
        const trimmedProjects = recentProjects.slice(0, 50);
        await this.setStorage('wishview_recent_projects', trimmedProjects);
      }

      // 사용하지 않는 저장된 프로젝트 정리 (6개월 이상 미접근)
      await this.cleanupOldSavedProjects();

    } catch (error) {
      console.error('정리 작업 실패:', error);
    }
  }

  /**
   * 오래된 저장 프로젝트 정리
   */
  async cleanupOldSavedProjects() {
    const savedProjects = await this.getStorage('wishview_saved_projects') || {};
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

    let cleanedCount = 0;

    for (const [projectId, project] of Object.entries(savedProjects)) {
      const lastAccessed = new Date(project.savedAt || project.lastViewed || 0);

      if (lastAccessed < sixMonthsAgo) {
        delete savedProjects[projectId];
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      await this.setStorage('wishview_saved_projects', savedProjects);
    }
  }

  /**
   * 데이터 백업
   */
  async performDataBackup() {

    try {
      const backupData = await this.exportAllData();
      const backupKey = `wishview_backup_${new Date().toISOString().split('T')[0]}`;

      await this.setStorage(backupKey, {
        data: backupData,
        created: new Date().toISOString(),
        version: '1.0.0'
      });

      // 오래된 백업 정리 (30일 이상)
      await this.cleanupOldBackups();

    } catch (error) {
      console.error('데이터 백업 실패:', error);
    }
  }

  /**
   * 오래된 백업 정리
   */
  async cleanupOldBackups() {
    const allData = await this.getAllStorage();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const [key, value] of Object.entries(allData)) {
      if (key.startsWith('wishview_backup_') && value.created) {
        const backupDate = new Date(value.created);
        if (backupDate < thirtyDaysAgo) {
          await this.removeStorage(key);
        }
      }
    }
  }

  /**
   * 에러 보고 처리
   */
  async handleErrorReport(error, sender) {
    const errorLog = {
      ...error,
      senderTab: sender.tab?.id,
      senderUrl: sender.tab?.url,
      userAgent: navigator.userAgent,
      extensionVersion: '1.0.0'
    };

    this.errorLogs.push(errorLog);

    // 에러 로그가 너무 많으면 오래된 것 제거
    if (this.errorLogs.length > 1000) {
      this.errorLogs = this.errorLogs.slice(-500);
    }

    console.error('에러 보고 수신:', errorLog);

    // 치명적 에러인 경우 배지로 표시
    if (error.context === 'CRITICAL') {
      this.updateBadge(sender.tab?.id, '!', '#EA4335');
    }
  }

  /**
   * 배지 업데이트
   */
  async updateBadge(tabId, text, color) {
    try {
      if (tabId) {
        await chrome.action.setBadgeText({ text, tabId });
        await chrome.action.setBadgeBackgroundColor({ color, tabId });
      }
    } catch (error) {
      console.warn('배지 업데이트 실패:', error);
    }
  }

  /**
   * 배지 제거
   */
  async clearBadge(tabId) {
    try {
      if (tabId) {
        await chrome.action.setBadgeText({ text: '', tabId });
      }
    } catch (error) {
      console.warn('배지 제거 실패:', error);
    }
  }


  /**
   * 모든 데이터 내보내기
   */
  async exportAllData() {
    const allData = await this.getAllStorage();
    const exportData = {};

    // WishView 관련 데이터만 필터링
    for (const [key, value] of Object.entries(allData)) {
      if (key.startsWith('wishview_')) {
        exportData[key] = value;
      }
    }

    return {
      ...exportData,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      errorLogs: this.errorLogs
    };
  }

  /**
   * 데이터 가져오기
   */
  async importData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('유효하지 않은 데이터 형식');
    }

    // WishView 데이터만 가져오기
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('wishview_') && key !== 'wishview_install_info') {
        await this.setStorage(key, value);
      }
    }

  }

  /**
   * 모든 데이터 삭제
   */
  async clearAllData() {
    const allData = await this.getAllStorage();

    for (const key of Object.keys(allData)) {
      if (key.startsWith('wishview_')) {
        await this.removeStorage(key);
      }
    }

    // 메모리 정리
    this.errorLogs = [];
    this.activeWishketTabs.clear();

  }

  /**
   * Storage API 래퍼들
   */
  async getStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  async setStorage(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  async removeStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], resolve);
    });
  }

  async getAllStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, resolve);
    });
  }
}

// Background Script 시작
new WishViewBackground();