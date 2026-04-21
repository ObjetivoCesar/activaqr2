import { auth } from "@/auth";

export default auth(async (req) => {
  const { nextUrl, auth: session } = req;
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = nextUrl.pathname.startsWith("/admin");
  const isLoggedIn = !!session;
  const user = session?.user as any;
  const tenantId = user?.tenantId;
  const role = user?.role;

  // 1. Redirigir a login si no está autenticado o no tiene tenantId (y no es César)
  if ((isDashboard || isAdmin) && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl.origin));
  }

  // Protección adicional contra sesiones huérfanas (sin tenantId)
  if (isDashboard && !tenantId && role !== 'super_admin') {
    return Response.redirect(new URL("/login", nextUrl.origin));
  }

  // 2. Protecciones de Rol
  // Si un cliente intenta entrar al panel de César
  if (isAdmin && role === 'tenant_admin') {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Si César intenta entrar al dashboard de un cliente específico
  if (isDashboard && role === 'super_admin') {
    return Response.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};
