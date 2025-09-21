/**
 * WishView - UI 관리자
 * 팝업 UI의 렌더링 및 상태 업데이트를 담당
 */

class UIManager {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * 상태 업데이트
   * @param {string} type - 상태 타입 (active, waiting, inactive, error)
   * @param {string} title - 상태 제목
   * @param {string} subtitle - 상태 부제목
   */
  updateStatus(type, title, subtitle) {
    const iconMap = {
      active: '✅',
      waiting: '⏳',
      inactive: '❌',
      error: '⚠️'
    };

    if (this.elements.statusIcon) {
      this.elements.statusIcon.textContent = iconMap[type] || '❓';
    }

    if (this.elements.statusTitle) {
      this.elements.statusTitle.textContent = title;
    }

    if (this.elements.statusSubtitle) {
      this.elements.statusSubtitle.textContent = subtitle;
    }
  }

  /**
   * 로딩 표시
   */
  showLoading() {
    DOMHelper.showElement(this.elements.loadingOverlay);
  }

  /**
   * 로딩 숨김
   */
  hideLoading() {
    DOMHelper.hideElement(this.elements.loadingOverlay);
  }

  /**
   * 에러 메시지 표시
   * @param {string} message - 에러 메시지
   */
  showError(message) {
    this.updateStatus('error', '오류 발생', message);
  }

  /**
   * UI 전체 업데이트
   * @param {Object} data - 업데이트 데이터
   */
  updateUI(data) {
    const { contentScriptData, settings } = data;

    // 상태에 따른 액션 섹션 표시/숨김
    if (contentScriptData?.hasProject) {
      DOMHelper.showElement(this.elements.privateProjectActions);
      DOMHelper.hideElement(this.elements.generalActions);
    } else {
      DOMHelper.hideElement(this.elements.privateProjectActions);
      DOMHelper.showElement(this.elements.generalActions);
    }

    // 설정 체크박스 상태
    if (settings) {
      this.updateSettingsUI(settings);
    }
  }

  /**
   * 설정 UI 업데이트
   * @param {Object} settings - 설정 객체
   */
  updateSettingsUI(settings) {
    if (this.elements.autoShowToggle) {
      this.elements.autoShowToggle.checked = settings.autoShow;
    }
    if (this.elements.notificationsToggle) {
      this.elements.notificationsToggle.checked = settings.showNotifications;
    }
  }

  /**
   * 프로젝트 미리보기 표시
   * @param {Object} project - 프로젝트 정보
   */
  showProjectPreview(project) {
    if (!this.elements.projectPreview) return;

    this.elements.previewTitle.textContent = project.title;
    this.elements.previewBudget.textContent = `예산: ${project.budget?.formatted || '미정'}`;
    this.elements.previewDeadline.textContent = `마감: ${project.deadline || '미정'}`;

    // 기술 스택 렌더링
    if (this.elements.previewTech && project.skills) {
      this.elements.previewTech.innerHTML = project.skills
        .slice(0, 3) // 최대 3개만
        .map(skill => `<span class="preview-tech-tag">${DOMHelper.escapeHtml(skill)}</span>`)
        .join('');
    }

    // 프로젝트 ID 저장 (열기 버튼용)
    this.elements.openProjectBtn.setAttribute('data-project-id', project.projectId);

    DOMHelper.showElement(this.elements.projectPreview);
  }

  /**
   * 프로젝트 미리보기 숨김
   */
  hideProjectPreview() {
    DOMHelper.hideElement(this.elements.projectPreview);
  }
}

// 전역 접근을 위한 window 객체에 등록
window.UIManager = UIManager;