/**
 * WishView - DOM Misc
 * 기타 유틸리티 함수들을 담당합니다.
 */
class Misc {
  /**
   * 간단한 알림 표시
   */
  static showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `wishview-notification wishview-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#34A853' : type === 'error' ? '#EA4335' : '#3BA3C7'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      word-break: keep-all;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s ease';

        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  /**
   * DOM 로딩 완료 대기
   */
  static waitForDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', resolve);
        window.addEventListener('load', resolve);
      }
    });
  }

  /**
   * 페이지의 최고 z-index 값 찾기
   */
  static getHighestZIndex() {
    let highest = 0;
    const elements = document.querySelectorAll('*');

    for (let element of elements) {
      const zIndex = parseInt(getComputedStyle(element).zIndex);
      if (!isNaN(zIndex) && zIndex > highest && zIndex < Number.MAX_SAFE_INTEGER) {
        highest = zIndex;
      }
    }

    return highest;
  }

  /**
   * 디바운스 함수
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
