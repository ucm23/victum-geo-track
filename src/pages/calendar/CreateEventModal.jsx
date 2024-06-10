import React, { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik';
import { messagesNotificationTruck, supabase } from '../../utils/supabase';
import { styles } from '../../utils/styles';
import { notification, Button, Upload, Descriptions } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getCurrencyMoney } from '../../utils/moment-config';
import moment from 'moment/moment';
import {
    Input,
    Stack,
    HStack,
    Select,
    FormControl,
    FormLabel,
    Divider,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    NumberInput,
    NumberInputField,
    Box,
    Icon,
    Text,
    Badge,
    Radio, RadioGroup
} from '@chakra-ui/react'
import '../../assets/styles/truck.css'
import { parseString } from 'xml2js';

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const CreateEventModal = ({ company_id, onClose, item, setUpList }) => {

    //const [errors, setErrors] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)
    const [panel, setPanel] = useState(false)
    const [route_seleccionado, setRouteSeleccionado] = useState(null)
    //const [dateSelect, setDateSelect] = useState(null)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(api, type, description)
    let error = 'Campo requerido';
    const validate = (value) => !value && error;
    const today = new Date().toISOString().split('T')[0];
    //const [groups, setGroups] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [routes, setRoutes] = useState([]);
    //const [status, setStatus] = useState([]);
    //const [state, setState] = useState('1');

    const [fileList, setFileList] = useState([
        {
            index: 0,
            name: "Sin Factura XML",
            type: "XML",
            file: null
        },
        {
            index: 1,
            name: "Sin Factura PDF",
            type: "PDF",
            file: null
        },
    ]);

    const [fileContent, setFileContent] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [invoiceDataView, setInvoiceDataView] = useState([]);
    const [orderData, setOrderData] = useState(null);

    const handleUploadChange = (file, index) => {

        const updatedFileList = fileList.map((item, idx) => {
            if (idx === index) {
                return { ...item, file };
            }
            return item;
        });
        setFileList(updatedFileList);
        if (file?.type.includes('xml')) {
            console.log("🚀 ~ handleUploadChange ~ file:", file)
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                console.log("🚀 ~ handleUploadChange ~ content:", content)
                setFileContent(content);
            };
            reader.readAsText(file);
        }
    };

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getDrivers();
        getTrucks();
        getRoutes();
        //getStatus();
        console.log("🚀 ~ useEffect ~ item:", item)
    }, [company_id]);

    async function getDrivers() {
        let { data, error } = await supabase.rpc('get_user_drivers_', { _company_id: company_id });
        if (error) return;
        if (data.length > 0) setDrivers(data)
    }

    async function getTrucks() {
        const { data, error } = await supabase.from('truck').select('*, groups!inner(company_id)').eq('groups.company_id', company_id);
        if (error) return;
        if (data.length > 0) setTrucks(data)
    }

    async function getRoutes() {
        const { data, error } = await supabase.from('routes').select('*').eq('company_id', company_id);
        if (error) return;
        if (data.length > 0) setRoutes(data)
        if (item?.id_route) setRouteSeleccionado(data.find((item_) => item_?.id === item?.id_route)?.id);
    }

    /*async function getStatus() {
        const { data, error } = await supabase.rpc('_get_status_ordered_by_id', { _company_id_: company_id });
        if (error) return;
        if (data.length > 0) setStatus(data)
    }*/

    function areFilesEquivalent(file1, file2) {
        const getFileNameWithoutExtension = (fileName) => {
            const extensionIndex = fileName.lastIndexOf('.');
            if (extensionIndex === -1) return fileName;
            return fileName.slice(0, extensionIndex).toLowerCase();
        };
        return getFileNameWithoutExtension(file1) === getFileNameWithoutExtension(file2);
    }

    const saveAll = async () => {
        try {
            setSubmitting(true)
            let { data: invoices, error: error_invoices } = await supabase.from('invoices').select("uuid").eq('uuid', invoiceData?.uuid)
            console.log("🚀 ~ saveAll ~ invoices:", invoices)
            if (error_invoices || invoices[0]?.uuid) {
                openNotification('warning', 'Factura subida con anterioridad')
                return 0
            }
            const { data, error: error_one } = await supabase.from('travel').insert([orderData]).select()
            if (error_one) {
                openNotification('error')
                return 0
            }

            let bodyContent_one = new FormData();
            bodyContent_one.append("file", fileList[0].file);

            let response_xml = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${data[0]?.id}/upload`, {
                method: "POST",
                body: bodyContent_one,
                headers: {}
            });

            //let data_one = 
            await response_xml.text();
            //console.log("🚀 ~ data_one:", data_one)
            let bodyContent_two = new FormData();
            bodyContent_two.append("file", fileList[1].file);

            let response_pdf = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${data[0]?.id}/upload`, {
                method: "POST",
                body: bodyContent_two,
                headers: {}
            });

            //let data_two = 
            await response_pdf.text();
            //console.log("🚀 ~ data_two:", data_two)

            setUpList(true)
            let response_files = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files?travel_id=${data[0]?.id}`);
            let data_files = await response_files.text();
            let files = JSON.parse(data_files)
            const { data: travel_final, error } = await supabase.from('travel').update({ files: files?.data, ot: `OT-${data[0]?.id}` }).eq('id', data[0]?.id).select()
            console.log("🚀 ~ travel_final:", travel_final)
            if (error) {
                openNotification('error')
                return 0;
            }
            invoiceData.order_id = data[0]?.id
            const { data: invoice, error: error_invoice } = await supabase.from('invoices').insert([invoiceData]).select()
            console.log("🚀 ~ saveAll ~ error_invoice:", error_invoice)
            console.log("🚀 ~ saveAll ~ invoice:", invoice)
            if (error_invoice) {
                openNotification('error')
                return 0
            }
            openNotification('success', `Orden de trabajo registrada.\nLe hemos añadido una clave unica OT-${data[0]?.id}.`)
        } catch (error) {
            console.log("🚀 ~ saveAll ~ error:", error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Formik
            initialValues={{
                name: `${item?.name || ""}`,
                description: `${item?.description || ""}`,
                status: `${item?.status || ""}`,
                id_user: `${item?.id_user || ""}`,
                id_truck: `${item?.id_truck || ""}`,
                id_route: `${item?.id_route || ""}`,
                cost: `${item?.cost || ""}`,
                cost_add: `${item?.cost_add || ""}`,
                date_out: `${item?.date_out || ""}`,
                date_arrival: `${item?.date_arrival || ""}`,
            }}
            onSubmit={async (values, actions) => {
                try {

                    //console.log(values)
                    //console.log("🚀 ~ fileList[0]?.file:", fileList[0]?.file, fileList[1]?.file)

                    if (!fileList[0]?.file || !fileList[1]?.file) {
                        openNotification('warning', 'Verifica las facturas XML y PDF adjuntas. Por favor, inténtalo de nuevo.')
                        return 0
                    }
                    if (!areFilesEquivalent(fileList[0]?.file?.name, fileList[1]?.file?.name)) {
                        openNotification('warning', 'Las facturas XML y PDF no coinciden. Por favor, inténtalo de nuevo.')
                        return 0
                    }
                    if (!fileContent) return 0
                    else {
                        parseString(fileContent, { explicitArray: false }, (err, result) => {
                            if (err) {
                                console.error('Error parsing XML:', err);
                                alert(`Verifique el formato XML. \nError: ${err}`)
                                return;
                            }
                            const comprobante = result['cfdi:Comprobante'];
                            const emisor = comprobante['cfdi:Emisor'];
                            const receptor = comprobante['cfdi:Receptor'];
                            const complemento = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'];
                            const extractedData = {
                                emisorNombre: emisor['$'].Nombre,
                                emisorRfc: emisor['$'].Rfc,
                                receptorNombre: receptor['$'].Nombre,
                                receptorRfc: receptor['$'].Rfc,
                                folio: comprobante['$'].Folio,
                                uuid: complemento['$'].UUID,
                                subtotal: parseFloat(comprobante['$'].SubTotal) || 0,
                                total: parseFloat(comprobante['$'].Total) || 0,
                                formaPago: comprobante['$'].FormaPago,
                                tipoMoneda: comprobante['$'].Moneda,
                                tipoPago: comprobante['$'].MetodoPago,
                                condicionesPago: comprobante['$'].CondicionesDePago,
                                fechaEmision: comprobante['$'].Fecha,
                                fechaTimbrado: complemento['$'].FechaTimbrado,
                                company_id,
                                status: 'Pendiente'
                            };
                            setInvoiceData(extractedData);
                            setInvoiceDataView([
                                {
                                    key: '1',
                                    label: 'Nombre del emisor',
                                    children: extractedData?.emisorNombre,
                                },
                                {
                                    key: '2',
                                    label: 'RFC del emisor',
                                    children: extractedData?.emisorRfc,
                                    span: 2,
                                },
                                {
                                    key: '3',
                                    label: 'Nombre del receptor',
                                    children: extractedData?.receptorNombre,
                                },
                                {
                                    key: '4',
                                    label: 'RFC del receptor',
                                    children: extractedData?.receptorRfc,
                                    span: 2,
                                },
                                {
                                    key: '5',
                                    label: 'UUID',
                                    children: <strong>{extractedData?.uuid}</strong>
                                },
                                {
                                    key: '6',
                                    label: 'Folio',
                                    children: extractedData?.folio,
                                    span: 2,
                                },
                                {
                                    key: '7',
                                    label: 'Subtotal ($)',
                                    children: getCurrencyMoney(extractedData?.subtotal),
                                },
                                {
                                    key: '8',
                                    label: 'Total ($)',
                                    children: getCurrencyMoney(extractedData?.total),
                                },
                                {
                                    key: '9',
                                    label: 'Forma de pago',
                                    children: extractedData?.formaPago,
                                },
                                {
                                    key: '10',
                                    label: 'Tipo de moneda',
                                    children: extractedData?.tipoMoneda,
                                },
                                {
                                    key: '11',
                                    label: 'Tipo de pago',
                                    children: extractedData?.tipoPago,
                                },
                                {
                                    key: '12',
                                    label: 'Condiciones de pago',
                                    children: extractedData?.condicionesPago,
                                },
                                {
                                    key: '13',
                                    label: 'Fecha de emisión',
                                    children: moment(extractedData?.fechaEmision).format('DD-MM-YYYY HH:MM'),
                                },
                                {
                                    key: '14',
                                    label: 'Fecha de timbrado',
                                    children: moment(extractedData?.fechaTimbrado).format('DD-MM-YYYY HH:MM'),
                                },
                            ])
                            console.log("🚀 ~ parseString ~ extractedData:", extractedData)
                        });
                        //return 0
                    }
                    const nextDay = new Date(values?.date_out);
                    console.log("🚀 ~ nextDay:", nextDay)
                    nextDay.setDate(nextDay.getDate() + 1);

                    const newValues = {
                        ...values,
                        cost: parseFloat(values?.cost),
                        id_user: parseFloat(values?.id_user),
                        id_truck: parseFloat(values?.id_truck),
                        id_route: parseFloat(values?.id_route),
                        date_out: `${values?.date_out}T00:00:00`,
                        date_arrival: nextDay.toISOString().split('T')[0] + 'T00:00:00',
                    }

                    console.log("🚀 ~ newValues:", newValues)

                    let dataInsert = {
                        //...newValues, 
                        id_user: newValues?.id_user,
                        id_truck: newValues?.id_truck,
                        id_route: newValues?.id_route,
                        date_out: newValues?.date_out,
                        date_arrival: newValues?.date_arrival,
                        cost: newValues?.cost || 0,
                        company_id,
                        status: 1,
                    }

                    console.log("🚀 ~ ~ dataInsert:", dataInsert)
                    setOrderData(dataInsert)
                    setPanel(true)

                    /*const { data, error: error_one } = await supabase.from('travel').insert([dataInsert]).select()
                    if (error_one) {
                        openNotification('error')
                        return 0
                    }

                    let bodyContent_one = new FormData();
                    bodyContent_one.append("file", fileList[0].file);

                    let response_xml = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${data[0]?.id}/upload`, {
                        method: "POST",
                        body: bodyContent_one,
                        headers: {}
                    });

                    //let data_one = 
                    await response_xml.text();
                    //console.log("🚀 ~ data_one:", data_one)
                    let bodyContent_two = new FormData();
                    bodyContent_two.append("file", fileList[1].file);

                    let response_pdf = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${data[0]?.id}/upload`, {
                        method: "POST",
                        body: bodyContent_two,
                        headers: {}
                    });

                    //let data_two = 
                    await response_pdf.text();
                    //console.log("🚀 ~ data_two:", data_two)

                    setUpList(true)
                    let response_files = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files?travel_id=${data[0]?.id}`);
                    let data_files = await response_files.text();
                    let files = JSON.parse(data_files)
                    const { data: travel_final, error } = await supabase.from('travel').update({ files: files?.data, ot: `OT-${data[0]?.id}` }).eq('id', data[0]?.id).select()
                    console.log("🚀 ~ travel_final:", travel_final)
                    if (error) {
                        openNotification('error')
                        return 0;
                    }
                    openNotification('success', `La orden de trabajo ha sido registrado.\nLe hemos añadido una clave unica OT-${data[0]?.id}`)
                    */

                } catch (error) {
                    console.log("🚀 ~ onSubmit={ ~ error:", error)
                }
            }}
        >
            {(props) => {
                const selectedRoute = routes.find((item) => item?.id == route_seleccionado);
                return (
                    <Form>
                        <div>
                            {contextHolder}
                            <ModalHeader>Añadir orden de trabajo</ModalHeader>
                            <ModalCloseButton disabled={isSubmitting} />
                            <Divider />
                            <ModalBody>
                                {!panel ?
                                    <div className='tab-panel'>
                                        <Stack direction='row' className='form-field' spacing={4}>
                                            <FormControl isInvalid={props.errors.id_truck && props.touched.id_truck}>
                                                <FormLabel>
                                                    <h1 className='form-label requeried'>Vehículo</h1>
                                                </FormLabel>
                                                <Field size='sm' as={Select} name="id_truck" placeholder="Seleccionar" validate={validate}>
                                                    {trucks.map((item, index) => (
                                                        <option key={`option-trucks-event-${item?.id}-${index}`} value={item?.id}>
                                                            {item?.no_econ} | {item?.brand} | {item?.model}
                                                        </option>
                                                    ))}
                                                </Field>
                                                {props.errors.id_truck && <h1 className='form-error'>{props.errors.id_truck}</h1>}
                                            </FormControl>
                                            <FormControl isInvalid={props.errors.id_user && props.touched.id_user}>
                                                <FormLabel>
                                                    <h1 className='form-label requeried'>Asignado a</h1>
                                                </FormLabel>
                                                <Field size='sm' as={Select} name="id_user" placeholder="Seleccionar" validate={validate}>
                                                    {drivers.map((item, index) => (
                                                        <option key={`option-drivers-event-${item?.id}-${index}`} value={item?.id}>
                                                            {item?.name} {item?.last_name} | {item?.no_econ}
                                                        </option>
                                                    ))}
                                                </Field>
                                                {props.errors.id_user && <h1 className='form-error'>{props.errors.id_user}</h1>}
                                                <h1 className='form-helper'>Solo usuarios con rol de Conductor</h1>
                                            </FormControl>
                                        </Stack>
                                        <Stack direction='row' className='form-field' spacing={4}>
                                            <Field name='date_out' validate={validate}>
                                                {({ field, form }) => (
                                                    <FormControl isInvalid={form.errors.date_out && form.touched.date_out}>
                                                        <FormLabel>
                                                            <h1 className='form-label requeried'>Fecha de viaje</h1>
                                                        </FormLabel>
                                                        <Input {...field} size='sm' type='date' min={today} />
                                                        {form.errors.date_out && <h1 className='form-error'>{form.errors.date_out}</h1>}
                                                    </FormControl>
                                                )}
                                            </Field>
                                            <FormControl isInvalid={props.errors.id_route && props.touched.id_route}>
                                                <FormLabel>
                                                    <h1 className="form-label requeried">Ruta predefinida</h1>
                                                </FormLabel>
                                                <Field size='sm' name="id_route" validate={validate}>
                                                    {({ field }) => (
                                                        <Select
                                                            {...field}
                                                            placeholder="Seleccionar"
                                                            onChange={(e) => {
                                                                props.setFieldValue('id_route', e.target.value);
                                                                setRouteSeleccionado(e.target.value);
                                                            }}
                                                            size='sm'
                                                        >
                                                            {routes.map((item, index) => (
                                                                <option
                                                                    key={`option-routes-event-${item?.id}-${index}`}
                                                                    value={item?.id}
                                                                >
                                                                    {item?.name} | {item?.description}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                </Field>
                                            </FormControl>
                                        </Stack>
                                        {route_seleccionado &&
                                            <Stack mt={2}>
                                                <h1 className='title-card-form-no-space'>Resumen de costos</h1>
                                                <HStack align='center' justifyContent='space-between' direction='row'>
                                                    <h1 className='smaller'>Costo aprox.</h1>
                                                    <h1 className='smaller right'>$ {getCurrencyMoney(selectedRoute?.cost)}</h1>
                                                </HStack>
                                                <HStack align='center' justifyContent='space-between' direction='row'>
                                                    <h1 className='smaller'>Otros gastos</h1>
                                                    <Field name='cost'>
                                                        {({ field, form }) => (
                                                            <FormControl>
                                                                <NumberInput size='sm' defaultValue={field.value}>
                                                                    <NumberInputField {...field} placeholder='Cantidad' />
                                                                    <NumberInputStepper>
                                                                        <NumberIncrementStepper />
                                                                        <NumberDecrementStepper />
                                                                    </NumberInputStepper>
                                                                </NumberInput>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                </HStack>
                                                <HStack align='center' justifyContent='space-between' direction='row' mb={2}>
                                                    <h1 className='smaller'>Costo total</h1>
                                                    <h1 className='smaller right'>$ {getCurrencyMoney(selectedRoute?.cost + parseFloat(props?.values?.cost))}</h1>
                                                </HStack>
                                                <h1 className='title-card-form-no-space'>Documentos</h1>
                                                <div className="tabla">
                                                    <div className="contenido table-scroll">
                                                        <table>
                                                            <thead className="header-routes bg-gray">
                                                                <tr>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className={`bg-gray sticky-left p5 th-center`}>#</th>
                                                                    <th style={{ width: '50%', backgroundColor: '#e2e2e2' }} className='th-center p5'>NOMBRE</th>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className='th-center p5'>TIPO</th>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }}></th>
                                                                </tr>
                                                            </thead>

                                                            <tbody className="droppable-container">
                                                                {fileList.map((item, index) => {
                                                                    //console.log("🚀 ~ {fileList.map ~ item:", item)
                                                                    return (
                                                                        <tr>
                                                                            <td style={{ backgroundColor: '#e2e2e2' }} className={`sticky-left th-center p2`}>{index + 1}</td>
                                                                            <td className='p2 th-center'>{item?.file?.name || item?.name}</td>
                                                                            <td className='p2 th-center'>{item?.file?.type || item?.type}</td>
                                                                            <td className='th-center p2'>
                                                                                <Upload
                                                                                    maxCount={1}
                                                                                    accept={item.type === "XML" ? ".xml" : ".pdf"}
                                                                                    beforeUpload={(file) => {
                                                                                        handleUploadChange(file, index);
                                                                                        return false;
                                                                                    }}
                                                                                    fileList={item.file ? [item.file] : []}
                                                                                    showUploadList={false}
                                                                                >
                                                                                    <Button icon={<UploadOutlined />} />
                                                                                </Upload>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </Stack>
                                        }
                                    </div> :
                                    <Descriptions title={`Factura ${invoiceData?.folio} - ${invoiceData?.receptorNombre}`} size={'small'} bordered layout="vertical" items={invoiceDataView} />
                                }
                                {/** invoiceData */}

                            </ModalBody>
                            <Divider mt={3} />
                            <ModalFooter style={styles['content-btn-modal-footer']}>
                                <Button type="link" disabled={isSubmitting} onClick={() => { /*setUpList(true);*/ onClose(); }}>Cerrar</Button>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                    {!panel ?
                                        <Button
                                            type="primary"
                                            //isLoading={isSubmitting}
                                            isDisabled={!props?.values?.id_user || !props?.values?.id_route || !props?.values?.id_truck}
                                            onClick={() => {
                                                props.submitForm();
                                            }}
                                        >
                                            Siguiente
                                        </Button> :
                                        <>
                                            <Button type="link" disabled={isSubmitting} onClick={() => { /*setUpList(true);*/ setPanel(false); }}>Anterior</Button>
                                            <Button
                                                type="primary"
                                                loading={isSubmitting}
                                                disabled={isSubmitting}
                                                //isDisabled={!props?.values?.id_user || !props?.values?.id_route || !props?.values?.id_truck}
                                                onClick={saveAll}
                                            >
                                                Guardar
                                            </Button>
                                        </>
                                    }
                                </div>
                            </ModalFooter>
                        </div>
                    </Form>
                )
            }}
        </Formik>
    );
};

export default CreateEventModal