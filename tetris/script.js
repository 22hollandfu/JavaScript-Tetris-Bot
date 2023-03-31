//initializing global variables
//falling block will be the block in play, gameLost is whether the game is lost
//left and right are the distance to buffer the keypress to keep block in the field
//level is a proxy for the rate at which the blocks fall
//canvas creates the HTML canvas object needed to draw
var fallingBlock, left, right, next, nextBlock, gameLost = false, linesCleared = 0, level = 1, points = 0;
var canvas = document.getElementById("canvas").getContext("2d");

//creation of the board as a 25x10 array in rows x columns
//adding 5 extra rows on top for the ability to rotate the pieces outside of the arena,
//pieces will still spawn at the 19th index of the array
//0 indicates the array indice is empty (no block)
var board = new Array(25);
for(var i = 0; i < 25; i++) {
    board[i] = [];
    for(var j = 0; j < 10; j++)
        board[i][j] = 0;
}

//calls run game function to run game
runGame();

//the main loop of the game will call all the other functions to run the game
function runGame() {
    next = Math.floor(Math.random() * 7 + 2);
    spawnBlock();
    buildBlock(fallingBlock);
    var timer = setInterval(function() {
        if(checkBelow()) {
            checkRow();
            spawnBlock();
        }
        else
            fallingBlock.yPos--;
        buildBlock(fallingBlock);
        drawBoard();
        level = Math.floor(linesCleared / 5) + 1;
        if(gameLost)
            clearInterval(timer);
    }, 2000 / level);
    
}

//draws js graphics using canvas
function drawBoard() {
    for(var i = 19; i >= 0; i--) 
        for(var j = 0; j < 10; j++) {
            if(board[i][j] == 1){
                canvas.fillStyle = hueToColor(51 * (fallingBlock.blockType - 1));
                canvas.fillRect(j * 20, Math.abs(i - 19) * 20, 20, 20);
            }else if(board[i][j] > 1) {
                canvas.fillStyle = hueToColor(51 * (board[i][j] - 1));
                canvas.fillRect(j * 20, Math.abs(i - 19) * 20, 20, 20);
            }else {
                canvas.fillStyle = "rgb(255, 255, 255)";
                canvas.fillRect(j * 20, Math.abs(i - 19) * 20, 20, 20);
            }
        }
    for(var i = 24; i >= 22; i--)
        for(var j = 2; j <= 8; j++) {
            if(board[i][j] == 1){
                canvas.fillStyle = hueToColor(51 * (nextBlock.blockType - 1));
                canvas.fillRect(200 + j * 20, Math.abs(i - 25) * 20, 20, 20);
            }else {
                canvas.fillStyle = "rgb(255, 255, 255)";
                canvas.fillRect(200 + j * 20, Math.abs(i - 25) * 20, 20, 20);
            }
        }
    canvas.fillStyle = "rgb(0, 0, 0)";
    canvas.moveTo(0, 0);
    canvas.lineTo(0, 400);
    canvas.lineTo(200, 400);
    canvas.lineTo(200, 0);
    canvas.lineTo(0, 0);
    canvas.stroke();
    var str = "<br> score: " + points + "<br> level: " + level;
    document.getElementById("tester").innerHTML = str;
}

//iterate through the board, if there is a falling block with a stationary block beneath it
//set all the falling blocks to stationary (board[y][x] = 2)
//if blocks are at top of board, sets gameLost to true
//return true to end function if block is found below
//return false if no blocks are found
function checkBelow() {
    for(var i = 0; i < 20; i++)
        for(var j = 0; j < 10; j++)
            if((board[i + 1][j] == 1 && board[i][j] > 1) || (board[i][j] == 1 && i - 1 < 0)) {
                for(var c = 0; c < 20; c++)
                    for(var k = 0; k < 10; k++) {
                        if(board[c][k] == 1 && c + 1 > 19) {
                            gameLost = true;
                            return true;
                        }
                        if(board[c][k] == 1)
                            board[c][k] = fallingBlock.blockType;
                    }
                return true;
            }
    return false;
}

