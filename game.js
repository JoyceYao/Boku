'use strict';
angular.module('myApp',['ngTouch']).controller('Ctrl',['$window', '$scope', '$log','$timeout',
    'gameService', 'hexagon','dragAndDropService', 'resizeGameAreaService', function (
      $window, $scope, $log,$timeout,
      gameService, hexagon, dragAndDropService, resizeGameAreaService) {
    //setting up canvas

    resizeGameAreaService.setWidthToHeight(1);



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
        var gameOver = false;

    //var ctrl = this;
    console.log("b4");
    $scope.board = setBoard();
    //$scope.winner = winner;
    console.log("after");
    hexagon.HexagonGrid("HexCanvas", 50);
    //hexagon.drawHexGrid(gameLogic.horIndex, 30, 30, false, $scope.board);
    //var isLocalTesting = $window.parent === $window;
    //var moveAudio = new Audio('audio/small_gun.mp3');
    //moveAudio.load();
    function updateUI(params) {
      $scope.board = params.stateAfterMove.board;
      $scope.delta = params.stateAfterMove.delta;
      if ($scope.board === undefined) {
        $scope.board = setBoard();
      }
      else{
        //moveAudio.play();
      }
      hexagon.drawHexGrid(horIndex, 30, 30, false, $scope.board);

        console.log("board" + $scope.board);
      
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;
      // Is it the computer's turn?
      hexagon.turn = params.yourPlayerIndex;
      if ($scope.isYourTurn
          && params.playersInfo[params.yourPlayerIndex].playerId === '') {
        // Wait 500 milliseconds until animation ends.
        $timeout(sendComputerMove, 500);
      }
    }

    function sendMakeMove(move) {
      $log.info(["Making move:", move]);
      gameService.makeMove(move);
    }
    function sendComputerMove() {
      var move = createComputerMove($scope.board, $scope.turnIndex);
      gameService.makeMove(move);

      hexagon.column = move[2].set.value.col - move[2].set.value.row + 5;
      hexagon.row = parseInt((-4+hexagon.column+2*move[2].set.value.row)/2, 10);

    }
    // Before getting any updateUI message, we show an empty board to a viewer (so you can't perform moves).
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
    
    //$scope.cellClicked = function (e) {
    //    //if not my turn, do nothing
    //    console.log("x,y", e);
    //    if (!$scope.isYourTurn) {
    //        return;
    //    }
    //    //e = e.changedTouches[0];
    //    console.log("changed x" + e.clientX - gameArea.offsetLeft);
    //
    //    var position = getRowCol(e.clientX, e.clientY);
    //    tryMakeMove(position.x, position.y);
    //    //tryMakeMove(row, col);
    //}
      //var position = getRowCol(e.clientX, e.clientY);
      //tryMakeMove(position.x, position.y);


    var gameArea = document.getElementById("gameArea");
        var draggingLines = document.getElementById("draggingLines");
        var horizontalDraggingLine = document.getElementById("horizontalDraggingLine");
        var verticalDraggingLine = document.getElementById("verticalDraggingLine");
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    //var draggingPiece = null;
    var nextZIndex = 61;
    var oldrow = null;
    var oldcol = null;
    //window.handleDragEvent = handleDragEvent;
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
    function handleDragEvent(type, clientX, clientY) {
        // Center point in gameArea
        //var x = clientX - gameArea.offsetLeft;
        //var y = clientY - gameArea.offsetTop;
        //$log.info("winnder is "+gameLogic.getWinner($scope.board));
        //$log.info(gameLogic.gameOver);
        if (getWinner($scope.board) !== '') return;
        var row = getRowCol(clientX, clientY).x;
        var col = getRowCol(clientX, clientY).y;


        draggingLines.style.display = "inline";
        var w = $window.innerWidth;
        var h = $window.innerHeight;
        var x = clientX;
        var y = clientY;
        if (w > h)
        x = x - (w / 2 - h / 2);
        else y = y - (h / 2 - w / 2);
        if (row !== - 1 && col !== -1) {
            verticalDraggingLine.setAttribute("x1", x);
            verticalDraggingLine.setAttribute("x2", x);
            horizontalDraggingLine.setAttribute("y1", y);
            horizontalDraggingLine.setAttribute("y2", y);
        }




           // if (type !== "touchend" && type !=="touchcancel" && type !=="touchleave") {
        if (type === "touchstart" || type === "touchmove") {
                if ((row === oldrow && col === oldcol) || (row === -1 && col === -1) || (row < 0 || col < 0)) return;
                else {
                    //if (oldrow !== null && oldcol !== null)
                    //$scope.board[oldrow][oldcol] = '';

                    oldrow = row;
                    oldcol = col;
                    var current = $scope.turnIndex  === 0 ? 'R' : 'Y';
                    if ($scope.board[row][col] === '') {
                        $scope.board[row][col] = current;
                        hexagon.drawHexGrid(horIndex, 30, 30, false, $scope.board);
                        $scope.board[oldrow][oldcol] = '';
                    }
                    else hexagon.drawHexGrid(horIndex, 30, 30, false, $scope.board);

                }
            }
            else if (type == "touchend")
            //$log.info(type);
             {
                 if (row === -1 && col === -1) {
                     row = oldrow;
                     col = oldcol;
                 }
                 tryMakeMove(row, col);
                 draggingLines.style.display = "none";
            }
        }


    function getWinner(board) {
        //gamehasnotended = false;
        //check left to right
        //the number of consecutive pawns to win
        var N = 5;
//the boundary of horizontal direction
        var i, cnt, j;
        //var horIndex = gameLogic.horIndex;
        var horIndex = [[0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
            [1, 10], [2, 10], [3, 10], [4, 10], [5, 10]];
//the boundary of vertical direction
        var verIndex = [[0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
            [1, 11], [2, 11], [3, 11], [4, 11], [5, 11]];
//the boundary of diagonal direction
// starting point from NW side, end at row==10 or col==9
        var tilIndex = [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0],
            [2, 0], [3, 0], [4, 0], [5, 0]];
        for(i=0; i<11; ++i) {
            cnt = 0;
            for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
                if(board[i][j] !== ''){
                    if(j===0 || board[i][j-1] === board[i][j]){
                        cnt++;
                    }
                    else{
                        cnt = 1;
                    }
                    if( cnt === N ){
                        return board[i][j];
                    }
                }
            }
        }

        //check NE<->SW
        for(j=0; j<10; ++j){
            cnt = 0;
            for(i=verIndex[j][0]; i<verIndex[j][1]; ++i){
                if(board[i][j] !== ''){
                    if(i===0 || board[i-1][j] === board[i][j]){
                        cnt++;
                    }
                    else{
                        cnt = 1;
                    }
                    if( cnt === N ){
                        return board[i][j];
                    }
                }
            }
        }
        var row, col;
        //check NW<->SE
        for(i=0; i<10; ++i) {
            cnt =0;
            for(row = tilIndex[i][0], col = tilIndex[i][1]; row<11 && col<10; row++, col++){
                if(board[row][col] !== ''){
                    if(row === 0 || col===0 || board[row][col]===board[row-1][col-1]){
                        cnt++;
                    }
                    else{
                        cnt = 1;
                    }
                    if(cnt === N){
                        return board[row][col];
                    }
                }
            }
        }
        //gamehasnotended = true;
        return '';
    }



    function getRowCol(x,y) {

        var w = $window.innerWidth;
        var h = $window.innerHeight;
        var xp, yp;
        //var x = e.clientX;
        //var y = e.clientY;

        if (w > h)
            x = x - (w / 2 - h / 2);
        else y = y - (h / 2 - w / 2);
        if (w > h) {
            xp = x / h;
            yp = y / h;
        }
        else {
            xp = x / w;
            yp = y / w;
        }

        console.log("xp" + xp);
        console.log("yp" + yp);

        var row = -1, col = -1;
        var i = 0.075;
        var tempcol, temprow;
        while (i < 0.72) {
            if (xp > i && xp < i + 0.05) {
                tempcol = Math.floor((xp - 0.075) / 0.07);
                if (tempcol <= 5) {
                    temprow = Math.floor((yp - (0.30 - 0.04 * tempcol)) / 0.08);
                    col = temprow;
                    row = col + (5 - tempcol);
                    break;
                }
                else {
                    temprow = Math.floor((yp - (0.10 + 0.04 * (tempcol - 5))) / 0.08);
                    row = temprow;
                    col = row + (tempcol - 5);
                    break;
                }
            }
            else i = i + 0.07;
        }
        //var temp;
        //temp = col;
        //col = row;
        //row = temp;

        var j;
        var valid = false;
        for(i=0; i<11; ++i){
            for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
                if (row === i && col === j) {
                    valid = true;
                    break;
                }
            }
        }
        if (!valid) {
            row = -1;
            col = -1;
        }
        console.log("row" + row);
        console.log("col" + col);
      return {x:row, y:col};
    }
    function tryMakeMove(row, col){
      try {
        var move = createMove($scope.board, row, col,0,0,0, $scope.turnIndex);
        $scope.isYourTurn = false;
        console.log(move);
        sendMakeMove(move);
      } catch (e) {
        $log.info(["Invalid move:", row, col, e.message]);
        return;
      }
    };





      //gameLogic


        /*jslvar devel: true, indent: 2 */
        /*global console */
        //Defines that JavaScript code should be executed in "strict mode".
        'use strict';
        function isEqual(object1, object2) {
            return JSON.stringify(object1) === JSON.stringify(object2);
        }

        function copyObject(object) {
            return JSON.parse(JSON.stringify(object));
        }

        /** Return the winner (either 'R' or 'Y') or '' if there is no winner. */
        //var gamehasnotended;

        function isInsideBoard(row,col) {
            return (row>=0 && row<=10) && (horIndex[row][0] <= col) && (col < howIndex[row][1]);
        }

        /** Returns true if the game ended in a tie because there are no empty cells. */
        function isTie(board) {
            var i,j;
            for(i=0; i<11; ++i) {
                for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
                    if(board[i][j] === ''){
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

        function createMove(board, row, col, delDirRow, delDirCol, delDis, turnIndexBeforeMove) {
            if(board === undefined) board = setBoard();
            if (board[row][col] !== '') {
                throw new Error("One can only make a move in an empty position!");
            }
            var boardAfterMove = copyObject(board);
            // first one should be Red
            boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'Y';
            //remove one of the opponent's pawn
            if(delDis !== 0) {
                boardAfterMove[row+delDirRow*delDis][col+delDirCol*delDis] = '';
            }

            var winner = getWinner(boardAfterMove);
            var firstOperation;
            if ( winner !== '' || isTie(boardAfterMove)) {
                // Game over.
                //console.log("Game over");
                gameOver = true;
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

        function isMoveOk(params) {
            var move = params.move;
            var turnIndexBeforeMove = params.turnIndexBeforeMove;
            var stateBeforeMove = params.stateBeforeMove;
            var i, j;
            try {
                var deltaValue = move[2].set.value;
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
                var board = stateBeforeMove.board;
                var rowBeforeMove = stateBeforeMove.row;
                var colBeforeMove = stateBeforeMove.col;
                var delDisBeforeMove = stateBeforeMove.delDis;
                var delDirRowBeforeMove = stateBeforeMove.delDirRow;
                var delDirColBeforeMove = stateBeforeMove.delDirCol;
                var delRow = rowBeforeMove + delDisBeforeMove*delDirRowBeforeMove;
                var delCol = colBeforeMove + delDisBeforeMove*delDirColBeforeMove;
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
        function getExampleMoves(initialTurnIndex, initialState, arrayOfRowColComment) {
            var exampleMoves = [];
            var state = initialState;
            var turnIndex = initialTurnIndex;
            for (var i = 0; i < arrayOfRowColComment.length; i++) {
                var rowColComment = arrayOfRowColComment[i];
                var move = createMove(state.board, rowColComment.row, rowColComment.col, rowColComment.delDirRow, rowColComment.delDirCol, rowColComment.delDis, turnIndex);
                var stateAfterMove = {board : move[1].set.value, delta: move[2].set.value};
                exampleMoves.push({
                    stateBeforeMove: state,
                    stateAfterMove: stateAfterMove,
                    turnIndexBeforeMove: turnIndex,
                    turnIndexAfterMove: 1 - turnIndex,
                    move: move,
                    comment: {en: rowColComment.comment}});

                state = stateAfterMove;
                turnIndex = 1 - turnIndex;
            }
            return exampleMoves;
        }

        function getExampleGame() {
            return getExampleMoves(0, {}, [
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

        function getRiddles() {

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
                        delta: {row: 4, col: 4, delDirRow:0, delDirCOl:0, delDis:0}
                    },
                    [
                        {row: 5, col: 6, delDirRow:0, delDirCol:0, delDis:0, comment: "Find the position for R where he could win in his next turn at either side of a 4-in-a-row line"},
                        {row: 5, col: 7, delDirRow:0, delDirCol:0, delDis:0, comment: "Y played at the right end"},
                        {row: 5, col: 2, delDirRow:0, delDirCol:0, delDis:0, comment: "R wins by having three R at the right side of the line."}
                    ])]

        }


        function setBoard(){
            var i, j;
            var board = new Array(11);
            for(i=0; i<11; ++i){
                board[i] = new Array(10);
                for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
                    board[i][j] = '';
                }
            }
            console.log("board" + board);
            return board;
        }

        // "Manual testing" --- expected result is [true, true, false].
        var board = setBoard();
        board[0][0] = 'R';
        var board2 = copyObject(board);
        board2[0][1] = 'Y';
        console.log(
            [ // Check placing X in 0x0 from initial state.
                isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {},
                    move: [{setTurn: {turnIndex : 1}},
                        {set: {key: 'board', value: board}},
                        {set: {key: 'delta', value: {row: 0, col: 0, delDirRow:0, delDirCol:0, delDis:0}}}]}),
                // Check placing O in 0x1 from previous state.
                isMoveOk({turnIndexBeforeMove: 1,
                    stateBeforeMove: {board: board, delta: {row: 0, col: 0, delDirRow:0, delDirCol:0, delDis:0}},
                    move: [{setTurn: {turnIndex : 0}},
                        {set: {key: 'board', value: board2}},
                        {set: {key: 'delta', value: {row: 0, col: 1, delDirRow:0, delDirCol:0, delDis:0}}}]}),
                // Checking an illegal move.
                isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {}, move: [{setTurn: {turnIndex : 0}}]})
            ]);
        /**
         * Returns the move that the computer player should do for the given board.
         * The computer will play in a random empty cell in the board.
         */
        function createComputerMove(board, turnIndexBeforeMove) {
            var possibleMoves = [];
            var i, j;
            for (i = 0; i < 11; i++) {
                for (j = horIndex[i][0]; j < horIndex[i][1]; j++) {
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

    gameService.setGame({
      gameDeveloperEmail: "ycy247@nyu.edu",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: getExampleGame(),
      riddles: getRiddles(),
      isMoveOk: isMoveOk,
      updateUI: updateUI
    });

  }]);
