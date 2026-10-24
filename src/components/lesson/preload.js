// Starts loading the block components a lesson screen can use, once the player opens, so the
// next screen's blocks are already there when it slides in (no placeholder flash mid-transition).
// The loaders are the registry's own, so a new block type is preloaded without a second list
// and the browser shares the chunks with the lazy() wrappers.
import { blockLoaders } from '../blocks/registry.js';

let started = false;
export function preloadLessonBlocks() {
  if (started) return;
  started = true;
  for (const load of Object.values(blockLoaders)) load().catch(() => { started = false; });
}
