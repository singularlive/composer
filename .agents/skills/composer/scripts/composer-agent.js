#!/usr/bin/env node
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),
/* 5 */
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;// TinyColor v1.4.1
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function(Math) {

var trimLeft = /^\s+/,
    trimRight = /\s+$/,
    tinyCounter = 0,
    mathRound = Math.round,
    mathMin = Math.min,
    mathMax = Math.max,
    mathRandom = Math.random;

function tinycolor (color, opts) {

    color = (color) ? color : '';
    opts = opts || { };

    // If input is already a tinycolor, return itself
    if (color instanceof tinycolor) {
       return color;
    }
    // If we are called as a function, call using new instead
    if (!(this instanceof tinycolor)) {
        return new tinycolor(color, opts);
    }

    var rgb = inputToRGB(color);
    this._originalInput = color,
    this._r = rgb.r,
    this._g = rgb.g,
    this._b = rgb.b,
    this._a = rgb.a,
    this._roundA = mathRound(100*this._a) / 100,
    this._format = opts.format || rgb.format;
    this._gradientType = opts.gradientType;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (this._r < 1) { this._r = mathRound(this._r); }
    if (this._g < 1) { this._g = mathRound(this._g); }
    if (this._b < 1) { this._b = mathRound(this._b); }

    this._ok = rgb.ok;
    this._tc_id = tinyCounter++;
}

tinycolor.prototype = {
    isDark: function() {
        return this.getBrightness() < 128;
    },
    isLight: function() {
        return !this.isDark();
    },
    isValid: function() {
        return this._ok;
    },
    getOriginalInput: function() {
      return this._originalInput;
    },
    getFormat: function() {
        return this._format;
    },
    getAlpha: function() {
        return this._a;
    },
    getBrightness: function() {
        //http://www.w3.org/TR/AERT#color-contrast
        var rgb = this.toRgb();
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    },
    getLuminance: function() {
        //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        var rgb = this.toRgb();
        var RsRGB, GsRGB, BsRGB, R, G, B;
        RsRGB = rgb.r/255;
        GsRGB = rgb.g/255;
        BsRGB = rgb.b/255;

        if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
        if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
        if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    },
    setAlpha: function(value) {
        this._a = boundAlpha(value);
        this._roundA = mathRound(100*this._a) / 100;
        return this;
    },
    toHsv: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
    },
    toHsvString: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
        return (this._a == 1) ?
          "hsv("  + h + ", " + s + "%, " + v + "%)" :
          "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
    },
    toHsl: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
    },
    toHslString: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
        return (this._a == 1) ?
          "hsl("  + h + ", " + s + "%, " + l + "%)" :
          "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
    },
    toHex: function(allow3Char) {
        return rgbToHex(this._r, this._g, this._b, allow3Char);
    },
    toHexString: function(allow3Char) {
        return '#' + this.toHex(allow3Char);
    },
    toHex8: function(allow4Char) {
        return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
    },
    toHex8String: function(allow4Char) {
        return '#' + this.toHex8(allow4Char);
    },
    toRgb: function() {
        return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
    },
    toRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
          "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
    },
    toPercentageRgb: function() {
        return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
    },
    toPercentageRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
          "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
    },
    toName: function() {
        if (this._a === 0) {
            return "transparent";
        }

        if (this._a < 1) {
            return false;
        }

        return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
    },
    toFilter: function(secondColor) {
        var hex8String = '#' + rgbaToArgbHex(this._r, this._g, this._b, this._a);
        var secondHex8String = hex8String;
        var gradientType = this._gradientType ? "GradientType = 1, " : "";

        if (secondColor) {
            var s = tinycolor(secondColor);
            secondHex8String = '#' + rgbaToArgbHex(s._r, s._g, s._b, s._a);
        }

        return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
    },
    toString: function(format) {
        var formatSet = !!format;
        format = format || this._format;

        var formattedString = false;
        var hasAlpha = this._a < 1 && this._a >= 0;
        var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

        if (needsAlphaFormat) {
            // Special case for "transparent", all other non-alpha formats
            // will return rgba when there is transparency.
            if (format === "name" && this._a === 0) {
                return this.toName();
            }
            return this.toRgbString();
        }
        if (format === "rgb") {
            formattedString = this.toRgbString();
        }
        if (format === "prgb") {
            formattedString = this.toPercentageRgbString();
        }
        if (format === "hex" || format === "hex6") {
            formattedString = this.toHexString();
        }
        if (format === "hex3") {
            formattedString = this.toHexString(true);
        }
        if (format === "hex4") {
            formattedString = this.toHex8String(true);
        }
        if (format === "hex8") {
            formattedString = this.toHex8String();
        }
        if (format === "name") {
            formattedString = this.toName();
        }
        if (format === "hsl") {
            formattedString = this.toHslString();
        }
        if (format === "hsv") {
            formattedString = this.toHsvString();
        }

        return formattedString || this.toHexString();
    },
    clone: function() {
        return tinycolor(this.toString());
    },

    _applyModification: function(fn, args) {
        var color = fn.apply(null, [this].concat([].slice.call(args)));
        this._r = color._r;
        this._g = color._g;
        this._b = color._b;
        this.setAlpha(color._a);
        return this;
    },
    lighten: function() {
        return this._applyModification(lighten, arguments);
    },
    brighten: function() {
        return this._applyModification(brighten, arguments);
    },
    darken: function() {
        return this._applyModification(darken, arguments);
    },
    desaturate: function() {
        return this._applyModification(desaturate, arguments);
    },
    saturate: function() {
        return this._applyModification(saturate, arguments);
    },
    greyscale: function() {
        return this._applyModification(greyscale, arguments);
    },
    spin: function() {
        return this._applyModification(spin, arguments);
    },

    _applyCombination: function(fn, args) {
        return fn.apply(null, [this].concat([].slice.call(args)));
    },
    analogous: function() {
        return this._applyCombination(analogous, arguments);
    },
    complement: function() {
        return this._applyCombination(complement, arguments);
    },
    monochromatic: function() {
        return this._applyCombination(monochromatic, arguments);
    },
    splitcomplement: function() {
        return this._applyCombination(splitcomplement, arguments);
    },
    triad: function() {
        return this._applyCombination(triad, arguments);
    },
    tetrad: function() {
        return this._applyCombination(tetrad, arguments);
    }
};

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
tinycolor.fromRatio = function(color, opts) {
    if (typeof color == "object") {
        var newColor = {};
        for (var i in color) {
            if (color.hasOwnProperty(i)) {
                if (i === "a") {
                    newColor[i] = color[i];
                }
                else {
                    newColor[i] = convertToPercentage(color[i]);
                }
            }
        }
        color = newColor;
    }

    return tinycolor(color, opts);
};

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
function inputToRGB(color) {

    var rgb = { r: 0, g: 0, b: 0 };
    var a = 1;
    var s = null;
    var v = null;
    var l = null;
    var ok = false;
    var format = false;

    if (typeof color == "string") {
        color = stringInputToObject(color);
    }

    if (typeof color == "object") {
        if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
            s = convertToPercentage(color.s);
            v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, s, v);
            ok = true;
            format = "hsv";
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
            s = convertToPercentage(color.s);
            l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, s, l);
            ok = true;
            format = "hsl";
        }

        if (color.hasOwnProperty("a")) {
            a = color.a;
        }
    }

    a = boundAlpha(a);

    return {
        ok: ok,
        format: color.format || format,
        r: mathMin(255, mathMax(rgb.r, 0)),
        g: mathMin(255, mathMax(rgb.g, 0)),
        b: mathMin(255, mathMax(rgb.b, 0)),
        a: a
    };
}


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
function rgbToRgb(r, g, b){
    return {
        r: bound01(r, 255) * 255,
        g: bound01(g, 255) * 255,
        b: bound01(b, 255) * 255
    };
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h: h, s: s, l: l };
}

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hslToRgb(h, s, l) {
    var r, g, b;

    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);

    function hue2rgb(p, q, t) {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max == min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
 function hsvToRgb(h, s, v) {

    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);

    var i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
function rgbToHex(r, g, b, allow3Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join("");
}

// `rgbaToHex`
// Converts an RGBA color plus alpha transparency to hex
// Assumes r, g, b are contained in the set [0, 255] and
// a in [0, 1]. Returns a 4 or 8 character rgba hex
function rgbaToHex(r, g, b, a, allow4Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16)),
        pad2(convertDecimalToHex(a))
    ];

    // Return a 4 character hex if possible
    if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
    }

    return hex.join("");
}

// `rgbaToArgbHex`
// Converts an RGBA color to an ARGB Hex8 string
// Rarely used, but required for "toFilter()"
function rgbaToArgbHex(r, g, b, a) {

    var hex = [
        pad2(convertDecimalToHex(a)),
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    return hex.join("");
}

// `equals`
// Can be called with any tinycolor input
tinycolor.equals = function (color1, color2) {
    if (!color1 || !color2) { return false; }
    return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
};

tinycolor.random = function() {
    return tinycolor.fromRatio({
        r: mathRandom(),
        g: mathRandom(),
        b: mathRandom()
    });
};


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

function desaturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s -= amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function saturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s += amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function greyscale(color) {
    return tinycolor(color).desaturate(100);
}

function lighten (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

function brighten(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var rgb = tinycolor(color).toRgb();
    rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
    rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
    rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
    return tinycolor(rgb);
}

function darken (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l -= amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
function spin(color, amount) {
    var hsl = tinycolor(color).toHsl();
    var hue = (hsl.h + amount) % 360;
    hsl.h = hue < 0 ? 360 + hue : hue;
    return tinycolor(hsl);
}

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

function complement(color) {
    var hsl = tinycolor(color).toHsl();
    hsl.h = (hsl.h + 180) % 360;
    return tinycolor(hsl);
}

function triad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
}

function tetrad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
}

function splitcomplement(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
        tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
    ];
}

function analogous(color, results, slices) {
    results = results || 6;
    slices = slices || 30;

    var hsl = tinycolor(color).toHsl();
    var part = 360 / slices;
    var ret = [tinycolor(color)];

    for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
        hsl.h = (hsl.h + part) % 360;
        ret.push(tinycolor(hsl));
    }
    return ret;
}

function monochromatic(color, results) {
    results = results || 6;
    var hsv = tinycolor(color).toHsv();
    var h = hsv.h, s = hsv.s, v = hsv.v;
    var ret = [];
    var modification = 1 / results;

    while (results--) {
        ret.push(tinycolor({ h: h, s: s, v: v}));
        v = (v + modification) % 1;
    }

    return ret;
}

// Utility Functions
// ---------------------

tinycolor.mix = function(color1, color2, amount) {
    amount = (amount === 0) ? 0 : (amount || 50);

    var rgb1 = tinycolor(color1).toRgb();
    var rgb2 = tinycolor(color2).toRgb();

    var p = amount / 100;

    var rgba = {
        r: ((rgb2.r - rgb1.r) * p) + rgb1.r,
        g: ((rgb2.g - rgb1.g) * p) + rgb1.g,
        b: ((rgb2.b - rgb1.b) * p) + rgb1.b,
        a: ((rgb2.a - rgb1.a) * p) + rgb1.a
    };

    return tinycolor(rgba);
};


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
tinycolor.readability = function(color1, color2) {
    var c1 = tinycolor(color1);
    var c2 = tinycolor(color2);
    return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
};

// `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

// *Example*
//    tinycolor.isReadable("#000", "#111") => false
//    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
tinycolor.isReadable = function(color1, color2, wcag2) {
    var readability = tinycolor.readability(color1, color2);
    var wcag2Parms, out;

    out = false;

    wcag2Parms = validateWCAG2Parms(wcag2);
    switch (wcag2Parms.level + wcag2Parms.size) {
        case "AAsmall":
        case "AAAlarge":
            out = readability >= 4.5;
            break;
        case "AAlarge":
            out = readability >= 3;
            break;
        case "AAAsmall":
            out = readability >= 7;
            break;
    }
    return out;

};

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
tinycolor.mostReadable = function(baseColor, colorList, args) {
    var bestColor = null;
    var bestScore = 0;
    var readability;
    var includeFallbackColors, level, size ;
    args = args || {};
    includeFallbackColors = args.includeFallbackColors ;
    level = args.level;
    size = args.size;

    for (var i= 0; i < colorList.length ; i++) {
        readability = tinycolor.readability(baseColor, colorList[i]);
        if (readability > bestScore) {
            bestScore = readability;
            bestColor = tinycolor(colorList[i]);
        }
    }

    if (tinycolor.isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
        return bestColor;
    }
    else {
        args.includeFallbackColors=false;
        return tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
    }
};


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
var names = tinycolor.names = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "0ff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000",
    blanchedalmond: "ffebcd",
    blue: "00f",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    burntsienna: "ea7e5d",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "0ff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgreen: "006400",
    darkgrey: "a9a9a9",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "f0f",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    green: "008000",
    greenyellow: "adff2f",
    grey: "808080",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgreen: "90ee90",
    lightgrey: "d3d3d3",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "789",
    lightslategrey: "789",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "0f0",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "f0f",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    rebeccapurple: "663399",
    red: "f00",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "fff",
    whitesmoke: "f5f5f5",
    yellow: "ff0",
    yellowgreen: "9acd32"
};

// Make it easy to access colors via `hexNames[hex]`
var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
function flip(o) {
    var flipped = { };
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            flipped[o[i]] = i;
        }
    }
    return flipped;
}

// Return a valid alpha value [0,1] with all invalid values being set to 1
function boundAlpha(a) {
    a = parseFloat(a);

    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }

    return a;
}

// Take input from [0, n] and return it as [0, 1]
function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = mathMin(max, mathMax(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((Math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}

// Force a number between 0 and 1
function clamp01(val) {
    return mathMin(1, mathMax(0, val));
}

// Parse a base-16 hex value into a base-10 integer
function parseIntFromHex(val) {
    return parseInt(val, 16);
}

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}

// Check to see if string passed in is a percentage
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}

// Force a hex value to have 2 characters
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}

// Replace a decimal with it's percentage value
function convertToPercentage(n) {
    if (n <= 1) {
        n = (n * 100) + "%";
    }

    return n;
}

// Converts a decimal to a hex value
function convertDecimalToHex(d) {
    return Math.round(parseFloat(d) * 255).toString(16);
}
// Converts a hex value to a decimal
function convertHexToDecimal(h) {
    return (parseIntFromHex(h) / 255);
}

var matchers = (function() {

    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = "[-\\+]?\\d+%?";

    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
    var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

    return {
        CSS_UNIT: new RegExp(CSS_UNIT),
        rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
        rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
        hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
        hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
        hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
        hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    };
})();

// `isValidCSSUnit`
// Take in a single string / number and check to see if it looks like a CSS unit
// (see `matchers` above for definition).
function isValidCSSUnit(color) {
    return !!matchers.CSS_UNIT.exec(color);
}

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
function stringInputToObject(color) {

    color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
    var named = false;
    if (names[color]) {
        color = names[color];
        named = true;
    }
    else if (color == 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0, format: "name" };
    }

    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match;
    if ((match = matchers.rgb.exec(color))) {
        return { r: match[1], g: match[2], b: match[3] };
    }
    if ((match = matchers.rgba.exec(color))) {
        return { r: match[1], g: match[2], b: match[3], a: match[4] };
    }
    if ((match = matchers.hsl.exec(color))) {
        return { h: match[1], s: match[2], l: match[3] };
    }
    if ((match = matchers.hsla.exec(color))) {
        return { h: match[1], s: match[2], l: match[3], a: match[4] };
    }
    if ((match = matchers.hsv.exec(color))) {
        return { h: match[1], s: match[2], v: match[3] };
    }
    if ((match = matchers.hsva.exec(color))) {
        return { h: match[1], s: match[2], v: match[3], a: match[4] };
    }
    if ((match = matchers.hex8.exec(color))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            a: convertHexToDecimal(match[4]),
            format: named ? "name" : "hex8"
        };
    }
    if ((match = matchers.hex6.exec(color))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? "name" : "hex"
        };
    }
    if ((match = matchers.hex4.exec(color))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
            a: convertHexToDecimal(match[4] + '' + match[4]),
            format: named ? "name" : "hex8"
        };
    }
    if ((match = matchers.hex3.exec(color))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
            format: named ? "name" : "hex"
        };
    }

    return false;
}

function validateWCAG2Parms(parms) {
    // return valid WCAG2 parms for isReadable.
    // If input parms are invalid, return {"level":"AA", "size":"small"}
    var level, size;
    parms = parms || {"level":"AA", "size":"small"};
    level = (parms.level || "AA").toUpperCase();
    size = (parms.size || "small").toLowerCase();
    if (level !== "AA" && level !== "AAA") {
        level = "AA";
    }
    if (size !== "small" && size !== "large") {
        size = "small";
    }
    return {"level":level, "size":size};
}

// Node: Export function
if ( true && module.exports) {
    module.exports = tinycolor;
}
// AMD/requirejs: Define the module
else if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {return tinycolor;}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}
// Browser: Expose to window
else // removed by dead control flow
{}

})(Math);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NIL: () => (/* reexport safe */ _nil_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   parse: () => (/* reexport safe */ _parse_js__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   stringify: () => (/* reexport safe */ _stringify_js__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   v1: () => (/* reexport safe */ _v1_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   v3: () => (/* reexport safe */ _v3_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   v4: () => (/* reexport safe */ _v4_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   v5: () => (/* reexport safe */ _v5_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   validate: () => (/* reexport safe */ _validate_js__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   version: () => (/* reexport safe */ _version_js__WEBPACK_IMPORTED_MODULE_5__["default"])
/* harmony export */ });
/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/* harmony import */ var _v3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _v4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(16);
/* harmony import */ var _v5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(17);
/* harmony import */ var _nil_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(19);
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(20);
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(10);
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(9);
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(14);










/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);

 // **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(b);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v1);

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto__WEBPACK_IMPORTED_MODULE_0___default().randomFillSync(rnds8Pool);
    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _md5_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(15);


const v3 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v3', 0x30, _md5_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v3);

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DNS: () => (/* binding */ DNS),
/* harmony export */   URL: () => (/* binding */ URL),
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
Object.defineProperty(__WEBPACK_DEFAULT_EXPORT__, "name", { value: "default", configurable: true });
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(14);



function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0,_parse_js__WEBPACK_IMPORTED_MODULE_1__["default"])(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_0__["default"])(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);


function parse(uuid) {
  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (parse);

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);


function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return crypto__WEBPACK_IMPORTED_MODULE_0___default().createHash('md5').update(bytes).digest();
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (md5);

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);



function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _sha1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(18);


const v5 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v5', 0x50, _sha1_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v5);

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);


function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return crypto__WEBPACK_IMPORTED_MODULE_0___default().createHash('sha1').update(bytes).digest();
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sha1);

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ('00000000-0000-0000-0000-000000000000');

/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);


function version(uuid) {
  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (version);

/***/ }),
/* 21 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const createWebSocketStream = __webpack_require__(22);
const extension = __webpack_require__(44);
const PerMessageDeflate = __webpack_require__(31);
const Receiver = __webpack_require__(37);
const Sender = __webpack_require__(41);
const subprotocol = __webpack_require__(45);
const WebSocket = __webpack_require__(23);
const WebSocketServer = __webpack_require__(46);

WebSocket.createWebSocketStream = createWebSocketStream;
WebSocket.extension = extension;
WebSocket.PerMessageDeflate = PerMessageDeflate;
WebSocket.Receiver = Receiver;
WebSocket.Sender = Sender;
WebSocket.Server = WebSocketServer;
WebSocket.subprotocol = subprotocol;
WebSocket.WebSocket = WebSocket;
WebSocket.WebSocketServer = WebSocketServer;

module.exports = WebSocket;


/***/ }),
/* 22 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^WebSocket$" }] */


const WebSocket = __webpack_require__(23);
const { Duplex } = __webpack_require__(29);

/**
 * Emits the `'close'` event on a stream.
 *
 * @param {Duplex} stream The stream.
 * @private
 */
function emitClose(stream) {
  stream.emit('close');
}

/**
 * The listener of the `'end'` event.
 *
 * @private
 */
function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

/**
 * The listener of the `'error'` event.
 *
 * @param {Error} err The error
 * @private
 */
function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this.listenerCount('error') === 0) {
    // Do not suppress the throwing behavior.
    this.emit('error', err);
  }
}

/**
 * Wraps a `WebSocket` in a duplex stream.
 *
 * @param {WebSocket} ws The `WebSocket` to wrap
 * @param {Object} [options] The options for the `Duplex` constructor
 * @return {Duplex} The duplex stream
 * @public
 */
function createWebSocketStream(ws, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  ws.on('message', function message(msg, isBinary) {
    const data =
      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;

    if (!duplex.push(data)) ws.pause();
  });

  ws.once('error', function error(err) {
    if (duplex.destroyed) return;

    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
    //
    // - If the `'error'` event is emitted before the `'open'` event, then
    //   `ws.terminate()` is a noop as no socket is assigned.
    // - Otherwise, the error is re-emitted by the listener of the `'error'`
    //   event of the `Receiver` object. The listener already closes the
    //   connection by calling `ws.close()`. This allows a close frame to be
    //   sent to the other peer. If `ws.terminate()` is called right after this,
    //   then the close frame might not be sent.
    terminateOnDestroy = false;
    duplex.destroy(err);
  });

  ws.once('close', function close() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function (err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) ws.terminate();
  };

  duplex._final = function (callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    // If the value of the `_socket` property is `null` it means that `ws` is a
    // client websocket and the handshake failed. In fact, when this happens, a
    // socket is never assigned to the websocket. Wait for the `'error'` event
    // that will be emitted by the websocket.
    if (ws._socket === null) return;

    if (ws._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      ws._socket.once('finish', function finish() {
        // `duplex` is not destroyed here because the `'end'` event will be
        // emitted on `duplex` after this `'finish'` event. The EOF signaling
        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
        callback();
      });
      ws.close();
    }
  };

  duplex._read = function () {
    if (ws.isPaused) ws.resume();
  };

  duplex._write = function (chunk, encoding, callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    ws.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

module.exports = createWebSocketStream;


/***/ }),
/* 23 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex|Readable$", "caughtErrors": "none" }] */



const EventEmitter = __webpack_require__(24);
const https = __webpack_require__(25);
const http = __webpack_require__(26);
const net = __webpack_require__(27);
const tls = __webpack_require__(28);
const { randomBytes, createHash } = __webpack_require__(4);
const { Duplex, Readable } = __webpack_require__(29);
const { URL } = __webpack_require__(30);

const PerMessageDeflate = __webpack_require__(31);
const Receiver = __webpack_require__(37);
const Sender = __webpack_require__(41);
const { isBlob } = __webpack_require__(38);

const {
  BINARY_TYPES,
  CLOSE_TIMEOUT,
  EMPTY_BUFFER,
  GUID,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket,
  NOOP
} = __webpack_require__(34);
const {
  EventTarget: { addEventListener, removeEventListener }
} = __webpack_require__(43);
const { format, parse } = __webpack_require__(44);
const { toBuffer } = __webpack_require__(33);

const kAborted = Symbol('kAborted');
const protocolVersions = [8, 13];
const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket extends EventEmitter {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(address, protocols, options) {
    super();

    this._binaryType = BINARY_TYPES[0];
    this._closeCode = 1006;
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = EMPTY_BUFFER;
    this._closeTimer = null;
    this._errorEmitted = false;
    this._extensions = {};
    this._paused = false;
    this._protocol = '';
    this._readyState = WebSocket.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;

    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;

      if (protocols === undefined) {
        if (!options || options.protocols === undefined) {
          protocols = [];
        } else if (Array.isArray(options.protocols)) {
          protocols = options.protocols;
        } else {
          protocols = [options.protocols];
        }
      } else if (!Array.isArray(protocols)) {
        if (typeof protocols === 'object' && protocols !== null) {
          options = protocols;

          if (options.protocols === undefined) {
            protocols = [];
          } else if (Array.isArray(options.protocols)) {
            protocols = options.protocols;
          } else {
            protocols = [options.protocols];
          }
        } else {
          protocols = [protocols];
        }
      }

      initAsClient(this, address, protocols, options);
    } else {
      this._autoPong = options.autoPong;
      this._closeTimeout = options.closeTimeout;
      this._isServer = true;
    }
  }

  /**
   * For historical reasons, the custom "nodebuffer" type is used by the default
   * instead of "blob".
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }

  set binaryType(type) {
    if (!BINARY_TYPES.includes(type)) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * @type {Number}
   */
  get bufferedAmount() {
    if (!this._socket) return this._bufferedAmount;

    return this._socket._writableState.length + this._sender._bufferedBytes;
  }

  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }

  /**
   * @type {Boolean}
   */
  get isPaused() {
    return this._paused;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onclose() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
    return null;
  }

  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }

  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }

  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Object} options Options object
   * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Number} [options.maxBufferedChunks=0] The maximum number of
   *     buffered data chunks
   * @param {Number} [options.maxFragments=0] The maximum number of message
   *     fragments
   * @param {Number} [options.maxPayload=0] The maximum allowed message size
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @private
   */
  setSocket(socket, head, options) {
    const receiver = new Receiver({
      allowSynchronousEvents: options.allowSynchronousEvents,
      binaryType: this.binaryType,
      extensions: this._extensions,
      isServer: this._isServer,
      maxBufferedChunks: options.maxBufferedChunks,
      maxFragments: options.maxFragments,
      maxPayload: options.maxPayload,
      skipUTF8Validation: options.skipUTF8Validation
    });

    const sender = new Sender(socket, this._extensions, options.generateMask);

    this._receiver = receiver;
    this._sender = sender;
    this._socket = socket;

    receiver[kWebSocket] = this;
    sender[kWebSocket] = this;
    socket[kWebSocket] = this;

    receiver.on('conclude', receiverOnConclude);
    receiver.on('drain', receiverOnDrain);
    receiver.on('error', receiverOnError);
    receiver.on('message', receiverOnMessage);
    receiver.on('ping', receiverOnPing);
    receiver.on('pong', receiverOnPong);

    sender.onerror = senderOnError;

    //
    // These methods may not be available if `socket` is just a `Duplex`.
    //
    if (socket.setTimeout) socket.setTimeout(0);
    if (socket.setNoDelay) socket.setNoDelay();

    if (head.length > 0) socket.unshift(head);

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);

    this._readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    if (this._extensions[PerMessageDeflate.extensionName]) {
      this._extensions[PerMessageDeflate.extensionName].cleanup();
    }

    this._receiver.removeAllListeners();
    this._readyState = WebSocket.CLOSED;
    this.emit('close', this._closeCode, this._closeMessage);
  }

  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {(String|Buffer)} [data] The reason why the connection is
   *     closing
   * @public
   */
  close(code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      abortHandshake(this, this._req, msg);
      return;
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (
        this._closeFrameSent &&
        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
      ) {
        this._socket.end();
      }

      return;
    }

    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (
        this._closeFrameReceived ||
        this._receiver._writableState.errorEmitted
      ) {
        this._socket.end();
      }
    });

    this._readyState = WebSocket.CLOSING;
    setCloseTimer(this);
  }

  /**
   * Pause the socket.
   *
   * @public
   */
  pause() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
      return;
    }

    this._paused = true;
    this._socket.pause();
  }

  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Resume the socket.
   *
   * @public
   */
  resume() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
      return;
    }

    this._paused = false;
    if (!this._receiver._writableState.needDrain) this._socket.resume();
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(data, options, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    const opts = {
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true,
      ...options
    };

    if (!this._extensions[PerMessageDeflate.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      abortHandshake(this, this._req, msg);
      return;
    }

    if (this._socket) {
      this._readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }
}

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

[
  'binaryType',
  'bufferedAmount',
  'extensions',
  'isPaused',
  'protocol',
  'readyState',
  'url'
].forEach((property) => {
  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket.prototype, `on${method}`, {
    enumerable: true,
    get() {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) return listener[kListener];
      }

      return null;
    },
    set(handler) {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) {
          this.removeListener(method, listener);
          break;
        }
      }

      if (typeof handler !== 'function') return;

      this.addEventListener(method, handler, {
        [kForOnEventAttribute]: true
      });
    }
  });
});

