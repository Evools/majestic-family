'use client';

import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/utils/image-compression';

import { Clipboard, ExternalLink, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadToServer = async (file: File | Blob) => {
    setIsUploading(true);
    setError(null);

    let fileToUpload = file;
    // Compress if it's a File object (Blobs from clipboard might need conversion first, usually they are Files)
    if (file instanceof File) {
        try {
            fileToUpload = await compressImage(file, { maxWidth: 1920, quality: 0.8 });
        } catch (e) {
            console.warn('Compression failed, uploading original', e);
        }
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.error) {
          throw new Error(data.error);
      }

      // Cloudinary returns 'secure_url'
      const newUrl = data.secure_url || data.url;
      onChange([...value, newUrl]);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadToServer(file);
    }
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  }, [value]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled || isUploading) return;
    
    // Check if user is focusing an input (to allow normal paste)
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
    }
    
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                uploadToServer(blob);
                e.preventDefault(); 
            }
            break;
        }
    }
  }, [disabled, isUploading, value]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handlePasteClick = async () => {
      try {
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
              const imageType = item.types.find(type => type.startsWith('image/'));
              if (imageType) {
                  const blob = await item.getType(imageType);
                  uploadToServer(blob);
                  return;
              }
          }
          setError('В буфере обмена нет изображения');
      } catch (err) {
          console.error('Clipboard read failed:', err);
          setError('Не удалось прочитать буфер обмена');
      }
  };

  return (
    <div className="w-full space-y-4">
        {/* Upload Area */}
        <div className="w-full">
            <label 
                className={`
                    flex flex-col items-center justify-center w-full h-32 
                    border-2 border-dashed border-white/10 rounded-xl 
                    bg-[#050505] hover:bg-white/5 hover:border-white/20 
                    transition-all cursor-pointer relative overflow-hidden
                    ${error ? 'border-red-500/50 hover:border-red-500/50' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 mb-3 text-blue-500 animate-spin" />
                            <p className="text-xs text-gray-500">Загрузка изображения...</p>
                        </>
                    ) : (
                        <>
                            <ImagePlus className="w-8 h-8 mb-3 text-gray-400 group-hover:text-white transition-colors" />
                            <p className="mb-1 text-sm text-gray-400">
                                <span className="font-semibold text-white">Нажмите</span> или <span className="font-semibold text-white">CTRL+V</span>
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                Добавить изображение
                            </p>
                        </>
                    )}
                </div>
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={disabled || isUploading}
                />
            </label>
            
             {/* Mobile/Manual Paste Button */}
            <div className="flex justify-center mt-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={handlePasteClick}
                    disabled={disabled || isUploading}
                >
                    <Clipboard className="w-3 h-3 mr-2" />
                    Вставить из буфера
                </Button>
            </div>
            
            {error && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1 justify-center">
                    <X className="w-3 h-3" /> {error}
                </p>
            )}
        </div>

        {/* Image Grid */}
        {value.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
                {value.map((url, index) => (
                    <div key={url} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={`Proof ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                             >
                                <ExternalLink className="w-4 h-4" />
                             </a>
                            <button
                                onClick={() => handleRemove(url)}
                                className="p-2 bg-red-500/80 rounded-full hover:bg-red-600 text-white backdrop-blur-sm transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
