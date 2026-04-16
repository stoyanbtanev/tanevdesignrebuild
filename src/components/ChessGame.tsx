import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChessRobot, { type ChessRobotEvent, type ChessRobotEventType } from '@/components/ChessRobot';
import ChessPiece from '@/components/ChessPieces';

/* ═══════════════════════════════════════════════════════════════════════════
   CHESS ENGINE (no deps)
   ─ Full legal move generation (pawn, knight, bishop, rook, queen, king)
   ─ Castling, en passant, auto-queen promotion
   ─ Check, checkmate, stalemate detection
   ─ Minimax + alpha-beta pruning (depth 3) + piece-square tables
═══════════════════════════════════════════════════════════════════════════ */

type Color = 'w' | 'b';
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
interface Piece { t: PieceType; c: Color; }
type Square = Piece | null;
type Board = Square[][];
type Pos = [number, number];

interface CastlingRights { K: boolean; Q: boolean; k: boolean; q: boolean; }
interface GameState {
  board: Board;
  turn: Color;
  castling: CastlingRights;
  enPassant: Pos | null;
}

interface Move {
  from: Pos;
  to: Pos;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castle?: 'K' | 'Q' | 'k' | 'q';
  enPassant?: boolean;
}

interface Undo {
  prevCastling: CastlingRights;
  prevEnPassant: Pos | null;
  captured?: Piece;
}

const KNIGHT_D: ReadonlyArray<[number, number]> = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const ROOK_D: ReadonlyArray<[number, number]> = [[-1,0],[1,0],[0,-1],[0,1]];
const BISHOP_D: ReadonlyArray<[number, number]> = [[-1,-1],[-1,1],[1,-1],[1,1]];
const QUEEN_D: ReadonlyArray<[number, number]> = [...ROOK_D, ...BISHOP_D];
const KING_D = QUEEN_D;

const inside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

function initBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array<Square>(8).fill(null));
  const back: PieceType[] = ['r','n','b','q','k','b','n','r'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { t: back[c], c: 'b' };
    b[1][c] = { t: 'p', c: 'b' };
    b[6][c] = { t: 'p', c: 'w' };
    b[7][c] = { t: back[c], c: 'w' };
  }
  return b;
}

function initState(): GameState {
  return {
    board: initBoard(),
    turn: 'w',
    castling: { K: true, Q: true, k: true, q: true },
    enPassant: null,
  };
}

function cloneState(s: GameState): GameState {
  return {
    board: s.board.map(row => row.slice()),
    turn: s.turn,
    castling: { ...s.castling },
    enPassant: s.enPassant ? [s.enPassant[0], s.enPassant[1]] : null,
  };
}

