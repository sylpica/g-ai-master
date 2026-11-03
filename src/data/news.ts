import type { NewsItem } from '../types';

// AI教養「ニュース」タブのデータ。3日に1回程度、公式発表・公的機関などの一次情報を確認して追記する。
// 収集方針: 一次情報（各社の公式発表、官公庁、JDLA等）のみ。SNS・まとめ記事・未確認情報は載せない。
// 超重要（importance: 'major'）と判断したものは、内容を確認したうえで問題や教材にも取り込む。
const ITEMS: NewsItem[] = [
  {
    id: 'news-20261106-g6',
    date: '2026-11-02',
    title: 'G検定 G2026#6（オンライン）は11月6日・7日に実施（公式日程を確認）',
    summary: 'JDLAのG検定は2026年、オンライン試験が年6回・会場試験が年3回実施される。オンラインは100分・145問程度、会場は120分・145問程度という現行制度は本アプリの模試設定と同じ。受験を予定する場合は、申込期間と当日の動作確認を公式ページで早めに確認しておくとよい。',
    category: '試験情報',
    importance: 'normal',
    source: { title: 'JDLA G検定 公式ページ', url: 'https://www.jdla.org/certificate/general/' },
    addedAt: '2026-11-02',
  },
  {
    id: 'news-20261030-training-preferences',
    date: '2026-10-30',
    title: 'OpenAI、ウェブサイトがAI学習への意向を表明しやすくする取り組みを発表',
    summary: 'サイト運営者が、自サイトのコンテンツをAIの学習に使ってよいかどうかの意向を機械的に読み取れる形で表明しやすくする取り組みが公表された。学習データと著作権（日本では著作権法30条の4の情報解析の例外が論点になる）に関わる動きで、権利者の意向表示とAI開発の両立が引き続き制度面の論点になっている。',
    category: '制度・政策',
    importance: 'normal',
    source: { title: 'OpenAI: Making it easier for websites to express AI training preferences', url: 'https://openai.com/index/helping-websites-express-ai-training-preferences/' },
    addedAt: '2026-11-02',
  },
  {
    id: 'news-20261026-gpt61-terra',
    date: '2026-10-26',
    title: 'OpenAIが「GPT-6.1 Terra」を発表',
    summary: '資料作成や画面の読み取り、コンピュータ操作などの日常業務を速く・安く進める用途を狙ったモデルが追加された。上位モデルとの使い分け（難しい課題は上位、定型作業は高速・低コストなモデル）という、モデル比較の基本的な考え方を裏付ける動き。性能の受け止めは自タスクでの実測で判断するのが原則。',
    category: 'モデル',
    importance: 'normal',
    source: { title: 'OpenAI: Introducing GPT-6.1 Terra', url: 'https://openai.com/index/introducing-gpt-6-1-terra/' },
    addedAt: '2026-11-02',
  },
  {
    id: 'news-20261021-openai-google-cloud',
    date: '2026-10-21',
    title: 'OpenAIのモデルとCodexをGoogle CloudのModel Gardenで提供すると発表（当初は限定プレビュー）',
    summary: 'OpenAIのフロンティアモデルとエージェント型ワークフロー（Codex）を、Google CloudのModel Garden経由で提供する提携が発表された。発表時点では一部の企業顧客向けの限定プレビューで、一般提供は後日とされている。主要3社（OpenAI／Anthropic／Google）のモデルを同じクラウド基盤で選べるようになり、モデル選定では「性能」だけでなく、契約・運用主体・データの流れまで含めた比較が重要になっている。',
    category: 'サービス動向',
    importance: 'normal',
    source: { title: 'OpenAI: OpenAI models are coming to Google Cloud', url: 'https://openai.com/index/openai-models-google-cloud/' },
    addedAt: '2026-11-02',
  },
  {
    id: 'news-20260331-guideline-12',
    date: '2026-03-31',
    title: 'AI事業者ガイドライン第1.2版を公表（総務省・経済産業省）',
    summary: 'AIの開発・提供・利用にあたって必要な取組の基本的な考え方を示す国内の統一ガイドラインが第1.2版に改訂された。法的拘束力を持つ規制ではなく、事業者がリスクを認識して自主的に対策するための指針という位置づけは変わらない。AIガバナンス分野の学習では、版が更新され続ける「リビングドキュメント」である点も押さえておきたい。',
    category: '制度・政策',
    importance: 'major',
    source: { title: '総務省・経済産業省「AI事業者ガイドライン」掲載ページ', url: 'https://www.soumu.go.jp/main_sosiki/kenkyu/ai_network/02ryutsu20_04000019.html' },
    addedAt: '2026-11-02',
  },
  {
    id: 'news-20251223-ai-basic-plan',
    date: '2025-12-23',
    title: '「人工知能基本計画」が閣議決定（内閣府）',
    summary: '人工知能基本法に基づく基本計画が閣議決定された。「人間中心のAI社会原則」を堅持し、イノベーションの促進とリスク対応の両立を図ることが基本的な考え方とされている。日本のAI政策が、原則（2019年）→ガイドライン→法律・基本計画へと制度化されてきた流れを押さえるうえで重要な節目。',
    category: '制度・政策',
    importance: 'major',
    source: { title: '内閣府「人工知能基本計画」（令和7年12月23日 閣議決定）', url: 'https://www8.cao.go.jp/cstp/ai/ai_plan/aiplan_20251223.pdf' },
    addedAt: '2026-11-02',
    incorporated: 'AI教養「法律・倫理・社会」に、この基本計画の考え方を問う問題（q-l07-3）を追加した。',
  },
];

export const NEWS_ITEMS: NewsItem[] = [...ITEMS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
export const NEWS_LAST_ADDED = NEWS_ITEMS.reduce((m, n) => (n.addedAt > m ? n.addedAt : m), '');
