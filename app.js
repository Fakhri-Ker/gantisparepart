// 1. Registrasi Service Worker (Syarat PWA & Notifikasi HP)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker Terdaftar!"))
        .catch(err => console.error("Gagal Daftar Service Worker:", err));
}

// 2. Database Komponen Spesifik Mio Sporty 5TL (Karburator & CVT)
const defaultSpareparts = [
    { id: 1, name: "Oli Mesin", lastChange: 12000, interval: 3000, desc: "Ganti tiap 3.000 KM (800ml - SAE 20W-40)" },
    { id: 2, name: "Oli Gardan", lastChange: 12000, interval: 8000, desc: "Ganti tiap 8.000 KM (100ml)" },
    { id: 3, name: "Busi", lastChange: 10000, interval: 8000, desc: "Ganti tiap 8.000 KM (NGK CR7HSA)" },
    { id: 4, name: "Servis Karburator", lastChange: 14000, interval: 4000, desc: "Pembersihan Karburator Mio 5TL" },
    { id: 5, name: "Saringan Udara", lastChange: 5000, interval: 12000, desc: "Tipe basah (oli), wajib ganti baru" },
    { id: 6, name: "V-Belt CVT", lastChange: 0, interval: 20000, desc: "Cek keretakan berkala setiap 10.000 KM" },
    { id: 7, name: "Roller CVT", lastChange: 0, interval: 12000, desc: "Ganti jika peyang (Standar: 11 gram)" },
    { id: 8, name: "Kampas Rem Depan", lastChange: 11000, interval: 10000, desc: "Tipe Cakram" },
    { id: 9, name: "Kampas Rem Belakang", lastChange: 8000, interval: 15000, desc: "Tipe Tromol" },
    { id: 10, name: "Minyak Rem", lastChange: 0, interval: 20000, desc: "Kuras & isi baru (DOT 3 / DOT 4)" }
];

// Ambil data dari LocalStorage jika sudah ada, jika tidak pakai data default
let spareparts = JSON.parse(localStorage.getItem('mio_parts')) || defaultSpareparts;
let currentSavedOdo = localStorage.getItem('mio_odo') || 14500;

// 3. Inisialisasi Tampilan Web Pertama Kali Dimuat
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('currentOdo').value = currentSavedOdo;
    
    // Tampilkan banner notifikasi jika izin belum ditentukan
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        document.getElementById('notiBanner').classList.remove('hidden');
    }
    renderCards(parseInt(currentSavedOdo));
});

// 4. Meminta Izin Akses Notifikasi Sistem OS
function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            document.getElementById('notiBanner').classList.add('hidden');
            triggerNativeNotification("Notifikasi Aktif!", "Mio 5TL Tracker siap mengingatkanmu di handphone.");
        } else {
            alert("Izin ditolak. Peringatan ganti komponen hanya akan muncul lewat popup dalam web saja.");
        }
    });
}

// 5. Fungsi Mengirim Notifikasi Langsung ke Sistem Android / iOS
function triggerNativeNotification(title, message) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/725/725301.png',
                vibrate: [200, 100, 200],
                badge: 'https://cdn-icons-png.flaticon.com/512/725/725301.png'
            });
        });
    }
}

