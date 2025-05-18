- 👋 Hi, I’m @nyfhuv-qimgug-vItby8
- 👀 I’m interested in syogi
- 🌱 I’m currently learning Japanese.
- 💞️ I’m looking to collaborate on AI
// types.ts
export type Player = 1 | 2;

export type Pos = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export type PieceType =
  | 'FU'  // 歩
  | 'KY'  // 香
  | 'KE'  // 桂
  | 'GI'  // 銀
  | 'KI'  // 金
  | 'KA'  // 角
  
  | 'HI'  // 飛
  | 'OU'  // 王
  | 'TO'  // と金（歩の成り）
  | 'NY'  // 成香
  | 'NK'  // 成桂
  | 'NG'  // 成銀
  | 'UM'  // 馬（角の成り）
  | 'RY'  // 龍（飛の成り）
  ;

export interface Piece {
  owner: Player;
  type: PieceType;
  promoted: boolean;
}

export type BoardState = Partial<Record<Pos, Piece | null>>;

export interface Move {
  from: Pos | 'HAND';
  to: Pos;
  promote: boolean;
  piece: PieceType;
  player: Player;
}
// utils.ts
import { Piece, PieceType, Player, Pos } from './types';

// 駒を盤面表示用の文字に変換
export function pieceToChar(piece: Piece): string {
  const map: Record<PieceType, string> = {
    FU: '歩', KY: '香', KE: '桂', GI: '銀', KI: '金',
    KA: '角', HI: '飛', OU: '玉',
    TO: 'と', NY: '成香', NK: '成桂', NG: '成銀',
    UM: '馬', RY: '龍',
  };
  let ch = map[piece.type] ?? '?';
  if (piece.owner === 2) ch = 'v' + ch; // 後手駒は逆向き表記(例)
  return ch;
}

// 敵陣判定：先手は1~3段、後手は7~9段が敵陣
export function inEnemyTerritory(player: Player, rank: number): boolean {
  if (player === 1) return rank <= 3;
  else return rank >= 7;
}

// 盤面の9x9座標一覧
export const ranks = [1,2,3,4,5,6,7,8,9];
export const files = [1,2,3,4,5,6,7,8,9];
// rules.ts
import { BoardState, Player, PieceType, Pos } from './types';

// 二歩判定（同じファイルに歩が2つ以上いるか）
export function checkNifu(board: BoardState, player: Player): boolean {
  for (const file of [1,2,3,4,5,6,7,8,9]) {
    let fuCount = 0;
    for (const rank of [1,2,3,4,5,6,7,8,9]) {
      const pos = `${rank}${file}` as Pos;
      const piece = board[pos];
      if (piece && piece.owner === player && piece.type === 'FU' && !piece.promoted) {
        fuCount++;
      }
      if (fuCount > 1) return true;
    }
  }
  return false;
}
// App.tsx
import React, { useReducer, useEffect } from 'react';
import { BoardState, Move, Piece, Player, Pos } from './types';
import { ranks, files, inEnemyTerritory, pieceToChar } from './utils';
import { checkNifu } from './rules';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 初期盤面セットアップ関数（省略詳細は前コードベースで作成）

// 各種コンポーネント(Square, PieceComponent, PromotionModal, PlayerInfo, MoveHistory)は
// 適切に分割して実装

// gameReducer関数は前述のものを改善しつつ採用し、
// 特に反則判定や成り判定を厳密にしつつ、
// ローカルストレージ保存処理なども付加

const App: React.FC = () => {
  // 状態管理や効果をここに

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* UIコンポーネント群 */}
      </div>
    </DndProvider>
  );
};

export default App;
// dependencies:
// react, react-dom, react-dnd, react-dnd-html5-backend

import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- Types ---

type Pos = `${number}${number}`; // 簡易座標 e.g. '77' = 7段7筋

type PieceType =
  | 'FU'  // 歩
  | 'KY'  // 香
  | 'KE'  // 桂
  | 'GI'  // 銀
  | 'KI'  // 金
  | 'KA'  // 角
  | 'HI'  // 飛
  | 'OU'  // 王
  | 'TO'  // と（金に成った歩）
  | 'NY'  // 成香
  | 'NK'  // 成桂
  | 'NG'  // 成銀
  | 'UM'  // 馬（成角）
  | 'RY'  // 竜（成飛）
  | '';   // 空

interface Piece {
  type: PieceType;
  owner: 1 | 2;  // 1:先手, 2:後手
  promoted: boolean;
}

interface BoardState {
  [pos: string]: Piece | null;
}

interface Move {
  from: Pos | 'HAND'; // HANDは持ち駒から打つとき
  to: Pos;
  promote: boolean;
  piece: PieceType;
  player: 1 | 2;
}

// --- 将棋駒文字変換（日本将棋連盟推奨表示）---

