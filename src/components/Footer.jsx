import { useState, useEffect } from 'react'
import {
    Stack,
    useBreakpointValue,
} from '@chakra-ui/react'

export default function Footer() {
    const mobile = useBreakpointValue({ base: true, md: false });
    const [direction, setDirection] = useState('row');

    useEffect(() => {
        const newDirection = mobile ? 'column' : 'row';
        setDirection(newDirection);
    }, [mobile]);

    return (
        <div className='bg-footer'>
            <section className="_main container p-footer">
                <Stack flexDirection={direction} style={{ marginBottom: 20 }} justifyContent={'space-between'}>
                    <Stack alignItems={mobile ? 'center' : 'initial'}>
                        <img
                            src="/logo-white.png"
                            alt="logo-ticonsa"
                            style={{ width: 123 }}
                        />
                        <h3 className="footer-title" style={{ fontWeight: 'normal', marginBottom: 20, textAlign: mobile ? 'center' : 'left' }}>Grupo Ticonsa ®, un grupo con historia y vanguardia en prefabricación.</h3>
                    </Stack>
                </Stack>
                <div style={{ background: 'white', height: 1, width: '100%', }} />
                <Stack direction={direction} justifyContent={'space-between'} style={{ marginTop: 20, alignItems: mobile ? 'center' : 'initial' }}>
                    <Stack direction={direction} gap={4} style={{ alignItems: 'center' }}>
                        <h3 className="footer-link" style={{ textAlign: 'center' }}>
                            <a href={'/legal'} target="_blank" className="footer-link">
                                Aviso Legal
                            </a>
                        </h3>
                        <h3 className="footer-link" style={{ textAlign: 'center' }}>
                            <a href={'/privacity'} target="_blank" className="footer-link">
                                Aviso de Privacidad
                            </a>
                        </h3>
                    </Stack>
                </Stack>
            </section>
        </div>
    )
}