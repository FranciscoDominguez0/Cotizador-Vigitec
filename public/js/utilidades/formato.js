/**
 * Utilidades de formato monetario y fechas para el sistema Vigitec.
 */

function formatearMoneda(monto) {
  const numero = parseFloat(monto);
  if (isNaN(numero)) return '$0.00';
  return '$' + numero.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function obtenerFechaHoyIso() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

window.formatearMoneda = formatearMoneda;
window.obtenerFechaHoyIso = obtenerFechaHoyIso;
