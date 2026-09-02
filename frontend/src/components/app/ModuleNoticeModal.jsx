import React from 'react';
import { Sparkles, Calendar, Layers } from 'lucide-react';
import { Modal, Button, Badge } from '../ui';

export const ModuleNoticeModal = ({ isOpen, onClose, moduleName, phase }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Roadmap Milestone"
      description="Feature availability schedule"
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block">
              {moduleName || 'Selected Module'}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Scheduled for implementation in <strong className="text-teal-600 dark:text-teal-400">{phase || 'Future Phase'}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Phase 4 establishes the application shell and employee dashboard layout. Connected backend APIs, database models, and operational workflows for this module will be delivered in its designated phase.
        </p>
      </div>
    </Modal>
  );
};

export default ModuleNoticeModal;
