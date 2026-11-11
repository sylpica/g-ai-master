import type { Flashcard } from '../types';

// 生成AIパスポート（2027年2月試験より適用シラバス）の単語帳カード。各章10枚。
// conceptId は関連する問題の conceptId（=問題ID）に合わせ、verifiedAt は全件 2026-11-11。
// 逆向き（意味→用語）では reversePrompt を表面にする（用語名は表示時に自動マスクされる）。

const GUGA = { title: '生成AIパスポート 公式ページ（試験概要）', url: 'https://guga.or.jp/outline/' };
const SYLLABUS = { title: '生成AIパスポート試験シラバス（2027年2月試験より適用）', url: 'https://guga.or.jp/assets/syllabus.pdf' };
const BUNKA = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const PPC = { title: '個人情報保護委員会', url: 'https://www.ppc.go.jp/' };
const CAO = { title: '内閣府「人間中心のAI社会原則」', url: 'https://www.cas.go.jp/jp/seisaku/jinkouchinou/pdf/aigensoku.pdf' };
const AI_ACT_JP = { title: 'e-Gov法令検索「人工知能関連技術の研究開発及び活用の推進に関する法律」（令和7年法律第53号）', url: 'https://laws.e-gov.go.jp/law/507AC0000000053' };

const V_AT = '2026-11-11';
type C = Omit<Flashcard, 'verifiedAt'>;
const c = (x: C): Flashcard => ({ ...x, verifiedAt: V_AT });

