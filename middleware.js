import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me'
);

async function isTokenValid(token) {
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  const valid = await isTokenValid(token);

  // Ana sayfa: geçerli token varsa dashboard'a at
  if (path === '/') {
    if (valid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Dashboard: token yok veya süresi dolmuş/geçersizse login'e at, cookie'yi sil
  if (path.startsWith('/dashboard')) {
    if (!valid) {
      const res = NextResponse.redirect(new URL('/', request.url));
      res.cookies.set('token', '', { maxAge: 0, path: '/' });
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}