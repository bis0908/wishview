/**
 * WishView - DOM Fallback
 * CSS 로딩 실패 시 대체 스타일 적용 로직을 담당합니다.
 */
class Fallback {
  /**
   * CSS 미로드 시 fallback 스타일 적용
   */
  static applyFallbackStyles(modal) {
    modal.style.cssText = `
      position: fixed !important;
      top: 0px !important;
      left: 0px !important;
      right: 0px !important;
      bottom: 0px !important;
      z-index: ${Number.MAX_SAFE_INTEGER} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      margin: 0 !important;
      border: none !important;
      transform: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transition: opacity 0.3s ease, visibility 0.3s ease !important;
    `.replace(/\s+/g, ' ').trim();

    const style = document.createElement('style');
    style.id = 'wishview-fallback-styles';
    style.textContent = `
      .wishview-modal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: ${Number.MAX_SAFE_INTEGER} !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.3s ease, visibility 0.3s ease !important;
        margin: 0 !important;
        border: none !important;
        background: none !important;
        width: auto !important;
        height: auto !important;
        transform: none !important;
        box-sizing: border-box !important;
      }

      .wishview-modal.active {
        opacity: 1 !important;
        visibility: visible !important;
      }

      .wishview-overlay {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(3px) !important;
        cursor: pointer !important;
        z-index: 1 !important;
      }

      .wishview-container {
        position: relative !important;
        background: white !important;
        border-radius: 12px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3) !important;
        max-width: 800px !important;
        width: 100% !important;
        max-height: 90vh !important;
        overflow: hidden !important;
        z-index: 2 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        transform: scale(1) !important;
        transition: transform 0.3s ease !important;
      }

      .wishview-header {
        padding: 24px !important;
        border-bottom: 1px solid #E8EAED !important;
        background: #F8F9FA !important;
        flex-shrink: 0 !important;
      }

      .header-main {
        display: flex !important;
        align-items: flex-start !important;
        justify-content: space-between !important;
        gap: 16px !important;
      }

      .project-title {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #202124 !important;
        margin: 0 !important;
        line-height: 1.3 !important;
        word-break: keep-all !important;
      }

      .close-btn {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 32px !important;
        height: 32px !important;
        border: none !important;
        background: #F1F3F4 !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        transition: background-color 0.2s ease !important;
        color: #5F6368 !important;
        font-size: 16px !important;
      }

      .close-btn:hover {
        background: #E8EAED !important;
        color: #202124 !important;
      }

      .wishview-content {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 24px !important;
      }

      .wishview-modal * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        box-sizing: border-box !important;
      }

      .wishview-modal p {
        margin: 0 0 12px 0 !important;
        line-height: 1.5 !important;
        color: #3C4043 !important;
      }

      .wishview-modal h3 {
        margin: 20px 0 8px 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #202124 !important;
      }

      .wishview-modal, .wishview-modal * {
        pointer-events: auto !important;
        user-select: auto !important;
      }
    `;

    const existingStyle = document.getElementById('wishview-fallback-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    document.head.appendChild(style);

    setTimeout(() => {
      if (modal && !modal.classList.contains('active')) {
        modal.classList.add('active');
      }

      modal.style.opacity = '1';
      modal.style.visibility = 'visible';
    }, 10);
  }

  /**
   * JavaScript로 직접 모달 표시 (CSS 완전 우회)
   */
  static forceShowModalWithJS(modal) {
    if (!modal) {
      return;
    }

    modal.className = 'wishview-modal';

    const styles = {
      position: 'fixed',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      width: '100vw',
      height: '100vh',
      zIndex: String(Number.MAX_SAFE_INTEGER),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      opacity: '1',
      visibility: 'visible',
      margin: '0',
      border: 'none',
      background: 'none',
      transform: 'none',
      boxSizing: 'border-box',
      transition: 'none'
    };

    Object.entries(styles).forEach(([property, value]) => {
      modal.style.setProperty(property, value, 'important');
    });

    this.forceChildElementStyles(modal);

    setTimeout(() => {
      modal.classList.add('active');
      modal.style.setProperty('opacity', '1', 'important');
      modal.style.setProperty('visibility', 'visible', 'important');
      modal.style.setProperty('display', 'flex', 'important');
    }, 10);

    setTimeout(() => {
      const isActuallyVisible = modal.offsetWidth > 0 && modal.offsetHeight > 0;
      if (!isActuallyVisible) {
        // this.applyNuclearOption(modal);
      }
    }, 100);
  }

  /**
   * 자식 요소들 강제 스타일 적용
   */
  static forceChildElementStyles(modal) {
    const overlay = modal.querySelector('.wishview-overlay');
    if (overlay) {
      const overlayStyles = {
        position: 'absolute',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        cursor: 'pointer',
        zIndex: '1'
      };

      Object.entries(overlayStyles).forEach(([property, value]) => {
        overlay.style.setProperty(property, value, 'important');
      });
    }

    const container = modal.querySelector('.wishview-container');
    if (container) {
      const containerStyles = {
        position: 'relative',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        zIndex: '2',
        margin: '0',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        transform: 'none'
      };

      Object.entries(containerStyles).forEach(([property, value]) => {
        container.style.setProperty(property, value, 'important');
      });
    }
  }

  /**
   * CSS 로딩 상태 확인 (강화된 진단 버전)
   */
  static checkCSSLoaded() {
    try {
      const styleSheetsInfo = this.analyzeStyleSheets();

      const rootStyle = getComputedStyle(document.documentElement);
      const primaryColor = rootStyle.getPropertyValue('--wishview-primary').trim();
      const fontFamily = rootStyle.getPropertyValue('--wishview-font-family').trim();

      const testElement = document.createElement('div');
      testElement.className = 'wishview-modal';
      testElement.style.display = 'none';
      document.body.appendChild(testElement);

      const computedStyle = getComputedStyle(testElement);
      const styleCheck = {
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        display: computedStyle.display,
        opacity: computedStyle.opacity,
        visibility: computedStyle.visibility
      };

      testElement.className = 'wishview-modal active';
      const activeStyle = getComputedStyle(testElement);
      const activeCheck = {
        opacity: activeStyle.opacity,
        visibility: activeStyle.visibility
      };

      const isComputedStyleBroken = this.detectComputedStyleIssues(testElement);

      document.body.removeChild(testElement);

      const hasVariables = primaryColor !== '' && fontFamily !== '';
      const hasModalStyles = computedStyle.position === 'fixed' && computedStyle.zIndex !== 'auto';
      const hasActiveStyles = activeStyle.opacity === '1' && activeStyle.visibility === 'visible';

      const result = hasVariables && hasModalStyles && hasActiveStyles && !isComputedStyleBroken;

      return result;
    } catch (error) {
      return false;
    }
  }

  /**
   * document.styleSheets 분석
   */
  static analyzeStyleSheets() {
    try {
      const sheets = Array.from(document.styleSheets);
      let wishviewSheets = 0;
      let totalRules = 0;
      let wishviewRules = 0;

      sheets.forEach((sheet, index) => {
        try {
          const href = sheet.href || 'inline';
          const isWishview = href.includes('wishview') || href.includes('content/styles');

          if (isWishview) wishviewSheets++;

          let rules = [];
          try {
            rules = Array.from(sheet.cssRules || sheet.rules || []);
            totalRules += rules.length;

            if (isWishview) {
              wishviewRules += rules.length;
            }
          } catch (e) {
            // ignore
          }
        } catch (e) {
          // ignore
        }
      });

      const result = {
        totalSheets: sheets.length,
        wishviewSheets,
        totalRules,
        wishviewRules
      };

      return result;
    } catch (error) {
      return { totalSheets: 0, wishviewSheets: 0, totalRules: 0, wishviewRules: 0 };
    }
  }

  /**
   * getComputedStyle 이상 상태 감지
   */
  static detectComputedStyleIssues(element) {
    try {
      const computed = getComputedStyle(element);

      const basicProperties = ['display', 'position', 'visibility', 'opacity'];
      const emptyProperties = basicProperties.filter(prop => computed[prop] === '');

      const issues = {
        hasEmptyProperties: emptyProperties.length > 0,
        emptyProperties,
        computedStyleType: typeof computed,
        computedStyleConstructor: computed.constructor.name
      };

      return issues.hasEmptyProperties;
    } catch (error) {
      return true;
    }
  }
}
