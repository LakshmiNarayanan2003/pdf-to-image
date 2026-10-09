import { useEffect, useRef, useState } from 'react';
import type {
  ExportOptions,
  LoadedDocument,
  Output,
  PasswordRequest,
  Progress,
} from '../lib/types';
import { disposeDocument } from '../lib/lifecycle';
import { convert, downloadUrl, planExport } from '../lib/export';
import { detectCodecs } from '../lib/render';
import {
  friendlyError,
  isCancelled,
  MAX_INPUT_BYTES,
  UserError,
} from '../lib/utils';
export function useConverter() {
  const [docs, setDocs] = useState<LoadedDocument[]>([]);
  const docsRef = useRef(docs);
  useEffect(() => {
    docsRef.current = docs;
  }, [docs]);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeId, setActiveId] = useState('');
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    dpi: 150,
    quality: 0.92,
    mode: 'all',
    range: '',
    current: 1,
  });
  const [codecs, setCodecs] = useState({ webp: false, avif: false });
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [password, setPassword] = useState<PasswordRequest | null>(null);
  const [result, setResult] = useState<(Output & { url: string }) | null>(null);
  const resultRef = useRef(result);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);
  const [dark, setDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [dragging, setDragging] = useState(false);
  const operationRef = useRef<AbortController | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef(false);
  const active = docs.find((doc) => doc.id === activeId) ?? docs[0];
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  useEffect(() => {
    void detectCodecs().then(setCodecs);
    return () => {
      operationRef.current?.abort();
      docsRef.current.forEach((doc) => void disposeDocument(doc));
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    };
  }, []);
  const clearResult = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  };
  const remove = (id: string) => {
    if (busy) return;
    const doc = docs.find((item) => item.id === id);
    setDocs((items) => items.filter((item) => item.id !== id));
    setSelected((ids) => ids.filter((item) => item !== id));
    setPage(1);
    clearResult();
    if (doc) void disposeDocument(doc);
  };
  const clear = () => {
    if (busy) return;
    docs.forEach((doc) => void disposeDocument(doc));
    setDocs([]);
    setSelected([]);
    setActiveId('');
    setPage(1);
    clearResult();
    setErrors([]);
    setNotice('Files cleared from this session.');
  };
  const ingest = async (files: File[], replacing = false) => {
    if (operationRef.current || !files.length) return;
    const controller = new AbortController();
    operationRef.current = controller;
    setBusy(true);
    setErrors([]);
    setNotice('');
    clearResult();
    const existing =
      replacing && active ? docs.filter((d) => d.id !== active.id) : docs;
    const loaded: LoadedDocument[] = [];
    const failures: string[] = [];
    let totalBytes = existing.reduce((sum, doc) => sum + doc.size, 0);
    try {
      for (const file of files) {
        if (controller.signal.aborted) break;
        if (existing.length + loaded.length >= 20) {
          failures.push(
            'Up to 20 PDFs can be open at once. Remove files before adding more.',
          );
          break;
        }
        if (totalBytes + file.size > MAX_INPUT_BYTES) {
          failures.push(
            'Total input exceeds the 200 MB safety limit. Remove a file and try again.',
          );
          continue;
        }
        setProgress({
          completed: loaded.length,
          total: files.length,
          stage: `Opening PDF ${loaded.length + 1} of ${files.length}`,
        });
        try {
          const { loadPdf } = await import('../lib/pdf');
          const doc = await loadPdf(file, controller.signal, setPassword);
          loaded.push(doc);
          totalBytes += file.size;
        } catch (error) {
          if (!controller.signal.aborted) failures.push(friendlyError(error));
        }
      }
      if (controller.signal.aborted) {
        loaded.forEach((doc) => void disposeDocument(doc));
        setNotice('Opening cancelled.');
      } else if (loaded.length) {
        if (replacing && active) void disposeDocument(active);
        setDocs([...existing, ...loaded]);
        setSelected([
          ...selected.filter((id) => existing.some((doc) => doc.id === id)),
          ...loaded.map((doc) => doc.id),
        ]);
        setActiveId(loaded[0].id);
        setPage(1);
        setNotice(
          `${loaded.length} PDF${loaded.length > 1 ? 's' : ''} ready. Choose your pages and export.`,
        );
      }
      setErrors(failures);
    } finally {
      operationRef.current = null;
      setBusy(false);
      setProgress(null);
    }
  };
  const sample = async () => {
    if (operationRef.current) return;
    setErrors([]);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}sample.pdf`);
      if (!response.ok)
        throw new UserError(
          'The sample could not load. Try again when connected.',
        );
      await ingest([
        new File([await response.blob()], 'PDF2Pix-sample.pdf', {
          type: 'application/pdf',
        }),
      ]);
    } catch {
      setErrors(['The sample could not load. Try again when connected.']);
    }
  };
  const targetDocs =
    options.mode === 'current'
      ? active
        ? [active]
        : []
      : docs.filter((doc) => selected.includes(doc.id));
  const currentOptions = { ...options, current: page };
  let count = 0;
  try {
    count = planExport(targetDocs, currentOptions).reduce(
      (sum, item) => sum + item.pages.length,
      0,
    );
  } catch {
    /* Range errors are displayed on export. */
  }
  const exportFiles = async () => {
    if (operationRef.current) return;
    const controller = new AbortController();
    operationRef.current = controller;
    setBusy(true);
    setErrors([]);
    setNotice('');
    clearResult();
    try {
      const output = await convert(
        targetDocs,
        currentOptions,
        controller.signal,
        setProgress,
      );
      const url = URL.createObjectURL(output.blob);
      setResult({ ...output, url });
      setNotice(
        `Done. ${count} page${count !== 1 ? 's' : ''} exported. Your download is ready.`,
      );
      downloadUrl(url, output.name);
    } catch (error) {
      if (isCancelled(error))
        setNotice('Export cancelled. Your PDFs are ready to try again.');
      else setErrors([friendlyError(error)]);
    } finally {
      operationRef.current = null;
      setBusy(false);
      setProgress(null);
    }
  };
  return {
    docs,
    selected,
    setSelected,
    setActiveId,
    page,
    setPage,
    options,
    setOptions,
    codecs,
    busy,
    progress,
    errors,
    setErrors,
    notice,
    password,
    result,
    dark,
    setDark,
    dragging,
    setDragging,
    operationRef,
    pickerRef,
    replaceRef,
    active,
    remove,
    clear,
    ingest,
    sample,
    targetDocs,
    count,
    exportFiles,
  };
}
