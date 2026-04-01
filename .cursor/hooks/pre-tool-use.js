#!/usr/bin/env node
'use strict';

const { readStdin, runExistingHookCapture } = require('./adapter');

/**
 * Cursor 薄适配层：转发到 scripts/hooks/planning-with-files-pre-tool-use.js
 */
readStdin().then(raw => {
  try {
    const result = runExistingHookCapture('planning-with-files-pre-tool-use.js', raw, { inheritStderr: true });
    process.stdout.write(result.ok && result.stdout ? result.stdout : raw);
  } catch {
    process.stdout.write(raw);
  }
}).catch(() => process.exit(0));

