"use strict";
var store = [];

/**
 * Opinionated simple Service Locator and injector
 * @author leotomas@sefima.com
 */
class dipsy {

    /**
     * @public
     * Register a service within the service container
     * @param {string} key the name of the service
     * @param {mixed} service the actual function or object to register
     * @param {array} constructorParams array of strings to link dependencies
     * @param {string} custom function to call to act as constructor (useful for factories)
     */
    register(key, service, constructorParams, customConstructor) {
        var p;
        if (this._isNew(key) && this._isValidKey(key)) {
            p =  {
                name: key,
                constructor: this._findConstructor(service, customConstructor),
                service: service,
                params: this._lookupConstructorParams(constructorParams)
            };
            store.push(p);
        } else {
            let err = "This is service name (" + key + ")is already taken, please chose another one";
            throw new Error(err);
        }
    }


    /**
     * @public
     * Instantiates and retrieves a service given its key
     * @param {string} key the service name
     * @return {mixed} the service instantiated with its dependencies injected
     */
    get(key) {
        let service = this._findService(key);
        if (!service) {
            throw Error("cant get service "+key);
        }
        return this._instantiateService(service);
    }


    /**
     * @public
     * Removes a service from the container
     * @param {string} key the service name
     * @returns {integer} the position of the service in the container's store
     */
    destroy(key) {
        let pos = this._findServicePos(key);
        if (pos) {
            store.splice(pos, 1);
        }
        return pos;
    }


    /**
     * @private
     * Is the key valid
     * @param {string} key service name
     * @returns {boolean} true if is valid
     */
    _isValidKey(key) {
        return typeof key === 'string';
    }

    /**
     * @private
     * Instiantiate the service by guessing its constructor
     * is called recursively
     * @param {mixed} service the service object (object or fn/class)
     * @returns {object} the constructed service with deps injected
     */
    _instantiateService(service) {
        var param;
        var constructedClass;
        let constructedService; //le retour
        let constructorMethod = service.constructor;
        let params = service.params;
        let serviceClass = service.service;

        //cas d'une lib ou d'un object
        if (!constructorMethod) {
            return service.service;
        }

        let aliveParams = [];
        if (params && params.length > 0){
            for (param of params){
                constructedClass = this._instantiateService(param);
                aliveParams.push(constructedClass);
            }
        }

        if ("constructor" == constructorMethod) {
            constructedService = this._instantiateWithNew(service, aliveParams);
        } else {
            let fn = serviceClass[constructorMethod];
            constructedService = fn.apply(null, aliveParams);
        }

        return constructedService;
    }

    /**
     * @private
     * Instantiation method whenever the constructor is a fn/class constructor (new)
     * @param {function} service the service, can only be a fn
     * @param {array} applicableParams the depdendencies to resolve and inject
     * @returns {function} a factory function
     */
    _instantiateWithNew(service, applicableParams) {
        var args = [null].concat(applicableParams);
        var FactoryFunc = service.service.bind.apply(service.service, args);
        return new FactoryFunc();
    }

    /**
     * @private
     * Retourne le type de constructor
     * Gives the constructor type
     * 3 types supported : 'new', 'getInstance', else
     * @param {mixed} service the service object/fn
     * @param {string} customConstructor the factory custom constructor (optional)
     * @returns {string} the constructor name
     */
    _findConstructor(service, customConstructor) {
        if (customConstructor !== undefined) {
            return customConstructor;
        }

        if (service.getInstance) {
            return 'getInstance';
        }

        if(service.constructor) {
            return 'constructor';
        }
        throw new Error("cannot find the constructor or the service " + service.name +". It must be either a class, function, an object with a getInstance method or any other method but in this case you have to put it as a last param in the register method");
    }

    /**
     * retrieves the class constructor parameters
     * @param params
     * @returns {Array}
     * @private
     */
    _lookupConstructorParams(params) {
        let o = [];
        let param;
        let foundService;
        if (!params) {
            return [];
        }
        for (param of params) {
            if (typeof param === 'string') {
                foundService = this._findService(param);
                if (foundService) {
                    o.push(foundService);
                } else {
                    let err = "cannot find the dependencie of the parameter " + param;
                    throw new Error(err);
                }
            }
            else {
                o.push(param);
            }
        }
        return o;
    }

    /**
     * returns the stored service given a key
     * @param {string} key service name
     * @returns {object} service
     * @private
     */
    _findService(key) {
        var service;
        if (typeof key !== "string") {
            throw new Error("service name must be a string");
        }
        for (service of store) {
            if (service.name == key) {
                return service;
            }
        }
        return false;
    }

    /**
     * Returns the position of the service in the container's storage
     * useful to splice stuff around
     * @param {string} key service name
     * @returns {integer} the position
     * @private
     */
    _findServicePos(key) {
        if (typeof key !== 'string') {
            throw new Error("service name must be a string");
        }
        let i = 0;
        for (i in store) {
            if (store.hasOwnProperty(i)) {
                if (store[i].name === key) {
                    return i;
                }
            }
        }
        return false;
    }

    /**
     * check if key is unique -> if already is in store or not
     * @param {string} key
     * @returns {boolean}
     * @private
     */
    _isNew(key) {
        let service;
        for (service of store) {
            if (service.name == key) {
                return false;
            }
        }
        return true;
    }
}

module.exports = dipsy;
