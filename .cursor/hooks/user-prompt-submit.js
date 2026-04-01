#!/usr/bin/env node
'use strict';

const { readStdin, runExistingHookCapture } = require('./adapter');

/**
 * Cursor 薄适配层：
 * - 读取 stdin 的 Cursor 事件 JSON
 * - 转发到 scripts/hooks/planning-with-files-user-prompt-submit.js
 * - 透传 stdout（允许该脚本修改 prompt）
 */
readStdin().then(raw => {
  try {
    const result = runExistingHookCapture('planning-with-files-user-prompt-submit.js', raw, { inheritStderr: false });
    if (result.ok && result.stdout) {
      process.stdout.write(result.stdout);
    } else {
      process.stdout.write(raw);
    }
  } catch {
    // 任意异常都不阻断：回退为原样透传
    process.stdout.write(raw);
  }
}).catch(() => process.exit(0));

