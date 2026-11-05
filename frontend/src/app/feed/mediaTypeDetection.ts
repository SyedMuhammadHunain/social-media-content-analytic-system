// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Media Type Detection Utils

export interface MediaDetectionResult {
  isVideo: boolean;
  contentType: string;
  warning: string | null;
}

const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov|mkv|avi|wmv)$/i;
const UNSUPPORTED_CONTAINER_REGEX = /\.(mkv|avi|wmv|flv)$/i;

function resolveVideoContentType(file: File): string {
  if (file.type && file.type.startsWith('video/')) return file.type;
  if (/\.webm$/i.test(file.name)) return 'video/webm';
  if (/\.ogg$/i.test(file.name)) return 'video/ogg';
  return 'video/mp4';
}

export function detectMediaTypeAndFormat(file: File): MediaDetectionResult {
  const isVideo = file.type.startsWith('video/') || VIDEO_EXTENSION_REGEX.test(file.name);
  const isUnsupported = UNSUPPORTED_CONTAINER_REGEX.test(file.name);

  const warning = isUnsupported
    ? 'Notice: .mkv/.avi video containers are not supported by web browsers. Please use MP4 or WebM.'
    : null;

  const contentType = isVideo ? resolveVideoContentType(file) : (file.type || 'image/jpeg');

  return { isVideo, contentType, warning };
}
