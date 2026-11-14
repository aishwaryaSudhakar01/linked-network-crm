/** Calendar dates stay ISO internally; presentation never depends on browser locale. */
export function formatDate(value:string){
  const match=/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
  return match?`${match[2]}/${match[3]}/${match[1]}`:'—';
}
export function parseDate(value:string){
  const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if(!match)return undefined;
  const iso=`${match[3]}-${match[1]}-${match[2]}`;
  const date=new Date(iso+'T12:00:00Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===iso?iso:undefined;
}