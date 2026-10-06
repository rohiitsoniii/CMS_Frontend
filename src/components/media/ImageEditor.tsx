import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RotateCw, FlipHorizontal, FlipVertical, Loader2, Crop } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageEditorProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    imageName: string;
    onSave: (croppedImageBlob: Blob, fileName: string) => Promise<void>;
}

interface AspectRatio {
    label: string;
    value: number | null;
}

const ASPECT_RATIOS: AspectRatio[] = [
    { label: 'Free', value: null },
    { label: 'Square (1:1)', value: 1 },
    { label: 'Landscape (16:9)', value: 16 / 9 },
    { label: 'Portrait (9:16)', value: 9 / 16 },
    { label: 'Photo (4:3)', value: 4 / 3 },
    { label: 'Photo Portrait (3:4)', value: 3 / 4 },
    { label: 'Widescreen (21:9)', value: 21 / 9 },
];

export function ImageEditor({ open, onClose, imageUrl, imageName, onSave }: ImageEditorProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });
    const [aspect, setAspect] = useState<number | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [saving, setSaving] = useState(false);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleFlipHorizontal = () => {
        setFlip((prev) => ({ ...prev, horizontal: !prev.horizontal }));
    };

    const handleFlipVertical = () => {
        setFlip((prev) => ({ ...prev, vertical: !prev.vertical }));
    };

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0,
        flip = { horizontal: false, vertical: false }
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas is empty'));
                }
            }, 'image/jpeg', 0.95);
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) {
            toast.error('Please select an area to crop');
            return;
        }

        setSaving(true);
        try {
            const croppedImageBlob = await getCroppedImg(
                imageUrl,
                croppedAreaPixels,
                rotation,
                flip
            );

            const fileName = imageName.replace(/\.[^/.]+$/, '') + '-cropped.jpg';
            await onSave(croppedImageBlob, fileName);

            toast.success('Image saved successfully');
            handleClose();
        } catch (error) {
            console.error('Error cropping image:', error);
            toast.error('Failed to crop image');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        // Reset all states
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlip({ horizontal: false, vertical: false });
        setAspect(null);
        setCroppedAreaPixels(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crop className="w-5 h-5" />
                        Edit Image
                    </DialogTitle>
                    <DialogDescription>
                        Crop, rotate, and flip your image. The original file will be preserved.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Cropper Area */}
                    <div className="relative h-[400px] bg-gray-900 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspect || undefined}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            style={{
                                containerStyle: {
                                    backgroundColor: '#1f2937',
                                },
                            }}
                            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`}
                        />
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Aspect Ratio */}
                        <div className="space-y-2">
                            <Label>Aspect Ratio</Label>
                            <Select
                                value={aspect?.toString() || 'free'}
                                onValueChange={(value) => {
                                    if (value === 'free') {
                                        setAspect(null);
                                    } else {
                                        setAspect(parseFloat(value));
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASPECT_RATIOS.map((ratio) => (
                                        <SelectItem
                                            key={ratio.label}
                                            value={ratio.value?.toString() || 'free'}
                                        >
                                            {ratio.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Transform Buttons */}
                        <div className="space-y-2">
                            <Label>Transform</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRotate}
                                    className="flex-1"
                                >
                                    <RotateCw className="w-4 h-4 mr-2" />
                                    Rotate
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFlipHorizontal}
                                    className="flex-1"
                                >
                                    <FlipHorizontal className="w-4 h-4 mr-2" />
                                    Flip H
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFlipVertical}
                                    className="flex-1"
                                >
                                    <FlipVertical className="w-4 h-4 mr-2" />
                                    Flip V
                                </Button>
                            </div>
                        </div>

                        {/* Zoom Slider */}
                        <div className="space-y-2 md:col-span-2">
                            <Label>Zoom: {zoom.toFixed(1)}x</Label>
                            <Slider
                                value={[zoom]}
                                onValueChange={(value) => setZoom(value[0])}
                                min={1}
                                max={3}
                                step={0.1}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Crop className="w-4 h-4 mr-2" />
                                Save Cropped Image
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
