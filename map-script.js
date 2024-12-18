 // Tambahkan elemen legenda ke dalam peta
        document.querySelector("#map").appendChild(document.getElementById("map-legend"));

        var map = L.map('map').setView([-2.5489, 118.0149], 5);

        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        });

        var googleMaps = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '&copy; Google Maps'
        });

        var googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: '&copy; Google Satellite'
        });

        googleSatellite.addTo(map);
        
        var baseMaps = {
            "OpenStreetMap": osm,
            "Google Maps": googleMaps,
            "Google Satellite": googleSatellite
        };

        var overlayMaps = {}; // Initialize an empty object to store overlay layers
        var layer1, layer2;
        
        // Tambahkan event listener untuk tombol "Cari"
        document.getElementById("search-button").addEventListener("click", function () {
            performSearch();
        });

        // Tambahkan event listener untuk mendeteksi penekanan tombol "Enter"
        document.getElementById("search-input").addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                performSearch(); // Panggil fungsi pencarian saat tombol "Enter" ditekan
            }
        });
        // Fungsi pencarian
        function performSearch() {
            const searchText = document.getElementById("search-input").value.toLowerCase(); // Input pencarian dikonversi ke huruf kecil
    
            if (!searchText) { // Validasi input kosong
                alert("Silakan masukkan kata kunci untuk pencarian. (Farmer Name/NIK/ID Farmer/ID Parcel/Parcel Code).");
                return;
            }

            let found = false; // Untuk melacak apakah ada fitur yang ditemukan

        // Pencarian di Layer 1 (Verified Farmer)
        if (layer1) {
        layer1.eachLayer(function (layer) {
            const properties = layer.feature.properties;

            // Periksa kecocokan di Nama, NIK, Parcel Code, atau ID Lahan
            if (
                (properties.Nama_Petan && properties.Nama_Petan.toLowerCase().includes(searchText)) ||
                (properties.NIK && properties.NIK.toLowerCase().includes(searchText)) ||
                (properties.Parcel_Cod && properties.Parcel_Cod.toLowerCase().includes(searchText)) ||
                (properties.ID_Lahan && properties.ID_Lahan.toLowerCase().includes(searchText))
            ) {
                map.fitBounds(layer.getBounds()); // Fokus ke fitur yang cocok
                layer.openPopup(); // Tampilkan popup
                found = true; // Tandai bahwa fitur ditemukan
            }
        });
        }

        // Pencarian di Layer 2 (Unverified Farmer)
        if (layer2 && !found) { // Jika tidak ditemukan di Layer 1
            layer2.eachLayer(function (layer) {
                const properties = layer.feature.properties;

        // Periksa kecocokan di Nama, NIK, Parcel Code, atau ID Lahan
        if (
            (properties.Nama_Petan && properties.Nama_Petan.toLowerCase().includes(searchText)) ||
            (properties.NIK && properties.NIK.toLowerCase().includes(searchText)) ||
            (properties.Parcel_Cod && properties.Parcel_Cod.toLowerCase().includes(searchText)) ||
            (properties.ID_Lahan && properties.ID_Lahan.toLowerCase().includes(searchText))
                ) {
                map.fitBounds(layer.getBounds()); // Fokus ke fitur yang cocok
                layer.openPopup(); // Tampilkan popup
                found = true; // Tandai bahwa fitur ditemukan
                }
            });
        }

            if (!found) {
                alert("Tidak ditemukan fitur dengan kata kunci tersebut."); // Tampilkan pesan jika tidak ada hasil
            }
        };

        // Utility function to zoom to a specific layer
        function zoomToLayer(layer) {
        if (layer) {
                map.fitBounds(layer.getBounds());
            }
        }

        // Fetch for Verified Farmer
        const verifiedfarmer = 'https://raw.githubusercontent.com/rofi25max/wriwebgis/refs/heads/main/KUD_TP_Verified.geojson'
        fetch(verifiedfarmer)
            .then(response => response.json())
            .then(data => {
            layer1 = L.geoJSON(data, { 
                    style: { color: 'rgb(255,255,51)', weight: 1 },
                    onEachFeature: function(feature, layer) {
                        if (feature.properties) {
                    
            // Create a list-style popup content
            const popupContent = `
                <div style="font-size:12px; line-height:1.5;">
                    <strong>Name:</strong> ${feature.properties.Nama_Petan || 'N/A'}<br>
                    <strong>NIK:</strong> ${feature.properties.NIK || 'N/A'}<br>
                    <strong>Gender:</strong> ${feature.properties.Gender || 'N/A'}<br>
                    <strong>ID Farmer:</strong> ${feature.properties.ID_Petani || 'N/A'}<br>
                    <strong>ID Parcel:</strong> ${feature.properties.ID_Lahan || 'N/A'}<br>
                    <strong>Type of Land Certificate:</strong> ${feature.properties.Jenis_Sura || 'N/A'}<br>
                    <strong>Certificate Number:</strong> ${feature.properties.Nomor_Sura || 'N/A'}<br>
                    <strong>Parcel Size from Land Certificate:</strong> ${feature.properties.Luas_di_Su || 'N/A'}<br>
                    <strong>Parcel Size from Mapping :</strong> ${feature.properties.Luas_Pemet || 'N/A'}<br>
                    <strong>STDB:</strong> ${feature.properties.STDB || 'N/A'}<br>
                    <strong>Parcel Code:</strong> ${feature.properties.Parcel_Cod || 'N/A'}<br>
                    <strong>Status:</strong> ${feature.properties.Status || 'N/A'}
                </div>
            `;

            // Bind the structured popup content to the layer
            layer.bindPopup(popupContent);
                }
            }
        }).addTo(map);

        // Zoom to this layer after loading
        zoomToLayer(layer1);

        // Add layer to overlayMaps and update layer control
        overlayMaps["Verified Farmer"] = layer1;
        layerControl.addOverlay(layer1, "Verified Farmer");
        })
        .catch(error => console.error('Error loading GeoJSON for Verified Farmer:', error));

        // Fetch for Unverified Farmer
        const unverifiedfarmer = 'https://raw.githubusercontent.com/rofi25max/wriwebgis/refs/heads/main/KUD_TP_Unverified.geojson'
        fetch(unverifiedfarmer) 
            .then(response => response.json())
            .then(data => {
                layer2 = L.geoJSON(data, { 
                    style: { color: 'rgb(80,230,50)' },
                    onEachFeature: function(feature, layer) {
                        if (feature.properties) {
            // Create a list-style popup content
            const popupContent = `
                <div style="font-size:12px; line-height:1.5;">
                    <strong>Name:</strong> ${feature.properties.Nama_Petan || 'N/A'}<br>
                    <strong>NIK:</strong> ${feature.properties.NIK || 'N/A'}<br>
                    <strong>Gender:</strong> ${feature.properties.Gender || 'N/A'}<br>
                    <strong>ID Farmer:</strong> ${feature.properties.ID_Petani || 'N/A'}<br>
                    <strong>ID Parcel:</strong> ${feature.properties.ID_Lahan || 'N/A'}<br>
                    <strong>Type of Land Certificate:</strong> ${feature.properties.Jenis_Sura || 'N/A'}<br>
                    <strong>Certificate Number:</strong> ${feature.properties.Nomor_Sura || 'N/A'}<br>
                    <strong>Parcel Size from Land Certificate:</strong> ${feature.properties.Luas_di_Su || 'N/A'}<br>
                    <strong>Parcel Size from Mapping :</strong> ${feature.properties.Luas_Pemet || 'N/A'}<br>
                    <strong>STDB:</strong> ${feature.properties.STDB || 'N/A'}<br>
                    <strong>Parcel Code:</strong> ${feature.properties.Parcel_Cod || 'N/A'}<br>
                    <strong>Status:</strong> ${feature.properties.Status || 'N/A'}
                </div>
            `;

            // Bind the structured popup content to the layer
            layer.bindPopup(popupContent);
                }
            }
        }).addTo(map);

        // Zoom to this layer after loading if layer1 is not yet loaded
        if (!layer1) zoomToLayer(layer2);

        // Add layer to overlayMaps and update layer control
            overlayMaps["Unverified Farmer"] = layer2;
            layerControl.addOverlay(layer2, "Unverified Farmer");
        })
        .catch(error => console.error('Error loading GeoJSON for Bidang Tanah Belum Terdaftar:', error));

        // Initialize base maps and layer control
        var layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: true }).addTo(map);

        // Add event listener for the search button
        document.getElementById("search-button").addEventListener("click", function() {
        var searchText = document.getElementById("search-input").value;
            if (searchText) {
            searchById(searchText);
            }
        });

        // Add event listener for the "Get Location" button
        document.getElementById("get-location-button").addEventListener("click", function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;

        // Zoom to the user's current location
        map.setView([lat, lon], 13); // 13 is the zoom level
        L.marker([lat, lon]).addTo(map)
            .bindPopup("You're Here")
            .openPopup();
            }, function(error) {
             alert("Unable to retrieve your location: " + error.message);
          });
        } else {
            alert("Geolocation is not supported by this browser.");
            }
        });
