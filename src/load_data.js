function load_data(
    map,
    statemachine,
    source,
    layers,
    state,
    building_id,
    level,
    feature_key,
    feature_id,
    icon_tags
) {

    console.log('layers:', layers);
    if (layers != null &&
        layers.length > 0 &&
        layers[0].indoor != null &&
        layers[0].indoor.url != null) {
        if (layers[0].indoor.url.match(/\.json$/i)) {
            statemachine.set_indoor_layers(layers[0].indoor.url);
        }
    }
    if (layers != null &&
        layers.length > 0 &&
        layers[0].building != null &&
        layers[0].building.url != null) {
        console.log('layers.building.url:', layers[0].building.url);
        if (layers[0].building.url.match(/\.json$/i)) {
            statemachine.set_building_layers(layers[0].building.url);
        }
    }


    // if (indoor_layers != null && indoor_layers.url != null) {
    //     if (["fair", "office", "station"].includes(indoor_layers)) {
    //         statemachine.set_indoor_layers(indoor_layers.url);
    //     } else if (indoor_layers.match(/\.json$/i)) {
    //         statemachine.set_indoor_layers(indoor_layers.url);
    //     }


    // }
    // if (building_layers != null && building_layers.url != null && layer.match(/\.json$/i)) {
    //     statemachine.set_building_layers(building_layers.url);
    // }

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