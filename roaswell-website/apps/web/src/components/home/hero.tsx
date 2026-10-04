import { Link } from 'react-router';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

export function Hero() {
 return <section className="hero" aria-labelledby="hero-title"><div className="hero-top"><span className="eyebrow"><i/> INDEPENDENT DIGITAL GROWTH STUDIO</span><span className="hero-note">Less agency. More impact.</span></div><h1 id="hero-title">MARKETING<br/>DONE <span className="well">WELL<span className="period">.</span><svg viewBox="0 0 600 22" preserveAspectRatio="none" aria-hidden="true"><path d="M2 15 Q300 -5 598 10"/></svg></span></h1><div className="hero-bottom"><p>Sharp strategy. Specialist execution.<br/>Measurable growth. No agency bloat.</p><Link className="button primary" to="/contact">Let’s make it count <ArrowUpRight size={19}/></Link><Link className="scroll-link" to="/expertise"><span>BUILT FOR BETTER RETURNS</span><ArrowDown size={19}/></Link></div><div className="hero-foot"><span>SEO & CONTENT</span><span>META ADS</span><span>GOOGLE ADS</span><span className="foot-note">Focused by design. Effective by default.</span></div></section>;
}
