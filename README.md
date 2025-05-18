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
###プロトタイプ
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
