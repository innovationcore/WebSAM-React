import {Card, CardBody, CardHeader, CardTitle, Col, Container, Row} from "react-bootstrap";
import '../assets/css/Segment.css'
import config from "../../config";
import React, {useRef} from "react";

function Segment() {
    const [img_set, setImg] = React.useState(false);
    const [filename, setFilename] = React.useState('');
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState(null);
    const hiddenFileInput = useRef(null);

    const buttonClick = event => {
        hiddenFileInput.current.click();
    }

    // Will need logic for if the file uploaded is of a dicom format, pass it to a server and get a slice
    const handleFile = event => {
        const file = event.target.files[0];
        setFilename(file.name);
        const imageUrl = URL.createObjectURL(file);
        setImagePreviewUrl(imageUrl);
        setImg(true);
    }

    return(
        <>
            <Container fluid>
                <Row style={{width:'100%'}}>
                    <Col xs={6} style={{width: '25%'}}>
                        <Card>
                            <Card>
                                <CardHeader style={{textAlign:'center'}}>
                                    <CardBody style={{display: 'flex', flexDirection: 'column'}}>
                                        <CardTitle as="h2">Controls</CardTitle>
                                        <button className={'controls'}>Click</button>
                                        <button className={'controls'}>Box</button>
                                        <button className={'controls'}>Everything</button>
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <button className={'controls'} style={{width: '50%'}}>Undo Last Point</button>
                                            <button className={'controls'} style={{width: '50%'}}>Clear Segment</button>
                                        </div>
                                    </CardBody>
                                    { img_set &&
                                        <CardBody>
                                            <CardTitle as="h2">Save Options</CardTitle>
                                            <button className={'controls'} style={{width: '100%'}}>Save Segmentation to DB</button>
                                            <button className={'controls'} style={{width: '100%'}}>Save Segmentation Locally</button>
                                        </CardBody>
                                    }
                                    <CardBody style={{display: 'flex', flexDirection: 'column'}}>
                                        <CardTitle as="h2">Other Options</CardTitle>
                                        <button className={'controls'}>Upload Points JSON</button>
                                        <button className={'controls'}>Restart</button>
                                    </CardBody>
                                </CardHeader>
                            </Card>
                        </Card>
                    </Col>
                    <Col style={{width: '75%'}}>
                        <Card style={{textAlign: 'center'}}>
                            {!img_set &&
                                <CardBody style={{marginTop: '33rem', marginBottom: '33rem'}}>
                                    <button className={'controls'} style={{width:'50%'}} onClick={buttonClick}>
                                        <CardTitle as="h2">Upload a DICOM or Image</CardTitle>
                                    </button>

                                    <input type={"file"} style={{display: 'none'}} ref={hiddenFileInput}
                                           onChange={handleFile}>
                                    </input>
                                </CardBody>
                            }
                            {img_set && <img src={imagePreviewUrl} alt={filename} style={{maxWidth: '100%'}}/>}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
export default Segment;
