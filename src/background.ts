chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "LOGIN_GOOGLE") {
    console.log("LOGIN_GOOGLE message received");
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }

      chrome.storage.local.set({ INBOX_TOKEN: token }, () => {
        sendResponse({ success: true, token });
      });

      sendResponse({ success: true, token });
    });

    return true;
  }

  if (message.type === "LOGOUT_GOOGLE") {
    console.log("LOGOUT_GOOGLE message received");
    chrome.storage.local.get("INBOX_TOKEN", async (result) => {
      const token = result.INBOX_TOKEN;

      if (!token) {
        sendResponse({ success: true });
        return;
      }

      try {
        await fetch(
          `https://accounts.google.com/o/oauth2/revoke?token=${token}`
        );

        chrome.storage.local.remove("INBOX_TOKEN", () => {
          sendResponse({ success: true });
        });
      } catch (error) {
        sendResponse({ success: false, error });
      }
    });

    return true;
  }

  if (message.type === "SCAN_INBOX") {
    chrome.storage.local.get(["INBOX_TOKEN"], async (res) => {
      const token = res.INBOX_TOKEN;
      if (!token) {
        sendResponse({ success: false, error: "Not logged in" });
        return;
      }

      try {
        const list = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).then((r) => r.json());

        if (!list.messages) {
          sendResponse({ success: true, senders: [] });
          return;
        }

        const sendersMap: Record<string, number> = {};

        for (const msg of list.messages) {
          try {
            const detail = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ).then((r) => r.json());

            const header = detail.payload?.headers?.find(
              (h: any) => h.name === "From"
            );
            if (!header?.value) continue;

            const from = header.value;

            sendersMap[from] = (sendersMap[from] || 0) + 1;
          } catch (err) {
            continue;
          }
        }

        sendResponse({
          success: true,
          senders: sendersMap,
        });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    });

    return true;
  }
});
