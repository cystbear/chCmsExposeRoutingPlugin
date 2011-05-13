/*!
 * routing.js
 * Copyright (c) 2011 Julien Muetton <julien_muetton@carpe-hora.com>
 * MIT Licensed
 */

/**
 * define Routing class
 */

var Routing = Routing || {};

(function(Routing, $, undefined) {

  // now register our routing methods
  $.extend(Routing, (function() {

    var _routes = {},
        rquery = /\?/,
        rabsurl = /^\//,
        rescregexp = /[-[\]{}()*+?.,\\^$|#\s]/g,
        rdblslash = /\/\//g;

    /**
     * @api private
     * prepare a regexp part with several caracters/parts
     * having to be escaped.
     *
     *    regexify('a'); // returns 'a'
     *    regexify(['a', '.']); // returns 'a|\.'
     *    regexify(['a', '.'], '$'); // returns 'a|\.|$'
     *
     * @param {Array|string}  separators  a list of separators.
     * @param {String}        unescaped   a meta character to use in regexp.
     * @return {String}      the regexp part, ready to use.
     */
    function regexify(separators, unescaped) {
      var _i, _separators = [];
      // make sure separator is an array
      if (!$.isArray(separators)) {
        separators = [separators];
      }
      // escape every separator
      for (_i in separators) {
        _separators[_i] = separators[_i].replace(rescregexp, '\\$&');
      }
      // add unescaped caracters
      if (unescaped) { _separators.push(unescaped); }

      // return in a or
      if (_separators.length > 1) {return _separators.join('|')}
      return _separators[0];
    };

    return {
      /**
       * route parameter prefix.
       *
       * @type {String}
       * @api public
       */
      variablePrefix: ':',
      /**
       * route url separator list/
       *
       * @type {String|Array}
       * @api public
       */
      segmentSeparators: ['/', '.'],
      /**
       * route url prefix to use.
       *
       * @type {String}
       * @api public
       */
      prefix: '',
      /**
       * generate a route url from route id and params.
       *
       * @param {String}  route_id  the id of route to generate url for.
       * @param {Objects} params    the parameters to append to the route.
       * @return {String} generated url.
       * @api public
       */
      generate: function(route_id, params) {
        var _route = Routing.get(route_id),
            _i,
            _separators = Routing.segmentSeparators,
            _delimiters = regexify(Routing.variablePrefix),
            _prefix = '(' + regexify(_separators, '^') + ')' + _delimiters,
            _suffix = '(' + regexify(_separators, '$') + ')',
            _params = $.extend({}, params || {}),
            _queryString,
            _url = _route;

        if (!_url) {
          throw 'No matching route for ' + route_id;
        }

        for (_i in _params) {
          var _r = new RegExp(_prefix + _i + _suffix, '');

          if (_r.test(_url)) {
            _url = _url.replace(_r, '$1' + _params[_i] + '$2');
            delete(_params[_i]);
          }
        }
        _queryString = $.param(_params);
        if (_queryString.length) {
          _url += (rquery.test(_url) ? '&' : '?') + _queryString;
        }

        _url = (rabsurl.test(_url) ? '' : '/') + _url;
        _url = Routing.prefix + _url;
        _url = (rabsurl.test(_url) ? '' : '/') + _url;

        return _url.replace(rdblslash, '/');
      },
      /**
       * connect a route.
       *
       * @param {String} id       the route id.
       * @param {String} pattern  the url pattern.
       * @return {Object} Routing.
       * @api public
       */
      connect: function(id, pattern) {
        _routes[id] = pattern;
        return Routing;
      },
      /**
       * retrieve a route by it's id.
       *
       * @param {String} route_id the route id to retrieve.
       * @return {String} requested route.
       * @api public
       */
      get: function(route_id) {
        return _routes[route_id] || undefined;
      },
      /**
       * determines wether a route is registered or not.
       *
       * @param {String} route_id the route id to retrieve.
       * @return {Boolean} wether the route is registered or not.
       * @api public
       */
      has: function(route_id) {
        return (_routes[route_id] ? true : false);
      },
      /**
       * clears all routes
       *
       * @return {Object} Routing.
       * @api public
       */
      flush: function() {
        _routes = {};
        return Routing;
      }
    }; // end of return
  })());
})(Routing, jQuery);
