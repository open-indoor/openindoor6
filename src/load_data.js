function load_data(
    map,
    statemachine,
    source,
    layer,
    state,
    building_id,
    level,
    feature_key,
    feature_id,
    icon_tags
) {
    if (layer != null) {
        if (["fair", "office", "station"].includes(layer)) {
            statemachine.set_layer(layer);
        } else if (layer.match(/\.json$/i)) {
            statemachine.set_layer(layer);
        }
    }
    if (state != null && ["building_state", "indoor_state"].includes(state)) {
        statemachine.init_mode = state;
    }

    if (source != null) {
        let my_url = source;
        let my_geojson = fetch(my_url, {
            method: 'GET',
            mode: 'cors',
        }).then(function(response) {
            console.log('response.ok:', response.ok)
            console.log('response received')
            console.log('Status:', response.status);
            return response.json();
        }).then(function(json) {
            console.log('json:', json);
            console.log('my_building_id:', building_id);
            statemachine.parse(
                JSON.stringify(json),
                "geojson", {
                    building_id: building_id,
                    level: level,
                    feature_key: feature_key,
                    feature_id: feature_id,
                    icon_tags: icon_tags
                }
            );
            // statemachine.setFloorState();
        }).catch(error => {
            console.log(error); //TypeError: "NetworkError when attempting to fetch resource."
        })
    }
}

export default load_data;