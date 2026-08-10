import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadingLabelFor } from '@/nav';

/**
 * A thin line sweeps across the screen on navigation. ~420ms total — enough to
 * read the destination, short enough that it never feels like waiting.
 */
export default function RouteTransition() {
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('');
  const [first, setFirst] = useState(true);

  useEffect(() => {
    if (first) {
      setFirst(false);
      return;
    }
    setLabel(loadingLabelFor(pathname));
    setActive(true);
    const t = window.setTimeout(() => setActive(false), 420);
    return () => clearTimeout(t);
    // Only re-runs on pathname change; `first` is a one-shot guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!active) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[150]">
      <div className="relative h-px w-full overflow-hidden bg-transparent">
        <div className="h-full w-full origin-left bg-accent [animation:sweep-line_420ms_var(--ease-out-expo)_forwards]" />
      </div>
      <div className="flex justify-center">
        <span className="label-tech mt-3 bg-page/80 px-3 py-1 text-accent backdrop-blur-sm">
          {label}
        </span>
      </div>
    </div>
  );
}
