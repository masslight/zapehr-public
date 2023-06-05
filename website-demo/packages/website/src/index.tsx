import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WebsiteThemeProvider } from "./ThemeProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <StrictMode>
    <WebsiteThemeProvider>
      <App />
    </WebsiteThemeProvider>
  </StrictMode>
);
