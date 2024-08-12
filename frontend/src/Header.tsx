// eslint-disable-next-line no-unused-vars
import React, {useEffect, useRef, useState} from 'react';
import {Col, Container, Nav, Navbar, NavbarBrand, NavLink} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
// import './assets/css/Header.css';
import './App.tsx';
import logo from './assets/img/CAAI Logo.png';

function Header() {
    const [headerHeight, setHeaderHeight] = useState(0);
    const navbarRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (navbarRef.current) {
                setHeaderHeight(navbarRef.current.clientHeight);
            }
        };

        // Calculate header height on mount and on resize
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            <Navbar ref={navbarRef} bg="light" expand="md" fixed="top">
                <Container className="d-flex">
                    <Col>
                        <NavbarBrand me="0" href="https://caai.ai.uky.edu">
                            <img
                                src={logo}
                                height="40"
                                alt="CAAI logo"
                            />
                        </NavbarBrand>
                    </Col>
                    <Col style={{whiteSpace: 'nowrap'}}>
                        <Nav className="align-items-end align-text-bottom justify-content-center">
                            <NavLink id="navbar-name" className="navbar-comp" href="/">
                                WebSAM for UKHC
                            </NavLink>
                        </Nav>
                    </Col>
                    <Col />
                        <Nav className="navbar-nav ms-auto" style={{position: 'absolute', right:'20%'}} activeKey={location.pathname}>
                            <li className="nav-item navbar-comp">
                                <NavLink href="/">Home</NavLink>
                            </li>
                            <li className="nav-item navbar-comp">
                                <NavLink href="/segment">Segment</NavLink>
                            </li>
                            <li className="nav-item navbar-comp">
                                <NavLink href="/database">Database</NavLink>
                            </li>
                        </Nav>

                </Container>
            </Navbar>
            <div style={{ marginTop: headerHeight+20 }}></div>
        </>
    );
}

export default Header;