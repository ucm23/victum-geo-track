import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
    MoreOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import '../../assets/styles/truck.css';
import { pageSize, supabase, messagesNotificationTruck } from '../../utils/supabase';
import {
    Divider,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux';
import CreateRoadModal from './CreateRoadModal';
import PaginationSimple from '../../components/PaginationSimple';
import HeaderTitle from '../../components/HeaderTitle';
import ListEmpty from '../../components/ListEmpty';
import LoaderList from '../../components/LoaderList';
import { Dropdown, Layout, notification } from 'antd';
import { getCurrencyMoney } from '../../utils/moment-config';
const { Content } = Layout;

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const Roads = ({ }) => {

    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;

    const [page, setPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(0);
    const [length, setLength] = useState(0);
    const [loader, setLoader] = useState(false);
    const totalPages = useMemo(() => Math.ceil(length / pageSize), [length]);
    const [api, contextHolder] = notification.useNotification();
    const [plate, setPlate] = useState('')
    const [data, setData] = useState([]);
    const [item, setItem] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [upList, setUpList] = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const contenedorRef = useRef(null);
    //const memoizedValue = useMemo(() => ({ data }), [data]);

    const loadLess = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - pageSize);
            setPage(page - 1);
        }
    }, [currentPage, page]);

    const loadMore = useCallback(() => {
        if (length > currentPage + pageSize) {
            setCurrentPage(currentPage + pageSize);
            setPage(page + 1);
        }
    }, [currentPage, page, length]);

    const handleScroll = () => {
        const scrollTop = contenedorRef.current.scrollTop;
        const scrollLeft = contenedorRef.current.scrollLeft;
        setScrolling(scrollLeft === 0 && scrollTop !== 0);
    };

    useEffect(() => {
        getTodos();
    }, [page, upList, company_id]);

    const getTodos = async () => {
        try {
            console.log("🚀 ~")
            setLoader(false)
            let { data, error } = await supabase.rpc('get_routes_by_company_', { _company_id: company_id, _page: page, _page_size: pageSize });
            if (error) return;
            setData(data.items || []);
            setLength(data?.totalItems || 0)
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
        const { data, error } = await supabase.from('routes').delete().eq('id', id).select();
        if (error) openNotificationWithIcon(api, 'error')
        else getTodos()
    }


    const renderItem = ({ item, index }) => {
        return (
            <tr key={index} className={'table-bg-by-index'}>
                <th className="sticky-left">{index + 1 + currentPage}</th>
                <th>{item?.name}</th>
                <td>{item?.description}</td>
                <td className='th-center'>$ {getCurrencyMoney(item?.cost)}</td>
                <td>
                    <Dropdown menu={{
                        items: [
                            { label: <a onClick={() => handleUpdateItem({ item })}>Modificar</a>, icon: <EditOutlined /> },
                            { label: <a onClick={() => deleteItem({ id: item?.route_id })}>Eliminar</a>, icon: <DeleteOutlined /> }
                        ]
                    }}>
                        <a onClick={(e) => e.preventDefault()} className="table-column-logo"><MoreOutlined /></a>
                    </Dropdown>
                </td>
            </tr>
        );
    };

    const th_ = ['NOMBRE', 'DESCRIPCIÓN', 'COSTO', '']

    return (
        <Layout className='content-layout'>
            {contextHolder}
            <Content>
                <HeaderTitle
                    title={'Rutas'}
                    handle={handleUpdateItem}
                />
                <Divider />
                <div className='content-sub-header-title'>
                    <h1></h1>
                    <PaginationSimple
                        length={length}
                        page={page}
                        totalPages={totalPages}
                        loadLess={loadLess}
                        loadMore={loadMore}
                    />
                </div>
                <Divider />
                {loader ?
                <div className="tabs-container">
                    <div className="tabla">
                        <div className="contenido table-scroll" ref={contenedorRef} onScroll={handleScroll}>
                            <table>
                                <thead className="cabecera">
                                    <tr>
                                        <th className={`${!scrolling && "sticky-left"} bg-80`}>#</th>
                                        {th_.map((item, index) => <th key={`th-${item}-${index}`} className='th-center'>{item}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => renderItem({ item, index }))}
                                </tbody>
                            </table>
                            {!data.length &&
                                <ListEmpty
                                    explication={'Da click sobre el botón AGREGAR para registrar tus rutas'}
                                    newItem={handleUpdateItem}
                                />}
                        </div>
                    </div>
                </div> :
                    <LoaderList />
                }
                <Modal onClose={onClose} size={'3xl'} isOpen={isOpen} closeOnOverlayClick={false} scrollBehavior={'outside'} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <CreateRoadModal
                            company_id={company_id}
                            onClose={onClose}
                            item={item}
                            setUpList={setUpList}
                            />
                    </ModalContent>
                </Modal>
            </Content>
        </Layout>
    );
};

export default Roads;