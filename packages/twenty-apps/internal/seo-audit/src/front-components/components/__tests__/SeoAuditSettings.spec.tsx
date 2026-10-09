// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  metadataQuery: vi.fn(),
  metadataMutation: vi.fn(),
  coreQuery: vi.fn(),
  coreMutation: vi.fn(),
  enqueueSnackbar: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function () {
    return { query: mocks.metadataQuery, mutation: mocks.metadataMutation };
  }),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: mocks.coreQuery, mutation: mocks.coreMutation };
  }),
}));
vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: mocks.enqueueSnackbar,
  navigate: mocks.navigate,
  AppPath: { RecordShowPage: '/object/:objectNameSingular/:objectRecordId' },
}));

import { SeoAuditSettings } from 'src/front-components/components/SeoAuditSettings';

const variable = (overrides: Record<string, unknown>) => ({
  key: 'KEY',
  value: '',
  label: 'Label',
  description: 'Description',
  isSecret: false,
  isDeprecated: false,
  type: 'TEXT',
  options: null,
  ...overrides,
});

const buildVariables = (
  apiKeyValue = '',
  dataForSeoLogin = '',
  dataForSeoPassword = '',
  pdfRendererUrl = '',
) => [
  variable({
    key: 'ANTHROPIC_API_KEY',
    label: 'Anthropic API key',
    description: 'Used by the page classifier.',
    isSecret: true,
    value: apiKeyValue,
  }),
  variable({
    key: 'SEO_AUDIT_DEFAULT_LANGUAGE',
    label: 'Default report language',
    type: 'SELECT',
    value: 'DE',
    options: [
      { label: 'German', value: 'DE' },
      { label: 'English', value: 'EN' },
    ],
  }),
  variable({
    key: 'DATAFORSEO_LOGIN',
    label: 'DataForSEO API login',
    value: dataForSeoLogin,
  }),
  variable({
    key: 'DATAFORSEO_PASSWORD',
    label: 'DataForSEO API password',
    isSecret: true,
    value: dataForSeoPassword,
  }),
  variable({
    key: 'SEO_AUDIT_MARKET',
    label: 'Market',
    type: 'SELECT',
    value: 'DE',
    options: [
      { label: 'Germany', value: 'DE' },
      { label: 'Austria', value: 'AT' },
    ],
  }),
  variable({ key: 'SEO_AUDIT_BRAND_NAME', label: 'Report brand name' }),
  variable({ key: 'SEO_AUDIT_ACCENT_COLOR', label: 'Report accent color', value: '#2a78d6' }),
  variable({ key: 'SEO_AUDIT_PUBLIC_URL', label: 'Report link base URL' }),
  variable({ key: 'PDF_RENDERER_URL', label: 'PDF renderer URL', value: pdfRendererUrl }),
  variable({ key: 'PDF_RENDERER_API_KEY', label: 'PDF renderer API key', isSecret: true }),
  variable({
    key: 'SEO_AUDIT_MAX_PAGES',
    label: 'Maximum pages per audit',
    type: 'NUMBER',
    value: '60',
  }),
  variable({
    key: 'SEO_AUDIT_AI_VISIBILITY',
    label: 'AI visibility check',
    description: 'Optional and paid.',
    type: 'SELECT',
    value: 'OFF',
    options: [
      { label: 'Off', value: 'OFF' },
      { label: 'On', value: 'ON' },
    ],
  }),
];

const givenWorkspace = ({
  apiKeyValue = '',
  dataForSeoLogin = '',
  dataForSeoPassword = '',
  pdfRendererUrl = '',
  audits = [] as unknown[],
  hasFinishedAudit = false,
} = {}) => {
  mocks.metadataQuery.mockResolvedValue({
    findOneApplication: { id: 'app-1', applicationVariables: buildVariables(apiKeyValue, dataForSeoLogin, dataForSeoPassword, pdfRendererUrl) },
  });
  mocks.metadataMutation.mockResolvedValue({});
  mocks.coreQuery.mockImplementation(async (query: { seoAudits: { __args: { filter?: unknown } } }) =>
    query.seoAudits.__args.filter === undefined
      ? { seoAudits: { edges: audits.map((node) => ({ node })) } }
      : { seoAudits: { edges: hasFinishedAudit ? [{ node: { id: 'done-1' } }] : [] } },
  );
  mocks.coreMutation.mockResolvedValue({ createSeoAudit: { id: 'audit-9' } });
  mocks.navigate.mockResolvedValue(undefined);
};

