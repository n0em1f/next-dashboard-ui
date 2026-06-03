'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import InputField from '../InputField';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createEvent, updateEvent } from '@/lib/actions';
import { CldUploadWidget } from 'next-cloudinary';

const schema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: 'Title is required!' }),
  description: z.string().min(1, { message: 'Description is required!' }),
  startTime: z.coerce.date({ message: 'Start time is required!' }),
  endTime: z.coerce.date({ message: 'End time is required!' }),
  classId: z.coerce.number().optional(),
  img: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const EventForm = ({
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
  });

  const [img, setImg] = useState<any>(
    data?.img ? { secure_url: data.img } : null,
  );

  const [state, formAction] = useFormState(
    type === 'create' ? createEvent : updateEvent,
    { success: false, error: false, message: '' },
  );

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === 'create' ? 'created' : 'updated'}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData ?? {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new event' : 'Update the event'}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
        />
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="End Time"
          name="endTime"
          defaultValue={data?.endTime}
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

        {classes && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class (optional)</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register('classId')}
              defaultValue={data?.classId}
            >
              <option value="">All classes</option>
              {classes.map((cls: { id: number; name: string }) => (
                <option value={cls.id} key={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">
            Cover Image (optional)
          </label>
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result, { widget }) => {
              setImg(result.info);
              widget.close();
            }}
          >
            {({ open }) => (
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => open()}
                >
                  <Image src="/upload.png" alt="" width={20} height={20} />
                  <span className="text-xs text-gray-500">
                    {img ? 'Change image' : 'Upload image'}
                  </span>
                </div>
                {img && (
                  <Image
                    src={img.secure_url}
                    alt="Preview"
                    width={80}
                    height={48}
                    className="h-12 w-20 object-cover rounded-md border border-gray-200"
                  />
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">
          {state.message || 'Something went wrong!'}
        </span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default EventForm;
