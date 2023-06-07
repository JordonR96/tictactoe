
// Game Tile Factory function

// TODO button needs to be inacive when game is happening, and when in game over state (so players cant restart without board clear)
// TODO Deactivate play button when active. - also when game over so you cant press play without resetting borad - auto reset?
// TODO use player name for turns, winner etc - still tlel them whethwe thay are placing an O or an X
// TODO styles, clearly telegraph actions, different colors for certain statuses?
// TODO mayve resrtucture code so were not using globals and passing reference to game manager.
// Add title, check mobile
//check todos

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

let globalUIReference = undefined;
let globalBoardReference = undefined;

const gameManager = (function() {
    const players = ["X", "O"];
    let active = undefined
    const getActive = () => {
        return active;
    }

    const setActive = new_active => {
        active = new_active;
        // TODO remove this hack, only exists until i make game manager not immediately invokes and pass in the references it needs.
        if (globalUIReference) {
            if (active) {
                globalUIReference.deactivatePlayButton();
            } else {
                globalUIReference.activatePlayButton();
            }
        }
    }

    let current_player = players[0]

    let tileValues = [];

    let o_indexes = undefined;
    let x_indexes = undefined;
    let winner = undefined;

    let setInitialValues = () => {
        setActive(false)
        tileValues = [
            undefined, undefined,undefined, 
            undefined,undefined,undefined,
            undefined,undefined,undefined,
        ];
        o_indexes = new Set();
        x_indexes = new Set()
        winner = undefined
    }

    setInitialValues();

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

    const reset = () => {
        end();
        globalBoardReference.clear();
        setInitialValues();
        globalUIReference.setGameStatusLabel("Press Play!");
    }


    
    const initialise = () => {
        if (getActive()) return;
        setActive(true)
        globalUIReference.setGameStatusLabel("Player X's Turn!");
        winner = undefined;
        // clear our record of tile values
        tileValues.forEach((_, i) => tileValues[i] = undefined);
        // alternatively we could get rid of old and draw whole new one but thats a lot of work
    }

    const end = () => {
        setActive(false)
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
            end();
            globalUIReference.setGameStatusLabel(`Player ${winner}'s Wins!`);
            
        }

    };
    
    const decideDraw = () => {
        if (!tileValues.includes(undefined)) {
            end();
            globalUIReference.setGameStatusLabel("Draw!");
        }
    }

    const switchPlayer = () => {
        current_player = current_player === players[0] ? players[1] : players[0];
        globalUIReference.setGameStatusLabel(`Player ${current_player}'s Turn!`);
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
        
        // if winner is found, active is false
        checkWinner();

        decideDraw();
        
        if (getActive()) {

            switchPlayer();
        
        }
    }
    return {
        getCurrentPlayer,
        recordTileValue,
        getActive,
        initialise,
        reset
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

    let clearValue = () => {
        value = undefined;
        tileValue.innerText = "";
        tileValue.classList.remove("black_text");
        tileValue.classList.remove("red_text");
    }

    const tilePressed = () => {
        // if game isnt active yet, return.
        if (!gameManager.getActive()) {
            return;
        }

        // just return if value already exists,
        if (value) {return;}

        const current_player = gameManager.getCurrentPlayer()
        setValue(current_player);
        gameManager.recordTileValue(id, current_player);
    }

    tileElement.addEventListener("click", function() {
        tilePressed();
    });
    
    const draw = container => {
        container.appendChild(tileElement);
    }

    return {
        draw,
        clearValue
    }
}

const gameBoard = function() {

    const gameBoardElement = document.createElement("div");
    gameBoardElement.classList.add("game-board")
    
    const tileReference = [];

    const drawTiles = (n) => {
        for (let i = 0; i < n; i++) {
            let tile = gameTile(i);
            tile.draw(gameBoardElement);
            tileReference.push(tile);
        }
    }

    const draw = (container) => {
        drawTiles(9)
        container.appendChild(gameBoardElement)
    }

    const clear = () => {
        tileReference.forEach(tile => tile.clearValue())
    }

    return {
        draw,
        clear
    }

}

const textbox = function(id, label, placeholder) {
    let value = "";

    let setValue = () => {
        value = textElement.value
    }

    let getValue = () => value;

    let textbox_container = document.createElement("div");
    textbox_container.classList.add("ui-field");
    textbox_container.id = id;
    
    let labelElement = document.createElement("label");
    labelElement.setAttribute("for", id);
    labelElement.classList.add("ui-label");
    labelElement.innerText = label;

    let textElement = document.createElement("input");

    textElement.classList.add("ui-textbox");
    textElement.setAttribute("type", "text");
    textElement.setAttribute("name", id);
    textElement.setAttribute("placeholder", placeholder);
    textElement.oninput = setValue;

    textbox_container.appendChild(labelElement);
    textbox_container.appendChild(textElement);

    const draw = container => container.appendChild(textbox_container)

    return {
        draw,
        getValue
    }
}


const button = function(name, clickHandler) {
    let buttonElement = document.createElement("button");
    let active = true;
    buttonElement.classList.add("ui-btn");
    buttonElement.addEventListener("click", e => {

        if (!active) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        clickHandler()
    });
    buttonElement.innerText = name;

    const activate = () => {
        active = true;
        buttonElement.classList.remove("btn-inactive")
    }

    const deactivate = () => {
        active  = false;
        buttonElement.classList.add("btn-inactive")

    }

    const draw = container => container.appendChild(buttonElement)

    return {
        draw,
        activate,
        deactivate
    }
}

const uiText = function( value, initiallyHidden) {
    let hidden = undefined;
    let setValue = new_value => {
        value = new_value;
        uiTextContainer.innerText = value;
    }

    let hide = () =>  {
        if (hidden) return;

        uiTextContainer.classList.add("hidden");
    }

    let show = () => {
        if (!hidden) return;

        uiTextContainer.classList.remove("hidden");
    }

    let uiTextContainer = document.createElement("div");
    uiTextContainer.classList.add("ui-commander");
    uiTextContainer.innerText = value;
    if (initiallyHidden) {
        hide();
    } 

    hidden = initiallyHidden;

    const draw = container => container.appendChild(uiTextContainer)


    return {
        draw,
        setValue,
        hide,
        show
    }
}

const gameUI = function() {
    const uiElement = document.createElement("div");
    uiElement.classList.add("game__ui");

    const player1Name = textbox("player_one_name", "Player X", "Enter Name");
    player1Name.draw(uiElement);

    const player2Name = textbox("player_two_name", "Player O", "Enter Name");
    player2Name.draw(uiElement);

    const gameStatus = uiText("Press Play!", false);
    gameStatus.draw(uiElement);

    const play_button = button("Play", () => gameManager.initialise() ) 
    play_button.draw(uiElement);

    const reset_button = button("Reset", () => gameManager.reset() ) 
    reset_button.draw(uiElement);

    const draw = container => container.appendChild(uiElement)

    const setGameStatusLabel = newValue => {
        gameStatus.setValue(newValue);
    
    }

    const activatePlayButton = () => {
        play_button.activate();
    }

    const deactivatePlayButton = () => {
        play_button.deactivate();
    }


    

    return {
        draw,
        setGameStatusLabel,
        activatePlayButton,
        deactivatePlayButton
    }
}

// Keeo app module and draw funtion at the end
const app = (function() {
    const appElement = document.createElement("div");
    appElement.classList.add("app")

    const draw = () => {

        globalUIReference = gameUI();
        globalUIReference.draw(appElement);

        globalBoardReference = gameBoard();
        globalBoardReference.draw(appElement);
        
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