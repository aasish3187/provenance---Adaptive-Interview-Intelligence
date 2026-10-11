'use client';

import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { useScenario, ScenarioId } from '@/context/ScenarioContext';

export interface MatrixNode {
  id: string;
  name: string;
  claimedX: number; // 0 to 100
  demonstratedY: number; // 0 to 100
  bloom: string;
  quadrant: 'Strengths' | 'Untested' | 'Hidden' | 'Gaps';
  color: string;
  quoteCount: number;
}

export interface RealityMatrixInput {
  quadrant_1_verified_strengths?: any[];
  quadrant_2_untested_claims?: any[];
  quadrant_3_hidden_gems?: any[];
  quadrant_4_verified_gaps?: any[];
}

interface RealityMatrix2DCanvasProps {
  realityMatrix?: RealityMatrixInput;
  roleTitle?: string;
  candidateName?: string;
  nodes?: MatrixNode[];
  onSelectCompetency?: (name: string) => void;
}

// Dynamic presets per benchmark role scenario
const ROLE_SCENARIO_NODES: Record<ScenarioId, { role: string; candidate: string; nodes: MatrixNode[] }> = {
  G1: {
    role: 'Senior Distributed Systems Engineer',
    candidate: 'Aasish',
    nodes: [
      { id: 'G1-1', name: 'Raft Consensus Protocols', claimedX: 92, demonstratedY: 94, bloom: 'L5 Evaluation', quadrant: 'Strengths', color: '#059669', quoteCount: 5 },
      { id: 'G1-2', name: 'Go Concurrency Semantics', claimedX: 95, demonstratedY: 90, bloom: 'L4 Analysis', quadrant: 'Strengths', color: '#059669', quoteCount: 4 },
      { id: 'G1-3', name: 'Kubernetes HPA & Autoscaling', claimedX: 88, demonstratedY: 86, bloom: 'L4 Analysis', quadrant: 'Strengths', color: '#059669', quoteCount: 3 },
      { id: 'G1-4', name: 'Linux eBPF Tracing', claimedX: 25, demonstratedY: 84, bloom: 'L4 Analysis', quadrant: 'Hidden', color: '#0284C7', quoteCount: 2 },
      { id: 'G1-5', name: 'Kafka Partition Rebalancing', claimedX: 82, demonstratedY: 18, bloom: 'Unassessed', quadrant: 'Untested', color: '#D97706', quoteCount: 0 },
      { id: 'G1-6', name: 'Zero-Trust SPIFFE & mTLS', claimedX: 85, demonstratedY: 38, bloom: 'L3 Application', quadrant: 'Gaps', color: '#E11D48', quoteCount: 1 },
    ],
  },
  G3: {
    role: 'Cloud Platform Architect',
    candidate: 'Jordan Vance',
    nodes: [
      { id: 'G3-1', name: 'AWS Multi-Account IAM', claimedX: 88, demonstratedY: 82, bloom: 'L4 Analysis', quadrant: 'Strengths', color: '#059669', quoteCount: 3 },
      { id: 'G3-2', name: 'Terraform Modular Design', claimedX: 85, demonstratedY: 80, bloom: 'L4 Analysis', quadrant: 'Strengths', color: '#059669', quoteCount: 2 },
      { id: 'G3-3', name: 'PostgreSQL Query Tuning', claimedX: 20, demonstratedY: 78, bloom: 'L4 Analysis', quadrant: 'Hidden', color: '#0284C7', quoteCount: 2 },
      { id: 'G3-4', name: 'FinOps Cost Allocation', claimedX: 75, demonstratedY: 22, bloom: 'Unassessed', quadrant: 'Untested', color: '#D97706', quoteCount: 0 },
      { id: 'G3-5', name: 'Zero-Trust Service Mesh', claimedX: 95, demonstratedY: 28, bloom: 'L3 Application', quadrant: 'Gaps', color: '#E11D48', quoteCount: 2 },
      { id: 'G3-6', name: 'Istio Traffic Shifting', claimedX: 90, demonstratedY: 32, bloom: 'L3 Application', quadrant: 'Gaps', color: '#E11D48', quoteCount: 1 },
    ],
  },
  G5: {
    role: 'Principal Systems Engineer',
    candidate: 'Priya Nair',
    nodes: [
      { id: 'G5-1', name: 'C++ Memory Safety & Concurrency', claimedX: 92, demonstratedY: 88, bloom: 'L5 Evaluation', quadrant: 'Strengths', color: '#059669', quoteCount: 4 },
      { id: 'G5-2', name: 'CoMAI Guard Input Defusal', claimedX: 85, demonstratedY: 90, bloom: 'L5 Evaluation', quadrant: 'Strengths', color: '#059669', quoteCount: 3 },
      { id: 'G5-3', name: 'Prompt Injection Mitigation', claimedX: 18, demonstratedY: 86, bloom: 'L4 Analysis', quadrant: 'Hidden', color: '#0284C7', quoteCount: 2 },
      { id: 'G5-4', name: 'Kernel Network Drivers', claimedX: 80, demonstratedY: 20, bloom: 'Unassessed', quadrant: 'Untested', color: '#D97706', quoteCount: 0 },
      { id: 'G5-5', name: 'TLA+ Formal Verification', claimedX: 88, demonstratedY: 36, bloom: 'L3 Application', quadrant: 'Gaps', color: '#E11D48', quoteCount: 1 },
    ],
  },
  G7: {
    role: 'Staff SRE Architect',
    candidate: 'Elena Rostova',
    nodes: [
      { id: 'G7-1', name: 'OpenTelemetry Distributed Tracing', claimedX: 90, demonstratedY: 88, bloom: 'L4 Analysis', quadrant: 'Strengths', color: '#059669', quoteCount: 4 },
      { id: 'G7-2', name: 'Chaos Mesh Fault Injection', claimedX: 85, demonstratedY: 82, bloom: 'L4 Analysis', quadrant: 'Strengths', color: '#059669', quoteCount: 3 },
      { id: 'G7-3', name: 'Major Incident Command', claimedX: 22, demonstratedY: 80, bloom: 'L4 Analysis', quadrant: 'Hidden', color: '#0284C7', quoteCount: 2 },
      { id: 'G7-4', name: 'Multi-Region Disaster Recovery', claimedX: 78, demonstratedY: 24, bloom: 'Unassessed', quadrant: 'Untested', color: '#D97706', quoteCount: 0 },
      { id: 'G7-5', name: 'SLO Error Budget Automation', claimedX: 88, demonstratedY: 42, bloom: 'L3 Application', quadrant: 'Gaps', color: '#E11D48', quoteCount: 1 },
    ],
  },
};

