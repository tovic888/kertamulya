// Data angsuran berdasarkan tipe rumah dan tenor
const installmentData = {
    "Standar - Subsidi 166jt": {
        "5": 2982000,
        "10": 1675835,
        "15": 1249454,
        "20": 1043000
    },
    "Standar - Komersil 168jt": {
        "5": 3616968,
        "10": 1233234,
        "15": 1789000,
        "20": 1644000
    },
    "Standar - Komersil Mezzanine 208jt": {
        "5": 4396596,
        "10": 2714602,
        "15": 2173526,
        "20": 1997513
    },
    "Suite - 277jt": {
        "5": 4396596,
        "10": 3726900,
        "15": 2984051,
        "20": 2742402
    },
    "Premium - 408jt": {
        "5": 8953640,
        "10": 5528270,
        "15": 4426371,
        "20": 4067923
    }
};

// Format input nominal dengan titik dan numeric keyboard
function formatNumberInput(input) {
    input.addEventListener('input', function(e) {
        let value = this.value.replace(/[^0-9]/g, '');
        if (value.length > 3) {
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        this.value = value;
    });
    input.setAttribute('inputmode', 'numeric');
}

// Fungsi untuk mengubah format angka dengan titik ke angka biasa
function parseFormattedNumber(formattedNumber) {
    return parseFloat(formattedNumber.replace(/\./g, '')) || 0;
}

// Image preview for file uploads
function setupImagePreview() {
    document.getElementById('customerPhoto').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file maksimal 2MB');
                this.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('customerPhotoPreviewImg').src = event.target.result;
                document.getElementById('customerPhotoPreview').style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });
}

// Signature Pad Implementation
let marketingSigPad;

function setupSignaturePad() {
    const marketingCanvas = document.getElementById('marketingSignature');
    const marketingCtx = marketingCanvas.getContext('2d');
    
    function resizeCanvas() {
        const style = getComputedStyle(marketingCanvas);
        marketingCanvas.width = parseInt(style.width);
        marketingCanvas.height = parseInt(style.height);
        marketingCtx.fillStyle = 'white';
        marketingCtx.fillRect(0, 0, marketingCanvas.width, marketingCanvas.height);
        marketingCtx.strokeStyle = '#333';
        marketingCtx.lineWidth = 2;
        marketingCtx.lineCap = 'round';
        marketingCtx.lineJoin = 'round';
    }

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

    resizeCanvas();
    marketingSigPad = initSignaturePad(marketingCanvas, marketingCtx);

    // Clear signature button
    document.getElementById('clearMarketingSig').addEventListener('click', function() {
        marketingSigPad.clear();
        document.getElementById('marketingSignatureData').value = '';
    });

    // Save signature button
    document.getElementById('saveMarketingSig').addEventListener('click', function() {
        const signatureData = marketingSigPad.save();
        if (signatureData) {
            document.getElementById('marketingSignatureData').value = signatureData;
            alert('Tanda tangan marketing telah tersimpan dan terkunci');
        } else {
            alert('Harap buat tanda tangan terlebih dahulu');
        }
    });
}

