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
__webpack_require__.dn(__WEBPACK_DEFAULT_EXPORT__);
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
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



const WebSocket = __webpack_require__(22);

WebSocket.Server = __webpack_require__(43);
WebSocket.Receiver = __webpack_require__(38);
WebSocket.Sender = __webpack_require__(42);

module.exports = WebSocket;


/***/ }),
/* 22 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



const EventEmitter = __webpack_require__(23);
const crypto = __webpack_require__(4);
const Ultron = __webpack_require__(24);
const https = __webpack_require__(25);
const http = __webpack_require__(26);
const url = __webpack_require__(27);

const PerMessageDeflate = __webpack_require__(28);
const EventTarget = __webpack_require__(35);
const Extensions = __webpack_require__(36);
const constants = __webpack_require__(37);
const Receiver = __webpack_require__(38);
const Sender = __webpack_require__(42);

const protocolVersions = [8, 13];
const closeTimeout = 30 * 1000; // Allow 30 seconds to terminate the connection cleanly.

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket extends EventEmitter {
  /**
   * Create a new `WebSocket`.
   *
   * @param {String} address The URL to which to connect
   * @param {(String|String[])} protocols The subprotocols
   * @param {Object} options Connection options
   */
  constructor (address, protocols, options) {
    super();

    if (!protocols) {
      protocols = [];
    } else if (typeof protocols === 'string') {
      protocols = [protocols];
    } else if (!Array.isArray(protocols)) {
      options = protocols;
      protocols = [];
    }

    this.readyState = WebSocket.CONNECTING;
    this.bytesReceived = 0;
    this.extensions = {};
    this.protocol = '';

    this._binaryType = constants.BINARY_TYPES[0];
    this._finalize = this.finalize.bind(this);
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = '';
    this._closeTimer = null;
    this._finalized = false;
    this._closeCode = 1006;
    this._receiver = null;
    this._sender = null;
    this._socket = null;
    this._ultron = null;

    if (Array.isArray(address)) {
      initAsServerClient.call(this, address[0], address[1], options);
    } else {
      initAsClient.call(this, address, protocols, options);
    }
  }

  get CONNECTING () { return WebSocket.CONNECTING; }
  get CLOSING () { return WebSocket.CLOSING; }
  get CLOSED () { return WebSocket.CLOSED; }
  get OPEN () { return WebSocket.OPEN; }

  /**
   * @type {Number}
   */
  get bufferedAmount () {
    var amount = 0;

    if (this._socket) {
      amount = this._socket.bufferSize + this._sender._bufferedBytes;
    }
    return amount;
  }

  /**
   * This deviates from the WHATWG interface since ws doesn't support the required
   * default "blob" type (instead we define a custom "nodebuffer" type).
   *
   * @type {String}
   */
  get binaryType () {
    return this._binaryType;
  }

  set binaryType (type) {
    if (constants.BINARY_TYPES.indexOf(type) < 0) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @private
   */
  setSocket (socket, head) {
    socket.setTimeout(0);
    socket.setNoDelay();

    this._receiver = new Receiver(this.extensions, this._maxPayload, this.binaryType);
    this._sender = new Sender(socket, this.extensions);
    this._ultron = new Ultron(socket);
    this._socket = socket;

    this._ultron.on('close', this._finalize);
    this._ultron.on('error', this._finalize);
    this._ultron.on('end', this._finalize);

    if (head.length > 0) socket.unshift(head);

    this._ultron.on('data', (data) => {
      this.bytesReceived += data.length;
      this._receiver.add(data);
    });

    this._receiver.onmessage = (data) => this.emit('message', data);
    this._receiver.onping = (data) => {
      this.pong(data, !this._isServer, true);
      this.emit('ping', data);
    };
    this._receiver.onpong = (data) => this.emit('pong', data);
    this._receiver.onclose = (code, reason) => {
      this._closeFrameReceived = true;
      this._closeMessage = reason;
      this._closeCode = code;
      if (!this._finalized) this.close(code, reason);
    };
    this._receiver.onerror = (error, code) => {
      this._closeMessage = '';
      this._closeCode = code;

      //
      // Ensure that the error is emitted even if `WebSocket#finalize()` has
      // already been called.
      //
      this.readyState = WebSocket.CLOSING;
      this.emit('error', error);
      this.finalize(true);
    };

    this.readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Clean up and release internal resources.
   *
   * @param {(Boolean|Error)} error Indicates whether or not an error occurred
   * @private
   */
  finalize (error) {
    if (this._finalized) return;

    this.readyState = WebSocket.CLOSING;
    this._finalized = true;

    if (typeof error === 'object') this.emit('error', error);
    if (!this._socket) return this.emitClose();

    clearTimeout(this._closeTimer);
    this._closeTimer = null;

    this._ultron.destroy();
    this._ultron = null;

    this._socket.on('error', constants.NOOP);

    if (!error) this._socket.end();
    else this._socket.destroy();

    this._socket = null;
    this._sender = null;

    this._receiver.cleanup(() => this.emitClose());
    this._receiver = null;
  }

  /**
   * Emit the `close` event.
   *
   * @private
   */
  emitClose () {
    this.readyState = WebSocket.CLOSED;

    this.emit('close', this._closeCode, this._closeMessage);

    if (this.extensions[PerMessageDeflate.extensionName]) {
      this.extensions[PerMessageDeflate.extensionName].cleanup();
    }

    this.extensions = null;

    this.removeAllListeners();
  }

  /**
   * Pause the socket stream.
   *
   * @public
   */
  pause () {
    if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

    this._socket.pause();
  }

  /**
   * Resume the socket stream
   *
   * @public
   */
  resume () {
    if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

    this._socket.resume();
  }

  /**
   * Start a closing handshake.
   *
   *            +----------+     +-----------+   +----------+
   *     + - - -|ws.close()|---->|close frame|-->|ws.close()|- - - -
   *            +----------+     +-----------+   +----------+       |
   *     |      +----------+     +-----------+         |
   *            |ws.close()|<----|close frame|<--------+            |
   *            +----------+     +-----------+         |
   *  CLOSING         |              +---+             |         CLOSING
   *                  |          +---|fin|<------------+
   *     |            |          |   +---+                          |
   *                  |          |   +---+      +-------------+
   *     |            +----------+-->|fin|----->|ws.finalize()| - - +
   *                             |   +---+      +-------------+
   *     |     +-------------+   |
   *      - - -|ws.finalize()|<--+
   *           +-------------+
   *
   * @param {Number} code Status code explaining why the connection is closing
   * @param {String} data A string explaining why the connection is closing
   * @public
   */
  close (code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      this._req.abort();
      this.finalize(new Error('closed before the connection is established'));
      return;
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (this._closeFrameSent && this._closeFrameReceived) this._socket.end();
      return;
    }

    this.readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (!this._finalized) {
        if (this._closeFrameReceived) this._socket.end();

        //
        // Ensure that the connection is cleaned up even when the closing
        // handshake fails.
        //
        this._closeTimer = setTimeout(this._finalize, closeTimeout, true);
      }
    });
  }

  /**
   * Send a ping message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Indicates whether or not to mask `data`
   * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
   * @public
   */
  ping (data, mask, failSilently) {
    if (this.readyState !== WebSocket.OPEN) {
      if (failSilently) return;
      throw new Error('not opened');
    }

    if (typeof data === 'number') data = data.toString();
    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || constants.EMPTY_BUFFER, mask);
  }

  /**
   * Send a pong message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Indicates whether or not to mask `data`
   * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
   * @public
   */
  pong (data, mask, failSilently) {
    if (this.readyState !== WebSocket.OPEN) {
      if (failSilently) return;
      throw new Error('not opened');
    }

    if (typeof data === 'number') data = data.toString();
    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || constants.EMPTY_BUFFER, mask);
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} options.compress Specifies whether or not to compress `data`
   * @param {Boolean} options.binary Specifies whether `data` is binary or text
   * @param {Boolean} options.fin Specifies whether the fragment is the last one
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Function} cb Callback which is executed when data is written out
   * @public
   */
  send (data, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (this.readyState !== WebSocket.OPEN) {
      if (cb) cb(new Error('not opened'));
      else throw new Error('not opened');
      return;
    }

    if (typeof data === 'number') data = data.toString();

    const opts = Object.assign({
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true
    }, options);

    if (!this.extensions[PerMessageDeflate.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || constants.EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate () {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      this._req.abort();
      this.finalize(new Error('closed before the connection is established'));
      return;
    }

    this.finalize(true);
  }
}

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket.prototype, `on${method}`, {
    /**
     * Return the listener of the event.
     *
     * @return {(Function|undefined)} The event listener or `undefined`
     * @public
     */
    get () {
      const listeners = this.listeners(method);
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i]._listener) return listeners[i]._listener;
      }
    },
    /**
     * Add a listener for the event.
     *
     * @param {Function} listener The listener to add
     * @public
     */
    set (listener) {
      const listeners = this.listeners(method);
      for (var i = 0; i < listeners.length; i++) {
        //
        // Remove only the listeners added via `addEventListener`.
        //
        if (listeners[i]._listener) this.removeListener(method, listeners[i]);
      }
      this.addEventListener(method, listener);
    }
  });
});

