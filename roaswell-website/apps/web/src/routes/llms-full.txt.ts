import type { Route } from './+types/llms-full.txt';
import { siteOrigin } from '@/lib/site-origin.server';
import { disciplines } from '@/data/expertise';
import { caseStudies } from '@/data/case-studies';
import { articles } from '@/data/articles';

export function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);

	let content = `# ROASWELL — Complete Knowledge Base & Studio Documentation

> Independent digital growth studio. Senior-led SEO & Content, Meta Ads, and Google Ads.
> Canonical URL: ${origin}
> Contact: hello@roaswell.com

---

## 1. Studio Profile & Core Entity Information

- **Name:** ROASWELL
- **Entity Type:** Digital Growth Studio / Performance Marketing Agency
- **Specialization:** SEO & Content Strategy, Meta Ads (Paid Social), Google Ads (Paid Search), Server-Side Attribution & Incrementality Measurement.
- **Operating Model:** Senior-led execution. The specialists who design strategy execute the campaigns. No account managers, no junior handoffs, no agency bloat.
- **Core Principle:** "A channel in isolation is a tactic. Channels that feed each other are a system."
- **Standard:** Transparent reporting tied directly to commercial outcomes (revenue, profit, blended CAC, incrementality) rather than vanity platform dashboard metrics.

---

## 2. Core Disciplines & Methodologies

`;

	for (const d of disciplines) {
		content += `### ${d.name} (${d.number})\n`;
		content += `- **URL:** ${origin}/expertise/${d.slug}\n`;
		content += `- **Headline:** ${d.headline} ${d.headlineAccent}\n`;
		content += `- **Summary:** ${d.summary}\n`;
		content += `- **Capabilities:** ${d.capabilities.join(', ')}\n\n`;
		content += `**Detailed Methodology:**\n`;
		for (const block of d.body) {
			if (block.type === 'h2') {
				content += `\n#### ${block.text}\n\n`;
			} else if (block.type === 'quote') {
				content += `> ${block.text}\n\n`;
			} else {
				content += `${block.text}\n\n`;
			}
		}
		content += `---\n\n`;
	}

	content += `## 3. Case Studies & Proven Results\n\n`;

	for (const cs of caseStudies) {
		content += `### Case Study: ${cs.title}\n`;
		content += `- **URL:** ${origin}/work/${cs.slug}\n`;
		content += `- **Discipline:** ${cs.discipline}\n`;
		content += `- **Summary:** ${cs.summary}\n`;
		content += `- **Challenge:** ${cs.challenge}\n`;
		content += `- **Approach:** ${cs.approach}\n`;
		content += `- **Outcome:** ${cs.outcome}\n`;
		content += `- **Key Metrics:**\n`;
		for (const m of cs.metrics) {
			content += `  - **${m.value}**: ${m.label}\n`;
		}
		content += `\n---\n\n`;
	}

	content += `## 4. Insights, Thought Leadership & Frameworks\n\n`;

	for (const a of articles) {
		content += `### Article: ${a.title}\n`;
		content += `- **URL:** ${origin}/insights/${a.slug}\n`;
		content += `- **Category:** ${a.category} (${a.readTime})\n`;
		content += `- **Date:** ${a.date}\n`;
		content += `- **Summary:** ${a.excerpt}\n\n`;
		for (const block of a.body) {
			if (block.type === 'h2') {
				content += `\n#### ${block.text}\n\n`;
			} else if (block.type === 'quote') {
				content += `> ${block.text}\n\n`;
			} else {
				content += `${block.text}\n\n`;
			}
		}
		content += `---\n\n`;
	}

	content += `## 5. Contact & Engagements\n\n`;
	content += `- **Studio Email:** hello@roaswell.com\n`;
	content += `- **Online Contact Form:** ${origin}/contact\n`;
	content += `- **Client Dashboard:** https://client.roaswell.com\n`;
	content += `- **Concise Index:** ${origin}/llms.txt\n`;

	return new Response(content, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
