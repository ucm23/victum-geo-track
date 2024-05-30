import { useState, useEffect } from 'react'
import { Button, Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function ListEmpty({ explication, newItem }) {
    return (
        <div className='list-empty'>
            <div className='logo-list-empty'>
                <img
                    src="/imgs/lupa.png"
                    alt="/imgs/lupa.png"
                    style={{ height: 50 }}
                />
            </div>
            <h1 className='text-list-empty'>No hay resultados para mostrar</h1>
            <h1 className='text-list-empty'>{explication}</h1>
            <Button onClick={newItem} type="primary" className='btn-add-item' icon={<PlusOutlined />} iconPosition={'start'} size='middle'>Agregar</Button>
        </div>
    )
}