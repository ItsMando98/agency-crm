import { Link } from 'react-router';
import { articles } from '@/data/articles';

export function InsightsList() {
	return (
		<section className="section">
			<div className="section-heading">
				<span className="eyebrow">04 / INSIGHTS</span>
				<h2>
					Thinking,
					<br />
					in writing.
				</h2>
				<p>
					Notes on search, content, and paid media —
					<br />
					and how the three fit together.
				</p>
			</div>
			<div className="article-list">
				{articles.map(a => (
					<Link to={`/insights/${a.slug}`} className="article-card" key={a.slug}>
						<span className="ac-meta">
							{a.category.toUpperCase()} · {a.readTime.toUpperCase()}
						</span>
						<h3>{a.title}</h3>
						<p>{a.excerpt}</p>
					</Link>
				))}
			</div>
		</section>
	);
}
