import React, { useEffect } from "react";
import config from "../../config";
import {CardBody, CardHeader, Col, Container, Row} from "react-bootstrap";
import '../assets/css/DBView.css';

function DBView() {
    const [data, setData] = React.useState([{
        id: 'err',
        filename: 'There was an error reaching the database. Contact an admin.',
        thumbnail: 'err', // will be base64
        date_uploaded: 'err',
        points_json: 'err',
        overlay_json: 'err'
    }]); // tracks data for display in db view

    // Get data from server, save it to a variable to make it iterable so we can print it below, line by line
    const getData = async () => {
        await fetch(config.image_server + '/populate')
            .then(res => res.json())
            .then(data => {
                setData(data);
            });
    }

    const DBCheck = async () => {
        await fetch(config.image_server + '/api/get_table')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.code === 0) {
                    if (data.data.length > 0) {
                        setData(data.data);
                    } else {
                        console.log('data length was 0')
                        setData([{
                            id: 'err',
                            filename: 'The database is currently empty.',
                            thumbnail: 'err', // will be base64
                            date_uploaded: 'err',
                            points_json: 'err',
                            overlay_json: 'err'
                        }]);
                    }
                }
            });
    }

    // Run the DB Check to populate the table view here
    useEffect(() => {
        DBCheck();
        console.log(data);
    }, []);

    return (
        <>
            <Container fluid as='table' className={'card'} style={{maxHeight: '90rem', width: '98vw'}}>
                <thead>
                    <Row as='tr'>
                        <Col as='th'>
                            <h5>Timestamp</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Thumbnail</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Filename</h5>
                        </Col>

                        <Col as='th'>
                            <h5>Points JSON</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Overlay JSON</h5>
                        </Col>
                        {/*<Col as='th'>
                            <h5>Open</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Delete</h5>
                        </Col>*/}
                    </Row>
                </thead>

                <tbody>
                {data.map((item, index) => (
                    <Row as='tr' key={index}>
                        <Col as='td'>{item.date_uploaded}</Col>
                        <Col as='td'><img src={item.thumbnail} alt="err"/></Col>
                        <Col as='td'>{item.filename}</Col>
                        <Col as='td'>{JSON.stringify(item.points_json)}</Col>
                        <Col as='td'>{JSON.stringify(item.overlay_json)}</Col>
                        {/*<Col as='td'><button>Open</button></Col>
                        <Col as='td'><button>Delete</button></Col>*/}
                    </Row>
                ))}
                </tbody>

                <tfoot>
                    <Row as='tr'>
                        <Col as='th'>
                            <h5>Timestamp</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Thumbnail</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Filename</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Points JSON</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Overlay JSON</h5>
                        </Col>
                        {/*<Col as='th'>
                            <h5>Open</h5>
                        </Col>
                        <Col as='th'>
                            <h5>Delete</h5>
                        </Col>*/}
                    </Row>
                </tfoot>
            </Container>
        </>
    );
}

export default DBView;
