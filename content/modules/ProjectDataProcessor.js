/**
 * ProjectDataProcessor - 프로젝트 데이터 추출 및 처리 모듈
 * 위시켓 프로젝트 페이지에서 데이터를 추출하고 모달을 생성하는 기능을 담당합니다.
 */
class ProjectDataProcessor {
  constructor() {
    this.currentProjectData = null;
    this.modalElement = null;
  }

  /**
   * WishView 활성화 조건 확인
   * @param {Object} settings - 사용자 설정
   * @returns {boolean} 활성화 여부
   */
  shouldActivateWishView(settings) {
    const checks = {
      isCorrectUrl: window.JSONLDParser?.isWishketProjectPage() || false,
      isPrivateProject: window.JSONLDParser?.isPrivateProject() || false,
      hasJsonLd: document.querySelectorAll('script[type="application/ld+json"]').length >= 2,
      notAlreadyActive: !document.getElementById('wishview-modal'),
      autoShowEnabled: settings?.autoShow !== false
    };

    // console.log('WishView 활성화 체크:', checks);
    return Object.values(checks).every(check => check === true);
  }

  /**
   * 프로젝트 데이터 추출 및 모달 표시
   * @param {Object} settings - 사용자 설정
   * @returns {Object} 추출 결과
   */
  async extractAndShowProject(settings) {
    try {
      // console.log('프로젝트 데이터 추출 시작...');

      // 의존성 검사
      if (!this.validateDependencies()) {
        throw new Error('필요한 의존성이 로드되지 않았습니다.');
      }

      // 1. 모집 종료 프로젝트 체크 (최우선)
      if (window.JSONLDParser.isClosedProject()) {
        // console.log('모집 종료된 프로젝트 감지됨');
        if (window.DOMHelper) {
          window.DOMHelper.showNotification('이미 모집 마감한 프로젝트입니다.', 'info');
        }
        return { success: false, reason: 'closed_project' };
      }

      // 2. 프로젝트 데이터 추출
      const extractResult = window.JSONLDParser.extractProjectData();
      if (!extractResult.success) {
        throw new Error(extractResult.error || '프로젝트 데이터 추출 실패');
      }

      // 2-1. 추출된 데이터 검증 및 정리
      const validatedData = this.validateAndSanitizeProjectData(extractResult.data);
      if (!validatedData) {
        throw new Error('프로젝트 데이터 검증 실패 - 안전하지 않은 데이터 감지');
      }

      this.currentProjectData = validatedData;
      // console.log('추출 및 검증된 프로젝트 데이터:', this.currentProjectData);

      // 3. 모달 생성 및 표시
      this.modalElement = window.DOMHelper.createAndShowModal(this.currentProjectData);

      // 4. 통계 및 기록 업데이트
      await this.updateStats(settings);

      // 5. 알림 표시
      if (settings.showNotifications) {
        this.showSuccessNotification();
      }

      return {
        success: true,
        projectData: this.currentProjectData,
        modalElement: this.modalElement
      };

    } catch (error) {
      console.error('프로젝트 데이터 추출 중 오류:', error);
      return {
        success: false,
        error: error.message,
        errorCode: 'EXTRACTION_ERROR'
      };
    }
  }

  /**
   * 필요한 의존성 검사
   * @returns {boolean} 의존성 로드 여부
   */
  validateDependencies() {
    if (!window.JSONLDParser) {
      console.error('JSONLDParser가 로드되지 않았습니다.');
      return false;
    }

    if (!window.DOMHelper) {
      console.error('DOMHelper가 로드되지 않았습니다.');
      return false;
    }

    return true;
  }

  /**
   * 프로젝트 데이터 검증 및 정리
   * @param {Object} data - 추출된 프로젝트 데이터
   * @returns {Object|null} 검증된 데이터 또는 null
   */
  validateAndSanitizeProjectData(data) {
    if (!data || typeof data !== 'object') {
      console.error('프로젝트 데이터가 유효하지 않습니다:', data);
      return null;
    }

    // 필수 필드 검증
    const requiredFields = ['title', 'projectId'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      console.error('필수 필드 누락:', missingFields);
      return null;
    }

    // 로컬 파일 경로 패턴 검사
    if (this.containsUnsafeContent(data)) {
      console.warn('안전하지 않은 콘텐츠 감지, 정리 중...');
      return this.sanitizeProjectData(data);
    }

    return data;
  }

