#!/usr/bin/env node
/**
 * Cursor afterFileEdit Hook
 * 编辑文件后检查 console.log 语句
 */
'use strict';

const { readStdin, transformToClaude, runHookScript } = require('./adapter');

readStdin().then(raw => {
  try {
    const input = JSON.parse(raw || '{}');
    const claudeInput = transformToClaude(input, {
      tool_input: { file_path: input.path || input.file || '' }
    });
    runHookScript('post-edit-checks.js', JSON.stringify(claudeInput));
  } catch {}
  process.stdout.write(raw);
}).catch(() => process.exit(0));
