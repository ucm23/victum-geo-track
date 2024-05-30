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
    CloseCircleFilled
} from '@ant-design/icons';

import { Layout, Menu } from 'antd';
const { Content, Sider } = Layout;
import '../../assets/styles/road.css'
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

const Road = ({ company_id, index }) => {
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

    const memoizedValue = useMemo(() => ({ data }), [data]);

    useEffect(() => {
        async function getTodos() {
            console.log('Fetching todos...');
            //let response = {};
            /*if (plate) {
                response = await supabase.rpc('get_trucks_by_company_and_plate', { _company_id_: company_id, _search_term: plate, _page: page, _page_size: pageSize });
            } else {
                response = await supabase.rpc('get_routes_by_company_', { _company_id_: company_id, _page: page, _page_size: pageSize });
            }*/

            let { data, error } = await supabase.rpc('get_routes_by_company_', { _company_id: company_id, _page: page, _page_size: pageSize });

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
            if (data.items.length > 0) {
                //const duplicatedArray = Array(3).fill(data).reduce((acc, curr) => acc.concat(curr), []);
                setData(data.items);
                setLength(data?.totalItems || 0)
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


    const renderItem = ({ item, index }) => {
        return (
            <tr key={index} className={'table-bg-by-index'}>
                <td className="sticky-left"><Checkbox></Checkbox></td>
                <th className="sticky-left">{index + 1 + currentPage}</th>
                <td>{item?.name}</td>
                <td>{item?.description}</td>
                <td>
                    <Dropdown menu={{
                        items: [
                            {
                                label: (
                                    <a target="_blank" rel="noopener noreferrer" onClick={() => console.log(item, index)}>
                                        Modificar
                                    </a>
                                ),
                            },
                            {
                                label: (
                                    <a target="_blank" rel="noopener noreferrer" onClick={() => console.log(item)}>
                                        Desactivar
                                    </a>
                                ),
                            }
                        ]
                    }}>
                        <a onClick={(e) => e.preventDefault()} >
                            <div className="table-column-logo" style={{ marginRight: 5 }}>
                                <MoreOutlined />
                            </div>
                        </a>
                    </Dropdown>
                </td>
            </tr>
        );
    };



    return (
        <NavBar index={index}>
            <Layout
                style={{
                    height: '100vh',
                    overflow: 'hidden',
                    padding: 0,
                    margin: 0
                }}
            >
                <Content>
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
                                Planeador de Rutas
                            </h1>
                            {/*<Radio.Group value={'all'} defaultValue="a" size='middle' onChange={(e) => console.log(e.target.value)}>
                                <Radio.Button value="all">Todos</Radio.Button>
                                <Radio.Button value="default">En función</Radio.Button>
                            </Radio.Group>*/}
                        </div>
                        <Button
                            onClick={handleCreateButtonClick}
                            className='btn-add-item' icon={<PlusOutlined />} fontWeight='bold' iconPosition={'start'} size='middle'>Agregar</Button>
                    </div>
                    <Divider />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            backgroundColor: 'white',
                            padding: 12
                        }}
                    >
                        {/*<Popover placement='bottom-start'>
                            <PopoverTrigger>
                                <Button className='btn-filters' shape="round" icon={<DownOutlined />} iconPosition='end'>Grupo</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverBody>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                    tempor incididunt ut labore et dolore.
                                </PopoverBody>
                            </PopoverContent>
                    </Popover>*/}

                        {/*<Formik
                            initialValues={{
                                plate: "",
                            }}
                            onSubmit={async (values, actions) => {
                                const { plate } =  values;
                                setPlate(plate)
                                actions.resetForm();
                                    
                            }}
                        >
                            {(props) => (
                                <Form>
                                    <Field name='plate'>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.plate && form.touched.plate}>
                                                <InputGroup>
                                                    <InputLeftElement color='gray' fontSize='10px' style={{ marginTop: -3 }}>
                                                        <SearchIcon color='gray' />
                                                    </InputLeftElement>
                                                    <Input
                                                        style={{ borderRadius: 25 }}
                                                        size='sm' {...field} 
                                                        placeholder="Placa"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                props.submitForm();
                                                            }
                                                        }}
                                                    />
                                                   <InputRightElement onClick={() => props.submitForm()}>
                                                        <CloseCircleFilled fontSize='10px' style={{ color: 'gray', marginTop: -6 }} />
                                                    </InputRightElement>
                                                </InputGroup>

                                            </FormControl>
                                        )}
                                    </Field>

                                </Form>
                            )}
                        </Formik>*/}
                        {/*<Button className='btn-filters' shape="round" icon={<DownOutlined />} iconPosition='end'>Grupo</Button>*/}

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                             {length ? `${page} - ${totalPages} de ${length}` : <ChakraBadge className='chakra-badge-label-page' colorScheme={'gray'}> </ChakraBadge>}
                            <a onClick={loadLess} >
                                <div className="load-less-left">
                                    <LeftOutlined />
                                </div>
                            </a>
                            <a onClick={loadMore} >
                                <div className="load-less-right">
                                    <RightOutlined />
                                </div>
                            </a>
                        </div>
                    </div>
                    <Divider />
                    <div className="tabs-container">
                        <div className="tabla">
                            {/*<div className="cabecera">Historial</div>*/}
                            <div
                                className="contenido table-scroll"
                                ref={contenedorRef}
                                onScroll={handleScroll}
                            >
                                <table>
                                    <thead className="cabecera">
                                        <tr>
                                            <th className={`${!scrolling && "sticky-left"} bg-80`}><Checkbox></Checkbox></th>
                                            <th className={`${!scrolling && "sticky-left"} bg-80`}>#</th>
                                            <th>NOMBRE</th>
                                            <th>DESCRIPCIÓN</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {memoizedValue?.data.map((item, index) => renderItem({ item, index }))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
        </NavBar>
    );
};

export default Road;