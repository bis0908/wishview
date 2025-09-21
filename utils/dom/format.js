/**
 * WishView - DOM Formatting
 * 데이터 포맷팅 관련 헬퍼 함수들을 담당합니다.
 */
class Format {
  /**
   * 예전 프로젝트 링크 추출
   */
  static extractPreviousProjectLink(description) {
    if (!description) return null;

    // "예전 프로젝트" 패턴과 링크 추출
    const projectLinkRegex = /예전\s*프로젝트\s*:?\s*<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    const match = projectLinkRegex.exec(description);

    if (match) {
      return {
        url: match[1].trim(),
        text: match[2].trim() || match[1].trim()
      };
    }

    return null;
  }

  /**
   * 설명 텍스트 포맷팅
   */
  static formatDescription(description) {
    if (!description) return '설명이 제공되지 않았습니다.';

    // 원본 개행 정보 그대로 반영 (불필요한 처리 제거)
    const formatted = Security.escapeHtml(description).replace(/\n/g, '<br>');

    return formatted;
  }

  /**
   * 고용 유형 포맷팅
   */
  static formatEmploymentType(employmentType) {
    const types = {
      'CONTRACTOR': '프리랜서',
      'FULL_TIME': '정규직',
      'PART_TIME': '파트타임',
      'TEMPORARY': '임시직',
      'INTERN': '인턴'
    };
    return types[employmentType] || '기타';
  }

  /**
   * 근무 시간 포맷팅
   */
  static formatWorkHours(workHours) {
    const hours = {
      'FULL_TIME': '전일제',
      'PART_TIME': '시간제',
      'FLEXIBLE': '유연근무'
    };
    return hours[workHours] || '협의';
  }
}
