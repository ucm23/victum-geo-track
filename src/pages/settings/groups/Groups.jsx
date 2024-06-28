import React, { useEffect, useState } from 'react'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
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

const Groups = ({ }) => {

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
                ? await supabase.from('groups').select("*").eq('company_id', company_id).ilike('name', `%${plate}%`)
                : await supabase.rpc('_get_groups_ordered_by_id_count_', { _company_id_: company_id });
            const { data, error } = response;
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

    const deleteItem = async ({ id, trucks }) => {
        if (trucks) {
            openNotificationWithIcon(api, 'warning', 'Existen vehículos con esta clasificación, no se pueden eliminar.')
            return
        }
        const { error } = await supabase.from('groups').delete().eq('id', id);
        /*if (error?.code == '23503') {
            
        }*/
        if (error) openNotificationWithIcon(api, 'error')
        else getTodos()
    }

    const count = {
        0: 's',
        1: ''
    }
    const getCount = (trucks) => count[trucks] ?? 's'

    const renderItem = ({ item, index }) => {
        return (
            <tr key={index} className='tr-simple'>
                <td className='tr-simple-align-left-1'>{index + 1}</td>
                <td>{item?.name}</td>
                <td className='tr-simple-align-left th-center'>{item?.trucks} vehículo{getCount(item?.trucks)}</td>
                <td className='tr-simple-align-left th-center'>
                    <a onClick={() => handleUpdateItem({ item })} className="table-column-logo"><EditOutlined /></a>
                    <a onClick={() => deleteItem({ id: item?.id, trucks: item?.trucks })} className="table-column-logo"><DeleteOutlined /></a>
                </td>
            </tr>
        );
    };

    const th_ = ['#', `ETIQUETA`, `OCUPACIÓN`, 'Acciones']

    return (
        <Layout className='content-layout'>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className='panel-simple'>
                    <HeaderTitle
                        title={'Estados'}
                        backgroundColor='transparent'
                        handle={handleUpdateItem}
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
                                        <tr> {th_.map((item, index) => <td key={`td-status-${item}-${index}`}><strong>{item}</strong></td>)}</tr>
                                    </thead>
                                    <tbody> {data.map((item, index) => renderItem({ item, index }))} </tbody>
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
            <Modal onClose={onClose} isOpen={isOpen} closeOnOverlayClick={false} scrollBehavior={'outside'} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <CreateStatus
                        company_id={company_id}
                        onClose={onClose}
                        item={item}
                        setUpList={setUpList}
                        data={data}
                    />
                </ModalContent>
            </Modal>
        </Layout>
    );
};

export default Groups;