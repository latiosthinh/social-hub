# Webapp plan: Master account controlling multi-platform posting

## Overview
A webapp where a single master account controls linked social media accounts (Facebook, TikTok, LinkedIn). Users can link multiple accounts per platform, toggle each account active/inactive, and any content created in the app is automatically distributed to all active accounts—no submit button. Distribution is event-driven and resilient.

---

## System architecture

### High-level components
- **Frontend (SPA: React/Vue/Angular)**
  - Master login/logout
  - Linked accounts list with per-account **Active** toggle
  - Content creation UI (composer, media upload)
  - Activity log and per-platform status
- **Backend API (Node.js/Express, NestJS, or Django/FastAPI)**
  - OAuth flows for Facebook, TikTok, LinkedIn
  - Token storage and refresh
  - Unified posting service with platform adapters
  - Event bus integration for async distribution
- **Database (PostgreSQL)**
  - Users, SocialAccounts, Content, Deliveries, AuditLogs
- **Queue/Event bus**
  - Kafka/RabbitMQ/SQS for fan-out posting and retries
- **Object storage**
  - S3/GCS/Azure Blob for media assets
- **Secrets manager**
  - KMS/HashiCorp Vault for encrypting tokens and credentials

### Architecture diagram (textual)
- Frontend → Backend REST
- Backend → OAuth providers (FB/TikTok/LinkedIn)
- Backend → DB (PostgreSQL)
- Backend → Storage (S3)
- Backend → Event bus (publish ContentCreated)
- Workers (Posting Service) → Platform APIs via adapters
- Workers → DB (Deliveries, AuditLogs)

---

## Data model (database schema)

### Users
- **id** (PK, UUID)
- **email** (unique)
- **password_hash** (if using email/password; or null if SSO-only)
- **created_at**, **updated_at**

### SocialAccounts
- **id** (PK, UUID)
- **user_id** (FK → Users.id)
- **platform** (enum: facebook, tiktok, linkedin)
- **external_account_id** (string)
- **display_name** (string)
- **is_active** (boolean, default true)
- **access_token_enc** (text, encrypted at rest)
- **refresh_token_enc** (text, encrypted at rest, nullable)
- **token_expires_at** (timestamp, nullable)
- **scopes** (text/json)
- **status** (enum: valid, expired, revoked, error)
- **created_at**, **updated_at**
- Indexes: (user_id, platform), (platform, external_account_id)

### Content
- **id** (PK, UUID)
- **user_id** (FK → Users.id)
- **title** (string, optional)
- **body** (text/JSON for rich content)
- **media_assets** (JSON array of storage keys/URLs)
- **visibility** (enum: public, private, scheduled)
- **scheduled_at** (timestamp, nullable)
- **created_at**, **updated_at**

### Deliveries
- **id** (PK, UUID)
- **content_id** (FK → Content.id)
- **social_account_id** (FK → SocialAccounts.id)
- **platform** (enum)
- **status** (enum: pending, success, failed, retried, canceled)
- **attempts** (int)
- **last_error** (text, nullable)
- **external_post_id** (string, nullable)
- **created_at**, **updated_at**
- Indexes: (content_id, social_account_id), (status)

### AuditLogs
- **id** (PK, UUID)
- **user_id** (FK → Users.id)
- **action** (string: login, logout, link_account, toggle_account, create_content, post_success, post_failed)
- **metadata** (JSON)
- **created_at**

---

## Backend endpoints

### Auth
- **POST /auth/login**
  - Body: { email, password } or SSO token
  - Returns: session/JWT
- **POST /auth/logout**
  - Invalidates session

### Account linking
- **GET /oauth/:platform/authorize**
  - Redirect to provider OAuth
- **GET /oauth/:platform/callback**
  - Exchanges code → tokens, creates SocialAccount
- **GET /accounts**
  - Returns list of linked accounts with status/toggle
- **PATCH /accounts/:id/toggle**
  - Body: { is_active: boolean }
- **DELETE /accounts/:id**
  - Unlink account and revoke tokens (best-effort)

### Content & distribution
- **POST /content**
  - Body: { title?, body, media_assets?[], visibility?, scheduled_at? }
  - Behavior: creates Content, publishes `ContentCreated` event
- **GET /content/:id/deliveries**
  - Returns per-platform delivery statuses
- **GET /deliveries?content_id=...**
  - Filtered delivery list

### Admin/maintenance (optional)
- **POST /accounts/:id/refresh**
  - Force token refresh
- **GET /health**
  - Service health and queue lag

---

## Posting pipeline

1. **Content creation** triggers `ContentCreated` event.
2. **Selector** service queries all SocialAccounts for the user where `is_active = true` and `status = valid`.
3. For each active account, create a **Delivery** record with `status = pending`.
4. **Posting workers** consume deliveries:
   - Fetch content and media assets.
   - Use **platform adapter**:
     - Facebook: Graph API (e.g., `/me/feed`, `/photos`, `/videos`)
     - TikTok: Publishing API (video upload + metadata)
     - LinkedIn: UGC Posts (`/ugcPosts`) or Shares (`/shares`)
   - Map content to platform-specific constraints (length, media types).
   - Upload media to platform if required.
   - Update Delivery: `success` with `external_post_id`, or `failed` with `last_error`.
5. **Retry policy**:
   - Exponential backoff (e.g., 3–5 attempts).
   - Idempotency keys per content/account pair.
6. **Activity log** updated from Delivery outcomes.

---

## Security considerations

- **Token protection**
  - Encrypt tokens at rest (AES-256 via KMS).
  - Rotate encryption keys periodically.
  - Store minimal scopes; revoke on unlink.
- **Session security**
  - Short-lived JWT + refresh token; HTTP-only, Secure cookies.
  - CSRF protection for state-changing endpoints.
- **OAuth best practices**
  - PKCE for public clients.
  - Maintain `state` parameter to prevent CSRF.
- **Access control**
  - RBAC: user can only manage their own SocialAccounts/Content.
- **Rate limiting & abuse prevention**
  - Per-user and per-platform rate limits.
  - Queue-based fan-out to avoid thundering herd.
- **Compliance**
  - Follow platform terms; store only necessary data.
  - Audit logs for traceability.

---

## User flow (functional)

1. **Master login**
   - User logs into the app; session established.
2. **Link accounts**
   - User initiates OAuth for Facebook/TikTok/LinkedIn.
   - On callback, SocialAccount created; appears in list with toggle ON by default (configurable).
3. **Toggle control**
   - User sets per-account **Active** toggle ON/OFF.
4. **Create content**
   - User writes content or uploads media in the app.
   - Saving content triggers automatic distribution to all **Active** accounts.
5. **Observe outcomes**
   - Activity log shows per-platform success/failure.
   - User can retry failed deliveries or adjust content/toggles.

---

## Non-functional requirements

- **Performance**
  - Sub-200ms for core API responses; posting is async.
- **Scalability**
  - Horizontal scaling of workers; partition by user or platform.
- **Reliability**
  - Exactly-once semantics via idempotency keys.
  - Dead-letter queue for persistent failures.
- **Observability**
  - Structured logs, metrics (success rate, queue lag), tracing.
- **Maintainability**
  - Clear adapter interfaces; add new platforms with minimal changes.

---

## Platform adapter interface (example)

```ts
interface PlatformAdapter {
  validateContent(content: Content): ValidationResult;
  uploadMedia?(assets: MediaAsset[]): Promise<PlatformMediaRefs>;
  publish(content: Content, account: SocialAccount, media?: PlatformMediaRefs): Promise<PublishResult>;
  refreshToken?(account: SocialAccount): Promise<void>;
}
