/**
 * Long Chat Pane - WhatsApp-style chat interface for Solid
 *
 * Experimental pane inspired by Wave messenger design.
 * Uses vanilla JS DOM manipulation.
 */

const CHAT = {
  namespace: 'http://www.w3.org/2007/ont/chat#',
  Message: 'http://www.w3.org/2007/ont/chat#Message',
  Chat: 'http://www.w3.org/2007/ont/chat#Chat'
}

const SIOC = {
  namespace: 'http://rdfs.org/sioc/ns#',
  Post: 'http://rdfs.org/sioc/ns#Post',
  content: 'http://rdfs.org/sioc/ns#content',
  Container: 'http://rdfs.org/sioc/ns#Container'
}

const FLOW = {
  namespace: 'http://www.w3.org/2005/01/wf/flow#',
  message: 'http://www.w3.org/2005/01/wf/flow#message',
  Message: 'http://www.w3.org/2005/01/wf/flow#Message'
}

// CSS styles as a string (will be injected)
const styles = `
.long-chat-pane {
  --gradient-start: #667eea;
  --gradient-end: #9f7aea;
  --bg-chat: #f7f8fc;
  --bg-message-in: #ffffff;
  --bg-message-out: linear-gradient(135deg, #e8e4f4 0%, #f0ecf8 100%);
  --text: #2d3748;
  --text-secondary: #4a5568;
  --text-muted: #a0aec0;
  --border: #e2e8f0;
  --accent: #805ad5;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: none;
  border-radius: 0;
  overflow: hidden;
  background: var(--bg-chat);
}

.long-chat-pane * {
  box-sizing: border-box;
}

.chat-header {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.chat-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  border: 2px solid rgba(255,255,255,0.3);
}

.chat-title {
  flex: 1;
}

.chat-name {
  font-weight: 500;
  font-size: 14px;
  color: white;
  text-decoration: none;
  opacity: 0.95;
}

.chat-name:hover {
  text-decoration: underline;
  opacity: 1;
}

.chat-status {
  font-size: 13px;
  opacity: 0.8;
}

.share-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.share-btn:hover {
  background: rgba(255,255,255,0.3);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(180deg, #f7f8fc 0%, #f0f2f8 100%);
}

.message-row {
  display: flex;
  margin-bottom: 2px;
  align-items: flex-end;
  gap: 8px;
}

.message-row.sent {
  justify-content: flex-end;
}

.message-row.received {
  justify-content: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-row.sent .message-avatar {
  order: 2;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px 10px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

.message-bubble.sent {
  background: #ede9fe;
  border-bottom-right-radius: 4px;
}

.message-bubble.sent .message-time {
  color: #a0aec0;
}

.message-bubble.received {
  background: var(--bg-message-in);
  border-bottom-left-radius: 4px;
  border: 1px solid #e8e8f0;
}

.message-text {
  font-size: 14.2px;
  line-height: 19px;
  color: var(--text);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
  text-decoration: none;
}

.message-time:hover {
  text-decoration: underline;
}

.message-author {
  font-size: 12px;
  font-weight: 600;
  color: #805ad5;
  margin-bottom: 4px;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  transition: color 0.2s;
}

.message-author:hover {
  color: #667eea;
  text-decoration: underline;
}

.input-area {
  background: white;
  padding: 12px 20px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border-top: 1px solid #e8e8f0;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  background: #f7f8fc;
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: #805ad5;
  box-shadow: 0 0 0 3px rgba(128, 90, 213, 0.1);
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  font-family: inherit;
  color: var(--text);
  resize: none;
  max-height: 100px;
  line-height: 20px;
  outline: none;
}

.message-input::placeholder {
  color: var(--text-muted);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #9f7aea 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.send-btn:disabled {
  background: #e2e8f0;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.emoji-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.emoji-btn:hover {
  background: #f0f2f8;
  color: var(--text);
}

.upload-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.upload-btn:hover {
  background: #f0f2f8;
  color: var(--text);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 8px;
  display: none;
  z-index: 100;
}

.emoji-picker.open {
  display: block;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.emoji-grid button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}

.emoji-grid button:hover {
  background: #f0f2f8;
}

.input-area {
  position: relative;
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  padding: 40px;
}

.empty-chat-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}

.message-text a {
  color: var(--accent);
  text-decoration: underline;
  word-break: break-all;
}

.message-text a:hover {
  opacity: 0.8;
}

.media-wrapper {
  margin: 8px 0;
  max-width: 100%;
}

.media-wrapper img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.media-wrapper img:hover {
  transform: scale(1.02);
}

.media-wrapper video,
.media-wrapper audio {
  max-width: 300px;
  border-radius: 8px;
}

.media-wrapper audio {
  width: 250px;
}

.message-text code {
  background: rgba(128, 90, 213, 0.1);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 13px;
}

.message-text pre {
  background: #f4f4f5;
  color: #1e1e2e;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e4e4e7;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 8px 0;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-text pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.message-actions {
  display: none;
  gap: 4px;
  margin-left: 8px;
}

.message-row:hover .message-actions {
  display: flex;
}

.message-actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: opacity 0.2s, background 0.2s;
}

.message-actions button:hover {
  opacity: 1;
  background: rgba(0,0,0,0.05);
}

.message-edited {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  margin-left: 6px;
}

.edit-textarea {
  width: 100%;
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  min-height: 40px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.edit-actions button {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
}

.edit-actions .save-btn {
  background: var(--accent);
  color: white;
}

.edit-actions .cancel-btn {
  background: #e2e8f0;
  color: var(--text);
}

.reaction-bar {
  display: none;
  gap: 2px;
  margin-top: 6px;
  padding: 4px 6px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: absolute;
  bottom: -8px;
  left: 8px;
}

.message-row:hover .reaction-bar {
  display: flex;
}

.reaction-bar button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: transform 0.15s, background 0.15s;
}

.reaction-bar button:hover {
  transform: scale(1.2);
  background: #f0f2f8;
}

.reactions-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.reaction-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #f0f2f8;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 13px;
  border: 1px solid #e2e8f0;
}

.reaction-chip .emoji {
  font-size: 14px;
}

.reaction-chip .count {
  font-size: 12px;
  color: var(--text-secondary);
}

.message-bubble {
  position: relative;
}
`

