/**
 * Aplicación Principal Vigitec Security Group S.E.P.
 * Arquitectura Modular y Clean Code en Español.
 */

const { useState } = React;

function AplicacionVigitec() {
  const [moduloActivo, setModuloActivo] = useState('cotizador'); // 'cotizador' | 'cartera' | 'estado_cuenta'
  const [cuentaSeleccionadaId, setCuentaSeleccionadaId] = useState(null);
  const [notificacion, setNotificacion] = useState(null);

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setNotificacion({ texto, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  const verEstadoCuenta = (id) => {
    setCuentaSeleccionadaId(id);
    setModuloActivo('estado_cuenta');
  };

  return (
    <div>
      {/* Cabecera Corporativa Blanca con Rojo */}
      <header className="app-header no-print">
        <div className="header-container">
          <div className="brand-logo">
            <img src="img/logo.png" alt="// VIGITEC SECURITY" className="brand-logo-img" />
            <span className="brand-tag">Financiamiento Privado</span>
          </div>

          <nav className="nav-buttons">
            <button
              className={`nav-btn ${moduloActivo === 'cotizador' ? 'active' : ''}`}
              onClick={() => setModuloActivo('cotizador')}
            >
              Nuevo Cotizador
            </button>
            <button
              className={`nav-btn ${moduloActivo === 'cartera' || moduloActivo === 'estado_cuenta' ? 'active' : ''}`}
              onClick={() => setModuloActivo('cartera')}
            >
              Cartera de Clientes
            </button>
          </nav>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="main-wrapper">
        {moduloActivo === 'cotizador' && (
          <ModuloCotizador
            alGuardarEnCartera={(id) => {
              mostrarMensaje('Cliente guardado exitosamente.');
              verEstadoCuenta(id);
            }}
            mostrarMensaje={mostrarMensaje}
          />
        )}

        {moduloActivo === 'cartera' && (
          <ModuloCartera
            alVerCuenta={verEstadoCuenta}
            mostrarMensaje={mostrarMensaje}
          />
        )}

        {moduloActivo === 'estado_cuenta' && (
          <ModuloEstadoCuenta
            cuentaId={cuentaSeleccionadaId}
            alVolver={() => setModuloActivo('cartera')}
            mostrarMensaje={mostrarMensaje}
          />
        )}
      </main>

      {/* Notificaciones Toast */}
      {notificacion && (
        <div className="toast-container no-print">
          <div className={`toast-item ${notificacion.tipo}`}>
            {notificacion.texto}
          </div>
        </div>
      )}
    </div>
  );
}

// Inicialización de la aplicación React en el DOM
const contenedor = document.getElementById('root');
const raiz = ReactDOM.createRoot(contenedor);
raiz.render(<AplicacionVigitec />);
