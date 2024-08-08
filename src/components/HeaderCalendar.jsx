import '../assets/styles/truck.css';
import React from 'react';
import { FileExcelOutlined } from '@ant-design/icons';
import { Dropdown, message } from 'antd';

export default function HeaderCalendar({ title, handle, exportToExcel, backgroundColor }) {

    const items = [
        {
            label: 'Descargar reporte EXCEL',
            key: '1',
            icon: <FileExcelOutlined />,
            onClick: exportToExcel
        },
    ];
    const menuProps = {
        items
    };

    return (
        <div className='content-header-title' style={{ backgroundColor }}>
            <h1 className='title-header'>{title}</h1>
            <Dropdown.Button className='btn-add-item' type='primary' menu={menuProps} onClick={handle} fontWeight='bold' iconPosition={'start'} size='middle'>
                Agregar
            </Dropdown.Button>
        </div>
    )
}