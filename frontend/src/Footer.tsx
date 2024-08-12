import React from 'react';
import {Container} from "react-bootstrap";

function Footer() {
    return (
        <footer className="fixed-bottom bg-light" id="footer">
            <Container className="d-flex justify-content-center">
                <span>Copyright {new Date().getFullYear()} Center for Applied Artificial Intelligence</span>
            </Container>
        </footer>
    );
}

export default Footer;