# Navi production assets

Eight transparent PNG assets generated from `mockup/navi_the_avatar.png` as the identity/style reference.

| File | State / angle |
| --- | --- |
| `navi-idle.png` | Front-facing, full-body neutral stance |
| `navi-listening.png` | Three-quarter right, hand cupped to ear |
| `navi-thinking.png` | Three-quarter left, reflective chin pose |
| `navi-explaining.png` | Three-quarter presentation pose with open hands |
| `navi-celebrating.png` | Front three-quarter, raised-fist celebration |
| `navi-pointing-left.png` | Three-quarter pose pointing toward UI content |
| `navi-walking-profile.png` | Full-body right-facing profile walk |
| `navi-greeting.png` | Full-body wave with tablet and backpack |

## Generation prompt set

All assets used the built-in image-generation workflow with the supplied Navi sheet as the sole identity and style reference. The shared prompt locked Navi's youthful 3D face, wavy dark-brown hair, warm brown eyes, sage hoodie and white PathSeeker mark, beige trousers, and clean white sneakers. Each named state added only its requested angle and gesture.

The generated sources used a perfectly flat `#ff00ff` chroma-key background with no shadows, gradients, floor, reflections, text, watermark, extra characters, or duplicate poses. The chroma key was then removed locally with a soft matte and despill. Final files are RGBA PNGs with verified transparent corners.
