import background_layers from './layers/background.json';
import raster_layers from './layers/raster.json';
import footprint_layers from './layers/footprint.json';
import pins_layers from './layers/pins.json';
import shape_layers from './layers/shape.json';
import indoor_layers from './layers/indoor.json';

class mapstyle {
    // constructor() {

    // }    
    static custom_style = false;
    static build_style(options = {
        source: undefined,
        layers: undefined,
    }) {
        // /mvt/footprint/([0-9]+)/([0-9]+)/([0-9]+).pbf
        //     curl --header "X-Gravitee-Api-Key: 4c9dfd10-1be0-4210-a033-9c7a5f93cff3" \
        //  https://gateway.openindoor.io/mvt/footprint

        let sources = {
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
                    // "https://gateway.openindoor.io/mvt/footprint/{z}/{x}/{y}.vector.pbf?token=kjGxKVMZcXAao1mtOOALxWY3",
                    // "https://tegola.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}.vector.pbf?token=kjGxKVMZcXAao1mtOOALxWY3",
                    // "https://tegola.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}?token=kjGxKVMZcXAao1mtOOALxWY3",
                    // "https://tegola.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}",
                    // "https://openindoor-building-footprint.p.rapidapi.com/maps/openindoor/footprint/{z}/{x}/{y}"
                    // "https://tegola.openindoor.io/maps/openindoor/footprint_building/{z}/{x}/{y}",
                    "https://tegola.openindoor.io/maps/openindoor/footprint_update/{z}/{x}/{y}",
                    // "https://tegola.openindoor.io/maps/openindoor/footprint/{z}/{x}/{y}.vector.pbf",
                    // "https://gateway.openindoor.io/mvt/footprint/{z}/{x}/{y}.vector.pbf",
                ],
                // "promoteId": "osm_id",
                "minzoom": 12,
                "maxzoom": 20,
                // "attribution": "OpenIndoor / OpenStreetMap / Maplibre"
            },
            "pins": {
                "type": "vector",
                "tiles": [
                    // "https://tegola.openindoor.io/maps/openindoor/pins/{z}/{x}/{y}.vector.pbf?token=kjGxKVMZcXAao1mtOOALxWY3"
                    // "https://tegola.openindoor.io/maps/openindoor/pins/{z}/{x}/{y}?token=kjGxKVMZcXAao1mtOOALxWY3"
                    "https://tegola.openindoor.io/maps/openindoor/pins_update/{z}/{x}/{y}"
                    // "https://openindoor-building-pins.p.rapidapi.com/maps/openindoor/pins/{z}/{x}/{y}"
                ],
                "minzoom": 1,
                "maxzoom": 15
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
        };
        console.log('options.source:', options.source);
        if (options.source != null) {
            sources = {
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
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": []
                    },
                    "generateId": true,
                },
                "pins": {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": []
                    },
                    "generateId": true,
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
            }
        }
        // if (options.layers != null) {
        //     mapstyle.custom_style = true
        // }
        let layers = [
            ...background_layers,
            ...raster_layers,
            ...pins_layers,
            ...shape_layers,
            ...(options.layers != null && options.layers.indoor != null) ? [] : indoor_layers,
            ...(options.layers != null && options.layers.building != null) ? [] : footprint_layers,
        ]



        return {
            version: 8,
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
            sources: sources,
            "sprite": "https://open-indoor.github.io/sprite_2/sprite",
            "glyphs": "https://open-indoor.github.io/fonts/{fontstack}/{range}.pbf",
            "layers": layers,
            "id": "blank",
        }
    }

    // static update_with_indoor_layers(map, indoor_layers_url) {
    //     console.log('url:', indoor_layers_url);
    //     if (mapstyle.custom_style)
    //         return;
    //     fetch(indoor_layers_url).then((response) => {
    //         var contentType = response.headers.get("content-type");
    //         if (contentType && contentType.indexOf("application/json") !== -1) {
    //             return response.json().then(function(my_indoor_layers) {
    //                 for (let layer of my_indoor_layers) {
    //                     if (map.getLayer(layer.id) != null)
    //                         map.removeLayer()
    //                     map.addLayer(layer);
    //                 }
    //                 // let style = map.getStyle();
    //                 // style.layers = [
    //                 //         ...background_layers,
    //                 //         ...raster_layers,
    //                 //         ...footprint_layers,
    //                 //         ...pins_layers,
    //                 //         ...shape_layers,
    //                 //         ...my_indoor_layers,
    //                 //     ]
    //                 //     // console.log('style:', style);
    //                 // map.setStyle(style);
    //             });
    //         } else {
    //             console.log("Oops, no JSON!");
    //         }
    //     });

    // }

    // set_indoor_layers(map, my_indoor_layers) {
    //     if (!this.activated)
    //         return;
    //     let layers = [
    //         ...background_layers,
    //         ...raster_layers,
    //         ...footprint_layers,
    //         ...pins_layers,
    //         ...shape_layers,
    //         ...my_indoor_layers,
    //     ];
    //     this.style = map.getStyle();
    //     this.style.layers = layers;
    //     // this.style = {
    //     //     "version": 8,
    //     //     "transition": {
    //     //         "duration": 300,
    //     //         "delay": 0
    //     //     },
    //     //     "name": "Blank",
    //     //     "center": [0, 0],
    //     //     "zoom": 0,
    //     //     "light": {
    //     //         "anchor": "map",
    //     //         "color": "white",
    //     //         "intensity": 0.4,
    //     //         "position": [1.15, 210, 30]
    //     //     },
    //     //     "sources": this.sources,
    //     //     "sprite": "https://open-indoor.github.io/sprite_2/sprite",
    //     //     "glyphs": "https://open-indoor.github.io/fonts/{fontstack}/{range}.pbf",
    //     //     "layers": layers,
    //     //     "id": "blank"
    //     // }
    //     this.map.setStyle(this.style, {
    //         diff: false,
    //     })
    // }
}

export default mapstyle;