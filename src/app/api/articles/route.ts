import { NextRequest, NextResponse } from 'next/server';

import { fetchArticlesPage, DEFAULT_PAGE_SIZE } from '@/lib/articles-repository';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get('cursor');
  const limitParam = searchParams.get('limit');
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : DEFAULT_PAGE_SIZE;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_PAGE_SIZE;

  try {
    const page = await fetchArticlesPage({ cursor, limit });
    return NextResponse.json(page);
  } catch (error) {
    console.error('💥 Failed to load article page', error);
    return NextResponse.json({ error: 'Unable to load articles right now.' }, { status: 500 });
  }
}
