import { NextResponse } from 'next/server';
import { buildSearchIndex } from '@/services/searchIndexService';

export const revalidate = 60 * 60;

/**
 * 全局搜索索引：提供轻量数据给前端缓存并本地过滤。
 */
export function GET() {
  const index = buildSearchIndex();
  return NextResponse.json(index);
}

