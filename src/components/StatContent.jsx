import { LikeOutlined } from '@ant-design/icons';
import { Wrap, WrapItem } from '@chakra-ui/react'
import { useBreakpointValue } from '@chakra-ui/react'

export default function StatContent({ title, count, label }) {
    const mobile = useBreakpointValue({ base: true, md: false });
    return (
        <div className='container-statistic' style={{ width: mobile && '100%' }}>
            <div className='label-statistic'>
                <h1 style={{ color: 'gray', fontWeight: '300' }}>{title}</h1>
                <h1 className='count-statistic'>{count}</h1>
            </div>
            <div className='label-icon'>
                <h1 className='link-go-view'>{label}</h1>
                <div className='icon-statistic'>
                    <LikeOutlined style={{ fontSize: 13, color: '#4b9bff' }} />
                </div>
            </div>
        </div>
    )
}