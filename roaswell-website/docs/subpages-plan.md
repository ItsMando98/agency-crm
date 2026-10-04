# Roaswell sub-page plan

Status: proposal. Nothing below is built yet except the four top-level service pages.

## Where we are

`/expertise` lists four disciplines and each has one detail page at `/expertise/:slug`:

| Slug | Service |
| --- | --- |
| `seo-content` | SEO & Content |
| `meta-ads` | Meta Ads |
| `google-ads` | Google Ads |
| `motion-graphics` | Motion Graphics (new) |

All four are generated from `src/data/expertise.ts`, so the sitemap, `llms.txt`, schema and breadcrumbs pick up new entries automatically.

## Goal

Give each service a second layer of pages that target specific buying searches, show depth to large buyers, and keep the one-system story. A visitor should be able to go from "Motion Graphics" to "Product animation for a launch" in one click and see a page that is specific to that need.

## Structure

Nested under the service, one level deep only:

```
/expertise/:service/:subpage
```

Keep it flat. No third level, so URLs stay short and every page can be reached from the service page.

### Motion Graphics (build first)

| Sub-page | Slug | Who searches for it | Signature motion on the page |
| --- | --- | --- | --- |
| Paid social motion ads | `paid-social-motion` | Performance marketers, brand leads | Hook, claim, CTA storyboard that plays as you scroll, with a variant grid |
| Explainer videos | `explainer-videos` | B2B and SaaS marketing | Script-to-screen pipeline drawn on scroll |
| Product animation | `product-animation` | Launch and product teams | Exploded-view object that assembles on scroll |
| Brand films | `brand-films` | Brand and comms leads | Pinned full-bleed sequence with chapter markers |
| Web and UI motion | `web-ui-motion` | Product and web teams | Live micro-interaction demos (hover, scroll, transitions) |

### SEO & Content

| Sub-page | Slug |
| --- | --- |
| Technical SEO | `technical-seo` |
| Content strategy | `content-strategy` |
| Commercial keyword research | `keyword-research` |

### Meta Ads

| Sub-page | Slug |
| --- | --- |
| Creative testing system | `creative-testing` |
| Full-funnel campaigns | `full-funnel` |
| Retargeting | `retargeting` |

### Google Ads

| Sub-page | Slug |
| --- | --- |
| Paid search | `paid-search` |
| Shopping and Performance Max | `shopping-pmax` |
| Tracking and measurement | `tracking-measurement` |

Total: 14 sub-pages. Motion Graphics goes first because it is the newest service and the one with the strongest visual proof.

## Shared page template

Every sub-page uses the same sections so one build covers all 14:

1. Hero with the sub-page headline and one animated signature graphic.
2. "What you get": 4 to 6 deliverables.
3. "How it runs": a 3 to 4 step scroll-drawn timeline (reuse the Approach component).
4. "Where it connects": links to the other services it feeds, to reinforce the one-system idea.
5. FAQ: 4 to 6 questions, marked up with FAQPage schema.
6. Related sub-pages plus the contact call to action.

## Build plan

### Data
- Add `subpages: SubPage[]` to `Discipline` in `src/data/expertise.ts`.
- `SubPage` fields: `slug`, `name`, `headline`, `headlineAccent`, `summary`, `deliverables`, `steps`, `faqs`, `connects` (other discipline slugs), `signature` (which graphic to render).

### Routing
- Add `route('expertise/:slug/:subSlug', 'routes/expertise.$slug.$subSlug.tsx')` in `src/routes.ts`.
- 404 when either slug is unknown.
- New `components/expertise/subpage-detail.tsx` for the template.
- Service page gets a "Specialisms" list linking to its sub-pages, in the pinned section and on the detail page.

### SEO and discoverability
- Breadcrumb schema with four levels (Home, Expertise, Service, Sub-page).
- `Service` schema per sub-page, with `isPartOf` pointing at the parent service.
- `FAQPage` schema from the FAQ block.
- Add entries to `sitemap.xml`, `llms.txt` and `llms-full.txt` by looping over the data, not by hand.

### Motion
- One reusable signature graphic per sub-page, built on the existing `primitives.tsx` helpers (`Reveal`, `MaskedLines`, `ScrollWords`, `Counter`).
- Respect reduced motion, as the home page does.
- Keep the page usable and readable without JavaScript.

## Build order

1. Data model and route, with the five Motion Graphics sub-pages.
2. Sub-page links on the service pages and in the footer.
3. SEO and Meta Ads sub-pages.
4. Google Ads sub-pages.
5. `/work` filtering by discipline, with a Motion Graphics case study once real work exists.

## Needs from the Roaswell team

- Real sample work for Motion Graphics. Until then every demo is labelled illustrative, in line with the rest of the site. No invented clients or results.
- Confirm the sub-page list. Cut anything the studio does not want to sell.
- Pricing and engagement model: show publicly, or "talk to us" only.
- One short real FAQ answer per sub-page, so the copy reflects how the studio actually works.

## Open questions

- Should Motion Graphics also be sold as a standalone service, or only as part of the growth system? This changes the call to action on its pages.
- Is there appetite for a showreel page at `/work/reel` once there is footage?
- Do we want industry pages later (for example `/solutions/ecommerce`), or stay service-led?
