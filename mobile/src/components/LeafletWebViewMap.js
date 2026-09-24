import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export const LeafletWebViewMap = ({
  challenges = [],
  singlePoint = null, // { lat, lng, title, location, isGps }
  center = null,
  zoom = null,
  height = 250,
}) => {
  // Determine map center and zoom level
  let mapCenter = center;
  let mapZoom = zoom;

  if (singlePoint && singlePoint.lat && singlePoint.lng) {
    mapCenter = { lat: Number(singlePoint.lat), lng: Number(singlePoint.lng) };
    mapZoom = mapZoom || (singlePoint.isGps ? 15 : 12);
  } else if (!mapCenter) {
    if (challenges.length > 0 && challenges[0].coordinates?.lat) {
      mapCenter = {
        lat: Number(challenges[0].coordinates.lat),
        lng: Number(challenges[0].coordinates.lng),
      };
      mapZoom = mapZoom || 10;
    } else {
      mapCenter = { lat: 23.6102, lng: 85.2799 }; // Central Jharkhand
      mapZoom = mapZoom || 8;
    }
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fallbackContainer, { height }]}>
        <Text style={styles.fallbackTitle}>Interactive Civic Map</Text>
        <Text style={styles.fallbackSubtitle}>
          {singlePoint ? `${singlePoint.title || 'Location Pin'}` : `${challenges.length} Civic Issues Pinned`}
        </Text>
        <Text style={styles.fallbackCoords}>
          Lat: {mapCenter.lat.toFixed(4)}, Lng: {mapCenter.lng.toFixed(4)}
        </Text>
      </View>
    );
  }

  // Generate markers HTML
  let markersHtml = '';

  if (singlePoint && singlePoint.lat && singlePoint.lng) {
    const lat = Number(singlePoint.lat);
    const lng = Number(singlePoint.lng);
    const safeTitle = (singlePoint.title || 'Selected Site').replace(/'/g, "\\'");
    const safeSub = (singlePoint.location || (singlePoint.isGps ? 'Accurate GPS Pinpoint' : 'District Center')).replace(/'/g, "\\'");
    const badgeColor = singlePoint.isGps ? '#15803d' : '#0f2c59';
    const tagText = singlePoint.isGps ? 'VERIFIED GPS PIN' : 'DISTRICT LOCATION';

    markersHtml = `
      var customPin = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:${badgeColor}; width:16px; height:16px; border-radius:8px; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.4);'></div>",
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      var marker = L.marker([${lat}, ${lng}], { icon: customPin }).addTo(map);
      marker.bindPopup("<div style='font-family:system-ui; padding:4px;'><span style='background:${badgeColor}; color:white; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px;'>${tagText}</span><br><b style='font-size:13px; color:#0f2c59; display:block; margin-top:4px;'>${safeTitle}</b><span style='font-size:11px; color:#475569;'>${safeSub}</span></div>").openPopup();
      
      ${singlePoint.isGps ? `L.circle([${lat}, ${lng}], { color: '${badgeColor}', fillColor: '${badgeColor}', fillOpacity: 0.12, radius: 250 }).addTo(map);` : ''}
    `;
  } else {
    markersHtml = challenges
      .filter((c) => c.coordinates && c.coordinates.lat && c.coordinates.lng)
      .map((c) => {
        const lat = Number(c.coordinates.lat);
        const lng = Number(c.coordinates.lng);
        const safeTitle = (c.title || 'Civic Issue').replace(/'/g, "\\'");
        const safeLoc = (c.location || c.district || 'Jharkhand').replace(/'/g, "\\'");
        const category = (c.category || 'Civic').replace(/'/g, "\\'");
        const urgencyColor = c.urgency === 'CRITICAL' ? '#be123c' : c.urgency === 'HIGH' ? '#b45309' : '#0f2c59';

        return `
          (function() {
            var icon = L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:${urgencyColor}; width:14px; height:14px; border-radius:7px; border:2.5px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.35);'></div>",
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });
            var m = L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
            m.bindPopup("<div style='font-family:system-ui; padding:4px;'><span style='font-size:9px; font-weight:800; color:#0f2c59; text-transform:uppercase;'>${category}</span><br><b style='font-size:12px; color:#0f172a; display:block; margin-top:2px;'>${safeTitle}</b><span style='font-size:10px; color:#64748b;'>📍 ${safeLoc}</span></div>");
          })();
        `;
      })
      .join('\n');
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e2e8f0; }
          .leaflet-control-attribution { font-size: 8px !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: true,
            attributionControl: false
          }).setView([${mapCenter.lat}, ${mapCenter.lng}], ${mapZoom});

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 6
          }).addTo(map);

          ${markersHtml}
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  webview: {
    flex: 1,
  },
  fallbackContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f2c59',
  },
  fallbackSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  fallbackCoords: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
