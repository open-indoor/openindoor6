//   ----------
//  |    GIS   |----------------------------------
//   ----------                                   |
//       |                                        |
//       |- trigger FPS                           |
//       |  -> block all user camera handlers     |
//       |  -> start camera movement (flyTo)      |
//       |                                        |
//   ------------
//  | transition |
//   ------------
//       |
//       |- end_of_flyTo()
//       |  -> allow user FPS handlers
//       |
//   ----------
//  |    FPS   |----------------------------------
//   ----------


class UIHandler {
    constructor(map) {
        if (this.constructor === UIHandler) {
            throw new TypeError('Abstract class "UIHandler" cannot be instantiated directly');
        }
    }
}

class GisHandler extends UIHandler {
    constructor(map) {
        super(map);
        this.map_ = map;
        this.mouse_pitch_move = this.map_.dragRotate._mousePitch._move;
        this.mouse_rotate_move = this.map_.dragRotate._mouseRotate._move;
        this.mouse_pan_move = this.map_.dragPan._mousePan._move;
        this.touch_pan_move = this.map_.dragPan._touchPan.touchmove;
        this.scroll_zoom = this.map_.scrollZoom._start;
        this.touch_zoom_move = this.map_.touchZoomRotate._touchZoom._move;
        this.double_clic_zoom = this.map_.doubleClickZoom._clickZoom.dblclick;
        this.tap_zoom = this.map_.doubleClickZoom._tapZoom.touchend;

    }
    apply() {
        console.log('apply gis_handler')
        this.map_.setMinPitch(0);
        this.map_.setMaxPitch(70);
    }
}

class NoHandler extends UIHandler {
    constructor(map) {
        super(map);
        this.map_ = map;
        let self = this;
    }
    apply() {
        console.log('apply NoHandler')
        let self = this;
        // let map_ = Fps.get_instance().map_;
        this.map_.setMinPitch(0);
        // this.map_.setMaxPitch(85);
        this.map_.setMaxPitch(this.map_.MAX_PITCH);

    }

    mouse_pitch_move(lastPoint, point) {};
    mouse_rotate_move(lastPoint, point) {};
    mouse_pan_move(lastPoint, point) {};
    touch_pan_move(e, points, mapTouches) {}
    scroll_zoom(lastPoint, point) {};
    touch_zoom_move(points, pinchAround) {};
    double_clic_zoom(mouse_event, point) {};
    tap_zoom(touch_event, points, mapTouches) {}

}


class FpsHandler extends UIHandler {

    constructor(map) {
        super(map);
        this.map_ = map;
        // FpsHandler.instance = this;
        // this.mouse_pitch_move = this.mouse_pitch_move.bind(this);
        this.mouse_pitch_move = this.map_.dragRotate._mousePitch._move;
        this.mouse_rotate_move = this.mouse_rotate_move.bind(this);
        this.mouse_pan_move = this.mouse_pan_move.bind(this);
        this.touch_pan_move = this.touch_pan_move.bind(this);
        this.touch_zoom_move = this.touch_zoom_move.bind(this);
        this.double_clic_zoom = this.double_clic_zoom.bind(this);
        this.tap_zoom = this.tap_zoom.bind(this);

    }

    apply() {
        console.log('apply fps_handler')
        this.map_.setMinPitch(70);
        // this.map_.setMaxPitch(85);
        this.map_.setMaxPitch(this.map_.MAX_PITCH);
    }

    mouse_rotate_move(lastPoint, point) {
        const degreesPerPixelMoved = 0.8;
        const bearingDelta = (point.x - lastPoint.x) * degreesPerPixelMoved;
        if (bearingDelta) {
            let cam_pos = this.map_.getCameraPosition();
            this.map_.setBearing(this.map_.getBearing() + bearingDelta);
            this.map_.setCameraPosition(cam_pos);
            this.map_._update();
        }
    };
    mouse_pan_move(lastPoint, point) {
        const sidePerPixelMoved = -0.0000001;
        const upbackPerPixelMoved = -0.0000005;
        const sideDelta = (point.x - lastPoint.x) * sidePerPixelMoved;
        const upbackDelta = (point.y - lastPoint.y) * upbackPerPixelMoved;

        const camera_pos = this.map_.getCameraPosition();
        const bearing = this.map_.getBearing() * Math.PI / 180;
        const lng = camera_pos.lng + sideDelta * Math.cos(bearing) - upbackDelta * Math.sin(bearing);
        const lat = camera_pos.lat - upbackDelta * Math.cos(bearing) - sideDelta * Math.sin(bearing);
        this.map_.setCameraPosition({
            lng: lng,
            lat: lat,
            altitude: FpsHandler.cam_height_,
            pitch: this.map_.getPitch()
        });
        this.map_._update();

    }
    touch_pan_move(e, points, mapTouches) {
        console.log('this.map_.dragPan._touchPan._active:', this.map_.dragPan._touchPan._active);
        console.log('this.map_.dragPan._touchPan._minTouches:', this.map_.dragPan._touchPan._minTouches);
        if (!this.map_.dragPan._touchPan._active || mapTouches.length < this.map_.dragPan._touchPan._minTouches) return;
        e.preventDefault();
        let touch_pan_move_ = this.map_.dragPan._touchPan._calculateTransform(e, points, mapTouches);

        const sidePerPixelMoved = -0.0000001;
        const upbackPerPixelMoved = -0.0000005;

        const sideDelta = touch_pan_move_.panDelta.x * sidePerPixelMoved;
        const upbackDelta = touch_pan_move_.panDelta.y * upbackPerPixelMoved;
        const camera_pos = this.map_.getCameraPosition();
        const bearing = this.map_.getBearing() * Math.PI / 180;
        const lng = camera_pos.lng + sideDelta * Math.cos(bearing) - upbackDelta * Math.sin(bearing);
        const lat = camera_pos.lat - upbackDelta * Math.cos(bearing) - sideDelta * Math.sin(bearing);
        this.map_.setCameraPosition({
            lng: lng,
            lat: lat,
            altitude: FpsHandler.cam_height_,
            pitch: this.map_.getPitch()
        });
        this.map_._update();
    }

    scroll_zoom() {

    }

    touch_zoom_move(points, pinchAround) {}
    double_clic_zoom(mouse_event, point) {
        mouse_event.preventDefault();
        const loc = this.map_.transform.pointLocation(point);
        this.map_.camera_go_to({
                lng: loc.lng,
                lat: loc.lat,
                altitude: FpsHandler.cam_height_,
                pitch: this.map_.getPitch()
            },
            this.map_.getBearing(),
            "flytoend_fps"
        )
    };

    tap_zoom(touch_event, points, mapTouches) {

    }

}
FpsHandler.cam_height_ = 1.7;

export { UIHandler, GisHandler, NoHandler, FpsHandler };