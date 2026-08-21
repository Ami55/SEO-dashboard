/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PagePerformance, QueryPerformance, ClassificationRule, ClassifiedPagePerformance, ClassifiedQueryPerformance } from '../types';

// Run categorization rules on a single string URL
export function classifyUrl(url: string, rules: ClassificationRule[]): {
  city: string;
  category: string;
  pageType: string;
  hub: string;
} {
  let city = 'Unclassified';
  let category = 'Unclassified';
  let pageType = 'Unclassified';
  let hub = 'Unclassified';

  // Apply rules in order of definition (last rule matches override earlier ones, or vice versa, lets do in order)
  for (const rule of rules) {
    const pattern = rule.pattern.toLowerCase();
    const urlLower = url.toLowerCase();
    let isMatch = false;

    try {
      if (rule.matchType === 'contains' && urlLower.includes(pattern)) {
        isMatch = true;
      } else if (rule.matchType === 'starts_with' && urlLower.startsWith(pattern)) {
        isMatch = true;
      } else if (rule.matchType === 'ends_with' && urlLower.endsWith(pattern)) {
        isMatch = true;
      } else if (rule.matchType === 'regex') {
        const regex = new RegExp(rule.pattern, 'i');
        isMatch = regex.test(url);
      }
    } catch (e) {
      // safe fallback on invalid regex patterns
      isMatch = false;
    }

    if (isMatch) {
      if (rule.field === 'city') city = rule.targetValue;
      if (rule.field === 'category') category = rule.targetValue;
      if (rule.field === 'page_type') pageType = rule.targetValue;
      if (rule.field === 'hub') hub = rule.targetValue;
    }
  }

  return { city, category, pageType, hub };
}

// Classify entire datasets
export function classifyPageData(pages: PagePerformance[], rules: ClassificationRule[]): ClassifiedPagePerformance[] {
  return pages.map(p => {
    const categories = classifyUrl(p.page, rules);
    return {
      ...p,
      ...categories,
    };
  });
}

// Classify query strings (direct string check if they contain city name, category word or hub term)
export function classifyQueryData(
  queries: QueryPerformance[],
  rules: ClassificationRule[],
  classifiedPages: ClassifiedPagePerformance[] = []
): ClassifiedQueryPerformance[] {
  // If we have page data, try to see if query appears in page performance mapped to pages (otherwise fallback to direct text matching)
  return queries.map(q => {
    const queryStr = q.query.toLowerCase();
    let city = 'Unclassified';
    let category = 'Unclassified';
    let pageType = 'Unclassified';
    let hub = 'Unclassified';

    // Direct match queries based on patterns of rules
    for (const rule of rules) {
      const pattern = rule.pattern.replace(/[\/\-_]/g, '').toLowerCase().trim();
      if (!pattern) continue;

      if (queryStr.includes(pattern) || pattern.includes(queryStr)) {
        if (rule.field === 'city' && city === 'Unclassified') city = rule.targetValue;
        if (rule.field === 'category' && category === 'Unclassified') category = rule.targetValue;
        if (rule.field === 'hub' && hub === 'Unclassified') hub = rule.targetValue;
      }
    }

    return {
      ...q,
      city,
      category,
      pageType,
      hub,
    };
  });
}

// Struct for aggregate performance comparison
export interface AggregatedGroup {
  name: string;
  currentClicks: number;
  previousClicks: number;
  clicksDiff: number;
  clicksPctChange: number;
  
  currentImpressions: number;
  previousImpressions: number;
  impressionsDiff: number;
  
  currentCtr: number;
  previousCtr: number;
  
  currentAvgPosition: number;
  previousAvgPosition: number;
  positionDiff: number;
}

// Dynamically group page performance data by Dimension (city, category, pageType, hub)
export function aggregateByDimension(
  classifiedPages: ClassifiedPagePerformance[],
  dimension: 'city' | 'category' | 'pageType' | 'hub'
): AggregatedGroup[] {
  const groups: Record<string, { current: PagePerformance[]; previous: PagePerformance[] }> = {};

  // Split into current and previous records for each group item
  classifiedPages.forEach(p => {
    const key = p[dimension] || 'Unclassified';
    if (!groups[key]) {
      groups[key] = { current: [], previous: [] };
    }
    if (p.period === 'current') {
      groups[key].current.push(p);
    } else {
      groups[key].previous.push(p);
    }
  });

  const report: AggregatedGroup[] = [];

  Object.entries(groups).forEach(([name, data]) => {
    // Current totals
    const curClicks = data.current.reduce((acc, x) => acc + x.clicks, 0);
    const curImps = data.current.reduce((acc, x) => acc + x.impressions, 0);
    const curCtr = curImps > 0 ? (curClicks / curImps) : 0;
    
    // Average Position Weighted by Impressions (Strict Enterprise SEO Formula!)
    const curPosWeightSum = data.current.reduce((acc, x) => acc + (x.position * x.impressions), 0);
    const curAvgPos = curImps > 0 ? (curPosWeightSum / curImps) : 10;

    // Previous totals
    const prevClicks = data.previous.reduce((acc, x) => acc + x.clicks, 0);
    const prevImps = data.previous.reduce((acc, x) => acc + x.impressions, 0);
    const prevCtr = prevImps > 0 ? (prevClicks / prevImps) : 0;
    
    const prevPosWeightSum = data.previous.reduce((acc, x) => acc + (x.position * x.impressions), 0);
    const prevAvgPos = prevImps > 0 ? (prevPosWeightSum / prevImps) : 10;

    const clicksDiff = curClicks - prevClicks;
    const clicksPctChange = prevClicks > 0 ? (clicksDiff / prevClicks) * 100 : 0;
    const impressionsDiff = curImps - prevImps;
    
    // Position Difference (subtracting previous from current: e.g. current 2.5 - previous 3.5 = -1.0, which is top-tier ranking gain!)
    const positionDiff = curAvgPos - prevAvgPos;

    report.push({
      name,
      currentClicks: curClicks,
      previousClicks: prevClicks,
      clicksDiff,
      clicksPctChange,
      currentImpressions: curImps,
      previousImpressions: prevImps,
      impressionsDiff,
      currentCtr: curCtr * 100, // percentage string compatible
      previousCtr: prevCtr * 100,
      currentAvgPosition: curAvgPos,
      previousAvgPosition: prevAvgPos,
      positionDiff,
    });
  });

  return report;
}