const pieceToChar = (piece: Piece | null): string => {
  if (!piece) return '';
  const baseCharMap: { [k in PieceType]: string } = {
    FU: '歩',
    KY: '香',
    KE: '桂',
    GI: '銀',
    KI: '金',
    KA: '角',
    HI: '飛',
    OU: '玉',
    TO: 'と',
    NY: '成香',
    NK: '成桂',
    NG: '成銀',
    UM: '馬',
    RY: '龍',
    '': '',
  };
  // 先手は通常文字、後手は小文字（または逆向き矢印）で区別が多いが今回は簡易表示
  const c = baseCharMap[piece.type];
  return piece.owner === 1 ? c : c; // 将来的に色分け可
};

// --- 初期盤面（81マス、9段×9筋）---

const initialBoardSetup = (): BoardState => {
  // 段筋を数字で表し、pos = `${段}${筋}` 例：7段7筋='77'
  // 先手はowner=1, 後手はowner=2
  // 盤上の初期配置（日本将棋連盟公式準拠）
  const b: BoardState = {};

  // 先手駒配置 (owner=1)
  // 9段：香桂銀金王金銀桂香
  b['91'] = { type: 'KY', owner: 2, promoted: false };
  b['92'] = { type: 'KE', owner: 2, promoted: false };
  b['93'] = { type: 'GI', owner: 2, promoted: false };
  b['94'] = { type: 'KI', owner: 2, promoted: false };
  b['95'] = { type: 'OU', owner: 2, promoted: false };
  b['96'] = { type: 'KI', owner: 2, promoted: false };
  b['97'] = { type: 'GI', owner: 2, promoted: false };
  b['98'] = { type: 'KE', owner: 2, promoted: false };
  b['99'] = { type: 'KY', owner: 2, promoted: false };

  // 8段：空
  for (let i = 1; i <= 9; i++) b[`8${i}`] = null;

  // 7段：歩兵
  for (let i = 1; i <= 9; i++) b[`7${i}`] = { type: 'FU', owner: 2, promoted: false };

  // 6段～4段：空
  for (let d = 4; d <= 6; d++)
    for (let i = 1; i <= 9; i++)
      b[`${d}${i}`] = null;

  // 3段：歩兵（先手）
  for (let i = 1; i <= 9; i++) b[`3${i}`] = { type: 'FU', owner: 1, promoted: false };

  // 2段：空
  for (let i = 1; i <= 9; i++) b[`2${i}`] = null;

  // 1段：香桂銀金王金銀桂香（先手）
  b['11'] = { type: 'KY', owner: 1, promoted: false };
  b['12'] = { type: 'KE', owner: 1, promoted: false };
  b['13'] = { type: 'GI', owner: 1, promoted: false };
  b['14'] = { type: 'KI', owner: 1, promoted: false };
  b['15'] = { type: 'OU', owner: 1, promoted: false };
  b['16'] = { type: 'KI', owner: 1, promoted: false };
  b['17'] = { type: 'GI', owner: 1, promoted: false };
  b['18'] = { type: 'KE', owner: 1, promoted: false };
  b['19'] = { type: 'KY', owner: 1, promoted: false };

  // 持ち駒は空で開始（実装想定）
  return b;
};

// --- 将棋盤9x9座標配列（視覚表示用）---

const ranks = [9, 8, 7, 6, 5, 4, 3, 2, 1];
const files = [9, 8, 7, 6, 5, 4, 3, 2, 1];

// --- 駒のドラッグ＆ドロップ用 ---

const ItemTypes = {
  PIECE: 'piece',
};

interface DragPiece {
  position: Pos | 'HAND';
  piece: Piece;
}

// --- 効果音再生 ---

const moveSoundUrl =
  'https://actions.google.com/sounds/v1/wood/wood_plank_flicks.ogg'; // シンプルな駒移動音

const playMoveSound = () => {
  const audio = new Audio(moveSoundUrl);
  audio.play().catch(() => {
    // 再生失敗は無視
  });
};

// --- 反則判定: 最低限 二歩判定のサンプル実装 ---

// 二歩とは「同一筋に歩が２枚以上ある状態」は反則
// owner=1, owner=2別で判定
function checkNifu(board: BoardState, player: 1 | 2): boolean {
  // 縦筋1〜9に歩が複数あるか？
  for (let file = 1; file <= 9; file++) {
    let count = 0;
    for (let rank = 1; rank <= 9; rank++) {
      const p = board[`${rank}${file}`];
      if (p && p.owner === player && p.type === 'FU' && !p.promoted) {
        count++;
      }
    }
    if (count > 1) return true; // 二歩あり
  }
  return false;
}

// --- React Components ---

