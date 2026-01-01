# SweepBox

Scan your Gmail inbox to identify frequent senders and clean it up with easy unsubscribe tools.

---

## Description

**SweepBox** is a chrome extension that scans inbox emails, groups them by sender, and highlights frequent senders so users can quickly identify newsletters and unwanted emails. Users can move selected emails to the bin, permanently delete them and unsubscribe from emails,  all directly from the popup.

This project aims to simplify inbox management by reducing clutter, saving time, and giving users full control over their Gmail without manually managing emails.

> **Note:** This extension is not yet published on the Chrome Web Store because the Google review process for Gmail access can take a long time. It is currently available for local installation and testing.

### Key Features
- Scan Gmail inbox for frequent senders
- Group emails by sender frequency
- Move selected emails to the bin
- Permanently delete selected emails from the inbox
- Unsubscribe using available `List-Unsubscribe` headers

### Tech Stack
- **Frontend:** React, TypeScript, CSS Modules
- **Browser APIs:** Chrome Extension APIs (Manifest V3)
- **Backend/API:** Gmail API
- **Build Tool:** Vite
- **Auth:** Google OAuth (Gmail access)

---

## Installation

### Prerequisites
- Google Chrome (latest version recommended)
- Node.js (v18+ recommended)
- A Google account with Gmail enabled
- Google Cloud Project with GMAIL API enabled ( required for OAuth testing )

## OAuth Scopes

SweepBox requests the following scopes in Google Cloud to operate correctly:

| Scope | Description |
|-------|-------------|
| `https://www.googleapis.com/auth/gmail.modify` | Read, compose, send, and modify emails in your Gmail account |
| `https://www.googleapis.com/auth/userinfo.email` | See your primary Google Account email address |
| `https://www.googleapis.com/auth/userinfo.profile` | See your personal info, including any info you've made publicly available |
| `https://mail.google.com/` | Full access: read, compose, send, and permanently delete all your Gmail emails |

> **Note:** These scopes are considered sensitive/restricted, so only test users can authorize the extension until OAuth verification is approved.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git

2. Navigate to the project repository:
   ```bash
   cd your-repo-name

3. Install dependencies
   ```bash
   cd your-repo-name

4. Build the extension:
   ```bash
   npm run build

5. Load the chrome extension
- Open chrome://extensions
- Enable Developer mode
- Click Load unpacked
- Select the dist/ folder

### Usage

1. Click the SweepBox icon in the chrome toolbar.
2. Sign in with your Google account and grant Gmail access.
3. Click Scan Inbox to analyze your inbox emails.
4. Review the list of senders.
5. Click the following actions to the selected emails.

>**NOTE:** Unsubscribe button and functionality is commented out in this repo because it is not yet working :((

## Contributing

Contributors are welcome. You can help by:
- Reporting bugs
- Suggesting new features
- Improving UI/UX
- Submitting pull requests

### How to contribute

1. Fork the repository

2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
3. Commit your changes:
   ```bash
   git commit -m "Add: your feature description"
4. Push to your fork and open a pull request

## Authors and Acknowledgments

### Author
- [Alnick Clores](https://alnickdev.me/)

### Acknowledgments
- [Gmail API](https://developers.google.com/workspace/gmail/api/guides)
- [Google Cloud Platform](https://www.google.com/aclk?sa=L&ai=DChsSEwiLnfOl8OqRAxX11BYFHVR1DoQYACICCAEQABoCdGw&ae=2&co=1&ase=2&gclid=CjwKCAiA09jKBhB9EiwAgB8l-JrxZ0exc-hJJTH55sLeKlNWjXcog-hRxvDlCo4-mExBdbxCQfkH6hoCrFIQAvD_BwE&cid=CAASugHkaHBOhjFRC4uDVqtFHg4ORf0nVAXcjJx3CPhhS6-o7ztwEG-fJ6VGAWM07OdGOsQewI0qM0z3ZaqlxX7MEhgEMnPXtpJKPVQ1Xtn9Y86hwTjwZd7WcrYmOXZ6PaKsIpcAhLhDQVZSGe-48UyZQxSUpW7YI5lOEbZ0wOG7SqKM_gFQHN8q28QQJdDZjl5zIITjrWR4JlEsuISXSyq0Y6MJUBzpkD72wU0lB5-4L8qkAJpeyZWVzp4rgJo&cce=2&category=acrcp_v1_71&sig=AOD64_0OwYiDQrazXsr58DpD24evXc3s0A&q&nis=4&adurl&ved=2ahUKEwjIku6l8OqRAxVJa_UHHW1GHgMQ0Qx6BAgMEAE)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions)
- [Streamline Icons](https://home.streamlinehq.com/)
