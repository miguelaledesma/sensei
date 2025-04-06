# Sensei Client

The client-side application for Sensei, built with Next.js, React, and TypeScript.

## Features

- Modern, responsive UI with Tailwind CSS
- Authentication with JWT tokens
- Protected routes
- Type-safe API client with Axios
- Form handling with React Hook Form
- Form validation with Yup

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check for code quality issues

## Project Structure

```
src/
  ├── app/              # Next.js app directory
  ├── components/       # Reusable React components
  ├── contexts/         # React context providers
  ├── lib/             # Utility functions and API client
  └── types/           # TypeScript type definitions
```

## Development

- The application uses Next.js 14 with the App Router
- Styling is done with Tailwind CSS
- State management is handled with React Context
- Form handling is done with React Hook Form and Yup
- API requests are made with Axios

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.
