import React from 'react';
import { Sparkles, CheckCircle2, Lightbulb, AlertCircle } from 'lucide-react';
import { Modal, Button, Spinner, Alert, Badge } from '../ui';

export const TaskSummaryModal = ({
  isOpen,
  onClose,
  taskTitle = '',
  summaryData = null,
  loading = false,
  error = '',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Task Summary"
      description={`Executive synthesis for: "${taskTitle}"`}
      size="md"
    >
      <div className="space-y-4 text-xs">
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-muted-foreground">
              Synthesizing task context and priority milestones...
            </p>
          </div>
        )}

        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </Alert>
        )}

        {summaryData && !loading && (
          <div className="space-y-4">
            {/* Overview */}
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Overview
              </span>
              <p className="text-foreground leading-relaxed text-xs">
                {summaryData.summary}
              </p>
            </div>

            {/* Key Specifications */}
            {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Key Specifications
                </span>
                <ul className="space-y-1.5">
                  {summaryData.keyPoints.map((kp, idx) => (
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

            {/* Next Action */}
            {summaryData.nextAction && (
              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-start gap-2 text-teal-900 dark:text-teal-200">
                <Lightbulb className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Recommended Next Action</span>
                  <span className="text-xs opacity-90">{summaryData.nextAction}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Badge variant="secondary" size="sm">
            <Sparkles className="w-3 h-3 mr-1 text-teal-600 dark:text-teal-400" />
            Advisory Only
          </Badge>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskSummaryModal;
