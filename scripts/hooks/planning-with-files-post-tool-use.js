#!/usr/bin/env node
/**
 * planning-with-files：postToolUse
 *
 * 目标：当发生 Write/Edit 后，提醒更新 progress.md 与 task_plan.md 的 Phase 状态。
 * 约束：不修改 payload，不阻断。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, log } = require('../lib/utils');

function hasPlan(cwd) {
  return fs.existsSync(path.join(cwd, 'task_plan.md'));
}

readStdin()
  .then(raw => {
    if (hasPlan(process.cwd())) {
      process.stderr.write(
        '[planning-with-files] 文件已修改：请更新 progress.md 记录你做了什么；若某个 Phase 已完成，请同步更新 task_plan.md 的 Status。\n'
      );
    }
    process.stdout.write(raw);
  })
  .catch(err => {
    log(`[planning-with-files-postToolUse] 异常（已忽略）：${err?.message || 'unknown'}`);
    process.exitCode = 0;
  });

