import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';

/**
 * Renders a 3D scene visualizing a Householder reflection:
 *   — blue arrow = x (the column being reflected)
 *   — amber arrow = v (the reflection axis)
 *   — green arrow = H·x = reflected(x)   =  x − 2 v (v · x)
 *   — translucent plane ⟂ v through origin = the reflection mirror
 *
 * Expects x and v as 3-arrays. If lengths differ (e.g. n=4 edge case slipped through),
 * pads/truncates to 3D.
 */
export default function HouseholderScene({ x, v }) {
  const x3 = to3(x);
  const v3 = normalize(to3(v));

  const reflected = useMemo(() => {
    const dot = x3[0] * v3[0] + x3[1] * v3[1] + x3[2] * v3[2];
    return [x3[0] - 2 * v3[0] * dot, x3[1] - 2 * v3[1] * dot, x3[2] - 2 * v3[2] * dot];
  }, [x3, v3]);

  const bound = Math.max(Math.hypot(...x3), Math.hypot(...v3), 1) * 1.2;
  const planeRotation = useMemo(() => normalToEulerXYZ(v3), [v3]);

  return (
    <Canvas camera={{ position: [bound * 1.8, bound * 1.6, bound * 2.2], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <OrbitControls enablePan={false} />

      <axesHelper args={[bound]} />

      {/* Reflection plane */}
      <mesh rotation={planeRotation}>
        <planeGeometry args={[bound * 1.6, bound * 1.6]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.28} side={2} />
      </mesh>

      {/* x (blue) */}
      <Arrow start={[0, 0, 0]} end={x3} color="#3b82f6" />
      {/* v (amber) — scaled to bound for visibility */}
      <Arrow start={[0, 0, 0]} end={[v3[0] * bound, v3[1] * bound, v3[2] * bound]} color="#f59e0b" />
      {/* H·x (green) */}
      <Arrow start={[0, 0, 0]} end={reflected} color="#22c55e" />
    </Canvas>
  );
}

function Arrow({ start, end, color }) {
  return <Line points={[start, end]} color={color} lineWidth={2} />;
}

function to3(arr) {
  const a = (arr ?? []).slice(0, 3);
  while (a.length < 3) a.push(0);
  return [Number(a[0]) || 0, Number(a[1]) || 0, Number(a[2]) || 0];
}

function normalize(a) {
  const n = Math.hypot(...a);
  if (n < 1e-12) return [1, 0, 0];
  return [a[0] / n, a[1] / n, a[2] / n];
}

/**
 * Compute XYZ Euler rotation that aligns +Z (the default plane normal) with `n`.
 * For the threejs `rotation` prop on a mesh.
 */
function normalToEulerXYZ(n) {
  const zDotN = n[2];
  if (Math.abs(zDotN - 1) < 1e-9) return [0, 0, 0];
  if (Math.abs(zDotN + 1) < 1e-9) return [Math.PI, 0, 0];
  const axis = normalize([-n[1], n[0], 0]); // (0,0,1) × n simplified
  const angle = Math.acos(Math.max(-1, Math.min(1, zDotN)));
  return axisAngleToEulerXYZ(axis, angle);
}

function axisAngleToEulerXYZ(axis, angle) {
  const [x, y, z] = axis;
  const c = Math.cos(angle), s = Math.sin(angle), C = 1 - c;
  const m00 = c + x * x * C;
  const m01 = x * y * C - z * s;
  const m02 = x * z * C + y * s;
  const m11 = c + y * y * C;
  const m12 = y * z * C - x * s;
  const m21 = z * y * C + x * s;
  const m22 = c + z * z * C;

  const ry = Math.asin(Math.max(-1, Math.min(1, m02)));
  let rx, rz;
  if (Math.abs(m02) < 0.99999) {
    rx = Math.atan2(-m12, m22);
    rz = Math.atan2(-m01, m00);
  } else {
    rx = Math.atan2(m21, m11);
    rz = 0;
  }
  return [rx, ry, rz];
}
