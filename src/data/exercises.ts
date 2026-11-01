import type { Exercise, ModelInfo } from '../types';

const V = '2026-11-02';
const JDLA = { title: 'JDLA G検定 公式ページ（シラバス）', url: 'https://www.jdla.org/certificate/general/' };
const OWASP_LLM = { title: 'OWASP Top 10 for LLM Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' };
type P = Partial<Exercise> & Pick<Exercise, 'id' | 'syllabusId' | 'title' | 'background' | 'goal' | 'constraints' | 'steps' | 'rubric' | 'modelThinking' | 'failureExample' | 'improvementExample'>;
const mk = (p: P): Exercise => ({ mode: 'literacy', sources: [JDLA], version: 1, status: 'published', verifiedAt: V, ...p });

export const EXERCISES: Exercise[] = [
  mk({
    id: 'ex-01', syllabusId: 'l-03', title: '不適切なプロンプトを改善する',
    background: '「いい感じの報告書を書いて」という指示で、期待と違う出力が返ってきた場面を想定します。',
    goal: '目的・文脈・形式・制約・評価基準を含む指示に書き換え、改善前後を比較できるようにする。',
    constraints: ['機密情報は含めない', '出力形式を明示する', '不明点は質問させる指示を入れる'],
    steps: ['元の指示の問題点を列挙する', '5要素を補って書き換える', '同じ課題で両方を実行し差分を記録する', 'ルーブリックで自己評価する'],
    rubric: ['目的と読者が明示されている', '出力形式と分量が指定されている', '制約と禁止事項がある', '不明点の扱いが指定されている', '改善前後の差分が記録されている'],
    modelThinking: '曖昧さの除去が本質。情報が足りない部分は推測で埋めず、AIに質問させるか、仮定を明示させる。',
    failureExample: '「もっと詳しく」とだけ追加し、形式も基準もないまま長文を生成させる。',
    improvementExample: '読者・目的・章立て・字数・根拠の示し方を指定し、不明点は冒頭で質問させる。',
  }),
  mk({
    id: 'ex-02', syllabusId: 'l-06', title: 'AIの誤回答を発見する',
    background: 'AIが自信を持って提示した説明文に、数値・日付・固有名詞の誤りが混ざっている想定で検証します。',
    goal: '主張を分解し、検証可能な要素ごとに一次資料で確認する手順を設計する。',
    constraints: ['二次情報の転載を裏付けとして数えない', '確認できない要素は未確認と明記する'],
    steps: ['主張を検証可能な単位に分解する', '各要素の一次資料を特定する', '照合結果を「確認済み／誤り／未確認」に分類する', '誤りの種類（数値・固有名詞・因果など）を記録する'],
    rubric: ['主張が要素に分解されている', '一次資料で照合している', '未確認が未確認のまま残されている', '誤りの分類がある'],
    modelThinking: '流暢さは手がかりにならない。検証コストは要素ごとに違うため、影響の大きい主張から確認する。',
    failureExample: '検索結果の上位3件が同じ内容だったので正しいと判断する（同一転載の可能性を無視）。',
    improvementExample: '元の発表資料に遡り、数値と発表日を直接確認する。',
  }),
  mk({
    id: 'ex-03', syllabusId: 'l-05', title: 'AIエージェントの権限を設計する',
    background: 'メール整理と予定調整を行うエージェントを業務導入する想定です。',
    goal: '操作を読み取り／書き込み（可逆）／書き込み（不可逆）に分類し、承認が必要な操作を定義する。',
    constraints: ['送信・削除・購入は不可逆として扱う', 'ログに残らない操作を作らない'],
    steps: ['エージェントの操作を列挙する', '可逆性と影響範囲で分類する', '承認フローと停止方法を決める', '異常時の記録と報告方法を決める'],
    rubric: ['操作が網羅的に列挙されている', '不可逆操作に承認がある', '緊急停止の方法がある', 'ログと監査の方法がある'],
    modelThinking: '権限設計は利便性ではなく事故の上限を決める作業。最小権限から始め、必要性が確認できた範囲だけ広げる。',
    failureExample: '効率のためメール送信と削除を無承認で許可する。',
    improvementExample: '下書き作成までは自動、送信は承認、削除は二重確認とする。',
    sources: [JDLA, OWASP_LLM],
  }),
  mk({
    id: 'ex-04', syllabusId: 'l-02', title: '同一課題に適したモデルを選ぶ',
    background: '長文要約、コード生成、画像理解の3タスクについて、使えるモデルが複数ある想定です。',
    goal: 'タスクごとに評価基準を決め、小規模な実測で選択を根拠づける。',
    constraints: ['ベンチマークの数字だけで決めない', '評価日時とバージョンを記録する'],
    steps: ['タスクごとに基準（正確さ・速度・コスト・日本語）を決める', '同じ入力で各モデルを試す', '結果を表に記録する', '採用理由と再評価の条件を書く'],
    rubric: ['基準がタスクごとに決まっている', '同一条件で実測している', '日時とバージョンの記録がある', '再評価条件がある'],
    modelThinking: '「最強のモデル」ではなく「このタスク・この条件での最適」を選ぶ。条件が変われば結論も変わる。',
    failureExample: '総合ベンチマーク1位のモデルを全タスクに採用する。',
    improvementExample: '要約は日本語の実測、コードはテスト通過率で選び分ける。',
  }),
  mk({
    id: 'ex-05', syllabusId: 'l-04', title: 'AIを使った業務手順を設計する',
    background: '週次報告書の作成（データ集計→下書き→確認→提出）をAIで効率化する想定です。',
    goal: 'AIと人間の担当を工程ごとに分け、検証ポイントと失敗時の代替手順を含む手順書を作る。',
    constraints: ['数値の原典確認を工程に含める', '機密データの扱いを明記する'],
    steps: ['現行手順を工程に分解する', '各工程の担当（AI／人間）を決める', '検証ポイントを置く', '効果を修正工数込みで測る方法を決める'],
    rubric: ['工程分解がある', '検証ポイントがある', '機密の扱いが明記されている', '効果測定が時間だけでなく誤り率を含む'],
    modelThinking: '自動化の単位は工程。全部をAIに任せるのではなく、検証が安い工程から任せる。',
    failureExample: '集計数値をAIに作らせ、確認工程を省く。',
    improvementExample: '集計は表計算で行い、AIは文章化のみ。数値は提出前に元データと突合する。',
  }),
  mk({
    id: 'ex-06', syllabusId: 'l-03', title: 'セキュリティ上の問題を特定する',
    background: '社内文書を読み込ませて質問に答える仕組みを設計する場面を想定します。',
    goal: 'プロンプトインジェクションと情報漏えいのリスクを特定し、対策を設計する。',
    constraints: ['外部文書は信頼できない入力として扱う', '権限のない文書を検索対象に含めない'],
    steps: ['データの流れを図にする', '攻撃者が細工できる入力を列挙する', '漏えいし得る情報を列挙する', '対策（権限分離・出力検証・ログ）を対応づける'],
    rubric: ['信頼できない入力が特定されている', '権限と検索範囲が対応している', '対策がリスクと対応している', '残るリスクが明記されている'],
    modelThinking: '文書内の指示文はデータであり命令ではない、という原則をシステム全体で守る。',
    failureExample: '取り込んだ文書の指示にAIが従うことを仕様として許す。',
    improvementExample: '文書は引用専用とし、システム指示と分離。出力前に個人情報パターンを検査する。',
    sources: [JDLA, OWASP_LLM],
  }),
];

