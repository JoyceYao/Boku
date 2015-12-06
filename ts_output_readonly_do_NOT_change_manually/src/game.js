var game;
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
