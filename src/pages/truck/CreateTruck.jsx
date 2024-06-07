import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Tabs, TabList, TabPanels, Tab, TabPanel, Input, Stack, ButtonGroup, Select, useNumberInput } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { ProfileOutlined, FileTextOutlined, } from '@ant-design/icons';
import '../../assets/styles/truck.css'
import { Divider } from '@chakra-ui/react'
import { Card, Button as ButtonChakra } from '@chakra-ui/react'
import { HomeOutlined, TruckOutlined, } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import {
    FormControl,
    FormLabel,
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik';
import { supabase } from '../../utils/supabase';

import {
    NumberInput,
    NumberInputField,
} from '@chakra-ui/react'
import { notification } from 'antd';

const messagesNotification = {
    success: {
        message: 'Registro éxitoso',
    },
    error: {
        message: 'Error',
        description: 'Hubo un problema al enviar los datos. Por favor, inténtalo de nuevo.',
    }
}


const CreateTruck = ({ company_id }) => {

    const navigate = useNavigate();
    const location = useLocation();
    const { truckData } = location.state || {};
    

    const { getInputProps } = useNumberInput({ step: 1, defaultValue: 0, min: 1 })
    //const input = getInputProps()
    const [tabIndex, setTabIndex] = useState(0)
    const [errors, setErrors] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(type, description)
    const [groups, setGroups] = useState([]);
    let error = 'Campo requerido';
    const validate = (value) => !value && error;

    useEffect(() => {
        getGroups();
        console.log("🚀 ~ truckData:", truckData)
    }, []);

    const openNotificationWithIcon = (type, description) => {
        api[type]({
            message: messagesNotification[type].message,
            description: messagesNotification[type].description || description,
        });
    };

    async function getGroups() {
        let { data: groups, error } = await supabase.from('groups').select("*").eq('company_id', company_id)
        if (error) return;
        if (groups.length > 0) setGroups(groups)
    }

    return (
        <div>
            <Formik
                initialValues={{
                    model: "",
                    plate: "",
                    tarjet: "",
                    //in_function: "",
                    //is_active: "",
                    //status: "",
                    brand: "",
                    sub_brand: "",
                    no_econ: "",
                    no_serie: "",
                    group_id: "",

                    /*class: "",
                    motor: "",
                    fuel: "",
                    capacity_fuel: "",
                    weight: "",
                    no_axis: "",
                    tires: "",
                    liters: "",
                    tons: "",
                    people: "",
                    high: "",
                    broad: "",
                    long: "",*/
                }}
                onSubmit={async (values, actions) => {
                    try {
                        actions.setSubmitting(true)
                        console.log(values)
                        const newValues = {
                            ...values,
                            group_id: parseFloat(values?.group_id),
                            /*weight: parseFloat(values?.weight),
                            liters: parseFloat(values?.liters),
                            tons: parseFloat(values?.tons),
                            high: parseFloat(values?.high),
                            broad: parseFloat(values?.broad),
                            long: parseFloat(values?.long),
                            capacity_fuel: parseFloat(values?.capacity_fuel),
                            no_axis: parseFloat(values?.no_axis),
                            tires: parseFloat(values?.tires),
                            people: parseFloat(values?.people),*/
                            no_econ: ''
                        }


                        actions.resetForm();
                        actions.setValues({
                            model: "",
                            plate: "",
                            tarjet: "",
                            brand: "",
                            sub_brand: "",
                            no_econ: "",
                            //no_serie: "",
                            group_id: "",

                            /*class: "",
                            motor: "",
                            fuel: "",*/
                            /*capacity_fuel: 0,
                            weight: 0,
                            no_axis: 0,
                            tires: 0,
                            liters: 0,
                            tons: 0,
                            people: 0,
                            high: 0,
                            broad: 0,
                            long: 0,*/
                        })
                        //actions.resetForm();
                        const { data, error } = await supabase.from('truck')
                            .insert([
                                {
                                    ...newValues,
                                    //model: values?.model,
                                    //group_id: parseInt(values?.group_id)
                                },
                            ])
                            .select()
                        if (!error) {
                            actions.resetForm();
                            actions.setValues({
                                /*capacity_fuel: 0,
                                weight: 0,
                                no_axis: 0,
                                tires: 0,
                                liters: 0,
                                tons: 0,
                                people: 0,
                                high: 0,
                                broad: 0,
                                long: 0,*/
                            })
                            const { error } = await supabase.from('truck').update({ no_econ: `TA-${data[0]?.id}` }).eq('id', data[0]?.id).select()
                            if (!error) openNotification('success', `El vehículo ha sido registrado correctamente.\nLe hemos añadido una clave unica de trabajador TA-${data[0]?.id}`)
                            else openNotification('error')
                        } else {
                            openNotification('error')
                            setErrors(true)
                            return 0;
                        }
                        setTabIndex(0)
                    } catch (error) {
                        console.log("🚀 ~ onSubmit={ ~ error:", error)
                    } finally {
                        actions.setSubmitting(false)
                    }

                }}
            >
                {(props) => (
                    <Form>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'white'
                            }}
                        >
                            {contextHolder}
                            <div>
                                <Breadcrumb
                                    style={{ marginTop: 15, marginLeft: 15, marginBottom: 5 }}
                                    items={[
                                        {
                                            href: '/',
                                            title: <HomeOutlined />,
                                        },
                                        {
                                            href: '/truck/',
                                            title: (
                                                <>
                                                    <TruckOutlined />
                                                    <span>Lista de véhiculos</span>
                                                </>
                                            ),
                                        },
                                        {
                                            title: 'Añadir',
                                        },
                                    ]}
                                />
                                <h1
                                    style={{
                                        margin: 15,
                                        marginTop: 0,
                                        fontSize: 19,
                                        fontWeight: '600',
                                        color: 'black'
                                    }}
                                >Agregar vehículo</h1>
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignContent: 'center',
                                margin: '0 auto'
                            }}
                        >
                            {/*<Tabs index={tabIndex} onChange={(v) => setTabIndex(v)} size={'sm'} orientation="vertical" className='tabs-father' >
                                <TabList className='tabs-list-tab shadow-card'>
                                    <Tab>
                                        <ProfileOutlined />
                                        <h1 className='item-list-tab'> Detalles</h1>
                                    </Tab>
                                    <Tab isDisabled={!props?.values?.model || !props?.values?.plate || !props?.values?.brand || !props?.values?.sub_brand || !props?.values?.group_id}>
                                        <FileTextOutlined />
                                        <h1 className='item-list-tab'> Especificaciones</h1>
                                    </Tab>
                                </TabList>
                                <TabPanels className='tabs-panel-tab' style={{ marginTop: 4 }}>
                                    <TabPanel className='tab-panel'>*/}
                            <div className='tabs-father'>
                                <div className='tabs-panel-tab'>
                                    <div className='tab-panel'>
                                        <div
                                            style={{
                                                height: 'calc(100vh - 172px)',
                                                width: '100%',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    //marginRight: 15,
                                                    width: '100%',
                                                    //backgroundColor: 'red'
                                                }}
                                            >
                                                <Card className='shadow-card'>
                                                    <h1 className='title-card-form'>Detalles básicos</h1>
                                                    <div className='form-body-card'>
                                                        <Stack className='form-field'>
                                                            <Field name='model' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.model && form.touched.model}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Modelo</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.model && <h1 className='form-error'>{form.errors.model}</h1>}
                                                                        <h1 className='form-helper'>e.g. 4Runner, Yukon, Silverado, etc.</h1>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        <Stack className='form-field'>
                                                            <Field name='plate' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.plate && form.touched.plate}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Placa</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.plate && <h1 className='form-error'>{form.errors.plate}</h1>}
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        {/*<Stack className='form-field'>
                                                        <Field name='no_serie'>
                                                            {({ field, form }) => (
                                                                <FormControl isInvalid={form.errors.no_serie && form.touched.no_serie}>
                                                                    <FormLabel>
                                                                        <h1 className='form-label'>No. serie</h1>
                                                                    </FormLabel>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                            )}
                                                        </Field>
                                                        </Stack>*/}
                                                        <Stack direction='row' className='form-field' spacing={2}>
                                                            <Field name='brand' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.brand && form.touched.brand}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Marca</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.brand && <h1 className='form-error'>{form.errors.brand}</h1>}
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            {/*<Field name='sub_brand' validate={validate}>
                                                            {({ field, form }) => (
                                                                <FormControl isInvalid={form.errors.sub_brand && form.touched.sub_brand}>
                                                                    <FormLabel>
                                                                        <h1 className='form-label requeried'>Sub-Marca</h1>
                                                                    </FormLabel>
                                                                    <Input {...field} />
                                                                    {form.errors.sub_brand && <h1 className='form-error'>{form.errors.sub_brand}</h1>}
                                                                </FormControl>
                                                            )}
                                                        </Field>*/}
                                                        </Stack>
                                                        <Stack className='form-field'>
                                                            <FormControl isInvalid={props.errors.group_id && props.touched.group_id}>
                                                                <FormLabel>
                                                                    <h1 className='form-label requeried'>Grupo</h1>
                                                                </FormLabel>
                                                                <Field as={Select} name="group_id" placeholder="Seleccionar" validate={validate}>
                                                                    {groups.map((item, index) => (
                                                                        <option key={`option-groups-${item?.id}-${index}`} value={item?.id}>
                                                                            {item?.name}
                                                                        </option>
                                                                    ))}
                                                                </Field>
                                                                {props.errors.group_id && <h1 className='form-error'>{props.errors.group_id}</h1>}
                                                            </FormControl>
                                                        </Stack>
                                                    </div>
                                                </Card>

                                                {/*<Card mt={2}>
                                                    <h1 className='title-card-form'>Asignación de Vehiculo</h1>
                                                    <div className='form-body-card'>
                                                        <Stack className='form-field'>
                                                            <FormControl isInvalid={props.errors.group_id && props.touched.group_id}>
                                                                <FormLabel>
                                                                    <h1 className='form-label'>Conductor (Chofer)</h1>
                                                                </FormLabel>
                                                                <Field as={Select} name="no_econ" placeholder="Seleccionar">
                                                                    {drivers.map((item, index) => (
                                                                        <option key={`option-drivers-${item?.id}-${index}`} value={item?.no_econ}>
                                                                            {item?.name} {item?.last_name} - {item?.no_econ}
                                                                        </option>
                                                                    ))}
                                                                </Field>
                                                            </FormControl>
                                                        </Stack>
                                                    </div>
                                                                </Card>*/}
                                                <Divider mt={6} mb={6} />
                                                <ButtonGroup pb={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <ButtonChakra onClick={() => navigate('/truck')} variant="link" style={{ color: '#1677ff', fontWeight: '300' }}>Cancelar</ButtonChakra>
                                                    {/*<ButtonChakra
                                                        style={{ backgroundColor: '#1677ff', fontWeight: '300', color: 'white' }}
                                                        isLoading={props.isSubmitting}
                                                        isDisabled={!props?.values?.model || !props?.values?.plate || !props?.values?.brand || !props?.values?.sub_brand || !props?.values?.group_id}
                                                    >
                                                        Guardar
                                                            </ButtonChakra>*/}
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
                                                            isDisabled={!props?.values?.model || !props?.values?.plate || !props?.values?.brand || !props?.values?.sub_brand || !props?.values?.group_id}
                                                            onClick={() => {
                                                                props.submitForm();
                                                                if (errors) {
                                                                    setTimeout(() => {
                                                                        navigate('/truck/');
                                                                    }, 2500)
                                                                }
                                                            }}
                                                        >
                                                            Guardar
                                                        </ButtonChakra>
                                                    </div>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*</TabPanel>

                                    <TabPanel className='tab-panel'>
                                        <div
                                            style={{
                                                height: 'calc(100vh - 172px)',
                                                width: '100%',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginRight: 15,
                                                    width: '100%',
                                                    //backgroundColor: 'red'
                                                }}
                                            >
                                                <Card className='shadow-card'>
                                                    <h1 className='title-card-form'>Motor</h1>
                                                    <div className='form-body-card'>
                                                        <Stack direction='row' className='form-field' spacing={2}>
                                                            <Field name='motor'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Motor</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        <h1 className='form-helper'>e.g. Número de Identificación del Vehículo (VIN), etc.</h1>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='class'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Clase</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                    </div>
                                                </Card>
                                                <Card mt={2} className='shadow-card'>
                                                    <h1 className='title-card-form'>Dimensiones y capacidad</h1>
                                                    <div className='form-body-card'>
                                                        <Stack direction='row' className='form-field' spacing={2}>
                                                            <Field name='high'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Altura</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='broad'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Ancho</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='long'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Longitud</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='weight'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Peso</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        <Stack direction='row' className='form-field' spacing={2}>
                                                            <Field name='no_axis'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>No de ejes</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                        <h1 className='form-helper'>No = Número</h1>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='tires'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>No de llantas</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='people'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>No de personas</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        <Stack direction='row' className='form-field' spacing={2}>
                                                            <Field name='liters'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Capacidad de litros</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='tons'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Capacidad de toneladas</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                    </div>
                                                </Card>
                                                <Card mt={2} className='shadow-card'>
                                                    <h1 className='title-card-form'>Combustible</h1>
                                                    <div className='form-body-card'>
                                                        <Stack direction='row' className='form-field' spacing={2}>
                                                            <Field name='fuel'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Tipo</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='capacity_fuel'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Capacidad de combustible</h1>
                                                                        </FormLabel>
                                                                        <NumberInput value={field.value}>
                                                                            <NumberInputField {...field} />
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                    </div>
                                                </Card>
                                                <Divider mt={6} mb={6} />
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
                                                                if (errors) {
                                                                    setTimeout(() => {
                                                                        navigate('/truck/');
                                                                    }, 2500)
                                                                }
                                                            }}
                                                        >
                                                            Guardar
                                                        </ButtonChakra>
                                                    </div>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                                        </TabPanel>
                                </TabPanels>
                            </Tabs>*/}
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateTruck