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

const CreateUserModal = ({ company_id, onClose, item, setUpList }) => {

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
        let { data, error } = await supabase.from('types').select("*");
        if (error) return;
        if (data.length > 0) setGroups(data)
    }

    return (
        <Formik
            initialValues={{
                name: `${item?.name || ""}`,
                last_name: `${item?.last_name || ""}`,
                phone_number: `${item?.phone_number || ""}`,
                email: `${item?.email || ""}`,
                no_econ: `${item?.no_econ || ""}`,
                type: `${item?.type || ""}`,
            }}
            onSubmit={async (values, actions) => {
                try {
                    setSubmitting(true)
                    console.log(values)
                    const newValues = {
                        ...values,
                        type: parseFloat(values?.type),
                        no_econ: ''
                    }
                    setErrors(false)
                    if (item?.id) {
                        const { data, error } = await supabase.from('user').update({
                            name: newValues?.name,
                            last_name: newValues?.last_name,
                            phone_number: newValues?.phone_number,
                            email: newValues?.email,
                            type: parseFloat(values?.type),
                        }).eq('id', item?.id).select()
                        if (!error) {
                            openNotification('success', `El usuario ${newValues?.name} ${newValues?.last_name} ha sido actualizado`)
                            setUpList(true)
                            setErrors(true)
                        } else openNotification('error')
                    } else {
                        const { data, error } = await supabase.from('user').insert([{ ...newValues, company_id: company_id }]).select()
                        if (!error) {
                            actions.resetForm();
                            actions.setValues({
                                name: "",
                                phone_number: "",
                                last_name: "",
                                email: "",
                                type: "",
                            })
                            setUpList(true)
                            const { error } = await supabase.from('user').update({ no_econ: `NE-${data[0]?.id}` }).eq('id', data[0]?.id).select()
                            if (!error) openNotification('success', `El usuario ${newValues?.name} ${newValues?.last_name} ha sido registrado.\nLe hemos añadido una clave unica de trabajador NE-${data[0]?.id}`)
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
                        <ModalHeader>Añadir usuario</ModalHeader>
                        <ModalCloseButton />
                        <Divider />
                        <ModalBody>
                            <div className='tab-panel'>
                                {item?.id &&
                                    <Stack className='form-field'>
                                        <Field name='no_econ'>
                                            {({ field, form }) => (
                                                <FormControl>
                                                    <FormLabel>
                                                        <h1 className='form-label'>Número de empleado</h1>
                                                    </FormLabel>
                                                    <Input {...field} disabled />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </Stack>}
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
                                                    <h1 className='form-label requeried'>Número de teléfono</h1>
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
                                                    <h1 className='form-label requeried'>Correo electrónico</h1>
                                                </FormLabel>
                                                <Input {...field} />
                                                {form.errors.email && <h1 className='form-error'>{form.errors.email}</h1>}
                                            </FormControl>
                                        )}
                                    </Field>
                                </Stack>
                                <Stack className='form-field'>
                                    <FormControl isInvalid={props.errors.type && props.touched.type}>
                                        <FormLabel>
                                            <h1 className='form-label requeried'>Grupo</h1>
                                        </FormLabel>
                                        <Field as={Select} name="type" placeholder="Seleccionar" validate={validate}>
                                            {groups.map((item, index) => (
                                                <option key={`option-groups-${item?.id}-${index}`} value={item?.id}>
                                                    {item?.name}
                                                </option>
                                            ))}
                                        </Field>
                                        {props.errors.type && <h1 className='form-error'>{props.errors.type}</h1>}
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
                                    isDisabled={!props?.values?.name || !props?.values?.last_name || !props?.values?.email || !props?.values?.phone_number || !props?.values?.type}
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

export default CreateUserModal