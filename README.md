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

### Development Model
**Agile Model**: The project uses Agile methodology to allow for constant feedback and flexibility to meet user needs.

## Project Structure

```
CRE8/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── mentorController.js
│   │   ├── bookingController.js
│   │   ├── messageController.js
│   │   ├── resourceController.js
│   │   └── adminController.js
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   └── error.js          # Error handler
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Mentor.js
│   │   ├── Mentee.js
│   │   ├── Admin.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Message.js
│   │   ├── Resource.js
│   │   └── Session.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── mentors.js
│   │   ├── bookings.js
│   │   ├── messages.js
│   │   ├── resources.js
│   │   └── admin.js
│   ├── utils/                # Utility functions
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   ├── .env.example          # Environment variables template
│   ├── server.js             # Server entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── MentorCard.js
│   │   ├── context/          # React Context
│   │   │   └── AuthContext.js
│   │   ├── pages/            # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Mentors.js
│   │   │   ├── MentorProfile.js
│   │   │   └── Bookings.js
│   │   ├── services/         # API service functions
│   │   │   ├── authService.js
│   │   │   ├── mentorService.js
│   │   │   ├── bookingService.js
│   │   │   └── messageService.js
│   │   ├── App.js            # Main App component
│   │   ├── index.js          # Entry point
│   │   └── index.css         # Global styles
│   └── package.json
│
└── package.json              # Root package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cre8
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Running Both Concurrently

From the root directory:
```bash
npm run install-all  # Install all dependencies
npm run dev          # Run both frontend and backend
```

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

- Payment gateway integration (Stripe, PayPal, Mobile Money)
- Real-time messaging with Socket.io
- Video session integration (Zoom, Google Meet)
- Mobile app (React Native)
- Multi-language support (French, Swahili)
- Advanced analytics and reporting
- Automated mentor matching algorithm
- Course marketplace
- Community forums

## Contributing

This project was developed as part of a formative assignment at African Leadership University.

## License

MIT

## Author

**Diakite Muheto Mohamed**  
African Leadership University  
January 2026

## References

- African Development Bank. (2023). African economic outlook 2023: Mobilizing private sector financing for climate and green growth in Africa.
- UNESCO. (2022). Re|Shaping policies for creativity: Addressing culture as a global public good.

## Support

For issues and questions, please create an issue in the repository.
