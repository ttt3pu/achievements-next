import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
});

export const config = {
  // ログインページ（/login）以外を対象にする
  matcher: '/admin/:path*',
};
