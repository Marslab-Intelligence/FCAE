'use client';

import { useState } from 'react';
import { User, Lock, Bell, CheckCircle2, Shield, Eye, EyeOff, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSelector } from '@/components/ThemeSelector';

interface ProfileFormProps {
  user: { id: string; email: string; name: string | null };
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function ProfileForm({ user }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email,
    phone: '',
    company: '',
    role: '',
  });
  const [notifPrefs, setNotifPrefs] = useState({
    incidents: true,
    billing: true,
    security: true,
    reports: false,
    newsletter: false,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-text">Profile & Settings</h1>
        <p className="text-text-muted mt-1">Manage your account information and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-white/4 border border-white/10 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-accent/15 text-accent border border-accent/25'
                : 'text-text-muted hover:text-text'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/4 border border-white/10 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-accent to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {(form.name || form.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-text">{form.name || 'Your Name'}</p>
                <p className="text-sm text-text-muted">{form.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Rajesh Kumar', type: 'text' },
                { key: 'email', label: 'Email Address', placeholder: 'you@company.com', type: 'email' },
                { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
                { key: 'company', label: 'Company', placeholder: 'Acme Corp', type: 'text' },
                { key: 'role', label: 'Job Role', placeholder: 'CTO', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-field rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold text-sm hover:from-accent-glow hover:to-purple-500 shadow-[0_0_25px_-8px_rgba(168,85,247,0.6)] transition-all"
            >
              {saved ? <><CheckCircle2 className="w-4 h-4 inline mr-1.5" />Saved!</> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Appearance & Theme Tab */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-3xl bg-white/4 border border-white/10">
          <ThemeSelector variant="full" />
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-white/4 border border-white/10 space-y-5">
            <h2 className="font-display font-semibold text-lg text-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" /> Change Password
            </h2>
            <div className="space-y-4">
              {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{label}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-field rounded-xl pr-11"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-text-muted text-sm font-medium hover:text-text hover:bg-white/8 transition-all">
              Update Password
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white/4 border border-white/10">
            <h2 className="font-display font-semibold text-lg text-text mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" /> Two-Factor Authentication
            </h2>
            <p className="text-text-muted text-sm mb-4">Add an extra layer of security to your account.</p>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/10">
              <div>
                <p className="font-medium text-sm text-text">Authenticator App</p>
                <p className="text-xs text-text-dim">Use an app like Google Authenticator</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-medium hover:bg-accent/20 transition-all">
                Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-white/4 border border-white/10 space-y-4">
          <h2 className="font-display font-semibold text-lg text-text mb-2">Email Notifications</h2>
          {[
            { key: 'incidents', label: 'Incident Alerts', desc: 'Get notified when incidents are created or resolved' },
            { key: 'billing', label: 'Billing & Invoices', desc: 'Invoice generation and payment confirmations' },
            { key: 'security', label: 'Security Alerts', desc: 'Security events, vulnerability alerts' },
            { key: 'reports', label: 'Monthly Reports', desc: 'Cost and performance reports' },
            { key: 'newsletter', label: 'Cloud Insights Newsletter', desc: 'Monthly cloud best practices and tips' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
              <div>
                <p className="font-medium text-sm text-text">{pref.label}</p>
                <p className="text-xs text-text-dim mt-0.5">{pref.desc}</p>
              </div>
              <button
                onClick={() => setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key as keyof typeof p] }))}
                className={cn(
                  'relative w-10 h-5.5 rounded-full transition-colors',
                  notifPrefs[pref.key as keyof typeof notifPrefs] ? 'bg-accent' : 'bg-white/15'
                )}
              >
                <div className={cn(
                  'absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform shadow-sm',
                  notifPrefs[pref.key as keyof typeof notifPrefs] && 'translate-x-4.5'
                )} />
              </button>
            </div>
          ))}
          <button className="mt-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white text-sm font-semibold shadow-[0_0_25px_-8px_rgba(168,85,247,0.6)] transition-all hover:from-accent-glow">
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}
