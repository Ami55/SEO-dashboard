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
} from '../types';

// Strip UTF-8 BOM, invisible control chars, and normalize line endings
export function cleanRawText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^\uFEFF/, '') // remove UTF-8 BOM
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

// Auto-detect delimiter (, ; \t |)
export function detectDelimiter(text: string): string {
  const sampleLines = cleanRawText(text)
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .slice(0, 5);

  if (sampleLines.length === 0) return ',';

  const candidates = [',', ';', '\t', '|'];
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0, '|': 0 };

  for (const line of sampleLines) {
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (!inQuotes && candidates.includes(char)) {
        counts[char]++;
      }
    }
  }

  let best = ',';
  let maxCount = -1;
  for (const [delim, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      best = delim;
    }
  }

  return maxCount > 0 ? best : ',';
}

// Robust client-side CSV parser supporting quotes, delimiters, escaped characters
export function parseCsvText(text: string, customDelimiter?: string): string[][] {
  const cleanText = cleanRawText(text);
  if (!cleanText.trim()) return [];

  const delimiter = customDelimiter || detectDelimiter(cleanText);
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(currentValue.trim());
      result.push(row);
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  if (currentValue || row.length > 0) {
    row.push(currentValue.trim());
    result.push(row);
  }

  return result.filter((r) => r.length > 0 && r.some((cell) => cell !== ''));
}

export interface ColumnMapping {
  urlIndex: number;
  queryIndex: number;
  countryIndex: number;
  deviceIndex: number;
  appearanceIndex: number;
  dateIndex: number;
  clicksIndex: number;
  impressionsIndex: number;
  ctrIndex: number;
  positionIndex: number;
  headerRowIndex: number;
}

