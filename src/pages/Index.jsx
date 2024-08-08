import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import LoaderList from '../components/LoaderList';
//import { HStack, Stack } from '@chakra-ui/react';
import { Wrap, WrapItem } from '@chakra-ui/react'
import StatContent from '../components/StatContent'
import { supabase } from '../utils/supabase';
//import { useBreakpointValue } from '@chakra-ui/react'

const Index = ({ }) => {

    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;
    const [loader, setLoader] = useState(false);
    //const mobile = useBreakpointValue({ base: true, md: false });
    const [users, setusers] = useState(0);
    const [trucks, setTrucks] = useState(0);
    const [invoices, setInvoices] = useState(0);
    const [invoicesPays, setInvoicesPays] = useState(0);

    useEffect(() => {
        getTodos();
    }, [company_id]);

    const getTodos = async () => {
        try {
            setLoader(false)
            const { count: users } = await supabase.from('user').select('*', { count: 'exact', head: true }).eq('company_id', company_id);
            const { count: invoices } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('company_id', company_id);
            let { data: totalMoney } = await supabase.from('invoices').select('total').eq('company_id', company_id).ilike('tipoMoneda', '%mxn%');
            const { count: trucks } = await supabase.from('truck').select('*, groups!inner(company_id)', { count: 'exact', head: true }).eq('groups.company_id', company_id);
            setTrucks(trucks)
            setusers(users)
            setInvoices(invoices)
            setInvoicesPays(totalMoney.reduce((sum, record) => sum + record.total, 0))
        } catch (error) {
            console.log("🚀 ~ getTodos ~ error:", error)
        } finally {
            setLoader(true)
        }
    }

    return (
        <div style={{ padding: 20, height: '100%' }}>
            <h1 className='welcome-statistic'>Bienvenido, ¡{information_user?.name} {information_user?.last_name}!</h1>
            <h1 style={{ color: 'gray', fontWeight: '300', paddingBottom: 18 }}>En seguida te ponemos al día.</h1>
            {!loader ? <LoaderList /> :
                <>
                    <Wrap gap={1} className='wrap-list-index' style={{ flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                        <StatContent title={'Vehículos'} count={`${trucks}`} label={'Ver vehículos'} />
                        <StatContent title={'Usuarios'} count={`${users}`} label={'Ver usuarios'} />
                        <StatContent title={'Facturas totales'} count={`${invoices}`} label={'Ver facturas'} />
                        <StatContent title={'Total (MXN)'} count={`$ ${invoicesPays}`} label={'Ver facturas'} />
                    </Wrap>
                </>}
        </div>
    );
};

export default Index;