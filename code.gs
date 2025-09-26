// Code.gs - Server-side Google Apps Script untuk Sistem CRUD Ajib Tangki
// Database: Google Sheets dengan struktur tabel sebagai berikut:
// Sheet: Penjualan (ID, Tanggal, PelangganID, ProdukID, Jumlah, Harga, Total, Rit)
// Sheet: Pengeluaran (ID, Tanggal, KategoriID, Jumlah, Deskripsi)
// Sheet: Produk (ID, Nama, Harga, Satuan)
// Sheet: KategoriPengeluaran (ID, Nama)
// Sheet: Users (ID, Username, PasswordHash)
// Sheet: Pelanggan (ID, Nama, Alamat, Telepon)
// Sheet: Log (Timestamp, User, Action, Details)

var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Ganti dengan ID Spreadsheet Anda
var SHEET_NAMES = {
  PENJUALAN: 'Penjualan',
  PENGELUARAN: 'Pengeluaran',
  PRODUK: 'Produk',
  KATEGORI_PENGELUARAN: 'KategoriPengeluaran',
  USERS: 'Users',
  PELANGGAN: 'Pelanggan',
  LOG: 'Log'
};

// Inisialisasi spreadsheet
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheetName);
  }
  return sheet;
}

function initializeSheet(sheetName) {
  var sheet = getSheet(sheetName);

  switch(sheetName) {
    case SHEET_NAMES.PENJUALAN:
      sheet.appendRow(['ID', 'Tanggal', 'PelangganID', 'ProdukID', 'Jumlah', 'Harga', 'Total', 'Rit', 'Status']);
      break;
    case SHEET_NAMES.PENGELUARAN:
      sheet.appendRow(['ID', 'Tanggal', 'KategoriID', 'Jumlah', 'Deskripsi', 'Status']);
      break;
    case SHEET_NAMES.PRODUK:
      sheet.appendRow(['ID', 'Nama', 'Harga', 'Satuan', 'Status']);
      break;
    case SHEET_NAMES.KATEGORI_PENGELUARAN:
      sheet.appendRow(['ID', 'Nama', 'Status']);
      break;
    case SHEET_NAMES.USERS:
      sheet.appendRow(['ID', 'Username', 'PasswordHash', 'Role', 'CreatedDate', 'Status']);
      // Buat user default
      var defaultPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'admin123', Utilities.Charset.UTF_8);
      var defaultPasswordHex = defaultPassword.map(function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('');
      sheet.appendRow([generateId(), 'admin', defaultPasswordHex, 'admin', new Date(), 'active']);
      break;
    case SHEET_NAMES.PELANGGAN:
      sheet.appendRow(['ID', 'Nama', 'Alamat', 'Telepon', 'Email', 'Status']);
      break;
    case SHEET_NAMES.LOG:
      sheet.appendRow(['ID', 'Timestamp', 'User', 'Action', 'Details', 'IPAddress']);
      break;
  }
}

function generateId() {
  return Utilities.getUuid();
}

// Authentication Functions
function authenticateUser(username, password) {
  var sheet = getSheet(SHEET_NAMES.USERS);
  var data = sheet.getDataRange().getValues();
  var passwordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  var passwordHashHex = passwordHash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === username && data[i][2] === passwordHashHex && data[i][5] === 'active') {
      logAction(username, 'LOGIN', 'User logged in successfully');
      return {
        success: true,
        user: {
          id: data[i][0],
          username: data[i][1],
          role: data[i][3]
        }
      };
    }
  }
  return {success: false, message: 'Invalid username or password'};
}

function logAction(user, action, details) {
  try {
    var sheet = getSheet(SHEET_NAMES.LOG);
    var timestamp = new Date();
    var ipAddress = 'N/A'; // Google Apps Script tidak menyediakan IP address secara langsung

    sheet.appendRow([generateId(), timestamp, user, action, details, ipAddress]);
  } catch (e) {
    Logger.log('Error logging action: ' + e.message);
  }
}

// Utility Functions
function getAllData(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) { // Check if ID exists
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      result.push(row);
    }
  }
  return result;
}

function getDataById(sheetName, id) {
  var data = getAllData(sheetName);
  return data.find(function(row) {
    return row.ID === id;
  });
}

function updateRowById(sheetName, id, updatedData) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      for (var j = 0; j < headers.length; j++) {
        if (updatedData[headers[j]] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(updatedData[headers[j]]);
        }
      }
      break;
    }
  }
}

function deleteRowById(sheetName, id) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

