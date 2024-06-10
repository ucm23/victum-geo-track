import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
    MoreOutlined,
    EditOutlined,
    EyeOutlined,
    FileProtectOutlined,
    FilePdfOutlined
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
import CreateUserModal from './DetailsBuzon';
import LoaderList from '../../components/LoaderList';
import PaginationSimple from '../../components/PaginationSimple';
import HeaderTitle from '../../components/HeaderTitle';
import ListEmpty from '../../components/ListEmpty';
import SearchSimple from '../../components/SearchSimple';
import { Dropdown, Layout, notification } from 'antd';
import { Descriptions } from 'antd';
import { Badge } from '@chakra-ui/react'
import moment from 'moment/moment';
import { getCurrencyMoney } from '../../utils/moment-config';
import { useSelector } from 'react-redux';
import DetailsBuzon from './DetailsBuzon';
const { Content } = Layout;

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const BuzonCFDi = ({ }) => {

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
    }, [page, plate, upList, company_id]);

    const getTodos = async () => {
        try {
            setLoader(false)
            let response = plate
                ? await supabase.rpc('get_invoices_by_company_and_folio', { _company_id: company_id, _folio: plate, _page: page, _page_size: pageSize })
                : await supabase.rpc('get_invoices_by_company', { _company_id: company_id, _page: page, _page_size: pageSize });
            const { data, error } = response;
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

    const downloadFile = async ({ id, type }) => {
        let { data: travel, error } = await supabase.from('travel').select("files").eq('id', id)
        console.log("🚀 ~ downloadFile ~ error:", error)
        console.log("🚀 ~ downloadFile ~ travel:", travel[0]?.files)

        let foundItem = null;
        if (type == 'xml') foundItem = travel[0]?.files.find(item => item.mime.includes('xml'));
        else foundItem = travel[0]?.files.find(item => item.mime.includes('pdf'));
        
        if (foundItem) {
            const link = document.createElement('a');
            link.href = `http://api-metrix.victum-re.online/geo_truck/travel_files/${foundItem?.id}/download`;
            link.setAttribute('download', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const colorScheme = {
        'Pendiente': 'black',
        'Entrada': 'gray'
    }

    const getColorStatus = (name) => {
        return colorScheme[name] || 'pink'
    }

    const renderItem = ({ item, index }) => {
        return (
            <tr key={index} className={'table-bg-by-index'}>
                <th className="sticky-left">{index + 1 + currentPage}</th>
                <th className='th-center'>{item?.folio}</th>
                <td className='th-center'>{item?.receptorNombre}</td>
                <td className='th-center'>{item?.emisorNombre}</td>
                <td className='th-center'>{item?.tipoPago}</td>
                <td className='th-center'>{item?.tipoMoneda}</td>
                <td className='th-center'>$ {getCurrencyMoney(item?.total)}</td>
                <td className='th-center'>{moment(item?.fechaEmision).format('DD-MM-YYYY HH:MM a')}</td>
                <td className='th-center'><Badge colorScheme={getColorStatus(item?.status)}>{item?.status}</Badge></td>
                <td className='th-center'>
                    <Dropdown menu={{
                        items: [
                            { label: <a onClick={() => handleUpdateItem({ item })}>Ver detalles</a>, icon: <EyeOutlined /> },
                            { label: <a onClick={() => handleUpdateItem({ item })}>Cambiar estado</a>, icon: <EditOutlined /> },
                            { label: <a onClick={() => downloadFile({ id: item?.order_id, type: 'xml' })}>Descargar XML</a>, icon: <FileProtectOutlined /> },
                            { label: <a onClick={() => downloadFile({ id: item?.order_id, type: 'pdf' })}>Descargar PDF</a>, icon: <FilePdfOutlined /> }
                        ]
                    }}>
                        <a onClick={(e) => e.preventDefault()} className="table-column-logo"><MoreOutlined /></a>
                    </Dropdown>
                </td>
            </tr>
        );
    };

    return (
        <Layout className='content-layout'>
            {contextHolder}
            <Content>
                <HeaderTitle
                    title={'Facturas'}
                />
                <Divider />
                <div className='content-sub-header-title'>
                    <SearchSimple setPlate={setPlate} placeholder={'Folio'} />
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
                                        <th className='th-center'>FOLIO</th>
                                        <th className='th-center'>RECEPTOR</th>
                                        <th className='th-center'>EMISOR</th>
                                        <th className='th-center'>Pago</th>
                                        <th className='th-center'>Moneda</th>
                                        <th className='th-center'>Total</th>
                                        <th className='th-center'>Fecha de emisión</th>
                                        <th className='th-center'>Estado</th>
                                        <th></th>
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
                    </div>
                </div> :
                    <LoaderList />
                }
                <Modal onClose={onClose} size={'3xl'} isOpen={isOpen} closeOnOverlayClick={false} scrollBehavior={'outside'} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <DetailsBuzon
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

export default BuzonCFDi;