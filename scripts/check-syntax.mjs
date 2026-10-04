import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const files=(await fs.readdir('.')).filter(f=>f.endsWith('.js'));
for(const dir of ['scripts','tests']) for(const f of await fs.readdir(dir)) if(f.endsWith('.mjs')) files.push(`${dir}/${f}`);
for(const file of files){
 const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 if(check.status!==0){process.stderr.write(check.stderr);process.exitCode=1;}
}
if(!process.exitCode)console.log(`Syntax checked ${files.length} JavaScript modules.`);
