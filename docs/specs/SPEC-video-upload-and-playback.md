# Feature Specification: Video Upload, Preview & Playback Reliability

## 1. Problem Statement
When a user uploads a video file (e.g., MP4 or WebM) from their PC to create a post, the newly published post in the feed displays a broken video container with the browser error:
> *"No video with supported format and MIME type found."*

### Root Causes
1. **Premature Blob URL Revocation:** In `PostComposer.tsx`, `handleSubmit()` called `handleRemoveMedia()`, which revoked the local `blob:` URL immediately after creating the post. Since HTML5 `<video>` fetches video chunks asynchronously, revoking the URL destroyed the media in memory, rendering it unplayable.
2. **Missing Video Error Boundary:** `PostMediaViewer.tsx` lacked an `onError` handler, leaving the browser's native broken icon if a video failed to load or an unsupported format was provided.
3. **Container / Codec Mismatches:** HTML5 `<video>` natively supports MP4 (H.264), WebM, and Ogg. Containers like `.mkv` and `.avi` cannot be played natively in web browsers without transcoding or direct external playback.

## 2. Objectives & Scope
- **Guaranteed Playback for Uploaded Videos:** Ensure local video files attached via `PostComposer` remain valid and playable upon publishing in the feed.
- **Graceful Error Recovery:** Provide an Astryx dark mode fallback card when a video fails to play (unsupported codec, missing codec, or broken network link).
- **Proactive Format Guidance:** Inform users during selection if an `.mkv` or `.avi` container is attached, recommending MP4 or WebM.
- **Strict Design System Compliance:** 100% Meta Astryx (`@astryxdesign/core`) tokens and layout components.

## 3. Technical Design

### A. Composer Lifecycle Fix (`PostComposer.tsx`)
- On `handleSubmit()`:
  - Do NOT call `handleRemoveMedia()` (which revokes object URLs).
  - Clear the composer state directly (`setText('')`, `setMediaUrl('')`, `setMediaType('IMAGE')`, clear file input value).
- `handleRemoveMedia()`:
  - Retained exclusively for the user-initiated "Remove" button in the composer preview, or when replacing an active preview with a new file.

### B. File Picker Format Guidance (`PostComposer.tsx`)
- Set `accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime,video/*"`.
- If a user attaches an `.mkv`, `.avi`, or `.wmv` file, display an Astryx warning badge:
  `"Notice: .mkv/.avi containers are not supported by web browsers. Please use MP4 or WebM for playback."`

### C. Video Playback & Fallback Component (`PostMediaViewer.tsx`)
- Detect video type by `type === 'VIDEO'` or video URL pattern (`.mp4`, `.webm`, `.ogg`, `blob:`, `data:video/`).
- Attach `onError={() => setHasError(true)}` to `<video>`.
- When `hasError` is true, render an Astryx Card:
  - Icon: `VideoCameraSlashIcon`
  - Heading / Text: "Video Playback Unavailable"
  - Subtitle: "Web browsers natively support MP4 (H.264/AAC) and WebM formats."
  - Action button: "Open Video Source" (`window.open(mediaUrl, '_blank')`).

## 4. Verification Plan
- Unit & Component checks:
  - Ensure video posts retain active blob URLs on submit.
  - Test video player rendering with test video streams (e.g. `BigBuckBunny.mp4`).
  - Verify error boundary triggers gracefully on broken video sources.
- Quality Gates:
  - `npx tsc -b` passes without type errors.
  - Existing suite verified.
