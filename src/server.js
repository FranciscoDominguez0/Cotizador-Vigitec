const express = require('express');
const cors = require('cors');
const path = require('path');
const { conexionOrm } = require('./basedatos/modelos');
const rutasApi = require('./rutas/rutasApi');

/**
 * Servidor Principal Único de la Aplicación.
 * Arquitectura Clean Code con ORM Sequelize y PostgreSQL.
 */
class Servidor {
  constructor() {
    this.app = express();
    this.puerto = process.env.PORT || 3000;
    this.configurarMiddlewares();
    this.configurarRutas();
  }

  configurarMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  configurarRutas() {
    this.app.use('/api', rutasApi);

    // Fallback para SPA React
    this.app.use((req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  async iniciar() {
    try {
      console.log('Conectando a PostgreSQL con Sequelize ORM...');
      await conexionOrm.authenticate();
      await conexionOrm.sync({ alter: true });
      console.log('✅ Base de datos PostgreSQL y modelos ORM sincronizados correctamente.');

      this.app.listen(this.puerto, '0.0.0.0', () => {
        console.log('================================================================');
        console.log('       // VIGITEC SECURITY - SISTEMA FINANCIERO PRIVADO         ');
        console.log('================================================================');
        console.log(`🚀 Acceso Local:      http://localhost:${this.puerto}`);
        console.log(`🌐 Acceso Red (LAN):  http://0.0.0.0:${this.puerto}`);
        console.log('================================================================');
      });
    } catch (error) {
      console.error('❌ Error al iniciar el servidor con ORM:', error);
      process.exit(1);
    }
  }
}

const servidor = new Servidor();
servidor.iniciar();

module.exports = servidor;
