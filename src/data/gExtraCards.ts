import type { Flashcard } from '../types';

// G検定の追加カード（深掘り・応用編）。既存カード（flashcards.ts、章あたり7〜11枚の基本用語）と
// 主題が重複しない用語だけを各章6枚ずつ収録する。ID は既存の連番と衝突しない 51 番台から付ける。
// conceptId は関連する既存問題のIDに合わせ、対応する問題がない概念ではカード自身のIDを使う。
// reversePrompt は用語名・略号・別名が答えとして漏れない表現にする（既存カードの方針を踏襲）。

const JDLA = { title: 'JDLA G検定 公式ページ（シラバス）', url: 'https://www.jdla.org/certificate/general/' };
const SEP_AI = { title: 'Stanford Encyclopedia of Philosophy: Artificial Intelligence', url: 'https://plato.stanford.edu/entries/artificial-intelligence/' };
const SK_UG = { title: 'scikit-learn User Guide（機械学習手法の公式ドキュメント）', url: 'https://scikit-learn.org/stable/user_guide.html' };
const NIST_HB = { title: 'NIST/SEMATECH e-Handbook of Statistical Methods', url: 'https://www.itl.nist.gov/div898/handbook/' };
const SHANNON = { title: "Shannon 'A Mathematical Theory of Communication' (1948, 原著)", url: 'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf' };
const ATTN = { title: 'Vaswani et al. "Attention Is All You Need" (arXiv:1706.03762)', url: 'https://arxiv.org/abs/1706.03762' };
const BUNKA = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const CHOSAKUKEN = { title: 'e-Gov法令検索「著作権法」', url: 'https://laws.e-gov.go.jp/law/345AC0000000048' };
const KOJIN = { title: 'e-Gov法令検索「個人情報の保護に関する法律」', url: 'https://laws.e-gov.go.jp/law/415AC0000000057' };
const GL_PAGE = { title: '総務省・経済産業省「AI事業者ガイドライン」掲載ページ', url: 'https://www.soumu.go.jp/main_sosiki/kenkyu/ai_network/02ryutsu20_04000019.html' };
const OECD_AI = { title: 'OECD AI Principles', url: 'https://www.oecd.org/en/topics/sub-issues/ai-principles.html' };
const SHAP = { title: 'Lundberg & Lee "A Unified Approach to Interpreting Model Predictions" (arXiv:1705.07874)', url: 'https://arxiv.org/abs/1705.07874' };
const NIST_RMF = { title: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' };

const V_AT = '2026-11-11';
type C = Omit<Flashcard, 'verifiedAt'>;
const c = (x: C): Flashcard => ({ ...x, verifiedAt: V_AT });

export const G_EXTRA_CARDS: Flashcard[] = [
  // ===== g-01 人工知能とは（深掘り） =====
  c({
    id: 'card-g01-51', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-9', term: 'AI効果',
    definition: 'AIで実現された途端に、その働きは「知能ではない、ただの計算や機械的な処理だ」と評され、AIと呼ばれなくなる現象である。知能のハードルが実現のたびに動くことを示す。',
    reversePrompt: 'コンピュータがチェスで人間に勝つようになると「あれは知能ではなく計算だ」と言われ始めるように、実現された知的働きほどAIと呼ばれなくなる現象は？',
    example: '文字認識や機械翻訳が実用化されると、それらは「単なるソフト」と見なされるようになった。',
    lessonId: 'les-g01', questionIds: ['q-g01-9'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g01-52', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-15', term: 'ELIZA効果',
    definition: '単純なルールで応答するだけのプログラムに対しても、利用者が人間らしさや意味の理解を読み取ってしまう心理的傾向である。初期の対話プログラムの名に由来する。',
    reversePrompt: '定型的な応答しか返さない対話プログラムに接した人が、「分かってくれている」と感じてしまう傾向は？',
    confusion: '対話の自然さから知能を判定する手続き（チューリングテスト）そのものではない。利用者側の心理の話である。',
    lessonId: 'les-g01', questionIds: ['q-g01-15'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g01-53', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-17', term: 'ハイブリッドAI',
    definition: 'ルールベースなどの記号的な処理と、機械学習による処理を組み合わせて構成したAIである。説明のしやすさと、データからの柔軟な学習を補い合わせる狙いがある。',
    reversePrompt: '人間が書いたルールによる処理と、データから学ぶ処理とを組み合わせ、互いの弱点を補う設計のAIを指す言葉は？',
    lessonId: 'les-g01', questionIds: ['q-g01-17'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g01-54', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-16', term: '記号主義とコネクショニズム',
    definition: '知能の実現をめぐる二つの立場である。記号主義は知識と推論を記号の操作として捉え、コネクショニズムは神経回路を模した結合の重み調整に知能の働きを見る。古典AIとニューラルネットワークの対比に対応する。',
    reversePrompt: '記号の操作によって知能を実現しようとする立場と、神経回路のような多数の結合の調整によって実現しようとする立場の対比を何と呼ぶか？',
    lessonId: 'les-g01', questionIds: ['q-g01-16'], sources: [JDLA, SEP_AI], difficulty: 3,
  }),
  c({
    id: 'card-g01-55', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-14', term: '技術的特異点（シンギュラリティ）',
    definition: 'AIの知能が人間の知能を超え、社会や技術の変化が人間の予測を超えて加速するとされる転換点を指す概念である。到来の有無や時期について確立した予測があるわけではない。',
    reversePrompt: 'AIが人間の知能を超え、社会の変化が予測不能な速度で進むとされる転換点を指す概念は？',
    confusion: 'AIの水準の段階（レベル1〜4）のような到達度の分類ではない。将来像についての概念である。',
    lessonId: 'les-g01', questionIds: ['q-g01-14'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g01-56', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-26', term: 'トイプロブレム',
    definition: '研究のために単純化された「おもちゃの」問題である。解くこと自体は可能でも、その解法がそのまま現実の複雑な問題に一般化できるとは限らない点が教訓になる。',
    reversePrompt: '条件を単純に切り取った研究用の小さな問題で、それが解けても現実問題への応用は別途難しい、という文脈で使われる言葉は？',
    lessonId: 'les-g01', questionIds: ['q-g01-26'], sources: [JDLA, SEP_AI], difficulty: 1,
  }),

  // ===== g-02 人工知能をめぐる動向（深掘り） =====
  c({
    id: 'card-g02-51', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-26', term: 'αβ法（アルファ・ベータ枝刈り）',
    definition: '二人対戦ゲームの探索（ミニマックス法）で、最終結果に影響しないことが分かった枝を途中で切り捨て、探索量を減らす手法である。得られる最善手は通常のミニマックスと変わらない。',
    reversePrompt: 'ゲーム木の探索で、評価の上限と下限の情報から「調べても結論が変わらない」と分かる枝を早めに打ち切り、計算量を減らす手法は？',
    lessonId: 'les-g02', questionIds: ['q-g02-26'], sources: [JDLA], difficulty: 3,
  }),
  c({
    id: 'card-g02-52', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-18', term: '意味ネットワーク（セマンティックネット）',
    definition: '概念をノード、概念同士の関係をラベル付きのリンクで表す知識表現である。「〜である（is-a）」の関係を通じた性質の継承などを扱える。',
    reversePrompt: '概念同士を「〜である」「〜を持つ」といったラベル付きのつながりで表し、知識を網状に表す表現方法は？',
    lessonId: 'les-g02', questionIds: ['q-g02-18'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g02-53', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-21', term: '前向き推論（フォワードチェイニング）',
    definition: '与えられた事実にルールを繰り返し適用して、新しい事実を次々に導いていくデータ駆動型の推論方式である。結論を先に定めず、得られている情報から広げていく。',
    reversePrompt: '手元にある事実から出発し、当てはまるルールを適用して新しい事実を積み上げていく進め方の推論は？',
    confusion: '結論側から遡るのは後向き推論。どちらも同じルール集合を使い、進む方向が逆である。',
    lessonId: 'les-g02', questionIds: ['q-g02-21'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g02-54', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-22', term: '後向き推論（バックワードチェイニング）',
    definition: '証明したい結論（目標）を出発点に、その結論を導くルールの条件をさらに事実や下位の目標として遡って確認していく目標駆動型の推論方式である。エキスパートシステムの質問応答の仕組みに使われた。',
    reversePrompt: '結論を仮定して、その成立に必要な条件を次々に遡って確かめていく進め方の推論は？',
    lessonId: 'les-g02', questionIds: ['q-g02-22'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g02-55', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-16', term: '制約充足問題（CSP）',
    definition: '変数、その取り得る値の集合（ドメイン）、変数間の制約からなる問題の枠組みで、すべての制約を同時に満たす値の割り当てを求める。時間割作成や配置問題などが典型例である。',
    reversePrompt: '割り当てるべき変数、候補となる値の集合、守るべき条件の集まりとして問題を定式化し、条件を全部満たす組み合わせを探す問題の枠組みは？',
    lessonId: 'les-g02', questionIds: ['q-g02-16'], sources: [JDLA], difficulty: 3,
  }),
  c({
    id: 'card-g02-56', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-27', term: '山登り法',
    definition: '現在の解の近傍の中で評価の最も良いものへ移動することを繰り返す局所探索の手法である。単純で速い一方、より良い解が離れた場所にある場合、途中の峰（局所最適解）で止まってしまう弱点がある。',
    reversePrompt: '今の解の近くを少しずつ探して良くなる方向へ進み続ける探索で、途中の小さな山の頂上に引っかかって全体の最良に届かない弱点を持つ方法は？',
    lessonId: 'les-g02', questionIds: ['q-g02-27'], sources: [JDLA], difficulty: 2,
  }),

  // ===== g-03 機械学習の概要（深掘り） =====
  c({
    id: 'card-g03-51', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-9', term: 'サポートベクターマシン（SVM）',
    definition: 'クラスを分ける境界と、境界に最も近いデータ点との距離（マージン）を最大化する教師あり学習法である。データを高次元に写す工夫（カーネル法）により、曲がった境界にも対応できる。',
    reversePrompt: '二つのクラスの境界を引き、境界にいちばん近いデータ点までの余白が最大になるように決める学習法で、高次元への写像を応用して曲がった境界も引けるものは？',
    lessonId: 'les-g03', questionIds: ['q-g03-9'], sources: [JDLA, SK_UG], difficulty: 2,
  }),
  c({
    id: 'card-g03-52', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-10', term: '決定木と不純度',
    definition: '決定木は条件分岐を繰り返して予測するモデルで、各分割の良し悪しは、分割後のグループに異クラスがどれだけ混じるかを示す不純度（ジニ不純度やエントロピー）の減り方で測る。不純度が最も下がる条件で分割していく。',
    reversePrompt: '質問を繰り返して予測に至る木構造のモデルで、枝分かれの良し悪しを「混ざり具合」の下がり方で測る、その混ざり具合の指標は？',
    lessonId: 'les-g03', questionIds: ['q-g03-10'], sources: [JDLA, SK_UG], difficulty: 2,
  }),
  c({
    id: 'card-g03-53', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-18', term: 'バギング',
    definition: '元のデータから重複を許して抽出した複数のデータセットでモデルを並列に学習し、平均や多数決で統合するアンサンブル手法である。ランダムなばらつきが相殺され、分散が下がる。ランダムフォレストの基礎になる。',
    reversePrompt: 'データから重複ありで何度もサンプリングし、それぞれで別々にモデルを作って答えを平均化・多数決でまとめ、予測のばらつきを抑える手法は？',
    confusion: '誤差を順に補いながら逐次的にモデルを足すのは勾配ブースティングで、並列に作る点が異なる。',
    lessonId: 'les-g03', questionIds: ['q-g03-18'], sources: [JDLA, SK_UG], difficulty: 3,
  }),
  c({
    id: 'card-g03-54', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-19', term: '勾配ブースティング',
    definition: '弱いモデルを一つずつ逐次的に追加し、新しいモデルが直前までの予測の誤差（損失の勾配）を補うように学習するアンサンブル手法である。決定木と組み合わせた実装が表形式データで強い性能を示す。',
    reversePrompt: '小さなモデルを順番に足していき、新しいモデルには「今の予測が外している部分」を集中的に直させる、という進め方のアンサンブル手法は？',
    lessonId: 'les-g03', questionIds: ['q-g03-19'], sources: [JDLA, SK_UG], difficulty: 3,
  }),
  c({
    id: 'card-g03-55', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-25', term: 'F1スコア',
    definition: '適合率と再現率の調和平均で表される分類の評価指標である。2TP ÷ (2TP + FP + FN) とも書け、どちらか一方が低いと値も低くなる。クラスが不均衡なデータでは正解率より実態を反映しやすい。',
    reversePrompt: '「陽性と出したうち当たっていた割合」と「本当の陽性のうち拾えた割合」の調和平均で、片方が低ければ全体も低くなる評価指標は？',
    example: 'TP=80、FP=20、FN=10 のとき F1 = 160 ÷ 190 ≒ 0.84。',
    lessonId: 'les-g03b', questionIds: ['q-g03-25'], sources: [JDLA, SK_UG], difficulty: 2,
  }),
  c({
    id: 'card-g03-56', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-12', term: '半教師あり学習',
    definition: '少量のラベル付きデータと大量のラベルなしデータを併用する学習方式である。ラベル付けにかかるコストが高い場面で、ラベルなしデータから得られる分布の情報も活用する。',
    reversePrompt: '正解ラベルのあるデータが少ししかないため、ラベルのない大量のデータも一緒に使って学ぶ方式は？',
    lessonId: 'les-g03', questionIds: ['q-g03-12'], sources: [JDLA, SK_UG], difficulty: 2,
  }),

  // ===== g-04 ディープラーニングの概要（深掘り） =====
  c({
    id: 'card-g04-51', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-9', term: 'モーメンタム',
    definition: '勾配降下法に、これまでの更新の向きを蓄積する「慣性」の考え方を持ち込んだ最適化の工夫である。同じ方向への移動が加速し、細かい振動が抑えられるため、学習が速く安定しやすい。',
    reversePrompt: '勾配の方向への移動に、それまでの移動の勢いを加えて加速し、ジグザグな振動を抑える最適化の工夫は？',
    lessonId: 'les-g04', questionIds: ['q-g04-9'], sources: [JDLA, SK_UG], difficulty: 2,
  }),
  c({
    id: 'card-g04-52', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-18', term: 'AdaGrad',
    definition: 'パラメータごとに学習率を適応させる最適化手法である。過去の勾配の二乗和が大きいパラメータほど学習率を下げるため、まばらな特徴の学習に向く一方、学習率が下がり続けて途中で止まりやすい欠点があり、RMSpropの改良の動機となった。',
    reversePrompt: 'パラメータごとに、これまで大きく動いてきたものほど学習率を自動で小さくする仕組みを持つ最適化手法は？',
    lessonId: 'les-g04', questionIds: ['q-g04-18'], sources: [JDLA, SK_UG], difficulty: 2,
  }),
  c({
    id: 'card-g04-53', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-17', term: '勾配クリッピング', aliases: ['グラジエントクリッピング'],
    definition: '勾配の大きさ（ノルム）があらかじめ定めた上限を超えた場合に、その上限まで切り詰めてから重みを更新する処理である。勾配爆発による学習の破綻を防ぐ。',
    reversePrompt: '勾配が大きくなりすぎたときに、上限値を超えた分を切りそろえてから更新することで、学習が吹き飛ぶのを防ぐ処理は？',
    confusion: '勾配が小さくなりすぎて伝わらなくなる勾配消失とは逆方向の問題への対処である。',
    lessonId: 'les-g04', questionIds: ['q-g04-17'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g04-54', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-15', term: 'Xavier初期化（Glorot初期化）',
    definition: '層の入力数と出力数に応じて重みの初期値のばらつきを調整し、順伝播の活性値と逆伝播の勾配の分散が層をまたいで大きく変わらないようにする初期化の方法である。シグモイドやtanhのような活性化関数を前提に考えられた。',
    reversePrompt: '重みの初期値を層の入出力の数に合わせて調整し、信号や勾配の大きさが層を進むにつれて消えたり膨れたりしないようにする初期化法は？',
    lessonId: 'les-g04', questionIds: ['q-g04-15'], sources: [JDLA], difficulty: 3,
  }),
  c({
    id: 'card-g04-55', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-16', term: 'He初期化',
    definition: 'ReLUのような活性化関数を前提とした重みの初期化の方法である。負の入力がゼロになることで分散が減る分を見込み、Xavier初期化より大きめの分散で初期値を引く。',
    reversePrompt: '負側の出力がゼロになる活性化関数を使う前提で、信号が弱まる分を見込んで初期値のばらつきを大きめに取る初期化法は？',
    lessonId: 'les-g04', questionIds: ['q-g04-16'], sources: [JDLA], difficulty: 3,
  }),
  c({
    id: 'card-g04-56', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-29', term: 'ミニバッチ学習',
    definition: '学習データを小さなまとまり（ミニバッチ）に分け、そのまとまりごとに勾配を計算して重みを更新する学習方式である。全データを使うバッチ学習と、1件ごとのオンライン学習の中間に位置し、計算効率と更新の頻度のバランスが良い。',
    reversePrompt: '全データを一度に使うのではなく、小さな塊ごとに勾配を求めてこまめに重みを更新していく学習の進め方は？',
    lessonId: 'les-g04', questionIds: ['q-g04-29'], sources: [JDLA, SK_UG], difficulty: 1,
  }),

  // ===== g-05 ディープラーニングの要素技術（深掘り） =====
  c({
    id: 'card-g05-51', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-11', term: '位置エンコーディング',
    definition: 'TransformerのAttentionが入力の並び順そのものを扱えないため、各トークンの位置情報を埋め込みに加えて与える仕組みである。位置ごとに異なる周期の波を使う方法や、学習で得る方法がある。',
    reversePrompt: '系列の順序を区別できない仕組みに対し、単語の意味のベクトルへ「何番目か」の情報を足し込むための工夫は？',
    lessonId: 'les-g05b', questionIds: ['q-g05-11'], sources: [JDLA, ATTN], difficulty: 2,
  }),
  c({
    id: 'card-g05-52', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-26', term: 'VAE（変分オートエンコーダ）',
    definition: 'エンコーダが入力を潜在分布のパラメータに変換し、そこから標本化した潜在変数をデコーダが復元する生成モデルである。潜在空間に確率的な構造を与えるため、補間や無作為な生成ができる。通常のオートエンコーダとの違いはこの確率的な扱いにある。',
    reversePrompt: '入力を「分布」へ圧縮し、そこから取り出した値で復元することで、潜在空間を滑らかにして新しいデータの生成にも使えるようにした仕組みは？',
    lessonId: 'les-g05b', questionIds: ['q-g05-26'], sources: [JDLA], difficulty: 3,
  }),
  c({
    id: 'card-g05-53', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-22', term: 'マルチヘッドAttention',
    definition: 'Attentionの計算を複数のヘッドに分け、それぞれが異なる観点（異なる部分空間）で要素間の関係を捉え、結果を統合する仕組みである。文法的な関係や意味的な関係など、複数種類の結びつきを並行して扱える。',
    reversePrompt: '要素同士の関連の見方を複数用意し、それぞれが別の観点で重み付けした結果を最後に束ねる仕組みは？',
    lessonId: 'les-g05', questionIds: ['q-g05-22'], sources: [JDLA, ATTN], difficulty: 3,
  }),
  c({
    id: 'card-g05-54', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-9', term: 'GRU（ゲート付き回帰型ユニット）',
    definition: 'LSTMのゲート機構を簡略化した回帰型ユニットである。更新ゲートとリセットゲートの2種類で情報の保持と忘却を制御し、パラメータ数がLSTMより少ない。',
    reversePrompt: '長期の依存を扱うためのゲート付きの仕組みを、より少ない部品で実現した回帰型のユニットは？',
    lessonId: 'les-g05', questionIds: ['q-g05-9'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g05-55', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-12', term: 'Seq2Seq（系列変換モデル）',
    definition: '入力系列を固定長の表現に読み込むエンコーダと、そこから別の系列を生成するデコーダを組み合わせた枠組みである。入力と出力の長さが異なる機械翻訳などの変換タスクに使われた。',
    reversePrompt: '文章を読み込んで要約した表現に変える部分と、そこから別の長さの文章を書き出す部分を組み合わせ、系列から系列への変換を行う枠組みは？',
    lessonId: 'les-g05', questionIds: ['q-g05-12'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g05-56', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-17', term: '転置畳み込み',
    definition: '畳み込みとは逆向きに、特徴マップの空間サイズを拡大する操作である。画像生成やセグメンテーションの拡大側（デコーダ側）で使われる。名前の由来は演算の行列表現の転置に対応することにある。',
    reversePrompt: '特徴マップを縮める方向とは逆に、空間的な大きさを広げる方向に働く畳み込み型の操作で、生成や分割の「戻す側」で使われるものは？',
    lessonId: 'les-g05', questionIds: ['q-g05-17'], sources: [JDLA], difficulty: 3,
  }),

  // ===== g-06 ディープラーニングの応用例（深掘り） =====
  c({
    id: 'card-g06-51', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-14', term: '一段階検出器（ワンステージ検出器）',
    definition: '物体検出で、候補領域の生成という前段を経ずに、画像全体から物体の位置とクラスを一度の処理で予測する方式である。YOLOの系統が代表例で、高速なためリアルタイム用途に向く。二段階検出器と対比される。',
    reversePrompt: '物体のありそうな場所を先に絞る手順を省き、画像を一度通すだけで場所と種類を直接言い当てる、高速さが売りの検出の方式は？',
    lessonId: 'les-g06b', questionIds: ['q-g06-14'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g06-52', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-10', term: 'セマンティックセグメンテーション',
    definition: '画像の各画素にクラスラベルを付けるタスクである。同じクラスの物体が複数あっても個体としては区別せず、領域の種類だけを塗り分ける。個体ごとに分けるインスタンスセグメンテーションとは目的が異なる。',
    reversePrompt: '画像の1画素ごとに「道路」「人」「車」といった種類の札を付けていくが、同じ種類の個々の物体までは区別しないタスクは？',
    lessonId: 'les-g06b', questionIds: ['q-g06-10'], sources: [JDLA, SK_UG], difficulty: 2,
  }),
  c({
    id: 'card-g06-53', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-15', term: '姿勢推定',
    definition: '画像や映像から、人物などの関節点（キーポイント）の位置を推定するタスクである。骨格の動きが得られるため、スポーツの動作分析やジェスチャ認識などの基礎になる。',
    reversePrompt: '人物の肩・肘・膝といった関節の位置を画像から読み取り、体の構えや動きを捉えるタスクは？',
    lessonId: 'les-g06b', questionIds: ['q-g06-15'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g06-54', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-16', term: 'OCR（光学文字認識）',
    definition: '画像として写っている文字を、機械が処理できるテキストデータに変換する技術である。文書のデジタル化や帳票処理に使われ、手書きや崩れた文字、複雑なレイアウトが誤りの主因になる。',
    reversePrompt: 'スキャンした文書や看板の写真に写る文字を、検索や編集ができる文字データに変換する技術は？',
    lessonId: 'les-g06', questionIds: ['q-g06-16'], sources: [JDLA], difficulty: 1,
  }),
  c({
    id: 'card-g06-55', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-19', term: '感情分析（センチメント分析）',
    definition: 'テキストが肯定的か否定的かといった感情の傾向を判定する自然言語処理のタスクである。レビューやSNSの声の集計などに使われる。皮肉や文脈依存の表現が誤りの原因になりやすい。',
    reversePrompt: '文章が好意的な内容か否定的な内容かを自動で判別し、口コミの傾向集計などに使うタスクは？',
    lessonId: 'les-g06', questionIds: ['q-g06-19'], sources: [JDLA], difficulty: 1,
  }),
  c({
    id: 'card-g06-56', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-25', term: 'マルチタスク学習',
    definition: '関連する複数のタスクを一つのモデルで同時に学習し、表現の一部を共有させる方法である。タスク同士の共通性が助けになり、データの少ないタスクの性能が改善することがある。',
    reversePrompt: '分類と回帰のように別の課題を一つのモデルに一緒に学ばせ、途中の表現を共有することで互いの性能向上を狙う方法は？',
    lessonId: 'les-g06', questionIds: ['q-g06-25'], sources: [JDLA, SK_UG], difficulty: 2,
  }),

  // ===== g-07 AIの社会実装に向けて（深掘り） =====
  c({
    id: 'card-g07-51', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-19', term: 'データガバナンス',
    definition: 'データの品質、所在、利用権限、利用ルールを組織として管理し統制する枠組み全体を指す。誰がどのデータを何に使ってよいかを定め、監査できる状態を保つことが内容になる。',
    reversePrompt: '組織の中で「どのデータを、誰が、何のために使ってよいか」と品質や所在まで含めて管理・統制する仕組み全体を指す言葉は？',
    lessonId: 'les-g07', questionIds: ['q-g07-19'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g07-52', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-18', term: 'SLA（サービスレベル合意）',
    definition: 'サービス提供者と利用者の間で、可用性や応答時間などの品質水準と、それを満たせなかった場合の扱いを定めた合意である。AIシステムの運用では、精度や応答時間の水準の定め方が論点になる。',
    reversePrompt: '「稼働率は何%以上」「応答は何秒以内」のように、サービスの品質の水準と未達時の取り決めを契約として明示したものは？',
    lessonId: 'les-g07', questionIds: ['q-g07-18'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g07-53', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-20', term: 'メタデータ管理',
    definition: 'データそのものではなく、データの出所、更新日時、定義、所有者、形式といった「データについてのデータ」を管理することである。データを探し、意味を正しく理解し、品質と利用条件を統制する基盤になる。',
    reversePrompt: '中身のデータではなく、「いつ・どこから来て・何を意味し・誰が管理するデータか」といった説明情報を整理して管理することは？',
    lessonId: 'les-g07', questionIds: ['q-g07-20'], sources: [JDLA], difficulty: 1,
  }),
  c({
    id: 'card-g07-54', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-24', term: 'A/Bテスト',
    definition: '対象を2つの群に分け、一方に従来の方法、他方に変更後の方法を適用して、指標の差から変更の効果を比較検証する実験手法である。AIシステムの改善効果の測定にも使われる。',
    reversePrompt: '利用者を二つのグループに無作為に振り分け、片方だけ新しい版を使ってもらって指標の差を比べ、変更の効果を確かめる実験は？',
    lessonId: 'les-g07', questionIds: ['q-g07-24'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g07-55', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-14', term: 'スコープ定義',
    definition: 'プロジェクトで取り組む範囲（対象業務、扱うデータ、目標とする水準）と、範囲外とする事項を明確に定めることである。範囲が曖昧なままだと、後工程で要求が際限なく広がり、計画が崩れる。',
    reversePrompt: 'プロジェクトの着手前に「ここまではやる、ここからはやらない」という取り組みの範囲と境界をはっきりさせる作業は？',
    lessonId: 'les-g07', questionIds: ['q-g07-14'], sources: [JDLA], difficulty: 1,
  }),
  c({
    id: 'card-g07-56', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-17', term: '検収（受け入れテスト）',
    definition: '納入された成果物が契約や仕様を満たしているかを発注側が検査し、受け入れる手続きである。AIシステムでは精度のような確率的な性質が対象になるため、評価データと測定方法、合格基準を事前に取り決めておくことが重要になる。',
    reversePrompt: '届いた成果物が約束どおりの内容かを発注側が確かめて受け取る手続きで、AIでは「何をもって合格とするか」を先に決めておく必要が特に高いものは？',
    lessonId: 'les-g07', questionIds: ['q-g07-17'], sources: [JDLA], difficulty: 2,
  }),

  // ===== g-08 数理・統計知識（深掘り） =====
  c({
    id: 'card-g08-51', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-23', term: 'KLダイバージェンス',
    definition: '二つの確率分布のずれを表す量で、分布が一致するとき0、それ以外では正の値を取る。向きを持つ量であり、KL(P‖Q) と KL(Q‖P) は一般に異なるため、距離の公理を満たす「距離」そのものではない。',
    reversePrompt: '二つの確率分布がどれだけ食い違っているかを測る量で、一致すれば0になり、比べる向きを変えると値も変わる性質を持つものは？',
    lessonId: 'les-g08', questionIds: ['q-g08-23'], sources: [JDLA, SHANNON], difficulty: 3,
  }),
  c({
    id: 'card-g08-52', mode: 'g', syllabusId: 'g-08', conceptId: 'card-g08-52', term: '相互情報量',
    definition: '一方の変数を知ることで、他方の変数の不確実性（エントロピー）がどれだけ減るかを表す量である。I(X;Y) = H(X) − H(X|Y) と書け、二つの変数が独立なとき0になる。共同分布と周辺分布の積との間の KL ダイバージェンスとしても表される。',
    reversePrompt: '片方の結果を知ると、もう片方のあいまいさがどれくらい解消されるかを表す量で、二つが無関係なら0になるものは？',
    lessonId: 'les-g08b', questionIds: ['q-g08-23'], sources: [JDLA, SHANNON], difficulty: 3,
  }),
  c({
    id: 'card-g08-53', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-10', term: '最尤推定',
    definition: '観測されたデータが得られる確率（尤度）を最も大きくするようなパラメータの値を、推定値として選ぶ方法である。モデルのパラメータ推定の基本的な考え方の一つである。',
    reversePrompt: '「実際に観測されたデータが、いちばん起こりやすくなるような設定こそが最もらしい推定だ」とする、パラメータの決め方は？',
    lessonId: 'les-g08', questionIds: ['q-g08-10'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-54', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-27', term: '中心極限定理',
    definition: '母集団の分布の形によらず、独立な標本の平均の分布は、標本の数が大きくなるにつれて正規分布に近づくという定理である。標本平均に基づく推定や検定が広く使える根拠になっている。',
    reversePrompt: '元のデータの分布がどんな形でも、たくさん集めて平均を取る操作を繰り返すと、その平均の分布が釣鐘型に近づいていくという定理は？',
    example: 'サイコロの目は何回も振った平均ほど 3.5 の近くに集中し、分布は正規分布に近づく。',
    lessonId: 'les-g08b', questionIds: ['q-g08-27'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-55', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-15', term: '信頼区間',
    definition: '推定値の不確実さを幅のある区間で表したものである。95%信頼区間は、「同じ手続きで標本抽出と区間計算を繰り返したとき、作られた区間のうち約95%が真の値を含む」という頻度論の意味で解釈する。',
    reversePrompt: '点の推定ではなく幅で不確実さを表し、「同じやり方で繰り返せば約95%の割合で真値を含む」と解釈される区間は？',
    confusion: '「真値がこの区間の中にある確率が95%」という言い方は、頻度論では代表的な誤解とされる。',
    lessonId: 'les-g08', questionIds: ['q-g08-15'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-56', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-9', term: '条件付き確率',
    definition: 'ある事象 B が起きたという条件のもとで、別の事象 A が起きる確率であり、P(A|B) = P(A∩B) ÷ P(B) で定義される。取り出して戻さない抽出のように、前提条件によって母集団が変わる計算の基礎になる。',
    reversePrompt: '「〜であることが分かったうえで」という前提を付けたときの確率で、前提となる事象の確率で割り算して求めるものは？',
    example: '赤玉4個・白玉2個から戻さずに2個続けて赤を引く確率は、(4÷6)×(3÷5) のように、前の引き方が次の条件を変える形で計算する。',
    lessonId: 'les-g08b', questionIds: ['q-g08-9'], sources: [JDLA, NIST_HB], difficulty: 1,
  }),

  // ===== g-09 法律と契約（深掘り） =====
  c({
    id: 'card-g09-51', mode: 'g', syllabusId: 'g-09', conceptId: 'card-g09-51', term: '職務著作（法人著作）',
    definition: '法人の発意に基づき、その業務に従事する者が職務上作成した著作物について、契約や勤務規則等に別段の定めがなければ、法人等が著作者となる制度である（著作権法第15条）。プログラムの著作物には従業者のプログラムも含まれる。',
    reversePrompt: '会社の発案で従業員が仕事として作った著作物について、特に取り決めがなければ、作った個人ではなく会社そのものが著作者になると定める制度は？',
    detail: 'AI生成物では、生成に関わった人間の創作的寄与の有無が著作物性の判断に関わり、誰の寄与で何が作られたかの記録が帰属を考える手がかりになる。',
    lessonId: 'les-g09b', questionIds: ['q-g09-3'], sources: [JDLA, CHOSAKUKEN, BUNKA], difficulty: 3,
  }),
  c({
    id: 'card-g09-52', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-13', term: '複製権',
    definition: '著作物を複製（コピー）することについて著作権者が持つ権利で、著作権を構成する中心的な権利（支分権）の一つである。許諾なく複製すれば原則として侵害になるが、情報解析など権利制限の対象になる場合がある。',
    reversePrompt: '著作物をコピーする行為を独占的にコントロールできる、著作権の中核をなす権利は？',
    lessonId: 'les-g09', questionIds: ['q-g09-13'], sources: [JDLA, CHOSAKUKEN], difficulty: 2,
  }),
  c({
    id: 'card-g09-53', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-15', term: '引用（著作権法第32条）',
    definition: '公表された著作物を、公正な慣行に合致し、報道・批評・研究その他の引用の目的上正当な範囲内で利用できる権利制限の制度である。実務では、引用部分と自分の文章の主従関係が明確であること、引用部分が区別できること、出所を明示することが要件として扱われる。',
    reversePrompt: '他人の公表された著作物の一部を、自分の文章が主で引用部分が従という関係を保ち、出所を示すなどの条件のもとで使えるようにする権利制限の仕組みは？',
    confusion: '他人の文章をそのまま載せ替える転載や、自分の表現に作り替える翻案とは異なる。条件を満たさない借用は侵害になり得る。',
    lessonId: 'les-g09b', questionIds: ['q-g09-15'], sources: [JDLA, CHOSAKUKEN], difficulty: 2,
  }),
  c({
    id: 'card-g09-54', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-16', term: '商標権',
    definition: '商品やサービスの出所を示すマーク（商標）について、登録により得られる独占的に使用できる権利である。他者が似たマークを同じような商品・サービスに使うことを排除できる。AIで生成したロゴや名称を利用する際にも侵害の確認が必要になる。',
    reversePrompt: '商品やサービスの出所を示すロゴや名称を登録し、他者が紛らわしいものを同じ分野で使うことを止められる権利は？',
    lessonId: 'les-g09', questionIds: ['q-g09-16'], sources: [JDLA], difficulty: 1,
  }),
  c({
    id: 'card-g09-55', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-19', term: '安全管理措置',
    definition: '個人データの漏えい、滅失、毀損などを防ぐために、個人情報取扱事業者が講じなければならない組織的、人的、物理的、技術的な措置である。アクセス制御や従業者への教育などが含まれ、委託先の監督とあわせて実務の中心になる。',
    reversePrompt: '個人データを安全に扱うために事業者に求められる、体制づくり・教育・アクセス制限・技術対策まで含む一連の措置は？',
    lessonId: 'les-g09b', questionIds: ['q-g09-19'], sources: [JDLA, KOJIN], difficulty: 2,
  }),
  c({
    id: 'card-g09-56', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-27', term: '秘密保持契約（NDA）',
    definition: '情報を開示する前に、秘密情報の範囲、利用目的、開示してよい相手、保持期間などを取り決める契約である。AI開発で顧客データやノウハウを外部事業者と共有する場面では、共有の前提として締結される。',
    reversePrompt: '情報を渡す前に、「何が秘密で、誰に、どこまで使ってよいか」を書面で取り決める契約は？',
    lessonId: 'les-g09b', questionIds: ['q-g09-27'], sources: [JDLA], difficulty: 1,
  }),

  // ===== g-10 AI倫理・AIガバナンス（深掘り） =====
  c({
    id: 'card-g10-51', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-18', term: '機会の均等（公平性指標）',
    definition: 'AIの公平性を測る指標の一つで、実際に陽性である人のうち正しく陽性と判定された割合（真陽性率）を、グループ間でそろえることを求める考え方である。陽性率自体をそろえる人口統計的パリティとは、そろえる対象が異なる。',
    reversePrompt: '公平さの測り方の一つで、「本当に該当する人を当てられた割合」を集団ごとにそろえることを求める指標は？',
    confusion: '複数の公平性指標は、集団ごとのベースレートが違う場合、同時に満たせないことがある。どの指標を優先するかは用途で決める。',
    lessonId: 'les-g10b', questionIds: ['q-g10-18'], sources: [JDLA, GL_PAGE], difficulty: 3,
  }),
  c({
    id: 'card-g10-52', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-17', term: 'LIME',
    definition: '個別の予測について、その入力の近傍だけを取り出して単純で解釈しやすいモデルで近似し、「どの特徴がこの予測を押し上げたか」を局所的に説明する手法である。説明は元のモデル自体ではなく近似である点に注意が要る。',
    reversePrompt: '一つの予測の周辺だけを単純なモデルで近似して、その場限りの説明を作る手法は？',
    confusion: '特徴量の寄与を加算的に分解する SHAP とは近似の仕方が異なる。どちらも元のモデルの判断過程そのものではない。',
    lessonId: 'les-g10', questionIds: ['q-g10-17'], sources: [JDLA, SHAP], difficulty: 3,
  }),
  c({
    id: 'card-g10-53', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-23', term: 'ヒューマン・イン・ザ・ループ',
    definition: '自動処理の流れの中に、人間による確認、承認、介入の機会を意図的に組み込む設計である。影響の大きい判断や不可逆な操作の前に人を挟むことで、誤りの拡大を防ぐ。承認者が内容を確認できる情報と時間が確保されて初めて機能する。',
    reversePrompt: '全自動に任せきりにせず、要所で人間が中身を確認して承認・差し戻しができるよう、処理の流れの中に人の関与を組み込む設計は？',
    lessonId: 'les-g10b', questionIds: ['q-g10-23'], sources: [JDLA, NIST_RMF], difficulty: 2,
  }),
  c({
    id: 'card-g10-54', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-12', term: 'プライバシー・バイ・デザイン',
    definition: 'プライバシー保護を、サービス完成後の付け足しではなく、企画や設計の段階から組み込んでおく考え方である。収集する情報の最小化や、初期設定で保護側に倒すことなどが具体策になる。',
    reversePrompt: '問題が起きてから対処するのではなく、設計の最初の段階から個人の情報の守り方を仕様に織り込んでおく考え方は？',
    lessonId: 'les-g10', questionIds: ['q-g10-12'], sources: [JDLA, OECD_AI], difficulty: 2,
  }),
  c({
    id: 'card-g10-55', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-22', term: 'データポイズニング',
    definition: '学習データに悪意のあるデータを紛れ込ませ、学習後のモデルの挙動を攻撃者の意図する方向に歪める攻撃である。外部からデータを集める学習ほど混入の機会が増えるため、出所の管理と検証が対策になる。',
    reversePrompt: '学習に使うデータへこっそり細工したデータを混ぜ、できあがったモデルを特定の入力で誤作動させる攻撃は？',
    confusion: '入力時にモデルをだます敵対的サンプルとは違い、こちらは学習段階そのものを汚染する攻撃である。',
    lessonId: 'les-g10', questionIds: ['q-g10-22'], sources: [JDLA], difficulty: 2,
  }),
  c({
    id: 'card-g10-56', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-21', term: 'メンバーシップ推論攻撃',
    definition: 'モデルの出力の傾向などから、特定のデータがそのモデルの学習に使われていたかどうかを推定する攻撃である。学習データに個人情報が含まれていた場合、プライバシー侵害につながり得る。',
    reversePrompt: 'モデルの応答の特徴を手がかりに、「この人のデータが学習に使われたかどうか」を言い当てようとする攻撃は？',
    lessonId: 'les-g10', questionIds: ['q-g10-21'], sources: [JDLA], difficulty: 3,
  }),
];
