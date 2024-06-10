import { Spinner } from '@chakra-ui/react'

export default function LoaderList() {
    return (
        <div style={{ flexDirection: 'column', gap: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75%' }}>
            <Spinner thickness='4px' speed='0.65s' emptyColor='gray.200' color='#4b9bff' size='xl' />
            <h1>Cargando elementos...</h1>
        </div>
    )
}