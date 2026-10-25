// The one place the lesson code reads the wall clock (keeps components pure and tests able to stub it).
export const nowMs = () => Date.now();
