import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Container, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import {loginUser} from '../../services/userFunctions';
import fieldValidation from '../../services/fieldValidation';

import './Login.css';

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            errorMessage: '',
            formErrors: {email: '', password: ''},
            emailValid: false,
            passwordValid: false
        }
    }

    validateForm = () => {
        this.setState({formValid: this.state.emailValid && this.state.passwordValid});
    }

    validateField = (fieldName, value) => {
        let formErrors = this.state.formErrors;
        let objValidation = fieldValidation(fieldName, value);

        formErrors[fieldName] = objValidation.msg;
        this.setState(
            {
                formErrors : formErrors,
                [`${fieldName}Valid`]: objValidation.valid
            }, 
            this.validateForm);
    }

    onChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        
        this.setState(
            {[name]: value},
            () => {this.validateField(name, value)}
        );
    }

    onSubmit = (event) => {
        event.preventDefault();
        const user = {
            email: this.state.email,
            password: this.state.password
        }
        loginUser(user)
            .then(res => {
                console.log(res);
                if(res.success) {
                    localStorage.setItem('x-access-token', res.data.token);
                    this.props.history.push('/userPanel');
                } else {
                    this.setState({errorMessage: res.msg})
                }                
            })
            .catch(err => console.log('err:', err))        
    }

    handleBlur = () => {
        this.setState({errorMessage: ''});
    }

    render() {
        return (
            <Container className = 'mt-2'>
                <Form 
                    noValidate
                    className = 'login row flex-column' 
                    onSubmit={this.onSubmit}
                    onBlur={this.handleBlur}>
                  
                    <Col 
                        xs={{size: 6, offset: 3}} 
                        className="error h6 text-uppercase my-2 text-center">
                        {this.state.errorMessage.length !== 0 && this.state.errorMessage}
                    </Col>
                    
                    <FormGroup className = 'd-flex justify-content-center align-items-center pt-1 mb-1'>
                        <Label 
                            for = 'email' 
                            className = 'label pl-2 mr-1 d-flex  justify-content-start align-items-center mb-0'>
                            <FontAwesomeIcon 
                                className = 'mr-2' 
                                icon="at"/>
                            {' '}Email
                        </Label>
                        <Input 
                            className = {`col-5 ${this.state.formErrors.email.length > 0 && 'errorInputBorder'}`}
                            type = 'email' 
                            name = 'email' 
                            id = 'email'
                            value={this.state.email}
                            onChange={this.onChange}
                            />
                    </FormGroup>
            
                    <Col 
                        xs={{size: 6, offset: 3}} 
                        className="error mb-4 text-center">
                        {this.state.formErrors.email}
                    </Col>
             
                    <FormGroup 
                        className = 'd-flex justify-content-center align-content-center pt-1 mb-1'>
                        <Label 
                            for = 'password' 
                            className = 'label pl-2 mr-1 d-flex justify-content-start align-items-center mb-0'>
                            <FontAwesomeIcon 
                                className = 'mr-2' 
                                icon="key"/>
                                {' '}Password
                        </Label>
                        <Input 
                            className = {`col-5 ${this.state.formErrors.password.length > 0 && 'errorInputBorder'}`} 
                            type = 'password' 
                            name = 'password' 
                            id = 'password'
                            value={this.state.password}
                            onChange={this.onChange}
                            />
                    </FormGroup>

                    <Col 
                        xs={{size: 6, offset: 3}} 
                        className="error mb-4 text-center">
                        {this.state.formErrors.password}
                    </Col>

                    <Button 
                        disabled={!this.state.formValid}
                        className = 'offset-4 col-4 my-1'>Log in
                    </Button>

                    <Col 
                        xs={{size: 12}} 
                        className="test text-right">
                        e-mail: maks@gmail.com psw: 1234
                    </Col>
                </Form>
            </Container>
        )
    }
}

export default Login;