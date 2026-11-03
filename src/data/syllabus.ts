import type { SyllabusNode } from '../types';

// JDLA公式「G検定とは」ページ掲載のシラバス（G2024#6以降適用版）を2026-11-02に確認し（2026-11-03に再確認、変更なし）、
// 大分野→中分野（章）→学習項目の3層に構造化したもの。章ノードに教材・問題を紐づける。
// 出典: https://www.jdla.org/certificate/general/ ／ シラバスPDF: https://www.jdla.org/download-category/syllabus/
export const SYLLABUS_VERIFIED_AT = '2026-11-03';
export const SYLLABUS_VERSION = 'G2024#6以降適用';

const g = (id: string, area: string, chapter: string, title: string, order: number, prerequisites: string[] = []): SyllabusNode => ({
  id, mode: 'g', area, chapter, title, order, prerequisites,
});

export const G_SYLLABUS: SyllabusNode[] = [
  g('g-01', '技術分野', '人工知能とは', '人工知能の定義／人工知能分野で議論される問題', 1),
  g('g-02', '技術分野', '人工知能をめぐる動向', '探索・推論／知識表現とエキスパートシステム／機械学習／ディープラーニング', 2, ['g-01']),
  g('g-03', '技術分野', '機械学習の概要', '教師あり学習／教師なし学習／強化学習／モデルの選択・評価', 3, ['g-02']),
  g('g-04', '技術分野', 'ディープラーニングの概要', 'ニューラルネットワーク／活性化関数／誤差関数／正則化／誤差逆伝播法／最適化手法', 4, ['g-03']),
  g('g-05', '技術分野', 'ディープラーニングの要素技術', '全結合層／畳み込み層／正規化層／プーリング層／スキップ結合／回帰結合層／Attention／オートエンコーダ／データ拡張', 5, ['g-04']),
  g('g-06', '技術分野', 'ディープラーニングの応用例', '画像認識／自然言語処理／音声処理／深層強化学習／データ生成／転移学習・ファインチューニング／マルチモーダル／解釈性／軽量化', 6, ['g-05']),
  g('g-07', '技術分野', 'AIの社会実装に向けて', 'AIプロジェクトの進め方／データの収集・加工・分析・学習', 7, ['g-03']),
  g('g-08', '技術分野', 'AIに必要な数理・統計知識', '確率・統計／情報理論／数理最適化の基礎', 8, ['g-03']),
  g('g-09', '法律・倫理分野', 'AIに関する法律と契約', '個人情報保護法／著作権法／特許法／不正競争防止法／独占禁止法／AI開発委託契約／AIサービス提供契約', 9),
  g('g-10', '法律・倫理分野', 'AI倫理・AIガバナンス', '国内外のガイドライン／プライバシー／公平性／安全性とセキュリティ／悪用／透明性／民主主義／環境保護／労働政策／AIガバナンス', 10, ['g-09']),
];

const l = (id: string, chapter: string, title: string, order: number, prerequisites: string[] = []): SyllabusNode => ({
  id, mode: 'literacy', area: 'AI教養', chapter, title, order, prerequisites,
});

export const LITERACY_SYLLABUS: SyllabusNode[] = [
  l('l-01', 'AIの基本原理', 'AI・機械学習・深層学習／Transformer／Attention／トークン／埋め込み／LLM／学習と推論／ファインチューニング／RAG／マルチモーダル／推論モデル／エージェント', 1),
  l('l-02', '生成AIサービスの活用', '主要サービスの機能・用途・制約・費用・セキュリティ・得意不得意', 2, ['l-01']),
  l('l-03', 'プロンプトエンジニアリング', '指示の明確化／分解／文脈／形式指定／制約／例示／評価基準／構造化出力／ツール利用／インジェクション対策', 3, ['l-01']),
  l('l-04', '業務への応用', '文書・資料作成／調査／データ分析／翻訳／企画／意思決定支援／研究開発／プログラミング／自動化と失敗パターン', 4, ['l-03']),
  l('l-05', 'AIエージェント・開発', 'エージェント構造／ツール呼び出し／API／MCP／権限設計／状態管理／復旧／監査／安全性', 5, ['l-03']),
  l('l-06', '情報の信頼性', 'ハルシネーション／事実確認／出典検証／ベンチマークの読み方／再現性／バイアス／過学習／不確実性／相関と因果', 6, ['l-01']),
  l('l-07', '法律・倫理・社会', '著作権／個人情報／営業秘密／AI法制度／ガバナンス／公平性／説明責任／労働・環境／悪用防止', 7),
];

export const ALL_SYLLABUS: SyllabusNode[] = [...G_SYLLABUS, ...LITERACY_SYLLABUS];
export const syllabusById = (id: string): SyllabusNode | undefined => ALL_SYLLABUS.find((s) => s.id === id);
