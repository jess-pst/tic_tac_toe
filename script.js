const state = {
    board: Array(9).fill(""),
    currentPlayer: "X",
    gameOver: false,
    xWins: 0,
    oWins: 0,
    gameMode: "single"
}


const cells = document.querySelectorAll(".cell");

const statusMessage = document.getElementById("status");
const xWins = document.getElementById("xWins");
const oWins = document.getElementById("oWins");

const gameMessage = document.getElementById("gameMessage");
const gameOverModal = document.getElementById("gameOverModal");

const gameModeSingle = document.getElementById("gameModeSingle");
const gameModeMulti = document.getElementById("gameModeMulti");
const gameRules = document.getElementById("gameRules");
const playAgain = document.getElementById("playAgain");
const resetButton = document.getElementById("resetButton");
const quit = document.getElementById("quit");


//If a cell is clicked, call handleCellCLick()
cells.forEach( (cell, index) => {
    cell.addEventListener("click", () => {
        if (!state.gameOver) {
            handleCellClick(index);
        }
    })
})


function handleCellClick(index){
    //Function that takes an index and call makeMove() if it's valid
    if (state.board[index] != "" || state.gameOver) return;

    if (state.gameMode == "single" && state.currentPlayer != "X") return;
    
    makeMove(index, state.currentPlayer);
    
    if (state.gameMode == "single" && !state.gameOver){
        setTimeout(aiMove, 500);
    }

}




function makeMove(index, player){
    //Function that make the move, and check if it's a winning move, if the game can go on or if it's a draw
    state.board[index] = player;
    render();

    const winningCombo = checkWinner(player);
    if (winningCombo){
        state.gameOver = true;
        if (player == "X"){
            state.xWins++;
            xWins.textContent = state.xWins;
        } else{ //if player == "O"
            state.oWins++;
            oWins.textContent = state.oWins;
        }
        highlightWinningCells(winningCombo);
        setTimeout(() => {
            showGameOverModal(player);
        }, 600);   
    } else if (isBoardFull()){
        state.gameOver = true;
        showGameOverModal("draw");
    } else{
        state.currentPlayer = state.currentPlayer == "X"? "O" : "X";
        updateStatus();
    }
    
}


function render(){
    //Function that uploads cells to match state.board
    state.board.forEach( (cell, index) =>{
        cells[index].textContent = cell;
    })
}


const WINNING_COMBOS = [
    [0,1,2], [3,4,5], [6,7,8],   //lines
    [0,3,6], [1,4,7], [2,5,8],  //columns
    [0,4,8], [2,4,6]            //diagonals
];

function checkWinner(player){
    //Function that returns true if player has a winning combo
    for (let combo of WINNING_COMBOS){
        if (state.board[combo[0]] == player &&
            state.board[combo[1]] == player &&
            state.board[combo[2]] == player){
            return combo;
        }
    }
    return null; 
}



function highlightWinningCells(combo){
    //Function that adds a class to the winning cells, wich css colors after
    combo.forEach(index => { 
        cells[index].classList.add('winning-cell');
    });
}


function showGameOverModal(player){
    //Function that opens a modal when the game is over
    if (player == "draw"){
        gameMessage.textContent = "It's a draw!";
    }
    if (state.gameMode == "single"){
        if (player == "X"){
            gameMessage.textContent = "Congratulations, you won!";
        } else if (player == "O"){
            gameMessage.textContent = "Sorry, you lost!";
        }
    } else{ //if gameMode = multi
        if (player == "X"){
            gameMessage.textContent = "Player X wins!";
        } else if (player == "O"){
            gameMessage.textContent = "Player O wins!";
        }
    }
    gameOverModal.classList.remove('hidden');
    setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        modalContent.classList.add('show');
    }, 50);
}


function isBoardFull(){
    //Function that returns true if state.board is full
    return state.board.every(cell => cell != "");
}


function updateStatus(){
    //Function that uploads wich player is it the turn of after every move
    if (state.gameMode == "single"){
        if (state.currentPlayer == "X"){
            statusMessage.textContent = "Your turn (X)"
        } else{
            statusMessage.textContent = "AI thinking ..."
        }
    } else{ //if gameMode = multi
        statusMessage.textContent = `Player ${state.currentPlayer}'s turn`;
    }
}


function aiMove(){
    //Function to help ai decide what to play with an algorithm
    if (state.gameOver || state.currentPlayer !== 'O') return;

    const emptyCells = [];
    state.board.forEach( (cell, index) => {
        if (cell == ""){
            emptyCells.push(index);
        }
    })

    if (emptyCells.length == 0) return;

    //1 - Trying to win
    const winningMove = findWinningMove("O");
    if (winningMove != -1){
        makeMove(winningMove, "O");
        return;
    }

    //2 - Block X
    const blockingMove = findWinningMove("X");
    if (blockingMove != -1){
        makeMove(blockingMove, "O");
        return;
    }

    //Else - Random move
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    makeMove(emptyCells[randomIndex], 'O');

}


function findWinningMove(player){
    //Function that search if a final winning move is possible
    for (let combo of WINNING_COMBOS){
        let winning_cells = 0 //to know if we have a chance to win
        let potential = []; //to store the potential index
        for (let index of combo){
            if (state.board[index] == player) winning_cells++;
            else if (state.board[index] == "") potential.push(index);
        }
        if (winning_cells == 2 && potential.length == 1){
            return potential[0];
        }
    }
    return -1;
}


gameModeSingle.addEventListener('click', () => setGameMode('single'));
gameModeMulti.addEventListener('click', () => setGameMode('multi'));

function setGameMode(mode) {
    //Function that initialise the game
    state.gameMode = mode;
    resetGame();
    
    if (mode === 'single') {
        statusMessage.textContent = "Mode 1 Player - You are X";
        gameModeSingle.style.background = '#f6c479';
        gameModeMulti.style.background = '#fff4e3';
    } else {
        statusMessage.textContent = "Mode 2 Players - X starts";
        gameModeMulti.style.background = '#f6c479';
        gameModeSingle.style.background = '#fff4e3';
    }
}

gameRules.addEventListener('click', showRules);

function showRules() {
    //Function to show the rules
    alert("Tic Tac Toe Rules:\n\n \
        • Players take turns placing X and O\n \
        • First to get 3 in a row wins\n \
        • Can be horizontal, vertical or diagonal\n \
        • Click any empty cell to play");
}


resetButton.addEventListener('click', resetGameAndScores);
playAgain.addEventListener('click', resetGame);
quit.addEventListener('click', quitGame);

function resetGameAndScores() { 
    //Function to reset back while keeping the mode
    state.xWins = 0;
    state.oWins = 0;
    xWins.textContent = "0";
    oWins.textContent = "0";
    resetGame();
    setGameMode(state.gameMode);

}

function resetGame(){
    //Function to reset only the table and keep the scores
    state.board = Array(9).fill("");
    state.currentPlayer = "X";
    state.gameOver = false;
    render();
    clearWinningCells();
    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.remove('show');
    gameOverModal.classList.add('hidden');
    updateStatus();
}

function quitGame() {
    //Function to quit and reset back to default mode
    state.xWins = 0;
    state.oWins = 0;
    xWins.textContent = "0";
    oWins.textContent = "0";
    resetGame();
    setGameMode('single');
}

function clearWinningCells(){
    cells.forEach(cell => { 
        cell.classList.remove('winning-cell');
    });
}


//Initialisation
setGameMode("single");