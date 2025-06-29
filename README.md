# ✈️ ExitFlight: E-Ticket Generator & Booking Simulator

**ExitFlight is a modern, full-stack (frontend-focused) application built with Next.js 15, designed to simulate the core functionalities of a flight booking system.** It guides users from selecting flights and inputting passenger details to viewing a dynamically generated e-ticket preview.

This project serves as a practical demonstration of building a web application that incorporates a range of modern technologies, including the Next.js App Router, Server & Client Components, advanced client-side data simulation, and a sleek, responsive UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📸 Project Showcase

_(This is the most important section! A common practice is to create a `.github/assets` folder in your repository to store and reference your screenshots.)_

**1. Flight Selection & Simulation**
<br> _A dynamic form where users can select airports, dates, and airlines. The app calculates realistic flight times and distances on the fly._

<!-- ![Flight Selection UI](./.github/assets/flight-selection.png) -->

**2. Multi-Step Passenger Details Form**
<br> _A clean, validated form using React Hook Form and Zod for capturing passenger information._

<!-- ![Passenger Details Form](./.github/assets/passenger-details-form.png) -->

**3. Generated E-Ticket Preview**
<br> _A final, polished preview of the mock boarding pass with all simulated details._

<!-- ![Sample E-Ticket Preview](./.github/assets/ticket-preview.png) -->

---

## ✨ Key Features

- **✈️ Dynamic Flight Simulation:**
  - Select origin and destination from a comprehensive list of major world airports.
  - The application dynamically calculates estimated flight details using **geographical coordinates** and timezone data.
  - Generates realistic flight durations, local departure/arrival times, and timezone differences using `date-fns` and `date-fns-tz`.

- **🖥️ Modern UI/UX with Next.js 15:**
  - Built on the **Next.js App Router**, leveraging both Server Components for static content and Client Components for interactivity.
  - Clean, responsive, and intuitive UI built with **React 19**.
  - Leverages a custom component library built with **Shadcn/UI** and styled with **Tailwind CSS v4**.
  - A multi-step progress stepper guides users smoothly through the booking flow.

- **📝 Robust Form Handling:**
  - Multi-step forms managed with **React Hook Form**.
  - End-to-end type-safe validation using **Zod** schemas.
  - State is managed across the user journey with **React Context**.
  - Form details persist across browser sessions via `localStorage` for an improved user experience.

- **⚙️ Component-Based Architecture:**
  - Highly modular and reusable components organized for clarity and maintainability.
  - Utilizes **Geist** for clean, modern typography and **Lucide React** for icons.

---

## 🛠️ Tech Stack

| Category               | Technology / Library                                                   |
| :--------------------- | :--------------------------------------------------------------------- |
| **Framework**          | `Next.js 15` (App Router), `React 19`, `TypeScript`                    |
| **UI Components**      | `shadcn/ui`, `Radix UI`                                                |
| **Styling**            | `Tailwind CSS v4`, `clsx`, `tailwind-merge`                            |
| **State Management**   | `React Context` (for global state), `React Hook Form` (for form state) |
| **Forms & Validation** | `React Hook Form`, `Zod` (for schema validation)                       |
| **Date & Time**        | `date-fns`, `date-fns-tz` (for timezone-aware calculations)            |
| **Icons & Fonts**      | `Lucide React`, `Geist Font`                                           |
| **Dev Tools**          | `ESLint`, `Prettier`, `Turbopack`                                      |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18.x or later recommended)
- npm, yarn, or pnpm

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/ExitFlight.git
    cd ExitFlight
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server (with Turbopack):**
    ```bash
    npm run dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📖 Usage

1.  From the home page, click "Create Your Ticket" to begin.
2.  Use the form on the "Select Flight" page to define your flight details.
3.  Click **"Preview Ticket"** to see a summary of the simulated flight.
4.  Click **"Continue to Passenger Details"**, fill in the required information, and submit.
5.  You will be redirected to the final confirmation page, where you can view your generated mock ticket.

---

## 🔮 Future Enhancements

This project is a solid foundation. Future development could include:

- **Backend API:** Implement a backend using Next.js Route Handlers to manage data.
- **Database Integration:** Connect to a database like PostgreSQL using an ORM (e.g., Drizzle, Prisma) to persist bookings.
- **Dynamic PDF Generation:** Use a library like `pdfkit` on the server to generate downloadable PDF e-tickets.
- **Email Confirmations:** Integrate an email service (e.g., Nodemailer, Resend) to send booking confirmations with the PDF attached.
- **User Accounts:** Add authentication to allow users to save and view their booking history.
