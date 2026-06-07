'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import InputField from '../InputField';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createLesson, updateLesson } from '@/lib/actions';

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: 'Name is required!' }),
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'], {
    message: 'Day is required!',
  }),
  startTime: z.string().min(1, { message: 'Start time is required!' }),
  endTime: z.string().min(1, { message: 'End time is required!' }),
  subjectId: z.coerce.number({ message: 'Subject is required!' }),
  classId: z.coerce.number({ message: 'Class is required!' }),
  teacherId: z.string().min(1, { message: 'Teacher is required!' }),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const toDatetimeLocal = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      subjectId: data?.subjectId ?? relatedData?.subjects?.[0]?.id,
      classId: data?.classId ?? relatedData?.classes?.[0]?.id,
      teacherId: data?.teacherId ?? relatedData?.teachers?.[0]?.id ?? '',
      fileUrl: data?.fileUrl || '',
      fileName: data?.fileName || '',
      startTime: toDatetimeLocal(data?.startTime),
      endTime: toDatetimeLocal(data?.endTime),
    },
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringUntil, setRecurringUntil] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileUrl = watch('fileUrl');
  const fileName = watch('fileName');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File is too large (max 50MB).');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setUploadError(result.error || 'Upload failed.');
        return;
      }

      setValue('fileUrl', result.url);
      setValue('fileName', result.fileName);
      toast('PDF uploaded successfully!');
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setValue('fileUrl', '');
    setValue('fileName', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = handleSubmit(async (formData) => {
    if (isRecurring && !recurringUntil) {
      toast.error('Please select an end date for recurring lessons.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('day', formData.day);
      fd.append('startTime', new Date(formData.startTime).toISOString());
      fd.append('endTime', new Date(formData.endTime).toISOString());
      fd.append('subjectId', String(formData.subjectId));
      fd.append('classId', String(formData.classId));
      fd.append('teacherId', formData.teacherId);
      if (formData.fileUrl) fd.append('fileUrl', formData.fileUrl);
      if (formData.fileName) fd.append('fileName', formData.fileName);
      if (formData.id) fd.append('id', String(formData.id));

      if (isRecurring && type === 'create') {
        fd.append('isRecurring', 'true');
        fd.append('recurringUntil', new Date(recurringUntil).toISOString());
      }

      const action = type === 'create' ? createLesson : updateLesson;
      const result = await action(
        { success: false, error: false, message: '' },
        fd,
      );

      if (result.success) {
        toast(`Lesson has been ${type === 'create' ? 'created' : 'updated'}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || 'Something went wrong!');
      }
    } catch (err) {
      toast.error('Something went wrong!');
    } finally {
      setSubmitting(false);
    }
  });

  const { subjects, classes, teachers } = relatedData ?? {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new lesson' : 'Update the lesson'}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Lesson Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={toDatetimeLocal(data?.startTime)}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="End Time"
          name="endTime"
          defaultValue={toDatetimeLocal(data?.endTime)}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('day')}
            defaultValue={data?.day}
          >
            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">Wednesday</option>
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">
              {errors.day.message.toString()}
            </p>
          )}
        </div>

        {subjects && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Subject</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register('subjectId')}
              defaultValue={data?.subjectId}
            >
              {subjects.map((subject: { id: number; name: string }) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId?.message && (
              <p className="text-xs text-red-400">
                {errors.subjectId.message.toString()}
              </p>
            )}
          </div>
        )}

        {classes && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register('classId')}
              defaultValue={data?.classId}
            >
              {classes.map((cls: { id: number; name: string }) => (
                <option value={cls.id} key={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {errors.classId?.message && (
              <p className="text-xs text-red-400">
                {errors.classId.message.toString()}
              </p>
            )}
          </div>
        )}

        {teachers && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Teacher</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register('teacherId')}
              defaultValue={data?.teacherId}
            >
              {teachers.map(
                (teacher: { id: string; name: string; surname: string }) => (
                  <option value={teacher.id} key={teacher.id}>
                    {teacher.name + ' ' + teacher.surname}
                  </option>
                ),
              )}
            </select>
            {errors.teacherId?.message && (
              <p className="text-xs text-red-400">
                {errors.teacherId.message.toString()}
              </p>
            )}
          </div>
        )}

        {/* Repeat weekly — doar la create */}
        {type === 'create' && (
          <div className="flex flex-col gap-3 w-full border border-gray-200 rounded-md p-4 bg-gray-50">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                  isRecurring ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isRecurring ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Repeat weekly
              </span>
            </label>

            {isRecurring && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Repeat until</label>
                <input
                  type="date"
                  value={recurringUntil}
                  onChange={(e) => setRecurringUntil(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full md:w-1/2 outline-none focus:ring-blue-400"
                />
                {isRecurring && !recurringUntil && (
                  <p className="text-xs text-orange-400">
                    Please select an end date.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* PDF Upload */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Lesson PDF (optional)</label>

          {fileUrl ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <span className="text-blue-600 text-lg">📄</span>
              <span className="text-sm text-blue-800 flex-1 truncate">
                {fileName || 'lesson.pdf'}
              </span>
              <a
                href={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Preview
              </a>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">📁</span>
                  <p className="text-sm text-gray-500">
                    Click to upload PDF{' '}
                    <span className="text-gray-400">(max 50MB)</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <input type="hidden" {...register('fileUrl')} />
          <input type="hidden" {...register('fileName')} />

          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        </div>
      </div>

      <button
        disabled={submitting || uploading}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting
          ? type === 'create'
            ? isRecurring
              ? 'Creating lessons...'
              : 'Creating...'
            : 'Updating...'
          : type === 'create'
            ? 'Create'
            : 'Update'}
      </button>
    </form>
  );
};

export default LessonForm;
