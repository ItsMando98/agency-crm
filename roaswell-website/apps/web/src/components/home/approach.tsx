import { approach } from '@/data/studio';

export function Approach() {
 return <section className="approach section" id="approach"><div className="approach-intro"><span className="eyebrow">03 / THE ROASWELL APPROACH</span><h2>Big thinking.<br/>Small team.<br/><em>Better work.</em></h2><p>You work directly with the people doing the thinking—and the doing. No layers. No handoffs. No mystery about where your investment goes.</p><span className="approach-sign">Independent in spirit. Accountable by nature.</span></div><div className="approach-steps">{approach.map(item => <article key={item.number}><span className="large-index">{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}<div className="principle"><span className="status-dot"/> SENIOR-LED. SPECIALIST-DELIVERED. ALWAYS ACCOUNTABLE.</div></div></section>;
}
