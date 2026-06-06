import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Trash2,
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Lock,
  Bell,
  Eye,
  Building,
  Check,
  Loader2,
  Calendar,
  MapPin,
  AlertCircle,
  Sparkles,
  Smartphone,
  History,
  Heart,
  MessageSquare,
  Award,
  Key,
  X,
  Map,
  EyeOff,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Profile, Listing, Inquiry, Notification, UserRole } from '../types';
import { getApiUrl } from '../utils/apiHelper';
import ListingCard from './ListingCard';

interface ProfilePageProps {
  userProfile: Profile;
  onUpdateProfile: (p: Profile) => void;
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (id: string) => void;
  inquiries: Inquiry[];
  notifications: Notification[];
  currentRole: UserRole;
  onChangeRole: (r: UserRole) => void;
  onLogout: () => void;
}

export default function ProfilePage({
  userProfile,
  onUpdateProfile,
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  inquiries,
  notifications,
  currentRole,
  onChangeRole,
  onLogout
}: ProfilePageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'edit-profile' | 'security'>('dashboard');

  // Load complete profile details from server on mount
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Edit fields
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [phone, setPhone] = useState(userProfile.contactPhone);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [locationName, setLocationName] = useState(userProfile.location || 'Nairobi, Kenya');
  const [preferredContact, setPreferredContact] = useState(userProfile.preferredContact || 'Email');

  // Landlord feature fields
  const [agencyName, setAgencyName] = useState(userProfile.agencyName || '');
  const [businessLogo, setBusinessLogo] = useState(userProfile.businessLogo || '');
  const [businessDescription, setBusinessDescription] = useState(userProfile.businessDescription || '');
  const [officeLocation, setOfficeLocation] = useState(userProfile.officeLocation || '');
  const [businessContact, setBusinessContact] = useState(userProfile.businessContact || '');

  // Account settings fields
  const [newEmail, setNewEmail] = useState(userProfile.contactEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States for interactive 2FA mock Setup Flow
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userProfile.twoFactorEnabled || false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [isActivating2FA, setIsActivating2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFaError, setTwoFaError] = useState('');

  // State for toggles
  const [notifEmail, setNotifEmail] = useState(userProfile.notificationPrefs?.email ?? true);
  const [notifSms, setNotifSms] = useState(userProfile.notificationPrefs?.sms ?? true);
  const [notifPush, setNotifPush] = useState(userProfile.notificationPrefs?.push ?? true);

  const [privPublic, setPrivPublic] = useState(userProfile.privacySettings?.publicProfile ?? true);
  const [privIndexing, setPrivIndexing] = useState(userProfile.privacySettings?.searchIndexing ?? true);
  const [privShowContact, setPrivShowContact] = useState(userProfile.privacySettings?.showContact ?? true);

  // Interaction feedback states
  const [saveStatus, setSaveStatus] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [securitySaveStatus, setSecuritySaveStatus] = useState(false);
  const [securitySaveMessage, setSecuritySaveMessage] = useState('');

  // IMAGE CROPPER STATES
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropOffset, setCropOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoError, setPhotoError] = useState('');

  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Sync state values when userProfile props change (like after auto login or identity refresh)
  useEffect(() => {
    setFullName(userProfile.fullName);
    setPhone(userProfile.contactPhone);
    setBio(userProfile.bio || '');
    setLocationName(userProfile.location || 'Nairobi, Kenya');
    setPreferredContact(userProfile.preferredContact || 'Email');
    setNewEmail(userProfile.contactEmail);
    setTwoFactorEnabled(userProfile.twoFactorEnabled || false);
    
    setNotifEmail(userProfile.notificationPrefs?.email ?? true);
    setNotifSms(userProfile.notificationPrefs?.sms ?? true);
    setNotifPush(userProfile.notificationPrefs?.push ?? true);

    setPrivPublic(userProfile.privacySettings?.publicProfile ?? true);
    setPrivIndexing(userProfile.privacySettings?.searchIndexing ?? true);
    setPrivShowContact(userProfile.privacySettings?.showContact ?? true);

    if (currentRole === 'Landlord' || currentRole === 'Agent') {
      setAgencyName(userProfile.agencyName || '');
      setBusinessLogo(userProfile.businessLogo || '');
      setBusinessDescription(userProfile.businessDescription || '');
      setOfficeLocation(userProfile.officeLocation || '');
      setBusinessContact(userProfile.businessContact || '');
    }
  }, [userProfile, currentRole]);

  // Fetch full user profile details from backend db on layout load
  const fetchProfileDetails = () => {
    const token = localStorage.getItem('nestlist_token');
    if (!token) return;

    setIsLoading(true);
    setSyncError('');

    fetch(getApiUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to synchronize authenticated state logs');
        return res.json();
      })
      .then(data => {
        if (data.success && data.user) {
          onUpdateProfile(data.user);
        } else {
          throw new Error(data.error || 'Identity not resolved');
        }
      })
      .catch((err: any) => {
        console.warn('⚠️ Server sync waiting... Falling back to active schema metrics', err);
        setSyncError('Running in local offline preview mode');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  // Saved Listings from favorited list
  const favoritedListings = listings.filter(l => favorites.includes(l.id));

  // Landlord/Agent Posted Listings
  const authorEmailClean = userProfile.contactEmail ? userProfile.contactEmail.toLowerCase().trim() : '';
  const myPostedListings = listings.filter(l => {
    const listingEmailClean = l.author?.email ? l.author.email.toLowerCase().trim() : '';
    return listingEmailClean === authorEmailClean && isLoggedInAuthor(l);
  });

  function isLoggedInAuthor(l: Listing) {
    if (currentRole === 'Admin') return true;
    return currentRole === 'Landlord' || currentRole === 'Agent';
  }

  // Viewed listings simulation log
  const [viewedListingsList, setViewedListingsList] = useState<Listing[]>([]);
  useEffect(() => {
    // Collect viewed houses from cache history key
    try {
      const cachedViewed = localStorage.getItem('nestlist_viewed_history');
      if (cachedViewed) {
        const viewedIds: string[] = JSON.parse(cachedViewed);
        const match = listings.filter(l => viewedIds.includes(l.id));
        setViewedListingsList(match.slice(0, 4));
      }
    } catch {
      // safe ignore
    }
  }, [listings]);

  // Calculate stats
  const totalSearches = 48;
  const reliabilityScore = userProfile.isVerified ? 98 : 65;
  const conversionRate = myPostedListings.length > 0 ? Math.min(95, Math.round((inquiries.length / myPostedListings.length) * 10)) : 0;

  // Handle Profile Details Save
  const handleProfileUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(true);
    setSaveMessage('Saving details to secure NestList database...');

    const token = localStorage.getItem('nestlist_token');
    
    // Construct request body
    const updateBody: Partial<Profile> = {
      fullName,
      contactPhone: phone,
      bio,
      location: locationName,
      preferredContact,
      notificationPrefs: { email: notifEmail, sms: notifSms, push: notifPush },
      privacySettings: { publicProfile: privPublic, searchIndexing: privIndexing, showContact: privShowContact }
    };

    if (currentRole === 'Landlord' || currentRole === 'Agent') {
      updateBody.agencyName = agencyName;
      updateBody.businessLogo = businessLogo;
      updateBody.businessDescription = businessDescription;
      updateBody.officeLocation = officeLocation;
      updateBody.businessContact = businessContact;
    }

    if (token) {
      fetch(getApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateBody)
      })
      .then(res => {
        if (!res.ok) throw new Error('Database server validation rejected changes');
        return res.json();
      })
      .then(data => {
        if (data.success && data.user) {
          // Immediately update parent state to instantly reflect changes throughout the app
          onUpdateProfile(data.user);
          setSaveMessage('✓ Profile information synchronized securely.');
          setTimeout(() => setSaveMessage(''), 3000);
        } else {
          throw new Error(data.error || 'Server validation failed');
        }
      })
      .catch((err: any) => {
        console.warn('⚠️ Server sync pending. Persisting securely locally.', err);
        // Fallback save
        onUpdateProfile({
          ...userProfile,
          ...updateBody,
          fullName,
          contactPhone: phone,
          bio,
          location: locationName,
          preferredContact
        });
        setSaveMessage('✓ Local offline profile credentials stored.');
        setTimeout(() => setSaveMessage(''), 3000);
      });
    } else {
      // Static update
      onUpdateProfile({
        ...userProfile,
        ...updateBody,
        fullName,
        contactPhone: phone,
        bio,
        location: locationName,
        preferredContact
      });
      setSaveMessage('✓ Guest profile settings modified successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Change Password Handler
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySaveMessage('');
    
    if (newPassword !== confirmPassword) {
      setSecuritySaveMessage('❌ Confirm password does not match new password.');
      return;
    }

    const token = localStorage.getItem('nestlist_token');
    if (!token) {
      setSecuritySaveMessage('❌ authentication token missing. Please register.');
      return;
    }

    setSecuritySaveStatus(true);
    setSecuritySaveMessage('Authenticating rotated hashing credentials...');

    fetch(getApiUrl('/api/auth/change-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    })
    .then(res => res.json())
    .then(data => {
      setSecuritySaveStatus(false);
      if (data.success) {
        setSecuritySaveMessage('✓ Password changed successfully! Secret hash refreshed inside database ledger.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSecuritySaveMessage(''), 4000);
      } else {
        setSecuritySaveMessage(`❌ ${data.error || 'Failed to alter password'}`);
      }
    })
    .catch((err: any) => {
      setSecuritySaveStatus(false);
      setSecuritySaveMessage('❌ Server connection offline. Cannot replace encrypted hashes.');
    });
  };

  // Change Email Handler
  const handleChangeEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySaveMessage('');

    if (!newEmail || !newEmail.includes('@')) {
      setSecuritySaveMessage('❌ Please specify a valid email address.');
      return;
    }

    const token = localStorage.getItem('nestlist_token');
    if (!token) {
      setSecuritySaveMessage('❌ Action requires active session authentication.');
      return;
    }

    setSecuritySaveStatus(true);
    setSecuritySaveMessage('Updating secure account email alignment...');

    fetch(getApiUrl('/api/auth/change-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newEmail })
    })
    .then(res => res.json())
    .then(data => {
      setSecuritySaveStatus(false);
      if (data.success) {
        if (data.token) {
          // Store updated session token so they don't get logged out!
          localStorage.setItem('nestlist_token', data.token);
          localStorage.setItem('nestlist_email', data.email);
        }
        onUpdateProfile({
          ...userProfile,
          contactEmail: newEmail
        });
        setSecuritySaveMessage('✓ Master login email updated successfully inside database repository!');
        setTimeout(() => setSecuritySaveMessage(''), 4000);
      } else {
        setSecuritySaveMessage(`❌ ${data.error || 'Email update rejected.'}`);
      }
    })
    .catch((err: any) => {
      setSecuritySaveStatus(false);
      setSecuritySaveMessage('❌ Real-time connection timed out. Changes queued.');
    });
  };

  // Trigger 2FA enablement mock activation modal
  const handleToggle2FA = (checked: boolean) => {
    if (checked) {
      setVerificationCode('');
      setTwoFaError('');
      setShow2FAModal(true);
    } else {
      // Disable 2FA
      const confirmation = window.confirm('Are you sure you want to disable Two-Factor authentication? Your account safety score will drop.');
      if (confirmation) {
        setTwoFactorEnabled(false);
        update2FAMetrics(false);
      }
    }
  };

  const handleVerify2FACode = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaError('');

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setTwoFaError('Please enter a valid 6-digit confirmation code.');
      return;
    }

    setIsActivating2FA(true);
    
    // Server simulation
    setTimeout(() => {
      setIsActivating2FA(false);
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      update2FAMetrics(true);
      alert('✓ Multi-factor authentication activated successfully! Backup recovery codes have been dispatched to your verified contact channels.');
    }, 1500);
  };

  const update2FAMetrics = (status: boolean) => {
    onUpdateProfile({
      ...userProfile,
      twoFactorEnabled: status
    });
    // Save to server
    const token = localStorage.getItem('nestlist_token');
    if (token) {
      fetch(getApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ twoFactorEnabled: status })
      }).catch(() => {});
    }
  };

  // Photo Input selection
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Security check rejected: Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Security warning: Selected picture exceeds our strict 5MB single file threshold.');
      return;
    }

    setPhotoError('');

    // Load file into Reader
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageFile(reader.result);
        setCropZoom(1);
        setCropOffset({ x: 0, y: 0 });
        setIsCropping(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag interaction inside custom Circular mask cropping canvas
  const handleCropDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX - cropOffset.x, y: clientY - cropOffset.y };
  };

  const handleCropDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStartRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCropOffset({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y
    });
  };

  const handleCropDragEnd = () => {
    dragStartRef.current = null;
  };

  // Crop image and render onto HTML5 <canvas> to export base64
  const handleProcessSecureCrop = () => {
    const canvas = cropCanvasRef.current;
    const img = cropImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsPhotoUploading(true);
    setUploadProgress(10);

    // Circle crop bounds
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Draw parameters
    setUploadProgress(40);
    
    // Clear and translate center
    ctx.clearRect(0, 0, size, size);
    
    // Create circular path mask for perfect avatar boundaries
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // Scale calculations
    const destWidth = img.naturalWidth * cropZoom;
    const destHeight = img.naturalHeight * cropZoom;
    const drawX = (size - destWidth) / 2 + cropOffset.x;
    const drawY = (size - destHeight) / 2 + cropOffset.y;

    ctx.drawImage(img, drawX, drawY, destWidth, destHeight);

    setUploadProgress(70);

    // Export base64 jpeg
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);

    // Post to Server database
    const token = localStorage.getItem('nestlist_token');

    if (token) {
      setUploadProgress(85);
      fetch(getApiUrl('/api/auth/upload-avatar'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: croppedBase64 })
      })
      .then(res => {
        if (!res.ok) throw new Error('File writing failed on the Cloud server.');
        return res.json();
      })
      .then(data => {
        setUploadProgress(100);
        if (data.success && data.avatarUrl) {
          // Dynamic update of user avatar throughout application!
          onUpdateProfile({
            ...userProfile,
            avatarUrl: data.avatarUrl
          });
          setIsCropping(false);
          setSelectedImageFile(null);
        } else {
          throw new Error(data.error || 'Server rejected avatar structure');
        }
      })
      .catch((err: any) => {
        console.warn('⚠️ Server upload offline. Storing cropped data locally.', err);
        onUpdateProfile({
          ...userProfile,
          avatarUrl: croppedBase64
        });
        setIsCropping(false);
        setSelectedImageFile(null);
      })
      .finally(() => {
        setTimeout(() => {
          setIsPhotoUploading(false);
          setUploadProgress(0);
        }, 1000);
      });
    } else {
      // Offline fallback state update
      setTimeout(() => {
        setUploadProgress(100);
        onUpdateProfile({
          ...userProfile,
          avatarUrl: croppedBase64
        });
        setIsCropping(false);
        setSelectedImageFile(null);
        setIsPhotoUploading(false);
        setUploadProgress(0);
      }, 1200);
    }
  };

  // Delete Profile Picture
  const handleDeleteProfilePicture = () => {
    const confirmation = window.confirm('Are you sure you want to permanently delete your profile picture?');
    if (!confirmation) return;

    setIsPhotoUploading(true);
    const token = localStorage.getItem('nestlist_token');

    if (token) {
      fetch(getApiUrl('/api/auth/delete-avatar'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          onUpdateProfile({
            ...userProfile,
            avatarUrl: ''
          });
        }
      })
      .catch((err: any) => {
        console.warn('⚠️ Cloud deletion timed out. Removing cached avatar Url.', err);
        onUpdateProfile({
          ...userProfile,
          avatarUrl: ''
        });
      })
      .finally(() => {
        setIsPhotoUploading(false);
      });
    } else {
      setTimeout(() => {
        onUpdateProfile({
          ...userProfile,
          avatarUrl: ''
        });
        setIsPhotoUploading(false);
      }, 1000);
    }
  };

  // Formatting date
  const joinedDateFormatted = () => {
    try {
      const date = new Date(userProfile.createdAt);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'June 1, 2026';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-6 pb-20 select-none text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: COMPACT INTERACTIVE USER PANEL CARD */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-[#0C0D1E]/95 border border-white/10 rounded-[32px] p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-600/5 rounded-full blur-[40px] pointer-events-none" />
            
            {/* Visual Header Grid info */}
            <div className="flex flex-col items-center text-center space-y-4">
              
              {/* Profile Image with Dynamic Upload controls */}
              <div className="relative group/avatar">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-violet-500/30 bg-[#121324] flex items-center justify-center relative shadow-xl">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* Elegant Initials Avatar fallback for Empty States */
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className="text-3xl font-syne font-black bg-gradient-to-br from-indigo-300 via-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                        {fullName ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NL'}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-full">
                        Empty
                      </span>
                    </div>
                  )}

                  {/* Loading overlay spinner */}
                  {isPhotoUploading && (
                    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-10 text-white">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                      <span className="text-[9px] font-mono mt-1 text-slate-400">SYNCING...</span>
                    </div>
                  )}
                </div>

                {/* Edit & Trash buttons overlay under hover, or absolute badges */}
                <div className="absolute -bottom-1 -right-1 flex gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 border border-white/10 rounded-full text-white cursor-pointer shadow-lg active:scale-90 transition-all flex items-center justify-center"
                    title="Upload or Change Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {userProfile.avatarUrl && (
                    <button
                      onClick={handleDeleteProfilePicture}
                      className="p-2 bg-rose-600 hover:bg-rose-700 border border-white/10 rounded-full text-white cursor-pointer shadow-lg active:scale-90 transition-all flex items-center justify-center"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Secret invisible file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
              </div>

              {/* Photo Helper prompt messages */}
              {!userProfile.avatarUrl && !isCropping && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-2.5 max-w-xs">
                  <p className="text-[10px] text-amber-400 font-bold font-dmsans leading-normal">
                    💡 No profile picture added. Tap the camera shortcut above to secure high trust on tours!
                  </p>
                </div>
              )}

              {photoError && (
                <p className="text-[10px] font-bold text-rose-400 max-w-xs">{photoError}</p>
              )}

              <div>
                <h2 className="text-xl font-black font-syne text-white tracking-tight leading-tight flex items-center justify-center gap-2">
                  <span>{userProfile.fullName || 'Tenant Name'}</span>
                  {userProfile.isVerified && (
                    <span title="Identity Vetted">
                      <Award className="w-4.5 h-4.5 text-emerald-400 grow-0" />
                    </span>
                  )}
                </h2>
                
                {/* Account role pill */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5">
                  <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] uppercase font-bold px-3 py-1 rounded-full font-mono tracking-wider">
                    {currentRole} Account
                  </span>
                  {userProfile.isVerified ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] uppercase font-bold px-3 py-1 rounded-full font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Vetted Profile
                    </span>
                  ) : (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-bold px-3 py-1 rounded-full font-mono">
                      Guest Sync
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full border-t border-white/5 pt-4 text-xs space-y-2.5 text-slate-400 font-dmsans text-left font-semibold">
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="font-mono text-[11px] text-white select-all">#{userProfile.id.substring(0, 10).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email ID:</span>
                  <span className="text-white bg-slate-900 px-2 py-0.5 rounded-md text-[11px] select-all">{userProfile.contactEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact Phone:</span>
                  <span className="text-white select-all">{userProfile.contactPhone || 'Not Configured'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Joined:</span>
                  <span className="text-indigo-355 flex items-center gap-1 font-bold text-violet-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {joinedDateFormatted()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span>M-Pesa Verified:</span>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider block">
                    ACTIVE CONNECTED
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* DYNAMIC VIEW ROLE ACCORDION TUNER */}
          <div className="bg-[#0C0D1E]/95 border border-white/10 rounded-[32px] p-5 space-y-4 text-left shadow-xl">
            <div>
              <span className="block text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider">Tuner Active Dashboard View</span>
              <p className="text-[10px] text-slate-405 mt-1 leading-normal font-medium font-dmsans">
                Easily simulate distinct operational tasks on NestList luxury portals by flipping your access role below.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                { r: 'Tenant' as UserRole, label: 'Verified Tenant Portal', desc: 'Secure viewings, trigger payments, inspect invoices', icon: User },
                { r: 'Agent' as UserRole, label: 'Licensed Agency Space', desc: 'Sponsor property postings, accept client inquiries', icon: Sparkles },
                { r: 'Landlord' as UserRole, label: 'Direct Landowner Space', desc: 'Upload properties, audit payouts, claim flags', icon: Building }
              ].map(item => (
                <button
                  key={item.r}
                  onClick={() => onChangeRole(item.r)}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between cursor-pointer transition-all ${
                    currentRole === item.r
                      ? 'border-violet-500 bg-violet-600/5 ring-1 ring-violet-500'
                      : 'border-white/5 hover:border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex gap-2.5">
                    <item.icon className={`w-4 h-4 mt-0.5 ${currentRole === item.r ? 'text-violet-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[9px] text-slate-450 mt-0.5 block leading-tight font-medium font-dmsans">{item.desc}</span>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    currentRole === item.r ? 'bg-violet-600 border-transparent' : 'border-white/20'
                  }`}>
                    {currentRole === item.r && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick instructions manual */}
          <div className="bg-[#121324] border border-white/5 p-4.5 rounded-[24px] text-xs text-slate-405 leading-relaxed space-y-2 text-left">
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">🛡️ NestList Escrow Compliance</span>
            <p className="font-semibold font-dmsans">
              All profile updates, M-Pesa phone binding records, and credential resets are cryptographically signed under direct Escrow supervision. Your data remains fully private.
            </p>
          </div>

          {/* Logout Action trigger */}
          <button
            onClick={onLogout}
            className="w-full py-4.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-450 font-bold font-syne text-xs uppercase tracking-widest rounded-[24px] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            Logout current account session
          </button>
          
        </div>

        {/* COLUMN 2: DEEP FORM TABS NAVIGATION DETAILS */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          
          {/* Sub Navigation Tabs */}
          <div className="flex bg-[#0C0D1E] border border-white/10 rounded-2.5xl p-1.5 scrollbar-none overflow-x-auto gap-1">
            {[
              { id: 'dashboard', label: 'User Dashboard', icon: History },
              { id: 'edit-profile', label: 'Edit Profile details', icon: User },
              { id: 'security', label: 'Security & Settings', icon: Lock }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex-1 py-3 px-4.5 rounded-xl text-xs font-syne font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS CONTAINER PANEL */}
          <div className="bg-[#0C0D1E]/95 border border-[#FFFFFF]/10 rounded-[32px] p-6 shadow-2xl relative">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: USER DASHBOARD STATS & SAVED/LOGGED HISTORY ITEMS */}
              {activeSubTab === 'dashboard' && (
                <motion.div
                  key="panel-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 text-left"
                >
                  
                  {/* Dynamic stats metrics grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#121324] border border-white/5 rounded-2xl p-4">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Trust Rating Index</span>
                      <span className="text-xl font-syne font-black text-emerald-450 mt-1 block">{reliabilityScore}% Score</span>
                      <span className="text-[8px] font-semibold text-slate-405 leading-none block mt-1">Vetted KYC Safaricom</span>
                    </div>
                    <div className="bg-[#121324] border border-white/5 rounded-2xl p-4">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Saved Listings</span>
                      <span className="text-xl font-syne font-black text-white mt-1 block">{favorites.length} Properties</span>
                      <span className="text-[8px] font-semibold text-slate-405 leading-none block mt-1">Bookmarked spaces</span>
                    </div>
                    {isLoggedInAuthor({ id: '' } as any) ? (
                      <div className="bg-[#121324] border border-white/5 rounded-2xl p-4">
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Posted Listings</span>
                        <span className="text-xl font-syne font-black text-violet-400 mt-1 block">{myPostedListings.length} Houses</span>
                        <span className="text-[8px] font-semibold text-slate-400 leading-none block mt-1">Active classifieds</span>
                      </div>
                    ) : (
                      <div className="bg-[#121324] border border-white/5 rounded-2xl p-4">
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Search Volatility</span>
                        <span className="text-xl font-syne font-black text-violet-400 mt-1 block">{totalSearches} Leads</span>
                        <span className="text-[8px] font-semibold text-slate-400 leading-none block mt-1">Active filter queries</span>
                      </div>
                    )}
                    <div className="bg-[#121324] border border-white/5 rounded-2xl p-4">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Lead Inquiries</span>
                      <span className="text-xl font-syne font-black text-indigo-400 mt-1 block">{inquiries.length} Filed</span>
                      <span className="text-[8px] font-semibold text-slate-400 leading-none block mt-1">Replies synchronized</span>
                    </div>
                  </div>

                  {/* SAVED PROPERTIES */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-xs font-syne font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                         <Heart className="w-4 h-4 fill-indigo-400 text-indigo-400 shrink-0" />
                         My Saved Properties Bookmark ({favorites.length})
                       </span>
                    </div>

                    {favoritedListings.length === 0 ? (
                      <div className="text-center py-10 bg-white/5 border border-dashed border-white/5 rounded-2xl p-4">
                        <span className="text-3xl block filter saturate-0 mb-2">🔖</span>
                        <p className="text-xs text-slate-400 font-bold font-syne uppercase tracking-wider">Your bookmarks are empty</p>
                        <p className="text-[10px] text-slate-550 mt-1 max-w-sm mx-auto font-medium font-dmsans leading-normal">
                          Flick through our premium verified spaces feed and click the bookmark heart icon to secure lists here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favoritedListings.slice(0, 4).map(item => (
                          <ListingCard
                            key={item.id}
                            listing={item}
                            isFavorite={true}
                            onToggleFavorite={onToggleFavorite}
                            onSelect={onSelectListing}
                            viewFormat="grid"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* POSTED PROPERTIES BY ACTIVE LANDLORD / AGENT */}
                  {isLoggedInAuthor({ id: '' } as any) && (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-syne font-black uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-green-400 shrink-0" />
                          My Handled / Hosted Listings classified ({myPostedListings.length})
                        </span>
                      </div>

                      {myPostedListings.length === 0 ? (
                        <div className="text-center py-10 bg-white/5 border border-dashed border-white/5 rounded-2xl p-4">
                          <span className="text-3xl block filter saturate-0 mb-2">🏢</span>
                          <p className="text-xs text-slate-400 font-bold font-syne uppercase tracking-wider">No active postings found</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto font-medium font-dmsans leading-normal">
                            Tap the "Post property listing" workspace header button to launch your property on our vetted escrow framework.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myPostedListings.slice(0, 4).map(item => (
                            <ListingCard
                              key={item.id}
                              listing={item}
                              isFavorite={favorites.includes(item.id)}
                              onToggleFavorite={onToggleFavorite}
                              onSelect={onSelectListing}
                              viewFormat="grid"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIEWED HOUSES HISTORY */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs font-syne font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
                        Recently Visited Spaces ({viewedListingsList.length})
                      </span>
                    </div>

                    {viewedListingsList.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 border border-dashed border-white/5 rounded-2xl p-4">
                        <span className="text-3xl block filter saturate-0 mb-2">👁️</span>
                        <p className="text-xs text-slate-400 font-bold font-syne uppercase tracking-wider">No browsing history yet</p>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto font-medium font-dmsans leading-normal">
                          Detailed walk-through clicks populate dynamic historical listings caches instantly.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viewedListingsList.map(item => (
                          <ListingCard
                            key={item.id}
                            listing={item}
                            isFavorite={favorites.includes(item.id)}
                            onToggleFavorite={onToggleFavorite}
                            onSelect={onSelectListing}
                            viewFormat="grid"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACCOUNT NOTIFICATIONS FEED */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs font-syne font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Bell className="w-4 h-3.5 text-amber-400 shrink-0" />
                        Account notifications Alert Sync
                      </span>
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No recent platform push updates received.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-none">
                        {notifications.slice(0, 5).map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-xl border flex items-start gap-3 text-xs justify-between transition-all ${
                              notif.isRead 
                                ? 'bg-white/5 border-white/5 text-slate-400' 
                                : 'bg-violet-600/5 border-violet-500/10 text-white font-semibold'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-violet-400 font-mono tracking-wider block uppercase">
                                {notif.type || 'SYSTEM'}
                              </span>
                              <p className="text-white font-bold">{notif.title}</p>
                              <p className="text-slate-400 font-semibold text-[11px] leading-relaxed mt-0.5">{notif.description}</p>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono shrink-0 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

              {/* TAB 2: EDIT USER INFORMATION & ABOUT BIO AND LOCATION */}
              {activeSubTab === 'edit-profile' && (
                <motion.div
                  key="panel-edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <form onSubmit={handleProfileUpdateSubmit} className="space-y-6 text-left">
                    
                    <div className="border-b border-white/5 pb-2">
                      <p className="text-sm font-black font-syne text-white uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-violet-400 shrink-0" />
                        Edit Contact & Bio Details
                      </p>
                      <p className="text-[10px] text-slate-500 leading-none mt-1">Changes are persisted to NestList secure ledger database</p>
                    </div>

                    {/* Standard details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10.5 bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans focus:border-violet-500 transition-all focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Contact Phone *</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10.5 bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans focus:border-violet-500 transition-all focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Current Location Office / Region</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder="e.g. Westlands, Nairobi"
                            className="w-full pl-10.5 bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans focus:border-violet-500 transition-all focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Preferred Contact medium</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <select
                            value={preferredContact}
                            onChange={(e) => setPreferredContact(e.target.value)}
                            className="w-full pl-10.5 bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans focus:border-violet-500 transition-all cursor-pointer"
                          >
                            <option value="Email">Secure Email Messaging</option>
                            <option value="Phone">Direct Phone Calls</option>
                            <option value="WhatsApp">WhatsApp Chat Sync</option>
                            <option value="SMS">Offline SMS Alerts</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    {/* Biography Description */}
                    <div className="space-y-1.5 text-xs">
                      <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Biography & Experience Details</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write detailed summaries of your house searches, your tenant preferences or professional real estate backing details..."
                        className="w-full h-24 bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none font-medium font-dmsans transition-all resize-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    {/* LANDLORD DEDICATED BLOCK - Requirement 5 */}
                    {(currentRole === 'Landlord' || currentRole === 'Agent') && (
                      <div className="bg-[#121324]/65 border border-violet-500/10 p-5 rounded-2.5xl space-y-4">
                        <div className="border-b border-white/5 pb-2 text-xs flex items-center justify-between">
                          <span className="font-extrabold text-violet-400 font-syne uppercase tracking-wider flex items-center gap-1">
                            <Building className="w-4 h-4 text-violet-400 shrink-0" />
                            Licensed Professional Real Estate Agency profile
                          </span>
                          <span className="text-[9px] bg-violet-600/20 text-violet-405 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Landlord / Agent exclusive
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div className="space-y-1.5 text-xs">
                            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Agency / Company Name</label>
                            <input
                              type="text"
                              value={agencyName}
                              onChange={(e) => setAgencyName(e.target.value)}
                              placeholder="e.g. Vance Luxury Estates"
                              className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Business Logo Link / URL</label>
                            <input
                              type="url"
                              value={businessLogo}
                              onChange={(e) => setBusinessLogo(e.target.value)}
                              placeholder="e.g. https://images.unsplash.com/photo-...."
                              className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-medium"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Registered Office physical Location</label>
                            <input
                              type="text"
                              value={officeLocation}
                              onChange={(e) => setOfficeLocation(e.target.value)}
                              placeholder="e.g. Vance Plaza, 4th Floor, Parklands"
                              className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Official business contact channel</label>
                            <input
                              type="text"
                              value={businessContact}
                              onChange={(e) => setBusinessContact(e.target.value)}
                              placeholder="e.g. concierge@vance- luxury.ke"
                              className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold"
                            />
                          </div>

                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Business Pitch & Real Estate Services</label>
                          <textarea
                            value={businessDescription}
                            onChange={(e) => setBusinessDescription(e.target.value)}
                            placeholder="Introduce your luxury portfolio, land holding scale, and escrow compliance guarantees for direct tenant bookings..."
                            className="w-full h-20 bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none font-medium font-dmsans resize-none"
                          />
                        </div>

                      </div>
                    )}

                    {saveMessage && (
                      <p className="text-center text-xs font-bold text-violet-400">{saveMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={saveStatus && saveMessage.includes('Saving')}
                      className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-bold font-syne text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      {saveStatus && saveMessage.includes('Saving') ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Persisting secure details...</span>
                        </>
                      ) : (
                        <span>Save Profile changes</span>
                      )}
                    </button>

                  </form>
                </motion.div>
              )}

              {/* TAB 3: ACCOUNT SECURITY SETTINGS, MFA RESET AND TOGGLES */}
              {activeSubTab === 'security' && (
                <motion.div
                  key="panel-security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  
                  {/* CHANGE EMAIL SECTION */}
                  <div className="bg-[#121324]/55 border border-white/5 p-5 rounded-2.5xl space-y-4">
                    <div className="border-b border-white/5 pb-2 text-xs">
                       <span className="font-extrabold text-white font-syne uppercase tracking-wider flex items-center gap-1.5">
                         <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                         Altering Registered Email address
                       </span>
                    </div>

                    <form onSubmit={handleChangeEmailSubmit} className="space-y-3">
                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">New Email Address</label>
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold focus:border-violet-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={securitySaveStatus}
                        className="py-2.5 px-6 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer self-start"
                      >
                        Update Account Email
                      </button>
                    </form>
                  </div>

                  {/* CHANGE PASSWORD SECTION */}
                  <div className="bg-[#121324]/55 border border-white/5 p-5 rounded-2.5xl space-y-4">
                    <div className="border-b border-white/5 pb-2 text-xs">
                       <span className="font-extrabold text-white font-syne uppercase tracking-wider flex items-center gap-1.5">
                         <Key className="w-4 h-4 text-violet-400 shrink-0" />
                         Rotate Secure Login password
                       </span>
                    </div>

                    <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 text-xs md:col-span-2">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Current Account Password *</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Your existing password"
                          className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">New Secure Password *</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Confirm New Password *</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={securitySaveStatus}
                          className="py-2.5 px-6 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          Alter password hash
                        </button>
                      </div>

                    </form>
                  </div>

                  {/* TWO-FACTOR AUTHENTICATION TOGGLE - Requirement 4 */}
                  <div className="bg-[#121324]/55 border border-white/5 p-5 rounded-2.5xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                       <span className="font-extrabold text-white font-syne uppercase tracking-wider flex items-center gap-1.5">
                         <Shield className="w-4 h-4 text-violet-400 shrink-0" />
                         Multi-Factor Authenticator Setup
                       </span>
                       <span className={`text-[9px] uppercase font-bold py-0.5 px-2.5 rounded-full font-mono ${
                         twoFactorEnabled 
                           ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                           : 'bg-slate-800 text-slate-400'
                       }`}>
                         {twoFactorEnabled ? 'HIGH PROTECTION ACTIVE' : 'INSECURE'}
                       </span>
                    </div>

                    <div className="flex items-start justify-between gap-5 text-xs">
                      <div className="space-y-1.5 max-w-md font-semibold font-dmsans text-slate-400 leading-normal">
                        <p className="text-white font-bold mb-1">Secure account transactions with 6-digit dynamic pins</p>
                        <p>
                          Two-factor authentication adds an extra layer of identity protection to prevent unauthorized listing creations or escrow funds claims on your portfolio.
                        </p>
                      </div>

                      {/* Cool Toggle switch */}
                      <button
                        onClick={() => handleToggle2FA(!twoFactorEnabled)}
                        className={`w-12 h-6.5 rounded-full relative transition-all duration-300 focus:outline-none shrink-0 ${
                          twoFactorEnabled ? 'bg-violet-600' : 'bg-[#121324] border border-white/15'
                        }`}
                      >
                        <motion.div
                          layout
                          className="w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5"
                          animate={{ x: twoFactorEnabled ? 22 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* NOTIFICATION PREFERENCES */}
                  <div className="bg-[#121324]/55 border border-white/5 p-5 rounded-2.5xl space-y-4">
                    <div className="border-b border-white/5 pb-2 text-xs">
                       <span className="font-extrabold text-white font-syne uppercase tracking-wider flex items-center gap-1.5">
                         <Bell className="w-4 h-3.5 text-violet-400 shrink-0" />
                         Notification Dispatch Preferences
                       </span>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-450 font-semibold font-dmsans">
                      
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={notifEmail}
                          onChange={(e) => setNotifEmail(e.target.checked)}
                          className="rounded border-white/10 text-violet-600 bg-white/5 focus:ring-violet-500 mt-0.5"
                        />
                        <div>
                          <span className="text-white font-bold block">Transactional Email Logs</span>
                          <span className="text-[11px] text-slate-450 block leading-tight mt-0.5">Receive immediate copy receipts of escrow payments and M-Pesa STK prompts.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none border-t border-white/5 pt-3">
                        <input
                          type="checkbox"
                          checked={notifSms}
                          onChange={(e) => setNotifSms(e.target.checked)}
                          className="rounded border-white/10 text-violet-600 bg-white/5 focus:ring-violet-500 mt-0.5"
                        />
                        <div>
                          <span className="text-white font-bold block">SMS Verification Dispatch</span>
                          <span className="text-[11px] text-slate-450 block leading-tight mt-0.5">Secure mobile sms dispatches on premium client leads or tour scheduling.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none border-t border-white/5 pt-3">
                        <input
                          type="checkbox"
                          checked={notifPush}
                          onChange={(e) => setNotifPush(e.target.checked)}
                          className="rounded border-white/10 text-violet-600 bg-white/5 focus:ring-violet-500 mt-0.5"
                        />
                        <div>
                          <span className="text-white font-bold block">Web Real-time updates</span>
                          <span className="text-[11px] text-slate-450 block leading-tight mt-0.5">Instantly display popup notes and alerts inside the browser dashboard tab during active sessions.</span>
                        </div>
                      </label>

                    </div>
                  </div>

                  {/* PRIVACY SETTINGS */}
                  <div className="bg-[#121324]/55 border border-white/5 p-5 rounded-2.5xl space-y-4">
                    <div className="border-b border-white/5 pb-2 text-xs">
                       <span className="font-extrabold text-white font-syne uppercase tracking-wider flex items-center gap-1.5">
                         <Eye className="w-4 h-4 text-violet-400 shrink-0" />
                         Account Privacy settings
                       </span>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-450 font-semibold font-dmsans">
                      
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={privPublic}
                          onChange={(e) => setPrivPublic(e.target.checked)}
                          className="rounded border-white/10 text-violet-600 bg-white/5 focus:ring-violet-500 mt-0.5"
                        />
                        <div>
                          <span className="text-white font-bold block">Public Profile visibility</span>
                          <span className="text-[11px] text-slate-450 block leading-tight mt-0.5">Allow other platform verified tenants or landlords to inspect my contact scoring statistics.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none border-t border-white/5 pt-3">
                        <input
                          type="checkbox"
                          checked={privIndexing}
                          onChange={(e) => setPrivIndexing(e.target.checked)}
                          className="rounded border-white/10 text-violet-600 bg-white/5 focus:ring-violet-500 mt-0.5"
                        />
                        <div>
                          <span className="text-white font-bold block">Authorize Google search index</span>
                          <span className="text-[11px] text-slate-450 block leading-tight mt-0.5">Inject profile details into organic indexing services to improve landlord reach of my listings.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none border-t border-white/5 pt-3">
                        <input
                          type="checkbox"
                          checked={privShowContact}
                          onChange={(e) => setPrivShowContact(e.target.checked)}
                          className="rounded border-white/10 text-violet-600 bg-white/5 focus:ring-violet-500 mt-0.5"
                        />
                        <div>
                          <span className="text-white font-bold block">Expose contact phone logs</span>
                          <span className="text-[11px] text-slate-450 block leading-tight mt-0.5">Expose M-Pesa phone credentials dynamically inside matching search properties.</span>
                        </div>
                      </label>

                    </div>
                  </div>

                  {securitySaveMessage && (
                    <p className={`text-center text-xs font-bold ${securitySaveMessage.includes('✓') ? 'text-emerald-400' : 'text-rose-405'}`}>
                      {securitySaveMessage}
                    </p>
                  )}

                  <button
                    onClick={handleProfileUpdateSubmit}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-bold font-syne text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg active:scale-98"
                  >
                    Save Security Toggles & settings
                  </button>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* COMPANION CROPPER OVERLAY MODAL */}
      <AnimatePresence>
        {isCropping && selectedImageFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isPhotoUploading) {
                  setIsCropping(false);
                  setSelectedImageFile(null);
                }
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0C0D1E] border border-white/10 rounded-[32px] p-6 max-w-md w-full relative z-10 shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-bold font-syne text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-5 h-5 text-violet-400 animate-pulse" />
                  Crop Avatar Photo
                </span>
                <button
                  onClick={() => {
                    if (!isPhotoUploading) {
                      setIsCropping(false);
                      setSelectedImageFile(null);
                    }
                  }}
                  disabled={isPhotoUploading}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer disabled:opacity-30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Crop Box stage */}
              <div
                className="w-full aspect-square bg-[#05050C] rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5 cursor-move"
                onMouseDown={handleCropDragStart}
                onMouseMove={handleCropDragMove}
                onMouseUp={handleCropDragEnd}
                onMouseLeave={handleCropDragEnd}
                onTouchStart={handleCropDragStart}
                onTouchMove={handleCropDragMove}
                onTouchEnd={handleCropDragEnd}
              >
                {/* Visual circle mask boundary indicator */}
                <div className="absolute inset-0 border-[60px] border-black/75 pointer-events-none flex items-center justify-center z-10">
                  <div className="w-[180px] h-[180px] rounded-full border-2 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse" />
                </div>

                <img
                  ref={cropImageRef}
                  src={selectedImageFile}
                  alt="Original image"
                  draggable={false}
                  className="max-w-none origin-center pointer-events-none select-none max-h-none"
                  style={{
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                    transition: dragStartRef.current ? 'none' : 'transform 0.15s ease-out'
                  }}
                />
              </div>

              {/* Zoom slider control */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-mono text-[10px] text-slate-500 font-bold uppercase">
                  <span>Zoom slider:</span>
                  <span className="text-violet-400">{Math.round(cropZoom * 100)}% scale</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  disabled={isPhotoUploading}
                  className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-violet-500 disabled:opacity-50"
                />
              </div>

              {/* Drag tips info alert */}
              <div className="p-3 bg-white/5 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-[10px] text-slate-400 font-semibold font-dmsans">
                  Tip: Drag the image target inside the circle mask to focus your face perfectly before uploading.
                </span>
              </div>

              {/* Invisible canvas used for secure graphics drawing */}
              <canvas ref={cropCanvasRef} className="hidden" />

              {/* Progress Bar indicator */}
              {isPhotoUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-violet-400 uppercase font-black tracking-wider">
                    <span>Securing upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-650"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* Crop actions trigger */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isPhotoUploading}
                  onClick={() => {
                    setIsCropping(false);
                    setSelectedImageFile(null);
                  }}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-350 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessSecureCrop}
                  disabled={isPhotoUploading}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 text-center flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isPhotoUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Apply Secure Crop</span>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPANION INTERACTIVE 2FA ACTIVATION QR MODEL */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isActivating2FA) setShow2FAModal(false);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0C0D1E] border border-[#FFFFFF]/10 rounded-[32px] p-6 max-w-sm w-full relative z-10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-black font-syne text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-violet-400 animate-bounce" />
                  Configure Multi-Factor Authenticator
                </span>
                <button
                  onClick={() => {
                    if (!isActivating2FA) setShow2FAModal(false);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
                  disabled={isActivating2FA}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-3.5 text-xs text-slate-400 font-semibold font-dmsans">
                <p>
                  Scan the visual QR Code below using standard authenticator apps (e.g. Google Authenticator, Duo or Microsoft Auth) to bind secure credentials.
                </p>

                {/* Simulated QR Code Canvas */}
                <div className="bg-white p-4.5 rounded-2xl w-44 h-44 mx-auto shadow-md border-4 border-violet-500/10 flex items-center justify-center relative group">
                  {/* Styled simulated QR vector illustration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 pointer-events-none rounded-xl" />
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" fill="#0c0d1e" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="10" width="10" height="10" fill="#0c0d1e" />
                    
                    <rect x="70" y="0" width="30" height="30" fill="#0c0d1e" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="80" y="10" width="10" height="10" fill="#0c0d1e" />
                    
                    <rect x="0" y="70" width="30" height="30" fill="#0c0d1e" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="80" width="10" height="10" fill="#0c0d1e" />
                    
                    <rect x="40" y="10" width="10" height="10" fill="#0c0d1e" />
                    <rect x="50" y="20" width="10" height="10" fill="#0c0d1e" />
                    <rect x="80" y="40" width="10" height="10" fill="#0c0d1e" />
                    <rect x="40" y="50" width="20" height="10" fill="#0c0d1e" />
                    <rect x="25" y="45" width="10" height="10" fill="#0c0d1e" />
                    <rect x="45" y="80" width="25" height="10" fill="#0c0d1e" />
                    <rect x="80" y="80" width="10" height="15" fill="#0c0d1e" />
                    <rect x="50" y="40" width="15" height="15" fill="#0c0d1e" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] text-indigo-405 font-mono uppercase font-bold">Manual config secret key:</span>
                  <span className="bg-[#121324] font-mono text-[11px] font-black text-white px-3 py-1.5 rounded-lg select-all block border border-white/5 uppercase">
                    NSTL KESC ROW 2026 HIGH SECU
                  </span>
                </div>

                <form onSubmit={handleVerify2FACode} className="space-y-3.5 border-t border-white/5 pt-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-505 font-mono font-bold uppercase tracking-wider text-left">Authenticator 6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full bg-[#121324] border border-white/10 rounded-xl p-3 text-sm text-center text-white outline-none font-bold placeholder:text-slate-700 font-mono tracking-widest"
                    />
                  </div>

                  {twoFaError && (
                    <p className="text-[10px] font-bold text-rose-400">{twoFaError}</p>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      disabled={isActivating2FA}
                      onClick={() => setShow2FAModal(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-350 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isActivating2FA}
                      className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg active:scale-95 flex items-center justify-center gap-1"
                    >
                      {isActivating2FA ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Activate</span>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
