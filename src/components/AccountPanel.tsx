import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  isConfigured, signUp, logIn, logInWithGoogle, logOutUser, onAuthChange,
  saveToCloud, loadFromCloud,
} from '../services/firebase';
import type { ShoppingItem, DietaryTag, WeeklyMealPlan, Meal } from '../types';

interface AccountPanelProps {
  // Current local data to sync
  shoppingList: ShoppingItem[];
  dietaryFilters: DietaryTag[];
  // Callbacks to load cloud data into app
  onCloudDataLoaded: (data: {
    shoppingList?: ShoppingItem[];
    dietaryFilters?: DietaryTag[];
    savedMeals?: Meal[];
    mealPlan?: WeeklyMealPlan;
  }) => void;
  onSyncStatusChange: (syncing: boolean) => void;
}

export function AccountPanel({ shoppingList, dietaryFilters, onCloudDataLoaded, onSyncStatusChange }: AccountPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    return onAuthChange((u) => setUser(u));
  }, []);

  if (!isConfigured) {
    return (
      <div className="account-panel">
        <div className="account-not-configured">
          <h3>Accounts</h3>
          <p>Account sync is not set up yet. All your data is saved locally on this device.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await logIn(email, password);
      }
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      // Clean up Firebase error messages
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await logInWithGoogle();
      setShowAuth(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logOutUser();
    setUser(null);
  };

  const handleSyncUp = async () => {
    if (!user) return;
    setSyncing(true);
    onSyncStatusChange(true);
    try {
      await saveToCloud(user.uid, {
        shoppingList,
        dietaryFilters,
      });
      setLastSync(new Date().toLocaleTimeString());
    } catch {
      setError('Failed to sync. Please try again.');
    } finally {
      setSyncing(false);
      onSyncStatusChange(false);
    }
  };

  const handleSyncDown = async () => {
    if (!user) return;
    setSyncing(true);
    onSyncStatusChange(true);
    try {
      const data = await loadFromCloud(user.uid);
      if (data) {
        onCloudDataLoaded({
          shoppingList: data.shoppingList,
          dietaryFilters: data.dietaryFilters,
          savedMeals: data.savedMeals,
          mealPlan: data.mealPlan,
        });
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch {
      setError('Failed to load cloud data.');
    } finally {
      setSyncing(false);
      onSyncStatusChange(false);
    }
  };

  // Logged in view
  if (user) {
    return (
      <div className="account-panel">
        <div className="account-user">
          <div className="account-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="avatar-img" />
            ) : (
              <span className="avatar-letter">{(user.email || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="account-info">
            <span className="account-name">{user.displayName || user.email}</span>
            <span className="account-email">{user.email}</span>
          </div>
        </div>

        <div className="sync-actions">
          <button className="sync-btn upload" onClick={handleSyncUp} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Save to Cloud'}
          </button>
          <button className="sync-btn download" onClick={handleSyncDown} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Load from Cloud'}
          </button>
        </div>

        {lastSync && (
          <p className="last-sync">Last synced: {lastSync}</p>
        )}

        {error && <p className="account-error">{error}</p>}

        <button className="account-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    );
  }

  // Logged out view
  return (
    <div className="account-panel">
      <h3>Account</h3>
      <p className="account-desc">
        Sign in to sync your shopping lists, meals, and preferences across devices.
      </p>

      {!showAuth ? (
        <div className="account-buttons">
          <button className="account-btn google" onClick={handleGoogleLogin} disabled={loading}>
            Sign in with Google
          </button>
          <button className="account-btn email" onClick={() => { setShowAuth(true); setIsSignUp(false); }}>
            Sign in with Email
          </button>
          <button className="account-btn signup" onClick={() => { setShowAuth(true); setIsSignUp(true); }}>
            Create Account
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h4>{isSignUp ? 'Create Account' : 'Sign In'}</h4>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="account-error">{error}</p>}
          <div className="auth-form-actions">
            <button type="submit" className="account-btn primary" disabled={loading}>
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            <button type="button" className="account-btn" onClick={() => { setShowAuth(false); setError(''); }}>
              Cancel
            </button>
          </div>
          <p className="auth-switch">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" className="auth-switch-btn" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
