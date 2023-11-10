import getUrl from './thumbUrl.mjs';
import channels from './channels.mjs';

import Wheel from './Wheel.mjs'

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

const levels = [
  {
    title: '10 minutes',
    step: 10 * minute,
    perRow: 6,
  },
  {
    title: '1 minute',
    step: 1 * minute,
    perRow: 5,
  },
  {
    title: '5 seconds',
    step: 5 * second,
    perRow: 4
  },
  {
    title: 'Zoomed-in',
    step: 5 * second,
    perRow: 1
  }
]


const App = {
  channel_id: Object.keys(channels)[0],
  oninit() {
    this.level = -1;
    this.redrawTimer = setInterval(()=>{
      m.redraw()
    }, 10*second);
    this.onkeydown = this.onkeydown.bind(this)
    addEventListener('keydown', this.onkeydown)
  },
  onkeydown(e) {
    if (e.key == 'Escape' && this.level >= 0) {
      --this.level
      m.redraw()
    }
  },
  onremove() {
    clearInterval(this.redrawTimer)
  },
  view() {
    const now = new Date();
    let start = new Date(now - 7 * day + hour);
    start.setUTCMinutes(0);
    start.setUTCMilliseconds(0);
    start.setUTCSeconds(0);
    start = +start;
    this.value = this.value || start;
    return [
      m('div', {
          style: {
            display: 'grid',
            height: '100vh',
            gridTemplateRows: 'auto 1fr auto',
          },
        },
        m(Header, {
          channel_id: this.channel_id, 
          t: this.value,
          level: this.level,
          setlevel: v => this.level = +v,
        }),
        this.level < 0 ?
          m(Channels, {
            value: this.channel_id,
            setvalue: v => this.channel_id = v,
            onclick: () => this.level = 0,
          }) :
          m(Schedule, {
            channel_id: this.channel_id,
            level: this.level,
            setlevel: v => this.level = +v,
            value: this.value,
            setvalue: v => this.value = +v,
            start,
            end: now,
          }),
      ),
    ];
  }
};

const Header = {
  view({attrs: {channel_id, t, level, setlevel}}) {
    return m('', {}, [
      m('', {}, [
        m('',{style:'float:right'}, t && new Date(t).toLocaleString('bg')),
        m('',{}, channels[channel_id]),
      ]),
      m('', {}, [
        'View: ', 
        m('label', m('input', {
          type:'radio', 
          checked: level < 0,
          onclick() {
            setlevel(-1)
            this.blur()
          }
        }), 'Channels'),
        Object.entries(levels).map(([idx, {title}]) => m('label', m('input', {
          type:'radio', 
          checked: level == idx,
          onclick() {
            setlevel(idx)
            this.blur()
          },
        }), title)),
        
      ]),
    ])
  }
}

const Channels = {
  view({attrs: {value, setvalue, onclick}}) {
    return m(Wheel, {
      value,
      setvalue,
      options: Object.entries(channels).map(([value, title])=>m('.row', {
        onclick,
        style: {
          outline: '1px solid black',
          fontWeight: '900',
          fontSize: '3em',
          boxSizing: 'border-box',
          padding: '10px',
          outlineOffset: '-5px',
        },
        value
      }, title))
    })
  }
}

const Schedule = {
  view({attrs: {channel_id, start, end, level, setlevel, value, setvalue}}) {
    const settingsKey = [level, channel_id, start].join()
    if (this.lastSettings != settingsKey) {
      this.options = []
      this.lastSettings = settingsKey
    }
    const {step, perRow} = levels[level]
    if (!value || value < start) value = start
    //const activeValue = Math.trunc(value / step) * step
    value = Math.trunc(value / (perRow*step)) * (perRow*step)
    const options = this.options || []
    let lastDay, lastRow
    if (!options.length) {
      for (let t = +start; t < end; t += step) {
        const day = new Date(t);
        day.setMinutes(0);
        day.setHours(0);
        day.setSeconds(0);
        day.setMilliseconds(0);
        if (lastDay != String(day)) {
          lastDay = String(day);
          options.push(m('.day.row.row-'+perRow, {
            key: 'day'+t
          }, lastDay));        
        }
        if (!lastRow || (lastRow.children.length >= perRow)) {
          lastRow = m('.row.row-'+perRow, {
            key: t,
            value: t
          })
          options.push(lastRow)
        }
        lastRow.children.push(m(Thumb, {
          channel_id,
          t,
          //active: activeValue == t,
          showSeconds: step < minute,
          ['data-value']: t,
          onclick: e => {          
            setvalue(+e.target.dataset.value)
            if (level + 1 < levels.length) setlevel(level + 1)
            return false;
          },
        }));
      }
      this.options = options;
    }

    return m(Wheel, {
      setvalue,
      value: value,
      options: options,
    })
  }
}

const Thumb = {
  view({attrs: {t, channel_id, showSeconds, active, ...restAttrs}}) {
    const date = new Date(t)
    const seconds = date.getSeconds()
    const formatted = date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0') + (seconds || showSeconds ? ':' + String(seconds).padStart(2, '0') : '');
    return m('a', {
      className: 'thumb'+ (active ? ' active' : ''),
      value: t,
      href: getUrl(channel_id, t),
      target: '_blank',
      onclick() {return false},
      tabIndex: 0,
      ...restAttrs,
      style: {
        ...restAttrs.style ?? {},
        '--url0': `url(${getUrl(channel_id, t)})`,
      },
      oncreate(vnode) {
        if (seconds) {
          const img = new Image
          img.src = getUrl(channel_id, t)
          img.onload = () => {
            const count = img.naturalWidth * 9 / (16 * img.naturalHeight)
            const idx = Math.round(seconds/5)
            const percent = count > 1 ? idx*100/(count-1) + '%' : img.naturalWidth + 'px'
            vnode.dom.dataset.count = count
            vnode.dom.dataset.idx = idx
            vnode.dom.dataset.percent = percent
            vnode.dom.style.backgroundPosition = `${percent} 0`
          }
        }
      },
    }, formatted)    
  }
}

m.mount(document.body, App);
