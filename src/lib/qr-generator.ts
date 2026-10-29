import QRCode from 'qrcode';
import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';

export interface QRCodeOptions {
  /** The data to encode in the QR code */
  data: string;
  /** Output size in pixels (width = height) */
  size?: number;
  /** Error correction level */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Margin around the QR code in modules */
  margin?: number;
  /** Dark module color */
  colorDark?: string;
  /** Light module color */
  colorLight?: string;
  /** Logo/image to embed in center */
  logo?: {
    /** Logo image URL or base64 data URL */
    src: string;
    /** Logo size as percentage of QR code (0-0.5) */
    size?: number;
    /** Logo background color */
    background?: string;
    /** Logo border radius */
    borderRadius?: number;
  };
  /** Shape style */
  shape?: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'custom';
  /** Custom shape path (SVG path data) for 'custom' shape */
  customShapePath?: string;
  /** Theme preset */
  theme?: 'default' | 'batman' | 'superman' | 'spiderman' | 'ironman' | 'captain-america' | 'hulk' | 'thor' | 'wonder-woman' | 'flash' | 'aquaman' | 'green-lantern' | 'custom';
  /** Custom theme colors */
  customTheme?: {
    primary: string;
    secondary: string;
    background: string;
    logoSrc?: string;
  };
  /** Output format */
  format?: 'png' | 'svg' | 'jpeg' | 'webp';
  /** Quality for JPEG/WebP (0-1) */
  quality?: number;
}

export interface QRCodeResult {
  /** Base64 data URL */
  dataUrl: string;
  /** Buffer (for PNG/JPEG) */
  buffer?: Buffer;
  /** SVG string (for SVG format) */
  svg?: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  logoSrc?: string;
  shape: QRCodeOptions['shape'];
}

// Predefined theme configurations
export const THEMES = {
  default: {
    primary: '#000000',
    secondary: '#0ea5e9',
    background: '#ffffff',
    shape: 'square',
  },
  batman: {
    primary: '#000000',
    secondary: '#ffd700',
    background: '#1a1a1a',
    logoSrc: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZDcwMCI+PHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDE1LjkzIDIyTDEyIDE3LjI3IDguMDcgMjIgMTAuOTEgMTUuNzQgMiA5IDguOTEgOC4yNkwxMiAyeiIvPjwvc3ZnPg==',
    shape: 'custom',
  },
  superman: {
    primary: '#003399',
    secondary: '#ff0000',
    background: '#ffffff',
    logoSrc: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmMDAwMCI+PHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDE1LjkzIDIyTDEyIDE3LjI3IDguMDcgMjIgMTAuOTEgMTUuNzQgMiA5IDguOTEgOC4yNkwxMiAyeiIvPjwvc3ZnPg==',
    shape: 'custom',
  },
  spiderman: {
    primary: '#ff0000',
    secondary: '#000000',
    background: '#ffffff',
    shape: 'dots',
  },
  ironman: {
    primary: '#cc0000',
    secondary: '#ffd700',
    background: '#1a1a1a',
    shape: 'classy-rounded',
  },
  'captain-america': {
    primary: '#002868',
    secondary: '#ffffff',
    background: '#c8102e',
    shape: 'classy',
  },
  hulk: {
    primary: '#2e7d32',
    secondary: '#4caf50',
    background: '#1b5e20',
    shape: 'dots',
  },
  thor: {
    primary: '#6d4c41',
    secondary: '#ffd700',
    background: '#4e342e',
    shape: 'classy',
  },
  'wonder-woman': {
    primary: '#c62828',
    secondary: '#ffd700',
    background: '#ffffff',
    shape: 'custom',
  },
  flash: {
    primary: '#ff0000',
    secondary: '#ffd700',
    background: '#ffffff',
    shape: 'dots',
  },
  aquaman: {
    primary: '#006064',
    secondary: '#00bcd4',
    background: '#e0f2f1',
    shape: 'rounded',
  },
  'green-lantern': {
    primary: '#004d40',
    secondary: '#a5d6a7',
    background: '#004d40',
    shape: 'classy-rounded',
  },
};

export class QRCodeGenerator {
  private static readonly DEFAULT_SIZE = 512;

