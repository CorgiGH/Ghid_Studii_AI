import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import StepPlayer from './StepPlayer';

const NODE_R = 18;

const NODE_COLORS = {
  active:    { fill: '#3b82f6', stroke: '#3b82f6', text: 'white' },
  visited:   { fill: '#22c55e', stroke: '#22c55e', text: 'white' },
  queued:    { fill: 'var(--theme-card-bg)', stroke: '#f59e0b', text: 'var(--theme-content-text)' },
  unvisited: { fill: 'var(--theme-card-bg)', stroke: 'var(--theme-border)', text: 'var(--theme-content-text)' },
};

export default function GraphRenderer({ data }) {
  const { t } = useApp();
  const { meta, graph, steps } = data;
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const step = steps[currentStep];

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!playing) { stopTimer(); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1000 / speed);
    return stopTimer;
  }, [playing, speed, steps.length, stopTimer]);

  const getNodeState = (id) => {
    if (id === step.active) return 'active';
    if (step.visited?.includes(id)) return 'visited';
    if (step.queue?.includes(id)) return 'queued';
    return 'unvisited';
  };

  const isEdgeHighlighted = (from, to) => {
    return step.edgeHighlights?.some(e =>
      (e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from)
    );
  };

  // Compute SVG viewBox from node positions
  const xs = graph.nodes.map(n => n.x);
  const ys = graph.nodes.map(n => n.y);
  const pad = 30;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const maxX = Math.max(...xs) + pad;
  const maxY = Math.max(...ys) + pad;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  const nodeMap = Object.fromEntries(graph.nodes.map(n => [n.id, n]));

  return (
    <div className="rounded-xl p-4 mb-3" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        {meta?.algorithm || t('Graph Animation', 'Animatie graf')}
      </div>

      {meta?.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--theme-muted-text)' }}>
          {t(meta.description.en, meta.description.ro)}
        </p>
      )}

      {/* SVG graph */}
      <svg viewBox={viewBox} className="w-full mb-3" style={{ maxHeight: '280px' }}>
        {/* Edges */}
        {graph.edges.map((edge, i) => {
          const from = nodeMap[edge.from];
          const to = nodeMap[edge.to];
          if (!from || !to) return null;
          const highlighted = isEdgeHighlighted(edge.from, edge.to);
          return (
            <g key={i}>
              <motion.line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={highlighted ? '#3b82f6' : 'var(--theme-border)'}
                strokeWidth={highlighted ? 2.5 : 1.5}
                animate={{ stroke: highlighted ? '#3b82f6' : 'var(--theme-border)' }}
                transition={{ duration: 0.3 }}
              />
              {edge.weight != null && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--theme-muted-text)"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map(node => {
          const state = getNodeState(node.id);
          const colors = NODE_COLORS[state];
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={state === 'queued' ? 2 : 1.5}
                strokeDasharray={state === 'queued' ? '4 2' : 'none'}
                animate={{ fill: colors.fill, stroke: colors.stroke }}
                transition={{ duration: 0.3 }}
              />
              {state === 'active' && (
                <motion.circle
                  cx={node.x} cy={node.y} r={NODE_R + 4}
                  fill="none" stroke="#3b82f6" strokeWidth={1}
                  animate={{ opacity: [0.6, 0, 0.6], r: [NODE_R + 2, NODE_R + 8, NODE_R + 2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <text
                x={node.x} y={node.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={colors.text}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Step label */}
      {step.label && (
        <p className="text-xs text-center mb-2" style={{ color: 'var(--theme-content-text)' }}>
          {t(step.label.en, step.label.ro)}
        </p>
      )}

      <StepPlayer
        totalSteps={steps.length}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
