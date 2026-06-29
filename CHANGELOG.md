# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0.0] - 2026-05-11

### Added
- Supabase 환경변수 미설정 시 graceful fallback 처리 (`hasSupabaseConfig` 가드, API 라우트 전체 적용)
- `AboutChapterSnap` 컴포넌트 신규 추가 (스냅 스크롤 챕터 UI)
- `lib/supabase/config.ts` — Supabase 설정 유무 확인 헬퍼

### Changed
- 게시판 UX 개선: 해시태그 정비, `BoardAnchorNav` URL 해시 기반 초기 활성 탭 복원
- 치료 페이지 데이터 구조 정리 (cosmetic, implant, natural-tooth, orthodontics, pediatric)
- `TreatmentSection` / `TreatmentPage` 미디어 링크 연동
- 의사 프로필 카드 레이아웃 및 네비게이션 개선 (`DoctorProfileSection`)
- 자연치아 페이지 모션·영상 크기 조정
- 홈 `CleanSection`, `MediaSection` 콘텐츠 업데이트
- 공지 페이지(`app/notice/page.tsx`) 레이아웃 개편
- `globals.css` 스크롤바·공통 유틸 클래스 추가
- `setting.md` 프로젝트 설정 문서 업데이트
- 지도 이미지 최적화 (map-guide.png 3.5 MB → 3.5 MB 리샘플)

### Added (Assets)
- 의사 프로필 이미지 4장 추가 (`public/images/clinic/doctor_m (1-4).png`)
- 의사팀 모바일 이미지 추가 (`doctors-mobile-v2-crop.png`)
- 치료 케이스 이미지 추가 (`endo_1.jpg`)
