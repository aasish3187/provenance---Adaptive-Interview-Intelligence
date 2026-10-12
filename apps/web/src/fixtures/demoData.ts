/**
 * PROVENANCE SYNTHETIC DEMO FIXTURES
 * -------------------------------------------------------------
 * Isolated mock data for interface testing and visual verification.
 * In accordance with AGENTS.md and UI_DESIGN_SPEC.md:
 * - All names, companies, and interview data are strictly synthetic.
 * - Production API errors must never silently fall back to this data.
 */

export interface DemoEvidence {
  id: string;
  interviewId: string;
  turnIndex: number;
  questionText: string;
  candidateQuote: string;
  timestamp: string; // e.g. "04:12"
  speaker: string;
  competencyId: string;
  competencyName: string;
  priorEstimate: number;
  updatedEstimate: number;
  uncertainty: number;
  rubricCriteriaMet: string[];
  rubricCriteriaMissed: string[];
  plainRationale: string;
  precedingQuote?: string;
  followingQuote?: string;
}

export interface DemoInterview {
  id: string;
  candidateName: string;
  candidateRole: string;
  date: string;
  durationMinutes: number;
  status: 'In Progress' | 'Needs Review' | 'Completed';
  reviewPriority: 'None' | 'Low' | 'Moderate' | 'High';
  mustHaveCoverage: number; // percentage, e.g. 92
  evidenceCount: number;
  skillsDemonstrated: number;
  skillsPending: number;
  integrityNote?: string;
}

export interface DemoRole {
  id: string;
  title: string;
  department: string;
  activeInterviews: number;
  completedInterviews: number;
  mustHaveSkills: string[];
  createdDate: string;
}

export interface DemoAuditEvent {
  id: string;
  actor: string;
  action: string;
  objectType: string;
  objectId: string;
  timestamp: string;
  status: 'Recorded' | 'Verified' | 'Enforced';
  details: string;
}

export const DEMO_EVIDENCE: Record<string, DemoEvidence> = {
  E14: {
    id: 'E14',
    interviewId: 'INT-901',
    turnIndex: 4,
    questionText: 'How do you configure and tune pod autoscaling when traffic spikes are driven by asynchronous queue depth rather than raw CPU usage?',
    candidateQuote: 'When traffic spiked to 10x, our HPA scaled pods based on custom p99 message lag metrics from Prometheus rather than default CPU thresholds. We paired that with KEDA and pod disruption budgets so node scale-ups didn’t drop running batch tasks.',
    timestamp: '04:12',
    speaker: 'Alex Morgan',
    competencyId: 'COMP-K8S',
    competencyName: 'Kubernetes & Container Orchestration',
    priorEstimate: 0.52,
    updatedEstimate: 0.73,
    uncertainty: 0.16,
    rubricCriteriaMet: [
      'Identified custom metric exporter (Prometheus / KEDA) instead of default CPU/Memory',
      'Accounted for scale-down stabilization window and pod disruption budgets (PDB)',
      'Demonstrated concrete architecture rationale for event-driven autoscaling',
    ],
    rubricCriteriaMissed: [
      'Did not mention cluster-autoscaler overprovisioning or pre-warmed node groups',
    ],
    plainRationale: 'Demonstrated direct practical knowledge of event-driven Kubernetes autoscaling, moving competency estimate from 0.52 to 0.73 with high confidence.',
    precedingQuote: 'Interviewer: "Let’s look at your autoscaling claim on the resume..."',
    followingQuote: 'Interviewer: "How did that interact with your database connection pool limits?"',
  },
  E18: {
    id: 'E18',
    interviewId: 'INT-901',
    turnIndex: 8,
    questionText: 'Explain your strategy for managing concurrency control and avoiding channel deadlocks in high-throughput Go microservices.',
    candidateQuote: 'We used sync.Pool to minimize GC allocation pressure in the serialization path, and buffered channels with a select-default timeout pattern. We also ran goroutine leak detectors in our CI test harness.',
    timestamp: '08:45',
    speaker: 'Alex Morgan',
    competencyId: 'COMP-GO',
    competencyName: 'Go Concurrency & Memory Management',
    priorEstimate: 0.65,
    updatedEstimate: 0.84,
    uncertainty: 0.12,
    rubricCriteriaMet: [
      'Used sync.Pool appropriately for reducing allocator overhead',
      'Implemented non-blocking select with timeout or cancellation contexts',
      'Demonstrated test tooling for goroutine leak verification',
    ],
    rubricCriteriaMissed: [],
    plainRationale: 'Answer demonstrated senior-level grasp of Go runtime mechanics and defensible safety patterns under production load.',
  },
  E22: {
    id: 'E22',
    interviewId: 'INT-901',
    turnIndex: 11,
    questionText: 'How did you secure inter-service communication across your private multi-tenant clusters?',
    candidateQuote: 'We didn’t set up mutual TLS between internal pods because of latency concerns; we just assumed the VPC private network and network security groups were enough.',
    timestamp: '12:10',
    speaker: 'Alex Morgan',
    competencyId: 'COMP-SEC',
    competencyName: 'Zero-Trust Architecture & API Security',
    priorEstimate: 0.60,
    updatedEstimate: 0.38,
    uncertainty: 0.19,
    rubricCriteriaMet: [
      'Understood VPC perimeter boundaries',
    ],
    rubricCriteriaMissed: [
      'Failed to implement identity-based authentication (mTLS / SPIFFE)',
      'Ignored lateral movement risks within a compromised cluster namespace',
    ],
    plainRationale: 'Candidate relied on perimeter-only security without defense-in-depth or workload identity, reducing estimate to 0.38.',
  },
};

