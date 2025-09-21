/**
 * WishViewController - 메인 컨트롤러 클래스
 * 모든 모듈을 조정하고 WishView의 전체적인 라이프사이클을 관리합니다.
 */
class WishViewController {
  constructor() {
    // 모듈 인스턴스들
    this.configManager = null;
    this.projectProcessor = null;
    this.dynamicDetector = null;
    this.messageHandler = null;

    // 상태 관리
    this.isInitialized = false;
    this.initializationPromise = null;

    // 에러 처리를 위한 바인딩
    this.handleError = this.handleError.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  /**
   * WishView 컨트롤러 초기화
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  async initialize() {
    // 중복 초기화 방지
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      return await this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return await this.initializationPromise;
  }

  /**
   * 실제 초기화 로직
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  async _doInitialize() {
    try {

      // 1. DOM 준비 대기
      await this.waitForDOMReady();

      // 2. 의존성 확인
      if (!this.checkDependencies()) {
        throw new Error('필요한 의존성이 로드되지 않았습니다.');
      }

      // 3. 모듈 인스턴스 생성
      await this.createModuleInstances();

      // 4. 초기 프로젝트 검사 및 실행
      await this.performInitialCheck();

      // 5. 동적 감지 시스템 설정
      this.setupDynamicDetection();

      // 6. 메시지 리스너 등록
      this.setupMessageListeners();

      this.isInitialized = true;
      return true;

    } catch (error) {
      this.handleError(error, 'INITIALIZATION');
      return false;
    }
  }

  /**
   * DOM 로딩 완료 대기
   * @returns {Promise<void>}
   */
  waitForDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
      } else {
        const handleLoad = () => {
          document.removeEventListener('DOMContentLoaded', handleLoad);
          window.removeEventListener('load', handleLoad);
          resolve();
        };
        document.addEventListener('DOMContentLoaded', handleLoad);
        window.addEventListener('load', handleLoad);
      }
    });
  }

  /**
   * 필요한 의존성 확인
   * @returns {boolean} 의존성 로드 여부
   */
  checkDependencies() {
    const dependencies = [
      'ConfigManager',
      'ProjectDataProcessor',
      'DynamicDetector',
      'MessageHandler'
    ];

    for (const dep of dependencies) {
      if (!window[dep]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 모듈 인스턴스 생성
   */
  async createModuleInstances() {
    try {
      // ConfigManager 생성 및 설정 로드
      this.configManager = new window.ConfigManager();

      // ProjectDataProcessor 생성
      this.projectProcessor = new window.ProjectDataProcessor();

      // DynamicDetector 생성 (페이지 변경 콜백 전달)
      this.dynamicDetector = new window.DynamicDetector(this.handlePageChange);

      // MessageHandler 생성 (의존성 주입)
      this.messageHandler = new window.MessageHandler(
        this.projectProcessor,
        this.configManager
      );

    } catch (error) {
      throw error;
    }
  }

  /**
   * 초기 프로젝트 검사 및 실행
   */
  async performInitialCheck() {
    try {
      const settings = await this.configManager.loadUserSettings();

      if (this.projectProcessor.shouldActivateWishView(settings)) {
        const result = await this.projectProcessor.extractAndShowProject(settings);

        if (result.success) {
        } else {
        }
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * 동적 감지 시스템 설정
   */
  setupDynamicDetection() {
    if (this.dynamicDetector) {
      this.dynamicDetector.initialize();
    }
  }

  /**
   * 메시지 리스너 설정
   */
  setupMessageListeners() {
    if (this.messageHandler) {
      this.messageHandler.setupMessageListeners();
    }
  }

  /**
   * 페이지 변경 처리 콜백
   * @param {string} changeType - 변경 유형
   */
  async handlePageChange(changeType) {
    try {

      // 기존 모달 정리
      this.projectProcessor.cleanup();

      // 새 페이지에서 재검사
      const settings = await this.configManager.loadUserSettings();
      if (this.projectProcessor.shouldActivateWishView(settings)) {
        await this.projectProcessor.extractAndShowProject(settings);
      }
    } catch (error) {
      this.handleError(error, 'PAGE_CHANGE');
    }
  }

  /**
   * 컨트롤러 상태 조회
   * @returns {Object} 상태 정보
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      modules: {
        configManager: !!this.configManager,
        projectProcessor: !!this.projectProcessor,
        dynamicDetector: !!this.dynamicDetector && this.dynamicDetector.isReady(),
        messageHandler: !!this.messageHandler
      },
      project: {
        isActive: this.projectProcessor?.isActive() || false,
        hasData: !!this.projectProcessor?.getCurrentProjectData(),
        isModalVisible: this.projectProcessor?.isModalVisible() || false
      }
    };
  }

  /**
   * 강제 새로고침
   */
  async forceRefresh() {
    try {

      // 기존 상태 정리
      this.projectProcessor?.cleanup();

      // 재검사 실행
      await this.performInitialCheck();

    } catch (error) {
      this.handleError(error, 'FORCE_REFRESH');
    }
  }

  /**
   * 설정 업데이트
   * @param {Object} newSettings - 새로운 설정
   * @returns {Object} 업데이트된 설정
   */
  async updateSettings(newSettings) {
    try {
      if (!this.configManager) {
        throw new Error('ConfigManager가 초기화되지 않았습니다.');
      }

      const currentSettings = await this.configManager.loadUserSettings();
      const updatedSettings = this.configManager.updateSettings(currentSettings, newSettings);
      await this.configManager.saveUserSettings(updatedSettings);

      return updatedSettings;
    } catch (error) {
      this.handleError(error, 'SETTINGS_UPDATE');
      throw error;
    }
  }

  /**
   * 에러 처리
   * @param {Error} error - 에러 객체
   * @param {string} context - 에러 컨텍스트
   */
  handleError(error, context = '') {
    const errorCode = `WISHVIEW_${context.toUpperCase()}_ERROR`;

    const errorMessages = {
      INITIALIZATION: '확장 프로그램 초기화 중 오류가 발생했습니다.',
      EXTRACTION: '프로젝트 정보를 불러오는 중 오류가 발생했습니다.',
      UI_CREATION: '화면을 표시하는 중 오류가 발생했습니다.',
      SETTINGS_UPDATE: '설정을 처리하는 중 오류가 발생했습니다.',
      PAGE_CHANGE: '페이지 변경 처리 중 오류가 발생했습니다.',
      FORCE_REFRESH: '새로고침 처리 중 오류가 발생했습니다.'
    };

    const userMessage = errorMessages[context.toUpperCase()] || '알 수 없는 오류가 발생했습니다.';

    // 사용자에게 알림 표시 (UI_CREATION 오류가 아닌 경우에만)
    if (context !== 'UI_CREATION' && window.DOMHelper) {
      const settings = this.configManager?.defaultSettings || { showNotifications: true };
      if (settings.showNotifications) {
        window.DOMHelper.showNotification(userMessage, 'error');
      }
    }

    // Chrome Extension 컨텍스트에서 background script에 오류 보고
    if (this.messageHandler) {
      this.messageHandler.reportError(error, context);
    }
  }

  /**
   * 리소스 정리 및 인스턴스 해제
   */
  destroy() {

    // 동적 감지 시스템 해제
    if (this.dynamicDetector) {
      this.dynamicDetector.destroy();
      this.dynamicDetector = null;
    }

    // 메시지 핸들러 해제
    if (this.messageHandler) {
      this.messageHandler.destroy();
      this.messageHandler = null;
    }

    // 프로젝트 프로세서 정리
    if (this.projectProcessor) {
      this.projectProcessor.cleanup();
      this.projectProcessor = null;
    }

    // 설정 관리자 해제
    this.configManager = null;

    // 상태 초기화
    this.isInitialized = false;
    this.initializationPromise = null;

  }
}

// 전역 접근을 위한 export
window.WishViewController = WishViewController;