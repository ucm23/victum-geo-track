import React, { useEffect, useState } from 'react'
import {
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import '../../../assets/styles/truck.css';
import { supabase, messagesNotificationTruck } from '../../../utils/supabase';
import {
    Divider,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent
} from '@chakra-ui/react'
import CreateStatus from './CreateStatus';
import HeaderTitle from '../../../components/HeaderTitle';
import ListEmpty from '../../../components/ListEmpty';
import LoaderList from '../../../components/LoaderList';
import SearchSimple from '../../../components/SearchSimple';
import { Layout, notification, Badge } from 'antd';
import { useSelector } from 'react-redux';

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const Status = ({ }) => {

    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;
    const [loader, setLoader] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [plate, setPlate] = useState('')
    const [data, setData] = useState([]);
    const [item, setItem] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [upList, setUpList] = useState(false);

    useEffect(() => {
        getTodos();
    }, [plate, upList, company_id]);

    const getTodos = async () => {
        try {
            setLoader(false)
            let response = plate
                ? await supabase.from('status').select("*").eq('company_id', company_id).ilike('name', `%${plate}%`)
                : await supabase.from('status').select("*").eq('company_id', company_id);
            const { data, error } = response;
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
                <td className='tr-simple-align-left-1'>{index+1}</td>
                <td><Badge color={item?.color} text=' '/>{item?.name}</td>
                <td className='tr-simple-align-left th-center'>
                    <a onClick={() => handleUpdateItem({ item })} className="table-column-logo"><EditOutlined /></a>
                    <a onClick={() => deleteItem({ id: item?.id })} className="table-column-logo"><DeleteOutlined /></a>
                </td>
            </tr>
        );
    };

    const th_ = ['#', `NOMBRE`, 'Acciones']

    return (
        <Layout className='content-layout'>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className='panel-simple'>
                    <HeaderTitle
                        title={'Estados'}
                        //handle={handleUpdateItem}
                        backgroundColor='transparent'
                    />
                    <div className='panel-simple-children'>
                        <div className='content-sub-header-simple'>
                            <SearchSimple setPlate={setPlate} placeholder={'Nombre'} />
                        </div>
                        <Divider />
                        {loader ?
                            <div>
                                    <table>
                                        <thead>
                                            <tr>
                                                {th_.map((item, index) => <td key={`td-status-${item}-${index}`}><strong>{item}</strong></td>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((item, index) => renderItem({ item, index }))}
                                        </tbody>
                                    </table>
                                    {!data.length && <ListEmpty explication={'Da click sobre el botón AGREGAR para registrar tus vehículos'} />}
                            </div> : 
                            <div style={{ padding: 35 }}>
                                <LoaderList />
                                </div>
                            }
                    </div>
                </div>
            </div>
            <Modal onClose={onClose} size={'xl'} isOpen={isOpen} closeOnOverlayClick={false} scrollBehavior={'outside'} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <CreateStatus
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

export default Status;