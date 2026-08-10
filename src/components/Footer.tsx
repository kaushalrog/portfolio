import { Link } from 'react-router-dom';
import { profile } from '@/data/site';
import { Container } from './ui';

export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-[1.5rem] leading-none tracking-wide">
              {profile.team}
            </p>
            <p className="label-tech mt-3">
              {profile.name} · {profile.role}
            </p>
            <p className="label-tech-sm mt-1.5 normal-case">{profile.base}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={`mailto:${profile.links.email}`}
              className="link-tech"
              rel="noreferrer noopener"
            >
              Email
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer noopener" className="link-tech">
              GitHub ↗
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="link-tech"
            >
              LinkedIn ↗
            </a>
            <a href={profile.links.resume} target="_blank" rel="noreferrer noopener" className="link-tech">
              Resume ↗
            </a>
            <Link to="/radio" className="link-tech">
              Team Radio
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="label-tech-sm">SEASON {profile.season} · ALL FIGURES SOURCED FROM PUBLISHED WORK</p>
          <p className="label-tech-sm">BUILD 2026.1</p>
        </div>
      </Container>
    </footer>
  );
}