const Square: React.FC<{
  black: boolean;
  position: Pos;
  children?: React.ReactNode;
  onDropPiece: (fromPos: Pos | 'HAND', toPos: Pos) => void;
}> = ({ black, position, children, onDropPiece }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PIECE,
    drop: (item: DragPiece) => onDropPiece(item.position, position),
    canDrop: (item: DragPiece) => {
      // TODO: 指し手の合法性判定を拡張
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const bgColor = black ? '#769656' : '#eeeed2';
  const highlight = isOver && canDrop ? '#f4fcbf' : bgColor;

  return (
    <div
      ref={drop}
      style={{
        width: 50,
        height: 50,
        backgroundColor: highlight,
        border: '1px solid black',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
            alignItems: 'center',
    userSelect: 'none',
    fontSize: '28px',
    fontWeight: 'bold',
    fontFamily: 'serif',
    cursor: 'pointer',
  }}
>
  {children}
</div>
  // 成りが選択可能か判定（簡易: 歩、香、桂、銀、角、飛で敵陣に入る場合）
  const enemyRank = movingPiece.owner === 1 ? 7 : 3; // 7～9段は先手敵陣、3～1段は後手敵陣

  const fromRank = Number(from[0]);
  const toRank = Number(to[0]);

  const canPromote =
    ['FU', 'KY', 'KE', 'GI', 'KA', 'HI'].includes(movingPiece.type) &&
    ((movingPiece.owner === 1 && (fromRank <= 3 || toRank <= 3)) ||
      (movingPiece.owner === 2 && (fromRank >= 7 || toRank >= 7)));

  if (canPromote) {
    // 成り選択を待つ
    return {
      ...state,
      promotionPending: { from, to, piece: movingPiece },
    };
  }

  // それ以外は自動で成らないとして処理
  // 駒移動（fromを空にし、toに駒をセット）
  board[to] = movingPiece;
  if (from !== 'HAND') board[from] = null;

  playMoveSound();

  // 二歩判定（反則処理はここで分かれてもよいが簡易にアラート表示）
  if (movingPiece.type === 'FU') {
    const nifu = checkNifu(board, movingPiece.owner);
    if (nifu) {
      alert('反則：二歩です！指し手をやり直してください。');
      return state; // 変更破棄
    }
  }

  // 手番交代
  const nextTurn = state.turn === 1 ? 2 : 1;

  return {
    ...state,
    board,
    turn: nextTurn,
    history: [...state.history, { from, to, promote: false, piece: movingPiece.type, player: movingPiece.owner }],
    promotionPending: null,
  };
}
case 'PROMOTE': {
  if (!state.promotionPending) return state;
  const { from, to, piece } = state.promotionPending;
  const board = { ...state.board };
  // 駒移動＋成り反映
  let promotedType: PieceType = piece.type;
  if (action.promote) {
    // 成り駒への変換（簡易実装）
    switch (piece.type) {
      case 'FU': promotedType = 'TO'; break;
      case 'KY': promotedType = 'NY'; break;
      case 'KE': promotedType = 'NK'; break;
      case 'GI': promotedType = 'NG'; break;
      case 'KA': promotedType = 'UM'; break;
      case 'HI': promotedType = 'RY'; break;
      default: promotedType = piece.type;
    }
  }
  const promotedPiece: Piece = {
    ...piece,
    type: promotedType,
    promoted: action.promote,
  };
  board[to] = promotedPiece;
  if (from !== 'HAND') board[from] = null;

  playMoveSound();

  // 二歩判定（歩の成りでもチェック）
  if (promotedPiece.type === 'FU') {
    const nifu = checkNifu(board, promotedPiece.owner);
    if (nifu) {
      alert('反則：二歩です！指し手をやり直してください。');
      return state; // 変更破棄
    }
  }

  const nextTurn = state.turn === 1 ? 2 : 1;
  return {
    ...state,
    board,
    turn: nextTurn,
    history: [
      ...state.history,
      {
        from,
        to,
        promote: action.promote,
        piece: piece.type,
        player: piece.owner,
      },
    ],
    promotionPending: null,
  };
}
case 'RESET': {
  return initialGameState;
}
case 'SET_OBSERVING': {
  return { ...state, isObserving: action.observing };
}
case 'LOAD_HISTORY': {
  // 棋譜から局面復元ロジック（省略、後日実装推奨）
  return state;
}
default:
  return state;
  
---

このコードは、Reactで簡単な将棋の盤面を描画し、駒のドラッグ＆ドロップによる移動や成り判定のモーダル選択を実装しています。  
- 将棋盤は9x9マスで、マスはクリックやドロップで操作できます。  
- 駒はドラッグ可能で、移動先のマスにドロップ可能。  
- 成りが可能な移動ではモーダルで「成る」「成らない」を選択。  
- 二歩の簡易チェックあり（反則判定でアラート表示）。  
- 手番（先手・後手）管理と履歴表示もあります。  

質問や改良したい点があれば教えてください！







