# Intent: Direct Messaging & Chat Feature

## Confirmed Statement of Intent
- **Outcome:** Add a responsive 1-on-1 direct messaging feature in the social media web app where clicking "Messages" in the left sidebar opens a contact search, active conversation list, and interactive chat interface in the center column.
- **User:** Authenticated social platform users communicating 1-on-1 with other members.
- **Why now:** Implement direct messaging capability per `feature_message_add.md`.
- **Success:** User clicks "Messages" in left rail; searches or selects a contact; views a Threads-style profile header in the thread; sends and receives text, emojis, animated GIFs, and media attachments rendered in Astryx chat bubbles; layout adapts cleanly to Android mobile screens.
- **Constraint:** Strictly use Astryx Design System (`@astryxdesign/core/Chat`) and Astryx icons only; responsive desktop/mobile; frontend only.
- **Out of scope:** Real backend WebSocket/server-side DB persistence, the three-dot context menu from the screenshot, and Threads-specific marketing copy.
