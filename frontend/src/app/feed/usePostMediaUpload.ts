// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Media Upload Hook

import { useState, type ChangeEvent } from 'react';
import { mediaApi } from '../../api/mediaApi.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { storeMediaBlob } from '../../utils/mediaBlobStore.ts';

export function usePostMediaUpload(userId?: string) {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [formatWarning, setFormatWarning] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl);
    }

    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|ogg|mov|mkv|avi|wmv)$/i.test(file.name);
    const isUnsupportedContainer = /\.(mkv|avi|wmv|flv)$/i.test(file.name);

    if (isUnsupportedContainer) {
      setFormatWarning(
        'Notice: .mkv/.avi video containers are not supported by web browsers. Please use MP4 or WebM.'
      );
    } else {
      setFormatWarning(null);
    }

    const isWebm = /\.webm$/i.test(file.name);
    const isOgg = /\.ogg$/i.test(file.name);
    const contentType =
      file.type && file.type.startsWith('video/')
        ? file.type
        : isWebm
          ? 'video/webm'
          : isOgg
            ? 'video/ogg'
            : isVideo
              ? 'video/mp4'
              : (file.type || 'image/jpeg');

    const typedBlob = file.slice(0, file.size, contentType);
    const localUrl = URL.createObjectURL(typedBlob);
    const generatedMediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setMediaType(isVideo ? 'VIDEO' : 'IMAGE');
    setMediaUrl(localUrl);
    setMediaId(generatedMediaId);
    storeMediaBlob(generatedMediaId, typedBlob).catch(() => {});

    e.target.value = '';

    try {
      setIsUploading(true);
      const effectiveUserId = normalizeBackendUserId(userId);
      const presign = await mediaApi.getPresignedUploadUrl({
        userId: effectiveUserId,
        fileName: file.name,
        contentType,
      });

      if (presign && presign.uploadUrl) {
        try {
          await mediaApi.uploadBlob(presign.uploadUrl, file, contentType);
          if (presign.publicBlobUrl) {
            setMediaUrl(presign.publicBlobUrl);
          }
        } catch (uploadErr) {
          console.warn('Azure cloud upload failed, retaining local media preview:', uploadErr);
        }
      }
    } catch {
      // Offline fallback: retain local object preview URL
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    if (mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl);
    }
    setMediaUrl('');
    setMediaId('');
    setMediaType('IMAGE');
    setFormatWarning(null);
  };

  const resetMediaState = () => {
    setMediaUrl('');
    setMediaId('');
    setMediaType('IMAGE');
    setFormatWarning(null);
  };

  return {
    mediaUrl,
    setMediaUrl,
    mediaId,
    setMediaId,
    mediaType,
    setMediaType,
    formatWarning,
    setFormatWarning,
    isUploading,
    handleFileSelect,
    handleRemoveMedia,
    resetMediaState,
  };
}
