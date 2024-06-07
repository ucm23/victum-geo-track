import moment from 'moment';
//require('moment/locale/es.js');
moment.locale('es-MX');
const hoy = moment()
console.log(moment.locale());  // Debería imprimir 'fr'
console.log(hoy); // Debería imprimir la fecha en frances

export default moment;


export const getCurrencyMoney = data => {
    if (!data) return 0.0;
    let mony = parseFloat(data) + 0;
    return mony.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}