/* ─── Attack detection (used for check + castling path safety) ───────────── */
function isSquareAttacked(b: Board, r: number, c: number, byColor: Color): boolean {
  const pdir = byColor === 'w' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const nr = r + pdir, nc = c + dc;
    if (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.c === byColor && p.t === 'p') return true;
    }
  }
  for (const [dr, dc] of KNIGHT_D) {
    const nr = r + dr, nc = c + dc;
    if (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.c === byColor && p.t === 'n') return true;
    }
  }
  for (const [dr, dc] of KING_D) {
    const nr = r + dr, nc = c + dc;
    if (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.c === byColor && p.t === 'k') return true;
    }
  }
  for (const [dr, dc] of ROOK_D) {
    let nr = r + dr, nc = c + dc;
    while (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p) {
        if (p.c === byColor && (p.t === 'r' || p.t === 'q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }
  for (const [dr, dc] of BISHOP_D) {
    let nr = r + dr, nc = c + dc;
    while (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p) {
        if (p.c === byColor && (p.t === 'b' || p.t === 'q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }
  return false;
}

function findKing(b: Board, color: Color): Pos | null {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (p && p.t === 'k' && p.c === color) return [r, c];
  }
  return null;
}

function isInCheck(state: GameState, color: Color): boolean {
  const k = findKing(state.board, color);
  if (!k) return false;
  return isSquareAttacked(state.board, k[0], k[1], color === 'w' ? 'b' : 'w');
}

function genPawn(state: GameState, r: number, c: number, p: Piece, out: Move[]) {
  const b = state.board;
  const dir = p.c === 'w' ? -1 : 1;
  const startRow = p.c === 'w' ? 6 : 1;
  const promoRow = p.c === 'w' ? 0 : 7;

  const fr = r + dir;
  if (inside(fr, c) && !b[fr][c]) {
    if (fr === promoRow) {
      out.push({ from: [r, c], to: [fr, c], piece: p, promotion: 'q' });
    } else {
      out.push({ from: [r, c], to: [fr, c], piece: p });
      if (r === startRow && !b[r + 2 * dir][c]) {
        out.push({ from: [r, c], to: [r + 2 * dir, c], piece: p });
      }
    }
  }
  for (const dc of [-1, 1]) {
    const nr = r + dir, nc = c + dc;
    if (!inside(nr, nc)) continue;
    const t = b[nr][nc];
    if (t && t.c !== p.c) {
      if (nr === promoRow) out.push({ from: [r, c], to: [nr, nc], piece: p, captured: t, promotion: 'q' });
      else out.push({ from: [r, c], to: [nr, nc], piece: p, captured: t });
    }
    if (state.enPassant && nr === state.enPassant[0] && nc === state.enPassant[1]) {
      const capRow = p.c === 'w' ? nr + 1 : nr - 1;
      const cap = b[capRow][nc];
      if (cap) out.push({ from: [r, c], to: [nr, nc], piece: p, captured: cap, enPassant: true });
    }
  }
}

function genJump(b: Board, r: number, c: number, p: Piece, deltas: ReadonlyArray<[number, number]>, out: Move[]) {
  for (const [dr, dc] of deltas) {
    const nr = r + dr, nc = c + dc;
    if (!inside(nr, nc)) continue;
    const t = b[nr][nc];
    if (!t) out.push({ from: [r, c], to: [nr, nc], piece: p });
    else if (t.c !== p.c) out.push({ from: [r, c], to: [nr, nc], piece: p, captured: t });
  }
}

function genSlide(b: Board, r: number, c: number, p: Piece, deltas: ReadonlyArray<[number, number]>, out: Move[]) {
  for (const [dr, dc] of deltas) {
    let nr = r + dr, nc = c + dc;
    while (inside(nr, nc)) {
      const t = b[nr][nc];
      if (!t) out.push({ from: [r, c], to: [nr, nc], piece: p });
      else {
        if (t.c !== p.c) out.push({ from: [r, c], to: [nr, nc], piece: p, captured: t });
        break;
      }
      nr += dr; nc += dc;
    }
  }
}

function genCastle(state: GameState, r: number, c: number, p: Piece, out: Move[]) {
  const b = state.board;
  if (p.c === 'w' && r === 7 && c === 4) {
    if (state.castling.K && !b[7][5] && !b[7][6] && b[7][7]?.t === 'r' && b[7][7]?.c === 'w') {
      if (!isSquareAttacked(b, 7, 4, 'b') && !isSquareAttacked(b, 7, 5, 'b') && !isSquareAttacked(b, 7, 6, 'b')) {
        out.push({ from: [7, 4], to: [7, 6], piece: p, castle: 'K' });
      }
    }
    if (state.castling.Q && !b[7][3] && !b[7][2] && !b[7][1] && b[7][0]?.t === 'r' && b[7][0]?.c === 'w') {
      if (!isSquareAttacked(b, 7, 4, 'b') && !isSquareAttacked(b, 7, 3, 'b') && !isSquareAttacked(b, 7, 2, 'b')) {
        out.push({ from: [7, 4], to: [7, 2], piece: p, castle: 'Q' });
      }
    }
  } else if (p.c === 'b' && r === 0 && c === 4) {
    if (state.castling.k && !b[0][5] && !b[0][6] && b[0][7]?.t === 'r' && b[0][7]?.c === 'b') {
      if (!isSquareAttacked(b, 0, 4, 'w') && !isSquareAttacked(b, 0, 5, 'w') && !isSquareAttacked(b, 0, 6, 'w')) {
        out.push({ from: [0, 4], to: [0, 6], piece: p, castle: 'k' });
      }
    }
    if (state.castling.q && !b[0][3] && !b[0][2] && !b[0][1] && b[0][0]?.t === 'r' && b[0][0]?.c === 'b') {
      if (!isSquareAttacked(b, 0, 4, 'w') && !isSquareAttacked(b, 0, 3, 'w') && !isSquareAttacked(b, 0, 2, 'w')) {
        out.push({ from: [0, 4], to: [0, 2], piece: p, castle: 'q' });
      }
    }
  }
}

function generatePseudoMoves(state: GameState, color: Color): Move[] {
  const moves: Move[] = [];
  const b = state.board;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (!p || p.c !== color) continue;
    switch (p.t) {
      case 'p': genPawn(state, r, c, p, moves); break;
      case 'n': genJump(b, r, c, p, KNIGHT_D, moves); break;
      case 'b': genSlide(b, r, c, p, BISHOP_D, moves); break;
      case 'r': genSlide(b, r, c, p, ROOK_D, moves); break;
      case 'q': genSlide(b, r, c, p, QUEEN_D, moves); break;
      case 'k':
        genJump(b, r, c, p, KING_D, moves);
        genCastle(state, r, c, p, moves);
        break;
    }
  }
  return moves;
}

function makeMove(state: GameState, m: Move): Undo {
  const b = state.board;
  const [fr, fc] = m.from;
  const [tr, tc] = m.to;
  const piece = b[fr][fc]!;
  const undo: Undo = {
    prevCastling: { ...state.castling },
    prevEnPassant: state.enPassant,
    captured: m.captured,
  };

  b[tr][tc] = piece;
  b[fr][fc] = null;

  if (m.enPassant) {
    const capRow = piece.c === 'w' ? tr + 1 : tr - 1;
    b[capRow][tc] = null;
  }
  if (m.promotion) {
    b[tr][tc] = { t: m.promotion, c: piece.c };
  }
  if (m.castle === 'K') { b[7][5] = b[7][7]; b[7][7] = null; }
  else if (m.castle === 'Q') { b[7][3] = b[7][0]; b[7][0] = null; }
  else if (m.castle === 'k') { b[0][5] = b[0][7]; b[0][7] = null; }
  else if (m.castle === 'q') { b[0][3] = b[0][0]; b[0][0] = null; }

  if (piece.t === 'k') {
    if (piece.c === 'w') { state.castling.K = false; state.castling.Q = false; }
    else { state.castling.k = false; state.castling.q = false; }
  }
  if (piece.t === 'r') {
    if (fr === 7 && fc === 0) state.castling.Q = false;
    if (fr === 7 && fc === 7) state.castling.K = false;
    if (fr === 0 && fc === 0) state.castling.q = false;
    if (fr === 0 && fc === 7) state.castling.k = false;
  }
  if (m.captured && m.captured.t === 'r') {
    if (tr === 7 && tc === 0) state.castling.Q = false;
    if (tr === 7 && tc === 7) state.castling.K = false;
    if (tr === 0 && tc === 0) state.castling.q = false;
    if (tr === 0 && tc === 7) state.castling.k = false;
  }

  if (piece.t === 'p' && Math.abs(tr - fr) === 2) {
    state.enPassant = [(fr + tr) / 2, fc];
  } else {
    state.enPassant = null;
  }

  state.turn = state.turn === 'w' ? 'b' : 'w';
  return undo;
}

function unmakeMove(state: GameState, m: Move, undo: Undo) {
  const b = state.board;
  const [fr, fc] = m.from;
  const [tr, tc] = m.to;
  const piece = m.piece;

  if (m.castle === 'K') { b[7][7] = b[7][5]; b[7][5] = null; }
  else if (m.castle === 'Q') { b[7][0] = b[7][3]; b[7][3] = null; }
  else if (m.castle === 'k') { b[0][7] = b[0][5]; b[0][5] = null; }
  else if (m.castle === 'q') { b[0][0] = b[0][3]; b[0][3] = null; }

  b[fr][fc] = piece;
  if (m.enPassant) {
    b[tr][tc] = null;
    const capRow = piece.c === 'w' ? tr + 1 : tr - 1;
    b[capRow][tc] = undo.captured || null;
  } else {
    b[tr][tc] = undo.captured || null;
  }

  state.castling = undo.prevCastling;
  state.enPassant = undo.prevEnPassant;
  state.turn = state.turn === 'w' ? 'b' : 'w';
}

function generateLegalMoves(state: GameState, color: Color): Move[] {
  const pseudo = generatePseudoMoves(state, color);
  const legal: Move[] = [];
  for (const m of pseudo) {
    const u = makeMove(state, m);
    if (!isInCheck(state, color)) legal.push(m);
    unmakeMove(state, m, u);
  }
  return legal;
}

const VAL: Record<PieceType, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const PST: Record<PieceType, number[][]> = {
  p: [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [ 50, 50, 50, 50, 50, 50, 50, 50],
    [ 10, 10, 20, 30, 30, 20, 10, 10],
    [  5,  5, 10, 25, 25, 10,  5,  5],
    [  0,  0,  0, 20, 20,  0,  0,  0],
    [  5, -5,-10,  0,  0,-10, -5,  5],
    [  5, 10, 10,-20,-20, 10, 10,  5],
    [  0,  0,  0,  0,  0,  0,  0,  0],
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  r: [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  0,  0,  0,  5,  5,  0,  0,  0],
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20],
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20],
  ],
};

function evaluate(state: GameState): number {
  let s = 0;
  const b = state.board;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (!p) continue;
    const base = VAL[p.t];
    const pst = PST[p.t][p.c === 'w' ? r : 7 - r][c];
    if (p.c === 'w') s += base + pst;
    else s -= base + pst;
  }
  return s;
}

function scoreMove(m: Move): number {
  if (m.captured) return 10 * VAL[m.captured.t] - VAL[m.piece.t];
  if (m.promotion) return 800;
  return 0;
}

const MATE = 100000;

function minimax(state: GameState, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0) return evaluate(state);
  const color: Color = maximizing ? 'w' : 'b';
  const moves = generateLegalMoves(state, color);
  if (moves.length === 0) {
    if (isInCheck(state, color)) return maximizing ? -MATE - depth : MATE + depth;
    return 0;
  }
  moves.sort((a, b) => scoreMove(b) - scoreMove(a));
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const u = makeMove(state, m);
      const v = minimax(state, depth - 1, alpha, beta, false);
      unmakeMove(state, m, u);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const u = makeMove(state, m);
      const v = minimax(state, depth - 1, alpha, beta, true);
      unmakeMove(state, m, u);
      if (v < best) best = v;
      if (best < beta) beta = best;
      if (beta <= alpha) break;
    }
    return best;
  }
}

