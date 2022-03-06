Welcome to OpenIndoor 3D web app project.

Application is here:
https://app.openindoor.io

Quick video here: https://youtu.be/9JViDVSVnwo
# tl;dr

OpenInddor app aims to render OSM data inside a building in a 3D way.

It massively relies on https://wiki.openstreetmap.org/wiki/Simple_Indoor_Tagging

3 rendering modes:

* building
* floors
* indoor (data from a floor between level L to L+1)

# Cartographers / developers

You can drag and drop your geojson file into the web map (from JOSM or any similar tool).

It allows you to check 3D rendering before releasing your work in OSM, or not if you want to keep your data private.

Have a look at [here](EXAMPLES.md) to get examples.

# Rendering examples

https://app.openindoor.io/#18.01/-1.7003609/48.1196703/39.37/-74.49

![Alt text](examples/img/S_floors.png?raw=true "Building S - Floors view")
![Alt text](examples/img/S_indoor.png?raw=true "Building S - Level 0 - Indoor view")

See also bookmarks

# Use as a library

Example index.html

```js
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Display a map</title>
    <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
    <script src="https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.js"></script>
    <link href="https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.css" rel="stylesheet" />

    <script src="https://app.openindoor.io/openindoor.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        
        #map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
        }
    </style>
</head>

<body>
    <script>
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister()
            }
        })
        let map = new openindoor({
            container: 'map',
            center: [1.3698, 43.6435],
            zoom: 17,
            layer: "https://kurv.openindoor.io/indoor-kurv.json",
            source: 'https://kurv.openindoor.io/kurv.geojson',
            state: 'indoor_state',
            bbox: [
                [1.3689, 43.6429],
                [1.3706, 43.6440]
            ],
            modal: false,
            popup: true,
            icon_tags: {
                icon_url: "icon-image",
                icon_name: "icon-name",
                filter: {
                    layer_id: "indoor-stand_name-symbol",
                    rules: ["!", [
                        "has",
                        "icon-name"
                    ]]
                }
            }
        });
    </script>
</body>

</html>
```

# Bookmarks

* https://wiki.openstreetmap.org/wiki/Simple_Indoor_Tagging
* https://wiki.openstreetmap.org/wiki/Indoor_Mapping