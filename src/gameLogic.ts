type Board = string[][];

interface BoardDelta {
  row: number;
  col: number;
  delDirRow: number;
  delDirCol: number;
  delDis: number;
}

interface IPosition {
  row: number;
  col: number;
}

interface IRowColComment extends BoardDelta {
  comment: string;
}

interface IState {
  board: Board;
  delta: BoardDelta;
}

interface IExampleMove extends IIsMoveOk {
  comment: IComment;
}

interface IComment {
  en: string;
}

module gameLogic {
/*
 * Grid representation:
 *
 *     0 1 2 3 4 5 6 7 8 9
 *   0 x x x x x
 *   1 x x x x x x
 *   2 x x x x x x x
 *   3 x x x x x x x x
 *   4 x x x x x x x x x
 *   5 x x x x x x x x x x
 *   6   x x x x x x x x x
 *   7     x x x x x x x x
 *   8       x x x x x x x
 *   9         x x x x x x
 *  10           x x x x x
 */

/* Grid representation:
 *
 *     0 1 2 3 4 5 6 7 8 9
 *   0       x x x
 *   1   x x x x x x x
 *   2 x x x x x x x x x
 *   3 x x x x x x x x x
 *   4 x x x x x x x x x
 *   5 x x x x x x x x x
 *   6 x x x x x x x x x
 *   7     x x x x x
 *   8         x
 *   9
 *  10
 */

