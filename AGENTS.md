# Agent Instructions

## Visual Work

- Do not place eyebrow or overline labels above `h1` or `h2` headings.
- Do not reduce a heading's font size to make it fit. Change the layout, column widths, or wrapping instead.
- The user controls visual design and performs visual review. Implement only the exact visual changes the user requests and approves; do not add adjustments based on your own visual judgment.
- After a visual change, do not open a browser, capture screenshots, inspect the rendered layout, or claim visual approval unless the user explicitly requests that verification. Run nonvisual checks and hand the result to the user for visual review.

## Image Generation Style

- Before generating images for this project, read `materials/image-generation/style.json` and use its reference image and description as style guidance. Adapt the style to the requested subject without copying the poster's exact composition, marks, or text.
- If a generated image may have a style problem, describe the specific mismatch in text and show that result to the user. Do not generate the next image until the user has assessed it and said what to change.

## File Naming

- Write all file and directory names in English.
- Use lowercase kebab-case for new file and directory names unless the technology or an established convention requires another format.
- Keep document contents in the language appropriate for the project and its audience. The English-only rule applies to file and directory names, not necessarily to their contents.

## Vue Components

- When a card, action block, or other page element is repeated or is designed to be repeated with different data, make it a Vue component from its first implementation. Pass content and meaningful variants through props or slots instead of copying its markup into page templates.

## Interface Spacing in `src/`

- Keep the relationship between elements more important than making every gap identical.
- Use 12–16 px (`3`–`4` on Tailwind's spacing scale) inside one control, including a field label and its field or an icon and its text.
- Use 24 px (`6`) between related text elements: a small label and its display title, or a heading and its description.
- Use 40 px (`10`) between a text group and its related action, form, or separate content group.
- Use 48 px (`12`) on small screens and 64 px (`16`) from a section introduction to a collection of cards or items.
- Use `py-20 sm:py-24 wide:py-28` for ordinary section top and bottom padding. Full-screen heroes and the pinned production process use their own viewport-driven geometry; the legal title band needs extra top space below the fixed header.
- If a component uses `mt-auto` to align content, keep the explicitly related text together with the appropriate gap; let the free space separate content groups instead.

## Technical Architecture

- Give each shared concern one owner. Keep routes, page SEO fields, canonical URLs, and indexing rules in one route registry; derive client routing, generated HTML, sitemap, and server route rules from it. Do not copy the same page list or metadata into components, build scripts, or configuration files.
- For routes and rendering, check direct URLs, development and production base paths, HTML and metadata before JavaScript, asset paths, hydration, and persisted states. Verify the generated output rather than relying on source inspection alone.
- Keep `docs/site-structure.md` aligned with the routes currently implemented; list service pages such as 404 separately from indexable content pages. Before a project review or deployment change, inspect hidden configuration files, including `.htaccess` and workflow files.
