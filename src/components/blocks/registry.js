import { lazy } from 'react';

const registry = {
  'learn':       lazy(() => import('./learn/LearnBlock.jsx')),
  'definition':  lazy(() => import('./definition/DefinitionBlock.jsx')),
  'think':       lazy(() => import('./assessment/ThinkBlock.jsx')),
  'quiz':        lazy(() => import('./assessment/QuizBlock.jsx')),
  'code':        lazy(() => import('./media/CodeBlock.jsx')),
  'equation':    lazy(() => import('./media/EquationBlock.jsx')),
  'callout':     lazy(() => import('./layout/CalloutBlock.jsx')),
  'diagram':     lazy(() => import('./diagram/DiagramBlock.jsx')),
  'image':       lazy(() => import('./media/ImageBlock.jsx')),
  'table':       lazy(() => import('./layout/TableBlock.jsx')),
  'list':        lazy(() => import('./layout/ListBlock.jsx')),
  // Lecture overlay blocks (filtered by toggle)
  'lecture':       lazy(() => import('./lecture/LectureNoteBlock.jsx')),
  'lecture-video': lazy(() => import('./lecture/LectureVideoBlock.jsx')),
  'lecture-exam':  lazy(() => import('./lecture/LectureExamBlock.jsx')),
  // Interactive blocks
  'animation':      lazy(() => import('./interactive/AnimationBlock.jsx')),
  'code-challenge': lazy(() => import('./interactive/CodeChallengeBlock.jsx')),
  'terminal':       lazy(() => import('./interactive/TerminalBlock.jsx')),
  // Lesson blocks
  'viz':            lazy(() => import('../lesson/blocks/VizBlock.jsx')),
  'reflect':        lazy(() => import('../lesson/blocks/ReflectBlock.jsx')),
  'mcq':            lazy(() => import('../lesson/blocks/McqBlock.jsx')),
};

export default registry;
