'use client';

import React, { useEffect, useState } from 'react';
import { Users, Shield, UserPlus, Trash2 } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsersList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role }),
    });

    if (res.ok) {
      setName('');
      setEmail('');
      setShowForm(false);
      fetchUsers();
    } else {
      alert('Failed to add team member.');
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"?`)) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> Role-Based Access Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Team Members & Access Roles
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage admin permissions (Admin, Editor, Author, Moderator).
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Add Team Member</h2>
          <form onSubmit={handleAddUser} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="AUTHOR">AUTHOR</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
              >
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : usersList.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-x-auto shadow-soft">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">User Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-900 dark:text-white">{u.name}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black uppercase text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
          <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No team members yet.</h3>
        </div>
      )}
    </div>
  );
}
