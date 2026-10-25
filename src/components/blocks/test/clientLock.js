// One SQL client serves every question of a test. A call on another dataset reboots its worker and cancels whatever is pending,
// so two questions must never use the client at the same time (a Run on one question during the hand-in of another would cancel
// the hidden-data grading). Every use of the client in a test goes through `exclusive`, which runs the tasks one after another.
let tail = Promise.resolve();

export function exclusive(task) {
  const run = tail.then(task, task);
  tail = run.then(() => {}, () => {});
  return run;
}
