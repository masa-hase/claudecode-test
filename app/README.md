# MySQL EXPLAIN分析ツール

> 🤖 このプロジェクトは[Claude Code](https://claude.ai/code)で生成されました

MySQLのEXPLAIN結果を解析し、パフォーマンス改善のための具体的な提案を提供するWebアプリケーションです。

## 🚀 機能

- **EXPLAIN結果の解析**: MySQL の EXPLAIN 出力を解析し、視覚的に表示
- **複数フォーマット対応**: テーブル形式、垂直形式（\G）、CSV形式をサポート
- **パフォーマンス診断**: クエリの問題点を自動検出
- **チューニング提案**: 具体的な改善策を重要度別に表示
- **リアルタイム分析**: ブラウザ上で即座に結果を確認

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
│       ├── QueryAnalyzer.ts  # クエリ分析サービス
│       └── TuningSuggestion.ts # チューニング提案
├── application/              # アプリケーション層
│   └── useCases/            # ユースケース
│       └── AnalyzeExplainUseCase.ts
├── infrastructure/          # インフラストラクチャ層
│   └── parsers/            # パーサー
│       └── ExplainParser.ts # EXPLAIN結果パーサー
└── presentation/           # プレゼンテーション層
    ├── components/         # Reactコンポーネント
    │   ├── ExplainInput.tsx
    │   ├── ExplainResultTable.tsx
    │   └── TuningSuggestionCard.tsx
    └── hooks/             # カスタムフック
        └── useExplainAnalyzer.ts
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

## 🔍 検出できるパフォーマンス問題

- **フルテーブルスキャン** (`type: ALL`) - 重要度: 重要
- **未使用インデックス** - 重要度: 重要  
- **ファイルソート** (`Extra: Using filesort`) - 重要度: 警告
- **テンポラリテーブル** (`Extra: Using temporary`) - 重要度: 警告
- **大量行数の処理** (10,000行以上) - 重要度: 警告

## 🎨 UI/UX特徴

- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **視覚的なハイライト**: 問題のあるクエリを色分け表示
- **読みやすい配色**: 改良された配色で視認性を向上
- **即座のフィードバック**: リアルタイムでの解析結果表示

## 🏗️ 開発原則

### Domain-Driven Design (DDD)
- ドメインロジックをコアに配置
- レイヤー間の明確な分離
- ビジネスルールの可読性重視

### Test-Driven Development (TDD)
- テストファースト開発
- 高いテストカバレッジ（101のユニットテスト + 9のE2Eテスト）
- リグレッション防止

## 📈 パフォーマンス

- **高速解析**: インメモリでの即座のEXPLAIN解析
- **軽量**: 最適化されたNext.jsビルド（First Load JS: 101KB）
- **効率的**: サーバーサイド不要のクライアントサイド処理

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