import { profile } from '@/data/site';

/**
 * Live telemetry from the GitHub REST API.
 *
 * Unauthenticated requests are rate-limited to 60/hour per IP, so results are
 * cached for six hours and every failure — rate limit, offline, API change —
 * falls back to a snapshot committed alongside the code. The page always says
 * which of the two it is showing rather than presenting stale data as live.
 */

export interface RepoSummary {
  name: string;
  description: string;
  language: string | null;
  stars: number;
  pushedAt: string;
  url: string;
  isFork: boolean;
}

export interface Telemetry {
  source: 'live' | 'snapshot';
  fetchedAt: string;
  publicRepos: number;
  followers: number;
  memberSince: string;
  languages: { name: string; count: number }[];
  recent: RepoSummary[];
  /** Public push events bucketed by weekday, Monday first. */
  weekday: number[];
  eventWindow: number;
}

const CACHE_KEY = 'kgp:telemetry';
const TTL_MS = 6 * 60 * 60 * 1000;
const API = 'https://api.github.com';

/**
 * Committed fallback. Captured 2026-08-10 from the same endpoints, so the
 * shape and the figures are real — just not current.
 */
export const SNAPSHOT: Telemetry = {
  source: 'snapshot',
  fetchedAt: '2026-08-10T00:00:00Z',
  publicRepos: 31,
  followers: 19,
  memberSince: '2021-05-28',
  languages: [
    { name: 'Python', count: 7 },
    { name: 'HTML', count: 4 },
    { name: 'Jupyter Notebook', count: 2 },
  ],
  recent: [
    {
      name: 'Agentic_AI_Hackathon_2026',
      description: '',
      language: 'HTML',
      stars: 0,
      pushedAt: '2026-08-07T04:33:10Z',
      url: 'https://github.com/kaushalrog/Agentic_AI_Hackathon_2026',
      isFork: false,
    },
    {
      name: 'portfolio',
      description: '',
      language: 'HTML',
      stars: 0,
      pushedAt: '2026-08-04T16:46:46Z',
      url: 'https://github.com/kaushalrog/portfolio',
      isFork: false,
    },
    {
      name: 'SIH-Data_Analysis-2025',
      description: '',
      language: 'HTML',
      stars: 0,
      pushedAt: '2026-08-03T03:29:43Z',
      url: 'https://github.com/kaushalrog/SIH-Data_Analysis-2025',
      isFork: false,
    },
    {
      name: 'docker-notes',
      description: '',
      language: null,
      stars: 0,
      pushedAt: '2026-07-31T08:11:38Z',
      url: 'https://github.com/kaushalrog/docker-notes',
      isFork: false,
    },
    {
      name: 'scirag-uq',
      description: 'Confidence-calibrated multi-source RAG for scientific literature synthesis',
      language: 'Python',
      stars: 0,
      pushedAt: '2026-07-15T17:29:56Z',
      url: 'https://github.com/kaushalrog/scirag-uq',
      isFork: false,
    },
  ],
  weekday: [0, 0, 0, 0, 0, 0, 0],
  eventWindow: 0,
};

interface ApiRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  html_url: string;
  fork: boolean;
}

interface ApiUser {
  public_repos: number;
  followers: number;
  created_at: string;
}

interface ApiEvent {
  type: string;
  created_at: string;
  payload?: { size?: number };
}

function readCache(): Telemetry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: Telemetry };
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: Telemetry) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage full or blocked — the fetch still succeeded, so carry on.
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchTelemetry(): Promise<Telemetry> {
  const cached = readCache();
  if (cached) return cached;

  const user = profile.github;

  const [account, repos, events] = await Promise.all([
    getJson<ApiUser>(`/users/${user}`),
    getJson<ApiRepo[]>(`/users/${user}/repos?per_page=100&sort=pushed`),
    // Events can 404 or be empty; failure here should not lose the rest.
    getJson<ApiEvent[]>(`/users/${user}/events/public?per_page=100`).catch(() => [] as ApiEvent[]),
  ]);

  const own = repos.filter((r) => !r.fork);

  const langCounts = new Map<string, number>();
  for (const r of own) {
    if (!r.language) continue;
    langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
  }

  // Monday-first weekday buckets, counting commits in public push events.
  const weekday = [0, 0, 0, 0, 0, 0, 0];
  let counted = 0;
  for (const e of events) {
    if (e.type !== 'PushEvent') continue;
    const d = new Date(e.created_at);
    const idx = (d.getDay() + 6) % 7;
    const size = e.payload?.size ?? 1;
    weekday[idx] += size;
    counted += size;
  }

  const data: Telemetry = {
    source: 'live',
    fetchedAt: new Date().toISOString(),
    publicRepos: account.public_repos,
    followers: account.followers,
    memberSince: account.created_at.slice(0, 10),
    languages: [...langCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    recent: own.slice(0, 6).map((r) => ({
      name: r.name,
      description: r.description ?? '',
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
      url: r.html_url,
      isFork: r.fork,
    })),
    weekday,
    eventWindow: counted,
  };

  writeCache(data);
  return data;
}
