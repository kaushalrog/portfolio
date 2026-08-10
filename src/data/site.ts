import type { CarComponent, SkillNode, TimelineRound } from './types';

export const profile = {
  team: 'KAUSHAL GP',
  season: '2026',
  name: 'KAUSHAL S',
  role: 'AI Engineer / Researcher / Builder',
  disciplines: ['AI', 'SYSTEMS', 'RESEARCH', 'ROBOTICS'],
  statement:
    'Building intelligent systems at the intersection of AI, software and engineering.',
  base: 'Amrita Vishwa Vidyapeetham, Coimbatore',
  specialization: 'AI / SYSTEMS',
  currentDevelopment: ['RAG', 'AI SECURITY', 'INTELLIGENT SYSTEMS'],
  approach: ['BUILD.', 'BREAK.', 'UNDERSTAND.', 'REBUILD.'],
  /** From the GitHub profile. */
  bio: 'Making machines smarter and myself more confused. Still compiling. Still learning.',
  github: 'kaushalrog',
  links: {
    github: 'https://github.com/kaushalrog',
    linkedin: 'https://www.linkedin.com/in/kaushal-s-19234b314',
    email: 'kaushalreddy15@gmail.com',
    resume:
      'https://drive.google.com/file/d/1vNouvR0xk24Vo0vjgVY9oO2hzKTIP-wW/view?usp=sharing',
  },
  certifications: [
    'Data Analytics — Google Cloud',
    'SQL (Advanced) — HackerRank',
    'Cybersecurity — Cisco',
  ],
};

/**
 * The K-01. Its components are the site's navigation model: each part of the
 * car maps to a discipline, and clicking it goes where that work lives.
 */
export const carComponents: CarComponent[] = [
  {
    id: 'power-unit',
    label: 'Power Unit',
    discipline: 'AI / ML',
    description:
      'Retrieval, uncertainty, learned control. The models that do the work — and the measurements that say whether they did.',
    href: '/garage?component=power-unit',
  },
  {
    id: 'aerodynamics',
    label: 'Aerodynamics',
    discipline: 'Software Engineering',
    description:
      'Full-stack systems that ship. React and Node front to back, packaged for web and native.',
    href: '/garage?component=aerodynamics',
  },
  {
    id: 'telemetry',
    label: 'Telemetry',
    discipline: 'Data & Detection',
    description:
      'Instrumenting a running system and reading what it tells you. Drift scoring, baselines, alert bands.',
    href: '/garage?component=telemetry',
  },
  {
    id: 'control-system',
    label: 'Control System',
    discipline: 'Robotics & Scheduling',
    description:
      'Inverse kinematics, gait, edge schedulers. Deciding what actuates, when, and at what cost.',
    href: '/garage?component=control-system',
  },
  {
    id: 'research-division',
    label: 'Research Division',
    discipline: 'Academic Research',
    description:
      'Published and submitted work. Question, baseline, method, result — in that order.',
    href: '/research',
  },
  {
    id: 'bodywork',
    label: 'Bodywork',
    discipline: 'Off Track',
    description: 'Everything that is not engineering.',
    href: '/off-track',
  },
];

/**
 * The Race Archive. Rounds are thematic, not calendar quarters — each one is
 * the period where a capability was actually built.
 */
export const timeline: TimelineRound[] = [
  {
    round: 'ROUND 01',
    label: 'Foundations',
    period: '2025',
    summary: 'Learning the machinery by refusing to import it.',
    entries: [
      {
        title: 'Digits from scratch',
        detail:
          'A 784 → 128 → 10 network in pure Python. No NumPy, no TensorFlow, no PyTorch — matrix operations and backpropagation written by hand. 95–97% on MNIST.',
      },
    ],
  },
  {
    round: 'ROUND 02',
    label: 'AI / ML',
    period: '2025',
    summary: 'Applying models to domains where the domain pushes back.',
    entries: [
      {
        title: 'Alloy phase prediction',
        detail:
          'Neural networks, XGBoost, Random Forest and SVM over thermodynamic features — valence electron concentration, mixing entropy and enthalpy, atomic size difference.',
      },
      {
        title: 'TrafficFlow AI',
        detail:
          'LSTM, LightGBM and Random Forest under a fuzzy logic layer, because a recommendation city operators cannot explain is a recommendation they will not deploy.',
      },
      {
        title: 'MCDIP-ADMM',
        detail:
          'Unsupervised low-dose CT reconstruction. Learning that Deep Image Prior degrades while its loss improves, and that ensembles plus adaptive stopping are the answer.',
      },
    ],
  },
  {
    round: 'ROUND 03',
    label: 'Robotics',
    period: '2025 — 2026',
    summary: 'Where the model meets hardware that does not care about your assumptions.',
    entries: [
      {
        title: 'AntBot',
        detail:
          'A 21-DOF hexapod from a single Arduino Mega 2560. Closed-form geometric IK, tripod gait validated in MATLAB, 18° inclines, power-isolated rails. Published by IEEE.',
      },
    ],
  },
  {
    round: 'ROUND 04',
    label: 'Systems & Edge',
    period: '2025',
    summary: 'Allocating scarce resources under constraints that conflict.',
    entries: [
      {
        title: 'AI-DWECS',
        detail:
          'Q-learning over an EDF base policy for 5G mobile edge computing, learning the weighting between deadline satisfaction and energy consumption instead of fixing it.',
      },
      {
        title: 'Kerala Metro scheduling',
        detail:
          'Graph algorithms and scheduling for control-centre operations — routing, interchanges, station congestion.',
      },
    ],
  },
  {
    round: 'ROUND 05',
    label: 'Security',
    period: '2025 — 2026',
    summary: 'Assuming an adversary, and measuring what actually stops them.',
    entries: [
      {
        title: 'WDS-IDS',
        detail:
          'Abandoning payload inspection for OS-level behavioural drift. 100% recall, zero missed attacks across 24,990 records, ROC-AUC 1.0.',
      },
      {
        title: 'SVD genomic steganography',
        detail:
          'AES-256-GCM encryption before QIM embedding into low-energy singular values, preserving biological integrity of the host sequence.',
      },
      {
        title: 'NAT',
        detail: 'Neural Analysis Terminal — AI-native cybersecurity intelligence for the web.',
      },
    ],
  },
  {
    round: 'ROUND 06',
    label: 'Product',
    period: '2026',
    summary: 'Shipping to real users on real devices.',
    entries: [
      {
        title: 'ABiZ',
        detail:
          'Business intelligence across web and Android from one codebase — React 18, Node, Firebase, Gemini validation over a 10+ source RSS pipeline, wrapped with Capacitor.',
      },
      {
        title: 'Futures trading bot',
        detail:
          'Binance Futures testnet CLI with MARKET, LIMIT and STOP_MARKET orders, validation, logging and a guided interactive mode.',
      },
    ],
  },
  {
    round: 'CURRENT ROUND',
    label: 'Research',
    period: '2026',
    summary: 'Asking what a retrieval system knows, and what it can be made to obey.',
    entries: [
      {
        title: 'SciRAG-UQ',
        detail:
          'Uncertainty-aware RAG that abstains. Three signals from different pipeline stages fused into a cascaded abstention policy. Submitted to BDA 2026.',
      },
      {
        title: 'Sec-RAG',
        detail:
          'Four near-disjoint defense layers for agentic RAG. 90.5% detection at 11.9% FPR; tool-attack success driven from 100% to 0%.',
      },
    ],
  },
];

