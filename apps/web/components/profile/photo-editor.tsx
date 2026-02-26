"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Loader2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (blob: Blob) => Promise<void>;
  onCancel: () => void;
}

const filters = [
  { name: "Natural", css: "none" },
  { name: "Vibrant", css: "saturate(1.3) contrast(1.1)" },
  { name: "B&W", css: "grayscale(1)" },
  { name: "Warm", css: "sepia(0.3) saturate(1.2)" },
];

export function PhotoEditor({ imageUrl, onSave, onCancel }: PhotoEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (): Promise<Blob> => {
    const image = await createImage(imageUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const maxSize = 1024;
    canvas.width = maxSize;
    canvas.height = maxSize;

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filters[selectedFilter].css}`;

    // Draw rotated and cropped image
    ctx.save();
    ctx.translate(maxSize / 2, maxSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-maxSize / 2, -maxSize / 2);

    if (croppedAreaPixels) {
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        maxSize,
        maxSize
      );
    }

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/jpeg", 0.95);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const croppedBlob = await getCroppedImg();
      await onSave(croppedBlob);
    } catch (error) {
      console.error("Error saving photo:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-text px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Edit Photo</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filters[selectedFilter].css}`,
              },
            }}
          />
        </div>

        {/* Controls Sidebar */}
        <div className="w-80 bg-white p-6 overflow-y-auto">
          {/* Filters */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-neutral-text mb-3">Filters</h4>
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter, index) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(index)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedFilter === index
                      ? "bg-brand-orange text-white"
                      : "bg-neutral-bg-secondary text-neutral-text hover:bg-neutral-border"
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-neutral-text">Zoom</h4>
              <span className="text-xs text-neutral-text-secondary">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomOut className="w-4 h-4 text-neutral-text-secondary" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-neutral-text-secondary" />
            </div>
          </div>

          {/* Rotation */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-neutral-text">Rotate</h4>
              <span className="text-xs text-neutral-text-secondary">{rotation}°</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-neutral-text-secondary" />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Adjustments */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-text">Adjust</h4>
            
            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-text-secondary">Brightness</span>
                <span className="text-xs text-neutral-text-secondary">{brightness}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-text-secondary">Contrast</span>
                <span className="text-xs text-neutral-text-secondary">{contrast}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-text-secondary">Saturation</span>
                <span className="text-xs text-neutral-text-secondary">{saturation}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