// モデル比較は「観点」の提示を目的とし、数値は推測で埋めない。個別の料金・機能は確認時点の公式情報で更新する。
export const MODEL_INFOS: ModelInfo[] = [
  {
    id: 'mi-chatgpt', name: 'ChatGPT（GPT系モデル）', vendor: 'OpenAI', asOf: V,
    source: { title: 'OpenAI 公式サイト', url: 'https://openai.com/' },
    strengths: '文章生成・推論・プログラミング・ツール利用など幅広い用途に対応する代表的なサービス。',
    limits: 'モデルとプランにより利用上限・機能が異なる。出力の正確さは用途ごとの検証が必要。',
    pricingNote: '料金・プランは変更されるため公式ページで確認（本表では数値を固定しない）。',
    privacyNote: 'データ利用条件はプラン（個人向け／法人向け）で異なる。契約時点の公式条件を確認すること。',
    bestFor: '汎用的な文章・分析・開発支援全般の第一候補として、自タスクで実測して判断する。',
  },
  {
    id: 'mi-claude', name: 'Claude', vendor: 'Anthropic', asOf: V,
    source: { title: 'Anthropic 公式サイト', url: 'https://www.anthropic.com/' },
    strengths: '長文処理と文章作成、コード生成に強みを持つとされるサービス。',
    limits: 'モデルとプランにより利用上限・機能が異なる。評価はバージョンと日時に依存する。',
    pricingNote: '料金・プランは変更されるため公式ページで確認（本表では数値を固定しない）。',
    privacyNote: 'データ利用条件はプランで異なる。契約時点の公式条件を確認すること。',
    bestFor: '長文資料の読解・作成を含むタスクで、自タスクで実測して判断する。',
  },
  {
    id: 'mi-gemini', name: 'Gemini', vendor: 'Google', asOf: V,
    source: { title: 'Google Gemini 公式サイト', url: 'https://gemini.google.com/' },
    strengths: 'マルチモーダル処理とGoogleサービスとの連携に特徴があるサービス。',
    limits: 'モデルとプランにより利用上限・機能が異なる。',
    pricingNote: '料金・プランは変更されるため公式ページで確認（本表では数値を固定しない）。',
    privacyNote: 'データ利用条件はアカウント種別とプランで異なる。公式条件を確認すること。',
    bestFor: '画像を含む資料処理や検索と組み合わせる用途で実測して判断する。',
  },
  {
    id: 'mi-copilot', name: 'GitHub Copilot', vendor: 'GitHub / Microsoft', asOf: V,
    source: { title: 'GitHub Copilot 公式ページ', url: 'https://github.com/features/copilot' },
    strengths: 'エディタ内でのコード補完と開発支援に特化したサービス。',
    limits: '生成コードの正確さとライセンス面の確認は利用者側のレビューが前提。',
    pricingNote: '料金・プランは変更されるため公式ページで確認（本表では数値を固定しない）。',
    privacyNote: '組織のポリシー設定によりコード送信範囲を制御できる場合がある。公式条件を確認すること。',
    bestFor: '日常的なコーディング支援。生成コードは必ずテストとレビューを通す。',
  },
];
