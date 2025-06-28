// Image preview for file uploads
function setupImagePreview(inputId, previewId, previewImgId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const previewImg = document.getElementById(previewImgId);

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file maksimal 2MB');
                e.target.value = '';
                preview.style.display = 'none';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImg.src = event.target.result;
                preview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    });
}

// Initialize image previews
setupImagePreview('ktpPhoto', 'ktpPhotoPreview', 'ktpPhotoPreviewImg');
setupImagePreview('selfiePhoto', 'selfiePhotoPreview', 'selfiePhotoPreviewImg');

// Signature Pads
class SignaturePad {
    constructor(canvasId, hiddenInputId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.hiddenInput = document.getElementById(hiddenInputId);
        this.isLocked = false;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        this.resizeCanvas();
        this.setupDrawing();
        this.setupEventListeners();
    }

    resizeCanvas() {
        const style = getComputedStyle(this.canvas);
        this.canvas.width = parseInt(style.width);
        this.canvas.height = parseInt(style.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setupDrawing() {
        this.clear();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e));
        
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    }

    startDrawing(e) {
        if (this.isLocked) {
            alert('Tanda tangan sudah terkunci. Klik "Hapus" untuk mengubah.');
            return;
        }
        this.isDrawing = true;
        const pos = this.getPosition(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        e.preventDefault();
    }

    draw(e) {
        if (!this.isDrawing || this.isLocked) return;
        
        const pos = this.getPosition(e);
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
        e.preventDefault();
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    getPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        
        if (e.type.includes('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // Scale coordinates to match canvas size
        x = x * (this.canvas.width / rect.width);
        y = y * (this.canvas.height / rect.height);
        
        return { x, y };
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.isLocked = false;
        this.canvas.classList.remove('locked');
        this.hiddenInput.value = '';
    }

    save() {
        if (this.hasSignature()) {
            this.isLocked = true;
            this.canvas.classList.add('locked');
            const signatureData = this.canvas.toDataURL();
            this.hiddenInput.value = signatureData;
            return signatureData;
        }
        return null;
    }

    hasSignature() {
        const blank = document.createElement('canvas');
        blank.width = this.canvas.width;
        blank.height = this.canvas.height;
        return this.canvas.toDataURL() !== blank.toDataURL();
    }
}

// Initialize signature pads
const freelanceSigPad = new SignaturePad('freelanceSignature', 'freelanceSignatureData');
const executiveSigPad = new SignaturePad('executiveSignature', 'executiveSignatureData');

// Clear buttons
document.getElementById('clearFreelanceSig').addEventListener('click', () => freelanceSigPad.clear());
document.getElementById('clearExecutiveSig').addEventListener('click', () => executiveSigPad.clear());

// Save buttons
document.getElementById('saveFreelanceSig').addEventListener('click', () => {
    if (freelanceSigPad.save()) {
        alert('Tanda tangan marketing freelance telah tersimpan dan terkunci');
    } else {
        alert('Harap buat tanda tangan terlebih dahulu');
    }
});

document.getElementById('saveExecutiveSig').addEventListener('click', () => {
    if (executiveSigPad.save()) {
        alert('Tanda tangan marketing executive telah tersimpan dan terkunci');
    } else {
        alert('Harap buat tanda tangan terlebih dahulu');
    }
});

// Form validation
function validateForm() {
    // Check required text fields
    const requiredTextFields = [
        'freelanceName', 'freelancePhone', 'freelanceEmail', 
        'freelanceCity', 'freelanceJob', 'bankName', 
        'accountNumber', 'accountName', 'executiveName'
    ];

    for (const fieldId of requiredTextFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            const fieldName = field.labels ? field.labels[0].textContent : 
                             field.previousElementSibling.textContent;
            alert(`Harap isi field ${fieldName.replace('*', '').trim()}`);
            field.focus();
            return false;
        }
    }

    // Check checkbox
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        alert('Harap centang persetujuan syarat dan ketentuan');
        agreeTerms.focus();
        return false;
    }

    // Phone number validation
    const phone = document.getElementById('freelancePhone').value;
    if (!/^08[0-9]{8,13}$/.test(phone)) {
        alert('Nomor HP/WA tidak valid. Harus dimulai dengan 08 dan terdiri dari 10-15 digit angka');
        document.getElementById('freelancePhone').focus();
        return false;
    }

    // Email validation
    const email = document.getElementById('freelanceEmail').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Format email tidak valid. Contoh: nama@domain.com');
        document.getElementById('freelanceEmail').focus();
        return false;
    }

    // Account number validation
    const accountNumber = document.getElementById('accountNumber').value;
    if (!/^[0-9]+$/.test(accountNumber)) {
        alert('Nomor rekening harus berupa angka saja tanpa karakter khusus');
        document.getElementById('accountNumber').focus();
        return false;
    }

    // Check KTP photo
    const ktpPhoto = document.getElementById('ktpPhoto').files[0];
    if (!ktpPhoto) {
        alert('Harap upload foto KTP');
        return false;
    }

    // Check selfie photo
    const selfiePhoto = document.getElementById('selfiePhoto').files[0];
    if (!selfiePhoto) {
        alert('Harap upload foto selfie bersama marketing executive');
        return false;
    }

    // Check signatures
    if (!document.getElementById('freelanceSignatureData').value) {
        alert('Harap buat dan simpan tanda tangan marketing freelance');
        return false;
    }

    if (!document.getElementById('executiveSignatureData').value) {
        alert('Harap buat dan simpan tanda tangan marketing executive');
        return false;
    }

    return true;
}

// Close modal function
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('freelanceForm').reset();
    freelanceSigPad.clear();
    executiveSigPad.clear();
    document.getElementById('ktpPhotoPreview').style.display = 'none';
    document.getElementById('selfiePhotoPreview').style.display = 'none';
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    
    try {
        const formData = new FormData(document.getElementById('freelanceForm'));
        
        const response = await fetch("submit_freelance.php", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
            document.getElementById('successModal').style.display = 'flex';
            if (data.notificationSent) {
                console.log('Notifikasi WhatsApp terkirim');
            }
        } else {
            throw new Error(data.message || 'Gagal menyimpan data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
        submitBtn.classList.remove('loading');
    }
}

// Initialize form submission
document.getElementById('freelanceForm').addEventListener('submit', handleFormSubmit);