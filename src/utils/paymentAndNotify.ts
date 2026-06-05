import emailjs from '@emailjs/browser';
import { getApiUrl } from './apiHelper';

/**
 * Retrieves the exact required listing fee in Kenyan Shillings (KSh)
 * based on the property specifications.
 */
export function getListingFee(propertyType: string, bedrooms: number): number {
  if (propertyType === 'Single Room') return 100;
  if (propertyType === 'Bedsitter') return 200;
  if (propertyType === 'Studio') return 250;
  
  // Handled by bedroom size
  if (bedrooms === 0) return 100; // Single Room fallback
  if (bedrooms === 1) return 500;
  if (bedrooms === 2) return 700;
  if (bedrooms === 3) return 1000;
  if (bedrooms === 4) return 1200;
  return 1500; // 5+ Bedrooms or Commercial fallback
}

/**
 * Triggers an SMS message dispatch through our secure Express Africa's Talking proxy.
 */
export async function sendSMSNotification(to: string, message: string): Promise<any> {
  try {
    const formattedPhone = to.startsWith('0') 
      ? '+254' + to.slice(1) 
      : to.startsWith('254') 
        ? '+' + to 
        : to;

    const res = await fetch(getApiUrl('/api/sms/send'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: formattedPhone, message })
    });
    return await res.json();
  } catch (err) {
    console.warn("⚠️ SMS notification transit skipped:", err);
    return { success: false, error: err };
  }
}

/**
 * Triggers client-side EmailJS transmission to landlords.
 */
export async function sendEmailNotification(
  templateId: 'template_listing_live' | 'template_new_inquiry' | 'template_inquiry_sent',
  templateParams: any
): Promise<any> {
  const serviceId = "service_n3hc2m9";
  const publicKey = "public_key_nestlist"; // Standard public key fallback
  
  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log(`📬 EmailJS sent successfully to ${templateParams.to_email || 'recipient'} with response status:`, response.text);
    return { success: true, details: response.text };
  } catch (err: any) {
    console.warn(`⚠️ EmailJS notify channel error for ${templateId}:`, err);
    return { success: false, error: err };
  }
}

/**
 * Runs active listings lifecycle scans. Automatically expires listings past 30 days,
 * updating the status, and fires off a 3-day countdown warning to land owners via SMS.
 */
export async function checkExpiredListings(
  listings: any[],
  setListings: (updated: any[]) => void
): Promise<void> {
  const updatedListings = [...listings];
  let stateModified = false;
  const now = Date.now();
  const warnsSent = JSON.parse(localStorage.getItem('nestlist_expiry_warns') || '{}');

  for (let i = 0; i < updatedListings.length; i++) {
    const listing = updatedListings[i];
    if (listing.status !== 'active') continue;

    // Use expiresAt or default to 30 days from creation
    const expiresAtStr = listing.expiresAt || new Date(new Date(listing.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const expiresAt = new Date(expiresAtStr).getTime();
    const timeLeft = expiresAt - now;

    if (timeLeft <= 0) {
      // 1. Mark listing as expired
      updatedListings[i] = { ...listing, status: 'expired' };
      stateModified = true;

      // 2. Dispatch SMS notification of expiry
      const landlordPhone = listing.author?.phone || '+254712345678';
      await sendSMSNotification(
        landlordPhone,
        `Hello! Your NestList listing "${listing.title}" has expired after 30 days. Please renew to keep matching clients.`
      );
    } else if (timeLeft <= 3 * 24 * 60 * 60 * 1000) {
      // Within 3-day warning stage, only send if not already notified
      if (!warnsSent[listing.id]) {
        warnsSent[listing.id] = true;
        localStorage.setItem('nestlist_expiry_warns', JSON.stringify(warnsSent));

        // Dispatch 3-day warning SMS
        const landlordPhone = listing.author?.phone || '+254712345678';
        await sendSMSNotification(
          landlordPhone,
          `Hello! Your listing "${listing.title}" on NestList will expire in 3 days. Please visit NestList to renew.`
        );
      }
    }
  }

  if (stateModified) {
    setListings(updatedListings);
    // Synch results back to in-memory server database
    for (const listing of updatedListings) {
      if (listing.status === 'expired') {
        try {
          await fetch(getApiUrl(`/api/listings/${listing.id}/status`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'expired' })
          });
        } catch (fetchErr) {
          console.warn("Express status update offline:", fetchErr);
        }
      }
    }
  }
}
