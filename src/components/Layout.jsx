import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="notepad-wrapper">
      <div className="paper">
        <div className="holes"></div>
        <div className="content-area">
          <Outlet />
        </div>
      </div>

      <style>{`
        .notepad-wrapper {
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        .paper {
          background-color: var(--paper-color);
          background-image: linear-gradient(var(--line-color) 1px, transparent 1px);
          background-size: 100% var(--spacing);
          background-position: 0 1.5rem; /* Align lines */
          width: 100%;
          min-height: 100vh;
          padding: 3rem 1.5rem 2rem 4rem; /* Top Right Bottom Left(for margin) */
          position: relative;
        }

        /* Red Margin Line */
        .paper::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 3rem;
          width: 2px;
          background-color: var(--margin-line-color);
          opacity: 0.6;
        }

        /* Holes */
        .holes {
          position: absolute;
          top: 1rem;
          left: 1rem;
          bottom: 1rem;
          width: 1rem;
          display: flex;
          flex-direction: column;
          gap: var(--spacing);
        }
        
        .content-area {
            position: relative;
            z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default Layout;
