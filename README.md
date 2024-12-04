
# Swarthmore A11yGator

Welcome to the GitHub repository for Swarthmore A11yGator, an innovative platform designed to enhance the accessibility of course materials for Swarthmore College students. Our mission is to provide an inclusive learning environment by offering accessible documents, notes, and materials, catering to the diverse needs of all students.

## Features

- **Accessible Course Materials**: Access a wide range of course materials that have been remediated to meet accessibility standards.
- **Light and Dark Mode**: Customize your viewing preference with light and dark mode options for comfortable reading.
- **Responsive Design**: Enjoy a seamless experience across various devices, ensuring that everyone can access materials anytime, anywhere.
- **AI-Powered Search**: Utilize the advanced search functionality with AI-driven suggestions to find exactly what you need quickly.(Upcoming feature)
- **Profile Customization**: Highlight, save, and keep track of your readings and materials through a personalized profile. (Upcoming feature)

## Tech Stack

- **Frontend**: Next.js for server-side rendering, React for client-side interactivity.
- **Backend**: tRPC for type-safe API routes without schemas or code generation.
- **Authentication**: NextAuth.js for simple and secure authentication.
- **Database**: PostgreSQL for robust data management.
- **Styling**: Tailwind CSS for responsive design and custom themes.
- **Deployment**: Vercel for continuous integration and deployment.

## Quick Start

1. Clone the repo
2. Install dependencies
3. Copy `.env.example` to `.env`
4. Run the database migration

```sh
npx prisma migrate resolve --applied 20240816170427_init
```

You can also run `docker compose up -d` to start the app in a docker container.

**You will need to make sure that the Google Oauth redirect URL is included in your Google console dashboard**
