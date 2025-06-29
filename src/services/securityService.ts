import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

// ==================== CLIENT-SIDE SECURITY CONFIGURATION ====================
// Note: Only non-sensitive configuration exposed to client
const CLIENT_SECURITY_CONFIG = {
  // UI/UX Settings
  SESSION_WARNING_TIME: 5 * 60 * 1000, // 5 minutes before session expires
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
  
  // Client-side validation limits (server enforces actual limits)
  MIN_PASSWORD_LENGTH: 12,
  MAX_PASSWORD_LENGTH: 128,
  
  // Biometric collection settings
  KEYSTROKE_SAMPLE_SIZE: 50,
  MOUSE_SAMPLE_SIZE: 100,
  TOUCH_SAMPLE_SIZE: 30,
  
  // Device fingerprint components (non-sensitive)
  COLLECT_SCREEN_INFO: true,
  COLLECT_TIMEZONE: true,
  COLLECT_LANGUAGE: true,
  COLLECT_PLATFORM: true,
  
  // Security UI settings
  SHOW_SECURITY_INDICATORS: true,
  ENABLE_SECURITY_NOTIFICATIONS: true,
  AUTO_LOCK_ON_INACTIVITY: true,
  INACTIVITY_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  
  // Triple Radial Lock settings
  LOCK_ALIGNMENT_TOLERANCE: 5, // degrees
  MAX_LOCK_ATTEMPTS: 10,
  LOCK_RESET_DELAY: 30 * 60 * 1000, // 30 minutes
  
  // Rate limiting (client-side hints)
  MAX_LOGIN_ATTEMPTS_PER_MINUTE: 5,
  MAX_API_CALLS_PER_MINUTE: 60,
  
  // Geographic security
  ALLOWED_COUNTRIES: [
    'US', 'CA', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI',
    'AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'TW', 'IN', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY'
  ],
  
  // Encryption settings
  ENCRYPTION_ALGORITHM: 'AES',
  HASH_ITERATIONS: 10000,
};

// ==================== TYPES ====================
interface SecurityEvent {
  type: 'login_attempt' | 'api_call' | 'session_activity' | 'device_change' | 'suspicious_activity' | 'lock_attempt' | 'mfa_attempt';
  timestamp: Date;
  success?: boolean;
  riskScore?: number;
  metadata?: Record<string, any>;
}

interface DeviceFingerprint {
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  webglRenderer?: string;
  canvasFingerprint?: string;
  audioFingerprint?: string;
  fontFingerprint?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connectionType?: string;
}

interface BiometricData {
  keystrokeDynamics: Array<{
    key: string;
    downTime: number;
    upTime: number;
    dwellTime: number;
    flightTime?: number;
  }>;
  mouseBehavior: Array<{
    x: number;
    y: number;
    timestamp: number;
    velocity?: number;
    acceleration?: number;
  }>;
  touchPatterns?: Array<{
    x: number;
    y: number;
    pressure: number;
    size: number;
    timestamp: number;
  }>;
}

interface SecurityLock {
  id: string;
  type: 'authentication' | 'authorization' | 'encryption';
  status: 'locked' | 'unlocked';
  angle: number;
  requiredAngle: number;
  lastAttempt: Date;
  attempts: number;
}

interface SecurityValidationResult {
  success: boolean;
  requiresMFA: boolean;
  requiresDeviceVerification: boolean;
  requiresLockAlignment: boolean;
  locks?: SecurityLock[];
  riskScore: number;
  message: string;
  sessionToken?: string;
  expiresAt?: Date;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  riskAssessment?: {
    score: number;
    factors: string[];
    recommendation: 'allow' | 'challenge' | 'deny';
  };
}

interface GeographicLocation {
  country: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// ==================== ENTERPRISE SECURITY CLIENT ====================
class EnterpriseSecurityClient {
  private biometricCollector: BiometricCollector;
  private deviceFingerprinter: DeviceFingerprinter;
  private sessionManager: SessionManager;
  private securityMonitor: SecurityMonitor;
  private tripleRadialLock: TripleRadialLockManager;
  private geographicSecurity: GeographicSecurityManager;
  private encryptionManager: EncryptionManager;
  private rateLimiter: RateLimiter;
  private originalConsole: Console;
  
