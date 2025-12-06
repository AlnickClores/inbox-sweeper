import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";

type Sender = { email: string; count: number };

function Popup() {
  const [name, setName] = useState<string | null>(null);
  const [senders, setSenders] = useState<{ email: string; count: number }[]>(
    []
  );

  const handleLogin = () => {
    chrome.runtime.sendMessage({ type: "LOGIN_GOOGLE" }, async (res) => {
      if (!res?.success) return alert("Login failed");

      const token = res.token;

      const userName = await fetchUserInfo(token);
      if (userName) setName(userName);
    });
  };

  const handleLogout = () => {
    chrome.runtime.sendMessage({ type: "LOGOUT_GOOGLE" }, (res) => {
      if (!res?.success) return alert("Logout failed");

      setName(null);
    });
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();
      console.log(userInfo);
      return userInfo.name;
    } catch (error) {
      console.error(error);
      alert("Failed to fetch user info");
    }
  };

  const handleScanInbox = () => {
    chrome.runtime.sendMessage({ type: "SCAN_INBOX" }, (res) => {
      if (!res?.success) return alert("Failed to scan inbox");

      const sendersMap = res.senders as Record<string, number>;

      const arr: Sender[] = Object.entries(sendersMap)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count);
      setSenders(arr);
    });
  };

  useEffect(() => {
    chrome.storage.local.get(["INBOX_TOKEN"], async (res) => {
      if (!res.INBOX_TOKEN) return;

      const token = res.INBOX_TOKEN;

      try {
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).then((r) => r.json());

        setName(userInfo.name);
      } catch (error) {
        console.error(error);
        chrome.storage.local.remove(["INBOX_TOKEN"]);
      }
    });
  }, []);

  return (
    <div style={{ padding: 16 }}>
      {name ? (
        <>
          <h2>
            {new Date().getHours() < 12
              ? "Good morning"
              : new Date().getHours() < 18
              ? "Good afternoon"
              : "Good evening"}
            , {name} 👋
          </h2>
          <div>
            {senders.length > 0 && (
              <>
                <h3>Top Senders:</h3>
                <ul>
                  {senders.map(({ email, count }) => (
                    <li key={email}>
                      {email}: {count}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <button
            onClick={handleScanInbox}
            style={{ padding: 8, width: "100%" }}
          >
            Scan Inbox
          </button>
          <button onClick={handleLogout} style={{ padding: 8, width: "100%" }}>
            Logout
          </button>
        </>
      ) : (
        <button onClick={handleLogin} style={{ padding: 8, width: "100%" }}>
          Login with Google
        </button>
      )}
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Popup />);
