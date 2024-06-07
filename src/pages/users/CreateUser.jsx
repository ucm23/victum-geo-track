import React, { useEffect, useState, } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input, Stack, ButtonGroup, } from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/react'
import '../../assets/styles/user.css'
import { Divider } from '@chakra-ui/react'
import { Card, Button as ButtonChakra } from '@chakra-ui/react'
import { HomeOutlined, UserOutlined, } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import {
    FormControl,
    FormLabel,
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik';
import { supabase } from '../../utils/supabase';
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

const CreateUser = ({ company_id }) => {

    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(type, description)
    const [types, setTypes] = useState([]);
    const [tabIndex, setTabIndex] = useState(0)
    let error = 'Campo requerido';
    //function validate(value) (!value) return error;
    const validate = (value) => !value && error;
    const [value, setValue] = useState('1')

    const openNotificationWithIcon = (type, description) => {
        api[type]({
            message: messagesNotification[type].message,
            description: messagesNotification[type].description || description,
        });
    };

    useEffect(() => {
        getTypes();
    }, []);

    async function getTypes() {
        let { data: types, error } = await supabase.from('types').select("*");
        if (error) return;
        if (types.length > 0) setTypes(types)
        console.log("🚀 ~ getTypes ~ types:", types)
    }

    /*const validateEmail = (value) => {
        let error = 'Email requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Correo electrónico inválido';
        return error;
    };

    const validatePhone = values => {
        const errors = 'Número de telefono requerido';
        if (!/^\d{10}$/.test(values)) errors = 'Número de telefono inválido, debe tener 10 dígitos';
        return errors;
    };*/

    //.matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')

    return (
        <div>
            <Formik
                initialValues={{
                    name: "",
                    last_name: "",
                    phone_number: "",
                    email: "",
                    no_econ: "",
                    type: "",
                }}
                onSubmit={async (values, actions) => {
                    try {
                        actions.setSubmitting(true)
                        const { data, error } = await supabase.from('user')
                            .insert([
                                {
                                    ...values,
                                    company_id,
                                    type: parseInt(value)
                                },
                            ])
                            .select()
                        if (!error) {
                            actions.resetForm();
                            const { error } = await supabase.from('user').update({ no_econ: `NE-${data[0]?.id}` }).eq('id', data[0]?.id).select()
                            if (!error) openNotification('success', `El usuario se registro correctamente.\nLe hemos añadido una clave unica de trabajador NE-${data[0]?.id}`)
                            else openNotification('error')
                        } else openNotification('error')
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
                                            href: '/users/',
                                            title: (
                                                <>
                                                    <UserOutlined />
                                                    <span>Lista de usuarios</span>
                                                </>
                                            ),
                                        },
                                        {
                                            title: 'Añadir',
                                        },
                                    ]}
                                />
                                <h2
                                    style={{
                                        margin: 15,
                                        marginTop: 0,
                                        fontSize: 19,
                                        fontWeight: '600',
                                        color: 'black'
                                    }}
                                >Agregar usuario</h2>
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignContent: 'center',
                                margin: '0 auto',
                                paddingTop: 10
                            }}
                        >
                            <div size={'sm'} orientation="vertical" className='tabs-father'>
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
                                                    marginRight: 15,
                                                    width: '100%',
                                                }}
                                            >
                                                <Card className='shadow-card'>
                                                    <h1 className='title-card-form'>Detalles básicos</h1>
                                                    <div className='form-body-card'>
                                                        <Stack direction='row' className='form-field' spacing={4}>
                                                            <Field name='name' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.name && form.touched.name}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Nombre</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.name && <h1 className='form-error'>{form.errors.name}</h1>}
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                            <Field name='last_name' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.last_name && form.touched.last_name}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Apellidos</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.last_name && <h1 className='form-error'>{form.errors.last_name}</h1>}
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        <Stack className='form-field'>
                                                            <Field name='phone_number' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.phone_number && form.touched.phone_number}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Telefono</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.phone_number && <h1 className='form-error'>{form.errors.phone_number}</h1>}
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        <Stack className='form-field'>
                                                            <Field name='email' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.email && form.touched.email}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Correo electronico</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.email && <h1 className='form-error'>{form.errors.email}</h1>}
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                    </div>
                                                </Card>

                                                <Card mt={2} className='shadow-card'>
                                                    <h1 className='title-card-form'>Clasificación</h1>
                                                    <div className='form-body-card'>
                                                        <Stack className='form-field'>
                                                            <FormControl>
                                                                <RadioGroup onChange={(value) => setValue(value)} value={value}>
                                                                    <Stack direction='row'>
                                                                        {types.map((item, index) => (
                                                                            <Radio key={`radio-${item?.id}-${index}`} value={`${item?.id}`}>
                                                                                <h1 className='radio-item-name'>{item?.name}</h1>
                                                                                <h1 className='radio-item-description'>{item?.description}</h1>
                                                                            </Radio>
                                                                        ))}
                                                                    </Stack>
                                                                </RadioGroup>
                                                            </FormControl>
                                                        </Stack>
                                                    </div>
                                                </Card>
                                                <Divider mt={6} mb={6} />
                                                <ButtonGroup pb={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <ButtonChakra onClick={() => navigate('/users')} variant="link" style={{ color: '#1677ff', fontWeight: '300' }}>Cancelar</ButtonChakra>
                                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                                        <ButtonChakra
                                                            //mt={4}
                                                            //colorScheme='blue'
                                                            variant='outline'
                                                            style={{ /*backgroundColor: '#1677ff',*/ fontWeight: '300', color: '#1677ff' }}
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
                                                            isDisabled={!props?.values?.name || !props?.values?.last_name || !props?.values?.phone_number || !props?.values?.email}
                                                            //onClick={() => props.submitForm().then(navigate('/users/'))}
                                                            onClick={() => {
                                                                props.submitForm();
                                                                setTimeout(() => {
                                                                    navigate('/users/');
                                                                }, 2500)
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
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateUser