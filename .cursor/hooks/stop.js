#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { readStdin, runExistingHook, transformToClaude, hookEnabled } = require('./adapter');

function countMatches(text, re) {
  try {
    const m = text.match(re);
    return m ? m.length : 0;
  } catch {
    return 0;
  }
}

function computePlanningStatus(cwd) {
  const planPath = path.join(cwd, 'task_plan.md');
  if (!fs.existsSync(planPath)) return null;

  let content = '';
  try {
    content = fs.readFileSync(planPath, 'utf8');
  } catch {
    return null;
  }

  const total = countMatches(content, /### Phase\b/g);
  let complete = countMatches(content, /\*\*Status:\*\*\s*complete\b/g);
  let inProgress = countMatches(content, /\*\*Status:\*\*\s*in_progress\b/g);
  let pending = countMatches(content, /\*\*Status:\*\*\s*pending\b/g);

  // 兼容 [complete] / [in_progress] / [pending] 写法
  if (complete === 0 && inProgress === 0 && pending === 0) {
    complete = countMatches(content, /\[complete\]/g);
    inProgress = countMatches(content, /\[in_progress\]/g);
    pending = countMatches(content, /\[pending\]/g);
  }

  return { total, complete, inProgress, pending };
}

function applyPlanningGate(input, status) {
  if (!status) return input;
  if (!status.total || status.total <= 0) return input;

  const isDone = status.complete === status.total;
  const followup = isDone
    ? `[planning-with-files] ALL PHASES COMPLETE (${status.complete}/${status.total}). 如有新增工作，请先在 task_plan.md 里追加新的 Phase 再开始。`
    : `[planning-with-files] 任务未完成（已完成 ${status.complete}/${status.total}）。请先更新 progress.md，然后回读 task_plan.md，继续完成剩余 Phase。`;

  // Cursor stop hook 使用 followup_message 触发自动继续（loop_limit 在 hooks.json 配置）
  if (!input.followup_message) input.followup_message = followup;
  return input;
}

readStdin().then(raw => {
  let input;
  try {
    input = JSON.parse(raw || '{}');
  } catch {
    process.stdout.write(raw);
    return;
  }

  // planning-with-files 门禁：优先决定“能不能停”
  const planningStatus = computePlanningStatus(process.cwd());
  input = applyPlanningGate(input, planningStatus);

  const claudeInput = transformToClaude(input);

  if (hookEnabled('stop:check-console-log', ['standard', 'strict'])) {
    runExistingHook('check-console-log.js', claudeInput);
  }
  if (hookEnabled('stop:session-end', ['minimal', 'standard', 'strict'])) {
    runExistingHook('session-end.js', claudeInput);
  }
  if (hookEnabled('stop:cost-tracker', ['minimal', 'standard', 'strict'])) {
    runExistingHook('cost-tracker.js', claudeInput);
  }

  process.stdout.write(JSON.stringify(input));
}).catch(() => process.exit(0));