// Show/hide KPR section based on payment method
function setupPaymentMethodListener() {
    document.getElementById('paymentMethod').addEventListener('change', function() {
        const paymentMethod = this.value;
        const kprSection = document.getElementById('kprSection');
        
        if (paymentMethod === 'KPR Subsidi' || paymentMethod === 'KPR Komersial') {
            kprSection.style.display = 'block';
            document.getElementById('documentRequirements').style.display = 'block';
            
            if (paymentMethod === 'KPR Subsidi') {
                const houseType = document.getElementById('houseType').value;
                if (houseType !== 'Standar - Subsidi 166jt') {
                    alert('KPR Subsidi hanya tersedia untuk Tipe Standar Subsidi');
                    document.getElementById('houseType').focus();
                    this.value = '';
                    kprSection.style.display = 'none';
                    document.getElementById('documentRequirements').style.display = 'none';
                    return;
                }
                document.getElementById('incomeHint').textContent = 'Minimal Rp2.500.000 - Maksimal Rp12.000.000';
            } else {
                const houseType = document.getElementById('houseType').value;
                if (houseType === 'Standar - Subsidi 166jt') {
                    alert('KPR Komersial tidak tersedia untuk Tipe Standar Subsidi');
                    document.getElementById('houseType').focus();
                    this.value = '';
                    kprSection.style.display = 'none';
                    document.getElementById('documentRequirements').style.display = 'none';
                    return;
                }
                document.getElementById('incomeHint').textContent = 'Masukkan angka tanpa titik atau koma';
            }
            
            document.getElementById('customerAge').value = '';
            document.getElementById('tenor').innerHTML = '<option value="" selected disabled>Pilih Tenor</option>';
            document.getElementById('installmentResult').textContent = '-';
            document.getElementById('dtiResult').textContent = '-';
            document.getElementById('approvalResult').textContent = '-';
            document.getElementById('approvalNotes').textContent = '';
            document.getElementById('dpInfo').style.display = 'none';
        } else {
            kprSection.style.display = 'none';
            document.getElementById('documentRequirements').style.display = 'none';
        }
    });
}

// Update tenor options based on age (max 60 years now)
function setupAgeListener() {
    document.getElementById('customerAge').addEventListener('input', function() {
        const age = parseInt(this.value) || 0;
        const tenorSelect = document.getElementById('tenor');
        
        if (age < 20 || age > 60) {
            tenorSelect.innerHTML = '<option value="" selected disabled>Usia tidak memenuhi syarat (20-60 tahun)</option>';
            return;
        }
        
        const maxTenor = 60 - age;
        let tenorOptions = [];
        
        if (maxTenor >= 20) tenorOptions.push(20);
        if (maxTenor >= 15) tenorOptions.push(15);
        if (maxTenor >= 10) tenorOptions.push(10);
        if (maxTenor >= 5) tenorOptions.push(5);
        
        if (tenorOptions.length === 0) {
            tenorSelect.innerHTML = '<option value="" selected disabled>Usia tidak memenuhi syarat tenor</option>';
            return;
        }
        
        tenorSelect.innerHTML = '<option value="" selected disabled>Pilih Tenor</option>';
        tenorOptions.forEach(tenor => {
            tenorSelect.innerHTML += `<option value="${tenor}">${tenor} Tahun</option>`;
        });
        
        document.getElementById('installmentResult').textContent = '-';
    });
}

// Bank recommendation based on job
function setupJobListener() {
    document.getElementById('customerJob').addEventListener('change', function() {
        const job = this.value;
        const bankRecommendation = document.getElementById('bankRecommendation');
        const bankRecommendationText = document.getElementById('bankRecommendationText');
        
        if (job === 'PNS' || job === 'TNI/Polri') {
            bankRecommendation.style.display = 'block';
            bankRecommendationText.innerHTML = `
                <p>Disarankan untuk KPR di:</p>
                <ul>
                    <li>BSI (Bank Syariah Indonesia)</li>
                    <li>BJB Syariah</li>
                </ul>
            `;
        } else if (job === 'Swasta' || job === 'Profesional') {
            bankRecommendation.style.display = 'block';
            bankRecommendationText.innerHTML = `
                <p>Disarankan untuk KPR di:</p>
                <ul>
                    <li>BTN Syariah</li>
                </ul>
            `;
        } else if (job === 'Wiraswasta') {
            bankRecommendation.style.display = 'block';
            bankRecommendationText.innerHTML = `
                <p>Disarankan untuk KPR di:</p>
                <ul>
                    <li>Bank BTN Syariah</li>
                </ul>
            `;
        } else {
            bankRecommendation.style.display = 'none';
        }
    });
}

