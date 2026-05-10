import React from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Avatar', size = 'md', className }) => {
  const [error, setError] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const ringClasses = {
    xs: 'ring-1',
    sm: 'ring-2',
    md: 'ring-2',
    lg: 'ring-4',
    xl: 'ring-4',
  };

  if (!src || error) {
    const initials = alt ? alt.charAt(0).toUpperCase() : 'B';
    const bgColorClasses = [
      'bg-rose-100 text-rose-600',
      'bg-amber-100 text-amber-600',
      'bg-emerald-100 text-emerald-600',
      'bg-indigo-100 text-indigo-600',
      'bg-sky-100 text-sky-600',
      'bg-violet-100 text-violet-600'
    ];
    const bgClass = bgColorClasses[initials.charCodeAt(0) % bgColorClasses.length];

    return (
      <div className={cn(
        'rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden font-bold font-display',
        sizeClasses[size],
        bgClass,
        className
      )}>
        {initials}
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
      sizeClasses[size],
      className
    )}>
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
