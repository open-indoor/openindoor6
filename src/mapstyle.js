import background_layers from './layers/background.json';
import raster_layers from './layers/raster.json';
import footprint_layers from './layers/footprint.json';
import pins_layers from './layers/pins.json';
import shape_layers from './layers/shape.json';
import indoor_layers from './layers/indoor.json';

function mapstyle() {
    return {
        "version": 8,
        "transition": {
            "duration": 300,
            "delay": 0
        },
        "name": "Blank",
        "center": [0, 0],
        "zoom": 0,
        "light": {
            "anchor": "map",
            "color": "white",
            "intensity": 0.4,
            "position": [1.15, 210, 30]
        },
        "sources": {
            "raster-tiles": {
                "type": "raster",
                "tiles": [
                    "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                ],
                "tileSize": 256,
                "minzoom": 0,
                "maxzoom": 19
            },
            "footprint": {
                "type": "vector",
                "tiles": [
                    "https://tegola.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}.vector.pbf?token=kjGxKVMZcXAao1mtOOALxWY3",
                ],
                // "promoteId": "osm_id",
                "minzoom": 12,
                "maxzoom": 20,
                "attribution": "OpenIndoor / OpenStreetMap / Maplibre"
            },
            "pins": {
                "type": "vector",
                "tiles": [
                    "https://tegola.openindoor.io/maps/openindoor/pins/{z}/{x}/{y}.vector.pbf?token=kjGxKVMZcXAao1mtOOALxWY3"
                ],
                "minzoom": 0,
                "maxzoom": 20
            },
            "shape_source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                },
                "generateId": true,
            },
            "indoor_source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                },
                "generateId": true,
            },
            "selection": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                }
            },
        },
        "sprite": "https://open-indoor.github.io/sprite_2/sprite",
        "glyphs": "https://open-indoor.github.io/fonts/{fontstack}/{range}.pbf",
        "layers": [
            ...background_layers,
            ...raster_layers,
            ...footprint_layers,
            ...pins_layers,
            // ...building_layers,
            ...shape_layers,
            // ...shape_flat_layers,
            ...indoor_layers,
        ],
        "id": "blank"
    }
}
export default mapstyle