WebSocket.prototype.addEventListener = EventTarget.addEventListener;
WebSocket.prototype.removeEventListener = EventTarget.removeEventListener;

module.exports = WebSocket;

/**
 * Initialize a WebSocket server client.
 *
 * @param {http.IncomingMessage} req The request object
 * @param {net.Socket} socket The network socket between the server and client
 * @param {Buffer} head The first packet of the upgraded stream
 * @param {Object} options WebSocket attributes
 * @param {Number} options.protocolVersion The WebSocket protocol version
 * @param {Object} options.extensions The negotiated extensions
 * @param {Number} options.maxPayload The maximum allowed message size
 * @param {String} options.protocol The chosen subprotocol
 * @private
 */
function initAsServerClient (socket, head, options) {
  this.protocolVersion = options.protocolVersion;
  this._maxPayload = options.maxPayload;
  this.extensions = options.extensions;
  this.protocol = options.protocol;

  this._isServer = true;

  this.setSocket(socket, head);
}

/**
 * Initialize a WebSocket client.
 *
 * @param {String} address The URL to which to connect
 * @param {String[]} protocols The list of subprotocols
 * @param {Object} options Connection options
 * @param {String} options.protocol Value of the `Sec-WebSocket-Protocol` header
 * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
 * @param {Number} options.handshakeTimeout Timeout in milliseconds for the handshake request
 * @param {String} options.localAddress Local interface to bind for network connections
 * @param {Number} options.protocolVersion Value of the `Sec-WebSocket-Version` header
 * @param {Object} options.headers An object containing request headers
 * @param {String} options.origin Value of the `Origin` or `Sec-WebSocket-Origin` header
 * @param {http.Agent} options.agent Use the specified Agent
 * @param {String} options.host Value of the `Host` header
 * @param {Number} options.family IP address family to use during hostname lookup (4 or 6).
 * @param {Function} options.checkServerIdentity A function to validate the server hostname
 * @param {Boolean} options.rejectUnauthorized Verify or not the server certificate
 * @param {String} options.passphrase The passphrase for the private key or pfx
 * @param {String} options.ciphers The ciphers to use or exclude
 * @param {String} options.ecdhCurve The curves for ECDH key agreement to use or exclude
 * @param {(String|String[]|Buffer|Buffer[])} options.cert The certificate key
 * @param {(String|String[]|Buffer|Buffer[])} options.key The private key
 * @param {(String|Buffer)} options.pfx The private key, certificate, and CA certs
 * @param {(String|String[]|Buffer|Buffer[])} options.ca Trusted certificates
 * @private
 */
