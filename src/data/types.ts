/**
 * Content model for KAUSHAL GP.
 *
 * Everything the site renders — Garage, Research, Labs, Command Palette,
 * Skill graph — reads from this layer. Nothing is hardcoded in a component.
 *
 * Rule: every field here is sourced from a repository README, the IEEE paper,
 * or a live GitHub API response. Nothing is invented for visual effect.
 */

export type Tier = 'featured' | 'engineering' | 'experiment' | 'build';

export type Discipline =
  | 'ai-ml'
  | 'ai-systems'
  | 'robotics'
  | 'security'
  | 'systems'
  | 'software'
  | 'research';

export type ProjectStatus = 'published' | 'deployed' | 'active' | 'complete' | 'archived';

/** A single row on a project's specification sheet. */
export interface Spec {
  key: string;
  value: string;
}

/** One section of the engineering report — the case-study narrative. */
export interface ReportSection {
  heading:
    | 'Problem'
    | 'Architecture'
    | 'Implementation'
    | 'Challenges'
    | 'What changed'
    | 'Result'
    | 'Lessons';
  body: string;
}

/** A measured, published number. `source` says where it came from. */
export interface Metric {
  label: string;
  value: string;
  note?: string;
}

export interface Project {
  /** Garage bay number, e.g. "K-01". */
  code: string;
  /** URL slug. */
  id: string;
  name: string;
  subtitle: string;
  tier: Tier;
  discipline: Discipline;
  status: ProjectStatus;
  year: string;
  /** One-line summary used in listings and search. */
  blurb: string;
  /** Which car component this project sits under. */
  component: ComponentId;
  /** "Power unit" — the stack. */
  stack: string[];
  /** Spec-sheet rows. */
  specs: Spec[];
  /** Published/measured results. Empty when the project has none. */
  metrics: Metric[];
  /** The case study. Empty array renders no report section. */
  report: ReportSection[];
  links: {
    repo?: string;
    /** True when the repository exists but is not publicly readable. */
    repoPrivate?: boolean;
    paper?: string;
    demo?: string;
  };
  /** Real assets committed under public/. Empty for projects with none. */
  images?: { src: string; alt: string; caption: string }[];
  /** Free-text keywords that feed the command palette. */
  keywords: string[];
}

/** Car components — the K-01 doubles as the site's navigation model. */
export type ComponentId =
  | 'power-unit'
  | 'aerodynamics'
  | 'telemetry'
  | 'control-system'
  | 'research-division'
  | 'bodywork';

export interface CarComponent {
  id: ComponentId;
  label: string;
  discipline: string;
  description: string;
  /** Route this component navigates to. */
  href: string;
}

export interface ResearchEntry {
  /** Archive reference, e.g. "R-001". */
  ref: string;
  id: string;
  title: string;
  shortTitle: string;
  venue: string;
  venueStatus: 'published' | 'submitted' | 'in-progress';
  year: string;
  authors?: string;
  question: string;
  baseline: string;
  method: string;
  novelty: string;
  experiment: string;
  result: string;
  metrics: Metric[];
  links: { paper?: string; code?: string; codePrivate?: boolean };
}

/** An engineering problem and how it was actually solved. */
export interface Challenge {
  ref: string;
  title: string;
  project: string;
  projectId: string;
  problem: string;
  attempt: string;
  failure: string;
  solution: string;
  result: string;
}

export interface TimelineRound {
  round: string;
  label: string;
  period: string;
  summary: string;
  entries: { title: string; detail: string }[];
}

export interface SkillNode {
  id: string;
  label: string;
  /** Parent node ids — the graph is a DAG, not a tree. */
  parents: string[];
  /** Project ids where this was actually used. */
  projects: string[];
  tools?: string[];
}
