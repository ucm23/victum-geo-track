import React, { useState, useContext } from 'react';
import {
    HomeOutlined,
    UserOutlined,
    ApartmentOutlined, SettingFilled, LoginOutlined, MenuOutlined, TruckOutlined, CalendarOutlined, MailOutlined,
    ArrowLeftOutlined,
    ToolOutlined,
    SettingOutlined,
    BankOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Divider, useBreakpointValue } from '@chakra-ui/react'
import Context from '../context/Context';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, List, Button } from "antd";
import { useSelector } from 'react-redux';

const { Header, Content, Sider } = Layout;

const menu = [
    {
        key: '1',
        label: 'Inicio',
        icon: React.createElement(HomeOutlined),
        route: '/home'
    },
    {
        key: '2',
        label: 'Buzón CFDi',
        icon: React.createElement(MailOutlined),
        route: '/buzon'
    },
    {
        key: '3',
        label: 'Calendario',
        icon: React.createElement(CalendarOutlined),
        route: '/calendar'
    },
    {
        key: '4',
        label: 'Vehículos',
        icon: React.createElement(TruckOutlined),
        route: '/truck',
    },
    {
        key: '5',
        label: 'Usuarios',
        icon: React.createElement(UserOutlined),
        route: '/users'
    },
    {
        key: '6',
        label: 'Rutas',
        icon: React.createElement(ApartmentOutlined),
        route: '/routes'
    },
]

const menu_ = [
    {
        label: 'Configuración',
        icon: React.createElement(SettingFilled),
        route: '/settings'
    },
    {
        label: 'Salir',
        icon: React.createElement(LoginOutlined),
    }
]

const menu_cog = [
    {
        key: '1',
        label: 'Generales',
        route: '/settings'
    },
    {
        key: '2',
        label: 'Perfil',
        route: '/profile'
    },
    {
        key: '1',
        label: 'Estados',
        route: '/status'
    },
    {
        key: '2',
        label: 'Tipos',
        route: '/types'
    },
    {
        key: '3',
        label: 'Grupos',
        route: '/groups'
    },
    
]

const menu_cog_2 = [
    {
        key: '1',
        label: 'Generales',
        route: '/settings'
    },
    {
        key: '2',
        label: 'Perfil',
        route: '/profile'
    },
]

