<br />
<p align="center"><img width="128" alt="Khan Academy Notifications Logo" src="https://raw.githubusercontent.com/eliasmurcray/ka-notifications/main/src/images/128.png"></p>
<br />
<p align="center">The unofficial extension for Khan Academy notifications.</p>
<br />
<p align="center"><a rel="noreferrer noopener" href="https://chromewebstore.google.com/detail/khan-academy-notification/gdlfnahbohjggjhpcmabnfikiigncjbd"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a></p>
<p align="center">
  <a href="https://www.codefactor.io/repository/github/ejmurc/ka-notifications">
    <img src="https://www.codefactor.io/repository/github/ejmurc/ka-notifications/badge" alt="CodeFactor"></a>
  <img src="https://img.shields.io/chrome-web-store/rating/gdlfnahbohjggjhpcmabnfikiigncjbd.svg?color=00b16a" alt="Rating">
  <img src="https://img.shields.io/chrome-web-store/users/gdlfnahbohjggjhpcmabnfikiigncjbd.svg?color=07f" alt="User Count">
</p>

<h2 align="center">Khan Academy Notifications</h2>

<p align="center">Inspired by <a href="https://github.com/ka-extension/ka-extension-ts">The Khan Academy Extension</a>, Khan Academy Notifications is an extension dedicated to timely delivery of user notifications, alongside additional features aimed at augmenting the learner's experience.</p>
<br />

## Feedback

For direct contact with the developer team, check out our [Discord server](https://discord.com/invite/peexFK5dz6).

If you would like to report a bug or have any other feedback, please [create an issue](https://github.com/ejmurc/ka-notifications/issues) on our GitHub repository.

## Features

- Live notification badge with per-minute sync
- One-click mark all read
- Reply to notifications directly from the popup
- Bulk comment loading
- Offline program saves
- Fully customizable code editor (font, theme, size, and more)
- Profile, stats, and streak visible right in the toolbar

## Development

Outlined below are two pre-established development processes for prospective contributors. Prior to beginning either process, ensure you have a clone of the code.

```bash
git clone https://github.com/eliasmurcray/ka-notifications.git
cd ka-notifications
npm install
```

### Chrome

To begin, run the following command:

```bash
npm run watch
```

Proceed to make your code changes. It should update after every save. To test the extension on Chrome, follow these steps:

1. Open a new tab in your Chrome browser.

2. In the address bar, type `chrome://extensions` and press Enter.

3. In the top right corner of the "Extensions" page, you'll find a switch that says "Developer Mode." Turn it on.

4. With "Developer Mode" enabled, you can now click the "Load Unpacked" button located in the top left corner of the same "Extensions" page.

5. Navigate to and select your `chrome/` folder.

6. Your extension should now be loaded and running in Chrome.

**Note:** In the future, if you have the extension already running locally, you can update it as follows:

1. Open a new tab in your Chrome browser.

2. In the address bar, type `chrome://extensions` and press Enter.

3. On the "Extensions" page, look in the top left corner, and you'll see an "Update" button.

4. Click the "Update" button, and it will pull the latest version of the extension from the same location on your computer and update it.

### Submitting a PR

Before submitting a PR, please run the following command to ensure the code passes the syntax and style checks:

```bash
npm run release
```

Then submit a PR as normal.
