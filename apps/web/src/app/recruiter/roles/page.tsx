'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Check, Edit2, Sliders, Clock, Target, FileText, ArrowRight, Play, Sparkles, X } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { DEMO_ROLES, DemoRole } from '@/fixtures/demoData';

export interface CompetencyItem {
  name: string;
  mustHave: boolean;
  importance: number;
  verificationMethod: string;
  estimatedMinutes: number;
  bloomTarget: number;
}

const PREBUILT_BLUEPRINTS: Record<string, CompetencyItem[]> = {
  'ROLE-01': [
    {
      name: 'Raft / Paxos Consensus & Leader Election',
      mustHave: true,
      importance: 0.95,
      verificationMethod: 'Term transitions, split-vote resolution, log compaction, snapshotting & cluster membership',
      estimatedMinutes: 9,
      bloomTarget: 5,
    },
    {
      name: 'Write-Ahead Logging & LSM-Tree Storage Internals',
      mustHave: true,
      importance: 0.90,
      verificationMethod: 'SSTable flush mechanisms, Bloom filter tuning, read amplification tradeoffs & compaction',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Partition Tolerance & CAP Theorem Tradeoffs',
      mustHave: true,
      importance: 0.85,
      verificationMethod: 'Split-brain mitigation, vector clocks, tunable consistency levels (R+W>N), quorum reads',
      estimatedMinutes: 7,
      bloomTarget: 4,
    },
    {
      name: 'Sharded Storage & Consistent Hashing',
      mustHave: false,
      importance: 0.75,
      verificationMethod: 'Virtual node distribution, rebalancing overhead, hotspot mitigation & boundary routing',
      estimatedMinutes: 6,
      bloomTarget: 4,
    },
  ],
  'ROLE-02': [
    {
      name: 'Multi-Cloud VPC & Transit Gateway Routing',
      mustHave: true,
      importance: 0.95,
      verificationMethod: 'Cross-cloud routing topologies, BGP peering, MTU optimization, egress firewalls & NAT gateways',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Terraform / IaC Drift Detection & State Locking',
      mustHave: true,
      importance: 0.90,
      verificationMethod: 'Remote state locking, module composition, CI plan gates, drift remediation & sentinel policies',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'SLO / SLI Error Budgets & Burn Rate Alerting',
      mustHave: true,
      importance: 0.90,
      verificationMethod: 'Multi-window multi-burn-rate alerting, error budget freeze policies, and latency degradation gates',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Multi-Region Disaster Recovery (RPO / RTO)',
      mustHave: false,
      importance: 0.80,
      verificationMethod: 'Active-active failover, asynchronous replication lag, DNS failover latency & chaos testing',
      estimatedMinutes: 7,
      bloomTarget: 5,
    },
  ],
  'ROLE-03': [
    {
      name: 'GPU Cluster Scheduling & vLLM / Triton Serving',
      mustHave: true,
      importance: 0.95,
      verificationMethod: 'PagedAttention memory allocation, continuous batching, tensor parallelism & KV cache sizing',
      estimatedMinutes: 8,
      bloomTarget: 5,
    },
    {
      name: 'Distributed Model Sharding (DeepSpeed / Megatron)',
      mustHave: true,
      importance: 0.92,
      verificationMethod: 'ZeRO-1/2/3 stages, pipeline vs tensor parallelism, NVLink bandwidth profiling & gradient all-reduce',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Vector Database Indexing & Low-Latency RAG',
      mustHave: true,
      importance: 0.88,
      verificationMethod: 'HNSW graph search vs IVF-PQ, quantization recall tradeoffs, hybrid sparse-dense ranking',
      estimatedMinutes: 7,
      bloomTarget: 4,
    },
    {
      name: 'Model Inference Observability & Token Metrics',
      mustHave: false,
      importance: 0.78,
      verificationMethod: 'TTFT (Time to First Token), inter-token latency, GPU utilization & memory fragmentation profiling',
      estimatedMinutes: 6,
      bloomTarget: 3,
    },
  ],
  'ROLE-04': [
    {
      name: 'Zero-Trust Architecture & Threat Modeling',
      mustHave: true,
      importance: 0.95,
      verificationMethod: 'STRIDE model analysis, micro-segmentation, identity-aware proxies & SPIFFE/SPIRE attestation',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Cryptographic Protocol Implementation & KMS',
      mustHave: true,
      importance: 0.90,
      verificationMethod: 'Envelope encryption, TLS 1.3 cipher negotiation, key rotation lifecycle & HSM integration',
      estimatedMinutes: 7,
      bloomTarget: 4,
    },
    {
      name: 'Incident Response & SIEM Alert Correlation',
      mustHave: true,
      importance: 0.85,
      verificationMethod: 'Automated playbook orchestration, forensic timeline reconstruction, log deduplication & MITRE ATT&CK',
      estimatedMinutes: 7,
      bloomTarget: 3,
    },
    {
      name: 'Supply Chain Security & SBOM Verification',
      mustHave: false,
      importance: 0.75,
      verificationMethod: 'Signed attestations, provenance verification (SLSA Level 3), vulnerability scanning & Sigstore',
      estimatedMinutes: 6,
      bloomTarget: 3,
    },
  ],
  'ROLE-05': [
    {
      name: 'Next.js SSR / ISR & Edge Streaming',
      mustHave: true,
      importance: 0.95,
      verificationMethod: 'React Server Components, Suspense streaming boundaries, edge caching invalidation & ISR revalidation',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'State Synchronization & Optimistic UI',
      mustHave: true,
      importance: 0.88,
      verificationMethod: 'WebSocket delta reconciliation, CRDTs, optimistic rollback strategies & local cache consistency',
      estimatedMinutes: 7,
      bloomTarget: 4,
    },
    {
      name: 'Core Web Vitals (LCP / INP / CLS) Profiling',
      mustHave: true,
      importance: 0.85,
      verificationMethod: 'Long tasks breakdown, layout shift debugging, main-thread blocking audit & hydration budgets',
      estimatedMinutes: 7,
      bloomTarget: 4,
    },
    {
      name: 'Zero-Downtime Micro-Frontends & Contract Testing',
      mustHave: false,
      importance: 0.75,
      verificationMethod: 'Module federation, semantic versioned API contracts, feature flag rollouts & canary releases',
      estimatedMinutes: 6,
      bloomTarget: 3,
    },
  ],
  'ROLE-06': [
    {
      name: 'Distributed Stream Processing (Kafka / Flink)',
      mustHave: true,
      importance: 0.95,
      verificationMethod: 'Exactly-once semantics, watermark skew handling, consumer group rebalance tuning & dead-letter queues',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Analytical Data Warehouse Modeling (BigQuery / Snowflake)',
      mustHave: true,
      importance: 0.90,
      verificationMethod: 'Dimensional modeling, partition pruning, clustering keys, query execution DAG tuning & incremental loads',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Data Quality Contracts & Automated Lineage',
      mustHave: true,
      importance: 0.85,
      verificationMethod: 'Schema drift enforcement, Monte Carlo / Great Expectations validation, DAG lineage & SLA monitors',
      estimatedMinutes: 7,
      bloomTarget: 3,
    },
    {
      name: 'Object Storage Lakehouse Format (Iceberg / Delta)',
      mustHave: false,
      importance: 0.75,
      verificationMethod: 'ACID transactions on S3/GCS, snapshot isolation, file compaction heuristics & time-travel queries',
      estimatedMinutes: 6,
      bloomTarget: 3,
    },
  ],
};

