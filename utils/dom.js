/**
 * WishView - DOM 조작 헬퍼 유틸리티
 * 모달 생성, 이벤트 처리, UI 업데이트 등을 담당합니다.
 */

class DOMHelper {
  // Nuclear Option 상태 관리
  static isNuclearOptionActive = false;
  static hiddenElementsCount = 0;
  static originalBodyStyle = '';

  // 예외 처리 관련 변수
  static safetyTimer = null;
  static modalObserver = null;
  static exceptionHandlersInitialized = false;

  /**
   * 모달 컨텍스트 감지
   */
  static detectModalContext() {
    return {
      isDetailPage: window.location.href.includes('/project/') &&
                    !document.referrer.includes('chrome-extension://'),
      isFromStorage: document.referrer.includes('chrome-extension://') ||
                     window.opener, // 저장소에서 열린 경우
      isDirectAccess: !document.referrer || document.referrer === window.location.href
    };
  }

  /**
   * 예전 프로젝트 링크 추출
   */
  static extractPreviousProjectLink(description) {
    return Format.extractPreviousProjectLink(description);
  }

  /**
   * HTML 콘텐츠 안전성 검증
   * @param {string} html - 검증할 HTML 문자열
   * @returns {boolean} 안전한 HTML인지 여부
   */
  static isHTMLSafe(html) {
    return Security.isHTMLSafe(html);
  }

  /**
   * HTML 콘텐츠 살균 처리
   * @param {string} html - 살균할 HTML 문자열
   * @returns {string} 살균된 HTML
   */
  static sanitizeHTML(html) {
    return Security.sanitizeHTML(html);
  }

  /**
   * 안전한 요소 생성
   * @param {string} tagName - 태그 이름
   * @param {Object} attributes - 속성 객체
   * @param {string} textContent - 텍스트 내용
   * @returns {HTMLElement} 생성된 요소
   */
  static createSafeElement(tagName, attributes = {}, textContent = '') {
    return Security.createSafeElement(tagName, attributes, textContent);
  }

  /**
   * 모달 HTML 구조 생성
   */
  static createModalHTML(projectData, context = null) {
    return Modal.createModalHTML(projectData, context);
  }

  /**
   * HTML 이스케이프 (XSS 방지)
   */
  static escapeHtml(text) {
    return Security.escapeHtml(text);
  }

  /**
   * 설명 텍스트 포맷팅
   */
  static formatDescription(description) {
    return Format.formatDescription(description);
  }

  /**
   * 고용 유형 포맷팅
   */
  static formatEmploymentType(employmentType) {
    return Format.formatEmploymentType(employmentType);
  }

  /**
   * 근무 시간 포맷팅
   */
  static formatWorkHours(workHours) {
    return Format.formatWorkHours(workHours);
  }

  /**
   * 모달을 DOM에 추가
   */
  static appendModalToDOM(modalHTML) {
    return Modal.appendModalToDOM(modalHTML);
  }

  /**
   * 모달 표시
   */
  static showModal(modal) {
    return Modal.showModal(modal);
  }

  /**
   * 모달 숨김
   */
  static hideModal(modal) {
    return Modal.hideModal(modal);
  }

  /**
   * 탭 전환 기능
   */
  static setupTabSwitching(modal) {
    return Event.setupTabSwitching(modal);
  }

  /**
   * 모달 이벤트 리스너 설정
   */
  static setupModalEventListeners(modal, projectData) {
    return Event.setupModalEventListeners(modal, projectData);
  }


  /**
   * 간단한 알림 표시
   */
  static showNotification(message, type = 'info') {
    return Misc.showNotification(message, type);
  }

  /**
   * 메인 모달 생성 및 표시 함수
   */
  static createAndShowModal(projectData) {
    return Modal.createAndShowModal(projectData);
  }

  /**
   * DOM 로딩 완료 대기
   */
  static waitForDOMReady() {
    return Misc.waitForDOMReady();
  }

  /**
   * 페이지의 최고 z-index 값 찾기
   */
  static getHighestZIndex() {
    return Misc.getHighestZIndex();
  }

  /**
   * CSS 로딩 상태 확인 (강화된 진단 버전)
   */
  static checkCSSLoaded() {
    return Fallback.checkCSSLoaded();
  }

  /**
   * document.styleSheets 분석
   */
  static analyzeStyleSheets() {
    return Fallback.analyzeStyleSheets();
  }

