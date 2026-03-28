#!/usr/bin/env node
/**
 * PostToolUse / afterFileEdit Hook：编辑文件后检查 console.log
 *
 * 跨平台（Windows、macOS、Linux）
 *
 * 当 AI 编辑 JS/TS 文件后，扫描被编辑文件中的 console.log 语句，
 * 输出行号和内容，提醒在提交前清理调试代码。
 * 不阻断操作（exit 0）。
 *
 * 支持：Claude Code (PostToolUse Edit) 和 Cursor (afterFileEdit)
 */

'use strict';

const { readStdin, readFile, log } = require('../lib/utils');

// 不检查 console.log 的文件（测试、配置文件中的 console.log 是有意为之）
const EXCLUDED_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.config\.[jt]s$/,
  /scripts[/\\]/,
  /__tests__[/\\]/,
  /__mocks__[/\\]/,
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

    if (!filePath) {
      process.stdout.write(raw);
      process.exit(0);
    }

    // 只检查 JS/TS 文件
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) {
      process.stdout.write(raw);
      process.exit(0);
    }

    // 跳过排除列表
    if (EXCLUDED_PATTERNS.some(p => p.test(filePath))) {
      process.stdout.write(raw);
      process.exit(0);
    }

    const content = readFile(filePath);
    if (!content) {
      process.stdout.write(raw);
      process.exit(0);
    }

    const lines = content.split('\n');
    const matches = [];
    lines.forEach((line, idx) => {
      if (/console\.log/.test(line)) {
        matches.push(`  第 ${idx + 1} 行: ${line.trim()}`);
      }
    });

    if (matches.length > 0) {
      log(`[Hook] ⚠️  发现 console.log：${filePath}`);
      matches.slice(0, 5).forEach(m => log(m));
      if (matches.length > 5) {
        log(`[Hook]   ...共 ${matches.length} 处，提交前请清理`);
      } else {
        log('[Hook] 提交前请移除 console.log 调试语句。');
      }
    }
  } catch {
    // 静默通过
  }

  process.stdout.write(raw);
  process.exit(0);
}).catch(() => process.exit(0));