// Inject styles once
let stylesInjected = false
function injectStyles(dom) {
  if (stylesInjected) return
  const styleEl = dom.createElement('style')
  styleEl.textContent = styles
  dom.head.appendChild(styleEl)
  stylesInjected = true
}

// Format timestamp
function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// URL regex
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi

// Media extensions
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?.*)?$/i
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i

// Preset reactions
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Parse simple markdown: *bold*, _italic_, ~strike~, `code`, ```code blocks```
function parseMarkdown(text) {
  // Escape HTML first to prevent XSS
  let html = escapeHtml(text)

  // Code fences (must be first, before inline code)
  html = html.replace(/```\n?([\s\S]*?)\n?```/g, (_, code) => {
    return '<pre><code>' + code.trim() + '</code></pre>'
  })
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  // Bold
  html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
  // Italic
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  // Strikethrough
  html = html.replace(/~([^~]+)~/g, '<s>$1</s>')

  return html
}

// Render message content with links and media
function renderMessageContent(dom, content) {
  const container = dom.createElement('div')

  // Split by URLs
  const parts = content.split(URL_REGEX)

  for (const part of parts) {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0 // Reset regex state

      // Check if it's media
      if (IMAGE_EXT.test(part)) {
        // Image
        const wrapper = dom.createElement('div')
        wrapper.className = 'media-wrapper'
        const img = dom.createElement('img')
        img.src = part
        img.alt = 'Image'
        img.loading = 'lazy'
        img.onclick = () => window.open(part, '_blank')
        img.onload = () => {
          const mc = img.closest('.messages-container')
          if (mc) mc.scrollTop = mc.scrollHeight
        }
        wrapper.appendChild(img)
        container.appendChild(wrapper)
      } else if (VIDEO_EXT.test(part)) {
        // Video
        const wrapper = dom.createElement('div')
        wrapper.className = 'media-wrapper'
        const video = dom.createElement('video')
        video.src = part
        video.controls = true
        video.preload = 'metadata'
        wrapper.appendChild(video)
        container.appendChild(wrapper)
      } else if (AUDIO_EXT.test(part)) {
        // Audio
        const wrapper = dom.createElement('div')
        wrapper.className = 'media-wrapper'
        const audio = dom.createElement('audio')
        audio.src = part
        audio.controls = true
        audio.preload = 'metadata'
        wrapper.appendChild(audio)
        container.appendChild(wrapper)
      } else {
        // Regular link
        const link = dom.createElement('a')
        link.href = part
        link.textContent = part.length > 50 ? part.slice(0, 50) + '...' : part
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        container.appendChild(link)
      }
    } else if (part) {
      // Regular text with markdown
      const span = dom.createElement('span')
      span.innerHTML = parseMarkdown(part)
      container.appendChild(span)
    }
  }

  return container
}

// Get initials from name
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Avatar cache
const avatarCache = new Map()

// Fetch avatar from WebID profile
async function fetchAvatar(webId, store, $rdf) {
  if (!webId) return null
  if (avatarCache.has(webId)) return avatarCache.get(webId)

  try {
    const profile = $rdf.sym(webId)
    await store.fetcher.load(profile.doc())

    const ns = $rdf.Namespace
    const FOAF = ns('http://xmlns.com/foaf/0.1/')
    const VCARD = ns('http://www.w3.org/2006/vcard/ns#')

    const avatar = store.any(profile, FOAF('img'))?.value ||
                   store.any(profile, FOAF('depiction'))?.value ||
                   store.any(profile, VCARD('hasPhoto'))?.value

    avatarCache.set(webId, avatar)
    return avatar
  } catch (e) {
    avatarCache.set(webId, null)
    return null
  }
}