export const PASSPORT_CARDS: Flashcard[] = [
  // ===== p-01 AIの基礎と歴史 =====
  c({
    id: 'card-p01-01', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-9', term: 'ニューラルネットワーク',
    definition: '人間の脳の神経回路を模した計算モデルで、入力層・隠れ層・出力層からなり、接続の重みを調整して学習する。ディープラーニングの基礎となる仕組み。',
    reversePrompt: '人間の脳の神経回路を模し、入力層・隠れ層・出力層の間で重みを調整して学習する、深層学習の基礎となる計算モデルは？',
    confusion: '重みは学習で自動調整されるもので、人がルールを一つずつ登録するルールベースとは異なる。',
    lessonId: 'les-p01', questionIds: ['q-p01-9'], sources: [SYLLABUS, GUGA], difficulty: 1,
  }),
  c({
    id: 'card-p01-02', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-10', term: '誤差逆伝播法', aliases: ['バックプロパゲーション'],
    definition: '出力と正解の誤差を出力側から入力側へ逆向きに伝え、各重みの勾配を求めて重みを更新する、ニューラルネットワークの学習計算の方法。',
    reversePrompt: '出力と正解の誤差を逆向きに伝えて各パラメータの勾配を求め、学習を進める計算方法は？',
    confusion: '勾配降下法は勾配を使ってパラメータを更新する最適化の枠組みで、誤差逆伝播法はその勾配を効率よく計算する手順を指す。',
    lessonId: 'les-p01', questionIds: ['q-p01-10'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p01-03', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-11', term: '過学習', aliases: ['オーバーフィッティング'],
    definition: '学習データに適応しすぎて、未知のデータに対する性能（汎化性能）が下がってしまう現象。正則化、ドロップアウト、アーリーストッピングなどで対策する。',
    reversePrompt: '学習データに適応しすぎて未知のデータで性能が落ちる現象で、正則化やドロップアウトで対策されるものは？',
    confusion: '学習不足による性能不足とは逆の現象。学習データでの精度が高いだけでは、過学習でないとは判断できない。',
    lessonId: 'les-p01', questionIds: ['q-p01-11'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p01-04', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-12', term: '転移学習',
    definition: 'あるタスクで学習済みのモデルを別のタスクに流用し、少量のデータで効率よく学習させる手法。ファインチューニングと組み合わせて使われる。',
    reversePrompt: '学習済みモデルを別の課題へ流用し、少量のデータでも効率よく学習させる手法は？',
    confusion: 'ゼロから学習を始める方法とは異なる。ファインチューニングは、流用したモデルを追加学習で調整する過程を指す。',
    lessonId: 'les-p01', questionIds: ['q-p01-12'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p01-05', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-13', term: 'CNN', aliases: ['畳み込みニューラルネットワーク'],
    definition: '畳み込み演算を用いて画像などの局所的な特徴を抽出するニューラルネットワークで、コンピュータビジョンの発展の基盤となったモデル。',
    reversePrompt: '畳み込み演算で画像の局所的な特徴を抽出する、画像認識で広く使われるネットワークは？',
    confusion: '時系列データの処理に適した構造はRNN系で、CNNは主に空間的な特徴の抽出に強い。',
    lessonId: 'les-p01', questionIds: ['q-p01-13'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p01-06', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-15', term: 'Transformer',
    definition: 'Attention（自己注意機構）を中心とするニューラルネットワークの構造。系列を並列に処理でき、現在の大規模言語モデルの基盤となっている。',
    reversePrompt: '自己注意機構を中心とし、系列の並列処理を可能にして大規模言語モデルの基盤となったネットワーク構造は？',
    confusion: 'RNNのような逐次処理ではなく、Attentionで系列全体の関係を捉える点が特徴。',
    lessonId: 'les-p01', questionIds: ['q-p01-15'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p01-07', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-17', term: 'GAN', aliases: ['敵対的生成ネットワーク'],
    definition: '生成器と識別器という2つのネットワークを競わせて学習させ、実物に近いデータを生成するモデル。生成器は識別器を欺くように、識別器は見分けるように学習する。',
    reversePrompt: '本物らしいデータを作る側と、それを見分ける側の2つのネットワークを競わせて学習する生成モデルは？',
    confusion: 'VAEは潜在ベクトルへの圧縮と復元によって生成するモデルで、敵対的な学習の仕組みは持たない。',
    lessonId: 'les-p01', questionIds: ['q-p01-17'], sources: [SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p01-08', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-6', term: '強化学習',
    definition: 'エージェントが環境との試行錯誤を通じて、得られる報酬を最大化する行動の選び方（方策）を学ぶ機械学習の枠組み。正解ラベルは使わない。',
    reversePrompt: '正解ラベルではなく報酬を手がかりに、試行錯誤を通じて望ましい行動の選び方を学ぶ機械学習の枠組みは？',
    confusion: '教師あり学習は正解ラベルとの誤差で学ぶ点が異なる。価値と方策は強化学習の基本概念である。',
    lessonId: 'les-p01', questionIds: ['q-p01-6'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p01-09', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-19', term: 'エキスパートシステム',
    definition: '専門家の知識をルール（知識ベース）として登録し、推論によって診断や助言を行う初期のAIシステム。第二次AIブームの中心となった。',
    reversePrompt: '専門家の知識をルールとして登録し、推論で診断や助言を行う、第二次AIブームを代表する初期のAIシステムは？',
    confusion: 'データから自動で学ぶ機械学習とは異なり、知識の登録と保守は人間が行う必要があった。',
    lessonId: 'les-p01', questionIds: ['q-p01-19'], sources: [SYLLABUS, GUGA], difficulty: 1,
  }),
  c({
    id: 'card-p01-10', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-20', term: 'シンギュラリティ', aliases: ['技術的特異点'],
    definition: 'AIが人間の知能を超え、技術の進歩が人間の予測や制御を超えて加速するとされる転換点を指す概念。',
    reversePrompt: 'AIが人間の知能を超え、技術進歩が人間の予測を超えて加速するとされる転換点の概念は？',
    confusion: '到来の時期や実現可能性については議論が分かれており、確定した事実として扱わない。',
    lessonId: 'les-p01', questionIds: ['q-p01-20'], sources: [SYLLABUS], difficulty: 2,
  }),
  // ===== p-02 生成AI =====
  c({
    id: 'card-p02-01', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-13', term: '大規模言語モデル', aliases: ['LLM'],
    definition: '大量のテキストで事前学習された大規模な言語モデル。文章生成、要約、翻訳、質問応答など幅広いタスクをこなし、生成AIの中核技術となっている。',
    reversePrompt: '大量のテキストで事前学習され、文章生成や要約など幅広いタスクをこなす、生成AIの中核となる大規模なモデルは？',
    confusion: '言語モデル（LM）一般と比べて規模が大きく、創発的能力が見られる点が特徴とされる。',
    lessonId: 'les-p02a', questionIds: ['q-p02-13'], sources: [SYLLABUS, GUGA], difficulty: 1,
  }),
  c({
    id: 'card-p02-02', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-7', term: 'トークン化',
    definition: 'テキストを、モデルが処理できる単位（トークン）に分割すること。サブワード単位で分割されることが多く、処理量や上限の計算単位にもなる。',
    reversePrompt: 'テキストをモデルが処理できる単位へ分割することで、サブワード単位がよく使われ、処理量の単位にもなる処理は？',
    lessonId: 'les-p02a', questionIds: ['q-p02-7'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p02-03', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-8', term: '次トークン予測',
    definition: 'これまでの文脈から、次に来るトークンの確率分布を予測する仕組み。LLMの事前学習と文章生成の基本動作となっている。',
    reversePrompt: '文脈から次に来る単語の確率を予測し続けることで文章を生成する、LLMの基本動作は？',
    confusion: '意味を理解して情報を検索しているのではなく、確率的な予測の積み重ねである点が、誤った出力が生じる背景にもなる。',
    lessonId: 'les-p02a', questionIds: ['q-p02-8'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p02-04', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-9', term: 'ハルシネーション',
    definition: '生成AIが、事実とは異なる内容をもっともらしく出力してしまう現象。確率的な生成の仕組み上避けきれないため、一次情報での確認が必要になる。',
    reversePrompt: '事実とは異なる内容を、もっともらしい文体で生成AIが出力してしまう現象は？',
    confusion: '意図的な嘘ではなく、確率的生成に伴う現象。RAGの利用やファクトチェックで影響を抑える。',
    lessonId: 'les-p02a', questionIds: ['q-p02-9'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p02-05', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-10', term: 'コンテキストウィンドウ',
    definition: 'モデルが一度に処理できる入力と出力のトークン数の上限。この範囲を超えた情報は参照できなくなるため、長い文脈の扱いに影響する。',
    reversePrompt: 'モデルが一度に扱える入出力のトークン数の上限で、長文処理の制約となるものは？',
    confusion: '上限を超えた過去の文脈は自動的には保持されない。エージェントの記憶（メモリ）の仕組みとは区別される。',
    lessonId: 'les-p02a', questionIds: ['q-p02-10'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-06', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-3', term: '基盤モデル', aliases: ['Foundation Model'],
    definition: '大量で多様なデータによって大規模に学習され、さまざまな下流タスクへ適応できる汎用モデル。LLMやマルチモーダルモデルの土台となる。',
    reversePrompt: '大規模で多様なデータで学習され、多様な課題へ適応できる汎用的な土台となるモデルは？',
    lessonId: 'les-p02a', questionIds: ['q-p02-3'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-07', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-2', term: '拡散モデル', aliases: ['Diffusion Model'],
    definition: 'データにノイズを加える過程（拡散過程）と、ノイズから元に戻していく過程（逆拡散過程）を学習し、画像などを生成するモデル。',
    reversePrompt: 'ノイズを加える過程と除去する過程を学習し、ノイズから画像などを生成するモデルは？',
    confusion: 'GANのような敵対的学習ではなく、ノイズ除去の過程の学習が中心。潜在空間で処理する潜在拡散モデルもある。',
    lessonId: 'les-p02a', questionIds: ['q-p02-2'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-08', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-5', term: 'RLHF', aliases: ['人間のフィードバックによる強化学習'],
    definition: '人間のフィードバックによる強化学習。人間による出力への評価を報酬として学習し、モデルを人間の好みや意図に沿うよう調整する手法。',
    reversePrompt: '人間の評価を報酬として強化学習し、モデルを人間の意図に沿うよう調整する手法は？',
    confusion: '事前学習の後に行われる調整段階の一つで、指示チューニング（Instruction Tuning）とあわせて使われる。',
    lessonId: 'les-p02a', questionIds: ['q-p02-5'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-09', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-4', term: 'ファインチューニング',
    definition: '学習済みモデルを、特定のタスクや領域のデータで追加学習させて用途に適応させる手法。教師ありファインチューニングや指示チューニングを含む。',
    reversePrompt: '学習済みモデルを特定用途のデータで追加学習させ、適応させる手法は？',
    confusion: '利用時に例を示すFew-Shotとは異なり、モデル自体のパラメータを更新する。',
    lessonId: 'les-p02a', questionIds: ['q-p02-4'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p02-10', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-6', term: 'スケーリング則', aliases: ['Scaling Laws'],
    definition: 'モデルのパラメータ数、データ量、計算量を増やすと、性能が予測可能な形で向上するという経験則。創発的能力の議論とも関係する。',
    reversePrompt: 'パラメータ数・データ量・計算量を増やすと性能が予測可能な形で向上するという経験則は？',
    confusion: '性能向上がそのまま続く保証ではなく、学習データの品質や量の制約も課題になる。',
    lessonId: 'les-p02a', questionIds: ['q-p02-6'], sources: [SYLLABUS], difficulty: 3,
  }),
  // ===== p-03 AIエージェント =====
  c({
    id: 'card-p03-01', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-1', term: 'AIエージェント',
    definition: '目標に向けて計画を立て、外部ツールやデータを使いながら複数の工程を自律的に進めるAIシステム。従来の対話型生成AIより行動の範囲が広い。',
    reversePrompt: '目標に向けて計画を立て、外部ツールを使いながら複数の工程を自律的に進めるAIシステムは？',
    confusion: '一問一答の対話で完結する従来の生成AI利用とは異なり、ツール実行や状態の保持を伴う。',
    lessonId: 'les-p03', questionIds: ['q-p03-1'], sources: [SYLLABUS, GUGA], difficulty: 1,
  }),
  c({
    id: 'card-p03-02', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-2', term: '自律型エージェント',
    definition: '人が手順を定めるワークフロー型に対し、目標を与えると計画や手順の判断もAI側が行うエージェントの形態。自律性が高い分、人間による監督や権限管理が重要になる。',
    reversePrompt: '手順を人が定める型と対比され、目標を与えると計画や進め方の判断もAIが行うエージェントの形態は？',
    confusion: '自律性のレベルは段階的なもので、完全な自律運用だけを指す言葉ではない。',
    lessonId: 'les-p03', questionIds: ['q-p03-2'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p03-03', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-4', term: 'RAG', aliases: ['検索拡張生成', 'Retrieval-Augmented Generation'],
    definition: '外部の文書やデータベースを検索し、その内容を根拠として回答を生成する仕組み。最新情報や社内情報の反映、ハルシネーションの抑制に使われる。',
    reversePrompt: '外部の文書を検索し、その内容を根拠に回答を生成することで、最新情報の反映や誤情報の抑制に使われる仕組みは？',
    confusion: 'モデル自体を再学習させる手法ではなく、推論時に外部情報を参照する仕組みである。',
    lessonId: 'les-p03', questionIds: ['q-p03-4'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p03-04', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-5', term: 'ベクトルデータベース',
    definition: 'テキスト等を埋め込み（Embedding）ベクトルとして蓄積し、意味の近さで検索（意味的検索）できるデータベース。RAGの検索基盤として使われる。',
    reversePrompt: '埋め込みベクトルを蓄積し、意味の近さで検索できる、RAGの基盤となるデータベースは？',
    confusion: 'キーワードの完全一致で探す従来型の検索とは異なり、意味的な近さで候補を返す。',
    lessonId: 'les-p03', questionIds: ['q-p03-5'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p03-05', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-8', term: 'Function Calling', aliases: ['Tool Use', 'ツール実行'],
    definition: 'LLMが外部の関数やAPIの呼び出しを構造化された形で指示し、検索や計算、業務システム操作などの実行結果を取り込む仕組み。',
    reversePrompt: 'LLMが外部の関数やAPIの呼び出しを指示し、その実行結果を取り込んで回答や行動に反映する仕組みは？',
    confusion: 'LLM自体が直接システムを操作するのではなく、呼び出しの指示と結果の受け取りを担う。',
    lessonId: 'les-p03', questionIds: ['q-p03-8'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p03-06', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-10', term: 'コンテキストエンジニアリング',
    definition: 'エージェントの動作時に、システムプロンプト、記憶、検索結果、ツールの出力など、モデルへ渡す文脈全体を設計・管理する技術。',
    reversePrompt: 'システムプロンプトや記憶、検索結果など、モデルへ渡す文脈全体を設計・管理する技術は？',
    confusion: '単発のプロンプトの書き方（プロンプトエンジニアリング）より広く、継続的な文脈の管理までを含む。',
    lessonId: 'les-p03', questionIds: ['q-p03-10'], sources: [SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p03-07', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-12', term: 'MCP', aliases: ['Model Context Protocol'],
    definition: 'AIアプリケーションと外部ツールやデータソースを接続するための共通規格（プロトコル）。接続の標準化により、多様なツールとの連携をしやすくする。',
    reversePrompt: 'AIアプリケーションと外部ツールやデータソースの接続を標準化する共通規格は？',
    confusion: '特定のAIモデルそのものではなく、接続方式の規格。エージェント同士の連携にはA2Aという別の規格もある。',
    lessonId: 'les-p03', questionIds: ['q-p03-12'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p03-08', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-17', term: 'Human-in-the-Loop', aliases: ['HITL'],
    definition: 'AIの処理過程の重要な節目に、人間の確認や承認を組み込む運用方式。影響度の高い操作の誤りや暴走を防ぐために使われる。',
    reversePrompt: 'AIの処理の重要な節目に人間の確認や承認を組み込む運用方式は？',
    confusion: '全工程を人間が行うことではなく、確認すべき節目を選んで組み込む考え方である。',
    lessonId: 'les-p03', questionIds: ['q-p03-17'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p03-09', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-16', term: 'プロンプトインジェクション',
    definition: '外部データや利用者の入力に悪意ある指示を埋め込み、AIに本来意図しない動作や情報漏えいをさせる攻撃手法。エージェントでは権限と結びつき、被害が大きくなり得る。',
    reversePrompt: '入力や外部データに悪意ある指示を埋め込み、AIに意図しない動作をさせる攻撃手法は？',
    confusion: '通常のプロンプトの工夫とは異なり、第三者による攻撃を指す。最小権限や多層防御で対策する。',
    lessonId: 'les-p03', questionIds: ['q-p03-16'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p03-10', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-18', term: 'ガードレール',
    definition: 'AIやエージェントの入出力を監視し、禁止された操作や不適切な出力を遮断・制限する仕組みやルールの総称。権限管理やサンドボックスと組み合わせて使われる。',
    reversePrompt: 'AIの入出力を監視し、不適切な操作や出力を遮断・制限する仕組みやルールの総称は？',
    confusion: 'モデルの学習だけで実現するものではなく、運用側の制御も含む。',
    lessonId: 'les-p03', questionIds: ['q-p03-18'], sources: [SYLLABUS], difficulty: 2,
  }),
  // ===== p-04 生成AIのリスク予防・AI倫理・ガバナンス =====
  c({
    id: 'card-p04-01', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-5', term: 'シャドーAI',
    definition: '組織の承認を得ていないAIツールを、従業員が業務で無断利用すること。入力した情報の管理が及ばず、情報漏えいの温床になる。',
    reversePrompt: '未承認のAIツールを従業員が業務で無断に使うことで、情報管理が及ばなくなる状態を指す言葉は？',
    confusion: '承認済みツールのルール内利用はシャドーAIではない。利便性への需要が背景にあるため、禁止だけでなく承認済みツールの整備が要る。',
    lessonId: 'les-p04a', questionIds: ['q-p04-5', 'q-p04-6'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p04-02', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-10', term: '要配慮個人情報',
    definition: '人種、信条、病歴、犯罪歴など、不当な差別や偏見が生じないよう特に配慮を要する個人情報。取得には原則として本人の同意が必要とされる。',
    reversePrompt: '人種、信条、病歴など、差別や偏見につながり得るため特に慎重な取り扱いと原則として本人同意が必要な個人情報は？',
    confusion: '企業の営業秘密とは別の概念。機微情報とも呼ばれ、生成AIへの入力は特に慎重に判断する。',
    lessonId: 'les-p04a', questionIds: ['q-p04-10'], sources: [PPC, SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p04-03', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-16', term: '依拠性',
    definition: '著作権侵害の判断要素の一つで、既存の著作物に接して（それを基にして）創作したことを指す。表現の類似性とともに、侵害の成否を左右する。',
    reversePrompt: '著作権侵害の判断で、既存の著作物に接して作ったかどうかを示す要素で、表現の類似性と対になるものは？',
    confusion: '似ているだけ（類似性）では不十分で、依拠が否定されれば侵害にならない場合がある。',
    lessonId: 'les-p04a', questionIds: ['q-p04-16'], sources: [BUNKA], difficulty: 3,
  }),
  c({
    id: 'card-p04-04', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-12', term: '匿名加工情報',
    definition: '特定の個人を識別できず、元の情報へ復元もできないように加工した情報。一定の要件のもとで、本人の同意なく第三者提供などをすることが可能になる。',
    reversePrompt: '個人を識別できず復元もできないよう加工した情報で、一定の要件のもと第三者提供が可能になるものは？',
    confusion: '他の情報と照合すれば識別できる仮名加工情報とは異なり、仮名加工情報は第三者提供が原則禁止。',
    lessonId: 'les-p04a', questionIds: ['q-p04-12'], sources: [PPC, SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p04-05', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-14', term: '営業秘密',
    definition: '秘密管理性・有用性・非公知性の3要件を満たし、不正競争防止法で保護される事業上の情報。顧客情報や技術情報などが該当し得る。',
    reversePrompt: '秘密として管理され、事業に有用で、公然と知られていないという3要件を満たすことで法的に保護される事業情報は？',
    confusion: '登録は不要だが、管理が不十分だと要件を満たさず保護されない。秘密保持契約（NDA）は開示時の取り決め手段。',
    lessonId: 'les-p04a', questionIds: ['q-p04-14'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p04-06', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-8', term: 'ファクトチェック',
    definition: 'AI出力に含まれる事実、数値、日付、固有名詞、出典などを一次情報と照らし合わせて確認する検証作業。前提や論理を見る妥当性レビューと組み合わせて行う。',
    reversePrompt: 'AI出力の事実や数値、出典を一次情報と照らし合わせて確認する検証作業は？',
    confusion: '前提や論理の抜け漏れを確認する妥当性レビューとは、確認の対象が異なる。',
    lessonId: 'les-p04a', questionIds: ['q-p04-8'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p04-07', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-19', term: 'パブリシティ権',
    definition: '著名人の氏名や肖像が持つ顧客吸引力を、本人が排他的に利用できる権利。生成画像が有名人に似ている場合の広告利用などで問題になる。',
    reversePrompt: '著名人の氏名や肖像が持つ顧客吸引力を排他的に利用できる権利は？',
    confusion: 'プライバシーや人格を守る肖像権一般とは、財産的な価値に着目する点で性格が異なる。',
    lessonId: 'les-p04a', questionIds: ['q-p04-19'], sources: [BUNKA, SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p04-08', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-22', term: 'AI事業者ガイドライン',
    definition: 'AIの開発・提供・利用に関わる事業者に向けて国が示したガイドライン。人間中心を前提に、安全性、公平性、透明性、アカウンタビリティなどの共通指針を示す。',
    reversePrompt: '事業者向けに国が示し、人間中心や安全性、公平性、透明性などの共通指針をまとめた文書は？',
    confusion: '法律そのものではなく、関係法令や国際的な議論を踏まえた指針として位置づけられる。',
    lessonId: 'les-p04b', questionIds: ['q-p04-22'], sources: [CAO, SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p04-09', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-23', term: 'AIガバナンス',
    definition: '組織がAI活用に伴うリスクを管理し、適切に利用し続けるための体制やルールの総称。社内ガイドライン、承認フロー、モニタリング、継続的な見直しを含む。',
    reversePrompt: '組織がAI利用のリスクを管理するための体制やルールの総称で、ガイドラインや承認フロー、見直しを含むものは？',
    confusion: '一度決めたら終わりではなく、環境の変化に応じて継続的に見直すアジャイルな運用が求められる。',
    lessonId: 'les-p04b', questionIds: ['q-p04-23'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p04-10', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-24', term: 'AI法',
    definition: '「人工知能関連技術の研究開発及び活用の推進に関する法律」の略称。イノベーションの促進とリスクへの対応の両立を図る、日本の推進型の枠組み。',
    reversePrompt: '日本のAI推進の基本枠組みを定めた法律で、イノベーション促進とリスク対応の両立を掲げるものは？',
    confusion: '罰則中心の包括的な規制法ではなく、基本計画や各主体の役割を定める枠組み。リスクベースの規制であるEU AI Actとは性格が異なる。',
    lessonId: 'les-p04b', questionIds: ['q-p04-24'], sources: [AI_ACT_JP], difficulty: 2,
  }),
  // ===== p-05 生成AIの実践と活用事例 =====
  c({
    id: 'card-p05-01', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-1', term: 'プロンプトエンジニアリング',
    definition: '生成AIから望ましい出力を得るために、指示や文脈、例、出力形式などを設計・改善する技術。対話的に改善していくことが基本になる。',
    reversePrompt: '望ましい出力を得るために指示や文脈、出力形式を設計・改善する技術は？',
    confusion: 'モデルのパラメータを更新する学習とは異なり、入力の設計によって出力を導く技術。',
    lessonId: 'les-p05', questionIds: ['q-p05-1'], sources: [SYLLABUS, GUGA], difficulty: 1,
  }),
  c({
    id: 'card-p05-02', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-2', term: 'Few-Shotプロンプティング', aliases: ['Few-Shot'],
    definition: '入出力の例を少数示してから、本番のタスクを実行させるプロンプティングの手法。例を示さず指示だけで解かせる場合はZero-Shotと呼ばれる。',
    reversePrompt: '少数の入出力例を示してから本番のタスクを行わせるプロンプティング手法は？',
    confusion: '例に誤りや偏りがあると、そのまま出力に引き継がれる。モデルの追加学習（ファインチューニング）とは異なる。',
    lessonId: 'les-p05', questionIds: ['q-p05-2'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p05-03', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-3', term: 'Chain-of-Thought', aliases: ['思考の連鎖', 'CoT'],
    definition: '結論だけでなく、途中の推論過程を段階的に出力させる手法。複雑な問題で誤りを減らす効果が期待されるが、出力された過程自体の検証も必要。',
    reversePrompt: '推論の途中過程を段階的に出力させることで、複雑な問題への対応を助ける手法は？',
    lessonId: 'les-p05', questionIds: ['q-p05-3'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p05-04', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-4', term: '役割設定',
    definition: 'プロンプトで「編集者として」などの立場を指定し、回答の観点、専門性、文体をタスクに合わせる指定方法。',
    reversePrompt: '「専門家として」など立場を指定し、回答の観点や文体を目的に合わせるプロンプトの指定方法は？',
    confusion: '役割を与えても、回答の事実の正確さが保証されるわけではない。',
    lessonId: 'les-p05', questionIds: ['q-p05-4'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p05-05', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-5', term: '出力形式の指定',
    definition: '表形式、箇条書き、見出し構成、文字数など、出力の構造や分量をプロンプトで具体的に指定すること。そのまま業務に使いやすい形が得られやすくなる。',
    reversePrompt: '表や箇条書き、文字数など、出力の構造や分量を具体的に示すプロンプトの工夫は？',
    lessonId: 'les-p05', questionIds: ['q-p05-5'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p05-06', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-10', term: 'ブレインストーミング', aliases: ['壁打ち'],
    definition: '企画やアイデアの発散のために生成AIと対話し、多様な切り口や叩き台を素早く得る活用法。事実の裏付けは別途行う。',
    reversePrompt: 'アイデアの発散のためにAIと対話し、叩き台を素早く得る活用法は？',
    confusion: '出てきた市場規模などの数値は裏付けがない場合があり、一次情報での確認が別途必要。',
    lessonId: 'les-p05', questionIds: ['q-p05-10'], sources: [SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p05-07', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-14', term: 'ディープリサーチ',
    definition: '複数の情報源を横断的に調査し、出典付きのレポートとしてまとめるAIのリサーチ機能・手法。参照元の一次情報で裏付けてから使うことが前提になる。',
    reversePrompt: '複数の情報源を横断調査して出典付きレポートにまとめるAIの調査手法は？',
    confusion: '出典が付いていても誤引用や古い情報が混じることがあり、重要な事実は元の資料で確認する。',
    lessonId: 'les-p05', questionIds: ['q-p05-14'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p05-08', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-15', term: 'コーディングエージェント',
    definition: 'コードの生成や修正、既存コードの調査、リファクタリングなどを自律的に進める開発支援エージェント。人間のレビューや権限管理と組み合わせて使う。',
    reversePrompt: 'コード生成や修正、既存コードの調査を自律的に進める開発支援エージェントは？',
    confusion: '生成コードを無確認で本番へ反映するものではなく、人間のレビューとテストが前提。',
    lessonId: 'les-p05', questionIds: ['q-p05-15'], sources: [SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p05-09', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-16', term: 'AX', aliases: ['AIトランスフォーメーション'],
    definition: 'AIの活用を前提に、業務プロセスや事業そのものを変革する取り組み。デジタル技術で変革を進めるDXの発展形として位置づけられることが多い。',
    reversePrompt: 'AIの活用を前提に業務や事業そのものを変革する取り組みで、DXの発展形とされるものは？',
    confusion: '単なるAIツールの導入ではなく、業務プロセス自体の見直しまでを含む。',
    lessonId: 'les-p05', questionIds: ['q-p05-16'], sources: [SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p05-10', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-12', term: 'モックアップ',
    definition: '製品やWebページなどの完成イメージを示す試作品・模型のこと。生成AIでデザイン案を素早く作り、方向性の確認や合意形成に使う。',
    reversePrompt: '完成イメージを示す試作品で、生成AIでデザイン案を素早く作って方向性を確認するのに使われるものは？',
    confusion: '実際に動作する製品ではなく、あくまで見た目や構成の確認用。権利関係の確認は別途必要。',
    lessonId: 'les-p05', questionIds: ['q-p05-12'], sources: [SYLLABUS], difficulty: 1,
  }),
];
