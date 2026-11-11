import type { SourceRef } from '../types';

// gExtraQuestions1.ts / gExtraQuestions2.ts（q-g01〜g06 の追加問題）のうち出典が1件
// （JDLA公式のみ）だった問題への追加出典（裏付け強化）。2026-11-11 作成。
// 追加先は各問題の正答・解説の主張を実際に支持する一次情報に限る。
// 選定は repo 内で既に使用実績のある一次情報プール（questionSources.ts 等）を優先し、
// プールに適合するものが無い場合に限って新規の原著・公式資料・学術百科事典を追加した。
// 新規URLは全て curl で HTTP 200 を確認済みで、一部は本文のキーワード収録まで確認した。
// 既存出典（JDLA公式ページ）とは重複させていない。

// ===== repo 内プール（既出の一次情報） =====
const SEP_AI: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Artificial Intelligence」', url: 'https://plato.stanford.edu/entries/artificial-intelligence/' };
const SEP_ROOM: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「The Chinese Room」（弱いAI／強いAIの区別）', url: 'https://plato.stanford.edu/entries/chinese-room/' };
const SEP_TT: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「The Turing Test」', url: 'https://plato.stanford.edu/entries/turing-test/' };
const SK_EVAL: SourceRef = { title: 'scikit-learn: Model evaluation（評価指標の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' };
const SK_LIN: SourceRef = { title: 'scikit-learn: Linear Models（正則化・最小二乗法の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/linear_model.html' };
const SK_ENS: SourceRef = { title: 'scikit-learn: Ensemble methods（バギング・スタッキングの公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/ensemble.html' };
const SK_TREE: SourceRef = { title: 'scikit-learn: Decision Trees（剪定の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/tree.html' };
const SK_CLUS: SourceRef = { title: 'scikit-learn: Clustering（k-means等の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/clustering.html' };
const SK_PRE: SourceRef = { title: 'scikit-learn: Preprocessing data（標準化・特徴量処理の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/preprocessing.html' };
const SK_UG: SourceRef = { title: 'scikit-learn: User Guide（教師あり／教師なし学習の全体像）', url: 'https://scikit-learn.org/stable/user_guide.html' };
const SK_NN: SourceRef = { title: 'scikit-learn: Neural network models（MLPの公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/neural_networks_supervised.html' };
const PT_MAXPOOL: SourceRef = { title: 'PyTorch: torch.nn.MaxPool2d（公式ドキュメント、出力サイズの式）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.MaxPool2d.html' };
const PT_CONV: SourceRef = { title: 'PyTorch: torch.nn.Conv2d（公式ドキュメント、重みの形状・dilation・パディング）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html' };
const PT_LSTM: SourceRef = { title: 'PyTorch: torch.nn.LSTM（公式ドキュメント、ゲートとセル状態の式）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.LSTM.html' };
const PT_AUTOGRAD: SourceRef = { title: 'PyTorch: Automatic differentiation（autograd 公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/autograd.html' };
const PT_SGD: SourceRef = { title: 'PyTorch: torch.optim.SGD（公式ドキュメント、更新式と Nesterov の指定）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.optim.SGD.html' };
const PT_QUANT: SourceRef = { title: 'PyTorch: Quantization（量子化の公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/quantization.html' };
const PT_TRANSFER: SourceRef = { title: 'PyTorch 公式チュートリアル: Transfer Learning for Computer Vision', url: 'https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html' };
const AX_ADAM: SourceRef = { title: 'Kingma & Ba "Adam: A Method for Stochastic Optimization" (arXiv:1412.6980)', url: 'https://arxiv.org/abs/1412.6980' };
const AX_DISTILL: SourceRef = { title: 'Hinton et al. "Distilling the Knowledge in a Neural Network" (arXiv:1503.02531)', url: 'https://arxiv.org/abs/1503.02531' };
const AX_BN: SourceRef = { title: 'Ioffe & Szegedy "Batch Normalization" (arXiv:1502.03167)', url: 'https://arxiv.org/abs/1502.03167' };
const AX_VAE: SourceRef = { title: 'Kingma & Welling "Auto-Encoding Variational Bayes" (arXiv:1312.6114)', url: 'https://arxiv.org/abs/1312.6114' };
const AX_W2V: SourceRef = { title: 'Mikolov et al. "Efficient Estimation of Word Representations in Vector Space" (arXiv:1301.3781)', url: 'https://arxiv.org/abs/1301.3781' };
const AX_ATTN: SourceRef = { title: 'Vaswani et al. "Attention Is All You Need" (arXiv:1706.03762)', url: 'https://arxiv.org/abs/1706.03762' };
const AX_DQN: SourceRef = { title: 'Mnih et al. "Playing Atari with Deep Reinforcement Learning" (arXiv:1312.5602、経験再生の原著)', url: 'https://arxiv.org/abs/1312.5602' };
const AX_SHAP: SourceRef = { title: 'Lundberg & Lee "A Unified Approach to Interpreting Model Predictions" (arXiv:1705.07874)', url: 'https://arxiv.org/abs/1705.07874' };
const AX_LIME: SourceRef = { title: 'Ribeiro et al. "Why Should I Trust You?" (LIME 原著、arXiv:1602.04938)', url: 'https://arxiv.org/abs/1602.04938' };
const AX_CLIP: SourceRef = { title: 'Radford et al. "Learning Transferable Visual Models From Natural Language Supervision" (CLIP 原著、arXiv:2103.00020)', url: 'https://arxiv.org/abs/2103.00020' };
const AX_BERT: SourceRef = { title: 'Devlin et al. "BERT" (arXiv:1810.04805、固有表現抽出を下流タスクとして評価)', url: 'https://arxiv.org/abs/1810.04805' };
const AX_UNET: SourceRef = { title: 'Ronneberger et al. "U-Net" (arXiv:1505.04597、スキップ接続の原著)', url: 'https://arxiv.org/abs/1505.04597' };
const JMLR_DROP: SourceRef = { title: 'Srivastava et al. "Dropout: A Simple Way to Prevent Neural Networks from Overfitting" (JMLR 2014)', url: 'https://www.jmlr.org/papers/v15/srivastava14a.html' };
const SB: SourceRef = { title: 'Sutton & Barto "Reinforcement Learning: An Introduction" 2nd ed.（ε-greedy・割引率の原典教科書）', url: 'https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf' };
const OECD: SourceRef = { title: 'OECD AI Principles（AIシステムの定義を含む）', url: 'https://www.oecd.org/en/topics/sub-issues/ai-principles.html' };

