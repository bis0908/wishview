/**
 * WishView - DOM Events
 * 모달의 이벤트 리스너 설정 로직을 담당합니다.
 */
class Event {
  /**
   * 모달 이벤트 리스너 설정
   */
  static setupModalEventListeners(modal, projectData) {
    // 닫기 버튼
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        DOMHelper.hideModal(modal);
      });
    }

    // 모달 내부의 닫기 버튼
    const closeModalBtn = modal.querySelector('#close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        DOMHelper.hideModal(modal);
      });
    }

    // 오버레이 클릭으로 닫기
    const overlay = modal.querySelector('.wishview-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        DOMHelper.hideModal(modal);
      });
    }

    // ESC 키로 닫기
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        DOMHelper.hideModal(modal);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);


    // 원본 페이지 이동 버튼
    const goToBtn = modal.querySelector('#go-to-project');
    if (goToBtn) {
      goToBtn.addEventListener('click', () => {
        // 현재 페이지를 새 탭에서 열기 (프라이빗 제한 무시하고 접근)
        window.open(window.location.href, '_blank');
      });
    }

    // 예전 프로젝트 버튼
    const previousProjectBtn = modal.querySelector('#previous-project');
    if (previousProjectBtn) {
      const previousProject = Format.extractPreviousProjectLink(projectData.description);
      if (previousProject) {
        previousProjectBtn.addEventListener('click', () => {
          const url = previousProject.url;
          if (url) {
            // 새 탭에서 예전 프로젝트 열기
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        });
      }
    }

    // 탭 전환 설정
    this.setupTabSwitching(modal);
  }

  /**
   * 탭 전환 기능
   */
  static setupTabSwitching(modal) {
    const tabButtons = modal.querySelectorAll('.tab-btn');
    const tabPanes = modal.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // 모든 탭 버튼에서 active 클래스 제거
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // 현재 클릭된 버튼에 active 클래스 추가
        button.classList.add('active');

        // 모든 탭 팬에서 active 클래스 제거
        tabPanes.forEach(pane => pane.classList.remove('active'));
        // 대상 탭 팬에 active 클래스 추가
        const targetPane = modal.querySelector(`#tab-${targetTab}`);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  }
}
