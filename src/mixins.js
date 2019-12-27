import {render} from 'lit-html';

export const Mixins = function(clazz) { return [
    {
        name: 'init',
        fn: function(template, model) {
            this.dom = {};
            this.model = model ? model : {};
            this.template = template;
            this.attachShadow( { mode: 'open' } );
            this.render();
        }
    }, {
        name: 'render',
        fn: function() {
            if (this.template) {
                render(this.template.render(this, this.model), this.shadowRoot);
            }
        }
    }]
};

export const Reflect = function(clazz, options) {
    let changeCallbackFnName = 'propertyChangedCallback';
    if (options && options.changeCallbackFnName) {
        changeCallbackFnName = options.changeCallbackFnName;
    }

    const decorators = [];
    const props = clazz.observedAttributes;
    if (props) {
        for (let c = 0; c < props.length; c++) {
            decorators.push({ name: props[c], accessors: {
                    set: function (val) {
                        const old = this.getAttribute(props[c]);
                        if (val === false) {
                            this.removeAttribute(props[c]);
                        } else {
                            this.setAttribute(props[c], val);
                        }
                        if (this[changeCallbackFnName]) {
                            this[changeCallbackFnName](props[c], old, val);
                        }
                    },

                    get: function () {
                        return this.getAttribute(props[c]);
                    }
                }});
        }

        decorators.push( {
            name: 'attributeChangedCallback',
            fn: function(name, oldval, newval) {
                if (this[changeCallbackFnName]) {
                    this[changeCallbackFnName](name, oldval, newval);
                }
            }
        });
    }

    return decorators;
}

export const Decorate = function(clazz, decorators, options) {
    if (!Array.isArray(decorators)) {
        decorators = [decorators];
    }
    const processDecorator = function(d) {
        if (d.fn) {
            clazz.prototype[d.name] = d.fn;
        } else if (d.accessors) {
            Object.defineProperty(clazz.prototype, d.name, d.accessors);
        } else {
            d(clazz, options).forEach( d => processDecorator(d));
        }
    };

    decorators.forEach(d => {
        processDecorator(d);
    });

    return clazz;
};


export const Register = function(tag, clazz, decorators, noReflect) {
    let deco = decorators ? decorators : [];
    if (!Array.isArray(deco)) {
        deco = [deco];
    }
    if (!noReflect) {
        deco.push(Reflect);
    }

    if (!customElements.get(tag)) {
        customElements.define(tag, Decorate(clazz, deco));
    }
};
