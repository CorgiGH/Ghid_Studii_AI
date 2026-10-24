import { lazy } from 'react';

// One list of block loaders: the registry wraps each in lazy(), and the lesson player's
// preload starts the same imports, so a new block type is preloaded without a second list.
export const blockLoaders = {
  'learn':       () => import('./learn/LearnBlock.jsx'),
  'definition':  () => import('./definition/DefinitionBlock.jsx'),
  'think':       () => import('./assessment/ThinkBlock.jsx'),
  'quiz':        () => import('./assessment/QuizBlock.jsx'),
  'code':        () => import('./media/CodeBlock.jsx'),
  'equation':    () => import('./media/EquationBlock.jsx'),
  'callout':     () => import('./layout/CalloutBlock.jsx'),
  'diagram':     () => import('./diagram/DiagramBlock.jsx'),
  'image':       () => import('./media/ImageBlock.jsx'),
  'table':       () => import('./layout/TableBlock.jsx'),
  'list':        () => import('./layout/ListBlock.jsx'),
  // Lecture overlay blocks (filtered by toggle)
  'lecture':       () => import('./lecture/LectureNoteBlock.jsx'),
  'lecture-video': () => import('./lecture/LectureVideoBlock.jsx'),
  'lecture-exam':  () => import('./lecture/LectureExamBlock.jsx'),
  // Interactive blocks
  'animation':      () => import('./interactive/AnimationBlock.jsx'),
  'code-challenge': () => import('./interactive/CodeChallengeBlock.jsx'),
  'terminal':       () => import('./interactive/TerminalBlock.jsx'),
  // Lesson blocks
  'viz':            () => import('../lesson/blocks/VizBlock.jsx'),
  'reflect':        () => import('../lesson/blocks/ReflectBlock.jsx'),
  'mcq':            () => import('../lesson/blocks/McqBlock.jsx'),
};

const registry = Object.fromEntries(
  Object.entries(blockLoaders).map(([type, load]) => [type, lazy(load)]),
);

export default registry;
