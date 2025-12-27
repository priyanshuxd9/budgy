import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DateFilter = ({ currentDate, onDateChange }) => {
  const dateInputRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    onDateChange(newDate);
  };

  const handleDateInput = (e) => {
    if (!e.target.value) return;
    const [year, month] = e.target.value.split('-');
    const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    onDateChange(newDate);
  };

  // Format for input type="month": YYYY-MM
  const monthValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="date-filter">
      <button onClick={() => changeMonth(-1)} className="nav-btn">
        <ChevronLeft size={20} />
      </button>

      <div className="date-display" onClick={() => dateInputRef.current?.showPicker()} style={{ cursor: 'pointer', position: 'relative' }}>
        <span className="month">{months[currentDate.getMonth()]}</span>
        <span className="year">{currentDate.getFullYear()}</span>

        {/* Hidden input for picker */}
        <input
          type="month"
          ref={dateInputRef}
          value={monthValue}
          onChange={handleDateInput}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
      </div>

      <button onClick={() => changeMonth(1)} className="nav-btn">
        <ChevronRight size={20} />
      </button>

      <style>{`
        .date-filter {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          background: rgba(0,0,0,0.03);
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px dashed var(--pencil-gray);
        }
        .date-display {
          display: flex;
          gap: 0.5rem;
          font-weight: bold;
          font-size: 1.5rem;
          color: var(--ink-blue);
          text-transform: uppercase;
          letter-spacing: 1px;
          user-select: none;
        }
        .nav-btn {
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .nav-btn:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default DateFilter;
