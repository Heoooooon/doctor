#!/usr/bin/env bash
# VPS(172.237.29.96) 배포 스크립트 — egundc.com / jsdentad.mycafe24.com (/opt/seoulegundc, pm2: seoulegundc, 포트 3000)
#
# 주의사항 (2026-07-06 첫 배포에서 확인된 함정들):
# - appuser의 홈 디렉터리가 /opt/seoulegundc 그 자체다. rsync --delete가 홈의
#   .pm2/.cache/.profile 등을 지우면 pm2가 통째로 죽는다 → 아래 --exclude 필수.
# - .codegraph 는 맥 로컬 도구의 심볼릭 링크라 서버에서 깨진 링크가 되어
#   next build(Turbopack)가 ENOENT로 실패한다 → 제외.
# - pnpm 11은 sharp 빌드 승인(pnpm-workspace.yaml의 allowBuilds)이 필요하다.
# - 2026-07-23 egundc.com 도메인 전환 완료: nginx가 두 도메인 모두 3000으로 프록시.
#   구버전 앱(pm2 seoulegun, 3001, /var/www/seoulegun)은 pm2에서 제거됨(파일은 보존).
#   pm2 delete all 절대 금지 — seoulegundc만 다룬다.
set -euo pipefail

SERVER="root@172.237.29.96"
REMOTE_APP="/opt/seoulegundc"
cd "$(dirname "$0")/.."

echo "== 1/5 로컬 빌드 테스트 =="
npm run build

echo "== 2/5 서버 백업 =="
ssh "$SERVER" "cd $REMOTE_APP && tar -czf /root/seoulegundc-backup-\$(date +%Y%m%d-%H%M).tar.gz . 2>/dev/null || true"

echo "== 3/5 업로드 =="
rsync -az --delete \
  --exclude node_modules \
  --exclude .next/cache \
  --exclude .git \
  --exclude ".env*" \
  --exclude .vercel \
  --exclude .claude \
  --exclude .codegraph \
  --exclude .DS_Store \
  --exclude ".pm2" \
  --exclude ".cache" \
  --exclude ".config" \
  --exclude ".local" \
  --exclude ".npm" \
  --exclude ".pnpm-store" \
  --exclude ".profile" \
  --exclude ".bashrc" \
  --exclude ".gstack" \
  --exclude ".ssh" \
  ./ "$SERVER:$REMOTE_APP/"

echo "== 4/5 권한 + 서버 빌드 =="
ssh "$SERVER" "chown -R appuser:appuser $REMOTE_APP && su - appuser -c 'cd $REMOTE_APP && pnpm install --prod=false && NODE_OPTIONS=--max-old-space-size=1536 pnpm build'"

echo "== 5/5 재시작 + 확인 =="
ssh "$SERVER" "su - appuser -c 'pm2 restart seoulegundc --update-env && pm2 save'"
sleep 3
curl -s -o /dev/null -w "https://egundc.com -> %{http_code}\n" https://egundc.com/
curl -s -o /dev/null -w "https://jsdentad.mycafe24.com -> %{http_code}\n" https://jsdentad.mycafe24.com/
echo "배포 완료"