  constructor() {
    // Store original console before any modifications
    this.originalConsole = { ...console };
    
    this.biometricCollector = new BiometricCollector();
    this.deviceFingerprinter = new DeviceFingerprinter();
    this.sessionManager = new SessionManager();
    this.securityMonitor = new SecurityMonitor();
    this.tripleRadialLock = new TripleRadialLockManager();
    this.geographicSecurity = new GeographicSecurityManager();
    this.encryptionManager = new EncryptionManager();
    this.rateLimiter = new RateLimiter();
    
    this.initializeSecurityMonitoring();
  }

  // ==================== PUBLIC AUTHENTICATION METHODS ====================
  
  async authenticateUser(email: string, password: string, totpCode?: string): Promise<SecurityValidationResult> {
    try {
      // Check rate limiting
      if (!this.rateLimiter.checkLimit('login', email)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Check geographic security
      const geoCheck = await this.geographicSecurity.validateLocation();
      if (!geoCheck.allowed) {
        throw new Error(`Access denied from your current location: ${geoCheck.country}`);
      }

      // Collect security context
      const deviceFingerprint = await this.deviceFingerprinter.generateFingerprint();
      const biometricData = this.biometricCollector.getCurrentBiometrics();
      const securityContext = this.securityMonitor.getSecurityContext();
      
      // Encrypt sensitive data
      const encryptedPassword = this.encryptionManager.encrypt(password);
      
      // Prepare authentication request
      const authRequest = {
        email,
        password: encryptedPassword,
        totpCode,
        deviceFingerprint,
        biometricData,
        securityContext,
        location: geoCheck.location,
        timestamp: new Date().toISOString()
      };

      // For demo purposes, simulate server response
      const response = await this.simulateServerAuthentication(authRequest);
      
      if (response.success) {
        if (response.requiresLockAlignment) {
          // Initialize triple radial locks
          const locks = await this.tripleRadialLock.initializeLocks(email);
          return {
            ...response,
            locks
          };
        }

        if (response.sessionToken) {
          // Initialize secure session
          await this.sessionManager.initializeSession(response.sessionToken, response.expiresAt!);
          
          // Start security monitoring
          this.securityMonitor.startMonitoring();
        }
      }
      
      // Log authentication attempt
      this.logSecurityEvent({
        type: 'login_attempt',
        timestamp: new Date(),
        success: response.success,
        riskScore: response.riskScore,
        metadata: { email, requiresMFA: response.requiresMFA, requiresLockAlignment: response.requiresLockAlignment }
      });
      
      return response;
      
    } catch (error) {
      this.logSecurityEvent({
        type: 'login_attempt',
        timestamp: new Date(),
        success: false,
        riskScore: 100,
        metadata: { email, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      throw error;
    }
  }

  async alignSecurityLock(lockType: SecurityLock['type'], angle: number): Promise<{
    success: boolean;
    lock: SecurityLock;
    allLocksAligned: boolean;
    message: string;
  }> {
    return await this.tripleRadialLock.attemptAlignment(lockType, angle);
  }

  async resetSecurityLocks(): Promise<SecurityLock[]> {
    return await this.tripleRadialLock.resetLocks();
  }

  async getSecurityLocks(): Promise<SecurityLock[]> {
    return this.tripleRadialLock.getLocks();
  }

  async verifyMFA(code: string, method: 'totp' | 'sms' | 'email'): Promise<SecurityValidationResult> {
    const deviceFingerprint = await this.deviceFingerprinter.generateFingerprint();
    
    // Simulate MFA verification
    const isValid = this.validateTOTPCode(code); // Simple validation for demo
    
    const result: SecurityValidationResult = {
      success: isValid,
      requiresMFA: false,
      requiresDeviceVerification: false,
      requiresLockAlignment: false,
      riskScore: isValid ? 0 : 80,
      message: isValid ? 'MFA verification successful' : 'Invalid MFA code'
    };

    this.logSecurityEvent({
      type: 'mfa_attempt',
      timestamp: new Date(),
      success: isValid,
      riskScore: result.riskScore,
      metadata: { method, code: code.replace(/./g, '*') }
    });
    
    return result;
  }

  async verifyDevice(verificationCode: string): Promise<SecurityValidationResult> {
    const deviceFingerprint = await this.deviceFingerprinter.generateFingerprint();
    
    // Simulate device verification
    const isValid = verificationCode.length === 6 && /^\d+$/.test(verificationCode);
    
    if (isValid) {
      // Mark device as trusted
      await this.deviceFingerprinter.markDeviceAsTrusted();
    }
    
    return {
      success: isValid,
      requiresMFA: false,
      requiresDeviceVerification: false,
      requiresLockAlignment: false,
      riskScore: isValid ? 0 : 70,
      message: isValid ? 'Device verified successfully' : 'Invalid verification code'
    };
  }

  async logout(): Promise<void> {
    try {
      // Clear session data
      await this.sessionManager.destroySession();
      this.securityMonitor.stopMonitoring();
      this.biometricCollector.clearData();
      this.tripleRadialLock.clearLocks();
      this.rateLimiter.clearLimits();
      
      this.logSecurityEvent({
        type: 'session_activity',
        timestamp: new Date(),
        success: true,
        metadata: { action: 'logout' }
      });
    } catch (error) {
      this.originalConsole.warn('Logout cleanup failed:', error);
    }
  }

  // ==================== SESSION MANAGEMENT ====================
  
  async validateSession(): Promise<boolean> {
    return await this.sessionManager.isSessionValid();
  }

  async refreshSession(): Promise<boolean> {
    const deviceFingerprint = await this.deviceFingerprinter.generateFingerprint();
    
    // Simulate session refresh
    const newToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    await this.sessionManager.updateSession(newToken, expiresAt);
    return true;
  }

  // ==================== SECURITY MONITORING ====================
  
  private initializeSecurityMonitoring(): void {
    // Monitor for suspicious activity
    this.securityMonitor.onSuspiciousActivity((event) => {
      this.handleSuspiciousActivity(event);
    });
    
    // Monitor session health
    this.sessionManager.onSessionWarning(() => {
      this.showSessionWarning();
    });
    
    this.sessionManager.onSessionExpired(() => {
      this.handleSessionExpired();
    });

    // Initialize console protection
    this.initializeConsoleProtection();
  }

  private initializeConsoleProtection(): void {
    // Disable console for non-admin users
    Object.keys(console).forEach(key => {
      (console as any)[key] = (...args: any[]) => {
        const user = this.getCurrentUser();
        if (user?.role === 'admin') {
          (this.originalConsole as any)[key](...args);
        } else {
          this.logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: new Date(),
            success: false,
            riskScore: 70,
            metadata: { action: 'Console access attempt', method: key }
          });
        }
      };
    });

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      const user = this.getCurrentUser();
      if (user?.role !== 'admin') {
        e.preventDefault();
        this.logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date(),
          success: false,
          riskScore: 40,
          metadata: { action: 'Right-click attempted' }
        });
      }
    });

