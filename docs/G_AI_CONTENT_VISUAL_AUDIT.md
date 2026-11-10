# 教材の図表・構造化 監査 — g-ai-master

実施日：2026-11-11／対象：全17教材（les-g01〜g10、les-l01〜l07）／成果物：src/data/lessonVisuals.ts

## 1. 方針

- 教材のテキスト過多を、正確で分かりやすい図・表・模式図・フロー・概念比較・具体例で置き換える。装飾だけの図は作らない。
- 図表データは本文データ（lessons.ts）と分離し、`LESSON_VISUALS`（visualId→図表）と `LESSON_VISUAL_IDS`（教材ID→visualId配列）で対応付ける。描画は src/components/ui.tsx の Visual コンポーネントが担う（nest／table／flow／compare／formula／timeline の6種）。

## 2. 実績

- **図表総数：25点**（flow 10、table 9、nest 2、compare 2、timeline 1、formula 1）。
- 全17教材に最低1点。重要教材（g-03 学習の種類、g-04 ニューラルネット、g-05 要素技術、g-08 評価、l-01 生成AIの仕組み、l-03 プロンプト、l-05 エージェントとAPI）は2点。

| 教材 | 点数 | 図表 |
|---|---|---|
| les-g01 | 1 | AI・機械学習・深層学習の包含関係（nest） |
| les-g02 | 2 | 探索アルゴリズム比較（table）、AIの歴史（timeline） |
| les-g03 | 2 | 教師あり/なし/強化の比較（table）、学習・検証・テスト分割（flow） |
| les-g04 | 2 | NNの学習の流れ（flow）、過学習と学習不足（compare） |
| les-g05 | 2 | CNNの処理の流れ（flow）、Attentionの考え方（flow） |
| les-g06 | 1 | 転移学習とファインチューニング（compare） |
| les-g07 | 1 | AIプロジェクトの進め方（flow） |
| les-g08 | 2 | 混同行列（table）、適合率・再現率・F1（formula） |
| les-g09 | 1 | 法律×守るもの×AIでの論点（table） |
| les-g10 | 1 | AIガバナンスの枠組み（nest） |
| les-l01 | 2 | Transformerの処理の流れ（flow）、RAGの流れ（flow） |
| les-l02 | 1 | 用途別判断（table、性能序列は付けない） |
| les-l03 | 2 | プロンプト改善フロー（flow）、指示とデータの置き場所（table） |
| les-l04 | 1 | 業務適用の失敗パターン（table：失敗×原因×対策） |
| les-l05 | 2 | AIエージェントの構造（flow）、APIキーと権限（table） |
| les-l06 | 1 | 根拠確認フロー（flow） |
| les-l07 | 1 | データプライバシーの確認点（table：項目×リスク×対策） |

## 3. 内容の照合

- 各図表は lessons.ts の basic / detail / keyPoints / pitfalls と照合した。例：g-06 の転移学習／ファインチューニングは「同義と断定しない」という教材側の注意を caption に反映。RAG の比較は l-01 側に寄せ、g-06 は転移学習中心とした。
- 計算例の検算：混同行列 TP=60、FP=40、FN=20 のとき 適合率 P=60/100=0.60、再現率 R=60/80=0.75、F1=2×0.60×0.75/(0.60+0.75)=0.90/1.35≒0.67。スクリプトで検算し一致。
- l-02 のモデル比較は用途別の判断表とし、性能の絶対的な序列は付けていない（マスタープロンプトの絶対条件）。

## 4. 整合性の機械確認

- LESSON_VISUAL_IDS のキー17件がすべて実在の教材IDであること、全教材に最低1図表があること、参照される visualId 25件がすべて定義済みであること、ID重複がないことをスクリプトで確認した。
