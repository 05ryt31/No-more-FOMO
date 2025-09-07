import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';

const registrationFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
  additionalComments: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
});

type RegistrationFormData = z.infer<typeof registrationFormSchema>;

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
}

export function RegistrationModal({ isOpen, onClose, eventId, eventTitle, onSuccess }: RegistrationModalProps) {
  const trpc = useTRPC();
  const { authToken } = useUserStore();
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      additionalComments: '',
      agreeToTerms: false,
    },
  });

  const registerMutation = useMutation(trpc.registerForEvent.mutationOptions({
    onSuccess: () => {
      toast.success('Successfully registered for the event! 🎉');
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast.error('Failed to register for event. Please try again.');
    },
  }));

  const onSubmit = (data: RegistrationFormData) => {
    if (!authToken) {
      toast.error('Authentication required');
      return;
    }

    // Convert form data to customFields object
    const customFields = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || null,
      additionalComments: data.additionalComments || null,
      registrationDate: new Date().toISOString(),
    };

    registerMutation.mutate({
      token: authToken,
      eventId,
      customFields,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Event Registration</h2>
              <p className="text-gray-600 text-sm mt-1">{eventTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...form.register('fullName')}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              {form.formState.errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...form.register('phoneNumber')}
                  type="tel"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              {form.formState.errors.phoneNumber && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Comments
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  {...form.register('additionalComments')}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Any questions or special requests..."
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                {...form.register('agreeToTerms')}
                type="checkbox"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                I agree to the event terms and conditions and understand that my registration information will be shared with event organizers. *
              </label>
            </div>
            {form.formState.errors.agreeToTerms && (
              <p className="text-red-600 text-sm">{form.formState.errors.agreeToTerms.message}</p>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {registerMutation.isPending ? 'Registering...' : 'Register for Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
