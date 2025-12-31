/**
 * Chat List Pane - Sidebar showing user's chats
 *
 * Follows same pattern as longChatPane.js.
 * Uses vanilla JS DOM manipulation.
 */

// Namespaces for Type Index discovery
const SOLID = {
  publicTypeIndex: 'http://www.w3.org/ns/solid/terms#publicTypeIndex',
  privateTypeIndex: 'http://www.w3.org/ns/solid/terms#privateTypeIndex',
  forClass: 'http://www.w3.org/ns/solid/terms#forClass',
  instance: 'http://www.w3.org/ns/solid/terms#instance'
}

const MEETING = {
  LongChat: 'http://www.w3.org/ns/pim/meeting#LongChat'
}

// Storage key for localStorage
const STORAGE_KEY = 'solidchat-chats'

// Default global chat
const DEFAULT_CHAT = {
  uri: 'https://solid-chat.solidcommunity.net/public/global/chat.ttl',
  title: 'Solid Chat Global',
  lastMessage: 'Welcome to the global chat!',
  timestamp: '2025-12-31T09:00:00Z'
}

// CSS styles
const styles = `
.chat-list-pane {
  --gradient-start: #667eea;
  --gradient-end: #9f7aea;
  --bg: #ffffff;
  --bg-hover: #f7f8fc;
  --bg-active: #ede9fe;
  --text: #2d3748;
  --text-secondary: #4a5568;
  --text-muted: #a0aec0;
  --border: #e2e8f0;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
  border-right: 1px solid var(--border);
}

.chat-list-pane * {
  box-sizing: border-box;
}

.sidebar-header {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  padding: 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-title {
  font-weight: 600;
  font-size: 18px;
}

.add-chat-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  font-size: 20px;
  font-weight: 300;
}

.add-chat-btn:hover {
  background: rgba(255,255,255,0.3);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;
}

.chat-item:hover {
  background: var(--bg-hover);
}

.chat-item.active {
  background: var(--bg-active);
  border-left-color: var(--gradient-start);
}

.chat-item-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}

.chat-item-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.chat-item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.chat-item-title {
  font-weight: 500;
  font-size: 15px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item-time {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.chat-item-preview {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.discover-btn {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.discover-btn:hover {
  background: var(--bg-hover);
  border-color: var(--gradient-start);
  color: var(--gradient-start);
}

.discover-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: var(--text-muted);
}

.empty-list-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-list-text {
  font-size: 14px;
  line-height: 1.5;
}

/* Add Chat Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text);
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.modal-input:focus {
  outline: none;
  border-color: var(--gradient-start);
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn-cancel {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.modal-btn-cancel:hover {
  background: var(--border);
}

.modal-btn-add {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  border: none;
  color: white;
}

.modal-btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modal-btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Delete button on chat item */
.chat-item-delete {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.chat-item:hover .chat-item-delete {
  display: flex;
}

.chat-item-delete:hover {
  background: #fee2e2;
  color: #dc2626;
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

// State
let chatList = []
let activeUri = null
let listContainer = null
let onSelectCallback = null
let contextRef = null

// Load chat list from localStorage
function loadChatList() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      chatList = JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load chat list:', e)
    chatList = []
  }

  // Add default global chat if list is empty
  if (chatList.length === 0) {
    chatList.push({ ...DEFAULT_CHAT })
    saveChatList()
  }

  // Ensure default chat exists in list
  const hasDefault = chatList.some(c => c.uri === DEFAULT_CHAT.uri)
  if (!hasDefault) {
    chatList.unshift({ ...DEFAULT_CHAT })
    saveChatList()
  }

  return chatList
}

// Save chat list to localStorage
function saveChatList() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatList))
  } catch (e) {
    console.warn('Failed to save chat list:', e)
  }
}

// Add a chat to the list
function addChat(uri, title, lastMessage = '', timestamp = null) {
  // Check if already exists
  const existing = chatList.find(c => c.uri === uri)
  if (existing) {
    // Update existing
    if (title) existing.title = title
    if (lastMessage) existing.lastMessage = lastMessage
    if (timestamp) existing.timestamp = timestamp
  } else {
    chatList.unshift({
      uri,
      title: title || getTitleFromUri(uri),
      lastMessage,
      timestamp: timestamp || new Date().toISOString()
    })
  }
  saveChatList()
  renderChatList()
}

// Remove a chat from the list
function removeChat(uri) {
  chatList = chatList.filter(c => c.uri !== uri)
  saveChatList()
  renderChatList()
}

// Update chat preview (called after loading messages)
function updateChatPreview(uri, lastMessage, timestamp) {
  const chat = chatList.find(c => c.uri === uri)
  if (chat) {
    chat.lastMessage = lastMessage
    chat.timestamp = timestamp
    saveChatList()
    renderChatList()
  }
}

// Get title from URI
function getTitleFromUri(uri) {
  try {
    const url = new URL(uri)
    const path = url.pathname
    const parts = path.split('/').filter(Boolean)
    const name = parts[parts.length - 1] || parts[parts.length - 2] || 'Chat'
    return decodeURIComponent(name.replace(/\.ttl$/, '').replace(/[-_]/g, ' '))
  } catch {
    return 'Chat'
  }
}

// Format timestamp for display
function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get initials from title
function getInitials(title) {
  if (!title) return '?'
  return title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Render the chat list
function renderChatList() {
  if (!listContainer || !contextRef) return

  const dom = contextRef.dom
  listContainer.innerHTML = ''

  if (chatList.length === 0) {
    const empty = dom.createElement('div')
    empty.className = 'empty-list'
    empty.innerHTML = `
      <div class="empty-list-icon">💬</div>
      <div class="empty-list-text">No chats yet.<br>Add one with the + button above.</div>
    `
    listContainer.appendChild(empty)
    return
  }

  chatList.forEach(chat => {
    const item = dom.createElement('div')
    item.className = 'chat-item' + (chat.uri === activeUri ? ' active' : '')

    const avatar = dom.createElement('div')
    avatar.className = 'chat-item-avatar'
    avatar.textContent = getInitials(chat.title)

    const content = dom.createElement('div')
    content.className = 'chat-item-content'

    const header = dom.createElement('div')
    header.className = 'chat-item-header'

    const title = dom.createElement('div')
    title.className = 'chat-item-title'
    title.textContent = chat.title

    const time = dom.createElement('div')
    time.className = 'chat-item-time'
    time.textContent = formatTimestamp(chat.timestamp)

    header.appendChild(title)
    header.appendChild(time)

    const preview = dom.createElement('div')
    preview.className = 'chat-item-preview'
    preview.textContent = chat.lastMessage || 'No messages yet'

    content.appendChild(header)
    content.appendChild(preview)

    const deleteBtn = dom.createElement('button')
    deleteBtn.className = 'chat-item-delete'
    deleteBtn.textContent = '×'
    deleteBtn.title = 'Remove from list'
    deleteBtn.onclick = (e) => {
      e.stopPropagation()
      removeChat(chat.uri)
    }

    item.appendChild(avatar)
    item.appendChild(content)
    item.appendChild(deleteBtn)

    item.onclick = () => {
      activeUri = chat.uri
      renderChatList()
      if (onSelectCallback) {
        onSelectCallback(chat.uri)
      }
    }

    listContainer.appendChild(item)
  })
}

// Show add chat modal
function showAddModal(dom) {
  const overlay = dom.createElement('div')
  overlay.className = 'modal-overlay'

  const modal = dom.createElement('div')
  modal.className = 'modal'

  modal.innerHTML = `
    <div class="modal-title">Add Chat</div>
    <input type="url" class="modal-input" placeholder="Enter chat URL..." />
    <div class="modal-buttons">
      <button class="modal-btn modal-btn-cancel">Cancel</button>
      <button class="modal-btn modal-btn-add">Add</button>
    </div>
  `

  overlay.appendChild(modal)
  dom.body.appendChild(overlay)

  const input = modal.querySelector('.modal-input')
  const cancelBtn = modal.querySelector('.modal-btn-cancel')
  const addBtn = modal.querySelector('.modal-btn-add')

  input.focus()

  const close = () => {
    overlay.remove()
  }

  overlay.onclick = (e) => {
    if (e.target === overlay) close()
  }

  cancelBtn.onclick = close

  addBtn.onclick = () => {
    const uri = input.value.trim()
    if (uri) {
      addChat(uri)
      activeUri = uri
      renderChatList()
      if (onSelectCallback) {
        onSelectCallback(uri)
      }
      close()
    }
  }

  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      addBtn.click()
    } else if (e.key === 'Escape') {
      close()
    }
  }
}

// Discover chats from Type Index
async function discoverChats(webId, context) {
  const store = context.session.store
  const $rdf = store.rdflib || globalThis.$rdf
  if (!$rdf || !webId) return []

  const discovered = []

  try {
    // Load profile
    const profile = $rdf.sym(webId)
    await store.fetcher.load(profile.doc())

    const ns = $rdf.Namespace
    const SOLID = ns('http://www.w3.org/ns/solid/terms#')
    const MEETING = ns('http://www.w3.org/ns/pim/meeting#')

    // Get type indexes
    const publicIndex = store.any(profile, SOLID('publicTypeIndex'))
    const privateIndex = store.any(profile, SOLID('privateTypeIndex'))

    const indexes = [publicIndex, privateIndex].filter(Boolean)

    for (const indexUri of indexes) {
      try {
        await store.fetcher.load(indexUri)

        // Find LongChat registrations
        const registrations = store.statementsMatching(null, SOLID('forClass'), MEETING('LongChat'), indexUri.doc())

        for (const reg of registrations) {
          const instance = store.any(reg.subject, SOLID('instance'))
          if (instance) {
            discovered.push(instance.value)
          }
        }
      } catch (e) {
        console.warn('Failed to load type index:', indexUri?.value, e)
      }
    }
  } catch (e) {
    console.warn('Failed to discover chats:', e)
  }

  return discovered
}

// Main pane definition
export const chatListPane = {
  name: 'chat-list',

  render: function(context, options = {}) {
    const dom = context.dom
    contextRef = context
    onSelectCallback = options.onSelectChat

    // Load saved chats
    loadChatList()

    // Inject styles
    injectStyles(dom)

    // Container
    const container = dom.createElement('div')
    container.className = 'chat-list-pane'

    // Header
    const header = dom.createElement('div')
    header.className = 'sidebar-header'

    const title = dom.createElement('div')
    title.className = 'sidebar-title'
    title.textContent = 'Chats'

    const addBtn = dom.createElement('button')
    addBtn.className = 'add-chat-btn'
    addBtn.textContent = '+'
    addBtn.title = 'Add chat'
    addBtn.onclick = () => showAddModal(dom)

    header.appendChild(title)
    header.appendChild(addBtn)

    // Chat list
    listContainer = dom.createElement('div')
    listContainer.className = 'chat-list'

    // Footer with discover button
    const footer = dom.createElement('div')
    footer.className = 'sidebar-footer'

    const discoverBtn = dom.createElement('button')
    discoverBtn.className = 'discover-btn'
    discoverBtn.innerHTML = '🔍 Discover Chats'

    discoverBtn.onclick = async () => {
      const webId = context.session?.webId || options.webId
      if (!webId) {
        alert('Please login first to discover chats from your pod.')
        return
      }

      discoverBtn.disabled = true
      discoverBtn.textContent = 'Discovering...'

      try {
        const discovered = await discoverChats(webId, context)
        if (discovered.length > 0) {
          discovered.forEach(uri => addChat(uri))
          alert(`Found ${discovered.length} chat(s)!`)
        } else {
          alert('No chats found in your Type Index.')
        }
      } catch (e) {
        console.error('Discovery failed:', e)
        alert('Discovery failed. Check console for details.')
      }

      discoverBtn.disabled = false
      discoverBtn.innerHTML = '🔍 Discover Chats'
    }

    footer.appendChild(discoverBtn)

    // Assemble
    container.appendChild(header)
    container.appendChild(listContainer)
    container.appendChild(footer)

    // Initial render
    renderChatList()

    return container
  },

  // Public API
  addChat,
  removeChat,
  updateChatPreview,
  setActiveChat: (uri) => {
    activeUri = uri
    renderChatList()
  }
}

// Export for use in index.html
export { addChat, removeChat, updateChatPreview }