  /**
   * getComputedStyle 이상 상태 감지
   */
  static detectComputedStyleIssues(element) {
    return Fallback.detectComputedStyleIssues(element);
  }

  /**
   * CSS 미로드 시 fallback 스타일 적용
   */
  static applyFallbackStyles(modal) {
    return Fallback.applyFallbackStyles(modal);
  }

  /**
   * JavaScript로 직접 모달 표시 (CSS 완전 우회)
   */
  static forceShowModalWithJS(modal) {
    return Fallback.forceShowModalWithJS(modal);
  }

  /**
   * 자식 요소들 강제 스타일 적용
   */
  static forceChildElementStyles(modal) {
    return Fallback.forceChildElementStyles(modal);
  }

  /**
   * 최후 수단: 페이지의 모든 요소 숨기고 모달만 표시 (개선된 버전)
   */
  static applyNuclearOption(modal) {
    return State.applyNuclearOption(modal);
  }

  /**
   * 페이지 상태 안전 복원 (개선된 버전)
   */
  static restorePageState() {
    return State.restorePageState();
  }

  /**
   * 긴급 모달 복원 (디버깅용 - 기존 호환성 유지)
   */
  static emergencyRestore() {
    return State.emergencyRestore();
  }

  /**
   * 예외 상황 처리 시스템 초기화
   */
  static initializeExceptionHandlers() {

    // 페이지 언로드 시 자동 복원
    window.addEventListener('beforeunload', () => {
    });

    // 페이지 숨김 시 자동 복원 (탭 전환, 최소화 등)
    document.addEventListener('visibilitychange', () => {
    });

    // ESC 키 이벤트 처리
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isNuclearOptionActive) {
        const modal = document.querySelector('.wishview-modal');
        if (modal) {
          this.hideModal(modal);
        }
      }
    });

    // 브라우저 창 크기 변경 시 모달 위치 조정
    window.addEventListener('resize', this.debounce(() => {
      if (this.isNuclearOptionActive) {
        const modal = document.querySelector('.wishview-modal');
        if (modal) {
          // 모달이 화면 중앙에 오도록 재조정
          modal.style.setProperty('width', '100vw', 'important');
          modal.style.setProperty('height', '100vh', 'important');
        }
      }
    }, 250));

    // 페이지 오류 시 자동 복원
    window.addEventListener('error', (event) => {
    });

    // unhandledrejection 이벤트 처리
    window.addEventListener('unhandledrejection', (event) => {
    });

  }

  /**
   * 타이머 기반 안전 장치 (최대 10분 후 자동 복원)
   */
  static setupSafetyTimer() {
    if (this.isNuclearOptionActive && !this.safetyTimer) {

      this.safetyTimer = setTimeout(() => {
        this.restorePageState();
        this.showNotification('모달이 너무 오래 열려있어 페이지를 복원했습니다.', 'info');
      }, 10 * 60 * 1000); // 10분
    }
  }

  /**
   * 안전 타이머 해제
   */
  static clearSafetyTimer() {
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
  }

  /**
   * 모달 생명주기 모니터링
   */
  static monitorModalLifecycle() {
    // MutationObserver로 모달 DOM 변경 감지
    if (!this.modalObserver) {
      this.modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const removedNodes = Array.from(mutation.removedNodes);
            const hasModalRemoved = removedNodes.some(node =>
              node.classList && node.classList.contains('wishview-modal')
            );

            if (hasModalRemoved && this.isNuclearOptionActive) {
              this.restorePageState();
            }
          }
        });
      });

      this.modalObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

    }
  }

  /**
   * 디바운스 함수
   */
  static debounce(func, wait) {
    return Misc.debounce(func, wait);
  }
}

// 전역 스코프에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  window.DOMHelper = DOMHelper;

  // 디버깅용 전역 함수들
  window.wishviewEmergencyRestore = () => DOMHelper.emergencyRestore();
  window.wishviewForceShow = (modal) => {
    const modalElement = modal || document.querySelector('.wishview-modal');
    if (modalElement) {
      DOMHelper.forceShowModalWithJS(modalElement);
    } else {
    }
  };
  window.wishviewStatus = () => {
  };
  window.wishviewInit = () => {
    if (!DOMHelper.exceptionHandlersInitialized) {
      DOMHelper.initializeExceptionHandlers();
      DOMHelper.exceptionHandlersInitialized = true;
    } else {
    }
  };
}