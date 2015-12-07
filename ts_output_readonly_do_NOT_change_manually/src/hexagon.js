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
