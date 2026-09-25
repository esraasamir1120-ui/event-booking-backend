# Event Booking Backend

A RESTful backend API for an event booking platform built with **Node.js, Express.js, and MongoDB**.

The API supports user authentication, email OTP verification, role-based authorization, event management, and event booking.

## Features

- User registration and login
- Email OTP verification
- JWT-based authentication
- Role-based authorization (User / Admin)
- Create, update, delete, and retrieve events
- Filter events by category and location
- Event booking with OTP verification
- Booking confirmation
- Booking cancellation
- Payment status management
- Automatic available-seat management
- MongoDB database integration
- Email sending using Nodemailer

## Technologies

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT (JSON Web Token)**
- **bcryptjs**
- **Nodemailer**
- **dotenv**
- **CORS**
- **Postman** for API testing

## Project Structure

```text
server/
│
├── controllers/
│   ├── authcontroller.js
│   ├── bookingcontroller.js
│   └── eventcontroller.js
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── OTP.js
│   ├── booking.js
│   ├── event.js
│   └── user.js
│
├── routes/
│   ├── auth.js
│   ├── booking.js
│   └── event.js
│
├── utils/
│   └── email.js
│
├── postman/
│   └── Events API.postman_collection.json
│
├── index.js
├── dbseeds.js
├── package.json
├── package-lock.json
├── .env.example
└── .gitignore
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | Verify email using OTP |

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get an event by ID |
| POST | `/api/events` | Create an event (Admin) |
| PUT | `/api/events/:id` | Update an event (Admin) |
| DELETE | `/api/events/:id` | Delete an event (Admin) |

Events can also be filtered using query parameters:

```text
GET /api/events?category=Technology
GET /api/events?location=Tech%20Hub
```

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings/send-otp` | Send booking OTP |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my` | Get the current user's bookings |
| PUT | `/api/bookings/:id/confirm` | Confirm a booking (Admin) |
| DELETE | `/api/bookings/:id` | Cancel a booking |

## Authentication

Protected endpoints require a JWT access token.

Add the token to the request headers:

```text
Authorization: Bearer <your_token>
```

The API uses role-based authorization for admin-only operations such as creating, updating, and deleting events, and confirming bookings.

## Booking Flow

The booking process works as follows:

1. The authenticated user requests a booking OTP.
2. The OTP is sent to the user's email.
3. The user submits the OTP together with the event ID.
4. A booking is created with `pending` status.
5. An admin confirms the booking and sets the payment status.
6. The event's available seats are updated automatically.
7. The user can view their bookings.
8. The user can cancel a booking.
9. If a confirmed booking is cancelled, the available seat is returned to the event.

## Postman Collection

A Postman collection is included in the `postman` folder for testing the API endpoints.

Import `Events API.postman_collection.json` into Postman and make sure the server is running before sending requests.

## Environment Variables

Create a `.env` file in the project root based on `.env.example`.

```env
port=5000
mongo_url=your_mongodb_connection_string
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
jwt_secret=your_jwt_secret
```

**Do not commit your `.env` file to GitHub.**

## Installation

Clone the repository:

```bash
git clone https://github.com/esraasamir1120-ui/event-booking-backend.git
```

Navigate to the project:

```bash
cd event-booking-backend
```

Install dependencies:

```bash
npm install
```

Create your `.env` file using `.env.example` and add your environment variables.

Start the development server:

```bash
npm run dev
```

The server will run on:

```text
http://localhost:5000
```

## Database Seeding

The project includes a seed script for creating sample users.

Run:

```bash
node dbseeds.js
```

## Testing

The API was tested using **Postman**.

The tested functionality includes:

- Authentication
- OTP verification
- Event CRUD operations
- Event filtering
- Booking creation
- Booking confirmation
- Booking cancellation
- Available-seat updates
- Role-based authorization

## Author

**Esraa Samir**

GitHub: [esraasamir1120-ui](https://github.com/esraasamir1120-ui)