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
});
