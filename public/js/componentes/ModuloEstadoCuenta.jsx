/**
 * Módulo: Estado de Cuenta Oficial con Amortización, Registro y Edición de Abonos.
 */
function ModuloEstadoCuenta({ cuentaId, alVolver, mostrarMensaje }) {
  const { useState, useEffect } = React;

  const [cuenta, setCuenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [montoPago, setMontoPago] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [fechaPago, setFechaPago] = useState(obtenerFechaHoyIso());
  const [pagoEditando, setPagoEditando] = useState(null);
  const [pagoAEliminar, setPagoAEliminar] = useState(null);
  const [eliminandoPago, setEliminandoPago] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  const cargarDetalle = async () => {
    try {
      setCargando(true);
      const res = await fetch(`/api/cotizaciones/${cuentaId}`);
      if (!res.ok) throw new Error();
      const datos = await res.json();
      setCuenta(datos);
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al cargar el estado de cuenta', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [cuentaId]);

  const procesarNuevoPago = async (e) => {
    e.preventDefault();
    const monto = parseFloat(montoPago);
    if (isNaN(monto) || monto <= 0) {
      mostrarMensaje('El monto del abono debe ser mayor a 0', 'error');
      return;
    }

    const saldoPendiente = Math.round((parseFloat(cuenta.capitalRestante || 0) + parseFloat(cuenta.interesRestante || 0)) * 100) / 100;
    if (saldoPendiente <= 0) {
      mostrarMensaje('Esta cuenta ya se encuentra totalmente saldada', 'error');
      return;
    }

    if (monto > saldoPendiente) {
      mostrarMensaje(`El monto no puede ser mayor al saldo total pendiente (${formatearMoneda(saldoPendiente)})`, 'error');
      return;
    }

    try {
      const res = await fetch(`/api/cotizaciones/${cuentaId}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: fechaPago,
          metodo: metodoPago,
          monto
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo registrar el abono');
      }
      mostrarMensaje('Abono registrado exitosamente.');
      setMontoPago('');
      setFechaPago(obtenerFechaHoyIso());
      cargarDetalle();
    } catch (err) {
      console.error(err);
      mostrarMensaje(err.message || 'No se pudo registrar el abono', 'error');
    }
  };

  if (cargando || !cuenta) {
    return <div className="card text-center text-muted" style={{ padding: '3rem' }}>Cargando estado de cuenta...</div>;
  }

  const saldoTotal = parseFloat(cuenta.capitalRestante) + parseFloat(cuenta.interesRestante);
  const cuotaSugerida = (parseFloat(cuenta.capitalInicial) + parseFloat(cuenta.interesTotal)) / parseInt(cuenta.cuotasTotales, 10);

  const totalPagos = (cuenta && cuenta.pagos) ? cuenta.pagos.length : 0;
  const totalPaginas = Math.ceil(totalPagos / ITEMS_POR_PAGINA) || 1;
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const pagosPaginados = (cuenta && cuenta.pagos) ? cuenta.pagos.slice(indiceInicio, indiceInicio + ITEMS_POR_PAGINA) : [];

  return (
    <div>
      {/* Hoja de Estado de Cuenta Apta para Impresión */}
      <div className="documento-cotizacion">
        <div className="doc-header-brand">
          <div>
            <img src="img/logo.png" alt="// VIGITEC SECURITY" className="doc-logo-img" />
            <p style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 'bold' }}>
              Estado de Cuenta Oficial
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Cliente: {cuenta.nombre} {cuenta.cedula ? `• Cédula: ${cuenta.cedula}` : ''}
            </p>
          </div>
          <div className="doc-meta">
            <div className="badge-folio">{cuenta.estado}</div>
            <div>Modalidad: {cuenta.frecuencia.toUpperCase()}</div>
            <div>Cuota Sugerida: {formatearMoneda(cuotaSugerida)}</div>
          </div>
        </div>

        {/* Tarjetas de Saldos */}
        <div className="tarjetas-saldos-grid">
          <div className="saldo-item-card">
            <span className="saldo-label">Proyecto Financiado</span>
            <div className="saldo-valor" style={{ fontSize: '1.1rem' }}>{cuenta.proyecto}</div>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Costo: {formatearMoneda(cuenta.costoKit)}</span>
          </div>

          <div className="saldo-item-card">
            <span className="saldo-label">Capital Restante</span>
            <div className="saldo-valor">{formatearMoneda(cuenta.capitalRestante)}</div>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Interés restante: {formatearMoneda(cuenta.interesRestante)}</span>
          </div>

          <div className="saldo-item-card total-deuda">
            <span className="saldo-label" style={{ color: '#dc2626' }}>Saldo Total Pendiente</span>
            <div className="saldo-valor text-red">{formatearMoneda(saldoTotal)}</div>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Abono inicial: {formatearMoneda(cuenta.abonoInicial)}</span>
          </div>
        </div>

        {/* Caja de Registro de Abono */}
        {saldoTotal <= 0.005 ? (
          <div className="no-print" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '1rem 1.5rem', color: '#166534', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
            ✓ Esta cuenta se encuentra totalmente pagada y cancelada. No hay saldo pendiente por cobrar.
          </div>
        ) : (
          <div className="caja-registro-pago no-print">
            <div className="caja-pago-header">
              <div>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Registrar Pago / Abono</strong>
              </div>
              <div className="badge-min">
                Cuota sugerida: {formatearMoneda(cuotaSugerida)}
              </div>
            </div>

            <form onSubmit={procesarNuevoPago} className="fila-formulario-pago">
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem' }}>Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem' }}>Método</label>
                <select
                  className="form-control"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Yappy">Yappy</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem' }}>Monto ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={Math.max(0, saldoTotal).toFixed(2)}
                  className="form-control font-bold"
                  value={montoPago}
                  onChange={(e) => setMontoPago(e.target.value)}
                  required
                />
              </div>

              <div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
                  Procesar Pago
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de Historial de Pagos y Amortización */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.75rem' }}>
            Historial de Pagos y Amortización
          </h3>
          <div className="table-wrapper">
            <table className="tabla-vigitec">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th style={{ textAlign: 'right' }}>Abono Total</th>
                  <th style={{ textAlign: 'right' }}>A Interés</th>
                  <th style={{ textAlign: 'right' }}>A Capital</th>
                  <th style={{ textAlign: 'right' }}>Saldo Pendiente</th>
                  <th className="no-print text-center">Acciones</th>
                </tr>
              </thead>
              {/* Filas paginadas en pantalla */}
              <tbody className="no-print">
                {pagosPaginados.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-muted" style={{ padding: '1.5rem' }}>Sin pagos registrados.</td></tr>
                ) : (
                  pagosPaginados.map((pago) => (
                    <tr key={pago.id}>
                      <td>{pago.fecha}</td>
                      <td>{pago.metodo}</td>
                      <td className="text-green font-bold" style={{ textAlign: 'right' }}>{formatearMoneda(pago.monto)}</td>
                      <td style={{ color: '#d97706', textAlign: 'right' }}>{formatearMoneda(pago.interes)}</td>
                      <td style={{ color: '#2563eb', textAlign: 'right' }}>{formatearMoneda(pago.capital)}</td>
                      <td className="font-bold" style={{ textAlign: 'right' }}>{formatearMoneda(pago.saldoRestante)}</td>
                      <td className="no-print text-center">
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setPagoEditando(pago)}>
                            Editar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setPagoAEliminar(pago)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Filas completas para impresión/PDF */}
              <tbody className="only-print">
                {(!cuenta.pagos || cuenta.pagos.length === 0) ? (
                  <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '1rem' }}>Sin pagos registrados.</td></tr>
                ) : (
                  cuenta.pagos.map((pago) => (
                    <tr key={`print-${pago.id}`}>
                      <td>{pago.fecha}</td>
                      <td>{pago.metodo}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatearMoneda(pago.monto)}</td>
                      <td style={{ textAlign: 'right' }}>{formatearMoneda(pago.interes)}</td>
                      <td style={{ textAlign: 'right' }}>{formatearMoneda(pago.capital)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatearMoneda(pago.saldoRestante)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Barra de Paginación de Pagos (10 por página) */}
          <BarraPaginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            alCambiarPagina={(pag) => setPaginaActual(pag)}
            totalElementos={totalPagos}
            elementosPorPagina={ITEMS_POR_PAGINA}
          />
        </div>

        {/* Firmas para Impresión */}
        <div className="firmas-impresion">
          <div className="firma-caja">
            <div className="firma-linea"></div>
            <div className="firma-nombre">Oficial de Cobros</div>
            <div className="firma-cargo">// Vigitec Security Group S.E.P.</div>
          </div>
          <div className="firma-caja">
            <div className="firma-linea"></div>
            <div className="firma-nombre">{cuenta.nombre}</div>
            <div className="firma-cargo">Recibí conforme el Estado de Cuenta</div>
          </div>
        </div>

        {/* Pie de Documento Oficial */}
        <div className="doc-footer">
          Estado de cuenta oficial emitido por Vigitec Security Group S.E.P. • Sistema de financiamiento privado. Válido como constancia oficial de saldos y abonos.
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="barra-acciones-cotizacion no-print">
        <button className="btn btn-secondary btn-volver" onClick={alVolver}>
          Volver a Cartera
        </button>
        <button className="btn btn-primary btn-imprimir" onClick={() => window.print()}>
          Imprimir Estado de Cuenta (PDF)
        </button>
      </div>

      {/* Modal para Editar Pago */}
      {pagoEditando && (
        <ModalEditarPago
          pago={pagoEditando}
          cotizacionId={cuentaId}
          alCerrar={() => setPagoEditando(null)}
          alGuardado={() => {
            setPagoEditando(null);
            mostrarMensaje('Pago actualizado y saldos recalculados.');
            cargarDetalle();
          }}
          mostrarMensaje={mostrarMensaje}
        />
      )}

      {/* Modal de Confirmación para Eliminar Pago */}
      {pagoAEliminar && (
        <ModalConfirmacion
          titulo="Eliminar Abono"
          mensaje={`¿Está seguro de que desea eliminar el abono de ${formatearMoneda(pagoAEliminar.monto)} registrado con fecha ${pagoAEliminar.fecha}? Toda la cadena de amortización y saldos posteriores será recalculada automáticamente.`}
          alConfirmar={async () => {
            try {
              setEliminandoPago(true);
              const res = await fetch(`/api/cotizaciones/${cuentaId}/pagos/${pagoAEliminar.id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error();
              mostrarMensaje('Abono eliminado exitosamente.');
              setPagoAEliminar(null);
              cargarDetalle();
            } catch (err) {
              console.error(err);
              mostrarMensaje('Error al eliminar el abono', 'error');
            } finally {
              setEliminandoPago(false);
            }
          }}
          alCancelar={() => setPagoAEliminar(null)}
          procesando={eliminandoPago}
        />
      )}
    </div>
  );
}

window.ModuloEstadoCuenta = ModuloEstadoCuenta;
