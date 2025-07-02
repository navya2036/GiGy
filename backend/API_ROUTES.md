# GiGy Backend API Routes

## User Routes (`/api/users`)
- `POST   /api/users` — Register a new user
- `POST   /api/users/login` — Login and get JWT token
- `GET    /api/users/profile` — Get current user's profile (auth required)
- `PUT    /api/users/profile` — Update current user's profile (auth required)
- `POST   /api/users/profile/picture` — Upload profile picture (auth required)
- `GET    /api/users/:id` — Get user by ID

## Gig Routes (`/api/gigs`)
- `GET    /api/gigs` — Get all gigs (with filters)
- `GET    /api/gigs/:id` — Get gig by ID
- `POST   /api/gigs` — Create a new gig (auth required)
- `PUT    /api/gigs/:id` — Update a gig (auth required)
- `DELETE /api/gigs/:id` — Delete a gig (auth required)
- `GET    /api/gigs/user/mygigs` — Get gigs posted by current user (auth required)
- `GET    /api/gigs/user/myassignments` — Get gigs assigned to current user (auth required)
- `PUT    /api/gigs/:id/complete` — Mark a gig as completed (auth required)

## Application Routes (`/api/applications`)
- `POST   /api/applications` — Apply for a gig (auth required)
- `GET    /api/applications/gig/:gigId` — Get applications for a gig (auth required)
- `GET    /api/applications/myapplications` — Get applications submitted by current user (auth required)
- `PUT    /api/applications/:id/accept` — Accept an application (auth required)
- `PUT    /api/applications/:id/reject` — Reject an application (auth required)

## Review Routes (`/api/reviews`)
- `POST   /api/reviews` — Create a review (auth required)
- `GET    /api/reviews/gig/:gigId` — Get reviews for a gig
- `GET    /api/reviews/user/:userId` — Get reviews for a user

## Chat Routes (`/api/chats`)
- `POST   /api/chats/messages` — Send a message (auth required)
- `GET    /api/chats/messages/:userId` — Get messages between users (auth required)
- `GET    /api/chats/conversations` — Get all conversations for current user (auth required)

---
- All routes under `/api` are RESTful and return JSON.
- Routes marked "auth required" require a valid JWT in the `Authorization` header.
