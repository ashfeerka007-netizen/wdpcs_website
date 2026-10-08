/**
 * WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY LTD. NO. W 208
 * Official WhatsApp Enquiry Form Handler
 * Destination: Official Society WhatsApp Helpline (+91 8301995940)
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('societyEnquiryForm');
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswerInput = document.getElementById('captchaAnswer');
  const formAlert = document.getElementById('formStatusAlert');
  const consentCheckbox = document.getElementById('privacyConsent');
  const termsCard = document.getElementById('termsConsentCard');

  const SOCIETY_WHATSAPP = '918301995940';

  // Dynamic anti-spam math challenge
  let num1 = Math.floor(Math.random() * 8) + 2;
  let num2 = Math.floor(Math.random() * 8) + 1;
  let expectedCaptcha = num1 + num2;

  function refreshCaptcha() {
    num1 = Math.floor(Math.random() * 8) + 2;
    num2 = Math.floor(Math.random() * 8) + 1;
    expectedCaptcha = num1 + num2;
    if (captchaQuestion) {
      captchaQuestion.textContent = `Security verification: What is ${num1} + ${num2}?`;
    }
    if (captchaAnswerInput) {
      captchaAnswerInput.value = '';
    }
  }

  if (captchaQuestion) {
    refreshCaptcha();
  }

  if (!form) return;

  // Toggle card styling on checkbox state
  if (consentCheckbox && termsCard) {
    termsCard.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => e.stopPropagation());
    });

    consentCheckbox.addEventListener('change', () => {
      if (consentCheckbox.checked) {
        termsCard.classList.remove('has-error');
        termsCard.classList.add('checked');
        if (formAlert) {
          formAlert.style.display = 'none';
        }
      } else {
        termsCard.classList.remove('checked');
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset alert state
    if (formAlert) {
      formAlert.style.display = 'none';
      formAlert.className = 'alert-box';
      formAlert.innerHTML = '';
    }

    if (termsCard) {
      termsCard.classList.remove('has-error');
    }

    const fullName = form.fullName ? form.fullName.value.trim() : '';
    const memberId = form.memberId ? form.memberId.value.trim() : '';
    const phone = form.phone ? form.phone.value.trim() : '';
    const enquiryType = form.enquiryType ? form.enquiryType.value : '';
    const message = form.message ? form.message.value.trim() : '';
    const consent = consentCheckbox ? consentCheckbox.checked : false;
    const captchaVal = captchaAnswerInput ? parseInt(captchaAnswerInput.value.trim(), 10) : NaN;

    // 1. Validate Required Fields
    if (!fullName || !phone || !enquiryType || !message) {
      showFormError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    // 2. Validate Mobile Number
    const phoneClean = phone.replace(/[\s\-\+]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneClean) && !/^\d{10,12}$/.test(phoneClean)) {
      showFormError('Please enter a valid 10-digit mobile contact number.');
      return;
    }

    // 3. Validate Anti-Spam Captcha
    if (isNaN(captchaVal) || captchaVal !== expectedCaptcha) {
      showFormError('Security verification failed. Please enter the correct sum.');
      refreshCaptcha();
      return;
    }

    // 4. Validate Terms & Conditions Consent
    if (!consent) {
      if (termsCard) {
        termsCard.classList.add('has-error');
      }
      showFormError('You must agree to the data privacy and processing terms before submitting.', true);
      return;
    }

    const refNumber = `WDPCS-${Date.now().toString().slice(-6)}`;

    // Construct structured WhatsApp message
    const waMessage = 
      `*OFFICIAL ENQUIRY - WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY (W 208)*\n` +
      `----------------------------------------\n` +
      `👤 *Sender Name:* ${fullName}\n` +
      `📱 *Contact Mobile:* ${phone}\n` +
      `🪪 *Member / Dept ID:* ${memberId || 'General Public / Non-Member'}\n` +
      `📋 *Enquiry Category:* ${enquiryType}\n\n` +
      `💬 *Enquiry Details:*\n${message}\n` +
      `----------------------------------------\n` +
      `🔖 _Reference: ${refNumber}_\n` +
      `🌐 _Transmitted via WDPCS Portal (wdpcs.in)_`;

    const waUrl = `https://wa.me/${SOCIETY_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

    // Open WhatsApp in new tab / app
    const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }

    // Show success modal with direct link
    showSuccessModal(fullName, phone, enquiryType, refNumber, waUrl);
  });

  function showFormError(msg, isTermsError = false) {
    if (!formAlert) return;
    formAlert.className = 'alert-box alert-warning';
    
    if (isTermsError) {
      formAlert.innerHTML = `
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <div style="flex:1;">
          <div><strong>Validation Notice:</strong> You must agree to the data privacy and processing terms before submitting.</div>
          <div style="margin-top:10px; padding:10px 12px; background:#fffbeb; border:1.5px solid #f59e0b; border-radius:6px; display:flex; align-items:flex-start; gap:10px;">
            <input type="checkbox" id="alertConsentCheckbox" style="width:18px; height:18px; margin-top:2px; accent-color:var(--color-primary-700); cursor:pointer; flex-shrink:0;">
            <label for="alertConsentCheckbox" style="cursor:pointer; font-size:0.875rem; color:#78350f; font-weight:600; line-height:1.4; margin:0;">
              I agree to the <a href="terms.html" target="_blank" rel="noopener noreferrer" style="color:#92400e; font-weight:700; text-decoration:underline;">Terms &amp; Conditions</a> and <a href="privacy-policy.html" target="_blank" rel="noopener noreferrer" style="color:#92400e; font-weight:700; text-decoration:underline;">Data Privacy Terms</a>.
            </label>
          </div>
        </div>
      `;

      const alertCheckbox = formAlert.querySelector('#alertConsentCheckbox');
      if (alertCheckbox) {
        alertCheckbox.checked = consentCheckbox ? consentCheckbox.checked : false;
        alertCheckbox.addEventListener('change', () => {
          if (consentCheckbox) {
            consentCheckbox.checked = alertCheckbox.checked;
            consentCheckbox.dispatchEvent(new Event('change'));
          }
          if (alertCheckbox.checked) {
            formAlert.className = 'alert-box alert-success';
            formAlert.innerHTML = `
              <svg viewBox="0 0 24 24" style="width:20px; height:20px; fill:#16a34a; flex-shrink:0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <div><strong>Terms Accepted:</strong> Click <strong>Send Enquiry via WhatsApp</strong> to proceed.</div>
            `;
          }
        });
      }
    } else {
      formAlert.innerHTML = `
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <div><strong>Validation Notice:</strong> ${msg}</div>
      `;
    }
    
    formAlert.style.display = 'flex';
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccessModal(name, phoneNum, enquiryCategory, refId, waUrl) {
    let modal = document.getElementById('enquirySuccessModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'enquirySuccessModal';
      modal.className = 'site-modal active';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header" style="background:#f0fdf4; border-bottom:1px solid #bbf7d0;">
          <h3 class="modal-title" style="color:#166534; display:flex; align-items:center; gap:8px; font-size:1.15rem;">
            <svg style="width:24px; height:24px; fill:#16a34a; flex-shrink:0;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Enquiry Prepared for WhatsApp
          </h3>
          <button type="button" class="modal-close-btn" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.95rem; color:var(--color-neutral-800); line-height:1.6; margin-bottom:1rem;">
            Thank you, <strong>${name || 'Member'}</strong>. Your official enquiry has been formatted and directed to the Society's WhatsApp desk.
          </p>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; font-size:0.85rem; display:flex; flex-direction:column; gap:6px; margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span style="color:#64748b;">Society WhatsApp:</span>
              <strong style="color:#15803d;">+91 8301995940</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span style="color:#64748b;">Sender Mobile:</span>
              <strong style="color:#0f172a;">${phoneNum}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span style="color:#64748b;">Category:</span>
              <strong style="color:#0f172a;">${enquiryCategory}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:2px;">
              <span style="color:#64748b;">Tracking Reference:</span>
              <strong style="color:#1e40af; font-family:monospace;">${refId}</strong>
            </div>
          </div>

          <div style="margin-top:12px; padding:14px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <div>
              <strong style="color:#166534; font-size:0.9rem; display:block;">Click below if WhatsApp didn't open:</strong>
              <span style="color:#15803d; font-size:0.8rem;">Opens WhatsApp with your pre-filled enquiry message.</span>
            </div>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding:10px 18px; font-size:0.95rem;">
              <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:currentColor;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.12 3.65.58.25 1.02.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.29-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47z"/></svg>
              Open WhatsApp Chat
            </a>
          </div>
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-primary btn-sm modal-close-btn">Close</button>
        </div>
      </div>
    `;

    modal.querySelectorAll('.modal-close-btn').forEach(b => {
      b.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
});

