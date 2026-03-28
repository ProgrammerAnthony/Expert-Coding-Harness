#!/usr/bin/env node
/**
 * PreToolUse / beforeReadFile Hook：读取敏感文件时发出警告
 *
 * 跨平台（Windows、macOS、Linux）
 *
 * 当 AI 读取 .env、.key、.pem、credentials 等敏感文件时，
 * 向 stderr 输出警告。不阻断读取操作（exit 0）。
 *
 * 支持：Claude Code (PreToolUse Read) 和 Cursor (beforeReadFile)
 */

'use strict';

const { readStdin, log } = require('../lib/utils');

// 敏感文件匹配规则
const SENSITIVE_PATTERNS = [
  /\.env$/i,
  /\.env\./i,               // .env.local / .env.production 等
  /\.key$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /credentials/i,
  /secret/i,
  /private[-_]?key/i,
  /id_rsa/i,
  /id_ed25519/i,
  /\.aws\/credentials/i,
  /\.ssh\//i,
];

readStdin().then(raw => {
  try {
    const input = JSON.parse(raw);

    // Claude Code: tool_input.file_path；Cursor: path / file
    const filePath = (
      input.tool_input?.file_path ||
      input.path ||
      input.file ||
      ''
    ).toString();

    if (filePath && SENSITIVE_PATTERNS.some(p => p.test(filePath))) {
      log(`[Hook] ⚠️  警告：正在读取敏感文件：${filePath}`);
      log('[Hook] 请确认该文件内容不会被输出到日志或响应中。');
    }
  } catch {
    // 静默通过
  }

  process.stdout.write(raw);
  process.exit(0);
}).catch(() => process.exit(0));
