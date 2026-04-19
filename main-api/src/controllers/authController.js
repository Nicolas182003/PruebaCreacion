const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_12345';

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email y password son requeridos" });
    }

    // Buscar al usuario
    const result = await db.query('SELECT id, nombre, email, tipo, empresa_id, sub_empresa_id, password_hash FROM usuario WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
    }

    const unUsuario = result.rows[0];

    // Verificar contraseña (Saltando si no tiene hash por db vieja o errónea)
    if (!unUsuario.password_hash) {
      return res.status(401).json({ ok: false, error: "Cuenta no tiene contraseña configurada" });
    }

    const match = await bcrypt.compare(password, unUsuario.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
    }

    // Firmar JWT
    const payload = {
      id: unUsuario.id,
      email: unUsuario.email,
      tipo: unUsuario.tipo,
      empresa_id: unUsuario.empresa_id,
      sub_empresa_id: unUsuario.sub_empresa_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      ok: true,
      token,
      user: {
        nombre: unUsuario.nombre,
        email: unUsuario.email,
        tipo: unUsuario.tipo,
        empresa_id: unUsuario.empresa_id,
        sub_empresa_id: unUsuario.sub_empresa_id
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.requestCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ ok: false, error: "El correo es requerido" });
    }

    // 1. Validar que el usuario fue ingresado en la BDD por un Admin
    const result = await db.query('SELECT id, nombre, email FROM usuario WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(403).json({ ok: false, error: "Este correo no ha sido autorizado en el sistema. Contacte a su administrador." });
    }

    const usr = result.rows[0];

    // 2. Generar Código Numérico de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Ej: '648291'
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(otpCode, saltRounds);

    // 3. Guardar hash en DB
    await db.query('UPDATE usuario SET password_hash = $1 WHERE email = $2', [password_hash, email]);

    // 4. Enviar OTP al correo
    const emailInfo = await emailService.sendWelcomeEmail(email, usr.nombre, otpCode);

    res.json({
      ok: true,
      message: "Código enviado exitosamente a tu correo.",
      previewUrl: emailInfo.previewUrl // Para efectos de demostración temporal
    });

  } catch (error) {
    next(error);
  }
};
