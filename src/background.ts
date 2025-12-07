interface GmailMessage {
  id: string;
  threadId: string;
}

interface GmailListResponse {
  messages?: GmailMessage[];
  nextPageToken?: string;
}

interface SendersMap {
  [email: string]: number;
}

async function fetchMessageChunk(
  token: string,
  pageToken?: string,
  maxResults = 10
) {
  const url = new URL(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages`
  );
  url.searchParams.set("maxResults", maxResults.toString());
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data: GmailListResponse = await res.json();
  return data;
}

async function fetchMessageMetadata(token: string, messageId: string) {
  console.log("Fetching metadata for message ID:", messageId);
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  const header = data.payload?.headers?.find((h: any) => h.name === "From");
  return header?.value ?? null;
}

async function scanInbox(token: string, pageToken?: string, chunkSize = 10) {
  console.log("Scanning inbox with token:", token, "pageToken:", pageToken);
  const list = await fetchMessageChunk(token, pageToken, chunkSize);

  const sendersMap: SendersMap = {};

  for (const msg of list.messages ?? []) {
    const from = await fetchMessageMetadata(token, msg.id);
    if (!from) continue;
    sendersMap[from] = (sendersMap[from] || 0) + 1;
  }
  console.log("Current sendersMap:", sendersMap);
  return { sendersMap, nextPageToken: list.nextPageToken };
}

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

  if (message.type === "SCAN_INBOX_CHUNK") {
    console.log("SCAN_INBOX_CHUNK message received");
    chrome.storage.local.get(
      ["INBOX_TOKEN"],
      async (res: { INBOX_TOKEN?: string }) => {
        const token = res.INBOX_TOKEN;
        if (!token) {
          sendResponse({ success: false, error: "Not logged in" });
          return;
        }

        try {
          const result = await scanInbox(
            token,
            message.pageToken,
            message.chunkSize
          );
          sendResponse({ success: true, ...result });
        } catch (err: any) {
          sendResponse({ success: false, error: err.message });
        }
      }
    );

    return true;
  }
});