function initAsClient (address, protocols, options) {
  options = Object.assign({
    protocolVersion: protocolVersions[1],
    protocol: protocols.join(','),
    perMessageDeflate: true,
    handshakeTimeout: null,
    localAddress: null,
    headers: null,
    family: null,
    origin: null,
    agent: null,
    host: null,

    //
    // SSL options.
    //
    checkServerIdentity: null,
    rejectUnauthorized: null,
    passphrase: null,
    ciphers: null,
    ecdhCurve: null,
    cert: null,
    key: null,
    pfx: null,
    ca: null
  }, options);

  if (protocolVersions.indexOf(options.protocolVersion) === -1) {
    throw new Error(
      `unsupported protocol version: ${options.protocolVersion} ` +
      `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  this.protocolVersion = options.protocolVersion;
  this._isServer = false;
  this.url = address;

  const serverUrl = url.parse(address);
  const isUnixSocket = serverUrl.protocol === 'ws+unix:';

  if (!serverUrl.host && (!isUnixSocket || !serverUrl.path)) {
    throw new Error('invalid url');
  }

  const isSecure = serverUrl.protocol === 'wss:' || serverUrl.protocol === 'https:';
  const key = crypto.randomBytes(16).toString('base64');
  const httpObj = isSecure ? https : http;
  var perMessageDeflate;

  const requestOptions = {
    port: serverUrl.port || (isSecure ? 443 : 80),
    host: serverUrl.hostname,
    path: '/',
    headers: {
      'Sec-WebSocket-Version': options.protocolVersion,
      'Sec-WebSocket-Key': key,
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  if (options.headers) Object.assign(requestOptions.headers, options.headers);
  if (options.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(
      options.perMessageDeflate !== true ? options.perMessageDeflate : {},
      false
    );
    requestOptions.headers['Sec-WebSocket-Extensions'] = Extensions.format({
      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
    });
  }
  if (options.protocol) {
    requestOptions.headers['Sec-WebSocket-Protocol'] = options.protocol;
  }
  if (options.origin) {
    if (options.protocolVersion < 13) {
      requestOptions.headers['Sec-WebSocket-Origin'] = options.origin;
    } else {
      requestOptions.headers.Origin = options.origin;
    }
  }
  if (options.host) requestOptions.headers.Host = options.host;
  if (serverUrl.auth) requestOptions.auth = serverUrl.auth;

  if (options.localAddress) requestOptions.localAddress = options.localAddress;
  if (options.family) requestOptions.family = options.family;

  if (isUnixSocket) {
    const parts = serverUrl.path.split(':');

    requestOptions.socketPath = parts[0];
    requestOptions.path = parts[1];
  } else if (serverUrl.path) {
    //
    // Make sure that path starts with `/`.
    //
    if (serverUrl.path.charAt(0) !== '/') {
      requestOptions.path = `/${serverUrl.path}`;
    } else {
      requestOptions.path = serverUrl.path;
    }
  }

  var agent = options.agent;

  //
  // A custom agent is required for these options.
  //
  if (
    options.rejectUnauthorized != null ||
    options.checkServerIdentity ||
    options.passphrase ||
    options.ciphers ||
    options.ecdhCurve ||
    options.cert ||
    options.key ||
    options.pfx ||
    options.ca
  ) {
    if (options.passphrase) requestOptions.passphrase = options.passphrase;
    if (options.ciphers) requestOptions.ciphers = options.ciphers;
    if (options.ecdhCurve) requestOptions.ecdhCurve = options.ecdhCurve;
    if (options.cert) requestOptions.cert = options.cert;
    if (options.key) requestOptions.key = options.key;
    if (options.pfx) requestOptions.pfx = options.pfx;
    if (options.ca) requestOptions.ca = options.ca;
    if (options.checkServerIdentity) {
      requestOptions.checkServerIdentity = options.checkServerIdentity;
    }
    if (options.rejectUnauthorized != null) {
      requestOptions.rejectUnauthorized = options.rejectUnauthorized;
    }

    if (!agent) agent = new httpObj.Agent(requestOptions);
  }

  if (agent) requestOptions.agent = agent;

  this._req = httpObj.get(requestOptions);

  if (options.handshakeTimeout) {
    this._req.setTimeout(options.handshakeTimeout, () => {
      this._req.abort();
      this.finalize(new Error('opening handshake has timed out'));
    });
  }

  this._req.on('error', (error) => {
    if (this._req.aborted) return;

    this._req = null;
    this.finalize(error);
  });

  this._req.on('response', (res) => {
    if (!this.emit('unexpected-response', this._req, res)) {
      this._req.abort();
      this.finalize(new Error(`unexpected server response (${res.statusCode})`));
    }
  });

  this._req.on('upgrade', (res, socket, head) => {
    this.emit('headers', res.headers, res);

    //
    // The user may have closed the connection from a listener of the `headers`
    // event.
    //
    if (this.readyState !== WebSocket.CONNECTING) return;

    this._req = null;

    const digest = crypto.createHash('sha1')
      .update(key + constants.GUID, 'binary')
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      socket.destroy();
      return this.finalize(new Error('invalid server key'));
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    const protList = (options.protocol || '').split(/, */);
    var protError;

    if (!options.protocol && serverProt) {
      protError = 'server sent a subprotocol even though none requested';
    } else if (options.protocol && !serverProt) {
      protError = 'server sent no subprotocol even though requested';
    } else if (serverProt && protList.indexOf(serverProt) === -1) {
      protError = 'server responded with an invalid protocol';
    }

    if (protError) {
      socket.destroy();
      return this.finalize(new Error(protError));
    }

    if (serverProt) this.protocol = serverProt;

    if (perMessageDeflate) {
      try {
        const serverExtensions = Extensions.parse(
          res.headers['sec-websocket-extensions']
        );

        if (serverExtensions[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(
            serverExtensions[PerMessageDeflate.extensionName]
          );
          this.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        socket.destroy();
        this.finalize(new Error('invalid Sec-WebSocket-Extensions header'));
        return;
      }
    }

    this.setSocket(socket, head);
  });
}


/***/ }),
/* 23 */
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),
/* 24 */
/***/ ((module) => {

"use strict";


var has = Object.prototype.hasOwnProperty;

/**
 * An auto incrementing id which we can use to create "unique" Ultron instances
 * so we can track the event emitters that are added through the Ultron
 * interface.
 *
 * @type {Number}
 * @private
 */
var id = 0;

/**
 * Ultron is high-intelligence robot. It gathers intelligence so it can start improving
 * upon his rudimentary design. It will learn from your EventEmitting patterns
 * and exterminate them.
 *
 * @constructor
 * @param {EventEmitter} ee EventEmitter instance we need to wrap.
 * @api public
 */
function Ultron(ee) {
  if (!(this instanceof Ultron)) return new Ultron(ee);

  this.id = id++;
  this.ee = ee;
}

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.on = function on(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.on(event, fn, context);

  return this;
};
/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.once = function once(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.once(event, fn, context);

  return this;
};

/**
 * Remove the listeners we assigned for the given event.
 *
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.remove = function remove() {
  var args = arguments
    , ee = this.ee
    , event;

  //
  // When no event names are provided we assume that we need to clear all the
  // events that were assigned through us.
  //
  if (args.length === 1 && 'string' === typeof args[0]) {
    args = args[0].split(/[, ]+/);
  } else if (!args.length) {
    if (ee.eventNames) {
      args = ee.eventNames();
    } else if (ee._events) {
      args = [];

      for (event in ee._events) {
        if (has.call(ee._events, event)) args.push(event);
      }

      if (Object.getOwnPropertySymbols) {
        args = args.concat(Object.getOwnPropertySymbols(ee._events));
      }
    }
  }

  for (var i = 0; i < args.length; i++) {
    var listeners = ee.listeners(args[i]);

    for (var j = 0; j < listeners.length; j++) {
      event = listeners[j];

      //
      // Once listeners have a `listener` property that stores the real listener
      // in the EventEmitter that ships with Node.js.
      //
      if (event.listener) {
        if (event.listener.__ultron !== this.id) continue;
      } else if (event.__ultron !== this.id) {
        continue;
      }

      ee.removeListener(args[i], event);
    }
  }

  return this;
};

/**
 * Destroy the Ultron instance, remove all listeners and release all references.
 *
 * @returns {Boolean}
 * @api public
 */
Ultron.prototype.destroy = function destroy() {
  if (!this.ee) return false;

  this.remove();
  this.ee = null;

  return true;
};

//
// Expose the module.
//
module.exports = Ultron;


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
module.exports = require("url");

/***/ }),
/* 28 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const safeBuffer = __webpack_require__(29);
const Limiter = __webpack_require__(31);
const zlib = __webpack_require__(32);

const bufferUtil = __webpack_require__(33);

const Buffer = safeBuffer.Buffer;

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const EMPTY_BLOCK = Buffer.from([0x00]);

const kWriteInProgress = Symbol('write-in-progress');
const kPendingClose = Symbol('pending-close');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');
const kOwner = Symbol('owner');

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
   * @param {Object} options Configuration options
   * @param {Boolean} options.serverNoContextTakeover Request/accept disabling
   *     of server context takeover
   * @param {Boolean} options.clientNoContextTakeover Advertise/acknowledge
   *     disabling of client context takeover
   * @param {(Boolean|Number)} options.serverMaxWindowBits Request/confirm the
   *     use of a custom server window size
   * @param {(Boolean|Number)} options.clientMaxWindowBits Advertise support
   *     for, or request, a custom client window size
   * @param {Number} options.level The value of zlib's `level` param
   * @param {Number} options.memLevel The value of zlib's `memLevel` param
   * @param {Number} options.threshold Size (in bytes) below which messages
   *     should not be compressed
   * @param {Number} options.concurrencyLimit The number of concurrent calls to
   *     zlib
   * @param {Boolean} isServer Create the instance in either server or client
   *     mode
   * @param {Number} maxPayload The maximum allowed message length
   */
  constructor (options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined
      ? this._options.threshold
      : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency = this._options.concurrencyLimit !== undefined
        ? this._options.concurrencyLimit
        : 10;
      zlibLimiter = new Limiter({ concurrency });
    }
  }

  /**
   * @type {String}
   */
  static get extensionName () {
    return 'permessage-deflate';
  }

  /**
   * Create extension parameters offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer () {
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
   * Accept extension offer.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Object} Accepted configuration
   * @public
   */
  accept (paramsList) {
    paramsList = this.normalizeParams(paramsList);

    var params;
    if (this._isServer) {
      params = this.acceptAsServer(paramsList);
    } else {
      params = this.acceptAsClient(paramsList);
    }

    this.params = params;
    return params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup () {
    if (this._inflate) {
      if (this._inflate[kWriteInProgress]) {
        this._inflate[kPendingClose] = true;
      } else {
        this._inflate.close();
        this._inflate = null;
      }
    }
    if (this._deflate) {
      if (this._deflate[kWriteInProgress]) {
        this._deflate[kPendingClose] = true;
      } else {
        this._deflate.close();
        this._deflate = null;
      }
    }
  }

  /**
   * Accept extension offer from client.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer (paramsList) {
    const accepted = {};
    const result = paramsList.some((params) => {
      if (
        (this._options.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (this._options.serverMaxWindowBits === false &&
          params.server_max_window_bits) ||
        (typeof this._options.serverMaxWindowBits === 'number' &&
          typeof params.server_max_window_bits === 'number' &&
          this._options.serverMaxWindowBits > params.server_max_window_bits) ||
        (typeof this._options.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return;
      }

      if (
        this._options.serverNoContextTakeover ||
        params.server_no_context_takeover
      ) {
        accepted.server_no_context_takeover = true;
      }
      if (
        this._options.clientNoContextTakeover ||
        (this._options.clientNoContextTakeover !== false &&
          params.client_no_context_takeover)
      ) {
        accepted.client_no_context_takeover = true;
      }
      if (typeof this._options.serverMaxWindowBits === 'number') {
        accepted.server_max_window_bits = this._options.serverMaxWindowBits;
      } else if (typeof params.server_max_window_bits === 'number') {
        accepted.server_max_window_bits = params.server_max_window_bits;
      }
      if (typeof this._options.clientMaxWindowBits === 'number') {
        accepted.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (
        this._options.clientMaxWindowBits !== false &&
        typeof params.client_max_window_bits === 'number'
      ) {
        accepted.client_max_window_bits = params.client_max_window_bits;
      }
      return true;
    });

    if (!result) throw new Error("Doesn't support the offered configuration");

    return accepted;
  }

  /**
   * Accept extension response from server.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient (paramsList) {
    const params = paramsList[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Invalid value for "client_no_context_takeover"');
    }

    if (
      (typeof this._options.clientMaxWindowBits === 'number' &&
        (!params.client_max_window_bits ||
          params.client_max_window_bits > this._options.clientMaxWindowBits)) ||
      (this._options.clientMaxWindowBits === false &&
        params.client_max_window_bits)
    ) {
      throw new Error('Invalid value for "client_max_window_bits"');
    }

    return params;
  }

  /**
   * Normalize extensions parameters.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Array} Normalized extensions parameters
   * @private
   */
  normalizeParams (paramsList) {
    return paramsList.map((params) => {
      Object.keys(params).forEach((key) => {
        var value = params[key];
        if (value.length > 1) {
          throw new Error(`Multiple extension parameters for ${key}`);
        }

        value = value[0];

        switch (key) {
          case 'server_no_context_takeover':
          case 'client_no_context_takeover':
            if (value !== true) {
              throw new Error(`invalid extension parameter value for ${key} (${value})`);
            }
            params[key] = true;
            break;
          case 'server_max_window_bits':
          case 'client_max_window_bits':
            if (typeof value === 'string') {
              value = parseInt(value, 10);
              if (
                Number.isNaN(value) ||
                value < zlib.Z_MIN_WINDOWBITS ||
                value > zlib.Z_MAX_WINDOWBITS
              ) {
                throw new Error(`invalid extension parameter value for ${key} (${value})`);
              }
            }
            if (!this._isServer && value === true) {
              throw new Error(`Missing extension parameter value for ${key}`);
            }
            params[key] = value;
            break;
          default:
            throw new Error(`Not defined extension parameter (${key})`);
        }
      });
      return params;
    });
  }

  /**
   * Decompress data. Concurrency limited by async-limiter.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress (data, fin, callback) {
    zlibLimiter.push((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited by async-limiter.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress (data, fin, callback) {
    zlibLimiter.push((done) => {
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
  _decompress (data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits = typeof this.params[key] !== 'number'
        ? zlib.Z_DEFAULT_WINDOWBITS
        : this.params[key];

      this._inflate = zlib.createInflateRaw({ windowBits });
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate[kOwner] = this;
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;
    this._inflate[kWriteInProgress] = true;

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

      if (
        (fin && this.params[`${endpoint}_no_context_takeover`]) ||
        this._inflate[kPendingClose]
      ) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kWriteInProgress] = false;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress (data, fin, callback) {
    if (!data || data.length === 0) {
      process.nextTick(callback, null, EMPTY_BLOCK);
      return;
    }

    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits = typeof this.params[key] !== 'number'
        ? zlib.Z_DEFAULT_WINDOWBITS
        : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        memLevel: this._options.memLevel,
        level: this._options.level,
        flush: zlib.Z_SYNC_FLUSH,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      //
      // `zlib.DeflateRaw` emits an `'error'` event only when an attempt to use
      // it is made after it has already been closed. This cannot happen here,
      // so we only add a listener for the `'data'` event.
      //
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kWriteInProgress] = true;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      var data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) data = data.slice(0, data.length - 4);

      if (
        (fin && this.params[`${endpoint}_no_context_takeover`]) ||
        this._deflate[kPendingClose]
      ) {
        this._deflate.close();
        this._deflate = null;
      } else {
        this._deflate[kWriteInProgress] = false;
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
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
function deflateOnData (chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData (chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kOwner]._maxPayload < 1 ||
    this[kTotalLength] <= this[kOwner]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new Error('max payload size exceeded');
  this[kError].closeCode = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError (err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kOwner]._inflate = null;
  this[kCallback](err);
}


/***/ }),
/* 29 */
/***/ ((module, exports, __webpack_require__) => {

/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(30)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),
/* 30 */
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),
/* 31 */
/***/ ((module) => {

"use strict";


function Queue(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }

  options = options || {};
  this.concurrency = options.concurrency || Infinity;
  this.pending = 0;
  this.jobs = [];
  this.cbs = [];
  this._done = done.bind(this);
}

var arrayAddMethods = [
  'push',
  'unshift',
  'splice'
];

arrayAddMethods.forEach(function(method) {
  Queue.prototype[method] = function() {
    var methodResult = Array.prototype[method].apply(this.jobs, arguments);
    this._run();
    return methodResult;
  };
});

Object.defineProperty(Queue.prototype, 'length', {
  get: function() {
    return this.pending + this.jobs.length;
  }
});

Queue.prototype._run = function() {
  if (this.pending === this.concurrency) {
    return;
  }
  if (this.jobs.length) {
    var job = this.jobs.shift();
    this.pending++;
    job(this._done);
    this._run();
  }

  if (this.pending === 0) {
    while (this.cbs.length !== 0) {
      var cb = this.cbs.pop();
      process.nextTick(cb);
    }
  }
};

Queue.prototype.onDone = function(cb) {
  if (typeof cb === 'function') {
    this.cbs.push(cb);
    this._run();
  }
};

function done() {
  this.pending--;
  this._run();
}

module.exports = Queue;


/***/ }),
/* 32 */
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),
/* 33 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



const safeBuffer = __webpack_require__(29);

const Buffer = safeBuffer.Buffer;

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
const concat = (list, totalLength) => {
  const target = Buffer.allocUnsafe(totalLength);
  var offset = 0;

  for (var i = 0; i < list.length; i++) {
    const buf = list[i];
    buf.copy(target, offset);
    offset += buf.length;
  }

  return target;
};

try {
  const bufferUtil = __webpack_require__(34);

  module.exports = Object.assign({ concat }, bufferUtil.BufferUtil || bufferUtil);
} catch (e) /* istanbul ignore next */ {
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
  const mask = (source, mask, output, offset, length) => {
    for (var i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ mask[i & 3];
    }
  };

  /**
   * Unmasks a buffer using the given mask.
   *
   * @param {Buffer} buffer The buffer to unmask
   * @param {Buffer} mask The mask to use
   * @public
   */
  const unmask = (buffer, mask) => {
    // Required until https://github.com/nodejs/node/issues/9006 is resolved.
    const length = buffer.length;
    for (var i = 0; i < length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  };

  module.exports = { concat, mask, unmask };
}


/***/ }),
/* 34 */
/***/ ((module) => {

"use strict";
module.exports = require("bufferutil");

/***/ }),
/* 35 */
/***/ ((module) => {

"use strict";


/**
 * Class representing an event.
 *
 * @private
 */
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @param {Object} target A reference to the target to which the event was dispatched
   */
  constructor (type, target) {
    this.target = target;
    this.type = type;
  }
}

/**
 * Class representing a message event.
 *
 * @extends Event
 * @private
 */
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  constructor (data, target) {
    super('message', target);

    this.data = data;
  }
}

/**
 * Class representing a close event.
 *
 * @extends Event
 * @private
 */
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {Number} code The status code explaining why the connection is being closed
   * @param {String} reason A human-readable string explaining why the connection is closing
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  constructor (code, reason, target) {
    super('close', target);

    this.wasClean = target._closeFrameReceived && target._closeFrameSent;
    this.reason = reason;
    this.code = code;
  }
}

/**
 * Class representing an open event.
 *
 * @extends Event
 * @private
 */
class OpenEvent extends Event {
  /**
   * Create a new `OpenEvent`.
   *
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  constructor (target) {
    super('open', target);
  }
}

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
   * @param {String} method A string representing the event type to listen for
   * @param {Function} listener The listener to add
   * @public
   */
  addEventListener (method, listener) {
    if (typeof listener !== 'function') return;

    function onMessage (data) {
      listener.call(this, new MessageEvent(data, this));
    }

    function onClose (code, message) {
      listener.call(this, new CloseEvent(code, message, this));
    }

    function onError (event) {
      event.type = 'error';
      event.target = this;
      listener.call(this, event);
    }

    function onOpen () {
      listener.call(this, new OpenEvent(this));
    }

    if (method === 'message') {
      onMessage._listener = listener;
      this.on(method, onMessage);
    } else if (method === 'close') {
      onClose._listener = listener;
      this.on(method, onClose);
    } else if (method === 'error') {
      onError._listener = listener;
      this.on(method, onError);
    } else if (method === 'open') {
      onOpen._listener = listener;
      this.on(method, onOpen);
    } else {
      this.on(method, listener);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} method A string representing the event type to remove
   * @param {Function} listener The listener to remove
   * @public
   */
  removeEventListener (method, listener) {
    const listeners = this.listeners(method);

    for (var i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener || listeners[i]._listener === listener) {
        this.removeListener(method, listeners[i]);
      }
    }
  }
};

module.exports = EventTarget;


/***/ }),
/* 36 */
/***/ ((module) => {

"use strict";


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
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push (dest, name, elem) {
  if (Object.prototype.hasOwnProperty.call(dest, name)) dest[name].push(elem);
  else dest[name] = [elem];
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse (header) {
  const offers = {};

  if (header === undefined || header === '') return offers;

  var params = {};
  var mustUnescape = false;
  var isEscaping = false;
  var inQuotes = false;
  var extensionName;
  var paramName;
  var start = -1;
  var end = -1;

  for (var i = 0; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20/* ' ' */|| code === 0x09/* '\t' */) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b/* ';' */ || code === 0x2c/* ',' */) {
        if (start === -1) throw new Error(`unexpected character at index ${i}`);

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = {};
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new Error(`unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw new Error(`unexpected character at index ${i}`);

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = {};
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d/* '=' */&& start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new Error(`unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars[code] !== 1) {
          throw new Error(`unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22/* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c/* '\' */) {
          isEscaping = true;
        } else {
          throw new Error(`unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw new Error(`unexpected character at index ${i}`);

        if (end === -1) end = i;
        var value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = {};
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new Error(`unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes) throw new Error('unexpected end of input');

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, {});
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
 * Serializes a parsed `Sec-WebSocket-Extensions` header to a string.
 *
 * @param {Object} value The object to format
 * @return {String} A string representing the given value
 * @public
 */
function format (value) {
  return Object.keys(value).map((token) => {
    var paramsList = value[token];
    if (!Array.isArray(paramsList)) paramsList = [paramsList];
    return paramsList.map((params) => {
      return [token].concat(Object.keys(params).map((k) => {
        var p = params[k];
        if (!Array.isArray(p)) p = [p];
        return p.map((v) => v === true ? k : `${k}=${v}`).join('; ');
      })).join('; ');
    }).join(', ');
  }).join(', ');
}

module.exports = { format, parse };


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


const safeBuffer = __webpack_require__(29);

const Buffer = safeBuffer.Buffer;

exports.BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
exports.GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
exports.EMPTY_BUFFER = Buffer.alloc(0);
exports.NOOP = () => {};


/***/ }),
/* 38 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



const safeBuffer = __webpack_require__(29);

const PerMessageDeflate = __webpack_require__(28);
const isValidUTF8 = __webpack_require__(39);
const bufferUtil = __webpack_require__(33);
const ErrorCodes = __webpack_require__(41);
const constants = __webpack_require__(37);

const Buffer = safeBuffer.Buffer;

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 */
class Receiver {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} extensions An object containing the negotiated extensions
   * @param {Number} maxPayload The maximum allowed message length
   * @param {String} binaryType The type for binary data
   */
  constructor (extensions, maxPayload, binaryType) {
    this._binaryType = binaryType || constants.BINARY_TYPES[0];
    this._extensions = extensions || {};
    this._maxPayload = maxPayload | 0;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._mask = null;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._cleanupCallback = null;
    this._hadError = false;
    this._dead = false;
    this._loop = false;

    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.onping = null;
    this.onpong = null;

    this._state = GET_INFO;
  }

  /**
   * Consumes bytes from the available buffered data.
   *
   * @param {Number} bytes The number of bytes to consume
   * @return {Buffer} Consumed bytes
   * @private
   */
  readBuffer (bytes) {
    var offset = 0;
    var dst;
    var l;

    this._bufferedBytes -= bytes;

    if (bytes === this._buffers[0].length) return this._buffers.shift();

    if (bytes < this._buffers[0].length) {
      dst = this._buffers[0].slice(0, bytes);
      this._buffers[0] = this._buffers[0].slice(bytes);
      return dst;
    }

    dst = Buffer.allocUnsafe(bytes);

    while (bytes > 0) {
      l = this._buffers[0].length;

      if (bytes >= l) {
        this._buffers[0].copy(dst, offset);
        offset += l;
        this._buffers.shift();
      } else {
        this._buffers[0].copy(dst, offset, 0, bytes);
        this._buffers[0] = this._buffers[0].slice(bytes);
      }

      bytes -= l;
    }

    return dst;
  }

  /**
   * Checks if the number of buffered bytes is bigger or equal than `n` and
   * calls `cleanup` if necessary.
   *
   * @param {Number} n The number of bytes to check against
   * @return {Boolean} `true` if `bufferedBytes >= n`, else `false`
   * @private
   */
  hasBufferedBytes (n) {
    if (this._bufferedBytes >= n) return true;

    this._loop = false;
    if (this._dead) this.cleanup(this._cleanupCallback);
    return false;
  }

  /**
   * Adds new data to the parser.
   *
   * @public
   */
  add (data) {
    if (this._dead) return;

    this._bufferedBytes += data.length;
    this._buffers.push(data);
    this.startLoop();
  }

  /**
   * Starts the parsing loop.
   *
   * @private
   */
  startLoop () {
    this._loop = true;

    while (this._loop) {
      switch (this._state) {
        case GET_INFO:
          this.getInfo();
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64();
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData();
          break;
        default: // `INFLATING`
          this._loop = false;
      }
    }
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @private
   */
  getInfo () {
    if (!this.hasBufferedBytes(2)) return;

    const buf = this.readBuffer(2);

    if ((buf[0] & 0x30) !== 0x00) {
      this.error(new Error('RSV2 and RSV3 must be clear'), 1002);
      return;
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      this.error(new Error('RSV1 must be clear'), 1002);
      return;
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this.error(new Error('RSV1 must be clear'), 1002);
        return;
      }

      if (!this._fragmented) {
        this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
        return;
      } else {
        this._opcode = this._fragmented;
      }
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
        return;
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this.error(new Error('FIN must be set'), 1002);
        return;
      }

      if (compressed) {
        this.error(new Error('RSV1 must be clear'), 1002);
        return;
      }

      if (this._payloadLength > 0x7d) {
        this.error(new Error('invalid payload length'), 1002);
        return;
      }
    } else {
      this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;

    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength();
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @private
   */
  getPayloadLength16 () {
    if (!this.hasBufferedBytes(2)) return;

    this._payloadLength = this.readBuffer(2).readUInt16BE(0, true);
    this.haveLength();
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @private
   */
  getPayloadLength64 () {
    if (!this.hasBufferedBytes(8)) return;

    const buf = this.readBuffer(8);
    const num = buf.readUInt32BE(0, true);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      this.error(new Error('max payload size exceeded'), 1009);
      return;
    }

    this._payloadLength = (num * Math.pow(2, 32)) + buf.readUInt32BE(4, true);
    this.haveLength();
  }

  /**
   * Payload length has been read.
   *
   * @private
   */
  haveLength () {
    if (this._opcode < 0x08 && this.maxPayloadExceeded(this._payloadLength)) {
      return;
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask () {
    if (!this.hasBufferedBytes(4)) return;

    this._mask = this.readBuffer(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @private
   */
  getData () {
    var data = constants.EMPTY_BUFFER;

    if (this._payloadLength) {
      if (!this.hasBufferedBytes(this._payloadLength)) return;

      data = this.readBuffer(this._payloadLength);
      if (this._masked) bufferUtil.unmask(data, this._mask);
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data);
    } else if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data);
    } else if (this.pushFragment(data)) {
      this.dataMessage();
    }
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @private
   */
  decompress (data) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) {
        this.error(err, err.closeCode === 1009 ? 1009 : 1007);
        return;
      }

      if (this.pushFragment(buf)) this.dataMessage();
      this.startLoop();
    });
  }

  /**
   * Handles a data message.
   *
   * @private
   */
  dataMessage () {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 2) {
        var data;

        if (this._binaryType === 'nodebuffer') {
          data = toBuffer(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(toBuffer(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.onmessage(data);
      } else {
        const buf = toBuffer(fragments, messageLength);

        if (!isValidUTF8(buf)) {
          this.error(new Error('invalid utf8 sequence'), 1007);
          return;
        }

        this.onmessage(buf.toString());
      }
    }

    this._state = GET_INFO;
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @private
   */
  controlMessage (data) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this.onclose(1000, '');
        this._loop = false;
        this.cleanup(this._cleanupCallback);
      } else if (data.length === 1) {
        this.error(new Error('invalid payload length'), 1002);
      } else {
        const code = data.readUInt16BE(0, true);

        if (!ErrorCodes.isValidErrorCode(code)) {
          this.error(new Error(`invalid status code: ${code}`), 1002);
          return;
        }

        const buf = data.slice(2);

        if (!isValidUTF8(buf)) {
          this.error(new Error('invalid utf8 sequence'), 1007);
          return;
        }

        this.onclose(code, buf.toString());
        this._loop = false;
        this.cleanup(this._cleanupCallback);
      }

      return;
    }

    if (this._opcode === 0x09) this.onping(data);
    else this.onpong(data);

    this._state = GET_INFO;
  }

  /**
   * Handles an error.
   *
   * @param {Error} err The error
   * @param {Number} code Close code
   * @private
   */
  error (err, code) {
    this.onerror(err, code);
    this._hadError = true;
    this._loop = false;
    this.cleanup(this._cleanupCallback);
  }

  /**
   * Checks payload size, disconnects socket when it exceeds `maxPayload`.
   *
   * @param {Number} length Payload length
   * @private
   */
  maxPayloadExceeded (length) {
    if (length === 0 || this._maxPayload < 1) return false;

    const fullLength = this._totalPayloadLength + length;

    if (fullLength <= this._maxPayload) {
      this._totalPayloadLength = fullLength;
      return false;
    }

    this.error(new Error('max payload size exceeded'), 1009);
    return true;
  }

  /**
   * Appends a fragment in the fragments array after checking that the sum of
   * fragment lengths does not exceed `maxPayload`.
   *
   * @param {Buffer} fragment The fragment to add
   * @return {Boolean} `true` if `maxPayload` is not exceeded, else `false`
   * @private
   */
  pushFragment (fragment) {
    if (fragment.length === 0) return true;

    const totalLength = this._messageLength + fragment.length;

    if (this._maxPayload < 1 || totalLength <= this._maxPayload) {
      this._messageLength = totalLength;
      this._fragments.push(fragment);
      return true;
    }

    this.error(new Error('max payload size exceeded'), 1009);
    return false;
  }

  /**
   * Releases resources used by the receiver.
   *
   * @param {Function} cb Callback
   * @public
   */
  cleanup (cb) {
    this._dead = true;

    if (!this._hadError && (this._loop || this._state === INFLATING)) {
      this._cleanupCallback = cb;
    } else {
      this._extensions = null;
      this._fragments = null;
      this._buffers = null;
      this._mask = null;

      this._cleanupCallback = null;
      this.onmessage = null;
      this.onclose = null;
      this.onerror = null;
      this.onping = null;
      this.onpong = null;

      if (cb) cb();
    }
  }
}

