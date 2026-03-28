#!/usr/bin/env node
/**
 * PreToolUse / beforeSubmitPrompt Hook：检测提示词中的敏感密钥
 *
 * 跨平台（Windows、macOS、Linux）
 *
 * 扫描用户提示词中的常见 API Key、Token、私钥模式。
 * 发现后输出警告到 stderr，但不阻断（exit 0）——
 * 警告可见，用户自行决定是否继续。
 *
 * 支持：Claude Code (PreToolUse) 和 Cursor (beforeSubmitPrompt)
 */

'use strict';

const { readStdin, log } = require('../lib/utils');

// 常见密钥模式
const SECRET_PATTERNS = [
  { name: 'OpenAI API Key',         pattern: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'GitHub Personal Token',  pattern: /ghp_[a-zA-Z0-9]{36,}/ },
  { name: 'GitHub OAuth Token',     pattern: /gho_[a-zA-Z0-9]{36,}/ },
  { name: 'AWS Access Key',         pattern: /AKIA[A-Z0-9]{16}/ },
  { name: 'Slack Token',            pattern: /xox[bpsa]-[a-zA-Z0-9-]+/ },
  { name: 'Anthropic API Key',      pattern: /sk-ant-[a-zA-Z0-9\-_]{40,}/ },
  { name: 'Private Key',            pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Google API Key',         pattern: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Stripe Secret Key',      pattern: /sk_live_[0-9a-zA-Z]{24,}/ },
];

readStdin().then(raw => {
  try {
    const input = JSON.parse(raw);

    // Claude Code: tool_input.prompt 或 content；Cursor: prompt/content/message
    const text = [
      input.prompt,
      input.content,
      input.message,
      input.tool_input?.prompt,
      input.tool_input?.content,
    ].filter(Boolean).join('\n');

    let found = false;
    for (const { name, pattern } of SECRET_PATTERNS) {
      if (pattern.test(text)) {
        if (!found) {
          log('[Hook] ⚠️  警告：提示词中检测到疑似敏感凭证！');
        }
        log(`[Hook]   - 发现 ${name} 模式`);
        found = true;
      }
    }

    if (found) {
      log('[Hook] 请在提交前移除密钥，改用环境变量或密钥管理工具。');
    }
  } catch {
    // 解析失败时静默通过，不阻断正常流程
  }

  // 始终输出原始数据，保持 hook 链路畅通
  process.stdout.write(raw);
  process.exit(0);
}).catch(() => process.exit(0));
