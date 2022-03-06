function urlparser(map, statemachine, options = {}) {
    // https://app-dev.openindoor.io/?source=josm
    let source = undefined;
    let layer = undefined;
    let bbox = undefined;
    let building_id = undefined;
    let level = undefined;
    let feature_key = undefined;
    let feature_id = undefined;

    const urlParams = new URLSearchParams(window.location.search);

    source = urlParams.get('source');
    console.log('source:', source);
    if (source === 'josm') {
        source = "http://localhost:8432/openindoor.geojson";
    }

    layer = urlParams.get('layer');

    const bb = urlParams.get('bbox');
    console.log('bb:', bb);
    if (bb) {
        let my_bbox = bb.split(',');
        bbox = [
            [parseFloat(my_bbox[0]), parseFloat(my_bbox[1])],
            [parseFloat(my_bbox[2]), parseFloat(my_bbox[3])]
        ];
    }

    building_id = urlParams.get('buildingId');

    level = urlParams.get('level');

    feature_key = urlParams.get('feature_key');

    feature_id = urlParams.get('feature_id');

    return {
        source,
        layer,
        bbox,
        building_id,
        level,
        feature_key,
        feature_id,
    };
}

export default urlparser;