  /**
   * Generate a customizable QR code
   */
  static async generate(options: QRCodeOptions): Promise<QRCodeResult> {
    const {
      data,
      size = this.DEFAULT_SIZE,
      errorCorrectionLevel = 'H',
      margin = 2,
      colorDark,
      colorLight,
      logo,
      shape = 'square',
      theme = 'default',
      customTheme,
      format = 'png',
      quality = 0.92,
    } = options;

    // Resolve theme
    let resolvedTheme: ThemeConfig;
    if (theme === 'custom' && customTheme) {
      resolvedTheme = customTheme as ThemeConfig;
    } else {
      resolvedTheme = (THEMES[theme as keyof typeof THEMES] || THEMES.default) as ThemeConfig;
    }
    const finalColorDark = colorDark || resolvedTheme.primary;
    const finalColorLight = colorLight || resolvedTheme.background;
    const finalShape = shape === 'custom' && resolvedTheme.shape ? resolvedTheme.shape : shape;

    // Generate base QR code
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel,
      margin,
      color: {
        dark: finalColorDark,
        light: finalColorLight,
      },
      width: size,
    });

    // If no customization needed, return base QR code
    if (!logo && !customTheme && theme === 'default' && shape === 'square' && format === 'png') {
      return {
        dataUrl: qrCodeDataUrl,
        width: size,
        height: size,
      };
    }

    // Create canvas for customization
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = finalColorLight;
    ctx.fillRect(0, 0, size, size);

    // Draw QR code onto canvas
    const qrImage = await loadImage(qrCodeDataUrl);
    ctx.drawImage(qrImage, 0, 0, size, size);

    // Apply shape mask
    if (finalShape !== 'square') {
      this.applyShapeMask(ctx, size, finalShape, finalColorLight);
    }

    // Draw logo if provided
    if (logo) {
      await this.drawLogo(ctx, size, logo, resolvedTheme);
    }

    // Apply theme-specific effects
    if (theme !== 'default' && theme !== 'custom') {
      this.applyThemeEffects(ctx, size, theme, resolvedTheme);
    }

    // Return result based on format
    if (format === 'svg') {
      const svg = await this.generateSVG(data, options);
      return { dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, svg, width: size, height: size };
    }

    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const buffer = (canvas as any).toBuffer(mimeType, { quality });
    const dataUrl = `data:image/${format === 'jpeg' ? 'jpeg' : format};base64,${buffer.toString('base64')}`;

    return {
      dataUrl,
      buffer,
      width: size,
      height: size,
    };
  }

  /**
   * Apply shape mask to QR code
   */
  private static applyShapeMask(ctx: CanvasRenderingContext2D, size: number, shape: string, backgroundColor: string) {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - size * 0.05;

    ctx.globalCompositeOperation = 'destination-in';

    switch (shape) {
      case 'rounded':
        this.roundedRect(ctx, size * 0.05, size * 0.05, size * 0.9, size * 0.9, size * 0.15);
        ctx.fill();
        break;
      case 'dots':
        this.drawDotsMask(ctx, size);
        break;
      case 'classy':
        this.classyMask(ctx, size);
        break;
      case 'classy-rounded':
        this.classyRoundedMask(ctx, size);
        break;
      case 'custom':
        // Custom shape would need SVG path - simplified to rounded
        this.roundedRect(ctx, size * 0.05, size * 0.05, size * 0.9, size * 0.9, size * 0.15);
        ctx.fill();
        break;
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Draw dots-style mask (circular modules)
   */
  private static drawDotsMask(ctx: CanvasRenderingContext2D, size: number) {
    const moduleSize = size / 37; // Approximate module size for version 1 QR
    const modules = 37;
    const offset = (size - modules * moduleSize) / 2;

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const x = offset + col * moduleSize + moduleSize / 2;
        const y = offset + row * moduleSize + moduleSize / 2;
        ctx.beginPath();
        ctx.arc(x, y, moduleSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Classy mask (rounded squares with gaps)
   */
  private static classyMask(ctx: CanvasRenderingContext2D, size: number) {
    const moduleSize = size / 37;
    const modules = 37;
    const offset = (size - modules * moduleSize) / 2;
    const gap = moduleSize * 0.1;

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const x = offset + col * moduleSize + gap / 2;
        const y = offset + row * moduleSize + gap / 2;
        const w = moduleSize - gap;
        const h = moduleSize - gap;
        const r = moduleSize * 0.1;
        this.roundedRect(ctx, x, y, w, h, r);
        ctx.fill();
      }
    }
  }

  /**
   * Classy rounded mask
   */
  private static classyRoundedMask(ctx: CanvasRenderingContext2D, size: number) {
    const moduleSize = size / 37;
    const modules = 37;
    const offset = (size - modules * moduleSize) / 2;
    const gap = moduleSize * 0.15;

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const x = offset + col * moduleSize + gap / 2;
        const y = offset + row * moduleSize + gap / 2;
        const w = moduleSize - gap;
        const h = moduleSize - gap;
        const r = Math.min(w, h) / 2;
        this.roundedRect(ctx, x, y, w, h, r);
        ctx.fill();
      }
    }
  }

  /**
   * Draw logo in center of QR code
   */
  private static async drawLogo(ctx: CanvasRenderingContext2D, size: number, logo: QRCodeOptions['logo'], theme: ThemeConfig) {
    if (!logo) return;

    const logoSize = size * (logo.size || 0.2);
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;

    try {
      const logoImage = await loadImage(logo.src);

      // Draw logo background if specified
      if (logo.background) {
        ctx.fillStyle = logo.background;
        const borderRadius = logo.borderRadius || logoSize * 0.1;
        this.roundedRect(ctx, logoX, logoY, logoSize, logoSize, borderRadius);
        ctx.fill();
      }

      // Draw logo with clipping
      ctx.save();
      const borderRadius = logo.borderRadius || logoSize * 0.1;
      this.roundedRect(ctx, logoX, logoY, logoSize, logoSize, borderRadius);
      ctx.clip();
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } catch (error) {
      console.warn('Failed to load logo:', error);
    }
  }

  /**
   * Apply theme-specific visual effects
   */
  private static applyThemeEffects(ctx: CanvasRenderingContext2D, size: number, theme: string, themeConfig: ThemeConfig) {
    switch (theme) {
      case 'batman':
        // Add subtle bat-symbol watermark
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = themeConfig.secondary;
        // Simplified - would need actual bat symbol path
        ctx.globalAlpha = 1;
        break;
      case 'superman':
        // Add subtle S shield
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = themeConfig.secondary;
        ctx.globalAlpha = 1;
        break;
      case 'ironman':
        // Arc reactor glow effect
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(204, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        break;
    }
  }

  /**
   * Generate SVG QR code with customization
   */
  private static async generateSVG(data: string, options: QRCodeOptions): Promise<string> {
    const {
      size = this.DEFAULT_SIZE,
      errorCorrectionLevel = 'H',
      margin = 2,
      colorDark = '#000000',
      colorLight = '#ffffff',
    } = options;

    // Use qrcode library to generate SVG
    return QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel,
      margin,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      width: size,
    });
  }

  /**
   * Helper: Rounded rectangle path
   */
  private static roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Get available themes
   */
  static getAvailableThemes(): string[] {
    return Object.keys(THEMES);
  }

  /**
   * Get theme configuration
   */
  static getTheme(theme: string) {
    return THEMES[theme as keyof typeof THEMES] || THEMES.default;
  }

  /**
   * Generate multiple QR codes for a tag (different sizes/formats)
   */
  static async generateSet(data: string, baseOptions: Omit<QRCodeOptions, 'data'> = {}, sizes: number[] = [128, 256, 512, 1024]) {
    const formats: QRCodeOptions['format'][] = ['png', 'svg', 'webp'];

    const results = await Promise.all(
      sizes.flatMap(s =>
        formats.map(f => this.generate({ ...baseOptions, data, size: s, format: f }))
      )
    );

    return results.reduce((acc, result, i) => {
      const size = sizes[Math.floor(i / formats.length)];
      const format = formats[i % formats.length];
      acc[`${size}x${size}_${format}`] = result;
      return acc;
    }, {} as Record<string, QRCodeResult>);
  }
}

/**
 * React hook for QR code generation
 */
export function useQRCode() {
  const generate = QRCodeGenerator.generate.bind(QRCodeGenerator);
  const generateSet = QRCodeGenerator.generateSet.bind(QRCodeGenerator);
  const getThemes = QRCodeGenerator.getAvailableThemes.bind(QRCodeGenerator);
  const getTheme = QRCodeGenerator.getTheme.bind(QRCodeGenerator);

  return { generate, generateSet, getThemes, getTheme };
}