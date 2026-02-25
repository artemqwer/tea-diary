import React, { useState } from 'react';
import { useLocale } from './LocaleProvider';
import { X, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { addTeaAction, analyzeTeaImageAction } from './../actions';

export const AddTeaModal = ({ onClose }: { onClose: () => void }) => {
    const { t, locale } = useLocale();
    const [formData, setFormData] = useState({
        name: '',
        type: locale === 'uk' ? 'Пуер' : 'Puer',
        year: String(new Date().getFullYear()),
        origin: '',
        total: '357',
    });

    const [isCustomType, setIsCustomType] = useState(false);
    const [customType, setCustomType] = useState('');
    const [badgeColor, setBadgeColor] = useState('');

    const colorPresets = [
        { hex: '', label: 'Авто' },
        { hex: '#b45309', label: 'Бурштин' },
        { hex: '#15803d', label: 'Зелений' },
        { hex: '#1d4ed8', label: 'Синій' },
        { hex: '#7c3aed', label: 'Фіолет' },
        { hex: '#be123c', label: 'Червоний' },
        { hex: '#0e7490', label: 'Бірюза' },
        { hex: '#a16207', label: 'Золотий' },
    ];

    const [aiLoading, setAiLoading] = useState(false);
    const [aiData, setAiData] = useState<any>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = e => {
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const count = img.width > img.height ? img.width : img.height;
                const MAX_SIZE = 1024;
                let width = img.width;
                let height = img.height;

                if (count > MAX_SIZE) {
                    if (img.width > img.height) {
                        width = MAX_SIZE;
                        height = (img.height * MAX_SIZE) / img.width;
                    } else {
                        height = MAX_SIZE;
                        width = (img.width * MAX_SIZE) / img.height;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('No context');

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    blob => {
                        if (blob) resolve(blob);
                        else reject('Canvas error');
                    },
                    'image/jpeg',
                    0.7
                );
            };

            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAiLoading(true);
        setAiData(null);
        setAiError(null);

        try {
            const compressedBlob = await compressImage(file);
            const formData = new FormData();
            formData.append('image', compressedBlob as Blob);

            const result = await analyzeTeaImageAction(formData);

            if (result && !result.error) {
                setAiData(result);
            } else {
                setAiError(result?.error || 'Не вдалося розпізнати фото');
            }
        } catch (e) {
            console.error(e);
            setAiError('Помилка обробки зображення');
        } finally {
            setAiLoading(false);
            // Reset input to allow selecting same file again
            e.target.value = '';
        }
    };

    const applyAiData = () => {
        if (aiData) {
            setFormData({
                ...formData,
                name: aiData.name || formData.name,
                type: aiData.type || formData.type,
                year: aiData.year || formData.year,
                origin: aiData.origin || formData.origin,
            });
            setAiData(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const finalType = isCustomType ? customType || 'Інший' : formData.type;

        await addTeaAction({
            name: formData.name,
            type: finalType,
            color: badgeColor || undefined,
            year: Number(formData.year) || new Date().getFullYear(),
            origin: formData.origin,
            total: Number(formData.total) || 1,
        });
        onClose();
    };

    const inputClass = 'w-full rounded-xl p-3 focus:outline-hidden transition-colors';
    const inputStyle = {
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-primary)',
        color: 'var(--text-primary)',
    };
    const labelClass = 'text-[10px] uppercase tracking-widest block mb-1.5 ml-1';
    const labelStyle = { color: 'var(--text-muted)' };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-90 flex items-end sm:items-center justify-center p-4">
            <div
                className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif" style={{ color: 'var(--text-primary)' }}>
                        {t.addTea.title}
                    </h2>
                    <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* AI SCAN SECTION */}
                <div className="mb-6">
                    {!aiLoading && !aiData && (
                        <label
                            className="w-full rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors group border border-dashed"
                            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}
                        >
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            <Sparkles
                                className="group-hover:scale-110 transition-transform"
                                size={20}
                                style={{ color: 'var(--accent)' }}
                            />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {t.addTea.ai_analyze}
                            </span>
                        </label>
                    )}

                    {aiLoading && (
                        <div
                            className="w-full rounded-xl p-4 flex items-center justify-center gap-3"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)',
                            }}
                        >
                            <RefreshCw className="animate-spin" size={20} style={{ color: 'var(--accent)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {t.addTea.ai_analyzing} 🍵
                            </span>
                        </div>
                    )}

                    {aiError && (
                        <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 flex items-center gap-3 mb-2 animate-in fade-in">
                            <AlertTriangle className="text-red-500" size={20} />
                            <span className="text-red-400 text-sm">{aiError}</span>
                            <button type="button" onClick={() => setAiError(null)} className="ml-auto text-stone-500">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {aiData && (
                        <div
                            className="rounded-xl p-4 animate-in fade-in zoom-in-95"
                            style={{
                                background: 'var(--accent-subtle)',
                                border: '1px solid var(--accent-border)',
                            }}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                                    <Sparkles size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        {locale === 'uk' ? 'AI знайшов це' : 'AI found this'}
                                    </span>
                                </div>
                                <button type="button" onClick={() => setAiData(null)} style={{ color: 'var(--text-muted)' }}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-1 mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                                <p>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {locale === 'uk' ? 'Назва' : 'Name'}:
                                    </span>{' '}
                                    {aiData.name}
                                </p>
                                <p>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {locale === 'uk' ? 'Тип' : 'Type'}:
                                    </span>{' '}
                                    {aiData.type}
                                </p>
                                <p>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {locale === 'uk' ? 'Рік' : 'Year'}:
                                    </span>{' '}
                                    {aiData.year}
                                </p>
                                <p>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {locale === 'uk' ? 'Регіон' : 'Region'}:
                                    </span>{' '}
                                    {aiData.origin}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={applyAiData}
                                    className="flex-1 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                    style={{ background: 'var(--accent)' }}
                                >
                                    {locale === 'uk' ? 'Заповнити форму' : 'Fill form'}
                                </button>
                            </div>
                            <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                                {locale === 'uk'
                                    ? 'ШІ може помилятись. Перевірте дані.'
                                    : 'AI may be inaccurate. Please verify the data.'}
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass} style={labelStyle}>
                            {t.addTea.name_label}
                        </label>
                        <input
                            required
                            autoFocus
                            className={inputClass}
                            style={inputStyle}
                            placeholder={t.addTea.name_placeholder}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>
                                {t.addTea.type_label}
                            </label>
                            <select
                                className={`${inputClass} appearance-none`}
                                style={inputStyle}
                                value={isCustomType ? '__custom__' : formData.type}
                                onChange={e => {
                                    if (e.target.value === '__custom__') {
                                        setIsCustomType(true);
                                        setCustomType('');
                                    } else {
                                        setIsCustomType(false);
                                        setFormData({ ...formData, type: e.target.value });
                                    }
                                }}
                            >
                                <option value="Пуер">{t.addTea.tea_types.puer}</option>
                                <option value="Шу Пуер">{t.addTea.tea_types.shu}</option>
                                <option value="Шен Пуер">{t.addTea.tea_types.sheng}</option>
                                <option value="Улун">{t.addTea.tea_types.oolong}</option>
                                <option value="Червоний">{t.addTea.tea_types.red}</option>
                                <option value="Зелений">{t.addTea.tea_types.green}</option>
                                <option value="Білий">{t.addTea.tea_types.white}</option>
                                <option value="Жовтий">{t.addTea.tea_types.yellow}</option>
                                <option value="Чорний">{t.addTea.tea_types.black}</option>
                                <option value="GABA">{t.addTea.tea_types.gaba}</option>
                                <option value="Хей Ча">{t.addTea.tea_types.dark}</option>
                                <option value="__custom__">{t.addTea.tea_types.other}</option>
                            </select>
                            {isCustomType && (
                                <input
                                    className={`${inputClass} mt-2`}
                                    style={inputStyle}
                                    placeholder={t.addTea.custom_type_placeholder}
                                    autoFocus
                                    value={customType}
                                    onChange={e => setCustomType(e.target.value)}
                                />
                            )}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>
                                {t.addTea.year_label}
                            </label>
                            <input
                                inputMode="numeric"
                                className={inputClass}
                                style={inputStyle}
                                value={formData.year}
                                onChange={e =>
                                    setFormData({ ...formData, year: e.target.value.replace(/[^0-9]/g, '') })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>
                                {t.addTea.region_label}
                            </label>
                            <input
                                className={inputClass}
                                style={inputStyle}
                                placeholder={t.addTea.region_placeholder}
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>
                                {t.addTea.weight_label}
                            </label>
                            <input
                                inputMode="numeric"
                                className={inputClass}
                                style={inputStyle}
                                placeholder="357"
                                value={formData.total}
                                onChange={e =>
                                    setFormData({ ...formData, total: e.target.value.replace(/[^0-9]/g, '') })
                                }
                            />
                        </div>
                    </div>

                    {/* Color badge */}
                    <div>
                        <label className={labelClass} style={labelStyle}>
                            {t.addTea.color_label}
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {colorPresets.map(c => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    onClick={() => setBadgeColor(c.hex)}
                                    className="h-8 px-3 rounded-full text-xs font-medium transition-all border-2"
                                    style={{
                                        background: c.hex ? c.hex + '22' : 'var(--bg-tertiary)',
                                        color: c.hex || 'var(--text-secondary)',
                                        borderColor: badgeColor === c.hex ? c.hex || 'var(--accent)' : 'transparent',
                                        outline:
                                            badgeColor === c.hex ? `2px solid ${c.hex || 'var(--accent)'}` : 'none',
                                        outlineOffset: '1px',
                                    }}
                                >
                                    {c.hex && (
                                        <span
                                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                                            style={{ background: c.hex }}
                                        />
                                    )}
                                    {c.label}
                                </button>
                            ))}
                            {/* Custom color */}
                            <label
                                className="h-8 w-8 rounded-full overflow-hidden shrink-0 cursor-pointer relative border-2 transition-all"
                                style={{
                                    borderColor:
                                        badgeColor && !colorPresets.some(c => c.hex === badgeColor)
                                            ? badgeColor
                                            : 'var(--border-primary)',
                                    background: badgeColor || 'var(--bg-tertiary)',
                                }}
                            >
                                <input
                                    type="color"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value={badgeColor || '#b45309'}
                                    onChange={e => setBadgeColor(e.target.value)}
                                />
                            </label>
                        </div>
                        {/* Preview */}
                        {badgeColor && (
                            <div
                                className="mt-2 flex items-center gap-2 text-xs"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <span>{t.addTea.color_preview}</span>
                                <span
                                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        background: badgeColor + '22',
                                        color: badgeColor,
                                        border: `1px solid ${badgeColor}55`,
                                    }}
                                >
                                    {isCustomType ? customType || (locale === 'uk' ? 'Тип' : 'Type') : formData.type}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full text-white font-medium py-4 rounded-xl mt-4 shadow-lg active:scale-95 transition-all"
                        style={{ background: 'var(--accent)' }}
                    >
                        {t.addTea.submit}
                    </button>
                </form>
            </div>
        </div>
    );
};
