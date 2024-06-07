import React, { useEffect, useState, useMemo, useContext, useRef } from 'react';
import { HomeOutlined, UserOutlined, ApartmentOutlined, SettingFilled, LoginOutlined, MenuOutlined, TruckOutlined, CalendarOutlined, } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Divider } from '@chakra-ui/react'
import Context from '../context/Context';
import { Link } from 'react-router-dom';

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
        label: 'Calendario',
        icon: React.createElement(CalendarOutlined),
        route: '/calendar'
    },
    {
        key: '3',
        label: 'Vehículos',
        icon: React.createElement(TruckOutlined),
        route: '/truck',
    },
    {
        key: '4',
        label: 'Usuarios',
        icon: React.createElement(UserOutlined),
        route: '/users'
    },
    {
        key: '5',
        label: 'Rutas',
        icon: React.createElement(ApartmentOutlined),
        route: '/routes'
    },
]

const menu_ = [
    {
        label: 'Configuración',
        icon: React.createElement(SettingFilled),
        route: '/home'
    },
    {
        label: 'Salir',
        icon: React.createElement(LoginOutlined),
    }
]


const NavBar = ({ index, children }) => {

    const { token: { colorBgContainer } } = theme.useToken();
    const { signOut } = useContext(Context);
    const [collapsed, setCollapsed] = useState(true);

    return (
        <Layout
            style={{
                height: '100vh',
                overflow: 'hidden'
            }}
        >
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                }}
            >
                <div>
                    <div className="btn-menu-header" onClick={() => setCollapsed(!collapsed)} >
                        <MenuOutlined />
                    </div>
                </div>
                <img
                    src="/side-bar-logo.png"
                    alt="/side-bar-logo.png"
                    style={{ height: 55 }}
                />
                <h1 className='header-title'>Victum Geo Truck</h1>
            </Header>
            <Divider />

            {/*} <Divider />*/}
            <Layout>
                <Sider
                    //collapsible 
                    collapsed={collapsed}
                    //onCollapse={(value) => setCollapsed(value)}
                    //width={collapsed ? 0 : 225}
                    style={{
                        backgroundColor: colorBgContainer,
                        borderRightWidth: 0.5
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}
                    >
                        <Menu
                            //mode='vertical'
                            mode="inline"
                            //defaultSelectedKeys={[`${index}`]}
                            //defaultOpenKeys={[`${key_}`]}
                            style={{
                                height: '100%',
                                borderRight: 0,
                            }}
                        >
                            {menu.map((item, index) => (
                                item.sub ? (
                                    <Menu.SubMenu key={`submenu-${index}`} title={<span>{item.icon} &nbsp; <span>{item.label}</span></span>}>
                                        {item.children.map((subItem, subIndex) => (
                                            <Menu.Item key={`subitem-${index}-${subIndex}`}>
                                                <Link to={subItem.route}>
                                                    {subItem.label}
                                                </Link>
                                            </Menu.Item>
                                        ))}
                                    </Menu.SubMenu>
                                ) : (
                                    <Menu.Item key={`item-${index}`}>
                                        <Link to={item.route}>
                                            <span>{item.icon} &nbsp; <span>{item.label}</span></span>
                                        </Link>
                                    </Menu.Item>
                                )
                            ))}
                        </Menu>

                        <Menu
                            mode="inline"
                            style={{
                                height: '100%',
                                borderRight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                            }}
                        >
                            {menu_.map((item, index) => (
                                <Menu.Item key={`item-${index}`} onClick={() => index ? signOut() : {}}>
                                    <Link to={!index && item.route}>
                                        <span>{item.icon} &nbsp; <span>{item.label}</span></span>
                                    </Link>
                                </Menu.Item>

                            ))}
                        </Menu>
                    </div>
                </Sider>
                <Layout
                //className='layout'
                >
                    <Content>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}

export default NavBar

/*NavBar.propTypes = {
    children: PropTypes.node,
    with: PropTypes.bool
}*/