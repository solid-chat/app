# AGENTS.md - AI Agent Instructions for Solid Chat

## Project Overview

Solid Chat is a decentralized chat application built on the Solid protocol. It renders `meeting:LongChat` resources from Solid pods.

## Architecture

```
solid-chat/app/
├── index.html          # Main app with auth, WebSocket, layout
├── src/
│   ├── index.js        # Barrel export for npm
│   ├── longChatPane.js # Chat message rendering pane
│   ├── chatListPane.js # Sidebar with chat list
│   └── index.test.js   # Vitest unit tests
├── icons/              # PWA icons
├── manifest.json       # PWA manifest
└── vitest.config.js    # Test config
```

## Key Concepts

### Pane Pattern
Panes follow the SolidOS pattern:
```javascript
export const myPane = {
  name: 'pane-name',
  label: (subject, context) => 'Label' | null,
  render: (subject, context) => HTMLElement
}
```

### RDF Vocabularies Used
- `sioc:Post`, `sioc:content` - Messages
- `dct:created`, `dct:creator`, `dct:title` - Metadata
- `foaf:maker`, `foaf:img` - User profiles
- `meeting:LongChat` - Chat type
- `solid:publicTypeIndex` - Discovery

### Real-time Updates
- CSS (solidcommunity.net): WebSocketChannel2023
- NSS: Legacy Updates-Via header

## Development

```bash
npm install
npm test        # Run vitest
npm start       # Serve locally
```

## Branch Strategy
- `gh-pages` - Production, deployed to solid-chat.com/app
- `main` - Development (merge to gh-pages for deploy)

**Always work on gh-pages branch.**

## Code Style

- Vanilla JS, no framework
- ES modules
- CSS injected via `<style>` in panes
- No TypeScript (yet)
- Peer dependency on `rdflib`

## Testing

Run `npm test` before committing. Tests use Vitest + jsdom.

## Common Tasks

### Add a new feature to longChatPane
1. Read `src/longChatPane.js`
2. Find the `render()` function
3. Add DOM manipulation code
4. Test manually, add unit test if possible

### Fix real-time updates
Check `subscribeToUpdates()` in `index.html`:
- solidcommunity.net → `subscribeWebSocketChannel2023()`
- Other servers → legacy `Updates-Via` header

### Add to chat list sidebar
Modify `src/chatListPane.js`:
- State: `chatList` array, `STORAGE_KEY` for localStorage
- Functions: `addChat()`, `removeChat()`, `renderChatList()`

## Don't

- Don't add frameworks (React, Vue, etc.)
- Don't commit `node_modules/`
- Don't change the pane pattern structure
- Don't remove AGPL-3.0 license headers

## Resources

- [Solid Protocol](https://solidproject.org/TR/protocol)
- [LongChat Spec](https://solid.github.io/chat/)
- [rdflib.js](https://github.com/linkeddata/rdflib.js)
- [WebSocketChannel2023](https://solid.github.io/notifications/protocol#WebSocketChannel2023)
