import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, Badge } from '../ui';

export const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendLabel,
  badgeText,
  badgeVariant = 'secondary',
  onClick,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <Card
      className={`transition-all duration-200 shadow-subtle ${
        isClickable
          ? 'hover:border-teal-500/40 hover:shadow-md cursor-pointer group'
          : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
              <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          )}

          {badgeText && (
            <Badge variant={badgeVariant} size="sm">
              {badgeText}
            </Badge>
          )}
        </div>

        <div>
          <span className="text-xs font-medium text-muted-foreground block">
            {title}
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground block mt-0.5">
            {value}
          </span>
        </div>

        {(subtext || trend !== undefined) && (
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{subtext}</span>

            {trend !== undefined && (
              <span
                className={`flex items-center text-[11px] font-semibold ${
                  trend >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {trend > 0 ? `+${trend}%` : `${trend}%`}
                {trendLabel && <span className="ml-1 text-muted-foreground font-normal">{trendLabel}</span>}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
