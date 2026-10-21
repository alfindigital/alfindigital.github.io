# Design direction

Owner-chosen direction (21 Oct 2026): **ultra-minimal white, Apple-like**. References pulled from Mobbin: Sunday (floating centred nav chip, huge tight headline, rounded hero frame), Plane (light headline over a large rounded product screenshot), Analogue (project index with hairline dividers).

## Dials
ENERGY 2 · RHYTHM 3 · MOTION 2

## Identity
A solo Indonesian maker of small tools that open fast and work offline. The products are the visual content: real screenshots of live sites, never invented imagery.

## Type
System font stack (SF Pro on Apple devices, Segoe UI Variable on Windows). Reason: it matches the brand claim (fast, no payload) and ships real optical sizing. Large sizes use negative tracking, body uses none.

## Colour
White paper, near-black ink, one blue accent used only for the primary action, links and focus. Dark mode is a full second theme, not an inversion. Screenshots are shown as they are.

## Icons
Phosphor (regular weight), one family only, inlined as an SVG sprite.

## Motion
Transitions from transitions.dev (texts reveal, tabs sliding, icon swap, modal, toast, accordion, skeleton reveal, number pop-in, checkbox check). Every one has a `prefers-reduced-motion` guard.

## Honesty rules
No invented numbers or claims. Every figure comes from the GitHub API or from a repo description. A project is only linked "Live" if the URL answered when checked.
