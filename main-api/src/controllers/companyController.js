const db = require('../config/db');

/**
 * Obtiene el árbol completo de jerarquía para el Sidebar de una sola vez.
 * Corregido y con Debug para asegurar que el RUT salga.
 */
exports.getHierarchyTree = async (req, res, next) => {
  try {
    console.log('--- BACKEND: Generando árbol de jerarquía ---');
    
    // 1. Traer todas las empresas
    const { rows: companies } = await db.query('SELECT id, nombre, rut, tipo_empresa FROM empresa ORDER BY nombre ASC');
    
    // 2. Traer todas las sub-empresas (Aseguramos el RUT aquí)
    const { rows: subCompanies } = await db.query('SELECT id, nombre, rut, empresa_id FROM sub_empresa ORDER BY nombre ASC');
    
    // DEBUG BACKEND: Verificamos si la primera sub-empresa tiene RUT
    if (subCompanies.length > 0) {
      console.log('DEBUG: Primera sub-empresa leída de DB:', {
        id: subCompanies[0].id,
        nombre: subCompanies[0].nombre,
        rut: subCompanies[0].rut // Si aquí sale undefined, es un tema de la DB
      });
    }

    // 3. Traer todos los sitios
    const { rows: sites } = await db.query('SELECT id, descripcion, empresa_id, sub_empresa_id FROM sitio ORDER BY descripcion ASC');

    const tree = companies.map(company => ({
      ...company,
      subCompanies: subCompanies.filter(sc => sc.empresa_id === company.id).map(sc => ({
        ...sc,
        sites: sites.filter(s => s.sub_empresa_id === sc.id)
      }))
    }));

    res.json({ ok: true, data: tree });
  } catch (err) {
    console.error('ERROR EN BACKEND:', err);
    next(err);
  }
};

exports.getAllCompanies = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, nombre, rut, sitios, tipo_empresa FROM empresa ORDER BY nombre ASC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.getCompanySites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const column = id.startsWith('SE') ? 'sub_empresa_id' : 'empresa_id';
    const { rows } = await db.query(
      `SELECT id, descripcion, id_serial, ubicacion FROM sitio WHERE ${column} = $1 ORDER BY descripcion ASC`,
      [id]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};
