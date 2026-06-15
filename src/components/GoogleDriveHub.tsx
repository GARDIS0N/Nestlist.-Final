import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  initAuth, 
  googleSignIn, 
  logoutDrive, 
  getAccessToken 
} from "../lib/firebase";
import { 
  Cloud, 
  Search, 
  Trash2, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  HelpCircle, 
  Plus, 
  X, 
  Check, 
  Link as LinkIcon, 
  AlertTriangle,
  Grid,
  List as ListIcon
} from "lucide-react";
import { Listing } from "../types";

interface GoogleDriveHubProps {
  listings: Listing[];
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export default function GoogleDriveHub({ listings }: GoogleDriveHubProps) {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "documents" | "images" | "spreadsheets">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // File association state (which Drive files are linked to which Nestlist listings)
  const [associations, setAssociations] = useState<Record<string, { listingId: string; listingTitle: string; attachedAt: string }>>({});
  const [selectedFileForAssociation, setSelectedFileForAssociation] = useState<DriveFile | null>(null);
  const [associationListingId, setAssociationListingId] = useState("");

  // Mandatory custom modal for deletions
  const [deleteConfirmationFile, setDeleteConfirmationFile] = useState<DriveFile | null>(null);

  // General Toast/Feedback Alert inside the hub
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Auth state on mounted
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setNeedsAuth(false);
        fetchFiles(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );

    // Initial load of associations
    const saved = localStorage.getItem("nestlist_drive_associations");
    if (saved) {
      try {
        setAssociations(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load drive associations:", err);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const triggerFeedback = (text: string, type: "success" | "error" | "info" = "info") => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
        triggerFeedback("Welcome! Google Drive connected successfully.", "success");
        fetchFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      triggerFeedback(err.message || "Could not authenticate with Google", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutDrive();
      setGoogleUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
      setFiles([]);
      triggerFeedback("Google Account disconnected.", "info");
    } catch (err: any) {
      console.error(err);
      triggerFeedback("Failure during sign out.", "error");
    }
  };

  const fetchFiles = async (tokenValue?: string) => {
    const activeToken = tokenValue || accessToken;
    if (!activeToken) return;

    setLoading(true);
    try {
      // Query the Google Drive API v3 to list non-trashed files
      const url = "https://www.googleapis.com/drive/v3/files?pageSize=40&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)&q=trashed=false";
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          // Token expired or invalid, prompt login again safely
          setNeedsAuth(true);
          return;
        }
        throw new Error(errData.error?.message || "Google Drive listing failed");
      }

      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      triggerFeedback(err.message || "Failed to sync your files from Google Drive", "error");
    } finally {
      setLoading(false);
    }
  };

  // Upload handler which supports both drag-and-drop & file selection
  const handleFileUpload = async (file: File) => {
    const tokenValue = accessToken || (await getAccessToken());
    if (!tokenValue) {
      triggerFeedback("Authentication session expired. Please connect again.", "error");
      setNeedsAuth(true);
      return;
    }

    setUploading(true);
    try {
      // Google Drive v3 multipart upload
      const metadata = {
        name: file.name,
        mimeType: file.type || "application/octet-stream",
      };

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", file);

      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenValue}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error("Unable to complete cloud document upload to Drive");
      }

      const uploadedFile = await response.json();
      setFiles(prev => [uploadedFile, ...prev]);
      triggerFeedback(`Successfully uploaded "${file.name}" to Google Drive!`, "success");
    } catch (error: any) {
      console.error(error);
      triggerFeedback(error.message || "Failed to execute cloud document upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Mandatory Confirm Deletion Execution
  const executeFileDelete = async () => {
    if (!deleteConfirmationFile) return;
    const tokenValue = accessToken || (await getAccessToken());
    if (!tokenValue) {
      triggerFeedback("Credentials expired. Please reload.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${deleteConfirmationFile.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenValue}`
        }
      });

      if (!res.ok) {
        throw new Error("Could not delete from Google Drive workspace server");
      }

      // Filter local state
      setFiles(prev => prev.filter(f => f.id !== deleteConfirmationFile.id));
      
      // Cleanup association if it existed
      const updatedAssoc = { ...associations };
      if (updatedAssoc[deleteConfirmationFile.id]) {
        delete updatedAssoc[deleteConfirmationFile.id];
        setAssociations(updatedAssoc);
        localStorage.setItem("nestlist_drive_associations", JSON.stringify(updatedAssoc));
      }

      triggerFeedback(`Successfully deleted "${deleteConfirmationFile.name}" from Google Drive.`, "success");
    } catch (err: any) {
      console.error(err);
      triggerFeedback(err.message || "Standard API delete failure", "error");
    } finally {
      setLoading(false);
      setDeleteConfirmationFile(null);
    }
  };

