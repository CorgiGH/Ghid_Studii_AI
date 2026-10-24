// Clock pass: SYSDATE, CURRENT_DATE, SYSTIMESTAMP, CURRENT_TIMESTAMP, LOCALTIMESTAMP read the fixed clock.
import { isSym, prevSig, raw } from './tokens.js'

// `clock` ('YYYY-MM-DD HH24:MI:SS', optional) inlines the fixed time; without it the statement reads the
// engine's ora_clock table through ora_sysdate() / ora_systimestamp().
export function clockPass(ts, clock) {
  const sysdate = clock ? `TIMESTAMP '${clock}'` : 'ora_sysdate()'
  const systimestamp = clock ? `(TIMESTAMP '${clock}' AT TIME ZONE 'UTC')` : 'ora_systimestamp()'
  return ts.map((x, i) => {
    if (x.type !== 'word') return x
    const pi = prevSig(ts, i)
    if (pi >= 0 && isSym(ts[pi], '.')) return x
    const u = x.text.toUpperCase()
    if (u === 'SYSDATE' || u === 'CURRENT_DATE') return raw(sysdate)
    if (u === 'SYSTIMESTAMP' || u === 'CURRENT_TIMESTAMP' || u === 'LOCALTIMESTAMP') return raw(systimestamp)
    return x
  })
}
