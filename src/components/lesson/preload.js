// Starts loading the block components a lesson screen can use, once the player opens, so the
// next screen's blocks are already there when it slides in (no placeholder flash mid-transition).
// These are the same dynamic imports the block registry makes, so the browser shares the chunks.
const LOADERS = [
  () => import('../blocks/learn/LearnBlock.jsx'),
  () => import('../blocks/definition/DefinitionBlock.jsx'),
  () => import('../blocks/layout/CalloutBlock.jsx'),
  () => import('../blocks/media/CodeBlock.jsx'),
  () => import('../blocks/layout/TableBlock.jsx'),
  () => import('./blocks/ReflectBlock.jsx'),
  () => import('./blocks/McqBlock.jsx'),
  () => import('./blocks/VizBlock.jsx'),
];

let started = false;
export function preloadLessonBlocks() {
  if (started) return;
  started = true;
  for (const load of LOADERS) load().catch(() => { started = false; });
}
