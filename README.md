# CSS Layout Sandbox & Debugger 🎨🛡️

An interactive, production-ready, single-page web utility designed to eliminate beginner frustration with the CSS Box Model, layout wrapping mechanics, and complex absolute/relative positioning. 

No more guessing why layout containers warp or why absolute elements fly off the screen. This sandbox visually decodes CSS physics in real-time.

🔗 **Live Deployment:** [Launch the App on Google Cloud Run](https://css-layout-sandbox-debugger-676854805066.asia-southeast1.run.app/)

---

## 🚀 Core Features & Educational Modules

### 1. The Visual Box Model (Exploded View)
* **High-Contrast Overlays:** Uses semi-transparent, color-coded layers mirroring official browser developer tools (Blue for Content, Green for Padding, Yellow/Gray for Border, Orange for Margin) to map spatial properties.
* **The Box-Sizing Duel:** Renders a live side-by-side comparison of `content-box` vs. `border-box`. Watch in real-time as increasing padding physically explodes a `content-box` layout while the `border-box` dynamically scales internal boundaries.

### 2. Positioning & Flow Simulator (The "Absolute Vectors" Module)
* **Visual Ancestry Map:** Demonstrates the hierarchical relationship between Grandparent, Parent, and Child elements across `static`, `relative`, and `absolute` states.
* **The Glowing Vector Line:** When an element is switched to `position: absolute`, the application runs JavaScript to compute its closest positioned ancestor and draws a glowing, neon dotted vector line directly to its bounding anchor frame. 

### 3. The "Layout Wrap" Collision Simulator
* **Constraint Boundaries:** Features a fixed 500px container containing multiple inline-block elements.
* **Real-time Collision Warning:** As you slide the width or structural margins past the maximum boundary, the tool animates the precise breakdown millisecond the layout wraps, switching the container frame to alert-red and displaying a clear, mathematical calculation of the collision.

---

## 🛠️ System Architecture & Tech Stack

This utility was deliberately engineered as a lightweight, zero-maintenance, highly responsive single-page application (SPA):

* **Frontend Framework:** Vanilla HTML5 & Javascript (ES6+) for instant, raw DOM manipulation without framework overhead.
* **Styling Engine:** Tailwind CSS (via CDN) utilizing utility-first layout structures and a dark, premium developer aesthetic.
* **Reactivity:** Event-driven state architecture using native JS listeners to bind control-panel inputs directly to live CSS variables.
* **Hosting Pipeline:** Containerized and deployed serverless on **Google Cloud Run**, keeping infrastructure costs at absolute zero while scaling dynamically.

---

## 🗺️ Product Roadmap (Future Scope)

While this MVP covers the core foundational breakdown points of layout physics, future versions aim to tackle:
- [ ] **Modern Layout Engines:** Deep dive sandboxes for CSS Flexbox alignment physics and CSS Grid structural layouts.
- [ ] **Responsive Web Design:** Interactive viewport scalers demonstrating `px` vs. `rem`/`em` and fluid viewport units (`vw`/`vh`).
- [ ] **The Cascade & Specificity:** A visual selector weight calculator mapping out inheritance conflicts (.class vs #id).

---

## 📄 License

This project is open-source and free to use for students, instructors, and developers alike. Built with 💻, JavaScript, and a lot of past frontend frustration!