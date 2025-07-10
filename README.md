# GiGy Task Marketplace

GiGy is a task marketplace platform with a Node.js/Express backend and MongoDB database.

## Features

- User registration and authentication (JWT)
- Gig posting, assignment, and completion
- Applications and reviews
- Real-time chat with Socket.IO
- Profile management and image uploads (Cloudinary)
- REST API endpoints

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/navya2036/GiGy.git
   cd GiGy
   ```

2. **Install dependencies:**
   ```sh
   cd backend
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values, or edit `.env` directly.

4. **Start the backend server:**
   ```sh
   npm run dev
   ```
   The server runs on `http://localhost:5000`.


## Project Structure

```
backend/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js
  .env
forntend/
   public/
   src/
   .env
...
```

## My Frontend Contribution to GiGy Task Marketplace
- Developed responsive user interfaces using React.js, including pages for login, signup, profile, and gig listings.
- Integrated frontend with backend REST APIs for authentication, gig management, and applications using Axios.
- Implemented real-time chat functionality using Socket.IO for seamless user communication.
- Enabled image upload to Cloudinary for user profiles and gig media.
- Ensured smooth UX with form validation, reusable components, and mobile-friendly layouts.

## Notes 

- Uploaded files are stored in `/uploads` (excluded from git).
- For Cloudinary integration, set your credentials in `.env`.
- For any issues, check logs or open an issue.

