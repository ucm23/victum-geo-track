import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
    MoreOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import '../../../assets/styles/truck.css';
import { pageSize, supabase, messagesNotificationTruck } from '../../../utils/supabase';
import {
    Divider,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent
} from '@chakra-ui/react'
import CreateUserModal from './CreateUserModal';
import PaginationSimple from '../../../components/PaginationSimple';
import HeaderTitle from '../../../components/HeaderTitle';
import ListEmpty from '../../../components/ListEmpty';
import LoaderList from '../../../components/LoaderList';
import SearchSimple from '../../../components/SearchSimple';
import { Dropdown, Layout, notification } from 'antd';
import { useSelector } from 'react-redux';
const { Content } = Layout;

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
    const [scrolling, setScrolling] = useState(false);
    const contenedorRef = useRef(null);

    const handleScroll = () => {
        const scrollTop = contenedorRef.current.scrollTop;
        const scrollLeft = contenedorRef.current.scrollLeft;
        setScrolling(scrollLeft === 0 && scrollTop !== 0);
    };

    useEffect(() => {
        getTodos();
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

    const th_ = ['NOMBRE', 'COLOR', '']

    return (
        <Layout className='content-layout'>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className='panel-simple'>
                    <HeaderTitle
                        title={'Estados'}
                        handle={handleUpdateItem}
                        backgroundColor='transparent'
                    />
                    <div className='content-sub-header-title'>
                        <SearchSimple setPlate={setPlate} placeholder={'Nombre'} />
                    </div>
                    <Divider />
                    {loader ?
                        <div>
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            {th_.map((item, index) => <td key={`td-${item}-${index}`}>{item}</td>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, index) => renderItem({ item, index }))}
                                    </tbody>
                                </table>
                                {!data.length &&
                                    <ListEmpty
                                        explication={'Da click sobre el botón AGREGAR para registrar tus vehículos'}
                                        newItem={handleUpdateItem}
                                    />}
                            </div>
                        </div> : <LoaderList />}
                </div>
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

export default Status;