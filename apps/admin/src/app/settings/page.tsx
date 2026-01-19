'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import MarkdownEditor from '@/components/MarkdownEditor';

type SettingsTab = 'profile' | 'users' | 'system';

interface ProfileResponse {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  timezone: string | null;
  bio_markdown: string | null;
  avatar_media_asset_id: string | null;
  avatar_url: string | null;
}

interface SystemSettingsResponse {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  status: string;
  roles: string[];
  last_login_at: string | null;
}

const roleOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'editor', label: 'Editor' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileDraft, setProfileDraft] = useState({
    display_name: '',
    email: '',
    phone: '',
    timezone: '',
    bio_markdown: '',
    avatar_media_asset_id: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettingsResponse | null>(null);
  const [systemDraft, setSystemDraft] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
  });
  const [systemLoading, setSystemLoading] = useState(true);
  const [systemSaving, setSystemSaving] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('assistant');
  const [usersActionBusy, setUsersActionBusy] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const tabLabels = useMemo(
    () => ({
      profile: 'Профиль',
      users: 'Пользователи',
      system: 'Система',
    }),
    [],
  );

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await fetch('/api/admin/settings/profile', { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Не удалось загрузить профиль');
        }
        const data: ProfileResponse = await res.json();
        setProfile(data);
        setProfileDraft({
          display_name: data.display_name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          timezone: data.timezone ?? '',
          bio_markdown: data.bio_markdown ?? '',
          avatar_media_asset_id: data.avatar_media_asset_id ?? '',
        });
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : 'Ошибка загрузки профиля');
      } finally {
        setProfileLoading(false);
      }
    };

    const loadSystemSettings = async () => {
      setSystemLoading(true);
      setSystemError(null);
      try {
        const res = await fetch('/api/admin/settings', { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Не удалось загрузить системные настройки');
        }
        const data: SystemSettingsResponse = await res.json();
        setSystemSettings(data);
        setSystemDraft({
          maintenanceMode: data.maintenanceMode,
          registrationEnabled: data.registrationEnabled,
        });
      } catch (error) {
        setSystemError(error instanceof Error ? error.message : 'Ошибка загрузки настроек');
      } finally {
        setSystemLoading(false);
      }
    };

    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const res = await fetch('/api/admin/settings/users', { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Не удалось загрузить пользователей');
        }
        const data: AdminUser[] = await res.json();
        setUsers(data);
      } catch (error) {
        setUsersError(error instanceof Error ? error.message : 'Ошибка загрузки пользователей');
      } finally {
        setUsersLoading(false);
      }
    };

    void loadProfile();
    void loadSystemSettings();
    void loadUsers();
  }, []);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/admin/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          display_name: profileDraft.display_name.trim() || null,
          email: profileDraft.email.trim() || null,
          phone: profileDraft.phone.trim() || null,
          timezone: profileDraft.timezone.trim() || null,
          bio_markdown: profileDraft.bio_markdown.trim() || null,
          avatar_media_asset_id: profileDraft.avatar_media_asset_id.trim() || null,
        }),
      });
      if (!res.ok) {
        throw new Error('Не удалось сохранить профиль');
      }
      const data: ProfileResponse = await res.json();
      setProfile(data);
      setProfileDraft({
        display_name: data.display_name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        timezone: data.timezone ?? '',
        bio_markdown: data.bio_markdown ?? '',
        avatar_media_asset_id: data.avatar_media_asset_id ?? '',
      });
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Ошибка сохранения профиля');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSystemSave = async () => {
    setSystemSaving(true);
    setSystemError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(systemDraft),
      });
      if (!res.ok) {
        throw new Error('Не удалось сохранить системные настройки');
      }
      const data: SystemSettingsResponse = await res.json();
      setSystemSettings(data);
      setSystemDraft({
        maintenanceMode: data.maintenanceMode,
        registrationEnabled: data.registrationEnabled,
      });
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : 'Ошибка сохранения настроек');
    } finally {
      setSystemSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      return;
    }
    setUsersActionBusy(true);
    setInviteMessage(null);
    setUsersError(null);
    try {
      const res = await fetch('/api/admin/settings/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: inviteEmail.trim(), role_code: inviteRole }),
      });
      if (!res.ok) {
        throw new Error('Не удалось отправить приглашение');
      }
      await res.json();
      setInviteEmail('');
      setInviteMessage('Приглашение отправлено');
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Ошибка приглашения');
    } finally {
      setUsersActionBusy(false);
    }
  };

  const refreshUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/settings/users', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Не удалось обновить пользователей');
      }
      const data: AdminUser[] = await res.json();
      setUsers(data);
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Ошибка обновления пользователей');
    } finally {
      setUsersLoading(false);
    }
  };

  const updateUserRole = async (userId: string, roleCode: string) => {
    setUsersActionBusy(true);
    setUsersError(null);
    try {
      const res = await fetch(`/api/admin/settings/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role_code: roleCode }),
      });
      if (!res.ok) {
        throw new Error('Не удалось обновить роль');
      }
      await refreshUsers();
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Ошибка обновления роли');
    } finally {
      setUsersActionBusy(false);
    }
  };

  const updateUserStatus = async (userId: string, action: 'block' | 'unblock') => {
    setUsersActionBusy(true);
    setUsersError(null);
    try {
      const res = await fetch(`/api/admin/settings/users/${userId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Не удалось обновить статус');
      }
      await refreshUsers();
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Ошибка обновления статуса');
    } finally {
      setUsersActionBusy(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setUsersActionBusy(true);
    setUsersError(null);
    try {
      const res = await fetch(`/api/admin/settings/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Не удалось удалить пользователя');
      }
      await refreshUsers();
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Ошибка удаления пользователя');
    } finally {
      setUsersActionBusy(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner']}>
      <div className="admin-page">
        <div className="admin-page-header">
          <h1>Настройки</h1>
          <p>Профиль, пользователи и системные параметры.</p>
        </div>

        <div className="admin-tabs">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`admin-tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key as SettingsTab)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="admin-section">
            <h2>Профиль</h2>
            {profileLoading && <p>Загрузка...</p>}
            {profileError && <p className="error-text">{profileError}</p>}
            {profile && (
              <div className="admin-form">
                <label>
                  Имя
                  <input
                    type="text"
                    value={profileDraft.display_name}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, display_name: event.target.value }))}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={profileDraft.email}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>
                <label>
                  Телефон
                  <input
                    type="text"
                    value={profileDraft.phone}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </label>
                <label>
                  Таймзона
                  <input
                    type="text"
                    value={profileDraft.timezone}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, timezone: event.target.value }))}
                  />
                </label>
                <label>
                  ID фото (MediaAsset)
                  <input
                    type="text"
                    value={profileDraft.avatar_media_asset_id}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, avatar_media_asset_id: event.target.value }))}
                  />
                </label>
                {profile.avatar_url && (
                  <div className="admin-muted">
                    Текущее фото: <a href={profile.avatar_url} target="_blank" rel="noreferrer">Открыть</a>
                  </div>
                )}
                <div>
                  <label>Био</label>
                  <MarkdownEditor
                    value={profileDraft.bio_markdown}
                    onChange={(value) => setProfileDraft((prev) => ({ ...prev, bio_markdown: value }))}
                    height="320px"
                    showPreview={false}
                  />
                </div>
                <button type="button" className="admin-primary" onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving ? 'Сохранение...' : 'Сохранить профиль'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>Пользователи</h2>
            {usersLoading && <p>Загрузка...</p>}
            {usersError && <p className="error-text">{usersError}</p>}
            <div className="admin-form">
              <label>
                Email
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
              </label>
              <label>
                Роль
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="admin-primary" onClick={handleInvite} disabled={usersActionBusy}>
                Пригласить
              </button>
              {inviteMessage && <p className="admin-muted">{inviteMessage}</p>}
            </div>

            {users.length > 0 && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th>Последний вход</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div>{user.display_name ?? 'Без имени'}</div>
                        <div className="admin-muted">{user.email ?? user.phone ?? user.id}</div>
                      </td>
                      <td>
                        <select
                          value={user.roles[0] ?? 'assistant'}
                          onChange={(event) => void updateUserRole(user.id, event.target.value)}
                          disabled={usersActionBusy}
                        >
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{user.status}</td>
                      <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}</td>
                      <td>
                        <div className="admin-actions">
                          {user.status === 'blocked' ? (
                            <button
                              type="button"
                              className="admin-secondary"
                              onClick={() => void updateUserStatus(user.id, 'unblock')}
                              disabled={usersActionBusy}
                            >
                              Разблокировать
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-secondary"
                              onClick={() => void updateUserStatus(user.id, 'block')}
                              disabled={usersActionBusy}
                            >
                              Заблокировать
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-danger"
                            onClick={() => void deleteUser(user.id)}
                            disabled={usersActionBusy}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="admin-section">
            <h2>Системные настройки</h2>
            {systemLoading && <p>Загрузка...</p>}
            {systemError && <p className="error-text">{systemError}</p>}
            {systemSettings && (
              <div className="admin-form">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={systemDraft.maintenanceMode}
                    onChange={(event) => setSystemDraft((prev) => ({ ...prev, maintenanceMode: event.target.checked }))}
                  />
                  Режим обслуживания
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={systemDraft.registrationEnabled}
                    onChange={(event) => setSystemDraft((prev) => ({ ...prev, registrationEnabled: event.target.checked }))}
                  />
                  Регистрация включена
                </label>
                <button type="button" className="admin-primary" onClick={handleSystemSave} disabled={systemSaving}>
                  {systemSaving ? 'Сохранение...' : 'Сохранить настройки'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
