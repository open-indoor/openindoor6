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
    },

    //"sprite": "https://open-indoor.github.io/sprite/sprite",
    "glyphs": "https://open-indoor.github.io/fonts/{fontstack}/{range}.pbf",
    "layers": [{
        "id": "background",
        "type": "background",
        "paint": {
            "background-color": "#e0dfdf"
        }
    },

    {
        "id": "simple-tiles",
        "type": "raster",
        "source": "raster-tiles"
    }],

    "id": "blank"
}


var map = new maplibregl.Map({
    style:
        'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [-74.0066, 40.7135],
    zoom: 15.5,
    pitch: 45,
    bearing: -17.6,
    container: 'map',
    antialias: true
});

// The 'building' layer in the streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function () {
    // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addLayer(
        {
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        },
        labelLayerId
    );
});


// const map = new maplibregl.Map({
//     'container': 'map',
//     'center': [
//         -87.617365,
//         41.865799
//     ],

    // "coordinates": [-74.0549304, 40.686461]
    // 'pitch': 60,



    // 'bearing': 0,
    // 'zoom': 17,
    // 'style': mapStyle,



    // 'maxBounds': [
    //     [-74.055044, 40.686315], // Southwest coordinates
    //     [-74.054747, 40.6866] // Northeast coordinates
    // ]
    
// });

map.on('load', function () {
    map.addSource('floorplan', {
        // GeoJSON Data source used in vector tiles, documented at
        // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
        'type': 'geojson',
        'data':
            'https://maplibre.org/maplibre-gl-js-docs/assets/indoor-3d-map.geojson',
    });

    map.addLayer({
        'id': 'room-extrusion',
        'type': 'fill-extrusion',
        'source': 'floorplan',
        'paint': {
            // See the MapLibre Style Specification for details on data expressions.
            // https://maplibre.org/maplibre-gl-js-docs/style-spec/expressions/

            // Get the fill-extrusion-color from the source 'color' property.
            'fill-extrusion-color': ['get', 'color'],

            // Get fill-extrusion-height from the source 'height' property.
            'fill-extrusion-height': ['get', 'height'],

            // Get fill-extrusion-base from the source 'base_height' property.
            'fill-extrusion-base': ['get', 'base_height'],

            // Make extrusions slightly opaque for see through indoor walls.
            'fill-extrusion-opacity': 0.5
        }
    });

});

map.on('load', function () {
    map.addSource('openindoor', {
        'type': 'vector',
        "tiles": [
            "https://tegola-dev.openindoor.io/maps/openindoor/{z}/{x}/{y}.vector.pbf"
        ],
        "tolerance": 0
    });

    map.addLayer({
        'id': 'building',
        'source': "openindoor",
        'source-layer': "footprint",
        'type': 'line',
        'paint': {
            "line-color": "#000000",
            "line-width": 1
        }
    });


});
