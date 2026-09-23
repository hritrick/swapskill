import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { SkillsProvider } from './context/SkillsContext.jsx';
import { SwapsProvider } from './context/SwapsContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      Provider nesting order matters:
        AppProvider  — auth + credits (outermost; everything reads from it)
        SwapsProvider — swap state + Socket.IO (reads AppContext for token)
        SkillsProvider — browsable skill list (reads AppContext for user)
        BrowserRouter — client-side routing
    */}
    <BrowserRouter>
      <AppProvider>
        <SwapsProvider>
          <SkillsProvider>
            <App />
          </SkillsProvider>
        </SwapsProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