// ===== 新規追加（全て HTTP 200 確認済み） =====
const SEP_EMB: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Embodied Cognition」（モラベックのパラドックス等の身体性）', url: 'https://plato.stanford.edu/entries/embodied-cognition/' };
const SEP_CONN: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Connectionism」（形式ニューロンと記号主義との対比）', url: 'https://plato.stanford.edu/entries/connectionism/' };
const SEP_CMIND: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Computational Theory of Mind」（計算主義・物理記号システム仮説）', url: 'https://plato.stanford.edu/entries/computational-mind/' };
const SEP_TM: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Turing Machines」', url: 'https://plato.stanford.edu/entries/turing-machine/' };
const SEP_LAI: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Logic and Artificial Intelligence」（知識表現・推論・エキスパートシステムの説明機能）', url: 'https://plato.stanford.edu/entries/logic-ai/' };
const SEP_LCL: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Classical Logic」（命題論理・述語論理・量化子）', url: 'https://plato.stanford.edu/entries/logic-classical/' };
const SEP_FUZZY: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Fuzzy Logic」（メンバーシップの度合い）', url: 'https://plato.stanford.edu/entries/logic-fuzzy/' };
const SEP_ABD: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Abduction」', url: 'https://plato.stanford.edu/entries/abduction/' };
const SEP_NONMONO: SourceRef = { title: 'Stanford Encyclopedia of Philosophy「Non-monotonic Logic」（継承と例外・デフォルト推論）', url: 'https://plato.stanford.edu/entries/logic-nonmonotonic/' };
const MITCHELL: SourceRef = { title: 'Tom Mitchell "Machine Learning" 公式サイト（CMU、経験E・タスクT・性能Pによる学習の定義）', url: 'https://www.cs.cmu.edu/~tom/mlbook.html' };
const MCCARTHY: SourceRef = { title: 'McCarthy "Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I" (1960、LISP原著論文)', url: 'https://www-formal.stanford.edu/jmc/recursive.pdf' };
const CYC: SourceRef = { title: 'Cyc 公式サイト（常識知識ベース Cyc のプロジェクト公式情報）', url: 'https://cyc.com/' };
const ARCH_CYB: SourceRef = { title: 'Wiener "Cybernetics" 初版（Archive.org、制御と通信の原著）', url: 'https://archive.org/details/cyberneticsorcon0000unse' };
const ARCH_GPS: SourceRef = { title: 'RAND RM-3337-PR "A Guide to the General Problem Solver Program (GPS)" (1963、手段‐目標分析を含む GPS 公式マニュアル、Archive.org)', url: 'https://archive.org/details/bitsavers_randiplRM3eralProblemSolverProgramGPS22Feb63_7213399' };
const ARCH_HB: SourceRef = { title: 'Barr & Feigenbaum (eds.) "The Handbook of Artificial Intelligence" Vol.1 (1981、HEARSAY-II とブラックボードモデルの解説、Archive.org)', url: 'https://archive.org/details/handbookofartifi01barr' };
const IEP: SourceRef = { title: 'Internet Encyclopedia of Philosophy「Artificial Intelligence」（Logic Theorist 等の初期AI史）', url: 'https://iep.utm.edu/art-inte/' };
const IBM_DB: SourceRef = { title: 'IBM 公式ヒストリー「Deep Blue」', url: 'https://www.ibm.com/history/deep-blue' };
const IBM_WINTER: SourceRef = { title: 'IBM「AI winter とは何か」（ブームと冬の歴史の解説）', url: 'https://www.ibm.com/think/topics/ai-winter' };
const NAT_AG: SourceRef = { title: 'Silver et al. "Mastering the game of Go with deep neural networks and tree search" (Nature 2016、AlphaGo 原著論文)', url: 'https://www.nature.com/articles/nature16961' };
const NAT_DQN: SourceRef = { title: 'Mnih et al. "Human-level control through deep reinforcement learning" (Nature 2015、ターゲットネットワークの原著論文)', url: 'https://www.nature.com/articles/nature14236' };
const DARTMOUTH: SourceRef = { title: 'ダートマス会議提案書（1955、McCarthy 公式サイト所収の原文）', url: 'https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html' };
const CS188_AGENTS: SourceRef = { title: 'UC Berkeley CS188 教科書「Agents」（エージェントの類型：反射／モデルベース等の公式教材）', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/search/agents.html' };
const CS188_STATE: SourceRef = { title: 'UC Berkeley CS188 教科書「State Spaces and Search Problems」', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/search/state.html' };
const CS188_UNINF: SourceRef = { title: 'UC Berkeley CS188 教科書「Uninformed Search」（完全性・探索済み集合の公式教材）', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/search/uninformed.html' };
const CS188_INF: SourceRef = { title: 'UC Berkeley CS188 教科書「Informed Search」（A* の g(n)・h(n)・許容性の公式教材）', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/search/informed.html' };
const CS188_MINIMAX: SourceRef = { title: 'UC Berkeley CS188 教科書「Minimax」（ゲーム木の公式教材）', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/games/minimax.html' };
const CS188_CSP: SourceRef = { title: 'UC Berkeley CS188 教科書「Constraint Satisfaction Problems」', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/csp/csps.html' };
const CS188_SOLVE: SourceRef = { title: 'UC Berkeley CS188 教科書「Solving CSPs」（バックトラッキング探索の公式教材）', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/csp/solving.html' };
const AIMA_PDF: SourceRef = { title: 'Russell & Norvig "Artificial Intelligence: A Modern Approach" 公式サイト所収 Algorithms 一覧（双方向探索・深さ制限探索・焼きなまし法の擬似コード）', url: 'https://aima.cs.berkeley.edu/algorithms.pdf' };
const PM_S7: SourceRef = { title: 'Poole & Mackworth "Artificial Intelligence: Foundations of Computational Agents" 2e, 4.7 Local Search（ランダムリスタート）', url: 'https://artint.info/2e/html2e/ArtInt2e.Ch4.S7.html' };
const PM_S8: SourceRef = { title: 'Poole & Mackworth "Artificial Intelligence" 2e, 4.8 Population-Based Methods（遺伝的アルゴリズム・交叉）', url: 'https://artint.info/2e/html2e/ArtInt2e.Ch4.S8.html' };
const PM_PROP: SourceRef = { title: 'Poole & Mackworth "Artificial Intelligence" 2e, 5.1 Propositions（命題の表現）', url: 'https://artint.info/2e/html2e/ArtInt2e.Ch5.S1.html' };
const PM_PLAN: SourceRef = { title: 'Poole & Mackworth "Artificial Intelligence" 2e, 6.1 Representing States, Actions, and Goals（STRIPS・前提条件と効果）', url: 'https://artint.info/2e/html2e/ArtInt2e.Ch6.S1.html' };
const PM_ONTO: SourceRef = { title: 'Poole & Mackworth "Artificial Intelligence" 2e, 14.3.3 Top-Level Ontologies（上位／ドメインオントロジーの階層）', url: 'https://artint.info/2e/html2e/ArtInt2e.Ch14.S3.SS3.html' };
const MURPHY: SourceRef = { title: 'Murphy "A Brief Introduction to Graphical Models and Bayesian Networks" (UBC、ベイジアンネットワーク入門)', url: 'https://www.cs.ubc.ca/~murphyk/Bayes/bnintro.html' };
const AAAI_R1: SourceRef = { title: 'McDermott "R1: An Expert in the Computer Systems Domain" (AAAI 1980、XCON 原著論文ページ)', url: 'https://aaai.org/papers/00269-r1-an-expert-in-the-computer-systems-domain/' };
const LIGHTHILL: SourceRef = { title: 'Lighthill Report 全文 (1973、Chilton Computing 所収)', url: 'https://www.chilton-computing.org.uk/inf/literature/reports/lighthill_report/p001.htm' };
const MINSKY: SourceRef = { title: 'Minsky "A Framework for Representing Knowledge" (MIT AI Memo 306、フレームとデフォルト値の原著、MIT DSpace)', url: 'https://dspace.mit.edu/handle/1721.1/6089' };
const ICOT: SourceRef = { title: 'ICOT（新世代コンピュータ技術開発機構）公式アーカイブ（第五世代コンピュータプロジェクト）', url: 'https://www.icot.or.jp/' };
const CLIPS_BPG: SourceRef = { title: 'CLIPS Basic Programming Guide（NASA 発祥のルールエンジン公式ガイド、競合解消戦略：具体性等）', url: 'https://www.clipsrules.net/documentation/v642/bpg642.pdf' };
const SK_CV: SourceRef = { title: 'scikit-learn: Cross-validation（ホールドアウト・交差検証・LOOCV の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/cross_validation.html' };
const SK_NB: SourceRef = { title: 'scikit-learn: Naive Bayes（特徴量独立の仮定の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/naive_bayes.html' };
const SK_MANI: SourceRef = { title: 'scikit-learn: Manifold learning（t-SNE の公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/manifold.html' };
const SK_LC: SourceRef = { title: 'scikit-learn: Validation curves / Learning curve（バイアスとバリアンスの公式ドキュメント）', url: 'https://scikit-learn.org/stable/modules/learning_curve.html' };
const SK_GS: SourceRef = { title: 'scikit-learn: Tuning the hyper-parameters of an estimator（パラメータとハイパーパラメータの区別）', url: 'https://scikit-learn.org/stable/modules/grid_search.html' };
const IMB: SourceRef = { title: 'imbalanced-learn 公式ドキュメント（不均衡データへのリサンプリング等の対処）', url: 'https://imbalanced-learn.org/stable/' };
const SETTLES: SourceRef = { title: 'Settles "Active Learning Literature Survey" (能動学習サーベイ、著者公式サイト)', url: 'https://burrsettles.com/pub/settles.activelearning.pdf' };
const PT_TANH: SourceRef = { title: 'PyTorch: torch.nn.Tanh（公式ドキュメント、出力範囲 −1〜1）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Tanh.html' };
const PT_PRELU: SourceRef = { title: 'PyTorch: torch.nn.PReLU（公式ドキュメント、負側の傾きを学習）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.PReLU.html' };
const PT_RELU: SourceRef = { title: 'PyTorch: torch.nn.ReLU（公式ドキュメント、max(0, x)）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.ReLU.html' };
const PT_LINEAR: SourceRef = { title: 'PyTorch: torch.nn.Linear（公式ドキュメント、重みとバイアスの定義）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html' };
const PT_ADAMW: SourceRef = { title: 'PyTorch: torch.optim.AdamW（公式ドキュメント、重み減衰を分離して適用）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html' };
const PT_BCE: SourceRef = { title: 'PyTorch: torch.nn.BCEWithLogitsLoss（公式ドキュメント、二値分類のシグモイド＋交差エントロピー）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html' };
const PT_CONVT: SourceRef = { title: 'PyTorch: torch.nn.ConvTranspose2d（公式ドキュメント、転置畳み込みの出力サイズの式）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.ConvTranspose2d.html' };
const PT_AAP: SourceRef = { title: 'PyTorch: torch.nn.AdaptiveAvgPool2d（公式ドキュメント、グローバル平均プーリング）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.AdaptiveAvgPool2d.html' };
const PT_GN: SourceRef = { title: 'PyTorch: torch.nn.GroupNorm（公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.GroupNorm.html' };
const PT_CTC: SourceRef = { title: 'PyTorch: torch.nn.CTCLoss（公式ドキュメント）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.CTCLoss.html' };
const PT_CLIP: SourceRef = { title: 'PyTorch: torch.nn.utils.clip_grad_norm_（公式ドキュメント、勾配クリッピング）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html' };
const PT_LINEARLR: SourceRef = { title: 'PyTorch: torch.optim.lr_scheduler.LinearLR（公式ドキュメント、学習率を線形に増やすウォームアップ用スケジューラ）', url: 'https://docs.pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.LinearLR.html' };
const PT_DATA: SourceRef = { title: 'PyTorch: torch.utils.data（公式ドキュメント、DataLoader の shuffle 等）', url: 'https://docs.pytorch.org/docs/stable/data.html' };
const PT_TUNE: SourceRef = { title: 'PyTorch 公式 Performance Tuning Guide（勾配蓄積の解説）', url: 'https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html' };
const TA_MEL: SourceRef = { title: 'torchaudio: MelSpectrogram（公式ドキュメント、メル尺度の特徴量）', url: 'https://docs.pytorch.org/audio/stable/generated/torchaudio.transforms.MelSpectrogram.html' };
const BOYD: SourceRef = { title: 'Boyd & Vandenberghe "Convex Optimization"（著者公式サイト所収の書籍全文、ニュートン法・勾配法）', url: 'https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf' };
const DLB_RNN: SourceRef = { title: 'Goodfellow, Bengio & Courville "Deep Learning" Ch.10 Sequence Modeling（BPTT・教師強制、公式サイト所収）', url: 'https://www.deeplearningbook.org/contents/rnn.html' };
const DLB_AE: SourceRef = { title: 'Goodfellow, Bengio & Courville "Deep Learning" Ch.14 Autoencoders（ボトルネックの役割、公式サイト所収）', url: 'https://www.deeplearningbook.org/contents/autoencoders.html' };
const DISTILL_RF: SourceRef = { title: 'Olah et al. "Feature Visualization" / Distill「Computing Receptive Fields」（受容野の解説）', url: 'https://distill.pub/2019/computing-receptive-fields/' };
const AUG_SURVEY: SourceRef = { title: 'Shorten & Khoshgoftaar "A survey on Image Data Augmentation for Deep Learning" (Journal of Big Data 2019)', url: 'https://journalofbigdata.springeropen.com/articles/10.1186/s40537-019-0197-0' };
const VOC: SourceRef = { title: 'Everingham et al. "The Pascal Visual Object Classes (VOC) Challenge" (IJCV 2010、IoU・mAP の原著)', url: 'https://link.springer.com/article/10.1007/s11263-009-0275-4' };
const ACL_BLEU: SourceRef = { title: 'Papineni et al. "BLEU" (ACL Anthology P02-1040、原著論文ページ)', url: 'https://aclanthology.org/P02-1040/' };
const SLP3_HOME: SourceRef = { title: 'Jurafsky & Martin "Speech and Language Processing" 3rd ed. 公式サイト（自然言語の曖昧さ等）', url: 'https://web.stanford.edu/~jurafsky/slp3/' };
const SLP3_CH3: SourceRef = { title: 'Jurafsky & Martin "Speech and Language Processing" 3rd ed. Ch.3（言語モデルとパープレキシタ）', url: 'https://web.stanford.edu/~jurafsky/slp3/3.pdf' };
const HF_GEN: SourceRef = { title: 'Hugging Face Transformers 公式ドキュメント「Generation strategies」（ビームサーチの解説）', url: 'https://huggingface.co/docs/transformers/generation_strategies' };
const AX_LAKE: SourceRef = { title: 'Lake et al. "Building Machines That Learn and Think Like People" (arXiv:1604.00289、人間と機械の学習の違い)', url: 'https://arxiv.org/abs/1604.00289' };
const AX_SADDLE: SourceRef = { title: 'Dauphin et al. "Identifying and attacking the saddle point problem in high-dimensional non-convex optimization" (arXiv:1406.2572)', url: 'https://arxiv.org/abs/1406.2572' };
const AX_REPR: SourceRef = { title: 'Bengio et al. "Representation Learning: A Review and New Perspectives" (arXiv:1206.5538)', url: 'https://arxiv.org/abs/1206.5538' };
const AX_BOTTOU: SourceRef = { title: 'Bottou et al. "Optimization Methods for Large-Scale Machine Learning" (arXiv:1606.04838、SGD の勾配推定とノイズ)', url: 'https://arxiv.org/abs/1606.04838' };
const AX_MOBILENET: SourceRef = { title: 'Howard et al. "MobileNets" (arXiv:1704.04861、深さ分離可能畳み込みの原著)', url: 'https://arxiv.org/abs/1704.04861' };
const AX_GN: SourceRef = { title: 'Wu & He "Group Normalization" (arXiv:1803.08494、小バッチでのバッチ正規化の不安定さ)', url: 'https://arxiv.org/abs/1803.08494' };
const AX_INORM: SourceRef = { title: 'Ulyanov et al. "Instance Normalization" (arXiv:1607.08022)', url: 'https://arxiv.org/abs/1607.08022' };
const AX_BAHDANAU: SourceRef = { title: 'Bahdanau et al. "Neural Machine Translation by Jointly Learning to Align and Translate" (arXiv:1409.0473、Attention の原著)', url: 'https://arxiv.org/abs/1409.0473' };
const AX_BPE: SourceRef = { title: 'Sennrich et al. "Neural Machine Translation of Rare Words with Subword Units" (arXiv:1508.07909、BPE の原著)', url: 'https://arxiv.org/abs/1508.07909' };
const AX_DENSENET: SourceRef = { title: 'Huang et al. "Densely Connected Convolutional Networks" (arXiv:1608.06993、連結型スキップ結合の原著)', url: 'https://arxiv.org/abs/1608.06993' };
const AX_FRCNN: SourceRef = { title: 'Ren et al. "Faster R-CNN" (arXiv:1506.01497、アンカーボックス・NMS の原著)', url: 'https://arxiv.org/abs/1506.01497' };
const AX_MASKRCNN: SourceRef = { title: 'He et al. "Mask R-CNN" (arXiv:1703.06870、インスタンスセグメンテーションの原著)', url: 'https://arxiv.org/abs/1703.06870' };
const AX_ADSURVEY: SourceRef = { title: 'Chalapathy & Chawla "Deep Learning for Anomaly Detection: A Survey" (arXiv:1901.03407、再構成誤差による異常検知)', url: 'https://arxiv.org/abs/1901.03407' };
const AX_DANN: SourceRef = { title: 'Ganin & Lempitsky "Unsupervised Domain Adaptation by Backpropagation" (arXiv:1409.7495)', url: 'https://arxiv.org/abs/1409.7495' };
const AX_PRUNE: SourceRef = { title: 'Han et al. "Learning both Weights and Connections for Efficient Neural Networks" (arXiv:1506.02626、プルーニングの原著)', url: 'https://arxiv.org/abs/1506.02626' };
const AX_SHOWTELL: SourceRef = { title: 'Vinyals et al. "Show and Tell: A Neural Image Caption Generator" (arXiv:1411.4555)', url: 'https://arxiv.org/abs/1411.4555' };
const AX_IMPGAN: SourceRef = { title: 'Salimans et al. "Improved Techniques for Training GANs" (arXiv:1606.03498、モード崩壊への対処)', url: 'https://arxiv.org/abs/1606.03498' };
const AX_MIXUP: SourceRef = { title: 'Zhang et al. "mixup: Beyond Empirical Risk Minimization" (arXiv:1710.09412)', url: 'https://arxiv.org/abs/1710.09412' };
const AX_WAVENET: SourceRef = { title: 'van den Oord et al. "WaveNet: A Generative Model for Raw Audio" (arXiv:1609.03499、ボコーダとしての利用)', url: 'https://arxiv.org/abs/1609.03499' };

export const SOURCES_EXTRA_GA: Record<string, SourceRef[]> = {
  // ===== gExtraQuestions1.ts 第1章 g-01 人工知能とは =====
  'q-g01-101': [SEP_AI],
  'q-g01-102': [SEP_EMB],
  'q-g01-103': [MITCHELL],
  'q-g01-104': [SEP_TT],
  'q-g01-105': [SEP_CONN],
  'q-g01-106': [ARCH_CYB],
  'q-g01-107': [SEP_ROOM],
  'q-g01-108': [SK_UG],
  'q-g01-109': [CS188_AGENTS],
  'q-g01-110': [CS188_AGENTS],
  'q-g01-111': [CYC],
  'q-g01-112': [SEP_LAI],
  'q-g01-113': [SEP_LAI],
  'q-g01-114': [IBM_DB],
  'q-g01-115': [NAT_AG],
  'q-g01-116': [MCCARTHY],
  'q-g01-117': [IEP],
  'q-g01-118': [SEP_EMB],
  'q-g01-119': [SLP3_HOME],
  'q-g01-120': [SEP_AI],
  'q-g01-121': [SEP_CMIND],
  'q-g01-122': [SEP_TM],
  'q-g01-123': [AX_LAKE],
  'q-g01-124': [SEP_CMIND],
  'q-g01-125': [IBM_WINTER],
  'q-g01-126': [SEP_LCL],
  'q-g01-127': [CS188_AGENTS],
  'q-g01-128': [OECD],
  'q-g01-129': [SK_UG],
  'q-g01-130': [DARTMOUTH],
  // ===== gExtraQuestions1.ts 第2章 g-02 人工知能の歴史・知識表現・探索 =====
  'q-g02-101': [CS188_MINIMAX],
  'q-g02-102': [CS188_MINIMAX],
  'q-g02-103': [AIMA_PDF],
  'q-g02-104': [AIMA_PDF],
  'q-g02-105': [AIMA_PDF],
  'q-g02-106': [PM_S8],
  'q-g02-107': [PM_S7],
  'q-g02-108': [SEP_ABD],
  'q-g02-109': [MURPHY],
  'q-g02-110': [SEP_FUZZY],
  'q-g02-111': [AAAI_R1],
  'q-g02-112': [ICOT],
  'q-g02-113': [LIGHTHILL],
  'q-g02-114': [CS188_STATE],
  'q-g02-115': [CS188_UNINF],
  'q-g02-116': [ARCH_GPS],
  'q-g02-117': [ARCH_HB],
  'q-g02-118': [SEP_NONMONO],
  'q-g02-119': [CLIPS_BPG],
  'q-g02-120': [CS188_INF],
  'q-g02-121': [CS188_UNINF],
  'q-g02-122': [PM_ONTO],
  'q-g02-123': [SEP_LAI],
  'q-g02-124': [SEP_LCL],
  'q-g02-125': [PM_PROP],
  'q-g02-126': [MINSKY],
  'q-g02-127': [SEP_LAI],
  'q-g02-128': [PM_PLAN],
  'q-g02-129': [CS188_CSP],
  'q-g02-130': [CS188_SOLVE],
  // ===== gExtraQuestions1.ts 第3章 g-03 機械学習の評価と手法 =====
  'q-g03-101': [SK_EVAL],
  'q-g03-102': [SK_EVAL],
  'q-g03-103': [SK_EVAL],
  'q-g03-104': [SK_EVAL],
  'q-g03-105': [SK_EVAL],
  'q-g03-106': [SK_EVAL],
  'q-g03-107': [SK_EVAL],
  'q-g03-108': [SK_LC],
  'q-g03-109': [SK_LC],
  'q-g03-110': [SK_LIN],
  'q-g03-111': [SK_LIN],
  'q-g03-112': [SK_CV],
  'q-g03-113': [SK_CV],
  'q-g03-114': [SK_ENS],
  'q-g03-115': [SK_ENS],
  'q-g03-116': [SK_NB],
  'q-g03-117': [SK_EVAL],
  'q-g03-118': [SK_EVAL],
  'q-g03-119': [SK_CV],
  'q-g03-120': [SK_CLUS],
  'q-g03-121': [SK_TREE],
  'q-g03-122': [SK_MANI],
  'q-g03-123': [SETTLES],
  'q-g03-124': [SK_PRE],
  'q-g03-125': [SK_LIN],
  'q-g03-126': [SK_EVAL],
  'q-g03-127': [IMB],
  'q-g03-128': [SK_PRE],
  'q-g03-129': [SK_LIN],
  'q-g03-130': [SK_UG],
  // ===== gExtraQuestions2.ts 第4章 g-04 ニューラルネットワークの基礎と学習 =====
  'q-g04-101': [PT_TANH],
  'q-g04-102': [PT_PRELU],
  'q-g04-103': [SK_NN],
  'q-g04-104': [PT_LINEAR],
  'q-g04-105': [SK_NN],
  'q-g04-106': [PT_RELU],
  'q-g04-107': [PT_AUTOGRAD],
  'q-g04-108': [PT_SGD],
  'q-g04-109': [AX_SADDLE],
  'q-g04-110': [BOYD],
  'q-g04-111': [SK_PRE],
  'q-g04-112': [SK_LC],
  'q-g04-113': [SK_LC],
  'q-g04-114': [SK_GS],
  'q-g04-115': [SK_NN],
  'q-g04-116': [SK_NN],
  'q-g04-117': [PT_BCE],
  'q-g04-118': [AX_ADAM],
  'q-g04-119': [PT_SGD],
  'q-g04-120': [PT_ADAMW],
  'q-g04-121': [AX_DISTILL],
  'q-g04-122': [AX_REPR],
  'q-g04-123': [BOYD],
  'q-g04-124': [PT_DATA],
  'q-g04-125': [PT_LINEARLR],
  'q-g04-126': [AX_BOTTOU],
  'q-g04-127': [SK_EVAL],
  'q-g04-128': [JMLR_DROP],
  'q-g04-129': [PT_TUNE],
  'q-g04-130': [PT_CLIP],
  // ===== gExtraQuestions2.ts 第5章 g-05 深層学習のモデルと系列処理 =====
  'q-g05-101': [PT_MAXPOOL],
  'q-g05-102': [PT_CONV],
  'q-g05-103': [PT_CONV],
  'q-g05-104': [PT_CONVT],
  'q-g05-105': [DISTILL_RF],
  'q-g05-106': [PT_CONV],
  'q-g05-107': [PT_AAP],
  'q-g05-108': [AX_MOBILENET],
  'q-g05-109': [PT_GN],
  'q-g05-110': [AX_INORM],
  'q-g05-111': [AX_BN],
  'q-g05-112': [AX_GN],
  'q-g05-113': [PT_LSTM],
  'q-g05-114': [PT_LSTM],
  'q-g05-115': [DLB_RNN],
  'q-g05-116': [AX_ATTN],
  'q-g05-117': [AX_ATTN],
  'q-g05-118': [AX_ATTN],
  'q-g05-119': [AX_ATTN],
  'q-g05-120': [AX_BAHDANAU],
  'q-g05-121': [DLB_RNN],
  'q-g05-122': [HF_GEN],
  'q-g05-123': [AX_VAE],
  'q-g05-124': [AX_VAE],
  'q-g05-125': [DLB_AE],
  'q-g05-126': [AUG_SURVEY],
  'q-g05-127': [AX_MIXUP],
  'q-g05-128': [AX_W2V],
  'q-g05-129': [AX_BPE],
  'q-g05-130': [AX_DENSENET],
  // ===== gExtraQuestions2.ts 第6章 g-06 応用タスクと評価・解釈（IDは201〜230） =====
  'q-g06-201': [VOC],
  'q-g06-202': [AX_FRCNN],
  'q-g06-203': [AX_FRCNN],
  'q-g06-204': [VOC],
  'q-g06-205': [AX_MASKRCNN],
  'q-g06-206': [AX_UNET],
  'q-g06-207': [SK_EVAL],
  'q-g06-208': [SK_EVAL],
  'q-g06-209': [SK_EVAL],
  'q-g06-210': [TA_MEL],
  'q-g06-211': [PT_CTC],
  'q-g06-212': [AX_WAVENET],
  'q-g06-213': [AX_ADSURVEY],
  'q-g06-214': [AX_DQN],
  'q-g06-215': [NAT_DQN],
  'q-g06-216': [SB],
  'q-g06-217': [SB],
  'q-g06-218': [PT_TRANSFER],
  'q-g06-219': [AX_DANN],
  'q-g06-220': [AX_PRUNE],
  'q-g06-221': [PT_QUANT],
  'q-g06-222': [AX_DISTILL],
  'q-g06-223': [AX_SHAP],
  'q-g06-224': [AX_LIME],
  'q-g06-225': [ACL_BLEU],
  'q-g06-226': [SLP3_CH3],
  'q-g06-227': [AX_CLIP],
  'q-g06-228': [AX_SHOWTELL],
  'q-g06-229': [AX_IMPGAN],
  'q-g06-230': [AX_BERT],
};
