import { useState } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

const LISTING_FEES: Record<string, number> = {
  single_room: 100, bedsitter: 200, studio: 250,
  "1br": 500, "2br": 700, "3br": 1000, "4br": 1200, "5br_plus": 1500,
};

const TYPE_LABELS: Record<string, string> = {
  single_room: "Single Room", bedsitter: "Bedsitter", studio: "Studio Apartment",
  "1br": "1 Bedroom", "2br": "2 Bedroom", "3br": "3 Bedroom",
  "4br": "4 Bedroom", "5br_plus": "5+ Bedroom",
};

const AMENITIES = [
  "Water 24/7", "Borehole", "Parking", "Security Guard",
  "CCTV", "Electric Fence", "Backup Generator",
  "WiFi Ready", "DSTV Ready", "Tiled Floors",
  "Servant Quarter", "Garden", "Balcony",
  "Near Tarmac", "Near School", "Near Shopping Centre",
];

const COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Kericho", "Nyeri", "Thika", "Kitale", "Machakos", "Other",
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  
  .list-prop-modal-container {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #374151;
  }
  
  .overlay {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7);
    z-index: 200; display: flex; align-items: center;
    justify-content: center; padding: 20px;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: #fff; border-radius: 20px;
    width: 100%; max-width: 580px; max-height: 92vh; overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #f1f5f9;
  }
  .modal-header {
    padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: #fff; z-index: 10;
  }
  .modal-header h3 { font-size: 18px; font-weight: 700; color: #1e293b; }
  .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; transition: color 0.15s; }
  .modal-close:hover { color: #64748b; }
  .modal-body { padding: 24px; }

  /* STEP INDICATOR */
  .steps { display: flex; align-items: center; gap: 0; margin-bottom: 24px; }
  .step-item { display: flex; align-items: center; gap: 6px; flex: 1; }
  .step-dot {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
    border: 2px solid #e2e8f0; color: #94a3b8; background: #fff;
    transition: all 0.2s;
  }
  .step-dot.active { border-color: #1E6B4A; background: #1E6B4A; color: #fff; }
  .step-dot.done { border-color: #1E6B4A; background: #E8F3ED; color: #1E6B4A; }
  .step-label { font-size: 11px; font-weight: 500; color: #64748b; white-space: nowrap; }
  .step-label.active { color: #1E6B4A; font-weight: 600; }
  .step-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 4px; }
  .step-line.done { background: #1E6B4A; }

  /* FORM */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 650; margin-bottom: 6px; color: #1e293b; }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 10px 14px; border: 1.5px solid #cbd5e1;
    border-radius: 8px; font-size: 14px; color: #1e293b;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; transition: border-color 0.15s; background: #fff;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #1E6B4A; }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* AMENITIES */
  .amenities-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }
  .amenity-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 10px; border-radius: 8px;
    border: 1.5px solid #e2e8f0; cursor: pointer;
    font-size: 12px; font-weight: 500; color: #334155;
    transition: all 0.15s; background: #fff; user-select: none;
  }
  .amenity-chip:hover { border-color: #1E6B4A; background: #E8F3ED; }
  .amenity-chip.selected { border-color: #1E6B4A; background: #E8F3ED; color: #1E6B4A; }
  .amenity-check {
    width: 14px; height: 14px; border-radius: 3px;
    border: 2px solid #cbd5e1; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; transition: all 0.15s;
  }
  .amenity-chip.selected .amenity-check { background: #1E6B4A; border-color: #1E6B4A; color: #fff; }

  /* IMAGE UPLOAD */
  .upload-zone {
    border: 2px dashed #cbd5e1; border-radius: 10px;
    padding: 32px 20px; text-align: center; cursor: pointer;
    transition: all 0.15s; background: #f8fafc;
  }
  .upload-zone:hover, .upload-zone.drag { border-color: #1E6B4A; background: #E8F3ED; }
  .upload-icon { font-size: 32px; margin-bottom: 8px; }
  .upload-zone p { font-size: 13px; color: #64748b; }
  .upload-zone strong { color: #1E6B4A; }
  .upload-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }

  .image-previews {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 8px; margin-top: 12px;
  }
  .image-preview {
    position: relative; border-radius: 8px; overflow: hidden;
    aspect-ratio: 4/3; background: #E8F3ED;
  }
  .image-preview img { width: 100%; height: 100%; object-fit: cover; }
  .image-remove {
    position: absolute; top: 4px; right: 4px;
    background: rgba(15, 23, 42, 0.7); color: #fff;
    border: none; border-radius: 50%; width: 20px; height: 20px;
    font-size: 11px; cursor: pointer; display: flex;
    align-items: center; justify-content: center; line-height: 1;
  }
  .image-uploading {
    position: absolute; inset: 0; background: rgba(255,255,255,0.85);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: #1E6B4A; font-weight: 600;
  }
  .image-count { font-size: 12px; color: #64748b; margin-top: 6px; }

  /* FEE BADGE */
  .fee-badge {
    background: #FDF4E7; border: 1px solid #F0D5A0;
    border-radius: 10px; padding: 14px 16px; margin-bottom: 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .fee-badge-label { font-size: 13px; color: #64748b; font-weight: 500; }
  .fee-badge-amount { font-size: 20px; font-weight: 700; color: #C9913A; }
  .fee-badge-note { font-size: 11px; color: #94a3b8; margin-top: 2px; }

  /* MPESA */
  .mpesa-box {
    background: #E8F3ED; border-radius: 10px;
    padding: 16px; margin-bottom: 16px;
  }
  .mpesa-box p { font-size: 14px; font-weight: 700; color: #1E6B4A; margin-bottom: 10px; }
  .mpesa-step { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 7px; font-size: 13px; color: #334155; }
  .mpesa-num {
    background: #1E6B4A; color: #fff; width: 20px; height: 20px;
    border-radius: 50%; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* SUMMARY */
  .summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;
  }
  .summary-row:last-child { border-bottom: none; }
  .summary-key { color: #64748b; }
  .summary-val { font-weight: 600; text-align: right; max-width: 60%; color: #1e293b; }
  .amenity-tags { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; }
  .amenity-tag {
    background: #E8F3ED; color: #1E6B4A;
    font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px;
  }

  /* BUTTONS */
  .btn-primary {
    width: 100%; padding: 12px; background: #1E6B4A; color: #fff;
    border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.15s; margin-top: 4px;
  }
  .btn-primary:hover { background: #2D8A60; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-back {
    width: 100%; padding: 11px; background: none; color: #64748b;
    border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px;
    font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.15s; margin-top: 8px;
  }
  .btn-back:hover { border-color: #cbd5e1; color: #334155; }

  /* SUCCESS */
  .success { text-align: center; padding: 24px 0; }
  .success-icon { font-size: 56px; margin-bottom: 16px; }
  .success h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1e293b; }
  .success p { font-size: 14px; color: #64748b; margin-bottom: 6px; }
`;

// ─── UPLOAD IMAGE TO SUPABASE STORAGE ───────────────────────────────────────
async function uploadImage(file: File, landlordId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const filename = `${landlordId}/${Date.now()}.${ext}`;
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/property-images/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": file.type,
      },
      body: file,
    }
  );
  if (!res.ok) throw new Error("Upload failed");
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${filename}`;
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = ["Details", "Amenities", "Photos", "Review", "Payment"];
  return (
    <div className="steps">
      {steps.map((label, i) => {
        const num = i + 1;
        const isDone = num < current;
        const isActive = num === current;
        return (
          <div className="step-item" key={label}>
            <div className={`step-dot ${isDone ? "done" : isActive ? "active" : ""}`}>
              {isDone ? "✓" : num}
            </div>
            <span className={`step-label ${isActive ? "active" : ""}`}>{label}</span>
            {i < steps.length - 1 && <div className={`step-line ${isDone ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

interface ImageItem {
  url: string;
  name: string;
  uploading: boolean;
}

interface FormState {
  title: string;
  location: string;
  county: string;
  type: string;
  price: string;
  description: string;
  amenities: string[];
  images: ImageItem[];
}

export interface ListPropertyModalProps {
  onClose: () => void;
  onSubmit: (newProp: {
    title: string;
    description: string;
    location: string;
    county: string;
    price: number;
    bedrooms: number;
    type: string;
  }, mpesaCode: string) => void;
  landlordId?: string;
  showToast?: (text: string, type?: "success" | "error" | "info") => void;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ListPropertyModal({ 
  onClose, 
  onSubmit, 
  landlordId = "demo-landlord",
  showToast
}: ListPropertyModalProps) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");
  const [drag, setDrag] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<FormState>({
    title: "", location: "", county: "", type: "1br",
    price: "", description: "", amenities: [], images: [],
  });

  const fee = LISTING_FEES[form.type] || 500;

  function update<K extends keyof FormState>(k: K, v: FormState[K]) { 
    setForm(f => ({ ...f, [k]: v })); 
  }

  function toggleAmenity(a: string) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }));
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 6 - form.images.length);
    if (!valid.length) return;
    setUploading(true);
    setErrorMessage("");
    try {
      // In real app: upload to Supabase Storage if configured
      // For demo & sandboxed preview safety: create local object URLs
      const urls = valid.map(f => ({ url: URL.createObjectURL(f), name: f.name, uploading: false }));
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
      if (showToast) {
        showToast("Photos queued successfully!", "success");
      }
    } catch (e: any) {
      setErrorMessage("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    handleImageFiles(e.dataTransfer.files);
  }

  // Final submit handler triggers our real backend pipeline
  function handleFormSubmit() {
    // Generate bedroom numbers based on selection type
    let bedroomsCount = 1;
    if (form.type === "single_room" || form.type === "bedsitter" || form.type === "studio") {
      bedroomsCount = 0;
    } else if (form.type === "1br") {
      bedroomsCount = 1;
    } else if (form.type === "2br") {
      bedroomsCount = 2;
    } else if (form.type === "3br") {
      bedroomsCount = 3;
    } else if (form.type === "4br") {
      bedroomsCount = 4;
    } else if (form.type === "5br_plus") {
      bedroomsCount = 5;
    }

    try {
      // Call onSubmit callback passed from App.tsx
      onSubmit({
        title: form.title,
        description: form.description,
        location: form.location,
        county: form.county,
        price: Number(form.price),
        bedrooms: bedroomsCount,
        type: form.type
      }, mpesaCode);

      // Advance to success page step
      setStep(6);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong when submitting your listing.");
    }
  }

  const step1Valid = form.title && form.location && form.county && form.price;

  return (
    <div className="list-prop-modal-container">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>

          {/* HEADER */}
          <div className="modal-header">
            <h3>
              {step === 1 && "Property Details"}
              {step === 2 && "Amenities"}
              {step === 3 && "Upload Photos"}
              {step === 4 && "Review Listing"}
              {step === 5 && "Pay Listing Fee"}
              {step === 6 && "You're Live!"}
            </h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            {step < 6 && <StepIndicator current={step} />}

            {errorMessage && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", fontSize: "12px", padding: "10px", borderRadius: "6px", marginBottom: "16px", border: "1px solid #fca5a5" }}>
                {errorMessage}
              </div>
            )}

            {/* ── STEP 1: DETAILS ── */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Property Title</label>
                  <input className="form-input" value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. Spacious 2BR in Westlands" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Property Type</label>
                    <select className="form-select" value={form.type} onChange={e => update("type", e.target.value)}>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Rent (KSh)</label>
                    <input className="form-input" type="number" value={form.price} onChange={e => update("price", e.target.value)} placeholder="e.g. 15000" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estate / Area</label>
                    <input className="form-input" value={form.location} onChange={e => update("location", e.target.value)} placeholder="e.g. Westlands" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">County</label>
                    <select className="form-select" value={form.county} onChange={e => update("county", e.target.value)}>
                      <option value="">Select county</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe the property: size, nearby facilities, lease terms..." />
                </div>
                <div className="fee-badge">
                  <div>
                    <div className="fee-badge-label">Listing fee · {TYPE_LABELS[form.type]}</div>
                    <div className="fee-badge-note">Active for 30 days</div>
                  </div>
                  <div className="fee-badge-amount">KSh {fee}</div>
                </div>
                <button className="btn-primary" onClick={() => setStep(2)} disabled={!step1Valid}>
                  Next: Amenities →
                </button>
              </>
            )}

            {/* ── STEP 2: AMENITIES ── */}
            {step === 2 && (
              <>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  Select all that apply — this helps tenants filter listings.
                </p>
                <div className="amenities-grid">
                  {AMENITIES.map(a => (
                    <div
                      key={a}
                      className={`amenity-chip ${form.amenities.includes(a) ? "selected" : ""}`}
                      onClick={() => toggleAmenity(a)}
                    >
                      <span className="amenity-check">{form.amenities.includes(a) ? "✓" : ""}</span>
                      {a}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 12, marginBottom: 16 }}>
                  {form.amenities.length} selected
                </p>
                <button className="btn-primary" onClick={() => setStep(3)}>
                  Next: Upload Photos →
                </button>
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
              </>
            )}

            {/* ── STEP 3: PHOTOS ── */}
            {step === 3 && (
              <>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                  Add up to 6 photos. Clear photos get 3× more inquiries.
                </p>

                {form.images.length < 6 && (
                  <div
                    className={`upload-zone ${drag ? "drag" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => {
                      const el = document.getElementById("img-input");
                      if (el) el.click();
                    }}
                  >
                    <div className="upload-icon">📷</div>
                    <p><strong>Click to upload</strong> or drag and drop</p>
                    <p className="upload-hint">JPG, PNG, WEBP · Max 5MB each · Up to 6 photos</p>
                    <input
                      id="img-input" type="file" accept="image/*"
                      multiple style={{ display: "none" }}
                      onChange={e => handleImageFiles(e.target.files)}
                    />
                  </div>
                )}

                {form.images.length > 0 && (
                  <>
                    <div className="image-previews">
                      {form.images.map((img, i) => (
                        <div className="image-preview" key={i}>
                          <img src={img.url} alt={`preview-${i}`} />
                          {img.uploading && <div className="image-uploading">Uploading...</div>}
                          <button className="image-remove" onClick={() => removeImage(i)}>×</button>
                        </div>
                      ))}
                    </div>
                    <p className="image-count">{form.images.length}/6 photos added</p>
                  </>
                )}

                <button className="btn-primary" onClick={() => setStep(4)} style={{ marginTop: 16 }}>
                  Next: Review →
                </button>
                <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
              </>
            )}

            {/* ── STEP 4: REVIEW ── */}
            {step === 4 && (
              <>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  Review your listing before paying.
                </p>

                {form.images.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
                    {form.images.map((img, i) => (
                      <img key={i} src={img.url} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                    ))}
                  </div>
                )}

                <div>
                  {[
                    ["Title", form.title],
                    ["Type", TYPE_LABELS[form.type]],
                    ["Rent", `KSh ${Number(form.price).toLocaleString()}/mo`],
                    ["Location", `${form.location}, ${form.county}`],
                    ["Description", form.description || "—"],
                  ].map(([k, v]) => (
                    <div className="summary-row" key={k}>
                      <span className="summary-key">{k}</span>
                      <span className="summary-val">{v}</span>
                    </div>
                  ))}
                  <div className="summary-row">
                    <span className="summary-key">Amenities</span>
                    <div className="amenity-tags">
                      {form.amenities.length
                        ? form.amenities.map(a => <span key={a} className="amenity-tag">{a}</span>)
                        : <span style={{ color: "#64748b", fontSize: 13 }}>None selected</span>}
                    </div>
                  </div>
                  <div className="summary-row">
                    <span className="summary-key">Photos</span>
                    <span className="summary-val">{form.images.length} photo{form.images.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-key">Listing fee</span>
                    <span className="summary-val" style={{ color: "#C9913A" }}>KSh {fee}</span>
                  </div>
                </div>

                <button className="btn-primary" onClick={() => setStep(5)} style={{ marginTop: 16 }}>
                  Proceed to Payment →
                </button>
                <button className="btn-back" onClick={() => setStep(3)}>← Back</button>
              </>
            )}

            {/* ── STEP 5: PAYMENT ── */}
            {step === 5 && (
              <>
                <div className="fee-badge">
                  <div>
                    <div className="fee-badge-label">{form.title}</div>
                    <div className="fee-badge-note">{TYPE_LABELS[form.type]} · 30-day listing</div>
                  </div>
                  <div className="fee-badge-amount">KSh {fee}</div>
                </div>

                <div className="mpesa-box">
                  <p>💚 Pay via M-Pesa</p>
                  <div className="mpesa-step"><span className="mpesa-num">1</span> Go to M-Pesa → Lipa na M-Pesa → Pay Bill</div>
                  <div className="mpesa-step"><span className="mpesa-num">2</span> Business No: <strong>522522</strong></div>
                  <div className="mpesa-step"><span className="mpesa-num">3</span> Account No: <strong>NESTLIST</strong></div>
                  <div className="mpesa-step"><span className="mpesa-num">4</span> Amount: <strong>KSh {fee}</strong></div>
                  <div className="mpesa-step"><span className="mpesa-num">5</span> Enter PIN and confirm</div>
                </div>

                <div className="form-group">
                  <label className="form-label">M-Pesa Confirmation Code</label>
                  <input
                    className="form-input"
                    value={mpesaCode}
                    onChange={e => setMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QHX7K2MNBP"
                    style={{ letterSpacing: 2, fontWeight: 700, fontSize: 16 }}
                  />
                </div>

                <button className="btn-primary" onClick={handleFormSubmit} disabled={mpesaCode.length < 8}>
                  Submit Listing
                </button>
                <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 10 }}>
                  Your listing goes live once payment is verified (within 1 hour)
                </p>
                <button className="btn-back" onClick={() => setStep(4)}>← Back</button>
              </>
            )}

            {/* ── STEP 6: SUCCESS ── */}
            {step === 6 && (
              <div className="success">
                <div className="success-icon">🎉</div>
                <h3>Listing Submitted!</h3>
                <p>M-Pesa code <strong>{mpesaCode}</strong> received.</p>
                <p>Your property goes live once we verify payment — usually within 1 hour.</p>
                <p style={{ marginTop: 8, marginBottom: 24, fontSize: 13 }}>
                  We'll send an SMS to confirm when it's active.
                </p>
                <button className="btn-primary" onClick={onClose}>Done</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