//check row will check to see if a row is completed and clear said row
//calculate points, giving exponentially more points for multi-line clears
function checkRow() {
    var multiClear = 0;
    for(var i = 0; i < 20; i++) {
        var rowCompleted = true;
        for(var j = 0; j < 10; j++)
            if(board[i][j] == 0)
                rowCompleted = false;
        if(rowCompleted) {
            for(var c = i; c < 20; c++)
                for(var k = 0; k < 10; k++)
                    board[c][k] = board[c + 1][k];
            i--;
            multiClear++;
            linesCleared++;
        }
    }
    if(multiClear != 0)
        points += 50 * level * Math.pow(2, multiClear);
}
//choose a new random block to spawn at the top of the board
//if the block is an L, J, or T, then it must be able to rotate 4 ways
//otherwise, only 2 rotations are needed for I, O, S, and Z
function spawnBlock() {
    if(next == 3 || next == 4 || next == 8)
        fallingBlock = new Block(next, 18, 4, 0);
    else
        fallingBlock = new Block(next, 18, 4, false);
    next = Math.floor(Math.random() * 7 + 2);
    if(next == 3 || next == 4 || next == 8)
        nextBlock = new Block(next, 23, 4, 0);
    else
        nextBlock = new Block(next, 23, 4, false);
    for(var c = 22; c < 25; c++)
        for(var k = 2; k < 7; k++)
            if(board[c][k] == 1)
                board[c][k] = 0;
    buildBlock(nextBlock);
}

//constructor for the tetris block objects
function Block(blockType, yPos, xPos, rotation) {
    this.blockType = blockType;
    this.yPos = yPos;
    this.xPos = xPos;
    this.rotation = rotation;
}

//this function builds the block in the array by changing the proper indices to 1
//1 indicates the block is in play
// block.rotation will be true for vertical rotation, false for horizontal
// the top of the array will be the length of the array 
// top right will be board[19][9] and bottom left will be board[0][0]
function buildBlock(block) {
    for(var c = 0; c < 20; c++)
        for(var k = 0; k < 10; k++)
            if(board[c][k] == 1)
                board[c][k] = 0;
    switch(block.blockType) {
        case 2:  //I block
            if(block.rotation) {
                [left, right] = [0, 0];
                for(var i = -1; i < 3; i++)
                    board[block.yPos + i][block.xPos] = 1;
            } else {
                [left, right] = [-1, 2];
                for(var i = -1; i < 3; i++)
                    board[block.yPos][block.xPos + i] = 1;
            }
        break;  
        case 3:  //J block, nested switch because 4 different rotations
            switch(block.rotation) {
                case 0:
                    [left, right] = [-2, 0];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos + 1][block.xPos - i] = 1;
                break;
                case 1:
                    [left, right] = [0, 1];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos + i][block.xPos + 1] = 1;
                break;   
                case 2:
                    [left, right] = [0, 2];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos - 1][block.xPos + i] = 1;
                break;   
                case 3:
                    [left, right] = [-1, 0];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos  - i][block.xPos - 1] = 1;
                break;
            }
            board[block.yPos][block.xPos] = 1;
        break;
        case 4:  //L block, nested switch because 4 different rotations
            switch(block.rotation) {
                case 0:
                    [left, right] = [0, 2];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos + 1][block.xPos + i] = 1;
                break;
                case 1:
                    [left, right] = [0, 1];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos - i][block.xPos + 1] = 1;
                break;   
                case 2:
                    [left, right] = [-2, 0];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos - 1][block.xPos - i] = 1;
                break;   
                case 3:
                    [left, right] = [-1, 0];
                    for(var i = 0; i < 3; i++)
                        board[block.yPos + i][block.xPos - 1] = 1;
                break;
            } 
            board[block.yPos][block.xPos] = 1;
        break;
        case 5:  //O block
            [left, right] = [0, 1];
            for(var i = 0; i <= 3; i++)
                board[block.yPos + (i % 2)][block.xPos + Math.floor(i / 2)] = 1;
        break;
        case 6:  //S block
            if(block.rotation) {
                [left, right] = [-1, 0];
                for(var i = 0; i <= 1.5; i += 0.5)
                    board[block.yPos + Math.floor(i + 0.5)][block.xPos - Math.floor(i)] = 1;
            } else {
                [left, right] = [0, 2];
                for(var i = 0; i <= 1.5; i += 0.5)
                    board[block.yPos + Math.floor(i)][block.xPos + Math.floor(i + 0.5)] = 1;
            }
        break;
        case 7:  //Z block
            if(block.rotation) {
                [left, right] = [0, 1];
                for(var i = 0; i <= 1.5; i += 0.5)
                    board[block.yPos + Math.floor(i + 0.5)][block.xPos + Math.floor(i)] = 1;
            } else {
                [left, right] = [-2, 0];
                for(var i = 0; i <= 1.5; i += 0.5)
                    board[block.yPos + Math.floor(i)][block.xPos - Math.floor(i + 0.5)] = 1;
            }
        break;
        case 8:  //T block, nested switch because 4 different rotations
            switch(block.rotation) {
                case 0:
                    [left, right] = [-1, 1];
                    for(var i = -1; i <= 1; i++)
                        board[block.yPos + 1][block.xPos + i] = 1;
                break;
                case 1:
                    [left, right] = [0, 1];
                    for(var i = -1; i <= 1; i++)
                        board[block.yPos + i][block.xPos + 1] = 1;
                break;   
                case 2:
                    [left, right] = [-1, 1];
                    for(var i = -1; i <= 1; i++)
                        board[block.yPos - 1][block.xPos + i] = 1;
                break;   
                case 3:
                    [left, right] = [-1, 0];
                    for(var i = -1; i <= 1; i++)
                        board[block.yPos + i][block.xPos - 1] = 1; 
                break;
            }
            board[block.yPos][block.xPos] = 1;
        break;
    }
}

