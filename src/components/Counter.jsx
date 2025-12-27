import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

const Counter = ({ label, value, onIncrement, onDecrement, onDelete }) => {
    return (
        <div className="field-row">
            <div className="label-col">
                <span className="handwritten-label">{label}:</span>
            </div>
            <div className="value-col">
                <button onClick={onDecrement} className="icon-btn" aria-label="Decrease">
                    <Minus size={16} />
                </button>
                <span className="handwritten-value">{value}</span>
                <button onClick={onIncrement} className="icon-btn" aria-label="Increase">
                    <Plus size={16} />
                </button>
            </div>
            {onDelete && (
                <button onClick={onDelete} className="delete-btn" aria-label="Delete Field">
                    <Trash2 size={14} className="text-red" />
                </button>
            )}

            <style>{`
        .field-row {
          display: flex;
          align-items: center;
          height: var(--spacing); /* Align with paper lines */
          position: relative;
        }
        
        .label-col {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .handwritten-label {
          font-weight: bold;
        }

        .value-col {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .handwritten-value {
          font-family: 'Patrick Hand', cursive; /* Ensure font */
          font-size: 1.4rem;
          min-width: 2ch;
          text-align: center;
          color: var(--ink-blue);
        }

        .icon-btn {
          opacity: 0.6;
          transition: opacity 0.2s;
          padding: 4px;
        }
        .icon-btn:hover {
          opacity: 1;
          background: rgba(0,0,0,0.05);
          border-radius: 50%;
        }

        .delete-btn {
            margin-left: 1rem;
            opacity: 0.3;
        }
        .delete-btn:hover {
            opacity: 1;
        }
      `}</style>
        </div>
    );
};

export default Counter;
