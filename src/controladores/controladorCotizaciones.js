const servicioCartera = require('../servicios/servicioCartera');

/**
 * Controlador de Cotizaciones.
 * Principio de Responsabilidad Única (SRP).
 */
class ControladorCotizaciones {
  async listar(peticion, respuesta) {
    try {
      const { q } = peticion.query;
      const cotizaciones = await servicioCartera.listar(q);
      respuesta.json(cotizaciones);
    } catch (error) {
      console.error(error);
      respuesta.status(500).json({ error: error.message || 'Error al listar clientes' });
    }
  }

  async obtenerPorId(peticion, respuesta) {
    try {
      const id = parseInt(peticion.params.id, 10);
      const cuenta = await servicioCartera.obtenerPorId(id);
      respuesta.json(cuenta);
    } catch (error) {
      console.error(error);
      respuesta.status(404).json({ error: error.message || 'Cuenta no encontrada' });
    }
  }

  async crear(peticion, respuesta) {
    try {
      const nueva = await servicioCartera.crearCotizacion(peticion.body);
      respuesta.status(201).json(nueva);
    } catch (error) {
      console.error(error);
      respuesta.status(400).json({ error: error.message || 'Error al guardar la cotización' });
    }
  }

  async eliminar(peticion, respuesta) {
    try {
      const id = parseInt(peticion.params.id, 10);
      const resultado = await servicioCartera.eliminarCotizacion(id);
      respuesta.json(resultado);
    } catch (error) {
      console.error(error);
      respuesta.status(500).json({ error: error.message || 'Error al eliminar la cuenta' });
    }
  }
}

module.exports = new ControladorCotizaciones();
