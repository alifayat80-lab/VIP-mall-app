import React, { useState, useEffect } from 'react';
import { PasswordEntry } from '../types';
import { Eye, EyeOff, Copy, Trash2, Plus, Key } from 'lucide-react';
import { generateSecurePasswordAdvice } from '../services/geminiService';

interface VaultProps {
  passwords: PasswordEntry[];
  setPasswords: React.Dispatch<React.SetStateAction<PasswordEntry[]>>;
}

export const Vault: React.FC<VaultProps> = ({ passwords, setPasswords }) => {
  const [showForm, setShowForm] = useState(false);
  const [newSite, setNewSite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [securityTip, setSecurityTip] = useState<string>('');

  useEffect(() => {
    generateSecurePasswordAdvice().then(setSecurityTip);
  }, []);

  const handleAddPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite || !newUsername || !newPassword) return;

    const newEntry: PasswordEntry = {
      id: crypto.randomUUID(),
      site: newSite,
      username: newUsername,
      password: newPassword,
      updatedAt: Date.now(),
    };

    setPasswords(prev => [newEntry, ...prev]);
    setNewSite('');
    setNewUsername('');
    setNewPassword('');
    setShowForm(false);
  };

  const deletePassword = (id: string) => {
    if (confirm('Are you sure you want to delete this password?')) {
      setPasswords(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Secure Vault</h2>
            <p className="text-sm text-slate-500 mt-1">
                AI Tip: {securityTip || "Loading security insights..."}
            </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Credentials
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleAddPassword} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-lg animate-fade-in-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website / App</label>
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="e.g. Gmail"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10"
                  placeholder="Secret123!"
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Securely
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {passwords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Key className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No passwords stored yet. Your vault is empty but secure.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {passwords.map((entry) => (
              <div key={entry.id} className="p-4 hover:bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{entry.site}</h3>
                  <p className="text-sm text-slate-500 font-mono">{entry.username}</p>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-100 rounded-lg px-3 py-2 w-full md:w-auto">
                  <div className="font-mono text-sm min-w-[120px]">
                    {visiblePasswords[entry.id] ? entry.password : '••••••••••••'}
                  </div>
                  <button onClick={() => toggleVisibility(entry.id)} className="text-slate-500 hover:text-slate-700">
                    {visiblePasswords[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(entry.password)} className="text-slate-500 hover:text-slate-700" title="Copy Password">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => deletePassword(entry.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};