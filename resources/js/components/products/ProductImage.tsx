import React from 'react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/productUtils';
import { ImageIcon } from 'lucide-react';

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductImage({ src, alt, className, size = 'md' }: ProductImageProps) {
  const imageUrl = getImageUrl(src);

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-40 w-40',
  };

  if (!imageUrl) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded-md',
        sizeClasses[size],
        className
      )}>
        <ImageIcon className="h-1/2 w-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={cn(
        'object-cover rounded-md',
        sizeClasses[size],
        className
      )}
    />
  );
}
