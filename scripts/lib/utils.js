/**
 * 跨平台工具函数库（适用于 Claude Code 和 Cursor hooks）
 * 支持 Windows、macOS、Linux
 *
 * 参考自 everything-claude-code，针对本项目精简后的版本
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';

/**
 * 读取文件内容，失败返回 null
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * 向 stderr 输出日志（在 Claude Code 和 Cursor 中均可见）
 */
function log(message) {
  console.error(message);
}

/**
 * 检查当前目录是否为 git 仓库
 */
function isGitRepo() {
  const result = spawnSync('git', ['rev-parse', '--git-dir'], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  return result.status === 0;
}

/**
 * 获取 git 中已修改的文件列表
 * @param {string[]} patterns - 用于过滤的正则表达式字符串数组
 * @returns {string[]} 修改过的文件路径数组
 */
function getGitModifiedFiles(patterns = []) {
  if (!isGitRepo()) return [];

  const result = spawnSync('git', ['diff', '--name-only', 'HEAD'], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (result.status !== 0) return [];

  let files = (result.stdout || '').split('\n').filter(Boolean);

  if (patterns.length > 0) {
    const compiled = patterns.map(p => {
      try { return new RegExp(p); } catch { return null; }
    }).filter(Boolean);
    if (compiled.length > 0) {
      files = files.filter(f => compiled.some(rx => rx.test(f)));
    }
  }

  return files;
}

/**
 * 从 stdin 读取完整内容（同步式，适合 hooks 场景）
 * @returns {Promise<string>} stdin 的完整字符串内容
 */
function readStdin() {
  const MAX = 1024 * 1024; // 1MB
  return new Promise(resolve => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      if (data.length < MAX) data += chunk.substring(0, MAX - data.length);
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

module.exports = {
  isWindows,
  readFile,
  log,
  isGitRepo,
  getGitModifiedFiles,
  readStdin,
};