  // Associate Google Drive file to properties
  const handleCreateAssociation = () => {
    if (!selectedFileForAssociation || !associationListingId) return;

    const matchedListing = listings.find(l => l.id === associationListingId);
    const listingName = matchedListing ? matchedListing.title : "Preferred Luxury Duplex";

    const updated = {
      ...associations,
      [selectedFileForAssociation.id]: {
        listingId: associationListingId,
        listingTitle: listingName,
        attachedAt: new Date().toISOString()
      }
    };

    setAssociations(updated);
    localStorage.setItem("nestlist_drive_associations", JSON.stringify(updated));
    setSelectedFileForAssociation(null);
    setAssociationListingId("");
    triggerFeedback(`Securely referenced "${selectedFileForAssociation.name}" into real estate item notes!`, "success");
  };

  // Remove local association
  const handleRemoveAssociation = (fileId: string) => {
    const updated = { ...associations };
    delete updated[fileId];
    setAssociations(updated);
    localStorage.setItem("nestlist_drive_associations", JSON.stringify(updated));
    triggerFeedback("Document reference removed successfully.", "info");
  };

  // Format File Size
  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return "Folder or Virtual Doc";
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get MIME type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("rtf")) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType.includes("image")) {
      return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    }
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    return <FileText className="w-5 h-5 text-indigo-400" />;
  };

  // Categorize or filter
  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedCategory === "all") return true;
    if (selectedCategory === "documents") {
      return f.mimeType.includes("pdf") || f.mimeType.includes("document") || f.mimeType.includes("text");
    }
    if (selectedCategory === "images") {
      return f.mimeType.includes("image");
    }
    if (selectedCategory === "spreadsheets") {
      return f.mimeType.includes("spreadsheet") || f.mimeType.includes("sheet") || f.mimeType.includes("excel");
    }
    return true;
  });

  return (
    <div id="google-drive-hub-root" className="glass-premium rounded-2xl border border-white/5 p-6 space-y-6 text-charcoal">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="bg-green-mid/10 text-green-mid text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full font-bold">
            Google Workspace Synchronizer
          </span>
          <h2 className="text-xl font-serif font-bold text-white mt-1 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-green-mid" /> Google Drive Documents Hub
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Organize title deeds, tenancy agreements, floor plans, and property receipts securely.
          </p>
        </div>

        {/* LOGGED IN / OUT BUTTON */}
        {!needsAuth && googleUser && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{googleUser.displayName || googleUser.email}</p>
              <p className="text-[10px] text-gray-500 font-mono">Google Drive Synced</p>
            </div>
            {googleUser.photoURL && (
              <img 
                src={googleUser.photoURL} 
                alt="Google user" 
                className="w-8 h-8 rounded-full border border-white/10"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-950/30 hover:bg-red-950/50 text-red-300 hover:text-red-200 text-xs font-mono rounded border border-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* FEEDBACK STATUS ALERT */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3 rounded-lg text-xs font-mono border flex items-center gap-2 ${
              feedback.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : feedback.type === "error" 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-300"
            }`}
          >
            {feedback.type === "success" && <span className="text-[14px]">✓</span>}
            {feedback.type === "error" && <span className="text-[14px]">⚠️</span>}
            {feedback.type === "info" && <span className="text-[14px]">ℹ️</span>}
            <span>{feedback.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTHENTICATION DECK */}
      {needsAuth ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-brand-dark/30 rounded-2xl border border-white/5 p-6">
          <div className="p-4 bg-brand-card/60 rounded-full border border-white/5">
            <Cloud className="w-10 h-10 text-gray-500 animate-pulse" />
          </div>
          <div className="max-w-md">
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">Connect Google Workspace</h3>
            <p className="text-xs text-gray-400 mt-2">
              Sync your property listing profile to browse, list, and upload title papers, lease contracts, and compliance forms straight to Google Drive.
            </p>
          </div>

          {/* Official Google Material Sign-In Button */}
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 text-white bg-slate-900 border border-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 cursor-pointer transition-all hover:scale-102"
          >
            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
              <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652c2.253.008 4.41.817 6.137 2.29a.75.75 0 0 1-.027 1.124l-1.857 1.707a.75.75 0 0 1-1.02-.03 5.304 5.304 0 1 0-3.13 8.358 5.252 5.252 0 0 0 3.75-1.58 5.95 5.95 0 0 0 1.5-3.237h-5.25a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 1 .75-.75h8.25c.36 0 .66.255.722.61a10.224 10.224 0 0 1-.171 4.587 9.816 9.816 0 0 1-3.002 4.783 10.237 10.237 0 0 1-6.425 2.186h-.071Z" clipRule="evenodd"/>
            </svg>
            {loading ? "Establishing handshake..." : "Sign in with Google"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* SEARCH & FILTERS CONTROLS */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-brand-dark/40 p-4 rounded-xl border border-white/5">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files on your Drive..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-mid"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* SEPARATED CHIPS AND MODE TOGGLE */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px] font-medium">
                {(["all", "documents", "images", "spreadsheets"] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                      selectedCategory === cat 
                        ? "bg-green-mid text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* GRID / LIST LAYOUT SWITCH */}
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 gap-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-green-mid/20 text-green-mid" : "text-gray-500 hover:text-white"}`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-green-mid/20 text-green-mid" : "text-gray-500 hover:text-white"}`}
                  title="List View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SYNC BUTTON */}
              <button
                onClick={() => fetchFiles()}
                disabled={loading}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh from Google Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-green-mid" : ""}`} />
              </button>
            </div>
          </div>

          {/* TWO PANEL GRID: LEFT DRAG & DROP ZONE, RIGHT GALLERY LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* FILE DRAG & DROP UPLOADER CONTAINER */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-brand-dark/20 p-5 rounded-2xl border border-white/5 space-y-3.5">
                <h3 className="text-xs font-serif font-bold text-gray-400 uppercase tracking-wider">
                  Cloud Upload Chamber
                </h3>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    dragActive 
                      ? "border-green-mid bg-green-950/10" 
                      : "border-white/10 hover:border-white/20 bg-brand-card/40"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={onFileInputChange}
                  />

                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800">
                    <Cloud className={`w-6 h-6 ${uploading ? "animate-bounce text-green-mid" : "text-gray-400"}`} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">
                      {uploading ? "Uploading to Google Drive..." : "Click to browser upload"}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      or drag agreements, receipts, blueprints here.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 text-[10px] text-gray-400 space-y-1.5">
                  <div className="flex gap-2 items-start">
                    <span className="text-green-mid">✓</span>
                    <span>Files land directly in your private Google Drive</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-green-mid">✓</span>
                    <span>Instant link attachment to your NestList dashboard profile</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-green-mid">✓</span>
                    <span>Access documents globally across multiple screens</span>
                  </div>
                </div>
              </div>

              {/* CURRENT LIST OF ASSOCIATIONS */}
              <div className="bg-brand-dark/20 p-5 rounded-2xl border border-white/5 space-y-3">
                <h3 className="text-xs font-serif font-bold text-gray-400 uppercase tracking-wider">
                  Associated Prop Documents
                </h3>

                {Object.keys(associations).length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-500 font-mono">
                    No files linked yet.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(associations).map(([fileId, assoc]) => {
                      const matchedFile = files.find(f => f.id === fileId);
                      return (
                        <div key={fileId} className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1.5 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-white truncate flex-1 block">
                              {matchedFile ? matchedFile.name : `Doc ID: ${fileId.substring(0, 10)}...`}
                            </span>
                            <button
                              onClick={() => handleRemoveAssociation(fileId)}
                              className="text-gray-500 hover:text-red-400 p-0.5 rounded transition-colors"
                              title="Unlink from property"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/5 pt-1 text-gray-500">
                            <span className="text-brand-gold truncate block max-w-[130px]">
                              📍 {assoc.listingTitle}
                            </span>
                            <span>{new Date(assoc.attachedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* LIVE FILE TREE VIEWER */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-3 bg-brand-dark/15 min-h-[460px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-serif font-bold text-gray-400 uppercase tracking-wider">
                    Drive Explorer ({filteredFiles.length} matched files)
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Updated live
                  </span>
                </div>

                {loading && files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-xs font-mono gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-green-mid" />
                    <span>Synchronizing Drive file indexes...</span>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 text-xs font-mono space-y-2">
                    <HelpCircle className="w-8 h-8 mx-auto text-gray-600" />
                    <p>No compatible files match this category on your Drive.</p>
                    <p className="text-[10px] text-gray-600">Try changing filters or upload a document.</p>
                  </div>
                ) : viewMode === "grid" ? (
                  
                  // GRID VIEW
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
                    {filteredFiles.map(file => {
                      const isLinked = !!associations[file.id];
                      return (
                        <div 
                          key={file.id} 
                          className={`bg-brand-card rounded-xl border p-4 flex flex-col justify-between gap-3 text-xs transition-transform hover:-translate-y-0.5 group ${
                            isLinked ? "border-green-mid bg-green-mid/5" : "border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2.5">
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                              {getFileIcon(file.mimeType)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-xs truncate leading-snug group-hover:text-green-mid transition-colors" title={file.name}>
                                {file.name}
                              </h4>
                              <p className="text-[9px] text-gray-500 font-mono mt-0.5">
                                {formatBytes(file.size)}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                            <span className="text-[9px] text-gray-500 font-mono">
                              {new Date(file.modifiedTime).toLocaleDateString()}
                            </span>

                            <div className="flex gap-2">
                              {/* View / Open External */}
                              {file.webViewLink && (
                                <a 
                                  href={file.webViewLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 text-gray-400 hover:text-white bg-slate-900 rounded border border-white/5 hover:border-white/10"
                                  title="View on Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Link/Attach to property */}
                              <button
                                onClick={() => setSelectedFileForAssociation(file)}
                                className={`p-1 rounded text-xs border transition-colors ${
                                  isLinked 
                                    ? "bg-green-mid/20 text-green-mid border-green-mid/30" 
                                    : "bg-slate-900 text-gray-400 hover:text-white border-white/5"
                                }`}
                                title={isLinked ? `Linked to ${associations[file.id].listingTitle}` : "Link to NestList listing"}
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete file with mandatory confirmaton */}
                              <button
                                onClick={() => setDeleteConfirmationFile(file)}
                                className="p-1 bg-red-950/20 hover:bg-red-950 text-red-400 hover:text-red-200 rounded border border-red-500/10"
                                title="Delete from Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* LINK ATTACHMENT BADGE STATUS PILL */}
                          {isLinked && (
                            <div className="bg-green-mid/10 p-1.5 rounded-lg border border-green-mid/20 flex justify-between items-center text-[10px] text-green-400 font-mono mt-1">
                              <span className="truncate max-w-[150px]">
                                🔗 Attached to {associations[file.id].listingTitle}
                              </span>
                              <button 
                                onClick={() => handleRemoveAssociation(file.id)}
                                className="text-gray-500 hover:text-white font-bold ml-1"
                              >
                                unlink
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  
                  // LIST VIEW
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {filteredFiles.map(file => {
                      const isLinked = !!associations[file.id];
                      return (
                        <div 
                          key={file.id} 
                          className={`bg-brand-card rounded-xl border p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs transition-colors hover:bg-brand-dark/40 ${
                            isLinked ? "border-green-mid bg-green-mid/5" : "border-white/5"
                          }`}
                        >
                          <div className="flex gap-3 items-center min-w-0 flex-1">
                            <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                              {getFileIcon(file.mimeType)}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-white text-xs truncate block" title={file.name}>
                                {file.name}
                              </h4>
                              <div className="flex gap-3 text-[10px] text-gray-500 font-mono mt-0.5">
                                <span>{formatBytes(file.size)}</span>
                                <span>•</span>
                                <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                                
                                {isLinked && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-mid truncate block max-w-[150px]">
                                      Attached: {associations[file.id].listingTitle}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 self-end sm:self-auto shrink-0">
                            {file.webViewLink && (
                              <a 
                                href={file.webViewLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-white bg-slate-900 rounded border border-white/5"
                                title="View on Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              onClick={() => setSelectedFileForAssociation(file)}
                              className={`p-1.5 rounded border ${
                                isLinked 
                                  ? "bg-green-mid/20 text-green-mid border-green-mid/30" 
                                  : "bg-slate-900 text-gray-400 hover:text-white border-white/5"
                              }`}
                              title="Link property file"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmationFile(file)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-950 text-red-300 rounded border border-red-500/10"
                              title="Delete File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MANDATORY EXPLICIT CONFIRMATION MODAL FOR DESTRUCTIVE OPERATION */}
      <AnimatePresence>
        {deleteConfirmationFile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-card/95 border-2 border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl text-white"
            >
              <div className="flex items-center gap-3 text-red-400 font-serif-display text-lg font-bold border-b border-white/5 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <span>Confirm Destructive Delete</span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-gray-300">
                  Are you absolutely sure you want to delete the following file from your Google Drive?
                </p>
                <div className="p-3 bg-brand-dark/60 rounded-xl border border-white/5 flex gap-2.5 items-center font-mono my-2 text-[11px]">
                  {getFileIcon(deleteConfirmationFile.mimeType)}
                  <div className="min-w-0 flex-1">
                    <span className="block text-white font-bold truncate">{deleteConfirmationFile.name}</span>
                    <span className="block text-gray-500 text-[9px] mt-0.5">{formatBytes(deleteConfirmationFile.size)}</span>
                  </div>
                </div>
                <p className="text-red-400 font-mono text-[9px]">
                  ⚠️ Warning: This operation immediately mutates your cloud data and cannot be undone. Space associations will be wiped out.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 font-mono text-xs">
                <button
                  onClick={() => setDeleteConfirmationFile(null)}
                  className="px-4 py-2 bg-slate-900 border border-slate-850 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeFileDelete}
                  className="px-4 py-2 bg-red-900 hover:bg-red-850 text-white rounded-lg transition-colors cursor-pointer font-bold"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROPERTY ASSOCIATION MODAL */}
      <AnimatePresence>
        {selectedFileForAssociation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-card/95 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl text-white"
            >
              <div className="flex items-center gap-2.5 text-white font-serif-display text-lg font-bold border-b border-white/5 pb-2">
                <LinkIcon className="w-5 h-5 text-green-mid shrink-0" />
                <span>Reference Document to Property</span>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-gray-300">
                  Select which active NestList listing or registry file you would like to reference this document against:
                </p>
                
                <div className="p-3 bg-brand-dark/40 rounded-xl border border-white/5 flex gap-2.5 items-center font-mono text-[11px]">
                  {getFileIcon(selectedFileForAssociation.mimeType)}
                  <span className="text-gray-300 truncate font-semibold flex-1 block">{selectedFileForAssociation.name}</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] text-gray-500 uppercase font-mono">
                    Select Listing Target
                  </label>
                  <select
                    value={associationListingId}
                    onChange={e => setAssociationListingId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-green-mid"
                  >
                    <option value="">-- Choose active luxury unit --</option>
                    {listings.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.location.neighborhood})
                      </option>
                    ))}
                    {listings.length === 0 && (
                      <option value="test-rental">Kilimani Skyview Duplex #302 (Active Lease)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 font-mono text-xs">
                <button
                  onClick={() => {
                    setSelectedFileForAssociation(null);
                    setAssociationListingId("");
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-850 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssociation}
                  disabled={!associationListingId}
                  className="px-4 py-2 bg-green-mid text-white hover:bg-green-mid/90 rounded-lg transition-colors cursor-pointer font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Link Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