WebSocket.prototype.addEventListener = addEventListener;
WebSocket.prototype.removeEventListener = removeEventListener;

module.exports = WebSocket;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|URL)} address The URL to which to connect
 * @param {Array} protocols The subprotocols
 * @param {Object} [options] Connection options
 * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any
 *     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple
 *     times in the same tick
 * @param {Boolean} [options.autoPong=true] Specifies whether or not to
 *     automatically send a pong in response to a ping
 * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to wait
 *     for the closing handshake to finish after `websocket.close()` is called
 * @param {Function} [options.finishRequest] A function which can be used to
 *     customize the headers of each http request before it is sent
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Function} [options.generateMask] The function used to generate the
 *     masking key
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
 *     buffered data chunks
 * @param {Number} [options.maxFragments=16384] The maximum number of message
 *     fragments
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
 *     not to skip UTF-8 validation for text and close messages
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
  const opts = {
    allowSynchronousEvents: true,
    autoPong: true,
    closeTimeout: CLOSE_TIMEOUT,
    protocolVersion: protocolVersions[1],
    maxBufferedChunks: 256 * 1024,
    maxFragments: 16 * 1024,
    maxPayload: 100 * 1024 * 1024,
    skipUTF8Validation: false,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    socketPath: undefined,
    hostname: undefined,
    protocol: undefined,
    protocols: undefined,
    timeout: undefined,
    method: 'GET',
    host: undefined,
    path: undefined,
    port: undefined
  };

  websocket._autoPong = opts.autoPong;
  websocket._closeTimeout = opts.closeTimeout;

  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} ` +
        `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  let parsedUrl;

  if (address instanceof URL) {
    parsedUrl = address;
  } else {
    try {
      parsedUrl = new URL(address);
    } catch {
      throw new SyntaxError(`Invalid URL: ${address}`);
    }
  }

  if (parsedUrl.protocol === 'http:') {
    parsedUrl.protocol = 'ws:';
  } else if (parsedUrl.protocol === 'https:') {
    parsedUrl.protocol = 'wss:';
  }

  websocket._url = parsedUrl.href;

  const isSecure = parsedUrl.protocol === 'wss:';
  const isIpcUrl = parsedUrl.protocol === 'ws+unix:';
  let invalidUrlMessage;

  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isIpcUrl) {
    invalidUrlMessage =
      'The URL\'s protocol must be one of "ws:", "wss:", ' +
      '"http:", "https:", or "ws+unix:"';
  } else if (isIpcUrl && !parsedUrl.pathname) {
    invalidUrlMessage = "The URL's pathname is empty";
  } else if (parsedUrl.hash) {
    invalidUrlMessage = 'The URL contains a fragment identifier';
  }

  if (invalidUrlMessage) {
    const err = new SyntaxError(invalidUrlMessage);

    if (websocket._redirects === 0) {
      throw err;
    } else {
      emitErrorAndClose(websocket, err);
      return;
    }
  }

  const defaultPort = isSecure ? 443 : 80;
  const key = randomBytes(16).toString('base64');
  const request = isSecure ? https.request : http.request;
  const protocolSet = new Set();
  let perMessageDeflate;

  opts.createConnection =
    opts.createConnection || (isSecure ? tlsConnect : netConnect);
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith('[')
    ? parsedUrl.hostname.slice(1, -1)
    : parsedUrl.hostname;
  opts.headers = {
    ...opts.headers,
    'Sec-WebSocket-Version': opts.protocolVersion,
    'Sec-WebSocket-Key': key,
    Connection: 'Upgrade',
    Upgrade: 'websocket'
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;

  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate({
      ...opts.perMessageDeflate,
      isServer: false,
      maxPayload: opts.maxPayload
    });
    opts.headers['Sec-WebSocket-Extensions'] = format({
      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols.length) {
    for (const protocol of protocols) {
      if (
        typeof protocol !== 'string' ||
        !subprotocolRegex.test(protocol) ||
        protocolSet.has(protocol)
      ) {
        throw new SyntaxError(
          'An invalid or duplicated subprotocol was specified'
        );
      }

      protocolSet.add(protocol);
    }

    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }

  if (isIpcUrl) {
    const parts = opts.path.split(':');

    opts.socketPath = parts[0];
    opts.path = parts[1];
  }

  let req;

  if (opts.followRedirects) {
    if (websocket._redirects === 0) {
      websocket._originalIpc = isIpcUrl;
      websocket._originalSecure = isSecure;
      websocket._originalHostOrSocketPath = isIpcUrl
        ? opts.socketPath
        : parsedUrl.host;

      const headers = options && options.headers;

      //
      // Shallow copy the user provided options so that headers can be changed
      // without mutating the original object.
      //
      options = { ...options, headers: {} };

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          options.headers[key.toLowerCase()] = value;
        }
      }
    } else if (websocket.listenerCount('redirect') === 0) {
      const isSameHost = isIpcUrl
        ? websocket._originalIpc
          ? opts.socketPath === websocket._originalHostOrSocketPath
          : false
        : websocket._originalIpc
          ? false
          : parsedUrl.host === websocket._originalHostOrSocketPath;

      if (!isSameHost || (websocket._originalSecure && !isSecure)) {
        //
        // Match curl 7.77.0 behavior and drop the following headers. These
        // headers are also dropped when following a redirect to a subdomain.
        //
        delete opts.headers.authorization;
        delete opts.headers.cookie;

        if (!isSameHost) delete opts.headers.host;

        opts.auth = undefined;
      }
    }

    //
    // Match curl 7.77.0 behavior and make the first `Authorization` header win.
    // If the `Authorization` header is set, then there is nothing to do as it
    // will take precedence.
    //
    if (opts.auth && !options.headers.authorization) {
      options.headers.authorization =
        'Basic ' + Buffer.from(opts.auth).toString('base64');
    }

    req = websocket._req = request(opts);

    if (websocket._redirects) {
      //
      // Unlike what is done for the `'upgrade'` event, no early exit is
      // triggered here if the user calls `websocket.close()` or
      // `websocket.terminate()` from a listener of the `'redirect'` event. This
      // is because the user can also call `request.destroy()` with an error
      // before calling `websocket.close()` or `websocket.terminate()` and this
      // would result in an error being emitted on the `request` object with no
      // `'error'` event listeners attached.
      //
      websocket.emit('redirect', websocket.url, req);
    }
  } else {
    req = websocket._req = request(opts);
  }

  if (opts.timeout) {
    req.on('timeout', () => {
      abortHandshake(websocket, req, 'Opening handshake has timed out');
    });
  }

  req.on('error', (err) => {
    if (req === null || req[kAborted]) return;

    req = websocket._req = null;
    emitErrorAndClose(websocket, err);
  });

  req.on('response', (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;

    if (
      location &&
      opts.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400
    ) {
      if (++websocket._redirects > opts.maxRedirects) {
        abortHandshake(websocket, req, 'Maximum redirects exceeded');
        return;
      }

      req.abort();

      let addr;

      try {
        addr = new URL(location, address);
      } catch (e) {
        const err = new SyntaxError(`Invalid URL: ${location}`);
        emitErrorAndClose(websocket, err);
        return;
      }

      initAsClient(websocket, addr, protocols, options);
    } else if (!websocket.emit('unexpected-response', req, res)) {
      abortHandshake(
        websocket,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });

  req.on('upgrade', (res, socket, head) => {
    websocket.emit('upgrade', res);

    //
    // The user may have closed the connection from a listener of the
    // `'upgrade'` event.
    //
    if (websocket.readyState !== WebSocket.CONNECTING) return;

    req = websocket._req = null;

    const upgrade = res.headers.upgrade;

    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
      abortHandshake(websocket, socket, 'Invalid Upgrade header');
      return;
    }

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
      return;
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    let protError;

    if (serverProt !== undefined) {
      if (!protocolSet.size) {
        protError = 'Server sent a subprotocol but none was requested';
      } else if (!protocolSet.has(serverProt)) {
        protError = 'Server sent an invalid subprotocol';
      }
    } else if (protocolSet.size) {
      protError = 'Server sent no subprotocol';
    }

    if (protError) {
      abortHandshake(websocket, socket, protError);
      return;
    }

    if (serverProt) websocket._protocol = serverProt;

    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

    if (secWebSocketExtensions !== undefined) {
      if (!perMessageDeflate) {
        const message =
          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
          'was requested';
        abortHandshake(websocket, socket, message);
        return;
      }

      let extensions;

      try {
        extensions = parse(secWebSocketExtensions);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake(websocket, socket, message);
        return;
      }

      const extensionNames = Object.keys(extensions);

      if (
        extensionNames.length !== 1 ||
        extensionNames[0] !== PerMessageDeflate.extensionName
      ) {
        const message = 'Server indicated an extension that was not requested';
        abortHandshake(websocket, socket, message);
        return;
      }

      try {
        perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake(websocket, socket, message);
        return;
      }

      websocket._extensions[PerMessageDeflate.extensionName] =
        perMessageDeflate;
    }

    websocket.setSocket(socket, head, {
      allowSynchronousEvents: opts.allowSynchronousEvents,
      generateMask: opts.generateMask,
      maxBufferedChunks: opts.maxBufferedChunks,
      maxFragments: opts.maxFragments,
      maxPayload: opts.maxPayload,
      skipUTF8Validation: opts.skipUTF8Validation
    });
  });

  if (opts.finishRequest) {
    opts.finishRequest(req, websocket);
  } else {
    req.end();
  }
}

/**
 * Emit the `'error'` and `'close'` events.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {Error} The error to emit
 * @private
 */
function emitErrorAndClose(websocket, err) {
  websocket._readyState = WebSocket.CLOSING;
  //
  // The following assignment is practically useless and is done only for
  // consistency.
  //
  websocket._errorEmitted = true;
  websocket.emit('error', err);
  websocket.emitClose();
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
  options.path = undefined;

  if (!options.servername && options.servername !== '') {
    options.servername = net.isIP(options.host) ? '' : options.host;
  }

  return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
 *     abort or the socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake(websocket, stream, message) {
  websocket._readyState = WebSocket.CLOSING;

  const err = new Error(message);
  Error.captureStackTrace(err, abortHandshake);

  if (stream.setHeader) {
    stream[kAborted] = true;
    stream.abort();

    if (stream.socket && !stream.socket.destroyed) {
      //
      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
      // called after the request completed. See
      // https://github.com/websockets/ws/issues/1869.
      //
      stream.socket.destroy();
    }

    process.nextTick(emitErrorAndClose, websocket, err);
  } else {
    stream.destroy(err);
    stream.once('error', websocket.emit.bind(websocket, 'error'));
    stream.once('close', websocket.emitClose.bind(websocket));
  }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
  if (data) {
    const length = isBlob(data) ? data.size : toBuffer(data).length;

    //
    // The `_bufferedAmount` property is used only when the peer is a client and
    // the opening handshake fails. Under these circumstances, in fact, the
    // `setSocket()` method is not called, so the `_socket` and `_sender`
    // properties are set to `null`.
    //
    if (websocket._socket) websocket._sender._bufferedBytes += length;
    else websocket._bufferedAmount += length;
  }

  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket.readyState} ` +
        `(${readyStates[websocket.readyState]})`
    );
    process.nextTick(cb, err);
  }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {Buffer} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
  const websocket = this[kWebSocket];

  websocket._closeFrameReceived = true;
  websocket._closeMessage = reason;
  websocket._closeCode = code;

  if (websocket._socket[kWebSocket] === undefined) return;

  websocket._socket.removeListener('data', socketOnData);
  process.nextTick(resume, websocket._socket);

  if (code === 1005) websocket.close();
  else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
  const websocket = this[kWebSocket];

  if (!websocket.isPaused) websocket._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
  const websocket = this[kWebSocket];

  if (websocket._socket[kWebSocket] !== undefined) {
    websocket._socket.removeListener('data', socketOnData);

    //
    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
    // https://github.com/websockets/ws/issues/1940.
    //
    process.nextTick(resume, websocket._socket);

    websocket.close(err[kStatusCode]);
  }

  if (!websocket._errorEmitted) {
    websocket._errorEmitted = true;
    websocket.emit('error', err);
  }
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
  this[kWebSocket].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
 * @param {Boolean} isBinary Specifies whether the message is binary or not
 * @private
 */
function receiverOnMessage(data, isBinary) {
  this[kWebSocket].emit('message', data, isBinary);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
  const websocket = this[kWebSocket];

  if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
  websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
  this[kWebSocket].emit('pong', data);
}

/**
 * Resume a readable stream
 *
 * @param {Readable} stream The readable stream
 * @private
 */
function resume(stream) {
  stream.resume();
}

/**
 * The `Sender` error event handler.
 *
 * @param {Error} The error
 * @private
 */
function senderOnError(err) {
  const websocket = this[kWebSocket];

  if (websocket.readyState === WebSocket.CLOSED) return;
  if (websocket.readyState === WebSocket.OPEN) {
    websocket._readyState = WebSocket.CLOSING;
    setCloseTimer(websocket);
  }

  //
  // `socket.end()` is used instead of `socket.destroy()` to allow the other
  // peer to finish sending queued data. There is no need to set a timer here
  // because `CLOSING` means that it is already set or not needed.
  //
  this._socket.end();

  if (!websocket._errorEmitted) {
    websocket._errorEmitted = true;
    websocket.emit('error', err);
  }
}

/**
 * Set a timer to destroy the underlying raw socket of a WebSocket.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @private
 */
function setCloseTimer(websocket) {
  websocket._closeTimer = setTimeout(
    websocket._socket.destroy.bind(websocket._socket),
    websocket._closeTimeout
  );
}

/**
 * The listener of the socket `'close'` event.
 *
 * @private
 */
function socketOnClose() {
  const websocket = this[kWebSocket];

  this.removeListener('close', socketOnClose);
  this.removeListener('data', socketOnData);
  this.removeListener('end', socketOnEnd);

  websocket._readyState = WebSocket.CLOSING;

  //
  // The close frame might not have been received or the `'end'` event emitted,
  // for example, if the socket was destroyed due to an error. Ensure that the
  // `receiver` stream is closed after writing any remaining buffered data to
  // it. If the readable side of the socket is in flowing mode then there is no
  // buffered data as everything has been already written. If instead, the
  // socket is paused, any possible buffered data will be read as a single
  // chunk.
  //
  if (
    !this._readableState.endEmitted &&
    !websocket._closeFrameReceived &&
    !websocket._receiver._writableState.errorEmitted &&
    this._readableState.length !== 0
  ) {
    const chunk = this.read(this._readableState.length);

    websocket._receiver.write(chunk);
  }

  websocket._receiver.end();

  this[kWebSocket] = undefined;

  clearTimeout(websocket._closeTimer);

  if (
    websocket._receiver._writableState.finished ||
    websocket._receiver._writableState.errorEmitted
  ) {
    websocket.emitClose();
  } else {
    websocket._receiver.on('error', receiverOnFinish);
    websocket._receiver.on('finish', receiverOnFinish);
  }
}

/**
 * The listener of the socket `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
  if (!this[kWebSocket]._receiver.write(chunk)) {
    this.pause();
  }
}

/**
 * The listener of the socket `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
  const websocket = this[kWebSocket];

  websocket._readyState = WebSocket.CLOSING;
  websocket._receiver.end();
  this.end();
}

/**
 * The listener of the socket `'error'` event.
 *
 * @private
 */
function socketOnError() {
  const websocket = this[kWebSocket];

  this.removeListener('error', socketOnError);
  this.on('error', NOOP);

  if (websocket) {
    websocket._readyState = WebSocket.CLOSING;
    this.destroy();
  }
}


/***/ }),
/* 24 */
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),
/* 25 */
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),
/* 26 */
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),
/* 27 */
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),
/* 28 */
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),
/* 29 */
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),
/* 30 */
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),
/* 31 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const zlib = __webpack_require__(32);

const bufferUtil = __webpack_require__(33);
const Limiter = __webpack_require__(36);
const { kStatusCode } = __webpack_require__(34);

const FastBuffer = Buffer[Symbol.species];
const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
class PerMessageDeflate {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {Boolean} [options.isServer=false] Create the instance in either
   *     server or client mode
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed if context takeover is disabled
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   */
  constructor(options) {
    this._options = options || {};
    this._threshold =
      this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._maxPayload = this._options.maxPayload | 0;
    this._isServer = !!this._options.isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency =
        this._options.concurrencyLimit !== undefined
          ? this._options.concurrencyLimit
          : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  /**
   * @type {String}
   */
  static get extensionName() {
    return 'permessage-deflate';
  }

  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(configurations) {
    configurations = this.normalizeParams(configurations);

    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);

    return this.params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }

    if (this._deflate) {
      const callback = this._deflate[kCallback];

      this._deflate.close();
      this._deflate = null;

      if (callback) {
        callback(
          new Error(
            'The deflate stream was closed while data was being processed'
          )
        );
      }
    }
  }

  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(offers) {
    const opts = this._options;
    const accepted = offers.find((params) => {
      if (
        (opts.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (opts.serverMaxWindowBits === false ||
            (typeof opts.serverMaxWindowBits === 'number' &&
              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof opts.clientMaxWindowBits === 'number' &&
          (typeof params.client_max_window_bits === 'number'
            ? opts.clientMaxWindowBits > params.client_max_window_bits
            : !params.client_max_window_bits))
      ) {
        return false;
      }

      return true;
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      opts.clientMaxWindowBits === false
    ) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(response) {
    const params = response[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    }

    return params;
  }

  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];

        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }

        value = value[0];

        if (key === 'client_max_window_bits') {
          if (value !== true) {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (!this._isServer) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
          if (value !== true) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }

        params[key] = value;
      });
    });

    return configurations;
  }

  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;

    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      const err = this._inflate[kError];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];

        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        //
        // The deflate stream was closed while data was being processed.
        //
        return;
      }

      let data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) {
        data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
      }

      //
      // Ensure that the callback will not be called again in
      // `PerMessageDeflate#cleanup()`.
      //
      this._deflate[kCallback] = null;

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
}

module.exports = PerMessageDeflate;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this[kError][kStatusCode] = 1009;
  this.removeListener('data', inflateOnData);

  //
  // The choice to employ `zlib.reset()` over `zlib.close()` is dictated by the
  // fact that in Node.js versions prior to 13.10.0, the callback for
  // `zlib.flush()` is not called if `zlib.close()` is used. Utilizing
  // `zlib.reset()` ensures that either the callback is invoked or an error is
  // emitted.
  //
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kPerMessageDeflate]._inflate = null;

  if (this[kError]) {
    this[kCallback](this[kError]);
    return;
  }

  err[kStatusCode] = 1007;
  this[kCallback](err);
}


/***/ }),
/* 32 */
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),
/* 33 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { EMPTY_BUFFER } = __webpack_require__(34);

const FastBuffer = Buffer[Symbol.species];

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(target.buffer, target.byteOffset, offset);
  }

  return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer(buf) {
  if (buf.length === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buf;

  if (data instanceof ArrayBuffer) {
    buf = new FastBuffer(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer.readOnly = false;
  }

  return buf;
}

module.exports = {
  concat,
  mask: _mask,
  toArrayBuffer,
  toBuffer,
  unmask: _unmask
};

/* istanbul ignore else  */
if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = __webpack_require__(35);

    module.exports.mask = function (source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bufferUtil.mask(source, mask, output, offset, length);
    };

    module.exports.unmask = function (buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bufferUtil.unmask(buffer, mask);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}


/***/ }),
/* 34 */
/***/ ((module) => {

"use strict";


const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
const hasBlob = typeof Blob !== 'undefined';

if (hasBlob) BINARY_TYPES.push('blob');

module.exports = {
  BINARY_TYPES,
  CLOSE_TIMEOUT: 30000,
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  hasBlob,
  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
  kListener: Symbol('kListener'),
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  NOOP: () => {}
};


/***/ }),
/* 35 */
/***/ ((module) => {

"use strict";
module.exports = require("bufferutil");

/***/ }),
/* 36 */
/***/ ((module) => {

"use strict";


const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
class Limiter {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }

  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [kRun]() {
    if (this.pending === this.concurrency) return;

    if (this.jobs.length) {
      const job = this.jobs.shift();

      this.pending++;
      job(this[kDone]);
    }
  }
}

module.exports = Limiter;


/***/ }),
/* 37 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { Writable } = __webpack_require__(29);

const PerMessageDeflate = __webpack_require__(31);
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  kStatusCode,
  kWebSocket
} = __webpack_require__(34);
const { concat, toArrayBuffer, unmask } = __webpack_require__(33);
const { isValidStatusCode, isValidUTF8 } = __webpack_require__(38);

const FastBuffer = Buffer[Symbol.species];

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;

/**
 * HyBi Receiver implementation.
 *
 * @extends Writable
 */
