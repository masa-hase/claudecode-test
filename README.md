# MySQL EXPLAIN分析ツール

> 🤖 このプロジェクトは[Claude Code](https://claude.ai/code)で生成されました

MySQLのEXPLAIN結果を解析し、パフォーマンス改善のための具体的な提案を提供するWebアプリケーションです。

## 🚀 機能

### EXPLAIN結果分析
- **EXPLAIN結果の解析**: MySQL の EXPLAIN 出力を解析し、視覚的に表示
- **包括的フォーマット対応**: テーブル形式、垂直形式（\G）、CSV、TSV、プレーンテーブル形式をサポート
- **パフォーマンス診断**: クエリの問題点を自動検出
- **チューニング提案**: 具体的な改善策を重要度別に表示

### SQLクエリ分析
- **SQLクエリ解析**: SQLクエリの構造を分析し、最適化提案を提供
- **クエリ最適化**: サブクエリ変換、JOIN順序最適化、インデックスヒント追加
- **高度な問題検出**: N+1クエリ、Cartesian積、危険なUPDATE/DELETE文の検出
- **パフォーマンス推定**: 最適化による性能向上の見積もり

### 共通機能
- **リアルタイム分析**: ブラウザ上で即座に結果を確認
- **デュアルモード**: EXPLAIN結果分析とSQLクエリ分析を切り替え可能

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.3.3** - React フレームワーク（App Router）
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **React 19** - UIライブラリ

### 開発・テスト
- **Biome** - リンター・フォーマッター
- **Jest** - ユニットテスト
- **React Testing Library** - コンポーネントテスト
- **Playwright** - E2Eテスト
- **Bun** - パッケージマネージャー

### アーキテクチャ
- **Domain-Driven Design (DDD)** - ドメイン駆動設計
- **Test-Driven Development (TDD)** - テスト駆動開発

## 📁 プロジェクト構造

```
src/
├── domain/                    # ドメイン層
│   ├── entities/             # エンティティ
│   │   └── ExplainRow.ts     # EXPLAIN行エンティティ
│   ├── valueObjects/         # 値オブジェクト
│   │   ├── AccessType.ts     # アクセスタイプ
│   │   ├── QueryType.ts      # クエリタイプ
│   │   └── RowCount.ts       # 行数
│   └── services/             # ドメインサービス
│       ├── QueryAnalyzer.ts       # EXPLAIN結果分析サービス
│       ├── QueryOptimizer.ts      # クエリ最適化サービス
│       ├── QueryParser.ts         # SQLクエリ解析サービス
│       ├── QueryTuningAnalyzer.ts # 高度なクエリ分析サービス
│       └── TuningSuggestion.ts    # チューニング提案値オブジェクト
├── application/              # アプリケーション層
│   └── useCases/            # ユースケース
│       ├── AnalyzeExplainUseCase.ts # EXPLAIN結果分析ユースケース
│       └── AnalyzeQueryUseCase.ts   # SQLクエリ分析ユースケース
├── infrastructure/          # インフラストラクチャ層
│   └── parsers/            # パーサー
│       └── ExplainParser.ts # EXPLAIN結果パーサー
└── presentation/           # プレゼンテーション層
    ├── components/         # Reactコンポーネント
    │   ├── ExplainInput.tsx           # EXPLAIN入力コンポーネント
    │   ├── ExplainResultTable.tsx     # EXPLAIN結果表示テーブル
    │   ├── QueryInfoDisplay.tsx       # クエリ情報表示コンポーネント
    │   ├── QueryInput.tsx             # SQLクエリ入力コンポーネント
    │   ├── QueryOptimizationDisplay.tsx # クエリ最適化結果表示
    │   └── TuningSuggestionCard.tsx   # チューニング提案カード
    └── hooks/             # カスタムフック
        ├── useExplainAnalyzer.ts      # EXPLAIN分析フック
        └── useQueryAnalyzer.ts        # SQLクエリ分析フック
```

## 🔧 セットアップ

### 前提条件
- Node.js 20+
- Bun (推奨) または npm

### インストール

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun dev
```

アプリケーションは http://localhost:3000 で起動します。

## 🧪 テスト

### ユニットテスト
```bash
# Jest でユニットテスト実行
npm test

# ウォッチモード
npm run test:watch
```

### E2Eテスト
```bash
# Playwright で E2E テスト実行
npm run test:e2e

# テストUI起動
npm run test:e2e:ui
```

### コード品質チェック
```bash
# Biome でリント・フォーマットチェック
bun run check

# 自動修正
bun run format
```

## 📊 サポートしているEXPLAINフォーマット

### 1. テーブル形式（標準）
```sql
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | users | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
```

### 2. 垂直形式（\G）
```sql
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: users
         type: ALL
         rows: 1000
```

### 3. CSV形式
```csv
"id","select_type","table","type","rows","Extra"
"1","SIMPLE","users","ALL","1000","Using where"
```

### 4. TSV形式（MySQL Workbench）
```
id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	users	NULL	ALL	NULL	NULL	NULL	NULL	1000	100.00	NULL
```

### 5. プレーンテーブル形式（MySQL Workbench）
```
id select_type table      partitions type  possible_keys key     key_len ref              rows filtered Extra
1  SIMPLE      users      NULL       ALL   NULL          NULL    NULL    NULL             1000 100.00   NULL
```

## 🔍 検出できるパフォーマンス問題

### EXPLAIN結果分析
- **フルテーブルスキャン** (`type: ALL`) - 重要度: Critical
- **未使用インデックス** - 重要度: Warning  
- **ファイルソート** (`Extra: Using filesort`) - 重要度: Warning
- **テンポラリテーブル** (`Extra: Using temporary`) - 重要度: Critical
- **高いJOINコスト** (50,000行以上) - 重要度: Critical
- **低いフィルタリング効率** (30%未満) - 重要度: Warning

### SQLクエリ分析
- **N+1クエリパターン** - 重要度: Critical
- **Cartesian積** (JOINの条件不足) - 重要度: Critical
- **危険なUPDATE/DELETE** (WHERE句なし) - 重要度: Critical
- **サブクエリ最適化** (IN → EXISTS変換) - 重要度: Warning
- **大きなIN句** (10値以上) - 重要度: Info
- **複合インデックス提案** - 重要度: Info

## 🎨 UI/UX特徴

- **デュアルモード**: EXPLAIN結果分析とSQLクエリ分析の切り替え
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **視覚的なハイライト**: 問題のあるクエリを色分け表示
- **重要度別表示**: Critical・Warning・Infoの3段階で提案を分類
- **読みやすい配色**: 改良された配色で視認性を向上
- **即座のフィードバック**: リアルタイムでの解析結果表示
- **最適化クエリ表示**: 元のクエリと最適化されたクエリの比較表示

## 🏗️ 開発原則

### Domain-Driven Design (DDD)
- ドメインロジックをコアに配置
- レイヤー間の明確な分離
- ビジネスルールの可読性重視

### Test-Driven Development (TDD)
- テストファースト開発
- 高いテストカバレッジ（包括的なユニットテスト + E2Eテスト）
- リグレッション防止
- 新機能に対する充実したテストスイート

## 📈 パフォーマンス

- **高速解析**: インメモリでの即座のEXPLAIN・SQLクエリ解析
- **軽量**: 最適化されたNext.jsビルド
- **効率的**: サーバーサイド不要のクライアントサイド処理
- **最適化されたパーサー**: 正規表現の事前コンパイルによる高速化
- **フォーマット自動検出**: 複数のEXPLAINフォーマットを自動識別

## 🤝 開発環境

VS Code Dev Containers対応で、一貫した開発環境を提供：
- Ubuntu ベースイメージ
- Node.js 20 + Bun プリインストール
- Biome 自動セットアップ
- 必要な VS Code 拡張機能

## 📝 ライセンス

このプロジェクトは教育・学習目的で作成されました。

---

**Claude Code で効率的な開発体験を！** 🚀