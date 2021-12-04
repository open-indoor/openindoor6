import centroid from '@turf/centroid';
import buffer from '@turf/buffer';
import booleanContains from '@turf/boolean-contains';
import difference from '@turf/difference';
import intersect from '@turf/intersect';
import clone from '@turf/clone';
import lineToPolygon from '@turf/line-to-polygon'
import polygonToLine from '@turf/polygon-to-line'

class toolbox {
    static regex1 = /^-?\d+(?:\.\d+)?(?:;-?\d+(?:\.\d+)?)*$/;
    static regex3 = /^(-?\d+)-(-?\d+)$/;
    /**
     * Sorts a number array
     */
    static sortNumberArray(a, b) {
        return a - b;
    };

    static lineOrPolygonize(geojson) {
        for (let feature of geojson.features) {
            if ((
                    feature.geometry.type === 'LineString' ||
                    feature.geometry.type === 'MultiLineString'
                ) && toolbox.poly_vs_line(feature.properties)) {
                feature.geometry = lineToPolygon(feature).geometry;
            } else if ((
                    feature.geometry.type === 'Polygon' ||
                    feature.geometry.type === 'MultiPolygon'
                ) && !toolbox.poly_vs_line(feature.properties)) {
                feature.geometry = polygonToLine(feature).geometry;
            }
        }
    }

    static poly_vs_line(properties) {
        // true: Polygon
        // false: LineString
        if (properties == null) {
            return false;
        }
        if (
            properties.building != null &&
            properties.building !== 'no') {
            return true;
        }
        if (
            properties.indoor === 'room' ||
            properties.indoor === 'wall') {
            return false;
        }
        if (
            properties.indoor === 'area' ||
            properties.indoor === 'corridor') {
            return true;
        }
        if (
            properties.highway === 'footway') {
            return false;
        }
        return false
    }

    static isRelation(feature) {
            if (!('properties' in feature && 'osm_id' in feature.properties)) {
                return -1;
            }
            return feature.properties.osm_id.startsWith('a');
        }
        /**
         * Parses levels list.
         * @param str The levels as a string (for example "1;5", "1,3", "1-3", "-1--6", "from 1 to 42" or "-2 to 6")
         * @return The parsed levels as a float array, or null if invalid
         */
    static parseLevelsFloat(str) {
        var result = null;

        //Level values separated by ';'
        var regex1 = /^-?\d+(?:\.\d+)?(?:;-?\d+(?:\.\d+)?)*$/;

        //Level values separated by ','
        var regex2 = /^-?\d+(?:\.\d+)?(?:,-?\d+(?:\.\d+)?)*$/;

        if (regex1.test(str)) {
            result = (str + '').split(';');
            for (var i = 0; i < result.length; i++) {
                result[i] = parseFloat(result[i]);
            }
            result.sort(toolbox.sortNumberArray);
            if (str === "1;3;4") {
                console.log('levels:', result);
            }
        } else if (regex2.test(str)) {
            result = str.split(',');
            for (var i = 0; i < result.length; i++) {
                result[i] = parseFloat(result[i]);
            }
            result.sort(toolbox.sortNumberArray);
        }
        //Level intervals
        else {
            var regexResult = null;
            var min = null;
            var max = null;

            //Level values (only integers) in an interval, bounded with '-'
            var regex3 = /^(-?\d+)-(-?\d+)$/;

            //Level values from start to end (example: "-3 to 2")
            var regex4 = /^(?:\w+ )?(-?\d+) to (-?\d+)$/;

            if (regex3.test(str)) {
                regexResult = regex3.exec(str);
                min = parseInt(regexResult[1]);
                max = parseInt(regexResult[2]);
            } else if (regex4.test(str)) {
                regexResult = regex4.exec(str);
                min = parseInt(regexResult[1]);
                max = parseInt(regexResult[2]);
            }

            //Add values between min and max
            if (regexResult != null && min != null && max != null) {
                result = [];
                if (min > max) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                }

                //Add intermediate values
                for (var i = min; i != max; i = i + ((max - min) / Math.abs(max - min))) {
                    result.push(i);
                }
                result.push(max);
            }
        }