class Receiver extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} [options] Options object
   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {String} [options.binaryType=nodebuffer] The type for binary data
   * @param {Object} [options.extensions] An object containing the negotiated
   *     extensions
   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
   *     client or server mode
   * @param {Number} [options.maxBufferedChunks=0] The maximum number of
   *     buffered data chunks
   * @param {Number} [options.maxFragments=0] The maximum number of message
   *     fragments
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   */
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents =
      options.allowSynchronousEvents !== undefined
        ? options.allowSynchronousEvents
        : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxBufferedChunks = options.maxBufferedChunks | 0;
    this._maxFragments = options.maxFragments | 0;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket] = undefined;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._numFragments = 0;
    this._fragments = [];

    this._errored = false;
    this._loop = false;
    this._state = GET_INFO;
  }

  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    if (
      this._maxBufferedChunks > 0 &&
      this._buffers.length >= this._maxBufferedChunks
    ) {
      cb(
        this.createError(
          RangeError,
          'Too many buffered chunks',
          false,
          1008,
          'WS_ERR_TOO_MANY_BUFFERED_PARTS'
        )
      );
      return;
    }

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }

  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) return this._buffers.shift();

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = new FastBuffer(
        buf.buffer,
        buf.byteOffset + n,
        buf.length - n
      );

      return new FastBuffer(buf.buffer, buf.byteOffset, n);
    }

    const dst = Buffer.allocUnsafe(n);

    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;

      if (n >= buf.length) {
        dst.set(this._buffers.shift(), offset);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = new FastBuffer(
          buf.buffer,
          buf.byteOffset + n,
          buf.length - n
        );
      }

      n -= buf.length;
    } while (n > 0);

    return dst;
  }

  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(cb) {
    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(cb);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(cb);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(cb);
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData(cb);
          break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
      }
    } while (this._loop);

    if (!this._errored) cb();
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @param {Function} cb Callback
   * @private
   */
  getInfo(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      const error = this.createError(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );

      cb(error);
      return;
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      const error = this.createError(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );

      cb(error);
      return;
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        const error = this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );

        cb(error);
        return;
      }

      if (!this._fragmented) {
        const error = this.createError(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );

        cb(error);
        return;
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        const error = this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );

        cb(error);
        return;
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        const error = this.createError(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );

        cb(error);
        return;
      }

      if (compressed) {
        const error = this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );

        cb(error);
        return;
      }

      if (
        this._payloadLength > 0x7d ||
        (this._opcode === 0x08 && this._payloadLength === 1)
      ) {
        const error = this.createError(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );

        cb(error);
        return;
      }
    } else {
      const error = this.createError(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );

      cb(error);
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        const error = this.createError(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );

        cb(error);
        return;
      }
    } else if (this._masked) {
      const error = this.createError(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );

      cb(error);
      return;
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength(cb);
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength16(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(cb);
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength64(cb) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      const error = this.createError(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );

      cb(error);
      return;
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    this.haveLength(cb);
  }

  /**
   * Payload length has been read.
   *
   * @param {Function} cb Callback
   * @private
   */
  haveLength(cb) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        const error = this.createError(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );

        cb(error);
        return;
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @private
   */
  getData(cb) {
    let data = EMPTY_BUFFER;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);

      if (
        this._masked &&
        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
      ) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data, cb);
      return;
    }

    if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
      const error = this.createError(
        RangeError,
        'Too many message fragments',
        false,
        1008,
        'WS_ERR_TOO_MANY_BUFFERED_PARTS'
      );

      cb(error);
      return;
    }

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      //
      // This message is not compressed so its length is the sum of the payload
      // length of all fragments.
      //
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    this.dataMessage(cb);
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(
            RangeError,
            'Max payload size exceeded',
            false,
            1009,
            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
          );

          cb(error);
          return;
        }

        this._fragments.push(buf);
      }

      this.dataMessage(cb);
      if (this._state === GET_INFO) this.startLoop(cb);
    });
  }

  /**
   * Handles a data message.
   *
   * @param {Function} cb Callback
   * @private
   */
  dataMessage(cb) {
    if (!this._fin) {
      this._state = GET_INFO;
      return;
    }

    const messageLength = this._messageLength;
    const fragments = this._fragments;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragmented = 0;
    this._numFragments = 0;
    this._fragments = [];

    if (this._opcode === 2) {
      let data;

      if (this._binaryType === 'nodebuffer') {
        data = concat(fragments, messageLength);
      } else if (this._binaryType === 'arraybuffer') {
        data = toArrayBuffer(concat(fragments, messageLength));
      } else if (this._binaryType === 'blob') {
        data = new Blob(fragments);
      } else {
        data = fragments;
      }

      if (this._allowSynchronousEvents) {
        this.emit('message', data, true);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', data, true);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    } else {
      const buf = concat(fragments, messageLength);

      if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
        const error = this.createError(
          Error,
          'invalid UTF-8 sequence',
          true,
          1007,
          'WS_ERR_INVALID_UTF8'
        );

        cb(error);
        return;
      }

      if (this._state === INFLATING || this._allowSynchronousEvents) {
        this.emit('message', buf, false);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', buf, false);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data, cb) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this._loop = false;
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          const error = this.createError(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE'
          );

          cb(error);
          return;
        }

        const buf = new FastBuffer(
          data.buffer,
          data.byteOffset + 2,
          data.length - 2
        );

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );

          cb(error);
          return;
        }

        this._loop = false;
        this.emit('conclude', code, buf);
        this.end();
      }

      this._state = GET_INFO;
      return;
    }

    if (this._allowSynchronousEvents) {
      this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
        this._state = GET_INFO;
        this.startLoop(cb);
      });
    }
  }

  /**
   * Builds an error object.
   *
   * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
   * @param {String} message The error message
   * @param {Boolean} prefix Specifies whether or not to add a default prefix to
   *     `message`
   * @param {Number} statusCode The status code
   * @param {String} errorCode The exposed error code
   * @return {(Error|RangeError)} The error
   * @private
   */
  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;

    const err = new ErrorCtor(
      prefix ? `Invalid WebSocket frame: ${message}` : message
    );

    Error.captureStackTrace(err, this.createError);
    err.code = errorCode;
    err[kStatusCode] = statusCode;
    return err;
  }
}

module.exports = Receiver;


/***/ }),
/* 38 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { isUtf8 } = __webpack_require__(39);

const { hasBlob } = __webpack_require__(34);

//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
      // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0 // Overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4 // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Determines whether a value is a `Blob`.
 *
 * @param {*} value The value to be tested
 * @return {Boolean} `true` if `value` is a `Blob`, else `false`
 * @private
 */
function isBlob(value) {
  return (
    hasBlob &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.type === 'string' &&
    typeof value.stream === 'function' &&
    (value[Symbol.toStringTag] === 'Blob' ||
      value[Symbol.toStringTag] === 'File')
  );
}

module.exports = {
  isBlob,
  isValidStatusCode,
  isValidUTF8: _isValidUTF8,
  tokenChars
};

if (isUtf8) {
  module.exports.isValidUTF8 = function (buf) {
    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} /* istanbul ignore else  */ else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = __webpack_require__(40);

    module.exports.isValidUTF8 = function (buf) {
      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}


/***/ }),
/* 39 */
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),
/* 40 */
/***/ ((module) => {

"use strict";
module.exports = require("utf-8-validate");

/***/ }),
/* 41 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex" }] */



const { Duplex } = __webpack_require__(29);
const { randomFillSync } = __webpack_require__(4);
const {
  types: { isUint8Array }
} = __webpack_require__(42);

const PerMessageDeflate = __webpack_require__(31);
const { EMPTY_BUFFER, kWebSocket, NOOP } = __webpack_require__(34);
const { isBlob, isValidStatusCode } = __webpack_require__(38);
const { mask: applyMask, toBuffer } = __webpack_require__(33);

const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 8 * 1024;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;

/**
 * HyBi Sender implementation.
 */
class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {Duplex} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Function} [generateMask] The function used to generate the masking
   *     key
   */
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};

    if (generateMask) {
      this._generateMask = generateMask;
      this._maskBuffer = Buffer.alloc(4);
    }

    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._queue = [];
    this._state = DEFAULT;
    this.onerror = NOOP;
    this[kWebSocket] = undefined;
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {(Buffer|String)} data The data to frame
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {(Buffer|String)[]} The framed data
   * @public
   */
  static frame(data, options) {
    let mask;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      mask = options.maskBuffer || maskBuffer;

      if (options.generateMask) {
        options.generateMask(mask);
      } else {
        if (randomPoolPointer === RANDOM_POOL_SIZE) {
          /* istanbul ignore else  */
          if (randomPool === undefined) {
            //
            // This is lazily initialized because server-sent frames must not
            // be masked so it may never be used.
            //
            randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
          }

          randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
          randomPoolPointer = 0;
        }

        mask[0] = randomPool[randomPoolPointer++];
        mask[1] = randomPool[randomPoolPointer++];
        mask[2] = randomPool[randomPoolPointer++];
        mask[3] = randomPool[randomPoolPointer++];
      }

      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
      offset = 6;
    }

    let dataLength;

    if (typeof data === 'string') {
      if (
        (!options.mask || skipMasking) &&
        options[kByteLength] !== undefined
      ) {
        dataLength = options[kByteLength];
      } else {
        data = Buffer.from(data);
        dataLength = data.length;
      }
    } else {
      dataLength = data.length;
      merge = options.mask && options.readOnly && !skipMasking;
    }

    let payloadLength = dataLength;

    if (dataLength >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (dataLength > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(dataLength, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(dataLength, 4, 6);
    }

    if (!options.mask) return [target, data];

    target[1] |= 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (skipMasking) return [target, data];

    if (merge) {
      applyMask(data, mask, target, offset, dataLength);
      return [target];
    }

    applyMask(data, mask, data, 0, dataLength);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {(String|Buffer)} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(code, data, mask, cb) {
    let buf;

    if (code === undefined) {
      buf = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || !data.length) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);

      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);

      if (typeof data === 'string') {
        buf.write(data, 2);
      } else if (isUint8Array(data)) {
        buf.set(data, 2);
      } else {
        throw new TypeError('Second argument must be a string or a Uint8Array');
      }
    }

    const options = {
      [kByteLength]: buf.length,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x08,
      readOnly: false,
      rsv1: false
    };

    if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, buf, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(buf, options), cb);
    }
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(data, mask, cb) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x09,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, cb]);
      } else {
        this.getBlobData(data, false, options, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
    }
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(data, mask, cb) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x0a,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, cb]);
      } else {
        this.getBlobData(data, false, options, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
    }
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(data, options, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
      if (
        rsv1 &&
        perMessageDeflate &&
        perMessageDeflate.params[
          perMessageDeflate._isServer
            ? 'server_no_context_takeover'
            : 'client_no_context_takeover'
        ]
      ) {
        rsv1 = byteLength >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    const opts = {
      [kByteLength]: byteLength,
      fin: options.fin,
      generateMask: this._generateMask,
      mask: options.mask,
      maskBuffer: this._maskBuffer,
      opcode,
      readOnly,
      rsv1
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
      } else {
        this.getBlobData(data, this._compress, opts, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, this._compress, opts, cb]);
    } else {
      this.dispatch(data, this._compress, opts, cb);
    }
  }

  /**
   * Gets the contents of a blob as binary data.
   *
   * @param {Blob} blob The blob
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     the data
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  getBlobData(blob, compress, options, cb) {
    this._bufferedBytes += options[kByteLength];
    this._state = GET_BLOB_DATA;

    blob
      .arrayBuffer()
      .then((arrayBuffer) => {
        if (this._socket.destroyed) {
          const err = new Error(
            'The socket was closed while the blob was being read'
          );

          //
          // `callCallbacks` is called in the next tick to ensure that errors
          // that might be thrown in the callbacks behave like errors thrown
          // outside the promise chain.
          //
          process.nextTick(callCallbacks, this, err, cb);
          return;
        }

        this._bufferedBytes -= options[kByteLength];
        const data = toBuffer(arrayBuffer);

        if (!compress) {
          this._state = DEFAULT;
          this.sendFrame(Sender.frame(data, options), cb);
          this.dequeue();
        } else {
          this.dispatch(data, compress, options, cb);
        }
      })
      .catch((err) => {
        //
        // `onError` is called in the next tick for the same reason that
        // `callCallbacks` above is.
        //
        process.nextTick(onError, this, err, cb);
      });
  }

  /**
   * Dispatches a message.
   *
   * @param {(Buffer|String)} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    this._bufferedBytes += options[kByteLength];
    this._state = DEFLATING;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          'The socket was closed while data was being compressed'
        );

        callCallbacks(this, err, cb);
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      this._state = DEFAULT;
      options.readOnly = false;
      this.sendFrame(Sender.frame(buf, options), cb);
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (this._state === DEFAULT && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[3][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(params) {
    this._bufferedBytes += params[3][kByteLength];
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {(Buffer | String)[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
}

module.exports = Sender;

/**
 * Calls queued callbacks with an error.
 *
 * @param {Sender} sender The `Sender` instance
 * @param {Error} err The error to call the callbacks with
 * @param {Function} [cb] The first callback
 * @private
 */
function callCallbacks(sender, err, cb) {
  if (typeof cb === 'function') cb(err);

  for (let i = 0; i < sender._queue.length; i++) {
    const params = sender._queue[i];
    const callback = params[params.length - 1];

    if (typeof callback === 'function') callback(err);
  }
}

/**
 * Handles a `Sender` error.
 *
 * @param {Sender} sender The `Sender` instance
 * @param {Error} err The error
 * @param {Function} [cb] The first pending callback
 * @private
 */
function onError(sender, err, cb) {
  callCallbacks(sender, err, cb);
  sender.onerror(err);
}


/***/ }),
/* 42 */
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),
/* 43 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { kForOnEventAttribute, kListener } = __webpack_require__(34);

const kCode = Symbol('kCode');
const kData = Symbol('kData');
const kError = Symbol('kError');
const kMessage = Symbol('kMessage');
const kReason = Symbol('kReason');
const kTarget = Symbol('kTarget');
const kType = Symbol('kType');
const kWasClean = Symbol('kWasClean');

/**
 * Class representing an event.
 */
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @throws {TypeError} If the `type` argument is not specified
   */
  constructor(type) {
    this[kTarget] = null;
    this[kType] = type;
  }

  /**
   * @type {*}
   */
  get target() {
    return this[kTarget];
  }

  /**
   * @type {String}
   */
  get type() {
    return this[kType];
  }
}

Object.defineProperty(Event.prototype, 'target', { enumerable: true });
Object.defineProperty(Event.prototype, 'type', { enumerable: true });

/**
 * Class representing a close event.
 *
 * @extends Event
 */
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {Number} [options.code=0] The status code explaining why the
   *     connection was closed
   * @param {String} [options.reason=''] A human-readable string explaining why
   *     the connection was closed
   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
   *     connection was cleanly closed
   */
  constructor(type, options = {}) {
    super(type);

    this[kCode] = options.code === undefined ? 0 : options.code;
    this[kReason] = options.reason === undefined ? '' : options.reason;
    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
  }

  /**
   * @type {Number}
   */
  get code() {
    return this[kCode];
  }

  /**
   * @type {String}
   */
  get reason() {
    return this[kReason];
  }

  /**
   * @type {Boolean}
   */
  get wasClean() {
    return this[kWasClean];
  }
}

Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

/**
 * Class representing an error event.
 *
 * @extends Event
 */
class ErrorEvent extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.error=null] The error that generated this event
   * @param {String} [options.message=''] The error message
   */
  constructor(type, options = {}) {
    super(type);

    this[kError] = options.error === undefined ? null : options.error;
    this[kMessage] = options.message === undefined ? '' : options.message;
  }

  /**
   * @type {*}
   */
  get error() {
    return this[kError];
  }

  /**
   * @type {String}
   */
  get message() {
    return this[kMessage];
  }
}

Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

