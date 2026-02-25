import React, { useState, useRef } from 'react';
import { useLocale } from './LocaleProvider';
import { X, RefreshCw, Camera, Upload } from 'lucide-react';

export const AvatarSelectionModal = ({ isOpen, onClose, onSelect }: any) => {
  const { locale } = useLocale();
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const [style, setStyle] = useState('notionists');
  const [tab, setTab] = useState<'generate' | 'upload'>('generate');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { id: 'notionists', name: 'Sketch' },
    { id: 'adventurer', name: 'Adventurer' },
    { id: 'fun-emoji', name: 'Emoji' },
    { id: 'bottts', name: 'Robot' },
  ];

  const avatarUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;

  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 256;
        canvas.width = SIZE;
        canvas.height = SIZE;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');

        // Crop to square from center
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;

        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await compressAvatar(file);
      setUploadPreview(dataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (tab === 'upload' && uploadPreview) {
      onSelect(uploadPreview);
    } else {
      onSelect(avatarUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <h3
          className="text-xl font-serif mb-4 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          {locale === 'uk' ? 'Виберіть образ' : 'Choose avatar'}
        </h3>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-tertiary)' }}>
          <button
            onClick={() => setTab('generate')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={
              tab === 'generate'
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-secondary)' }
            }
          >
            🎲 {locale === 'uk' ? 'Генерувати' : 'Generate'}
          </button>
          <button
            onClick={() => setTab('upload')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={
              tab === 'upload'
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-secondary)' }
            }
          >
            📷 {locale === 'uk' ? 'Своє фото' : 'Upload photo'}
          </button>
        </div>

        {tab === 'generate' && (
          <>
            <div className="flex justify-center mb-8">
              <div
                className="w-32 h-32 rounded-full border-4 overflow-hidden relative group"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-border)' }}
              >
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSeed(Math.random().toString(36).substring(7))}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RefreshCw className="text-white" size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {styles.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className="py-2 px-1 rounded-lg text-xs font-medium transition-colors"
                  style={
                    style === s.id
                      ? { background: 'var(--accent)', color: 'white' }
                      : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
                  }
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSeed(Math.random().toString(36).substring(7))}
                className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <RefreshCw size={16} />
                {locale === 'uk' ? 'Випадковий' : 'Random'}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl text-white font-medium transition-colors"
                style={{ background: 'var(--accent)' }}
              >
                {locale === 'uk' ? 'Зберегти' : 'Save'}
              </button>
            </div>
          </>
        )}

        {tab === 'upload' && (
          <>
            <div className="flex justify-center mb-6">
              <div
                className="w-32 h-32 rounded-full border-4 overflow-hidden relative group cursor-pointer"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-border)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadPreview ? (
                  <img
                    src={uploadPreview}
                    alt="Custom Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {uploading ? (
                      <RefreshCw className="animate-spin" size={24} />
                    ) : (
                      <>
                        <Camera size={28} className="mb-1" />
                        <span className="text-[10px]">Натисніть</span>
                      </>
                    )}
                  </div>
                )}
                {uploadPreview && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              {locale === 'uk'
                ? 'Фото буде обрізане до квадрата і стиснуте автоматично'
                : 'Photo will be cropped to square and compressed automatically'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <Upload size={16} />
                {uploadPreview
                  ? locale === 'uk'
                    ? 'Змінити'
                    : 'Change'
                  : locale === 'uk'
                    ? 'Обрати'
                    : 'Choose'}
              </button>
              <button
                onClick={handleSave}
                disabled={!uploadPreview}
                className="flex-1 py-3 rounded-xl font-medium transition-colors"
                style={
                  uploadPreview
                    ? { background: 'var(--accent)', color: 'white' }
                    : {
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)',
                        cursor: 'not-allowed',
                      }
                }
              >
                {locale === 'uk' ? 'Зберегти' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
