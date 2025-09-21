/**
 * MessageHandler - Chrome Extension 메시지 처리 모듈
 * Extension과의 통신 및 메시지 라우팅을 담당합니다.
 */
class MessageHandler {
  constructor(projectProcessor, configManager) {
    this.projectProcessor = projectProcessor;
    this.configManager = configManager;
    this.isListenerRegistered = false;

    // 메시지 핸들러 바인딩
    this.handleRuntimeMessage = this.handleRuntimeMessage.bind(this);
  }

  /**
   * 메시지 리스너 설정
   */
  setupMessageListeners() {
    if (typeof chrome !== 'undefined' && chrome.runtime && !this.isListenerRegistered) {
      chrome.runtime.onMessage.addListener(this.handleRuntimeMessage);
      this.isListenerRegistered = true;
    }
  }

  /**
   * Runtime 메시지 처리
   * @param {Object} message - 수신된 메시지
   * @param {Object} sender - 발신자 정보
   * @param {Function} sendResponse - 응답 함수
   * @returns {boolean} 비동기 응답 여부
   */
  handleRuntimeMessage(message, sender, sendResponse) {

    try {
      switch (message.type) {
        case 'GET_PROJECT_DATA':
          this.handleGetProjectData(sendResponse);
          break;

        case 'SHOW_MODAL':
          this.handleShowModal(sendResponse);
          break;

        case 'HIDE_MODAL':
          this.handleHideModal(sendResponse);
          break;

        case 'TOGGLE_MODAL':
          this.handleToggleModal(sendResponse);
          break;

        case 'UPDATE_SETTINGS':
          this.handleUpdateSettings(message.settings, sendResponse);
          break;

        case 'FORCE_REFRESH':
          this.handleForceRefresh(sendResponse);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }

    return true; // 비동기 응답을 위해 true 반환
  }

  /**
   * 프로젝트 데이터 조회 처리
   * @param {Function} sendResponse - 응답 함수
   */
  async handleGetProjectData(sendResponse) {
    try {
      // 위시켓 프라이빗 프로젝트 페이지인지 확인 (마감 여부 무관)
      const isPrivatePage = window.JSONLDParser?.isWishketProjectPage() &&
                            window.JSONLDParser?.isPrivateProject();

      const response = {
        success: true,
        hasProject: this.projectProcessor.isActive() || isPrivatePage,
        projectData: this.projectProcessor.getCurrentProjectData(),
        settings: this.configManager ? await this.configManager.loadUserSettings() : null,
        isClosedProject: window.JSONLDParser?.isClosedProject() || false
      };

      sendResponse(response);
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
        errorCode: 'GET_PROJECT_DATA_ERROR'
      });
    }
  }

  /**
   * 모달 표시 처리
   * @param {Function} sendResponse - 응답 함수
   */
  async handleShowModal(sendResponse) {
    try {
      const currentData = this.projectProcessor.getCurrentProjectData();
      const modalElement = this.projectProcessor.getModalElement();

      if (currentData && modalElement && window.DOMHelper) {
        // 기존 모달이 있으면 표시
        window.DOMHelper.showModal(modalElement);
        sendResponse({ success: true });
      } else {
        // 새로 추출하여 표시
        const settings = await this.configManager.loadUserSettings();
        const result = await this.projectProcessor.extractAndShowProject(settings);

        if (result.success) {
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: result.error });
        }
      }
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
        errorCode: 'SHOW_MODAL_ERROR'
      });
    }
  }

  /**
   * 모달 숨김 처리
   * @param {Function} sendResponse - 응답 함수
   */
  handleHideModal(sendResponse) {
    try {
      const success = this.projectProcessor.toggleModal(false);
      sendResponse({ success });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
        errorCode: 'HIDE_MODAL_ERROR'
      });
    }
  }

  /**
   * 모달 토글 처리
   * @param {Function} sendResponse - 응답 함수
   */
  async handleToggleModal(sendResponse) {
    try {
      if (this.projectProcessor.isActive()) {
        // 기존 모달이 있으면 토글
        const isVisible = this.projectProcessor.isModalVisible();
        this.projectProcessor.toggleModal(!isVisible);
        sendResponse({ success: true });
      } else {
        // 새로 추출하여 표시
        const settings = await this.configManager.loadUserSettings();
        const result = await this.projectProcessor.extractAndShowProject(settings);

        sendResponse({
          success: result.success,
          error: result.error
        });
      }
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
        errorCode: 'TOGGLE_MODAL_ERROR'
      });
    }
  }

  /**
   * 설정 업데이트 처리
   * @param {Object} newSettings - 새로운 설정
   * @param {Function} sendResponse - 응답 함수
   */
  async handleUpdateSettings(newSettings, sendResponse) {
    try {
      if (!this.configManager) {
        throw new Error('ConfigManager가 초기화되지 않았습니다.');
      }

      const currentSettings = await this.configManager.loadUserSettings();
      const updatedSettings = this.configManager.updateSettings(currentSettings, newSettings);
      await this.configManager.saveUserSettings(updatedSettings);

      sendResponse({ success: true, settings: updatedSettings });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
        errorCode: 'UPDATE_SETTINGS_ERROR'
      });
    }
  }

  /**
   * 강제 새로고침 처리
   * @param {Function} sendResponse - 응답 함수
   */
  async handleForceRefresh(sendResponse) {
    try {
      // 기존 상태 정리
      this.projectProcessor.cleanup();

      // 잠시 후 재검사
      setTimeout(async () => {
        try {
          const settings = await this.configManager.loadUserSettings();
          if (this.projectProcessor.shouldActivateWishView(settings)) {
            await this.projectProcessor.extractAndShowProject(settings);
          }
        } catch (error) {
          // 재검사 과정에서 발생하는 일시적 오류는 무시
        }
      }, 100);

      sendResponse({ success: true });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
        errorCode: 'FORCE_REFRESH_ERROR'
      });
    }
  }

  /**
   * 에러 보고
   * @param {Error} error - 에러 객체
   * @param {string} context - 에러 컨텍스트
   */
  reportError(error, context = '') {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'ERROR_REPORT',
        error: {
          message: error.message,
          context: context,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      }).catch(() => {
        // Background script와 연결 실패는 무시 (확장이 비활성화된 경우)
      });
    }
  }

  /**
   * 메시지 리스너 해제
   */
  removeMessageListeners() {
    if (typeof chrome !== 'undefined' && chrome.runtime && this.isListenerRegistered) {
      chrome.runtime.onMessage.removeListener(this.handleRuntimeMessage);
      this.isListenerRegistered = false;
    }
  }

  /**
   * 모듈 상태 확인
   * @returns {Object} 상태 정보
   */
  getStatus() {
    return {
      isListenerRegistered: this.isListenerRegistered,
      hasProjectProcessor: !!this.projectProcessor,
      hasConfigManager: !!this.configManager,
      isChromeExtensionContext: typeof chrome !== 'undefined' && !!chrome.runtime
    };
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.removeMessageListeners();
    this.projectProcessor = null;
    this.configManager = null;
  }
}

// 전역 접근을 위한 export
window.MessageHandler = MessageHandler;