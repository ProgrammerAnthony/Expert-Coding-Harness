#!/usr/bin/env node
/**
 * Cursor beforeSubmitPrompt Hook
 * 提交提示词前检测 API Key / Token 等敏感凭证
 */
'use strict';

const { readStdin, transformToClaude, runHookScript } = require('./adapter');

readStdin().then(raw => {
  try {
    const input = JSON.parse(raw || '{}');
    const claudeInput = transformToClaude(input, {
      tool_input: { prompt: input.prompt || input.content || input.message || '' }
    });
    runHookScript('check-secrets.js', JSON.stringify(claudeInput));
  } catch {}
  process.stdout.write(raw);
}).catch(() => process.exit(0));
