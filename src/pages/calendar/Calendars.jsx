import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/calendars.css'
import '../../assets/styles/truck.css'
import HeaderTitle from '../../components/HeaderTitle';
import { supabase } from '../../utils/supabase';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from '../../utils/moment-config';
import {
    Divider,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
} from '@chakra-ui/react'
import CreateEventModal from './CreateEventModal';
import { useSelector } from 'react-redux';
import { Layout } from 'antd';
const { Content } = Layout;

const Calendars = ({ }) => {

    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;
    const localizer = momentLocalizer(moment);
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [upList, setUpList] = useState(false);
    const [item, setItem] = useState(null);
    const [status, setStatus] = useState([]);

    useEffect(() => {
        getTodos();
    }, [company_id, upList]);

    async function getTodos() {
        try {
            const { data: status } = await supabase.rpc('_get_status_ordered_by_id', { _company_id_: company_id });
            if (status.length > 0) setStatus(status)
            console.log("🚀 ~ getTodos ~ status:", status)
            let { data, error } = await supabase.from('travel').select('*').eq('company_id', company_id);
            if (error) return;
            if (data.length > 0) {
                const eventsList = (data || []).map(program_flow => {
                    let state = status.find((item_) => item_?.id === program_flow?.status)
                    const {
                        id_user,
                        id_truck,
                        id_route,
                        date_out,
                        date_arrival,
                        ot,
                    } = program_flow;

                    return {
                        ...program_flow,
                        title: `${ot}`,
                        start: new Date(date_out),
                        end: new Date(date_arrival),
                        desc: `${id_truck} - ${id_route} - ${id_user}`,
                        state
                    };
                });
                setData(eventsList);
            }
        } catch (error) {
            console.log("🚀 ~ getTodos ~ error:", error)
        } finally {
            setUpList(false)
        }
    }

    const handleUpdateItem = ({ item }) => {
        setItem(item || {})
        onOpen()
    };

    const eventStyleGetter = (event) => {
        const backgroundColor = event?.state?.color || 'black';
        const style = {
            backgroundColor,
            borderRadius: '0px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return {
            style
        };
    };

    const handleEditItem = ({ item }) => {
        navigate('/calendar/details', {
            state: { company_id, item }
        });
    };

    return (
        <Layout className='content-layout'>
            <Content style={{ backgroundColor: 'white' }}>
                <HeaderTitle
                    title={'Órdenes de trabajo'}
                    handle={handleUpdateItem}
                />
                <Divider />
                <div className="calendar-container">
                    <Calendar
                        //selectable
                        localizer={localizer}
                        //views={['month', 'week', 'day', 'agenda']}
                        events={data}
                        eventPropGetter={eventStyleGetter}
                        messages={{
                            next: ">",
                            today: "Hoy",
                            previous: "<",
                            month: "Mes",
                            week: "Semana",
                            day: "Día"
                        }}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 'revert-layer', padding: 5 }}
                        onSelectEvent={(item) => handleEditItem({ item })}
                    />
                </div>
                <Modal onClose={onClose} size={'6xl'} isOpen={isOpen} closeOnOverlayClick={false} scrollBehavior={'outside'} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <CreateEventModal
                            company_id={company_id}
                            onClose={onClose}
                            item={item}
                            setUpList={setUpList}
                        />
                    </ModalContent>
                </Modal>
            </Content>
        </Layout>
    );
};

export default Calendars;