module.exports = Receiver;

/**
 * Makes a buffer from a list of fragments.
 *
 * @param {Buffer[]} fragments The list of fragments composing the message
 * @param {Number} messageLength The length of the message
 * @return {Buffer}
 * @private
 */
function toBuffer (fragments, messageLength) {
  if (fragments.length === 1) return fragments[0];
  if (fragments.length > 1) return bufferUtil.concat(fragments, messageLength);
  return constants.EMPTY_BUFFER;
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 */
function toArrayBuffer (buf) {
  if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}


/***/ }),
/* 39 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



try {
  const isValidUTF8 = __webpack_require__(40);

  module.exports = typeof isValidUTF8 === 'object'
    ? isValidUTF8.Validation.isValidUTF8 // utf-8-validate@<3.0.0
    : isValidUTF8;
} catch (e) /* istanbul ignore next */ {
  module.exports = () => true;
}


/***/ }),
/* 40 */
/***/ ((module) => {

"use strict";
module.exports = require("utf-8-validate");

/***/ }),
/* 41 */
/***/ ((module) => {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



module.exports = {
  isValidErrorCode: function (code) {
    return (code >= 1000 && code <= 1013 && code !== 1004 && code !== 1005 && code !== 1006) ||
      (code >= 3000 && code <= 4999);
  },
  1000: 'normal',
  1001: 'going away',
  1002: 'protocol error',
  1003: 'unsupported data',
  1004: 'reserved',
  1005: 'reserved for extensions',
  1006: 'reserved for extensions',
  1007: 'inconsistent or invalid data',
  1008: 'policy violation',
  1009: 'message too big',
  1010: 'extension handshake missing',
  1011: 'an unexpected condition prevented the request from being fulfilled',
  1012: 'service restart',
  1013: 'try again later'
};


/***/ }),
/* 42 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



const safeBuffer = __webpack_require__(29);
const crypto = __webpack_require__(4);

const PerMessageDeflate = __webpack_require__(28);
const bufferUtil = __webpack_require__(33);
const ErrorCodes = __webpack_require__(41);
const constants = __webpack_require__(37);

const Buffer = safeBuffer.Buffer;

/**
 * HyBi Sender implementation.
 */
