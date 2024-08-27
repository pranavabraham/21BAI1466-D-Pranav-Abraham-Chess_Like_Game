const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Set up Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const GRID_SIZE = 5;

class Character {
    constructor(name, player) {
        this.name = name;
        this.player = player;
        this.position = null;
    }

    setPosition(position) {
        this.position = position;
    }

    validMove(move) {
        throw new Error("This method should be overridden in subclasses");
    }
}

class Pawn extends Character {
    validMove(move) {
        const [x, y] = this.position;
        switch (move) {
            case "L":
                return [x, y - 1];
            case "R":
                return [x, y + 1];
            case "F":
                return [x - 1, y];
            case "B":
                return [x + 1, y];
            default:
                return null;
        }
    }
}

class Hero1 extends Character {
    validMove(move) {
        const [x, y] = this.position;
        switch (move) {
            case "L":
                return [x, y - 2];
            case "R":
                return [x, y + 2];
            case "F":
                return [x - 2, y];
            case "B":
                return [x + 2, y];
            default:
                return null;
        }
    }
}

class Hero2 extends Character {
    validMove(move) {
        const [x, y] = this.position;
        switch (move) {
            case "FL":
                return [x - 2, y - 2];
            case "FR":
                return [x - 2, y + 2];
            case "BL":
                return [x + 2, y - 2];
            case "BR":
                return [x + 2, y + 2];
            default:
                return null;
        }
    }
}

class Game {
    constructor() {
        this.board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
        this.players = {};
        this.turn = "A";
    }

    addPlayer(playerId) {
        this.players[playerId] = [];
    }

    placeCharacter(playerId, character, position) {
        const [x, y] = position;
        this.board[x][y] = character;
        character.setPosition(position);
        this.players[playerId].push(character);
    }

    moveCharacter(playerId, charName, move) {
        const character = this.players[playerId].find(c => c.name === charName);
        if (character) {
            const newPosition = character.validMove(move);
            if (this.isValidPosition(newPosition) && !this.board[newPosition[0]][newPosition[1]]) {
                const [oldX, oldY] = character.position;
                this.board[oldX][oldY] = null;
                this.board[newPosition[0]][newPosition[1]] = character;
                character.setPosition(newPosition);
                return true;
            }
        }
        return false;
    }

    isValidPosition(position) {
        if (!position) return false;
        const [x, y] = position;
        return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
    }

    getBoardState() {
        return this.board.map(row => row.map(cell => (cell ? `${cell.player}-${cell.name}` : ".")));
    }
}

wss.on('connection', (ws) => {
    const game = new Game();

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            const playerId = data.player;
            game.addPlayer(playerId);
            ws.send(JSON.stringify({ type: 'joined', player: playerId }));

        } else if (data.type === 'place') {
            const playerId = data.player;
            data.characters.forEach(charData => {
                let character;
                const { name, type, position } = charData;
                if (type === 'P' || type === 'P2' || type === 'P3') {
                    character = new Pawn(name, playerId);
                } else if (type === 'H1') {
                    character = new Hero1(name, playerId);
                } else if (type === 'H2') {
                    character = new Hero2(name, playerId);
                }
                game.placeCharacter(playerId, character, position);
            });
            ws.send(JSON.stringify({ type: 'board', state: game.getBoardState() }));

        } else if (data.type === 'move') {
            const { player, character, move } = data;

            if (game.turn !== player) {
                ws.send(JSON.stringify({ type: 'error', message: "Not your turn" }));
            } else {
                if (game.moveCharacter(player, character, move)) {
                    game.turn = game.turn === "A" ? "B" : "A";
                    ws.send(JSON.stringify({ type: 'board', state: game.getBoardState() }));
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: "Invalid move" }));
                }
            }
        }
    });

    ws.send(JSON.stringify({ type: 'init' }));
});


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

server.listen(process.env.PORT || 8080, () => {
    console.log('Server is running on port 8080');
});
