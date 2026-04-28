# Carmed motion extraction for EOX

Source reference: https://carmed-bay.vercel.app/

## What was extracted

- Fixed header that gains blur, fill and shadow after scroll.
- Continuous ambient loops: slow floating, ring pulse, horizontal shine sweep and small orbit drift.
- Magnetic CTA: inner label follows the pointer and returns smoothly.
- Custom pointer: immediate dot plus delayed ring using requestAnimationFrame.
- Click feedback: short spark particles on canvas.
- Scroll reveal: opacity plus transform; title letters rise with elastic squash.
- Bento cards: pointer spotlight, subtle 3D tilt and glow.
- Counters: numbers animate when entering viewport.
- Reduced-motion handling: motion is disabled or shortened when the user requests it.

## What was not copied

- Carmed colors, candy/product assets, pink retail tone, wording and page composition.
- Product flip/flavor-swap logic, because EOX needs a calmer B2B interaction model.
- Global click animation on every document click; in EOX it only fires on intentional UI targets.

## EOX translation

- Candy/product float became dashboard float.
- Flavor orbit became ERP, Telefonia and SAC orbit chips.
- Retail sparkle became restrained red/teal click sparks.
- Carmed bento glow became dark EOX module cards with pointer-follow glow.
- ScrollTrigger-style reveals were rebuilt with native IntersectionObserver for portability.
- GSAP was intentionally not required; the site uses CSS keyframes and lightweight vanilla JS.