    // Disable developer shortcuts
    document.addEventListener('keydown', (e) => {
      const user = this.getCurrentUser();
      if (user?.role !== 'admin') {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          this.logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: new Date(),
            success: false,
            riskScore: 80,
            metadata: { action: 'DevTools shortcut attempted', key: e.key }
          });
        }
      }
    });
  }

  private async handleSuspiciousActivity(event: SecurityEvent): Promise<void> {
    // Log the event
    this.logSecurityEvent(event);
    
    // Take action based on risk score
    if (event.riskScore && event.riskScore > 80) {
      // High risk - force logout
      await this.logout();
      if (typeof window !== 'undefined') {
        alert('Suspicious activity detected. You have been logged out for security.');
        window.location.href = '/login';
      }
    } else if (event.riskScore && event.riskScore > 60) {
      // Medium risk - show warning
      if (CLIENT_SECURITY_CONFIG.ENABLE_SECURITY_NOTIFICATIONS) {
        this.originalConsole.warn('Security warning: Unusual activity detected');
      }
    }
  }

  private showSessionWarning(): void {
    if (CLIENT_SECURITY_CONFIG.ENABLE_SECURITY_NOTIFICATIONS) {
      this.originalConsole.warn('Session expiring soon. Please save your work.');
      // In a real app, show a toast notification
    }
  }

  private async handleSessionExpired(): Promise<void> {
    // Attempt to refresh session
    const refreshed = await this.refreshSession();
    
    if (!refreshed) {
      // Force logout
      await this.logout();
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // ==================== UTILITY METHODS ====================
  
  async getSecurityStatus(): Promise<{
    sessionValid: boolean;
    deviceTrusted: boolean;
    riskScore: number;
    lastActivity: Date;
    locksAligned: boolean;
    location: GeographicLocation | null;
  }> {
    const sessionValid = await this.sessionManager.isSessionValid();
    const deviceTrusted = await this.deviceFingerprinter.isDeviceTrusted();
    const locks = this.tripleRadialLock.getLocks();
    const locksAligned = locks.every(lock => lock.status === 'unlocked');
    const location = await this.geographicSecurity.getCurrentLocation();
    
    // Calculate overall risk score
    let riskScore = 0;
    if (!sessionValid) riskScore += 30;
    if (!deviceTrusted) riskScore += 25;
    if (!locksAligned) riskScore += 20;
    if (!location || !CLIENT_SECURITY_CONFIG.ALLOWED_COUNTRIES.includes(location.country)) riskScore += 25;
    
    return {
      sessionValid,
      deviceTrusted,
      riskScore,
      lastActivity: this.securityMonitor.getLastActivity(),
      locksAligned,
      location
    };
  }

  async validateSecurityCompliance(userId: string): Promise<{
    compliant: boolean;
    issues: string[];
    riskScore: number;
  }> {
    const status = await this.getSecurityStatus();
    const issues: string[] = [];
    
    if (!status.sessionValid) issues.push('Session expired');
    if (!status.deviceTrusted) issues.push('Device not trusted');
    if (!status.locksAligned) issues.push('Security locks not aligned');
    if (status.location && !CLIENT_SECURITY_CONFIG.ALLOWED_COUNTRIES.includes(status.location.country)) {
      issues.push('Access from restricted location');
    }
    
    return {
      compliant: issues.length === 0,
      issues,
      riskScore: status.riskScore
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private getCurrentUser(): any {
    // Integration with auth service
    return (window as any).authService?.getUserProfile();
  }

  private async simulateServerAuthentication(request: any): Promise<SecurityValidationResult> {
    // Simulate server-side authentication logic
    const { email, password, deviceFingerprint, biometricData, location } = request;
    
    // Basic validation
    if (!email || !password) {
      return {
        success: false,
        requiresMFA: false,
        requiresDeviceVerification: false,
        requiresLockAlignment: false,
        riskScore: 100,
        message: 'Invalid credentials'
      };
    }

    // Check if device is new
    const isNewDevice = !(await this.deviceFingerprinter.isDeviceTrusted());
    
    // Calculate risk score
    let riskScore = 0;
    if (isNewDevice) riskScore += 40;
    if (location && !CLIENT_SECURITY_CONFIG.ALLOWED_COUNTRIES.includes(location.country)) riskScore += 30;
    if (!biometricData.keystrokeDynamics.length) riskScore += 20;
    
    // Determine authentication flow
    if (riskScore > 60 || isNewDevice) {
      return {
        success: false,
        requiresMFA: false,
        requiresDeviceVerification: isNewDevice,
        requiresLockAlignment: true,
        riskScore,
        message: isNewDevice ? 'New device detected. Security verification required.' : 'Security verification required.'
      };
    }

    // Successful authentication
    return {
      success: true,
      requiresMFA: false,
      requiresDeviceVerification: false,
      requiresLockAlignment: false,
      riskScore: 0,
      message: 'Authentication successful',
      sessionToken: this.generateSessionToken(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };
  }

  private generateSessionToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private validateTOTPCode(code: string): boolean {
    // Simple validation for demo - in production, use proper TOTP validation
    return code.length === 6 && /^\d+$/.test(code);
  }

  private logSecurityEvent(event: SecurityEvent): void {
    // Store in memory only (not localStorage due to privacy)
    if (typeof window !== 'undefined') {
      (window as any).__securityEvents = (window as any).__securityEvents || [];
      (window as any).__securityEvents.push(event);
      
      // Keep only last 100 events
      if ((window as any).__securityEvents.length > 100) {
        (window as any).__securityEvents.shift();
      }
    }

    // Use original console to prevent recursion
    this.originalConsole.log('Security Event:', event);
  }
}

// ==================== BIOMETRIC COLLECTOR ====================
class BiometricCollector {
  private keystrokeData: BiometricData['keystrokeDynamics'] = [];
  private mouseData: BiometricData['mouseBehavior'] = [];
  private touchData: BiometricData['touchPatterns'] = [];
  private keyDownTimes: Map<string, number> = new Map();
  private lastKeyUpTime: number = 0;

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    if (typeof document === 'undefined') return;

    // Keystroke dynamics
    document.addEventListener('keydown', (e) => {
      this.keyDownTimes.set(e.key, performance.now());
    });

    document.addEventListener('keyup', (e) => {
      const downTime = this.keyDownTimes.get(e.key);
      if (downTime) {
        const upTime = performance.now();
        const dwellTime = upTime - downTime;
        const flightTime = this.lastKeyUpTime > 0 ? downTime - this.lastKeyUpTime : undefined;
        
        this.keystrokeData.push({
          key: e.key,
          downTime,
          upTime,
          dwellTime,
          flightTime
        });
        
        this.lastKeyUpTime = upTime;
        this.keyDownTimes.delete(e.key);
        
        // Keep only recent data
        if (this.keystrokeData.length > CLIENT_SECURITY_CONFIG.KEYSTROKE_SAMPLE_SIZE) {
          this.keystrokeData.shift();
        }
      }
    });

    // Mouse behavior
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      const lastPoint = this.mouseData[this.mouseData.length - 1];
      
      let velocity = 0;
      let acceleration = 0;
      
      if (lastPoint) {
        const timeDiff = now - lastPoint.timestamp;
        const distance = Math.sqrt(Math.pow(e.clientX - lastPoint.x, 2) + Math.pow(e.clientY - lastPoint.y, 2));
        velocity = distance / timeDiff;
        
        if (lastPoint.velocity) {
          acceleration = (velocity - lastPoint.velocity) / timeDiff;
        }
      }
      
      this.mouseData.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
        velocity,
        acceleration
      });
      
      // Keep only recent data
      if (this.mouseData.length > CLIENT_SECURITY_CONFIG.MOUSE_SAMPLE_SIZE) {
        this.mouseData.shift();
      }
    });

    // Touch patterns (mobile)
    document.addEventListener('touchstart', (e) => {
      Array.from(e.touches).forEach(touch => {
        this.touchData.push({
          x: touch.clientX,
          y: touch.clientY,
          pressure: (touch as any).force || 1,
          size: (touch as any).radiusX || 10,
          timestamp: performance.now()
        });
      });
      
      // Keep only recent data
      if (this.touchData.length > CLIENT_SECURITY_CONFIG.TOUCH_SAMPLE_SIZE) {
        this.touchData.shift();
      }
    });
  }

  getCurrentBiometrics(): BiometricData {
    return {
      keystrokeDynamics: [...this.keystrokeData],
      mouseBehavior: [...this.mouseData],
      touchPatterns: [...this.touchData]
    };
  }

  clearData(): void {
    this.keystrokeData = [];
    this.mouseData = [];
    this.touchData = [];
    this.keyDownTimes.clear();
    this.lastKeyUpTime = 0;
  }
}

