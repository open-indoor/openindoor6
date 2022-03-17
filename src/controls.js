import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
// import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import center from '@turf/center';
import centroid from '@turf/centroid';


// https://github.com/opening-hours/opening_hours.js/blob/master/examples/simple_index.html
// import OpeningHours from 'opening_hours';

class InfoControl {
    constructor() {
        // this.on_button_pushed = () => {}
    }
    enable() {
        this._info.disabled = false;
    }

    disable() {
        this._info.disabled = true;
    }

    set_message(message) {
        this._info.textContent = message;
    }

    // set_on_button_pushed(e) {
    //     this.on_button_pushed = e
    // }

    onAdd(map) {
        this._map = map;
        let self = this;

        this._info = document.createElement("div");
        this._info.textContent = "Drag and drop here your local indoor data from .osm or .geojson files";
        this._container = document.createElement("div");
        this._container.className = "marquee";
        this._container.appendChild(this._info);
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}



class FeedbackControl {
    constructor({

    }) {

    }


    // setUpAction(up_action) {
    //     this.up_action = up_action
    // }
    // setDownAction(up_action) {
    //     this.down_action = down_action
    // }

    onAdd(map) {
        this._map = map;
        let self = this;

        var b = document.createElement('button');
        b.setAttribute('content', 'test content');
        b.setAttribute('class', 'btn');
        b.textContent = 'test value';

        this._title = document.createTextNode('Give us Feedback:');
        this._title.className = "maplibregl-ctrl-icon maplibregl-ctrl-feedback";
        this._title.type = "button";
        this._title["aria-label"] = "Feedback";

        this._reddit = document.createElement("button");
        this._reddit.className = "maplibregl-ctrl-icon maplibregl-ctrl-reddit";
        // this._reddit.type = "button";
        this._reddit["aria-label"] = "Reddit";

        this._discord = document.createElement("button");
        this._discord.className = "maplibregl-ctrl-icon maplibregl-ctrl-discord";
        // this._discord.type = "button";
        this._discord["aria-label"] = "Discord";
        this._discord.style.fontSize = "72px";
        this._discord.textContent = this._level_number;

        this._linkedin = document.createElement("button");
        this._linkedin.className = "maplibregl-ctrl-icon maplibregl-ctrl-linkedin";
        this._linkedin.type = "button";
        this._linkedin["aria-label"] = "LinkedIn";

        this._github = document.createElement("button");
        this._github.className = "maplibregl-ctrl-icon maplibregl-ctrl-github";
        this._github.type = "button";
        this._github["aria-label"] = "GitHub";

        this._slack = document.createElement("button");
        this._slack.className = "maplibregl-ctrl-icon maplibregl-ctrl-slack";
        this._slack.type = "button";
        this._slack["aria-label"] = "Slack";

        this._reddit.onclick = function() {
            window.open('https://www.reddit.com/r/OpenIndoor/', '_blank').focus();
        }

        this._discord.onclick = function() {
            window.open('https://discord.gg/cDYF69V9', '_blank').focus();
        };

        this._linkedin.onclick = function() {
            window.open('https://www.linkedin.com/company/openindoor/', '_blank').focus();
        };

        this._github.onclick = function() {
            window.open('https://github.com/open-indoor/openindoor6/issues', '_blank').focus();
        };

        this._slack.onclick = function() {
            window.open('https://osmus.slack.com/archives/C02N7ARHUBS', '_blank').focus();
        };

        // this._level.onclick = function() {
        //     self.go_indoor_action
        // }

        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl-group-feedback maplibregl-ctrl-group maplibregl-ctrl";
        // this._container.className = "maplibregl-ctrl-group-feedback maplibregl-ctrl";
        this._container.appendChild(this._title);
        this._container.appendChild(this._reddit);
        this._container.appendChild(this._discord);
        this._container.appendChild(this._linkedin);
        this._container.appendChild(this._github);
        this._container.appendChild(this._slack);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

class PathReset {
    constructor() {
        this.onclick = (e) => {};
    }

    onAdd(map) {
        this._map = map;
        let self = this;

        this._resetButton = document.createElement("button");
        this._resetButton.className = "maplibregl-ctrl-icon maplibregl-ctrl-path-reset";
        this._resetButton.type = "button";
        this._resetButton.disabled = false;
        this._resetButton["aria-label"] = "Reset";
        this._resetButton.onclick = function(e) {
            // console.log("reset:", e);
            self.onclick(e);
        };
        this._container = document.createElement("div");
        this._container.className = 'maplibregl-ctrl-group maplibregl-ctrl';
        this._container.appendChild(this._resetButton);
        return this._container;
    }
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

class LevelControl {
    constructor({
        // bearing = -20,
        pitch = 70,
        minpitchzoom = null,
        // up_action,
        // down_action,
    }) {
        // this._bearing = bearing;
        this._pitch = pitch;
        this._level_number = 0;
        this._levels = [this._level_number];
        this.change_level_action = undefined;
        this.indoor_level_action = undefined;
        // this.up_action = up_action
        // this.down_action = down_action

        // this._minpitchzoom = minpitchzoom;
    }

    setLevel(level) {
        // console.log('set level:', level)
        this._level_number = level;
        if (this._level !== undefined) {
            this._level.textContent = this._level_number;
            // console.log('change level:', this._level_number);
            // console.log('min_level:', Math.min.apply(null, arr));
            // console.log('m_level:', Math.min.apply(null, arr));
        }
    }

    getLevel() {
        return this._level_number;
    }

    setLevels(levels) {
        this._levels = levels;
    }
    set_change_level_action(change_level_action) {
        this.change_level_action = change_level_action
    }
    set_indoor_level_action(indoor_level_action) {
        this.indoor_level_action = indoor_level_action
    }

    // setUpAction(up_action) {
    //     this.up_action = up_action
    // }
    // setDownAction(up_action) {
    //     this.down_action = down_action
    // }

    onAdd(map) {
        this._map = map;
        let self = this;

        var b = document.createElement('button');
        b.setAttribute('content', 'test content');
        b.setAttribute('class', 'btn');
        b.textContent = 'test value';

        this._up = document.createElement("button");
        this._up.className = "maplibregl-ctrl-icon maplibregl-ctrl-up";
        this._up.style.opacity = 1;
        this._up.type = "button";
        this._up["aria-label"] = "Up";

        this._level = document.createElement("button");
        this._level.className = "maplibregl-ctrl-icon maplibregl-ctrl-level";
        this._level.type = "button";
        this._level["aria-label"] = "Level";
        // this._level.style.fontSize = "36px";
        this._level.textContent = this._level_number;

        this._down = document.createElement("button");
        this._down.className = "maplibregl-ctrl-icon maplibregl-ctrl-down";
        this._down.type = "button";
        this._down["aria-label"] = "Down";

        this._level.onclick = function() {
            // console.log('TODO: select indoor floor and deep inside')
            self.indoor_level_action({ level: self._level_number });

        }

        this._up.onclick = function() {
            // console.log('self._levels:', self._levels)
            // console.log('this._level_number:', self._level_number)

            let index = self._levels.indexOf(self._level_number);

            // if (index === self._levels.length - 1) {
            //     // TODO: unactivate level up button
            // } else {
            //     // TODO: activate level up button
            // }
            if (!(index < self._levels.length - 1))
                return
            self.change_level_action({ level: self._level_number }).before();

            self._level_number = self._levels[index + 1];
            // console.log('index:', index)
            self._level.textContent = self._level_number;
            self.change_level_action({ level: self._level_number }).after();

            if (index + 1 === self._levels.length - 1) {
                // TODO: unactivate level down button
                // console.log('down limit')
                self._up.style.opacity = 0.1;
            } else {
                // TODO: activate level down button
                // console.log('down')
                self._down.style.opacity = 1;
            }

        };

        this._down.onclick = function() {
            let index = self._levels.indexOf(self._level_number);



            if (!(index > 0))
                return;

            self.change_level_action({ level: self._level_number }).before()


            self._level_number = self._levels[index - 1];
            // console.log('self._levels:', self._levels)
            // console.log('index:', index)
            self._level.textContent = self._level_number;
            self.change_level_action({ level: self._level_number }).after()

            if (index - 1 === 0) {
                // TODO: unactivate level down button
                // console.log('down limit')
                self._down.style.opacity = 0.1;
            } else {
                // TODO: activate level down button
                // console.log('down')
                self._up.style.opacity = 1;
            }


        };

        // this._level.onclick = function() {
        //     self.go_indoor_action
        // }

        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl-group maplibregl-ctrl";
        this._container.appendChild(this._up);
        this._container.appendChild(this._level);
        this._container.appendChild(this._down);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}


class PitchToggle {
    constructor({
        // bearing = -20,
        pitch = 70,
        // minpitchzoom = null
    }) {
        // this._bearing = bearing;
        this._pitch = pitch;
        // this._minpitchzoom = minpitchzoom;
    }


    onAdd(map) {
        this._map = map;
        let self = this;

        this._btn = document.createElement("button");
        this._btn.className = "maplibregl-ctrl-icon maplibregl-ctrl-pitchtoggle-3d";
        this._btn.type = "button";
        this._btn["aria-label"] = "Toggle Pitch";
        this._btn.onclick = function() {
            if (map.getPitch() === 0) {
                let options = {
                    pitch: self._pitch,
                    // bearing: self._bearing
                };
                // if (self._minpitchzoom && map.getZoom() > self._minpitchzoom) {
                //     options.zoom = self._minpitchzoom;
                // }
                map.easeTo(options);
                self._btn.className =
                    "maplibregl-ctrl-icon maplibregl-ctrl-pitchtoggle-2d";
            } else {
                map.easeTo({
                    pitch: 0,
                    // bearing: 0
                });
                self._btn.className =
                    "maplibregl-ctrl-icon maplibregl-ctrl-pitchtoggle-3d";
            }
        };
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl-group maplibregl-ctrl";
        this._container.appendChild(this._btn);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}


class BuildingControl {
    constructor() {
        this.on_button_pushed = () => {}
    }

    set_on_button_pushed(e) {
        this.on_button_pushed = e
    }

    enable() {
        this._btn.disabled = false;
    }

    disable() {
        this._btn.disabled = true;
    }

    onAdd(map) {
        this._map = map;
        let self = this;

        this._btn = document.createElement("button");
        this._btn.className = "maplibregl-ctrl-icon maplibregl-ctrl-building";
        this._btn.type = "button";
        this._btn.disabled = true;
        this._btn["aria-label"] = "Layer";
        this._btn.onclick = function() {
            self.on_button_pushed()
        };
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl-group maplibregl-ctrl";
        this._container.appendChild(this._btn);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
class FloorControl {
    constructor() {
        this.on_button_pushed = () => {}
    }
    enable() {
        this._btn.disabled = false;
    }

    disable() {
        this._btn.disabled = true;
    }
    set_on_button_pushed(e) {
        this.on_button_pushed = e
    }
    onAdd(map) {
        this._map = map;
        let self = this;

        this._btn = document.createElement("button");
        this._btn.className = "maplibregl-ctrl-icon maplibregl-ctrl-floor";
        this._btn.type = "button";
        this._btn.disabled = true;
        this._btn["aria-label"] = "Floor";
        this._btn.onclick = function() {
            self.on_button_pushed()
        };
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl-group maplibregl-ctrl";
        this._container.appendChild(this._btn);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
class IndoorControl {
    constructor() {
        this.on_button_pushed = () => {}
    }
    enable() {
        this._btn.disabled = false;
    }

    disable() {
        this._btn.disabled = true;
    }
    set_on_button_pushed(e) {
        this.on_button_pushed = e
    }

    onAdd(map) {
        this._map = map;
        let self = this;

        this._btn = document.createElement("button");
        this._btn.className = "maplibregl-ctrl-icon maplibregl-ctrl-indoor";
        this._btn.type = "button";
        this._btn.disabled = true;
        this._btn["aria-label"] = "Indoor";
        this._btn.onclick = function() {
            self.on_button_pushed()
        };
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl-group maplibregl-ctrl";
        this._container.appendChild(this._btn);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

class Controls {


    // on_building_geocoder_result(fn) {
    //     this.geocoder.on('result', () => {
    //         fn();
    //     })
    // }

    // machine.controls.set_on_building_event(() => {
    //     machine.setState(building)
    // })
    set_path_reset_onclick(fn) {
        this.path_reset.onclick = fn;
    }
    set_on_building_button_pushed(e) {
        if (this.building_control != null) {
            this.building_control.set_on_button_pushed(e)
        }
    }
    set_on_indoor_button_pushed(e) {
        if (this.indoor_control != null) {
            this.indoor_control.set_on_button_pushed(e)
        }
    }
    set_on_floor_button_pushed(e) {
        if (this.floor_control != null) {
            this.floor_control.set_on_button_pushed(e)
        }
    }

    enable_building_button() {
        if (this.building_control != null) {
            this.building_control.enable()
        }
    }

    disable_building_button() {
        if (this.building_control != null) {
            this.building_control.disable()
        }
    }


    enable_floor_button() {
        if (this.floor_control != null) {
            this.floor_control.enable()
        }
    }

    disable_floor_button() {
        if (this.floor_control != null) {
            this.floor_control.disable()
        }
    }


    enable_indoor_button() {
        if (this.indoor_control != null) {
            this.indoor_control.enable()
        }
    }

    disable_indoor_button() {
        if (this.indoor_control != null) {
            this.indoor_control.disable()
        }
    }

    switch_to_building_geocoder() {
        console.log("switch to building geocoder");
        this.geocoder.setGeocoderApi(this.building_geocoder_api);
        this.geocoder.setZoom(17);
        this.geocoder.options.showResultsWhileTyping = false;
        this.geocoder.options.debounceSearch = 200;
        this.geocoder.setPlaceholder("Outdoor search");
        // this.geocoder.setInput("");
    }

    switch_to_indoor_geocoder() {
        console.log("switch to indoor geocoder");
        this.geocoder.setGeocoderApi(this.indoor_geocoder_api);
        this.geocoder.setZoom(20);
        this.geocoder.options.showResultsWhileTyping = true;
        this.geocoder.options.debounceSearch = 10;
        this.geocoder.setPlaceholder("Indoor search");
        // this.geocoder.setInput("");
    }

    // enable_building_geocoder() {
    //     if (!this.map.hasControl(this.building_geocoder))
    //         this.map.addControl(this.building_geocoder, "top-right");

    //     // if (this.map.hasControl(this.indoor_geocoder))
    //     //     this.map.removeControl(this.indoor_geocoder, "top-right");
    // }

    // disable_building_geocoder() {
    //     // if (this.map.hasControl(this.building_geocoder))
    //     //     this.map.removeControl(this.building_geocoder, "top-right");

    //     if (!this.map.hasControl(this.indoor_geocoder))
    //         this.map.addControl(this.indoor_geocoder, "top-right");
    // }

    activateLevelControl() {
        if (!(this.map.hasControl(this.levelControl)))
            this.map.addControl(this.levelControl, "top-left");
    }

    deactivateLevelControl() {
        if (this.map.hasControl(this.levelControl))
            this.map.removeControl(this.levelControl);
    }

    set_change_level_action(change_level_action) {
        this.levelControl.set_change_level_action(change_level_action)

    }

    set_on_geolocate_update(geolocate_fn) {
        this.geolocate.on('geolocate', geolocate_fn);
    }

    set_on_geolocate_trackuserlocationstart(trackuserlocationstart_fn) {
        this.geolocate.on('trackuserlocationstart', trackuserlocationstart_fn);
    }

    set_indoor_level_action(indoor_level_action) {
        this.levelControl.set_indoor_level_action(indoor_level_action)
    }

    setLevel(level) {
        this.levelControl.setLevel(level)
    }

    getLevel() {
        return this.levelControl.getLevel()
    }

    setLevels(levels) {
        this.levelControl.setLevels(levels)
    }

    constructor(map, machine, feedback_control, info_control, mode_control, search_keys, search_filter) {

        // this.building_geocoder_enabled = false;
        this.map = map
            // this.machine = machine;


        if (info_control === "visible") {
            this.info_control = new InfoControl();
            map.addControl(this.info_control, "bottom-right");
        }

        let self = this;
        this.search_keys = search_keys;
        this.search_filter = search_filter;

        this.building_geocoder_api = {
            forwardGeocode: async(config) => {
                const features = [];
                try {
                    let request = "https://nominatim.openstreetmap.org/search?q=" + config.query + "&format=geojson&polygon_geojson=1&addressdetails=1"
                    const response = await fetch(request);
                    const geojson = await response.json();
                    for (let feature of geojson.features) {
                        let center_ = [
                            feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
                            feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2
                        ];
                        let point = {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: center_
                            },
                            place_name: feature.properties.display_name,
                            properties: feature.properties,
                            text: feature.properties.display_name,
                            place_type: ["place"],
                            center: center_
                        }
                        features.push(point)
                    }
                } catch (e) {
                    console.error(`Failed to forwardGeocode with error: ${e}`);
                }
                return {
                    features: features,
                }
            }
        };

        this.geocoder = new MaplibreGeocoder(
            this.building_geocoder_api, {
                zoom: 20,
                flyTo: true,
                clearAndBlurOnEsc: false,
                clearOnBlur: true,
                placeholder: "Outdoor search",
                maplibregl: maplibregl
            }
        );

        // this.building_geocoder = new MaplibreGeocoder(, {
        //     flyTo: true,
        //     maplibregl: maplibregl
        // });

        this.indoor_geocoder_api = {
            forwardGeocode: async(config) => {
                const features = [];
                console.log("data:", machine.indoor_data);

                let features_filtered = machine.indoor_data.features.filter(
                    (feat_) => {
                        if (self.search_filter.properties != null) {
                            for (let prop_key in self.search_filter.properties) {
                                if (!(prop_key in feat_.properties)) {
                                    return false;
                                }
                                if (feat_.properties[prop_key] != self.search_filter.properties[prop_key] &&
                                    !(feat_.properties[prop_key] in self.search_filter.properties[prop_key])) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                );

                for (let feature of features_filtered) {
                    if (feature.properties == null)
                        continue;
                    if (self.search_filter != null) {

                        if (self.search_filter.properties != null) {
                            for (let prop_key in self.search_filter.properties) {
                                if (prop_key in feature.properties) {

                                }
                            }
                        }
                    }

                    let place_name = undefined;
                    for (let search_key of self.search_keys) {
                        if (feature.properties[search_key] != null && feature.properties[search_key].toLowerCase().includes(config.query.toLowerCase())) {
                            place_name = feature.properties[search_key];
                        }
                    }
                    if (place_name != null)
                    // if (feature.properties.name.toLowerCase().includes(config.query.toLowerCase())) 
                    {
                        console.log('feature.properties:', feature.properties);
                        let center_ = center(feature).geometry.coordinates;
                        let point = {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: center_
                            },
                            // place_name: feature.properties.min_level + ' - ' + feature.properties.name,
                            place_name: place_name,
                            properties: feature.properties,
                            text: place_name,
                            place_type: ["place"],
                            center: center_
                        }
                        console.log('point:', point);

                        features.push(point)
                    }
                }
                return {
                    features: features,
                }
            }
        };

        this.geocoder.on('result', (e) => {
            console.log('geocoder result:', e);
            // Go to indoor view
            if (!machine.get_singleton().is_building_state()) {
                machine.get_singleton().set_indoor_state();
            }

            let feature = e.result;
            // Update way-finding
            let my_centroid = centroid(feature).geometry.coordinates;
            machine.get_singleton().mark(
                [feature], {
                    lng: my_centroid[0],
                    lat: my_centroid[1],
                }
            );

            if (feature.properties != null &&
                feature.properties.min_level != null &&
                parseInt(feature.properties.min_level) != self.levelControl._level_number) {
                self.levelControl.change_level_action({ level: parseInt(feature.properties.min_level) }).after();
                self.levelControl._level_number = parseInt(feature.properties.min_level);
                // console.log('index:', index)
                if (feature.properties._level != null) {
                    self.levelControl._level.textContent = feature.properties.min_level;
                }
            }
        })

        // this.enable_building_geocoder();
        // this.disable_indoor_geocoder();
        map.addControl(this.geocoder, "top-left");

        this.geolocate = new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        });
        map.addControl(this.geolocate, "top-left");

        this.path_reset = new PathReset();
        map.addControl(this.path_reset, "top-left");


        if (mode_control === "visible") {
            this.building_control = new BuildingControl();
            this.floor_control = new FloorControl();
            this.indoor_control = new IndoorControl();
            map.addControl(this.building_control, "top-left");
            map.addControl(this.floor_control, "top-left");
            map.addControl(this.indoor_control, "top-left");
        }

        this.levelControl = new LevelControl({
            minpitchzoom: 11,
        })

        // map.addControl(new PitchToggle({ minpitchzoom: 11 }), "top-left");



        if (feedback_control === "visible") {
            this.feedbackControl = new FeedbackControl({})
            map.addControl(this.feedbackControl, "bottom-left");
        }

        var scale = new maplibregl.ScaleControl({
            maxWidth: 80,
            unit: 'imperial'
        });
        map.addControl(scale);

        scale.setUnit('metric');
        map.addControl(new maplibregl.FullscreenControl({ container: document.querySelector('body') }));
        var nav = new maplibregl.NavigationControl({
            visualizePitch: true
        });
        map.addControl(nav, 'top-right');
    }
}

export default Controls;