        return result;
    };
    static parseLevelsFloat_old(str) {
        var result = null;

        //Level values separated by ';'
        if (toolbox.regex1.test(str)) {
            result = str.split(';');
            for (var i = 0; i < result.length; i++) {
                result[i] = parseFloat(result[i]);
            }
            result.sort(toolbox.sortNumberArray);
            // console.log('result:', result)
        }
        //Level intervals
        else {
            var regexResult = null;
            var min = null;
            var max = null;

            //Level values (only integers) in an interval, bounded with '-'
            if (toolbox.regex3.test(str)) {
                regexResult = toolbox.regex3.exec(str);
                min = parseInt(regexResult[1]);
                // if (isNaN(min)) {
                // console.log('min:', min)
                // }
                max = parseInt(regexResult[2]);
                // if (isNaN(max)) {
                // console.log('max:', max)
                // }
            }

            //Add values between min and max
            if (regexResult != null && min != null && max != null) {
                result = [];
                if (min > max) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                }

                //Add intermediate values
                for (var i = min; i != max; i = i + ((max - min) / Math.abs(max - min))) {
                    result.push(i);
                }
                // if (max === NaN) {
                //     console.log('max:', str)
                // }
                result.push(max);
            }
        }
        return result;
    };

    static openindoorize(geojson) {


        // Add name point for indoor=room
        let anchors = [];
        for (let feature of geojson.features.filter(
                (feat_) => {
                    if (feat_.properties != null &&
                        (
                            feat_.properties.indoor === 'room' ||
                            feat_.properties.indoor === 'wall')
                    ) {
                        return true;
                    }
                    return false;
                })) {
            let point = centroid(feature);
            let anchor = buffer(point, 0.2, { units: 'meters' });

            anchor.geometry = buffer(anchor, 0.1, { units: 'meters' }).geometry

            anchor.id = window.crypto.getRandomValues(new Uint32Array(1))[0];
            // anchor.properties = feature.properties;
            anchor.properties = JSON.parse(JSON.stringify(feature.properties))

            anchor.properties.feature_type = "anchor";
            anchors.push(anchor);

            feature.properties.feature_type = "unit";

        }
        geojson.features.push(...anchors);


        // Set name with ref
        for (let feature of geojson.features.filter(
                feat_ =>
                feat_.properties != null &&
                feat_.properties.name == null
            )) {
            if (feature.properties.ref != null)
                feature.properties.name = feature.properties.ref;
        }


        // Buffer walls indoor=room
        let walls = [];
        for (let feature of geojson.features.filter(
                (feat_) => {
                    if (feat_.properties != null &&
                        feat_.properties.indoor != null &&
                        feat_.properties.feature_type !== "anchor" &&
                        (
                            feat_.properties.indoor === 'room' ||
                            feat_.properties.indoor === 'wall'
                        )
                    ) {
                        return true;
                    }
                    return false;
                })) {

            let wall = buffer(feature, 0.1, { units: 'meters' });
            wall.id = window.crypto.getRandomValues(new Uint32Array(1))[0];
            wall.properties = JSON.parse(JSON.stringify(feature.properties));
            wall.properties.feature_type = "fixture";
            walls.push(wall);
        }
        geojson.features.push(...walls);


        // remove door wall
        let doors = geojson.features.filter((feat_) => {
            if (feat_.properties != null && (
                    feat_.properties.door != null ||
                    feat_.properties.indoor === "door"
                )) {
                return true;
            }
            return false;
        });
        let new_doors = [];
        for (let room of geojson.features.filter(
                (feat_) => {
                    if (feat_.properties != null &&
                        feat_.properties.indoor === 'room' && (
                            feat_.geometry.type === 'Polygon' ||
                            feat_.geometry.type === 'MultiPolygon'
                        )
                    ) {
                        return true;
                    }
                    return false;
                })) {
            // if door connected to room
            // than make space for door in the wall
            let room_doors = doors.filter((door_) => {
                return door_.properties.min_level >= parseInt(room.properties.min_level) &&
                    door_.properties.max_level <= parseInt(room.properties.max_level) &&
                    booleanContains(room, door_);
            })
            if (room_doors.length === 0)
                continue
                // console.log("for this room:", room)
                // console.log("find this doors:", room_doors)
            for (let door of room_doors) {
                let door_circle = buffer(door, 0.45, { units: 'meters' })
                let diff = difference(room, door_circle);
                let intersect_ = intersect(room, door_circle);
                if (!(door.properties.min_level >= parseInt(room.properties.min_level) &&
                        door.properties.max_level <= parseInt(room.properties.max_level)))
                    continue;
                if (diff != null)
                    room.geometry = diff.geometry;
                if (intersect_ != null) {
                    let new_door = clone(door);
                    new_door.geometry = intersect_.geometry;
                    new_doors.push(new_door)
                }
            }
        }
        geojson.features.push(...new_doors);
    }

    static fix_indoor(geojson) {
        // repeat_on tag
        // console.log('size:', geojson.features.length)
        let count = 0;
        let new_features = [];

        // for (let feature of geojson.features.filter(feat_ => (
        //         (feat_.properties !== undefined) &&
        //         (feat_.properties.indoor === "room")
        //     ))) {
        //     feature.geometry = buffer(feature, 0.1, { units: 'meters' }).geometry
        // }

        for (let feature of geojson.features) {
            if (feature.properties === undefined)
                continue;
            if (feature.properties === null)
                feature.properties = {};
            // console.log('feature:', feature);
            if (!('tags' in feature.properties))
                continue;
            for (const [key, value] of Object.entries(feature.properties.tags)) {
                feature.properties[key] = value;
            }
        }

        for (let feature of geojson.features) {
            count++;
            if (!('properties' in feature))
                continue
            if (feature.properties === null)
                feature.properties = {};

            // console.log('count:', count)
            if ('repeat_on' in feature.properties) {
                let levels = toolbox.parseLevelsFloat(feature.properties.repeat_on);
                if (levels != null) {
                    // let first = true;
                    delete feature.properties.repeat_on;
                    for (let level of levels) {
                        // if (first) {
                        //     first = false
                        //     feature.properties.level = level
                        //     continue
                        // }
                        let new_feature = clone(feature);
                        new_feature.properties.level = level + '';
                        new_features.push(new_feature)
                    }
                }
            }
        }
        geojson.features.push(...new_features)

        // min_level/max_level tag
        for (let feature of geojson.features) {
            if (feature.properties === null)
                feature.properties = {};
            if ('level' in feature.properties) {
                let levels = toolbox.parseLevelsFloat(feature.properties.level);
                // console.log('levels:', levels)
                if (levels === null) {
                    console.log('feature.properties.level:', feature.properties.level)
                    continue
                }
                feature.properties.min_level = levels[0];
                feature.properties.max_level = levels[levels.length - 1];
            } else {
                feature.properties.min_level = 0;
                feature.properties.max_level = 0;
            }
        }

        // building level gap
        let building_min_level = 0
        for (let feature of geojson.features) {

            building_min_level = Math.min(
                building_min_level,
                feature.properties.min_level
            )
        }

        for (let feature of geojson.features) {
            if (!('properties' in feature)) {
                feature.properties = {}
            }
            feature.properties.gap_level = 0
            if (building_min_level < 0) {
                feature.properties.gap_level = 0 - building_min_level
                    // console.log('gap_level:', feature.properties.gap_level)
            }
        }
        // console.log('geojson.features:', geojson.features)

        // fix labels
        // for (let feature of geojson.features) {
        //     if (!('properties' in geojson.features)) {
        //         geojson.features.properties = {}
        //     }
        //     feature.properties.gap_level = -building_min_level
        //         // console.log('gap_level:', feature.properties.gap_level)
        // }

        // let centers = [];
        // console.log('dealing with ref')
        // for (let feature of geojson.features.filter(
        //         feat_ =>
        //         'properties' in feat_ && 'ref' in feat_.properties
        //     )) {
        //     console.log('ref feature:', feature)
        //     let center = centroid(feature);
        //     center.properties = {
        //         ref: feature.properties.ref
        //     }
        //     centers.push(center);
        //     // delete feature.properties.ref;

        // }
        // geojson.features.push(...centers);
        return geojson;
    }

}


export default toolbox