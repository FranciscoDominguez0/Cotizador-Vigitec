const { Op } = require('sequelize');
const { conexionOrm, Cotizacion, Pago } = require('../basedatos/modelos');
const servicioFinanciero = require('./servicioFinanciero');
const servicioAmortizacion = require('./servicioAmortizacion');

/**
 * Servicio de Negocio para la Cartera de Clientes y Pagos.
 * Utiliza Sequelize ORM con transacciones seguras (ACID).
 */
class ServicioCartera {
  /**
   * Lista todas las cotizaciones/clientes registrados con búsqueda opcional.
   */
  async listar(busqueda = '') {
    const filtro = {};
    if (busqueda && busqueda.trim()) {
      filtro[Op.or] = [
        { nombre: { [Op.iLike]: `%${busqueda.trim()}%` } },
        { cedula: { [Op.iLike]: `%${busqueda.trim()}%` } },
        { proyecto: { [Op.iLike]: `%${busqueda.trim()}%` } }
      ];
    }

    return Cotizacion.findAll({
      where: filtro,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Obtiene el detalle completo de una cuenta con su historial de pagos.
   */
  async obtenerPorId(id) {
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [{
        model: Pago,
        as: 'pagos'
      }],
      order: [[{ model: Pago, as: 'pagos' }, 'fechaRaw', 'ASC'], [{ model: Pago, as: 'pagos' }, 'id', 'ASC']]
    });

    if (!cotizacion) {
      throw new Error('La cuenta no fue encontrada');
    }

    return cotizacion;
  }

  /**
   * Guarda una nueva cotización en la cartera.
   */
  async crearCotizacion(datos) {
    const {
      nombre,
      cedula,
      telefono,
      proyecto,
      costoKit,
      abonoIngresado,
      anos,
      frecuencia
    } = datos;

    if (!nombre || !proyecto || !costoKit || !anos) {
      throw new Error('Nombre, proyecto, costo y años son obligatorios');
    }

    const calculo = servicioFinanciero.calcularCotizacion({
      costoKit,
      abonoIngresado,
      anos
    });

    const modalidad = (frecuencia === 'mensual') ? 'mensual' : 'quincenal';
    const cuotasTotales = (modalidad === 'mensual') ? calculo.cuotasMeses : calculo.cuotasQuincenas;

    return Cotizacion.create({
      nombre: nombre.trim(),
      cedula: cedula ? cedula.trim() : null,
      telefono: telefono ? telefono.trim() : null,
      proyecto: proyecto.trim(),
      costoKit: calculo.costoKit,
      abonoInicial: calculo.abonoInicial,
      capitalInicial: calculo.capitalInicial,
      anos: calculo.anos,
      porcentajeRecargo: calculo.porcentajeRecargo,
      interesTotal: calculo.interesTotal,
      capitalRestante: calculo.capitalInicial,
      interesRestante: calculo.interesTotal,
      frecuencia: modalidad,
      cuotasTotales,
      estado: 'ACTIVO'
    });
  }

  /**
   * Elimina una cuenta y todos sus pagos en cascada mediante el ORM.
   */
  async eliminarCotizacion(id) {
    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) {
      throw new Error('La cuenta no existe');
    }
    await cotizacion.destroy();
    return { exito: true };
  }

  /**
   * Registra un abono y sincroniza la amortización de toda la cuenta en una transacción.
   */
  async registrarPago(cotizacionId, { fecha, metodo, monto, nota }) {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    let fechaFormateada = fecha;
    let fechaRaw = new Date();

    if (fecha && fecha.includes('-')) {
      const [y, m, d] = fecha.split('-');
      fechaFormateada = `${d}/${m}/${y}`;
      fechaRaw = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    }

    const transaccion = await conexionOrm.transaction();
    try {
      // 1. Insertar el pago
      await Pago.create({
        cotizacionId,
        fecha: fechaFormateada || new Date().toLocaleDateString('es-PA'),
        fechaRaw,
        metodo: metodo || 'Efectivo',
        monto: montoNum,
        nota: nota || null
      }, { transaction: transaccion });

      // 2. Recalcular toda la cadena de pagos
      await this.recalcularSaldosEnTransaccion(cotizacionId, transaccion);

      await transaccion.commit();
      return { exito: true };
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }
  }

  /**
   * Modifica un abono histórico y recalcula automáticamente en cascada.
   */
  async actualizarPago(cotizacionId, pagoId, { fecha, metodo, monto, nota }) {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    let fechaFormateada = fecha;
    let fechaRaw = new Date();

    if (fecha && fecha.includes('-')) {
      const [y, m, d] = fecha.split('-');
      fechaFormateada = `${d}/${m}/${y}`;
      fechaRaw = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    }

    const transaccion = await conexionOrm.transaction();
    try {
      const pago = await Pago.findOne({
        where: { id: pagoId, cotizacionId },
        transaction: transaccion
      });

      if (!pago) {
        throw new Error('El pago no existe');
      }

      await pago.update({
        fecha: fechaFormateada || pago.fecha,
        fechaRaw,
        metodo: metodo || pago.metodo,
        monto: montoNum,
        nota: nota !== undefined ? nota : pago.nota
      }, { transaction: transaccion });

      await this.recalcularSaldosEnTransaccion(cotizacionId, transaccion);

      await transaccion.commit();
      return { exito: true };
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }
  }

  /**
   * Elimina un abono y recalcula los saldos en cascada.
   */
  async eliminarPago(cotizacionId, pagoId) {
    const transaccion = await conexionOrm.transaction();
    try {
      const pago = await Pago.findOne({
        where: { id: pagoId, cotizacionId },
        transaction: transaccion
      });

      if (!pago) {
        throw new Error('El pago no fue encontrado');
      }

      await pago.destroy({ transaction: transaccion });
      await this.recalcularSaldosEnTransaccion(cotizacionId, transaccion);

      await transaccion.commit();
      return { exito: true };
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }
  }

  /**
   * Método interno para ejecutar el recálculo y actualizar base de datos en transacción.
   */
  async recalcularSaldosEnTransaccion(cotizacionId, transaccion) {
    const cotizacion = await Cotizacion.findByPk(cotizacionId, { transaction: transaccion });
    const pagos = await Pago.findAll({
      where: { cotizacionId },
      order: [['fechaRaw', 'ASC'], ['id', 'ASC']],
      transaction: transaccion
    });

    const resultado = servicioAmortizacion.recalcularCadenaPagos(cotizacion, pagos);

    // Actualizar cada pago con su nuevo desglose
    for (const p of resultado.pagos) {
      await Pago.update({
        interes: p.interes,
        capital: p.capital,
        saldoRestante: p.saldoRestante
      }, {
        where: { id: p.id },
        transaction: transaccion
      });
    }

    // Actualizar cotización
    await cotizacion.update({
      capitalRestante: resultado.capitalRestante,
      interesRestante: resultado.interesRestante,
      estado: resultado.estado
    }, { transaction: transaccion });
  }
}

module.exports = new ServicioCartera();
