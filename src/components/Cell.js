import React from 'react';
import './styles/Cell.css';

const Cell = ({ value, onClick, isHighlighted }) => {
    return (
        <div 
            className={`cell ${isHighlighted ? 'highlighted' : ''}`} 
            onClick={onClick}
        >
            {value}
        </div>
    );
};

export default Cell;
