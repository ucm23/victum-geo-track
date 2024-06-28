import React, { useEffect, useState } from 'react'
import {
    MoreOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import '../../../assets/styles/truck.css';
import { supabase, messagesNotificationTruck } from '../../../utils/supabase';
import {
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    Card,
    Stack,
    FormControl,
    FormLabel,
    Input
} from '@chakra-ui/react'
import CreateUserModal from './CreateUserModal';
import HeaderTitle from '../../../components/HeaderTitle';
import { Dropdown, Layout, notification } from 'antd';
import { useSelector } from 'react-redux';
import { Field, Form, Formik } from 'formik';

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const General = ({ }) => {

    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;
    const { company } = information_user;
    const [loader, setLoader] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [plate, setPlate] = useState('')
    const [data, setData] = useState([]);
    const [item, setItem] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [upList, setUpList] = useState(false);

    useEffect(() => {
        //console.log("🚀 ~ General ~ information_user:", information_user)
        //getTodos();
    }, [plate, upList, company_id]);

    const getTodos = async () => {
        try {
            setLoader(false)
            let response = plate
                ? await supabase.from('status').select("*").eq('company_id', company_id)
                : await supabase.from('status').select("*").eq('company_id', company_id);
            const { data, error } = response;
            console.log("🚀 ~ getTodos ~ error:", error)
            console.log("🚀 ~ getTodos ~ data:", data)
            if (error) return;
            setData(data || []);
        } catch (error) {
            console.log("🚀 ~ getTodos ~ error:", error)
        } finally {
            setUpList(false)
            setLoader(true)
        }
    }

    const handleUpdateItem = ({ item }) => {
        setItem(item || {})
        onOpen()
    };

    const deleteItem = async ({ id }) => {
        const { error } = await supabase.from('user').delete().eq('id', id);
        if (error) openNotificationWithIcon(api, 'error')
        else getTodos()
    }

    const renderItem = ({ item, index }) => {
        return (
            <tr key={index} className='tr-simple'>
                <td>{item?.name}</td>
                <td>{item?.color}</td>
                <td>
                    <Dropdown menu={{
                        items: [
                            { label: <a onClick={() => handleUpdateItem({ item })}>Modificar</a>, icon: <EditOutlined /> },
                            { label: <a onClick={() => deleteItem({ id: item?.id })}>Eliminar</a>, icon: <DeleteOutlined /> }
                        ]
                    }}>
                        <a onClick={(e) => e.preventDefault()} className="table-column-logo"><MoreOutlined /></a>
                    </Dropdown>
                </td>
            </tr>
        );
    };

    const th_ = ['NOMBRE', 'COLOR', ''];
    const validate = (value) => !value && error;

    return (
        <Layout className='content-layout'>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Formik
                    initialValues={{
                        name: `${company?.name || ""}`,
                        residence: `${company?.residence || ""}`,
                        postal_code: `${company?.postal_code || ""}`,
                        
                    }}
                    onSubmit={async (values, actions) => {
                        try {
                            console.log(values)
                        } catch (error) {
                            console.log("🚀 ~ onSubmit={ ~ error:", error)
                        }
                    }}
                >
                    {(props) => {
                        return (
                            <Form className='panel-simple'>
                                <HeaderTitle
                                    title={'Configuración general'}
                                    backgroundColor='transparent'
                                />
                                <Card className='shadow-card' pt={4}>
                                    <div className='form-body-card'>
                                        <Stack mt={4} />
                                        <h1 className='title-card-form-no-space'>General</h1>
                                        <Stack direction='row' className='form-field' spacing={4}>
                                            <Field name='name' validate={validate}>
                                                {({ field, form }) => (
                                                    <FormControl isInvalid={form.errors.name && form.touched.name}>
                                                        <FormLabel>
                                                            <h1 className='form-label requeried'>Nombre</h1>
                                                        </FormLabel>
                                                        <Input {...field} disabled />
                                                        {form.errors.name && <h1 className='form-error'>{form.errors.name}</h1>}
                                                    </FormControl>
                                                )}
                                            </Field>
                                        </Stack>
                                        <Stack direction='row' className='form-field' spacing={4}>
                                            <Field name='residence' validate={validate}>
                                                {({ field, form }) => (
                                                    <FormControl isInvalid={form.errors.residence && form.touched.residence}>
                                                        <FormLabel>
                                                            <h1 className='form-label'>Dirección</h1>
                                                        </FormLabel>
                                                        <Input {...field} disabled />
                                                        {form.errors.residence && <h1 className='form-error'>{form.errors.residence}</h1>}
                                                    </FormControl>
                                                )}
                                            </Field>
                                        </Stack>
                                        <Stack direction='row' className='form-field' spacing={4}>
                                            <Field name='postal_code' validate={validate}>
                                                {({ field, form }) => (
                                                    <FormControl isInvalid={form.errors.postal_code && form.touched.postal_code}>
                                                        <FormLabel>
                                                            <h1 className='form-label'>Código postal</h1>
                                                        </FormLabel>
                                                        <Input {...field} disabled />
                                                        {form.errors.postal_code && <h1 className='form-error'>{form.errors.postal_code}</h1>}
                                                    </FormControl>
                                                )}
                                            </Field>
                                        </Stack>
                                    </div>
                                </Card>
                            </Form>
                        )
                    }}
                </Formik>
            </div>
            <Modal onClose={onClose} size={'3xl'} isOpen={isOpen} closeOnOverlayClick={false} scrollBehavior={'outside'} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <CreateUserModal
                        company_id={company_id}
                        onClose={onClose}
                        item={item}
                        setUpList={setUpList}
                    />
                </ModalContent>
            </Modal>
        </Layout>
    );
};

export default General;