var aiService;
(function (aiService) {
    /**
     * Returns the move that the computer player should do for the given board.
     * The computer will play in a random empty cell in the board.
     */
    function createComputerMove(board, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var i = 0; i < 11; i++) {
            for (var j = gameLogic.getHorIndex(i, 0); j < gameLogic.getHorIndex(i, 1); j++) {
                try {
                    possibleMoves.push(gameLogic.createMove(board, i, j, 0, 0, 0, turnIndexBeforeMove));
                }
                catch (e) {
                }
            }
        }
        var randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        console.log("random move is: ", randomMove[2].set.value.row, randomMove[2].set.value.col);
        return randomMove;
    }
})(aiService || (aiService = {}));
