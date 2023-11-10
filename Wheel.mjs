const Wheel = {
  lastDirection:0,
  oncreate(vnode) {
    this.onupdate(vnode)
  },
  onupdate(vnode) {
  },
  view(vnode) {
    const {attrs: {value, options = vnode.children}} = vnode    
    const extraRows = 25
    const selectedIndex = options.findIndex(el => el?.attrs?.value === value)
    if (selectedIndex == -1) {
      throw new Error('Given value not among options.')
    }
    
    const onchange = vnode.attrs.onchange || vnode.attrs.oninput || function(e) {
      const cb = vnode.attrs.setValue || vnode.attrs.setvalue
      if (!cb) return
      cb(e.target.value)
    }
    
    const visible = options.slice(
      Math.max(selectedIndex-extraRows, 0), 
      selectedIndex+extraRows+1)
    const centerIndex = visible.findIndex(el => el === options[selectedIndex])
    const direction = this.lastDirection
    this.lastDirection = 0
    this.positionWrappers = visible.map((el, i) => ({
      ...el,
      attrs: {
        ...el.attrs ?? {},
        style: {
          ...el.attrs?.style ?? {},
          position: 'absolute',
          width: '100%',
          top: '50%',
          transform: `translateY(${(i-centerIndex)*100-50}%)`,
          transition: 'transform .6s ease-out',
        },
        onclick: e => {
          const vnode = this.positionWrappers.find(el => el.dom == e.target)
          onchange({target: vnode.attrs})
          el.attrs?.onclick?.(e)
        },
        oncreate: (vnode) => {
          el.attrs.oncreate?.(vnode)
          vnode.dom.animate([
            {transform: `translateY(-50%) translateY(${direction}00vh)`},
            {}
          ], 600)
        },
        onbeforeremove: (vnode) => {
          return Promise.all([
            el.attrs.onbeforeremove?.(vnode),
            new Promise(resolve=>vnode.dom.animate([
              {opacity:  `0`},
            ], 600).onfinish=resolve)
          ]);
        },
      },
      key: el.key ?? i-centerIndex+selectedIndex,
    }))
    
    return m('div', {
      style: {
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        ...vnode.attrs?.style ?? {},
      },
      onwheel: e => {
        if (e.deltaY) {
          this.lastDirection = (e.deltaY > 0 ? 1 : -1)
          let newIndex = selectedIndex + this.lastDirection
          while (options[newIndex] && options[newIndex].attrs.value == null) {
            newIndex = newIndex + this.lastDirection
          }
          if (options[newIndex]) {
            onchange({target: options[newIndex].attrs})
          }
          return false
        }
      },
    }, this.positionWrappers)
  }
}
export default Wheel