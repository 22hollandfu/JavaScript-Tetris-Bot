//initializing global variables
var fallingBlock, left, right, next, nextBlock, gameLost = false, linesCleared = 0, iDrought = 0; level = 10, requirement = 5, linesSinceLast = 0, points = 0;
var canvas = document.getElementById("canvas").getContext("2d");

//creation of the board as a 25x10 array in rows x columns
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
    drawBoard();
    gameTimer();
}

//game timer uses recursion to reset the setInterval timer 
//this allows the blocks to actualy fall faster with an increase in level
function gameTimer() {
    var timer = setInterval(function() {
        if(checkBelow()) {
           checkRow();
           spawnBlock();
        } else
            fallingBlock.yPos--;
        buildBlock(fallingBlock);
        drawBoard();
        if(linesSinceLast >= requirement) {
            level++;
            requirement += 2;
            linesSinceLast = 0;
        }
        if(gameLost) {
            clearInterval(timer);
            return;   
        }
        clearInterval(timer);
        gameTimer();
    }, 45);
}

//draws js graphics using HTML5 canvas in a 2d context
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
    var str = "<br> score: " + points + "<br> level: " + level + "<br> lines cleared: " + linesCleared;
    document.getElementById("tester").innerHTML = str;
}

//iterate through the board, if there is a falling block with a stationary block beneath it
//set all the falling blocks to stationary (board[y][x] = fallingBlock.blockType)
//if blocks are at top of board, lose game
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
            linesSinceLast++;
        }
    }
    if(multiClear != 0)
        points += 50 * level * Math.pow(2, multiClear);
}
//choose a new random block to spawn at the top of the board
//if the block is an L, J, or T, then it must be able to rotate 4 ways
//otherwise, only 2 rotations are needed for I, O, S, and Z
function spawnBlock() {
    fallingBlock = new Block(next, 18, 4, 0);
    next = Math.floor(Math.random() * 7 + 2);
    // if(next != 2)
    //     iDrought++;
    // if(iDrought > 6){
    //     next = 2;
    //     iDrought = 0;
    // }
    nextBlock = new Block(next, 22, 4, 0);
    for(var c = 22; c < 25; c++)
        for(var k = 2; k < 7; k++)
            if(board[c][k] == 1)
                board[c][k] = 0;
    buildBlock(nextBlock);
    buildBlock(fallingBlock);
    var ideal = idealDrop(testPositions());
    botTimer(true, ideal[0]);
    botTimer(false, ideal[1]);
    buildBlock(fallingBlock);
}

