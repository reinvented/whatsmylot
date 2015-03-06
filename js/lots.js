/*jslint jQuery:true*/
/*global $:false, L:false, lots: false, leafletPip: false, metadata: false */

/**
* Define global variables.
*/
var map = L.map('map', { 'zoomControl': false } ).setView( [46.50105, -63.2014], 9);
var old_latitude = false;
var old_longitude = false;
var lotsWeVisited = false;
var lot_polygons = [];

/**
* Initialize the opening page.
*/
$('#page-lot').on('pageinit',function() {

    if (localStorage.lotsWeVisited !== undefined) {
        lotsWeVisited = JSON.parse(localStorage.lotsWeVisited);
    }
    
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
                polygon.setStyle({ 'fillColor': '#f00' });
            }
        }
    }).addTo(map);
    
    L.control.zoom( { 'position': 'topright' }).addTo(map);

    map.locate({setView: false, watch: true, enableHighAccuracy: true}) /* This will return map so you can do chaining */
        .on('locationfound', function(e){
            
            if ((e.longitude != old_longitude) || (e.latitude != old_latitude)) {
                if (typeof marker != 'undefined') {
                    marker.setLatLng(e.latlng).update();
                }
                else {
                    var marker = L.marker(e.latlng).addTo(map);
                }
                map.setView(e.latlng, 12);

                old_longitude = e.longitude;
                old_latitude = e.latitude;
                var mylot = findMyLot(e.longitude, e.latitude, layer);
                if (!lotsWeVisited.hasOwnProperty(mylot)) {
                    lotsWeVisited[mylot] = Date().toString();
                    localStorage.lotsWeVisited = JSON.stringify(lotsWeVisited);
                }

                if (mylot) {
                    if ((mylot == "CHARLOTTETOWN") || (mylot == "PRINCETOWN") || (mylot == "GEORGETOWN")) {
                        $('#lotlabel').html("YOU ARE IN");
                        $('#number').css('font-size', '24pt');
                        $('#number').css('letter-spacing', '-5');
                        $('#navbar').show();
                    }
                    else {
                        $('#lotlabel').html("YOU ARE IN LOT");
                        $('#number').css('font-size', '172pt');
                        $('#number').css('letter-spacing', '-15px');
                        $('#navbar').show();
                   }
                   $('#lotlabel').show();
                   $('#number').html(mylot);
                   $('#infobutton').show();
                   updateLotInfo(mylot);
                }
                else {
                    $('#lotlabel').show();
                    $('#number').css('font-size', '32pt');
                    $('#number').css('letter-spacing', 'normal');
                    $('#lotlabel').html("YOU ARE");
                    $('#number').html("NOT ON PEI");
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

    mylot = 31;

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
    
}

/**
* Format numbers with commas (i.e. 1000 becomes 1,000).
*/
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}