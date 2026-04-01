# 检查 task_plan.md 的 Phase 是否全部 complete
# 约定：永远 exit 0；仅输出人类可读状态文本（Cursor stop 门禁由 Node hook 实现）

param(
    [string]$PlanFile = "task_plan.md"
)

if (-not (Test-Path $PlanFile)) {
    Write-Host '[planning-with-files] No task_plan.md found -- no active planning session.'
    exit 0
}

$content = Get-Content $PlanFile -Raw

$TOTAL = ([regex]::Matches($content, "### Phase")).Count
$COMPLETE = ([regex]::Matches($content, "\*\*Status:\*\* complete")).Count
$IN_PROGRESS = ([regex]::Matches($content, "\*\*Status:\*\* in_progress")).Count
$PENDING = ([regex]::Matches($content, "\*\*Status:\*\* pending")).Count

if ($COMPLETE -eq 0 -and $IN_PROGRESS -eq 0 -and $PENDING -eq 0) {
    $COMPLETE = ([regex]::Matches($content, "\[complete\]")).Count
    $IN_PROGRESS = ([regex]::Matches($content, "\[in_progress\]")).Count
    $PENDING = ([regex]::Matches($content, "\[pending\]")).Count
}

if ($COMPLETE -eq $TOTAL -and $TOTAL -gt 0) {
    Write-Host ('[planning-with-files] ALL PHASES COMPLETE (' + $COMPLETE + '/' + $TOTAL + '). If the user has additional work, add new phases to task_plan.md before starting.')
} else {
    Write-Host ('[planning-with-files] Task in progress (' + $COMPLETE + '/' + $TOTAL + ' phases complete). Update progress.md before stopping.')
    if ($IN_PROGRESS -gt 0) {
        Write-Host ('[planning-with-files] ' + $IN_PROGRESS + ' phase(s) still in progress.')
    }
    if ($PENDING -gt 0) {
        Write-Host ('[planning-with-files] ' + $PENDING + ' phase(s) pending.')
    }
}

exit 0