/**
 * Class representing a message event.
 *
 * @extends Event
 */
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.data=null] The message content
   */
  constructor(type, options = {}) {
    super(type);

    this[kData] = options.data === undefined ? null : options.data;
  }

  /**
   * @type {*}
   */
  get data() {
    return this[kData];
  }
}

Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {(Function|Object)} handler The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type, handler, options = {}) {
    for (const listener of this.listeners(type)) {
      if (
        !options[kForOnEventAttribute] &&
        listener[kListener] === handler &&
        !listener[kForOnEventAttribute]
      ) {
        return;
      }
    }

    let wrapper;

    if (type === 'message') {
      wrapper = function onMessage(data, isBinary) {
        const event = new MessageEvent('message', {
          data: isBinary ? data : data.toString()
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'close') {
      wrapper = function onClose(code, message) {
        const event = new CloseEvent('close', {
          code,
          reason: message.toString(),
          wasClean: this._closeFrameReceived && this._closeFrameSent
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'error') {
      wrapper = function onError(error) {
        const event = new ErrorEvent('error', {
          error,
          message: error.message
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'open') {
      wrapper = function onOpen() {
        const event = new Event('open');

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else {
      return;
    }

    wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
    wrapper[kListener] = handler;

    if (options.once) {
      this.once(type, wrapper);
    } else {
      this.on(type, wrapper);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {(Function|Object)} handler The listener to remove
   * @public
   */
  removeEventListener(type, handler) {
    for (const listener of this.listeners(type)) {
      if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
        this.removeListener(type, listener);
        break;
      }
    }
  }
};

module.exports = {
  CloseEvent,
  ErrorEvent,
  Event,
  EventTarget,
  MessageEvent
};

/**
 * Call an event listener
 *
 * @param {(Function|Object)} listener The listener to call
 * @param {*} thisArg The value to use as `this`` when calling the listener
 * @param {Event} event The event to pass to the listener
 * @private
 */
function callListener(listener, thisArg, event) {
  if (typeof listener === 'object' && listener.handleEvent) {
    listener.handleEvent.call(listener, event);
  } else {
    listener.call(thisArg, event);
  }
}


/***/ }),
/* 44 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { tokenChars } = __webpack_require__(38);

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (dest[name] === undefined) dest[name] = [elem];
  else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse(header) {
  const offers = Object.create(null);
  let params = Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let paramName;
  let start = -1;
  let code = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (
        i !== 0 &&
        (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
      ) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = Object.create(null);
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars[code] !== 1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        let value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, params);
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((k) => {
                let values = params[k];
                if (!Array.isArray(values)) values = [values];
                return values
                  .map((v) => (v === true ? k : `${k}=${v}`))
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };


/***/ }),
/* 45 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { tokenChars } = __webpack_require__(38);

/**
 * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
 *
 * @param {String} header The field value of the header
 * @return {Set} The subprotocol names
 * @public
 */
function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (i; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (
      i !== 0 &&
      (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
    ) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x2c /* ',' */) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }

      if (end === -1) end = i;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(start, i);

  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

module.exports = { parse };


/***/ }),
/* 46 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex$", "caughtErrors": "none" }] */



const EventEmitter = __webpack_require__(24);
const http = __webpack_require__(26);
const { Duplex } = __webpack_require__(29);
const { createHash } = __webpack_require__(4);

const extension = __webpack_require__(44);
const PerMessageDeflate = __webpack_require__(31);
const subprotocol = __webpack_require__(45);
const WebSocket = __webpack_require__(23);
const { CLOSE_TIMEOUT, GUID, kWebSocket } = __webpack_require__(34);

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

const RUNNING = 0;
const CLOSING = 1;
const CLOSED = 2;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {Boolean} [options.autoPong=true] Specifies whether or not to
   *     automatically send a pong in response to a ping
   * @param {Number} [options.backlog=511] The maximum length of the queue of
   *     pending connections
   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
   *     track clients
   * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
   *     wait for the closing handshake to finish after `websocket.close()` is
   *     called
   * @param {Function} [options.handleProtocols] A hook to handle protocols
   * @param {String} [options.host] The hostname where to bind the server
   * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
   *     buffered data chunks
   * @param {Number} [options.maxFragments=16384] The maximum number of message
   *     fragments
   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
   *     size
   * @param {Boolean} [options.noServer=false] Enable no server mode
   * @param {String} [options.path] Accept only connections matching this path
   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
   *     permessage-deflate
   * @param {Number} [options.port] The port where to bind the server
   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
   *     server to use
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @param {Function} [options.verifyClient] A hook to reject connections
   * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
   *     class to use. It must be the `WebSocket` class or class that extends it
   * @param {Function} [callback] A listener for the `listening` event
   */
  constructor(options, callback) {
    super();

    options = {
      allowSynchronousEvents: true,
      autoPong: true,
      maxBufferedChunks: 256 * 1024,
      maxFragments: 16 * 1024,
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      closeTimeout: CLOSE_TIMEOUT,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      WebSocket,
      ...options
    };

    if (
      (options.port == null && !options.server && !options.noServer) ||
      (options.port != null && (options.server || options.noServer)) ||
      (options.server && options.noServer)
    ) {
      throw new TypeError(
        'One and only one of the "port", "server", or "noServer" options ' +
          'must be specified'
      );
    }

    if (options.port != null) {
      this._server = http.createServer((req, res) => {
        const body = http.STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      this._server.listen(
        options.port,
        options.host,
        options.backlog,
        callback
      );
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      const emitConnection = this.emit.bind(this, 'connection');

      this._removeListeners = addListeners(this._server, {
        listening: this.emit.bind(this, 'listening'),
        error: this.emit.bind(this, 'error'),
        upgrade: (req, socket, head) => {
          this.handleUpgrade(req, socket, head, emitConnection);
        }
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) {
      this.clients = new Set();
      this._shouldEmitClose = false;
    }

    this.options = options;
    this._state = RUNNING;
  }

  /**
   * Returns the bound address, the address family name, and port of the server
   * as reported by the operating system if listening on an IP socket.
   * If the server is listening on a pipe or UNIX domain socket, the name is
   * returned as a string.
   *
   * @return {(Object|String|null)} The address of the server
   * @public
   */
  address() {
    if (this.options.noServer) {
      throw new Error('The server is operating in "noServer" mode');
    }

    if (!this._server) return null;
    return this._server.address();
  }

  /**
   * Stop the server from accepting new connections and emit the `'close'` event
   * when all existing connections are closed.
   *
   * @param {Function} [cb] A one-time listener for the `'close'` event
   * @public
   */
  close(cb) {
    if (this._state === CLOSED) {
      if (cb) {
        this.once('close', () => {
          cb(new Error('The server is not running'));
        });
      }

      process.nextTick(emitClose, this);
      return;
    }

    if (cb) this.once('close', cb);

    if (this._state === CLOSING) return;
    this._state = CLOSING;

    if (this.options.noServer || this.options.server) {
      if (this._server) {
        this._removeListeners();
        this._removeListeners = this._server = null;
      }

      if (this.clients) {
        if (!this.clients.size) {
          process.nextTick(emitClose, this);
        } else {
          this._shouldEmitClose = true;
        }
      } else {
        process.nextTick(emitClose, this);
      }
    } else {
      const server = this._server;

      this._removeListeners();
      this._removeListeners = this._server = null;

      //
      // The HTTP/S server was created internally. Close it, and rely on its
      // `'close'` event.
      //
      server.close(() => {
        emitClose(this);
      });
    }
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle(req) {
    if (this.options.path) {
      const index = req.url.indexOf('?');
      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

      if (pathname !== this.options.path) return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade(req, socket, head, cb) {
    socket.on('error', socketOnError);

    const key = req.headers['sec-websocket-key'];
    const upgrade = req.headers.upgrade;
    const version = +req.headers['sec-websocket-version'];

    if (req.method !== 'GET') {
      const message = 'Invalid HTTP method';
      abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
      return;
    }

    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
      const message = 'Invalid Upgrade header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (key === undefined || !keyRegex.test(key)) {
      const message = 'Missing or invalid Sec-WebSocket-Key header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (version !== 13 && version !== 8) {
      const message = 'Missing or invalid Sec-WebSocket-Version header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
        'Sec-WebSocket-Version': '13, 8'
      });
      return;
    }

    if (!this.shouldHandle(req)) {
      abortHandshake(socket, 400);
      return;
    }

    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
    let protocols = new Set();

    if (secWebSocketProtocol !== undefined) {
      try {
        protocols = subprotocol.parse(secWebSocketProtocol);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Protocol header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];
    const extensions = {};

    if (
      this.options.perMessageDeflate &&
      secWebSocketExtensions !== undefined
    ) {
      const perMessageDeflate = new PerMessageDeflate({
        ...this.options.perMessageDeflate,
        isServer: true,
        maxPayload: this.options.maxPayload
      });

      try {
        const offers = extension.parse(secWebSocketExtensions);

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        const message =
          'Invalid or unacceptable Sec-WebSocket-Extensions header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin:
          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.socket.authorized || req.socket.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message, headers) => {
          if (!verified) {
            return abortHandshake(socket, code || 401, message, headers);
          }

          this.completeUpgrade(
            extensions,
            key,
            protocols,
            req,
            socket,
            head,
            cb
          );
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
    }

    this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {Object} extensions The accepted extensions
   * @param {String} key The value of the `Sec-WebSocket-Key` header
   * @param {Set} protocols The subprotocols
   * @param {http.IncomingMessage} req The request object
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @throws {Error} If called more than once with the same socket
   * @private
   */
  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    if (socket[kWebSocket]) {
      throw new Error(
        'server.handleUpgrade() was called more than once with the same ' +
          'socket, possibly due to a misconfiguration'
      );
    }

    if (this._state > RUNNING) return abortHandshake(socket, 503);

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`
    ];

    const ws = new this.options.WebSocket(null, undefined, this.options);

    if (protocols.size) {
      //
      // Optionally call external protocol selection handler.
      //
      const protocol = this.options.handleProtocols
        ? this.options.handleProtocols(protocols, req)
        : protocols.values().next().value;

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        ws._protocol = protocol;
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = extension.format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
      ws._extensions = extensions;
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

    ws.setSocket(socket, head, {
      allowSynchronousEvents: this.options.allowSynchronousEvents,
      maxBufferedChunks: this.options.maxBufferedChunks,
      maxFragments: this.options.maxFragments,
      maxPayload: this.options.maxPayload,
      skipUTF8Validation: this.options.skipUTF8Validation
    });

    if (this.clients) {
      this.clients.add(ws);
      ws.on('close', () => {
        this.clients.delete(ws);

        if (this._shouldEmitClose && !this.clients.size) {
          process.nextTick(emitClose, this);
        }
      });
    }

    cb(ws, req);
  }
}

module.exports = WebSocketServer;

/**
 * Add event listeners on an `EventEmitter` using a map of <event, listener>
 * pairs.
 *
 * @param {EventEmitter} server The event emitter
 * @param {Object.<String, Function>} map The listeners to add
 * @return {Function} A function that will remove the added listeners when
 *     called
 * @private
 */
function addListeners(server, map) {
  for (const event of Object.keys(map)) server.on(event, map[event]);

  return function removeListeners() {
    for (const event of Object.keys(map)) {
      server.removeListener(event, map[event]);
    }
  };
}

/**
 * Emit a `'close'` event on an `EventEmitter`.
 *
 * @param {EventEmitter} server The event emitter
 * @private
 */
function emitClose(server) {
  server._state = CLOSED;
  server.emit('close');
}

/**
 * Handle socket errors.
 *
 * @private
 */
function socketOnError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {Duplex} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */
function abortHandshake(socket, code, message, headers) {
  //
  // The socket is writable unless the user destroyed or ended it before calling
  // `server.handleUpgrade()` or in the `verifyClient` function, which is a user
  // error. Handling this does not make much sense as the worst that can happen
  // is that some of the data written by the user might be discarded due to the
  // call to `socket.end()` below, which triggers an `'error'` event that in
  // turn causes the socket to be destroyed.
  //
  message = message || http.STATUS_CODES[code];
  headers = {
    Connection: 'close',
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(message),
    ...headers
  };

  socket.once('finish', socket.destroy);

  socket.end(
    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
      Object.keys(headers)
        .map((h) => `${h}: ${headers[h]}`)
        .join('\r\n') +
      '\r\n\r\n' +
      message
  );
}

/**
 * Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
 * one listener for it, otherwise call `abortHandshake()`.
 *
 * @param {WebSocketServer} server The WebSocket server
 * @param {http.IncomingMessage} req The request object
 * @param {Duplex} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} message The HTTP response body
 * @param {Object} [headers] The HTTP response headers
 * @private
 */
function abortHandshakeOrEmitwsClientError(
  server,
  req,
  socket,
  code,
  message,
  headers
) {
  if (server.listenerCount('wsClientError')) {
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);

    server.emit('wsClientError', err, socket, req);
  } else {
    abortHandshake(socket, code, message, headers);
  }
}


/***/ }),
/* 47 */
/***/ ((module) => {

function pairedAtTime(credentials) {
  const value = credentials && new Date(credentials.pairedAt).getTime();
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

function isCompleteCredential(credentials) {
  return Boolean(
    credentials &&
    credentials.server &&
    credentials.accessToken &&
    credentials.socketPath
  );
}

function normalizeConnectionProfile(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value)) {
    throw new Error('--connection must be 1-64 letters, numbers, periods, underscores, or hyphens');
  }
  return value;
}

function selectNewestCredentialCandidate(candidates) {
  let selected = null;
  candidates.forEach(function (candidate) {
    if (!candidate || !isCompleteCredential(candidate.credentials)) return;
    if (!selected || pairedAtTime(candidate.credentials) > pairedAtTime(selected.credentials)) {
      selected = candidate;
    }
  });
  return selected;
}

module.exports = {
  isCompleteCredential,
  normalizeConnectionProfile,
  pairedAtTime,
  selectNewestCredentialCandidate
};


/***/ }),
/* 48 */
/***/ ((module) => {

"use strict";


const MAX_CSV_BYTES = 1024 * 1024;

function csvError(message) {
  const error = new Error(message);
  error.code = 'INVALID_SELECTION_IMAGE_CSV';
  return error;
}

function parseRows(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
    } else if (character === '"' && field === '') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && source[index + 1] === '\n') index++;
      row.push(field);
      if (row.some(function (value) { return value !== ''; })) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (quoted) throw csvError('Image CSV contains an unterminated quoted field');
  row.push(field);
  if (row.some(function (value) { return value !== ''; })) rows.push(row);
  return rows;
}

function validateImageUrl(value, rowNumber) {
  if (!value || value.length > 2048 || !/^(?:https?:)?\/\//i.test(value)) {
    throw csvError('Image CSV row ' + rowNumber + ' url must be an HTTP(S) or protocol-relative URL');
  }
  let parsed;
  try {
    parsed = new URL(value, 'https://localhost');
  } catch (error) {
    throw csvError('Image CSV row ' + rowNumber + ' url is invalid');
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw csvError('Image CSV row ' + rowNumber + ' url must not contain credentials');
  }
}

function parseImageSelectionCsv(source) {
  if (typeof source !== 'string') throw csvError('Image CSV must be text');
  if (Buffer.byteLength(source, 'utf8') > MAX_CSV_BYTES) {
    throw csvError('Image CSV exceeds the 1 MB input limit');
  }
  const rows = parseRows(source.replace(/^\uFEFF/, ''));
  if (!rows.length) throw csvError('Image CSV is empty');
  const headers = rows[0].map(function (value) { return value.trim().toLowerCase(); });
  const typeIndex = headers.indexOf('type');
  const nameIndex = headers.indexOf('name');
  const urlIndex = headers.indexOf('url');
  const hasDashboardHeaders = typeIndex !== -1 && nameIndex !== -1 && urlIndex !== -1;
  const hasSimpleHeaders = typeIndex === -1 && nameIndex !== -1 && urlIndex !== -1;
  const dataRows = hasDashboardHeaders || hasSimpleHeaders ? rows.slice(1) : rows;
  const dataNameIndex = nameIndex === -1 ? 0 : nameIndex;
  const dataUrlIndex = urlIndex === -1 ? 1 : urlIndex;
  if (!hasDashboardHeaders && !hasSimpleHeaders && rows[0].length !== 2) {
    throw csvError('Image list requires Dashboard type,name,url headers or name,url pairs');
  }

  const seen = new Set();
  const selections = dataRows.map(function (row, index) {
    return { row: row, rowNumber: index + (dataRows === rows ? 1 : 2) };
  }).filter(function (entry) {
    return !hasDashboardHeaders ||
      (entry.row[typeIndex] || '').trim().toLowerCase() === 'image';
  }).map(function (entry) {
    const row = entry.row;
    const rowNumber = entry.rowNumber;
    const title = (row[dataNameIndex] || '').trim();
    const url = (row[dataUrlIndex] || '').trim();
    if (!title) throw csvError('Image CSV row ' + rowNumber + ' name must not be empty');
    validateImageUrl(url, rowNumber);
    if (seen.has(url)) throw csvError('Image CSV row ' + rowNumber + ' duplicates url "' + url + '"');
    seen.add(url);
    return { id: url, title: title };
  });
  if (!selections.length) throw csvError('Image CSV must contain at least one image row');
  if (selections.length > 100) throw csvError('Image CSV must contain at most 100 image rows');
  return selections;
}

module.exports = { parseImageSelectionCsv: parseImageSelectionCsv };

/***/ }),
/* 49 */
/***/ ((module) => {

const WIDGET_SCRIPT_REFERENCES = Object.freeze({
  12: 'references/composition-scripting/widget-gradient.md',
  642: 'references/composition-scripting/widget-image.md',
  812: 'references/composition-scripting/widget-videoclip.md',
  822: 'references/composition-scripting/widget-web-page.md',
  1022: 'references/composition-scripting/widget-rectangle.md',
  1032: 'references/composition-scripting/widget-text.md',
  1052: 'references/composition-scripting/widget-circle.md',
  1182: 'references/composition-scripting/widget-table.md',
  1212: 'references/composition-scripting/widget-html.md',
  1216: 'references/composition-scripting/widget-text-ticker.md',
  3284: 'references/composition-scripting/widget-grid.md',
  3367: 'references/composition-scripting/widget-bodymovin.md',
  3558: 'references/composition-scripting/widget-timer.md',
  3585: 'references/composition-scripting/widget-sound.md',
  3616: 'references/composition-scripting/widget-current-date-time.md',
  3617: 'references/composition-scripting/widget-date-time-countdown.md',
  3783: 'references/composition-scripting/widget-bodymovin-loop.md',
  3934: 'references/composition-scripting/widget-video-animation.md',
  3936: 'references/composition-scripting/widget-video-background.md',
  4307: 'references/composition-scripting/widget-videoclip-with-audio.md',
  4662: 'references/composition-scripting/widget-metrictext.md',
  4671: 'references/composition-scripting/widget-metrictextml.md',
  4672: 'references/composition-scripting/widget-metricticker.md',
  4706: 'references/composition-scripting/widget-metrictextanim.md',
  4758: 'references/composition-scripting/widget-metrictextstyle.md',
  4792: 'references/composition-scripting/widget-aigraphics.md'
});

function normalizeWidgetId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return value;
}

function compareValues(left, right) {
  if (left === null) return right === null ? 0 : 1;
  if (right === null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left).localeCompare(String(right));
}

function createWidgetReferences(tiles) {
  const routesByWidgetId = {};

  (Array.isArray(tiles) ? tiles : []).forEach(function(tile) {
    if (!tile || tile.type !== 'widget' || tile.widget === undefined || tile.widget === null) {
      return;
    }

    const widgetId = normalizeWidgetId(tile.widget);
    const routeKey = String(widgetId);
    if (!routesByWidgetId[routeKey]) {
      routesByWidgetId[routeKey] = {
        widgetId: widgetId,
        loadedVersions: [],
        document: WIDGET_SCRIPT_REFERENCES[routeKey] || null,
        referenceStatus: WIDGET_SCRIPT_REFERENCES[routeKey] ? 'available' : 'missing',
        versionPolicy: 'live-inspection-authoritative'
      };
    }

    const version = tile.version === undefined ? null : normalizeWidgetId(tile.version);
    if (routesByWidgetId[routeKey].loadedVersions.indexOf(version) === -1) {
      routesByWidgetId[routeKey].loadedVersions.push(version);
    }
  });

  return Object.keys(routesByWidgetId).map(function(routeKey) {
    const route = routesByWidgetId[routeKey];
    route.loadedVersions.sort(compareValues);
    return route;
  }).sort(function(left, right) {
    return compareValues(left.widgetId, right.widgetId);
  });
}

function createWidgetReferencesFromContent(json) {
  const tiles = [];
  const compositions = json && json.compositions ? json.compositions : {};

  Object.keys(compositions).forEach(function(compositionId) {
    const compositionTiles = compositions[compositionId] && compositions[compositionId].tiles;
    Object.keys(compositionTiles || {}).forEach(function(tileId) {
      tiles.push(compositionTiles[tileId]);
    });
  });

  return createWidgetReferences(tiles);
}

module.exports = {
  WIDGET_SCRIPT_REFERENCES,
  createWidgetReferences,
  createWidgetReferencesFromContent
};


/***/ }),
/* 50 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const fs = __webpack_require__(1);
const os = __webpack_require__(2);
const path = __webpack_require__(3);

const HOST_DIRECTORIES = ['.agents', '.claude', '.codex'];

function pathIdentity(value) {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function containsHostPath(skillRoot, hostDirectory) {
  const normalized = path.resolve(skillRoot).replace(/[\\/]+/g, path.sep);
  const marker = path.sep + hostDirectory + path.sep + 'skills' + path.sep + 'composer';
  return process.platform === 'win32'
    ? normalized.toLowerCase().includes(marker.toLowerCase())
    : normalized.includes(marker);
}

function realPath(value) {
  try {
    return fs.realpathSync.native ? fs.realpathSync.native(value) : fs.realpathSync(value);
  } catch (error) {
    return path.resolve(value);
  }
}

function getInstallationScope(skillRoot, homeDirectory) {
  const rootIdentity = pathIdentity(skillRoot);
  const home = homeDirectory || os.homedir();
  const globalRoots = HOST_DIRECTORIES.map(function (hostDirectory) {
    return pathIdentity(path.join(home, hostDirectory, 'skills', 'composer'));
  });
  if (globalRoots.includes(rootIdentity)) return 'global';
  return HOST_DIRECTORIES.some(function (hostDirectory) {
    return containsHostPath(skillRoot, hostDirectory);
  }) ? 'project' : 'custom';
}

function getInstallationHost(skillRoot) {
  const hostDirectory = HOST_DIRECTORIES.find(function (candidate) {
    return containsHostPath(skillRoot, candidate);
  });
  return hostDirectory ? hostDirectory.slice(1) : 'custom';
}

function findSkillInstallations(selectedRoot, options) {
  const settings = options || {};
  const cwd = path.resolve(settings.cwd || process.cwd());
  const home = path.resolve(settings.home || os.homedir());
  const candidates = [path.resolve(selectedRoot)];
  let current = cwd;
  while (true) {
    HOST_DIRECTORIES.forEach(function (hostDirectory) {
      candidates.push(path.join(current, hostDirectory, 'skills', 'composer'));
    });
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  HOST_DIRECTORIES.forEach(function (hostDirectory) {
    candidates.push(path.join(home, hostDirectory, 'skills', 'composer'));
  });

  const selectedPathIdentity = pathIdentity(selectedRoot);
  const selectedRealPathIdentity = pathIdentity(realPath(selectedRoot));
  const seenPaths = new Set();
  return candidates.filter(function (candidate) {
    const identity = pathIdentity(candidate);
    if (seenPaths.has(identity) || !fs.existsSync(path.join(candidate, 'SKILL.md'))) return false;
    seenPaths.add(identity);
    return true;
  }).map(function (candidate) {
    const root = path.resolve(candidate);
    const canonicalPath = realPath(root);
    let version = null;
    try {
      version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version || null;
    } catch (error) {}
    return {
      path: root,
      realPath: canonicalPath,
      scope: getInstallationScope(root, home),
      host: getInstallationHost(root),
      packageVersion: version,
      selected: pathIdentity(root) === selectedPathIdentity,
      samePhysicalInstallation: pathIdentity(canonicalPath) === selectedRealPathIdentity
    };
  });
}

function getDuplicateInstallations(installations) {
  const seenRealPaths = new Set();
  return installations.filter(function (installation) {
    if (installation.samePhysicalInstallation) return false;
    const identity = pathIdentity(installation.realPath);
    if (seenRealPaths.has(identity)) return false;
    seenRealPaths.add(identity);
    return true;
  });
}

module.exports = {
  findSkillInstallations,
  getDuplicateInstallations,
  getInstallationScope
};

/***/ }),
/* 51 */
/***/ ((module) => {

"use strict";
module.exports = require("./capture-composition-preview");

/***/ }),
/* 52 */
/***/ ((module) => {

"use strict";
module.exports = require("./ai-graphics-local");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
//#!/usr/bin/env node

const fs = __webpack_require__(1);
const os = __webpack_require__(2);
const path = __webpack_require__(3);
const crypto = __webpack_require__(4);
const tinycolor = __webpack_require__(5);
const uuid = __webpack_require__(6);
const WebSocket = __webpack_require__(21);
const credentialSelection = __webpack_require__(47);
const { parseImageSelectionCsv } = __webpack_require__(48);
const { createWidgetReferences } = __webpack_require__(49);
const { findSkillInstallations, getDuplicateInstallations, getInstallationScope } = __webpack_require__(50);

const DEFAULT_DEVICE_NAME = 'AI Agent';
const DEFAULT_SERVER_URL = 'https://beta.singular.live/';
const SKILL_VERSION = 195;
const PACKAGE_VERSION = '1.7.62';
const DEFAULT_TIMEOUT_MS = 15000;
const EDITOR_CONNECTION_GRACE_MS = 2000;
const PAIRING_INTENT_WAIT_MS = 2 * 60 * 1000;
const PAIRING_INTENT_RETRY_MS = 1100;
const ENV_CREDENTIALS_OVERRIDE_PATH = process.env.COMPOSER_AGENT_CREDENTIALS || null;
const DEFAULT_CREDENTIALS_PATH = path.join(os.homedir(), '.singular', 'composer-agent.json');
const CONNECTION_CREDENTIALS_DIRECTORY = path.join(os.homedir(), '.singular', 'composer-agent-connections');
const CREDENTIALS_SCOPE_PATH = path.resolve(__dirname, '..', '..', '..', '..');
const TEMPORARY_CREDENTIALS_PATH = path.join(
  os.tmpdir(),
  'singular-composer-agent',
  crypto.createHash('sha256').update(CREDENTIALS_SCOPE_PATH).digest('hex').slice(0, 16) + '.json'
);
let credentialsOverridePath = ENV_CREDENTIALS_OVERRIDE_PATH;
let credentialStorageCategory = ENV_CREDENTIALS_OVERRIDE_PATH ? 'override' : 'default';
let activeCredentialsPath = credentialsOverridePath || DEFAULT_CREDENTIALS_PATH;
const TABLE_WIDGET_ID = 1182;
const GRID_WIDGET_ID = 3284;
const MAX_TABLE_ROWS = 1000;
const MAX_TABLE_CONTENT_BYTES = 32 * 1024;
const MAX_CAPTURE_BYTES = 8 * 1024 * 1024;
const TABLE_OPTION_FIELDS = [
  'layoutDirection',
  'elementsPerPage',
  'lineSpacing',
  'updateStyle',
  'pageTransitionStyle',
  'pageTransitionOffset',
  'showLayout',
  'currentPage'
];
const GRID_OPTION_FIELDS = [
  'cols', 'rows', 'colsSpacing', 'rowsSpacing', 'updateStyle',
  'pageTransitionStyle', 'pageTransitionOffset', 'showLayout', 'currentPage'
];

// Flags that may be passed with no value (default true) or with an explicit
// true/false value.
const BOOLEAN_OPTIONS = new Set([
  'save',
  'pipe',
  'capture',
  'compact',
  'selected',
  'selection',
  'summary',
  'italic',
  'underline',
  'always-execute',
  'create',
  'remove',
  'clear',
  'preview',
  'replace',
  'append',
  'reuse-existing'
]);
const GLOBAL_COMMAND_OPTIONS = ['server', 'compact', 'template-session', 'connection'];
const KNOWN_COMMANDS = new Set([
  'doctor',
  'pair', 'pair-intent', 'check-connection', 'begin-work', 'start-work', 'wait-ready', 'finish-work', 'status', 'complete',
  'inspect', 'find-elements', 'composition-tree', 'resolve-references', 'script-handoff', 'control-composition',
  'timeline-link', 'set-timeline-link', 'logic-layers', 'set-logic-layer', 'rename-logic-layer',
  'create-composition', 'orchestrate', 'create-revision', 'list-revisions', 'read-revision', 'compare-revision',
  'list-app-templates', 'app-template-match', 'set-app-template-match', 'app-template-integration-resources',
  'restore-revision', 'delete-revision', 'delete-composition', 'open-composition', 'widget-subcompositions',
  'open-widget-subcomposition', 'update-table', 'update-grid', 'timeline2', 'display-variants',
  'configure-display-variants', 'activate-display-variant', 'set-display-variant-relevance', 'control-nodes',
  'metric-fonts', 'set-metric-font', 'upgrade-metric-widgets', 'widget-nodes', 'link-widget-nodes',
  'unlink-widget-nodes', 'set-control-value', 'set-control-font', 'create-table-control', 'set-table-control',
  'update-table-control', 'link-table-control', 'unlink-table-control', 'press-control', 'timer-action',
  'control-time', 'update-control', 'create-control-container', 'configure-control-container',
  'delete-control-container', 'create-control', 'create-controls', 'delete-control', 'unlink-layout-ref', 'get', 'get-many',
  'get-layouts', 'set-layouts', 'get-properties', 'set-properties', 'select', 'move', 'update', 'fonts',
  'set-font', 'timeline-animations', 'set-timeline-animation', 'set-timeline-animations', 'update-animations',
  'set-update-animation', 'set-update-animations', 'behaviors', 'set-behavior', 'set-behaviors', 'create-group',
  'configure-group', 'move-group', 'delete-group', 'capture', 'capture-worker', 'primitives', 'ensure-group',
  'create', 'delete', 'validate', 'apply', 'ai-graphics'
]);
const COMMAND_SUGGESTIONS = {
  open: 'open-composition',
  close: 'finish-work',
  tree: 'composition-tree',
  find: 'find-elements',
  controls: 'control-nodes',
  revisions: 'list-revisions'
};
let activeTemplateSessionToken = null;
let captureModule = null;
let aiGraphicsModule = null;

function getCaptureModule() {
  if (!captureModule) captureModule = __webpack_require__(51);
  return captureModule;
}

function getAIGraphicsModule() {
  if (!aiGraphicsModule) aiGraphicsModule = __webpack_require__(52);
  return aiGraphicsModule;
}

function createCaptureError(code, message) {
  return getCaptureModule().createCaptureError(code, message);
}

function readInstalledPackage() {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  } catch (error) {
    return null;
  }
}

function findSystemChrome() {
  const candidates = process.platform === 'win32' ? [
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
  ] : process.platform === 'darwin' ? [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ] : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];
  return candidates.filter(Boolean).some(function (candidate) { return fs.existsSync(candidate); });
}

function inspectPlaywrightCore(checkChrome) {
  const installedPackage = readInstalledPackage();
  const expectedVersion = installedPackage && installedPackage.dependencies &&
    installedPackage.dependencies['playwright-core'] || '1.63.0';
  let actualVersion = null;
  try {
    const metadataPath = path.join(__dirname, 'vendor', 'playwright-core', 'package.json');
    actualVersion = JSON.parse(fs.readFileSync(metadataPath, 'utf8')).version;
  } catch (error) {}
  const browserAvailable = checkChrome ? findSystemChrome() : null;
  const playwrightReady = actualVersion === expectedVersion;
  return {
    status: playwrightReady && (!checkChrome || browserAvailable) ? 'ready' : 'unavailable',
    playwright: {
      expectedVersion: expectedVersion || null,
      actualVersion: actualVersion,
      status: playwrightReady
        ? 'ready'
        : actualVersion ? 'version-mismatch' : 'missing'
    },
    chrome: checkChrome ? (browserAvailable ? 'available' : 'missing') : 'not-checked'
  };
}

function inspectServerCompatibility(credentials) {
  return new Promise(function (resolve) {
    const socket = new WebSocket(createSocketUrl(credentials));
    let settled = false;
    const timeout = setTimeout(function () {
      finish({ status: 'unavailable', reason: 'timeout' });
    }, DEFAULT_TIMEOUT_MS);
    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close(1000);
      resolve(result);
    }
    socket.on('open', function () {
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: credentials.accessToken,
        composerAgentVersion: SKILL_VERSION
      }));
    });
    socket.on('message', function (rawMessage) {
      let response;
      try {
        response = JSON.parse(rawMessage.toString());
      } catch (error) {
        finish({ status: 'unavailable', reason: 'invalid-response' });
        return;
      }
      if (response.type === 'authenticated') {
        finish({
          status: response.composerAgentVersion === SKILL_VERSION ? 'compatible' : 'version-mismatch',
          serverVersion: Number.isInteger(response.composerAgentVersion) ? response.composerAgentVersion : null
        });
      } else if (response.type === 'error') {
        finish({
          status: response.error && response.error.code === 'COMPOSER_AGENT_VERSION_MISMATCH'
            ? 'version-mismatch'
            : 'unavailable',
          serverVersion: response.error && Number.isInteger(response.error.serverVersion)
            ? response.error.serverVersion
            : null,
          reason: response.error && response.error.code || 'relay-error'
        });
      }
    });
    socket.on('error', function () { finish({ status: 'unavailable', reason: 'connection-failed' }); });
    socket.on('close', function () { finish({ status: 'unavailable', reason: 'connection-closed' }); });
  });
}

async function runDoctor(options) {
  assertAllowedOptions(options, ['capture'], 'doctor');
  const skillRoot = path.resolve(__dirname, '..');
  const installedPackage = readInstalledPackage();
  const installations = findSkillInstallations(skillRoot);
  const selectedInstallation = installations.find(function (installation) {
    return installation.selected;
  }) || {
    path: skillRoot,
    realPath: skillRoot,
    scope: getInstallationScope(skillRoot),
    host: 'custom',
    packageVersion: installedPackage && installedPackage.version || PACKAGE_VERSION,
    selected: true,
    samePhysicalInstallation: true
  };
  let server = { status: 'not-checked' };
  if (options.connection !== undefined || ENV_CREDENTIALS_OVERRIDE_PATH) {
    configureCredentialScope(options);
    try {
      const credentials = readCredentials();
      if (options.server !== undefined) validatePairedServerOption(options);
      server = await inspectServerCompatibility(credentials);
      server.origin = new URL(credentials.server).origin;
    } catch (error) {
      server = { status: 'unavailable', reason: error.code || error.message };
    }
  }
  const playwright = inspectPlaywrightCore(false);
  const capture = options.capture ? inspectPlaywrightCore(true) : { status: 'not-checked' };
  const nodeCompatible = Number(process.versions.node.split('.')[0]) === 22;
  const checksPassed = nodeCompatible && playwright.status === 'ready' &&
    (!options.capture || capture.status === 'ready') &&
    (!(options.connection !== undefined || ENV_CREDENTIALS_OVERRIDE_PATH) || server.status === 'compatible');
  return {
    status: checksPassed ? 'passed' : 'failed',
    packageVersion: selectedInstallation.packageVersion,
    protocolVersion: SKILL_VERSION,
    selectedInstallation: selectedInstallation,
    installations: installations,
    duplicateInstallations: getDuplicateInstallations(installations),
    effectiveRuntime: 'this command uses selectedInstallation; project skills override global skills when both are discovered; realPath identifies aliases of the same physical payload',
    node: {
      status: nodeCompatible ? 'compatible' : 'version-mismatch',
      expectedMajor: 22,
      actualMajor: Number(process.versions.node.split('.')[0])
    },
    core: {
      status: 'ready',
      selfContained: true,
      dependencies: ['tinycolor2', 'uuid', 'ws']
    },
    requiredDependencies: {
      status: playwright.status,
      playwright: playwright.playwright
    },
    capture: capture,
    server: server
  };
}

function unknownCommandError(command) {
  const suggestion = COMMAND_SUGGESTIONS[command];
  return new Error(
    `Unknown command "${command || ''}".` +
    (suggestion ? ` Did you mean "${suggestion}"?` : ' See references/commands.md for the command index.')
  );
}

function parseArguments(argv) {
  const command = argv[0];
  const options = {};
  let firstOptionIndex = 1;
  if ((command === 'capture-worker' || command === 'ai-graphics') && argv[1] && !argv[1].startsWith('--')) {
    options.action = argv[1];
    firstOptionIndex = 2;
  }
  for (let index = firstOptionIndex; index < argv.length; index++) {
    const argument = argv[index];
    if (!argument.startsWith('--')) {
      throw new Error(`Unexpected argument "${argument}"`);
    }
    const name = argument.slice(2);
    if (BOOLEAN_OPTIONS.has(name)) {
      const booleanValue = argv[index + 1];
      if (booleanValue === 'true' || booleanValue === 'false') {
        options[name] = booleanValue === 'true';
        index++;
      } else {
        options[name] = true;
      }
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${name}`);
    }

    options[name] = value;
    index++;
  }
  return { command, options };
}

function readJsonFile(filePath, description) {
  const inputPath = path.resolve(filePath);
  try {
    return JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch (err) {
    throw new Error(`Unable to read ${description}: ${err.message}`);
  }
}

function readJsonOptionFile(options, name, description, required) {
  const filePath = required
    ? requireOption(options, name)
    : options[name];
  if (filePath === undefined) return undefined;
  return readJsonFile(filePath, description);
}

function readTextFile(filePath, description) {
  try {
    return fs.readFileSync(path.resolve(filePath), 'utf8');
  } catch (err) {
    throw new Error(`Unable to read ${description}: ${err.message}`);
  }
}

function decodeComposerReference(value, index) {
  if (typeof value !== 'string') {
    throw new Error(`references[${index}] must be a copied Composer reference string`);
  }
  const match = value.trim().match(/(?:^|\s)@composer\/(widget|composition|group)\s+(ref_[a-f0-9]{16})$/);
  if (!match) {
    throw new Error(`references[${index}] is not a valid copied Composer reference`);
  }
  return {
    version: 1,
    expectedType: match[1],
    handle: match[2]
  };
}

function parseIds(value) {
  if (value.trim().startsWith('[')) {
    throw new Error('--ids accepts comma-separated IDs only; JSON arrays are not supported');
  }
  const ids = value.split(',').map(function (id) {
    return id.trim();
  }).filter(Boolean);
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('--ids must be a comma-separated list');
  }
  return ids;
}

function compactResult(command, result) {
  if (command === 'get' && result && result.widget) {
    return {
      elementType: result.elementType,
      managed: result.managed,
      element: {
        id: result.element.id,
        name: result.element.name,
        type: result.element.type,
        widget: result.element.widget,
        version: result.element.version,
        layout: result.element.layout,
        effects: result.element.effects,
        keyframes: result.element.keyframes
      },
      values: result.data,
      // Field metadata is versioned runtime authority, not optional detail. Keep the complete
      // sanitized schema even in compact output so no widget relies on stale catalog knowledge.
      fields: result.widget.fields || [],
      subCompositions: result.widget.subCompositions || []
    };
  }
  return result;
}

function createWidgetTemplateIdentityScope(options) {
  const scope = {
    kind: 'widget-template-edit-session',
    lifetime: 'current-open-template-only',
    discardAfter: ['leave-template', 'reopen-template', 'later-task-or-turn'],
    internalIds: [
      'compositionId',
      'descendantElementIds',
      'controlNodeKeyIds',
      'widgetNodeKeyIds',
      'linkLocations'
    ],
    widgetNodeAddressing: 'declared-field-id'
  };
  if (options && options.compositionId) {
    scope.sessionCompositionId = options.compositionId;
  }
  if (options && options.sessionToken) {
    scope.sessionToken = options.sessionToken;
    scope.requiredOption = '--template-session';
    scope.enforcement = {
      missing: 'WIDGET_TEMPLATE_SESSION_REQUIRED',
      stale: 'WIDGET_TEMPLATE_SESSION_STALE'
    };
  }
  if (options && options.widgetTileId && options.widgetFieldId) {
    scope.durableLocator = {
      widgetTileId: options.widgetTileId,
      widgetFieldId: options.widgetFieldId
    };
  }
  return scope;
}

function addWidgetTemplateIdentityScope(result, options) {
  if (!result || typeof result !== 'object') return result;
  result.identityScope = createWidgetTemplateIdentityScope(options || {});
  return result;
}

function writeWorkLifecycleReminder(command, succeeded, result) {
  if (!command || ['doctor', 'pair', 'pair-intent', 'check-connection', 'capture-worker', 'ai-graphics'].includes(command)) return;

  if (command === 'begin-work' && !succeeded && result && result.workCleanup && result.workCleanup.acknowledged) {
    console.error('COMPOSER_WORK_RELEASED: Automatic work release was acknowledged after readiness failure.');
    return;
  }

  if (command === 'finish-work' && succeeded) {
    console.error('COMPOSER_WORK_RELEASED: Composer input is unlocked.');
    return;
  }

  if (command === 'complete' && succeeded) {
    console.error('COMPOSER_AUTHORIZATION_REVOKED: Composer work is released and the saved authorization is revoked.');
    return;
  }

  console.error(
    'COMPOSER_FINALIZATION_REQUIRED: If start-work succeeded in this task, run finish-work before yielding.'
  );
}

function requireOption(options, name) {
  if (!options[name]) {
    throw new Error(`--${name} is required`);
  }
  return options[name];
}

function assertAllowedOptions(options, allowed, command) {
  Object.keys(options).forEach(function (name) {
    if (!allowed.includes(name) && !GLOBAL_COMMAND_OPTIONS.includes(name)) {
      throw new Error(`--${name} is not available for ${command}`);
    }
  });
}

function requireBooleanOption(options, name) {
  const value = requireOption(options, name);
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`--${name} must be "true" or "false"`);
}

// Directional effects take a named direction; dial effects take a numeric angle.
function parseAnimationProperty(raw) {
  const numeric = Number(raw);
  return raw.trim() !== '' && Number.isFinite(numeric) ? numeric : raw;
}

function normalizeServerUrl(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('--server must use http or https');
  }
  parsed.pathname = '/';
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

function validatePairedServerOption(options) {
  if (options.server === undefined) return;
  const requestedServer = normalizeServerUrl(options.server);
  const pairedServer = normalizeServerUrl(readCredentials().server);
  if (requestedServer !== pairedServer) {
    throw new Error('--server must match the paired Composer server. Pair with the requested server first.');
  }
}

function configureCredentialScope(options) {
  const connection = options.connection;
  if (connection !== undefined && ENV_CREDENTIALS_OVERRIDE_PATH) {
    throw new Error('--connection cannot be combined with COMPOSER_AGENT_CREDENTIALS');
  }
  if (connection !== undefined) {
    const profile = credentialSelection.normalizeConnectionProfile(connection);
    credentialsOverridePath = path.join(CONNECTION_CREDENTIALS_DIRECTORY, profile + '.json');
    credentialStorageCategory = 'connection-profile';
    activeCredentialsPath = credentialsOverridePath;
    return;
  }
  if (!ENV_CREDENTIALS_OVERRIDE_PATH) {
    throw new Error(
      '--connection is required to isolate this AI agent from other Composer connections. ' +
      'Use the same connection name for pair and every later command.'
    );
  }
}

function readCredentials() {
  const candidates = credentialsOverridePath
    ? [credentialsOverridePath]
    : [DEFAULT_CREDENTIALS_PATH, TEMPORARY_CREDENTIALS_PATH];
  const availableCredentials = [];
  let expiredCredentialsFound = false;
  let incompleteCredentialsFound = false;
  for (const candidate of candidates) {
    let candidateCredentials;
    try {
      candidateCredentials = JSON.parse(fs.readFileSync(candidate, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      if (!credentialsOverridePath && candidate === DEFAULT_CREDENTIALS_PATH &&
          isCredentialPermissionError(err)) continue;
      const credentialCategory = credentialsOverridePath
        ? 'configured'
        : candidate === TEMPORARY_CREDENTIALS_PATH ? 'temporary' : 'default';
      const readError = new Error(
        `Unable to read Composer credentials from the ${credentialCategory} credential location. ` +
        'Pair again or select a valid writable COMPOSER_AGENT_CREDENTIALS file.'
      );
      readError.code = 'CREDENTIAL_READ_FAILED';
      throw readError;
    }

    if (candidateCredentials.expiresAt &&
        new Date(candidateCredentials.expiresAt).getTime() <= Date.now()) {
      expiredCredentialsFound = true;
      if (candidate === TEMPORARY_CREDENTIALS_PATH) {
        activeCredentialsPath = candidate;
        removeTemporaryCredentials();
      }
      continue;
    }

    if (!credentialSelection.isCompleteCredential(candidateCredentials)) {
      incompleteCredentialsFound = true;
      continue;
    }
    availableCredentials.push({ path: candidate, credentials: candidateCredentials });
  }
  const selected = credentialSelection.selectNewestCredentialCandidate(availableCredentials);
  if (!selected) {
    if (expiredCredentialsFound) {
      throw new Error('Stored Composer credentials have expired. Pair again.');
    }
    if (incompleteCredentialsFound) {
      throw new Error('Stored Composer credentials are incomplete. Pair again.');
    }
    throw new Error('Composer is not paired. Run the pair command first.');
  }

  activeCredentialsPath = selected.path;
  return selected.credentials;
}

function isCredentialPermissionError(error) {
  return error && ['EACCES', 'EPERM', 'EROFS'].includes(error.code);
}

function writeCredentials(filePath, credentials) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = path.join(
    directory,
    '.' + path.basename(filePath) + '.' + process.pid + '.' + crypto.randomBytes(6).toString('hex') + '.tmp'
  );
  try {
    fs.writeFileSync(
      temporaryPath,
      JSON.stringify(credentials, null, 2),
      { encoding: 'utf8', mode: 0o600, flag: 'wx' }
    );
    fs.renameSync(temporaryPath, filePath);
  } finally {
    try {
      fs.unlinkSync(temporaryPath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

function preflightCredentialStorage() {
  const requestedPath = credentialsOverridePath || DEFAULT_CREDENTIALS_PATH;
  const directory = path.dirname(requestedPath);
  const probePath = path.join(
    directory,
    '.composer-agent-write-probe.' + process.pid + '.' + crypto.randomBytes(6).toString('hex')
  );
  try {
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    if (fs.existsSync(requestedPath)) {
      if (!fs.statSync(requestedPath).isFile()) {
        const typeError = new Error('credential target is not a file');
        typeError.code = 'EISDIR';
        throw typeError;
      }
      fs.accessSync(requestedPath, fs.constants.W_OK);
    }
    fs.writeFileSync(probePath, '', { mode: 0o600, flag: 'wx' });
    fs.unlinkSync(probePath);
  } catch (error) {
    try {
      fs.unlinkSync(probePath);
    } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') throw cleanupError;
    }
    const preflightError = new Error(
      'Composer credential storage is not writable. Fix the selected connection profile or ' +
      'COMPOSER_AGENT_CREDENTIALS location before requesting a new pairing code.'
    );
    preflightError.code = 'CREDENTIAL_WRITE_FAILED';
    throw preflightError;
  }
}

function saveCredentials(credentials) {
  const requestedPath = credentialsOverridePath || DEFAULT_CREDENTIALS_PATH;
  try {
    writeCredentials(requestedPath, credentials);
    activeCredentialsPath = requestedPath;
    return credentialsOverridePath ? credentialStorageCategory : 'default';
  } catch (error) {
    if (credentialsOverridePath || !isCredentialPermissionError(error)) {
      const writeError = new Error(
        'Unable to write Composer credentials to the configured credential path. ' +
        'Choose a writable COMPOSER_AGENT_CREDENTIALS location and pair again.'
      );
      writeError.code = 'CREDENTIAL_WRITE_FAILED';
      throw writeError;
    }
  }

  try {
    writeCredentials(TEMPORARY_CREDENTIALS_PATH, credentials);
    activeCredentialsPath = TEMPORARY_CREDENTIALS_PATH;
    return 'temporary';
  } catch (error) {
    const writeError = new Error(
      'Unable to write Composer credentials to the default or temporary credential location. ' +
      'Set COMPOSER_AGENT_CREDENTIALS to a writable file and pair again.'
    );
    writeError.code = 'CREDENTIAL_WRITE_FAILED';
    throw writeError;
  }
}

function removeTemporaryCredentials() {
  if (activeCredentialsPath !== TEMPORARY_CREDENTIALS_PATH) return;
  try {
    fs.unlinkSync(TEMPORARY_CREDENTIALS_PATH);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      const cleanupError = new Error('Unable to remove temporary Composer credentials after completion.');
      cleanupError.code = 'CREDENTIAL_CLEANUP_FAILED';
      throw cleanupError;
    }
  }
}

function removeRevokedCredentials() {
  if (
    activeCredentialsPath !== TEMPORARY_CREDENTIALS_PATH &&
    credentialStorageCategory !== 'connection-profile'
  ) return;
  try {
    fs.unlinkSync(activeCredentialsPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      const cleanupError = new Error('Unable to remove revoked Composer credentials.');
      cleanupError.code = 'CREDENTIAL_CLEANUP_FAILED';
      throw cleanupError;
    }
  }
}

async function createHttpError(response) {
  let body;
  try {
    body = await response.json();
  } catch (err) {
    return new Error(`Request failed with status ${response.status}`);
  }
  const error = new Error(body && body.error && body.error.message
    ? body.error.message
    : `Request failed with status ${response.status}`);
  if (body && body.error && typeof body.error.composerAgentCode === 'string') {
    error.code = body.error.composerAgentCode;
    if (error.code === 'COMPOSER_AGENT_VERSION_MISMATCH') {
      const legacyVersion = error.message.match(/Composer server version (\d+)\./);
      error.serverVersion = Number.isSafeInteger(body.error.serverVersion)
        ? body.error.serverVersion : legacyVersion ? Number(legacyVersion[1]) : null;
    }
  }
  return error;
}

function clearPairingDiagnostic() {
  try { fs.unlinkSync(activeCredentialsPath + '.pairing-status.json'); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Unable to clear previous pairing diagnostic'); }
}

async function pairingHttpError(response) {
  const error = await createHttpError(response);
  if (error.code === 'COMPOSER_AGENT_VERSION_MISMATCH' && Number.isSafeInteger(error.serverVersion)) {
    try {
      fs.writeFileSync(activeCredentialsPath + '.pairing-status.json', JSON.stringify({
        skillVersion: SKILL_VERSION, serverVersion: error.serverVersion, recordedAt: Date.now()
      }), { mode: 0o600 });
    } catch (storageError) {
      error.message += ' (Unable to retain the version diagnostic for check-connection.)';
    }
  }
  return error;
}

function assertNoRecentPairingMismatch() {
  let diagnostic;
  try { diagnostic = JSON.parse(fs.readFileSync(activeCredentialsPath + '.pairing-status.json', 'utf8')); }
  catch (error) { return; }
  if (!diagnostic || diagnostic.skillVersion !== SKILL_VERSION ||
      !Number.isSafeInteger(diagnostic.serverVersion) || diagnostic.serverVersion === SKILL_VERSION ||
      !Number.isSafeInteger(diagnostic.recordedAt) || diagnostic.recordedAt > Date.now() ||
      Date.now() - diagnostic.recordedAt > 30 * 60 * 1000) return;
  const error = new Error(`The last pairing attempt was rejected: installed skill protocol ${SKILL_VERSION}, Composer protocol ${diagnostic.serverVersion}. This is a saved pairing diagnostic, not a live server check. Install the latest skill and retry pairing after the protocols match; the pre-claim mismatch did not consume the code, but it may expire.`);
  error.code = 'COMPOSER_AGENT_VERSION_MISMATCH';
  throw error;
}

async function pair(options) {
  preflightCredentialStorage();
  clearPairingDiagnostic();
  const server = normalizeServerUrl(options.server || DEFAULT_SERVER_URL);
  const code = requireOption(options, 'code').toUpperCase();
  const response = await fetch(server + '/composer-agent/pairing/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code,
      deviceName: options['device-name'] || DEFAULT_DEVICE_NAME,
      composerAgentVersion: SKILL_VERSION
    })
  });

  if (!response.ok) {
    throw await pairingHttpError(response);
  }

  return finishPairing(server, await response.json());
}

async function pairIntent(options) {
  preflightCredentialStorage();
  clearPairingDiagnostic();
  const server = normalizeServerUrl(options.server || DEFAULT_SERVER_URL);
  const intentId = requireOption(options, 'intent-id');
  const intentSecret = readIntentSecret(options);
  const deadline = Date.now() + PAIRING_INTENT_WAIT_MS;

  while (true) {
    const response = await fetch(server + '/composer-agent/pairing/claim-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intentId: intentId,
        intentSecret: intentSecret,
        deviceName: options['device-name'] || DEFAULT_DEVICE_NAME,
        composerAgentVersion: SKILL_VERSION
      })
    });

    if (response.ok) {
      return finishPairing(server, await response.json());
    }
    const responseError = await pairingHttpError(response);
    if (responseError.code === 'COMPOSER_AGENT_VERSION_MISMATCH' ||
        (response.status !== 409 && response.status !== 429)) {
      throw responseError;
    }
    if (Date.now() + PAIRING_INTENT_RETRY_MS > deadline) {
      throw new Error('Timed out waiting for Composer to bind the pairing intent');
    }
    await new Promise(function (resolve) {
      setTimeout(resolve, PAIRING_INTENT_RETRY_MS);
    });
  }
}

// The intent secret is a credential. Only accept inputs that keep it out of
// the process argument list and shell history: COMPOSER_AGENT_INTENT_SECRET or
// `--intent-secret -` with the secret piped through stdin.
function readIntentSecret(options) {
  const flagValue = options['intent-secret'];
  if (flagValue === '-') {
    const stdinValue = fs.readFileSync(0, 'utf8').trim();
    if (!stdinValue) {
      throw new Error('--intent-secret - requires the intent secret on stdin');
    }
    return stdinValue;
  }
  if (flagValue !== undefined) {
    throw new Error('--intent-secret only accepts "-"; use stdin or COMPOSER_AGENT_INTENT_SECRET');
  }
  const envValue = process.env.COMPOSER_AGENT_INTENT_SECRET;
  if (envValue) return envValue;
  throw new Error(
    'intent secret is required: set COMPOSER_AGENT_INTENT_SECRET or pass --intent-secret - with the secret on stdin'
  );
}

async function finishPairing(server, pairing) {
  assertCompatibleComposerAgentVersion({ composerAgentVersion: pairing.composerAgentVersion }, false);
  const credentials = {
    server: server,
    accessToken: pairing.accessToken,
    socketPath: pairing.socketPath,
    sceneId: pairing.sceneId,
    sceneName: pairing.sceneName,
    capabilities: pairing.capabilities,
    composerAgentVersion: SKILL_VERSION,
    pairedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + pairing.expiresIn * 1000).toISOString()
  };
  const credentialStorage = saveCredentials(credentials);

  let acknowledged = false;
  let acknowledgement = { status: 'failed', reason: 'acknowledgement-rejected' };
  try {
    await sendSessionMessage(null, 'pairing_acknowledged', credentials);
    acknowledged = true;
    acknowledgement = { status: 'acknowledged' };
  } catch (err) {
    if (err && err.code === 'COMPOSER_AGENT_VERSION_MISMATCH') {
      acknowledgement.reason = 'version-mismatch';
      acknowledgement.code = err.code;
      acknowledgement.skillVersion = SKILL_VERSION;
      acknowledgement.serverVersion = err.serverVersion;
    } else if (err && err.code === 'SESSION_CANCELLED') {
      acknowledgement.reason = 'authorization-rejected';
    } else if (/Timed out waiting/.test(err && err.message || '')) {
      acknowledgement.reason = 'timeout';
    } else if (/Unable to connect|connection closed/i.test(err && err.message || '')) {
      acknowledgement.reason = 'editor-unavailable';
    }
  }

  console.log(JSON.stringify({
    paired: true,
    acknowledged: acknowledged,
    acknowledgement: acknowledgement,
    sceneName: pairing.sceneName,
    capabilities: pairing.capabilities,
    credentialStorage: credentialStorage,
    expiresIn: pairing.expiresIn
  }, null, 2));
}

function createSocketUrl(credentials) {
  const socketUrl = new URL(credentials.socketPath, credentials.server);
  socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return socketUrl.toString();
}

function assertCompatibleComposerAgentVersion(authentication, allowMismatch) {
  const serverVersion = authentication && authentication.composerAgentVersion;
  if (serverVersion === SKILL_VERSION || allowMismatch) return;
  let message;
  if (!Number.isInteger(serverVersion)) {
    message = `Installed Composer skill protocol ${SKILL_VERSION} could not determine the Composer protocol. Keep the latest available skill installed, update Composer, then retry after the protocols match.`;
  } else if (SKILL_VERSION > serverVersion) {
    message = `Installed Composer skill protocol ${SKILL_VERSION} is newer than Composer protocol ${serverVersion}. Keep the latest available skill installed. Update Composer to protocol ${SKILL_VERSION}, then reopen the paired composition.`;
  } else {
    message = `Composer protocol ${serverVersion} is newer than installed skill protocol ${SKILL_VERSION}. Install the latest available Composer skill, then retry the connection.`;
  }
  const error = new Error(message);
  error.code = 'COMPOSER_AGENT_VERSION_MISMATCH';
  error.serverVersion = Number.isInteger(serverVersion) ? serverVersion : null;
  throw error;
}

function sendSessionMessage(message, acknowledgementType, pairedCredentials) {
  const credentials = pairedCredentials || readCredentials();
  const activityId = message && message.type === 'activity' ? uuid.v4() : null;
  const outgoingMessage = activityId
    ? Object.assign({}, message, { activityId: activityId })
    : message;

  return new Promise(function (resolve, reject) {
    const socket = new WebSocket(createSocketUrl(credentials));
    let settled = false;
    const timeout = setTimeout(function () {
      finish(new Error('Timed out waiting for the open Composer session'));
    }, DEFAULT_TIMEOUT_MS);

    function finish(err, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000);
      }
      if (err) reject(err);
      else resolve(result);
    }

    socket.on('open', function () {
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: credentials.accessToken,
        composerAgentVersion: SKILL_VERSION
      }));
    });

    socket.on('message', function (rawMessage) {
      let response;
      try {
        response = JSON.parse(rawMessage.toString());
      } catch (err) {
        finish(new Error('Composer relay returned invalid JSON'));
        return;
      }
      if (response.type === 'authenticated') {
        try {
          assertCompatibleComposerAgentVersion(
            response,
            outgoingMessage && ['work_finish', 'session_complete'].includes(outgoingMessage.type)
          );
        } catch (error) {
          finish(error);
          return;
        }
        if (outgoingMessage) socket.send(JSON.stringify(outgoingMessage));
      } else if (
        response.type === acknowledgementType &&
        (!activityId || response.activityId === activityId)
      ) {
        finish(null, { sent: true });
      } else if (response.type === 'session_cancelled') {
        const cancelledError = new Error('Composer operation was canceled by the user. Pair again.');
        cancelledError.code = 'SESSION_CANCELLED';
        finish(cancelledError);
      } else if (response.type === 'operation_cancelled') {
        const interruptedError = new Error('Composer operation was canceled by the user.');
        interruptedError.code = 'OPERATION_CANCELLED';
        finish(interruptedError);
      } else if (response.type === 'error') {
        finish(new Error(response.error && response.error.message
          ? response.error.message
          : 'Composer relay error'));
      }
    });

    socket.on('error', function (err) {
      finish(new Error(`Unable to connect to Composer: ${err.message}`));
    });

    socket.on('close', function (code, reason) {
      if (!settled) {
        const detail = reason ? `: ${reason.toString()}` : '';
        finish(new Error('Composer connection closed' + detail + ` (code ${code})`));
      }
    });
  });
}

