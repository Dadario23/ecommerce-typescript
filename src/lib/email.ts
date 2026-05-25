import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Compumobile <no-reply@compumobile.com.ar>";
const STORE_NAME = "Compumobile";
const STORE_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const paymentLabel =
    data.paymentMethod === "mercadopago" ? "Mercado Pago" : "Pago contra entrega";

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:14px;color:#333;">${item.name}</span>
          <span style="font-size:12px;color:#888;"> x${item.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#333;">
          $${(item.price * item.quantity).toLocaleString("es-AR")}
        </td>
      </tr>`
    )
    .join("");

  const addr = data.shippingAddress;

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1E3A8A;padding:28px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;">${STORE_NAME}</h1>
              <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">Confirmación de pedido</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:16px;color:#333;margin:0 0 8px;">
                Hola${data.customerName ? `, ${data.customerName.split(" ")[0]}` : ""}!
              </p>
              <p style="font-size:14px;color:#555;margin:0 0 24px;">
                Recibimos tu pedido y lo estamos procesando. Te avisaremos cuando sea despachado.
              </p>

              <!-- Order number -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin-bottom:24px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;">Número de pedido</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:#1E3A8A;">${data.orderNumber}</p>
              </div>

              <!-- Items -->
              <h3 style="font-size:14px;color:#333;margin:0 0 12px;text-transform:uppercase;letter-spacing:.5px;">Detalle del pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding:12px 0 0;font-weight:bold;font-size:15px;color:#333;">Total</td>
                  <td style="padding:12px 0 0;text-align:right;font-weight:bold;font-size:15px;color:#1E3A8A;">
                    $${data.total.toLocaleString("es-AR")}
                  </td>
                </tr>
              </table>

              <!-- Shipping -->
              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f0f0f0;">
                <h3 style="font-size:14px;color:#333;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px;">Envío a</h3>
                <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                  ${addr.firstName} ${addr.lastName}<br>
                  ${addr.street}<br>
                  ${addr.city}, ${addr.state} ${addr.zipCode}
                </p>
              </div>

              <!-- Payment -->
              <div style="margin-top:16px;">
                <p style="margin:0;font-size:13px;color:#888;">
                  Método de pago: <strong style="color:#555;">${paymentLabel}</strong>
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-top:32px;">
                <a href="${STORE_URL}/account/orders"
                  style="display:inline-block;background:#1E3A8A;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:bold;">
                  Ver mis pedidos
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                © ${new Date().getFullYear()} ${STORE_NAME}. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_xxx")) {
    console.warn("[email] RESEND_API_KEY no configurado, se omite el envío.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `✅ Pedido ${data.orderNumber} confirmado — ${STORE_NAME}`,
      html: buildOrderConfirmationHtml(data),
    });
  } catch (err) {
    console.error("[email] Error enviando confirmación:", err);
  }
}
