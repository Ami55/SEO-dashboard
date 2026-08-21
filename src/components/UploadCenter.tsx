/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  HelpCircle,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  FileArchive,
  Table,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Globe,
  Smartphone,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  LoadedFile,
  PagePerformance,
  QueryPerformance,
  PageQueryPerformance,
  CountryPerformance,
  DevicePerformance,
  SearchAppearancePerformance,
  DatePerformance,
} from '../types';
import {
  parseCsvText,
  mapCsvRows,
  detectHeaders,
  ColumnMapping,
  detectReportType,
} from '../utils/csvParser';

interface UploadCenterProps {
  loadedFiles: LoadedFile[];
  onAddData: (
    fileInfo: Omit<LoadedFile, 'id' | 'uploadedAt' | 'rowCount'>,
    pages: PagePerformance[],
    queries: QueryPerformance[],
    combined: PageQueryPerformance[],
    countries?: CountryPerformance[],
    devices?: DevicePerformance[],
    appearances?: SearchAppearancePerformance[],
    dates?: DatePerformance[]
  ) => void;
  onDeleteFile: (fileId: string) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
}

interface PendingMapping {
  fileName: string;
  rows: string[][];
  period: 'current' | 'previous';
  reportType: 'pages' | 'queries' | 'countries' | 'devices' | 'appearance' | 'dates' | 'combined';
  mapping: ColumnMapping;
}

