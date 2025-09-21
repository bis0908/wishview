/**
 * WishView - DOM State
 * 페이지 상태 관리 로직을 담당합니다. (Nuclear Option 등)
 */
class State {
  /**
   * 최후 수단: 페이지의 모든 요소 숨기고 모달만 표시 (개선된 버전)
   */
  static applyNuclearOption(modal) {
    if (DOMHelper.isNuclearOptionActive) {
      return;
    }

    DOMHelper.originalBodyStyle = document.body.style.cssText;

    const bodyChildren = Array.from(document.body.children);
    let hiddenCount = 0;

    bodyChildren.forEach(child => {
      if (child !== modal && !child.contains(modal)) {
        const originalDisplay = child.style.display || getComputedStyle(child).display;
        child.setAttribute('data-wishview-original-display', originalDisplay);

        child.style.setProperty('display', 'none', 'important');
        child.setAttribute('data-wishview-hidden', 'true');
        hiddenCount++;
      }
    });

    DOMHelper.hiddenElementsCount = hiddenCount;

    document.body.style.cssText = `
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: rgba(0, 0, 0, 0.5) !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      width: 100vw !important;
      height: 100vh !important;
    `;

    document.body.appendChild(modal);

    DOMHelper.isNuclearOptionActive = true;

    if (!DOMHelper.exceptionHandlersInitialized) {
      DOMHelper.initializeExceptionHandlers();
      DOMHelper.exceptionHandlersInitialized = true;
    }

    DOMHelper.setupSafetyTimer();
    DOMHelper.monitorModalLifecycle();
  }

  /**
   * 페이지 상태 안전 복원 (개선된 버전)
   */
  static restorePageState() {
    if (!DOMHelper.isNuclearOptionActive) {
      return { success: true, reason: 'not_needed' };
    }

    try {
      const hiddenElements = document.querySelectorAll('[data-wishview-hidden="true"]');
      let restoredCount = 0;

      hiddenElements.forEach(element => {
        try {
          const originalDisplay = element.getAttribute('data-wishview-original-display');
          if (originalDisplay && originalDisplay !== 'none') {
            element.style.setProperty('display', originalDisplay, '');
          } else {
            element.style.removeProperty('display');
          }

          element.removeAttribute('data-wishview-hidden');
          element.removeAttribute('data-wishview-original-display');
          restoredCount++;
        } catch (error) {
          // ignore
        }
      });

      if (DOMHelper.originalBodyStyle) {
        document.body.style.cssText = DOMHelper.originalBodyStyle;
      } else {
        document.body.style.cssText = '';
        document.body.style.overflow = '';
      }

      DOMHelper.clearSafetyTimer();
      if (DOMHelper.modalObserver) {
        DOMHelper.modalObserver.disconnect();
        DOMHelper.modalObserver = null;
      }

      DOMHelper.isNuclearOptionActive = false;
      DOMHelper.hiddenElementsCount = 0;
      DOMHelper.originalBodyStyle = '';

      const result = {
        success: true,
        restoredElements: restoredCount,
        expectedElements: hiddenElements.length
      };

      return result;

    } catch (error) {
      try {
        document.querySelectorAll('[data-wishview-hidden]').forEach(el => {
          el.style.removeProperty('display');
          el.removeAttribute('data-wishview-hidden');
          el.removeAttribute('data-wishview-original-display');
        });

        document.body.style.cssText = '';
        DOMHelper.isNuclearOptionActive = false;

        return { success: true, fallback: true };
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message };
      }
    }
  }

  /**
   * 긴급 모달 복원 (디버깅용 - 기존 호환성 유지)
   */
  static emergencyRestore() {
    return this.restorePageState();
  }
}
