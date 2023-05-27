
// Game Tile Factory function
// TODO make click handler work from the gameboard module
// needs to recognise current player, then pass that as value to this
// then update the game object
const gameTile = function(x, y, clickHandler) {

    let value = null;

    if (Number.isNaN(x) || Number.isNaN(y)) {
        throw new Error("x and y coordinated must be numbers")
    }

    if (!Number.isInteger(x) || !Number.isInteger(y)) {
        throw new Error("x and y coordinated must be integers")
    }

    const tileElement = document.createElement("div");
    tileElement.classList.add("game-board__tile");
    tileElement.id= `${x}${y}`;

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

    const tileValues = [];

    const drawTiles = (xmax, ymax) => {
        for (let y = 0; y < ymax; y++) {
            for (let x = 0; x < xmax; x++) {
                
                let tile = gameTile(x, y);
                tile.draw(gameBoardElement);
                tileValues.push(tile);
                
            }
        }
    }

    const draw = (container) => {
        drawTiles(3, 3)
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