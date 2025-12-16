# Darkstone.cat - Board Games & RPG Association

Welcome to the official repository for the **Darkstone Catalunya** website. This project serves as the digital portal for our non-profit association, dedicated to promoting board games, role-playing games (RPGs), and the use of the Catalan language in the hobby.

## 🚀 About the Project

This website is designed to provide information about who we are, what we do, where to find us, and how to join. It is built with a modern tech stack to ensure performance, accessibility, and an excellent user experience.

### Key Features
- **Modern Landing Page**: A clean, responsive design showcasing our activities and location.
- **Multilingual Support**: Fully localized in **Catalan** (default), **Spanish**, and **English**.
- **Interactive Elements**: Smooth scrolling, Google Maps integration, and dynamic navigation.

## 🛠️ Tech Stack

This project is initialized with the [T3 Stack](https://create.t3.gg/) and utilizes the following technologies:

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (v4)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Deployment**: Vercel (recommended)

## 📂 Project Structure

```
├── src/
│   ├── app/           # Next.js App Router pages (localized)
│   ├── components/    # Reusable UI components (NavBar, Hero, etc.)
│   ├── i18n/          # Internationalization configuration
│   ├── messages/      # Translation files (en.json, es.json, ca.json)
│   └── styles/        # Global styles and Tailwind configuration
├── public/            # Static assets (images, logos)
└── ...
```

## 🏁 Getting Started

To run this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/darkstone-cat.git
   cd darkstone-cat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

