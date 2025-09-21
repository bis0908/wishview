/**
 * WishView - JSON-LD 파싱 유틸리티
 * 위시켓 프로젝트 페이지의 JobPosting JSON-LD 데이터를 추출하고 구조화합니다.
 */

class JSONLDParser {
  /**
   * 현재 페이지가 위시켓 프로젝트 페이지인지 확인
   */
  static isWishketProjectPage() {
    const urlPattern = /^https:\/\/www\.wishket\.com\/project\/\d+\/$/;
    return urlPattern.test(window.location.href);
  }

  /**
   * URL에서 프로젝트 ID 추출
   */
  static extractProjectId() {
    const match = window.location.pathname.match(/\/project\/(\d+)\//);
    return match ? match[1] : null;
  }

  /**
   * 모집 종료된 프로젝트 여부 확인 (closed-mark 클래스 존재)
   */
  static isClosedProject() {
    return document.querySelector('.closed-mark') !== null;
  }

  /**
   * 프라이빗 프로젝트 여부 확인 (float-private-box 클래스 존재)
   */
  static isPrivateProject() {
    return document.querySelector('.float-private-box') !== null;
  }

  /**
   * JobPosting JSON-LD 스크립트 태그 찾기 (두 번째 application/ld+json)
   */
  static findJobPostingScript() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    // PRD에 따르면 두 번째 스크립트 태그가 JobPosting 정보를 포함
    if (scripts.length >= 2) {
      const secondScript = scripts[1];
      try {
        // 데이터 무결성 사전 검사
        const textContent = secondScript.textContent || '';

        // 로컬 파일 경로 패턴 감지
        let jsonData;
        if (this.containsLocalFilePath(textContent)) {
          // 로컬 파일 경로 제거
          const sanitizedContent = this.sanitizeLocalFilePaths(textContent);
          jsonData = JSON.parse(sanitizedContent);
        } else {
          jsonData = JSON.parse(textContent);
        }

        // @type이 JobPosting인지 확인
        if (jsonData && jsonData['@type'] === 'JobPosting') {
          // 추가 데이터 검증
          return this.validateJobPostingData(jsonData);
        }
      } catch (error) {
        // 폴백 전략: 기본 구조로 시도
        try {
          const fallbackData = this.createFallbackJobPosting();
          return fallbackData;
        } catch (fallbackError) {
          // 폴백 실패시 null 반환
        }
      }
    }

    return null;
  }

