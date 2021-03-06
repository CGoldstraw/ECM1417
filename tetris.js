var score = 0;
var board = new Array(20);

for (var i = 0; i < board.length; i++) {
    board[i] = new Array(10);
    for (var j = 0; j < 10; j++) {
        board[i][j] = "";
    }
}

var shapes = {
    "L" : [[1,1], [1,2], [1,3], [2,3]],
    "Z" : [[1,1], [2,1], [2,2], [3,2]],
    "J" : [[2,1], [2,2], [2,3], [1,3]],
    "S" : [[1,2], [2,1], [2,2], [3,1]],
    "T" : [[1,1], [2,1], [2,2], [3,1]],
    "O" : [[1,1], [1,2], [2,1], [2,2]],
    "I" : [[1,1], [1,2], [1,3], [1,4]]
};
// I added the "J" piece, and changed the "Z"

var rotations = {
    "L" : [[[1,-1], [0,0], [-1,1], [0,2]], [[1,1], [0,0], [-1,-1], [-2,0]], [[-1,1], [0,0], [1,-1], [0,-2]], [[-1,-1], [0,0], [1,1], [2,0]]],
    "Z" : [[[0,-2], [1,-1], [0,0], [1,1]], [[2,0], [1,1], [0,0], [-1,1]], [[0,2], [-1,1], [0,0], [-1,-1]], [[-2,0], [-1,-1], [0,0], [1,-1]]],
    "J" : [[[1,-1], [0,0], [-1,1], [-2,0]], [[1,1], [0,0], [-1,-1], [0,-2]], [[-1,1], [0,0], [1,-1], [2,0]], [[-1,-1], [0,0], [1,1], [0,2]]],
    "S" : [[[-1,-1], [1,-1], [0,0], [2,0]], [[1,-1], [1,1], [0,0], [0,2]], [[1,1], [-1,1], [0,0], [-2,0]], [[-1,1], [-1,-1], [0,0], [0,-2]]],
    "T" : [[[-1,-1], [0,0], [-1,1], [1,1]], [[1,-1], [0,0], [-1,-1], [-1,1]], [[1,1], [0,0], [1,-1], [-1,-1]], [[-1,1], [0,0], [1,1], [1,-1]]],
    "O" : [[[0,0], [0,0], [0,0], [0,0]], [[0,0], [0,0], [0,0], [0,0]], [[0,0], [0,0], [0,0], [0,0]], [[0,0], [0,0], [0,0], [0,0]]],
    "I" : [[[2,-1], [1,0], [0,1], [-1,2]], [[1,2], [0,1], [-1,0], [-2,-1]], [[-2,1], [-1,0], [0,-1], [1,-2]], [[-1,-2], [0,-1], [1,0], [2,1]]]
};

var currentBlock;
var currentShape;
var block = new Array(4);

document.onkeydown = keyPress;
var intervalID;

var audio = new Audio('sounds/soundtrack.mp3');

function start_tetris() {
    document.getElementById("play-button").style.display = 'none';
    document.getElementById("board").style.display = 'block';

    newBlock();
    renderBlock();
    intervalID = setInterval(moveDown, 1000);
    audio.currentTime = 0;
    audio.play();
    audio.loop = true;
}

function randomiseBlock() {
    var keys = Object.keys(shapes);
    currentShape = ""
    while (!["L","Z","J","S","T","O","I"].includes(currentShape)) {
    currentShape = keys[parseInt(keys.length * Math.random())];
    }
    currentRotation = 0;
    var shape = shapes[currentShape];
    var shapeCopy = [];

    for (var i = 0; i < shape.length; i++) {
        shapeCopy[i] = shape[i].slice();
    }
    return shapeCopy;
}

function randomiseColour() {
    var colours = ["green", "blue", "red", "yellow", "purple", "orange", "turquoise"];
    return colours[parseInt(colours.length * Math.random())];
}

function renderBlock() {
    for (let i = 0; i < 4; i++) {
        leftPercent = (currentBlock[i][0]-1)*100;
        topPercent = (currentBlock[i][1]-1)*100;
        block[i].style.transform = "translate(" + leftPercent.toString() + "%, " + topPercent.toString() + "%)";
    }
}

