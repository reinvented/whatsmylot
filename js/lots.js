/*jslint jQuery:true*/
/*global $:false, L:false, lots: false, leafletPip: false, metadata: false */

/**
* Define global variables.
*/
var map = L.map('map', { 'zoomControl': false } ).setView( [46.50105, -63.2014], 9);
var old_latitude = false;
var old_longitude = false;
var lotsWeVisited = {};
var marker = false;
var lot_polygons = [];

/**
* Initialize the opening page.
*/
$('#page-lot').on('pageinit',function() {

//     localStorage.lotsWeVisited = undefined;

    if (localStorage.lotsWeVisited !== undefined && localStorage.lotsWeVisited !== 'false') {
        console.log("Found previously-visited lots!");
        console.log(localStorage.lotsWeVisited);
        lotsWeVisited = JSON.parse(localStorage.lotsWeVisited);
    }
    
    console.log(lotsWeVisited);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data (c) OpenStreetMap contributors'
    }).addTo(map);

    var myStyle = {
      "color": "#000",
      "weight": 4,
      "opacity": 0.85
    };

    var layer = L.geoJson(lots, {
        style: myStyle,
        onEachFeature: function (feature, polygon) {
            if ((feature.properties.LOT == "CHARLOTTETOWN") || (feature.properties.LOT == "PRINCETOWN") || (feature.properties.LOT == "GEORGETOWN")) {
                polygon.bindLabel(feature.properties.LOT, {noHide:false});
            }
            else {
                polygon.bindLabel("LOT " + feature.properties.LOT, {noHide:false});
            }
            lot_polygons[feature.properties.LOT] = polygon;
            if (lotsWeVisited[feature.properties.LOT]) {
                console.log("We were here before!");
                polygon.setStyle({ 'fillColor': '#f00' });
            }
        }
    }).addTo(map);
    
    L.control.zoom( { 'position': 'topright' }).addTo(map);

    map.locate({setView: false, watch: true, enableHighAccuracy: true}) /* This will return map so you can do chaining */
        .on('locationfound', function(e){
            
            if ((e.longitude != old_longitude) || (e.latitude != old_latitude)) {
                if (marker != false) {
                    marker.setLatLng(e.latlng).update();
                }
                else {
                    marker = L.marker(e.latlng).addTo(map);
                }
                map.setView(e.latlng, 12);

                old_longitude = e.longitude;
                old_latitude = e.latitude;

                var mylot = findMyLot(e.longitude, e.latitude, layer);

                if (!lotsWeVisited.hasOwnProperty(mylot)) {
                    console.log("On a new lot!");
                    lotsWeVisited[mylot.toString()] = Date().toString();
                    console.log(mylot);
                    console.log(lotsWeVisited);
                    console.log(JSON.stringify(lotsWeVisited));

                    localStorage.lotsWeVisited = JSON.stringify(lotsWeVisited);
                    console.log(localStorage.lotsWeVisited);
                }

                if (mylot) {
                    if ((mylot == "CHARLOTTETOWN") || (mylot == "PRINCETOWN") || (mylot == "GEORGETOWN")) {
                        $('#lotlabel').html("YOU ARE IN");
                        $('#number').css('font-size', '24pt');
                        $('#number').css('letter-spacing', '-2px');
                        $('#number').css('line-height', '40pt');
                        $('#navbar').show();
                    }
                    else {
                        $('#lotlabel').html("YOU ARE IN LOT");
                        $('#number').css('font-size', '172pt');
                        $('#number').css('letter-spacing', '-14px');
                        $('#number').css('line-height', '150pt');
                        $('#navbar').show();
                   }
                   $('#lotlabel').show();
                   $('#number').html(mylot);
                   $('#infobutton').show();
                   $('#location_notes').html(showAccuracy(e.accuracy));
                   updateLotInfo(mylot);
                }
                else {
                    $('#lotlabel').show();
                    $('#number').css('font-size', '32pt');
                    $('#number').css('letter-spacing', 'normal');
                    $('#lotlabel').html("YOU ARE");
                    $('#number').html("NOT ON PEI");
                    $('#location_notes').html("If you <i>are</i> on Prince Edward Island, then your device has, alas, misidentified your location.</p>If you actually <i>are not</i> on PEI, why not?</p><p><a href='#page-help'>Learn more here</a>.");
                    $('#infobutton').hide();
                    $('#navbar').hide();
                }
            }
            else {
                console.log("Location hasn't changed.");
            }
        })
       .on('locationerror', function(){
            $('#number').css('font-size', '32pt');
            $('#number').css('letter-spacing', 'normal');
            $('#number').html("<div id='waitmessage'>FINDING YOUR LOT</div><img src='style/spinner.gif'>");
            $('#navbar').hide();
        });

});

/**
* Ensure that the map is rendered to fill all available space.
*/
$(window).on('orientationchange pageshow resize', function () {
    $("#map").height($(window).height());
    map.invalidateSize();
});

/**
* Given the current latitude and longitude, find out what lot we're in.
*/
function findMyLot(lng, lat, layer) {
    var results = leafletPip.pointInLayer([ lng, lat], layer);
    if (typeof results !== 'undefined') {
        if (typeof results[0] !== 'undefined') {
            var LOT = results[0].feature.properties.LOT;
            return LOT;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

/**
* Update the info page with information about the current lot.
*/
function updateLotInfo(mylot) {

    if ((mylot == "CHARLOTTETOWN") || (mylot == "PRINCETOWN") || (mylot == "GEORGETOWN")) {
        $('#info_lotname').html(mylot);
    }
    else {
        $('#info_lotname').html("LOT &#8470; " + mylot);
    }

    var meta = metadata[mylot];

    $('#info_county').html(meta.county + " County");  
    if (meta.parish) {  
        $('#info_parish').html(meta.parish + " Parish");    
    }

    if (meta.rating_1767) {  
        $('#info_condition').html("Holland's Rating: " + meta.rating_1767);    
    }

    if (meta.drawn_by) {  
        $('#info_drawnby').html("Original landlord " + meta.drawn_by);    
    }    

    $('#info_bio').html('<p>' + meta.notes + '</p>');    

    $('#info_acres_holland').html(numberWithCommas(meta.acres_holland) + ' acres');
    $('#info_acres_clark').html(numberWithCommas(meta.acres_clark) + ' acres');
    $('#info_acres_modern').html(numberWithCommas(meta.acres_modern) + ' acres');
    
    $('#content_info').show();
}

/**
* Format numbers with commas (i.e. 1000 becomes 1,000).
*/
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
* Show metres or kilometers depending on the distance.
*/
function showAccuracy(x) {
  if (x > 1000) {
    return '(Accurate to ' + Math.round(x / 1000) + ' km)';
  }
  else {
    return '(Accurate to ' + x + ' m)';
  }
}