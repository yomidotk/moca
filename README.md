# 🖼️ Moca — Beautiful Device Mockups

> Drop any screenshot → instantly wrap it in a stunning Phone, Tablet, or Laptop frame with custom backgrounds, shadows, text overlays, and 3D tilt — then download a high-resolution PNG. No login. No upload. No server.

![Moca](https://img.shields.io/badge/Moca-Device_Mockups-6366f1?style=for-the-badge&logo=image&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## ✨ What is Moca?

Moca turns any screenshot into a **polished product mockup image** — the kind used in App Store listings, social media posts, and marketing sites.

- Drop a **portrait, landscape, or square** screenshot
- The device frame **auto-sizes to fit** your image's exact aspect ratio
- Pick a **Phone**, **Tablet**, or **Laptop** frame (incompatible devices are locked with a tooltip explaining why)
- Choose a **Silver or Black** finish for the device shell
- Set the **background** — solid colour, 10 curated gradients, a custom image, or transparent (PNG with alpha)
- Add a **text overlay** (headline + subtitle) with font and colour pickers
- Control **device scale, 3D tilt, padding,** and **shadow** style
- Hit **Download PNG** — a 2× high-resolution PNG is generated entirely in the browser

**Zero server. Zero upload. Zero subscription. Everything runs client-side.**

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

> **Production build:**
> ```bash
> npm run build
> ```
> Output goes to `./dist`. Deploy that folder anywhere (see [Deployment](#-deployment)).

---

## 🏗️ How It Works — Under the Hood

### 1. Screenshot Upload & Aspect-Ratio Detection (`src/App.tsx`)

When you drop an image, Moca reads its natural dimensions via a hidden `<img>` element and computes the `width / height` ratio. This ratio drives **all subsequent layout decisions** — the device frame is never a fixed size; it sizes itself around your screenshot.

```
Dropped file
  → FileReader → data URL
  → Image.naturalWidth / naturalHeight
  → aspectRatio stored in AppState
  → getCompatibleDevices(ratio) — which device types are valid?
  → getBestDevice(ratio)        — auto-switch if current device can't display it
```

### 2. Device Compatibility Rules (`src/constants.ts`)

Three device types support different aspect ratio ranges:

| Device | Accepts | Example |
|--------|---------|---------|
| **Phone** | ratio ≤ 0.75 | iPhone tall (0.46), 9:16 (0.56) |
| **Tablet** | ratio ≥ 0.50 | iPad portrait (0.75), iPad landscape (1.33) |
| **Laptop** | ratio ≥ 1.20 | MacBook (1.60), 16:9 (1.78) |

Tablet and Laptop are **never mutually exclusive** — a rotated tablet screenshot is indistinguishable from a laptop screenshot, so the user can always choose between them. Only Phone locks out when an image is clearly too wide.

### 3. SVG-free Device Frames (`src/components/DeviceFrames.tsx`)

All three device frames are built with **pure CSS `div` elements** — no SVG or image assets. They scale proportionally using a `scale` multiplier and the screenshot's aspect ratio:

```
screenW (fixed per device type, e.g. 290px for phone)
screenH = Math.round(screenW / aspectRatio)
deviceW = screenW + (shellPad + bezelPad) × 2
deviceH = screenH + (shellPad + bezelPad) × 2
```

Each frame renders:
- **Outer aluminium shell** — metallic CSS gradient (Silver or Black)
- **Side buttons** — positioned proportionally to device height
- **Dark bezel** — inner black inset
- **Screen area** — absolutely positioned, exact pixel fit for the screenshot
- **Camera cutout** — Dynamic Island notch or punch-hole circle (phone only)
- **Glare overlay** — subtle `rgba` gradient for realism

The **Laptop frame** also renders a hinge and keyboard tray below the lid.

### 4. Canvas / Mockup Composition (`src/components/MockupCanvas.tsx`)

`MockupCanvas` is the div that gets captured as the final PNG. It:

1. Applies the chosen **background** (solid / gradient / custom image / transparent) via inline CSS
2. Optionally renders a **text overlay** (`<h1>` title + `<p>` subtitle) above the device
3. Wraps the device frame in a 3D transform container:
   ```css
   transform: rotateY({tilt}deg) rotateX({|tilt| * 0.15}deg) rotateZ({-tilt * 0.05}deg);
   transform-style: preserve-3d;
   perspective: 1500px;
   ```
4. Shadow is computed as a `box-shadow` string passed into the frame component

### 5. Export Pipeline (`src/App.tsx` — `handleExport`)

Export uses **[html-to-image](https://github.com/bubkoo/html-to-image)** — a library that walks the DOM, clones it into an SVG `foreignObject`, and rasterises it to a `<canvas>`:

```
canvasRef.current (the MockupCanvas div)
  → toPng({ pixelRatio: 2, cacheBust: true })   ← 2× resolution
  → data URL
  → hidden <a download="moca-{timestamp}.png"> click
  → PNG saved to user's downloads folder
```

Transparent exports are detected by checking the element's computed `background` style — if transparent, `backgroundColor: 'rgba(0,0,0,0)'` is passed to override html-to-image's default white fill.

### 6. Workspace Zoom Controls (`src/App.tsx`)

The canvas is rendered at full 1:1 pixel size internally; the **workspace zoom** scales it visually using the CSS `zoom` property (not `transform: scale`, to preserve layout flow):

- **Ctrl + scroll wheel** → zoom in/out (±10% steps)
- **Ctrl + = / Ctrl + −** → keyboard zoom
- **Ctrl + 0** → reset to 100%
- **Floating zoom pill** (bottom-right) → quick presets: 50% / 75% / 100%

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **React 19** + Vite 8 | Latest React features, fast HMR |
| Language | **TypeScript 6** | End-to-end type safety |
| Styling | **TailwindCSS v4** + CSS variables | Utility classes + custom design tokens |
| Drag & Drop | **react-dropzone** | Accessible file drop with drag state |
| Canvas Export | **html-to-image** | DOM → PNG with 2× pixel ratio, transparent support |
| Animations | **framer-motion** | Smooth UI micro-animations |
| IDs | **uuid** | Stable keys for gradient/device lists |
| Icons | **lucide-react** | Consistent SVG icon set |

---

## 📁 Project Structure

```
moca/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions → GitHub Pages CI/CD
├── public/
│   ├── favicon.ico
│   └── logo.png                # Moca logo (used in sidebar header)
├── src/
│   ├── components/
│   │   ├── DeviceFrames.tsx    # PhoneFrame, TabletFrame, LaptopFrame — pure CSS, no SVG
│   │   ├── DropZone.tsx        # Drag-and-drop + click-to-browse upload area (full + compact)
│   │   ├── MockupCanvas.tsx    # The exportable div: background + text overlay + 3D device
│   │   └── Sidebar.tsx         # All controls: device, bg, layout, shadow, text, export btn
│   ├── constants.ts            # GRADIENTS, FONTS, getCompatibleDevices, getBestDevice
│   ├── types.ts                # AppState, DeviceType, BgType, ShadowType, TextOverlay, etc.
│   ├── App.tsx                 # Root: state, aspect-ratio detection, zoom, export handler
│   ├── index.css               # CSS variables (design tokens), global resets, range sliders
│   └── main.tsx                # React entry point
├── index.html                  # HTML shell — Inter + Montserrat fonts, SEO meta tags
├── vite.config.ts              # /moca/ base path, TailwindCSS Vite plugin
├── tailwind.config.ts          # TailwindCSS v4 config
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── eslint.config.js
```

---

## ⚙️ Configuration Reference

### Device Frames

| Setting | Options | Default |
|---------|---------|---------|
| Device Type | `phone` / `tablet` / `laptop` | `phone` |
| Frame Color | `silver` / `black` | `silver` |
| Camera Style | `notch` (Dynamic Island) / `punchhole` | `punchhole` |

### Background

| Type | Description |
|------|-------------|
| **Solid** | Single hex colour via colour picker |
| **Gradient** | 10 built-in presets (Aurora, Sunset, Ocean, Midnight, Neon, Golden, Emerald, Space, Rose, Violet) |
| **Image** | Upload any image as the canvas background |
| **Transparent** | No background — exports as PNG with alpha channel |

### Canvas Layout

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Device Size | 30% – 100% | 100% | Scale of the device frame |
| Device Tilt | −30° – +30° | 0° | 3D Y-axis rotation (perspective) |
| Padding | 16 – 160 px | 40 px | Canvas edge padding |

### Shadow

| Style | Description |
|-------|-------------|
| **None** | No shadow |
| **Soft** | Diffuse multi-layer shadow (default) |
| **Hard** | Sharp offset shadow (print/graphic style) |

### Text Overlays

Optional headline and subtitle above the device — each with independent font family and colour.

---

## 🌐 Deployment

### GitHub Pages (automated — included in this repo)

Push to `main` — the [deploy.yml](.github/workflows/deploy.yml) workflow runs `npm run build` and publishes `./dist` to the `gh-pages` branch automatically.

The Vite `base` is set to `/moca/` in `vite.config.ts`, so all asset URLs are correct on GitHub Pages out of the box.

### Other Hosts

Moca is a **pure static site** — any CDN, object storage, or web host works. No special headers required (unlike WebCodecs apps).

**Vercel** — zero config, just connect the repo.

**Netlify** — zero config, just connect the repo.

**Any HTTP server** — serve the `dist/` folder.

> ⚠️ If you change the deploy host and remove the `/moca/` base path, update `base` in `vite.config.ts` to `/` or your new subpath.

---

## 🔍 Key Design Decisions

### Why pure-CSS device frames instead of SVG/images?

- No external assets to load or maintain
- Frames scale perfectly at any resolution (no pixelation)
- Silver/Black theming is a single object swap (`DEVICE_COLORS`)
- The 3D tilt `transform` works identically on CSS divs

### Why html-to-image instead of Canvas API?

- The mockup layout uses CSS features (gradients, border-radius, shadows, transforms) that would be complex to replicate manually on `<canvas>`
- html-to-image handles font embedding, image inlining, and cross-origin assets automatically
- 2× `pixelRatio` gives retina-quality output with no extra code

### Why aspect-ratio-driven sizing?

Locking the frame to a fixed height would distort screenshots. Instead, the **screen width is fixed** per device type and the **screen height is derived** from the uploaded image's ratio — so the screenshot always fills the frame pixel-perfectly with no letter-boxing or cropping.

---

## 📄 License

MIT — free to use, modify, fork, and deploy.

---

*Built with React 19, TailwindCSS v4, html-to-image, and a lot of CSS math.*
