import centroid from '@turf/centroid';
import buffer from '@turf/buffer';


class toolbox {
    static regex1 = /^-?\d+(?:\.\d+)?(?:;-?\d+(?:\.\d+)?)*$/;
    static regex3 = /^(-?\d+)-(-?\d+)$/;
    /**
     * Sorts a number array
     */
    static sortNumberArray(a, b) {
        return a - b;
    };


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

    static fix_indoor(geojson) {
        // repeat_on tag
        // console.log('size:', geojson.features.length)
        let count = 0;
        let new_features = [];

        for (let feature of geojson.features.filter(feat_ => (
                (feat_.properties !== undefined) &&
                (feat_.properties.indoor === "room")
            ))) {
            feature.geometry = buffer(feature, 0.1, { units: 'meters' }).geometry
        }

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
                // console.log('repeat on levels:', levels)
                if (levels != null) {
                    // let first = true;
                    for (let level of levels) {
                        // if (first) {
                        //     first = false
                        //     feature.properties.level = level
                        //     continue
                        // }
                        let new_feature = JSON.parse(JSON.stringify(feature));
                        new_feature.level = level;
                        new_features.push(new_feature)
                    }
                }
            }
        }
        geojson.features.push(...new_features)
        console.log('size:', geojson.features.length)

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
        console.log('building_min_level:', building_min_level)

        // if (building_min_level < 0) {
        for (let feature of geojson.features) {
            if (!('properties' in geojson.features)) {
                geojson.features.properties = {}
            }
            feature.properties.gap_level = -building_min_level
                // console.log('gap_level:', feature.properties.gap_level)
        }
        // }
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