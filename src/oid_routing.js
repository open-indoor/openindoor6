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
        if (this.map.getLayer('route') != null) {
            this.map.removeLayer('route');
        }
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

            var el = document.createElement('div');
            el.className = 'start_marker';
            // el.style.backgroundImage =
            //     'url(https://app-dev.openindoor.io/images/user_pinpoint.png)';
            el.style.backgroundImage =
                'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAApCAYAAAAvUenwAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABG9JREFUSImll19sU3UUxz/n3ruNIcGBgEp4IPNFwShCRE2I1mSDLbDJhiWRbOOPRhIz8MEYQ2K0iS/G+ECMIWExQ6ooUPdHRRexxQWBRAlD96CGiAomJCpgGHFz7b33+NCua++fdnPnpbfnd8738zu/np5fK/wP23SorlYdmoE5Ilwwqub1JzYn0kGxMl3x1oP1LYgeBioL3EMZy1736ZbBq954Y1ri70eWBIgDrKywrbeDcqYFENdqCxCfsE3Ro5E5MwIAi0qsWeNOxdwZAVT1mxLLf43ckflzRoCxG5X9InwXQo8NPj5ozwgwsHtg3LDtRoFeICumXFGks3dral9QzpTbdOOBSI0hlfeZlnM10Zb6YeOBSA3Mqllx6eHLsVjMDcsrC2j+sH6xldY9CDuA2bmsfb1tyU4ELZcfCoh2Ny50rPRLIM8B1b4A1Wjv1tRH5QCW19EeX3vLKPqCQ+ZFEF9f53cmRIDpATYeqF/xD+7nwJ3lEl24Vi4GPF1kmHRORRxA1AhuV2/cxEMsFjOGa09dAW4vWD4Dugqo8iaaGLWuOo+CLOrpSL4Z9oHnKxheevoRr3jGyjwRJA7cSLQf/801ZLkKb7S+VzfQEl8bOEaMgqfmwgUV7au0rVVBScAFBDWUu3Lv14m651vi9Y+FAhTdULRgG8cUHgyUF7mUfaV20sdiQVOt8bqXY7FYXteA7A0lsKxA4mLP9uM/oSEAdbMA1dOeFRN4bbj21GfRd9bNn6zAlaaifNVjuV2FVXAToKcj1amibQojnogGp8ruywNUWV+4aiDHmvY3zSakZUUl3zF97alD6rorQb4trlJWTwLQh/J+GDGq5520x22HiYlZxvq3nbi4YOz6GoXXAQdAkK48QODH/O7gcGJzIj2we2Ac1XeDBBXW5yrMW9fOc5m+juQeE2pNQ5f3dHz5PORGRcayN1hOxdOGqqTHqt+aSJrrOrtGTOtuYI0HsbqyeuxI5KtIi/eSSXQkLxe+Lzmuo92NC0erDLvKGT8J3BtQSXdfe/KZUmM79EbLjmt7aLY7ushUtwG47I0R2NEar3u11CZDAY6ZbgVd4rjmiYwyS6GBoAkqvNIar982bYAi0ZzAYsOQpBj2TUPcZmDMX4h2tcTr1vhEwgDR7saFIhTMFVmqrpWcP3rjrCpPkWvFAqtA2TVlQPZ4ii8jA9JdO89l+rYmP0Z1tzdHQr71gYD88RT5ODrxnPuJ8qsnZGn0aN2tZQH+48maKebhoh3DeU+IOKPG/WUBtmVvwv9j4Gyi/YufCx2q6rsyxdQHygJQfdLnksnjyYuJ6QOoq6UrCDketdQPMHC/921OWFESENQ9CGe88wXyM+e6x73s2f2rKkIBiDT4duVyxOebNG8VVddm1dwTDvD/e0nbFeo7nknTIZ9HijupCCDKoCc+8cmW1B+h8ipfB7jNUMBt//69F9gL/AIccR27M0wcwLHHTgAXC1y/u06mv2jTpQSmYk0fRBZUZqztKiq2xUFvxf8BEgGiLl32bh0AAAAASUVORK5CYII=")';
            el.style.width = '24px';
            el.style.height = '41px';

            // add marker to map
            this.start_marker = new maplibregl.Marker({
                element: el,
                draggable: true,
                anchor: 'bottom'
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
            var el = document.createElement('div');
            el.className = 'start_marker';
            // el.style.backgroundImage =
            //     'url(https://app-dev.openindoor.io/images/destination_pinpoint.png)';
            el.style.backgroundImage =
                'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAApCAYAAADEZlLzAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm + 48 GgAACJ1JREFUWIWdl21sU + cVx3 / P9bV9HdsJCSU4cZgDeSmQQFJfrxlUavJhaldNHRIo1YREW2lTGYOpZZVaXtZN / UI3hdINIVqVgrSq1VpQp6JW22AVibotQoudlPISCgESkhDHapzYThPb177PPkCsJIQQ9peuZPk8z / 9 / 7 nnOOc + 5 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")';
            el.style.width = '27px';
            el.style.height = '41px';
            // add marker to map
            this.stop_marker = new maplibregl.Marker({
                element: el,
                draggable: true,
                anchor: 'bottom'
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