import React, { useEffect, useState } from 'react'
import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { LikeOutlined } from '@ant-design/icons';
import { Col, Row, Statistic } from 'antd';
import { HStack } from '@chakra-ui/react';

const Index = ({ }) => {
    const location = useLocation();
    const { pathname } = location;


    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;

    return (
        <div style={{ padding: 20 }}>
            <h1>3</h1>
            <HStack gap={4} justifyContent={'space-between'} style={{ flexWrap: 'wrap' }}>
                <div className='container-statistic'>
                    <div className='icon-statistic' style={{ backgroundColor: 'blue' }}>
                        <LikeOutlined style={{ fontSize: 30 }} />
                    </div>
                    <div className='label-statistic'>
                        <h1>Facturas pagadas</h1>
                        <h1>3 / 6</h1>
                    </div>
                </div>
            </HStack>
        </div>
    );
};

export default Index;