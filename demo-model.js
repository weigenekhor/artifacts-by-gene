// Every scene is rendered by ARTIFACTS with its own fixtures and calculations.
// This module selects recorded native states; it never manufactures results.
export function scenesFor(record,theme){return record.scenes.filter(s=>s.theme===theme);}
export function sceneFor(record,theme,id){const scenes=scenesFor(record,theme);return scenes.find(s=>s.scene===id)||scenes.find(s=>s.scene===record.initial)||scenes[0];}
export function chooseScene(record,state,id){
 if(!record.scenes.some(s=>s.scene===id))return state;
 return {scene:id,previous:state.scene};
}
export function initialDemo(record){return {scene:record.initial,previous:null};}
export function sceneChoices(record,theme){return scenesFor(record,theme).filter(s=>s.primary).map(s=>({value:s.scene,label:s.description}));}
