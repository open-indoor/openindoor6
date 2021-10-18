import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl/dist/maplibre-gl.js'
// import css from './app.scss';
// import capital from "./capital"
import addMapDOM from "./addMapDOM"
// export { capital, addDOMContent }
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
        "footprint": {
            "type": "vector",
            "tiles": [
                // "https://tegola-dev.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}.vector.pbf",
                "https://tegola.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}.vector.pbf?token=kjGxKVMZcXAao1mtOOALxWY3",
            ],
            "minzoom": 12,
            "maxzoom": 20
        },
        "pins": {
            "type": "vector",
            "tiles": [
                "https://tegola-dev.openindoor.io/maps/openindoor/pins/{z}/{x}/{y}.vector.pbf"
            ],
            "minzoom": 12,
            "maxzoom": 20
        },
    },
    // "sprite": "https://open-indoor.github.io/sprite/sprite",
    "glyphs": "https://open-indoor.github.io/fonts/{fontstack}/{range}.pbf",
    "layers": [{
        "id": "background",
        "type": "background",
        "paint": {
            "background-color": "#e0dfdf"
        }
    }, {
        "id": "simple-tiles",
        "type": "raster",
        "source": "raster-tiles"
    }],
    "id": "blank"
}

const map = new maplibregl.Map({
    'container': 'map',
    'center': [
        // 3.1109806591766667,
        // 45.75919917431
        -1.70188, 48.11915
    ],
    // "coordinates": [-74.0549304, 40.686461]
    // 'pitch': 60,
    'bearing': 0,
    'zoom': 17,
    'style': mapStyle,
    // 'maxBounds': [
    //     [-74.055044, 40.686315], // Southwest coordinates
    //     [-74.054747, 40.6866] // Northeast coordinates
    // ]
});

map.on('sourcedata', function() {
    let sourceId = "footprint"
    if (map.getSource(sourceId) && map.isSourceLoaded(sourceId)) {
        console.log('sourceId:', sourceId);
        const features = map.querySourceFeatures(sourceId, {
            sourceLayer: 'footprint',
        });

        console.log('footprint features loaded:', features);
    }
});


map.on('load', function() {
    // map.addSource(
    //     'footprint', {
    //         'type': 'vector',
    //         "tiles": [
    //             "https://tegola-dev.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}.vector.pbf"
    //         ],
    //         "tolerance": 0
    //     });
    // map.addSource(
    //     'pins', {
    //         'type': 'vector',
    //         "tiles": [
    //             "https://tegola-dev.openindoor.io/maps/openindoor/pins/{z}/{x}/{y}.vector.pbf"
    //         ],
    //         "tolerance": 0
    //     });

    map.addLayer({
        "id": "building-footprint",
        "source": "footprint",
        "source-layer": "footprint",
        // "type": "line",
        // "paint": {
        //     "line-color": "#00FF55",
        //     "line-width": 10
        // }
        "type": "fill-extrusion",
        "paint": {
            "fill-extrusion-height": [
                "case", [
                    "has",
                    "buildings:levels"
                ],
                [
                    "to-number", [
                        "*",
                        3, [
                            "get",
                            "buildings:levels"
                        ]
                    ]
                ],
                0
            ],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.5,
            "fill-extrusion-color": [
                "case", [
                    "==", [
                        "feature-state",
                        "hover"
                    ],
                    null
                ],
                "black", [
                    "boolean", [
                        "feature-state",
                        "hover"
                    ]
                ],
                "red",
                "black"
            ]
        }

    });

});

// 16.39/-73.9919954/40.7503787/59.50/44.82
let hash = window.location.hash.slice(1)
console.log('hash:', hash)
let hash_split = hash.split("/")
    // ["16.39","-73.9919954", "40.7503787", "59.50", "44.82"]
console.log('hash_split:', hash_split)
if (hash_split.length > 0) {
    let zoom = parseFloat(hash_split[0])
    if (!isNaN(zoom)) {
        map.setZoom(zoom)
    }
}
if (hash_split.length > 2) {
    let lon = parseFloat(hash_split[1])
    let lat = parseFloat(hash_split[2])
    if (!isNaN(lon) && !isNaN(lat)) {
        map.setCenter([lon, lat])
    }
}
if (hash_split.length > 3) {
    let pitch = parseFloat(hash_split[3])
    if (!isNaN(pitch)) {
        map.setPitch(pitch)
    }
}
if (hash_split.length > 4) {
    let bearing = parseFloat(hash_split[4])
    if (!isNaN(bearing)) {
        map.setBearing(bearing)
    }
}

map.on('moveend', function() {
    let center = map.getCenter()
    console.log('center:', center)

    window.location.hash =
        map.getZoom().toFixed(2) +
        "/" + center.lng.toFixed(7) +
        "/" + center.lat.toFixed(7) +
        "/" + map.getPitch().toFixed(2) +
        "/" + map.getBearing().toFixed(2);
})


let hoveredBuildingId = undefined;
let oldBuildingId = undefined;

map.on('mousemove', 'building-footprint', function(e) {
    if (e.features.length >= 1 && 'id' in e.features[0] && e.features[0].id !== oldBuildingId) {
        if (oldBuildingId !== undefined) {
            map.setFeatureState({
                source: 'footprint',
                sourceLayer: 'footprint',
                id: oldBuildingId
            }, {
                hover: false
            });
        }
        hoveredBuildingId = e.features[0].id;
        console.log('active:', hoveredBuildingId)
        map.setFeatureState({
            source: 'footprint',
            sourceLayer: 'footprint',
            id: hoveredBuildingId
        }, {
            hover: true
        });
        oldBuildingId = hoveredBuildingId;
    }
});