import osmtogeojson from 'osmtogeojson/osmtogeojson.js';
import default_indoor_layers from './layers/indoor.json';
import default_building_layers from './layers/footprint.json';
import toolbox from './toolbox.js';
import centroid from '@turf/centroid';
import bbox from '@turf/bbox';
import convex from '@turf/convex';
import polygonToLine from '@turf/polygon-to-line'
import lineToPolygon from '@turf/line-to-polygon'
import polygonize from '@turf/polygonize';
// import bbox from '@turf/bbox';
import clone from '@turf/clone';
import buffer from '@turf/buffer';
import Controls from "./controls"
import Info from "./info"
import oid_routing from "./oid_routing"


// import immersive from "./state/immersive"
// import { DOMParser } from '@xmldom/xmldom'
// import xmldom from 'xmldom'

// import opening_hours from 'opening_hours/build/opening_hours.js'


//                                     -----------
//                                    |   Init    |
//                                     -----------
//                                               |
//                                               |- on_map_loaded()
//                                               |  -> data load: footprint data
//                                               |  -> data unload: overpass data
//                                               |  -> layout display: buildings / colored buildings
//                                               |  -> interaction: building selection
//                                               |  -> events:
//                                               |    -> register "mousemove" on building: building preselection
//                                               |    -> register "click" on building: trigger on_building_selected()
//                                               |
//                                              \|/
//                                     -----------
//                                    | Building  | Buildings shown
//                                     -----------
//                                               |
//       --------------->--------------          |
//      |                              |         |
//      |                              |         |
//      |                             \|/       \|/ 
//      |                              |         |
//      |                               ---------
//      |                                   |
//      |                                   |- on_building_selected()
//      |                                   |  -> data load: overpass data inside footprint
//      |                                   |  -> data unload: current footprint (layout)
//      |                                   |  -> layout display: shape / colored floors
//      |                                   |  -> interaction: level selection
//      |                                   |  -> events:
//      |                                   |    -> register "mousemove" on floors/shape
//      |                                   |    -> register "click" on floors/shape: trigger on_floor_selected()
//      |                                   |    -> unregister events on on PoIs
//      |                                   |
//      |                                  \|/
//      |                              -----------
//      |                             |   Floor   | Floors shown (buildings and raster ground also)
//      |                              -----------
//      |                                        |
//      |                                        |
//      |                                        |
//      |                                        |
//      |                          -------       |
//      |                         |     \|/     \|/
//      |                         |       -------
//      |                         |         |- on_floor_selected()
//      |                         |         |  -> filter on specific level data, display indoor map
//      |                         |         |  -> data load (if not yet loaded): overpass data inside footprint
//      |                         |         |  -> data unload (if not yet loaded): footprints
//      |                         |         |  -> layout display: indoor / all indoor data
//     /|\                        |         |  -> interaction: indoor POI selection
//      |                         |         |  -> events:
//      |                         |         |    -> register "mousemove" on PoIs
//      |                         |         |    -> register "click" on PoIs: trigger on_indoor_POI_selected()
//      |                         |         |    -> unregister PoI immersion (360, control...):
//      |                         |         |  -> other:
//      |                         |         |    -> unload POI data
//      |                         |         |
//      |                         |        \|/
//      |                         |    -----------
//      |                         |   |  Indoor   | Indoor shown (remove raster ground)
//      |                         |    -----------
//      |                         |    |   |    |
//      |    on_floor_selected() -|    |   |    |- on_indoor_POI_selected()
//      |                         |    |   |    |  -> interact with indoor POI
//      |                        /|\   |   |    |    -> 360 visit
//      |                         |    |   |    |    -> IoT control & monitoring
//      |                         |   \|/  |   \|/
//      |                          -----   |    |
//      |                                  |    |
//       ----------------------------------     |
//                                              |
//                                     -----------
//                                    |    PoI    |
//                                     -----------

class Abstractmachine {

    constructor(map) {
        if (this.constructor === Abstractmachine) {
            throw new TypeError('Abstract class "AbstractConfig" cannot be instantiated directly');
        }
    }

    do() {
        throw new Error('You must implement this function');
    }

    on_building_selected({ feature: {} }) {
        throw new Error('You must implement to_building function');
    }
    on_floor_selected({ feature: {} }) {
        throw new Error('You must implement to_floor function');
    }
    on_indoor_POI_selected({ feature: {} }) {
        throw new Error('You must implement to_indoor function');
    }
}


class machine extends Abstractmachine {
    // static get_singleton(map, modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter, init_bearing) {

    //     if (machine.singleton === undefined)
    //         machine.singleton = new machine(map, modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter, init_bearing);
    //     return machine.singleton;
    // }

