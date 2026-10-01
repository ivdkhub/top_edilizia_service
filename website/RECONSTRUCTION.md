# Reference reconstruction

This document records the initial reference reconstruction. Company copy and images have since replaced the original pool-business content. See [PERSONALIZATION.md](PERSONALIZATION.md) for the current Top Edilizia Service import and validation; the original prices, claims, testimonials and US contacts below are historical only.

The 12.2-second reference recording (1196 × 744, 30 fps) was inspected across its entire duration, with full-resolution frames every 0.25 seconds. The black presentation surround, recording title, and rounded recording window are outside the actual website and are not reproduced as webpage content. The website viewport inside the recording is approximately 1152 × 648.

## Observed structure and implementation

| Reference time | Section | Implementation |
| --- | --- | --- |
| 0–2.5 s | Pinned cinematic transformation; left-aligned captions change to a right-aligned final caption | Full viewport, GSAP ScrollTrigger pin, continuous progress-controlled video seeking, three observed caption treatments |
| 2.5–3.75 s | Before/after transformation, three engineering guarantees | Real image comparison slider with clipping; native range control supports pointer and keyboard |
| 3.75–4.75 s | Engineering philosophy, four staggered cards | Four-column grid with individually staggered vertical/opacity entrances |
| 5–5.75 s | Studio copy, large image, floating three-number counter panel | Two-column grid, viewport-managed video, animated counters ending at 238+, 17+, 95% |
| 5.75–7.25 s | Portfolio moves horizontally while its heading remains in place | ScrollTrigger-pinned gallery with continuous horizontal translation; native horizontal touch scrolling on mobile |
| 7.25–8.25 s | Investment calculator | Real stateful geometry, size and upgrade controls; observed default $111,000–$126,000 |
| 8.25–9.25 s | Four process tabs and two-column milestone panel | Keyboard-accessible tabs, real panels and videos |
| 9.25–10.5 s | Three homeowner testimonials, category filters, estate specifications | Working filters and disclosure controls |
| 10.5–11.25 s | Consultation panel, layered blue waves, contact card | CSS-composited waves, telephone/email links, consultation action |
| 11.25–12.2 s | Dark four-column footer | Actual navigation, links, and footer content |

## Composition and motion

- Fixed 78px desktop header. Transparent over the hero, opaque white as the hero leaves. On mobile it is 70px with an expandable menu.
- Desktop content gutters approximately 4.2vw; hero captions approximately 2.4vw from the sides.
- Light, high-contrast Cormorant Garamond display serif and Inter interface/body text. Both fonts are locally served.
- White and subtly tinted section backgrounds, near-black navy buttons/footer, restrained teal labels, cyan final hero button and calculator selection backgrounds.
- Hero footage uses `object-fit: cover` without distorting aspect ratios. Construction proceeds across all nine original films.
- Hero scroll distance is 6.5 viewport heights, with a 0.16-second scrub catch-up. Gallery scroll distance is two viewport heights, with a 0.45-second scrub catch-up. These distances are estimates because the recording does not expose scroll coordinates or the entire hero.
- Text entrances use 30px translation and 0.8-second power2 easing. Craft cards use 65px translation, 0.12-second stagger and 0.9-second power3 easing. These timings approximate the visible transitions; the recording is not a real-time specification of the original animation durations.
- Reduced-motion mode removes pins/animation, displays a static hero frame, and uses a manually scrollable gallery.
- Videos in normal sections load/play when near the viewport and pause off-screen or in a hidden document. Hero clips remain paused and seek according to scroll; distant video decoders are released. Posters preserve the composition while media loads.

## Source asset mapping

