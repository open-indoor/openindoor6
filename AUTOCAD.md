# AutoCAD

Let's start with another example, starting with 2 AutoCAD plans, level 0 and level 1.

## AutoCAD to geojson

If you start from DWG, you can manually convert to DFX format with official ODAFileConverter

Note: it's possible to automate use of this tool from command line interface.


Transform dxf to "raw" geojson file, filtering with the AutoCAD layers you want to keep

```
ogr2ogr \
    -progress \
    -dialect sqlite -sql "SELECT * FROM entities WHERE layer in ('ABY_Contour_Facade','ABY_Zone_ZIND','ABY_Zone_ZCOM','Texte_Pièces','Texte_General','Ar_Escalier','Eq_Ascenseur','ABY_Parois','PM_Bordures')" \
    -f 'GeoJSON' \
    ./plan_raw.geojson \
    ./plan.dxf \
    -t_srs EPSG:4326 \
    -s_srs EPSG:27561
```

"EPSG:27561" is lambert 93 code, specific to the area of your real world building
See https://epsg.io/ to find your convenient code

"EPSG:4326" is WGS 84 - WGS84 - World Geodetic System 1984, used in GPS
See https://epsg.io/?q=4326

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