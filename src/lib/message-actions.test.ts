import {describe,it,expect,vi} from 'vitest';
import {blankContact} from './contacts';
import {messageActions,copyThenOpen} from './message-actions';
describe('message destinations',()=>{
 it('keeps Copy available when no destinations are saved',()=>expect(messageActions(blankContact())).toEqual({chat:undefined,linkedin:undefined,email:undefined,existing:false}));
 it('new contacts expose only saved Gmail and LinkedIn destinations',()=>expect(messageActions({...blankContact(),email:'a@example.com',linkedin_url:'https://linkedin.com/in/a'})).toMatchObject({existing:false,chat:undefined,email:'a@example.com',linkedin:'https://linkedin.com/in/a'}));
 it('a saved chat link establishes an existing conversation regardless of age',()=>expect(messageActions({...blankContact(),chat_link:'https://example.com/chat'})).toMatchObject({existing:true,chat:'https://example.com/chat'}));
 it('history without a chat link uses existing layout without a chat action',()=>expect(messageActions({...blankContact(),interactions:[{id:'1',date:'2026-11-01',channel:'Email',summary:'',meeting_notes:''}]})).toMatchObject({existing:true,chat:undefined}));
 it('rejects executable schemes for both link destinations',()=>expect(messageActions({...blankContact(),chat_link:'javascript:alert(1)',linkedin_url:'data:text/html,test'})).toMatchObject({chat:undefined,linkedin:undefined}));
 it('copies, notifies, then opens in that exact order',async()=>{const events:string[]=[];await copyThenOpen('hello','https://example.com',async text=>{events.push(text);},()=>events.push('copied'),url=>events.push(url));expect(events).toEqual(['hello','copied','https://example.com']);});
 it('never opens or reports success when clipboard fails',async()=>{const notify=vi.fn();const open=vi.fn();await expect(copyThenOpen('hello','https://example.com',async()=>{throw new Error('denied');},notify,open)).rejects.toThrow('denied');expect(open).not.toHaveBeenCalled();expect(notify).not.toHaveBeenCalled();});
 it('Copy without a URL never navigates',async()=>{const open=vi.fn();const copy=vi.fn().mockResolvedValue(undefined);await copyThenOpen('hello',undefined,copy,()=>{},open);expect(copy).toHaveBeenCalledWith('hello');expect(open).not.toHaveBeenCalled();});
});