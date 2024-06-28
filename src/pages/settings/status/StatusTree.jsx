import React, { useEffect, useState } from 'react'
import { Form, Formik } from 'formik';
import { messagesNotificationTruck, supabase } from '../../../utils/supabase';
import { styles } from '../../../utils/styles';
import { notification, Button, Tree } from "antd";
import {
    Divider,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import '../../../assets/styles/truck.css'

/*const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};*/

const StatusTree = ({ company_id, onClose, item, setUpList, data }) => {

    //const [isSubmitting, setSubmitting] = useState(false)
    //const [api, contextHolder] = notification.useNotification();
    //const openNotification = (type, description) => openNotificationWithIcon(api, type, description)

    const [selectedKeys, setSelectedKeys] = useState(item?.states);
    const [dataFormatted, setDataFormatted] = useState(null)

    useEffect(() => {
        //const children = data.filter((item_) => item_?.id !== item?.id);
        console.log("🚀 ~ useEffect ~ item:", item)
        setDataFormatted([
            {
                title: item?.name,
                key: '0',
                children: data.filter((item_) => item_?.id !== item?.id).map((item, index) => ({
                    title: item?.name,
                    key: `${index + 1}`
                }))
            }
        ])
    }, []);

    const onCheck = (checkedKeys) => setSelectedKeys(checkedKeys);

    return (
        <Formik
            initialValues={{}}
            onSubmit={async () => {
                /*try {
                    setSubmitting(true)
                    console.log('Selected nodes:', selectedKeys);
                    if (item?.id) {
                        const { data, error } = await supabase.from('status').update({ states: selectedKeys }).eq('id', item?.id).select();
                        console.log("🚀 ~ data:", data)
                        if (!error) {
                            //openNotification('success', `${newValues?.name} ha sido actualizado`)
                            //setUpList(true)
                            //setErrors(true)
                        } //else openNotification('error')
                    }
                } catch (error) {
                    console.log("🚀 ~ onSubmit={ ~ error:", error)
                } finally {
                    setSubmitting(false)
                }*/
            }}
        >
            {(props) => {
                return (
                    <Form>
                        <div>
                            {/*contextHolder*/}
                            <ModalHeader>Estado</ModalHeader>
                            <ModalCloseButton />
                            <Divider />
                            <ModalBody>
                                <div className='tab-panel'>
                                    {dataFormatted &&
                                        <Tree
                                            checkable
                                            defaultExpandAll
                                            showLine
                                            defaultExpandParent
                                            treeData={dataFormatted}
                                            checkedKeys={selectedKeys}
                                            onCheck={onCheck}
                                        />
                                    }
                                </div>
                            </ModalBody>
                            <Divider mt={3} />
                            <ModalFooter style={styles['content-btn-modal-footer']}>
                                <Button type="link" onClick={onClose}>Cerrar</Button>
                                {/*<div className='content-btn-footer'>
                                    <Button
                                        type="primary"
                                        isLoading={isSubmitting}
                                        onClick={() => props.submitForm() }
                                    > Guardar </Button>
                                </div>*/}
                            </ModalFooter>
                        </div>
                    </Form>
                )
            }}
        </Formik>
    );
};

export default StatusTree