    // Add a ({level: level}) => {} inline method in the set of level listeners
    add_level_listeners(level_listener) {
        openIndoorMachine.level_listeners.push(level_listener)
    }
    constructor(map, options) {
        // modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter, init_bearing
        super(map);
        this.map = map;
        this.indoor_layers = JSON.parse(JSON.stringify(default_indoor_layers))
        this.building_layers = JSON.parse(JSON.stringify(default_building_layers))
        this._set_indoor_layers = this._set_indoor_layers.bind(this);
        this.building_state = new Building(map)
        this.floor_state = new Floor(map);
        this.indoor_state = new Indoor(map);

        this.modal = options.modal;
        this.popup = options.popup;
        this.routing = options.routing;
        this.state = this.building_state;
        Info.data = options.info;
        this.data_mode = "online"
        this.pitch_old = map.getPitch();
        this.init_mode = "building_state";
        this.layer = "default";
        this.init_bearing = options.init_bearing;
        this.level_listeners = [];
        this.controls = new Controls(
            map, this, {
                feedback_control: options.feedback_control,
                info_control: options.info_control,
                mode_control: options.mode_control,
                search_keys: options.search_keys,
                search_filter: options.search_filter,
                layers: options.layers
            }
        );
        // machine.add_level_listener((level_evt) => {
        //     self.setLevel(level_evt.level)
        // })
        let self = this;
        // machine.controls.on_building_geocoder_result((e) => {
        //     console.log('building_geocoder_result !');
        //     self.setState(building_state);
        // })

        this.controls.set_on_indoor_layer_change(({ level, indoor_layers }) => {

            for (let layer of openIndoorMachine.indoor_layers) {
                // console.log('remove layer:', layer.id)
                self.map.removeLayer(layer.id);
            }
            openIndoorMachine.indoor_layers = indoor_layers;
            let indoor_visibility = (self.getState() === this.indoor_state) ? "visible" : "none"
            console.log('indoor_visibility:', indoor_visibility);
            for (let layer of openIndoorMachine.indoor_layers) {
                // console.log('add layer:', layer.id)
                self.map.addLayer(layer);
                self.map.setLayoutProperty(layer.id, 'visibility', indoor_visibility)
            }
            self.indoor_state.filter_on_level({
                level_min: level,
                level_max: level + 1
            });
        })


        this.controls.set_on_building_layer_change(({ building_layers }) => {
            for (let layer of openIndoorMachine.building_layers) {
                // console.log('remove layer:', layer.id)
                self.map.removeLayer(layer.id);
            }
            openIndoorMachine.building_layers = building_layers;
            let building_visibility = (self.getState() === this.building_state) ? "visible" : "none"
            for (let layer of openIndoorMachine.building_layers) {
                // console.log('add layer:', layer.id)
                self.map.addLayer(layer);
                self.map.setLayoutProperty(layer.id, 'visibility', building_visibility)
            }

        })


        self.controls.set_on_geolocate_update((geolocate_e) => {
            console.log('geolocate_e:', geolocate_e);

            // let routing = openIndoorMachine.routing;

            this.indoor_state.do_routing_start([
                geolocate_e.coords.longitude,
                geolocate_e.coords.latitude,
            ]);
        });

        self.controls.set_on_indoor_button_pushed(() => {
            self.setState(this.indoor_state)
        });
        self.controls.set_on_floor_button_pushed(() => {
            self.setState(this.floor_state)
        });
        self.controls.set_on_building_button_pushed(() => {
            self.setState(this.building_state)
        })
        self.controls.set_change_level_action(({ level }) => {
            if (openIndoorMachine.getState().constructor.name === this.floor_state.constructor.name) {
                return this.floor_state.on_change_level_action({ level });
            } else if (openIndoorMachine.getState().constructor.name === this.indoor_state.constructor.name) {
                return this.indoor_state.on_change_level_action({ level });
            }
        });

        self.controls.set_indoor_level_action(({ level }) => {
            if (openIndoorMachine.getState().constructor.name === this.floor_state.constructor.name) {
                // return floor_state.on_set_indoor_level_action({ level });
                // on_set_indoor_level_action({ level }) {
                openIndoorMachine.setState(this.indoor_state);
                this.indoor_state.on_change_level_action({ level });
                // }
            }
        });

        let dropZone = document.getElementById('map');
        dropZone.addEventListener('drop', (e) => this.handleGeojsonDropped(self, e), false);
        dropZone.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('dragover !')
            e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }, false);

        this.routing.set_start_dragend(this.indoor_state.do_routing_start);
        this.routing.set_stop_dragend(this.indoor_state.do_routing_stop);

        self.controls.set_path_reset_onclick(
            (e) => {
                // console.log('path_reset:', e);
                self.routing.reset();
                self.map.setBearing(this.init_bearing)
                self.map.setPitch(0);
                self.controls.geocoder.clear();
            }
        );
    }

    setLevel(level) {
        // for (level_listener of this.level_listeners) {
        //     level_listener({ level: level });
        // }
        openIndoorMachine.controls.setLevel(level)

    }
    getLevel(level) {
        return this.controls.getLevel()
    }

    // get_indoor_data() {
    //     return machine.indoor_data;
    // }

    mark(features, lngLat) {
        this.indoor_state.mark(this.indoor_state, features, lngLat);
    }

    do() {
        this.state.do()
    }

    setFloorState() {
        this.setState(this.floor_state);
    }
    set_indoor_state() {
        this.setState(this.indoor_state);
    }
    setState(state) {
        // if (state === this.building_state) {
        //     this.controls.switch_to_building_geocoder();
        //     this.controls.switch_to_building_layer_switcher();
        // } else {
        //     this.controls.switch_to_indoor_geocoder();
        // }
        // if (state === this.floor_state) {
        //     this.controls.switch_to_floor_layer_switcher();
        // }
        // if (state === this.indoor_state) {
        //     this.controls.switch_to_indoor_layer_switcher();
        // }

        this.state = state
        this.state.do()
    }
    getState() {
        return this.state;
    }

    is_building_state() {
        return this.state === this.building_state;
    }

    is_floor_state() {
        return this.state === this.floor_state;
    }

    is_indoor_state() {
        return this.state === this.indoor_state;
    }

    on_building_selected({ feature: {} }) {
        this.state.on_building_selected({ feature })
    }
    on_floor_selected() {}
    on_indoor_POI_selected() {}


    setFeatureState({ source, id, property } = {}) {
        let feature_ref = {
            source: source,
            id: id
        }

        if (openIndoorMachine.data_mode === "online" &&
            openIndoorMachine.getState().constructor.name === this.building_state.constructor.name) {
            feature_ref.sourceLayer = source;
        } else {
            // console.log('openIndoorMachine.data_mode:', openIndoorMachine.data_mode)
            // console.log('openIndoorMachine.getState().constructor.name:', openIndoorMachine.getState().constructor.name)
            // console.log('building_state.constructor.name:', building_state.constructor.name)
            null;
        }
        // console.log('source:', source);
        if (source === 'footprint') {
            // machine.map.setFeatureState(feature_ref, property);
        } else {
            // this.map.setFeatureState(feature_ref, property);
        }

    }
    set_building_id(building_id) {
        // console.log("Try to go to floor state")
        // machine.map.on('sourcedata', function(e) {
        //     if (e.isSourceLoaded) {
        //         console.log("event e.source:", e.source);
        //         console.log("event e:", e);
        //     }

        //     if (e.isSourceLoaded && e.source.type === "geojson" && e.sourceId === "footprint") {
        //         console.log("openIndoorMachine.data_mode:", openIndoorMachine.data_mode);
        //         if (openIndoorMachine.data_mode === "drag_n_drop") {
        //             console.log("Go to indoor state")
        //             openIndoorMachine.setState(indoor_state);
        //         }
        //     }
        // });
    }
    set_level(level) {
        // if (openIndoorMachine.data_mode === "drag_n_drop") {
        //     openIndoorMachine.setState(indoor_state);
        // }
    }
    set_indoor_layers(indoor_layers_url) {
        // load indoor layer files
        let layer_url = undefined;
        if (indoor_layers_url.match(/\.json$/i)) {
            this._set_indoor_layers(indoor_layers_url, { set_default: true });
        }
    }
    set_building_layers(building_layers_url) {
        console.log('set building layers');
        // load indoor layer files
        let layer_url = undefined;
        if (building_layers_url.match(/\.json$/i)) {
            this._set_building_layers(building_layers_url, { set_default: true });
        }
    }

    set_default_layer() {
        for (let layer of openIndoorMachine.indoor_layers) {
            this.map.removeLayer(layer.id);
        }
        openIndoorMachine.indoor_layers = default_indoor_layers;
        for (let layer of openIndoorMachine.indoor_layers) {
            this.map.addLayer(layer);
        }
        // console.log('openIndoorMachine.building_layers:', openIndoorMachine.building_layers);
        for (let layer of openIndoorMachine.building_layers) {
            this.map.removeLayer(layer.id);
        }
        openIndoorMachine.building_layers = default_building_layers;
        for (let layer of openIndoorMachine.building_layers) {
            this.map.addLayer(layer);
        }
    }

    _set_indoor_layers(layer_url, option = { set_default: false }) {
        let indoor_layers_ = undefined;
        let self = this;
        fetch(layer_url).then(function(response) {
            var contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(function(json) {
                    console.log('json style:', json);
                    indoor_layers_ = json;
                    if (indoor_layers_ != null) {
                        for (let layer of openIndoorMachine.indoor_layers) {
                            // console.log('remove:', layer.id);
                            // console.log('this:', this);
                            if (self.map.getLayer(layer.id) != null) {
                                self.map.removeLayer(layer.id);
                            }
                        }
                        if (option.set_default) {
                            default_indoor_layers = indoor_layers_;
                        }
                        openIndoorMachine.indoor_layers = indoor_layers_;
                        for (let layer of openIndoorMachine.indoor_layers) {
                            // console.log('load:', layer.id);
                            self.map.addLayer(layer);
                            // machine.map.setLayoutProperty(layer.id, "visibility", "visible")
                        }
                    }

                });
            } else {
                console.log("Oops, no JSON!");
            }
        });
    }
    _set_building_layers(layer_url, option = { set_default: false }) {
        let building_layers_ = undefined;
        let self = this;
        fetch(layer_url).then(function(response) {
            var contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(function(json) {
                    console.log('json style:', json);
                    building_layers_ = json;
                    if (building_layers_ != null) {
                        for (let layer of openIndoorMachine.building_layers) {
                            // console.log('remove:', layer.id);
                            if (self.map.getLayer(layer.id) != null) {
                                self.map.removeLayer(layer.id);
                            }
                        }
                        if (option.set_default) {
                            default_building_layers = building_layers_;
                        }
                        openIndoorMachine.building_layers = building_layers_;
                        for (let layer of openIndoorMachine.building_layers) {
                            console.log('load:', layer);
                            self.map.addLayer(layer);
                            // machine.map.setLayoutProperty(layer.id, "visibility", "visible")
                        }
                    }

                });
            } else {
                console.log("Oops, no JSON!");
            }
        });
    }
    parse(data, ext, options = {
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
    }) {
        console.log('going to parse !');
        let [building_data, floor_data, indoor_data] = toolbox.parse(
            data,
            ext
        );
        toolbox.loadImages(
            this.map,
            indoor_data, {
                icon_tags: options.icon_tags
            }
        );

        openIndoorMachine.data_mode = "drag_n_drop"

        this.floors_data = floor_data;
        this.indoor_data = indoor_data;
        // toolbox.openindoorize(geojson);



        // for (let feat_ of building_data.features.filter(feat__ =>
        //         feat__.geometry.type === "LineString" ||
        //         feat__.geometry.type === "MultiineString"
        //     )) {
        //     // console.log('feat_:', feat_)
        //     let polygons = polygonize(feat_)
        //     if (polygons.features.length === 0)
        //         continue;
        //     feat_.geometry = polygons.features[0].geometry;
        // }
        // console.log('building_data:', building_data)

        // Set building footprint data
        for (let layer of default_building_layers) {
            if (this.map.getLayer(layer.id) === undefined)
                continue;
            this.map.removeLayer(layer.id);
        }
        this.map.removeSource('footprint');
        this.map.addSource('footprint', {
            "type": "geojson",
            "data": building_data
        });
        for (let layer of default_building_layers) {
            if (this.map.getLayer(layer.id) !== undefined)
                continue;
            delete layer["source-layer"];
            this.map.addLayer(layer);
        }
        // Set floor data
        this.map.getSource("shape_source").setData(openIndoorMachine.floors_data);

        // Set indoor data
        this.map.getSource("indoor_source").setData(openIndoorMachine.indoor_data);
        let center = centroid(openIndoorMachine.floors_data).geometry.coordinates;
        console.log('center:', center);
        this.map.jumpTo({
            center: center,
            zoom: 16,
        });
        if (openIndoorMachine.init_mode === "indoor_state") {
            if (options.feature_key != null && options.feature_id != null)
                indoor_state.set_feature(options.feature_key, options.feature_id);
            openIndoorMachine.setState(this.indoor_state);
        } else {
            openIndoorMachine.setState(this.building_state);
        }
    }
    handleGeojsonDropped(self, e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('handleGeojsonDropped !');
        let files = e.dataTransfer.files;
        let reader = new FileReader();
        reader.onerror = function(e) {};
        reader.onprogress = function(e) {}
        reader.onabort = function(e) {};
        reader.onloadstart = function(e) {};
        // let self = this;
        reader.onload = function(e) {
            let text = e.target.result; // INPUT IS TEXT FILE
            let re = /(?:\.([^.]+))?$/;
            let ext = re.exec(files[0].name)[1];
            self.parse(text, ext)


            // let center = centroid(machine.floors_data).geometry.coordinates;
            // console.log('center:', center);
            // machine.map.flyTo({
            //     center: center,
            //     zoom: 16
            // });
            // openIndoorMachine.setState(building_state);
        }
        reader.readAsText(files[0]);
    }
}


