export interface LeadSubmission {
	name: string;
	email: string;
	company?: string;
	message: string;
}

export interface LeadSubmissionResult {
	success: boolean;
	personId?: string;
	opportunityId?: string;
	error?: string;
}

const DEFAULT_API_URL = 'http://twenty-server:3000';

function getApiConfig() {
	const apiUrl = process.env.TWENTY_API_URL || DEFAULT_API_URL;
	const apiKey = process.env.TWENTY_API_KEY;

	if (!apiKey) {
		console.warn('[Twenty CRM] TWENTY_API_KEY is not defined. Lead submissions will not be synced to CRM.');
	}

	return { apiUrl: apiUrl.replace(/\/+$/, ''), apiKey };
}

/**
 * Creates or updates lead data in Twenty CRM:
 * 1. Finds or creates Company (if provided)
 * 2. Finds or creates Person
 * 3. Creates Opportunity (Deal/Inquiry) in stage "NEW"
 * 4. Creates Note with the inquiry message
 * 5. Links Note to Person and Opportunity
 */
export async function submitLeadToTwenty(submission: LeadSubmission): Promise<LeadSubmissionResult> {
	const { apiUrl, apiKey } = getApiConfig();

	if (!apiKey) {
		return { success: false, error: 'CRM integration is not configured' };
	}

	const headers = {
		Authorization: `Bearer ${apiKey}`,
		'Content-Type': 'application/json',
	};

	try {
		// Parse name into first and last name
		const cleanName = submission.name.trim();
		const nameParts = cleanName.split(/\s+/);
		const firstName = nameParts[0] || 'Unknown';
		const lastName = nameParts.slice(1).join(' ') || '';

		let companyId: string | undefined;

		// 1. Company Handling
		const companyName = submission.company?.trim();
		if (companyName) {
			try {
				const findCompanyRes = await fetch(
					`${apiUrl}/rest/companies?filter=name[eq]:${encodeURIComponent(companyName)}&limit=1`,
					{ headers },
				);
				if (findCompanyRes.ok) {
					const findData = await findCompanyRes.json();
					const existingCompany = findData.data?.companies?.[0];
					if (existingCompany?.id) {
						companyId = existingCompany.id;
					}
				}

				if (!companyId) {
					const createCompanyRes = await fetch(`${apiUrl}/rest/companies`, {
						method: 'POST',
						headers,
						body: JSON.stringify({ name: companyName }),
					});
					if (createCompanyRes.ok) {
						const createData = await createCompanyRes.json();
						companyId = createData.data?.createCompany?.id;
					}
				}
			} catch (compErr) {
				console.error('[Twenty CRM] Error processing company:', compErr);
			}
		}

		// 2. Person Handling
		let personId: string | undefined;
		const cleanEmail = submission.email.trim().toLowerCase();

		try {
			const findPersonRes = await fetch(
				`${apiUrl}/rest/people?filter=emails.primaryEmail[eq]:${encodeURIComponent(cleanEmail)}&limit=1`,
				{ headers },
			);
			if (findPersonRes.ok) {
				const findData = await findPersonRes.json();
				const existingPerson = findData.data?.people?.[0];
				if (existingPerson?.id) {
					personId = existingPerson.id;
				}
			}

			if (!personId) {
				const createPersonRes = await fetch(`${apiUrl}/rest/people`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						name: { firstName, lastName },
						emails: { primaryEmail: cleanEmail },
						...(companyId ? { companyId } : {}),
					}),
				});
				if (createPersonRes.ok) {
					const createData = await createPersonRes.json();
					personId = createData.data?.createPerson?.id;
				} else {
					const errText = await createPersonRes.text();
					console.error('[Twenty CRM] Failed to create person:', errText);
				}
			}
		} catch (personErr) {
			console.error('[Twenty CRM] Error processing person:', personErr);
		}

		// 3. Opportunity Handling
		let opportunityId: string | undefined;
		const oppName = `Inquiry: ${cleanName}${companyName ? ` (${companyName})` : ''}`;

		try {
			const createOppRes = await fetch(`${apiUrl}/rest/opportunities`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					name: oppName,
					stage: 'NEW',
					...(personId ? { pointOfContactId: personId } : {}),
					...(companyId ? { companyId } : {}),
				}),
			});

			if (createOppRes.ok) {
				const createData = await createOppRes.json();
				opportunityId = createData.data?.createOpportunity?.id;
			} else {
				const errText = await createOppRes.text();
				console.error('[Twenty CRM] Failed to create opportunity:', errText);
			}
		} catch (oppErr) {
			console.error('[Twenty CRM] Error processing opportunity:', oppErr);
		}

		// 4. Note and NoteTarget Handling (Inquiry Message)
		if (submission.message?.trim()) {
			try {
				const createNoteRes = await fetch(`${apiUrl}/rest/notes`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						title: `Website Inquiry — ${cleanName}`,
						bodyV2: {
							markdown: `**Name:** ${cleanName}\n**Email:** ${cleanEmail}\n**Company:** ${companyName || 'N/A'}\n\n**Message:**\n${submission.message.trim()}`,
						},
					}),
				});

				if (createNoteRes.ok) {
					const noteData = await createNoteRes.json();
					const noteId = noteData.data?.createNote?.id;

					if (noteId) {
						await fetch(`${apiUrl}/rest/noteTargets`, {
							method: 'POST',
							headers,
							body: JSON.stringify({
								noteId,
								...(personId ? { targetPersonId: personId } : {}),
								...(opportunityId ? { targetOpportunityId: opportunityId } : {}),
								...(companyId ? { targetCompanyId: companyId } : {})
							}),
						});
					}
				}
			} catch (noteErr) {
				console.error('[Twenty CRM] Error processing note:', noteErr);
			}
		}

		return {
			success: true,
			personId,
			opportunityId,
		};
	} catch (error: any) {
		console.error('[Twenty CRM] Unexpected error submitting lead:', error);
		return {
			success: false,
			error: error?.message || 'Failed to submit lead to CRM',
		};
	}
}
