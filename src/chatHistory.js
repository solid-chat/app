/**
 * Chat History Management
 * Handles daily chat creation and historical message loading
 */

/**
 * Ensures that a daily chat file exists for today's date
 * Creates year/month/day/chat.ttl structure if needed
 * @param {NamedNode} subject - The chat subject
 * @param {Store} store - RDF store
 * @param {Object} context - Pane context
 * @returns {Promise<NamedNode>} The daily chat document node
 */
export async function ensureDailyChat(subject, store, context) {
  const $rdf = store.rdflib || globalThis.$rdf
  
  // Get the base URL from subject (remove /*.ttl or #this etc)
  let baseUrl = subject.uri
  
  // Remove fragment
  if (baseUrl.includes('#')) {
    baseUrl = baseUrl.split('#')[0]
  }
  
  // Remove trailing .ttl file if present (not just chat.ttl)
  if (baseUrl.endsWith('.ttl')) {
    baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'))
  } else if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 1)
  }
  
  // Generate year/month/day path
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  const dailyPath = `${year}/${month}/${day}`
  const dailyChatUri = `${baseUrl}/${dailyPath}/chat.ttl`
  const dailyChatDoc = $rdf.sym(dailyChatUri)
  
  // Check if daily chat exists
  try {
    await store.fetcher.load(dailyChatDoc)
    console.log('Daily chat exists:', dailyChatUri)
    return dailyChatDoc
  } catch (err) {
    console.log('Daily chat does not exist, creating:', dailyChatUri)
    
    // Get authenticated fetch from store fetcher
    const authFetch = store.fetcher._fetch || window.fetch.bind(window)
    const ns = $rdf.Namespace
    const RDF = ns('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    const DCT = ns('http://purl.org/dc/terms/')
    const MEETING = ns('http://www.w3.org/ns/pim/meeting#')
    const XSD = ns('http://www.w3.org/2001/XMLSchema#')
    
    const dateTime = now.toISOString()
    
    // Generate turtle content for new chat file
    const turtle = `@prefix : <#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix meeting: <http://www.w3.org/ns/pim/meeting#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#this>
    rdf:type meeting:LongChat ;
    dct:title "Chat ${year}-${month}-${day}" ;
    dct:created "${dateTime}"^^xsd:dateTime .
`
    
    // Create folders first (year, year/month, year/month/day)
    const foldersToCreate = [
      `${baseUrl}/${year}/`,
      `${baseUrl}/${year}/${month}/`,
      `${baseUrl}/${year}/${month}/${day}/`
    ]
    
    for (const folderUri of foldersToCreate) {
      try {
        await authFetch(folderUri, {
          method: 'PUT',
          headers: {
            'Content-Type': 'text/turtle',
            'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"'
          },
          body: ''
        })
      } catch (e) {
        // Folder might already exist, continue
        console.log('Folder creation (might already exist):', folderUri)
      }
    }
    
    // Create the chat.ttl file
    const response = await authFetch(dailyChatUri, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/turtle'
      },
      body: turtle
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create daily chat: ${response.status} ${response.statusText}`)
    }
    
    // Load it into the store
    await store.fetcher.load(dailyChatDoc, { force: true })
    
    console.log('Created daily chat:', dailyChatUri)
    return dailyChatDoc
  }
}

/**
 * Get the base URL from a chat subject
 * @param {NamedNode} subject - The chat subject
 * @returns {string} Base URL without fragments or .ttl file
 */
function getChatBaseUrl(subject) {
  let baseUrl = subject.uri
  
  // Remove fragment
  if (baseUrl.includes('#')) {
    baseUrl = baseUrl.split('#')[0]
  }
  
  // Remove trailing .ttl file if present (any .ttl, not just chat.ttl)
  if (baseUrl.endsWith('.ttl')) {
    baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'))
  } else if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 1)
  }
  
  return baseUrl
}

/**
 * Generate daily chat URI for a specific date
 * @param {string} baseUrl - Base chat URL
 * @param {Date} date - Target date
 * @returns {string} Full URI to daily chat.ttl
 */
function getDailyChatUri(baseUrl, date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${baseUrl}/${year}/${month}/${day}/chat.ttl`
}

/**
 * Load messages from a specific date's chat file
 * @param {string} dailyChatUri - URI of the daily chat
 * @param {Store} store - RDF store
 * @param {Object} $rdf - RDF library
 * @returns {Promise<Array>} Array of message objects
 */
async function loadMessagesFromDate(dailyChatUri, store, $rdf) {
  const dailyChatDoc = $rdf.sym(dailyChatUri)
  
  try {
    await store.fetcher.load(dailyChatDoc, { force: true })
  } catch (err) {
    // File doesn't exist for this date
    console.log('No chat file for date:', dailyChatUri)
    return []
  }
  
  const ns = $rdf.Namespace
  const SIOC = ns('http://rdfs.org/sioc/ns#')
  const DC = ns('http://purl.org/dc/elements/1.1/')
  const DCT = ns('http://purl.org/dc/terms/')
  const FOAF = ns('http://xmlns.com/foaf/0.1/')
  const SCHEMA = ns('http://schema.org/')
  
  const contentStatements = store.statementsMatching(null, SIOC('content'), null, dailyChatDoc)
  const messages = []
  
  for (const st of contentStatements) {
    const msgNode = st.subject
    const content = st.object.value
    
    if (!content) continue
    
    const date = store.any(msgNode, DCT('created'), null, dailyChatDoc)?.value ||
                store.any(msgNode, DC('created'), null, dailyChatDoc)?.value ||
                store.any(msgNode, DC('date'), null, dailyChatDoc)?.value
    
    const maker = store.any(msgNode, FOAF('maker'), null, dailyChatDoc) ||
                 store.any(msgNode, DC('author'), null, dailyChatDoc) ||
                 store.any(msgNode, DCT('creator'), null, dailyChatDoc)
    
    let authorName = null
    if (maker) {
      authorName = store.any(maker, FOAF('name'))?.value ||
                  maker.value?.split('//')[1]?.split('.')[0] ||
                  'Unknown'
    }
    
    messages.push({
      uri: msgNode.value,
      content,
      date: date ? new Date(date) : new Date(),
      author: authorName,
      authorUri: maker?.value,
      docUri: dailyChatUri
    })
  }
  
  // Load reactions
  const reactionStatements = store.statementsMatching(null, SCHEMA('about'), null, dailyChatDoc)
  for (const st of reactionStatements) {
    const reactionNode = st.subject
    const aboutMsg = st.object.value
    const emoji = store.any(reactionNode, SCHEMA('name'), null, dailyChatDoc)?.value
    const agent = store.any(reactionNode, SCHEMA('agent'), null, dailyChatDoc)?.value
    
    if (emoji && agent) {
      const msg = messages.find(m => m.uri === aboutMsg)
      if (msg) {
        if (!msg.reactions) msg.reactions = {}
        if (!msg.reactions[emoji]) msg.reactions[emoji] = []
        if (!msg.reactions[emoji].includes(agent)) {
          msg.reactions[emoji].push(agent)
        }
      }
    }
  }
  
  return messages
}

/**
 * Load chat history for previous days (infinite scroll)
 * @param {NamedNode} subject - The chat subject
 * @param {Store} store - RDF store
 * @param {Date} oldestLoadedDate - Oldest date currently loaded
 * @param {number} daysToLoad - Number of previous days to load (default: 7)
 * @returns {Promise<Object>} { messages: Array, oldestDate: Date, hasMore: boolean }
 */
export async function loadPreviousDays(subject, store, oldestLoadedDate, daysToLoad = 7) {
  const $rdf = store.rdflib || globalThis.$rdf
  const baseUrl = getChatBaseUrl(subject)
  
  const allMessages = []
  let currentDate = new Date(oldestLoadedDate)
  currentDate.setDate(currentDate.getDate() - 1) // Start from day before oldest
  
  let daysChecked = 0
  let consecutiveEmptyDays = 0
  const MAX_EMPTY_DAYS = 30 // Stop if we find 30 consecutive empty days
  
  // Load up to daysToLoad days, but stop early if we find too many empty days
  while (daysChecked < daysToLoad * 3 && consecutiveEmptyDays < MAX_EMPTY_DAYS) {
    const dailyChatUri = getDailyChatUri(baseUrl, currentDate)
    const messages = await loadMessagesFromDate(dailyChatUri, store, $rdf)
    
    if (messages.length > 0) {
      allMessages.push(...messages)
      consecutiveEmptyDays = 0
    } else {
      consecutiveEmptyDays++
    }
    
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1)
    daysChecked++
    
    // Stop early if we have enough messages
    if (allMessages.length >= 50) {
      break
    }
  }
  
  // Sort messages by date
  allMessages.sort((a, b) => (a.date || 0) - (b.date || 0))
  
  return {
    messages: allMessages,
    oldestDate: currentDate,
    hasMore: consecutiveEmptyDays < MAX_EMPTY_DAYS
  }
}

/**
 * Load recent chat history (initial load)
 * @param {NamedNode} subject - The chat subject
 * @param {Store} store - RDF store
 * @param {number} daysBack - Number of days to load (default: 7)
 * @returns {Promise<Object>} { messages: Array, oldestDate: Date }
 */
export async function loadRecentHistory(subject, store, daysBack = 7) {
  const $rdf = store.rdflib || globalThis.$rdf
  const baseUrl = getChatBaseUrl(subject)
  
  const allMessages = []
  const today = new Date()
  
  // Load last N days
  for (let i = 0; i < daysBack; i++) {
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() - i)
    
    const dailyChatUri = getDailyChatUri(baseUrl, targetDate)
    const messages = await loadMessagesFromDate(dailyChatUri, store, $rdf)
    
    allMessages.push(...messages)
  }
  
  // Sort by date
  allMessages.sort((a, b) => (a.date || 0) - (b.date || 0))
  
  const oldestDate = new Date(today)
  oldestDate.setDate(today.getDate() - daysBack)
  
  return {
    messages: allMessages,
    oldestDate
  }
}
