"use strict";
/*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
!function (e, t) { "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).jsyaml = {}); }(this, (function (e) {
    "use strict";
    function t(e) { return null == e; }
    var n = { isNothing: t, isObject: function (e) { return "object" == typeof e && null !== e; }, toArray: function (e) { return Array.isArray(e) ? e : t(e) ? [] : [e]; }, repeat: function (e, t) { var n, i = ""; for (n = 0; n < t; n += 1)
            i += e; return i; }, isNegativeZero: function (e) { return 0 === e && Number.NEGATIVE_INFINITY === 1 / e; }, extend: function (e, t) { var n, i, r, o; if (t)
            for (n = 0, i = (o = Object.keys(t)).length; n < i; n += 1)
                e[r = o[n]] = t[r]; return e; } };
    function i(e, t) { var n = "", i = e.reason || "(unknown reason)"; return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += "\n\n" + e.mark.snippet), i + " " + n) : i; }
    function r(e, t) { Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = i(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = (new Error).stack || ""; }
    r.prototype = Object.create(Error.prototype), r.prototype.constructor = r, r.prototype.toString = function (e) { return this.name + ": " + i(this, e); };
    var o = r;
    function a(e, t, n, i, r) { var o = "", a = "", l = Math.floor(r / 2) - 1; return i - t > l && (t = i - l + (o = " ... ").length), n - i > l && (n = i + l - (a = " ...").length), { str: o + e.slice(t, n).replace(/\t/g, "→") + a, pos: i - t + o.length }; }
    function l(e, t) { return n.repeat(" ", t - e.length) + e; }
    var c = function (e, t) { if (t = Object.create(t || null), !e.buffer)
        return null; t.maxLength || (t.maxLength = 79), "number" != typeof t.indent && (t.indent = 1), "number" != typeof t.linesBefore && (t.linesBefore = 3), "number" != typeof t.linesAfter && (t.linesAfter = 2); for (var i, r = /\r?\n|\r|\0/g, o = [0], c = [], s = -1; i = r.exec(e.buffer);)
        c.push(i.index), o.push(i.index + i[0].length), e.position <= i.index && s < 0 && (s = o.length - 2); s < 0 && (s = o.length - 1); var u, p, f = "", d = Math.min(e.line + t.linesAfter, c.length).toString().length, h = t.maxLength - (t.indent + d + 3); for (u = 1; u <= t.linesBefore && !(s - u < 0); u++)
        p = a(e.buffer, o[s - u], c[s - u], e.position - (o[s] - o[s - u]), h), f = n.repeat(" ", t.indent) + l((e.line - u + 1).toString(), d) + " | " + p.str + "\n" + f; for (p = a(e.buffer, o[s], c[s], e.position, h), f += n.repeat(" ", t.indent) + l((e.line + 1).toString(), d) + " | " + p.str + "\n", f += n.repeat("-", t.indent + d + 3 + p.pos) + "^\n", u = 1; u <= t.linesAfter && !(s + u >= c.length); u++)
        p = a(e.buffer, o[s + u], c[s + u], e.position - (o[s] - o[s + u]), h), f += n.repeat(" ", t.indent) + l((e.line + u + 1).toString(), d) + " | " + p.str + "\n"; return f.replace(/\n$/, ""); }, s = ["kind", "multi", "resolve", "construct", "instanceOf", "predicate", "represent", "representName", "defaultStyle", "styleAliases"], u = ["scalar", "sequence", "mapping"];
    var p = function (e, t) { if (t = t || {}, Object.keys(t).forEach((function (t) { if (-1 === s.indexOf(t))
        throw new o('Unknown option "' + t + '" is met in definition of "' + e + '" YAML type.'); })), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function () { return !0; }, this.construct = t.construct || function (e) { return e; }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = function (e) { var t = {}; return null !== e && Object.keys(e).forEach((function (n) { e[n].forEach((function (e) { t[String(e)] = n; })); })), t; }(t.styleAliases || null), -1 === u.indexOf(this.kind))
        throw new o('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.'); };
    function f(e, t) { var n = []; return e[t].forEach((function (e) { var t = n.length; n.forEach((function (n, i) { n.tag === e.tag && n.kind === e.kind && n.multi === e.multi && (t = i); })), n[t] = e; })), n; }
    function d(e) { return this.extend(e); }
    d.prototype.extend = function (e) { var t = [], n = []; if (e instanceof p)
        n.push(e);
    else if (Array.isArray(e))
        n = n.concat(e);
    else {
        if (!e || !Array.isArray(e.implicit) && !Array.isArray(e.explicit))
            throw new o("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
        e.implicit && (t = t.concat(e.implicit)), e.explicit && (n = n.concat(e.explicit));
    } t.forEach((function (e) { if (!(e instanceof p))
        throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object."); if (e.loadKind && "scalar" !== e.loadKind)
        throw new o("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported."); if (e.multi)
        throw new o("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit."); })), n.forEach((function (e) { if (!(e instanceof p))
        throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object."); })); var i = Object.create(d.prototype); return i.implicit = (this.implicit || []).concat(t), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = f(i, "implicit"), i.compiledExplicit = f(i, "explicit"), i.compiledTypeMap = function () { var e, t, n = { scalar: {}, sequence: {}, mapping: {}, fallback: {}, multi: { scalar: [], sequence: [], mapping: [], fallback: [] } }; function i(e) { e.multi ? (n.multi[e.kind].push(e), n.multi.fallback.push(e)) : n[e.kind][e.tag] = n.fallback[e.tag] = e; } for (e = 0, t = arguments.length; e < t; e += 1)
        arguments[e].forEach(i); return n; }(i.compiledImplicit, i.compiledExplicit), i; };
    var h = d, g = new p("tag:yaml.org,2002:str", { kind: "scalar", construct: function (e) { return null !== e ? e : ""; } }), m = new p("tag:yaml.org,2002:seq", { kind: "sequence", construct: function (e) { return null !== e ? e : []; } }), y = new p("tag:yaml.org,2002:map", { kind: "mapping", construct: function (e) { return null !== e ? e : {}; } }), b = new h({ explicit: [g, m, y] });
    var A = new p("tag:yaml.org,2002:null", { kind: "scalar", resolve: function (e) { if (null === e)
            return !0; var t = e.length; return 1 === t && "~" === e || 4 === t && ("null" === e || "Null" === e || "NULL" === e); }, construct: function () { return null; }, predicate: function (e) { return null === e; }, represent: { canonical: function () { return "~"; }, lowercase: function () { return "null"; }, uppercase: function () { return "NULL"; }, camelcase: function () { return "Null"; }, empty: function () { return ""; } }, defaultStyle: "lowercase" });
    var v = new p("tag:yaml.org,2002:bool", { kind: "scalar", resolve: function (e) { if (null === e)
            return !1; var t = e.length; return 4 === t && ("true" === e || "True" === e || "TRUE" === e) || 5 === t && ("false" === e || "False" === e || "FALSE" === e); }, construct: function (e) { return "true" === e || "True" === e || "TRUE" === e; }, predicate: function (e) { return "[object Boolean]" === Object.prototype.toString.call(e); }, represent: { lowercase: function (e) { return e ? "true" : "false"; }, uppercase: function (e) { return e ? "TRUE" : "FALSE"; }, camelcase: function (e) { return e ? "True" : "False"; } }, defaultStyle: "lowercase" });
    function w(e) { return 48 <= e && e <= 55; }
    function k(e) { return 48 <= e && e <= 57; }
    var C = new p("tag:yaml.org,2002:int", { kind: "scalar", resolve: function (e) { if (null === e)
            return !1; var t, n, i = e.length, r = 0, o = !1; if (!i)
            return !1; if ("-" !== (t = e[r]) && "+" !== t || (t = e[++r]), "0" === t) {
            if (r + 1 === i)
                return !0;
            if ("b" === (t = e[++r])) {
                for (r++; r < i; r++)
                    if ("_" !== (t = e[r])) {
                        if ("0" !== t && "1" !== t)
                            return !1;
                        o = !0;
                    }
                return o && "_" !== t;
            }
            if ("x" === t) {
                for (r++; r < i; r++)
                    if ("_" !== (t = e[r])) {
                        if (!(48 <= (n = e.charCodeAt(r)) && n <= 57 || 65 <= n && n <= 70 || 97 <= n && n <= 102))
                            return !1;
                        o = !0;
                    }
                return o && "_" !== t;
            }
            if ("o" === t) {
                for (r++; r < i; r++)
                    if ("_" !== (t = e[r])) {
                        if (!w(e.charCodeAt(r)))
                            return !1;
                        o = !0;
                    }
                return o && "_" !== t;
            }
        } if ("_" === t)
            return !1; for (; r < i; r++)
            if ("_" !== (t = e[r])) {
                if (!k(e.charCodeAt(r)))
                    return !1;
                o = !0;
            } return !(!o || "_" === t); }, construct: function (e) { var t, n = e, i = 1; if (-1 !== n.indexOf("_") && (n = n.replace(/_/g, "")), "-" !== (t = n[0]) && "+" !== t || ("-" === t && (i = -1), t = (n = n.slice(1))[0]), "0" === n)
            return 0; if ("0" === t) {
            if ("b" === n[1])
                return i * parseInt(n.slice(2), 2);
            if ("x" === n[1])
                return i * parseInt(n.slice(2), 16);
            if ("o" === n[1])
                return i * parseInt(n.slice(2), 8);
        } return i * parseInt(n, 10); }, predicate: function (e) { return "[object Number]" === Object.prototype.toString.call(e) && e % 1 == 0 && !n.isNegativeZero(e); }, represent: { binary: function (e) { return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1); }, octal: function (e) { return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1); }, decimal: function (e) { return e.toString(10); }, hexadecimal: function (e) { return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1); } }, defaultStyle: "decimal", styleAliases: { binary: [2, "bin"], octal: [8, "oct"], decimal: [10, "dec"], hexadecimal: [16, "hex"] } }), x = new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
    var I = /^[-+]?[0-9]+e/;
    var S = new p("tag:yaml.org,2002:float", { kind: "scalar", resolve: function (e) { return null !== e && !(!x.test(e) || "_" === e[e.length - 1]); }, construct: function (e) { var t, n; return n = "-" === (t = e.replace(/_/g, "").toLowerCase())[0] ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), ".inf" === t ? 1 === n ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : ".nan" === t ? NaN : n * parseFloat(t, 10); }, predicate: function (e) { return "[object Number]" === Object.prototype.toString.call(e) && (e % 1 != 0 || n.isNegativeZero(e)); }, represent: function (e, t) { var i; if (isNaN(e))
            switch (t) {
                case "lowercase": return ".nan";
                case "uppercase": return ".NAN";
                case "camelcase": return ".NaN";
            }
        else if (Number.POSITIVE_INFINITY === e)
            switch (t) {
                case "lowercase": return ".inf";
                case "uppercase": return ".INF";
                case "camelcase": return ".Inf";
            }
        else if (Number.NEGATIVE_INFINITY === e)
            switch (t) {
                case "lowercase": return "-.inf";
                case "uppercase": return "-.INF";
                case "camelcase": return "-.Inf";
            }
        else if (n.isNegativeZero(e))
            return "-0.0"; return i = e.toString(10), I.test(i) ? i.replace("e", ".e") : i; }, defaultStyle: "lowercase" }), O = b.extend({ implicit: [A, v, C, S] }), j = O, T = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"), N = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");
    var F = new p("tag:yaml.org,2002:timestamp", { kind: "scalar", resolve: function (e) { return null !== e && (null !== T.exec(e) || null !== N.exec(e)); }, construct: function (e) { var t, n, i, r, o, a, l, c, s = 0, u = null; if (null === (t = T.exec(e)) && (t = N.exec(e)), null === t)
            throw new Error("Date resolve error"); if (n = +t[1], i = +t[2] - 1, r = +t[3], !t[4])
            return new Date(Date.UTC(n, i, r)); if (o = +t[4], a = +t[5], l = +t[6], t[7]) {
            for (s = t[7].slice(0, 3); s.length < 3;)
                s += "0";
            s = +s;
        } return t[9] && (u = 6e4 * (60 * +t[10] + +(t[11] || 0)), "-" === t[9] && (u = -u)), c = new Date(Date.UTC(n, i, r, o, a, l, s)), u && c.setTime(c.getTime() - u), c; }, instanceOf: Date, represent: function (e) { return e.toISOString(); } });
    var E = new p("tag:yaml.org,2002:merge", { kind: "scalar", resolve: function (e) { return "<<" === e || null === e; } }), M = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
    var L = new p("tag:yaml.org,2002:binary", { kind: "scalar", resolve: function (e) { if (null === e)
            return !1; var t, n, i = 0, r = e.length, o = M; for (n = 0; n < r; n++)
            if (!((t = o.indexOf(e.charAt(n))) > 64)) {
                if (t < 0)
                    return !1;
                i += 6;
            } return i % 8 == 0; }, construct: function (e) { var t, n, i = e.replace(/[\r\n=]/g, ""), r = i.length, o = M, a = 0, l = []; for (t = 0; t < r; t++)
            t % 4 == 0 && t && (l.push(a >> 16 & 255), l.push(a >> 8 & 255), l.push(255 & a)), a = a << 6 | o.indexOf(i.charAt(t)); return 0 === (n = r % 4 * 6) ? (l.push(a >> 16 & 255), l.push(a >> 8 & 255), l.push(255 & a)) : 18 === n ? (l.push(a >> 10 & 255), l.push(a >> 2 & 255)) : 12 === n && l.push(a >> 4 & 255), new Uint8Array(l); }, predicate: function (e) { return "[object Uint8Array]" === Object.prototype.toString.call(e); }, represent: function (e) { var t, n, i = "", r = 0, o = e.length, a = M; for (t = 0; t < o; t++)
            t % 3 == 0 && t && (i += a[r >> 18 & 63], i += a[r >> 12 & 63], i += a[r >> 6 & 63], i += a[63 & r]), r = (r << 8) + e[t]; return 0 === (n = o % 3) ? (i += a[r >> 18 & 63], i += a[r >> 12 & 63], i += a[r >> 6 & 63], i += a[63 & r]) : 2 === n ? (i += a[r >> 10 & 63], i += a[r >> 4 & 63], i += a[r << 2 & 63], i += a[64]) : 1 === n && (i += a[r >> 2 & 63], i += a[r << 4 & 63], i += a[64], i += a[64]), i; } }), _ = Object.prototype.hasOwnProperty, D = Object.prototype.toString;
    var U = new p("tag:yaml.org,2002:omap", { kind: "sequence", resolve: function (e) { if (null === e)
            return !0; var t, n, i, r, o, a = [], l = e; for (t = 0, n = l.length; t < n; t += 1) {
            if (i = l[t], o = !1, "[object Object]" !== D.call(i))
                return !1;
            for (r in i)
                if (_.call(i, r)) {
                    if (o)
                        return !1;
                    o = !0;
                }
            if (!o)
                return !1;
            if (-1 !== a.indexOf(r))
                return !1;
            a.push(r);
        } return !0; }, construct: function (e) { return null !== e ? e : []; } }), q = Object.prototype.toString;
    var Y = new p("tag:yaml.org,2002:pairs", { kind: "sequence", resolve: function (e) { if (null === e)
            return !0; var t, n, i, r, o, a = e; for (o = new Array(a.length), t = 0, n = a.length; t < n; t += 1) {
            if (i = a[t], "[object Object]" !== q.call(i))
                return !1;
            if (1 !== (r = Object.keys(i)).length)
                return !1;
            o[t] = [r[0], i[r[0]]];
        } return !0; }, construct: function (e) { if (null === e)
            return []; var t, n, i, r, o, a = e; for (o = new Array(a.length), t = 0, n = a.length; t < n; t += 1)
            i = a[t], r = Object.keys(i), o[t] = [r[0], i[r[0]]]; return o; } }), R = Object.prototype.hasOwnProperty;
    var B = new p("tag:yaml.org,2002:set", { kind: "mapping", resolve: function (e) { if (null === e)
            return !0; var t, n = e; for (t in n)
            if (R.call(n, t) && null !== n[t])
                return !1; return !0; }, construct: function (e) { return null !== e ? e : {}; } }), K = j.extend({ implicit: [F, E], explicit: [L, U, Y, B] }), P = Object.prototype.hasOwnProperty, W = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, H = /[\x85\u2028\u2029]/, $ = /[,\[\]\{\}]/, G = /^(?:!|!!|![a-z\-]+!)$/i, V = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
    function Z(e) { return Object.prototype.toString.call(e); }
    function J(e) { return 10 === e || 13 === e; }
    function Q(e) { return 9 === e || 32 === e; }
    function z(e) { return 9 === e || 32 === e || 10 === e || 13 === e; }
    function X(e) { return 44 === e || 91 === e || 93 === e || 123 === e || 125 === e; }
    function ee(e) { var t; return 48 <= e && e <= 57 ? e - 48 : 97 <= (t = 32 | e) && t <= 102 ? t - 97 + 10 : -1; }
    function te(e) { return 48 === e ? "\0" : 97 === e ? "" : 98 === e ? "\b" : 116 === e || 9 === e ? "\t" : 110 === e ? "\n" : 118 === e ? "\v" : 102 === e ? "\f" : 114 === e ? "\r" : 101 === e ? "" : 32 === e ? " " : 34 === e ? '"' : 47 === e ? "/" : 92 === e ? "\\" : 78 === e ? "" : 95 === e ? " " : 76 === e ? "\u2028" : 80 === e ? "\u2029" : ""; }
    function ne(e) { return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(55296 + (e - 65536 >> 10), 56320 + (e - 65536 & 1023)); }
    for (var ie = new Array(256), re = new Array(256), oe = 0; oe < 256; oe++)
        ie[oe] = te(oe) ? 1 : 0, re[oe] = te(oe);
    function ae(e, t) { this.input = e, this.filename = t.filename || null, this.schema = t.schema || K, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = []; }
    function le(e, t) { var n = { name: e.filename, buffer: e.input.slice(0, -1), position: e.position, line: e.line, column: e.position - e.lineStart }; return n.snippet = c(n), new o(t, n); }
    function ce(e, t) { throw le(e, t); }
    function se(e, t) { e.onWarning && e.onWarning.call(null, le(e, t)); }
    var ue = { YAML: function (e, t, n) { var i, r, o; null !== e.version && ce(e, "duplication of %YAML directive"), 1 !== n.length && ce(e, "YAML directive accepts exactly one argument"), null === (i = /^([0-9]+)\.([0-9]+)$/.exec(n[0])) && ce(e, "ill-formed argument of the YAML directive"), r = parseInt(i[1], 10), o = parseInt(i[2], 10), 1 !== r && ce(e, "unacceptable YAML version of the document"), e.version = n[0], e.checkLineBreaks = o < 2, 1 !== o && 2 !== o && se(e, "unsupported YAML version of the document"); }, TAG: function (e, t, n) { var i, r; 2 !== n.length && ce(e, "TAG directive accepts exactly two arguments"), i = n[0], r = n[1], G.test(i) || ce(e, "ill-formed tag handle (first argument) of the TAG directive"), P.call(e.tagMap, i) && ce(e, 'there is a previously declared suffix for "' + i + '" tag handle'), V.test(r) || ce(e, "ill-formed tag prefix (second argument) of the TAG directive"); try {
            r = decodeURIComponent(r);
        }
        catch (t) {
            ce(e, "tag prefix is malformed: " + r);
        } e.tagMap[i] = r; } };
    function pe(e, t, n, i) { var r, o, a, l; if (t < n) {
        if (l = e.input.slice(t, n), i)
            for (r = 0, o = l.length; r < o; r += 1)
                9 === (a = l.charCodeAt(r)) || 32 <= a && a <= 1114111 || ce(e, "expected valid JSON character");
        else
            W.test(l) && ce(e, "the stream contains non-printable characters");
        e.result += l;
    } }
    function fe(e, t, i, r) { var o, a, l, c; for (n.isObject(i) || ce(e, "cannot merge mappings; the provided source object is unacceptable"), l = 0, c = (o = Object.keys(i)).length; l < c; l += 1)
        a = o[l], P.call(t, a) || (t[a] = i[a], r[a] = !0); }
    function de(e, t, n, i, r, o, a, l, c) { var s, u; if (Array.isArray(r))
        for (s = 0, u = (r = Array.prototype.slice.call(r)).length; s < u; s += 1)
            Array.isArray(r[s]) && ce(e, "nested arrays are not supported inside keys"), "object" == typeof r && "[object Object]" === Z(r[s]) && (r[s] = "[object Object]"); if ("object" == typeof r && "[object Object]" === Z(r) && (r = "[object Object]"), r = String(r), null === t && (t = {}), "tag:yaml.org,2002:merge" === i)
        if (Array.isArray(o))
            for (s = 0, u = o.length; s < u; s += 1)
                fe(e, t, o[s], n);
        else
            fe(e, t, o, n);
    else
        e.json || P.call(n, r) || !P.call(t, r) || (e.line = a || e.line, e.lineStart = l || e.lineStart, e.position = c || e.position, ce(e, "duplicated mapping key")), "__proto__" === r ? Object.defineProperty(t, r, { configurable: !0, enumerable: !0, writable: !0, value: o }) : t[r] = o, delete n[r]; return t; }
    function he(e) { var t; 10 === (t = e.input.charCodeAt(e.position)) ? e.position++ : 13 === t ? (e.position++, 10 === e.input.charCodeAt(e.position) && e.position++) : ce(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1; }
    function ge(e, t, n) { for (var i = 0, r = e.input.charCodeAt(e.position); 0 !== r;) {
        for (; Q(r);)
            9 === r && -1 === e.firstTabInLine && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
        if (t && 35 === r)
            do {
                r = e.input.charCodeAt(++e.position);
            } while (10 !== r && 13 !== r && 0 !== r);
        if (!J(r))
            break;
        for (he(e), r = e.input.charCodeAt(e.position), i++, e.lineIndent = 0; 32 === r;)
            e.lineIndent++, r = e.input.charCodeAt(++e.position);
    } return -1 !== n && 0 !== i && e.lineIndent < n && se(e, "deficient indentation"), i; }
    function me(e) { var t, n = e.position; return !(45 !== (t = e.input.charCodeAt(n)) && 46 !== t || t !== e.input.charCodeAt(n + 1) || t !== e.input.charCodeAt(n + 2) || (n += 3, 0 !== (t = e.input.charCodeAt(n)) && !z(t))); }
    function ye(e, t) { 1 === t ? e.result += " " : t > 1 && (e.result += n.repeat("\n", t - 1)); }
    function be(e, t) { var n, i, r = e.tag, o = e.anchor, a = [], l = !1; if (-1 !== e.firstTabInLine)
        return !1; for (null !== e.anchor && (e.anchorMap[e.anchor] = a), i = e.input.charCodeAt(e.position); 0 !== i && (-1 !== e.firstTabInLine && (e.position = e.firstTabInLine, ce(e, "tab characters must not be used in indentation")), 45 === i) && z(e.input.charCodeAt(e.position + 1));)
        if (l = !0, e.position++, ge(e, !0, -1) && e.lineIndent <= t)
            a.push(null), i = e.input.charCodeAt(e.position);
        else if (n = e.line, we(e, t, 3, !1, !0), a.push(e.result), ge(e, !0, -1), i = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && 0 !== i)
            ce(e, "bad indentation of a sequence entry");
        else if (e.lineIndent < t)
            break; return !!l && (e.tag = r, e.anchor = o, e.kind = "sequence", e.result = a, !0); }
    function Ae(e) { var t, n, i, r, o = !1, a = !1; if (33 !== (r = e.input.charCodeAt(e.position)))
        return !1; if (null !== e.tag && ce(e, "duplication of a tag property"), 60 === (r = e.input.charCodeAt(++e.position)) ? (o = !0, r = e.input.charCodeAt(++e.position)) : 33 === r ? (a = !0, n = "!!", r = e.input.charCodeAt(++e.position)) : n = "!", t = e.position, o) {
        do {
            r = e.input.charCodeAt(++e.position);
        } while (0 !== r && 62 !== r);
        e.position < e.length ? (i = e.input.slice(t, e.position), r = e.input.charCodeAt(++e.position)) : ce(e, "unexpected end of the stream within a verbatim tag");
    }
    else {
        for (; 0 !== r && !z(r);)
            33 === r && (a ? ce(e, "tag suffix cannot contain exclamation marks") : (n = e.input.slice(t - 1, e.position + 1), G.test(n) || ce(e, "named tag handle cannot contain such characters"), a = !0, t = e.position + 1)), r = e.input.charCodeAt(++e.position);
        i = e.input.slice(t, e.position), $.test(i) && ce(e, "tag suffix cannot contain flow indicator characters");
    } i && !V.test(i) && ce(e, "tag name cannot contain such characters: " + i); try {
        i = decodeURIComponent(i);
    }
    catch (t) {
        ce(e, "tag name is malformed: " + i);
    } return o ? e.tag = i : P.call(e.tagMap, n) ? e.tag = e.tagMap[n] + i : "!" === n ? e.tag = "!" + i : "!!" === n ? e.tag = "tag:yaml.org,2002:" + i : ce(e, 'undeclared tag handle "' + n + '"'), !0; }
    function ve(e) { var t, n; if (38 !== (n = e.input.charCodeAt(e.position)))
        return !1; for (null !== e.anchor && ce(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; 0 !== n && !z(n) && !X(n);)
        n = e.input.charCodeAt(++e.position); return e.position === t && ce(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0; }
    function we(e, t, i, r, o) { var a, l, c, s, u, p, f, d, h, g = 1, m = !1, y = !1; if (null !== e.listener && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, a = l = c = 4 === i || 3 === i, r && ge(e, !0, -1) && (m = !0, e.lineIndent > t ? g = 1 : e.lineIndent === t ? g = 0 : e.lineIndent < t && (g = -1)), 1 === g)
        for (; Ae(e) || ve(e);)
            ge(e, !0, -1) ? (m = !0, c = a, e.lineIndent > t ? g = 1 : e.lineIndent === t ? g = 0 : e.lineIndent < t && (g = -1)) : c = !1; if (c && (c = m || o), 1 !== g && 4 !== i || (d = 1 === i || 2 === i ? t : t + 1, h = e.position - e.lineStart, 1 === g ? c && (be(e, h) || function (e, t, n) { var i, r, o, a, l, c, s, u = e.tag, p = e.anchor, f = {}, d = Object.create(null), h = null, g = null, m = null, y = !1, b = !1; if (-1 !== e.firstTabInLine)
        return !1; for (null !== e.anchor && (e.anchorMap[e.anchor] = f), s = e.input.charCodeAt(e.position); 0 !== s;) {
        if (y || -1 === e.firstTabInLine || (e.position = e.firstTabInLine, ce(e, "tab characters must not be used in indentation")), i = e.input.charCodeAt(e.position + 1), o = e.line, 63 !== s && 58 !== s || !z(i)) {
            if (a = e.line, l = e.lineStart, c = e.position, !we(e, n, 2, !1, !0))
                break;
            if (e.line === o) {
                for (s = e.input.charCodeAt(e.position); Q(s);)
                    s = e.input.charCodeAt(++e.position);
                if (58 === s)
                    z(s = e.input.charCodeAt(++e.position)) || ce(e, "a whitespace character is expected after the key-value separator within a block mapping"), y && (de(e, f, d, h, g, null, a, l, c), h = g = m = null), b = !0, y = !1, r = !1, h = e.tag, g = e.result;
                else {
                    if (!b)
                        return e.tag = u, e.anchor = p, !0;
                    ce(e, "can not read an implicit mapping pair; a colon is missed");
                }
            }
            else {
                if (!b)
                    return e.tag = u, e.anchor = p, !0;
                ce(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
            }
        }
        else
            63 === s ? (y && (de(e, f, d, h, g, null, a, l, c), h = g = m = null), b = !0, y = !0, r = !0) : y ? (y = !1, r = !0) : ce(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, s = i;
        if ((e.line === o || e.lineIndent > t) && (y && (a = e.line, l = e.lineStart, c = e.position), we(e, t, 4, !0, r) && (y ? g = e.result : m = e.result), y || (de(e, f, d, h, g, m, a, l, c), h = g = m = null), ge(e, !0, -1), s = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && 0 !== s)
            ce(e, "bad indentation of a mapping entry");
        else if (e.lineIndent < t)
            break;
    } return y && de(e, f, d, h, g, null, a, l, c), b && (e.tag = u, e.anchor = p, e.kind = "mapping", e.result = f), b; }(e, h, d)) || function (e, t) { var n, i, r, o, a, l, c, s, u, p, f, d, h = !0, g = e.tag, m = e.anchor, y = Object.create(null); if (91 === (d = e.input.charCodeAt(e.position)))
        a = 93, s = !1, o = [];
    else {
        if (123 !== d)
            return !1;
        a = 125, s = !0, o = {};
    } for (null !== e.anchor && (e.anchorMap[e.anchor] = o), d = e.input.charCodeAt(++e.position); 0 !== d;) {
        if (ge(e, !0, t), (d = e.input.charCodeAt(e.position)) === a)
            return e.position++, e.tag = g, e.anchor = m, e.kind = s ? "mapping" : "sequence", e.result = o, !0;
        h ? 44 === d && ce(e, "expected the node content, but found ','") : ce(e, "missed comma between flow collection entries"), f = null, l = c = !1, 63 === d && z(e.input.charCodeAt(e.position + 1)) && (l = c = !0, e.position++, ge(e, !0, t)), n = e.line, i = e.lineStart, r = e.position, we(e, t, 1, !1, !0), p = e.tag, u = e.result, ge(e, !0, t), d = e.input.charCodeAt(e.position), !c && e.line !== n || 58 !== d || (l = !0, d = e.input.charCodeAt(++e.position), ge(e, !0, t), we(e, t, 1, !1, !0), f = e.result), s ? de(e, o, y, p, u, f, n, i, r) : l ? o.push(de(e, null, y, p, u, f, n, i, r)) : o.push(u), ge(e, !0, t), 44 === (d = e.input.charCodeAt(e.position)) ? (h = !0, d = e.input.charCodeAt(++e.position)) : h = !1;
    } ce(e, "unexpected end of the stream within a flow collection"); }(e, d) ? y = !0 : (l && function (e, t) { var i, r, o, a, l, c = 1, s = !1, u = !1, p = t, f = 0, d = !1; if (124 === (a = e.input.charCodeAt(e.position)))
        r = !1;
    else {
        if (62 !== a)
            return !1;
        r = !0;
    } for (e.kind = "scalar", e.result = ""; 0 !== a;)
        if (43 === (a = e.input.charCodeAt(++e.position)) || 45 === a)
            1 === c ? c = 43 === a ? 3 : 2 : ce(e, "repeat of a chomping mode identifier");
        else {
            if (!((o = 48 <= (l = a) && l <= 57 ? l - 48 : -1) >= 0))
                break;
            0 === o ? ce(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : u ? ce(e, "repeat of an indentation width identifier") : (p = t + o - 1, u = !0);
        } if (Q(a)) {
        do {
            a = e.input.charCodeAt(++e.position);
        } while (Q(a));
        if (35 === a)
            do {
                a = e.input.charCodeAt(++e.position);
            } while (!J(a) && 0 !== a);
    } for (; 0 !== a;) {
        for (he(e), e.lineIndent = 0, a = e.input.charCodeAt(e.position); (!u || e.lineIndent < p) && 32 === a;)
            e.lineIndent++, a = e.input.charCodeAt(++e.position);
        if (!u && e.lineIndent > p && (p = e.lineIndent), J(a))
            f++;
        else {
            if (e.lineIndent < p) {
                3 === c ? e.result += n.repeat("\n", s ? 1 + f : f) : 1 === c && s && (e.result += "\n");
                break;
            }
            for (r ? Q(a) ? (d = !0, e.result += n.repeat("\n", s ? 1 + f : f)) : d ? (d = !1, e.result += n.repeat("\n", f + 1)) : 0 === f ? s && (e.result += " ") : e.result += n.repeat("\n", f) : e.result += n.repeat("\n", s ? 1 + f : f), s = !0, u = !0, f = 0, i = e.position; !J(a) && 0 !== a;)
                a = e.input.charCodeAt(++e.position);
            pe(e, i, e.position, !1);
        }
    } return !0; }(e, d) || function (e, t) { var n, i, r; if (39 !== (n = e.input.charCodeAt(e.position)))
        return !1; for (e.kind = "scalar", e.result = "", e.position++, i = r = e.position; 0 !== (n = e.input.charCodeAt(e.position));)
        if (39 === n) {
            if (pe(e, i, e.position, !0), 39 !== (n = e.input.charCodeAt(++e.position)))
                return !0;
            i = e.position, e.position++, r = e.position;
        }
        else
            J(n) ? (pe(e, i, r, !0), ye(e, ge(e, !1, t)), i = r = e.position) : e.position === e.lineStart && me(e) ? ce(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position); ce(e, "unexpected end of the stream within a single quoted scalar"); }(e, d) || function (e, t) { var n, i, r, o, a, l, c; if (34 !== (l = e.input.charCodeAt(e.position)))
        return !1; for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; 0 !== (l = e.input.charCodeAt(e.position));) {
        if (34 === l)
            return pe(e, n, e.position, !0), e.position++, !0;
        if (92 === l) {
            if (pe(e, n, e.position, !0), J(l = e.input.charCodeAt(++e.position)))
                ge(e, !1, t);
            else if (l < 256 && ie[l])
                e.result += re[l], e.position++;
            else if ((a = 120 === (c = l) ? 2 : 117 === c ? 4 : 85 === c ? 8 : 0) > 0) {
                for (r = a, o = 0; r > 0; r--)
                    (a = ee(l = e.input.charCodeAt(++e.position))) >= 0 ? o = (o << 4) + a : ce(e, "expected hexadecimal character");
                e.result += ne(o), e.position++;
            }
            else
                ce(e, "unknown escape sequence");
            n = i = e.position;
        }
        else
            J(l) ? (pe(e, n, i, !0), ye(e, ge(e, !1, t)), n = i = e.position) : e.position === e.lineStart && me(e) ? ce(e, "unexpected end of the document within a double quoted scalar") : (e.position++, i = e.position);
    } ce(e, "unexpected end of the stream within a double quoted scalar"); }(e, d) ? y = !0 : !function (e) { var t, n, i; if (42 !== (i = e.input.charCodeAt(e.position)))
        return !1; for (i = e.input.charCodeAt(++e.position), t = e.position; 0 !== i && !z(i) && !X(i);)
        i = e.input.charCodeAt(++e.position); return e.position === t && ce(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), P.call(e.anchorMap, n) || ce(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], ge(e, !0, -1), !0; }(e) ? function (e, t, n) { var i, r, o, a, l, c, s, u, p = e.kind, f = e.result; if (z(u = e.input.charCodeAt(e.position)) || X(u) || 35 === u || 38 === u || 42 === u || 33 === u || 124 === u || 62 === u || 39 === u || 34 === u || 37 === u || 64 === u || 96 === u)
        return !1; if ((63 === u || 45 === u) && (z(i = e.input.charCodeAt(e.position + 1)) || n && X(i)))
        return !1; for (e.kind = "scalar", e.result = "", r = o = e.position, a = !1; 0 !== u;) {
        if (58 === u) {
            if (z(i = e.input.charCodeAt(e.position + 1)) || n && X(i))
                break;
        }
        else if (35 === u) {
            if (z(e.input.charCodeAt(e.position - 1)))
                break;
        }
        else {
            if (e.position === e.lineStart && me(e) || n && X(u))
                break;
            if (J(u)) {
                if (l = e.line, c = e.lineStart, s = e.lineIndent, ge(e, !1, -1), e.lineIndent >= t) {
                    a = !0, u = e.input.charCodeAt(e.position);
                    continue;
                }
                e.position = o, e.line = l, e.lineStart = c, e.lineIndent = s;
                break;
            }
        }
        a && (pe(e, r, o, !1), ye(e, e.line - l), r = o = e.position, a = !1), Q(u) || (o = e.position + 1), u = e.input.charCodeAt(++e.position);
    } return pe(e, r, o, !1), !!e.result || (e.kind = p, e.result = f, !1); }(e, d, 1 === i) && (y = !0, null === e.tag && (e.tag = "?")) : (y = !0, null === e.tag && null === e.anchor || ce(e, "alias node should not have any properties")), null !== e.anchor && (e.anchorMap[e.anchor] = e.result)) : 0 === g && (y = c && be(e, h))), null === e.tag)
        null !== e.anchor && (e.anchorMap[e.anchor] = e.result);
    else if ("?" === e.tag) {
        for (null !== e.result && "scalar" !== e.kind && ce(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), s = 0, u = e.implicitTypes.length; s < u; s += 1)
            if ((f = e.implicitTypes[s]).resolve(e.result)) {
                e.result = f.construct(e.result), e.tag = f.tag, null !== e.anchor && (e.anchorMap[e.anchor] = e.result);
                break;
            }
    }
    else if ("!" !== e.tag) {
        if (P.call(e.typeMap[e.kind || "fallback"], e.tag))
            f = e.typeMap[e.kind || "fallback"][e.tag];
        else
            for (f = null, s = 0, u = (p = e.typeMap.multi[e.kind || "fallback"]).length; s < u; s += 1)
                if (e.tag.slice(0, p[s].tag.length) === p[s].tag) {
                    f = p[s];
                    break;
                }
        f || ce(e, "unknown tag !<" + e.tag + ">"), null !== e.result && f.kind !== e.kind && ce(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + f.kind + '", not "' + e.kind + '"'), f.resolve(e.result, e.tag) ? (e.result = f.construct(e.result, e.tag), null !== e.anchor && (e.anchorMap[e.anchor] = e.result)) : ce(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
    } return null !== e.listener && e.listener("close", e), null !== e.tag || null !== e.anchor || y; }
    function ke(e) { var t, n, i, r, o = e.position, a = !1; for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = Object.create(null), e.anchorMap = Object.create(null); 0 !== (r = e.input.charCodeAt(e.position)) && (ge(e, !0, -1), r = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || 37 !== r));) {
        for (a = !0, r = e.input.charCodeAt(++e.position), t = e.position; 0 !== r && !z(r);)
            r = e.input.charCodeAt(++e.position);
        for (i = [], (n = e.input.slice(t, e.position)).length < 1 && ce(e, "directive name must not be less than one character in length"); 0 !== r;) {
            for (; Q(r);)
                r = e.input.charCodeAt(++e.position);
            if (35 === r) {
                do {
                    r = e.input.charCodeAt(++e.position);
                } while (0 !== r && !J(r));
                break;
            }
            if (J(r))
                break;
            for (t = e.position; 0 !== r && !z(r);)
                r = e.input.charCodeAt(++e.position);
            i.push(e.input.slice(t, e.position));
        }
        0 !== r && he(e), P.call(ue, n) ? ue[n](e, n, i) : se(e, 'unknown document directive "' + n + '"');
    } ge(e, !0, -1), 0 === e.lineIndent && 45 === e.input.charCodeAt(e.position) && 45 === e.input.charCodeAt(e.position + 1) && 45 === e.input.charCodeAt(e.position + 2) ? (e.position += 3, ge(e, !0, -1)) : a && ce(e, "directives end mark is expected"), we(e, e.lineIndent - 1, 4, !1, !0), ge(e, !0, -1), e.checkLineBreaks && H.test(e.input.slice(o, e.position)) && se(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && me(e) ? 46 === e.input.charCodeAt(e.position) && (e.position += 3, ge(e, !0, -1)) : e.position < e.length - 1 && ce(e, "end of the stream or a document separator is expected"); }
    function Ce(e, t) { t = t || {}, 0 !== (e = String(e)).length && (10 !== e.charCodeAt(e.length - 1) && 13 !== e.charCodeAt(e.length - 1) && (e += "\n"), 65279 === e.charCodeAt(0) && (e = e.slice(1))); var n = new ae(e, t), i = e.indexOf("\0"); for (-1 !== i && (n.position = i, ce(n, "null byte is not allowed in input")), n.input += "\0"; 32 === n.input.charCodeAt(n.position);)
        n.lineIndent += 1, n.position += 1; for (; n.position < n.length - 1;)
        ke(n); return n.documents; }
    var xe = { loadAll: function (e, t, n) { null !== t && "object" == typeof t && void 0 === n && (n = t, t = null); var i = Ce(e, n); if ("function" != typeof t)
            return i; for (var r = 0, o = i.length; r < o; r += 1)
            t(i[r]); }, load: function (e, t) { var n = Ce(e, t); if (0 !== n.length) {
            if (1 === n.length)
                return n[0];
            throw new o("expected a single document in the stream, but found more");
        } } }, Ie = Object.prototype.toString, Se = Object.prototype.hasOwnProperty, Oe = 65279, je = { 0: "\\0", 7: "\\a", 8: "\\b", 9: "\\t", 10: "\\n", 11: "\\v", 12: "\\f", 13: "\\r", 27: "\\e", 34: '\\"', 92: "\\\\", 133: "\\N", 160: "\\_", 8232: "\\L", 8233: "\\P" }, Te = ["y", "Y", "yes", "Yes", "YES", "on", "On", "ON", "n", "N", "no", "No", "NO", "off", "Off", "OFF"], Ne = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
    function Fe(e) { var t, i, r; if (t = e.toString(16).toUpperCase(), e <= 255)
        i = "x", r = 2;
    else if (e <= 65535)
        i = "u", r = 4;
    else {
        if (!(e <= 4294967295))
            throw new o("code point within a string may not be greater than 0xFFFFFFFF");
        i = "U", r = 8;
    } return "\\" + i + n.repeat("0", r - t.length) + t; }
    function Ee(e) { this.schema = e.schema || K, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = n.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = function (e, t) { var n, i, r, o, a, l, c; if (null === t)
        return {}; for (n = {}, r = 0, o = (i = Object.keys(t)).length; r < o; r += 1)
        a = i[r], l = String(t[a]), "!!" === a.slice(0, 2) && (a = "tag:yaml.org,2002:" + a.slice(2)), (c = e.compiledTypeMap.fallback[a]) && Se.call(c.styleAliases, l) && (l = c.styleAliases[l]), n[a] = l; return n; }(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = '"' === e.quotingType ? 2 : 1, this.forceQuotes = e.forceQuotes || !1, this.replacer = "function" == typeof e.replacer ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null; }
    function Me(e, t) { for (var i, r = n.repeat(" ", t), o = 0, a = -1, l = "", c = e.length; o < c;)
        -1 === (a = e.indexOf("\n", o)) ? (i = e.slice(o), o = c) : (i = e.slice(o, a + 1), o = a + 1), i.length && "\n" !== i && (l += r), l += i; return l; }
    function Le(e, t) { return "\n" + n.repeat(" ", e.indent * t); }
    function _e(e) { return 32 === e || 9 === e; }
    function De(e) { return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && 8232 !== e && 8233 !== e || 57344 <= e && e <= 65533 && e !== Oe || 65536 <= e && e <= 1114111; }
    function Ue(e) { return De(e) && e !== Oe && 13 !== e && 10 !== e; }
    function qe(e, t, n) { var i = Ue(e), r = i && !_e(e); return (n ? i : i && 44 !== e && 91 !== e && 93 !== e && 123 !== e && 125 !== e) && 35 !== e && !(58 === t && !r) || Ue(t) && !_e(t) && 35 === e || 58 === t && r; }
    function Ye(e, t) { var n, i = e.charCodeAt(t); return i >= 55296 && i <= 56319 && t + 1 < e.length && (n = e.charCodeAt(t + 1)) >= 56320 && n <= 57343 ? 1024 * (i - 55296) + n - 56320 + 65536 : i; }
    function Re(e) { return /^\n* /.test(e); }
    function Be(e, t, n, i, r, o, a, l) { var c, s, u = 0, p = null, f = !1, d = !1, h = -1 !== i, g = -1, m = De(s = Ye(e, 0)) && s !== Oe && !_e(s) && 45 !== s && 63 !== s && 58 !== s && 44 !== s && 91 !== s && 93 !== s && 123 !== s && 125 !== s && 35 !== s && 38 !== s && 42 !== s && 33 !== s && 124 !== s && 61 !== s && 62 !== s && 39 !== s && 34 !== s && 37 !== s && 64 !== s && 96 !== s && function (e) { return !_e(e) && 58 !== e; }(Ye(e, e.length - 1)); if (t || a)
        for (c = 0; c < e.length; u >= 65536 ? c += 2 : c++) {
            if (!De(u = Ye(e, c)))
                return 5;
            m = m && qe(u, p, l), p = u;
        }
    else {
        for (c = 0; c < e.length; u >= 65536 ? c += 2 : c++) {
            if (10 === (u = Ye(e, c)))
                f = !0, h && (d = d || c - g - 1 > i && " " !== e[g + 1], g = c);
            else if (!De(u))
                return 5;
            m = m && qe(u, p, l), p = u;
        }
        d = d || h && c - g - 1 > i && " " !== e[g + 1];
    } return f || d ? n > 9 && Re(e) ? 5 : a ? 2 === o ? 5 : 2 : d ? 4 : 3 : !m || a || r(e) ? 2 === o ? 5 : 2 : 1; }
    function Ke(e, t, n, i, r) { e.dump = function () { if (0 === t.length)
        return 2 === e.quotingType ? '""' : "''"; if (!e.noCompatMode && (-1 !== Te.indexOf(t) || Ne.test(t)))
        return 2 === e.quotingType ? '"' + t + '"' : "'" + t + "'"; var a = e.indent * Math.max(1, n), l = -1 === e.lineWidth ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - a), c = i || e.flowLevel > -1 && n >= e.flowLevel; switch (Be(t, c, e.indent, l, (function (t) { return function (e, t) { var n, i; for (n = 0, i = e.implicitTypes.length; n < i; n += 1)
        if (e.implicitTypes[n].resolve(t))
            return !0; return !1; }(e, t); }), e.quotingType, e.forceQuotes && !i, r)) {
        case 1: return t;
        case 2: return "'" + t.replace(/'/g, "''") + "'";
        case 3: return "|" + Pe(t, e.indent) + We(Me(t, a));
        case 4: return ">" + Pe(t, e.indent) + We(Me(function (e, t) { var n, i, r = /(\n+)([^\n]*)/g, o = (l = e.indexOf("\n"), l = -1 !== l ? l : e.length, r.lastIndex = l, He(e.slice(0, l), t)), a = "\n" === e[0] || " " === e[0]; var l; for (; i = r.exec(e);) {
            var c = i[1], s = i[2];
            n = " " === s[0], o += c + (a || n || "" === s ? "" : "\n") + He(s, t), a = n;
        } return o; }(t, l), a));
        case 5: return '"' + function (e) { for (var t, n = "", i = 0, r = 0; r < e.length; i >= 65536 ? r += 2 : r++)
            i = Ye(e, r), !(t = je[i]) && De(i) ? (n += e[r], i >= 65536 && (n += e[r + 1])) : n += t || Fe(i); return n; }(t) + '"';
        default: throw new o("impossible error: invalid scalar style");
    } }(); }
    function Pe(e, t) { var n = Re(e) ? String(t) : "", i = "\n" === e[e.length - 1]; return n + (i && ("\n" === e[e.length - 2] || "\n" === e) ? "+" : i ? "" : "-") + "\n"; }
    function We(e) { return "\n" === e[e.length - 1] ? e.slice(0, -1) : e; }
    function He(e, t) { if ("" === e || " " === e[0])
        return e; for (var n, i, r = / [^ ]/g, o = 0, a = 0, l = 0, c = ""; n = r.exec(e);)
        (l = n.index) - o > t && (i = a > o ? a : l, c += "\n" + e.slice(o, i), o = i + 1), a = l; return c += "\n", e.length - o > t && a > o ? c += e.slice(o, a) + "\n" + e.slice(a + 1) : c += e.slice(o), c.slice(1); }
    function $e(e, t, n, i) { var r, o, a, l = "", c = e.tag; for (r = 0, o = n.length; r < o; r += 1)
        a = n[r], e.replacer && (a = e.replacer.call(n, String(r), a)), (Ve(e, t + 1, a, !0, !0, !1, !0) || void 0 === a && Ve(e, t + 1, null, !0, !0, !1, !0)) && (i && "" === l || (l += Le(e, t)), e.dump && 10 === e.dump.charCodeAt(0) ? l += "-" : l += "- ", l += e.dump); e.tag = c, e.dump = l || "[]"; }
    function Ge(e, t, n) { var i, r, a, l, c, s; for (a = 0, l = (r = n ? e.explicitTypes : e.implicitTypes).length; a < l; a += 1)
        if (((c = r[a]).instanceOf || c.predicate) && (!c.instanceOf || "object" == typeof t && t instanceof c.instanceOf) && (!c.predicate || c.predicate(t))) {
            if (n ? c.multi && c.representName ? e.tag = c.representName(t) : e.tag = c.tag : e.tag = "?", c.represent) {
                if (s = e.styleMap[c.tag] || c.defaultStyle, "[object Function]" === Ie.call(c.represent))
                    i = c.represent(t, s);
                else {
                    if (!Se.call(c.represent, s))
                        throw new o("!<" + c.tag + '> tag resolver accepts not "' + s + '" style');
                    i = c.represent[s](t, s);
                }
                e.dump = i;
            }
            return !0;
        } return !1; }
    function Ve(e, t, n, i, r, a, l) { e.tag = null, e.dump = n, Ge(e, n, !1) || Ge(e, n, !0); var c, s = Ie.call(e.dump), u = i; i && (i = e.flowLevel < 0 || e.flowLevel > t); var p, f, d = "[object Object]" === s || "[object Array]" === s; if (d && (f = -1 !== (p = e.duplicates.indexOf(n))), (null !== e.tag && "?" !== e.tag || f || 2 !== e.indent && t > 0) && (r = !1), f && e.usedDuplicates[p])
        e.dump = "*ref_" + p;
    else {
        if (d && f && !e.usedDuplicates[p] && (e.usedDuplicates[p] = !0), "[object Object]" === s)
            i && 0 !== Object.keys(e.dump).length ? (!function (e, t, n, i) { var r, a, l, c, s, u, p = "", f = e.tag, d = Object.keys(n); if (!0 === e.sortKeys)
                d.sort();
            else if ("function" == typeof e.sortKeys)
                d.sort(e.sortKeys);
            else if (e.sortKeys)
                throw new o("sortKeys must be a boolean or a function"); for (r = 0, a = d.length; r < a; r += 1)
                u = "", i && "" === p || (u += Le(e, t)), c = n[l = d[r]], e.replacer && (c = e.replacer.call(n, l, c)), Ve(e, t + 1, l, !0, !0, !0) && ((s = null !== e.tag && "?" !== e.tag || e.dump && e.dump.length > 1024) && (e.dump && 10 === e.dump.charCodeAt(0) ? u += "?" : u += "? "), u += e.dump, s && (u += Le(e, t)), Ve(e, t + 1, c, !0, s) && (e.dump && 10 === e.dump.charCodeAt(0) ? u += ":" : u += ": ", p += u += e.dump)); e.tag = f, e.dump = p || "{}"; }(e, t, e.dump, r), f && (e.dump = "&ref_" + p + e.dump)) : (!function (e, t, n) { var i, r, o, a, l, c = "", s = e.tag, u = Object.keys(n); for (i = 0, r = u.length; i < r; i += 1)
                l = "", "" !== c && (l += ", "), e.condenseFlow && (l += '"'), a = n[o = u[i]], e.replacer && (a = e.replacer.call(n, o, a)), Ve(e, t, o, !1, !1) && (e.dump.length > 1024 && (l += "? "), l += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), Ve(e, t, a, !1, !1) && (c += l += e.dump)); e.tag = s, e.dump = "{" + c + "}"; }(e, t, e.dump), f && (e.dump = "&ref_" + p + " " + e.dump));
        else if ("[object Array]" === s)
            i && 0 !== e.dump.length ? (e.noArrayIndent && !l && t > 0 ? $e(e, t - 1, e.dump, r) : $e(e, t, e.dump, r), f && (e.dump = "&ref_" + p + e.dump)) : (!function (e, t, n) { var i, r, o, a = "", l = e.tag; for (i = 0, r = n.length; i < r; i += 1)
                o = n[i], e.replacer && (o = e.replacer.call(n, String(i), o)), (Ve(e, t, o, !1, !1) || void 0 === o && Ve(e, t, null, !1, !1)) && ("" !== a && (a += "," + (e.condenseFlow ? "" : " ")), a += e.dump); e.tag = l, e.dump = "[" + a + "]"; }(e, t, e.dump), f && (e.dump = "&ref_" + p + " " + e.dump));
        else {
            if ("[object String]" !== s) {
                if ("[object Undefined]" === s)
                    return !1;
                if (e.skipInvalid)
                    return !1;
                throw new o("unacceptable kind of an object to dump " + s);
            }
            "?" !== e.tag && Ke(e, e.dump, t, a, u);
        }
        null !== e.tag && "?" !== e.tag && (c = encodeURI("!" === e.tag[0] ? e.tag.slice(1) : e.tag).replace(/!/g, "%21"), c = "!" === e.tag[0] ? "!" + c : "tag:yaml.org,2002:" === c.slice(0, 18) ? "!!" + c.slice(18) : "!<" + c + ">", e.dump = c + " " + e.dump);
    } return !0; }
    function Ze(e, t) { var n, i, r = [], o = []; for (Je(e, r, o), n = 0, i = o.length; n < i; n += 1)
        t.duplicates.push(r[o[n]]); t.usedDuplicates = new Array(i); }
    function Je(e, t, n) { var i, r, o; if (null !== e && "object" == typeof e)
        if (-1 !== (r = t.indexOf(e)))
            -1 === n.indexOf(r) && n.push(r);
        else if (t.push(e), Array.isArray(e))
            for (r = 0, o = e.length; r < o; r += 1)
                Je(e[r], t, n);
        else
            for (r = 0, o = (i = Object.keys(e)).length; r < o; r += 1)
                Je(e[i[r]], t, n); }
    function Qe(e, t) { return function () { throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default."); }; }
    var ze = p, Xe = h, et = b, tt = O, nt = j, it = K, rt = xe.load, ot = xe.loadAll, at = { dump: function (e, t) { var n = new Ee(t = t || {}); n.noRefs || Ze(e, n); var i = e; return n.replacer && (i = n.replacer.call({ "": i }, "", i)), Ve(n, 0, i, !0, !0) ? n.dump + "\n" : ""; } }.dump, lt = o, ct = { binary: L, float: S, map: y, null: A, pairs: Y, set: B, timestamp: F, bool: v, int: C, merge: E, omap: U, seq: m, str: g }, st = Qe("safeLoad", "load"), ut = Qe("safeLoadAll", "loadAll"), pt = Qe("safeDump", "dump"), ft = { Type: ze, Schema: Xe, FAILSAFE_SCHEMA: et, JSON_SCHEMA: tt, CORE_SCHEMA: nt, DEFAULT_SCHEMA: it, load: rt, loadAll: ot, dump: at, YAMLException: lt, types: ct, safeLoad: st, safeLoadAll: ut, safeDump: pt };
    e.CORE_SCHEMA = nt, e.DEFAULT_SCHEMA = it, e.FAILSAFE_SCHEMA = et, e.JSON_SCHEMA = tt, e.Schema = Xe, e.Type = ze, e.YAMLException = lt, e.default = ft, e.dump = at, e.load = rt, e.loadAll = ot, e.safeDump = pt, e.safeLoad = st, e.safeLoadAll = ut, e.types = ct, Object.defineProperty(e, "__esModule", { value: !0 });
}));
/// <reference path="../lib/js-yaml.min.js" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var conx;
(function (conx) {
    class glo {
        static get wnd() {
            return window;
        }
        static get lib() {
            return this.wnd.conxlib;
        }
        static wait(ms) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => {
                    setTimeout(resolve, ms);
                });
            });
        }
        static delay(ms, _this, fn, ...args) {
            return setTimeout(() => {
                fn.apply(_this, args);
            }, ms);
        }
        static get yaml() {
            return this.wnd.jsyaml;
        }
        static get time() {
            return (new Date).getTime();
        }
        static isNull(v, d) {
            return undefined !== v && null !== v ? v : d;
        }
        static isNaN(v, d) {
            return isNaN(v) ? d : v;
        }
        static set(root, ids, val, key, types) {
            let i;
            for (i = 0; i < ids.length - 1; ++i) {
                if (!root[ids[i]])
                    root[ids[i]] = {};
                root = root[ids[i]];
                if (key && i < types.length) {
                    root[key] = types[i];
                }
            }
            i = ids.length - 1;
            root[ids[i]] = val;
            if (key && i < types.length) {
                val[key] = types[i];
            }
        }
        static get(root, path, spliter) {
            let ids = path.split(spliter);
            for (let i = 0; root && i < ids.length; ++i)
                if (ids[i] && ids[i].length > 0)
                    root = root === null || root === void 0 ? void 0 : root[ids[i]];
            return root;
        }
        static up(val, delimeter = "/") {
            return val.substr(0, val.lastIndexOf(delimeter));
        }
        static top(val, delimeter = "/") {
            return val.substr(val.lastIndexOf(delimeter) + 1);
        }
        static isVisible(value, isAdmin) {
            return undefined === value || true === value || ("admin" === value && isAdmin);
        }
        static getChild(_this, id) {
            let node = _this, ids = id.split("."), i, len = ids.length;
            for (i = 0; undefined !== node && i < len; ++i) {
                node = node[ids[i]];
            }
            if (undefined !== node)
                return node;
            node = _this;
            let j, clen, res;
            for (i = 0; undefined !== node && i < len; ++i) {
                res = undefined;
                clen = node.children.length;
                for (j = 0; j < clen; ++j) {
                    if (node.children[j].id === ids[i]) {
                        res = node.children[j];
                        break;
                    }
                }
                if (undefined === res)
                    return undefined;
                node = res;
            }
            return node;
        }
        static findChild(node, id) {
            if (node.id === id)
                return node;
            let len = node.children.length, res;
            for (let i = 0; i < len; ++i) {
                res = this.findChild(node.children[i], id);
                if (null !== res)
                    return res;
            }
            return null;
        }
        static removeChildren(node) {
            while (node.firstChild) {
                node.removeChild(node.lastChild);
            }
        }
        static findCSS(node, css, res = undefined) {
            if (undefined === res)
                res = [];
            if (node.className === css) {
                res.push(node);
                return res;
            }
            let len = node.children.length;
            for (let i = 0; i < len; ++i)
                this.findCSS(node.children[i], css, res);
            return res;
        }
        static setStyle(child, style) {
            for (let att in style) {
                let _att = att.replace(/-[a-z]/g, match => `${match.substr(1).toUpperCase()}`);
                child.style[_att] = style[att];
            }
        }
        static setAtts(child, childAtts) {
            let value;
            for (let att in childAtts) {
                value = this.fixOrigin(childAtts[att]);
                if ("style" !== att) {
                    if ("visibility" === att)
                        child.setAttribute(att, value);
                    else {
                        if (child.hasAttribute(att))
                            child.setAttribute(att, value);
                        else if (undefined !== child[att])
                            child[att] = value;
                    }
                }
                else
                    this.setStyle(child, value);
            }
        }
        static navigate(path) {
            window.history.pushState("", null, path);
            window.dispatchEvent(new Event("location-changed"));
        }
        static fixOrigin(str) {
            if (typeof str !== "string")
                return str;
            const org = window.location.origin;
            return str.split("$org$").join(org);
        }
        static fixParams(str, params) {
            if (typeof str !== "string")
                return str;
            const len = params.length;
            for (let i = 0; i < len; ++i)
                str = str.split(`$${i + 1}`).join(params[i]);
            return str;
        }
        static fix(org, data) {
            for (let a in data) {
                if (!(org === null || org === void 0 ? void 0 : org[a]))
                    org[a] = data[a];
            }
        }
        static fixByYAML(org, yaml) {
            const data = this.yaml.load(yaml);
            if (!data)
                return;
            this.fix(org, data);
        }
        static fixByJSON(org, json) {
            const data = JSON.parse(json);
            if (!data)
                return;
            this.fix(org, data);
        }
        static updateCSS(_this, csss = undefined) {
            if (!csss)
                return;
            let cssArr, nodes, node, style, type, i, len;
            for (let cssId in csss) {
                cssArr = cssId.split("-");
                nodes = this.findCSS(_this, cssArr[0]);
                style = csss[cssId];
                type = cssArr.length <= 1 ? "reg" : cssArr[1];
                len = nodes.length;
                for (i = 0; i < len; ++i)
                    this.updateNodeStyle(nodes[i], style, type);
            }
            for (let cssId in csss) {
                cssArr = cssId.split("-");
                if ("#" !== cssArr[0][0])
                    continue;
                cssArr[0] = cssArr[0].substring(1);
                node = this.findChild(_this, cssArr[0]);
                if (!node)
                    continue;
                style = csss[cssId];
                type = cssArr.length <= 1 ? "reg" : cssArr[1];
                this.updateNodeStyle(node, style, type);
            }
        }
        static updateNodeStyle(node, style, type) {
            if ("reg" === type)
                this.setStyle(node, style);
            if (undefined !== (node === null || node === void 0 ? void 0 : node.css))
                node.css[type] = style;
        }
        static update(_this, atts = undefined) {
            atts = atts || (_this === null || _this === void 0 ? void 0 : _this.params);
            if (!atts)
                return;
            let child, childAtts;
            for (let childId in atts) {
                child = this.getChild(_this, childId);
                if (undefined === child)
                    continue;
                this.updateChild(child, atts[childId]);
            }
            childAtts = atts["root"];
            if (undefined !== childAtts) {
                this.setAtts(_this, childAtts);
            }
        }
        static updateChild(child, atts) {
            if (undefined !== (child === null || child === void 0 ? void 0 : child.updateParams))
                child.updateParams(atts);
            else
                this.setAtts(child, atts);
        }
        static clamp(val, minVal, maxVal) {
            return Math.max(minVal, Math.min(maxVal, val));
        }
        static zclamp(val) {
            return this.clamp(val, 0, 1);
        }
        static JSON(data) {
            if (!!data)
                return JSON.parse(data);
            return {};
        }
        static copy(dst, src, override) {
            for (let a in src) {
                if (override || undefined === dst[a]) {
                    if (typeof src[a] === "object") {
                        if (undefined === dst[a])
                            dst[a] = {};
                        this.copy(dst[a], src[a], override);
                    }
                    else
                        dst[a] = src[a];
                }
            }
        }
        static attributesToObject(_atts) {
            let atts = Array.prototype.slice.call(_atts);
            let res = {};
            for (let i in atts) {
                if ("locals" === atts[i].name || "params" === atts[i].name)
                    continue;
                res[atts[i].name] = atts[i].value;
            }
            return res;
        }
        static searchAttributes(part, _obj, toNum) {
            const res = [];
            for (let a in _obj) {
                if (0 === a.indexOf(part)) {
                    if (!toNum)
                        res.push(a);
                    else
                        res.push(parseInt(a.split(part)[1]));
                }
            }
            if (res.length <= 0)
                return undefined;
            if (toNum)
                return res.sort((a, b) => a - b);
            return res;
        }
        static RGBtoHEX(r, g, b) {
            r = Math.floor(r * 255), g = Math.floor(g * 255), b = Math.floor(b * 255);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        static RGBtoHEXv(rgb) {
            return this.RGBtoHEX(rgb[0], rgb[1], rgb[2]);
        }
        static HSVtoRGB(h, s, v) {
            let r, g, b, i, f, p, q, t;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                    r = v, g = t, b = p;
                    break;
                case 1:
                    r = q, g = v, b = p;
                    break;
                case 2:
                    r = p, g = v, b = t;
                    break;
                case 3:
                    r = p, g = q, b = v;
                    break;
                case 4:
                    r = t, g = p, b = v;
                    break;
                case 5:
                    r = v, g = p, b = q;
                    break;
            }
            return [r, g, b];
        }
        static RGBtoHSV(r, g, b) {
            r = Math.floor(r * 255), g = Math.floor(g * 255), b = Math.floor(b * 255);
            let max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h, s = (max === 0 ? 0 : d / max), v = max / 255;
            switch (max) {
                case min:
                    h = 0;
                    break;
                case r:
                    h = (g - b) + d * (g < b ? 6 : 0);
                    h /= 6 * d;
                    break;
                case g:
                    h = (b - r) + d * 2;
                    h /= 6 * d;
                    break;
                case b:
                    h = (r - g) + d * 4;
                    h /= 6 * d;
                    break;
            }
            return [h, s, v];
        }
        static HEXtoRGB(hex) {
            const A = hex.length < 9 ? 255 : parseInt('0x' + hex[7] + hex[8], 16);
            return [parseInt('0x' + hex[1] + hex[2], 16), parseInt('0x' + hex[3] + hex[4], 16), parseInt('0x' + hex[5] + hex[6], 16), A];
        }
        static HEXtoRGBv(hex) {
            let rgb = this.HEXtoRGB(hex);
            rgb[0] = this.clamp(rgb[0] / 255.0, 0, 1);
            rgb[1] = this.clamp(rgb[1] / 255.0, 0, 1);
            rgb[2] = this.clamp(rgb[2] / 255.0, 0, 1);
            rgb[3] = this.clamp(rgb[3] / 255.0, 0, 1);
            return rgb;
        }
        static HSVtoHEX(h, s, v) {
            let rgb = this.HSVtoRGB(h, s, v);
            return this.RGBtoHEX(rgb[0], rgb[1], rgb[2]);
        }
        static RGBAtoHEX(r, g, b, a) {
            let hsv = this.RGBtoHSV(r, g, b);
            hsv[2] = a;
            let rgb = this.HSVtoRGB(hsv[0], hsv[1], hsv[2]);
            return this.RGBtoHEX(rgb[0], rgb[1], rgb[2]);
        }
        static RGBAHStoCode(rgb) {
            let str = "", len = rgb.length, f;
            for (let i = 0; i < len; ++i) {
                f = rgb[i];
                if (f >= 1)
                    str += "FL,";
                else if (f <= 0)
                    str += "zr,";
                else {
                    f = Math.floor(f * 100);
                    str += f.toString() + ",";
                }
            }
            return str.substring(0, str.length - 1);
        }
        static toNums(seq) {
            let parts = seq.split("|"), inc = 1, sign = 1;
            if (parts.length > 1)
                inc = parseFloat(parts[1]);
            let nums = parts[0].split(">");
            if (nums.length < 2)
                return [parseFloat(nums[0])];
            let a = parseFloat(nums[0]), b = parseFloat(nums[1]);
            if (a > b) {
                inc = -inc;
                sign = -1;
            }
            let res = [];
            for (; a * sign <= b * sign; a += inc)
                res.push(a);
            return res;
        }
        static removeItems(res, items) {
            let i, len = items.length, index;
            for (i = 0; i < len; ++i) {
                index = res.indexOf(items[i]);
                if (-1 !== index)
                    res.splice(index, 1);
            }
        }
        static ParseSelection(data) {
            if (!data)
                return [];
            let names = [];
            let entities = data.split(",");
            let i, len = entities.length;
            for (i = 0; i < len; ++i) {
                let entity = entities[i];
                let parts = entity.split(";");
                if (parts.length < 2) {
                    names.push(parts[0].trim());
                    continue;
                }
                if (parts.length > 2)
                    continue;
                let res = [];
                let name = parts[0].trim();
                let seqs = parts[1].split(/([+]|[-])/);
                let tlen = seqs.length, j;
                for (j = 0; j < tlen; j += 2) {
                    let s = this.toNums(seqs[j]);
                    if (0 === j || "+" === seqs[j - 1])
                        res = res.concat(s);
                    else
                        this.removeItems(res, s);
                }
                tlen = res.length;
                for (j = 0; j < tlen; ++j)
                    names.push(name + res[j]);
            }
            return names;
        }
        static get GID() { return "g" + ++this.gid; }
        static Guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        static removeCustom(str) {
            if (this.CUSTOM_TYPE_PREFIX !== str.substring(0, this.CUSTOM_TYPE_PREFIX.length))
                return `hui-${str}-${this.TAG_SUFFIX}`;
            return str.slice(this.CUSTOM_TYPE_PREFIX.length);
        }
    }
    //static isMobile: boolean = true;
    glo.isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    glo.DPI = window.devicePixelRatio;
    glo.MPI = 100.0 / (76.0 * window.devicePixelRatio / 2.54);
    glo.gid = 1;
    glo.TAG_SUFFIX = "card";
    glo.CUSTOM_TYPE_PREFIX = "custom:";
    glo.clipboard = (function (window, document, navigator) {
        let textArea, copy;
        function isOS() {
            return navigator.userAgent.match(/ipad|iphone/i);
        }
        function createTextArea(text) {
            textArea = document.createElement('textArea');
            textArea.value = text;
            document.body.appendChild(textArea);
        }
        function selectText() {
            var range, selection;
            if (isOS()) {
                range = document.createRange();
                range.selectNodeContents(textArea);
                selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                textArea.setSelectionRange(0, 999999);
            }
            else {
                textArea.select();
            }
        }
        function copyToClipboard() {
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        copy = function (text) {
            createTextArea(text);
            selectText();
            copyToClipboard();
        };
        return {
            copy: copy
        };
    })(window, document, navigator);
    conx.glo = glo;
    class Trace {
        constructor() {
            const con = console, that = this;
            for (const m in con) {
                if (typeof con[m] === 'function')
                    that[m] = con[m].bind(window.console);
            }
            window.console = this;
        }
    }
    conx.trace = new Trace();
    function loadScriptOnce(src) {
        const key = `__load_${src}`;
        if (glo.wnd[key])
            return glo.wnd[key];
        glo.wnd[key] = new Promise((resolve, reject) => {
            // already loaded?
            const already = [...document.scripts].some(s => s.src.includes(src));
            if (already)
                return resolve();
            const s = document.createElement("script");
            s.src = src;
            s.async = false; // preserve order as much as possible
            s.onload = () => resolve();
            s.onerror = (e) => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
        });
        return glo.wnd[key];
    }
    loadScriptOnce("/local/conxlib.js");
})(conx || (conx = {}));
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class utils {
        }
        utils.ns = "http://www.w3.org/2000/svg";
        utils.Style = (props) => {
            let combinedString = [];
            for (let k in props) {
                let v = props[k];
                k = k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                combinedString.push(`${k}:${v}`);
            }
            return combinedString.join(";");
        };
        utils.SVGGroup = (props) => {
            let g = document.createElementNS(utils.ns, "g");
            g.id = props.id;
            return g;
        };
        utils.SVGRect = (props) => {
            let rect = document.createElementNS(utils.ns, "rect");
            let x, y, rx, ry, width, height, style;
            x = (props.x) ? props.x : 0;
            y = (props.y) ? props.y : 0;
            rx = (props.rx) ? props.rx : 0;
            ry = (props.ry) ? props.ry : 0;
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : "";
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("rx", rx);
            rect.setAttribute("ry", ry);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);
            rect.setAttribute("style", style);
            if (props.id)
                rect.id = props.id;
            return rect;
        };
        utils.SVGImage = (props) => {
            let img = document.createElementNS(utils.ns, "image");
            let x, y, width, height, style, visibility, preserveAspectRatio;
            x = (props.x) ? props.x : 0;
            y = (props.y) ? props.y : 0;
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : "";
            visibility = (props.visibility) ? props.visibility : "hidden";
            preserveAspectRatio = (props.preserveAspectRatio) ? props.preserveAspectRatio : "none";
            img.setAttribute("x", x);
            img.setAttribute("y", y);
            img.setAttribute("width", width);
            img.setAttribute("height", height);
            img.setAttribute("style", style);
            img.setAttribute("visibility", visibility);
            img.setAttribute("preserveAspectRatio", preserveAspectRatio);
            img.setAttribute("href", "");
            if (props.id)
                img.id = props.id;
            return img;
        };
        utils.SVGText = (props) => {
            let text = document.createElementNS(utils.ns, "text");
            let x, y, style, width, height, content;
            x = (props.x) ? props.x : 0;
            y = (props.y) ? props.y : 0;
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : "";
            content = (props.text) ? props.text : "";
            text.setAttribute("x", x);
            text.setAttribute("y", y);
            text.setAttribute("style", style);
            text.setAttribute("width", width);
            text.setAttribute("height", height);
            text.textContent = content;
            if (props.id)
                text.id = props.id;
            return text;
        };
        utils.SVGPath = (props) => {
            let path = document.createElementNS(utils.ns, "path");
            path.setAttribute("d", props.d);
            path.setAttribute("style", utils.Style(props.style));
            path.id = props.id;
            return path;
        };
        utils.SVGCircle = (props) => {
            let circle = document.createElementNS(utils.ns, "circle");
            circle.id = props.id;
            circle.setAttribute("cx", props.cx);
            circle.setAttribute("cy", props.cy);
            circle.setAttribute("r", props.r);
            circle.setAttribute("style", utils.Style(props.style));
            return circle;
        };
        utils.SVGArc = (props) => {
            const cos = Math.cos;
            const sin = Math.sin;
            const PI = Math.PI;
            const f_matrix_times = ((A, B) => [A[0][0] * B[0] + A[0][1] * B[1], A[1][0] * B[0] + A[1][1] * B[1]]);
            const f_rotate_matrix = ((x) => {
                const cosx = cos(x);
                const sinx = sin(x);
                return [[cosx, -sinx], [sinx, cosx]];
            });
            const f_vec_add = ((A, B) => [A[0] + B[0], A[1] + B[1]]);
            const f_svg_ellipse_arc = ((C, R, D, fai) => {
                D[1] = D[1] % (2 * PI);
                const rotMatrix = f_rotate_matrix(fai);
                const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [R[0] * cos(D[0]), R[1] * sin(D[0])]), [C[0], C[1]]));
                const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [R[0] * cos(D[0] + D[1]), R[1] * sin(D[0] + D[1])]), [C[0], C[1]]));
                const fA = ((D[1] > PI) ? 1 : 0);
                const fS = ((D[1] > 0) ? 1 : 0);
                return [" M ", sX, " ", sY, " A ", R[0], R[1], fai / PI * 180, fA, fS, eX, eY];
            });
            let params = f_svg_ellipse_arc([props.cx, props.cy], [props.rx, props.ry], [props.t1 * PI / 180, props.DELTA * PI / 180], props.FAI * PI / 180);
            return params;
        };
        // Calculate angle between two vector
        utils.GetAngle = (x1, y1, x2, y2) => {
            let distY = (y2 - y1);
            let distX = (x2 - x1);
            let dist = Math.sqrt((distY * distY) + (distX * distX));
            let val, aSine;
            if (distY <= 0) {
                val = distX / dist;
                aSine = Math.asin(val);
            }
            else {
                val = distX / dist;
                aSine = -1 * Math.PI - Math.asin(val);
            }
            return aSine;
        };
        controls.utils = utils;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
/// <reference path="../glo.ts" />
/// <reference path="utils.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Element extends HTMLElement {
            constructor() {
                super();
                this.connected = false;
                this._minMove = 10 * conx.glo.DPI;
                this._moved = false;
                this.locals = {};
                this.params = { root: {} };
                this._onMousedown = this._onMousedown.bind(this);
                this._onMousemove = this._onMousemove.bind(this);
                this._onMouseup = this._onMouseup.bind(this);
                this._onPointerdown = this._onPointerdown.bind(this);
                this._onPointermove = this._onPointermove.bind(this);
                this._onPointerup = this._onPointerup.bind(this);
                this._onTouchend = this._onTouchend.bind(this);
                this._onTouchmove = this._onTouchmove.bind(this);
                this._onTouchstart = this._onTouchstart.bind(this);
                this.createChildren();
                this.connectItems();
            }
            onPointer(e, type) {
                conx.trace.log("onPointer", e, type, this._touchX, this._touchY);
            }
            postConnected() {
                this.connected = true;
                this.clientRect = this.root.getBoundingClientRect();
                //trace.log("postConnected", this.id, this.clientRect);
            }
            updateParams(params) {
                this.copyData(this.params, params);
            }
            connectedCallback() {
                this.copyData(this.locals, conx.glo.JSON(this.getAttribute("locals")));
                this.copyData(this.params, conx.glo.JSON(this.getAttribute("params")));
                this.copyData(this.params.root, conx.glo.attributesToObject(this.attributes));
                conx.glo.update(this);
                this.appendChild(this.root);
                setTimeout(this.postConnected.bind(this), 0);
            }
            disconnectedCallback() {
                this.connected = false;
                if (undefined !== this.root)
                    this.removeChild(this.root);
            }
            copyData(dst, src, override = true) {
                conx.glo.copy(dst, src, override);
            }
            findChild(id) {
                return conx.glo.findChild(this.root, id);
            }
            connectItems() {
            }
            createChildren() {
            }
            enablePointer() {
                this.root.addEventListener("touchstart", this._onTouchstart);
                this.root.addEventListener("mousedown", this._onMousedown);
                //if ("PointerEvent" in window)
                //    this.root.addEventListener("pointerdown", this._onPointerdown);
            }
            get isVertical() {
                var _a;
                return 1 === ((_a = this === null || this === void 0 ? void 0 : this.locals) === null || _a === void 0 ? void 0 : _a.align);
            }
            checkMove(x, y, vertical) {
                if (false === vertical)
                    return Math.abs(this._pouchX - x) > this._minMove;
                return Math.abs(this._pouchY - y) > this._minMove;
            }
            Move(e, type, x, y) {
                if (this._moved) {
                    e.preventDefault();
                    this._pouchX = this._touchX;
                    this._pouchY = this._touchY;
                    this._touchX = x;
                    this._touchY = y;
                    this.onPointer(e, "move");
                    return;
                }
                if (this.checkMove(x, y, !this.isVertical)) {
                    this._cancelMove(e, type);
                    return;
                }
                if (this.checkMove(x, y, this.isVertical))
                    this._moved = true;
                this._touchX = x;
                this._touchY = y;
            }
            _cancelMove(e, type) {
                switch (type) {
                    case "pointer":
                        this._cancelPointer(e);
                        break;
                    case "mouse":
                        this._cancelMouse();
                        break;
                    case "touch":
                        this._cancelTouch();
                        break;
                }
            }
            get dtX() {
                return this._touchX - this._pouchX;
            }
            get dtY() {
                return this._touchY - this._pouchY;
            }
            get dtIX() {
                return this.dtX * conx.glo.MPI;
            }
            get dtIY() {
                return this.dtY * conx.glo.MPI;
            }
            _onPointerdown(e) {
                e.preventDefault();
                this._moved = false;
                this._pouchX = e.clientX;
                this._pouchY = e.clientY;
                this._touchX = e.clientX;
                this._touchY = e.clientY;
                this.setPointerCapture(e.pointerId);
                this.addEventListener("pointermove", this._onPointermove);
                this.addEventListener("pointerup", this._onPointerup);
                this.addEventListener("pointercancel", this._onPointerup);
                this.onPointer(e, "down");
            }
            _onPointermove(e) {
                //e.preventDefault();
                this.Move(e, "pointer", e.clientX, e.clientY);
            }
            _onPointerup(e) {
                e.preventDefault();
                this._cancelPointer(e);
                this.onPointer(e, "up");
            }
            _cancelPointer(e) {
                this._moved = false;
                this.releasePointerCapture(e.pointerId);
                this.removeEventListener("pointermove", this._onPointermove);
                this.removeEventListener("pointerup", this._onPointerup);
                this.removeEventListener("pointercancel", this._onPointerup);
            }
            _onMousedown(e) {
                e.preventDefault();
                this._moved = false;
                this._pouchX = e.clientX;
                this._pouchY = e.clientY;
                this._touchX = e.clientX;
                this._touchY = e.clientY;
                document.addEventListener("mousemove", this._onMousemove);
                document.addEventListener("mouseup", this._onMouseup);
                this.onPointer(e, "down");
            }
            _onMousemove(e) {
                //e.preventDefault();
                this.Move(e, "mouse", e.clientX, e.clientY);
            }
            _onMouseup(e) {
                e.preventDefault();
                this._cancelMouse();
                this.onPointer(e, "up");
            }
            _cancelMouse() {
                this._moved = false;
                document.removeEventListener("mousemove", this._onMousemove);
                document.removeEventListener("mouseup", this._onMouseup);
            }
            _onTouchstart(e) {
                //e.preventDefault();
                this._moved = false;
                this._pouchX = e.changedTouches[0].clientX;
                this._pouchY = e.changedTouches[0].clientY;
                this._touchX = e.changedTouches[0].clientX;
                this._touchY = e.changedTouches[0].clientY;
                this.addEventListener("touchmove", this._onTouchmove);
                this.addEventListener("touchend", this._onTouchend);
                this.addEventListener("touchcancel", this._onTouchend);
                this.onPointer(e, "down");
            }
            _onTouchmove(e) {
                //e.preventDefault();
                this.Move(e, "touch", e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            }
            _onTouchend(e) {
                //e.preventDefault();
                this._cancelTouch();
                this.onPointer(e, "up");
            }
            _cancelTouch() {
                this._moved = false;
                this.removeEventListener("touchmove", this._onTouchmove);
                this.removeEventListener("touchend", this._onTouchend);
                this.removeEventListener("touchcancel", this._onTouchend);
            }
        }
        controls.Element = Element;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
/// <reference path="elm.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Svg extends controls.Element {
            constructor() {
                super();
            }
            createChildren() {
                super.createChildren();
                this.svg = document.createElementNS(controls.utils.ns, "svg");
                this.svg.setAttribute("width", "100%");
                this.svg.setAttribute("height", "100%");
                this.root = this.svg;
            }
        }
        controls.Svg = Svg;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
/// <reference path="svg.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Slider extends controls.Svg {
            constructor() {
                super();
                this.movable = false;
                this.slideLength = -1;
                this._val = 0;
                this.copyData(this.locals, {
                    align: 0,
                    percent: true,
                    thumb: 0,
                    title: "Slider"
                });
                this.copyData(this.params, {
                    bg: {
                        style: {
                            fill: "#919191",
                        }
                    },
                    frame: {
                        style: {
                            fill: "none",
                            stroke: "black",
                            strokeWidth: "5px"
                        }
                    },
                    progress: {
                        style: {
                            fill: "red"
                        },
                        width: "100%",
                        height: "100%",
                        visibility: "visible"
                    },
                    thumb: {
                        visibility: "visible"
                    },
                    text: {
                        style: {
                            dominantBaseline: "middle",
                            fill: "white",
                            textAnchor: "middle",
                            fontSize: "20px",
                            textShadow: "1px 1px #000000"
                        },
                        textContent: ""
                    }
                });
            }
            connectItems() {
                this.enablePointer();
                this.image = this.findChild(`image`);
                this.group = this.findChild(`group`);
                this.frame = this.findChild(`frame`);
                this.bg = this.findChild(`bg`);
                this.progress = this.findChild(`progress`);
                this.thumb = this.findChild(`thumb`);
                this.text = this.findChild(`text`);
            }
            createChildren() {
                super.createChildren();
                let i_image = controls.utils.SVGImage({ id: `image` });
                let g_group = controls.utils.SVGGroup({ id: `group` });
                let r_frame = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "none", stroke: "black", strokeWidth: "5px" }, id: `frame` });
                let r_barTotal = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "#919191" }, id: `bg` });
                let r_barProgress = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "red" }, id: `progress` });
                let r_thumb = controls.utils.SVGRect({ x: "0", y: "0", width: "3px", height: "100%", style: { fill: "#FFBF00", stroke: "black", strokeWidth: "1px" }, id: `thumb` });
                let t_title = controls.utils.SVGText({ x: "50%", y: "50%", style: { fill: "white", textAnchor: "middle", fontSize: "20px", textShadow: "1px 1px #000000" }, id: `text` });
                // Grouping
                g_group.appendChild(r_barTotal);
                g_group.appendChild(r_barProgress);
                g_group.appendChild(r_thumb);
                g_group.appendChild(t_title);
                g_group.appendChild(r_frame);
                this.svg.append(i_image);
                this.svg.append(g_group);
            }
            postConnected() {
                super.postConnected();
                this.updateByAlign(false);
                this.updateByValue(false);
                if (this.clientRect.width && this.clientRect.height) {
                    let s = Math.min(this.clientRect.width, this.clientRect.height) / 1.6;
                    this.params.text.style.fontSize = `${s}px`;
                }
                conx.glo.update(this);
            }
            updateByAlign(upd) {
                if (false === this.isVertical) {
                    this.params.text.style.transform = "";
                    this.params.text.style.transformOrigin = "";
                }
                else {
                    this.params.text.style.transform = "rotate(-90deg)";
                    this.params.text.style.transformOrigin = "50% 50%";
                }
                if (0 === this.locals.thumb) {
                    this.params.progress.visibility = "visible";
                    this.params.thumb.visibility = "hidden";
                }
                else {
                    this.params.progress.visibility = "hidden";
                    this.params.thumb.visibility = "visible";
                }
                if (upd)
                    conx.glo.update(this, { svg: this.params.svg });
            }
            updateByValue(upd = true) {
                if (undefined === this.clientRect)
                    return;
                this._val = conx.glo.clamp(this._val, 0, 1);
                let value = Math.round(this._val * 100);
                let talue = value * (1.0 - this.locals.thumb * 0.01);
                let text = this.locals.title;
                if (this.locals.percent)
                    text += ` ${value}%`;
                this.params.text.textContent = text;
                if (false === this.isVertical) {
                    this.params.progress.width = `${value}%`;
                    this.params.progress.height = "100%";
                    this.params.thumb.width = `${this.locals.thumb}%`;
                    this.params.thumb.height = "100%";
                    this.params.thumb.x = `${talue}%`;
                }
                else {
                    this.params.progress.width = "100%";
                    this.params.progress.height = `${value}%`;
                    this.params.progress.y = `${100 - value}%`;
                    this.params.thumb.width = "100%";
                    this.params.thumb.height = `${this.locals.thumb}%`;
                    this.params.thumb.y = `${100 - talue - this.locals.thumb}%`;
                }
                if (upd)
                    conx.glo.update(this, { progress: this.params.progress, thumb: this.params.thumb, text: this.params.text });
            }
            onPointer(e, type) {
                //super.onPointer(e,type);
                //trace.log("x", this, this.id, type, this.movable, this._val, this._pval);
                switch (type) {
                    case "down":
                        this.movable = true;
                        break;
                    case "move":
                        if (!this.movable)
                            return;
                        this._pval = this._val;
                        let rect = this.bg.getBoundingClientRect();
                        if (false === conx.glo.isMobile) {
                            if (false === this.isVertical)
                                this._val = (this._touchX - rect.left) / rect.width;
                            else
                                this._val = (rect.bottom - this._touchY) / rect.height;
                        }
                        else {
                            if (false === this.isVertical)
                                this._val = conx.glo.zclamp(this._val + this.dtIX / rect.width);
                            else
                                this._val = conx.glo.zclamp(this._val + this.dtIX / rect.height);
                        }
                        this.updateByValue();
                        if (this.onChange)
                            this.onChange(this.id, this._val, this._pval);
                        break;
                    case "up":
                        this.movable = false;
                        break;
                }
            }
        }
        controls.Slider = Slider;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-slider", conx.controls.Slider);
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        function fireEvent(node, type, detail) {
            node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
        }
        cards.fireEvent = fireEvent;
        class HACardEditor extends HTMLElement {
            setConfig(_config) {
            }
            ;
        }
        cards.HACardEditor = HACardEditor;
        customElements.define('conx-card-editor', conx.cards.HACardEditor);
        class HACard extends HTMLElement {
            constructor() {
                super(...arguments);
                this.gid = conx.glo.GID;
                this.guid = conx.glo.Guid();
                this.phass = {};
                this.cfg = {};
                this.pidx = [];
                this.nidx = [];
                this.ptates = [];
                this.states = [];
                this.entities = [];
                this.connected = false;
                this.timestamp = 0;
                this.timeCheckDelta = 500;
                this.dimmerColor = [1, 1, 0];
                this.throttles = {};
            }
            create() {
                if (this.cfg.dimmerColor)
                    this.dimmerColor = this.cfg.dimmerColor.split(",");
                if (this.dimmerColor.length < 3)
                    this.dimmerColor = [1, 1, 0];
            }
            static getConfigElement() {
                return document.createElement('conx-card-editor');
            }
            copyCfg() {
                var _a, _b, _c;
                if (!this.config)
                    return;
                this.cfg = JSON.parse(JSON.stringify(this.config));
                const lib = (_a = this.cfg) === null || _a === void 0 ? void 0 : _a.lib;
                const params = (_b = this.cfg) === null || _b === void 0 ? void 0 : _b.params;
                if (!lib)
                    return;
                delete this.cfg.lib;
                if (params)
                    delete this.cfg.params;
                let yaml = (_c = conx.glo.lib) === null || _c === void 0 ? void 0 : _c[lib];
                if (!yaml)
                    return;
                if (params)
                    yaml = conx.glo.fixParams(yaml, params);
                conx.glo.fixByYAML(this.cfg, yaml);
            }
            postCreate() {
                if (undefined !== this.css)
                    conx.glo.updateCSS(this.root, this.css);
                if (undefined !== this.html)
                    conx.glo.update(this.root, this.html);
            }
            updateState(check) {
                var _a;
                if (!this.root || !this.connected || this.entities.length <= 0 || !this.state)
                    return false;
                if (check && false === this.checkStateChanged(0))
                    return false;
                if (check && this.guid === ((_a = this.state) === null || _a === void 0 ? void 0 : _a.attributes.lc))
                    return false;
                //if (check && (glo.time - this.timestamp) < this.timeCheckDelta)                return false;
                return true;
            }
            get _style() {
                var _a, _b, _c, _d, _e, _f;
                let s = "";
                if ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.style)
                    s += ` ${(_b = this.cfg) === null || _b === void 0 ? void 0 : _b.style};`;
                if ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.width)
                    s += ` width: ${(_d = this.cfg) === null || _d === void 0 ? void 0 : _d.width};`;
                if ((_e = this.cfg) === null || _e === void 0 ? void 0 : _e.height)
                    s += ` height: ${(_f = this.cfg) === null || _f === void 0 ? void 0 : _f.height};`;
                return s;
            }
            get isAdmin() { var _a, _b; return (true === ((_b = (_a = this === null || this === void 0 ? void 0 : this.hass) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.is_admin)); }
            get hass() { return this._hass; }
            set hass(hass) {
                var _a;
                this.phass = this._hass;
                this._hass = hass;
                for (let i = 0; i < this.entities.length; ++i) {
                    this.pidx[i] = this.nidx[i];
                    this.ptates[i] = this.states[i];
                    this.states[i] = HACard.statelessStates[this.entities[i]] || hass.states[this.entities[i]];
                    this.nidx[i] = (_a = this.states[i]) === null || _a === void 0 ? void 0 : _a.u;
                }
                if (undefined === this.root) {
                    this.create();
                    this.postCreate();
                    this.registerStateless();
                }
                this.updateState(true);
                this.checkStateless();
            }
            checkStateless() {
                var _a, _b, _c, _d;
                if (((_b = (_a = this.phass) === null || _a === void 0 ? void 0 : _a.states) === null || _b === void 0 ? void 0 : _b["conx.states_idx"]) === ((_d = (_c = this._hass) === null || _c === void 0 ? void 0 : _c.states) === null || _d === void 0 ? void 0 : _d["conx.states_idx"]))
                    return;
                let state = this._hass.states["conx.states_idx"];
                if (!state)
                    return;
                let idx = Number(state.state);
                //console.log("idx", idx, HACard.statesIdx);
                if (idx <= 3)
                    HACard.statesIdx = idx - 1;
                if (idx <= HACard.statesIdx)
                    return;
                HACard.statesIdx = idx;
                HACard.requestStates(this._hass);
            }
            registerStateless() {
                var _a, _b;
                for (let i = 0; i < this.entities.length; ++i) {
                    if (this.states[i] && ((_b = (_a = this.states[i]) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.sl))
                        HACard.registedCard(this);
                }
            }
            static registedCard(card) {
                this.statelessCards[card.guid] = card;
            }
            static unregistedCard(card) {
                delete this.statelessCards[card.guid];
            }
            static onStatesMsg(hass, cmd, unq, payload, success) {
                if (unq !== "states" || false === success)
                    return;
                for (let id in payload) {
                    HACard.statelessStates[id] = payload[id];
                }
                for (let guid in this.statelessCards) {
                    this.statelessCards[guid].hass = this.statelessCards[guid]._hass;
                }
            }
            static requestStates(hass) {
                hass.connection.sendMessagePromise({
                    type: 'conx.cmd',
                    cmd: 'db.getStates',
                    unq: 'states',
                    data: {}
                }).then((respond) => {
                    this.onStatesMsg(hass, respond.cmd, respond.unq, respond.payload, undefined === respond.error);
                }, (respond) => {
                    this.onStatesMsg(hass, respond.cmd, respond.unq, respond.payload, false);
                });
            }
            get codeEditorInnerHTML() {
                if (true === this.isAdmin)
                    return `<conx-code-editor id="editor"></conx-code-editor>`;
                return ``;
            }
            connectedCallback() {
                this.connected = true;
                this.updateState(false);
            }
            disconnectedCallback() {
                this.connected = false;
            }
            onNewConfig(config) {
            }
            setConfig(config) {
                var _a, _b, _c, _d;
                if (this.config)
                    this.onNewConfig(config);
                this.config = config;
                this.copyCfg();
                if (undefined !== ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.css)) {
                    if (typeof ((_b = this.cfg) === null || _b === void 0 ? void 0 : _b.css) === "string")
                        this.css = JSON.parse(conx.glo.fixOrigin(this.cfg.css));
                    else
                        this.css = this.cfg.css;
                }
                if (undefined !== ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.html) && typeof ((_d = this.cfg) === null || _d === void 0 ? void 0 : _d.html) === "string")
                    this.html = JSON.parse(this.cfg.html);
                this.entities = conx.glo.ParseSelection(config.entity);
                this.pidx.length = this.entities.length;
                this.nidx.length = this.entities.length;
                this.ptates.length = this.entities.length;
                this.states.length = this.entities.length;
                if (undefined !== this.root)
                    this.postCreate();
            }
            get state() {
                if (this.states.length > 0)
                    return this.states[0];
                return undefined;
            }
            stateToColor(state) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                if (!state)
                    return null;
                const O = conx.glo.clamp(conx.glo.isNaN((_a = state.attributes) === null || _a === void 0 ? void 0 : _a.opacity, 1.0), 0.0, 1.0);
                let A = conx.glo.isNaN(((_b = state.attributes) === null || _b === void 0 ? void 0 : _b.brightness) / 255.0, 1.0), R = this.dimmerColor[0], G = this.dimmerColor[1], B = this.dimmerColor[2], H = 0, S = 0;
                if (!!((_c = state.attributes) === null || _c === void 0 ? void 0 : _c.rgb_color)) {
                    R = conx.glo.isNaN(((_e = (_d = state.attributes) === null || _d === void 0 ? void 0 : _d.rgb_color) === null || _e === void 0 ? void 0 : _e[0]) / 255.0, 1.0);
                    G = conx.glo.isNaN(((_g = (_f = state.attributes) === null || _f === void 0 ? void 0 : _f.rgb_color) === null || _g === void 0 ? void 0 : _g[1]) / 255.0, 1.0);
                    B = conx.glo.isNaN(((_j = (_h = state.attributes) === null || _h === void 0 ? void 0 : _h.rgb_color) === null || _j === void 0 ? void 0 : _j[2]) / 255.0, 1.0);
                }
                if (!!((_k = state.attributes) === null || _k === void 0 ? void 0 : _k.hs_color)) {
                    H = conx.glo.isNaN(((_m = (_l = state.attributes) === null || _l === void 0 ? void 0 : _l.hs_color) === null || _m === void 0 ? void 0 : _m[0]) / 360.0, 1.0);
                    S = conx.glo.isNaN(((_p = (_o = state.attributes) === null || _o === void 0 ? void 0 : _o.hs_color) === null || _p === void 0 ? void 0 : _p[1]) / 100.0, 1.0);
                }
                if ("on" !== (state === null || state === void 0 ? void 0 : state.state)) {
                    A = conx.glo.isNaN(((_q = state.attributes) === null || _q === void 0 ? void 0 : _q.brightness) / 255.0, 0.0);
                    R = 0;
                    G = 0;
                    B = 0;
                }
                return [R, G, B, A, O, H, S];
            }
            colorToState(rgba) {
                var _a;
                const state = this.state;
                if (!state)
                    return;
                state.attributes.brightness = rgba[3] * 255.0;
                if (!!((_a = state.attributes) === null || _a === void 0 ? void 0 : _a.rgb_color)) {
                    state.attributes.rgb_color[0] = rgba[0] * 255.0;
                    state.attributes.rgb_color[1] = rgba[1] * 255.0;
                    state.attributes.rgb_color[2] = rgba[2] * 255.0;
                }
                state.state = (rgba[3] <= 0) ? "off" : "on";
            }
            checkStateChanged(idx) {
                var _a, _b, _c, _d, _e, _f, _g;
                if (((_a = this.ptates) === null || _a === void 0 ? void 0 : _a[idx]) !== ((_b = this.states) === null || _b === void 0 ? void 0 : _b[idx]))
                    return true;
                if (!((_e = (_d = (_c = this.states) === null || _c === void 0 ? void 0 : _c[idx]) === null || _d === void 0 ? void 0 : _d.attributes) === null || _e === void 0 ? void 0 : _e.sl))
                    return false;
                return ((_f = this.nidx) === null || _f === void 0 ? void 0 : _f[idx]) > ((_g = this.pidx) === null || _g === void 0 ? void 0 : _g[idx]);
            }
            hasStateChanged(entity) {
                var _a, _b, _c, _d;
                return ((_b = (_a = this.phass) === null || _a === void 0 ? void 0 : _a.states) === null || _b === void 0 ? void 0 : _b[entity]) !== ((_d = (_c = this._hass) === null || _c === void 0 ? void 0 : _c.states) === null || _d === void 0 ? void 0 : _d[entity]);
            }
            stampChange() {
                this.timestamp = conx.glo.time;
            }
            stampClear() {
                this.timestamp = -this.timeCheckDelta;
            }
            CallService(domain, service, data) {
                this._hass.callService(domain, service, data);
                this.stampChange();
            }
            ConxLight(cmd, data) {
                data.lc = this.guid;
                if (!cmd) {
                    this.CallService("conx", "light", data);
                    return;
                }
                let t = this.throttles[cmd];
                if (!(t === null || t === void 0 ? void 0 : t.wait)) {
                    this.Throttle(cmd);
                    this.CallService("conx", "light", data);
                }
                else
                    t.data = data;
            }
            Throttle(cmd) {
                let t = this.throttles[cmd];
                if (!t)
                    t = this.throttles[cmd] = { throttle: 125 };
                t.wait = true;
                t.data = null;
                t.timeoutId = setTimeout(() => {
                    if (t.data) {
                        this.CallService("conx", "light", t.data);
                        t.data = null;
                        this.Throttle(cmd);
                    }
                    else
                        t.wait = false;
                }, t.throttle);
            }
            GetConnections(unq) {
                this.conx(unq, "db.GetConnections", {});
            }
            Get(unq, path, create = false) {
                this.conx(unq, "db.Get", { path: path, create: create });
            }
            Set(unq, path, value, create = false, override = true) {
                this.conx(unq, "db.Set", { path: path, value: value, create: create, override: override });
                this.stampChange();
            }
            Rename(unq, path, name) {
                this.conx(unq, "db.Rename", { path: path, name: name });
                this.stampChange();
            }
            Del(unq, path) {
                this.conx(unq, "db.Del", { path: path });
                this.stampChange();
            }
            conx(unq, cmd, data) {
                this._hass.connection.sendMessagePromise({
                    type: 'conx.cmd',
                    cmd: cmd,
                    unq: unq,
                    data: data
                }).then((respond) => {
                    this.onConxMsg(respond.cmd, respond.unq, respond.payload, undefined === respond.error);
                }, (respond) => {
                    this.onConxMsg(respond.cmd, respond.unq, respond.payload, false);
                });
            }
            onConxMsg(cmd, unq, payload, success) {
            }
            static get properties() {
                return {
                    config: Object,
                    state: String
                };
            }
        }
        HACard.statesIdx = -1;
        HACard.statelessCards = {};
        HACard.statelessStates = {};
        cards.HACard = HACard;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Title extends cards.HACard {
            create() {
                super.create();
                this.innerHTML = `<h1 id="root" width="100%" height="40px" style="font-size: 20px;"></h1>`;
                this.root = conx.glo.findChild(this, "root");
                this.root.innerHTML = this.cfg.name || this.state.attributes.friendly_name;
            }
        }
        cards.Title = Title;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-title', conx.cards.Title);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-title',
    name: 'conx-title',
    description: 'shows entity title',
});
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class NameEditor extends HTMLElement {
            constructor() {
                super();
                this._config = {};
                this._onInput = (ev) => {
                    const value = ev.target.value;
                    const newConfig = Object.assign(Object.assign({}, this._config), { name: value });
                    this._config = newConfig;
                    cards.fireEvent(this, "config-changed", { config: newConfig });
                };
                this._root = this.attachShadow({ mode: "open" });
            }
            setConfig(config) {
                this._config = Object.assign({}, config);
                this._render();
            }
            connectedCallback() {
                this._render();
            }
            _render() {
                var _a;
                this._root.innerHTML = `
      <style>
        .row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
        }
        label { width: 60px; }
        input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
        }
      </style>
      <div class="row">
        <label>Name</label>
        <input type="text" value="${(_a = this._config.name) !== null && _a !== void 0 ? _a : ""}" placeholder="Enter name">
      </div>
    `;
                const input = this._root.querySelector("input");
                if (input) {
                    input.removeEventListener("blur", this._onInput);
                    input.addEventListener("blur", this._onInput);
                }
            }
        }
        cards.NameEditor = NameEditor;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define("name-editor", conx.cards.NameEditor);
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
/// <reference path="nameEditor.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Dimmer extends cards.HACard {
            constructor() {
                super(...arguments);
                this.icon = "mdi:lightbulb";
                this.downTime = 0;
            }
            create() {
                var _a, _b, _c, _d, _e, _f;
                super.create();
                this.icon = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.icon) || this.icon;
                this.css = this.css || {};
                this.css.class = ((_b = this.css) === null || _b === void 0 ? void 0 : _b.class) || "conx-dimmer-bn";
                this.cfg.style = ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.style) || `display: grid; grid-gap: 1px; grid-template-columns:40px auto`;
                this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <button id="toggle" class="${this.css.class}"><ha-icon id="ic" icon="${this.icon}" style="color: #FF0000;"></ha-icon></button>
                <conx-slider id="intensity" width="100%" height="32px" locals='{"align":0, "thumb":3}'/>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
                if ((_d = this.cfg) === null || _d === void 0 ? void 0 : _d.params) {
                    if (undefined !== ((_e = this.cfg) === null || _e === void 0 ? void 0 : _e.params) && typeof ((_f = this.cfg) === null || _f === void 0 ? void 0 : _f.params) === "string")
                        this.cfg.params = JSON.parse(conx.glo.fixOrigin(this.cfg.params));
                    this.root.intensity.copyData(this.root.intensity.params, this.cfg.params);
                }
                const bt = conx.glo.findChild(this.root, 'toggle');
                this.root.toggle = bt;
                conx.controls.Button.SetPrototype(bt, false);
                bt.clickFn = this.onCommand.bind(this, "toggle");
                bt.downFn = this.onCommand.bind(this, "down");
                bt.upFn = this.onCommand.bind(this, "up");
                bt.outFn = this.onCommand.bind(this, "out");
                bt.addEventListener("pointerdown", bt.downFn);
                bt.addEventListener("pointerup", bt.upFn);
                bt.addEventListener("click", bt.clickFn);
                bt.addEventListener("pointerout", bt.outFn);
                this.root.ic = conx.glo.findChild(this.root.toggle, 'ic');
                this.readSlider();
            }
            postCreate() {
                super.postCreate();
            }
            static getConfigElement() {
                return __awaiter(this, void 0, void 0, function* () {
                    return document.createElement("name-editor");
                });
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-dimmer",
                    dimmerColor: "1,0.75,0",
                    params: `{
                    "bg": {"rx":"10", "ry":"10", "style": {"fill": "#919191"}},                    
                    "frame": {"rx":"10", "ry":"10", "style": {"fill":"none",  "stroke": "black", "strokeWidth": "5px"}},
                    "progress": {"style": {"fill": "red"}},
                    "thumb": {"rx":"10", "ry":"10"},
                    "text": {"style": {"fontSize": "20px"}}
                }`
                };
            }
            refreshColors() {
                var _a, _b;
                if (!this.rgba)
                    return false;
                if ((_b = (_a = this.state) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.nonDim)
                    this.root.ic.icon = "mdi:electric-switch";
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = this.root.ic.style.color = conx.glo.RGBAtoHEX(this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
                return true;
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                this.rgba = this.stateToColor(this.state);
                if (!this.refreshColors())
                    return false;
                this.root.intensity._val = this.rgba[3];
                this.root.intensity.updateByValue();
                return true;
            }
            onChange(id, value, pvalue) {
                this.ConxLight("main", { entity_id: this.entities, intensity: value });
                if (!this.rgba)
                    return;
                this.rgba[3] = value;
                this.colorToState(this.rgba);
                this.rgba = this.stateToColor(this.state);
                this.refreshColors();
            }
            onCommand(name) {
                conx.trace.log("cmd", name);
                let bt;
                switch (name) {
                    case "toggle":
                        if (conx.glo.time - this.downTime <= 500) {
                            this.rgba[3] = this.root.intensity._val > 0 ? 0.0 : 1.0;
                            this.colorToState(this.rgba);
                            this.rgba = this.stateToColor(this.state);
                            this.refreshColors();
                            this.root.intensity._val = this.rgba[3];
                            this.root.intensity.updateByValue();
                            this.ConxLight("", { entity_id: this.entities, intensity: this.rgba[3] });
                            this.stampClear();
                        }
                        this.downTime = 0;
                        break;
                    case "down":
                        this.downTime = conx.glo.time;
                        break;
                    case "out":
                        // this.downTime = 0;
                        break;
                    case "up":
                        if (this.downTime > 0 && conx.glo.time - this.downTime > 500) {
                            if (conx.glo.time - this.downTime > 1500) {
                                const event = new Event('hass-more-info', { bubbles: true, composed: true });
                                event.detail = { entityId: this.entities[0] };
                                this.dispatchEvent(event);
                                // this.downTime = 0;
                            }
                            else {
                                const dialog = document.createElement('ha-dialog');
                                dialog.innerHTML = `
                            <h2>Choose a name</h2>
                            <ha-textfield label="entity" value="${this.sliderId}"  style="width:100%;" readonly></ha-textfield>
                            <ha-textfield id="name" label="Name" value="${this.currName}" style="width:100%;"></ha-textfield>  
                            <ha-button id="ok">OK</ha-button>
                        `;
                                document.body.appendChild(dialog);
                                dialog.open = true;
                                dialog.querySelector('#ok').addEventListener('click', () => {
                                    const name = dialog.querySelector('#name');
                                    this.setSliderName(name.value); // already in your code
                                    dialog.close();
                                });
                            }
                        }
                        break;
                }
            }
            onConxMsg(cmd, unq, payload, success) {
                switch (unq) {
                    case "read-slider":
                        if (!payload)
                            this.setSliderName(this.sliderId);
                        else
                            this.setSliderName(payload, false);
                        console.log("slider", payload, success);
                        break;
                }
            }
            get currName() {
                const name = this.root.intensity.locals.title || this.sliderId;
                return name;
            }
            get sliderId() {
                if (this.entities.length <= 0)
                    return "";
                return this.entities.map((e) => e.replace(/^light\./, "")).join("_");
            }
            readSlider() {
                if (this.entities.length <= 0)
                    return;
                this.Get("read-slider", `slider/${this.sliderId}`);
            }
            setSliderName(name, update = true) {
                if (update)
                    this.Set("write-slider-name", `slider/${this.sliderId}`, name, true, true);
                this.root.intensity.locals.title = name;
                this.root.intensity.updateByValue();
            }
        }
        cards.Dimmer = Dimmer;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-dimmer', conx.cards.Dimmer);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-dimmer',
    name: 'conx-dimmer',
    description: 'Control a single light with dimmer.',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Swatch extends cards.HACard {
            constructor() {
                super(...arguments);
                this.transition = 2;
                this.opacity = [];
            }
            create() {
                var _a, _b, _c, _d, _e, _f, _g;
                super.create();
                this.cfg.style = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.style) || `display: inline-block`;
                let html = ``;
                let clr;
                this.transition = (_c = (_b = this.cfg) === null || _b === void 0 ? void 0 : _b.transition) !== null && _c !== void 0 ? _c : 2;
                const len = this.cfg.colors.length;
                this.cfg.buttons = ((_d = this.cfg) === null || _d === void 0 ? void 0 : _d.buttons) || this.cfg.colors.slice(0);
                this.cfg.rgb = { colors: [], buttons: [] };
                this.cfg.rgb.colors.length = len;
                this.cfg.rgb.buttons.length = len;
                this.opacity.length = len;
                for (let i = 0; i < len; ++i) {
                    this.cfg.rgb.colors[i] = conx.glo.HEXtoRGBv(this.cfg.colors[i]);
                    this.cfg.rgb.buttons[i] = conx.glo.HEXtoRGBv(this.cfg.buttons[i]);
                    if (i < ((_f = (_e = this.cfg) === null || _e === void 0 ? void 0 : _e.opacity) === null || _f === void 0 ? void 0 : _f.length))
                        this.opacity[i] = (_g = this.cfg) === null || _g === void 0 ? void 0 : _g.opacity[i];
                    else
                        this.opacity[i] = this.cfg.rgb.buttons[i][3];
                    clr = conx.glo.RGBtoHEXv(this.cfg.rgb.buttons[i]);
                    html += `<button id="clr${i}" class="bn" style="width:50px; height:50px; background-color:${clr};"></button>`;
                }
                this.innerHTML = `<link rel="stylesheet" href="/local/conx.css?v=1"><div id="root" style="${this._style}">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let bt;
                for (let i = 0; i < this.cfg.colors.length; ++i) {
                    bt = conx.glo.findChild(this.root, `clr${i}`);
                    bt.onclick = this.onColor.bind(this, i);
                }
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-swatch",
                    transition: 2,
                    colors: ["#FF0000", "#FFFF00BF", "#00FF0080", "#00FFFF40", "#0000FF", "#FF00FF80"],
                    css: `{"bn": { "border-radius":"50%" }}`
                };
            }
            postCreate() {
                super.postCreate();
            }
            onColor(i) {
                var _a;
                const opc = ((_a = this.opacity) === null || _a === void 0 ? void 0 : _a[i]) || 1;
                const rgb = this.cfg.rgb.colors[i];
                this.ConxLight("", {
                    entity_id: this.entities,
                    intensity: rgb[3],
                    red: rgb[0],
                    green: rgb[1],
                    blue: rgb[2],
                    opacity: opc,
                    transition: this.transition
                });
            }
        }
        cards.Swatch = Swatch;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-swatch', conx.cards.Swatch);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-swatch',
    name: 'conx-swatch',
    description: 'shows color swatches',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Light_RGB extends cards.HACard {
            create() {
                super.create();
                this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#000000"}}}'></conx-slider>
                <conx-slider id="red" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="green" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="blue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#0000FF"}}}'></conx-slider>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                if (false !== this.cfg.showTitle)
                    this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
                else
                    this.root.intensity.locals.title = "";
                this.root.red = conx.glo.findChild(this, "red");
                this.root.red.onChange = this.onChange.bind(this);
                this.root.red.locals.title = "";
                this.root.green = conx.glo.findChild(this, "green");
                this.root.green.onChange = this.onChange.bind(this);
                this.root.green.locals.title = "";
                this.root.blue = conx.glo.findChild(this, "blue");
                this.root.blue.onChange = this.onChange.bind(this);
                this.root.blue.locals.title = "";
            }
            refreshColors() {
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = conx.glo.RGBAtoHEX(this.root.red._val, this.root.green._val, this.root.blue._val, this.root.intensity._val);
                this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = conx.glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = conx.glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = conx.glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                this.root.intensity._val = this.state.attributes.brightness / 255.0;
                this.root.red._val = this.state.attributes.rgb_color[0] / 255.0;
                this.root.green._val = this.state.attributes.rgb_color[1] / 255.0;
                this.root.blue._val = this.state.attributes.rgb_color[2] / 255.0;
                this.refreshColors();
                this.root.intensity.updateByValue();
                this.root.red.updateByValue();
                this.root.green.updateByValue();
                this.root.blue.updateByValue();
                return true;
            }
            onChange(id, value, pvalue) {
                let data = { entity_id: this.entities };
                data[id] = value;
                this.ConxLight(id, data);
                this.refreshColors();
            }
        }
        cards.Light_RGB = Light_RGB;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-light-rgb', conx.cards.Light_RGB);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-rgb',
    name: 'conx-light-rgb',
    description: 'Control a single light with brightness and rgb.',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Light_HSV extends cards.HACard {
            create() {
                super.create();
                let local = window.location.origin;
                this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="saturation" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="hue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"bg":{"style":{"fill":"none"}}, "image":{"href":"${local}/local/images/gradH.png", "visibility":"visible"}}'></conx-slider>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.ondblclick = this.onDBLClick.bind(this);
                this.root.hue = conx.glo.findChild(this, "hue");
                this.root.hue.onChange = this.onChange.bind(this);
                this.root.hue.locals.title = "";
                this.root.saturation = conx.glo.findChild(this, "saturation");
                this.root.saturation.onChange = this.onChange.bind(this);
                this.root.saturation.locals.title = "";
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                if (false !== this.cfg.showTitle)
                    this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
                else
                    this.root.intensity.locals.title = "";
            }
            refreshColors() {
                this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, this.root.intensity._val);
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                this.root.intensity._val = this.state.attributes.brightness / 255.0;
                this.root.hue._val = this.state.attributes.hs_color[0] / 360.0;
                this.root.saturation._val = this.state.attributes.hs_color[1] / 100.0;
                ;
                this.refreshColors();
                this.root.intensity.updateByValue();
                this.root.hue.updateByValue();
                this.root.saturation.updateByValue();
                return true;
            }
            onChange(id, value, pvalue) {
                let data = { entity_id: this.entities };
                data[id] = value;
                this.ConxLight(id, data);
                this.refreshColors();
            }
            onDBLClick() {
                const hex = (conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1) + conx.glo.HSVtoHEX(0, 0, this.root.intensity._val).substring(1, 3)).toUpperCase();
                console.log(hex);
                conx.glo.clipboard.copy(hex);
            }
        }
        cards.Light_HSV = Light_HSV;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-light-hsv', conx.cards.Light_HSV);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-hsv',
    name: 'conx-light-hsv',
    description: 'Control a single light with hsv.',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Light_CLR extends cards.HACard {
            constructor() {
                super(...arguments);
                this.lastHSV = undefined;
            }
            create() {
                super.create();
                let local = window.location.origin;
                this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="saturation" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="hue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"bg":{"style":{"fill":"none"}}, "image":{"href":"${local}/local/images/gradH.png", "visibility":"visible"}}'></conx-slider>
                <conx-slider id="red" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="green" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="blue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#0000FF"}}}'></conx-slider>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.ondblclick = this.onDBLClick.bind(this);
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                if (false !== this.cfg.showTitle)
                    this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
                else
                    this.root.intensity.locals.title = "";
                this.root = conx.glo.findChild(this, "root");
                this.root.hue = conx.glo.findChild(this, "hue");
                this.root.hue.onChange = this.onChange.bind(this);
                this.root.hue.locals.title = "";
                this.root.saturation = conx.glo.findChild(this, "saturation");
                this.root.saturation.onChange = this.onChange.bind(this);
                this.root.saturation.locals.title = "";
                this.root.red = conx.glo.findChild(this, "red");
                this.root.red.onChange = this.onChange.bind(this);
                this.root.red.locals.title = "";
                this.root.green = conx.glo.findChild(this, "green");
                this.root.green.onChange = this.onChange.bind(this);
                this.root.green.locals.title = "";
                this.root.blue = conx.glo.findChild(this, "blue");
                this.root.blue.onChange = this.onChange.bind(this);
                this.root.blue.locals.title = "";
            }
            refreshColors(hsv) {
                this.lastHSV = hsv;
                if (hsv) {
                    let rgb = conx.glo.HSVtoRGB(this.root.hue._val, this.root.saturation._val, this.root.intensity._val);
                    this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
                    this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = conx.glo.RGBtoHEX(rgb[0], rgb[1], rgb[2]);
                    this.refreshRGB(rgb);
                }
                else {
                    let hsv = conx.glo.RGBtoHSV(this.root.red._val, this.root.green._val, this.root.blue._val);
                    this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = conx.glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                    this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = conx.glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                    this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = conx.glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
                    this.refreshHSV(hsv);
                }
            }
            refreshRGB(rgb) {
                this.root.red._val = rgb[0];
                this.root.green._val = rgb[1];
                this.root.blue._val = rgb[2];
                this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = conx.glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = conx.glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = conx.glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
                this.root.red.updateByValue();
                this.root.green.updateByValue();
                this.root.blue.updateByValue();
            }
            refreshHSV(hsv) {
                this.root.intensity._val = hsv[2];
                this.root.hue._val = hsv[0];
                this.root.saturation._val = hsv[1];
                this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = conx.glo.RGBtoHEX(this.root.red._val, this.root.green._val, this.root.blue._val);
                this.root.intensity.updateByValue();
                this.root.hue.updateByValue();
                this.root.saturation.updateByValue();
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                let rgba = this.stateToColor(this.state);
                let hsv = conx.glo.RGBtoHSV(rgba[0], rgba[1], rgba[2]);
                hsv[2] = rgba[3];
                let rgb = conx.glo.HSVtoRGB(hsv[0], hsv[1], hsv[2]);
                this.refreshRGB(rgb);
                this.refreshHSV(hsv);
                return true;
            }
            onChange(id, value, pvalue) {
                let data = { entity_id: this.entities };
                data[id] = value;
                this.ConxLight(id, data);
                this.refreshColors("intensity" === id || "hue" === id || "saturation" === id);
            }
            onDBLClick() {
                const hex = (conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1) + conx.glo.HSVtoHEX(0, 0, this.root.intensity._val).substring(1, 3)).toUpperCase();
                console.log(hex);
                conx.glo.clipboard.copy(hex);
            }
        }
        cards.Light_CLR = Light_CLR;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-light-clr', conx.cards.Light_CLR);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-clr',
    name: 'conx-light-clr',
    description: 'Control a single light with hsv and rgb.',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Numpad extends cards.HACard {
            constructor() {
                super(...arguments);
                this.names = [
                    "$fix", "$rgb", "$sw", "C", "Clear",
                    "7", "8", "9", "+", "Store",
                    "4", "5", "6", "-", "Play",
                    "1", "2", "3", "|", "Delete",
                    ">", "0", ",", ";", "Reload"
                ];
            }
            create() {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                super.create();
                let html = ``;
                if ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.fix1)
                    this.names[0] = (_b = this.cfg) === null || _b === void 0 ? void 0 : _b.fix1;
                if ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.fix2)
                    this.names[1] = (_d = this.cfg) === null || _d === void 0 ? void 0 : _d.fix2;
                if ((_e = this.cfg) === null || _e === void 0 ? void 0 : _e.fix3)
                    this.names[2] = (_f = this.cfg) === null || _f === void 0 ? void 0 : _f.fix3;
                this.css = this.css || {};
                this.css.bn = ((_g = this.css) === null || _g === void 0 ? void 0 : _g.bn) || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #000000 70%, #FFFFFF 100%)" };
                this.css["bn-down"] = ((_h = this.css) === null || _h === void 0 ? void 0 : _h["bn-down"]) || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #808080 0%, #000000 50%)" };
                html += `<label>selection:</label>`;
                html += `<input type="text" id="selection" style="grid-column: 2/6;">`;
                html += `<label>name:</label>`;
                html += `<input type="text" id="name">`;
                html += `<label>timeline:</label>`;
                html += `<input type="text" id="timeline">`;
                html += `<input type="number" id="tran" min="0">`;
                html += `<label>cycle:</label>`;
                html += `<input type="number" id="cycle"  min="0" step="0.5" value="4">`;
                html += `<label style="grid-column: 4;">offset:</label>`;
                html += `<input type="number" id="offset" min="0" max="1" step="0.1" value="0">`;
                for (let i = 0; i < 25; ++i)
                    html += `<button id="bn${i}" class="bn" style="width:100%; height:64px;"></button>`;
                this.innerHTML = `<link rel="stylesheet" href="/local/conx.css?v=1"><div id="root" style="display: grid; grid-gap: 1px; grid-template-columns: 20% 20% 20% 20% 20%;">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let bt;
                this.root.sel = conx.glo.findChild(this.root, "selection");
                this.root.sel.onchange = this.onChange.bind(this, "sel");
                this.root.name = conx.glo.findChild(this.root, "name");
                this.root.name.onchange = this.onChange.bind(this, "name");
                this.root.timeline = conx.glo.findChild(this.root, "timeline");
                this.root.timeline.onchange = this.onChange.bind(this, "timeline");
                this.root.tran = conx.glo.findChild(this.root, "tran");
                this.root.tran.onchange = this.onChange.bind(this, "tran");
                this.root.cycle = conx.glo.findChild(this.root, "cycle");
                this.root.cycle.onchange = this.onChange.bind(this, "cycle");
                this.root.offset = conx.glo.findChild(this.root, "offset");
                this.root.offset.onchange = this.onChange.bind(this, "offset");
                for (let i = 0; i < 25; ++i) {
                    bt = conx.glo.findChild(this.root, `bn${i}`);
                    conx.controls.Button.SetPrototype(bt);
                    this.root[`bn${i}`] = bt;
                    bt.onclick = this.onButton.bind(this, i, this.names[i]);
                }
                this.checkState("conx.selection", this.root.sel, "data", false);
                this.checkState("conx.name", this.root.name, undefined, false);
                this.checkState("conx.timeline", this.root.timeline, undefined, false);
                this.checkState("conx.transition", this.root.tran, undefined, false);
                this.refreshNames();
            }
            postCreate() {
                super.postCreate();
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                this.checkState("conx.selection", this.root.sel, "data");
                this.checkState("conx.name", this.root.name);
                this.checkState("conx.timeline", this.root.timeline);
                this.checkState("conx.transition", this.root.tran);
                return true;
            }
            checkState(entity, elm, data = undefined, checkTime = true) {
                if (checkTime && false === this.hasStateChanged(entity))
                    return;
                if (!data)
                    elm.value = this._hass.states[entity].state;
                else
                    elm.value = this._hass.states[entity].attributes[data];
            }
            onChange(type) {
                switch (type) {
                    case "sel":
                        this._hass.callService("conx", "select", { id: this.root.sel.value });
                        break;
                    case "name":
                        this._hass.callService("conx", "name", { name: this.root.name.value });
                        break;
                    case "timeline":
                        this._hass.callService("conx", "timeline", { timeline: this.root.timeline.value });
                        this.refreshNames();
                        break;
                    case "tran":
                        this._hass.callService("conx", "transition", { value: Number(this.root.tran.value) });
                        break;
                    case "cycle":
                        this.conx("lightParams", "fde.lightParams", { cycle: Number(this.root.cycle.value) });
                        break;
                    case "offset":
                        this.conx("lightParams", "fde.lightParams", { offset: Number(this.root.offset.value) });
                        break;
                }
            }
            refreshNames() {
                var _a;
                let s = "";
                if (((_a = this.root.timeline.value) === null || _a === void 0 ? void 0 : _a.length) > 0)
                    s = "T";
                this.names[9] = "Store" + s;
                this.names[14] = "Play" + s;
                this.names[19] = "Delete" + s;
                this.refreshButtonNames();
            }
            refreshButtonNames() {
                let bt;
                for (let i = 0; i < 25; ++i) {
                    bt = this.root[`bn${i}`];
                    bt.textContent = this.names[i];
                }
            }
            onButton(i, name) {
                let sel = this.root.sel.value;
                switch (name) {
                    case 'Store':
                        if ("StoreT" === this.names[i])
                            this._hass.callService("conx", "TimelineStore", {});
                        else
                            this._hass.callService("conx", "cuestore", {});
                        break;
                    case 'Play':
                        if ("PlayT" === this.names[i])
                            this._hass.callService("conx", "TimelineStart", { name: this.root.timeline.value });
                        else
                            this._hass.callService("conx", "cueplay", {});
                        break;
                    case 'Delete':
                        if ("DeleteT" === this.names[i])
                            this._hass.callService("conx", "TimelineDelete", {});
                        else
                            this._hass.callService("conx", "cuedelete", {});
                        break;
                    case 'Name':
                        this._hass.callService("conx", "name", { name: this.root.name.value });
                        break;
                    case 'Reload':
                        this._hass.callService("conx", "reload", {});
                        break;
                    case 'C':
                        this.root.sel.value = sel.substr(0, sel.length - 1);
                        this.onChange("sel");
                        break;
                    case 'Clear':
                        this.root.sel.value = "";
                        this.onChange("sel");
                        this.root.name.value = "";
                        this.onChange("name");
                        this.root.timeline.value = "";
                        this.onChange("timeline");
                        this._hass.callService("conx", "clear", {});
                        break;
                    default:
                        this.root.sel.value = sel + name;
                        this.onChange("sel");
                }
            }
        }
        cards.Numpad = Numpad;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-numpad', conx.cards.Numpad);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-numpad',
    name: 'conx-numpad',
    description: 'Editors numpad',
});
/// <reference path="../glo.ts" />
/// <reference path="utils.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Button {
            static SetPrototype(that, withStyle = true) {
                that.css = {};
                that._state = "reg";
                that._withStyle = withStyle;
                that._setStyle = (down) => {
                    var _a, _b;
                    if (!that._withStyle)
                        return;
                    let style = that.css[that.state] || ((_a = that.css) === null || _a === void 0 ? void 0 : _a.reg);
                    if (down)
                        style = ((_b = that.css) === null || _b === void 0 ? void 0 : _b.down) || style;
                    if (style)
                        conx.glo.setStyle(that, style);
                };
                that.onPointerdown = (e) => {
                    that.addEventListener("pointerup", that.onPointerup);
                    that.addEventListener("pointerover", that.onPointerover);
                    that.addEventListener("pointerout", that.onPointerout);
                    that._setStyle(true);
                };
                that.onPointerover = (e) => {
                    that._setStyle(true);
                };
                that.onPointerout = (e) => {
                    that._setStyle(false);
                };
                that.onPointerup = (e) => {
                    that.removeEventListener("pointerup", that.onPointerup);
                    that.removeEventListener("pointerover", that.onPointerover);
                    that.removeEventListener("pointerout", that.onPointerup);
                    that._setStyle(false);
                };
                Object.defineProperty(that, "state", {
                    get: function () {
                        return this._state;
                    },
                    set: function (value) {
                        this._state = value;
                        this._setStyle(false);
                    }
                });
                that.addEventListener("pointerdown", that.onPointerdown);
            }
        }
        controls.Button = Button;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class SoftkeysBase extends cards.HACard {
            constructor() {
                super(...arguments);
                this.activeState = "";
                this.skdata = {};
                this.tsStates = {};
                this.skbuttons = [];
                this.cmdRoot = {};
                this.cols = 5;
                this.rows = 5;
                this.startIndex = 0;
                this.viewCount = 25;
                this.MAX_TOTAL_SKS = 512;
            }
            readData(state) {
            }
            checkPath(state) {
                return false;
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                if (false === this.hasStateChanged("conx.db_change"))
                    return false;
                let state = this._hass.states["conx.db_change"];
                if (!state)
                    return false;
                if (false === this.checkPath(state.state))
                    return false;
                this.readData(state.state);
                return true;
            }
            getIcon(type, data = undefined) {
                switch (type) {
                    case "rename": return "mdi:rename-box";
                    case "alias": return "mdi:camera-switch-outline";
                    case "add": return "mdi:tooltip-plus-outline";
                    case "up": return "mdi:arrow-up-bold";
                    case "inf": return "mdi:infinity";
                    case "seq": return "mdi:view-sequential-outline";
                    case "left": return "mdi:arrow-left-bold";
                    case "right": return "mdi:arrow-right-bold";
                    case "folder": return "mdi:folder";
                    case "delete": return "mdi:delete";
                    case "group": return "mdi:lightbulb-group";
                    case "light": return "mdi:lightning-bolt";
                    case "cueplay": return "mdi:play-box";
                    case "timelinestart": return "mdi:play-circle-outline";
                    case "timelinestop": return "mdi:stop-circle-outline";
                    case "timelinego": return "mdi:skip-next-circle-outline";
                    case "edit": return "mdi:pencil";
                    case "script":
                        if (!data || !(data === null || data === void 0 ? void 0 : data.domain) || !(data === null || data === void 0 ? void 0 : data.service))
                            return "mdi:script-outline";
                        let scr = data.domain + "." + data.service;
                        switch (scr) {
                            case "conx.light": return "mdi:lightning-bolt";
                            case "conx.cueplay": return "mdi:play-box";
                            case "conx.cuestore": return "mdi:content-save-outline";
                            case "conx.timelinestart": return "mdi:play-circle-outline";
                            case "conx.timelinestop": return "mdi:stop-circle-outline";
                            case "conx.timelinego": return "mdi:skip-next-circle-outline";
                            default: return "mdi:map-marker-question";
                        }
                }
                return "";
            }
            setActiveState(v) {
                this.activeState = v;
                for (let s in this.cmdRoot)
                    this.cmdRoot[s].state = "reg";
                ;
                if (this.cmdRoot[v])
                    this.cmdRoot[v].state = "sel";
            }
        }
        cards.SoftkeysBase = SoftkeysBase;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
/// <reference path="../controls/button.ts" />
/// <reference path="softkeysbase.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Softkeys extends cards.SoftkeysBase {
            create() {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                super.create();
                this.pathRoot = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.path) || "sk";
                if ("sk" !== this.pathRoot.substr(0, 2))
                    this.pathRoot = "sk/" + this.pathRoot;
                this.path = "";
                this.cols = (_c = (_b = this.cfg) === null || _b === void 0 ? void 0 : _b.cols) !== null && _c !== void 0 ? _c : this.cols;
                this.rows = (_e = (_d = this.cfg) === null || _d === void 0 ? void 0 : _d.rows) !== null && _e !== void 0 ? _e : this.rows;
                this.viewCount = (_g = (_f = this.cfg) === null || _f === void 0 ? void 0 : _f.count) !== null && _g !== void 0 ? _g : this.rows * this.cols;
                let gcols = "";
                for (let i = 0; i < this.cols; ++i)
                    gcols += " " + 100.0 / this.cols + "%";
                const title = conx.glo.isVisible((_h = this.cfg) === null || _h === void 0 ? void 0 : _h.showTitle, this.isAdmin) ? "grid" : "none";
                let htmlT = ``;
                htmlT += `<label id="crams" class="title" style="display:${title}; height:16px; grid-column: 1/6;">sk</label>`;
                htmlT +=
                    `<div id="nav" style="display:${title}; grid-gap:0px; grid-template-columns:auto auto auto; width:100%; height:32px;">
                        <button id="left" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("left")}"></ha-icon></button>
                        <button id="up" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("up")}"></ha-icon></button>
                        <button id="right" class="cmd" style="width:100%; height:32px; grid-column:3;"><ha-icon icon="${this.getIcon("right")}"></ha-icon></button>
                </div>`;
                htmlT += `<button id="delete" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 2;"><ha-icon icon="${this.getIcon("delete")}"></ha-icon></button>`;
                htmlT += `<button id="folder" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 3;"><ha-icon icon="${this.getIcon("folder")}"></ha-icon></button>`;
                htmlT += `<button id="group" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 4};"><ha-icon icon="${this.getIcon("group")}"></ha-icon></button>`;
                if (!this.isAdmin)
                    htmlT += `<button id="script" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 5;"><ha-icon icon="${this.getIcon("script")}"></ha-icon></button>`;
                else
                    htmlT +=
                        `<div id="editdiv" style="display:${title}; grid-gap:0px; grid-template-columns:40% 60%; width:100%; height:32px;">
                            <button id="edit" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("edit")}"></ha-icon></button>
                            <button id="script" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("script")}"></ha-icon></button>
                    </div>`;
                let htmlB = ``;
                for (let i = 0; i < this.viewCount; ++i)
                    htmlB +=
                        `<button id="bn${i}" class="bn" style="position:relative; width:100%; height:64px;">                        
                        <ha-icon id="ic" icon=""></ha-icon>
                        <label id="tx" class="text"></label>
                        <label id="nm" class="num" style="position:absolute; top:0px; left:0px; font-size:12px; color:#404040">99</label>
                    </button>`;
                this.innerHTML =
                    `<div id="root" style="${this._style}">
                    <div id="trid" style="display:grid; grid-gap:1px; grid-template-columns: 20% 20% 20% 20% 20%;">${htmlT}</div>
                    <div id="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${htmlB}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;
                this.root = conx.glo.findChild(this, "root");
                this.editor = conx.glo.findChild(this, "editor");
                this.onYAMLChange = this.onYAMLChange.bind(this);
                const btNames = ["up", "left", "right", "folder", "delete", "group", "edit", "script"];
                let bt, i;
                this.root['crams'] = conx.glo.findChild(this.root, 'crams');
                for (i = 0; i < btNames.length; ++i) {
                    const name = btNames[i];
                    bt = conx.glo.findChild(this.root, name);
                    if (bt) {
                        conx.controls.Button.SetPrototype(bt);
                        this.cmdRoot[name] = bt;
                        bt.onclick = this.onCommand.bind(this, name);
                    }
                }
                for (let i = 0; i < this.viewCount; ++i) {
                    bt = conx.glo.findChild(this.root, `bn${i}`);
                    conx.controls.Button.SetPrototype(bt);
                    bt["ic"] = conx.glo.findChild(bt, "ic");
                    bt["tx"] = conx.glo.findChild(bt, "tx");
                    bt["nm"] = conx.glo.findChild(bt, "nm");
                    this.root[`bn${i}`] = bt;
                    bt.onclick = this.onButton.bind(this, i);
                }
                this.readData(null);
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-softkeys",
                    path: "sk",
                    cols: 5,
                    rows: 3,
                    showTitle: true,
                    css: `{
    "bn": { "backgroundImage": "linear-gradient( 30deg, blue 70%, #FFFFFF 100%)" }, 
    "bn-down": { "backgroundImage": "linear-gradient( 30deg, #808080 0%, #000000 50%)" },  
    "cmd": { "background-color": "orange" },
    "cmd-down": { "background-color": "#802020" },
    "cmd-sel": { "background-color": "#FF2020" },
    "text": { "color": "#FFFFFF" }, 
    "num": { "color": "#303000" }
}`
                };
            }
            readData(state) {
                this.Get("sk-read", this.getPath());
                this.root["crams"].textContent = this.getPath();
                this.cmdRoot["up"].style.display = this.path.length > 0 ? "block" : "none";
                this.cmdRoot["left"].style.display = this.startIndex > 0 ? "block" : "none";
                this.cmdRoot["right"].style.display = this.startIndex < this.MAX_TOTAL_SKS - this.viewCount ? "block" : "none";
            }
            postCreate() {
                super.postCreate();
            }
            checkPath(state) {
                let path = conx.glo.up(state);
                if (this.getPath() !== path && this.getPath() !== conx.glo.up(path))
                    return false;
                return true;
            }
            getPath() {
                if (this.path.length <= 0)
                    return this.pathRoot;
                return this.pathRoot + "/" + this.path;
            }
            onButton(i) {
                var _a;
                i += this.startIndex;
                let sk = (_a = this.skbuttons) === null || _a === void 0 ? void 0 : _a[i];
                if (undefined === sk) {
                    if ("edit" === this.activeState) {
                        this.editor.showYAML({
                            name: "new softkey",
                            info: {
                                type: "script",
                                idx: i,
                                data: {
                                    domain: "<domain>",
                                    service: "<service>",
                                    data: { soft: true }
                                }
                            }
                        }, {
                            i: i,
                            name: "new"
                        }, this.onYAMLChange);
                    }
                    else
                        this.conx("sk-save", "db.SaveSK", { path: this.getPath(), type: this.activeState, idx: i });
                    this.setActiveState("");
                    return;
                }
                switch (this.activeState) {
                    case "delete":
                        this.conx("sk-save", "db.SaveSK", { path: this.getPath() + "/" + sk.name, type: this.activeState, idx: i });
                        break;
                    case "edit":
                        if (true === this.isAdmin)
                            this.editor.showYAML({ name: sk.name, info: this.skdata[sk.name] }, { i: i, name: sk.name }, this.onYAMLChange);
                        break;
                    default:
                        if ("folder" !== sk.data.type)
                            this.conx("sk-play", "db.PlaySK", { path: this.getPath() + "/" + sk.name, idx: i });
                        else {
                            this.path += ((this.path.length > 0) ? "/" : "") + sk.name + "/data";
                            this.readData(null);
                        }
                        break;
                }
                this.setActiveState("");
            }
            onCommand(name) {
                conx.trace.log("cmd", name);
                let bt;
                switch (name) {
                    case "delete":
                    case "group":
                    case "script":
                    case "folder":
                    case "edit":
                        bt = this.cmdRoot[name];
                        if (undefined !== bt) {
                            if ("reg" === bt.state)
                                this.setActiveState(name);
                            else
                                this.setActiveState("");
                        }
                        break;
                    case "up":
                        this.path = this.path.substr(0, this.path.lastIndexOf("/"));
                        this.path = this.path.substr(0, this.path.lastIndexOf("/"));
                        this.readData(null);
                        break;
                    case "left":
                        this.startIndex -= this.viewCount;
                        if (this.startIndex < 0)
                            this.startIndex = 0;
                        this.refreshButtons();
                        this.readData(null);
                        break;
                    case "right":
                        this.startIndex += this.viewCount;
                        this.refreshButtons();
                        this.readData(null);
                        break;
                }
            }
            onYAMLChange(cmd, data) {
                var _a;
                const nameChange = cmd.name !== data.name;
                const name = data.name;
                data = data.info;
                data.idx = (_a = data.idx) !== null && _a !== void 0 ? _a : cmd.i;
                const idxChange = data.idx !== cmd.i;
                if (typeof data.data === "object")
                    data.data.soft = true;
                this.Set("write-sk", this.getPath() + `/${name}`, data);
                if (nameChange)
                    this.Del("write-sk", this.getPath() + `/${cmd.name}`);
            }
            onConxMsg(cmd, unq, payload, success) {
                // trace.log(cmd, unq, payload, success)
                switch (unq) {
                    case "sk-read":
                        if (false === success)
                            this.skdata = {};
                        else
                            this.skdata = payload;
                        this.refreshButtons();
                        break;
                }
            }
            refreshData() {
                this.skbuttons = [];
                let idx, sk;
                for (let s in this.skdata) {
                    sk = this.skdata[s];
                    idx = sk === null || sk === void 0 ? void 0 : sk.idx;
                    this.skbuttons[idx] = { name: s, data: sk };
                }
            }
            refreshButtons() {
                var _a, _b;
                this.refreshData();
                let bt, sk, bi;
                for (let vi = 0; vi < this.viewCount; ++vi) {
                    bi = this.startIndex + vi;
                    bt = this.root[`bn${vi}`];
                    if (!bt)
                        continue;
                    if (bi >= this.MAX_TOTAL_SKS) {
                        bt.style.display = "none";
                        continue;
                    }
                    else
                        bt.style.display = "block";
                    sk = this.skbuttons[bi];
                    bt.nm.textContent = "" + (1 + bi);
                    if (undefined === sk) {
                        bt.ic.icon = "";
                        bt.tx.textContent = "";
                    }
                    else {
                        bt.ic.icon = this.getIcon((_a = sk === null || sk === void 0 ? void 0 : sk.data) === null || _a === void 0 ? void 0 : _a.type, (_b = sk === null || sk === void 0 ? void 0 : sk.data) === null || _b === void 0 ? void 0 : _b.data);
                        bt.tx.textContent = sk === null || sk === void 0 ? void 0 : sk.name;
                    }
                }
            }
        }
        cards.Softkeys = Softkeys;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-softkeys', conx.cards.Softkeys);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-softkeys',
    name: 'conx-softkeys',
    description: 'Softkeys',
});
/// <reference path="../glo.ts" /> 
function loadCodeMirror(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const wnd = conx.glo.wnd;
        if (!(wnd === null || wnd === void 0 ? void 0 : wnd.codeMirrorState)) {
            wnd.codeMirrorState = "loading";
            let script = document.createElement('script');
            script.src = window.location.origin + "/local/codemirror.min.js";
            script.async = false;
            document.body.append(script);
            for (let i = 0; i < 10; ++i) {
                if (wnd.__codemirror_css) {
                    wnd.codeMirrorState = "loaded";
                    callback();
                    break;
                }
                yield conx.glo.wait(500);
            }
            if (wnd.codeMirrorState !== "loaded")
                console.log("Failed to Load Code Mirror");
        }
    });
}
var conx;
(function (conx) {
    class CodeEditor extends HTMLElement {
        constructor() {
            super();
            this.active = false;
            this._onClick = (event) => {
                if (event.target === this.cancel) {
                    this.show = false;
                    this.clean();
                    return;
                }
                if (event.target !== this.modal && event.target !== this.save)
                    return;
                this.show = false;
                const val = this.codemirror.getValue();
                const code = conx.glo.yaml.load(val);
                if (undefined !== this.callerCmd && this.callerCallback && code)
                    this.callerCallback(this.callerCmd, code);
                this.clean();
            };
            this.innerHTML =
                `<link rel="stylesheet" href="/local/conx.css?v=1">
                <div id="modal" style="display:none; position:fixed; inset:0; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); z-index:2147483647;">
                    <div class="yaml-editor" style="width:min(900px,90vw); max-height:85vh; background:#000; color:#fff; border-radius:12px; box-shadow:0 10px 32px rgba(0,0,0,0.5); overflow:hidden; display:flex; flex-direction:column;">
                        <div id="holder" style="flex:1; overflow:auto; padding:12px 16px; background:#111; min-height:200px;"></div>
                        <div class="actions" style="display:flex; gap:8px; justify-content:flex-end; padding:12px 16px; border-top:1px solid rgba(255,255,255,0.08);">
                            <button class="conx-button-silver" id="save">Save</button>
                            <button class="conx-button-silver" id="cancel">Cancel</button>
                        </div>
                    </div>
                </div>`;
            const holder = conx.glo.findChild(this, "holder");
            this.holder = holder.attachShadow({ mode: "open" });
            this.onCodeMirrorLoaded = this.onCodeMirrorLoaded.bind(this);
            //this.initCodeMirror(shadowRoot);
            this.modal = conx.glo.findChild(this, "modal");
            this.save = conx.glo.findChild(this, "save");
            this.cancel = conx.glo.findChild(this, "cancel");
            this.onclick = this._onClick;
        }
        connectedCallback() {
            this.active = this.codemirror !== undefined;
        }
        disconnectedCallback() {
            this.active = false;
        }
        showYAML(data, cmd, callback) {
            this.callerCmd = cmd;
            this.callerCallback = callback;
            this.showCode(conx.glo.yaml.dump(data));
        }
        showCode(code) {
            this.code = code;
            this.checkCodeMirror();
            if (false === this.active)
                return;
            this.codemirror.setValue(code);
            this.show = true;
        }
        get show() {
            return this.modal.style.display === "flex";
        }
        set show(v) {
            if (false === this.active)
                return;
            if (false === v) {
                this.modal.style.display = "none";
                return;
            }
            this.modal.style.display = "flex";
            this.codemirror.refresh();
            this.codemirror.focus();
        }
        clean() {
            this.callerCmd = undefined;
            this.callerCallback = undefined;
            this.codemirror.setValue("");
        }
        checkCodeMirror() {
            if (this.active)
                return true;
            if (!conx.glo.wnd.__codemirror_css) {
                if (conx.glo.wnd.codeMirrorState)
                    return false;
                loadCodeMirror(this.onCodeMirrorLoaded);
                if (!conx.glo.wnd.__codemirror_css)
                    return false;
            }
            this.initCodeMirror();
            this.active = this.codemirror !== undefined;
            return this.active;
        }
        onCodeMirrorLoaded() {
            if (!conx.glo.wnd.__codemirror_css)
                return;
            this.initCodeMirror();
            this.active = this.codemirror !== undefined;
            if (false === this.active)
                return;
            this.codemirror.setValue(this.code);
            this.show = true;
        }
        initCodeMirror() {
            this.holder.innerHTML = `
            <style>${conx.glo.wnd.__codemirror_css}</style>`;
            this.codemirror = conx.glo.wnd.CodeMirror(this.holder, {
                value: "",
                lineNumbers: true,
                lineWrapping: true,
                matchBrackets: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                tabSize: 2,
                mode: "yaml",
                autofocus: true,
                viewportMargin: Infinity,
                extraKeys: {
                    Tab: "indentMore",
                    "Shift-Tab": "indentLess",
                    "Ctrl-Q": (cm) => cm.foldCode(cm.getCursor()),
                    "Ctrl-Y": (cm) => conx.glo.wnd.CodeMirror.commands.foldAll(cm),
                    "Ctrl-I": (cm) => conx.glo.wnd.CodeMirror.commands.unfoldAll(cm),
                },
            });
        }
    }
    conx.CodeEditor = CodeEditor;
})(conx || (conx = {}));
customElements.define('conx-code-editor', conx.CodeEditor);
/// <reference path="../controls/button.ts" />
/// <reference path="softkeysbase.ts" />
/// <reference path="../controls/codeEditor.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class SoftkeysCues extends cards.SoftkeysBase {
            create() {
                var _a, _b, _c, _d;
                super.create();
                this.pathRoot = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.path) || "";
                this.path = "";
                this.cols = ((_b = this.cfg) === null || _b === void 0 ? void 0 : _b.cols) || this.cols;
                this.rows = ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.rows) || this.rows;
                this.viewCount = ((_d = this.cfg) === null || _d === void 0 ? void 0 : _d.count) || this.rows * this.cols;
                let gcols = "";
                for (let i = 0; i < this.cols; ++i)
                    gcols += " " + 100.0 / this.cols + "%";
                let htmlT = ``;
                htmlT += `<label id="crams" class="title" style="height:16px; grid-column: 1/6;">sk</label>`;
                htmlT +=
                    `<div id="nav" style="display:grid; grid-gap:0px; grid-template-columns:auto auto auto; width:100%; height:32px;">
                    <button id="left" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("left")}"></ha-icon></button>
                    <button id="up" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("up")}"></ha-icon></button>
                    <button id="right" class="cmd" style="width:100%; height:32px; grid-column:3;"><ha-icon icon="${this.getIcon("right")}"></ha-icon></button>
                </div>`;
                htmlT += `<button id="play" class="cmd" style="width:100%; height:32px; grid-column: 2;"><ha-icon icon="${this.getIcon("cueplay")}"></ha-icon></button>`;
                if (true === this.isAdmin)
                    htmlT += `<button id="edit" class="cmd" style="width:100%; height:32px; grid-column: 3;"><ha-icon icon="${this.getIcon("edit")}"></ha-icon></button>`;
                htmlT += `<button id="rename" class="cmd" style="width:100%; height:32px; grid-column: 4;"><ha-icon icon="${this.getIcon("rename")}"></ha-icon></button>`;
                htmlT += `<button id="delete" class="cmd" style="width:100%; height:32px; grid-column: 5;"><ha-icon icon="${this.getIcon("delete")}"></ha-icon></button>`;
                let htmlB = ``;
                for (let i = 0; i < this.viewCount; ++i)
                    htmlB += `
                    <button id="bn${i}" class="bn" style="position:relative; width:100%; height:64px;">                        
                        <ha-icon id="ic" icon=""></ha-icon>
                        <label id="tx" class="text"></label>
                        <label id="nm" class="num" style="position:absolute; top:0px; left:0px; font-size:12px; color:#404040">99</label>
                    </button>
                    `;
                this.innerHTML =
                    `<div id="root" style="${this._style}">
                    <div id="trid" style="display:grid; grid-gap:1px; grid-template-columns: 20% 20% 20% 20% 20%;">${htmlT}</div>
                    <div id="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${htmlB}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;
                this.root = conx.glo.findChild(this, "root");
                this.editor = conx.glo.findChild(this, "editor");
                this.onYAMLChange = this.onYAMLChange.bind(this);
                const btNames = ["up", "left", "right", "play", "edit", "rename", "delete"];
                let bt, i;
                this.root['crams'] = conx.glo.findChild(this.root, 'crams');
                for (i = 0; i < btNames.length; ++i) {
                    const name = btNames[i];
                    bt = conx.glo.findChild(this.root, name);
                    if (bt) {
                        conx.controls.Button.SetPrototype(bt);
                        this.cmdRoot[name] = bt;
                        bt.onclick = this.onCommand.bind(this, name);
                    }
                }
                for (let i = 0; i < this.viewCount; ++i) {
                    bt = conx.glo.findChild(this.root, `bn${i}`);
                    conx.controls.Button.SetPrototype(bt);
                    bt["ic"] = conx.glo.findChild(bt, "ic");
                    bt["tx"] = conx.glo.findChild(bt, "tx");
                    bt["nm"] = conx.glo.findChild(bt, "nm");
                    this.root[`bn${i}`] = bt;
                    bt.onclick = this.onButton.bind(this, i);
                }
                this.readData(null);
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-cues",
                    cols: 5,
                    rows: 3,
                    css: `{
    "bn": { "backgroundImage": "linear-gradient( 30deg, #850000 70%, #FFFFFF 100%)" }, 
    "bn-down": { "backgroundImage": "linear-gradient( 30deg, #808080 0%, #000000 50%)" },  
    "cmd": { "background-color": "orange" },
    "cmd-down": { "background-color": "#802020" },
    "cmd-sel": { "background-color": "#FF2020" },
    "text": { "color": "#FFFFFF" }, 
    "num": { "color": "#303000" }
}`
                };
            }
            readData(state) {
                this.Get("cues-read", "cues");
                this.refreshCommands();
            }
            refreshCommands() {
                const path = this.getPath();
                this.root["crams"].textContent = path;
                const data = conx.glo.get(this.skdata, path, "-");
                const type = data === this.skdata || !(data === null || data === void 0 ? void 0 : data.__type) ? "folder" : data.__type;
                this.cmdRoot["play"].style.display = type === "folder" ? "block" : "none";
                this.cmdRoot["rename"].style.display = type === "folder" ? "block" : "none";
                this.cmdRoot["edit"].style.display = type === "folder" || type === "cue" ? "block" : "none";
                this.cmdRoot["up"].style.display = path.length > 0 ? "block" : "none";
                this.cmdRoot["left"].style.display = this.startIndex > 0 ? "block" : "none";
                this.cmdRoot["right"].style.display = this.startIndex < this.MAX_TOTAL_SKS - this.viewCount ? "block" : "none";
            }
            postCreate() {
                super.postCreate();
            }
            checkPath(state) {
                let path = conx.glo.up(state);
                return 0 === path.indexOf("cues");
            }
            getPath() {
                if (this.path.length <= 0)
                    return this.pathRoot;
                if (this.pathRoot.length <= 0)
                    return this.path;
                return this.pathRoot + "-" + this.path;
            }
            onButton(i) {
                var _a;
                i += this.startIndex;
                let sk = (_a = this.skbuttons) === null || _a === void 0 ? void 0 : _a[i];
                if (undefined === sk) {
                    // todo
                    this.setActiveState("");
                    return;
                }
                switch (this.activeState) {
                    case "delete":
                        switch (sk.type) {
                            case "cue":
                                this.CallService("conx", "cuedelete", { name: sk.path, entity_id: [] });
                                break;
                            case "light":
                                this.CallService("conx", "cuedelete", { name: conx.glo.up(sk.path, "-"), entity_id: sk.name });
                                break;
                        }
                        break;
                    case "play":
                        if ("cue" === sk.type)
                            this.CallService("conx", "cueplay", { name: sk.path });
                        break;
                    case "edit":
                        if (true === this.isAdmin) {
                            if ("cue" === sk.type)
                                this.editor.showYAML(sk.data, { cmd: "edit", sk: sk }, this.onYAMLChange);
                            else if ("light" === sk.type)
                                this.editor.showYAML(sk.data, { cmd: "edit", sk: sk }, this.onYAMLChange);
                        }
                        break;
                    case "rename":
                        if ("cue" === sk.type)
                            this.editor.showYAML({ name: sk.path }, { cmd: "rename", sk: sk }, this.onYAMLChange);
                        break;
                    default:
                        if ("folder" === sk.type || "cue" === sk.type) {
                            this.path += this.path.length > 0 ? "-" + sk.name : sk.name;
                            this.startIndex = 0;
                            this.refreshButtons();
                            this.refreshCommands();
                        }
                        else if (true === this.isAdmin)
                            this.editor.showYAML(sk.data, { cmd: "edit", sk: sk }, this.onYAMLChange);
                        break;
                }
                this.setActiveState("");
            }
            onCommand(name) {
                conx.trace.log("cmd", name);
                let bt;
                switch (name) {
                    case "play":
                    case "edit":
                    case "rename":
                    case "delete":
                        bt = this.cmdRoot[name];
                        if (undefined !== bt) {
                            if ("reg" === bt.state)
                                this.setActiveState(name);
                            else
                                this.setActiveState("");
                        }
                        break;
                    case "up":
                        this.path = conx.glo.up(this.path, "-");
                        this.refreshButtons();
                        this.refreshCommands();
                        break;
                    case "left":
                        this.startIndex -= this.viewCount;
                        if (this.startIndex < 0)
                            this.startIndex = 0;
                        this.refreshButtons();
                        this.refreshCommands();
                        break;
                    case "right":
                        this.startIndex += this.viewCount;
                        this.refreshButtons();
                        this.refreshCommands();
                        break;
                }
            }
            onYAMLChange(cmd, data) {
                console.log(cmd, data);
                const sk = cmd.sk;
                if ("rename" === (cmd === null || cmd === void 0 ? void 0 : cmd.cmd)) {
                    this.Rename("rename-cue", `cues/${sk.path}`, data.name);
                    return;
                }
                if ("cue" === sk.type) {
                    const src = sk.data;
                    for (let l in src) {
                        if (!data[l])
                            this.Del("delete-cue-light", `cues/${sk.path}/${l}`);
                    }
                    for (let l in data)
                        this.Set("write-cue-light", `cues/${sk.path}/${l}`, data[l]);
                }
                else if ("light" === sk.type)
                    this.Set("write-cue-light", `cues/${conx.glo.up(sk.path, "-")}/${sk.name}`, data);
            }
            onConxMsg(cmd, unq, payload, success) {
                // trace.log(cmd, unq, payload, success)
                switch (unq) {
                    case "cues-read":
                        if (false === success)
                            this.skdata = {};
                        else {
                            this.processData(payload);
                        }
                        this.refreshButtons();
                        break;
                }
            }
            processData(payload) {
                this.skdata = {};
                let ids, types = [], cue, len;
                for (let c in payload) {
                    cue = payload[c];
                    ids = c.split("-");
                    len = ids.length;
                    types.length = len;
                    types.fill("folder");
                    types[len - 1] = "cue";
                    conx.glo.set(this.skdata, ids, cue, "__type", types);
                }
            }
            refreshData() {
                this.skbuttons = [];
                const path = this.getPath();
                const delimeter = path.length > 0 ? "-" : "";
                const data = conx.glo.get(this.skdata, path, "-");
                let idx = 0, sk;
                for (let s in data) {
                    if ("__type" === s)
                        continue;
                    sk = data[s];
                    this.skbuttons[idx] = { name: s, data: sk, type: (sk === null || sk === void 0 ? void 0 : sk.__type) ? sk.__type : "light", parent: data, path: path + delimeter + s };
                    ++idx;
                }
            }
            type2icon(type) {
                switch (type) {
                    case "cue": return "";
                    case "folder": return "folder";
                    case "light": return "light";
                }
                return "";
            }
            refreshButtons() {
                this.refreshData();
                let bt, sk, bi;
                for (let vi = 0; vi < this.viewCount; ++vi) {
                    bi = this.startIndex + vi;
                    bt = this.root[`bn${vi}`];
                    if (!bt)
                        continue;
                    if (bi >= this.MAX_TOTAL_SKS) {
                        bt.style.display = "none";
                        continue;
                    }
                    else
                        bt.style.display = "block";
                    sk = this.skbuttons[bi];
                    bt.nm.textContent = "" + (1 + bi);
                    if (undefined === sk) {
                        bt.ic.icon = "";
                        bt.tx.textContent = "";
                    }
                    else {
                        bt.ic.icon = this.getIcon(this.type2icon(sk === null || sk === void 0 ? void 0 : sk.type));
                        bt.tx.textContent = sk === null || sk === void 0 ? void 0 : sk.name;
                    }
                }
            }
        }
        cards.SoftkeysCues = SoftkeysCues;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-cues', conx.cards.SoftkeysCues);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-cues',
    name: 'conx-cues',
    description: 'Cues',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
/// <reference path="../controls/codeEditor.ts" />
const POPUP_YAML = `
style: >-
  text-align: center; position: absolute; z-index: 1; left: 50%; width: 400px;
  padding: 0px 0px 20px 0px; border-radius: 10px; color: #333; background-color: #fff;
  transition: transform 0.5s, top 0.5s;
hstyle: >-
  font-size: 40px;
pstyle: >-
  font-size: 22px; direction: rtl;
openStyle:
  visibility: visible
  top: 50%
  transform: translate(-50%,-50%) scale(1)
closeStyle:
  visibility: hidden
  top: 0%
  transform: translate(-50%,-50%) scale(0.1)
bnStyle:
  backgroundImage: 'linear-gradient( 30deg, #000000 70%, #FFFFFF 100%)'
  color: white
  border-radius: 30px
  width: 100px
  height: 64px
title: הפעלת תרחיש
message: האם אתה בטוח ?  
flip: true
'yes': כן
'no': לא
`;
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class RadioButtonGroup extends cards.HACard {
            constructor() {
                super(...arguments);
                this.cols = 5;
                this.rows = 1;
                this.buttonMap = {};
                this.idx2iMap = {};
                this.activeI = -1;
                this.activeIdx = -1;
                this.yamlI = -1;
                this.activeName = "";
                this.downTimeoutId = -1;
                this.longclickIndex = 0;
            }
            create() {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                super.create();
                if (undefined === ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.group)) {
                    this.ErrorView("You must supply a group name");
                    return;
                }
                if (undefined === ((_b = this.cfg) === null || _b === void 0 ? void 0 : _b.buttons)) {
                    this.ErrorView("You must supply array of buttons");
                    return;
                }
                if (undefined === ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.cols)) {
                    this.ErrorView("You must supply array of cols");
                    return;
                }
                const isClass = undefined !== this.cfg.class;
                const withStyle = undefined !== this.cfg.css && false === isClass;
                const cls = this.cfg.class || "radio";
                this.group = (_d = this.cfg) === null || _d === void 0 ? void 0 : _d.group;
                this.gpath = `conx.radio/${this.group.toLowerCase()}`.replace("/", "_s_l");
                this.buttons = JSON.parse(JSON.stringify((_e = this.cfg) === null || _e === void 0 ? void 0 : _e.buttons));
                this.cols = ((_f = this.cfg) === null || _f === void 0 ? void 0 : _f.cols) || this.cols;
                this.count = this.buttons.length;
                this.rows = Math.ceil(this.count / this.cols);
                let btCfg;
                for (let i = 0; i < this.count; ++i) {
                    btCfg = this.buttons[i];
                    if (undefined === (btCfg === null || btCfg === void 0 ? void 0 : btCfg.idx))
                        btCfg.idx = i;
                    this.idx2iMap[btCfg.idx] = i;
                }
                const wdp = 100.0 / (this.cols || 1);
                let gcols = "";
                for (let i = 0; i < this.cols; ++i)
                    gcols += " " + wdp + "%";
                let html = ``;
                for (let i = 0; i < this.count; ++i) {
                    html +=
                        `<button id="bt${i}" class="${cls}" ${withStyle ? 'style="width:100%; height:50px; background-color:#ff0000;"' : ''}>
                        <label id="tx" class="text">x</label>
                    </button>`;
                }
                let popupHtml = ``;
                if ((_g = this.cfg) === null || _g === void 0 ? void 0 : _g.popup) {
                    const popup = (_h = this.cfg) === null || _h === void 0 ? void 0 : _h.popup;
                    const lib = popup === null || popup === void 0 ? void 0 : popup.lib;
                    if (lib) {
                        delete popup.lib;
                        const yaml = (_j = conx.glo.lib) === null || _j === void 0 ? void 0 : _j[lib];
                        if (yaml)
                            conx.glo.fixByYAML(popup, yaml);
                    }
                    if (Object.keys(popup).length === 0)
                        conx.glo.fixByYAML(popup, POPUP_YAML);
                    this.cfg.popup = popup;
                    this.pcfg = popup;
                    if (!(popup === null || popup === void 0 ? void 0 : popup.bnStyle) && ((_k = this.css) === null || _k === void 0 ? void 0 : _k.radio))
                        popup.bnStyle = this.css.radio;
                    const buttonsHtml = (popup === null || popup === void 0 ? void 0 : popup.flip) ?
                        `<button id="no">${popup.no}</button>
                         <button id="yes">${popup.yes}</button>`
                        :
                            `<button id="yes">${popup.yes}</button>
                         <button id="no">${popup.no}</button>`;
                    popupHtml =
                        `<div id="popup" style="${popup.style}">
                        <h2 style="${popup.hstyle}">${popup.title}</h2>
                        <p style="${popup.pstyle}">${popup.message}</p>
                        ${buttonsHtml}
                    </div>`;
                }
                this.innerHTML =
                    `<div id="root" style="${this._style}">
                    ${popupHtml}
                    <div id="grid" class="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${html}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;
                this.root = conx.glo.findChild(this, "root");
                this.popup = conx.glo.findChild(this.root, "popup");
                this.editor = conx.glo.findChild(this, "editor");
                this.onYAMLChange = this.onYAMLChange.bind(this);
                this.showPopup(false);
                let bt;
                for (let i = 0; i < this.count; ++i) {
                    btCfg = this.buttons[i];
                    bt = conx.glo.findChild(this.root, `bt${i}`);
                    conx.controls.Button.SetPrototype(bt, withStyle);
                    btCfg["bt"] = bt;
                    bt["tx"] = conx.glo.findChild(bt, "tx");
                    if (this.isAdmin)
                        bt.ondblclick = this.onDBLClick.bind(this, i);
                    this.root[`bt${i}`] = bt;
                }
                if (this.popup) {
                    this.pcfg.buttons = [];
                    bt = conx.glo.findChild(this.popup, "yes");
                    conx.glo.setStyle(bt, this.pcfg.bnStyle);
                    bt.onclick = this.onPopupClick.bind(this, bt.id);
                    this.pcfg.buttons.push(bt);
                    bt = conx.glo.findChild(this.popup, "no");
                    conx.glo.setStyle(bt, this.pcfg.bnStyle);
                    bt.onclick = this.onPopupClick.bind(this, bt.id);
                    this.pcfg.buttons.push(bt);
                    this.onOutPopup = this.onPopupClick.bind(this, "out");
                }
                this.readGroupData("read");
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-radio-group",
                    group: "day",
                    cols: 5,
                    buttons: [{ idx: 0 }, { idx: 1 }, { idx: 2 }, { idx: 3 }, { idx: 4 }],
                    css: `{
    "radio": { "backgroundImage": "linear-gradient( 30deg, #000000 70%, #FFFFFF 100%)", "border-radius":"30px" }, 
    "radio-down": { "backgroundImage": "linear-gradient( 0deg, #808080 0%, #000000 50%)" }, 
    "radio-sel": { "background-color":"orange", "backgroundImage": null }, 
    "text": { "color": "#FFFFFF" }
}`
                };
            }
            readGroup() {
                this.Get("radio-group", `radio/${this.group}/__value`);
            }
            readGroupData(cmd) {
                this.Get("radio-group-data-" + cmd, `radio/${this.group}`);
            }
            setRadioGroupData(data) {
                var _a;
                this.buttonsData = data === null || data === void 0 ? void 0 : data.buttons;
                this.buttonMap = {};
                let bt;
                for (let i = 0; i < ((_a = this.buttonsData) === null || _a === void 0 ? void 0 : _a.length); ++i) {
                    bt = this.buttonsData[i];
                    this.buttonMap[bt.name] = i;
                }
                this.setActiveButton(data === null || data === void 0 ? void 0 : data.__value);
            }
            clearEvents(bt) {
                if (bt.downFn)
                    bt.removeEventListener("pointerdown", bt.downFn);
                if (bt.upFn)
                    bt.removeEventListener("pointerup", bt.upFn);
                if (bt.clickFn)
                    bt.removeEventListener("click", bt.clickFn);
                bt.removeEventListener("pointerout", bt.outFn);
                bt.removeEventListener("pointercancel", bt.outFn);
                bt.clickFn = undefined;
            }
            onRadioGroupData(data) {
                var _a, _b, _c;
                this.setRadioGroupData(data);
                let bt, btCfg, btData, idx;
                for (let i = 0; i < this.count; ++i) {
                    btCfg = this.buttons[i];
                    idx = btCfg.idx;
                    bt = btCfg.bt;
                    btData = ((_a = this.buttonsData) === null || _a === void 0 ? void 0 : _a[idx]) || {};
                    bt.tx.textContent = (_b = btData === null || btData === void 0 ? void 0 : btData.name) !== null && _b !== void 0 ? _b : "";
                    this.clearEvents(bt);
                    const longclicks = conx.glo.searchAttributes("longclick", btData, true);
                    bt.longclicks = longclicks;
                    bt.downFn = this.onButton.bind(this, btData.name, "-down");
                    bt.upFn = (btData === null || btData === void 0 ? void 0 : btData.up) || longclicks || this.isAdmin ? this.onButton.bind(this, btData.name, "-up") : null;
                    bt.outFn = this.onButton.bind(this, btData.name, "-out");
                    bt.addEventListener("pointerdown", bt.downFn);
                    bt.addEventListener("pointerup", bt.upFn);
                    if (btData === null || btData === void 0 ? void 0 : btData.click) {
                        const cmd = "html" !== ((_c = btData === null || btData === void 0 ? void 0 : btData.click) === null || _c === void 0 ? void 0 : _c.domain) ? "-click" : "-html";
                        bt.clickFn = this.onButton.bind(this, btData.name, cmd);
                        bt.addEventListener("click", bt.clickFn);
                    }
                }
            }
            postCreate() {
                super.postCreate();
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                if (check) {
                    if (false === this.hasStateChanged(this.gpath))
                        return false;
                    const state = this._hass.states[this.gpath];
                    if (!state)
                        return false;
                    const value = conx.glo.up(state.state);
                    if ("group" === value)
                        this.readGroupData("read");
                    else
                        this.setActiveButton(value);
                    return true;
                }
                this.readGroup();
                return true;
            }
            clearLongPress() {
                if (this.downTimeoutId <= 0)
                    return false;
                //console.log("clear", this.downTimeoutId);
                clearTimeout(this.downTimeoutId);
                this.downTimeoutId = -1;
                return true;
            }
            onButton(name, cmd) {
                var _a, _b, _c, _d;
                // console.log("iii", name, cmd, this.longclickIndex, this.gid, glo.time);
                const idx = this.buttonMap[name];
                const I = this.idx2iMap[idx];
                const bt = (_b = (_a = this.buttons) === null || _a === void 0 ? void 0 : _a[I]) === null || _b === void 0 ? void 0 : _b.bt;
                const btData = ((_c = this.buttonsData) === null || _c === void 0 ? void 0 : _c[idx]) || {};
                const lc = this.longclickIndex > 0;
                if (!bt)
                    return;
                switch (cmd) {
                    case "":
                        this.setActiveButton(name);
                        break;
                    case "-down":
                        this.showPopup(false);
                        bt.addEventListener("pointerout", bt.outFn);
                        this.longclickIndex = 0;
                        if (this.downTimeoutId <= 0) {
                            if (bt === null || bt === void 0 ? void 0 : bt.longclicks)
                                this.downTimeoutId = conx.glo.delay((bt === null || bt === void 0 ? void 0 : bt.longclicks[0]) * 1000, this, this.onButton, name, "-longclick");
                            else if (this.isAdmin && !(btData === null || btData === void 0 ? void 0 : btData.down) && !(btData === null || btData === void 0 ? void 0 : btData.up))
                                this.downTimeoutId = conx.glo.delay(3000, this, this.onDBLClick, I);
                        }
                        break;
                    case "-longclick":
                        this.clearLongPress();
                        cmd += bt === null || bt === void 0 ? void 0 : bt.longclicks[this.longclickIndex];
                        if (++this.longclickIndex < (bt === null || bt === void 0 ? void 0 : bt.longclicks.length)) {
                            const dt = (bt === null || bt === void 0 ? void 0 : bt.longclicks[this.longclickIndex]) - (bt === null || bt === void 0 ? void 0 : bt.longclicks[this.longclickIndex - 1]);
                            this.downTimeoutId = conx.glo.delay(dt * 1000, this, this.onButton, name, "-longclick");
                        }
                        else if (this.isAdmin && !(btData === null || btData === void 0 ? void 0 : btData.down) && !(btData === null || btData === void 0 ? void 0 : btData.up))
                            this.downTimeoutId = conx.glo.delay(3000, this, this.onDBLClick, I);
                        break;
                    case "-up":
                    case "-out":
                        bt.removeEventListener("pointerout", bt.outFn);
                        this.clearLongPress();
                        break;
                    case "-click":
                        this.showPopup(false);
                        if (this.longclickIndex > 0)
                            return;
                        if (((_d = this.pcfg) === null || _d === void 0 ? void 0 : _d.openStyle) && (btData === null || btData === void 0 ? void 0 : btData.confirm)) {
                            this.pcfg.command = {
                                cmd: cmd,
                                name: name,
                                btData: btData
                            };
                            this.showPopup(true);
                            return;
                        }
                        break;
                    case "-html":
                        if (this.longclickIndex > 0)
                            return;
                        this.onHtmlClick(name);
                        return;
                }
                //console.log("o", name, cmd, this.longclickIndex, this.gid);
                if (btData === null || btData === void 0 ? void 0 : btData[cmd.substring(1)]) {
                    this.CallService("conx", "radio_set", { name: this.group, value: name + cmd });
                    this.readGroup();
                }
            }
            onHtmlClick(name) {
                var _a, _b;
                const btData = (_a = this.buttonsData) === null || _a === void 0 ? void 0 : _a[(_b = this.buttonMap) === null || _b === void 0 ? void 0 : _b[name]];
                if (!btData || !(btData === null || btData === void 0 ? void 0 : btData.click))
                    return;
                const data = btData.click;
                switch (data === null || data === void 0 ? void 0 : data.service) {
                    case "navigate":
                        conx.glo.navigate(data.data);
                        break;
                }
            }
            onDBLClick(i) {
                // console.log("onDBLClick", i, glo.time);
                this.clearLongPress();
                this.yamlI = this.buttons[i].idx;
                this.readGroupData("yaml");
            }
            onPopupClick(name) {
                var _a, _b;
                console.log("onPopupClick", name);
                this.showPopup(false);
                const command = (_a = this.pcfg) === null || _a === void 0 ? void 0 : _a.command;
                this.pcfg.command = null;
                if ("yes" !== name || !command)
                    return;
                if ((_b = command.btData) === null || _b === void 0 ? void 0 : _b[command.cmd.substring(1)])
                    this.CallService("conx", "radio_set", { name: this.group, value: command.name + command.cmd });
            }
            showPopup(show) {
                if (!this.popup)
                    return;
                if (show) {
                    conx.glo.delay(100, this, () => { window.addEventListener("click", this.onOutPopup); });
                    conx.glo.setStyle(this.popup, this.pcfg.openStyle);
                }
                else {
                    window.removeEventListener("click", this.onOutPopup);
                    conx.glo.setStyle(this.popup, this.pcfg.closeStyle);
                }
            }
            onConxMsg(cmd, unq, payload, success) {
                switch (unq) {
                    case "write-radio-group":
                        if (success)
                            this.readGroup();
                        break;
                    case "radio-group":
                        this.setActiveButton(payload);
                        break;
                    case "radio-group-data-yaml":
                        this.onRadioGroupDataYAML(payload);
                        break;
                    case "radio-group-data-read":
                        this.onRadioGroupData(payload);
                        break;
                }
            }
            onRadioGroupDataYAML(data) {
                var _a;
                if (!this.isAdmin)
                    return;
                this.onRadioGroupData(data);
                const btData = ((_a = this.buttonsData) === null || _a === void 0 ? void 0 : _a[this.yamlI]) || { name: "new_button_name", click: { domain: "conx", service: "light", data: { intensity: 0.5 } } };
                this.editor.showYAML(btData, this.yamlI, this.onYAMLChange);
                this.yamlI = -1;
            }
            onYAMLChange(cmd, data) {
                var _a;
                if (undefined === ((_a = this.buttonsData) === null || _a === void 0 ? void 0 : _a[this.yamlI]))
                    this.Set("write-radio-group-cmd", `radio/${this.group}`, { buttons: [] }, true, false);
                this.Set("write-radio-group-cmd", `radio/${this.group}/buttons/${cmd}`, data, true);
            }
            setActiveButton(name) {
                this.activeIdx = this.buttonMap[name];
                this.activeI = this.idx2iMap[this.activeIdx];
                this.activeName = name;
                for (let i = 0; i < this.count; ++i) {
                    this.buttons[i].bt.state = "reg";
                    this.buttons[i].bt.classList.remove("selected");
                }
                let bt = this.root["bt" + this.activeI];
                if (undefined !== bt) {
                    bt.state = "sel";
                    bt.classList.add("selected");
                }
            }
            ErrorView(msg) {
                this.innerHTML = `<div id="root" style="width:100%; height:50px; background-color:#ff0000;">${msg}</div>`;
                this.root = conx.glo.findChild(this, "root");
            }
        }
        cards.RadioButtonGroup = RadioButtonGroup;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-radio-group', conx.cards.RadioButtonGroup);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-radio-group',
    name: 'conx-radio-group',
    description: 'A radio button group',
});
/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Live extends cards.HACard {
            constructor() {
                super(...arguments);
                this.skdata = {};
                this.skbuttons = [];
                this.cols = 5;
                this.buttonCount = 25;
            }
            create() {
                var _a, _b, _c, _d;
                super.create();
                this.cols = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.cols) || this.cols;
                this.buttonCount = ((_b = this.cfg) === null || _b === void 0 ? void 0 : _b.count) || this.buttonCount;
                let gcols = "";
                for (let i = 0; i < this.cols; ++i)
                    gcols += " auto";
                this.cfg.style = ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.style) || `display: grid; grid-gap: 1px; grid-template-columns:${gcols}`;
                const FS = ((_d = this.cfg) === null || _d === void 0 ? void 0 : _d.rgb) ? "9px" : "10px";
                let html = ``;
                for (let i = 0; i < this.buttonCount; ++i)
                    html +=
                        `<button id="ic${i}" class="bn" style="background-color: #000000; width:100%; height:40px;">
                    <label class="text" id="tx" style="height:20px; color: #FFFFFF">x</label>
                    <label class="clr"  id="cx" style="font-size:${FS}; font-weight: bold; font-family: monospace; color: #FFFFFF">FL,ZR,FL,ZR</label>
                </button>`;
                this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">${html}</div>
            `;
                this.root = conx.glo.findChild(this, "root");
                let ic;
                for (let i = 0; i < this.buttonCount; ++i) {
                    ic = conx.glo.findChild(this.root, `ic${i}`);
                    ic["tx"] = conx.glo.findChild(ic, "tx");
                    ic["cx"] = conx.glo.findChild(ic, "cx");
                    this.root[`ic${i}`] = ic;
                }
                this.loadSelection();
                cards.HACard.registedCard(this);
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-live",
                    cols: 5,
                    count: 25,
                    dimmerColor: "1,1,0",
                    rgb: false
                };
            }
            loadSelection() {
                var _a;
                this.sel = (_a = this._hass.states["conx.selection"].attributes) === null || _a === void 0 ? void 0 : _a.data;
                this.conx("parse", "db.GetEntitiesNames", { selection: this.sel });
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                if (check && this.hasStateChanged("conx.selection")) {
                    this.loadSelection();
                    return;
                }
                let id, i, len = this.entities.length;
                for (i = 0; i < len && i < this.buttonCount; ++i) {
                    if (false === this.checkStateChanged(i))
                        continue;
                    this.refreshButton(i);
                }
                return true;
            }
            refreshSelection() {
                let ic, i, len = this.entities.length;
                this.pidx.length = len;
                this.nidx.length = len;
                this.ptates.length = len;
                this.states.length = len;
                for (i = 0; i < len; ++i) {
                    this.pidx[i] = -1;
                    this.nidx[i] = 0;
                    this.ptates[i] = this.phass.states[this.entities[i]];
                    this.states[i] = this._hass.states[this.entities[i]];
                }
                for (i = 0; i < len && i < this.buttonCount; ++i) {
                    ic = this.root[`ic${i}`];
                    if (!ic)
                        continue;
                    //ic.style.visibility = "visible";
                    ic.style.display = "initial";
                    this.refreshButton(i, true);
                }
                for (; i < this.buttonCount; ++i) {
                    ic = this.root[`ic${i}`];
                    if (!ic)
                        continue;
                    //ic.style.visibility = "hidden";
                    ic.style.display = "none";
                }
            }
            refreshButton(i, name = false) {
                var _a;
                let ic = this.root[`ic${i}`];
                let id = this.entities[i];
                if (!ic || !id)
                    return;
                let state = this._hass.states[id];
                let rgba = this.stateToColor(state);
                if (!rgba)
                    return;
                if (name)
                    ic.tx.textContent = (_a = state === null || state === void 0 ? void 0 : state.attributes) === null || _a === void 0 ? void 0 : _a.friendly_name;
                ic.tx.style.color = rgba[3] > 0.5 ? "#000000" : "#FFFFFF";
                ic.cx.style.color = ic.tx.style.color;
                ic.cx.textContent = this.paramsText(rgba);
                ic.style.backgroundColor = conx.glo.RGBAtoHEX(rgba[0], rgba[1], rgba[2], rgba[3]);
            }
            paramsText(rgba) {
                var _a;
                let vals;
                if ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.rgb)
                    vals = [rgba[0], rgba[1], rgba[2], rgba[3]];
                else
                    vals = [rgba[5], rgba[6], rgba[3]];
                return conx.glo.RGBAHStoCode(vals);
            }
            onConxMsg(cmd, unq, payload, success) {
                // trace.log(cmd, unq, payload, success)
                switch (unq) {
                    case "parse":
                        if (false === success)
                            this.entities = [];
                        else
                            this.entities = payload;
                        this.refreshSelection();
                        break;
                }
            }
        }
        cards.Live = Live;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-live', conx.cards.Live);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-live',
    name: 'conx-live',
    description: 'Live',
});
/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Log extends cards.HACard {
            constructor() {
                super(...arguments);
                this.autoScroll = true;
            }
            create() {
                var _a;
                super.create();
                this.cfg.style = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.style) || `display: grid; grid-gap: 1px; grid-template-columns: 20% 20% 20% 20% 20%;`;
                let html = ``;
                html += `<button id="autoScroll" class="cmd" style="width:100%; height:32px;"><ha-icon icon="mdi:arrow-vertical-lock"></ha-icon></button>`;
                html += `<button id="clear" class="cmd" style="width:100%; height:32px; grid-column:5/6"><ha-icon icon="mdi:delete-empty-outline"></ha-icon></button>`;
                html += `<div id="log" class="log" style="width:100%; height:310px; overflow: scroll; grid-column:1/6"></div>`;
                this.innerHTML = `<link rel="stylesheet" href="/local/conx.css?v=1"><div id="root" style="${this._style}">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let bt;
                bt = conx.glo.findChild(this.root, 'autoScroll');
                conx.controls.Button.SetPrototype(bt);
                this.root['autoScroll'] = bt;
                bt.onclick = this.onCommand.bind(this, 'autoScroll');
                bt = conx.glo.findChild(this.root, 'clear');
                conx.controls.Button.SetPrototype(bt);
                this.root['clear'] = bt;
                bt.onclick = this.onCommand.bind(this, 'clear');
                this.root['log'] = conx.glo.findChild(this.root, 'log');
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                if (false === this.hasStateChanged("conx.log"))
                    return false;
                let state = this._hass.states["conx.log"];
                if (!state)
                    return false;
                this.root.log.innerHTML += state.state + "<br>";
                if (this.root.autoScroll.state === "reg")
                    this.root.log.scrollTop = this.root.log.scrollHeight;
                return true;
            }
            onCommand(name) {
                conx.trace.log("cmd", name);
                let bt;
                switch (name) {
                    case "autoScroll":
                        if (this.root.autoScroll.state === "reg")
                            this.root.autoScroll.state = "sel";
                        else
                            this.root.autoScroll.state = "reg";
                        break;
                    case "clear":
                        this.root.log.innerHTML = "";
                        break;
                }
            }
        }
        cards.Log = Log;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-log', conx.cards.Log);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-log',
    name: 'conx-log',
    description: 'Logs messages',
});
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards_1) {
        class Layout extends cards_1.HACard {
            setConfig(config) {
                super.setConfig(config);
                this._cards = config.cards.map((card) => {
                    const type = conx.glo.removeCustom(card.type);
                    const element = document.createElement(type);
                    if (element.setConfig)
                        element.setConfig(card);
                    if (this.hass)
                        element.hass = this.hass;
                    return element;
                });
            }
            create() {
                super.create();
                if (!this._cards)
                    return;
                this.updateState(false);
                this.createHTML();
                this.refreshCards();
            }
            createHTML() {
            }
            updateState(check) {
                super.updateState(check);
                if (!this._cards)
                    return;
                const hass = this.hass;
                for (let c in this._cards) {
                    const card = this._cards[c];
                    if (!card)
                        continue;
                    card.hass = hass;
                }
            }
            refreshCards() {
                if (!this._cards)
                    return;
                if (!this.root)
                    this.create();
                if (!this.layout)
                    return;
                let card;
                for (let c in this._cards) {
                    card = this._cards[c];
                    if (!card)
                        continue;
                    this.layout.appendChild(card);
                }
            }
            get lovelace() { return this._lovelace; }
            set lovelace(lovelace) {
                this._lovelace = lovelace;
                this.refreshCards();
            }
            get index() { return this._index; }
            set index(index) {
                this._index = index;
                this.refreshCards();
            }
            get cards() { return this._cards; }
            set cards(cards) {
                if (this._cards !== cards) {
                    this._cards = cards;
                    this.refreshCards();
                }
            }
            get badges() { return this._badges; }
            set badges(badges) {
                this._badges = badges;
            }
        }
        cards_1.Layout = Layout;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
/// <reference path="layout.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Grid extends cards.Layout {
            createHTML() {
                var _a, _b;
                super.createHTML();
                const gstyle = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.gstyle) || "grid-template-columns: auto auto auto";
                this.cfg.style = ((_b = this.cfg) === null || _b === void 0 ? void 0 : _b.style) || "display: inline-block; width: 100%; height: 100%";
                this.innerHTML = `
            <div id="root" style="${this._style}">
                <div id="grid" style="display: grid; ${gstyle};">                    
                </div>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.layout = conx.glo.findChild(this.root, "grid");
            }
        }
        cards.Grid = Grid;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-grid', conx.cards.Grid);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-grid',
    name: 'conx-grid',
    description: 'grid',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Space extends cards.HACard {
            create() {
                var _a;
                super.create();
                this.cfg.style = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.style) || `display: block; width: 100%; height: 100%`;
                this.innerHTML = `<div id="root" style="${this._style}" />`;
                this.root = conx.glo.findChild(this, "root");
            }
        }
        cards.Space = Space;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-space', conx.cards.Space);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-space',
    name: 'conx-space',
    description: 'use for space',
});
/// <reference path="layout.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class MaxView extends cards.Layout {
            createHTML() {
                var _a, _b;
                super.createHTML();
                this.innerHTML = `<div id="root" style="display: inline-block; width: 100%; height: 100%;" />`;
                this.root = conx.glo.findChild(this, "root");
                this.layout = this.root;
                this.cfg.fixParent = (_b = (_a = this.cfg) === null || _a === void 0 ? void 0 : _a.fixParent) !== null && _b !== void 0 ? _b : true;
                if (this.cfg.fixParent)
                    this.fixParent();
            }
            fixParent() {
                const p = this === null || this === void 0 ? void 0 : this.parentElement;
                if (p && p.className) {
                    p.className = "";
                }
                setTimeout(this.fixParent.bind(this), 100);
            }
        }
        cards.MaxView = MaxView;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-max-view', conx.cards.MaxView);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-max-view',
    name: 'conx-max-view',
    description: 'max view',
});
/// <reference path="conx/glo.ts" />
/// <reference path="conx/cards/title.ts" />
/// <reference path="conx/cards/dimmer.ts" />
/// <reference path="conx/cards/swatch.ts" />
/// <reference path="conx/cards/light-rgb.ts" />
/// <reference path="conx/cards/light-hsv.ts" />
/// <reference path="conx/cards/light-clr.ts" />
/// <reference path="conx/cards/numpad.ts" />
/// <reference path="conx/cards/softkeys.ts" />
/// <reference path="conx/cards/softkeysCues.ts" />
/// <reference path="conx/cards/radio.ts" />
/// <reference path="conx/cards/live.ts" />
/// <reference path="conx/cards/log.ts" />
/// <reference path="conx/cards/grid.ts" />
/// <reference path="conx/cards/space.ts" />
/// <reference path="conx/cards/maxview.ts" />
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class BackLight extends cards.HACard {
            create() {
                var _a, _b, _c, _d;
                super.create();
                this.cdata = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.cdata) || `$org$/local/images/1.jpg`;
                const node = conx.glo.fixOrigin(((_b = this.cfg) === null || _b === void 0 ? void 0 : _b.node) || `<img id="main" src="${this.cdata}" style="max-width:100%; max-height:100%;">`);
                this.cfg.width = ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.width) || `100%`;
                this.cfg.height = ((_d = this.cfg) === null || _d === void 0 ? void 0 : _d.height) || `100%`;
                this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <div id="bk" style="display: inline-block; width: 100%; height: 100%; background:magenta;">
                    <div id="fg" style="display: inline-block; width: 100%; height: 100%; opacity:0.5;">
                        ${node}
                    </div>
                </div>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.bk = conx.glo.findChild(this.root, "bk");
                this.fg = conx.glo.findChild(this.bk, "fg");
                this.main = conx.glo.findChild(this.fg, "main");
            }
            updateState(check) {
                var _a, _b;
                if (false === super.updateState(check))
                    return false;
                const rgba = this.stateToColor(this.state);
                const color = conx.glo.RGBAtoHEX(rgba[0], rgba[1], rgba[2], rgba[3]);
                this.bk.style.background = color;
                this.fg.style.opacity = rgba[4];
                const cdata = (_b = (_a = this.state) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.cdata;
                if (cdata && cdata !== this.cdata) {
                    this.cdata = cdata;
                    conx.glo.updateChild(this.main, cdata);
                }
                return true;
            }
        }
        cards.BackLight = BackLight;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-backlight', conx.cards.BackLight);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-backlight',
    name: 'conx-backlight',
    description: 'shows entity backlight',
});
/// <reference path="../controls/button.ts" />
/// <reference path="softkeysbase.ts" />
/// <reference path="../controls/codeEditor.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class SoftkeysTimelines extends cards.SoftkeysBase {
            constructor() {
                super(...arguments);
                this.timeline = "";
            }
            create() {
                var _a, _b, _c;
                super.create();
                this.cols = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.cols) || this.cols;
                this.rows = ((_b = this.cfg) === null || _b === void 0 ? void 0 : _b.rows) || this.rows;
                this.viewCount = ((_c = this.cfg) === null || _c === void 0 ? void 0 : _c.count) || this.rows * this.cols;
                let gcols = "";
                for (let i = 0; i < this.cols; ++i)
                    gcols += " " + 100.0 / this.cols + "%";
                let htmlT = ``;
                htmlT += `<label id="crams" class="title" style="height:16px; grid-column: 1/7;">sk</label>`;
                htmlT +=
                    `<div id="nav" style="display:grid; grid-gap:0px; grid-template-columns:auto auto auto; width:100%; height:32px;">
                    <button id="left" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("left")}"></ha-icon></button>
                    <button id="up" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("up")}"></ha-icon></button>
                    <button id="right" class="cmd" style="width:100%; height:32px; grid-column:3;"><ha-icon icon="${this.getIcon("right")}"></ha-icon></button>
                </div>`;
                htmlT += `<button id="play" class="cmd" style="width:100%; height:32px; grid-column: 2;"><ha-icon icon="${this.getIcon("timelinestart")}"></ha-icon></button>`;
                htmlT += `<button id="stop" class="cmd" style="width:100%; height:32px; grid-column: 3;"><ha-icon icon="${this.getIcon("timelinestop")}"></ha-icon></button>`;
                if (true === this.isAdmin)
                    htmlT += `<button id="edit" class="cmd" style="width:100%; height:32px; grid-column: 4;"><ha-icon icon="${this.getIcon("edit")}"></ha-icon></button>`;
                htmlT += `<button id="rename" class="cmd" style="width:100%; height:32px; grid-column: 5;"><ha-icon icon="${this.getIcon("rename")}"></ha-icon></button>`;
                htmlT += `<button id="delete" class="cmd" style="width:100%; height:32px; grid-column: 6;"><ha-icon icon="${this.getIcon("delete")}"></ha-icon></button>`;
                let htmlB = ``;
                for (let i = 0; i < this.viewCount; ++i)
                    htmlB += `
                    <button id="bn${i}" class="bn" style="position:relative; width:100%; height:64px;">                        
                        <ha-icon id="ic" icon=""></ha-icon>
                        <label id="tx" class="text"></label>
                        <label id="nm" class="num" style="position:absolute; top:0px; left:0px; font-size:12px; color:#404040">99</label>
                    </button>
                    `;
                this.innerHTML =
                    `<div id="root" style="${this._style}">
                    <div id="trid" style="display:grid; grid-gap:1px; grid-template-columns: 17% 17% 16% 16% 17% 17%;">${htmlT}</div>
                    <div id="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${htmlB}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;
                this.root = conx.glo.findChild(this, "root");
                this.editor = conx.glo.findChild(this, "editor");
                this.onYAMLChange = this.onYAMLChange.bind(this);
                const btNames = ["up", "left", "right", "play", "stop", "edit", "rename", "delete"];
                let bt, i;
                this.root['crams'] = conx.glo.findChild(this.root, 'crams');
                for (i = 0; i < btNames.length; ++i) {
                    const name = btNames[i];
                    bt = conx.glo.findChild(this.root, name);
                    if (bt) {
                        conx.controls.Button.SetPrototype(bt);
                        this.cmdRoot[name] = bt;
                        bt.onclick = this.onCommand.bind(this, name);
                    }
                }
                for (let i = 0; i < this.viewCount; ++i) {
                    bt = conx.glo.findChild(this.root, `bn${i}`);
                    conx.controls.Button.SetPrototype(bt);
                    bt["ic"] = conx.glo.findChild(bt, "ic");
                    bt["tx"] = conx.glo.findChild(bt, "tx");
                    bt["nm"] = conx.glo.findChild(bt, "nm");
                    this.root[`bn${i}`] = bt;
                    bt.onclick = this.onButton.bind(this, i);
                }
                this.readData("");
                this.readStates();
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-timelines",
                    cols: 5,
                    rows: 3,
                    css: `{
    "bn": { "backgroundImage": "linear-gradient( 30deg, #000000 70%, #FFFFFF 100%)" }, 
    "bn-down": { "backgroundImage": "linear-gradient( 30deg, #808080 0%, #000000 50%)" }, 
    "bn-sel": { "backgroundImage": "linear-gradient( 30deg, #FF30FF 0%, #000000 50%)" }, 
    "cmd": { "background-color": "orange" },
    "cmd-down": { "background-color": "#802020" },
    "cmd-sel": { "background-color": "#FF2020" },
    "text": { "color": "#FFFFFF" }, 
    "num": { "color": "#303000" }
}`
                };
            }
            readData(state) {
                const path = conx.glo.up(state);
                if (0 === path.indexOf("timelinesStates"))
                    this.readStates();
                else
                    this.Get("timelines-read", "timelines");
                this.refreshCommands();
            }
            readStates() {
                this.Get("timelines-read-states", "timelinesStates");
            }
            refreshCommands() {
                this.root["crams"].textContent = "timelines" + (this.timeline.length > 0 ? "\\" + this.timeline : "");
                this.cmdRoot["play"].style.display = this.timeline.length > 0 ? "none" : "block";
                this.cmdRoot["stop"].style.display = this.timeline.length > 0 ? "none" : "block";
                this.cmdRoot["up"].style.display = this.timeline.length > 0 ? "block" : "none";
                this.cmdRoot["left"].style.display = this.startIndex > 0 ? "block" : "none";
                this.cmdRoot["right"].style.display = this.startIndex < this.MAX_TOTAL_SKS - this.viewCount ? "block" : "none";
            }
            postCreate() {
                super.postCreate();
            }
            checkPath(state) {
                const path = conx.glo.up(state);
                return 0 === path.indexOf("timelines");
            }
            onButton(i) {
                var _a;
                i += this.startIndex;
                let sk = (_a = this.skbuttons) === null || _a === void 0 ? void 0 : _a[i];
                if (undefined === sk) {
                    if ("edit" === this.activeState)
                        this.editor.showYAML({ name: "new timeline", events: [] }, { name: "newTimeline" }, this.onYAMLChange);
                    this.setActiveState("");
                    return;
                }
                switch (this.activeState) {
                    case "delete":
                        if (this.timeline.length <= 0)
                            this.CallService("conx", "timelinedelete", { timeline: sk.name, name: [] });
                        else
                            this.CallService("conx", "timelinedelete", { timeline: this.timeline, name: sk.name });
                        break;
                    case "play":
                        if (this.timeline.length <= 0)
                            this.CallService("conx", "timelinestart", { name: sk.name });
                        break;
                    case "stop":
                        if (this.timeline.length <= 0)
                            this.CallService("conx", "timelinestop", { name: sk.name });
                        break;
                    case "edit":
                        if (true === this.isAdmin) {
                            if (this.timeline.length <= 0)
                                this.editor.showYAML(this.skdata[sk.name], { cmd: "edit", name: sk.name }, this.onYAMLChange);
                            else
                                this.editor.showYAML(this.skdata[this.timeline][sk.i], { cmd: "edit", name: sk.i }, this.onYAMLChange);
                        }
                        break;
                    case "rename":
                        if (this.timeline.length <= 0)
                            this.editor.showYAML({ name: sk.name }, { cmd: "rename", name: sk.name }, this.onYAMLChange);
                        break;
                    default:
                        if (this.timeline.length <= 0) {
                            this.timeline = sk.name;
                            this.refreshButtons();
                            this.refreshCommands();
                        }
                        else if (true === this.isAdmin)
                            this.editor.showYAML(this.skdata[this.timeline][sk.i], { cmd: "edit", name: sk.i }, this.onYAMLChange);
                        break;
                }
                this.setActiveState("");
            }
            onCommand(name) {
                conx.trace.log("cmd", name);
                let bt;
                switch (name) {
                    case "play":
                    case "stop":
                    case "edit":
                    case "rename":
                    case "delete":
                        bt = this.cmdRoot[name];
                        if (undefined !== bt) {
                            if ("reg" === bt.state)
                                this.setActiveState(name);
                            else
                                this.setActiveState("");
                        }
                        break;
                    case "up":
                        this.timeline = "";
                        this.refreshButtons();
                        this.refreshCommands();
                        break;
                    case "left":
                        this.startIndex -= this.viewCount;
                        if (this.startIndex < 0)
                            this.startIndex = 0;
                        this.refreshButtons();
                        this.refreshCommands();
                        break;
                    case "right":
                        this.startIndex += this.viewCount;
                        this.refreshButtons();
                        this.refreshCommands();
                        break;
                }
            }
            onYAMLChange(cmd, data) {
                if ("rename" === (cmd === null || cmd === void 0 ? void 0 : cmd.cmd)) {
                    this.Rename("rename-timeline", `timelines/${cmd.name}`, data.name);
                    return;
                }
                cmd = cmd.name;
                if ("newTimeline" === cmd) {
                    if (!(data === null || data === void 0 ? void 0 : data.name) || "new timeline" === data.name || !(data === null || data === void 0 ? void 0 : data.events))
                        return;
                    this.CallService("conx", "timelinecreate", { name: data === null || data === void 0 ? void 0 : data.name });
                    data = data === null || data === void 0 ? void 0 : data.events;
                }
                if (this.timeline.length <= 0) {
                    const src = this.skdata[cmd];
                    for (let l = data === null || data === void 0 ? void 0 : data.length; l < (src === null || src === void 0 ? void 0 : src.length); ++l)
                        this.Del("delete-timeline-cue", `timelines/${cmd}/${l}`);
                    for (let l in data)
                        this.Set("write-timeline-cue", `timelines/${cmd}/${l}`, data[l]);
                }
                else
                    this.Set("write-timeline-cue", `timelines/${this.timeline}/${cmd}`, data);
            }
            onConxMsg(cmd, unq, payload, success) {
                conx.trace.log(cmd, unq, payload, success);
                switch (unq) {
                    case "timelines-read":
                        if (false === success)
                            this.skdata = {};
                        else
                            this.skdata = payload;
                        this.refreshButtons();
                        break;
                    case "timelines-read-states":
                        if (false === success)
                            this.tsStates = {};
                        else
                            this.tsStates = payload;
                        this.refreshButtons();
                        break;
                }
            }
            refreshData() {
                this.skbuttons = [];
                if (this.timeline.length > 0)
                    this.refreshTimeline(this.skdata[this.timeline], this.tsStates[this.timeline]);
                else
                    this.refreshTimelines(this.skdata, this.tsStates);
            }
            refreshTimelines(data, states) {
                let idx = 0, sk, state, obj;
                for (let s in data) {
                    sk = data[s];
                    state = states[s];
                    obj = { title: s, name: s, data: sk, i: Number(s), state: "reg" };
                    if (state === null || state === void 0 ? void 0 : state.active) {
                        obj.state = "sel";
                        if ((state === null || state === void 0 ? void 0 : state.loop) > 0)
                            obj.title = s + " (" + state.loopIdx + "/" + state.loop + ")";
                    }
                    this.skbuttons[idx] = obj;
                    ++idx;
                }
            }
            refreshTimeline(data, state) {
                let idx = 0, sk, obj;
                for (let s in data) {
                    sk = data[s];
                    obj = { title: sk === null || sk === void 0 ? void 0 : sk.name, name: sk === null || sk === void 0 ? void 0 : sk.name, data: sk, i: Number(s), state: "reg" };
                    if ((state === null || state === void 0 ? void 0 : state.active) && idx === (state === null || state === void 0 ? void 0 : state.index))
                        obj.state = "sel";
                    this.skbuttons[idx] = obj;
                    ++idx;
                }
                obj = { title: "", name: "", data: { type: "inf" }, i: idx, state: "reg" };
                if (state === null || state === void 0 ? void 0 : state.active) {
                    if ((state === null || state === void 0 ? void 0 : state.loop) > 0) {
                        obj.title = "(" + state.loopIdx + "/" + state.loop + ")";
                        obj.data.type = "seq";
                    }
                }
                this.skbuttons[idx] = obj;
                ++idx;
            }
            refreshButtons() {
                var _a, _b;
                this.refreshData();
                let bt, sk, bi;
                for (let vi = 0; vi < this.viewCount; ++vi) {
                    bi = this.startIndex + vi;
                    bt = this.root[`bn${vi}`];
                    if (!bt)
                        continue;
                    if (bi >= this.MAX_TOTAL_SKS) {
                        bt.style.display = "none";
                        continue;
                    }
                    else
                        bt.style.display = "block";
                    sk = this.skbuttons[bi];
                    bt.nm.textContent = "" + (1 + bi);
                    if (undefined === sk) {
                        bt.ic.icon = "";
                        bt.tx.textContent = "";
                        bt.state = "reg";
                    }
                    else {
                        bt.ic.icon = this.getIcon((_a = sk === null || sk === void 0 ? void 0 : sk.data) === null || _a === void 0 ? void 0 : _a.type, (_b = sk === null || sk === void 0 ? void 0 : sk.data) === null || _b === void 0 ? void 0 : _b.data);
                        bt.tx.textContent = sk === null || sk === void 0 ? void 0 : sk.title;
                        bt.state = sk.state;
                    }
                }
            }
        }
        cards.SoftkeysTimelines = SoftkeysTimelines;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-timelines', conx.cards.SoftkeysTimelines);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-timelines',
    name: 'conx-timelines',
    description: 'Timelines',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Users extends cards.HACard {
            constructor() {
                super(...arguments);
                this.users = [];
                this.refreshTime = 60;
            }
            create() {
                var _a;
                super.create();
                this.innerHTML =
                    `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" class="table-container">
                <table id="table" class="table">
                    <thead>
                        <tr>
                            <th class="th">Name</th>
                            <th class="th">active</th>
                            <th class="th">Admin</th>
                        </tr>
                    </thead>
                    <tbody id="tbody">
                    </tbody>
                </table>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.table = conx.glo.findChild(this.root, "table");
                this.tbody = conx.glo.findChild(this.table, "tbody");
                this.refreshTime = ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.refreshTime) || 60;
                this.addEventListener("dblclick", this.onDblClick.bind(this));
                this.GetConnections("conns");
            }
            postCreate() {
                super.postCreate();
            }
            onDblClick(ev) {
                this.GetConnections("conns");
            }
            refreshUsers() {
                this.tbody.innerHTML = "";
                this.users.forEach((user) => {
                    let tr = document.createElement("tr");
                    let td = document.createElement("td");
                    td.className = "td";
                    td.innerText = user.name;
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.className = "td";
                    td.innerText = user.active ? "yes" : "no";
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.className = "td";
                    td.innerText = user.admin ? "yes" : "no";
                    tr.appendChild(td);
                    this.tbody.appendChild(tr);
                });
                conx.glo.updateCSS(this.tbody, this.css);
                setTimeout(() => {
                    this.GetConnections("conns");
                }, 1000 * this.refreshTime);
            }
            static getStubConfig(hass, entities, entitiesFallback) {
                return {
                    type: "custom:conx-users",
                    refreshTime: 60,
                    css: `{
    "table": { "width": "100%", "border-collapse":"collapse" }, 
    "th": { "border": "1px solid white", "padding": "8px", "textAlign": "center", "position": "sticky", "top": "0", "backgroundColor": "#1f1f1f" }, 
    "td": { "border": "1px solid white", "padding": "8px", "textAlign": "center" }, 
    "table-container": { "maxHeight": "300px", "overflowY": "auto" }
}`
                };
            }
            onConxMsg(cmd, unq, payload, success) {
                // trace.log(cmd, unq, payload, success)
                switch (unq) {
                    case "conns":
                        if (true === success)
                            this.users = payload;
                        else
                            this.users = [];
                        this.refreshUsers();
                        break;
                }
            }
        }
        cards.Users = Users;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-users', conx.cards.Users);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-users',
    name: 'conx-users',
    description: 'shows connected users',
});
/// <reference path="svg.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Toggle extends controls.Svg {
            constructor() {
                super();
                this.copyData(this.locals, {
                    on: false,
                    onBG: "blue",
                    offBG: "gray"
                });
                this.copyData(this.params, {
                    bg: {
                        style: {
                            fill: "#919191",
                            stroke: "black",
                            strokeWidth: "5px"
                        }
                    },
                    thumb: {
                        style: {
                            fill: "red",
                            stroke: "black",
                            strokeWidth: "1px",
                            strokeOpacity: 0.5
                        }
                    },
                    text: {
                        style: {
                            dominantBaseline: "middle",
                            fill: "white",
                            textAnchor: "middle",
                            fontSize: `20px`
                        },
                        textContent: "Switch"
                    }
                });
            }
            connectItems() {
                this.enablePointer();
                this.bg = this.findChild(`bg`);
                this.thumb = this.findChild(`thumb`);
                this.text = this.findChild(`text`);
            }
            createChildren() {
                super.createChildren();
                let g_comp = controls.utils.SVGGroup({ id: `group` });
                let r_bg = controls.utils.SVGRect({ x: 0, y: 0, rx: 0, ry: 0, width: "100%", height: "100%", style: { fill: "gray", strokeWidth: "5px", stroke: "black" }, id: `bg` });
                let r_thumb = controls.utils.SVGRect({ x: 5, y: 5, rx: 5, ry: 5, width: "35%", height: "100%", style: { fill: "red" }, id: `thumb` });
                let r_text = controls.utils.SVGText({ x: "50%", y: "50%", style: { dominantBaseline: "middle", fill: "white", textAnchor: "middle", fontSize: `20px` }, id: `text` });
                // Grouping
                g_comp.appendChild(r_bg);
                g_comp.appendChild(r_thumb);
                g_comp.appendChild(r_text);
                this.svg.append(g_comp);
                this.svg.id = `toggle`;
            }
            postConnected() {
                super.postConnected();
                this.updateByValue(false);
                this.params.thumb.height = `${this.clientRect.height - 10}px`;
                let s = Math.min(this.clientRect.width, this.clientRect.height) / 2.5;
                this.params.text.style.fontSize = `${s}px`;
                conx.glo.update(this);
            }
            updateByValue(upd) {
                let x = 5;
                if (this.locals.on) {
                    x = this.clientRect.width - this.thumb.getBoundingClientRect().width - 5;
                    this.params.bg.style.fill = this.locals.onBG;
                }
                else
                    this.params.bg.style.fill = this.locals.offBG;
                this.params.thumb.x = `${x}px`;
                conx.glo.update(this, { bg: this.params.bg, thumb: this.params.thumb });
            }
            onPointer(e, type) {
                //super.onPointer(e,type);
                switch (type) {
                    case "up":
                        this.locals.on = !this.locals.on;
                        this.updateByValue(true);
                        break;
                }
            }
        }
        controls.Toggle = Toggle;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-toggle", conx.controls.Toggle);
/// <reference path="svg.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class WheelKnob extends controls.Svg {
            constructor() {
                super();
                this.movable = false;
                this.slideLength = -1;
                this._val = 0;
                this.copyData(this.params, {
                    isShowPercent: true,
                    value: 30,
                    frame: "#919191",
                    background: "#919191",
                    fill: "red",
                    title: "Light",
                    pheight: 40
                });
                this.connectItems();
            }
            connectItems() {
                this.enablePointer();
                this.elSlider = this.findChild(`slider`);
                this.elFrame = this.findChild(`slider-frame`);
                this.elGFrame = this.findChild(`slider-g`);
                this.elTotal = this.findChild(`slider-bar-total`);
                this.elTotal1 = this.findChild(`slider-bar-total1`);
                this.elProgress = this.findChild(`slider-bar-progress`);
                this.elTitle = this.findChild(`slider-title`);
                this.setParams(this.params);
            }
            setParams(params) {
                if (params.value != undefined)
                    this.params.value = params.value;
                if (params.isShowPercent != undefined)
                    this.params.isShowPercent = params.isShowPercent;
                if (params.title)
                    this.params.title = params.title;
                if (params.fill)
                    this.params.fill = params.fill;
                if (params.background)
                    this.params.background = params.background;
                if (params.frame)
                    this.params.frame = params.frame;
                if (params.pheight)
                    this.params.pheight = params.pheight;
                this._val = this.params.value / 100;
                this.slideLength = 300;
                this.update();
            }
            getParams() {
                return this.params;
            }
            createChildren() {
                let w = this.parentElement.clientWidth;
                let h = this.parentElement.clientHeight;
                let cx = w / 2, cy = h / 2;
                // t1 → start angle, in radian.
                // delta → angle to sweep, in radian. positive.
                // fai → rotation on the whole, in radian.
                let delta = 300, t1 = 120, fai = 0;
                // Create SVGs
                let g_frame = controls.utils.SVGGroup({ id: `slider-g` });
                let r_frame = controls.utils.SVGCircle({
                    cx: cx, cy: cy, r: w / 2 - 1,
                    style: { stroke: "black", strokeWidth: "2px" },
                    id: `slider-frame`
                });
                let arc_params = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - 50) / 2 - 2,
                    ry: (w - 50) / 2 - 2,
                    t1: t1, DELTA: delta, FAI: fai
                });
                let r_barTotal = controls.utils.SVGPath({
                    d: arc_params.join(" "),
                    style: { fill: "none" },
                    id: `slider-bar-total`
                });
                let arc_params3 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - 50) / 2 - 3,
                    ry: (w - 50) / 2 - 3,
                    t1: t1 - 0.75, DELTA: delta + 1.5, FAI: fai
                });
                let r_barTotal2 = controls.utils.SVGPath({
                    d: arc_params3.join(" "),
                    style: { fill: "none", stroke: "black" },
                    id: `slider-bar-total1`
                });
                let arc_params2 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - 50) / 2 - 2,
                    ry: (w - 50) / 2 - 2,
                    t1: t1, DELTA: delta, FAI: fai
                });
                let r_barProgress = controls.utils.SVGPath({
                    d: arc_params2.join(" "),
                    style: { fill: "none" },
                    id: `slider-bar-progress`
                });
                let t_title = controls.utils.SVGText({
                    x: "50%", y: "51.5%",
                    style: { fill: "white", textAnchor: "middle", fontSize: `${w / 10}px` },
                    id: `slider-title`
                });
                // Grouping
                g_frame.appendChild(r_frame);
                g_frame.appendChild(r_barTotal2);
                g_frame.appendChild(r_barTotal);
                g_frame.appendChild(r_barProgress);
                g_frame.appendChild(t_title);
                this.svg.append(g_frame);
                this.svg.id = `slider`;
                this.svg.setAttribute("width", "100%");
                this.svg.setAttribute("height", "100%");
                return this.svg;
            }
            update() {
                let w = this.parentElement.clientWidth;
                let h = this.parentElement.clientHeight;
                let cx = w / 2, cy = h / 2;
                let delta = 300, t1 = 120, fai = 0;
                let style;
                if (this._val > 1)
                    this._val = 1;
                else if (this._val < 0)
                    this._val = 0;
                let offset = (1 - this._val) * 300;
                let textPercent = Math.floor(this._val * 100);
                if (this.params.isShowPercent)
                    this.elTitle.textContent = this.params.title + " " + textPercent + '%';
                else
                    this.elTitle.textContent = this.params.title;
                let arc_params = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - this.params.pheight) / 2 - 2,
                    ry: (w - this.params.pheight) / 2 - 2,
                    t1: t1, DELTA: delta, FAI: fai
                });
                this.elTotal.setAttribute("d", arc_params.join(" "));
                let arc_params3 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - this.params.pheight) / 2 - 3,
                    ry: (w - this.params.pheight) / 2 - 3,
                    t1: t1 - 0.75, DELTA: delta + 1.5, FAI: fai
                });
                this.elTotal1.setAttribute("d", arc_params3.join(" "));
                style = controls.utils.Style({ fill: `${this.params.background}`, stroke: "black", strokeWidth: "2px" });
                this.elFrame.setAttribute("style", style);
                style = controls.utils.Style({ fill: "none", stroke: `${this.params.frame}`, strokeWidth: "" + this.params.pheight + "px" });
                this.elTotal.setAttribute("style", style);
                style = controls.utils.Style({ fill: "none", stroke: "black", strokeWidth: "" + (this.params.pheight + 2) + "px" });
                this.elTotal1.setAttribute("style", style);
                let arc_params2 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - this.params.pheight) / 2 - 2,
                    ry: (w - this.params.pheight) / 2 - 2,
                    t1: t1, DELTA: delta - offset, FAI: fai
                });
                this.elProgress.setAttribute("d", arc_params2.join(" "));
                style = controls.utils.Style({ fill: "none", stroke: `${this.params.fill}`, strokeWidth: "" + this.params.pheight + "px" });
                this.elProgress.setAttribute("style", style);
            }
            onPointer(e, type) {
                //super.onPointer(e,type);
                switch (type) {
                    case "down":
                        this.movable = true;
                        break;
                    case "move":
                        if (!this.movable)
                            return;
                        let w = this.parentElement.clientWidth;
                        let h = this.parentElement.clientHeight;
                        let cx = w / 2, cy = h / 2;
                        let angle = controls.utils.GetAngle(cx, cy, this._touchX, this._touchY);
                        angle = (angle * 180 / Math.PI + 270) % 360;
                        angle = (360 - angle + 60) % 360;
                        if (angle > 330 && angle < 360)
                            angle = 0;
                        if (angle > 300 && angle <= 330)
                            angle = 300;
                        this._val = (300 - angle) / 300;
                        this.update();
                        break;
                    case "up":
                        this.movable = false;
                        break;
                    default:
                        break;
                }
            }
        }
        controls.WheelKnob = WheelKnob;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-wheel-knob", conx.controls.WheelKnob);
//# sourceMappingURL=conx.js.map