// Show/hide credit status based on debt value
function setupDebtListener() {
    document.getElementById('customerDebt').addEventListener('input', function() {
        const debtValue = parseFormattedNumber(this.value);
        const creditStatusGroup = document.getElementById('creditStatusGroup');
        
        if (debtValue > 0) {
            creditStatusGroup.style.display = 'block';
        } else {
            creditStatusGroup.style.display = 'none';
            document.getElementById('creditStatus1').checked = true;
        }
        
        if (document.getElementById('customerIncome').value) {
            calculateDTI();
        }
    });
}

// Credit status change handler
function setupCreditStatusListener() {
    document.querySelectorAll('input[name="creditStatus"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const lateFrequencySelect = document.getElementById('lateFrequency');
            
            if (this.value === 'Pernah Terlambat') {
                lateFrequencySelect.style.display = 'inline-block';
            } else {
                lateFrequencySelect.style.display = 'none';
            }
            
            if (document.getElementById('customerIncome').value) {
                calculateDTI();
            }
        });
    });
}

// Late frequency change handler
function setupLateFrequencyListener() {
    document.getElementById('lateFrequency').addEventListener('change', function() {
        if (document.getElementById('customerIncome').value) {
            calculateDTI();
        }
    });
}

// Feature checklist update
function updateFeatureChecklist() {
    const houseType = document.getElementById('houseType').value;
    const featureChecklist = document.getElementById('featureChecklist');
    const standardChecklist = document.getElementById('standardChecklist');
    const suitePremiumChecklist = document.getElementById('suitePremiumChecklist');
    
    if (!featureChecklist || !standardChecklist || !suitePremiumChecklist) return;
    
    if (houseType) {
        featureChecklist.style.display = 'block';
        standardChecklist.style.display = 'none';
        suitePremiumChecklist.style.display = 'none';
        
        if (houseType.includes('Standar - Subsidi') || houseType.includes('Standar - Komersil')) {
            standardChecklist.style.display = 'block';
            document.getElementById('standardInfo1').required = true;
            document.getElementById('suitePremiumInfo1').required = false;
        } else if (houseType.includes('Suite') || houseType.includes('Premium')) {
            suitePremiumChecklist.style.display = 'block';
            document.getElementById('suitePremiumInfo1').required = true;
            document.getElementById('standardInfo1').required = false;
        }
    } else {
        featureChecklist.style.display = 'none';
    }
}

// Calculate installment when house type or tenor changes
function setupHouseTypeListener() {
    document.getElementById('houseType').addEventListener('change', function() {
        updateFeatureChecklist();
        calculateInstallment();
    });
}

function setupTenorListener() {
    document.getElementById('tenor').addEventListener('change', calculateInstallment);
}

function calculateInstallment() {
    const houseType = document.getElementById('houseType').value;
    const tenor = document.getElementById('tenor').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!houseType || !tenor) return;
    
    const installment = installmentData[houseType][tenor];
    
    let adminInfo = '';
    
    // Clear any existing admin info first
    const existingAdminInfo = document.querySelector('.admin-info');
    if (existingAdminInfo) {
        existingAdminInfo.remove();
    }
    
    // Only show admin info for KPR options
    if (paymentMethod === 'KPR Subsidi' || paymentMethod === 'KPR Komersial') {
        if (paymentMethod === 'KPR Subsidi' && houseType === 'Standar - Subsidi 166jt' && tenor === '20') {
            adminInfo = `
                <div class="admin-info">
                    <p><strong>Biaya Administrasi Bank:</strong> Free/Gratis (Tidak ada biaya apapun)</p>
                    <p class="hint">Khusus KPR Subsidi tenor 20 tahun</p>
                </div>
            `;
        } else if (paymentMethod === 'KPR Komersial') {
            adminInfo = `
                <div class="admin-info">
                    <p><strong>Biaya Administrasi Bank:</strong> Rp2.500.000 - Rp4.000.000</p>
                    <p class="hint">(untuk asuransi dan Hold angsuran Antara 1X atau 2X di akhir)</p>
                </div>
            `;
        } else {
            adminInfo = `
                <div class="admin-info">
                    <p><strong>Biaya Administrasi Bank:</strong> Sesuai ketentuan bank Kisaran 3,5 - 5 juta untuk subsidi</p>
                </div>
            `;
        }
    }
    
    document.getElementById('installmentResult').innerHTML = `
        <p>Tipe Rumah: <strong>${houseType}</strong></p>
        <p>Tenor: <strong>${tenor} Tahun</strong></p>
        <p class="installment-result-value">Angsuran Bulanan: Rp${installment.toLocaleString('id-ID')}</p>
        ${adminInfo}
    `;
    
    if (document.getElementById('customerIncome').value) {
        calculateDTI();
    }
}

