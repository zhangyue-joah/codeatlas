import fs from 'node:fs';
import process from 'node:process';

const DEFAULT_PATHS = ['/', '/robots.txt', '/sitemap.xml'];
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_LATENCY_MS = 4_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 5_000;

function getPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePaths(value) {
  if (!value) return DEFAULT_PATHS;
  const paths = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return paths.length > 0 ? paths : DEFAULT_PATHS;
}

function resolveBaseUrl() {
  const rawBaseUrl = process.argv[2] ?? process.env.BASE_URL;
  if (!rawBaseUrl) {
    throw new Error('缺少 BASE_URL。请通过环境变量 BASE_URL 或命令参数传入。');
  }

  let url;
  try {
    url = new URL(rawBaseUrl);
  } catch (error) {
    throw new Error(`BASE_URL 非法: ${rawBaseUrl}`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`BASE_URL 协议不支持: ${url.protocol}`);
  }

  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchOnce(targetUrl, timeoutMs, maxLatencyMs) {
  const startAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'CodeAtlas-PostDeploy-Healthcheck/1.0',
      },
    });

    const latencyMs = Date.now() - startAt;
    const statusOk = response.ok;
    const latencyOk = latencyMs <= maxLatencyMs;
    const ok = statusOk && latencyOk;

    return {
      ok,
      status: response.status,
      latencyMs,
      reason: !statusOk ? `HTTP ${response.status}` : !latencyOk ? `latency>${maxLatencyMs}ms` : '',
    };
  } catch (error) {
    const latencyMs = Date.now() - startAt;
    return {
      ok: false,
      status: null,
      latencyMs,
      reason: error?.name === 'AbortError' ? `timeout>${timeoutMs}ms` : String(error?.message ?? error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkPathWithRetry(baseUrl, path, options) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = new URL(normalizedPath, baseUrl).toString();

  let lastResult = null;
  for (let attempt = 1; attempt <= options.retries + 1; attempt += 1) {
    const result = await fetchOnce(targetUrl, options.timeoutMs, options.maxLatencyMs);
    lastResult = { ...result, attempt, url: targetUrl, path: normalizedPath };
    if (result.ok) {
      return lastResult;
    }

    if (attempt <= options.retries) {
      await sleep(options.retryDelayMs);
    }
  }

  return lastResult;
}

async function main() {
  const baseUrl = resolveBaseUrl();
  const options = {
    timeoutMs: getPositiveInt(process.env.HEALTHCHECK_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxLatencyMs: getPositiveInt(process.env.HEALTHCHECK_MAX_LATENCY_MS, DEFAULT_MAX_LATENCY_MS),
    retries: getPositiveInt(process.env.HEALTHCHECK_RETRIES, DEFAULT_RETRIES),
    retryDelayMs: getPositiveInt(process.env.HEALTHCHECK_RETRY_DELAY_MS, DEFAULT_RETRY_DELAY_MS),
  };
  const paths = parsePaths(process.env.HEALTHCHECK_PATHS);

  console.log(`[healthcheck] base=${baseUrl.toString()}`);
  console.log(
    `[healthcheck] paths=${paths.join(', ')} timeout=${options.timeoutMs}ms maxLatency=${options.maxLatencyMs}ms retries=${options.retries}`
  );

  const results = await Promise.all(paths.map((path) => checkPathWithRetry(baseUrl, path, options)));
  const failedResults = results.filter((result) => !result.ok);
  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl: baseUrl.toString(),
    options,
    summary: {
      total: results.length,
      failed: failedResults.length,
      passed: results.length - failedResults.length,
    },
    results,
  };

  for (const result of results) {
    const statusText = result.status === null ? 'ERR' : String(result.status);
    const outcome = result.ok ? 'PASS' : 'FAIL';
    console.log(
      `[${outcome}] ${result.path} status=${statusText} latency=${result.latencyMs}ms attempt=${result.attempt} reason=${result.reason || 'ok'}`
    );
  }

  const outputFile = process.env.HEALTHCHECK_OUTPUT_FILE;
  if (outputFile) {
    try {
      fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
      console.log(`[healthcheck] reportFile=${outputFile}`);
    } catch (error) {
      console.warn(`[healthcheck] 写入报告失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failedResults.length > 0) {
    console.error(`[healthcheck] failed=${failedResults.length}/${results.length}`);
    process.exit(1);
  }

  console.log(`[healthcheck] all checks passed (${results.length}/${results.length})`);
}

main().catch((error) => {
  console.error(`[healthcheck] fatal: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
