import { useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router';
import { ArrowUpRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { action } from '@/routes/contact';
import { Link, Lines, useT } from '@/i18n/context';
import { useRootData } from '@/lib/use-root-data';

export function ContactPage() {
	const t = useT();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const bookingUrl = useRootData()?.bookingUrl ?? null;
	const [resetKey, setResetKey] = useState(0);

	const isSubmitting = navigation.state === 'submitting';
	const isSubmitted = actionData?.success === true && navigation.state === 'idle';
	const errorKey = actionData && !actionData.success ? actionData.error : undefined;

	return (
		<>
			<section className="page-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {t('contact.eyebrow')}
					</span>
					<span className="hero-note">{t('contact.note')}</span>
				</div>
				<h1>
					<Lines text={t('contact.title')} />
				</h1>
				<p>{t('contact.lede')}</p>
			</section>

			<section className="section">
				<div className="contact-page">
					<div className="contact-info">
						<span className="eyebrow">
							<i /> {t('contact.info.eyebrow')}
						</span>
						<h2 style={{ margin: '24px 0 30px' }}>
							<Lines text={t('contact.info.title')} />
						</h2>
						<p>{t('contact.info.text')}</p>
						{bookingUrl && (
							<a className="button primary contact-booking" href={bookingUrl} target="_blank" rel="noopener noreferrer">
								{t('cta.book')} <ArrowUpRight size={19} />
							</a>
						)}
						<a className="contact-email" href="mailto:hello@roaswell.com">
							hello@roaswell.com <ArrowUpRight size={19} />
						</a>
						<p className="contact-note">{t('contact.info.email')}</p>
					</div>

					{isSubmitted ? (
						<div className="contact-feedback success" role="status">
							<div className="feedback-icon">
								<CheckCircle2 size={36} />
							</div>
							<h3>{t('contact.success.title')}</h3>
							<p>{t('contact.success.text')}</p>
							<button
								type="button"
								className="button"
								onClick={() => setResetKey(key => key + 1)}
								style={{ marginTop: '24px' }}
							>
								{t('contact.success.again')} <ArrowUpRight size={16} />
							</button>
						</div>
					) : (
						<Form key={resetKey} className="contact-form" method="post">
							{errorKey && (
								<div className="contact-feedback error" role="alert">
									<AlertCircle size={20} />
									<span>{t(`contact.error.${errorKey}`)}</span>
								</div>
							)}

							<label htmlFor="name">{t('contact.form.name')}</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								placeholder={t('contact.form.namePlaceholder')}
								required
								disabled={isSubmitting}
							/>

							<label htmlFor="email">{t('contact.form.email')}</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder={t('contact.form.emailPlaceholder')}
								required
								disabled={isSubmitting}
							/>

							<label htmlFor="company">{t('contact.form.company')}</label>
							<input
								id="company"
								name="company"
								type="text"
								autoComplete="organization"
								placeholder={t('contact.form.companyPlaceholder')}
								disabled={isSubmitting}
							/>

							<label htmlFor="message">{t('contact.form.message')}</label>
							<textarea
								id="message"
								name="message"
								rows={5}
								placeholder={t('contact.form.messagePlaceholder')}
								required
								disabled={isSubmitting}
							/>

							<div className="form-trap" aria-hidden="true">
								<label htmlFor="website">Website</label>
								<input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
							</div>

							<label className="consent" htmlFor="consent">
								<input id="consent" name="consent" type="checkbox" required disabled={isSubmitting} />
								<span>
									{t('contact.form.consent')}{' '}
									<Link to="/privacy">{t('contact.form.consentLink')}</Link>
								</span>
							</label>

							<button type="submit" className="button primary" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										{t('contact.form.sending')} <Loader2 size={18} className="animate-spin" />
									</>
								) : (
									<>
										{t('contact.form.send')} <ArrowUpRight size={18} />
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