// DTI Calculation
function setupIncomeListener() {
    document.getElementById('customerIncome').addEventListener('input', calculateDTI);
}

function calculateDTI() {
    const income = parseFormattedNumber(document.getElementById('customerIncome').value);
    const debt = parseFormattedNumber(document.getElementById('customerDebt').value);
    const installmentText = document.getElementById('installmentResult').textContent;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const creditStatus = document.querySelector('input[name="creditStatus"]:checked')?.value;
    const lateFrequency = document.getElementById('lateFrequency').value;
    
    // Validasi khusus KPR Subsidi
    if (paymentMethod === 'KPR Subsidi') {
        if (income < 2500000 || income > 12000000) {
            document.getElementById('approvalResult').textContent = "TIDAK DISETUJUI";
            document.getElementById('approvalResult').className = "result-approval rejected";
            document.getElementById('approvalNotes').textContent = "Penghasilan tidak memenuhi syarat KPR Subsidi (Rp2.500.000 - Rp12.000.000)";
            return;
        }
    }
    
    if (!installmentText.includes('Angsuran Bulanan:')) return;
    
    const installment = parseFloat(installmentText.split('Rp')[1].replace(/\./g, '')) || 0;
    if (income <= 0 || installment <= 0) return;
    
    // Perhitungan DTI yang benar
    let totalDebtPayment = installment + debt;
    let dtiRatio = (totalDebtPayment / income) * 100;
    let adjustmentFactor = 1;
    
    // Adjust DTI untuk riwayat kredit buruk
    if (creditStatus === 'Pernah Terlambat') {
        if (lateFrequency === '1 kali') {
            adjustmentFactor = 1.05;
        } else if (lateFrequency === '2 kali') {
            adjustmentFactor = 1.1;
        } else if (lateFrequency === '3 kali') {
            adjustmentFactor = 1.15;
        } else if (lateFrequency === '>3 kali') {
            adjustmentFactor = 1.2;
        }
        dtiRatio *= adjustmentFactor;
    }
    
    document.getElementById('dtiResult').innerHTML = `
        <p>Penghasilan: Rp${income.toLocaleString('id-ID')}/bulan</p>
        <p>Cicilan KPR: Rp${installment.toLocaleString('id-ID')}/bulan</p>
        <p>Beban Cicilan Lain: Rp${debt.toLocaleString('id-ID')}/bulan</p>
        <p>Total Beban: Rp${totalDebtPayment.toLocaleString('id-ID')}/bulan</p>
        <p><strong>DTI: ${dtiRatio.toFixed(1)}%</strong></p>
        ${creditStatus === 'Pernah Terlambat' ? `<p class="hint">* DTI disesuaikan dengan faktor risiko kredit (${adjustmentFactor}x)</p>` : ''}
    `;
    
    updateDPInfo(dtiRatio, paymentMethod);
    updateApprovalResult(dtiRatio, creditStatus, lateFrequency, paymentMethod);
}

