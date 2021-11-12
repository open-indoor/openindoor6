import './style.css'

import maplibregl from 'maplibre-gl'


import indoor_layers from './layers/indoor.json';
import building_layers from './layers/building.json';

import addMapDOM from "./addMapDOM"
import mapstyle from "./mapstyle"
import pinsStyle from "./pinsStyle"
import urlparser from "./urlparser"
import openindoor_machine from "./openindoor_machine"

addMapDOM()

const map = new maplibregl.Map({
    'container': 'map',
    'center': [-1.70188, 48.11915],
    'bearing': 0,
    'zoom': 17,
    'style': mapstyle(),
});

pinsStyle(map)



let statemachine = openindoor_machine(map)

urlparser(map);
// controls.activateLevelControl()
// controls.deactivateLevelControl()