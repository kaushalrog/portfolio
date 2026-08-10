import type { Project } from './types';

/**
 * The Garage.
 *
 * Every spec, metric and number below is transcribed from the project's own
 * README, its published paper, or the GitHub API. Where a project has not
 * measured something, the field is absent rather than estimated.
 */
export const projects: Project[] = [
  /* ══════════════════════════════ FEATURED ══════════════════════════════ */

  {
    code: 'K-01',
    id: 'antbot',
    name: 'AntBot',
    subtitle: 'Accessible Hexapod Platform for Surveillance',
    tier: 'featured',
    discipline: 'robotics',
    status: 'published',
    year: '2026',
    component: 'control-system',
    blurb:
      'A 21-DOF hexapod driven entirely by one Arduino Mega 2560 — no external PWM drivers. IEEE published.',
    stack: ['Arduino Mega 2560', 'C/C++', 'MATLAB', 'Geometric IK', 'HC-05 Bluetooth'],
    specs: [
      { key: 'Class', value: 'Robotics / Embedded' },
      { key: 'Status', value: 'IEEE Published' },
      { key: 'Year', value: '2026' },
      { key: 'Degrees of freedom', value: '21 (18 locomotion + 3 scanning)' },
      { key: 'Controller', value: 'Arduino Mega 2560 — single, no PWM driver' },
      { key: 'Leg servos', value: '20× MG996R + 1× MG995 (metal gear)' },
      { key: 'Auxiliary servo', value: '1× SG90 (face)' },
      { key: 'Chassis', value: '5 mm laser-cut acrylic' },
      { key: 'Leg chain', value: '3-DOF serial — Coxa → Femur → Tibia' },
      { key: 'Power', value: '11.1 V 1800 mAh LiPo, DC-DC buck to 5 V logic rail' },
      { key: 'Teleoperation', value: 'HC-05 Bluetooth SPP' },
      { key: 'Gait', value: 'Statically stable alternating tripod' },
    ],
    metrics: [
      { label: 'Incline traversed', value: '18°', note: 'body held level on ramp' },
      { label: 'Degrees of freedom', value: '21' },
      { label: 'Controllers', value: '1', note: 'drives all servos directly' },
    ],
    report: [
      {
        heading: 'Problem',
        body: 'Commercial hexapod research platforms are priced out of undergraduate labs. The architectures that make them expensive — distributed servo controllers, dedicated PWM driver boards, industrial actuators — are also what makes them hard to replicate. The question was whether stable, adaptive hexapod locomotion is reachable without any of that.',
      },
      {
        heading: 'Architecture',
        body: 'Central chassis plus six identical legs, each a 3-DOF serial kinematic chain (coxa, femur, tibia) cut from 5 mm acrylic. A single Arduino Mega 2560 drives all 21 servos directly off its timers rather than delegating to external PWM drivers. Logic and motor power are isolated across separate rails through a DC-DC buck converter, which is what keeps servo inrush from browning out the microcontroller.',
      },
      {
        heading: 'Implementation',
        body: 'Foot-tip targets are solved geometrically rather than iteratively: θ₁ (coxa) is atan2(y, x); θ₂ (femur) combines the elevation angle with a Law of Cosines term; θ₃ (tibia) is a Law of Cosines solution plus a 90° servo mounting offset. Closed form means no solver on the microcontroller and no convergence failures mid-stride. The tripod gait was validated in MATLAB before it ever ran on hardware.',
      },
      {
        heading: 'Challenges',
        body: 'Driving 21 high-torque servos from one board is a power problem long before it is a control problem. Obstacle response also had to work without a range sensor — the robot reads servo load feedback and reacts to it, which is a closed loop built out of hardware that was already on the robot for another reason.',
      },
      {
        heading: 'Result',
        body: 'The platform negotiates obstacles reactively, holds a level body orientation across 18° inclines, and is teleoperated over Bluetooth from a phone. The design and its experimental validation were published by IEEE.',
      },
    ],
    links: {
      repo: 'https://github.com/kaushalrog/ANTBOT---The-Hexapod-Robot',
      paper: 'https://ieeexplore.ieee.org/abstract/document/11426098',
    },
    // public/images/antbot-vs-commercial.jpg is also in the repo but its comic
    // treatment fights the design system; re-add it here to bring it back.
    images: [
      {
        src: 'images/antbot-cad-render.png',
        alt: 'CAD render of the AntBot chassis showing the six 3-DOF leg assemblies',
        caption: 'Chassis and leg assemblies — six identical 3-DOF serial chains',
      },
    ],
    keywords: [
      'hexapod',
      'robotics',
      'inverse kinematics',
      'arduino',
      'servo',
      'gait',
      'matlab',
      'ieee',
      'embedded',
      'surveillance',
      'tripod gait',
      'bluetooth',
    ],
  },

  {
    code: 'K-02',
    id: 'sec-rag',
    name: 'Sec-RAG',
    subtitle: 'Multi-Layer Defense for Agentic RAG Systems',
    tier: 'featured',
    discipline: 'security',
    status: 'active',
    year: '2026',
    component: 'power-unit',
    blurb:
      'A RAG system cannot tell retrieved data from instructions. Four near-disjoint defense layers that measure exactly what each one is worth.',
    stack: ['Python', 'InjecAgent', 'AgentDojo', 'LLM judge', 'Retrieval pipelines'],
    specs: [
      { key: 'Class', value: 'AI Security / Research' },
      { key: 'Status', value: 'Paper companion codebase' },
      { key: 'Year', value: '2026' },
      { key: 'Corpus', value: '548 cases' },
      { key: 'Benchmarks', value: 'InjecAgent, AgentDojo' },
      { key: 'Layers', value: '4 independent defenses + secure context constructor' },
      { key: 'Layer overlap', value: 'Jaccard 0.374 — near-disjoint' },
    ],
    metrics: [
      { label: 'Detection (L1+L2)', value: '90.5%', note: 'at 11.9% false-positive rate' },
      { label: 'ROC-AUC', value: '0.95' },
      { label: 'Keyword baseline', value: '26.4%' },
      { label: 'Perplexity baseline', value: '1.2%' },
      { label: 'Tool-attack success', value: '100% → 0%', note: 'Layer 3' },
      { label: 'Reasoning-hijack recall', value: '87.5%', note: 'Layer 4, at 0% FPR' },
    ],
    report: [
      {
        heading: 'Problem',
        body: 'A retrieval-augmented system has no mechanism to distinguish retrieved data from instructions. Anyone who can place a document into the corpus can write text the model will obey. Once that system can also call tools, the consequence stops being a bad answer and becomes an action: mail sent, access granted, funds moved.',
      },
      {
        heading: 'Architecture',
        body: 'Four independent defense layers, each aimed at a different attack class, plus a secure context constructor that determines how retrieved material is presented to the model in the first place. The layers are deliberately not variations of one classifier.',
      },
      {
        heading: 'Implementation',
        body: 'A 548-case corpus was built spanning the attack taxonomy, with InjecAgent and AgentDojo pulled in as external benchmarks so the numbers are comparable to published work rather than self-defined. Every layer is measured alone and in combination, against a keyword baseline and a perplexity baseline.',
      },
      {
        heading: 'Result',
        body: 'Layers 1+2 detect 90.5% of malicious documents at an 11.9% false-positive rate (AUC 0.95), against 26.4% for the keyword baseline and 1.2% for perplexity. Layer 3 drives tool-attack success from 100% to 0%. Layer 4 catches reasoning-chain hijacking at 87.5% recall with no false positives.',
      },
      {
        heading: 'Lessons',
        body: 'The headline number is not the interesting one. Layer 2 scores exactly 0.0% on misinformation and 100% on tool attacks, and Layer 1 is the only layer that covers misinformation at all. Measured overlap between layers is Jaccard 0.374. That near-disjointness is the actual empirical argument for defense-in-depth over one larger, better classifier — a single model cannot be simultaneously tuned for attack classes that share no surface features.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/Sec-Rag', repoPrivate: true },
    keywords: [
      'rag',
      'security',
      'prompt injection',
      'agentic',
      'defense in depth',
      'llm',
      'tool use',
      'adversarial',
      'injecagent',
      'agentdojo',
      'ai safety',
      'poisoning',
    ],
  },

  {
    code: 'K-03',
    id: 'scirag-uq',
    name: 'SciRAG-UQ',
    subtitle: 'Uncertainty-Aware Multi-Source Retrieval for Scientific Synthesis',
    tier: 'featured',
    discipline: 'ai-systems',
    status: 'active',
    year: '2026',
    component: 'power-unit',
    blurb:
      'A RAG system that knows when to abstain. Three uncertainty signals fused into a cascaded abstention policy.',
    stack: ['Python 3.11', 'FastAPI', 'ChromaDB', 'Groq / Llama 3.1 70B', 'BM25', 'HNSW'],
    specs: [
      { key: 'Class', value: 'AI Systems / Research' },
      { key: 'Status', value: 'Submitted — BDA 2026' },
      { key: 'Venue', value: '14th Intl. Big Data & AI Conference, BITS Pilani Goa' },
      { key: 'Dates', value: 'September 17–20, 2026' },
      { key: 'Retrieval', value: 'Hybrid — dense HNSW + BM25 + MMR' },
      { key: 'Generation', value: 'Llama 3.1 70B via Groq' },
      { key: 'Vector store', value: 'ChromaDB' },
      { key: 'Benchmark', value: 'BDA-Sci — 500 questions' },
      { key: 'License', value: 'MIT' },
    ],
    metrics: [
      { label: 'Faithfulness', value: '0.847', note: '+6.8% vs Self-RAG' },
      { label: 'Hallucination rate', value: '0.209', note: '−38.7% vs vanilla RAG' },
      { label: 'Abstention precision', value: '0.912' },
      { label: 'Expected calibration error', value: '0.043' },
    ],
    report: [
      {
        heading: 'Problem',
        body: 'Standard RAG generates an answer regardless of whether the retrieved evidence supports one. On scientific literature that failure mode is expensive: a confident synthesis of thin evidence reads exactly like a confident synthesis of strong evidence.',
      },
      {
        heading: 'Architecture',
        body: 'A hybrid retriever (dense HNSW + BM25, diversified with MMR) feeds generation, and three complementary uncertainty signals are computed alongside it — retrieval confidence from the retrieval stage, generation entropy from the decoder, and semantic consistency across samples. These fuse into one composite score that drives a cascaded abstention policy, and the answer is returned with a confidence badge attached.',
      },
      {
        heading: 'Implementation',
        body: 'Built as a production-shaped service rather than a notebook: FastAPI in front, ChromaDB for vectors, Groq-hosted Llama 3.1 70B for generation. Evaluated on BDA-Sci, a 500-question benchmark, against Self-RAG and vanilla RAG baselines.',
      },
      {
        heading: 'Result',
        body: 'Faithfulness 0.847 (+6.8% over Self-RAG) with hallucination rate down to 0.209 (−38.7% against vanilla RAG). Abstention precision of 0.912 means the system is right about not answering far more often than not, and an expected calibration error of 0.043 means the confidence it reports is close to the confidence it has earned.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/scirag-uq' },
    keywords: [
      'rag',
      'retrieval',
      'uncertainty',
      'abstention',
      'calibration',
      'hallucination',
      'llm',
      'chromadb',
      'fastapi',
      'groq',
      'llama',
      'bm25',
      'hnsw',
      'mmr',
      'scientific literature',
    ],
  },

  {
    code: 'K-04',
    id: 'wds-ids',
    name: 'WDS-IDS',
    subtitle: 'OS-Level Behavioural Intrusion Detection',
    tier: 'featured',
    discipline: 'security',
    status: 'complete',
    year: '2026',
    component: 'telemetry',
    blurb:
      'Attackers can obfuscate payloads. They cannot hide what they do to the operating system. Zero missed attacks across 24,990 records.',
    stack: ['Python', 'Flask', 'scikit-learn', 'Ubuntu', 'Raspberry Pi 5'],
    specs: [
      { key: 'Class', value: 'Security / Systems' },
      { key: 'Status', value: 'Complete — January 2026' },
      { key: 'Dataset', value: '24,990 records, 4 temporal phases' },
      { key: 'Analyzers', value: '3 independent' },
      { key: 'Signals', value: 'CPU · Memory · I/O · Syscalls' },
      { key: 'Method', value: 'Drift score against learned baseline' },
      { key: 'Alert bands', value: '<0.40 normal · 0.40–0.45 warn · ≥0.45 alert · ≥0.60 critical' },
      { key: 'Deployment', value: 'Raspberry Pi 5' },
    ],
    metrics: [
      { label: 'Recall (TPR)', value: '100.00%', note: 'zero missed attacks, all phases' },
      { label: 'ROC-AUC', value: '1.0000' },
      { label: 'Balanced accuracy', value: '91.68%' },
      { label: 'Overall accuracy', value: '85.03%', note: '±0.44%' },
      { label: 'Specificity (TNR)', value: '83.35%' },
      { label: 'F2 score', value: '77.06%', note: 'recall-weighted' },
      { label: 'Matthews CC', value: '0.5787' },
      { label: "Cohen's D", value: '3.44' },
      { label: 'KS statistic', value: '1.00', note: 'p < 0.001 — zero distribution overlap' },
      { label: 'False alarm rate', value: '~11.5%' },
    ],
    report: [
      {
        heading: 'Problem',
        body: 'Every conventional IDS asks the same question: does this request look malicious? That question is answerable by the attacker, because the attacker controls the payload. Encoding, obfuscation and novel signatures all defeat it.',
      },
      {
        heading: 'What changed',
        body: 'The system asks something the attacker does not control: is the operating system behaving normally? A brute-force campaign spikes CPU. SQL injection shifts memory patterns. Scrapers change I/O. These are unavoidable physical side effects of the work being done, and they occur no matter how the HTTP payload is dressed up.',
      },
      {
        heading: 'Architecture',
        body: 'A Flask web server generates real OS-level activity. A telemetry collector samples CPU, memory, I/O and syscalls. A drift detector scores live telemetry against a learned normal baseline and emits a graded alert — normal, warning, alert, critical. No signatures, no payload inspection.',
      },
      {
        heading: 'Result',
        body: 'Across 24,990 records and three independent analyzers: 100% recall with zero missed attacks in every one of four temporal phases, ROC-AUC of 1.0, balanced accuracy 91.68%. The confusion matrix has a literal zero in the false-negative cell — 2,514 attacks, none missed. A Kolmogorov-Smirnov statistic of 1.00 confirms normal and attack behaviour distributions have no overlap at all.',
      },
      {
        heading: 'Lessons',
        body: 'Five independent threshold optimisation strategies — F1, Youden index, balanced accuracy, cost-sensitive, and ROC-optimal — all converged on 0.45. When five methods with different loss assumptions agree on a value, that value is a property of the data rather than of the method. The cost is a ~11.5% false alarm rate, roughly one alert in nine, which is the correct trade for a security system where a miss is unrecoverable and a false alarm is an inconvenience.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/ids---System' },
    keywords: [
      'intrusion detection',
      'ids',
      'security',
      'anomaly detection',
      'drift',
      'telemetry',
      'syscalls',
      'flask',
      'raspberry pi',
      'edge',
      'behavioural',
      'roc',
      'scikit-learn',
    ],
  },

  /* ═══════════════════════════ ENGINEERING ═══════════════════════════ */

  {
    code: 'K-05',
    id: 'trafficflow-ai',
    name: 'TrafficFlow AI',
    subtitle: 'Hybrid Fuzzy-AI Traffic Control',
    tier: 'engineering',
    discipline: 'ai-ml',
    status: 'complete',
    year: '2025',
    component: 'power-unit',
    blurb:
      'City planners reject black boxes. LSTM and LightGBM for prediction, fuzzy logic for rules a human can audit.',
    stack: ['Python', 'LSTM', 'LightGBM', 'Random Forest', 'Fuzzy Logic', 'Graph Theory'],
    specs: [
      { key: 'Class', value: 'AI / ML' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Models', value: 'LSTM · SNN · Random Forest · LightGBM' },
      { key: 'Reasoning layer', value: 'Fuzzy logic — low / medium / high congestion' },
      { key: 'Modelling', value: 'Graph theory + queue-based traffic model' },
      { key: 'Outputs', value: 'Congestion level, volume, travel time index, CO₂' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Problem',
        body: 'A traffic control recommendation that cannot be explained will not be deployed. The people who operate signal timing are accountable for it, and a neural network output with no reasoning attached gives them nothing to stand behind.',
      },
      {
        heading: 'Architecture',
        body: 'A hybrid stack rather than one model: LSTM for temporal flow, LightGBM and Random Forest for tabular and event features, and a fuzzy logic layer on top that expresses decisions as human-readable rules — if congestion is HIGH, then extend green. Graph theory and queue-based modelling handle the network structure.',
      },
      {
        heading: 'Result',
        body: 'The platform predicts congestion level, traffic volume and travel time index, recommends adaptive signal timing and route optimisation, and estimates CO₂ emissions alongside the flow metrics — with every recommendation traceable to a rule an operator can read.',
      },
      {
        heading: 'Lessons',
        body: 'Interpretability was not a constraint bolted on at the end to satisfy a requirement; it changed the architecture. The fuzzy layer exists because the deployment context demanded auditability, and that pushed the neural components into a role where their outputs feed a rule system instead of driving actuation directly.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/TrafficFlowAI' },
    keywords: [
      'traffic',
      'lstm',
      'lightgbm',
      'random forest',
      'fuzzy logic',
      'smart city',
      'interpretability',
      'explainable ai',
      'graph theory',
      'co2',
      'congestion',
    ],
  },

  {
    code: 'K-06',
    id: 'ai-dwecs',
    name: 'AI-DWECS',
    subtitle: 'Q-Learning Task Scheduler for 5G Mobile Edge Computing',
    tier: 'engineering',
    discipline: 'systems',
    status: 'complete',
    year: '2025',
    component: 'control-system',
    blurb:
      'Deadline satisfaction and energy consumption pull in opposite directions. Q-learning picks the weighting, per workload.',
    stack: ['Python', 'Q-Learning', 'NumPy', 'Pandas', 'Edge simulation'],
    specs: [
      { key: 'Class', value: 'Systems / Reinforcement Learning' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Base algorithm', value: 'EDF (Earliest Deadline First) + cost optimisation' },
      { key: 'Learning', value: 'Lightweight Q-learning, edge-device suitable' },
      { key: 'Reward', value: 'Task completion − energy penalty' },
      { key: 'Servers', value: 'Heterogeneous — differing CPU and power' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Problem',
        body: 'Edge schedulers face a trade-off with no fixed correct answer: meeting deadlines burns energy, and conserving energy misses deadlines. A static weighting between the two is wrong as soon as the workload shifts.',
      },
      {
        heading: 'Architecture',
        body: 'Tasks are scheduled with Earliest Deadline First as the base policy. Q-learning sits above it and selects the weights applied to the time and energy terms of the cost function, with reward defined as task completion minus an energy penalty. The model is kept lightweight specifically so it can run on the edge devices it schedules for.',
      },
      {
        heading: 'Result',
        body: 'Improved adaptability over static scheduling algorithms under dynamic workloads across heterogeneous servers with differing CPU and power profiles.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/AIDWECS-Edge-Scheduler' },
    keywords: [
      'edge computing',
      'scheduling',
      'q-learning',
      'reinforcement learning',
      '5g',
      'mec',
      'energy',
      'edf',
      'deadline',
      'distributed',
    ],
  },

  {
    code: 'K-07',
    id: 'abiz',
    name: 'ABiZ',
    subtitle: 'Business Intelligence Platform',
    tier: 'engineering',
    discipline: 'software',
    status: 'deployed',
    year: '2026',
    component: 'aerodynamics',
    blurb:
      'Full-stack business intelligence — news aggregation, market data, AI validation — shipped to web and Android.',
    stack: [
      'React 18',
      'Vite',
      'Tailwind CSS',
      'Framer Motion',
      'Recharts',
      'Node.js',
      'Express',
      'Firebase',
      'Gemini',
      'Capacitor',
    ],
    specs: [
      { key: 'Class', value: 'Software / Full-stack' },
      { key: 'Status', value: 'Deployed' },
      { key: 'Year', value: '2026' },
      { key: 'Platform', value: 'Web + Android (Capacitor)' },
      { key: 'Frontend', value: 'React 18 + Vite, Tailwind, Framer Motion, Recharts' },
      { key: 'Backend', value: 'Node.js + Express, Firebase Admin' },
      { key: 'AI', value: 'Google Gemini — content validation and generation' },
      { key: 'Ingestion', value: 'RSS parser, 10+ sources' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Problem',
        body: 'Business intelligence tooling aimed at students and early-career professionals is either a news reader with no analysis or an enterprise product priced for enterprises. The gap is a product that aggregates real sources and adds structure without demanding a subscription.',
      },
      {
        heading: 'Architecture',
        body: 'React 18 on Vite for the client, Node and Express behind it, Firebase Admin for real-time data. An RSS ingestion layer pulls from 10+ business news sources, and Gemini handles content validation and generation over that feed. Capacitor wraps the same codebase into a native Android runtime.',
      },
      {
        heading: 'Implementation',
        body: 'Feature surface spans a daily briefing, market and index tracking, sustainability scoring, a video library, career resources, and AI-generated daily quizzes with points and leaderboards. The V1.2 pass reworked the interface around glassmorphism, a slate-and-coral palette, a redesigned mobile bottom navigation and iPhone X+ safe-area handling.',
      },
      {
        heading: 'Result',
        body: 'Deployed and running on both web and Android from one codebase.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/ABiz', repoPrivate: true },
    keywords: [
      'react',
      'node',
      'express',
      'firebase',
      'gemini',
      'capacitor',
      'tailwind',
      'recharts',
      'framer motion',
      'business intelligence',
      'rss',
      'android',
      'full-stack',
      'vite',
    ],
  },

  {
    code: 'K-08',
    id: 'mcdip-admm',
    name: 'MCDIP-ADMM',
    subtitle: 'Unsupervised Low-Dose CT Reconstruction',
    tier: 'engineering',
    discipline: 'ai-ml',
    status: 'complete',
    year: '2025',
    component: 'research-division',
    blurb:
      'Deep Image Prior needs no training data but overfits noise. An ensemble of priors under ADMM, with adaptive stopping.',
    stack: ['Python', 'PyTorch', 'ADMM', 'Deep Image Prior', 'Radon transform'],
    specs: [
      { key: 'Class', value: 'AI / Medical Imaging' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Formulation', value: 'Inverse problem — y = Ax + n' },
      { key: 'Method', value: 'ADMM + Multi-Code Deep Image Prior ensemble' },
      { key: 'Training data', value: 'None — fully unsupervised' },
      { key: 'Phantom', value: 'Shepp-Logan, Radon projection, Gaussian noise' },
      { key: 'Evaluation', value: 'PSNR · SSIM' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Problem',
        body: 'Low-dose CT reduces patient exposure at the cost of severe noise and reconstruction artifacts. Supervised denoisers need paired training data that is expensive and often unavailable. Deep Image Prior removes that requirement — the network structure itself acts as the regulariser — but it overfits the noise it is meant to remove if left to converge.',
      },
      {
        heading: 'Architecture',
        body: 'Reconstruction is posed as the inverse problem y = Ax + n and solved under ADMM, with a Multi-Code Deep Image Prior ensemble in the regularisation role. Averaging across several DIP networks stabilises the estimate, and an adaptive stopping strategy cuts the optimisation before it starts fitting noise.',
      },
      {
        heading: 'Challenges',
        body: 'The core difficulty with DIP is that the failure mode looks like progress — reconstruction quality improves, peaks, and then degrades while the loss keeps falling. The ensemble reduces the variance of that peak and the stopping criterion is what actually catches it.',
      },
      {
        heading: 'Result',
        body: 'Validated on synthetic data — Shepp-Logan phantom, Radon-transform projections, Gaussian noise simulating low-dose conditions — and measured with PSNR and SSIM. Fully unsupervised: no training dataset at any stage.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/mcdip-admm-ct-reconstruction' },
    keywords: [
      'ct',
      'medical imaging',
      'deep image prior',
      'admm',
      'unsupervised',
      'inverse problem',
      'radon',
      'psnr',
      'ssim',
      'reconstruction',
      'overfitting',
      'shepp-logan',
    ],
  },

  {
    code: 'K-09',
    id: 'svd-genomic-steganography',
    name: 'SVD Genomic Steganography',
    subtitle: 'Patient Data Concealed Inside Genomic Sequences',
    tier: 'engineering',
    discipline: 'security',
    status: 'complete',
    year: '2025',
    component: 'power-unit',
    blurb:
      'Hide encrypted patient records in the low-energy singular values of a genomic matrix, without disturbing the biology.',
    stack: ['Python', 'MATLAB', 'SVD', 'AES-256-GCM', 'QIM'],
    specs: [
      { key: 'Class', value: 'Security / Bioinformatics' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Transform', value: 'Singular Value Decomposition — A = U·Σ·Vᵀ' },
      { key: 'Embedding', value: 'Quantisation Index Modulation on singular values' },
      { key: 'Encryption', value: 'AES-256-GCM applied before embedding' },
      { key: 'Extraction', value: 'Blind — 32-bit length header' },
      { key: 'Implementations', value: 'Python + MATLAB' },
      { key: 'License', value: 'MIT' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Problem',
        body: 'Patient metadata attached to genomic data is sensitive in a way the sequence itself is not, and separating the two creates a linkage problem. Embedding it directly is only acceptable if the host sequence remains biologically intact.',
      },
      {
        heading: 'Architecture',
        body: 'SVD compacts energy: the dominant singular values of a genomic matrix carry the biological meaning, and the lower-energy values do not. Payload bits are encoded into the parity of the quantisation index of those lower singular values — σᵢ is nudged to the nearest value where ⌊σᵢ/Δ⌋ mod 2 equals the bit — and the matrix is reconstructed. Sequence topology is preserved within the quantisation tolerance.',
      },
      {
        heading: 'Implementation',
        body: 'Two security layers rather than one: AES-256-GCM encrypts the patient record before any embedding happens, so recovering the hidden bits is not the same as recovering the data. A 32-bit length header prepended to the payload makes extraction blind — no side-channel knowledge of payload size is needed.',
      },
      {
        heading: 'Result',
        body: 'QIM-encoded singular values survive mild noise, quantisation and compression, giving robustness alongside imperceptibility. Implemented in both Python and MATLAB, with single-matrix and block-SVD variants.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/svd-genomic-steganography' },
    keywords: [
      'steganography',
      'svd',
      'genomics',
      'aes',
      'encryption',
      'qim',
      'bioinformatics',
      'security',
      'matlab',
      'privacy',
      'patient data',
    ],
  },

  /* ═══════════════════════════ EXPERIMENTS ═══════════════════════════ */

  {
    code: 'K-10',
    id: 'alloy-phase-ml',
    name: 'Alloy Phase Prediction',
    subtitle: 'Structure–Property Correlation for Mechanical Design',
    tier: 'experiment',
    discipline: 'ai-ml',
    status: 'complete',
    year: '2025',
    component: 'research-division',
    blurb:
      'Predict alloy phase from composition and thermodynamics — VEC, mixing entropy, enthalpy, atomic size difference.',
    stack: ['Python', 'Neural Networks', 'XGBoost', 'Random Forest', 'SVM', 'scikit-learn'],
    specs: [
      { key: 'Class', value: 'AI / Materials' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Models', value: 'Neural Network · XGBoost · Random Forest · SVM' },
      {
        key: 'Features',
        value: 'Valence electron concentration, mixing entropy, mixing enthalpy, atomic size difference',
      },
      { key: 'Classes', value: 'FCC · BCC · Intermetallic · mixed phases' },
      { key: 'Analysis', value: 'Feature importance over physical parameters' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Problem',
        body: 'Phase structure determines an alloy’s strength, hardness and durability, and establishing it experimentally is slow and expensive — which makes exploring a composition space prohibitive.',
      },
      {
        heading: 'Implementation',
        body: 'Four model families compared on the same feature set: valence electron concentration, entropy and enthalpy of mixing, atomic size difference, and synthesis parameters. Feature importance analysis was run to identify which physical parameters actually carry the signal, rather than treating the model as a black box.',
      },
      {
        heading: 'Result',
        body: 'The neural network gave the best classification performance across FCC, BCC, intermetallic and mixed-phase categories.',
      },
    ],
    links: {
      repo: 'https://github.com/kaushalrog/-Machine-Learning-Driven-Structure-Property-Correlation-for-Mechanical-Design-of-Alloys',
    },
    keywords: [
      'materials',
      'alloys',
      'xgboost',
      'random forest',
      'svm',
      'neural network',
      'feature importance',
      'classification',
      'thermodynamics',
      'phase prediction',
    ],
  },

  {
    code: 'K-11',
    id: 'digit-recognition',
    name: 'Digits From Scratch',
    subtitle: 'MNIST Neural Network in Pure Python',
    tier: 'experiment',
    discipline: 'ai-ml',
    status: 'complete',
    year: '2025',
    component: 'power-unit',
    blurb:
      'No NumPy. No TensorFlow. No PyTorch. Matrix operations, forward and backward propagation, written by hand.',
    stack: ['Pure Python', 'matplotlib'],
    specs: [
      { key: 'Class', value: 'Fundamentals' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Architecture', value: 'Input 784 → Hidden 128 (ReLU) → Output 10 (Softmax)' },
      { key: 'Training', value: 'Mini-batch gradient descent' },
      { key: 'Dependencies', value: 'matplotlib only' },
      { key: 'Libraries used', value: 'None — no NumPy, TensorFlow or PyTorch' },
    ],
    metrics: [{ label: 'MNIST test accuracy', value: '95–97%' }],
    report: [
      {
        heading: 'Problem',
        body: 'Frameworks make it possible to train a network without understanding backpropagation. Removing them makes that impossible.',
      },
      {
        heading: 'Implementation',
        body: 'Matrix operations implemented from first principles, forward and backward propagation written by hand, mini-batch gradient descent over a 784 → 128 (ReLU) → 10 (Softmax) architecture. matplotlib is the only dependency, and it is only there to draw the results.',
      },
      {
        heading: 'Result',
        body: '95–97% test accuracy on MNIST.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/digitrecognition' },
    keywords: [
      'mnist',
      'neural network',
      'backpropagation',
      'from scratch',
      'pure python',
      'gradient descent',
      'relu',
      'softmax',
      'fundamentals',
    ],
  },

  /* ═════════════════════════════ BUILDS ═════════════════════════════ */

  {
    code: 'K-12',
    id: 'kerala-metro',
    name: 'Kerala Metro Scheduling',
    subtitle: 'Control-Centre Scheduling and Route Optimisation',
    tier: 'build',
    discipline: 'systems',
    status: 'complete',
    year: '2025',
    component: 'control-system',
    blurb:
      'Train scheduling, interchange handling and shortest-path routing for metro control-centre operators.',
    stack: ['Python', 'Graph algorithms', 'Scheduling', 'HTML'],
    specs: [
      { key: 'Class', value: 'Systems / Optimisation' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Methods', value: 'Graph algorithms + scheduling techniques' },
      { key: 'Scope', value: 'Timetabling, routing, interchange handling, congestion' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Problem',
        body: 'Metro operations trade off against each other — tightening headways reduces waiting time but concentrates station congestion, and route choices interact with interchange capacity.',
      },
      {
        heading: 'Implementation',
        body: 'Station-to-station route planning with shortest-path calculation and explicit interchange handling, layered under train schedule optimisation aimed at passenger waiting time and station congestion.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/kerala_metro_scheduling' },
    keywords: [
      'metro',
      'scheduling',
      'graph algorithms',
      'shortest path',
      'optimisation',
      'transportation',
      'routing',
    ],
  },

  {
    code: 'K-13',
    id: 'nat',
    name: 'NAT',
    subtitle: 'Neural Analysis Terminal',
    tier: 'build',
    discipline: 'security',
    status: 'active',
    year: '2026',
    component: 'aerodynamics',
    blurb: 'AI-native cybersecurity intelligence terminal for the web.',
    stack: ['JavaScript', 'Web'],
    specs: [
      { key: 'Class', value: 'Security / Web' },
      { key: 'Status', value: 'Active development' },
      { key: 'Version', value: '1.0.0' },
      { key: 'License', value: 'MIT' },
    ],
    metrics: [],
    report: [],
    links: { repo: 'https://github.com/kaushalrog/nat', repoPrivate: true },
    keywords: ['cybersecurity', 'terminal', 'threat intelligence', 'javascript', 'web', 'nat'],
  },

  {
    code: 'K-14',
    id: 'trading-bot',
    name: 'Futures Trading Bot',
    subtitle: 'Binance Futures Testnet CLI',
    tier: 'build',
    discipline: 'software',
    status: 'complete',
    year: '2025',
    component: 'aerodynamics',
    blurb:
      'MARKET, LIMIT and STOP_MARKET orders against the Binance Futures testnet, with a guided interactive mode.',
    stack: ['Python', 'argparse', 'rich', 'Binance API'],
    specs: [
      { key: 'Class', value: 'Software / CLI' },
      { key: 'Status', value: 'Complete' },
      { key: 'Year', value: '2025' },
      { key: 'Environment', value: 'Binance Futures Testnet — test funds only' },
      { key: 'Order types', value: 'MARKET · LIMIT · STOP_MARKET' },
      { key: 'Interface', value: 'argparse CLI + guided interactive mode (rich)' },
      { key: 'Operations', value: 'Input validation, file and console logging' },
    ],
    metrics: [],
    report: [
      {
        heading: 'Implementation',
        body: 'A CLI over the Binance Futures testnet supporting MARKET, LIMIT and STOP_MARKET orders on both sides, with comprehensive input validation, graceful error handling and dual file/console logging. The rich-powered interactive mode adds numbered menus and loading spinners for guided use.',
      },
    ],
    links: { repo: 'https://github.com/kaushalrog/trading_bot' },
    keywords: ['trading', 'binance', 'cli', 'python', 'argparse', 'rich', 'api', 'testnet'],
  },
];

/* ───────────────────────────── selectors ───────────────────────────── */

export const byTier = (tier: Project['tier']) => projects.filter((p) => p.tier === tier);

export const projectById = (id: string) => projects.find((p) => p.id === id);

export const byComponent = (component: Project['component']) =>
  projects.filter((p) => p.component === component);

export const tierLabels: Record<Project['tier'], { label: string; caption: string }> = {
  featured: { label: 'Featured Development', caption: 'The work the season is built on' },
  engineering: { label: 'Engineering Projects', caption: 'Shipped systems and studies' },
  experiment: { label: 'Experiments', caption: 'Where methods get tested' },
  build: { label: 'Builds', caption: 'Tools and smaller machines' },
};

export const disciplineLabels: Record<Project['discipline'], string> = {
  'ai-ml': 'AI / ML',
  'ai-systems': 'AI Systems',
  robotics: 'Robotics',
  security: 'Security',
  systems: 'Systems',
  software: 'Software',
  research: 'Research',
};
