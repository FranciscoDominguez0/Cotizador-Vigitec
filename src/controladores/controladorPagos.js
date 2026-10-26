const servicioCartera = require('../servicios/servicioCartera');

/**
 * Controlador de Pagos y Abonos.
 * Principio de Responsabilidad Única (SRP).
 */
class ControladorPagos {
  async registrar(peticion, respuesta) {
    try {
      const cotizacionId = parseInt(peticion.params.id, 10);
      const resultado = await servicioCartera.registrarPago(cotizacionId, peticion.body);
      respuesta.status(201).json(resultado);
    } catch (error) {
      console.error(error);
      respuesta.status(400).json({ error: error.message || 'Error al registrar el abono' });
    }
  }

  async actualizar(peticion, respuesta) {
    try {
      const cotizacionId = parseInt(peticion.params.id, 10);
      const pagoId = parseInt(peticion.params.pagoId, 10);
      const resultado = await servicioCartera.actualizarPago(cotizacionId, pagoId, peticion.body);
      respuesta.json(resultado);
    } catch (error) {
      console.error(error);
      respuesta.status(400).json({ error: error.message || 'Error al actualizar el abono' });
    }
  }

  async eliminar(peticion, respuesta) {
    try {
      const cotizacionId = parseInt(peticion.params.id, 10);
      const pagoId = parseInt(peticion.params.pagoId, 10);
      const resultado = await servicioCartera.eliminarPago(cotizacionId, pagoId);
      respuesta.json(resultado);
    } catch (error) {
      console.error(error);
      respuesta.status(500).json({ error: error.message || 'Error al eliminar el abono' });
    }
  }
}

module.exports = new ControladorPagos();
