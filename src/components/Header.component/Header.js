import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Container, Navbar, NavbarBrand} from 'reactstrap';
import './Header.css';

class Header extends Component {
    render() {
        return (
            <Container className = 'px-0'>
                <Navbar>
                    <NavbarBrand>
                        Test project
                    </ NavbarBrand>
                 
                    <div className = 'brand-ico'>
                        <FontAwesomeIcon icon="clipboard-list" size = "lg"/>
                    </div>
                </Navbar>
            </Container>
        )
    }
}

export default withRouter(Header);