// --- EMAILJS CONTACT FORM HANDLER (clean, robust) ---
// Replace these with your actual EmailJS IDs from the dashboard
const EMAILJS_PUBLIC_KEY = 'YWhtukfuH-qkAsCjA';
const EMAILJS_SERVICE_ID = 'service_8feaunp';
const EMAILJS_OWNER_TEMPLATE = 'template_2eekgnj';
const EMAILJS_AUTOREPLY_TEMPLATE = 'template_oinmk88'; // replace if different

// Initialize EmailJS
if (typeof emailjs !== 'undefined' && emailjs.init) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
} else {
  console.warn('EmailJS SDK not loaded. Make sure <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script> is present in the page.');
}

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for navigation (small helper)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function(evt) {
    evt.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');

    // Disable UI
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';

    // Read form values safely
    const fromName = (this.querySelector('[name="from_name"]') || {}).value || '';
    const fromEmail = (this.querySelector('[name="from_email"]') || {}).value || '';
    const message = (this.querySelector('[name="message"]') || {}).value || '';

    // Basic validation
    if (!fromName || !fromEmail || !message) {
      console.warn('Validation failed: missing fields');
      if (errorMsg) { errorMsg.textContent = 'Please fill in all fields.'; errorMsg.style.display = 'block'; }
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
      return;
    }

    const ownerParams = {
      from_name: fromName,
      from_email: fromEmail,
      message: message
    };

    try {
      console.log('Sending owner notification with params:', ownerParams);
      const ownerResp = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_OWNER_TEMPLATE, ownerParams);
      console.log('Owner email sent:', ownerResp);

      // Attempt auto-reply
      try {
        const autoParams = {
          to_name: fromName,
          to_email: fromEmail,
          reply_to: fromEmail,
          subject: `Thanks for contacting ${fromName}`,

        };
        console.log('Sending auto-reply with params:', autoParams);
        const autoResp = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE, autoParams);
        console.log('Auto-reply sent:', autoResp);
      } catch (autoErr) {
        console.warn('Auto-reply failed (non-blocking):', autoErr);
        // Helpful guidance when EmailJS returns a 422 "recipients address is empty" error
        if (autoErr && autoErr.status === 422) {
          console.error('EmailJS 422: recipients address is empty. To fix: open your auto-reply template in EmailJS and set the "To" field to the variable name you send (for example {{to_email}}). Also ensure the template uses that same variable in the editor.');
        }
        // Optionally: notify owner about auto-reply failure by sending another owner email or logging externally
      }

      // Success UI
      this.reset();
      if (successMsg) { successMsg.style.display = 'block'; setTimeout(()=> successMsg.style.display='none', 5000); }
      if (errorMsg) errorMsg.style.display = 'none';

    } catch (err) {
      console.error('Failed to send owner email:', err);
      if (errorMsg) { errorMsg.textContent = 'Failed to send message. Please try again later.'; errorMsg.style.display = 'block'; }
      if (successMsg) successMsg.style.display = 'none';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  });
});