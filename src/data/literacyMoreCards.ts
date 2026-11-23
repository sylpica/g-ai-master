import type { Flashcard } from '../types';

// AI教養モードの単語帳拡充分（2026-11-23）。
// 収録方針は flashcards.ts と同じ：教材（lessons.ts）・問題（questions.ts）・実践演習（exercises.ts）に
// 実際に現れるのに既存カードがない専門用語だけを収録し、定義は教材の記述に忠実に短くまとめる。
// 出典は対応する教材・問題の sources から {title, url} をそのまま継承する（新規URLは作らない）。
// reversePrompt は用語名・略称が答えとして漏れないよう、特徴・用途・対比の表現で書き直している。

const JDLA = { title: 'JDLA G検定 公式ページ（シラバス）', url: 'https://www.jdla.org/certificate/general/' };
const ATTN = { title: 'Vaswani et al. "Attention Is All You Need" (arXiv:1706.03762)', url: 'https://arxiv.org/abs/1706.03762' };
const GL_PAGE = { title: '総務省・経済産業省「AI事業者ガイドライン」掲載ページ', url: 'https://www.soumu.go.jp/main_sosiki/kenkyu/ai_network/02ryutsu20_04000019.html' };
const OPENAI_MODELS = { title: 'OpenAI API ドキュメント：Models', url: 'https://developers.openai.com/api/docs/models' };
const PROMPT_GUIDE = { title: 'OpenAI API ドキュメント：Prompt engineering', url: 'https://developers.openai.com/api/docs/guides/prompt-engineering' };
const OWASP = { title: 'OWASP Top 10 for LLM Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' };
const GH_SECRET = { title: 'GitHub Docs：About secret scanning', url: 'https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning' };
const GPT6CYBER = { title: 'OpenAI: GPT-6 Cyber: Advancing the frontier of aligned cybersecurity agents', url: 'https://openai.com/index/introducing-gpt-6-cyber/' };
const FABLE_MYTHOS = { title: 'Anthropic: Introducing Claude Fable 5.2 and Claude Mythos 5.2', url: 'https://www.anthropic.com/claude-fable-and-mythos-5-2' };
const BUNKA = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const AI_PLAN = { title: '内閣府「人工知能基本計画」（令和7年12月23日 閣議決定）', url: 'https://www8.cao.go.jp/cstp/ai/ai_plan/aiplan_20251223.pdf' };
const PPC_GENAI = { title: '個人情報保護委員会「生成AIサービスの利用に関する注意喚起等について」', url: 'https://www.ppc.go.jp/news/careful_information/230602_AI_utilize_alert/' };

const V_AT = '2026-11-23';
type C = Omit<Flashcard, 'verifiedAt'>;
const c = (x: C): Flashcard => ({ ...x, verifiedAt: V_AT });

