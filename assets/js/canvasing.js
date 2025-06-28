// Image preview for file uploads
document.getElementById('locationPhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('locationPhotoPreviewImg').src = event.target.result;
            document.getElementById('locationPhotoPreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('selfiePhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('selfiePhotoPreviewImg').src = event.target.result;
            document.getElementById('selfiePhotoPreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// Signature Pads
const customerCanvas = document.getElementById('customerSignature');
const marketingCanvas = document.getElementById('marketingSignature');
const customerCtx = customerCanvas.getContext('2d');
const marketingCtx = marketingCanvas.getContext('2d');

// Set canvas size to match display size
function resizeCanvas() {
    const style = getComputedStyle(customerCanvas);
    customerCanvas.width = parseInt(style.width);
    customerCanvas.height = parseInt(style.height);
    
    const style2 = getComputedStyle(marketingCanvas);
    marketingCanvas.width = parseInt(style2.width);
    marketingCanvas.height = parseInt(style2.height);
    
    // Reset canvas background
    customerCtx.fillStyle = 'white';
    customerCtx.fillRect(0, 0, customerCanvas.width, customerCanvas.height);
    marketingCtx.fillStyle = 'white';
    marketingCtx.fillRect(0, 0, marketingCanvas.width, marketingCanvas.height);
    
    // Reset drawing style
    customerCtx.strokeStyle = '#333';
    customerCtx.lineWidth = 2;
    customerCtx.lineCap = 'round';
    customerCtx.lineJoin = 'round';
    
    marketingCtx.strokeStyle = '#333';
    marketingCtx.lineWidth = 2;
    marketingCtx.lineCap = 'round';
    marketingCtx.lineJoin = 'round';
}

// Initialize on load and resize
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Initialize signature pads
function initSignaturePad(canvas, ctx) {
    let isLocked = false;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', draw);
    
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    function startDrawing(e) {
        if (isLocked) {
            alert('Tanda tangan sudah terkunci. Klik "Hapus" untuk mengubah.');
            return;
        }
        isDrawing = true;
        const pos = getPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }
    
    function draw(e) {
        if (!isDrawing || isLocked) return;
        
        const pos = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function getPosition(e) {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        
        if (e.type.includes('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // Scale coordinates to match canvas size
        x = x * (canvas.width / rect.width);
        y = y * (canvas.height / rect.height);
        
        return { x, y };
    }
    
    return {
        clear: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            isLocked = false;
            canvas.classList.remove('locked');
        },
        save: function() {
            if (ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 255)) {
                isLocked = true;
                canvas.classList.add('locked');
                return canvas.toDataURL();
            }
            return null;
        },
        isLocked: function() {
            return isLocked;
        }
    };
}

const customerSigPad = initSignaturePad(customerCanvas, customerCtx);
const marketingSigPad = initSignaturePad(marketingCanvas, marketingCtx);

// Clear buttons
document.getElementById('clearCustomerSig').addEventListener('click', function() {
    customerSigPad.clear();
    document.getElementById('customerSignatureData').value = '';
});

document.getElementById('clearMarketingSig').addEventListener('click', function() {
    marketingSigPad.clear();
    document.getElementById('marketingSignatureData').value = '';
});

// Save buttons
document.getElementById('saveCustomerSig').addEventListener('click', function() {
    const signatureData = customerSigPad.save();
    if (signatureData) {
        document.getElementById('customerSignatureData').value = signatureData;
        alert('Tanda tangan customer telah tersimpan dan terkunci');
    } else {
        alert('Harap buat tanda tangan terlebih dahulu');
    }
});

document.getElementById('saveMarketingSig').addEventListener('click', function() {
    const signatureData = marketingSigPad.save();
    if (signatureData) {
        document.getElementById('marketingSignatureData').value = signatureData;
        alert('Tanda tangan marketing telah tersimpan dan terkunci');
    } else {
        alert('Harap buat tanda tangan terlebih dahulu');
    }
});

// Geolocation
document.getElementById('getLocationBtn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lng;
                document.getElementById('locationUrl').value = `https://www.google.com/maps?q=${lat},${lng}`;
                alert('Lokasi berhasil didapatkan');
            },
            function(error) {
                let errorMessage = 'Gagal mendapatkan lokasi: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Pengguna menolak permintaan geolokasi.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Informasi lokasi tidak tersedia.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Permintaan untuk mendapatkan lokasi pengguna habis waktunya.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage += "Terjadi kesalahan yang tidak diketahui.";
                        break;
                }
                alert(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert('Browser tidak mendukung geolokasi');
    }
});

// Form validation
function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            const fieldName = field.labels ? field.labels[0].textContent : field.previousElementSibling.textContent;
            alert(`Harap isi field ${fieldName}`);
            field.focus();
            return false;
        }
    }
    
    if (!document.getElementById('customerSignatureData').value) {
        alert('Harap simpan tanda tangan customer terlebih dahulu');
        return false;
    }
    
    if (!document.getElementById('marketingSignatureData').value) {
        alert('Harap simpan tanda tangan marketing terlebih dahulu');
        return false;
    }
    
    // Validate phone number format
    const phone = document.getElementById('customerPhone').value;
    if (!/^[0-9]{10,13}$/.test(phone)) {
        alert('Nomor HP harus terdiri dari 10-13 digit angka');
        document.getElementById('customerPhone').focus();
        return false;
    }
    
    // Validate email format if provided
    const email = document.getElementById('customerEmail').value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Format email tidak valid');
        document.getElementById('customerEmail').focus();
        return false;
    }
    
    return true;
}

// Close modal function
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('canvasingForm').reset();
    customerSigPad.clear();
    marketingSigPad.clear();
    document.getElementById('locationPhotoPreview').style.display = 'none';
    document.getElementById('selfiePhotoPreview').style.display = 'none';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('customerSignatureData').value = '';
    document.getElementById('marketingSignatureData').value = '';
}

// Form submission
document.getElementById('canvasingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    
    // Prepare form data
    const formData = new FormData(document.getElementById('canvasingForm'));
    
    fetch('../reportsys/submit_canvasing.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('successModal').style.display = 'flex';
            
            // WhatsApp notification if enabled
            if (data.notificationSent) {
                console.log('WhatsApp notification sent successfully');
            }
        } else {
            throw new Error(data.message || 'Gagal mengirim formulir');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan: ' + error.message);
    })
    .finally(() => {
        submitBtn.classList.remove('loading');
    });
});