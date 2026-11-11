import type { SourceRef } from '../types';

// 生成AIパスポート第4章・第5章（passportQuestions2.ts / passportExtraQuestions2.ts）で
// 出典が1件だけだった問題への追加出典（裏付け強化）。
// 追加先は各問題の論点を実際に支持する一次情報に限り、全て repo 内で既に使用実績のある
// 一次情報URLから選定した（新規URLは使用していない）。既存出典とのURL重複はない。
const CAO: SourceRef = { title: '内閣府「人間中心のAI社会原則」', url: 'https://www.cas.go.jp/jp/seisaku/jinkouchinou/pdf/aigensoku.pdf' };
const PPC_GENAI: SourceRef = { title: '個人情報保護委員会「生成AIサービスの利用に関する注意喚起等について」', url: 'https://www.ppc.go.jp/news/careful_information/230602_AI_utilize_alert/' };
const BUNKA: SourceRef = { title: '文化庁「AIと著作権に関する考え方について」', url: 'https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html' };
const GUIDE: SourceRef = { title: '総務省・経済産業省「AI事業者ガイドライン」掲載ページ', url: 'https://www.soumu.go.jp/main_sosiki/kenkyu/ai_network/02ryutsu20_04000019.html' };
const NIST_RMF: SourceRef = { title: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' };
const COPYRIGHT_ACT: SourceRef = { title: 'e-Gov法令検索「著作権法」', url: 'https://laws.e-gov.go.jp/law/345AC0000000048' };
const UCPA: SourceRef = { title: 'e-Gov法令検索「不正競争防止法」', url: 'https://laws.e-gov.go.jp/law/405AC0000000047' };
const OPENAI_PE: SourceRef = { title: 'OpenAI API ドキュメント：Prompt engineering', url: 'https://developers.openai.com/api/docs/guides/prompt-engineering' };
const OWASP_LLM: SourceRef = { title: 'OWASP Top 10 for LLM Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' };

export const SOURCES_EXTRA_P: Record<string, SourceRef[]> = {
  // ===== passportQuestions2.ts（第4章） =====
  'q-p04-2': [CAO],
  'q-p04-5': [PPC_GENAI],
  'q-p04-6': [GUIDE],
  'q-p04-7': [NIST_RMF],
  'q-p04-8': [GUIDE],
  'q-p04-14': [UCPA],
  'q-p04-16': [COPYRIGHT_ACT],
  'q-p04-17': [COPYRIGHT_ACT],
  'q-p04-18': [COPYRIGHT_ACT],
  'q-p04-23': [GUIDE],
  // ===== passportQuestions2.ts（第5章） =====
  'q-p05-2': [OPENAI_PE],
  'q-p05-3': [OPENAI_PE],
  'q-p05-4': [OPENAI_PE],
  'q-p05-5': [OPENAI_PE],
  'q-p05-6': [OPENAI_PE],
  'q-p05-8': [GUIDE],
  'q-p05-9': [OPENAI_PE],
  'q-p05-10': [GUIDE],
  'q-p05-13': [GUIDE],
  'q-p05-14': [GUIDE],
  'q-p05-15': [OWASP_LLM],
  'q-p05-16': [NIST_RMF],
  // ===== passportExtraQuestions2.ts（第4章） =====
  'q-p04-105': [GUIDE],
  'q-p04-106': [NIST_RMF],
  'q-p04-107': [GUIDE],
  'q-p04-108': [GUIDE],
  'q-p04-109': [NIST_RMF],
  'q-p04-112': [COPYRIGHT_ACT],
  'q-p04-113': [COPYRIGHT_ACT],
  'q-p04-116': [GUIDE],
  'q-p04-117': [NIST_RMF],
  'q-p04-118': [GUIDE],
  'q-p04-120': [CAO],
  // ===== passportExtraQuestions2.ts（第5章） =====
  'q-p05-102': [OPENAI_PE],
  'q-p05-103': [OPENAI_PE],
  'q-p05-104': [OPENAI_PE],
  'q-p05-105': [OPENAI_PE],
  'q-p05-107': [OPENAI_PE],
  'q-p05-110': [BUNKA],
  'q-p05-111': [GUIDE],
  'q-p05-112': [NIST_RMF],
  'q-p05-113': [NIST_RMF],
  'q-p05-114': [GUIDE],
  'q-p05-115': [GUIDE],
  'q-p05-116': [GUIDE],
};
