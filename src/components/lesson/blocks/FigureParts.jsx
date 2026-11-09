// The two parts that are not text: a picture (`figure`) and a menu that opens other screens (`cardlinks`). Shapes in guideSpec.js and
// figureSvg.js. Kept apart from GuideParts so a question block can draw a figure without loading the formula code.
import React, { useId, useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { sanitizeSvg, svgOf } from './figureSvg.js';
import { useLessonNav } from '../LessonNav.js';

const html = (s) => ({ __html: formatMarkdown(s) });

// A picture: the figure's SVG re-written by the sanitiser (figureSvg.js), its alt text as the label, an optional caption under it
// (formatted like any lesson line, so a symbol in it is drawn as math). Its ids get a prefix of its own (useId), so another figure
// on the page never takes its arrowheads. A figure that fails the checks draws nothing (the validator stops it before it ships).
export function Figure({ figure }) {
  const { t, lang } = useApp();
  const uid = useId();
  const alt = t(figure.alt.en, figure.alt.ro);
  const svg = useMemo(() => sanitizeSvg(svgOf(figure, lang), alt, `fig${uid}`), [figure, lang, alt, uid]);
  if (!svg) return null;
  return (
    <figure className="lf-fig" data-testid="figure">
      <div className="lf-fig-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      {figure.caption && <figcaption className="lf-fig-caption" dangerouslySetInnerHTML={html(t(figure.caption.en, figure.caption.ro))} />}
    </figure>
  );
}

// A menu: each line opens the screen that holds its step id. Without the player around it, plain lines.
export function CardLinks({ links }) {
  const { t } = useApp();
  const nav = useLessonNav();
  return (
    <ul className="ch-cardlinks" data-testid="cardlinks">
      {links.map((l, i) => (
        <li key={i}>
          {nav ? (
            <button type="button" className="ch-cardlink" data-testid="cardlink" data-step={l.step} onClick={() => nav.goToStep(l.step)}>
              <span className="ch-cardlink-text" dangerouslySetInnerHTML={html(t(l.text.en, l.text.ro))} />
              <svg className="ch-cardlink-arrow" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ) : <span className="ch-cardlink-text" dangerouslySetInnerHTML={html(t(l.text.en, l.text.ro))} />}
        </li>
      ))}
    </ul>
  );
}
