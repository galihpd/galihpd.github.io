document.addEventListener("DOMContentLoaded", function () {
    const timezoneSelect = document.getElementById("timezoneSelect");
    const citySearch = document.getElementById("citySearch");
    const cityDropdown = document.getElementById("cityDropdown");
    const daySelect = document.getElementById("daySelect");
    const monthSelect = document.getElementById("monthSelect");
    const yearSelect = document.getElementById("yearSelect");
    const fullDateDisplay = document.getElementById("fullDateDisplay");
    const dayNameDisplay = document.getElementById("dayNameDisplay");
    const monthlyTableBody = document.getElementById("monthlyTableBody");

    let jadwalSholat = {};
    let selectedCityId = "1301"; // Default Jakarta ID
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // --- 1. DATABASE KOTA LENGKAP ---
    const dataKota = {
        "Asia/Jakarta": [{ "id": "1001", "lokasi": "KAB. LAMPUNG TENGAH" }, { "id": "1002", "lokasi": "KAB. LAMPUNG UTARA" }, { "id": "1003", "lokasi": "KAB. LAMPUNG SELATAN" }, { "id": "1004", "lokasi": "KAB. LAMPUNG BARAT" }, { "id": "1005", "lokasi": "KAB. LAMPUNG TIMUR" }, { "id": "1006", "lokasi": "KAB. MESUJI" }, { "id": "1007", "lokasi": "KAB. PESAWARAN" }, { "id": "1008", "lokasi": "KAB. PESISIR BARAT" }, { "id": "1009", "lokasi": "KAB. PRINGSEWU" }, { "id": "1010", "lokasi": "KAB. TULANG BAWANG" }, { "id": "1011", "lokasi": "KAB. TULANG BAWANG BARAT" }, { "id": "1012", "lokasi": "KAB. TANGGAMUS" }, { "id": "1013", "lokasi": "KAB. WAY KANAN" }, { "id": "1014", "lokasi": "KOTA BANDAR LAMPUNG" }, { "id": "1015", "lokasi": "KOTA METRO" }, { "id": "1101", "lokasi": "KAB. LEBAK" }, { "id": "1102", "lokasi": "KAB. PANDEGLANG" }, { "id": "1103", "lokasi": "KAB. SERANG" }, { "id": "1104", "lokasi": "KAB. TANGERANG" }, { "id": "1105", "lokasi": "KOTA CILEGON" }, { "id": "1106", "lokasi": "KOTA SERANG" }, { "id": "1107", "lokasi": "KOTA TANGERANG" }, { "id": "1108", "lokasi": "KOTA TANGERANG SELATAN" }, { "id": "1201", "lokasi": "KAB. BANDUNG" }, { "id": "1202", "lokasi": "KAB. BANDUNG BARAT" }, { "id": "1203", "lokasi": "KAB. BEKASI" }, { "id": "1204", "lokasi": "KAB. BOGOR" }, { "id": "1205", "lokasi": "KAB. CIAMIS" }, { "id": "1206", "lokasi": "KAB. CIANJUR" }, { "id": "1207", "lokasi": "KAB. CIREBON" }, { "id": "1208", "lokasi": "KAB. GARUT" }, { "id": "1209", "lokasi": "KAB. INDRAMAYU" }, { "id": "1210", "lokasi": "KAB. KARAWANG" }, { "id": "1211", "lokasi": "KAB. KUNINGAN" }, { "id": "1212", "lokasi": "KAB. MAJALENGKA" }, { "id": "1213", "lokasi": "KAB. PANGANDARAN" }, { "id": "1214", "lokasi": "KAB. PURWAKARTA" }, { "id": "1215", "lokasi": "KAB. SUBANG" }, { "id": "1216", "lokasi": "KAB. SUKABUMI" }, { "id": "1217", "lokasi": "KAB. SUMEDANG" }, { "id": "1218", "lokasi": "KAB. TASIKMALAYA" }, { "id": "1219", "lokasi": "KOTA BANDUNG" }, { "id": "1220", "lokasi": "KOTA BANJAR" }, { "id": "1221", "lokasi": "KOTA BEKASI" }, { "id": "1222", "lokasi": "KOTA BOGOR" }, { "id": "1223", "lokasi": "KOTA CIMAHI" }, { "id": "1224", "lokasi": "KOTA CIREBON" }, { "id": "1225", "lokasi": "KOTA DEPOK" }, { "id": "1226", "lokasi": "KOTA SUKABUMI" }, { "id": "1227", "lokasi": "KOTA TASIKMALAYA" }, { "id": "1301", "lokasi": "KOTA JAKARTA" }, { "id": "1302", "lokasi": "KAB. KEPULAUAN SERIBU" }, { "id": "1401", "lokasi": "KAB. BANJARNEGARA" }, { "id": "1402", "lokasi": "KAB. BANYUMAS" }, { "id": "1403", "lokasi": "KAB. BATANG" }, { "id": "1404", "lokasi": "KAB. BLORA" }, { "id": "1405", "lokasi": "KAB. BOYOLALI" }, { "id": "1406", "lokasi": "KAB. BREBES" }, { "id": "1407", "lokasi": "KAB. CILACAP" }, { "id": "1408", "lokasi": "KAB. DEMAK" }, { "id": "1409", "lokasi": "KAB. GROBOGAN" }, { "id": "1410", "lokasi": "KAB. JEPARA" }, { "id": "1411", "lokasi": "KAB. KARANGANYAR" }, { "id": "1412", "lokasi": "KAB. KEBUMEN" }, { "id": "1413", "lokasi": "KAB. KENDAL" }, { "id": "1414", "lokasi": "KAB. KLATEN" }, { "id": "1415", "lokasi": "KAB. KUDUS" }, { "id": "1416", "lokasi": "KAB. MAGELANG" }, { "id": "1417", "lokasi": "KAB. PATI" }, { "id": "1418", "lokasi": "KAB. PEKALONGAN" }, { "id": "1419", "lokasi": "KAB. PEMALANG" }, { "id": "1420", "lokasi": "KAB. PURBALINGGA" }, { "id": "1421", "lokasi": "KAB. PURWOREJO" }, { "id": "1422", "lokasi": "KAB. REMBANG" }, { "id": "1423", "lokasi": "KAB. SEMARANG" }, { "id": "1424", "lokasi": "KAB. SRAGEN" }, { "id": "1425", "lokasi": "KAB. SUKOHARJO" }, { "id": "1426", "lokasi": "KAB. TEGAL" }, { "id": "1427", "lokasi": "KAB. TEMANGGUNG" }, { "id": "1428", "lokasi": "KAB. WONOGIRI" }, { "id": "1429", "lokasi": "KAB. WONOSOBO" }, { "id": "1430", "lokasi": "KOTA MAGELANG" }, { "id": "1431", "lokasi": "KOTA PEKALONGAN" }, { "id": "1432", "lokasi": "KOTA SALATIGA" }, { "id": "1433", "lokasi": "KOTA SEMARANG" }, { "id": "1434", "lokasi": "KOTA SURAKARTA" }, { "id": "1435", "lokasi": "KOTA TEGAL" }, { "id": "1501", "lokasi": "KAB. BANTUL" }, { "id": "1502", "lokasi": "KAB. GUNUNGKIDUL" }, { "id": "1503", "lokasi": "KAB. KULON PROGO" }, { "id": "1504", "lokasi": "KAB. SLEMAN" }, { "id": "1505", "lokasi": "KOTA YOGYAKARTA" }, { "id": "1601", "lokasi": "KAB. BANGKALAN" }, { "id": "1602", "lokasi": "KAB. BANYUWANGI" }, { "id": "1603", "lokasi": "KAB. BLITAR" }, { "id": "1604", "lokasi": "KAB. BOJONEGORO" }, { "id": "1605", "lokasi": "KAB. BONDOWOSO" }, { "id": "1606", "lokasi": "KAB. GRESIK" }, { "id": "1607", "lokasi": "KAB. JEMBER" }, { "id": "1608", "lokasi": "KAB. JOMBANG" }, { "id": "1609", "lokasi": "KAB. KEDIRI" }, { "id": "1610", "lokasi": "KAB. LAMONGAN" }, { "id": "1611", "lokasi": "KAB. LUMAJANG" }, { "id": "1612", "lokasi": "KAB. MADIUN" }, { "id": "1613", "lokasi": "KAB. MAGETAN" }, { "id": "1614", "lokasi": "KAB. MALANG" }, { "id": "1615", "lokasi": "KAB. MOJOKERTO" }, { "id": "1616", "lokasi": "KAB. NGANJUK" }, { "id": "1617", "lokasi": "KAB. NGAWI" }, { "id": "1618", "lokasi": "KAB. PACITAN" }, { "id": "1619", "lokasi": "KAB. PAMEKASAN" }, { "id": "1620", "lokasi": "KAB. PASURUAN" }, { "id": "1621", "lokasi": "KAB. PONOROGO" }, { "id": "1622", "lokasi": "KAB. PROBOLINGGO" }, { "id": "1623", "lokasi": "KAB. SAMPANG" }, { "id": "1624", "lokasi": "KAB. SIDOARJO" }, { "id": "1625", "lokasi": "KAB. SITUBONDO" }, { "id": "1626", "lokasi": "KAB. SUMENEP" }, { "id": "1627", "lokasi": "KAB. TRENGGALEK" }, { "id": "1628", "lokasi": "KAB. TUBAN" }, { "id": "1629", "lokasi": "KAB. TULUNGAGUNG" }, { "id": "1630", "lokasi": "KOTA BATU" }, { "id": "1631", "lokasi": "KOTA BLITAR" }, { "id": "1632", "lokasi": "KOTA KEDIRI" }, { "id": "1633", "lokasi": "KOTA MADIUN" }, { "id": "1634", "lokasi": "KOTA MALANG" }, { "id": "1635", "lokasi": "KOTA MOJOKERTO" }, { "id": "1636", "lokasi": "KOTA PASURUAN" }, { "id": "1637", "lokasi": "KOTA PROBOLINGGO" }, { "id": "1638", "lokasi": "KOTA SURABAYA" }, { "id": "2001", "lokasi": "KAB. BENGKAYANG" }, { "id": "2002", "lokasi": "KAB. KAPUAS HULU" }, { "id": "2003", "lokasi": "KAB. KAYONG UTARA" }, { "id": "2004", "lokasi": "KAB. KETAPANG" }, { "id": "2005", "lokasi": "KAB. KUBU RAYA" }, { "id": "2006", "lokasi": "KAB. LANDAK" }, { "id": "2007", "lokasi": "KAB. MELAWI" }, { "id": "2008", "lokasi": "KAB. MEMPAWAH" }, { "id": "2009", "lokasi": "KAB. SAMBAS" }, { "id": "2010", "lokasi": "KAB. SANGGAU" }, { "id": "2011", "lokasi": "KAB. SEKADAU" }, { "id": "2012", "lokasi": "KAB. SINTANG" }, { "id": "2013", "lokasi": "KOTA PONTIANAK" }, { "id": "2014", "lokasi": "KOTA SINGKAWANG" }, { "id": "2201", "lokasi": "KAB. BARITO SELATAN" }, { "id": "2202", "lokasi": "KAB. BARITO TIMUR" }, { "id": "2203", "lokasi": "KAB. BARITO UTARA" }, { "id": "2204", "lokasi": "KAB. GUNUNG MAS" }, { "id": "2205", "lokasi": "KAB. KAPUAS" }, { "id": "2206", "lokasi": "KAB. KATINGAN" }, { "id": "2207", "lokasi": "KAB. KOTAWARINGIN BARAT" }, { "id": "2208", "lokasi": "KAB. KOTAWARINGIN TIMUR" }, { "id": "2209", "lokasi": "KAB. LAMANDAU" }, { "id": "2210", "lokasi": "KAB. MURUNG RAYA" }, { "id": "2211", "lokasi": "KAB. PULANG PISAU" }, { "id": "2212", "lokasi": "KAB. SUKAMARA" }, { "id": "2213", "lokasi": "KAB. SERUYAN" }, { "id": "2214", "lokasi": "KOTA PALANGKARAYA" }, { "id": "0101", "lokasi": "KAB. ACEH BARAT" }, { "id": "0102", "lokasi": "KAB. ACEH BARAT DAYA" }, { "id": "0103", "lokasi": "KAB. ACEH BESAR" }, { "id": "0104", "lokasi": "KAB. ACEH JAYA" }, { "id": "0105", "lokasi": "KAB. ACEH SELATAN" }, { "id": "0106", "lokasi": "KAB. ACEH SINGKIL" }, { "id": "0107", "lokasi": "KAB. ACEH TAMIANG" }, { "id": "0108", "lokasi": "KAB. ACEH TENGAH" }, { "id": "0109", "lokasi": "KAB. ACEH TENGGARA" }, { "id": "0110", "lokasi": "KAB. ACEH TIMUR" }, { "id": "0111", "lokasi": "KAB. ACEH UTARA" }, { "id": "0112", "lokasi": "KAB. BENER MERIAH" }, { "id": "0113", "lokasi": "KAB. BIREUEN" }, { "id": "0114", "lokasi": "KAB. GAYO LUES" }, { "id": "0115", "lokasi": "KAB. NAGAN RAYA" }, { "id": "0116", "lokasi": "KAB. PIDIE" }, { "id": "0117", "lokasi": "KAB. PIDIE JAYA" }, { "id": "0118", "lokasi": "KAB. SIMEULUE" }, { "id": "0119", "lokasi": "KOTA BANDA ACEH" }, { "id": "0120", "lokasi": "KOTA LANGSA" }, { "id": "0121", "lokasi": "KOTA LHOKSEUMAWE" }, { "id": "0122", "lokasi": "KOTA SABANG" }, { "id": "0123", "lokasi": "KOTA SUBULUSSALAM" }, { "id": "0201", "lokasi": "KAB. ASAHAN" }, { "id": "0202", "lokasi": "KAB. BATUBARA" }, { "id": "0203", "lokasi": "KAB. DAIRI" }, { "id": "0204", "lokasi": "KAB. DELI SERDANG" }, { "id": "0205", "lokasi": "KAB. HUMBANG HASUNDUTAN" }, { "id": "0206", "lokasi": "KAB. KARO" }, { "id": "0207", "lokasi": "KAB. LABUHANBATU" }, { "id": "0208", "lokasi": "KAB. LABUHANBATU SELATAN" }, { "id": "0209", "lokasi": "KAB. LABUHANBATU UTARA" }, { "id": "0210", "lokasi": "KAB. LANGKAT" }, { "id": "0211", "lokasi": "KAB. MANDAILING NATAL" }, { "id": "0212", "lokasi": "KAB. NIAS" }, { "id": "0213", "lokasi": "KAB. NIAS BARAT" }, { "id": "0214", "lokasi": "KAB. NIAS SELATAN" }, { "id": "0215", "lokasi": "KAB. NIAS UTARA" }, { "id": "0216", "lokasi": "KAB. PADANG LAWAS" }, { "id": "0217", "lokasi": "KAB. PADANG LAWAS UTARA" }, { "id": "0218", "lokasi": "KAB. PAKPAK BHARAT" }, { "id": "0219", "lokasi": "KAB. SAMOSIR" }, { "id": "0220", "lokasi": "KAB. SERDANG BEDAGAI" }, { "id": "0221", "lokasi": "KAB. SIMALUNGUN" }, { "id": "0222", "lokasi": "KAB. TAPANULI SELATAN" }, { "id": "0223", "lokasi": "KAB. TAPANULI TENGAH" }, { "id": "0224", "lokasi": "KAB. TAPANULI UTARA" }, { "id": "0225", "lokasi": "KAB. TOBA SAMOSIR" }, { "id": "0226", "lokasi": "KOTA BINJAI" }, { "id": "0227", "lokasi": "KOTA GUNUNGSITOLI" }, { "id": "0228", "lokasi": "KOTA MEDAN" }, { "id": "0229", "lokasi": "KOTA PADANGSIDEMPUAN" }, { "id": "0230", "lokasi": "KOTA PEMATANGSIANTAR" }, { "id": "0231", "lokasi": "KOTA SIBOLGA" }, { "id": "0232", "lokasi": "KOTA TANJUNGBALAI" }, { "id": "0233", "lokasi": "KOTA TEBING TINGGI" }, { "id": "0301", "lokasi": "KAB. AGAM" }, { "id": "0302", "lokasi": "KAB. DHARMASRAYA" }, { "id": "0303", "lokasi": "KAB. KEPULAUAN MENTAWAI" }, { "id": "0304", "lokasi": "KAB. LIMA PULUH KOTA" }, { "id": "0305", "lokasi": "KAB. PADANG PARIAMAN" }, { "id": "0306", "lokasi": "KAB. PASAMAN" }, { "id": "0307", "lokasi": "KAB. PASAMAN BARAT" }, { "id": "0308", "lokasi": "KAB. PESISIR SELATAN" }, { "id": "0309", "lokasi": "KAB. SIJUNJUNG" }, { "id": "0310", "lokasi": "KAB. SOLOK" }, { "id": "0311", "lokasi": "KAB. SOLOK SELATAN" }, { "id": "0312", "lokasi": "KAB. TANAH DATAR" }, { "id": "0313", "lokasi": "KOTA BUKITTINGGI" }, { "id": "0314", "lokasi": "KOTA PADANG" }, { "id": "0315", "lokasi": "KOTA PADANGPANJANG" }, { "id": "0316", "lokasi": "KOTA PARIAMAN" }, { "id": "0317", "lokasi": "KOTA PAYAKUMBUH" }, { "id": "0318", "lokasi": "KOTA SAWAHLUNTO" }, { "id": "0319", "lokasi": "KOTA SOLOK" }, { "id": "0401", "lokasi": "KAB. BENGKALIS" }, { "id": "0402", "lokasi": "KAB. INDRAGIRI HILIR" }, { "id": "0403", "lokasi": "KAB. INDRAGIRI HULU" }, { "id": "0404", "lokasi": "KAB. KAMPAR" }, { "id": "0405", "lokasi": "KAB. KEPULAUAN MERANTI" }, { "id": "0406", "lokasi": "KAB. KUANTAN SINGINGI" }, { "id": "0407", "lokasi": "KAB. PELALAWAN" }, { "id": "0408", "lokasi": "KAB. ROKAN HILIR" }, { "id": "0409", "lokasi": "KAB. ROKAN HULU" }, { "id": "0410", "lokasi": "KAB. SIAK" }, { "id": "0411", "lokasi": "KOTA DUMAI" }, { "id": "0412", "lokasi": "KOTA PEKANBARU" }, { "id": "0501", "lokasi": "KAB. BINTAN" }, { "id": "0502", "lokasi": "KAB. KARIMUN" }, { "id": "0503", "lokasi": "KAB. KEPULAUAN ANAMBAS" }, { "id": "0504", "lokasi": "KAB. LINGGA" }, { "id": "0505", "lokasi": "KAB. NATUNA" }, { "id": "0506", "lokasi": "KOTA BATAM" }, { "id": "0507", "lokasi": "KOTA TANJUNG PINANG" }, { "id": "0508", "lokasi": "PULAU TAMBELAN KAB. BINTAN" }, { "id": "0509", "lokasi": "PEKAJANG KAB. LINGGA" }, { "id": "0510", "lokasi": "PULAU SERASAN KAB. NATUNA" }, { "id": "0511", "lokasi": "PULAU MIDAI KAB. NATUNA" }, { "id": "0512", "lokasi": "PULAU LAUT KAB. NATUNA" }, { "id": "0601", "lokasi": "KAB. BATANGHARI" }, { "id": "0602", "lokasi": "KAB. BUNGO" }, { "id": "0603", "lokasi": "KAB. KERINCI" }, { "id": "0604", "lokasi": "KAB. MERANGIN" }, { "id": "0605", "lokasi": "KAB. MUARO JAMBI" }, { "id": "0606", "lokasi": "KAB. SAROLANGUN" }, { "id": "0607", "lokasi": "KAB. TANJUNG JABUNG BARAT" }, { "id": "0608", "lokasi": "KAB. TANJUNG JABUNG TIMUR" }, { "id": "0609", "lokasi": "KAB. TEBO" }, { "id": "0610", "lokasi": "KOTA JAMBI" }, { "id": "0611", "lokasi": "KOTA SUNGAI PENUH" }, { "id": "0701", "lokasi": "KAB. BENGKULU SELATAN" }, { "id": "0702", "lokasi": "KAB. BENGKULU TENGAH" }, { "id": "0703", "lokasi": "KAB. BENGKULU UTARA" }, { "id": "0704", "lokasi": "KAB. KAUR" }, { "id": "0705", "lokasi": "KAB. KEPAHIANG" }, { "id": "0706", "lokasi": "KAB. LEBONG" }, { "id": "0707", "lokasi": "KAB. MUKOMUKO" }, { "id": "0708", "lokasi": "KAB. REJANG LEBONG" }, { "id": "0709", "lokasi": "KAB. SELUMA" }, { "id": "0710", "lokasi": "KOTA BENGKULU" }, { "id": "0801", "lokasi": "KAB. BANYUASIN" }, { "id": "0802", "lokasi": "KAB. EMPAT LAWANG" }, { "id": "0803", "lokasi": "KAB. LAHAT" }, { "id": "0804", "lokasi": "KAB. MUARA ENIM" }, { "id": "0805", "lokasi": "KAB. MUSI BANYUASIN" }, { "id": "0806", "lokasi": "KAB. MUSI RAWAS" }, { "id": "0807", "lokasi": "KAB. MUSI RAWAS UTARA" }, { "id": "0808", "lokasi": "KAB. OGAN ILIR" }, { "id": "0809", "lokasi": "KAB. OGAN KOMERING ILIR" }, { "id": "0810", "lokasi": "KAB. OGAN KOMERING ULU" }, { "id": "0811", "lokasi": "KAB. OGAN KOMERING ULU SELATAN" }, { "id": "0812", "lokasi": "KAB. OGAN KOMERING ULU TIMUR" }, { "id": "0813", "lokasi": "KAB. PENUKAL ABAB LEMATANG ILIR" }, { "id": "0814", "lokasi": "KOTA LUBUKLINGGAU" }, { "id": "0815", "lokasi": "KOTA PAGAR ALAM" }, { "id": "0816", "lokasi": "KOTA PALEMBANG" }, { "id": "0817", "lokasi": "KOTA PRABUMULIH" }, { "id": "0901", "lokasi": "KAB. BANGKA" }, { "id": "0902", "lokasi": "KAB. BANGKA BARAT" }, { "id": "0903", "lokasi": "KAB. BANGKA SELATAN" }, { "id": "0904", "lokasi": "KAB. BANGKA TENGAH" }, { "id": "0905", "lokasi": "KAB. BELITUNG" }, { "id": "0906", "lokasi": "KAB. BELITUNG TIMUR" }, { "id": "0907", "lokasi": "KOTA PANGKAL PINANG" }],
        "Asia/Makassar": [{ "id": "1701", "lokasi": "KAB. BADUNG" }, { "id": "1702", "lokasi": "KAB. BANGLI" }, { "id": "1703", "lokasi": "KAB. BULELENG" }, { "id": "1704", "lokasi": "KAB. GIANYAR" }, { "id": "1705", "lokasi": "KAB. JEMBRANA" }, { "id": "1706", "lokasi": "KAB. KARANGASEM" }, { "id": "1707", "lokasi": "KAB. KLUNGKUNG" }, { "id": "1708", "lokasi": "KAB. TABANAN" }, { "id": "1709", "lokasi": "KOTA DENPASAR" }, { "id": "1801", "lokasi": "KAB. BIMA" }, { "id": "1802", "lokasi": "KAB. DOMPU" }, { "id": "1803", "lokasi": "KAB. LOMBOK BARAT" }, { "id": "1804", "lokasi": "KAB. LOMBOK TENGAH" }, { "id": "1805", "lokasi": "KAB. LOMBOK TIMUR" }, { "id": "1806", "lokasi": "KAB. LOMBOK UTARA" }, { "id": "1807", "lokasi": "KAB. SUMBAWA" }, { "id": "1808", "lokasi": "KAB. SUMBAWA BARAT" }, { "id": "1809", "lokasi": "KOTA BIMA" }, { "id": "1810", "lokasi": "KOTA MATARAM" }, { "id": "2101", "lokasi": "KAB. BALANGAN" }, { "id": "2102", "lokasi": "KAB. BANJAR" }, { "id": "2103", "lokasi": "KAB. BARITO KUALA" }, { "id": "2104", "lokasi": "KAB. HULU SUNGAI SELATAL" }, { "id": "2105", "lokasi": "KAB. HULU SUNGAI TENGAH" }, { "id": "2106", "lokasi": "KAB. HULU SUNGAI UTARA" }, { "id": "2107", "lokasi": "KAB. KOTABARU" }, { "id": "2108", "lokasi": "KAB. TABALONG" }, { "id": "2109", "lokasi": "KAB. TANAH BUMBU" }, { "id": "2110", "lokasi": "KAB. TANAH LAUT" }, { "id": "2111", "lokasi": "KAB. TAPIN" }, { "id": "2112", "lokasi": "KOTA BANJARBARU" }, { "id": "2113", "lokasi": "KOTA BANJARMASIN" }, { "id": "2301", "lokasi": "KAB. BERAU" }, { "id": "2302", "lokasi": "KAB. KUTAI BARAT" }, { "id": "2303", "lokasi": "KAB. KUTAI KARTANEGARA" }, { "id": "2304", "lokasi": "KAB. KUTAI TIMUR" }, { "id": "2305", "lokasi": "KAB. MAHAKAM ULU" }, { "id": "2306", "lokasi": "KAB. PASER" }, { "id": "2307", "lokasi": "KAB. PENAJAM PASER UTARA" }, { "id": "2308", "lokasi": "KOTA BALIKPAPAN" }, { "id": "2309", "lokasi": "KOTA BONTANG" }, { "id": "2310", "lokasi": "KOTA SAMARINDA" }, { "id": "2401", "lokasi": "KAB. BULUNGAN" }, { "id": "2402", "lokasi": "KAB. MALINAU" }, { "id": "2403", "lokasi": "KAB. NUNUKAN" }, { "id": "2404", "lokasi": "KAB. TANA TIDUNG" }, { "id": "2405", "lokasi": "KOTA TARAKAN" }, { "id": "2501", "lokasi": "KAB. BOALEMO" }, { "id": "2502", "lokasi": "KAB. BONE BOLANGO" }, { "id": "2503", "lokasi": "KAB. GORONTALO" }, { "id": "2504", "lokasi": "KAB. GORONTALO UTARA" }, { "id": "2505", "lokasi": "KAB. POHUWATO" }, { "id": "2506", "lokasi": "KOTA GORONTALO" }, { "id": "2601", "lokasi": "KAB. BANTAENG" }, { "id": "2602", "lokasi": "KAB. BARRU" }, { "id": "2603", "lokasi": "KAB. BONE" }, { "id": "2604", "lokasi": "KAB. BULUKUMBA" }, { "id": "2605", "lokasi": "KAB. ENREKANG" }, { "id": "2606", "lokasi": "KAB. GOWA" }, { "id": "2607", "lokasi": "KAB. JENEPONTO" }, { "id": "2608", "lokasi": "KAB. KEPULAUAN SELAYAR" }, { "id": "2609", "lokasi": "KAB. LUWU" }, { "id": "2610", "lokasi": "KAB. LUWU TIMUR" }, { "id": "2611", "lokasi": "KAB. LUWU UTARA" }, { "id": "2612", "lokasi": "KAB. MAROS" }, { "id": "2613", "lokasi": "KAB. PANGKAJENE DAN KEPULAUAN" }, { "id": "2614", "lokasi": "KAB. PINRANG" }, { "id": "2615", "lokasi": "KAB. SIDENRENG RAPPANG" }, { "id": "2616", "lokasi": "KAB. SINJAI" }, { "id": "2617", "lokasi": "KAB. SOPPENG" }, { "id": "2618", "lokasi": "KAB. TAKALAR" }, { "id": "2619", "lokasi": "KAB. TANA TORAJA" }, { "id": "2620", "lokasi": "KAB. TORAJA UTARA" }, { "id": "2621", "lokasi": "KAB. WAJO" }, { "id": "2622", "lokasi": "KOTA MAKASSAR" }, { "id": "2623", "lokasi": "KOTA PALOPO" }, { "id": "2624", "lokasi": "KOTA PAREPARE" }, { "id": "2701", "lokasi": "KAB. BOMBANA" }, { "id": "2702", "lokasi": "KAB. BUTON" }, { "id": "2703", "lokasi": "KAB. BUTON SELATAN" }, { "id": "2704", "lokasi": "KAB. BUTON TENGAH" }, { "id": "2705", "lokasi": "KAB. BUTON UTARA" }, { "id": "2706", "lokasi": "KAB. KOLAKA" }, { "id": "2707", "lokasi": "KAB. KOLAKA TIMUR" }, { "id": "2708", "lokasi": "KAB. KOLAKA UTARA" }, { "id": "2709", "lokasi": "KAB. KONAWE" }, { "id": "2710", "lokasi": "KAB. KONAWE KEPULAUAN" }, { "id": "2711", "lokasi": "KAB. KONAWE SELATAN" }, { "id": "2712", "lokasi": "KAB. KONAWE UTARA" }, { "id": "2713", "lokasi": "KAB. MUNA" }, { "id": "2714", "lokasi": "KAB. MUNA BARAT" }, { "id": "2715", "lokasi": "KAB. WAKATOBI" }, { "id": "2716", "lokasi": "KOTA BAU-BAU" }, { "id": "2717", "lokasi": "KOTA KENDARI" }, { "id": "2801", "lokasi": "KAB. BANGGAI" }, { "id": "2802", "lokasi": "KAB. BANGGAI KEPULAUAN" }, { "id": "2803", "lokasi": "KAB. BANGGAI LAUT" }, { "id": "2804", "lokasi": "KAB. BUOL" }, { "id": "2805", "lokasi": "KAB. DONGGALA" }, { "id": "2806", "lokasi": "KAB. MOROWALI" }, { "id": "2807", "lokasi": "KAB. MOROWALI UTARA" }, { "id": "2808", "lokasi": "KAB. PARIGI MOUTONG" }, { "id": "2809", "lokasi": "KAB. POSO" }, { "id": "2810", "lokasi": "KAB. SIGI" }, { "id": "2811", "lokasi": "KAB. TOJO UNA-UNA" }, { "id": "2812", "lokasi": "KAB. TOLI-TOLI" }, { "id": "2813", "lokasi": "KOTA PALU" }, { "id": "2901", "lokasi": "KAB. BOLAANG MONGONDOW" }, { "id": "2902", "lokasi": "KAB. BOLAANG MONGONDOW SELATAN" }, { "id": "2903", "lokasi": "KAB. BOLAANG MONGONDOW TIMUR" }, { "id": "2904", "lokasi": "KAB. BOLAANG MONGONDOW UTARA" }, { "id": "2905", "lokasi": "KAB. KEPULAUAN SANGIHE" }, { "id": "2906", "lokasi": "KAB. KEPULAUAN SIAU TAGULANDANG BIARO" }, { "id": "2907", "lokasi": "KAB. KEPULAUAN TALAUD" }, { "id": "2908", "lokasi": "KAB. MINAHASA" }, { "id": "2909", "lokasi": "KAB. MINAHASA SELATAN" }, { "id": "2910", "lokasi": "KAB. MINAHASA TENGGARA" }, { "id": "2911", "lokasi": "KAB. MINAHASA UTARA" }, { "id": "2912", "lokasi": "KOTA BITUNG" }, { "id": "2913", "lokasi": "KOTA KOTAMOBAGU" }, { "id": "2914", "lokasi": "KOTA MANADO" }, { "id": "2915", "lokasi": "KOTA TOMOHON" }, { "id": "3001", "lokasi": "KAB. MAJENE" }, { "id": "3002", "lokasi": "KAB. MAMASA" }, { "id": "3003", "lokasi": "KAB. MAMUJU" }, { "id": "3004", "lokasi": "KAB. MAMUJU TENGAH" }, { "id": "3005", "lokasi": "KAB. MAMUJU UTARA" }, { "id": "3006", "lokasi": "KAB. POLEWALI MANDAR" }],
        "Asia/Jayapura": [{ "id": "1901", "lokasi": "KAB. ALOR" }, { "id": "1902", "lokasi": "KAB. BELU" }, { "id": "1903", "lokasi": "KAB. ENDE" }, { "id": "1904", "lokasi": "KAB. FLORES TIMUR" }, { "id": "1905", "lokasi": "KAB. KUPANG" }, { "id": "1906", "lokasi": "KAB. LEMBATA" }, { "id": "1907", "lokasi": "KAB. MALAKA" }, { "id": "1908", "lokasi": "KAB. MANGGARAI" }, { "id": "1909", "lokasi": "KAB. MANGGARAI BARAT" }, { "id": "1910", "lokasi": "KAB. MANGGARAI TIMUR" }, { "id": "1911", "lokasi": "KAB. NGADA" }, { "id": "1912", "lokasi": "KAB. NAGEKEO" }, { "id": "1913", "lokasi": "KAB. ROTE NDAO" }, { "id": "1914", "lokasi": "KAB. SABU RAIJUA" }, { "id": "1915", "lokasi": "KAB. SIKKA" }, { "id": "1916", "lokasi": "KAB. SUMBA BARAT" }, { "id": "1917", "lokasi": "KAB. SUMBA BARAT DAYA" }, { "id": "1918", "lokasi": "KAB. SUMBA TENGAH" }, { "id": "1919", "lokasi": "KAB. SUMBA TIMUR" }, { "id": "1920", "lokasi": "KAB. TIMOR TENGAH SELATAN" }, { "id": "1921", "lokasi": "KAB. TIMOR TENGAH UTARA" }, { "id": "1922", "lokasi": "KOTA KUPANG" }, { "id": "3101", "lokasi": "KAB. BURU" }, { "id": "3102", "lokasi": "KAB. BURU SELATAN" }, { "id": "3103", "lokasi": "KAB. KEPULAUAN ARU" }, { "id": "3104", "lokasi": "KAB. MALUKU BARAT DAYA" }, { "id": "3105", "lokasi": "KAB. MALUKU TENGAH" }, { "id": "3106", "lokasi": "KAB. MALUKU TENGGARA" }, { "id": "3107", "lokasi": "KAB. MALUKU TENGGARA BARAT" }, { "id": "3108", "lokasi": "KAB. SERAM BAGIAN BARAT" }, { "id": "3109", "lokasi": "KAB. SERAM BAGIAN TIMUR" }, { "id": "3110", "lokasi": "KOTA AMBON" }, { "id": "3111", "lokasi": "KOTA TUAL" }, { "id": "3201", "lokasi": "KAB. HALMAHERA BARAT" }, { "id": "3202", "lokasi": "KAB. HALMAHERA TENGAH" }, { "id": "3203", "lokasi": "KAB. HALMAHERA UTARA" }, { "id": "3204", "lokasi": "KAB. HALMAHERA SELATAN" }, { "id": "3205", "lokasi": "KAB. KEPULAUAN SULA" }, { "id": "3206", "lokasi": "KAB. HALMAHERA TIMUR" }, { "id": "3207", "lokasi": "KAB. PULAU MOROTAI" }, { "id": "3208", "lokasi": "KAB. PULAU TALIABU" }, { "id": "3209", "lokasi": "KOTA TERNATE" }, { "id": "3210", "lokasi": "KOTA TIDORE KEPULAUAN" }, { "id": "3211", "lokasi": "KOTA SOFIFI" }, { "id": "3212", "lokasi": "KOTA SOFIFI" }, { "id": "3301", "lokasi": "KAB. ASMAT" }, { "id": "3302", "lokasi": "KAB. BIAK NUMFOR" }, { "id": "3303", "lokasi": "KAB. BOVEN DIGOEL" }, { "id": "3304", "lokasi": "KAB. DEIYAI" }, { "id": "3305", "lokasi": "KAB. DOGIYAI" }, { "id": "3306", "lokasi": "KAB. INTAN JAYA" }, { "id": "3307", "lokasi": "KAB. JAYAPURA" }, { "id": "3308", "lokasi": "KAB. JAYAWIJAYA" }, { "id": "3309", "lokasi": "KAB. KEEROM" }, { "id": "3310", "lokasi": "KAB. KEPULAUAN YAPEN" }, { "id": "3311", "lokasi": "KAB. LANNY JAYA" }, { "id": "3312", "lokasi": "KAB. MAMBERAMO RAYA" }, { "id": "3313", "lokasi": "KAB. MAMBERAMO TENGAH" }, { "id": "3314", "lokasi": "KAB. MAPPI" }, { "id": "3315", "lokasi": "KAB. MERAUKE" }, { "id": "3316", "lokasi": "KAB. MIMIKA" }, { "id": "3317", "lokasi": "KAB. NABIRE" }, { "id": "3318", "lokasi": "KAB. NDUGA" }, { "id": "3319", "lokasi": "KAB. PANIAI" }, { "id": "3320", "lokasi": "KAB. PEGUNUNGAN BINTANG" }, { "id": "3321", "lokasi": "KAB. PUNCAK" }, { "id": "3322", "lokasi": "KAB. PUNCAK JAYA" }, { "id": "3323", "lokasi": "KAB. SARMI" }, { "id": "3324", "lokasi": "KAB. SUPIORI" }, { "id": "3325", "lokasi": "KAB. TOLIKARA" }, { "id": "3326", "lokasi": "KAB. WAROPEN" }, { "id": "3327", "lokasi": "KAB. YAHUKIMO" }, { "id": "3328", "lokasi": "KAB. YALIMO" }, { "id": "3329", "lokasi": "KOTA JAYAPURA" }, { "id": "3330", "lokasi": "KAB. YAPEN WAROPEN" }, { "id": "3401", "lokasi": "KAB. FAKFAK" }, { "id": "3402", "lokasi": "KAB. KAIMANA" }, { "id": "3403", "lokasi": "KAB. MANOKWARI" }, { "id": "3404", "lokasi": "KAB. MANOKWARI SELATAN" }, { "id": "3405", "lokasi": "KAB. MAYBRAT" }, { "id": "3406", "lokasi": "KAB. PEGUNUNGAN ARFAK" }, { "id": "3407", "lokasi": "KAB. RAJA AMPAT" }, { "id": "3408", "lokasi": "KAB. SORONG" }, { "id": "3409", "lokasi": "KAB. SORONG SELATAN" }, { "id": "3410", "lokasi": "KAB. TAMBRAUW" }, { "id": "3411", "lokasi": "KAB. TELUK BINTUNI" }, { "id": "3412", "lokasi": "KAB. TELUK WONDAMA" }, { "id": "3413", "lokasi": "KOTA SORONG" }]
    };

    // --- 2. LOGIKA SEARCH DROPDOWN ---
    function renderCities(filter = "") {
        const tz = timezoneSelect.value;
        const cities = dataKota[tz] || [];
        cityDropdown.innerHTML = "";

        const filtered = cities.filter(c => c.lokasi.toLowerCase().includes(filter.toLowerCase()));

        filtered.forEach(k => {
            const item = document.createElement("div");
            item.className = "px-4 py-2 hover:bg-primary hover:text-white cursor-pointer text-sm border-b border-white/5 text-white";
            item.textContent = k.lokasi;
            item.onclick = () => {
                citySearch.value = k.lokasi;
                selectedCityId = k.id;
                cityDropdown.classList.add("hidden");
                fetchAllData();
            };
            cityDropdown.appendChild(item);
        });

        if (filtered.length === 0) cityDropdown.innerHTML = "<div class='p-4 text-xs opacity-50 text-center text-white'>Kota tidak ditemukan</div>";
    }

    citySearch.addEventListener("focus", () => {
        renderCities(citySearch.value);
        cityDropdown.classList.remove("hidden");
    });

    citySearch.addEventListener("input", (e) => renderCities(e.target.value));

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".relative")) cityDropdown.classList.add("hidden");
    });

    // --- 3. LOGIKA FETCH DATA ---
    async function fetchAllData() {
        if (!selectedCityId) return;
        const d = daySelect.value;
        const m = monthSelect.value;
        const y = yearSelect.value;

        // Fetch Harian
        try {
            const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${selectedCityId}/${y}/${m}/${d}`);
            const data = await res.json();
            if (data.status && data.data.jadwal) {
                ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].forEach(k => {
                    document.getElementById(k).textContent = data.data.jadwal[k];
                    jadwalSholat[k] = data.data.jadwal[k];
                });
            }
        } catch (e) { console.error(e); }

        // Fetch Bulanan
        try {
            monthlyTableBody.innerHTML = "<tr><td colspan='9' class='text-center'>Memuat...</td></tr>";
            const resB = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${selectedCityId}/${y}/${m}`);
            const dataB = await resB.json();
            if (dataB.status && dataB.data.jadwal) {
                monthlyTableBody.innerHTML = "";
                dataB.data.jadwal.forEach((hari, index) => {
                    const row = document.createElement("tr");
                    const tglLoop = index + 1;
                    const dateObj = new Date(y, m - 1, tglLoop);
                    const isToday = (new Date().getDate() == tglLoop && (new Date().getMonth() + 1) == m && new Date().getFullYear() == y);

                    // --- KONVERSI HIJRIAH & KALENDER PUASA ---
                    const hijriFormatter = new Intl.DateTimeFormat('id-TN-u-ca-islamic', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    });
                    // Format default e.g. "15 Syawal 1445 H"
                    let hijriDateStr = hijriFormatter.format(dateObj);
                    // Bersihkan jika ada tulisan "AH" atau sejenisnya
                    hijriDateStr = hijriDateStr.replace(/ AH/g, ' H');

                    const hijriParts = new Intl.DateTimeFormat('id-TN-u-ca-islamic', {
                        day: 'numeric', month: 'numeric', year: 'numeric'
                    }).formatToParts(dateObj);

                    let hD = 1, hM = 1, hY = 1445;
                    hijriParts.forEach(part => {
                        if (part.type === 'day') hD = parseInt(part.value);
                        if (part.type === 'month') hM = parseInt(part.value);
                        if (part.type === 'year') hY = parseInt(part.value.replace(/[^0-9]/g, ''));
                    });

                    const dayOfWeek = dateObj.getDay();

                    let puasaLabel = "-";
                    let badgeClass = "badge-ghost opacity-30 text-xs";

                    // Tentukan Hari Puasa atau Haram
                    if ((hM === 12 && (hD === 10 || hD === 11 || hD === 12 || hD === 13)) || (hM === 10 && hD === 1)) {
                        puasaLabel = "Haram Puasa";
                        badgeClass = "badge-error font-bold text-white shadow-lg shadow-error/30 text-[10px] md:text-xs";
                    } else if (hM === 9) {
                        puasaLabel = "Ramadhan";
                        badgeClass = "badge-success font-bold text-white shadow-lg shadow-success/30 text-[10px] md:text-xs";
                    } else if (hM === 12 && hD === 9) {
                        puasaLabel = "Arafah";
                        badgeClass = "badge-accent font-bold text-white shadow-lg shadow-accent/30 text-[10px] md:text-xs";
                    } else if (hM === 1 && hD === 9) {
                        puasaLabel = "Tasu'a";
                        badgeClass = "badge-info font-bold text-white shadow-lg shadow-info/30 text-[10px] md:text-xs";
                    } else if (hM === 1 && hD === 10) {
                        puasaLabel = "Asyura";
                        badgeClass = "badge-info font-bold text-white shadow-lg shadow-info/30 text-[10px] md:text-xs";
                    } else if (hD === 13 || hD === 14 || hD === 15) {
                        puasaLabel = "Ayyamul Bidh";
                        badgeClass = "badge-secondary font-bold text-white shadow-lg shadow-secondary/30 text-[10px] md:text-xs";
                    } else if (dayOfWeek === 1) {
                        puasaLabel = "Senin";
                        badgeClass = "badge-primary font-bold text-white shadow-lg shadow-primary/30 text-[10px] md:text-xs";
                    } else if (dayOfWeek === 4) {
                        puasaLabel = "Kamis";
                        badgeClass = "badge-primary font-bold text-white shadow-lg shadow-primary/30 text-[10px] md:text-xs";
                    }

                    // Aturan Hari Jumat (selain Ramadhan)
                    if (dayOfWeek === 5 && hM !== 9 && puasaLabel !== "-" && puasaLabel !== "Haram Puasa") {
                        puasaLabel = "-";
                        badgeClass = "badge-ghost opacity-30 text-xs";
                    }

                    // --- HIGHLIGHT HARI INI SESUAI GAMBAR ---
                    row.className = "border-b border-white/5 hover:bg-white/5 transition-colors";
                    if (isToday) {
                        row.id = "row-today";
                        row.style.backgroundColor = "#182c2e";
                        row.classList.add("text-white");
                    }

                    const maghribColorClass = isToday ? "text-red-500 font-bold" : "";
                    const todayText = isToday ? '<span class="text-[10px] text-teal-400 mt-0.5">(Hari ini)</span>' : '';

                    row.innerHTML = `
                        <td class="whitespace-nowrap px-6 py-4">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl font-bold ${isToday ? 'text-white' : 'text-slate-200'}">${String(tglLoop).padStart(2, '0')}</span>
                                <div class="flex flex-col text-left">
                                    <span class="text-sm font-medium ${isToday ? 'text-white' : 'text-slate-300'}">${namaHari[dateObj.getDay()]}</span>
                                    ${todayText}
                                </div>
                            </div>
                        </td>
                        <td class="whitespace-nowrap font-medium text-[11px] md:text-xs text-slate-400">${hijriDateStr}</td>
                        <td class="text-center font-mono text-slate-300">${hari.imsak || '--:--'}</td>
                        <td class="text-center font-mono text-slate-300">${hari.subuh}</td>
                        <td class="text-center font-mono text-slate-300">${hari.dzuhur}</td>
                        <td class="text-center font-mono text-slate-300">${hari.ashar}</td>
                        <td class="text-center font-mono ${maghribColorClass || 'text-slate-300'}">${hari.maghrib}</td>
                        <td class="text-center font-mono text-slate-300">${hari.isya}</td>
                        <td class="text-center"><span class="badge ${badgeClass} border-none">${puasaLabel}</span></td>
                    `;
                    monthlyTableBody.appendChild(row);
                });
                const lokasiNama = citySearch.value || "KOTA JAKARTA";
                document.getElementById("printHeaderTitle").textContent = `Jadwal Sholat & Puasa ${lokasiNama} - ${namaBulan[m - 1]} ${y}`;

                // Auto-scroll ke hari ini
                setTimeout(() => {
                    const todayRow = document.getElementById("row-today");
                    if (todayRow) {
                        // Tunggu sebentar agar render selesai baru scroll
                        todayRow.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }, 100);
            }
        } catch (e) { console.error(e); }
    }

    // --- 4. LOGIKA JAM & COUNTDOWN ---
    function updateClock() {
        const now = new Date();
        const tz = timezoneSelect.value;
        const timeOpt = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz };
        document.getElementById("time").textContent = new Intl.DateTimeFormat('en-GB', timeOpt).format(now);

        const dayStr = String(now.getDate()).padStart(2, '0');
        const monthStr = namaBulan[now.getMonth()];
        const yearStr = now.getFullYear();
        document.getElementById("fullDateDisplay").textContent = `${namaHari[now.getDay()]}, ${dayStr} ${monthStr} ${yearStr}`;

        const hijriOpt = { day: 'numeric', month: 'long', year: 'numeric' };
        let hijriStr = new Intl.DateTimeFormat('id-TN-u-ca-islamic', hijriOpt).format(now);
        hijriStr = hijriStr.replace(/ AH/g, ' H');
        document.getElementById("hijriDateDisplay").textContent = hijriStr;

        if (jadwalSholat && jadwalSholat.subuh) {
            const prefix = `${yearSelect.value}-${String(monthSelect.value).padStart(2, '0')}-${String(daySelect.value).padStart(2, '0')}`;

            const prayers = [
                { id: 'subuh', name: 'Subuh', time: jadwalSholat.subuh, icon: '🌆' },
                { id: 'dzuhur', name: 'Dzuhur', time: jadwalSholat.dzuhur, icon: '☀️' },
                { id: 'ashar', name: 'Ashar', time: jadwalSholat.ashar, icon: '⛅' },
                { id: 'maghrib', name: 'Maghrib', time: jadwalSholat.maghrib, icon: '🌇' },
                { id: 'isya', name: 'Isya', time: jadwalSholat.isya, icon: '🌙' }
            ];

            let nextPrayer = null;
            let currentPrayer = null;

            for (let i = 0; i < prayers.length; i++) {
                const target = new Date(`${prefix}T${prayers[i].time}:00`);
                if (now < target) {
                    nextPrayer = prayers[i];
                    nextPrayer.dateObj = target;
                    currentPrayer = i > 0 ? prayers[i - 1] : null;
                    if (currentPrayer) {
                        currentPrayer.dateObj = new Date(`${prefix}T${currentPrayer.time}:00`);
                    } else {
                        // Current is Isya of previous day
                        currentPrayer = { name: 'Isya' };
                        const prevDate = new Date(now); prevDate.setDate(prevDate.getDate() - 1);
                        currentPrayer.dateObj = new Date(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}T${jadwalSholat.isya}:00`);
                    }
                    break;
                }
            }

            if (!nextPrayer) {
                // Next is Subuh tomorrow
                nextPrayer = prayers[0];
                const nextDate = new Date(now); nextDate.setDate(nextDate.getDate() + 1);
                nextPrayer.dateObj = new Date(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}T${jadwalSholat.subuh}:00`);
                currentPrayer = prayers[4];
                currentPrayer.dateObj = new Date(`${prefix}T${prayers[4].time}:00`);
            }

            // Update UI
            document.getElementById("nextPrayerName").textContent = nextPrayer.name;
            document.getElementById("nextPrayerIcon").textContent = nextPrayer.icon;

            const tzMap = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };
            const tzLabel = tzMap[tz] || tz;
            document.getElementById("nextPrayerTime").textContent = `${nextPrayer.time} ${tzLabel}`;

            const diff = nextPrayer.dateObj - now;
            if (diff <= 0) {
                document.getElementById("nextPrayerCountdown").textContent = "Adzan!";
                document.getElementById("nextPrayerProgress").style.width = "100%";
            } else {
                const s = Math.floor(diff / 1000) % 60;
                const m = Math.floor(diff / (1000 * 60)) % 60;
                const h = Math.floor(diff / (1000 * 60 * 60));
                document.getElementById("nextPrayerCountdown").textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

                const totalDuration = nextPrayer.dateObj - currentPrayer.dateObj;
                const elapsed = now - currentPrayer.dateObj;
                let percent = (elapsed / totalDuration) * 100;
                if (percent < 0) percent = 0;
                if (percent > 100) percent = 100;
                document.getElementById("nextPrayerProgress").style.width = `${percent}%`;
            }

            // Update 5 cards (Subuh, Dzuhur, Ashar, Maghrib, Isya) countdown
            ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].forEach(k => {
                const targetCard = new Date(`${prefix}T${jadwalSholat[k]}:00`);
                const diffCard = targetCard - now;
                const el = document.getElementById(`${k}Countdown`);
                if (el) {
                    if (diffCard <= 0) {
                        el.textContent = "Adzan!";
                        el.classList.add("text-emerald-400");
                    } else {
                        const sC = Math.floor(diffCard / 1000) % 60;
                        const mC = Math.floor(diffCard / (1000 * 60)) % 60;
                        const hC = Math.floor(diffCard / (1000 * 60 * 60));
                        el.textContent = `${String(hC).padStart(2, '0')}:${String(mC).padStart(2, '0')}:${String(sC).padStart(2, '0')}`;
                        el.classList.remove("text-emerald-400");
                    }
                }
            });
        }
    }

    async function fetchDailyInspiration(attempts = 0) {
        if (attempts > 10) {
            document.querySelectorAll(".inspirationTitle").forEach(el => el.textContent = "Ayat Hari Ini");
            document.querySelectorAll(".inspirationText").forEach(el => el.textContent = '"Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman."');
            document.querySelectorAll(".inspirationSource").forEach(el => el.textContent = '(QS. An-Nisa: 103)');
            return;
        }

        const isQuran = Math.random() > 0.5;
        try {
            if (isQuran) {
                const res = await fetch("https://api.myquran.com/v3/quran/random");
                const data = await res.json();
                if (data.status) {
                    let text = data.data.translation.trim();
                    if (text.length > 200) {
                        return fetchDailyInspiration(attempts + 1);
                    }
                    if (!text.startsWith('"')) text = `"${text}"`;
                    document.querySelectorAll(".inspirationTitle").forEach(el => el.textContent = "Ayat Hari Ini");
                    document.querySelectorAll(".inspirationText").forEach(el => el.textContent = text);
                    document.querySelectorAll(".inspirationSource").forEach(el => el.textContent = `(QS. ${data.data.surah.name_latin}: ${data.data.ayah_number})`);
                }
            } else {
                const res = await fetch("https://api.myquran.com/v3/hadis/enc/random");
                const data = await res.json();
                if (data.status) {
                    let text = data.data.text.id.trim();
                    if (text.length > 200) {
                        return fetchDailyInspiration(attempts + 1);
                    }
                    if (!text.startsWith('"')) text = `"${text}"`;
                    document.querySelectorAll(".inspirationTitle").forEach(el => el.textContent = "Hadis Hari Ini");
                    document.querySelectorAll(".inspirationText").forEach(el => el.textContent = text);
                    document.querySelectorAll(".inspirationSource").forEach(el => el.textContent = `(${data.data.takhrij})`);
                }
            }
        } catch (e) {
            console.error("Gagal memuat mutiara hikmah", e);
            document.querySelectorAll(".inspirationTitle").forEach(el => el.textContent = "Ayat Hari Ini");
            document.querySelectorAll(".inspirationText").forEach(el => el.textContent = '"Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman."');
            document.querySelectorAll(".inspirationSource").forEach(el => el.textContent = '(QS. An-Nisa: 103)');
        }
    }

    function initApp() {
        const now = new Date();
        const curY = now.getFullYear();
        for (let i = curY - 100; i <= curY + 100; i++) {
            let opt = document.createElement("option"); opt.value = i; opt.textContent = i;
            if (i === curY) opt.selected = true;
            yearSelect.appendChild(opt);
        }
        monthSelect.value = now.getMonth() + 1;
        updateDaysOptions();

        detectLocation();
        fetchDailyInspiration();
        setInterval(updateClock, 1000);
    }

    function detectLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                userLat = lat;
                userLon = lon;

                // Format Coordinates
                const latF = parseFloat(lat).toFixed(4);
                const lonF = parseFloat(lon).toFixed(4);
                const latStr = latF >= 0 ? `${latF}° LU` : `${Math.abs(latF)}° LS`;
                const lonStr = lonF >= 0 ? `${lonF}° BT` : `${Math.abs(lonF)}° BB`;
                document.getElementById('infoCoordinates').textContent = `${latStr}, ${lonStr}`;

                // Setup Timezone native
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const offset = -(new Date().getTimezoneOffset()) / 60;
                const gmtStr = `GMT${offset >= 0 ? '+' : ''}${offset}`;
                const tzMap = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };
                const tzLabel = tzMap[tz] || tz;
                document.getElementById('infoTimezone').textContent = `${gmtStr} (${tzLabel})`;

                try {
                    // Fetch Cuaca
                    try {
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                        const weatherData = await weatherRes.json();
                        if (weatherData && weatherData.current_weather) {
                            const cw = weatherData.current_weather;
                            const codes = {
                                0: "☀️ Cerah", 1: "🌤️ Cerah Berawan", 2: "⛅ Berawan Sebagian", 3: "☁️ Mendung",
                                45: "🌫️ Kabut", 48: "🌫️ Kabut Es", 51: "🌦️ Gerimis", 53: "🌦️ Gerimis", 55: "🌦️ Gerimis",
                                61: "🌧️ Hujan Ringan", 63: "🌧️ Hujan", 65: "🌧️ Hujan Lebat",
                                71: "❄️ Salju", 73: "❄️ Salju", 75: "❄️ Salju",
                                80: "⛈️ Hujan Badai", 81: "⛈️ Hujan Badai", 82: "⛈️ Hujan Badai",
                                95: "🌩️ Badai Petir", 96: "🌩️ Badai Petir", 99: "🌩️ Badai Petir"
                            };
                            const desc = codes[cw.weathercode] || "☁️ Berawan";
                            const iconMatch = desc.match(/^[^\s]+/);
                            const textMatch = desc.substring(iconMatch[0].length).trim();
                            document.getElementById('weatherIcon').textContent = iconMatch ? iconMatch[0] : "🌤️";
                            document.getElementById('weatherText').textContent = `${Math.round(cw.temperature)}°C • ${textMatch}`;
                        }
                    } catch (e) { console.error("Weather fetch failed", e); }

                    // Cari nama kota dari GPS menggunakan Nominatim
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                    const data = await res.json();

                    const city = data.address.city || data.address.town || data.address.village || data.address.county || "Lokasi Anda";
                    const region = data.address.state || data.address.region || "";
                    const country = data.address.country || "Indonesia";

                    document.getElementById('infoCityName').textContent = city;
                    document.getElementById('infoRegionName').textContent = `${region}, ${country}`;

                    // Cocokkan ke dataKota MyQuran
                    let foundCityId = null;
                    let foundTz = "Asia/Jakarta";
                    let foundCityName = "";
                    const cityNameUpper = city.toUpperCase().replace('KOTA ', '').replace('KABUPATEN ', '');

                    for (const tzKey in dataKota) {
                        const citiesInTz = dataKota[tzKey];
                        const match = citiesInTz.find(c => c.lokasi.includes(cityNameUpper) || cityNameUpper.includes(c.lokasi.replace('KOTA ', '').replace('KAB. ', '')));
                        if (match) {
                            foundCityId = match.id;
                            foundTz = tzKey;
                            foundCityName = match.lokasi;
                            break;
                        }
                    }

                    if (foundCityId) {
                        timezoneSelect.value = foundTz;
                        selectedCityId = foundCityId;
                        citySearch.value = foundCityName;
                    } else {
                        // Fallback jika tidak match tapi berhasil dapat lokasi GPS
                        timezoneSelect.value = "Asia/Jakarta";
                        selectedCityId = "1301";
                        citySearch.value = "KOTA JAKARTA";
                    }
                    fetchAllData();
                } catch (e) {
                    console.error("Gagal mendeteksi nama kota dari koordinat:", e);
                    document.getElementById('infoCityName').textContent = "Lokasi GPS Ditemukan";
                    document.getElementById('infoRegionName').textContent = "Namun gagal memuat nama kota";
                    timezoneSelect.value = "Asia/Jakarta";
                    selectedCityId = "1301";
                    citySearch.value = "KOTA JAKARTA";
                    fetchAllData();
                }
            }, (err) => {
                console.warn("Akses lokasi ditolak atau tidak tersedia:", err);
                document.getElementById('infoCityName').textContent = "Akses GPS Ditolak";
                document.getElementById('infoRegionName').textContent = "Menggunakan default (Jakarta)";
                document.getElementById('infoCoordinates').textContent = "-";
                document.getElementById('infoTimezone').textContent = "-";
                timezoneSelect.value = "Asia/Jakarta";
                selectedCityId = "1301";
                citySearch.value = "KOTA JAKARTA";
                fetchAllData();
            }, { timeout: 10000 });
        } else {
            console.warn("Geolocation tidak didukung browser ini");
            timezoneSelect.value = "Asia/Jakarta";
            selectedCityId = "1301";
            citySearch.value = "KOTA JAKARTA";
            fetchAllData();
        }
    }

    function updateDaysOptions() {
        const m = parseInt(monthSelect.value);
        const y = parseInt(yearSelect.value);
        const curD = parseInt(daySelect.value) || new Date().getDate();
        const total = new Date(y, m, 0).getDate();
        daySelect.innerHTML = "";
        for (let i = 1; i <= total; i++) {
            let opt = document.createElement("option"); opt.value = i; opt.textContent = i;
            if (i === curD || (i === total && curD > total)) opt.selected = true;
            daySelect.appendChild(opt);
        }
    }

    timezoneSelect.addEventListener("change", () => {
        citySearch.value = "";
        selectedCityId = null;
        renderCities("");
        ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].forEach(k => document.getElementById(k).textContent = "--:--");
        monthlyTableBody.innerHTML = "<tr><td colspan='9' class='text-center opacity-50'>Silakan pilih kota</td></tr>";
    });

    [monthSelect, yearSelect, daySelect].forEach(el => el.addEventListener("change", fetchAllData));
    monthSelect.addEventListener("change", updateDaysOptions);
    yearSelect.addEventListener("change", updateDaysOptions);

    let qiblaMap = null;
    let userLat = null;
    let userLon = null;
    let currentQiblaDegree = 0;
    let compassHasMatched = false;

    let allSurahs = [];
    let currentAudio = null;
    let currentPlayingBtn = null;

    let currentSurahData = null;
    let isMushafMode = false;

    function toArabicNumber(num) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return String(num).split('').map(d => arabicNumbers[d]).join('');
    }

    window.switchTab = function (tabId) {
        document.getElementById("home-section").classList.add("hidden");
        document.getElementById("qibla-section").classList.add("hidden");
        document.getElementById("quran-section").classList.add("hidden");

        // Reset sidebar styles
        document.getElementById("nav-home").className = "flex items-center gap-3 text-slate-400 px-4 py-3.5 rounded-2xl transition-colors hover:bg-white/5 border border-transparent";
        document.getElementById("nav-qibla").className = "flex items-center gap-3 text-slate-400 px-4 py-3.5 rounded-2xl transition-colors hover:bg-white/5 border border-transparent";
        document.getElementById("nav-quran").className = "flex items-center gap-3 text-slate-400 px-4 py-3.5 rounded-2xl transition-colors hover:bg-white/5 border border-transparent";

        // Reset mobile bottom nav styles
        ["home", "qibla", "quran"].forEach(id => {
            const mobBtn = document.getElementById(`nav-mobile-${id}`);
            if (mobBtn) {
                mobBtn.classList.remove("text-teal-400");
                mobBtn.classList.add("text-slate-500", "hover:text-slate-300");
            }
        });

        // Set active tab styles
        const activeMobBtn = document.getElementById(`nav-mobile-${tabId}`);
        if (activeMobBtn) {
            activeMobBtn.classList.add("text-teal-400");
            activeMobBtn.classList.remove("text-slate-500", "hover:text-slate-300");
        }

        if (tabId === 'home') {
            document.getElementById("home-section").classList.remove("hidden");
            document.getElementById("nav-home").className = "flex items-center gap-3 bg-[#0d2226] text-teal-400 px-4 py-3.5 rounded-2xl transition-colors border border-teal-500/10";
        } else if (tabId === 'qibla') {
            document.getElementById("qibla-section").classList.remove("hidden");
            document.getElementById("nav-qibla").className = "flex items-center gap-3 bg-[#0d2226] text-teal-400 px-4 py-3.5 rounded-2xl transition-colors border border-teal-500/10";

            if (qiblaMap) {
                qiblaMap.invalidateSize();
            } else if (userLat !== null && userLon !== null) {
                initQibla(userLat, userLon);
            }
        } else if (tabId === 'quran') {
            document.getElementById("quran-section").classList.remove("hidden");
            document.getElementById("nav-quran").className = "flex items-center gap-3 bg-[#0d2226] text-teal-400 px-4 py-3.5 rounded-2xl transition-colors border border-teal-500/10";
            if (allSurahs.length === 0) {
                loadQuranList();
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function initQibla(lat, lon) {
        if (qiblaMap) return;

        const kaabaLat = 21.422487;
        const kaabaLon = 39.826206;

        // Hitung sudut Qibla menggunakan Great-Circle
        const latK = kaabaLat * Math.PI / 180;
        const lonK = kaabaLon * Math.PI / 180;
        const latU = lat * Math.PI / 180;
        const lonU = lon * Math.PI / 180;

        const y = Math.sin(lonK - lonU);
        const x = Math.cos(latU) * Math.tan(latK) - Math.sin(latU) * Math.cos(lonK - lonU);
        let qibla = Math.atan2(y, x) * 180 / Math.PI;
        if (qibla < 0) qibla += 360;

        currentQiblaDegree = qibla;

        const roundedQibla = qibla.toFixed(2);
        document.getElementById("qiblaDegreeText").textContent = `${roundedQibla}°`;

        // Deskripsi Arah Dasar
        let arah = "Utara";
        if (qibla > 22.5 && qibla <= 67.5) arah = "Timur Laut";
        else if (qibla > 67.5 && qibla <= 112.5) arah = "Timur";
        else if (qibla > 112.5 && qibla <= 157.5) arah = "Tenggara";
        else if (qibla > 157.5 && qibla <= 202.5) arah = "Selatan";
        else if (qibla > 202.5 && qibla <= 247.5) arah = "Barat Daya";
        else if (qibla > 247.5 && qibla <= 292.5) arah = "Barat";
        else if (qibla > 292.5 && qibla <= 337.5) arah = "Barat Laut";

        document.getElementById("qiblaDescText").textContent = `Mengarah ke ${arah} dari lokasimu`;
        document.getElementById("qiblaUserLoc").textContent = `${lat.toFixed(4)}° LU, ${lon.toFixed(4)}° BT`;

        // Putar Ikon Kompas
        document.getElementById("qiblaCompassIcon").style.transform = `rotate(${roundedQibla}deg)`;

        // Inisialisasi Peta
        qiblaMap = L.map('map').setView([lat, lon], 3);

        // Tile layer (Dark theme CartoDB)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(qiblaMap);

        // Marker User
        L.marker([lat, lon]).addTo(qiblaMap).bindPopup('Lokasi Anda').openPopup();

        // Marker Kaaba
        // Menggunakan SVG minimalis untuk Ka'bah agar tidak bergantung pada external image link yang mungkin rusak
        const kaabaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><rect x="4" y="4" width="16" height="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/><path d="M4 10H20" stroke="#f59e0b" stroke-width="2"/></svg>`;
        const kaabaIconUrl = encodeURI("data:image/svg+xml," + kaabaSvg).replace(/#/g, '%23');
        const kaabaIcon = L.icon({
            iconUrl: kaabaIconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
        L.marker([kaabaLat, kaabaLon], { icon: kaabaIcon }).addTo(qiblaMap).bindPopup('Ka\'bah, Makkah');

        // Garis Lurus Arah Kiblat
        const latlngs = [[lat, lon], [kaabaLat, kaabaLon]];
        const polyline = L.polyline(latlngs, { color: '#2dd4bf', weight: 3, dashArray: '5, 10' }).addTo(qiblaMap);

        // Fit Map to bounds
        qiblaMap.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    window.startSmartCompass = function () {
        const btn = document.getElementById("startCompassBtn");
        btn.innerHTML = "Meminta Izin...";

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        activateCompassListener();
                        btn.classList.add('hidden');
                    } else {
                        alert("Izin akses sensor ditolak.");
                        btn.innerHTML = "Akses Ditolak";
                    }
                })
                .catch(console.error);
        } else {
            // Android / Non-iOS
            activateCompassListener();
            btn.classList.add('hidden');
        }
    }

    function activateCompassListener() {
        if ("ondeviceorientationabsolute" in window) {
            window.addEventListener("deviceorientationabsolute", handleOrientation, true);
        } else if ("ondeviceorientation" in window) {
            window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
            alert("Sensor kompas tidak didukung di perangkat ini.");
        }
    }

    function handleOrientation(event) {
        let compassHeading = null;

        if (event.webkitCompassHeading) {
            // Apple devices
            compassHeading = event.webkitCompassHeading;
        } else if (event.absolute || event.alpha !== null) {
            // Android absolute
            compassHeading = 360 - event.alpha;
        }

        if (compassHeading !== null) {
            let arrowRotation = currentQiblaDegree - compassHeading;

            // Normalize
            if (arrowRotation < 0) arrowRotation += 360;
            if (arrowRotation >= 360) arrowRotation -= 360;

            const icon = document.getElementById("qiblaCompassIcon");
            const box = icon.parentElement;

            icon.style.transform = `rotate(${arrowRotation}deg)`;

            // Jika mengarah lurus (toleransi 3 derajat)
            if (arrowRotation > 357 || arrowRotation < 3) {
                icon.setAttribute("stroke", "#4ade80"); // green-400
                box.classList.add("shadow-[0_0_20px_rgba(74,222,128,0.5)]");
                box.classList.add("border-green-400/50");

                if (!compassHasMatched) {
                    compassHasMatched = true;
                    if (navigator.vibrate) navigator.vibrate(200);
                }
            } else {
                icon.setAttribute("stroke", "#2dd4bf"); // teal-400
                box.classList.remove("shadow-[0_0_20px_rgba(74,222,128,0.5)]");
                box.classList.remove("border-green-400/50");
                compassHasMatched = false;
            }
        }
    }

    // --- QURAN LOGIC ---
    async function loadQuranList() {
        try {
            const res = await fetch("https://api.myquran.com/v3/quran");
            const data = await res.json();
            if (data.status) {
                allSurahs = data.data;
                renderSurahs(allSurahs);
            }
        } catch (e) {
            console.error(e);
            document.getElementById("surahGrid").innerHTML = `<div class="p-6 text-center text-red-400 w-full col-span-full">Gagal memuat data Al-Quran. Periksa koneksi internet Anda.</div>`;
        }
    }

    function renderSurahs(list) {
        const grid = document.getElementById("surahGrid");
        grid.innerHTML = "";
        if (list.length === 0) {
            grid.innerHTML = `<div class="p-6 text-center text-slate-400 w-full col-span-full">Surah tidak ditemukan.</div>`;
            return;
        }

        list.forEach(s => {
            const card = document.createElement("div");
            card.className = "bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group flex items-center gap-4 relative overflow-hidden";
            card.onclick = () => openSurah(s.number);
            card.innerHTML = `
                <div class="w-12 h-12 rounded-xl bg-[#081b1c] border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold shrink-0 shadow-inner">${s.number}</div>
                <div class="flex-1">
                    <h3 class="text-white font-bold text-lg mb-0.5">${s.name_latin}</h3>
                    <p class="text-slate-400 text-xs">${s.translation} • ${s.number_of_ayahs} Ayat</p>
                </div>
                <div class="text-xl text-teal-500 font-serif font-bold opacity-80">${s.name}</div>
            `;
            grid.appendChild(card);
        });
    }

    document.getElementById("quranSearch").addEventListener("input", function (e) {
        const term = e.target.value.toLowerCase();
        const filtered = allSurahs.filter(s =>
            s.name_latin.toLowerCase().includes(term) ||
            s.translation.toLowerCase().includes(term) ||
            s.number.toString() === term
        );
        renderSurahs(filtered);
    });

    window.openSurah = async function (id) {
        document.getElementById("quranListView").classList.add("hidden");
        document.getElementById("quranReadView").classList.remove("hidden");

        document.getElementById("readSurahNameLatin").textContent = "Memuat...";
        document.getElementById("readSurahNameArab").textContent = "-";
        document.getElementById("readSurahArti").textContent = "-";
        document.getElementById("readSurahAyat").textContent = "- Ayat";
        document.getElementById("readSurahTipe").textContent = "-";
        document.getElementById("ayahContainer").innerHTML = `<div class="text-center text-slate-400 py-10">Mengambil ayat...</div>`;

        window.scrollTo(0, 0);

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        try {
            const res = await fetch(`https://api.myquran.com/v3/quran/${id}?limit=100`);
            const data = await res.json();

            if (data.status) {
                currentSurahData = data.data;

                // Ambil halaman sisanya jika total ayat > limit
                if (data.pagination && data.pagination.total > data.pagination.limit) {
                    const totalPages = Math.ceil(data.pagination.total / data.pagination.limit);
                    const promises = [];
                    for (let i = 2; i <= totalPages; i++) {
                        promises.push(fetch(`https://api.myquran.com/v3/quran/${id}?limit=100&page=${i}`).then(r => r.json()));
                    }
                    const nextPages = await Promise.all(promises);
                    nextPages.forEach(pData => {
                        if (pData.status && pData.data.ayahs) {
                            currentSurahData.ayahs.push(...pData.data.ayahs);
                        }
                    });
                }

                const s = currentSurahData;
                document.getElementById("readSurahNameLatin").textContent = s.name_latin;
                document.getElementById("readSurahNameArab").textContent = s.name;
                document.getElementById("readSurahArti").textContent = s.translation;
                document.getElementById("readSurahAyat").textContent = `${s.number_of_ayahs} Ayat`;
                document.getElementById("readSurahTipe").textContent = s.revelation;

                renderAyahs();
            }
        } catch (e) {
            console.error(e);
            document.getElementById("ayahContainer").innerHTML = `<div class="text-center text-red-400 py-10">Gagal memuat surah.</div>`;
        }
    }

    function renderAyahs() {
        if (!currentSurahData) return;
        const s = currentSurahData;
        let html = "";

        if (isMushafMode) {
            html = `<div class="ayah-card bg-white/5 border border-white/10 p-5 md:p-8 rounded-3xl md:rounded-[2rem] text-justify leading-[2.5] md:leading-[3.5] transition-colors" dir="rtl">`;
            s.ayahs.forEach(ayah => {
                html += `
                    <span class="ayah-arab text-3xl md:text-4xl text-white font-serif inline leading-[3.5] align-middle transition-colors">${ayah.arab}</span>
                    <span class="text-teal-500 font-serif text-2xl mx-1 select-none inline-block align-middle drop-shadow-sm">﴿${toArabicNumber(ayah.ayah_number)}﴾</span>
                `;
            });
            html += `</div>`;
        } else {
            s.ayahs.forEach(ayah => {
                const btnId = `btn-audio-${ayah.ayah_number}`;
                html += `
                    <div class="ayah-card bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl relative group transition-colors">
                        <div class="flex justify-between items-start mb-4 md:mb-6 gap-4">
                            <div class="ayah-number-badge w-10 h-10 rounded-full bg-[#0d2226] border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold shrink-0 text-sm shadow-inner transition-colors">${ayah.ayah_number}</div>
                            <div class="flex gap-2">
                                <button id="${btnId}" onclick="playAudio('${ayah.audio_url}', '${btnId}')" class="audio-btn w-10 h-10 rounded-full bg-white/5 hover:bg-teal-500 hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </button>
                            </div>
                        </div>
                        <div class="ayah-arab text-right text-3xl md:text-4xl leading-[2.2] md:leading-loose text-white font-serif mb-6 drop-shadow-sm transition-colors" dir="rtl">${ayah.arab}</div>
                        <div class="ayah-translation text-slate-300 text-sm leading-relaxed transition-colors">${ayah.translation}</div>
                    </div>
                `;
            });
        }

        document.getElementById("ayahContainer").innerHTML = html;
    }

    window.closeSurah = function () {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        document.getElementById("quranReadView").classList.add("hidden");
        document.getElementById("quranListView").classList.remove("hidden");
        window.scrollTo(0, 0);
    }

    window.playAudio = function (url, btnId) {
        const btn = document.getElementById(btnId);

        // Icon SVG Play
        const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        // Icon SVG Pause/Stop
        const stopIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12"></rect></svg>`;

        // Jika mengklik tombol yang sama yang sedang main, maka pause
        if (currentPlayingBtn === btnId && currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            btn.innerHTML = playIcon;
            btn.classList.remove('bg-teal-500', 'text-white');
            btn.classList.add('bg-white/5', 'text-slate-400');
            return;
        }

        // Jika ada audio jalan, matikan dulu dan kembalikan icon sebelumnya
        if (currentAudio) {
            currentAudio.pause();
            if (currentPlayingBtn) {
                const oldBtn = document.getElementById(currentPlayingBtn);
                if (oldBtn) {
                    oldBtn.innerHTML = playIcon;
                    oldBtn.classList.remove('bg-teal-500', 'text-white');
                    oldBtn.classList.add('bg-white/5', 'text-slate-400');
                }
            }
        }

        // Set audio baru
        currentAudio = new Audio(url);
        currentPlayingBtn = btnId;

        // Ganti icon ke stop
        btn.innerHTML = stopIcon;
        btn.classList.remove('bg-white/5', 'text-slate-400');
        btn.classList.add('bg-teal-500', 'text-white');

        currentAudio.play();

        // Kalau sudah selesai main, kembalikan icon
        currentAudio.onended = function () {
            btn.innerHTML = playIcon;
            btn.classList.remove('bg-teal-500', 'text-white');
            btn.classList.add('bg-white/5', 'text-slate-400');
            currentAudio = null;
            currentPlayingBtn = null;
        }
    }

    let isQuranLightMode = false;
    window.toggleQuranTheme = function () {
        isQuranLightMode = !isQuranLightMode;
        const container = document.getElementById("ayahContainer");
        const btn = document.getElementById("quranThemeBtn");

        if (isQuranLightMode) {
            container.classList.add("quran-light-theme");
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                Mode Gelap
            `;
            btn.classList.add("bg-white", "text-slate-800", "hover:bg-slate-200");
            btn.classList.remove("bg-white/5", "text-slate-400", "hover:text-white");
        } else {
            container.classList.remove("quran-light-theme");
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
                Mode Kertas
            `;
            btn.classList.remove("bg-white", "text-slate-800", "hover:bg-slate-200");
            btn.classList.add("bg-white/5", "text-slate-400", "hover:text-white");
        }
    }

    window.toggleMushafMode = function () {
        isMushafMode = !isMushafMode;
        const btn = document.getElementById("mushafBtn");

        if (isMushafMode) {
            btn.classList.add("bg-teal-500", "text-white", "border-teal-400");
            btn.classList.remove("bg-white/5", "text-slate-400", "border-white/10");
        } else {
            btn.classList.remove("bg-teal-500", "text-white", "border-teal-400");
            btn.classList.add("bg-white/5", "text-slate-400", "border-white/10");
        }

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        renderAyahs();
    }

    initApp();
});