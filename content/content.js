/**
 * WishView - Content Script 메인 진입점 (리팩토링된 버전)
 * Manifest V3에서 모든 모듈이 이미 로드되므로 WishViewController를 통해 시스템을 초기화합니다.
 */

(async function() {
  'use strict';

  /**
   * 필수 모듈들이 로드되었는지 확인
   * @returns {Promise<void>}
   */
  async function checkModules() {
    const requiredModules = [
      'ConfigManager',
      'ProjectDataProcessor',
      'DynamicDetector',
      'MessageHandler',
      'WishViewController'
    ];


    const missingModules = [];
    for (const moduleName of requiredModules) {
      if (typeof window[moduleName] === 'undefined') {
        missingModules.push(moduleName);
      } else {
      }
    }

    if (missingModules.length > 0) {
      throw new Error(`필수 모듈이 로드되지 않음: ${missingModules.join(', ')}`);
    }

  }

  /**
   * WishView 시스템 초기화
   * @returns {Promise<void>}
   */
  async function initializeWishView() {
    try {
      // 이미 인스턴스가 있다면 정리
      if (window.wishViewInstance) {
        window.wishViewInstance.destroy();
        window.wishViewInstance = null;
      }

      // 새 컨트롤러 인스턴스 생성
      const controller = new window.WishViewController();

      // 초기화 실행
      const success = await controller.initialize();

      if (success) {
        // 전역 참조 저장 (디버깅 및 관리용)
        window.wishViewInstance = controller;

        // 페이지 언로드 시 정리 설정
        window.addEventListener('beforeunload', () => {
          if (window.wishViewInstance) {
            window.wishViewInstance.destroy();
            window.wishViewInstance = null;
          }
        });


        // 초기화 상태 로깅
        const status = controller.getStatus();
      } else {
        throw new Error('WishView 컨트롤러 초기화 실패');
      }

    } catch (error) {

      // 사용자에게 알림 (DOMHelper가 있는 경우)
      if (window.DOMHelper) {
        window.DOMHelper.showNotification(
          'WishView 확장 프로그램 초기화에 실패했습니다.',
          'error'
        );
      }

      throw error;
    }
  }

  /**
   * 전체 초기화 프로세스 실행
   */
  async function main() {
    try {

      // 1. 모든 모듈 로드 상태 확인
      await checkModules();

      // 2. WishView 시스템 초기화
      await initializeWishView();


    } catch (error) {

      // 개발자 모드에서 추가 디버깅 정보 제공
      if (chrome.runtime?.getManifest()?.key === undefined) {
        console.group('디버깅 정보');
        ['JSONLDParser', 'DOMHelper', 'StorageHelper'].forEach(obj => {
        });
        console.groupEnd();
      }
    }
  }

  // 메인 함수 실행
  await main();

})();

/**
 * 전역 디버깅 함수들 (개발용)
 */
if (typeof window !== 'undefined') {
  // WishView 상태 확인 함수
  window.getWishViewStatus = function() {
    if (window.wishViewInstance) {
      return window.wishViewInstance.getStatus();
    } else {
      return { error: 'WishView 인스턴스가 없습니다.' };
    }
  };

  // WishView 강제 새로고침 함수
  window.refreshWishView = async function() {
    if (window.wishViewInstance) {
      await window.wishViewInstance.forceRefresh();
    } else {
    }
  };

  // WishView 재시작 함수
  window.restartWishView = async function() {
    try {
      if (window.wishViewInstance) {
        window.wishViewInstance.destroy();
      }

      const controller = new window.WishViewController();
      const success = await controller.initialize();

      if (success) {
        window.wishViewInstance = controller;
      } else {
      }
    } catch (error) {
    }
  };
}