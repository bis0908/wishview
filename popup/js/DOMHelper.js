/**
 * WishView - DOM 조작 헬퍼
 * DOM 요소 제어 및 UI 관련 유틸리티 함수 제공
 */

class DOMHelper {
  /**
   * 요소 표시
   * @param {HTMLElement} element - 표시할 요소
   */
  static showElement(element) {
    if (element) {
      element.style.display = '';
    }
  }

  /**
   * 요소 숨김
   * @param {HTMLElement} element - 숨길 요소
   */
  static hideElement(element) {
    if (element) {
      element.style.display = 'none';
    }
  }

  /**
   * HTML 이스케이프
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  static escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 설명 텍스트 포맷팅
   * @param {string} description - 포맷팅할 설명
   * @returns {string} 포맷팅된 HTML
   */
  static formatDescription(description) {
    return description.split('\n').map(line => this.escapeHtml(line)).join('<br>');
  }

  /**
   * 성공 메시지 표시
   * @param {string} message - 표시할 메시지
   */
  static showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #34A853;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
      font-size: 14px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * 작은 크기 모달 표시
   * @param {string} title - 모달 제목
   * @param {string} content - 모달 내용
   */
  static showCompactModal(title, content) {
    // 기존 모달 제거
    const existingModal = document.querySelector('.compact-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'compact-modal';
    modal.innerHTML = `
      <div class="modal-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4);"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p style="white-space: pre-line; line-height: 1.6; color: var(--gray-100, #202124); margin: 0;">${content}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-ok">확인</button>
        </div>
      </div>
    `;

    // 모달 스타일
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 모달 내용 스타일
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 300px;
      width: 90%;
      padding: 0;
      position: relative;
      z-index: 1;
    `;

    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.cssText = `
      padding: 16px 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const modalTitle = modal.querySelector('.modal-header h3');
    modalTitle.style.cssText = `
      color: var(--primary-color, #3BA3C7);
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    `;

    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.cssText = `
      padding: 16px 20px;
    `;

    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.style.cssText = `
      padding: 0 20px 16px;
      text-align: right;
    `;

    const modalClose = modal.querySelector('.modal-close');
    modalClose.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      margin: 0;
      color: var(--gray-600, #80868B);
      transition: color 0.2s ease;
    `;

    modalClose.addEventListener('mouseenter', () => {
      modalClose.style.color = 'var(--gray-800, #3C4043)';
    });

    modalClose.addEventListener('mouseleave', () => {
      modalClose.style.color = 'var(--gray-600, #80868B)';
    });

    const modalOk = modal.querySelector('.modal-ok');
    modalOk.style.cssText = `
      background: var(--primary-color, #3BA3C7);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    `;

    document.body.appendChild(modal);

    // 이벤트 리스너
    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-ok').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
  }

  /**
   * 프로젝트 상세 정보 모달 표시
   * @param {Object} project - 프로젝트 정보
   * @param {Function} onDelete - 삭제 콜백 함수
   * @param {Function} onOpen - 열기 콜백 함수
   */
  static showProjectDetailModal(project, onDelete, onOpen) {
    // 기존 모달이 있으면 제거
    const existingModal = document.querySelector('.project-detail-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'project-detail-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${this.escapeHtml(project.title || '프로젝트')}</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="project-detail">
            <div class="detail-item">
              <label>예산:</label>
              <span>${project.budget?.formatted || '미정'}</span>
            </div>
            <div class="detail-item">
              <label>위치:</label>
              <span>${project.location || '미공개'}</span>
            </div>
            <div class="detail-item">
              <label>마감일:</label>
              <span>${project.deadline || '미정'}</span>
            </div>
            <div class="detail-item">
              <label>기술스택:</label>
              <div class="skills">${(project.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</div>
            </div>
            <div class="detail-item description">
              <label>설명:</label>
              <div class="description-content">${this.formatDescription(project.description || '설명이 없습니다.')}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary delete-btn" data-project-id="${project.projectId}">삭제</button>
          <button class="btn btn-primary open-btn" data-project-id="${project.projectId}">원본 페이지로 이동</button>
        </div>
      </div>
    `;

    // 모달 스타일 추가
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(modal);

    // 이벤트 리스너 추가
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const deleteBtn = modal.querySelector('.delete-btn');
    const openBtn = modal.querySelector('.open-btn');

    const closeModal = () => modal.remove();

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    deleteBtn?.addEventListener('click', () => {
      closeModal();
      if (onDelete) onDelete(project.projectId);
    });

    openBtn?.addEventListener('click', () => {
      if (onOpen) onOpen(project.projectId);
      closeModal();
    });
  }
}

// 전역 접근을 위한 window 객체에 등록
window.DOMHelper = DOMHelper;