// machine.controls = undefined;
// machine.floors_data = undefined;
// machine.indoor_data = undefined;
// machine.map = undefined;
// machine.INDOOR_LAYER = undefined;

class Init extends Abstractmachine {

    constructor(map) {
        super(map);
    }

    on_building_selected({ feature: {} }) {}
    on_floor_selected({ feature: {} }) {}
    on_indoor_POI_selected({ feature: {} }) {}
}

class Building extends Abstractmachine {

    constructor(map) {
        super(map);
        this.map = map;
        this.hovered = {
            feature: undefined
        }
        this.selected = {
            feature: undefined
        }
        this.hoveredBuildingId = undefined;
        this.oldBuildingId = undefined;

        this.clickedBuildingId = undefined;
        this.oldClickedBuildingId = undefined;
        this.loadingId = undefined

        this.hoveredPinsId = undefined;
        this.oldTextId = undefined;
        this.on_building_selected = this.on_building_selected.bind(this);
    }

    do() {
        let self = this;
        // machine.map.off('pitch', openIndoorMachine.on_pitch());



        this.map.off('pitch', openIndoorMachine.indoor_state.on_pitch_e);
        this.map.off('pitch', openIndoorMachine.floor_state.on_pitch_e);

        console.log('openIndoorMachine:', openIndoorMachine);
        console.log('openIndoorMachine.indoor_state:', openIndoorMachine.indoor_state);
        openIndoorMachine.indoor_state.disable_display_info();
        console.log('Reset routing');
        openIndoorMachine.indoor_state.routing_reset();

        this.map.setMaxPitch(60);

        openIndoorMachine.controls.disable_building_button();
        openIndoorMachine.controls.disable_floor_button();
        openIndoorMachine.controls.disable_indoor_button();

        openIndoorMachine.controls.deactivateLevelControl();
        openIndoorMachine.controls.switch_to_building_geocoder();

        // machine.controls.enable_building_geocoder();
        // machine.controls.disable_indoor_geocoder();

        this.map.setMaxZoom(19);
        this.map.setMinZoom(0);

        // Enable raster tiles
        if (this.map.getLayer("simple-tiles") !== undefined)
            this.map.setPaintProperty("simple-tiles", "raster-opacity", 1)


        // Enable buildings
        for (let layer_ of openIndoorMachine.building_layers) {
            if (this.map.getLayer(layer_.id) !== undefined)
                this.map.setLayoutProperty(layer_.id, 'visibility', 'visible')
        }
        if (this.map.getLayer("pins-layer") !== undefined) {
            // this.map.setLayoutProperty("building-footprint", 'visibility', 'visible')
            this.map.setLayoutProperty("pins-layer", 'visibility', 'visible')
        }

        // Disable floors
        if (this.map.getLayer("shape-area-extrusion-indoor-00") !== undefined)
            this.map.setLayoutProperty("shape-area-extrusion-indoor-00", 'visibility', 'none')

        // Disable indoor
        for (let layer_ of openIndoorMachine.indoor_layers) {
            if (this.map.getLayer(layer_.id) !== undefined)
                this.map.setLayoutProperty(layer_.id, 'visibility', 'none')
        }

        this.map.on(
            'mousemove',
            'building-footprint',
            (e) => {
                if (!('features' in e && e.features.length > 0))
                    return
                let feature = e.features[0]
                self.on_building_hover({
                    feature: feature
                })
            }
        );

        let on_building_click_e = (e) => {
            // console.log(machine.map.getBounds());
            if (!('features' in e && e.features.length > 0))
                return

            let feature = e.features[0]
            console.log('feature:', feature)
            self.on_building_selected({
                feature: feature,
                disable: () => {
                    this.map.off(
                        'click',
                        'building-footprint',
                        on_building_click_e
                    )
                }
            })
        }
        this.map.on('click', 'building-footprint', on_building_click_e);

        let on_pins_over_e = (e) => {
            if (!('features' in e && e.features.length > 0))
                return
            let feature = e.features[0]
            self.on_pins_over({
                feature: feature,
                disable: () => {
                    this.map.off(
                        'click',
                        'pins-layer',
                        on_pins_over_e
                    )
                }
            })
        }
        this.map.on('click', 'pins-layer', on_pins_over_e)
    }

