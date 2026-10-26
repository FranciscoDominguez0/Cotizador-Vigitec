const { Router } = require('express');
const controladorCotizaciones = require('../controladores/controladorCotizaciones');
const controladorPagos = require('../controladores/controladorPagos');

const rutas = Router();

// Rutas de Cotizaciones / Clientes
rutas.get('/cotizaciones', (req, res) => controladorCotizaciones.listar(req, res));
rutas.get('/cotizaciones/:id', (req, res) => controladorCotizaciones.obtenerPorId(req, res));
rutas.post('/cotizaciones', (req, res) => controladorCotizaciones.crear(req, res));
rutas.delete('/cotizaciones/:id', (req, res) => controladorCotizaciones.eliminar(req, res));

// Rutas de Pagos
rutas.post('/cotizaciones/:id/pagos', (req, res) => controladorPagos.registrar(req, res));
rutas.put('/cotizaciones/:id/pagos/:pagoId', (req, res) => controladorPagos.actualizar(req, res));
rutas.delete('/cotizaciones/:id/pagos/:pagoId', (req, res) => controladorPagos.eliminar(req, res));

module.exports = rutas;
