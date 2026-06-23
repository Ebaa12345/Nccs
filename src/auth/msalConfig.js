// 📁 src/auth/msalConfig.js
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173/login",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// ✅ ЗАСВАР: custom "access_as_user" scope-г хассан.
// Зөвхөн Microsoft Graph-ийн стандарт scope-уудыг ашиглана —
// эдгээр нь "Admins only" зөвшөөрөл шаардахгүй, мөн "My APIs" дотор
// тусгай бүртгэл хайх шаардлагагүй болгоно.
export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};
