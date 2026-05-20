# AI自己進化OS MVP 設計書

## 0. プロダクト定義

**AI自己進化OS** は、日々の行動・思考・学習・感情の記録をもとに、AIが本質的かつ実行可能な改善提案を返す「人生OS」です。  
Todo消化ではなく、**行動力 / 継続力 / 思考力 / 自己理解 / 学習効率**を継続的に高めることを目的にします。

---

## 1. MVPのゴールと非ゴール

### MVPゴール
1. **行動ログ入力**
   - 学習・運動・読書・SNS時間・睡眠などを1日単位で記録
2. **AI振り返り**
   - OpenAI APIで当日＋直近履歴を分析し、以下を返却
     - 今日の良かった点
     - ボトルネック
     - 改善提案（小さく実行可能）
     - 明日の最重要行動
3. **ダッシュボード**
   - 連続記録、合計行動量、継続日数の可視化

### 非ゴール（MVPではやらない）
- SNSフィード、通知最適化、ゲーミフィケーション過多
- 複雑な目標管理（OKR/プロジェクト管理）
- 多人数コラボ機能

---

## 2. UI/UXコンセプト（改善版）

### デザイン原則
- **Appleレベルの余白**: セクション間スペースを広く、情報密度を抑える
- **Linearの速度感**: 入力導線を最短化（1画面1目的、遅延感のない遷移）
- **Obsidianの集中感**: ダーク基調、コントラストは抑制し目の疲労を軽減
- **未来感**: 深いネイビー + 微光アクセントで“思考空間”を演出

### 禁止事項
- SNS的な無限スクロール、通知中毒を誘発するUI
- 過剰アニメーション、派手な色、情報の詰め込み

### カラートークン（例）
- `bg`: `#070B14`（深いネイビー）
- `panel`: `#0D1424`
- `border`: `#1C2940`
- `text-primary`: `#E8EEF9`
- `text-muted`: `#96A2BC`
- `accent`: `#6EA8FF`

### レイアウト方針
- 最大幅 `max-w-5xl`
- 主要カード間隔 `gap-8`
- タイポは見出し/本文を厳格に2〜3階層に限定
- 1画面あたり3主要情報ブロックまで

---

## 3. 技術アーキテクチャ

- **Next.js (App Router)**
- **TypeScript**（strict）
- **Tailwind CSS + shadcn/ui**
- **Supabase**（DB/Auth）
- **OpenAI API**（AI振り返り）
- **Vercel**（デプロイ）

### 設計方針
- server actions中心（入力保存・AI分析実行）
- 表示コンポーネントとロジック分離
- 型定義は `lib/types` に集約
- 将来拡張に備え、分析ロジックをサービス層へ分離

---

## 4. ディレクトリ構成（提案）

```txt
.
├─ app/
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ signup/page.tsx
│  ├─ dashboard/page.tsx
│  ├─ log/page.tsx
│  ├─ reflections/page.tsx
│  ├─ actions/
│  │  ├─ activity.ts
│  │  └─ reflection.ts
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ layout/
│  │  ├─ app-shell.tsx
│  │  └─ top-nav.tsx
│  ├─ log/
│  │  ├─ activity-log-form.tsx
│  │  └─ metric-input.tsx
│  ├─ dashboard/
│  │  ├─ streak-card.tsx
│  │  ├─ total-activity-card.tsx
│  │  └─ continuity-card.tsx
│  └─ reflection/
│     ├─ reflection-card.tsx
│     └─ insight-chip.tsx
├─ lib/
│  ├─ ai/
│  │  ├─ prompt.ts
│  │  └─ analyze.ts
│  ├─ supabase/
│  │  ├─ client.ts
│  │  └─ server.ts
│  ├─ types/
│  │  ├─ db.ts
│  │  └─ domain.ts
│  └─ utils/
│     ├─ date.ts
│     └─ metrics.ts
├─ supabase/
│  └─ migrations/
│     └─ 0001_init.sql
├─ styles/
│  └─ globals.css
├─ .env.example
└─ README.md
```

---

## 5. セットアップ手順

