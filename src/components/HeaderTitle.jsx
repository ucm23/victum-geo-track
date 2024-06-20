import '../assets/styles/truck.css';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function HeaderTitle({ title, handle, backgroundColor }) {
    return (
        <div className='content-header-title' style={{ backgroundColor }}>
            <h1 className='title-header'>{title}</h1>
            {handle &&
                <Button onClick={handle} className='btn-add-item' type='primary' icon={<PlusOutlined />} fontWeight='bold' iconPosition={'start'} size='middle'>Agregar</Button>
            }
        </div>
    )
}