/**
 * Component Exports
 *
 * Central export file for all components in the application
 */

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Avatar Selector - Lazy loaded for better performance
export const AvatarSelector = dynamic(
  () => import('./AvatarSelector').then((mod) => mod.AvatarSelector),
  {
    ssr: false,
    loading: () => React.createElement('div', { className: 'flex justify-center items-center p-8' }, 'Loading...'),
  }
);
export type { Avatar, AvatarSelectorProps } from './AvatarSelector';

// Video Player - Lazy loaded for better performance (heavy component with framer-motion)
export const VideoPlayer = dynamic(
  () => import('./ui/VideoPlayer').then((mod) => mod.VideoPlayer),
  {
    ssr: false,
    loading: () => React.createElement('div', { className: 'flex justify-center items-center p-8' }, 'Loading...'),
  }
);
export type { VideoPlayerProps } from './ui/VideoPlayer';

// Download Button
export { DownloadButton, DownloadButtonCompact } from './DownloadButton';
export type { DownloadButtonProps } from './DownloadButton';

// UI Components - Essential components loaded immediately
export { Button } from './ui/Button';
export type { ButtonProps } from './ui/Button';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
export type { CardProps } from './ui/Card';

export { Badge } from './ui/Badge';
export { Input } from './ui/Input';
export { Select } from './ui/Select';
export { Skeleton } from './ui/Skeleton';
export { Textarea } from './ui/Textarea';
export { Toast } from './ui/Toast';
export { Modal } from './ui/Modal';
export { Loading } from './ui/Loading';
