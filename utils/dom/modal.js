/**
 * WishView - DOM Modal
 * 모달의 생성, 표시, 숨김 등 핵심 로직을 담당합니다.
 */
class Modal {
  /**
   * 메인 모달 생성 및 표시 함수
   */
  static createAndShowModal(projectData) {
    try {
      const modalHTML = this.createModalHTML(projectData);
      const modal = this.appendModalToDOM(modalHTML);
      const safeZIndex = Number.MAX_SAFE_INTEGER;
      modal.style.zIndex = safeZIndex;
      Event.setupModalEventListeners(modal, projectData);
      this.showModal(modal);
      return modal;
    } catch (error) {
      DOMHelper.showNotification('화면을 표시하는 중 오류가 발생했습니다.', 'error');
      throw error;
    }
  }

  /**
   * 모달 표시
   */
  static showModal(modal) {
    if (modal) {
      modal.style.display = 'flex';
    }

    if (modal && modal.hideTimeout) {
      clearTimeout(modal.hideTimeout);
      modal.hideTimeout = null;
    }

    const existingModals = document.querySelectorAll('.wishview-modal');
    if (existingModals.length > 1) {
      existingModals.forEach((existing, index) => {
        if (existing !== modal) {
          existing.remove();
        }
      });
    }

    const cssLoaded = Fallback.checkCSSLoaded();

    document.body.style.overflow = 'hidden';

    if (!cssLoaded || Fallback.detectComputedStyleIssues(modal)) {
      Fallback.forceShowModalWithJS(modal);
    } else {
      Fallback.applyFallbackStyles(modal);
    }

    if (modal) {
      modal.classList.add('active');

      setTimeout(() => {
        const delayedState = {
          hasActiveClass: modal.classList.contains('active'),
          computedDisplay: getComputedStyle(modal).display,
          computedVisibility: getComputedStyle(modal).visibility,
          computedOpacity: getComputedStyle(modal).opacity,
          computedPosition: getComputedStyle(modal).position,
          computedZIndex: getComputedStyle(modal).zIndex,
          boundingRect: modal.getBoundingClientRect(),
          isVisible: modal.offsetWidth > 0 && modal.offsetHeight > 0
        };

        if (!delayedState.isVisible || delayedState.computedOpacity === '0') {
          modal.style.opacity = '1 !important';
          modal.style.visibility = 'visible !important';
          modal.style.display = 'flex !important';
        }
      }, 50);
    }

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  /**
   * 모달 숨김
   */
  static hideModal(modal) {
    const wishketModalContainers = document.querySelectorAll('.modal__container');
    if (wishketModalContainers.length > 0) {
      wishketModalContainers.forEach(container => {
        container.style.display = 'none';
      });
    }

    document.body.style.overflow = '';

    if (!modal) {
      return;
    }

    modal.classList.remove('active');
    modal.style.display = 'none';
  }

  /**
   * 모달을 DOM에 추가
   */
  static appendModalToDOM(modalHTML) {
    if (!Security.isHTMLSafe(modalHTML)) {
      throw new Error('안전하지 않은 HTML 콘텐츠로 인해 모달 생성이 중단되었습니다.');
    }

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = Security.sanitizeHTML(modalHTML);
    const modal = modalDiv.firstElementChild;

    const existingModal = document.querySelector('.wishview-modal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.appendChild(modal);

    return modal;
  }

  /**
   * 모달 HTML 구조 생성
   */
  static createModalHTML(projectData, context = null) {
    const modalId = 'wishview-modal';
    const modalContext = context || DOMHelper.detectModalContext();

    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }

    let actionButtons = '';

    if (modalContext.isDetailPage) {
      actionButtons = `
        <button class="btn-secondary" id="close-modal">
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
          </svg>
          닫기
        </button>
      `;
    } else if (modalContext.isFromStorage) {
      actionButtons = `
        <button class="btn-secondary" id="close-modal">
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
          </svg>
          닫기
        </button>
        <button class="btn-primary" id="go-to-project">
          원본 페이지로 이동
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </button>
      `;
    }

    const previousProject = Format.extractPreviousProjectLink(projectData.description);
    const previousProjectButton = previousProject ?
      `<button class="btn-tertiary" id="previous-project">
         <svg class="btn-icon" viewBox="0 0 24 24">
           <path d="M7 17L17 7M17 7H7M17 7V17"/>
         </svg>
         예전 프로젝트
       </button>` : '';

    const modalHTML = `
      <div id="${modalId}" class="wishview-modal">
        <div class="wishview-overlay" aria-hidden="true"></div>

        <div class="wishview-container" role="dialog"
             aria-labelledby="modal-title" aria-modal="true">

          <!-- 헤더 영역 -->
          <header class="wishview-header">
            <div class="header-main">
              <div class="header-info">
                <h2 id="modal-title" class="project-title">${Security.escapeHtml(projectData.title)}</h2>
                <div class="project-meta">
                  <span class="project-id">프로젝트 #${projectData.projectId}</span>
                  <span class="project-status">프라이빗 매칭</span>
                </div>
              </div>
              <button class="close-btn" aria-label="모달 닫기">
                <svg class="close-icon" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </header>

          <!-- 주요 정보 영역 -->
          <section class="wishview-summary">
            <div class="summary-grid">
              <div class="budget-info">
                <div class="info-label">예상 금액</div>
                <div class="info-value budget-value">${projectData.budget.formatted}</div>
                <div class="info-note">금액 조율 가능</div>
              </div>

              <div class="duration-info">
                <div class="info-label">고용 유형</div>
                <div class="info-value">${Format.formatEmploymentType(projectData.employmentType)}</div>
                <div class="info-note">${Format.formatWorkHours(projectData.workHours)}</div>
              </div>

              <div class="deadline-info">
                <div class="info-label">모집 마감</div>
                <div class="info-value deadline-value">${projectData.deadline || '미정'}</div>
                <div class="info-note ${projectData.timeRemaining.includes('일') ? 'urgency' : ''}">${projectData.timeRemaining}</div>
              </div>
            </div>
          </section>

          <!-- 콘텐츠 영역 -->
          <main class="wishview-content">
            <div class="content-tabs">
              <button class="tab-btn active" data-tab="description">업무 내용</button>
              <button class="tab-btn" data-tab="requirements">상세 정보</button>
            </div>

            <div class="tab-content">
              <!-- 업무 내용 탭 -->
              <div id="tab-description" class="tab-pane active">
                <div class="description-content">
                  <div class="content-section">
                    <h3 class="section-title">프로젝트 개요</h3>
                    <div class="section-content formatted-text">${Format.formatDescription(projectData.description)}</div>
                  </div>

                  ${projectData.skills.length > 0 ? `
                  <div class="content-section">
                    <h3 class="section-title">기술 스택</h3>
                    <div class="tech-stack">
                      ${projectData.skills.map(skill => `<span class="tech-tag">${Security.escapeHtml(skill)}</span>`).join('')}
                    </div>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- 상세 정보 탭 -->
              <div id="tab-requirements" class="tab-pane">
                <div class="requirements-content">
                  <div class="content-section">
                    <h3 class="section-title">모집 요건</h3>
                    <div class="requirement-grid">
                      <div class="requirement-item">
                        <div class="req-label">고용 유형</div>
                        <div class="req-value">${Format.formatEmploymentType(projectData.employmentType)}</div>
                      </div>
                      <div class="requirement-item">
                        <div class="req-label">근무 시간</div>
                        <div class="req-value">${Format.formatWorkHours(projectData.workHours)}</div>
                      </div>
                      <div class="requirement-item">
                        <div class="req-label">지역</div>
                        <div class="req-value">${projectData.location}</div>
                      </div>
                      <div class="requirement-item">
                        <div class="req-label">등록일</div>
                        <div class="req-value">${projectData.datePosted}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>

          <!-- 액션 영역 -->
          <footer class="wishview-footer">
            <div class="action-buttons">
              ${previousProjectButton}
              ${actionButtons}
            </div>
          </footer>
        </div>
      </div>
    `;

    return modalHTML;
  }
}
