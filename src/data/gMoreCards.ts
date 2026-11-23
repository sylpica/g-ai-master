import type { Flashcard } from '../types';

// G検定の追加カード第3弾（2026-11-23）。flashcards.ts（基本編）と gExtraCards.ts（深掘り編）で
// 未収録だったが、教材・問題に実際に登場する専門用語を各章4枚ずつ収録する。
// ID は既存の最大連番（各章56番）の続きである57番から付ける。
// conceptId は関連する既存問題のIDに合わせ、対応する問題がない概念ではカード自身のIDを使う。
// reversePrompt は用語名・略号・別名が答えとして漏れない表現にする（既存カードの方針を踏襲）。
// sources は紐づけた教材・問題の sources から {title, url} をそのまま写したものだけを使う。

const JDLA = { title: 'JDLA G検定 公式ページ（シラバス）', url: 'https://www.jdla.org/certificate/general/' };
const SEP_AI = { title: 'Stanford Encyclopedia of Philosophy: Artificial Intelligence', url: 'https://plato.stanford.edu/entries/artificial-intelligence/' };
const SKLEARN = { title: 'scikit-learn User Guide（機械学習手法の公式ドキュメント）', url: 'https://scikit-learn.org/stable/user_guide.html' };
const ATTN = { title: 'Vaswani et al. "Attention Is All You Need" (arXiv:1706.03762)', url: 'https://arxiv.org/abs/1706.03762' };
const NIST_HB = { title: 'NIST/SEMATECH e-Handbook of Statistical Methods', url: 'https://www.itl.nist.gov/div898/handbook/' };
const GL_PAGE = { title: '総務省・経済産業省「AI事業者ガイドライン」掲載ページ', url: 'https://www.soumu.go.jp/main_sosiki/kenkyu/ai_network/02ryutsu20_04000019.html' };
const OECD_AI = { title: 'OECD AI Principles', url: 'https://www.oecd.org/en/topics/sub-issues/ai-principles.html' };
const BUNKA = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const PPC = { title: '個人情報保護委員会', url: 'https://www.ppc.go.jp/' };
const PPC_GENAI = { title: '個人情報保護委員会「生成AIサービスの利用に関する注意喚起等について」', url: 'https://www.ppc.go.jp/news/careful_information/230602_AI_utilize_alert/' };
const CAO_AI = { title: '内閣府「人間中心のAI社会原則」', url: 'https://www.cas.go.jp/jp/seisaku/jinkouchinou/pdf/aigensoku.pdf' };

const V_AT = '2026-11-23';
type C = Omit<Flashcard, 'verifiedAt'>;
const c = (x: C): Flashcard => ({ ...x, verifiedAt: V_AT });

