# AutoCAD

Let's start with another example, starting with 2 AutoCAD plans, level 0 and level 1.

## AutoCAD to geojson

If you start from DWG, you can manually convert to DFX format with official ODAFileConverter

Note: it's possible to automate use of this tool from command line interface.


Transform dxf to "raw" geojson file, filtering with the AutoCAD layers you want to keep

```
ogr2ogr \
    -progress \
    -dialect sqlite -sql "SELECT * FROM entities WHERE layer in ('ABY_Contour_Facade')" \
    -f 'GeoJSON' \
    ./examples/autocad/plan_raw.geojson \
    ./examples/autocad/plan.dxf \
    -t_srs EPSG:4326 \
    -s_srs EPSG:27561
```

"EPSG:27561" is lambert 93 code, specific to the area of your real world building
See https://epsg.io/ to find your convenient code

"EPSG:4326" is WGS 84 - WGS84 - World Geodetic System 1984, used in GPS
See https://epsg.io/?q=4326

Content: of ./examples/autocad/plan_raw.geojson

```
{
    "type": "FeatureCollection",
    "name": "SELECT",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [{
            "type": "Feature",
            "properties": {
                "Layer": "ABY_Contour_Facade",
                "PaperSpace": null,
                "SubClasses": "AcDbEntity:AcDbPolyline",
                "Linetype": "ByLayer",
                "EntityHandle": "1A2",
                "Text": null
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-5.48962605978112, 47.468620321051866],
                    [-5.473933789671382, 47.469728462149519],
(...)
}
```

## geojson in GPS coordinates

Once you succesfully get your raw geojson file, you need to place it at the good GPS location.

In this case, you need 3 points from your original AutoCAD plan which you know what are GPS coordinates.

```
ogr2ogr \
    -progress \
    -f 'GeoJSON'
    ./plan.geojson \
    ./plan_raw.geojson \
    -gcp $Autocad_X_1 $Autocad_Y_1 $GPS_lon_1 $GPS_lat_1 \
    -gcp $Autocad_X_2 $Autocad_Y_2 $GPS_lon_2 $GPS_lat_2 \
    -gcp $Autocad_X_3 $Autocad_Y_3 $GPS_lon_3 $GPS_lat_3
```

This command could help to get the bounding box and to rely on it to make match points:

```
$ ogrinfo -al examples/autocad/plan_raw.geojson

INFO: Open of `examples/autocad/plan_raw.geojson'
      using driver `GeoJSON' successful.

Layer name: SELECT
Geometry: Unknown (any)
Feature Count: 3
Extent: (-5.489629, 47.457980) - (-5.323615, 47.551072)
(...)
```

So, manually added as an additional feature:

```
        {
            "type": "Feature",
            "properties": {
                "Layer": "My_Bounding_Box"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-5.489629, 47.457980],
                    [-5.489629, 47.551072],
                    [-5.323615, 47.551072],
                    [-5.323615, 47.457980],
                    [-5.489629, 47.457980]
                ]
            }
        }
```

Here is the result:

![Alt text](examples/autocad/bounded_plan.png?raw=true "Bounded plan")

## Transform to OSM compliant indoor tags

Each original AutoCAD layer should define a specific type of geometry:

- technical room
- office room
- tootway
- desk
- ...

Add `inddor="room"` tag to all features coming from 'technical_room' AutoCAD layer:

```
cat ./plan.geojson | jq '.features | map(select(.properties.LAYER == "technical_room"))' | \
  jq '.features[].properties.indoor = "room"'
```

And so on...

## Rendering

At the end, check the rendering by drag and dropping your final geojson file in app.openindoor.io app.