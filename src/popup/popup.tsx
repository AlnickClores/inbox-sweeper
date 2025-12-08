import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";

type Sender = { email: string; count: number };

function Popup() {
  const [name, setName] = useState<string | null>(null);
  const [senders, setSenders] = useState<{ email: string; count: number }[]>(
    []
  );
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const longPressThreshold: number = 250;
  let longPressTriggered = false;

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

  const loadMore = () => {
    if (loading) return;
    setLoading(true);

    chrome.runtime.sendMessage(
      { type: "SCAN_INBOX_CHUNK", pageToken, chunkSize: 10 },
      (res) => {
        setLoading(false);
        if (!res?.success) return alert("Failed to load inbox");

        const arr = Object.entries(res.sendersMap as Record<string, number>)
          .map(([email, count]) => ({ email, count }))
          .sort((a, b) => b.count - a.count);

        setSenders((prev) => [...prev, ...arr]);
        setPageToken(res.nextPageToken);
      }
    );
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
    chrome.runtime.sendMessage({ type: "SCAN_INBOX_CHUNK" }, (res) => {
      if (!res?.success) return alert("Failed to scan inbox");

      const sendersMap = res.sendersMap as Record<string, number>;

      const arr: Sender[] = Object.entries(sendersMap)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count);
      setSenders(arr);
      setPageToken(res.nextPageToken);
    });
  };

  const handleLongPressStart = () => {
    longPressTriggered = false;

    setTimeout(() => {
      longPressTriggered = true;
      setSelectionMode(true);
    }, longPressThreshold);
  };

  const handleLongPressEnd = (email: string) => {
    // Long press triggered → only select, no click will fire
    if (longPressTriggered) {
      selectEmail(email);
    }
  };

  const handleClick = (email: string) => {
    // Ignore click if it came from a long press
    if (longPressTriggered) return;

    if (selectionMode) {
      selectEmail(email);
    }
  };

  const selectEmail = (email: string) => {
    setSelectedItems(
      (prev) =>
        prev.includes(email)
          ? prev.filter((e) => e !== email) // unselect
          : [...prev, email] // select
    );
  };

  useEffect(() => {
    console.log("Selected items:", selectedItems);
  }, [selectedItems]);

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
          <div style={{ marginTop: "16px" }}>
            {senders.length > 0 && (
              <>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Top Senders
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {senders.map(({ email, count }) => (
                    <button
                      onMouseDown={() => handleLongPressStart()}
                      onMouseUp={() => handleLongPressEnd(email)}
                      onClick={() => handleClick(email)}
                      key={email}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: "1px solid #d0d0d0",
                        background: "#f5f5f5",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.background = "#e9e9e9";
                        btn.style.borderColor = "#c4c4c4";
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.background = "#f5f5f5";
                        btn.style.borderColor = "#d0d0d0";
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{email}</span>
                      <span
                        style={{
                          marginLeft: "6px",
                          color: "#666",
                          fontSize: "0.8rem",
                        }}
                      >
                        ({count})
                      </span>
                    </button>
                  ))}
                  {selectionMode && (
                    <button
                      onClick={() => {
                        setSelectedItems([]);
                        setSelectionMode(false);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}
            <button onClick={loadMore} disabled={loading || !pageToken}>
              {loading ? "Loading..." : pageToken ? "Load More" : "All Loaded"}
            </button>
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
