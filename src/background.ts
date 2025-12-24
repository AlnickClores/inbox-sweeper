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

function extractEmail(fromHeader: string): string {
  const match = fromHeader.match(/<(.+?)>/);
  return match ? match[1] : fromHeader.trim();
}

function extractSenderName(fromHeader: string): string {
  const match = fromHeader.match(/^([^<]+)/);
  return match ? match[1].trim() : "Unknown";
}

interface CachedMessage {
  id: string;
  from: string;
  senderName: string;
  date?: string;
  unread?: boolean;
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

async function fetchAllMessages(token: string): Promise<CachedMessage[]> {
  let allInbox: CachedMessage[] = [];
  let pageToken: string | undefined = undefined;

  while (true) {
    const url = new URL(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages`
    );
    url.searchParams.set("q", "in:inbox");
    url.searchParams.set("maxResults", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data: GmailListResponse = await res.json();

    if (data.messages && data.messages.length > 0) {
      const metadataPromises = data.messages.map((msg) =>
        fetchMessageMetadata(token, msg.id)
      );
      const metadataResults = await Promise.all(metadataPromises);
      allInbox.push(
        ...metadataResults.filter((m): m is CachedMessage => m !== null)
      );
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return allInbox;
}

async function fetchMessageMetadata(token: string, messageId: string) {
  console.log("Fetching metadata for message ID:", messageId);
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  const header = data.payload?.headers?.find((h: any) => h.name === "From");

  if (!header?.value) return null;

  const cleanEmail = extractEmail(header.value);
  const senderName = extractSenderName(header.value);

  return {
    id: messageId,
    from: cleanEmail,
    senderName: senderName,
  };
}

async function fetchMessagesFromSender(token: string, sender: string) {
  console.log("Fetching messages from sender:", sender);
  let messages: string[] = [];
  let pageToken = undefined;

  while (true) {
    const url = new URL(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages"
    );
    url.searchParams.set("q", `from:("${sender}")`);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.messages) {
      messages.push(...data.messages.map((m: any) => m.id));
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return messages;
}

async function trashMessage(token: string, messageIds: string[]) {
  console.log("Trashing message ID:", messageIds);
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: messageIds,
        addLabelIds: ["TRASH"],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Failed to trash email");
  }

  return messageIds.length;
}

async function scanInbox(token: string, pageToken?: string, chunkSize = 10) {
  console.log("Scanning inbox with token:", token, "pageToken:", pageToken);
  const list = await fetchMessageChunk(token, pageToken, chunkSize);

  const sendersMap: SendersMap = {};

  for (const msg of list.messages ?? []) {
    const from = await fetchMessageMetadata(token, msg.id);
    if (!from) continue;
    const email = extractEmail(from.from);
    sendersMap[email] = (sendersMap[email] || 0) + 1;
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
    });

    return true;
  }

  if (message.type === "LOGOUT_GOOGLE") {
    console.log("LOGOUT_GOOGLE message received");
    chrome.storage.local.get(
      "INBOX_TOKEN",
      async (result: { INBOX_TOKEN?: string }) => {
        const token = result.INBOX_TOKEN;

        if (!token) {
          sendResponse({ success: true });
          return;
        }

        try {
          chrome.identity.removeCachedAuthToken({ token }, async () => {
            await fetch(
              `https://accounts.google.com/o/oauth2/revoke?token=${token}`
            );
          });

          chrome.storage.local.remove("INBOX_TOKEN", () => {
            sendResponse({ success: true });
          });
        } catch (error) {
          sendResponse({ success: false, error });
        }
      }
    );

    return true;
  }

  if (message.type === "SCAN_INBOX") {
    console.log("SCAN_INBOX message received");
    chrome.storage.local.get(
      "INBOX_TOKEN",
      async (res: { INBOX_TOKEN?: string }) => {
        const token = res.INBOX_TOKEN;
        if (!token) {
          sendResponse({ success: false, error: "Not logged in" });
          return;
        }

        try {
          console.log("Starting to scan inbox...");

          const scannedEmails = await fetchAllMessages(token);

          const senderCount: Record<
            string,
            { count: number; name: string; messageIds: string[] }
          > = {};
          scannedEmails.forEach((email) => {
            if (!senderCount[email.from]) {
              senderCount[email.from] = {
                count: 0,
                name: email.senderName,
                messageIds: [],
              };
            }
            senderCount[email.from].count += 1;
            senderCount[email.from].messageIds.push(email.id);
          });

          console.log(
            `Inbox scan complete: ${scannedEmails.length} emails scanned.`
          );

          const senderFrequency: {
            email: string;
            count: number;
            name: string;
          }[] = Object.entries(senderCount)
            .map(([email, data]) => ({
              email,
              count: data.count,
              name: data.name,
              messageIds: data.messageIds,
            }))
            .sort((a, b) => b.count - a.count);

          chrome.storage.local.set({
            INBOX_DATA: senderFrequency,
            LAST_SCAN: Date.now(),
          });

          console.log(
            "Top senders:",
            JSON.stringify(senderFrequency.slice(0, 10), null, 2)
          );
          sendResponse({
            success: true,
            count: scannedEmails.length,
            senderCount: senderFrequency,
          });
        } catch (error) {
          console.error("Error scanning inbox:", error);
          sendResponse({ success: false, error });
        }
      }
    );

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

  if (message.type === "TRASH_EMAILS") {
    console.log("TRASH_EMAILS message received", "senders:", message.senders);
    chrome.storage.local.get(
      "INBOX_TOKEN",
      async (res: { INBOX_TOKEN?: string }) => {
        const token = res.INBOX_TOKEN;
        if (!token) {
          console.error("No token found");
          sendResponse({ success: false, error: "Not logged in" });
          return;
        }

        try {
          const allIds: string[] = [];

          for (const sender of message.senders) {
            const ids = await fetchMessagesFromSender(token, sender);
            allIds.push(...ids);
          }
          const count = await trashMessage(token, allIds);
          sendResponse({ success: true, count });
        } catch (error: any) {
          console.error("Error in TRASH_EMAILS:", error);
          sendResponse({ success: false, error: error.message });
        }
      }
    );

    return true;
  }
});
