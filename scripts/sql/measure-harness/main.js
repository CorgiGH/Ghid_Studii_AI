// Dev-only page used by scripts/sql/measure-browser.mjs: exposes the real client (and so the real worker bundle) to Puppeteer.
import { getSqlClient } from '../../../src/sql/engine/client.js'

window.__sql = getSqlClient()
window.__ready = true
