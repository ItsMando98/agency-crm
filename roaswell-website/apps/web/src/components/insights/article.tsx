import type { Article } from '@/data/articles';
import { Link, useLocale, useT } from '@/i18n/context';

export function ArticleView({ article }: { article: Article }) {
	const t = useT();
	const locale = useLocale();

	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {article.category.toLocaleUpperCase(locale)}
					</span>
					<Link to="/insights" className="back-link">
						{t('insights.back')}
					</Link>
				</div>
				<h1>{article.title}</h1>
				<p className="detail-summary">
					{article.excerpt}
					<br />
					<span className="ac-meta" style={{ display: 'inline-block', marginTop: 14 }}>
						{t('insights.readTime', { minutes: article.readMinutes }).toLocaleUpperCase(locale)}
					</span>
				</p>
			</section>

			<section className="detail-body">
				<aside className="detail-aside">
					<h4>{t('insights.share')}</h4>
					<Link to="/contact" className="discipline-cta">
						{t('insights.discuss')}
					</Link>
				</aside>
				<div className="prose">
					{article.body.map((block, index) => {
						if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>;
						if (block.type === 'quote') return <blockquote key={index}>{block.text}</blockquote>;
						return <p key={index}>{block.text}</p>;
					})}
				</div>
			</section>
		</>
	);
}
