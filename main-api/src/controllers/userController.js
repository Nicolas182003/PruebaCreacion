const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Retorna la lista de empresas y sub-empresas para el formulario
exports.getEmpresas = async (req, res, next) => {
  try {
    const empresasQuery = await db.query('SELECT id, nombre, tipo_empresa FROM empresa');
    const subEmpresasQuery = await db.query('SELECT id, empresa_id, nombre FROM sub_empresa');
    
    // Si el usuario es 'Admin' o 'Gerente', solo puede ver estructuras de su propia empresa.
    const rol = req.user.tipo;
    const miEmpresa = req.user.empresa_id;
    
    let empresasValidas = empresasQuery.rows;
    if (rol !== 'SuperAdmin' && miEmpresa) {
      empresasValidas = empresasValidas.filter(e => e.id === miEmpresa);
    }

    // Anidar las sub-empresas dentro del JSON de la empresa respectiva
    const dataConHerederos = empresasValidas.map(empresa => {
      const hijos = subEmpresasQuery.rows.filter(se => se.empresa_id === empresa.id);
      return { ...empresa, sub_empresas: hijos };
    });

    res.json({ ok: true, data: dataConHerederos });
  } catch (error) {
    next(error);
  }
};

// Crea un nuevo usuario y le envía la contraseña
exports.createUser = async (req, res, next) => {
  try {
    const { nombre, apellido, email, telefono, cargo, tipo, empresa_id, sub_empresa_id } = req.body;

    if (!nombre || !apellido || !email || !tipo) {
      return res.status(400).json({ ok: false, error: "Campos requeridos faltantes" });
    }

    // Regla de Seguridad
    if (req.user.tipo === 'Admin') {
      if (tipo === 'SuperAdmin' || tipo === 'Admin') {
         return res.status(403).json({ ok: false, error: "Un Admin solo puede invitar Gerentes y Clientes" });
      }
      if (empresa_id !== req.user.empresa_id) {
        return res.status(403).json({ ok: false, error: "No puedes asignar usuarios a una empresa ajena" });
      }
    }

    if (tipo === 'Gerente' && !sub_empresa_id) {
       return res.status(400).json({ ok: false, error: "Un Gerente debe obligatoriamente asignarse a una Sub-Empresa" });
    }

    const newId = 'U' + crypto.randomBytes(3).toString('hex');

    // Insertar en Base de Datos incluyendo sub_empresa_id (sin clave asignada)
    await db.query(
      `INSERT INTO usuario (id, nombre, apellido, email, telefono, cargo, tipo, empresa_id, sub_empresa_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL)`,
      [newId, nombre, apellido, email, telefono, cargo, tipo, empresa_id || null, sub_empresa_id || null]
    );

    res.status(201).json({
      ok: true,
      message: "Usuario pre-registrado exitosamente en la base de datos."
    });
  } catch (error) {
    // Si viola la restricción UNIQUE del correo
    if (error.code === '23505') {
      return res.status(400).json({ ok: false, error: "El correo electrónico ya está registrado." });
    }
    next(error);
  }
};