export default function UploadCenter({
  loadedFiles,
  onAddData,
  onDeleteFile,
  onLoadDemoData,
  onClearAllData,
}: UploadCenterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [reportType, setReportType] = useState<
    'pages' | 'queries' | 'countries' | 'devices' | 'appearance' | 'dates' | 'combined' | 'auto'
  >('auto');
  const [reportPeriod, setReportPeriod] = useState<'current' | 'previous'>('current');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual Column Mapping Modal State
  const [pendingMapping, setPendingMapping] = useState<PendingMapping | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processCsvText = (
    text: string,
    fileName: string,
    targetPeriod: 'current' | 'previous',
    overrideType?: 'pages' | 'queries' | 'countries' | 'devices' | 'appearance' | 'dates' | 'combined'
  ) => {
    const parsedRows = parseCsvText(text);

    if (parsedRows.length < 2) {
      throw new Error(`"${fileName}" appears to be empty or contains no data rows.`);
    }

    const detectedMap = detectHeaders(parsedRows);
    const autoType =
      overrideType ||
      (reportType !== 'auto' ? reportType : detectReportType(detectedMap, fileName));

    const hasValidKey =
      detectedMap.urlIndex !== -1 ||
      detectedMap.queryIndex !== -1 ||
      detectedMap.countryIndex !== -1 ||
      detectedMap.deviceIndex !== -1 ||
      detectedMap.appearanceIndex !== -1 ||
      detectedMap.dateIndex !== -1;

    const hasMetrics = detectedMap.clicksIndex !== -1 || detectedMap.impressionsIndex !== -1;

    if (!hasValidKey && !hasMetrics) {
      setPendingMapping({
        fileName,
        rows: parsedRows,
        period: targetPeriod,
        reportType: autoType,
        mapping: detectedMap,
      });
      return;
    }

    const mapped = mapCsvRows(parsedRows, targetPeriod, detectedMap, fileName);
    const totalMapped =
      mapped.pages.length +
      mapped.queries.length +
      mapped.combined.length +
      mapped.countries.length +
      mapped.devices.length +
      mapped.appearances.length +
      mapped.dates.length;

    if (totalMapped === 0) {
      setPendingMapping({
        fileName,
        rows: parsedRows,
        period: targetPeriod,
        reportType: autoType,
        mapping: detectedMap,
      });
      return;
    }

    onAddData(
      {
        fileName,
        type: mapped.detectedType,
        period: targetPeriod,
      },
      mapped.pages,
      mapped.queries,
      mapped.combined,
      mapped.countries,
      mapped.devices,
      mapped.appearances,
      mapped.dates
    );

    return { totalMapped, type: mapped.detectedType };
  };

  const handleFile = async (file: File) => {
    try {
      setErrorMsg(null);
      setSuccessInfo(null);
      setIsProcessing(true);

      const fileName = file.name;
      const lowerName = fileName.toLowerCase();

      if (lowerName.endsWith('.zip')) {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        let importedCount = 0;
        const processedFiles: string[] = [];

        for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
          if (!zipEntry.dir && relativePath.toLowerCase().endsWith('.csv')) {
            const entryText = await zipEntry.async('text');
            const cleanEntryName = relativePath.split('/').pop() || relativePath;

            const isPrev =
              cleanEntryName.toLowerCase().includes('prev') ||
              cleanEntryName.toLowerCase().includes('compar');
            const filePeriod = isPrev ? 'previous' : reportPeriod;

            const res = processCsvText(entryText, cleanEntryName, filePeriod);
            if (res) {
              importedCount += res.totalMapped;
              processedFiles.push(`${cleanEntryName} (${res.totalMapped} rows)`);
            }
          }
        }

        if (importedCount > 0) {
          setSuccessInfo(
            `Successfully unpacked ZIP: Imported ${importedCount.toLocaleString()} records from ${processedFiles.join(
              ', '
            )}.`
          );
        } else {
          setErrorMsg('No readable GSC CSV files found inside the uploaded ZIP archive.');
        }
        return;
      }

      const text = await file.text();
      const res = processCsvText(text, fileName, reportPeriod);
      if (res) {
        setSuccessInfo(
          `Successfully loaded ${res.totalMapped.toLocaleString()} rows from "${fileName}" as ${res.type.toUpperCase()} (${reportPeriod.toUpperCase()} period).`
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse the file. Please verify CSV encoding.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await handleFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleManualSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        await handleFile(e.target.files[i]);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmMapping = () => {
    if (!pendingMapping) return;

    try {
      const mapped = mapCsvRows(
        pendingMapping.rows,
        pendingMapping.period,
        pendingMapping.mapping,
        pendingMapping.fileName
      );
      const totalMapped =
        mapped.pages.length +
        mapped.queries.length +
        mapped.combined.length +
        mapped.countries.length +
        mapped.devices.length +
        mapped.appearances.length +
        mapped.dates.length;

      if (totalMapped === 0) {
        setErrorMsg('Could not map any rows with the selected columns.');
        return;
      }

      onAddData(
        {
          fileName: pendingMapping.fileName,
          type: pendingMapping.reportType,
          period: pendingMapping.period,
        },
        mapped.pages,
        mapped.queries,
        mapped.combined,
        mapped.countries,
        mapped.devices,
        mapped.appearances,
        mapped.dates
      );

      setSuccessInfo(
        `Successfully mapped and imported ${totalMapped.toLocaleString()} rows from "${pendingMapping.fileName}".`
      );
      setPendingMapping(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing custom column mapping.');
    }
  };

  return (
    <div className="space-y-6" id="upload-center-view">
      {/* File Upload Zone */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              Upload GSC Exports (CSV or ZIP)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Supports Pages, Queries, Countries, Devices, and full ZIP downloads directly from Google Search Console.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLoadDemoData}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Reset Demo Data
            </button>
            <button
              onClick={onClearAllData}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Clear Workspace
            </button>
          </div>
        </div>

        {/* Upload Config Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Comparison Period
            </label>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setReportPeriod('current')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  reportPeriod === 'current'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Current Period (Recent)
              </button>
              <button
                type="button"
                onClick={() => setReportPeriod('previous')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  reportPeriod === 'previous'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Previous Period (Baseline)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Report Type Hint
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-100"
            >
              <option value="auto">✨ Auto-Detect from Headers / File Name</option>
              <option value="pages">Pages Report (URL, Clicks, Imps, CTR, Pos)</option>
              <option value="queries">Queries Report (Search Terms, Clicks, Imps, CTR, Pos)</option>
              <option value="countries">Countries Report</option>
              <option value="devices">Devices Report</option>
              <option value="appearance">Search Appearance Report</option>
              <option value="dates">Dates Report</option>
              <option value="combined">Pages + Queries Combined Report</option>
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerBrowse}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/60 scale-[1.01]'
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 bg-slate-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .zip, text/csv, application/zip"
            multiple
            onChange={handleManualSelect}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-sm font-bold text-slate-800">
            {isProcessing ? 'Processing Google Search Console export...' : 'Drag & drop GSC CSV or ZIP files here'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Upload single CSV reports or standard Search Console full .ZIP export archives. Multi-file selection is supported.
          </p>

          <button
            type="button"
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Browse files on computer
          </button>
        </div>

        {/* Success or Error Notifications */}
        {successInfo && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successInfo}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Loaded Files Matrix */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-850 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          Loaded Data Sources ({loadedFiles.length})
        </h3>

        {loadedFiles.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No files currently loaded. Upload a GSC CSV/ZIP above or click "Reset Demo Data".
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Report Type</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3 text-right">Row Count</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      {file.fileName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold uppercase">
                        {file.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          file.period === 'current'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {file.period}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {file.rowCount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete this file dataset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Column Mapping Dialog */}
      {pendingMapping && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Custom Column Mapping: {pendingMapping.fileName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which columns in your CSV correspond to standard GSC metrics.
                </p>
              </div>
              <button
                onClick={() => setPendingMapping(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Page URL Column</label>
                  <select
                    value={pendingMapping.mapping.urlIndex}
                    onChange={(e) =>
                      setPendingMapping({
                        ...pendingMapping,
                        mapping: { ...pendingMapping.mapping, urlIndex: parseInt(e.target.value, 10) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                  >
                    <option value={-1}>-- Not Present --</option>
                    {pendingMapping.rows[0]?.map((header, idx) => (
                      <option key={idx} value={idx}>
                        Col {idx + 1}: {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Query / Keyword Column</label>
                  <select
                    value={pendingMapping.mapping.queryIndex}
                    onChange={(e) =>
                      setPendingMapping({
                        ...pendingMapping,
                        mapping: { ...pendingMapping.mapping, queryIndex: parseInt(e.target.value, 10) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                  >
                    <option value={-1}>-- Not Present --</option>
                    {pendingMapping.rows[0]?.map((header, idx) => (
                      <option key={idx} value={idx}>
                        Col {idx + 1}: {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clicks Column</label>
                  <select
                    value={pendingMapping.mapping.clicksIndex}
                    onChange={(e) =>
                      setPendingMapping({
                        ...pendingMapping,
                        mapping: { ...pendingMapping.mapping, clicksIndex: parseInt(e.target.value, 10) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                  >
                    <option value={-1}>-- Not Present --</option>
                    {pendingMapping.rows[0]?.map((header, idx) => (
                      <option key={idx} value={idx}>
                        Col {idx + 1}: {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Impressions Column</label>
                  <select
                    value={pendingMapping.mapping.impressionsIndex}
                    onChange={(e) =>
                      setPendingMapping({
                        ...pendingMapping,
                        mapping: {
                          ...pendingMapping.mapping,
                          impressionsIndex: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                  >
                    <option value={-1}>-- Not Present --</option>
                    {pendingMapping.rows[0]?.map((header, idx) => (
                      <option key={idx} value={idx}>
                        Col {idx + 1}: {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CTR Column</label>
                  <select
                    value={pendingMapping.mapping.ctrIndex}
                    onChange={(e) =>
                      setPendingMapping({
                        ...pendingMapping,
                        mapping: { ...pendingMapping.mapping, ctrIndex: parseInt(e.target.value, 10) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                  >
                    <option value={-1}>-- Not Present (Auto Compute) --</option>
                    {pendingMapping.rows[0]?.map((header, idx) => (
                      <option key={idx} value={idx}>
                        Col {idx + 1}: {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Position / Rank Column</label>
                  <select
                    value={pendingMapping.mapping.positionIndex}
                    onChange={(e) =>
                      setPendingMapping({
                        ...pendingMapping,
                        mapping: {
                          ...pendingMapping.mapping,
                          positionIndex: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                  >
                    <option value={-1}>-- Not Present --</option>
                    {pendingMapping.rows[0]?.map((header, idx) => (
                      <option key={idx} value={idx}>
                        Col {idx + 1}: {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setPendingMapping(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapping}
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
