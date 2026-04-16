import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage, T } from '@/contexts/LanguageContext';
import ChessRobot, { type ChessRobotEvent, type ChessRobotEventType } from '@/components/ChessRobot';

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
  // pawn
  const pdir = byColor === 'w' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const nr = r + pdir, nc = c + dc;
    if (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.c === byColor && p.t === 'p') return true;
    }
  }
  // knight
  for (const [dr, dc] of KNIGHT_D) {
    const nr = r + dr, nc = c + dc;
    if (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.c === byColor && p.t === 'n') return true;
    }
  }
  // king
  for (const [dr, dc] of KING_D) {
    const nr = r + dr, nc = c + dc;
    if (inside(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.c === byColor && p.t === 'k') return true;
    }
  }
  // rook/queen (orthogonal)
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
  // bishop/queen (diagonal)
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

/* ─── Pseudo-legal move generation ───────────────────────────────────────── */
function genPawn(state: GameState, r: number, c: number, p: Piece, out: Move[]) {
  const b = state.board;
  const dir = p.c === 'w' ? -1 : 1;
  const startRow = p.c === 'w' ? 6 : 1;
  const promoRow = p.c === 'w' ? 0 : 7;

  // forward 1
  const fr = r + dir;
  if (inside(fr, c) && !b[fr][c]) {
    if (fr === promoRow) {
      out.push({ from: [r, c], to: [fr, c], piece: p, promotion: 'q' });
    } else {
      out.push({ from: [r, c], to: [fr, c], piece: p });
      // forward 2 from start
      if (r === startRow && !b[r + 2 * dir][c]) {
        out.push({ from: [r, c], to: [r + 2 * dir, c], piece: p });
      }
    }
  }
  // captures + en passant
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

/* ─── Make / Unmake ──────────────────────────────────────────────────────── */
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
  // castling: slide the rook
  if (m.castle === 'K') { b[7][5] = b[7][7]; b[7][7] = null; }
  else if (m.castle === 'Q') { b[7][3] = b[7][0]; b[7][0] = null; }
  else if (m.castle === 'k') { b[0][5] = b[0][7]; b[0][7] = null; }
  else if (m.castle === 'q') { b[0][3] = b[0][0]; b[0][0] = null; }

  // update castling rights
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

  // en passant target
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

/* ─── Evaluation + Minimax α-β (depth 3) ─────────────────────────────────── */
const VAL: Record<PieceType, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// PST from White's perspective: row 0 = rank 8 (top), row 7 = rank 1 (white's back rank)
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

/* ─── Standard Algebraic Notation ────────────────────────────────────────── */
const FILES = 'abcdefgh';
function sqName(r: number, c: number): string { return FILES[c] + (8 - r); }

function toSAN(state: GameState, move: Move): string {
  // Build SAN on a pre-move clone so the generated legal moves reflect the pre-move position.
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
    // disambiguation
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
   REACT COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

/* Use the filled glyphs for BOTH colors; differentiation is handled
   through CSS fill + outline. Outlined Unicode chess glyphs render
   inconsistently across fonts and are easily confused with filled ones. */
const GLYPHS: Record<PieceType, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
};

interface EndGame {
  type: 'checkmate' | 'stalemate';
  winner?: Color;
}

interface ParticleBurst { id: number; r: number; c: number; }

const AI_DEPTH = 3;
const AI_DELAY_MS = 300;

export default function ChessGame() {
  const { lang } = useLanguage();
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

  const gameRef = useRef(game);
  gameRef.current = game;

  /* Classify a played move into a ChessRobotEventType, by priority.
     Order: checkmate > check > promote > captureBig > castle > capture > move */
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

  // vinyl crackle auto-remove after 1s
  useEffect(() => {
    const t = setTimeout(() => setShowCrackle(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // Legal moves from the selected square (pre-computed for the current turn)
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
      // rAF so the 'thinking' paint lands before synchronous search
      requestAnimationFrame(() => {
        const current = gameRef.current;
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
        fireRobot(classifyMove(move, san), 'ai', san);
        const end = evaluateEnd(next);
        if (end) {
          setEndGame(end);
          if (end.type === 'stalemate') fireRobot('draw');
        }
      });
    }, AI_DELAY_MS);
  }, [applyMove, evaluateEnd, triggerEffects, fireRobot, classifyMove]);

  useEffect(() => () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); }, []);

  const playerColor: Color = flipped ? 'b' : 'w';

  const onSquareClick = useCallback((r: number, c: number) => {
    if (endGame || thinking) return;
    if (game.turn !== playerColor) return; // only allow input on player's turn

    const piece = game.board[r][c];

    // if clicking a legal destination for the current selection → move
    if (selected) {
      const move = legalDestinations.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        const { next, san } = applyMove(game, move);
        triggerEffects(move);
        setLastMove({ from: move.from, to: move.to });
        setHistory(h => [...h, san]);
        setGame(next);
        setSelected(null);
        fireRobot(classifyMove(move, san), 'player', san);
        const end = evaluateEnd(next);
        if (end) {
          setEndGame(end);
          if (end.type === 'stalemate') fireRobot('draw');
          return;
        }
        scheduleAI(next);
        return;
      }
    }

    // otherwise, select own piece if present
    if (piece && piece.c === game.turn) {
      setSelected([r, c]);
    } else {
      setSelected(null);
    }
  }, [endGame, thinking, game, selected, legalDestinations, applyMove, evaluateEnd, scheduleAI, triggerEffects, playerColor, fireRobot, classifyMove]);

  const newGame = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    const fresh = initState();
    setGame(fresh);
    setSelected(null);
    setLastMove(null);
    setHistory([]);
    setThinking(false);
    setEndGame(null);
    setBursts([]);
    setShowCrackle(true);
    setTimeout(() => setShowCrackle(false), 1000);
    fireRobot('newGame');
    // If player is black, AI (white) opens
    if (flipped) scheduleAI(fresh);
  }, [flipped, scheduleAI, fireRobot]);

  const flipBoard = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    const fresh = initState();
    setFlipped(f => {
      const nextFlipped = !f;
      setGame(fresh);
      setSelected(null);
      setLastMove(null);
      setHistory([]);
      setThinking(false);
      setEndGame(null);
      setBursts([]);
      fireRobot('newGame');
      // If the player just chose black, white (AI) must move first
      if (nextFlipped) scheduleAI(fresh);
      return nextFlipped;
    });
  }, [scheduleAI, fireRobot]);

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

  const historyPaired = useMemo(() => {
    const rows: Array<{ n: number; w?: string; b?: string }> = [];
    for (let i = 0; i < history.length; i += 2) {
      rows.push({ n: i / 2 + 1, w: history[i], b: history[i + 1] });
    }
    return rows;
  }, [history]);

  const statusText = (() => {
    if (endGame) {
      if (endGame.type === 'checkmate') {
        return endGame.winner === 'w'
          ? (lang === 'bg' ? 'БЕЛИТЕ ПЕЧЕЛЯТ' : 'WHITE WINS')
          : (lang === 'bg' ? 'ЧЕРНИТЕ ПЕЧЕЛЯТ' : 'BLACK WINS');
      }
      return lang === 'bg' ? 'РАВЕНСТВО — ПАТ' : 'DRAW — STALEMATE';
    }
    if (thinking) return lang === 'bg' ? 'AI МИСЛИ…' : 'AI THINKING…';
    if (game.turn === 'w') return lang === 'bg' ? 'ХОД НА БЕЛИТЕ' : 'WHITE TO MOVE';
    return lang === 'bg' ? 'ХОД НА ЧЕРНИТЕ' : 'BLACK TO MOVE';
  })();

  return (
    <div className="chess-game">
      <div className="chess-game__header">
        <span className="label chess-game__eyebrow">
          <T en="/ CHESS" bg="/ ШАХ" />
        </span>
        <h2 className="chess-game__title">
          <T en="CAN YOU BEAT ME?" bg="МОЖЕШ ЛИ ДА МЕ ПОБЕДИШ?" />
        </h2>
        <div className="chess-game__subtitle">
          <T en="White to move." bg="Белите са на ход." />
        </div>
      </div>

      <div className="chess-game__layout">
        <div className="chess-board-wrap">
          <div className="chess-board-frame">
            <div className="chess-ranks" aria-hidden>
              {rowsOrder.map(r => (
                <span key={r} className="chess-rank-label">{8 - r}</span>
              ))}
            </div>
            <div className="chess-board-stage">
              <div className={`chess-board${shakeKey ? ' chess-shake' : ''}`} key={shakeKey}>
            {rowsOrder.map(r => colsOrder.map(c => {
              const isLight = (r + c) % 2 === 0;
              const piece = game.board[r][c];
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const dest = legalDestinations.find(m => m.to[0] === r && m.to[1] === c);
              const isLast = lastMove && ((lastMove.from[0] === r && lastMove.from[1] === c) || (lastMove.to[0] === r && lastMove.to[1] === c));
              const isCheckSq = kingInCheckPos && kingInCheckPos[0] === r && kingInCheckPos[1] === c;
              const classes = [
                'chess-square',
                isLight ? 'chess-square--light' : 'chess-square--dark',
                isSelected ? 'chess-square--selected' : '',
                isLast ? 'chess-square--lastmove' : '',
                isCheckSq ? 'chess-square--check' : '',
              ].filter(Boolean).join(' ');
              return (
                <div
                  key={`${r}-${c}`}
                  className={classes}
                  onClick={() => onSquareClick(r, c)}
                  role="button"
                  aria-label={sqName(r, c)}
                >
                  {piece && (
                    <span
                      className={[
                        'chess-piece',
                        piece.c === 'w' ? 'chess-piece--w' : 'chess-piece--b',
                        piece.c === 'w' && piece.t === 'k' ? 'chess-piece--white-king' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {GLYPHS[piece.t]}
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
                            style={{ ['--dx' as any]: `${dx}px`, ['--dy' as any]: `${dy}px` }}
                          />
                        );
                      })}
                    </span>
                  ))}
                </div>
              );
            }))}
            {showCrackle && <div className="chess-crackle" aria-hidden />}
            {endGame && (
              <div className="chess-gameover" role="alert">
                <div className="chess-gameover__title">GAME OVER</div>
                <div className="chess-gameover__sub">
                  {endGame.type === 'checkmate'
                    ? (endGame.winner === 'w' ? 'CHECKMATE — WHITE' : 'CHECKMATE — BLACK')
                    : 'STALEMATE'}
                </div>
              </div>
            )}
              </div>
              <div className="chess-files" aria-hidden>
                {colsOrder.map(c => (
                  <span key={c} className="chess-file-label">{FILES[c]}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={`chess-status${thinking ? ' chess-status--thinking' : ''}`}>
            {statusText}
          </div>

          <div className="chess-controls">
            <button className="chess-btn" onClick={newGame} type="button">
              <T en="New Game" bg="Нова игра" />
            </button>
            <button className="chess-btn" onClick={flipBoard} type="button">
              <T en="Flip Board" bg="Обърни дъската" />
            </button>
          </div>

          <div className="chess-caption">
            <T
              en="“Every game is a strategy. Every move — intentional.”"
              bg="„Всяка игра е стратегия. Всеки ход — обмислен.“"
            />
          </div>
        </div>

        <div className="chess-game__side">
          <ChessRobot event={robotEvent} />
          <div className="chess-history" aria-label="Move history">
            <div className="chess-history__title">
              <span><T en="MOVES" bg="ХОДОВЕ" /></span>
              <span>{history.length}</span>
            </div>
            {historyPaired.length === 0 ? (
              <div className="chess-history__empty">
                <T en="No moves yet." bg="Все още няма ходове." />
              </div>
            ) : (
              historyPaired.map((row, i) => {
                const isLastRow = i === historyPaired.length - 1;
                return (
                  <div key={row.n} className="chess-history__row">
                    <span className="chess-history__num">{row.n}.</span>
                    <span className={`chess-history__cell${isLastRow && !row.b ? ' chess-history__cell--active' : ''}`}>{row.w || ''}</span>
                    <span className={`chess-history__cell${isLastRow && row.b ? ' chess-history__cell--active' : ''}`}>{row.b || ''}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
