import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

var GeoApi = {
    forwardGeocode: async(config) => {
        const features = []
        try {
            let request = "https://nominatim.openstreetmap.org/search?q=" + config.query + "&format=geojson&polygon_geojson=1&addressdetails=1"
            const response = await fetch(request);
            const geojson = await response.json();
            for (let feature of geojson.features) {
                let center = [
                    feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
                    feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2
                ];
                let point = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: center
                    },
                    place_name: feature.properties.display_name,
                    properties: feature.properties,
                    text: feature.properties.display_name,
                    place_type: ["place"],
                    center: center
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


var geocoder = new MaplibreGeocoder(
    GeoApi, {
        maplibregl: maplibregl
    }
);

class LevelControl {
    constructor({
        bearing = -20,
        pitch = 70,
        minpitchzoom = null,
        // up_action,
        // down_action,
    }) {
        this._bearing = bearing;
        this._pitch = pitch;
        this._level_number = 0;
        this._levels = [this._level_number];
        // this.up_action = up_action
        // this.down_action = down_action

        // this._minpitchzoom = minpitchzoom;
    }

    setLevel(level) {
        console.log('set level:', level)
        this._level_number = level;
        if (this._level !== undefined)
            this._level.textContent = this._level_number;
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
        this._up.type = "button";
        this._up["aria-label"] = "Up";

        this._level = document.createElement("button");
        this._level.className = "maplibregl-ctrl-icon maplibregl-ctrl-level";
        this._level.type = "button";
        this._level["aria-label"] = "Level";
        this._level.style.fontSize = "72px";
        this._level.textContent = this._level_number;

        this._down = document.createElement("button");
        this._down.className = "maplibregl-ctrl-icon maplibregl-ctrl-down";
        this._down.type = "button";
        this._down["aria-label"] = "Down";

        this._level.onclick = function() {
            console.log('TODO: select indoor floor and deep inside')
        }

        this._up.onclick = function() {
            // console.log('self._levels:', self._levels)
            // console.log('this._level_number:', self._level_number)

            let index = self._levels.indexOf(self._level_number);
            console.log('index:', index)


            if (!(index < self._levels.length - 1))
                return
            self.change_level_action({ level: self._level_number }).before()

            self._level_number = self._levels[index + 1];
            // console.log('index:', index)
            self._level.textContent = self._level_number;
            self.change_level_action({ level: self._level_number }).after()
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
    constructor({ bearing = -20, pitch = 70, minpitchzoom = null }) {
        this._bearing = bearing;
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
                let options = { pitch: self._pitch, bearing: self._bearing };
                // if (self._minpitchzoom && map.getZoom() > self._minpitchzoom) {
                //     options.zoom = self._minpitchzoom;
                // }
                map.easeTo(options);
                self._btn.className =
                    "maplibregl-ctrl-icon maplibregl-ctrl-pitchtoggle-2d";
            } else {
                map.easeTo({ pitch: 0, bearing: 0 });
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


    // machine.controls.set_on_building_event(() => {
    //     machine.setState(building)
    // })
    set_on_building_button_pushed(e) {
        this.building_control.set_on_button_pushed(e)

    }
    set_on_indoor_button_pushed(e) {
        this.indoor_control.set_on_button_pushed(e)

    }
    set_on_floor_button_pushed(e) {
        this.floor_control.set_on_button_pushed(e)

    }

    enable_building_button() {
        this.building_control.enable()
    }

    disable_building_button() {
        this.building_control.disable()
    }


    enable_floor_button() {
        this.floor_control.enable()
    }

    disable_floor_button() {
        this.floor_control.disable()
    }


    enable_indoor_button() {
        this.indoor_control.enable()
    }

    disable_indoor_button() {
        this.indoor_control.disable()
    }

    activateLevelControl() {
        if (!(this.map.hasControl(this.levelControl)))
            this.map.addControl(this.levelControl, "top-right");
    }

    deactivateLevelControl() {
        if (this.map.hasControl(this.levelControl))
            this.map.removeControl(this.levelControl);
    }

    set_change_level_action(change_level_action) {
        this.levelControl.set_change_level_action(change_level_action)
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

    constructor(map) {
        this.map = map
        this.building_control = new BuildingControl();
        this.floor_control = new FloorControl();
        this.indoor_control = new IndoorControl();

        this.levelControl = new LevelControl({
                minpitchzoom: 11,
            })
            // map.addControl(new PitchToggle({ minpitchzoom: 11 }), "top-left");

        map.addControl(geocoder, "top-right");


        var nav = new maplibregl.NavigationControl({
            visualizePitch: true
        });

        map.addControl(nav, 'top-left');

        map.addControl(new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));

        var scale = new maplibregl.ScaleControl({
            maxWidth: 80,
            unit: 'imperial'
        });
        map.addControl(scale);

        scale.setUnit('metric');
        map.addControl(new maplibregl.FullscreenControl({ container: document.querySelector('body') }));


        map.addControl(this.building_control, "top-left");
        map.addControl(this.floor_control, "top-left");
        map.addControl(this.indoor_control, "top-left");

    }



}

export default Controls