// ==================== DEVICE FINGERPRINTER ====================
class DeviceFingerprinter {
  private cachedFingerprint: DeviceFingerprint | null = null;
  private deviceTrusted: boolean = false;

  async generateFingerprint(): Promise<DeviceFingerprint> {
    if (this.cachedFingerprint) {
      return this.cachedFingerprint;
    }

    const fingerprint: DeviceFingerprint = {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      connectionType: (navigator as any).connection?.effectiveType
    };

    // Add optional fingerprinting data
    try {
      fingerprint.webglRenderer = this.getWebGLFingerprint();
      fingerprint.canvasFingerprint = this.getCanvasFingerprint();
      fingerprint.audioFingerprint = await this.getAudioFingerprint();
      fingerprint.fontFingerprint = this.getFontFingerprint();
    } catch (error) {
      // Silently fail if fingerprinting is blocked
    }

    this.cachedFingerprint = fingerprint;
    return fingerprint;
  }

  async isDeviceTrusted(): Promise<boolean> {
    return this.deviceTrusted;
  }

  async markDeviceAsTrusted(): Promise<void> {
    this.deviceTrusted = true;
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return `${vendor}~${renderer}`;
      }
      
      return 'webgl-limited';
    } catch {
      return 'webgl-error';
    }
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Enterprise Security 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Client Fingerprint', 4, 17);
      
      return canvas.toDataURL().slice(-50); // Last 50 chars to avoid huge strings
    } catch {
      return 'canvas-error';
    }
  }

  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;
      
      gainNode.gain.value = 0;
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      oscillator.stop();
      await audioContext.close();
      
      return Array.from(frequencyData).slice(0, 20).join('');
    } catch {
      return 'audio-error';
    }
  }

  private getFontFingerprint(): string {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Trebuchet MS'
    ];
    
    const availableFonts: string[] = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 'no-canvas';
    
    testFonts.forEach(font => {
      context.font = `${testSize} ${font}, monospace`;
      const fontWidth = context.measureText(testString).width;
      
      context.font = `${testSize} monospace`;
      const monoWidth = context.measureText(testString).width;
      
      if (fontWidth !== monoWidth) {
        availableFonts.push(font);
      }
    });
    
    return availableFonts.slice(0, 5).join(','); // Limit to prevent huge strings
  }
}

