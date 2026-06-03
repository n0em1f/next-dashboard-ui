'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../InputField';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createPublication, updatePublication } from '@/lib/actions';

const schema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: 'Title is required!' }),
  type: z.string().min(1, { message: 'Type is required!' }),
  year: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear(), { message: 'Invalid year!' }),
  url: z.string().url({ message: 'Invalid URL!' }).optional().or(z.literal('')),
  teacherId: z.string().min(1, { message: 'Teacher is required!' }),
});

type Inputs = z.infer<typeof schema>;

const PublicationForm = ({
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      teacherId: relatedData?.teacherId || data?.teacherId || '',
    },
  });

  const [state, formAction] = useFormState(
    type === 'create' ? createPublication : updatePublication,
    { success: false, error: false, message: '' },
  );

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Publication has been ${type === 'create' ? 'created' : 'updated'}!`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Add a new publication' : 'Update publication'}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('type')}
            defaultValue={data?.type || 'Article'}
          >
            <option value="Book">Book</option>
            <option value="Article">Article</option>
            <option value="Research Paper">Research Paper</option>
            <option value="Thesis">Thesis</option>
            <option value="Conference Paper">Conference Paper</option>
            <option value="Other">Other</option>
          </select>
          {errors.type?.message && (
            <p className="text-xs text-red-400">
              {errors.type.message.toString()}
            </p>
          )}
        </div>
        <InputField
          label="Year"
          name="year"
          type="number"
          defaultValue={data?.year || new Date().getFullYear()}
          register={register}
          error={errors?.year}
        />
        <InputField
          label="URL (optional)"
          name="url"
          defaultValue={data?.url}
          register={register}
          error={errors?.url}
        />
        <input type="hidden" {...register('teacherId')} />
        {data && (
          <input type="hidden" {...register('id')} defaultValue={data.id} />
        )}
      </div>

      {state.error && (
        <span className="text-red-500">
          {state.message || 'Something went wrong!'}
        </span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === 'create' ? 'Add Publication' : 'Update'}
      </button>
    </form>
  );
};

export default PublicationForm;
