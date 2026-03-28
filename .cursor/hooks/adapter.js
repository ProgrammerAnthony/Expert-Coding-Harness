#!/usr/bin/env node
/**
 * Cursor → Claude Code Hook 格式适配器
 *
 * Cursor 的 hook 事件通过 stdin 传入的 JSON 字段名与 Claude Code 不同。
 * 此模块将 Cursor 格式统一转换为 Claude Code 格式，
 * 让 scripts/hooks/*.js 无需修改即可在两个平台复用。
 *
 * Cursor stdin 格式示例（beforeSubmitPrompt）：
 *   { "prompt": "...", "conversation_id": "...", "hook_event_name": "beforeSubmitPrompt" }
 *
 * Claude Code stdin 格式示例（PreToolUse）：
 *   { "tool_name": "...", "tool_input": { "file_path": "..." } }
 */

'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const MAX_STDIN = 1024 * 1024; // 1MB

/**
 * 从 stdin 读取完整数据
 */
function readStdin() {
  return new Promise(resolve => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

/**
 * 获取项目根目录（相对于 .cursor/hooks/ 向上两层）
 */
function getProjectRoot() {
  // .cursor/hooks/ -> .cursor/ -> 项目根
  return path.resolve(__dirname, '..', '..');
}

/**
 * 将 Cursor 格式的 JSON 转换为 Claude Code hook 格式
 */
function transformToClaude(cursorInput, overrides = {}) {
  return {
    tool_input: {
      // beforeReadFile / beforeTabFileRead
      file_path: cursorInput.path || cursorInput.file || cursorInput.args?.filePath || '',
      // beforeSubmitPrompt
      prompt: cursorInput.prompt || cursorInput.content || cursorInput.message || '',
      // beforeShellExecution
      command: cursorInput.command || cursorInput.args?.command || '',
      ...overrides.tool_input,
    },
    tool_output: {
      output: cursorInput.output || cursorInput.result || '',
      ...overrides.tool_output,
    },
    // 保留 Cursor 原始元数据，供脚本需要时使用
    _cursor: {
      conversation_id: cursorInput.conversation_id,
      hook_event_name: cursorInput.hook_event_name,
      workspace_roots: cursorInput.workspace_roots,
    },
  };
}

/**
 * 调用 scripts/hooks/ 中的脚本
 * @param {string} scriptName - 脚本文件名（相对于 scripts/hooks/）
 * @param {string} stdinData  - 传给脚本的 stdin 内容
 */
function runHookScript(scriptName, stdinData) {
  // 核心脚本位于项目根的 scripts/hooks/ 目录下（对标 ECC 的 scripts/hooks/）
  const scriptPath = path.join(getProjectRoot(), 'scripts', 'hooks', scriptName);
  try {
    execFileSync(process.execPath, [scriptPath], {
      input: typeof stdinData === 'string' ? stdinData : JSON.stringify(stdinData),
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
      cwd: process.cwd(),
    });
  } catch (e) {
    // 转发阻断信号（exit code 2）
    if (e.status === 2) process.exit(2);
    // 其他错误静默忽略，不阻断 Cursor 正常流程
  }
}

module.exports = { readStdin, getProjectRoot, transformToClaude, runHookScript };
