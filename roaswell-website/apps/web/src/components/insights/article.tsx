import { Link } from 'react-router';
import type { Article } from '@/data/articles';

export function ArticleView({ article }: { article: Article }) {
	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {article.category.toUpperCase()}
					</span>
					<Link to="/insights" className="back-link">
						← All insights
					</Link>
				</div>
				<h1>{article.title}</h1>
				<p className="detail-summary">
					{article.excerpt}
					<br />
					<span className="ac-meta" style={{ display: 'inline-block', marginTop: 14 }}>
						{article.readTime.toUpperCase()}
					</span>
				</p>
			</section>

			<section className="detail-body">
				<aside className="detail-aside">
					<h4>SHARE</h4>
					<Link to="/contact" className="discipline-cta">
						Discuss this →
					</Link>
				</aside>
				<div className="prose">
					{article.body.map((block, i) => {
						if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
						if (block.type === 'quote') return <blockquote key={i}>{block.text}</blockquote>;
						return <p key={i}>{block.text}</p>;
					})}
				</div>
			</section>
		</>
	);
}