// Create message element
function createMessageElement(dom, message, isOwn, callbacks) {
  const row = dom.createElement('div')
  row.className = `message-row ${isOwn ? 'sent' : 'received'}`
  row.dataset.uri = message.uri

  // Avatar
  const avatar = dom.createElement('div')
  avatar.className = 'message-avatar'
  avatar.textContent = getInitials(message.author || '?')
  avatar.dataset.webid = message.authorUri || ''
  row.appendChild(avatar)

  const bubble = dom.createElement('div')
  bubble.className = `message-bubble ${isOwn ? 'sent' : 'received'}`

  // Author (for received messages in group chats)
  if (!isOwn && message.author) {
    const author = dom.createElement('a')
    author.className = 'message-author'
    author.textContent = message.author
    if (message.authorUri) {
      author.href = message.authorUri
      author.target = '_blank'
      author.rel = 'noopener'
    }
    bubble.appendChild(author)
  }

  const text = dom.createElement('div')
  text.className = 'message-text'
  const contentEl = renderMessageContent(dom, message.content || '')
  text.appendChild(contentEl)
  bubble.appendChild(text)

  const meta = dom.createElement('div')
  meta.className = 'message-meta'

  const time = dom.createElement('a')
  time.className = 'message-time'
  time.textContent = formatTime(message.date)
  time.href = message.uri
  time.target = '_blank'
  time.rel = 'noopener'
  time.title = message.uri
  meta.appendChild(time)

  // Edited indicator
  if (message.edited) {
    const edited = dom.createElement('span')
    edited.className = 'message-edited'
    edited.textContent = '(edited)'
    meta.appendChild(edited)
  }

  // Action buttons for own messages
  if (isOwn && callbacks) {
    const actions = dom.createElement('div')
    actions.className = 'message-actions'

    const editBtn = dom.createElement('button')
    editBtn.textContent = '✏️'
    editBtn.title = 'Edit'
    editBtn.onclick = (e) => {
      e.stopPropagation()
      callbacks.onEdit(message, row, text)
    }
    actions.appendChild(editBtn)

    const deleteBtn = dom.createElement('button')
    deleteBtn.textContent = '🗑️'
    deleteBtn.title = 'Delete'
    deleteBtn.onclick = (e) => {
      e.stopPropagation()
      callbacks.onDelete(message, row)
    }
    actions.appendChild(deleteBtn)

    meta.appendChild(actions)
  }

  bubble.appendChild(meta)

  // Reactions display (existing reactions)
  const reactionsDisplay = dom.createElement('div')
  reactionsDisplay.className = 'reactions-display'
  reactionsDisplay.dataset.msgUri = message.uri
  if (message.reactions) {
    for (const [emoji, users] of Object.entries(message.reactions)) {
      const chip = dom.createElement('div')
      chip.className = 'reaction-chip'
      chip.innerHTML = `<span class="emoji">${emoji}</span><span class="count">${users.length}</span>`
      chip.title = users.map(u => u.split('/').pop().split('#')[0]).join(', ')
      reactionsDisplay.appendChild(chip)
    }
  }
  bubble.appendChild(reactionsDisplay)

  // Reaction bar (hover to show)
  if (callbacks?.onReact) {
    const reactionBar = dom.createElement('div')
    reactionBar.className = 'reaction-bar'
    for (const emoji of REACTIONS) {
      const btn = dom.createElement('button')
      btn.textContent = emoji
      btn.onclick = (e) => {
        e.stopPropagation()
        callbacks.onReact(message, emoji, reactionsDisplay)
      }
      reactionBar.appendChild(btn)
    }
    bubble.appendChild(reactionBar)
  }

  row.appendChild(bubble)

  return row
}

