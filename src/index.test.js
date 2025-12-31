import { describe, it, expect, beforeEach } from 'vitest'
import { longChatPane, chatListPane, addChat, removeChat } from './index.js'

describe('solid-chat exports', () => {
  it('exports longChatPane', () => {
    expect(longChatPane).toBeDefined()
    expect(longChatPane.name).toBe('long-chat')
    expect(typeof longChatPane.render).toBe('function')
  })

  it('exports chatListPane', () => {
    expect(chatListPane).toBeDefined()
    expect(chatListPane.name).toBe('chat-list')
    expect(typeof chatListPane.render).toBe('function')
  })

  it('exports addChat and removeChat', () => {
    expect(typeof addChat).toBe('function')
    expect(typeof removeChat).toBe('function')
  })
})

describe('chatListPane', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders a container element', () => {
    const context = { dom: document, session: { store: {} } }
    const options = { onSelectChat: () => {} }
    const element = chatListPane.render(context, options)

    expect(element).toBeInstanceOf(HTMLElement)
    expect(element.className).toBe('chat-list-pane')
  })

  it('includes default global chat', () => {
    const context = { dom: document, session: { store: {} } }
    const options = { onSelectChat: () => {} }
    const element = chatListPane.render(context, options)

    expect(element.textContent).toContain('Solid Chat Global')
  })

  it('addChat persists to localStorage', () => {
    const context = { dom: document, session: { store: {} } }
    chatListPane.render(context, { onSelectChat: () => {} })

    addChat('https://example.com/chat.ttl', 'Test Chat')

    const stored = JSON.parse(localStorage.getItem('solidchat-chats'))
    expect(stored.some(c => c.uri === 'https://example.com/chat.ttl')).toBe(true)
  })

  it('removeChat removes from localStorage', () => {
    const context = { dom: document, session: { store: {} } }
    chatListPane.render(context, { onSelectChat: () => {} })

    addChat('https://example.com/chat.ttl', 'Test Chat')
    removeChat('https://example.com/chat.ttl')

    const stored = JSON.parse(localStorage.getItem('solidchat-chats'))
    expect(stored.some(c => c.uri === 'https://example.com/chat.ttl')).toBe(false)
  })
})

describe('longChatPane', () => {
  it('has label function', () => {
    expect(typeof longChatPane.label).toBe('function')
  })
})
