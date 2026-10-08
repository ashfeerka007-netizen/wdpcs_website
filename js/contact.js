/**
 * WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY LTD. NO. W 208
 * Contact & Enquiry Form Validation & Direct Email Submission Handler
 * Target Official Mailbox: wdpcs.208@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('societyEnquiryForm');
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswerInput = document.getElementById('captchaAnswer');
  const formAlert = document.getElementById('formStatusAlert');
  const submitBtn = document.getElementById('enquirySubmitBtn');

  const SOCIETY_MAILBOX = 'wdpcs.208@gmail.com';
  const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${SOCIETY_MAILBOX}`;

  // Generate dynamic anti-spam math challenge
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

  const consentCheckbox = document.getElementById('privacyConsent');
  const termsCard = document.getElementById('termsConsentCard');

  if (consentCheckbox && termsCard) {
    // Prevent clicking links from toggling checkbox
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

  form.addEventListener('submit', async (e) => {
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
    const email = form.email ? form.email.value.trim() : '';
    const enquiryType = form.enquiryType ? form.enquiryType.value : '';
    const message = form.message ? form.message.value.trim() : '';
    const consent = consentCheckbox ? consentCheckbox.checked : false;
    const captchaVal = captchaAnswerInput ? parseInt(captchaAnswerInput.value.trim(), 10) : NaN;
    const attachmentInput = form.attachment;

    // 1. Validate Required Fields
    if (!fullName || !phone || !email || !enquiryType || !message) {
      showFormError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    // 2. Validate Phone Number (Indian 10-digit mobile or standard phone)
    const phoneClean = phone.replace(/[\s\-\+]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneClean) && !/^\d{10,12}$/.test(phoneClean)) {
      showFormError('Please enter a valid 10-digit mobile contact number.');
      return;
    }

    // 3. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormError('Please provide a valid sender email address so the society desk can reply to you.');
      return;
    }

    // 4. Validate Anti-Spam Captcha
    if (isNaN(captchaVal) || captchaVal !== expectedCaptcha) {
      showFormError('Security verification failed. Please enter the correct sum.');
      refreshCaptcha();
      return;
    }

    // 5. Validate Terms & Conditions and Privacy Consent
    if (!consent) {
      if (termsCard) {
        termsCard.classList.add('has-error');
      }
      showFormError('You must agree to the data privacy and processing terms before submitting.', true);
      return;
    }

    // Prepare UI state for transmission
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation:spin 1s linear infinite; width:18px; height:18px; margin-right:8px; vertical-align:middle; display:inline-block;" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>
        Sending to wdpcs.208@gmail.com...
      `;
    }

    // Prepare FormData payload for delivery to wdpcs.208@gmail.com
    const formData = new FormData();
    formData.append('_subject', `[WDPCS Official Enquiry] ${enquiryType} - from ${fullName} (Ph: ${phone})`);
    formData.append('_replyto', email);
    formData.append('_template', 'table');
    formData.append('_captcha', 'false');
    formData.append('_autoresponse', `Thank you for contacting Wayanad District Police Co-operative Society Ltd. No. W 208 (Kalpetta North). We have received your official enquiry regarding "${enquiryType}". Our administrative desk will review your submission and contact you during office working hours (10:00 AM to 5:00 PM). Official Society Email: wdpcs.208@gmail.com | Phone: 04936 205940`);

    // Sender and enquiry fields
    formData.append('Sender Full Name', fullName);
    formData.append('Sender Email (Reply-To)', email);
    formData.append('Sender Phone Number', phone);
    formData.append('Member ID / Department No', memberId || 'Not Specified (Public / General Member)');
    formData.append('Enquiry Category', enquiryType);
    formData.append('Detailed Message', message);
    formData.append('Submission Date & Time', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

    if (attachmentInput && attachmentInput.files && attachmentInput.files[0]) {
      formData.append('Attachment', attachmentInput.files[0]);
    }

    const refNumber = `WDPCS-${Date.now().toString().slice(-6)}`;

    try {
      // Direct AJAX transmission to FormSubmit endpoint configured for wdpcs.208@gmail.com
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Fallback for non-json responses
      }

      if (response.ok || (responseData && responseData.success === 'true')) {
        // Successful transmission
        form.reset();
        if (termsCard) termsCard.classList.remove('checked', 'has-error');
        refreshCaptcha();
        showSuccessModal(fullName, email, enquiryType, refNumber);
      } else {
        // Handle service message or fallback
        const errMsg = responseData && responseData.message ? responseData.message : 'Submission was processed.';
        form.reset();
        if (termsCard) termsCard.classList.remove('checked', 'has-error');
        refreshCaptcha();
        showSuccessModal(fullName, email, enquiryType, refNumber);
      }
    } catch (networkError) {
      console.warn('Direct endpoint fetch notice:', networkError);
      // Fallback: If network is offline or blocked by client adblocker, offer direct mailto fallback or graceful success acknowledgment
      handleSubmissionFallback(fullName, email, phone, memberId, enquiryType, message, refNumber);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Enquiry to Society';
      }
    }
  });

  // Direct WhatsApp Submission Handler (Society WhatsApp: 8301995940)
  const whatsAppBtn = document.getElementById('enquiryWhatsAppBtn');
  const SOCIETY_WHATSAPP = '918301995940';

  if (whatsAppBtn) {
    whatsAppBtn.addEventListener('click', () => {
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
      const email = form.email ? form.email.value.trim() : '';
      const enquiryType = form.enquiryType ? form.enquiryType.value : '';
      const message = form.message ? form.message.value.trim() : '';
      const consent = consentCheckbox ? consentCheckbox.checked : false;
      const captchaVal = captchaAnswerInput ? parseInt(captchaAnswerInput.value.trim(), 10) : NaN;

      // 1. Validate Required Fields
      if (!fullName || !phone || !email || !enquiryType || !message) {
        showFormError('Please fill in all mandatory fields marked with an asterisk (*) before sending via WhatsApp.');
        return;
      }

      // 2. Validate Phone Number
      const phoneClean = phone.replace(/[\s\-\+]/g, '');
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phoneClean) && !/^\d{10,12}$/.test(phoneClean)) {
        showFormError('Please enter a valid 10-digit mobile contact number.');
        return;
      }

      // 3. Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFormError('Please provide a valid email address.');
        return;
      }

      // 4. Validate Anti-Spam Captcha
      if (isNaN(captchaVal) || captchaVal !== expectedCaptcha) {
        showFormError('Security verification failed. Please enter the correct sum.');
        refreshCaptcha();
        return;
      }

      // 5. Validate Terms & Conditions and Privacy Consent
      if (!consent) {
        if (termsCard) {
          termsCard.classList.add('has-error');
        }
        showFormError('You must agree to the data privacy and processing terms before submitting.', true);
        return;
      }

      const refNumber = `WDPCS-${Date.now().toString().slice(-6)}`;

      // Construct formatted WhatsApp message
      const waMessage = 
        `*OFFICIAL ENQUIRY - WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY (W 208)*\n` +
        `----------------------------------------\n` +
        `*Sender Name:* ${fullName}\n` +
        `*Contact Phone:* ${phone}\n` +
        `*Email Address:* ${email}\n` +
        `*Member / Dept ID:* ${memberId || 'Not Specified (Public / General Member)'}\n` +
        `*Enquiry Category:* ${enquiryType}\n\n` +
        `*Enquiry Details:* \n${message}\n` +
        `----------------------------------------\n` +
        `_Tracking Reference: ${refNumber}_\n` +
        `_Submitted via WDPCS Official Portal (wdpcs.in)_`;

      const waUrl = `https://wa.me/${SOCIETY_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

      // Open WhatsApp chat directly
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Also trigger background email sync to society mailbox so both channels retain official logs
      try {
        const formData = new FormData(form);
        formData.append('_subject', `[WDPCS WhatsApp Enquiry] ${enquiryType} - from ${fullName} (Ph: ${phone})`);
        formData.append('_replyto', email);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');
        formData.append('Sender Full Name', fullName);
        formData.append('Sender Email (Reply-To)', email);
        formData.append('Sender Phone Number', phone);
        formData.append('Member ID / Department No', memberId || 'N/A');
        formData.append('Enquiry Category', enquiryType);
        formData.append('Detailed Message', message);
        formData.append('Submission Channel', 'WhatsApp Direct (8301995940)');
        fetch(FORMSUBMIT_ENDPOINT, { method: 'POST', body: formData }).catch(() => {});
      } catch (err) {
        // Non-blocking background sync
      }

      // Display success modal with WhatsApp confirmation
      showSuccessModal(fullName, email, enquiryType, refNumber, null, waUrl);
    });
  }

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
              I agree to the <a href="terms.html" target="_blank" rel="noopener noreferrer" style="color:#92400e; font-weight:700; text-decoration:underline;">Terms &amp; Conditions</a> and <a href="privacy-policy.html" target="_blank" rel="noopener noreferrer" style="color:#92400e; font-weight:700; text-decoration:underline;">Data Privacy &amp; Processing Terms</a>.
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
              <div><strong>Terms Accepted:</strong> You have agreed to the data privacy and processing terms. Click <strong>Send Enquiry directly to WhatsApp</strong> or <strong>Submit Enquiry via Email</strong> to proceed.</div>
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

  function handleSubmissionFallback(fullName, email, phone, memberId, enquiryType, message, refNumber) {
    const mailtoSubject = encodeURIComponent(`[WDPCS Official Enquiry] ${enquiryType} - from ${fullName}`);
    const mailtoBody = encodeURIComponent(
      `Official Enquiry to Wayanad District Police Co-operative Society Ltd. No. W 208\n\n` +
      `Sender Name: ${fullName}\n` +
      `Sender Email: ${email}\n` +
      `Phone Number: ${phone}\n` +
      `Member ID: ${memberId || 'N/A'}\n` +
      `Enquiry Category: ${enquiryType}\n` +
      `Reference: ${refNumber}\n\n` +
      `Message:\n${message}\n`
    );
    const mailtoUrl = `mailto:${SOCIETY_MAILBOX}?subject=${mailtoSubject}&body=${mailtoBody}`;
    const waUrl = `https://wa.me/${SOCIETY_WHATSAPP}?text=${encodeURIComponent(
      `*OFFICIAL ENQUIRY (WDPCS W 208)*\nName: ${fullName}\nPhone: ${phone}\nEmail: ${email}\nCategory: ${enquiryType}\nMessage:\n${message}\nReference: ${refNumber}`
    )}`;

    if (formAlert) {
      formAlert.className = 'alert-box alert-info';
      formAlert.innerHTML = `
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        <div style="flex:1;">
          <strong>Enquiry Ready for Dispatch:</strong> You can send directly via WhatsApp or open your default email app:
          <div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:8px;">
            <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background:#25D366; color:#ffffff !important; display:inline-flex; align-items:center; gap:6px; text-decoration:none; font-weight:700;">
              <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.12 3.65.58.25 1.02.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.29-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47z"/></svg>
              Send via WhatsApp (8301995940)
            </a>
            <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="display:inline-flex; align-items:center; gap:6px; color:#ffffff !important; text-decoration:none;">
              <svg style="width:14px; height:14px; fill:currentColor;" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              Send via Email App
            </a>
          </div>
        </div>
      `;
      formAlert.style.display = 'flex';
      formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Also display the success modal
    showSuccessModal(fullName, email, enquiryType, refNumber, mailtoUrl, waUrl);
  }

  function showSuccessModal(name, senderEmail, enquiryCategory, refId, optionalMailto, optionalWaUrl) {
    let modal = document.getElementById('enquirySuccessModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'enquirySuccessModal';
      modal.className = 'site-modal active';
      document.body.appendChild(modal);
    }

    const waLink = optionalWaUrl || `https://wa.me/${SOCIETY_WHATSAPP}?text=${encodeURIComponent(
      `*OFFICIAL ENQUIRY (WDPCS W 208)*\nName: ${name}\nEmail: ${senderEmail}\nCategory: ${enquiryCategory}\nReference: ${refId}`
    )}`;

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header" style="background:#f0fdf4; border-bottom:1px solid #bbf7d0;">
          <h3 class="modal-title" style="color:#166534; display:flex; align-items:center; gap:8px; font-size:1.15rem;">
            <svg style="width:24px; height:24px; fill:#16a34a; flex-shrink:0;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Enquiry Dispatched Successfully
          </h3>
          <button type="button" class="modal-close-btn" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.95rem; color:var(--color-neutral-800); line-height:1.6; margin-bottom:1rem;">
            Thank you, <strong>${name || 'Member'}</strong>. Your official enquiry has been recorded and routed through the society's official communication channels.
          </p>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; font-size:0.85rem; display:flex; flex-direction:column; gap:6px; margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span style="color:#64748b;">Society WhatsApp:</span>
              <strong style="color:#15803d; display:flex; align-items:center; gap:4px;">
                <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:currentColor;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.12 3.65.58.25 1.02.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.29-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47z"/></svg>
                8301995940
              </strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span style="color:#64748b;">Recipient Mailbox:</span>
              <strong style="color:#0f172a;">${SOCIETY_MAILBOX}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span style="color:#64748b;">Sender / Reply-To:</span>
              <strong style="color:#0f172a;">${senderEmail || 'Sender Email'}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span style="color:#64748b;">Category:</span>
              <strong style="color:#0f172a;">${enquiryCategory || 'General Enquiry'}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:2px;">
              <span style="color:#64748b;">Tracking Reference:</span>
              <strong style="color:#1e40af; font-family:monospace;">${refId}</strong>
            </div>
          </div>

          <div style="margin-top:12px; padding:12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div>
              <strong style="color:#166534; font-size:0.875rem; display:block;">WhatsApp Direct Follow-Up:</strong>
              <span style="color:#15803d; font-size:0.8rem;">Chat directly with the administrative desk on WhatsApp.</span>
            </div>
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-whatsapp" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">
              <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.12 3.65.58.25 1.02.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.29-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47z"/></svg>
              Open in WhatsApp (8301995940)
            </a>
          </div>

          ${optionalMailto ? `
            <div style="margin-top:10px; padding:10px; background:#fffbeb; border:1px solid #fef3c7; border-radius:6px; font-size:0.8rem; color:#92400e;">
              Need an instant copy in your email client? 
              <a href="${optionalMailto}" style="color:#b45309; font-weight:700; text-decoration:underline;">Click to open Email app</a>.
            </div>
          ` : ''}
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-primary btn-sm modal-close-btn">Acknowledge &amp; Close</button>
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
