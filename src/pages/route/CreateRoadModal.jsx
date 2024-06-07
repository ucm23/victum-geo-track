import React, { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik';
import { messagesNotificationTruck, supabase } from '../../utils/supabase';
import { notification, Button } from 'antd';
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
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    ButtonGroup, Textarea, NumberInput, NumberInputField,
} from '@chakra-ui/react';
import { styles } from '../../utils/styles';
import '../../assets/styles/truck.css'

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const CreateRoadModal = ({ company_id, onClose, item, setUpList }) => {

    const [errors, setErrors] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(api, type, description)
    let error = 'Campo requerido';
    const validate = (value) => !value && error;

    return (
        <Formik
            initialValues={{
                name: `${item?.name || ""}`,
                cost: `${item?.cost || "0"}`,
                description: `${item?.description || ""}`,
            }}
            onSubmit={async (values, actions) => {
                try {
                    setSubmitting(true)
                    console.log(values)
                    const newValues = {
                        ...values,
                        cost: parseFloat(values?.cost),
                    }
                    setErrors(false)
                    if (item?.route_id) {
                        const { data, error } = await supabase.from('routes').update({
                            name: newValues?.name,
                            description: newValues?.description,
                            cost: parseFloat(values?.cost),
                        }).eq('id', item?.route_id).select()
                        if (!error) {
                            openNotification('success', `El vehículo con placas ${newValues?.plate} ha sido actualizado`)
                            setUpList(true)
                            setErrors(true)
                        } else openNotification('error')
                    } else {
                        const { data, error: error_one } = await supabase.from('routes').insert([{ ...newValues, company_id: company_id }]).select()
                        if (error_one) {
                            openNotification('error')
                            return 0
                        }
                        actions.resetForm();
                        actions.setValues({ cost: 0 });
                        actions.setValues({
                            name: "",
                            description: "",
                            cost: "0",
                        })
                        setUpList(true)
                    
                        const { error } = await supabase.from('truck').update({ no_econ: `TA-${data[0]?.id}` }).eq('id', data[0]?.id).select()
                        if (!error) openNotification('success', `El vehículo con placas ${newValues?.plate} ha sido registrado.\nLe hemos añadido una clave unica TA-${data[0]?.id}`)
                        else openNotification('error')

                        setErrors(true)
                    }
                } catch (error) {
                    console.log("🚀 ~ onSubmit={ ~ error:", error)
                } finally {
                    setSubmitting(false)
                }
            }}
        >
            {(props) => (
                <Form>
                    <div>
                        {contextHolder}
                        <ModalHeader>Añadir ruta</ModalHeader>
                        <ModalCloseButton />
                        <Divider />
                        <ModalBody>
                            <div className='tab-panel'>
                                <Stack className='form-field'>
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
                                </Stack>
                                <Stack className='form-field'>
                                    <Field name='cost'>
                                        {({ field, form }) => (
                                            <FormControl>
                                                <FormLabel>
                                                    <h1 className='form-label'>Costo ($)</h1>
                                                </FormLabel>
                                                <NumberInput defaultValue={field.value}>
                                                    <NumberInputField {...field} />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>
                                        )}
                                    </Field>
                                </Stack>
                                <Stack className='form-field'>
                                    <Field name='description'>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.description && form.touched.description}>
                                                <FormLabel>
                                                    <h1 className='form-label'>Descripción</h1>
                                                </FormLabel>
                                                <Input {...field} />
                                                {form.errors.description && <h1 className='form-error'>{form.errors.description}</h1>}
                                            </FormControl>
                                        )}
                                    </Field>
                                </Stack>
                            </div>
                        </ModalBody>
                        <Divider mt={3} />
                        <ModalFooter style={styles['content-btn-modal-footer']}>
                            <Button type="link" onClick={() => { setUpList(true); onClose(); }}>Cerrar</Button>
                            <div className='content-btn-footer'>
                                {/*!item?.route_id && <Button onClick={() => props.submitForm()} isLoading={isSubmitting}>Guardar & Añadir otro</Button>*/}
                                <Button
                                    type="primary"
                                    isLoading={isSubmitting}
                                    isDisabled={!props?.values?.name}
                                    onClick={() => {
                                        props.submitForm();
                                        if (errors) {
                                            setTimeout(() => {
                                                onClose();
                                            }, 2222)
                                        }
                                    }}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </ModalFooter>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default CreateRoadModal