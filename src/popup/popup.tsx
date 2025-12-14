import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import Filter from "./components/Filter";
import styles from "./styles/emails.module.css";
import loginStyles from "./styles/login.module.css";
import Header from "./components/Header";

type Sender = { email: string; count: number };

interface CachedMessage {
  id: string;
  from: string;
  date: number;
  unread: boolean;
}

function Popup() {
  const [name, setName] = useState<string | null>(null);
  const [senders, setSenders] = useState<{ email: string; count: number }[]>(
    []
  );
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cachedEmails, setCachedEmails] = useState<CachedMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const longPressThreshold: number = 250;
  let longPressTriggered = false;

  useEffect(() => {
    console.log("Loading cached emails...");
    chrome.storage.local.get("INBOX_DATA", (res) => {
      if (!res.INBOX_DATA) return;

      const emails = res.INBOX_DATA as CachedMessage[];
      console.log("Cached emails loaded:", emails);

      if (emails) {
        const sortedEmailsDescending = emails.sort((a, b) => b.date - a.date);
        const top10 = sortedEmailsDescending.slice(0, 10);
        setCachedEmails(top10);
      }
    });
  }, [refreshKey]);

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
    chrome.runtime.sendMessage({ type: "SCAN_INBOX" }, (res) => {
      if (!res?.success) return alert("Failed to scan inbox");

      chrome.storage.local.get("INBOX_DATA", (data) => {
        const emails = data.INBOX_DATA as CachedMessage[];
        if (!emails || emails.length === 0) return;

        const sendersMap: Record<string, number> = {};
        emails.forEach((msg) => {
          sendersMap[msg.from] = (sendersMap[msg.from] || 0) + 1;
        });

        const arr: Sender[] = Object.entries(sendersMap)
          .map(([email, count]) => ({ email, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setRefreshKey((prev) => prev + 1);
        setSenders(arr);
      });
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
    if (longPressTriggered) {
      selectEmail(email);
    }
  };

  const handleClick = (email: string) => {
    if (longPressTriggered) return;

    if (selectionMode) {
      selectEmail(email);
    }
  };

  const selectEmail = (email: string) => {
    setSelectedItems((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
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

        console.log("User Info:", userInfo);
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
          <Header name={name} handleScanInbox={handleScanInbox} />

          <div style={{ marginTop: "16px" }}>
            {cachedEmails.length > 0 && (
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

                <Filter />

                <div>
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

                  <div className={styles.container}>
                    <h1>Cached Emails</h1>
                    {cachedEmails.map((email) => (
                      <button className={styles.emailItem} key={email.id}>
                        <p>{email.from}</p>
                      </button>
                    ))}
                  </div>
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
                  {selectionMode && selectedItems.length > 0 && (
                    <button
                      onClick={() => {
                        chrome.runtime.sendMessage(
                          { type: "TRASH_EMAILS", senders: selectedItems },
                          (res) => {
                            if (!res?.success)
                              return alert("Failed to delete emails");
                            console.log(res);
                            alert(`Emails successfully deleted: ${res.count}`);
                          }
                        );
                      }}
                    >
                      Delete Selected
                    </button>
                  )}
                </div>
              </>
            )}

            <button onClick={loadMore} disabled={loading || !pageToken}>
              {loading ? "Loading..." : pageToken ? "Load More" : "All Loaded"}
            </button>
          </div>

          <button onClick={handleLogout} style={{ padding: 8, width: "100%" }}>
            Logout
          </button>
        </>
      ) : (
        <div className={loginStyles.container}>
          <div className={loginStyles.card}>
            <div>
              <h1>Inbox Sweeper</h1>
              <p className={loginStyles.description}>
                Clean up your Gmail inbox by identifying top sender and managing
                your emails efficiently.
              </p>
            </div>
            <button className={loginStyles.loginButton} onClick={handleLogin}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                id="Google-Gmail--Streamline-Svg-Logos"
                height="24"
                width="24"
              >
                <desc>
                  Google Gmail Streamline Icon: https://streamlinehq.com
                </desc>
                <path
                  fill="#4285f4"
                  d="M5.5909 20.814775V11.735225L2.775025 9.159075 0.25 7.72955V19.2125c0 0.886575 0.7183525 1.602275 1.6022725 1.602275H5.5909Z"
                  stroke-width="0.25"
                ></path>
                <path
                  fill="#34a853"
                  d="M18.408925 20.814775h3.73865c0.8866 0 1.602275 -0.71835 1.602275 -1.602275V7.72955l-2.86 1.637475 -2.480925 2.3682v9.07955Z"
                  stroke-width="0.25"
                ></path>
                <path
                  fill="#ea4335"
                  d="m5.590925 11.735225 -0.38315 -3.5477 0.38315 -3.395475 6.4091 4.8068 6.409075 -4.8068 0.42865 3.21215 -0.42865 3.731025 -6.409075 4.806825 -6.4091 -4.806825Z"
                  stroke-width="0.25"
                ></path>
                <path
                  fill="#fbbc04"
                  d="M18.408925 4.79205v6.943175l5.340925 -4.005675v-2.136375c0 -1.981475 -2.261875 -3.111075 -3.84545 -1.922725l-1.495475 1.1216Z"
                  stroke-width="0.25"
                ></path>
                <path
                  fill="#c5221f"
                  d="m0.25 7.72955 2.456375 1.842275 2.884525 2.1634V4.79205l-1.49545 -1.1216C2.5092 2.4821 0.25 3.6117 0.25 5.593175v2.136375Z"
                  stroke-width="0.25"
                ></path>
              </svg>
              <span>Connect with Gmail</span>
            </button>
            <p>
              By connecting, you allow Inbox Sweeper to access your Gmail
              account to analyze sender frequency.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Popup />);
