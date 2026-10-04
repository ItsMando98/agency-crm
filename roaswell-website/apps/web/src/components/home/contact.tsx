import { ArrowUpRight } from 'lucide-react';

export function Contact() {
 return <section id="contact" className="contact section"><div className="contact-top"><span className="eyebrow">05 / WHAT’S NEXT?</span><span>A better return starts with a better conversation.</span></div><a className="contact-main" href="mailto:hello@roaswell.com?subject=Let%E2%80%99s%20talk%20growth"><h2>LET’S TALK<br/><span>GROWTH.</span></h2><ArrowUpRight aria-hidden="true"/></a><div className="contact-bottom"><p>Tell us where you are.<br/>Let’s work out where you could go.</p><a href="mailto:hello@roaswell.com">hello@roaswell.com <ArrowUpRight size={19}/></a></div></section>;
}
