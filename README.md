
## Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)

## Project Structure

```
dance-school/
├── frontend/    # Next.js
├── backend/     # Node.js + Express
└── package.json # Root scripts
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RaffaS2/dance-school.git
cd dance-school
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend

# Install backend dependencies
npm install --prefix backend
```

### 3. Environment variables

Create a `.env` file inside the `backend/` folder:

```
DATABASE_URL=your_neon_connection_string
```

### 4. Run the project

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`  
Backend runs on `http://localhost:3001`

---

## Testing

Tests are written with **Jest** and **Supertest** and live inside `backend/__tests__/`.

```
backend/
└── __tests__/
    ├── integration/   # HTTP route tests (route → controller → DB)
    └── unit/          # Isolated logic tests (pure functions)
```

### Available scripts

```bash
# Run all tests once
npm test

# Watch mode — re-runs on file save (recommended during development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Running a specific test file

```bash
npx jest studios      # runs any test file matching "studios"
npx jest coachings    # runs any test file matching "coachings"
```