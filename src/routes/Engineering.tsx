import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, PageHeader } from '@/components/ui';
import ContradictionLab from '@/components/labs/ContradictionLab';
import InstructionLab from '@/components/labs/InstructionLab';
import DriftLab from '@/components/labs/DriftLab';
import AbstentionLab from '@/components/labs/AbstentionLab';
import RoboticsBay from '@/components/labs/RoboticsBay';

interface Bay {
  id: string;
  code: string;
  name: string;
  system: string;
  projectId: string;
  premise: string;
  Component: () => React.JSX.Element;
}

const BAYS: Bay[] = [
  {
    id: 'contradiction',
    code: 'LAB 01',
    name: 'Contradiction Bay',
    system: 'Sec-RAG · Layer 1',
    projectId: 'sec-rag',
    premise:
      'A poisoned document asserts something the honest documents do not. Run NLI over every ordered pair and the asymmetry exposes it — the poison contradicts all of its peers, while an honest document contradicts only the poison.',
    Component: ContradictionLab,
  },
  {
    id: 'instruction',
    code: 'LAB 02',
    name: 'Instruction Bay',
    system: 'Sec-RAG · Layer 2',
    projectId: 'sec-rag',
    premise:
      'Flagging imperative mood flags the entire knowledge base. Six weighted structural features, one threshold, and a deliberate control set built to prove the difference between instructing a user and instructing the agent reading the document.',
    Component: InstructionLab,
  },
  {
    id: 'drift',
    code: 'LAB 03',
    name: 'Drift Bay',
    system: 'WDS-IDS',
    projectId: 'wds-ids',
    premise:
      'Attackers control the payload. They do not control what their work does to the operating system. Score live telemetry against a learned baseline and band the result.',
    Component: DriftLab,
  },
  {
    id: 'abstention',
    code: 'LAB 04',
    name: 'Abstention Bay',
    system: 'SciRAG-UQ',
    projectId: 'scirag-uq',
    premise:
      'Three uncertainty signals drawn from three different pipeline stages, fused into one composite score that decides whether to answer at all.',
    Component: AbstentionLab,
  },
  {
    id: 'robotics',
    code: 'LAB 05',
    name: 'Simulation Bay',
    system: 'AntBot',
    projectId: 'antbot',
    premise:
      'A closed-form geometric IK solution for a 3-DOF leg — no iterative solver, because the controller driving all 21 servos cannot afford one mid-stride.',
    Component: RoboticsBay,
  },
];

export default function Engineering() {
  const [open, setOpen] = useState(BAYS[0].id);
  const bay = BAYS.find((b) => b.id === open)!;
  const { Component } = bay;

  return (
    <>
      <PageHeader
        code="ENGINEERING"
        title="Interactive Labs"
        lede="Five working exhibits. Where a system publishes its formula and threshold, the lab computes with them — the contradiction mass, the directive score and the leg kinematics on this page are the real solutions, not animations of them. Where a value is not published, the lab says so instead of inventing one."
        meta={
          <dl className="flex gap-8 lg:justify-end">
            <div>
              <dt className="label-tech-sm mb-2">Bays</dt>
              <dd className="mono text-[1.5rem] leading-none text-accent">{BAYS.length}</dd>
            </div>
          </dl>
        }
      />

      {/* bay selector */}
      <div className="sticky top-14 z-40 border-b border-line bg-page/90 backdrop-blur-xl lg:top-0">
        <Container className="flex gap-1 overflow-x-auto py-3">
          {BAYS.map((b) => (
            <button
              key={b.id}
              onClick={() => setOpen(b.id)}
              className={`label-tech shrink-0 border px-3 py-2 transition-colors ${
                open === b.id
                  ? 'border-accent bg-accent text-page'
                  : 'border-line text-muted hover:text-ink'
              }`}
            >
              <span className="mr-2 opacity-60">{b.code}</span>
              {b.name}
            </button>
          ))}
        </Container>
      </div>

      <section className="py-12 md:py-16">
        <Container>
          <header className="mb-10 max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <span className="label-tech text-accent">{bay.code}</span>
              <span className="label-tech-sm">{bay.system}</span>
              <Link to={`/garage/${bay.projectId}`} className="link-tech">
                Engineering report →
              </Link>
            </div>
            <h2 className="display-md">{bay.name}</h2>
            <p className="body-lead mt-5">{bay.premise}</p>
          </header>

          <Component />
        </Container>
      </section>
    </>
  );
}
