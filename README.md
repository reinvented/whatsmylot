# What's my lot?

If you're on Prince Edward Island, this app uses the location of your device to calculate what **lot** (or "township") you're in. There are 67 lots and three ""royalties" (Charlottetown, Georgetown and Princetown) originally laid out by
Samuel Holland in 1765. While they are largely no longer in contemporary use, they are irrevocably imprinted on the Island landscape, through the shapes of roads and property lines.

The app will look up your location, and either (a) display the number of the lot you're currently inside, (b) tell you it can't find your location or (c) tell you that you're not on Prince Edward Island (which might be true if, for example, you're on a beach or a bridge, all appearances to the contrary).

## You can leave it running...

As long as you have the app open, it will continue to update
the lot number, so if you go for a drive in the countryside, you can
watch it update as you cross lot lines.

## Lot Information

On the information page about each lot you'll find the following information:

*   The **name or number** of the lot or royalty.
*   The **county** – Prince, Queens or Kings – that the lot is located in.
*   The **parish** that the lot is located in. Each county is subdivided into 4 or 5 parishes.
*   Holland's **rating** of the lot – Poor, Average or Excellent.
*   The name of the original **landlord** granted the lot by lottery.
*   A brief **description** of the landlord and their circumstances.
*   The **size** of the lot, three ways: as estimated by Samuel Holland, as calculated from the 1911 census by Andrew Hill Clark in _Three Centuries and the Island_, and the modern measure from the contemporary map.

## Source Material

The source for the digital map layer used to calculate your lot is a modified version of 
[L.R.I.S., 20050725, Prince Edward Island Townships:
Prince Edward Island Finance and Municipal Affairs, Taxation and
Property Records, Geomatic Services, Charlottetown, Prince Edward
Island, Canada.](http://www.gov.pe.ca/gis/index.php3?number=1011342&lang=E) This map has issues that I have attempted to
correct:

*   Princetown Royalty was missing. I split the Lot 18 polygon along Rte. 103 from Malpeque Bay, and then along the                            Champion Road, across the Baltic River, and along the Roache Road and the Shore Road to the Darnley Basin,                            using the 1880 [Meacham's Atlas
Princetown Royalty map](http://137.149.200.109:8080/fedora/get/imagined:208400/ilives:jp2Sdef/getRegion?uid=&level=3) as a guide.
*   Lot 50 was mislabelled as Lot 66 and Lot 66 was unlabelled.
*   Georgetown Royalty was mislabelled as Lot 73.

The original ESRI Shapefile was reprojected to WGS84, edited
for correctness as above, lots with multiple polygons were
consolidated into a single polygon, and the polygons were simplified,
using QGIS, to reduce the complexity, and thus the file size, of the
resulting map. The map was then exported from QGIS into a GeoJSON
file.

The updated map is available [in several
formats](https://github.com/reinvented/hollandmap) for use in other projects under a Creative Commons license.

The base map appearing under the township lines is [OpenStreetMap](http://www.openstreetmap.org).

Information about each lot and royalty, along with the brief biographical note of the original owner
was assembled by Boyde Beck, Curator of History, Exhibits and Editor of The Island Magazine for 
[PEI Museum & Heritage Foundation](http://www.peimuseum.com/).

## Open Source

The calculation of which lot your current location falls in is
done by [point 
in polygon for Leaflet](https://github.com/mapbox/leaflet-pip), a plugin for the
excellent [open-source
JavaScript library for interactive maps](http://leafletjs.com/).

The app uses the [jQuery](http://jquery.org/) and [jQuery Mobile](http://jquerymobile.com/).

The icons are from Google's open sourced [Material Design Icons](https://github.com/google/material-design-icons/releases/tag/1.0.0).

## Who made this?

This is a my project, and I'm Peter Rukavina, 
[Hacker in
Residence, University of Prince Edward Island, Robertson
Library](http://hacker.vre.upei.ca/).