import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl/dist/maplibre-gl.js'
// import css from './app.scss';
// import capital from "./capital"
import addMapDOM from "./addMapDOM"
// export { capital, addDOMContent }
import 'https://unpkg.com/maplibre-gl@1.14.0/dist/maplibre-gl.js';
addMapDOM()




let mapStyle = {
    "version": 8,
    "name": "Blank",
    "center": [0, 0],
    "zoom": 0,
    "sources": {
        "raster-tiles": {
            "type": "raster",
            "tiles": [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            "tileSize": 256,
            "minzoom": 0,
            "maxzoom": 19
        },
        "openindoor": {
            'type': 'vector',
            "tiles": ["https://tegola.openindoor.io/maps/openindoor/{z}/{x}/{y}.vector.pbf?token=kjGxKVMZcXAao1mtOOALxWY3"],
            cluster: true,
            "tolerance": 0
        }
    },
    "sprite": "https://open-indoor.github.io/sprite/sprite",
    "glyphs": "https://open-indoor.github.io/fonts/{fontstack}/{range}.pbf",
    "layers": [{
        "id": "background",
        "type": "background",
        "paint": {
            "background-color": "rgba(255,255,255,1)"
        }
    }, {
        "id": "simple-tiles",
        "type": "raster",
        "source": "raster-tiles",
        "minzoom": 0,
        "maxzoom": 19,
        "raster-opacity": [
            "interpolate", ["linear"],
            ["zoom"],
            18,
            1,
            19,
            0
        ]
    }],
    "id": "blank"
}

// mapboxgl.accessToken = '';
let map = new maplibregl.Map({
    'container': 'map',
    'center': [2.36186, 48.87805],
    'pitch': 60, // pitch in degrees
    'bearing': -60, // bearing in degrees
    'zoom': 17,
    'style': mapStyle
});

let hoveredBuildingId = undefined;
let oldBuildingId = undefined;

map.on('mousemove', 'building-extrusion', function(e) {

    if (e.features.length >= 1 && 'id' in e.features[0] && e.features[0].id !== oldBuildingId) {
        if (oldBuildingId !== undefined) {
            map.setFeatureState({
                source: 'openindoor',
                sourceLayer: 'footprint',
                id: oldBuildingId
            }, {
                hover: false
            });
        }
        hoveredBuildingId = e.features[0].id;
        console.log('active:', hoveredBuildingId)
        map.setFeatureState({
            source: 'openindoor',
            sourceLayer: 'footprint',
            id: hoveredBuildingId
        }, {
            hover: true
        });
        oldBuildingId = hoveredBuildingId;
    }
});

map.on('click', 'fire', function(e) {
    console.log(e.features[0].properties);

    new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.name)
        .addTo(map);
});

map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.FullscreenControl());

map.on('sourcedata', function() {
    let sourceId = "openindoor"
    if (map.getSource(sourceId) && map.isSourceLoaded(sourceId)) {
        console.log('sourceId:', sourceId);
        const features = map.querySourceFeatures(sourceId, {
            sourceLayer: 'footprint',
        });
        console.log('openindoor features loaded:', features);
    }
});
map.on('load', function() {
    // map.addSource('markers', {
    //     'type': 'geojson',
    //     'data': currentFeature
    // })
    map.loadImage(
        'https://open-indoor.github.io/img/marker_red_48x48.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('marker_red', image);
            map.addLayer({
                "id": "markers",
                "interactive": true,
                "type": "symbol",
                "source": "openindoor",
                "source-layer": "pins",
                "filter": [
                    "all", [
                        "==", [
                            "geometry-type"
                        ],
                        "Point"
                    ],
                    [
                        "any", [
                            "has",
                            "building"
                        ],
                        [
                            "has",
                            "museum"
                        ]
                    ]
                ],
                "layout": {
                    "icon-image": "marker_red",
                    "icon-anchor": "bottom",
                    "icon-offset": [0, 10],
                    "icon-allow-overlap": true,
                    // "icon-ignore-placement": true
                    // get the title name from the source's "title" property
                    "text-field": ["get", "name<"],
                    "text-font": ["Open Sans Regular"],
                    "text-offset": [0, 1.25],
                    "text-anchor": "top"
                }
            });
        }
    );
});


map.on('load', function() {

    // map.addSource('openindoor', {
    //     'type': 'vector',
    //     "tiles": ["https://tegola.openindoor.io/maps/openindoor/{z}/{x}/{y}.vector.pbf?"],
    //     "tolerance": 0
    // });
    // map.addLayer({
    //     "id": "building",
    //     "source": "openindoor",
    //     "source-layer": "building",
    //     "type": "line",
    //     "paint": {
    //         "line-color": "#000000",
    //         "line-width": 1
    //     }
    // });

    // map.addLayer({
    //     // "id": "building-part-extrusion",
    //     "id": "buildings",
    //     "source": "openindoor",
    //     "source-layer": "buildings",
    //     "type": "fill-extrusion",
    //     "filter": [
    //         "all",
    //         [
    //             "==",
    //             [
    //                 "geometry-type"
    //             ],
    //             "Polygon"
    //         ],
    //         // [
    //         //     "any",
    //         //     [
    //         //         "has",
    //         //         "building"
    //         //     ]
    //         // ]
    //     ],
    //     "paint": {
    //         "fill-extrusion-color": "#fcffe4",
    //         "fill-extrusion-height": 40,
    //         "fill-extrusion-base": 0,
    //         "fill-extrusion-opacity": 0.5
    //     }
    // })
    fetch("./style/buildingLayers.json").then(function(response) {
        return response.json().then(function(json) {
            let layers = json
            for (let layer of layers) {
                map.addLayer(layer)
            }
        });
    });
    // fetch("./style/markerLayers.json").then(function(response) {
    //     return response.json().then(function(json) {
    //         let layers = json
    //         for (let layer of layers) {
    //             map.addLayer(layer)
    //         }
    //     });
    // });
    fetch("./style/shapeLayers.json").then(function(response) {
        return response.json()
            .then(function(json) {
                let layers = json
                for (let layer of layers) {
                    map.addLayer(layer)
                }
            })
            .catch(err => console.log('Erreur : ' + err));;
    });
    fetch("./style/indoorLayers.json").then(function(response) {
        return response.json().then(function(json) {
            let layers = json
            for (let layer of layers) {
                map.addLayer(layer)
            }
        });
    });
});