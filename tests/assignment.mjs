import assert from 'node:assert/strict';
import {baseplateExample as e,assignedTemperatures,temperatureSpan}from'../js/baseplate-example.js';
const permutations=a=>a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
assert.deepEqual(e.states.map(temperatureSpan),[16,8,0]);
assert.equal(temperatureSpan(e.states[2]),Math.min(...permutations(e.states[0]).map(temperatureSpan)));
assert.deepEqual(assignedTemperatures(e.states[2]),[720,720,720,720,720]);
for(let i=1;i<e.states.length;i++)assert.equal(e.states[i].filter((v,j)=>v!==e.states[i-1][j]).length,2,'Each movement exchanges exactly two baseplates');
console.log('Two exchanges preserve all five baseplates and reach the optimal assignment for the labelled illustrative fixture.');
