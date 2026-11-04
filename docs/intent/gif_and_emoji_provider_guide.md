# Architecture Guide: Full GIF & Emoji Provider Integration

This guide details the end-to-end integration architecture for connecting production GIF search (Google Tenor v2 / Giphy) and full Unicode emoji sets into the Social Media Content Analysis System.

---

## 1. GIF Provider Integration Architecture

### Recommended Provider: Google Tenor v2 REST API
- **Endpoint:** `https://tenor.googleapis.com/v2/`
- **Authentication:** API Key passed via query param `?key=${TENOR_API_KEY}`.

### Architecture Topology: Backend Gateway Proxy vs Direct Client Fetch

```
┌─────────────────────────────────┐
│     Client (PostMediaToolbar)   │
└──────────────┬──────────────────┘
               │ GET /v1/media/gifs/search?q=happy
               ▼
┌─────────────────────────────────┐
│   Spring Boot Media Gateway     │  <-- Keeps Tenor API key private & secure
│   (Caches trending GIFs in RAM) │
└──────────────┬──────────────────┘
               │ Tenor v2 REST API (HTTPS)
               ▼
┌─────────────────────────────────┐
│     Google Tenor Cloud CDN      │
└─────────────────────────────────┘
```

#### Why Backend Proxy is Best Practice:
1. **API Key Security:** Prevents leaking the Tenor/Giphy API secret into client-side JS bundles.
2. **Server-Side Caching:** Trending GIFs rarely change intra-hour; Spring Boot can cache `featured` responses for 30 minutes, saving rate-limit quotas.
3. **CORS & Response Normalization:** Formats varied response payloads into a stable UI contract:
   ```typescript
   interface GifItem {
     id: string;
     title: string;
     previewUrl: string; // tinygif format for fast picker grid loading
     mediaUrl: string;   // gif or mp4 format for post attachment
   }
   ```

### Client Wiring in `PostMediaToolbar.tsx`:
1. Add debounced search state:
   ```typescript
   const [searchQuery, setSearchQuery] = useState('');
   const debouncedQuery = useDebounce(searchQuery, 300);
   ```
2. When picker opens, default to `/v1/media/gifs/featured`. When `debouncedQuery` has text, call `/v1/media/gifs/search?q=${debouncedQuery}`.
3. On GIF selection:
   ```typescript
   onSelectGif(gif.mediaUrl);
   ```
   In `PostCreateModal.tsx`, `mediaUrl` is set and previewed in `PostMediaViewer.tsx`.

---

## 2. Emoji Provider Integration Architecture

### Recommended Implementation: Client-Side Unicode Dataset (`@emoji-mart/react`)

Emojis in modern social media platforms (Threads, X, Bluesky) do NOT require external API calls or backend storage because standard Unicode characters (Unicode 15.0) are natively rendered by operating system glyph engines (Apple Color Emoji, Noto Color Emoji, Segoe UI Emoji).

### Integration Steps:
1. **Install Library:**
   ```bash
   npm install @emoji-mart/react @emoji-mart/data
   ```
2. **Component Integration:**
   Replace the curated array in `PostMediaToolbar.tsx` with `<Picker>`:
   ```tsx
   import data from '@emoji-mart/data';
   import Picker from '@emoji-mart/react';

   {activePicker === 'emoji' && (
     <div data-testid="emoji-picker-popover" style={{ width: '100%' }}>
       <Picker
         data={data}
         onEmojiSelect={(emoji: any) => {
           onSelectEmoji(emoji.native); // e.g. "🔥"
           setActivePicker('none');
         }}
         theme={document.documentElement.getAttribute('data-theme') || 'dark'}
         previewPosition="none"
         skinTonePosition="search"
         style={{ width: '100%' }}
       />
     </div>
   )}
   ```
3. **Storage & Database:**
   - The string is saved into MongoDB as UTF-8 (`utf8mb4` compatible).
   - Emojis automatically participate in hashtag detection, full-text indexing, and sentiment analysis telemetry.

---

## 3. Summary & Roadmap

| Feature | Phase Current (refine_3_ui) | Phase Next (Full Provider Integration) |
|---|---|---|
| **Emoji Scope** | 24 popular reaction emojis across full modal width | Full Unicode 15.0 catalog (1,800+ emojis) with category tabs & search |
| **GIF Scope** | Curated high-res Unsplash reactions across full modal width | Tenor v2 REST API integration with real-time keyword search |
| **Backend Load** | 0 requests (instant client response) | Cached proxy endpoint `/v1/media/gifs/search` |
