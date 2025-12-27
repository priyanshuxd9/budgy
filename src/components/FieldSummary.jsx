import React from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FieldSummary = ({ id, label, total, type, onDelete, formatter }) => {
    const navigate = useNavigate();
    const isExpense = type === 'money_out';

    const format = formatter || ((val) => val.toLocaleString());

    return (
        <div className="field-row">
            <div className="label-col" onClick={() => navigate(`/field/${id}`)} style={{ cursor: 'pointer' }}>
                <span className="handwritten-label underline decoration-dotted">{label}</span>
            </div>

            <div className="value-col">
                <span className={`handwritten-value ${isExpense ? 'text-red' : 'text-green'}`}>
                    {format(total)}
                </span>
                <button onClick={() => navigate(`/field/${id}`)} className="icon-btn" aria-label="View Details">
                    <ArrowRight size={16} />
                </button>
            </div>

            {onDelete && (
                <button onClick={onDelete} className="delete-btn" aria-label="Delete Field">
                    <Trash2 size={14} className="text-red" />
                </button>
            )}

            <style>{`
        .decoration-dotted {
            text-decoration-style: dotted;
        }
        .field-row {
            display: flex;
            align-items: center;
            height: var(--spacing);
            justify-content: space-between;
        }
        .label-col { flex: 1; }
        .value-col { display: flex; align-items: center; gap: 0.5rem; }
        .handwritten-value { color: var(--ink-blue); font-weight: bold; }
        .text-red { color: #d32f2f; }
        .text-green { color: #2e7d32; }
      `}</style>
        </div>
    );
};

export default FieldSummary;
