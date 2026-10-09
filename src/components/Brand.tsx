import {
  Code2,
  Sun,
  Moon,
  ArrowUpRight,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';
import { SOURCE } from './Info';
export function Header({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#">
        <img
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          width="32"
          height="32"
          alt=""
        />
        PDF2Pix<span className="open-badge">OPEN SOURCE</span>
      </a>
      <nav aria-label="Main">
        <a href="#converter">Convert</a>
        <a href="#how-it-works">How it works</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="header-actions">
        <a
          href={SOURCE}
          className="github-link"
          target="_blank"
          rel="noreferrer"
        >
          <Code2 size={17} />
          GitHub
          <ArrowUpRight size={13} />
        </a>
        <button
          className="icon-button theme-toggle"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggle}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
export function Hero() {
  return (
    <section className="hero">
      <div className="eyebrow">
        <span /> YOUR DOCUMENTS NEVER LEAVE YOUR DEVICE
      </div>
      <h1>
        Convert PDFs.
        <br className="mobile-break" /> <em>Keep them private.</em>
      </h1>
      <p>
        Turn your pages into beautiful images. Right in your browser.
        <br />
        No uploads, no accounts. Just your files, your way.
      </p>
      <div className="trust-points">
        <span>
          <ShieldCheck size={15} />
          100% in your browser
        </span>
        <span>
          <LockKeyhole size={14} />
          No uploads
        </span>
        <span>
          <Code2 size={15} />
          Free & open source
        </span>
      </div>
    </section>
  );
}
