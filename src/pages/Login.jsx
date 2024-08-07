import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from "react-router-dom"
import { notification, } from 'antd';
import { connect } from "react-redux";
import { EyeOutlined, EyeInvisibleOutlined, UserOutlined, LockOutlined, } from '@ant-design/icons';
import { useBreakpointValue } from '@chakra-ui/react';
import Context from '../context/Context';
import { messagesNotificationLogin, supabase } from '../utils/supabase';
import { TailSpin, ThreeDots } from 'react-loader-spinner';

const openNotificationWithIcon = (api, type, description) => {
    api[type]({
        message: messagesNotificationLogin[type].message,
        description: messagesNotificationLogin[type].description || description,
    });
};


function Login({ openSession }) {
    const navigate = useNavigate();
    const { signIn } = useContext(Context);
    const mobile = useBreakpointValue({ base: true, md: false });
    const form = useRef();
    const [isSubmitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, description) => openNotificationWithIcon(api, type, description)

    const [data, setData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (event) => {
        const { value, name } = event.currentTarget;
        setData({ ...data, [name]: value });
    }

    const handleLogin = async (e) => {
        setSubmitting(true)
        e.preventDefault();
        if (!data.email.trim() || !data.password.trim()) {
            openNotification('warning', 'Debe rellenar los campos de correo y contraseña')
            return;
        }
        if (!regexEmail.test(data.email)) {
            openNotification('warning', 'Correo electrónico no valido')
            return;
        }
        const { data: user_ } = await supabase.from('user').select(`*, company:company_id (*)`).eq('email', data?.email.trim()).eq('password', data?.password.trim());
        //console.log("🚀 ~ handleLogin ~ user_:", user_)
        setSubmitting(false)
        if (user_[0]) {
            openNotification('success')
            openSession('OPEN_', user_[0])
            setTimeout(() => {
                signIn()
                navigate(`/home`);
            }, 1000);
        } else openNotification('error')
    };

    return (
        <div className="flex min-h-full flex-1" style={{ flexDirection: 'row-reverse' }}>
            {contextHolder}
            {!mobile &&
                <img
                    src={'/imgs/facturas.png'}
                    alt={"/imgs/facturas.png"}
                    style={{ width: '50%', objectFit: 'cover', filter: 'brightness(4.5)' }}
                />
            }
            <div className="flex min-h-full flex-1 flex-col">
                <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <img
                        className="mx-auto h-10 w-auto"
                        src={`/side-bar-logo.png`}
                        alt="/side-bar-logo.png"
                        style={{ objectFit: 'scale-down', height: 100 }}
                    />
                    <h2 className="mt-3 text-center text-2xl font-bold leading-9 tracking-tight" style={{ color: '#1e7fc3' }}>
                        VICTUM GEO TRUCK
                    </h2>
                    <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                    Correo electrónico
                                </label>
                                <div className="mt-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 pr-3 flex items-center cursor-pointer">
                                            <h1 className="text-gray-500 hover:text-gray-700">@</h1>
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="text"
                                            autoComplete="text"
                                            required
                                            value={data.email}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-0 py-1.5 p-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                        Contraseña
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 pr-3 flex items-center cursor-pointer">
                                            <LockOutlined className="text-gray-500 hover:text-gray-700" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            value={data.password}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-0 py-1.5 p-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                        <div
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        >
                                            {showPassword ? <EyeInvisibleOutlined className="text-gray-500 hover:text-gray-700" /> : <EyeOutlined className="text-gray-500 hover:text-gray-700" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                //onClick={handleLogin}
                                style={{ backgroundColor: '#1e7fc3' }}
                                className="flex w-full justify-center rounded-md-5 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                {isSubmitting ? (
                                    <ThreeDots
                                        height="20"
                                        width="20"
                                        color="#ffffff"
                                        ariaLabel="loading"
                                    />
                                ) : (
                                    'Ingresar'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
                <h1 style={{ fontSize: 12, fontStyle: 'italic', color: 'gray', textAlign: 'center', marginBottom: 3 }}>
                    ©Todos los derechos reservados. Grupo CTI Tech-IN POS 2024
                </h1>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({ session: state.login.session });

const mapDispatchToProps = dispatch => ({
    openSession(type, data) { dispatch({ type, data }) }
});


export default connect(mapStateToProps, mapDispatchToProps)(Login);