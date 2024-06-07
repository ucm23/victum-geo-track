import '../assets/styles/truck.css';
import {
    CloseCircleFilled
} from '@ant-design/icons';
import {
    FormControl,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { Field, Form, Formik } from 'formik';

export default function SearchSimple({ setPlate, placeholder }) {
    return (
        <Formik
            initialValues={{ plate: "", }}
            onSubmit={({ plate }, { resetForm }) => {
                setPlate(plate)
                resetForm();
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
                                        placeholder={placeholder}
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
        </Formik>
    )
}