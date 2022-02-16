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

    // if (layer == null) layer = options.layer;
    // console.log('layer:', layer);
    // if (layer != null && ["fair", "office", "station"].includes(layer)) {
    //     statemachine.set_layer(layer);
    // }


    // if (building_id != null) {
    //     statemachine.set_building_id(building_id);
    // }

    // if (source != null) {
    //     let my_url = undefined;
    //     if (source === 'josm') {
    //         my_url = "http://localhost:8432/openindoor.geojson";
    //     } else if (source === 'kingconf') {
    //         my_url = "https://data.openindoor.io/kingconf/kingconf.geojson";
    //         statemachine.init_mode = "indoor_state";
    //     } else if (source === 'taktik') {
    //         my_url = "https://data.openindoor.io/taktik/taktik.geojson";
    //         statemachine.init_mode = "indoor_state";
    //         // } else if (mode === 'indoor') {
    //         //     statemachine.init_mode = "indoor_state";
    //     } else if (source === 'techologis') {
    //         my_url = "https://data.openindoor.io/techologis/techologis.geojson";
    //         statemachine.init_mode = "building_state";
    //     }
    //     if (my_url == null)
    //         return;
    //     console.log("source detected");
    //     let my_geojson = fetch(my_url, {
    //         method: 'GET',
    //         mode: 'cors',
    //     }).then(function(response) {
    //         console.log('response.ok:', response.ok)
    //         console.log('response received')
    //         console.log('Status:', response.status);
    //         return response.json();
    //     }).then(function(json) {
    //         console.log('json:', json);
    //         statemachine.parse(JSON.stringify(json), "geojson");
    //         // statemachine.setFloorState();
    //     }).catch(error => {
    //         console.log(error); //TypeError: "NetworkError when attempting to fetch resource."
    //     })
    // }

    // if (bbox != null) {
    //     // https: //www.openstreetmap.org/api/0.6/map?bbox=2.4282%2C48.9419%2C2.4423%2C48.9483
    //     let my_bbox = bbox.split(',');
    //     console.log('my_bbox:', my_bbox);
    //     // 2.25057,47.73767,2.25758,47.74098
    //     // [[-79, 43], [-73, 45]]
    //     let bb = [
    //         [parseFloat(my_bbox[0]), parseFloat(my_bbox[1])],
    //         [parseFloat(my_bbox[2]), parseFloat(my_bbox[3])]
    //     ];
    //     console.log('bb:', bb);
    //     map.setMaxBounds(bb);
    //     // statemachine.set_building_id()
    // }

    // if (level != null) {
    //     statemachine.set_level(level);
    // }
}

export default urlparser;