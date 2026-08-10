import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects, tierLabels } from '@/data/projects';
import { research } from '@/data/research';
import { profile, skillGraph } from '@/data/site';
import type { Tier } from '@/data/types';

/**
 * A real shell over the same content layer the rest of the site reads from —
 * so `projects` cannot drift out of sync with the Garage. Opens from the corner
 * button or Ctrl+`.
 */

type Line = { kind: 'in' | 'out' | 'err'; text: string };

const PROMPT = 'kaushal@gp:~$';

const HELP = [
  'about        driver profile',
  'projects     list the garage        [--tier featured|engineering|experiment|build]',
  'research     list the archive',
  'skills       skill graph nodes',
  'open <id>    navigate to a project or page',
  'whoami       identity',
  'links        contact and external links',
  'clear        clear the screen',
  'exit         close the terminal',
];

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: `KAUSHAL GP — season ${profile.season}` },
    { kind: 'out', text: "Type 'help' for available commands." },
  ]);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const emit = (out: Line[]) => setLines((prev) => [...prev, ...out]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    setHistory((h) => [cmd, ...h]);
    setCursor(-1);
    emit([{ kind: 'in', text: cmd }]);

    const [name, ...args] = cmd.split(/\s+/);

    switch (name.toLowerCase()) {
      case 'help':
        return emit(HELP.map((text) => ({ kind: 'out' as const, text })));

      case 'about':
      case 'whoami':
        return emit([
          { kind: 'out', text: `${profile.name} — ${profile.role}` },
          { kind: 'out', text: profile.base },
          { kind: 'out', text: `Specialization: ${profile.specialization}` },
          { kind: 'out', text: `Current: ${profile.currentDevelopment.join(' · ')}` },
          { kind: 'out', text: '' },
          { kind: 'out', text: profile.approach.join(' ') },
        ]);

      case 'projects': {
        const flag = args.indexOf('--tier');
        const tier = flag >= 0 ? (args[flag + 1] as Tier | undefined) : undefined;
        if (tier && !(tier in tierLabels)) {
          return emit([
            { kind: 'err', text: `unknown tier '${tier}' — try featured|engineering|experiment|build` },
          ]);
        }
        const list = tier ? projects.filter((p) => p.tier === tier) : projects;
        return emit([
          { kind: 'out', text: `${list.length} system${list.length === 1 ? '' : 's'}` },
          ...list.map((p) => ({
            kind: 'out' as const,
            text: `${p.code}  ${p.id.padEnd(28)}${p.name}`,
          })),
          { kind: 'out', text: '' },
          { kind: 'out', text: "open <id> to navigate — e.g. 'open sec-rag'" },
        ]);
      }

      case 'research':
        return emit([
          ...research.map((r) => ({
            kind: 'out' as const,
            text: `${r.ref}  ${r.shortTitle.padEnd(24)}${r.venueStatus.toUpperCase()}`,
          })),
        ]);

      case 'skills':
        return emit(
          skillGraph.map((s) => ({
            kind: 'out' as const,
            text: `${s.label.padEnd(30)}${s.projects.length} project${s.projects.length === 1 ? '' : 's'}`,
          })),
        );

      case 'links':
        return emit([
          { kind: 'out', text: `email     ${profile.links.email}` },
          { kind: 'out', text: `github    ${profile.links.github}` },
          { kind: 'out', text: `linkedin  ${profile.links.linkedin}` },
          { kind: 'out', text: `resume    ${profile.links.resume}` },
        ]);

      case 'open': {
        const target = args[0];
        if (!target) return emit([{ kind: 'err', text: 'open: missing argument' }]);
        const project = projects.find((p) => p.id === target || p.code.toLowerCase() === target);
        if (project) {
          emit([{ kind: 'out', text: `→ /garage/${project.id}` }]);
          setOpen(false);
          return navigate(`/garage/${project.id}`);
        }
        const routes = ['garage', 'engineering', 'research', 'telemetry', 'archive', 'championship', 'off-track', 'radio'];
        if (routes.includes(target)) {
          emit([{ kind: 'out', text: `→ /${target}` }]);
          setOpen(false);
          return navigate(`/${target}`);
        }
        return emit([{ kind: 'err', text: `open: '${target}' not found` }]);
      }

      case 'clear':
        return setLines([]);

      case 'exit':
        return setOpen(false);

      default:
        return emit([
          { kind: 'err', text: `${name}: command not found — try 'help'` },
        ]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    }
    if (e.key === 'Escape') setOpen(false);
    // Shell-style history on the arrow keys.
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) {
        setCursor(next);
        setInput(history[next]);
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setInput(next >= 0 ? history[next] : '');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open terminal"
        title="Terminal — Ctrl+`"
        className="label-tech-sm fixed right-4 bottom-24 z-[92] hidden h-9 w-9 items-center justify-center border border-line bg-page/90 text-muted backdrop-blur transition-colors hover:border-accent hover:text-accent lg:bottom-6 lg:flex"
      >
        {'>_'}
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-6 z-[92] hidden w-[34rem] max-w-[calc(100vw-2rem)] flex-col border border-line-strong bg-page/97 backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="label-tech-sm text-accent">TERMINAL</span>
        <button
          onClick={() => setOpen(false)}
          className="label-tech-sm text-faint hover:text-ink"
          aria-label="Close terminal"
        >
          ESC
        </button>
      </div>

      <div ref={scrollRef} className="mono h-72 overflow-y-auto px-4 py-3 text-[0.75rem] leading-relaxed">
        {lines.map((l, i) => (
          <p
            key={i}
            className={
              l.kind === 'in'
                ? 'text-ink'
                : l.kind === 'err'
                  ? 'text-warn'
                  : 'whitespace-pre text-muted'
            }
          >
            {l.kind === 'in' && <span className="mr-2 text-accent">{PROMPT}</span>}
            {l.text}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
        <span className="mono shrink-0 text-[0.75rem] text-accent">{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Terminal input"
          spellCheck={false}
          autoComplete="off"
          className="mono flex-1 bg-transparent text-[0.75rem] text-ink focus:outline-none"
        />
      </div>
    </div>
  );
}