function waitForComposerReady(options, requireWorkLease) {
  const credentials = readCredentials();
  const readinessId = uuid.v4();
  const timeoutMs = options.timeout === undefined ? 30000 : Number(options.timeout);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) {
    throw new Error('--timeout must be an integer from 1 to 120000 milliseconds');
  }

  return new Promise(function (resolve, reject) {
    const socket = new WebSocket(createSocketUrl(credentials));
    const readiness = {
      status: 'waiting',
      authorization: 'pending',
      editor: 'unknown',
      commands: 'unknown',
      workLease: 'unknown',
      workExpiresAt: null
    };
    let settled = false;
    let probeTimer = null;
    let editorConnectionTimer = null;
    const timeout = setTimeout(function () {
      const result = Object.assign({}, readiness, { status: 'timeout' });
      const pairedVersion = Number(credentials.composerAgentVersion);
      if (
        readiness.authorization === 'active' &&
        readiness.editor === 'unknown' &&
        (!Number.isInteger(pairedVersion) || pairedVersion !== SKILL_VERSION)
      ) {
        result.status = 'reload-required';
        result.editor = 'version-mismatch';
        result.commands = 'unavailable';
        const reloadError = new Error(
          'The Composer AI panel has not reconnected since the Composer protocol changed. ' +
          'Reload the Composer composition; pairing persists.'
        );
        reloadError.code = 'EDITOR_RELOAD_REQUIRED';
        reloadError.result = result;
        finish(reloadError);
        return;
      }
      const error = new Error(
        `Composer did not become ready within ${timeoutMs} ms ` +
        `(editor=${result.editor}, commands=${result.commands}, workLease=${result.workLease})`
      );
      error.code = 'COMPOSER_NOT_READY';
      error.result = result;
      finish(error);
    }, timeoutMs);

    function finish(err, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (probeTimer) clearInterval(probeTimer);
      if (editorConnectionTimer) clearTimeout(editorConnectionTimer);
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000);
      }
      if (err) reject(err);
      else resolve(result);
    }

    function finishIfReady() {
      if (
        readiness.authorization === 'active' &&
        readiness.editor === 'connected' &&
        readiness.commands === 'ready' &&
        (requireWorkLease === false || readiness.workLease === 'active')
      ) {
        finish(null, Object.assign({}, readiness, {
          status: requireWorkLease === false ? 'connected' : 'ready'
        }));
      }
    }

    function finishEditorDisconnected() {
      const result = Object.assign({}, readiness, {
        status: 'editor-disconnected',
        editor: 'disconnected',
        commands: 'unavailable'
      });
      const error = new Error(
        'The paired Composer composition is not open. Reopen that composition; ' +
        'its Composer AI connection starts automatically.'
      );
      error.code = 'COMPOSER_EDITOR_DISCONNECTED';
      error.result = result;
      finish(error);
    }

    function startEditorConnectionGrace() {
      if (editorConnectionTimer || readiness.editor !== 'unknown') return;
      editorConnectionTimer = setTimeout(function () {
        if (readiness.authorization === 'active' && readiness.editor === 'unknown') {
          finishEditorDisconnected();
        }
      }, Math.min(timeoutMs, EDITOR_CONNECTION_GRACE_MS));
    }

    function sendProbe() {
      if (socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({
        type: 'readiness_request',
        readinessId: readinessId
      }));
    }

    socket.on('open', function () {
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: credentials.accessToken,
        composerAgentVersion: SKILL_VERSION
      }));
    });

    socket.on('message', function (rawMessage) {
      let message;
      try {
        message = JSON.parse(rawMessage.toString());
      } catch (err) {
        finish(new Error('Composer relay returned invalid JSON'));
        return;
      }

      if (message.type === 'authenticated') {
        try {
          assertCompatibleComposerAgentVersion(message, false);
        } catch (error) {
          finish(error);
          return;
        }
        readiness.authorization = 'active';
        sendProbe();
        probeTimer = setInterval(sendProbe, 500);
        startEditorConnectionGrace();
        finishIfReady();
      } else if (message.type === 'readiness_status') {
        readiness.authorization = message.authorization || readiness.authorization;
        readiness.workLease = message.workLease || readiness.workLease;
        readiness.workExpiresAt = message.workExpiresAt || null;
        finishIfReady();
      } else if (message.type === 'editor_status') {
        if (message.status === 'version-mismatch') {
          readiness.editor = 'version-mismatch';
          readiness.commands = 'unavailable';
          const editorVersion = Number(message.editorVersion);
          const reloadMessage = Number.isInteger(editorVersion) && editorVersion > SKILL_VERSION
            ? `The loaded Composer editor protocol ${editorVersion} is newer than installed skill protocol ${SKILL_VERSION}. Update the selected skill, then retry; pairing persists.`
            : Number.isInteger(editorVersion)
            ? `The loaded Composer editor protocol ${editorVersion} is older than installed skill protocol ${SKILL_VERSION}. Update Composer, then reload or reopen the paired composition; pairing persists.`
            : 'The loaded Composer editor protocol is stale. Update Composer if needed, then reload or reopen the paired composition; pairing persists.';
          const reloadError = new Error(reloadMessage);
          reloadError.code = 'EDITOR_RELOAD_REQUIRED';
          reloadError.result = Object.assign({}, readiness, { status: 'reload-required' });
          finish(reloadError);
          return;
        }
        readiness.editor = message.status === 'connected' ? 'connected' : 'disconnected';
        if (message.status !== 'connected') {
          readiness.commands = 'unavailable';
          finishEditorDisconnected();
          return;
        } else if (readiness.commands !== 'ready') readiness.commands = 'initializing';
        finishIfReady();
      } else if (
        message.type === 'readiness_acknowledged' &&
        message.readinessId === readinessId
      ) {
        readiness.editor = 'connected';
        readiness.commands = 'ready';
        finishIfReady();
      } else if (message.type === 'session_cancelled') {
        const cancelledError = new Error('Composer operation was canceled by the user. Pair again.');
        cancelledError.code = 'SESSION_CANCELLED';
        finish(cancelledError);
      } else if (message.type === 'operation_cancelled') {
        const interruptedError = new Error('Composer operation was canceled by the user.');
        interruptedError.code = 'OPERATION_CANCELLED';
        finish(interruptedError);
      } else if (message.type === 'error') {
        finish(new Error(message.error && message.error.message
          ? message.error.message
          : 'Composer relay error'));
      }
    });

    socket.on('error', function (err) {
      finish(new Error(`Unable to connect to Composer: ${err.message}`));
    });

    socket.on('close', function (code, reason) {
      if (!settled) {
        const detail = reason ? `: ${reason.toString()}` : '';
        finish(new Error('Composer connection closed' + detail + ` (code ${code})`));
      }
    });
  });
}