export const DEMO_INTERVIEWS: DemoInterview[] = [
  {
    id: 'INT-901',
    candidateName: 'Alex Morgan',
    candidateRole: 'Senior Backend Engineer',
    date: '2026-10-10',
    durationMinutes: 28,
    status: 'Needs Review',
    reviewPriority: 'Low',
    mustHaveCoverage: 94,
    evidenceCount: 14,
    skillsDemonstrated: 5,
    skillsPending: 1,
    integrityNote: '1 brief tab blur during technical question (benign note-taking pattern).',
  },
  {
    id: 'INT-902',
    candidateName: 'Jordan Lee',
    candidateRole: 'Cloud Platform Architect',
    date: '2026-10-10',
    durationMinutes: 32,
    status: 'Completed',
    reviewPriority: 'None',
    mustHaveCoverage: 100,
    evidenceCount: 18,
    skillsDemonstrated: 6,
    skillsPending: 0,
    integrityNote: 'Clean session. Zero anomalous browser events.',
  },
  {
    id: 'INT-903',
    candidateName: 'Taylor Reed',
    candidateRole: 'Distributed Systems Engineer',
    date: '2026-10-10',
    durationMinutes: 18,
    status: 'In Progress',
    reviewPriority: 'None',
    mustHaveCoverage: 65,
    evidenceCount: 7,
    skillsDemonstrated: 2,
    skillsPending: 3,
  },
  {
    id: 'INT-904',
    candidateName: 'Samira Chen',
    candidateRole: 'Senior Backend Engineer',
    date: '2026-10-09',
    durationMinutes: 30,
    status: 'Needs Review',
    reviewPriority: 'Moderate',
    mustHaveCoverage: 88,
    evidenceCount: 12,
    skillsDemonstrated: 4,
    skillsPending: 2,
    integrityNote: 'Paste event detected within 1.2s of question presentation. Review requested.',
  },
];

