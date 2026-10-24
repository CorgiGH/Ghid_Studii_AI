// Pass 1: one-token maps. '' -> NULL, SYSDATE & co. -> the fixed clock, USER, MINUS, SELECT UNIQUE, VARCHAR2, CAST AS NUMBER.
import { isSym, isWord, nextSig, prevSig, raw } from './tokens.js'

// `clock` ('YYYY-MM-DD HH24:MI:SS', optional) inlines the fixed time; without it the statement reads the
// engine's ora_clock table through ora_sysdate() / ora_systimestamp().
export function simpleMap(ts, clock) {
  const sysdate = clock ? `TIMESTAMP '${clock}'` : 'ora_sysdate()'
  const systimestamp = clock ? `(TIMESTAMP '${clock}' AT TIME ZONE 'UTC')` : 'ora_systimestamp()'
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const pi = prevSig(ts, i)
    const ni = nextSig(ts, i)
    const afterDot = pi >= 0 && isSym(ts[pi], '.')
    if (x.type === 'string' && x.text === "''") { out.push(raw('NULL')); continue }
    if (x.type === 'word' && !afterDot) {
      const u = x.text.toUpperCase()
      if (u === 'SYSDATE' || u === 'CURRENT_DATE') { out.push(raw(sysdate)); continue }
      if (u === 'SYSTIMESTAMP' || u === 'CURRENT_TIMESTAMP' || u === 'LOCALTIMESTAMP') { out.push(raw(systimestamp)); continue }
      if (u === 'MINUS') { out.push(raw('EXCEPT')); continue }
      if (u === 'UNIQUE' && pi >= 0 && isWord(ts[pi], 'SELECT')) { out.push(raw('DISTINCT')); continue }
      if (u === 'USER' && !(ni >= 0 && isSym(ts[ni], '('))) { out.push(raw("'STUDENT'")); continue }
      if (u === 'VARCHAR2' || u === 'NVARCHAR2') { out.push(raw('VARCHAR')); continue }
      if (u === 'NUMBER' && pi >= 0 && isWord(ts[pi], 'AS')) { out.push(raw('NUMERIC')); continue }
    }
    out.push(x)
  }
  return out
}
