import { Button } from 'antd';
import '../assets/styles/truck.css';
import {
    RightOutlined,
    LeftOutlined,
    PlusOutlined
} from '@ant-design/icons';
import {
    Badge
} from '@chakra-ui/react'

export default function PaginationSimple({ length, page, totalPages, loadLess, loadMore }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} >
            {length ? `${page} - ${totalPages} de ${length}` : <Badge className='chakra-badge-label-page' colorScheme={'gray'}> </Badge>}
            <a onClick={loadLess} className="load-less-left">
                <LeftOutlined />
            </a>
            <a onClick={loadMore} className="load-less-right">
                <RightOutlined />
            </a>
        </div>
    )
}