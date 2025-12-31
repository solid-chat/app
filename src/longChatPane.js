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
}

.message-row.sent {
  justify-content: flex-end;
}

.message-row.received {
  justify-content: flex-start;
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

// Get initials from name
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Create message element
function createMessageElement(dom, message, isOwn) {
  const row = dom.createElement('div')
  row.className = `message-row ${isOwn ? 'sent' : 'received'}`

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
  text.textContent = message.content || ''
  bubble.appendChild(text)

  const meta = dom.createElement('div')
  meta.className = 'message-meta'

  const time = dom.createElement('span')
  time.className = 'message-time'
  time.textContent = formatTime(message.date)
  meta.appendChild(time)

  bubble.appendChild(meta)
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
    container.appendChild(header)

    // Messages container
    const messagesContainer = dom.createElement('div')
    messagesContainer.className = 'messages-container'
    container.appendChild(messagesContainer)

    // Input area
    const inputArea = dom.createElement('div')
    inputArea.className = 'input-area'

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

    container.appendChild(inputArea)

    // State
    let messages = []
    let currentUser = null

    // Get current user
    const authn = context.session?.logic?.authn || globalThis.SolidLogic?.authn
    if (authn) {
      currentUser = authn.currentUser()?.value
    }

    // Load messages from store
    async function loadMessages() {
      statusEl.textContent = 'Loading messages...'
      messagesContainer.innerHTML = ''
      messages = []

      try {
        // Define namespaces
        const ns = $rdf.Namespace
        const FLOW = ns('http://www.w3.org/2005/01/wf/flow#')
        const SIOC = ns('http://rdfs.org/sioc/ns#')
        const DC = ns('http://purl.org/dc/elements/1.1/')
        const DCT = ns('http://purl.org/dc/terms/')
        const FOAF = ns('http://xmlns.com/foaf/0.1/')

        // Fetch the document
        const doc = subject.doc ? subject.doc() : subject
        await store.fetcher.load(doc)

        // Get chat title from various predicates
        const title = store.any(null, DCT('title'), null, doc)?.value ||
                     store.any(null, DC('title'), null, doc)?.value
        if (title) {
          nameEl.textContent = title
        }

        // Extract all messages with sioc:content from this document
        const contentStatements = store.statementsMatching(null, SIOC('content'), null, doc)

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

          messages.push({
            uri: msgNode.value,
            content,
            date: date ? new Date(date) : new Date(),
            author: authorName,
            authorUri: maker?.value
          })
        }

        // Sort by date
        messages.sort((a, b) => (a.date || 0) - (b.date || 0))

        // Keep only last 100 messages for performance
        if (messages.length > 100) {
          messages = messages.slice(-100)
        }

        // Render messages
        if (messages.length === 0) {
          const empty = dom.createElement('div')
          empty.className = 'empty-chat'
          empty.innerHTML = '<div class="empty-chat-icon">💬</div><div>No messages yet</div><div>Be the first to say hello!</div>'
          messagesContainer.appendChild(empty)
        } else {
          for (const msg of messages) {
            const isOwn = currentUser && msg.authorUri === currentUser
            const el = createMessageElement(dom, msg, isOwn)
            messagesContainer.appendChild(el)
          }
        }

        statusEl.textContent = `${messages.length} messages`

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight

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

        const el = createMessageElement(dom, msg, true)
        messagesContainer.appendChild(el)
        messagesContainer.scrollTop = messagesContainer.scrollHeight

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

    sendBtn.addEventListener('click', sendMessage)

    // Initial load
    loadMessages()

    return container
  }
}

export default longChatPane
