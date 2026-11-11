/** このビルドに同梱されている教材バージョン。新しい版のアプリが読み込まれたことは、この値で判定する。 */
export const BUNDLED_CONTENT_VERSION = '2026.11.11';

export interface ContentManifest {
  contentVersion: string;
  publishedAt: string;
  syllabusVersion: string;
  notes?: string;
}

/** 「2026.11.2」形式のバージョン比較（数値の区切りごと）。a<b なら負、等しければ0、a>b なら正 */
export function compareVersion(a: string, b: string): number {
  const pa = a.split('.').map((x) => Number.parseInt(x, 10) || 0);
  const pb = b.split('.').map((x) => Number.parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function isValidManifest(x: unknown): x is ContentManifest {
  if (typeof x !== 'object' || x === null) return false;
  const m = x as Record<string, unknown>;
  return typeof m.contentVersion === 'string' && /^\d+(\.\d+)*$/.test(m.contentVersion) && typeof m.publishedAt === 'string' && typeof m.syllabusVersion === 'string';
}

/**
 * 利用者向け教材更新: 公開済みマニフェストを取得し、現在の版と比較する。
 * 失敗した場合は旧データを維持する（呼び出し側は state を変更しない）。
 * GitHubへの書き込みは公開アプリからは行わない（管理者向け更新は docs/UPDATE_GUIDE.md）。
 */
export async function checkUpdate(currentVersion: string, fetcher: typeof fetch = fetch): Promise<{ status: 'up-to-date' | 'available' | 'failed'; manifest?: ContentManifest; message: string }> {
  try {
    const res = await fetcher('./data/manifest.json', { cache: 'no-store' });
    if (!res.ok) return { status: 'failed', message: `マニフェスト取得に失敗しました（HTTP ${res.status}）。現在の教材をそのまま使えます。` };
    const data: unknown = await res.json();
    if (!isValidManifest(data)) return { status: 'failed', message: 'マニフェストの形式が不正なため、更新を中止しました。現在の教材をそのまま使えます。' };
    const cmp = compareVersion(data.contentVersion, currentVersion);
    if (cmp === 0) return { status: 'up-to-date', manifest: data, message: '教材は最新です。' };
    // 公開側が古い（CDN・ブラウザのキャッシュ等）場合に「新しい版があります」と誤表示しない
    if (cmp < 0) return { status: 'up-to-date', manifest: data, message: `このアプリの教材（${currentVersion}）は公開マニフェスト（${data.contentVersion}）以上の版です。` };
    return { status: 'available', manifest: data, message: `新しい教材 ${data.contentVersion}（${data.publishedAt}公開）があります。新しい版のアプリが公開されている場合は再読み込みで反映されます。学習記録は保持されます。` };
  } catch {
    return { status: 'failed', message: '更新確認に失敗しました。現在の教材をそのまま使えます。' };
  }
}
