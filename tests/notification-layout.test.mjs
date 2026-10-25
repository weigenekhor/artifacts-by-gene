import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {notificationCard,notificationGlyph,createNotificationState,sampleNotifications} from '../notification-centre.js';

test('Notification header matches desktop controls without obsolete rows',async()=>{
 const html=await fs.readFile('index.html','utf8');
 const panel=html.match(/<section id="notification-centre"[\s\S]*?<\/section>/)[0];
 const header=panel.match(/<header>[\s\S]*?<\/header>/)[0];
 assert.ok(header.indexOf('data-notifications-enabled')<header.indexOf('data-read-notifications'));
 assert.match(header,/data-notification-header-icon/);
 assert.match(header,/aria-label="All notifications" aria-pressed="true"/);
 assert.doesNotMatch(panel,/type="checkbox"|notification-demo|<footer>|data-reset-notifications/);
 assert.match(panel,/This website does not monitor equipment/);
});

test('Cards retain content, safe wrapping, native action order and separate reminder actions',async()=>{
 const html=notificationCard({...sampleNotifications[2],message:'C:\\Reports\\'+'long-file-'.repeat(50)+'<raw>.xlsx'});
 assert.match(html,/long-file-/);assert.match(html,/&lt;raw&gt;/);assert.doesNotMatch(html,/<raw>|<dl>/);
 assert.ok(html.indexOf('notification-entry-actions')<html.lastIndexOf('data-delete-notification'));
 const bubbler=notificationCard(sampleNotifications[1]);
 assert.match(bubbler,/data-period="today"/);assert.match(bubbler,/data-period="week"/);
 assert.match(bubbler,/data-notification-options/);assert.match(bubbler,/data-dismiss-notification/);
 const css=await fs.readFile('shell.css','utf8');
 assert.match(css,/notification-entry\{[^}]*overflow-wrap:anywhere/);
 assert.match(css,/notification-snooze\{[^}]*flex-direction:column/);
 assert.match(css,/notification-centre header\{[^}]*align-items:center/);
 assert.match(css,/data-notification-count\][^{]*\{[^}]*height:20px;[^}]*align-items:center/);
 assert.match(css,/notification-centre ul\{[^}]*min-height:0;overflow:auto/);
});

test('Dismiss changes unread state and muted reminders stay absent on reopening',()=>{
 let saved;const storage={getItem:()=>saved,setItem:(_,value)=>saved=value};
 const state=createNotificationState(storage);state.dismiss('pressure');
 assert.equal(state.unread,1);assert.equal(state.items.find(i=>i.id==='pressure').dismissed,true);
 state.mute('temperature','week');assert.ok(!state.items.some(i=>i.id==='temperature'));
 assert.ok(!createNotificationState(storage).items.some(i=>i.id==='temperature'));
 state.reset();assert.ok(!state.items.some(i=>i.id==='temperature'));
 assert.notEqual(notificationGlyph('bell'),notificationGlyph('bell_off'));
});

test('All notification themes use current desktop-specific surface and border colours',async()=>{
 const css=await fs.readFile('tokens.css','utf8');
 for(const values of [
  '--notice-bg:#181c22;--notice-raised:#202a32;--notice-edge:#343b48;--notice-badge:#2b4648',
  '--notice-bg:#171a1c;--notice-raised:#202426;--notice-edge:#444d51;--notice-badge:#343c40',
  '--notice-bg:#151319;--notice-raised:#1f1b22;--notice-edge:#433b48;--notice-badge:#473348'
 ])assert.ok(css.includes(values));
});
