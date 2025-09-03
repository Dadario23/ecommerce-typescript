// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    // Validar email
    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return NextResponse.json({
        message: "Si el email existe, recibirás un enlace de recuperación",
      });
    }

    // Verificar intentos recientes (prevenir spam)
    const now = new Date();
    if (user.lastResetRequest && user.resetPasswordAttempts >= 3) {
      const lastAttempt = new Date(user.lastResetRequest);
      const hoursDiff =
        (now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 1) {
        return NextResponse.json(
          { error: "Demasiados intentos. Espera 1 hora." },
          { status: 429 }
        );
      }
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Guardar token en usuario (1 hora de expiración)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    user.resetPasswordAttempts += 1;
    user.lastResetRequest = now;
    await user.save();

    // Crear URL de reset
    const resetUrl = `${
      process.env.NEXTAUTH_URL
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // 🎯 MODO DESARROLLO: Mostrar en consola y devolver en response
    if (process.env.NODE_ENV === "development") {
      console.log(" ");
      console.log(
        "🔐 ======= ENLACE DE RECUPERACIÓN (MODO DESARROLLO) ======="
      );
      console.log("📧 Destinatario:", email);
      console.log("🔗 Enlace:", resetUrl);
      console.log("⏰ Expira:", new Date(Date.now() + 60 * 60 * 1000));
      console.log("📝 Token:", resetToken);
      console.log("======================================================");
      console.log(" ");

      return NextResponse.json({
        message: "Enlace de recuperación generado (ver consola del servidor)",
        resetUrl: resetUrl, // ← Para que el frontend también lo vea
        debug: true,
      });
    }

    // 🎯 MODO PRODUCCIÓN: Código original con Resend (se ejecutará solo en producción)
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Recupera tu contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}" style="background:#0070f3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">
          Restablecer contraseña
        </a>
        <p>Este enlace expira en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este email.</p>
      `,
    });

    return NextResponse.json({
      message: "Si el email existe, recibirás un enlace de recuperación",
    });
  } catch (error) {
    console.error("Error en forgot password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
