import React, { useState, useRef } from 'react';
import { youtubeAnalyticsApi } from '@/api/youtube-analytics';
import type { ImportResult } from '@/types/youtube-analytics';

interface CSVImportProps {
    channelId: string;
    onImportComplete?: (result: ImportResult) => void;
}

export const CSVImport: React.FC<CSVImportProps> = ({
    channelId,
    onImportComplete,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                setError('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const importResult = await youtubeAnalyticsApi.importCSV(channelId, file);
            setResult(importResult);
            onImportComplete?.(importResult);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="csv-import">
            <div className="csv-import-header">
                <h3>Import YouTube Analytics</h3>
                <p className="csv-import-description">
                    Upload a CSV export from YouTube Studio to analyze your video performance.
                </p>
            </div>

            <div className="csv-import-body">
                {/* File Input */}
                <div className="file-input-container">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        className="file-input"
                        id={`csv-upload-${channelId}`}
                    />
                    <label htmlFor={`csv-upload-${channelId}`} className="file-input-label">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {file ? file.name : 'Choose CSV file'}
                    </label>
                </div>

                {/* Upload Button */}
                {file && (
                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="btn-primary btn-upload"
                    >
                        {isUploading ? (
                            <>
                                <span className="spinner" />
                                Importing...
                            </>
                        ) : (
                            'Import Data'
                        )}
                    </button>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Success Result */}
                {result && (
                    <div className="alert alert-success">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            />
                        </svg>
                        <div>
                            <strong>Import successful!</strong>
                            <div className="import-stats">
                                <span>✓ {result.stats.imported} rows imported</span>
                                {result.stats.skipped > 0 && (
                                    <span className="text-warning">
                                        ⚠ {result.stats.skipped} rows skipped
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Errors Details */}
                {result && result.stats.errors.length > 0 && (
                    <details className="import-errors">
                        <summary>View {result.stats.errors.length} errors</summary>
                        <ul>
                            {result.stats.errors.slice(0, 10).map((err, idx) => (
                                <li key={idx}>
                                    Row {err.row}: {err.error}
                                </li>
                            ))}
                            {result.stats.errors.length > 10 && (
                                <li>... and {result.stats.errors.length - 10} more</li>
                            )}
                        </ul>
                    </details>
                )}
            </div>

            <div className="csv-import-footer">
                <p className="help-text">
                    <strong>How to export from YouTube Studio:</strong>
                </p>
                <ol className="help-steps">
                    <li>Go to YouTube Studio → Analytics</li>
                    <li>Select "Advanced mode"</li>
                    <li>Click "Export current view" → "CSV"</li>
                    <li>Upload the downloaded file here</li>
                </ol>
            </div>

            <style jsx>{`
        .csv-import {
          background: var(--surface-dark);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 24px;
        }

        .csv-import-header h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .csv-import-description {
          margin: 0 0 24px 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .file-input-container {
          margin-bottom: 16px;
        }

        .file-input {
          display: none;
        }

        .file-input-label {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: var(--surface-light);
          border: 2px dashed var(--border-default);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
        }

        .file-input-label:hover {
          border-color: var(--primary);
          background: var(--surface-hover);
        }

        .btn-upload {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--primary-light);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 16px;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .import-stats {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
          font-size: 13px;
        }

        .text-warning {
          color: #f59e0b;
        }

        .import-errors {
          margin-top: 12px;
          padding: 12px;
          background: var(--surface-light);
          border-radius: 8px;
          font-size: 13px;
        }

        .import-errors summary {
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .import-errors ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
          color: var(--text-secondary);
        }

        .import-errors li {
          margin: 4px 0;
        }

        .csv-import-footer {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-subtle);
        }

        .help-text {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .help-steps {
          margin: 0;
          padding-left: 20px;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .help-steps li {
          margin: 4px 0;
        }
      `}</style>
        </div>
    );
};
