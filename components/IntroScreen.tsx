'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
    closeTimerRef.current = window.setTimeout(() => {
      restoreScrollRef.current();
      setVisible(false);
    }, 800);
  }, []);

  // 인트로 재생: 스크롤 잠금 + 해제 제스처 리스너 + 자동 해제 타이머 설정
  const runIntro = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    closingRef.current = false;
    setFadeOut(false);
    setVisible(true);

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
    runIntro();
    return () => teardownRef.current();
  }, [runIntro]);

  // 로고 클릭 등으로 온보딩 재생 요청(egun:intro-replay) 시 다시 표시
  useEffect(() => {
    const replay = () => {
      teardownRef.current();
      introPlayedThisPageLoad = true;
      runIntro();
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

      <style jsx global>{`
        @font-face {
          font-family: 'Paperozi';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-9Black.woff2') format('woff2');
          font-weight: 900;
          font-display: swap;
        }

        .intro {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100dvh;
          background-color: #000;
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          opacity: 1;
          transition: opacity 0.8s ease;
          cursor: pointer;
          touch-action: none;
          overscroll-behavior: contain;
        }
        .intro.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .intro-content {
          text-align: center;
          color: rgba(255, 255, 255, 0.2);
          font-family: 'Paperozi', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1vh;
        }

        .intro-line {
          font-size: 7vw;
          line-height: 1.2;
          display: flex;
          justify-content: center;
          overflow: hidden;
          letter-spacing: 0;
        }
        .intro-line.mini {
          font-size: 4vw;
        }

        /* 기본 흰색 글자 */
        .intro-line span {
          display: inline-block;
          font-weight: 900;
          animation: popUp 1.5s ease forwards;
          text-shadow: #ffffff 0px 9vw 0px;
        }
        .intro-line.mini span {
          text-shadow: #ffffff 0px 5vw 0px;
        }
        .intro-line span.gap {
          text-shadow: none;
          min-width: 0.4em;
        }

        /* 블루 강조 #0080C8 */
        .intro-line span.color-shadow {
          text-shadow: #0080C8 0px 9vw 0px;
        }
        .intro-line.mini span.color-shadow {
          text-shadow: #0080C8 0px 5vw 0px;
        }

        @keyframes popUp {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-100%); }
        }

        .intro-line span:nth-child(1)  { animation-delay: 0.50s; }
        .intro-line span:nth-child(2)  { animation-delay: 0.55s; }
        .intro-line span:nth-child(3)  { animation-delay: 0.60s; }
        .intro-line span:nth-child(4)  { animation-delay: 0.65s; }
        .intro-line span:nth-child(5)  { animation-delay: 0.70s; }
        .intro-line span:nth-child(6)  { animation-delay: 0.75s; }
        .intro-line span:nth-child(7)  { animation-delay: 0.85s; }
        .intro-line span:nth-child(8)  { animation-delay: 0.90s; }
        .intro-line span:nth-child(9)  { animation-delay: 0.95s; }
        .intro-line span:nth-child(10) { animation-delay: 1.00s; }
        .intro-line span:nth-child(11) { animation-delay: 1.05s; }
        .intro-line span:nth-child(12) { animation-delay: 1.10s; }
        .intro-line span:nth-child(13) { animation-delay: 1.15s; }
        .intro-line span:nth-child(14) { animation-delay: 1.20s; }
        .intro-line span:nth-child(15) { animation-delay: 1.25s; }
        .intro-line span:nth-child(16) { animation-delay: 1.30s; }

        @media (max-width: 992px) {
          .intro-line       { font-size: 10vw; }
          .intro-line.mini  { font-size: 6vw; }
          .intro-line span  { text-shadow: #ffffff 0px 12vw 0px; }
          .intro-line span.color-shadow { text-shadow: #0080C8 0px 12vw 0px; }
          .intro-line.mini span { text-shadow: #ffffff 0px 7vw 0px; }
          .intro-line.mini span.color-shadow { text-shadow: #0080C8 0px 7vw 0px; }

          .intro-line span:nth-child(1)  { animation-delay: 0.333s; }
          .intro-line span:nth-child(2)  { animation-delay: 0.366s; }
          .intro-line span:nth-child(3)  { animation-delay: 0.400s; }
          .intro-line span:nth-child(4)  { animation-delay: 0.433s; }
          .intro-line span:nth-child(5)  { animation-delay: 0.466s; }
          .intro-line span:nth-child(6)  { animation-delay: 0.500s; }
          .intro-line span:nth-child(7)  { animation-delay: 0.566s; }
          .intro-line span:nth-child(8)  { animation-delay: 0.600s; }
          .intro-line span:nth-child(9)  { animation-delay: 0.633s; }
          .intro-line span:nth-child(10) { animation-delay: 0.666s; }
          .intro-line span:nth-child(11) { animation-delay: 0.700s; }
          .intro-line span:nth-child(12) { animation-delay: 0.733s; }
          .intro-line span:nth-child(13) { animation-delay: 0.766s; }
          .intro-line span:nth-child(14) { animation-delay: 0.800s; }
          .intro-line span:nth-child(15) { animation-delay: 0.833s; }
          .intro-line span:nth-child(16) { animation-delay: 0.866s; }
        }
      `}</style>
    </>
  );
}
