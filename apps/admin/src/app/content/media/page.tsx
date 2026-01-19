/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

interface MediaAsset {
  id: string;
  publicUrl: string;
  mediaType: string;
  mimeType: string;
  sizeBytes: string;
  title?: string;
  altText?: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner'));

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploading, setUploading] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedPreview = useMemo(() => {
    if (!selected) return null;
    const isImage = selected.mediaType === 'image' || selected.mimeType.startsWith('image/');
    return { ...selected, isImage };
  }, [selected]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/media', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Не удалось загрузить медиа');
      }
      const data: MediaAsset[] = await res.json();
      setAssets(data);
      setSelected((prev) => {
        if (!prev) {
          return data[0] ?? null;
        }
        const refreshed = data.find((item) => item.id === prev.id);
        return refreshed ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    if (selected) {
      setEditTitle(selected.title ?? '');
      setEditAltText(selected.altText ?? '');
    }
  }, [selected]);

  const handleUpload = async () => {
    if (!uploadFile || !canEdit) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (uploadTitle.trim()) formData.append('title', uploadTitle.trim());
      if (uploadAltText.trim()) formData.append('altText', uploadAltText.trim());

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Не удалось загрузить файл');
      }
      setUploadFile(null);
      setUploadTitle('');
      setUploadAltText('');
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage('Ссылка скопирована');
      setTimeout(() => setCopyMessage(null), 1500);
    } catch {
      setCopyMessage('Не удалось скопировать ссылку');
      setTimeout(() => setCopyMessage(null), 1500);
    }
  };

  const handleSaveMeta = async () => {
    if (!selected || !canEdit) return;
    setSavingMeta(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle.trim() || null,
          altText: editAltText.trim() || null,
        }),
      });
      if (!res.ok) {
        throw new Error('Не удалось обновить метаданные');
      }
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !canEdit) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${selected.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Не удалось удалить файл');
      }
      setSelected(null);
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="admin-page">
        <div className="admin-page-header">
          <h1>Медиа библиотека</h1>
          <p>Загрузка, просмотр и управление медиа-ресурсами.</p>
        </div>

        {error && <p className="error-text">{error}</p>}
        {copyMessage && <p className="admin-muted">{copyMessage}</p>}

        {canEdit && (
          <div className="admin-form">
            <h2>Загрузить файл</h2>
            <div className="form-group">
              <input type="file" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} />
            </div>
            <div className="form-group">
              <label>Название</label>
              <input value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} />
            </div>
            <div className="form-group">
              <label>Alt text</label>
              <input value={uploadAltText} onChange={(event) => setUploadAltText(event.target.value)} />
            </div>
            <button className="btn btn-primary" type="button" onClick={handleUpload} disabled={uploading || !uploadFile}>
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </div>
        )}

        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="media-library">
            <div className="media-grid">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={`media-card ${selected?.id === asset.id ? 'active' : ''}`}
                  onClick={() => setSelected(asset)}
                >
                  {asset.mediaType === 'image' || asset.mimeType.startsWith('image/') ? (
                    <img src={asset.publicUrl} alt={asset.altText ?? asset.title ?? 'media'} />
                  ) : (
                    <div className="media-placeholder">{asset.mediaType}</div>
                  )}
                  <div className="media-meta">
                    <div className="media-title">{asset.title ?? 'Без названия'}</div>
                    <div className="media-subtitle">{asset.mimeType}</div>
                  </div>
                </button>
              ))}
            </div>

            {selectedPreview && (
              <div className="media-detail">
                <h2>Детали</h2>
                {selectedPreview.isImage ? (
                  <img src={selectedPreview.publicUrl} alt={selectedPreview.altText ?? 'preview'} />
                ) : (
                  <div className="media-placeholder large">{selectedPreview.mediaType}</div>
                )}
                <p className="admin-muted">URL: {selectedPreview.publicUrl}</p>
                <button className="btn btn-secondary" type="button" onClick={() => void handleCopyUrl(selectedPreview.publicUrl)}>
                  Скопировать URL
                </button>

                <div className="admin-form">
                  <div className="form-group">
                    <label>Название</label>
                    <input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="form-group">
                    <label>Alt text</label>
                    <input
                      value={editAltText}
                      onChange={(event) => setEditAltText(event.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  {canEdit && (
                    <div className="admin-actions">
                      <button className="btn btn-primary" type="button" onClick={handleSaveMeta} disabled={savingMeta}>
                        {savingMeta ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
                        {deleting ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
