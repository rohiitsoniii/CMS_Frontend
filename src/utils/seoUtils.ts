/**
 * SEO Analysis Utilities
 * 
 * Analyzes content for SEO best practices
 */

export interface SEOAnalysisResult {
  score: number;
  issues: SEOIssue[];
  metrics: {
    wordCount: number;
    keywordDensity: number;
    readingTime: number;
  };
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'good';
  message: string;
}

export const analyzeSEO = (
  content: string,
  title: string,
  metaDescription: string,
  keyword: string
): SEOAnalysisResult => {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Clean content (remove HTML tags)
  const plainContent = content.replace(/<[^>]*>?/gm, '');
  const wordCount = plainContent.split(/\s+/).filter(w => w.length > 0).length;
  
  // Clean keyword
  const targetKeyword = keyword.toLowerCase().trim();
  
  // 1. Content Length
  if (wordCount < 300) {
    score -= 10;
    issues.push({
      type: 'critical',
      message: 'Content is too short (recommended: 300+ words)',
    });
  } else {
    issues.push({
      type: 'good',
      message: 'Content length is good',
    });
  }

  // 2. Keyword in Title
  if (targetKeyword && !title.toLowerCase().includes(targetKeyword)) {
    score -= 20;
    issues.push({
      type: 'critical',
      message: 'Main keyword missing from title',
    });
  } else if (targetKeyword) {
    issues.push({
      type: 'good',
      message: 'Main keyword appears in title',
    });
  }

  // 3. Title Length
  if (title.length < 30) {
    score -= 5;
    issues.push({
      type: 'warning',
      message: 'Title is too short (recommended: 30-60 chars)',
    });
  } else if (title.length > 60) {
    score -= 5;
    issues.push({
      type: 'warning',
      message: 'Title is too long (recommended: 60 chars max)',
    });
  } else {
    issues.push({
      type: 'good',
      message: 'Title length is optimal',
    });
  }

  // 4. Meta Description
  if (!metaDescription) {
    score -= 10;
    issues.push({
      type: 'critical',
      message: 'Meta description is missing',
    });
  } else if (metaDescription.length < 120) {
    score -= 5;
    issues.push({
      type: 'warning',
      message: 'Meta description is too short (recommended: 120-160 chars)',
    });
  } else if (metaDescription.length > 160) {
    score -= 5;
    issues.push({
      type: 'warning',
      message: 'Meta description is too long (truncated in search results)',
    });
  } else {
    issues.push({
      type: 'good',
      message: 'Meta description length is optimal',
    });
  }

  // 5. Keyword Density
  let keywordDensity = 0;
  if (targetKeyword && wordCount > 0) {
    const regex = new RegExp(targetKeyword, 'gi');
    const matchCount = (plainContent.match(regex) || []).length;
    keywordDensity = (matchCount / wordCount) * 100;

    if (keywordDensity === 0) {
      score -= 15;
      issues.push({
        type: 'critical',
        message: 'Main keyword not found in content',
      });
    } else if (keywordDensity > 2.5) {
      score -= 5;
      issues.push({
        type: 'warning',
        message: 'Keyword density is too high (potential keyword stuffing)',
      });
    } else {
      issues.push({
        type: 'good',
        message: 'Keyword density is good',
      });
    }
    
    // Check first paragraph
    const firstParagraph = plainContent.substring(0, 200).toLowerCase();
    if (!firstParagraph.includes(targetKeyword)) {
      score -= 5;
      issues.push({
        type: 'warning',
        message: 'Main keyword should appear in the first paragraph',
      });
    }
  }

  // Calculate Reading Time (avg 200 words/min)
  const readingTime = Math.ceil(wordCount / 200);

  return {
    score: Math.max(0, score),
    issues: issues.sort((a, b) => {
      // Sort: critical first, then warning, then good
      const impact = { critical: 0, warning: 1, good: 2 };
      return impact[a.type] - impact[b.type];
    }),
    metrics: {
      wordCount,
      keywordDensity,
      readingTime,
    },
  };
};
