import React from 'react';

const TotalsDisplay = ({ income, expenses, formatter }) => {
    const savings = income - expenses;

    // Fallback formatter if not provided
    const format = formatter || ((val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));

    return (
        <div className="totals-section">
            <div className="calc-row text-green">
                <span>+ Total Income</span>
                <span>{format(income)}</span>
            </div>
            <div className="calc-row text-red">
                <span>- Total Expenses</span>
                <span>{format(expenses)}</span>
            </div>

            <div className="total-row">
                <span className="bold">Savings:</span>
                <span className={`handwritten-value ${savings < 0 ? 'text-red' : 'text-green'}`}>
                    {format(savings)}
                </span>
            </div>

            <style>{`
        .totals-section {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 2px solid var(--text-color);
        }
        .calc-row {
            display: flex;
            justify-content: space-between;
            font-size: 1rem;
            opacity: 0.8;
            margin-bottom: 0.25rem;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
            font-size: 1.8rem;
            border-bottom: 3px double var(--ink-blue);
        }
      `}</style>
        </div>
    );
};

export default TotalsDisplay;
