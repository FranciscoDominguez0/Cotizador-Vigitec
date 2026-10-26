/**
 * Servicio Financiero de Cotización.
 * Principio de Responsabilidad Única (SRP):
 * Cálculos matemáticos puros para kits de paneles solares y financiamiento.
 */
class ServicioFinanciero {
  redondear(valor) {
    return Math.round(Number(valor) * 100) / 100;
  }

  calcularAbonoMinimo(costoTotal) {
    return this.redondear(costoTotal * 0.20);
  }

  calcularCotizacion({ costoKit, abonoIngresado, anos }) {
    const costo = parseFloat(costoKit);
    const anosEntero = parseInt(anos, 10);

    if (isNaN(costo) || costo <= 0) {
      throw new Error('El costo del kit debe ser mayor a 0');
    }
    if (isNaN(anosEntero) || anosEntero <= 0) {
      throw new Error('Los años a financiar deben ser un número entero mayor a 0');
    }

    const abonoMinimo = this.calcularAbonoMinimo(costo);
    let abonoFinal = abonoMinimo;

    if (abonoIngresado !== undefined && abonoIngresado !== null && abonoIngresado !== '') {
      const abonoPersonalizado = parseFloat(abonoIngresado);
      if (isNaN(abonoPersonalizado)) {
        throw new Error('El abono ingresado no es válido');
      }
      if (abonoPersonalizado < abonoMinimo) {
        throw new Error(`El abono no puede ser menor al 20% obligatorio ($${abonoMinimo.toFixed(2)})`);
      }
      if (abonoPersonalizado >= costo) {
        throw new Error('El abono inicial no puede ser mayor o igual al costo total');
      }
      abonoFinal = this.redondear(abonoPersonalizado);
    }

    // Capital base
    const capitalInicial = this.redondear(costo - abonoFinal);

    // Tasa: 10% anual de recargo
    const porcentajeRecargo = 10 * anosEntero;
    const interesTotal = this.redondear(capitalInicial * (porcentajeRecargo / 100));
    const totalPagar = this.redondear(capitalInicial + interesTotal);

    const meses = anosEntero * 12;
    const quincenas = anosEntero * 24;

    const cuotaMensual = this.redondear(totalPagar / meses);
    const cuotaQuincenal = this.redondear(totalPagar / quincenas);

    const interesMensual = this.redondear(interesTotal / meses);
    const interesQuincenal = this.redondear(interesTotal / quincenas);

    return {
      costoKit: costo,
      abonoInicial: abonoFinal,
      abonoMinimo: abonoMinimo,
      capitalInicial: capitalInicial,
      anos: anosEntero,
      porcentajeRecargo: porcentajeRecargo,
      interesTotal: interesTotal,
      totalPagar: totalPagar,
      cuotasMeses: meses,
      cuotasQuincenas: quincenas,
      cuotaMensual: cuotaMensual,
      cuotaQuincenal: cuotaQuincenal,
      interesMensual: interesMensual,
      interesQuincenal: interesQuincenal
    };
  }
}

module.exports = new ServicioFinanciero();
