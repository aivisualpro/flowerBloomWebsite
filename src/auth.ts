import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: (credentials.email as string).toLowerCase().trim() });
        if (!user) return null;

        // If user signed up with Google, they can't log in with password
        if (user.provider === "google" && !user.password) return null;

        const ok = await bcrypt.compare(credentials.password as string, user.password);
        if (!ok) return null;

        // Update lastLoginAt
        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          image: user.image || null,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          provider: "credentials",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          let dbUser = await User.findOne({ email: user.email?.toLowerCase() });

          if (!dbUser) {
            // Auto-create user on first Google sign-in
            const nameParts = (user.name || "").split(" ");
            dbUser = await User.create({
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              email: user.email?.toLowerCase(),
              provider: "google",
              image: user.image || "",
              role: "CUSTOMER",
              status: "active",
              lastLoginAt: new Date(),
            });
          } else {
            // Update existing user with Google info
            dbUser.lastLoginAt = new Date();
            if (!dbUser.image && user.image) dbUser.image = user.image;
            if (dbUser.provider === "credentials") {
              // User existed with email/password, now also linking Google
              dbUser.provider = "google";
              if (user.image) dbUser.image = user.image;
            }
            await dbUser.save();
          }

          // Attach MongoDB _id to the user object for the JWT callback
          user.id = dbUser._id.toString();
          (user as any).firstName = dbUser.firstName;
          (user as any).lastName = dbUser.lastName;
          (user as any).phone = dbUser.phone;
          (user as any).role = dbUser.role;
          (user as any).provider = dbUser.provider;

          return true;
        } catch (err) {
          console.error("Google sign-in error:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // First sign in — merge user data into token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.phone = (user as any).phone;
        token.role = (user as any).role;
        token.provider = (user as any).provider;

        // Generate legacy JWT for backwards compatibility with existing API calls
        const secret = process.env.JWT_SECRET;
        if (secret) {
          const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
          token.legacyToken = jwt.sign(
            { email: user.email },
            secret,
            { expiresIn }
          );
        }
      }

      // Allow session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).phone = token.phone;
        (session.user as any).role = token.role;
        (session.user as any).provider = token.provider;
        (session.user as any).legacyToken = token.legacyToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
