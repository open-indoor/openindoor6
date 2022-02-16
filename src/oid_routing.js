import nearestPointOnLine from '@turf/nearest-point-on-line';
import shortestPath from '@turf/shortest-path';
import PathFinder from 'geojson-path-finder';
// import nearestPointOnLine from './nearest-point-on-line.js';

// import Queue from 'tinyqueue'
let Queue = require('tinyqueue').default;
// var Queue = require('tinyqueue');

class oid_routing {
    static singleton = undefined;
    static get_instance(map) {
        if (oid_routing.singleton === undefined)
            oid_routing.singleton = new oid_routing(map);
        return oid_routing.singleton;
    }
    constructor(map) {
        this.map = map;
        this.start_marker = undefined;
        this.point_marker = undefined;
        this.stop_marker = undefined;
        this.geojson_ways = undefined;
        this.geojson_obstacles = undefined;
        this.on_start_activated_ = undefined;
        this.start_dragend = undefined;
        this.stop_dragend = undefined;
    }

    reset() {
        this.remove_start();
        this.remove_point();
        this.remove_stop();
    }

    is_start_defined() {
        return (this.start_marker !== undefined);
    }
    is_stop_defined() {
        return (this.stop_marker !== undefined);
    }

    set_start_dragend(fn) {
        this.start_dragend = fn;
    }
    set_stop_dragend(fn) {
        this.stop_dragend = fn;
    }
    _on_start_dragend(self) {
        console.log('_on_start_dragend');
        let lnglat = self.start_marker.getLngLat();
        let coordinates = [lnglat.lng, lnglat.lat];
        console.log('_on_start_dragend - coordinates:', coordinates);
        self.start_dragend(coordinates);
    }
    _on_stop_dragend(self) {
        console.log('_on_stop_dragend');
        let lnglat = self.stop_marker.getLngLat();
        let coordinates = [lnglat.lng, lnglat.lat];
        self.stop_dragend(coordinates);
    }

    _get_start_marker() {
        if (this.start_marker === undefined) {
            this.start_marker = new maplibregl.Marker({
                color: "#34a853",
                draggable: true
            });
            let self = this;
            // this.start_marker.on("dragend", () => self._on_start_dragend);
            this.start_marker.on("dragend", () => { self._on_start_dragend(self) });
        }
        return this.start_marker;
    }
    _get_point_marker() {
        if (this.point_marker === undefined) {
            this.point_marker = new maplibregl.Marker({
                color: "#888",
            });
        }
        return this.point_marker;
    }
    _get_stop_marker() {
        if (this.stop_marker === undefined) {
            this.stop_marker = new maplibregl.Marker({
                color: "#ea4234",
                draggable: true
            });
            let self = this;
            this.stop_marker.on("dragend", () => { self._on_stop_dragend(self) });

        }
        return this.stop_marker;
    }
    _set_start(coordinates) {
        this._get_start_marker()
            .setLngLat(coordinates)
            .addTo(this.map);
        console.log('start point:', coordinates);
    }
    _set_point(coordinates) {
        this._get_point_marker()
            .setLngLat(coordinates)
            .addTo(this.map);
    }
    _set_stop(coordinates) {
        // this.stop.geometry.coordinates = coordinates;
        this._get_stop_marker()
            .setLngLat(coordinates)
            .addTo(this.map);
        console.log('stop point:', coordinates);
    }

