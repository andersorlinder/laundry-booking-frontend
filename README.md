# Laundry Booking System - Frontend

A modern web application for managing laundry room bookings in apartment buildings. Residents can easily book and manage their laundry time slots using their apartment number and PIN.

## Features

### Existing

- **Secure Authentication**: Login with apartment number and PIN
- **Visual Booking Calendar**: View available time slots for the next 28 days
- **Easy Booking Management**: Book and cancel laundry slots with a single click
- **Real-time Availability**: See which slots are available, booked by you, or taken by others
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Swedish Localization**: Complete Swedish language interface

### Coming

- **Reminder through emails**

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Context API** - State management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd laundry-booking-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The application connects to the laundry booking API. Configure the API URL in your `.env` file:
```bash
VITE_API_URL=https://laundry-booking-api.onrender.com/api
```

### Authentication

**Login Endpoint**: `POST /auth/login`

Request body:
```json
{
  "apartmentNumber": "A10231",
  "pin": "1234"
}
```

Response:
```json
{
  "userId": 1,
  "forename": "John",
  "token": "jwt-token",
  "apartmentNumber": "A10231"
}
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LaundryRulesAccordion.tsx
│   ├── ProtectedRoute.tsx
│   └── TimeSlotTable.tsx
├── context/            # React Context providers
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── BookingPage.tsx
│   └── LoginPage.tsx
├── services/           # API services
│   └── bookingService.ts
├── App.tsx             # Main app component
└── main.tsx           # Entry point
```

## Demo Credentials

For testing purposes, use any of these credentials:

- **Lägenhet**: A10231, **PIN**: 1234
- **Lägenhet**: A10232, **PIN**: 5678
- **Lägenhet**: A10233, **PIN**: 9012

## License

This project is private and proprietary.
