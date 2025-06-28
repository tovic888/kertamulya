document.addEventListener('DOMContentLoaded', function() {
  // State aplikasi
  const state = {
    currentStep: 1,
    totalSteps: 3,
    mainCountdownInterval: null,
    modalCountdownInterval: null,
    reservationData: {},
    paymentAmount: generateRandomAmount(),
    expiryTime: getInitialExpiryTime(),
    csrfToken: generateCsrfToken(),
    formValidators: {
      1: validatePersonalInfo,
      2: validateUnitSelection,
      3: validateAgreement
    },
    // Endpoint API untuk development lokal
    apiUrl: 'http://localhost/kertamulya/admin/api/reservations.php',
    whatsappUrl: 'http://localhost/kertamulya/admin/api/whatsapp.php'
  };

  // Inisialisasi aplikasi
  function init() {
    console.log('[DEBUG] Memulai inisialisasi form...');
    try {
      setupFormControls();
      initEventListeners();
      updateUI();
      setSurveyDateLimits();
      startCountdownTimer();
      console.log('[DEBUG] Inisialisasi berhasil');
    } catch (error) {
      console.error('[ERROR] Gagal inisialisasi:', error);
      showErrorModal('Gagal memulai form', error.message);
    }
  }

  // Setup kontrol form
  function setupFormControls() {
    console.log('[DEBUG] Mengatur kontrol form...');
    setSurveyDateLimits();
    document.getElementById('csrfToken').value = state.csrfToken;
  }

  // Inisialisasi event listeners
  function initEventListeners() {
    console.log('[DEBUG] Mengatur event listeners...');
    initCopyFunctionality();
    initFormNavigation();
    initModals();
    initFormSubmission();
  }

  // Set batas tanggal survey (hari ini sampai 14 hari ke depan)
  function setSurveyDateLimits() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 14);
    
    const surveyDateInput = document.getElementById('surveyDate');
    if (surveyDateInput) {
      surveyDateInput.min = formatDateForInput(today);
      surveyDateInput.max = formatDateForInput(maxDate);
      console.log('[DEBUG] Set batas tanggal survey:', surveyDateInput.min, 'sampai', surveyDateInput.max);
    }
  }

  // Format tanggal untuk input field
  function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  // Update tampilan UI
  function updateUI() {
    console.log('[DEBUG] Memperbarui UI...');
    updateProgressBar();
    updateAmountDisplays();
    updateTimer();
  }

  // Update progress bar
  function updateProgressBar() {
    const progress = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
    const progressLine = document.querySelector('.progress-line');
    
    if (progressLine) {
      progressLine.style.setProperty('--progress', `${progress}%`);
    }
    
    document.querySelectorAll('.progress-step').forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.toggle('completed', stepNumber < state.currentStep);
      step.classList.toggle('active', stepNumber === state.currentStep);
    });
    console.log('[DEBUG] Progress bar diupdate ke step', state.currentStep);
  }

  // Mulai countdown timer
  function startCountdownTimer() {
    if (state.mainCountdownInterval) {
      clearInterval(state.mainCountdownInterval);
    }
    
    updateTimer();
    state.mainCountdownInterval = setInterval(updateTimer, 1000);
    console.log('[DEBUG] Countdown timer dimulai');
  }

  // Update timer
  function updateTimer() {
    const now = new Date();
    const diff = state.expiryTime - now;
    
    if (diff <= 0) {
      clearInterval(state.mainCountdownInterval);
      updateTimerDisplays('00', '00', '00');
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    updateTimerDisplays(
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    );
  }

  // Update tampilan timer
  function updateTimerDisplays(hours, minutes, seconds) {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
    
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    document.querySelectorAll('.timer-display').forEach(el => {
      if (!el.closest('#successModal')) {
        el.textContent = formattedTime;
      }
    });
  }

  // Update tampilan jumlah pembayaran
  function updateAmountDisplays() {
    const formattedAmount = formatCurrency(state.paymentAmount);
    document.querySelectorAll('[id*="Amount"], [id*="amount"]').forEach(el => {
      if (el) {
        el.textContent = formattedAmount;
        if (el.hasAttribute('data-text')) {
          el.setAttribute('data-text', state.paymentAmount);
        }
      }
    });
    console.log('[DEBUG] Jumlah pembayaran diupdate:', formattedAmount);
  }

  // Generate jumlah pembayaran acak
  function generateRandomAmount() {
    const randomDigits = Math.floor(100 + Math.random() * 900);
    return `100${randomDigits}`;
  }

  // Generate kode reservasi
  function generateReservationCode() {
    return 'KR-' + Math.floor(100000 + Math.random() * 900000);
  }

  // Generate CSRF token
  function generateCsrfToken() {
    return 'csrf-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Format mata uang
  function formatCurrency(amount) {
    const amountNum = parseInt(amount) / 1000;
    return 'Rp ' + amountNum.toFixed(3).replace('.', ',');
  }

  // Format tanggal
  function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        return '';
      }
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }

  // Ambil data dari form
  function getFormData() {
    const houseTypeSelect = document.getElementById('houseType');
    const houseTypeOption = houseTypeSelect?.options[houseTypeSelect?.selectedIndex];
    
    return {
      fullName: document.getElementById('fullName')?.value.trim() || '',
      whatsapp: document.getElementById('whatsapp')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      address: sanitizeAddress(document.getElementById('address')?.value.trim() || ''),
      houseType: houseTypeSelect?.value || '',
      houseTypeText: houseTypeOption?.text || '',
      surveyDate: document.getElementById('surveyDate')?.value || '',
      amount: state.paymentAmount,
      csrf_token: state.csrfToken
    };
  }

  // Sanitasi alamat
  function sanitizeAddress(address) {
    const div = document.createElement('div');
    div.textContent = address;
    return div.innerHTML;
  }

  // Validasi step
  function validateStep(step) {
    console.log('[DEBUG] Memvalidasi step', step);
    const validator = state.formValidators[step];
    return validator ? validator() : true;
  }

  // Validasi info personal - DIPERBAIKI dengan debugging
  function validatePersonalInfo() {
    console.log('[DEBUG] Memulai validasi info personal...');
    let isValid = true;
    const whatsappRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Sembunyikan semua pesan error terlebih dahulu
    document.querySelectorAll('.error-message').forEach(el => {
      el.style.display = 'none';
    });

    // Validasi Nama Lengkap
    const fullName = document.getElementById('fullName')?.value.trim() || '';
    console.log('[DEBUG] Nama lengkap:', fullName);
    if (!fullName) {
      document.getElementById('fullNameError').style.display = 'block';
      isValid = false;
      console.log('[VALIDASI] Nama lengkap tidak valid');
    }

    // Validasi WhatsApp
    const whatsapp = document.getElementById('whatsapp')?.value.trim() || '';
    console.log('[DEBUG] Nomor WhatsApp:', whatsapp);
    if (!whatsappRegex.test(whatsapp)) {
      document.getElementById('whatsappError').style.display = 'block';
      isValid = false;
      console.log('[VALIDASI] Nomor WhatsApp tidak valid');
    }

    // Validasi Email
    const email = document.getElementById('email')?.value.trim() || '';
    console.log('[DEBUG] Email:', email);
    if (!emailRegex.test(email)) {
      document.getElementById('emailError').style.display = 'block';
      isValid = false;
      console.log('[VALIDASI] Email tidak valid');
    }

    // Validasi Alamat
    const address = document.getElementById('address')?.value.trim() || '';
    console.log('[DEBUG] Alamat:', address);
    if (!address) {
      document.getElementById('addressError').style.display = 'block';
      isValid = false;
      console.log('[VALIDASI] Alamat tidak valid');
    }

    console.log('[DEBUG] Hasil validasi step 1:', isValid ? 'BERHASIL' : 'GAGAL');
    return isValid;
  }

  // Validasi pemilihan unit
  function validateUnitSelection() {
    console.log('[DEBUG] Memulai validasi pemilihan unit...');
    let isValid = true;
    
    document.getElementById('houseTypeError').style.display = 'none';
    document.getElementById('surveyDateError').style.display = 'none';

    if (!document.getElementById('houseType')?.value) {
      document.getElementById('houseTypeError').style.display = 'block';
      isValid = false;
      console.log('[VALIDASI] Tipe rumah belum dipilih');
    }

    const surveyDate = document.getElementById('surveyDate')?.value;
    if (!surveyDate) {
      document.getElementById('surveyDateError').textContent = 'Harap pilih jadwal survey';
      document.getElementById('surveyDateError').style.display = 'block';
      isValid = false;
      console.log('[VALIDASI] Tanggal survey belum dipilih');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 14);
      maxDate.setHours(23, 59, 59, 999);

      const selectedDate = new Date(surveyDate);
      if (selectedDate < today || selectedDate > maxDate) {
        document.getElementById('surveyDateError').textContent = 'Pilih tanggal dalam 14 hari ke depan';
        document.getElementById('surveyDateError').style.display = 'block';
        isValid = false;
        console.log('[VALIDASI] Tanggal survey tidak dalam rentang yang valid');
      }
    }

    console.log('[DEBUG] Hasil validasi step 2:', isValid ? 'BERHASIL' : 'GAGAL');
    return isValid;
  }

  // Validasi persetujuan
  function validateAgreement() {
    console.log('[DEBUG] Memulai validasi persetujuan...');
    const isAgreed = document.getElementById('agreement')?.checked || false;
    const errorEl = document.getElementById('agreementError');
    
    if (!isAgreed && errorEl) {
      errorEl.style.display = 'block';
      console.log('[VALIDASI] Persetujuan belum dicentang');
      return false;
    }
    
    if (errorEl) errorEl.style.display = 'none';
    console.log('[DEBUG] Hasil validasi step 3:', isAgreed ? 'BERHASIL' : 'GAGAL');
    return true;
  }

  // Inisialisasi navigasi form
  function initFormNavigation() {
    console.log('[DEBUG] Mengatur navigasi form...');
    document.querySelectorAll('.btn-next').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('[DEBUG] Tombol next diklik');
        nextStep();
      });
    });
    
    document.querySelectorAll('.btn-prev').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('[DEBUG] Tombol prev diklik');
        prevStep();
      });
    });
  }

  // Ke step selanjutnya - DIPERBAIKI dengan debugging
  function nextStep() {
    console.log('[DEBUG] Mencoba pindah ke step berikutnya dari step', state.currentStep);
    
    if (!validateStep(state.currentStep)) {
      console.log('[DEBUG] Validasi gagal, tidak bisa lanjut');
      scrollToFirstError();
      return;
    }

    if (state.currentStep === 2) {
      updateConfirmationStep();
    }

    console.log('[DEBUG] Validasi berhasil, pindah ke step', state.currentStep + 1);
    changeStep(state.currentStep + 1);
  }

  // Ke step sebelumnya
  function prevStep() {
    console.log('[DEBUG] Kembali ke step sebelumnya dari step', state.currentStep);
    changeStep(state.currentStep - 1);
  }

  // Ganti step
  function changeStep(newStep) {
    console.log('[DEBUG] Mengubah step dari', state.currentStep, 'ke', newStep);
    document.getElementById(`step${state.currentStep}`)?.classList.remove('active');
    state.currentStep = newStep;
    document.getElementById(`step${state.currentStep}`)?.classList.add('active');
    updateProgressBar();
    scrollToFormTop();
  }

  // Scroll ke error pertama
  function scrollToFirstError() {
    console.log('[DEBUG] Mencari error pertama untuk di-scroll...');
    const firstError = document.querySelector('.error-message[style="display: block;"]');
    if (firstError) {
      console.log('[DEBUG] Error ditemukan:', firstError.id);
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.log('[DEBUG] Tidak ada error yang ditampilkan');
    }
  }

  // Scroll ke atas form
  function scrollToFormTop() {
    console.log('[DEBUG] Scroll ke atas form...');
    document.querySelector('.checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Update step konfirmasi
  function updateConfirmationStep() {
    console.log('[DEBUG] Memperbarui step konfirmasi...');
    const formData = getFormData();
    
    setTextContent('confirm-name', formData.fullName);
    setTextContent('confirm-whatsapp', formData.whatsapp);
    setTextContent('confirm-email', formData.email);
    setTextContent('confirm-houseType', formData.houseTypeText);
    setTextContent('confirm-surveyDate', formatDate(formData.surveyDate));
  }

  // Set teks konten
  function setTextContent(elementId, text) {
    console.log('[DEBUG] Mengatur teks untuk', elementId, ':', text);
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text || '';
    }
  }

  // Inisialisasi fungsi copy
  function initCopyFunctionality() {
    console.log('[DEBUG] Mengatur fungsi copy...');
    document.addEventListener('click', function(e) {
      const copyable = e.target.closest('.copyable');
      if (!copyable) return;

      const textToCopy = copyable.getAttribute('data-text') || copyable.textContent.trim();
      console.log('[DEBUG] Menyalin teks:', textToCopy);
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => showCopyFeedback(copyable))
        .catch(err => console.error('Gagal menyalin teks:', err));
    });
  }

  // Tampilkan feedback copy
  function showCopyFeedback(element) {
    console.log('[DEBUG] Menampilkan feedback copy');
    element.classList.add('copied');
    setTimeout(() => element.classList.remove('copied'), 2000);
  }

  // Inisialisasi modal
  function initModals() {
    console.log('[DEBUG] Mengatur modal...');
    const termsLink = document.getElementById('termsLink');
    if (termsLink) {
      termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[DEBUG] Membuka modal syarat dan ketentuan');
        showModal('termsModal');
      });
    }

    setupModalButton('understandBtn', 'termsModal', () => {
      console.log('[DEBUG] Tombol setuju diklik');
      const agreementCheckbox = document.getElementById('agreement');
      if (agreementCheckbox) agreementCheckbox.checked = true;
    });

    setupModalButton('disagreeBtn', 'termsModal', () => {
      console.log('[DEBUG] Tombol tidak setuju diklik');
      const agreementCheckbox = document.getElementById('agreement');
      if (agreementCheckbox) agreementCheckbox.checked = false;
    });

    setupModalButton('closeSuccessBtnFixed', 'successModal');
    setupModalButton('closeErrorBtn', 'errorModal');
  }

  // Setup tombol modal
  function setupModalButton(buttonId, modalId, callback) {
    console.log('[DEBUG] Mengatur tombol modal', buttonId);
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', () => {
        if (callback) callback();
        hideModal(modalId);
      });
    }
  }

  // Tampilkan modal
  function showModal(modalId) {
    console.log('[DEBUG] Menampilkan modal', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          hideModal(modalId);
        }
      });
    }
  }

  // Sembunyikan modal
  function hideModal(modalId) {
    console.log('[DEBUG] Menyembunyikan modal', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      
      if (modalId === 'successModal' && state.modalCountdownInterval) {
        clearInterval(state.modalCountdownInterval);
        state.modalCountdownInterval = null;
      }
    }
  }

  // Tampilkan modal sukses
  function showSuccessModal(data) {
    console.log('[DEBUG] Menampilkan modal sukses dengan data:', data);
    setTextContent('reservationCodeFixed', data.reservationCode);
    setTextContent('successNameFixed', data.fullName);
    setTextContent('successAmountFixed', formatCurrency(data.amount));
    setTextContent('successUnitFixed', data.houseTypeText);
    setTextContent('successDateFixed', formatDate(data.surveyDate));
    
    startModalCountdown();
    showModal('successModal');
  }

  // Mulai countdown modal
  function startModalCountdown() {
    console.log('[DEBUG] Memulai countdown modal...');
    if (state.modalCountdownInterval) {
      clearInterval(state.modalCountdownInterval);
    }
    
    updateModalTimer();
    state.modalCountdownInterval = setInterval(updateModalTimer, 1000);
  }

  // Update timer modal
  function updateModalTimer() {
    const now = new Date();
    const diff = state.expiryTime - now;
    
    if (diff <= 0) {
      clearInterval(state.modalCountdownInterval);
      setTextContent('successHoursFixed', '00');
      setTextContent('successMinutesFixed', '00');
      setTextContent('successSecondsFixed', '00');
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTextContent('successHoursFixed', hours.toString().padStart(2, '0'));
    setTextContent('successMinutesFixed', minutes.toString().padStart(2, '0'));
    setTextContent('successSecondsFixed', seconds.toString().padStart(2, '0'));
  }

  // Tampilkan modal error
  function showErrorModal(message, details = '') {
    console.log('[DEBUG] Menampilkan modal error:', message, details);
    setTextContent('errorMessage', message);
    
    const errorDetailsEl = document.getElementById('errorDetails');
    if (errorDetailsEl) {
      errorDetailsEl.innerHTML = details ? `<strong>Detail Error:</strong><pre>${details}</pre>` : '';
      errorDetailsEl.style.display = details ? 'block' : 'none';
    }
    
    showModal('errorModal');
  }

  // Inisialisasi submit form
  function initFormSubmission() {
    console.log('[DEBUG] Mengatur submit form...');
    const form = document.getElementById('bookingForm');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
  }

  // Toggle loading state form
  function toggleFormLoading(show) {
    console.log('[DEBUG] Mengubah loading state:', show ? 'ON' : 'OFF');
    const submitBtn = document.getElementById('submitBtn');
    const formLoading = document.getElementById('formLoading');
    
    if (submitBtn) submitBtn.style.display = show ? 'none' : 'block';
    if (formLoading) formLoading.style.display = show ? 'flex' : 'none';
  }

  // Handle submit form
  async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateStep(state.currentStep)) return;
    
    const formData = getFormData();
    toggleFormLoading(true);
    
    try {
        // Generate data reservasi
        const reservationCode = generateReservationCode();
        const reservationData = {
            customer_name: formData.fullName,
            whatsapp: formData.whatsapp,
            email: formData.email,
            address: formData.address,
            property_id: 1,
            amount: parseInt(formData.amount),
            notes: `Jadwal survey: ${formData.surveyDate}`,
            reservation_code: reservationCode,
            status: 'pending',
            expiry_time: state.expiryTime.toISOString(),
            csrf_token: state.csrfToken
        };
        
        // Kirim ke API dengan headers yang benar
        const response = await fetch(state.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reservationData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            state.reservationData = reservationData;
            localStorage.setItem('reservation_data', JSON.stringify(reservationData));
            
            showSuccessModal({
                ...reservationData,
                reservationCode: reservationCode,
                houseTypeText: formData.houseTypeText,
                surveyDate: formData.surveyDate
            });
        } else {
            throw new Error(result.message || 'Gagal memproses reservasi');
        }
    } catch (error) {
        console.error('Error submit form:', error);
        showErrorModal(
            'Terjadi kesalahan saat memproses reservasi. Silakan coba lagi atau hubungi kami via WhatsApp.',
            error.message
        );
    } finally {
        toggleFormLoading(false);
    }
}


  // Fungsi tambahan untuk mendapatkan waktu kadaluarsa awal
  function getInitialExpiryTime() {
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 jam dari sekarang
    console.log('[DEBUG] Waktu kadaluarsa diatur ke:', expiryTime);
    return expiryTime;
  }

  // Mulai aplikasi
  console.log('[DEBUG] Memulai aplikasi checkout...');
  init();
});