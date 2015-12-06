var gameLogic;
(function (gameLogic) {
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
    function isEqual(object1, object2) {
        return JSON.stringify(object1) === JSON.stringify(object2);
    }
    function copyObject(object) {
        return JSON.parse(JSON.stringify(object));
    }
    function getHorIndex(row, col) {
        return horIndex[row][col];
    }
    gameLogic.getHorIndex = getHorIndex;
    function getWinner(board) {
        //check left to right
        for (var i = 0; i < 11; ++i) {
            var cnt = 0;
            for (var j = horIndex[i][0]; j < horIndex[i][1]; ++j) {
                if (board[i][j] !== '') {
                    if (j === 0 || board[i][j - 1] === board[i][j]) {
                        cnt++;
                    }
                    else {
                        cnt = 1;
                    }
                    if (cnt === N) {
                        return board[i][j];
                    }
                }
            }
        }
        //check NE<->SW
        for (var j = 0; j < 10; ++j) {
            var cnt = 0;
            for (var i = verIndex[j][0]; i < verIndex[j][1]; ++i) {
                if (board[i][j] !== '') {
                    if (i === 0 || board[i - 1][j] === board[i][j]) {
                        cnt++;
                    }
                    else {
                        cnt = 1;
                    }
                    if (cnt === N) {
                        return board[i][j];
                    }
                }
            }
        }
        var row, col;
        //check NW<->SE
        for (var i = 0; i < 10; ++i) {
            var cnt = 0;
            for (row = tilIndex[i][0], col = tilIndex[i][1]; row < 11 && col < 10; row++, col++) {
                if (board[row][col] !== '') {
                    if (row === 0 || col === 0 || board[row][col] === board[row - 1][col - 1]) {
                        cnt++;
                    }
                    else {
                        cnt = 1;
                    }
                    if (cnt === N) {
                        return board[row][col];
                    }
                }
            }
        }
        return '';
    }
    gameLogic.getWinner = getWinner;
    function isInsideBoard(row, col) {
        return (row >= 0 && row <= 10) && (horIndex[row][0] <= col) && (col < horIndex[row][1]);
    }
    /** Returns true if the game ended in a tie because there are no empty cells. */
    function isTie(board) {
        for (var i = 0; i < 11; ++i) {
            for (var j = horIndex[i][0]; j < horIndex[i][1]; ++j) {
                if (board[i][j] === '') {
                    return false;
                }
            }
        }
        return true;
    } //Done
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(board, row, col, delDirRow, delDirCol, delDis, turnIndexBeforeMove) {
        if (board === undefined)
            board = setBoard();
        if (board[row][col] !== '') {
            throw new Error("One can only make a move in an empty position!");
        }
        var boardAfterMove = copyObject(board);
        // first one should be Red
        boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'Y';
        //remove one of the opponent's pawn
        if (delDis !== 0) {
            boardAfterMove[row + delDirRow * delDis][col + delDirCol * delDis] = '';
        }
        var winner = getWinner(boardAfterMove);
        var firstOperation = {};
        if (winner !== '' || isTie(boardAfterMove)) {
            // Game over.
            //console.log("Game over");
            //gameOver = true;
            firstOperation = { endMatch: { endMatchScores: (winner === 'R' ? [1, 0] : (winner === 'Y' ? [0, 1] : [0, 0])) } };
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            firstOperation = { setTurn: { turnIndex: 1 - turnIndexBeforeMove } };
        }
        return [firstOperation,
            { set: { key: 'board', value: boardAfterMove } },
            { set: { key: 'delta', value: { row: row, col: col, delDirRow: delDirRow, delDirCol: delDirCol, delDis: delDis } } }];
    }
    gameLogic.createMove = createMove; //done
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
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
            if (delta) {
                delDisBeforeMove = delta.delDis;
            }
            if (board === undefined) {
                // Initially (at the beginning of the match), stateBeforeMove is {}.
                board = setBoard();
            }
            // One can't place at a position that was taken at last move.
            if (delDis !== 0 && delDisBeforeMove !== 0 && delDirRow === row && delDirCol === col) {
                return false;
            }
            // Only when the opponents pawn is trapped can be removed.
            if (delDis !== 0) {
                if (delDis > 2 || delDis < 0) {
                    return false;
                }
                if (row + 3 * delDirRow < 0 || col + 3 * delDirCol < 0) {
                    return false;
                }
                if (board[row + delDirRow][col + delDirCol] !== (turnIndexBeforeMove === 0 ? 'Y' : 'R')) {
                    return false;
                }
                if (board[row + 2 * delDirRow][col + 2 * delDirCol] !== (turnIndexBeforeMove === 0 ? 'Y' : 'R')) {
                    return false;
                }
                if (board[row + 3 * delDirRow][col + 3 * delDirCol] !== (turnIndexBeforeMove === 0 ? 'R' : 'Y')) {
                    return false;
                }
            }
            var expectedMove = createMove(board, row, col, delDirRow, delDirCol, delDis, turnIndexBeforeMove);
            if (!isEqual(move, expectedMove)) {
                return false;
            }
            if (row < 0 || row > 10)
                return false;
            if (horIndex[row][0] > col || horIndex[row][1] <= col) {
                return false;
            }
        }
        catch (e) {
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }
    gameLogic.isMoveOk = isMoveOk;
    /** Returns an array of {stateBeforeMove, move, comment}. */
    function getExampleMoves(initialTurnIndex, initialState, arrayOfRowColComment) {
        var exampleMoves = [];
        var state = initialState;
        var turnIndex = initialTurnIndex;
        for (var i = 0; i < arrayOfRowColComment.length; i++) {
            var rowColComment = arrayOfRowColComment[i];
            var move = createMove(state.board, rowColComment.row, rowColComment.col, rowColComment.delDirRow, rowColComment.delDirCol, rowColComment.delDis, turnIndex);
            var stateAfterMove = { board: move[1].set.value, delta: move[2].set.value };
            exampleMoves.push({
                move: move,
                turnIndexBeforeMove: turnIndex,
                turnIndexAfterMove: 1 - turnIndex,
                stateBeforeMove: state,
                stateAfterMove: stateAfterMove,
                numberOfPlayers: PlayersNum,
                comment: { en: rowColComment.comment } });
            state = stateAfterMove;
            turnIndex = 1 - turnIndex;
        }
        return exampleMoves;
    }
    function getExampleGame() {
        return getExampleMoves(0, null, [
            { row: 5, col: 5, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "R put at middle of the board" },
            { row: 5, col: 6, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "Y put next to it(trying to block it)" },
            { row: 4, col: 5, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "R put one on it's neighbor to form two in a row" },
            { row: 3, col: 5, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "Y tries to block one side of R" },
            { row: 4, col: 6, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "R forms another line on another direction" },
            { row: 3, col: 7, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "Y blocks one side of R's new line" },
            { row: 6, col: 4, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "R extends the line by adding one on the other direction" },
            { row: 7, col: 3, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "Y blocks the other direction as well" }
        ]);
    }
    gameLogic.getExampleGame = getExampleGame;
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
            getExampleMoves(0, {
                board: board,
                delta: { row: 4, col: 4, delDirRow: 0, delDirCol: 0, delDis: 0 }
            }, [
                { row: 5, col: 6, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "Find the position for R where he could win in his next turn at either side of a 4-in-a-row line" },
                { row: 5, col: 7, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "Y played at the right end" },
                { row: 5, col: 2, delDirRow: 0, delDirCol: 0, delDis: 0, comment: "R wins by having three R at the right side of the line." }
            ])];
    }
    gameLogic.getRiddles = getRiddles;
    function setBoard() {
        var board = new Array(11);
        for (var i = 0; i < 11; ++i) {
            board[i] = new Array(10);
            for (var j = horIndex[i][0]; j < horIndex[i][1]; ++j) {
                board[i][j] = '';
            }
        }
        console.log("board" + board);
        return board;
    }
    gameLogic.setBoard = setBoard;
    /**
    * Returns the move that the computer player should do for the given board.
    * The computer will play in a random empty cell in the board.
    */
    function createComputerMove(board, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var i = 0; i < 11; i++) {
            for (var j = horIndex[i][0]; j < horIndex[i][1]; j++) {
                try {
                    possibleMoves.push(createMove(board, i, j, 0, 0, 0, turnIndexBeforeMove));
                }
                catch (e) {
                }
            }
        }
        var randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        console.log("random move is: ", randomMove[2].set.value.row, randomMove[2].set.value.col);
        return randomMove;
    }
    gameLogic.createComputerMove = createComputerMove;
})(gameLogic || (gameLogic = {}));
;var game;
(function (game) {
    var gameOver = false;
    var board = null;
    var delta = null;
    var isYourTurn = false;
    var turnIndex = 0;
    var gameArea = null;
    var draggingLines = null;
    var horizontalDraggingLine = null;
    var verticalDraggingLine = null;
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var nextZIndex = 61;
    var oldrow = null;
    var oldcol = null;
    var hex;
    var thisParam = null;
    var PlayersNum = 2;
    //the boundary of horizontal direction
    var horIndex = [[0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
        [1, 10], [2, 10], [3, 10], [4, 10], [5, 10]];
    function init() {
        //setting up canvas
        resizeGameAreaService.setWidthToHeight(1);
        board = gameLogic.setBoard();
        hex = new hexagon.IHex();
        hex.HexagonGrid("HexCanvas", 50);
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        gameArea = document.getElementById("gameArea");
        draggingLines = document.getElementById("draggingLines");
        horizontalDraggingLine = document.getElementById("horizontalDraggingLine");
        verticalDraggingLine = document.getElementById("verticalDraggingLine");
    }
    game.init = init;
    function updateUI(params) {
        //console.log("updateUI params=" + JSON.stringify(params));
        thisParam = params;
        board = params.stateAfterMove['board'];
        delta = params.stateAfterMove['delta'];
        if (board === undefined) {
            board = gameLogic.setBoard();
        }
        hex.drawHexGrid(horIndex, 30, 30, false, board);
        //console.log("board" + JSON.stringify(board));
        isYourTurn = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        // Is it the computer's turn?
        hex.turn = params.yourPlayerIndex;
        if (isYourTurn && params.playersInfo[params.yourPlayerIndex].playerId === '') {
            // Wait 500 milliseconds until animation ends.
            $timeout(sendComputerMove, 500);
        }
    }
    function sendMakeMove(move) {
        //console.log(["Making move:", JSON.stringify(move)]);
        gameService.makeMove(move);
    }
    function sendComputerMove() {
        var move = gameLogic.createComputerMove(board, turnIndex);
        gameService.makeMove(move);
        hex.column = move[2].set.value.col - move[2].set.value.row + 5;
        hex.row = Math.round((-4 + hex.column + 2 * move[2].set.value.row) / 2);
    }
    function handleDragEvent(type, clientX, clientY) {
        if (gameLogic.getWinner(board) !== '')
            return;
        var row = getRowCol(clientX, clientY).x;
        var col = getRowCol(clientX, clientY).y;
        console.log("handleDragEvent=" + draggingLines);
        draggingLines.style.display = "inline";
        var w = window.innerWidth;
        var h = window.innerHeight;
        var x = clientX;
        var y = clientY;
        console.log("handleDragEvent[0] x=" + x);
        console.log("handleDragEvent[0] y=" + y);
        if (w > h) {
            x = x - (w / 2 - h / 2);
        }
        else {
            y = y - (h / 2 - w / 2);
        }
        console.log("handleDragEvent[1] w=" + w);
        console.log("handleDragEvent[1] h=" + h);
        console.log("handleDragEvent[1] x=" + x);
        console.log("handleDragEvent[1] y=" + y);
        if (row !== -1 && col !== -1) {
            verticalDraggingLine.setAttribute("x1", x + "");
            verticalDraggingLine.setAttribute("x2", x + "");
            horizontalDraggingLine.setAttribute("y1", y + "");
            horizontalDraggingLine.setAttribute("y2", y + "");
        }
        if (type === "touchstart" || type === "touchmove") {
            if ((row === oldrow && col === oldcol) || (row === -1 && col === -1) || (row < 0 || col < 0)) {
                return;
            }
            oldrow = row;
            oldcol = col;
            var current = turnIndex === 0 ? 'R' : 'Y';
            if (board[row][col] === '') {
                board[row][col] = current;
                hex.drawHexGrid(horIndex, 30, 30, false, board);
                board[oldrow][oldcol] = '';
            }
            else {
                hex.drawHexGrid(horIndex, 30, 30, false, board);
            }
        }
        else if (type == "touchend") {
            if (row === -1 && col === -1) {
                row = oldrow;
                col = oldcol;
            }
            tryMakeMove(row, col);
            draggingLines.style.display = "none";
        }
    }
    function getRowCol(x, y) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var xp, yp;
        if (w > h) {
            x = x - (w / 2 - h / 2);
        }
        else {
            y = y - (h / 2 - w / 2);
        }
        if (w > h) {
            xp = x / h;
            yp = y / h;
        }
        else {
            xp = x / w;
            yp = y / w;
        }
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
            else {
                i = i + 0.07;
            }
        }
        var valid = false;
        for (var i = 0; i < 11; ++i) {
            for (var j = horIndex[i][0]; j < horIndex[i][1]; ++j) {
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
        return { x: row, y: col };
    }
    function tryMakeMove(row, col) {
        try {
            var move = gameLogic.createMove(board, row, col, 0, 0, 0, turnIndex);
            isYourTurn = false;
            console.log(JSON.stringify(move));
            sendMakeMove(move);
        }
        catch (e) {
            log.info(["Invalid move:", row, col, e.message]);
            return;
        }
    }
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        "RULES_OF_BOKU": "Wecome to Boku!",
        "RULES_SLIDE": "Rules: Two players take turns to put pieces on the board \
          (black goes first), and the game is won by the player who puts five or \
          more pieces into a row first, as is shown here (white wins).",
        "CLOSE": "Close"
    });
    game.init();
});
;var hexagon;
(function (hexagon) {
    var IHex = (function () {
        function IHex() {
        }
        // Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html
        IHex.prototype.HexagonGrid = function (canvasId, radius) {
            this.radius = radius;
            //console.log(canvasId);
            this.height = Math.sqrt(3) * radius;
            this.width = 2 * radius;
            this.side = (3 / 2) * radius;
            this.canvas = document.getElementById(canvasId);
            this.context = this.canvas.getContext('2d');
            this.canvasOriginX = 0;
            this.canvasOriginY = 0;
        };
        IHex.prototype.drawHexGrid = function (hor, originX, originY, isDebug, board) {
            //console.log("drawHexGrid[0]");
            this.canvasOriginX = originX;
            this.canvasOriginY = originY;
            //console.log("drawHexGrid[1] originX="+originX);
            //console.log("drawHexGrid[1] originY="+originY);
            //console.log("drawHexGrid[1] side="+this.side);
            //console.log("drawHexGrid[1] height="+this.height);
            var currentHexX;
            var currentHexY;
            var debugText = "";
            var offsetColumn = false;
            for (var col = 0; col < 12; col++) {
                for (var row = 0; row < 12; row++) {
                    //var x = parseInt((5-col+2*row)/2, 10);
                    var x = Math.floor((5 - col + 2 * row) / 2);
                    //console.log()
                    if (5 - col + 2 * row < 0) {
                        x = 1000;
                    }
                    //console.log("x"+x + ", before round=" + (5-col+2*row)/2);
                    var y = x + col - 5;
                    //console.log("y"+y);
                    //console.log("drawHexGrid[1] offsetColumn="+offsetColumn);
                    if (!offsetColumn) {
                        currentHexX = (col * this.side) + originX;
                        currentHexY = (row * this.height) + originY;
                    }
                    else {
                        currentHexX = col * this.side + originX;
                        currentHexY = (row * this.height) + originY + (this.height * 0.5);
                    }
                    //console.log("drawHexGrid[2] currentHexX="+currentHexX);
                    //console.log("drawHexGrid[2] currentHexY="+currentHexY);
                    if (isDebug) {
                        debugText = currentHexY + "";
                    }
                    if (x >= 0 && x < 11) {
                        if ((board[x][y] == 'R' || board[x][y] == 'Y' || board[x][y] == '') && row == this.row && col == this.column) {
                            this.animateMove(currentHexX, currentHexY, (new Date()).getTime(), board[x][y]);
                            this.row = -1;
                            this.column = -1;
                        }
                        else if (board[x][y] == 'R') {
                            this.drawHex(currentHexX, currentHexY, "#000000", debugText);
                        }
                        else if (board[x][y] == 'Y') {
                            this.drawHex(currentHexX, currentHexY, "#FFFFFF", debugText);
                        }
                        else if (board[x][y] == '') {
                            this.drawHex(currentHexX, currentHexY, "#DF521F", debugText);
                        }
                    }
                }
                offsetColumn = !offsetColumn;
            }
            //window.requestAnimFrame = (function(callback: DOMHighResTimeStamp) {
            //  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            //  function(callback) {
            //    window.setTimeout(callback, 1000 / 60);
            //  };
            //})
        };
        IHex.prototype.animateMove = function (x, y, startTime, turn) {
            console.log("animateMove!!");
            var time = (new Date()).getTime();
            var timeDiff = time - startTime;
            if (timeDiff > 500)
                return;
            var color;
            //console.log(turn);
            if (turn == 'R') {
                //color = "rgb(" + parseInt(timeDiff*255/500, 10) + ",0,0)";
                color = "#000000";
            }
            else if (turn == 'Y') {
                //color = "rgb(" + parseInt(timeDiff*255/500, 10) + ","+parseInt(timeDiff*255/500, 10)+",0)";
                color = "#FFFFFF";
            }
            //console.log(color);
            this.drawHex(x, y, color, "false");
            //requestAnimFrame(function() {
            //  animateMove(x,y,startTime,turn);
            //});
        };
        IHex.prototype.drawHexAtColRow = function (column, row, color) {
            var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY : (row * this.height) + this.canvasOriginY + (this.height / 2);
            var drawx = (column * this.side) + this.canvasOriginX;
            this.drawHex(drawx, drawy, color, "");
        };
        IHex.prototype.drawHex = function (x0, y0, fillColor, debugText) {
            //console.log("drawHex x=" + x0);
            //console.log("drawHex y=" + y0);
            this.context.strokeStyle = "#000";
            this.context.beginPath();
            this.context.moveTo(x0 + this.width - this.side, y0);
            //console.log(x0 + this.width - this.side);
            //console.log(y0);
            this.context.lineTo(x0 + this.side, y0);
            this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
            this.context.lineTo(x0 + this.side, y0 + this.height);
            this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
            this.context.lineTo(x0, y0 + (this.height / 2));
            if (fillColor) {
                this.context.fillStyle = fillColor;
                this.context.fill();
            }
            this.context.closePath();
            this.context.stroke();
            if (debugText) {
                this.context.font = "8px";
                this.context.fillStyle = "#000";
                this.context.fillText(debugText, x0 + (this.width / 2) - (this.width / 4), y0 + (this.height - 5));
            }
        };
        //Recusivly step up to the body to calculate canvas offset.
        IHex.prototype.getRelativeCanvasOffset = function () {
            //return {x:this.canvas.getBoundingClientRect().left, y:this.canvas.getBoundingClientRect().top};
            var x = 0, y = 0;
            var layoutElement = this.canvas;
            while (layoutElement.offsetParent) {
                x += layoutElement.offsetLeft;
                y += layoutElement.offsetTop;
                layoutElement = layoutElement.offsetParent;
            }
            this.offSetX = x;
            this.offSetY = y;
            return { x: x, y: y };
        };
        //Uses a grid overlay algorithm to determine hexagon location
        //Left edge of grid has a test to acuratly determin correct hex
        IHex.prototype.getSelectedTile = function (mouseX, mouseY) {
            var offSet = this.getRelativeCanvasOffset();
            console.log("mouse: ", mouseX, mouseY);
            mouseX -= offSet.x;
            mouseY -= offSet.y;
            mouseX /= this.scale;
            mouseY /= this.scale;
            mouseX -= this.tx;
            mouseY -= this.ty;
            mouseX -= this.canvasOriginX;
            mouseY -= this.canvasOriginY;
            var column = Math.floor((mouseX) / this.side);
            var row = Math.floor(column % 2 == 0
                ? Math.floor((mouseY) / this.height)
                : Math.floor(((mouseY + (this.height * 0.5)) / this.height)) - 1);
            //Test if on left side of frame
            if (mouseX > (column * this.side) && mouseX < (column * this.side) + this.width - this.side) {
                //Now test which of the two triangles we are in
                //Top left triangle points
                var p1;
                p1.x = column * this.side;
                p1.y = column % 2 == 0
                    ? row * this.height
                    : (row * this.height) + (this.height / 2);
                var p2;
                p2.x = p1.x;
                p2.y = p1.y + (this.height / 2);
                var p3;
                p3.x = p1.x + this.width - this.side;
                p3.y = p1.y;
                var mousePoint;
                mousePoint.x = mouseX;
                mousePoint.y = mouseY;
                if (this.isPointInTriangle(mousePoint, p1, p2, p3)) {
                    column--;
                    if (column % 2 != 0) {
                        row--;
                    }
                }
                //Bottom left triangle points
                var p4;
                p4 = p2;
                var p5;
                p5.x = p4.x;
                p5.y = p4.y + (this.height / 2);
                var p6;
                p6.x = p5.x + (this.width - this.side);
                p6.y = p5.y;
                if (this.isPointInTriangle(mousePoint, p4, p5, p6)) {
                    column--;
                    if (column % 2 == 0) {
                        row++;
                    }
                }
            }
            return { row: row, col: column };
        };
        IHex.prototype.sign = function (p1, p2, p3) {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        };
        //TODO: Replace with optimized barycentric coordinate method
        IHex.prototype.isPointInTriangle = function (pt, v1, v2, v3) {
            var b1, b2, b3;
            b1 = this.sign(pt, v1, v2) < 0.0;
            b2 = this.sign(pt, v2, v3) < 0.0;
            b3 = this.sign(pt, v3, v1) < 0.0;
            return ((b1 == b2) && (b2 == b3));
        };
        IHex.prototype.getIndex = function (x, y) {
            var mouseX = x;
            var mouseY = y;
            var tile = this.getSelectedTile(mouseX, mouseY);
            this.column = tile.col;
            this.row = tile.row;
        };
        IHex.prototype.updateUI = function () {
            if (this.column >= 0 && this.row >= 0) {
                var drawy = this.column % 2 == 0 ? (this.row * this.height)
                    + this.canvasOriginY + 6 : (this.row * this.height) + this.canvasOriginY + 6 + (this.height / 2);
                var drawx = (this.column * this.side) + this.canvasOriginX;
                if (this.turn === 1) {
                    this.drawHex(drawx, drawy - 6, "rgba(255,0,0,0.4)", "");
                }
                else {
                    this.drawHex(drawx, drawy - 6, "rgba(255,255,0,0.4)", "");
                }
            }
        };
        return IHex;
    })();
    hexagon.IHex = IHex;
})(hexagon || (hexagon = {}));
