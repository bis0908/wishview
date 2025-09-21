/**
 * WishView - 팝업 인터페이스 로직
 * 확장 프로그램 아이콘 클릭 시 표시되는 팝업 UI 관리
 */

class WishViewPopup {
  constructor() {
    this.currentTab = null;
    this.contentScriptData = null;
    this.settings = null;

    // DOM 요소 참조
    this.elements = {
      statusIcon: document.getElementById('statusIcon'),
      statusTitle: document.getElementById('statusTitle'),
      statusSubtitle: document.getElementById('statusSubtitle'),

      privateProjectActions: document.getElementById('privateProjectActions'),
      generalActions: document.getElementById('generalActions'),

      showModalBtn: document.getElementById('showModalBtn'),
      refreshBtn: document.getElementById('refreshBtn'),
      goToWishketBtn: document.getElementById('goToWishketBtn'),


      autoShowToggle: document.getElementById('autoShowToggle'),
      notificationsToggle: document.getElementById('notificationsToggle'),


      feedbackBtn: document.getElementById('feedbackBtn'),
      aboutBtn: document.getElementById('aboutBtn'),

      loadingOverlay: document.getElementById('loadingOverlay'),

      projectPreview: document.getElementById('projectPreview'),
      previewTitle: document.getElementById('previewTitle'),
      previewBudget: document.getElementById('previewBudget'),
      previewDeadline: document.getElementById('previewDeadline'),
      previewTech: document.getElementById('previewTech'),
      previewCloseBtn: document.getElementById('previewCloseBtn'),
      openProjectBtn: document.getElementById('openProjectBtn')
    };

    // UI 관리자 초기화
    this.uiManager = new UIManager(this.elements);

    // 콜백 설정
    this.setupCallbacks();

    this.init();
  }

  /**
   * 콜백 함수 설정
   */
  setupCallbacks() {
  }

  /**
   * 팝업 초기화
   */
  async init() {
    try {
      this.uiManager.showLoading();

      // 현재 활성 탭 정보 가져오기
      await this.getCurrentTab();

      // 사용자 설정 로드
      await this.loadUserSettings();

      // Content Script 상태 확인
      await this.checkContentScriptStatus();

      // 이벤트 리스너 설정
      this.setupEventListeners();

      // UI 업데이트
      this.updateUI();

      this.uiManager.hideLoading();

    } catch (error) {
      console.error('팝업 초기화 실패:', error);
      this.uiManager.showError('초기화 중 오류가 발생했습니다.');
      this.uiManager.hideLoading();
    }
  }

  /**
   * 현재 활성 탭 정보 가져오기
   */
  async getCurrentTab() {
    this.currentTab = await MessageHelper.getCurrentTab();
  }

  /**
   * 사용자 설정 로드
   */
  async loadUserSettings() {
    this.settings = await SettingsManager.loadUserSettings();
  }

  /**
   * Content Script 상태 확인
   */
  async checkContentScriptStatus() {
    const result = await MessageHelper.checkContentScriptStatus(this.currentTab);

    this.uiManager.updateStatus(result.status, result.title, result.subtitle);

    if (result.data) {
      this.contentScriptData = result.data;
    }
  }



  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 프라이빗 프로젝트 보기 버튼
    this.elements.showModalBtn?.addEventListener('click', () => {
      this.showProjectModal();
    });

    // 새로고침 버튼
    this.elements.refreshBtn?.addEventListener('click', () => {
      this.refreshContentScript();
    });

    // 위시켓 바로가기 버튼
    this.elements.goToWishketBtn?.addEventListener('click', () => {
      this.openWishket();
    });


    // 설정 토글들
    this.elements.autoShowToggle?.addEventListener('change', (e) => {
      this.updateSetting('autoShow', e.target.checked);
    });

    this.elements.notificationsToggle?.addEventListener('change', (e) => {
      this.updateSetting('showNotifications', e.target.checked);
    });

    // 하단 링크들
    this.elements.feedbackBtn?.addEventListener('click', () => {
      ProjectManager.openFeedback(this.currentTab);
    });

    this.elements.aboutBtn?.addEventListener('click', () => {
      ProjectManager.showAbout();
    });

    // 프로젝트 미리보기 닫기
    this.elements.previewCloseBtn?.addEventListener('click', () => {
      this.uiManager.hideProjectPreview();
    });

    this.elements.openProjectBtn?.addEventListener('click', () => {
      ProjectManager.openSelectedProject(this.elements.openProjectBtn);
    });
  }

  /**
   * UI 업데이트
   */
  updateUI() {
    this.uiManager.updateUI({
      contentScriptData: this.contentScriptData,
      settings: this.settings
    });
  }

  /**
   * 프로젝트 모달 표시
   */
  async showProjectModal() {
    try {
      await ProjectManager.showProjectModal(this.currentTab, this.contentScriptData);
    } catch (error) {
      this.uiManager.showError(error.message);
    }
  }

  /**
   * Content Script 새로고침
   */
  async refreshContentScript() {
    try {
      this.uiManager.showLoading();
      const success = await ProjectManager.refreshContentScript(this.currentTab);

      if (success) {
        // 상태 재확인
        setTimeout(() => {
          this.checkContentScriptStatus();
          this.uiManager.hideLoading();
        }, 1000);
      } else {
        this.uiManager.hideLoading();
        this.uiManager.showError('새로고침에 실패했습니다.');
      }
    } catch (error) {
      this.uiManager.hideLoading();
      this.uiManager.showError(error.message);
    }
  }

  /**
   * 위시켓 사이트 열기
   */
  openWishket() {
    ProjectManager.openWishket();
  }


  /**
   * 설정 업데이트
   */
  async updateSetting(key, value) {
    try {
      this.settings = await SettingsManager.updateSetting(key, value, this.currentTab);
    } catch (error) {
      console.error('설정 업데이트 실패:', error);
    }
  }

}

// 팝업 DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  new WishViewPopup();
});