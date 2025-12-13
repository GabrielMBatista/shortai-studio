import React from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helpText?: string;
    leftIcon?: React.ReactNode;
    options?: SelectOption[];
}

import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            helpText,
            leftIcon,
            options,
            children,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-slate-300 mb-2"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    <select
                        ref={ref}
                        id={selectId}
                        className={`
              w-full px-4 py-3 
              bg-slate-900/50 
              border ${error ? 'border-red-500/50' : 'border-slate-700/50'}
              rounded-xl 
              text-white 
              appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              pr-10
              ${className}
            `}
                        {...props}
                    >
                        {options
                            ? options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))
                            : children}
                    </select>

                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                </div>

                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}

                {helpText && !error && (
                    <p className="mt-1 text-xs text-slate-500">{helpText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
