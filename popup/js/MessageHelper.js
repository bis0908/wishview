/**
 * WishView - Content Script 통신 헬퍼
 * Content Script와의 메시지 통신을 담당
 */

class MessageHelper {
  /**
   * Content Script에 메시지 전송
   * @param {Object} message - 전송할 메시지 객체
   * @param {number} tabId - 대상 탭 ID
   * @returns {Promise<any>} Content Script의 응답
   */
  static async sendToContentScript(message, tabId) {
    return new Promise((resolve) => {
      if (!tabId) {
        resolve(null);
        return;
      }

      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Content Script 메시지 전송 실패:', chrome.runtime.lastError.message);
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * 현재 활성 탭 정보 가져오기
   * @returns {Promise<chrome.tabs.Tab|null>} 현재 활성 탭 정보
   */
  static async getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          resolve(tabs[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * 위시켓 프로젝트 URL인지 확인
   * @param {string} url - 확인할 URL
   * @returns {boolean} 위시켓 프로젝트 URL 여부
   */
  static isWishketProjectUrl(url) {
    if (!url) return false;
    const pattern = /^https:\/\/www\.wishket\.com\/project\/\d+\/$/;
    return pattern.test(url);
  }

  /**
   * Content Script 상태 확인 및 프로젝트 데이터 가져오기
   * @param {chrome.tabs.Tab} tab - 대상 탭
   * @returns {Promise<Object|null>} Content Script 응답 데이터
   */
  static async checkContentScriptStatus(tab) {
    if (!tab) {
      return {
        status: 'error',
        title: '탭 정보 없음',
        subtitle: '활성 탭을 찾을 수 없습니다.',
        hasProject: false
      };
    }

    // 위시켓 프로젝트 페이지인지 확인
    const isWishketProject = this.isWishketProjectUrl(tab.url);

    if (!isWishketProject) {
      return {
        status: 'inactive',
        title: '위시켓 프로젝트 페이지 아님',
        subtitle: '이 페이지에서는 WishView를 사용할 수 없습니다.',
        hasProject: false
      };
    }

    try {
      // Content Script에 메시지 전송하여 상태 확인
      const response = await this.sendToContentScript({ type: 'GET_PROJECT_DATA' }, tab.id);

      if (response && response.success) {
        if (response.hasProject) {
          if (response.isClosedProject) {
            return {
              status: 'waiting',
              title: '마감된 프라이빗 프로젝트',
              subtitle: '모집이 종료된 프로젝트입니다. 정보는 확인할 수 있습니다.',
              hasProject: true,
              data: response
            };
          } else if (response.projectData) {
            return {
              status: 'active',
              title: '프라이빗 프로젝트 감지',
              subtitle: `"${response.projectData.title}" 정보를 확인할 수 있습니다.`,
              hasProject: true,
              data: response
            };
          } else {
            return {
              status: 'active',
              title: '프라이빗 프로젝트 감지',
              subtitle: '프로젝트 정보를 확인할 수 있습니다.',
              hasProject: true,
              data: response
            };
          }
        } else {
          return {
            status: 'waiting',
            title: '프라이빗 프로젝트 아님',
            subtitle: '이 페이지는 일반 프로젝트이거나 데이터를 찾을 수 없습니다.',
            hasProject: false,
            data: response
          };
        }
      } else {
        return {
          status: 'waiting',
          title: '스크립트 로딩 중',
          subtitle: 'Content Script가 로딩 중이거나 페이지가 완전히 로드되지 않았습니다.',
          hasProject: false
        };
      }
    } catch (error) {
      console.error('Content Script 통신 실패:', error);
      return {
        status: 'waiting',
        title: '연결 대기 중',
        subtitle: 'Content Script와의 연결을 시도하고 있습니다.',
        hasProject: false
      };
    }
  }

  /**
   * Content Script에 모달 표시 요청
   * @param {chrome.tabs.Tab} tab - 대상 탭
   * @returns {Promise<boolean>} 성공 여부
   */
  static async requestShowModal(tab) {
    try {
      const response = await this.sendToContentScript({ type: 'SHOW_MODAL' }, tab.id);
      return response?.success || false;
    } catch (error) {
      console.error('모달 표시 요청 실패:', error);
      return false;
    }
  }

  /**
   * Content Script 새로고침 요청
   * @param {chrome.tabs.Tab} tab - 대상 탭
   * @returns {Promise<boolean>} 성공 여부
   */
  static async requestRefresh(tab) {
    try {
      const response = await this.sendToContentScript({ type: 'FORCE_REFRESH' }, tab.id);
      return response?.success || false;
    } catch (error) {
      console.error('새로고침 요청 실패:', error);
      return false;
    }
  }

  /**
   * Content Script에 설정 업데이트 알림
   * @param {chrome.tabs.Tab} tab - 대상 탭
   * @param {Object} settings - 업데이트된 설정
   * @returns {Promise<boolean>} 성공 여부
   */
  static async notifySettingsUpdate(tab, settings) {
    try {
      const response = await this.sendToContentScript({
        type: 'UPDATE_SETTINGS',
        settings: settings
      }, tab.id);
      return response?.success || false;
    } catch (error) {
      console.error('설정 업데이트 알림 실패:', error);
      return false;
    }
  }
}

// 전역 접근을 위한 window 객체에 등록
window.MessageHelper = MessageHelper;