import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/styles/road.css'
import {
    Card,
    Button as ButtonChakra,
    useNumberInput,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Stack,
    Input,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { supabase } from '../../utils/supabase';
import { getCurrencyMoney } from '../../utils/moment-config';
import { Breadcrumb, Badge, Descriptions, notification, Button, Tooltip, Checkbox, Timeline, Alert } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { ProfileOutlined, FileTextOutlined, ArrowLeftOutlined, ShareAltOutlined, WhatsAppOutlined } from '@ant-design/icons';
import moment from 'moment/moment';
import { Field, Form, Formik } from 'formik';

const messagesNotification = {
    success: {
        message: 'Registro éxitoso',
    },
    error: {
        message: 'Error',
        description: 'Hubo un problema al enviar los datos. Por favor, inténtalo de nuevo.',
    }
}

const CreateEvent = ({ company_id }) => {

    const { getInputProps } = useNumberInput({ step: 1, defaultValue: 0, min: 1 })
    const navigate = useNavigate();
    const location = useLocation();
    const { item } = location.state || {};

    //const input = getInputProps()
    const [tabIndex, setTabIndex] = useState(0)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(type, description)

    const [drivers, setDrivers] = useState([]);
    const [order, setOrder] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [status, setStatus] = useState([]);
    const [files, setFiles] = useState([]);
    //const { isOpen, onOpen, onClose } = useDisclosure()
    const [items, setItems] = useState([]);
    let error = 'Campo requerido';
    const validate = (value) => !value && error;
    const [route_seleccionado, setRouteSeleccionado] = useState(null)
    const [loading, setLoading] = useState(false)

    const openNotificationWithIcon = (type, description) => {
        api[type]({
            message: messagesNotification[type].message,
            description: messagesNotification[type].description || description,
        });
    };

    const [allChecked, setAllChecked] = useState(false);

    useEffect(() => {
        const areAllChecked = files.every(file => file.checked);
        setAllChecked(areAllChecked);
    }, [files]);

    useEffect(() => {
        console.log("🚀 ~ item:", item)
        getDatas()
    }, []);

    const getDatas = async () => {
        setFiles(item?.files)
        setOrder([
            {
                key: '1',
                label: 'Código',
                children: `${item?.title}`,
            },
            {
                key: '2',
                label: 'Descripción',
                children: item?.description,
                span: 2,
            },
            {
                key: '3',
                label: 'Fechas importantes',
                children: (
                    <>
                        <div className='flex-row-center-vertical-between-wrap'>
                            <h1>Fecha de creación</h1>
                            <h1>{moment(item?.created_at).format('DD-MM-YYYY')}</h1>
                        </div>
                        <div className='flex-row-center-vertical-between-wrap'>
                            <h1>Fecha de inicio programada</h1>
                            <h1>{moment(item?.date_out).format('DD-MM-YYYY')}</h1>
                        </div>
                        <div className='flex-row-center-vertical-between-wrap'>
                            <h1>Fecha de limite de pago</h1>
                            <h1>{item?.days ? moment(item?.days).format('DD-MM-YYYY') : 'No definido'}</h1>
                        </div>
                    </>
                ),
            },

        ])
        let { data: truck, error: error1 } = await supabase.from('truck').select("*").eq('id', item?.id_truck)
        setTrucks([
            {
                key: '1',
                label: 'Número económico',
                children: truck[0]?.no_econ,
            },
            {
                key: '2',
                label: 'Placas',
                children: truck[0]?.plate,
                span: 2,
            },
            {
                key: '3',
                label: 'Vehículo',
                children: `${truck[0]?.brand} ${truck[0]?.model}`,
            },
        ])
        let { data: user, error: error2 } = await supabase.from('user').select("*").eq('id', item?.id_user)
        setDrivers([
            {
                key: '1',
                label: 'Nombre',
                children: `${user[0]?.name} ${user[0]?.last_name}`,
            },
            {
                key: '2',
                label: 'Número de empleado',
                children: user[0]?.no_econ,
                span: 2,
            },
            {
                key: '3',
                label: 'Número telefónico',
                children: user[0]?.phone_number,
            },
            {
                key: '4',
                label: 'Correo electrónico',
                children: user[0]?.email,
            },
        ])
        let { data: route, error: error3 } = await supabase.from('routes').select("*").eq('id', item?.id_route)
        setRoutes([
            {
                key: '1',
                label: 'Nombre',
                children: `${route[0]?.name}`,
            },
            {
                key: '2',
                label: 'Descripción',
                children: route[0]?.description,
                span: 2,
            },
            /*{
                key: '3',
                label: 'Costos',
                children: `Ruta$ ${getCurrencyMoney(route[0]?.cost || 0)}\nAdicional$ ${getCurrencyMoney(item?.cost || 0)}`,
            },*/
            {
                key: '3',
                label: 'Costos',
                children: (
                    <>
                        {`Ruta $ ${getCurrencyMoney(route[0]?.cost || 0)}`}
                        <br />
                        {`Ads. \t$ ${getCurrencyMoney(item?.cost || 0)}`}
                    </>
                ),
            },
            {
                key: '4',
                label: 'Total',
                children: `$ ${getCurrencyMoney((route[0]?.cost + item?.cost) || 0)}`,
            },

        ])
        getStatus()
        setLoading(true)
    }

    async function getStatus() {
        const { data, error } = await supabase.rpc('_get_status_ordered_by_id', { _company_id_: item?.company_id });
        if (error) return;
        if (data.length > 0) {
            const status_ = (data || []).map(item__ => {
                let color = 'gray';
                if (item__?.id == item?.status) color = 'blue';
                return {
                    color: color,
                    children: item__?.name,
                };
            });
            setStatus(status_)
        }
    }

    const props = {}

    const downloadFile = (id) => {
        const link = document.createElement('a');
        link.href = `http://api-metrix.victum-re.online/geo_truck/travel_files/${id}/download`;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCheckboxChange = (index) => {
        const updatedFiles = [...files];
        updatedFiles[index].checked = !updatedFiles[index].checked;
        setFiles(updatedFiles);
    };

    const [errors, setErrors] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)
    const secretKey = '123-45';
    const sendMessage = () => {
        const phoneNumber = drivers[2].children;
        let id = item?.id * 12345;
        console.log("🚀 ~ sendMessage ~ id:", id)
        const message = `Hola, te envio una orden de trabajo con el código ${item?.title}\nCuadno dirigere al link https://help-victum-repse.vercel.app/order/work/progress/${id}`;
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };

    if (!loading) {
        return <h1>Cargando...</h1>
    }

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'white',
                    padding: 12
                }}
            >
                {contextHolder}
                <div>
                    <Breadcrumb
                        style={{ marginBottom: 5 }}
                        items={[
                            {
                                href: '/calendar/',
                                title: (
                                    <>
                                        <ArrowLeftOutlined />
                                        <span>Lista de órdenes</span>
                                    </>
                                ),
                            }
                        ]}
                    />
                    <h1 style={{ fontSize: 19, fontWeight: '600', color: 'black' }}>Orden de trabajo {item?.title}</h1>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center' }}>
                    <Tooltip title="Enviar orden de trabajo al conductor">
                        <Button type="primary" icon={<WhatsAppOutlined />} onClick={sendMessage} />
                    </Tooltip>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', margin: '0 auto' }}>
                <Tabs index={tabIndex} onChange={(v) => setTabIndex(v)} size={'sm'} orientation="vertical" className='tabs-father'>
                    <TabList className='tabs-list-tab shadow-card'>
                        <Tab>
                            <ProfileOutlined />
                            <h1 className='item-list-tab'> Información</h1>
                        </Tab>
                        <Tab>
                            <ProfileOutlined />
                            <h1 className='item-list-tab'> Detalles</h1>
                        </Tab>
                        <Tab>
                            <FileTextOutlined />
                            <h1 className='item-list-tab'> Documentos</h1>
                        </Tab>
                    </TabList>
                    <TabPanels className='tabs-panel-tab' style={{ marginTop: 4 }}>
                        <TabPanel className='tab-panel'>
                            <div className='tabs-panel-tab'>
                                <div style={{ height: 'calc(100vh - 172px)', width: '100%' }}>
                                    <div style={{ width: '100%' }}>
                                        <Card className='shadow-card' pt={4}>
                                            <div className='form-body-card'>
                                                <Descriptions title='Orden de trabajo' size={'small'} bordered layout="vertical" items={order} />
                                                <Stack mt={4} />
                                                <h1 className='title-card-form-no-space'>Estado</h1>
                                                <Stack mt={4} />
                                                <Timeline items={status} />
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel className='tab-panel'>
                            <div className='tabs-panel-tab'>
                                <div style={{ height: 'calc(100vh - 172px)', width: '100%' }}>
                                    <div style={{ width: '100%' }}>
                                        <Card className='shadow-card' pt={4}>
                                            <div className='form-body-card'>
                                                <Descriptions title='Información del vehículo' size={'small'} bordered layout="vertical" items={trucks} />
                                                <Stack mb={6} />
                                                <Descriptions title='Información del conductor' size={'small'} bordered layout="vertical" items={drivers} />
                                                <Stack mb={6} />
                                                <Descriptions title='Información de la ruta' size={'small'} bordered layout="vertical" items={routes} />
                                            </div>
                                        </Card>
                                        <Stack pb={12} />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel className='tab-panel'>
                            <div className='tabs-panel-tab'>
                                <div style={{ height: 'calc(100vh - 172px)', width: '100%' }}>
                                    <div style={{ width: '100%' }}>
                                        <Card className='shadow-card'>
                                            <div className='form-body-card'>
                                                <Stack mb={4} />
                                                <h1 className='title-card-form-no-space' >Facturas</h1>
                                                { item?.status < 3 &&
                                                    <Alert message="Aún no es posible aprobar las facturas, envie la orden de trabajo para un seguimiento correcto." type="warning" showIcon />
                                                }
                                                <Stack mb={1} />
                                                <div className="tabla">
                                                    <div className="contenido table-scroll">
                                                        <table>
                                                            <thead className="header-routes bg-gray">
                                                                <tr>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className={`bg-gray sticky-left th-center`}>#</th>
                                                                    <th style={{ width: '50%', backgroundColor: '#e2e2e2' }} className='th-center'>NOMBRE</th>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className='th-center'>ÚLTIMA ACTUALIZACIÓN</th>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className='th-center'>Descargar</th>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className='th-center'>Aprobar</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody className="droppable-container">
                                                                {files.map((item_, index) => {
                                                                    //console.log("🚀 ~ {fileList.map ~ item_:", item_)
                                                                    return (
                                                                        <tr key={`files-invoices-${item_?.id}-${index}`}>
                                                                            <td style={{ backgroundColor: '#e2e2e2' }} className={`sticky-left th-center p2`}>{index + 1}</td>
                                                                            <td className='p2 th-center'>{item_?.file_name}</td>
                                                                            <td className='p2 th-center'>{moment(item_?.updated_at).format('DD-MM-YYYY h:mm:ss')}</td>
                                                                            <td className='th-center p2'>
                                                                                <Button icon={<DownloadOutlined />} onClick={() => downloadFile(item_?.id)} />
                                                                            </td>
                                                                            <td className='p2 th-center'>
                                                                                <Checkbox
                                                                                    checked={item_.checked}
                                                                                    onChange={() => handleCheckboxChange(index)}
                                                                                    disabled={item?.days || item?.status < 3}
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                {(allChecked && !item?.days) && (
                                                    <Formik
                                                        initialValues={{
                                                            date_limit_pay: `${item?.days || ""}`,
                                                        }}
                                                        onSubmit={async (values, actions) => {
                                                            try {
                                                                setSubmitting(true)
                                                                const { data, error } = await supabase.from('travel').update({ 
                                                                    status: 4, 
                                                                    days: `${values?.date_limit_pay}T00:00:00`,
                                                                    files: files
                                                                }).eq('id', item?.id).select()
                                                                console.log("🚀 ~ onSubmit={ ~ error:", error)
                                                                console.log("🚀 ~ onSubmit={ ~ data:", data)
                                                                console.log(values)
                                                            } catch (error) {
                                                                console.log("🚀 ~ onSubmit={ ~ error:", error)
                                                            } finally {
                                                                setSubmitting(false)
                                                            }
                                                        }}
                                                    >
                                                        {(props) => {
                                                            return (
                                                                <Form>
                                                                    <Stack pt={4}>
                                                                        <Field name='date_limit_pay' validate={validate}>
                                                                            {({ field, form }) => (
                                                                                <FormControl isInvalid={form.errors.date_limit_pay && form.touched.date_limit_pay}>
                                                                                    <FormLabel>
                                                                                        <h1 className='form-label requeried'>Fecha de pago</h1>
                                                                                    </FormLabel>
                                                                                    <Input {...field} size='sm' type='date' min={new Date(item?.date_arrival).toISOString().split('T')[0]} />
                                                                                    {form.errors.date_limit_pay && <h1 className='form-error'>{form.errors.date_limit_pay}</h1>}
                                                                                </FormControl>
                                                                            )}
                                                                        </Field>
                                                                        <Button /*type="submit"*/ onClick={props.submitForm} style={{ marginTop: '15px', backgroundColor: '#1677ff', color: 'white' }}>
                                                                            Establecer fecha de pago
                                                                        </Button>
                                                                    </Stack>
                                                                </Form>
                                                            )
                                                        }}
                                                    </Formik>
                                                )}
                                            </div>
                                        </Card>
                                        {/*<Divider mt={6} mb={6} />
                                        <ButtonGroup pb={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <ButtonChakra onClick={() => navigate('/truck')} variant="link" style={{ color: '#1677ff', fontWeight: '300' }}>Cancelar</ButtonChakra>
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                                <ButtonChakra
                                                    //mt={4}
                                                    //colorScheme='blue'
                                                    variant='outline'
                                                    style={{ fontWeight: '300', color: '#1677ff' }}
                                                    isLoading={props.isSubmitting}
                                                    //type='submit'
                                                    onClick={() => props.submitForm()}
                                                >
                                                    Guardar & Añadir otro
                                                </ButtonChakra>
                                                <ButtonChakra
                                                    //mt={4}
                                                    //colorScheme='blue'
                                                    style={{ backgroundColor: '#1677ff', fontWeight: '300', color: 'white' }}
                                                    isLoading={props.isSubmitting}
                                                    //type='submit'
                                                    //onClick={() => props.submitForm().then(navigate('/users/'))}
                                                    onClick={() => {
                                                        props.submitForm();
                                                    }}
                                                >
                                                    Guardar
                                                </ButtonChakra>
                                            </div>
                                                </ButtonGroup>*/}
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </div>
    );
};

export default CreateEvent;