function newBlock() {
    currentBlock = randomiseBlock();
    for (let i = 0; i < 4; i++) {
        if (board[currentBlock[i][1]-1][currentBlock[i][0]-1] != "") {
            gameEnd();
        }
    }
    var colour = randomiseColour();
    for (let i = 0; i < 4; i++) {
        block[i] = document.createElement("div");
        block[i].className = "block";
        block[i].id = colour;
        document.getElementById("tetris-bg").appendChild(block[i]);
        block[i].style.left = "6.95vw"
        block[i].style.top = "0.05vw"
    }
    score += 1;
    document.getElementById("score").innerHTML = "Score: " + score.toString();
}

function moveDown() {
    transformCurrentBlock(0, 1);
}

function transformCurrentBlock(right, down) {
    let invalid = false;
    let finished = false;

    for (let i = 0; i < 4; i++) {
        let newLeft = currentBlock[i][0] + right;
        let newTop = currentBlock[i][1] + down;
        if ((newTop == 21 || board[newTop-1][newLeft-1] != "") && down == 1) {
            finished = true;
            invalid = true;
        } else if (newLeft <= 0 || newLeft > 10 || newTop <= 0 || newTop > 20) {
            invalid = true;
        } else if (board[newTop-1][newLeft-1] != "") {
            invalid = true;
        }
        
    }

    if (!invalid) {
        for (let i = 0; i < 4; i++) {
            currentBlock[i][0] += right;
            currentBlock[i][1] += down;
        }
    }
    renderBlock();
    if (finished) {
        for (let i = 0; i < 4; i++) {
            board[currentBlock[i][1]-1][currentBlock[i][0]-1] = block[i];
            // Instead of storing the id in the board, I store the div itself,
            // as the specification requires you to have duplicate 'id' values.
        }
        
        var placedAudio = new Audio('sounds/block-place.mp3');
        placedAudio.play();
        newBlock();
    }
    for (let y = 0; y < 20; y++) {
        let complete = true;
        for (let x = 0; x < 10; x++) {
            if (board[y][x] == "") {
                complete = false;
            }
        }
        if (complete) {
            var completeAudio = new Audio('sounds/line-remove.mp3');
            completeAudio.play();
            for (let y2 = y; y2 >= 0; y2--) {
                for (let x2 = 0; x2 < 10; x2++) {
                    if (y2 == 0) {
                        board[y2][x2] = "";
                    } else {
                        if (y2 == y) {
                            board[y2][x2].remove();
                        }
                        board[y2][x2] = board[y2-1][x2];
                    }
                    if (board[y2][x2] != "") {
                        let leftPercent = x2*100;
                        let topPercent = y2*100;
                        board[y2][x2].style.transform = "translate(" + leftPercent.toString() + "%, " + topPercent.toString() + "%)";
                    }
                }
            }
            y--;
        }
    }
    renderBlock();
}

function rotate() {
    let suggestedRotation = (currentRotation + 1) % 4
    let invalid = false;

    for (let i = 0; i < 4; i++) {
        let newLeft = rotations[currentShape][suggestedRotation][i][0] + currentBlock[i][0];
        let newTop = rotations[currentShape][suggestedRotation][i][1] + currentBlock[i][1];
        if (newLeft <= 0 || newLeft > 10 || newTop <= 0 || newTop > 20) {
            invalid = true;
        } else if (board[newTop-1][newLeft-1] != "") {
            invalid = true;
        }
    }
    if (!invalid) {
        currentRotation = suggestedRotation;
        for (let i = 0; i < 4; i++) {
            currentBlock[i][0] += rotations[currentShape][currentRotation][i][0]
            currentBlock[i][1] += rotations[currentShape][currentRotation][i][1]
        }
        renderBlock();
        var rotateAudio = new Audio('sounds/block-rotate.mp3');
        rotateAudio.play();
    }
}

function keyPress(e) {

    e = e || window.event;
    if (e.keyCode == '37' || e.keyCode == '38' || e.keyCode == '39' || e.keyCode == '40' ) {
        e.preventDefault();
    }
    if (e.keyCode == '40') {
        // down arrow
        transformCurrentBlock(0, 1);
    } else if (e.keyCode == '37') {
       // left arrow
       transformCurrentBlock(-1, 0);
    } else if (e.keyCode == '39') {
       // right arrow
       transformCurrentBlock(1, 0);
    } else if (e.keyCode == '38') {
        rotate();
    }

}

function gameEnd() {
    clearInterval(intervalID);
    var f = document.createElement("form");
    f.action="leaderboard.php";
    f.method="POST";
    f.target='_self'; 
    f.style.display = 'none';

    var i=document.createElement("input");
    i.type= "text";
    i.name= "score";
    i.value= score;
    f.appendChild(i);

    document.body.appendChild(f);
    f.submit();
}