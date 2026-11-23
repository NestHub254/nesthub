# NestHub portal identities

- Owners: a structural N, in porcelain and blue on midnight navy (`#14264B`).
- Tenants: a sheltered doorway, in cream and peach on terracotta (`#A53F37`).

Editable vector originals live at `frontend/public/brand/owner-mark.svg` and
`tenant-portal/public/brand/tenant-mark.svg`. Both marks are custom SVG artwork.
The browser, sign-in screens, app header/sidebar, and installed PWA use the
appropriate portal mark. Owner dashboard theme preferences do not recolour the
brand, so each portal keeps a consistent identity.

Each asset family includes 32px browser PNG/ICO, 180px Apple touch icon,
192px and 512px regular PWA icons, and a separate opaque 512px maskable icon.
The maskable version keeps the symbol inside the central safe circle.
Manifest IDs and start URLs are unchanged; installed app labels are NH Owners
and NH Tenants. Existing installations may retain their old OS-managed icon
until the browser refreshes their installation metadata.

Regenerate raster exports with `node scripts/build-brand-assets.mjs` using
the Sharp package, or set `SHARP_MODULE` to its absolute installed module path.
