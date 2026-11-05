# Statement of Intent: Mobile Responsive App Shell & Navigation

## Confirmed Intent
- **Outcome:** Full responsive mobile app shell with natural vertical scrolling, centered top logo, top-right Search and Hamburger actions, a left slide-out drawer (Appearance, Logout), a 5-icon bottom navigation bar (`[Saved, Creator Analytics, + Create Post, Notifications, Profile]`), and single-column center page switching.
- **User:** Mobile and handheld users who currently experience broken scrolling and cluttered multi-column layouts.
- **Why now:** Global `overflow: hidden` on `html` and `body` locks viewport scrolling on mobile devices, and lack of mobile navigation prevents using the application comfortably on screens < 768px.
- **Success:** Touch and wheel scrolling works smoothly on all devices; tapping bottom bar icons swaps the center view (Saved, Analytics, Notifications, Profile, Create Post modal); tapping top-right hamburger slides the left drawer out (showing Appearance & Logout); desktop keeps its full 3-column layout.
- **Constraint:** Strictly Meta Astryx Design System (`@astryxdesign/core`) and Astryx icons only.
- **Out of scope:** Redesigning the desktop 3-column layout, altering backend API endpoints, or native Android/iOS mobile application builds.
