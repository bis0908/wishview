/**
 * DynamicDetector - 동적 페이지 변경 감지 모듈
 * URL 변경 및 DOM 변경을 감지하여 프로젝트 재검사를 트리거합니다.
 */
class DynamicDetector {
  constructor(onPageChange) {
    this.onPageChange = onPageChange;
    this.observer = null;
    this.currentUrl = window.location.href;
    this.isInitialized = false;

    // 디바운스된 체크 함수들
    this.debouncedUrlCheck = null;
    this.debouncedDomCheck = null;
  }

  /**
   * 동적 감지 시스템 초기화
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // 디바운스 함수 생성
      this.createDebouncedFunctions();

      // URL 변경 감지 설정
      this.setupUrlChangeDetection();

      // DOM 변경 감지 설정
      this.setupMutationObserver();

      this.isInitialized = true;
    } catch (error) {
    }
  }

  /**
   * 디바운스된 함수들 생성
   */
  createDebouncedFunctions() {
    // URL 변경 체크용 디바운스 함수
    this.debouncedUrlCheck = window.DOMHelper?.debounce(() => {
      if (window.location.href !== this.currentUrl) {
        this.currentUrl = window.location.href;
        this.handlePageChange('url_change');
      }
    }, 500);

    // DOM 변경 체크용 디바운스 함수
    this.debouncedDomCheck = window.DOMHelper?.debounce(() => {
      this.handlePageChange('dom_change');
    }, 1000);

    // DOMHelper가 없는 경우 기본 디바운스 구현
    if (!this.debouncedUrlCheck) {
      this.debouncedUrlCheck = this.createDebounce(() => {
        if (window.location.href !== this.currentUrl) {
          this.currentUrl = window.location.href;
            this.handlePageChange('url_change');
        }
      }, 500);
    }

    if (!this.debouncedDomCheck) {
      this.debouncedDomCheck = this.createDebounce(() => {
        this.handlePageChange('dom_change');
      }, 1000);
    }
  }

  /**
   * 기본 디바운스 함수 구현
   * @param {Function} func - 실행할 함수
   * @param {number} delay - 지연 시간
   * @returns {Function} 디바운스된 함수
   */
  createDebounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * URL 변경 감지 설정
   */
  setupUrlChangeDetection() {
    // History API 이벤트 감지
    window.addEventListener('popstate', this.debouncedUrlCheck);

    // pushState/replaceState 후킹
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      this.debouncedUrlCheck && this.debouncedUrlCheck();
    }.bind(this);

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      this.debouncedUrlCheck && this.debouncedUrlCheck();
    }.bind(this);
  }

  /**
   * DOM 변경 감지 설정
   */
  setupMutationObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (this.shouldTriggerRecheck(mutation)) {
          this.debouncedDomCheck();
          break;
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 재검사를 트리거해야 하는 DOM 변경인지 확인
   * @param {MutationRecord} mutation - 변경 기록
   * @returns {boolean} 재검사 트리거 여부
   */
  shouldTriggerRecheck(mutation) {
    if (mutation.addedNodes.length === 0) {
      return false;
    }

    return Array.from(mutation.addedNodes).some(node => {
      if (node.nodeType !== 1) return false; // Element 노드만 확인

      // 프라이빗 박스 동적 추가 감지
      if (node.querySelector && node.querySelector('.float-private-box')) {
        return true;
      }

      // JSON-LD 스크립트 추가 감지
      if (node.tagName === 'SCRIPT' && node.type === 'application/ld+json') {
        return true;
      }

      return false;
    });
  }

  /**
   * 페이지 변경 처리
   * @param {string} changeType - 변경 유형 ('url_change' | 'dom_change')
   */
  handlePageChange(changeType) {
    try {

      if (typeof this.onPageChange === 'function') {
        // DOM 업데이트 대기 후 콜백 실행
        const delay = changeType === 'url_change' ? 1500 : 500;
        setTimeout(() => {
          this.onPageChange(changeType);
        }, delay);
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * 감지 기능 일시 중지
   */
  pause() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * 감지 기능 재개
   */
  resume() {
    if (this.isInitialized) {
      this.setupMutationObserver();
    }
  }

  /**
   * 현재 URL 반환
   * @returns {string} 현재 URL
   */
  getCurrentUrl() {
    return this.currentUrl;
  }

  /**
   * 초기화 상태 확인
   * @returns {boolean} 초기화 여부
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * 리소스 정리
   */
  destroy() {
    // MutationObserver 해제
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // 이벤트 리스너 제거
    if (this.debouncedUrlCheck) {
      window.removeEventListener('popstate', this.debouncedUrlCheck);
    }

    // History API 복원 (원래 함수로 되돌리기는 복잡하므로 생략)

    // 상태 초기화
    this.isInitialized = false;
    this.onPageChange = null;
    this.debouncedUrlCheck = null;
    this.debouncedDomCheck = null;

  }
}

// 전역 접근을 위한 export
window.DynamicDetector = DynamicDetector;