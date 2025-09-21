/**
 * WishView - DOM Security
 * HTML 안전성 검증, 살균(Sanitization), 안전한 요소 생성 등을 담당합니다.
 */
class Security {
  /**
   * HTML 콘텐츠 안전성 검증
   */
  static isHTMLSafe(html) {
    if (typeof html !== 'string') return false;

    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,           // 스크립트 태그
      /javascript:/gi,                         // JavaScript 프로토콜
      /on\w+\s*=/gi,                          // 이벤트 핸들러 속성
      /<iframe[^>]*>/gi,                       // iframe 태그
      /<object[^>]*>/gi,                       // object 태그
      /<embed[^>]*>/gi,                        // embed 태그
      /[A-Za-z]:\\[^"'\s>]+\.(png|jpe?g|gif)/gi, // 로컬 파일 경로
      /file:\/\/\/[^"'\s>]+/gi,                // file:// 프로토콜
      /Pictures[\/\\]picpick/gi                // PicPick 경로
    ];

    return !dangerousPatterns.some(pattern => pattern.test(html));
  }

  /**
   * HTML 콘텐츠 살균 처리
   */
  static sanitizeHTML(html) {
    if (typeof html !== 'string') return '';

    let sanitized = html;

    // 위험한 요소 제거
    sanitized = sanitized
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:[^"'\s>]*/gi, '')
      .replace(/on\w+\s*=\s*[^"'\s>]*/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '');

    // 로컬 파일 경로 제거
    sanitized = sanitized
      .replace(/[A-Za-z]:[^"'\s>]*\.(png|jpe?g|gif)/gi, 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>')
      .replace(/file:\/\/\/[^"'\s>]+/gi, '')
      .replace(/Pictures[\/\\]picpick[\/\\][^"'\s>]+/gi, '');

    return sanitized;
  }

  /**
   * 안전한 요소 생성
   */
  static createSafeElement(tagName, attributes = {}, textContent = '') {
    const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                         'button', 'a', 'img', 'svg', 'path', 'section', 'header',
                         'footer', 'main', 'article', 'aside'];

    if (!allowedTags.includes(tagName.toLowerCase())) {
      tagName = 'div';
    }

    const element = document.createElement(tagName);

    // 안전한 속성만 설정
    const safeAttributes = ['class', 'id', 'role', 'aria-label', 'aria-labelledby',
                           'aria-modal', 'data-', 'viewBox', 'd', 'stroke', 'fill'];

    Object.entries(attributes).forEach(([key, value]) => {
      const isSafeAttribute = safeAttributes.some(safe =>
        key === safe || key.startsWith('data-') || key.startsWith('aria-')
      );

      if (isSafeAttribute && typeof value === 'string') {
        // 속성 값도 살균 처리
        const safeValue = value.replace(/javascript:/gi, '').replace(/on\w+/gi, '');
        element.setAttribute(key, safeValue);
      }
    });

    // 텍스트 내용 설정 (XSS 방지를 위해 textContent 사용)
    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  }

  /**
   * HTML 이스케이프 (XSS 방지)
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
}
