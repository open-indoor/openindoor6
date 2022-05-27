// let visit_pitch = 85;

import { UIHandler, GisHandler, NoHandler, FpsHandler } from './fps_handler.js';
import { FpsUtil } from './fps_util.js';


class Fps {


    enable() {
        if (this.enabled)
            return;

        this.enabled = true;
    }
    disable() {
        let self = this;
        if (!this.enabled)
            return;
        this.enabled = false;
        if (self.handler === self.fps_handler) {
            console.log('time to go gis')
            self.handler = self.no_handler;
            self.apply();
            let camera_pos = self.map_.getCameraPosition();
            self.map_.camera_go_to({
                    lng: camera_pos.lng,
                    lat: camera_pos.lat,
                    altitude: 20,
                    pitch: 0
                },
                self.map_.getBearing(), {
                    oid_event: "flytoend_gis"
                }
            )
        }
    }

    add_listener(listener) {
        if (this.listeners.indexOf(listener) <= -1)
            this.listeners.push(listener);
    }

    remove_listener(listener) {
        if (this.listeners.indexOf(listener) > -1)
            this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    fire() {
        for (let listener of this.listeners) {
            listener({
                event: (this.handler === this.fps_handler) ? "fps_handler" : "gis_handler"
            })
        }
    }

    constructor(map) {
        new FpsUtil(map);
        let self = this;
        this.map_ = map;
        this.enabled = true;
        this.listeners = [];
        // this.mouse_init_ === undefined;
        this.cam_pos_ = {};
        this.gis_handler = new GisHandler(map);
        this.fps_handler = new FpsHandler(map);
        this.no_handler = new NoHandler(map);

        this.handler = this.gis_handler;
        this.apply();

        this.map_.on('moveend', (e) => {
            if (e.originalEvent && self.enabled) {
                let cam_pos = self.map_.getCameraPosition();
                if (self.handler === self.gis_handler) {
                    if (self.map_.getZoom() > 22) {
                        console.log('time to go fps')
                        self.handler = self.no_handler;
                        self.apply();
                        let { lng, lat } = self.map_.getCenter();
                        self.map_.camera_go_to({
                                lng: lng,
                                lat: lat,
                                altitude: FpsHandler.cam_height_,
                                pitch: this.map_.MAX_PITCH
                            },
                            self.map_.getBearing(), {
                                oid_event: "flytoend_fps"
                            }
                        );
                    }
                } else if (self.handler === self.fps_handler) {
                    if (cam_pos.pitch <= 70) {
                        console.log('time to go gis')
                        self.handler = self.no_handler;
                        self.apply();
                        let camera_pos = self.map_.getCameraPosition();
                        self.map_.camera_go_to({
                                lng: camera_pos.lng,
                                lat: camera_pos.lat,
                                altitude: 20,
                                pitch: 0
                            },
                            self.map_.getBearing(), {
                                oid_event: "flytoend_gis"
                            }
                        )
                    }
                }
            } else {
                if (e.oid_event === "flytoend_fps") {
                    console.log('flytoend_fps')
                    self.handler = self.fps_handler;
                    self.apply();
                    self.fire();
                } else if (e.oid_event === "flytoend_gis") {
                    console.log('flytoend_gis')
                    self.handler = self.gis_handler;
                    self.apply();
                    self.fire();
                }
            }
        });
    }

    apply() {
        // console.log('handler:', this.handler);
        this.map_.dragRotate._mousePitch._move = this.handler.mouse_pitch_move;
        this.map_.dragRotate._mouseRotate._move = this.handler.mouse_rotate_move;

        this.map_.dragPan._mousePan._move = this.handler.mouse_pan_move;
        this.map_.dragPan._touchPan.touchmove = this.handler.touch_pan_move;

        this.map_.scrollZoom._start = this.handler.scroll_zoom;
        this.map_.touchZoomRotate._touchZoom._move = this.handler.touch_zoom_move;
        this.map_.doubleClickZoom._clickZoom.dblclick = this.handler.double_clic_zoom;
        this.map_.doubleClickZoom._tapZoom.touchend = this.handler.tap_zoom;

        this.handler.apply();
    }

    camera_go_to(camera_pos, bearing) {
        let event_data = {}
        if (camera_pos.altitude < 10 && this.handler === this.gis_handler) {
            this.handler = this.no_handler;
            this.apply();
            event_data.oid_event = "flytoend_fps";
        }
        // else if (camera_pos.pitch < 70 && this.handler === this.fps_handler) {
        //     this.handler = this.no_handler;
        //     this.apply();
        //     event_data.oid_event = "flytoend_gis";
        // }

        this.map_.camera_go_to(camera_pos, bearing, event_data);
    }
}
Fps.MAX_PITCH = 88;


export { Fps };
export default Fps;