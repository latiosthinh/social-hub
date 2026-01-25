# UI/UX Design Instructions

## 1. Design Philosophy
**Goal**: Create a premium, control-center feel that empowers the user to manage multiple identities from a single point.
- **Aesthetic**: "Command Center" vibe. Dark mode default with high contrast accents.
- **Visual Style**: Glassmorphism (frosted glass) for panels to allow background gradients to bleed through subtly.
- **Interactions**: Immediate feedback. Toggles should snap instantly; cards should lift on hover.

## 2. Layout Structure
**Dashboard Layout (Desktop)**:
- **Left Sidebar**: Navigation (Dashboard, Accounts, History, Settings) & User Profile (Logout).
- **Main View (Scrollable)**:
    1.  **Header**: "Broadcast Control" - welcome message and quick stats.
    2.  **Account Grid**: A horizontal row or grid of "Account Cards".
    3.  **Composer Module**: A central, prominent input area.
    4.  **Live Feed**: A timeline of recent delivery activities.

**Mobile Layout**:
- Stacked layout: Header -> Accounts (Horizontal Scroll) -> Composer -> Feed.
- Sidebar becomes a Bottom Navigation Bar.

## 3. Key Components

### A. Account "Power" Cards
*The core control mechanism for the app.*
- **Visual**: Card styled (rounded corners, soft border).
- **Content**:
    - **Top Left**: Large Platform Icon (Facebook/TikTok/LinkedIn branding colors).
    - **Top Right**: Connection Status Dot (Green = Connected, Red = Token Expired).
    - **Center**: Display Name (e.g., "John's Business Page").
    - **Bottom**: **The Toggle**. This is the most important element.
        - **Label**: "Active" / "Paused".
        - **Interaction**: Toggling this ON instantly includes this account in the next broadcast. Toggling OFF excludes it.
- **Add Button**: A "New Connection" card with a generic "Link Account" button (+).

### B. "One-Shot" Composer
*A unified interface to create content for all active platforms.*
- **Text Area**: Large, distraction-free input. "What do you want to broadcast today?".
    - *Smart Feature*: Character count progress bars for each *active* platform (e.g., if TikTok is active, warn if text > limit).
- **Media Dropzone**: Drag & drop area for images/videos.
    - Show thumbnail previews with remove (X) buttons.
- **The "Broadcast" Button**:
    - **Label**: "Broadcast" or "Publish to [N] Accounts".
    - **Behavior**: Clicking this *saves* the content and triggers the event-driven distribution. It does NOT post directly; it queues the work.
    - **Feedback**: Changes state to "Queued" or "Broadcasting..." immediately.

### C. Activity Stream (The Log)
*Real-time visibility into the background workers.*
- **List Item**: Each row represents a piece of content created.
- **Columns/Details**:
    - **Content Snippet**: Truncated text / thumbnail.
    - **Time**: "Just now", "2h ago".
    - **Platform Status Matrix**:
        - Small icons for each target platform.
        - **Color Coding**:
            - **Gray**: Pending/Queued.
            - **Blue**: Processing/Uploading.
            - **Green**: Published (Tick).
            - **Red**: Failed (Exclamation).
- **Expansion**: Click a row to see detailed logs (e.g., "Facebook: Error 500").
- **Actions**: "Retry" button visible only on failed items.

## 4. Specific Interactions & States
- **Token Expiry**: If an account's token is expired (from 401 response), the Card should turn semi-transparent or red-tinted, and the Toggle should be disabled. A "Reconnect" button should overlay.
- **Uploading**: When hitting Broadcast, show a global progress bar or toast notification ("Uploading media...").
- **Success Animations**: When a post succeeds in the Activity Stream, the status icon should pulse green briefly.

## 5. Color Palette Recommendation
- **Background**: Deep Charcoal (`#121212`) or Midnight Blue (`#0f172a`).
- **Cards**: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(10px)`.
- **Accents**:
    - **Primary Action**: Electric Blue (`#3b82f6`) or Neon Purple (`#8b5cf6`).
    - **Facebook**: `#1877F2`
    - **TikTok**: Gradient Black/Red/Teal.
    - **LinkedIn**: `#0A66C2`
    - **Success**: Emerald Green (`#10b981`).
    - **Error**: Rose Red (`#f43f5e`).
