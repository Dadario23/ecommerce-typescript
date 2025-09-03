// app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token, email } = await request.json();

    // Validaciones
    if (!token || !email) {
      return NextResponse.json(
        { error: "Token y email son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Enlace inválido o expirado" },
        { status: 400 }
      );
    }

    // Verificar token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    if (user.resetPasswordToken !== resetTokenHash) {
      return NextResponse.json(
        { error: "Enlace inválido o expirado" },
        { status: 400 }
      );
    }

    // Verificar expiración
    if (
      !user.resetPasswordExpires ||
      Date.now() > user.resetPasswordExpires.getTime()
    ) {
      return NextResponse.json(
        { error: "El enlace ha expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token válido",
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
