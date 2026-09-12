#!/usr/bin/env node
/**
 * Stock Lighthouse audits using installed Google Chrome and disposable profiles.
 * Node >=22.19. Dependencies: lighthouse, puppeteer-core (included with Lighthouse).
 * Reuse an external install without changing this project's dependencies:
 *   LH_NODE_MODULES=/absolute/path/to/node_modules node scripts/lighthouse-home.mjs \
 *     --url https://egundc.com/ --mode both --output-dir .omo/evidence/lighthouse-home
 * CHROME_PATH defaults to installed Google Chrome stable on macOS.
 * Local targets must be production builds, not development servers.
 * Each invocation creates a unique report directory; scores are not a pass gate.
 */
import {parseArgs} from 'node:util';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {access, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {constants} from 'node:fs';

const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const metricIds = ['first-contentful-paint', 'largest-contentful-paint', 'speed-index',
  'total-blocking-time', 'cumulative-layout-shift', 'interactive', 'server-response-time'];
const {values} = parseArgs({options: {
  url: {type: 'string', default: 'https://egundc.com/'},
  mode: {type: 'string', default: 'both'},
  'output-dir': {type: 'string', default: '.omo/evidence/lighthouse-home'},
  help: {type: 'boolean', default: false},
}});

async function saveJson(path, value) {
  await writeFile(path, JSON.stringify(value, null, 2) + '\n');
}

async function saveScreenshot(directory, name, data) {
  const match = /^data:image\/(png|jpeg|webp);base64,([\s\S]+)$/.exec(data);
  if (!match) throw new Error('Missing or unsupported Lighthouse screenshot: ' + name);
  const file = name + '.' + (match[1] === 'jpeg' ? 'jpg' : match[1]);
  await writeFile(join(directory, file), Buffer.from(match[2], 'base64'));
  return file;
}

async function main() {
  if (values.help) {
    console.log('Usage: node scripts/lighthouse-home.mjs [--url URL] [--mode mobile|desktop|both] [--output-dir DIR]\n' +
      'Environment: LH_NODE_MODULES (external node_modules), CHROME_PATH (installed Google Chrome).');
    return;
  }
  if (!['mobile', 'desktop', 'both'].includes(values.mode)) {
    throw new Error('--mode must be mobile, desktop, or both');
  }
  const url = new URL(values.url);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('--url must use HTTP or HTTPS');
  const chromePath = process.env.CHROME_PATH ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (/headless[-_]shell/i.test(chromePath)) throw new Error('Use installed Google Chrome, not headless-shell');
  await access(chromePath, constants.X_OK);
  const require = createRequire(process.env.LH_NODE_MODULES
    ? pathToFileURL(resolve(process.env.LH_NODE_MODULES, '..', 'package.json')) : import.meta.url);
  const lighthousePath = require.resolve('lighthouse');
  const puppeteerPath = require.resolve('puppeteer-core');
  const {default: lighthouse, desktopConfig, generateReport} = await import(pathToFileURL(lighthousePath));
  const {default: puppeteer} = await import(pathToFileURL(puppeteerPath));
  const puppeteerVersion = JSON.parse(await readFile(require.resolve('puppeteer-core/package.json'), 'utf8')).version;
  await mkdir(resolve(values['output-dir']), {recursive: true});
  const runDirectory = await mkdtemp(join(resolve(values['output-dir']),
    new Date().toISOString().replace(/[:.]/g, '-') + '-' + url.hostname + '-'));
  console.log('Reports: ' + runDirectory);
  const summaries = [];
  for (const mode of values.mode === 'both' ? ['mobile', 'desktop'] : [values.mode]) {
    const directory = join(runDirectory, mode);
    await mkdir(directory);
    const profile = await mkdtemp(join(tmpdir(), 'lighthouse-home-'));
    let browser;
    let cleanupPromise;
    const cleanup = () => cleanupPromise ||= (async () => {
      try {
        if (browser) await browser.close();
      } finally {
        await rm(profile, {recursive: true, force: true});
      }
    })();
    const interrupt = (signal) => {
      console.error('Interrupted: ' + signal);
      cleanup().then(() => process.exit(signal === 'SIGINT' ? 130 : 143), error => {
        console.error('Cleanup failed:', error);
        process.exit(1);
      });
    };
    const onInterrupt = () => interrupt('SIGINT');
    const onTerminate = () => interrupt('SIGTERM');
    process.once('SIGINT', onInterrupt);
    process.once('SIGTERM', onTerminate);
    let summary;
    try {
      console.log('Starting ' + mode + ' audit: ' + url.href);
      browser = await puppeteer.launch({
        executablePath: chromePath,
        userDataDir: profile,
        headless: false,
        defaultViewport: null,
        handleSIGINT: false,
        handleSIGTERM: false,
        handleSIGHUP: false,
      });
      const browserInfo = {
        version: await browser.version(), userAgent: await browser.userAgent(),
        executablePath: chromePath, headless: false, pid: browser.process().pid,
        arguments: browser.process().spawnargs, disposableProfile: profile,
      };
      const page = await browser.newPage();
      // No pre-navigation, storage injection, interception, or popup/intro dismissal.
      // Lighthouse owns navigation, emulation, storage reset and stock throttling.
      const result = await lighthouse(url.href, {
        onlyCategories: categories, output: 'json', logLevel: 'info',
      }, mode === 'desktop' ? desktopConfig : undefined, page);
      if (!result) throw new Error('Lighthouse returned no result');
      const {lhr} = result;
      await Promise.all([
        saveJson(join(directory, 'report.json'), lhr),
        writeFile(join(directory, 'report.html'), generateReport(lhr, 'html')),
        saveJson(join(directory, 'trace.json'), result.artifacts.Trace),
        saveJson(join(directory, 'devtools-log.json'), result.artifacts.DevtoolsLog),
      ]);
      if (lhr.runtimeError) throw new Error(JSON.stringify(lhr.runtimeError));
      const screenshots = {
        final: await saveScreenshot(directory, 'final', lhr.audits['final-screenshot'].details.data),
        fullPage: await saveScreenshot(directory, 'full-page', lhr.fullPageScreenshot.screenshot.data),
        filmstrip: [],
      };
      for (const [index, frame] of lhr.audits['screenshot-thumbnails'].details.items.entries()) {
        screenshots.filmstrip.push({timing: frame.timing,
          file: await saveScreenshot(directory, 'filmstrip-' + String(index + 1).padStart(2, '0'), frame.data)});
      }
      summary = {
        mode, requestedUrl: lhr.requestedUrl, finalDisplayedUrl: lhr.finalDisplayedUrl,
        finalUrl: lhr.finalUrl, fetchTime: lhr.fetchTime,
        lighthouseVersion: lhr.lighthouseVersion, puppeteerVersion,
        nodeVersion: process.version, platform: process.platform, architecture: process.arch,
        packagePaths: {lighthouse: lighthousePath, puppeteer: puppeteerPath},
        browser: browserInfo, settings: lhr.configSettings, environment: lhr.environment,
        methodology: 'One cold navigation; stock Lighthouse preset; four standard categories; no page modifications.',
        scores: Object.fromEntries(Object.entries(lhr.categories).map(([id, category]) =>
          [id, category.score === null ? null : Math.round(category.score * 100)])),
        metrics: Object.fromEntries(metricIds.filter(id => lhr.audits[id]).map(id => [id, {
          value: lhr.audits[id].numericValue, unit: lhr.audits[id].numericUnit,
          displayValue: lhr.audits[id].displayValue, score: lhr.audits[id].score,
        }])),
        runWarnings: lhr.runWarnings,
        failedAudits: Object.values(lhr.audits).filter(audit =>
          (typeof audit.score === 'number' && audit.score < 1) || audit.scoreDisplayMode === 'error')
          .map(({id, title, score, scoreDisplayMode, displayValue, numericValue, numericUnit,
            explanation, errorMessage, details}) => ({id, title, score, scoreDisplayMode,
            displayValue, numericValue, numericUnit, explanation, errorMessage, details})),
        reports: {json: join(directory, 'report.json'), html: join(directory, 'report.html')},
        screenshots,
      };
    } catch (error) {
      await saveJson(join(directory, 'error.json'), {mode, url: url.href,
        message: error.message, stack: error.stack, profile});
      throw error;
    } finally {
      try {
        await cleanup();
      } finally {
        process.removeListener('SIGINT', onInterrupt);
        process.removeListener('SIGTERM', onTerminate);
      }
    }
    summary.browser.cleanedUp = true;
    await saveJson(join(directory, 'summary.json'), summary);
    summaries.push(summary);
    await saveJson(join(runDirectory, 'summary.json'), summaries);
    console.log(mode + ': ' + JSON.stringify(summary.scores));
    console.log('Summary: ' + join(directory, 'summary.json'));
  }
  console.log('Completed; disposable Chrome processes closed and profiles removed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
