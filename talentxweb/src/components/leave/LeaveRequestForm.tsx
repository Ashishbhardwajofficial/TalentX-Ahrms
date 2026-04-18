import React, { useState, useEffect } from 'react';
import Form from '../common/Form';
import FormField from '../common/FormField';
import LeaveBalance from './LeaveBalance';
import leaveApi, { LeaveRequestCreateDTO } from '../../api/leaveApi';
import { LeaveType, FieldError } from '../../types';
import { useAuthContext } from '../../context/AuthContext';
import { useNotifications } from '../../services/notification';
import { Clock, AlertCircle, Calendar, Info, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaveRequestFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { user } = useAuthContext();
  const { error: showError } = useNotifications();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        setLoadingTypes(true);
        const types = await leaveApi.getLeaveTypes();
        setLeaveTypes(types);
      } catch (error) {
        showError('Failed to load leave types. Please refresh the page.', 'Loading Error');
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchLeaveTypes();
  }, []);

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      setErrors([]);
      const employeeId = user?.id;

      if (!employeeId) throw new Error('Employee information not found');

      const leaveRequestData: LeaveRequestCreateDTO = {
        employeeId: employeeId,
        leaveTypeId: Number(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        ...(formData.attachmentUrl && { attachmentUrl: formData.attachmentUrl }),
        ...(formData.isHalfDay && { isHalfDay: true }),
        ...(formData.isHalfDay && formData.halfDayPeriod && { halfDayPeriod: formData.halfDayPeriod }),
        ...(formData.isEmergency && { isEmergency: true }),
        ...(formData.isEmergency && formData.emergencyContact && { emergencyContact: formData.emergencyContact }),
        ...(formData.isEmergency && formData.contactDetails && { contactDetails: formData.contactDetails }),
      };

      await leaveApi.createLeaveRequest(leaveRequestData);
      onSubmit();
    } catch (error: any) {
      setErrors([{ field: 'general', message: error.message || 'Failed to create leave request' }]);
    } finally {
      setLoading(false);
    }
  };

  const validationRules = {
    leaveTypeId: { required: true },
    startDate: { required: true },
    endDate: {
      required: true,
      custom: (value: any, formData?: Record<string, any>) => {
        if (!value || !formData?.startDate) return null;
        return new Date(value) < new Date(formData.startDate) ? 'End date must be after start date' : null;
      }
    },
    reason: { required: true, minLength: 10, maxLength: 500 }
  };

  if (loadingTypes) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="text-secondary-500 font-bold uppercase tracking-widest text-[10px]">Loading Leave Quotas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Context Banner */}
      <div className="premium-card p-6 bg-gradient-primary text-white overflow-hidden relative group">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Calendar className="w-40 h-40" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md center shadow-soft">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-black tracking-tight leading-none uppercase text-xs">Employee Balance</h4>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">FY {new Date().getFullYear()}</p>
            </div>
          </div>
          <LeaveBalance compact={true} employeeId={user?.id} />
        </div>
      </div>

      {errors.find(e => e.field === 'general') && (
        <div className="p-4 rounded-2xl bg-danger-50 border border-danger-100 flex items-center gap-3 text-danger-600 text-sm font-bold animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {errors.find(e => e.field === 'general')?.message}
        </div>
      )}

      <Form
        onSubmit={handleSubmit}
        initialData={{ isHalfDay: false, isEmergency: false, halfDayPeriod: 'AM' }}
        validationRules={validationRules}
        loading={loading}
        errors={errors.filter(e => e.field !== 'general')}
        submitButtonText="Submit Proposal"
        onCancel={onCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            name="leaveTypeId"
            label="Category"
            type="select"
            required
            options={leaveTypes.map(type => ({
              value: type.id,
              label: `${type.name} (Max ${type.maxDaysPerYear}d)`
            }))}
          />
          <div className="flex gap-4 pt-4">
            <FormField name="isHalfDay" label="Half Day" type="checkbox" onChange={setIsHalfDay} />
            <FormField name="isEmergency" label="Emergency" type="checkbox" onChange={setIsEmergency} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="startDate" label="From" type="date" required />
          <FormField name="endDate" label="Until" type="date" required />
        </div>

        {isHalfDay && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
            <FormField
              name="halfDayPeriod"
              label="Half Day Block"
              type="select"
              required
              options={[{ value: 'AM', label: 'Morning Session (AM)' }, { value: 'PM', label: 'Afternoon Session (PM)' }]}
            />
          </motion.div>
        )}

        <FormField
          name="reason"
          label="Detailed Justification"
          type="textarea"
          required
          placeholder="Please explain the reason for this request..."
          rows={3}
        />

        {isEmergency && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-3xl bg-danger-50/50 border border-danger-100 space-y-6">
            <div className="flex items-center gap-3 text-danger-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h5 className="text-xs font-black uppercase tracking-widest">Emergency Protocols</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="emergencyContact" label="Contact Person" type="text" required placeholder="Full Name" />
              <FormField name="contactDetails" label="Contact Number/Info" type="text" required placeholder="+1 234..." />
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <FormField name="attachmentUrl" label="Reference Link" type="text" placeholder="https://..." helperText="URL to medical certificates or travel documents" />
          <div className="p-4 rounded-2xl bg-secondary-50/50 border border-secondary-100 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-secondary-900 leading-tight">Request Guidelines</p>
              <p className="text-[10px] text-secondary-500 leading-relaxed font-medium">Please ensure all required fields are accurate. Emergency requests will be prioritized but require valid contact information.</p>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default LeaveRequestForm;