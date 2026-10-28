import { formatRupiah, hitungStok, ketahananStock, distrbusiModal, filterData, tambahKeranjang, hapusKeranjang, kurangKeranjang } from "./helpers.js";

//DARK MODE
const themeToggleButton = document.getElementById('theme-toggle');

themeToggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});

// LOCAL STORAGE
const appState = {
    konfToko: {},
    daftarKategori: [],
    daftarProduk: [],
    riwayatAktivitas: [],
    keranjang: []
};

// FUNGSI UNTUK MENYIMPAN PERUBAHAN KE LOCALSTORAGE
function simpanLocal() {
    localStorage.setItem('omnipulse_data', JSON.stringify(appState));
}

async function ambilData() {
    try {
        const dataLokal = localStorage.getItem('omnipulse_data');

        if (dataLokal) {
            const parsedData = JSON.parse(dataLokal);
            appState.konfToko = parsedData.konfToko;
            appState.daftarKategori = parsedData.daftarKategori;
            appState.daftarProduk = parsedData.daftarProduk;
            appState.riwayatAktivitas = parsedData.riwayatAktivitas;
            appState.keranjang = parsedData.keranjang || []; 
            
            console.log('Data berhasil dimuat dari LocalStorage');
        } else {
            const dataJson = await fetch('./data/dummyData.json');
            const dataObject = await dataJson.json();

            appState.konfToko = dataObject.config;
            appState.daftarKategori = dataObject.categories;
            appState.daftarProduk = dataObject.products;
            appState.riwayatAktivitas = dataObject.activityLogs;
            console.log('Data berhasil dimuat ke dalam appState', appState)
        };

        // TAMPILAN HARI KE
        const toBarHari = document.getElementById('hariBerlalu');

        if (toBarHari) {
            toBarHari.addEventListener('click', function() {
                appState.konfToko.currentSimulationDay += 1;
                appState.daftarProduk.forEach(prd => {
                    prd.stock = Math.max(0, prd.stock - prd.avgDailySales);
                });

                const hariBertambah = appState.konfToko.currentSimulationDay;
                appState.riwayatAktivitas.unshift({
                    timestamp: `Hari ke-${hariBertambah}`,
                    message: `Hari simulasi bertambah. Stok produk otomatis berkurang karena penjualan harian.`
                });

                document.getElementById('hariKe').textContent = `Hari ke-${hariBertambah}`;

                simpanLocal();
                renderKpi();
                renderTabel(appState.daftarProduk);
                renderDistModal();
                renderLog();
                renderPanel();
                alert(`Waktu berjalan. Selamat datang di Hari Ke-${hariBertambah}!`);
            });
        };

        // FUNGSI RESET TOP BAR
        function renderReset() {
            const btnReset = document.getElementById('reset');

            if (btnReset) {
                btnReset.addEventListener('click', async function() {
                    const pesanKonfirmasi = confirm('Apakah Anda yakin ingin mereset seluruh data simulasi ke kondisi awal?');

                    if (pesanKonfirmasi) {
                        try {
                            localStorage.removeItem('omnipulse_data');

                            const dataJson = await fetch('./data/dummyData.json');
                            const dataObject = await dataJson.json();

                            appState.konfToko = dataObject.config;
                            appState.daftarKategori = dataObject.categories;
                            appState.daftarProduk = dataObject.products;
                            appState.riwayatAktivitas = dataObject.activityLogs;

                            appState.keranjang = [];

                            document.getElementById('hariKe').textContent = `Hari Ke-${appState.konfToko.currentSimulationDay}`;

                            const htmlCari = document.getElementById('input');
                            const htmlKategori = document.getElementById('filter-kategori');
                            const htmlStatus = document.getElementById('filter-status');
                            const htmlUrutan =  document.getElementById('filter-urutan');

                            if (htmlCari) htmlCari.value = '';
                            if (htmlKategori) htmlKategori.value = 'Semua';
                            if (htmlStatus) htmlStatus.value = 'Semua status';
                            if (htmlUrutan) htmlUrutan.value = 'SisaHari';

                            renderKpi();
                            renderDistModal();
                            renderLog();
                            renderTabel(appState.daftarProduk);
                            renderPanel();

                            console.log('Simulasi berhasil direset ke pengaturan awal.');
                        } catch (error) {
                            console.error('Gagal melakukan reset data:', error);
                            alert("Terjadi kesalahan saat mereset data.");
                        };
                    };
                });
            };
        };
        renderReset();

        // FUNGSI RENDER TAMPILAN 4 KPI 
        function renderKpi() {
            // KPI Total modal awal
            const kpiModal = document.getElementById('modal');
            const dataModal = appState.konfToko.initialBudget;
            const dataModelFormat = formatRupiah(dataModal);
            kpiModal.textContent = dataModelFormat;

            // KPI status kritis
            let jmlKritis = 0;
            appState.daftarProduk.forEach(statusProduk => {
                const format = hitungStok(statusProduk.stock, statusProduk.avgDailySales)
                if (format <= 2) {
                    jmlKritis++;
                };
            });
            document.getElementById('status').textContent = `${jmlKritis} SKU`;

            // KPI Potensi omzet
            let totalOmzet = 0;
            appState.daftarProduk.forEach(produk => {
                const omzetSatuan = produk.sellPrice * produk.stock;
                totalOmzet += omzetSatuan;
            });
            const totalOmzetFormat = formatRupiah(totalOmzet);
            document.getElementById('omzet').textContent = totalOmzetFormat;

            // KPI Sisa budget
            const kpiBudget = document.getElementById('budget');
            const dataBudget = appState.konfToko.remainingBudget;
            kpiBudget.textContent = formatRupiah(dataBudget);
        };
        renderKpi();

        // FUNGSI RENDER DISTRIBUSI MODAL
        const distModal = document.getElementById('distribusiModal');

        function renderDistModal() {
            distModal.innerHTML = '';

            const dataKategori = distrbusiModal(appState);
            dataKategori.forEach(i => {
                const modalFormat = formatRupiah(i.modalKategori);
                const card = document.createElement('li');
                card.innerHTML = `
                <!-- Baris Atas: Kategori dan Persentase/Modal -->
                <div class="flex justify-between items-center text-lg my-4">
                    <span class="font-semibold dark:text-text-primer text-black">${i.kategori}</span>
                    <div class="text-right">
                        <span class="font-bold text-purple-600">${i.persentaseKategori}%</span>
                        <span class="text-bawah-lg dark:text-text-sekunder text-gray-600 ml-2">(${modalFormat})</span>
                    </div>
                </div>

                <!-- Baris Bawah: Batang Progress (Progress Bar) -->
                <div class="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div class="bg-purple-600 h-full rounded-full transition-all duration-500" style="width: ${i.persentaseKategori}%"></div>
                    </div>`;
                distModal.appendChild(card);
            });
        };
        renderDistModal();

        // FUNGSI RENDER LOG RIWAYAT AKTIVITAS
        const logs = document.getElementById('logRiwayat');

        function renderLog() {
            logs.innerHTML = '';
            appState.riwayatAktivitas.forEach(log => {
                const li = document.createElement('li');
                li.className = "mt-3";
                li.innerHTML = `<span class="font-semibold">${log.timestamp}</span><br>${log.message}`; 
                logs.appendChild(li);
            });
        };
        renderLog();

        // FUNGSI RENDER TABEL PRODUK
        const tableBody = document.getElementById('produkTabel');

        function renderTabel(dataTerfilter) {
            tableBody.innerHTML = '';
            if (dataTerfilter.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="dark:text-text-primer" style="text-align: center; padding: 32px; color: #64748b; font-style: italic;">
                            Tidak ada produk yang sesuai dengan filter pencarian.
                        </td>
                    </tr>`;
                return;
            };

            dataTerfilter.forEach(produk => {
                const { sisaHariText, statusNama, warnaBedge } = ketahananStock(produk.stock, produk.avgDailySales);
                const hargaFormat = formatRupiah(produk.buyPrice);
                const baris = document.createElement('tr');
                baris.innerHTML = `
                    <td class="pl-5 py-3">${produk.name}</td>
                    <td class="px-4 py-3 text-center">${produk.category}</td>
                    <td class="px-4 py-3 text-center">${hargaFormat}</td>
                    <td class="px-4 py-3 text-center">${produk.stock}</td>
                    <td class="px-4 py-3 text-center ${warnaBedge}">${statusNama}</td>
                    <td class="px-4 py-3 text-center">${sisaHariText}</td>
                    <td class="px-4 py-3">
                        <button class="w-full btn-beli bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition" data-id="${produk.id}">
                            + Beli
                        </button>
                    </td>
                    `;
                tableBody.appendChild(baris);
            });
        };
        renderTabel(appState.daftarProduk);

        // FUNGSI MEMFILTER TABEL PRODUK
        const htmlCari = document.getElementById('input');
        const htmlKategori = document.getElementById('filter-kategori');
        const htmlStatus = document.getElementById('filter-status');
        const htmlUrutan =  document.getElementById('filter-urutan');

        function pengendali() {
            const cari = htmlCari.value.toLowerCase().trim();
            const filterKategori = htmlKategori.value;
            const filterStatus = htmlStatus.value;
            const filterUrutan = htmlUrutan.value;
            const dataTerfilter = filterData(appState.daftarProduk, cari, filterKategori, filterStatus, filterUrutan);
            renderTabel(dataTerfilter, tableBody);
        };

        htmlCari.addEventListener('input', pengendali);
        htmlKategori.addEventListener('change', pengendali);
        htmlStatus.addEventListener('change', pengendali);
        htmlUrutan.addEventListener('change', pengendali);

        // FUNGSI BUTTON AUTO FILL
        const htmlAutofill = document.getElementById('btnAutofill');

        if (htmlAutofill) {
                htmlAutofill.addEventListener('click', function() {
                    const targetHari = appState.konfToko.targetRestockDays;

                    appState.daftarProduk.forEach(prd => {
                        const sisaHari = Math.floor(prd.stock / prd.avgDailySales);

                        if (sisaHari <= targetHari) {
                            let produkRestock = (prd.avgDailySales * targetHari) - prd.stock;
                            produkRestock = Math.ceil(produkRestock);
                            if (produkRestock > 0) {
                                const cekPrd = appState.keranjang.findIndex(item => String(item.id) === String(prd.id));
                                if (cekPrd > -1) {
                                    appState.keranjang[cekPrd].quantity = produkRestock;
                                } else {
                                    appState.keranjang.push({ id: prd.id, quantity: produkRestock });
                                };
                            };
                        };
                    });
                    simpanLocal();
                    renderPanel();
                });
            };

        // FUNGSI RENDER PANEL KERANJANG
        function renderPanel() {
            // Logic menambahkan produk ke keranjang
            if (appState.keranjang.length === 0) {
                divKeranjang.innerHTML = `<p class="dark:text-text-sekunder text-center">Belum ada barang di rencana restock.</p>`;
            } else {
                let htmlKeranjang = '';
                appState.keranjang.forEach(itemKeranjang => {
                    const itemProduk = appState.daftarProduk.find(prd => prd.id === itemKeranjang.id);

                    if (itemProduk) {
                        htmlKeranjang += `
                            <div class="item-keranjang dark:text-text-primer">
                                <div class="info-produk">
                                    <span class="nama-produk">${itemProduk.name}</span>
                                </div>
                                <div class="flex justify-between px-3">
                                    <span class="harga-produk">Rp ${itemProduk.buyPrice}</span>
                                    <div class="aksi-keranjang">
                                        <button class="btn-kurang inline-flex dark:text-black items-center justify-center bg-gray-100 border border-gray-300 rounded px-2 py-0.2 mx-0.5 cursor-pointer transition-colors hover:bg-gray-200 active:bg-gray-300" data-id="${itemProduk.id}">-</button>
                                        <span class="jumlah-teks">${itemKeranjang.quantity}</span>
                                        <button class="btn-tambah inline-flex dark:text-black items-center justify-center bg-gray-100 border border-gray-300 rounded px-2 py-0.2 mx-0.5 cursor-pointer transition-colors hover:bg-gray-200 active:bg-gray-300" data-id="${itemProduk.id}">+</button>
                                        <button class="btn-hapus text-2xl cursor-pointer" data-id="${itemProduk.id}">🗑️</button>
                                    </div>
                                </div>
                            </div>`;
                    }
                });
                divKeranjang.innerHTML = htmlKeranjang;
            };

            // Logic menghitung total belanja produk di keranjang % sisa budget
            let totalBelanja = 0;
            appState.keranjang.forEach(itemKeranjang => {
                const itemProduk = appState.daftarProduk.find(prd => prd.id === itemKeranjang.id);

                if (itemProduk) {
                    totalBelanja += (itemProduk.buyPrice * itemKeranjang.quantity);
                };
            });
            
            const budgetAwal = appState.konfToko.remainingBudget;
            const budgetSisa = budgetAwal - totalBelanja;
            
            const totalFormat = formatRupiah(totalBelanja);
            const budgetFormat = formatRupiah(budgetSisa);

            document.getElementById('nominalTotal').textContent = totalFormat;
            document.getElementById('nominalSisa').textContent = budgetFormat;

            // Logic menampilkan persen dan bar progress pemakaian budget
            let persentaseBudget = (totalBelanja / budgetAwal) * 100;
            let teksPersentase = persentaseBudget > 100 ? 100 : persentaseBudget;
            
            let lebarPersentase = persentaseBudget;
            if (persentaseBudget > 0 && persentaseBudget < 10) {
                lebarPersentase = 10;
            } else if (persentaseBudget > 100) {
                lebarPersentase = 100;
            };

            const htmlPersentase = document.getElementById('persenBudget');
            if (htmlPersentase) {
                htmlPersentase.textContent = `${Math.round(teksPersentase)}%`;
            };

            const htmlBar = document.getElementById('barProgres');
            htmlBar.style.width = `${lebarPersentase}%`;

            // Logika kunci button eksekusi
            const btnEksekusi = document.getElementById('btnEksekusi');

            if  (btnEksekusi) {
                if (appState.keranjang.length === 0 || totalBelanja > budgetAwal) {
                    btnEksekusi.disabled = true;
                    btnEksekusi.classList.add('opacity-50', 'cursor-not-allowed');

                    if (totalBelanja > budgetAwal) {
                        htmlBar.style.backgroundColor = '#ef4444';
                        document.getElementById('nominalSisa').style.color = '#ef4444';
                    } else {
                        htmlBar.style.backgroundColor = '';
                        document.getElementById('nominalSisa').style.color = '';
                    };
                } else {
                    btnEksekusi.disabled = false;
                    btnEksekusi.classList.remove('opacity-50', 'cursor-not-allowed');
                    htmlBar.style.backgroundColor = '';
                    document.getElementById('nominalSisa').style.color = '';
                };
            };
        }

        // Event untuk + beli pada tabel prdoduk ke keranjang
        tableBody.addEventListener('click', function(event) {
            const btnBeli = event.target.closest('.btn-beli');

            if (btnBeli) {
                const produkId = btnBeli.dataset.id;
                tambahKeranjang(produkId, appState);
                simpanLocal();
                renderPanel();
            };
        });

        // Event +, -, dan hapus pada simulator restock
        const divKeranjang = document.getElementById('restockProduk');

        divKeranjang.addEventListener('click', function(event) {
            // Tombol tambah
            const btnTambah = event.target.closest('.btn-tambah');
            if (btnTambah) {
                const produkId = btnTambah.dataset.id;
                tambahKeranjang(produkId, appState);
                simpanLocal();
                renderPanel();
            };
            // Tombol hapus
            const btnHapus = event.target.closest('.btn-hapus');
            if (btnHapus) {
                const produkId = btnHapus.dataset.id;
                hapusKeranjang(produkId, appState);
                simpanLocal();
                renderPanel();
            };
            // Tombol kurang
            const btnKurang = event.target.closest('.btn-kurang');
            if (btnKurang) {
                const produkId = btnKurang.dataset.id;
                kurangKeranjang(produkId, appState);
                simpanLocal();
                renderPanel();
            };
        });

        // FUNGSI BUTTON EKSEKUSI RESTOCK
        const btnEksekusi = document.getElementById('btnEksekusi');

        if (btnEksekusi) {
            btnEksekusi.addEventListener('click', function() {
                let totalNilaiBelanja = 0;
                let jumlahJenisBelanja = appState.keranjang.length;

                appState.keranjang.forEach(item => {
                    const produk = appState.daftarProduk.find(p => String(p.id) === String(item.id));
                    if (produk) {
                        produk.stock += item.quantity;
                        totalNilaiBelanja += (produk.buyPrice * item.quantity);
                    };
                });

                appState.konfToko.remainingBudget -= totalNilaiBelanja;

                appState.konfToko.currentSimulationDay += 1;

                const tambahLog = `Restock dieksekusi: ${jumlahJenisBelanja} SKU dengan total nilai ${formatRupiah(totalNilaiBelanja)}.`;

                appState.riwayatAktivitas.unshift({
                    timestamp: `Hari Ke-${appState.konfToko.currentSimulationDay}`,
                    message: tambahLog
                });

                appState.keranjang = [];

                document.getElementById('hariKe').textContent = `Hari Ke-${appState.konfToko.currentSimulationDay}`;
                document.getElementById('budget').textContent = formatRupiah(appState.konfToko.remainingBudget);

                let jumlahKritisBaru = 0;
                appState.daftarProduk.forEach(prd => {
                    const ketahanan = hitungStok(prd.stock, prd.avgDailySales);
                    if (ketahanan < appState.konfToko.targetRestockDays) {
                        jumlahKritisBaru ++;
                    };
                });
                document.getElementById('status').textContent = `${jumlahKritisBaru} SKU`;

                // Render ulang semua card yg berubah karena restock dieksekusi
                simpanLocal();
                renderKpi();
                renderDistModal();
                renderTabel(appState.daftarProduk);
                renderLog();
                renderPanel();

                alert(`Hari berganti ke-${appState.konfToko.currentSimulationDay}. Restock berhasil!`)
            });
        };
    } catch (error) {
        console.error('Gagal mengambil file JSON', error)
    };
};

ambilData();