function findBestMove(rootState: GameState, depth: number): Move | null {
  const state = cloneState(rootState);
  const aiColor = state.turn;
  const moves = generateLegalMoves(state, aiColor);
  if (moves.length === 0) return null;
  moves.sort((a, b) => scoreMove(b) - scoreMove(a));
  let best: Move = moves[0];
  let bestScore = aiColor === 'w' ? -Infinity : Infinity;
  let alpha = -Infinity, beta = Infinity;
  for (const m of moves) {
    const u = makeMove(state, m);
    const v = minimax(state, depth - 1, alpha, beta, aiColor !== 'w');
    unmakeMove(state, m, u);
    if (aiColor === 'w') {
      if (v > bestScore) { bestScore = v; best = m; }
      if (bestScore > alpha) alpha = bestScore;
    } else {
      if (v < bestScore) { bestScore = v; best = m; }
      if (bestScore < beta) beta = bestScore;
    }
  }
  return best;
}

const FILES = 'abcdefgh';
function sqName(r: number, c: number): string { return FILES[c] + (8 - r); }

function toSAN(state: GameState, move: Move): string {
  const pre = cloneState(state);
  if (move.castle === 'K' || move.castle === 'k') return appendCheckSuffix(pre, move, 'O-O');
  if (move.castle === 'Q' || move.castle === 'q') return appendCheckSuffix(pre, move, 'O-O-O');

  const piece = move.piece;
  const to = sqName(move.to[0], move.to[1]);
  let s = '';
  if (piece.t === 'p') {
    if (move.captured) s += FILES[move.from[1]] + 'x';
    s += to;
    if (move.promotion) s += '=' + move.promotion.toUpperCase();
  } else {
    s += piece.t.toUpperCase();
    const legal = generateLegalMoves(pre, piece.c);
    const sameTargetSamePiece = legal.filter(m =>
      m.piece.t === piece.t &&
      m.to[0] === move.to[0] && m.to[1] === move.to[1] &&
      !(m.from[0] === move.from[0] && m.from[1] === move.from[1])
    );
    if (sameTargetSamePiece.length > 0) {
      const sameFile = sameTargetSamePiece.some(m => m.from[1] === move.from[1]);
      const sameRank = sameTargetSamePiece.some(m => m.from[0] === move.from[0]);
      if (!sameFile) s += FILES[move.from[1]];
      else if (!sameRank) s += (8 - move.from[0]);
      else s += FILES[move.from[1]] + (8 - move.from[0]);
    }
    if (move.captured) s += 'x';
    s += to;
  }
  return appendCheckSuffix(pre, move, s);
}

