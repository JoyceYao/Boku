'use strict';
// TODO: remove stateService before launching the game.
angular.module('myApp',['ngTouch']).controller('Ctrl',['$window', '$scope', '$log','$timeout',
    'gameService', 'gameLogic', 'hexagon', 'resizeGameAreaService', function (
      $window, $scope, $log,$timeout,
      gameService, gameLogic, hexagon, resizeGameAreaService) {
    //setting up canvas

    resizeGameAreaService.setWidthToHeight(1);


    var ctrl = this;
    console.log("b4");
    $scope.board = gameLogic.setBoard();
    $scope.winner = gameLogic.winner;
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
        $scope.board = gameLogic.setBoard();
      }
      else{
        //moveAudio.play();
      }
      hexagon.drawHexGrid(gameLogic.horIndex, 30, 30, false, $scope.board);

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
      var move = gameLogic.createComputerMove($scope.board, $scope.turnIndex);
      gameService.makeMove(move);

      hexagon.column = move[2].set.value.col - move[2].set.value.row + 5;
      hexagon.row = parseInt((-4+hexagon.column+2*move[2].set.value.row)/2, 10);

    }
    // Before getting any updateUI message, we show an empty board to a viewer (so you can't perform moves).
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
    
    $scope.cellClicked = function (e) {
        //if not my turn, do nothing
        console.log("x,y", e);
        if (!$scope.isYourTurn) {
            return;
        }
        //e = e.changedTouches[0];
        console.log("changed x" + e.clientX - gameArea.offsetLeft);

        var position = getRowCol(e.clientX, e.clientY);
        tryMakeMove(position.x, position.y);
        //tryMakeMove(row, col);
    }
      //var position = getRowCol(e.clientX, e.clientY);
      //tryMakeMove(position.x, position.y);


    var gameArea = document.getElementById("gameArea");
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    //var draggingPiece = null;
    var nextZIndex = 61;
    var oldrow = null;
    var oldcol = null;
    window.handleDragEvent = handleDragEvent;
    function handleDragEvent(type, clientX, clientY) {
        // Center point in gameArea
        //var x = clientX - gameArea.offsetLeft;
        //var y = clientY - gameArea.offsetTop;
        //$log.info("winnder is "+gameLogic.getWinner($scope.board));
        $log.info(gameLogic.gameOver);
        if (getWinner($scope.board) !== '') return;
        var row = getRowCol(clientX, clientY).x;
        var col = getRowCol(clientX, clientY).y;

           // if (type !== "touchend" && type !=="touchcancel" && type !=="touchleave") {
        if (type === "touchstart" || type === "touchmove") {
                if ((row === oldrow && col === oldcol) || (row === -1 && col === -1)) return;
                else {
                    //if (oldrow !== null && oldcol !== null)
                    //$scope.board[oldrow][oldcol] = '';

                    oldrow = row;
                    oldcol = col;
                    var current = $scope.turnIndex  === 0 ? 'R' : 'Y';
                    if ($scope.board[row][col] === '') {
                        $scope.board[row][col] = current;
                        hexagon.drawHexGrid(gameLogic.horIndex, 30, 30, false, $scope.board);
                        $scope.board[oldrow][oldcol] = '';
                    }
                    else hexagon.drawHexGrid(gameLogic.horIndex, 30, 30, false, $scope.board);

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

        //var x = e.clientX;
        //var y = e.clientY;

        var xp = (x - (w / 2 - h / 2)) / h;
        var yp = y / h;

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

        console.log("row" + row);
        console.log("col" + col);
      return {x:row, y:col};
    }
    function tryMakeMove(row, col){
      try {
        var move = gameLogic.createMove($scope.board, row, col,0,0,0, $scope.turnIndex);
        $scope.isYourTurn = false;
        console.log(move);
        sendMakeMove(move);
      } catch (e) {
        $log.info(["Invalid move:", row, col, e.message]);
        return;
      }
    };




    gameService.setGame({
      gameDeveloperEmail: "ycy247@nyu.edu",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles(),
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });

  }]);
