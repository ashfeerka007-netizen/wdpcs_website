/**
 * WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY LTD. NO. W 208
 * WhatsApp Enquiry Facility Handler
 * Official Society WhatsApp: +91 8301995940 | Mailbox: wdpcs.208@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
  const SOCIETY_WHATSAPP = '918301995940';
  const SOCIETY_MAILBOX = 'wdpcs.208@gmail.com';

  const nameInput = document.getElementById('waName');
  const memberIdInput = document.getElementById('waMemberId');
  const categorySelect = document.getElementById('waCategory');
  const messageInput = document.getElementById('waMessage');
  const startChatBtn = document.getElementById('startWhatsAppChatBtn');
  const topicChips = document.querySelectorAll('.wa-topic-chip');

  // 1. Quick Topic Chip Click Handler (1-Tap direct action or auto-fill)
  topicChips.forEach(chip => {
    chip.addEventListener('click', () => {
      topicChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const topic = chip.getAttribute('data-topic');
      const defaultMsg = chip.getAttribute('data-msg');

      if (categorySelect && topic) {
        for (let i = 0; i < categorySelect.options.length; i++) {
          if (categorySelect.options[i].value.toLowerCase().includes(topic.toLowerCase()) || 
              topic.toLowerCase().includes(categorySelect.options[i].value.toLowerCase())) {
            categorySelect.selectedIndex = i;
            break;
          }
        }
      }

      if (messageInput && defaultMsg) {
        messageInput.value = defaultMsg;
        messageInput.focus();
      }
    });
  });

  // 2. Start WhatsApp Chat Action Button
  if (startChatBtn) {
    startChatBtn.addEventListener('click', () => {
      const name = nameInput ? nameInput.value.trim() : '';
      const memberId = memberIdInput ? memberIdInput.value.trim() : '';
      const category = categorySelect ? categorySelect.value : 'General Enquiry';
      let message = messageInput ? messageInput.value.trim() : '';

      // Fallback message if left blank
      if (!message) {
        message = `Hello WDPCS, I would like to make an official enquiry regarding ${category}.`;
      }

      const senderDisplayName = name || 'Officer / Member';
      const refNumber = `WDPCS-${Date.now().toString().slice(-6)}`;

      // Construct formatted WhatsApp message
      const waMessage = 
        `*OFFICIAL ENQUIRY - WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY (W 208)*\n` +
        `----------------------------------------\n` +
        `*Name:* ${senderDisplayName}\n` +
        `*Member / Dept ID:* ${memberId || 'Not Specified (Public / General Member)'}\n` +
        `*Enquiry Category:* ${category}\n\n` +
        `*Enquiry Details:*\n${message}\n` +
        `----------------------------------------\n` +
        `_Tracking Reference: ${refNumber}_\n` +
        `_Submitted via WDPCS Portal (wdpcs.in)_`;

      const waUrl = `https://wa.me/${SOCIETY_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

      // Open WhatsApp chat
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }
});

