import React, { useEffect, useState, useRef } from 'react'
import NavBar from '../../components/NavBar';
import ListEmpty from '../../components/ListEmpty';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "antd";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Input, Stack, ButtonGroup, Select, useNumberInput, useDisclosure, Textarea, NumberInput, NumberInputField } from '@chakra-ui/react';
import { ArrowLeftOutlined, ProfileOutlined, FileTextOutlined, HolderOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import '../../assets/styles/road.css'
import { Divider } from '@chakra-ui/react'
import { Card, Button as ButtonChakra } from '@chakra-ui/react'
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';
import GoogleMapReact from 'google-map-react';
import {
    FormControl,
    FormLabel
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik';
import { supabase } from '../../utils/supabase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
} from '@chakra-ui/react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'

import {
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react'

import { Box, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    Autocomplete,
    DirectionsRenderer,
} from '@react-google-maps/api'

import { notification } from 'antd';

const messagesNotification = {
    success: {
        message: 'Registro éxitoso',
    },
    error: {
        message: 'Error',
        description: 'Hubo un problema al enviar los datos. Por favor, inténtalo de nuevo.',
    }
}

/*let points = [
    {
        "id": "1",
        "name": "casa",
        "direction": "avenida 15",
        "latitude": 19.4552,
        "longitude": -98.45456
    },
    {
        "id": "2",
        "name": "helados",
        "direction": "parada en la michoacana",
        "latitude": 19.4552,
        "longitude": -98.45456
    },
    {
        "id": "3",
        "name": "trabajo",
        "direction": "morelos 70",
        "latitude": 20.4552,
        "longitude": -100.45456
    }
]*/

const apiKey = "AIzaSyD9gA5UfZA21TZKOVtenIaZeef-ZqMlFhc";

const CreateRoad = ({ company_id }) => {

    const navigate = useNavigate();

    const { getInputProps } = useNumberInput({
        step: 1,
        defaultValue: 0,
        min: 1,
    })

    const input = getInputProps()
    const [tabIndex, setTabIndex] = useState(0)

    const [api, contextHolder] = notification.useNotification();

    const openNotificationWithIcon = (type, description) => {
        api[type]({
            message: messagesNotification[type].message,
            description: messagesNotification[type].description || description,
        });
    };

    const openNotification = (type, description) => openNotificationWithIcon(type, description)

    const [scrolling, setScrolling] = useState(false);
    const contenedorRef = useRef(null);
    const mapRef = useRef(null);

    const handleScroll = () => {
        const scrollTop = contenedorRef.current.scrollTop;
        const scrollLeft = contenedorRef.current.scrollLeft;
        if (scrollLeft !== 0) setScrolling(false)
        else if (scrollTop !== 0) setScrolling(true)
    };

    const [map, setMap] = useState(null);
    const [maps, setMaps] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 59.955413, lng: 30.337844 });
    const [markerPosition, setMarkerPosition] = useState({ lat: 59.955413, lng: 30.337844 });
    const center = { lat: 48.8584, lng: 2.2945 }

    useEffect(() => {
        if (window.google) {
            const autocompleteService = new window.google.maps.places.AutocompleteService();

            console.log("🚀 ~ useEffect ~ inputValue:", inputValue)
            if (inputValue) {
                autocompleteService.getPlacePredictions(
                    { input: inputValue },
                    (predictions, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                            setSuggestions(predictions);
                        } else {
                            setSuggestions([]);
                        }
                    }
                );
            } else {
                setSuggestions([]);
            }
        }
    }, [inputValue]);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSelect = (suggestion) => {
        setInputValue(suggestion.description);
        setSuggestions([]);
        /*const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: suggestion.description }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                setMapCenter({ lat: location.lat(), lng: location.lng() });
                setMarkerPosition({ lat: location.lat(), lng: location.lng() });
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });*/
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: suggestion.description }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                setMapCenter({ lat: location.lat(), lng: location.lng() });
                setMarkerPosition({ lat: location.lat(), lng: location.lng() });
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    };

    const handleMarkerDragEnd = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setInputValue(results[0].formatted_address);
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    };

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [items, setItems] = useState([]);

    const removeItemById = (id) => setItems(prevItems => prevItems.filter(item => item.id !== id));

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);
        setItems(reorderedItems);
    };

    //useEffect(() => {
    //setItems([])
    //}, []);

    let error = 'Campo requerido';
    const validate = (value) => !value && error;

    const [optimizedRoute, setOptimizedRoute] = useState(null);

    /*const optimizeRoute = () => {
        const waypoints = items.map(point => `${point.latitude},${point.longitude}`).join('|');
        const origin = `${items[0].latitude},${items[0].longitude}`;
        const destination = `${items[items.length - 1].latitude},${items[items.length - 1].longitude}`;
        console.log("🚀 ~ optimizeRoute ~ origin:", origin)
        console.log("🚀 ~ optimizeRoute ~ destination:", destination)

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true&key=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    setOptimizedRoute(data.routes[0].overview_polyline);
                    console.log("🚀 ~ optimizeRoute ~ data.routes[0].overview_polyline:", data.routes[0].overview_polyline)
                } else {
                    console.error('Error fetching directions:', data.status);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            }).finally(setTabIndex(2));
    }
    const handleApiLoaded = (map, maps) => {
        setMap(map);
        setMaps(maps);
    };*/

    useEffect(() => {
        if (map && maps && optimizedRoute) {
            const decodedPath = maps.geometry.encoding.decodePath(optimizedRoute.points);
            const optimizedPath = new maps.Polyline({
                path: decodedPath,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });

            optimizedPath.setMap(map);
        }
    }, [map, maps, optimizedRoute]);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: apiKey,
        libraries: ['places'],
    })

    //const [map, setMap] = useState(/** @type google.maps.Map */ (null))
    const [directionsResponse, setDirectionsResponse] = useState(null)
    const [distance, setDistance] = useState('')
    const [duration, setDuration] = useState('')

    async function calculateRoute() {
        try {
            const directionsService = new google.maps.DirectionsService()
            const waypoints = items.slice(1, -1).map(point => ({
                location: { lat: point.latitude, lng: point.longitude },
                stopover: true
            }));
            const results = await directionsService.route({
                origin: `${items[0].latitude},${items[0].longitude}`,
                destination: `${items[items.length - 1].latitude},${items[items.length - 1].longitude}`,
                // eslint-disable-next-line no-undef
                waypoints: waypoints,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING,
            })
            setMapCenter({ lat: items[0].latitude, lng: items[0].longitude });
            setDirectionsResponse(results)
            setDistance(results.routes[0].legs[0].distance.text)
            setDuration(results.routes[0].legs[0].duration.text)

            console.log("🚀 ~ calculateRoute ~ results.routes[0].legs[0].distance.text:", results.routes[0].legs[0].distance.text)
            console.log("🚀 ~ calculateRoute ~ results.routes[0].legs[0].duration.text:", results.routes[0].legs[0].duration.text)
            console.log("🚀 ~ calculateRoute ~ results:", results)
        } catch (error) {
            console.log("🚀 ~ calculateRoute ~ error:", error)
        } finally {
            setTabIndex(2)
        }
    }

    return (
        <NavBar index={2}>
            <Formik
                initialValues={{
                    name: "",
                    cost: "",
                    description: "",
                }}
                onSubmit={async (values, actions) => {
                    try {
                        actions.setSubmitting(true)
                        console.log(values)
                        console.log(values)
                        const { name, cost, description, } = values;
                        /*const { data, error } = await supabase
                            .from('truck')
                            .insert([
                                {
                                    model: values?.model,
                                    group_id: parseInt(values?.group_id)
                                },
                            ])
                            .select()*/
                        //console.log("🚀 ~ onSubmit= ~ data:", data)
                        //console.log("🚀 ~ error:", error)
                        const { data, error } = await supabase
                            .from('routes')
                            .insert([
                                {
                                    name,
                                    points: items,
                                    company_id,
                                    description,
                                    cost,
                                },
                            ])
                            .select()
                        console.log("🚀 ~ onSubmit= ~ data:", data)
                        console.log("🚀 ~ error:", error)
                        actions.resetForm();
                        actions.setFieldValue('cost', '0');
                        actions.setValues({ cost: '0' });
                        setItems([])
                        setTabIndex(0)
                    } catch (error) {
                        console.log("🚀 ~ onSubmit={ ~ error:", error)
                    } finally {
                        actions.setSubmitting(false)
                    }

                }}
            //validationSchema={validationSchema}
            >
                {(props) => (
                    <Form>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'white'
                            }}
                        >
                             {contextHolder}
                            <div>
                                <Link to="/routes">
                                    <Button icon={<ArrowLeftOutlined />} type="link">Rutas</Button>
                                </Link>
                                <h2
                                    style={{
                                        marginLeft: 15,
                                        fontSize: 19,
                                        fontWeight: '600',
                                        color: 'black'
                                    }}
                                >Agregar ruta</h2>
                            </div>
                            {/*<div
                                style={{
                                    marginRight: 15
                                }}
                            >
                                <Link to="/routes/">
                                    <Button type="link">Cancelar</Button>
                                </Link>
                                <Button type="primary">Guardar</Button>
                            </div>*/}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignContent: 'center',
                                margin: '0 auto'
                            }}
                        >
                            <Tabs index={tabIndex} onChange={(v) => setTabIndex(v)} size={'sm'} orientation="vertical" className='tabs-father' /*onChange={(index) => setTabIndex(index)}*/ /*variant="unstyled"*/>
                                <TabList className='tabs-list-tab'>
                                    <Tab>
                                        <ProfileOutlined />
                                        <h1 className='item-list-tab'> Detalles</h1>
                                    </Tab>
                                    <Tab isDisabled={!props?.values?.name}>
                                        <FileTextOutlined />
                                        <h1 className='item-list-tab'> Puntos</h1>
                                    </Tab>
                                    <Tab isDisabled={items.length < 2}>
                                        <FileTextOutlined />
                                        <h1 className='item-list-tab'> Ruta optimizada</h1>
                                    </Tab>
                                </TabList>

                                <TabPanels className='tabs-panel-tab' style={{ marginTop: 4 }}>
                                    <TabPanel className='tab-panel'>
                                        <div style={{ height: 'calc(100vh - 172px)', width: '100%', }} >
                                            <div style={{ marginRight: 15, width: '100%', }} >
                                                <Card>
                                                    <h1 className='title-card-form'>Detalles</h1>
                                                    <div className='form-body-card'>
                                                        <Stack className='form-field'>
                                                            <Field name='name' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl isInvalid={form.errors.name && form.touched.name}>
                                                                        <FormLabel>
                                                                            <h1 className='form-label requeried'>Nombre</h1>
                                                                        </FormLabel>
                                                                        <Input {...field} />
                                                                        {form.errors.name && <h1 className='form-error'>{form.errors.name}</h1>}
                                                                        <h1 className='form-helper'>e.g. Origen-Paradas-Destino-etc.</h1>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        <Stack className='form-field'>
                                                            <Field name='cost'>
                                                                {({ field, form }) => (
                                                                    <FormControl>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Costo</h1>
                                                                        </FormLabel>
                                                                        <NumberInput defaultValue={field.value}>
                                                                            <NumberInputField {...field} />
                                                                            <NumberInputStepper>
                                                                                <NumberIncrementStepper />
                                                                                <NumberDecrementStepper />
                                                                            </NumberInputStepper>
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                        <Stack className='form-field'>
                                                            <Field name='description' validate={validate}>
                                                                {({ field, form }) => (
                                                                    <FormControl /*isInvalid={form.errors.description && form.touched.description}*/>
                                                                        <FormLabel>
                                                                            <h1 className='form-label'>Descripción</h1>
                                                                        </FormLabel>
                                                                        <Textarea {...field} />
                                                                    </FormControl>
                                                                )}
                                                            </Field>
                                                        </Stack>
                                                    </div>
                                                </Card>
                                                <Divider mt={6} mb={6} />
                                                <ButtonGroup pb={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <ButtonChakra onClick={() => navigate('/routes/')} variant="link" style={{ color: '#1677ff', fontWeight: '300' }}>Cancelar</ButtonChakra>
                                                    <ButtonChakra
                                                        //mt={4}
                                                        //colorScheme='blue'
                                                        style={{ backgroundColor: '#1677ff', fontWeight: '300', color: 'white' }}
                                                        //isLoading={props.isSubmitting}
                                                        //type='submit'
                                                        onClick={() => setTabIndex(1)}
                                                        isDisabled={!props?.values?.name}
                                                    >
                                                        Siguiente
                                                    </ButtonChakra>
                                                </ButtonGroup>

                                            </div>

                                        </div>
                                    </TabPanel>

                                    <TabPanel className='tab-panel'>
                                        <div style={{ height: 'calc(100vh - 172px)', width: '100%', }} >
                                            <div style={{ marginRight: 15, width: '100%', }} >
                                                <Card pb={1}>
                                                    <div className='flex-row-center-vertical-between-wrap'>
                                                        <h1 className='title-card-form pb-1'>Puntos de parada</h1>
                                                        <div className='flex-row-center-vertical-between-wrap'>
                                                            {items.length >= 2 &&
                                                                <Button
                                                                    onClick={calculateRoute}
                                                                    type="primary"
                                                                    className='btn-add-item' icon={<SyncOutlined />} fontWeight='bold' iconPosition={'start'} size='middle'>Optimizar ruta</Button>
                                                            }

                                                            <Button
                                                                onClick={onOpen}
                                                                className='btn-add-item mr-20' icon={<PlusOutlined />} fontWeight='bold' iconPosition={'start'} size='middle'>Agregar</Button>
                                                        </div>
                                                    </div>
                                                    <Divider style={{ opacity: 0.1 }} />
                                                    <div className="tabla">
                                                        {/*<div className="cabecera">Historial</div>*/}
                                                        <div
                                                            className="contenido table-scroll"
                                                            ref={contenedorRef}
                                                            onScroll={handleScroll}
                                                        >
                                                            <table>
                                                                <thead className="header-routes">
                                                                    <tr>
                                                                        <th></th>
                                                                        <th className={`${!scrolling && "sticky-left"} bg-fff`}><Checkbox></Checkbox></th>
                                                                        <th className={`${!scrolling && "sticky-left"} bg-fff`}>#</th>
                                                                        <th>NOMBRE</th>
                                                                        <th>DIRECCIÓN</th>
                                                                        <th>LATITUD</th>
                                                                        <th>LONGITUD</th>
                                                                        <th></th>
                                                                    </tr>
                                                                </thead>

                                                                {items.length ?
                                                                    <DragDropContext onDragEnd={onDragEnd}>
                                                                        <Droppable droppableId="droppable">
                                                                            {(provided) => (
                                                                                <tbody
                                                                                    {...provided.droppableProps}
                                                                                    ref={provided.innerRef}
                                                                                    className="droppable-container"
                                                                                >
                                                                                    {items.map((item, index) => (
                                                                                        <Draggable key={`${item.id}`} draggableId={`${item.id}`} index={index}>
                                                                                            {(provided) => (
                                                                                                <tr
                                                                                                    ref={provided.innerRef}
                                                                                                    {...provided.draggableProps}
                                                                                                    {...provided.dragHandleProps}
                                                                                                //className={`table-bg-by-index `}
                                                                                                >
                                                                                                    <td className={`${!scrolling && "sticky-left"} bg-fff`}>
                                                                                                        <div className="table-column-logo">
                                                                                                            <HolderOutlined />
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td className={`${!scrolling && "sticky-left"} bg-fff`}><Checkbox isChecked={item?.isChecked}></Checkbox></td>
                                                                                                    <td className={`${!scrolling && "sticky-left"} bg-fff`}>{index + 1}</td>
                                                                                                    <td>{item.name}</td>
                                                                                                    <td>{item.direction}</td>
                                                                                                    <td>{item.latitude}</td>
                                                                                                    <td>{item.longitude}</td>
                                                                                                    <td style={{ display: 'flex', flexDirection: 'row' }}>
                                                                                                        <a onClick={(e) => e.preventDefault()} >
                                                                                                            <div className="table-column-logo" style={{ marginRight: 5 }}>
                                                                                                                <EditOutlined />
                                                                                                            </div>
                                                                                                        </a>
                                                                                                        <a onClick={() => removeItemById(item?.id)} >
                                                                                                            <div className="table-column-logo" style={{ marginRight: 5 }}>
                                                                                                                <DeleteOutlined />
                                                                                                            </div>
                                                                                                        </a>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )}
                                                                                        </Draggable>
                                                                                    ))}
                                                                                    {provided.placeholder}
                                                                                </tbody>
                                                                            )}
                                                                        </Droppable>
                                                                    </DragDropContext> : <h1></h1>}
                                                            </table>
                                                            {!items.length &&
                                                                <ListEmpty
                                                                    explication={'Las paradas consisten en puntos de origen y uno o más diversos destinos'}
                                                                    newItem={onOpen}
                                                                />}
                                                        </div>
                                                    </div>

                                                </Card>
                                                <Divider mt={6} mb={6} />
                                                <ButtonGroup pb={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <ButtonChakra onClick={() => navigate('/routes/')} variant="link" style={{ color: '#1677ff', fontWeight: '300' }}>Cancelar</ButtonChakra>
                                                    <ButtonChakra
                                                        //mt={4}
                                                        //colorScheme='blue'
                                                        style={{ backgroundColor: '#1677ff', fontWeight: '300', color: 'white' }}
                                                        //isLoading={props.isSubmitting}
                                                        //type='submit'
                                                        //onClick={() => {calculateRoute(); setTabIndex(2); }}
                                                        onClick={calculateRoute}
                                                        isDisabled={items.length < 2}
                                                    >
                                                        Siguiente
                                                    </ButtonChakra>
                                                </ButtonGroup>

                                            </div>

                                        </div>
                                    </TabPanel>


                                    <TabPanel className='tab-panel'>
                                        <div
                                            style={{
                                                height: 'calc(100vh - 172px)',
                                                width: '100%',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginRight: 15,
                                                    width: '100%',
                                                    //backgroundColor: 'red'
                                                }}
                                            >
                                                <Card pb={1}>
                                                    <div className='flex-row-center-vertical-between-wrap'>
                                                        <h1 className='title-card-form pb-1'>Ruta optimizada</h1>
                                                    </div>
                                                    <Divider style={{ opacity: 0.1 }} />
                                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        {(distance && duration) &&
                                                            <div style={{ width: '98%', border: '0.1px solid #B6B6B699', marginTop: 6, borderRadius: 6, padding: 8 }}>
                                                                <StatGroup>
                                                                    <Stat>
                                                                        <StatLabel>Distancia estimada</StatLabel>
                                                                        <StatNumber>{distance}</StatNumber>
                                                                    </Stat>

                                                                    <Stat>
                                                                        <StatLabel>Duración estimada</StatLabel>
                                                                        <StatNumber>{duration}</StatNumber>
                                                                    </Stat>
                                                                </StatGroup>
                                                            </div>
                                                        }
                                                        <GoogleMap
                                                            center={mapCenter}
                                                            zoom={15}
                                                            mapContainerStyle={{ width: '98%', height: '450px', marginBottom: 6, marginTop: 6, borderRadius: 6 }}
                                                            options={{
                                                                zoomControl: false,
                                                                streetViewControl: false,
                                                                mapTypeControl: false,
                                                                fullscreenControl: false,
                                                            }}
                                                            onLoad={map => setMap(map)}
                                                        >
                                                            <Marker position={center} />
                                                            {directionsResponse && (
                                                                <DirectionsRenderer directions={directionsResponse} />
                                                            )}
                                                        </GoogleMap>
                                                    </div>

                                                </Card>
                                                <Divider mt={6} mb={6} />
                                                <ButtonGroup pb={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <ButtonChakra onClick={() => navigate('/routes/')} variant="link" style={{ color: '#1677ff', fontWeight: '300' }}>Cancelar</ButtonChakra>
                                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                                        <ButtonChakra
                                                            //mt={4}
                                                            //colorScheme='blue'
                                                            variant='outline'
                                                            style={{ /*backgroundColor: '#1677ff',*/ fontWeight: '300', color: '#1677ff' }}
                                                            isLoading={props.isSubmitting}
                                                            //type='submit'
                                                            onClick={() => props.submitForm().then(props.setFieldValue('cost', '0'))}

                                                        >
                                                            Guardar & Añadir otro
                                                        </ButtonChakra>
                                                        <ButtonChakra
                                                            //mt={4}
                                                            //colorScheme='blue'
                                                            style={{ backgroundColor: '#1677ff', fontWeight: '300', color: 'white' }}
                                                            isLoading={props.isSubmitting}
                                                            //type='submit'
                                                            onClick={() => props.submitForm().then(navigate('/routes/'))}
                                                        >
                                                            Guardar
                                                        </ButtonChakra>
                                                    </div>
                                                </ButtonGroup>

                                            </div>

                                        </div>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>

                            <Formik
                                initialValues={{
                                    name_address: "",
                                    address: ""
                                }}
                                onSubmit={(values, actions) => {
                                    if (!inputValue) return 0;
                                    try {
                                        actions.setSubmitting(true)
                                        console.log(values)
                                        console.log("🚀 ~ inputValue:", inputValue)
                                        console.log("🚀 ~ markerPosition:", markerPosition)
                                        let obj = {
                                            "id": `${items.length + 1}`,
                                            "name": values?.name_address,
                                            "direction": inputValue,
                                            "latitude": markerPosition?.lat,
                                            "longitude": markerPosition?.lng
                                        }

                                        //points.push(obj)
                                        setItems([...items, obj]);
                                        actions.resetForm();
                                        setInputValue("")
                                    } catch (error) {
                                        console.log("🚀 ~ onSubmit={ ~ error:", error)
                                    } finally {
                                        //actions.setSubmitting(false)
                                        console.log("🚀 ~ items:", items)
                                    }

                                }}
                            //validationSchema={validationSchema}
                            >
                                {(props) => (
                                    <Form>
                                        <Modal
                                            onClose={onClose} size={'xl'} isOpen={isOpen} scrollBehavior={'inside'}
                                        >
                                            <ModalOverlay />
                                            <ModalContent>
                                                <ModalHeader>Añadir parada</ModalHeader>
                                                <ModalCloseButton />
                                                <Divider />
                                                <ModalBody>
                                                    <Stack className='form-field'>
                                                        <Field name='name_address' validate={validate}>
                                                            {({ field, form }) => (
                                                                <FormControl isInvalid={form.errors.name_address && form.touched.name_address}>
                                                                    <FormLabel>
                                                                        <h1 className='form-label requeried'>Nombre</h1>
                                                                    </FormLabel>
                                                                    <Input {...field} />
                                                                    {form.errors.name_address && <h1 className='form-error'>{form.errors.name_address}</h1>}
                                                                    <h1 className='form-helper'>Distintivo e. g. Cuidad, Estado etc.</h1>
                                                                </FormControl>
                                                            )}
                                                        </Field>
                                                    </Stack>
                                                    <Box style={{ marginTop: '0.3rem' }}>
                                                        <h1 className='form-label requeried'>Dirección</h1>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none">
                                                                <SearchIcon color="gray.300" />
                                                            </InputLeftElement>
                                                            <Input
                                                                value={inputValue}
                                                                onChange={handleChange}
                                                                size="md"
                                                            />
                                                        </InputGroup>
                                                        {suggestions.length > 0 && (
                                                            <Box mt={2} borderWidth="1px" borderRadius="md" boxShadow="md">
                                                                {suggestions.map((suggestion) => (
                                                                    <Box
                                                                        key={suggestion.place_id}
                                                                        p={2}
                                                                        borderBottomWidth="1px"
                                                                        cursor="pointer"
                                                                        _hover={{ bg: 'gray.100' }}
                                                                        onClick={() => handleSelect(suggestion)}
                                                                    >
                                                                        {suggestion.description}
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        <Divider opacity={0} mt={1} mb={1} />
                                                        <h1 className='form-label requeried'>Punto preciso</h1>
                                                        <div style={{ height: 350, width: '100%' }}>
                                                            <GoogleMapReact
                                                                ref={mapRef}
                                                                bootstrapURLKeys={{ key: apiKey }}
                                                                center={mapCenter}
                                                                defaultZoom={1}
                                                                onGoogleApiLoaded={({ map, maps }) => {
                                                                    const marker = new maps.Marker({
                                                                        position: markerPosition,
                                                                        map,
                                                                        draggable: true,
                                                                    });

                                                                    marker.addListener('dragend', (e) => handleMarkerDragEnd(e));
                                                                    map.addListener('click', (e) => {
                                                                        const lat = e.latLng.lat();
                                                                        const lng = e.latLng.lng();
                                                                        marker.setPosition({ lat, lng });
                                                                        handleMarkerDragEnd(e);
                                                                    });

                                                                    mapRef.current = map;
                                                                }}
                                                                yesIWantToUseGoogleMapApiInternals
                                                            />
                                                        </div>
                                                        <h1 className='form-helper italic'>**Da click sobre el maa para pinta un marcador preciso**</h1>
                                                    </Box>

                                                </ModalBody>
                                                <Divider />
                                                <ModalFooter style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                                                    <Button type="link" onClick={onClose}>Cerrar</Button>
                                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                                        <Button loading={props.isSubmitting} onClick={() => props.submitForm()}>Guardar & Añadir otro</Button>
                                                        <Button loading={props.isSubmitting} type="primary" onClick={() => props.submitForm().then(onClose())} >Guardar</Button>
                                                    </div>
                                                </ModalFooter>
                                            </ModalContent>
                                        </Modal>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </Form>
                )}
            </Formik>
        </NavBar>
    );
};

export default CreateRoad;