    on_pins_hover({ pins_feature }) {
        if ('id' in pins_feature && pins_feature.id !== this.oldTextId) {
            if (this.oldTextId !== undefined) {
                openIndoorMachine.setFeatureState({
                    source: 'pins',
                    id: this.oldTextId,
                    property: {
                        hover: false
                    }
                })
            }
            this.hoveredPinsId = pins_feature.id;
            // console.log('active:', hoveredPinsId)
            openIndoorMachine.setFeatureState({
                source: 'pins',
                id: this.hoveredPinsId,
                property: {
                    hover: true
                }
            })
            this.oldTextId = this.hoveredPinsId;
        }
    }

    unselect({ next_feature }) {
        // Invalidate other hovered
        if (this.hovered.feature !== undefined &&
            this.hovered.feature.id !== undefined &&
            next_feature.id !== undefined &&
            this.hovered.feature.id !== next_feature.id) {
            openIndoorMachine.setFeatureState({
                source: 'footprint',
                id: this.hovered.feature.id,
                property: {
                    hover: false
                }
            })
        }
    }

    on_building_hover({ feature: feature }) {
        this.unselect({ next_feature: feature })

        this.hovered.feature = feature
        openIndoorMachine.setFeatureState({
            source: 'footprint',
            id: this.hovered.feature.id,
            property: {
                hover: true
            }
        })
    }