    _get_nearest_point_on_line_01(coordinates) {
        if (this.geojson_ways == null) {
            return;
        }
        let pt = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coordinates
            }
        };
        let nearest_point = nearestPointOnLine(this.geojson_ways, pt);
        if (nearest_point == null) {
            console.error('no nearest point found');
            return;
        }
        console.log('nearest_point:', JSON.stringify(nearest_point, null, 4));
        return nearest_point;
    }

    _get_nearest_point_on_line_02(coordinates) {
        if (this.geojson_ways == null) {
            return undefined;
        }
        let nearest_point = undefined;
        let pt = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coordinates
            }
        };
        let line = undefined;
        for (let way of this.geojson_ways.features) {
            let nearest_point_ = nearestPointOnLine(way, pt);
            // console.log('nearest_point_.dist:', nearest_point_.properties.dist);
            if (nearest_point == null || nearest_point_.properties.dist < nearest_point.properties.dist) {
                nearest_point = nearest_point_;
                line = way;
            }
        }
        if (nearest_point == null) {
            console.error('no nearest point found');
            return undefined;
        }
        console.log('line before:', line);
        console.log('nearest_point:', nearest_point);
        console.log(
            'coordinates to add at position',
            nearest_point.properties.index + 1,
            nearest_point.geometry.coordinates
        );

        line.geometry.coordinates.splice(
            nearest_point.properties.index + 1,
            0,
            nearest_point.geometry.coordinates);
        console.log('line after:', line);

        console.log('nearest_point:', JSON.stringify(nearest_point, null, 4));
        return nearest_point;
    }

    // get_start() {
    //     return this.start;
    // }
    // get_stop() {
    //     return this.stop;
    // }

    set_closest_point(coordinates) {
        let nearest_point = this._get_nearest_point_on_line_02(coordinates);
        if (nearest_point == null) {
            return;
        }
        this._set_point(
            nearest_point.geometry.coordinates
        );
    }
    set_closest_start(coordinates) {
        let nearest_point = this._get_nearest_point_on_line_02(coordinates);
        if (nearest_point == null) {
            return;
        }
        this._set_start(nearest_point.geometry.coordinates);
    }
    set_closest_stop(coordinates) {
        let nearest_point = this._get_nearest_point_on_line_02(coordinates);
        if (nearest_point == null) {
            return;
        }
        this._set_stop(nearest_point.geometry.coordinates);
    }
    remove_start() {
        if (this.start_marker == null) {
            return;
        }
        this.start_marker.remove();
        this.start_marker = undefined;
    }
    remove_point() {
        if (this.point_marker == null) {
            return;
        }
        this.point_marker.remove();
        this.point_marker = undefined;

    }
    remove_stop() {
        if (this.stop_marker == null) {
            return;
        }
        this.stop_marker.remove();
        this.stop_marker = undefined;
    }
    set_ways(geojson_ways) {
        this.geojson_ways = geojson_ways;
    }
    set_obstacles(geojson_obstacles) {
        this.geojson_obstacles = geojson_obstacles;
    }
    get_path() {
        let self = this;
        let lngLat_start = this.start_marker.getLngLat();
        let lngLat_stop = this.stop_marker.getLngLat();
        let start_coord = [lngLat_start.lng, lngLat_start.lat];
        let stop_coord = [lngLat_stop.lng, lngLat_stop.lat];
        let path_finder;
        try {
            path_finder = new PathFinder(this.geojson_ways);
        } catch (error) {
            console.error(error);
            return null;
        }
        let path = path_finder.findPath({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": start_coord
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": stop_coord
            }
        });
        console.log('path:', path);
        if (path == null) {
            return null;
        }
        let my_path = {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "properties": {
                    "weight": path.weight,
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": path.path
                }
            }]
        }
        return my_path;
    }

    get_shortest_path() {
        let self = this;
        let lngLat_start = this.start_marker.getLngLat();
        let lngLat_stop = this.stop_marker.getLngLat();
        let start_coord = [lngLat_start.lng, lngLat_start.lat];
        let stop_coord = [lngLat_stop.lng, lngLat_stop.lat];

        // console.log('ways:', this.geojson_ways);

        let my_shortest_path_empty = shortestPath(
            start_coord,
            stop_coord, {}
        );
        console.log("my_shortest_path_empty:", my_shortest_path_empty);

        console.log("self.geojson_obstacles:", self.geojson_obstacles);

        let my_shortest_path_poly = shortestPath(
            start_coord,
            stop_coord, {
                obstacles: self.geojson_obstacles
            }
        );
        console.log("my_shortest_path_poly:", my_shortest_path_poly);

        return my_shortest_path_poly;
    }
}

export default oid_routing;