1. プロジェクト作成
```bash
npx create-next-app@latest ai-self-evolution-os --typescript --tailwind --app
```
2. shadcn/ui導入
```bash
npx shadcn@latest init
```
3. 依存追加
```bash
npm i @supabase/supabase-js openai zod date-fns
```
4. Supabaseプロジェクト作成 & SQL適用（後述schema）
5. `.env.local` を設定（後述）
6. 開発起動
```bash
npm run dev
```

---

## 6. 環境変数一覧

```env
# Next.js
NEXT_PUBLIC_APP_NAME=AI自己進化OS

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

# Optional
APP_TIMEZONE=Asia/Tokyo
```

---

## 7. DB Schema（MVP）

```sql
-- users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'Asia/Tokyo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- activity_logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,
  study_minutes int not null default 0 check (study_minutes >= 0),
  exercise_minutes int not null default 0 check (exercise_minutes >= 0),
  reading_minutes int not null default 0 check (reading_minutes >= 0),
  sns_minutes int not null default 0 check (sns_minutes >= 0),
  sleep_hours numeric(4,2) not null default 0 check (sleep_hours >= 0),
  mood_score int check (mood_score between 1 and 10),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);

-- ai_reflections
create table if not exists public.ai_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,
  summary jsonb not null,
  model text not null,
  prompt_version text not null default 'v1',
  created_at timestamptz not null default now(),
  unique(user_id, log_date)
);

-- streaks
create table if not exists public.streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_streak_days int not null default 0,
  longest_streak_days int not null default 0,
  last_logged_date date,
  updated_at timestamptz not null default now()
);
```

---

## 8. AI分析仕様（強化版）

### 分析対象
- 行動パターン（活動の偏り、時間配分）
- サボる時間帯（過去ログの未実行傾向）
- SNS依存傾向（SNS時間と他行動の逆相関）
- 継続率（直近7日/30日の記録率）
- 集中しやすい条件（睡眠・気分・学習量の関係）

### 出力フォーマット（JSON固定）
```json
{
  "wins": ["..."],
  "bottlenecks": ["..."],
  "micro_actions": ["15分以内で実行可能な提案"],
  "tomorrow_one_thing": "...",
  "risk_alerts": ["..."],
  "focus_conditions": ["..."]
}
```

### プロンプト設計ルール
- 抽象論禁止（「頑張る」「意識する」禁止）
- 行動は**具体的・測定可能・小さく**
- 心理学的継続性（実行ハードルを下げる）
  - 例：実行意図（if-then）、環境設計、最小習慣

---

## 9. UI構成（画面単位）

### 9.1 `/log` 行動ログ画面
- 上部：今日の日付 + 1行ガイド
- 中央：5指標入力（学習/運動/読書/SNS/睡眠）
- 下部：メモ、保存ボタン
- 原則：1分以内に入力完了

### 9.2 `/reflections` AI振り返り画面
- セクションA：今日の良かった点
- セクションB：ボトルネック
- セクションC：小さな改善提案（3件まで）
- セクションD：明日の最重要行動（1つ）

### 9.3 `/dashboard`
- カード1：連続記録日数
- カード2：合計行動量（週）
- カード3：継続率（7日/30日）
- 補助表示：SNS時間トレンド（控えめ）

---

## 10. Server Actions設計

- `saveActivityLogAction(input)`
  - バリデーション（zod）
  - `activity_logs` upsert
  - `streaks` 更新
- `generateReflectionAction(logDate)`
  - 当日 + 過去30日データ取得
  - OpenAI分析実行
  - `ai_reflections` upsert

---

## 11. 今後の拡張案（MVP後）

1. 週次レビュー自動生成（週1）
2. 目標別テンプレート（学習強化/睡眠改善等）
3. 生体データ連携（Apple Health等）
4. 習慣の因果分析（睡眠→集中→学習成果）
5. 音声入力ログ

---

## 12. 実装時の品質チェックリスト

- TypeScript strictで型エラー0
- Server Actionsで副作用を一元化
- 入力フォームはキーボード中心で高速操作可能
- ダークUIのコントラスト比を確保
- AI応答のJSONスキーマ検証
- 失敗時はユーザーに次行動を示すエラーメッセージ

---

この設計は「小さいが完成度が高いMVP」を前提に、将来的な自己進化機能拡張へ無理なく接続できる構造です。
