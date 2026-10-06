import type { Article } from '@/data/articles';
import { Link, Lines, useLocale, useT } from '@/i18n/context';

type InsightsListProps = {
	articles: Article[];
};

export function InsightsList({ articles }: InsightsListProps) {
	const t = useT();
	const locale = useLocale();

	return (
		<section className="section">
			<div className="section-heading">
				<span className="eyebrow">{t('insights.eyebrow')}</span>
				<h2>
					<Lines text={t('insights.title')} />
				</h2>
				<p>
					<Lines text={t('insights.lede')} />
				</p>
			</div>
			<div className="article-list">
				{articles.map(article => (
					<Link to={`/insights/${article.slug}`} className="article-card" key={article.slug}>
						<span className="ac-meta">
							{article.category.toLocaleUpperCase(locale)} ·{' '}
							{t('insights.readTime', { minutes: article.readMinutes }).toLocaleUpperCase(locale)}
						</span>
						<h3>{article.title}</h3>
						<p>{article.excerpt}</p>
					</Link>
				))}
			</div>
		</section>
	);
}
