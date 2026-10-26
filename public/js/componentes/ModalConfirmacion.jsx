/**
 * Componente Reutilizable: Modal de Confirmación de Seguridad.
 * Utilizado para eliminar clientes y registros de pago con confirmación explícita.
 */
function ModalConfirmacion({ titulo, mensaje, alConfirmar, alCancelar, procesando = false }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>⚠️</span> {titulo || 'Confirmación Requerida'}
          </div>
          <button className="modal-close-btn" onClick={alCancelar} disabled={procesando}>&times;</button>
        </div>

        <div className="modal-confirmacion-contenido">
          {mensaje}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={alCancelar}
            disabled={procesando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={alConfirmar}
            disabled={procesando}
          >
            {procesando ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

window.ModalConfirmacion = ModalConfirmacion;