//adds a timer function to handle "animations" of the bot's actions
//mr is whether the bot is moving a block left or right (true), or rotating the block (false)
function botTimer(mr, ideal) {
    var timer = setInterval(function() {
        if(mr) {
            if(fallingBlock.xPos == ideal) {
                clearInterval(timer);
                return;
            }
            if(fallingBlock.xPos < ideal) 
                fallingBlock.xPos++;
            if(fallingBlock.xPos > ideal)
                fallingBlock.xPos--;
        } else {
            if(fallingBlock.rotation == ideal) {
                clearInterval(timer);
                return; 
            }
            fallingBlock.rotation++;
        }
        buildBlock(fallingBlock);
        clearInterval(timer);
        botTimer(mr, ideal);
    }, 70);
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
function buildBlock(block) {
    for(var c = 0; c < 20; c++)
        for(var k = 0; k < 10; k++)
            if(board[c][k] == 1)
                board[c][k] = 0;
    switch(block.blockType) {
        case 2:  //I block
            if(block.rotation == 1) {
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
            if(block.rotation == 1) {
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
            if(block.rotation == 1) {
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
    if(gameLost)
        return;
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
                if(fallingBlock.rotation == 0)
                    fallingBlock.rotation = 1;
                else
                    fallingBlock.rotation = 0;
            buildBlock(fallingBlock);
            if(fallingBlock.xPos + left < 0 || fallingBlock.xPos + right > 9) {
                if(fallingBlock.blockType == 3 || fallingBlock.blockType == 4 || fallingBlock.blockType == 8) {
                    fallingBlock.rotation--;
                    fallingBlock.rotation = (4 + fallingBlock.rotation) % 4;
                } else
                    if(fallingBlock.rotation == 0)
                        fallingBlock.rotation = 1;
                    else
                        fallingBlock.rotation = 0;
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

//test drops the current block in play in possible positions to find the best one
//returns an array with the avg heights and porosity of each of the possible boards
function testPositions() {
    var it = 2, c = 0, deepCopy = [], finalArr = [];
    if(fallingBlock.blockType == 3 || fallingBlock.blockType == 4 || fallingBlock.blockType == 8)
        it = 4;
    for(var i = 0; i < 25; i++) {
        deepCopy[i] = [];
        for(var j = 0; j < 10; j++)
            deepCopy[i][j] = board[i][j];
    }
    for(var i = 0; i < it; i++) {
        fallingBlock.rotation = i;
        buildBlock(fallingBlock);
        for(var j = Math.abs(left); j < 10 - right; j++) {
            fallingBlock.xPos = j;
            buildBlock(fallingBlock);
            while(!checkBelow()) {
                fallingBlock.yPos--;
                buildBlock(fallingBlock);
            }
            var tempPoints = points;
            checkRow();
            points = tempPoints;
            finalArr.push([]);
            averageStackHeight();
            finalArr[c].push(averageStackHeight());
            finalArr[c].push(findPorosity());
            finalArr[c].push(fallingBlock.xPos);
            finalArr[c].push(fallingBlock.rotation);
            finalArr[c].push(wellCount());
            for(var y = 0; y < 25; y++) 
                for(var z = 0; z < 10; z++)
                    board[y][z] = deepCopy[y][z];
            fallingBlock.xPos = 4;
            fallingBlock.yPos = 18;
            c++;
        }
    }
    fallingBlock.rotation = 0;
    buildBlock(fallingBlock);
    console.log(finalArr);
    return finalArr;
}

//returns true if a well of >= 3 depth is created
function wellCreated() {
    for(var i = 1; i < 9; i++)
        for(var j = 0; j < 20; j++) {
            
        }
}

//finds and returns the avg height + the tallest height
//functionally the same: a lower number is better
function averageStackHeight() {
    var stack = new Array(10);
    var averageStackHeight = 0;
    for(var i = 0; i < 10; i++) {
        stack[i] = 0;
        for(var j = 0; j < 20; j++)
            if(board[j][i] > 1)
                stack[i] = j + 1;
    }
    for(var i = 0; i < 10; i++) 
        averageStackHeight += stack[i];
    averageStackHeight /= 10;
    averageStackHeight += Math.max(...stack);
    return averageStackHeight;
}

//returns the number of holes in the board
function findPorosity() {
    var numHoles = 0;
    for(var j = 0; j < 10; j++) {
        var current = -1;
        for(var i = 0; i < 20; i++) {
            if(board[i][j] > 1) {
                numHoles += i - (current + 1);
                current = i; 
            }
        }
    }
    return numHoles;
}

//returns the amount of 3 block deep wells on the board
function wellCount() {
    var wellCount = 0;
    for(var i = 1; i < 10; i++){
        var first = false, second = false;
        for(var j = 0; j < 20; j++) {
            if(board[j][i] > 1 && board[j][i - 1] == 0) {
                if(second)
                    wellCount++;
                if(first)
                    second = true;
                first = true;
            } else
                [first, second] = [false, false];
        }
    }
    for(var i = 0; i < 9; i++){
        var first = false, second = false;
        for(var j = 0; j < 20; j++) {
            if(board[j][i] > 1 && board[j][i + 1] == 0) {
                if(second)
                    wellCount++;
                if(first)
                    second = true;
                first = true;
            } else
                [first, second] = [false, false];
        }
    }
    return wellCount; 
}

//returns the most ideal drop
//the array passed into this function is a 2d array where the first dimension
//is each possible drop and the second dimension includes the xpos and rotation of the block
// and porosity, avg height, and wellcount
function idealDrop(arr) {
    var posScores = [], maxScore;
    for(var i = 0; i < arr.length; i++) 
        posScores.push((0.25 / (1 + arr[i][0])) + (.7 / (1 + arr[i][1])) + (0.05 / (1 + arr[i][4])));
    maxScore = Math.max(...posScores);
    for(var i = 0; i < posScores.length; i++)
        if(posScores[i] == maxScore)
            return [arr[i][2], arr[i][3]];
}