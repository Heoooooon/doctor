#!/usr/bin/env bash
# 유일한 VPS 배포 진입점. 승인·최초 전환·복구 기준: docs/ops-handoff.md
# 미커밋 작업본과 운영 폴더 직접 덮어쓰기는 허용하지 않는다.
set -euo pipefail
cd "$(dirname "$0")/.."
exec node scripts/deploy-vps.mjs "$@"
