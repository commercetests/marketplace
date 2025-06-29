import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { securityService } from './securityService';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  company?: string;
  role: 'user' | 'admin';
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
  };
  usage?: {
    agentExecutions: number;
    flowExecutions: number;
    apiCalls: number;
    storageUsed: number;
  };
  permissions?: {
    canCreateAgents: boolean;
    canCreateFlows: boolean;
    canManageUsers: boolean;
    canAccessAnalytics: boolean;
    canManageIntegrations: boolean;
    canGenerateApiKeys: boolean;
  };
  securityProfile?: {
    deviceFingerprint?: string;
    lastSecurityCheck?: Date;
    riskScore?: number;
    trustedDevices?: string[];
    securityLockStatus?: 'locked' | 'unlocked';
  };
}

class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private authStateListeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadUserProfile(user.uid);
        
        // Perform security validation on auth state change
        await this.performSecurityValidation(user.uid);
      } else {
        this.userProfile = null;
      }
      this.notifyAuthStateListeners();
    });
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    callback(this.userProfile);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
    };
  }

  private notifyAuthStateListeners() {
    this.authStateListeners.forEach(listener => listener(this.userProfile));
  }

  private async performSecurityValidation(userId: string): Promise<void> {
    try {
      // Validate security compliance
      const compliance = await securityService.validateSecurityCompliance(userId);
      
      // Update user profile with security status
      if (this.userProfile) {
        this.userProfile.securityProfile = {
          ...this.userProfile.securityProfile,
          lastSecurityCheck: new Date(),
          riskScore: compliance.riskScore,
          securityLockStatus: compliance.compliant ? 'unlocked' : 'locked'
        };
      }
      
      // If compliance issues detected, handle accordingly
      if (!compliance.compliant && compliance.riskScore > 70) {
        console.warn('High security risk detected:', compliance.issues);
        // Could trigger additional security measures here
      }
    } catch (error) {
      console.error('Security validation failed:', error);
    }
  }

  async signUp(
    email: string, 
    password: string, 
    displayName: string, 
    role: 'user' = 'user', // Default to 'user', admins must be promoted manually
    company?: string
  ): Promise<UserProfile> {
    try {
      // Check geographic security before allowing signup
      const geoCheck = await securityService.geographicSecurity.validateLocation();
      if (!geoCheck.allowed) {
        throw new Error('Account creation not allowed from your current location.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, { displayName });

      // Parse name
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate device fingerprint
      const deviceFingerprint = await securityService.deviceFingerprinter.generateFingerprint();

      // All new users start as 'user' role with standard permissions
      // Admins must be promoted manually in Firestore by existing admins
      const permissions = {
        canCreateAgents: true,
        canCreateFlows: true,
        canManageUsers: false, // Only admins can manage users
        canAccessAnalytics: true,
        canManageIntegrations: true,
        canGenerateApiKeys: true,
      };

      // Create user document in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        firstName,
        lastName,
        company,
        role: 'user', // Always start as user
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: {
          plan: 'free',
          status: 'active'
        },
        usage: {
          agentExecutions: 0,
          flowExecutions: 0,
          apiCalls: 0,
          storageUsed: 0
        },
        permissions,
        securityProfile: {
          deviceFingerprint: JSON.stringify(deviceFingerprint),
          lastSecurityCheck: new Date(),
          riskScore: 0,
          trustedDevices: [JSON.stringify(deviceFingerprint)],
          securityLockStatus: 'locked'
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      // Initialize security locks for new user
      await securityService.tripleRadialLock.initializeLocks(user.uid);
      
      this.userProfile = userProfile;

      return userProfile;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Sign up failed');
    }
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      // Check rate limiting before attempting login
      const rateLimitOk = securityService.rateLimiter.checkLimit('login', email);
      if (!rateLimitOk) {
        throw new Error('Too many login attempts. Please try again later.');
      }



      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await this.updateLastLogin(user.uid);
      await this.loadUserProfile(user.uid);

      // Perform comprehensive security validation
      await this.performSecurityValidation(user.uid);

      return this.userProfile!;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Sign in failed');
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.currentUser) {
        // Clear security session data
        await securityService.logout();
      }
      
      await signOut(auth);
      this.userProfile = null;
      
      // Clear all local storage for security
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Sign out failed');
    }
  }

  private async loadUserProfile(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.userProfile = {
          ...data,
          createdAt: data.createdAt.toDate(),
          lastLoginAt: data.lastLoginAt.toDate(),
          securityProfile: {
            ...data.securityProfile,
            lastSecurityCheck: data.securityProfile?.lastSecurityCheck?.toDate() || new Date()
          }
        } as UserProfile;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        lastLoginAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  private async checkBruteForceAttempt(identifier: string, type: 'login' | 'password_reset'): Promise<{
    allowed: boolean;
    attemptsRemaining: number;
    lockoutTime?: number;
  }> {
    // Simple implementation for demo - in production, this would be server-side
    const key = `brute_force_${type}_${identifier}`;
    const stored = localStorage.getItem(key);
    
    let attempts = 0;
    let lastAttempt = new Date(0);
    
    if (stored) {
      const data = JSON.parse(stored);
      attempts = data.attempts || 0;
      lastAttempt = new Date(data.lastAttempt);
    }

    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - lastAttempt.getTime();
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    // Reset attempts if enough time has passed
    if (timeSinceLastAttempt > lockoutDuration) {
      attempts = 0;
    }

    // Check if account is locked
    const maxAttempts = 5;
    if (attempts >= maxAttempts) {
      const lockoutRemaining = lockoutDuration - timeSinceLastAttempt;
      
      if (lockoutRemaining > 0) {
        return {
          allowed: false,
          attemptsRemaining: 0,
          lockoutTime: lockoutRemaining
        };
      } else {
        // Reset attempts after lockout period
        attempts = 0;
      }
    }

    // Increment attempts
    attempts += 1;
    
    localStorage.setItem(key, JSON.stringify({
      attempts,
      lastAttempt: now.toISOString(),
      identifier,
      type
    }));

    return {
      allowed: attempts <= maxAttempts,
      attemptsRemaining: Math.max(0, maxAttempts - attempts)
    };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.userProfile?.role === 'admin';
  }

  hasPermission(permission: keyof UserProfile['permissions']): boolean {
    return this.userProfile?.permissions?.[permission] || false;
  }

  async updateUsage(type: 'agentExecutions' | 'flowExecutions' | 'apiCalls', increment: number = 1): Promise<void> {
    if (!this.currentUser || !this.userProfile) return;

    try {
      const newUsage = {
        ...this.userProfile.usage,
        [type]: (this.userProfile.usage?.[type] || 0) + increment
      };

      await setDoc(doc(db, 'users', this.currentUser.uid), {
        usage: newUsage
      }, { merge: true });

      this.userProfile.usage = newUsage;
    } catch (error) {
      console.error('Failed to update usage:', error);
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser || !this.userProfile) return;

    try {
      await setDoc(doc(db, 'users', this.currentUser.uid), {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });

      this.userProfile = { ...this.userProfile, ...updates };
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Admin function to promote user to admin (can only be called by existing admins)
  async promoteToAdmin(userId: string): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Only admins can promote users');
    }

    try {
      const adminPermissions = {
        canCreateAgents: true,
        canCreateFlows: true,
        canManageUsers: true,
        canAccessAnalytics: true,
        canManageIntegrations: true,
        canGenerateApiKeys: true,
      };

      await setDoc(doc(db, 'users', userId), {
        role: 'admin',
        permissions: adminPermissions,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Failed to promote user to admin:', error);
      throw new Error('Failed to promote user to admin');
    }
  }

  // Security-related methods
  async validateSecurityAccess(resource: string, action: string): Promise<boolean> {
    if (!this.currentUser || !this.userProfile) return false;

    // Use zero trust verification
    return await this.verifyZeroTrustAccess(this.currentUser.uid, resource, action);
  }

  private async verifyZeroTrustAccess(userId: string, resource: string, action: string): Promise<boolean> {
    // Every request must be verified regardless of previous authentication
    const user = this.getCurrentUser();
    if (!user || user.uid !== userId) return false;

    // Check session validity
    const sessionValid = await securityService.validateSession();
    if (!sessionValid) return false;

    // Check device trust
    const deviceTrusted = await securityService.deviceFingerprinter.isDeviceTrusted();
    if (!deviceTrusted) return false;

    // Check geographic location
    const geoCheck = await securityService.geographicSecurity.validateLocation();
    if (!geoCheck.allowed) return false;

    // Check resource-specific permissions
    const permissionCheck = this.checkResourcePermissions(userId, resource, action);
    if (!permissionCheck) return false;

    // All checks passed
    return true;
  }

  private checkResourcePermissions(userId: string, resource: string, action: string): boolean {
    // Implement fine-grained access control
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin has access to everything
    if (this.userProfile?.role === 'admin') return true;

    // Check specific resource permissions
    const permissions = this.userProfile?.permissions || {};
    
    switch (resource) {
      case 'agents':
        return action === 'read' || permissions.canCreateAgents;
      case 'flows':
        return action === 'read' || permissions.canCreateFlows;
      case 'users':
        return permissions.canManageUsers;
      case 'analytics':
        return permissions.canAccessAnalytics;
      case 'integrations':
        return permissions.canManageIntegrations;
      case 'api-keys':
        return permissions.canGenerateApiKeys;
      default:
        return false;
    }
  }

  async getSecurityStatus(): Promise<{
    compliant: boolean;
    riskScore: number;
    issues: string[];
  }> {
    if (!this.currentUser) {
      return { compliant: false, riskScore: 100, issues: ['Not authenticated'] };
    }

    return await securityService.validateSecurityCompliance(this.currentUser.uid);
  }
}

// Make auth service globally available for security integration
if (typeof window !== 'undefined') {
  (window as any).authService = new AuthService();
}

export const authService = new AuthService();
    
  
