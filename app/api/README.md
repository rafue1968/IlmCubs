# Quran Companion API

Next.js App Router API routes that proxy data from [Quran.com API v4](https://api.quran.com/api/v4) and expose a simpler interface for chapters, verses, juz lookup, search, and merged chapter content with translation and tafsir.

## Features

- REST-style endpoints under `http://localhost:3000/api`
- Built with Next.js 16 App Router route handlers
- TypeScript route implementations
- Uses native `fetch` with no extra HTTP client
- Consistent top-level response shape: `success` + `data`
- Input validation for required query params
- Graceful error handling for upstream failures
- Combined `/api/quran` endpoint that merges Arabic text, translation, and tafsir

## Tech Stack

- Node.js
- Next.js 16
- TypeScript
- React 19
- Native `fetch`
- Quran.com API v4

## Getting Started

### Prerequisites

- Node.js 18.18+ or newer
- npm

### Installation

```bash
git clone <your-repo-url>
cd Quran-Companion-Real-Life-Guidance
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
QURAN_API_BASE_URL=https://api.quran.com/api/v4
```

### Run Locally

```bash
npm run dev
```

Base URL:

```text
http://localhost:3000/api
```

## Response Format

Successful responses:

```json
{
  "success": true,
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "error": "failed to fetch data from Quran API"
}
```

## API Usage

### GET `/api/chapters`

Returns all Quran chapters.

```bash
curl "http://localhost:3000/api/chapters"
```

Example response:

```json
{
  "success": true,
  "data": {
    "chapters": [
      {
        "id": 1,
        "name_simple": "Al-Fatihah",
        "name_arabic": "الفاتحة",
        "verses_count": 7
      }
    ]
  }
}
```

### GET `/api/verses?chapter={id}&translations={translation_id}`

Returns verses for a given chapter.

Required query params:

- `chapter`

Optional query params:

- `translations` default: `131`

```bash
curl "http://localhost:3000/api/verses?chapter=2"
curl "http://localhost:3000/api/verses?chapter=2&translations=131"
```

Example response:

```json
{
  "success": true,
  "data": {
    "verses": [
      {
        "id": 8,
        "verse_number": 1,
        "verse_key": "2:1"
      }
    ],
    "pagination": {
      "per_page": 10,
      "current_page": 1,
      "next_page": 2,
      "total_pages": 29,
      "total_records": 286
    }
  }
}
```

### GET `/api/verse?key={chapter:verse}&translations={translation_id}`

Returns a single verse by verse key.

Required query params:

- `key`

Optional query params:

- `translations` default: `131`

```bash
curl "http://localhost:3000/api/verse?key=2:255"
curl "http://localhost:3000/api/verse?key=2:255&translations=131"
```

Example response:

```json
{
  "success": true,
  "data": {
    "verse": {
      "id": 262,
      "verse_number": 255,
      "verse_key": "2:255",
      "page_number": 42,
      "juz_number": 3
    }
  }
}
```

### GET `/api/juz?number={id}`

Returns a juz by number.

Required query params:

- `number`

```bash
curl "http://localhost:3000/api/juz?number=1"
```

Example response:

```json
{
  "success": true,
  "data": {
    "juz": {
      "id": 1,
      "juz_number": 1,
      "first_verse_id": 1,
      "last_verse_id": 148,
      "verses_count": 148
    }
  }
}
```

### GET `/api/search?q={query}`

Searches Quran verses by keyword.

Required query params:

- `q`

```bash
curl "http://localhost:3000/api/search?q=patience"
```

Example response:

```json
{
  "success": true,
  "data": {
    "search": {
      "query": "patience",
      "total_results": 195,
      "current_page": 1,
      "results": [
        {
          "verse_key": "70:5",
          "verse_id": 5380,
          "text": "فَٱصْبِرْ صَبْرًا جَمِيلًا"
        }
      ]
    }
  }
}
```

### GET `/api/quran?chapter={id}&translation_id={id}&tafsir_id={id}`

Returns merged chapter data with Arabic text, translation, and tafsir per verse.

Required query params:

- `chapter`

Optional query params:

- `translation_id` default: `131`
- `tafsir_id` default: `169`

Behavior:

- fetches verses and tafsir in parallel with `Promise.all`
- includes Arabic text from Quran.com using `fields=text_uthmani`
- maps translation from the first returned translation entry
- returns `tafsir: null` if a verse has no tafsir entry

```bash
curl "http://localhost:3000/api/quran?chapter=2"
curl "http://localhost:3000/api/quran?chapter=2&translation_id=131&tafsir_id=169"
```

Example response:

```json
{
  "success": true,
  "data": [
    {
      "verse_key": "2:1",
      "arabic": "الم",
      "translation": null,
      "tafsir": null
    },
    {
      "verse_key": "2:2",
      "arabic": "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ",
      "translation": "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
      "tafsir": "Ibn Kathir commentary text..."
    }
  ]
}
```

## Validation and Error Cases

Missing required params return `400` responses.

Examples:

```bash
curl "http://localhost:3000/api/verses"
curl "http://localhost:3000/api/verse"
curl "http://localhost:3000/api/juz"
curl "http://localhost:3000/api/search"
curl "http://localhost:3000/api/quran"
```

Example validation error:

```json
{
  "success": false,
  "error": "chapter required"
}
```

If the upstream Quran.com API fails or the base URL is missing, routes return `500`.

## Example Use Cases

- Build a Quran reader that lists chapters and loads verses on demand
- Power verse lookup by ayah key in a study or memorization tool
- Add juz-based navigation for learning plans
- Add keyword search for topics like patience, gratitude, mercy, or fear
- Build a tafsir reader using the merged `/api/quran` endpoint
- Feed a frontend or AI layer with normalized Quran + translation + tafsir data

## Project Structure

```text
app/
└── api/
    ├── chapters/
    │   └── route.ts
    ├── juz/
    │   └── route.ts
    ├── quran/
    │   └── route.ts
    ├── search/
    │   └── route.ts
    ├── verse/
    │   └── route.ts
    ├── verses/
    │   └── route.ts
    └── README.md
```

- `app/api/chapters/route.ts`: chapter list proxy
- `app/api/verses/route.ts`: chapter verse list proxy
- `app/api/verse/route.ts`: single verse proxy
- `app/api/juz/route.ts`: juz lookup proxy
- `app/api/search/route.ts`: search proxy
- `app/api/quran/route.ts`: merged Arabic + translation + tafsir endpoint
- `app/api/README.md`: API documentation

## Future Improvements

- Add route-level caching and revalidation
- Normalize validation error messages across all endpoints
- Support pagination and page params for chapter verse lists
- Add rate limiting to protect upstream API usage
- Add request logging and observability
- Add test coverage for route handlers
- Add optional auth for private deployments

## Contributing

1. Create a branch for your change.
2. Update or add the relevant route handler.
3. Run linting locally.
4. Test the endpoint with `curl` or your API client.
5. Open a pull request with a short summary.

Lint command:

```bash
npm run lint
```

## License

No license file is currently defined in the repository.
