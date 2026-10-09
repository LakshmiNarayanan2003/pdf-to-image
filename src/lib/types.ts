import type { PDFDocumentProxy } from 'pdfjs-dist';
export type Format = 'png' | 'jpeg' | 'webp' | 'svg' | 'avif' | 'txt' | 'json';
export type PageMode = 'all' | 'current' | 'custom';
export interface LoadedDocument {
  id: string;
  name: string;
  size: number;
  pdf: PDFDocumentProxy;
}
export interface ExportOptions {
  format: Format;
  dpi: number;
  quality: number;
  mode: PageMode;
  range: string;
  current: number;
}
export interface Output {
  name: string;
  blob: Blob;
}
export interface Progress {
  completed: number;
  total: number;
  stage: string;
}
export interface PasswordRequest {
  name: string;
  incorrect: boolean;
  submit: (password: string) => void;
  cancel: () => void;
}