function normalizeHeader(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

function isUrlColumn(normalized: string, raw: string): boolean {
  const patterns = [
    'top pages', 'top page', 'pages', 'page', 'landing page', 'landing pages',
    'url', 'urls', 'target url', 'destination url', 'address', 'page path',
    'paginas principales', 'pagina', 'paginas', 'pagine principali',
    'pages populaires', 'page populaire', 'wichtigste seiten', 'seite', 'seiten',
    'principais paginas', 'pagina de destino', 'belangrijkste pagina',
  ];
  if (patterns.some((p) => normalized === p || normalized.startsWith(p) || normalized.endsWith(p))) return true;
  if (raw.toLowerCase().includes('http') || raw.toLowerCase().includes('www.')) return true;
  return false;
}

function isQueryColumn(normalized: string): boolean {
  const patterns = [
    'top queries', 'top query', 'queries', 'query', 'search query', 'search queries',
    'keyword', 'keywords', 'search term', 'search terms', 'term', 'terms',
    'consultas principales', 'consulta', 'consultas', 'requetes les plus frequentes',
    'requetes', 'requete', 'wichtigste suchanfragen', 'suchanfragen', 'suchanfrage',
    'query principali', 'parole chiave', 'principais consultas', 'palavras chave',
    'zoekopdrachten', 'zoekopdracht'
  ];
  return patterns.some((p) => normalized === p || normalized.startsWith(p) || normalized.endsWith(p));
}

function isCountryColumn(normalized: string): boolean {
  const patterns = ['country', 'countries', 'pays', 'pais', 'paises', 'land', 'lander', 'paese', 'paesi'];
  return patterns.some((p) => normalized === p || normalized.includes('country') || normalized.includes('pais'));
}

function isDeviceColumn(normalized: string): boolean {
  const patterns = ['device', 'devices', 'appareil', 'appareils', 'dispositivo', 'dispositivos', 'gerat', 'gerate'];
  return patterns.some((p) => normalized === p || normalized.includes('device') || normalized.includes('dispositiv'));
}

function isAppearanceColumn(normalized: string): boolean {
  const patterns = [
    'search appearance', 'appearance', 'aspect de la recherche', 'apariencia en el buscador',
    'rich results', 'aspecto de pesquisa', 'darstellung in der suche'
  ];
  return patterns.some((p) => normalized === p || normalized.includes('appearance') || normalized.includes('aspect') || normalized.includes('apariencia'));
}

function isDateColumn(normalized: string): boolean {
  const patterns = ['date', 'dates', 'fecha', 'fechas', 'datum', 'data', 'giorni'];
  return patterns.some((p) => normalized === p || normalized.includes('date') || normalized.includes('fecha'));
}

function isClicksColumn(normalized: string): boolean {
  const patterns = ['clicks', 'click', 'clics', 'clic', 'klicks', 'klick', 'cliques', 'clique', 'klikken', 'organic clicks'];
  return patterns.some((p) => normalized === p || normalized.includes('click') || normalized.includes('clic') || normalized.includes('klick'));
}

function isImpressionsColumn(normalized: string): boolean {
  const patterns = [
    'impressions', 'impression', 'impresiones', 'impresion', 'impressionen',
    'impressioni', 'impressoes', 'impressao', 'vertoningen', 'views', 'imps'
  ];
  return patterns.some((p) => normalized === p || normalized.includes('impress') || normalized.includes('impres') || normalized.includes('vertoning'));
}

function isCtrColumn(normalized: string): boolean {
  const patterns = [
    'ctr', 'click through rate', 'clickthrough rate', 'click-through rate',
    'taux de clics', 'porcentaje de clics', 'klickrate', 'percentuale di clic',
    'taxa de cliques', 'doorklikratio'
  ];
  return patterns.some((p) => normalized === p || normalized.includes('ctr') || normalized.includes('click through') || normalized.includes('klickrate'));
}

function isPositionColumn(normalized: string): boolean {
  const patterns = [
    'position', 'pos', 'average position', 'avg position', 'posicion', 'posicion media',
    'position moyenne', 'durchschnittliche position', 'posizione', 'posizione media',
    'posicao', 'posicao media', 'positie', 'gemiddelde positie', 'rank', 'average rank'
  ];
  return patterns.some((p) => normalized === p || normalized.includes('position') || normalized.includes('posicion') || normalized.includes('posicao') || normalized.includes('positie') || normalized === 'pos');
}

export function detectHeaders(rows: string[][]): ColumnMapping {
  const maxScan = Math.min(rows.length, 10);
  let bestScore = -1;
  let bestMapping: ColumnMapping = {
    urlIndex: -1,
    queryIndex: -1,
    countryIndex: -1,
    deviceIndex: -1,
    appearanceIndex: -1,
    dateIndex: -1,
    clicksIndex: -1,
    impressionsIndex: -1,
    ctrIndex: -1,
    positionIndex: -1,
    headerRowIndex: 0,
  };

  for (let r = 0; r < maxScan; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    let urlIndex = -1;
    let queryIndex = -1;
    let countryIndex = -1;
    let deviceIndex = -1;
    let appearanceIndex = -1;
    let dateIndex = -1;
    let clicksIndex = -1;
    let impressionsIndex = -1;
    let ctrIndex = -1;
    let positionIndex = -1;
    let score = 0;

    for (let i = 0; i < row.length; i++) {
      const cell = row[i];
      const norm = normalizeHeader(cell);

      if (urlIndex === -1 && isUrlColumn(norm, cell)) {
        urlIndex = i;
        score += 3;
      } else if (queryIndex === -1 && isQueryColumn(norm)) {
        queryIndex = i;
        score += 3;
      } else if (countryIndex === -1 && isCountryColumn(norm)) {
        countryIndex = i;
        score += 3;
      } else if (deviceIndex === -1 && isDeviceColumn(norm)) {
        deviceIndex = i;
        score += 3;
      } else if (appearanceIndex === -1 && isAppearanceColumn(norm)) {
        appearanceIndex = i;
        score += 3;
      } else if (dateIndex === -1 && isDateColumn(norm)) {
        dateIndex = i;
        score += 3;
      } else if (clicksIndex === -1 && isClicksColumn(norm)) {
        clicksIndex = i;
        score += 2;
      } else if (impressionsIndex === -1 && isImpressionsColumn(norm)) {
        impressionsIndex = i;
        score += 2;
      } else if (ctrIndex === -1 && isCtrColumn(norm)) {
        ctrIndex = i;
        score += 1;
      } else if (positionIndex === -1 && isPositionColumn(norm)) {
        positionIndex = i;
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMapping = {
        urlIndex,
        queryIndex,
        countryIndex,
        deviceIndex,
        appearanceIndex,
        dateIndex,
        clicksIndex,
        impressionsIndex,
        ctrIndex,
        positionIndex,
        headerRowIndex: r,
      };
    }
  }

  return bestMapping;
}

export function parseGscNumber(val: string | undefined): number {
  if (!val) return 0;
  let clean = val.trim();
  if (!clean) return 0;

  const isPercent = clean.endsWith('%');
  if (isPercent) {
    clean = clean.replace('%', '').trim();
  }

  if (clean.includes(',') && clean.includes('.')) {
    if (clean.indexOf(',') < clean.indexOf('.')) {
      clean = clean.replace(/,/g, '');
    } else {
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
  } else if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      clean = clean.replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  }

  clean = clean.replace(/\s/g, '');

  const num = parseFloat(clean);
  if (isNaN(num)) return 0;

  return isPercent ? num / 100 : num;
}

export function parseGscInteger(val: string | undefined): number {
  return Math.round(parseGscNumber(val));
}

export function detectReportType(
  mapping: ColumnMapping,
  fileName?: string
): 'pages' | 'queries' | 'countries' | 'devices' | 'appearance' | 'dates' | 'combined' {
  const nameLower = (fileName || '').toLowerCase();

  if (mapping.urlIndex !== -1 && mapping.queryIndex !== -1) {
    return 'combined';
  }
  if (mapping.countryIndex !== -1 || nameLower.includes('country') || nameLower.includes('countries') || nameLower.includes('pays')) {
    return 'countries';
  }
  if (mapping.deviceIndex !== -1 || nameLower.includes('device') || nameLower.includes('appareil')) {
    return 'devices';
  }
  if (mapping.appearanceIndex !== -1 || nameLower.includes('appearance') || nameLower.includes('aspect')) {
    return 'appearance';
  }
  if (mapping.dateIndex !== -1 || nameLower.includes('date')) {
    return 'dates';
  }
  if (mapping.urlIndex !== -1 || nameLower.includes('page')) {
    return 'pages';
  }
  if (mapping.queryIndex !== -1 || nameLower.includes('quer') || nameLower.includes('keyword')) {
    return 'queries';
  }

  return 'pages';
}

export function mapCsvRows(
  rows: string[][],
  period: 'current' | 'previous',
  customMapping?: ColumnMapping,
  fileName?: string
): {
  pages: PagePerformance[];
  queries: QueryPerformance[];
  countries: CountryPerformance[];
  devices: DevicePerformance[];
  appearances: SearchAppearancePerformance[];
  dates: DatePerformance[];
  combined: PageQueryPerformance[];
  detectedMapping: ColumnMapping;
  detectedType: 'pages' | 'queries' | 'countries' | 'devices' | 'appearance' | 'dates' | 'combined';
} {
  const pages: PagePerformance[] = [];
  const queries: QueryPerformance[] = [];
  const countries: CountryPerformance[] = [];
  const devices: DevicePerformance[] = [];
  const appearances: SearchAppearancePerformance[] = [];
  const dates: DatePerformance[] = [];
  const combined: PageQueryPerformance[] = [];

  const mapping = customMapping || detectHeaders(rows);
  const detectedType = detectReportType(mapping, fileName);

  if (rows.length <= mapping.headerRowIndex + 1) {
    return {
      pages,
      queries,
      countries,
      devices,
      appearances,
      dates,
      combined,
      detectedMapping: mapping,
      detectedType,
    };
  }

  for (let i = mapping.headerRowIndex + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const firstCell = (r[0] || '').trim().toLowerCase();
    if (
      firstCell.startsWith('exporter') ||
      firstCell.startsWith('filters') ||
      firstCell.startsWith('filter') ||
      firstCell.startsWith('date:') ||
      firstCell.startsWith('total')
    ) {
      continue;
    }

    const clicks = mapping.clicksIndex !== -1 ? parseGscInteger(r[mapping.clicksIndex]) : 0;
    const impressions = mapping.impressionsIndex !== -1 ? parseGscInteger(r[mapping.impressionsIndex]) : 0;

    let ctr = 0;
    if (mapping.ctrIndex !== -1 && r[mapping.ctrIndex]) {
      const rawCtr = r[mapping.ctrIndex].trim();
      if (rawCtr.includes('%')) {
        ctr = parseGscNumber(rawCtr);
      } else {
        const val = parseGscNumber(rawCtr);
        ctr = val > 1 ? val / 100 : val;
      }
    } else if (impressions > 0) {
      ctr = clicks / impressions;
    }

    const position = mapping.positionIndex !== -1 ? parseGscNumber(r[mapping.positionIndex]) : 0;

    const pageUrl = mapping.urlIndex !== -1 ? (r[mapping.urlIndex] || '').trim() : '';
    const query = mapping.queryIndex !== -1 ? (r[mapping.queryIndex] || '').trim() : '';
    const country = mapping.countryIndex !== -1 ? (r[mapping.countryIndex] || '').trim() : '';
    const device = mapping.deviceIndex !== -1 ? (r[mapping.deviceIndex] || '').trim() : '';
    const appearance = mapping.appearanceIndex !== -1 ? (r[mapping.appearanceIndex] || '').trim() : '';
    const dateVal = mapping.dateIndex !== -1 ? (r[mapping.dateIndex] || '').trim() : '';

    if (detectedType === 'combined' || (pageUrl && query)) {
      combined.push({
        page: pageUrl,
        query,
        clicks,
        impressions,
        ctr,
        position: position || 10,
        period,
      });
    } else if (detectedType === 'countries' || country) {
      countries.push({
        country: country || r[0] || 'Unknown',
        clicks,
        impressions,
        ctr,
        position: position || 10,
        period,
      });
    } else if (detectedType === 'devices' || device) {
      devices.push({
        device: device || r[0] || 'Unknown',
        clicks,
        impressions,
        ctr,
        position: position || 10,
        period,
      });
    } else if (detectedType === 'appearance' || appearance) {
      appearances.push({
        appearance: appearance || r[0] || 'Rich Results',
        clicks,
        impressions,
        ctr,
        position: position || 10,
        period,
      });
    } else if (detectedType === 'dates' || dateVal) {
      dates.push({
        date: dateVal || r[0] || 'Unknown',
        clicks,
        impressions,
        ctr,
        position: position || 10,
        period,
      });
    } else if (pageUrl) {
      pages.push({
        page: pageUrl,
        clicks,
        impressions,
        ctr,
        position: position || 10,
        period,
      });
    } else if (query) {
      queries.push({
        query,
        clicks,
        impressions,
        ctr,
        position: position || 10,
        period,
      });
    }
  }

  return {
    pages,
    queries,
    countries,
    devices,
    appearances,
    dates,
    combined,
    detectedMapping: mapping,
    detectedType,
  };
}
