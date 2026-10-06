import { ArrowUpRight } from 'lucide-react';
import type { Discipline } from '@/data/expertise';
import { Link } from '@/i18n/context';

type ExpertiseDisciplinesProps = {
	disciplines: Discipline[];
};

export function ExpertiseDisciplines({ disciplines }: ExpertiseDisciplinesProps) {
	return (
		<div>
			{disciplines.map(d => (
				<section className="discipline-block" key={d.slug} id={d.slug}>
					<span className="discipline-index">{d.number}</span>
					<div>
						<h2 className="discipline-headline">
							{d.headline}
							<span>{d.headlineAccent}</span>
						</h2>
						<p className="discipline-summary">{d.summary}</p>
						<ul className="capability-list">
							{d.capabilities.map(c => (
								<li key={c}>{c}</li>
							))}
						</ul>
						{d.subpages.length > 0 && (
							<div className="sub-links">
								{d.subpages.map(subpage => (
									<Link key={subpage.slug} to={`/expertise/${d.slug}/${subpage.slug}`}>
										{subpage.name} <ArrowUpRight size={14} />
									</Link>
								))}
							</div>
						)}
						<Link to={`/expertise/${d.slug}`} className="discipline-cta">
							{d.cta} <ArrowUpRight size={18} />
						</Link>
					</div>
				</section>
			))}
		</div>
	);
}
