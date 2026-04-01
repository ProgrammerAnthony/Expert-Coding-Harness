#!/usr/bin/env python3
"""
planning-with-files：会话追溯（session catchup）

用途：
- 当你怀疑“上次会话里做了很多事，但没有及时更新 task_plan.md/progress.md/findings.md”时，
  用这个脚本从历史会话记录里抽取“规划文件最后一次更新之后的未同步内容”，用于补写规划文件。

说明：
- 该脚本最初来自 planning-with-files 开源实现，这里保留其核心逻辑，仅补充中文说明。
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

PLANNING_FILES = ["task_plan.md", "progress.md", "findings.md"]


def normalize_path(project_path: str) -> str:
    """把项目路径规范化，以匹配会话存储目录的命名规则。"""
    p = project_path

    # Git Bash / MSYS2: /c/Users/... -> C:/Users/...
    if len(p) >= 3 and p[0] == "/" and p[2] == "/":
        p = p[1].upper() + ":" + p[2:]

    try:
        resolved = str(Path(p).resolve())
        if os.name == "nt" or "\\" in resolved:
            p = resolved
    except (OSError, ValueError):
        pass

    return p


def get_project_dir(project_path: str) -> Tuple[Optional[Path], Optional[str]]:
    """推导当前项目对应的会话存储目录（Claude Code 兼容逻辑）。"""
    normalized = normalize_path(project_path)

    sanitized = normalized.replace("\\", "-").replace("/", "-").replace(":", "-")
    sanitized = sanitized.replace("_", "-")
    if sanitized.startswith("-"):
        sanitized = sanitized[1:]

    claude_path = Path.home() / ".claude" / "projects" / sanitized

    script_path = Path(__file__).as_posix().lower()
    is_codex_variant = "/.codex/" in script_path
    codex_sessions_dir = Path.home() / ".codex" / "sessions"
    if is_codex_variant and codex_sessions_dir.exists() and not claude_path.exists():
        return None, (
            "[planning-with-files] Session catchup skipped: Codex stores sessions "
            "in ~/.codex/sessions and native Codex parsing is not implemented yet."
        )

    return claude_path, None


def get_sessions_sorted(project_dir: Path) -> List[Path]:
    """按修改时间倒序获取会话文件（越新越靠前）。"""
    sessions = list(project_dir.glob("*.jsonl"))
    main_sessions = [s for s in sessions if not s.name.startswith("agent-")]
    return sorted(main_sessions, key=lambda p: p.stat().st_mtime, reverse=True)


def parse_session_messages(session_file: Path) -> List[Dict]:
    """解析 jsonl 会话消息。"""
    messages = []
    with open(session_file, "r", encoding="utf-8", errors="replace") as f:
        for line_num, line in enumerate(f):
            try:
                data = json.loads(line)
                data["_line_num"] = line_num
                messages.append(data)
            except json.JSONDecodeError:
                pass
    return messages


def find_last_planning_update(messages: List[Dict]) -> Tuple[int, Optional[str]]:
    """找到最后一次写入/编辑规划文件的消息行号与文件名。"""
    last_update_line = -1
    last_update_file = None

    for msg in messages:
        if msg.get("type") != "assistant":
            continue

        content = msg.get("message", {}).get("content", [])
        if not isinstance(content, list):
            continue

        for item in content:
            if item.get("type") != "tool_use":
                continue

            tool_name = item.get("name", "")
            tool_input = item.get("input", {})
            if tool_name not in ("Write", "Edit"):
                continue

            file_path = tool_input.get("file_path", "")
            for pf in PLANNING_FILES:
                if file_path.endswith(pf):
                    last_update_line = msg["_line_num"]
                    last_update_file = pf

    return last_update_line, last_update_file


def extract_messages_after(messages: List[Dict], after_line: int) -> List[Dict]:
    """抽取规划文件最后更新之后的（用户/助手）消息摘要。"""
    result = []
    for msg in messages:
        if msg["_line_num"] <= after_line:
            continue

        msg_type = msg.get("type")
        is_meta = msg.get("isMeta", False)

        if msg_type == "user" and not is_meta:
            content = msg.get("message", {}).get("content", "")
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and item.get("type") == "text":
                        content = item.get("text", "")
                        break
                else:
                    content = ""

            if content and isinstance(content, str):
                if content.startswith(("<local-command", "<command-", "<task-notification")):
                    continue
                if len(content) > 20:
                    result.append({"role": "user", "content": content, "line": msg["_line_num"]})

        elif msg_type == "assistant":
            msg_content = msg.get("message", {}).get("content", "")
            text_content = ""
            tool_uses = []

            if isinstance(msg_content, str):
                text_content = msg_content
            elif isinstance(msg_content, list):
                for item in msg_content:
                    if item.get("type") == "text":
                        text_content = item.get("text", "")
                    elif item.get("type") == "tool_use":
                        tool_name = item.get("name", "")
                        tool_input = item.get("input", {})
                        if tool_name == "Edit":
                            tool_uses.append(f"Edit: {tool_input.get('file_path', 'unknown')}")
                        elif tool_name == "Write":
                            tool_uses.append(f"Write: {tool_input.get('file_path', 'unknown')}")
                        elif tool_name == "Bash":
                            cmd = tool_input.get("command", "")[:80]
                            tool_uses.append(f"Bash: {cmd}")
                        else:
                            tool_uses.append(f"{tool_name}")

            if text_content or tool_uses:
                result.append(
                    {
                        "role": "assistant",
                        "content": text_content[:600] if text_content else "",
                        "tools": tool_uses,
                        "line": msg["_line_num"],
                    }
                )

    return result


def main():
    project_path = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()

    has_planning_files = any(Path(project_path, f).exists() for f in PLANNING_FILES)
    if not has_planning_files:
        return

    project_dir, skip_reason = get_project_dir(project_path)
    if skip_reason:
        print(skip_reason)
        return

    if not project_dir.exists():
        return

    sessions = get_sessions_sorted(project_dir)
    if not sessions:
        return

    target_session = None
    for session in sessions:
        if session.stat().st_size > 5000:
            target_session = session
            break

    if not target_session:
        return

    messages = parse_session_messages(target_session)
    last_update_line, last_update_file = find_last_planning_update(messages)

    if last_update_line < 0:
        return

    messages_after = extract_messages_after(messages, last_update_line)
    if not messages_after:
        return

    print("\n[planning-with-files] SESSION CATCHUP DETECTED")
    print(f"Previous session: {target_session.stem}")
    print(f"Last planning update: {last_update_file} at message #{last_update_line}")
    print(f"Unsynced messages: {len(messages_after)}")

    print("\n--- UNSYNCED CONTEXT ---")
    for msg in messages_after[-15:]:
        if msg["role"] == "user":
            print(f"USER: {msg['content'][:300]}")
        else:
            if msg.get("content"):
                print(f"ASSISTANT: {msg['content'][:300]}")
            if msg.get("tools"):
                print(f"  Tools: {', '.join(msg['tools'][:4])}")

    print("\n--- RECOMMENDED ---")
    print("1. Run: git diff --stat")
    print("2. Read: task_plan.md, progress.md, findings.md")
    print("3. Update planning files based on above context")
    print("4. Continue with task")


if __name__ == "__main__":
    main()