export const LITERACY_MORE_CARDS: Flashcard[] = [
  // ===== l-01 AIの基本原理 =====
  c({
    id: 'card-l01-07', mode: 'literacy', syllabusId: 'l-01', conceptId: 'q-l01-1', term: 'LLM（大規模言語モデル）', aliases: ['LLM'],
    definition: '大量のテキストで「次のトークン」を予測する学習を行った大規模な言語モデルである。文章生成をはじめ、現在の生成AIサービスの中核となるモデルを指す。',
    reversePrompt: '大量の文章データで「次に来る要素」を予測する学習を行った巨大な言語モデルで、文章生成サービスの中核となるものは？',
    confusion: 'データベース検索そのものではない。学習した内容をもとに生成する仕組みである。',
    lessonId: 'les-l01', questionIds: ['q-l01-1', 'q-l01-3'], sources: [JDLA, ATTN], difficulty: 1,
  }),
  c({
    id: 'card-l01-08', mode: 'literacy', syllabusId: 'l-01', conceptId: 'q-l01-5', term: 'Transformer',
    definition: 'Attentionにより文中の離れた要素同士の関係を捉えるニューラルネットワークの構造である。現在のLLMの基盤となっている。',
    reversePrompt: '文中の離れた要素同士の関係を、注意の仕組みによって捉える神経回路網の構造で、現在の大規模言語モデルの基盤となっているものは？',
    lessonId: 'les-l01', questionIds: ['q-l01-5'], sources: [JDLA, ATTN], difficulty: 2,
  }),
  c({
    id: 'card-l01-09', mode: 'literacy', syllabusId: 'l-01', conceptId: 'card-l01-09', term: 'Attention', aliases: ['アテンション'],
    definition: '系列の各要素間の関連度に応じて情報を重み付けする仕組みである。Transformerの中核で、文中の離れた要素同士の関係を捉える。',
    reversePrompt: '系列の各要素同士の関連の強さに応じて情報を重み付けし、離れた要素の関係を捉える仕組みは？',
    lessonId: 'les-l01', questionIds: [], sources: [JDLA, ATTN], difficulty: 2,
  }),
  c({
    id: 'card-l01-10', mode: 'literacy', syllabusId: 'l-01', conceptId: 'q-l01-6', term: '埋め込み表現',
    definition: '単語や文章を数値ベクトルに変換した表現である。意味の近さが、ベクトル同士の距離の近さとして表れる。',
    reversePrompt: '単語や文章を数値の並びに変換し、意味の近さをその距離で表せるようにした表現は？',
    lessonId: 'les-l01', questionIds: ['q-l01-6'], sources: [JDLA, ATTN], difficulty: 2,
  }),
  c({
    id: 'card-l01-11', mode: 'literacy', syllabusId: 'l-01', conceptId: 'card-l01-11', term: 'マルチモーダル',
    definition: 'テキストだけでなく、画像・音声など複数の種類のデータを入出力できるモデルやシステムを指す。モダリティごとに得意不得意と失敗パターンが異なる。',
    reversePrompt: '文章だけでなく画像や音声など、複数の種類のデータを入出力できるモデルやシステムの性質は？',
    lessonId: 'les-l01', questionIds: [], sources: [JDLA], difficulty: 1,
  }),
  c({
    id: 'card-l01-12', mode: 'literacy', syllabusId: 'l-01', conceptId: 'card-l01-12', term: '温度',
    definition: '生成のランダムさ（出力の確率的な揺れ）を調整する設定である。同じ指示でも出力が揺れる度合いを変えるもので、正確さを保証するものではない。',
    reversePrompt: '同じ指示でも出力が確率的に揺れる度合いを調整する設定で、正確さを保証するものではないものは？',
    lessonId: 'les-l01', questionIds: [], sources: [JDLA], difficulty: 2,
  }),

  // ===== l-02 生成AIサービスの活用 =====
  c({
    id: 'card-l02-07', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-3', term: '従量課金',
    definition: '使った量に応じて料金が決まる課金方式である。APIではトークン数に応じた従量課金が一般的で、アプリの月額プラン制とは料金体系が異なる。',
    reversePrompt: '使った量に応じて料金が決まる課金の仕方で、プログラム連携用の窓口では処理単位の数に応じて課金されるのが一般的なものは？',
    example: 'APIで大量の文章を処理すると、処理したトークン数に応じて料金が積み上がる。',
    lessonId: 'les-l02', questionIds: ['q-l02-3'], sources: [JDLA, OPENAI_MODELS], difficulty: 1,
  }),
  c({
    id: 'card-l02-08', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-2', term: 'データ利用ポリシー',
    definition: 'サービスが入力データをどう扱うかを定めた条件である。学習などに使われるか、保存されるかなどが含まれ、機密情報を入力してよいかの判断材料になる。',
    reversePrompt: '入力したデータが学習などに使われるかや保存の扱いなど、サービス側のデータの取り扱いを定めた条件は？',
    lessonId: 'les-l02', questionIds: ['q-l02-2'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-l02-09', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-5', term: '安全対策（ガード）',
    definition: '危険な分野の利用を抑えるためにモデル側に設ける対策である。2026年11月発表のClaude Fable 5.2では、サイバーセキュリティや生物学分野で強い対策が施され、該当する質問は性能の低いモデルへ振り分けられる場合がある。',
    reversePrompt: '同じ基盤モデルでも、危険な分野の質問への対応を強めて広く提供する形態と、審査を経た組織向けの形態とを使い分ける際に変えられる、モデル側の対策は？',
    lessonId: 'les-l02', questionIds: ['q-l02-5'], sources: [JDLA, FABLE_MYTHOS], difficulty: 3,
  }),
  c({
    id: 'card-l02-10', mode: 'literacy', syllabusId: 'l-02', conceptId: 'q-l02-3', term: '利用上限',
    definition: 'サービスやモデル、プランごとに定められた、使える量や機能の上限である。無料版と有料版、提供形態によって異なるため、利用する形態の条件を確認する。',
    reversePrompt: '契約プランやモデルごとに決まっている、一定期間に使える量や機能の限度は？',
    lessonId: 'les-l02', questionIds: ['q-l02-3'], sources: [JDLA, OPENAI_MODELS], difficulty: 1,
  }),

  // ===== l-03 プロンプトエンジニアリング =====
  c({
    id: 'card-l03-07', mode: 'literacy', syllabusId: 'l-03', conceptId: 'q-l03-1', term: 'システム指示と利用者入力の分離',
    definition: 'システム側の指示（役割・制約・出力形式）と、利用者の入力や外部データを区別して渡す設計である。意図しない指示の混入に強くなり、プロンプトインジェクションへの対策にもなる。',
    reversePrompt: '役割・制約・出力形式を担う側の指示と、利用者の入力や外部データを区別して渡し、意図しない指示の混入に強くする設計は？',
    lessonId: 'les-l03', questionIds: ['q-l03-1'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l03-08', mode: 'literacy', syllabusId: 'l-03', conceptId: 'q-l03-4', term: '典型例と境界例',
    definition: '評価や例示に使う入力例の組み合わせである。典型例は通常のケース、境界例は判断が分かれやすい端のケースを指し、判定基準とあわせて先に用意すると比較が再現可能になる。',
    reversePrompt: '評価用の入力例として、通常のケースと判断が分かれやすい端のケースを組み合わせて用意し、比較を再現可能にする作法は？',
    lessonId: 'les-l03', questionIds: ['q-l03-3', 'q-l03-4'], sources: [JDLA, PROMPT_GUIDE], difficulty: 2,
  }),
  c({
    id: 'card-l03-09', mode: 'literacy', syllabusId: 'l-03', conceptId: 'card-l03-09', term: '検証可能な回答を求める工夫',
    definition: '出典の提示、計算過程の明示、不明な点は不明と言うよう指示することである。回答を後から確かめやすくするための、指示の側の工夫を指す。',
    reversePrompt: '出典を示すこと、計算の過程を書き出すこと、分からない点は分からないと言うことを指示に含め、回答を後から確かめやすくする工夫は？',
    lessonId: 'les-l03', questionIds: [], sources: [JDLA, PROMPT_GUIDE], difficulty: 1,
  }),
  c({
    id: 'card-l03-10', mode: 'literacy', syllabusId: 'l-03', conceptId: 'card-l03-10', term: '不明点を質問させる指示',
    definition: '情報が足りない部分をAIが推測で埋めず、作業前に質問させるよう指示に含める工夫である。曖昧なまま生成させて期待と違う出力になる失敗を防ぐ。',
    reversePrompt: '情報が足りない部分を推測で埋めさせず、作業の前に尋ねさせるよう指示に組み込む工夫は？',
    lessonId: 'les-l03', questionIds: [], sources: [JDLA, PROMPT_GUIDE], difficulty: 1,
  }),

  // ===== l-04 業務への応用 =====
  c({
    id: 'card-l04-07', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-3', term: '分析の前提（期間・外れ値・欠損）',
    definition: 'データ分析で結果の解釈に影響する取り決めである。対象期間、外れ値の扱い、欠損の扱いなどが含まれ、AIに自動で判断させず人が確認する。',
    reversePrompt: '集計の対象範囲や、異常な値・抜けている値の扱いなど、結果の解釈に影響するため人が確認すべき、計算に入る前の取り決めは？',
    lessonId: 'les-l04', questionIds: ['q-l04-3'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l04-08', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-3', term: '相関と因果の区別',
    definition: '2つの量が一緒に動くこと（相関）と、一方が他方の原因であること（因果）は別であるという区別である。相関の高い組み合わせを挙げさせても、そのまま原因と結果の関係と結論づけてはならない。',
    reversePrompt: '2つの量が一緒に動くことと、一方が他方の原因であることは別だという区別で、前者だけを根拠に原因と結果の関係と結論づけてはならないものは？',
    lessonId: 'les-l04', questionIds: ['q-l04-3'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l04-09', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-4', term: '実在しないパッケージ名の提案',
    definition: 'AIがコード生成時に、実在しないパッケージ名をもっともらしく提案することがあるという注意点である。同名の悪意あるパッケージが公開されている場合、それを取り込む危険もある。',
    reversePrompt: '生成コードの利用時に注意すべき点で、実在しないライブラリ名がもっともらしく提案され、同名の悪意あるものが公開されている場合は取り込む危険もあるものは？',
    lessonId: 'les-l04', questionIds: ['q-l04-4'], sources: [JDLA, GH_SECRET], difficulty: 3,
  }),
  c({
    id: 'card-l04-10', mode: 'literacy', syllabusId: 'l-04', conceptId: 'q-l04-5', term: '検証ポイント',
    definition: 'AIを使った業務手順の中で、人の確認を挟む箇所をあらかじめ工程に組み込むことである。数値の原典確認などが該当し、確認の工程を省く設計は失敗のもとになる。',
    reversePrompt: 'AIを使う業務手順の中で、数値の原典確認など人のチェックを挟む箇所を、あらかじめ工程の中に組み込んでおくものは？',
    lessonId: 'les-l04', questionIds: ['q-l04-5'], sources: [JDLA], difficulty: 2,
  }),

  // ===== l-05 AIエージェント・開発 =====
  c({
    id: 'card-l05-07', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-1', term: 'ツール呼び出し',
    definition: 'エージェントやAIアプリが、外部の機能やサービスを実行させる仕組みである。連携にはAPIやMCPのような仕組みが使われ、「計画→実行→観察」のループの中で働く。',
    reversePrompt: 'エージェントが外部の機能を実行させる仕組みで、計画・実行・観察の繰り返しの中で働くものは？',
    lessonId: 'les-l05', questionIds: ['q-l05-1'], sources: [JDLA, OWASP], difficulty: 2,
  }),
  c({
    id: 'card-l05-08', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-4', term: 'API',
    definition: 'アプリがプログラム同士でやり取りするための連携の窓口である。AIのAPIではHTTPで要求（入力・モデル名・設定）を送り、応答を受け取る。料金と上限はトークン数や要求回数で決まることが多い。',
    reversePrompt: 'アプリがHTTPで要求（入力・モデル名・設定）を送り、応答を受け取る、プログラム同士の連携の窓口は？',
    confusion: 'APIキーはAPIそのものではなく、利用者を認証するための秘密情報である。',
    lessonId: 'les-l05', questionIds: ['q-l05-4'], sources: [JDLA, OWASP], difficulty: 1,
  }),
  c({
    id: 'card-l05-09', mode: 'literacy', syllabusId: 'l-05', conceptId: 'q-l05-5', term: 'アライメント',
    definition: 'モデルが許可された範囲内の行動を取るよう、訓練によって調整することである。GPT-6 Cyberでは、許可された範囲外のサービスを攻撃しないよう専用の訓練が行われた。',
    reversePrompt: 'モデルが許可された範囲内の行動だけを取るよう専用の訓練で調整することで、高能力のセキュリティモデルで範囲外の対象を攻撃しないよう施されたものは？',
    lessonId: 'les-l05', questionIds: ['q-l05-5'], sources: [JDLA, GPT6CYBER], difficulty: 3,
  }),

  // ===== l-06 情報の信頼性 =====
  c({
    id: 'card-l06-07', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-3', term: '一次資料',
    definition: '情報の発生源である原典そのものである。公式発表、論文の原文、統計の原表などが該当し、検証では二次情報ではなく、ここまで遡って確認する。',
    reversePrompt: '検証で遡るべき対象で、公式発表・論文の原文・統計の原表など、情報の発生源である原典そのものは？',
    lessonId: 'les-l06', questionIds: ['q-l06-3', 'q-l06-4'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),
  c({
    id: 'card-l06-08', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-3', term: '書誌情報',
    definition: '文献を特定するための情報である。題名・著者・掲載誌や発行年などが含まれ、引用の検証ではまずその実在を確かめる対象になる。',
    reversePrompt: '文献を特定するための題名・著者・出版情報などの情報で、引用の検証でまず実在を確かめる対象になるものは？',
    lessonId: 'les-l06', questionIds: ['q-l06-3'], sources: [JDLA, OWASP], difficulty: 1,
  }),
  c({
    id: 'card-l06-09', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-5', term: '主張の分解',
    definition: 'AIの説明文などの主張を、数値・日付・固有名詞など検証可能な要素ごとに分ける、検証の手順である。要素ごとに分けることで、それぞれ一次資料で照合できるようになる。',
    reversePrompt: 'AIの説明文を、数値・日付・固有名詞など確かめられる要素ごとに分けてから照合する、検証の最初の手順は？',
    lessonId: 'les-l06', questionIds: ['q-l06-5'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-l06-10', mode: 'literacy', syllabusId: 'l-06', conceptId: 'card-l06-10', term: '照合結果の分類（確認済み・誤り・未確認）',
    definition: '照合した要素を「確認済み／誤り／未確認」に分けて記録する進め方である。確認できない要素は未確認のまま残し、誤りの種類（数値・固有名詞・因果など）もあわせて記録する。',
    reversePrompt: '照合した要素を、裏付けが取れたもの・間違いだったもの・確かめられなかったものの3つに分けて記録し、確かめられなかったものをそのまま残す進め方は？',
    lessonId: 'les-l06', questionIds: [], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-l06-11', mode: 'literacy', syllabusId: 'l-06', conceptId: 'q-l06-2', term: 'ベンチマークの評価条件の確認',
    definition: '公表されたベンチマークの数字を読むときに、数字と併せて確認すべき条件である。評価データ、評価方法、実施主体、モデルのバージョンと、データ汚染の可能性が含まれる。',
    reversePrompt: '公表された性能の数字を読むときに併せて確かめるべき、評価に使ったデータ・方法・実施した主体・モデルの版といった条件の確認は？',
    lessonId: 'les-l06', questionIds: ['q-l06-2'], sources: [JDLA, OWASP], difficulty: 2,
  }),

  // ===== l-07 法律・倫理・社会 =====
  c({
    id: 'card-l07-07', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-3', term: '人間中心のAI社会原則',
    definition: '日本のAI政策の基本原則である。2025年12月に閣議決定された人工知能基本計画でも堅持するとされ、イノベーションの促進とリスク対応の両立の土台になる。',
    reversePrompt: '日本の政策の基本原則で、2025年12月に閣議決定された基本計画でも堅持するとされた、人間を中心に置く考え方は？',
    lessonId: 'les-l07', questionIds: ['q-l07-3'], sources: [JDLA, AI_PLAN], difficulty: 2,
  }),
  c({
    id: 'card-l07-08', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-2', term: '判断過程の記録',
    definition: '説明責任の実践として、根拠を確認した過程や判断の経緯を記録しておくことである。「AIがそう言った」ではなく、何を根拠に採用したかを後から示せるようにする。',
    reversePrompt: '後から説明できるよう、根拠を確認した過程や採用の経緯を残しておく実践は？',
    lessonId: 'les-l07', questionIds: ['q-l07-2'], sources: [JDLA, BUNKA], difficulty: 2,
  }),
  c({
    id: 'card-l07-09', mode: 'literacy', syllabusId: 'l-07', conceptId: 'q-l07-5', term: '制度の適用範囲（国と時期）',
    definition: 'AIに関する制度は国と時期で異なり、海外のサービスを利用する場合でも、自国の法と所属組織の規程が適用される場面があるという点である。利用前に、どの制度が及ぶかを確認する。',
    reversePrompt: '海外のサービスを使う場合でも自国の法や所属組織の規程が及ぶ場面があるため、国と時期で異なる制度の及ぶ範囲を確かめる必要があるという注意点は？',
    lessonId: 'les-l07', questionIds: ['q-l07-5'], sources: [JDLA, PPC_GENAI], difficulty: 2,
  }),
];
