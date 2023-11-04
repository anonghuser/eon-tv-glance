import getUrl from './thumbUrl.mjs';
import channels from './channels.mjs';

let channel_id = Object.values(channels)[0];

const App = {
  view() {
    const hour = 60*60*1000;
    const day = 24 * hour;
    const now = new Date();
    const start = new Date(now - 7 * day + hour);
    start.setUTCMinutes(0);
    start.setUTCMilliseconds(0);
    start.setUTCSeconds(0);
    
    return [
      m('div', {},
        m('select', {
          oninput(e) {channel_id = e.target.value},
          value: channel_id,
        }, Object.entries(channels).map(([title, value])=>m('option', {value}, title))),
      ),
      m(Schedule, {
        channel_id,
        start,
        end: now,
        step: hour / 6,
      }),
    ];
  }
};

const Schedule = {
  view({attrs: {channel_id, start, end, step}}) {
    const result = [];
    let lastDay;
    for (let t = +start; t < end; t += step) {
      const time = new Date(t).getHours() + ':' + String(new Date(t).getMinutes()).padStart(2, '0');
      
      const day = new Date(t);
      day.setMinutes(0);
      day.setHours(0);
      if (lastDay != String(day)) {
        lastDay = String(day);
        result.push(m('.day', {}, lastDay));        
        result.push(m('.thumb-wrapper'));        
      }
      result[result.length-1].children.push(m('a.thumb', {
        href: getUrl(channel_id, t),
        target: '_blank',
        onclick() {return false},
        tabIndex: 0,
        style: {
          '--url0': `url(${getUrl(channel_id, t)})`,
          '--url1': `url(${getUrl(channel_id, t+60000)})`,
          '--url2': `url(${getUrl(channel_id, t+2*60000)})`,
          '--url3': `url(${getUrl(channel_id, t+3*60000)})`,
          '--url4': `url(${getUrl(channel_id, t+4*60000)})`,
          '--url5': `url(${getUrl(channel_id, t+5*60000)})`,
          '--url6': `url(${getUrl(channel_id, t+6*60000)})`,
          '--url7': `url(${getUrl(channel_id, t+7*60000)})`,
          '--url8': `url(${getUrl(channel_id, t+8*60000)})`,
          '--url9': `url(${getUrl(channel_id, t+9*60000)})`,
        },
      }, time));
    }
    return result;
  }
}
m.mount(document.body, App);
