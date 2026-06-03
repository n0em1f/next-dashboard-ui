'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { createTeacher, updateTeacher } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { teacherSchema, TeacherSchema } from '@/lib/formValidationsSchemas';
import { CldUploadWidget } from 'next-cloudinary';

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: any;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500 font-medium">{label}</label>
    {children}
    {error?.message && (
      <p className="text-xs text-red-400">{error.message.toString()}</p>
    )}
  </div>
);

const Input = ({
  register,
  name,
  type = 'text',
  defaultValue,
  placeholder,
}: any) => (
  <input
    type={type}
    {...register(name)}
    defaultValue={defaultValue}
    placeholder={placeholder}
    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:outline-none focus:ring-blue-300"
  />
);

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<any>(
    data?.img ? { secure_url: data.img } : null,
  );

  const [state, formAction] = useFormState(
    type === 'create' ? createTeacher : updateTeacher,
    { success: false, error: false, message: '' },
  );

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === 'create' ? 'created' : 'updated'}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <h1 className="text-lg font-semibold">
        {type === 'create' ? 'Create a new teacher' : 'Update the teacher'}
      </h1>

      {/* Auth */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
          Authentication
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <Field label="Username" error={errors?.username}>
              <Input
                register={register}
                name="username"
                defaultValue={data?.username}
              />
            </Field>
          </div>
          <div className="flex-1 min-w-[150px]">
            <Field label="Email" error={errors?.email}>
              <Input
                register={register}
                name="email"
                type="email"
                defaultValue={data?.email}
              />
            </Field>
          </div>
          <div className="flex-1 min-w-[150px]">
            <Field label="Password" error={errors?.password}>
              <Input
                register={register}
                name="password"
                type="password"
                defaultValue={data?.password}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Personal */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
          Personal Information
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <Field label="First name" error={errors.name}>
              <Input
                register={register}
                name="name"
                defaultValue={data?.name}
              />
            </Field>
          </div>
          <div className="flex-1 min-w-[150px]">
            <Field label="Last name" error={errors.surname}>
              <Input
                register={register}
                name="surname"
                defaultValue={data?.surname}
              />
            </Field>
          </div>
          <div className="flex-1 min-w-[150px]">
            <Field label="Phone" error={errors.phone}>
              <Input
                register={register}
                name="phone"
                defaultValue={data?.phone}
              />
            </Field>
          </div>
          <div className="flex-1 min-w-[150px]">
            <Field label="Address" error={errors.address}>
              <Input
                register={register}
                name="address"
                defaultValue={data?.address}
              />
            </Field>
          </div>
          <div className="flex-1 min-w-[100px]">
            <Field label="Blood Type" error={errors.bloodType}>
              <Input
                register={register}
                name="bloodType"
                defaultValue={data?.bloodType}
              />
            </Field>
          </div>
          <div className="flex-1 min-w-[150px]">
            <Field label="Birthday" error={errors.birthday}>
              <Input
                register={register}
                name="birthday"
                type="date"
                defaultValue={data?.birthday?.toISOString().split('T')[0]}
              />
            </Field>
          </div>
          {data && (
            <input type="hidden" {...register('id')} defaultValue={data?.id} />
          )}
          <div className="flex-1 min-w-[120px]">
            <Field label="Sex" error={errors.sex}>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register('sex')}
                defaultValue={data?.sex}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </Field>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Field label="Subjects" error={errors.subjects}>
              <select
                multiple
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-24"
                {...register('subjects')}
                defaultValue={data?.subjects}
              >
                {subjects.map((s: { id: number; name: string }) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>

      {/* Description */}
      <Field label="Description" error={errors.description}>
        <textarea
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full resize-none focus:outline-none focus:ring-blue-300"
          rows={2}
          placeholder="Short bio..."
          defaultValue={data?.description || ''}
          {...register('description')}
        />
      </Field>

      {/* Photo */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">
          Profile Photo
        </label>
        <CldUploadWidget
          uploadPreset="school"
          options={{
            cropping: true,
            croppingAspectRatio: 1,
            showSkipCropButton: false,
          }}
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => open()}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Image src="/upload.png" alt="" width={16} height={16} />
                {img ? 'Change photo' : 'Upload photo'}
              </button>
              {img && (
                <Image
                  src={img.secure_url}
                  alt="Preview"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              )}
            </div>
          )}
        </CldUploadWidget>
      </div>

      {state.error && (
        <span className="text-red-500 text-sm">
          {state.message || 'Something went wrong!'}
        </span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md text-sm font-medium">
        {type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default TeacherForm;
