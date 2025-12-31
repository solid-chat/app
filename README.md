# Solid Chat

Modern, decentralized chat app built on the [Solid](https://solidproject.org) protocol.

**Live App:** [solid-chat.com/app](https://solid-chat.com/app)

## Features

### Core
- Clean, WhatsApp-style messenger UI
- Decentralized - messages stored in Solid pods
- Implements the [Solid Chat specification](https://solid.github.io/chat/)
- Works with any Solid pod provider (solidweb.org, solidcommunity.net, inrupt.net, etc.)
- No React/heavy frameworks - vanilla JS

### Authentication
- Solid OIDC authentication
- Multi-provider support (enter any IDP)
- Persistent sessions

### Real-time
- WebSocket updates (NSS `Updates-Via` header)
- WebSocketChannel2023 support (CSS/solidcommunity.net)
- Notification sounds when tab is hidden (toggleable)

### Messaging
- Send and receive messages
- Edit your own messages (requires Write permission)
- Delete your own messages (requires Write permission)
- Simple markdown: `*bold*`, `_italic_`, `~strike~`, `` `code` ``, ` ```code blocks``` `
- Emoji picker
- Emoji reactions: 👍 ❤️ 😂 😮 😢 🎉

### Media
- File upload to your pod (📎 button)
- Paste images directly (Ctrl+V)
- Auto-expand images, video, and audio inline
- Clickable URLs

### Sidebar
- Chat list with recent chats
- Type Index auto-discovery of your chats
- Manual chat URL addition
- Persistent storage (localStorage)

### UI/UX
- Avatar display from WebID profiles
- Clickable author names (links to WebID)
- Clickable timestamps (permalinks to message URI)
- "(edited)" indicator for edited messages
- Message count in header

## Quick Start

```bash
# Clone the repo
git clone https://github.com/solid-chat/app.git
cd app

# Serve locally (choose one)
npx serve .
# or
npx vite

# Open in browser
open http://localhost:3000
```

## Usage

1. Enter your Solid IDP (e.g., `solidweb.org`) and click Login
2. Select a chat from the sidebar or add a new one
3. Start chatting!

### Default Global Chats
- `https://solid-chat.solidweb.org/public/global/chat.ttl` (faster)
- `https://solid-chat.solidcommunity.net/public/global/chat.ttl`

## Chat Data Format

Messages use standard Solid chat vocabularies (RDF/Turtle):

```turtle
@prefix sioc: <http://rdfs.org/sioc/ns#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<#msg-1234567890>
    a <http://www.w3.org/2005/01/wf/flow#Message> ;
    sioc:content "Hello world!" ;
    dct:created "2024-12-30T10:00:00Z"^^xsd:dateTime ;
    foaf:maker <https://you.solidweb.org/profile/card#me> .
```

Reactions use Schema.org:

```turtle
@prefix schema: <http://schema.org/>.

<#reaction-1234567890>
    a schema:ReactAction ;
    schema:about <#msg-123> ;
    schema:agent <https://you.solidweb.org/profile/card#me> ;
    schema:name "👍" .
```

## Testing

```bash
npm install
npm test
```

## Specification

This app implements the [Solid Chat specification](https://solid.github.io/chat/).

## Roadmap

- [x] Solid OIDC authentication
- [x] Chat list sidebar
- [x] Real-time updates (WebSocket + WebSocketChannel2023)
- [x] Notification sounds
- [x] File upload
- [x] Image paste
- [x] Media auto-expand
- [x] Simple markdown
- [x] Edit/delete messages
- [x] Emoji reactions
- [ ] @mentions with notifications
- [ ] Create new chats
- [ ] End-to-end encryption
- [ ] Mobile responsive sidebar
- [ ] Unread message badges
- [ ] Message search

## License

See [LICENSE](LICENSE)
