const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  
  await transporter.sendMail({
    from: `"UTP Market" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Verifica tu cuenta - UTP Market',
    html: `
      <div style="font-family: Arial; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1565c0;">🎓 UTP Market</h2>
        <p>Hola! Gracias por registrarte.</p>
        <p>Haz clic en el botón para verificar tu cuenta:</p>
        <a href="${verifyUrl}" style="
          background: #1565c0;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          margin: 20px 0;
        ">Verificar mi cuenta</a>
        <p style="color: #aaa; font-size: 12px;">Este enlace expira en 24 horas.</p>
      </div>
    `
  })
}

module.exports = { sendVerificationEmail }