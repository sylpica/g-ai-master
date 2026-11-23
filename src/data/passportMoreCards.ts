import type { Flashcard } from '../types';

// 生成AIパスポート（2027年2月試験より適用シラバス）の単語帳カード拡充分（57番台）。
// 基本編（src/data/passportCards.ts）・深掘り編（src/data/passportExtraCards.ts）と用語が重複しないよう、
// 教材・問題に登場しながら未収録だった専門用語を選定した。p-05は未収録の専門用語が少ないため5枚とし、
// 不足分は未収録用語の多いp-02へ回して全体30枚とした。
// sources は紐づけた教材（passportLessons.ts / passportExtraLessons.ts）の sources から正確にコピーした。
// conceptId は関連する問題の conceptId（=問題ID）に合わせ、verifiedAt は全件 2026-11-23。
// 逆向き（意味→用語）では reversePrompt を表面にする（用語名は表示時に自動マスクされる）。

const GUGA_OUTLINE = { title: 'GUGA（生成AI活用普及協会）「生成AIパスポート」試験概要', url: 'https://guga.or.jp/outline/' };
const GUGA_SYLLABUS = { title: 'GUGA「生成AIパスポート試験シラバス」（2027年2月試験より適用）', url: 'https://guga.or.jp/assets/syllabus.pdf' };
const BUNKA_AI = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const PPC = { title: '個人情報保護委員会', url: 'https://www.ppc.go.jp/' };

const V_AT = '2026-11-23';
type C = Omit<Flashcard, 'verifiedAt'>;
const c = (x: C): Flashcard => ({ ...x, verifiedAt: V_AT });

