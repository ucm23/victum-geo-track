import React, { useState } from 'react'
import { Field, Form, Formik } from 'formik';
import { messagesNotificationTruck, supabase } from '../../../utils/supabase';
import { styles } from '../../../utils/styles';
import { notification, Button } from 'antd';
import {
    Input,
    Stack,
    FormControl,
    FormLabel,
    Divider,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import '../../../assets/styles/truck.css'
import ColorPicker from 'react-pick-color';

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const CreateStatus = ({ onClose, item, setUpList, data }) => {

    const [errors, setErrors] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(api, type, description)
    let error = 'Campo requerido';
    const validate = (value) => !value && error;

    const [color, setColor] = useState('');

    return (
        <Formik
            initialValues={{
                name: `${item?.name || ""}`,
                color: `${item?.color || ""}`,
            }}
            onSubmit={async (values) => {
                try {
                    setSubmitting(true)
                    console.log(values)
                    const newValues = {
                        ...values,
                        color: color || values?.color
                    }
                    const colors = data.filter((item_) => item_?.color !== item?.color).map((item_) => item_?.color); 
                    const names = data.filter((item_) => item_?.name !== item?.name).map((item_) => item_?.name);
                    if (colors.includes(newValues.color) || names.includes(newValues.name)) {
                        openNotification('warning', 'Distintivo / Nombre repetido')
                        return 0
                    }
                    setErrors(false)
                    if (item?.id) {
                        const { data, error } = await supabase.from('status').update({ ...newValues }).eq('id', item?.id).select();
                        if (!error) {
                            openNotification('success', `${newValues?.name} ha sido actualizado`)
                            setUpList(true)
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
                            <ModalHeader>Modificar estado</ModalHeader>
                            <ModalCloseButton />
                            <Divider />
                            <ModalBody>
                                <div className='tab-panel'>
                                    <Stack direction='row' className='form-field' spacing={4}>
                                        <Field name='name' validate={validate}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={form.errors.name && form.touched.name}>
                                                    <FormLabel>
                                                        <h1 className='form-label requeried'>Etiqueta</h1>
                                                    </FormLabel>
                                                    <Input {...field} />
                                                    {form.errors.name && <h1 className='form-error'>{form.errors.name}</h1>}
                                                </FormControl>
                                            )}
                                        </Field>
                                    </Stack>
                                    <Stack direction='column' className='form-field'>
                                        <h1 className='form-label requeried'>Distintivo</h1>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <ColorPicker color={props.values?.color} onChange={color => setColor(color.hex)} />
                                        </div>
                                    </Stack>

                                </div>
                            </ModalBody>
                            <Divider mt={3} />
                            <ModalFooter style={styles['content-btn-modal-footer']}>
                                <Button type="link" onClick={onClose}>Cerrar</Button>
                                <div className='content-btn-footer'>
                                    <Button
                                        type="primary"
                                        isLoading={isSubmitting}
                                        isDisabled={!props?.values?.name}
                                        onClick={() => {
                                            props.submitForm();
                                            if (errors) setTimeout(() => onClose(), 2222);
                                        }}
                                    >
                                        Guardar
                                    </Button>
                                </div>
                            </ModalFooter>
                        </div>
                    </Form>
                )
            }
        </Formik>
    );
};

export default CreateStatus