function generateDynamicBlueprint(roleTitle: string, department: string): CompetencyItem[] {
  const t = roleTitle.toLowerCase();
  if (t.includes('security') || t.includes('infosec') || t.includes('cyber')) {
    return [
      {
        name: 'Zero-Trust Architecture & Threat Modeling',
        mustHave: true,
        importance: 0.95,
        verificationMethod: 'STRIDE model analysis, micro-segmentation, identity-aware proxies',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Cryptographic Protocol Implementation & KMS',
        mustHave: true,
        importance: 0.90,
        verificationMethod: 'Envelope encryption, TLS 1.3 cipher negotiation, key rotation lifecycle',
        estimatedMinutes: 7,
        bloomTarget: 4,
      },
      {
        name: 'Incident Response & SIEM Alert Correlation',
        mustHave: true,
        importance: 0.85,
        verificationMethod: 'Automated playbook orchestration, forensic timeline reconstruction, log deduplication',
        estimatedMinutes: 7,
        bloomTarget: 3,
      },
      {
        name: 'Supply Chain Security & SBOM Verification',
        mustHave: false,
        importance: 0.75,
        verificationMethod: 'Signed attestations, provenance verification (SLSA Level 3), vulnerability scanning',
        estimatedMinutes: 6,
        bloomTarget: 3,
      },
    ];
  }

  if (t.includes('distributed') || t.includes('consensus') || t.includes('storage') || t.includes('systems')) {
    return [
      {
        name: 'Raft / Paxos Consensus & Cluster Quorum',
        mustHave: true,
        importance: 0.95,
        verificationMethod: 'Leader lease heartbeats, split-vote resolution, log compaction & snapshotting',
        estimatedMinutes: 9,
        bloomTarget: 5,
      },
      {
        name: 'Write-Ahead Logging & LSM Storage Internals',
        mustHave: true,
        importance: 0.90,
        verificationMethod: 'SSTable flush mechanisms, Bloom filter tuning, read amplification tradeoffs',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Partition Tolerance & CAP Theorem Tradeoffs',
        mustHave: true,
        importance: 0.85,
        verificationMethod: 'Split-brain mitigation, vector clocks, tunable consistency levels (R+W>N)',
        estimatedMinutes: 7,
        bloomTarget: 4,
      },
      {
        name: 'Sharded Storage & Consistent Hashing',
        mustHave: false,
        importance: 0.75,
        verificationMethod: 'Virtual node distribution, rebalancing overhead, hotspot mitigation',
        estimatedMinutes: 6,
        bloomTarget: 4,
      },
    ];
  }

  if (t.includes('ai') || t.includes('machine learning') || t.includes('ml') || t.includes('llm') || t.includes('generative')) {
    return [
      {
        name: 'GPU Cluster Scheduling & vLLM Serving',
        mustHave: true,
        importance: 0.95,
        verificationMethod: 'PagedAttention memory allocation, continuous batching, tensor parallelism',
        estimatedMinutes: 8,
        bloomTarget: 5,
      },
      {
        name: 'Distributed Model Sharding (DeepSpeed / Megatron)',
        mustHave: true,
        importance: 0.92,
        verificationMethod: 'ZeRO-1/2/3 stages, pipeline vs tensor parallelism, NVLink bandwidth profiling',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Vector Database Indexing & Low-Latency RAG',
        mustHave: true,
        importance: 0.88,
        verificationMethod: 'HNSW graph search vs IVF-PQ, quantization recall tradeoffs, hybrid sparse-dense ranking',
        estimatedMinutes: 7,
        bloomTarget: 4,
      },
      {
        name: 'Model Inference Observability & Token Metrics',
        mustHave: false,
        importance: 0.78,
        verificationMethod: 'TTFT (Time to First Token), inter-token latency, GPU utilization & memory fragmentation',
        estimatedMinutes: 6,
        bloomTarget: 3,
      },
    ];
  }

  if (t.includes('frontend') || t.includes('fullstack') || t.includes('ui') || t.includes('react') || t.includes('web')) {
    return [
      {
        name: 'Next.js SSR / ISR & Edge Streaming',
        mustHave: true,
        importance: 0.95,
        verificationMethod: 'React Server Components, Suspense streaming boundaries, edge caching invalidation',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'State Synchronization & Optimistic UI',
        mustHave: true,
        importance: 0.88,
        verificationMethod: 'WebSocket delta reconciliation, CRDTs, optimistic rollback strategies',
        estimatedMinutes: 7,
        bloomTarget: 4,
      },
      {
        name: 'Core Web Vitals (LCP / INP / CLS) Profiling',
        mustHave: true,
        importance: 0.85,
        verificationMethod: 'Long tasks breakdown, layout shift debugging, main-thread blocking audit',
        estimatedMinutes: 7,
        bloomTarget: 4,
      },
      {
        name: 'Zero-Downtime Micro-Frontends & Contract Testing',
        mustHave: false,
        importance: 0.75,
        verificationMethod: 'Module federation, semantic versioned API contracts, feature flag rollouts',
        estimatedMinutes: 6,
        bloomTarget: 3,
      },
    ];
  }

  if (t.includes('cloud') || t.includes('infrastructure') || t.includes('platform')) {
    return [
      {
        name: 'Multi-Cloud VPC & Transit Gateway Routing',
        mustHave: true,
        importance: 0.95,
        verificationMethod: 'Cross-cloud routing topologies, BGP peering, MTU optimization, egress firewalls',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Terraform / IaC Drift Detection & State Locking',
        mustHave: true,
        importance: 0.90,
        verificationMethod: 'Remote state locking, module composition, CI plan gates, drift remediation',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'SLO / SLI Error Budgets & Burn Rate Alerting',
        mustHave: true,
        importance: 0.90,
        verificationMethod: 'Multiwindow multi-burn-rate alerts, SLA renegotiation, automated freeze gates',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Multi-Region Disaster Recovery (RPO / RTO)',
        mustHave: false,
        importance: 0.80,
        verificationMethod: 'Active-active failover, asynchronous replication lag, DNS failover latency',
        estimatedMinutes: 7,
        bloomTarget: 5,
      },
    ];
  }

  if (t.includes('sre') || t.includes('reliability') || t.includes('devops')) {
    return [
      {
        name: 'SLO / SLI Error Budgets & Burn Rate Alerting',
        mustHave: true,
        importance: 0.95,
        verificationMethod: 'Multiwindow multi-burn-rate alerts, SLA renegotiation, automated freeze gates',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Incident Post-Mortems & Chaos Engineering',
        mustHave: true,
        importance: 0.90,
        verificationMethod: 'Blameless retrospectives, failure injection (Chaos Mesh), graceful degradation verification',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Automated Infrastructure Provisioning & GitOps',
        mustHave: true,
        importance: 0.85,
        verificationMethod: 'ArgoCD / Flux sync, declarative desired-state reconciliation, immutable deployments',
        estimatedMinutes: 7,
        bloomTarget: 4,
      },
      {
        name: 'Telemetry Aggregation & Distributed Tracing',
        mustHave: false,
        importance: 0.75,
        verificationMethod: 'OpenTelemetry collector sampling, trace-to-metrics correlation, span latency heatmaps',
        estimatedMinutes: 6,
        bloomTarget: 3,
      },
    ];
  }

  if (t.includes('data') || t.includes('analytics') || t.includes('pipeline')) {
    return [
      {
        name: 'Distributed Stream Processing (Kafka / Flink)',
        mustHave: true,
        importance: 0.95,
        verificationMethod: 'Exactly-once semantics, watermark skew handling, consumer group rebalance tuning',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Analytical Data Warehouse Modeling (BigQuery / Snowflake)',
        mustHave: true,
        importance: 0.90,
        verificationMethod: 'Dimensional modeling, partition pruning, clustering keys, query execution DAG tuning',
        estimatedMinutes: 8,
        bloomTarget: 4,
      },
      {
        name: 'Data Quality Contracts & Automated Lineage',
        mustHave: true,
        importance: 0.85,
        verificationMethod: 'Schema drift enforcement, Monte Carlo / Great Expectations validation, DAG lineage',
        estimatedMinutes: 7,
        bloomTarget: 3,
      },
      {
        name: 'Object Storage Lakehouse Format (Iceberg / Delta)',
        mustHave: false,
        importance: 0.75,
        verificationMethod: 'ACID transactions on S3/GCS, snapshot isolation, file compaction heuristics',
        estimatedMinutes: 6,
        bloomTarget: 3,
      },
    ];
  }

  // General Engineering Archetype
  return [
    {
      name: `${roleTitle} Architecture & Domain Modeling`,
      mustHave: true,
      importance: 0.95,
      verificationMethod: 'Domain-driven design, clean boundaries, latency and throughput optimization',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'High-Concurrency Runtime & Memory Profiling',
      mustHave: true,
      importance: 0.90,
      verificationMethod: 'Thread contention profiling, memory allocations, CPU cache efficiency',
      estimatedMinutes: 8,
      bloomTarget: 4,
    },
    {
      name: 'Distributed Resilience & Fault Isolation',
      mustHave: true,
      importance: 0.85,
      verificationMethod: 'Circuit breakers, jittered exponential backoff, graceful degradation fallback',
      estimatedMinutes: 7,
      bloomTarget: 3,
    },
    {
      name: 'Comprehensive Testing & Production Observability',
      mustHave: false,
      importance: 0.75,
      verificationMethod: 'End-to-end contract testing, structured telemetry, p99 latency SLO enforcement',
      estimatedMinutes: 6,
      bloomTarget: 3,
    },
  ];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<DemoRole[]>(DEMO_ROLES);
  const [selectedRole, setSelectedRole] = useState<DemoRole>(DEMO_ROLES[0]);
  const [roleBlueprints, setRoleBlueprints] = useState<Record<string, CompetencyItem[]>>(PREBUILT_BLUEPRINTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleDept, setNewRoleDept] = useState('Core Engineering');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchBackendRoles() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/roles`);
        if (res.ok) {
          const rawRoles: any[] = await res.json();
          if (Array.isArray(rawRoles) && rawRoles.length > 0) {
            const bpMap: Record<string, CompetencyItem[]> = {};
            const uniqueCustomRoles: DemoRole[] = [];

            // Existing curated titles to prevent duplicates
            const curatedTitles = new Set(DEMO_ROLES.map((r) => r.title.toLowerCase().trim()));
            const seen = new Set<string>();

            rawRoles.forEach((r) => {
              const norm = (r.title || '').toLowerCase().trim();
              if (!norm || seen.has(norm) || curatedTitles.has(norm)) return;
              seen.add(norm);

              const comps: CompetencyItem[] =
                r.blueprint?.competencies?.map((c: any) => ({
                  name: c.name || 'Core Competency',
                  mustHave: Boolean(c.must_have),
                  importance: c.importance || 0.85,
                  verificationMethod:
                    c.description || (c.rubric_criteria ? c.rubric_criteria.join(', ') : 'Demonstrated operational depth'),
                  estimatedMinutes: c.estimated_minutes || 7,
                  bloomTarget: c.target_bloom_level || 4,
                })) || generateDynamicBlueprint(r.title, r.department || 'Engineering');

              bpMap[r.id] = comps;

              uniqueCustomRoles.push({
                id: r.id,
                title: r.title,
                department: r.department || 'Core Engineering',
                activeInterviews: 1,
                completedInterviews: 0,
                mustHaveSkills: comps.filter((c) => c.mustHave).map((c) => c.name),
                createdDate: r.created_at ? r.created_at.split('T')[0] : '2026-10-11',
              });
            });

            // Showcase curated top roles followed by unique custom roles created by users
            setRoles([...DEMO_ROLES, ...uniqueCustomRoles]);
            setRoleBlueprints((prev) => ({ ...prev, ...bpMap }));
          }
        }
      } catch (err) {
        console.warn('Could not query live roles from backend:', err);
      }
    }
    fetchBackendRoles();
  }, []);

  // Active competencies for selected role - guaranteed unique per role
  const competencies =
    roleBlueprints[selectedRole.id] ||
    PREBUILT_BLUEPRINTS[selectedRole.id] ||
    generateDynamicBlueprint(selectedRole.title, selectedRole.department);

  const toggleMustHave = (index: number) => {
    setRoleBlueprints((prev) => {
      const currentList =
        prev[selectedRole.id] ||
        PREBUILT_BLUEPRINTS[selectedRole.id] ||
        generateDynamicBlueprint(selectedRole.title, selectedRole.department);
      const updatedList = currentList.map((c, idx) => (idx === index ? { ...c, mustHave: !c.mustHave } : c));
      return {
        ...prev,
        [selectedRole.id]: updatedList,
      };
    });
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    const dynamicCompetencies = generateDynamicBlueprint(newRoleTitle, newRoleDept);
    let assignedId = `ROLE-${Date.now().toString().slice(-4)}`;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const res = await fetch(`${apiUrl}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRoleTitle,
          department: newRoleDept,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) assignedId = data.id;
      }
    } catch (err) {
      console.warn('Backend role creation fallback:', err);
    }

    const created: DemoRole = {
      id: assignedId,
      title: newRoleTitle,
      department: newRoleDept,
      activeInterviews: 0,
      completedInterviews: 0,
      mustHaveSkills: dynamicCompetencies.filter((c) => c.mustHave).map((c) => c.name),
      createdDate: new Date().toISOString().split('T')[0],
    };

    setRoles([created, ...roles]);
    setRoleBlueprints((prev) => ({
      ...prev,
      [assignedId]: dynamicCompetencies,
    }));
    setSelectedRole(created);
    setNewRoleTitle('');
    setShowCreateModal(false);
  };

  const handleGenerateInvite = () => {
    const dynamicId = `INT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/interview/${dynamicId}/consent?role=${encodeURIComponent(selectedRole.title)}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const totalMinutes = competencies.reduce((acc, c) => acc + c.estimatedMinutes, 0);
  const mustHavesCount = competencies.filter((c) => c.mustHave).length;

  return (
    <AppShell>
      <PageHeader
        title="Target Roles & Skill Blueprint Studio"
        description="Inspect unique, role-calibrated competency rubrics and Bloom levels, customize practice blueprints, and immediately launch live interviews."
        breadcrumbs={[{ label: 'Launchpad', href: '/' }, { label: 'Target Roles' }]}
        primaryAction={{
          label: 'Add Target Role',
          onClick: () => setShowCreateModal(true),
          icon: <Plus size={16} />,
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Column: Roles Selector with Independent Scrollbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Target Engineering Roles
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', backgroundColor: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
              {roles.length} roles
            </span>
          </div>

          <div
            className="custom-role-scrollbar"
            style={{
              maxHeight: 'calc(100vh - 210px)',
              overflowY: 'auto',
              paddingRight: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {roles.map((role) => {
              const isSelected = selectedRole.id === role.id;
              const roleComps =
                roleBlueprints[role.id] ||
                PREBUILT_BLUEPRINTS[role.id] ||
                generateDynamicBlueprint(role.title, role.department);
              const mustHaveCount = roleComps.filter((c) => c.mustHave).length;

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className="card-interactive btn-tactile"
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--surface)',
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 18px -2px rgba(79, 70, 229, 0.22)' : 'var(--shadow-card)',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--ink-strong)', lineHeight: 1.3 }}>
                      {role.title}
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '10px', padding: '2px 7px', backgroundColor: 'var(--accent)', color: '#ffffff', borderRadius: 'var(--radius-sm)', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    {role.department}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)', backgroundColor: 'var(--canvas)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      {mustHaveCount} Must-Haves
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)', backgroundColor: 'var(--canvas)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      {role.completedInterviews} finished
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Blueprint Studio (Pinned / Sticky so it doesn't move when scrolling left roles) */}
        <div
          className="glass-card-pro custom-role-scrollbar"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-card)',
            position: 'sticky',
            top: '84px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            alignSelf: 'start',
          }}
        >
          {/* Blueprint Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                  {selectedRole.title} Blueprint
                </h2>
                <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                  Unique Archetype
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                Calibrated competencies, Bloom targets, and verification criteria for {selectedRole.department}.
              </p>
            </div>

            {/* Quick Actions & Launch Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Target Time</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'monospace' }}>
                    {totalMinutes} mins
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Must-Haves</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)' }}>
                    {mustHavesCount} skills
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const extraSkills: CompetencyItem[] = [
                      {
                        name: 'Zero-Trust Service Mesh & mTLS SPIFFE',
                        mustHave: true,
                        importance: 0.92,
                        verificationMethod: 'Cryptographic workload attestation, Envoy sidecar proxy filters, and certificate rotation',
                        estimatedMinutes: 8,
                        bloomTarget: 5,
                      },
                      {
                        name: 'Kafka Partition Rebalancing & Consumer Lag Tuning',
                        mustHave: false,
                        importance: 0.84,
                        verificationMethod: 'Cooperative sticky assignors, backpressure propagation, and offset commit semantics',
                        estimatedMinutes: 7,
                        bloomTarget: 4,
                      },
                    ];
                    setRoleBlueprints((prev) => ({
                      ...prev,
                      [selectedRole.id]: [...(prev[selectedRole.id] || []), ...extraSkills],
                    }));
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 3000);
                  }}
                  className="btn-tactile"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    border: '1px solid rgba(79, 70, 229, 0.25)',
                    color: 'var(--accent)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <Sparkles size={14} />
                  <span>✨ Suggest AI Skills</span>
                </button>

                <Link
                  href={`/interview/start?role=${encodeURIComponent(selectedRole.title)}`}
                  className="btn-tactile"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px -2px rgba(99, 102, 241, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <Play size={14} fill="#ffffff" />
                  <span>Launch Practice on this Blueprint</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Competencies Table */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                Competency Requirements & Verification Rubric
              </div>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                Click toggle to adjust required must-haves
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {competencies.map((comp, idx) => (
                <div
                  key={idx}
                  className="card-interactive"
                  style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: comp.mustHave ? 'rgba(255, 255, 255, 0.90)' : 'rgba(255, 255, 255, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                        {comp.name}
                      </span>
                      {comp.mustHave && (
                        <span style={{ fontSize: '11px', padding: '2px 7px', backgroundColor: 'var(--success-soft)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                          Must-Have
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                      <strong style={{ color: 'var(--ink)' }}>Verification criteria:</strong> {comp.verificationMethod}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div style={{ color: 'var(--ink-muted)' }}>
                        Target Bloom:{' '}
                        <strong
                          style={{
                            color: comp.bloomTarget >= 5 ? '#6D28D9' : comp.bloomTarget === 4 ? '#0284C7' : '#059669',
                          }}
                        >
                          L{comp.bloomTarget}
                        </strong>
                      </div>
                      <div style={{ color: 'var(--ink-soft)' }}>~{comp.estimatedMinutes} mins</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleMustHave(idx)}
                      className="btn-tactile"
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-strong)',
                        backgroundColor: comp.mustHave ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                        color: comp.mustHave ? 'var(--accent)' : 'var(--ink-muted)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {comp.mustHave ? 'Must-Have Active' : 'Set as Must-Have'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blueprint Footer Notice */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'rgba(241, 245, 249, 0.8)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--ink-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <span>
              All {mustHavesCount} must-have competencies will be prioritized by the Next-Best-Question adaptive coverage engine.
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {copiedLink && (
                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                  ✓ AI competencies updated & invite ready!
                </span>
              )}
              <button
                type="button"
                onClick={handleGenerateInvite}
                className="btn-tactile"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--ink-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                Generate Invite Link <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="animate-in-modal"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(32px) saturate(200%)',
              WebkitBackdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(226, 232, 240, 0.95)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 24px 64px -8px rgba(15, 23, 42, 0.18), 0 0 32px -4px rgba(99, 102, 241, 0.20), inset 0 1.5px 2px 0 rgba(255, 255, 255, 1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(248, 250, 252, 0.85)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-soft)',
                    border: '1px solid rgba(99, 102, 241, 0.20)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-strong)', margin: 0, lineHeight: 1.2 }}>
                    Add Target Role & AI Skill Discovery
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: '3px 0 0 0' }}>
                    Synthesize adaptive competencies and Bloom levels
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-tactile"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: 'var(--ink-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                Enter any engineering role. Provenance will dynamically calibrate tailored competency requirements, Bloom targets, and verification criteria.
              </p>

              <form onSubmit={handleCreateRole}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                    Role Title <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Site Reliability Engineer, Security Architect, Rust Developer"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      backgroundColor: '#ffffff',
                      color: 'var(--ink-strong)',
                      outline: 'none',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-strong)';
                      e.target.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                    Department / Squad
                  </label>
                  <input
                    type="text"
                    value={newRoleDept}
                    onChange={(e) => setNewRoleDept(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      backgroundColor: '#ffffff',
                      color: 'var(--ink-strong)',
                      outline: 'none',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-strong)';
                      e.target.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-tactile"
                    style={{
                      padding: '9px 18px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--ink-muted)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-tactile"
                    style={{
                      padding: '9px 20px',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px -2px rgba(99, 102, 241, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Sparkles size={15} />
                    <span>Generate Blueprint & Add Role</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
