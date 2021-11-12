// import openindoor_pin from './img/openindoor_pin.svg'


function pinsStyle(map) {

    map.on('load', function() {

        // map.loadImage(
        //     'https://img.openindoor.io/openindoor_pin.png',
        //     function(error, image) {
        //         if (error) throw error;
        //         map.addImage('openindoor_pin', image);
        //         map.addLayer({
        //             'id': 'points',
        //             'type': 'symbol',
        //             'source': 'pins',
        //             "source-layer": "pins",
        //             'layout': {
        //                 'icon-image': 'openindoor_pin',
        //                 'icon-size': 1
        //             },
        //             "paint": {
        //                 "icon-opacity": [
        //                     "interpolate", [
        //                         "linear"
        //                     ],
        //                     [
        //                         "zoom"
        //                     ],
        //                     15, 1,
        //                     17,
        //                     0
        //                 ]
        //             }
        //         });
        //     }
        // );
        map.addLayer({
            'id': 'heatmap',
            'type': 'heatmap',
            'source': 'pins',
            "source-layer": "pins",
            'maxzoom': 15,
            'paint': {
                // Increase the heatmap weight based on frequency and property magnitude
                'heatmap-weight': 1,
                // Increase the heatmap color weight weight by zoom level
                // heatmap-intensity is a multiplier on top of heatmap-weight
                'heatmap-intensity': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    0,
                    1,
                    15,
                    30
                ],
                // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                // Begin color ramp at 0-stop with a 0-transparancy color
                // to create a blur-like effect.
                'heatmap-color': [
                    'interpolate', ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(33,102,172,0)',
                    0.2,
                    'rgb(103,169,207)',
                    0.4,
                    'rgb(209,229,240)',
                    0.6,
                    'rgb(253,219,199)',
                    0.8,
                    'rgb(239,138,98)',
                    1,
                    'rgb(178,24,43)'
                ],
                // Adjust the heatmap radius by zoom level
                'heatmap-radius': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    0,
                    10,
                    15,
                    20
                ],
                // Transition from heatmap to circle layer by zoom level
                'heatmap-opacity': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    7,
                    1,
                    15,
                    0
                ]
            }
        });

    });
}
export default pinsStyle;