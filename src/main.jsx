// 📁 src/main.jsx

import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/msalConfig";

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(async () => {
  // ✅ ЗАСВАР: redirect-ээс буцаж ирсэн хариуг боловсруулна.
  // Энэ нь Microsoft-оос redirect хийгдэж буцаж ирэхэд MSAL-д
  // мэдээллийг зөв "тогтооход" зайлшгүй шаардлагатай алхам.
  await msalInstance.handleRedirectPromise().catch((err) => {
    console.error("Redirect боловсруулахад алдаа:", err);
  });

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      msalInstance.setActiveAccount(event.payload.account);
    }
  });

  ReactDOM.createRoot(document.getElementById("root")).render(
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
});
