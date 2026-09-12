#!/usr/bin/env node
/**
 * Local production homepage regression QA, Node >=22.19, installed Chrome.
 * Run ONLY after the Lighthouse/browser owner explicitly hands off ownership:
 * LH_NODE_MODULES=/absolute/path/to/node_modules node scripts/verify-home-interactions.mjs
 * Dependencies and CHROME_PATH follow lighthouse-home.mjs. No personal profile,
 * request mocks, storage injection, synthetic media events, or form submissions.
 * Evidence: .omo/evidence/lighthouse-home/ui-qa/<unique run>/{mobile,desktop}/.
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {access, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {HERO_SLIDES, getSlideMedia, getVideoPlaybackRate} from '../components/main/heroSlides.ts';

const URL_HOME = 'http://127.0.0.1:3100/';
const POPUP = '.slide-popup-overlay';
const MENU = 'nav[role="dialog"]';
const HIDE_KEY = 'egun:popup-hide-until';
const BLOG = 'https://blog.naver.com/seoulegundc';
const TIMEOUT = 30_000;
const json = (path, data) => writeFile(path, JSON.stringify(data, null, 2) + '\n');

// Subscribe before an action. Only DOM mutations and exact browser events wake
// the predicate; the sole timer is a failure deadline, never a readiness delay.
async function arm(page, predicate, args = [], events = [], timeout = TIMEOUT) {
  const fn = await page.evaluateHandle(`(${predicate.toString()})`);
  const id = await page.evaluate((test, args, events, timeout) => {
    const id = ++window.__uiQA.waitId;
    window.__uiQA.waits[id] = new Promise(resolve => {
      const observer = new MutationObserver(() => check());
      const finish = result => {
        clearTimeout(timer);
        observer.disconnect();
        for (const event of events) document.removeEventListener(event, check, true);
        resolve(result);
      };
      const check = event => {
        try { if (test(...args, event)) finish({ok: true}); }
        catch (error) { finish({ok: false, error: error.message}); }
      };
      const timer = setTimeout(() => finish({ok: false, error: 'Timed out waiting for ' + test.toString()}), timeout);
      observer.observe(document, {subtree: true, childList: true, attributes: true});
      for (const event of events) document.addEventListener(event, check, true);
      check();
    });
    return id;
  }, fn, args, events, timeout);
  await fn.dispose();
  return async () => {
    const result = await page.evaluate(async id => {
      const result = await window.__uiQA.waits[id];
      delete window.__uiQA.waits[id];
      return result;
    }, id);
    assert.ok(result.ok, result.error);
  };
}

async function state(page, predicate, args = [], events = []) {
  await (await arm(page, predicate, args, events))();
}

async function animations(page, selector, heroOnly = false) {
  await page.$eval(selector, async (element, heroOnly) => {
    // finished subscribes to real completion, including animation delays. Hero
    // captures exclude every mobile-pan and kenburns animation, even finite ones.
    const animations = element.getAnimations({subtree: true}).filter(animation =>
      Number.isFinite(animation.effect.getComputedTiming().endTime) && (!heroOnly ||
        (animation instanceof CSSTransition && animation.transitionProperty === 'opacity') ||
        (animation instanceof CSSAnimation && animation.animationName === 'hero-text-rise' &&
          animation.effect.target.matches('.hero-sequence'))));
    let timer;
    try {
      await Promise.race([
        Promise.all(animations.map(animation => animation.finished)),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Animation completion timeout')), 30_000); }),
      ]);
    } finally { clearTimeout(timer); }
  }, heroOnly);
}

async function screenshot(page, directory, name, viewport, report) {
  const path = join(directory, name + '.png');
  await page.screenshot({path, type: 'png', fullPage: false});
  const png = await readFile(path);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  const dimensions = {width: png.readUInt32BE(16), height: png.readUInt32BE(20)};
  assert.deepEqual(dimensions, {width: viewport.width, height: viewport.height});
  report.screenshots.push({file: path, ...dimensions});
}

async function clickAndWait(page, selector, predicate, args = [], events = []) {
  const done = await arm(page, predicate, args, events);
  await page.click(selector);
  await done();
}

async function scrollSection(page, root, selector, top = 90) {
  // Native scrolling of the real responsive scroll owner; no layout/CSS changes.
  await page.evaluate((root, selector, top) => {
    const element = document.querySelector(selector);
    const container = document.querySelector(root);
    if (root === '#home-desktop') {
      container.scrollTo({top: container.scrollTop + element.getBoundingClientRect().top - container.getBoundingClientRect().top - top, behavior: 'instant'});
    } else {
      window.scrollTo({top: window.scrollY + element.getBoundingClientRect().top - top, behavior: 'instant'});
    }
  }, root, selector, top);
}

async function verify(page, directory, mode, viewport, report) {
  const root = '#home-' + mode;
  const hero = `${root} section[id^="main-hero-"]`;
  const media = `${hero} > div.isolate > :is(img,video)`;
  const mediaAt = index => `${media}:nth-child(${index + 1})`;
  const active = (selector, index) => document.querySelectorAll(selector)[index]?.style.zIndex === '2';
  const sedation = `${root} section:has(> video[preload="none"][aria-hidden="true"])`;
  // This selector remains valid after preload changes.
  const sedationVideo = `${root} section > video[aria-hidden="true"]`;
  const sedationSection = `${root} section:has(> video[aria-hidden="true"])`;
  const blog = `${root} a[href="${BLOG}"]`;
  const shot = name => screenshot(page, directory, name, viewport, report);
  const heroShot = async (name, index) => {
    const selector = mediaAt(index);
    const guard = await page.$eval(selector, element => element.style.zIndex === '2');
    assert.ok(guard, `${name}: selected hero slide ${index + 1} changed before settling`);
    const capture = await page.evaluateHandle(selector => {
      const element = document.querySelector(selector);
      const capture = {changed: false, observer: null};
      capture.observer = new MutationObserver(() => {
        if (!element.isConnected || element.style.zIndex !== '2') capture.changed = true;
      });
      capture.observer.observe(element.parentElement, {subtree: true, attributes: true, childList: true});
      return capture;
    }, selector);
    try {
      await animations(page, hero, true);
      const settled = () => page.evaluate((capture, selector, hero) => {
        const element = document.querySelector(selector);
        const copy = [...document.querySelectorAll(`${hero} .hero-sequence`)].filter(node => node.getClientRects().length);
        return !capture.changed && element?.style.zIndex === '2' && getComputedStyle(element).opacity === '1' &&
          copy.length > 0 && copy.every(node => getComputedStyle(node).opacity === '1');
      }, capture, selector, hero);
      assert.ok(await settled(), `${name}: hero slide ${index + 1} changed or did not settle before capture`);
      await shot(name);
      assert.ok(await settled(), `${name}: hero slide ${index + 1} changed during capture; PNG is not a settled reference`);
      Object.assign(report.screenshots.at(-1), {settledHero: true, slide: index + 1, mobilePanUnmodified: true});
    } finally {
      await page.evaluate(capture => capture.observer.disconnect(), capture);
      await capture.dispose();
    }
  };
  const step = async (action, run) => {
    report.action = action;
    console.log(mode + ': ' + action);
    const detail = await run();
    report.checks.push({action, status: 'pass', ...(detail === undefined ? {} : {detail})});
  };
  await page.evaluateOnNewDocument(() => {
    window.__uiQA = {waitId: 0, waits: {}, introEnded: false, popupBeforeIntro: false,
      popupSeen: false, sedationInitial: {}, mediaEvents: []};
    window.addEventListener('egun:intro-end', () => { window.__uiQA.introEnded = true; });
    new MutationObserver(() => {
      const qa = window.__uiQA;
      if (document.querySelector('.slide-popup-overlay')) {
        qa.popupSeen = true;
        if (!qa.introEnded) qa.popupBeforeIntro = true;
      }
      for (const root of ['home-mobile', 'home-desktop']) {
        const video = document.querySelector(`#${root} section > video[aria-hidden="true"]`);
        if (video && !(root in qa.sedationInitial)) qa.sedationInitial[root] = video.getAttribute('src');
      }
    }).observe(document, {childList: true, subtree: true});
    for (const event of ['playing', 'pause', 'loadeddata', 'ended', 'error']) {
      document.addEventListener(event, e => {
        if (!(e.target instanceof HTMLMediaElement)) return;
        window.__uiQA.mediaEvents.push({event, src: e.target.currentSrc,
          root: e.target.closest('.home-page')?.id, time: performance.now(), rate: e.target.playbackRate});
      }, true);
    }
  });

  await step('cold home: natural intro, popup opens afterward, sedation source absent', async () => {
    const response = await page.goto(URL_HOME, {waitUntil: 'domcontentloaded'});
    assert.equal(response.status(), 200);
    await state(page, popup => window.__uiQA.introEnded && !document.querySelector('.intro') && !!document.querySelector(popup), [POPUP]);
    const initial = await page.evaluate(() => ({early: window.__uiQA.popupBeforeIntro, sedation: window.__uiQA.sedationInitial}));
    assert.equal(initial.early, false);
    assert.deepEqual(initial.sedation, {'home-desktop': null, 'home-mobile': null});
    assert.equal(await page.$eval(sedation + ' > video', video => video.getAttribute('src')), null);
    await page.$$eval(`${POPUP} img`, images => Promise.all(images.map(image => image.decode())));
    await animations(page, POPUP);
    await shot('popup');
    return initial;
  });

  await step('popup dot hitboxes, next, previous, direct selection, endpoint controls', async () => {
    const tabs = `${POPUP} [role="tab"]`;
    const boxes = await page.$$eval(tabs, elements => elements.map(element => {
      const {width, height} = element.getBoundingClientRect();
      return {width, height};
    }));
    assert.ok(boxes.length >= 2, 'Live popup needs at least two active slides to exercise next/previous; no fixture injection allowed');
    assert.ok(boxes.every(box => box.width >= 24 && box.height >= 24), JSON.stringify(boxes));
    const selected = (tabs, index) => document.querySelectorAll(tabs)[index]?.getAttribute('aria-selected') === 'true';
    const prev = `${POPUP} button[aria-label="이전 슬라이드"]`;
    const next = `${POPUP} button[aria-label="다음 슬라이드"]`;
    assert.equal(await page.$eval(prev, button => button.disabled), true);
    await clickAndWait(page, next, selected, [tabs, 1]);
    await animations(page, `${POPUP} .slide-popup-track`);
    await clickAndWait(page, prev, selected, [tabs, 0]);
    await animations(page, `${POPUP} .slide-popup-track`);
    for (let index = 1; index < boxes.length; index++) {
      await clickAndWait(page, `${tabs}:nth-child(${index + 1})`, selected, [tabs, index]);
      await animations(page, `${POPUP} .slide-popup-track`);
      const transform = await page.$eval(`${POPUP} .slide-popup-track`, element => ({
        x: new DOMMatrix(getComputedStyle(element).transform).m41, width: element.getBoundingClientRect().width,
      }));
      assert.ok(Math.abs(transform.x + index * transform.width) < 1, JSON.stringify(transform));
    }
    assert.equal(await page.$eval(next, button => button.disabled), true);
    await shot('popup-selected');
    return boxes;
  });

  await step('close does not persist; reload naturally opens popup again', async () => {
    await clickAndWait(page, `${POPUP} button[aria-label="닫기"]`, popup => !document.querySelector(popup), [POPUP]);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), HIDE_KEY), null);
    await page.reload({waitUntil: 'domcontentloaded'});
    await state(page, popup => window.__uiQA.introEnded && !document.querySelector('.intro') && !!document.querySelector(popup), [POPUP]);
    await animations(page, POPUP);
  });

  await step('hide-today persists across reload in this disposable profile', async () => {
    const done = await arm(page, popup => !document.querySelector(popup), [POPUP]);
    // The bottom action row is a source-known two-button row, not prose matching.
    await page.click(`${POPUP} .border-t > button:first-child`);
    await done();
    const until = await page.evaluate(key => Number(localStorage.getItem(key)), HIDE_KEY);
    const end = await page.evaluate(() => { const date = new Date(); date.setHours(23, 59, 59, 999); return date.getTime(); });
    assert.equal(until, end);
    await page.reload({waitUntil: 'domcontentloaded'});
    await state(page, () => window.__uiQA.introEnded && !document.querySelector('.intro'));
    assert.equal(await page.evaluate(key => Number(localStorage.getItem(key)), HIDE_KEY), until);
    assert.equal(await page.evaluate(() => window.__uiQA.popupSeen), false);
    return {hideUntil: until};
  });

  await step('all six visible hero controls select decoded media; video rates and natural ended callbacks', async () => {
    assert.equal(HERO_SLIDES.length, 6);
    const indicators = `${hero} > div.${mode === 'mobile' ? 'md\\:hidden' : 'md\\:flex'} > button`;
    assert.equal(await page.$$eval(indicators, buttons => buttons.length), 6);
    const details = [];
    for (const [index, slide] of HERO_SLIDES.entries()) {
      const selector = mediaAt(index);
      let ended;
      if (slide.isVideo) {
        const count = await page.evaluate(() => window.__uiQA.mediaEvents.length);
        ended = await arm(page, (media, next, count, root, src) =>
          window.__uiQA.mediaEvents.slice(count).some(event => event.event === 'ended' && event.root === root && new URL(event.src).pathname === src) &&
          document.querySelectorAll(media)[next]?.style.zIndex === '2',
        [media, (index + 1) % 6, count, root.slice(1), getSlideMedia(slide, mode === 'mobile')], ['ended']);
      }
      const ready = await arm(page, (selector, video) => {
        const element = document.querySelector(selector);
        return element?.style.zIndex === '2' && (video ? element.readyState >= 2 && !element.paused : element.complete && element.naturalWidth > 0);
      }, [selector, !!slide.isVideo], ['playing', 'loadeddata', 'load']);
      await clickAndWait(page, `${indicators}:nth-child(${index + 1})`, active, [media, index]);
      await ready();
      const detail = await page.$eval(selector, async (element, video) => {
        if (!video) await element.decode();
        return {src: element.currentSrc, rate: video ? element.playbackRate : undefined,
          width: video ? element.videoWidth : element.naturalWidth, active: element.style.zIndex === '2'};
      }, !!slide.isVideo);
      assert.equal(detail.active, true);
      assert.ok(detail.width > 0);
      if (slide.isVideo) {
        assert.equal(new URL(detail.src).pathname, getSlideMedia(slide, mode === 'mobile'));
        assert.equal(detail.rate, getVideoPlaybackRate(slide));
      } else {
        assert.ok(slide.srcSet.split(',').some(candidate => candidate.trim().split(/\s+/)[0] === new URL(detail.src).pathname), detail.src);
      }
      await heroShot(index === 0 ? 'home' : `hero-${index + 1}`, index);
      if (ended) await ended();
      details.push({index, ...detail});
    }
    return details;
  });

  await step('sedation loads on approach, plays in viewport, pauses outside', async () => {
    assert.equal(await page.$eval(sedationVideo, video => video.getAttribute('src')), null);
    const sourced = await arm(page, selector => document.querySelector(selector)?.getAttribute('src') === '/images/video/sedation-hero.mp4', [sedationVideo]);
    await scrollSection(page, root, sedationSection, viewport.height + 150);
    await sourced();
    assert.equal(await page.$eval(sedationVideo, video => video.paused), true);
    const playing = await arm(page, (selector, event) => event?.type === 'playing' && event.target === document.querySelector(selector), [sedationVideo], ['playing']);
    const loaded = await arm(page, selector => document.querySelector(selector)?.readyState >= 2, [sedationVideo], ['loadeddata']);
    await scrollSection(page, root, sedationSection);
    await Promise.all([playing(), loaded()]);
    await animations(page, sedationSection);
    await shot('sedation-playing');
    const paused = await arm(page, (selector, event) => event?.type === 'pause' && event.target === document.querySelector(selector), [sedationVideo], ['pause']);
    await scrollSection(page, root, hero, 0);
    await paused();
    assert.equal(await page.$eval(sedationVideo, video => video.paused), true);
  });

  await step('Naver blog funnel URL and external-link behavior unchanged', async () => {
    const revealed = await arm(page, selector => document.querySelector(selector)?.classList.contains('scroll-reveal-up'), [blog]);
    await scrollSection(page, root, `${root} section:has(a[href="${BLOG}"])`);
    await revealed();
    await page.$$eval(`${root} section:has(a[href="${BLOG}"]) img`, images => Promise.all(images.map(image => image.decode())));
    await animations(page, `${root} section:has(a[href="${BLOG}"])`);
    const link = await page.$eval(blog, element => ({href: element.href, target: element.target, rel: element.rel}));
    assert.equal(link.href, BLOG);
    assert.equal(link.target, '_blank');
    assert.ok(link.rel.split(' ').includes('noopener') && link.rel.split(' ').includes('noreferrer'));
    await shot('media-blog-funnel');
    // Do not open external destinations or send any consultation request.
    return link;
  });

  await step('closed mobile menu is inert; normal column navigation and return', async () => {
    await scrollSection(page, root, hero, 0);
    assert.equal(await page.$eval(MENU, element => element.inert && element.getAttribute('aria-hidden') === 'true'), true);
    assert.equal(await page.$eval(`${MENU} a`, element => { element.focus(); return document.activeElement === element; }), false);
    let column;
    if (mode === 'mobile') {
      await clickAndWait(page, 'button[aria-label="메뉴 열기"]', menu => {
        const element = document.querySelector(menu);
        return element && !element.inert && element.getAttribute('aria-hidden') === 'false';
      }, [MENU]);
      await animations(page, MENU);
      column = `${MENU} a[href="/column"]`;
      assert.equal(await page.$eval(column, element => {
        const rect = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      }), true);
      await shot('menu-open');
    } else {
      await page.hover('header nav div.relative > button');
      column = 'header nav a[href="/column"]';
    }
    await clickAndWait(page, column, () => location.pathname === '/column' && !document.querySelector('#home-mobile') && !!document.querySelector('main h1'));
    await shot('column');
    await clickAndWait(page, 'header a[href="/"]', root => location.pathname === '/' && !!document.querySelector(root) && !document.querySelector('.intro'), [root]);
    assert.equal(await page.$eval(MENU, element => element.inert), true);
    assert.equal(await page.evaluate(() => window.__uiQA.popupSeen), false, 'Hidden popup reappeared during later interactions');
    const returnedSlide = await page.$$eval(media, elements => elements.findIndex(element => element.style.zIndex === '2'));
    assert.ok(returnedSlide >= 0, 'No active hero slide on home return');
    await heroShot('home-return', returnedSlide);
    const retainedFocusWarnings = report.consoleErrors.filter(message =>
      /Blocked aria-hidden[\s\S]*retained focus/i.test(message));
    assert.deepEqual(retainedFocusWarnings, [],
      'Menu navigation emitted an aria-hidden retained-focus warning:\n' + retainedFocusWarnings.join('\n'));
  });
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('After explicit browser handoff: LH_NODE_MODULES=/path/to/node_modules node scripts/verify-home-interactions.mjs\nTarget: ' + URL_HOME + '; mobile 390x844 and desktop 1440x900; disposable installed Chrome only.');
    return;
  }
  assert.equal(process.argv.length, 2, 'Only --help is supported; target and artifact scope are intentionally fixed');
  const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  assert.ok(!/headless[-_]shell/i.test(chromePath), 'Use installed Google Chrome');
  await access(chromePath, constants.X_OK);
  const require = createRequire(process.env.LH_NODE_MODULES
    ? pathToFileURL(resolve(process.env.LH_NODE_MODULES, '..', 'package.json')) : import.meta.url);
  const puppeteerPath = require.resolve('puppeteer-core');
  const {default: puppeteer} = await import(pathToFileURL(puppeteerPath));
  const base = resolve('.omo/evidence/lighthouse-home/ui-qa');
  await mkdir(base, {recursive: true});
  const run = await mkdtemp(join(base, new Date().toISOString().replace(/[:.]/g, '-') + '-'));
  const reports = [];
  console.log('Evidence: ' + run);
  for (const [mode, width, height] of [['mobile', 390, 844], ['desktop', 1440, 900]]) {
    const directory = join(run, mode);
    await mkdir(directory);
    const profile = await mkdtemp(join(tmpdir(), 'home-ui-qa-'));
    const viewport = {width, height, deviceScaleFactor: 1, isMobile: mode === 'mobile', hasTouch: mode === 'mobile'};
    const report = {mode, url: URL_HOME, viewport, profile, puppeteerPath, checks: [], screenshots: [], consoleErrors: [], failedRequests: []};
    reports.push(report);
    let browser, page, cleanupPromise;
    const cleanup = () => cleanupPromise ||= (async () => {
      try { if (browser) await browser.close(); }
      finally { await rm(profile, {recursive: true, force: true}); }
    })();
    const interrupt = signal => {
      console.error('Interrupted: ' + signal);
      cleanup().then(() => process.exit(signal === 'SIGINT' ? 130 : 143), error => { console.error(error); process.exit(1); });
    };
    const handlers = Object.fromEntries(['SIGINT', 'SIGTERM', 'SIGHUP'].map(signal => [signal, () => interrupt(signal)]));
    for (const [signal, handler] of Object.entries(handlers)) process.once(signal, handler);
    try {
      browser = await puppeteer.launch({executablePath: chromePath, userDataDir: profile, headless: false,
        defaultViewport: viewport, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false});
      report.browser = {version: await browser.version(), executablePath: chromePath, pid: browser.process().pid};
      page = await browser.newPage();
      page.setDefaultTimeout(TIMEOUT);
      page.setDefaultNavigationTimeout(TIMEOUT);
      page.on('pageerror', error => report.consoleErrors.push(error.message));
      page.on('console', message => { if (['error', 'warn'].includes(message.type())) report.consoleErrors.push(message.type() + ': ' + message.text()); });
      page.on('requestfailed', request => report.failedRequests.push({url: request.url(), error: request.failure()?.errorText}));
      await verify(page, directory, mode, viewport, report);
      report.status = 'pass';
    } catch (error) {
      report.status = 'fail';
      report.error = {action: report.action, message: error.message, stack: error.stack};
      console.error(mode + ' FAIL:', report.error);
      if (page && !page.isClosed()) {
        try { await screenshot(page, directory, 'failure', viewport, report); }
        catch (captureError) { report.captureError = captureError.message; }
      }
      process.exitCode = 1;
    } finally {
      try {
        if (page && !page.isClosed()) report.observations = await page.evaluate(() => window.__uiQA && ({
          introEnded: window.__uiQA.introEnded, popupSeen: window.__uiQA.popupSeen, mediaEvents: window.__uiQA.mediaEvents,
        }));
      } catch (error) { report.observationError = error.message; }
      try { await cleanup(); report.cleanedUp = true; }
      finally {
        for (const [signal, handler] of Object.entries(handlers)) process.removeListener(signal, handler);
        await json(join(directory, 'report.json'), report);
        await json(join(run, 'summary.json'), reports);
      }
    }
  }
  console.log('Completed: ' + reports.map(report => report.mode + '=' + report.status).join(', '));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
