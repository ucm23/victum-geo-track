import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom';

const OrderWork = ({}) => {
    const location = useLocation();
    const { pathname } = location;
    console.log("🚀 ~ OrderWork ~ pathname:", pathname)
    const { id } = useParams();
    console.log("🚀 ~ OrderWork ~ id:", id)
  
    return (
        <div>
            <h1>OrderWork</h1>
            <h1>{id}</h1>
        </div>
    );
};

export default OrderWork;