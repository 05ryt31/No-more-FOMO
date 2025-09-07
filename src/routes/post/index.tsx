import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Sparkles, Calendar, MapPin, Tag, Image, FileText } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';
import toast from 'react-hot-toast';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  imageUrl: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export const Route = createFileRoute("/post/")({
  component: PostEvent,
});

function PostEvent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { selectedUniversityId } = useUserStore();
  const [extractionText, setExtractionText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      categories: [],
      imageUrl: '',
    },
  });

  const categoriesQuery = useQuery(trpc.getEventCategories.queryOptions({
    universityId: selectedUniversityId || 'ucla',
  }));

  const extractMutation = useMutation({
    mutationFn: async (text: string) => {
      const trpcClient = trpc;
      return trpcClient.extractEventFromText.mutate({
        text,
        universityId: selectedUniversityId || 'ucla',
      });
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        const data = result.data;
        form.setValue('title', data.title);
        form.setValue('description', data.description || '');
        form.setValue('startDate', data.startDate);
        form.setValue('startTime', data.startTime);
        form.setValue('endDate', data.endDate || '');
        form.setValue('endTime', data.endTime || '');
        form.setValue('location', data.location || '');
        form.setValue('categories', data.categories);
        form.setValue('imageUrl', data.imageUrl || '');
        toast.success('Event information extracted successfully!');
      } else {
        toast.error(result.error || 'Failed to extract event information');
      }
      setIsExtracting(false);
    },
    onError: (error) => {
      console.error('Extraction error:', error);
      toast.error('Failed to extract event information');
      setIsExtracting(false);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const trpcClient = trpc;
      return trpcClient.createEvent.mutate({
        universityId: selectedUniversityId || 'ucla',
        ...data,
      });
    },
    onSuccess: (event) => {
      toast.success('Event created successfully!');
      navigate({ to: `/event/${event.id}` });
    },
    onError: (error) => {
      console.error('Create event error:', error);
      toast.error('Failed to create event');
    },
  });

  const handleAutoExtract = async () => {
    if (!extractionText.trim()) {
      toast.error('Please enter a URL or event description');
      return;
    }

    setIsExtracting(true);
    extractMutation.mutate(extractionText);
  };

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const toggleCategory = (category: string) => {
    const currentCategories = form.getValues('categories');
    if (currentCategories.includes(category)) {
      form.setValue('categories', currentCategories.filter(c => c !== category));
    } else {
      form.setValue('categories', [...currentCategories, category]);
    }
  };

  const watchedCategories = form.watch('categories');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link 
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to events
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post New Event</h1>
            <p className="text-gray-600 mb-8">Share your event with the campus community</p>

            {/* Auto-Extract Section */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Auto-Extract Event Information
              </h2>
              <p className="text-gray-600 mb-4">
                Paste an event URL or description and we'll automatically extract the details for you.
              </p>
              <div className="flex gap-3">
                <textarea
                  value={extractionText}
                  onChange={(e) => setExtractionText(e.target.value)}
                  placeholder="Paste event URL or description here..."
                  className="flex-1 min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAutoExtract}
                  disabled={isExtracting || !extractionText.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Auto-Extract
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  {...form.register('title')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...form.register('description')}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your event..."
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    {...form.register('startDate')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    {...form.register('startTime')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {form.formState.errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...form.register('endDate')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    {...form.register('endTime')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  {...form.register('location')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Event location"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories *
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoriesQuery.data?.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        watchedCategories.includes(category)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {form.formState.errors.categories && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.categories.message}</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  {...form.register('imageUrl')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {createEventMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Publish Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
