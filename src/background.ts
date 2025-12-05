chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "LOGIN_GOOGLE") {
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
});
