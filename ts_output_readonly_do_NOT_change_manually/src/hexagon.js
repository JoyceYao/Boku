var hexagon;
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
            //console.log("animateMove!!");
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
            // change debugText from "false" into ""
            this.drawHex(x, y, color, "");
            //requestAnimFrame(function() {
            //  animateMove(x,y,startTime,turn);
            //});
        };
        IHex.prototype.drawHexAtColRow = function (column, row, color) {
            //column++; row++;
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
        return IHex;
    })();
    hexagon.IHex = IHex;
})(hexagon || (hexagon = {}));
