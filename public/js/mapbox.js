/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoib2x1ZmVtaWFmIiwiYSI6ImNrNzg5czkxajBnZjEzbG9nbzdrdjJlenYifQ.RYnnJ62Zp8I3quSunYt-5g';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/olufemiaf/ck789vm2r6qmv1it596ppyi7d',
  scrollZoom: false
  //   center: [-118.113491, 34.111745],
  //   zoom: 10,
  //   interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  //Add marker
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
