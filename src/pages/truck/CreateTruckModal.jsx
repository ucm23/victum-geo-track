import React, { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik';
import { messagesNotificationTruck, supabase } from '../../utils/supabase';
import { styles } from '../../utils/styles';
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
} from '@chakra-ui/react'
import '../../assets/styles/truck.css'

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const CreateTruckModal = ({ company_id, onClose, item, setUpList }) => {

    const [errors, setErrors] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(api, type, description)
    const [groups, setGroups] = useState([]);
    let error = 'Campo requerido';
    const validate = (value) => !value && error;

    useEffect(() => {
        getGroups();
    }, [company_id]);

    async function getGroups() {
        let { data, error } = await supabase.from('groups').select("*").eq('company_id', company_id)
        if (error) return;
        if (data.length > 0) setGroups(data)
    }

    return (
        <Formik
            initialValues={{
                model: `${item?.model || ""}`,
                plate: `${item?.plate || ""}`,
                brand: `${item?.brand || ""}`,
                no_econ: `${item?.no_econ || ""}`,
                group_id: `${item?.group_id || ""}`,
            }}
            onSubmit={async (values, actions) => {
                try {
                    setSubmitting(true)
                    console.log(values)
                    const newValues = {
                        ...values,
                        group_id: parseFloat(values?.group_id),
                        no_econ: ''
                    }
                    setErrors(false)
                    if (item?.truck_id) {
                        const { data, error } = await supabase.from('truck').update({
                            model: newValues?.model,
                            brand: newValues?.brand,
                            plate: newValues?.plate,
                            group_id: parseFloat(values?.group_id),
                        }).eq('id', item?.truck_id).select()
                        if (!error) {
                            openNotification('success', `El vehículo con placas ${newValues?.plate} ha sido actualizado`)
                            setUpList(true)
                            setErrors(true)
                        } else openNotification('error')
                    } else {
                        const { data, error } = await supabase.from('truck').insert([{ ...newValues }]).select()
                        if (!error) {
                            actions.resetForm();
                            actions.setValues({
                                model: "",
                                plate: "",
                                brand: "",
                                group_id: "",
                            })
                            setUpList(true)
                            const { error } = await supabase.from('truck').update({ no_econ: `TA-${data[0]?.id}` }).eq('id', data[0]?.id).select()
                            if (!error) openNotification('success', `El vehículo con placas ${newValues?.plate} ha sido registrado.\nLe hemos añadido una clave unica TA-${data[0]?.id}`)
                            else openNotification('error')
                            setErrors(true)
                        } else openNotification('error')
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
                        <ModalHeader>Añadir vehículo</ModalHeader>
                        <ModalCloseButton />
                        <Divider />
                        <ModalBody>
                            <div className='tab-panel'>
                                {item?.truck_id &&
                                    <Stack className='form-field'>
                                        <Field name='no_econ'>
                                            {({ field, form }) => (
                                                <FormControl>
                                                    <FormLabel>
                                                        <h1 className='form-label requeried'>Número económico</h1>
                                                    </FormLabel>
                                                    <Input {...field} disabled />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </Stack>}
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
                                <Stack direction='row' className='form-field' spacing={2}>
                                    <Field name='model' validate={validate}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.model && form.touched.model}>
                                                <FormLabel>
                                                    <h1 className='form-label requeried'>Modelo</h1>
                                                </FormLabel>
                                                <Input {...field} />
                                                {form.errors.model && <h1 className='form-error'>{form.errors.model}</h1>}
                                                {/*<h1 className='form-helper'>e.g. 4Runner, Yukon, Silverado, etc.</h1>*/}
                                            </FormControl>
                                        )}
                                    </Field>
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
                        </ModalBody>
                        <Divider mt={3} />
                        <ModalFooter style={styles['content-btn-modal-footer']}>
                            <Button type="link" onClick={() => { setUpList(true); onClose(); }}>Cerrar</Button>
                            <div className='content-btn-footer'>
                                {/*!item?.truck_id && <Button onClick={() => props.submitForm()} isLoading={isSubmitting}>Guardar & Añadir otro</Button>*/}
                                <Button
                                    type="primary"
                                    isLoading={isSubmitting}
                                    isDisabled={!props?.values?.model || !props?.values?.plate || !props?.values?.brand || !props?.values?.sub_brand || !props?.values?.group_id}
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

export default CreateTruckModal