export const G_MORE_CARDS: Flashcard[] = [
  // ===== g-01 人工知能とは（追加第3弾） =====
  c({
    id: 'card-g01-57', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-102', term: 'モラベックのパラドックス',
    definition: '人間にとって易しい知覚や運動の技能は機械には難しく、高度な推論のような人間に難しい課題の方が機械にはかえって易しいという、難しさの感覚が人間と機械で逆転する現象である。',
    reversePrompt: 'チェスのような高度な推論は機械が得意なのに、歩く・物をつかむといった人間には当たり前の動作が機械には難しい。この難しさの逆転を指す言葉は？',
    example: '歩行や物体の掴み方など、人間が無意識にこなす技能は膨大な情報処理を必要とし、機械化が難しいとされる。',
    lessonId: 'les-g01', questionIds: ['q-g01-102'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g01-58', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-105', term: '形式ニューロン',
    definition: '1943年にマカロックとピッツが提案した、神経細胞の働きを入力の重み付き和としきい値による発火として単純化した数理モデルである。ニューラルネットワークの出発点とされるが、重みをデータから学習する仕組みはまだ含まれていなかった。',
    reversePrompt: '1943年に提案された、神経細胞を「入力の重み付き和がしきい値を超えると発火する」と単純化した数理モデルで、ニューラルネットワークの出発点とされるものは？',
    example: '入力に重みを付けた合計がしきい値を超えると発火するという仕組みで、論理演算も表現できることが示された。',
    lessonId: 'les-g01', questionIds: ['q-g01-105'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g01-59', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-106', term: 'サイバネティクス',
    definition: 'ウィーナーが提唱した、フィードバックによる制御と通信を動物と機械に共通する仕組みとして捉えた学問分野である。AIの成立に先立つ知的基盤の一つとされる。',
    reversePrompt: '出力の結果を入力側へ戻すフィードバックに着目し、制御と通信を動物と機械に共通する仕組みとして捉えた、AIに先立つ学問分野は？',
    example: 'フィードバックの考え方は、後のエージェントの「知覚と行動のループ」にもつながる。',
    lessonId: 'les-g01', questionIds: ['q-g01-106'], sources: [JDLA, SEP_AI], difficulty: 3,
  }),
  c({
    id: 'card-g01-60', mode: 'g', syllabusId: 'g-01', conceptId: 'q-g01-104', term: 'CAPTCHA（キャプチャ）',
    definition: '応答者が人間か自動プログラムかを見分ける仕組みである。人間には易しく自動プログラムには難しい課題を用いる点で、発想としてはチューリングテストを逆向きに使ったものと位置づけられる。',
    reversePrompt: 'ウェブサイトで、歪んだ文字の読み取りなど人間には易しく自動プログラムには難しい課題を出し、応答者が人間かプログラムかを見分ける仕組みは？',
    confusion: '機械が人間と見分けがつかないかを問うチューリングテストそのものではない。見分ける方向が逆である。',
    lessonId: 'les-g01', questionIds: ['q-g01-104'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),

  // ===== g-02 人工知能をめぐる動向（追加第3弾） =====
  c({
    id: 'card-g02-57', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-9', term: 'ミニマックス法',
    definition: '二人対戦ゲームの探索方針である。相手は自分の利得を最小化する最善手を選ぶと仮定し、その前提で自分の利得（想定される最小利得）が最大になる手を選ぶ。ゲーム木を、自分の番では最大化、相手の番では最小化として交互にたどって評価する。',
    reversePrompt: '二人対戦ゲームで、相手が自分に最も不利になる手を選んでくると仮定し、それでも確保できる利得が最大になる手を選ぶ探索方針は？',
    confusion: 'αβ法はこの方針の計算を枝刈りで効率化したもので、得られる最善手は変わらない。',
    lessonId: 'les-g02', questionIds: ['q-g02-9', 'q-g02-101'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g02-58', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-12', term: 'ヒューリスティクス（発見的評価関数）',
    definition: '探索において、ゴールまでのコストなどを見積もり、探索を効率化するために使う経験的な評価である。A*探索ではゴールまでの予測コストとして使われ、見積もりが実コストを過大評価しない場合に最適解が保証される。',
    reversePrompt: '探索の際に「有望そうだ」という見積もりを与えて探索を導く経験的な評価の仕組みで、見積もり方によっては最適解の保証がなくなるものは？',
    lessonId: 'les-g02', questionIds: ['q-g02-12'], sources: [JDLA, SEP_AI], difficulty: 3,
  }),
  c({
    id: 'card-g02-59', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-2', term: '知識獲得のボトルネック',
    definition: 'エキスパートシステムの限界となった、専門家の知識を聞き取ってルールとして記述し、保守し続ける作業の困難さである。知識を人間が与える方式では、この獲得と更新の負担が実用化の壁になった。',
    reversePrompt: 'エキスパートシステムで、専門家の知識をルールとして取り出し、維持し続ける作業の困難さが実用化の壁になったことを指す言葉は？',
    lessonId: 'les-g02', questionIds: ['q-g02-2'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),
  c({
    id: 'card-g02-60', mode: 'g', syllabusId: 'g-02', conceptId: 'q-g02-19', term: 'フレーム（知識表現）',
    definition: '対象に関する属性（スロット）とその値の組で、典型的な状況や物の知識を構造化して表す知識表現である。ミンスキーが提案し、スロットには既定値（デフォルト値）を入れることもできる。',
    reversePrompt: '物の知識を、属性を入れる枠（スロット）とその値の組として構造化して表す知識表現は？',
    confusion: '「今関連することだけを切り出す困難さ」を指すフレーム問題とは別の概念である。こちらは知識表現の方式の名前。',
    lessonId: 'les-g02', questionIds: ['q-g02-19', 'q-g02-126'], sources: [JDLA, SEP_AI], difficulty: 2,
  }),

  // ===== g-03 機械学習の概要（追加第3弾） =====
  c({
    id: 'card-g03-57', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-104', term: '混同行列',
    definition: '分類モデルの予測結果を、実際のクラスと予測したクラスの組み合わせで集計した表である。TP（真陽性）・FP（偽陽性）・FN（偽陰性）・TN（真陰性）の4区分から、適合率・再現率・F1値・正解率などの指標を計算する土台になる。',
    reversePrompt: '分類の結果を「実際が陽性／陰性」×「予測が陽性／陰性」の4区分に集計し、各種の評価指標を計算する土台になる表は？',
    example: '陽性80件・陰性920件のデータで TP=80、FP=20、FN=10、TN=890 なら、適合率0.80、再現率約0.89、正解率0.97と読み取れる。',
    lessonId: 'les-g03b', questionIds: ['q-g03-104'], sources: [JDLA, SKLEARN], difficulty: 1,
  }),
  c({
    id: 'card-g03-58', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-112', term: 'ホールドアウト法',
    definition: 'データを学習用と評価用に一度だけ分割してモデルを評価する方法である。分割の仕方によって評価がぶれやすい弱点があり、分割を繰り返して評価のばらつきを抑える交差検証と対比される。',
    reversePrompt: 'データを学習用と評価用に一度だけ分けて評価する最も単純な方法で、分割の偶然によって評価がぶれやすい弱点があるものは？',
    lessonId: 'les-g03', questionIds: ['q-g03-112'], sources: [JDLA, SKLEARN], difficulty: 1,
  }),
  c({
    id: 'card-g03-59', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-108', term: 'バイアス・バリアンスのトレードオフ',
    definition: '予測誤差を、モデルの単純さによる系統的なずれ、学習データの選び方による結果のばらつき、削減できないノイズに分解して捉える考え方である。モデルを複雑にするほど系統的なずれは減るがばらつきは増え、総誤差が最小になる複雑さの点がある。過学習と学習不足を一つの枠組みで理解する鍵になる。',
    reversePrompt: 'モデルを複雑にするほど、単純さゆえの系統的なずれは減る一方、学習データの選び方による結果のばらつきは増える。この両者の釣り合いの関係を何と呼ぶか？',
    lessonId: 'les-g03b', questionIds: ['q-g03-108', 'q-g03-132'], sources: [JDLA, SKLEARN], difficulty: 3,
  }),
  c({
    id: 'card-g03-60', mode: 'g', syllabusId: 'g-03', conceptId: 'q-g03-131', term: '学習曲線',
    definition: '横軸に訓練データ量、縦軸に訓練スコアと検証スコアを描いたグラフである。訓練スコアが高いのに検証スコアとの差が大きいままなら過学習、両方が低い値で接近して頭打ちなら学習不足と診断する手がかりになる。',
    reversePrompt: '訓練データの量を横軸に、訓練用と検証用のスコアを縦軸に描き、過学習か学習不足かを診断するために使うグラフは？',
    lessonId: 'les-g03b', questionIds: ['q-g03-131'], sources: [JDLA, SKLEARN], difficulty: 2,
  }),

  // ===== g-04 ディープラーニングの概要（追加第3弾） =====
  c({
    id: 'card-g04-57', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-108', term: '勾配降下法',
    definition: '誤差関数（損失）を小さくするため、各パラメータを勾配の逆方向へ少しずつ動かして更新する方法である。動かす幅は学習率で決まり、大きすぎると発散し、小さすぎると収束が遅くなる。',
    reversePrompt: '損失を減らすため、傾きが最も急に下る方向へパラメータを少しずつ動かしていく、学習の基本的な更新方法は？',
    lessonId: 'les-g04', questionIds: ['q-g04-108', 'q-g04-7'], sources: [JDLA, SKLEARN], difficulty: 1,
  }),
  c({
    id: 'card-g04-58', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-19', term: 'RMSprop',
    definition: 'パラメータごとに学習率を適応させる最適化手法である。勾配の二乗の指数移動平均を使い、古い勾配の影響を弱めることで、AdaGradで学習率が下がり続けすぎる問題を緩和した。Adamはこの考え方とモーメンタムを組み合わせた手法である。',
    reversePrompt: '勾配の二乗の指数移動平均で学習率を調整し、累積方式の手法で学習率が下がり続けすぎる弱点を緩和した最適化手法は？',
    lessonId: 'les-g04', questionIds: ['q-g04-19'], sources: [JDLA, SKLEARN], difficulty: 2,
  }),
  c({
    id: 'card-g04-59', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-10', term: '交差エントロピー誤差',
    definition: '分類問題で標準的に使われる誤差関数（損失関数）である。正解クラスの予測確率が低いほど大きな値をとり、予測分布と正解分布のずれを測る。回帰では平均二乗誤差が標準であり、タスクに応じて使い分ける。',
    reversePrompt: '分類問題で、正解クラスの予測確率が低いほど大きな損失になるよう設計された、予測分布と正解分布のずれを測る損失関数は？',
    lessonId: 'les-g04', questionIds: ['q-g04-10', 'q-g04-22'], sources: [JDLA, SKLEARN], difficulty: 2,
  }),
  c({
    id: 'card-g04-60', mode: 'g', syllabusId: 'g-04', conceptId: 'q-g04-24', term: 'ソフトマックス関数',
    definition: '分類の出力層で使われ、各クラスのスコア（ロジット）を、0〜1の値で合計が1になるよう変換する関数である。変換後の値は各クラスに属する確率として解釈できる。',
    reversePrompt: '各クラスのスコアを指数関数で変換し、全体の合計で割ることで、合計が1になる確率のような値に変換する関数は？',
    example: '3クラス分類でロジットが3クラスとも等しい値なら、出力は各クラス約0.33で合計1になる。',
    lessonId: 'les-g04', questionIds: ['q-g04-24'], sources: [JDLA, SKLEARN], difficulty: 1,
  }),

  // ===== g-05 ディープラーニングの要素技術（追加第3弾） =====
  c({
    id: 'card-g05-57', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-8', term: 'データ拡張', aliases: ['data augmentation'],
    definition: '回転・反転・切り抜きなどの変換を既存のデータに加え、実データを増やさずに学習の多様性を高める方法である。汎化を助けるが、変換によってラベルの意味が変わってしまう場合は避ける必要がある。',
    reversePrompt: '既存の画像に回転や反転などの変換を加えて学習データのバリエーションを増やし、汎化を助ける方法は？',
    lessonId: 'les-g05', questionIds: ['q-g05-8', 'q-g05-126'], sources: [JDLA, ATTN], difficulty: 1,
  }),
  c({
    id: 'card-g05-58', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-131', term: 'CLIP',
    definition: '画像とテキストをそれぞれ別のエンコーダで同じ埋め込み空間に写し、対応するペアを近づけ、対応しないペアを遠ざける対照学習で訓練したモデルである。学習後は、ラベル文との近さを比べることで、訓練時に明示されていない分類（ゼロショット分類）も可能になる。',
    reversePrompt: '画像と文章を共通の埋め込み空間に写し、対応する組を近づける学習で結びつけたモデルで、未知のラベル文との近さ比べによる分類も可能にするものは？',
    lessonId: 'les-g05b', questionIds: ['q-g05-131'], sources: [JDLA, ATTN], difficulty: 3,
  }),
  c({
    id: 'card-g05-59', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-123', term: '再パラメータ化トリック',
    definition: 'VAEの学習で使われる工夫で、標本化という微分できない操作を、分布のパラメータに対する微分可能な計算に書き換えるものである。これにより誤差逆伝播でエンコーダを学習できるようになる。',
    reversePrompt: '確率分布からの標本化という、そのままでは勾配が流れない操作を、パラメータに対する微分可能な計算に書き換えて逆伝播を可能にする工夫は？',
    lessonId: 'les-g05b', questionIds: ['q-g05-123'], sources: [JDLA, ATTN], difficulty: 3,
  }),
  c({
    id: 'card-g05-60', mode: 'g', syllabusId: 'g-05', conceptId: 'q-g05-23', term: 'クロスアテンション',
    definition: 'Queryを一方の系列から、KeyとValueを別の系列から取るAttentionである。異なる系列間の対応関係を捉える仕組みで、機械翻訳のデコーダが訳文側から原文側を参照する場面や、画像とテキストをまたぐ処理で使われる。',
    reversePrompt: '一方の系列から問い合わせを取り、もう一方の系列から参照先の情報を取ることで、系列同士の対応を捉える注意の仕組みは？',
    confusion: 'セルフアテンションは、Query・Key・Valueをすべて同じ系列から取る点が異なる。',
    lessonId: 'les-g05', questionIds: ['q-g05-23'], sources: [JDLA, ATTN], difficulty: 3,
  }),

  // ===== g-06 ディープラーニングの応用例（追加第3弾） =====
  c({
    id: 'card-g06-57', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-14', term: '二段階検出器',
    definition: '物体検出の方式の一つで、まず物体がありそうな候補領域を絞り込み、次に各候補を分類し位置を調整する方式である。手続きが分かれているぶん精度を出しやすい一方、処理は重くなる。代表例にFaster R-CNN系がある。',
    reversePrompt: '物体検出で、まず物体がありそうな候補領域を提案し、次に各候補の分類と位置の修正を行う、精度寄りの方式は？',
    confusion: '候補生成を省き、分類と位置の回帰を一度の処理で行う一段階検出器は、高速でリアルタイム用途に向く。',
    lessonId: 'les-g06b', questionIds: ['q-g06-14'], sources: [JDLA, SKLEARN], difficulty: 2,
  }),
  c({
    id: 'card-g06-58', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-205', term: 'インスタンスセグメンテーション',
    definition: '画素単位でラベルを付けるタスクの一つで、同じクラスの物体でも個体ごとに領域を区別する方式である。前景の個体分けと背景のクラス分けを同時に行うパノプティックセグメンテーションへつながる考え方である。',
    reversePrompt: '画素ごとに領域を分けるタスクのうち、同じ種類の物体でも個体ごとに領域を区別する方式は？',
    confusion: 'セマンティックセグメンテーションは画素ごとにクラスを付けるが、同じクラスの個体は区別しない。',
    example: '人の群衆では、全員を「人」の領域としてまとめるのではなく、一人ひとりを別の領域として切り分ける。',
    lessonId: 'les-g06b', questionIds: ['q-g06-205'], sources: [JDLA, SKLEARN], difficulty: 2,
  }),
  c({
    id: 'card-g06-59', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-201', term: 'IoU', aliases: ['Intersection over Union'],
    definition: '予測した矩形と正解の矩形の重なり度合いを表す指標で、共通部分の面積を合体部分の面積で割って計算する。物体検出で正検出かどうかを判定する基準に使われ、閾値などの評価条件が違えば精度の数値は比較できない。',
    reversePrompt: '予測した矩形と正解の矩形について、重なった部分の面積を両者を合わせた部分の面積で割った値で、検出の正しさの判定に使うものは？',
    example: '面積100の矩形と面積60の矩形が40だけ重なれば、値は 40÷(100+60−40)=約0.33 になる。',
    lessonId: 'les-g06b', questionIds: ['q-g06-201'], sources: [JDLA, SKLEARN], difficulty: 2,
  }),
  c({
    id: 'card-g06-60', mode: 'g', syllabusId: 'g-06', conceptId: 'q-g06-220', term: 'プルーニング（枝刈り）',
    definition: 'モデルの軽量化手法の一つで、重要度の低い重みやニューロンを取り除き、パラメータ数と計算量を削減する。除去後は精度が下がることがあるため、再学習で回復を図るのが一般的である。',
    reversePrompt: '重要度の低い重みやニューロンを取り除いて、モデルを小さく・軽くする軽量化の手法は？',
    confusion: '数値のビット数を落とす量子化、教師モデルの出力を生徒モデルに学ばせる知識蒸留とは別の手法である。',
    lessonId: 'les-g06', questionIds: ['q-g06-220'], sources: [JDLA, SKLEARN], difficulty: 1,
  }),

  // ===== g-07 AIの社会実装に向けて（追加第3弾） =====
  c({
    id: 'card-g07-57', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-101', term: 'MLOps',
    definition: '学習・デプロイ・監視・再学習といった機械学習のライフサイクルを、自動化と再現性を備えた仕組みで継続的に回す考え方である。通常のソフトウェア運用（DevOps）の考え方に、データやモデルのバージョン管理、再学習の自動化といった機械学習特有の要素を組み合わせたもの。',
    reversePrompt: 'モデルの学習から本番への組み込み、監視、再学習までを、自動化と再現性のある仕組みで継続的に回す運用の考え方は？',
    lessonId: 'les-g07', questionIds: ['q-g07-101'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-g07-58', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-104', term: 'コンセプトドリフト（概念ドリフト）',
    definition: '入力と正解の関係（予測すべき対応関係）そのものが時間とともに変化し、過去の関係で学習したモデルの前提が崩れる現象である。例えば消費者の嗜好が変われば、同じ入力でも望ましい予測が変わる。入力の見た目が変わらなくても精度が劣化し得る点が厄介である。',
    reversePrompt: '入力の見た目は変わらなくても、入力と望ましい予測の対応関係自体が変わってしまい、モデルの前提が崩れる現象は？',
    confusion: 'データドリフトは入力データの統計的な分布そのものの変化を指す。こちらは入力と出力の関係の変化である。',
    lessonId: 'les-g07', questionIds: ['q-g07-104'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-g07-59', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-106', term: 'データセントリックAI', aliases: ['データ中心AI'],
    definition: 'モデルやアルゴリズムを大きく変えるのではなく、学習データの品質を体系的に改善し続けることで性能を高める進め方である。ラベルの誤りの修正や、不足しているパターンのデータ追加など、地道なデータ改善が性能を左右するという考え方に立つ。',
    reversePrompt: 'モデルの構造探しではなく、ラベルの誤り修正や不足パターンの追加など、学習データの品質改善に注力して性能を高める進め方は？',
    lessonId: 'les-g07', questionIds: ['q-g07-106'], sources: [JDLA, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-g07-60', mode: 'g', syllabusId: 'g-07', conceptId: 'q-g07-125', term: 'モデルカード',
    definition: 'モデルの用途、学習データ、評価結果、想定する利用条件や限界をまとめた文書である。どのようなデータで評価され、どのような条件では性能が下がるかが書かれることで、用途に合わない使い方を防ぐ。',
    reversePrompt: 'モデルの用途や学習データ、評価結果、性能が下がる条件といった限界を利用者に伝えるためにまとめる文書は？',
    lessonId: 'les-g07', questionIds: ['q-g07-125'], sources: [JDLA, GL_PAGE], difficulty: 1,
  }),

  // ===== g-08 AIに必要な数理・統計知識（追加第3弾） =====
  c({
    id: 'card-g08-57', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-106', term: '二項分布',
    definition: '成功確率pの試行をn回繰り返したときの成功回数が従う確率分布である。期待値はnp、分散はnp(1−p)で表され、試行回数が大きいとき正規分布で近似できる。',
    reversePrompt: '表裏のような2通りの結果しかない試行を繰り返したとき、成功した回数が従う確率分布は？',
    example: '表裏が等確率のコインを5回投げて表がちょうど3回出る確率は、組み合わせの数 C(5,3)=10 を全体の32通りで割り、10÷32=0.3125 である。',
    lessonId: 'les-g08b', questionIds: ['q-g08-106', 'q-g08-29'], sources: [JDLA, NIST_HB], difficulty: 1,
  }),
  c({
    id: 'card-g08-58', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-108', term: 'ポアソン分布',
    definition: '一定時間あたり平均λ回起きる、まれな事象の回数が従う確率分布である。二項分布の極限として現れる。',
    reversePrompt: '一定の時間や区間の中で、まれに起きる事象が何回起きるかの分布で、平均回数だけで形が決まるものは？',
    lessonId: 'les-g08b', questionIds: ['q-g08-108'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-59', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-22', term: '自己情報量',
    definition: '確率pで起きる事象が持つ情報の量で、−log2(p) ビットと定義される。珍しい事象ほど大きく、確率1の事象では0になる。エントロピーはこの量の期待値である。',
    reversePrompt: 'ある事象が起きたときに得られる情報の量を、その事象の確率の対数（符号を反転したもの）で表した量は？確率1/8の事象なら3ビットになる。',
    lessonId: 'les-g08b', questionIds: ['q-g08-22'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),
  c({
    id: 'card-g08-60', mode: 'g', syllabusId: 'g-08', conceptId: 'q-g08-101', term: '感度と特異度',
    definition: '検査の性能を表す指標の組である。感度は疾患がある人を陽性と判定する割合、特異度は疾患がない人を陰性と判定する割合を指す。なお、陽性と判定された人のうち本当に疾患がある割合は、有病率（事前確率）にも大きく左右される。',
    reversePrompt: '検査について、本当に病気の人を陽性と捉える割合と、病気でない人を陰性と正しく退ける割合の組を何と呼ぶか？',
    example: '有病率1%・感度90%・特異度95%の検査では、陽性者のうち本当に疾患がある割合は約15.4%にとどまる。',
    lessonId: 'les-g08b', questionIds: ['q-g08-101'], sources: [JDLA, NIST_HB], difficulty: 2,
  }),

  // ===== g-09 AIに関する法律と契約（追加第3弾） =====
  c({
    id: 'card-g09-57', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-24', term: '請負契約と準委任契約',
    definition: '開発委託の契約類型の対比である。請負は仕事の完成を目的とし完成義務があるのに対し、準委任は事務の処理そのものを目的とし、善良な管理者の注意義務を負うが完成を約束するものではない。成果の確実な完成を約束しにくいAI開発では、準委任が選ばれることも多い。',
    reversePrompt: '仕事の完成を目的として完成義務を負う類型と、事務処理の実施自体を目的として完成は約束しない類型の、契約の対比は？',
    lessonId: 'les-g09b', questionIds: ['q-g09-24'], sources: [JDLA, BUNKA, PPC_GENAI], difficulty: 2,
  }),
  c({
    id: 'card-g09-58', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-10', term: '優越的地位の濫用',
    definition: '独占禁止法の論点の一つで、取引上の地位が相手より優越している事業者が、取引先に不当な条件を課す行為を指す。AIの文脈では、データを持つ側やプラットフォーム事業者の行為が問題となり得る。なお独占禁止法は、手段がAIであっても適用される。',
    reversePrompt: '取引上の立場の強さを利用して、取引先に不当な条件を押し付ける行為を指し、競争法で問題になるものは？',
    lessonId: 'les-g09', questionIds: ['q-g09-10'], sources: [JDLA, BUNKA], difficulty: 3,
  }),
  c({
    id: 'card-g09-59', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-20', term: '個人データ漏えい時の報告と本人通知',
    definition: '2022年4月施行の改正個人情報保護法で義務化された対応である。漏えい等が発生し個人の権利利益を害するおそれがある一定の場合、事業者は個人情報保護委員会への報告と、本人への通知を行わなければならない。対象には、要配慮個人情報の漏えいや不正アクセスによる漏えいなどが含まれる。',
    reversePrompt: '個人データの漏えいが起きて権利利益を害するおそれがある場合に、事業者に監督当局への報告と本人への通知が義務付けられる制度は？',
    lessonId: 'les-g09b', questionIds: ['q-g09-20', 'q-g09-131'], sources: [JDLA, PPC], difficulty: 2,
  }),
  c({
    id: 'card-g09-60', mode: 'g', syllabusId: 'g-09', conceptId: 'q-g09-22', term: '個人関連情報',
    definition: '生存する個人に関する情報のうち、個人情報・仮名加工情報・匿名加工情報のいずれにも該当しない情報である。閲覧履歴やCookie等の識別子が典型で、提供先で個人データとして取得されることが想定される場合は、本人の同意が得られていること等の確認が提供元に求められる。',
    reversePrompt: '閲覧履歴やCookieのように、それ自体では個人を識別できないが、提供先で他の情報と結びついて個人データになり得るため、提供時に同意確認が求められる情報の区分は？',
    lessonId: 'les-g09b', questionIds: ['q-g09-22'], sources: [JDLA, PPC], difficulty: 3,
  }),

  // ===== g-10 AI倫理・AIガバナンス（追加第3弾） =====
  c({
    id: 'card-g10-57', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-101', term: '人口統計的パリティ', aliases: ['統計的パリティ'],
    definition: '公平性の指標の一つで、属性グループ間で、採用や承認のような有利な予測結果を得る人の割合が等しくなっていることを求める考え方である。結果の割合の平等を見る指標であり、精度や誤判定率の平等を見る指標とは別の立場である。',
    reversePrompt: '属性グループの間で、有利な判定を受ける人の割合がそろうことを求める公平性の考え方は？',
    lessonId: 'les-g10b', questionIds: ['q-g10-101'], sources: [JDLA, OECD_AI, GL_PAGE], difficulty: 2,
  }),
  c({
    id: 'card-g10-58', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-102', term: '等化オッズ',
    definition: '公平性の指標の一つで、グループ間で真陽性率と偽陽性率の両方をそろえることを求める考え方である。グループ間で基礎比率が異なる場合、複数の公平性指標をすべて同時に満たすことは一般に難しく、どの公平性を優先するかは社会的・制度的な判断を要する。',
    reversePrompt: 'グループ間で、実際に陽性の人を正しく拾う割合と、陰性の人を誤って陽性にする割合の両方をそろえることを求める公平性の考え方は？',
    lessonId: 'les-g10b', questionIds: ['q-g10-102'], sources: [JDLA, OECD_AI, GL_PAGE], difficulty: 3,
  }),
  c({
    id: 'card-g10-59', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-9', term: 'ディープフェイク',
    definition: 'AIで生成・加工した、実在の人物が言ってもいない発言や行動をしているかのような映像・音声などの偽コンテンツである。世論操作や選挙への介入に使われ得るだけでなく、本物の記録まで「偽物ではないか」と疑わせ、情報環境全体への信頼を損なう点も指摘される。',
    reversePrompt: '実在の人物が実際にはしていない発言や行動をしているように見せる、AI生成の偽の映像や音声を指す言葉は？',
    lessonId: 'les-g10', questionIds: ['q-g10-9'], sources: [JDLA, CAO_AI], difficulty: 1,
  }),
  c({
    id: 'card-g10-60', mode: 'g', syllabusId: 'g-10', conceptId: 'q-g10-106', term: 'フィルターバブル',
    definition: 'パーソナライズされた情報に囲まれることで、自分の考えに合う情報ばかりに触れ、異なる意見に接しにくくなる状態である。推薦アルゴリズムによる情報環境の偏りの問題として論じられ、世論操作と並んで民主主義への影響が論点になる。',
    reversePrompt: 'おすすめ表示の仕組みによって自分の考えに合う情報ばかりに囲まれ、異なる意見に触れにくくなる状態を指す言葉は？',
    lessonId: 'les-g10', questionIds: ['q-g10-106'], sources: [JDLA, OECD_AI], difficulty: 2,
  }),
];
