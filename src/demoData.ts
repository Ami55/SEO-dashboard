/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PagePerformance,
  QueryPerformance,
  CountryPerformance,
  DevicePerformance,
  SearchAppearancePerformance,
  DatePerformance,
  PageQueryPerformance,
  ClassificationRule,
  GscAnnotation,
  GscDailyPerformance,
} from './types';

export const DEMO_RULES: ClassificationRule[] = [
  // City rules (14 distinct cities)
  { id: 'rule-city-paris', field: 'city', matchType: 'contains', pattern: '/paris/', targetValue: 'Paris' },
  { id: 'rule-city-london', field: 'city', matchType: 'contains', pattern: '/london/', targetValue: 'London' },
  { id: 'rule-city-tokyo', field: 'city', matchType: 'contains', pattern: '/tokyo/', targetValue: 'Tokyo' },
  { id: 'rule-city-rome', field: 'city', matchType: 'contains', pattern: '/rome/', targetValue: 'Rome' },
  { id: 'rule-city-barcelona', field: 'city', matchType: 'contains', pattern: '/barcelona/', targetValue: 'Barcelona' },
  { id: 'rule-city-florence', field: 'city', matchType: 'contains', pattern: '/florence/', targetValue: 'Florence' },
  { id: 'rule-city-nyc', field: 'city', matchType: 'contains', pattern: '/new-york/', targetValue: 'New York' },
  { id: 'rule-city-amsterdam', field: 'city', matchType: 'contains', pattern: '/amsterdam/', targetValue: 'Amsterdam' },
  { id: 'rule-city-berlin', field: 'city', matchType: 'contains', pattern: '/berlin/', targetValue: 'Berlin' },
  { id: 'rule-city-madrid', field: 'city', matchType: 'contains', pattern: '/madrid/', targetValue: 'Madrid' },
  { id: 'rule-city-lisbon', field: 'city', matchType: 'contains', pattern: '/lisbon/', targetValue: 'Lisbon' },
  { id: 'rule-city-kyoto', field: 'city', matchType: 'contains', pattern: '/kyoto/', targetValue: 'Kyoto' },
  { id: 'rule-city-venice', field: 'city', matchType: 'contains', pattern: '/venice/', targetValue: 'Venice' },
  { id: 'rule-city-vienna', field: 'city', matchType: 'contains', pattern: '/vienna/', targetValue: 'Vienna' },

  // Category rules (12 distinct categories)
  { id: 'rule-cat-food', field: 'category', matchType: 'contains', pattern: '-tour', targetValue: 'Food Tours' },
  { id: 'rule-cat-wine', field: 'category', matchType: 'contains', pattern: 'wine', targetValue: 'Wine & Tasting' },
  { id: 'rule-cat-cooking', field: 'category', matchType: 'contains', pattern: 'cooking-class', targetValue: 'Cooking Classes' },
  { id: 'rule-cat-sushi', field: 'category', matchType: 'contains', pattern: 'sushi', targetValue: 'Street Food & Markets' },
  { id: 'rule-cat-history', field: 'category', matchType: 'contains', pattern: 'history', targetValue: 'History & Culture' },
  { id: 'rule-cat-pastry', field: 'category', matchType: 'contains', pattern: 'pastry', targetValue: 'Bakery & Sweets' },
  { id: 'rule-cat-croissant', field: 'category', matchType: 'contains', pattern: 'croissant', targetValue: 'Bakery & Sweets' },
  { id: 'rule-cat-tapas', field: 'category', matchType: 'contains', pattern: 'tapas', targetValue: 'Street Food & Markets' },
  { id: 'rule-cat-cheese', field: 'category', matchType: 'contains', pattern: 'cheese', targetValue: 'Wine & Tasting' },
  { id: 'rule-cat-tea', field: 'category', matchType: 'contains', pattern: 'afternoon-tea', targetValue: 'Bakery & Sweets' },
  { id: 'rule-cat-beer', field: 'category', matchType: 'contains', pattern: 'beer', targetValue: 'Craft Beer & Pubs' },
  { id: 'rule-cat-pub', field: 'category', matchType: 'contains', pattern: 'pub', targetValue: 'Craft Beer & Pubs' },
  { id: 'rule-cat-coffee', field: 'category', matchType: 'contains', pattern: 'coffee', targetValue: 'Coffee & Cafes' },
  { id: 'rule-cat-cafe', field: 'category', matchType: 'contains', pattern: 'cafe', targetValue: 'Coffee & Cafes' },
  { id: 'rule-cat-vegan', field: 'category', matchType: 'contains', pattern: 'vegan', targetValue: 'Vegan & Plant-Based' },
  { id: 'rule-cat-plant', field: 'category', matchType: 'contains', pattern: 'plant-based', targetValue: 'Vegan & Plant-Based' },
  { id: 'rule-cat-seafood', field: 'category', matchType: 'contains', pattern: 'seafood', targetValue: 'Seafood Specialties' },
  { id: 'rule-cat-oyster', field: 'category', matchType: 'contains', pattern: 'oyster', targetValue: 'Seafood Specialties' },
  { id: 'rule-cat-rooftop', field: 'category', matchType: 'contains', pattern: 'rooftop', targetValue: 'Rooftop & Fine Dining' },
  { id: 'rule-cat-michelin', field: 'category', matchType: 'contains', pattern: 'michelin', targetValue: 'Rooftop & Fine Dining' },
  { id: 'rule-cat-night', field: 'category', matchType: 'contains', pattern: 'night-market', targetValue: 'Night Markets & Late Bites' },
  { id: 'rule-cat-late', field: 'category', matchType: 'contains', pattern: 'late-night', targetValue: 'Night Markets & Late Bites' },

  // Page Type rules
  { id: 'rule-type-blog', field: 'page_type', matchType: 'contains', pattern: '/guide/', targetValue: 'Editorial Guide' },
  { id: 'rule-type-tour', field: 'page_type', matchType: 'contains', pattern: '/tour/', targetValue: 'Tour Booking' },
  { id: 'rule-type-booking', field: 'page_type', matchType: 'contains', pattern: 'booking', targetValue: 'Checkout / Booking' },
  { id: 'rule-type-hub', field: 'page_type', matchType: 'contains', pattern: '/hub/', targetValue: 'City Hub' },

  // Hub rules
  { id: 'rule-hub-paris', field: 'hub', matchType: 'contains', pattern: '/paris/', targetValue: 'Paris Hub' },
  { id: 'rule-hub-london', field: 'hub', matchType: 'contains', pattern: '/london/', targetValue: 'London Hub' },
  { id: 'rule-hub-tokyo', field: 'hub', matchType: 'contains', pattern: '/tokyo/', targetValue: 'Tokyo Hub' },
  { id: 'rule-hub-rome', field: 'hub', matchType: 'contains', pattern: '/rome/', targetValue: 'Rome Hub' },
  { id: 'rule-hub-barcelona', field: 'hub', matchType: 'contains', pattern: '/barcelona/', targetValue: 'Barcelona Hub' },
  { id: 'rule-hub-florence', field: 'hub', matchType: 'contains', pattern: '/florence/', targetValue: 'Florence Hub' },
  { id: 'rule-hub-nyc', field: 'hub', matchType: 'contains', pattern: '/new-york/', targetValue: 'New York Hub' },
  { id: 'rule-hub-amsterdam', field: 'hub', matchType: 'contains', pattern: '/amsterdam/', targetValue: 'Amsterdam Hub' },
  { id: 'rule-hub-berlin', field: 'hub', matchType: 'contains', pattern: '/berlin/', targetValue: 'Berlin Hub' },
  { id: 'rule-hub-madrid', field: 'hub', matchType: 'contains', pattern: '/madrid/', targetValue: 'Madrid Hub' },
  { id: 'rule-hub-lisbon', field: 'hub', matchType: 'contains', pattern: '/lisbon/', targetValue: 'Lisbon Hub' },
  { id: 'rule-hub-kyoto', field: 'hub', matchType: 'contains', pattern: '/kyoto/', targetValue: 'Kyoto Hub' },
];

