/**
 * Componente: Modal para Edición de Abono Registrado.
 */
function ModalEditarPago({ pago, cotizacionId, alCerrar, alGuardado, mostrarMensaje }) {
  const { useState } = React;

  const [fecha, setFecha] = useState(() => {
    if (pago.fecha && pago.fecha.includes('/')) {
      const [d, m, y] = pago.fecha.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return obtenerFechaHoyIso();
  });
  const [metodo, setMetodo] = useState(pago.metodo || 'Efectivo');
  const [monto, setMonto] = useState(pago.monto);
  const [guardando, setGuardando] = useState(false);

  const guardarCambios = async (e) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      mostrarMensaje('El monto debe ser mayor a 0', 'error');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}/pagos/${pago.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha, metodo, monto: montoNum })
      });
      if (!res.ok) throw new Error();
      alGuardado();
    } catch (err) {
      console.error(err);
      mostrarMensaje('No se pudo actualizar el pago', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">Editar Registro de Pago</div>
          <button className="modal-close-btn" onClick={alCerrar}>&times;</button>
        </div>

        <form onSubmit={guardarCambios}>
          <div className="form-group">
            <label>Fecha del Pago</label>
            <input
              type="date"
              className="form-control"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Método de Pago</label>
            <select
              className="form-control"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Yappy">Yappy</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="form-group">
            <label>Monto Abonado ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={alCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.ModalEditarPago = ModalEditarPago;
