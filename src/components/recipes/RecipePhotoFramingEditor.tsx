import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Camera,
  Image as ImageIcon,
  Trash2,
  Info,
} from 'lucide-react';

interface RecipePhotoFramingEditorProps {
  imageSrc: string;
  initialScale?: number;
  initialPosition?: { x: number; y: number };
  autoFitNonMatching?: boolean;
  onChange?: (params: {
    scale: number;
    position: { x: number; y: number };
    getFramedDataUrl: () => Promise<string>;
  }) => void;
  onTakePhoto: () => void;
  onFromGallery: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const RecipePhotoFramingEditor: React.FC<RecipePhotoFramingEditorProps> = ({
  imageSrc,
  initialScale = 1.0,
  initialPosition = { x: 0, y: 0 },
  autoFitNonMatching = false,
  onChange,
  onTakePhoto,
  onFromGallery,
  onRemove,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [scale, setScale] = useState<number>(initialScale);
  const [position, setPosition] = useState<{ x: number; y: number }>(initialPosition);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; posX: number; posY: number }>({
    clientX: 0,
    clientY: 0,
    posX: 0,
    posY: 0,
  });

  // Calculate base proportions for 16:9 frame
  const containerAspect = 16 / 9;
  const imgAspect = naturalDimensions ? naturalDimensions.width / naturalDimensions.height : 16 / 9;

  let baseWidthPercent = 100;
  let baseHeightPercent = 100;

  if (imgAspect > containerAspect) {
    baseWidthPercent = (imgAspect / containerAspect) * 100;
    baseHeightPercent = 100;
  } else {
    baseWidthPercent = 100;
    baseHeightPercent = (containerAspect / imgAspect) * 100;
  }

  // Scale required to fit the entire image inside 16:9 with margins (object-contain)
  const fitScale = naturalDimensions
    ? imgAspect > containerAspect
      ? containerAspect / imgAspect
      : imgAspect / containerAspect
    : 1.0;
  const minScale = Math.min(1.0, Math.max(0.25, Number(fitScale.toFixed(3))));

  // Clamp position within bounds
  const clampPosition = useCallback(
    (pos: { x: number; y: number }, currentScale: number) => {
      const curTotalW = baseWidthPercent * currentScale;
      const curTotalH = baseHeightPercent * currentScale;
      const curMaxX = Math.max(0, (curTotalW - 100) / 2);
      const curMaxY = Math.max(0, (curTotalH - 100) / 2);

      return {
        x: Math.max(-curMaxX, Math.min(curMaxX, pos.x)),
        y: Math.max(-curMaxY, Math.min(curMaxY, pos.y)),
      };
    },
    [baseWidthPercent, baseHeightPercent]
  );

  // Handle image load to get natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
      if (autoFitNonMatching) {
        const loadedAspect = naturalWidth / naturalHeight;
        if (Math.abs(loadedAspect - containerAspect) > 0.12) {
          const loadedFitScale =
            loadedAspect > containerAspect
              ? containerAspect / loadedAspect
              : loadedAspect / containerAspect;
          setScale(Math.max(0.25, Number(loadedFitScale.toFixed(3))));
          setPosition({ x: 0, y: 0 });
        }
      }
    }
  };

  // Generate framed 16:9 crop onto canvas
  const getFramedDataUrl = useCallback(async (): Promise<string> => {
    if (!imageSrc) return '';

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const targetWidth = 1200;
          const targetHeight = 675; // 16:9 standard

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(imageSrc);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const naturalW = img.naturalWidth || targetWidth;
          const naturalH = img.naturalHeight || targetHeight;
          const naturalR = naturalW / naturalH;
          const targetR = targetWidth / targetHeight;

          let baseW = targetWidth;
          let baseH = targetHeight;

          if (naturalR > targetR) {
            baseW = (naturalR / targetR) * targetWidth;
            baseH = targetHeight;
          } else {
            baseW = targetWidth;
            baseH = (targetR / naturalR) * targetHeight;
          }

          const drawW = baseW * scale;
          const drawH = baseH * scale;

          // Compute destination top-left position based on percentage offset
          const destX = targetWidth / 2 + (position.x / 100) * targetWidth - drawW / 2;
          const destY = targetHeight / 2 + (position.y / 100) * targetHeight - drawH / 2;

          // Fill background with cozy warm cream so any margins match the app
          ctx.fillStyle = '#FFFDF7';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          ctx.drawImage(img, destX, destY, drawW, drawH);

          const dataUrl = canvas.toDataURL('image/webp', 0.88);
          resolve(dataUrl);
        } catch (err) {
          console.warn('Canvas export tainted or failed, falling back to source image:', err);
          resolve(imageSrc);
        }
      };

      img.onerror = () => {
        resolve(imageSrc);
      };

      img.src = imageSrc;
    });
  }, [imageSrc, scale, position]);

  // Notify parent of framing updates
  useEffect(() => {
    if (onChange) {
      onChange({
        scale,
        position,
        getFramedDataUrl,
      });
    }
  }, [scale, position, getFramedDataUrl, onChange]);

  // Pointer drag events for panning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      posX: position.x,
      posY: position.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = e.clientX - dragStart.clientX;
    const deltaY = e.clientY - dragStart.clientY;

    const deltaXPct = (deltaX / rect.width) * 100;
    const deltaYPct = (deltaY / rect.height) * 100;

    const nextPos = clampPosition(
      {
        x: dragStart.posX + deltaXPct,
        y: dragStart.posY + deltaYPct,
      },
      scale
    );

    setPosition(nextPos);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsDragging(false);
    }
  };

  // Zoom slider change
  const handleScaleChange = (newScale: number) => {
    const clampedScale = Math.max(minScale, Math.min(3.0, newScale));
    setScale(clampedScale);
    setPosition((pos) => clampPosition(pos, clampedScale));
  };

  // Wheel zoom over frame
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    const zoomStep = 0.08;
    const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
    handleScaleChange(scale + delta);
  };

  // Reset to default 100% center (or fitScale if autoFitNonMatching)
  const handleReset = () => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitWithMargins = () => {
    setScale(minScale);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-3">
      {/* 16:9 Interactive Photo Frame */}
      <div className="relative w-full aspect-video rounded-[24px] overflow-hidden border-2 border-[#F3E5D8] bg-[#FFFDF7] shadow-cozy group select-none">
        {/* Interactive Image Container */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className={`relative w-full h-full overflow-hidden touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title="Click and drag to position photo. Scroll to zoom."
          aria-label="Interactive recipe photo frame"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Recipe framing preview"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              width: `${baseWidthPercent}%`,
              height: `${baseHeightPercent}%`,
              maxWidth: 'none',
              maxHeight: 'none',
              transform: `translate(-50%, -50%) translate(${position.x}%, ${position.y}%) scale(${scale})`,
            }}
            className="absolute left-1/2 top-1/2 object-cover pointer-events-none transition-transform duration-75 ease-out"
          />

          {/* Framing Guides Overlay (Subtle rule of thirds on drag/hover) */}
          <div
            className={`absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 transition-opacity duration-200 ${
              isDragging ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'
            }`}
          >
            <div className="border-r border-b border-white/60" />
            <div className="border-r border-b border-white/60" />
            <div className="border-b border-white/60" />
            <div className="border-r border-b border-white/60" />
            <div className="border-r border-b border-white/60" />
            <div className="border-b border-white/60" />
            <div className="border-r border-white/60" />
            <div className="border-r border-white/60" />
            <div />
          </div>

          {/* Quick Helper Pill (Visible when hovering) */}
          <div className="absolute top-3 left-3 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium rounded-full flex items-center space-x-1 shadow-sm">
              <Move className="w-3 h-3 text-[#FFE599]" />
              <span>Drag to move</span>
            </span>
          </div>

          {/* Action buttons (Take photo / gallery / remove) */}
          <div className="absolute top-3 right-3 flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onTakePhoto}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-[#E85D75] shadow-sm backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
              title="Retake photo with camera"
              aria-label="Retake photo with camera"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={onFromGallery}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-[#3D231D] shadow-sm backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
              title="Replace from photo gallery"
              aria-label="Replace from photo gallery"
            >
              <ImageIcon className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-sm backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
              title="Remove recipe photo"
              aria-label="Remove recipe photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Zoom Controls & Framing Adjustment Bar */}
      <div className="bg-[#FFFDF7] border border-[#F5E6BF] rounded-2xl p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Zoom In / Zoom Out Controls */}
          <div className="flex items-center space-x-2 flex-1 min-w-[220px]">
            <button
              type="button"
              onClick={() => handleScaleChange(scale - 0.1)}
              disabled={scale <= minScale || disabled}
              className="p-1.5 rounded-lg bg-white border border-[#F5E6BF] hover:bg-[#FFF3CC] disabled:opacity-40 disabled:cursor-not-allowed text-[#3D231D] transition-colors cursor-pointer"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Zoom Slider */}
            <input
              type="range"
              min={minScale}
              max="3.0"
              step="0.01"
              value={scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="flex-1 accent-[#16A34A] h-1.5 bg-[#F5E6BF] rounded-lg cursor-pointer disabled:opacity-40"
              aria-label="Photo zoom level"
            />

            <button
              type="button"
              onClick={() => handleScaleChange(scale + 0.1)}
              disabled={scale >= 3.0 || disabled}
              className="p-1.5 rounded-lg bg-white border border-[#F5E6BF] hover:bg-[#FFF3CC] disabled:opacity-40 disabled:cursor-not-allowed text-[#3D231D] transition-colors cursor-pointer"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Percentage */}
            <span className="text-xs font-bold text-[#3D231D] w-12 text-center select-none">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Fit / Fill / Reset Framing Buttons */}
          <div className="flex items-center space-x-1.5">
            {minScale < 0.96 && Math.abs(scale - minScale) > 0.02 && (
              <button
                type="button"
                onClick={handleFitWithMargins}
                disabled={disabled}
                className="px-2.5 py-1.5 bg-white hover:bg-[#FFF3CC] text-[#3D231D] text-xs font-semibold rounded-full border border-[#F5E6BF] transition-colors cursor-pointer active:scale-95"
                title="Show full photo with margins"
              >
                Fit (Margins)
              </button>
            )}

            {(scale < 0.98 || scale > 1.0 || position.x !== 0 || position.y !== 0) && (
              <button
                type="button"
                onClick={handleReset}
                disabled={disabled}
                className="px-3 py-1.5 bg-[#FFF3CC] hover:bg-[#FFE599] text-[#3D231D] text-xs font-semibold rounded-full border border-[#F5E6BF] flex items-center space-x-1.5 transition-colors cursor-pointer active:scale-95"
                title={scale < 0.98 ? 'Fill 16:9 frame' : 'Reset photo framing and zoom to default center'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
                <span>{scale < 0.98 ? 'Fill 16:9' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Preferred Dimensions and Aspect Ratio Guidance Notice */}
        <div className="pt-2 border-t border-[#F5E6BF]/60 flex items-start space-x-2 text-[#8C726B]">
          <Info className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#3D231D]">
              📐 Preferred Frame Ratio: 16:9 Widescreen (1200 × 675 px)
            </span>{' '}
            <span>
              • Also supports 4:3 (1200 × 900 px). Min. 800 × 450 px. Drag the photo to center it inside the frame.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
