import io
import os
from os.path import getmtime
from typing import List
import click
import json
import numpy as np
import requests
import uvicorn
import SimpleITK as sitk
from fastapi import FastAPI, File, Form, Request, UploadFile
from pydantic import BaseModel
from PIL import Image
import base64
from datetime import date, datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import json


@click.command()

@click.option('--port', default=8090, help='port')
@click.option('--host', default='0.0.0.0', help='host')

def main(
    port=8090,
    host="0.0.0.0",
):
    def db_connection():
        with open('config.json', 'r') as f:
            config = json.load(f)
            print(config)
            engine = create_engine(f'postgresql+psycopg2://{config['pgsql']['user']}:{config['pgsql']['password']}@{config['pgsql']['host']}:{config['pgsql']['port']}/{config['pgsql']['db']}')
        return engine

    # For use in /api/save_json
    class Item(BaseModel):
        points_filename: str
        points: dict

    app = FastAPI()

    origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get('/')
    def index():
        return {"code": 0, "data": "Hello World"}


    @app.get('/api/get_table')
    async def get_table():
        engine = db_connection()
        with engine.connect() as conn:
            result = conn.execute(text("""select * from websam"""))
            rows = result.fetchall()
            column_names = result.keys()
            result_list = [dict(zip(column_names, row)) for row in rows] # Convert each row into a dictionary
        return {"code": 0, "data": result_list}

    # Collect a JSON file which contains the points to recreate the overlay
    @app.post('/api/save_json')
    async def api_save_json(
            item: Item,
    ):
        # If the datasets folder doesn't exist, make it
        if not os.path.exists('datasets'):
            os.makedirs('datasets')

        # Serialize and then write the JSON object to a file
        with open("datasets/" + item.points_filename, "w+") as f:
            f.write(json.dumps(item.points))

        return {"code": 0, "data": f"{item.points_filename} saved successfully."}


    # Collect an image POSTed from the SAM server and save it here
    @app.post('/api/save_overlay')
    async def api_save_overlay(
            file: UploadFile = File(...)
    ):

        # If the datasets folder doesn't exist, make it
        if not os.path.exists('datasets'):
            os.makedirs('datasets')
        file_location = 'datasets/' + file.filename

        with open(file_location, "wb+") as f:
            f.write(file.file.read())

        return {"code": 0, "data": f'{file.filename} successfully saved to {file_location}'}

    # Collect an image POSTed from the SAM server and save it here, then push data over to the template site
    @app.post('/api/save_image')
    async def api_save_image(
            file: UploadFile = File(...)
    ):

        # If the datasets folder doesn't exist, make it
        if not os.path.exists('datasets'):
            os.makedirs('datasets')

        file_location = 'datasets/' + file.filename

        with open(file_location, "wb+") as f:
            f.write(file.file.read())

        return {"code": 0, "data": f'{file.filename} successfully saved to {file_location}'}

    # Get file requested by SAM and send it to be rendered on the segmentation site
    @app.get('/api/get/{UUID}')
    async def api_get_by_uuid(
            UUID
    ):
        ds_files = os.listdir('datasets/')

        if UUID in ds_files:
            with open('datasets/' + UUID, 'rb') as f:
                extension = os.path.splitext(UUID)[1]
                file = f.read()

            return {"code": 0, 'msg': f'successfully retrieved {UUID}', 'type': f'image/{extension}', 'file': base64.b64encode(file)}
        else:
            return {"code": 1, 'msg': f'file {UUID} does not exist'}

    # Check database and update processed window by removing files that no longer exist
    @app.get('/api/check-files')
    async def api_check_files():
        ret = []

        for each in os.listdir('datasets/'): # return all files in the directory, compare on the processed page and remove non-existent files
            if not each.endswith('json'): # don't add the points JSON overlay names
                #if each.find('overlay.jpg') == -1: # don't add the overlay filenames

                    # Create an image thumbnail
                    image = Image.open(f'datasets/{each}')
                    image.thumbnail((150, 150))
                    buf = io.BytesIO()
                    image.save(buf, format='JPEG')
                    data = buf.getvalue()
                    thumbnail = base64.b64encode(data)

                    ret.append({
                        'uuid': each,
                        'date_added': datetime.fromtimestamp(getmtime(f'datasets/{each}')).strftime('%Y-%m-%d %H:%M:%S'), # i think this should get the time from a timestamp on the file instead of the current time
                        'image_type': os.path.splitext(each)[1],
                        'thumbnail': thumbnail,
                        'link': f'http://localhost:3000/sam?uuid={each}'
                    })

        payload = {
            'draw':1,
            'recordsTotal': len(ret),
            'recordsFilered': len(ret),
            'data': ret
        }

        return payload


    @app.get('/api/png-from-dicom')
    async def api_png_from_dicom():
        if 'file' not in request.files:
            return "No file", 400

        file = request.files['file']

        if file.filename == '':
            return "No selected file", 400

        original_filename = file.filename
        base_filename = os.path.splitext(original_filename)[0]

        # Read the DICOM file using SimpleITK
        dicom_image = sitk.ReadImage(file.stream)

        # Convert DICOM to numpy array
        image_array = sitk.GetArrayFromImage(dicom_image)[0]

        # Normalize the image array to the range [0, 255]
        image_array = (255 * (image_array - np.min(image_array)) / (np.max(image_array) - np.min(image_array))).astype(
            np.uint8)

        # Create a PIL image
        image = Image.fromarray(image_array)

        # Save the image to a BytesIO object
        image_io = BytesIO()
        image.save(image_io, format='PNG')
        image_io.seek(0)

        # Create the response with the original filename
        response = send_file(image_io, mimetype='image/png', as_attachment=True, download_name=f'{base_filename}.png')
        response.headers['X-Original-Filename'] = original_filename

        return response

    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    main()