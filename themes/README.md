# Solid Chat Theming System

## Overview

Solid Chat uses a CSS-only runtime theme switching system. Themes are standalone CSS files that completely define the app's appearance. Users can switch themes without page reload, and their preference is saved to localStorage.

## How It Works

### Theme Loading

1. `index.html` contains a `<link id="theme-css">` element in the `<head>`
2. JavaScript in `index.html` manages theme loading:
   ```javascript
   const THEMES = {
     wave: { name: 'Wave', file: 'themes/wave.css' },
     solid: { name: 'Solid', file: 'themes/solid.css' }
   }

   function loadTheme(themeName) {
     const theme = THEMES[themeName] || THEMES.solid
     document.getElementById('theme-css').href = theme.file
     localStorage.setItem('solidchat-theme', themeName)
   }
   ```
3. On page load, `initTheme()` reads from localStorage (default: 'solid')
4. A `<select id="themeSelect">` dropdown in the header allows runtime switching

### Theme File Structure

Each theme CSS file must define:

1. **CSS Custom Properties** (`:root` and component-specific)
2. **Complete styling** for all app elements (themes are self-contained)
3. **Pane overrides** to cascade into dynamically-loaded chat components

## Key CSS Selectors

### App Structure
- `.app-wrapper` - Root container (100vh)
- `.app-banner` - Top header bar with branding
- `.app-container` - Main content area (sidebar + chat)
- `.left-panel` - Sidebar with chat list
- `.right-panel` - Chat area
- `.content-header` - Login/toolbar area (positioned in banner)

### Pane Components (loaded dynamically)
These components inject their own `<style>` elements, so themes must override with higher specificity:

- `.long-chat-pane` - Chat message pane
  - `.chat-header` - Chat room header
  - `.messages-container` - Message list area
  - `.message-bubble` - Individual messages
  - `.send-btn` - Send button

- `.chat-list-pane` - Sidebar chat list
  - `.sidebar-header` - "Chats" header
  - `.chat-item` - Individual chat entries
  - `.chat-item-avatar` - User avatars

### Overriding Pane Styles

Panes use CSS custom properties that can be overridden:

```css
.long-chat-pane {
  --gradient-start: #667eea;
  --gradient-end: #9f7aea;
  --bg-chat: #f7f8fc;
  --bg-message-in: #ffffff;
  --bg-message-out: #e8e4f4;
  --text: #2d3748;
  --text-secondary: #4a5568;
  --accent: #805ad5;
}

.chat-list-pane {
  --gradient-start: #667eea;
  --gradient-end: #9f7aea;
  --bg: #ffffff;
  --bg-hover: #f7f8fc;
  --bg-active: #ede9fe;
  --text: #2d3748;
}
```

For elements not controlled by variables, use direct selectors:
```css
.long-chat-pane .chat-header {
  background: linear-gradient(135deg, #128c7e 0%, #075e54 100%);
}
```

## Creating a New Theme

1. Copy an existing theme file (e.g., `solid.css`)
2. Update the color scheme in `:root` variables
3. Update pane variable overrides (`.long-chat-pane`, `.chat-list-pane`)
4. Add direct style overrides for elements needing specific treatment
5. Register the theme in `index.html`:
   ```javascript
   const THEMES = {
     wave: { name: 'Wave', file: 'themes/wave.css' },
     solid: { name: 'Solid', file: 'themes/solid.css' },
     yourtheme: { name: 'Your Theme', file: 'themes/yourtheme.css' }
   }
   ```
6. Add an option to the theme selector dropdown

## Current Themes

### Solid (default)
- Purple gradient aesthetic
- Clean, modern look
- Full-width layout

### Wave
- WhatsApp-inspired teal/green colors
- Similar layout to Solid for consistency
- Green message bubbles for sent messages

### Telegram
- Telegram-inspired blue color scheme (#0088cc)
- Light, airy aesthetic
- Light green sent message bubbles
- Subtle dot pattern background

### Signal
- Signal-inspired blue (#3A76F0)
- Clean, minimal, privacy-focused aesthetic
- Blue sent message bubbles with white text
- Pure white chat background

## Tips

- Both themes hide `.panel-header` and `.status-badge` for cleaner UI
- The `.content-header` is absolutely positioned into the banner area
- Themes should be self-contained - don't rely on base styles from index.html
- Test theme switching in both directions to ensure no style leakage
