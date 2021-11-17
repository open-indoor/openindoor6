# AutoCAD

Let's start with another example, starting with 2 AutoCAD plans, level 0 and level 1.

## AutoCAD to geojson

If you start from DWG, you can manually convert to DFX format with official ODAFileConverter

Note: it's possible to automate use of this tool from command line interface.

Transform dxf to "raw" geojson file, filtering with the AutoCAD layers you want to keep

![Alt text](examples/autocad/plan_librecad.png?raw=true "3 points")

```
ogr2ogr \
    -progress \
    -dialect sqlite -sql "SELECT * FROM entities WHERE layer in ('ABY_Contour_Facade','ABY_Zone_ZIND','Texte_Pièces')" \
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

JOSM is a good tool to get your coordinates of these points

So let's use these 3 points:

![Alt text](examples/autocad/points_ref.png?raw=true "3 points")

Note: with JOSM, use CTRL+J (or COMMAND+J) to get exact GPS coordinates of a point

| Autocad_X_1 | Autocad_Y_1 | GPS_lon_1  | GPS_lat_2   |
|-------------|-------------|------------|-------------|
| -5.4896289  | 47.46861965 | 3.11171115 | 45.75836725 |
| -5.35169495 | 47.4779303  | 3.11118275 | 45.75924865 |
| -5.32791985 | 47.5510717  | 3.11011255 | 45.7591626  |

```
ogr2ogr \
    -progress \
    -f 'GeoJSON' \
    ./examples/autocad/plan.geojson \
    ./examples/autocad/plan_raw.geojson \
    -gcp -5.4896289 47.46861965 3.11171115 45.75836725 \
    -gcp -5.35169495 47.4779303 3.11118275 45.75924865 \
    -gcp -5.32791985 47.5510717 3.11011255 45.7591626
```

Here is the result after locating it well:

![Alt text](examples/autocad/plan_relocated.png?raw=true "3 points")



## Transform to OSM compliant indoor tags

Each original AutoCAD layer should define a specific type of geometry:

- technical room
- office room
- tootway
- desk
- ...

Add `inddor="room"` tag to all features coming from 'technical_room' AutoCAD layer:

```
echo '{"type": "FeatureCollection","features":'`\
  jq '.features |\
    (map(select(.properties.Layer == "ABY_Contour_Facade")) | .[].properties.building="yes") \
    + (map(select(.properties.Layer == "ABY_Zone_ZIND")) | .[].properties.indoor="room" | .[].properties.level="0")' \
    ./examples/autocad/plan.geojson \
`'}' \
 > ./examples/autocad/plan_osm.geojson
```

And so on...

## Rendering

At the end, check the rendering by drag and dropping your final geojson file in app.openindoor.io app.

![Alt text](examples/autocad/plan_indoor.png?raw=true "3 points")
