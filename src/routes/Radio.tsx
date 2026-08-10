import { profile } from '@/data/site';
import { Container, HairlineGrid, PageHeader } from '@/components/ui';

const CHANNELS = [
  {
    label: 'Email',
    value: profile.links.email,
    href: `mailto:${profile.links.email}`,
    note: 'The reliable channel',
    external: false,
  },
  {
    label: 'GitHub',
    value: `@${profile.github}`,
    href: profile.links.github,
    note: 'Source, where it is public',
    external: true,
  },
  {
    label: 'LinkedIn',
    value: 'kaushal-s',
    href: profile.links.linkedin,
    note: 'Professional',
    external: true,
  },
  {
    label: 'Resume',
    value: 'PDF',
    href: profile.links.resume,
    note: 'Full record',
    external: true,
  },
];

export default function Radio() {
  return (
    <>
      <PageHeader
        code="TEAM RADIO"
        title="Open Channel"
        lede="Research collaboration, engineering roles, or a question about anything on this site."
        meta={
          <div className="lg:text-right">
            <p className="label-tech-sm mb-2">Status</p>
            <p className="mono flex items-center gap-2.5 text-[0.875rem] text-ok lg:justify-end">
              <span className="status-dot" /> OPEN
            </p>
          </div>
        }
      />

      <section className="border-b border-line py-12 md:py-16">
        <Container>
          <HairlineGrid className="sm:grid-cols-2 xl:grid-cols-4">
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                className="group flex flex-col gap-4 p-6 transition-colors hover:bg-surface"
              >
                <p className="label-tech text-accent">{c.label}</p>
                <p className="mono truncate text-[0.9375rem] transition-colors group-hover:text-accent">
                  {c.value}
                </p>
                <p className="label-tech-sm mt-auto normal-case">{c.note}</p>
              </a>
            ))}
          </HairlineGrid>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-20">
            <div>
              <p className="label-tech mb-6 text-accent">Driver Profile</p>
              <dl className="max-w-xl">
                {[
                  { k: 'Name', v: 'Kaushal S' },
                  { k: 'Discipline', v: 'Artificial Intelligence' },
                  { k: 'Secondary', v: 'Systems · Robotics · Security · Research' },
                  { k: 'Base', v: profile.base },
                  { k: 'Season', v: profile.season },
                ].map((r) => (
                  <div key={r.k} className="spec-row">
                    <dt className="spec-key">{r.k}</dt>
                    <dd className="spec-val">{r.v}</dd>
                  </div>
                ))}
              </dl>

              <p className="body-lead mt-10 max-w-xl">{profile.bio}</p>
            </div>

            <aside>
              <p className="label-tech mb-6 text-accent">Approach</p>
              <ul className="space-y-1">
                {profile.approach.map((line) => (
                  <li
                    key={line}
                    className="font-display text-[2rem] leading-none tracking-wide md:text-[2.5rem]"
                  >
                    {line}
                  </li>
                ))}
              </ul>

              <a
                href={`mailto:${profile.links.email}`}
                className="btn btn-solid mt-10 inline-flex"
              >
                Open radio →
              </a>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
