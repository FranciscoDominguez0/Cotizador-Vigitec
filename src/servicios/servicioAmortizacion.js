/**
 * Servicio de Amortización y Recálculo de Saldos.
 * Principio de Responsabilidad Única (SRP):
 * Procesa la cadena cronológica de abonos:
 * 1. El pago cubre primero el interés de la cuota teórica.
 * 2. El excedente reduce directamente el capital.
 * 3. Si el interés del pago excede el interés pendiente, el sobrante pasa a capital.
 * 4. Si el pago a capital supera el saldo de capital pendiente, se ajusta al saldo.
 */
class ServicioAmortizacion {
  redondear(valor) {
    return Math.round(Number(valor) * 100) / 100;
  }

  recalcularCadenaPagos(cotizacion, listaPagos) {
    let interesRestante = parseFloat(cotizacion.interesTotal);
    let capitalRestante = parseFloat(cotizacion.capitalInicial);

    const cuotasTotales = parseInt(cotizacion.cuotasTotales, 10);
    const interesPorCuotaTeorica = this.redondear(cotizacion.interesTotal / cuotasTotales);

    const pagosActualizados = listaPagos.map((pago) => {
      const monto = parseFloat(pago.monto);
      let abonoInteres = 0;
      let abonoCapital = 0;

      if (monto >= interesPorCuotaTeorica) {
        abonoInteres = interesPorCuotaTeorica;
        abonoCapital = monto - interesPorCuotaTeorica;
      } else {
        abonoInteres = monto;
        abonoCapital = 0;
      }

      if (abonoInteres > interesRestante) {
        const sobrante = abonoInteres - interesRestante;
        abonoInteres = interesRestante;
        abonoCapital += sobrante;
      }

      if (abonoCapital > capitalRestante) {
        abonoCapital = capitalRestante;
      }

      interesRestante = this.redondear(interesRestante - abonoInteres);
      capitalRestante = this.redondear(capitalRestante - abonoCapital);

      if (interesRestante < 0.005) interesRestante = 0;
      if (capitalRestante < 0.005) capitalRestante = 0;

      const saldoRestanteTotal = this.redondear(interesRestante + capitalRestante);

      return {
        id: pago.id,
        fecha: pago.fecha,
        fechaRaw: pago.fechaRaw,
        metodo: pago.metodo,
        monto: this.redondear(monto),
        interes: this.redondear(abonoInteres),
        capital: this.redondear(abonoCapital),
        saldoRestante: saldoRestanteTotal,
        nota: pago.nota
      };
    });

    const estado = (interesRestante === 0 && capitalRestante === 0) ? 'SALDADO' : 'ACTIVO';

    return {
      capitalRestante,
      interesRestante,
      saldoTotal: this.redondear(capitalRestante + interesRestante),
      estado,
      pagos: pagosActualizados
    };
  }
}

module.exports = new ServicioAmortizacion();
