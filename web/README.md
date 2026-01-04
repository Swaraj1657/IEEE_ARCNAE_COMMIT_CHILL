# CertVerify Web

Next.js + Supabase app for OCR-based certificate verification with a Python FastAPI backend.

## Prerequisites
- Node.js 18+
- Supabase project (URL + anon key)
- Python 3.10+
- Poppler installed and `POPPLER_PATH` configured in `TextExtraction/text.py`
- Google Vision API key set in `TextExtraction/text.py`
- Groq API key set in `TextExtraction/beautifyText.py`

## Environment
Create `./.env.local` and set:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OCR_API_URL=http://localhost:8000/api/verify-certificate
```

## Supabase SQL
Open Supabase SQL editor and run `supabase_schema.sql` from this folder to create:
- `public.user_profiles`
- `public.certificates`
- RLS policies
Create a Storage bucket named `Certificates` (public recommended for simple access).

## Backend (OCR API)
Install Python deps:
```
cd ../TextExtraction
pip install -r requirements.txt
```
Start server:
```
python api_server.py
```
It runs at `http://localhost:8000`.

## Frontend
Install and run:
```
npm install
npm run dev
```
Visit `http://localhost:3000`.

## Flow
1. User signs up → a row is inserted in `user_profiles`.
2. User logs in → navigates to `Dashboard`.
3. Upload certificate → file is stored in Storage bucket `Certificates`.
4. Frontend posts the file to the OCR API → receives `mapped_data`.
5. App inserts `mapped_data` into `public.certificates` (including storage path).
6. Dashboard shows status badges:
   - Green: `VERIFIED` or score ≥ 80
   - Yellow: `PARTIALLY_VERIFIED` or 50–79
   - Red: `FAILED` or <50
7. Recruiter portal shows verified documents to anyone.

## Notes
- Adjust RLS if you need private recruiter access.
- If the bucket is private, replace `getPublicUrl` with a call to `createSignedUrl` in pages to generate signed URLs.
- Ensure CORS on FastAPI allows `http://localhost:3000`.
