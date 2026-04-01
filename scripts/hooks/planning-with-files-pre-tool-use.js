#!/usr/bin/env node
/**
 * planning-with-files：preToolUse
 *
 * 目标：在每次工具调用前，把 task_plan.md 头部输出到 stderr（把目标拉回注意力窗口）。
 * 约束：不修改 payload，不阻断。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, log } = require('../lib/utils');

function readPlanHead(cwd) {
  const planPath = path.join(cwd, 'task_plan.md');
  if (!fs.existsSync(planPath)) return '';
  try {
    const text = fs.readFileSync(planPath, 'utf8');
    return text.split(/\r?\n/).slice(0, 30).join('\n').trimEnd();
  } catch {
    return '';
  }
}

readStdin()
  .then(raw => {
    const head = readPlanHead(process.cwd());
    if (head) process.stderr.write(head + '\n');
    process.stdout.write(raw);
  })
  .catch(err => {
    log(`[planning-with-files-preToolUse] 异常（已忽略）：${err?.message || 'unknown'}`);
    process.exitCode = 0;
  });