//checks to see blocks next to sides of falling block
function checkSides() {
    for(var i = 0; i < 20; i++)
        for(var c = 0; c < 10; c++)
            if((board[i][c] == 1 && board[i][c - 1] > 1) || (board[i][c] == 1 && board[i][c + 1] > 1))
                return false;
    return true;
}

//translates a degree value to an RGB color by portioning the amount of R, G, and B respectivly, by the degree measure
//This is a color wheel, the inspiration for programming this was taken from a wikipedia picture: https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/HSV-RGB-comparison.svg/300px-HSV-RGB-comparison.svg.png
function hueToColor(deg) {
    var degToCase = Math.floor(deg / 60);
    switch(degToCase) {
        case 0:
            return "rgb(255, " + (4.25 * (deg - degToCase * 60)).toString() + " , 0)";
        case 1:
            return "rgb(" + (255 - 4.25 * (deg - degToCase * 60)).toString() + " , 255, 0)";
        case 2:
            return "rgb(0, 255, " + (4.25 * (deg - degToCase * 60)).toString() + ")";
        case 3:
            return "rgb(0, " + (255 - 4.25 * (deg - degToCase * 60)).toString() + " , 255)";
        case 4:
            return "rgb(" + (4.25 * (deg - degToCase * 60)).toString() + " , 0, 255)";
        case 5:
            return "rgb(255, 0, " + (255 - 4.25 * (deg - degToCase * 60)).toString() + ")";
    }
}

//arrow key controls, up to rotate, left right are left and right
document.addEventListener("keydown", function(e) {
    e.preventDefault();
    switch(e.key) {
        case "ArrowLeft":
            if(fallingBlock.xPos + left > 0 && checkSides())
                fallingBlock.xPos--;
            buildBlock(fallingBlock);
        break;
        case "ArrowRight":
            if(fallingBlock.xPos + right < 9 && checkSides())
                fallingBlock.xPos++;
            buildBlock(fallingBlock);
        break;
        case "ArrowUp":
            if(fallingBlock.blockType == 3 || fallingBlock.blockType == 4 || fallingBlock.blockType == 8) {
                fallingBlock.rotation++;
                fallingBlock.rotation = fallingBlock.rotation % 4;
            } else
                fallingBlock.rotation = !fallingBlock.rotation;
            buildBlock(fallingBlock);
            if(fallingBlock.xPos + left < 0 || fallingBlock.xPos + right > 9) {
                if(fallingBlock.blockType == 3 || fallingBlock.blockType == 4 || fallingBlock.blockType == 8) {
                    fallingBlock.rotation--;
                    fallingBlock.rotation = (4 + fallingBlock.rotation) % 4;
                } else
                    fallingBlock.rotation = !fallingBlock.rotation;
                buildBlock(fallingBlock);
            }
        break;
        case "ArrowDown":
            while(!checkBelow()) {
                fallingBlock.yPos--;
                buildBlock(fallingBlock);
            }
            checkRow();
            spawnBlock();
            buildBlock(fallingBlock);
        break;
    }
    drawBoard();
});

//testfunction prints board array into a tester div
function testFunc() {
    var str = "";
    for(var i = 19; i >= 0; i--) {
        for(var j = 0; j < 10; j++)
            str += board[i][j] + ", ";
        str += "<br>";       
    }
    str += "<br>" + fallingBlock.blockType + "<br>" + hueToColor(51 * (fallingBlock.blockType - 1));
    document.getElementById("tester").innerHTML = str;
}