import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_ZAPEHR_APPLICATION_DOMAIN || ""}
      clientId={process.env.REACT_APP_ZAPEHR_APPLICATION_CLIENT_ID || ""}
      audience={process.env.REACT_APP_ZAPEHR_APPLICATION_AUDIENCE}
      redirectUri={process.env.REACT_APP_ZAPEHR_APPLICATION_REDIRECT_URL}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
