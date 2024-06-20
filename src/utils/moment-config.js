import moment from 'moment';
moment.locale('es-MX');
export default moment;


export const getCurrencyMoney = data => {
    if (!data) return 0.0;
    let mony = parseFloat(data) + 0;
    return mony.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}