import React, { useState, useEffect } from 'react';
import { User, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks';
import { ProfileHeader, ProfileForm, ProfileInfoCard } from '../components/profile';
import { Spinner, Alert, Button } from '../components/ui';
import profileService from '../services/profileService';

export const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await profileService.getProfile();
      if (res?.data?.data?.profile) {
        setProfile(res.data.data.profile);
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            User Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your personal profile, credentials, and organizational information.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchProfile}
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" onDismiss={() => setError('')}>
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </Alert>
      )}

      {loading && !profile ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground">Loading profile information...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <ProfileHeader user={profile} />

          {/* Grid Layout: Profile Edit Form + Organization Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProfileForm profile={profile} onProfileUpdated={handleProfileUpdated} />
            </div>

            <div className="lg:col-span-1">
              <ProfileInfoCard user={profile} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
