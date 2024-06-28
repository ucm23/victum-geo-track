import React, { useEffect, useState } from 'react'
import {
    EditOutlined,
    DragOutlined
} from '@ant-design/icons';
import '../../../assets/styles/truck.css';
import { supabase } from '../../../utils/supabase';
import {
    Divider,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent
} from '@chakra-ui/react'
import CreateStatus from './CreateStatus';
import StatusTree from './StatusTree';
import HeaderTitle from '../../../components/HeaderTitle';
import ListEmpty from '../../../components/ListEmpty';
import LoaderList from '../../../components/LoaderList';
import SearchSimple from '../../../components/SearchSimple';
import { Layout, notification, Badge } from 'antd';
import { useSelector } from 'react-redux';

const Status = ({ }) => {

    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;
    const [loader, setLoader] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [plate, setPlate] = useState('')
    const [data, setData] = useState([]);
    const [item, setItem] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpen1, onOpen: onOpen1, onClose: onClose1 } = useDisclosure()
    const [upList, setUpList] = useState(false);

    useEffect(() => {
        getTodos();
    }, [plate, upList, company_id]);

    const getTodos = async () => {
        try {
            setLoader(false)
            let response = plate
                ? await supabase.from('status').select("*").eq('company_id', company_id).ilike('name', `%${plate}%`)
                : await supabase.rpc('_get_status_ordered_by_id', { _company_id_: company_id });
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

    const handleUpdateItem = ({ item, mode }) => {
        setItem(item || {})
        if (mode) onOpen(); else onOpen1();
    };

    const renderItem = ({ item, index }) => {
        return (
            <tr key={index} className='tr-simple'>
                <td className='tr-simple-align-left-1'>{index + 1}</td>
                <td><Badge color={item?.color} text=' ' />{item?.name}</td>
                <td className='tr-simple-align-left th-center'>
                    <a onClick={() => handleUpdateItem({ item, mode: true })} className="table-column-logo"><EditOutlined /></a>
                    <a onClick={() => handleUpdateItem({ item, mode: false })} className="table-column-logo"><DragOutlined /></a>
                </td>
            </tr>
        );
    };

    const th_ = ['#', `ETIQUETA`, 'Acciones'];

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
            <Modal onClose={onClose1} isOpen={isOpen1} closeOnOverlayClick={false} scrollBehavior={'outside'} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <StatusTree
                        company_id={company_id}
                        onClose={onClose1}
                        item={item}
                        setUpList={setUpList}
                        data={data}
                    />
                </ModalContent>
            </Modal>
        </Layout>
    );
};

export default Status;