function appendCheckSuffix(pre: GameState, move: Move, base: string): string {
  const post = cloneState(pre);
  makeMove(post, move);
  const opp: Color = move.piece.c === 'w' ? 'b' : 'w';
  if (isInCheck(post, opp)) {
    const oppMoves = generateLegalMoves(post, opp);
    return base + (oppMoves.length === 0 ? '#' : '+');
  }
  return base;
}

/* ═══════════════════════════════════════════════════════════════════════════
   REACT COMPONENT — NEXT-GEN EDITION
   ─ Three time controls: 1 | 2+1 | 5  (5 default)
   ─ Live clocks with flag-fall detection
   ─ Drag-and-drop + click-to-move with magnetic snap
   ─ Custom SVG pieces (ChessPiece component)
   ─ Robot floats above the board as a comic-strip commentator
   ─ Zero decorative copy — only pieces, clocks, chips, robot bubble
═══════════════════════════════════════════════════════════════════════════ */

interface EndGame {
  type: 'checkmate' | 'stalemate' | 'timeout';
  winner?: Color;
}

interface ParticleBurst { id: number; r: number; c: number; }

interface TimeControl {
  id: 'bullet' | 'blitz21' | 'blitz5';
  short: string;           // compact display on the chip
  baseMs: number;
  incMs: number;
}

