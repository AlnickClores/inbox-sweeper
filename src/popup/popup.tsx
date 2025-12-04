import { createRoot } from "react-dom/client";
import { useState } from "react";

function Popup() {
  const [name, setName] = useState<string | null>(null);

  const handleLogin = () => {
    chrome.runtime.sendMessage({ type: "LOGIN_GOOGLE" }, (res) => {
      console.log("Button Clicked");
      if (!res?.success) return alert("Login failed");

      const token = res.token;

      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((userInfo) => setName(userInfo.name))
        .catch((err) => {
          console.error(err);
          alert("Failed to fetch user info");
        });
    });
  };

  return (
    <div style={{ padding: 16 }}>
      {name ? (
        // Compute greeting based on time
        <h2>
          {new Date().getHours() < 12
            ? "Good morning"
            : new Date().getHours() < 18
            ? "Good afternoon"
            : "Good evening"}
          , {name} 👋
        </h2>
      ) : (
        <button onClick={handleLogin} style={{ padding: 8, width: "100%" }}>
          Login with Google
        </button>
      )}
    </div>
  );
}

// Mount React
const root = document.getElementById("root");
if (root) createRoot(root).render(<Popup />);
