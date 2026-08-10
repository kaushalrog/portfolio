import { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DriverModeProvider } from './context/DriverMode';
import BootSequence, { shouldBoot } from './components/BootSequence';
import Nav from './components/Nav';
import MobileNav from './components/MobileNav';
import RaceHud from './components/RaceHud';
import RouteTransition from './components/RouteTransition';
import CommandPalette from './components/CommandPalette';
import Footer from './components/Footer';
import Terminal from './components/Terminal';

const Paddock = lazy(() => import('./routes/Paddock'));
const Garage = lazy(() => import('./routes/Garage'));
const ProjectDetail = lazy(() => import('./routes/ProjectDetail'));
const Engineering = lazy(() => import('./routes/Engineering'));
const Research = lazy(() => import('./routes/Research'));
const Telemetry = lazy(() => import('./routes/Telemetry'));
const Archive = lazy(() => import('./routes/Archive'));
const Championship = lazy(() => import('./routes/Championship'));
const OffTrack = lazy(() => import('./routes/OffTrack'));
const Radio = lazy(() => import('./routes/Radio'));

/** Every navigation lands at the top of the new page, not mid-scroll. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="label-tech text-faint">LOADING…</span>
    </div>
  );
}

function Shell() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollToTop />
      <RouteTransition />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <RaceHud />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <main id="main" tabIndex={-1} className="pt-14 pb-20 lg:pt-0 lg:pb-0 lg:pl-60">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Paddock />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/garage/:id" element={<ProjectDetail />} />
            <Route path="/engineering" element={<Engineering />} />
            <Route path="/research" element={<Research />} />
            <Route path="/telemetry" element={<Telemetry />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/championship" element={<Championship />} />
            <Route path="/off-track" element={<OffTrack />} />
            <Route path="/radio" element={<Radio />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <div className="lg:pl-60">
        <Footer />
      </div>
      <Terminal />
      <MobileNav onOpenPalette={() => setPaletteOpen(true)} />
    </>
  );
}

export default function App() {
  const [booting, setBooting] = useState(shouldBoot);

  return (
    <DriverModeProvider>
      <HashRouter>
        {booting && <BootSequence onDone={() => setBooting(false)} />}
        <Shell />
      </HashRouter>
    </DriverModeProvider>
  );
}
