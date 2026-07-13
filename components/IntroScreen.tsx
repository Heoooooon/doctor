'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { markIntroEnded, startPopupPrefetch } from '@/lib/slide-popup-prefetch';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// 새로고침/최초 진입에는 항상 인트로를 재생하고, 같은 페이지 로드 안에서
// 다른 페이지 갔다 홈으로 복귀할 때만 스킵한다.
// (모듈 스코프 변수는 전체 페이지 로드마다 초기화되므로 새로고침 = 항상 재생)
let introPlayedThisPageLoad = false;

const SplitText = ({ text, colorShadow = false }: { text: string; colorShadow?: boolean }) => {
  return (
    <>
      {text.split('').map((char, i) =>
        char === ' ' ? (
          <span key={i} className="gap"> </span>
        ) : (
          <span key={i} className={colorShadow ? 'color-shadow' : ''}>
            {char}
          </span>
        )
      )}
    </>
  );
};

export default function IntroScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const closingRef = useRef(false);
  const isReplayRef = useRef(false);
  const restoreScrollRef = useRef<() => void>(() => {});
  const removeListenersRef = useRef<() => void>(() => {});
  const teardownRef = useRef<() => void>(() => {});
  const closeTimerRef = useRef<number | null>(null);

  // 이번 페이지 로드에서 이미 재생했으면 페인트 전에 즉시 숨김 → 내부 이동 복귀 시 재생/깜빡임 방지
  useIsoLayoutEffect(() => {
    if (introPlayedThisPageLoad) setVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    // 더 이상 스크롤을 가로채지 않도록 리스너 즉시 제거 (해제 후 스크롤 정상화)
    removeListenersRef.current();
    setFadeOut(true);
    // fade 시작 시점에 팝업 트리거 → 인트로가 사라지는 동안 이미 프리페치된 팝업 표시
    // sticky 플래그로 리스너 remount 시 이벤트 유실 방지
    if (!isReplayRef.current) {
      markIntroEnded();
      window.dispatchEvent(new Event('egun:intro-end'));
    }
    closeTimerRef.current = window.setTimeout(() => {
      restoreScrollRef.current();
      setVisible(false);
    }, 800);
  }, []);

  // 인트로 재생: 스크롤 잠금 + 해제 제스처 리스너 + 자동 해제 타이머 설정
  const runIntro = useCallback((opts?: { replay?: boolean }) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    closingRef.current = false;
    isReplayRef.current = Boolean(opts?.replay);
    setFadeOut(false);
    setVisible(true);

    // 인트로 시작과 동시에 팝업 API·이미지 프리페치 (종료 시 지연 제거)
    if (!opts?.replay) {
      void startPopupPrefetch();
    }

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;

    // 인트로 시작: 항상 최상단 + 배경 스크롤 잠금(섹션이 뒤로 밀려 올라가는 것 방지)
    window.scrollTo(0, 0);
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    restoreScrollRef.current = () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };

    // 스크롤/터치/휠 제스처 → 인트로 해제 (기본 스크롤은 차단)
    const onIntent = (e: Event) => {
      if (e.cancelable) e.preventDefault();
      handleClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Spacebar', 'Enter'].includes(e.key)) {
        handleClose();
      }
    };

    window.addEventListener('wheel', onIntent, { passive: false });
    window.addEventListener('touchmove', onIntent, { passive: false });
    window.addEventListener('keydown', onKey);
    removeListenersRef.current = () => {
      window.removeEventListener('wheel', onIntent);
      window.removeEventListener('touchmove', onIntent);
      window.removeEventListener('keydown', onKey);
    };

    // 입력이 없으면 3초 후 자동 해제
    const timer = window.setTimeout(handleClose, 3000);

    teardownRef.current = () => {
      removeListenersRef.current();
      clearTimeout(timer);
      restoreScrollRef.current();
    };
  }, [handleClose]);

  // 최초 진입·새로고침: 이번 페이지 로드에서 아직 재생 전이면 인트로 재생
  useEffect(() => {
    if (introPlayedThisPageLoad) return;
    introPlayedThisPageLoad = true;
    runIntro({ replay: false });
    return () => teardownRef.current();
  }, [runIntro]);

  // 로고 클릭 등으로 온보딩 재생 요청(egun:intro-replay) 시 다시 표시
  useEffect(() => {
    const replay = () => {
      teardownRef.current();
      introPlayedThisPageLoad = true;
      runIntro({ replay: true });
    };
    window.addEventListener('egun:intro-replay', replay);
    return () => window.removeEventListener('egun:intro-replay', replay);
  }, [runIntro]);

  if (!visible) return null;

  return (
    <>
      <div className={`intro${fadeOut ? ' fade-out' : ''}`} onClick={handleClose}>
        <div className="intro-content">

          {/* 1줄: 서울이건치과 (대형, 블루) */}
          <div className="intro-line">
            <SplitText text="서울이건치과" colorShadow={true} />
          </div>

          {/* 2줄: 마음을 담아 정성을 다하여 (소형, 흰색) */}
          <div className="intro-line mini">
            <SplitText text="마음을 담아 정성을 다하여" colorShadow={false} />
          </div>

          {/* 3줄: 서울대 출신 2인 대표원장 (소형, 블루) */}
          <div className="intro-line mini">
            <SplitText text="서울대 출신 2인 대표원장" colorShadow={true} />
          </div>

        </div>
      </div>

    </>
  );
}