export const DEMO_PAGES_PREVIOUS: PagePerformance[] = [
  // 1. Paris
  { page: 'https://gourmetwalks.com/paris/tour/historic-marais-food-tour', clicks: 1800, impressions: 22000, ctr: 0.081, position: 2.3, period: 'previous' },
  { page: 'https://gourmetwalks.com/paris/tour/baguette-and-pastry-crawl', clicks: 1200, impressions: 15400, ctr: 0.077, position: 3.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/paris/tour/secret-wine-cellars', clicks: 650, impressions: 9800, ctr: 0.066, position: 4.8, period: 'previous' },
  { page: 'https://gourmetwalks.com/paris/guide/best-croissants-paris', clicks: 350, impressions: 18000, ctr: 0.019, position: 6.2, period: 'previous' },
  { page: 'https://gourmetwalks.com/paris/guide/french-cheese-selection', clicks: 200, impressions: 12000, ctr: 0.016, position: 8.5, period: 'previous' },
  { page: 'https://gourmetwalks.com/paris/tour/montmartre-bistro-secrets', clicks: 420, impressions: 6800, ctr: 0.061, position: 4.5, period: 'previous' },
  { page: 'https://gourmetwalks.com/paris/tour/rooftop-michelin-champagne-experience', clicks: 280, impressions: 4300, ctr: 0.065, position: 5.1, period: 'previous' },
  
  // 2. London
  { page: 'https://gourmetwalks.com/london/tour/east-end-food-tour', clicks: 950, impressions: 14000, ctr: 0.067, position: 3.5, period: 'previous' },
  { page: 'https://gourmetwalks.com/london/tour/soho-pub-and-history-walk', clicks: 550, impressions: 8500, ctr: 0.064, position: 4.2, period: 'previous' },
  { page: 'https://gourmetwalks.com/london/guide/traditional-afternoon-tea', clicks: 300, impressions: 11000, ctr: 0.027, position: 5.9, period: 'previous' },
  { page: 'https://gourmetwalks.com/london/tour/borough-market-tasting', clicks: 510, impressions: 7200, ctr: 0.070, position: 3.8, period: 'previous' },
  { page: 'https://gourmetwalks.com/london/tour/craft-beer-bermondsey-mile', clicks: 380, impressions: 5900, ctr: 0.064, position: 4.6, period: 'previous' },
  { page: 'https://gourmetwalks.com/london/guide/vegan-plant-based-shoreditch', clicks: 220, impressions: 7400, ctr: 0.029, position: 6.8, period: 'previous' },
  
  // 3. Tokyo
  { page: 'https://gourmetwalks.com/tokyo/tour/shinjuku-food-tour', clicks: 450, impressions: 8200, ctr: 0.054, position: 5.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/tokyo/tour/tsukiji-fish-market-crawl', clicks: 250, impressions: 4500, ctr: 0.055, position: 4.9, period: 'previous' },
  { page: 'https://gourmetwalks.com/tokyo/guide/shibuya-food-vendors', clicks: 100, impressions: 16000, ctr: 0.006, position: 10.4, period: 'previous' },
  { page: 'https://gourmetwalks.com/tokyo/tour/ramen-tasting-flight', clicks: 180, impressions: 3900, ctr: 0.046, position: 6.8, period: 'previous' },
  { page: 'https://gourmetwalks.com/tokyo/tour/shinjuku-night-market-izakaya-crawl', clicks: 320, impressions: 5200, ctr: 0.061, position: 4.4, period: 'previous' },
  
  // 4. Rome
  { page: 'https://gourmetwalks.com/rome/tour/trastevere-dinner-crawl', clicks: 1700, impressions: 21000, ctr: 0.080, position: 1.8, period: 'previous' },
  { page: 'https://gourmetwalks.com/rome/tour/pasta-cooking-class', clicks: 900, impressions: 11200, ctr: 0.080, position: 2.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/rome/guide/where-to-eat-carbonara', clicks: 500, impressions: 15000, ctr: 0.033, position: 4.4, period: 'previous' },
  { page: 'https://gourmetwalks.com/rome/tour/vatican-gelato-walk', clicks: 310, impressions: 4600, ctr: 0.067, position: 3.9, period: 'previous' },
  { page: 'https://gourmetwalks.com/rome/guide/historic-espresso-coffee-culture', clicks: 240, impressions: 6800, ctr: 0.035, position: 5.6, period: 'previous' },

  // 5. Barcelona
  { page: 'https://gourmetwalks.com/barcelona/tour/gothic-quarter-tapas-crawl', clicks: 680, impressions: 9400, ctr: 0.072, position: 3.2, period: 'previous' },
  { page: 'https://gourmetwalks.com/barcelona/guide/best-paella-beachside', clicks: 220, impressions: 8900, ctr: 0.024, position: 7.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/barcelona/tour/el-born-natural-wine-walk', clicks: 340, impressions: 4800, ctr: 0.070, position: 4.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/barcelona/tour/seafood-boqueria-market-tour', clicks: 410, impressions: 6100, ctr: 0.067, position: 3.8, period: 'previous' },

  // 6. Florence
  { page: 'https://gourmetwalks.com/florence/tour/tuscan-wine-and-steak-tour', clicks: 540, impressions: 7800, ctr: 0.069, position: 3.6, period: 'previous' },
  { page: 'https://gourmetwalks.com/florence/tour/san-lorenzo-market-cooking-class', clicks: 380, impressions: 5200, ctr: 0.073, position: 3.4, period: 'previous' },
  { page: 'https://gourmetwalks.com/florence/guide/best-gelato-florence-history', clicks: 190, impressions: 6500, ctr: 0.029, position: 6.4, period: 'previous' },

  // 7. New York
  { page: 'https://gourmetwalks.com/new-york/tour/lower-east-side-food-tour', clicks: 1100, impressions: 16500, ctr: 0.066, position: 3.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/new-york/tour/greenwich-village-pastry-crawl', clicks: 620, impressions: 9200, ctr: 0.067, position: 3.7, period: 'previous' },
  { page: 'https://gourmetwalks.com/new-york/guide/brooklyn-specialty-coffee-cafes', clicks: 280, impressions: 8400, ctr: 0.033, position: 5.8, period: 'previous' },
  { page: 'https://gourmetwalks.com/new-york/tour/queens-night-market-late-bites', clicks: 450, impressions: 6700, ctr: 0.067, position: 4.2, period: 'previous' },

  // 8. Amsterdam
  { page: 'https://gourmetwalks.com/amsterdam/tour/jordaan-food-and-craft-beer-walk', clicks: 490, impressions: 7100, ctr: 0.069, position: 3.8, period: 'previous' },
  { page: 'https://gourmetwalks.com/amsterdam/guide/dutch-cheese-stroopwafel-pastry', clicks: 260, impressions: 7800, ctr: 0.033, position: 6.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/amsterdam/tour/vegan-plant-based-canal-cruise', clicks: 310, impressions: 4600, ctr: 0.067, position: 4.5, period: 'previous' },

  // 9. Berlin
  { page: 'https://gourmetwalks.com/berlin/tour/kreuzberg-street-food-beer-tour', clicks: 520, impressions: 7600, ctr: 0.068, position: 3.7, period: 'previous' },
  { page: 'https://gourmetwalks.com/berlin/guide/neukolln-third-wave-coffee-cafes', clicks: 210, impressions: 6200, ctr: 0.033, position: 6.3, period: 'previous' },
  { page: 'https://gourmetwalks.com/berlin/tour/vegan-plant-based-food-tour', clicks: 390, impressions: 5800, ctr: 0.067, position: 3.9, period: 'previous' },

  // 10. Madrid
  { page: 'https://gourmetwalks.com/madrid/tour/historic-taverns-and-tapas-crawl', clicks: 610, impressions: 8800, ctr: 0.069, position: 3.4, period: 'previous' },
  { page: 'https://gourmetwalks.com/madrid/tour/san-miguel-market-wine-tasting', clicks: 430, impressions: 6400, ctr: 0.067, position: 4.0, period: 'previous' },
  { page: 'https://gourmetwalks.com/madrid/guide/churros-and-chocolaterias-guide', clicks: 240, impressions: 7200, ctr: 0.033, position: 5.9, period: 'previous' },

  // 11. Lisbon
  { page: 'https://gourmetwalks.com/lisbon/tour/alfama-fado-seafood-and-wine-tour', clicks: 480, impressions: 6900, ctr: 0.069, position: 3.9, period: 'previous' },
  { page: 'https://gourmetwalks.com/lisbon/guide/pasteis-de-nata-pastry-secrets', clicks: 320, impressions: 9400, ctr: 0.034, position: 5.4, period: 'previous' },
  { page: 'https://gourmetwalks.com/lisbon/tour/seafood-oyster-tasting-market', clicks: 290, impressions: 4100, ctr: 0.070, position: 4.3, period: 'previous' },

  // 12. Kyoto
  { page: 'https://gourmetwalks.com/kyoto/tour/gion-tea-ceremony-and-pastry-walk', clicks: 390, impressions: 5800, ctr: 0.067, position: 4.2, period: 'previous' },
  { page: 'https://gourmetwalks.com/kyoto/tour/nishiki-market-cooking-class', clicks: 310, impressions: 4500, ctr: 0.068, position: 3.9, period: 'previous' },
  { page: 'https://gourmetwalks.com/kyoto/guide/matcha-desserts-history-guide', clicks: 180, impressions: 5900, ctr: 0.030, position: 6.7, period: 'previous' },

  // 13. Venice
  { page: 'https://gourmetwalks.com/venice/tour/cicchetti-and-wine-bar-crawl', clicks: 460, impressions: 6400, ctr: 0.071, position: 3.5, period: 'previous' },
  { page: 'https://gourmetwalks.com/venice/tour/rialto-seafood-market-tour', clicks: 330, impressions: 4800, ctr: 0.068, position: 4.1, period: 'previous' },

  // 14. Vienna
  { page: 'https://gourmetwalks.com/vienna/tour/traditional-coffee-house-pastry-walk', clicks: 410, impressions: 5700, ctr: 0.071, position: 3.6, period: 'previous' },
  { page: 'https://gourmetwalks.com/vienna/guide/sachertorte-apple-strudel-history', clicks: 220, impressions: 6800, ctr: 0.032, position: 6.0, period: 'previous' },
];

export const DEMO_PAGES_CURRENT: PagePerformance[] = [
  // 1. Paris (Gained traffic)
  { page: 'https://gourmetwalks.com/paris/tour/historic-marais-food-tour', clicks: 2400, impressions: 26500, ctr: 0.090, position: 1.9, period: 'current' },
  { page: 'https://gourmetwalks.com/paris/tour/baguette-and-pastry-crawl', clicks: 1550, impressions: 17800, ctr: 0.087, position: 2.5, period: 'current' },
  { page: 'https://gourmetwalks.com/paris/tour/secret-wine-cellars', clicks: 780, impressions: 10200, ctr: 0.076, position: 4.1, period: 'current' },
  { page: 'https://gourmetwalks.com/paris/guide/best-croissants-paris', clicks: 450, impressions: 21000, ctr: 0.021, position: 6.0, period: 'current' },
  { page: 'https://gourmetwalks.com/paris/guide/french-cheese-selection', clicks: 220, impressions: 11500, ctr: 0.019, position: 8.0, period: 'current' },
  { page: 'https://gourmetwalks.com/paris/tour/montmartre-bistro-secrets', clicks: 540, impressions: 7600, ctr: 0.071, position: 3.9, period: 'current' },
  { page: 'https://gourmetwalks.com/paris/tour/rooftop-michelin-champagne-experience', clicks: 390, impressions: 5100, ctr: 0.076, position: 3.8, period: 'current' },
  
  // 2. London (Steady growth)
  { page: 'https://gourmetwalks.com/london/tour/east-end-food-tour', clicks: 1080, impressions: 15200, ctr: 0.071, position: 3.2, period: 'current' },
  { page: 'https://gourmetwalks.com/london/tour/soho-pub-and-history-walk', clicks: 620, impressions: 9100, ctr: 0.068, position: 3.9, period: 'current' },
  { page: 'https://gourmetwalks.com/london/guide/traditional-afternoon-tea', clicks: 350, impressions: 12500, ctr: 0.028, position: 5.5, period: 'current' },
  { page: 'https://gourmetwalks.com/london/tour/borough-market-tasting', clicks: 640, impressions: 8400, ctr: 0.076, position: 3.2, period: 'current' },
  { page: 'https://gourmetwalks.com/london/tour/craft-beer-bermondsey-mile', clicks: 510, impressions: 7100, ctr: 0.071, position: 3.7, period: 'current' },
  { page: 'https://gourmetwalks.com/london/guide/vegan-plant-based-shoreditch', clicks: 340, impressions: 9800, ctr: 0.034, position: 5.2, period: 'current' },
  
  // 3. Tokyo (Huge Organic Win)
  { page: 'https://gourmetwalks.com/tokyo/tour/shinjuku-food-tour', clicks: 820, impressions: 12400, ctr: 0.066, position: 3.4, period: 'current' },
  { page: 'https://gourmetwalks.com/tokyo/tour/tsukiji-fish-market-crawl', clicks: 480, impressions: 7200, ctr: 0.066, position: 3.6, period: 'current' },
  { page: 'https://gourmetwalks.com/tokyo/guide/shibuya-food-vendors', clicks: 200, impressions: 28000, ctr: 0.007, position: 9.9, period: 'current' },
  { page: 'https://gourmetwalks.com/tokyo/tour/ramen-tasting-flight', clicks: 360, impressions: 6100, ctr: 0.059, position: 4.8, period: 'current' },
  { page: 'https://gourmetwalks.com/tokyo/tour/shinjuku-night-market-izakaya-crawl', clicks: 580, impressions: 7900, ctr: 0.073, position: 3.1, period: 'current' },
  
  // 4. Rome (Ranking Slippage)
  { page: 'https://gourmetwalks.com/rome/tour/trastevere-dinner-crawl', clicks: 1300, impressions: 19800, ctr: 0.065, position: 3.1, period: 'current' },
  { page: 'https://gourmetwalks.com/rome/tour/pasta-cooking-class', clicks: 750, impressions: 10500, ctr: 0.071, position: 2.6, period: 'current' },
  { page: 'https://gourmetwalks.com/rome/guide/where-to-eat-carbonara', clicks: 350, impressions: 13200, ctr: 0.026, position: 5.2, period: 'current' },
  { page: 'https://gourmetwalks.com/rome/tour/vatican-gelato-walk', clicks: 240, impressions: 3900, ctr: 0.061, position: 4.4, period: 'current' },
  { page: 'https://gourmetwalks.com/rome/guide/historic-espresso-coffee-culture', clicks: 190, impressions: 5900, ctr: 0.032, position: 6.2, period: 'current' },

  // 5. Barcelona (Strong growth)
  { page: 'https://gourmetwalks.com/barcelona/tour/gothic-quarter-tapas-crawl', clicks: 890, impressions: 11200, ctr: 0.079, position: 2.7, period: 'current' },
  { page: 'https://gourmetwalks.com/barcelona/guide/best-paella-beachside', clicks: 310, impressions: 10400, ctr: 0.029, position: 6.2, period: 'current' },
  { page: 'https://gourmetwalks.com/barcelona/tour/el-born-natural-wine-walk', clicks: 490, impressions: 6300, ctr: 0.077, position: 3.2, period: 'current' },
  { page: 'https://gourmetwalks.com/barcelona/tour/seafood-boqueria-market-tour', clicks: 580, impressions: 7800, ctr: 0.074, position: 2.9, period: 'current' },

  // 6. Florence
  { page: 'https://gourmetwalks.com/florence/tour/tuscan-wine-and-steak-tour', clicks: 710, impressions: 9400, ctr: 0.075, position: 2.8, period: 'current' },
  { page: 'https://gourmetwalks.com/florence/tour/san-lorenzo-market-cooking-class', clicks: 490, impressions: 6300, ctr: 0.077, position: 2.9, period: 'current' },
  { page: 'https://gourmetwalks.com/florence/guide/best-gelato-florence-history', clicks: 280, impressions: 7900, ctr: 0.035, position: 5.5, period: 'current' },

  // 7. New York
  { page: 'https://gourmetwalks.com/new-york/tour/lower-east-side-food-tour', clicks: 1450, impressions: 19800, ctr: 0.073, position: 2.5, period: 'current' },
  { page: 'https://gourmetwalks.com/new-york/tour/greenwich-village-pastry-crawl', clicks: 830, impressions: 11200, ctr: 0.074, position: 3.0, period: 'current' },
  { page: 'https://gourmetwalks.com/new-york/guide/brooklyn-specialty-coffee-cafes', clicks: 420, impressions: 11000, ctr: 0.038, position: 4.7, period: 'current' },
  { page: 'https://gourmetwalks.com/new-york/tour/queens-night-market-late-bites', clicks: 680, impressions: 9100, ctr: 0.074, position: 3.3, period: 'current' },

  // 8. Amsterdam
  { page: 'https://gourmetwalks.com/amsterdam/tour/jordaan-food-and-craft-beer-walk', clicks: 640, impressions: 8800, ctr: 0.072, position: 3.1, period: 'current' },
  { page: 'https://gourmetwalks.com/amsterdam/guide/dutch-cheese-stroopwafel-pastry', clicks: 350, impressions: 9400, ctr: 0.037, position: 5.3, period: 'current' },
  { page: 'https://gourmetwalks.com/amsterdam/tour/vegan-plant-based-canal-cruise', clicks: 470, impressions: 6300, ctr: 0.074, position: 3.6, period: 'current' },

  // 9. Berlin
  { page: 'https://gourmetwalks.com/berlin/tour/kreuzberg-street-food-beer-tour', clicks: 690, impressions: 9300, ctr: 0.074, position: 3.0, period: 'current' },
  { page: 'https://gourmetwalks.com/berlin/guide/neukolln-third-wave-coffee-cafes', clicks: 320, impressions: 8100, ctr: 0.039, position: 5.4, period: 'current' },
  { page: 'https://gourmetwalks.com/berlin/tour/vegan-plant-based-food-tour', clicks: 540, impressions: 7400, ctr: 0.073, position: 3.2, period: 'current' },

  // 10. Madrid
  { page: 'https://gourmetwalks.com/madrid/tour/historic-taverns-and-tapas-crawl', clicks: 820, impressions: 10900, ctr: 0.075, position: 2.8, period: 'current' },
  { page: 'https://gourmetwalks.com/madrid/tour/san-miguel-market-wine-tasting', clicks: 590, impressions: 8100, ctr: 0.072, position: 3.3, period: 'current' },
  { page: 'https://gourmetwalks.com/madrid/guide/churros-and-chocolaterias-guide', clicks: 340, impressions: 9200, ctr: 0.036, position: 5.1, period: 'current' },

  // 11. Lisbon
  { page: 'https://gourmetwalks.com/lisbon/tour/alfama-fado-seafood-and-wine-tour', clicks: 670, impressions: 8700, ctr: 0.077, position: 3.1, period: 'current' },
  { page: 'https://gourmetwalks.com/lisbon/guide/pasteis-de-nata-pastry-secrets', clicks: 460, impressions: 12100, ctr: 0.038, position: 4.6, period: 'current' },
  { page: 'https://gourmetwalks.com/lisbon/tour/seafood-oyster-tasting-market', clicks: 410, impressions: 5400, ctr: 0.075, position: 3.4, period: 'current' },

  // 12. Kyoto
  { page: 'https://gourmetwalks.com/kyoto/tour/gion-tea-ceremony-and-pastry-walk', clicks: 580, impressions: 7900, ctr: 0.073, position: 3.4, period: 'current' },
  { page: 'https://gourmetwalks.com/kyoto/tour/nishiki-market-cooking-class', clicks: 460, impressions: 6100, ctr: 0.075, position: 3.1, period: 'current' },
  { page: 'https://gourmetwalks.com/kyoto/guide/matcha-desserts-history-guide', clicks: 290, impressions: 8200, ctr: 0.035, position: 5.6, period: 'current' },

  // 13. Venice
  { page: 'https://gourmetwalks.com/venice/tour/cicchetti-and-wine-bar-crawl', clicks: 620, impressions: 8100, ctr: 0.076, position: 2.9, period: 'current' },
  { page: 'https://gourmetwalks.com/venice/tour/rialto-seafood-market-tour', clicks: 450, impressions: 6100, ctr: 0.073, position: 3.3, period: 'current' },

  // 14. Vienna
  { page: 'https://gourmetwalks.com/vienna/tour/traditional-coffee-house-pastry-walk', clicks: 560, impressions: 7400, ctr: 0.075, position: 3.0, period: 'current' },
  { page: 'https://gourmetwalks.com/vienna/guide/sachertorte-apple-strudel-history', clicks: 310, impressions: 8600, ctr: 0.036, position: 5.2, period: 'current' },
];

export const DEMO_QUERIES_PREVIOUS: QueryPerformance[] = [
  { query: 'paris food tour', clicks: 850, impressions: 9200, ctr: 0.092, position: 2.1, period: 'previous' },
  { query: 'best croissants in paris', clicks: 210, impressions: 14000, ctr: 0.015, position: 6.8, period: 'previous' },
  { query: 'historic marais architecture tour', clicks: 120, impressions: 1500, ctr: 0.080, position: 1.4, period: 'previous' },
  { query: 'paris secret wine cellar tour', clicks: 95, impressions: 1100, ctr: 0.086, position: 1.8, period: 'previous' },
  { query: 'french cheese selection guide', clicks: 40, impressions: 5200, ctr: 0.007, position: 9.1, period: 'previous' },
  { query: 'london pub guided walk', clicks: 430, impressions: 4500, ctr: 0.095, position: 2.3, period: 'previous' },
  { query: 'east london street food crawl', clicks: 380, impressions: 4100, ctr: 0.092, position: 2.5, period: 'previous' },
  { query: 'afternoon tea royal heritage facts', clicks: 35, impressions: 4800, ctr: 0.007, position: 8.9, period: 'previous' },
  { query: 'shinjuku alley food stalls', clicks: 160, impressions: 2200, ctr: 0.072, position: 4.8, period: 'previous' },
  { query: 'tokyo fish market sushi crawl', clicks: 90, impressions: 1400, ctr: 0.064, position: 4.3, period: 'previous' },
  { query: 'shibuya yakitori vendors list', clicks: 20, impressions: 9000, ctr: 0.002, position: 12.1, period: 'previous' },
  { query: 'rome food crawl trastevere', clicks: 680, impressions: 6500, ctr: 0.104, position: 1.6, period: 'previous' },
  { query: 'pasta making class rome', clicks: 420, impressions: 4400, ctr: 0.095, position: 1.7, period: 'previous' },
  { query: 'where to eat authentic carbonara rome', clicks: 180, impressions: 8200, ctr: 0.021, position: 4.2, period: 'previous' },
  { query: 'barcelona gothic quarter tapas tour', clicks: 310, impressions: 4200, ctr: 0.073, position: 3.4, period: 'previous' },
  { query: 'florence wine and steak walk', clicks: 240, impressions: 3600, ctr: 0.066, position: 3.8, period: 'previous' },
  { query: 'nyc lower east side history food', clicks: 490, impressions: 7200, ctr: 0.068, position: 3.3, period: 'previous' },
  { query: 'amsterdam craft beer jordaan walk', clicks: 210, impressions: 3200, ctr: 0.065, position: 4.0, period: 'previous' },
  { query: 'berlin kreuzberg street food tour', clicks: 230, impressions: 3400, ctr: 0.067, position: 3.9, period: 'previous' },
  { query: 'madrid historic tapas tour', clicks: 280, impressions: 4100, ctr: 0.068, position: 3.6, period: 'previous' },
  { query: 'lisbon fado and seafood tour', clicks: 220, impressions: 3100, ctr: 0.070, position: 4.1, period: 'previous' },
  { query: 'kyoto tea ceremony gion walk', clicks: 180, impressions: 2700, ctr: 0.066, position: 4.4, period: 'previous' },
];

export const DEMO_QUERIES_CURRENT: QueryPerformance[] = [
  { query: 'paris food tour', clicks: 1120, impressions: 11000, ctr: 0.101, position: 1.6, period: 'current' },
  { query: 'best croissants in paris', clicks: 310, impressions: 17500, ctr: 0.017, position: 5.9, period: 'current' },
  { query: 'historic marais architecture tour', clicks: 170, impressions: 1900, ctr: 0.089, position: 1.2, period: 'current' },
  { query: 'paris secret wine cellar tour', clicks: 132, impressions: 1450, ctr: 0.091, position: 1.5, period: 'current' },
  { query: 'french cheese selection guide', clicks: 55, impressions: 6800, ctr: 0.008, position: 8.2, period: 'current' },
  { query: 'london pub guided walk', clicks: 490, impressions: 5200, ctr: 0.094, position: 2.1, period: 'current' },
  { query: 'east london street food crawl', clicks: 430, impressions: 4800, ctr: 0.089, position: 2.6, period: 'current' },
  { query: 'afternoon tea royal heritage facts', clicks: 45, impressions: 6200, ctr: 0.007, position: 8.0, period: 'current' },
  { query: 'shinjuku alley food stalls', clicks: 340, impressions: 4100, ctr: 0.082, position: 3.2, period: 'current' },
  { query: 'tokyo fish market sushi crawl', clicks: 210, impressions: 2900, ctr: 0.072, position: 3.1, period: 'current' },
  { query: 'shibuya yakitori vendors list', clicks: 98, impressions: 23000, ctr: 0.004, position: 9.1, period: 'current' },
  { query: 'rome food crawl trastevere', clicks: 450, impressions: 6200, ctr: 0.072, position: 2.8, period: 'current' },
  { query: 'pasta making class rome', clicks: 310, impressions: 4100, ctr: 0.075, position: 2.2, period: 'current' },
  { query: 'where to eat authentic carbonara rome', clicks: 120, impressions: 9400, ctr: 0.012, position: 5.1, period: 'current' },
  { query: 'barcelona gothic quarter tapas tour', clicks: 440, impressions: 5300, ctr: 0.083, position: 2.6, period: 'current' },
  { query: 'florence wine and steak walk', clicks: 360, impressions: 4600, ctr: 0.078, position: 2.9, period: 'current' },
  { query: 'nyc lower east side history food', clicks: 680, impressions: 9100, ctr: 0.074, position: 2.6, period: 'current' },
  { query: 'amsterdam craft beer jordaan walk', clicks: 310, impressions: 4200, ctr: 0.073, position: 3.2, period: 'current' },
  { query: 'berlin kreuzberg street food tour', clicks: 340, impressions: 4500, ctr: 0.075, position: 3.1, period: 'current' },
  { query: 'madrid historic tapas tour', clicks: 410, impressions: 5400, ctr: 0.075, position: 2.9, period: 'current' },
  { query: 'lisbon fado and seafood tour', clicks: 330, impressions: 4200, ctr: 0.078, position: 3.2, period: 'current' },
  { query: 'kyoto tea ceremony gion walk', clicks: 290, impressions: 3800, ctr: 0.076, position: 3.3, period: 'current' },
];

export const DEMO_COUNTRIES_PREVIOUS: CountryPerformance[] = [
  { country: 'United States', clicks: 6200, impressions: 88000, ctr: 0.070, position: 3.3, period: 'previous' },
  { country: 'United Kingdom', clicks: 3400, impressions: 48000, ctr: 0.070, position: 3.1, period: 'previous' },
  { country: 'France', clicks: 2100, impressions: 29500, ctr: 0.071, position: 2.8, period: 'previous' },
  { country: 'Germany', clicks: 1450, impressions: 24000, ctr: 0.060, position: 4.2, period: 'previous' },
  { country: 'Australia', clicks: 1180, impressions: 16800, ctr: 0.070, position: 3.8, period: 'previous' },
  { country: 'Canada', clicks: 990, impressions: 14500, ctr: 0.068, position: 3.7, period: 'previous' },
  { country: 'Italy', clicks: 880, impressions: 15200, ctr: 0.057, position: 3.9, period: 'previous' },
  { country: 'Spain', clicks: 760, impressions: 12400, ctr: 0.061, position: 4.0, period: 'previous' },
  { country: 'Netherlands', clicks: 620, impressions: 9800, ctr: 0.063, position: 3.9, period: 'previous' },
  { country: 'Japan', clicks: 510, impressions: 11400, ctr: 0.044, position: 5.4, period: 'previous' },
];

export const DEMO_COUNTRIES_CURRENT: CountryPerformance[] = [
  { country: 'United States', clicks: 8100, impressions: 108000, ctr: 0.075, position: 2.9, period: 'current' },
  { country: 'United Kingdom', clicks: 4300, impressions: 56500, ctr: 0.076, position: 2.8, period: 'current' },
  { country: 'France', clicks: 2850, impressions: 36200, ctr: 0.078, position: 2.5, period: 'current' },
  { country: 'Germany', clicks: 1920, impressions: 28100, ctr: 0.068, position: 3.8, period: 'current' },
  { country: 'Australia', clicks: 1540, impressions: 20400, ctr: 0.075, position: 3.5, period: 'current' },
  { country: 'Canada', clicks: 1320, impressions: 18100, ctr: 0.072, position: 3.4, period: 'current' },
  { country: 'Italy', clicks: 950, impressions: 16100, ctr: 0.059, position: 4.1, period: 'current' },
  { country: 'Spain', clicks: 1080, impressions: 15900, ctr: 0.067, position: 3.5, period: 'current' },
  { country: 'Netherlands', clicks: 890, impressions: 12900, ctr: 0.068, position: 3.4, period: 'current' },
  { country: 'Japan', clicks: 1180, impressions: 22200, ctr: 0.053, position: 3.9, period: 'current' },
];

export const DEMO_DEVICES_PREVIOUS: DevicePerformance[] = [
  { device: 'MOBILE', clicks: 11800, impressions: 166000, ctr: 0.071, position: 3.5, period: 'previous' },
  { device: 'DESKTOP', clicks: 6600, impressions: 81000, ctr: 0.081, position: 3.0, period: 'previous' },
  { device: 'TABLET', clicks: 650, impressions: 9200, ctr: 0.070, position: 3.8, period: 'previous' },
];

export const DEMO_DEVICES_CURRENT: DevicePerformance[] = [
  { device: 'MOBILE', clicks: 15400, impressions: 206000, ctr: 0.074, position: 3.2, period: 'current' },
  { device: 'DESKTOP', clicks: 8250, impressions: 98500, ctr: 0.083, position: 2.7, period: 'current' },
  { device: 'TABLET', clicks: 890, impressions: 11800, ctr: 0.075, position: 3.4, period: 'current' },
];

export const DEMO_APPEARANCE_PREVIOUS: SearchAppearancePerformance[] = [
  { appearance: 'Good Page Experience', clicks: 14100, impressions: 190000, ctr: 0.074, position: 3.1, period: 'previous' },
  { appearance: 'Rich Results (Review Snippets)', clicks: 3900, impressions: 44000, ctr: 0.088, position: 2.3, period: 'previous' },
  { appearance: 'Videos / Media', clicks: 820, impressions: 17400, ctr: 0.047, position: 4.5, period: 'previous' },
  { appearance: 'Merchant Listings', clicks: 630, impressions: 9800, ctr: 0.064, position: 3.4, period: 'previous' },
];

export const DEMO_APPEARANCE_CURRENT: SearchAppearancePerformance[] = [
  { appearance: 'Good Page Experience', clicks: 18200, impressions: 238000, ctr: 0.076, position: 2.8, period: 'current' },
  { appearance: 'Rich Results (Review Snippets)', clicks: 5200, impressions: 56500, ctr: 0.092, position: 2.0, period: 'current' },
  { appearance: 'Videos / Media', clicks: 1180, impressions: 23000, ctr: 0.051, position: 3.9, period: 'current' },
  { appearance: 'Merchant Listings', clicks: 960, impressions: 12600, ctr: 0.076, position: 3.0, period: 'current' },
];

export const DEMO_DATES_CURRENT: DatePerformance[] = [
  { date: '2026-08-01', clicks: 680, impressions: 8900, ctr: 0.076, position: 3.1, period: 'current' },
  { date: '2026-08-02', clicks: 710, impressions: 9200, ctr: 0.077, position: 3.0, period: 'current' },
  { date: '2026-08-03', clicks: 750, impressions: 9800, ctr: 0.076, position: 3.0, period: 'current' },
  { date: '2026-08-04', clicks: 790, impressions: 10300, ctr: 0.076, position: 2.9, period: 'current' },
  { date: '2026-08-05', clicks: 840, impressions: 10900, ctr: 0.077, position: 2.8, period: 'current' },
  { date: '2026-08-06', clicks: 890, impressions: 11400, ctr: 0.078, position: 2.8, period: 'current' },
  { date: '2026-08-07', clicks: 940, impressions: 12100, ctr: 0.077, position: 2.7, period: 'current' },
];

export const DEMO_COMBINED_PREVIOUS: PageQueryPerformance[] = [
  { page: 'https://gourmetwalks.com/paris/tour/historic-marais-food-tour', query: 'paris food tour', clicks: 800, impressions: 8500, ctr: 0.094, position: 2.1, period: 'previous' },
  { page: 'https://gourmetwalks.com/paris/tour/historic-marais-food-tour', query: 'marais walking tour food', clicks: 50, impressions: 700, ctr: 0.071, position: 2.5, period: 'previous' },
  { page: 'https://gourmetwalks.com/rome/tour/trastevere-dinner-crawl', query: 'rome food crawl trastevere', clicks: 680, impressions: 6500, ctr: 0.104, position: 1.6, period: 'previous' },
  { page: 'https://gourmetwalks.com/rome/guide/where-to-eat-carbonara', query: 'where to eat authentic carbonara rome', clicks: 180, impressions: 8200, ctr: 0.021, position: 4.2, period: 'previous' },
  { page: 'https://gourmetwalks.com/new-york/tour/lower-east-side-food-tour', query: 'nyc lower east side history food', clicks: 490, impressions: 7200, ctr: 0.068, position: 3.3, period: 'previous' },
];

export const DEMO_COMBINED_CURRENT: PageQueryPerformance[] = [
  { page: 'https://gourmetwalks.com/paris/tour/historic-marais-food-tour', query: 'paris food tour', clicks: 1050, impressions: 10000, ctr: 0.105, position: 1.6, period: 'current' },
  { page: 'https://gourmetwalks.com/paris/tour/historic-marais-food-tour', query: 'marais walking tour food', clicks: 70, impressions: 1000, ctr: 0.070, position: 2.0, period: 'current' },
  { page: 'https://gourmetwalks.com/rome/tour/trastevere-dinner-crawl', query: 'rome food crawl trastevere', clicks: 450, impressions: 6200, ctr: 0.072, position: 2.8, period: 'current' },
  { page: 'https://gourmetwalks.com/rome/guide/where-to-eat-carbonara', query: 'where to eat authentic carbonara rome', clicks: 120, impressions: 9400, ctr: 0.012, position: 5.1, period: 'current' },
  { page: 'https://gourmetwalks.com/new-york/tour/lower-east-side-food-tour', query: 'nyc lower east side history food', clicks: 680, impressions: 9100, ctr: 0.074, position: 2.6, period: 'current' },
];

export const DEMO_GSC_ANNOTATIONS: GscAnnotation[] = [
  { id: 'ann-1', date: '2025-09-11', title: 'Google Helpful Content Update', description: 'Major search algorithm update focused on creator depth and original user experience.', type: 'google_update' },
  { id: 'ann-2', date: '2025-10-27', title: 'Website Redesign & Schema Deployment', description: 'Migrated to Next-gen schema tags (Tour, Course, LocalBusiness, FAQ).', type: 'site_change' },
  { id: 'ann-3', date: '2025-11-19', title: 'Core Algorithm Update Rollout', description: 'Global Google search core update rollout completed over 14 days.', type: 'google_update' },
  { id: 'ann-4', date: '2026-02-19', title: 'Core Web Vitals Metric Optimization', description: 'Improved INP and LCP across mobile tour catalog pages to <1.2s.', type: 'site_change' },
  { id: 'ann-5', date: '2026-04-06', title: 'Google Search Core Update', description: 'Spring search quality algorithm update impacting informational intent.', type: 'google_update' },
  { id: 'ann-6', date: '2026-04-29', title: 'Spring Seasonal Campaign Launch', description: 'Published 45 new curated food hub pages for Rome, Paris, and Tokyo.', type: 'site_change' },
  { id: 'ann-7', date: '2026-05-22', title: 'Google AI Overviews Search Rollout', description: 'Expansion of generative AI search overviews across travel & culinary queries.', type: 'google_update' },
  { id: 'ann-8', date: '2026-06-14', title: 'Summer Peak Travel Surge', description: 'High organic demand across European culinary walking tours and tastings.', type: 'site_change' },
];

// Generates 365 daily points spanning 2025-08-19 to 2026-08-15
export function generateGscDailyData(): GscDailyPerformance[] {
  const data: GscDailyPerformance[] = [];
  const startDate = new Date('2025-08-19');
  const days = 362;

  const annotationMap = new Map<string, GscAnnotation[]>();
  DEMO_GSC_ANNOTATIONS.forEach((ann) => {
    const list = annotationMap.get(ann.date) || [];
    list.push(ann);
    annotationMap.set(ann.date, list);
  });

  for (let i = 0; i < days; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];

    const dayOfWeek = curDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Day of year progression
    const progress = i / days;
    
    // Realistic multi-wave trend matching screenshot curve
    let baseClicks = 1600;
    let baseImps = 105000;

    // October dip and recovery
    if (i < 45) {
      baseClicks = 1750 + Math.sin(i * 0.3) * 200;
      baseImps = 190000 - i * 1800;
    } else if (i < 120) {
      baseClicks = 1450 + Math.sin(i * 0.25) * 250;
      baseImps = 95000 + Math.cos(i * 0.2) * 15000;
    } else if (i < 240) {
      baseClicks = 1550 + Math.sin(i * 0.35) * 300;
      baseImps = 108000 + Math.sin(i * 0.15) * 18000;
    } else if (i >= 260 && i <= 280) {
      // Big traffic peak in early summer (May/June spike in screenshot reaching 2.4K clicks)
      baseClicks = 2250 + Math.sin((i - 260) * 0.3) * 350;
      baseImps = 135000 + Math.sin((i - 260) * 0.3) * 20000;
    } else {
      baseClicks = 1680 + Math.sin(i * 0.4) * 280;
      baseImps = 90000 + Math.cos(i * 0.2) * 14000;
    }

    // Weekend cycle: weekend clicks slightly dip, impressions stay active
    const weekendClickFactor = isWeekend ? 0.88 : 1.05;
    const weekendImpFactor = isWeekend ? 0.94 : 1.03;

    // Deterministic pseudo-random variation
    const hash = Math.sin(i * 997) * 10000;
    const noise = (hash - Math.floor(hash)) * 0.2 - 0.1; // -10% to +10%

    // Oct 5 specific highlight match
    let finalClicks = Math.round(baseClicks * weekendClickFactor * (1 + noise));
    let finalImps = Math.round(baseImps * weekendImpFactor * (1 + noise));

    if (dateStr === '2025-10-05') {
      finalClicks = 1971;
      finalImps = 87303;
    }

    const ctr = finalImps > 0 ? Number((finalClicks / finalImps).toFixed(4)) : 0.015;
    const position = Number((19.2 + Math.sin(i * 0.1) * 1.8 + noise * 2).toFixed(1));

    // Previous Period Equivalent Date (1 year prior)
    const prevDateObj = new Date(curDate);
    prevDateObj.setFullYear(curDate.getFullYear() - 1);
    const prevDateStr = prevDateObj.toISOString().split('T')[0];
    const prevDayName = prevDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const prevMonthName = prevDateObj.toLocaleDateString('en-US', { month: 'short' });
    const prevDayNum = prevDateObj.getDate();
    const prevFormattedDate = `${prevDayName}, ${prevMonthName} ${prevDayNum}`;

    // Previous period performance (approx 20% lower reflecting yearly growth)
    const prevGrowthFactor = 0.80 + Math.sin(i * 0.12) * 0.05;
    let prevClicks = Math.round(finalClicks * prevGrowthFactor * (1 - noise * 0.4));
    let prevImps = Math.round(finalImps * prevGrowthFactor * (1 - noise * 0.3));
    if (dateStr === '2025-10-05') {
      prevClicks = 1540;
      prevImps = 72110;
    }
    const prevCtr = prevImps > 0 ? Number((prevClicks / prevImps).toFixed(4)) : 0.015;
    const prevPosition = Number((position + 1.6 + Math.cos(i * 0.2) * 0.6).toFixed(1));

    const dayName = curDate.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = curDate.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = curDate.getDate();
    const formattedDate = `${dayName}, ${monthName} ${dayNum}`;

    data.push({
      date: dateStr,
      formattedDate,
      clicks: finalClicks,
      impressions: finalImps,
      ctr,
      position,
      prevDate: prevDateStr,
      prevFormattedDate,
      prevClicks,
      prevImpressions: prevImps,
      prevCtr,
      prevPosition,
      annotations: annotationMap.get(dateStr),
    });
  }

  return data;
}

export const DEMO_GSC_DAILY_SERIES = generateGscDailyData();

