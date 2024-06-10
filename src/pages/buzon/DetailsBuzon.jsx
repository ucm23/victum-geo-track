import React, { useEffect, useState } from 'react'
import { styles } from '../../utils/styles';
import { Button, Descriptions } from 'antd';
import {
    Stack,
    Divider,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import '../../assets/styles/truck.css'
import moment from 'moment/moment';
import { getCurrencyMoney } from '../../utils/moment-config';

const DetailsBuzon = ({ company_id, onClose, item, setUpList }) => {

    const [invoiceDataView, setInvoiceDataView] = useState([]);

    useEffect(() => {
        setInvoiceDataView([
            {
                key: '1',
                label: 'Nombre del emisor',
                children: item?.emisorNombre,
            },
            {
                key: '2',
                label: 'RFC del emisor',
                children: item?.emisorRfc,
                span: 2,
            },
            {
                key: '3',
                label: 'Nombre del receptor',
                children: item?.receptorNombre,
            },
            {
                key: '4',
                label: 'RFC del receptor',
                children: item?.receptorRfc,
                span: 2,
            },
            {
                key: '5',
                label: 'UUID',
                children: <strong>{item?.uuid}</strong>
            },
            {
                key: '6',
                label: 'Folio',
                children: item?.folio,
                span: 2,
            },
            {
                key: '7',
                label: 'Subtotal ($)',
                children: getCurrencyMoney(item?.subtotal),
            },
            {
                key: '8',
                label: 'Total ($)',
                children: getCurrencyMoney(item?.total),
            },
            {
                key: '9',
                label: 'Forma de pago',
                children: item?.formaPago,
            },
            {
                key: '10',
                label: 'Tipo de moneda',
                children: item?.tipoMoneda,
            },
            {
                key: '11',
                label: 'Tipo de pago',
                children: item?.tipoPago,
            },
            {
                key: '12',
                label: 'Condiciones de pago',
                children: item?.condicionesPago,
            },
            {
                key: '13',
                label: 'Fecha de emisión',
                children: moment(item?.fechaEmision).format('DD-MM-YYYY HH:MM'),
            },
            {
                key: '14',
                label: 'Fecha de timbrado',
                children: moment(item?.fechaTimbrado).format('DD-MM-YYYY HH:MM'),
            },
        ])
    }, [company_id]);


    return (
        <div>
            <ModalHeader>{`Factura ${item?.folio} - ${item?.receptorNombre}`}</ModalHeader>
            <ModalCloseButton />
            <Divider />
            <ModalBody>
                <div className='tab-panel'>
                    <Stack mt={2} />
                    <Descriptions
                        size={'small'}
                        bordered
                        layout="vertical"
                        items={invoiceDataView}
                    />
                </div>
            </ModalBody>
            <Divider mt={3} />
            <ModalFooter style={styles['content-btn-modal-footer']}>
                <Button type="link" onClick={() => onClose()}>Cerrar</Button>
            </ModalFooter>
        </div>
    );
};

export default DetailsBuzon