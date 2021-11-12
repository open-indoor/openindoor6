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

    static fix_indoor(geojson) {
        // repeat_on tag
        // console.log('size:', geojson.features.length)
        let count = 0;
        let new_features = [];

        for (let feature of geojson.features) {
            count++;
            if (!('properties' in feature))
                continue
                // console.log('count:', count)
            if ('repeat_on' in feature.properties) {
                let levels = toolbox.parseLevelsFloat(feature.properties.repeat_on);
                // console.log('repeat on levels:', levels)
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
        geojson.features.push(...new_features)
        console.log('size:', geojson.features.length)

        // min_level/max_level tag
        for (let feature of geojson.features) {
            if ('level' in feature.properties) {
                let levels = toolbox.parseLevelsFloat(feature.properties.level);
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

        return geojson;
    }

}


export default toolbox