// ==================== SESSION MANAGER ====================
class SessionManager {
  private sessionToken: string | null = null;
  private expiresAt: Date | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private expirationTimer: NodeJS.Timeout | null = null;
  private sessionWarningCallbacks: (() => void)[] = [];
  private sessionExpiredCallbacks: (() => void)[] = [];

  async initializeSession(token: string, expiresAt: Date): Promise<void> {
    this.sessionToken = token;
    this.expiresAt = expiresAt;
    
    this.setupTimers();
  }

  async updateSession(token: string, expiresAt: Date): Promise<void> {
    this.sessionToken = token;
    this.expiresAt = expiresAt;
    
    this.clearTimers();
    this.setupTimers();
  }

  async isSessionValid(): Promise<boolean> {
    if (!this.sessionToken || !this.expiresAt) {
      return false;
    }
    
    return new Date() < this.expiresAt;
  }

  async destroySession(): Promise<void> {
    this.sessionToken = null;
    this.expiresAt = null;
    this.clearTimers();
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  onSessionWarning(callback: () => void): void {
    this.sessionWarningCallbacks.push(callback);
  }

  onSessionExpired(callback: () => void): void {
    this.sessionExpiredCallbacks.push(callback);
  }

  private setupTimers(): void {
    if (!this.expiresAt) return;
    
    const now = new Date().getTime();
    const expirationTime = this.expiresAt.getTime();
    const warningTime = expirationTime - CLIENT_SECURITY_CONFIG.SESSION_WARNING_TIME;
    
    if (warningTime > now) {
      this.warningTimer = setTimeout(() => {
        this.sessionWarningCallbacks.forEach(callback => callback());
      }, warningTime - now);
    }
    
    if (expirationTime > now) {
      this.expirationTimer = setTimeout(() => {
        this.sessionExpiredCallbacks.forEach(callback => callback());
      }, expirationTime - now);
    }
  }

  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }
}

