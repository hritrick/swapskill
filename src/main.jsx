import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SkillsProvider } from "./context/SkillsContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* AppProvider: auth, credits, notifications, proposal-modal state.
        SkillsProvider: the browsable skill list, search, and category.
        BrowserRouter: enables the Landing / Login / Dashboard route split. */}
    <BrowserRouter>
      <AppProvider>
        <SkillsProvider>
          <App />
        </SkillsProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
