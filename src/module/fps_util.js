class FpsUtil {
    constructor(map, options = {
        cam_height: FpsUtil.CAM_HEIGHT
    }) {
        let self = this;
        this.cam_height = options.cam_height;
        map.getCameraPosition = () => {
            const pitch = map.transform._pitch;
            const altitude = Math.cos(pitch) * map.transform.cameraToCenterDistance;
            const latOffset = Math.tan(pitch) * map.transform.cameraToCenterDistance;
            const latPosPointInPixels = map.transform.centerPoint.add(new maplibregl.Point(0, latOffset));
            const latLong = map.transform.pointLocation(latPosPointInPixels);
            const verticalScaleConstant = map.transform.worldSize / (2 * Math.PI * 6378137 * Math.abs(Math.cos(latLong.lat * (Math.PI / 180))));
            const altitudeInMeters = altitude / verticalScaleConstant;
            return { lng: latLong.lng, lat: latLong.lat, altitude: altitudeInMeters, pitch: pitch * 180 / Math.PI };
        }
        map.setCameraPosition = (camPos) => {
            const { lng, lat, altitude, pitch } = camPos;
            const pitch_ = pitch * Math.PI / 180;
            const cameraToCenterDistance = 0.5 / Math.tan(map.transform._fov / 2) * map.transform.height;
            const pixelAltitude = Math.abs(Math.cos(pitch_) * cameraToCenterDistance);
            const metersInWorldAtLat = (2 * Math.PI * 6378137 * Math.abs(Math.cos(lat * (Math.PI / 180))));
            const worldsize = (pixelAltitude / altitude) * metersInWorldAtLat;
            const zoom = Math.log(worldsize / map.transform.tileSize) / Math.LN2;
            const latOffset = Math.tan(pitch_) * cameraToCenterDistance;
            const newPixelPoint = new maplibregl.Point(map.transform.width / 2, map.transform.height / 2 + latOffset);
            const newLongLat = new maplibregl.LngLat(lng, lat);
            map.transform.zoom = zoom;
            map.transform.pitch = pitch;
            map.transform.setLocationAtPoint(newLongLat, newPixelPoint);
        }

        map.camera_go_to = (camera_pos, bearing, event_data) => {
            // console.log('camera_go_to');

            let current_pos = map.getCameraPosition();
            let old_bearing = map.getBearing();

            // Move quickly to expected position to get target point position for flyTo call
            map.setBearing(bearing);
            map.setCameraPosition(camera_pos);

            let target_pos_ = {
                center: map.getCenter(),
                zoom: map.getZoom(),
                pitch: map.getPitch(),
                bearing: bearing,
                duration: 1000,
            }

            // back to old position
            map.setBearing(old_bearing);
            map.setCameraPosition(current_pos);

            // Do it baby
            map.easeTo(target_pos_, event_data);
        }

        map.MAX_PITCH = FpsUtil.MAX_PITCH;
        map.setMaxPitch = (maxPitch) => {
            map.transform.maxPitch = maxPitch;
            map._update();
            return map;
        }





        // setMaxPitch(maxPitch?: number | null) {

        //     maxPitch = maxPitch === null || maxPitch === undefined ? defaultMaxPitch : maxPitch;

        //     if (maxPitch > maxPitchThreshold) {
        //         throw new Error(`maxPitch must be less than or equal to ${maxPitchThreshold}`);
        //     }

        //     if (maxPitch >= this.transform.minPitch) {
        //         this.transform.maxPitch = maxPitch;
        //         this._update();

        //         if (this.getPitch() > maxPitch) this.setPitch(maxPitch);

        //         return this;

        //     } else throw new Error('maxPitch must be greater than the current minPitch');
        // }



    }

}
FpsUtil.CAM_HEIGHT = 1.7;
FpsUtil.MAX_PITCH = 88;

export { FpsUtil };