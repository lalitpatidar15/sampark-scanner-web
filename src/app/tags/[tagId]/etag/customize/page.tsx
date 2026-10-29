"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";
import {
  QRCodeGenerator,
  QRCodeOptions,
  useQRCode,
  THEMES,
} from "@/lib/qr-generator";

const THEME_OPTIONS = [
  { value: "default", label: "Default", color: "#0ea5e9" },
  { value: "batman", label: "Batman", color: "#ffd700" },
  { value: "superman", label: "Superman", color: "#ff0000" },
  { value: "spiderman", label: "Spider-Man", color: "#ff0000" },
  { value: "ironman", label: "Iron Man", color: "#cc0000" },
  { value: "captain-america", label: "Captain America", color: "#002868" },
  { value: "hulk", label: "Hulk", color: "#2e7d32" },
  { value: "thor", label: "Thor", color: "#6d4c41" },
  { value: "wonder-woman", label: "Wonder Woman", color: "#c62828" },
  { value: "flash", label: "Flash", color: "#ff0000" },
  { value: "aquaman", label: "Aquaman", color: "#006064" },
  { value: "green-lantern", label: "Green Lantern", color: "#a5d6a7" },
  { value: "custom", label: "Custom", color: "#64748b" },
];

const SHAPE_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
];

const FORMAT_OPTIONS = [
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "svg", label: "SVG" },
];

const ERROR_CORRECTION_OPTIONS = [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
];