  //the number of consecutive pawns to win
  var N = 5;
  //the boundary of horizontal direction
  var horIndex = [[0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
                  [1, 10], [2, 10], [3, 10], [4, 10], [5, 10]];
  //the boundary of vertical direction
  var verIndex = [[0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
                  [1, 11], [2, 11], [3, 11], [4, 11], [5, 11]];
  //the boundary of diagonal direction
  // starting point from NW side, end at row==10 or col==9
  var tilIndex = [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0],
                  [2, 0], [3, 0], [4, 0], [5, 0]];

  var PlayersNum = 2;

  function isEqual(object1: any, object2: any) {
    return JSON.stringify(object1) === JSON.stringify(object2);
  }

  function copyObject(object: any) {
    return JSON.parse(JSON.stringify(object));
  }

  export function getHorIndex(row: number, col: number): number {
    return horIndex[row][col];
  }

  export function getWinner(board: Board) {
    //check left to right
    for (var i=0; i<11; ++i) {
      var cnt = 0;
      for (var j=horIndex[i][0]; j<horIndex[i][1]; ++j){
        if (board[i][j] !== ''){
          if (j===0 || board[i][j-1] === board[i][j]){
            cnt++;
          } else {
            cnt = 1;
          }

          if ( cnt === N ){
            return board[i][j];
          }
        }
      }
    }

    //check NE<->SW
    for (var j=0; j<10; ++j){
      var cnt = 0;
      for (var i=verIndex[j][0]; i<verIndex[j][1]; ++i){
        if (board[i][j] !== ''){
          if (i===0 || board[i-1][j] === board[i][j]){
            cnt++;
          } else {
            cnt = 1;
          }
          if (cnt === N){
            return board[i][j];
          }
        }
      }
    }

    var row: number, col: number;
    //check NW<->SE
    for (var i=0; i<10; ++i) {
      var cnt = 0;
      for (row = tilIndex[i][0], col = tilIndex[i][1]; row<11 && col<10; row++, col++){
        if (board[row][col] !== ''){
          if (row === 0 || col===0 || board[row][col]===board[row-1][col-1]){
            cnt++;
          } else {
            cnt = 1;
          }
          if (cnt === N){
            return board[row][col];
          }
        }
      }
    }
    return '';
  }

  function isInsideBoard(row: number, col: number): boolean {
    return (row>=0 && row<=10) && (horIndex[row][0] <= col) && (col < horIndex[row][1]);
  }

  /** Returns true if the game ended in a tie because there are no empty cells. */
  function isTie(board: Board): boolean {
    for (var i=0; i<11; ++i) {
      for (var j=horIndex[i][0]; j<horIndex[i][1]; ++j){
        if (board[i][j] === ''){
          return false;
        }
      }
    }
    return true;
  }//Done

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
   export function createMove(board: Board, row: number, col: number, delDirRow: number,
               delDirCol: number, delDis: number, turnIndexBeforeMove: number): IMove {
    if (board === undefined) board = setBoard();
    if (board[row][col] !== '') {
        throw new Error("One can only make a move in an empty position!");
      }
    var boardAfterMove = copyObject(board);
    // first one should be Red
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'Y';
    //remove one of the opponent's pawn
    if (delDis !== 0) {
      boardAfterMove[row+delDirRow*delDis][col+delDirCol*delDis] = '';
    }

    var winner = getWinner(boardAfterMove);
    var firstOperation = {};
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
        //console.log("Game over");
        //gameOver = true;
      firstOperation = {endMatch: {endMatchScores:
        (winner === 'R' ? [1, 0] : (winner === 'Y' ? [0, 1] : [0, 0]))}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }
    return [firstOperation,
         {set: {key: 'board', value: boardAfterMove}},
         {set: {key: 'delta', value: {row: row, col: col, delDirRow: delDirRow, delDirCol: delDirCol, delDis: delDis}}}];
  }//done

  export function isMoveOk(params: IIsMoveOk) {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove: IState = params.stateBeforeMove;

    try {
      var deltaValue = move[2].set.value;
      console.log("isMoveOk[0-0-1] move[2]=" + JSON.stringify(move[2]));
      console.log("isMoveOk[0-0-1] deltaValue=" + JSON.stringify(deltaValue));

      console.log("isMoveOk[0-0-2]");
      var row = deltaValue.row;
      var col = deltaValue.col;
      // the row direction of the pawn that's going to be removed relative to row
      // i.e. direction of (removedRow - row)
      var delDirRow = deltaValue.delDirRow;
      // the column direction of the pawn that's going to be removed relative to col
      // i.e. direction of (removedColumn - column)
      var delDirCol = deltaValue.delDirCol;
      // the distance of the pawn that's going to be removed relative to row/column
      // i.e. abs(removedRow - row + removedCol - col)
      var delDis = deltaValue.delDis;
      var board = stateBeforeMove['board'];
      var delta = stateBeforeMove['delta'];
      var delDisBeforeMove = -1;
      if (delta){
        delDisBeforeMove = delta.delDis;
      }

      if (board === undefined) {
        // Initially (at the beginning of the match), stateBeforeMove is {}.
        board = setBoard();
      }

      // One can't place at a position that was taken at last move.
      if(delDis!==0 && delDisBeforeMove !== 0 && delDirRow === row && delDirCol === col) {
        return false;
      }
      // Only when the opponents pawn is trapped can be removed.
      if(delDis !== 0){
        if(delDis > 2 || delDis < 0){
          return false;
        }
        if(row+3*delDirRow < 0 || col+3*delDirCol < 0){
          return false;
        }
        if(board[row+delDirRow][col+delDirCol] !== (turnIndexBeforeMove===0?'Y':'R') ){
          return false;
        }
        if(board[row+2*delDirRow][col+2*delDirCol] !== (turnIndexBeforeMove===0?'Y':'R') ){
          return false;
        }
        if(board[row+3*delDirRow][col+3*delDirCol] !== (turnIndexBeforeMove===0?'R':'Y') ){
          return false;
        }
      }
      var expectedMove = createMove(board, row, col, delDirRow, delDirCol, delDis, turnIndexBeforeMove);
      if (!isEqual(move, expectedMove)) {
        return false;
      }
      if(row<0 || row > 10) return false;
      if(horIndex[row][0] > col || horIndex[row][1] <= col){
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }

  /** Returns an array of {stateBeforeMove, move, comment}. */
  function getExampleMoves(initialTurnIndex: number, initialState: IState,
          arrayOfRowColComment: IRowColComment[]): IExampleMove[] {
    var exampleMoves : IExampleMove[] = [];
    var state: IState = initialState;
    var turnIndex = initialTurnIndex;
    for (var i = 0; i < arrayOfRowColComment.length; i++) {
      var rowColComment = arrayOfRowColComment[i];
      var move = createMove(state.board, rowColComment.row, rowColComment.col,
        rowColComment.delDirRow, rowColComment.delDirCol, rowColComment.delDis, turnIndex);
      var stateAfterMove = {board : move[1].set.value, delta: move[2].set.value};
      exampleMoves.push({
        move: move,
        turnIndexBeforeMove: turnIndex,
        turnIndexAfterMove: 1 - turnIndex,
        stateBeforeMove: state,
        stateAfterMove: stateAfterMove,
        numberOfPlayers: PlayersNum,
        comment: {en: rowColComment.comment}});

      state = stateAfterMove;
      turnIndex = 1 - turnIndex;
    }
    return exampleMoves;
  }

  export function getExampleGame(): IExampleMove[] {
    return getExampleMoves(0, null, [
      {row: 5, col: 5, delDirRow:0, delDirCol:0, delDis:0,  comment: "R put at middle of the board"},
      {row: 5, col: 6, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y put next to it(trying to block it)"},
      {row: 4, col: 5, delDirRow:0, delDirCol:0, delDis:0,  comment: "R put one on it's neighbor to form two in a row"},
      {row: 3, col: 5, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y tries to block one side of R"},
      {row: 4, col: 6, delDirRow:0, delDirCol:0, delDis:0,  comment: "R forms another line on another direction"},
      {row: 3, col: 7, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y blocks one side of R's new line"},
      {row: 6, col: 4, delDirRow:0, delDirCol:0, delDis:0,  comment: "R extends the line by adding one on the other direction"},
      {row: 7, col: 3, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y blocks the other direction as well"}
    ]);
  }

  export function getRiddles() {
    var board = setBoard();
    board[5][3] = 'R';
    board[5][4] = 'R';
    board[5][5] = 'R';

    board[6][7] = 'Y';
    board[6][3] = 'Y';
    board[1][3] = 'Y';
    board[4][4] = 'Y';

    return [
      getExampleMoves(0,
        {
          board:board,
          delta: {row: 4, col: 4, delDirRow:0, delDirCol:0, delDis:0}
        },
        [
        {row: 5, col: 6, delDirRow:0, delDirCol:0, delDis:0, comment: "Find the position for R where he could win in his next turn at either side of a 4-in-a-row line"},
        {row: 5, col: 7, delDirRow:0, delDirCol:0, delDis:0, comment: "Y played at the right end"},
        {row: 5, col: 2, delDirRow:0, delDirCol:0, delDis:0, comment: "R wins by having three R at the right side of the line."}
      ])]

  }

  export function setBoard(){
    var board = new Array(11);
    for (var i=0; i<11; ++i){
      board[i] = new Array(10);
      for (var j=horIndex[i][0]; j<horIndex[i][1]; ++j){
        board[i][j] = '';
      }
    }
    console.log("board" + board);
    return board;
  }

  /**
  * Returns the move that the computer player should do for the given board.
  * The computer will play in a random empty cell in the board.
  */
  export function createComputerMove(board: Board, turnIndexBeforeMove: number): IMove {
      var possibleMoves: IMove[] = [];
      for (var i = 0; i < 11; i++) {
        for (var j = horIndex[i][0]; j < horIndex[i][1]; j++) {
          try {
            possibleMoves.push(createMove(board, i, j,0, 0,0, turnIndexBeforeMove));
          } catch (e) {
            // The cell in that position was full.
          }
        }
      }
      var randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      console.log("random move is: ", randomMove[2].set.value.row, randomMove[2].set.value.col);
      return randomMove;
  }
}
