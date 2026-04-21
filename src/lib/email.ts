import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendWelcomeEmail(to: string, tenantName: string, password?: string) {
  try {
    const info = await transporter.sendMail({
      from: `"ActivaQR" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: '¡Bienvenido a ActivaQR2 SaaS!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">ACTIVA<span style="color: #3b82f6;">QR</span>2</h1>
            <p style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px;">SaaS Command Center</p>
          </div>
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 600;">¡Hola ${tenantName}!</h2>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.6; font-size: 15px;">
            Tu espacio de trabajo en <strong>ActivaQR2</strong> ha sido provisionado exitosamente. 
            Ahora tienes acceso total a tu panel de administración (Command Center) para empezar a gestionar tus unidades de transporte y códigos QR inteligentes.
          </p>
          <div style="background-color: rgba(255,255,255,0.03); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Punto de Acceso</p>
            <p style="margin: 5px 0 20px 0;"><a href="https://activaqr2.vercel.app/dashboard" style="color: #3b82f6; text-decoration: none; font-weight: 600;">https://activaqr2.vercel.app/dashboard</a></p>
            
            <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Usuario (Email)</p>
            <p style="margin: 5px 0 20px 0; font-weight: 600;">${to}</p>
            
            ${password ? `
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Contraseña Temporal</p>
              <div style="margin-top: 5px; padding: 12px; background: rgba(59, 130, 246, 0.1); border: 1px dashed rgba(59, 130, 246, 0.5); border-radius: 8px; display: inline-block;">
                <code style="font-size: 18px; font-weight: bold; color: #3b82f6;">${password}</code>
              </div>
            ` : ''}
          </div>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.6; font-size: 14px;">
            Por seguridad, te recomendamos iniciar sesión de inmediato y, si recibiste una contraseña temporal, actualizarla desde tu perfil.
          </p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 40px 0 20px 0;" />
          <p style="color: rgba(255,255,255,0.3); font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
            © ${new Date().getFullYear()} ActivaQR2 Enterprise. Todos los derechos reservados.
          </p>
        </div>
      `,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