| Original asset | Size / duration | Observed content | Use |
| --- | --- | --- | --- |
| `1.mp4` | 1928 × 1072 / 9.04 s | Foundations through building shell and finished exterior | Hero chapter 1; initial process panel |
| `2.mp4` | 1928 × 1072 / 4.04 s | Excavation around completed house | Hero chapter 2; structural process panel |
| `3.mp4` | 1928 × 1072 / 4.04 s | Pool shell and landscaping | Hero chapter 3; gunite/stone process panel |
| `4.mp4` | 1928 × 1072 / 4.04 s | Empty pool filling with water | Hero chapter 4; portfolio |
| `5.mp4` | 1928 × 1072 / 4.04 s | Completed pool, camera approaches villa | Hero chapter 5; studio, portfolio, handover process, first testimonial |
| `6.mp4` | 1924 × 1076 / 3.04 s | Closer completed pool and facade view | Hero chapter 6; portfolio and second testimonial |
| `7.mp4` | 1924 × 1076 / 4.04 s | Approach through sliding doors | Hero chapter 7; portfolio |
| `8.mp4` | 1924 × 1076 / 3.04 s | Living/dining interior darkens | Hero chapter 8; portfolio |
| `9.mp4` | 1924 × 1076 / 3.04 s | Interior transitions to evening lighting | Hero chapter 9; night portfolio and third testimonial |
| `fondamenta.png` | Original supplied foundation photograph | Construction baseline | Before side of comparison |
| `logo.png` | Original supplied Top Edilizia Service mark | Company branding | Header and footer, as requested in browser comments |

The numbered sequence is confidently chronological. Assignments to secondary portfolio/testimonial slots are inferred from subject matter: the supplied footage shows one villa and interior rather than the distinct estates in the reference. No substitute stock media is used. JPEG posters and the completed comparison frame are extracted stills from the supplied films. Source files are unchanged; local public media uses filesystem hard links to avoid unnecessarily duplicating large videos.

## User-directed changes

The reference logo is replaced by the supplied `logo.png`. The header and shared footer navigation now use Home → hero, Chi Siamo → studio, Servizi → craft, Progetti → gallery, Contatti → consultation. The header CTA is “Richiedi preventivo”. Remaining reference copy is preserved in English.

## Limits of the reference

The recording begins partway through the hero. Earlier hero copy, its complete scroll range, cursor styling, and unshown hover/click results cannot be recovered exactly. Only the first process panel is demonstrated. Secondary panel copy, estate detail interaction, testimonial specifications, consultation completion, and legal-link contents are inferred to make the real controls functional. Contact details and company claims outside the supplied logo/header edits remain those shown in the reference; they are not verified Top Edilizia Service business details. The consultation button exposes an email request rather than submitting a booking to an unprovided backend.

## Local development

React 19, TypeScript, GSAP 3 and ScrollTrigger, using the bundled Vinext Next-compatible app router. Source is separated into reusable components under `components/` and the global reference stylesheet under `app/globals.css`.

```sh
npm install
npm run dev
npm run build
npx tsc --noEmit
```

The local preview is `http://127.0.0.1:5173/`. Original reference analysis frames are in the workspace's `.reference-analysis/` directory, outside the website project.

The site registration exists, but publication was not completed: the Sites plugin's local publishing helpers became unavailable during this session. Also, the unmodified `1.mp4` is 51.7 MiB, above the usual 25 MiB Cloudflare static asset limit; a compatible original-media host or byte-preserving segmented delivery will be needed for that deployment target. Local playback uses the full original file.

## Initial reconstruction validation (before company personalization)

- TypeScript: `tsc --noEmit` passed.
- Production: `node scripts/run-framework.mjs build` passed after the final code changes.
- Browser comparison at 1165 × 656: hero composition, fixed/solid header, craft grid, studio panel, calculator proportions, and horizontal gallery were inspected against extracted reference frames. Display-serif tracking and heading sizes, calculator panel width and type size, and craft icons were corrected during comparison.
- Responsive browser QA at 390 × 844: mobile header/menu, navigation, touch-scroll portfolio and section layout; no document-level horizontal overflow.
- Slider keyboard test: End produces 100; keyboard restoration produces 50.
- Estimator: default $111,000–$126,000; spa selection produces $135,000–$150,000; removing it restores the baseline.
- Process: both click selection and ArrowRight keyboard navigation change the panel.
- Stories: Lap & Wellness returns one card; All Stories returns three.
- Portfolio: detail dialog opens and closes.
- Consultation: action reveals a correctly encoded email request link without sending a message.
- Header: original Top Edilizia Service logo, five requested Italian navigation labels, and “Richiedi preventivo” verified in browser.
- Original source-media files were not re-encoded or edited.

Exact pixel parity and original easing cannot be conclusively established from a short recording with different supplied media. No measured 60 FPS guarantee is claimed.
