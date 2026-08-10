import { Container } from '@/components/ui';

/**
 * OFF TRACK — the breathing point.
 *
 * No racing HUD, no telemetry labels, no accent-green readouts. The section
 * exists to say the person is not only an engineer, so it should not look like
 * the rest of the site.
 *
 * There are no photographs in the repository yet, so the gallery renders its
 * frames empty and says what belongs in each. Nothing here claims an award or
 * an exhibition that has not happened.
 */

const FRAMES = [
  { id: 'f1', span: 'md:col-span-8', ratio: 'aspect-[16/10]', hint: 'Lead image — the strongest single frame' },
  { id: 'f2', span: 'md:col-span-4', ratio: 'aspect-[4/5]', hint: 'Portrait' },
  { id: 'f3', span: 'md:col-span-4', ratio: 'aspect-[4/5]', hint: 'Portrait' },
  { id: 'f4', span: 'md:col-span-8', ratio: 'aspect-[16/10]', hint: 'Wide' },
  { id: 'f5', span: 'md:col-span-6', ratio: 'aspect-[3/2]', hint: 'Series — 1' },
  { id: 'f6', span: 'md:col-span-6', ratio: 'aspect-[3/2]', hint: 'Series — 2' },
];

export default function OffTrack() {
  return (
    <>
      <header className="border-b border-line py-16 md:py-24">
        <Container>
          <p className="label-tech mb-6 text-muted">Off Track</p>
          <h1 className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.88] tracking-[0.01em] uppercase">
            Away from
            <br />
            the engineering
          </h1>
          <p className="body-lead mt-8 max-w-xl">
            Photography, mostly. It is the one thing here with no measurements attached, which
            is the point of it.
          </p>
        </Container>
      </header>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
            {FRAMES.map((f) => (
              <figure key={f.id} className={`${f.span} ${f.ratio} relative overflow-hidden`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-line bg-surface/40">
                  <span aria-hidden className="text-[1.25rem] text-faint">
                    ◐
                  </span>
                  <span className="label-tech-sm px-6 text-center normal-case">{f.hint}</span>
                </div>
              </figure>
            ))}
          </div>

          <div className="mt-14 max-w-2xl border-t border-line pt-8">
            <p className="label-tech mb-4">Gallery is empty</p>
            <p className="text-[0.9375rem] leading-relaxed text-muted">
              No photographs have been added to the repository yet, so this page shows the
              layout and nothing else. Drop images into{' '}
              <code className="mono text-ink">public/images/off-track/</code> and list them in{' '}
              <code className="mono text-ink">src/routes/OffTrack.tsx</code> — the grid is
              already sized for a lead frame, two portraits, a wide, and a two-part series.
            </p>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">
              Competition results and exhibitions belong here too, once there is something to
              point at.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
