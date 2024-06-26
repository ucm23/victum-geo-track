import React, { useEffect } from 'react';
import { List, Avatar } from 'antd';
import { Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';
import {
    LogoutOutlined,
    SettingFilled,
    UserOutlined
} from '@ant-design/icons';
import '../assets/styles/truck.css';

const LabelProfile = ({ information_user, company, collapsed, signOut }) => {

    const handleKeyDown = (event) => event.shiftKey && event.key === 'E' && signOut();

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const renderItem = () => (
        <List.Item>
            <List.Item.Meta
                className='list.item.meta'
                avatar={
                    <Avatar size='default' className='list-item-meta-avatar' style={{ marginRight: collapsed ? 5 : 0 }}>
                        <h1 className='list-item-meta-title'>
                            {information_user?.name.charAt(0)}{information_user?.last_name && information_user?.last_name.charAt(0)}
                        </h1>
                    </Avatar>
                }
                title={!collapsed && <h1 className='list-item-meta-title'>{company.name}</h1>}
                description={!collapsed && <h1 className='list-item-meta-description'>{information_user.name} {information_user.last_name}</h1>}
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
                    <Avatar size='large' className='list-item-meta-avatar' >
                        <h1 className='list-item-meta-title'>
                            {information_user?.name.charAt(0)}{information_user?.last_name && information_user?.last_name.charAt(0)}
                        </h1>
                    </Avatar>
                    <h1>{information_user?.email}</h1>
                </div>
                <MenuDivider />
                <MenuItem icon={<SettingFilled />}>
                    Configuración
                </MenuItem>
                <MenuItem icon={<UserOutlined />}>
                    Inicio de sesión
                </MenuItem>
                <MenuItem icon={<LogoutOutlined />} command='⌘E'>
                    Salir
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default LabelProfile;