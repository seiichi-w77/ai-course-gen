'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Button
export { Button, type ButtonProps } from './Button';

// Input & Textarea
export { Input, type InputProps } from './Input';
export { Textarea, type TextareaProps } from './Textarea';

// Card
export { Card, type CardProps } from './Card';

// Select
export { Select, type SelectProps } from './Select';

// Modal
export { Modal, type ModalProps } from './Modal';

// Toast
export {
  Toast,
  ToastContainer,
  type ToastProps,
  type ToastType,
  type ToastContextType,
  type ToastContainerProps,
} from './Toast';

// Skeleton
export {
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  type SkeletonProps,
} from './Skeleton';

// Badge
export {
  Badge,
  BadgeGroup,
  type BadgeProps,
  type BadgeGroupProps,
} from './Badge';

// VideoPlayer - Lazy loaded for better performance
export const VideoPlayer = dynamic(
  () => import('./VideoPlayer').then((mod) => mod.VideoPlayer),
  {
    ssr: false,
    loading: () => React.createElement('div', { className: 'flex justify-center items-center p-8' }, 'Loading...'),
  }
);
export type { VideoPlayerProps } from './VideoPlayer';

// Loading
export { Loading, type LoadingProps } from './Loading';

// Grid
export { Grid, type GridProps } from './Grid';

// Flex
export { Flex, type FlexProps } from './Flex';