  /**
   * 안전하지 않은 콘텐츠 감지
   * @param {Object} data - 검사할 데이터
   * @returns {boolean} 안전하지 않은 콘텐츠 포함 여부
   */
  containsUnsafeContent(data) {
    const unsafePatterns = [
      /[A-Za-z]:\\/,                    // Windows 드라이브 경로
      /file:\/\/\//,                    // file:// 프로토콜
      /Pictures[\/\\]picpick/i,         // PicPick 경로
      /<script[^>]*>/i,                 // 스크립트 태그
      /javascript:/i,                   // JavaScript 프로토콜
      /on\w+\s*=/i                      // 이벤트 핸들러 속성
    ];

    // 재귀적으로 모든 문자열 값 검사
    const checkValue = (value) => {
      if (typeof value === 'string') {
        return unsafePatterns.some(pattern => pattern.test(value));
      } else if (Array.isArray(value)) {
        return value.some(item => checkValue(item));
      } else if (value && typeof value === 'object') {
        return Object.values(value).some(item => checkValue(item));
      }
      return false;
    };

    return checkValue(data);
  }

  /**
   * 프로젝트 데이터 정리
   * @param {Object} data - 정리할 데이터
   * @returns {Object} 정리된 데이터
   */
  sanitizeProjectData(data) {
    const sanitize = (value) => {
      if (typeof value === 'string') {
        return value
          // 로컬 파일 경로 제거
          .replace(/[A-Za-z]:[^\s]*\.(png|jpe?g|gif)/gi, '[image]')
          .replace(/file:\/\/\/[^\s"]+/gi, '[file]')
          .replace(/Pictures[\/\\]picpick[\/\\][^\s"]+/gi, '[screenshot]')
          // 위험한 HTML/JS 제거
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:[^"'\s]*/gi, '')
          .replace(/on\w+\s*=\s*[^"'\s>]*/gi, '');
      } else if (Array.isArray(value)) {
        return value.map(item => sanitize(item));
      } else if (value && typeof value === 'object') {
        const sanitized = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitize(val);
        }
        return sanitized;
      }
      return value;
    };

    return sanitize(data);
  }

  /**
   * 사용 통계 및 기록 업데이트
   * @param {Object} settings - 사용자 설정
   */
  async updateStats(settings) {
    try {
      if (!window.StorageHelper) {
        console.warn('StorageHelper를 사용할 수 없어 통계 업데이트를 건너뜁니다.');
        return;
      }


    } catch (error) {
      console.warn('통계 업데이트 실패:', error);
    }
  }

  /**
   * 성공 알림 표시
   */
  showSuccessNotification() {
    if (window.DOMHelper && this.currentProjectData) {
      window.DOMHelper.showNotification(
        `프라이빗 프로젝트 "${this.currentProjectData.title}" 정보를 불러왔습니다.`,
        'success'
      );
    }
  }

  /**
   * 모달 표시/숨김 제어
   * @param {boolean} show - 표시 여부
   */
  toggleModal(show) {
    if (!this.modalElement || !window.DOMHelper) {
      return false;
    }

    if (show) {
      window.DOMHelper.showModal(this.modalElement);
    } else {
      window.DOMHelper.hideModal(this.modalElement);
    }

    return true;
  }

  /**
   * 모달이 현재 표시되어 있는지 확인
   * @returns {boolean} 표시 여부
   */
  isModalVisible() {
    return this.modalElement?.classList.contains('active') || false;
  }

  /**
   * 현재 프로젝트 데이터 반환
   * @returns {Object|null} 프로젝트 데이터
   */
  getCurrentProjectData() {
    return this.currentProjectData;
  }

  /**
   * 모달 엘리먼트 반환
   * @returns {Element|null} 모달 엘리먼트
   */
  getModalElement() {
    return this.modalElement;
  }

  /**
   * 리소스 정리
   */
  cleanup() {
    // 모달 제거
    if (this.modalElement) {
      if (window.DOMHelper) {
        window.DOMHelper.hideModal(this.modalElement);
      } else if (this.modalElement.parentNode) {
        this.modalElement.parentNode.removeChild(this.modalElement);
      }
      this.modalElement = null;
    }

    // 프로젝트 데이터 초기화
    this.currentProjectData = null;
  }

  /**
   * 활성 상태 확인
   * @returns {boolean} 활성화 여부
   */
  isActive() {
    return !!(this.currentProjectData && this.modalElement);
  }
}

// 전역 접근을 위한 export
window.ProjectDataProcessor = ProjectDataProcessor;