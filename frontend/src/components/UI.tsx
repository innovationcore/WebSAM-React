import {Card, CardBody, CardHeader, CardTitle, Col, Container, Row} from "react-bootstrap";
import '../assets/css/Segment.css'
import config from "../../config";
import React, {useEffect, useRef, useState} from "react";
import { InteractiveSegment, Point, Mask, Data, }
  from '/interactive_segment'

function Popup(text: string, timeout: number = 1000) {
  const popup = document.createElement('div')
  popup.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 z-50 bg-white text-gray-500 rounded-xl px-4 py-2'
  popup.innerHTML = text
  document.body.appendChild(popup)
  setTimeout(() => {
    popup.remove()
  }, timeout)
}

function PageLoad() {
  return null;
}

function url_to_file(dataurl : any, filename : any) {
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

function UI() {
    const [img_set, setImg] = React.useState(false);
    const [filename, setFilename] = React.useState('');
    const [imgx, setImageX] = useState('')
    const [imgy, setImageY] = useState('')
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState(null);
    const hiddenFileInput = useRef(null);
    const [img_loaded, setImageLoaded] = useState<boolean>(false)

    const [data, setData] = useState<Data | null>(null);
    const [mode, setMode] = useState<'click' | 'box' | 'everything'>('click')
    const [points, setPoints] = useState<Point[]>([])
    const [masks, setMasks] = useState<Mask[]>([])
    const [json_prompt, setJSONPrompt] = useState<string>('')

    const [processing, setProcessing] = useState<boolean>(false)
    const [ready, setBoxReady] = useState<boolean>(false)
    const controller = useRef<AbortController | null>()

    // Checks the display API for a file
    useEffect(() => {
        if (img_loaded) return
        // Get the parameter passed in the URL so that we can request the file for display
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          let uuid = params.get('uuid')
          if (uuid !== null) {
            uuid = uuid.replace(/ /g, '+')
            setFilename(uuid)
            console.log('uuid:' + uuid)

            const formData = new FormData()
            formData.append('UUID', JSON.stringify({UUID: uuid}))

            // Get the image from the database
            fetch('/api/get_file', {
              method: 'POST',
              body: formData,
              signal: controller.current?.signal
            }).then((res) => {
              return res.json()
            }).then((res) => {
              if (res.code == 0) {
                setImageLoaded(true)
                const file_data = res.file
                const type = res.type
                const img = new Image()
                const file = url_to_file(`data:${type};base64,` + file_data, uuid)
                console.log(file)
                img.src = URL.createObjectURL(file)
                console.log(img.width)
                console.log(img.height)
                img.onload = () => {
                  setImageX(img.width.toString())
                  setImageY(img.height.toString())
                  setData({
                    width: img.width,
                    height: img.height,
                    file,
                    img,
                  })
                }
              }
              else {
                alert(`File with uuid ${uuid} not found in database.`)
              }
            })
          }
        }
    })

    // Handles all the point functions
    useEffect(() => {
        if (!data) return
        if (mode === 'click' && points.length > 0) {
          const formData = new FormData()
          formData.append('file', new File([data.file], 'image.png'))
          const points_list = points.map((p) => {
            return {
              x: Math.round(p.x),
              y: Math.round(p.y)
            }
          })
          //alert(JSON.stringify(points_list))
          //let points_list = [{"x":1132,"y":1597}]
          const points_labels = points.map((p) => p.label)
          formData.append('points', JSON.stringify(
            { points: points_list, points_labels }
          ))
          controller.current?.abort()
          controller.current = new AbortController()
          setProcessing(true)
          fetch('/api/point', {
            method: 'POST',
            body: formData,
            signal: controller.current?.signal,
          }).then((res) => {
            return res.json()
          }).then((res) => {
            if (res.code == 0) {
              const maskData = res.data.map((mask: any) => {
                return mask
              })
              setMasks(maskData)
            }
          }).finally(() => {
            setProcessing(false)
          })
        }
        if (mode === 'box') {
          if (!ready) return
          if (points.length !== 2) return
          const formData = new FormData()
          formData.append('file', new File([data.file], 'image.png'))
          formData.append('box', JSON.stringify(
            {
              x1: Math.round(points[0].x),
              y1: Math.round(points[0].y),
              x2: Math.round(points[1].x),
              y2: Math.round(points[1].y),
            }
          ))
          controller.current?.abort()
          controller.current = new AbortController()
          setProcessing(true)
          fetch('/api/box', {
            method: 'POST',
            body: formData,
            signal: controller.current?.signal
          }).then((res) => {
            return res.json()
          }).then((res) => {
            if (res.code == 0) {
              setPoints([])
              const maskData = res.data.map((mask: any) => {
                return mask
              })
              setMasks(maskData)
            }
          }).finally(() => {
            setProcessing(false)
            setBoxReady(false)
          })
        }
    }, [data, mode, points, ready])

    useEffect(() => {
        setPoints([])
        setMasks([])
        setProcessing(false)
        switch (mode) {
          case 'click':
            break
          case 'box':
            break
          case 'everything':
            break
        }
    }, [mode])

    const handleEverything = () => {
        setMode('everything')
        if (!data) return
        const formData = new FormData()
        formData.append('file', new File([data.file], 'image.png'))
        controller.current?.abort()
        controller.current = new AbortController()
        setProcessing(true)
        fetch('/api/everything', {
          method: 'POST',
          body: formData,
          signal: controller.current?.signal
        }).then((res) => {
          setProcessing(false)
          return res.json()
        }).then((res) => {
          if (res.code == 0) {
            const maskData = res.data.map((mask: any) => {
              return mask
            })
            setMasks(maskData)
          }
        })
    }

    const handleDBDownload = () => {
        console.log(data);
        if (!data) return
        const formData = new FormData()
        formData.append('file', new File([data.file], 'image.png'))
        formData.append('filename', JSON.stringify({
          filename: filename.split('.')[0]+Date.now().toString()+filename.split('.')[1]
        }))
        formData.append('overlay_filename', JSON.stringify({
          filename: filename.split('.')[0]+Date.now().toString()+"+overlay.jpg"
        }))
        formData.append('imgx', JSON.stringify({
              x_dim: imgx
        }))
        formData.append('imgy', JSON.stringify({
              y_dim: imgy
        }))
        formData.append('points_filename', JSON.stringify({
          filename: filename.split('.')[0]+Date.now().toString()+"+points.json"
        }))
        const points_list = points.map((p) => {
            return {
              x: Math.round(p.x),
              y: Math.round(p.y)
            }
          })
        const points_labels = points.map((p) => p.label)
          formData.append('points', JSON.stringify(
            { points: points_list, points_labels }
          ))

        controller.current?.abort()
        controller.current = new AbortController()
        setProcessing(true)
        fetch(`${config['sam_server']}/api/download`, { // send it to the download api for the template site
          method: 'POST',
          body: formData,
          signal: controller.current?.signal
        }).then((res) => {
          setProcessing(false)
          return res.json()
        }).then((res) => {
          if (res.code == 0) {
            alert('Image Overlay downloaded to server.')
          }
        })
    }

    //Should function the same as handleCopyPaste but with uploading a JSON file
      const handleUploadJSON = () => {
        if (!data) return
        const formData = new FormData()

        const points_list = points.map((p) => {
          return {
            x: Math.round(p.x),
            y: Math.round(p.y)
          }
        })
        //alert(JSON.stringify(points_list))
        //let points_list = [{"x":1132,"y":1597}]
        const points_labels = points.map((p) => p.label)

        formData.append('file', new File([data.file], 'image.png'))
        formData.append('points', JSON.stringify({ points: points_list, points_labels }))
        controller.current?.abort()
        controller.current = new AbortController()
        setProcessing(true)
        fetch('/api/copy-paste', {
          method: 'POST',
          body: formData,
          signal: controller.current?.signal
        }).then((res) => {
          setProcessing(false)
          return res.json()
        }).then((res) => {
          if (res.code == 0) {
            const maskData = res.data.map((mask: any) => {
              return mask
            })
            setMasks(maskData)
          }
        })
    }

    const handleClick = () => {
        if (!data) return
        const fromData = new FormData()
        fromData.append('file', new File([data.file], 'image.png'))
        const points_list = points.map((p) => {
          return {
            x: Math.round(p.x),
            y: Math.round(p.y)
          }
        })
        const points_labels = points.map((p) => p.label)
        fromData.append('points', JSON.stringify(
            { points: points_list, points_labels }
        ))
        controller.current?.abort()
        controller.current = new AbortController()
        setProcessing(true)
        fetch('/api/point', {
          method: 'POST',
          body: fromData,
          signal: controller.current?.signal,
        }).then((res) => {
          return res.json()
        }).then((res) => {
          if (res.code == 0) {
            const maskData = res.data.map((mask: any) => {
              return mask
            })
            setMasks(maskData)
          }
        }).finally(() => {
          setProcessing(false)
        })
    }

    /*const handleDicomImage = () => {
        setImageLoaded(true);
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/!*, .dcm, .dicom';

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];

          if (file) {
            //console.log(file);
            setFilename(file.name.replace(/ /g, '+'));

            // Check if the file is a DICOM file based on its extension
            // @ts-ignore
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const isDicom = fileExtension === 'dcm' || fileExtension === 'dicom';

            if (isDicom) {
              // Push the file to the API endpoint
              const formData = new FormData();
              formData.append('file', file);

              const response = await fetch('/api/dicom-to-png', {
                method: 'POST',
                body: formData,
              });

              const blob = await response.blob();
              console.log(blob);
              const img = new Image();
              const url = URL.createObjectURL(blob);
               img.src = url;
              img.onload = () => {
                URL.revokeObjectURL(url)
                setImageX(img.width.toString());
                setImageY(img.height.toString());
                setData({
                  width: img.width,
                  height: img.height,
                  file,
                  img,
                })
              }
            } else {
              // Handle image preview for non-DICOM files
              const img = new Image();
              img.src = URL.createObjectURL(file);
              img.onload = () => {
                setImageX(img.width.toString());
                setImageY(img.height.toString());
                setData({
                  width: img.width,
                  height: img.height,
                  file,
                  img,
                });
              };
            }
          }
        };

        input.click();
      };*/



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

    const Undo = () => {
        points.pop();
        setMasks([]);
        handleClick();
    }

    // Remove images and all segmentations
    const Clear = () => {
        setFilename('');
        setImagePreviewUrl(null);
        setImg(false);
    }

    /*useEffect(() => {
        if (!data) return;
    });*/

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
                                        <button id={'click'} className={'controls'}>Click</button>
                                        <button id={'box'} className={'controls'}>Box</button>
                                        <button id={'everything'} className={'controls'}>Everything</button>
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <button className={'controls'} style={{width: '50%'}}>Undo Last Point</button>
                                            <button className={'controls'} style={{width: '50%'}} onClick={Clear}>Clear All</button>
                                        </div>
                                    </CardBody>
                                    { img_set &&
                                        <CardBody>
                                            <CardTitle as="h2">Save Options</CardTitle>
                                            <button className={'controls'} style={{width: '100%'}} onClick={handleDBDownload}>Save Segmentation to DB</button>
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
                    {/* Image Upload Window */}
                    <Col className={'img-container'} style={{width: '75%', height: '90%', overflowY: 'auto'}}>
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
                            {img_set && <img src={imagePreviewUrl} alt={filename} style={{aspectRatio: 1, width: 'undefined', height: 'undefined'}}/>}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
export default UI;
