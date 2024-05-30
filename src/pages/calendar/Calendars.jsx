import React, { useEffect, useState, useRef, useMemo } from 'react'
import NavBar from '../../components/NavBar';
import { useNavigate } from 'react-router-dom';
import {
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,
    useDisclosure,
    Stack,
    FormControl,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
} from '@chakra-ui/react';
import { SearchIcon, SmallCloseIcon } from '@chakra-ui/icons'
import { Divider } from '@chakra-ui/react';
import { useLocation } from "react-router-dom";
import { Kbd } from '@chakra-ui/react'
import {
    RightOutlined,
    LeftOutlined,
    DownOutlined,
    CloseCircleFilled,
    UnorderedListOutlined,
    CalendarOutlined
} from '@ant-design/icons';

import { Layout, Menu } from 'antd';
const { Content, Sider } = Layout;
import '../../assets/styles/calendars.css'
import { Link } from 'react-router-dom';

import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { Radio } from 'antd';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import { pageSize, supabase } from '../../utils/supabase';

import { Badge } from 'antd';
import { Dropdown } from 'antd';
import { Badge as ChakraBadge } from '@chakra-ui/react';
import { MoreOutlined } from '@ant-design/icons';
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react'
import { Tabs } from 'antd';
import { Field, Form, Formik } from 'formik';
const { TabPane } = Tabs;


import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
const localizer = momentLocalizer(moment)

//require('moment/locale/es.js');
//const localizer = momentLocalizer(moment);


const Calendars = ({ company_id, index }) => {
    const location = useLocation();
    const { pathname } = location;

    const navigate = useNavigate();

    const handleCreateButtonClick = () => {
        navigate('/routes/create');
    };

    const [page, setPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(0);
    const [length, setLength] = useState(0);

    const loadLess = () => {
        if (currentPage > 0) {
            setCurrentPage(Math.abs(currentPage - pageSize))
            setPage(page - 1);
        }
    }
    const loadMore = () => {
        if (length > currentPage + pageSize) {
            setCurrentPage(Math.abs(currentPage + pageSize));
            setPage(page + 1);
        }
    }

    const totalPages = Math.ceil(length / pageSize);

    const [plate, setPlate] = useState('')
    const [data, setData] = useState([]);
    const [collapsed, setCollapsed] = useState(true);
    const [scrolling, setScrolling] = useState(false);
    const contenedorRef = useRef(null);

    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = useRef()

    const handleScroll = () => {
        const scrollTop = contenedorRef.current.scrollTop;
        const scrollLeft = contenedorRef.current.scrollLeft;
        if (scrollLeft !== 0) setScrolling(false)
        else if (scrollTop !== 0) setScrolling(true)
    };

    //const memoizedValue = useMemo(() => ({ data }), [data]);

    useEffect(() => {
        async function getTodos() {
            console.log('Fetching todos...');
            //let response = {};
            /*if (plate) {
                response = await supabase.rpc('get_trucks_by_company_and_plate', { _company_id_: company_id, _search_term: plate, _page: page, _page_size: pageSize });
            } else {
                response = await supabase.rpc('get_routes_by_company_', { _company_id_: company_id, _page: page, _page_size: pageSize });
            }*/

            //let { data, error } = await supabase.rpc('get_routes_by_company_', { _company_id: company_id, _page: page, _page_size: pageSize });
            let { data, error } = await supabase.from('travel').select('*')

            //const { data, error } = response;
            /*const { data, error } = await supabase.from('situation').select('*')
                .in('id_truck', supabase.from('truck').select('id')
                    .in('group_id', supabase.from('groups').select('id').eq('company_id', company_id))
                )*/

            if (error) {
                console.error('Error fetching todos:', error);
                return;
            }

            //data.map(item => console.log(item))

            console.log('Data fetched:', data);
            if (data.length > 0) {
                let eventsList = [];
                for (const program_flow of data || []) {
                    const {
                        id,
                        id_user,
                        id_truck,
                        id_route,
                        cost,
                        date_out,
                        date_arrival,
                    } = program_flow;
                    eventsList.push({
                        id,
                        title: `${id_truck}`,
                        start: new Date(date_out),
                        end: new Date(date_arrival),
                        desc: `${id_truck} - ${id_route} - ${id_user}`,
                        cost
                    });

                }
                setData(eventsList);
                console.log("🚀 ~ getTodos ~ eventsList:", eventsList)
                //const duplicatedArray = Array(3).fill(data).reduce((acc, curr) => acc.concat(curr), []);
                //setData(data);
                setLength(data?.length || 0)
            } else {
                console.log('No todos found');
            }
        }
        getTodos();
    }, [page]);

    const getColorStatus = (id) => {
        const colors = {
            1: 'blue',
            2: 'green',
            3: 'gray'
        }
        return colors[id]
    }

    return (
        <NavBar index={index}>
            <Layout
                style={{
                    height: '100vh',
                    overflow: 'hidden',
                    padding: 0,
                    margin: 0,
                    backgroundColor: 'white'
                }}
            >
                <Content style={{ backgroundColor: 'white' }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            backgroundColor: 'white',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 20
                            }}
                        >
                            <h1
                                className='title-header'
                                style={{
                                    fontSize: 17,
                                    fontWeight: '600'
                                }}
                            >
                                Órdenes de trabajo
                            </h1>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6
                            }}
                        >
                            <Radio.Group value={'0'} defaultValue="0" size='middle' onChange={(e) => console.log(e.target.value)}>
                                <Radio.Button value="0"><CalendarOutlined /></Radio.Button>
                                <Radio.Button value="1"><UnorderedListOutlined /></Radio.Button>
                            </Radio.Group>
                            <Button
                                onClick={handleCreateButtonClick}
                                className='btn-add-item' icon={<PlusOutlined />} fontWeight='bold' iconPosition={'start'} size='middle'>Agregar</Button>
                        </div>
                    </div>
                    <Divider />

                    <div className="calendar-container">
                        <Calendar
                            //selectable
                            localizer={localizer}
                            //views={['month', 'week', 'day', 'agenda']}
                            events={data}
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
                        /*components={{
                            event: EventCalendar,
                            agenda: { event: EventAgenda } // Componente de OBAC
                        }}*/
                        />

                    </div>
                </Content>
            </Layout>
        </NavBar>
    );
};

export default Calendars;