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
      const monto = this.redondear(parseFloat(pago.monto));

      // 1. Cubrir primero la cuota de interés teórica (hasta lo que quede de interés pendiente)
      const cuotaInteres = Math.min(interesPorCuotaTeorica, interesRestante);
      let abonoInteres = Math.min(monto, cuotaInteres);
      let sobrante = this.redondear(monto - abonoInteres);

      // 2. El sobrante reduce directamente el capital pendiente
      let abonoCapital = Math.min(sobrante, capitalRestante);
      sobrante = this.redondear(sobrante - abonoCapital);

      // 3. Si aún queda dinero sobrante (por ejemplo si el capital ya se saldó o estaba en 0),
      // ese sobrante amortiza el resto del interés pendiente para que todo el dinero abone a la deuda.
      if (sobrante > 0) {
        const interesDisponible = this.redondear(interesRestante - abonoInteres);
        const extraInteres = Math.min(sobrante, interesDisponible);
        abonoInteres = this.redondear(abonoInteres + extraInteres);
        sobrante = this.redondear(sobrante - extraInteres);
      }

      abonoInteres = this.redondear(abonoInteres);
      abonoCapital = this.redondear(abonoCapital);

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
        monto: monto,
        interes: abonoInteres,
        capital: abonoCapital,
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
