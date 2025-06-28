<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../auth.php';

Auth::requirePermission('access_whatsapp');

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$reservationId = $_GET['reservation_id'] ?? 0;

try {
    $pdo = connectDB();
    
    // Ambil pengaturan WhatsApp dari database
    $stmt = $pdo->prepare("SELECT * FROM whatsapp_settings LIMIT 1");
    $stmt->execute();
    $whatsappSettings = $stmt->fetch();
    
    if (!$whatsappSettings) {
        throw new Exception("WhatsApp settings not configured");
    }
    
    switch ($action) {
        case 'send_confirmation':
            $stmt = $pdo->prepare("SELECT * FROM reservations WHERE id = ?");
            $stmt->execute([$reservationId]);
            $reservation = $stmt->fetch();
            
            if (!$reservation) {
                throw new Exception("Reservation not found");
            }
            
            $message = formatConfirmationMessage($reservation);
            $response = sendWhatsAppMessage($whatsappSettings, $reservation['whatsapp'], $message);
            
            echo json_encode([
                'success' => true,
                'message' => 'WhatsApp confirmation sent',
                'data' => $response
            ]);
            break;
            
        case 'send_reminder':
            // Implementasi pengiriman reminder
            break;
            
        default:
            throw new Exception("Invalid action");
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function formatConfirmationMessage($reservation) {
    return "📌 *KONFIRMASI PEMBAYARAN KERTAMULYA RESIDENCE*\n\n" .
           "Assalamualaikum Bpk/Ibu {$reservation['full_name']},\n\n" .
           "Terima kasih telah melakukan pembayaran Booking Fee. Berikut detail reservasi Anda:\n\n" .
           "🆔 *Kode Booking*: {$reservation['reservation_code']}\n" .
           "🏡 *Tipe Unit*: {$reservation['house_type']}\n" .
           "💰 *Jumlah Pembayaran*: Rp " . number_format($reservation['amount'], 0, ',', '.') . "\n" .
           "📅 *Jadwal Survei*: " . date('d/m/Y H:i', strtotime($reservation['survey_date'])) . "\n\n" .
           "Status pembayaran Anda sedang *diverifikasi*. Kami akan menginformasikan hasil verifikasi dalam 1x24 jam.\n\n" .
           "Untuk pertanyaan, hubungi:\n📞 0897-7771-080 (Admin)\n\n" .
           "Terima kasih atas kepercayaan Anda 🙏";
}

function sendWhatsAppMessage($settings, $number, $message) {
    $apiUrl = "https://api.watzap.id/v1/send";
    
    $cleanNumber = preg_replace('/[^0-9]/', '', $number);
    if (substr($cleanNumber, 0, 1) === '0') {
        $cleanNumber = '62' . substr($cleanNumber, 1);
    }
    
    $data = [
        'api_key' => $settings['api_key'],
        'sender' => $settings['registered_number'],
        'number' => $cleanNumber,
        'message' => $message
    ];
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}