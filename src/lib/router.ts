/**
 * GitHub Pages で動く簡易ハッシュルーター。
 * ルート: #/ （ホーム）, #/lessons, #/lesson/<id>, #/practice, #/cards, #/card/<id>,
 *        #/exam, #/review, #/analysis, #/literacy, #/settings, #/syllabus
 */
export type Route =
  | { name: 'home' }
  | { name: 'lessons' }
  | { name: 'lesson'; id: string }
  | { name: 'practice' }
  | { name: 'cards' }
  | { name: 'card'; id: string }
  | { name: 'exam' }
  | { name: 'review' }
  | { name: 'analysis' }
  | { name: 'literacy' }
  | { name: 'settings' }
  | { name: 'syllabus' };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '');
  const seg = h.split('/').filter(Boolean).map((s) => { try { return decodeURIComponent(s); } catch { return s; } });
  if (seg.length === 0) return { name: 'home' };
  switch (seg[0]) {
    case 'lessons': return { name: 'lessons' };
    case 'lesson': return seg[1] ? { name: 'lesson', id: seg[1] } : { name: 'lessons' };
    case 'practice': return { name: 'practice' };
    case 'cards': return { name: 'cards' };
    case 'card': return seg[1] ? { name: 'card', id: seg[1] } : { name: 'cards' };
    case 'exam': return { name: 'exam' };
    case 'review': return { name: 'review' };
    case 'analysis': return { name: 'analysis' };
    case 'literacy': return { name: 'literacy' };
    case 'settings': return { name: 'settings' };
    case 'syllabus': return { name: 'syllabus' };
    default: return { name: 'home' };
  }
}

export function routeHash(r: Route): string {
  switch (r.name) {
    case 'lesson': return `#/lesson/${encodeURIComponent(r.id)}`;
    case 'card': return `#/card/${encodeURIComponent(r.id)}`;
    default: return `#/${r.name === 'home' ? '' : r.name}`;
  }
}