// ==================== SECURITY MONITOR ====================
class SecurityMonitor {
  private isMonitoring = false;
  private lastActivity = new Date();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private suspiciousActivityCallbacks: ((event: SecurityEvent) => void)[] = [];

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupActivityListeners();
    this.setupInactivityTimer();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.clearInactivityTimer();
  }

  onSuspiciousActivity(callback: (event: SecurityEvent) => void): void {
    this.suspiciousActivityCallbacks.push(callback);
  }

  getSecurityContext(): Record<string, any> {
    return {
      lastActivity: this.lastActivity,
      isMonitoring: this.isMonitoring,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screenSize: {
        width: screen.width,
        height: screen.height
      }
    };
  }

  getLastActivity(): Date {
    return this.lastActivity;
  }

  private setupActivityListeners(): void {
    const updateActivity = () => {
      this.lastActivity = new Date();
      this.resetInactivityTimer();
    };

    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('scroll', updateActivity);
    document.addEventListener('touchstart', updateActivity);
  }

  private setupInactivityTimer(): void {
    this.inactivityTimer = setTimeout(() => {
      this.reportSuspiciousActivity({
        type: 'suspicious_activity',
        timestamp: new Date(),
        riskScore: 60,
        metadata: {
          reason: 'User inactivity timeout',
          lastActivity: this.lastActivity
        }
      });
    }, CLIENT_SECURITY_CONFIG.INACTIVITY_TIMEOUT);
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    this.setupInactivityTimer();
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private reportSuspiciousActivity(event: SecurityEvent): void {
    this.suspiciousActivityCallbacks.forEach(callback => callback(event));
  }
}