// 6. Fungsi Memunculkan Popup Modal Fallback di Dalam Layar Web
function triggerPopupModal(message) {
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('popupModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('popupModal').classList.add('hidden');
}

// 7. Merender Seluruh Kartu Komponen Ke Layar
function renderCards(currentOdo) {
    const grid = document.getElementById('componentsGrid');
    grid.innerHTML = '';
    let urgentParts = [];

    spareparts.forEach(part => {
        const kmUsed = currentOdo - part.lastChange;
        const kmLeft = part.interval - kmUsed;
        
        let statusColor = "bg-green-500/10 text-green-400 border-green-500/30";
        let statusText = "Kondisi Aman";
        let cardBorder = "border-slate-700";

        if (kmLeft <= 0) {
            statusColor = "bg-red-500/20 text-red-400 border-red-500/40";
            statusText = "WAKTU GANTI!";
            cardBorder = "border-red-500";
            urgentParts.push(part.name);
        } else if (kmLeft <= 500) {
            statusColor = "bg-amber-500/20 text-amber-400 border-amber-500/40";
            statusText = "Siap-siap";
            cardBorder = "border-amber-500";
        }

        const card = `
            <div class="bg-slate-800 p-5 rounded-xl border ${cardBorder} shadow-md transition transform hover:-translate-y-1">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-bold text-white">${part.name}</h3>
                    <span class="text-xs px-2.5 py-1 rounded-md font-semibold border ${statusColor}">${statusText}</span>
                </div>
                <p class="text-xs text-slate-400 mb-4 italic">${part.desc}</p>
                <div class="text-sm space-y-1 text-slate-300">
                    <div class="flex justify-between">
                        <span>Terakhir Ganti:</span>
                        <span class="font-mono">${part.lastChange.toLocaleString('id-ID')} KM</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Sudah Berjalan:</span>
                        <span class="font-mono ${kmUsed > part.interval ? 'text-red-400 font-bold' : ''}">${kmUsed > 0 ? kmUsed.toLocaleString('id-ID') : 0} KM</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t border-slate-700 mt-2">
                        <span class="font-semibold text-slate-400">Sisa Umur:</span>
                        <span class="font-bold font-mono ${kmLeft <= 0 ? 'text-red-400 animate-pulse' : 'text-blue-400'}">${kmLeft > 0 ? kmLeft.toLocaleString('id-ID') + ' KM' : 'SEGERA GANTI!'}</span>
                    </div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-700 flex justify-end">
                    <button onclick="resetComponent(${part.id}, ${currentOdo})" class="text-xs bg-slate-700 hover:bg-blue-600 text-white font-medium px-3 py-1.5 rounded transition">
                        🔄 Set Ganti Baru (Reset)
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });

    // Kirim notifikasi ganda (Sistem HP + Popup Layar) jika ada komponen yang aus
    if (urgentParts.length > 0) {
        const msgText = `Komponen berikut melewati batas aman: ${urgentParts.join(', ')}. Segera lakukan penggantian demi performa Mio 5TL Anda!`;
        triggerNativeNotification("⚠️ Mio 5TL Butuh Servis!", msgText);
        triggerPopupModal(msgText);
    }
}

// 8. Fungsi Update kilometer Odometer
function updateStatus() {
    const odoInput = document.getElementById('currentOdo').value;
    if(!odoInput || odoInput < 0) {
        alert("Masukkan angka kilometer yang valid!");
        return;
    }
    currentSavedOdo = parseInt(odoInput);
    localStorage.setItem('mio_odo', currentSavedOdo);
    renderCards(currentSavedOdo);
}

// 9. Fungsi Reset Komponen ke KM Saat Ini Setelah Selesai Servis/Ganti Baru
function resetComponent(id, currentOdo) {
    if(confirm("Apakah Anda benar-benar sudah mengganti komponen ini dengan yang baru?")) {
        spareparts = spareparts.map(part => {
            if(part.id === id) {
                part.lastChange = currentOdo;
            }
            return part;
        });
        localStorage.setItem('mio_parts', JSON.stringify(spareparts));
        renderCards(currentOdo);
        triggerNativeNotification("✅ Data Diperbarui", "Komponen berhasil di-reset ke KM baru.");
    }
}

/* ==========================================
   LOGIKA POPUP AJAKAN INSTALASI PWA OTOMATIS
   ========================================== */
let deferredPrompt;

// Tangkap sinyal sistem browser yang menyatakan web ini layak di-install
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Tampilkan banner buatan kita jika user belum menutupnya di sesi ini
    if (!sessionStorage.getItem('install_dismissed')) {
        const installBanner = document.getElementById('installBanner');
        if (installBanner) {
            installBanner.classList.remove('hidden');
        }
    }
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User menginstal aplikasi.');
            }
            deferredPrompt = null;
            hideInstallBanner();
        });
    }
}

function dismissInstall() {
    sessionStorage.setItem('install_dismissed', 'true');
    hideInstallBanner();
}

function hideInstallBanner() {
    const installBanner = document.getElementById('installBanner');
    if (installBanner) {
        installBanner.classList.add('hidden');
    }
}

window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    requestNotificationPermission(); // Minta izin notif begitu terpasang
});