const NavBar = ({ children }) => {

    const { token: { colorBgContainer } } = theme.useToken();
    const navigate = useNavigate();
    const information_user = useSelector(state => state.login.information_user);
    const { company } = information_user;
    const { signOut } = useContext(Context);
    const [collapsed, setCollapsed] = useState(false);
    const [menuCog, setMenuCog] = useState(true);
    const mobile = useBreakpointValue({ base: true, md: false });

    const opencog = () => {
        setCollapsed(false);
        setMenuCog(!menuCog);
    }

    const backHome = () => {
        setMenuCog(true);
        navigate(`/`)
    }

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Layout>
                <Sider
                    collapsed={collapsed}
                    style={{ backgroundColor: colorBgContainer, borderRightWidth: 0.5 }}
                //breakpoint="lg"
                //collapsedWidth={mobile ? "0" : ''}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: menuCog && 'space-between', height: menuCog && '100%' }}>
                        {!menuCog ?
                            <div className='div-header-1'>
                                <Button icon={<ArrowLeftOutlined />} type="link" onClick={backHome}>Regresar</Button>
                                <div className='div-header-2'>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={[{ title: 'Configuración' }]}
                                        renderItem={(item, index) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar size="large" style={{ alignSelf: 'center' }}>
                                                            <ToolOutlined />
                                                        </Avatar>
                                                    }
                                                    title={
                                                        <h1 style={{ fontSize: 12, fontWeight: '400', color: 'gray', lineHeight: 1 }}>{item.title}</h1>
                                                    }
                                                    description={
                                                        <h1 style={{ fontSize: 18, fontWeight: 'bold', color: 'black', lineHeight: 1 }}>{company.name}</h1>
                                                    }

                                                />
                                            </List.Item>
                                        )}
                                    />
                                    <Divider />
                                    {/*<div className='div-header-menu-1'>
                                        <BankOutlined style={{ fontSize: 20 }} />
                                        <h1 style={{ fontSize: 17, fontWeight: '600' }}>Administración</h1>
                                    </div>*/}
                                </div>
                            </div> :
                            <div className='div-header-3'>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={[{ title: 'Configuración' }]}
                                    style={{}}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                className='list.item.meta'
                                                avatar={
                                                    <Avatar size='default' style={{ alignSelf: 'center', backgroundColor: '#60b7a3', marginRight: collapsed ? 5 : 0 }}>
                                                        <h1 style={{ fontSize: 12, fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{information_user?.name.charAt(0)}{information_user?.last_name && information_user?.last_name.charAt(0)}</h1>
                                                    </Avatar>
                                                }
                                                title={!collapsed &&
                                                    <h1 style={{ fontSize: 12, fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{company.name}</h1>
                                                }
                                                description={!collapsed &&
                                                    <h1 style={{ fontSize: 12, fontWeight: '400', color: 'white', lineHeight: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{information_user.name} {information_user.last_name}</h1>
                                                }

                                            />
                                        </List.Item>
                                    )}
                                />
                                <Divider />
                            </div>
                        }

                        {/*!menuCog &&
                            <Menu mode="inline" style={{ height: '100%', borderRight: 0, paddingLeft: !menuCog && 24 }}>
                                {menu_cog_2.map((item, index) =>
                                    <Menu.Item key={`item-menu-cog-${item?.route}-${index}`}>
                                        <Link to={item.route}>{item.label} </Link>
                                    </Menu.Item>
                                )}
                            </Menu>
                        */}
                        {!menuCog &&
                            <div className='div-header-1'>
                                <div className='div-header-2'>
                                    <div className='div-header-menu-1'>
                                        <SettingOutlined style={{ fontSize: 20 }} />
                                        <h1 style={{ fontSize: 17, fontWeight: '600' }}>Sistema</h1>
                                    </div>
                                </div>
                            </div>
                        }

                        <Menu theme={!menuCog ? 'light' : "dark"} mode="inline" style={{ height: '100%', borderRight: 0, paddingTop: 4, paddingLeft: !menuCog && 24 }}>
                            {menuCog ?
                                menu.map((item, index) =>
                                    <Menu.Item key={`item-menu-${item?.route}-${index}`}>
                                        <Link to={item.route}><span> {item.icon} &nbsp; <span>{item.label}</span></span></Link>
                                    </Menu.Item>
                                ) : menu_cog.map((item, index) =>
                                    <Menu.Item key={`item-menu-cog-${item?.route}-${index}`}>
                                        <Link to={item.route}>{item.label} </Link>
                                    </Menu.Item>
                                )
                            }
                        </Menu>
                        {menuCog &&
                            <Menu theme="dark" mode="inline" style={{ height: '100%', borderRight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                {menu_.map((item, index) => (
                                    <Menu.Item key={`item-bottom-${item?.route || item?.label}-${index}`} onClick={() => index ? signOut() : opencog()}>
                                        <Link to={item.route} /*to={!index && item.route}*/>
                                            <span>{item.icon} &nbsp; <span>{item.label}</span></span>
                                        </Link>
                                    </Menu.Item>
                                ))}
                            </Menu>
                        }

                    </div>
                </Sider>
                <Layout>
                    {menuCog &&
                        <>
                            <Header style={{ display: 'flex', alignItems: 'center', background: 'white' }}>
                                {mobile &&
                                    <div className="btn-menu-header" onClick={() => setCollapsed(!collapsed)} >
                                        <MenuOutlined />
                                    </div>
                                }

                                <img src="/side-bar-logo.png" alt="/side-bar-logo.png" style={{ height: 50, marginLeft: !mobile ? 12 : 0 }} />
                                <h1 className='header-title'>Victum Geo Truck</h1>
                            </Header>
                            <Divider />
                        </>
                    }
                    <Content>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}

export default NavBar;