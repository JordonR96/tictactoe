
// Game Tile Factory function

// TODO finish ui (setting player name, gameover message, restart button)
// TODO handle reset properlt

// intersection function from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function intersection(setA, setB) {
    const _intersection = new Set();
    for (const elem of setB) {
      if (setA.has(elem)) {
        _intersection.add(elem);
      }
    }
    return _intersection;
}

const gameManager = (function() {

    let active = false

    const players = ["X", "O"];

    let current_player = players[0]

    const tileValues = [
        undefined, undefined,undefined, 
        undefined,undefined,undefined,
        undefined,undefined,undefined,
    ];

    // winning indexes, need to be lowest to highets indexes.
    let winningIndexes = [
        // Horizontal win
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // vertical win
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // diagonal win
        [0, 4, 8],
        [2, 4, 6]

    ]
    // convert indexes to Sets
    winningIndexes = winningIndexes.map(value => new Set(value));

    let o_indexes = new Set();
    let x_indexes = new Set();
    let winner = undefined;

    const getActive = () => {
        return active;
    }

    const initialise = () => {
        console.log("starting");
        // TODO consider set active instead of this then all this is side affect of setting active to true
        active = true ;
        winner = undefined;
        // clear our record of tile values
        tileValues.forEach((_, i) => tileValues[i] = undefined);
        // TODO need to be abel to clear the board, to do that we need set board method so we have reference to the current board here.
        // alternatively we could get rid of old and draw whole new one but thats a lot of work
    }

    const checkWinner = () => {
        
        winningIndexes.forEach(win => {

            if (intersection(o_indexes, win).size === 3) {
                winner = "O";
            }

            if (intersection(x_indexes, win).size === 3) {
                winner = "X";
            }
        })

        if (winner) {
            active = false
            console.log(winner + "Wins")
        }

    };
    
    const switchPlayer = () => {
        current_player = current_player === players[0] ? players[1] : players[0];
    }

    const getCurrentPlayer = () => current_player

    const recordTileValue = (i , value) => { 
        // record the value of the clicked tile
        tileValues[i] = value;
        if (value === "X") {
            x_indexes.add(i);
        } else if (value === "O") {
            o_indexes.add(i);
        }
        
        checkWinner();

        if (!tileValues.includes(undefined)) {
            console.log("Game Over");
        }

        switchPlayer();
    }
    return {
        getCurrentPlayer,
        recordTileValue,
        getActive,
        initialise
    }
    
})()


const gameTile = function(id) {

    let value = null;
    const tileElement = document.createElement("div");
    tileElement.classList.add("game-board__tile");
    tileElement.id = id;

    const tileValue = document.createElement("div");
    tileValue.classList.add("game-board__tile__text")
    tileElement.appendChild(tileValue);

    const setValue = new_value => {
        
        new_value = new_value.toUpperCase();
        
        if (new_value !== "X" && new_value !== "O") {
            throw new Error("only X and O accepted for tile values");
        }

        value = new_value;
        tileValue.innerText = value;
        tileValue.classList.add(value === "X" ? "black_text" : "red_text");
    } 

    tileElement.addEventListener("click", function() {
        
        // if game isnt active yet, return.
        if (!gameManager.getActive()) {return;}

        // just return if value already exists,
        if (value) {return;}

        const current_player = gameManager.getCurrentPlayer()
        setValue(current_player);
        gameManager.recordTileValue(id, current_player);
    });
    
    const draw = container => {
        container.appendChild(tileElement);
    }

    return {
        draw
    }
}

const gameBoard = function() {

    const gameBoardElement = document.createElement("div");
    gameBoardElement.classList.add("game-board")
    
    const drawTiles = (n) => {
        for (let i = 0; i < n; i++) {
            let tile = gameTile(i);
            tile.draw(gameBoardElement);
        }
    }

    const draw = (container) => {
        drawTiles(9)
        container.appendChild(gameBoardElement)
    }

    return {
        draw
    }

}

const textbox = function(label, placeholder, changeCallback) {
    let value = "";
    
    let textElement = document.createElement("input");

    textElement.classList.add("textbox");
    textElement.setAttribute("type", "text");
    textElement.setAttribute("placeholder", placeholder);
    textElement.addEventListener("change", changeCallback);

    const draw = container => container.appendChild(textElement)

    return {
        draw
    }
}


const button = function(name, clickHandler) {
    let buttonElement = document.createElement("button");
    buttonElement.classList.add("btn");
    buttonElement.addEventListener("click", clickHandler);
    buttonElement.innerText = name;

    const draw = container => container.appendChild(buttonElement)

    return {
        draw
    }

}

const gameUI = function() {
    const uiElement = document.createElement("div");
    uiElement.classList.add("game__ui");

    const play_button = button("Play", () => gameManager.initialise() ) 
    play_button.draw(uiElement);

    const draw = container => container.appendChild(uiElement)

    return {
        draw
    }
}



// Keeo app module and draw funtion at the end
const app = (function() {
    const appElement = document.createElement("div");
    appElement.classList.add("app")

    const draw = () => {

        let ui = gameUI();
        ui.draw(appElement);


        let board = gameBoard();
        board.draw(appElement);
        
        let root = document.getElementById('root');
        root.appendChild(appElement);

    }

    return {
        draw
    }
})();

window.addEventListener("DOMContentLoaded", () => {
    app.draw();
});