import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth-helpers";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
          image: user.image || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // 🔗 Google login
      if (account?.provider === "google") {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // si no existe, lo creamos
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "user",
          });
        } else {
          // si existe, actualizamos nombre/foto por si cambiaron
          existingUser.name = user.name || existingUser.name;
          existingUser.image = user.image || existingUser.image;
          await existingUser.save();
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect called with:", { url, baseUrl });

      // ✅ Verifica si la URL es una ruta dentro de nuestra aplicación
      const callbackUrl = new URL(url, baseUrl);

      if (callbackUrl.origin === baseUrl) {
        console.log("Allowing custom callbackUrl:", callbackUrl.pathname);
        return callbackUrl.pathname; // Devuelve solo la ruta (ej: /order)
      }

      console.log("Redirecting to home");
      return "/";
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!; // ← Ahora sin "as any"
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Si viene de credentials provider, ya trae role
        token.role = (user as any).role || "user";
        token.name = user.name;
        token.email = user.email;
      } else {
        // Si no hay user (ej. navegación entre páginas), asegurate de refrescar desde DB
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }

      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
