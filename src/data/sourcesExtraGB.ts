import type { SourceRef } from '../types';

// gExtraQuestions3.ts（q-g07〜g10 の追加問題）のうち出典が1件（JDLAのみ）だった問題への追加出典。
// 2026-11-11 作成。URLは原則として repo 内で既出の一次情報プール（questionSources.ts 等）から選定し、
// プールに適合するものが無い場合に限って新規の原著・公式資料を追加した（新規URLは全て curl で HTTP 200 を確認済み）。
// 既存出典（JDLA公式ページ）とは重複させていない。
const GL: SourceRef = { title: '総務省・経済産業省「AI事業者ガイドライン」掲載ページ', url: 'https://www.soumu.go.jp/main_sosiki/kenkyu/ai_network/02ryutsu20_04000019.html' };
const RMF: SourceRef = { title: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' };
const NIST_HB: SourceRef = { title: 'NIST/SEMATECH e-Handbook of Statistical Methods', url: 'https://www.itl.nist.gov/div898/handbook/' };
const SK_EVAL: SourceRef = { title: 'scikit-learn: Model evaluation（評価指標の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' };
const SK_PRE: SourceRef = { title: 'scikit-learn: Preprocessing data（公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/preprocessing.html' };
const SK_DEC: SourceRef = { title: 'scikit-learn: Decomposition（PCA等の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/decomposition.html' };
const SK_NN: SourceRef = { title: 'scikit-learn: Neural network models（公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/neural_networks_supervised.html' };
const PT_SGD: SourceRef = { title: 'PyTorch: torch.optim.SGD（公式ドキュメント、学習率パラメータの定義）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.optim.SGD.html' };
const OECD: SourceRef = { title: 'OECD AI Principles', url: 'https://www.oecd.org/en/topics/sub-issues/ai-principles.html' };
const UCPA: SourceRef = { title: 'e-Gov法令検索「不正競争防止法」', url: 'https://laws.e-gov.go.jp/law/405AC0000000047' };
const KEIHYO: SourceRef = { title: 'e-Gov法令検索「不当景品類及び不当表示防止法」', url: 'https://laws.e-gov.go.jp/law/337AC0000000134' };
const MINPO: SourceRef = { title: 'e-Gov法令検索「民法」', url: 'https://laws.e-gov.go.jp/law/129AC0000000089' };
const BUNKA: SourceRef = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const PPC: SourceRef = { title: '個人情報保護委員会', url: 'https://www.ppc.go.jp/' };
const CAO: SourceRef = { title: '内閣府「人間中心のAI社会原則」', url: 'https://www.cas.go.jp/jp/seisaku/jinkouchinou/pdf/aigensoku.pdf' };
const EU_AI: SourceRef = { title: 'European Commission: Regulatory framework on AI', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' };
// ↓ 新規追加（HTTP 200 確認済み）
const MLFLOW_REG: SourceRef = { title: 'MLflow Model Registry（公式ドキュメント）', url: 'https://mlflow.org/docs/latest/ml/model-registry/' };
const MLFLOW_TRK: SourceRef = { title: 'MLflow Tracking（公式ドキュメント）', url: 'https://mlflow.org/docs/latest/ml/tracking/' };
const SCULLEY: SourceRef = { title: 'Sculley et al. "Hidden Technical Debt in Machine Learning Systems" (NeurIPS 2015)', url: 'https://proceedings.neurips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf' };
const MODEL_CARDS: SourceRef = { title: 'Mitchell et al. "Model Cards for Model Reporting" (arXiv:1810.03993)', url: 'https://arxiv.org/abs/1810.03993' };
const FEAST: SourceRef = { title: 'Feast（特徴量ストア）公式ドキュメント', url: 'https://docs.feast.dev/' };
const VERTEX: SourceRef = { title: 'Google Cloud Vertex AI: Predictions overview（公式ドキュメント）', url: 'https://cloud.google.com/vertex-ai/docs/predictions/overview' };
const NUMPY_MATMUL: SourceRef = { title: 'NumPy: numpy.matmul（公式ドキュメント）', url: 'https://numpy.org/doc/stable/reference/generated/numpy.matmul.html' };
const SK_COS: SourceRef = { title: 'scikit-learn: cosine_similarity（公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html' };
const GPL: SourceRef = { title: 'GNU General Public License v3（公式テキスト）', url: 'https://www.gnu.org/licenses/gpl-3.0.html' };
const PROVIDER_ACT: SourceRef = { title: 'e-Gov法令検索「特定電気通信役務提供者の損害賠償責任の制限及び発信者情報の開示に関する法律」', url: 'https://laws.e-gov.go.jp/law/413AC0000000137' };
const SP1270: SourceRef = { title: 'NIST SP 1270 "Towards a Standard for Identifying and Managing Bias in Artificial Intelligence"', url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1270.pdf' };
const SPEC_GAMING: SourceRef = { title: 'Krakovna et al. "Specification gaming: the flip side of AI ingenuity" (DeepMind, 2020)', url: 'https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/' };
const C2PA: SourceRef = { title: 'C2PA Specification (Content Provenance and Authenticity)', url: 'https://spec.c2pa.org/specifications/specifications/2.1/index.html' };
const DWORK_ROTH: SourceRef = { title: 'Dwork & Roth "The Algorithmic Foundations of Differential Privacy" (2014, 原著)', url: 'https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf' };
const FEDAVG: SourceRef = { title: 'McMahan et al. "Communication-Efficient Learning of Deep Networks from Decentralized Data" (arXiv:1602.05629)', url: 'https://arxiv.org/abs/1602.05629' };
const AIID: SourceRef = { title: 'AI Incident Database', url: 'https://incidentdatabase.ai/' };
const MEXT_GL: SourceRef = { title: '文部科学省「初等中等教育段階における生成AIの利活用に関するガイドライン（Ver.2.0）」', url: 'https://www.mext.go.jp/content/20241226-mxt_shuukyo02-000030823_001.pdf' };

export const SOURCES_EXTRA_GB: Record<string, SourceRef[]> = {
  // ===== g-07 AIの社会実装に向けて（30問） =====
  'q-g07-101': [RMF], // MLOps：ライフサイクル全体の管理・監視は AI RMF の GOVERN/MANAGE の対象
  'q-g07-102': [MLFLOW_REG], // モデルレジストリ：版管理・来歴・ステージ管理の公式ドキュメント
  'q-g07-103': [RMF], // カナリアリリース：段階的デプロイによるリスク管理（MANAGE）
  'q-g07-104': [RMF], // コンセプトドリフト：運用後のドリフト監視（MEASURE/MANAGE）
  'q-g07-105': [GL], // フィードバックループ：データの偏りの増幅と運用時の配慮
  'q-g07-106': [GL], // データセントリックAI：学習データの品質確保・改善の考え方
  'q-g07-107': [RMF], // 合成データ：プライバシー・安全性の観点でのデータ活用
  'q-g07-108': [GL], // アノテーション品質：学習データの正確性・品質管理
  'q-g07-109': [RMF], // 入力バリデーション：妥当性・信頼性（validity & reliability）の確保
  'q-g07-110': [SCULLEY], // 技術的負債：MLシステムの技術的負債を論じた原著
  'q-g07-111': [GL], // フェイルセーフ：安全性の原則と異常時への備え
  'q-g07-112': [GL], // エッジ推論：AIシステムの提供形態・運用設計の検討事項
  'q-g07-113': [GL], // 外部API利用：提供者・利用者の役割と規約確認の考え方
  'q-g07-114': [RMF], // データリネージ：データの来歴（provenance）の把握は MAP の対象
  'q-g07-115': [FEAST], // 特徴量ストア：特徴量の一元管理と学習/推論での再利用の公式ドキュメント
  'q-g07-116': [VERTEX], // バッチ/オンライン推論：公式ドキュメントが両方式を区別して定義
  'q-g07-117': [GL], // 推論コスト管理：運用段階での継続的な改善・最適化
  'q-g07-118': [GL], // 現場への定着：リテラシー向上・利用者教育の考え方
  'q-g07-119': [RMF], // ベンダーロックイン：第三者・サプライチェーンのリスク管理（GOVERN 6）
  'q-g07-120': [GL], // ラベルノイズ：学習データの正確性・品質管理
  'q-g07-121': [SK_EVAL], // 交差検証：公式ドキュメントの評価・交差検証の章
  'q-g07-122': [MLFLOW_TRK], // 実験管理：実験の記録・再現・比較の公式ドキュメント
  'q-g07-123': [GL], // サンプリングバイアス：学習データの代表性・偏りへの配慮
  'q-g07-124': [RMF], // ラベル遅延時の監視：代替指標を含む継続的モニタリング（MEASURE/MANAGE）
  'q-g07-125': [MODEL_CARDS], // モデルカード：用途・評価・限界の文書化を提案した原著
  // q-g07-126 は本来 経済産業省「AI・データの利用に関する契約ガイドライン」自体が一次情報だが、
  // meti.go.jp は本環境から HTTP 200 を確認できなかったため、同省が共同発行する本ガイドラインで代替した。
  'q-g07-126': [GL], // AI・データ契約ガイドライン：経産省のAI関連指針として論点整理の土台
  'q-g07-127': [RMF], // 終了・撤退：ライフサイクル終端（廃止・移行）を含む管理（MANAGE）
  'q-g07-128': [BUNKA], // Webデータ収集：学習利用と著作権・権利確認の考え方
  'q-g07-129': [PPC], // データ最小化：個人情報の適正な取扱いの所管機関
  'q-g07-130': [GL], // 業務可視化：開発段階における適用検討の進め方
  // ===== g-08 AIに必要な数理・統計知識（30問） =====
  'q-g08-101': [NIST_HB], // ベイズの定理による事後確率の計算
  'q-g08-102': [NIST_HB], // 確率の加法定理
  'q-g08-103': [NIST_HB], // 期待値の定義と計算
  'q-g08-104': [NIST_HB], // 分散の性質 Var(aX+b)=a^2 Var(X)
  'q-g08-105': [NIST_HB], // 独立な確率変数の和の分散
  'q-g08-106': [NIST_HB], // 二項分布の期待値 np
  'q-g08-107': [NIST_HB], // 離散確率の数え上げ
  'q-g08-108': [NIST_HB], // ポアソン分布の定義と性質
  'q-g08-109': [NIST_HB], // 回帰係数の解釈（線形回帰の章）
  'q-g08-110': [NIST_HB], // 決定係数 R^2 の定義
  'q-g08-111': [NIST_HB], // ピアソン相関係数の性質と限界
  'q-g08-112': [NIST_HB], // 多重共線性（回帰診断の文脈）
  'q-g08-113': [NIST_HB], // 片側検定と両側検定（仮説検定の章）
  'q-g08-114': [NIST_HB], // 多重比較と第一種の過誤の累積
  'q-g08-115': [NIST_HB], // 標準誤差の定義
  'q-g08-116': [NIST_HB], // 不偏分散（n-1 で割る理由）
  'q-g08-117': [NIST_HB], // 中央値の定義
  'q-g08-118': [NIST_HB], // 四分位範囲の定義
  'q-g08-119': [NIST_HB], // 確率変数の定義
  'q-g08-120': [NIST_HB], // 連続型確率変数と確率密度
  'q-g08-121': [PT_SGD], // 学習率：SGD の lr パラメータの公式定義
  'q-g08-122': [SK_NN], // 局所最適解：MLP の損失関数の非凸性に関する公式ドキュメントの記述
  'q-g08-123': [NUMPY_MATMUL], // 行列とベクトルの積の公式定義
  'q-g08-124': [SK_COS], // コサイン類似度の公式定義
  'q-g08-125': [SK_PRE], // L2ノルム：正規化（normalize）の公式定義
  'q-g08-126': [SK_DEC], // 固有値・固有ベクトル：PCA の固有分解に関する公式ドキュメント
  'q-g08-127': [SK_EVAL], // 対数尤度：log loss（負の対数尤度）の公式定義
  'q-g08-128': [NIST_HB], // スピアマンの順位相関係数
  'q-g08-129': [NIST_HB], // 歪度の定義
  'q-g08-130': [NIST_HB], // 条件付き確率の定義
  // ===== g-09 AIに関する法律と契約（8問） =====
  'q-g09-109': [UCPA], // 周知表示混同惹起行為は不正競争防止法の規制
  'q-g09-110': [UCPA], // 限定提供データは不正競争防止法の制度
  'q-g09-116': [KEIHYO], // ステマ規制は景品表示法の不当表示
  'q-g09-117': [MINPO], // 契約不適合責任は民法の定め
  'q-g09-119': [GPL], // コピーレフト：GPL 公式テキストの条件
  'q-g09-123': [UCPA], // ドメイン名の不正取得は不正競争防止法の対象
  'q-g09-126': [UCPA], // NDAの例外：営業秘密の要件（公知情報は営業秘密に当たらない）
  'q-g09-130': [PROVIDER_ACT], // 発信者情報開示は同法の定める仕組み
  // ===== g-10 AI倫理・AIガバナンス（21問） =====
  'q-g10-101': [SP1270], // 人口統計的パリティ：バイアス・公平性指標の標準化文書
  'q-g10-102': [SP1270], // 公平性指標の両立困難：同文書の公平性定義・トレードオフの整理
  'q-g10-104': [OECD], // AIアライメント：人間中心の価値に沿うAIという原則
  'q-g10-105': [SPEC_GAMING], // 報酬ハッキング：仕様ゲーミングの事例を集めた原著解説
  'q-g10-106': [CAO], // フィルターバブル：人間中心の情報環境・社会原則の文脈
  'q-g10-107': [KEIHYO], // AIウォッシング：誤認させる表示は景品表示法の問題になり得る
  'q-g10-109': [C2PA], // 来歴管理：C2PA 仕様（出所・真正性の標準）
  'q-g10-110': [DWORK_ROTH], // 差分プライバシー：定義と理論の原著
  'q-g10-111': [FEDAVG], // 連合学習：分散データでの学習手法の原著
  'q-g10-115': [RMF], // AI監査：GOVERN における監査・評価の考え方
  'q-g10-116': [AIID], // インシデント共有：公的なインシデントデータベース
  'q-g10-117': [GL], // 自動化バイアス：人間の関与と過信への配慮
  'q-g10-118': [OECD], // AIデバイド：包摂的成長と格差是正の原則
  'q-g10-119': [EU_AI], // アルゴリズミック・マネジメント：労働者管理AIは EU AI法の高リスク用途
  'q-g10-120': [RMF], // AIセーフティ：信頼できるAIの特性としての安全性
  'q-g10-122': [MEXT_GL], // 学校教育の生成AIガイドライン本体
  'q-g10-125': [OECD], // 責任のギャップ：説明責任（accountability）の原則
  'q-g10-127': [RMF], // 継続性リスク：第三者サービスのリスク管理（GOVERN 6）
  'q-g10-128': [RMF], // デュアルユース：悪用・二重用途を含むリスクの想定
  'q-g10-129': [GL], // 過度な依存：利用者への注意喚起と適切な関与の考え方
  'q-g10-130': [RMF], // ガバナンス体制：GOVERN 機能（責任・体制・見直し）
};
