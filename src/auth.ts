import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { supabase, supabaseClient } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Supabase",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        console.log(`[AUTH] Intentando login para: ${credentials.email}`);

        // 1. Autenticar con Supabase Auth (Usamos ANON KEY Client)
        if (!supabaseClient) {
          console.error("[AUTH] Error CRÍTICO: supabaseClient es NULL. NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY faltan.");
          return null;
        }

        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (authError || !authData.user) {
          console.error(`[AUTH] Fallo signInWithPassword para ${credentials.email}:`, authError?.message);
          return null;
        }

        console.log(`[AUTH] Supabase Auth OK. UserID: ${authData.user.id}`);

        // 2. Buscar vinculación de Tenant
        if (!supabase) {
          console.error("[AUTH] Error CRÍTICO: cliente 'supabase' (Service Role) es NULL.");
          return null;
        }

        const { data: userData, error: userError } = await supabase
          .from("activaqr2_users")
          .select("tenant_id, role")
          .ilike("email", credentials.email as string)
          .single();

        if (userError || !userData) {
          console.error(`[AUTH] Error: Usuario ${credentials.email} no encontrado en activaqr2_users:`, userError?.message);
          return null;
        }

        console.log(`[AUTH] Mapeo encontrado. Rol: ${userData.role}, Tenant: ${userData.tenant_id}`);

        // 3. Retornar objeto de usuario para el JWT de NextAuth
        return {
          id: authData.user.id,
          email: authData.user.email,
          tenantId: userData.tenant_id,
          role: userData.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});