    on_building_selected({ feature, disable }) {
        let self = this;
        // if (
        //     feature.properties != null &&
        //     feature.properties.building != null &&
        //     feature.properties.building != "no" &&
        //     feature.properties.shop != null &&
        //     feature.properties.shop === "mall"
        // ) {
        //     console.log('set mall layer !')
        //     openIndoorMachine._set_layer('/layer/indoor-mall.json', { set_default: false });
        // } else {

        // console.log('back to default layer !')
        // openIndoorMachine.set_default_layer();
        // }

        if (this.loadingId != undefined) {
            return
        }

        this.selected = feature
        let selectedBuilding = feature

        console.log("selectedBuilding:", selectedBuilding)
        if (this.oldClickedBuildingId !== undefined) {
            openIndoorMachine.setFeatureState({
                source: 'footprint',
                id: this.oldClickedBuildingId,
                property: {
                    click: false
                }
            })
        }

        this.clickedBuildingId = selectedBuilding.id;

        openIndoorMachine.setFeatureState({
            source: 'footprint',
            id: this.clickedBuildingId
        }, {
            click: true
        })

        this.oldClickedBuildingId = this.clickedBuildingId;

        if (openIndoorMachine.data_mode === "drag_n_drop") {

            let levels = [...new Set(openIndoorMachine.floors_data.features.map(
                feature => {
                    return parseInt(feature.properties.min_level) || 0;
                }
            ))].sort(function(a, b) {
                return a - b;
            })
            openIndoorMachine.controls.setLevels(levels)

            openIndoorMachine.setLevel(levels[levels.length - 1])
            if (levels.length === 1) {
                openIndoorMachine.setState(openIndoorMachine.indoor_state)
            } else {
                openIndoorMachine.setState(openIndoorMachine.floor_state)
            }
            // machine.controls.disable_building_geocoder();

        } else {
            this.loadingId = this.clickedBuildingId

            let my_building = convex(selectedBuilding);

            console.log('convex:', my_building)


            let bb = bbox(my_building)
            console.log('bbox:', bb)
            this.map.fitBounds([
                [bb[0], bb[1]],
                [bb[2], bb[3]],
            ], {
                padding: { top: 100, bottom: 100, left: 100, right: 100 },
                mazZoom: 18
            })


            let building_id = selectedBuilding.properties.osm_id;
            // let bbox = bbox(selectedBuilding);
            // minX, minY, maxX, maxY
            console.log('bbox:', bbox);
            let request = '[out:json];' +
                (building_id.substring(0, 1) === 'a' ? 'rel' : 'way') +
                '(' + building_id.substring(1) + ');' +
                'map_to_area->.a;nwr(area.a); out;';
            // 'out geom(' +
            // bb[1] + ',' +
            // bb[0] + ',' +
            // bb[3] + ',' +
            // bb[2] + ');';
            console.log('request:', request);
            // let polygon = JSON.parse(JSON.stringify(my_building.geometry.coordinates[0]))

            // let reverse = polygon.map(
            //     gps_a => {
            //         return gps_a.reverse()
            //     }
            // )
            // let poly_ovp = reverse.flat().join(" ")
            // let request = '[out:json];nwr(poly:"' + poly_ovp + '");out geom;';
            // console.log('request:', request.substring(0, 20) + "...")
            console.log('request:', request)

            console.log("Going to fetch from overpass !!!")
            let self = openIndoorMachine.building_state;

            let center = centroid(my_building).geometry.coordinates
            console.log('center:', center)

            spinner_marker.setLngLat(center)
            spinner.style.display = "block";
            spinner.style.visibility = "visible";

            // const options = {
            //     method: 'GET',
            //     headers: {
            //         'X-RapidAPI-Host': 'openindoor-building-content.p.rapidapi.com',
            //         'X-RapidAPI-Key': 'e6045d1298msh99864167024ddafp16695ejsnfd162a9819c9'
            //     }
            // };

            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Host': 'osm-indoor-building.p.rapidapi.com',
                    'X-RapidAPI-Key': 'c9d5519010mshf559cd43bb1c93dp14f22ejsnb2d285cc46bb'
                }
            };


            // fetch(
            //         'https://openindoor-building-content.p.rapidapi.com/osm/places/way/' + building_id.substring(1) + '/related',
            //         options
            //     )
            //     .then(response => response.json())
            //     .then(response => console.log(response))
            //     .catch(err => console.error(err));
            // fetch('https://openindoor-building-content.p.rapidapi.com/osm/places/way/' + building_id.substring(1) + '/related/openindoor_poly', options).then(function(response) {
            // fetch('https://openindoor-building-content.p.rapidapi.com/osm/places/way/' + building_id.substring(1) + '/related/json', options).then(function(response) {
            // fetch('https://gateway.openindoor.io/osm/places/way/' + building_id.substring(1) + '/related/json').then(function(response) {
            fetch('https://building-id.openindoor.io/osm/places/way/' + building_id.substring(1) + '/related/json').then(function(response) {

                // fetch("https://building-id.openindoor.io/osm/places/way/" + building_id.substring(1) + "/related/openindoor_poly").then(function(response) {
                // let my_geojson = fetch("https://overpass-api-world.openindoor.io/api/interpreter", {
                //     method: 'POST',
                //     body: request
                // }).then(function(response) {

                if (response.ok) {
                    return response.json();
                } else {
                    console.log('Status:', response.status);
                }
            }).then(function(json) {
                console.log("Reply received !")

                // floors data
                openIndoorMachine.floors_data = osmtogeojson(
                    json, {
                        flatProperties: true,
                        polygonFeatures: function(properties) {
                            if (properties == null || (properties.highway != null && properties.highway === 'footway'))
                                return false
                            return true
                        }

                    }
                );
                toolbox.fix_indoor(openIndoorMachine.floors_data)

                // indoor data as:
                // false: LineString
                // true: Polygon
                openIndoorMachine.indoor_data = osmtogeojson(
                    json, {
                        flatProperties: true,
                        polygonFeatures: (properties) => toolbox.poly_vs_line(properties)
                    }
                )


                toolbox.fix_indoor(openIndoorMachine.indoor_data)
                toolbox.openindoorize(openIndoorMachine.indoor_data)

                spinner.style.display = "none";

                // Manage available levels
                let levels = [...new Set(openIndoorMachine.floors_data.features.map(
                    feature => {
                        return parseInt(feature.properties.min_level) || 0;
                    }
                ))].sort(function(a, b) {
                    return a - b;
                })
                openIndoorMachine.controls.setLevels(levels)

                self.map.getSource("shape_source").setData(openIndoorMachine.floors_data);
                let buggy = openIndoorMachine.floors_data.features.filter(feat_ => (feat_.properties == null || feat_.properties.min_level == null));
                console.error('buggy:', buggy);
                self.map.getSource("indoor_source").setData(openIndoorMachine.indoor_data);

                self.loadingId = undefined

                // Disable other buildings
                // self.map.setLayoutProperty("building-footprint", 'visibility', 'none')
                for (let layer_ of openIndoorMachine.building_layers) {
                    if (self.map.getLayer(layer_.id) !== undefined)
                        self.map.setLayoutProperty(layer_.id, 'visibility', 'none')
                }
                self.map.setLayoutProperty("pins-layer", 'visibility', 'none')

                openIndoorMachine.setFeatureState({
                    source: 'footprint',
                    id: openIndoorMachine.building_state.clickedBuildingId
                }, {
                    click: false
                })

                openIndoorMachine.setLevel(levels[levels.length - 1])
                if (levels.length === 1) {
                    openIndoorMachine.setState(openIndoorMachine.indoor_state)
                } else {
                    openIndoorMachine.setState(openIndoorMachine.floor_state)
                }
            })
        }

        // Deactivate building selection
        disable()


    }
    on_floor_selected() {}
    on_indoor_POI_selected() {}
}

