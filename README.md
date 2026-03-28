# Cre8 - Creative Mentorship Platform

Cre8 is a digital mentorship platform connecting emerging African creatives with experienced mentors. The platform enables mentees to find, book, and learn from verified mentors across various creative fields.

## Project Overview

### Mission
To be an African creative leader who transforms lives through narratives, technology, and creativity. Cre8 fosters music development, community building, and empowers emergent talents through impactful creative hubs.

### Problem Statement
The platform addresses the struggle of emerging creatives, students, and entrepreneurs in finding affordable mentorship and learning resources within the African creative industry, particularly in developing markets like Rwanda.

## Features

### For Mentees
- **User Registration & Profile Creation**: Create and manage personal profiles
- **Mentor Discovery**: Search and filter mentors by skills, price, rating, and experience
- **Session Booking**: Book mentorship sessions with integrated calendar
- **Messaging System**: Direct communication with mentors
- **Resource Access**: View and download learning materials
- **Progress Tracking**: Track completed sessions and feedback
- **Rating & Feedback**: Rate mentors after sessions

### For Mentors
- **Profile Management**: Create detailed mentor profiles with skills and experience
- **Availability Management**: Set and manage session availability
- **Session Management**: Accept/reject booking requests
- **Resource Sharing**: Upload documents, videos, and learning materials
- **Messaging**: Communicate with mentees
- **Payment Tracking**: Track sessions and earnings

### For Administrators
- **User Management**: Manage all platform users
- **Mentor Verification**: Verify and approve mentor accounts
- **Analytics Dashboard**: View platform statistics and insights
- **Content Moderation**: Monitor and manage platform content

> **Admin account**: There is no public registration for admins. The server automatically creates a default admin on first startup (`admin@cre8.com` / `Admin@1234`). Change the password after first login.

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Email**: Nodemailer for notifications

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3 with responsive design

## Project Structure

```
CRE8/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── mentorController.js
│   │   ├── menteeController.js (via routes/mentees.js)
│   │   ├── bookingController.js
│   │   ├── courseController.js
│   │   ├── messageController.js
│   │   ├── resourceController.js
│   │   ├── paymentController.js
│   │   ├── walletController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Mentor.js
│   │   ├── Mentee.js
│   │   ├── Admin.js
│   │   ├── Booking.js
│   │   ├── Course.js
│   │   ├── Payment.js
│   │   ├── Message.js
│   │   ├── Resource.js
│   │   ├── Session.js
│   │   └── Withdrawal.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── mentors.js
│   │   ├── mentees.js
│   │   ├── bookings.js
│   │   ├── courses.js
│   │   ├── messages.js
│   │   ├── resources.js
│   │   ├── payments.js
│   │   ├── wallet.js
│   │   ├── upload.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   └── mtnMoMo.js
│   ├── .env.example          # Copy this to .env and fill in your values
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── vite.config.js
│   └── package.json
│
└── package.json
```

## Local Setup Guide

### Prerequisites