export const RealityMatrix2DCanvas: React.FC<RealityMatrix2DCanvasProps> = ({
  realityMatrix,
  roleTitle,
  candidateName,
  nodes: customNodes,
  onSelectCompetency,
}) => {
  const { activeScenarioId, playCrystalSound } = useScenario();
  const [hoveredNode, setHoveredNode] = useState<MatrixNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<MatrixNode | null>(null);

  const scenarioPreset = ROLE_SCENARIO_NODES[activeScenarioId] || ROLE_SCENARIO_NODES.G1;
  const displayRoleTitle = roleTitle || scenarioPreset.role;
  const displayCandidateName = candidateName || scenarioPreset.candidate;

  // Derive active nodes: customNodes > realityMatrix conversion > scenario preset
  let displayNodes: MatrixNode[] = [];

  if (customNodes && customNodes.length > 0) {
    displayNodes = customNodes;
  } else if (realityMatrix) {
    const q1 = realityMatrix.quadrant_1_verified_strengths || [];
    const q2 = realityMatrix.quadrant_2_untested_claims || [];
    const q3 = realityMatrix.quadrant_3_hidden_gems || [];
    const q4 = realityMatrix.quadrant_4_verified_gaps || [];

    const parsed: MatrixNode[] = [];

    q1.forEach((s: any, i: number) => {
      parsed.push({
        id: s.competency_id || `q1-${i}`,
        name: s.name,
        claimedX: Math.min(95, 80 + ((i * 7) % 15)),
        demonstratedY: Math.round((s.estimate || 0.85) * 100),
        bloom: 'L4 Analysis',
        quadrant: 'Strengths',
        color: '#059669',
        quoteCount: s.evidence?.length || 2,
      });
    });

    q2.forEach((s: any, i: number) => {
      parsed.push({
        id: s.competency_id || `q2-${i}`,
        name: s.name,
        claimedX: Math.min(92, 75 + ((i * 6) % 16)),
        demonstratedY: Math.max(10, Math.round((s.estimate || 0.2) * 100)),
        bloom: 'Unassessed',
        quadrant: 'Untested',
        color: '#D97706',
        quoteCount: s.evidence?.length || 0,
      });
    });

    q3.forEach((s: any, i: number) => {
      parsed.push({
        id: s.competency_id || `q3-${i}`,
        name: s.name,
        claimedX: Math.max(15, 20 + ((i * 5) % 15)),
        demonstratedY: Math.round((s.estimate || 0.8) * 100),
        bloom: 'L4 Analysis',
        quadrant: 'Hidden',
        color: '#0284C7',
        quoteCount: s.evidence?.length || 1,
      });
    });

    q4.forEach((s: any, i: number) => {
      parsed.push({
        id: s.competency_id || `q4-${i}`,
        name: s.name,
        claimedX: Math.min(95, 82 + ((i * 5) % 14)),
        demonstratedY: Math.max(15, Math.round((s.estimate || 0.35) * 100)),
        bloom: 'L3 Application',
        quadrant: 'Gaps',
        color: '#E11D48',
        quoteCount: s.evidence?.length || 1,
      });
    });

    displayNodes = parsed.length > 0 ? parsed : scenarioPreset.nodes;
  } else {
    displayNodes = scenarioPreset.nodes;
  }

  const handleNodeClick = (node: MatrixNode) => {
    setSelectedNode(node);
    playCrystalSound('verified');
    if (onSelectCompetency) onSelectCompetency(node.name);
  };

  return (
    <div
      className="glass-card-pro"
      style={{
        padding: '20px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.06), inset 0 1.5px 2px rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
              2D Reality Matrix Plot · {displayRoleTitle}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)' }}>
              Candidate: <strong>{displayCandidateName}</strong> · X: Resume Claimed vs. Y: Spoken Demonstration
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} /> Verified Strengths
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284C7', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284C7' }} /> Hidden Gems
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} /> Untested
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#E11D48', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E11D48' }} /> Growth Gaps
          </span>
        </div>
      </div>

      {/* 2D Coordinate Grid SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '12px', backgroundColor: 'rgba(248, 250, 252, 0.7)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden' }}>
        <svg
          viewBox="0 0 500 280"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Quadrant Background Zones */}
          {/* Top Left: Hidden Gems (Low resume, High demo) */}
          <rect x="0" y="0" width="250" height="140" fill="rgba(2, 132, 199, 0.03)" />
          {/* Top Right: Verified Strengths (High resume, High demo) */}
          <rect x="250" y="0" width="250" height="140" fill="rgba(5, 150, 105, 0.04)" />
          {/* Bottom Left: Untested / Neutral */}
          <rect x="0" y="140" width="250" height="140" fill="rgba(241, 245, 249, 0.4)" />
          {/* Bottom Right: Growth Gaps (High resume, Low demo) */}
          <rect x="250" y="140" width="250" height="140" fill="rgba(225, 29, 72, 0.04)" />

          {/* Quadrant Axis Dividers */}
          <line x1="250" y1="0" x2="250" y2="280" stroke="rgba(203, 213, 225, 0.9)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(203, 213, 225, 0.9)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Quadrant Watermark Labels */}
          <text x="260" y="24" fill="#059669" opacity="0.4" fontSize="12" fontWeight="700">Q1: VERIFIED STRENGTHS</text>
          <text x="12" y="24" fill="#0284C7" opacity="0.4" fontSize="12" fontWeight="700">Q3: HIDDEN GEMS</text>
          <text x="12" y="268" fill="#D97706" opacity="0.4" fontSize="12" fontWeight="700">Q2: UNTESTED CLAIMS</text>
          <text x="260" y="268" fill="#E11D48" opacity="0.4" fontSize="12" fontWeight="700">Q4: GROWTH GAPS</text>

          {/* Nodes */}
          {displayNodes.map((node) => {
            // Map (0..100) to SVG coordinates (padding 30px)
            const cx = 35 + (node.claimedX / 100) * 430;
            const cy = 250 - (node.demonstratedY / 100) * 220;
            const isHover = hoveredNode?.id === node.id;
            const isSelect = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHover || isSelect ? 16 : 10}
                  fill={node.color}
                  opacity={isHover || isSelect ? 0.35 : 0.18}
                  style={{ transition: 'all 150ms ease' }}
                />

                {/* Core bead */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHover || isSelect ? 7 : 5}
                  fill={node.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                />

                {/* Node Label text */}
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontSize={isHover || isSelect ? '11' : '10'}
                  fontWeight={isHover || isSelect ? '700' : '600'}
                  style={{ pointerEvents: 'none' }}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Selected Info Card overlay */}
        {(hoveredNode || selectedNode) && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              padding: '8px 14px',
              borderRadius: '8px',
              border: `1px solid ${(hoveredNode || selectedNode)!.color}`,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 20,
            }}
          >
            <div>
              <strong style={{ color: 'var(--ink)' }}>{(hoveredNode || selectedNode)!.name}</strong>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                Bloom: {(hoveredNode || selectedNode)!.bloom} · Demonstrated: {(hoveredNode || selectedNode)!.demonstratedY}% · {(hoveredNode || selectedNode)!.quoteCount} Quotes
              </div>
            </div>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: `${(hoveredNode || selectedNode)!.color}15`,
                color: (hoveredNode || selectedNode)!.color,
              }}
            >
              {(hoveredNode || selectedNode)!.quadrant}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
