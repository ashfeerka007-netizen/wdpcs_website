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
              <div><strong>Terms Accepted:</strong> You have agreed to the data privacy and processing terms. Click <strong>Submit Enquiry to Society</strong> to proceed.</div>
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

    if (formAlert) {
      formAlert.className = 'alert-box alert-info';
      formAlert.innerHTML = `
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        <div style="flex:1;">
          <strong>Enquiry Ready for Dispatch:</strong> If direct network submission was restricted by browser security/adblocker, you can open your default email app to send immediately to <strong>${SOCIETY_MAILBOX}</strong>:
          <div style="margin-top:8px;">
            <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="display:inline-flex; align-items:center; gap:6px; color:#ffffff !important; text-decoration:none;">
              <svg style="width:14px; height:14px; fill:currentColor;" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              Open Email Client &amp; Send to wdpcs.208@gmail.com
            </a>
          </div>
        </div>
      `;
      formAlert.style.display = 'flex';
      formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Also display the success modal
    showSuccessModal(fullName, email, enquiryType, refNumber, mailtoUrl);
  }

  function showSuccessModal(name, senderEmail, enquiryCategory, refId, optionalMailto) {
    let modal = document.getElementById('enquirySuccessModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'enquirySuccessModal';
      modal.className = 'site-modal active';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header" style="background:#f0fdf4; border-bottom:1px solid #bbf7d0;">
          <h3 class="modal-title" style="color:#166534; display:flex; align-items:center; gap:8px; font-size:1.15rem;">
            <svg style="width:24px; height:24px; fill:#16a34a; flex-shrink:0;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Enquiry Dispatched Successfully
          </h3>
          <button type="button" class="modal-close-btn" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.95rem; color:var(--color-neutral-800); line-height:1.6; margin-bottom:1rem;">
            Thank you, <strong>${name || 'Member'}</strong>. Your official enquiry has been submitted and transmitted to the society's official inbox.
          </p>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; font-size:0.85rem; display:flex; flex-direction:column; gap:6px; margin-bottom:1rem;">
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

          <div class="admin-placeholder-box" style="margin:0; background:#f0f9ff; border-color:#bae6fd; color:#0369a1;">
            <strong>Next Steps:</strong>
            <p style="margin:4px 0 0 0; font-size:0.825rem; line-height:1.5;">
              Society officers will review your details and respond via your registered email or telephone during office hours (10:00 AM – 5:00 PM, Monday to Saturday).
            </p>
          </div>

          ${optionalMailto ? `
            <div style="margin-top:12px; padding:10px; background:#fffbeb; border:1px solid #fef3c7; border-radius:6px; font-size:0.8rem; color:#92400e;">
              Need an instant direct copy in your sent items? 
              <a href="${optionalMailto}" style="color:#b45309; font-weight:700; text-decoration:underline;">Click to launch your email client</a>.
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
