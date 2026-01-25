# Flow: Login, link, toggle, and automatic posting

## Legend
- FE: Frontend SPA
- API: Backend REST
- DB: PostgreSQL
- BUS: Event bus/queue
- WK: Posting worker
- PLAT: Platform APIs (Facebook/TikTok/LinkedIn)

## Sequence diagram (Mermaid)

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant FE as Frontend
  participant API as Backend API
  participant DB as Database
  participant BUS as Event Bus
  participant WK as Posting Worker
  participant FB as Facebook API
  participant TT as TikTok API
  participant LI as LinkedIn API

  U->>FE: Open app
  FE->>API: POST /auth/login (credentials/SSO)
  API->>DB: Verify user, create session
  API-->>FE: 200 OK (session/JWT)

  U->>FE: Link Facebook account
  FE->>API: GET /oauth/facebook/authorize
  API-->>U: Redirect to Facebook OAuth
  U->>API: GET /oauth/facebook/callback?code=...
  API->>FB: Exchange code for tokens
  API->>DB: Create SocialAccount (is_active=true)
  API-->>FE: 200 OK (account added)

  U->>FE: Link TikTok + LinkedIn (repeat flow)
  FE->>API: GET /accounts
  API->>DB: Fetch accounts
  API-->>FE: Accounts list with toggles

  U->>FE: Toggle TikTok OFF, LinkedIn ON
  FE->>API: PATCH /accounts/:id/toggle { is_active }
  API->>DB: Update SocialAccount.is_active
  API-->>FE: 200 OK

  U->>FE: Create content (text/media)
  FE->>API: POST /content { body, media_assets }
  API->>DB: Insert Content
  API->>BUS: Publish ContentCreated(content_id, user_id)
  API-->>FE: 201 Created

  loop For each active SocialAccount
    WK->>DB: Fetch active accounts for user
    WK->>DB: Create Delivery (pending)
    alt Platform = Facebook
      WK->>FB: Publish post (adapter)
      FB-->>WK: Success/Failure
    else Platform = TikTok
      WK->>TT: Publish post (adapter)
      TT-->>WK: Success/Failure
    else Platform = LinkedIn
      WK->>LI: Publish post (adapter)
      LI-->>WK: Success/Failure
    end
    WK->>DB: Update Delivery status (+ external_post_id or error)
  end

  FE->>API: GET /content/:id/deliveries
  API->>DB: Read Delivery statuses
  API-->>FE: Per-platform results (success/failed)