class Floor extends Abstractmachine {

    constructor(map) {
        super(map);
        this.map = map;
        this.flying = false;
        this.pitch_old = map.getPitch()
        this.hovered = {
            feature: undefined
        }
        this.oldFloorId = undefined;
        this.oldLevel = undefined
        this.hoveredLevel = undefined
        this.on_pitch_e = this.on_pitch_e.bind(this);
    }

    // on_set_indoor_level_action({ level }) {
    //     openIndoorMachine.setState(indoor_state);
    // }

    on_change_level_action({ level }) {
        let self = this;
        let feature = {
            type: "Feature",
            properties: {
                min_level: level
            }
        }
        return {
            before: () => {
                // Unselect previous level
                console.log('unselect previous level')
                this.unselect({ next_feature: feature })
            },
            after: () => {
                console.log('select level:', feature.properties.min_level)
                this.set_hover(feature)
            }
        }

    }
    set_hover(hover_feature) {
        this.hovered.type = 'floor'
        this.hovered.feature = hover_feature
        let level = openIndoorMachine.getLevel();
        let level_features = openIndoorMachine.indoor_data.features.filter(function(feature) {
            return (
                feature.properties.min_level >= level &&
                feature.properties.min_level < (level + 1)
            )
        })
        for (let feature of level_features) {
            openIndoorMachine.setFeatureState({
                source: 'shape_source',
                id: feature.id
            }, {
                hover: true
            })
        }
    }

    on_pitch_e(e) {
        // let pitch = this.map.getPitch();
        // if (this.pitch_old <= 60 && pitch > 60) {
        //     console.log('remove raster !')
        //     this.map.setPaintProperty("simple-tiles", "raster-opacity", 0)
        // } else if (this.pitch_old > 60 && pitch <= 60) {
        //     console.log('display raster !')
        //     this.map.setPaintProperty("simple-tiles", "raster-opacity", 1)
        // }
        // this.pitch_old = pitch;
    }

    do() {
        let self = this;
        this.map.off('pitch', openIndoorMachine.indoor_state.on_pitch_e);
        this.map.on('pitch', this.on_pitch_e);

        console.log('Switch to Floor State !')

        this.map.setMaxPitch(85);
        openIndoorMachine.indoor_state.disable_display_info();

        openIndoorMachine.controls.activateLevelControl();

        openIndoorMachine.controls.enable_building_button();
        openIndoorMachine.controls.disable_floor_button();
        openIndoorMachine.controls.disable_indoor_button();
        openIndoorMachine.controls.switch_to_building_geocoder();

        // Enable raster tiles
        this.map.setPaintProperty("simple-tiles", "raster-opacity", 1)

        // Enable floors
        this.map.setLayoutProperty("shape-area-extrusion-indoor-00", 'visibility', 'visible')

        // Disable building
        // this.map.setLayoutProperty("building-footprint", 'visibility', 'none')
        for (let layer of openIndoorMachine.building_layers) {
            this.map.setLayoutProperty(layer.id, "visibility", "none")
        }
        this.map.setLayoutProperty("pins-layer", 'visibility', 'none')

        // Enable indoor
        for (let layer of openIndoorMachine.indoor_layers) {
            this.map.setLayoutProperty(layer.id, "visibility", "none")
        }

        this.map.setMaxZoom(24);

        let on_floor_hover_e = (e) => {
            if (!('features' in e && e.features.length > 0))
                return;

            let feature = e.features[0];
            self.on_floor_hover({
                feature: feature
            })
        }
        this.map.on(
            'mousemove',
            'shape-area-extrusion-indoor-00',
            on_floor_hover_e
        );

        let on_floor_click_e = (e) => {
            if (!('features' in e && e.features.length > 0))
                return;

            let feature = e.features[0];
            self.on_floor_selected({
                feature: feature,
                disable: () => this.map.off(
                    'mousemove',
                    'shape-area-extrusion-indoor-00',
                    on_floor_click_e
                )
            })
        }
        this.map.on(
            'click',
            'shape-area-extrusion-indoor-00',
            on_floor_click_e
        );
    }

    unselect({ next_feature }) {
        console.log('unselect !!!')

        let level = openIndoorMachine.getLevel();
        let oldLevel_features = openIndoorMachine.indoor_data.features.filter(
            function(feature) {
                return (feature.properties.min_level >= level) &&
                    (feature.properties.min_level < level + 1)
            }
        )

        console.log('unselecting level:', level)

        for (let feature of oldLevel_features) {
            openIndoorMachine.setFeatureState({
                source: 'shape_source',
                id: feature.id
            }, {
                hover: false
            })
        }
    }

