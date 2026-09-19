import React from 'react';
import { Card, CardContent, Badge } from '../ui';

export const AIActionCard = ({
  title,
  description,
  icon: Icon,
  badgeText = 'Instant',
  badgeVariant = 'secondary',
  isActive = false,
  onClick,
}) => {
  return (
    <Card
      className={`transition-all duration-200 shadow-subtle cursor-pointer text-left ${
        isActive
          ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-500 shadow-md'
          : 'hover:border-teal-500/40 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {Icon && (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'bg-secondary/80 text-teal-600 dark:text-teal-400'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
            </div>
          )}
          {badgeText && (
            <Badge variant={badgeVariant} size="sm">
              {badgeText}
            </Badge>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground block">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIActionCard;
