# Dipsy

Dipsy is a very opiniated and quite simple service locator and injector for nodejs and browserify. Here are some of its
features :

- Wiring done manually. Because I don't like magic nor coffeescript.
- Instantiates by itself dependencies are resolves dependencies of
  dependencies like a big boy as long as the constructor is either 'new' or
  'getInstance'.
- Can pass params to instantiate manually via another factory function
- Does not only hold singletons
- Works in browser and node
- Works with ES6 classes

Why this name ? because D.I. means dependency injection, and I like chicken dips.

## How to use

       npm install dipsy

### Registering services
You must register all your service providers manually at the start of your
application. You can have a file called Container.js that holds all of them.
If your application is serious you can of course create typed Service
Providers file à la Laravel.

My opinion is that I want to do the wiring myself because I don't like magic,
e.g. overriding node's require function or parsing files.

    "use strict";
    let container = require("dipsy");

    //GeoHelper is a singleton with no dependencies
    container.register("GeoHelper", require("./helpers/GeoHelper"));

    //moment is an npm module
    //if you pase false as last param, it means the service is a simple js object
    //therefore no need to try to instantiate it
    container.register("moment", require("moment"), [], false);

    //GoogleMapsApi is an ES6 Class, instantiates with new
    // deps are GeoHelper
    container.register("MapsApi", require("./repos/geo/GoogleMapsApi"), ["GeoHelper"]);

    container.register("Events", require("events"), [], false);
    //EventFactory is a factory, with a make method
    container.register("Config", require("./services/ConfigStore"),
    ["Events"], "make");

note that all the registers are called synchronously.

### Calling services

    let Maps = container.get("GoogleMapsApi");

Bear in mind that container.get will not only retrieve singletons but also
make new instances of classes or functions if their constructor is 'new'.


### Deleting modules
Why would you do that ? just use the dipsy.delete(key);


### Testing
Run the mocha test(s) in /tests.


### Architecture
Just my 2 cents. In classic MVC you would call the container in your
controllers and then retrieve the services inside the controllers. Therefore
your controllers have no dependencies injected. In a node socket.io style
application your controllers are your socket event listeners, just do the
same.

## Licence

The MIT License (MIT)
Copyright (c) 2016 to Léo TOMAS

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.






