'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const SettingsPage = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const role = user?.publicMetadata?.role as string;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [phone, setPhone] = useState(
    (user?.unsafeMetadata?.phone as string) || '',
  );
  const [email, setEmail] = useState(
    user?.emailAddresses[0]?.emailAddress || '',
  );
  const [loadingContact, setLoadingContact] = useState(false);

  const [description, setDescription] = useState(
    (user?.unsafeMetadata?.description as string) || '',
  );
  const [img, setImg] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  if (!isLoaded) return null;

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Min 8 characters.');
      return;
    }
    setLoadingPassword(true);
    try {
      await user?.updatePassword({ currentPassword, newPassword });
      toast.success('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.longMessage || 'Error.');
    }
    setLoadingPassword(false);
  };

  const handleSaveContact = async () => {
    setLoadingContact(true);
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phone,
          email,
        },
      });
      toast.success('Contact info saved!');
    } catch (err: any) {
      toast.error('Could not save contact info.');
    }
    setLoadingContact(false);
  };

  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          img: img?.secure_url || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      // Salvam si in unsafeMetadata ca sa apara imediat
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          description,
        },
      });

      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error('Could not save profile.');
    }
    setLoadingProfile(false);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>

        {/* Profile Photo & Description — doar teacher si student */}
        {(role === 'teacher' || role === 'student') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Profile</h2>
            <div className="flex flex-col gap-4">
              {/* Photo upload */}
              <div className="flex flex-col gap-2">
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
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => open()}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        📷 {img ? 'Change photo' : 'Upload photo'}
                      </button>
                      {img && (
                        <Image
                          src={img.secure_url}
                          alt="Preview"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                  placeholder="Short bio or description..."
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loadingProfile}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loadingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">
            Account Information
          </h2>
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">Username</p>
              <p className="text-sm font-medium">{user?.username || '-'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 transition-colors bg-white"
                placeholder="Enter email"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 transition-colors bg-white"
                placeholder="Enter phone number"
              />
            </div>
            <button
              onClick={handleSaveContact}
              disabled={loadingContact}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loadingContact ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">
            Change Password
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 transition-colors"
              placeholder="Current password"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 transition-colors"
              placeholder="New password (min 8)"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 transition-colors"
              placeholder="Confirm new password"
            />
            <button
              onClick={handleChangePassword}
              disabled={loadingPassword}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loadingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-red-100">
          <h2 className="font-bold text-red-600 mb-2">Sign Out</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sign out from all devices.
          </p>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
