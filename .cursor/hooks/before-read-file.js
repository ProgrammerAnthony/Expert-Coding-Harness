#!/usr/bin/env node
/**
 * Cursor beforeReadFile Hook
 * 读取敏感文件（.env/.key/.pem 等）时发出警告
 */
'use strict';

const { readStdin, transformToClaude, runHookScript } = require('./adapter');

readStdin().then(raw => {
  try {
    const input = JSON.parse(raw || '{}');
    const claudeInput = transformToClaude(input, {
      tool_input: { file_path: input.path || input.file || '' }
    });
    runHookScript('warn-sensitive-file.js', JSON.stringify(claudeInput));
  } catch {}
  process.stdout.write(raw);
}).catch(() => process.exit(0));