export const DEMO_ROLES: DemoRole[] = [
  {
    id: 'ROLE-01',
    title: 'Senior Distributed Systems Engineer',
    department: 'Core Infrastructure & Storage',
    activeInterviews: 3,
    completedInterviews: 12,
    mustHaveSkills: ['Raft/Paxos Consensus', 'LSM-Tree Storage Internals', 'CAP Partition Tolerance', 'Consistent Hashing'],
    createdDate: '2026-10-08',
  },
  {
    id: 'ROLE-02',
    title: 'Cloud Platform & SRE Architect',
    department: 'Platform Operations & Cloud',
    activeInterviews: 2,
    completedInterviews: 8,
    mustHaveSkills: ['Multi-Cloud VPC Routing', 'Terraform Drift Detection', 'SLO Error Budgets', 'Multi-Region DR'],
    createdDate: '2026-10-09',
  },
  {
    id: 'ROLE-03',
    title: 'Principal AI / ML Infrastructure Engineer',
    department: 'Foundation AI & Serving',
    activeInterviews: 4,
    completedInterviews: 11,
    mustHaveSkills: ['GPU Cluster & vLLM Serving', 'Distributed Sharding (DeepSpeed)', 'Vector DB & RAG', 'Inference Observability'],
    createdDate: '2026-10-10',
  },
  {
    id: 'ROLE-04',
    title: 'Staff Security & Cryptography Engineer',
    department: 'Information Security & Trust',
    activeInterviews: 1,
    completedInterviews: 6,
    mustHaveSkills: ['Zero-Trust Architecture', 'Cryptographic Protocol & KMS', 'Incident Response & SIEM', 'Supply Chain Security'],
    createdDate: '2026-10-10',
  },
  {
    id: 'ROLE-05',
    title: 'Fullstack Systems Architect',
    department: 'Product Systems & Web',
    activeInterviews: 2,
    completedInterviews: 9,
    mustHaveSkills: ['Next.js SSR & Edge Streaming', 'State Sync & Optimistic UI', 'Core Web Vitals Profiling', 'Contract Testing'],
    createdDate: '2026-10-11',
  },
  {
    id: 'ROLE-06',
    title: 'Lead Data Systems & Streaming Engineer',
    department: 'Data Platform & Analytics',
    activeInterviews: 2,
    completedInterviews: 7,
    mustHaveSkills: ['Distributed Stream Processing', 'Data Warehouse Modeling', 'Data Quality Contracts', 'Lakehouse Formats'],
    createdDate: '2026-10-11',
  },
];

export const DEMO_AUDIT_LOGS: DemoAuditEvent[] = [
  {
    id: 'AUD-501',
    actor: 'Candidate (Alex Morgan)',
    action: 'Consent Signed',
    objectType: 'ConsentRecord',
    objectId: 'INT-901',
    timestamp: '2026-10-10 14:02:11 UTC',
    status: 'Verified',
    details: 'Signed consent agreement version 1.0 (AI disclosure, text-mode rights, zero face data).',
  },
  {
    id: 'AUD-502',
    actor: 'Recruiter (Aasish)',
    action: 'Blueprint Modified',
    objectType: 'Blueprint',
    objectId: 'ROLE-01',
    timestamp: '2026-10-10 14:05:40 UTC',
    status: 'Recorded',
    details: 'Toggled "Zero-Trust Architecture" from optional to must-have competency.',
  },
  {
    id: 'AUD-503',
    actor: 'QuoteVerifier Engine',
    action: 'Evidence Quote Verified',
    objectType: 'EvidenceSpan',
    objectId: 'E14',
    timestamp: '2026-10-10 14:10:22 UTC',
    status: 'Enforced',
    details: 'Exact NFKC normalized substring match confirmed in canonical transcript turn 4.',
  },
  {
    id: 'AUD-504',
    actor: 'Integrity Tide Aggregator',
    action: 'Event Recorded',
    objectType: 'IntegrityEvent',
    objectId: 'INT-901-EV1',
    timestamp: '2026-10-10 14:14:02 UTC',
    status: 'Recorded',
    details: 'Window blur event (duration 3.4s). Severity 1. Emitted benign note-taking hypothesis.',
  },
  {
    id: 'AUD-505',
    actor: 'Dossier Synthesizer',
    action: 'Citation Verification',
    objectType: 'Dossier',
    objectId: 'DOS-901',
    timestamp: '2026-10-10 14:32:00 UTC',
    status: 'Verified',
    details: '14 of 14 evaluative sentences validated against verified evidence ledger IDs. Zero uncited sentences.',
  },
];
