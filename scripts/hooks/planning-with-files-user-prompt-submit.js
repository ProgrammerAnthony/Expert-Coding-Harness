#!/usr/bin/env node
/**
 * planning-with-files：userPromptSubmit
 *
 * 目标：
 * - 在用户提交提示词时，把 task_plan.md 的头部摘要与 progress.md 的尾部摘要注入 prompt
 * - 用于 /clear 之后快速恢复上下文
 *
 * 约束：
 * - 不阻断，不抛错
 * - 如果 task_plan.md 不存在则原样透传
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, log } = require('../lib/utils');

function safeReadLines(filePath, maxLines, fromEnd = false) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const slice = fromEnd ? lines.slice(Math.max(0, lines.length - maxLines)) : lines.slice(0, maxLines);
    return slice.join('\n').trimEnd();
  } catch {
    return '';
  }
}

function buildInjection(cwd) {
  const planPath = path.join(cwd, 'task_plan.md');
  if (!fs.existsSync(planPath)) return '';

  const planHead = safeReadLines(planPath, 50, false);
  const progressTail = safeReadLines(path.join(cwd, 'progress.md'), 20, true);

  const parts = [];
  parts.push('[planning-with-files] ACTIVE PLAN — current state:');
  if (planHead) parts.push(planHead);
  parts.push('');
  parts.push('=== recent progress ===');
  if (progressTail) parts.push(progressTail);
  parts.push('');
  parts.push('[planning-with-files] Read findings.md for research context. Continue from the current phase.');
  return parts.join('\n');
}

readStdin()
  .then(raw => {
    let input;
    try {
      input = JSON.parse(raw || '{}');
    } catch {
      process.stdout.write(raw);
      return;
    }

    const injection = buildInjection(process.cwd());
    if (!injection) {
      process.stdout.write(raw);
      return;
    }

    const marker = '[planning-with-files] ACTIVE PLAN';
    const basePrompt = String(input.prompt || input.content || input.message || '');
    if (basePrompt.includes(marker)) {
      process.stdout.write(raw);
      return;
    }

    const merged = basePrompt ? `${basePrompt}\n\n${injection}` : injection;

    // Cursor 事件字段可能是 prompt / content / message，这里以 prompt 优先回写
    if (typeof input.prompt === 'string' || input.prompt == null) {
      input.prompt = merged;
    } else if (typeof input.content === 'string' || input.content == null) {
      input.content = merged;
    } else if (typeof input.message === 'string' || input.message == null) {
      input.message = merged;
    } else {
      input.prompt = merged;
    }

    process.stdout.write(JSON.stringify(input));
  })
  .catch(err => {
    log(`[planning-with-files-userPromptSubmit] 异常（已忽略）：${err?.message || 'unknown'}`);
    process.exitCode = 0;
  });

