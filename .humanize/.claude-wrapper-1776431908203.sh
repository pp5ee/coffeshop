#!/bin/sh
cd '/app/workspaces/760ad51f-54b1-4ddc-a8c3-dd3eecaf0f2d' || exit 1
exec 'claude' '--dangerously-skip-permissions' '--print' '/humanize:start-rlcr-loop docs/plan.md --max 10 --yolo --codex-model gpt-5.4:high --full-review-round 5 --track-plan-file --agent-teams --push-every-round'