// ==================== TRIPLE RADIAL LOCK MANAGER ====================
class TripleRadialLockManager {
  private locks: SecurityLock[] = [];
  private userId: string | null = null;

  async initializeLocks(userId: string): Promise<SecurityLock[]> {
    this.userId = userId;
    
    this.locks = [
      {
        id: `${userId}_auth`,
        type: 'authentication',
        status: 'locked',
        angle: 0,
        requiredAngle: Math.floor(Math.random() * 360),
        lastAttempt: new Date(),
        attempts: 0
      },
      {
        id: `${userId}_authz`,
        type: 'authorization',
        status: 'locked',
        angle: 0,
        requiredAngle: Math.floor(Math.random() * 360),
        lastAttempt: new Date(),
        attempts: 0
      },
      {
        id: `${userId}_encrypt`,
        type: 'encryption',
        status: 'locked',
        angle: 0,
        requiredAngle: Math.floor(Math.random() * 360),
        lastAttempt: new Date(),
        attempts: 0
      }
    ];

    // Store in Firestore for persistence
    try {
      await setDoc(doc(db, 'securityLocks', userId), {
        locks: this.locks.map(lock => ({
          ...lock,
          lastAttempt: Timestamp.fromDate(lock.lastAttempt)
        })),
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.warn('Failed to store security locks:', error);
    }

    return this.locks;
  }

  async attemptAlignment(lockType: SecurityLock['type'], angle: number): Promise<{
    success: boolean;
    lock: SecurityLock;
    allLocksAligned: boolean;
    message: string;
  }> {
    const lock = this.locks.find(l => l.type === lockType);
    
    if (!lock) {
      throw new Error('Security lock not found');
    }

    // Check for too many attempts
    if (lock.attempts >= CLIENT_SECURITY_CONFIG.MAX_LOCK_ATTEMPTS) {
      throw new Error('Too many attempts. Please reset locks.');
    }

    // Calculate angle tolerance
    const tolerance = CLIENT_SECURITY_CONFIG.LOCK_ALIGNMENT_TOLERANCE;
    const angleDiff = Math.abs(angle - lock.requiredAngle);
    const isAligned = angleDiff <= tolerance || angleDiff >= (360 - tolerance);

    lock.angle = angle;
    lock.attempts += 1;
    lock.lastAttempt = new Date();

    if (isAligned) {
      lock.status = 'unlocked';
    }

    // Update in Firestore
    if (this.userId) {
      try {
        await updateDoc(doc(db, 'securityLocks', this.userId), {
          locks: this.locks.map(l => ({
            ...l,
            lastAttempt: Timestamp.fromDate(l.lastAttempt)
          })),
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.warn('Failed to update security locks:', error);
      }
    }

    const allLocksAligned = this.locks.every(l => l.status === 'unlocked');

    return {
      success: isAligned,
      lock,
      allLocksAligned,
      message: isAligned 
        ? `${lockType} lock aligned successfully` 
        : `Lock alignment failed. ${CLIENT_SECURITY_CONFIG.MAX_LOCK_ATTEMPTS - lock.attempts} attempts remaining.`
    };
  }

  async resetLocks(): Promise<SecurityLock[]> {
    if (!this.userId) {
      throw new Error('No user ID set for lock reset');
    }

    return await this.initializeLocks(this.userId);
  }

  getLocks(): SecurityLock[] {
    return [...this.locks];
  }

  clearLocks(): void {
    this.locks = [];
    this.userId = null;
  }
}

// ==================== GEOGRAPHIC SECURITY MANAGER ====================
class GeographicSecurityManager {
  private cachedLocation: GeographicLocation | null = null;

  async validateLocation(): Promise<{
    allowed: boolean;
    country: string;
    location: GeographicLocation | null;
  }> {
    try {
      const location = await this.getCurrentLocation();
      const allowed = CLIENT_SECURITY_CONFIG.ALLOWED_COUNTRIES.includes(location.country);
      
      return {
        allowed,
        country: location.country,
        location
      };
    } catch (error) {
      // If we can't determine location, allow but log the issue
      return {
        allowed: true,
        country: 'unknown',
        location: null
      };
    }
  }

  async getCurrentLocation(): Promise<GeographicLocation> {
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      // Try to get IP-based location
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      this.cachedLocation = {
        country: data.country_code || 'unknown',
        city: data.city || 'unknown',
        region: data.region || 'unknown',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      return this.cachedLocation;
    } catch (error) {
      // Fallback to basic timezone-based detection
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const country = this.guessCountryFromTimezone(timezone);
      
      this.cachedLocation = {
        country,
        city: 'unknown',
        region: 'unknown',
        latitude: 0,
        longitude: 0,
        timezone
      };
      
      return this.cachedLocation;
    }
  }

  private guessCountryFromTimezone(timezone: string): string {
    // Simple timezone to country mapping
    const timezoneMap: Record<string, string> = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Seoul': 'KR',
      'Australia/Sydney': 'AU',
      'America/Toronto': 'CA',
      'America/Sao_Paulo': 'BR'
    };
    
    return timezoneMap[timezone] || 'unknown';
  }
}

// ==================== ENCRYPTION MANAGER ====================
class EncryptionManager {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
  }

  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  private generateEncryptionKey(): string {
    // In production, this would be derived from secure sources
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
}

// ==================== RATE LIMITER ====================
class RateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();

  checkLimit(type: string, identifier: string): boolean {
    const key = `${type}_${identifier}`;
    const now = Date.now();
    
    let limit = this.limits.get(key);
    
    if (!limit || now > limit.resetTime) {
      limit = { count: 0, resetTime: now + 60000 }; // 1 minute window
    }
    
    limit.count += 1;
    this.limits.set(key, limit);
    
    const maxAttempts = type === 'login' ? CLIENT_SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS_PER_MINUTE : CLIENT_SECURITY_CONFIG.MAX_API_CALLS_PER_MINUTE;
    
    return limit.count <= maxAttempts;
  }

  clearLimits(): void {
    this.limits.clear();
  }
}

// ==================== EXPORTS ====================
export const securityService = new EnterpriseSecurityClient();

// Legacy exports for backward compatibility
export const enterpriseSecurityClient = securityService;

// Export individual components
export { 
  EnterpriseSecurityClient, 
  BiometricCollector, 
  DeviceFingerprinter, 
  SessionManager, 
  SecurityMonitor,
  TripleRadialLockManager,
  GeographicSecurityManager,
  EncryptionManager,
  RateLimiter
};

// Export types
export type { 
  SecurityEvent, 
  DeviceFingerprint, 
  BiometricData, 
  SecurityValidationResult, 
  APIResponse,
  SecurityLock,
  GeographicLocation
};

// Make security service globally available
if (typeof window !== 'undefined') {
  (window as any).securityService = securityService;
  (window as any).enterpriseSecurityClient = securityService;
}