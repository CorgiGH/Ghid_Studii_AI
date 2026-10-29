// The lesson stage keeps the leaving screen's height until the scroll to the top is done (0735c17, the BD jolt: a shorter next
// screen shrank the page under the scroll position and the content jumped 224 px). The ML walk found the hold working on every
// other screen change only: the previous change's effect cleanup cleared the height that go() had just set for the next one.
import { describe, it, expect } from 'vitest'
import { holdStageUntilTop } from '../../src/components/lesson/playerLogic.js'

// A window with a scroll position, scroll listeners and timers the test fires by hand.
function fakeWindow(y) {
  const listeners = new Set()
  const timers = new Map()
  let id = 0
  return {
    scrollY: y,
    addEventListener: (type, fn) => { if (type === 'scroll') listeners.add(fn) },
    removeEventListener: (type, fn) => { if (type === 'scroll') listeners.delete(fn) },
    setTimeout: (fn) => { timers.set(++id, fn); return id },
    clearTimeout: (t) => { timers.delete(t) },
    scrollTo(next) { this.scrollY = next; for (const fn of [...listeners]) fn() },
    fireTimers: () => { for (const fn of [...timers.values()]) fn() },
    listening: () => listeners.size,
  }
}
const stageAt = (h) => ({ style: { minHeight: h } })

describe('the stage holds its height until the scroll reaches the top', () => {
  it('holds while the smooth scroll goes up and lets go at the top', () => {
    const win = fakeWindow(937)
    const stage = stageAt('1477px')
    holdStageUntilTop(stage, win)
    win.scrollTo(700)
    win.scrollTo(120)
    expect(stage.style.minHeight).toBe('1477px')
    win.scrollTo(0)
    expect(stage.style.minHeight).toBe('')
    expect(win.listening()).toBe(0)
  })
  it('lets go as soon as the learner scrolls down, or after the timer', () => {
    const win = fakeWindow(900)
    const stage = stageAt('1400px')
    holdStageUntilTop(stage, win)
    win.scrollTo(600)
    win.scrollTo(650)
    expect(stage.style.minHeight).toBe('')
    const win2 = fakeWindow(900)
    const stage2 = stageAt('1400px')
    holdStageUntilTop(stage2, win2)
    win2.fireTimers()
    expect(stage2.style.minHeight).toBe('')
  })
  it('holds nothing when the page is already at the top or no height was set', () => {
    const stage = stageAt('1400px')
    holdStageUntilTop(stage, fakeWindow(0))
    expect(stage.style.minHeight).toBe('')
    expect(holdStageUntilTop(stageAt(''), fakeWindow(500))).toBeUndefined()
  })
  it('the cleanup of one screen change never clears the height go() set for the next one', () => {
    const win = fakeWindow(937)
    const stage = stageAt('1000px')
    const cleanup = holdStageUntilTop(stage, win) // screen 1 -> 2, the learner has not reached the top yet
    stage.style.minHeight = '1477px' // go(3): the learner presses Continue again, scrolled down
    cleanup() // React runs the effect cleanup of the change to 2 before the effect of the change to 3
    expect(stage.style.minHeight).toBe('1477px')
    expect(win.listening()).toBe(0)
    holdStageUntilTop(stage, win) // the change to 3 holds as well
    win.scrollTo(500)
    expect(stage.style.minHeight).toBe('1477px')
    win.scrollTo(0)
    expect(stage.style.minHeight).toBe('')
  })
})
