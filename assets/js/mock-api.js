// Simulasikan API endpoint untuk development
if (window.location.href.includes('file://') || window.location.href.includes('localhost')) {
  window.mockReservationAPI = function(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          code: 'KR-' + Math.floor(1000 + Math.random() * 9000),
          message: 'Reservasi berhasil dibuat (demo mode)',
          amount: data.amount
        });
      }, 1500); // Simulasi delay jaringan
    });
  };
}