const stepStatus = async (title: string) => {
  const row = (await screen.findByText(title)).closest('li');

  return within(row as HTMLElement);
};

describe('SeoAuditSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('guides a fresh workspace: key and first audit are open, defaults are optional', async () => {
    givenWorkspace();
    render(<SeoAuditSettings />);

    expect((await stepStatus('Connect Anthropic')).getByText('To do')).toBeTruthy();
    expect((await stepStatus('Connect DataForSEO')).getByText('Optional')).toBeTruthy();
    expect((await stepStatus('Choose defaults')).getByText('Optional')).toBeTruthy();
    expect((await stepStatus('Set up PDF export')).getByText('Optional')).toBeTruthy();
    expect((await stepStatus('Run your first audit')).getByText('To do')).toBeTruthy();
    expect(screen.getByText('0 of 2 required steps done')).toBeTruthy();
    expect(screen.getByText('No Anthropic key yet')).toBeTruthy();
  });

  it('shows completed steps for a configured workspace', async () => {
    givenWorkspace({ apiKeyValue: 'sk-ant-••••1234', hasFinishedAudit: true });
    render(<SeoAuditSettings />);

    expect((await stepStatus('Connect Anthropic')).getByText('Done')).toBeTruthy();
    expect((await stepStatus('Run your first audit')).getByText('Done')).toBeTruthy();
    expect(screen.queryByText('No Anthropic key yet')).toBeNull();
  });

  it('marks DataForSEO as done once login and password are stored', async () => {
    givenWorkspace({ dataForSeoLogin: 'agency@example.com', dataForSeoPassword: '••••' });
    render(<SeoAuditSettings />);

    expect((await stepStatus('Connect DataForSEO')).getByText('Done')).toBeTruthy();
  });

  it('keeps DataForSEO optional when only the login is stored', async () => {
    givenWorkspace({ dataForSeoLogin: 'agency@example.com' });
    render(<SeoAuditSettings />);

    expect((await stepStatus('Connect DataForSEO')).getByText('Optional')).toBeTruthy();
  });

  it('marks PDF export as done once a renderer URL is stored', async () => {
    givenWorkspace({ pdfRendererUrl: 'http://gotenberg:3000' });
    render(<SeoAuditSettings />);

    expect((await stepStatus('Set up PDF export')).getByText('Done')).toBeTruthy();
  });

  it('saves the PDF renderer URL and the brand name', async () => {
    givenWorkspace();
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    const urlInput = await screen.findByLabelText('PDF renderer URL');

    await user.type(urlInput, 'http://gotenberg:3000');
    await user.click(within(urlInput.parentElement as HTMLElement).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mocks.metadataMutation).toHaveBeenCalledWith({
        updateOneApplicationVariable: {
          __args: { key: 'PDF_RENDERER_URL', value: 'http://gotenberg:3000', applicationId: 'app-1' },
        },
      }),
    );
    expect((await stepStatus('Set up PDF export')).getByText('Done')).toBeTruthy();

    const brandInput = screen.getByLabelText('Report brand name');

    await user.type(brandInput, 'Muster Agentur');
    await user.click(within(brandInput.parentElement as HTMLElement).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mocks.metadataMutation).toHaveBeenCalledWith({
        updateOneApplicationVariable: {
          __args: { key: 'SEO_AUDIT_BRAND_NAME', value: 'Muster Agentur', applicationId: 'app-1' },
        },
      }),
    );
  });

  it('saves the DataForSEO password as a secret variable', async () => {
    givenWorkspace({ dataForSeoLogin: 'agency@example.com' });
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    const passwordInput = await screen.findByLabelText('DataForSEO API password');

    await user.type(passwordInput, 'api-secret');
    await user.click(within(passwordInput.parentElement as HTMLElement).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mocks.metadataMutation).toHaveBeenCalledWith({
        updateOneApplicationVariable: {
          __args: { key: 'DATAFORSEO_PASSWORD', value: 'api-secret', applicationId: 'app-1' },
        },
      }),
    );
    expect((await stepStatus('Connect DataForSEO')).getByText('Done')).toBeTruthy();
  });

  it('saves the API key and marks the step as done', async () => {
    givenWorkspace();
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    const keyInput = await screen.findByLabelText('Anthropic API key');
    const saveButton = within(keyInput.parentElement as HTMLElement).getByRole('button', { name: 'Save' });

    expect((saveButton as HTMLButtonElement).disabled).toBe(true);

    await user.type(keyInput, ' sk-ant-secret ');
    await user.click(saveButton);

    await waitFor(() =>
      expect(mocks.metadataMutation).toHaveBeenCalledWith({
        updateOneApplicationVariable: {
          __args: { key: 'ANTHROPIC_API_KEY', value: 'sk-ant-secret', applicationId: 'app-1' },
        },
      }),
    );
    expect((await stepStatus('Connect Anthropic')).getByText('Done')).toBeTruthy();
    expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' }),
    );
  });

  it('reports a failed save and keeps the step open', async () => {
    givenWorkspace();
    mocks.metadataMutation.mockRejectedValue(new Error('forbidden'));
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    const keyInput = await screen.findByLabelText('Anthropic API key');

    await user.type(keyInput, 'sk-ant-secret');
    await user.click(within(keyInput.parentElement as HTMLElement).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error', message: 'Could not save Anthropic API key.' }),
      ),
    );
    expect((await stepStatus('Connect Anthropic')).getByText('To do')).toBeTruthy();
  });

  it('offers the AI visibility check on the Setup page and switches it on', async () => {
    givenWorkspace();
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    expect(await screen.findByText('AI visibility check')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Off', pressed: true })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'On' }));

    await waitFor(() =>
      expect(mocks.metadataMutation).toHaveBeenCalledWith({
        updateOneApplicationVariable: {
          __args: { key: 'SEO_AUDIT_AI_VISIBILITY', value: 'ON', applicationId: 'app-1' },
        },
      }),
    );
  });

  it('warns that the AI visibility check needs both keys and costs money', async () => {
    givenWorkspace();

    render(<SeoAuditSettings />);

    expect(await screen.findByText(/needs the Anthropic key and DataForSEO/)).toBeTruthy();
  });

  it('clamps the maximum pages before saving', async () => {
    givenWorkspace();
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    const pagesInput = await screen.findByLabelText('Maximum pages per audit');

    await user.clear(pagesInput);
    await user.type(pagesInput, '500');
    await user.click(within(pagesInput.parentElement as HTMLElement).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mocks.metadataMutation).toHaveBeenCalledWith({
        updateOneApplicationVariable: {
          __args: { key: 'SEO_AUDIT_MAX_PAGES', value: '60', applicationId: 'app-1' },
        },
      }),
    );
  });

  it('starts an audit for the entered website and opens its record', async () => {
    givenWorkspace({ apiKeyValue: 'sk-ant-••••1234' });
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    await user.type(await screen.findByLabelText('Website'), 'Example.com/about');
    await user.click(screen.getByRole('button', { name: 'Start audit' }));

    await waitFor(() => expect(mocks.coreMutation).toHaveBeenCalledTimes(1));
    expect(mocks.coreMutation.mock.calls[0][0].createSeoAudit.__args.data).toMatchObject({
      domain: 'https://example.com',
      status: 'QUEUED',
      language: 'DE',
    });
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith('/object/:objectNameSingular/:objectRecordId', {
        objectNameSingular: 'seoAudit',
        objectRecordId: 'audit-9',
      }),
    );
  });

  it('refuses a private address without creating an audit', async () => {
    givenWorkspace();
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    await user.type(await screen.findByLabelText('Website'), 'http://169.254.169.254');
    await user.click(screen.getByRole('button', { name: 'Start audit' }));

    expect(await screen.findByText('Audit not started')).toBeTruthy();
    expect(screen.getByText(/not a public hostname/)).toBeTruthy();
    expect(mocks.coreMutation).not.toHaveBeenCalled();
  });

  it('lists recent audits and opens one on click', async () => {
    givenWorkspace({
      audits: [
        { id: 'a1', name: 'example.com 2026-10-06', domain: 'https://example.com', status: 'DONE', score: 81, grade: 'B' },
        { id: 'a2', name: 'other.com 2026-10-06', domain: 'https://other.com', status: 'RUNNING', score: null, grade: null },
      ],
    });
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    expect(await screen.findByText('81/100 B')).toBeTruthy();
    expect(screen.getByText('RUNNING')).toBeTruthy();

    await user.click(screen.getByText('example.com 2026-10-06'));

    expect(mocks.navigate).toHaveBeenCalledWith('/object/:objectNameSingular/:objectRecordId', {
      objectNameSingular: 'seoAudit',
      objectRecordId: 'a1',
    });
  });

  it('shows an empty state instead of nothing when no audit exists yet', async () => {
    givenWorkspace();
    render(<SeoAuditSettings />);

    expect(await screen.findByText(/No audits yet/)).toBeTruthy();
  });

  it('puts running an audit above the configuration sections', async () => {
    givenWorkspace();
    render(<SeoAuditSettings />);

    const runAudit = await screen.findByText('Run an audit');
    const anthropic = screen.getByText('Anthropic');

    expect(
      runAudit.compareDocumentPosition(anthropic) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('marks a stored secret as saved without revealing it', async () => {
    givenWorkspace({ apiKeyValue: 'sk-ant-••••1234' });
    render(<SeoAuditSettings />);

    const keyInput = await screen.findByLabelText('Anthropic API key');
    const field = keyInput.closest('div')?.parentElement as HTMLElement;

    expect(within(field).getByText('Saved')).toBeTruthy();
    expect((keyInput as HTMLInputElement).value).toBe('');
  });

  it('does not mark an empty secret as saved', async () => {
    givenWorkspace();
    render(<SeoAuditSettings />);

    await screen.findByLabelText('Anthropic API key');

    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('connects each text input to its description for screen readers', async () => {
    givenWorkspace();
    render(<SeoAuditSettings />);

    const keyInput = await screen.findByLabelText('Anthropic API key');
    const descriptionId = keyInput.getAttribute('aria-describedby');

    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId as string)?.textContent).toBe(
      'Used by the page classifier.',
    );
  });

  it('jumps to the matching field when a setup step is selected', async () => {
    givenWorkspace();
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    await user.click(await screen.findByText('Connect Anthropic'));
    expect(document.activeElement).toBe(await screen.findByLabelText('Anthropic API key'));

    await user.click(screen.getByText('Set up PDF export'));
    expect(document.activeElement).toBe(screen.getByLabelText('PDF renderer URL'));

    await user.click(screen.getByText('Run your first audit'));
    expect(document.activeElement).toBe(screen.getByLabelText('Website'));
  });

  it('highlights a setup step while the pointer is over it', async () => {
    givenWorkspace();
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    const row = (await screen.findByText('Connect Anthropic')).closest('button') as HTMLElement;

    expect(row.getAttribute('style')).not.toContain('background-transparent-lighter');

    await user.hover(row);
    expect(row.getAttribute('style')).toContain('background-transparent-lighter');

    await user.unhover(row);
    expect(row.getAttribute('style')).not.toContain('background-transparent-lighter');
  });

  it('highlights a recent audit while the pointer is over it', async () => {
    givenWorkspace({
      audits: [
        { id: 'a1', name: 'example.com 2026-10-06', domain: 'https://example.com', status: 'DONE', score: 81, grade: 'B' },
      ],
    });
    const user = userEvent.setup();

    render(<SeoAuditSettings />);

    const row = (await screen.findByText('example.com 2026-10-06')).closest('button') as HTMLElement;

    await user.hover(row);

    expect(row.getAttribute('style')).toContain('background-transparent-lighter');
  });

  it('shows an error when the settings cannot be loaded', async () => {
    givenWorkspace();
    mocks.metadataQuery.mockRejectedValue(new Error('network'));

    render(<SeoAuditSettings />);

    expect(await screen.findByText('Settings could not be loaded')).toBeTruthy();
    expect(screen.getByText('network')).toBeTruthy();
  });
});
