/**
 * WishView - 프로젝트 관리자
 * 프로젝트 관련 기능 및 데이터 처리를 담당
 */

class ProjectManager {

  /**
   * 프로젝트 삭제
   * @param {string} projectId - 삭제할 프로젝트 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async deleteProject(projectId) {
    if (!confirm('이 프로젝트를 삭제하시겠습니까?')) {
      return false;
    }

    try {
      await StorageHelper.deleteProject(projectId);
      DOMHelper.showSuccessMessage('프로젝트가 삭제되었습니다.');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 프로젝트 페이지 열기
   * @param {string} projectId - 열 프로젝트 ID
   */
  static openProject(projectId) {
    chrome.tabs.create({
      url: `https://www.wishket.com/project/${projectId}/`,
      active: true
    });
    window.close();
  }

  /**
   * 위시켓 사이트 열기
   */
  static openWishket() {
    chrome.tabs.create({
      url: 'https://www.wishket.com/project/',
      active: true
    });
    window.close();
  }


  /**
   * 프로젝트 모달 표시 요청
   * @param {chrome.tabs.Tab} currentTab - 현재 탭
   * @param {Object} contentScriptData - Content Script 데이터
   * @returns {Promise<boolean>} 성공 여부
   */
  static async showProjectModal(currentTab, contentScriptData) {
    try {
      // 1. 현재 탭이 위시켓 프로젝트 페이지인지 확인
      if (!currentTab || !MessageHelper.isWishketProjectUrl(currentTab.url)) {
        throw new Error('위시켓 프로젝트 페이지에서만 사용할 수 있습니다.');
      }

      // 2. Content Script 상태 확인
      if (!contentScriptData?.hasProject) {
        throw new Error('프라이빗 프로젝트 정보를 찾을 수 없습니다.');
      }

      // 3. Content Script에 모달 표시 요청
      const success = await MessageHelper.requestShowModal(currentTab);

      if (success) {
        // 모달이 현재 페이지에 표시되도록 팝업 닫기
        window.close();
        return true;
      } else {
        throw new Error('현재 페이지에서 모달을 표시할 수 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Content Script 새로고침
   * @param {chrome.tabs.Tab} currentTab - 현재 탭
   * @returns {Promise<boolean>} 성공 여부
   */
  static async refreshContentScript(currentTab) {
    try {
      const success = await MessageHelper.requestRefresh(currentTab);

      if (success) {
        // 1초 후 상태 재확인을 위해 true 반환
        return true;
      } else {
        throw new Error('새로고침에 실패했습니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 선택된 프로젝트 열기 (미리보기에서)
   * @param {HTMLElement} openProjectBtn - 열기 버튼 요소
   */
  static openSelectedProject(openProjectBtn) {
    const projectId = openProjectBtn.getAttribute('data-project-id');
    if (projectId) {
      this.openProject(projectId);
    }
  }

  /**
   * 피드백 이메일 보내기
   * @param {chrome.tabs.Tab} currentTab - 현재 탭 (컨텍스트용)
   */
  static openFeedback(currentTab) {
    const emailSubject = encodeURIComponent('[WishView] 피드백 및 문의사항');
    const emailBody = encodeURIComponent(`
안녕하세요,

WishView 확장 프로그램에 대한 피드백입니다.

[여기에 의견을 작성해주세요]

---
WishView 버전: v1.0.0
브라우저: ${navigator.userAgent}
현재 페이지: ${currentTab?.url || '알 수 없음'}
    `.trim());

    const mailtoUrl = `mailto:harborcatsoft@gmail.com?subject=${emailSubject}&body=${emailBody}`;

    // 이메일 클라이언트 열기
    chrome.tabs.create({
      url: mailtoUrl,
      active: true
    });
    window.close();
  }

  /**
   * 정보 표시
   */
  static showAbout() {
    const aboutInfo = `WishView v1.0.0
위시켓 프라이빗 매칭 확장 프로그램

개발: WishView Team
라이선스: MIT`;

    DOMHelper.showCompactModal('프로그램 정보', aboutInfo);
  }

  /**
   * 도움말 페이지 열기
   */
  static openHelp() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('pages/help.html'),
      active: true
    });
    window.close();
  }
}

// 전역 접근을 위한 window 객체에 등록
window.ProjectManager = ProjectManager;