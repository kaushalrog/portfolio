import type { Challenge, ResearchEntry } from './types';

/**
 * The Research Archive.
 *
 * Structured as research is structured — question, baseline, method, novelty,
 * experiment, result — rather than as another set of project cards.
 */
export const research: ResearchEntry[] = [
  {
    ref: 'R-001',
    id: 'antbot',
    title: 'Design and Experimental Validation of AntBot: An Accessible Hexapod Platform for Surveillance',
    shortTitle: 'AntBot',
    venue: 'IEEE',
    venueStatus: 'published',
    year: '2026',
    authors: 'Rishitha C, Divya Rithanya S, Karthikeya Y, Kaushal S, Akhil V.M — Amrita School of Artificial Intelligence, Amrita Vishwa Vidyapeetham, Coimbatore',
    question:
      'Can stable, adaptive hexapod locomotion be achieved without distributed servo controllers, external PWM driver boards, or industrial actuators?',
    baseline:
      'Commercial hexapod research platforms, whose cost is driven by exactly the hardware this design removes.',
    method:
      'Single Arduino Mega 2560 driving all 21 servos directly. Closed-form geometric inverse kinematics per 3-DOF leg. Statically stable alternating tripod gait. Power-isolated logic and motor rails through a DC-DC buck converter.',
    novelty:
      'The single-controller architecture. Removing the PWM driver layer is the cost reduction, and solving IK in closed form rather than iteratively is what makes that controller sufficient.',
    experiment:
      'MATLAB simulation of the tripod gait ahead of hardware, then physical validation: obstacle negotiation via servo load feedback, inclined-plane traversal, Bluetooth teleoperation.',
    result:
      'Level body orientation maintained across 18° ramps, reactive closed-loop obstacle negotiation without a dedicated range sensor, and full 21-DOF articulation from one microcontroller.',
    metrics: [
      { label: 'Degrees of freedom', value: '21' },
      { label: 'Incline traversed', value: '18°' },
      { label: 'Microcontrollers', value: '1' },
    ],
    links: {
      paper: 'https://ieeexplore.ieee.org/abstract/document/11426098',
      code: 'https://github.com/kaushalrog/ANTBOT---The-Hexapod-Robot',
    },
  },

  {
    ref: 'R-002',
    id: 'scirag-uq',
    title:
      'SciRAG-UQ: Uncertainty-Aware Multi-Source Retrieval-Augmented Generation for Scientific Literature Synthesis',
    shortTitle: 'SciRAG-UQ',
    venue: '14th International Big Data & AI Conference (BDA 2026), BITS Pilani KK Birla Goa Campus',
    venueStatus: 'submitted',
    year: '2026',
    question:
      'Can a retrieval-augmented system be made to recognise when its evidence does not support an answer, and abstain instead of generating one?',
    baseline: 'Vanilla RAG and Self-RAG, on the 500-question BDA-Sci benchmark.',
    method:
      'Three complementary uncertainty signals — retrieval confidence, generation entropy, semantic consistency — fused into a composite score that drives a cascaded abstention policy over a hybrid dense-HNSW + BM25 + MMR retriever.',
    novelty:
      'The signals are drawn from different stages of the pipeline, so they fail independently. Retrieval confidence knows nothing about the decoder; generation entropy knows nothing about the corpus. Fusing across stages is what makes the composite score informative rather than redundant.',
    experiment:
      '500 questions on BDA-Sci, measuring faithfulness, hallucination rate, abstention precision and expected calibration error against both baselines.',
    result:
      'Faithfulness 0.847 (+6.8% over Self-RAG), hallucination rate 0.209 (−38.7% against vanilla RAG), abstention precision 0.912, expected calibration error 0.043.',
    metrics: [
      { label: 'Faithfulness', value: '0.847', note: '+6.8% vs Self-RAG' },
      { label: 'Hallucination', value: '0.209', note: '−38.7% vs vanilla' },
      { label: 'Abstention precision', value: '0.912' },
      { label: 'ECE', value: '0.043' },
    ],
    links: { code: 'https://github.com/kaushalrog/scirag-uq' },
  },

  {
    ref: 'R-003',
    id: 'sec-rag',
    title:
      'A Multi-Layer Defense-in-Depth Framework for Securing Agentic RAG Systems Against Adversarial Manipulation',
    shortTitle: 'Agentic RAG Defense',
    venue: 'Paper companion codebase',
    venueStatus: 'in-progress',
    year: '2026',
    question:
      'A RAG system cannot distinguish retrieved data from instructions. When that system can also call tools, what is each individual defense layer actually worth?',
    baseline:
      'A keyword-matching detector (26.4% detection) and a perplexity-based detector (1.2% detection).',
    method:
      'Four independent defense layers targeting different attack classes, plus a secure context constructor governing how retrieved material is presented to the model. Each layer measured alone and in combination.',
    novelty:
      'Measuring layer disjointness rather than only aggregate performance. The layers are shown to be near-disjoint at Jaccard 0.374, which is the empirical argument for layering over a single larger classifier.',
    experiment:
      'A purpose-built 548-case corpus spanning the attack taxonomy, with InjecAgent and AgentDojo as external benchmarks.',
    result:
      'Layers 1+2 detect 90.5% of malicious documents at 11.9% FPR (AUC 0.95). Layer 3 reduces tool-attack success from 100% to 0%. Layer 4 detects reasoning-chain hijacking at 87.5% recall and 0% FPR. Layer 2 scores 0.0% on misinformation and 100% on tool attacks — Layer 1 is the only layer covering misinformation at all.',
    metrics: [
      { label: 'Detection (L1+L2)', value: '90.5%', note: 'at 11.9% FPR' },
      { label: 'ROC-AUC', value: '0.95' },
      { label: 'Tool attacks', value: '100% → 0%' },
      { label: 'Layer overlap', value: 'Jaccard 0.374' },
    ],
    links: { code: 'https://github.com/kaushalrog/Sec-Rag', codePrivate: true },
  },

  {
    ref: 'R-004',
    id: 'ai-dwecs',
    title: 'AI-DWECS: Lightweight Q-Learning Based Task Scheduler for 5G Mobile Edge Computing',
    shortTitle: 'AI-DWECS',
    venue: 'Project report and presentation',
    venueStatus: 'in-progress',
    year: '2025',
    question:
      'Can a scheduler learn the weighting between deadline satisfaction and energy consumption, instead of having it fixed in advance?',
    baseline: 'Static scheduling algorithms and conventional DWECS.',
    method:
      'Earliest Deadline First as the base policy, with Q-learning selecting the weights applied to the time and energy terms of the cost function. Reward is task completion minus an energy penalty.',
    novelty:
      'The learning model is deliberately lightweight enough to run on the edge devices it schedules for — the scheduler does not require the infrastructure it is allocating.',
    experiment: 'Edge computing simulation across heterogeneous servers with differing CPU and power profiles.',
    result: 'Improved adaptability over static scheduling under dynamic workloads.',
    metrics: [],
    links: { code: 'https://github.com/kaushalrog/AIDWECS-Edge-Scheduler' },
  },

  {
    ref: 'R-005',
    id: 'mcdip-admm',
    title: 'MCDIP-ADMM: Multi-Code Deep Image Prior Ensembles for Low-Dose CT Reconstruction',
    shortTitle: 'MCDIP-ADMM',
    venue: 'Experimental implementation',
    venueStatus: 'in-progress',
    year: '2025',
    question:
      'Deep Image Prior reconstructs without training data but overfits the noise it is meant to remove. Can an ensemble under ADMM stabilise it?',
    baseline: 'Single-network Deep Image Prior, and supervised denoisers requiring paired training data.',
    method:
      'CT reconstruction posed as the inverse problem y = Ax + n and solved under ADMM, with a Multi-Code DIP ensemble in the regularisation role and an adaptive stopping strategy.',
    novelty:
      'Ensemble averaging across multiple deep image priors reduces the variance of the quality peak, and the stopping criterion is what catches it — DIP degrades while its loss continues to fall, so loss alone cannot be the signal.',
    experiment:
      'Shepp-Logan phantom, Radon-transform projections, Gaussian noise simulating low-dose conditions. Evaluated on PSNR and SSIM.',
    result: 'Reduced overfitting and improved reconstruction stability, with no training dataset at any stage.',
    metrics: [],
    links: { code: 'https://github.com/kaushalrog/mcdip-admm-ct-reconstruction' },
  },
];