// CRUD Operations for Penjualan
function createPenjualan(tanggal, pelangganId, produkId, jumlah, harga, rit) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = getSheet(SHEET_NAMES.PENJUALAN);
    var id = generateId();
    var total = jumlah * harga;

    sheet.appendRow([id, tanggal, pelangganId, produkId, jumlah, harga, total, rit, 'active']);

    // Log action
    logAction('system', 'CREATE_PENJUALAN', 'Created new penjualan with ID: ' + id);

    lock.releaseLock();
    return {success: true, id: id, message: 'Penjualan berhasil ditambahkan'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function getAllPenjualan() {
  return getAllData(SHEET_NAMES.PENJUALAN);
}

function getPenjualanById(id) {
  return getDataById(SHEET_NAMES.PENJUALAN, id);
}

function updatePenjualan(id, updatedData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    updatedData.Total = updatedData.Jumlah * updatedData.Harga;
    updateRowById(SHEET_NAMES.PENJUALAN, id, updatedData);

    logAction('system', 'UPDATE_PENJUALAN', 'Updated penjualan with ID: ' + id);

    lock.releaseLock();
    return {success: true, message: 'Penjualan berhasil diupdate'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function deletePenjualan(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    deleteRowById(SHEET_NAMES.PENJUALAN, id);

    logAction('system', 'DELETE_PENJUALAN', 'Deleted penjualan with ID: ' + id);

    lock.releaseLock();
    return {success: true, message: 'Penjualan berhasil dihapus'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

// CRUD Operations for Pengeluaran
function createPengeluaran(tanggal, kategoriId, jumlah, deskripsi) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = getSheet(SHEET_NAMES.PENGELUARAN);
    var id = generateId();

    sheet.appendRow([id, tanggal, kategoriId, jumlah, deskripsi, 'active']);

    logAction('system', 'CREATE_PENGELUARAN', 'Created new pengeluaran with ID: ' + id);

    lock.releaseLock();
    return {success: true, id: id, message: 'Pengeluaran berhasil ditambahkan'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function getAllPengeluaran() {
  return getAllData(SHEET_NAMES.PENGELUARAN);
}

function updatePengeluaran(id, updatedData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    updateRowById(SHEET_NAMES.PENGELUARAN, id, updatedData);

    logAction('system', 'UPDATE_PENGELUARAN', 'Updated pengeluaran with ID: ' + id);

    lock.releaseLock();
    return {success: true, message: 'Pengeluaran berhasil diupdate'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function deletePengeluaran(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    deleteRowById(SHEET_NAMES.PENGELUARAN, id);

    logAction('system', 'DELETE_PENGELUARAN', 'Deleted pengeluaran with ID: ' + id);

    lock.releaseLock();
    return {success: true, message: 'Pengeluaran berhasil dihapus'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

// CRUD Operations for Produk
function createProduk(nama, harga, satuan) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = getSheet(SHEET_NAMES.PRODUK);
    var id = generateId();

    sheet.appendRow([id, nama, harga, satuan, 'active']);

    logAction('system', 'CREATE_PRODUK', 'Created new produk with ID: ' + id);

    lock.releaseLock();
    return {success: true, id: id, message: 'Produk berhasil ditambahkan'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function getAllProduk() {
  return getAllData(SHEET_NAMES.PRODUK);
}

function updateProduk(id, updatedData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    updateRowById(SHEET_NAMES.PRODUK, id, updatedData);

    logAction('system', 'UPDATE_PRODUK', 'Updated produk with ID: ' + id);

    lock.releaseLock();
    return {success: true, message: 'Produk berhasil diupdate'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function deleteProduk(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    deleteRowById(SHEET_NAMES.PRODUK, id);

    logAction('system', 'DELETE_PRODUK', 'Deleted produk with ID: ' + id);

    lock.releaseLock();
    return {success: true, message: 'Produk berhasil dihapus'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

// CRUD Operations for KategoriPengeluaran
function createKategoriPengeluaran(nama) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = getSheet(SHEET_NAMES.KATEGORI_PENGELUARAN);
    var id = generateId();

    sheet.appendRow([id, nama, 'active']);

    logAction('system', 'CREATE_KATEGORI_PENGELUARAN', 'Created new kategori pengeluaran with ID: ' + id);

    lock.releaseLock();
    return {success: true, id: id, message: 'Kategori pengeluaran berhasil ditambahkan'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function getAllKategoriPengeluaran() {
  return getAllData(SHEET_NAMES.KATEGORI_PENGELUARAN);
}

// CRUD Operations for Pelanggan
function createPelanggan(nama, alamat, telepon, email) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = getSheet(SHEET_NAMES.PELANGGAN);
    var id = generateId();

    sheet.appendRow([id, nama, alamat, telepon, email, 'active']);

    logAction('system', 'CREATE_PELANGGAN', 'Created new pelanggan with ID: ' + id);

    lock.releaseLock();
    return {success: true, id: id, message: 'Pelanggan berhasil ditambahkan'};
  } catch (e) {
    lock.releaseLock();
    return {success: false, message: 'Error: ' + e.message};
  }
}

function getAllPelanggan() {
  return getAllData(SHEET_NAMES.PELANGGAN);
}

function getPelangganById(id) {
  return getDataById(SHEET_NAMES.PELANGGAN, id);
}

function generateGoogleMapsLink(alamat) {
  var encodedAddress = encodeURIComponent(alamat);
  return 'https://www.google.com/maps/search/?api=1&query=' + encodedAddress;
}

// Calculation Functions
function calculateLabaRugi(startDate, endDate) {
  var penjualan = getAllPenjualan();
  var pengeluaran = getAllPengeluaran();

  var totalPenjualan = 0;
  var totalPengeluaran = 0;

  var start = new Date(startDate);
  var end = new Date(endDate);

  // Calculate total penjualan
  penjualan.forEach(function(item) {
    var itemDate = new Date(item.Tanggal);
    if (itemDate >= start && itemDate <= end) {
      totalPenjualan += parseFloat(item.Total) || 0;
    }
  });

  // Calculate total pengeluaran
  pengeluaran.forEach(function(item) {
    var itemDate = new Date(item.Tanggal);
    if (itemDate >= start && itemDate <= end) {
      totalPengeluaran += parseFloat(item.Jumlah) || 0;
    }
  });

  var labaKotor = totalPenjualan - totalPengeluaran;

  return {
    totalPenjualan: totalPenjualan,
    totalPengeluaran: totalPengeluaran,
    labaKotor: labaKotor,
    startDate: startDate,
    endDate: endDate
  };
}

function calculateRekapRit(startDate, endDate) {
  var penjualan = getAllPenjualan();

  var start = new Date(startDate);
  var end = new Date(endDate);

  var totalRit = 0;
  var totalRetase = 0;

  penjualan.forEach(function(item) {
    var itemDate = new Date(item.Tanggal);
    if (itemDate >= start && itemDate <= end) {
      totalRit += parseFloat(item.Rit) || 0;
      totalRetase += parseFloat(item.Total) || 0;
    }
  });

  return {
    totalRit: totalRit,
    totalRetase: totalRetase,
    rataRataPerRit: totalRit > 0 ? totalRetase / totalRit : 0,
    startDate: startDate,
    endDate: endDate
  };
}

function getDashboardData() {
  var penjualan = getAllPenjualan();
  var pengeluaran = getAllPengeluaran();
  var produk = getAllProduk();
  var pelanggan = getAllPelanggan();

  // Calculate total metrics
  var totalPenjualan = penjualan.reduce(function(sum, item) {
    return sum + (parseFloat(item.Total) || 0);
  }, 0);

  var totalPengeluaran = pengeluaran.reduce(function(sum, item) {
    return sum + (parseFloat(item.Jumlah) || 0);
  }, 0);

  var labaKotor = totalPenjualan - totalPengeluaran;

  // Get top products
  var produkMap = {};
  produk.forEach(function(p) {
    produkMap[p.ID] = p;
  });

  var produkStats = {};
  penjualan.forEach(function(penj) {
    if (produkStats[penj.ProdukID]) {
      produkStats[penj.ProdukID].total += parseFloat(penj.Total) || 0;
      produkStats[penj.ProdukID].count += 1;
    } else {
      produkStats[penj.ProdukID] = {
        nama: produkMap[penj.ProdukID] ? produkMap[penj.ProdukID].Nama : 'Unknown',
        total: parseFloat(penj.Total) || 0,
        count: 1
      };
    }
  });

  var topProduk = Object.values(produkStats)
    .sort(function(a, b) { return b.total - a.total; })
    .slice(0, 5);

  // Get top pelanggan
  var pelangganMap = {};
  pelanggan.forEach(function(p) {
    pelangganMap[p.ID] = p;
  });

  var pelangganStats = {};
  penjualan.forEach(function(penj) {
    if (pelangganStats[penj.PelangganID]) {
      pelangganStats[penj.PelangganID].total += parseFloat(penj.Total) || 0;
      pelangganStats[penj.PelangganID].count += 1;
    } else {
      pelangganStats[penj.PelangganID] = {
        nama: pelangganMap[penj.PelangganID] ? pelangganMap[penj.PelangganID].Nama : 'Unknown',
        total: parseFloat(penj.Total) || 0,
        count: 1
      };
    }
  });

  var topPelanggan = Object.values(pelangganStats)
    .sort(function(a, b) { return b.total - a.total; })
    .slice(0, 5);

  return {
    totalPenjualan: totalPenjualan,
    totalPengeluaran: totalPengeluaran,
    labaKotor: labaKotor,
    totalTransaksi: penjualan.length,
    totalProduk: produk.length,
    totalPelanggan: pelanggan.length,
    topProduk: topProduk,
    topPelanggan: topPelanggan,
    lastUpdated: new Date()
  };
}

// Main doGet function
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');

  // Check if user is logged in
  var loggedIn = false;
  var user = null;

  if (e && e.parameter && e.parameter.username && e.parameter.password) {
    var authResult = authenticateUser(e.parameter.username, e.parameter.password);
    if (authResult.success) {
      loggedIn = true;
      user = authResult.user;
      template.loggedIn = loggedIn;
      template.user = user;
    }
  }

  return template.evaluate()
    .setTitle('Ajib Tangki - Sistem Manajemen Bisnis')
    .setFaviconUrl('https://www.google.com/favicon.ico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Include HTML file
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}