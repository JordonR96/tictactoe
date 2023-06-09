
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

const gameManager = function() {
    const players = ["X", "O"];
    let active = undefined
    const getActive = () => {
        return active;
    }
    let board;
    let ui;

    const setBoard = new_board => {
        board = new_board;
    }

    const setUI = new_ui => {
        ui = new_ui;
    }

    const setActive = new_active => {
        active = new_active;
        // TODO remove this hack, only exists until i make game manager not immediately invokes and pass in the references it needs.
        if (ui) {
            if (active) {
                ui.deactivatePlayButton();
            } else {
                ui.activatePlayButton();
            }
        }
    }

    let current_player = players[0]

    let tileValues = [];

    let o_indexes = undefined;
    let x_indexes = undefined;
    let winner = undefined;

    let setInitialValues = () => {
        
        tileValues = [
            undefined, undefined,undefined, 
            undefined,undefined,undefined,
            undefined,undefined,undefined,
        ];
        o_indexes = new Set();
        x_indexes = new Set()
        winner = undefined
        winner = undefined;
        tileValues.forEach((_, i) => tileValues[i] = undefined);

        if (board) {
            board.clear();
        }
        current_player = players[0]
    }

    setActive(false);

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
        initialise();
    }

    const getPlayingStatus = () => {
        const current_player_name = ui.getPlayerName(current_player);

        if (!current_player_name || current_player_name === "" ) {
            return `${current_player}\'s turn!`
        } else {
            return `${current_player_name}\'s turn\n\nPlace an ${current_player}`
        }
    };

    const formatWinner = (winner) => {
        const current_player_name = ui.getPlayerName(current_player);

        if (!current_player_name || current_player_name === "" ) {
            return `${winner} Wins!`
        } else {
            return `${current_player_name} Wins!`
        }
    }   

    const initialise = () => {
        if (getActive()) return;
        setActive(true)
        setInitialValues();
        ui.setGameStatusLabel(getPlayingStatus());
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

            ui.setGameStatusLabel(formatWinner(winner));
            
        }

    };
    
    const decideDraw = () => {
        if (!tileValues.includes(undefined)) {
            end();
            ui.setGameStatusLabel("Draw!");
        }
    }

    const switchPlayer = () => {
        current_player = current_player === players[0] ? players[1] : players[0];
        ui.setGameStatusLabel(getPlayingStatus());
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
        reset,
        setBoard,
        setUI
    }
    
}


const gameTile = function(id, manager) {

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
        if (!manager.getActive()) {
            return;
        }

        // just return if value already exists,
        if (value) {return;}

        const current_player = manager.getCurrentPlayer()
        setValue(current_player);
        manager.recordTileValue(id, current_player);
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

const gameBoard = function(manager) {
    if (!manager) {return};

    const gameBoardElement = document.createElement("div");
    gameBoardElement.classList.add("game-board")
    
    const tileReference = [];

    const drawTiles = (n) => {
        for (let i = 0; i < n; i++) {
            let tile = gameTile(i, manager);
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

const textbox = function(id, label, placeholder, characterLimit) {
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

    if (characterLimit && characterLimit > 0) {
        textElement.maxLength = characterLimit;
    }


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

    let text = document.createElement("div");
    text.innerText = value;

    uiTextContainer.appendChild(text);
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

const gameUI = function(manager) {

    if (!manager) {return};

    const uiElement = document.createElement("div");
    uiElement.classList.add("game__ui");

    const name_character_limit = 50;

    const player1Name = textbox("player_one_name", "Player X", "Enter Name", name_character_limit);
    player1Name.draw(uiElement);

    const player2Name = textbox("player_two_name", "Player O", "Enter Name", name_character_limit);
    player2Name.draw(uiElement);

    const getPlayerName = (current_player) => {
        return current_player === "X" ? player1Name.getValue() : player2Name.getValue()
    }

    const gameStatus = uiText("Press Play!", false);
    gameStatus.draw(uiElement);

    const play_button = button("Play", () => manager.initialise() ) 
    play_button.draw(uiElement);

    const reset_button = button("Reset", () => manager.reset() ) 
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
        deactivatePlayButton,
        getPlayerName
    }
}

// Keeo app module and draw funtion at the end
const app = (function() {
    const appElement = document.createElement("div");
    appElement.classList.add("app")

    const draw = () => {
        const manager = gameManager();
        
        const ui = gameUI(manager);
        manager.setUI(ui)
        
        const board = gameBoard(manager);
        manager.setBoard(board)

        ui.draw(appElement);
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