function updateDPInfo(dtiRatio, paymentMethod) {
    const dpInfo = document.getElementById('dpInfo');
    const dpInfoText = document.getElementById('dpInfoText');
    
    dpInfo.style.display = 'block';
    
    if (paymentMethod === 'KPR Subsidi') {
        if (dtiRatio <= 30) {
            dpInfoText.innerHTML = '<p>Kemungkinan besar bisa mendapatkan DP 0% (sesuai kebijakan bank)</p>';
        } else if (dtiRatio <= 40) {
            dpInfoText.innerHTML = '<p>Mungkin perlu DP kecil (5-10%) tergantung kebijakan bank</p>';
        } else if (dtiRatio <= 50) {
            dpInfoText.innerHTML = '<p>Kemungkinan perlu DP signifikan (10-20%) karena DTI mendekati batas maksimal</p>';
        } else {
            dpInfoText.innerHTML = '<p>Perlu DP besar (>20%) atau pertimbangan khusus dari bank</p>';
        }
    } else {
        if (dtiRatio <= 30) {
            dpInfoText.innerHTML = '<p>Kemungkinan besar bisa mendapatkan DP minimum sesuai kebijakan bank</p>';
        } else if (dtiRatio <= 40) {
            dpInfoText.innerHTML = '<p>Mungkin perlu DP lebih tinggi (20-30%) tergantung kebijakan bank</p>';
        } else {
            dpInfoText.innerHTML = '<p>Kemungkinan perlu DP signifikan (>30%) karena penghasilan belum mencukupi syarat kredit bank</p>';
        }
    }
}

function updateApprovalResult(dtiRatio, creditStatus, lateFrequency, paymentMethod) {
    const approvalResult = document.getElementById('approvalResult');
    const approvalNotes = document.getElementById('approvalNotes');
    
    let status, notes, statusClass;
    let baseDTI = dtiRatio;
    
    if (creditStatus === 'Pernah Terlambat') {
        baseDTI = dtiRatio * 1.2;
    }
    
    if (paymentMethod === 'KPR Subsidi') {
        // Aturan khusus KPR Subsidi
        if (baseDTI > 50) {
            status = "TIDAK DISETUJUI";
            notes = "DTI melebihi 50%. Tidak memenuhi syarat KPR Subsidi.";
            statusClass = "rejected";
        } else if (baseDTI > 40) {
            status = "DISETUJUI DENGAN CATATAN";
            notes = "DTI mendekati batas maksimal (40-50%). Bank mungkin meminta DP lebih tinggi atau dokumen tambahan.";
            statusClass = "consideration";
        } else {
            status = "DISETUJUI";
            notes = "DTI dalam batas aman. Memenuhi syarat KPR Subsidi.";
            statusClass = "approved";
        }
    } else {
        // Aturan untuk KPR Komersial
        if (baseDTI > 50) {
            status = "TIDAK DISETUJUI";
            notes = "DTI melebihi 50%. Risiko tinggi untuk disetujui bank.";
            statusClass = "rejected";
        } else if (baseDTI > 40) {
            status = "PERLU PERTIMBANGAN";
            notes = "DTI mendekati batas aman (40-50%). Perlu dokumen tambahan atau negosiasi dengan bank.";
            statusClass = "consideration";
        } else {
            status = "DISETUJUI";
            notes = "DTI dalam batas aman (di bawah 40%). Memenuhi syarat bank.";
            statusClass = "approved";
        }
    }
    
    if (creditStatus === 'Pernah Terlambat') {
        notes += `\nCatatan: Riwayat kredit pernah terlambat ${lateFrequency}.`;
    }
    
    approvalResult.textContent = status;
    approvalResult.className = `result-approval ${statusClass}`;
    approvalNotes.textContent = notes;
}