async function beginWork(options) {
  assertAllowedOptions(options, ['timeout', 'compact'], 'begin-work');
  await sendSessionMessage({ type: 'work_start' }, 'work_started');
  try {
    return await waitForComposerReady(options);
  } catch (error) {
    const result = Object.assign({ status: 'readiness-failed' }, error.result, {
      workLease: 'unknown',
      workExpiresAt: null,
      workCleanup: { status: 'unknown', acknowledged: false, code: 'WORK_RELEASE_UNCONFIRMED' }
    });
    error.result = result;
    try {
      await sendSessionMessage({ type: 'work_finish' }, 'work_finished');
      result.workLease = 'missing';
      result.workCleanup = { status: 'released', acknowledged: true };
      error.message = 'Readiness check failed: ' + error.message + '; automatic work release acknowledged.';
    } catch (cleanupError) {
      error.message = 'Readiness check failed: ' + error.message + '; automatic work release was not acknowledged; final lease disposition is unknown (WORK_RELEASE_UNCONFIRMED).';
    }
    throw error;
  }
}

async function finishWork(options) {
  assertAllowedOptions(options, ['save', 'compact'], 'finish-work');
  let saveResult;
  let stage = options.save ? 'save' : 'release';
  try {
    if (options.save) saveResult = await executeCommand('composition.autosave.finish', {}, 120000);
    stage = 'release';
    const result = await sendSessionMessage({ type: 'work_finish' }, 'work_finished');
    if (saveResult) result.save = saveResult;
    return result;
  } catch (error) {
    if (!options.save) throw error;
    const preservedCodes = ['OPERATION_CANCELLED', 'SESSION_CANCELLED', 'SESSION_COMPLETED',
      'WORK_NOT_STARTED', 'COMPOSER_AGENT_VERSION_MISMATCH', 'SAVE_FAILED'];
    const code = preservedCodes.includes(error.code) ? error.code : 'COMPOSER_FINALIZATION_UNCONFIRMED';
    const failure = new Error('Finalization did not complete with an acknowledged result. Save and lease disposition require recovery readback; do not replay the save.');
    failure.code = code;
    failure.result = {
      status: 'failed', code: code, stage: stage,
      workLease: 'unknown', workExpiresAt: null,
      save: saveResult ? Object.assign({ status: 'acknowledged' }, saveResult) : { status: 'unknown' }
    };
    if (code === 'COMPOSER_AGENT_VERSION_MISMATCH' && Number.isInteger(error.serverVersion)) {
      failure.result.serverVersion = error.serverVersion;
    }
    throw failure;
  }
}

function executeCommand(method, params, commandTimeoutMs) {
  const credentials = readCredentials();
  const request = {
    id: uuid.v4(),
    method: method,
    params: params || {}
  };
  if (activeTemplateSessionToken) {
    request.templateSessionToken = activeTemplateSessionToken;
  }

  return new Promise(function (resolve, reject) {
    const socket = new WebSocket(createSocketUrl(credentials));
    let authenticated = false;
    let settled = false;
    const timeout = setTimeout(function () {
      finish(new Error('Timed out waiting for the open Composer session'));
    }, commandTimeoutMs || DEFAULT_TIMEOUT_MS);

    function finish(err, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000);
      }
      if (err) reject(err);
      else resolve(result);
    }

    socket.on('open', function () {
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: credentials.accessToken,
        composerAgentVersion: SKILL_VERSION
      }));
    });

    socket.on('message', function (rawMessage) {
      let message;
      try {
        message = JSON.parse(rawMessage.toString());
      } catch (err) {
        finish(new Error('Composer relay returned invalid JSON'));
        return;
      }

      if (message.type === 'authenticated') {
        authenticated = true;
        try {
          assertCompatibleComposerAgentVersion(message, false);
        } catch (error) {
          finish(error);
          return;
        }
        socket.send(JSON.stringify({ type: 'command', request: request }));
      } else if (
        message.type === 'response' &&
        message.response &&
        message.response.id === request.id
      ) {
        if (message.response.error) {
          const commandError = new Error(message.response.error.message || 'Composer command failed');
          commandError.code = message.response.error.code;
          finish(commandError);
        } else {
          finish(null, message.response.result);
        }
      } else if (
        message.type === 'editor_status' &&
        message.status === 'disconnected'
      ) {
        finish(new Error('The paired Composer session is not open'));
      } else if (message.type === 'session_cancelled') {
        const cancelledError = new Error('Composer operation was canceled by the user. Pair again.');
        cancelledError.code = 'SESSION_CANCELLED';
        finish(cancelledError);
      } else if (message.type === 'operation_cancelled') {
        const interruptedError = new Error('Composer operation was canceled by the user.');
        interruptedError.code = 'OPERATION_CANCELLED';
        finish(interruptedError);
      } else if (message.type === 'error') {
        finish(new Error(message.error && message.error.message
          ? message.error.message
          : 'Composer relay error'));
      }
    });

    socket.on('error', function (err) {
      finish(new Error(`Unable to connect to Composer: ${err.message}`));
    });

    socket.on('close', function (code, reason) {
      if (!settled) {
        const detail = reason ? `: ${reason.toString()}` : '';
        const prefix = authenticated
          ? 'Composer connection closed'
          : 'Composer authentication failed';
        finish(new Error(prefix + detail + ` (code ${code})`));
      }
    });
  });
}

function getElementParams(options) {
  const elementType = requireOption(options, 'type');
  if (elementType !== 'tile' && elementType !== 'group') {
    throw new Error('--type must be "tile" or "group"');
  }
  return {
    elementType: elementType,
    id: requireOption(options, 'id')
  };
}

function requireWidgetTile(result, id) {
  if (!result || result.elementType !== 'tile' || !result.element || result.element.type !== 'widget') {
    throw new Error(`tile "${id}" is not a widget`);
  }
  return result;
}

function selectWidgetSubComposition(result, options, allowUnassigned) {
  const subCompositions = result.widget && Array.isArray(result.widget.subCompositions)
    ? result.widget.subCompositions
    : [];
  const fieldId = options.field;
  const matches = fieldId
    ? subCompositions.filter(function (item) { return item.fieldId === fieldId; })
    : subCompositions;
  if (matches.length === 0) {
    throw new Error(fieldId
      ? `widget tile "${result.element.id}" has no sub-composition field "${fieldId}"`
      : `widget tile "${result.element.id}" has no sub-compositions`);
  }
  if (matches.length > 1) {
    throw new Error(`widget tile "${result.element.id}" has multiple sub-compositions; pass --field`);
  }
  const selected = matches[0];
  if (selected.compositionId && !selected.exists) {
    throw new Error(
      `widget sub-composition "${selected.fieldId}" on tile "${result.element.id}" references a missing composition`
    );
  }
  if (!selected.compositionId && !allowUnassigned) {
    throw new Error(
      `widget sub-composition "${selected.fieldId}" on tile "${result.element.id}" is not assigned`
    );
  }
  return selected;
}

async function inspectWidgetSubCompositions(options) {
  const id = requireOption(options, 'id');
  const result = requireWidgetTile(await executeCommand('element.get', {
    elementType: 'tile',
    id: id
  }), id);
  return {
    tile: {
      id: result.element.id,
      name: result.element.name,
      widget: result.widget && result.widget.id,
      version: result.widget && result.widget.version
    },
    subCompositions: result.widget && result.widget.subCompositions || []
  };
}

async function openWidgetSubComposition(options) {
  const id = requireOption(options, 'id');
  const result = requireWidgetTile(await executeCommand('element.get', {
    elementType: 'tile',
    id: id
  }), id);
  const subComposition = selectWidgetSubComposition(result, options, options.create === true);
  const opened = await executeCommand('composition.open', {
    widgetTileId: result.element.id,
    fieldId: subComposition.fieldId,
    createIfMissing: true
  });
  const relationship = opened && opened.widgetSubComposition;
  const scoped = addWidgetTemplateIdentityScope(opened, {
    compositionId: relationship && relationship.compositionId,
    widgetTileId: result.element.id,
    widgetFieldId: subComposition.fieldId,
    sessionToken: relationship && relationship.sessionToken
  });
  if (relationship) delete relationship.sessionToken;
  return scoped;
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function validateTableControlValue(control, value, pathLabel, widgetLabel = 'table') {
  if (!['text', 'image', 'number', 'color', 'checkbox'].includes(control.type)) {
    throw new Error(`${widgetLabel} template control "${control.id}" has unsupported type "${control.type}"`);
  }
  if ((control.type === 'text' || control.type === 'image') && typeof value !== 'string') {
    throw new Error(`${pathLabel} must be a string for ${control.type} control "${control.id}"`);
  }
  if (control.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error(`${pathLabel} must be a finite number for control "${control.id}"`);
  }
  if (control.type === 'checkbox' && typeof value !== 'boolean') {
    throw new Error(`${pathLabel} must be a boolean for checkbox control "${control.id}"`);
  }
  if (
    control.type === 'color' &&
    !tinycolor(value).isValid()
  ) {
    throw new Error(`${pathLabel} must be a tinycolor2-compatible value for control "${control.id}"`);
  }
}

function validateTableOption(name, value) {
  if (name === 'layoutDirection' && !['horizontal', 'vertical'].includes(value)) {
    throw new Error('options.layoutDirection must be "horizontal" or "vertical"');
  }
  if (name === 'updateStyle' && !['update', 'timeline'].includes(value)) {
    throw new Error('options.updateStyle must be "update" or "timeline"');
  }
  if (
    name === 'pageTransitionStyle' &&
    !['topToBottom', 'bottomToTop', 'random'].includes(value)
  ) {
    throw new Error('options.pageTransitionStyle is invalid');
  }
  if (name === 'showLayout' && typeof value !== 'boolean') {
    throw new Error('options.showLayout must be a boolean');
  }
  if (name === 'elementsPerPage') {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 100) {
      throw new Error('options.elementsPerPage must be an integer from 1 to 100');
    }
  }
  if (name === 'lineSpacing' || name === 'pageTransitionOffset') {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      throw new Error(`options.${name} must be a non-negative number`);
    }
  }
  if (name === 'currentPage') {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < 0) {
      throw new Error('options.currentPage must be a non-negative integer');
    }
  }
}

function validateGridOption(name, value) {
  if (name === 'showLayout' || name === 'updateStyle') {
    return validateTableOption(name, value);
  }
  if (name === 'pageTransitionStyle') {
    if (!['topToBottom', 'bottomToTop', 'leftToRight', 'rightToLeft', 'random'].includes(value)) {
      throw new Error('options.pageTransitionStyle is invalid');
    }
    return;
  }
  if (typeof value === 'string' && Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_TABLE_CONTENT_BYTES) {
    throw new Error(`options.${name} exceeds the 32 KB widget-data limit`);
  }
  const numeric = Number(value);
  if (!['string', 'number'].includes(typeof value) ||
      (typeof value === 'string' && !value.trim()) || !Number.isFinite(numeric)) {
    throw new Error(`options.${name} must be a finite number or numeric string`);
  }
  const limits = {
    cols: [1, 100], rows: [1, 100], colsSpacing: [-100, 100], rowsSpacing: [-100, 100],
    pageTransitionOffset: [0, 30], currentPage: [0, 99]
  };
  const range = limits[name];
  if (!range || numeric < range[0] || numeric > range[1] ||
      (['cols', 'rows', 'currentPage'].includes(name) && !Number.isInteger(numeric))) {
    throw new Error(`options.${name} is outside the supported Grid range`);
  }
}

function normalizeTableOption(currentValue, value, name, isGrid) {
  (isGrid ? validateGridOption : validateTableOption)(name, value);
  if (typeof currentValue === 'string') return String(value);
  if (typeof currentValue === 'boolean' && typeof value === 'boolean') return value;
  if (typeof currentValue === 'number' && typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  throw new Error(`options.${name} must preserve the ${isGrid ? 'grid' : 'table'} widget's current runtime type`);
}

async function updateTable(options, isGrid = false) {
  const widgetTitle = isGrid ? 'Grid' : 'Table';
  const widgetLabel = widgetTitle.toLowerCase();
  const id = requireOption(options, 'id');
  const specification = readJsonFile(requireOption(options, 'file'), `${widgetLabel} specification`);
  if (!isPlainObject(specification) || !Array.isArray(specification.rows)) {
    throw new Error(`${widgetLabel} specification must contain a rows array`);
  }
  if (specification.rows.length > MAX_TABLE_ROWS) {
    throw new Error(`${widgetLabel} specification supports at most ${MAX_TABLE_ROWS} rows`);
  }
  const table = requireWidgetTile(await executeCommand('element.get', {
    elementType: 'tile',
    id: id
  }), id);
  if (!table.widget || (isGrid ? table.widget.id !== GRID_WIDGET_ID :
    (table.widget.id !== TABLE_WIDGET_ID && table.widget.name !== 'Table'))) {
    throw new Error(`widget tile "${id}" is not a supported ${widgetTitle} widget`);
  }
  const subComposition = selectWidgetSubComposition(table, { field: 'composition' });
  const controls = Array.isArray(subComposition.controls) ? subComposition.controls : [];
  const controlsById = new Map();
  controls.forEach(function (control) {
    if (!control.id || controlsById.has(control.id)) {
      throw new Error(`the ${widgetLabel} template exposes duplicate or unnamed control nodes`);
    }
    controlsById.set(control.id, control);
  });
  specification.rows.forEach(function (row, rowIndex) {
    if (!isPlainObject(row)) {
      throw new Error(`rows[${rowIndex}] must be an object`);
    }
    const keys = Object.keys(row);
    keys.forEach(function (key) {
      if (!controlsById.has(key)) {
        throw new Error(`rows[${rowIndex}].${key} is not exposed by the ${widgetLabel} template`);
      }
      validateTableControlValue(controlsById.get(key), row[key], `rows[${rowIndex}].${key}`, widgetLabel);
    });
    controls.forEach(function (control) {
      if (!Object.prototype.hasOwnProperty.call(row, control.id)) {
        throw new Error(`rows[${rowIndex}] is missing template control "${control.id}"`);
      }
    });
  });

  const sameValue = (left, right) => {
    if (left === right) return true;
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object' ||
        Array.isArray(left) !== Array.isArray(right)) return false;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every(key =>
      Object.prototype.hasOwnProperty.call(right, key) && sameValue(left[key], right[key]));
  };
  const storedContent = table.data.tableContent;
  if (!Array.isArray(storedContent) && typeof storedContent !== 'string') {
    throw new Error(`${widgetTitle} tableContent must be an array or JSON string; no changes dispatched`);
  }
  const tableContent = Array.isArray(storedContent)
    ? specification.rows : JSON.stringify({ content: specification.rows }, null, 2);
  const serializedContent = typeof tableContent === 'string' ? tableContent : JSON.stringify(tableContent);
  if (Buffer.byteLength(serializedContent, 'utf8') > MAX_TABLE_CONTENT_BYTES) {
    throw new Error(`serialized ${widgetLabel} content exceeds the 32 KB widget-data limit`);
  }
  const requestedOptions = specification.options === undefined ? {} : specification.options;
  if (!isPlainObject(requestedOptions)) {
    throw new Error(`${widgetLabel} specification options must be an object`);
  }
  Object.keys(requestedOptions).forEach(function (name) {
    if (!(isGrid ? GRID_OPTION_FIELDS : TABLE_OPTION_FIELDS).includes(name)) {
      throw new Error(`unsupported ${widgetLabel} option "${name}"`);
    }
  });
  const updates = Object.keys(requestedOptions).map(function (name) {
    if (!Object.prototype.hasOwnProperty.call(table.data, name)) {
      throw new Error(`${widgetLabel} widget has no data field "${name}"`);
    }
    return {
      name: name,
      previous: table.data[name],
      value: normalizeTableOption(table.data[name], requestedOptions[name], name, isGrid)
    };
  });
  if (isGrid) {
    const cols = requestedOptions.cols === undefined ? table.data.cols : requestedOptions.cols;
    const rows = requestedOptions.rows === undefined ? table.data.rows : requestedOptions.rows;
    validateGridOption('cols', cols);
    validateGridOption('rows', rows);
    if (Number(cols) * Number(rows) > 1000) {
      throw new Error('Grid supports at most 1,000 visible cells (options.cols * options.rows)');
    }
    // A dimension swap may otherwise briefly exceed the renderer's allocation
    // cap. Apply shrinking dimensions before growing dimensions.
    updates.sort((a, b) => {
      const rank = update => ['cols', 'rows'].includes(update.name)
        ? (Number(update.value) <= Number(update.previous) ? -1 : 1) : 0;
      return rank(a) - rank(b);
    });
  }
  updates.push({
    name: 'tableContent',
    previous: table.data.tableContent,
    value: tableContent
  });

  const attempted = [];
  let verified;
  try {
    for (const update of updates) {
      attempted.push(update);
      await executeCommand('element.update', {
        elementType: 'tile',
        id: id,
        namespace: 'data',
        path: update.name,
        value: update.value
      });
    }
    verified = requireWidgetTile(await executeCommand('element.get', { elementType: 'tile', id: id }), id);
    if (!verified.widget || verified.widget.id !== table.widget.id ||
        verified.data.composition !== table.data.composition ||
        updates.some(update => !sameValue(verified.data[update.name], update.value))) {
      throw new Error(`${widgetTitle} readback did not match the requested update`);
    }
  } catch (err) {
    const isCancelled = error => error.code === 'OPERATION_CANCELLED' || error.code === 'SESSION_CANCELLED';
    if (isCancelled(err)) throw err;
    const restored = new Set();
    async function readRecoveryState() {
      const current = requireWidgetTile(await executeCommand('element.get', { elementType: 'tile', id: id }), id);
      if (!current.widget || current.widget.id !== table.widget.id ||
          current.widget.version !== table.widget.version ||
          current.data.composition !== table.data.composition ||
          JSON.stringify(current.widget.subCompositions) !== JSON.stringify(table.widget.subCompositions)) {
        throw new Error('Recovery target changed');
      }
      for (const update of updates) {
        const value = current.data[update.name];
        if (!sameValue(value, update.previous) &&
          (!attempted.includes(update) || restored.has(update.name) || !sameValue(value, update.value))) {
          throw new Error('Recovery values conflict');
        }
      }
      return current;
    }
    try {
      let current = await readRecoveryState();
      if (updates.every(update => sameValue(current.data[update.name], update.previous))) {
        err.message += ` (${widgetTitle} readback confirms no change; no compensation needed)`;
      }
      for (const update of attempted.slice().reverse()) {
        if (!sameValue(current.data[update.name], update.previous)) {
          await executeCommand('element.update', {
            elementType: 'tile',
            id: id,
            namespace: 'data',
            path: update.name,
            value: update.previous
          });
          restored.add(update.name);
          current = await readRecoveryState();
        } else {
          restored.add(update.name);
        }
      }
    } catch (recoveryError) {
      if (isCancelled(recoveryError)) throw recoveryError;
      const uncertain = new Error(
        `TABLE_UPDATE_RECOVERY_UNCERTAIN: ${widgetTitle} update failed and recovery is incomplete or unverified; inspect before retrying. Original failure: ${err.message}`
      );
      uncertain.code = 'TABLE_UPDATE_RECOVERY_UNCERTAIN';
      uncertain.cause = err;
      throw uncertain;
    }
    throw err;
  }

  return {
    [isGrid ? 'grid' : 'table']: { id: id, name: verified.element.name, widget: verified.widget.id },
    widgetSubComposition: subComposition,
    rows: specification.rows.length,
    options: Object.keys(requestedOptions).reduce(function (result, name) {
      result[name] = verified.data[name];
      return result;
    }, {}),
    tableContent: verified.data.tableContent
  };
}

function parseCaptureSeconds(options, name, defaultValue, allowZero) {
  if (options[name] === undefined) return defaultValue;
  const value = Number(options[name]);
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new Error(`--${name} must be ${allowZero ? 'a non-negative' : 'a positive'} number of seconds`);
  }
  return value;
}

function normalizeCaptureTarget(options) {
  const target = options.target || 'root';
  if (target !== 'root' && target !== 'active') {
    throw createCaptureError('INVALID_CAPTURE_TARGET', '--target must be "root" or "active"');
  }
  return target;
}

function validateCaptureServer(serverValue) {
  if (serverValue === undefined) return null;
  const requestedServer = normalizeServerUrl(serverValue);
  const pairedServer = normalizeServerUrl(readCredentials().server);
  if (requestedServer !== pairedServer) {
    throw createCaptureError(
      'CAPTURE_SERVER_MISMATCH',
      '--server must match the paired Composer server. Pair with the requested server before capturing.'
    );
  }
  return requestedServer;
}

function normalizeCaptureOptions(options) {
  assertAllowedOptions(
    options,
    ['target', 'composition-id', 'output', 'measurements', 'timeout', 'settle', 'wait-mode', 'timeline', 'at', 'server', 'compact'],
    'capture'
  );
  validateCaptureServer(options.server);
  const compositionId = options['composition-id'] === undefined
    ? null
    : String(options['composition-id']).trim();
  if (options['composition-id'] !== undefined && !compositionId) {
    throw createCaptureError('INVALID_CAPTURE_TARGET', '--composition-id must not be empty');
  }
  if (compositionId && options.target !== undefined && options.target !== 'active') {
    throw createCaptureError(
      'INVALID_CAPTURE_TARGET',
      '--composition-id captures an ordinary composition and requires --target active when target is explicit'
    );
  }
  const target = compositionId ? 'active' : normalizeCaptureTarget(options);
  const waitMode = options['wait-mode'] || 'smart';
  if (waitMode !== 'smart' && waitMode !== 'timed') {
    throw createCaptureError(
      'INVALID_CAPTURE_WAIT_MODE',
      '--wait-mode must be "smart" or "timed"'
    );
  }
  const hasTimeline = options.timeline !== undefined;
  const hasAt = options.at !== undefined;
  if (hasTimeline !== hasAt) {
    throw createCaptureError(
      'INVALID_CAPTURE_TIMELINE',
      '--timeline and --at must be provided together'
    );
  }
  let timeline = null;
  let atSeconds = null;
  if (hasTimeline) {
    timeline = options.timeline;
    if (timeline !== 'In' && timeline !== 'Out') {
      throw createCaptureError('INVALID_CAPTURE_TIMELINE', '--timeline must be "In" or "Out"');
    }
    atSeconds = parseCaptureSeconds(options, 'at', null, true);
    if (waitMode !== 'smart') {
      throw createCaptureError(
        'INVALID_CAPTURE_TIMELINE',
        'Timeline-position capture requires --wait-mode smart'
      );
    }
  }
  const timeoutSeconds = parseCaptureSeconds(options, 'timeout', 30, false);
  const settleSeconds = parseCaptureSeconds(
    options,
    'settle',
    waitMode === 'timed' ? 2 : 0,
    true
  );
  if (settleSeconds >= timeoutSeconds) {
    throw createCaptureError(
      'INVALID_CAPTURE_TIMING',
      '--settle is measured in seconds and must be less than --timeout; for 1500 milliseconds, pass --settle 1.5'
    );
  }
  return {
    target: target,
    compositionId: compositionId,
    outputPath: requireOption(options, 'output'),
    measurementsPath: options.measurements || null,
    waitMode: waitMode,
    timeoutMs: timeoutSeconds * 1000,
    settleMs: settleSeconds * 1000,
    timeline: timeline,
    atSeconds: atSeconds
  };
}

