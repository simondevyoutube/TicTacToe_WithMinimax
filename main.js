console.log('JavaScript Beginner Projects: Tic Tac Toe!');

window.addEventListener('DOMContentLoaded', () => {
  _Setup();
});

const BOARD_STATE = {
  player: 1,
  ai: 2,
  blank: 3,
  draw: 4,
};

let _GAMESTATE = null;

function _Setup() {
  _CreateBoard();
  _InitializeState();
}

function _CreateBoard() {
  const rows = document.getElementById('rows');
  for (let x = 0; x < 3; x++) {
    const curRow = document.createElement('div');
    curRow.id = 'row' + x;
    curRow.className = 'row';
    rows.appendChild(curRow);

    for (let y = 0; y < 3; y++) {
      const node = document.createElement('img');
      node.className = 'square';
      node.id = x + '.' + y;
      node.onclick = _HandlePlayerClick;
      curRow.appendChild(node);
    }
  }
}

function _InitializeState() {
  _GAMESTATE = {
    turn: 'player',
    active: true,
  };
}

function _HandlePlayerClick(evt) {
  const isBlank = !evt.target.src.length;
  if (isBlank &&
      _GAMESTATE.active &&
      _GAMESTATE.turn == 'player') {
    evt.target.src = 'x.png';
    _CheckGameOver();
    _AISelectMove();
  }
}

function _CheckGameOver() {
  const winner = _EvaluateBoard(_GetBoardStates());
  if (winner == null) {
    return;
  }

  _GAMESTATE.active = false;

  let desc = '';

  if (winner == BOARD_STATE.ai) {
    desc = 'You lose!';
  } else if (winner == BOARD_STATE.player) {
    desc = 'You win!';
  } else {
    desc = 'Tie game, try again.'
  }

  document.getElementById('description').innerText = desc;
}

function _GetBoardStates() {
  const boardStates = [];
  for (let x = 0; x < 3; x++) {
    const row = [];
    for (let y = 0; y < 3; y++) {
      const node = document.getElementById(x + '.' + y);
      if (node.src.includes('x.png')) {
        row.push(BOARD_STATE.player);
      } else if (node.src.includes('o.png')) {
        row.push(BOARD_STATE.ai);
      } else {
        row.push(BOARD_STATE.blank);
      }
    }
    boardStates.push(row);
  }
  return boardStates;
}

function _GetSquareElementNodes() {
  const nodes = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      nodes.push(document.getElementById(x + '.' + y))
    }
  }
  return nodes;
}

function _HighlightSquares(blinks) {
  if (blinks === undefined) {
    blinks = 10;
  }

  const nodes = _GetSquareElementNodes();
  for (const n of nodes) {
    n.className = 'square';
  }
  if (blinks >= 0) {
    setTimeout(() => {
      _AISelectMove(blinks - 1);
    }, 100);
    const x = Math.floor(Math.random() * 3);
    const y = Math.floor(Math.random() * 3);
    const node = document.getElementById(x + '.' + y);
    node.className = 'square highlight';
    return true;
  }
  return false;
}

function _AISelectMove(blinks) {
  _GAMESTATE.turn = 'ai';

  if (_HighlightSquares(blinks)) {
    return;
  }

  const boardStates = _GetBoardStates();
  const [_, choice] = _Minimax(boardStates, BOARD_STATE.ai);

  if (choice != null) {
    const [x, y] = choice;
    document.getElementById(x + '.' + y).src = 'o.png';
  }

  _CheckGameOver();

  _GAMESTATE.turn = 'player';
}

function _EvaluateBoard(boardStates) {
  const winningStates = [
    // Horizontals
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],

    // Diagonals
    [[0, 0], [1, 1], [2, 2]],
    [[2, 0], [1, 1], [0, 2]],
  ];

  for (const possibleState of winningStates) {
    let curPlayer = null;
    let isWinner = true;
    for (const [x, y] of possibleState) {
      const occupant = boardStates[x][y];
      if (curPlayer == null && occupant != BOARD_STATE.blank) {
        curPlayer = occupant;
      } else if (curPlayer != occupant) {
        isWinner = false;
      }
    }
    if (isWinner) {
      return curPlayer;
    }
  }

  let hasMoves = false;
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (boardStates[x][y] == BOARD_STATE.blank) {
        hasMoves = true;
      }
    }
  }
  if (!hasMoves) {
    return BOARD_STATE.draw;
  }

  return null;
}

function _Minimax(boardStates, player) {
  // First check if the game has already been won.
  const winner = _EvaluateBoard(boardStates);
  if (winner == BOARD_STATE.ai) {
    return [1, null];
  } else if (winner == BOARD_STATE.player) {
    return [-1, null];
  }

  let move, moveScore;
  if (player == BOARD_STATE.ai) {
    [moveScore, move] = _Minimax_Maximize(boardStates);
  } else {
    [moveScore, move] = _Minimax_Minimize(boardStates);
  }

  if (move == null) {
    moveScore = 0;
  }

  // No move, so it's a draw
  return [moveScore, move];
}

function _Minimax_Maximize(boardStates) {
  let moveScore = Number.NEGATIVE_INFINITY;
  let move = null;

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (boardStates[x][y] == BOARD_STATE.blank) {
        const newBoardStates = boardStates.map(r => r.slice());

        newBoardStates[x][y] = BOARD_STATE.ai;

        const [newMoveScore, _] =  _Minimax(
            newBoardStates, BOARD_STATE.player);

        if (newMoveScore > moveScore) {
          move = [x, y];
          moveScore = newMoveScore;
        }
      }
    }
  }

  return [moveScore, move];
}

function _Minimax_Minimize(boardStates) {
  let moveScore = Number.POSITIVE_INFINITY;
  let move = null;

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (boardStates[x][y] == BOARD_STATE.blank) {
        const newBoardStates = boardStates.map(r => r.slice());

        newBoardStates[x][y] = BOARD_STATE.player;

        const [newMoveScore, _] =  _Minimax(
            newBoardStates, BOARD_STATE.ai);

        if (newMoveScore < moveScore) {
          move = [x, y];
          moveScore = newMoveScore;
        }
      }
    }
  }

  return [moveScore, move];
}


function _Minimax2(boardStates, aiTurn) {
  // First check if the game has already been won.
  const winner = _EvaluateBoard(boardStates);
  if (winner == BOARD_STATE.ai) {
    return [1, null];
  } else if (winner == BOARD_STATE.player) {
    return [-1, null];
  }

  let moveCost = Number.NEGATIVE_INFINITY;
  if (!aiTurn) {
    moveCost = Number.POSITIVE_INFINITY;
  }
  let move = null;

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (boardStates[x][y] == BOARD_STATE.blank) {
        const newBoardStates = boardStates.map(r => r.slice());

        if (aiTurn) {
          newBoardStates[x][y] = BOARD_STATE.ai;
        } else {
          newBoardStates[x][y] = BOARD_STATE.player;
        }

        const [newMoveCost, _] =  _Minimax(newBoardStates, !aiTurn);

        if (aiTurn) {
          if (newMoveCost > moveCost) {
            move = [x, y];
            moveCost = newMoveCost;
          }
        } else {
          if (newMoveCost < moveCost) {
            move = [x, y];
            moveCost = newMoveCost;
          }
        }
      }
    }
  }

  if (move != null) {
    return [moveCost, move];
  }

  // No move, so it's a draw
  return [0, null];
}
