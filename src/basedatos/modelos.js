const { DataTypes } = require('sequelize');
const conexionOrm = require('./conexion');

/**
 * Modelo ORM para Cotizaciones / Financiamientos de Clientes.
 */
const Cotizacion = conexionOrm.define('Cotizacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cedula: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  proyecto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  costoKit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  abonoInicial: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  capitalInicial: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  anos: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  porcentajeRecargo: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  interesTotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  capitalRestante: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  interesRestante: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  frecuencia: {
    type: DataTypes.STRING,
    defaultValue: 'quincenal'
  },
  cuotasTotales: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVO'
  }
}, {
  tableName: 'vigitec_cotizaciones',
  timestamps: true
});

/**
 * Modelo ORM para Pagos y Abonos de Amortización.
 */
const Pago = conexionOrm.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cotizacionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cotizacion,
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaRaw: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  metodo: {
    type: DataTypes.STRING,
    defaultValue: 'Efectivo'
  },
  monto: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  interes: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  capital: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  saldoRestante: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  nota: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'vigitec_pagos',
  timestamps: true
});

// Relación de asociación 1 a Muchos con eliminación en cascada
Cotizacion.hasMany(Pago, {
  as: 'pagos',
  foreignKey: 'cotizacionId',
  onDelete: 'CASCADE'
});

Pago.belongsTo(Cotizacion, {
  as: 'cotizacion',
  foreignKey: 'cotizacionId'
});

module.exports = {
  conexionOrm,
  Cotizacion,
  Pago
};
