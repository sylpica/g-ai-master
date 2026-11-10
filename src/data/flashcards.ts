import type { Flashcard } from '../types';

// 単語帳（フラッシュカード）のデータ。
// 収録方針：既存の教材（lessons.ts）と問題（questions.ts）に実際に現れる重要用語だけを収録し、
// 無関係な語や重複概念での水増しはしない。定義は教材の記述に忠実に短くまとめる。
// 出典は対応する教材・問題の sources から最も関連するものを継承し、検証日は全件 2026-11-11。
// conceptId は関連する問題の conceptId（=問題ID）に合わせ、対応問題がない概念では card の id 自体を使う。
//
// 逆向き（意味→用語）では reversePrompt を表面にする。用語名・略号・別名が答えとして漏れないよう、
// 定義をそのまま使わず、特徴・用途・対比の表現で書き直している。

const JDLA = { title: 'JDLA G検定 公式ページ（シラバス）', url: 'https://www.jdla.org/certificate/general/' };
const SEP_AI = { title: 'Stanford Encyclopedia of Philosophy: Artificial Intelligence', url: 'https://plato.stanford.edu/entries/artificial-intelligence/' };
const SEP_TT = { title: 'Stanford Encyclopedia of Philosophy: The Turing Test', url: 'https://plato.stanford.edu/entries/turing-test/' };
const SEP_FP = { title: 'Stanford Encyclopedia of Philosophy: The Frame Problem', url: 'https://plato.stanford.edu/entries/frame-problem/' };
const SEP_CR = { title: 'Stanford Encyclopedia of Philosophy: The Chinese Room', url: 'https://plato.stanford.edu/entries/chinese-room/' };
const SK_UG = { title: 'scikit-learn User Guide（機械学習手法の公式ドキュメント）', url: 'https://scikit-learn.org/stable/user_guide.html' };
const SK_CLU = { title: 'scikit-learn: Clustering（公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/clustering.html' };
const SK_EVAL = { title: 'scikit-learn: Model evaluation（評価指標の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' };
const SK_NN = { title: 'scikit-learn: Neural network models（公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/neural_networks_supervised.html' };
const SK_DEC = { title: 'scikit-learn: Decomposition（PCA等の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/decomposition.html' };
const SB_RL = { title: "Sutton & Barto 'Reinforcement Learning: An Introduction' 2nd ed.（原著テクスト、Stanford課程サイト掲載PDF）", url: 'https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf' };
const DROPOUT = { title: 'Srivastava et al. "Dropout" (JMLR 15, 2014)', url: 'https://www.jmlr.org/papers/v15/srivastava14a.html' };
const ADAM = { title: 'Kingma & Ba "Adam" (arXiv:1412.6980)', url: 'https://arxiv.org/abs/1412.6980' };
const ATTN = { title: 'Vaswani et al. "Attention Is All You Need" (arXiv:1706.03762)', url: 'https://arxiv.org/abs/1706.03762' };
const RESNET = { title: 'He et al. "Deep Residual Learning" (arXiv:1512.03385)', url: 'https://arxiv.org/abs/1512.03385' };
const PT_MAXPOOL = { title: 'PyTorch: torch.nn.MaxPool2d（公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.MaxPool2d.html' };
const PT_CONV = { title: 'PyTorch: torch.nn.Conv2d（公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html' };
const PT_LSTM = { title: 'PyTorch: torch.nn.LSTM（公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.LSTM.html' };
const AE_JMLR = { title: 'Vincent et al. "Extracting and Composing Robust Features with Denoising Autoencoders"（JMLR派生版含む関連原著）', url: 'https://www.jmlr.org/papers/v11/vincent10a.html' };
const BN = { title: 'Ioffe & Szegedy "Batch Normalization" (arXiv:1502.03167)', url: 'https://arxiv.org/abs/1502.03167' };
const GAN = { title: 'Goodfellow et al. "Generative Adversarial Nets" (arXiv:1406.2661)', url: 'https://arxiv.org/abs/1406.2661' };
const GRADCAM = { title: 'Selvaraju et al. "Grad-CAM" (arXiv:1610.02391)', url: 'https://arxiv.org/abs/1610.02391' };
const DIFFUSION = { title: 'Ho et al. "Denoising Diffusion Probabilistic Models" (arXiv:2006.11239)', url: 'https://arxiv.org/abs/2006.11239' };
const DISTILL = { title: 'Hinton et al. "Distilling the Knowledge in a Neural Network" (arXiv:1503.02531)', url: 'https://arxiv.org/abs/1503.02531' };
const YOLO = { title: 'Redmon et al. "You Only Look Once" (arXiv:1506.02640)', url: 'https://arxiv.org/abs/1506.02640' };
const PT_QUANT = { title: 'PyTorch: Quantization（公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/quantization.html' };
const PT_TRANSFER = { title: 'PyTorch: Transfer Learning for Computer Vision Tutorial（公式）', url: 'https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html' };
const DQN = { title: 'Mnih et al. "Playing Atari with Deep Reinforcement Learning" (arXiv:1312.5602)', url: 'https://arxiv.org/abs/1312.5602' };
const WORD2VEC = { title: 'Mikolov et al. "Efficient Estimation of Word Representations" (arXiv:1301.3781)', url: 'https://arxiv.org/abs/1301.3781' };
const SHAP = { title: 'Lundberg & Lee "A Unified Approach to Interpreting Model Predictions" (arXiv:1705.07874)', url: 'https://arxiv.org/abs/1705.07874' };
const NIST_HB = { title: 'NIST/SEMATECH e-Handbook of Statistical Methods', url: 'https://www.itl.nist.gov/div898/handbook/' };
const SHANNON = { title: "Shannon 'A Mathematical Theory of Communication' (1948, 原著)", url: 'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf' };
const GL_PAGE = { title: '総務省・経済産業省「AI事業者ガイドライン」掲載ページ', url: 'https://www.soumu.go.jp/main_sosiki/kenkyu/ai_network/02ryutsu20_04000019.html' };
const NIST_RMF = { title: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' };
const BUNKA = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const CHOSAKUKEN = { title: 'e-Gov法令検索「著作権法」', url: 'https://laws.e-gov.go.jp/law/345AC0000000048' };
const KOJIN = { title: 'e-Gov法令検索「個人情報の保護に関する法律」', url: 'https://laws.e-gov.go.jp/law/415AC0000000057' };
const FUSEI = { title: 'e-Gov法令検索「不正競争防止法」', url: 'https://laws.e-gov.go.jp/law/405AC0000000047' };
const TOKKYO = { title: 'e-Gov法令検索「特許法」', url: 'https://laws.e-gov.go.jp/law/334AC0000000121' };
const MINPO = { title: 'e-Gov法令検索「民法」', url: 'https://laws.e-gov.go.jp/law/129AC0000000089' };
const CAO_PRINCIPLES = { title: '内閣府「人間中心のAI社会原則」', url: 'https://www.cas.go.jp/jp/seisaku/jinkouchinou/pdf/aigensoku.pdf' };
const OECD_AI = { title: 'OECD AI Principles', url: 'https://www.oecd.org/en/topics/sub-issues/ai-principles.html' };
const EU_AI = { title: 'European Commission: Regulatory framework on AI', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' };
const TOKENIZER = { title: 'OpenAI Tokenizer（公式ツール）', url: 'https://platform.openai.com/tokenizer' };
const RAG_PAPER = { title: 'Lewis et al. "Retrieval-Augmented Generation" (arXiv:2005.11401)', url: 'https://arxiv.org/abs/2005.11401' };
const CTX_DOC = { title: 'Claude ドキュメント：Context windows', url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows' };
const OWASP = { title: 'OWASP Top 10 for LLM Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' };
const STRUCT_OUT = { title: 'OpenAI: Structured outputs（公式ガイド）', url: 'https://platform.openai.com/docs/guides/structured-outputs' };
const PROMPT_GUIDE = { title: 'OpenAI API ドキュメント：Prompt engineering', url: 'https://developers.openai.com/api/docs/guides/prompt-engineering' };
const OPENAI_MODELS = { title: 'OpenAI API ドキュメント：Models', url: 'https://developers.openai.com/api/docs/models' };
const CLAUDE_MODELS = { title: 'Claude ドキュメント：Models overview', url: 'https://platform.claude.com/docs/en/about-claude/models/overview' };
const GH_SECRET = { title: 'GitHub Docs：About secret scanning', url: 'https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning' };
const MCP_NEWS = { title: 'Anthropic: Introducing the Model Context Protocol（2024-11-25）', url: 'https://www.anthropic.com/news/model-context-protocol' };
const MCP_SPEC = { title: 'Model Context Protocol 仕様（2025-06-18版）', url: 'https://modelcontextprotocol.io/specification/2025-06-18' };
const GPT6CYBER = { title: 'OpenAI: GPT-6 Cyber: Advancing the frontier of aligned cybersecurity agents', url: 'https://openai.com/index/introducing-gpt-6-cyber/' };
const AI_ACT_JP = { title: 'e-Gov法令検索「人工知能関連技術の研究開発及び活用の推進に関する法律」（令和7年法律第53号）', url: 'https://laws.e-gov.go.jp/law/507AC0000000053' };
const AI_PLAN = { title: '内閣府「人工知能基本計画」（令和7年12月23日閣議決定）', url: 'https://www8.cao.go.jp/cstp/ai/ai_plan/aiplan_20251223.pdf' };
const PPC_GENAI = { title: '個人情報保護委員会「生成AIサービスの利用に関する注意喚起等について」', url: 'https://www.ppc.go.jp/news/careful_information/230602_AI_utilize_alert/' };

const V_AT = '2026-11-11';
type C = Omit<Flashcard, 'verifiedAt'>;
const c = (x: C): Flashcard => ({ ...x, verifiedAt: V_AT });

export const FLASHCARDS: Flashcard[] = [
  // ===== g-01 人工知能とは =====
  c({
    id: 'card-g01-01', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-1', term: '人工知能（AI）の定義',
    definition: 'AIに国際的に唯一の公式定義はなく、研究者や文脈によって定義が異なる。知能の計算・推論・学習などを人工的に実現する技術の総称として扱われる。',
    reversePrompt: '国際的に唯一の公式定義が定まっておらず、研究者や文脈によって捉え方が異なることが前提となる、知的な処理を人工的に実現する技術の総称は？',
    confusion: '「定義は国際的に統一されている」は誤り。ディープラーニングはAIの一部であり、AIと同義ではない。',
    lessonId: 'les-g01', questionIds: ['q-g01-1'], sources: [JDLA, SEP_AI], difficulty: 1,
  }),
  c({
    id: 'card-g01-02', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-4', term: '強いAI／弱いAI', aliases: ['汎用人工知能', '特化型AI'],
    definition: '強いAIは人間と同等以上の汎用的な知能、弱いAIは特定タスクに特化した知能を指す区別である。現在の実用AIはすべて弱いAIに分類される。',
    reversePrompt: '汎用的な知能を目指すものと、特定の課題に特化した知能とを分ける区別で、現在の実用システムはすべて後者に分類されるものは？',
    confusion: '計算資源の規模や精度の高さによる区別ではない。特定タスクで人間を上回っても特化型である。',
    lessonId: 'les-g01', questionIds: ['q-g01-4'], sources: [JDLA, SEP_AI], difficulty: 1,
  }),
  c({
    id: 'card-g01-03', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-2', term: 'チューリングテスト',
    definition: '質問者が対話相手を見分けられない（人間と区別できない）場合に、機械に知能があるとみなす判定法の提案である。計算や認識の精度ではなく、対話での区別可能性を基準にする。',
    reversePrompt: '質問者が文字のやり取りだけで相手を人間と区別できなければ、その機械には知能があるとみなすという判定法の提案は？',
    confusion: '理解そのものを証明するテストではない。サールの「中国語の部屋」はこのテストへの批判として知られる。',
    lessonId: 'les-g01', questionIds: ['q-g01-2'], sources: [JDLA, SEP_TT], difficulty: 2,
  }),
  c({
    id: 'card-g01-04', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-3', term: 'フレーム問題',
    definition: '有限の能力しかない主体が、状況の中で「今関連のある事柄だけ」を取り出すことの困難さを指す古典的問題である。',
    reversePrompt: 'あらゆる事象を列挙すると組み合わせが爆発するため、有限の能力しかない主体が状況の中で関連のある事柄だけを切り出すことが難しい、という古典的な困難は？',
    confusion: '記号と実世界の意味が結びつかない困難はシンボルグラウンディング問題であり、別の問題である。',
    lessonId: 'les-g01', questionIds: ['q-g01-3'], sources: [JDLA, SEP_FP], difficulty: 2,
  }),
  c({
    id: 'card-g01-05', mode: 'g', syllabusId: 'g-01', conceptId: 'card-g01-05', term: 'シンボルグラウンディング問題', aliases: ['記号接地問題'],
    definition: '記号（シンボル）と実世界の対象や意味とを結び付けられないため、システムが言葉の意味を本当には理解できないという困難を指す。',
    reversePrompt: '記号と実世界の対象や意味とが結びつかないため、言葉の意味を本当には理解できないという困難は？',
    confusion: '関連のある事柄だけを切り出す困難（フレーム問題）とは別の問題である。',
    lessonId: 'les-g01', questionIds: ['q-g01-3'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g01-06', mode: 'g', syllabusId: 'g-01', conceptId: 'card-g01-06', term: '中国語の部屋',
    definition: '記号操作の規則に従って中国語の応答を返せる部屋の思考実験で、記号操作だけでは意味の理解が伴うとは限らないと論じ、チューリングテストへの批判として知られる（サール）。',
    reversePrompt: '中国語を理解しない人が規則書に従って中国語の質問に正しく応答する思考実験で、記号操作だけでは意味の理解が伴わないと論じ、対話による知能判定への批判として知られるものは？',
    lessonId: 'les-g01', questionIds: ['q-g01-2'], sources: [JDLA, SEP_CR], difficulty: 3,
  }),
  c({
    id: 'card-g01-07', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-30', term: 'AIの水準（レベル1〜4）',
    definition: 'AIの水準の整理の一つ。レベル1は単純な制御、レベル2は推論・探索、レベル3は機械学習、レベル4は特徴表現自体を学習するディープラーニングに当たる。',
    reversePrompt: '単純な制御、推論・探索を用いるもの、データから学ぶもの、特徴表現そのものまで学ぶもの、という段階で人工知能の発展度合いを整理する枠組みは？',
    lessonId: 'les-g01', questionIds: ['q-g01-30'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),

  // ===== g-02 人工知能をめぐる動向 =====
  c({
    id: 'card-g02-01', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-1', term: '幅優先探索',
    definition: '状態空間を深さの浅いノードから順に展開する探索である。辺のコストが均一なら最短経路が得られるが、メモリ消費が大きい。',
    reversePrompt: '状態空間を深さの浅い順に展開し、辺のコストが均一なら最短経路が得られる一方、メモリ消費が大きい探索法は？',
    confusion: '最も深いノードから展開するのは深さ優先探索。評価関数の値で選ぶのは最良優先探索やA*探索である。',
    lessonId: 'les-g02', questionIds: ['q-g02-1'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g02-02', mode: 'g', syllabusId: 'g-02', conceptId: 'card-g02-02', term: '深さ優先探索',
    definition: '状態空間を最も深いノードから優先して展開する探索である。メモリ使用量を小さく抑えられるが、最短経路は保証されない。',
    reversePrompt: '状態空間を最も深いところから優先して展開し、メモリ使用量を小さく抑えられる一方で最短経路は保証されない探索法は？',
    confusion: '浅い順に展開して最短経路を得るのは幅優先探索である。',
    lessonId: 'les-g02', questionIds: ['q-g02-1'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g02-03', mode: 'g', syllabusId: 'g-02', conceptId: 'card-g02-03', term: 'A*探索（エースター探索）', aliases: ['A*アルゴリズム'],
    definition: 'ヒューリスティクス（経験的評価関数）を用いて探索を効率化する代表的手法である。実コストとゴールまでの推定コストの和が小さいノードから展開する。',
    reversePrompt: '経験的な評価関数を使ってゴールまでの見込みを加味し、探索を効率化する代表的な手法は？',
    lessonId: 'les-g02', questionIds: [], sources: [JDLA, SEP_AI], difficulty: 3,
  }),
  c({
    id: 'card-g02-04', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-2', term: 'エキスパートシステム',
    definition: '専門家の知識をルール化して推論する初期の実用AIである。知識獲得のボトルネックと保守の困難さ、例外への弱さが限界となった。',
    reversePrompt: '専門家の知識をルールとして与えて推論する初期の実用システムで、知識を集めて登録する作業がボトルネックになり、保守の困難さも限界となったものは？',
    example: '血液感染症の診断を支援したMYCIN、有機化合物の構造推定を行ったDENDRALが代表例。',
    confusion: 'データから学習する仕組みではない。知識は人間が与える。',
    lessonId: 'les-g02', questionIds: ['q-g02-2', 'q-g02-3'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g02-05', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-4', term: 'オントロジー',
    definition: '対象領域の概念と、その間の関係を形式的に記述した枠組みである。知識表現の一種で、意味ネットワークやフレームも古典的な知識表現に含まれる。',
    reversePrompt: '対象領域の概念とその間の関係を形式的に記述した、知識表現の枠組みは？',
    confusion: '「もし〜ならば〜」形式のルール集はプロダクションルールであり、別の知識表現である。',
    lessonId: 'les-g02', questionIds: ['q-g02-4'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g02-06', mode: 'g', syllabusId: 'g-02', conceptId: 'card-g02-06', term: 'AIブームとAIの冬',
    definition: 'AIへの期待が高まるブームと、期待外れによる停滞（AIの冬）が繰り返されてきた歴史を指す。現在の第3次ブームは計算資源とデータの増大を背景に機械学習・ディープラーニングが中心である。',
    reversePrompt: '期待の高まりと失望による停滞が繰り返されてきた歴史的経緯を指し、現在は計算資源とデータの増大を背景とする第3次の高まりにあるとされるものは？',
    lessonId: 'les-g02', questionIds: [], sources: [JDLA, SEP_AI], difficulty: 1,
  }),
  c({
    id: 'card-g02-07', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-30', term: '推論',
    definition: '既知の事実とルールから新しい結論を導く処理である。探索と並ぶ古典的AIの基本技術で、現実の曖昧さへの対応が課題となった。',
    reversePrompt: '既知の事実とルールから新しい結論を導く処理で、状態空間を辿る方法と並ぶ古典的な基本技術は？',
    lessonId: 'les-g02', questionIds: ['q-g02-30'], sources: [JDLA, SEP_AI], difficulty: 1,
  }),

  // ===== g-03 機械学習の概要 =====
  c({
    id: 'card-g03-01', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-1', term: '分類と回帰',
    definition: '教師あり学習の課題の区別。分類は離散的なカテゴリを、回帰は連続値を予測する。どちらも入力と正解ラベルの組から学ぶ。',
    reversePrompt: '正解ラベル付きのデータから学ぶ課題のうち、離散的なカテゴリを予測するものと連続値を予測するものの区別は？',
    example: 'スパム判定は分類、価格予測は回帰に当たる。',
    lessonId: 'les-g03', questionIds: ['q-g03-1'], sources: [JDLA, SK_UG], difficulty: 1,
  }),
  c({
    id: 'card-g03-02', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-5', term: '強化学習',
    definition: 'エージェントが環境と相互作用し、報酬を手がかりに試行錯誤で行動方策を学ぶ枠組みである。ラベル付きの正解データは与えられない。',
    reversePrompt: '行動の結果として得られる報酬を手がかりに、試行錯誤で望ましい行動の選び方を学ぶ枠組みは？',
    lessonId: 'les-g03', questionIds: ['q-g03-5'], sources: [JDLA, SB_RL], difficulty: 2,
  }),
  c({
    id: 'card-g03-03', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-8', term: '過学習と汎化', aliases: ['オーバーフィッティング'],
    definition: '過学習は訓練データに過剰適合し、未知データでの性能が落ちる現象である。未知データでも性能を保つ性質が汎化性能で、学習不足（バイアス大）と過学習（バリアンス大）のトレードオフが本質となる。',
    reversePrompt: '訓練データに適合しすぎて未知のデータで性能が落ちる現象と、未知のデータでも性能を保つ性質を表す言葉の組は？',
    confusion: '訓練データでの高精度は良いモデルの証拠とは限らない。',
    lessonId: 'les-g03', questionIds: ['q-g03-8'], sources: [JDLA, SK_UG], difficulty: 2,
  }),
  c({
    id: 'card-g03-04', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-3', term: '適合率（precision）',
    definition: '正と予測したもののうち、実際に正であった割合である。混同行列から計算される分類の評価指標の一つ。',
    reversePrompt: '正と予測したものの中で、実際に正であったものの割合を表す評価指標は？',
    confusion: '実際に正であるもののうち正と予測できた割合は再現率であり、別の指標である。',
    lessonId: 'les-g03', questionIds: ['q-g03-3'], sources: [JDLA, SK_EVAL], difficulty: 2,
  }),
  c({
    id: 'card-g03-05', mode: 'g', syllabusId: 'g-03', conceptId: 'card-g03-05', term: '再現率（recall）',
    definition: '実際に正であるもののうち、正と予測できた割合である。見逃しを減らしたい場面で重視される。F値は適合率と再現率の調和平均。',
    reversePrompt: '実際に正であるものの中で、正と予測できたものの割合を表す評価指標は？',
    confusion: '正と予測した中で当たった割合は適合率であり、別の指標である。',
    lessonId: 'les-g03', questionIds: ['q-g03-3'], sources: [JDLA, SK_EVAL], difficulty: 2,
  }),
  c({
    id: 'card-g03-06', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-4', term: '交差検証（クロスバリデーション）',
    definition: 'データを複数の組に分けて学習と評価を繰り返し、分割の偏りによる評価のばらつきを抑えて汎化性能を推定する方法である。',
    reversePrompt: 'データを複数の組に分けて学習と評価を繰り返すことで、分割の偏りによる評価のばらつきを抑え、未知データでの性能の推定を安定させる方法は？',
    confusion: '一度だけ訓練用と評価用に分ける方法はホールドアウト法であり、別の方法である。',
    lessonId: 'les-g03', questionIds: ['q-g03-4'], sources: [JDLA, SK_EVAL], difficulty: 2,
  }),
  c({
    id: 'card-g03-07', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-2', term: 'k-means法',
    definition: 'ラベルなしデータを、各点から最も近い重心に基づいてクラスタに分ける教師なし学習の手法である。クラスタ数を事前に決める必要があり、初期値に結果が依存する。',
    reversePrompt: 'ラベルなしのデータを重心までの距離に基づいてグループに分ける教師なし学習の手法で、グループの数を事前に決める必要があり初期値に結果が依存するものは？',
    confusion: '近い順にk個の学習データを参照して多数決で予測するのはk近傍法であり、別の手法である。',
    lessonId: 'les-g03', questionIds: ['q-g03-2'], sources: [JDLA, SK_CLU], difficulty: 2,
  }),
  c({
    id: 'card-g03-08', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-6', term: '主成分分析（PCA）',
    definition: 'データの分散が最大になる方向を主成分として軸を取り直し、情報量をなるべく保ちながら次元を削減する教師なし学習の手法である。',
    reversePrompt: '分散が最大になる方向を新しい軸として取り直し、情報量をなるべく保ちながらデータの次元を減らす教師なし学習の手法は？',
    lessonId: 'les-g03', questionIds: ['q-g03-6'], sources: [JDLA, SK_DEC], difficulty: 2,
  }),
  c({
    id: 'card-g03-09', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-11', term: 'ROC曲線とAUC',
    definition: 'ROC曲線は判定の閾値ごとに真陽性率と偽陽性率を描いた軌跡で、その下の面積AUCが識別性能の指標になる。1に近いほど高性能である。',
    reversePrompt: '判定の閾値を変えながら真陽性率と偽陽性率の軌跡を描いた曲線と、その下の面積で識別性能を表す指標（1に近いほど高性能）の組は？',
    lessonId: 'les-g03', questionIds: ['q-g03-11'], sources: [JDLA, SK_EVAL], difficulty: 3,
  }),

  // ===== g-04 ディープラーニングの概要 =====
  c({
    id: 'card-g04-01', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-1', term: '活性化関数',
    definition: 'ニューラルネットワークの各ユニットで、重み付き和に非線形な変換を与える関数である。シグモイド、tanh、ReLUなどが代表で、非線形性を与えることが本質的な役割。',
    reversePrompt: '各ユニットの重み付き和に非線形な変換を与える関数で、これがなければ層を重ねても全体が線形な変換にしかならないものは？',
    lessonId: 'les-g04', questionIds: ['q-g04-1'], sources: [JDLA, SK_NN], difficulty: 1,
  }),
  c({
    id: 'card-g04-02', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-2', term: '誤差逆伝播法', aliases: ['バックプロパゲーション'],
    definition: '出力側の誤差から、微分の連鎖律を使って各重みの勾配を効率よく求める計算方法である。求めた勾配は勾配降下法による重み更新に使われる。',
    reversePrompt: '出力側の誤差から微分の連鎖律を使って各重みの勾配を効率よく求め、重み更新に使う計算方法は？',
    lessonId: 'les-g04', questionIds: ['q-g04-2'], sources: [JDLA, SK_NN], difficulty: 2,
  }),
  c({
    id: 'card-g04-03', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-10', term: '誤差関数（損失関数）',
    definition: '予測と正解のずれを数値化する関数である。回帰では平均二乗誤差、分類では交差エントロピー誤差が標準的に使われる。学習はこの値を小さくする過程である。',
    reversePrompt: '予測と正解のずれを数値化する関数で、回帰では誤差の二乗の平均、分類では確率のずれを測るものが標準的に使われ、学習はこの値を小さくする過程であるものは？',
    lessonId: 'les-g04', questionIds: ['q-g04-10', 'q-g04-22'], sources: [JDLA, SK_NN], difficulty: 2,
  }),
  c({
    id: 'card-g04-04', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-5', term: '勾配消失問題',
    definition: '深いネットワークで、微分の小さい活性化関数の層を重ねるうちに勾配がほぼ0になり、入力側の層の学習が進まなくなる現象である。ReLUの普及や残差結合の動機になった。',
    reversePrompt: '深いネットワークで勾配がほぼ0まで小さくなり、入力側の層の学習が進まなくなる現象は？',
    confusion: '勾配が大きくなりすぎて更新が発散するのは勾配爆発であり、逆の現象である。',
    lessonId: 'les-g04', questionIds: ['q-g04-5', 'q-g04-11'], sources: [JDLA, SK_NN], difficulty: 2,
  }),
  c({
    id: 'card-g04-05', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-3', term: 'ドロップアウト',
    definition: '学習時にユニットをランダムに無効化することで過学習を抑える正則化手法である。推論時には基本的に全ユニットを使う。',
    reversePrompt: '学習時にユニットをランダムに無効化して過学習を抑え、推論時には全ユニットを使う正則化手法は？',
    confusion: '推論時にも無効化し続けるのは誤り。推論時は基本的に無効化しない。',
    lessonId: 'les-g04', questionIds: ['q-g04-3'], sources: [JDLA, DROPOUT], difficulty: 2,
  }),
  c({
    id: 'card-g04-06', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-8', term: '正則化（L1／L2正則化）',
    definition: '損失関数に重みの大きさへのペナルティを加え、過学習を抑える手法の総称である。L1は重みの絶対値和、L2は重みの二乗和をペナルティにする。',
    reversePrompt: '損失に重みの大きさへの罰則項を加えて過学習を抑える手法の総称で、絶対値和を使うものと二乗和を使うものの2種が代表的なものは？',
    lessonId: 'les-g04', questionIds: ['q-g04-8'], sources: [JDLA, SK_NN], difficulty: 2,
  }),
  c({
    id: 'card-g04-07', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-4', term: 'Adam',
    definition: '勾配の1次モーメント（平均）と2次モーメント（分散）の推定を組み合わせ、パラメータごとに学習率を適応させる最適化手法である。',
    reversePrompt: '勾配の平均とばらつきの推定を組み合わせてパラメータごとに学習率を自動調整する、広く使われる最適化手法は？',
    lessonId: 'les-g04', questionIds: ['q-g04-4'], sources: [JDLA, ADAM], difficulty: 2,
  }),
  c({
    id: 'card-g04-08', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-12', term: '早期終了（early stopping）',
    definition: '学習とは別に用意した検証データの損失を監視し、悪化し始めた時点で学習を止める過学習対策である。',
    reversePrompt: '学習とは別に用意した検証用のデータで損失を監視し、悪化し始めたら学習を打ち切る過学習対策は？',
    lessonId: 'les-g04', questionIds: ['q-g04-12'], sources: [JDLA, SK_NN], difficulty: 1,
  }),

  // ===== g-05 ディープラーニングの要素技術 =====
  c({
    id: 'card-g05-01', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-5', term: '畳み込み層（CNN）',
    definition: '局所的な領域にフィルタ（カーネル）を適用し、同じ重みを位置を変えて共有することで特徴を検出する層である。画像の平行移動に対する頑健性を持つ。',
    reversePrompt: '局所的な領域にフィルタを適用し、同じ重みを位置を変えて使い回すことで特徴を検出する層で、画像の平行移動に強いものは？',
    lessonId: 'les-g05', questionIds: ['q-g05-5', 'q-g05-30'], sources: [JDLA, PT_CONV], difficulty: 2,
  }),
  c({
    id: 'card-g05-02', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-1', term: 'プーリング層',
    definition: '特徴マップの小さい領域を最大値や平均値で代表させて縮小する層である。計算量と過学習を抑え、微小な位置ずれに強くする。位置情報は完全には保持されない。',
    reversePrompt: '特徴マップの小さい領域を最大値や平均値で代表させて縮小し、計算量と過学習を抑えて位置ずれに強くする層は？',
    confusion: '位置情報が完全に保持されるわけではない。縮小によって詳細な位置は失われる。',
    lessonId: 'les-g05', questionIds: ['q-g05-1', 'q-g05-28'], sources: [JDLA, PT_MAXPOOL], difficulty: 2,
  }),
  c({
    id: 'card-g05-03', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-2', term: 'LSTM',
    definition: '入力・忘却・出力の3つのゲートで情報の流れを制御し、長期の依存関係を学習しやすくした回帰型ネットワークのユニットである。忘却ゲートは保持する情報の割合を決める。',
    reversePrompt: '入力・保持・出力の3つのゲートで情報の流れを制御し、長い系列の依存関係を学習しやすくした回帰型ネットワークのユニットは？',
    lessonId: 'les-g05', questionIds: ['q-g05-2', 'q-g05-19', 'q-g05-20'], sources: [JDLA, PT_LSTM], difficulty: 2,
  }),
  c({
    id: 'card-g05-04', mode: 'g', syllabusId: 'g-05', conceptId: 'card-g05-04', term: 'RNN（回帰結合）',
    definition: '内部状態を持つことで系列データを扱う構造である。過去の情報を保持できる反面、長期依存の学習が難しいという課題がある。',
    reversePrompt: '内部状態を持つことで系列データを扱える構造で、過去の情報を保持できる反面、長期の依存関係の学習が難しいものは？',
    lessonId: 'les-g05', questionIds: ['q-g05-21'], sources: [JDLA, PT_LSTM], difficulty: 2,
  }),
  c({
    id: 'card-g05-05', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-3', term: 'Attention（注意機構）',
    definition: '系列の各要素間の関連度に応じて情報を重み付けして集約する仕組みである。離れた要素同士の関係を直接捉えられる。',
    reversePrompt: '系列の各要素間の関連度に応じて情報を重み付けして集約し、離れた要素同士の関係を直接捉える仕組みは？',
    lessonId: 'les-g05', questionIds: ['q-g05-3', 'q-g05-22'], sources: [JDLA, ATTN], difficulty: 2,
  }),
  c({
    id: 'card-g05-06', mode: 'g', syllabusId: 'g-05', conceptId: 'card-g05-06', term: 'Transformer',
    definition: 'Attentionを中核とし、再帰も畳み込みも持たないアーキテクチャである。順序の情報は位置エンコーディングで埋め込みに加える。大規模言語モデルの基盤になった。',
    reversePrompt: '関連度に基づく重み付けの仕組みを中核とし、再帰も畳み込みも持たず、順序の情報は埋め込みへの加算で与えるアーキテクチャで、大規模言語モデルの基盤になったものは？',
    lessonId: 'les-g05', questionIds: ['q-g05-3', 'q-g05-11'], sources: [JDLA, ATTN], difficulty: 2,
  }),
  c({
    id: 'card-g05-07', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-4', term: 'スキップ結合（残差結合）',
    definition: '層を飛び越えて入力を先へ伝える経路を作る結合である。勾配が伝わりやすくなり勾配消失を緩和する。深いネットワーク（ResNet）を可能にした。',
    reversePrompt: '層を飛び越えて入力を先へ伝える経路を作り、勾配消失を緩和して深いネットワークを可能にした結合は？',
    lessonId: 'les-g05', questionIds: ['q-g05-4'], sources: [JDLA, RESNET], difficulty: 2,
  }),
  c({
    id: 'card-g05-08', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-7', term: 'バッチ正規化',
    definition: 'ミニバッチ単位で中間層の出力を正規化し、学習の安定と高速化に寄与する手法である。サンプルごとに特徴方向で正規化する方式とは正規化の軸が異なる。',
    reversePrompt: 'ミニバッチ単位で中間層の出力をそろえることで学習の安定と高速化に寄与する手法は？',
    lessonId: 'les-g05', questionIds: ['q-g05-7'], sources: [JDLA, BN], difficulty: 2,
  }),
  c({
    id: 'card-g05-09', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-10', term: 'レイヤー正規化（層正規化）',
    definition: 'サンプルごとに特徴の方向で正規化する手法である。バッチサイズが小さい場合でも安定して使え、Transformerで標準的に採用される。',
    reversePrompt: 'サンプルごとに特徴の方向で正規化するため小さいバッチでも安定して使え、系列モデルの標準的な構成要素になっている正規化手法は？',
    lessonId: 'les-g05', questionIds: ['q-g05-10'], sources: [JDLA, ATTN], difficulty: 3,
  }),
  c({
    id: 'card-g05-10', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-6', term: 'オートエンコーダ',
    definition: '入力を低次元の潜在表現に圧縮し、そこから元の入力を復元するよう学習する教師なし構造である。次元削減や異常検知に応用される。',
    reversePrompt: '入力を低次元に圧縮してから元の入力を復元するよう学習する教師なし構造で、次元削減や異常検知に応用されるものは？',
    lessonId: 'les-g05', questionIds: ['q-g05-6', 'q-g05-27'], sources: [JDLA, AE_JMLR], difficulty: 2,
  }),

  // ===== g-06 ディープラーニングの応用例 =====
  c({
    id: 'card-g06-01', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-1', term: '転移学習',
    definition: 'あるタスクで学習済みのモデルを別のタスクに流用し、学習済みの知識を活かす方法である。対象タスクのデータが少ない場合に有効。ドメインの違いが大きいと性能が下がる「負の転移」も起こり得る。',
    reversePrompt: 'あるタスクで学習済みのモデルを別のタスクに流用して知識を活かす方法で、対象タスクのデータが少ない場合に有効なものは？',
    confusion: 'モデルの一部または全体を追加学習で適応させる方法（ファインチューニング）と同義と断定しない。文脈で使い分ける。',
    lessonId: 'les-g06', questionIds: ['q-g06-1', 'q-g06-26'], sources: [JDLA, PT_TRANSFER], difficulty: 2,
  }),
  c({
    id: 'card-g06-02', mode: 'g', syllabusId: 'g-06', conceptId: 'card-g06-02', term: 'ファインチューニング',
    definition: '学習済みモデルの一部または全体を追加学習し、対象タスクに適応させる方法である。浅い層を凍結し、深い層や出力層を中心に学習させる方法がよく取られる。',
    reversePrompt: '学習済みモデルの一部または全体を追加学習して対象タスクに適応させる方法で、汎用的な特徴を捉える浅い層を凍結する運用も多いものは？',
    lessonId: 'les-g06', questionIds: ['q-g06-27'], sources: [JDLA, PT_TRANSFER], difficulty: 2,
  }),
  c({
    id: 'card-g06-03', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-2', term: 'GAN（敵対的生成ネットワーク）',
    definition: 'データを生成する生成器と、本物か生成物かを見分ける識別器を競わせて学習する生成モデルである。生成物の品質は識別器をだませるかどうかで鍛えられる。',
    reversePrompt: 'データを生み出す側と、本物か作り物かを見分ける側を競わせて学習する生成モデルは？',
    lessonId: 'les-g06', questionIds: ['q-g06-2'], sources: [JDLA, GAN], difficulty: 2,
  }),
  c({
    id: 'card-g06-04', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-6', term: '拡散モデル',
    definition: 'データにノイズを加える過程の逆、すなわちノイズを除去していく過程を学習する生成手法である。画像生成の主流の一つになった。',
    reversePrompt: 'データへノイズを加える過程の逆向き、つまりノイズを除去していく過程を学習する生成手法で、画像生成の主流の一つになったものは？',
    lessonId: 'les-g06', questionIds: ['q-g06-6'], sources: [JDLA, DIFFUSION], difficulty: 2,
  }),
  c({
    id: 'card-g06-05', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-5', term: '物体検出',
    definition: '画像の中で「何が・どこに」あるかを、種別と位置（矩形）の両方で同定するタスクである。画像全体に1つのラベルを付ける画像分類とは求める出力が異なる。',
    reversePrompt: '画像の中で対象の種別と位置の両方を同定するタスクで、画像全体に1つのラベルを付ける課題とは求める出力が異なるものは？',
    lessonId: 'les-g06', questionIds: ['q-g06-5', 'q-g06-13'], sources: [JDLA, YOLO], difficulty: 1,
  }),
  c({
    id: 'card-g06-06', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-12', term: 'マルチモーダルAI',
    definition: '画像・テキスト・音声など複数種のデータを統合して処理するAIである。モダリティごとに得意不得意と失敗パターンが異なる。',
    reversePrompt: '画像・テキスト・音声など複数種のデータを統合して処理する仕組みで、種類ごとに得意不得意や失敗の仕方が異なるものは？',
    lessonId: 'les-g06', questionIds: ['q-g06-12'], sources: [JDLA, SK_UG], difficulty: 1,
  }),
  c({
    id: 'card-g06-07', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-4', term: '量子化（モデル軽量化）',
    definition: '重みや活性の数値精度（ビット数）を下げてモデルを小さく・高速にする軽量化手法である。量子コンピュータとは無関係。蒸留、プルーニング（枝刈り）と並ぶ代表的な軽量化手法。',
    reversePrompt: '重みや活性の数値精度を下げてモデルを小さく高速にする軽量化手法で、量子コンピュータとは無関係なものは？',
    lessonId: 'les-g06', questionIds: ['q-g06-4'], sources: [JDLA, PT_QUANT], difficulty: 2,
  }),
  c({
    id: 'card-g06-08', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-7', term: '知識蒸留',
    definition: '大きな教師モデルの出力などの知識を小さな生徒モデルへ移し、性能を保ちながら軽量化する手法である。',
    reversePrompt: '大きな教師役モデルの知識を小さな生徒役モデルへ移して軽量化する手法は？',
    lessonId: 'les-g06', questionIds: ['q-g06-7'], sources: [JDLA, DISTILL], difficulty: 2,
  }),
  c({
    id: 'card-g06-09', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-3', term: 'Grad-CAM',
    definition: '勾配情報を用いて、画像のどの領域に注目して予測したかをヒートマップで示す解釈手法である。モデルの判断根拠を画像上で確認できる。',
    reversePrompt: '勾配情報を用いて、画像のどの領域に注目して予測したかをヒートマップで示す解釈手法は？',
    confusion: '特徴量の寄与を予測ごとに分配して示す手法はSHAPであり、別の説明手法である。',
    lessonId: 'les-g06', questionIds: ['q-g06-3'], sources: [JDLA, GRADCAM], difficulty: 3,
  }),
  c({
    id: 'card-g06-10', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-8', term: '埋め込み（分散表現）',
    definition: '単語や文などの対象を数値ベクトルで表し、意味の近さをベクトル同士の近さ（距離）で表す表現方法である。ベクトル自体が学習の対象になる。',
    reversePrompt: '対象を数値ベクトルで表し、意味の近さをベクトル同士の近さで表す表現方法で、ベクトル自体が学習の対象になるものは？',
    lessonId: 'les-g06', questionIds: ['q-g06-8', 'q-g05-25'], sources: [JDLA, WORD2VEC], difficulty: 2,
  }),
  c({
    id: 'card-g06-11', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-9', term: 'DQN（深層Qネットワーク）',
    definition: 'Q学習に深層学習を組み合わせ、ゲーム画面のような高次元の入力から行動価値を学習できるようにした深層強化学習の手法である。',
    reversePrompt: 'Q学習に深層学習を組み合わせ、ゲーム画面のような高次元入力から行動価値を学習できるようにした深層強化学習の手法は？',
    lessonId: 'les-g06', questionIds: ['q-g06-9', 'q-g06-28'], sources: [JDLA, DQN], difficulty: 3,
  }),

  // ===== g-07 AIの社会実装に向けて =====
  c({
    id: 'card-g07-01', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-4', term: 'PoC（概念実証）',
    definition: '本格導入の前に、実現可能性を小規模に確認する取り組みである。ここで得た精度は本番性能の保証にはならない。',
    reversePrompt: '本格導入の前に実現可能性を小規模に確認する取り組みで、ここで得た精度がそのまま本番の性能にはならないものは？',
    confusion: '実証実験の成功だけで運用に進むと、性能監視や再学習の設計が抜け落ちやすい。',
    lessonId: 'les-g07', questionIds: ['q-g07-4'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),
  c({
    id: 'card-g07-02', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-2', term: 'アノテーション',
    definition: '教師あり学習のためにデータへ正解ラベルを付ける作業である。ラベルの定義書の整備と複数人での一致確認など、品質管理が学習の成否を決める。',
    reversePrompt: '教師あり学習のためにデータへ正解ラベルを付ける作業で、定義書の整備や複数人での一致確認といった品質管理が成否を決めるものは？',
    lessonId: 'les-g07', questionIds: ['q-g07-2', 'q-g07-22'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-g07-03', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-3', term: 'データドリフト',
    definition: '運用後に現実のデータの分布が学習時から変化し、モデルの性能が劣化する現象である。継続的なモニタリングと再評価の仕組みが必要になる。',
    reversePrompt: '運用後に現実のデータの分布が学習時から変化して性能が劣化する現象で、継続的な監視と再評価が必要になるものは？',
    lessonId: 'les-g07', questionIds: ['q-g07-3'], sources: [JDLA, NIST_RMF], difficulty: 2,
  }),
  c({
    id: 'card-g07-04', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-9', term: 'データリーケージ（データリーク）',
    definition: '予測時点では得られない情報が学習や前処理に混入し、評価が実際より良く見えてしまう問題である。テスト情報の訓練への混入が代表例で、評価の妥当性を壊す。',
    reversePrompt: '予測時点では得られない情報が学習や前処理に紛れ込み、評価が実際より良く見えてしまう問題は？',
    lessonId: 'les-g07', questionIds: ['q-g07-9'], sources: [JDLA, GL_PAGE], difficulty: 3,
  }),
  c({
    id: 'card-g07-05', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-5', term: '訓練・検証・テストデータの分割',
    definition: 'データを役割の異なる3つに分ける基本工程である。訓練用は学習、検証用はモデル選択や調整、テスト用は最終評価に使い、役割の分離が公正な評価の前提になる。',
    reversePrompt: 'データを学習用・調整や選択用・最終評価用の3つに分け、役割を分離することが公正な評価の前提になる基本工程は？',
    lessonId: 'les-g07', questionIds: ['q-g07-5'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),
  c({
    id: 'card-g07-06', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-8', term: 'クラス不均衡',
    definition: 'クラスの件数が大きく偏ったデータの状態である。正解率だけでは性能を正しく評価できず、適合率や再現率など指標の選び方とデータ側の対処が必要になる。',
    reversePrompt: 'クラスの件数が大きく偏ったデータの状態で、正解率だけでは性能を評価できず指標の選び方や対処が必要になるものは？',
    lessonId: 'les-g07', questionIds: ['q-g07-8'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-g07-07', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-1', term: 'AIプロジェクトの進め方',
    definition: '課題定義→データ収集・加工→モデル構築→評価→運用・保守の流れで進める進め方である。技術の前に「解くべき課題と成功条件」を定義することが重要とされる。',
    reversePrompt: '課題と成功条件の定義から始めて、データの準備、モデル構築、評価、運用・保守へ進む、導入プロジェクトの基本的な進め方は？',
    lessonId: 'les-g07', questionIds: ['q-g07-1'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),

  // ===== g-08 AIに必要な数理・統計知識 =====
  c({
    id: 'card-g08-01', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-1', term: 'ベイズの定理',
    definition: '事前確率を観測データで更新して事後確率を得る式である。条件付き確率の関係から導かれ、分類や不確実性の扱いの基礎になる。',
    reversePrompt: '事前の信念を観測データで更新して事後の確率を得る式で、条件付き確率の関係から導かれるものは？',
    lessonId: 'les-g08', questionIds: ['q-g08-1'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-02', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-3', term: 'p値',
    definition: '帰無仮説が正しいという前提のもとで、観測された以上のデータが得られる確率である。「仮説が正しい確率」ではない。有意水準と比較して判定に使う。',
    reversePrompt: '帰無仮説が正しいという前提のもとで観測以上のデータが得られる確率で、仮説が正しい確率ではないとされる値は？',
    confusion: '「p値＝仮説が正しい確率」は典型的な誤解である。',
    lessonId: 'les-g08', questionIds: ['q-g08-3'], sources: [JDLA, NIST_HB], difficulty: 3,
  }),
  c({
    id: 'card-g08-03', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-11', term: '第一種の過誤・第二種の過誤',
    definition: '第一種の過誤は「本当は差がないのに、差があるとする」誤りで、その確率の上限が有意水準である。第二種の過誤は「差があるのに見逃す」誤り。',
    reversePrompt: '検定の誤りの2類型で、本当は差がないのに差があるとする誤りと、差があるのに見逃す誤りの組は？',
    lessonId: 'les-g08', questionIds: ['q-g08-11'], sources: [JDLA, NIST_HB], difficulty: 3,
  }),
  c({
    id: 'card-g08-04', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-4', term: 'エントロピー（情報理論）',
    definition: '不確実性の量を表す情報理論の基本量である。分類では交差エントロピーが損失関数の基礎になり、決定木の分割基準にも使われる。',
    reversePrompt: '不確実性の量を表す情報理論の基本量で、分類の損失関数や決定木の分割基準の基礎になるものは？',
    lessonId: 'les-g08', questionIds: ['q-g08-4'], sources: [JDLA, SHANNON], difficulty: 2,
  }),
  c({
    id: 'card-g08-05', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-7', term: '正規分布',
    definition: '平均を中心に左右対称な釣鐘型の確率分布である。平均±1標準偏差に約68%、±2標準偏差に約95%のデータが入る。多くの測定誤差や自然現象の近似に使われる。',
    reversePrompt: '平均を中心に左右対称な釣鐘型の分布で、平均±1標準偏差に約68%、±2標準偏差に約95%が入るとされるものは？',
    lessonId: 'les-g08', questionIds: ['q-g08-7'], sources: [JDLA, NIST_HB], difficulty: 1,
  }),
  c({
    id: 'card-g08-06', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-2', term: '相関と因果',
    definition: '2つの量が一緒に変動する関係が相関で、一方が他方の原因である関係が因果である。相関が高いだけでは因果関係を主張できず、交絡因子が典型的な落とし穴になる。',
    reversePrompt: '2つの量が一緒に変動する関係と、一方が他方の原因である関係の区別で、前者が高いだけでは後者を主張できず、第三の要因が落とし穴になるものは？',
    example: '交絡因子の存在により、見かけの相関が因果と誤認されることがある。',
    lessonId: 'les-g08', questionIds: ['q-g08-2'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-07', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-30', term: '標準化（z値）',
    definition: '値から平均を引き、標準偏差で割って尺度をそろえる変換である。変換後の値をz値と呼び、異なる単位や分布のデータを比較しやすくする。',
    reversePrompt: '値から平均を引いて標準偏差で割ることで尺度をそろえる変換で、変換後の値は異なるデータ同士の比較に使えるものは？',
    example: '平均60点・標準偏差10点のテストで75点なら、z値は (75−60)÷10＝1.5。',
    lessonId: 'les-g08', questionIds: ['q-g08-30'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-08', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-26', term: '凸関数と大域最適',
    definition: '凸関数では局所的な最小がそのまま全体の最小（大域最小）になるため、最適化が扱いやすい。一般の非凸関数では局所解にとどまる可能性がある。',
    reversePrompt: '下に凸な形の関数で成り立つ性質として、局所的な最小がそのまま全体の最小になるため最適化が扱いやすい、という特徴は？',
    lessonId: 'les-g08', questionIds: ['q-g08-26'], sources: [JDLA, NIST_HB], difficulty: 3,
  }),

  // ===== g-09 AIに関する法律と契約 =====
  c({
    id: 'card-g09-01', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-1', term: '著作権法第30条の4',
    definition: '著作物の享受を目的としない利用（情報解析など）を原則として許容する日本の著作権法の規定である。ただし権利者の利益を不当に害する場合は除かれる。',
    reversePrompt: '著作物の享受を目的としない利用を原則として許容する、日本の著作権法の条文は？（条番号で答える）',
    detail: '生成物の利用ではこの規定とは別に、既存の著作物との類似性と依拠性が侵害判断のポイントになる。',
    lessonId: 'les-g09', questionIds: ['q-g09-1'], sources: [BUNKA, CHOSAKUKEN], difficulty: 2,
  }),
  c({
    id: 'card-g09-02', mode: 'g', syllabusId: 'g-09', conceptId: 'card-g09-02', term: '類似性と依拠性',
    definition: '著作権侵害が成立するための要件である。生成物が既存の著作物に類似し、かつ既存の著作物に依拠して作られたと認められれば、AIによる生成でも侵害になり得る。',
    reversePrompt: '著作権侵害の成立に必要な2つの要件で、生成物が既存の作品に似ていることと、既存の作品に基づいて作られたことの組は？',
    lessonId: 'les-g09', questionIds: ['q-g09-1', 'q-g09-3'], sources: [JDLA, BUNKA], difficulty: 3,
  }),
  c({
    id: 'card-g09-03', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-2', term: '要配慮個人情報',
    definition: '人種、信条、社会的身分、病歴、犯罪歴など、本人への不当な差別や偏見が生じないよう特に配慮を要する個人情報である。取得には原則として本人の同意が必要。',
    reversePrompt: '人種・信条・病歴など、差別や偏見につながらないよう特に配慮を要し、取得に原則として本人の同意が必要な個人情報の区分は？',
    lessonId: 'les-g09', questionIds: ['q-g09-2'], sources: [JDLA, KOJIN], difficulty: 2,
  }),
  c({
    id: 'card-g09-04', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-6', term: '個人データの第三者提供',
    definition: '個人情報保護法上、個人データを第三者へ提供するには原則として本人の同意が必要である。外国にある第三者への提供では、移転先国の制度などに関する情報提供も求められる。',
    reversePrompt: '法律上、個人データを第三者へ渡すには原則として本人の同意が必要で、外国にある第三者への提供では移転先国の制度などに関する情報提供も求められる、というルールは？',
    lessonId: 'les-g09', questionIds: ['q-g09-6', 'q-g09-21'], sources: [JDLA, KOJIN], difficulty: 2,
  }),
  c({
    id: 'card-g09-05', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-8', term: '匿名加工情報',
    definition: '特定の個人を識別できないように加工し、復元できないようにした情報の枠組みである。一定のルールのもとで本人同意なく第三者提供などが可能になる。',
    reversePrompt: '特定の個人を識別できないように加工し復元もできないようにした情報の枠組みで、一定のルールのもとで本人同意なく提供なども可能になるものは？',
    confusion: '氏名等を削除しても他の情報と照合して識別し得る状態の情報は仮名加工情報であり、第三者提供の扱いが異なる。',
    lessonId: 'les-g09', questionIds: ['q-g09-8'], sources: [JDLA, KOJIN], difficulty: 2,
  }),
  c({
    id: 'card-g09-06', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-12', term: '仮名加工情報',
    definition: '他の情報と照合しない限り特定の個人を識別できないように加工した情報の枠組みである。内部での分析などに使え、原則として第三者提供はできない。',
    reversePrompt: '他の情報と照合しない限り特定の個人を識別できないように加工した情報の枠組みで、内部での分析などに使え、原則として第三者提供はできないものは？',
    lessonId: 'les-g09', questionIds: ['q-g09-12'], sources: [JDLA, KOJIN], difficulty: 3,
  }),
  c({
    id: 'card-g09-07', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-5', term: '特許権',
    definition: '発明を保護する知的財産権で、存続期間は原則として出願日から20年である。AI関連発明もソフトウェア発明として要件を満たせば保護対象になり得る。',
    reversePrompt: '発明を保護する知的財産権で、存続期間は原則として出願日から20年とされるものは？',
    lessonId: 'les-g09', questionIds: ['q-g09-5'], sources: [JDLA, TOKKYO], difficulty: 1,
  }),
  c({
    id: 'card-g09-08', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-4', term: '営業秘密と限定提供データ',
    definition: '不正競争防止法が保護する対象である。営業秘密は秘密管理性・有用性・非公知性の要件を満たす情報、限定提供データは事業として限定提供されるデータで、不正な取得や使用が規制される。',
    reversePrompt: '不正競争防止法が保護する対象で、秘密として管理された事業情報と、事業として限定して提供されるデータの組は？',
    lessonId: 'les-g09', questionIds: ['q-g09-4'], sources: [JDLA, FUSEI], difficulty: 2,
  }),
  c({
    id: 'card-g09-09', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-7', term: 'AI開発委託契約の要点',
    definition: 'AI開発の委託では、学習データの権利、生成モデルの帰属、再学習への利用可否、責任分担を契約で明確化することが重要である。AIサービスの責任に一律の法定ルールはないため、提供契約側でも責任分界を定める。',
    reversePrompt: 'AI開発を外部に委託する際、学習データの権利・生成モデルの帰属・再学習への利用可否・責任分担を明確にしておくべき対象は？',
    lessonId: 'les-g09', questionIds: ['q-g09-7', 'q-g09-11'], sources: [JDLA, MINPO], difficulty: 2,
  }),

  // ===== g-10 AI倫理・AIガバナンス =====
  c({
    id: 'card-g10-01', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-1', term: 'AIの公平性とデータバイアス',
    definition: '学習データの偏りはモデルの出力の偏り（バイアス）として現れる。歴史的な偏見を含むデータや特定の群の標本が少ないデータで学習すると、偏りが反映されるため、データ点検と層別の評価が必要になる。',
    reversePrompt: '学習データの偏りが出力の偏りとして現れる問題で、データの点検と層別の評価が必要とされる、倫理上の論点は？',
    lessonId: 'les-g10', questionIds: ['q-g10-1', 'q-g10-19'], sources: [JDLA, OECD_AI], difficulty: 2,
  }),
  c({
    id: 'card-g10-02', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-4', term: 'AIガバナンス',
    definition: '原則を作るだけでなく、開発・運用の各段階でリスクを評価し、監査し、改善する仕組み全体を指す。文書の整備だけではガバナンスとはいえない。',
    reversePrompt: '原則を作るだけでなく、開発・運用の各段階でリスクの評価・監査・改善を回す仕組み全体を指す言葉は？',
    lessonId: 'les-g10', questionIds: ['q-g10-4'], sources: [JDLA, OECD_AI], difficulty: 2,
  }),
  c({
    id: 'card-g10-03', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-2', term: 'EU AI法（AI Act）とリスクベースアプローチ',
    definition: 'EUのAI法は、AIの用途をリスクの高さで分類し、リスクに応じた規制を課すリスクベースアプローチを採る包括的な規制である。許容できないリスクの用途は禁止される。',
    reversePrompt: 'AIの用途をリスクの高さで分類し、リスクに応じた規制を課す、欧州の包括的な規制の考え方は？',
    confusion: '日本のガイドライン中心のソフトロー的アプローチとは異なる。ガイドラインと法律（ハードロー）を混同しない。',
    lessonId: 'les-g10', questionIds: ['q-g10-2'], sources: [JDLA, EU_AI], difficulty: 2,
  }),
  c({
    id: 'card-g10-04', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-8', term: '説明可能AI（XAI）',
    definition: '深層学習モデルの判断過程が見えにくいブラックボックス問題に対し、予測の根拠を人が理解できる形で示そうとする技術や考え方の総称である。説明可能性と予測性能はトレードオフで語られることが多い。',
    reversePrompt: '判断過程が見えにくいブラックボックス問題に対し、予測の根拠を人が理解できる形で示そうとする技術や考え方の総称は？',
    lessonId: 'les-g10', questionIds: ['q-g10-8', 'q-g10-30'], sources: [JDLA, OECD_AI], difficulty: 2,
  }),
  c({
    id: 'card-g10-05', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-16', term: 'SHAP',
    definition: '各特徴量の寄与度を、ゲーム理論のシャプレー値の考え方で公平に分配して示す説明手法である。予測ごとに、どの特徴がどれだけ効いたかを説明できる。',
    reversePrompt: '各特徴量の寄与度をゲーム理論の考え方で公平に分配し、予測ごとに根拠を示す説明手法は？',
    confusion: '画像の注目領域をヒートマップで示すGrad-CAMとは対象も方法も異なる説明手法である。',
    lessonId: 'les-g06', questionIds: ['q-g10-16'], sources: [JDLA, SHAP], difficulty: 3,
  }),
  c({
    id: 'card-g10-06', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-6', term: '敵対的サンプル（adversarial examples）',
    definition: '人間には分からない程度の小さなノイズを入力に加え、モデルに誤判定させるよう細工した入力データである。AIの安全性・セキュリティ上の論点になる。',
    reversePrompt: '人間には分からない程度の小さな改変を入力に加えてモデルに誤判定させるよう細工したデータは？',
    lessonId: 'les-g10', questionIds: ['q-g10-6'], sources: [JDLA, OECD_AI], difficulty: 2,
  }),
  c({
    id: 'card-g10-07', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-3', term: '透明性',
    definition: 'AI利用の透明性は多面的な概念で、モデルの仕組みの説明だけでなく、AIを利用していること自体の開示や、データの出所の明示も含まれる。',
    reversePrompt: '仕組みの説明だけでなく、AIを利用していること自体の開示やデータの出所の明示まで含む、多面的な倫理上の要請は？',
    lessonId: 'les-g10', questionIds: ['q-g10-3'], sources: [JDLA, CAO_PRINCIPLES], difficulty: 1,
  }),
  c({
    id: 'card-g10-08', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-5', term: '人間中心のAI社会原則',
    definition: '日本政府が公表したAI原則で、人間の尊厳と人間中心を基本理念とする。公平性・透明性・責任などの原則を含む、国内ガイドラインの基礎となった文書である。',
    reversePrompt: '人間の尊厳と人間中心を基本理念とし、日本のAIに関する指針の基礎となった政府の原則文書は？',
    lessonId: 'les-g10', questionIds: ['q-g10-5'], sources: [CAO_PRINCIPLES, JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g10-09', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-14', term: 'AI事業者ガイドライン',
    definition: '総務省・経済産業省が公表したガイドラインで、開発者・提供者・利用者の立場ごとに共通の指針と具体的な取り組みを示す。法的拘束力を持つ法律（ハードロー）ではない。',
    reversePrompt: '開発者・提供者・利用者の立場ごとに共通の指針と取り組みを示す、総務省・経済産業省のガイドラインは？',
    confusion: 'ガイドラインはソフトローであり、罰則を伴う法律とは拘束力が異なる。',
    lessonId: 'les-g10', questionIds: ['q-g10-14'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-g10-10', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-11', term: 'レッドチーミング',
    definition: '公開前に攻撃者の視点で想定外の入力や悪用のシナリオを試し、安全性上の問題を発見して対策につなげる実践である。',
    reversePrompt: '公開前に攻撃者の視点で想定外の入力や悪用シナリオを試し、安全性上の問題を見つけて対策につなげる実践は？',
    lessonId: 'les-g10', questionIds: ['q-g10-11'], sources: [JDLA, OECD_AI], difficulty: 3,
  }),

  // ===== l-01 AIの基本原理 =====
  c({
    id: 'card-l01-01', mode: 'literacy', syllabusId: 'l-01', conceptId: 'q-l01-1', term: 'トークン',
    definition: 'LLMがテキストを処理する単位である。単語そのものとは限らず、文字や単語の一部を含む単位で、モデルは「次のトークン」の予測を繰り返して文章を生成する。',
    reversePrompt: '言語モデルがテキストを処理する単位で、単語そのものとは限らず文字や単語の一部を含み、モデルはこの単位の「次」を予測して文章を生成するものは？',
    lessonId: 'les-l01', questionIds: ['q-l01-1'], sources: [JDLA, TOKENIZER], difficulty: 1,
  }),
  c({
    id: 'card-l01-02', mode: 'literacy', syllabusId: 'l-01', conceptId: 'q-l01-2', term: 'RAG（検索拡張生成）',
    definition: '外部文書を検索し、その内容を根拠として文脈に渡してから生成させる方式である。モデルの重みは変えず、知識の更新や出典の提示に有効。',
    reversePrompt: '外部文書を検索して根拠として渡してから生成させる方式で、モデルの重みは変えずに知識の更新や出典の提示に有効なものは？',
    lessonId: 'les-l01', questionIds: ['q-l01-2', 'q-l01-4'], sources: [JDLA, RAG_PAPER], difficulty: 2,
  }),
  c({
    id: 'card-l01-03', mode: 'literacy', syllabusId: 'l-01', conceptId: 'q-l01-3', term: 'コンテキストウィンドウ',
    definition: '1回の処理で参照できるトークン数の上限である。長い資料は分割・要約・検索で扱い、上限内でも重要な指示や根拠の置き方に注意する。',
    reversePrompt: '1回の処理で参照できる入力の長さの上限（単位は処理の最小単位の数）で、長い資料は分割や要約で扱う必要があるものは？',
    lessonId: 'les-l01', questionIds: ['q-l01-3'], sources: [JDLA, CTX_DOC], difficulty: 2,
  }),
  c({
    id: 'card-l01-04', mode: 'literacy', syllabusId: 'l-01', conceptId: 'q-l01-4', term: 'ファインチューニング（教養）',
    definition: '学習済みモデルを追加学習で適応させる方法である。口調・形式・特定の振る舞いの定着に向く。更新が頻繁な知識の参照や出典の提示には検索で根拠を渡す方式が向く。',
    reversePrompt: '学習済みモデルを追加学習で適応させる方法で、口調・形式・特定の振る舞いの定着に向くものは？',
    detail: '人間のフィードバックによる調整（RLHF）も追加学習による調整の一種である。',
    lessonId: 'les-l01', questionIds: ['q-l01-4'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l01-05', mode: 'literacy', syllabusId: 'l-01', conceptId: 'card-l01-05', term: '推論モデル',
    definition: '回答前に中間の推論過程を長く展開することで、数学や論理の課題の性能を高める設計のモデル群を指す。',
    reversePrompt: '回答を出す前に中間の推論過程を長く展開することで、数学や論理の課題の性能を高める設計のモデル群は？',
    lessonId: 'les-l01', questionIds: [], sources: [JDLA, ATTN], difficulty: 2,
  }),
  c({
    id: 'card-l01-06', mode: 'literacy', syllabusId: 'l-01', conceptId: 'card-l01-06', term: '学習と推論の区別',
    definition: '学習はデータからモデルの重みを作る工程（事前学習や追加学習）で、推論は学習済みモデルを使って入力から出力を生成する工程である。利用者がサービスを使うときに行われているのは推論である。',
    reversePrompt: 'データからモデルの重みを作る工程と、学習済みモデルを使って出力を生成する工程の区別で、利用者がサービスを使うときに行われているのは後者であるものは？',
    confusion: 'サービスに文章を入力しても、その場でモデルが学習し直すわけではない（推論のみ）。',
    lessonId: 'les-l01', questionIds: [], sources: [JDLA, ATTN], difficulty: 1,
  }),

  // ===== l-02 生成AIサービスの活用 =====
  c({
    id: 'card-l02-01', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-1', term: 'サービス比較の記録（バージョン・日時）',
    definition: 'AIサービスの比較では、モデル名だけでなく、バージョン、利用プラン、評価日時をセットで記録する。条件が変わるため、記録がなければ比較は再現できない。',
    reversePrompt: 'AIサービスを比較するとき、モデル名だけでなく一緒に記録すべきだとされる、版・利用プラン・評価日時といった条件の組は？',
    lessonId: 'les-l02', questionIds: ['q-l02-1'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-l02-02', mode: 'literacy', syllabusId: 'l-02', conceptId: 'card-l02-02', term: 'ベンチマークの限界',
    definition: 'ベンチマークの数字は評価条件に強く依存するため、そのまま実務性能の絶対序列にはならない。自業務のタスクで小規模に試し、正確さ・速度・コストを実測することが比較の基本である。',
    reversePrompt: '公開指標の数字は評価条件に強く依存するため実務性能の絶対序列にはならず、自業務のタスクで実測すべきだとされる理由は？',
    lessonId: 'les-l02', questionIds: ['q-l02-1', 'q-l02-4'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-l02-03', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-2', term: '機密情報の入力可否の判断',
    definition: '業務で使うAIサービスへ機密情報を入力してよいかは、サービスのデータ利用ポリシーと所属組織の規程の両方で決まる。個人の判断で会社の情報を入れてはならない。',
    reversePrompt: '業務のAIサービスへ機密情報を入力してよいかは、サービスのデータ利用条件と所属組織の規程の両方で決まり、個人の判断で決めてはならない、という判断の枠組みは？',
    lessonId: 'les-l02', questionIds: ['q-l02-2'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-l02-04', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-3', term: '提供形態ごとの条件の違い（アプリ／法人プラン／API）',
    definition: '同じ会社のサービスでも、個人向けアプリ・法人向けプラン・APIでは、データの扱い・利用上限・料金体系が別々に定められている。APIはトークン単位の従量課金が一般的である。',
    reversePrompt: '同じ会社のサービスでも、個人向けアプリ・法人向けプラン・プログラム連携用の窓口では、データの扱い・上限・料金が別々に定められている、という区別は？',
    lessonId: 'les-l02', questionIds: ['q-l02-3'], sources: [JDLA, OPENAI_MODELS], difficulty: 2,
  }),
  c({
    id: 'card-l02-05', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-4', term: '上位モデルと軽量モデルの使い分け',
    definition: '各社は性能重視の上位モデルと、速度・費用重視の軽量モデルを並べて提供している。大量の定型処理は軽量モデル、難しい推論は上位モデルというように用途で使い分ける。',
    reversePrompt: '性能重視の大型モデルと速度・費用重視の小型モデルを使い分ける考え方で、大量の定型処理は後者、難しい推論は前者に向くものは？',
    lessonId: 'les-l02', questionIds: ['q-l02-4'], sources: [JDLA, CLAUDE_MODELS], difficulty: 1,
  }),
  c({
    id: 'card-l02-06', mode: 'literacy', syllabusId: 'l-02', conceptId: 'card-l02-06', term: '無料版と有料版の違い',
    definition: '無料版と有料版では、使えるモデル、利用上限、入力データが学習に使われるかの条件が異なることが一般的である。条件は変わるため、契約時点の公式条件を確認する。',
    reversePrompt: '使えるモデル・利用上限・入力データの学習利用の条件が異なることが一般的で、契約時点の公式条件の確認が必要な、料金プラン間の区別は？',
    lessonId: 'les-l02', questionIds: [], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),

  // ===== l-03 プロンプトエンジニアリング =====
  c({
    id: 'card-l03-01', mode: 'literacy', syllabusId: 'l-03', conceptId: 'card-l03-01', term: '良い指示の要素',
    definition: '良い指示の要素は、目的、背景・文脈、入力の範囲、出力形式、制約、評価基準である。「万能プロンプト」は存在せず、モデルとタスクに応じて調整する。',
    reversePrompt: '指示を設計するときにそろえるべき要素として、目的・背景や文脈・入力の範囲・出力形式・制約・評価基準が挙げられる考え方は？',
    confusion: '長く書けば必ず良くなるわけではない。',
    lessonId: 'les-l03', questionIds: [], sources: [JDLA, PROMPT_GUIDE], difficulty: 1,
  }),
  c({
    id: 'card-l03-02', mode: 'literacy', syllabusId: 'l-03', conceptId: 'q-l03-3', term: 'few-shot（例示）',
    definition: 'プロンプトに入出力の例をいくつか含め、期待する形式や粒度、判断基準を具体例で伝える方法である。言葉だけでは伝えにくい要求を伝えるのに有効。',
    reversePrompt: '指示文の中に入出力の例をいくつか含めて、期待する形式や粒度を具体例で伝える方法は？',
    lessonId: 'les-l03', questionIds: ['q-l03-3'], sources: [JDLA, PROMPT_GUIDE], difficulty: 2,
  }),
  c({
    id: 'card-l03-03', mode: 'literacy', syllabusId: 'l-03', conceptId: 'q-l03-2', term: '構造化出力',
    definition: 'JSONなどの形式を指定して出力させる方法である。後段の処理や検証が容易になるが、形式が正しくても内容の正確さが保証されるわけではない。スキーマを明示し、形式違反時の扱いも決める。',
    reversePrompt: '機械可読な形式を指定して出力させる方法で、後段の処理や検証は容易になるが内容の正確さは保証されないものは？',
    lessonId: 'les-l03', questionIds: ['q-l03-2'], sources: [JDLA, STRUCT_OUT], difficulty: 2,
  }),
  c({
    id: 'card-l03-04', mode: 'literacy', syllabusId: 'l-03', conceptId: 'q-l03-1', term: 'プロンプトインジェクション',
    definition: '外部文書などに埋め込まれた指示文によって、AIが本来の指示から逸脱させられる攻撃である。外部テキストは「データ」であって「命令」ではないと扱う設計が基本対策になる。',
    reversePrompt: '外部文書に埋め込まれた指示文によってAIが本来の指示から逸脱させられる攻撃で、外部テキストはデータであって命令ではないと扱うことが基本対策になるものは？',
    lessonId: 'les-l03', questionIds: ['q-l03-1'], sources: [OWASP, JDLA], difficulty: 2,
  }),
  c({
    id: 'card-l03-05', mode: 'literacy', syllabusId: 'l-03', conceptId: 'card-l03-05', term: 'タスク分解',
    definition: '複雑なタスクを段階に分け、段階ごとに中間成果物を確認しながら進める進め方である。失敗の早期発見につながる。',
    reversePrompt: '複雑なタスクを段階に分けて中間成果物を確認しながら進め、失敗を早期に見つける進め方は？',
    lessonId: 'les-l03', questionIds: [], sources: [JDLA, PROMPT_GUIDE], difficulty: 1,
  }),
  c({
    id: 'card-l03-06', mode: 'literacy', syllabusId: 'l-03', conceptId: 'q-l03-4', term: 'プロンプト改善の実験作法',
    definition: '改善は実験として行う。条件を1つずつ変え、同じ評価課題・同じ判定基準で比較し、記録を残すことで再現可能な比較になる。',
    reversePrompt: '指示の改善を実験として行い、条件を1つずつ変えて同じ評価課題で比較し記録を残す進め方は？',
    lessonId: 'les-l03', questionIds: ['q-l03-4'], sources: [JDLA, PROMPT_GUIDE], difficulty: 2,
  }),

  // ===== l-04 業務への応用 =====
  c({
    id: 'card-l04-01', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-1', term: '下書きはAI、判断は人間',
    definition: 'AI活用の基本分担である。文書作成・要約・翻訳・候補出しなどの下書きはAIが強く、最終判断と検証は人間が行う。検証なしの転記や専門判断の丸投げは典型的な失敗パターン。',
    reversePrompt: 'AI活用の基本分担として、下書きや候補出しはAIが担い、最終判断と検証は人間が行うという考え方は？',
    lessonId: 'les-l04', questionIds: ['q-l04-1'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),
  c({
    id: 'card-l04-02', mode: 'literacy', syllabusId: 'l-04', conceptId: 'card-l04-02', term: '引用と数値の原典確認',
    definition: 'AIの出力に含まれる引用・数値・固有名詞は、原典で確認するまで採用しない作法である。実在しない文献が生成される事例が知られており、要約だけを読んで原文を確認しない使い方は失敗しやすい。',
    reversePrompt: 'AIの出力に含まれる引用や数値は原典で確認するまで採用せず、要約だけを読んで原文を確認しない使い方は失敗しやすい、という作法は？',
    lessonId: 'les-l04', questionIds: ['q-l04-1', 'q-l04-2'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-l04-03', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-3', term: 'データ分析でのAI活用作法',
    definition: 'AIにコードを書かせて実行し、集計結果を元データと照合する進め方である。文章として生成された計算結果は誤りを含むことがあり、期間・外れ値・欠損などの分析の前提は人が確認する。',
    reversePrompt: 'AIにコードを書かせて実行し、集計結果を元データと照合する分析の進め方で、文章として生成された計算結果はそのまま使わないものは？',
    lessonId: 'les-l04', questionIds: ['q-l04-3'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l04-04', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-4', term: '生成コードの利用作法',
    definition: 'AIが生成したコードは、人が書いたコードと同じくテスト・レビュー・依存関係の確認を経て使う。実在しないパッケージ名が提案されることがあり、認証情報をプロンプトに含めるのは漏えいの原因になる。',
    reversePrompt: 'AIが生成したコードをテスト・レビュー・依存関係の確認を経て使う作法で、実在しないパッケージ名の提案や認証情報の混入に注意するものは？',
    lessonId: 'les-l04', questionIds: ['q-l04-4'], sources: [JDLA, GH_SECRET], difficulty: 2,
  }),
  c({
    id: 'card-l04-05', mode: 'literacy', syllabusId: 'l-04', conceptId: 'card-l04-05', term: '効果測定（修正工数込み）',
    definition: 'AI活用の効果は処理時間だけでなく、修正工数と誤り率を含めて評価する考え方である。生成が速くても直しが多ければ、効果は小さいことがある。',
    reversePrompt: 'AI活用の効果を処理時間だけでなく修正にかかる手間と誤り率を含めて評価する考え方は？',
    lessonId: 'les-l04', questionIds: [], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-l04-06', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-2', term: '文献調査でのAI活用の注意',
    definition: '文献の当たり付けや仮説の列挙には有効だが、引用の実在確認と数値の原典確認は必須である。実在しない文献がもっともらしく生成される事例が知られている。',
    reversePrompt: '文献の当たり付けや仮説の列挙には有効だが、引用の実在確認と数値の原典確認が必須とされる、研究開発でのAI活用上の注意は？',
    lessonId: 'les-l04', questionIds: ['q-l04-2'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),

  // ===== l-05 AIエージェント・開発 =====
  c({
    id: 'card-l05-01', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-1', term: 'AIエージェント',
    definition: 'LLMが計画を立て、ツールを呼び出し、結果を見て次の行動を決めるループを持つ仕組みである。計画→ツール実行→観察→次の行動の繰り返しでタスクを進める。',
    reversePrompt: '言語モデルが計画を立て、ツールを呼び出し、結果を見て次の行動を決めるループを持つ仕組みは？',
    lessonId: 'les-l05', questionIds: ['q-l05-1'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-l05-02', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-2', term: 'エージェントの権限設計',
    definition: '安全性の中心となる設計である。読み取りと書き込み、社内と社外、可逆と不可逆を分け、最小限の権限を与え、不可逆な操作には人間の承認を挟む。ログによる監査可能性も必要。',
    reversePrompt: '読み取りと書き込み・社内と社外・可逆と不可逆を分け、最小限の権限を与えて不可逆な操作には人間の承認を挟む、安全性の中心となる設計は？',
    confusion: '自律システムに無制限の書き込み権限を与えるのは危険である。',
    lessonId: 'les-l05', questionIds: ['q-l05-2'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l05-03', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-3', term: 'MCP（Model Context Protocol）',
    definition: 'AIアプリとツール・データをつなぐオープンなプロトコルで、Anthropicが公開した。サーバー側はツール・リソース・プロンプトを提供する。接続先に与える権限と、ツール経由で入る外部テキストの扱いに注意する。',
    reversePrompt: 'AIアプリとツールやデータをつなぐオープンな取り決めで、サーバー側がツール・リソース・プロンプトを提供するものは？（略称で答える）',
    lessonId: 'les-l05', questionIds: ['q-l05-3'], sources: [MCP_NEWS, MCP_SPEC], difficulty: 2,
  }),
  c({
    id: 'card-l05-04', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-4', term: 'APIキーの管理',
    definition: 'APIキーは秘密情報としてサーバー側で管理し、ブラウザで動くコードや公開リポジトリに含めない。料金と上限はトークン数や要求回数で決まることが多い。',
    reversePrompt: 'プログラム連携の認証情報は秘密情報としてサーバー側で管理し、利用者の端末に配信されるコードや公開リポジトリに含めない、という管理の原則は？',
    lessonId: 'les-l05', questionIds: ['q-l05-4'], sources: [JDLA, GH_SECRET], difficulty: 2,
  }),
  c({
    id: 'card-l05-05', mode: 'literacy', syllabusId: 'l-05', conceptId: 'card-l05-05', term: '状態管理と監査ログ',
    definition: '長時間タスクでは、状態の保存、途中結果の検証、失敗時の再開地点の記録が不可欠である。ログと監査可能性がなければ、誤動作の原因追跡ができない。',
    reversePrompt: '長時間タスクで不可欠とされる、状態の保存・途中結果の検証・失敗時の再開地点の記録と、原因追跡のための記録の保持は？',
    lessonId: 'les-l05', questionIds: [], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l05-06', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-5', term: '高能力モデルの限定提供（承認制アクセス）',
    definition: '能力の高いモデルほど、誰に使わせるかというアクセス承認と、許可範囲を守らせる設計が一体になる。2026年11月に発表されたOpenAIのサイバーセキュリティ特化モデルは、承認済み顧客の一部への限定提供とされた事例である。',
    reversePrompt: '能力の高いモデルで採られる、提供先を承認済みの顧客に限定し、許可範囲を守らせる設計と一体で運用する提供形態は？',
    lessonId: 'les-l05', questionIds: ['q-l05-5'], sources: [JDLA, GPT6CYBER], difficulty: 3,
  }),

  // ===== l-06 情報の信頼性 =====
  c({
    id: 'card-l06-01', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-1', term: 'ハルシネーション',
    definition: 'AIが、もっともらしいが事実でない内容を生成する現象である。流暢さは正確さの証拠にはならない。',
    reversePrompt: 'AIがもっともらしいが事実でない内容を生成する現象で、流暢さが正確さの証拠にならないとされるものは？',
    lessonId: 'les-l06', questionIds: ['q-l06-1'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),
  c({
    id: 'card-l06-02', mode: 'literacy', syllabusId: 'l-06', conceptId: 'card-l06-02', term: '一次資料への遡及',
    definition: '検証の基本作法である。数値・固有名詞・引用・日付は、原典で確認するまで「未確認」として扱う。AI自身への確認は独立した検証にならない。',
    reversePrompt: '数値・固有名詞・引用・日付を原典で確認するまで未確認として扱う、検証の基本作法は？',
    lessonId: 'les-l06', questionIds: ['q-l06-3', 'q-l06-4'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),
  c({
    id: 'card-l06-03', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-2', term: 'データ汚染（評価データの学習混入）',
    definition: '評価に使うデータがモデルの学習データに含まれてしまい、ベンチマークの成績が実力以上に見える問題である。評価結果を読む際に確認すべき論点の一つ。',
    reversePrompt: '評価用のデータがモデルの学習データに含まれてしまい、成績が実力以上に見える問題は？',
    lessonId: 'les-l06', questionIds: ['q-l06-2'], sources: [JDLA, OWASP], difficulty: 3,
  }),
  c({
    id: 'card-l06-04', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-3', term: '引用文献の確認（書誌情報と内容）',
    definition: '引用の検証では、書誌情報が実在することと、引用された内容が原文に実際に書かれていることの両方を原典で確認する。片方だけでは不十分である。',
    reversePrompt: '引用の検証で必要な、書誌情報の実在と、引用内容が原文に書かれていることの両方の確認は？',
    lessonId: 'les-l06', questionIds: ['q-l06-3'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l06-05', mode: 'literacy', syllabusId: 'l-06', conceptId: 'card-l06-05', term: '転載は独立した裏付けにならない',
    definition: '複数の二次情報が同じ誤りを転載していることがあるため、「複数のサイトに書いてある」だけでは確定とはいえない。独立した情報源かどうかを見極めることが重要である。',
    reversePrompt: '複数の二次情報が同じ誤りを写し合っていることがあるため、件数の多さだけでは裏付けにならないという注意点は？',
    lessonId: 'les-l06', questionIds: [], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-l06-06', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-4', term: '数値の未確認扱い',
    definition: 'AIの回答に含まれる数値は、出典・対象期間・定義・算出方法を原典で確かめるまで「未確認」として扱う。桁の細かさや口調の確かさは正確さの根拠にならない。',
    reversePrompt: 'AIの回答の数値を、出典・対象期間・定義・算出方法を原典で確かめるまで未確認として扱う作法は？',
    lessonId: 'les-l06', questionIds: ['q-l06-4'], sources: [JDLA, OWASP], difficulty: 2,
  }),

  // ===== l-07 法律・倫理・社会 =====
  c({
    id: 'card-l07-01', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-1', term: '法・ガイドライン・自主基準の区別',
    definition: 'AIに関する制度は、現行法、未施行法、ガイドライン、自主基準、提案段階の制度を区別して扱う。拘束力と適用時期の区別が正確な理解の前提になる。',
    reversePrompt: 'AIに関する制度を扱う際に必要な、現行法・未施行法・ガイドライン・自主基準・提案段階の制度を分ける区別は？',
    lessonId: 'les-l07', questionIds: ['q-l07-1'], sources: [JDLA, BUNKA], difficulty: 2,
  }),
  c({
    id: 'card-l07-02', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-2', term: '説明責任',
    definition: '「誰が・何を根拠に・どう判断したか」を後から説明できる状態を保つことである。AIの出力を採用した判断でも責任は利用する側にあり、「AIがそう言った」は説明にならない。',
    reversePrompt: '誰が・何を根拠に・どう判断したかを後から説明できる状態を保つことで、AIの出力を採用した判断でも責任は利用側にあるとされる考え方は？',
    lessonId: 'les-l07', questionIds: ['q-l07-2'], sources: [JDLA, BUNKA], difficulty: 2,
  }),
  c({
    id: 'card-l07-03', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-4', term: 'AI推進法（人工知能関連技術の研究開発及び活用の推進に関する法律）',
    definition: '2025年に公布された日本の法律（令和7年法律第53号）で、AIの研究開発と活用の推進を目的とする基本的な枠組みを定める。EUのAI法のような罰則付きのリスク分類規制とは性格が異なる。',
    reversePrompt: '2025年に公布された日本の法律で、研究開発と活用の推進を目的とする基本的な枠組みを定め、罰則付きのリスク分類規制とは性格が異なるものは？（略称で答える）',
    lessonId: 'les-l07', questionIds: ['q-l07-4'], sources: [AI_ACT_JP, JDLA], difficulty: 2,
  }),
  c({
    id: 'card-l07-04', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-3', term: '人工知能基本計画',
    definition: '2025年12月に閣議決定された日本の計画である。人間中心のAI社会原則を堅持しつつ、イノベーション促進とリスク対応の両立を基本的な考え方とする。',
    reversePrompt: '2025年12月に閣議決定された日本の計画で、人間中心の原則を堅持しつつ革新の促進とリスク対応の両立を基本的な考え方とするものは？',
    lessonId: 'les-l07', questionIds: ['q-l07-3'], sources: [AI_PLAN, JDLA], difficulty: 2,
  }),
  c({
    id: 'card-l07-05', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-5', term: '生成AIへの個人情報入力の留意点',
    definition: '生成AIに個人情報を入力する場合は、利用目的の範囲内かどうか、入力データが提供事業者側で学習などに使われないかを確認する。個人情報保護委員会が注意喚起を公表している。',
    reversePrompt: '生成AIに個人情報を入力する際、利用目的の範囲内か、入力データが事業者側で学習などに使われないかを確認すべきだとされる留意点は？',
    lessonId: 'les-l07', questionIds: ['q-l07-5'], sources: [PPC_GENAI, JDLA], difficulty: 2,
  }),
  c({
    id: 'card-l07-06', mode: 'literacy', syllabusId: 'l-07', conceptId: 'card-l07-06', term: '生成物の利用可否の判断要素',
    definition: '生成物の利用可否は、入力データの権利、生成過程、出力の類似性、利用形態によって変わり、一律の答えはない。',
    reversePrompt: '生成物の利用可否は入力データの権利・生成過程・出力の類似性・利用形態によって変わり一律の答えはない、という判断の枠組みは？',
    lessonId: 'les-l07', questionIds: [], sources: [JDLA, BUNKA], difficulty: 2,
  }),
];

export const publishedFlashcards = FLASHCARDS;
