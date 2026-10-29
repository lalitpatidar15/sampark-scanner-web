"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

function DocumentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export interface DocumentType {
  value: string;
  label: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  { value: "REGISTRATION_CERTIFICATE", label: "Registration Certificate" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "PUC", label: "PUC Certificate" },
  { value: "FASTAG", label: "FASTag" },
  { value: "SERVICE_RECORD", label: "Service Record" },
  { value: "IDENTITY", label: "Identity Document" },
  { value: "OTHER", label: "Other" },
];

interface DocumentUploaderProps {
  assetIdProp: string;
  accessToken: string;
  onUpload?: (document: any) => void;
}

export function DocumentUploader(props: DocumentUploaderProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>(DOCUMENT_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only PDF, JPEG, PNG, and WebP files are allowed");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Get signed upload URL
      const uploadUrlResult = await api.post<{ data: { uploadUrl: string; objectKey: string } }>(
        `/documents/upload-url`,
        {
          assetId: props.assetIdProp,
          documentType: selectedType.value,
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        },
        { token: props.accessToken }
      );

      const { uploadUrl, objectKey } = uploadUrlResult.data.data;

      // Step 2: Upload to storage
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      setProgress(50);

      // Step 3: Notify backend upload complete
      const documentResult = await api.post<{ data: any }>(
        `/documents`,
        {
          assetId: props.assetIdProp,
          documentType: selectedType.value,
          objectKey,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
        { token: props.accessToken }
      );

      setProgress(100);
      setSuccess(true);
      props.onUpload?.(documentResult.data);
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [file, selectedType, props.assetIdProp, props.accessToken, props.onUpload]);

  return (
    <Card variant="outlined">
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900">Upload Document</h3>
        <p className="text-sm text-slate-500 mt-1">Max 10MB • PDF, JPEG, PNG, WebP</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
          <select
            value={selectedType.value}
            onChange={(e) => setSelectedType(DOCUMENT_TYPES.find(t => t.value === e.target.value) || DOCUMENT_TYPES[0])}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">File</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled={uploading}
          />
          {file && (
            <div className="mt-2 flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={file.type.startsWith("image/") ? "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"} />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                Remove
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Document uploaded successfully</span>
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={handleUpload}
          disabled={uploading || !file}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading... {progress}%
            </>
          ) : (
            "Upload Document"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}