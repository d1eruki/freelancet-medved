# Interface Spacing

- Use Tailwind's existing spacing utilities for interface spacing. Keep the relationship between elements more important than making every gap identical.
- Use 12–16 px (`3`–`4` on Tailwind's spacing scale) inside one control, including a field label and its field or an icon and its text.
- Use 24 px (`6`) between related text elements: a small label and its display title, or a heading and its description.
- Use 40 px (`10`) between a text group and its related action, form, or separate content group.
- Use 48 px (`12`) on small screens and 64 px (`16`) from a section introduction to a collection of cards or items.
- Use `py-20 sm:py-24 wide:py-28` for ordinary section top and bottom padding. Full-screen heroes and the pinned production process use their own viewport-driven geometry; the legal title band needs extra top space below the fixed header.
- If a component uses `mt-auto` to align content, keep the explicitly related text together with the appropriate gap; let the free space separate content groups instead.
- Preserve the root project instructions for typography, visual approval, and user-led visual review.
