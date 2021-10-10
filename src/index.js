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
        3.1109806591766667,
        45.75919917431
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