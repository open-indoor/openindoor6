import './style.css'

import maplibregl from 'maplibre-gl'

import indoor_layers from './layers/indoor.json';
import building_layers from './layers/building.json';

import addMapDOM from "./addMapDOM"
import mapstyle from "./mapstyle"
import urlparser from "./urlparser"
import load_data from "./load_data"
import openindoor_machine from "./openindoor_machine"
import avatar from "./avatar"
import oid_modal from "./oid_modal"
import oid_popup from "./oid_popup"
import oid_routing from './oid_routing';
import Fps from './module/fps';


export default class openindoor {
    constructor(options = openindoor.OPTIONS) {
        // this.init_bearing = options.bearing;
        console.log('options:', options);
        let { source, layer, bbox, building_id, level, feature_key, feature_id } = urlparser();
        options.container = options.container || openindoor.OPTIONS.container;
        addMapDOM(options.container);
        options.center = options.center || openindoor.OPTIONS.center;
        options.zoom = options.zoom || openindoor.OPTIONS.zoom;
        options.pitch = options.pitch || openindoor.OPTIONS.pitch;
        options.bearing = options.bearing == null ? 0 : parseInt(options.bearing);
        options.layers = options.layers || openindoor.OPTIONS.layers;
        options.source = options.source || source || openindoor.OPTIONS.source;
        options.level = options.level || level || openindoor.OPTIONS.level;
        options.feature_key = options.feature_key || feature_key || openindoor.OPTIONS.feature_key;
        options.search_keys = options.search_keys || openindoor.OPTIONS.search_keys;
        options.search_filter = options.search_filter || openindoor.OPTIONS.search_filter;
        options.modal = options.modal || openindoor.OPTIONS.modal;
        options.popup = options.popup || openindoor.OPTIONS.popup;
        options.feedback_control = options.feedback_control || openindoor.OPTIONS.feedback_control;
        options.info_control = options.info_control || openindoor.OPTIONS.info_control;
        options.mode_control = options.mode_control || openindoor.OPTIONS.mode_control;
        options.icon_tags = options.icon_tags || openindoor.OPTIONS.icon_tags;
        options.bbox = bbox || openindoor.OPTIONS.bbox;
        options.building_id = options.building_id || building_id || openindoor.OPTIONS.building_id;
        options.feature_id = options.feature_id || feature_id || openindoor.OPTIONS.feature_id;

        // options.indoor_layers = options.indoor_layers || openindoor.OPTIONS.indoor_layers;
        // options.building_layers = options.building_layers || openindoor.OPTIONS.building_layers;

        // console.log('map_style:', mapstyle.build_style({
        //     source: options.source,
        //     layer: options.layer
        // }));
        // let my_style = mapstyle.build_style({
        //     source: options.source,
        //     indoor_layers: options.indoor_layers[0],
        //     building_layers: options.building_layers[0],
        // });
        // console.log('my_style:', my_style);
        let style = mapstyle.build_style({
            source: options.source,
            layers: options.layers,
        });
        let attribution = '<a href="https://www.openindoor.net">OpenIndoor</a>';
        attribution += ' / '
        attribution += '<a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>'
        attribution += ' / '
        attribution += '<a href="https://maplibre.org/" target="_blank">MapLibre</a>'
        const map = new maplibregl.Map({
            "attributionControl": true,
            "customAttribution": attribution,
            'container': options.container,
            'center': options.center,
            'source': options.source,
            'state': options.state,
            // 'info': undefined,
            'zoom': options.zoom,
            'pitch': 0,
            'bearing': 0,
            'bearing': options.bearing,
            'style': style,
            'maxBounds': options.bbox,
            'hash': true,
            transformRequest: function(url, resourceType) {
                // if (resourceType === 'Tile' && url.indexOf('https://gateway.openindoor.io') > -1) {
                //     return {
                //         url: url,
                //         headers: { 'X-Gravitee-Api-Key': '4c9dfd10-1be0-4210-a033-9c7a5f93cff3' },
                //         credentials: 'include' // Include cookies for cross-origin requests
                //     }
                // }
                if (resourceType === 'Tile' && url.indexOf('https://openindoor-building-footprint.p.rapidapi.com/') > -1) {
                    return {
                        url: url,
                        headers: {
                            'X-RapidAPI-Host': 'openindoor-building-footprint.p.rapidapi.com',
                            'X-RapidAPI-Key': 'e6045d1298msh99864167024ddafp16695ejsnfd162a9819c9',
                        },
                        // credentials: 'include' // Include cookies for cross-origin requests
                    }
                }
                if (resourceType === 'Tile' && url.indexOf('https://openindoor-building-pins.p.rapidapi.com/') > -1) {
                    return {
                        url: url,
                        headers: {
                            'X-RapidAPI-Host': 'openindoor-building-pins.p.rapidapi.com',
                            'X-RapidAPI-Key': 'e6045d1298msh99864167024ddafp16695ejsnfd162a9819c9',
                        },
                        // credentials: 'include' // Include cookies for cross-origin requests
                    }
                }

                // const options = {
                //     method: 'GET',
                //     headers: {
                //         'X-RapidAPI-Host': 'openindoor-building-content.p.rapidapi.com',
                //         'X-RapidAPI-Key': 'e6045d1298msh99864167024ddafp16695ejsnfd162a9819c9'
                //     }
                // };

                // if (resourceType === 'Tile' && url.indexOf('https://tegola.openindoor.io/maps/openindoor/footprint') > -1) {
                //     console.log('url:', url);
                //     console.log('resourceType:', resourceType);

                //     return {
                //         url: url + '?token=kjGxKVMZcXAao1mtOOALxWY3',
                //         // credentials: 'include' // Include cookies for cross-origin requests
                //     }
                // }
            }
        });
        this.map_ = map;
        // console.log('getStyle 0:', map.getStyle())
        let game = new Fps(map);
        map.once('load', (e) => {
            let modal = (options.modal) ? oid_modal.get_instance() : undefined;
            let popup = (options.popup) ? oid_popup.get_instance(map) : undefined;

            this.layers = options.layers;
            // this.building_layers = options.building_layers;
            let routing = oid_routing.get_instance(map);
            console.log('options.mode_control:', options.mode_control);
            let statemachine = openindoor_machine(
                map, {
                    modal: modal,
                    popup: popup,
                    routing: routing,
                    info: options.info,
                    feedback_control: options.feedback_control,
                    info_control: options.info_control,
                    mode_control: options.mode_control,
                    search_keys: options.search_keys,
                    search_filter: options.search_filter,
                    bearing: options.bearing,
                    layers: options.layers,
                }
            );
            console.log('options.feature_key:', options.feature_key);
            console.log('options.feature_id:', options.feature_id);
            let load_my_data = load_data(
                map,
                statemachine,
                options.source,
                options.layers,
                // options.indoor_layers,
                // options.building_layers,
                options.state,
                options.building_id,
                options.level,
                options.feature_key,
                options.feature_id,
                options.icon_tags
            );
            // let my_geojson = urlparser(map, statemachine, { layer: this.layer });
        });
    }
}

openindoor.OPTIONS = {
    container: 'map',
    center: [-1.70188, 48.11915],
    zoom: 17,
    pitch: 0,
    bearing: 0,
    // layer: "station",
    source: undefined,
    // layer: undefined,
    building_id: undefined,
    level: undefined,
    feature_key: "id",
    search_keys: ["name", "ref"],
    search_filter: {
        properties: {
            feature_type: ["anchor"]
        }
    },
    modal: false,
    popup: true,
    feedback_control: "visible",
    info_control: "visible",
    mode_control: "visible",
    icon_tags: {
        icon_url: "image",
        icon_name: "icon"
    },
    layers: [{
        title: "default",
        indoor: {
            url: "./layer/indoor-default.json"
        },
        building: {
            url: "./layer/building-primary.json"
        }
    }, {
        title: "other",
        indoor: {
            url: "./layer/indoor-newstyle.json"
        },
        building: {
            url: "./layer/building-automn.json"
        }
    }]
}