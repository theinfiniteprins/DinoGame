
let isPaused = false;
document.addEventListener("keydown", function (e) {
    if (e.key === "p" || e.key === "P") {
        isPaused = !isPaused;
    }
});

//board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;
let path;

//dino
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;

let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight
}
let timeoutId;
//cactus
let cactusArray = [];

let cactus1Width = 34;
let cactus2Width = 69;
let cactus3Width = 102;
let coinWidth = 69;

let cactusHeight = 70;
let cactusX = 750;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;
let coinImg;
let blank;

//physics
let velocityX = -8; //cactus moving left speed
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;
let coincounter = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); //used for drawing on the board

    dinoImg = new Image();
    getImg();
    dinoImg.onload = function () {
        dinoImg= getImg();
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }

    cactus1Img = new Image();
    cactus1Img.src = "./img/cactus1.png";

    cactus2Img = new Image();
    cactus2Img.src = "./img/cactus2.png";

    cactus3Img = new Image();
    cactus3Img.src = "./img/cactus3.png";

    coinImg = new Image();
    coinImg.src = "./img/coin.png";

    blank = new Image();
    blank.src = "./img/blank.png";

    path = new Image();
    path.src = "./img/track.png";

    requestAnimationFrame(update);
    setInterval(placeCactus, 1000);

}

let soundctr = 0;
let onsound = 1000;

function update() {
    requestAnimationFrame(update);
    if (isPaused) {
        // Don't update the game if it's paused.
        return;
    }
    if (gameOver) {
        return;
    }
    soundctr++;
    if (soundctr >= onsound) {
        play();
        onsound += 1000;
        velocityX--;
    }
    
   
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(path,0,220,750,30);
    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);
        if(cactus.img == coinImg && detectCollision(dino, cactus) )
        {
            cactus.img = blank;
            coincounter++;
            playoncollect();
        }
        else if (detectCollision(dino, cactus) && cactus.img !== blank) {
          
            gameOver = true;
            if (!isDown) {
                dinoImg.src = "./img/dino-dead.png";
                dinoImg.onload = function () {
                    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
                }
            }
            endplay();
            let endimg = new Image();
            endimg.src = "./img/game-over.png";
            context.drawImage(endimg, 180, 100, 386, 40);
        }
    }

    //score
    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    // `Score: ${Math.trunc(score / 10)}`
    context.fillText(`Score: ${Math.trunc(score / 10)}`, 5, 20, 100);

    //coincount
    context.fillStyle = "black";
    context.font = "20px courier";
    context.fillText(`Coins: ${Math.trunc(coincounter)}`, boardWidth - 125, 20);

    document.addEventListener("keydown", moveDino);
    document.addEventListener("keyup", refres);
    document.addEventListener("click", moveDino1);
}

let isDown = false;
function play() {
    let beepsound = new Audio("./Sound/Beep.mp3");
    beepsound.play();
}

function endplay() {
    let lastsound = new Audio("./Sound/endsound1.mp3");
    lastsound.play();
}

function playonjunp() {
    let beepsound = new Audio("./Sound/jump.mp3");
    beepsound.play();
}

function playoncollect() {
    let beepsound = new Audio("./Sound/coincollect.mp3");
    beepsound.play();
}

function refres() {
    if(!gameOver && isDown)
    dinoImg = getImg();
    dinoY = 156;
    dino.height = 94;
    isDown = false;
}

function reload() {
    location.reload();
}
function moveDino1() {
    if (gameOver) {
        return;
    }
    playonjunp();
    if (dino.y == dinoY)
        velocityY = -11;
}

function moveDino(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
        //jump
        if(!isDown)
        playonjunp();
        refres()
        velocityY = -11;
        isDown = false;
    }
    else if (e.code == "ArrowDown" && dino.y == dinoY) {
        //duck
        if (timeoutId) {
            clearTimeout(timeoutId); // Clear the previous timeout if it exists
        }
        isDown = true;
        dinoImg.src = "./img/dino-duck1.png";
        dino.height = 60;
        dinoY = 190;
    }
    else if (e.code == "Backspace" || e.code == "Delete") gameOver = true;
}

const imageUrls = [
    "./img/dino-run1.png",
    "./img/dino-run2.png",
];

let ci=0;
function getImg()
{
    let Img = new Image();
    if(!isDown)
    Img.onload = function() {
        dinoImg = Img; // Update the dinoImg with the new image
    };
    Img.src = imageUrls[ci]
    ci = (ci+1)%imageUrls.length;

}
setInterval(getImg,100);

function placeCactus() {
    if (gameOver) {
        let endimg = new Image();
        endimg.src = "./img/game-over.png";
        context.drawImage(endimg, 180, 100, 386, 40);
        cancelAnimationFrame(update);
        return;
    }

    //place cactus
    let cactus = {
        img: null,
        x: cactusX,
        y: cactusY,
        width: null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random(); //0 - 0.9999...

    if (placeCactusChance > .85) {
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .65) { 
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .45) { //80% you get cactus1
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }
    else if(placeCactusChance > .20)
    {
        cactus.img = coinImg;
        cactus.width = coinWidth;
        cactusArray.push(cactus);
    }
    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}