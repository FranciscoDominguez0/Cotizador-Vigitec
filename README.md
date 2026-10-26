# // VIGITEC SECURITY - Sistema Financiero Privado

Aplicación corporativa desarrollada con **Node.js**, **React** y **PostgreSQL (Sequelize ORM)**.

---

## 🎨 Identidad Visual y Diseño
- **Paleta oficial:** Blanco (`#ffffff`), Rojo Vigitec (`#dc2626`) y Negro (`#0f0f10`).
- **Logo oficial:** `// VIGITEC SECURITY`
- **Estructura limpia:** Únicamente 2 módulos principales (**Nuevo Cotizador** y **Cartera de Clientes**) más el **Estado de Cuenta**. Sin dashboards ni métricas innecesarias.

---

## 🚀 Opciones de Ejecución

### Opción 1: Ejecución con Docker Compose (Recomendada)
Para correr la aplicación y la base de datos en contenedores aislados:
```bash
docker compose up -d --build
```
O simplemente haz doble clic en **`iniciar-docker.bat`**.

- **Web App:** [http://localhost:3005](http://localhost:3005) (o `http://TU_IP:3005`)  
  *(Usa el puerto **3005** para no colisionar con 3000 ni 3001).*
- **Base de Datos PostgreSQL:** Accesible por IP en el puerto **`5433`** (para no colisionar con el PostgreSQL local en el 5432).  
  *Conexión desde DBeaver/pgAdmin o LAN:* `TU_IP:5433` | Usuario: `fran2003` | Clave: `fran0803` | BD: `vigitec_db`

---

### Opción 2: Ejecución Local en Windows
Haz doble clic sobre:
```text
iniciar-vigitec.bat
```
O mediante consola:
```bash
npm start
```
Acceso en: [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Arquitectura y Clean Code

### Backend (`src/`)
- **`server.js`**: Servidor único consolidado (sin duplicados ni redirecciones).
- **`basedatos/conexion.js`**: Conexión ORM Sequelize a PostgreSQL.
- **`basedatos/modelos.js`**: Modelos relacionales `Cotizacion` y `Pago` con eliminación en cascada.
- **`servicios/servicioFinanciero.js`**: Fórmulas financieras (10% anual, 20% abono mínimo).
- **`servicios/servicioAmortizacion.js`**: Imputación de intereses primero y saldo a capital.
- **`servicios/servicioCartera.js`**: Transacciones ACID con recálculo en cascada.
- **`controladores/`**: `controladorCotizaciones.js` y `controladorPagos.js`.
- **`rutas/rutasApi.js`**: Endpoints REST.

### Frontend Modular (`public/`)
- **`app.jsx`**: Punto de entrada ligero para navegación y notificaciones.
- **`js/componentes/ModalConfirmacion.jsx`**: Modal de confirmación para eliminar clientes y abonos.
- **`js/componentes/ModalEditarPago.jsx`**: Modal para modificar registros de pago.
- **`js/componentes/BarraPaginacion.jsx`**: Control de paginación de 10 registros.
- **`js/componentes/ModuloCotizador.jsx`**: Generador de cotizaciones y vista previa formal.
- **`js/componentes/ModuloCartera.jsx`**: Lista de clientes con búsqueda y paginación.
- **`js/componentes/ModuloEstadoCuenta.jsx`**: Vista oficial de estado de cuenta y registro de abonos.
- **`js/constantes/kits.js`**: Catálogo de kits solares.
- **`js/utilidades/formato.js`**: Formateadores de moneda y fechas.
- **`style.css`**: Hoja de estilos con reglas `@media print` para exportar a PDF membretado.