const TIME_CONTROLS: TimeControl[] = [
  { id: 'bullet',  short: '1',    baseMs: 60_000,  incMs: 0      },
  { id: 'blitz21', short: '2+1',  baseMs: 120_000, incMs: 1_000  },
  { id: 'blitz5',  short: '5',    baseMs: 300_000, incMs: 0      },
];
const DEFAULT_TC: TimeControl = TIME_CONTROLS[2]; // 5 min

const AI_DEPTH = 3;
const AI_DELAY_MS = 300;

function formatClock(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const mm = m.toString().padStart(1, '0');
  const ss = s.toString().padStart(2, '0');
  // Under 10 seconds: show tenths for tension
  if (clamped < 10_000) {
    const tenths = Math.floor((clamped % 1000) / 100);
    return `${mm}:${ss}.${tenths}`;
  }
  return `${mm}:${ss}`;
}

/* Inline SVG icon set used by control buttons (no external deps). */
function IconNew({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}
function IconFlip({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 8h12l-3-3M20 16H8l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChessGame() {
  const { lang } = useLanguage();
  void lang;

  const [timeControl, setTimeControl] = useState<TimeControl>(DEFAULT_TC);
  const [game, setGame] = useState<GameState>(() => initState());
  const [selected, setSelected] = useState<Pos | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Pos; to: Pos } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [endGame, setEndGame] = useState<EndGame | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const [showCrackle, setShowCrackle] = useState(true);
  const [robotEvent, setRobotEvent] = useState<ChessRobotEvent | null>(null);
  const robotSeqRef = useRef(0);

  // Clocks (ms remaining for each color)
  const [whiteMs, setWhiteMs] = useState(DEFAULT_TC.baseMs);
  const [blackMs, setBlackMs] = useState(DEFAULT_TC.baseMs);
  const whiteMsRef = useRef(whiteMs); whiteMsRef.current = whiteMs;
  const blackMsRef = useRef(blackMs); blackMsRef.current = blackMs;

  const gameRef = useRef(game);
  gameRef.current = game;
  const endGameRef = useRef<EndGame | null>(null);
  endGameRef.current = endGame;

  const classifyMove = useCallback((move: Move, san: string): ChessRobotEventType => {
    if (san.endsWith('#')) return 'checkmate';
    if (san.endsWith('+')) return 'check';
    if (move.promotion) return 'promote';
    if (move.captured && (move.captured.t === 'q' || move.captured.t === 'r')) return 'captureBig';
    if (move.castle) return 'castle';
    if (move.captured) return 'capture';
    return 'move';
  }, []);

  const fireRobot = useCallback((type: ChessRobotEventType, by?: 'player' | 'ai', san?: string) => {
    robotSeqRef.current += 1;
    setRobotEvent({ type, by, san, seq: robotSeqRef.current });
  }, []);

  // Vinyl crackle auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => setShowCrackle(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const legalMovesByFrom = useMemo(() => {
    const map = new Map<string, Move[]>();
    if (endGame) return map;
    const moves = generateLegalMoves(game, game.turn);
    for (const m of moves) {
      const key = `${m.from[0]},${m.from[1]}`;
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    }
    return map;
  }, [game, endGame]);

  const legalDestinations: Move[] = useMemo(() => {
    if (!selected) return [];
    return legalMovesByFrom.get(`${selected[0]},${selected[1]}`) || [];
  }, [selected, legalMovesByFrom]);

  const applyMove = useCallback((state: GameState, move: Move): { next: GameState; san: string } => {
    const san = toSAN(state, move);
    const next = cloneState(state);
    makeMove(next, move);
    return { next, san };
  }, []);

  const triggerEffects = useCallback((move: Move) => {
    if (move.captured) {
      setShakeKey(k => k + 1);
      setBursts(b => [...b, { id: Date.now() + Math.random(), r: move.to[0], c: move.to[1] }]);
      // Soft haptic on touch devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate?.(14); } catch { /* no-op */ }
      }
    }
  }, []);

  const evaluateEnd = useCallback((state: GameState): EndGame | null => {
    const moves = generateLegalMoves(state, state.turn);
    if (moves.length > 0) return null;
    if (isInCheck(state, state.turn)) {
      return { type: 'checkmate', winner: state.turn === 'w' ? 'b' : 'w' };
    }
    return { type: 'stalemate' };
  }, []);

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAI = useCallback((state: GameState) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setThinking(true);
    fireRobot('aiThinking');
    aiTimerRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        const current = gameRef.current;
        if (endGameRef.current) { setThinking(false); return; }
        const move = findBestMove(current, AI_DEPTH);
        setThinking(false);
        if (!move) {
          const end = evaluateEnd(current);
          if (end) {
            setEndGame(end);
            if (end.type === 'stalemate') fireRobot('draw');
          }
          return;
        }
        const { next, san } = applyMove(current, move);
        triggerEffects(move);
        setLastMove({ from: move.from, to: move.to });
        setHistory(h => [...h, san]);
        setGame(next);
        // increment for the side that just moved (AI)
        const aiColor = current.turn;
        if (timeControl.incMs > 0) {
          if (aiColor === 'w') setWhiteMs(v => v + timeControl.incMs);
          else setBlackMs(v => v + timeControl.incMs);
        }
        fireRobot(classifyMove(move, san), 'ai', san);
        const end = evaluateEnd(next);
        if (end) {
          setEndGame(end);
          if (end.type === 'stalemate') fireRobot('draw');
        }
      });
    }, AI_DELAY_MS);
  }, [applyMove, evaluateEnd, triggerEffects, fireRobot, classifyMove, timeControl]);

  useEffect(() => () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); }, []);

  /* ─── CLOCK TICK ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (endGame) return;
    // Clock runs for the side to move; ticks at 100ms for smooth sub-second display
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      const turn = gameRef.current.turn;
      if (turn === 'w') {
        const next = whiteMsRef.current - delta;
        whiteMsRef.current = next;
        setWhiteMs(next);
        if (next <= 0) {
          setEndGame({ type: 'timeout', winner: 'b' });
          fireRobot('checkmate', 'ai'); // flag fall: treat as decisive via checkmate category
          clearInterval(id);
        }
      } else {
        const next = blackMsRef.current - delta;
        blackMsRef.current = next;
        setBlackMs(next);
        if (next <= 0) {
          setEndGame({ type: 'timeout', winner: 'w' });
          fireRobot('checkmate', 'player');
          clearInterval(id);
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [endGame, fireRobot]);

  const playerColor: Color = flipped ? 'b' : 'w';

  /* ─── CORE MOVE COMMIT (shared by click + drag) ─────────────────────── */
  const commitPlayerMove = useCallback((move: Move) => {
    if (endGame || thinking) return false;
    const { next, san } = applyMove(game, move);
    triggerEffects(move);
    setLastMove({ from: move.from, to: move.to });
    setHistory(h => [...h, san]);
    setGame(next);
    setSelected(null);
    // Increment for the player (side that just moved) if applicable
    const mover = game.turn;
    if (timeControl.incMs > 0) {
      if (mover === 'w') setWhiteMs(v => v + timeControl.incMs);
      else setBlackMs(v => v + timeControl.incMs);
    }
    fireRobot(classifyMove(move, san), 'player', san);
    const end = evaluateEnd(next);
    if (end) {
      setEndGame(end);
      if (end.type === 'stalemate') fireRobot('draw');
      return true;
    }
    scheduleAI(next);
    return true;
  }, [endGame, thinking, game, applyMove, triggerEffects, fireRobot, classifyMove, evaluateEnd, scheduleAI, timeControl]);

  const onSquareClick = useCallback((r: number, c: number) => {
    if (endGame || thinking) return;
    if (game.turn !== playerColor) return;
    const piece = game.board[r][c];
    if (selected) {
      const move = legalDestinations.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        commitPlayerMove(move);
        return;
      }
    }
    if (piece && piece.c === game.turn) setSelected([r, c]);
    else setSelected(null);
  }, [endGame, thinking, game, selected, legalDestinations, playerColor, commitPlayerMove]);

  /* ─── DRAG-AND-DROP with pointer capture ────────────────────────────── */
  const boardElRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ from: Pos; x: number; y: number; squareSize: number } | null>(null);
  const dragRef = useRef<typeof drag>(null);
  dragRef.current = drag;

  const getSquareFromPoint = useCallback((clientX: number, clientY: number): Pos | null => {
    const el = boardElRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const size = rect.width / 8;
    const col = Math.floor(x / size);
    const row = Math.floor(y / size);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    // Map screen col/row back to board r/c depending on flip
    const r = flipped ? 7 - row : row;
    const c = flipped ? 7 - col : col;
    return [r, c];
  }, [flipped]);

  const startDrag = useCallback((e: React.PointerEvent<HTMLDivElement>, r: number, c: number) => {
    if (endGame || thinking) return;
    if (game.turn !== playerColor) return;
    const piece = game.board[r][c];
    if (!piece || piece.c !== game.turn) return;
    const boardEl = boardElRef.current;
    if (!boardEl) return;
    const rect = boardEl.getBoundingClientRect();
    const size = rect.width / 8;
    setSelected([r, c]);
    setDrag({ from: [r, c], x: e.clientX, y: e.clientY, squareSize: size });
    try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
  }, [endGame, thinking, game, playerColor]);

  const onDragMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : d);
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const target = getSquareFromPoint(e.clientX, e.clientY);
    setDrag(null);
    try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
    if (!target) { setSelected(null); return; }
    // Same square → treat as click select (keep selected for click-to-move)
    if (target[0] === d.from[0] && target[1] === d.from[1]) {
      return;
    }
    const legalForFrom = legalMovesByFrom.get(`${d.from[0]},${d.from[1]}`) || [];
    const move = legalForFrom.find(m => m.to[0] === target[0] && m.to[1] === target[1]);
    if (move) commitPlayerMove(move);
    else {
      // illegal drop — flash the origin square
      setSelected(null);
      setShakeKey(k => k + 1);
    }
  }, [getSquareFromPoint, legalMovesByFrom, commitPlayerMove]);

  /* ─── NEW GAME / FLIP / TC CHANGE ────────────────────────────────────── */
  const resetBoard = useCallback((tc: TimeControl, nextFlipped: boolean) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    const fresh = initState();
    setGame(fresh);
    setSelected(null);
    setLastMove(null);
    setHistory([]);
    setThinking(false);
    setEndGame(null);
    setBursts([]);
    setWhiteMs(tc.baseMs);
    setBlackMs(tc.baseMs);
    whiteMsRef.current = tc.baseMs;
    blackMsRef.current = tc.baseMs;
    setShowCrackle(true);
    setTimeout(() => setShowCrackle(false), 1000);
    fireRobot('newGame');
    if (nextFlipped) scheduleAI(fresh);
  }, [fireRobot, scheduleAI]);

  const newGame = useCallback(() => resetBoard(timeControl, flipped), [resetBoard, timeControl, flipped]);

  const flipBoard = useCallback(() => {
    setFlipped(f => {
      const nf = !f;
      resetBoard(timeControl, nf);
      return nf;
    });
  }, [resetBoard, timeControl]);

  const chooseTimeControl = useCallback((tc: TimeControl) => {
    if (tc.id === timeControl.id) return;
    setTimeControl(tc);
    resetBoard(tc, flipped);
  }, [timeControl, resetBoard, flipped]);

  // clean up old bursts
  useEffect(() => {
    if (bursts.length === 0) return;
    const t = setTimeout(() => setBursts([]), 700);
    return () => clearTimeout(t);
  }, [bursts]);

  const rowsOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colsOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const kingInCheckPos: Pos | null = useMemo(() => {
    if (endGame) return null;
    if (isInCheck(game, game.turn)) return findKing(game.board, game.turn);
    return null;
  }, [game, endGame]);

  const playerIsTop: Color = flipped ? 'w' : 'b';

  return (
    <div className="chess-game chess-game--v2">
      {/* Robot floats above the board */}
      <ChessRobot event={robotEvent} variant="floating" />

      <div className="chess-arena">
        {/* Top clock (opponent-to-player perspective: top shows the side that is visually on top of the board) */}
        <ClockRow
          color={playerIsTop}
          ms={playerIsTop === 'w' ? whiteMs : blackMs}
          active={!endGame && game.turn === playerIsTop}
          position="top"
        />

        {/* BOARD */}
        <div className="chess-board-wrap">
          <div
            className={`chess-board chess-board--v2${shakeKey ? ' chess-shake' : ''}${drag ? ' is-dragging' : ''}`}
            key={shakeKey}
            ref={boardElRef}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {rowsOrder.map((r, rowIdx) => colsOrder.map((c, colIdx) => {
              const isLight = (r + c) % 2 === 0;
              const piece = game.board[r][c];
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const dest = legalDestinations.find(m => m.to[0] === r && m.to[1] === c);
              const isLast = lastMove && ((lastMove.from[0] === r && lastMove.from[1] === c) || (lastMove.to[0] === r && lastMove.to[1] === c));
              const isCheckSq = kingInCheckPos && kingInCheckPos[0] === r && kingInCheckPos[1] === c;
              const isDragOrigin = drag && drag.from[0] === r && drag.from[1] === c;
              const classes = [
                'chess-square',
                'chess-square--v2',
                isLight ? 'chess-square--light' : 'chess-square--dark',
                isSelected ? 'chess-square--selected' : '',
                isLast ? 'chess-square--lastmove' : '',
                isCheckSq ? 'chess-square--check' : '',
              ].filter(Boolean).join(' ');
              return (
                <div
                  key={`${r}-${c}`}
                  className={classes}
                  data-r={r}
                  data-c={c}
                  onClick={() => onSquareClick(r, c)}
                  onPointerDown={piece && piece.c === game.turn ? (e) => startDrag(e, r, c) : undefined}
                  role="button"
                  aria-label={sqName(r, c)}
                >
                  {/* Subtle rank/file markers — purely visual pips, no text */}
                  {rowIdx === (flipped ? 0 : 7) && colIdx === (flipped ? 7 : 0) && (
                    <span className="chess-square__marker chess-square__marker--tl" aria-hidden />
                  )}

                  {piece && (
                    <span
                      className={[
                        'chess-piece',
                        'chess-piece--v2',
                        piece.c === 'w' ? 'chess-piece--w' : 'chess-piece--b',
                        isDragOrigin ? 'chess-piece--ghost' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <ChessPiece type={piece.t} color={piece.c} />
                    </span>
                  )}
                  {dest && (
                    <span className={`chess-move-ring${dest.captured ? ' chess-move-ring--capture' : ''}`} />
                  )}
                  {bursts.filter(b => b.r === r && b.c === c).map(b => (
                    <span key={b.id} className="chess-particle-layer">
                      {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i / 8) * Math.PI * 2;
                        const dist = 48;
                        const dx = Math.cos(angle) * dist;
                        const dy = Math.sin(angle) * dist;
                        return (
                          <span
                            key={i}
                            className="chess-particle"
                            style={{ ['--dx' as string]: `${dx}px`, ['--dy' as string]: `${dy}px` }}
                          />
                        );
                      })}
                    </span>
                  ))}
                </div>
              );
            }))}

            {/* Dragged piece — rendered once, floats with the pointer */}
            {drag && (() => {
              const piece = game.board[drag.from[0]][drag.from[1]];
              if (!piece) return null;
              const el = boardElRef.current;
              const rect = el?.getBoundingClientRect();
              if (!rect) return null;
              const x = drag.x - rect.left;
              const y = drag.y - rect.top;
              return (
                <div
                  className="chess-drag-piece"
                  style={{
                    width: drag.squareSize,
                    height: drag.squareSize,
                    transform: `translate(${x - drag.squareSize / 2}px, ${y - drag.squareSize / 2}px)`,
                  }}
                >
                  <ChessPiece type={piece.t} color={piece.c} />
                </div>
              );
            })()}

            {showCrackle && <div className="chess-crackle" aria-hidden />}

            {endGame && (
              <div className="chess-gameover" role="alert">
                <div className="chess-gameover__title">
                  {endGame.type === 'checkmate' ? (endGame.winner === 'w' ? 'CHECKMATE — WHITE' : 'CHECKMATE — BLACK')
                    : endGame.type === 'timeout' ? (endGame.winner === 'w' ? 'TIME — WHITE' : 'TIME — BLACK')
                    : 'STALEMATE'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom clock + time control chooser + control buttons */}
        <ClockRow
          color={playerColor}
          ms={playerColor === 'w' ? whiteMs : blackMs}
          active={!endGame && game.turn === playerColor}
          position="bottom"
        />

        <div className="chess-controls chess-controls--v2">
          <div className="chess-tc-group" role="radiogroup" aria-label="Time control">
            {TIME_CONTROLS.map(tc => (
              <button
                key={tc.id}
                type="button"
                role="radio"
                aria-checked={timeControl.id === tc.id}
                className={`chess-tc-chip${timeControl.id === tc.id ? ' is-active' : ''}`}
                onClick={() => chooseTimeControl(tc)}
                title={`${tc.short} minute${tc.incMs > 0 ? ' with increment' : ''}`}
              >
                <span className="chess-tc-chip__main">{tc.short}</span>
                <span className="chess-tc-chip__unit" aria-hidden>min</span>
              </button>
            ))}
          </div>
          <div className="chess-control-group">
            <button className="chess-icon-btn" onClick={newGame} type="button" aria-label="New game" title="New game">
              <IconNew />
            </button>
            <button className="chess-icon-btn" onClick={flipBoard} type="button" aria-label="Flip board" title="Flip board">
              <IconFlip />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Clock row with flag-fall animation ─────────────────────────────── */
function ClockRow({
  color,
  ms,
  active,
  position,
}: {
  color: Color;
  ms: number;
  active: boolean;
  position: 'top' | 'bottom';
}) {
  const lowTime = ms < 30_000;
  const critical = ms < 10_000;
  return (
    <div
      className={[
        'chess-clock-row',
        `chess-clock-row--${position}`,
        `chess-clock-row--${color === 'w' ? 'white' : 'black'}`,
        active ? 'is-active' : '',
        lowTime ? 'is-low' : '',
        critical ? 'is-critical' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className="chess-clock-row__dot" aria-hidden />
      <span className="chess-clock-row__time" aria-live={critical ? 'polite' : undefined}>
        {formatClock(ms)}
      </span>
    </div>
  );
}
