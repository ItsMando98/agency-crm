import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SEO_AUDIT_SKILL_CONTENT } from 'src/constants/seo-audit-skill-content.const';
import seoAuditSkill from 'src/skills/seo-audit.skill';

const LOGIC_FUNCTIONS_DIRECTORY = join(__dirname, '..', '..', 'logic-functions');
const EXTERNAL_SKILL_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  '..',
  'twenty-claude-skills',
  'skills',
  'seo-audit',
  'SKILL.md',
);

const loadToolNames = async (): Promise<string[]> => {
  const fileNames = readdirSync(LOGIC_FUNCTIONS_DIRECTORY).filter((fileName) => fileName.endsWith('.ts'));
  const modules = await Promise.all(
    fileNames.map((fileName) => import(`src/logic-functions/${fileName.replace(/\.ts$/, '')}`)),
  );

  return modules
    .map((module) => module.default.config)
    .filter((config) => config.toolTriggerSettings !== undefined)
    .map((config) => config.name as string);
};

describe('seo-audit skill', () => {
  it('is defined with the content', () => {
    expect(seoAuditSkill.config).toMatchObject({
      name: 'seo-audit',
      content: SEO_AUDIT_SKILL_CONTENT,
    });
  });

  it('mentions every agent tool by the name agents see', async () => {
    const toolNames = await loadToolNames();

    expect(toolNames.length).toBeGreaterThanOrEqual(7);

    for (const toolName of toolNames) {
      expect(SEO_AUDIT_SKILL_CONTENT).toContain(`app_${toolName}`);
    }
  });

  it('is mirrored for external agents with every tool name', async () => {
    const externalSkill = readFileSync(EXTERNAL_SKILL_PATH, 'utf8');

    expect(externalSkill).toMatch(/^---\nname: seo-audit\n/);
    expect(externalSkill).toContain('learn_tools');
    expect(externalSkill).toContain('execute_tool');

    for (const toolName of await loadToolNames()) {
      expect(externalSkill).toContain(toolName);
    }
  });
});
