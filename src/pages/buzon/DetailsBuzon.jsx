import React, { useEffect, useState } from 'react'
import { styles } from '../../utils/styles';
import { Button, Descriptions, Tooltip } from 'antd';
import '../../assets/styles/truck.css'
import moment from 'moment/moment';
import { getCurrencyMoney } from '../../utils/moment-config';
import { DownloadOutlined, UploadOutlined, ProfileOutlined, FileTextOutlined, ArrowLeftOutlined, ShareAltOutlined, WhatsAppOutlined } from '@ant-design/icons';
import {
    Card,
    Button as ButtonChakra,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Stack,
    Input,
    FormControl,
    FormLabel,
    Badge,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    Divider,
    ModalCloseButton,
    ModalBody,
    ModalFooter
} from '@chakra-ui/react';

const DetailsBuzon = ({ company_id, onClose, item, setUpList }) => {

    const [invoiceDataView, setInvoiceDataView] = useState([]);
    const [tabIndex, setTabIndex] = useState(0)

    const [files, setFiles] = useState([])
    const [filesHistory, setFilesHistory] = useState([]);

    useEffect(() => {
        getDocs()
    }, []);

    const getDocs = async () => {
        let response_files = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files?travel_id=${item?.order_id}`);
        let data_files = await response_files.text();
        let files_ = JSON.parse(data_files)
        console.log("🚀 ~ getDocs ~ files_:", files_?.data)
        const files__ = files_?.data.filter(item__ => item__?.active == false)
        setFiles(files__)
        /*setFilesHistory(files)
        //console.log("🚀 ~ getDatas ~ files:", files)
        const files__ = item?.files.map(i => {
            const file = files.data.find(fi => fi?.id === i?.id )
            return {
                ...i,
                ...file
            }
        })
        console.log("🚀 ~ getDatas ~ files__:", files__)
        const { data } = await supabase.from('travel').update({ files: files?.data}).eq('id', item?.id).select()
        console.log("🚀 ~ travel_final:", data)
        
        const files_ = files?.data.filter(item__ => item__?.active === true)
        setFiles(files_)
        console.log("🚀 ~ getDatas ~ item?.files:", item?.files)
        console.log("🚀 ~ getDatas ~ item?.files:", files_)
        setUpList(false)*/
    }

    useEffect(() => {
        setInvoiceDataView([
            {
                key: '1',
                label: 'Nombre del emisor',
                children: item?.emisorNombre,
            },
            {
                key: '2',
                label: 'RFC del emisor',
                children: item?.emisorRfc,
                span: 2,
            },
            {
                key: '3',
                label: 'Nombre del receptor',
                children: item?.receptorNombre,
            },
            {
                key: '4',
                label: 'RFC del receptor',
                children: item?.receptorRfc,
                span: 2,
            },
            {
                key: '5',
                label: 'UUID',
                children: <strong>{item?.uuid}</strong>
            },
            {
                key: '6',
                label: 'Folio',
                children: item?.folio,
                span: 2,
            },
            {
                key: '7',
                label: 'Subtotal ($)',
                children: getCurrencyMoney(item?.subtotal),
            },
            {
                key: '8',
                label: 'Total ($)',
                children: getCurrencyMoney(item?.total),
            },
            {
                key: '9',
                label: 'Forma de pago',
                children: item?.formaPago,
            },
            {
                key: '10',
                label: 'Tipo de moneda',
                children: item?.tipoMoneda,
            },
            {
                key: '11',
                label: 'Tipo de pago',
                children: item?.tipoPago,
            },
            {
                key: '12',
                label: 'Condiciones de pago',
                children: item?.condicionesPago,
            },
            {
                key: '13',
                label: 'Fecha de emisión',
                children: moment(item?.fechaEmision).format('DD-MM-YYYY HH:MM'),
            },
            {
                key: '14',
                label: 'Fecha de timbrado',
                children: moment(item?.fechaTimbrado).format('DD-MM-YYYY HH:MM'),
            },
        ])
    }, [company_id]);

    const downloadFile = (id) => {
        const link = document.createElement('a');
        link.href = `http://api-metrix.victum-re.online/geo_truck/travel_files/${id}/download`;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <ModalHeader>{`Factura ${item?.folio} - ${item?.receptorNombre}`}</ModalHeader>
            <ModalCloseButton />
            <Divider />
            <ModalBody>
                <div className='tab-panel'>
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', margin: '0 auto' }}>
                            <Tabs index={tabIndex} onChange={(v) => setTabIndex(v)} size={'sm'} orientation='horizontal' style={{ width: '100%' }}>
                                <TabList>
                                    <Tab>
                                        <ProfileOutlined />
                                        <h1 className='item-list-tab'> Información</h1>
                                    </Tab>
                                    <Tab>
                                        <FileTextOutlined />
                                        <h1 className='item-list-tab'> Historial</h1>
                                    </Tab>
                                </TabList>
                                <TabPanels style={{ marginTop: 4 }}>
                                    <TabPanel>
                                        <div style={{ height: 'calc(100vh - 350px)', width: '100%', paddingTop: 10 }}>
                                            <Descriptions
                                                size={'small'}
                                                bordered
                                                layout="vertical"
                                                items={invoiceDataView}
                                            />
                                        </div>
                                    </TabPanel>
                                    <TabPanel>
                                        <div style={{ height: 'calc(100vh - 350px)', width: '100%', paddingTop: 10 }}>
                                                <div className="tabla">
                                                    <div className="contenido table-scroll" style={{ height: 'calc(100vh - 350px)' }}>
                                                        <table>
                                                            <thead className="header-routes bg-gray">
                                                                <tr>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className={`bg-gray sticky-left th-center`}>#</th>
                                                                    <th style={{ width: '50%', backgroundColor: '#e2e2e2' }} className='th-center'>NOMBRE</th>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className='th-center'>ÚLTIMA ACTUALIZACIÓN</th>
                                                                    <th style={{ backgroundColor: '#e2e2e2' }} className='th-center'>Descargar</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody className="droppable-container">
                                                                {files.map((item_, index) => {
                                                                    return (
                                                                        <tr key={`files-invoices-${item_?.id}-${index}`}>
                                                                            <td style={{ backgroundColor: '#e2e2e2' }} className={`sticky-left th-center p2`}>{index + 1}</td>
                                                                            <td className='p2 th-center'>{item_?.file_name}</td>
                                                                            <td className='p2 th-center'>{moment(item_?.updated_at).format('DD-MM-YYYY h:mm:ss')}</td>
                                                                            <td className='th-center p2' style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                                                                                <Button icon={<DownloadOutlined />} onClick={() => downloadFile(item_?.id)} />
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                            </div>
                                        </div>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <Divider mt={3} />
            <ModalFooter style={styles['content-btn-modal-footer']}>
                <Button type="link" onClick={onClose}>Cerrar</Button>
            </ModalFooter>
        </div>
    );
};

export default DetailsBuzon