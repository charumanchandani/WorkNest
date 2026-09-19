import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button, Card, CardHeader, CardContent, Badge } from '../ui';

export const AIResultCard = ({
  title = 'AI Generation Result',
  type = 'general',
  data = null,
  onApplyAction,
  applyActionLabel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-subtle border-teal-500/40 bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 bg-teal-50/50 dark:bg-teal-950/30 border-b border-border/80 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            <span className="text-[11px] text-muted-foreground block">
              Generated securely with server-side AI assistance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.draft && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(data.draft)}
              className="text-xs h-8"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Draft
                </>
              )}
            </Button>
          )}

          {onApplyAction && (
            <Button
              variant="default"
              size="sm"
              onClick={onApplyAction}
              className="text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {applyActionLabel || 'Apply to Form'}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
        {/* 1. Leave Draft Text */}
        {type === 'leave' && data.draft && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Refined Application Message
              </span>
              <Badge variant="primary" size="sm">
                Tone: {data.tone || 'Professional'}
              </Badge>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 font-sans text-xs text-foreground whitespace-pre-wrap leading-relaxed shadow-inner">
              {data.draft}
            </div>
          </div>
        )}

        {/* 2. Task Summary */}
        {type === 'task' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/60 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Executive Overview
              </span>
              <p className="text-foreground leading-relaxed">{data.summary}</p>
            </div>

            {data.keyPoints && data.keyPoints.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Key Specifications
                </span>
                <ul className="space-y-1">
                  {data.keyPoints.map((kp, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20 text-foreground"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.nextAction && (
              <div className="p-3 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-start gap-2 text-teal-900 dark:text-teal-200">
                <Lightbulb className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Recommended Next Action</span>
                  <span className="text-xs opacity-90">{data.nextAction}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Document Summary */}
        {type === 'document' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/60 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Document Synopsis
              </span>
              <p className="text-foreground leading-relaxed">{data.summary}</p>
            </div>

            {data.keyPoints && data.keyPoints.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Core Highlights
                </span>
                <ul className="space-y-1">
                  {data.keyPoints.map((kp, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20 text-foreground"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.importantActions && (
              <div className="p-3 rounded-lg bg-secondary/40 border border-border flex items-start gap-2 text-foreground">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Important Actions & Takeaways</span>
                  <span className="text-xs text-muted-foreground">{data.importantActions}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Productivity Insights */}
        {type === 'productivity' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Operational Performance Summary
                </span>
                <Badge variant="primary" size="sm">
                  {data.scope} Scope
                </Badge>
              </div>
              <p className="text-foreground leading-relaxed pt-1">{data.overview}</p>
            </div>

            {data.trends && data.trends.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Identified Operational Patterns
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {data.trends.map((tr, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-secondary/20 text-foreground flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.recommendations && data.recommendations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Operational Recommendations
                </span>
                <div className="space-y-1.5">
                  {data.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 text-foreground flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIResultCard;
