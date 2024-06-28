import React, { useEffect } from 'react';
import { List, Avatar } from 'antd';
import { Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';
import {
    LogoutOutlined,
    SettingFilled,
    UserOutlined
} from '@ant-design/icons';
import '../assets/styles/truck.css';

const LabelProfile = ({ information_user, company, collapsed, signOut, opencog }) => {

    const {
        name,
        last_name,
        email
    } = information_user;

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleKeyDown = (event) => event.shiftKey && event.key === 'E' && signOut();

    const renderItem = () => (
        <List.Item>
            <List.Item.Meta
                className='list.item.meta'
                avatar={
                    <Avatar size='default' className='list-item-meta-avatar list-item-meta-title' style={{ marginRight: collapsed ? 7 : 0 }}>
                        {name.charAt(0)}{last_name && last_name.charAt(0)}
                    </Avatar>
                }
                title={!collapsed && <h1 className='list-item-meta-title'>{company?.name}</h1>}
                description={!collapsed && <h1 className='list-item-meta-description'>{name} {last_name}</h1>}
            />
        </List.Item>
    )

    return (
        <Menu>
            <MenuButton as={List}>
                <List itemLayout="horizontal" dataSource={[0]} renderItem={renderItem} />
            </MenuButton>
            <MenuList className='menu-lis-profile-sider'>
                <div className='menu-list-profile-header'>
                    <Avatar size='large' className='list-item-meta-avatar list-item-meta-title'>{name.charAt(0)}{last_name && last_name.charAt(0)}</Avatar>
                    <h1>{company?.name}</h1>
                    <h1 style={{ fontSize: 11 }}>{email}</h1>
                </div>
                <MenuDivider />
                <MenuItem icon={<SettingFilled />} onClick={() => opencog()}>
                    Configuración
                </MenuItem>
                <MenuItem icon={<UserOutlined />} onClick={() => opencog()}>
                    Inicio de sesión
                </MenuItem>
                <MenuItem /*href='#'*/ onClick={() => signOut()} icon={<LogoutOutlined />} command='⇧E'>
                    Salir
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default LabelProfile;