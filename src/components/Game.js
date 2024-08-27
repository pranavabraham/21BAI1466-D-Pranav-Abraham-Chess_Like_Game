import React, { useState, useEffect } from 'react';
import Board from './Board';
import './styles/Game.css';

const Game = () => {
    const [ws, setWs] = useState(null);
    const [boardState, setBoardState] = useState(Array(5).fill(Array(5).fill(".")));
    const [player, setPlayer] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [highlightedCells, setHighlightedCells] = useState([]);
    const [moveHistory, setMoveHistory] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setWs(socket);

        socket.onmessage = (message) => {
            const data = JSON.parse(message.data);

            if (data.type === 'init') {
                // Initialize game or player
            } else if (data.type === 'joined') {
                setPlayer(data.player);
            } else if (data.type === 'board') {
                setBoardState(data.state);
                setHighlightedCells([]);
            } else if (data.type === 'error') {
                alert(data.message);
            }
        };

        return () => {
            socket.close();
        };
    }, []);

    const handleCellClick = (row, col) => {
        if (selectedCharacter) {
            const move = prompt("Enter move command (e.g., L, R, F, B):");
            if (move) {
                ws.send(JSON.stringify({
                    type: 'move',
                    player: player,
                    character: selectedCharacter,
                    move: move
                }));
                setMoveHistory(prevHistory => [...prevHistory, { character: selectedCharacter, move }]);
                setSelectedCharacter(null);
            }
        }
    };

    const handleCharacterSelect = (character) => {
        setSelectedCharacter(character);
        // Calculate and highlight valid moves (dummy implementation)
        const validMoves = [[2, 2], [2, 3]]; // Replace with actual valid moves calculation
        setHighlightedCells(validMoves);
    };

    const handleRestart = () => {
        // Restart the game (for simplicity, just reloading the page)
        window.location.reload();
    };

    if (gameOver) {
        return (
            <div className="game-over">
                <h1>Game Over</h1>
                <button onClick={handleRestart}>Restart Game</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Player {player}</h1>
            <Board boardState={boardState} onCellClick={handleCellClick} highlightedCells={highlightedCells} />
            <div className="controls">
                <button onClick={() => handleCharacterSelect('P1')}>Select P1</button>
                <button onClick={() => handleCharacterSelect('H1')}>Select H1</button>
                <button onClick={() => handleCharacterSelect('H2')}>Select H2</button>
            </div>
            <div className="move-history">
                <h2>Move History</h2>
                <ul>
                    {moveHistory.map((entry, index) => (
                        <li key={index}>{entry.character} moved {entry.move}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Game;
