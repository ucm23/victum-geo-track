import React, { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik';
import { messagesNotificationTruck, supabase } from '../../utils/supabase';
import { styles } from '../../utils/styles';
import { notification, Button, Upload, Descriptions, Steps, theme, message, Checkbox, Spin } from 'antd';
import { CloudUploadOutlined, FileExcelOutlined, FilePdfOutlined, ArrowsAltOutlined } from '@ant-design/icons';
import { getCurrencyMoney } from '../../utils/moment-config';
import moment from 'moment/moment';
import {
    Input,
    Stack,
    HStack,
    Select,
    FormControl,
    FormLabel,
    Divider,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    NumberInput,
    NumberInputField,
} from '@chakra-ui/react'
import '../../assets/styles/truck.css'
// import { parseString } from 'xml2js';
import { XMLParser } from 'fast-xml-parser';

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationTruck[type].message,
        description: messagesNotificationTruck[type].description || description,
    });
};

const steps = [
    {
        title: 'Documentos',
    },
    {
        title: 'Ingresos',
    }
];

const ReplaceDocsModal = ({ company_id, onClose, item, files, filesHistory, setUpList }) => {
console.log("🚀 ~ item:", item)



    //const [errors, setErrors] = useState(false)
    const [isSubmitting, setSubmitting] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(api, type, description)
    const [checkIva, setCheckIva] = useState(true);

    const [checkRetIva, setCheckRetIva] = useState(true);

    const onChange = (e) => setCheckIva(e.target.checked);
    const onChangeRet = (e) => setCheckRetIva(e.target.checked);
    const [validePDF, setValidePDF] = useState(false);
    //const [dataPDF, setDataPDF] = useState(false);
    //const [dataXMl, setDataXMl] = useState(false);

    const iva = 16;
    const ret = 4;
    const [cost, setCost] = useState({
        flt_e_dom: ``,
        flt_flete: ``,
        flt_m_car: ``,
        flt_m_des: ``,
        flt_o_lin: ``,
        flt_rec: ``,
        flt_seg: ``,
        iva: ``,
        por_iva: iva,
        ret_iva: ``,
        por_ret_iva: ret,
        subtotal: ``,
        total: ``,
    });


    useEffect(() => {
        console.log("🚀 ~ files:", files)
        console.log("🚀 ~ filesHistory:", filesHistory)
    }, []);

    const handleChange = (event) => {
        const { value, name } = event.currentTarget;
        setCost({ ...cost, [name]: value });
    }

    const [fileList, setFileList] = useState([
        {
            index: 0,
            name: "Subir Factura XML",
            description: "o\nArrastre y suelte aquí",
            type: "XML",
            file: null
        },
        {
            index: 1,
            name: "Subir Factura PDF",
            description: "o\nArrastre y suelte aquí",
            type: "PDF",
            file: null
        },
    ]);

    const [fileContent, setFileContent] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [invoiceDataView, setInvoiceDataView] = useState([]);
    const [orderData, setOrderData] = useState(null);

    const handleUploadChange = (file, index) => {
        const updatedFileList = fileList.map((item, idx) => {
            if (idx === index) return { ...item, file };
            return item;
        });
        setFileList(updatedFileList);

        console.log("🚀 ~ handleUploadChange ~ updatedFileList:", updatedFileList)
        if (file?.type.includes('xml')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                setFileContent(content);
            };
            reader.readAsText(file);
        }
    };

    const openPdfInNewTab = () => {
        const pdfFile = fileList[1]?.file;
        if (pdfFile) {
            const url = URL.createObjectURL(pdfFile);
            window.open(url, '_blank');
        }
    };

    function areFilesEquivalent(file1, file2) {
        const getFileNameWithoutExtension = (fileName) => {
            const extensionIndex = fileName.lastIndexOf('.');
            if (extensionIndex === -1) return fileName;
            return fileName.slice(0, extensionIndex).toLowerCase();
        };
        return getFileNameWithoutExtension(file1) === getFileNameWithoutExtension(file2);
    }

    const saveAll = async () => {
        try {
            setSubmitting(true)
            if (!fileList[0]?.file || !fileList[1]?.file) {
                openNotification('warning', 'Verifica las facturas XML y PDF adjuntas. Por favor, inténtalo de nuevo.')
                return 0
            }
            if (!areFilesEquivalent(fileList[0]?.file?.name, fileList[1]?.file?.name)) {
                openNotification('warning', 'Las facturas XML y PDF no coinciden. Por favor, inténtalo de nuevo.')
                return 0
            }
            if (!fileContent) return 0
            else {
                const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
                try {
                    const result = parser.parse(fileContent);
                    const comprobante = result['cfdi:Comprobante'];
                    const emisor = comprobante['cfdi:Emisor'];
                    const receptor = comprobante['cfdi:Receptor'];
                    const complemento = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'];
                    const extractedData = {
                        emisorNombre: emisor.Nombre,
                        emisorRfc: emisor.Rfc,
                        receptorNombre: receptor.Nombre,
                        receptorRfc: receptor.Rfc,
                        folio: comprobante.Folio,
                        uuid: complemento.UUID,
                        subtotal: parseFloat(comprobante.SubTotal) || 0,
                        total: parseFloat(comprobante.Total) || 0,
                        formaPago: comprobante.FormaPago,
                        tipoMoneda: comprobante.Moneda,
                        tipoPago: comprobante.MetodoPago,
                        condicionesPago: comprobante.CondicionesDePago,
                        fechaEmision: comprobante.Fecha,
                        fechaTimbrado: complemento.FechaTimbrado,
                        company_id,
                        status: 'Pendiente'
                    };

                    /*let { data: invoices, error: error_invoices } = await supabase.from('invoices').select("uuid").eq('uuid', extractedData?.uuid)
                    console.log("🚀 ~ saveAll ~ invoices:", invoices)
                    if (error_invoices) {
                        openNotification('warning', 'Factura subida con anterioridad')
                        return 0
                    }*/
                    setInvoiceData(extractedData);
                    console.log("🚀 ~ parseXMLFast ~ extractedData:", extractedData);
                    setInvoiceDataView([
                        { key: '1', label: 'Nombre del emisor', children: extractedData?.emisorNombre },
                        { key: '2', label: 'RFC del emisor', children: extractedData?.emisorRfc, span: 2 },
                        { key: '3', label: 'Nombre del receptor', children: extractedData?.receptorNombre },
                        { key: '4', label: 'RFC del receptor', children: extractedData?.receptorRfc, span: 2 },
                        { key: '5', label: 'UUID', children: <strong>{extractedData?.uuid}</strong> },
                        { key: '6', label: 'Folio', children: extractedData?.folio, span: 2 },
                        { key: '7', label: 'Subtotal ($)', children: '$ ' + getCurrencyMoney(extractedData?.subtotal) },
                        { key: '8', label: 'Total ($)', children: '$ ' + getCurrencyMoney(extractedData?.total) },
                        { key: '9', label: 'Forma de pago', children: extractedData?.formaPago },
                        { key: '10', label: 'Tipo de moneda', children: extractedData?.tipoMoneda },
                        { key: '11', label: 'Tipo de pago', children: extractedData?.tipoPago },
                        { key: '12', label: 'Condiciones de pago', children: extractedData?.condicionesPago },
                        { key: '13', label: 'Fecha de emisión', children: moment(extractedData?.fechaEmision).format('DD-MM-YYYY HH:MM') },
                        { key: '14', label: 'Fecha de timbrado', children: moment(extractedData?.fechaTimbrado).format('DD-MM-YYYY HH:MM') },
                    ])
                    message.success('Facturas validadas')
                } catch (err) {
                    console.error('Error parsing XML:', err);
                    alert(`Verifique el formato XML. \nError: ${err}`);
                }
            }

            if (!fileList[1]?.file) return 0;
            else {
                setValidePDF(true)
                let bodyContent_ = new FormData();
                bodyContent_.append("file", fileList[1].file);
                let response_pdf_ = await fetch(
                    'https://apigeotruck.cti-victum.com/uploads',
                    {
                        method: "POST",
                        body: bodyContent_,
                        headers: {}
                    }
                );
                let data = await response_pdf_.text();
                setCost(JSON.parse(data))
                setValidePDF(false)

            }
            next()

        } catch (error) {
            console.error("🚀 ~ ~ error:", error)
        } finally {
            setSubmitting(false)
            setValidePDF(false)
        }
    }

    const saveAllx2 = async () => {
        try {
            setSubmitting(true)
            console.log(item)
            const files__ = files.filter(i => i?.active == true)
            console.log("🚀 ~ saveAllx2 ~ files__:", files__)
            let headers = {}
            for (const iterator of files__) {
                let bodyContent = new FormData();
                bodyContent.append("active", "false");

                let response = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${iterator?.id}`, {
                    method: "PUT",
                    body: bodyContent,
                    headers
                });

                let data = await response.text();
                console.log(data);

            }
            let method = 'POST'
            let bodyContent_one = new FormData();
            bodyContent_one.append("file", fileList[0].file);

            let response_xml = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${item?.id}/upload`, {
                method,
                body: bodyContent_one,
                headers
            });

            let data_one = await response_xml.text();
            console.log("🚀 ~ data_one:", data_one)
            let bodyContent_two = new FormData();
            bodyContent_two.append("file", fileList[1].file);

            let response_pdf = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${item?.id}/upload`, {
                method,
                body: bodyContent_two,
                headers
            });

            let data_two = await response_pdf.text();
            console.log("🚀 ~ data_two:", data_two);

            invoiceData.income = cost;
            const { data: travel_final, error } = await supabase.from('invoices').update({ ...invoiceData }).eq('id', item?.invoice_id).select()
            console.log("🚀 ~ saveAllx2 ~ error:", error)
            console.log("🚀 ~ saveAllx2 ~ travel_final:", travel_final)

            setUpList(true)
            openNotification('success', `Orden de trabajo actualizada.\n.`)
            setTimeout(function () {
                onClose()
            }, 1300);

            //setUpList(true)
            /*const { data, error: error_one } = await supabase.from('travel').insert([orderData]).select()
            if (error_one) {
                openNotification('error')
                return 0
            }

            let bodyContent_one = new FormData();
            bodyContent_one.append("file", fileList[0].file);

            let response_xml = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${data[0]?.id}/upload`, {
                method: "POST",
                body: bodyContent_one,
                headers: {}
            });

            //let data_one = 
            await response_xml.text();
            //console.log("🚀 ~ data_one:", data_one)
            let bodyContent_two = new FormData();
            bodyContent_two.append("file", fileList[1].file);

            let response_pdf = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files/${data[0]?.id}/upload`, {
                method: "POST",
                body: bodyContent_two,
                headers: {}
            });

            //let data_two = 
            await response_pdf.text();
            //console.log("🚀 ~ data_two:", data_two)

            setUpList(true)
            let response_files = await fetch(`https://api-metrix.victum-re.online/geo_truck/travel_files?travel_id=${data[0]?.id}`);
            let data_files = await response_files.text();
            let files = JSON.parse(data_files)
            const { data: travel_final, error } = await supabase.from('travel').update({ files: files?.data, ot: `OT-${data[0]?.id}` }).eq('id', data[0]?.id).select()
            console.log("🚀 ~ travel_final:", travel_final)
            if (error) {
                openNotification('error')
                return 0;
            }
            invoiceData.order_id = data[0]?.id;
            invoiceData.income = cost;
            const { data: invoice, error: error_invoice } = await supabase.from('invoices').insert([invoiceData]).select()
            console.log("🚀 ~ saveAll ~ error_invoice:", error_invoice)
            console.log("🚀 ~ saveAll ~ invoice:", invoice)
            if (error_invoice) {
                openNotification('error')
                return 0
            }
            openNotification('success', `Orden de trabajo registrada.\nLe hemos añadido una clave unica OT-${data[0]?.id}.`)
            setTimeout(function () {
                onClose()
            }, 1800);*/
        } catch (error) {
            console.log("🚀 ~ saveAll ~ error:", error)
        } finally {
            setSubmitting(false)
        }
    }

    //const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const next = () => setCurrent(current + 1);
    const prev = () => setCurrent(current - 1);

    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));
    const contentStyle = {
        //lineHeight: '260px',
        width: '100%',
        height: '475px',
        //backgroundColor: token.colorFillAlter,
        //borderRadius: token.borderRadiusLG,
        //border: `1px dashed ${token.colorBorder}`,
        overflowY: 'auto',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
    };
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    function formatSize(size) {
        let unitIndex = 0;
        let formattedSize = size;
        while (formattedSize >= 1024 && unitIndex < units.length - 1) {
            formattedSize /= 1024;
            unitIndex++;
        }
        return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
    }

    return (
        <Formik
            initialValues={{
                /*name: `${item?.name || ""}`,
                description: `${item?.description || ""}`,
                status: `${item?.status || ""}`,
                id_user: `${item?.id_user || ""}`,
                id_truck: `${item?.id_truck || ""}`,
                id_route: `${item?.id_route || ""}`,
                gasoline: `${item?.gasoline || ""}`,
                stand: `${item?.stand || ""}`,
                operator: `${item?.operator || ""}`,
                cost: `${item?.cost || ""}`,
                cost_add: `${item?.cost_add || ""}`,
                date_out: `${item?.date_out || ""}`,
                date_arrival: `${item?.date_arrival || ""}`,

                flt_e_dom: ``,
                flt_flete: ``,
                flt_m_car: ``,
                flt_m_des: ``,
                flt_o_lin: ``,
                flt_rec: ``,
                flt_seg: ``,
                iva: ``,
                ret_iva: ``,
                subtotal: ``,
                total: `${cost?.total || '0'}`,*/
            }}
            onSubmit={async (values, actions) => {
                /*try {
                    if (current == 0) {
                        console.log("🚀 ~ nextDay: 2")
                        const nextDay = new Date(values?.date_out);
                        console.log("🚀 ~ nextDay:", nextDay)
                        nextDay.setDate(nextDay.getDate() + 1);

                        const newValues = {
                            ...values,
                            cost: parseFloat(values?.cost),
                            id_user: parseFloat(values?.id_user),
                            id_truck: parseFloat(values?.id_truck),
                            id_route: parseFloat(values?.id_route),
                            date_out: `${values?.date_out}T00:00:00`,
                            date_arrival: nextDay.toISOString().split('T')[0] + 'T00:00:00',
                        }
                        console.log("🚀 ~ newValues:", newValues)
                        let dataInsert = {
                            //...newValues, 
                            id_user: newValues?.id_user,
                            id_truck: newValues?.id_truck,
                            id_route: newValues?.id_route,
                            date_out: newValues?.date_out,
                            date_arrival: newValues?.date_arrival,
                            cost: newValues?.cost || 0,
                            company_id,
                            status: 1,
                        }
                        console.log("🚀 ~ ~ dataInsert:", dataInsert)
                        setOrderData(dataInsert)
                        next()
                    }
                } catch (error) {
                    console.log("🚀 ~ onSubmit={ ~ error:", error)
                }*/
            }}
        >
            {(props) => {
                const value_iva = !checkIva ? ((parseFloat(cost?.por_iva) / 100) * (parseFloat(cost?.flt_flete.replace(/,/g, '') || 0) + parseFloat(cost?.flt_e_dom.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_car.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_des.replace(/,/g, '') || 0) + parseFloat(cost?.flt_o_lin.replace(/,/g, '') || 0) + parseFloat(cost?.flt_rec.replace(/,/g, '') || 0) + parseFloat(cost?.flt_seg.replace(/,/g, '') || 0)))
                    : ((parseFloat(iva) / 100) * (parseFloat(cost?.flt_flete.replace(/,/g, '') || 0) + parseFloat(cost?.flt_e_dom.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_car.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_des.replace(/,/g, '') || 0) + parseFloat(cost?.flt_o_lin.replace(/,/g, '') || 0) + parseFloat(cost?.flt_rec.replace(/,/g, '') || 0) + parseFloat(cost?.flt_seg.replace(/,/g, '') || 0)));
                const value_retiva = !checkRetIva ? ((parseFloat(cost?.por_ret_iva) / 100) * (parseFloat(cost?.flt_flete.replace(/,/g, '') || 0) + parseFloat(cost?.flt_e_dom.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_car.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_des.replace(/,/g, '') || 0) + parseFloat(cost?.flt_o_lin.replace(/,/g, '') || 0) + parseFloat(cost?.flt_rec.replace(/,/g, '') || 0) + parseFloat(cost?.flt_seg.replace(/,/g, '') || 0)))
                    : ((parseFloat(ret) / 100) * (parseFloat(cost?.flt_flete.replace(/,/g, '') || 0) + parseFloat(cost?.flt_e_dom.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_car.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_des.replace(/,/g, '') || 0) + parseFloat(cost?.flt_o_lin.replace(/,/g, '') || 0) + parseFloat(cost?.flt_rec.replace(/,/g, '') || 0) + parseFloat(cost?.flt_seg.replace(/,/g, '') || 0)))
                const value_sub = parseFloat(cost?.flt_flete.replace(/,/g, '') || 0) + parseFloat(cost?.flt_e_dom.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_car.replace(/,/g, '') || 0) + parseFloat(cost?.flt_m_des.replace(/,/g, '') || 0) + parseFloat(cost?.flt_o_lin.replace(/,/g, '') || 0) + parseFloat(cost?.flt_rec.replace(/,/g, '') || 0) + parseFloat(cost?.flt_seg.replace(/,/g, '') || 0);
                const value_total = value_sub + value_iva - value_retiva;

                cost.iva = value_iva;
                cost.ret_iva = value_iva;
                cost.total = value_total;
                cost.subtotal = value_sub;

                return (
                    <Form>
                        <div>
                            {contextHolder}
                            <ModalHeader>Añadir orden de trabajo</ModalHeader>
                            <ModalCloseButton disabled={isSubmitting} />
                            <Divider />
                            <ModalBody>
                                <div style={{ display: 'flex', flexDirection: 'column', /*alignItems: 'center'*/ }}>
                                    <Steps style={{ padding: '0px 72px 6px' }} /*direction="vertical"*/ size="small" current={current} items={items} />
                                    <div style={contentStyle}>
                                        {current == 0 &&
                                            <div className='tab-panel'>
                                                {/*validePDF*/}
                                                <Stack mt={2}>
                                                    <h1 className='title-card-form-no-space'>Subir archivos</h1>
                                                    <div className="upload-file-container">
                                                        {fileList.map((item, index) => {
                                                            return (
                                                                <Upload
                                                                    maxCount={1}
                                                                    accept={item.type === "XML" ? ".xml" : ".pdf"}
                                                                    beforeUpload={(file) => {
                                                                        handleUploadChange(file, index);
                                                                        return false;
                                                                    }}
                                                                    fileList={item.file ? [item.file] : []}
                                                                    showUploadList={false}
                                                                    className='upload-file-item'
                                                                >
                                                                    <CloudUploadOutlined style={{ fontSize: 34, color: '#4b9bff' }} />
                                                                    <h1 className='upload-label-title'>{item?.name}</h1>
                                                                    <h1 className='upload-label-or'>o</h1>
                                                                    <h1 className='upload-label-or'>Arrastre y suelte aquí</h1>
                                                                </Upload>
                                                            )
                                                        })}
                                                    </div>
                                                    <div className='labels-helpers-upload'>
                                                        <h1 className='upload-label-or'>Formatos soportados: XML y PDF</h1>
                                                        <h1 className='upload-label-or'>Tamaño máximo de archivo: 10MB</h1>
                                                    </div>
                                                    <div className="upload-file-container">
                                                        {fileList.map((item, index) => {
                                                            return (
                                                                <div className='upload-file-item-2'>
                                                                    {item?.file?.name &&
                                                                        <div className='upload-file-item-3'>
                                                                            {item.type === "XML" ? <FileExcelOutlined style={{ fontSize: 34, color: '#58d258' }} />
                                                                                : <FilePdfOutlined style={{ fontSize: 34, color: '#f23c3c' }} />}
                                                                            <div>
                                                                                <h1 className='upload-label-drag'>{item?.file?.name}</h1>
                                                                                <h1 className='upload-label-or'>{formatSize(item?.file?.size)}</h1>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </Stack>
                                            </div>
                                        }
                                        {current == 1 &&
                                            <div style={{ /*display: 'flex', flexDirection: 'column', gap: 14,*/ padding: '20px 48px' }}>
                                                <Stack mt={1.5} style={{ gap: '0.2rem' }}>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 className='smaller'>Conceptos de cobro / Ingreso</h1>
                                                        <Button onClick={openPdfInNewTab} icon={<ArrowsAltOutlined type="arrows-alt" />}>Abrir PDF</Button>
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="flt_flete" className='smaller'>FLT-FLTE</h1>
                                                        <input
                                                            id="flt_flete"
                                                            name="flt_flete"
                                                            type="number"
                                                            required
                                                            value={parseFloat(cost?.flt_flete.replace(/,/g, ''))}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            min="0"
                                                            step="0.01"
                                                            pattern="^\d+(\.\d{1,2})?$"
                                                            className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 input_flt"
                                                        />
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="flt_seg" className='smaller'>FLT-SEG</h1>
                                                        <input
                                                            id="flt_seg"
                                                            name="flt_seg"
                                                            type="number"
                                                            required
                                                            value={parseFloat(cost?.flt_seg.replace(/,/g, ''))}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            min="0"
                                                            step="0.01"
                                                            pattern="^\d+(\.\d{1,2})?$"
                                                            className="w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="flt_o_lin" className='smaller'>FLT-O. LIN</h1>
                                                        <input
                                                            id="flt_o_lin"
                                                            name="flt_o_lin"
                                                            type="number"
                                                            required
                                                            value={parseFloat(cost?.flt_o_lin.replace(/,/g, ''))}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            min="0"
                                                            step="0.01"
                                                            pattern="^\d+(\.\d{1,2})?$"
                                                            className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="flt_rec" className='smaller'>FLT-REC</h1>
                                                        <input
                                                            id="flt_rec"
                                                            name="flt_rec"
                                                            type="number"
                                                            required
                                                            value={parseFloat(cost?.flt_rec.replace(/,/g, ''))}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            min="0"
                                                            step="0.01"
                                                            pattern="^\d+(\.\d{1,2})?$"
                                                            className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="flt_e_dom" className='smaller'>FLT-E. DOM</h1>
                                                        <input
                                                            id="flt_e_dom"
                                                            name="flt_e_dom"
                                                            type="number"
                                                            required
                                                            value={parseFloat(cost?.flt_e_dom.replace(/,/g, ''))}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            min="0"
                                                            step="0.01"
                                                            pattern="^\d+(\.\d{1,2})?$"
                                                            className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="flt_m_car" className='smaller'>FLT-M. CAR</h1>
                                                        <input
                                                            id="flt_m_car"
                                                            name="flt_m_car"
                                                            type="number"
                                                            required
                                                            value={parseFloat(cost?.flt_m_car.replace(/,/g, ''))}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            min="0"
                                                            step="0.01"
                                                            pattern="^\d+(\.\d{1,2})?$"
                                                            className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="flt_m_des" className='smaller'>FLT-M. DES</h1>
                                                        <input
                                                            id="flt_m_des"
                                                            name="flt_m_des"
                                                            type="number"
                                                            required
                                                            value={parseFloat(cost?.flt_m_des.replace(/,/g, ''))}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            min="0"
                                                            step="0.01"
                                                            pattern="^\d+(\.\d{1,2})?$"
                                                            className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="subtotal" className='smaller'>SUB-TOTAL</h1>
                                                        <h1 htmlFor="total" className='smaller text-align-right'>$ {getCurrencyMoney(value_sub)}</h1>
                                                        {/*<input
                                                            id="subtotal"
                                                            name="subtotal"
                                                            type="number"
                                                            required
                                                            value={value_sub}
                                                            onChange={handleChange}
                                                            disabled
                                                            placeholder='Cantidad'
                                                            className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />*/}
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="iva" className='smaller'>IVA</h1>
                                                        <HStack align='center' justifyContent='space-between' direction='row' className='width-hstack'>
                                                            <Checkbox checked={checkIva} onChange={onChange} style={{ width: 111 }}>{iva}%</Checkbox>
                                                            <HStack align='center' justifyContent='space-between' direction='row' className='width-hstack'>
                                                                {!checkIva &&
                                                                    <input
                                                                        id="por_iva"
                                                                        name="por_iva"
                                                                        type="number"
                                                                        required
                                                                        value={parseFloat(cost?.por_iva)}
                                                                        onChange={handleChange}
                                                                        placeholder='Porcentaje'
                                                                        min="0"
                                                                        step="0.01"
                                                                        pattern="^\d+(\.\d{1,2})?$"
                                                                        className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                    />
                                                                }
                                                                <input
                                                                    id="iva"
                                                                    name="iva"
                                                                    type="number"
                                                                    required
                                                                    value={value_iva}
                                                                    onChange={handleChange}
                                                                    placeholder='Cantidad'
                                                                    disabled
                                                                    className="block w-full rounded-md border-0 input_flt shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 color-b6"
                                                                />
                                                            </HStack>
                                                        </HStack>
                                                    </HStack>

                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="ret_iva" className='smaller'>RET. IVA</h1>
                                                        <HStack align='center' justifyContent='space-between' direction='row' className='width-hstack'>
                                                            <Checkbox checked={checkRetIva} onChange={onChangeRet} style={{ width: 111 }}>{ret}%</Checkbox>
                                                            <HStack align='center' justifyContent='space-between' direction='row' className='width-hstack'>
                                                                {!checkRetIva &&
                                                                    <input
                                                                        id="por_ret_iva"
                                                                        name="por_ret_iva"
                                                                        type="number"
                                                                        required
                                                                        value={parseFloat(cost?.por_ret_iva)}
                                                                        onChange={handleChange}
                                                                        placeholder='Porcentaje'
                                                                        min="0"
                                                                        step="0.01"
                                                                        pattern="^\d+(\.\d{1,2})?$"
                                                                        className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                    />
                                                                }
                                                                <input
                                                                    id="ret_iva"
                                                                    name="ret_iva"
                                                                    type="number"
                                                                    required
                                                                    value={value_retiva}
                                                                    onChange={handleChange}
                                                                    placeholder='Cantidad'
                                                                    disabled
                                                                    className="block w-full rounded-md border-0 input_flt shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 color-b6"
                                                                />
                                                            </HStack>
                                                        </HStack>
                                                    </HStack>
                                                    <HStack align='center' justifyContent='space-between' direction='row'>
                                                        <h1 htmlFor="total" className='smaller'>TOTAL</h1>
                                                        <h1 htmlFor="total" className='smaller text-align-right'>$ {getCurrencyMoney(value_total)}</h1>
                                                        {/*<input
                                                            id="total"
                                                            name="total"
                                                            type="number"
                                                            required
                                                            value={value_sub + value_iva - value_retiva}
                                                            onChange={handleChange}
                                                            placeholder='Cantidad'
                                                            disabled
                                                            className="block w-full rounded-md border-0 input_flt text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        />*/}
                                                    </HStack>
                                                </Stack>
                                            </div>

                                        }
                                    </div>
                                </div>
                                <Spin spinning={validePDF} fullscreen />
                            </ModalBody>
                            <Divider mt={3} />
                            <ModalFooter style={styles['content-btn-modal-footer']}>
                                <Button type="link" disabled={isSubmitting} onClick={() => { /*setUpList(true);*/ onClose(); }}>Cerrar</Button>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                    {current > 0 && (
                                        <Button
                                            style={{ margin: '0 8px' }}
                                            onClick={() => prev()}
                                        >
                                            Anterior
                                        </Button>
                                    )}
                                    {current < steps.length - 1 && (
                                        <Button
                                            type="primary"
                                            isDisabled={!isSubmitting}
                                            onClick={() => {
                                                if (current == 0) saveAll()
                                            }}
                                        >
                                            {validePDF ? 'Validando...' : 'Siguiente'}
                                        </Button>
                                    )}
                                    {current === steps.length - 1 && (
                                        <Button
                                            type="primary"
                                            loading={isSubmitting}
                                            disabled={isSubmitting}
                                            onClick={() => {
                                                if (value_total == invoiceData?.total) {
                                                    saveAllx2()
                                                } else {
                                                    openNotification(
                                                        'warning',
                                                        <h1>
                                                            Los costos de las facturas no coinciden.
                                                            <br />Total registrado desde el PDF: <strong>${getCurrencyMoney(value_total)}</strong>
                                                            <br />Total obtenido desde el XML: <strong>${getCurrencyMoney(invoiceData?.total)}</strong>
                                                        </h1>
                                                    )
                                                }
                                            }}
                                        >
                                            Guardar
                                        </Button>
                                    )}
                                </div>
                            </ModalFooter>
                        </div>
                    </Form>
                )
            }}
        </Formik>
    );
};

export default ReplaceDocsModal
