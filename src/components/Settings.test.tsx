import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Settings } from './Settings';
import type { ExportOptions } from '../lib/types';
const options: ExportOptions = {
  format: 'png',
  dpi: 150,
  quality: 0.92,
  mode: 'all',
  range: '',
  current: 1,
};
const props = {
  options,
  onChange: vi.fn(),
  codecs: { webp: true, avif: false },
  busy: false,
  available: true,
  progress: null,
  onExport: vi.fn(),
  onCancel: vi.fn(),
  count: 3,
};
it('selects JPEG and labels SVG fidelity', async () => {
  render(<Settings {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /JPG/ }));
  expect(props.onChange).toHaveBeenCalledWith({ ...options, format: 'jpeg' });
  expect(screen.getByRole('button', { name: /SVG/ })).toHaveTextContent(
    'Embedded raster',
  );
});
it('disables unsupported WebP and omits AVIF', () => {
  render(<Settings {...props} codecs={{ webp: false, avif: false }} />);
  expect(screen.getByRole('button', { name: /WebP/ })).toBeDisabled();
  expect(
    screen.queryByRole('option', { name: /AVIF/ }),
  ).not.toBeInTheDocument();
});
it('announces progress and allows cancellation', async () => {
  render(
    <Settings
      {...props}
      busy
      progress={{ completed: 1, total: 3, stage: 'Converted 1 of 3 pages' }}
    />,
  );
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  await userEvent.click(
    screen.getByRole('button', { name: 'Cancel processing' }),
  );
  expect(props.onCancel).toHaveBeenCalled();
});
it('describes SVG as raster-backed', () => {
  render(<Settings {...props} options={{ ...options, format: 'svg' }} />);
  expect(
    screen.getByText(/not editable or vector-preserving/),
  ).toBeInTheDocument();
});
it('only shows quality where supported', () => {
  const { rerender } = render(<Settings {...props} />);
  expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  rerender(<Settings {...props} options={{ ...options, format: 'jpeg' }} />);
  expect(screen.getByRole('slider', { name: /Quality/ })).toHaveValue('92');
});