// Form validation
function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            // Skip validation for hidden required fields
            if (field.offsetParent === null) continue;
            
            const fieldName = field.labels ? field.labels[0].textContent : field.previousElementSibling.textContent;
            alert(`Harap isi field ${fieldName}`);
            field.focus();
            return false;
        }
    }
    
    const phone = document.getElementById('customerPhone').value;
    if (!/^[0-9]{10,13}$/.test(phone)) {
        alert('Nomor HP harus terdiri dari 10-13 digit angka');
        document.getElementById('customerPhone').focus();
        return false;
    }
    
    const email = document.getElementById('customerEmail').value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Format email tidak valid');
        document.getElementById('customerEmail').focus();
        return false;
    }
    
    const referralSource = document.querySelector('input[name="referralSource"]:checked');
    if (!referralSource) {
        alert('Harap pilih sumber mengetahui Kertamulya Residence');
        return false;
    }
    
    const kprSection = document.getElementById('kprSection');
    if (kprSection.style.display === 'block') {
        const age = parseInt(document.getElementById('customerAge').value);
        if (age < 20 || age > 60) {
            alert('Usia untuk KPR harus antara 20-60 tahun');
            document.getElementById('customerAge').focus();
            return false;
        }
        
        if (!document.getElementById('tenor').value) {
            alert('Harap pilih tenor KPR');
            document.getElementById('tenor').focus();
            return false;
        }
        
        const paymentMethod = document.getElementById('paymentMethod').value;
        const income = parseFormattedNumber(document.getElementById('customerIncome').value);
        
        if (paymentMethod === 'KPR Subsidi' && (income < 2500000 || income > 12000000)) {
            alert('Untuk KPR Subsidi, penghasilan harus antara Rp2.500.000 - Rp12.000.000');
            document.getElementById('customerIncome').focus();
            return false;
        }
    }
    
    if (!document.getElementById('marketingSignatureData').value) {
        alert('Harap simpan tanda tangan marketing terlebih dahulu');
        return false;
    }
    
    // Validasi feature checklist
    const houseType = document.getElementById('houseType').value;
    if (houseType.includes('Standar - Subsidi') || houseType.includes('Standar - Komersil')) {
        if (!document.getElementById('standardInfo1').checked) {
            alert('Harap centang checklist penjelasan fitur untuk tipe rumah standar');
            return false;
        }
    } else if (houseType.includes('Suite') || houseType.includes('Premium')) {
        if (!document.getElementById('suitePremiumInfo1').checked) {
            alert('Harap centang checklist penjelasan fitur untuk tipe suite/premium');
            return false;
        }
    }
    
    return true;
}

// Close modal function
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('inhouseForm').reset();
    marketingSigPad.clear();
    document.getElementById('customerPhotoPreview').style.display = 'none';
    document.getElementById('kprSection').style.display = 'none';
    document.querySelectorAll('input[name="referralSource"]').forEach(radio => {
        radio.checked = false;
    });
    // Set default date
    setDefaultVisitDate();
}

// Set today's date as default visit date
function setDefaultVisitDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('visitDate').value = formattedDate;
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    
    try {
        const formData = new FormData(document.getElementById('inhouseForm'));
        
        const response = await fetch("submit_inhouse.php", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
            document.getElementById('successModal').style.display = 'flex';
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

// Initialize the application
function initApp() {
    // Setup all listeners
    setupImagePreview();
    setupSignaturePad();
    setupPaymentMethodListener();
    setupAgeListener();
    setupJobListener();
    setupDebtListener();
    setupCreditStatusListener();
    setupLateFrequencyListener();
    setupHouseTypeListener();
    setupTenorListener();
    setupIncomeListener();
    
    // Apply number formatting
    formatNumberInput(document.getElementById('customerIncome'));
    formatNumberInput(document.getElementById('customerDebt'));
    
    // Set default date
    setDefaultVisitDate();
    
    // Update feature checklist on load
    updateFeatureChecklist();
    
    // Initialize form submission
    document.getElementById('inhouseForm').addEventListener('submit', handleFormSubmit);
}

// Run the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle window resize
window.addEventListener('resize', function() {
    const marketingCanvas = document.getElementById('marketingSignature');
    if (marketingCanvas) {
        const ctx = marketingCanvas.getContext('2d');
        const style = getComputedStyle(marketingCanvas);
        marketingCanvas.width = parseInt(style.width);
        marketingCanvas.height = parseInt(style.height);
        
        // Redraw signature if it exists
        const signatureData = document.getElementById('marketingSignatureData').value;
        if (signatureData && marketingSigPad.isLocked()) {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, marketingCanvas.width, marketingCanvas.height);
            };
            img.src = signatureData;
        }
    }
});