function getActiveCaptureTarget(inspection) {
  const activeComposition = inspection && inspection.activeComposition;
  const stack = activeComposition && activeComposition.stack;
  if (!Array.isArray(stack) || stack.length <= 1) {
    return { compositionId: null, widgetTileId: null };
  }
  const activeEntry = stack[stack.length - 1];
  return {
    compositionId: activeComposition.id || (activeEntry && activeEntry.id) || null,
    widgetTileId: activeComposition.widgetSubComposition &&
      activeComposition.widgetSubComposition.widgetTileId || null
  };
}

function validateCaptureFile(result) {
  if (!result || !result.output || !fs.existsSync(result.output)) {
    throw createCaptureError('CAPTURE_FAILED', 'Capture did not create the requested PNG');
  }
  const sizeBytes = fs.statSync(result.output).size;
  if (sizeBytes <= 0) {
    throw createCaptureError('CAPTURE_FAILED', 'Capture created an empty PNG');
  }
  if (sizeBytes > MAX_CAPTURE_BYTES) {
    throw createCaptureError('CAPTURE_TOO_LARGE', 'Composer preview capture exceeds the 8 MB limit');
  }
  result.sizeBytes = sizeBytes;
  return result;
}

async function captureStandalone(options) {
  const inspection = await executeCommand('composition.inspect', { capture: true });
  const preview = inspection && inspection.preview;
  if (!preview || !preview.compositionToken) {
    throw createCaptureError(
      'COMPOSITION_TOKEN_REQUIRED',
      'Standalone capture requires a Composition API token. Generate one in Composer and inspect again.'
    );
  }
  const activeTarget = options.compositionId
    ? { compositionId: options.compositionId, widgetTileId: null }
    : options.target === 'active'
    ? getActiveCaptureTarget(inspection)
    : { compositionId: null, widgetTileId: null };
  if (activeTarget.widgetTileId) {
    const widgetScope = inspection.activeComposition &&
      inspection.activeComposition.widgetSubComposition;
    const currentToken = widgetScope && widgetScope.sessionToken;
    if (!activeTemplateSessionToken) {
      const error = new Error(
        'The active widget-owned template requires --template-session from its current inspect or open-widget-subcomposition result'
      );
      error.code = 'WIDGET_TEMPLATE_SESSION_REQUIRED';
      throw error;
    }
    if (!currentToken || activeTemplateSessionToken !== currentToken) {
      const error = new Error(
        'The supplied widget-template session does not match the active edit session; inspect the template and use its current token'
      );
      error.code = 'WIDGET_TEMPLATE_SESSION_STALE';
      throw error;
    }
  }
  const result = await getCaptureModule().captureCompositionPreview({
    endpoint: preview.endpoint,
    width: preview.width,
    height: preview.height,
    compositionToken: preview.compositionToken,
    outputPath: options.outputPath,
    measurementsPath: options.measurementsPath,
    target: options.target,
    compositionId: activeTarget.compositionId,
    widgetTileId: activeTarget.widgetTileId,
    waitMode: options.waitMode,
    timeoutMs: options.timeoutMs,
    settleMs: options.settleMs,
    timeline: options.timeline,
    atSeconds: options.atSeconds
  });
  result.editorResolution = { width: preview.width, height: preview.height };
  return validateCaptureFile(result);
}

function createActiveCompositionStructure(inspection) {
  const tiles = Array.isArray(inspection.tiles) ? inspection.tiles : [];
  const tileById = {};
  tiles.forEach(function (tile) {
    tileById[tile.id] = tile;
  });

  return {
    compName: inspection.activeComposition.name,
    compId: inspection.activeComposition.id,
    children: [],
    groups: (inspection.groups || []).map(function (group) {
      return {
        id: group.id,
        name: group.name,
        tiles: (group.itemIds || []).map(function (tileId) {
          return tileById[tileId];
        }).filter(Boolean)
      };
    }),
    tiles: tiles
  };
}

function createScriptControlContext(inspection, controlInspection) {
  const controlNode = controlInspection && controlInspection.controlNode;
  const fields = controlNode && Array.isArray(controlNode.fields)
    ? controlNode.fields
    : [];
  const links = controlInspection && Array.isArray(controlInspection.links)
    ? controlInspection.links
    : [];

  return {
    compName: inspection.activeComposition.name,
    compId: inspection.activeComposition.id,
    models: fields.map(function (field) {
      return {
        keyId: field.keyId,
        id: field.id,
        title: field.title || field.id,
        type: field.type,
        index: field.index,
        value: field.value
      };
    }),
    datalinks: links.map(function (link) {
      return {
        tileId: link.tileId,
        property: link.propertyId,
        link: {
          location: link.location,
          locationId: link.locationId,
          index: link.index,
          key: link.key,
          keyId: link.keyId,
          type: link.type
        }
      };
    }),
    noderefs: controlInspection && Array.isArray(controlInspection.nodeRefs)
      ? controlInspection.nodeRefs
      : []
  };
}

async function buildScriptHandoff(credentials, inspection) {
  const preview = inspection && inspection.preview;
  const inspectedActiveComposition = inspection && inspection.activeComposition;
  const activeComposition = inspectedActiveComposition && {
    ...inspectedActiveComposition,
    widgetSubComposition: inspectedActiveComposition.widgetSubComposition && {
      ...inspectedActiveComposition.widgetSubComposition
    }
  };
  if (activeComposition && activeComposition.widgetSubComposition) {
    delete activeComposition.widgetSubComposition.sessionToken;
  }
  if (!preview || !preview.endpoint || !preview.compositionToken) {
    throw new Error('The open composition does not expose a Composition API token');
  }
  if (!activeComposition || !activeComposition.id) {
    throw new Error('Composer did not report an active composition for script handoff');
  }

  const controlInspection = inspection.scriptControlContext ||
    await executeCommand('controlNode.inspect', {});
  const isRoot = Array.isArray(activeComposition.stack) &&
    activeComposition.stack.length === 1;
  const scriptNames = {
    global: 'Global Script',
    overlay: 'Overlay Script'
  };
  scriptNames[activeComposition.id] = activeComposition.name ||
    (isRoot ? 'Root Composition' : activeComposition.id);

  return {
    version: 1,
    kind: 'composer-agent-script-handoff',
    composerAgentVersion: SKILL_VERSION,
    host: preview.endpoint,
    compositionToken: preview.compositionToken,
    composerAgentAccessToken: credentials.accessToken,
    scene: inspection.scene,
    preview: {
      width: preview.width,
      height: preview.height
    },
    activeComposition: activeComposition,
    mainComposition: isRoot ? activeComposition.id : null,
    suggestedScript: {
      id: activeComposition.id,
      name: scriptNames[activeComposition.id],
      type: isRoot ? 'root' : 'composition'
    },
    scriptIds: [activeComposition.id],
    scriptNames: scriptNames,
    compositionStructure: createActiveCompositionStructure(inspection),
    widgetReferences: createWidgetReferences(inspection.tiles),
    widgetNodes: inspection.scriptWidgetContext || null,
    modelsDataLinksNodeRefs: [
      createScriptControlContext(inspection, controlInspection)
    ],
    scope: 'active-composition'
  };
}

async function getScriptHandoffOutput(options) {
  if (options.pipe === true && process.stdout.isTTY) {
    const error = new Error('Credential-bearing handoffs require a direct pipe to the bundled helper or verifier; omit --pipe for a safe preview');
    error.code = 'SCRIPT_HANDOFF_PIPE_REQUIRED';
    throw error;
  }
  const handoff = await createScriptHandoff(options);
  if (options.pipe === true) return handoff;
  return {
    version: 1,
    kind: 'composer-agent-script-handoff-preview',
    composerAgentVersion: SKILL_VERSION,
    redacted: true,
    credentialsAvailable: {
      composition: Boolean(handoff.compositionToken),
      agent: Boolean(handoff.composerAgentAccessToken)
    },
    usage: 'Use script-handoff --pipe only when stdout goes directly to compositionScriptCli.js or verifyComposition.mjs; never print, filter or save that stream'
  };
}

async function createScriptHandoff(options) {
  const credentials = readCredentials();
  const requestedOption = options && options['composition-id'];
  if (!requestedOption) {
    return buildScriptHandoff(credentials, await executeCommand('composition.inspect', {
      scriptHandoff: true
    }));
  }

  const originalInspection = await executeCommand('composition.inspect', {});
  const originalComposition = originalInspection && originalInspection.activeComposition;
  if (!originalComposition || !originalComposition.id) {
    throw new Error('Composer did not report an active composition before scoped script handoff');
  }
  if (originalComposition.widgetSubComposition) {
    throw new Error(
      '--composition-id cannot preserve a widget-owned editing scope because its composition ID ' +
      'may change on exit; return to root or an ordinary sub-composition first'
    );
  }
  const originalStack = Array.isArray(originalComposition.stack)
    ? originalComposition.stack
    : [];
  const rootRequested = requestedOption === 'root';
  let requestedCompositionId = rootRequested && originalStack.length === 1
    ? originalComposition.id
    : requestedOption;
  const shouldRestore = rootRequested
    ? originalStack.length !== 1
    : requestedCompositionId !== originalComposition.id;
  let handoff;
  let handoffError = null;
  let restoreError = null;

  try {
    if (shouldRestore) {
      const navigation = await executeCommand('composition.open', {
        id: rootRequested ? 'root' : requestedCompositionId,
        ordinaryOnly: !rootRequested
      });
      const openedId = navigation && navigation.activeComposition && navigation.activeComposition.id;
      if (rootRequested && openedId) {
        requestedCompositionId = openedId;
      } else if (openedId !== requestedCompositionId) {
        throw new Error(`Composer did not open ordinary composition "${requestedCompositionId}"`);
      }
      if (!openedId) throw new Error('Composer did not report the opened composition');
    }

    const inspection = await executeCommand('composition.inspect', {
      scriptHandoff: true
    });
    const activeComposition = inspection && inspection.activeComposition;
    if (!activeComposition || activeComposition.id !== requestedCompositionId) {
      throw new Error(`Composer did not inspect requested composition "${requestedCompositionId}"`);
    }
    if (activeComposition.widgetSubComposition) {
      throw new Error(
        '--composition-id supports root and ordinary sub-compositions only; ' +
        'use open-widget-subcomposition for widget-owned templates'
      );
    }
    handoff = await buildScriptHandoff(credentials, inspection);
  } catch (error) {
    handoffError = error;
  }

  if (shouldRestore) {
    try {
      const restoreTarget = originalStack.length === 1 ? 'root' : originalComposition.id;
      const restoration = await executeCommand('composition.open', { id: restoreTarget });
      const restoredId = restoration && restoration.activeComposition && restoration.activeComposition.id;
      if (restoredId !== originalComposition.id) {
        throw new Error(`Composer did not restore composition "${originalComposition.id}"`);
      }
    } catch (error) {
      restoreError = error;
    }
  }

  if (handoffError) {
    if (restoreError) {
      handoffError.message += `; navigation restoration also failed: ${restoreError.message}`;
    }
    throw handoffError;
  }
  if (restoreError) throw restoreError;
  return handoff;
}

let invokedCommand;

