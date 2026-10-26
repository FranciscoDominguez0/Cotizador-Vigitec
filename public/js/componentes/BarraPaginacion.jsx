/**
 * Componente Reutilizable: Barra de Paginación.
 */
function BarraPaginacion({
  paginaActual,
  totalPaginas,
  alCambiarPagina,
  totalElementos,
  elementosPorPagina
}) {
  if (totalElementos <= 0) return null;

  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const indiceFin = Math.min(indiceInicio + elementosPorPagina, totalElementos);

  return (
    <div className="barra-paginacion no-print">
      <div className="paginacion-info">
        Mostrando <strong>{indiceInicio + 1}</strong> - <strong>{indiceFin}</strong> de <strong>{totalElementos}</strong> registros
      </div>

      <div className="paginacion-controles">
        <button
          className="btn-pagina"
          disabled={paginaActual === 1}
          onClick={() => alCambiarPagina(Math.max(1, paginaActual - 1))}
        >
          &laquo; Anterior
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`btn-pagina ${paginaActual === num ? 'activa' : ''}`}
            onClick={() => alCambiarPagina(num)}
          >
            {num}
          </button>
        ))}

        <button
          className="btn-pagina"
          disabled={paginaActual === totalPaginas}
          onClick={() => alCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
        >
          Siguiente &raquo;
        </button>
      </div>
    </div>
  );
}

window.BarraPaginacion = BarraPaginacion;