    on_floor_hover({ feature }) {
        self = this;
        // Remove all hovereds for the last hovered level
        if (!(
                ('properties' in feature) &&
                'id' in feature &&
                'min_level' in feature.properties
            ))
            return

        // console.log('feature:', feature)
        if (
            this.hovered.feature !== undefined &&
            parseInt(feature.properties.min_level) !== parseInt(this.hovered.feature.properties.min_level)
        ) {
            this.unselect({ next_feature: feature })
        }
        // console.log('hover for min_level:', feature.properties.min_level)

        openIndoorMachine.setLevel(parseInt(feature.properties.min_level))
        this.set_hover(feature)

    }
    on_building_selected({ feature }) {
        console.log("feature:", feature)
    }

    on_floor_selected({ feature }) {
        let center = centroid(feature).geometry.coordinates
        if (this.hovered.feature == null)
            return;
        console.log('click on level:', parseInt(this.hovered.feature.properties.min_level))
        this.map.setMaxZoom(24);

        this.map.flyTo({
            center: center,
            zoom: 20
        })
        this.flying = true;

        openIndoorMachine.setState(openIndoorMachine.indoor_state)


    }
    on_indoor_POI_selected() {}
}

class Indoor extends Abstractmachine {

    constructor(map) {
        super(map);
        this.map = map;
        this.on_pitch_e = this.on_pitch_e.bind(this);

        this.feature_id_init = undefined;
        this.feature_key = "id";

        this.hovered = {
            feature: undefined
        }
        this.popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false
        });
        // let routing = openIndoorMachine.routing;
        // routing.set_start_dragend(this.routing);
        let self = this;
        this.on_indoor_click_e = (e) => {
            console.log('on_indoor_click_e:', e);
            const features = this.map.queryRenderedFeatures(e.point);
            self.mark(self, features, e.lngLat);
        }
        this.on_indoor_hover_e = (e) => {
            // console.log('mousemove');
            if (this.map.queryRenderedFeatures(e.point).length > 0) {
                this.map.getCanvas().style.cursor = 'pointer';
            } else {
                this.map.getCanvas().style.cursor = '';
            }
        }
        this.do = this.do.bind(this);
        this.do_routing_start = this.do_routing_start.bind(this);
        this.do_routing_stop = this.do_routing_stop.bind(this);
    }

    mark(self, features, lngLat) {
        self.remove_info()
        let coordinates = [lngLat.lng, lngLat.lat];
        if (!openIndoorMachine.routing.is_stop_defined()) {
            self.do_routing_stop(coordinates);
        } else {
            self.do_routing_start(coordinates);
        }
        if (features.length > 0) {

            console.log('try to display !')
            console.log('features:', features);
            if (features[0].properties != null
                // &&
                // (features[0].properties.name != null || features[0].properties.ref != null)
            ) {
                self.display_info(features[0], coordinates);
            }
        }

    }
    set_feature(feature_key, feature_id) {
        this.feature_key = feature_key;
        this.feature_id_init = feature_id;
        console.log('this.feature_id_init :', this.feature_id_init);
    }

    do_routing_start(coordinates) {
        console.log("do_routing_start");
        console.log('do_routing_start - coordinates:', coordinates);
        this.do_routing(coordinates, 'start');
    }
    do_routing_stop(coordinates) {
        this.do_routing(coordinates, 'stop');
    }

    routing_reset() {
        openIndoorMachine.routing.reset();
    }

    do_routing(coordinates, start_stop) {
        console.log("level:", openIndoorMachine.getLevel());
        let routing = openIndoorMachine.routing;
        let ways = {
            "type": "FeatureCollection",
            "features": openIndoorMachine.indoor_data.features.filter(
                (feat_) => {
                    return (
                        feat_.properties != null &&
                        feat_.properties.highway === "footway" &&
                        (parseInt(feat_.properties.level) === openIndoorMachine.getLevel() || (openIndoorMachine.getLevel() === 0 && feat_.properties.level == null))
                    )
                }
            )
        };
        console.log('ways:', ways);
        routing.set_ways(ways);
        routing.set_obstacles({
            "type": "FeatureCollection",
            "features": openIndoorMachine.indoor_data.features.filter(
                feat_ =>
                feat_.properties != null &&
                (feat_.properties.indoor === "room" || feat_.properties.indoor === "wall") &&
                feat_.geometry.type === "Polygon"
            )
        });
        // routing.remove_start();
        // routing.set_closest_point(coordinates);
        if (start_stop === 'start') {
            routing.set_start(coordinates);
        } else {
            routing.set_stop(coordinates);
        }
    }

    display_info(feature, coordinates) {
        let modal = openIndoorMachine.modal;
        if (modal != null) {
            openIndoorMachine.modal.open().setHTML(
                Info.get_description(feature, coordinates)
            );
        }
        let popup = openIndoorMachine.popup;
        console.log('popup:', popup);
        if (popup != null) {
            let description = Info.get_description(feature, coordinates);
            console.log('description:', description);
            if (description) {
                openIndoorMachine.popup.open(feature).setHTML(description);
            }
        }
    }

    remove_info() {
        let modal = openIndoorMachine.modal;
        if (modal != null) {
            openIndoorMachine.modal.close();
        }
        let popup = openIndoorMachine.popup;
        if (popup != null) {
            openIndoorMachine.popup.close();
        }
    }

    disable_display_info() {
        this.remove_info();
        let self = this;
        this.map.off(
            'click',
            self.on_indoor_click_e
        );
        this.map.off(
            'mousemove',
            self.on_indoor_hover_e
        );

    }

    on_change_level_action({ level }) {
        let self = this;
        let feature = {
            type: "Feature",
            properties: {
                min_level: level
            }
        }
        return {
            before: () => {},
            after: () => {
                this.filter_on_level({
                    level_min: level,
                    level_max: level + 1
                });
                // Remove routing markers
                console.log('Remove routing markers');
                self.routing_reset();
            }
        }
    }


    filter_on_level({ level_min, level_max }) {
        for (let layer of JSON.parse(JSON.stringify(openIndoorMachine.indoor_layers))) {
            layer.filter = [
                "all",
                layer.filter, [
                    ">=", [
                        "to-number", [
                            "get",
                            "max_level"
                        ]
                    ],
                    level_min
                ],
                [
                    "<", [
                        "to-number", [
                            "get",
                            "min_level"
                        ]
                    ],
                    level_max
                ]
            ].filter(filter => filter !== undefined)
            if (this.map.getLayer(layer.id) != null)
                this.map.setFilter(layer.id, layer.filter)
        }

    }
    on_pitch_e(e) {
        // let pitch = this.map.getPitch();
        // if (this.pitch_old <= 60 && pitch > 60) {
        //     console.log('remove raster !')
        //     this.map.setPaintProperty("simple-tiles", "raster-opacity", 0)
        // } else if (this.pitch_old > 60 && pitch <= 60) {
        //     console.log('display raster !')
        //     this.map.setPaintProperty("simple-tiles", "raster-opacity", 1)
        // }
        // this.pitch_old = pitch;
    }

    do() {
        let self = this;
        this.map.off('pitch', openIndoorMachine.floor_state.on_pitch_e);
        this.map.on('pitch', this.on_pitch_e);

        this.map.setMaxZoom(24);

        this.map.setMaxPitch(85);
        openIndoorMachine.controls.enable_building_button();
        openIndoorMachine.controls.enable_floor_button();
        openIndoorMachine.controls.disable_indoor_button();
        openIndoorMachine.controls.switch_to_indoor_geocoder();

        // Enable indoor layout
        for (let layer of openIndoorMachine.indoor_layers) {
            if (this.map.getLayer(layer.id) != null)
                this.map.setLayoutProperty(layer.id, "visibility", "visible")
        }

        let level = openIndoorMachine.getLevel()
        self.filter_on_level({
            level_min: level,
            level_max: level + 1
        })

        // deactivate shape layout
        if (this.map.getLayer("shape-area-extrusion-indoor-00") != null) {
            this.map.setLayoutProperty("shape-area-extrusion-indoor-00", 'visibility', 'none')
        }

        // deactivate building footprint layout
        // this.map.setLayoutProperty("building-footprint", 'visibility', 'none');
        for (let layer_ of openIndoorMachine.building_layers) {
            if (this.map.getLayer(layer_.id) !== undefined)
                this.map.setLayoutProperty(layer_.id, 'visibility', 'none');
        }

        if (this.map.getLayer("pins-layer") != null) {
            this.map.setLayoutProperty("pins-layer", 'visibility', 'none')
        }

        let flyend = (e) => {
            if (!self.flying)
                return
            self.map.off('moveend', flyend);
            self.flying = false;
        }

        this.map.on('moveend', flyend);

        this.map.on('sourcedata', (mde) => {
            // console.log('mde:', mde);
            // console.log('self.feature_id_init:', self.feature_id_init);
            if (!(mde.sourceId === "indoor_source" &&
                    mde.isSourceLoaded &&
                    mde.source.type === "geojson" &&
                    mde.source.data != null &&
                    mde.source.data.features != null &&
                    self.feature_id_init != null
                )) {
                return;
            }
            console.log('map_data_event:', mde);
            let features = mde.source.data.features;
            let my_feature = features.find(
                feat_ =>
                feat_.properties != null &&
                feat_.properties[self.feature_key] === self.feature_id_init
            );
            console.log('my_feature:', my_feature);
            if (my_feature == null) {
                return
            }
            let feature_id = self.feature_id_init;
            let my_centroid = centroid(my_feature).geometry.coordinates;
            self.mark(
                self, [my_feature], {
                    lng: my_centroid[0],
                    lat: my_centroid[1],
                }
            );
            // map.setCenter(my_centroid[0], my_centroid[1]);
            // map.setZoom(21);
            self.map.jumpTo({
                center: [my_centroid[0], my_centroid[1]],
                zoom: 21
            })

            // self.on_indoor_click_e({
            //     point: "",
            // })
            self.feature_id_init = undefined;
        });

        this.map.on(
            'click',
            self.on_indoor_click_e
        );
        this.map.on(
            'mousemove',
            self.on_indoor_hover_e
        );

        for (let layer of openIndoorMachine.indoor_layers.filter(
                layer_ => (
                    layer_.type === "line" ||
                    layer_.type === "fill-extrusion"
                )
            )) {
            this.map.on(
                'mousemove',
                layer.id,
                (e) => {
                    if ('features' in e && e.features.length > 0) {
                        let feature = e.features[0]
                            // console.log('feature:', feature)
                        self.on_indoor_hover({ feature: feature })
                    }
                }
            );
        }
    }

    unselect({ next_feature }) {
        // Invalidate other hovered
        if (this.hovered.feature !== undefined &&
            this.hovered.feature.id !== undefined &&
            this.hovered.feature.id !== next_feature.id) {

            openIndoorMachine.setFeatureState({
                source: "indoor_source",
                id: this.hovered.feature.id
            }, {
                hover: false
            })
        }
    }
    on_indoor_hover({ feature }) {

        if (!('properties' in feature))
            return;

        this.unselect({ next_feature: feature })

        this.hovered.feature = feature

        openIndoorMachine.setFeatureState({
            source: "indoor_source",
            id: this.hovered.feature.id
        }, {
            hover: true
        })
    }
    on_building_selected({ feature: {} }) {}
    on_floor_selected() {}
    on_indoor_POI_selected() {}
}

// Indoor.flying = false;
Indoor.zoom = 20

let openIndoorMachine = undefined;
// let building_state = undefined;
// let floor_state = undefined;
// let indoor_state = undefined;

let spinner = document.createElement('div');
spinner.className = 'lds-spinner';

for (let i = 0; i < 12; i++) {
    spinner.appendChild(document.createElement('div'));
}

spinner.addEventListener('click', function() {
    window.alert(marker.properties.message);
});

let spinner_marker = new maplibregl.Marker(spinner)

function openindoor_machine(map, options) {
    // this.map = map
    spinner_marker
        .setLngLat([0, 0])
        .addTo(map);
    spinner.style.visibility = "hidden";

    // building_state = new Building(map)
    // floor_state = new Floor(map);
    // indoor_state = new Indoor(map);

    openIndoorMachine = new machine(map, options);

    openIndoorMachine.do();
    return openIndoorMachine;
}

export default openindoor_machine;