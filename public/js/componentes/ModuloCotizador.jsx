/**
 * Módulo: Cotizador de Proyectos Solares con Financiamiento Privado.
 */
function ModuloCotizador({ alGuardarEnCartera, mostrarMensaje }) {
  const { useState } = React;

  const [paso, setPaso] = useState('formulario'); // 'formulario' | 'resultado'
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [kitSeleccionado, setKitSeleccionado] = useState('');
  const [costoKit, setCostoKit] = useState('');
  const [abonoIngresado, setAbonoIngresado] = useState('');
  const [minimoAbono, setMinimoAbono] = useState(0);
  const [anos, setAnos] = useState(1);
  const [frecuencia, setFrecuencia] = useState('quincenal');
  const [cotizacionCalculada, setCotizacionCalculada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const alSeleccionarKit = (e) => {
    const kitId = parseInt(e.target.value, 10);
    setKitSeleccionado(kitId);
    const kit = (window.KITS_PREDEFINIDOS || KITS_PREDEFINIDOS).find(k => k.id === kitId);
    if (kit) {
      setCostoKit(kit.precio);
      const min20 = Math.round(kit.precio * 0.20 * 100) / 100;
      setMinimoAbono(min20);
      setAbonoIngresado(min20.toFixed(2));
    }
  };

  const calcularCotizacion = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !costoKit || !anos || anos < 1) {
      mostrarMensaje('Complete los datos requeridos.', 'error');
      return;
    }

    const costo = parseFloat(costoKit);
    const abono = parseFloat(abonoIngresado);
    const anosNum = parseInt(anos, 10);

    if (isNaN(abono) || abono < minimoAbono) {
      mostrarMensaje(`El abono inicial no puede ser menor al 20% (${formatearMoneda(minimoAbono)})`, 'error');
      return;
    }

    if (abono >= costo) {
      mostrarMensaje('El abono inicial no puede ser mayor o igual al costo total del kit', 'error');
      return;
    }

    const kitObj = (window.KITS_PREDEFINIDOS || KITS_PREDEFINIDOS).find(k => k.id === kitSeleccionado);
    const nombreProyecto = kitObj ? kitObj.nombre : 'KIT SOLAR';

    // Reglas financieras de Vigitec: 10% de recargo por año
    const capital = Math.round((costo - abono) * 100) / 100;
    const porcentajeRecargo = 10 * anosNum;
    const interesTotal = Math.round((capital * (porcentajeRecargo / 100)) * 100) / 100;
    const totalPagar = Math.round((capital + interesTotal) * 100) / 100;

    const meses = anosNum * 12;
    const quincenas = anosNum * 24;

    const cuotaMensual = Math.round((totalPagar / meses) * 100) / 100;
    const cuotaQuincenal = Math.round((totalPagar / quincenas) * 100) / 100;

    const interesMensual = Math.round((interesTotal / meses) * 100) / 100;
    const interesQuincenal = Math.round((interesTotal / quincenas) * 100) / 100;

    const resultado = {
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      telefono: telefono.trim(),
      proyecto: nombreProyecto,
      costoKit: costo,
      abonoIngresado: abono,
      capitalInicial: capital,
      anos: anosNum,
      porcentajeRecargo,
      interesTotal,
      totalPagar,
      cuotasMeses: meses,
      cuotasQuincenas: quincenas,
      cuotaMensual,
      cuotaQuincenal,
      interesMensual,
      interesQuincenal,
      frecuencia,
      fechaEmision: new Date().toLocaleDateString('es-PA')
    };

    setCotizacionCalculada(resultado);
    setPaso('resultado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardarEnCartera = async () => {
    if (!cotizacionCalculada) return;
    setGuardando(true);
    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cotizacionCalculada)
      });
      if (!res.ok) throw new Error('Error al guardar en el servidor');
      const cuentaCreada = await res.json();
      alGuardarEnCartera(cuentaCreada.id);
    } catch (err) {
      console.error(err);
      mostrarMensaje('No se pudo guardar la cuenta', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const seleccionarFrecuencia = (nuevaFrecuencia) => {
    setFrecuencia(nuevaFrecuencia);
    if (cotizacionCalculada) {
      setCotizacionCalculada(prev => ({
        ...prev,
        frecuencia: nuevaFrecuencia
      }));
    }
  };

  const reiniciar = () => {
    setNombre('');
    setCedula('');
    setTelefono('');
    setKitSeleccionado('');
    setCostoKit('');
    setAbonoIngresado('');
    setMinimoAbono(0);
    setAnos(1);
    setFrecuencia('quincenal');
    setCotizacionCalculada(null);
    setPaso('formulario');
  };

  return (
    <div>
      {paso === 'formulario' ? (
        <div className="card">
          <div className="card-title-bar">
            <div>
              <h2 className="title-main"><span className="brand-slashes">//</span> Generador de Cotizaciones</h2>
              <p className="title-sub">Calcula financiamientos con tasa anual del 10% y abono inicial mínimo del 20%.</p>
            </div>
          </div>

          <form onSubmit={calcularCotizacion}>
            <div className="form-group">
              <label>Nombre del Cliente *</label>
              <input
                type="text"
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Cédula de Identidad</label>
                <input
                  type="text"
                  className="form-control"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Seleccionar Kit de Paneles Solares *</label>
              <select
                className="form-control"
                value={kitSeleccionado}
                onChange={alSeleccionarKit}
                required
              >
                <option value="" disabled>-- Elija un Kit Solar Vigitec --</option>
                {(window.KITS_PREDEFINIDOS || KITS_PREDEFINIDOS).map((kit) => (
                  <option key={kit.id} value={kit.id}>
                    {kit.nombre} - {formatearMoneda(kit.precio)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>
                  Abono Inicial ($) *
                  {minimoAbono > 0 && (
                    <span className="badge-min">Mín. 20%: {formatearMoneda(minimoAbono)}</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={abonoIngresado}
                  onChange={(e) => setAbonoIngresado(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Años a Financiar *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-control"
                  value={anos}
                  onChange={(e) => setAnos(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>
              Generar Cotización
            </button>
          </form>
        </div>
      ) : (
        /* Vista de Cotización Apta para Impresión / PDF */
        <div>
          <div className="documento-cotizacion">
            <div className="doc-header-brand">
              <div>
                <img src="img/logo.png" alt="// VIGITEC SECURITY" className="doc-logo-img" />
                <p style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 'bold' }}>
                  Sistemas de Paneles Solares y Financiamiento Privado
                </p>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Vigitec Security Group S.E.P. • República de Panamá
                </p>
              </div>
              <div className="doc-meta">
                <div className="badge-folio">PROPUESTA DE FINANCIAMIENTO</div>
                <div>Fecha: {cotizacionCalculada.fechaEmision}</div>
                <div>Modalidad: {cotizacionCalculada.frecuencia.toUpperCase()}</div>
              </div>
            </div>

            <div className="grid-dos-columnas">
              <div className="bloque-info">
                <div className="bloque-titulo">Datos del Cliente</div>
                <table className="tabla-resumen">
                  <tbody>
                    <tr><th>Nombre:</th><td><strong>{cotizacionCalculada.nombre}</strong></td></tr>
                    <tr><th>Cédula:</th><td>{cotizacionCalculada.cedula || 'N/A'}</td></tr>
                    <tr><th>Teléfono:</th><td>{cotizacionCalculada.telefono || 'N/A'}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="bloque-info">
                <div className="bloque-titulo">Proyecto Seleccionado</div>
                <table className="tabla-resumen">
                  <tbody>
                    <tr><th>Kit Solar:</th><td><strong>{cotizacionCalculada.proyecto}</strong></td></tr>
                    <tr><th>Plazo:</th><td>{cotizacionCalculada.anos} año(s)</td></tr>
                    <tr><th>Tasa Total:</th><td>{cotizacionCalculada.porcentajeRecargo}%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bloque-info" style={{ marginBottom: '1.5rem' }}>
              <div className="bloque-titulo">Detalle del Financiamiento</div>
              <table className="tabla-resumen">
                <tbody>
                  <tr><th>Costo Total del Equipo:</th><td>{formatearMoneda(cotizacionCalculada.costoKit)}</td></tr>
                  <tr><th>(-) Abono Inicial:</th><td className="text-green">- {formatearMoneda(cotizacionCalculada.abonoIngresado)}</td></tr>
                  <tr><th>(=) Saldo a Financiar (Capital):</th><td><strong>{formatearMoneda(cotizacionCalculada.capitalInicial)}</strong></td></tr>
                  <tr><th>(+) Recargo / Interés Total ({cotizacionCalculada.porcentajeRecargo}%):</th><td className="text-red">+ {formatearMoneda(cotizacionCalculada.interesTotal)}</td></tr>
                  <tr className="fila-total">
                    <th>TOTAL A PAGAR EN CUOTAS:</th>
                    <td>{formatearMoneda(cotizacionCalculada.totalPagar)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'center' }} className="no-print">
              <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, fontWeight: 600 }}>
                Haga clic sobre una opción para seleccionar entre modalidad <strong>Quincenal</strong> o <strong>Mensual</strong>:
              </p>
            </div>

            <div className="cuotas-box-grid">
              <div
                className={`cuota-card ${cotizacionCalculada.frecuencia === 'quincenal' ? 'destacada' : ''}`}
                onClick={() => seleccionarFrecuencia('quincenal')}
                role="button"
                tabIndex={0}
                title="Haga clic para elegir modalidad Quincenal"
              >
                <div className="cuota-titulo">
                  Opción Quincenal ({cotizacionCalculada.cuotasQuincenas} cuotas)
                </div>
                <div className="cuota-monto">{formatearMoneda(cotizacionCalculada.cuotaQuincenal)}</div>
                <div className="cuota-sub">Interés quincenal: {formatearMoneda(cotizacionCalculada.interesQuincenal)}</div>
                <div className="no-print" style={{ marginTop: '0.65rem' }}>
                  {cotizacionCalculada.frecuencia === 'quincenal' ? (
                    <span style={{ display: 'inline-block', background: 'var(--rojo)', color: '#ffffff', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', letterSpacing: '0.03em' }}>
                      MODALIDAD SELECCIONADA
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Clic para seleccionar Quincenal
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`cuota-card ${cotizacionCalculada.frecuencia === 'mensual' ? 'destacada' : ''}`}
                onClick={() => seleccionarFrecuencia('mensual')}
                role="button"
                tabIndex={0}
                title="Haga clic para elegir modalidad Mensual"
              >
                <div className="cuota-titulo">
                  Opción Mensual ({cotizacionCalculada.cuotasMeses} cuotas)
                </div>
                <div className="cuota-monto">{formatearMoneda(cotizacionCalculada.cuotaMensual)}</div>
                <div className="cuota-sub">Interés mensual: {formatearMoneda(cotizacionCalculada.interesMensual)}</div>
                <div className="no-print" style={{ marginTop: '0.65rem' }}>
                  {cotizacionCalculada.frecuencia === 'mensual' ? (
                    <span style={{ display: 'inline-block', background: 'var(--rojo)', color: '#ffffff', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', letterSpacing: '0.03em' }}>
                      MODALIDAD SELECCIONADA
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Clic para seleccionar Mensual
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="firmas-impresion">
              <div className="firma-caja">
                <div className="firma-linea"></div>
                <div className="firma-nombre">Representante Autorizado</div>
                <div className="firma-cargo">// Vigitec Security Group S.E.P.</div>
              </div>
              <div className="firma-caja">
                <div className="firma-linea"></div>
                <div className="firma-nombre">{cotizacionCalculada.nombre}</div>
                <div className="firma-cargo">Firma de Conformidad del Cliente</div>
              </div>
            </div>

            <div className="doc-footer">
              Propuesta formal de financiamiento privado. Válida por 30 días a partir de su emisión.
            </div>
          </div>

          <div className="barra-acciones-cotizacion no-print">
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setPaso('formulario')}>
                Modificar
              </button>
              <button className="btn btn-secondary" onClick={reiniciar}>
                Crear Nueva
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-imprimir" onClick={() => window.print()}>
                Imprimir Cotización (PDF)
              </button>
              <button
                className="btn btn-primary"
                onClick={guardarEnCartera}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar en Cartera de Clientes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.ModuloCotizador = ModuloCotizador;