export const PASSPORT_MORE_CARDS: Flashcard[] = [
  // ===== p-01 AIの基礎と歴史 =====
  c({
    id: 'card-p01-57', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-2', term: 'ルールベース',
    definition: '人間が条件と処理のルールをあらかじめ書き、入力に応じて決められた処理を行う方式。判断基準が明確で説明しやすい一方、想定していない入力や例外に弱く、ルールの追加・保守に手間がかかる。',
    reversePrompt: '人間が条件と処理をあらかじめ書き、入力に応じて決められた処理を行う方式で、判断理由を説明しやすい一方、想定外の入力や例外に弱いものは？',
    example: '料金規則が条文として明確に定められ、判定理由をそのまま示す必要がある業務の判定処理。',
    confusion: 'データから規則性を自動で獲得する機械学習とは仕組みが異なる。AIは機械学習だけではなく、この方式のシステムも含まれる。',
    lessonId: 'les-p01', questionIds: ['q-p01-2', 'q-p01-106'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p01-58', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-6', term: '半教師あり学習',
    definition: '少量のラベル付きデータと大量のラベルなしデータを併用して学ぶ機械学習の手法。ラベル付けにはコストがかかり大量に用意しにくいため、その負担を抑えながら学習するために用いられる。',
    reversePrompt: 'ラベル付けのコストを抑えるため、少量の正解付きデータと大量の正解なしデータを組み合わせて学ぶ手法は？',
    confusion: '正解の組だけで学ぶ教師あり学習と、正解なしで構造を見つける教師なし学習の中間に位置する。',
    lessonId: 'les-p01', questionIds: ['q-p01-6', 'q-p01-104'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p01-59', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-10', term: '損失関数',
    definition: 'モデルの予測と正解のずれを数値化する関数。学習ではこの値をもとに、誤差逆伝播法で勾配を求め、勾配降下法で重みを少しずつ調整する。',
    reversePrompt: 'モデルの予測と正解のずれを数値化し、学習で小さくしていく対象となる関数は？',
    confusion: '活性化関数は各ユニットの重み付き和に非線形変換を行うもので、予測と正解のずれを測る役割とは異なる。',
    lessonId: 'les-p01', questionIds: ['q-p01-10'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p01-60', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-17', term: 'LSTM', aliases: ['Long Short-Term Memory'],
    definition: '入力・忘却・出力のゲートで保持する情報を制御し、RNNの勾配消失問題を緩和した系列処理のネットワーク。離れた情報同士の関係を学びやすくした。',
    reversePrompt: '系列を順に処理する再帰型の構造にゲート機構を加え、離れた情報の関係を保持しやすくしたネットワークは？',
    confusion: '基本形のRNNは勾配消失・勾配爆発で長期の依存関係を学びにくい。現在の大規模言語モデルの主流はTransformerである。',
    lessonId: 'les-p01b', questionIds: ['q-p01-17', 'q-p01-113'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p01-61', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-7', term: 'ノーフリーランチ定理',
    definition: 'すべての問題に万能なアルゴリズムは存在しないという考え方。問題の性質に合わせて手法を選ぶ必要があることを示す。',
    reversePrompt: 'あらゆる問題に万能なアルゴリズムは存在せず、課題の性質に応じて手法を選ぶ必要があることを示す考え方は？',
    example: '画像分類では手法A、文章分類では手法Bの精度が高かった、という結果はこの考え方に沿う。',
    lessonId: 'les-p01', questionIds: ['q-p01-7', 'q-p01-105'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p01-62', mode: 'passport', syllabusId: 'p-01', conceptId: 'q-p01-108', term: 'ドロップアウト',
    definition: '学習時に一部のユニットを確率的に無効化する過学習対策。毎回異なるユニットの組合せで学習するため、特定のユニット同士の結び付きに頼りすぎることを抑える。',
    reversePrompt: '学習のたびに一部のユニットを確率的に無効化し、特定の組合せへの依存を弱める過学習対策は？',
    confusion: 'ユニットを完全に削除するのではなく、学習時に一時的に無効化する処理。正則化やアーリーストッピングと並ぶ過学習対策の一つ。',
    lessonId: 'les-p01', questionIds: ['q-p01-108', 'q-p01-14'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  // ===== p-02 生成AI =====
  c({
    id: 'card-p02-57', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-2', term: 'Self-Attention', aliases: ['自己注意機構'],
    definition: '各トークンが系列内の他のすべてのトークンとの関連度を計算し、文脈に応じた表現を作る仕組み。Query（探す側）、Key（探される側）、Value（取り出す中身）の3つのベクトルを使い、どの情報をどれだけ参照するかを学習で決める。',
    reversePrompt: '各トークンが系列内の他のすべてのトークンとの関連度を計算し、文脈に応じた表現を作る、Transformerの中核の仕組みは？',
    confusion: '系列を順に処理するRNNとは異なり、系列全体の関係を一度に計算する。ただし順序の情報自体は持たないため、位置の情報は別途与える必要がある。',
    lessonId: 'les-p02a', questionIds: ['q-p02-2'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-58', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-4', term: '潜在拡散モデル', aliases: ['Latent Diffusion Model'],
    definition: '低次元の潜在空間で拡散過程と逆拡散過程の処理を行う拡散モデル。画像生成などを中心に広く使われている。',
    reversePrompt: '低次元の潜在空間でノイズの付加と除去の処理を行い、画像生成などを中心に使われるモデルは？',
    confusion: '元のデータの空間でそのまま処理するのではなく、圧縮した潜在表現の上で処理する点が、通常の拡散モデルとの違い。',
    lessonId: 'les-p02a', questionIds: ['q-p02-4', 'q-p02-115'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-59', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-6', term: '事前学習',
    definition: 'LLMの学習の第1段階。大量のテキストで「次のトークンを予測する」学習を行い、言語のパターンを獲得する。',
    reversePrompt: '大量のテキストで「次のトークンを予測する」学習を行い、言語のパターンを獲得する、LLMの学習の第1段階は？',
    confusion: 'この後に、指示への従い方を調整する段階と、人間の評価で調整する段階が続く。特定用途への適応そのものではない。',
    lessonId: 'les-p02a', questionIds: ['q-p02-6', 'q-p02-107'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p02-60', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-108', term: '指示チューニング',
    definition: '指示と望ましい応答のペアでモデルを学習させ、指示に従う形に調整する教師ありファインチューニング。LLMの学習の第2段階にあたる。',
    reversePrompt: '指示文と、それに対する望ましい回答文の組を多数学習させ、指示に従う形へモデルを調整する学習は？',
    confusion: '利用時に例を示すFew-Shotとは異なり、モデル自体のパラメータを更新する学習の段階を指す。',
    lessonId: 'les-p02a', questionIds: ['q-p02-108'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-61', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-109', term: '報酬モデル',
    definition: 'RLHFで、人間の評価データから「望ましい応答」を推定するために作られるモデル。その評価を手がかりに強化学習を行い、応答の望ましさを調整する。',
    reversePrompt: '人間の評価データを基に「望ましい応答」を推定し、強化学習の手がかりにするために作られるモデルは？',
    confusion: '応答の望ましさを調整する仕組みであり、出力の事実の正確さそのものを保証する仕組みではない。',
    lessonId: 'les-p02a', questionIds: ['q-p02-109'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p02-62', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-18', term: 'オンプレミス',
    definition: '提供事業者のクラウド基盤ではなく、自組織の管理下にある環境でシステムを動かす利用形態。データを自組織の管理下に置きたい場合に検討されるが、運用には計算資源と体制が必要になる。',
    reversePrompt: '提供事業者の基盤ではなく、自組織の管理下にある環境でシステムを動かす利用形態は？',
    confusion: 'モデルの重みが公開されライセンスのもとで利用できるオープンソース（オープンウェイト）とは別の観点で、こちらは動かす場所と管理の所在を指す。',
    lessonId: 'les-p02b', questionIds: ['q-p02-18', 'q-p02-116'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p02-63', mode: 'passport', syllabusId: 'p-02', conceptId: 'q-p02-119', term: 'C2PA',
    definition: '生成コンテンツの真正性を示すため、作成や編集の来歴情報を記録する規格の取り組み。電子透かしと並ぶ、来歴をたどるための技術である。',
    reversePrompt: '生成コンテンツの真正性を示すため、作成や編集の来歴情報を記録する規格は？',
    confusion: '来歴情報が含まれていないことだけから、そのコンテンツがAI生成かどうかを判断することはできない。',
    lessonId: 'les-p02b', questionIds: ['q-p02-119'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 3,
  }),
  // ===== p-03 AIエージェント =====
  c({
    id: 'card-p03-57', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-2', term: 'ワークフロー型エージェント',
    definition: 'あらかじめ決められた手順に沿って処理を進めるエージェントの形態。定型的な処理に向き、状況に応じて自ら判断しながら進める自律型エージェントと対比される。',
    reversePrompt: 'あらかじめ決められた手順に沿って処理を進める形態のエージェントで、定型業務の処理に向くものは？',
    example: '受信した請求書を「文字起こし→金額確認→台帳登録→担当者通知」という固定した順序で毎回処理する仕組み。',
    confusion: '目標を与えると計画や手順の判断もAIが行うのは自律型。手順が固定されている点が違いである。',
    lessonId: 'les-p03', questionIds: ['q-p03-2', 'q-p03-102'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p03-58', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-107', term: 'ハイブリッド検索',
    definition: '埋め込みによる意味的検索と、語句の一致を見るキーワード検索を組み合わせる検索方式。製品名や型番のような固有の語句でも見つけやすくする、RAGの発展形の一つ。',
    reversePrompt: '意味の近さで探す方法と、語句の一致で探す方法を組み合わせ、型番のような固有名詞でも見つけやすくする検索方式は？',
    confusion: '意味的検索は言い換えに強い一方、固有の語句ではキーワード検索の方が正確なことがある。両者の弱点を補い合う組み合わせである。',
    lessonId: 'les-p03b', questionIds: ['q-p03-107'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p03-59', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-110', term: 'Agentic RAG',
    definition: 'エージェントが質問に応じて検索のしかた自体を判断するRAGの発展形。質問を書き換えて検索し直す、複数のデータソースを使い分ける、根拠が不足すれば追加で調べる、といった判断を繰り返す。',
    reversePrompt: 'エージェントが検索のしかた自体を判断し、質問の書き換えや追加の調査を繰り返しながら回答する、検索拡張生成の発展形は？',
    confusion: '知識グラフの関係をたどって情報を集めるGraph RAGとは別の発展形。柔軟な反面、処理の回数やコストが読みにくく、誤った判断が連鎖するリスクも増える。',
    lessonId: 'les-p03b', questionIds: ['q-p03-110', 'q-p03-7'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p03-60', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-18', term: '最小権限の原則',
    definition: 'AIやエージェントに与える権限は、タスクに必要な範囲だけに絞るという原則。必要以上の権限を与えると、誤動作や攻撃の際の被害範囲が広がるためである。',
    reversePrompt: 'AIやエージェントに与える権限は、タスクに必要な範囲だけに絞るべきだという原則は？',
    confusion: '「便利だから広く権限を与える」設計とは逆の考え方。読み取りと書き込み・削除を区別することも含まれる。',
    lessonId: 'les-p03', questionIds: ['q-p03-18', 'q-p03-121'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p03-61', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-12', term: 'フィードバックループ',
    definition: 'エージェントが実行結果を観察し、計画を見直しながら次の行動を決めていく循環の仕組み。複数ステップの仕事を進めるための基本構造になる。',
    reversePrompt: '実行結果を観察して計画を見直し、次の行動を決めていく循環の仕組みで、複数ステップの仕事を進める基本構造となるものは？',
    example: 'ファイルを開くツールが「ファイルが見つからない」と返したら、別の場所を探すなど計画を修正して続行する。',
    lessonId: 'les-p03', questionIds: ['q-p03-12', 'q-p03-115'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p03-62', mode: 'passport', syllabusId: 'p-03', conceptId: 'q-p03-119', term: 'マルチエージェント',
    definition: '複数のエージェントが役割を分担し、連携して一つの仕事を進める構成。エージェント同士のタスクの依頼や結果の受け渡しには、A2Aのような連携の規格が使われる。',
    reversePrompt: '複数のエージェントが調査・執筆・校閲のように役割を分担し、連携して仕事を進める構成は？',
    confusion: '単一のエージェントがツールを使う構成とは異なり、エージェント同士の分担と引き継ぎの設計が必要になる。',
    lessonId: 'les-p03', questionIds: ['q-p03-119'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  // ===== p-04 生成AIのリスク予防・AI倫理・ガバナンス =====
  c({
    id: 'card-p04-57', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-9', term: '個人情報',
    definition: '個人情報保護法で定義される法律上の概念で、生存する個人に関する情報のうち、氏名や個人識別符号などによって特定の個人を識別できるものを指す。個人データの利用は利用目的の範囲内で行い、原則として本人の同意なく第三者に提供することはできない。',
    reversePrompt: '生存する個人に関する情報で、氏名などによって特定の個人を識別できるものを指す、法律上の概念は？',
    confusion: '私生活上の事柄をみだりに公開されない権利であるプライバシーや、守秘の対象となる情報全般を指す秘密保持とは、重なる部分はあるが同じ概念ではない。',
    lessonId: 'les-p04a', questionIds: ['q-p04-9', 'q-p04-11'], sources: [PPC, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p04-58', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-17', term: '著作権法第30条の4',
    definition: '情報解析のための利用を定めた著作権法の規定。著作物の表現を享受する目的ではなく情報解析のために行う複製などは、権利者の利益を不当に害しない限り許容される場合がある。',
    reversePrompt: '情報解析のための利用を定め、表現を享受する目的でなければ、権利者の利益を不当に害しない限り複製などが許容される場合があるとする著作権法の規定は？',
    confusion: '特定の著作物の表現を再現させる目的の利用は、この対象にはならない。「学習への利用は常に自由」という理解は誤り。',
    lessonId: 'les-p04b', questionIds: ['q-p04-17', 'q-p04-125'], sources: [BUNKA_AI, GUGA_SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p04-59', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-16', term: '類似性',
    definition: '著作権侵害の判断要素の一つで、既存の著作物と生成物の表現が似ているかどうかを指す。依拠性とともに、侵害の成否を左右する。',
    reversePrompt: '著作権侵害の判断で、既存の著作物と生成物の表現が似ているかどうかを見る要素で、依拠性と対になるものは？',
    confusion: '表現が似ているだけでは不十分で、依拠が否定されれば侵害にならない場合がある。',
    lessonId: 'les-p04b', questionIds: ['q-p04-16'], sources: [BUNKA_AI, GUGA_SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p04-60', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-112', term: '著作物性',
    definition: '著作物として著作権の保護を受ける性質のこと。AI生成物については、指示の具体性や選択・修正の過程など、人間の創作的寄与の程度によって生じるかどうかが判断される。',
    reversePrompt: 'AI生成物に著作権が生じるかどうかを左右する性質で、指示の具体性や選択・修正など人間の創作的寄与の程度で判断されるものは？',
    confusion: '創作的寄与が乏しい生成物には著作権が生じない場合がある。「AIが作ったものには常に権利が生じる」わけではない。',
    lessonId: 'les-p04b', questionIds: ['q-p04-112'], sources: [BUNKA_AI, GUGA_SYLLABUS], difficulty: 3,
  }),
  c({
    id: 'card-p04-61', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-19', term: '肖像権',
    definition: '人の姿や氏名が、本人の承諾なく撮影・公表・利用されないことに関わる権利。生成画像が実在の人物に似ている場合などに問題になる。',
    reversePrompt: '人の姿や氏名が、本人の承諾なく撮影・公表・利用されないことに関わる権利は？',
    confusion: '著名人の氏名や肖像が持つ顧客吸引力という財産的な価値に着目するパブリシティ権とは、性格が異なる。',
    lessonId: 'les-p04b', questionIds: ['q-p04-19'], sources: [BUNKA_AI, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p04-62', mode: 'passport', syllabusId: 'p-04', conceptId: 'q-p04-120', term: 'ディープフェイク',
    definition: '実在の人物の姿や声を本物らしく再現した、偽の画像・音声・動画。なりすましや詐欺に悪用されるリスクがあり、本人の同意のない作成・利用は避けるべきものとされる。',
    reversePrompt: '実在の人物の姿や声を本物らしく再現した偽の画像・音声・動画で、なりすましや詐欺に悪用されるものは？',
    confusion: '実在の人物を再現する技術そのものではなく、同意なく作られた偽物やその悪用を指す。経営者を装った音声クローンによる送金指示のような悪用が知られる。',
    lessonId: 'les-p04a', questionIds: ['q-p04-120'], sources: [GUGA_SYLLABUS], difficulty: 1,
  }),
  // ===== p-05 生成AIの実践と活用事例 =====
  c({
    id: 'card-p05-57', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-102', term: '文脈内学習', aliases: ['In-Context Learning'],
    definition: 'モデルの重みを変えずに、与えた例や文脈からその場でタスクのパターンを読み取らせる働き。Zero-ShotやFew-Shotのプロンプティングの背景にある仕組み。',
    reversePrompt: 'モデルの重みを変えずに、与えた例や文脈からその場でタスクのパターンを読み取らせる働きは？',
    confusion: 'モデルのパラメータを更新するファインチューニングとは異なる。例を示さないZero-Shotでも、この働きによって指示だけからタスクを実行できている。',
    lessonId: 'les-p05', questionIds: ['q-p05-102'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p05-58', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-113', term: '複合タスク',
    definition: '複数のツール・複数ステップを横断して進める仕事。自動化ではタスク分解を出発点に、ステップごとに使うツール、入力と出力、失敗したときの扱いを先に決める。',
    reversePrompt: '複数のツールと工程を横断して進める仕事で、分解してステップごとに権限や確認の置き場を設計することが自動化の出発点になるものは？',
    example: '「市場調査をして、集計し、提案資料まで作る」という一連の仕事をAIエージェントに任せる場面。',
    confusion: '一度きりの作業をAIに手伝わせる活用とは異なり、前段の誤りが後段に伝播する連鎖的なエラーを止める設計まで含めて考える。',
    lessonId: 'les-p05b', questionIds: ['q-p05-113'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
  c({
    id: 'card-p05-59', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-111', term: '情報抽出',
    definition: '大量の文書から、必要な項目だけを取り出して一覧化などに使える形にする処理。抽出の誤りや漏れがないかの確認とセットで行う。',
    reversePrompt: '大量の文書から必要な項目だけを取り出し、一覧表など使える形にまとめる処理は？',
    example: '大量の契約書ファイルから、契約の更新期限だけを取り出して一覧表を作る。',
    lessonId: 'les-p05', questionIds: ['q-p05-111'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p05-60', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-13', term: '可視化',
    definition: 'データの集計結果を、表やグラフなどで目に見える形に表すこと。元データと集計条件が正しくなければ、見た目が整っていても意味を持たない。',
    reversePrompt: '集計したデータをグラフなどで目に見える形に表すことで、元データと集計条件の正しさが前提になるものは？',
    confusion: 'データの集計そのものとは工程が異なる。集計や分類の結果は検算し、誤りや漏れを確認してから使う。',
    lessonId: 'les-p05', questionIds: ['q-p05-13'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 1,
  }),
  c({
    id: 'card-p05-61', mode: 'passport', syllabusId: 'p-05', conceptId: 'q-p05-117', term: 'DX', aliases: ['デジタルトランスフォーメーション'],
    definition: 'デジタル技術の活用によって、業務プロセスや事業そのものを変革する取り組み。AIの活用を前提に変革を進めるAXは、この文脈の発展形として語られる。',
    reversePrompt: 'デジタル技術の活用で業務プロセスや事業そのものを変革する取り組みで、AIを前提とする変革の土台となる文脈で語られるものは？',
    confusion: '単なるデジタルツールの導入ではなく、業務プロセス自体の見直しまでを含む。AI活用を前提とする点に焦点があるのはAXの方である。',
    lessonId: 'les-p05', questionIds: ['q-p05-117'], sources: [GUGA_OUTLINE, GUGA_SYLLABUS], difficulty: 2,
  }),
];
