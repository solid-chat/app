# Plan: Rebrand to Nostr Chat

## Overview
Convert Solid Chat to a pure Nostr chat application using NIP-28 public channels.

## Target Repository
`github.com/nostrapps/nostr.chat`

---

## Phase 1: Repository Setup (10 min)

### 1.1 Create new repo
- [ ] Create `github.com/nostrapps/nostr.chat`
- [ ] Copy current app files
- [ ] Update git remotes

### 1.2 Update package.json
```json
{
  "name": "nostr-chat",
  "description": "Simple Nostr chat client using NIP-28 channels",
  "version": "0.1.0"
}
```

---

## Phase 2: Strip Solid Dependencies (30 min)

### 2.1 Remove from index.html
- [ ] Remove rdflib CDN script
- [ ] Remove solid-client-authn CDN script
- [ ] Remove all Solid OIDC login code
- [ ] Remove `store`, `fetcher`, `updater` objects
- [ ] Remove Type Index discovery
- [ ] Remove pod-related functions (`getMyPodRoot`, `createChat`, etc.)

### 2.2 Remove files
- [ ] Delete `src/chatListPane.js` (single room only)
- [ ] Delete `src/longChatPane.js` (will rewrite simpler)

### 2.3 Add nostr-tools
```html
<script src="https://unpkg.com/nostr-tools/lib/nostr.bundle.js"></script>
```
Or ES module:
```javascript
import { SimplePool, nip19, getPublicKey } from 'nostr-tools'
```

---

## Phase 3: Nostr Authentication (45 min)

### 3.1 NIP-07 Login
```javascript
// Check for extension
if (!window.nostr) {
  showError('Please install a Nostr extension (Alby, nos2x)')
  return
}

// Get public key
const pubkey = await window.nostr.getPublicKey()
currentUser = { pubkey, npub: nip19.npubEncode(pubkey) }
```

### 3.2 Login UI
- [ ] Replace IDP input with "Login with Nostr" button
- [ ] Show npub (truncated) when logged in
- [ ] Fetch and display profile name/avatar

### 3.3 Profile Fetching (kind:0)
```javascript
async function fetchProfile(pubkey) {
  const filter = { kinds: [0], authors: [pubkey], limit: 1 }
  const event = await pool.get(relays, filter)
  if (event) {
    return JSON.parse(event.content) // { name, picture, about, nip05 }
  }
  return null
}
```

---

## Phase 4: NIP-28 Channel Messages (1.5 hours)

### 4.1 Constants
```javascript
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]

// Global channel ID (create one or use existing)
const GLOBAL_CHANNEL_ID = '<channel-creation-event-id>'
```

### 4.2 Subscribe to Messages (kind:42)
```javascript
const pool = new SimplePool()

function subscribeToChannel(channelId) {
  const sub = pool.sub(RELAYS, [{
    kinds: [42],
    '#e': [channelId],
    limit: 100
  }])

  sub.on('event', (event) => {
    // event.content = message text
    // event.pubkey = sender
    // event.created_at = timestamp
    addMessageToUI(event)
  })

  return sub
}
```

### 4.3 Send Message (kind:42)
```javascript
async function sendMessage(channelId, content) {
  const event = {
    kind: 42,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['e', channelId, '', 'root']],
    content: content
  }

  // Sign with NIP-07
  const signedEvent = await window.nostr.signEvent(event)

  // Publish to relays
  await Promise.all(pool.publish(RELAYS, signedEvent))
}
```

### 4.4 Message Display
- [ ] Reuse existing message bubble CSS
- [ ] Show profile name (cached) or truncated npub
- [ ] Show timestamp
- [ ] Own messages on right, others on left

---

## Phase 5: Create Global Channel (15 min)

### 5.1 Create Channel Event (kind:40) - One time
```javascript
const channelEvent = {
  kind: 40,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: JSON.stringify({
    name: 'Nostr Chat Global',
    about: 'Public chat room for nostr.chat',
    picture: ''
  })
}
// Sign and publish, save the event ID
```

### 5.2 Hardcode Channel ID
After creating, hardcode the event ID in the app.

---

## Phase 6: Rebrand UI (30 min)

### 6.1 Text Changes
| Old | New |
|-----|-----|
| Solid Chat | Nostr Chat |
| Decentralized messaging | Chat over Nostr relays |
| solidweb.org | - |
| Login with IDP | Login with Nostr |

### 6.2 Theme Updates
- [ ] Rename themes or keep as-is
- [ ] Update brand colors if desired (Nostr purple: #8B5CF6?)
- [ ] Update favicon/icons

### 6.3 Meta Tags
```html
<title>Nostr Chat</title>
<meta name="description" content="Simple chat over Nostr relays">
<meta property="og:title" content="Nostr Chat">
```

---

## Phase 7: Simplify UI (20 min)

### 7.1 Remove sidebar
- Single global room = no chat list needed
- Simpler layout: header + messages + input

### 7.2 Keep
- Message bubbles
- Timestamps
- Theme switcher (optional)
- Sound notifications
- Auto-scroll

### 7.3 Remove
- Add chat modal
- Discover chats
- Chat list
- Deep linking (for now)

---

## File Structure (Final)

```
nostr.chat/
├── index.html          # Main app (simplified)
├── package.json
├── themes/
│   ├── nostr.css       # Default purple theme
│   ├── wave.css        # Keep or remove
│   └── ...
└── icons/
    └── icon.svg        # New Nostr-themed icon
```

---

## Dependencies

### Remove
- `rdflib@2.2.33`
- `@inrupt/solid-client-authn-browser@2.2.6`

### Add
- `nostr-tools` (via CDN or bundled)

---

## Estimated Time

| Phase | Time |
|-------|------|
| 1. Repo setup | 10 min |
| 2. Strip Solid | 30 min |
| 3. Nostr auth | 45 min |
| 4. NIP-28 messages | 1.5 hours |
| 5. Create channel | 15 min |
| 6. Rebrand UI | 30 min |
| 7. Simplify UI | 20 min |
| **Total** | **~4 hours** |

---

## Future Enhancements (Out of Scope)

- [ ] Multiple channels / rooms
- [ ] Private DMs (NIP-04)
- [ ] Reactions (NIP-25)
- [ ] Image uploads (via nostr.build)
- [ ] NIP-05 verification display
- [ ] Relay picker UI
- [ ] nsec login fallback (for users without extension)

---

## Open Questions

1. **Channel ID**: Create new or use existing public channel?
2. **Branding**: Keep theme names (Wave, Telegram) or rename?
3. **Relay list**: Which default relays?
4. **Read-only mode**: Allow viewing without login?

---

## Ready to Proceed?

Approve this plan to begin implementation.
