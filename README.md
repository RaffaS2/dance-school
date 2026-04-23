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