import BLOCKS from "./Blocks.js"

const tool = document.querySelector('.tool > ul');
const gameText = document.querySelector(".game-text");
const restartButton = document.querySelector(".game-text > button");
const scoreDisplay = document.querySelector(".score");
const rotateBtn = document.querySelector(".rotate_button");
const leftBtn = document.querySelector(".left_button");
const downBtn = document.querySelector(".down_button");
const rightBtn = document.querySelector(".right_button");
const dropBtn = document.querySelector(".drop_button");

//세팅
const Game_Rows = 20;
const Game_Cols = 10;

let score = 0;
let highScore = parseInt(localStorage.getItem("tetrisHighScore")) || 0;
let duration = 500;
let downInterval;
let tempMovingItem;



const movingItem = {
    type: "null",
    direction: 3,
    top: 0,
    left: 3
};

init()
//Functions
function init() {
    score = 0;
    updateScoreDisplay();
    tempMovingItem = { ...movingItem };
    for (let i = 0; i < Game_Rows; i++) {
        prependLine();
    }
    generateNewBlock();
}

function prependLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j = 0; j < Game_Cols; j++){
        const matrix = document.createElement("li"); 
        ul.prepend(matrix);
    }
    li.prepend(ul)
    tool.prepend(li)
}
function renderingBlocks(moveType = "null") {
    const { type, direction, top, left } = tempMovingItem;
    const BlockMovement = document.querySelectorAll(".motion")
    BlockMovement.forEach(motion=>{
        motion.classList.remove(type, "motion");
    })
    BLOCKS[type][direction].some(block=> {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = tool.childNodes[y] ? tool.childNodes[y].childNodes[0].childNodes[x] : null;
        const dropAvailable = checkEmpty(target);
        if(dropAvailable) {
            target.classList.add(type, "motion")
        } else {
            tempMovingItem = { ...movingItem}
            if(moveType === 'retry') {
                clearInterval(downInterval)
                showGameoverText()
            }
            setTimeout(()=>{
                renderingBlocks('retry');
                if(moveType ==="top"){
                    seizeBlock();
                }
                
            },0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}
function seizeBlock() {
    const BlockMovement = document.querySelectorAll(".motion")
    BlockMovement.forEach(motion=>{
        motion.classList.remove("motion");
        motion.classList.add("seized");
    })
    checkMatch()
}
function checkMatch() {
    const childNodes = tool.childNodes;
    let linesCleared = 0;

    childNodes.forEach(child => {
        let matched = true;
        child.childNodes[0].childNodes.forEach(li => {
            if (!li.classList.contains("seized")) {
                matched = false;
            }
        });
        if (matched) {
            child.remove();
            prependLine();
            linesCleared++;
        }
    });

    if (linesCleared === 1) score += 1;
    else if (linesCleared === 2) score += 3;
    else if (linesCleared === 3) score += 10;
    else if (linesCleared >= 4) score += 30;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("tetrisHighScore", highScore);
    }
    updateScoreDisplay();

    generateNewBlock();
}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(()=> {
        BlockMovement('top', 1)
    }, duration)

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length)
    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    renderingBlocks() 
}
function checkEmpty(target){
    if(!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}
function BlockMovement(moveType, amount){
    tempMovingItem[moveType] += amount;
    renderingBlocks(moveType)
}
function changeDirection(){
    const direction = tempMovingItem.direction;
    direction ===3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderingBlocks()
}
function drop() {
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        BlockMovement("top",1)
    },10)
}
function showGameoverText() {
    gameText.style.display = "flex"
}
function updateScoreDisplay() {
    scoreDisplay.innerText = `Score: ${score} / High: ${highScore}`;
}
//event control
document.addEventListener("keydown", e => {
    switch(e.keyCode){
        case 39:
                BlockMovement("left", 1);
            break;
        case 37:
            BlockMovement("left", -1);
            break;
        case 40:
            BlockMovement("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            drop();
            break;
        default:
            break;

    }
})


restartButton.addEventListener("click", () => {
    tool.innerHTML = "";
    gameText.style.display = "none"
    init()
})

rotateBtn.addEventListener("click", () => {
    changeDirection();
});
leftBtn.addEventListener("click", () => {
    BlockMovement("left", -1);
});
rightBtn.addEventListener("click", () => {
    BlockMovement("left", 1);
});
downBtn.addEventListener("click", () => {
    BlockMovement("top", 1);
});
dropBtn.addEventListener("click", () => {
    drop();
});
