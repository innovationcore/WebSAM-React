import React, { useState, useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';

// Replace the "@/utils" alias with the actual path to the utils file in your project
import * as utils from '../utils/mask';

export type Point = { x: number, y: number, label: number };
export type Mask = { bbox: Array<number>, segmentation: string, area: number };
export type Data = { width: number, height: number, file: File, img: HTMLImageElement };

interface Option {
    readonly label: string;
    readonly value: string;
}

const createOption = (label: string) => ({
    label,
    value: label
});

const defaultOptions = [
    createOption('auto'),
    createOption('red'),
    createOption('green'),
    createOption('blue'),
    createOption('yellow'),
    createOption('white')
];

const defaultOption = createOption('auto');

export function InteractiveSegment(
    { data, processing, mode, points, setPoints, masks, ready, setBoxReady }:
        {
            data: Data,
            processing: boolean,
            mode: 'click' | 'box' | 'everything',
            points: Point[],
            masks: Mask[],
            ready: boolean,
            setPoints: (points: Point[]) => void,
            setBoxReady: (ready: boolean) => void,
        }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState<number>(1);
    const [maskAreaThreshold, setMaskAreaThreshold] = useState<number>(0.1);
    const { width, height, img } = data;
    const [segments, setSegments] = useState<number[][][]>([]);
    const [showSegment, setShowSegment] = useState<boolean>(true);
    const [maskColor, setMaskColor] = useState<Option | null>(defaultOption);
    const [transparency, setTransparency] = useState<number>(0.5);
    const [options, setOptions] = useState(defaultOptions);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = (inputValue: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const newOption = createOption(inputValue);
            setIsLoading(false);
            setOptions((prev) => [...prev, newOption]);
        }, 1000);
    };

    useEffect(() => {
        const adapterSize = () => {
            const canvas = canvasRef.current as HTMLCanvasElement;
            if (!canvas) return;
            const parent = canvas.parentElement;
            const scale = Math.min(
                parent?.clientWidth! / img.width, parent?.clientHeight! / img.height
            );
            setScale(scale);
        };
        window.onresize = adapterSize;
        adapterSize();
    }, [img]);

    useEffect(() => {
        setSegments(masks.map(mask => utils.decompress(mask.segmentation, width, height)));
    }, [height, masks, width]);

    useEffect(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.globalAlpha = 1;
        ctx.drawImage(img, 0, 0);

        switch (mode) {
            case 'click':
                break;
            case 'box':
                if (points.length === 2) {
                    const x = Math.min(points[0].x, points[1].x);
                    const y = Math.min(points[0].y, points[1].y);
                    const w = Math.abs(points[0].x - points[1].x);
                    const h = Math.abs(points[0].y - points[1].y);
                    ctx.beginPath();
                    ctx.globalAlpha = 0.9;
                    ctx.rect(x, y, w, h);
                    ctx.strokeStyle = 'rgba(0 ,0 ,0 , 0.9)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();
                }
                break;
            case 'everything':
                break;
        }

        if (!showSegment) {
            return;
        }

        const rgbas = masks.map((_, i) => [...utils.getRGB(i), 0.5]);
        if (masks.length > 0) {
            ctx.beginPath();
            for (let i = 0; i < masks.length; i++) {
                const mask = masks[i];
                if (mask.area / (width * height) > maskAreaThreshold) {
                    continue;
                }
                const rgba = rgbas[i];
                const bbox = mask.bbox;
                ctx.setLineDash([5, 5]);
                ctx.rect((bbox[0]), (bbox[1]), (bbox[2]), (bbox[3]));
                ctx.strokeStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.9;
                ctx.stroke();
            }
            ctx.closePath();
        }

        if (segments.length > 0) {
            ctx.beginPath();
            ctx.setLineDash([0]);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < masks.length; i++) {
                const mask = masks[i];
                if (mask.area / (width * height) > maskAreaThreshold) {
                    continue;
                }
                const segmentation = segments[i];
                // @ts-ignore
                let rgba = [];
                let opacity = 0;

                // @ts-ignore
                switch(maskColor.value) {
                    case options[0].value: //auto
                        rgba = rgbas[i];
                        opacity = transparency;
                        break;
                    case options[1].value: //red
                        rgba[0] = 255;
                        rgba[1] = rgba[2] = 0;
                        opacity = transparency;
                        break;
                    case options[2].value: //green
                        rgba[0] = rgba[2] = 0;
                        rgba[1] = 255;
                        opacity = transparency;
                        break;
                    case options[3].value: //blue
                        rgba[0] = rgba[1] = 0;
                        rgba[2] = 255;
                        opacity = transparency;
                        break;
                    case options[4].value: //yellow
                        rgba[0] = 125;
                        rgba[1] = 125;
                        rgba[2] = 0;
                        opacity = transparency;
                        break;
                    case options[5].value: //white
                        rgba[0] = 255;
                        rgba[1] = 255;
                        rgba[2] = 255;
                        opacity = transparency;
                        break;
                }

                for (let y = 0; y < canvas.height; y++) {
                    if (segmentation[y].length === 0) {
                        continue;
                    }
                    for (let x of segmentation[y]) {
                        const index = (y * canvas.width + x) * 4;
                        // @ts-ignore
                        imageData.data[index] = imageData.data[index] * opacity + rgba[0] * (1 - opacity);
                        // @ts-ignore
                        imageData.data[index + 1] = imageData.data[index + 1] * opacity + rgba[1] * (1 - opacity);
                        // @ts-ignore
                        imageData.data[index + 2] = imageData.data[index + 2] * opacity + rgba[2] * (1 - opacity);
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            ctx.closePath();
        }

        if (points.length > 0) {
            ctx.globalAlpha = 0.9;
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                if (point.label === 1) {
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
                } else {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                }
                ctx.fill();
                ctx.closePath();
            }
        }
    }, [height, img, maskAreaThreshold, masks, mode, points, segments, showSegment, width, maskColor, transparency]);

    return (
        <div
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.altKey) { setShowSegment(false); }
            }}
            onKeyUpCapture={(e) => {
                if (e.code === 'AltRight') {
                    setShowSegment(true);
                    console.log('Right Alt Pressed!');
                }
            }}
        >
            <div className="flax justify-between w-full my-2">
                <p className="inline-block text-lg font-medium text-gray-700">Change Slider To Tweak Segmentation</p>
                <p></p>
                <label className="inline-block text-sm font-medium text-gray-700">
                    Mask Area Threshold:
                    <span className={'pl-2'}></span>
                    <input
                        type="range"
                        min={0}
                        max={0.3}
                        step={0.01}
                        value={maskAreaThreshold}
                        onChange={(e) => {
                            setMaskAreaThreshold(parseFloat(e.target.value));
                        }}
                        className="ml-3 bg-blue-200 p-2"
                    />
                    <span className="text-lg font-medium text-gray-700">{
                        maskAreaThreshold.toFixed(2)
                    }</span>
                </label>
                <label className="inline-block text-sm font-medium text-gray-700">
                    Mask Color:
                    <span className={'pl-2'}></span>
                    <CreatableSelect<Option, false>
                        className="ml-3 bg-blue-200 p-2"
                        isClearable
                        isDisabled={isLoading}
                        isLoading={isLoading}
                        onChange={(newValue) => setMaskColor(newValue)}
                        onCreateOption={handleCreate}
                        options={options}
                        value={maskColor}
                    />
                </label>
                <label className="inline-block text-sm font-medium text-gray-700">
                    Transparency:
                    <span className={'pl-2'}></span>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={transparency}
                        onChange={(e) => {
                            setTransparency(parseFloat(e.target.value));
                        }}
                        className="ml-3 bg-blue-200 p-2"
                    />
                    <span className="text-lg font-medium text-gray-700">{
                        transparency.toFixed(2)
                    }</span>
                </label>
            </div>
            <canvas
                className="w-full" ref={canvasRef} width={width} height={height}
                onContextMenu={(e) => {
                    e.preventDefault()
                    if (processing) return
                    const canvas = canvasRef.current as HTMLCanvasElement
                    const rect = canvas.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / scale
                    const y = (e.clientY - rect.top) / scale
                    switch (mode) {
                        case 'click':
                            setPoints([...points, {x, y, label: 0}])
                            break
                    }
                }}
                onClick={(e) => {
                    e.preventDefault()
                    if (processing) return
                    const canvas = canvasRef.current as HTMLCanvasElement
                    const rect = canvas.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / scale
                    const y = (e.clientY - rect.top) / scale
                    switch (mode) {
                        case 'click':
                            setPoints([...points, {x, y, label: 1}])
                            break
                    }
                }}
                onMouseMove={(e) => {
                    if (mode !== 'box' || processing) return
                    const canvas = canvasRef.current as HTMLCanvasElement
                    const rect = canvas.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / scale
                    const y = (e.clientY - rect.top) / scale
                    if (e.buttons === 0 && !ready) {
                        setPoints([{x, y, label: 1}])
                    } else if (e.buttons === 1 && points.length >= 1) {
                        setBoxReady(false)
                        setPoints([points[0], {x, y, label: 1}])
                    }
                }}
                onMouseUp={(e) => {
                    if (mode !== 'box' || processing) return
                    setBoxReady(true)
                }}
            />
        </div>
    );
}
