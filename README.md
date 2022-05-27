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

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Kurv</title>
    <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="white" />
    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <link rel="apple-touch-icon" href="images/hello-icon-152.png">
    <meta name="theme-color" content="white" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="kingconf">
    <meta name="msapplication-TileImage" content="images/hello-icon-144.png">
    <meta name="msapplication-TileColor" content="#FFFFFF">
    <script src="https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.js"></script>
    <link href="https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.css" rel="stylesheet" />

    <script src="https://app.openindoor.io/openindoor.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            height: 100%;
            width: 100%;
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

## Explanations

Here are openindoor() parameters:
* center: GPS position for starting in the map
* zoom: zoom when starting the app
* layer: specific definition of indoor rendering. See https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/
* source: geojson input data
* state: view mode. "indoor_state" means no building or floor view
* bbox: area limitation. GPS center must be inside
* modal: display modal window when clicking in a POI (Point Of Interest)
* popup: display popup chen clicking in a POI
* icon_tags:
  * icon_url: field used to define the icon of a POI
  * icon_name: field use as unique icon name
* filter:
  * layer_id: maplibre layer id to target to let text display only if no icon define
  * rules: filter to apply to let text displayed

# Use as a Progressive Web App

Add this two files (and adapt them to your context):
## manifest.json

```js
{
    "name": "Kurv",
    "short_name": "Kurv",
    "icons": [{
        "src": "images/openindoor-icon-128.png",
        "sizes": "128x128",
        "type": "image/png"
    }, {
        "src": "images/openindoor-icon-144.png",
        "sizes": "144x144",
        "type": "image/png"
    }, {
        "src": "images/openindoor-icon-152.png",
        "sizes": "152x152",
        "type": "image/png"
    }, {
        "src": "images/openindoor-icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
    }, {
        "src": "images/openindoor-icon-256.png",
        "sizes": "256x256",
        "type": "image/png"
    }, {
        "src": "images/openindoor-icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
    }],
    "lang": "en-US",
    "start_url": "/index.html",
    "display": "standalone",
    "background_color": "white",
    "theme_color": "white"
}
```

## sw.js

```js
var cacheName = 'Kingconf';
var filesToCache = [
    '/',
    '/index.html',
    'https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.js',
    'https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.css',
    'https://app.openindoor.io/openindoor.js',
    'https://kurv.openindoor.io/indoor-kurv.json',
    'https://kurv.openindoor.io/kurv.geojson'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});
```
## index.html

### header

```html
    <meta charset="utf-8" />
    <title>Kurv</title>
    <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="white" />
    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <link rel="apple-touch-icon" href="images/hello-icon-152.png">
    <meta name="theme-color" content="white" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="kingconf">
    <meta name="msapplication-TileImage" content="images/hello-icon-144.png">
    <meta name="msapplication-TileColor" content="#FFFFFF">
    <script src="https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.js"></script>
    <link href="https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.css" rel="stylesheet" />

    <script src="https://app.openindoor.io/openindoor.js"></script>
```
### body script
```js
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister()
            }
        })
```
# Bookmarks

* https://wiki.openstreetmap.org/wiki/Simple_Indoor_Tagging
* https://wiki.openstreetmap.org/wiki/Indoor_Mapping