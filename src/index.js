import './style.css'

import maplibregl from 'maplibre-gl'

import indoor_layers from './layers/indoor.json';
import building_layers from './layers/building.json';

import addMapDOM from "./addMapDOM"
import mapstyle from "./mapstyle"
// import pinsStyle from "./pinsStyle"
import urlparser from "./urlparser"
import load_data from "./load_data"
import openindoor_machine from "./openindoor_machine"
import avatar from "./avatar"
import oid_modal from "./oid_modal"
import oid_popup from "./oid_popup"
import oid_routing from './oid_routing';

export default class openindoor {
    constructor(options = {
        container: 'map',
        center: [-1.70188, 48.11915],
        zoom: 17,
        layer: "station",
        source: undefined,
        layer: undefined,
        building_id: undefined,
        level: undefined,
        feature_key: "id",
        // search_keys: "name",
        modal: false,
        popup: true
    }) {

        addMapDOM();
        console.log('options:', options);
        let { source, layer, bbox, building_id, level, feature_key, feature_id } = urlparser();
        options.source = options.source || source;
        options.bbox = options.bbox || bbox;
        options.layer = options.layer || layer;
        options.building_id = options.building_id || building_id;
        options.level = options.level || level;
        options.feature_key = options.feature_key || feature_key;
        options.feature_id = options.feature_id || feature_id;

        const map = new maplibregl.Map({
            'container': options.container,
            'center': options.center,
            'source': options.source,
            'state': options.state,
            'info': undefined,
            'zoom': options.zoom,
            'style': mapstyle(),
            'maxBounds': options.bbox,
            'hash': true
        });
        map.once('load', (e) => {
            let modal = (options.modal) ? oid_modal.get_instance() : undefined;
            let popup = (options.popup) ? oid_popup.get_instance(map) : undefined;

            this.layer = options.layer;
            let routing = oid_routing.get_instance(map);
            // pinsStyle(map)
            let statemachine = openindoor_machine(map, modal, popup, routing, options.info);
            console.log('options.feature_key:', options.feature_key);
            console.log('options.feature_id:', options.feature_id);
            let load_my_data = load_data(
                map,
                statemachine,
                options.source,
                options.layer,
                options.state,
                options.building_id,
                options.level,
                options.feature_key,
                options.feature_id
            );
            // let my_geojson = urlparser(map, statemachine, { layer: this.layer });
        });
    }
}