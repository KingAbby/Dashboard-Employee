import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { AlertIcon, CameraIcon, CloseIcon, RefreshIcon } from './icons';
import { cn } from '../../lib/cn';
import { MAX_INPUT_MB, MAX_PHOTO_MB, compressImage } from '../../lib/compress-image';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface PhotoCaptureProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
  disabled?: boolean;
}

/** Validasi di klien hanya untuk UX; server tetap memeriksa MIME dan ukuran. */
export function PhotoCapture({ file, onChange, error, disabled = false }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  const selectFile = (next: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const objectUrl = next ? URL.createObjectURL(next) : null;
    previewUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    onChange(next);
  };

  const accept = async (candidate: File) => {
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      setLocalError('Format foto harus JPG, PNG, atau WEBP.');
      return;
    }
    if (candidate.size > MAX_INPUT_MB * 1024 * 1024) {
      setLocalError(`Foto terlalu besar. Pilih file maksimal ${MAX_INPUT_MB} MB.`);
      return;
    }

    setProcessing(true);
    setLocalError(null);
    setCameraError(null);
    try {
      const compressed = await compressImage(candidate);
      if (compressed.size > MAX_PHOTO_MB * 1024 * 1024) {
        setLocalError(`Ukuran foto setelah dikompres masih di atas ${MAX_PHOTO_MB} MB.`);
        return;
      }
      selectFile(compressed);
    } finally {
      setProcessing(false);
    }
  };

  const openCamera = async () => {
    setLocalError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError('Kamera tidak bisa diakses. Pilih file foto saja.');
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        void accept(new File([blob], `absen-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        closeCamera();
      },
      'image/jpeg',
      0.9,
    );
  };

  const message = localError ?? error ?? cameraError;
  const locked = disabled || processing;
  const cameraSupported =
    typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        capture="user"
        className="sr-only"
        disabled={locked}
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) void accept(selected);
          event.target.value = '';
        }}
      />

      <div
        className={cn(
          'relative flex min-h-[196px] flex-col items-center justify-center gap-2.5 rounded-card border border-dashed bg-bg/60 p-4 text-center transition-colors',
          message ? 'border-danger/40' : 'border-line-strong',
        )}
      >
        {cameraOpen ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-[196px] w-full rounded-[9px] bg-ink/80 object-cover"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={capture}
                icon={<CameraIcon size={13} />}
                disabled={processing}
              >
                Ambil foto{processing ? '…' : ''}
              </Button>
              <Button size="sm" variant="secondary" onClick={closeCamera} disabled={processing}>
                Batal
              </Button>
            </div>
          </>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Pratinjau foto absen"
              className="h-[196px] w-full rounded-[9px] object-cover"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={locked}
                icon={<RefreshIcon size={13} />}
              >
                Ganti
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => selectFile(null)}
                disabled={locked}
                icon={<CloseIcon size={13} />}
              >
                Hapus
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-tint text-primary">
              <CameraIcon size={18} />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Foto bukti sedang bekerja</p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                {processing
                  ? 'Mengompres foto…'
                  : `JPG, PNG, atau WEBP · otomatis dikompres, maks. ${MAX_PHOTO_MB} MB`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={locked}
                icon={<RefreshIcon size={13} />}
              >
                {processing ? 'Memproses…' : 'Pilih foto'}
              </Button>
              {cameraSupported ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void openCamera()}
                  disabled={locked}
                >
                  Kamera
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>

      {message ? (
        <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-danger">
          <AlertIcon size={13} />
          {message}
        </p>
      ) : null}

      {file && !cameraOpen ? (
        <p className="truncate text-[11px] text-subtle">
          {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      ) : null}
    </div>
  );
}
