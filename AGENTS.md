# Agent Instructions

## Change Approval and Visual Work

- Before every file change, present a concrete plan and wait for the user's explicit approval. If the scope changes, update the plan and get approval again before editing.
- Before changing an interface, consider its effects on adjacent elements, screen sizes, and UI states. After editing, review predictable side effects in the code and address them within the approved scope. If another visual change is needed, get approval for the updated plan first.
- Do not place eyebrow or overline labels above `h1` or `h2` headings.
- Do not reduce a heading's font size to make it fit. Change the layout, column widths, or wrapping instead.
- Do not change font sizes with local overrides on individual components or pages. Change shared typography variables instead. Resolve isolated text overflow through layout or wrapping.
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
- Reuse an existing component when it fits the same element. Keep unique page content in its page component.

## Technical Architecture

- Give each shared concern one owner. Keep routes, page SEO fields, canonical URLs, and indexing rules in one route registry; derive client routing, generated HTML, sitemap, and server route rules from it. Do not copy the same page list or metadata into components, build scripts, or configuration files.
- Reuse an existing component, utility, or state mechanism when repeated behavior has the same contract and lifecycle. Extract shared logic when it has multiple real consumers; keep unique page content in its page component.
- When changing a shared mechanism, trace its consumers before editing and update them together. For routes and rendering, check direct URLs, development and production base paths, HTML and metadata before JavaScript, asset paths, hydration, and persisted states. Verify the generated output rather than relying on source inspection alone.
- Keep `docs/site-structure.md` aligned with the routes currently implemented; list service pages such as 404 separately from indexable content pages. Before a project review or deployment change, inspect hidden configuration files, including `.htaccess` and workflow files.

## Document Content

- Do not add document-level metadata or provenance blocks unless the user explicitly requests them. This includes any status, date, source, author, version, approval state, check timestamp, or similar information, whether formatted as labeled fields or written as introductory prose below the title.
- Start documents directly with substantive project content.
- Keep every document strictly limited to the subject stated in its title. Do not mix factual reference documents with requirements, recommendations, action items, migration plans, risks, or open questions; place project requirements and required actions in the technical specification.
- Before adding or moving content, classify each statement by its purpose, such as fact, requirement, recommendation, action, plan, risk, or open question, and include it only if that purpose belongs in the target document.
- Treat the user's requested information as the scope of the edit. Do not append related conclusions, operational advice, prerequisites, or next steps unless the user explicitly asks for them and they belong in the same document.
- If useful content belongs in a different document, do not insert or relocate it automatically. Mention the appropriate destination to the user or wait for an explicit request.
- Before completing a document edit, review the changed passage in context and remove any sentence that does not directly support the document's stated subject.

## Time and Cost Estimates

- Estimate project work for one person unless the user explicitly requests a team-based estimate.
- Include only tasks that are explicitly required by the project documentation or the user's request.
- Do not add agency roles, project-management overhead, contingency, optional services, new functionality, or deliverables that are not in scope.
- Treat conditional work as excluded until the condition is confirmed. State such exclusions when they materially affect the estimate.
- Calculate cost from the estimated labor hours using the hourly rate provided by the user. If no rate is provided, ask for one or clearly state the assumed rate.
- Break estimates down by actual project tasks so that the total hours and cost can be checked directly.
