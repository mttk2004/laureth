import { getImageUrl } from '@/lib/productUtils';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface ProductImageProps {
    src: string | null;
    alt: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ProductImage({ src, alt, className, size = 'md' }: ProductImageProps) {
    const imageUrl = getImageUrl(src);

    const sizeClasses = {
        sm: 'h-10 w-10',
        md: 'h-16 w-16',
        lg: 'h-40 w-40',
        xl: 'h-52 w-52',
    };

    if (!imageUrl) {
        return (
            <div className={cn('bg-muted flex items-center justify-center rounded-md', sizeClasses[size], className)}>
                <ImageIcon className="text-muted-foreground h-1/2 w-1/2" />
            </div>
        );
    }

    return <img src={imageUrl} alt={alt} className={cn('rounded-md object-cover', sizeClasses[size], className)} />;
}
