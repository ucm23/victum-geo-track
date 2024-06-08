import React, { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik';
import { messagesNotificationTruck, supabase } from '../../utils/supabase';
import { styles } from '../../utils/styles';
import { notification, Button, Descriptions } from 'antd';
import {
    Input,
    Stack,
    Select,
    FormControl,
    FormLabel,
    Divider,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import '../../assets/styles/truck.css'
import moment from 'moment/moment';
import { getCurrencyMoney } from '../../utils/moment-config';

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const DetailsBuzon = ({ company_id, onClose, item, setUpList }) => {

    const [errors, setErrors] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(api, type, description)
    const [groups, setGroups] = useState([]);
    let error = 'Campo requerido';
    const validate = (value) => !value && error;
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
            {contextHolder}
            <ModalHeader>{`Factura ${item?.folio} - ${item?.receptorNombre}`}</ModalHeader>
            <ModalCloseButton />
            <Divider />
            <ModalBody>
                <div className='tab-panel'>
                    <Stack mt={2} />
                    <Descriptions
                        //title={`Factura ${item?.folio} - ${item?.receptorNombre}`}
                        size={'small'}
                        bordered
                        layout="vertical"
                        items={invoiceDataView} />
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