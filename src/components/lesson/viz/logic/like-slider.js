import { likeTrace, likeTokens } from './common.js';

export const likeSteps = likeTrace;
export { likeTokens };

export function likeSlider({ pattern, values }) {
  return { tokens: likeTokens(pattern), traces: values.map(v => likeTrace(pattern, v)), count: values.length + 1 };
}