/**
 * Skill graph. Edges are dependencies, not categories — a node's parents are
 * what it is built on. Every node lists the projects it was actually used in.
 */
export const skillGraph: SkillNode[] = [
  {
    id: 'ai',
    label: 'Artificial Intelligence',
    parents: [],
    projects: [],
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    parents: ['ai'],
    projects: ['alloy-phase-ml', 'trafficflow-ai'],
    tools: ['scikit-learn', 'XGBoost', 'LightGBM', 'Random Forest', 'SVM'],
  },
  {
    id: 'deep-learning',
    label: 'Deep Learning',
    parents: ['ai'],
    projects: ['digit-recognition', 'mcdip-admm', 'trafficflow-ai'],
    tools: ['PyTorch', 'TensorFlow', 'NumPy'],
  },
  {
    id: 'rl',
    label: 'Reinforcement Learning',
    parents: ['ml'],
    projects: ['ai-dwecs'],
    tools: ['Q-Learning'],
  },
  {
    id: 'sequence-models',
    label: 'Sequence Models',
    parents: ['deep-learning'],
    projects: ['trafficflow-ai'],
    tools: ['LSTM'],
  },
  {
    id: 'inverse-problems',
    label: 'Inverse Problems',
    parents: ['deep-learning'],
    projects: ['mcdip-admm'],
    tools: ['ADMM', 'Deep Image Prior', 'Radon transform'],
  },
  {
    id: 'retrieval',
    label: 'Retrieval',
    parents: ['ai'],
    projects: ['scirag-uq', 'sec-rag'],
    tools: ['ChromaDB', 'BM25', 'HNSW', 'MMR'],
  },
  {
    id: 'rag',
    label: 'RAG Systems',
    parents: ['retrieval', 'deep-learning'],
    projects: ['scirag-uq', 'sec-rag'],
    tools: ['Llama 3.1', 'Groq', 'FastAPI'],
  },
  {
    id: 'uncertainty',
    label: 'Uncertainty Quantification',
    parents: ['rag'],
    projects: ['scirag-uq'],
    tools: ['Generation entropy', 'Semantic consistency', 'Calibration'],
  },
  {
    id: 'ai-security',
    label: 'AI Security',
    parents: ['rag'],
    projects: ['sec-rag'],
    tools: ['InjecAgent', 'AgentDojo', 'Prompt injection defense'],
  },
  {
    id: 'anomaly',
    label: 'Anomaly Detection',
    parents: ['ml'],
    projects: ['wds-ids'],
    tools: ['Drift scoring', 'ROC analysis'],
  },
  {
    id: 'security',
    label: 'Security Engineering',
    parents: ['anomaly', 'ai-security'],
    projects: ['wds-ids', 'sec-rag', 'svd-genomic-steganography', 'nat'],
    tools: ['AES-256-GCM', 'Threat modelling'],
  },
  {
    id: 'control',
    label: 'Control Systems',
    parents: [],
    projects: ['antbot'],
    tools: ['Inverse kinematics', 'MATLAB', 'Gait planning'],
  },
  {
    id: 'robotics',
    label: 'Robotics',
    parents: ['control'],
    projects: ['antbot'],
    tools: ['Arduino', 'Servo control', 'Embedded C++'],
  },
  {
    id: 'systems',
    label: 'Distributed & Edge Systems',
    parents: ['rl'],
    projects: ['ai-dwecs', 'kerala-metro', 'wds-ids'],
    tools: ['Edge simulation', 'Graph algorithms', 'Raspberry Pi'],
  },
  {
    id: 'software',
    label: 'Software Engineering',
    parents: [],
    projects: ['abiz', 'nat', 'trading-bot'],
    tools: ['React', 'Node.js', 'Express', 'Firebase', 'Capacitor', 'Tailwind', 'Vite'],
  },
];

export const skillById = (id: string) => skillGraph.find((s) => s.id === id);
