import React from 'react';
import Cell from './Cell';
import './styles/Board.css';

const Board = ({ boardState, onCellClick, highlightedCells }) => {
    return (
        <div className="board">
            {boardState.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <Cell
                        key={`${rowIndex}-${colIndex}`}
                        value={cell}
                        onClick={() => onCellClick(rowIndex, colIndex)}
                        isHighlighted={highlightedCells.some(([x, y]) => x === rowIndex && y === colIndex)}
                    />
                ))
            )}
        </div>
    );
};

export default Board;
