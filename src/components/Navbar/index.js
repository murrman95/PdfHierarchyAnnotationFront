import React, {Component} from 'react';

import {Navbar, Nav, Button} from 'react-bootstrap';

class NavBar extends Component {

    render () {
        return(
            <Navbar bg='primary' variant='dark' id='basic-navbar-nav'>
                <Navbar.Brand href='/'>
                    <img
                        src={require('./../../assets/ivalua_logo.png')}
                        height="40"
                        width="100"
                        alt=""
                        className="d-inline-block align-top"
                    />
                </Navbar.Brand>
                <Navbar.Text>
                    Contract Header Annotation Tool
                </Navbar.Text>

            </Navbar>
        )
        

    }

}

export default NavBar;
