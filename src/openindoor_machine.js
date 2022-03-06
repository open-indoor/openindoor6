import osmtogeojson from 'osmtogeojson/osmtogeojson.js';
import default_indoor_layers from './layers/indoor.json';
import footprint_layers from './layers/footprint.json';
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

    static singleton = undefined;
    static get_singleton(map, modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter) {

        if (machine.singleton === undefined)
            machine.singleton = new machine(map, modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter);
        return machine.singleton;
    }
    static indoor_layers = JSON.parse(JSON.stringify(default_indoor_layers))

    constructor(map, modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter) {
        super(map);
        this.modal = modal;
        this.popup = popup;
        this.routing = routing;
        this.state = building_state;
        Info.data = info;
        this.data_mode = "online"
        this.pitch_old = map.getPitch();
        this.init_mode = "building_state";
        this.layer = "default";

        machine.controls = new Controls(map, machine, feedback_control, info_control, mode_control, search_keys, search_filter);
        let self = this;
        // machine.controls.on_building_geocoder_result((e) => {
        //     console.log('building_geocoder_result !');
        //     self.setState(building_state);
        // })
        machine.controls.set_on_geolocate_update((geolocate_e) => {
            console.log('geolocate_e:', geolocate_e);

            // let routing = machine.get_singleton().routing;

            indoor_state.do_routing_start([
                geolocate_e.coords.longitude,
                geolocate_e.coords.latitude,
            ]);
        });

        machine.controls.set_on_indoor_button_pushed(() => {
            self.setState(indoor_state)
        });
        machine.controls.set_on_floor_button_pushed(() => {
            self.setState(floor_state)
        });
        machine.controls.set_on_building_button_pushed(() => {
            self.setState(building_state)
        })
        machine.controls.set_change_level_action(({ level }) => {
            if (openIndoorMachine.getState().constructor.name === floor_state.constructor.name) {
                return floor_state.on_change_level_action({ level });
            } else if (openIndoorMachine.getState().constructor.name === indoor_state.constructor.name) {
                return indoor_state.on_change_level_action({ level });
            }
        });

        machine.controls.set_indoor_level_action(({ level }) => {
            if (openIndoorMachine.getState().constructor.name === floor_state.constructor.name) {
                // return floor_state.on_set_indoor_level_action({ level });
                // on_set_indoor_level_action({ level }) {
                machine.get_singleton().setState(indoor_state);
                indoor_state.on_change_level_action({ level });
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

        routing.set_start_dragend(indoor_state.do_routing_start);
        routing.set_stop_dragend(indoor_state.do_routing_stop);
    }

    static setLevel(level) {
        machine.controls.setLevel(level)
    }
    static getLevel(level) {
        return machine.controls.getLevel()
    }

    // get_indoor_data() {
    //     return machine.indoor_data;
    // }

    mark(features, lngLat) {
        indoor_state.mark(indoor_state, features, lngLat);
    }

    do() {
        this.state.do()
    }

    setFloorState() {
        this.setState(floor_state);
    }
    set_indoor_state() {
        this.setState(indoor_state);
    }
    setState(state) {
        if (state === building_state) {
            machine.controls.switch_to_building_geocoder();
        } else {
            machine.controls.switch_to_indoor_geocoder();
        }

        this.state = state
        this.state.do()
    }
    getState() {
        return this.state;
    }

    is_building_state() {
        return this.state === building_state;
    }

    is_floor_state() {
        return this.state === floor_state;
    }

    is_indoor_state() {
        return this.state === indoor_state;
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
            openIndoorMachine.getState().constructor.name === building_state.constructor.name) {
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
            machine.map.setFeatureState(feature_ref, property);
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
    set_layer(layer) {
        // load layer files
        // import indoor_layers from './layers/indoor.json';
        let layer_url = undefined;
        if (layer.match(/\.json$/i)) {
            layer_url = layer;
            this._set_layer(layer_url, { set_default: true });
        } else {
            for (let mode_ of["indoor"]) {
                layer_url = 'https://app.openindoor.io/layer/' + mode_ + '-' + layer + '.json';
                this._set_layer(layer_url, { set_default: true });
            }
        }
        // fire
        // machine.get_singleton().getState().set_layer(layer);
    }

    set_default_layer() {
        for (let layer of machine.indoor_layers) {
            machine.map.removeLayer(layer.id);
        }
        machine.indoor_layers = default_indoor_layers;
        for (let layer of machine.indoor_layers) {
            machine.map.addLayer(layer);
        }
    }

    _set_layer(layer_url, option = { set_default: false }) {
        let indoor_layers_ = undefined;
        fetch(layer_url).then(function(response) {
            var contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(function(json) {
                    console.log('json style:', json);
                    indoor_layers_ = json;
                    if (indoor_layers_ != null) {
                        for (let layer of machine.indoor_layers) {
                            // console.log('remove:', layer.id);
                            if (machine.map.getLayer(layer.id) != null) {
                                machine.map.removeLayer(layer.id);
                            }
                        }
                        if (option.set_default) {
                            default_indoor_layers = indoor_layers_;
                        }
                        machine.indoor_layers = indoor_layers_;
                        for (let layer of machine.indoor_layers) {
                            // console.log('load:', layer.id);
                            machine.map.addLayer(layer);
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
            machine.map,
            indoor_data, {
                icon_tags: options.icon_tags
            }
        );

        openIndoorMachine.data_mode = "drag_n_drop"

        machine.floors_data = floor_data;
        machine.indoor_data = indoor_data;
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
        for (let layer of footprint_layers) {
            if (machine.map.getLayer(layer.id) === undefined)
                continue;
            machine.map.removeLayer(layer.id);
        }
        machine.map.removeSource('footprint');
        machine.map.addSource('footprint', {
            "type": "geojson",
            "data": building_data
        });
        for (let layer of footprint_layers) {
            if (machine.map.getLayer(layer.id) !== undefined)
                continue;
            delete layer["source-layer"];
            machine.map.addLayer(layer);
        }
        // Set floor data
        machine.map.getSource("shape_source").setData(machine.floors_data);

        // Set indoor data
        machine.map.getSource("indoor_source").setData(machine.indoor_data);
        let center = centroid(machine.floors_data).geometry.coordinates;
        console.log('center:', center);
        machine.map.jumpTo({
            center: center,
            zoom: 16,
        });
        if (machine.get_singleton().init_mode === "indoor_state") {
            if (options.feature_key != null && options.feature_id != null)
                indoor_state.set_feature(options.feature_key, options.feature_id);
            openIndoorMachine.setState(indoor_state);
        } else {
            openIndoorMachine.setState(building_state);
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


machine.controls = undefined;
machine.floors_data = undefined;
machine.indoor_data = undefined;
machine.map = undefined;
machine.INDOOR_LAYER = undefined;

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
    }

    do() {
        let self = this
            // machine.map.off('pitch', openIndoorMachine.on_pitch());



        machine.map.off('pitch', indoor_state.on_pitch_e);
        machine.map.off('pitch', floor_state.on_pitch_e);

        indoor_state.disable_display_info();
        console.log('Reset routing');
        indoor_state.routing_reset();

        machine.map.setMaxPitch(60);

        machine.controls.disable_building_button();
        machine.controls.disable_floor_button();
        machine.controls.disable_indoor_button();

        machine.controls.deactivateLevelControl();

        // machine.controls.enable_building_geocoder();
        // machine.controls.disable_indoor_geocoder();

        machine.map.setMaxZoom(19);
        machine.map.setMinZoom(0);
        if (machine.map.getZoom() > 19) {

        }

        // Enable raster tiles
        if (machine.map.getLayer("simple-tiles") !== undefined)
            machine.map.setPaintProperty("simple-tiles", "raster-opacity", 1)


        // Enable buildings
        if (machine.map.getLayer("building-footprint") !== undefined) {
            machine.map.setLayoutProperty("building-footprint", 'visibility', 'visible')
            machine.map.setLayoutProperty("pins-layer", 'visibility', 'visible')
        }

        // Disable floors
        if (machine.map.getLayer("shape-area-extrusion-indoor-00") !== undefined)
            machine.map.setLayoutProperty("shape-area-extrusion-indoor-00", 'visibility', 'none')

        // Disable indoor
        for (let layer_ of machine.indoor_layers) {
            if (machine.map.getLayer(layer_.id) !== undefined)
                machine.map.setLayoutProperty(layer_.id, 'visibility', 'none')
        }

        machine.map.on(
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
                    machine.map.off(
                        'click',
                        'building-footprint',
                        on_building_click_e
                    )
                }
            })
        }
        machine.map.on('click', 'building-footprint', on_building_click_e);

        let on_pins_over_e = (e) => {
            if (!('features' in e && e.features.length > 0))
                return
            let feature = e.features[0]
            self.on_pins_over({
                feature: feature,
                disable: () => {
                    machine.map.off(
                        'click',
                        'pins-layer',
                        on_pins_over_e
                    )
                }
            })
        }
        machine.map.on('click', 'pins-layer', on_pins_over_e)
    }

    on_pins_hover({ pins_feature }) {
        if ('id' in pins_feature && pins_feature.id !== building_state.oldTextId) {
            if (building_state.oldTextId !== undefined) {
                openIndoorMachine.setFeatureState({
                    source: 'pins',
                    id: building_state.oldTextId,
                    property: {
                        hover: false
                    }
                })
            }
            building_state.hoveredPinsId = pins_feature.id;
            // console.log('active:', hoveredPinsId)
            openIndoorMachine.setFeatureState({
                source: 'pins',
                id: building_state.hoveredPinsId,
                property: {
                    hover: true
                }
            })
            building_state.oldTextId = building_state.hoveredPinsId;
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
        building_state.unselect({ next_feature: feature })

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
        if (
            feature.properties != null &&
            feature.properties.building != null &&
            feature.properties.building != "no" &&
            feature.properties.shop != null &&
            feature.properties.shop === "mall"
        ) {
            console.log('set mall layer !')
            machine.get_singleton()._set_layer('/layer/indoor-mall.json', { set_default: false });
        } else {
            console.log('back to default layer !')
            machine.get_singleton().set_default_layer();
        }

        if (building_state.loadingId != undefined) {
            return
        }

        this.selected = feature
        let selectedBuilding = feature

        console.log("selectedBuilding:", selectedBuilding)
        if (building_state.oldClickedBuildingId !== undefined) {
            openIndoorMachine.setFeatureState({
                source: 'footprint',
                id: building_state.oldClickedBuildingId,
                property: {
                    click: false
                }
            })
        }

        building_state.clickedBuildingId = selectedBuilding.id;

        openIndoorMachine.setFeatureState({
            source: 'footprint',
            id: building_state.clickedBuildingId
        }, {
            click: true
        })

        building_state.oldClickedBuildingId = building_state.clickedBuildingId;

        if (openIndoorMachine.data_mode === "drag_n_drop") {

            let levels = [...new Set(machine.floors_data.features.map(
                feature => {
                    return parseInt(feature.properties.min_level) || 0;
                }
            ))].sort(function(a, b) {
                return a - b;
            })
            machine.controls.setLevels(levels)

            machine.setLevel(levels[levels.length - 1])
            if (levels.length === 1) {
                openIndoorMachine.setState(indoor_state)
            } else {
                openIndoorMachine.setState(floor_state)
            }
            // machine.controls.disable_building_geocoder();

        } else {
            building_state.loadingId = building_state.clickedBuildingId

            let my_building = convex(selectedBuilding);

            console.log('convex:', my_building)


            let bb = bbox(my_building)
            console.log('bbox:', bb)
            machine.map.fitBounds([
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
            let self = building_state;

            let center = centroid(my_building).geometry.coordinates
            console.log('center:', center)

            spinner_marker.setLngLat(center)
            spinner.style.display = "block";
            spinner.style.visibility = "visible";

            let my_geojson = fetch("https://overpass-api-world.openindoor.io/api/interpreter", {
                method: 'POST',
                body: request
            }).then(function(response) {

                if (response.ok) {
                    return response.json();
                } else {
                    console.log('Status:', response.status);
                }
            }).then(function(json) {
                console.log("Reply received !")

                // floors data
                machine.floors_data = osmtogeojson(
                    json, {
                        flatProperties: true,
                        polygonFeatures: function(properties) {
                            if (properties == null || (properties.highway != null && properties.highway === 'footway'))
                                return false
                            return true
                        }

                    }
                )
                toolbox.fix_indoor(machine.floors_data)

                // indoor data as:
                // false: LineString
                // true: Polygon
                machine.indoor_data = osmtogeojson(
                    json, {
                        flatProperties: true,
                        polygonFeatures: (properties) => toolbox.poly_vs_line(properties)
                    }
                )

                toolbox.fix_indoor(machine.indoor_data)
                toolbox.openindoorize(machine.indoor_data)

                spinner.style.display = "none";

                // Manage available levels
                let levels = [...new Set(machine.floors_data.features.map(
                    feature => {
                        return parseInt(feature.properties.min_level) || 0;
                    }
                ))].sort(function(a, b) {
                    return a - b;
                })
                machine.controls.setLevels(levels)

                console.log('floors_data:', machine.floors_data)
                console.log('indoor_data:', machine.indoor_data)
                machine.map.getSource("shape_source").setData(machine.floors_data);
                let buggy = machine.floors_data.features.filter(feat_ => (feat_.properties == null || feat_.properties.min_level == null));
                console.error('buggy:', buggy);
                machine.map.getSource("indoor_source").setData(machine.indoor_data);

                // let footway = {
                //     "type": "FeatureCollection",
                //     "features": machine.indoor_data.features.filter(
                //         feat_ => (
                //             feat_.properties.min_level === 1 &&
                //             feat_.properties != null &&
                //             feat_.properties.highway === "footway")
                //     )
                // };
                // console.log('footway:', footway);

                // machine.map.getSource("indoor_flat_source").setData(machine.indoor_data);

                self.loadingId = undefined
                    // Disable other buildings
                machine.map.setLayoutProperty("building-footprint", 'visibility', 'none')
                machine.map.setLayoutProperty("pins-layer", 'visibility', 'none')

                openIndoorMachine.setFeatureState({
                    source: 'footprint',
                    id: building_state.clickedBuildingId
                }, {
                    click: false
                })

                machine.setLevel(levels[levels.length - 1])
                if (levels.length === 1) {
                    openIndoorMachine.setState(indoor_state)
                } else {
                    openIndoorMachine.setState(floor_state)
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
        this.pitch_old = map.getPitch()
        this.hovered = {
            feature: undefined
        }
        this.oldFloorId = undefined;
        this.oldLevel = undefined
        this.hoveredLevel = undefined
    }

    // on_set_indoor_level_action({ level }) {
    //     machine.get_singleton().setState(indoor_state);
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
                floor_state.unselect({ next_feature: feature })
            },
            after: () => {
                console.log('select level:', feature.properties.min_level)
                floor_state.set_hover(feature)
            }
        }

    }
    set_hover(hover_feature) {
        this.hovered.type = 'floor'
        this.hovered.feature = hover_feature
        let level = machine.getLevel();
        let level_features = machine.indoor_data.features.filter(function(feature) {
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

    // on_pitch() {
    //     let pitch = machine.map.getPitch();
    //     console.log('managing pitch...')
    //     if (self.pitch_old <= 60 && pitch > 60) {
    //         console.log('remove raster !')

    //         machine.map.setPaintProperty("simple-tiles", "raster-opacity", 0)
    //     } else if (self.pitch_old > 60 && pitch <= 60) {
    //         console.log('display raster !')

    //         machine.map.setPaintProperty("simple-tiles", "raster-opacity", 1)
    //     }
    //     self.pitch_old = pitch;
    // };
    on_pitch_e = (e) => {
        let pitch = machine.map.getPitch();
        if (this.pitch_old <= 60 && pitch > 60) {
            console.log('remove raster !')
            machine.map.setPaintProperty("simple-tiles", "raster-opacity", 0)
        } else if (this.pitch_old > 60 && pitch <= 60) {
            console.log('display raster !')
            machine.map.setPaintProperty("simple-tiles", "raster-opacity", 1)
        }
        this.pitch_old = pitch;
    }

    do() {
        let self = this;
        machine.map.off('pitch', indoor_state.on_pitch_e);
        machine.map.on('pitch', floor_state.on_pitch_e);

        console.log('Switch to Floor State !')

        machine.map.setMaxPitch(85);
        indoor_state.disable_display_info();

        machine.controls.activateLevelControl();

        machine.controls.enable_building_button();
        machine.controls.disable_floor_button();
        machine.controls.disable_indoor_button();

        // machine.map.setMaxZoom(24);

        // let bb = bbox(machine.floors_data)
        // console.log('bbox:', bb)
        // machine.map.fitBounds([
        //     [bb[0], bb[1]],
        //     [bb[2], bb[3]],
        // ], {
        //     padding: { top: 100, bottom: 100, left: 100, right: 100 },
        //     mazZoom: 18
        // })

        // Enable raster tiles
        machine.map.setPaintProperty("simple-tiles", "raster-opacity", 1)

        // Enable floors
        machine.map.setLayoutProperty("shape-area-extrusion-indoor-00", 'visibility', 'visible')

        // Disable building
        machine.map.setLayoutProperty("building-footprint", 'visibility', 'none')
        machine.map.setLayoutProperty("pins-layer", 'visibility', 'none')

        // Enable indoor
        for (let layer of machine.indoor_layers) {
            machine.map.setLayoutProperty(layer.id, "visibility", "none")
        }

        machine.map.setMaxZoom(24);

        let on_floor_hover_e = (e) => {
            if (!('features' in e && e.features.length > 0))
                return;

            let feature = e.features[0];
            self.on_floor_hover({
                feature: feature
            })
        }
        machine.map.on(
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
                disable: () => machine.map.off(
                    'mousemove',
                    'shape-area-extrusion-indoor-00',
                    on_floor_click_e
                )
            })
        }
        machine.map.on(
            'click',
            'shape-area-extrusion-indoor-00',
            on_floor_click_e
        );
    }

    unselect({ next_feature }) {
        console.log('unselect !!!')

        let level = machine.getLevel();
        let oldLevel_features = machine.indoor_data.features.filter(
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

        machine.setLevel(parseInt(feature.properties.min_level))
            // if (feature.properties.min_level != machine.getLevel())
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
        machine.map.setMaxZoom(24);

        machine.map.flyTo({
            center: center,
            zoom: 20
        })
        Indoor.flying = true;

        openIndoorMachine.setState(indoor_state)


    }
    on_indoor_POI_selected() {}
}

class Indoor extends Abstractmachine {

    constructor(map) {
        super(map);
        this.feature_id_init = undefined;
        this.feature_key = "id";

        this.hovered = {
            feature: undefined
        }
        this.popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false
        });
        // let routing = machine.get_singleton().routing;
        // routing.set_start_dragend(this.routing);
        let self = this;
        this.on_indoor_click_e = (e) => {
            console.log('on_indoor_click_e:', e);
            const features = machine.map.queryRenderedFeatures(e.point);
            self.mark(self, features, e.lngLat);
        }
        this.on_indoor_hover_e = (e) => {
            // console.log('mousemove');
            if (machine.map.queryRenderedFeatures(e.point).length > 0) {
                machine.map.getCanvas().style.cursor = 'pointer';
            } else {
                machine.map.getCanvas().style.cursor = '';
            }
        }
    }

    mark(self, features, lngLat) {
        self.remove_info()
        if (features.length > 0) {
            let coordinates = [lngLat.lng, lngLat.lat];
            let routing = machine.get_singleton().routing;
            if (!routing.is_start_defined()) {
                self.do_routing_start(coordinates);
            } else {
                self.do_routing_stop(coordinates);
            }

            // var marker = new maplibregl.Marker()
            //     .setLngLat(route.get_start().geometry.coordinates)
            //     .addTo(machine.map);
            self.display_info(features[0], coordinates);
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
        indoor_state.do_routing(coordinates, 'start');
    }
    do_routing_stop(coordinates) {
        indoor_state.do_routing(coordinates, 'stop');
    }

    routing_reset() {
        machine.get_singleton().routing.reset();
        if (machine.map.getLayer('route') != null) {
            machine.map.removeLayer('route');
        }
    }

    do_routing(coordinates, start_stop) {
        console.log("level:", machine.getLevel());
        let routing = machine.get_singleton().routing;
        let ways = {
            "type": "FeatureCollection",
            "features": machine.indoor_data.features.filter(
                (feat_) => {
                    return (
                        feat_.properties != null &&
                        feat_.properties.highway === "footway" &&
                        (parseInt(feat_.properties.level) === machine.getLevel() || (machine.getLevel() === 0 && feat_.properties.level == null))
                    )
                }
            )
        };
        console.log('ways:', ways);
        routing.set_ways(ways);
        routing.set_obstacles({
            "type": "FeatureCollection",
            "features": machine.indoor_data.features.filter(
                feat_ =>
                feat_.properties != null &&
                (feat_.properties.indoor === "room" || feat_.properties.indoor === "wall") &&
                feat_.geometry.type === "Polygon"
            )
        });
        // routing.remove_start();
        // routing.set_closest_point(coordinates);
        if (start_stop === 'start') {
            routing.set_closest_start(coordinates);
        } else {
            routing.set_closest_stop(coordinates);
        }

        if (!routing.is_start_defined() || !routing.is_stop_defined()) {
            return;
        }

        // let path = routing.get_shortest_path();
        let path = routing.get_path();

        console.log("path:", path);
        // Render path here
        let my_source = machine.map.getSource('route');
        if (my_source === undefined) {
            machine.map.addSource('route', {
                'type': 'geojson',
                'data': path
            });
        } else {
            my_source.setData(path)
        }

        let my_layer = machine.map.getLayer('route');
        // if (machine.map.)
        if (my_layer === undefined) {
            machine.map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    "line-opacity": 0.8,
                    "line-dasharray": [2, 2],
                    'line-color': '#4286f4',
                    'line-width': 8
                }
            });
        }

    }

    display_info(feature, coordinates) {
        let modal = machine.get_singleton().modal;
        if (modal != null) {
            machine.get_singleton().modal.open().setHTML(
                Info.get_description(feature, coordinates)
            );
        }
        let popup = machine.get_singleton().popup;
        if (popup != null) {
            let description = Info.get_description(feature, coordinates);
            console.log('description:', description);
            if (description) {
                machine.get_singleton().popup.open(feature).setHTML(description);
            }
        }

        // this.popup.setLngLat(
        //     coordinates
        // ).setHTML(
        //     Info.get_description(feature)
        // ).addTo(machine.map);
    }

    remove_info() {
        let modal = machine.get_singleton().modal;
        if (modal != null) {
            machine.get_singleton().modal.close();
        }
        let popup = machine.get_singleton().popup;
        if (popup != null) {
            machine.get_singleton().popup.close();
        }
    }

    disable_display_info() {
        this.remove_info();
        let self = this;
        machine.map.off(
            'click',
            self.on_indoor_click_e
        );
        machine.map.off(
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
                indoor_state.filter_on_level({
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
        for (let layer of JSON.parse(JSON.stringify(machine.indoor_layers))) {
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
            if (machine.map.getLayer(layer.id) != null)
                machine.map.setFilter(layer.id, layer.filter)

            // activate indoor layout
            // machine.map.setLayoutProperty("indoor-tag", "visibility", "visible")
        }

    }
    on_pitch_e = (e) => {
        let pitch = machine.map.getPitch();
        if (this.pitch_old <= 60 && pitch > 60) {
            console.log('remove raster !')
            machine.map.setPaintProperty("simple-tiles", "raster-opacity", 0)
        } else if (this.pitch_old > 60 && pitch <= 60) {
            console.log('display raster !')
            machine.map.setPaintProperty("simple-tiles", "raster-opacity", 1)
        }
        this.pitch_old = pitch;
    }

    do() {
        let self = this;
        machine.map.off('pitch', floor_state.on_pitch_e);
        machine.map.on('pitch', indoor_state.on_pitch_e);

        // machine.map.on('pitch', openIndoorMachine.on_pitch());
        machine.map.setMaxZoom(24);

        machine.map.setMaxPitch(85);
        machine.controls.enable_building_button();
        machine.controls.enable_floor_button();
        machine.controls.disable_indoor_button();

        // Enable indoor layout
        for (let layer of machine.indoor_layers) {
            if (machine.map.getLayer(layer.id) != null)
                machine.map.setLayoutProperty(layer.id, "visibility", "visible")
        }

        let level = machine.getLevel()
        self.filter_on_level({
            level_min: level,
            level_max: level + 1
        })

        // deactivate shape layout
        if (machine.map.getLayer("shape-area-extrusion-indoor-00") != null) {
            machine.map.setLayoutProperty("shape-area-extrusion-indoor-00", 'visibility', 'none')
        }

        // deactivate building footprint layout
        machine.map.setLayoutProperty("building-footprint", 'visibility', 'none')
        if (machine.map.getLayer("pins-layer") != null) {
            machine.map.setLayoutProperty("pins-layer", 'visibility', 'none')
        }

        let flyend = function(e) {
            if (!Indoor.flying)
                return

            machine.map.off('moveend', flyend);
            Indoor.flying = false;
        }

        machine.map.on('moveend', flyend);

        machine.map.on('sourcedata', (mde) => {
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

            // self.on_indoor_click_e({
            //     point: "",
            // })
            self.feature_id_init = undefined;
        });

        // remove popup on click on default grouns


        // (e) => {
        //     machine.map.getCanvas().style.cursor = '';
        //     self.popup.remove();
        //     // console.log('e:', e);
        //     const features = machine.map.queryRenderedFeatures(e.point);
        //     // console.log('features:', features);
        //     if ('features' in e && e.features.length > 0) {
        //         let feature = e.features[0]
        //             // console.log('feature:', feature)
        //         self.on_indoor_hover({ feature: feature })
        //     }
        // }



        machine.map.on(
            'click',
            self.on_indoor_click_e
        );
        machine.map.on(
            'mousemove',
            self.on_indoor_hover_e
        );

        for (let layer of machine.indoor_layers.filter(
                layer_ => (
                    layer_.type === "line" ||
                    layer_.type === "fill-extrusion"
                )
            )) {
            machine.map.on(
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


            // machine.map.on(
            //     'click',
            //     layer.id,
            //     on_indoor_click_e
            // );
            // machine.map.on('mouseenter', layer.id, function(e) {
            // });
            // machine.map.on('mouseleave', layer.id, function() {});
        }
    }

    unselect({ next_feature }) {
        // Invalidate other hovered
        if (indoor_state.hovered.feature !== undefined &&
            indoor_state.hovered.feature.id !== undefined &&
            indoor_state.hovered.feature.id !== next_feature.id) {

            openIndoorMachine.setFeatureState({
                source: "indoor_source",
                id: indoor_state.hovered.feature.id
            }, {
                hover: false
            })
        }
    }
    on_indoor_hover({ feature }) {

        if (!('properties' in feature))
            return;

        indoor_state.unselect({ next_feature: feature })

        indoor_state.hovered.feature = feature

        openIndoorMachine.setFeatureState({
            source: "indoor_source",
            id: indoor_state.hovered.feature.id
        }, {
            hover: true
        })
    }
    on_building_selected({ feature: {} }) {}
    on_floor_selected() {}
    on_indoor_POI_selected() {}
}

Indoor.flying = false;
Indoor.zoom = 20

let openIndoorMachine = undefined;
let building_state = undefined;
let floor_state = undefined;
let indoor_state = undefined;

let spinner = document.createElement('div');
spinner.className = 'lds-spinner';

for (let i = 0; i < 12; i++) {
    spinner.appendChild(document.createElement('div'));
}

spinner.addEventListener('click', function() {
    window.alert(marker.properties.message);
});

let spinner_marker = new maplibregl.Marker(spinner)

function openindoor_machine(map, modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter) {
    console.log('machine.indoor_layers:', machine.indoor_layers)
    machine.map = map
    spinner_marker
        .setLngLat([0, 0])
        .addTo(machine.map);
    spinner.style.visibility = "hidden";

    building_state = new Building(map)
    floor_state = new Floor(map);
    indoor_state = new Indoor(map);

    openIndoorMachine = machine.get_singleton(map, modal, popup, routing, info, feedback_control, info_control, mode_control, search_keys, search_filter);

    openIndoorMachine.do();
    return openIndoorMachine;
}

export default openindoor_machine;