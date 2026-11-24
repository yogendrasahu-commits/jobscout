import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validators';

/**
 * Modal for editing the current user's profile.
 * Supports basic fields: name, title, avatar URL, email, skills, bio,
 * expected salary, and availability.
 * Submits a PUT request to `/api/auth/profile` (backend already provides this endpoint).
 */
export const ProfileEditModal = ({ isOpen, onClose, onUpdated }) => {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    name: '',
    title: '',
    avatar: '',
    email: '',
    skills: '',
    bio: '',
    expectedSalary: '',
    availability: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        title: user.title || '',
        avatar: user.avatar || '',
        email: user.email || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        bio: user.bio || '',
        expectedSalary: user.expectedSalary || '',
        availability: user.availability || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (trimmedName.length < 2) {
      setError('Please enter a valid full name (at least 2 characters)');
      return;
    }
    const trimmedEmail = form.email.trim();
    if (trimmedEmail) {
      const emailErr = validateEmail(trimmedEmail);
      if (emailErr) {
        setError(emailErr);
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name.trim(),
          title: form.title.trim(),
          avatar: form.avatar.trim(),
          email: form.email.trim(),
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          bio: form.bio.trim(),
          expectedSalary: form.expectedSalary.trim(),
          availability: form.availability.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      if (onUpdated) onUpdated(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-slate-900">Edit Profile</h2>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title / Headline</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
            <input
              name="avatar"
              value={form.avatar}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Salary</label>
              <input
                name="expectedSalary"
                value={form.expectedSalary}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
              <input
                name="availability"
                value={form.availability}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
