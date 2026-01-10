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
- Notification sounds (toggleable)

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
- Create new chats on your pod
- Manual chat URL addition
- Persistent storage (localStorage)

### Sharing & Deep Links
- Share button (📋) copies shareable link
- Deep link support: `?chat=<url>` loads or creates chat
- Auto-create: links to your pod create rooms on demand
- Type Index registration for discoverability

### UI/UX
- Avatar display from WebID profiles
- Clickable author names (links to WebID)
- Clickable timestamps (permalinks to message URI)
- "(edited)" indicator for edited messages
- Message count in header
- Unread message badges
- Remember current room across refreshes

### Themes
- Wave (WhatsApp-style green)
- Signal (clean blue)
- Telegram (blue with patterns)
- Solid (purple/gradient)

### Saved Messages
- Telegram-style "notes to self"
- Auto-created on your pod
- Private by default

## Quick Start

```bash
# Run instantly (no clone needed)
npx solid-chat

# Or clone and run
git clone https://github.com/solid-chat/app.git
cd app
npm install
npm start
```

## Usage

1. Enter your Solid IDP (e.g., `solidweb.org`) and click Login
2. Select a chat from the sidebar or add a new one
3. Start chatting!

### Default Global Chats
- `https://solid-chat.solidweb.org/public/global/chat.ttl` (faster)
- `https://solid-chat.solidcommunity.net/public/global/chat.ttl`

### Deep Links

Share chats with a URL:
```
https://solid-chat.com/app?chat=https://you.solidweb.org/public/chats/my-room.ttl
```

**Behavior:**
- If chat exists → loads it
- If chat doesn't exist AND it's your pod → creates it automatically
- Change one character → instant new room

**Create rooms on demand:**
```
https://solid-chat.com/app?chat=https://you.pod/public/chats/meeting-monday.ttl
https://solid-chat.com/app?chat=https://you.pod/public/chats/meeting-tuesday.ttl
```

Click the share button (📋) in any chat to copy the shareable link.

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
- [x] Create new chats
- [x] Deep link sharing (`?chat=<url>`)
- [x] Type Index registration
- [x] Mobile responsive sidebar
- [x] Unread message badges
- [x] Theme support
- [x] Saved Messages
- [ ] @mentions with notifications
- [ ] End-to-end encryption
- [ ] Message search
- [ ] Push notifications
- [ ] Offline support

## License

See [LICENSE](LICENSE)
