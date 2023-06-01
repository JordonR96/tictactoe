
// Game Tile Factory function
// TODO grid cell ssize adjusts when entering a value - fix;
// TODO style grid values.
// TODO add win/draw conditions.
// TODO Add some controls ui, including start game, reset (will need clear board function) and winner view.

const gameManager = (function() {
    const players = ["X", "O"];

    let current_player = players[0]

    const tileValues = [
        undefined, undefined,undefined, 
        undefined,undefined,undefined,
        undefined,undefined,undefined,
    ];

    const switchPlayer = () => {
        current_player = current_player === players[0] ? players[1] : players[0];
    }

    const getCurrentPlayer = () => current_player

    const recordTileValue = (i , value) => { 
        // record the value of the clicked tile
        tileValues[i] = value;
        console.log(tileValues);
        switchPlayer();

    }
    return {
        getCurrentPlayer,
        recordTileValue
    }
    
})()


const gameTile = function(id) {

    let value = null;
    const tileElement = document.createElement("div");
    tileElement.classList.add("game-board__tile");
    tileElement.id = id;

    tileElement.addEventListener("click", function() {
        // just return if value already exists,
        if (value) {return;}


        const current_player = gameManager.getCurrentPlayer()
        setValue(current_player);
        gameManager.recordTileValue(id, current_player);
    });

    const setValue = new_value => {
        
        new_value = new_value.toUpperCase();
        
        if (new_value !== "X" && new_value !== "O") {
            throw new Error("only X and O accepted for tile values");
        }

        value = new_value;
        tileElement.innerText = value;
    } 
    
    const draw = container => {
        container.appendChild(tileElement);
    }

    return {
        draw
    }
}

const gameBoard = (function() {

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

})()



// Keeo app module and draw funtion at the end
const app = (function() {
    const appElement = document.createElement("div");
    appElement.classList.add("app")

    const draw = () => {
        
        gameBoard.draw(appElement);
        
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