// Main pane definition
export const longChatPane = {
  icon: 'https://solid.github.io/solid-ui/src/icons/noun_Forum_3572062.svg',
  name: 'long-chat',

  label: function(subject, context) {
    const dominated = async function() { return false }
    const store = context.session.store
    const dominated2 = async function() { return false }
    const dominated3 = async function() { return false }

    // Check for chat types
    const dominated4 = async function() { return false }
    const dominated5 = async function() { return false }

    const dominated6 = async function() { return false }
    const dominated7 = async function() { return false }

    // Check if it's a chat resource
    const dominated8 = async function() { return false }
    const dominated9 = async function() { return false }

    const dominated10 = async function() { return false }
    const dominated11 = async function() { return false }

    const dominated12 = async function() { return false }
    const dominated13 = async function() { return false }
    const dominated14 = async function() { return false }
    const dominated15 = async function() { return false }

    const dominated16 = async function() { return false }
    const dominated17 = async function() { return false }
    const dominated18 = async function() { return false }
    const $rdf = context.session.store.rdflib || globalThis.$rdf

    if (!$rdf) return null

    const ns = $rdf.Namespace
    const RDF = ns('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    const MEETING = ns('http://www.w3.org/ns/pim/meeting#')
    const FLOW = ns('http://www.w3.org/2005/01/wf/flow#')

    // Check various chat types
    if (store.holds(subject, RDF('type'), MEETING('LongChat')) ||
        store.holds(subject, RDF('type'), FLOW('Chat')) ||
        subject.uri?.includes('/chat') ||
        subject.uri?.endsWith('.ttl') && subject.uri?.includes('chat')) {
      return 'Long Chat'
    }

    return null
  },

  render: function(subject, context, options) {
    const dom = context.dom
    const store = context.session.store
    const $rdf = store.rdflib || globalThis.$rdf

    injectStyles(dom)

    // Create main container
    const container = dom.createElement('div')
    container.className = 'long-chat-pane'

    // Header
    const header = dom.createElement('div')
    header.className = 'chat-header'

    const avatar = dom.createElement('div')
    avatar.className = 'chat-avatar'
    avatar.textContent = 'C'
    header.appendChild(avatar)

    const titleDiv = dom.createElement('div')
    titleDiv.className = 'chat-title'

    const nameEl = dom.createElement('a')
    nameEl.className = 'chat-name'
    nameEl.href = subject.uri
    nameEl.target = '_blank'
    nameEl.rel = 'noopener'
    nameEl.textContent = subject.uri
    titleDiv.appendChild(nameEl)

    const statusEl = dom.createElement('div')
    statusEl.className = 'chat-status'
    statusEl.textContent = 'Loading...'
    titleDiv.appendChild(statusEl)

    header.appendChild(titleDiv)

    // Share button
    const shareBtn = dom.createElement('button')
    shareBtn.className = 'share-btn'
    shareBtn.textContent = '📋'
    shareBtn.title = 'Copy share link'
    shareBtn.onclick = () => {
      if (window.solidChat?.copyShareLink) {
        window.solidChat.copyShareLink(subject.uri)
      } else {
        // Fallback
        const shareUrl = `${window.location.origin}${window.location.pathname}?chat=${encodeURIComponent(subject.uri)}`
        navigator.clipboard.writeText(shareUrl).catch(() => {
          prompt('Copy this link:', shareUrl)
        })
      }
    }
    header.appendChild(shareBtn)

    container.appendChild(header)

    // Messages container
    const messagesContainer = dom.createElement('div')
    messagesContainer.className = 'messages-container'
    container.appendChild(messagesContainer)

    // Input area
    const inputArea = dom.createElement('div')
    inputArea.className = 'input-area'

    // Emoji picker
    const emojiPicker = dom.createElement('div')
    emojiPicker.className = 'emoji-picker'
    const emojiGrid = dom.createElement('div')
    emojiGrid.className = 'emoji-grid'
    const emojis = ['😀','😂','😊','🥰','😎','🤔','😢','😡','👍','👎','❤️','🔥','🎉','✨','💬','👋','🙏','💪','✅','❌','⭐','💡','📌','🚀','☕','🌟','💯','🤝']
    emojis.forEach(e => {
      const btn = dom.createElement('button')
      btn.textContent = e
      btn.type = 'button'
      btn.onclick = () => {
        input.value += e
        input.focus()
        sendBtn.disabled = !input.value.trim()
      }
      emojiGrid.appendChild(btn)
    })
    emojiPicker.appendChild(emojiGrid)
    inputArea.appendChild(emojiPicker)

    // Emoji button
    const emojiBtn = dom.createElement('button')
    emojiBtn.className = 'emoji-btn'
    emojiBtn.textContent = '😊'
    emojiBtn.type = 'button'
    emojiBtn.onclick = () => {
      emojiPicker.classList.toggle('open')
    }
    inputArea.appendChild(emojiBtn)

    // Upload button
    const uploadBtn = dom.createElement('button')
    uploadBtn.className = 'upload-btn'
    uploadBtn.textContent = '📎'
    uploadBtn.type = 'button'
    uploadBtn.title = 'Upload image/file'
    inputArea.appendChild(uploadBtn)

    // Hidden file input
    const fileInput = dom.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*,video/*,audio/*'
    fileInput.style.display = 'none'
    inputArea.appendChild(fileInput)

    uploadBtn.onclick = () => fileInput.click()

    // Shared upload function for file input and paste
    async function uploadFile(file) {
      // Re-check current user (may have logged in after pane loaded)
      const authnCheck = context.session?.logic?.authn || globalThis.SolidLogic?.authn
      const uploadUser = authnCheck?.currentUser()?.value || currentUser

      // Check if logged in
      if (!uploadUser) {
        alert('Please log in to upload files')
        return
      }

      // Disable button during upload
      uploadBtn.disabled = true
      uploadBtn.textContent = '⏳'

      try {
        // Get authenticated fetch from context
        const authFetch = context.authFetch ? context.authFetch() : fetch

        // Extract pod root from WebID
        const webIdUrl = new URL(uploadUser)
        const podRoot = `${webIdUrl.protocol}//${webIdUrl.host}/`

        // Create unique filename with timestamp
        const timestamp = Date.now()
        const safeName = (file.name || 'pasted-image.png').replace(/[^a-zA-Z0-9.-]/g, '_')
        const uploadPath = `${podRoot}public/chat-uploads/${timestamp}-${safeName}`

        // Upload file using authenticated fetch
        const response = await authFetch(uploadPath, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          },
          body: file
        })

        if (!response.ok) {
          // Try to create container first
          if (response.status === 404 || response.status === 409) {
            const containerPath = `${podRoot}public/chat-uploads/`
            await authFetch(containerPath, {
              method: 'PUT',
              headers: { 'Content-Type': 'text/turtle' },
              body: ''
            })
            // Retry upload
            const retry = await authFetch(uploadPath, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
            })
            if (!retry.ok) {
              throw new Error(`Upload failed: ${retry.status} ${retry.statusText}`)
            }
          } else {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
          }
        }

        // Insert URL into message input
        const currentText = input.value
        input.value = currentText + (currentText ? ' ' : '') + uploadPath
        input.dispatchEvent(new Event('input'))
        input.focus()

      } catch (err) {
        console.error('Upload error:', err)
        alert('Failed to upload file: ' + err.message)
      }

      // Reset
      uploadBtn.disabled = false
      uploadBtn.textContent = '📎'
    }

    // File input handler
    fileInput.onchange = async () => {
      const file = fileInput.files[0]
      if (file) await uploadFile(file)
      fileInput.value = ''
    }

    const inputWrapper = dom.createElement('div')
    inputWrapper.className = 'input-wrapper'

    const input = dom.createElement('textarea')
    input.className = 'message-input'
    input.placeholder = 'Type a message'
    input.rows = 1
    inputWrapper.appendChild(input)
    inputArea.appendChild(inputWrapper)

    const sendBtn = dom.createElement('button')
    sendBtn.className = 'send-btn'
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>'
    sendBtn.disabled = true
    inputArea.appendChild(sendBtn)

    // Close emoji picker when clicking elsewhere
    dom.addEventListener('click', (e) => {
      if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.remove('open')
      }
    })

    container.appendChild(inputArea)

    // State
    let messages = []
    let renderedUris = new Set()
    let currentUser = null
    let isFirstLoad = true

    // Get current user
    const authn = context.session?.logic?.authn || globalThis.SolidLogic?.authn
    if (authn) {
      currentUser = authn.currentUser()?.value
    }

    // Delete message handler
    async function handleDelete(message, rowEl) {
      if (!confirm('Delete this message?')) return

      try {
        const authFetch = context.authFetch ? context.authFetch() : fetch
        const doc = subject.doc ? subject.doc() : subject
        const msgUri = message.uri

        // Get all triples about this message from the store
        const msgNode = store.sym(msgUri)
        const statements = store.statementsMatching(msgNode, null, null, doc)

        if (statements.length === 0) {
          throw new Error('No statements found for this message')
        }

        // Build DELETE DATA with explicit triples (more compatible than DELETE WHERE with variables)
        const triples = statements.map(st => {
          const obj = st.object
          let objStr
          if (obj.termType === 'NamedNode') {
            objStr = `<${obj.value}>`
          } else if (obj.termType === 'Literal') {
            // Escape special characters in literal value (Turtle escaping)
            const escaped = obj.value
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t')
            if (obj.datatype && obj.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
              objStr = `"${escaped}"^^<${obj.datatype.value}>`
            } else if (obj.language) {
              objStr = `"${escaped}"@${obj.language}`
            } else {
              objStr = `"${escaped}"`
            }
          } else {
            objStr = `"${obj.value}"`
          }
          return `<${st.subject.value}> <${st.predicate.value}> ${objStr} .`
        }).join('\n')

        const deleteQuery = `DELETE DATA {\n${triples}\n}`

        const response = await authFetch(doc.value || doc.uri, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/sparql-update' },
          body: deleteQuery
        })

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.status}`)
        }

        // Show brief success indicator
        statusEl.textContent = '✓ Deleted'
        setTimeout(() => { statusEl.textContent = `${messages.length - 1} messages` }, 1000)

        // Remove from local store (prevents ghost re-render on WebSocket refresh)
        statements.forEach(st => store.remove(st))

        // Remove from UI
        rowEl.remove()
        renderedUris.delete(message.uri)
        messages = messages.filter(m => m.uri !== message.uri)

      } catch (err) {
        console.error('Delete error:', err)
        statusEl.textContent = '✗ Delete failed'
        setTimeout(() => { statusEl.textContent = `${messages.length} messages` }, 2000)
        alert('Failed to delete: ' + err.message)
      }
    }

    // Edit message handler
    async function handleEdit(message, rowEl, textEl) {
      // Replace text content with textarea
      const originalContent = message.content
      textEl.innerHTML = ''

      const textarea = dom.createElement('textarea')
      textarea.className = 'edit-textarea'
      textarea.value = originalContent
      textEl.appendChild(textarea)

      const actions = dom.createElement('div')
      actions.className = 'edit-actions'

      const saveBtn = dom.createElement('button')
      saveBtn.className = 'save-btn'
      saveBtn.textContent = 'Save'

      const cancelBtn = dom.createElement('button')
      cancelBtn.className = 'cancel-btn'
      cancelBtn.textContent = 'Cancel'

      actions.appendChild(saveBtn)
      actions.appendChild(cancelBtn)
      textEl.appendChild(actions)

      textarea.focus()
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)

      // Cancel handler
      cancelBtn.onclick = () => {
        textEl.innerHTML = ''
        textEl.appendChild(renderMessageContent(dom, originalContent))
      }

      // Save handler
      saveBtn.onclick = async () => {
        const newContent = textarea.value.trim()
        if (!newContent || newContent === originalContent) {
          cancelBtn.onclick()
          return
        }

        saveBtn.disabled = true
        saveBtn.textContent = 'Saving...'

        try {
          const authFetch = context.authFetch ? context.authFetch() : fetch
          const doc = subject.doc ? subject.doc() : subject
          const msgUri = message.uri

          // SPARQL DELETE old content + INSERT new content
          const ns = $rdf.Namespace
          const SIOC = ns('http://rdfs.org/sioc/ns#')

          const updateQuery = `
            DELETE { <${msgUri}> <${SIOC('content').value}> ?content }
            INSERT { <${msgUri}> <${SIOC('content').value}> ${JSON.stringify(newContent)} }
            WHERE { <${msgUri}> <${SIOC('content').value}> ?content }
          `

          const response = await authFetch(doc.value || doc.uri, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/sparql-update' },
            body: updateQuery
          })

          if (!response.ok) {
            throw new Error(`Edit failed: ${response.status}`)
          }

          // Update UI
          message.content = newContent
          message.edited = true
          textEl.innerHTML = ''
          textEl.appendChild(renderMessageContent(dom, newContent))

          // Add edited indicator if not present
          const meta = rowEl.querySelector('.message-meta')
          if (meta && !meta.querySelector('.message-edited')) {
            const edited = dom.createElement('span')
            edited.className = 'message-edited'
            edited.textContent = '(edited)'
            meta.insertBefore(edited, meta.querySelector('.message-actions'))
          }

        } catch (err) {
          console.error('Edit error:', err)
          alert('Failed to edit: ' + err.message)
          saveBtn.disabled = false
          saveBtn.textContent = 'Save'
        }
      }
    }

    // React to message handler
    async function handleReact(message, emoji, reactionsDisplay) {
      // Check if logged in
      const authnCheck = context.session?.logic?.authn || globalThis.SolidLogic?.authn
      const reactUser = authnCheck?.currentUser()?.value || currentUser

      if (!reactUser) {
        alert('Please log in to react')
        return
      }

      try {
        const authFetch = context.authFetch ? context.authFetch() : fetch
        const doc = subject.doc ? subject.doc() : subject

        // Create reaction URI
        const reactionId = `#reaction-${Date.now()}`
        const reactionUri = subject.uri + reactionId

        // RDF namespace
        const SCHEMA = 'http://schema.org/'

        // SPARQL INSERT for reaction
        const insertQuery = `
          INSERT DATA {
            <${reactionUri}> a <${SCHEMA}ReactAction> ;
              <${SCHEMA}about> <${message.uri}> ;
              <${SCHEMA}agent> <${reactUser}> ;
              <${SCHEMA}name> "${emoji}" .
          }
        `

        const response = await authFetch(doc.value || doc.uri, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/sparql-update' },
          body: insertQuery
        })

        if (!response.ok) {
          throw new Error(`React failed: ${response.status}`)
        }

        // Update UI - add or increment reaction
        if (!message.reactions) message.reactions = {}
        if (!message.reactions[emoji]) message.reactions[emoji] = []
        if (!message.reactions[emoji].includes(reactUser)) {
          message.reactions[emoji].push(reactUser)
        }

        // Re-render reactions display
        reactionsDisplay.innerHTML = ''
        for (const [e, users] of Object.entries(message.reactions)) {
          const chip = dom.createElement('div')
          chip.className = 'reaction-chip'
          chip.innerHTML = `<span class="emoji">${e}</span><span class="count">${users.length}</span>`
          chip.title = users.map(u => u.split('/').pop().split('#')[0]).join(', ')
          reactionsDisplay.appendChild(chip)
        }

      } catch (err) {
        console.error('React error:', err)
        alert('Failed to react: ' + err.message)
      }
    }

    // Callbacks for message actions
    const messageCallbacks = {
      onEdit: handleEdit,
      onDelete: handleDelete,
      onReact: handleReact
    }

    // Load messages from store
    async function loadMessages(skipFetch = false) {
      if (isFirstLoad) {
        statusEl.textContent = 'Loading messages...'
        messagesContainer.innerHTML = ''
      }

      try {
        // Define namespaces
        const ns = $rdf.Namespace
        const FLOW = ns('http://www.w3.org/2005/01/wf/flow#')
        const SIOC = ns('http://rdfs.org/sioc/ns#')
        const DC = ns('http://purl.org/dc/elements/1.1/')
        const DCT = ns('http://purl.org/dc/terms/')
        const FOAF = ns('http://xmlns.com/foaf/0.1/')

        // Fetch the document (skip if refresh already loaded fresh data)
        const doc = subject.doc ? subject.doc() : subject
        if (!skipFetch) {
          await store.fetcher.load(doc)
        }

        // Get chat title from the subject or document
        const chatNode = subject.uri.includes('#') ? subject : $rdf.sym(subject.uri + '#this')
        const title = store.any(chatNode, DCT('title'), null, doc)?.value ||
                     store.any(chatNode, DC('title'), null, doc)?.value ||
                     store.any(subject, DCT('title'), null, doc)?.value ||
                     store.any(null, DCT('title'), null, doc)?.value
        if (title) {
          // Show title with URI as subtitle
          nameEl.textContent = title
          nameEl.title = subject.uri  // Tooltip shows full URI
        }

        // Extract all messages with sioc:content from this document
        const contentStatements = store.statementsMatching(null, SIOC('content'), null, doc)
        const newMessages = []

        for (const st of contentStatements) {
          const msgNode = st.subject
          const content = st.object.value

          if (!content) continue

          const date = store.any(msgNode, DCT('created'), null, doc)?.value ||
                      store.any(msgNode, DC('created'), null, doc)?.value ||
                      store.any(msgNode, DC('date'), null, doc)?.value

          const maker = store.any(msgNode, FOAF('maker'), null, doc) ||
                       store.any(msgNode, DC('author'), null, doc) ||
                       store.any(msgNode, DCT('creator'), null, doc)

          let authorName = null
          if (maker) {
            // Try to get name from loaded profile or use URI fragment
            authorName = store.any(maker, FOAF('name'))?.value ||
                        maker.value?.split('//')[1]?.split('.')[0] ||
                        'Unknown'
          }

          newMessages.push({
            uri: msgNode.value,
            content,
            date: date ? new Date(date) : new Date(),
            author: authorName,
            authorUri: maker?.value
          })
        }

        // Sort by date
        newMessages.sort((a, b) => (a.date || 0) - (b.date || 0))

        // Keep only last 100 messages for performance
        const allMessages = newMessages.slice(-100)

        // Load reactions for messages
        const SCHEMA = ns('http://schema.org/')
        const reactionStatements = store.statementsMatching(null, SCHEMA('about'), null, doc)
        for (const st of reactionStatements) {
          const reactionNode = st.subject
          const aboutMsg = st.object.value
          const emoji = store.any(reactionNode, SCHEMA('name'), null, doc)?.value
          const agent = store.any(reactionNode, SCHEMA('agent'), null, doc)?.value

          if (emoji && agent) {
            const msg = allMessages.find(m => m.uri === aboutMsg)
            if (msg) {
              if (!msg.reactions) msg.reactions = {}
              if (!msg.reactions[emoji]) msg.reactions[emoji] = []
              if (!msg.reactions[emoji].includes(agent)) {
                msg.reactions[emoji].push(agent)
              }
            }
          }
        }

        // Find messages that haven't been rendered yet
        const unrenderedMessages = allMessages.filter(m => !renderedUris.has(m.uri))

        // Find messages that were rendered but no longer exist (deleted)
        const currentUris = new Set(allMessages.map(m => m.uri))
        const deletedUris = [...renderedUris].filter(uri => !currentUris.has(uri))

        // Remove deleted messages from UI
        for (const uri of deletedUris) {
          const el = messagesContainer.querySelector(`[data-uri="${uri}"]`)
          if (el) el.remove()
          renderedUris.delete(uri)
        }

        // Render only new messages (or all on first load)
        if (isFirstLoad) {
          if (allMessages.length === 0) {
            const empty = dom.createElement('div')
            empty.className = 'empty-chat'
            empty.innerHTML = '<div class="empty-chat-icon">💬</div><div>No messages yet</div><div>Be the first to say hello!</div>'
            messagesContainer.appendChild(empty)
          } else {
            for (const msg of allMessages) {
              const isOwn = currentUser && msg.authorUri === currentUser
              const el = createMessageElement(dom, msg, isOwn, messageCallbacks)
              messagesContainer.appendChild(el)
              renderedUris.add(msg.uri)
            }
          }
          isFirstLoad = false
        } else if (unrenderedMessages.length > 0) {
          // Remove empty state if present
          const empty = messagesContainer.querySelector('.empty-chat')
          if (empty) empty.remove()

          // Append only new messages
          for (const msg of unrenderedMessages) {
            const isOwn = currentUser && msg.authorUri === currentUser
            const el = createMessageElement(dom, msg, isOwn, messageCallbacks)
            messagesContainer.appendChild(el)
            renderedUris.add(msg.uri)
          }
        }

        messages = allMessages
        statusEl.textContent = `${messages.length} messages`

        // Update reactions for already-rendered messages
        for (const msg of allMessages) {
          if (msg.reactions) {
            const reactionsDisplay = messagesContainer.querySelector(`.reactions-display[data-msg-uri="${msg.uri}"]`)
            if (reactionsDisplay) {
              const currentHtml = reactionsDisplay.innerHTML
              let newHtml = ''
              for (const [emoji, users] of Object.entries(msg.reactions)) {
                const title = users.map(u => u.split('/').pop().split('#')[0]).join(', ')
                newHtml += `<div class="reaction-chip"><span class="emoji">${emoji}</span><span class="count">${users.length}</span></div>`
              }
              // Only update if changed (avoid flicker)
              if (reactionsDisplay.innerHTML !== newHtml) {
                reactionsDisplay.innerHTML = newHtml
                // Re-add titles
                const chips = reactionsDisplay.querySelectorAll('.reaction-chip')
                let i = 0
                for (const [emoji, users] of Object.entries(msg.reactions)) {
                  if (chips[i]) chips[i].title = users.map(u => u.split('/').pop().split('#')[0]).join(', ')
                  i++
                }
              }
            }
          }
        }

        // Scroll to bottom only if there are new messages
        if (isFirstLoad || unrenderedMessages.length > 0) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }

        // Load avatars in parallel (only for new messages)
        const newWebIds = [...new Set(unrenderedMessages.map(m => m.authorUri).filter(Boolean))]
        const uniqueWebIds = isFirstLoad ? [...new Set(messages.map(m => m.authorUri).filter(Boolean))] : newWebIds
        Promise.all(uniqueWebIds.map(webId =>
          fetchAvatar(webId, store, $rdf).then(avatarUrl => ({ webId, avatarUrl }))
        )).then(results => {
          results.forEach(({ webId, avatarUrl }) => {
            if (avatarUrl) {
              const avatars = messagesContainer.querySelectorAll(`.message-avatar[data-webid="${webId}"]`)
              avatars.forEach(el => {
                el.innerHTML = `<img src="${avatarUrl}" alt="" />`
              })
            }
          })
        })

      } catch (err) {
        console.error('Error loading chat:', err)
        statusEl.textContent = 'Error loading chat'
        messagesContainer.innerHTML = `<div class="loading">Error: ${err.message}</div>`
      }
    }

    // Send message
    async function sendMessage() {
      const text = input.value.trim()
      if (!text) return

      sendBtn.disabled = true
      input.disabled = true

      try {
        const ns = $rdf.Namespace
        const FLOW = ns('http://www.w3.org/2005/01/wf/flow#')
        const SIOC = ns('http://rdfs.org/sioc/ns#')
        const DCT = ns('http://purl.org/dc/terms/')
        const FOAF = ns('http://xmlns.com/foaf/0.1/')
        const RDF = ns('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

        const msgId = `#msg-${Date.now()}`
        const msgNode = $rdf.sym(subject.uri + msgId)
        const now = new Date().toISOString()

        const ins = [
          $rdf.st(subject, FLOW('message'), msgNode, subject.doc()),
          $rdf.st(msgNode, RDF('type'), FLOW('Message'), subject.doc()),
          $rdf.st(msgNode, SIOC('content'), text, subject.doc()),
          $rdf.st(msgNode, DCT('created'), $rdf.lit(now, null, $rdf.sym('http://www.w3.org/2001/XMLSchema#dateTime')), subject.doc())
        ]

        if (currentUser) {
          ins.push($rdf.st(msgNode, FOAF('maker'), $rdf.sym(currentUser), subject.doc()))
        }

        await store.updater.update([], ins)

        // Add to UI immediately
        const msg = {
          uri: msgNode.value,
          content: text,
          date: new Date(now),
          author: 'You',
          authorUri: currentUser
        }

        // Remove empty state if present
        const empty = messagesContainer.querySelector('.empty-chat')
        if (empty) empty.remove()

        const el = createMessageElement(dom, msg, true, messageCallbacks)
        messagesContainer.appendChild(el)
        messagesContainer.scrollTop = messagesContainer.scrollHeight

        // Track as rendered to prevent duplicate on refresh
        renderedUris.add(msg.uri)
        messages.push(msg)
        statusEl.textContent = `${messages.length} messages`

        input.value = ''
        input.style.height = 'auto'

      } catch (err) {
        console.error('Error sending message:', err)
        alert('Failed to send message: ' + err.message)
      }

      sendBtn.disabled = !input.value.trim()
      input.disabled = false
      input.focus()
    }

    // Event listeners
    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim()
      input.style.height = 'auto'
      input.style.height = Math.min(input.scrollHeight, 100) + 'px'
    })

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    })

    // Paste image handler
    input.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) uploadFile(file)
          break
        }
      }
    })

    sendBtn.addEventListener('click', sendMessage)

    // Expose refresh method for incremental updates
    container.refresh = async function() {
      // Re-fetch the document
      const doc = subject.doc ? subject.doc() : subject
      const docUri = doc.uri || doc.value

      // Clear existing statements for this document before reloading
      const existingStatements = store.statementsMatching(null, null, null, doc)
      existingStatements.forEach(st => store.remove(st))

      // Fetch with cache-busting to bypass browser cache
      const authFetch = context.authFetch ? context.authFetch() : fetch
      const cacheBustUrl = docUri + (docUri.includes('?') ? '&' : '?') + '_t=' + Date.now()

      const response = await authFetch(cacheBustUrl, {
        headers: { 'Accept': 'text/turtle, application/ld+json, application/rdf+xml' },
        cache: 'no-store'
      })

      if (response.ok) {
        const text = await response.text()
        const contentType = response.headers.get('content-type') || 'text/turtle'
        $rdf.parse(text, store, docUri, contentType)
      }

      // skipFetch=true because we already loaded fresh data above
      await loadMessages(true)
    }

    // Initial load
    loadMessages()

    return container
  }
}

export default longChatPane
