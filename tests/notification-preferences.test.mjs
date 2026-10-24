import test from 'node:test';
import assert from 'node:assert/strict';
import {createNotificationState} from '../notification-centre.js';

test('notification preferences persist without removing history',()=>{
 let data=null;const storage={getItem:()=>data,setItem:(_,value)=>{data=value;}};
 const initial=createNotificationState(storage);initial.setEnabled(false);
 const next=createNotificationState(storage);assert.equal(next.enabled,false);assert.equal(next.items.length,3);
 next.setEnabled(true);assert.equal(createNotificationState(storage).enabled,true);
});
test('bubbler reminder mutes expire at local midnight or seven days',()=>{
 let data=null;const storage={getItem:()=>data,setItem:(_,value)=>{data=value;}};
 const now=new Date(2026,9,24,15,30).getTime(),midnight=new Date(2026,9,25).getTime();
 const state=createNotificationState(storage);state.mute('temperature','today',now);
 assert.equal(createNotificationState(storage).muted('temperature',midnight-1),true);
 assert.equal(state.muted('temperature',midnight),false);
 state.mute('temperature','week',now);const end=new Date(now+7*24*60*60*1000);
 assert.equal(createNotificationState(storage).muted('temperature',end.getTime()-1),true);
 assert.equal(state.muted('temperature',end.getTime()),false);
 state.mute('pressure','week',now);assert.equal(state.muted('pressure',now),false);
});
test('unavailable or malformed storage does not break notification controls',()=>{
 for(const raw of ['invalid','null','{"mutes":"bad"}','{"mutes":[]}']){
  const state=createNotificationState({getItem:()=>raw,setItem(){throw Error('denied');}});
  state.mute('temperature','today');state.setEnabled(false);assert.equal(state.enabled,false);
 }
 const state=createNotificationState({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});
 assert.equal(state.enabled,true);state.setEnabled(false);
});
