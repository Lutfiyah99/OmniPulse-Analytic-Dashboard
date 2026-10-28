// FUNCTION FORMAT RUPIAH
export function formatRupiah(angka) {
    if (typeof angka !== 'number') return 'Rp. 0';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// FUNCTION PENENTU STATUS
export function hitungStok(stokSaatIni, rataPenjualanHarian) {
    if (stokSaatIni <= 0) {
        return 0;
    }

    if (rataPenjualanHarian <= 0) {
        return Infinity;
    }

    return Math.round(stokSaatIni / rataPenjualanHarian);
}

// FUNCTION TABEL GUDANG
export function ketahananStock(stock, rata) {
    const sisaHari = hitungStok(stock, rata);

    let sisaHariText;
    let statusNama;
    let warnaBedge;

    if (sisaHari === Infinity) {
    sisaHariText = '∞ hari';
    statusNama = 'Dead Stock';
    warnaBedge = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-200';
} else {
    sisaHariText = `${sisaHari} hari`;

    if (sisaHari <= 2) {
        statusNama = 'Kritis';
        warnaBedge = 'bg-rose-100 text-rose-700 border border-slate-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-slate-200';
    } else if (sisaHari <= 5) {
        statusNama = 'Waspada';
        warnaBedge = 'bg-amber-100 text-amber-700 border border-slate-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-slate-200';
    } else if (sisaHari <= 20) {
        statusNama = 'Aman';
        warnaBedge = 'bg-emerald-100 text-emerald-700 border border-slate-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-slate-200';
    } else {
        statusNama = 'Overstock';
        warnaBedge = 'bg-purple-100 text-purple-700 border border-slate-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-slate-200';
    }
}

    return {sisaHariText, statusNama, warnaBedge}
}

// FUNCTION FILTER TABEL GUDANG
export function hitungSisaHari(p) {
    if (p.avgDailySales === 0) return Infinity;
    return p.stock / p.avgDailySales;
}
export function filterData(daftarProduk, cari, filterKategori, filterStatus, filterUrutan) {

    let hasilFilter = daftarProduk.filter((prd) => {

        const matchCari = prd.name.toLowerCase().includes(cari) || prd.category.toLowerCase().includes(cari) || prd.sku.toLowerCase().includes(cari);

        const matchKategori = filterKategori === 'Semua' || prd.category === filterKategori;

        const status = ketahananStock(prd.stock, prd.avgDailySales);

        const statusText = status.statusNama;

        const matchStatus = filterStatus === 'Semua status' || statusText === filterStatus;

        return matchCari && matchKategori && matchStatus;
    });

    hasilFilter.sort((a, b) => {
        if (filterUrutan === 'SisaHari') {
            return hitungSisaHari(a) - hitungSisaHari(b);
        } else if (filterUrutan === 'Stock') {
            return a.stock - b.stock;
        } else if (filterUrutan === 'Harga') {
            return a.buyPrice - b.buyPrice;
        }

        return 0;
    });

    return hasilFilter;
}

// FUNCTION DISTRIBUSI MODAL KATEGORI
export function distrbusiModal(appState) {

    const totalModalSeluruh = appState.daftarProduk.reduce((acc, produk) => { return acc + (produk.buyPrice * produk.stock);
    }, 0);

    const daftarKategori = appState.daftarKategori;

    let hasilKategori = daftarKategori.map(kategori => {
        const modalKategori = appState.daftarProduk.filter(produk => produk.category === kategori).reduce((acc, produk) => {return acc + (produk.buyPrice * produk.stock);
        }, 0);

        const persentaseKategori = totalModalSeluruh > 0 ? Math.round((modalKategori / totalModalSeluruh) * 100) : 0;

        return {kategori, modalKategori, persentaseKategori}
    });

    hasilKategori.sort((a, b) => b.persentaseKategori - a.persentaseKategori);

    return hasilKategori;
}

// FUNCTION SIMULASI RESTOCK
export function tambahKeranjang(produkId, appState) {
    const cekId = appState.keranjang.findIndex(product => 
        String(product.id) === String(produkId));

    if (cekId > -1) {
        appState.keranjang[cekId].quantity += 1;
    } else {
        appState.keranjang.push({ id: produkId, quantity:1 });
    };
}

export function hapusKeranjang(produkId, appState) {
    appState.keranjang = appState.keranjang.filter(product => 
        String(product.id) !== String(produkId));
}

export function kurangKeranjang(produkId, appState) {
    const cekProduct = appState.keranjang.findIndex(product =>
        String(product.id) === String(produkId));

    if (cekProduct > -1) {
        if (appState.keranjang[cekProduct].quantity > 1) {
            appState.keranjang[cekProduct].quantity -= 1;
        } else {
            hapusKeranjang(produkId, appState);
        };
    };
}

