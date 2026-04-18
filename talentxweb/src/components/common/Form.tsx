import React, { useState, FormEvent } from 'react';
import { FieldError } from '../../types';
import Button from './Button';

export interface FormProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  children: React.ReactNode;
  initialData?: Record<string, any>;
  validationRules?: Record<string, ValidationRule>;
  className?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  loading?: boolean;
  errors?: FieldError[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, formData?: Record<string, any>) => string | null;
}

/**
 * Recursively walks the React tree and injects form props into any element
 * that has a `name` prop (i.e. FormField components), even when they are
 * nested inside wrapper <div> elements.
 */
function cloneWithFormProps(
  child: React.ReactNode,
  formData: Record<string, any>,
  updateField: (name: string, value: any) => void,
  allErrors: Record<string, string>,
  disabled: boolean
): React.ReactNode {
  if (!React.isValidElement(child)) return child;

  // If this element has a `name` prop it is a form field — inject props
  if ('name' in child.props && child.props.name) {
    const fieldName = child.props.name as string;

    const getValue = (name: string) => {
      if (name.includes('.')) {
        const parts = name.split('.');
        let current: any = formData;
        for (const part of parts) {
          if (part && current != null) current = current[part];
          else break;
        }
        return current ?? '';
      }
      return formData[name] ?? '';
    };

    return React.cloneElement(child as any, {
      value: getValue(fieldName),
      onChange: (value: any) => updateField(fieldName, value),
      error: allErrors[fieldName],
      disabled,
    });
  }

  // Otherwise recurse into children
  const childChildren = (child.props as any).children;
  if (!childChildren) return child;

  return React.cloneElement(child as any, {
    children: React.Children.map(childChildren, (c: React.ReactNode) =>
      cloneWithFormProps(c, formData, updateField, allErrors, disabled)
    ),
  });
}

const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  initialData = {},
  validationRules = {},
  className = '',
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  onCancel,
  loading = false,
  errors = []
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${name} is required`;
    }

    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${name} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `${name} must be no more than ${rule.maxLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return `${name} format is invalid`;
      }
    }

    if (rule.custom) {
      return rule.custom(value, formData);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (name: string, value: any) => {
    if (name.includes('.')) {
      const parts = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current: any = newData;

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (part && !current[part]) {
            current[part] = {};
          }
          if (part) {
            current = current[part];
          }
        }

        const finalPart = parts[parts.length - 1];
        if (finalPart) {
          current[finalPart] = value;
        }
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allErrors = { ...validationErrors };
  errors.forEach(error => {
    allErrors[error.field] = error.message;
  });

  return (
    <form onSubmit={handleSubmit} className={`space-y-8 ${className}`} noValidate>
      <div className="space-y-6">
        {React.Children.map(children, child => cloneWithFormProps(child, formData, updateField, allErrors, loading || isSubmitting))}
      </div>

      <div className="pt-6 border-t border-secondary-50 dark:border-secondary-800 flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="glass"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            {cancelButtonText}
          </Button>
        )}

        <Button
          type="submit"
          variant="gradient"
          disabled={loading || isSubmitting}
          className="shadow-glow"
        >
          {(loading || isSubmitting) ? 'Processing...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default Form;