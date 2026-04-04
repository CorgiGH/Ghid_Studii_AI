import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Canvas-drawn clockwise inner vignette sweep.
 * Mount inside a container with overflow:hidden and position:relative.
 * Set `trigger` to true to fire the animation once.
 */
const CompletionVignette = ({ trigger, onComplete }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const getPerimeterPoints = useCallback((w, h, r, numPoints) => {
    const points = [];
    const straightTop = w - 2 * r;
    const straightRight = h - 2 * r;
    const straightBottom = w - 2 * r;
    const straightLeft = h - 2 * r;
    const cornerArc = Math.PI * r / 2;

    const segments = [
      { type: 'line', len: straightTop },
      { type: 'arc', cx: w - r, cy: r, startAngle: -Math.PI / 2, len: cornerArc },
      { type: 'line', len: straightRight },
      { type: 'arc', cx: w - r, cy: h - r, startAngle: 0, len: cornerArc },
      { type: 'line', len: straightBottom },
      { type: 'arc', cx: r, cy: h - r, startAngle: Math.PI / 2, len: cornerArc },
      { type: 'line', len: straightLeft },
      { type: 'arc', cx: r, cy: r, startAngle: Math.PI, len: cornerArc },
    ];
    const lineStarts = [
      { x: r, y: 0, dx: 1, dy: 0 },
      { x: w, y: r, dx: 0, dy: 1 },
      { x: w - r, y: h, dx: -1, dy: 0 },
      { x: 0, y: h - r, dx: 0, dy: -1 },
    ];

    const perimeter = segments.reduce((s, seg) => s + seg.len, 0);
    for (let i = 0; i < numPoints; i++) {
      let remaining = (i / numPoints) * perimeter;
      let x = r, y = 0, lineIdx = 0;
      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s];
        if (remaining <= seg.len) {
          if (seg.type === 'line') {
            const ls = lineStarts[lineIdx];
            x = ls.x + ls.dx * remaining;
            y = ls.y + ls.dy * remaining;
          } else {
            const angle = seg.startAngle + (remaining / r);
            x = seg.cx + r * Math.cos(angle);
            y = seg.cy + r * Math.sin(angle);
          }
          break;
        }
        remaining -= seg.len;
        if (seg.type === 'line') lineIdx++;
      }
      points.push({ x, y });
    }
    return points;
  }, []);

  const drawGlow = useCallback((ctx, px, py, radius, alpha) => {
    if (alpha < 0.003) return;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
    grad.addColorStop(0, `rgba(34, 197, 94, ${alpha})`);
    grad.addColorStop(0.5, `rgba(34, 197, 94, ${alpha * 0.4})`);
    grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  }, []);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const r = 12;
    const numPoints = 180;
    const points = getPerimeterPoints(w, h, r, numPoints);
    const glowRadius = 50;
    const holdAlpha = 0.09;
    const settled = new Float32Array(numPoints);

    const startTime = performance.now();
    const sweepDuration = 1200;
    const tailLength = 0.25;
    const fadeDuration = 800;

    function animate(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, w, h);

      if (elapsed < sweepDuration) {
        const progress = elapsed / sweepDuration;
        const eased = 1 - Math.pow(1 - progress, 2);
        const headPos = eased;

        for (let i = 0; i < numPoints; i++) {
          const pointPos = i / numPoints;
          let behind = headPos - pointPos;
          if (behind < 0) behind += 1;

          let alpha = 0;
          if (behind >= 0 && behind < headPos) {
            if (behind <= tailLength) {
              const falloff = behind / tailLength;
              alpha = 0.2 * Math.cos(falloff * Math.PI / 2);
            }
            const timeSincePassed = headPos - pointPos;
            const settleProgress = Math.min(timeSincePassed / 0.3, 1);
            settled[i] = holdAlpha * settleProgress;
            alpha = Math.max(alpha, settled[i]);
          }
          if (alpha > 0) drawGlow(ctx, points[i].x, points[i].y, glowRadius, alpha);
        }
        animRef.current = requestAnimationFrame(animate);

      } else if (elapsed < sweepDuration + fadeDuration) {
        const fadeProgress = (elapsed - sweepDuration) / fadeDuration;
        const alpha = holdAlpha * (1 - fadeProgress * fadeProgress);
        for (let i = 0; i < numPoints; i++) {
          drawGlow(ctx, points[i].x, points[i].y, glowRadius, alpha);
        }
        animRef.current = requestAnimationFrame(animate);

      } else {
        ctx.clearRect(0, 0, w, h);
        onComplete?.();
      }
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [trigger, getPerimeterPoints, drawGlow, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
};

export default CompletionVignette;
