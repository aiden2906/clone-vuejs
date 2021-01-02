let lastFunctionCall;

class Dep{
  constructor(){
    this.subscribers = [];
  }
  depend(func){
    if (func && !this.subscribers.includes(func)){
      this.subscribers.push(func);
    }
  }
  notify(){
    this.subscribers.forEach(sub => sub())
  }
  watcher(func) {
    lastFunctionCall = func;
    lastFunctionCall();
  }
}

class Eye { 
  constructor({data: _d, computed: _c, mounted}) {
    const dep = new Dep();
    const data = (_d || {});
    const computed = {}
    Object.keys(_c).forEach(key => {
      computed[key] = _c[key].bind(this);
    })
    this.mounted = mounted;

    const keyList = Object.keys(data);
    keyList.forEach(key => {
      this[key] = data[key];
    })

    keyList.forEach(key => {
      Object.defineProperty(this, key, {
        get: () => {
          dep.depend(lastFunctionCall);
          return data[key];
        },
        set: (newVal) => {
          data[key] = newVal
          dep.notify();
        },
      })
    })

    Object.keys(computed).forEach(key => {
      dep.watcher(() => {
        this[key] = computed[key]();
      });
    })
    this.mounted.bind(this)();
  }
}

var eye = new Eye({
  data: {
    price: 10, 
    quantity: 10
  }, 
  computed: {
    total() {
      return this.price * this.quantity
    },
    salePrice() {
      return this.price * 0.9
    }
  },
  mounted() {
    console.log('mounted before', this.total);
    this.price = 1;
    console.log('mounted after', this.total);
  }
})

