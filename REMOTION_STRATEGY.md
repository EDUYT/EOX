# EOX Remotion 3D Motion Strategy

## What the reference suggests

The Sabrina article uses Remotion as a repeatable video production system: define safe zones, write a scene script, build product/UI demos with React components, animate with springs and `interpolate()`, preview in Remotion Studio, then iterate with concrete visual corrections.

For EOX, the strongest direction is not to replace the website with Remotion. It is to use Remotion for high-impact cinematic assets and keep live website interactions in CSS/JS/Three.js.

## Best EOX use cases

- Hero background video: transparent or dark WebM showing a 3D CRM dashboard assembling, rotating and resolving into EOX modules.
- Product demo loop: 12-18 second Remotion composition with cursor-led interaction through CRM, Telefonia, ERP and BI.
- Section transitions: short exported clips for scroll moments, while HTML text/buttons remain interactive.
- Sales/social asset: vertical 1080x1920 launch/demo video based on the same EOX visual system.

## Proposed 3D scene

1. Data packets enter from the edges and assemble into a CRM dashboard slab.
2. The slab rotates slightly, revealing four layers: CRM, Telefonia, ERP and BI.
3. A signal cursor clicks one layer; a wipe changes the active module.
4. KPI cards count up and connect to the module layer.
5. The scene resolves into a stable dashboard behind the CTA.

## Technical path

- Create a separate `eox-remotion` project with `npx create-video@latest --yes --blank --no-tailwind eox-remotion`.
- Use React components for UI slabs and SVG/data packets.
- Use Three.js/React Three Fiber only where depth/camera movement adds value.
- Export optimized WebM/MP4 assets into `C:\Users\EDU\Desktop\Site-EOX\assets`.
- Keep the current site interactions native: cursor signal, click packets, scroll frame and state changes.

## Current site update

The red cursor pop was replaced by an EOX signal cursor and packet burst:

- Cursor: angular signal brackets plus a diamond pointer.
- Click: expanding lock-on brackets, data packets, directional signal lines and short trails.
- Trigger: only on interactive elements.
- Reduced motion: cursor/canvas effects are disabled.
