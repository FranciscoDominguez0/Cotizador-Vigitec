/**
 * Módulo: Cartera de Clientes con Búsqueda, Paginación de 10 y Confirmación de Eliminación.
 */
function ModuloCartera({ alVerCuenta, mostrarMensaje }) {
  const { useState, useEffect } = React;

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [eliminandoCliente, setEliminandoCliente] = useState(false);
  const ITEMS_POR_PAGINA = 10;

  const cargarClientes = async (q = '') => {
    try {
      setCargando(true);
      const res = await fetch(`/api/cotizaciones?q=${encodeURIComponent(q)}`);
      const datos = await res.json();
      setClientes(datos);
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al consultar la cartera de clientes', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setPaginaActual(1);
    cargarClientes(busqueda);
  }, [busqueda]);

  const totalPaginas = Math.ceil(clientes.length / ITEMS_POR_PAGINA) || 1;
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const clientesPaginados = clientes.slice(indiceInicio, indiceInicio + ITEMS_POR_PAGINA);

  return (
    <div className="card">
      <div className="card-title-bar">
        <div>
          <h2 className="title-main"><span className="brand-slashes">//</span> Cartera de Clientes</h2>
          <p className="title-sub">Gestión de cuentas y saldos de financiamiento.</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre o cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="tabla-vigitec">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Proyecto</th>
              <th>Modalidad</th>
              <th>Deuda Restante</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>Cargando clientes...</td></tr>
            ) : clientes.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>No hay clientes registrados en la cartera.</td></tr>
            ) : (
              clientesPaginados.map((c) => {
                const totalRestante = parseFloat(c.capitalRestante) + parseFloat(c.interesRestante);
                return (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.nombre}</strong><br />
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{c.cedula || 'Sin cédula'}</span>
                    </td>
                    <td>{c.proyecto}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{c.frecuencia}</span></td>
                    <td className={`font-bold ${totalRestante <= 0 ? 'text-green' : 'text-red'}`}>
                      {formatearMoneda(totalRestante)}
                    </td>
                    <td>
                      <span className={`badge-min ${totalRestante <= 0 ? 'text-green' : ''}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => alVerCuenta(c.id)}>
                          Ver Cuenta
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setClienteAEliminar({ id: c.id, nombre: c.nombre })}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación Reutilizable */}
      <BarraPaginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        alCambiarPagina={(nuevaPagina) => setPaginaActual(nuevaPagina)}
        totalElementos={clientes.length}
        elementosPorPagina={ITEMS_POR_PAGINA}
      />

      {/* Modal de Confirmación para Eliminar Cliente */}
      {clienteAEliminar && (
        <ModalConfirmacion
          titulo="Eliminar Cliente"
          mensaje={`¿Está seguro de que desea eliminar permanentemente al cliente "${clienteAEliminar.nombre}" y todo su historial de crédito y abonos? Esta acción no se puede deshacer.`}
          alConfirmar={async () => {
            try {
              setEliminandoCliente(true);
              const res = await fetch(`/api/cotizaciones/${clienteAEliminar.id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error();
              mostrarMensaje('Cliente eliminado exitosamente.');
              setClienteAEliminar(null);
              cargarClientes(busqueda);
            } catch (err) {
              console.error(err);
              mostrarMensaje('No se pudo eliminar el cliente', 'error');
            } finally {
              setEliminandoCliente(false);
            }
          }}
          alCancelar={() => setClienteAEliminar(null)}
          procesando={eliminandoCliente}
        />
      )}
    </div>
  );
}

window.ModuloCartera = ModuloCartera;
