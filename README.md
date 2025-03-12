# Swarthmore A11yGator

## Welcome

Swarthmore A11yGator is an innovative platform aimed at enhancing the accessibility of course materials for Swarthmore College students. This platform ensures an inclusive learning environment by providing remediated and accessible documents, notes, and other course materials to meet the diverse needs of students.

## Features

- **Accessible Course Materials:** Access a variety of course documents, all remediated to comply with accessibility standards.  
- **Light and Dark Mode:** Enjoy a user-friendly interface with customizable viewing preferences.  
- **Responsive Design:** Seamlessly access materials on any device, from mobile phones to desktops.  
- **AI-Powered Search:** Quickly find what you need using advanced AI-driven search functionality. *(Upcoming feature)*  
- **Profile Customization:** Highlight and save readings, and personalize your material library. *(Upcoming feature)*

## Tech Stack

- **Frontend:**  
  - Next.js for server-side rendering.  
  - React for dynamic client-side functionality.  
- **Backend:**  
  - tRPC for type-safe API routes without schema duplication.  
  - Prisma ORM for seamless database interaction.  
- **Database:** PostgreSQL for reliable and efficient data storage.  
- **Authentication:** NextAuth.js for secure and simple user authentication.  
- **Styling:** Tailwind CSS for a clean, responsive, and accessible design.  
- **Hosting:** Vercel for continuous integration and deployment.  
- **Storage:** AWS S3 for document storage and management.

## Quick Start

1. **Clone the Repository**  

   ```bash
   git clone https://github.com/Swarthmore/a11y-doc-repo.git
   cd a11y-doc-repo
   ```

2. **Install Dependencies**  

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**  
   - Copy the `.env.example` file to `.env` and populate it with the required values.  
   - Ensure you include your Google OAuth redirect URL in your Google Console dashboard.

4. **Run Database Migration**  

   ```bash
   npx prisma migrate deploy 
   ```

5. **Run in Docker** (Optional)  

   Start the app in a Docker container:  

   ```bash
   docker compose up -d
   ```

6. **Start the Development Server**  

   ```bash
   npm run dev
   ```

## Project Goals

Swarthmore A11yGator aims to:  

- Provide a central hub for students to access accessible course materials.  
- Ensure compliance with accessibility standards such as WCAG.  
- Continuously improve functionality and user experience based on user feedback.