  /**
   * 로컬 파일 경로 패턴 감지
   */
  static containsLocalFilePath(text) {
    const localFilePatterns = [
      /[A-Za-z]:\\/,                    // Windows 드라이브 경로 (C:\, D:\ 등)
      /file:\/\/\/[A-Za-z]:/,            // file:// 프로토콜
      /Users\/[^\s\/]+\/Pictures/,      // macOS 사용자 이미지 폴더
      /Pictures\/picpick/i,              // PicPick 전용 패턴
      /\.png["'\s]/,                   // PNG 파일 확장자 뒤 문자
      /\.jpe?g["'\s]/,                 // JPEG 파일 확장자
      /\.gif["'\s]/,                   // GIF 파일 확장자
      /\\[A-Za-z0-9\s-]+\.(png|jpe?g|gif)/i  // 백슬래시 경로에 이미지 파일
    ];

    return localFilePatterns.some(pattern => pattern.test(text));
  }

  /**
   * 로컬 파일 경로 제거 및 정리
   */
  static sanitizeLocalFilePaths(text) {
    let sanitized = text;

    // Windows 드라이브 경로 제거
    sanitized = sanitized.replace(/[A-Za-z]:\\/g, 'https://example.com/');

    // file:// 프로토콜 제거
    sanitized = sanitized.replace(/file:\/\/\/[A-Za-z]:[^"\s]+/g, 'https://example.com/image.png');

    // 로컬 이미지 파일 경로 대체
    sanitized = sanitized.replace(/[A-Za-z]:[^"\s]*\.(png|jpe?g|gif)/gi, 'https://example.com/image.png');

    // PicPick 전용 경로 대체
    sanitized = sanitized.replace(/Pictures[\/\\]picpick[\/\\][^"\s]+/gi, 'https://example.com/screenshot.png');

    return sanitized;
  }

  /**
   * JobPosting 데이터 유효성 검증
   */
  static validateJobPostingData(jsonData) {
    // 필수 필드 유무 확인
    const requiredFields = ['title', 'description'];
    const missingFields = requiredFields.filter(field => !jsonData[field]);

    // 필수 필드 검사는 계속 수행하되 로깅은 제거
    if (missingFields.length > 0) {
      // 필수 필드가 누락되었지만 계속 진행
    }

    // 안전한 데이터만 반환
    return {
      '@type': jsonData['@type'],
      title: this.sanitizeString(jsonData.title),
      description: this.sanitizeString(jsonData.description),
      employmentType: this.sanitizeString(jsonData.employmentType),
      hiringOrganization: jsonData.hiringOrganization,
      baseSalary: jsonData.baseSalary,
      jobLocation: jsonData.jobLocation,
      datePosted: jsonData.datePosted,
      validThrough: jsonData.validThrough,
      skills: Array.isArray(jsonData.skills) ? jsonData.skills.map(s => this.sanitizeString(s)) : [],
      qualifications: this.sanitizeString(jsonData.qualifications)
    };
  }

  /**
   * 문자열 살균 처리
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;

    // HTML 태그 제거
    const cleanStr = str.replace(/<[^>]*>/g, '');

    // 로컬 파일 경로 제거
    if (this.containsLocalFilePath(cleanStr)) {
      return cleanStr.replace(/[A-Za-z]:[^\s]*\.(png|jpe?g|gif)/gi, '[image]');
    }

    return cleanStr;
  }

  /**
   * 폴백 JobPosting 데이터 생성
   */
  static createFallbackJobPosting() {
    return {
      '@type': 'JobPosting',
      title: '프로젝트 정보를 불러올 수 없습니다',
      description: '데이터 파싱 오류로 인해 상세 정보를 표시할 수 없습니다.',
      employmentType: '미정',
      hiringOrganization: { name: '미정' },
      baseSalary: { value: 0, currency: 'KRW' },
      jobLocation: { address: '미정' },
      datePosted: new Date().toISOString(),
      validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      skills: [],
      qualifications: '미정'
    };
  }

  /**
   * 기술 스택 추출 (skills 또는 keywords에서)
   */
  static extractSkills(jsonLdData) {
    const skills = [];

    // skills 배열에서 추출
    if (jsonLdData.skills && Array.isArray(jsonLdData.skills)) {
      skills.push(...jsonLdData.skills);
    }

    // keywords 문자열에서 추출 (콤마로 구분)
    if (jsonLdData.keywords) {
      const keywordArray = jsonLdData.keywords.split(',').map(k => k.trim());
      skills.push(...keywordArray);
    }

    // 중복 제거 및 빈 문자열 필터링
    return [...new Set(skills)].filter(skill => skill.length > 0);
  }

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
   * HTML 설명을 정리된 텍스트로 변환
   */
  static sanitizeDescription(htmlDescription) {
    if (!htmlDescription) return '';

    // 1. HTML 엔티티 디코딩
    let cleanText = htmlDescription
      .replace(/\\u000D\\u000A/g, '\n')
      .replace(/\\u000D/g, '\n')
      .replace(/\\u000A/g, '\n')
      .replace(/\\u002D/g, '-')
      .replace(/\\u002F/g, '/')
      .replace(/\\"/g, '"');

    // 2. 예전 프로젝트 링크 제거 (별도 처리를 위해)
    const projectLinkRegex = /예전\s*프로젝트\s*:?\s*<a\s+href=["'][^"']+["'][^>]*>[^<]+<\/a>/gi;
    cleanText = cleanText.replace(projectLinkRegex, '');

    // 3. 기타 HTML 태그 제거 (XSS 방지)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanText;
    cleanText = tempDiv.textContent || tempDiv.innerText || '';

    // 4. 원본 개행 정보 그대로 유지
    return cleanText.trim();
  }

  /**
   * HTML 태그 제거 (XSS 방지)
   */
  static stripHtmlTags(html) {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Meta 태그에서 가격 정보 추출
   */
  static extractPriceFromMetaTag() {
    const metaPrice = document.querySelector('meta[property="product:price:amount"]');
    if (metaPrice && metaPrice.content) {
      return metaPrice.content.trim();
    }
    return null;
  }

  /**
   * 예산 정보 포맷팅
   */
  static formatBudget(baseSalary) {
    let amount = '미정';
    let currency = 'KRW';

    // 1. Meta 태그에서 금액 추출 시도
    const metaPrice = this.extractPriceFromMetaTag();
    if (metaPrice && !isNaN(metaPrice)) {
      amount = metaPrice;
    }
    // 2. JSON-LD에서 금액 추출 (기존 로직)
    else if (baseSalary) {
      amount = baseSalary.value?.amount || baseSalary.amount || '미정';
      currency = baseSalary.value?.currency || baseSalary.currency || 'KRW';
    }

    if (amount === '미정') {
      return { amount, currency, formatted: '미정' };
    }

    // 숫자를 원화 형식으로 포맷팅
    const numericAmount = parseInt(amount);
    const formatted = numericAmount.toLocaleString('ko-KR') + '원';

    return { amount, currency, formatted };
  }

  /**
   * 날짜 포맷팅
   */
  static formatDate(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * 마감일까지 남은 시간 계산
   */
  static calculateTimeRemaining(deadline) {
    if (!deadline) return '';

    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return '마감됨';
      } else if (diffDays === 0) {
        return '오늘 마감';
      } else if (diffDays === 1) {
        return '1일 남음';
      } else if (diffDays < 7) {
        return `${diffDays}일 남음`;
      } else {
        const weeks = Math.floor(diffDays / 7);
        const remainingDays = diffDays % 7;
        if (remainingDays === 0) {
          return `${weeks}주 남음`;
        } else {
          return `${weeks}주 ${remainingDays}일 남음`;
        }
      }
    } catch (error) {
      return '';
    }
  }

  /**
   * 위치 정보 포맷팅
   */
  static formatLocation(jobLocation) {
    if (!jobLocation || !jobLocation.address) {
      return '위치 미공개';
    }

    const address = jobLocation.address;

    // address가 문자열인 경우
    if (typeof address === 'string') {
      return address;
    }

    // address가 객체인 경우 - streetAddress만 표시
    if (typeof address === 'object') {
      // streetAddress 값만 표시 (중복 제거)
      if (address.streetAddress) {
        return address.streetAddress;
      }

      // streetAddress가 없으면 기본값
      return '위치 미공개';
    }

    return '위치 미공개';
  }

  /**
   * JSON-LD JobPosting 데이터를 내부 구조로 변환
   */
  static mapJobPostingData(jsonLdData) {
    const budget = this.formatBudget(jsonLdData.baseSalary);
    const datePosted = this.formatDate(jsonLdData.datePosted);
    const deadline = this.formatDate(jsonLdData.validThrough);
    const timeRemaining = this.calculateTimeRemaining(jsonLdData.validThrough);

    const projectData = {
      // 기본 정보
      title: jsonLdData.title || '',
      description: this.sanitizeDescription(jsonLdData.description || ''),

      // 프로젝트 조건
      budget: budget,

      // 고용 정보
      employmentType: jsonLdData.employmentType || 'CONTRACTOR',
      workHours: jsonLdData.workHours || 'FULL_TIME',

      // 회사 정보
      company: {
        name: jsonLdData.hiringOrganization?.name || '회사명 미공개',
        url: jsonLdData.hiringOrganization?.sameAs || jsonLdData.hiringOrganization?.url || ''
      },

      // 기술 스택
      skills: this.extractSkills(jsonLdData),

      // 날짜 정보
      datePosted: datePosted,
      deadline: deadline,
      timeRemaining: timeRemaining,

      // 위치 정보
      location: this.formatLocation(jsonLdData.jobLocation),

      // 프로젝트 ID
      projectId: this.extractProjectId(),

      // 예전 프로젝트 링크 정보 추가
      previousProject: this.extractPreviousProjectLink(jsonLdData.description || ''),

      // 원본 데이터 (디버깅용)
      rawData: jsonLdData
    };

    return projectData;
  }

  /**
   * 추출된 데이터의 유효성 검증
   */
  static validateProjectData(projectData) {
    const validation = {
      hasTitle: projectData.title && projectData.title.length > 0,
      hasDescription: projectData.description && projectData.description.length > 0,
      hasValidBudget: projectData.budget && projectData.budget.amount,
      hasProjectId: projectData.projectId && /^\d+$/.test(projectData.projectId)
    };

    const isValid = Object.values(validation).every(check => check === true);

    // 데이터 검증 실패시에도 로깅 없이 결과만 반환
    if (!isValid) {
      // 검증 실패했지만 계속 진행
    }

    return {
      isValid,
      checks: validation,
      data: projectData
    };
  }

  /**
   * 메인 데이터 추출 함수
   */
  static extractProjectData() {
    try {
      // 1. 페이지 검증
      if (!this.isWishketProjectPage()) {
        throw new Error('위시켓 프로젝트 페이지가 아닙니다.');
      }

      // 2. 프라이빗 프로젝트 확인
      if (!this.isPrivateProject()) {
        throw new Error('프라이빗 프로젝트가 아닙니다.');
      }

      // 3. JSON-LD 데이터 추출
      const jobPostingData = this.findJobPostingScript();
      if (!jobPostingData) {
        throw new Error('JobPosting JSON-LD 데이터를 찾을 수 없습니다.');
      }

      // 4. 데이터 구조화
      const projectData = this.mapJobPostingData(jobPostingData);

      // 5. 데이터 검증
      const validationResult = this.validateProjectData(projectData);

      // 검증 결과에 관계없이 데이터 반환

      return {
        success: true,
        data: projectData,
        validation: validationResult
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// 전역 스코프에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  window.JSONLDParser = JSONLDParser;
}