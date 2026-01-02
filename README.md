# Our Church BRP

A Bible reading plan application.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Get a free API key from [Scripture API](https://scripture.api.bible)
   - Update `.env` with your API key:
     ```
     VITE_BIBLE_API_KEY=your_actual_api_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_BIBLE_API_KEY` - Required for fetching Bible passages from Scripture API
