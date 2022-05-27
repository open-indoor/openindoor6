import { Feature, Point, LineString, MultiLineString } from "geojson";
import bearing from "@turf/bearing";
import distance from "@turf/distance";
import destination from "@turf/destination";
import lineIntersects from "@turf/line-intersect";
import { flattenEach } from "@turf/meta";
import { point, lineString, Coord, Units } from "@turf/helpers";
import { getCoords } from "@turf/invariant";

// define("nearest-point-on-line", ["require", "exports", "@turf/bearing", "@turf/distance", "@turf/destination", "@turf/line-intersect", "@turf/meta", "@turf/helpers", "@turf/invariant"], function (require, exports, bearing_1, distance_1, destination_1, line_intersect_1, meta_1, helpers_1, invariant_1) {
//     "use strict";
//     Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Takes a {@link Point} and a {@link LineString} and calculates the closest Point on the (Multi)LineString.
 *
 * @name nearestPointOnLine
 * @param {Geometry|Feature<LineString|MultiLineString>} lines lines to snap to
 * @param {Geometry|Feature<Point>|number[]} pt point to snap from
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {Feature<Point>} closest point on the `line` to `point`. The properties object will contain three values: `index`: closest point was found on nth line part, `dist`: distance between pt and the closest point, `location`: distance along the line between start and the closest point.
 * @example
 * var line = turf.lineString([
 *     [-77.031669, 38.878605],
 *     [-77.029609, 38.881946],
 *     [-77.020339, 38.884084],
 *     [-77.025661, 38.885821],
 *     [-77.021884, 38.889563],
 *     [-77.019824, 38.892368]
 * ]);
 * var pt = turf.point([-77.037076, 38.884017]);
 *
 * var snapped = turf.nearestPointOnLine(line, pt, {units: 'miles'});
 *
 * //addToMap
 * var addToMap = [line, pt, snapped];
 * snapped.properties['marker-color'] = '#00f';
 */
function nearestPointOnLine(lines, pt, options = {}) {
    let closestPt = point([Infinity, Infinity], {
        dist: Infinity,
    });
    let length = 0.0;
    flattenEach(lines, function(line) {
        const coords = getCoords(line);
        for (let i = 0; i < coords.length - 1; i++) {
            //start
            const start = point(coords[i]);
            start.properties.dist = distance(pt, start, options);
            //stop
            const stop = point(coords[i + 1]);
            stop.properties.dist = distance(pt, stop, options);
            // sectionLength
            const sectionLength = distance(start, stop, options);
            //perpendicular
            const heightDistance = Math.max(start.properties.dist, stop.properties.dist);
            const direction = bearing(start, stop);
            const perpendicularPt1 = destination(pt, heightDistance, direction + 90, options);
            const perpendicularPt2 = destination(pt, heightDistance, direction - 90, options);
            const intersect = lineIntersects(lineString([
                perpendicularPt1.geometry.coordinates,
                perpendicularPt2.geometry.coordinates,
            ]), lineString([start.geometry.coordinates, stop.geometry.coordinates]));
            let intersectPt = null;
            if (intersect.features.length > 0) {
                intersectPt = intersect.features[0];
                intersectPt.properties.dist = distance(pt, intersectPt, options);
                intersectPt.properties.location =
                    length + distance(start, intersectPt, options);
            }
            if (start.properties.dist < closestPt.properties.dist) {
                closestPt = start;
                closestPt.properties.index = i;
                closestPt.properties.location = length;
            }
            if (stop.properties.dist < closestPt.properties.dist) {
                closestPt = stop;
                closestPt.properties.index = i + 1;
                closestPt.properties.location = length + sectionLength;
            }
            if (intersectPt &&
                intersectPt.properties.dist < closestPt.properties.dist) {
                closestPt = intersectPt;
                closestPt.properties.index = i;
            }
            // update length
            length += sectionLength;
        }
    });
    return closestPt;
}
export default nearestPointOnLine;
// });