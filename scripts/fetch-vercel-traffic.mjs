import { spawn } from 'node:child_process';

/**
 * 调用 Vercel CLI 获取最近一段时间的访问日志，并在本地做一个轻量聚合。
 * 依赖：本机已安装并登录 vercel CLI，当前目录已 link 到 codeatlas 项目。
 */
export async function fetchVercelTrafficSummary(options = {}) {
  const sinceHours = options.sinceHours ?? 24;
  const limit = options.limit ?? 2000;
  const topLimit = options.topLimit ?? 5;

  const args = [
    'logs',
    '--environment',
    'production',
    '--since',
    `${sinceHours}h`,
    '--limit',
    String(limit),
    '--json',
  ];

  return new Promise((resolve) => {
    const child = spawn('vercel', args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', (err) => {
      console.error('[vercel-traffic] Failed to spawn vercel CLI:', err);
      resolve(null);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('[vercel-traffic] vercel logs exited with code', code);
        if (stderr.trim()) {
          console.error('[vercel-traffic] stderr:', stderr.trim());
        }
        resolve(null);
        return;
      }

      const lines = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && line.startsWith('{'));

      const entries = [];
      for (const line of lines) {
        try {
          entries.push(JSON.parse(line));
        } catch (err) {
          console.error('[vercel-traffic] Failed to parse log line as JSON:', line, err);
        }
      }

      if (entries.length === 0) {
        console.log('[vercel-traffic] No JSON log entries parsed from vercel logs output.');
        resolve(null);
        return;
      }

      let total = 0;
      let errorCount = 0;
      const pathCounts = new Map();

      for (const entry of entries) {
        const path =
          entry.path ||
          entry.requestPath ||
          (entry.meta && (entry.meta.path || entry.meta.requestPath)) ||
          (entry.request && entry.request.path) ||
          null;
        const status =
          entry.statusCode ||
          entry.status ||
          (entry.meta && entry.meta.statusCode) ||
          (entry.response && entry.response.statusCode) ||
          null;

        if (!path) continue;

        total += 1;
        if (typeof status === 'number' && status >= 400) {
          errorCount += 1;
        }

        const prev = pathCounts.get(path) ?? 0;
        pathCounts.set(path, prev + 1);
      }

      if (total === 0) {
        console.log('[vercel-traffic] No usable log entries with path field.');
        resolve(null);
        return;
      }

      const topPaths = Array.from(pathCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topLimit)
        .map(([path, count]) => ({ path, count }));

      const summary = {
        totalRequests: total,
        errorRate: total > 0 ? errorCount / total : 0,
        topPaths,
      };

      resolve(summary);
    });
  });
}

// 允许单独运行脚本调试，直接打印聚合结果
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchVercelTrafficSummary()
    .then((summary) => {
      console.log(JSON.stringify(summary ?? {}, null, 2));
    })
    .catch((err) => {
      console.error('[vercel-traffic] Unexpected error:', err);
      process.exitCode = 1;
    });
}