export const researchById = (id: string) => research.find((r) => r.id === id);

/**
 * Engineering challenges — the problems that did not go the first way.
 * Each one is drawn from a documented pivot in the project it belongs to.
 */
export const challenges: Challenge[] = [
  {
    ref: '01',
    title: 'Payload inspection could not survive obfuscation',
    project: 'WDS-IDS',
    projectId: 'wds-ids',
    problem:
      'An intrusion detector was needed that would hold up against attacks it had never seen a signature for.',
    attempt: 'A deep learning model trained on raw HTTP payload signatures.',
    failure:
      'It collapsed under real-world drift. The payload is the one part of the interaction the attacker fully controls, so obfuscation defeated the model as fast as it could be retrained.',
    solution:
      'Stop inspecting the payload. Monitor OS-level behavioural change instead — CPU, memory, I/O and syscall patterns — and score drift against a learned baseline.',
    result:
      '100% recall with zero missed attacks across 24,990 records and four temporal phases, ROC-AUC 1.0, and a KS statistic of 1.00 confirming the normal and attack distributions do not overlap.',
  },
  {
    ref: '02',
    title: 'The reconstruction got worse while the loss got better',
    project: 'MCDIP-ADMM',
    projectId: 'mcdip-admm',
    problem: 'Low-dose CT reconstruction without paired training data.',
    attempt: 'Deep Image Prior, run to convergence.',
    failure:
      'DIP overfits the noise. Reconstruction quality improves, peaks, then degrades — while the training loss keeps falling. The usual stopping signal points the wrong way.',
    solution:
      'A Multi-Code DIP ensemble under ADMM, averaging across priors to reduce the variance of that peak, plus an adaptive stopping strategy that catches it independently of loss.',
    result: 'Stabilised unsupervised reconstruction validated on PSNR and SSIM, with no training data.',
  },
  {
    ref: '03',
    title: 'The model was accurate and unusable',
    project: 'TrafficFlow AI',
    projectId: 'trafficflow-ai',
    problem: 'Predicting congestion and recommending signal timing for city traffic control.',
    attempt: 'Neural prediction driving the recommendation directly.',
    failure:
      'The people accountable for signal timing will not act on an output they cannot explain. Accuracy was not the blocker; auditability was.',
    solution:
      'Push the neural components behind a fuzzy logic layer that states decisions as readable rules — if congestion is HIGH, extend green — so every recommendation traces to something an operator can defend.',
    result:
      'A hybrid stack where LSTM, LightGBM and Random Forest feed a rule system rather than actuating on their own.',
  },
  {
    ref: '04',
    title: 'One microcontroller, twenty-one servos',
    project: 'AntBot',
    projectId: 'antbot',
    problem:
      'Driving a 21-DOF hexapod from a single Arduino Mega 2560, with no external PWM driver boards.',
    attempt: 'Direct servo control off the microcontroller with a shared power rail.',
    failure:
      'High-torque servo inrush is a power problem before it is a control problem — motor draw browns out the logic rail.',
    solution:
      'Isolate logic and motor power across separate rails through a DC-DC buck converter, and solve inverse kinematics in closed form — atan2 plus Law of Cosines — so the controller never runs an iterative solver mid-stride.',
    result: 'Full 21-DOF articulation and a statically stable tripod gait from one controller. IEEE published.',
  },
  {
    ref: '05',
    title: 'The system obeys anything it retrieves',
    project: 'Sec-RAG',
    projectId: 'sec-rag',
    problem:
      'A RAG system has no mechanism to separate retrieved data from instructions. With tool access, that becomes real-world action.',
    attempt: 'Single-classifier detection — keyword matching, then perplexity-based scoring.',
    failure:
      'Keyword matching reached 26.4% detection. Perplexity reached 1.2%. Neither generalises across attack classes that share no surface features.',
    solution:
      'Four independent layers, each aimed at a different attack class, with a secure context constructor governing presentation — and measurement of what each layer contributes alone.',
    result:
      '90.5% detection at 11.9% FPR, tool-attack success driven from 100% to 0%, and measured layer disjointness of Jaccard 0.374 that justifies the architecture.',
  },
];
