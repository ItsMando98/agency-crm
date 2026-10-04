import { useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router';
import { ArrowUpRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ActionData {
	success?: boolean;
	error?: string;
}

export function ContactPage() {
	const actionData = useActionData() as ActionData | undefined;
	const navigation = useNavigation();
	const [resetKey, setResetKey] = useState(0);

	const isSubmitting = navigation.state === 'submitting';
	const isSubmitted = actionData?.success && navigation.state === 'idle';

	return (
		<>
			<section className="page-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> CONTACT
					</span>
					<span className="hero-note">A better return starts with a better conversation.</span>
				</div>
				<h1>
					Let’s talk
					<br />
					growth.
				</h1>
				<p>
					Tell us where you are. Let’s work out where you could go. We reply to every
					genuine enquiry — usually within a working day.
				</p>
			</section>

			<section className="section">
				<div className="contact-page">
					<div className="contact-info">
						<span className="eyebrow">
							<i /> SAY HELLO
						</span>
						<h2 style={{ margin: '24px 0 30px' }}>
							Start the
							<br />
							conversation.
						</h2>
						<p>
							Whether you have a defined challenge or are still shaping the question,
							we’re happy to think it through with you.
						</p>
						<a className="contact-email" href="mailto:hello@roaswell.com?subject=Let%E2%80%99s%20talk%20growth">
							hello@roaswell.com <ArrowUpRight size={19} />
						</a>
						<p className="contact-note">
							Prefer email? Reach us directly — we read everything that comes in.
						</p>
					</div>

					{isSubmitted ? (
						<div className="contact-feedback success">
							<div className="feedback-icon">
								<CheckCircle2 size={36} />
							</div>
							<h3>Message received.</h3>
							<p>
								Thank you for reaching out. Your enquiry is in our system and we’ll review it carefully.
								You can expect a reply within one working day.
							</p>
							<button
								type="button"
								className="button"
								onClick={() => setResetKey(k => k + 1)}
								style={{ marginTop: '24px' }}
							>
								Send another note <ArrowUpRight size={16} />
							</button>
						</div>
					) : (
						<Form
							key={resetKey}
							className="contact-form"
							method="post"
						>
							{actionData?.error && (
								<div className="contact-feedback error">
									<AlertCircle size={20} />
									<span>{actionData.error}</span>
								</div>
							)}

							<label htmlFor="name">YOUR NAME</label>
							<input
								id="name"
								name="name"
								type="text"
								placeholder="Jane Doe"
								required
								disabled={isSubmitting}
							/>

							<label htmlFor="email">EMAIL</label>
							<input
								id="email"
								name="email"
								type="email"
								placeholder="jane@company.com"
								required
								disabled={isSubmitting}
							/>

							<label htmlFor="company">COMPANY (OPTIONAL)</label>
							<input
								id="company"
								name="company"
								type="text"
								placeholder="Company Ltd."
								disabled={isSubmitting}
							/>

							<label htmlFor="message">WHAT’S ON YOUR MIND?</label>
							<textarea
								id="message"
								name="message"
								rows={5}
								placeholder="A sentence or two about where you are and what you’re hoping to change."
								required
								disabled={isSubmitting}
							/>

							<button
								type="submit"
								className="button primary"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										Sending... <Loader2 size={18} className="animate-spin" />
									</>
								) : (
									<>
										Send message <ArrowUpRight size={18} />
									</>
								)}
							</button>
						</Form>
					)}
				</div>
			</section>
		</>
	);
}