Make sure the following are installed on your machine before you begin:

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | v18 or higher | Includes npm |
| [MongoDB](https://www.mongodb.com/try/download/community) | v6+ | Community Edition or use [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud) |
| [Git](https://git-scm.com/) | any | For cloning the repository |

You will also need free accounts on:
- **[Cloudinary](https://cloudinary.com/)** — required for avatar, thumbnail, and video uploads
- **[MTN MoMo Developer](https://momodeveloper.mtn.com/)** *(optional)* — only required if testing payments

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CRE8
```

---

### 2. Install All Dependencies

From the project root, run the convenience script that installs dependencies for the root, backend, and frontend in one step:

```bash
npm run install-all
```

Alternatively, install each manually:

```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### 3. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in the required values:

```env
# Port must match the proxy target in frontend/vite.config.js
PORT=5001

MONGODB_URI=mongodb://localhost:27017/cre8
JWT_SECRET=replace_with_a_strong_secret   # generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CORS — must match the Vite dev server URL
FRONTEND_URL=http://localhost:3000

# Email — booking and session notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Cloudinary — get these from your Cloudinary Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MTN MoMo — run `node provisionMTN.js` after setting subscription keys
MTN_SUBSCRIPTION_KEY=your_collections_subscription_key
MTN_DISBURSEMENTS_SUBSCRIPTION_KEY=your_disbursements_subscription_key
MTN_USER_ID=your_provisioned_user_id
MTN_API_KEY=your_provisioned_api_key
MTN_TARGET_ENVIRONMENT=sandbox
MTN_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_CALLBACK_URL=http://localhost:5001/api/payments/mtn-webhook
```

> **Gmail tip**: Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your real password when 2FA is enabled.

> **MTN MoMo tip**: If you need to test payments, run `node provisionMTN.js` inside the `backend/` folder after filling in the subscription keys to auto-generate `MTN_USER_ID` and `MTN_API_KEY`.

---

### 4. Start MongoDB

If using a **local MongoDB** instance, make sure the `mongod` service is running:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows — start from Services or run:
# "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"
```

If using **MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string (includes username/password).

---

### 5. (Optional) Seed the Database

To populate the database with sample mentor data for development:

```bash
cd backend

# Small seed (basic mentors)
npm run seed:mentors

# Larger seed (expanded mentor profiles)
npm run seed:expanded
```

---

### 6. Run the Application

**Option A — Run both servers together (recommended):**

```bash
# From the project root
npm run dev
```

This uses `concurrently` to start both the backend and frontend simultaneously.

**Option B — Run servers separately:**

```bash
# Terminal 1 — Backend (with auto-reload)
cd backend
npm run dev       # uses nodemon

# Terminal 2 — Frontend
cd frontend
npm run dev       # uses Vite
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001 |
| API Health Check | http://localhost:5001/api/health |

---

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED` on startup | MongoDB is not running — see Step 4 |
| API requests fail in browser | Ensure backend is on port **5001** (the Vite proxy forwards `/api` to `localhost:5001`) |
| File uploads fail | Verify all three Cloudinary env vars are set correctly |
| Emails not sending | Use a Gmail App Password, not your account password |
| `nodemon` not found | Run `npm install` inside the `backend/` directory |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Mentors
- `GET /api/mentors` - Get all mentors (with filters)
- `GET /api/mentors/:id` - Get single mentor
- `PUT /api/mentors/profile` - Update mentor profile
- `GET /api/mentors/:id/availability` - Get mentor availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/feedback` - Add feedback
- `DELETE /api/bookings/:id` - Cancel booking

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get conversation with user
- `PUT /api/messages/read/:userId` - Mark messages as read

### Resources
- `POST /api/resources` - Upload resource
- `GET /api/resources` - Get resources
- `GET /api/resources/mentor/:mentorId` - Get mentor's resources
- `GET /api/resources/:id` - Get single resource
- `DELETE /api/resources/:id` - Delete resource

### Mentees
- `GET /api/mentees/my-courses` - Get enrolled courses
- `PUT /api/mentees/profile` - Update mentee profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `GET /api/courses/mentor/:mentorId` - Get courses by mentor
- `GET /api/courses/mine` - Get mentor's own courses
- `GET /api/courses/:id/content` - Get course content (enrolled users)
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/pay` - Initiate course payment

### Wallet
- `GET /api/wallet` - Get mentor wallet
- `POST /api/wallet/withdraw` - Request withdrawal
- `POST /api/wallet/sync-payments` - Sync pending payments

### Payments
- `POST /api/payments/mtn-webhook` - MTN MoMo webhook
- `GET /api/payments/status/:referenceId` - Poll payment status
- `GET /api/payments/transfer-status/:referenceId` - Poll transfer status

### Upload
- `POST /api/upload/avatar` - Upload profile avatar
- `POST /api/upload/course-thumbnail` - Upload course thumbnail
- `POST /api/upload/course-video` - Upload course video

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/verify-mentor/:id` - Verify mentor
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get platform analytics

## Database Schema

### User Model (Base)
- name, email, password, role, profilePicture, bio, phone, location, isVerified

### Mentor Model (extends User)
- skills, expertise, pricePerSession, rating, totalRatings, experience, availability, completedSessions, certifications, socialLinks

### Mentee Model (extends User)
- interests, goals, skillLevel, education, bookings, completedSessions

### Booking Model
- mentee, mentor, sessionDate, duration, status, topic, notes, meetingLink, payment, feedback

### Message Model
- sender, receiver, content, isRead, booking

### Resource Model
- mentor, title, description, fileUrl, fileType, category, accessLevel, downloads

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Protected routes with role-based access control
- Input validation
- CORS configuration
- Environment variables for sensitive data

## Future Enhancements

- Video session integration (Zoom / Google Meet embed)
- Mobile app (React Native)
- Multi-language support (French, Swahili)
- Advanced analytics and reporting
- Automated mentor matching algorithm
- Community forums

## Contributing

This project was developed as part of a formative assignment at African Leadership University.

## License

MIT

## Author

**Diakite Muheto Mohamed**  
African Leadership University  
January 2026

## Support

For issues and questions, please create an issue in the repository.
