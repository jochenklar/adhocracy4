var init = function () {
  var $ = window.jQuery
  var L = window.L

  var escapeHtml = function (unsafe) {
    // jQuery.text() escapes special chars as is documented at http://api.jquery.com/text/#text-function
    // Alternatively a custom unsafe.replace(/&/g, '&amp;')... solution as described
    // at https://stackoverflow.com/a/6234804 may be used. for example underscore.js uses a regexp based unescape.
    // FIXME: this method should be moved to a global scope or made importable if used more then once
    return $('<div>').text(unsafe).html()
  }

  $('[data-map="display_points"]').each(function (i, e) {
    var polygon = JSON.parse(e.getAttribute('data-polygon'))
    var points = JSON.parse(e.getAttribute('data-points'))
    var baseurl = e.getAttribute('data-baseurl')
    var attribution = e.getAttribute('data-attribution')
    var initial = 0

    var basemap = baseurl + '{z}/{x}/{y}.png'
    var baselayer = L.tileLayer(basemap, { attribution: attribution })
    var map = new L.Map(e, { scrollWheelZoom: false, zoomControl: false })
    baselayer.addTo(map)

    map.on('zoomend', function () {
      var currentZoom = map.getZoom()
      var minZoom = map.getMinZoom()

      if (currentZoom > minZoom) {
        if (initial === 1) {
          $('#zoom-out').removeClass('leaflet-disabled')
        }
      }
      if (currentZoom === minZoom) {
        $('#zoom-out').addClass('leaflet-disabled')
      }
    })

    var polygonStyle = {
      'color': '#0076ae',
      'weight': 2,
      'opacity': 1,
      'fillOpacity': 0.2
    }

    var basePolygon = L.geoJson(polygon, {style: polygonStyle}).addTo(map)
    basePolygon.on('dblclick', function (event) {
      map.zoomIn()
    })
    basePolygon.on('click', function (event) {
      map.closePopup()
    })

    map.fitBounds(basePolygon.getBounds())
    map.options.minZoom = map.getZoom()
    initial = 1

    var customOptions =
      {
        'className': 'maps-popups',
        closeButton: false
      }

    function getImage (feature) {
      if (feature.properties.image) {
        return '<div class="maps-popups-popup-image" style="background-image:url(' + feature.properties.image + ');"></div>'
      }
      return '<div class="maps-popups-popup-image"></div>'
    }

    var defaultIcon = L.icon({
      iconUrl: '/static/images/map_pin_default.svg',
      shadowUrl: '/static/images/map_shadow_01.svg',
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      shadowSize: [40, 54],
      shadowAnchor: [20, 54],
      popupAnchor: [0, 5]
    })

    L.geoJson(points, {
      pointToLayer: function (feature, latlng) {
        var icon = defaultIcon
        if (feature.properties.category_icon) {
          icon = L.icon({
            iconUrl: feature.properties.category_icon,
            shadowUrl: '/static/images/map_shadow_01.svg',
            iconSize: [30, 45],
            iconAnchor: [15, 45],
            popupAnchor: [0, 5]
          })
        }

        var marker = L.marker(latlng, {icon: icon}).addTo(map)
        var popupContent = getImage(feature) +
                          '<div class="maps-popups-popup-meta">' +
                              '<span class="map-popup-upvotes">' +
                              feature.properties.positive_rating_count + ' <i class="fa fa-chevron-up" aria-hidden="true"></i>' +
                              '</span>' +
                              '<span class="map-popup-downvotes">' +
                              feature.properties.negative_rating_count + ' <i class="fa fa-chevron-down" aria-hidden="true"></i>' +
                              '</span>' +
                              '<span class="map-popup-comments-count">' +
                              feature.properties.comments_count + ' <i class="fa fa-comment-o" aria-hidden="true"></i>' +
                              '</span>' +
                              '</div>' +
                          '<div class="maps-popups-popup-name">' +
                              '<a href="' + feature.properties.url + '">' + escapeHtml(feature.properties.name) + '</a>' +
                          '</div>'
        marker.bindPopup(popupContent, customOptions)
        return marker
      }
    })

    $('#zoom-in').click(function () {
      map.setZoom(map.getZoom() + 1)
      return false
    })

    $('#zoom-out').click(function () {
      map.setZoom(map.getZoom() - 1)
      return false
    })
  })
}

window.jQuery(init)
window.jQuery(document).on('a4.embed.ready', init)