async function run() {
  const parsed = parseArguments(process.argv.slice(2));
  invokedCommand = parsed.command;
  if (!KNOWN_COMMANDS.has(parsed.command)) throw unknownCommandError(parsed.command);
  if (parsed.command === 'doctor') {
    const report = await runDoctor(parsed.options);
    console.log(JSON.stringify(report, null, parsed.options.compact ? 0 : 2));
    if (report.status !== 'passed') process.exitCode = 1;
    return;
  }
  if (parsed.command === 'ai-graphics') {
    const report = await getAIGraphicsModule().run(parsed.options.action, parsed.options);
    console.log(JSON.stringify(report, null, parsed.options.compact ? 0 : 2));
    if (report.valid === false) process.exitCode = 1;
    return;
  }
  if (parsed.command === 'find-elements') {
    const widgetId = Number(requireOption(parsed.options, 'widget-id'));
    if (!Number.isInteger(widgetId) || widgetId <= 0) {
      throw new Error('widget-id must be a positive integer');
    }
    parsed.options['widget-id'] = widgetId;
  }
  if (parsed.command !== 'capture-worker') configureCredentialScope(parsed.options);
  activeTemplateSessionToken = parsed.options['template-session'] || null;
  let result;
  if (parsed.command === 'check-connection') {
    assertAllowedOptions(parsed.options, ['timeout', 'compact'], 'check-connection');
    assertNoRecentPairingMismatch();
  }
  if (!['pair', 'pair-intent', 'capture', 'capture-worker'].includes(parsed.command)) {
    validatePairedServerOption(parsed.options);
  }

  switch (parsed.command) {
    case 'pair':
      await pair(parsed.options);
      return;
    case 'pair-intent':
      await pairIntent(parsed.options);
      return;
    case 'status':
      assertAllowedOptions(parsed.options, ['message', 'state'], 'status');
      const activityState = parsed.options.state || 'working';
      if (!['working', 'waiting-for-user'].includes(activityState)) {
        throw new Error('--state must be working or waiting-for-user');
      }
      result = await sendSessionMessage({
        type: 'activity',
        message: requireOption(parsed.options, 'message'),
        activityState: activityState
      }, 'activity_sent');
      break;
    case 'start-work':
      result = await sendSessionMessage({ type: 'work_start' }, 'work_started');
      break;
    case 'begin-work':
      result = await beginWork(parsed.options);
      break;
    case 'wait-ready':
      assertAllowedOptions(parsed.options, ['timeout', 'compact'], 'wait-ready');
      result = await waitForComposerReady(parsed.options);
      break;
    case 'check-connection':
      assertAllowedOptions(parsed.options, ['timeout', 'compact'], 'check-connection');
      result = await waitForComposerReady(parsed.options, false);
      break;
    case 'finish-work':
      result = await finishWork(parsed.options);
      break;
    case 'complete':
      result = await sendSessionMessage({ type: 'session_complete' }, 'session_completed');
      removeRevokedCredentials();
      break;
    case 'inspect': {
      const params = {};
      if (parsed.options.selection) params.selection = true;
      if (parsed.options.summary) params.summary = true;
      result = await executeCommand('composition.inspect', params);
      // Fallback filtering keeps the flags working against servers that return
      // the full inspection payload instead of honoring the params.
      if (parsed.options.selection && result && result.selection) {
        result = { selection: result.selection };
      } else if (parsed.options.summary && result && result.summary) {
        result = { summary: result.summary };
      } else if (
        result && result.activeComposition &&
        result.activeComposition.widgetSubComposition
      ) {
        const owner = result.activeComposition.widgetSubComposition;
        const sessionToken = owner.sessionToken;
        result.activeComposition.identityScope = createWidgetTemplateIdentityScope({
          compositionId: result.activeComposition.id,
          widgetTileId: owner.widgetTileId,
          widgetFieldId: owner.widgetFieldId,
          sessionToken: sessionToken
        });
        delete owner.sessionToken;
      }
      break;
    }
    case 'find-elements': {
      result = await executeCommand('composition.elements.find', {
        widgetId: parsed.options['widget-id']
      });
      break;
    }
    case 'composition-tree':
      assertAllowedOptions(parsed.options, ['compact'], 'composition-tree');
      result = await executeCommand('composition.tree.inspect', {});
      break;
    case 'resolve-references': {
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'resolve-references');
      const specification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'Composer references file'
      );
      const references = Array.isArray(specification)
        ? specification
        : specification.references;
      if (!Array.isArray(references)) {
        throw new Error('Composer references file must be an array or contain a references array');
      }
      result = await executeCommand('reference.resolveMany', {
        references: references.map(decodeComposerReference)
      });
      break;
    }
    case 'script-handoff':
      assertAllowedOptions(parsed.options, ['composition-id', 'compact', 'pipe'], 'script-handoff');
      result = await getScriptHandoffOutput(parsed.options);
      break;
    case 'control-composition': {
      const state = requireOption(parsed.options, 'state').toLowerCase();
      if (state !== 'in' && state !== 'out') {
        throw new Error('--state must be "in" or "out"');
      }
      result = await executeCommand('composition.control', {
        id: requireOption(parsed.options, 'id'),
        state: state === 'in' ? 'In' : 'Out'
      });
      break;
    }
    case 'timeline-link':
      assertAllowedOptions(parsed.options, ['id', 'compact'], 'timeline-link');
      result = await executeCommand('composition.timelineLink.inspect', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'set-timeline-link':
      assertAllowedOptions(parsed.options, ['id', 'linked', 'compact'], 'set-timeline-link');
      result = await executeCommand('composition.timelineLink.set', {
        id: requireOption(parsed.options, 'id'),
        linked: requireBooleanOption(parsed.options, 'linked')
      });
      break;
    case 'logic-layers': {
      assertAllowedOptions(parsed.options, ['id', 'compact'], 'logic-layers');
      const params = {};
      if (parsed.options.id) params.id = parsed.options.id;
      result = await executeCommand('composition.logicLayers.inspect', params);
      break;
    }
    case 'set-logic-layer': {
      assertAllowedOptions(parsed.options, ['id', 'name', 'delay', 'time', 'remove', 'compact'], 'set-logic-layer');
      const params = { id: requireOption(parsed.options, 'id') };
      if (parsed.options.remove) params.remove = true;
      if (parsed.options.name !== undefined) params.name = parsed.options.name;
      if (parsed.options.delay !== undefined) params.delay = parsed.options.delay.toLowerCase();
      if (parsed.options.time !== undefined) params.time = Number(parsed.options.time);
      result = await executeCommand('composition.logicLayer.set', params);
      break;
    }
    case 'rename-logic-layer':
      assertAllowedOptions(parsed.options, ['name', 'new-name', 'compact'], 'rename-logic-layer');
      result = await executeCommand('composition.logicLayer.rename', {
        name: requireOption(parsed.options, 'name'),
        newName: requireOption(parsed.options, 'new-name')
      });
      break;
    case 'create-composition': {
      const params = { name: requireOption(parsed.options, 'name') };
      if (parsed.options['group-id']) {
        params.groupId = parsed.options['group-id'];
      }
      result = await executeCommand('composition.create', params);
      break;
    }
    case 'orchestrate':
      result = await executeCommand(
        'composition.orchestrate',
        readJsonFile(requireOption(parsed.options, 'file'), 'composition orchestration manifest')
      );
      break;
    case 'create-revision':
      result = await executeCommand('composition.revision.create', {
        description: requireOption(parsed.options, 'description')
      });
      break;
    case 'list-revisions':
      result = await executeCommand('composition.revision.list', {});
      break;
    case 'list-app-templates':
      assertAllowedOptions(parsed.options, [], parsed.command);
      result = await executeCommand('appTemplates.list', {});
      break;
    case 'app-template-integration-resources': {
      assertAllowedOptions(parsed.options, ['id', 'status'], parsed.command);
      const params = {};
      if (parsed.options.id !== undefined) {
        const id = parsed.options.id;
        if (!/^[1-9][0-9]*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('--id must be a positive integer');
        params.id = Number(id);
      }
      if (parsed.options.status !== undefined) {
        if (!['published', 'development'].includes(parsed.options.status)) throw new Error('--status must be published or development');
        params.status = parsed.options.status;
      }
      result = await executeCommand('appTemplates.integrationResources.inspect', params);
      break;
    }
    case 'app-template-match':
      assertAllowedOptions(parsed.options, [], parsed.command);
      result = await executeCommand('composition.appTemplateMatch.inspect', {});
      break;
    case 'set-app-template-match': {
      assertAllowedOptions(parsed.options, ['id', 'clear'], parsed.command);
      const options = parsed.options;
      if (options.clear !== undefined) {
        if (options.clear !== true || options.id !== undefined) throw new Error('Use --clear alone or --id <positive integer>');
        result = await executeCommand('composition.appTemplateMatch.set', { clear: true });
      } else {
        const id = requireOption(options, 'id');
        if (!/^[1-9][0-9]*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('--id must be a positive integer');
        result = await executeCommand('composition.appTemplateMatch.set', { id: Number(id) });
      }
      break;
    }
    case 'read-revision':
      result = await executeCommand('composition.revision.read', {
        revisionId: requireOption(parsed.options, 'revision-id')
      });
      break;
    case 'compare-revision':
      result = await executeCommand('composition.revision.compare', {
        revisionId: requireOption(parsed.options, 'revision-id')
      });
      break;
    case 'restore-revision':
      result = await executeCommand('composition.revision.restore', {
        revisionId: requireOption(parsed.options, 'revision-id')
      });
      break;
    case 'delete-revision':
      result = await executeCommand('composition.revision.delete', {
        revisionId: requireOption(parsed.options, 'revision-id')
      });
      break;
    case 'delete-composition':
      result = await executeCommand('composition.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'open-composition':
      result = await executeCommand('composition.open', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'widget-subcompositions':
      result = await inspectWidgetSubCompositions(parsed.options);
      break;
    case 'open-widget-subcomposition':
      result = await openWidgetSubComposition(parsed.options);
      break;
    case 'update-table':
      result = await updateTable(parsed.options);
      break;
    case 'update-grid':
      result = await updateTable(parsed.options, true);
      break;
    case 'timeline2':
      result = await executeCommand('composition.timeline2.set', {
        active: requireBooleanOption(parsed.options, 'active')
      });
      break;
    case 'display-variants':
      assertAllowedOptions(parsed.options, ['compact'], 'display-variants');
      result = await executeCommand('displayVariants.inspect', {});
      break;
    case 'configure-display-variants':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'configure-display-variants');
      result = await executeCommand(
        'displayVariants.configure',
        readJsonFile(requireOption(parsed.options, 'file'), 'display variant configuration')
      );
      break;
    case 'activate-display-variant':
      assertAllowedOptions(parsed.options, ['name', 'compact'], 'activate-display-variant');
      result = await executeCommand('displayVariants.activate', {
        name: requireOption(parsed.options, 'name')
      });
      break;
    case 'set-display-variant-relevance':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-display-variant-relevance');
      result = await executeCommand(
        'displayVariants.relevance.setMany',
        readJsonFile(requireOption(parsed.options, 'file'), 'display variant relevance manifest')
      );
      break;
    case 'control-nodes':
      result = await executeCommand('controlNode.inspect');
      break;
    case 'metric-fonts': {
      assertAllowedOptions(parsed.options, ['source', 'family', 'compact'], 'metric-fonts');
      result = await executeCommand('metricFonts.list', {
        source: parsed.options.source,
        family: parsed.options.family
      });
      break;
    }
    case 'set-metric-font': {
      assertAllowedOptions(parsed.options, [
        'id', 'property', 'family', 'weight', 'style', 'subset', 'font-source', 'compact'
      ], 'set-metric-font');
      result = await executeCommand('widget.metricFont.set', {
        id: requireOption(parsed.options, 'id'),
        property: parsed.options.property,
        family: parsed.options.family,
        weight: parsed.options.weight,
        style: parsed.options.style,
        subset: parsed.options.subset,
        source: parsed.options['font-source']
      });
      break;
    }
    case 'upgrade-metric-widgets':
      assertAllowedOptions(parsed.options, ['ids', 'compact'], 'upgrade-metric-widgets');
      result = await executeCommand('widget.metric.upgradeMany', {
        ids: parseIds(requireOption(parsed.options, 'ids'))
      });
      break;
    case 'widget-nodes': {
      assertAllowedOptions(parsed.options, ['source-composition', 'compact'], 'widget-nodes');
      result = await executeCommand('widgetNode.inspect', {
        sourceCompositionId: parsed.options['source-composition']
      });
      addWidgetTemplateIdentityScope(result, {
        compositionId: result && result.compositionId,
        sessionToken: activeTemplateSessionToken
      });
      break;
    }
    case 'link-widget-nodes':
    case 'unlink-widget-nodes': {
      assertAllowedOptions(parsed.options, ['file', 'compact'], parsed.command);
      const manifest = readJsonFile(requireOption(parsed.options, 'file'), 'Widget Node link specification');
      result = await executeCommand(parsed.command === 'link-widget-nodes' ? 'widgetNode.linkMany' : 'widgetNode.unlinkMany', {
        links: Array.isArray(manifest) ? manifest : manifest && manifest.links
      });
      addWidgetTemplateIdentityScope(result, {
        compositionId: result && result.compositionId,
        sessionToken: activeTemplateSessionToken
      });
      break;
    }
    case 'set-control-value': {
      assertAllowedOptions(parsed.options, ['id', 'value-file', 'compact'], 'set-control-value');
      result = await executeCommand('controlNode.value.set', {
        id: requireOption(parsed.options, 'id'),
        value: readJsonOptionFile(
          parsed.options,
          'value-file',
          'control-node value file',
          true
        )
      });
      break;
    }
    case 'press-control': {
      assertAllowedOptions(parsed.options, ['id', 'compact'], 'press-control');
      result = await executeCommand('controlNode.button.press', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    }
    case 'timer-action':
    case 'control-time': {
      assertAllowedOptions(parsed.options, ['id', 'action', 'compact'], parsed.command);
      const action = requireOption(parsed.options, 'action');
      if (!['start', 'play', 'pause', 'reset'].includes(action)) {
        throw new Error('--action must be "start", "play", "pause", or "reset"');
      }
      result = await executeCommand('controlNode.timeControl.control', {
        id: requireOption(parsed.options, 'id'),
        action: action
      });
      break;
    }
    case 'set-control-font': {
      assertAllowedOptions(parsed.options, [
        'id', 'family', 'weight', 'style', 'subset', 'font-source', 'compact'
      ], 'set-control-font');
      result = await executeCommand('controlNode.metricFont.set', {
        id: requireOption(parsed.options, 'id'),
        family: parsed.options.family,
        weight: parsed.options.weight,
        style: parsed.options.style,
        subset: parsed.options.subset,
        source: parsed.options['font-source']
      });
      break;
    }
    case 'create-table-control': {
      assertAllowedOptions(parsed.options, ['file', 'source-composition', 'compact'], 'create-table-control');
      const tableSpecification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'Table Control Node specification'
      );
      result = await executeCommand(
        'controlNode.table.create',
        {
          ...tableSpecification,
          sourceCompositionId: parsed.options['source-composition']
        }
      );
      break;
    }
    case 'set-table-control': {
      assertAllowedOptions(parsed.options, ['id', 'file', 'compact'], 'set-table-control');
      const tableRows = readJsonFile(requireOption(parsed.options, 'file'), 'Table Control Node rows');
      result = await executeCommand('controlNode.table.set', {
        id: requireOption(parsed.options, 'id'),
        rows: Array.isArray(tableRows) ? tableRows : tableRows && tableRows.rows
      });
      break;
    }
    case 'update-table-control': {
      assertAllowedOptions(parsed.options, ['id', 'file', 'preview', 'compact'], 'update-table-control');
      const tableUpdate = readJsonFile(
        requireOption(parsed.options, 'file'),
        'Table Control Node update specification'
      );
      if (!tableUpdate || Array.isArray(tableUpdate) || typeof tableUpdate !== 'object') {
        throw new Error('Table Control Node update specification must be a JSON object');
      }
      result = await executeCommand('controlNode.table.update', {
        ...tableUpdate,
        id: requireOption(parsed.options, 'id'),
        preview: parsed.options.preview === true
      });
      break;
    }
    case 'link-table-control': {
      assertAllowedOptions(parsed.options, [
        'id', 'tile-id', 'property', 'source-composition', 'replace', 'compact'
      ], 'link-table-control');
      result = await executeCommand('controlNode.table.link', {
        id: requireOption(parsed.options, 'id'),
        tileId: requireOption(parsed.options, 'tile-id'),
        propertyId: requireOption(parsed.options, 'property'),
        sourceCompositionId: parsed.options['source-composition'],
        replace: parsed.options.replace === true
      });
      break;
    }
    case 'unlink-table-control': {
      assertAllowedOptions(parsed.options, ['tile-id', 'property', 'compact'], 'unlink-table-control');
      result = await executeCommand('controlNode.table.unlink', {
        tileId: requireOption(parsed.options, 'tile-id'),
        propertyId: requireOption(parsed.options, 'property')
      });
      break;
    }
    case 'update-control': {
      const patch = readJsonFile(
        requireOption(parsed.options, 'file'),
        'control node metadata patch'
      );
      result = await executeCommand('controlNode.metadata.update', {
        id: requireOption(parsed.options, 'id'),
        patch: patch
      });
      break;
    }
    case 'create-control-container': {
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'create-control-container');
      result = await executeCommand('controlNode.container.create', readJsonFile(
        requireOption(parsed.options, 'file'), 'Control Node container specification'
      ));
      break;
    }
    case 'configure-control-container': {
      assertAllowedOptions(parsed.options, ['id', 'file', 'compact'], 'configure-control-container');
      result = await executeCommand('controlNode.container.configure', {
        ...readJsonFile(requireOption(parsed.options, 'file'), 'Control Node container configuration'),
        id: requireOption(parsed.options, 'id')
      });
      break;
    }
    case 'delete-control-container': {
      assertAllowedOptions(parsed.options, ['id', 'compact'], 'delete-control-container');
      result = await executeCommand('controlNode.container.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    }
    case 'create-control': {
      assertAllowedOptions(parsed.options, [
        'name', 'node-type', 'target', 'tile-id', 'element-type',
        'element-id', 'property', 'value-file', 'info-mode', 'replace',
        'reuse-existing', 'index', 'append',
        'source-composition', 'options-file', 'options-url', 'use-reload',
        'image-options-csv-file', 'image-options-csv', 'format',
        'family', 'weight', 'style', 'subset', 'font-source', 'compact'
      ], 'create-control');
      const type = requireOption(parsed.options, 'node-type');
      if (![
        'text', 'textarea', 'number', 'normalizednumber', 'counter', 'color',
        'image', 'checkbox', 'audio', 'video', 'data', 'jsonfile', 'json', 'datetime', 'location', 'selection', 'button', 'timecontrol', 'timer', 'infotext', 'metricfont'
      ].includes(type)) {
        throw new Error(
          '--node-type must be "text", "textarea", "number", "normalizednumber", ' +
          '"counter", "color", "image", "checkbox", "audio", "video", "data", ' +
          '"jsonfile", "json", "datetime", "location", "selection", "button", "timecontrol", "timer", "infotext", or "metricfont"'
        );
      }
      const target = parsed.options.target || (parsed.options['element-id'] ? 'layout' : 'data');
      if (!['data', 'layout', 'standalone'].includes(target)) {
        throw new Error('--target must be "data", "layout", or "standalone"');
      }
      if (target === 'standalone' && !['button', 'timecontrol', 'metricfont', 'timer'].includes(type)) {
        requireOption(parsed.options, 'value-file');
      }
      const metricFontOptions = ['family', 'weight', 'style', 'subset', 'font-source'];
      const hasMetricFontOptions = metricFontOptions.some(function (option) {
        return parsed.options[option] !== undefined;
      });
      if (type === 'metricfont') {
        if (parsed.options['value-file'] !== undefined) {
          throw new Error('Metric Font creation accepts font flags instead of --value-file');
        }
        if (target !== 'standalone' && hasMetricFontOptions) {
          throw new Error('Linked Metric Font controls copy the target value and do not accept font flags');
        }
      } else if (hasMetricFontOptions) {
        throw new Error('Metric Font flags require a Metric Font control');
      }
      if (type === 'button' && target !== 'standalone') {
        throw new Error('Button requires --target standalone');
      }
      if (type === 'button' && parsed.options['value-file'] !== undefined) {
        throw new Error('Button creation does not accept --value-file');
      }
      if (type === 'timecontrol' && target === 'standalone' && parsed.options['value-file'] !== undefined) {
        throw new Error('Time Control creation does not accept --value-file');
      }
      if (type === 'timer' && parsed.options['value-file'] !== undefined) {
        throw new Error('Timer creation does not accept --value-file; use set-control-value commands after creation');
      }
      if (type === 'infotext') {
        if (target !== 'standalone') throw new Error('Info Text requires --target standalone');
        requireOption(parsed.options, 'info-mode');
      } else if (parsed.options['info-mode'] !== undefined) {
        throw new Error('--info-mode is only supported for Info Text controls');
      }
      if (type === 'selection') {
        const hasOptionsFile = parsed.options['options-file'] !== undefined;
        const hasOptionsUrl = parsed.options['options-url'] !== undefined;
        const hasImageCsvFile = parsed.options['image-options-csv-file'] !== undefined;
        const hasImageCsv = parsed.options['image-options-csv'] !== undefined;
        const optionSourceCount = [hasOptionsFile, hasOptionsUrl, hasImageCsvFile, hasImageCsv]
          .filter(Boolean).length;
        if (target === 'standalone' && optionSourceCount !== 1) {
          throw new Error(
            'standalone Selection requires exactly one option source: --options-file, --options-url, ' +
            '--image-options-csv-file, or --image-options-csv'
          );
        }
        if (target !== 'standalone' && optionSourceCount > 1) {
          throw new Error('linked Selection accepts at most one option source');
        }
        if (target === 'layout' && optionSourceCount) {
          throw new Error('Selection option-source flags are not supported for layout controls');
        }
        if (parsed.options['use-reload'] !== undefined && !hasOptionsUrl) {
          throw new Error('--use-reload requires --options-url');
        }
        if (parsed.options.format !== undefined && !['text', 'color', 'image'].includes(parsed.options.format)) {
          throw new Error('--format must be "text", "color", or "image"');
        }
        if ((hasImageCsvFile || hasImageCsv) && parsed.options.format !== undefined && parsed.options.format !== 'image') {
          throw new Error('image CSV option sources require --format image when --format is specified');
        }
      } else if (
        parsed.options['options-file'] !== undefined ||
        parsed.options['options-url'] !== undefined ||
        parsed.options['image-options-csv-file'] !== undefined ||
        parsed.options['image-options-csv'] !== undefined ||
        parsed.options['use-reload'] !== undefined ||
        parsed.options.format !== undefined
      ) {
        throw new Error('Selection option-source and format flags require a Selection control');
      }
      result = await executeCommand('controlNode.createAndLink', {
        name: requireOption(parsed.options, 'name'),
        type: type,
        target: target,
        tileId: target === 'data' ? requireOption(parsed.options, 'tile-id') : undefined,
        elementType: target === 'layout' ? requireOption(parsed.options, 'element-type') : undefined,
        elementId: target === 'layout' ? requireOption(parsed.options, 'element-id') : undefined,
        propertyId: target === 'standalone' ? undefined : requireOption(parsed.options, 'property'),
        value: target === 'standalone'
          ? type === 'button'
            ? { __singularButton: true, ts: 0 }
            : type === 'timecontrol' || type === 'timer'
            ? undefined
            : type === 'metricfont'
            ? undefined
            : readJsonOptionFile(
              parsed.options,
              'value-file',
              'standalone control value file',
              true
            )
          : undefined,
        font: type === 'metricfont' && target === 'standalone'
          ? {
            family: parsed.options.family,
            weight: parsed.options.weight,
            style: parsed.options.style,
            subset: parsed.options.subset,
            source: parsed.options['font-source']
          }
          : undefined,
        mode: type === 'infotext' ? parsed.options['info-mode'] : undefined,
        selections: type === 'selection'
          ? parsed.options['options-file'] !== undefined
            ? readJsonOptionFile(parsed.options, 'options-file', 'selection options file', true)
            : parsed.options['image-options-csv-file'] !== undefined
            ? parseImageSelectionCsv(readTextFile(
              parsed.options['image-options-csv-file'],
              'Selection image CSV file'
            ))
            : parsed.options['image-options-csv'] !== undefined
            ? parseImageSelectionCsv(parsed.options['image-options-csv'])
            : undefined
          : undefined,
        format: type === 'selection'
          ? (parsed.options['image-options-csv-file'] !== undefined ||
            parsed.options['image-options-csv'] !== undefined
            ? 'image'
            : parsed.options.format)
          : undefined,
        sourceUrl: type === 'selection'
          ? parsed.options['options-url']
          : undefined,
        useReload: parsed.options['use-reload'] === undefined
          ? undefined
          : requireBooleanOption(parsed.options, 'use-reload'),
        replace: parsed.options.replace === true,
        reuseExisting: parsed.options['reuse-existing'] === true,
        index: parsed.options.index === undefined ? undefined : Number(parsed.options.index),
        append: parsed.options.append,
        sourceCompositionId: parsed.options['source-composition']
      });
      break;
    }
    case 'create-controls': {
      const controlsFile = readJsonFile(
        requireOption(parsed.options, 'file'),
        'control-node specification'
      );
      const controls = Array.isArray(controlsFile)
        ? controlsFile
        : controlsFile.controls;
      result = await executeCommand('controlNode.createMany', {
        controls: Array.isArray(controls)
          ? controls.map(function (control) {
            return {
              name: control.name,
              type: control.type,
              target: control.targets !== undefined ? control.target : control.target || (control.elementId ? 'layout' : 'data'),
              targets: Array.isArray(control.targets) ? control.targets.map(function (target) {
                return { ...target, propertyId: target.propertyId || target.property, property: undefined };
              }) : control.targets,
              metadata: control.metadata,
              container: control.container,
              tileId: control.tileId,
              elementType: control.elementType,
              elementId: control.elementId,
              propertyId: control.propertyId || control.property,
              value: control.value,
              mode: control.mode,
              selections: control.selections,
              format: control.format,
              sourceUrl: control.sourceUrl,
              useReload: control.useReload,
              replace: control.replace === true,
              reuseExisting: control.reuseExisting === true,
              sourceCompositionId: control.sourceCompositionId || control.sourceComposition
            };
          })
          : controls
      });
      break;
    }
    case 'delete-control':
      result = await executeCommand('controlNode.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'unlink-layout-ref':
      assertAllowedOptions(parsed.options, ['element-type', 'element-id', 'property', 'compact'], 'unlink-layout-ref');
      result = await executeCommand('controlNode.layout.unlink', {
        elementType: requireOption(parsed.options, 'element-type'),
        elementId: requireOption(parsed.options, 'element-id'),
        propertyId: requireOption(parsed.options, 'property')
      });
      break;
    case 'get':
      if (parsed.options.selected) {
        const inspected = await executeCommand('composition.inspect', { selection: true });
        const selection = inspected && inspected.selection;
        if (!selection || !selection.id) {
          throw new Error('Nothing is selected in Composer; select a tile or group first');
        }
        result = await executeCommand('element.get', {
          elementType: selection.type === 'group' ? 'group' : 'tile',
          id: selection.id
        });
      } else {
        result = await executeCommand('element.get', getElementParams(parsed.options));
      }
      break;
    case 'get-many':
      assertAllowedOptions(parsed.options, ['type', 'ids', 'compact'], 'get-many');
      result = await executeCommand('element.getMany', {
        elementType: parsed.options.type || 'tile',
        ids: parseIds(requireOption(parsed.options, 'ids'))
      });
      break;
    case 'get-layouts': {
      assertAllowedOptions(parsed.options, ['type', 'ids', 'file', 'compact'], 'get-layouts');
      let elements;
      if (parsed.options.file !== undefined) {
        if (parsed.options.type !== undefined || parsed.options.ids !== undefined) {
          throw new Error('get-layouts accepts either --file or --type/--ids, not both');
        }
        const specification = readJsonFile(parsed.options.file, 'layout target specification');
        elements = Array.isArray(specification) ? specification : specification.elements;
      } else {
        const elementType = parsed.options.type || 'tile';
        elements = parseIds(requireOption(parsed.options, 'ids')).map(function (id) {
          return { type: elementType, id: id };
        });
      }
      result = await executeCommand('element.layouts.getMany', { elements: elements });
      break;
    }
    case 'set-layouts': {
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-layouts');
      const specification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'layout assignment specification'
      );
      result = await executeCommand('element.layouts.setMany', {
        elements: Array.isArray(specification) ? specification : specification.elements
      });
      break;
    }
    case 'get-properties':
    case 'set-properties': {
      assertAllowedOptions(parsed.options, ['file', 'compact'], parsed.command);
      const specification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'property specification'
      );
      result = await executeCommand(
        parsed.command === 'get-properties'
          ? 'element.properties.getMany'
          : 'element.properties.setMany',
        { elements: Array.isArray(specification) ? specification : specification.elements }
      );
      break;
    }
    case 'select':
      result = await executeCommand('element.select', getElementParams(parsed.options));
      break;
    case 'move': {
      const params = {
        id: requireOption(parsed.options, 'id'),
        groupId: requireOption(parsed.options, 'group-id')
      };
      if (parsed.options.index !== undefined) {
        const index = Number(parsed.options.index);
        if (!Number.isInteger(index)) {
          throw new Error('--index must be an integer');
        }
        params.index = index;
      }
      result = await executeCommand('element.move', params);
      break;
    }
    case 'update': {
      assertAllowedOptions(parsed.options, [
        'type', 'id', 'namespace', 'path', 'value-file', 'compact'
      ], 'update');
      const params = getElementParams(parsed.options);
      params.path = requireOption(parsed.options, 'path');
      if (parsed.options.namespace) {
        params.namespace = parsed.options.namespace;
      }
      params.value = readJsonOptionFile(
        parsed.options,
        'value-file',
        'element update value file',
        true
      );
      result = await executeCommand('element.update', params);
      break;
    }
    case 'fonts': {
      const params = {};
      if (parsed.options.source) params.source = parsed.options.source;
      if (parsed.options.family) params.family = parsed.options.family;
      result = await executeCommand('fonts.list', params);
      break;
    }
    case 'set-font': {
      const params = { id: requireOption(parsed.options, 'id') };
      ['family', 'source', 'weight', 'alignment'].forEach(function (option) {
        if (parsed.options[option] !== undefined) params[option] = parsed.options[option];
      });
      ['italic', 'underline'].forEach(function (option) {
        if (parsed.options[option] !== undefined) params[option] = parsed.options[option];
      });
      result = await executeCommand('text.font.set', params);
      break;
    }
    case 'timeline-animations':
      result = await executeCommand('timelineAnimations.list', {});
      break;
    case 'set-timeline-animation': {
      assertAllowedOptions(parsed.options, [
        'type', 'id', 'timeline', 'effect', 'property', 'params-file',
        'easing-file', 'start', 'duration', 'compact'
      ], 'set-timeline-animation');
      const params = {
        elementType: parsed.options.type || 'tile',
        id: requireOption(parsed.options, 'id'),
        timeline: requireOption(parsed.options, 'timeline'),
        effect: requireOption(parsed.options, 'effect')
      };
      if (parsed.options.property !== undefined) {
        params.property = parseAnimationProperty(parsed.options.property);
      }
      if (parsed.options['params-file'] !== undefined) {
        params.params = readJsonOptionFile(
          parsed.options,
          'params-file',
          'Timeline-animation parameters file'
        );
      }
      if (parsed.options['easing-file'] !== undefined) {
        params.easing = readJsonOptionFile(
          parsed.options,
          'easing-file',
          'Timeline-animation easing file'
        );
      }
      ['start', 'duration'].forEach(function (option) {
        if (parsed.options[option] === undefined) return;
        const value = Number(parsed.options[option]);
        if (!Number.isFinite(value)) {
          throw new Error(`--${option} must be a number of seconds`);
        }
        params[option] = value;
      });
      result = await executeCommand('timelineAnimation.set', params);
      break;
    }
    case 'set-timeline-animations':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-timeline-animations');
      result = await executeCommand(
        'timelineAnimation.setMany',
        readJsonFile(requireOption(parsed.options, 'file'), 'Timeline-animation choreography')
      );
      break;
    case 'update-animations':
      result = await executeCommand('updateAnimations.list', {});
      break;
    case 'set-update-animation': {
      assertAllowedOptions(parsed.options, [
        'id', 'phase', 'effect', 'property', 'params-file', 'easing-file',
        'duration', 'active', 'always-execute', 'offset', 'compact'
      ], 'set-update-animation');
      const params = {
        id: requireOption(parsed.options, 'id'),
        phase: requireOption(parsed.options, 'phase'),
        effect: requireOption(parsed.options, 'effect')
      };
      if (parsed.options.property !== undefined) {
        params.property = parseAnimationProperty(parsed.options.property);
      }
      if (parsed.options['params-file'] !== undefined) {
        params.params = readJsonOptionFile(
          parsed.options,
          'params-file',
          'Update-animation parameters file'
        );
      }
      if (parsed.options['easing-file'] !== undefined) {
        params.easing = readJsonOptionFile(
          parsed.options,
          'easing-file',
          'Update-animation easing file'
        );
      }
      if (parsed.options.active !== undefined) {
        params.active = requireBooleanOption(parsed.options, 'active');
      }
      if (parsed.options['always-execute'] !== undefined) {
        params.alwaysExecute = parsed.options['always-execute'];
      }
      ['duration', 'offset'].forEach(function (option) {
        if (parsed.options[option] === undefined) return;
        const value = Number(parsed.options[option]);
        if (!Number.isFinite(value)) throw new Error(`--${option} must be a number of seconds`);
        params[option] = value;
      });
      result = await executeCommand('updateAnimation.set', params);
      break;
    }
    case 'set-update-animations':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-update-animations');
      result = await executeCommand(
        'updateAnimation.setMany',
        readJsonFile(requireOption(parsed.options, 'file'), 'Update-animation assignments')
      );
      break;
    case 'behaviors':
      result = parsed.options.id
        ? await executeCommand('behavior.inspect', { id: parsed.options.id })
        : await executeCommand('behaviors.list', {});
      break;
    case 'set-behavior': {
      assertAllowedOptions(parsed.options, [
        'id', 'property', 'effect', 'active', 'remove', 'easing-file',
        'value-min', 'value-max', 'duration', 'duration-range', 'delay',
        'delay-range', 'compact'
      ], 'set-behavior');
      const params = {
        id: requireOption(parsed.options, 'id'),
        property: requireOption(parsed.options, 'property')
      };
      if (parsed.options.effect !== undefined) params.effect = parsed.options.effect;
      if (parsed.options.active !== undefined) params.active = requireBooleanOption(parsed.options, 'active');
      if (parsed.options.remove !== undefined) params.remove = parsed.options.remove;
      if (parsed.options['easing-file'] !== undefined) {
        params.easing = readJsonOptionFile(
          parsed.options,
          'easing-file',
          'continuous-behavior easing file'
        );
      }
      [
        ['value-min', 'valueMin'],
        ['value-max', 'valueMax'],
        ['duration', 'duration'],
        ['duration-range', 'durationRange'],
        ['delay', 'delay'],
        ['delay-range', 'delayRange']
      ].forEach(function (entry) {
        if (parsed.options[entry[0]] === undefined) return;
        const value = Number(parsed.options[entry[0]]);
        if (!Number.isFinite(value)) throw new Error(`--${entry[0]} must be a finite number`);
        params[entry[1]] = value;
      });
      result = await executeCommand('behavior.set', params);
      break;
    }
    case 'set-behaviors':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-behaviors');
      result = await executeCommand(
        'behavior.setMany',
        readJsonFile(requireOption(parsed.options, 'file'), 'continuous-behavior assignments')
      );
      break;
    case 'create-group': {
      assertAllowedOptions(parsed.options, ['name', 'layout-file', 'compact'], 'create-group');
      const params = { name: requireOption(parsed.options, 'name') };
      if (parsed.options['layout-file'] !== undefined) {
        params.layout = readJsonOptionFile(
          parsed.options,
          'layout-file',
          'group layout file'
        );
      }
      result = await executeCommand('group.create', params);
      break;
    }
    case 'configure-group':
      assertAllowedOptions(parsed.options, ['id', 'layout-file', 'compact'], 'configure-group');
      result = await executeCommand('group.configure', {
        id: requireOption(parsed.options, 'id'),
        layout: readJsonOptionFile(
          parsed.options,
          'layout-file',
          'group layout file',
          true
        )
      });
      break;
    case 'move-group': {
      const index = Number(requireOption(parsed.options, 'index'));
      if (!Number.isInteger(index)) {
        throw new Error('--index must be an integer');
      }
      result = await executeCommand('group.move', {
        id: requireOption(parsed.options, 'id'),
        index: index
      });
      break;
    }
    case 'delete-group':
      result = await executeCommand('group.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'capture':
      result = await captureStandalone(normalizeCaptureOptions(parsed.options));
      break;
    case 'capture-worker': {
      assertAllowedOptions(parsed.options, ['action', 'compact'], 'capture-worker');
      const action = parsed.options.action;
      if (action === 'status') result = await getCaptureModule().getCaptureWorkerStatus();
      else if (action === 'stop') result = await getCaptureModule().stopCaptureWorker();
      else if (action === 'reset') result = await getCaptureModule().resetCaptureWorker();
      else throw new Error('capture-worker action must be status, stop, or reset');
      break;
    }
    case 'primitives':
      result = await executeCommand('primitives.list');
      if (parsed.options.primitive) {
        const match = (result.primitives || []).find(function (entry) {
          return entry.primitive === parsed.options.primitive;
        });
        if (!match) {
          throw new Error(`primitive "${parsed.options.primitive}" is not available`);
        }
        result = { primitives: [match] };
      }
      break;
    case 'ensure-group':
      result = await executeCommand('managedGroup.ensure');
      break;
    case 'create': {
      const params = {
        primitive: requireOption(parsed.options, 'primitive'),
        groupId: parsed.options['group-id'],
        index: parsed.options.index === undefined ? undefined : Number(parsed.options.index)
      };
      if (parsed.options.name) {
        params.name = parsed.options.name;
      }
      result = await executeCommand('primitive.create', params);
      break;
    }
    case 'delete':
      result = await executeCommand('primitive.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'apply': {
      const specification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'graphics specification'
      );
      result = await executeCommand('graphics.apply', specification);
      break;
    }
    case 'validate': {
      const specification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'graphics specification'
      );
      result = await executeCommand('graphics.validate', specification);
      break;
    }
    default:
      throw unknownCommandError(parsed.command);
  }

  const output = parsed.options.compact
    ? compactResult(parsed.command, result)
    : result;
  console.log(JSON.stringify(output, null, parsed.options.compact ? 0 : 2));
}

run().then(function () {
  writeWorkLifecycleReminder(invokedCommand, true);
}).catch(function (err) {
  if (err.result) console.log(JSON.stringify(err.result, null, 2));
  const prefix = err.code ? `${err.code}: ` : '';
  console.error(prefix + err.message);
  writeWorkLifecycleReminder(invokedCommand, false, err.result);
  process.exitCode = 1;
});

})();

/******/ })()
;