# Messetool - Fair Contact Notes

A mobile-friendly web app for capturing and organizing contact information at trade shows and fairs.

## Features

- 🎤 **Voice Input** - Speak data and it gets transcribed automatically
- 📸 **Photo Upload** - Attach multiple photos to each contact
- 📊 **Sortable List** - Sort by any field (name, company, date, etc.)
- 📥 **Excel Export** - Download all contacts as an Excel file
- 💾 **Cloud Storage** - All data synced to Firebase in real-time
- 📱 **Mobile Responsive** - Works great on phones and tablets

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Name it (e.g., "Messetool")
4. Accept the terms and create
5. Skip Google Analytics for now
6. In the project, go to **Build → Firestore Database**
   - Click "Create Database"
   - Start in **production mode**
   - Choose a location (closest to you)
   - Click "Enable"
7. **Skip Storage setup** (photos are stored as Base64 in Firestore — no billing needed!)
8. Go to **Project Settings** (gear icon at top)
   - Under "Your apps", click the web icon `</>`
   - Register an app (name it "Messetool Web")
   - Copy the Firebase config

### 3. Set Up Environment Variables

1. Copy `.env.example` to `.env.local`
2. Paste your Firebase config values:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Update Firebase Security Rules

Since this is for personal use only, update your Firestore rules:

**Firestore Rules:**
1. Go to **Firestore Database → Rules**
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Publish

(Storage rules not needed — photos are stored directly in Firestore as Base64)

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project" and import your repository
4. Add environment variables:
   - Add your Firebase config values
5. Deploy

## Usage

### Adding Contacts

1. Click the **+** button in the top right
2. Choose:
   - **🎤 Speak** - Record your voice (it transcribes automatically)
   - **📸 Add Photo** - Upload photo first, then fill in details

### Editing Contacts

1. Click any contact row or the **Edit** button
2. You can:
   - Edit any field
   - Use the 🎤 mic button next to text fields for voice input
   - Add/remove photos

### Sorting

Click any column header to sort by that field. Click again to reverse order.

### Exporting

Click **📥 Export Excel** to download all contacts as an Excel file.

## Browser Compatibility

- Chrome/Edge: Full support (including voice input)
- Safari: Supported (voice input may vary)
- Firefox: Supported (voice input may vary)
- Mobile browsers: Full support

## Troubleshooting

### Voice input not working?
- Make sure you're using HTTPS (or localhost)
- Chrome works best
- Check microphone permissions

### Photos not uploading?
- Check Firebase Storage quota (free tier: 5GB)
- Verify Storage rules are set correctly

### Can't see data?
- Make sure Firestore rules are set to allow reads
- Check browser console for errors

## Tech Stack

- React 18
- Vite
- Firebase (Firestore only — photos stored as Base64)
- Tailwind CSS
- Web Speech API (for voice transcription)
- XLSX (for Excel export)

## Storage & Costs

- **Zero billing required** — uses Spark plan (free tier)
- Photos stored as Base64 in Firestore (1GB free tier)
- No Firebase Storage setup needed
