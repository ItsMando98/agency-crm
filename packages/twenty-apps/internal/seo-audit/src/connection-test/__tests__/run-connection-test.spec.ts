import { describe, expect, it } from 'vitest';
import { CLASSIFIER_MODEL } from 'src/constants/classifier.const';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { createFakeAnthropicClient } from 'src/__mocks__/create-fake-anthropic-client.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { runConnectionTest } from 'src/connection-test/run-connection-test';

const PDF_BYTES = new TextEncoder().encode('%PDF-1.7 test');

describe('runConnectionTest', () => {
  describe('ANTHROPIC', () => {
    it('reports a missing key without calling Anthropic', async () => {
      const result = await runConnectionTest({ service: 'ANTHROPIC', anthropicClient: null });

      expect(result).toEqual({ status: 'NOT_CONFIGURED', message: 'No Anthropic key is saved yet.' });
    });

    it('asks the classifier model for one token and reports success', async () => {
      const { client, create } = createFakeAnthropicClient(() => ({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'ok' }],
      }));

      const result = await runConnectionTest({ service: 'ANTHROPIC', anthropicClient: client });

      expect(result.status).toBe('OK');
      expect(result.message).toContain(CLASSIFIER_MODEL);
      expect(create).toHaveBeenCalledWith(expect.objectContaining({ model: CLASSIFIER_MODEL, max_tokens: 1 }));
    });

    it('reports the reason when Anthropic refuses the key', async () => {
      const { client } = createFakeAnthropicClient(() => {
        throw Object.assign(new Error('invalid x-api-key'), { status: 401 });
      });

      const result = await runConnectionTest({ service: 'ANTHROPIC', anthropicClient: client });

      expect(result).toEqual({ status: 'FAILED', message: 'Anthropic refused the key: invalid x-api-key' });
    });

    it('reports a temporary outage as such', async () => {
      const { client } = createFakeAnthropicClient(() => {
        throw Object.assign(new Error('Overloaded'), { status: 529 });
      });

      const result = await runConnectionTest({ service: 'ANTHROPIC', anthropicClient: client });

      expect(result).toEqual({ status: 'FAILED', message: 'Anthropic could not be reached right now: Overloaded' });
    });
  });

  describe('DATAFORSEO', () => {
    it('reports a missing login', async () => {
      const result = await runConnectionTest({ service: 'DATAFORSEO', environment: { DATAFORSEO_LOGIN: 'login' } });

      expect(result).toEqual({ status: 'NOT_CONFIGURED', message: 'The DataForSEO login and password are not both saved yet.' });
    });

    it('shows the balance when the login works', async () => {
      const { fetchImplementation } = createRecordingFetch(() => ({
        json: buildDataForSeoEnvelope({ money: { balance: 12.345 } }),
      }));

      const result = await runConnectionTest({
        service: 'DATAFORSEO',
        environment: { DATAFORSEO_LOGIN: 'login', DATAFORSEO_PASSWORD: 'password' },
        fetchImplementation,
      });

      expect(result).toEqual({ status: 'OK', message: 'Login accepted. Balance: 12.35 USD.' });
    });

    it('flags a balance that is nearly used up', async () => {
      const { fetchImplementation } = createRecordingFetch(() => ({
        json: buildDataForSeoEnvelope({ money: { balance: 0.14 } }),
      }));

      const result = await runConnectionTest({
        service: 'DATAFORSEO',
        environment: { DATAFORSEO_LOGIN: 'login', DATAFORSEO_PASSWORD: 'password' },
        fetchImplementation,
      });

      expect(result).toEqual({ status: 'OK', message: 'Login accepted, but only 0.14 USD are left. Top up to keep market data.' });
    });

    it('explains why DataForSEO refuses the login', async () => {
      const { fetchImplementation } = createRecordingFetch(() => ({
        status: 401,
        json: { status_code: 40100, status_message: 'You are not authorized to access this resource.' },
      }));

      const result = await runConnectionTest({
        service: 'DATAFORSEO',
        environment: { DATAFORSEO_LOGIN: 'login', DATAFORSEO_PASSWORD: 'wrong' },
        fetchImplementation,
      });

      expect(result.status).toBe('FAILED');
      expect(result.message).toMatch(/not the account password/);
    });
  });

  describe('TREG', () => {
    it('reports a missing token', async () => {
      const result = await runConnectionTest({ service: 'TREG', environment: {} });

      expect(result).toEqual({ status: 'NOT_CONFIGURED', message: 'No treg token is saved yet.' });
    });

    it('checks the token against the free tool listing and sends the team', async () => {
      const { fetchImplementation, requests } = createRecordingFetch(() => ({ json: [] }));

      const result = await runConnectionTest({
        service: 'TREG',
        environment: { TREG_TOKEN: 'agent-token', TREG_ORG: 'landoo' },
        fetchImplementation,
      });

      expect(result).toEqual({ status: 'OK', message: 'Token accepted.' });
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('https://treg.to/tools');
      expect(requests[0].headers['x-treg-token']).toBe('agent-token');
      expect(requests[0].headers['x-treg-org']).toBe('landoo');
    });

    it('says when treg rejects the token', async () => {
      const { fetchImplementation } = createRecordingFetch(() => ({ status: 401, json: { error: 'unauthorized' } }));

      const result = await runConnectionTest({
        service: 'TREG',
        environment: { TREG_TOKEN: 'bad' },
        fetchImplementation,
      });

      expect(result).toEqual({
        status: 'FAILED',
        message: 'treg rejected the token. Create a new token and check the team name.',
      });
    });
  });

  describe('PDF_RENDERER', () => {
    it('reports a missing address', async () => {
      const result = await runConnectionTest({ service: 'PDF_RENDERER', environment: {} });

      expect(result).toEqual({ status: 'NOT_CONFIGURED', message: 'No PDF renderer address is saved yet.' });
    });

    it('renders a test page and sends the key', async () => {
      const fetchImplementation = (async (_url: string, init?: RequestInit) => {
        expect(new Headers(init?.headers).get('authorization')).toBe('Bearer renderer-key');

        return new Response(PDF_BYTES, { status: 200 });
      }) as unknown as typeof fetch;

      const result = await runConnectionTest({
        service: 'PDF_RENDERER',
        environment: { PDF_RENDERER_URL: 'https://pdf.example.com/', PDF_RENDERER_API_KEY: 'renderer-key' },
        fetchImplementation,
      });

      expect(result).toEqual({ status: 'OK', message: 'The renderer returned a PDF.' });
    });

    it('reports what the renderer answered when it fails', async () => {
      const fetchImplementation = (async () => new Response('nope', { status: 401 })) as unknown as typeof fetch;

      const result = await runConnectionTest({
        service: 'PDF_RENDERER',
        environment: { PDF_RENDERER_URL: 'https://pdf.example.com' },
        fetchImplementation,
      });

      expect(result).toEqual({ status: 'FAILED', message: 'PDF renderer answered with HTTP 401' });
    });
  });
});
