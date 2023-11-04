// sample thumb url:
// https://ffrw-web.vivacom-be.cdn.united.cloud/channel/281/1/2023-07-09/281_1688898600000.webp

const z = n => String(n).padStart(2, '0');
const c = f => ({y: 'getUTCFullYear', m: 'getUTCMonth', d: 'getUTCDate'})[f];
const d = (ts, f) => z(new Date(ts)[c(f)]()+(f=='m'));

export let baseUrl = 'https://ffrw-web.vivacom-be.cdn.united.cloud';
export const getUrl = (channel_id, timestamp) => `${baseUrl}/channel/${channel_id}/1/${d(timestamp, 'y')}-${d(timestamp, 'm')}-${d(timestamp, 'd')}/${channel_id}_${+new Date(timestamp)}.webp`;
export default getUrl;
