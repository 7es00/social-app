# Social App API — Assignment 19

A full-stack **Node.js + Express + TypeScript** social media backend (Facebook-inspired).

## 🗂 Project Structure
```
src/
├── common/
│   ├── constant/       # App-wide constants
│   ├── enums/          # UserRole, PostPrivacy, ReactionType, etc.
│   ├── interfaces/     # TypeScript interfaces
│   ├── service/        # Cloudinary, Email, FCM services
│   ├── types/          # AuthRequest, ApiResponse, etc.
│   └── utils/          # Helpers: sendResponse, paginate, generateCode
├── config/             # Environment config
├── DB/                 # Mongoose models (User, Post, Comment, Reaction, Request, Notification, Story)
├── middleware/         # auth, validate, upload, error handlers
└── modules/
    ├── auth/           # Register, login, confirm, reset password
    ├── user/           # Profile, cover, friends, dashboard
    ├── post/           # CRUD, news feed, pin, share
    │   └── graphql/    # GraphQL schema + resolvers
    ├── comment/        # CRUD + replies
    ├── request/        # Friend requests, block/unblock, unfriend
    ├── reaction/       # Emoji reactions (like/love/haha/wow/sad/angry)
    ├── notification/   # FCM + full CRUD (admin only creates)
    └── story/          # 24h stories with TTL + cron cleanup
```

## 🚀 Setup
```bash
npm install
cp .env.example .env  # fill in your values
npm run dev           # development
npm run build && npm start  # production
```

## 🌐 API Endpoints

### Auth `/api/v1/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Register with email confirmation |
| POST | /confirm-email | Confirm email with 6-digit code |
| POST | /resend-confirmation | Resend confirmation code |
| POST | /login | Login (returns JWT) |
| POST | /logout | Logout (clears online status) |
| POST | /forgot-password | Send reset code |
| POST | /reset-password | Reset with code |
| PUT | /change-password | Change password (auth) |

### Users `/api/v1/users`
| Method | Route | Description |
|--------|-------|-------------|
| GET | /me | My profile |
| PUT | /me | Update profile |
| PUT | /me/profile-picture | Upload profile pic |
| PUT | /me/cover-picture | Upload cover pic |
| DELETE | /me | Soft delete account (cascades posts/comments) |
| GET | /search?q= | Search users |
| GET | /:userId | User profile |
| GET | /:userId/posts | Profile posts (respects privacy) |
| GET | /:userId/friends | User's friends |
| GET | /:userId/mutual-friends | Mutual friends |
| GET | /admin/dashboard | Dashboard stats (admin) |
| GET | /admin/all | All users (admin) |
| DELETE | /admin/:userId | Hard delete user (admin) |

### Posts `/api/v1/posts`
| Method | Route | Description |
|--------|-------|-------------|
| GET | /feed | News feed (friends + public) |
| POST | / | Create post (with media upload) |
| GET | /:postId | Get post (privacy check) |
| PUT | /:postId | Update post |
| DELETE | /:postId | Soft delete (cascade comments+reactions) |
| DELETE | /:postId/hard | Hard delete (admin) |
| PATCH | /:postId/pin | Pin/unpin post |
| POST | /:postId/share | Share post |

### Comments `/api/v1/posts/:postId/comments`
| Method | Route | Description |
|--------|-------|-------------|
| POST | / | Create comment/reply (parentId optional) |
| GET | / | Get post comments |
| GET | /:commentId/replies | Get replies |
| PUT | /:commentId | Update comment |
| DELETE | /:commentId | Soft delete (cascade replies+reactions) |

### Reactions `/api/v1/reactions`
| Method | Route | Description |
|--------|-------|-------------|
| POST | /post/:postId | React to post (toggle/change) |
| POST | /comment/:commentId | React to comment |
| GET | /post/:postId | Get post reactions + summary |
| GET | /comment/:commentId | Get comment reactions |

> **Reaction types:** `like` 👍 `love` ❤️ `haha` 😂 `wow` 😮 `sad` 😢 `angry` 😠

### Friend Requests `/api/v1/requests`
| Method | Route | Description |
|--------|-------|-------------|
| GET | /pending | Incoming requests |
| GET | /sent | Sent requests |
| POST | /send/:userId | Send friend request |
| PATCH | /:requestId/accept | Accept request |
| PATCH | /:requestId/reject | Reject request |
| DELETE | /:requestId/cancel | Cancel sent request |
| DELETE | /unfriend/:userId | Unfriend |
| POST | /block/:userId | Block user |
| DELETE | /unblock/:userId | Unblock user |

### Notifications `/api/v1/notifications`
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | My notifications |
| PATCH | /:id/read | Mark as read |
| PATCH | /read-all | Mark all as read |
| DELETE | /:id | Delete notification |
| DELETE | /all | Delete all mine |
| POST | /admin | Create notification (admin only) |
| GET | /admin/all | All notifications (admin) |
| PUT | /admin/:id | Update admin notification |
| DELETE | /admin/:id/hard | Hard delete (admin) |

### Stories `/api/v1/stories`
| Method | Route | Description |
|--------|-------|-------------|
| POST | / | Create story (media required) |
| GET | / | Friends' stories (grouped by user) |
| GET | /mine | My active stories |
| PATCH | /:storyId/view | View story |
| GET | /:storyId/viewers | Get viewers (owner only) |
| DELETE | /:storyId | Delete story |

### GraphQL `/graphql`
```graphql
query { getFeed(page: 1, limit: 10) { posts { _id content } total } }
query { getPost(id: "...") { _id content userId { firstName } } }
mutation { createPost(content: "Hello!", privacy: "public") { _id } }
mutation { deletePost(id: "...") }
```

## 🏗️ Key Features

### Soft & Hard Delete with Cascade Hooks
- **User soft delete** → cascades to all user's posts → cascades to all their comments + reactions
- **Post soft delete** → cascades to all comments + removes all reactions
- **Comment soft delete** → cascades to replies + removes reactions
- Hard delete (admin) does full DB cleanup

### News Feed Algorithm
Fetches posts where:
1. User's own posts (all privacy)
2. Friends' posts (public + friends-only)
3. Public posts from everyone

### Profile Posts (Facebook-style)
- Owner sees all their posts
- Friends see `public` + `friends` posts
- Others only see `public` posts
- Pinned posts float to top

### Notifications (FCM)
- Auto-created on: reactions, comments, friend requests/accepts, mentions
- Admin can broadcast to all users or specific users
- Full CRUD (only admin creates)

### Stories (24h Vanish)
- MongoDB TTL index auto-expires documents
- Cron job runs hourly for Cloudinary cleanup
- Grouped by user for stories bar display
- Viewer tracking

## 🔒 Security
- JWT authentication
- bcrypt password hashing (10 rounds)
- Helmet HTTP headers
- CORS configured
- File type validation on uploads
- Rate limiting ready (add express-rate-limit)
