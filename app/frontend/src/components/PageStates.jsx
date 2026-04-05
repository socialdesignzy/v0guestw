import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Full-page loading skeleton. Use when the main page content is loading.
 * @param {'default'|'cards'|'list'} variant - Layout: default (header+grid), cards (more cards), list (lines).
 * @param {string} className - Wrapper class.
 */
export function PageLoading({ variant = 'default', className }) {
  const base = 'min-h-[60vh] p-4 md:p-8';
  return (
    <div className={cn(base, className)}>
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-10 w-64 rounded-lg" />
          {variant === 'list' ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className={cn(
                'grid gap-4',
                variant === 'cards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'
              )}>
                {(variant === 'cards' ? [1, 2, 3, 4] : [1, 2, 3]).map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
                <Skeleton className="h-72 rounded-xl" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Full-page error state with retry. Use when the initial data fetch fails.
 * @param {string} message - Error message.
 * @param {() => void} onRetry - Retry handler.
 * @param {boolean} retrying - Show loading on retry button.
 * @param {string} className - Wrapper class.
 */
export function PageError({ message = 'Something went wrong', onRetry, retrying = false, className }) {
  return (
    <div className={cn('min-h-[60vh] flex items-center justify-center p-4 md:p-8', className)}>
      <Card className="max-w-md w-full border-2 border-red-100 bg-red-50/50">
        <CardContent className="pt-8 pb-8 px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-600" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={retrying}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', retrying && 'animate-spin')} />
              {retrying ? 'Retrying…' : 'Try again'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * In-page empty state (icon, title, description, optional action).
 * @param {React.ElementType} icon - Lucide icon component.
 * @param {string} title - Title.
 * @param {string} description - Short description.
 * @param {React.ReactNode} action - Optional CTA (button or link).
 * @param {string} iconClassName - Icon wrapper classes (e.g. bg-indigo-100, text-indigo-600).
 * @param {string} className - Card wrapper class.
 */
export function EmptyState({ icon: Icon, title, description, action, iconClassName = 'bg-indigo-100 text-indigo-600', className }) {
  return (
    <Card className={cn('border border-gray-200 shadow-sm', className)}>
      <CardContent className="p-12 text-center">
        {Icon && (
          <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', iconClassName)}>
            <Icon className="h-8 w-8" aria-hidden />
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        {action}
      </CardContent>
    </Card>
  );
}