class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {net.Socket} socket The connection socket
   * @param {Object} extensions An object containing the negotiated extensions
   */
  constructor (socket, extensions) {
    this._extensions = extensions || {};
    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {Buffer} data The data to frame
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} options.readOnly Specifies whether `data` can be modified
   * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
   * @return {Buffer[]} The framed data as a list of `Buffer` instances
   * @public
   */
  static frame (data, options) {
    const merge = data.length < 1024 || (options.mask && options.readOnly);
    var offset = options.mask ? 6 : 2;
    var payloadLength = data.length;

    if (data.length >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (data.length > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? data.length + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    if (payloadLength === 126) {
      target.writeUInt16BE(data.length, 2, true);
    } else if (payloadLength === 127) {
      target.writeUInt32BE(0, 2, true);
      target.writeUInt32BE(data.length, 6, true);
    }

    if (!options.mask) {
      target[1] = payloadLength;
      if (merge) {
        data.copy(target, offset);
        return [target];
      }

      return [target, data];
    }

    const mask = crypto.randomBytes(4);

    target[1] = payloadLength | 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (merge) {
      bufferUtil.mask(data, mask, target, offset, data.length);
      return [target];
    }

    bufferUtil.mask(data, mask, data, 0, data.length);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {(Number|undefined)} code The status code component of the body
   * @param {String} data The message component of the body
   * @param {Boolean} mask Specifies whether or not to mask the message
   * @param {Function} cb Callback
   * @public
   */
  close (code, data, mask, cb) {
    var buf;

    if (code === undefined) {
      code = 1000;
    } else if (typeof code !== 'number' || !ErrorCodes.isValidErrorCode(code)) {
      throw new Error('first argument must be a valid error code number');
    }

    if (data === undefined || data === '') {
      if (code === 1000) {
        buf = constants.EMPTY_BUFFER;
      } else {
        buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(code, 0, true);
      }
    } else {
      buf = Buffer.allocUnsafe(2 + Buffer.byteLength(data));
      buf.writeUInt16BE(code, 0, true);
      buf.write(data, 2);
    }

    if (this._deflating) {
      this.enqueue([this.doClose, buf, mask, cb]);
    } else {
      this.doClose(buf, mask, cb);
    }
  }

  /**
   * Frames and sends a close message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @param {Function} cb Callback
   * @private
   */
  doClose (data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x08,
      mask,
      readOnly: false
    }), cb);
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @public
   */
  ping (data, mask) {
    var readOnly = true;

    if (!Buffer.isBuffer(data)) {
      if (data instanceof ArrayBuffer) {
        data = Buffer.from(data);
      } else if (ArrayBuffer.isView(data)) {
        data = viewToBuffer(data);
      } else {
        data = Buffer.from(data);
        readOnly = false;
      }
    }

    if (this._deflating) {
      this.enqueue([this.doPing, data, mask, readOnly]);
    } else {
      this.doPing(data, mask, readOnly);
    }
  }

  /**
   * Frames and sends a ping message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @param {Boolean} readOnly Specifies whether `data` can be modified
   * @private
   */
  doPing (data, mask, readOnly) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x09,
      mask,
      readOnly
    }));
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @public
   */
  pong (data, mask) {
    var readOnly = true;

    if (!Buffer.isBuffer(data)) {
      if (data instanceof ArrayBuffer) {
        data = Buffer.from(data);
      } else if (ArrayBuffer.isView(data)) {
        data = viewToBuffer(data);
      } else {
        data = Buffer.from(data);
        readOnly = false;
      }
    }

    if (this._deflating) {
      this.enqueue([this.doPong, data, mask, readOnly]);
    } else {
      this.doPong(data, mask, readOnly);
    }
  }

  /**
   * Frames and sends a pong message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @param {Boolean} readOnly Specifies whether `data` can be modified
   * @private
   */
  doPong (data, mask, readOnly) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x0a,
      mask,
      readOnly
    }));
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} options.compress Specifies whether or not to compress `data`
   * @param {Boolean} options.binary Specifies whether `data` is binary or text
   * @param {Boolean} options.fin Specifies whether the fragment is the last one
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Function} cb Callback
   * @public
   */
  send (data, options, cb) {
    var opcode = options.binary ? 2 : 1;
    var rsv1 = options.compress;
    var readOnly = true;

    if (!Buffer.isBuffer(data)) {
      if (data instanceof ArrayBuffer) {
        data = Buffer.from(data);
      } else if (ArrayBuffer.isView(data)) {
        data = viewToBuffer(data);
      } else {
        data = Buffer.from(data);
        readOnly = false;
      }
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    if (this._firstFragment) {
      this._firstFragment = false;
      if (rsv1 && perMessageDeflate) {
        rsv1 = data.length >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    if (perMessageDeflate) {
      const opts = {
        fin: options.fin,
        rsv1,
        opcode,
        mask: options.mask,
        readOnly
      };

      if (this._deflating) {
        this.enqueue([this.dispatch, data, this._compress, opts, cb]);
      } else {
        this.dispatch(data, this._compress, opts, cb);
      }
    } else {
      this.sendFrame(Sender.frame(data, {
        fin: options.fin,
        rsv1: false,
        opcode,
        mask: options.mask,
        readOnly
      }), cb);
    }
  }

  /**
   * Dispatches a data message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} compress Specifies whether or not to compress `data`
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} options.readOnly Specifies whether `data` can be modified
   * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
   * @param {Function} cb Callback
   * @private
   */
  dispatch (data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    this._deflating = true;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      options.readOnly = false;
      this.sendFrame(Sender.frame(buf, options), cb);
      this._deflating = false;
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue () {
    while (!this._deflating && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[1].length;
      params[0].apply(this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue (params) {
    this._bufferedBytes += params[1].length;
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {Buffer[]} list The frame to send
   * @param {Function} cb Callback
   * @private
   */
  sendFrame (list, cb) {
    if (list.length === 2) {
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
    } else {
      this._socket.write(list[0], cb);
    }
  }
}

module.exports = Sender;

/**
 * Converts an `ArrayBuffer` view into a buffer.
 *
 * @param {(DataView|TypedArray)} view The view to convert
 * @return {Buffer} Converted view
 * @private
 */
function viewToBuffer (view) {
  const buf = Buffer.from(view.buffer);

  if (view.byteLength !== view.buffer.byteLength) {
    return buf.slice(view.byteOffset, view.byteOffset + view.byteLength);
  }

  return buf;
}


/***/ }),
/* 43 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



const safeBuffer = __webpack_require__(29);
const EventEmitter = __webpack_require__(23);
const crypto = __webpack_require__(4);
const Ultron = __webpack_require__(24);
const http = __webpack_require__(26);
const url = __webpack_require__(27);

const PerMessageDeflate = __webpack_require__(28);
const Extensions = __webpack_require__(36);
const constants = __webpack_require__(37);
const WebSocket = __webpack_require__(22);

const Buffer = safeBuffer.Buffer;

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
   * @param {String} options.host The hostname where to bind the server
   * @param {Number} options.port The port where to bind the server
   * @param {http.Server} options.server A pre-created HTTP/S server to use
   * @param {Function} options.verifyClient An hook to reject connections
   * @param {Function} options.handleProtocols An hook to handle protocols
   * @param {String} options.path Accept only connections matching this path
   * @param {Boolean} options.noServer Enable no server mode
   * @param {Boolean} options.clientTracking Specifies whether or not to track clients
   * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
   * @param {Number} options.maxPayload The maximum allowed message size
   * @param {Function} callback A listener for the `listening` event
   */
  constructor (options, callback) {
    super();

    options = Object.assign({
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null
    }, options);

    if (options.port == null && !options.server && !options.noServer) {
      throw new TypeError('missing or invalid options');
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
      this._server.listen(options.port, options.host, options.backlog, callback);
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      this._ultron = new Ultron(this._server);
      this._ultron.on('listening', () => this.emit('listening'));
      this._ultron.on('error', (err) => this.emit('error', err));
      this._ultron.on('upgrade', (req, socket, head) => {
        this.handleUpgrade(req, socket, head, (client) => {
          this.emit('connection', client, req);
        });
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) this.clients = new Set();
    this.options = options;
  }

  /**
   * Close the server.
   *
   * @param {Function} cb Callback
   * @public
   */
  close (cb) {
    //
    // Terminate all associated clients.
    //
    if (this.clients) {
      for (const client of this.clients) client.terminate();
    }

    const server = this._server;

    if (server) {
      this._ultron.destroy();
      this._ultron = this._server = null;

      //
      // Close the http server if it was internally created.
      //
      if (this.options.port != null) return server.close(cb);
    }

    if (cb) cb();
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle (req) {
    if (this.options.path && url.parse(req.url).pathname !== this.options.path) {
      return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade (req, socket, head, cb) {
    socket.on('error', socketError);

    const version = +req.headers['sec-websocket-version'];
    const extensions = {};

    if (
      req.method !== 'GET' || req.headers.upgrade.toLowerCase() !== 'websocket' ||
      !req.headers['sec-websocket-key'] || (version !== 8 && version !== 13) ||
      !this.shouldHandle(req)
    ) {
      return abortConnection(socket, 400);
    }

    if (this.options.perMessageDeflate) {
      const perMessageDeflate = new PerMessageDeflate(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = Extensions.parse(
          req.headers['sec-websocket-extensions']
        );

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        return abortConnection(socket, 400);
      }
    }

    var protocol = (req.headers['sec-websocket-protocol'] || '').split(/, */);

    //
    // Optionally call external protocol selection handler.
    //
    if (this.options.handleProtocols) {
      protocol = this.options.handleProtocols(protocol, req);
      if (protocol === false) return abortConnection(socket, 401);
    } else {
      protocol = protocol[0];
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin: req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.connection.authorized || req.connection.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message) => {
          if (!verified) return abortConnection(socket, code || 401, message);

          this.completeUpgrade(
            protocol,
            extensions,
            version,
            req,
            socket,
            head,
            cb
          );
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortConnection(socket, 401);
    }

    this.completeUpgrade(protocol, extensions, version, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {String} protocol The chosen subprotocol
   * @param {Object} extensions The accepted extensions
   * @param {Number} version The WebSocket protocol version
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @private
   */
  completeUpgrade (protocol, extensions, version, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    const key = crypto.createHash('sha1')
      .update(req.headers['sec-websocket-key'] + constants.GUID, 'binary')
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${key}`
    ];

    if (protocol) headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = Extensions.format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));

    const client = new WebSocket([socket, head], null, {
      maxPayload: this.options.maxPayload,
      protocolVersion: version,
      extensions,
      protocol
    });

    if (this.clients) {
      this.clients.add(client);
      client.on('close', () => this.clients.delete(client));
    }

    socket.removeListener('error', socketError);
    cb(client);
  }
}

module.exports = WebSocketServer;

/**
 * Handle premature socket errors.
 *
 * @private
 */
function socketError () {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {net.Socket} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @private
 */
function abortConnection (socket, code, message) {
  if (socket.writable) {
    message = message || http.STATUS_CODES[code];
    socket.write(
      `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
      'Connection: close\r\n' +
      'Content-type: text/html\r\n' +
      `Content-Length: ${Buffer.byteLength(message)}\r\n` +
      '\r\n' +
      message
    );
  }

  socket.removeListener('error', socketError);
  socket.destroy();
}


/***/ }),
/* 44 */
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
/* 45 */
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
/* 46 */
/***/ ((module) => {

const WIDGET_SCRIPT_REFERENCES = Object.freeze({
  12: 'references/composition-scripting/widget-gradient.md',
  642: 'references/composition-scripting/widget-image.md',
  812: 'references/composition-scripting/widget-videoclip.md',
  822: 'references/composition-scripting/widget-web-page.md',
  1022: 'references/composition-scripting/widget-rectangle.md',
  1032: 'references/composition-scripting/widget-text.md',
  1052: 'references/composition-scripting/widget-circle.md',
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
  4758: 'references/composition-scripting/widget-metrictextstyle.md'
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
/* 47 */
/***/ ((module) => {

"use strict";
module.exports = require("./capture-composition-preview");

/***/ }),
/* 48 */
/***/ ((module) => {

"use strict";
module.exports = require("./ai-graphics-local");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
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
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop));
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	/* webpack/runtime/set anonymous default export name */
/******/ 	// set .name for anonymous default exports per ES spec
/******/ 	// skipped when the property is non-configurable (pre-ES2015 engines),
/******/ 	// where Object.defineProperty would throw
/******/ 	__webpack_require__.dn = (x) => {
/******/ 		var descriptor = Object.getOwnPropertyDescriptor(x, "name");
/******/ 		if (!descriptor || (!descriptor.writable && descriptor.configurable)) Object.defineProperty(x, "name", { value: "default", configurable: true });
/******/ 	};
/******/
/************************************************************************/
let __webpack_exports__ = {};
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
const credentialSelection = __webpack_require__(44);
const { parseImageSelectionCsv } = __webpack_require__(45);
const { createWidgetReferences } = __webpack_require__(46);

const DEFAULT_DEVICE_NAME = 'AI Agent';
const DEFAULT_SERVER_URL = 'https://beta.singular.live/';
const SKILL_VERSION = 134;
const PACKAGE_VERSION = '1.7.7';
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
  'preview',
  'replace',
  'reuse-existing'
]);
const GLOBAL_COMMAND_OPTIONS = ['server', 'compact', 'template-session', 'connection'];
const KNOWN_COMMANDS = new Set([
  'doctor',
  'pair', 'pair-intent', 'check-connection', 'start-work', 'wait-ready', 'finish-work', 'status', 'complete',
  'inspect', 'find-elements', 'composition-tree', 'resolve-references', 'script-handoff', 'control-composition',
  'timeline-link', 'set-timeline-link', 'logic-layers', 'set-logic-layer', 'rename-logic-layer',
  'create-composition', 'orchestrate', 'create-revision', 'list-revisions', 'read-revision', 'compare-revision',
  'restore-revision', 'delete-revision', 'delete-composition', 'open-composition', 'widget-subcompositions',
  'open-widget-subcomposition', 'update-table', 'update-grid', 'timeline2', 'display-variants',
  'configure-display-variants', 'activate-display-variant', 'set-display-variant-relevance', 'control-nodes',
  'metric-fonts', 'set-metric-font', 'upgrade-metric-widgets', 'widget-nodes', 'link-widget-nodes',
  'unlink-widget-nodes', 'set-control-value', 'set-control-font', 'create-table-control', 'set-table-control',
  'update-table-control', 'link-table-control', 'unlink-table-control', 'press-control', 'timer-action',
  'control-time', 'update-control', 'create-control-container', 'configure-control-container',
  'delete-control-container', 'create-control', 'create-controls', 'delete-control', 'get', 'get-many',
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
  if (!captureModule) captureModule = __webpack_require__(47);
  return captureModule;
}

function getAIGraphicsModule() {
  if (!aiGraphicsModule) aiGraphicsModule = __webpack_require__(48);
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

function getInstallationScope(skillRoot) {
  const normalizedRoot = path.resolve(skillRoot).toLowerCase();
  const globalRoots = [
    path.join(os.homedir(), '.agents', 'skills', 'composer'),
    path.join(os.homedir(), '.codex', 'skills', 'composer')
  ].map(function (candidate) { return path.resolve(candidate).toLowerCase(); });
  if (globalRoots.includes(normalizedRoot)) return 'global';
  return normalizedRoot.includes(path.normalize(`${path.sep}.agents${path.sep}skills${path.sep}composer`).toLowerCase())
    ? 'project'
    : 'custom';
}

function findSkillInstallations(selectedRoot) {
  const candidates = [];
  let current = path.resolve(process.cwd());
  while (true) {
    candidates.push(path.join(current, '.agents', 'skills', 'composer'));
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  candidates.push(path.join(os.homedir(), '.agents', 'skills', 'composer'));
  candidates.push(path.join(os.homedir(), '.codex', 'skills', 'composer'));

  const seen = new Set();
  return candidates.filter(function (candidate) {
    const normalized = path.resolve(candidate).toLowerCase();
    if (seen.has(normalized) || !fs.existsSync(path.join(candidate, 'SKILL.md'))) return false;
    seen.add(normalized);
    return true;
  }).map(function (candidate) {
    const root = path.resolve(candidate);
    const packagePath = path.join(root, 'package.json');
    let version = null;
    try {
      version = JSON.parse(fs.readFileSync(packagePath, 'utf8')).version || null;
    } catch (error) {}
    return {
      path: root,
      scope: getInstallationScope(root),
      packageVersion: version,
      selected: root.toLowerCase() === path.resolve(selectedRoot).toLowerCase()
    };
  });
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
  const selectedInstallation = {
    path: skillRoot,
    scope: getInstallationScope(skillRoot),
    packageVersion: installedPackage && installedPackage.version || PACKAGE_VERSION
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
    duplicateInstallations: installations.filter(function (installation) { return !installation.selected; }),
    effectiveRuntime: 'this command uses selectedInstallation; project skills override global skills when both are discovered',
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
      fields: (result.widget.fields || []).map(function (field) {
        // Dynamic effect choices/ranges cannot be recovered from primitives.
        if (result.widget.id === 4706 || result.widget.id === 4758) return field;
        return {
          id: field.id,
          title: field.title,
          type: field.type,
          runtime: field.runtime
        };
      }),
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

function writeWorkLifecycleReminder(command, succeeded) {
  if (!command || ['doctor', 'pair', 'pair-intent', 'check-connection', 'capture-worker', 'ai-graphics'].includes(command)) return;

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
  }
  return error;
}

async function pair(options) {
  preflightCredentialStorage();
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
    throw await createHttpError(response);
  }

  return finishPairing(server, await response.json());
}

async function pairIntent(options) {
  preflightCredentialStorage();
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
    const responseError = await createHttpError(response);
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
    message = `Installed Composer skill protocol ${SKILL_VERSION} could not determine the Composer protocol. Update Composer and install the matching skill before starting work.`;
  } else if (SKILL_VERSION > serverVersion) {
    message = `Installed Composer skill protocol ${SKILL_VERSION} is newer than Composer protocol ${serverVersion}. Update Composer to protocol ${SKILL_VERSION}, then reopen the paired composition; alternatively install a skill matching protocol ${serverVersion}.`;
  } else {
    message = `Composer protocol ${serverVersion} is newer than installed skill protocol ${SKILL_VERSION}. Install a skill matching protocol ${serverVersion}, then retry the connection.`;
  }
  const error = new Error(message);
  error.code = 'COMPOSER_AGENT_VERSION_MISMATCH';
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
  if (!['text', 'image', 'number', 'color'].includes(control.type)) {
    throw new Error(`${widgetLabel} template control "${control.id}" has unsupported type "${control.type}"`);
  }
  if ((control.type === 'text' || control.type === 'image') && typeof value !== 'string') {
    throw new Error(`${pathLabel} must be a string for ${control.type} control "${control.id}"`);
  }
  if (control.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error(`${pathLabel} must be a finite number for control "${control.id}"`);
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

  const tableContent = JSON.stringify({ content: specification.rows }, null, 2);
  if (Buffer.byteLength(tableContent, 'utf8') > MAX_TABLE_CONTENT_BYTES) {
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
        updates.some(update => verified.data[update.name] !== update.value)) {
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
        if (value !== update.previous &&
            (!attempted.includes(update) || restored.has(update.name) || value !== update.value)) {
          throw new Error('Recovery values conflict');
        }
      }
      return current;
    }
    try {
      let current = await readRecoveryState();
      for (const update of attempted.slice().reverse()) {
        if (current.data[update.name] !== update.previous) {
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
  return {
    target: target,
    compositionId: compositionId,
    outputPath: requireOption(options, 'output'),
    measurementsPath: options.measurements || null,
    waitMode: waitMode,
    timeoutMs: parseCaptureSeconds(options, 'timeout', 30, false) * 1000,
    settleMs: parseCaptureSeconds(
      options,
      'settle',
      waitMode === 'timed' ? 2 : 0,
      true
    ) * 1000,
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
      result = await sendSessionMessage({
        type: 'activity',
        message: requireOption(parsed.options, 'message')
      }, 'activity_sent');
      break;
    case 'start-work':
      result = await sendSessionMessage({ type: 'work_start' }, 'work_started');
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
      result = await sendSessionMessage({ type: 'work_finish' }, 'work_finished');
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
      assertAllowedOptions(parsed.options, ['composition-id', 'compact'], 'script-handoff');
      result = await createScriptHandoff(parsed.options);
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
        'reuse-existing',
        'source-composition', 'options-file', 'options-url', 'use-reload',
        'image-options-csv-file', 'image-options-csv', 'format',
        'family', 'weight', 'style', 'subset', 'font-source', 'compact'
      ], 'create-control');
      const type = requireOption(parsed.options, 'node-type');
      if (![
        'text', 'textarea', 'number', 'normalizednumber', 'counter', 'color',
        'image', 'checkbox', 'audio', 'video', 'data', 'jsonfile', 'json', 'datetime', 'location', 'selection', 'button', 'timecontrol', 'infotext', 'metricfont'
      ].includes(type)) {
        throw new Error(
          '--node-type must be "text", "textarea", "number", "normalizednumber", ' +
          '"counter", "color", "image", "checkbox", "audio", "video", "data", ' +
          '"jsonfile", "json", "datetime", "location", "selection", "button", "timecontrol", "infotext", or "metricfont"'
        );
      }
      const target = parsed.options.target || (parsed.options['element-id'] ? 'layout' : 'data');
      if (!['data', 'layout', 'standalone'].includes(target)) {
        throw new Error('--target must be "data", "layout", or "standalone"');
      }
      if (target === 'standalone' && !['button', 'timecontrol', 'metricfont'].includes(type)) {
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
            : type === 'timecontrol'
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
              target: control.target || (control.elementId ? 'layout' : 'data'),
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
        primitive: requireOption(parsed.options, 'primitive')
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
  writeWorkLifecycleReminder(invokedCommand, false);
  process.exitCode = 1;
});

})();

/******/ })()
;