export default function ETagCustomizerPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.tagId as string;

  const { generate, generateSet } = useQRCode();

  const [tag, setTag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // QR Code customization options
  const [options, setOptions] = useState<QRCodeOptions>({
    data: "",
    size: 512,
    errorCorrectionLevel: "H",
    margin: 2,
    shape: "square",
    theme: "default",
    format: "png",
    quality: 0.92,
    logo: {
      src: "",
      size: 0.2,
      background: "#ffffff",
      borderRadius: 8,
    },
  });

  const [customTheme, setCustomTheme] = useState({
    primary: "#000000",
    secondary: "#0ea5e9",
    background: "#ffffff",
  });

  const [sizes, setSizes] = useState<Array<{ size: number; label: string }>>([]);

  useEffect(() => {
    loadTag();
  }, [tagId]);

  const loadTag = async () => {
    try {
      const result = await api.get<any>(`/tags/${tagId}`);
      setTag(result.data);
      // Set the QR data to the tag's public URL
      const publicToken = result.data.publicToken;
      const qrData = `${process.env.NEXT_PUBLIC_WEB_BASE_URL || "https://sampark.me"}/t/${publicToken}`;
      setOptions((prev) => ({ ...prev, data: qrData }));
      generateQR();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tag");
    } finally {
      setLoading(false);
    }
  };

  const loadSizes = async () => {
    try {
      const result = await api.get<Array<{ size: number; label: string }>>("/qr-sizes/active");
      setSizes(result.data);
      // Set default size to first available size if current size not in list
      if (result.data.length > 0) {
        const currentSize = options.size ?? 512;
        const validSizes = result.data.map((s) => s.size);
        if (!validSizes.includes(currentSize)) {
          setOptions((prev) => ({ ...prev, size: result.data[0].size }));
        }
      }
    } catch (err) {
      console.warn("Failed to load QR sizes:", err);
      // Fallback to default sizes
      setSizes([
        { size: 128, label: "128px" },
        { size: 256, label: "256px" },
        { size: 512, label: "512px" },
        { size: 1024, label: "1024px" },
      ]);
    }
  };

  useEffect(() => {
    loadSizes();
  }, []);

  const generateQR = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generate(options);
      setQrCodeDataUrl(result.dataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleOptionChange = useCallback(
    (key: keyof QRCodeOptions, value: any) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setOptions((prev) => ({
            ...prev,
            logo: { ...prev.logo!, src: e.target?.result as string },
          }));
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleThemeChange = useCallback((theme: QRCodeOptions['theme']) => {
    setOptions((prev) => ({ ...prev, theme }));
    if (theme && theme !== "custom") {
      const themeConfig = THEMES[theme] || THEMES.default;
      setOptions((prev) => ({
        ...prev,
        colorDark: themeConfig.primary,
        colorLight: themeConfig.background,
        shape: (themeConfig.shape || "square") as QRCodeOptions['shape'],
      }));
    }
  }, []);

  const handleCustomThemeChange = useCallback((key: 'primary' | 'secondary' | 'background' | 'logoSrc', value: string) => {
    setCustomTheme((prev) => ({ ...prev, [key]: value }));
    setOptions((prev) => {
      const newCustomTheme = { ...prev.customTheme, [key]: value };
      // Ensure all required fields have string values
      const updatedCustomTheme = {
        primary: newCustomTheme.primary ?? '',
        secondary: newCustomTheme.secondary ?? '',
        background: newCustomTheme.background ?? '',
        logoSrc: newCustomTheme.logoSrc ?? '',
      };
      return { ...prev, customTheme: updatedCustomTheme };
    });
  }, []);

  const downloadQR = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `sampark-qr-${tag?.publicTagId || tagId}.${options.format}`;
    a.click();
  };

  const downloadAllSizes = async () => {
    try {
      const sizeValues = sizes.map(s => s.size);
      const results = await generateSet(options.data, options, sizeValues);
      Object.entries(results).forEach(([key, result]) => {
        const a = document.createElement("a");
        a.href = result.dataUrl;
        a.download = `sampark-qr-${tag?.publicTagId || tagId}-${key}.${options.format}`;
        a.click();
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR set",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading tag...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Failed to load
          </h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/tags")}>
            Back to Tags
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Tag
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            Customize eTag QR Code
          </h1>
          <p className="text-slate-500 mt-1">
            Tag: <code className="text-slate-700">{tag?.publicTagId}</code> -{" "}
            {tag?.asset?.displayName || "No asset"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Panel */}
          <div className="lg:col-span-1 xl:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-xl font-semibold text-slate-900">
                  Live Preview
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center space-y-6">
                  {qrCodeDataUrl ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code Preview"
                        className="mx-auto max-w-full"
                        style={{
                          maxWidth: `${options.size}px`,
                          maxHeight: `${options.size}px`,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 bg-slate-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                      size="lg"
                      onClick={downloadQR}
                      disabled={!qrCodeDataUrl || generating}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download {options.format?.toUpperCase()}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={downloadAllSizes}
                      disabled={generating}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                      Download All Sizes
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={generateQR}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-2 xl:col-span-1 space-y-6">
            {/* Theme Selector */}
            <Card variant="outlined">
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">
                  Theme Presets
                </h2>
                <p className="text-sm text-slate-500">
                  Choose a superhero theme
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((theme) => (
                    <Button
                      key={theme.value}
                      variant={
                        options.theme === theme.value ? "primary" : "secondary"
                      }
                      className="w-full py-3 flex flex-col items-center gap-1"
                      onClick={() => handleThemeChange(theme.value as QRCodeOptions['theme'])}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.color }}
                      >
                        {theme.value === "batman" && (
                          <svg
                            className="w-5 h-5 text-black"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "superman" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "spiderman" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "ironman" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "captain-america" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "hulk" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "thor" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "wonder-woman" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "flash" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "aquaman" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "green-lantern" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" />
                          </svg>
                        )}
                        {theme.value === "custom" && (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 19h6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-medium">{theme.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Basic Settings */}
            <Card variant="outlined">
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">
                  Basic Settings
                </h2>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Size
                  </label>
                  <select
                    value={options.size}
                    onChange={(e) =>
                      handleOptionChange("size", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    {sizes.map((s) => (
                      <option key={s.size} value={s.size}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Format
                  </label>
                  <select
                    value={options.format}
                    onChange={(e) =>
                      handleOptionChange(
                        "format",
                        e.target.value as QRCodeOptions["format"],
                      )
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    {FORMAT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Error Correction
                  </label>
                  <select
                    value={options.errorCorrectionLevel}
                    onChange={(e) =>
                      handleOptionChange(
                        "errorCorrectionLevel",
                        e.target.value as QRCodeOptions["errorCorrectionLevel"],
                      )
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    {ERROR_CORRECTION_OPTIONS.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Shape
                  </label>
                  <select
                    value={options.shape}
                    onChange={(e) =>
                      handleOptionChange(
                        "shape",
                        e.target.value as QRCodeOptions["shape"],
                      )
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    {SHAPE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Margin (modules)
                  </label>
                  <input
                    type="number"
                    value={options.margin}
                    onChange={(e) =>
                      handleOptionChange(
                        "margin",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card variant="outlined">
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Colors</h2>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Primary (Modules)
                    </label>
                    <input
                      type="color"
                      value={options.colorDark}
                      onChange={(e) =>
                        handleOptionChange("colorDark", e.target.value)
                      }
                      className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Background
                    </label>
                    <input
                      type="color"
                      value={options.colorLight}
                      onChange={(e) =>
                        handleOptionChange("colorLight", e.target.value)
                      }
                      className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Theme */}
            {options.theme === "custom" && (
              <Card variant="outlined">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Custom Theme
                  </h2>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Primary
                      </label>
                      <input
                        type="color"
                        value={customTheme.primary}
                        onChange={(e) =>
                          handleCustomThemeChange("primary", e.target.value)
                        }
                        className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Secondary
                      </label>
                      <input
                        type="color"
                        value={customTheme.secondary}
                        onChange={(e) =>
                          handleCustomThemeChange("secondary", e.target.value)
                        }
                        className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Background
                      </label>
                      <input
                        type="color"
                        value={customTheme.background}
                        onChange={(e) =>
                          handleCustomThemeChange("background", e.target.value)
                        }
                        className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logo Upload */}
            <Card variant="outlined">
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">
                  Center Logo
                </h2>
                <p className="text-sm text-slate-500">
                  Upload a logo to embed in the center
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
                {options.logo?.src && (
                  <div className="flex items-center gap-4">
                    <img
                      src={options.logo.src}
                      alt="Logo preview"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Logo Size
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.4"
                        step="0.05"
                        value={options.logo?.size || 0.2}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            logo: {
                              ...prev.logo!,
                              size: parseFloat(e.target.value),
                            },
                          }))
                        }
                        className="w-full"
                      />
                      <label className="block text-sm font-medium text-slate-700">
                        Background
                      </label>
                      <input
                        type="color"
                        value={options.logo?.background || "#ffffff"}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            logo: { ...prev.logo!, background: e.target.value },
                          }))
                        }
                        className="w-16 h-10 border border-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Correction */}
            <Card variant="outlined">
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">
                  Error Correction
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-500 mb-3">
                  Higher correction = more logo space but denser QR
                </p>
                <select
                  value={options.errorCorrectionLevel}
                  onChange={(e) =>
                    handleOptionChange(
                      "errorCorrectionLevel",
                      e.target.value as QRCodeOptions["errorCorrectionLevel"],
                    )
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  {ERROR_CORRECTION_OPTIONS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
