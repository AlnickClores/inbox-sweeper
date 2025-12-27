import { createRoot } from "react-dom/client";
import { useState, useEffect, useMemo } from "react";
import loginStyles from "./styles/login.module.css";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import EmailList from "./components/EmailList";
import ActionBar from "./components/ActionBar";
import type { CachedMessage } from "./types/type";
import type { Order } from "./types/type";

type Sender = { email: string; count: number };
type SelectedSender = { email: string; messageIds: string[] };

function Popup() {
  const [name, setName] = useState<string | null>(null);
  const [cachedEmails, setCachedEmails] = useState<CachedMessage[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [order, setOrder] = useState<Order>("desc");
  const [selectedEmails, setSelectedEmails] = useState<SelectedSender[]>([]);

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

      chrome.storage.local.get("INBOX_DATA", (data) => {
        const emails = data.INBOX_DATA as CachedMessage[];
        if (!emails || emails.length === 0) return;

        const sendersMap: Record<string, number> = {};
        emails.forEach((msg) => {
          sendersMap[msg.email] = (sendersMap[msg.email] || 0) + 1;
        });

        const arr: Sender[] = Object.entries(sendersMap)
          .map(([email, count]) => ({ email, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setRefreshKey((prev) => prev + 1);

        return arr;
      });
    });
  };

  const loadMore = () => {
    console.log("Loading more emails...");
    setVisibleCount((prev) => prev + 10);
  };

  const onOrderChange = (value: Order) => {
    setOrder(value);
  };

  const sortedEmails = useMemo(() => {
    return [
      ...cachedEmails.sort((a, b) =>
        order === "desc" ? b.count - a.count : a.count - b.count
      ),
    ];
  }, [cachedEmails, order]);

  const visibleEmails = useMemo(() => {
    return sortedEmails.slice(0, visibleCount);
  }, [sortedEmails, visibleCount]);

  const handleSelectEmail = (email: string, messageIds: string[]) => {
    console.log("Email address:", email);
    console.log("Message IDs:", messageIds);
    setSelectedEmails((prev) => {
      const exists = prev.find((item) => item.email === email);

      if (exists) {
        return prev.filter((item) => item.email !== email);
      }

      return [...prev, { email, messageIds }];
    });
  };

  useEffect(() => {
    console.log("Selected Emails:", selectedEmails);
  }, [selectedEmails]);

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

  useEffect(() => {
    console.log("Loading cached emails...");
    chrome.storage.local.get("INBOX_DATA", (res) => {
      if (!res.INBOX_DATA) return;

      const emails = res.INBOX_DATA as CachedMessage[];
      console.log("Cached emails loaded:", emails);

      if (emails) {
        setCachedEmails(emails);
        const top10 = emails.slice(0, 10);
        console.log("Top 10 senders:", top10);
      }
    });
  }, [refreshKey]);

  useEffect(() => {
    setVisibleCount(10);
  }, [order]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "16px 20px",
      }}
    >
      {name ? (
        <>
          <Navbar handleLogout={handleLogout} />
          <Header name={name} handleScanInbox={handleScanInbox} />
          <div>
            <EmailList
              cachedEmails={visibleEmails}
              loadMore={loadMore}
              order={order}
              onOrderChange={onOrderChange}
              handleSelectEmail={handleSelectEmail}
              selectedEmails={selectedEmails.map((item) => item.email)}
            />
          </div>
          {selectedEmails.length > 0 && <ActionBar />}
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
