const fs = require('fs');

const readmeContent = `# 世界一の将棋WEBアプリ
name: ChatGPT Bot

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  chatgpt-bot:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install openai axios

      - name: Run ChatGPT Bot
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node ./scripts/chatgpt-bot.js
        const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
const { execSync } = require("child_process");

// GitHubイベントの取得
const event = JSON.parse(
  execSync("jq -c .", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] })
);
const commentBody = event.comment.body;
const userName = event.comment.user.login;
const issueUrl = event.issue.html_url;
const commentUrl = event.comment.url;

// ChatGPTにメッセージを送信
async function main() {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);
  
  // コメントのカテゴリ分類
  const messages = [
    { role: "system", content: "You are a helpful GitHub bot that supports code reviews, issue discussions, and architectural guidance." },
    { role: "user", content: commentBody }
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-4.5-turbo",
    messages: messages,
  });

  const reply = response.data.choices[0].message.content.trim();
  console.log(`ChatGPT's response: ${reply}`);

  // GitHubのコメントに返信
  await axios.post(commentUrl, 
    { body: `@${userName} ${reply}` },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  console.log("Reply posted to GitHub.");
}

main().catch(console.error);



## 概要
日本将棋連盟の公式ルールに準拠した高度な将棋WEBアプリです。  
リアルタイムオンライン対戦やAI対戦、棋譜保存・解析機能を備えています。

---

## 特徴
- 将棋盤のドラッグ＆ドロップ操作対応
- AI連携（やねうら王などの強力エンジン）
- 指し手の反則判定（予定：二歩、打ち歩詰め、千日手）
- オンライン対戦・観戦モード
- 段位認定システム
- 棋譜の保存および解析

---

## 動作環境とセットアップ

### 必要条件
- Node.js v16以上
- npm

### インストール手順
\`\`\`bash
git clone https://github.com/nyfhuv-qimgug-vItby8/nyfhuv-qimgug-vItby8.git
cd nyfhuv-qimgug-vItby8
npm install
npm start
\`\`\`

### 環境変数
- \`.env.example\`を参考に \`.env\` を作成し、APIキーやAIエンジン設定を追加してください。

---

## 開発フロー

### 初期セットアップ
- \`setup.sh\` などのスクリプトで依存関係インストールやDBマイグレーションを自動化

### コード品質
- ESLint + Prettierでコード整形を統一
- JSDoc形式のコメントでAPIや関数を明記
- Reactコンポーネントは責務ごとに分割
- 状態管理はReact ContextやReduxを活用

### Issue管理
- 機能追加は「Feature」ラベル、バグは「Bug」ラベルを使用
- プロジェクトボードで進捗管理

### プルリクエスト
- PRテンプレート導入（動作確認、コードスタイル、テスト追加などチェックリスト付き）
- 2名以上のレビュー承認を推奨

---

## ライセンス
本プロジェクトはMITライセンスのもとで公開しています。  
詳細は\`LICENSE\`ファイルをご覧ください。

---

## CI/CD（今後の予定）
- GitHub Actionsによる自動テストとビルド
- Lintチェック・ユニットテストの自動実行
- NetlifyやVercel等への自動デプロイ

---

## サンプルコード：Reactでのドラッグ＆ドロップ駒操作

\`\`\`jsx
import { useDrag, useDrop } from 'react-dnd';

const Piece = ({ type, position, movePiece }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PIECE',
    item: { type, position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'grab' }}>
      {type}
    </div>
  );
};

const Square = ({ position, children, movePiece }) => {
  const [, drop] = useDrop(() => ({
    accept: 'PIECE',
    drop: (item) => movePiece(item.position, position),
  }));

  return (
    <div ref={drop} style={{ width: 50, height: 50, border: '1px solid black' }}>
      {children}
    </div>
  );
};
\`\`\`

---

## ディレクトリ構成例

\`\`\`
/src
  /components   # UIコンポーネント
  /api          # API呼び出しロジック
/server         # サーバー関連コード
/docs           # ドキュメント
\`\`\`
`;

fs.writeFileSync('README.md', readmeContent, 'utf-8');
console.log('README.mdを作成しました。');
# 世界一の将棋WEBアプリ

## 概要
日本将棋連盟の公式ルールに準拠した高度な将棋WEBアプリです。  
リアルタイムオンライン対戦やAI対戦、棋譜保存・解析機能を備えています。

---

## 特徴
- 将棋盤のドラッグ＆ドロップ操作対応
- AI連携（やねうら王などの強力エンジン）
- 指し手の反則判定（予定：二歩、打ち歩詰め、千日手）
- オンライン対戦・観戦モード
- 段位認定システム
- 棋譜の保存および解析

---

## 動作環境とセットアップ

### 必要条件
- Node.js v16以上
- npm

### インストール手順
```bash
git clone https://github.com/nyfhuv-qimgug-vItby8/nyfhuv-qimgug-vItby8.git
cd nyfhuv-qimgug-vItby8
npm install
npm start
import { useDrag, useDrop } from 'react-dnd';
