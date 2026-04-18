import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Info,
  History,
  User,
  Clock,
  FileText
} from 'lucide-react';
import { ComplianceCheckDTO } from '../../api/complianceApi';
import { ComplianceSeverity, ComplianceCheckStatus } from '../../types';
import Button from '../common/Button';

interface ComplianceAlertCardProps {
  violation: ComplianceCheckDTO;
  onResolve: () => void;
}

const ComplianceAlertCard: React.FC<ComplianceAlertCardProps> = ({ violation, onResolve }) => {
  const getSeverityConfig = (severity: ComplianceSeverity) => {
    switch (severity) {
      case ComplianceSeverity.CRITICAL:
        return {
          color: 'text-danger-600',
          bg: 'bg-danger-50',
          border: 'border-danger-100 shadow-glow-danger',
          icon: <ShieldAlert className="w-5 h-5" />
        };
      case ComplianceSeverity.HIGH:
        return {
          color: 'text-warning-600',
          bg: 'bg-warning-50',
          border: 'border-warning-100 shadow-glow-warning',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      case ComplianceSeverity.MEDIUM:
        return {
          color: 'text-primary-600',
          bg: 'bg-primary-50',
          border: 'border-primary-100 shadow-glow',
          icon: <Info className="w-5 h-5" />
        };
      case ComplianceSeverity.LOW:
        return {
          color: 'text-success-600',
          bg: 'bg-success-50',
          border: 'border-success-100',
          icon: <ShieldCheck className="w-5 h-5" />
        };
      default:
        return {
          color: 'text-secondary-600',
          bg: 'bg-secondary-50',
          border: 'border-secondary-100',
          icon: <FileText className="w-5 h-5" />
        };
    }
  };

  const config = getSeverityConfig(violation.severity);

  return (
    <div className={`premium-card p-0 overflow-hidden border-l-4 ${config.border} flex flex-col md:flex-row shadow-premium hover:translate-y-[-2px] transition-all duration-300`}>
      <div className={`p-4 center flex-shrink-0 ${config.bg} ${config.color}`}>
        {config.icon}
      </div>

      <div className="flex-grow p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.color} border border-current/10`}>
                {violation.severity}
              </span>
              <span className="text-secondary-400 font-bold text-[10px] uppercase tracking-widest leading-none">
                Audited {new Date(violation.checkDate).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-lg font-black text-secondary-900 leading-tight">
              {violation.rule?.ruleName || `System Redline #${violation.id}`}
            </h4>
          </div>

          {!violation.resolved && (
            <Button
              variant="primary"
              size="sm"
              onClick={onResolve}
              className="shadow-premium whitespace-nowrap"
            >
              Mitigate Risk
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-secondary-50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-secondary-400 uppercase tracking-widest">
              <User className="w-3 h-3" />
              Subject
            </div>
            <div className="text-xs font-bold text-secondary-700">@{violation.employeeName || 'SYSTEM'}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-secondary-400 uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              Execution
            </div>
            <div className="text-xs font-bold text-secondary-700">{new Date(violation.checkDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="col-span-2 space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-secondary-400 uppercase tracking-widest">
              <FileText className="w-3 h-3" />
              Protocol ID
            </div>
            <div className="text-xs font-medium text-secondary-500 font-mono truncate">{violation.ruleId || 'N/A'}</div>
          </div>
        </div>

        {violation.violationDetails && (
          <div className="bg-secondary-50/80 p-3 rounded-xl border border-secondary-100">
            <div className="text-[9px] font-black text-secondary-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" /> Technical Evidence
            </div>
            <p className="text-xs font-medium text-secondary-600 leading-relaxed italic">
              "{typeof violation.violationDetails === 'string' ? violation.violationDetails : JSON.stringify(violation.violationDetails)}"
            </p>
          </div>
        )}

        {violation.resolved && (
          <div className="bg-success-50/50 p-4 rounded-xl border border-success-100 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-success-500 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-black text-success-700 uppercase tracking-widest mb-1">Audit Resolution</div>
              <p className="text-xs font-medium text-success-800 leading-relaxed">
                {violation.resolutionNotes || 'Mitigated via system policy update.'}
              </p>
              {violation.resolvedAt && (
                <div className="text-[9px] font-bold text-success-600/60 mt-2 uppercase tracking-tighter">
                  Mitigated @ {new Date(violation.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceAlertCard;
