import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | string;
    size?: 'sm' | 'md' | 'lg' | string;
    fullWidth?: boolean;
}

export function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    ...props
}: ButtonProps) {
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const fullWidthClass = fullWidth ? 'btn--full-width' : '';

    // Combine all classes
    const combinedClassName = [
        'btn',
        variantClass,
        sizeClass,
        fullWidthClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    );
}
