(function () {
  const u = document.createElement('link').relList;
  if (u && u.supports && u.supports('modulepreload')) return;
  for (const f of document.querySelectorAll('link[rel="modulepreload"]')) s(f);
  new MutationObserver((f) => {
    for (const h of f)
      if (h.type === 'childList')
        for (const m of h.addedNodes) m.tagName === 'LINK' && m.rel === 'modulepreload' && s(m);
  }).observe(document, { childList: !0, subtree: !0 });
  function r(f) {
    const h = {};
    return (
      f.integrity && (h.integrity = f.integrity),
      f.referrerPolicy && (h.referrerPolicy = f.referrerPolicy),
      f.crossOrigin === 'use-credentials'
        ? (h.credentials = 'include')
        : f.crossOrigin === 'anonymous'
          ? (h.credentials = 'omit')
          : (h.credentials = 'same-origin'),
      h
    );
  }
  function s(f) {
    if (f.ep) return;
    f.ep = !0;
    const h = r(f);
    fetch(f.href, h);
  }
})();
function jy(l) {
  return l && l.__esModule && Object.prototype.hasOwnProperty.call(l, 'default') ? l.default : l;
}
var rf = { exports: {} },
  ri = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Dv;
function Zb() {
  if (Dv) return ri;
  Dv = 1;
  var l = Symbol.for('react.transitional.element'),
    u = Symbol.for('react.fragment');
  function r(s, f, h) {
    var m = null;
    if ((h !== void 0 && (m = '' + h), f.key !== void 0 && (m = '' + f.key), 'key' in f)) {
      h = {};
      for (var v in f) v !== 'key' && (h[v] = f[v]);
    } else h = f;
    return ((f = h.ref), { $$typeof: l, type: s, key: m, ref: f !== void 0 ? f : null, props: h });
  }
  return ((ri.Fragment = u), (ri.jsx = r), (ri.jsxs = r), ri);
}
var wv;
function Hb() {
  return (wv || ((wv = 1), (rf.exports = Zb())), rf.exports);
}
var o = Hb(),
  sf = { exports: {} },
  le = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Rv;
function kb() {
  if (Rv) return le;
  Rv = 1;
  var l = Symbol.for('react.transitional.element'),
    u = Symbol.for('react.portal'),
    r = Symbol.for('react.fragment'),
    s = Symbol.for('react.strict_mode'),
    f = Symbol.for('react.profiler'),
    h = Symbol.for('react.consumer'),
    m = Symbol.for('react.context'),
    v = Symbol.for('react.forward_ref'),
    b = Symbol.for('react.suspense'),
    S = Symbol.for('react.memo'),
    _ = Symbol.for('react.lazy'),
    g = Symbol.for('react.activity'),
    A = Symbol.for('react.view_transition'),
    w = Symbol.iterator;
  function U(N) {
    return N === null || typeof N != 'object'
      ? null
      : ((N = (w && N[w]) || N['@@iterator']), typeof N == 'function' ? N : null);
  }
  var V = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    B = Object.assign,
    k = {};
  function ae(N, H, F) {
    ((this.props = N), (this.context = H), (this.refs = k), (this.updater = F || V));
  }
  ((ae.prototype.isReactComponent = {}),
    (ae.prototype.setState = function (N, H) {
      if (typeof N != 'object' && typeof N != 'function' && N != null)
        throw Error(
          'takes an object of state variables to update or a function which returns an object of state variables.',
        );
      this.updater.enqueueSetState(this, N, H, 'setState');
    }),
    (ae.prototype.forceUpdate = function (N) {
      this.updater.enqueueForceUpdate(this, N, 'forceUpdate');
    }));
  function q() {}
  q.prototype = ae.prototype;
  function pe(N, H, F) {
    ((this.props = N), (this.context = H), (this.refs = k), (this.updater = F || V));
  }
  var fe = (pe.prototype = new q());
  ((fe.constructor = pe), B(fe, ae.prototype), (fe.isPureReactComponent = !0));
  var ue = Array.isArray;
  function W() {}
  var se = { H: null, A: null, T: null, S: null },
    bt = Object.prototype.hasOwnProperty;
  function Ke(N, H, F) {
    var P = F.ref;
    return { $$typeof: l, type: N, key: H, ref: P !== void 0 ? P : null, props: F };
  }
  function lt(N, H) {
    return Ke(N.type, H, N.props);
  }
  function at(N) {
    return typeof N == 'object' && N !== null && N.$$typeof === l;
  }
  function Zt(N) {
    var H = { '=': '=0', ':': '=2' };
    return (
      '$' +
      N.replace(/[=:]/g, function (F) {
        return H[F];
      })
    );
  }
  var Ht = /\/+/g;
  function Ie(N, H) {
    return typeof N == 'object' && N !== null && N.key != null ? Zt('' + N.key) : H.toString(36);
  }
  function G(N) {
    switch (N.status) {
      case 'fulfilled':
        return N.value;
      case 'rejected':
        throw N.reason;
      default:
        switch (
          (typeof N.status == 'string'
            ? N.then(W, W)
            : ((N.status = 'pending'),
              N.then(
                function (H) {
                  N.status === 'pending' && ((N.status = 'fulfilled'), (N.value = H));
                },
                function (H) {
                  N.status === 'pending' && ((N.status = 'rejected'), (N.reason = H));
                },
              )),
          N.status)
        ) {
          case 'fulfilled':
            return N.value;
          case 'rejected':
            throw N.reason;
        }
    }
    throw N;
  }
  function ee(N, H, F, P, be) {
    var Se = typeof N;
    (Se === 'undefined' || Se === 'boolean') && (N = null);
    var Ne = !1;
    if (N === null) Ne = !0;
    else
      switch (Se) {
        case 'bigint':
        case 'string':
        case 'number':
          Ne = !0;
          break;
        case 'object':
          switch (N.$$typeof) {
            case l:
            case u:
              Ne = !0;
              break;
            case _:
              return ((Ne = N._init), ee(Ne(N._payload), H, F, P, be));
          }
      }
    if (Ne)
      return (
        (be = be(N)),
        (Ne = P === '' ? '.' + Ie(N, 0) : P),
        ue(be)
          ? ((F = ''),
            Ne != null && (F = Ne.replace(Ht, '$&/') + '/'),
            ee(be, H, F, '', function (Mn) {
              return Mn;
            }))
          : be != null &&
            (at(be) &&
              (be = lt(
                be,
                F +
                  (be.key == null || (N && N.key === be.key)
                    ? ''
                    : ('' + be.key).replace(Ht, '$&/') + '/') +
                  Ne,
              )),
            H.push(be)),
        1
      );
    Ne = 0;
    var K = P === '' ? '.' : P + ':';
    if (ue(N))
      for (var ne = 0; ne < N.length; ne++)
        ((P = N[ne]), (Se = K + Ie(P, ne)), (Ne += ee(P, H, F, Se, be)));
    else if (((ne = U(N)), typeof ne == 'function'))
      for (N = ne.call(N), ne = 0; !(P = N.next()).done;)
        ((P = P.value), (Se = K + Ie(P, ne++)), (Ne += ee(P, H, F, Se, be)));
    else if (Se === 'object') {
      if (typeof N.then == 'function') return ee(G(N), H, F, P, be);
      throw (
        (H = String(N)),
        Error(
          'Objects are not valid as a React child (found: ' +
            (H === '[object Object]' ? 'object with keys {' + Object.keys(N).join(', ') + '}' : H) +
            '). If you meant to render a collection of children, use an array instead.',
        )
      );
    }
    return Ne;
  }
  function L(N, H, F) {
    if (N == null) return N;
    var P = [],
      be = 0;
    return (
      ee(N, P, '', '', function (Se) {
        return H.call(F, Se, be++);
      }),
      P
    );
  }
  function re(N) {
    if (N._status === -1) {
      var H = N._result,
        F = H();
      (F.then(
        function (P) {
          (N._status === 0 || N._status === -1) &&
            ((N._status = 1),
            (N._result = P),
            F.status === void 0 && ((F.status = 'fulfilled'), (F.value = P)));
        },
        function (P) {
          (N._status === 0 || N._status === -1) &&
            ((N._status = 2),
            (N._result = P),
            F.status === void 0 && ((F.status = 'rejected'), (F.reason = P)));
        },
      ),
        N._status === -1 && ((N._status = 0), (N._result = F)));
    }
    if (N._status === 1) return N._result.default;
    throw N._result;
  }
  var _e =
    typeof reportError == 'function'
      ? reportError
      : function (N) {
          if (typeof window == 'object' && typeof window.ErrorEvent == 'function') {
            var H = new window.ErrorEvent('error', {
              bubbles: !0,
              cancelable: !0,
              message:
                typeof N == 'object' && N !== null && typeof N.message == 'string'
                  ? String(N.message)
                  : String(N),
              error: N,
            });
            if (!window.dispatchEvent(H)) return;
          } else if (typeof process == 'object' && typeof process.emit == 'function') {
            process.emit('uncaughtException', N);
            return;
          }
          console.error(N);
        };
  function rn(N) {
    var H = se.T,
      F = {};
    ((F.types = H !== null ? H.types : null), (se.T = F));
    try {
      var P = N(),
        be = se.S;
      (be !== null && be(F, P),
        typeof P == 'object' && P !== null && typeof P.then == 'function' && P.then(W, _e));
    } catch (Se) {
      _e(Se);
    } finally {
      (H !== null && F.types !== null && (H.types = F.types), (se.T = H));
    }
  }
  function Rn(N) {
    var H = se.T;
    if (H !== null) {
      var F = H.types;
      F === null ? (H.types = [N]) : F.indexOf(N) === -1 && F.push(N);
    } else rn(Rn.bind(null, N));
  }
  var Ll = {
    map: L,
    forEach: function (N, H, F) {
      L(
        N,
        function () {
          H.apply(this, arguments);
        },
        F,
      );
    },
    count: function (N) {
      var H = 0;
      return (
        L(N, function () {
          H++;
        }),
        H
      );
    },
    toArray: function (N) {
      return (
        L(N, function (H) {
          return H;
        }) || []
      );
    },
    only: function (N) {
      if (!at(N))
        throw Error('React.Children.only expected to receive a single React element child.');
      return N;
    },
  };
  return (
    (le.Activity = g),
    (le.Children = Ll),
    (le.Component = ae),
    (le.Fragment = r),
    (le.Profiler = f),
    (le.PureComponent = pe),
    (le.StrictMode = s),
    (le.Suspense = b),
    (le.ViewTransition = A),
    (le.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = se),
    (le.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function (N) {
        return se.H.useMemoCache(N);
      },
    }),
    (le.addTransitionType = Rn),
    (le.cache = function (N) {
      return function () {
        return N.apply(null, arguments);
      };
    }),
    (le.cacheSignal = function () {
      return null;
    }),
    (le.cloneElement = function (N, H, F) {
      if (N == null) throw Error('The argument must be a React element, but you passed ' + N + '.');
      var P = B({}, N.props),
        be = N.key;
      if (H != null)
        for (Se in (H.key !== void 0 && (be = '' + H.key), H))
          !bt.call(H, Se) ||
            Se === 'key' ||
            Se === '__self' ||
            Se === '__source' ||
            (Se === 'ref' && H.ref === void 0) ||
            (P[Se] = H[Se]);
      var Se = arguments.length - 2;
      if (Se === 1) P.children = F;
      else if (1 < Se) {
        for (var Ne = Array(Se), K = 0; K < Se; K++) Ne[K] = arguments[K + 2];
        P.children = Ne;
      }
      return Ke(N.type, be, P);
    }),
    (le.createContext = function (N) {
      return (
        (N = {
          $$typeof: m,
          _currentValue: N,
          _currentValue2: N,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (N.Provider = N),
        (N.Consumer = { $$typeof: h, _context: N }),
        N
      );
    }),
    (le.createElement = function (N, H, F) {
      var P,
        be = {},
        Se = null;
      if (H != null)
        for (P in (H.key !== void 0 && (Se = '' + H.key), H))
          bt.call(H, P) && P !== 'key' && P !== '__self' && P !== '__source' && (be[P] = H[P]);
      var Ne = arguments.length - 2;
      if (Ne === 1) be.children = F;
      else if (1 < Ne) {
        for (var K = Array(Ne), ne = 0; ne < Ne; ne++) K[ne] = arguments[ne + 2];
        be.children = K;
      }
      if (N && N.defaultProps)
        for (P in ((Ne = N.defaultProps), Ne)) be[P] === void 0 && (be[P] = Ne[P]);
      return Ke(N, Se, be);
    }),
    (le.createRef = function () {
      return { current: null };
    }),
    (le.forwardRef = function (N) {
      return { $$typeof: v, render: N };
    }),
    (le.isValidElement = at),
    (le.lazy = function (N) {
      return { $$typeof: _, _payload: { _status: -1, _result: N }, _init: re };
    }),
    (le.memo = function (N, H) {
      return { $$typeof: S, type: N, compare: H === void 0 ? null : H };
    }),
    (le.startTransition = rn),
    (le.unstable_useCacheRefresh = function () {
      return se.H.useCacheRefresh();
    }),
    (le.use = function (N) {
      return se.H.use(N);
    }),
    (le.useActionState = function (N, H, F) {
      return se.H.useActionState(N, H, F);
    }),
    (le.useCallback = function (N, H) {
      return se.H.useCallback(N, H);
    }),
    (le.useContext = function (N) {
      return se.H.useContext(N);
    }),
    (le.useDebugValue = function () {}),
    (le.useDeferredValue = function (N, H) {
      return se.H.useDeferredValue(N, H);
    }),
    (le.useEffect = function (N, H) {
      return se.H.useEffect(N, H);
    }),
    (le.useEffectEvent = function (N) {
      return se.H.useEffectEvent(N);
    }),
    (le.useId = function () {
      return se.H.useId();
    }),
    (le.useImperativeHandle = function (N, H, F) {
      return se.H.useImperativeHandle(N, H, F);
    }),
    (le.useInsertionEffect = function (N, H) {
      return se.H.useInsertionEffect(N, H);
    }),
    (le.useLayoutEffect = function (N, H) {
      return se.H.useLayoutEffect(N, H);
    }),
    (le.useMemo = function (N, H) {
      return se.H.useMemo(N, H);
    }),
    (le.useOptimistic = function (N, H) {
      return se.H.useOptimistic(N, H);
    }),
    (le.useReducer = function (N, H, F) {
      return se.H.useReducer(N, H, F);
    }),
    (le.useRef = function (N) {
      return se.H.useRef(N);
    }),
    (le.useState = function (N) {
      return se.H.useState(N);
    }),
    (le.useSyncExternalStore = function (N, H, F) {
      return se.H.useSyncExternalStore(N, H, F);
    }),
    (le.useTransition = function () {
      return se.H.useTransition();
    }),
    (le.version = '19.3.0'),
    le
  );
}
var Mv;
function Hf() {
  return (Mv || ((Mv = 1), (sf.exports = kb())), sf.exports);
}
var $ = Hf();
const Lb = jy($);
var of = { exports: {} },
  si = {},
  ff = { exports: {} },
  df = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Uv;
function Bb() {
  return (
    Uv ||
      ((Uv = 1),
      (function (l) {
        function u(G, ee) {
          var L = G.length;
          G.push(ee);
          e: for (; 0 < L;) {
            var re = (L - 1) >>> 1,
              _e = G[re];
            if (0 < f(_e, ee)) ((G[re] = ee), (G[L] = _e), (L = re));
            else break e;
          }
        }
        function r(G) {
          return G.length === 0 ? null : G[0];
        }
        function s(G) {
          if (G.length === 0) return null;
          var ee = G[0],
            L = G.pop();
          if (L !== ee) {
            G[0] = L;
            e: for (var re = 0, _e = G.length, rn = _e >>> 1; re < rn;) {
              var Rn = 2 * (re + 1) - 1,
                Ll = G[Rn],
                N = Rn + 1,
                H = G[N];
              if (0 > f(Ll, L))
                N < _e && 0 > f(H, Ll)
                  ? ((G[re] = H), (G[N] = L), (re = N))
                  : ((G[re] = Ll), (G[Rn] = L), (re = Rn));
              else if (N < _e && 0 > f(H, L)) ((G[re] = H), (G[N] = L), (re = N));
              else break e;
            }
          }
          return ee;
        }
        function f(G, ee) {
          var L = G.sortIndex - ee.sortIndex;
          return L !== 0 ? L : G.id - ee.id;
        }
        if (
          ((l.unstable_now = void 0),
          typeof performance == 'object' && typeof performance.now == 'function')
        ) {
          var h = performance;
          l.unstable_now = function () {
            return h.now();
          };
        } else {
          var m = Date,
            v = m.now();
          l.unstable_now = function () {
            return m.now() - v;
          };
        }
        var b = [],
          S = [],
          _ = 1,
          g = null,
          A = 3,
          w = !1,
          U = !1,
          V = !1,
          B = !1,
          k = typeof setTimeout == 'function' ? setTimeout : null,
          ae = typeof clearTimeout == 'function' ? clearTimeout : null,
          q = typeof setImmediate < 'u' ? setImmediate : null;
        function pe(G) {
          for (var ee = r(S); ee !== null;) {
            if (ee.callback === null) s(S);
            else if (ee.startTime <= G) (s(S), (ee.sortIndex = ee.expirationTime), u(b, ee));
            else break;
            ee = r(S);
          }
        }
        function fe(G) {
          if (((V = !1), pe(G), !U))
            if (r(b) !== null) ((U = !0), ue || ((ue = !0), at()));
            else {
              var ee = r(S);
              ee !== null && Ie(fe, ee.startTime - G);
            }
        }
        var ue = !1,
          W = -1,
          se = 5,
          bt = -1;
        function Ke() {
          return B ? !0 : !(l.unstable_now() - bt < se);
        }
        function lt() {
          if (((B = !1), ue)) {
            var G = l.unstable_now();
            bt = G;
            var ee = !0;
            try {
              e: {
                ((U = !1), V && ((V = !1), ae(W), (W = -1)), (w = !0));
                var L = A;
                try {
                  t: {
                    for (pe(G), g = r(b); g !== null && !(g.expirationTime > G && Ke());) {
                      var re = g.callback;
                      if (typeof re == 'function') {
                        ((g.callback = null), (A = g.priorityLevel));
                        var _e = re(g.expirationTime <= G);
                        if (((G = l.unstable_now()), typeof _e == 'function')) {
                          ((g.callback = _e), pe(G), (ee = !0));
                          break t;
                        }
                        (g === r(b) && s(b), pe(G));
                      } else s(b);
                      g = r(b);
                    }
                    if (g !== null) ee = !0;
                    else {
                      var rn = r(S);
                      (rn !== null && Ie(fe, rn.startTime - G), (ee = !1));
                    }
                  }
                  break e;
                } finally {
                  ((g = null), (A = L), (w = !1));
                }
                ee = void 0;
              }
            } finally {
              ee ? at() : (ue = !1);
            }
          }
        }
        var at;
        if (typeof q == 'function')
          at = function () {
            q(lt);
          };
        else if (typeof MessageChannel < 'u') {
          var Zt = new MessageChannel(),
            Ht = Zt.port2;
          ((Zt.port1.onmessage = lt),
            (at = function () {
              Ht.postMessage(null);
            }));
        } else
          at = function () {
            k(lt, 0);
          };
        function Ie(G, ee) {
          W = k(function () {
            G(l.unstable_now());
          }, ee);
        }
        ((l.unstable_IdlePriority = 5),
          (l.unstable_ImmediatePriority = 1),
          (l.unstable_LowPriority = 4),
          (l.unstable_NormalPriority = 3),
          (l.unstable_Profiling = null),
          (l.unstable_UserBlockingPriority = 2),
          (l.unstable_cancelCallback = function (G) {
            G.callback = null;
          }),
          (l.unstable_forceFrameRate = function (G) {
            0 > G || 125 < G
              ? console.error(
                  'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported',
                )
              : (se = 0 < G ? Math.floor(1e3 / G) : 5);
          }),
          (l.unstable_getCurrentPriorityLevel = function () {
            return A;
          }),
          (l.unstable_next = function (G) {
            switch (A) {
              case 1:
              case 2:
              case 3:
                var ee = 3;
                break;
              default:
                ee = A;
            }
            var L = A;
            A = ee;
            try {
              return G();
            } finally {
              A = L;
            }
          }),
          (l.unstable_requestPaint = function () {
            B = !0;
          }),
          (l.unstable_runWithPriority = function (G, ee) {
            switch (G) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                G = 3;
            }
            var L = A;
            A = G;
            try {
              return ee();
            } finally {
              A = L;
            }
          }),
          (l.unstable_scheduleCallback = function (G, ee, L) {
            var re = l.unstable_now();
            switch (
              (typeof L == 'object' && L !== null
                ? ((L = L.delay), (L = typeof L == 'number' && 0 < L ? re + L : re))
                : (L = re),
              G)
            ) {
              case 1:
                var _e = -1;
                break;
              case 2:
                _e = 250;
                break;
              case 5:
                _e = 1073741823;
                break;
              case 4:
                _e = 1e4;
                break;
              default:
                _e = 5e3;
            }
            return (
              (_e = L + _e),
              (G = {
                id: _++,
                callback: ee,
                priorityLevel: G,
                startTime: L,
                expirationTime: _e,
                sortIndex: -1,
              }),
              L > re
                ? ((G.sortIndex = L),
                  u(S, G),
                  r(b) === null && G === r(S) && (V ? (ae(W), (W = -1)) : (V = !0), Ie(fe, L - re)))
                : ((G.sortIndex = _e), u(b, G), U || w || ((U = !0), ue || ((ue = !0), at()))),
              G
            );
          }),
          (l.unstable_shouldYield = Ke),
          (l.unstable_wrapCallback = function (G) {
            var ee = A;
            return function () {
              var L = A;
              A = ee;
              try {
                return G.apply(this, arguments);
              } finally {
                A = L;
              }
            };
          }));
      })(df)),
    df
  );
}
var Zv;
function qb() {
  return (Zv || ((Zv = 1), (ff.exports = Bb())), ff.exports);
}
var hf = { exports: {} },
  vt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Hv;
function Yb() {
  if (Hv) return vt;
  Hv = 1;
  var l = Hf();
  function u(_) {
    var g = 'https://react.dev/errors/' + _;
    if (1 < arguments.length) {
      g += '?args[]=' + encodeURIComponent(arguments[1]);
      for (var A = 2; A < arguments.length; A++) g += '&args[]=' + encodeURIComponent(arguments[A]);
    }
    return (
      'Minified React error #' +
      _ +
      '; visit ' +
      g +
      ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
    );
  }
  function r() {}
  var s = {
      d: {
        f: r,
        r: function () {
          throw Error(u(522));
        },
        D: r,
        C: r,
        L: r,
        m: r,
        X: r,
        S: r,
        M: r,
      },
      p: 0,
      findDOMNode: null,
    },
    f = Symbol.for('react.portal'),
    h = Symbol.for('react.recoverable'),
    m = Symbol.for('react.optimistic_key');
  function v(_, g, A) {
    var w = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: f,
      key: w == null ? null : w === m ? m : '' + w,
      children: _,
      containerInfo: g,
      implementation: A,
    };
  }
  var b = l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function S(_, g) {
    if (_ === 'font') return '';
    if (typeof g == 'string') return g === 'use-credentials' ? g : '';
  }
  return (
    (vt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = s),
    (vt.browser = function (_) {
      return { $$typeof: h, _reason: _ };
    }),
    (vt.createPortal = function (_, g) {
      var A = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!g || (g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)) throw Error(u(299));
      return v(_, g, null, A);
    }),
    (vt.flushSync = function (_) {
      var g = b.T,
        A = s.p;
      try {
        if (((b.T = null), (s.p = 2), _)) return _();
      } finally {
        ((b.T = g), (s.p = A), s.d.f());
      }
    }),
    (vt.preconnect = function (_, g) {
      typeof _ == 'string' &&
        (g
          ? ((g = g.crossOrigin),
            (g = typeof g == 'string' ? (g === 'use-credentials' ? g : '') : void 0))
          : (g = null),
        s.d.C(_, g));
    }),
    (vt.prefetchDNS = function (_) {
      typeof _ == 'string' && s.d.D(_);
    }),
    (vt.preinit = function (_, g) {
      if (typeof _ == 'string' && g && typeof g.as == 'string') {
        var A = g.as,
          w = S(A, g.crossOrigin),
          U = typeof g.integrity == 'string' ? g.integrity : void 0,
          V = typeof g.fetchPriority == 'string' ? g.fetchPriority : void 0;
        A === 'style'
          ? s.d.S(_, typeof g.precedence == 'string' ? g.precedence : void 0, {
              crossOrigin: w,
              integrity: U,
              fetchPriority: V,
            })
          : A === 'script' &&
            s.d.X(_, {
              crossOrigin: w,
              integrity: U,
              fetchPriority: V,
              nonce: typeof g.nonce == 'string' ? g.nonce : void 0,
            });
      }
    }),
    (vt.preinitModule = function (_, g) {
      if (typeof _ == 'string')
        if (typeof g == 'object' && g !== null) {
          if (g.as == null || g.as === 'script') {
            var A = S(g.as, g.crossOrigin);
            s.d.M(_, {
              crossOrigin: A,
              integrity: typeof g.integrity == 'string' ? g.integrity : void 0,
              nonce: typeof g.nonce == 'string' ? g.nonce : void 0,
              fetchPriority: typeof g.fetchPriority == 'string' ? g.fetchPriority : void 0,
            });
          }
        } else g == null && s.d.M(_);
    }),
    (vt.preload = function (_, g) {
      if (typeof _ == 'string' && typeof g == 'object' && g !== null && typeof g.as == 'string') {
        var A = g.as,
          w = S(A, g.crossOrigin);
        s.d.L(_, A, {
          crossOrigin: w,
          integrity: typeof g.integrity == 'string' ? g.integrity : void 0,
          nonce: typeof g.nonce == 'string' ? g.nonce : void 0,
          type: typeof g.type == 'string' ? g.type : void 0,
          fetchPriority: typeof g.fetchPriority == 'string' ? g.fetchPriority : void 0,
          referrerPolicy: typeof g.referrerPolicy == 'string' ? g.referrerPolicy : void 0,
          imageSrcSet: typeof g.imageSrcSet == 'string' ? g.imageSrcSet : void 0,
          imageSizes: typeof g.imageSizes == 'string' ? g.imageSizes : void 0,
          media: typeof g.media == 'string' ? g.media : void 0,
        });
      }
    }),
    (vt.preloadModule = function (_, g) {
      if (typeof _ == 'string')
        if (g) {
          var A = S(g.as, g.crossOrigin);
          s.d.m(_, {
            as: typeof g.as == 'string' && g.as !== 'script' ? g.as : void 0,
            crossOrigin: A,
            integrity: typeof g.integrity == 'string' ? g.integrity : void 0,
            nonce: typeof g.nonce == 'string' ? g.nonce : void 0,
            fetchPriority: typeof g.fetchPriority == 'string' ? g.fetchPriority : void 0,
          });
        } else s.d.m(_);
    }),
    (vt.requestFormReset = function (_) {
      s.d.r(_);
    }),
    (vt.unstable_batchedUpdates = function (_, g) {
      return _(g);
    }),
    (vt.useFormState = function (_, g, A) {
      return b.H.useFormState(_, g, A);
    }),
    (vt.useFormStatus = function () {
      return b.H.useHostTransitionStatus();
    }),
    (vt.version = '19.3.0'),
    vt
  );
}
var kv;
function Vb() {
  if (kv) return hf.exports;
  kv = 1;
  function l() {
    if (!(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
    ))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l);
      } catch (u) {
        console.error(u);
      }
  }
  return (l(), (hf.exports = Yb()), hf.exports);
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Lv;
function Gb() {
  if (Lv) return si;
  Lv = 1;
  var l = qb(),
    u = Hf(),
    r = Vb();
  function s(e) {
    var t = 'https://react.dev/errors/' + e;
    if (1 < arguments.length) {
      t += '?args[]=' + encodeURIComponent(arguments[1]);
      for (var n = 2; n < arguments.length; n++) t += '&args[]=' + encodeURIComponent(arguments[n]);
    }
    return (
      'Minified React error #' +
      e +
      '; visit ' +
      t +
      ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
    );
  }
  function f(e) {
    return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
  }
  function h(e) {
    for (var t = e, n = t; n && !n.alternate;)
      ((t = n), (t.flags & 4098) !== 0 && (e = t.return), (n = t.return));
    for (; t.return;) t = t.return;
    return t.tag === 3 ? e : null;
  }
  function m(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null))
        return t.dehydrated;
    }
    return null;
  }
  function v(e) {
    if (e.tag === 31) {
      var t = e.memoizedState;
      if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null))
        return t.dehydrated;
    }
    return null;
  }
  function b(e) {
    if (h(e) !== e) throw Error(s(188));
  }
  function S(e) {
    var t = e.alternate;
    if (!t) {
      if (((t = h(e)), t === null)) throw Error(s(188));
      return t !== e ? null : e;
    }
    for (var n = e, a = t; ;) {
      var i = n.return;
      if (i === null) break;
      var c = i.alternate;
      if (c === null) {
        if (((a = i.return), a !== null)) {
          n = a;
          continue;
        }
        break;
      }
      if (i.child === c.child) {
        for (c = i.child; c;) {
          if (c === n) return (b(i), e);
          if (c === a) return (b(i), t);
          c = c.sibling;
        }
        throw Error(s(188));
      }
      if (n.return !== a.return) ((n = i), (a = c));
      else {
        for (var d = !1, p = i.child; p;) {
          if (p === n) {
            ((d = !0), (n = i), (a = c));
            break;
          }
          if (p === a) {
            ((d = !0), (a = i), (n = c));
            break;
          }
          p = p.sibling;
        }
        if (!d) {
          for (p = c.child; p;) {
            if (p === n) {
              ((d = !0), (n = c), (a = i));
              break;
            }
            if (p === a) {
              ((d = !0), (a = c), (n = i));
              break;
            }
            p = p.sibling;
          }
          if (!d) throw Error(s(189));
        }
      }
      if (n.alternate !== a) throw Error(s(190));
    }
    if (n.tag !== 3) throw Error(s(188));
    return n.stateNode.current === n ? e : t;
  }
  function _(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e;
    for (e = e.child; e !== null;) {
      if (((t = _(e)), t !== null)) return t;
      e = e.sibling;
    }
    return null;
  }
  function g(e, t, n, a, i, c) {
    for (; e !== null;) {
      if (
        ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, a, i, c)) ||
        ((e.tag !== 22 || e.memoizedState === null) &&
          (t || (e.tag !== 5 && e.tag !== 27)) &&
          g(e.child, t, n, a, i, c))
      )
        return !0;
      e = e.sibling;
    }
    return !1;
  }
  function A(e) {
    for (e = e.return; e !== null;) {
      if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
      e = e.return;
    }
    return null;
  }
  function w(e) {
    var t = !1;
    for (
      e = e.return;
      e !== null && (e.tag === 4 && (t = !0), !(e.tag === 3 || e.tag === 5 || e.tag === 27));
    )
      e = e.return;
    return t;
  }
  function U(e) {
    var t = [null, null],
      n = A(e);
    return (n === null || V(t, e, n.child, { foundSelf: !1 }), t);
  }
  function V(e, t, n, a) {
    for (; n !== null;) {
      if (n === t) a.foundSelf = !0;
      else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
        if (a.foundSelf) return ((e[1] = n), !0);
        e[0] = n;
      } else if ((n.tag !== 22 || n.memoizedState === null) && V(e, t, n.child, a)) return !0;
      n = n.sibling;
    }
    return !1;
  }
  function B(e) {
    switch (e.tag) {
      case 5:
      case 27:
      case 6:
        return e.stateNode;
      case 3:
        return e.stateNode.containerInfo;
      default:
        throw Error(s(559));
    }
  }
  var k = null,
    ae = null;
  function q(e, t, n) {
    return e === n ? !0 : e === t ? ((k = e), !0) : !1;
  }
  function pe(e, t, n) {
    return e === n ? ((ae = e), !1) : e === t ? (ae !== null && (k = e), !0) : !1;
  }
  function fe(e) {
    if (e === null) return null;
    do e = e === null ? null : e.return;
    while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
    return e || null;
  }
  function ue(e, t, n) {
    for (var a = 0, i = e; i; i = n(i)) a++;
    i = 0;
    for (var c = t; c; c = n(c)) i++;
    for (; 0 < a - i;) ((e = n(e)), a--);
    for (; 0 < i - a;) ((t = n(t)), i--);
    for (; a--;) {
      if (e === t || (t !== null && e === t.alternate)) return e;
      ((e = n(e)), (t = n(t)));
    }
    return null;
  }
  var W = Object.assign,
    se = Symbol.for('react.element'),
    bt = Symbol.for('react.transitional.element'),
    Ke = Symbol.for('react.portal'),
    lt = Symbol.for('react.fragment'),
    at = Symbol.for('react.strict_mode'),
    Zt = Symbol.for('react.profiler'),
    Ht = Symbol.for('react.consumer'),
    Ie = Symbol.for('react.context'),
    G = Symbol.for('react.forward_ref'),
    ee = Symbol.for('react.suspense'),
    L = Symbol.for('react.suspense_list'),
    re = Symbol.for('react.memo'),
    _e = Symbol.for('react.lazy'),
    rn = Symbol.for('react.activity'),
    Rn = Symbol.for('react.legacy_hidden'),
    Ll = Symbol.for('react.memo_cache_sentinel'),
    N = Symbol.for('react.view_transition'),
    H = Symbol.for('react.recoverable'),
    F = Symbol.iterator;
  function P(e) {
    return e === null || typeof e != 'object'
      ? null
      : ((e = (F && e[F]) || e['@@iterator']), typeof e == 'function' ? e : null);
  }
  var be = Symbol.for('react.client.reference');
  function Se(e) {
    if (e == null) return null;
    if (typeof e == 'function') return e.$$typeof === be ? null : e.displayName || e.name || null;
    if (typeof e == 'string') return e;
    switch (e) {
      case lt:
        return 'Fragment';
      case Zt:
        return 'Profiler';
      case at:
        return 'StrictMode';
      case ee:
        return 'Suspense';
      case L:
        return 'SuspenseList';
      case rn:
        return 'Activity';
      case N:
        return 'ViewTransition';
    }
    if (typeof e == 'object')
      switch (e.$$typeof) {
        case Ke:
          return 'Portal';
        case Ie:
          return e.displayName || 'Context';
        case Ht:
          return (e._context.displayName || 'Context') + '.Consumer';
        case G:
          var t = e.render;
          return (
            (e = e.displayName),
            e ||
              ((e = t.displayName || t.name || ''),
              (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
            e
          );
        case re:
          return ((t = e.displayName || null), t !== null ? t : Se(e.type) || 'Memo');
        case _e:
          ((t = e._payload), (e = e._init));
          try {
            return Se(e(t));
          } catch {}
      }
    return null;
  }
  var Ne = Array.isArray,
    K = u.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    ne = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    Mn = { pending: !1, data: null, method: null, action: null },
    Tr = [],
    da = -1;
  function yn(e) {
    return { current: e };
  }
  function st(e) {
    0 > da || ((e.current = Tr[da]), (Tr[da] = null), da--);
  }
  function Me(e, t) {
    (da++, (Tr[da] = e.current), (e.current = t));
  }
  var gn = yn(null),
    mu = yn(null),
    el = yn(null),
    Ni = yn(null);
  function Ei(e, t) {
    switch ((Me(el, t), Me(mu, e), Me(gn, null), t.nodeType)) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Bp(e) : 0;
        break;
      default:
        if (((e = t.tagName), (t = t.namespaceURI))) ((t = Bp(t)), (e = qp(t, e)));
        else
          switch (e) {
            case 'svg':
              e = 1;
              break;
            case 'math':
              e = 2;
              break;
            default:
              e = 0;
          }
    }
    (st(gn), Me(gn, e));
  }
  function ha() {
    (st(gn), st(mu), st(el));
  }
  function jr(e) {
    var t = e.memoizedState;
    (t !== null && ((eu._currentValue = t.memoizedState), Me(Ni, e)), (t = gn.current));
    var n = qp(t, e.type);
    t !== n && (Me(mu, e), Me(gn, n));
  }
  function Ti(e) {
    (mu.current === e && (st(gn), st(mu)), Ni.current === e && (st(Ni), (eu._currentValue = Mn)));
  }
  var xr, cd;
  function tl(e) {
    if (xr === void 0)
      try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        ((xr = (t && t[1]) || ''),
          (cd =
            -1 <
            n.stack.indexOf(`
    at`)
              ? ' (<anonymous>)'
              : -1 < n.stack.indexOf('@')
                ? '@unknown:0:0'
                : ''));
      }
    return (
      `
` +
      xr +
      e +
      cd
    );
  }
  var Or = !1;
  function Ar(e, t) {
    if (!e || Or) return '';
    Or = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var a = {
        DetermineComponentFrameRoot: function () {
          try {
            if (t) {
              var M = function () {
                throw Error();
              };
              if (
                (Object.defineProperty(M.prototype, 'props', {
                  set: function () {
                    throw Error();
                  },
                }),
                typeof Reflect == 'object' && Reflect.construct)
              ) {
                try {
                  Reflect.construct(M, []);
                } catch (Y) {
                  var E = Y;
                }
                Reflect.construct(e, [], M);
              } else {
                try {
                  M.call();
                } catch (Y) {
                  E = Y;
                }
                M = !1;
                try {
                  var C = Object.getOwnPropertyDescriptor(e.prototype, 'props');
                  (Object.defineProperty(e.prototype, 'props', {
                    configurable: !0,
                    set: function () {
                      throw Error();
                    },
                  }),
                    (M = !0),
                    new e());
                } finally {
                  M &&
                    (C !== void 0
                      ? Object.defineProperty(e.prototype, 'props', C)
                      : delete e.prototype.props);
                }
              }
            } else {
              try {
                throw Error();
              } catch (Y) {
                E = Y;
              }
              (M = e()) && typeof M.catch == 'function' && M.catch(function () {});
            }
          } catch (Y) {
            if (Y && E && typeof Y.stack == 'string') return [Y.stack, E.stack];
          }
          return [null, null];
        },
      };
      a.DetermineComponentFrameRoot.displayName = 'DetermineComponentFrameRoot';
      var i = Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot, 'name');
      i &&
        i.configurable &&
        Object.defineProperty(a.DetermineComponentFrameRoot, 'name', {
          value: 'DetermineComponentFrameRoot',
        });
      var c = a.DetermineComponentFrameRoot(),
        d = c[0],
        p = c[1];
      if (d && p) {
        var y = d.split(`
`),
          j = p.split(`
`);
        for (i = a = 0; a < y.length && !y[a].includes('DetermineComponentFrameRoot');) a++;
        for (; i < j.length && !j[i].includes('DetermineComponentFrameRoot');) i++;
        if (a === y.length || i === j.length)
          for (a = y.length - 1, i = j.length - 1; 1 <= a && 0 <= i && y[a] !== j[i];) i--;
        for (; 1 <= a && 0 <= i; a--, i--)
          if (y[a] !== j[i]) {
            if (a !== 1 || i !== 1)
              do
                if ((a--, i--, 0 > i || y[a] !== j[i])) {
                  var D =
                    `
` + y[a].replace(' at new ', ' at ');
                  return (
                    e.displayName &&
                      D.includes('<anonymous>') &&
                      (D = D.replace('<anonymous>', e.displayName)),
                    D
                  );
                }
              while (1 <= a && 0 <= i);
            break;
          }
      }
    } finally {
      ((Or = !1), (Error.prepareStackTrace = n));
    }
    return (n = e ? e.displayName || e.name : '') ? tl(n) : '';
  }
  function B0(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return tl(e.type);
      case 16:
        return tl('Lazy');
      case 13:
        return e.child !== t && t !== null ? tl('Suspense Fallback') : tl('Suspense');
      case 19:
        return tl('SuspenseList');
      case 0:
      case 15:
        return Ar(e.type, !1);
      case 11:
        return Ar(e.type.render, !1);
      case 1:
        return Ar(e.type, !0);
      case 31:
        return tl('Activity');
      case 30:
        return tl('ViewTransition');
      default:
        return '';
    }
  }
  function rd(e) {
    try {
      var t = '',
        n = null;
      do ((t += B0(e, n)), (n = e), (e = e.return));
      while (e);
      return t;
    } catch (a) {
      return (
        `
Error generating stack: ` +
        a.message +
        `
` +
        a.stack
      );
    }
  }
  var Cr = Object.prototype.hasOwnProperty,
    Dr = l.unstable_scheduleCallback,
    wr = l.unstable_cancelCallback,
    q0 = l.unstable_shouldYield,
    Y0 = l.unstable_requestPaint,
    kt = l.unstable_now,
    V0 = l.unstable_getCurrentPriorityLevel,
    sd = l.unstable_ImmediatePriority,
    od = l.unstable_UserBlockingPriority,
    ji = l.unstable_NormalPriority,
    G0 = l.unstable_LowPriority,
    fd = l.unstable_IdlePriority,
    X0 = l.log,
    Q0 = l.unstable_setDisableYieldValue,
    pu = null,
    Lt = null;
  function nl(e) {
    if ((typeof X0 == 'function' && Q0(e), Lt && typeof Lt.setStrictMode == 'function'))
      try {
        Lt.setStrictMode(pu, e);
      } catch {}
  }
  var Bt = Math.clz32 ? Math.clz32 : I0,
    $0 = Math.log,
    K0 = Math.LN2;
  function I0(e) {
    return ((e >>>= 0), e === 0 ? 32 : (31 - (($0(e) / K0) | 0)) | 0);
  }
  var xi = 256,
    Oi = 262144,
    Ai = 4194304;
  function Bl(e) {
    var t = e & 42;
    if (t !== 0) return t;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & -e;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function Ci(e, t, n) {
    var a = e.pendingLanes;
    if (a === 0) return 0;
    var i = 0,
      c = e.suspendedLanes,
      d = e.pingedLanes;
    e = e.warmLanes;
    var p = a & 134217727;
    return (
      p !== 0
        ? ((a = p & ~c),
          a !== 0
            ? (i = Bl(a))
            : ((d &= p), d !== 0 ? (i = Bl(d)) : n || ((n = p & ~e), n !== 0 && (i = Bl(n)))))
        : ((p = a & ~c),
          p !== 0
            ? (i = Bl(p))
            : d !== 0
              ? (i = Bl(d))
              : n || ((n = a & ~e), n !== 0 && (i = Bl(n)))),
      i === 0
        ? 0
        : t !== 0 &&
            t !== i &&
            (t & c) === 0 &&
            ((c = i & -i), (n = t & -t), c >= n || (c === 32 && (n & 4194048) !== 0))
          ? t
          : i
    );
  }
  function vu(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function dd(e, t) {
    (t & 8) !== 0 && (t |= t & 32);
    var n = e.entangledLanes;
    if (n !== 0)
      for (e = e.entanglements, n &= t; 0 < n;) {
        var a = 31 - Bt(n),
          i = 1 << a;
        ((t |= e[a]), (n &= ~i));
      }
    return t;
  }
  function J0(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function hd() {
    var e = Ai;
    return ((Ai <<= 1), (Ai & 62914560) === 0 && (Ai = 4194304), e);
  }
  function Rr(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function yu(e, t) {
    ((e.pendingLanes |= t),
      t !== 268435456 && ((e.suspendedLanes = 0), (e.pingedLanes = 0), (e.warmLanes = 0)));
  }
  function F0(e, t, n, a, i, c) {
    var d = e.pendingLanes;
    ((e.pendingLanes = n),
      (e.suspendedLanes = 0),
      (e.pingedLanes = 0),
      (e.warmLanes = 0),
      (e.expiredLanes &= n),
      (e.entangledLanes &= n),
      (e.errorRecoveryDisabledLanes &= n),
      (e.shellSuspendCounter = 0));
    var p = e.entanglements,
      y = e.expirationTimes,
      j = e.hiddenUpdates;
    for (n = d & ~n; 0 < n;) {
      var D = 31 - Bt(n),
        M = 1 << D;
      ((p[D] = 0), (y[D] = -1));
      var E = j[D];
      if (E !== null)
        for (j[D] = null, D = 0; D < E.length; D++) {
          var C = E[D];
          C !== null && (C.lane &= -536870913);
        }
      n &= ~M;
    }
    (a !== 0 && md(e, a, 0),
      c !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= c & ~(d & ~t)));
  }
  function md(e, t, n) {
    ((e.pendingLanes |= t), (e.suspendedLanes &= ~t));
    var a = 31 - Bt(t);
    ((e.entangledLanes |= t),
      (e.entanglements[a] = e.entanglements[a] | 1073741824 | (n & 261930)));
  }
  function pd(e, t) {
    var n = (e.entangledLanes |= t);
    for (e = e.entanglements; n;) {
      var a = 31 - Bt(n),
        i = 1 << a;
      ((i & t) | (e[a] & t) && (e[a] |= t), (n &= ~i));
    }
  }
  function vd(e, t) {
    var n = t & -t;
    return ((n = (n & 42) !== 0 ? 1 : Mr(n)), (n & (e.suspendedLanes | t)) !== 0 ? 0 : n);
  }
  function Mr(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function Ur(e) {
    return ((e &= -e), 2 < e ? (8 < e ? ((e & 134217727) !== 0 ? 32 : 268435456) : 8) : 2);
  }
  function yd() {
    var e = ne.p;
    return e !== 0 ? e : ((e = window.event), e === void 0 ? 32 : Ev(e.type));
  }
  function gd(e, t) {
    var n = ne.p;
    try {
      return ((ne.p = e), t());
    } finally {
      ne.p = n;
    }
  }
  var Un = Math.random().toString(36).slice(2),
    ot = '__reactFiber$' + Un,
    Ot = '__reactProps$' + Un,
    ma = '__reactContainer$' + Un,
    bd = '__reactEvents$' + Un,
    P0 = '__reactListeners$' + Un,
    W0 = '__reactHandles$' + Un,
    _d = '__reactResources$' + Un,
    gu = '__reactMarker$' + Un,
    Di = '__reactLoad$' + Un;
  function wi(e) {
    (delete e[ot], delete e[Ot], delete e[P0], delete e[W0]);
  }
  function ql(e) {
    var t;
    if ((t = e[ot])) return t;
    for (var n = e.parentNode; n;) {
      if ((t = n[ma] || n[ot])) {
        if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null)))
          for (e = av(e); e !== null;) {
            if ((n = e[ot])) return n;
            e = av(e);
          }
        return t;
      }
      ((e = n), (n = e.parentNode));
    }
    return null;
  }
  function pa(e) {
    if ((e = e[ot] || e[ma])) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
    }
    return null;
  }
  function bu(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(s(33));
  }
  function va(e) {
    var t = e[_d];
    return (t || (t = e[_d] = { hoistableStyles: new Map(), hoistableScripts: new Map() }), t);
  }
  function ut(e) {
    e[gu] = !0;
  }
  function Sd(e) {
    e[Di] = void 0;
  }
  var zd = new Set(),
    Nd = {};
  function Yl(e, t) {
    (ya(e, t), ya(e + 'Capture', t));
  }
  function ya(e, t) {
    for (Nd[e] = t, e = 0; e < t.length; e++) zd.add(t[e]);
  }
  var eg = RegExp(
      '^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$',
    ),
    Ed = {},
    Td = {};
  function tg(e) {
    return Cr.call(Td, e)
      ? !0
      : Cr.call(Ed, e)
        ? !1
        : eg.test(e)
          ? (Td[e] = !0)
          : ((Ed[e] = !0), !1);
  }
  var ze = !1;
  function jd() {
    var e = ze;
    return ((ze = !1), e);
  }
  function Ri(e, t, n) {
    if (tg(t))
      if (n === null) e.removeAttribute(t);
      else {
        switch (typeof n) {
          case 'undefined':
          case 'function':
          case 'symbol':
            e.removeAttribute(t);
            return;
          case 'boolean':
            var a = t.toLowerCase().slice(0, 5);
            if (a !== 'data-' && a !== 'aria-') {
              e.removeAttribute(t);
              return;
            }
        }
        e.setAttribute(t, n);
      }
  }
  function Mi(e, t, n) {
    if (n === null) e.removeAttribute(t);
    else {
      switch (typeof n) {
        case 'undefined':
        case 'function':
        case 'symbol':
        case 'boolean':
          e.removeAttribute(t);
          return;
      }
      e.setAttribute(t, n);
    }
  }
  function Zn(e, t, n, a) {
    if (a === null) e.removeAttribute(n);
    else {
      switch (typeof a) {
        case 'undefined':
        case 'function':
        case 'symbol':
        case 'boolean':
          e.removeAttribute(n);
          return;
      }
      e.setAttributeNS(t, n, a);
    }
  }
  function qt(e) {
    switch (typeof e) {
      case 'bigint':
      case 'boolean':
      case 'number':
      case 'string':
      case 'undefined':
        return e;
      case 'object':
        return e;
      default:
        return '';
    }
  }
  function xd(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === 'input' && (t === 'checkbox' || t === 'radio');
  }
  function ng(e, t, n) {
    var a = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
    if (
      !e.hasOwnProperty(t) &&
      typeof a < 'u' &&
      typeof a.get == 'function' &&
      typeof a.set == 'function'
    ) {
      var i = a.get,
        c = a.set;
      return (
        Object.defineProperty(e, t, {
          configurable: !0,
          get: function () {
            return i.call(this);
          },
          set: function (d) {
            ((n = '' + d), c.call(this, d));
          },
        }),
        Object.defineProperty(e, t, { enumerable: a.enumerable }),
        {
          getValue: function () {
            return n;
          },
          setValue: function (d) {
            n = '' + d;
          },
          stopTracking: function () {
            ((e._valueTracker = null), delete e[t]);
          },
        }
      );
    }
  }
  function Zr(e) {
    if (!e._valueTracker) {
      var t = xd(e) ? 'checked' : 'value';
      e._valueTracker = ng(e, t, '' + e[t]);
    }
  }
  function Od(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(),
      a = '';
    return (
      e && (a = xd(e) ? (e.checked ? 'true' : 'false') : e.value),
      (e = a),
      e !== n ? (t.setValue(e), !0) : !1
    );
  }
  var lg = /[\n"\\]/g;
  function Ft(e) {
    return e.replace(lg, function (t) {
      return '\\' + t.charCodeAt(0).toString(16) + ' ';
    });
  }
  function Hr(e, t, n, a, i, c, d, p) {
    ((e.name = ''),
      d != null && typeof d != 'function' && typeof d != 'symbol' && typeof d != 'boolean'
        ? (e.type = d)
        : e.removeAttribute('type'),
      t != null
        ? d === 'number'
          ? ((t === 0 && e.value === '') || e.value != t) && (e.value = '' + qt(t))
          : e.value !== '' + qt(t) && (e.value = '' + qt(t))
        : (d !== 'submit' && d !== 'reset') || e.removeAttribute('value'),
      t != null
        ? d === 'number' && e.value == t
          ? kr(e, qt(e.value))
          : kr(e, qt(t))
        : n != null
          ? kr(e, qt(n))
          : a != null && e.removeAttribute('value'),
      i == null && c != null && (e.defaultChecked = !!c),
      i != null && (e.checked = i && typeof i != 'function' && typeof i != 'symbol'),
      p != null && typeof p != 'function' && typeof p != 'symbol' && typeof p != 'boolean'
        ? (e.name = '' + qt(p))
        : e.removeAttribute('name'));
  }
  function Ad(e, t, n, a, i, c, d, p) {
    if (
      (c != null &&
        typeof c != 'function' &&
        typeof c != 'symbol' &&
        typeof c != 'boolean' &&
        (e.type = c),
      t != null || n != null)
    ) {
      if (!((c !== 'submit' && c !== 'reset') || t != null)) {
        Zr(e);
        return;
      }
      ((n = n != null ? '' + qt(n) : ''),
        (t = t != null ? '' + qt(t) : n),
        p || t === e.value || (e.value = t),
        (e.defaultValue = t));
    }
    ((a = a ?? i),
      (a = typeof a != 'function' && typeof a != 'symbol' && !!a),
      (e.checked = p ? e.checked : !!a),
      (e.defaultChecked = !!a),
      d != null &&
        typeof d != 'function' &&
        typeof d != 'symbol' &&
        typeof d != 'boolean' &&
        (e.name = d),
      Zr(e));
  }
  function kr(e, t) {
    e.defaultValue !== '' + t && (e.defaultValue = '' + t);
  }
  function ga(e, t, n, a) {
    if (((e = e.options), t)) {
      t = {};
      for (var i = 0; i < n.length; i++) t['$' + n[i]] = !0;
      for (n = 0; n < e.length; n++)
        ((i = t.hasOwnProperty('$' + e[n].value)),
          e[n].selected !== i && (e[n].selected = i),
          i && a && (e[n].defaultSelected = !0));
    } else {
      for (n = '' + qt(n), t = null, i = 0; i < e.length; i++) {
        if (e[i].value === n) {
          ((e[i].selected = !0), a && (e[i].defaultSelected = !0));
          return;
        }
        t !== null || e[i].disabled || (t = e[i]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Cd(e, t, n) {
    if (t != null && ((t = '' + qt(t)), t !== e.value && (e.value = t), n == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = n != null ? '' + qt(n) : '';
  }
  function Dd(e, t, n, a) {
    if (t == null) {
      if (a != null) {
        if (n != null) throw Error(s(92));
        if (Ne(a)) {
          if (1 < a.length) throw Error(s(93));
          a = a[0];
        }
        n = a;
      }
      (n == null && (n = ''), (t = n));
    }
    ((n = qt(t)),
      (e.defaultValue = n),
      (a = e.textContent),
      a === n && a !== '' && a !== null && (e.value = a),
      Zr(e));
  }
  function ba(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var ag = new Set(
    'animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp'.split(
      ' ',
    ),
  );
  function wd(e, t, n) {
    var a = t.indexOf('--') === 0;
    n == null || typeof n == 'boolean' || n === ''
      ? a
        ? e.setProperty(t, '')
        : t === 'float'
          ? (e.cssFloat = '')
          : (e[t] = '')
      : a
        ? e.setProperty(t, n)
        : typeof n != 'number' || n === 0 || ag.has(t)
          ? t === 'float'
            ? (e.cssFloat = n)
            : (e[t] = ('' + n).trim())
          : (e[t] = n + 'px');
  }
  function Rd(e, t, n) {
    if (t != null && typeof t != 'object') throw Error(s(62));
    if (((e = e.style), n != null)) {
      for (var a in n)
        !n.hasOwnProperty(a) ||
          (t != null && t.hasOwnProperty(a)) ||
          (a.indexOf('--') === 0
            ? e.setProperty(a, '')
            : a === 'float'
              ? (e.cssFloat = '')
              : (e[a] = ''),
          (ze = !0));
      for (var i in t) ((a = t[i]), t.hasOwnProperty(i) && n[i] !== a && (wd(e, i, a), (ze = !0)));
    } else for (var c in t) t.hasOwnProperty(c) && wd(e, c, t[c]);
  }
  function Lr(e) {
    if (e.indexOf('-') === -1) return !1;
    switch (e) {
      case 'annotation-xml':
      case 'color-profile':
      case 'font-face':
      case 'font-face-src':
      case 'font-face-uri':
      case 'font-face-format':
      case 'font-face-name':
      case 'missing-glyph':
        return !1;
      default:
        return !0;
    }
  }
  var ug = new Map([
      ['acceptCharset', 'accept-charset'],
      ['htmlFor', 'for'],
      ['httpEquiv', 'http-equiv'],
      ['crossOrigin', 'crossorigin'],
      ['accentHeight', 'accent-height'],
      ['alignmentBaseline', 'alignment-baseline'],
      ['arabicForm', 'arabic-form'],
      ['baselineShift', 'baseline-shift'],
      ['capHeight', 'cap-height'],
      ['clipPath', 'clip-path'],
      ['clipRule', 'clip-rule'],
      ['colorInterpolation', 'color-interpolation'],
      ['colorInterpolationFilters', 'color-interpolation-filters'],
      ['colorProfile', 'color-profile'],
      ['colorRendering', 'color-rendering'],
      ['dominantBaseline', 'dominant-baseline'],
      ['enableBackground', 'enable-background'],
      ['fillOpacity', 'fill-opacity'],
      ['fillRule', 'fill-rule'],
      ['floodColor', 'flood-color'],
      ['floodOpacity', 'flood-opacity'],
      ['fontFamily', 'font-family'],
      ['fontSize', 'font-size'],
      ['fontSizeAdjust', 'font-size-adjust'],
      ['fontStretch', 'font-stretch'],
      ['fontStyle', 'font-style'],
      ['fontVariant', 'font-variant'],
      ['fontWeight', 'font-weight'],
      ['glyphName', 'glyph-name'],
      ['glyphOrientationHorizontal', 'glyph-orientation-horizontal'],
      ['glyphOrientationVertical', 'glyph-orientation-vertical'],
      ['horizAdvX', 'horiz-adv-x'],
      ['horizOriginX', 'horiz-origin-x'],
      ['imageRendering', 'image-rendering'],
      ['letterSpacing', 'letter-spacing'],
      ['lightingColor', 'lighting-color'],
      ['markerEnd', 'marker-end'],
      ['markerMid', 'marker-mid'],
      ['markerStart', 'marker-start'],
      ['maskType', 'mask-type'],
      ['overlinePosition', 'overline-position'],
      ['overlineThickness', 'overline-thickness'],
      ['paintOrder', 'paint-order'],
      ['panose-1', 'panose-1'],
      ['pointerEvents', 'pointer-events'],
      ['renderingIntent', 'rendering-intent'],
      ['shapeRendering', 'shape-rendering'],
      ['stopColor', 'stop-color'],
      ['stopOpacity', 'stop-opacity'],
      ['strikethroughPosition', 'strikethrough-position'],
      ['strikethroughThickness', 'strikethrough-thickness'],
      ['strokeDasharray', 'stroke-dasharray'],
      ['strokeDashoffset', 'stroke-dashoffset'],
      ['strokeLinecap', 'stroke-linecap'],
      ['strokeLinejoin', 'stroke-linejoin'],
      ['strokeMiterlimit', 'stroke-miterlimit'],
      ['strokeOpacity', 'stroke-opacity'],
      ['strokeWidth', 'stroke-width'],
      ['textAnchor', 'text-anchor'],
      ['textDecoration', 'text-decoration'],
      ['textRendering', 'text-rendering'],
      ['transformOrigin', 'transform-origin'],
      ['underlinePosition', 'underline-position'],
      ['underlineThickness', 'underline-thickness'],
      ['unicodeBidi', 'unicode-bidi'],
      ['unicodeRange', 'unicode-range'],
      ['unitsPerEm', 'units-per-em'],
      ['vAlphabetic', 'v-alphabetic'],
      ['vHanging', 'v-hanging'],
      ['vIdeographic', 'v-ideographic'],
      ['vMathematical', 'v-mathematical'],
      ['vectorEffect', 'vector-effect'],
      ['vertAdvY', 'vert-adv-y'],
      ['vertOriginX', 'vert-origin-x'],
      ['vertOriginY', 'vert-origin-y'],
      ['wordSpacing', 'word-spacing'],
      ['writingMode', 'writing-mode'],
      ['xmlnsXlink', 'xmlns:xlink'],
      ['xHeight', 'x-height'],
    ]),
    ig =
      /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Ui(e) {
    return ig.test('' + e)
      ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      : e;
  }
  function bn() {}
  var Br = null;
  function qr(e) {
    return (
      (e = e.target || e.srcElement || window),
      e.correspondingUseElement && (e = e.correspondingUseElement),
      e.nodeType === 3 ? e.parentNode : e
    );
  }
  var _a = null,
    Sa = null;
  function Md(e) {
    var t = pa(e);
    if (t && (e = t.stateNode)) {
      var n = e[Ot] || null;
      e: switch (((e = t.stateNode), t.type)) {
        case 'input':
          if (
            (Hr(
              e,
              n.value,
              n.defaultValue,
              n.defaultValue,
              n.checked,
              n.defaultChecked,
              n.type,
              n.name,
            ),
            (t = n.name),
            n.type === 'radio' && t != null)
          ) {
            for (n = e; n.parentNode;) n = n.parentNode;
            for (
              n = n.querySelectorAll('input[name="' + Ft('' + t) + '"][type="radio"]'), t = 0;
              t < n.length;
              t++
            ) {
              var a = n[t];
              if (a !== e && a.form === e.form) {
                var i = a[Ot] || null;
                if (!i) throw Error(s(90));
                Hr(
                  a,
                  i.value,
                  i.defaultValue,
                  i.defaultValue,
                  i.checked,
                  i.defaultChecked,
                  i.type,
                  i.name,
                );
              }
            }
            for (t = 0; t < n.length; t++) ((a = n[t]), a.form === e.form && Od(a));
          }
          break e;
        case 'textarea':
          Cd(e, n.value, n.defaultValue);
          break e;
        case 'select':
          ((t = n.value), t != null && ga(e, !!n.multiple, t, !1));
      }
    }
  }
  var Yr = !1;
  function Ud(e, t, n) {
    if (Yr) return e(t, n);
    Yr = !0;
    try {
      var a = e(t);
      return a;
    } finally {
      if (
        ((Yr = !1),
        (_a !== null || Sa !== null) &&
          (Uc(), _a && ((t = _a), (e = Sa), (Sa = _a = null), Md(t), e)))
      )
        for (t = 0; t < e.length; t++) Md(e[t]);
    }
  }
  function _u(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var a = n[Ot] || null;
    if (a === null) return null;
    n = a[t];
    e: switch (t) {
      case 'onClick':
      case 'onClickCapture':
      case 'onDoubleClick':
      case 'onDoubleClickCapture':
      case 'onMouseDown':
      case 'onMouseDownCapture':
      case 'onMouseMove':
      case 'onMouseMoveCapture':
      case 'onMouseUp':
      case 'onMouseUpCapture':
      case 'onMouseEnter':
        ((a = !a.disabled) ||
          ((e = e.type),
          (a = !(e === 'button' || e === 'input' || e === 'select' || e === 'textarea'))),
          (e = !a));
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != 'function') throw Error(s(231, t, typeof n));
    return n;
  }
  var Hn = !(
      typeof window > 'u' ||
      typeof window.document > 'u' ||
      typeof window.document.createElement > 'u'
    ),
    Vr = !1;
  if (Hn)
    try {
      var Su = {};
      (Object.defineProperty(Su, 'passive', {
        get: function () {
          Vr = !0;
        },
      }),
        window.addEventListener('test', Su, Su),
        window.removeEventListener('test', Su, Su));
    } catch {
      Vr = !1;
    }
  var ll = null,
    Gr = null,
    Zi = null;
  function Zd() {
    if (Zi) return Zi;
    var e,
      t = Gr,
      n = t.length,
      a,
      i = 'value' in ll ? ll.value : ll.textContent,
      c = i.length;
    for (e = 0; e < n && t[e] === i[e]; e++);
    var d = n - e;
    for (a = 1; a <= d && t[n - a] === i[c - a]; a++);
    return (Zi = i.slice(e, 1 < a ? 1 - a : void 0));
  }
  function Hi(e) {
    var t = e.keyCode;
    return (
      'charCode' in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
      e === 10 && (e = 13),
      32 <= e || e === 13 ? e : 0
    );
  }
  function ki() {
    return !0;
  }
  function Hd() {
    return !1;
  }
  function zt(e) {
    function t(n, a, i, c, d) {
      ((this._reactName = n),
        (this._targetInst = i),
        (this.type = a),
        (this.nativeEvent = c),
        (this.target = d),
        (this.currentTarget = null));
      for (var p in e) e.hasOwnProperty(p) && ((n = e[p]), (this[p] = n ? n(c) : c[p]));
      return (
        (this.isDefaultPrevented = (
          c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1
        )
          ? ki
          : Hd),
        (this.isPropagationStopped = Hd),
        this
      );
    }
    return (
      W(t.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var n = this.nativeEvent;
          n &&
            (n.preventDefault
              ? n.preventDefault()
              : typeof n.returnValue != 'unknown' && (n.returnValue = !1),
            (this.isDefaultPrevented = ki));
        },
        stopPropagation: function () {
          var n = this.nativeEvent;
          n &&
            (n.stopPropagation
              ? n.stopPropagation()
              : typeof n.cancelBubble != 'unknown' && (n.cancelBubble = !0),
            (this.isPropagationStopped = ki));
        },
        persist: function () {},
        isPersistent: ki,
      }),
      t
    );
  }
  var al = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    Li = zt(al),
    zu = W({}, al, { view: 0, detail: 0 }),
    cg = zt(zu),
    Xr,
    Qr,
    Nu,
    Bi = W({}, zu, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: Kr,
      button: 0,
      buttons: 0,
      relatedTarget: function (e) {
        return e.relatedTarget === void 0
          ? e.fromElement === e.srcElement
            ? e.toElement
            : e.fromElement
          : e.relatedTarget;
      },
      movementX: function (e) {
        return 'movementX' in e
          ? e.movementX
          : (e !== Nu &&
              (Nu && e.type === 'mousemove'
                ? ((Xr = e.screenX - Nu.screenX), (Qr = e.screenY - Nu.screenY))
                : (Qr = Xr = 0),
              (Nu = e)),
            Xr);
      },
      movementY: function (e) {
        return 'movementY' in e ? e.movementY : Qr;
      },
    }),
    kd = zt(Bi),
    rg = W({}, Bi, { dataTransfer: 0 }),
    sg = zt(rg),
    og = W({}, zu, { relatedTarget: 0 }),
    $r = zt(og),
    fg = W({}, al, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    dg = zt(fg),
    hg = W({}, al, {
      clipboardData: function (e) {
        return 'clipboardData' in e ? e.clipboardData : window.clipboardData;
      },
    }),
    mg = zt(hg),
    pg = W({}, al, { data: 0 }),
    Ld = zt(pg),
    vg = {
      Esc: 'Escape',
      Spacebar: ' ',
      Left: 'ArrowLeft',
      Up: 'ArrowUp',
      Right: 'ArrowRight',
      Down: 'ArrowDown',
      Del: 'Delete',
      Win: 'OS',
      Menu: 'ContextMenu',
      Apps: 'ContextMenu',
      Scroll: 'ScrollLock',
      MozPrintableKey: 'Unidentified',
    },
    yg = {
      8: 'Backspace',
      9: 'Tab',
      12: 'Clear',
      13: 'Enter',
      16: 'Shift',
      17: 'Control',
      18: 'Alt',
      19: 'Pause',
      20: 'CapsLock',
      27: 'Escape',
      32: ' ',
      33: 'PageUp',
      34: 'PageDown',
      35: 'End',
      36: 'Home',
      37: 'ArrowLeft',
      38: 'ArrowUp',
      39: 'ArrowRight',
      40: 'ArrowDown',
      45: 'Insert',
      46: 'Delete',
      112: 'F1',
      113: 'F2',
      114: 'F3',
      115: 'F4',
      116: 'F5',
      117: 'F6',
      118: 'F7',
      119: 'F8',
      120: 'F9',
      121: 'F10',
      122: 'F11',
      123: 'F12',
      144: 'NumLock',
      145: 'ScrollLock',
      224: 'Meta',
    },
    gg = { Alt: 'altKey', Control: 'ctrlKey', Meta: 'metaKey', Shift: 'shiftKey' };
  function bg(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = gg[e]) ? !!t[e] : !1;
  }
  function Kr() {
    return bg;
  }
  var _g = W({}, zu, {
      key: function (e) {
        if (e.key) {
          var t = vg[e.key] || e.key;
          if (t !== 'Unidentified') return t;
        }
        return e.type === 'keypress'
          ? ((e = Hi(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
          : e.type === 'keydown' || e.type === 'keyup'
            ? yg[e.keyCode] || 'Unidentified'
            : '';
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: Kr,
      charCode: function (e) {
        return e.type === 'keypress' ? Hi(e) : 0;
      },
      keyCode: function (e) {
        return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
      },
      which: function (e) {
        return e.type === 'keypress'
          ? Hi(e)
          : e.type === 'keydown' || e.type === 'keyup'
            ? e.keyCode
            : 0;
      },
    }),
    Sg = zt(_g),
    zg = W({}, Bi, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    Bd = zt(zg),
    Ng = W({}, al, { submitter: 0 }),
    Eg = zt(Ng),
    Tg = W({}, zu, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: Kr,
    }),
    jg = zt(Tg),
    xg = W({}, al, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Og = zt(xg),
    Ag = W({}, Bi, {
      deltaX: function (e) {
        return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0;
      },
      deltaY: function (e) {
        return 'deltaY' in e
          ? e.deltaY
          : 'wheelDeltaY' in e
            ? -e.wheelDeltaY
            : 'wheelDelta' in e
              ? -e.wheelDelta
              : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    Cg = zt(Ag),
    Dg = W({}, al, { newState: 0, oldState: 0, source: 0 }),
    wg = zt(Dg),
    Rg = [9, 13, 27, 32],
    Ir = Hn && 'CompositionEvent' in window,
    Eu = null;
  Hn && 'documentMode' in document && (Eu = document.documentMode);
  var Mg = Hn && 'TextEvent' in window && !Eu,
    qd = Hn && (!Ir || (Eu && 8 < Eu && 11 >= Eu)),
    Yd = ' ',
    Vd = !1;
  function Gd(e, t) {
    switch (e) {
      case 'keyup':
        return Rg.indexOf(t.keyCode) !== -1;
      case 'keydown':
        return t.keyCode !== 229;
      case 'keypress':
      case 'mousedown':
      case 'focusout':
        return !0;
      default:
        return !1;
    }
  }
  function Xd(e) {
    return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null);
  }
  var za = !1;
  function Ug(e, t) {
    switch (e) {
      case 'compositionend':
        return Xd(t);
      case 'keypress':
        return t.which !== 32 ? null : ((Vd = !0), Yd);
      case 'textInput':
        return ((e = t.data), e === Yd && Vd ? null : e);
      default:
        return null;
    }
  }
  function Zg(e, t) {
    if (za)
      return e === 'compositionend' || (!Ir && Gd(e, t))
        ? ((e = Zd()), (Zi = Gr = ll = null), (za = !1), e)
        : null;
    switch (e) {
      case 'paste':
        return null;
      case 'keypress':
        if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case 'compositionend':
        return qd && t.locale !== 'ko' ? null : t.data;
      default:
        return null;
    }
  }
  var Hg = {
    color: !0,
    date: !0,
    datetime: !0,
    'datetime-local': !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function Qd(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === 'input' ? !!Hg[e.type] : t === 'textarea';
  }
  function $d(e, t, n, a) {
    (_a ? (Sa ? Sa.push(a) : (Sa = [a])) : (_a = a),
      (t = qc(t, 'onChange')),
      0 < t.length &&
        ((n = new Li('onChange', 'change', null, n, a)), e.push({ event: n, listeners: t })));
  }
  var Tu = null,
    ju = null;
  function kg(e) {
    Mp(e, 0);
  }
  function qi(e) {
    var t = bu(e);
    if (Od(t)) return e;
  }
  function Kd(e, t) {
    if (e === 'change') return t;
  }
  var Id = !1;
  if (Hn) {
    var Jr;
    if (Hn) {
      var Fr = 'oninput' in document;
      if (!Fr) {
        var Jd = document.createElement('div');
        (Jd.setAttribute('oninput', 'return;'), (Fr = typeof Jd.oninput == 'function'));
      }
      Jr = Fr;
    } else Jr = !1;
    Id = Jr && (!document.documentMode || 9 < document.documentMode);
  }
  function Fd() {
    Tu && (Tu.detachEvent('onpropertychange', Pd), (ju = Tu = null));
  }
  function Pd(e) {
    if (e.propertyName === 'value' && qi(ju)) {
      var t = [];
      ($d(t, ju, e, qr(e)), Ud(kg, t));
    }
  }
  function Lg(e, t, n) {
    e === 'focusin'
      ? (Fd(), (Tu = t), (ju = n), Tu.attachEvent('onpropertychange', Pd))
      : e === 'focusout' && Fd();
  }
  function Bg(e) {
    if (e === 'selectionchange' || e === 'keyup' || e === 'keydown') return qi(ju);
  }
  function qg(e, t) {
    if (e === 'click') return qi(t);
  }
  function Yg(e, t) {
    if (e === 'input' || e === 'change') return qi(t);
  }
  function Vg(e, t) {
    return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
  }
  var Yt = typeof Object.is == 'function' ? Object.is : Vg;
  function xu(e, t) {
    if (Yt(e, t)) return !0;
    if (typeof e != 'object' || e === null || typeof t != 'object' || t === null) return !1;
    var n = Object.keys(e),
      a = Object.keys(t);
    if (n.length !== a.length) return !1;
    for (a = 0; a < n.length; a++) {
      var i = n[a];
      if (!Cr.call(t, i) || !Yt(e[i], t[i])) return !1;
    }
    return !0;
  }
  function Pr(e) {
    if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u')) return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function Wd(e) {
    for (; e && e.firstChild;) e = e.firstChild;
    return e;
  }
  function eh(e, t) {
    var n = Wd(e);
    e = 0;
    for (var a; n;) {
      if (n.nodeType === 3) {
        if (((a = e + n.textContent.length), e <= t && a >= t)) return { node: n, offset: t - e };
        e = a;
      }
      e: {
        for (; n;) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = Wd(n);
    }
  }
  function th(e, t) {
    return e && t
      ? e === t
        ? !0
        : e && e.nodeType === 3
          ? !1
          : t && t.nodeType === 3
            ? th(e, t.parentNode)
            : 'contains' in e
              ? e.contains(t)
              : e.compareDocumentPosition
                ? !!(e.compareDocumentPosition(t) & 16)
                : !1
      : !1;
  }
  function nh(e) {
    e =
      e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null
        ? e.ownerDocument.defaultView
        : window;
    for (var t = Pr(e.document); t instanceof e.HTMLIFrameElement;) {
      try {
        var n = typeof t.contentWindow.location.href == 'string';
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = Pr(e.document);
    }
    return t;
  }
  function Wr(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return (
      t &&
      ((t === 'input' &&
        (e.type === 'text' ||
          e.type === 'search' ||
          e.type === 'tel' ||
          e.type === 'url' ||
          e.type === 'password')) ||
        t === 'textarea' ||
        e.contentEditable === 'true')
    );
  }
  var Gg = Hn && 'documentMode' in document && 11 >= document.documentMode,
    Na = null,
    es = null,
    Ou = null,
    ts = !1;
  function lh(e, t, n) {
    var a = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    ts ||
      Na == null ||
      Na !== Pr(a) ||
      ((a = Na),
      'selectionStart' in a && Wr(a)
        ? (a = { start: a.selectionStart, end: a.selectionEnd })
        : ((a = ((a.ownerDocument && a.ownerDocument.defaultView) || window).getSelection()),
          (a = {
            anchorNode: a.anchorNode,
            anchorOffset: a.anchorOffset,
            focusNode: a.focusNode,
            focusOffset: a.focusOffset,
          })),
      (Ou && xu(Ou, a)) ||
        ((Ou = a),
        (a = qc(es, 'onSelect')),
        0 < a.length &&
          ((t = new Li('onSelect', 'select', null, t, n)),
          e.push({ event: t, listeners: a }),
          (t.target = Na))));
  }
  function Vl(e, t) {
    var n = {};
    return (
      (n[e.toLowerCase()] = t.toLowerCase()),
      (n['Webkit' + e] = 'webkit' + t),
      (n['Moz' + e] = 'moz' + t),
      n
    );
  }
  var Ea = {
      animationend: Vl('Animation', 'AnimationEnd'),
      animationiteration: Vl('Animation', 'AnimationIteration'),
      animationstart: Vl('Animation', 'AnimationStart'),
      transitionrun: Vl('Transition', 'TransitionRun'),
      transitionstart: Vl('Transition', 'TransitionStart'),
      transitioncancel: Vl('Transition', 'TransitionCancel'),
      transitionend: Vl('Transition', 'TransitionEnd'),
    },
    ns = {},
    ah = {};
  Hn &&
    ((ah = document.createElement('div').style),
    'AnimationEvent' in window ||
      (delete Ea.animationend.animation,
      delete Ea.animationiteration.animation,
      delete Ea.animationstart.animation),
    'TransitionEvent' in window || delete Ea.transitionend.transition);
  function Gl(e) {
    if (ns[e]) return ns[e];
    if (!Ea[e]) return e;
    var t = Ea[e],
      n;
    for (n in t) if (t.hasOwnProperty(n) && n in ah) return (ns[e] = t[n]);
    return e;
  }
  var uh = Gl('animationend'),
    ih = Gl('animationiteration'),
    ch = Gl('animationstart'),
    Xg = Gl('transitionrun'),
    Qg = Gl('transitionstart'),
    $g = Gl('transitioncancel'),
    rh = Gl('transitionend'),
    sh = new Map(),
    ls =
      'abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
        ' ',
      );
  ls.push('scrollEnd');
  function sn(e, t) {
    (sh.set(e, t), Yl(t, [e]));
  }
  var Kg = 0;
  function kn(e, t) {
    if (e.name != null && e.name !== 'auto') return e.name;
    if (t.autoName !== null) return t.autoName;
    e = hn.identifierPrefix;
    var n = Kg++;
    return ((e = '_' + e + 't_' + n.toString(32) + '_'), (t.autoName = e));
  }
  function oh(e) {
    if (e == null || typeof e == 'string') return e;
    var t = null,
      n = Ga;
    if (n !== null)
      for (var a = 0; a < n.length; a++) {
        var i = e[n[a]];
        if (i != null) {
          if (i === 'none') return 'none';
          t = t == null ? i : t + (' ' + i);
        }
      }
    return t ?? e.default;
  }
  function Ln(e, t) {
    return (
      (e = oh(e)),
      (t = oh(t)),
      t == null ? (e === 'auto' ? null : e) : t === 'auto' ? null : t
    );
  }
  var Yi =
      typeof reportError == 'function'
        ? reportError
        : function (e) {
            if (typeof window == 'object' && typeof window.ErrorEvent == 'function') {
              var t = new window.ErrorEvent('error', {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof e == 'object' && e !== null && typeof e.message == 'string'
                    ? String(e.message)
                    : String(e),
                error: e,
              });
              if (!window.dispatchEvent(t)) return;
            } else if (typeof process == 'object' && typeof process.emit == 'function') {
              process.emit('uncaughtException', e);
              return;
            }
            console.error(e);
          },
    Pt = [],
    Ta = 0,
    as = 0;
  function Vi() {
    for (var e = Ta, t = (as = Ta = 0); t < e;) {
      var n = Pt[t];
      Pt[t++] = null;
      var a = Pt[t];
      Pt[t++] = null;
      var i = Pt[t];
      Pt[t++] = null;
      var c = Pt[t];
      if (((Pt[t++] = null), a !== null && i !== null)) {
        var d = a.pending;
        (d === null ? (i.next = i) : ((i.next = d.next), (d.next = i)), (a.pending = i));
      }
      c !== 0 && fh(n, i, c);
    }
  }
  function Gi(e, t, n, a) {
    ((Pt[Ta++] = e),
      (Pt[Ta++] = t),
      (Pt[Ta++] = n),
      (Pt[Ta++] = a),
      (as |= a),
      (e.lanes |= a),
      (e = e.alternate),
      e !== null && (e.lanes |= a));
  }
  function us(e, t, n, a) {
    return (Gi(e, t, n, a), Xi(e));
  }
  function Xl(e, t) {
    return (Gi(e, null, null, t), Xi(e));
  }
  function fh(e, t, n) {
    e.lanes |= n;
    var a = e.alternate;
    a !== null && (a.lanes |= n);
    for (var i = !1, c = e.return; c !== null;)
      ((c.childLanes |= n),
        (a = c.alternate),
        a !== null && (a.childLanes |= n),
        c.tag === 22 && ((e = c.stateNode), e === null || e._visibility & 1 || (i = !0)),
        (e = c),
        (c = c.return));
    return e.tag === 3
      ? ((c = e.stateNode),
        i &&
          t !== null &&
          ((i = 31 - Bt(n)),
          (e = c.hiddenUpdates),
          (a = e[i]),
          a === null ? (e[i] = [t]) : a.push(t),
          (t.lane = n | 536870912)),
        c)
      : null;
  }
  function Xi(e) {
    if (50 < Ju) throw ((Ju = 0), (Mc = null), Error(s(185)));
    for (var t = e.return; t !== null;) ((e = t), (t = e.return));
    return e.tag === 3 ? e.stateNode : null;
  }
  var ja = {};
  function Ig(e, t, n, a) {
    ((this.tag = e),
      (this.key = n),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.refCleanup = this.ref = null),
      (this.pendingProps = t),
      (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
      (this.mode = a),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null));
  }
  function At(e, t, n, a) {
    return new Ig(e, t, n, a);
  }
  function is(e) {
    return ((e = e.prototype), !(!e || !e.isReactComponent));
  }
  function Bn(e, t) {
    var n = e.alternate;
    return (
      n === null
        ? ((n = At(e.tag, t, e.key, e.mode)),
          (n.elementType = e.elementType),
          (n.type = e.type),
          (n.stateNode = e.stateNode),
          (n.alternate = e),
          (e.alternate = n))
        : ((n.pendingProps = t),
          (n.type = e.type),
          (n.flags = 0),
          (n.subtreeFlags = 0),
          (n.deletions = null)),
      (n.flags = e.flags & 1206910976),
      (n.childLanes = e.childLanes),
      (n.lanes = e.lanes),
      (n.child = e.child),
      (n.memoizedProps = e.memoizedProps),
      (n.memoizedState = e.memoizedState),
      (n.updateQueue = e.updateQueue),
      (t = e.dependencies),
      (n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
      (n.sibling = e.sibling),
      (n.index = e.index),
      (n.ref = e.ref),
      (n.refCleanup = e.refCleanup),
      n
    );
  }
  function dh(e, t) {
    e.flags &= 1206910978;
    var n = e.alternate;
    return (
      n === null
        ? ((e.childLanes = 0),
          (e.lanes = t),
          (e.child = null),
          (e.subtreeFlags = 0),
          (e.memoizedProps = null),
          (e.memoizedState = null),
          (e.updateQueue = null),
          (e.dependencies = null),
          (e.stateNode = null))
        : ((e.childLanes = n.childLanes),
          (e.lanes = n.lanes),
          (e.child = n.child),
          (e.subtreeFlags = 0),
          (e.deletions = null),
          (e.memoizedProps = n.memoizedProps),
          (e.memoizedState = n.memoizedState),
          (e.updateQueue = n.updateQueue),
          (e.type = n.type),
          (t = n.dependencies),
          (e.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext })),
      e
    );
  }
  function Qi(e, t, n, a, i, c) {
    var d = 0;
    if (((a = e), typeof a == 'function')) is(a) && (d = 1);
    else if (typeof a == 'string')
      d = Nb(e, n, gn.current) ? 26 : e === 'html' || e === 'head' || e === 'body' ? 27 : 5;
    else
      e: switch (a) {
        case rn:
          return ((e = At(31, n, t, i)), (e.elementType = rn), (e.lanes = c), e);
        case lt:
          return Ql(n.children, i, c, t);
        case at:
          ((d = 8), (i |= 24));
          break;
        case Zt:
          return ((e = At(12, n, t, i | 2)), (e.elementType = Zt), (e.lanes = c), e);
        case ee:
          return ((e = At(13, n, t, i)), (e.elementType = ee), (e.lanes = c), e);
        case L:
          return ((e = At(19, n, t, i)), (e.elementType = L), (e.lanes = c), e);
        case Rn:
        case N:
          return (
            (e = i | 32),
            (e = At(30, n, t, e)),
            (e.elementType = N),
            (e.lanes = c),
            (e.stateNode = { autoName: null, paired: null, clones: null, ref: null }),
            e
          );
        default:
          if (typeof a == 'object' && a !== null)
            switch (a.$$typeof) {
              case Ie:
                d = 10;
                break e;
              case Ht:
                d = 9;
                break e;
              case G:
                d = 11;
                break e;
              case re:
                d = 14;
                break e;
              case _e:
                ((d = 16), (a = null));
                break e;
            }
          ((d = 29), (n = Error(s(130, e === null ? 'null' : typeof e, ''))), (a = null));
      }
    return ((t = At(d, n, t, i)), (t.elementType = e), (t.type = a), (t.lanes = c), t);
  }
  function Ql(e, t, n, a) {
    return ((e = At(7, e, a, t)), (e.lanes = n), e);
  }
  function cs(e, t, n) {
    return ((e = At(6, e, null, t)), (e.lanes = n), e);
  }
  function hh(e) {
    var t = At(18, null, null, 0);
    return ((t.stateNode = e), t);
  }
  function rs(e, t, n) {
    return (
      (t = At(4, e.children !== null ? e.children : [], e.key, t)),
      (t.lanes = n),
      (t.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation,
      }),
      t
    );
  }
  var mh = new WeakMap();
  function Wt(e, t) {
    if (typeof e == 'object' && e !== null) {
      var n = mh.get(e);
      return n !== void 0 ? n : ((t = { value: e, source: t, stack: rd(t) }), mh.set(e, t), t);
    }
    return { value: e, source: t, stack: rd(t) };
  }
  var xa = [],
    Oa = 0,
    $i = null,
    Au = 0,
    en = [],
    tn = 0,
    ul = null,
    _n = 1,
    Sn = '';
  function qn(e, t) {
    ((xa[Oa++] = Au), (xa[Oa++] = $i), ($i = e), (Au = t));
  }
  function ph(e, t, n) {
    ((en[tn++] = _n), (en[tn++] = Sn), (en[tn++] = ul), (ul = e));
    var a = _n;
    e = Sn;
    var i = 32 - Bt(a) - 1;
    ((a &= ~(1 << i)), (n += 1));
    var c = 32 - Bt(t) + i;
    if (30 < c) {
      var d = i - (i % 5);
      ((c = (a & ((1 << d) - 1)).toString(32)),
        (a >>= d),
        (i -= d),
        (_n = (1 << (32 - Bt(t) + i)) | (n << i) | a),
        (Sn = c + e));
    } else ((_n = (1 << c) | (n << i) | a), (Sn = e));
  }
  function Ki(e) {
    e.return !== null && (qn(e, 1), ph(e, 1, 0));
  }
  function ss(e) {
    for (; e === $i;) (($i = xa[--Oa]), (xa[Oa] = null), (Au = xa[--Oa]), (xa[Oa] = null));
    for (; e === ul;)
      ((ul = en[--tn]),
        (en[tn] = null),
        (Sn = en[--tn]),
        (en[tn] = null),
        (_n = en[--tn]),
        (en[tn] = null));
  }
  function vh(e, t) {
    ((en[tn++] = _n), (en[tn++] = Sn), (en[tn++] = ul), (_n = t.id), (Sn = t.overflow), (ul = e));
  }
  var it = null,
    Ue = null,
    oe = !1,
    il = null,
    nn = !1,
    os = Error(s(519));
  function cl(e) {
    var t = Error(
      s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? 'text' : 'HTML', ''),
    );
    throw (Cu(Wt(t, e)), os);
  }
  function yh(e) {
    var t = e.stateNode,
      n = e.type,
      a = e.memoizedProps;
    switch (((t[ot] = e), (t[Ot] = a), n)) {
      case 'dialog':
        (me('cancel', t), me('close', t));
        break;
      case 'iframe':
      case 'object':
      case 'embed':
        me('load', t);
        break;
      case 'video':
      case 'audio':
        for (n = 0; n < Pu.length; n++) me(Pu[n], t);
        break;
      case 'source':
        me('error', t);
        break;
      case 'img':
      case 'image':
      case 'link':
        (me('error', t), me('load', t));
        break;
      case 'details':
        me('toggle', t);
        break;
      case 'input':
        (me('invalid', t),
          Ad(t, a.value, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name, !0));
        break;
      case 'select':
        me('invalid', t);
        break;
      case 'textarea':
        (me('invalid', t), Dd(t, a.value, a.defaultValue, a.children));
    }
    ((n = a.children),
      (typeof n != 'string' && typeof n != 'number' && typeof n != 'bigint') ||
      t.textContent === '' + n ||
      a.suppressHydrationWarning === !0 ||
      kp(t.textContent, n)
        ? (a.popover != null && (me('beforetoggle', t), me('toggle', t)),
          a.onScroll != null && me('scroll', t),
          a.onScrollEnd != null && me('scrollend', t),
          a.onClick != null && (t.onclick = bn),
          (t = !0))
        : (t = !1),
      t || cl(e, !0));
  }
  function Ii(e) {
    for (it = e.return; it;)
      switch (it.tag) {
        case 5:
        case 31:
        case 13:
          nn = !1;
          return;
        case 27:
        case 3:
          nn = !0;
          return;
        default:
          it = it.return;
      }
  }
  function Aa(e) {
    if (e !== it) return !1;
    if (!oe) return (Ii(e), (oe = !0), !1);
    var t = e.tag,
      n;
    if (
      ((n = t !== 3 && t !== 27) &&
        ((n = t === 5) &&
          ((n = e.type), (n = !(n !== 'form' && n !== 'button') || qo(e.type, e.memoizedProps))),
        (n = !n)),
      n && Ue && cl(e),
      Ii(e),
      t === 13)
    ) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(s(317));
      Ue = lv(e);
    } else if (t === 31) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(s(317));
      Ue = lv(e);
    } else
      t === 27
        ? ((t = Ue), Nl(e.type) ? ((e = Jo), (Jo = null), (Ue = e)) : (Ue = t))
        : (Ue = it ? an(e.stateNode.nextSibling) : null);
    return !0;
  }
  function $l() {
    ((Ue = it = null), (oe = !1));
  }
  function fs() {
    var e = il;
    return (e !== null && (wt === null ? (wt = e) : wt.push.apply(wt, e), (il = null)), e);
  }
  function Cu(e) {
    il === null ? (il = [e]) : il.push(e);
  }
  var ds = yn(null),
    Kl = null,
    Yn = null;
  function rl(e, t, n) {
    (Me(ds, t._currentValue), (t._currentValue = n));
  }
  function Vn(e) {
    ((e._currentValue = ds.current), st(ds));
  }
  function Ji(e, t, n) {
    for (; e !== null;) {
      var a = e.alternate;
      if (
        ((e.childLanes & t) !== t
          ? ((e.childLanes |= t), a !== null && (a.childLanes |= t))
          : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t),
        e === n)
      )
        break;
      e = e.return;
    }
  }
  function hs(e, t, n, a) {
    var i = e.child;
    for (i !== null && (i.return = e); i !== null;) {
      var c = i.dependencies;
      if (c !== null) {
        var d = i.child;
        c = c.firstContext;
        e: for (; c !== null;) {
          var p = c;
          c = i;
          for (var y = 0; y < t.length; y++)
            if (p.context === t[y]) {
              ((c.lanes |= n),
                (p = c.alternate),
                p !== null && (p.lanes |= n),
                Ji(c.return, n, e),
                a || (d = null));
              break e;
            }
          c = p.next;
        }
      } else if (i.tag === 18) {
        if (((d = i.return), d === null)) throw Error(s(341));
        ((d.lanes |= n), (c = d.alternate), c !== null && (c.lanes |= n), Ji(d, n, e), (d = null));
      } else
        i.tag === 13 && i.memoizedState !== null && i.memoizedState.dehydrated === null
          ? ((i.lanes |= n),
            (d = i.alternate),
            d !== null && (d.lanes |= n),
            Ji(i.return, n, e),
            (d = i.child),
            (d = d !== null ? d.sibling : null))
          : (d = i.child);
      if (d !== null) d.return = i;
      else
        for (d = i; d !== null;) {
          if (d === e) {
            d = null;
            break;
          }
          if (((i = d.sibling), i !== null)) {
            ((i.return = d.return), (d = i));
            break;
          }
          d = d.return;
        }
      i = d;
    }
  }
  function Il(e, t, n, a) {
    e = null;
    for (var i = t, c = !1; i !== null;) {
      if (!c) {
        if ((i.flags & 524288) !== 0) c = !0;
        else if ((i.flags & 262144) !== 0) break;
      }
      if (i.tag === 10) {
        var d = i.alternate;
        if (d === null) throw Error(s(387));
        if (((d = d.memoizedProps), d !== null)) {
          var p = i.type;
          Yt(i.pendingProps.value, d.value) || (e !== null ? e.push(p) : (e = [p]));
        }
      } else if (i === Ni.current) {
        if (((d = i.alternate), d === null)) throw Error(s(387));
        d.memoizedState.memoizedState !== i.memoizedState.memoizedState &&
          (e !== null ? e.push(eu) : (e = [eu]));
      }
      i = i.return;
    }
    return (e !== null && hs(t, e, n, a), (t.flags |= 262144), e !== null);
  }
  function Fi(e) {
    for (e = e.firstContext; e !== null;) {
      if (!Yt(e.context._currentValue, e.memoizedValue)) return !0;
      e = e.next;
    }
    return !1;
  }
  function Jl(e) {
    ((Kl = e), (Yn = null), (e = e.dependencies), e !== null && (e.firstContext = null));
  }
  function ft(e) {
    return gh(Kl, e);
  }
  function Pi(e, t) {
    return (Kl === null && Jl(e), gh(e, t));
  }
  function gh(e, t) {
    var n = t._currentValue;
    if (((t = { context: t, memoizedValue: n, next: null }), Yn === null)) {
      if (e === null) throw Error(s(308));
      ((Yn = t), (e.dependencies = { lanes: 0, firstContext: t }), (e.flags |= 524288));
    } else Yn = Yn.next = t;
    return n;
  }
  var Jg =
      typeof AbortController < 'u'
        ? AbortController
        : function () {
            var e = [],
              t = (this.signal = {
                aborted: !1,
                addEventListener: function (n, a) {
                  e.push(a);
                },
              });
            this.abort = function () {
              ((t.aborted = !0),
                e.forEach(function (n) {
                  return n();
                }));
            };
          },
    Fg = l.unstable_scheduleCallback,
    Pg = l.unstable_NormalPriority,
    Je = {
      $$typeof: Ie,
      Consumer: null,
      Provider: null,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0,
    };
  function ms() {
    return { controller: new Jg(), data: new Map(), refCount: 0 };
  }
  function Du(e) {
    (e.refCount--,
      e.refCount === 0 &&
        Fg(Pg, function () {
          e.controller.abort();
        }));
  }
  function bh(e, t) {
    if ((e.pendingLanes & 4194048) !== 0) {
      var n = e.transitionTypes;
      for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
        var a = t[e];
        n.indexOf(a) === -1 && n.push(a);
      }
    }
  }
  var wu = null;
  function Wg(e) {
    var t = e.transitionTypes;
    return ((e.transitionTypes = null), t);
  }
  var Ru = null,
    ps = 0,
    Fl = 0,
    Ca = null;
  function e1(e, t) {
    if (Ru === null) {
      var n = (Ru = []);
      ((ps = 0),
        (Fl = wo()),
        (Ca = {
          status: 'pending',
          value: void 0,
          then: function (a) {
            n.push(a);
          },
        }));
    }
    return (ps++, t.then(_h, _h), t);
  }
  function _h() {
    if (--ps === 0 && ((wu = null), Ru !== null)) {
      Ca !== null && (Ca.status = 'fulfilled');
      var e = Ru;
      ((Ru = null), (Fl = 0), (Ca = null));
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function t1(e, t) {
    var n = [],
      a = {
        status: 'pending',
        value: null,
        reason: null,
        then: function (i) {
          n.push(i);
        },
      };
    return (
      e.then(
        function () {
          ((a.status = 'fulfilled'), (a.value = t));
          for (var i = 0; i < n.length; i++) (0, n[i])(t);
        },
        function (i) {
          for (a.status = 'rejected', a.reason = i, i = 0; i < n.length; i++) (0, n[i])(void 0);
        },
      ),
      a
    );
  }
  var Sh = K.S;
  K.S = function (e, t) {
    if (
      ((hp = kt()),
      typeof t == 'object' && t !== null && typeof t.then == 'function' && e1(e, t),
      wu !== null)
    )
      for (var n = Ka; n !== null;) (bh(n, wu), (n = n.next));
    if (((n = e.types), n !== null)) {
      for (var a = Ka; a !== null;) (bh(a, n), (a = a.next));
      if (Fl !== 0) {
        ((a = wu), a === null && (a = wu = []));
        for (var i = 0; i < n.length; i++) {
          var c = n[i];
          a.indexOf(c) === -1 && a.push(c);
        }
      }
    }
    Sh !== null && Sh(e, t);
  };
  var Pl = yn(null);
  function vs() {
    var e = Pl.current;
    return e !== null ? e : Re.pooledCache;
  }
  function Wi(e, t) {
    t === null ? Me(Pl, Pl.current) : Me(Pl, t.pool);
  }
  function zh() {
    var e = vs();
    return e === null ? null : { parent: Je._currentValue, pool: e };
  }
  var Da = Error(s(460)),
    ys = Error(s(474)),
    ec = Error(s(542)),
    tc = { then: function () {} };
  function Nh(e) {
    return ((e = e.status), e === 'fulfilled' || e === 'rejected');
  }
  function Eh(e, t, n) {
    switch (
      ((n = e[n]), n === void 0 ? e.push(t) : n !== t && (t.then(bn, bn), (t = n)), t.status)
    ) {
      case 'fulfilled':
        return t.value;
      case 'rejected':
        throw ((e = t.reason), jh(e), e === void 0 && !('reason' in t) ? Error(s(600)) : e);
      default:
        if (typeof t.status == 'string') t.then(bn, bn);
        else {
          if (((e = Re), e !== null && 100 < e.shellSuspendCounter)) throw Error(s(482));
          ((e = t),
            (e.status = 'pending'),
            e.then(
              function (a) {
                if (t.status === 'pending') {
                  var i = t;
                  ((i.status = 'fulfilled'), (i.value = a));
                }
              },
              function (a) {
                if (t.status === 'pending') {
                  var i = t;
                  ((i.status = 'rejected'), (i.reason = a));
                }
              },
            ));
        }
        switch (t.status) {
          case 'fulfilled':
            return t.value;
          case 'rejected':
            throw ((e = t.reason), jh(e), e);
        }
        throw ((ea = t), Da);
    }
  }
  function Wl(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (n) {
      throw n !== null && typeof n == 'object' && typeof n.then == 'function' ? ((ea = n), Da) : n;
    }
  }
  var ea = null;
  function Th() {
    if (ea === null) throw Error(s(459));
    var e = ea;
    return ((ea = null), e);
  }
  function jh(e) {
    if (e === Da || e === ec) throw Error(s(483));
  }
  var wa = null,
    Mu = 0;
  function nc(e) {
    var t = Mu;
    return ((Mu += 1), wa === null && (wa = []), Eh(wa, e, t));
  }
  function sl(e, t) {
    ((t = t.props.ref), (e.ref = t !== void 0 ? t : null));
  }
  function lc(e, t) {
    throw t.$$typeof === se
      ? Error(s(525))
      : ((e = Object.prototype.toString.call(t)),
        Error(
          s(
            31,
            e === '[object Object]' ? 'object with keys {' + Object.keys(t).join(', ') + '}' : e,
          ),
        ));
  }
  function xh(e) {
    function t(T, z) {
      if (e) {
        var O = T.deletions;
        O === null ? ((T.deletions = [z]), (T.flags |= 16)) : O.push(z);
      }
    }
    function n(T, z) {
      if (!e) return null;
      for (; z !== null;) (t(T, z), (z = z.sibling));
      return null;
    }
    function a(T) {
      for (var z = new Map(); T !== null;)
        (T.key === null ? z.set(T.index, T) : z.set(T.key, T), (T = T.sibling));
      return z;
    }
    function i(T, z) {
      return ((T = Bn(T, z)), (T.index = 0), (T.sibling = null), T);
    }
    function c(T, z, O) {
      return (
        (T.index = O),
        e
          ? ((O = T.alternate),
            O !== null
              ? ((O = O.index), O < z ? ((T.flags |= 2), z) : O)
              : ((T.flags |= 134217730), z))
          : ((T.flags |= 1048576), z)
      );
    }
    function d(T) {
      return (e && T.alternate === null && (T.flags |= 134217730), T);
    }
    function p(T, z, O, R) {
      return z === null || z.tag !== 6
        ? ((z = cs(O, T.mode, R)), (z.return = T), z)
        : ((z = i(z, O)), (z.return = T), z);
    }
    function y(T, z, O, R) {
      var X = O.type;
      return X === lt
        ? ((T = D(T, z, O.props.children, R, O.key)), sl(T, O), T)
        : z !== null &&
            (z.elementType === X ||
              (typeof X == 'object' && X !== null && X.$$typeof === _e && Wl(X) === z.type))
          ? ((z = i(z, O.props)), sl(z, O), (z.return = T), z)
          : ((z = Qi(O.type, O.key, O.props, null, T.mode, R)), sl(z, O), (z.return = T), z);
    }
    function j(T, z, O, R) {
      return z === null ||
        z.tag !== 4 ||
        z.stateNode.containerInfo !== O.containerInfo ||
        z.stateNode.implementation !== O.implementation
        ? ((z = rs(O, T.mode, R)), (z.return = T), z)
        : ((z = i(z, O.children || [])), (z.return = T), z);
    }
    function D(T, z, O, R, X) {
      return z === null || z.tag !== 7
        ? ((z = Ql(O, T.mode, R, X)), (z.return = T), z)
        : ((z = i(z, O)), (z.return = T), z);
    }
    function M(T, z, O) {
      if ((typeof z == 'string' && z !== '') || typeof z == 'number' || typeof z == 'bigint')
        return ((z = cs('' + z, T.mode, O)), (z.return = T), z);
      if (typeof z == 'object' && z !== null) {
        switch (z.$$typeof) {
          case bt:
            return ((O = Qi(z.type, z.key, z.props, null, T.mode, O)), sl(O, z), (O.return = T), O);
          case Ke:
            return ((z = rs(z, T.mode, O)), (z.return = T), z);
          case _e:
            return ((z = Wl(z)), M(T, z, O));
        }
        if (Ne(z) || P(z)) return ((z = Ql(z, T.mode, O, null)), (z.return = T), z);
        if (typeof z.then == 'function') return M(T, nc(z), O);
        if (z.$$typeof === Ie) return M(T, Pi(T, z), O);
        lc(T, z);
      }
      return null;
    }
    function E(T, z, O, R) {
      var X = z !== null ? z.key : null;
      if ((typeof O == 'string' && O !== '') || typeof O == 'number' || typeof O == 'bigint')
        return X !== null ? null : p(T, z, '' + O, R);
      if (typeof O == 'object' && O !== null) {
        switch (O.$$typeof) {
          case bt:
            return O.key === X ? y(T, z, O, R) : null;
          case Ke:
            return O.key === X ? j(T, z, O, R) : null;
          case _e:
            return ((O = Wl(O)), E(T, z, O, R));
        }
        if (Ne(O) || P(O)) return X !== null ? null : D(T, z, O, R, null);
        if (typeof O.then == 'function') return E(T, z, nc(O), R);
        if (O.$$typeof === Ie) return E(T, z, Pi(T, O), R);
        lc(T, O);
      }
      return null;
    }
    function C(T, z, O, R, X) {
      if ((typeof R == 'string' && R !== '') || typeof R == 'number' || typeof R == 'bigint')
        return ((T = T.get(O) || null), p(z, T, '' + R, X));
      if (typeof R == 'object' && R !== null) {
        switch (R.$$typeof) {
          case bt:
            return ((T = T.get(R.key === null ? O : R.key) || null), y(z, T, R, X));
          case Ke:
            return ((T = T.get(R.key === null ? O : R.key) || null), j(z, T, R, X));
          case _e:
            return ((R = Wl(R)), C(T, z, O, R, X));
        }
        if (Ne(R) || P(R)) return ((T = T.get(O) || null), D(z, T, R, X, null));
        if (typeof R.then == 'function') return C(T, z, O, nc(R), X);
        if (R.$$typeof === Ie) return C(T, z, O, Pi(z, R), X);
        lc(z, R);
      }
      return null;
    }
    function Y(T, z, O, R) {
      for (
        var X = null, ye = null, J = z, te = (z = 0), We = null;
        J !== null && te < O.length;
        te++
      ) {
        J.index > te ? ((We = J), (J = null)) : (We = J.sibling);
        var ge = E(T, J, O[te], R);
        if (ge === null) {
          J === null && (J = We);
          break;
        }
        (e && J && ge.alternate === null && t(T, J),
          (z = c(ge, z, te)),
          ye === null ? (X = ge) : (ye.sibling = ge),
          (ye = ge),
          (J = We));
      }
      if (te === O.length) return (n(T, J), oe && qn(T, te), X);
      if (J === null) {
        for (; te < O.length; te++)
          ((J = M(T, O[te], R)),
            J !== null && ((z = c(J, z, te)), ye === null ? (X = J) : (ye.sibling = J), (ye = J)));
        return (oe && qn(T, te), X);
      }
      for (J = a(J); te < O.length; te++)
        ((We = C(J, T, te, O[te], R)),
          We !== null &&
            (e && ((ge = We.alternate), ge !== null && J.delete(ge.key === null ? te : ge.key)),
            (z = c(We, z, te)),
            ye === null ? (X = We) : (ye.sibling = We),
            (ye = We)));
      return (
        e &&
          J.forEach(function (Ol) {
            return t(T, Ol);
          }),
        oe && qn(T, te),
        X
      );
    }
    function Q(T, z, O, R) {
      if (O == null) throw Error(s(151));
      for (
        var X = null, ye = null, J = z, te = (z = 0), We = null, ge = O.next();
        J !== null && !ge.done;
        te++, ge = O.next()
      ) {
        J.index > te ? ((We = J), (J = null)) : (We = J.sibling);
        var Ol = E(T, J, ge.value, R);
        if (Ol === null) {
          J === null && (J = We);
          break;
        }
        (e && J && Ol.alternate === null && t(T, J),
          (z = c(Ol, z, te)),
          ye === null ? (X = Ol) : (ye.sibling = Ol),
          (ye = Ol),
          (J = We));
      }
      if (ge.done) return (n(T, J), oe && qn(T, te), X);
      if (J === null) {
        for (; !ge.done; te++, ge = O.next())
          ((ge = M(T, ge.value, R)),
            ge !== null &&
              ((z = c(ge, z, te)), ye === null ? (X = ge) : (ye.sibling = ge), (ye = ge)));
        return (oe && qn(T, te), X);
      }
      for (J = a(J); !ge.done; te++, ge = O.next())
        ((ge = C(J, T, te, ge.value, R)),
          ge !== null &&
            (e && ((We = ge.alternate), We !== null && J.delete(We.key === null ? te : We.key)),
            (z = c(ge, z, te)),
            ye === null ? (X = ge) : (ye.sibling = ge),
            (ye = ge)));
      return (
        e &&
          J.forEach(function (Ub) {
            return t(T, Ub);
          }),
        oe && qn(T, te),
        X
      );
    }
    function ce(T, z, O, R) {
      if (
        (typeof O == 'object' &&
          O !== null &&
          O.type === lt &&
          O.key === null &&
          O.props.ref === void 0 &&
          (O = O.props.children),
        typeof O == 'object' && O !== null)
      ) {
        switch (O.$$typeof) {
          case bt:
            e: {
              for (var X = O.key; z !== null;) {
                if (z.key === X) {
                  if (((X = O.type), X === lt)) {
                    if (z.tag === 7) {
                      (n(T, z.sibling),
                        (R = i(z, O.props.children)),
                        sl(R, O),
                        (R.return = T),
                        (T = R));
                      break e;
                    }
                  } else if (
                    z.elementType === X ||
                    (typeof X == 'object' && X !== null && X.$$typeof === _e && Wl(X) === z.type)
                  ) {
                    (n(T, z.sibling), (R = i(z, O.props)), sl(R, O), (R.return = T), (T = R));
                    break e;
                  }
                  n(T, z);
                  break;
                } else t(T, z);
                z = z.sibling;
              }
              O.type === lt
                ? ((R = Ql(O.props.children, T.mode, R, O.key)), sl(R, O), (R.return = T), (T = R))
                : ((R = Qi(O.type, O.key, O.props, null, T.mode, R)),
                  sl(R, O),
                  (R.return = T),
                  (T = R));
            }
            return d(T);
          case Ke:
            e: {
              for (X = O.key; z !== null;) {
                if (z.key === X)
                  if (
                    z.tag === 4 &&
                    z.stateNode.containerInfo === O.containerInfo &&
                    z.stateNode.implementation === O.implementation
                  ) {
                    (n(T, z.sibling), (R = i(z, O.children || [])), (R.return = T), (T = R));
                    break e;
                  } else {
                    n(T, z);
                    break;
                  }
                else t(T, z);
                z = z.sibling;
              }
              ((R = rs(O, T.mode, R)), (R.return = T), (T = R));
            }
            return d(T);
          case _e:
            return ((O = Wl(O)), ce(T, z, O, R));
        }
        if (Ne(O)) return Y(T, z, O, R);
        if (P(O)) {
          if (((X = P(O)), typeof X != 'function')) throw Error(s(150));
          return ((O = X.call(O)), Q(T, z, O, R));
        }
        if (typeof O.then == 'function') return ce(T, z, nc(O), R);
        if (O.$$typeof === Ie) return ce(T, z, Pi(T, O), R);
        lc(T, O);
      }
      return (typeof O == 'string' && O !== '') || typeof O == 'number' || typeof O == 'bigint'
        ? ((O = '' + O),
          z !== null && z.tag === 6
            ? (n(T, z.sibling), (R = i(z, O)), (R.return = T), (T = R))
            : (n(T, z), (R = cs(O, T.mode, R)), (R.return = T), (T = R)),
          d(T))
        : n(T, z);
    }
    return function (T, z, O, R) {
      try {
        Mu = 0;
        var X = ce(T, z, O, R);
        return ((wa = null), X);
      } catch (J) {
        if (J === Da || J === ec) throw J;
        var ye = At(29, J, null, T.mode);
        return ((ye.lanes = R), (ye.return = T), ye);
      } finally {
      }
    };
  }
  var ta = xh(!0),
    Oh = xh(!1),
    ol = !1;
  function gs(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null,
    };
  }
  function bs(e, t) {
    ((e = e.updateQueue),
      t.updateQueue === e &&
        (t.updateQueue = {
          baseState: e.baseState,
          firstBaseUpdate: e.firstBaseUpdate,
          lastBaseUpdate: e.lastBaseUpdate,
          shared: e.shared,
          callbacks: null,
        }));
  }
  function fl(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function dl(e, t, n) {
    var a = e.updateQueue;
    if (a === null) return null;
    if (((a = a.shared), (Ee & 2) !== 0)) {
      var i = a.pending;
      return (
        i === null ? (t.next = t) : ((t.next = i.next), (i.next = t)),
        (a.pending = t),
        (t = Xi(e)),
        fh(e, null, n),
        t
      );
    }
    return (Gi(e, a, t, n), Xi(e));
  }
  function Uu(e, t, n) {
    if (((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194048) !== 0))) {
      var a = t.lanes;
      ((a &= e.pendingLanes), (n |= a), (t.lanes = n), pd(e, n));
    }
  }
  function _s(e, t) {
    var n = e.updateQueue,
      a = e.alternate;
    if (a !== null && ((a = a.updateQueue), n === a)) {
      var i = null,
        c = null;
      if (((n = n.firstBaseUpdate), n !== null)) {
        do {
          var d = { lane: n.lane, tag: n.tag, payload: n.payload, callback: null, next: null };
          (c === null ? (i = c = d) : (c = c.next = d), (n = n.next));
        } while (n !== null);
        c === null ? (i = c = t) : (c = c.next = t);
      } else i = c = t;
      ((n = {
        baseState: a.baseState,
        firstBaseUpdate: i,
        lastBaseUpdate: c,
        shared: a.shared,
        callbacks: a.callbacks,
      }),
        (e.updateQueue = n));
      return;
    }
    ((e = n.lastBaseUpdate),
      e === null ? (n.firstBaseUpdate = t) : (e.next = t),
      (n.lastBaseUpdate = t));
  }
  var Ss = !1;
  function Zu() {
    if (Ss) {
      var e = Ca;
      if (e !== null) throw e;
    }
  }
  function Hu(e, t, n, a) {
    Ss = !1;
    var i = e.updateQueue;
    ol = !1;
    var c = i.firstBaseUpdate,
      d = i.lastBaseUpdate,
      p = i.shared.pending;
    if (p !== null) {
      i.shared.pending = null;
      var y = p,
        j = y.next;
      ((y.next = null), d === null ? (c = j) : (d.next = j), (d = y));
      var D = e.alternate;
      D !== null &&
        ((D = D.updateQueue),
        (p = D.lastBaseUpdate),
        p !== d && (p === null ? (D.firstBaseUpdate = j) : (p.next = j), (D.lastBaseUpdate = y)));
    }
    if (c !== null) {
      var M = i.baseState;
      ((d = 0), (D = j = y = null), (p = c));
      do {
        var E = p.lane & -536870913,
          C = E !== p.lane;
        if (C ? (ve & E) === E : (a & E) === E) {
          (E !== 0 && E === Fl && (Ss = !0),
            D !== null &&
              (D = D.next =
                { lane: 0, tag: p.tag, payload: p.payload, callback: null, next: null }));
          e: {
            var Y = e,
              Q = p;
            E = t;
            var ce = n;
            switch (Q.tag) {
              case 1:
                if (((Y = Q.payload), typeof Y == 'function')) {
                  M = Y.call(ce, M, E);
                  break e;
                }
                M = Y;
                break e;
              case 3:
                Y.flags = (Y.flags & -65537) | 128;
              case 0:
                if (
                  ((Y = Q.payload), (E = typeof Y == 'function' ? Y.call(ce, M, E) : Y), E == null)
                )
                  break e;
                M = W({}, M, E);
                break e;
              case 2:
                ol = !0;
            }
          }
          ((E = p.callback),
            E !== null &&
              ((e.flags |= 64),
              C && (e.flags |= 8192),
              (C = i.callbacks),
              C === null ? (i.callbacks = [E]) : C.push(E)));
        } else
          ((C = { lane: E, tag: p.tag, payload: p.payload, callback: p.callback, next: null }),
            D === null ? ((j = D = C), (y = M)) : (D = D.next = C),
            (d |= E));
        if (((p = p.next), p === null)) {
          if (((p = i.shared.pending), p === null)) break;
          ((C = p),
            (p = C.next),
            (C.next = null),
            (i.lastBaseUpdate = C),
            (i.shared.pending = null));
        }
      } while (!0);
      (D === null && (y = M),
        (i.baseState = y),
        (i.firstBaseUpdate = j),
        (i.lastBaseUpdate = D),
        c === null && (i.shared.lanes = 0),
        (bl |= d),
        (e.lanes = d),
        (e.memoizedState = M));
    }
  }
  function Ah(e, t) {
    if (typeof e != 'function') throw Error(s(191, e));
    e.call(t);
  }
  function Ch(e, t) {
    var n = e.callbacks;
    if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Ah(n[e], t);
  }
  var hl = yn(null),
    ac = yn(0);
  function Dh(e, t) {
    ((e = Kn), Me(ac, e), Me(hl, t), (Kn = e | t.baseLanes));
  }
  function zs() {
    (Me(ac, Kn), Me(hl, hl.current));
  }
  function Ns() {
    ((Kn = ac.current), st(hl), st(ac));
  }
  var dt = yn(null),
    _t = null;
  function ml(e) {
    var t = e.alternate;
    (Me(ht, ht.current & 1),
      Me(dt, e),
      _t === null && (t === null || hl.current !== null || t.memoizedState !== null) && (_t = e));
  }
  function Es(e) {
    (Me(ht, ht.current), Me(dt, e), _t === null && (_t = e));
  }
  function wh(e) {
    e.tag === 22 ? (Me(ht, ht.current), Me(dt, e), _t === null && (_t = e)) : pl();
  }
  function pl() {
    (Me(ht, ht.current), Me(dt, dt.current));
  }
  function Vt(e) {
    (st(dt), _t === e && (_t = null), st(ht));
  }
  var ht = yn(0);
  function ku(e, t) {
    (Me(dt, dt.current), Me(ht, t));
  }
  function Ts(e) {
    (st(ht), st(dt), _t === e && (_t = null));
  }
  function uc(e) {
    for (var t = e; t !== null;) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (n !== null && ((n = n.dehydrated), n === null || Ko(n) || Io(n))) return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== 'independent') {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        ((t.child.return = t), (t = t.child));
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null;) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
    return null;
  }
  var Gn = 0,
    ie = null,
    we = null,
    Fe = null,
    ic = !1,
    Ra = !1,
    na = !1,
    cc = 0,
    Lu = 0,
    Ma = null,
    n1 = 0;
  function Ge() {
    throw Error(s(321));
  }
  function js(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++) if (!Yt(e[n], t[n])) return !1;
    return !0;
  }
  function xs(e, t, n, a, i, c) {
    return (
      (Gn = c),
      (ie = t),
      (t.memoizedState = null),
      (t.updateQueue = null),
      (t.lanes = 0),
      (K.H = e === null || e.memoizedState === null ? pm : vm),
      (na = !1),
      (c = n(a, i)),
      (na = !1),
      Ra && (c = Mh(t, n, a, i)),
      Rh(e),
      c
    );
  }
  function Rh(e) {
    K.H = mc;
    var t = we !== null && we.next !== null;
    if (((Gn = 0), (Fe = we = ie = null), (ic = !1), (Lu = 0), (Ma = null), t)) throw Error(s(300));
    e === null || Pe || ((e = e.dependencies), e !== null && Fi(e) && (Pe = !0));
  }
  function Mh(e, t, n, a) {
    ie = e;
    var i = 0;
    do {
      if ((Ra && (Ma = null), (Lu = 0), (Ra = !1), 25 <= i)) throw Error(s(301));
      if (((i += 1), (Fe = we = null), e.updateQueue != null)) {
        var c = e.updateQueue;
        ((c.lastEffect = null),
          (c.events = null),
          (c.stores = null),
          c.memoCache != null && (c.memoCache.index = 0));
      }
      ((K.H = o1), (c = t(n, a)));
    } while (Ra);
    return c;
  }
  function l1() {
    var e = K.H,
      t = e.useState()[0];
    return (
      (t = typeof t.then == 'function' ? Bu(t) : t),
      (e = e.useState()[0]),
      (we !== null ? we.memoizedState : null) !== e && (ie.flags |= 1024),
      t
    );
  }
  function Os() {
    var e = cc !== 0;
    return ((cc = 0), e);
  }
  function As(e, t, n) {
    ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~n));
  }
  function Cs(e) {
    if (ic) {
      for (e = e.memoizedState; e !== null;) {
        var t = e.queue;
        (t !== null && (t.pending = null), (e = e.next));
      }
      ic = !1;
    }
    ((Gn = 0), (Fe = we = ie = null), (Ra = !1), (Lu = cc = 0), (Ma = null));
  }
  function Nt() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return (Fe === null ? (ie.memoizedState = Fe = e) : (Fe = Fe.next = e), Fe);
  }
  function Qe() {
    if (we === null) {
      var e = ie.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = we.next;
    var t = Fe === null ? ie.memoizedState : Fe.next;
    if (t !== null) ((Fe = t), (we = e));
    else {
      if (e === null) throw ie.alternate === null ? Error(s(467)) : Error(s(310));
      ((we = e),
        (e = {
          memoizedState: we.memoizedState,
          baseState: we.baseState,
          baseQueue: we.baseQueue,
          queue: we.queue,
          next: null,
        }),
        Fe === null ? (ie.memoizedState = Fe = e) : (Fe = Fe.next = e));
    }
    return Fe;
  }
  function rc() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function Bu(e) {
    var t = Lu;
    return (
      (Lu += 1),
      Ma === null && (Ma = []),
      (e = Eh(Ma, e, t)),
      (t = ie),
      (Fe === null ? t.memoizedState : Fe.next) === null &&
        ((t = t.alternate), (K.H = t === null || t.memoizedState === null ? pm : vm)),
      e
    );
  }
  function sc(e) {
    if (e !== null && typeof e == 'object') {
      if (typeof e.then == 'function') return Bu(e);
      if (e.$$typeof === H) return;
      if (e.$$typeof === Ie) return ft(e);
    }
    throw Error(s(438, String(e)));
  }
  function Ds(e) {
    var t = null,
      n = ie.updateQueue;
    if ((n !== null && (t = n.memoCache), t == null)) {
      var a = ie.alternate;
      a !== null &&
        ((a = a.updateQueue),
        a !== null &&
          ((a = a.memoCache),
          a != null &&
            (t = {
              data: a.data.map(function (i) {
                return i.slice();
              }),
              index: 0,
            })));
    }
    if (
      (t == null && (t = { data: [], index: 0 }),
      n === null && ((n = rc()), (ie.updateQueue = n)),
      (n.memoCache = t),
      (n = t.data[t.index]),
      n === void 0)
    )
      for (n = t.data[t.index] = Array(e), a = 0; a < e; a++) n[a] = Ll;
    return (t.index++, n);
  }
  function Xn(e, t) {
    return typeof t == 'function' ? t(e) : t;
  }
  function oc(e) {
    var t = Qe();
    return ws(t, we, e);
  }
  function ws(e, t, n) {
    var a = e.queue;
    if (a === null) throw Error(s(311));
    a.lastRenderedReducer = n;
    var i = e.baseQueue,
      c = a.pending;
    if (c !== null) {
      if (i !== null) {
        var d = i.next;
        ((i.next = c.next), (c.next = d));
      }
      ((t.baseQueue = i = c), (a.pending = null));
    }
    if (((c = e.baseState), i === null)) e.memoizedState = c;
    else {
      t = i.next;
      var p = (d = null),
        y = null,
        j = t,
        D = !1;
      do {
        var M = j.lane & -536870913;
        if (M !== j.lane ? (ve & M) === M : (Gn & M) === M) {
          var E = j.revertLane;
          if (E === 0)
            (y !== null &&
              (y = y.next =
                {
                  lane: 0,
                  revertLane: 0,
                  gesture: null,
                  action: j.action,
                  hasEagerState: j.hasEagerState,
                  eagerState: j.eagerState,
                  next: null,
                }),
              M === Fl && (D = !0));
          else if ((Gn & E) === E) {
            ((j = j.next), E === Fl && (D = !0));
            continue;
          } else
            ((M = {
              lane: 0,
              revertLane: j.revertLane,
              gesture: null,
              action: j.action,
              hasEagerState: j.hasEagerState,
              eagerState: j.eagerState,
              next: null,
            }),
              y === null ? ((p = y = M), (d = c)) : (y = y.next = M),
              (ie.lanes |= E),
              (bl |= E));
          ((M = j.action), na && n(c, M), (c = j.hasEagerState ? j.eagerState : n(c, M)));
        } else
          ((E = {
            lane: M,
            revertLane: j.revertLane,
            gesture: j.gesture,
            action: j.action,
            hasEagerState: j.hasEagerState,
            eagerState: j.eagerState,
            next: null,
          }),
            y === null ? ((p = y = E), (d = c)) : (y = y.next = E),
            (ie.lanes |= M),
            (bl |= M));
        j = j.next;
      } while (j !== null && j !== t);
      if (
        (y === null ? (d = c) : (y.next = p),
        !Yt(c, e.memoizedState) && ((Pe = !0), D && ((n = Ca), n !== null)))
      )
        throw n;
      ((e.memoizedState = c), (e.baseState = d), (e.baseQueue = y), (a.lastRenderedState = c));
    }
    return (i === null && (a.lanes = 0), [e.memoizedState, a.dispatch]);
  }
  function Rs(e) {
    var t = Qe(),
      n = t.queue;
    if (n === null) throw Error(s(311));
    n.lastRenderedReducer = e;
    var a = n.dispatch,
      i = n.pending,
      c = t.memoizedState;
    if (i !== null) {
      n.pending = null;
      var d = (i = i.next);
      do ((c = e(c, d.action)), (d = d.next));
      while (d !== i);
      (Yt(c, t.memoizedState) || (Pe = !0),
        (t.memoizedState = c),
        t.baseQueue === null && (t.baseState = c),
        (n.lastRenderedState = c));
    }
    return [c, a];
  }
  function Uh(e, t, n) {
    var a = ie,
      i = Qe(),
      c = oe;
    if (c) {
      if (n === void 0) throw Error(s(407));
      n = n();
    } else n = t();
    var d = !Yt((we || i).memoizedState, n);
    if (
      (d && ((i.memoizedState = n), (Pe = !0)),
      (i = i.queue),
      Zs(kh.bind(null, a, i, e), [e]),
      (e = i.getSnapshot !== t || d || (Fe !== null && (Fe.memoizedState.tag & 1) !== 0)),
      Ua(e ? 9 : 8, { destroy: void 0 }, Hh.bind(null, a, i, n, t), null),
      e)
    ) {
      if (((a.flags |= 2048), Re === null)) throw Error(s(349));
      c || (Gn & 127) !== 0 || Zh(a, t, n);
    }
    return n;
  }
  function Zh(e, t, n) {
    ((e.flags |= 16384),
      (e = { getSnapshot: t, value: n }),
      (t = ie.updateQueue),
      t === null
        ? ((t = rc()), (ie.updateQueue = t), (t.stores = [e]))
        : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
  }
  function Hh(e, t, n, a) {
    ((t.value = n), (t.getSnapshot = a), Lh(t) && Bh(e));
  }
  function kh(e, t, n) {
    return n(function () {
      Lh(t) && Bh(e);
    });
  }
  function Lh(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !Yt(e, n);
    } catch {
      return !0;
    }
  }
  function Bh(e) {
    var t = Xl(e, 2);
    t !== null && Rt(t, e, 2);
  }
  function Ms(e) {
    var t = Nt();
    if (typeof e == 'function') {
      var n = e;
      if (((e = n()), na)) {
        nl(!0);
        try {
          n();
        } finally {
          nl(!1);
        }
      }
    }
    return (
      (t.memoizedState = t.baseState = e),
      (t.queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Xn,
        lastRenderedState: e,
      }),
      t
    );
  }
  function qh(e, t, n, a) {
    return ((e.baseState = n), ws(e, we, typeof a == 'function' ? a : Xn));
  }
  function a1(e, t, n, a, i) {
    if (hc(e)) throw Error(s(485));
    if (((e = t.action), e !== null)) {
      var c = {
        payload: i,
        action: e,
        next: null,
        isTransition: !0,
        status: 'pending',
        value: null,
        reason: null,
        listeners: [],
        then: function (d) {
          c.listeners.push(d);
        },
      };
      (K.T !== null ? n(!0) : (c.isTransition = !1),
        a(c),
        (n = t.pending),
        n === null
          ? ((c.next = t.pending = c), Yh(t, c))
          : ((c.next = n.next), (t.pending = n.next = c)));
    }
  }
  function Yh(e, t) {
    var n = t.action,
      a = t.payload,
      i = e.state;
    if (t.isTransition) {
      var c = K.T,
        d = {};
      ((d.types = c !== null ? c.types : null), (K.T = d));
      try {
        var p = n(i, a),
          y = K.S;
        (y !== null && y(d, p), Vh(e, t, p));
      } catch (j) {
        Us(e, t, j);
      } finally {
        (c !== null && d.types !== null && (c.types = d.types), (K.T = c));
      }
    } else
      try {
        ((c = n(i, a)), Vh(e, t, c));
      } catch (j) {
        Us(e, t, j);
      }
  }
  function Vh(e, t, n) {
    n !== null && typeof n == 'object' && typeof n.then == 'function'
      ? n.then(
          function (a) {
            Gh(e, t, a);
          },
          function (a) {
            return Us(e, t, a);
          },
        )
      : Gh(e, t, n);
  }
  function Gh(e, t, n) {
    ((t.status = 'fulfilled'),
      (t.value = n),
      Xh(t),
      (e.state = n),
      (t = e.pending),
      t !== null &&
        ((n = t.next), n === t ? (e.pending = null) : ((n = n.next), (t.next = n), Yh(e, n))));
  }
  function Us(e, t, n) {
    var a = e.pending;
    if (((e.pending = null), a !== null)) {
      a = a.next;
      do ((t.status = 'rejected'), (t.reason = n), Xh(t), (t = t.next));
      while (t !== a);
    }
    e.action = null;
  }
  function Xh(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function Qh(e, t) {
    return t;
  }
  function $h(e, t) {
    if (oe) {
      var n = Re.formState;
      if (n !== null) {
        e: {
          var a = ie;
          if (oe) {
            if (Ue) {
              t: {
                for (var i = Ue, c = nn; i.nodeType !== 8;) {
                  if (!c) {
                    i = null;
                    break t;
                  }
                  if (((i = an(i.nextSibling)), i === null)) {
                    i = null;
                    break t;
                  }
                }
                ((c = i.data), (i = c === 'F!' || c === 'F' ? i : null));
              }
              if (i) {
                ((Ue = an(i.nextSibling)), (a = i.data === 'F!'));
                break e;
              }
            }
            cl(a);
          }
          a = !1;
        }
        a && (t = n[0]);
      }
    }
    return (
      (n = Nt()),
      (n.memoizedState = n.baseState = t),
      (a = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Qh,
        lastRenderedState: t,
      }),
      (n.queue = a),
      (n = dm.bind(null, ie, a)),
      (a.dispatch = n),
      (a = Ms(!1)),
      (c = qs.bind(null, ie, !1, a.queue)),
      (a = Nt()),
      (i = { state: t, dispatch: null, action: e, pending: null }),
      (a.queue = i),
      (n = a1.bind(null, ie, i, c, n)),
      (i.dispatch = n),
      (a.memoizedState = e),
      [t, n, !1]
    );
  }
  function Kh(e) {
    var t = Qe();
    return Ih(t, we, e);
  }
  function Ih(e, t, n) {
    if (
      ((t = ws(e, t, Qh)[0]),
      (e = oc(Xn)[0]),
      typeof t == 'object' && t !== null && typeof t.then == 'function')
    )
      try {
        var a = Bu(t);
      } catch (d) {
        throw d === Da ? ec : d;
      }
    else a = t;
    t = Qe();
    var i = t.queue,
      c = i.dispatch;
    return (
      n !== t.memoizedState &&
        ((ie.flags |= 2048), Ua(9, { destroy: void 0 }, u1.bind(null, i, n), null)),
      [a, c, e]
    );
  }
  function u1(e, t) {
    e.action = t;
  }
  function Jh(e) {
    var t = Qe(),
      n = we;
    if (n !== null) return Ih(t, n, e);
    (Qe(), (t = t.memoizedState), (n = Qe()));
    var a = n.queue.dispatch;
    return ((n.memoizedState = e), [t, a, !1]);
  }
  function Ua(e, t, n, a) {
    return (
      (e = { tag: e, create: n, deps: a, inst: t, next: null }),
      (t = ie.updateQueue),
      t === null && ((t = rc()), (ie.updateQueue = t)),
      (n = t.lastEffect),
      n === null
        ? (t.lastEffect = e.next = e)
        : ((a = n.next), (n.next = e), (e.next = a), (t.lastEffect = e)),
      e
    );
  }
  function Fh() {
    return Qe().memoizedState;
  }
  function fc(e, t, n, a) {
    var i = Nt();
    ((ie.flags |= e),
      (i.memoizedState = Ua(1 | t, { destroy: void 0 }, n, a === void 0 ? null : a)));
  }
  function dc(e, t, n, a) {
    var i = Qe();
    a = a === void 0 ? null : a;
    var c = i.memoizedState.inst;
    we !== null && a !== null && js(a, we.memoizedState.deps)
      ? (i.memoizedState = Ua(t, c, n, a))
      : ((ie.flags |= e), (i.memoizedState = Ua(1 | t, c, n, a)));
  }
  function Ph(e, t) {
    fc(8390656, 8, e, t);
  }
  function Zs(e, t) {
    dc(2048, 8, e, t);
  }
  function i1(e) {
    ie.flags |= 4;
    var t = ie.updateQueue;
    if (t === null) ((t = rc()), (ie.updateQueue = t), (t.events = [e]));
    else {
      var n = t.events;
      n === null ? (t.events = [e]) : n.push(e);
    }
  }
  function Wh(e) {
    var t = Qe().memoizedState;
    return (
      i1({ ref: t, nextImpl: e }),
      function () {
        if ((Ee & 2) !== 0) throw Error(s(440));
        return t.impl.apply(void 0, arguments);
      }
    );
  }
  function em(e, t) {
    return dc(4, 2, e, t);
  }
  function tm(e, t) {
    return dc(4, 4, e, t);
  }
  function nm(e, t) {
    if (typeof t == 'function') {
      e = e();
      var n = t(e);
      return function () {
        typeof n == 'function' ? n() : t(null);
      };
    }
    if (t != null)
      return (
        (e = e()),
        (t.current = e),
        function () {
          t.current = null;
        }
      );
  }
  function lm(e, t, n) {
    ((n = n != null ? n.concat([e]) : null), dc(4, 4, nm.bind(null, t, e), n));
  }
  function Hs() {}
  function am(e, t) {
    var n = Qe();
    t = t === void 0 ? null : t;
    var a = n.memoizedState;
    return t !== null && js(t, a[1]) ? a[0] : ((n.memoizedState = [e, t]), e);
  }
  function um(e, t) {
    var n = Qe();
    t = t === void 0 ? null : t;
    var a = n.memoizedState;
    if (t !== null && js(t, a[1])) return a[0];
    if (((a = e()), na)) {
      nl(!0);
      try {
        e();
      } finally {
        nl(!1);
      }
    }
    return ((n.memoizedState = [a, t]), a);
  }
  function ks(e, t, n) {
    return n === void 0 || ((Gn & 1073741824) !== 0 && (ve & 261930) === 0)
      ? (e.memoizedState = t)
      : ((e.memoizedState = n), (e = pp()), (ie.lanes |= e), (bl |= e), n);
  }
  function im(e, t, n, a) {
    return Yt(n, t)
      ? n
      : hl.current !== null
        ? ((e = ks(e, n, a)), Yt(e, t) || (Pe = !0), e)
        : (Gn & 106) === 0 || ((Gn & 1073741824) !== 0 && (ve & 261930) === 0)
          ? ((Pe = !0), (e.memoizedState = n))
          : ((e = pp()), (ie.lanes |= e), (bl |= e), t);
  }
  function cm(e, t, n, a, i) {
    var c = ne.p;
    ne.p = c !== 0 && 8 > c ? c : 8;
    var d = K.T,
      p = {};
    ((p.types = d !== null ? d.types : null), (K.T = p), qs(e, !1, t, n));
    try {
      var y = i(),
        j = K.S;
      if (
        (j !== null && j(p, y), y !== null && typeof y == 'object' && typeof y.then == 'function')
      ) {
        var D = t1(y, a);
        qu(e, t, D, $t(e));
      } else qu(e, t, a, $t(e));
    } catch (M) {
      qu(e, t, { then: function () {}, status: 'rejected', reason: M }, $t());
    } finally {
      ((ne.p = c), d !== null && p.types !== null && (d.types = p.types), (K.T = d));
    }
  }
  function c1() {}
  function Ls(e, t, n, a) {
    if (e.tag !== 5) throw Error(s(476));
    var i = rm(e).queue;
    cm(
      e,
      i,
      t,
      Mn,
      n === null
        ? c1
        : function () {
            return (sm(e), n(a));
          },
    );
  }
  function rm(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: Mn,
      baseState: Mn,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Xn,
        lastRenderedState: Mn,
      },
      next: null,
    };
    var n = {};
    return (
      (t.next = {
        memoizedState: n,
        baseState: n,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Xn,
          lastRenderedState: n,
        },
        next: null,
      }),
      (e.memoizedState = t),
      (e = e.alternate),
      e !== null && (e.memoizedState = t),
      t
    );
  }
  function sm(e) {
    var t = rm(e);
    (t.next === null && (t = e.alternate.memoizedState), qu(e, t.next.queue, {}, $t()));
  }
  function Bs() {
    return ft(eu);
  }
  function om() {
    return Qe().memoizedState;
  }
  function fm() {
    return Qe().memoizedState;
  }
  function r1(e) {
    for (var t = e.return; t !== null;) {
      switch (t.tag) {
        case 24:
        case 3:
          var n = $t();
          e = fl(n);
          var a = dl(t, e, n);
          (a !== null && (Rt(a, t, n), Uu(a, t, n)), (t = { cache: ms() }), (e.payload = t));
          return;
      }
      t = t.return;
    }
  }
  function s1(e, t, n) {
    var a = $t();
    ((n = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
      hc(e) ? hm(t, n) : ((n = us(e, t, n, a)), n !== null && (Rt(n, e, a), mm(n, t, a))));
  }
  function dm(e, t, n) {
    var a = $t();
    qu(e, t, n, a);
  }
  function qu(e, t, n, a) {
    var i = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    };
    if (hc(e)) hm(t, i);
    else {
      var c = e.alternate;
      if (
        e.lanes === 0 &&
        (c === null || c.lanes === 0) &&
        ((c = t.lastRenderedReducer), c !== null)
      )
        try {
          var d = t.lastRenderedState,
            p = c(d, n);
          if (((i.hasEagerState = !0), (i.eagerState = p), Yt(p, d)))
            return (Gi(e, t, i, 0), Re === null && Vi(), !1);
        } catch {
        } finally {
        }
      if (((n = us(e, t, i, a)), n !== null)) return (Rt(n, e, a), mm(n, t, a), !0);
    }
    return !1;
  }
  function qs(e, t, n, a) {
    if (
      ((a = {
        lane: 2,
        revertLane: wo(),
        gesture: null,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      hc(e))
    ) {
      if (t) throw Error(s(479));
    } else ((t = us(e, n, a, 2)), t !== null && Rt(t, e, 2));
  }
  function hc(e) {
    var t = e.alternate;
    return e === ie || (t !== null && t === ie);
  }
  function hm(e, t) {
    Ra = ic = !0;
    var n = e.pending;
    (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t));
  }
  function mm(e, t, n) {
    if ((n & 4194048) !== 0) {
      var a = t.lanes;
      ((a &= e.pendingLanes), (n |= a), (t.lanes = n), pd(e, n));
    }
  }
  var mc = {
      readContext: ft,
      use: sc,
      useCallback: Ge,
      useContext: Ge,
      useEffect: Ge,
      useImperativeHandle: Ge,
      useLayoutEffect: Ge,
      useInsertionEffect: Ge,
      useMemo: Ge,
      useReducer: Ge,
      useRef: Ge,
      useState: Ge,
      useDebugValue: Ge,
      useDeferredValue: Ge,
      useTransition: Ge,
      useSyncExternalStore: Ge,
      useId: Ge,
      useHostTransitionStatus: Ge,
      useFormState: Ge,
      useActionState: Ge,
      useOptimistic: Ge,
      useMemoCache: Ge,
      useCacheRefresh: Ge,
      useEffectEvent: Ge,
    },
    pm = {
      readContext: ft,
      use: sc,
      useCallback: function (e, t) {
        return ((Nt().memoizedState = [e, t === void 0 ? null : t]), e);
      },
      useContext: ft,
      useEffect: Ph,
      useImperativeHandle: function (e, t, n) {
        ((n = n != null ? n.concat([e]) : null), fc(4194308, 4, nm.bind(null, t, e), n));
      },
      useLayoutEffect: function (e, t) {
        return fc(4194308, 4, e, t);
      },
      useInsertionEffect: function (e, t) {
        fc(4, 2, e, t);
      },
      useMemo: function (e, t) {
        var n = Nt();
        t = t === void 0 ? null : t;
        var a = e();
        if (na) {
          nl(!0);
          try {
            e();
          } finally {
            nl(!1);
          }
        }
        return ((n.memoizedState = [a, t]), a);
      },
      useReducer: function (e, t, n) {
        var a = Nt();
        if (n !== void 0) {
          var i = n(t);
          if (na) {
            nl(!0);
            try {
              n(t);
            } finally {
              nl(!1);
            }
          }
        } else i = t;
        return (
          (a.memoizedState = a.baseState = i),
          (e = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: e,
            lastRenderedState: i,
          }),
          (a.queue = e),
          (e = e.dispatch = s1.bind(null, ie, e)),
          [a.memoizedState, e]
        );
      },
      useRef: function (e) {
        var t = Nt();
        return ((e = { current: e }), (t.memoizedState = e));
      },
      useState: function (e) {
        e = Ms(e);
        var t = e.queue,
          n = dm.bind(null, ie, t);
        return ((t.dispatch = n), [e.memoizedState, n]);
      },
      useDebugValue: Hs,
      useDeferredValue: function (e, t) {
        var n = Nt();
        return ks(n, e, t);
      },
      useTransition: function () {
        var e = Ms(!1);
        return ((e = cm.bind(null, ie, e.queue, !0, !1)), (Nt().memoizedState = e), [!1, e]);
      },
      useSyncExternalStore: function (e, t, n) {
        var a = ie,
          i = Nt();
        if (oe) {
          if (n === void 0) throw Error(s(407));
          n = n();
        } else {
          if (((n = t()), Re === null)) throw Error(s(349));
          (ve & 127) !== 0 || Zh(a, t, n);
        }
        i.memoizedState = n;
        var c = { value: n, getSnapshot: t };
        return (
          (i.queue = c),
          Ph(kh.bind(null, a, c, e), [e]),
          (a.flags |= 2048),
          Ua(9, { destroy: void 0 }, Hh.bind(null, a, c, n, t), null),
          n
        );
      },
      useId: function () {
        var e = Nt(),
          t = Re.identifierPrefix;
        if (oe) {
          var n = Sn,
            a = _n;
          ((n = (a & ~(1 << (32 - Bt(a) - 1))).toString(32) + n),
            (t = '_' + t + 'R_' + n),
            (n = cc++),
            0 < n && (t += 'H' + n.toString(32)),
            (t += '_'));
        } else ((n = n1++), (t = '_' + t + 'r_' + n.toString(32) + '_'));
        return (e.memoizedState = t);
      },
      useHostTransitionStatus: Bs,
      useFormState: $h,
      useActionState: $h,
      useOptimistic: function (e) {
        var t = Nt();
        t.memoizedState = t.baseState = e;
        var n = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: null,
          lastRenderedState: null,
        };
        return ((t.queue = n), (t = qs.bind(null, ie, !0, n)), (n.dispatch = t), [e, t]);
      },
      useMemoCache: Ds,
      useCacheRefresh: function () {
        return (Nt().memoizedState = r1.bind(null, ie));
      },
      useEffectEvent: function (e) {
        var t = Nt(),
          n = { impl: e };
        return (
          (t.memoizedState = n),
          function () {
            if ((Ee & 2) !== 0) throw Error(s(440));
            return n.impl.apply(void 0, arguments);
          }
        );
      },
    },
    vm = {
      readContext: ft,
      use: sc,
      useCallback: am,
      useContext: ft,
      useEffect: Zs,
      useImperativeHandle: lm,
      useInsertionEffect: em,
      useLayoutEffect: tm,
      useMemo: um,
      useReducer: oc,
      useRef: Fh,
      useState: function () {
        return oc(Xn);
      },
      useDebugValue: Hs,
      useDeferredValue: function (e, t) {
        var n = Qe();
        return im(n, we.memoizedState, e, t);
      },
      useTransition: function () {
        var e = oc(Xn)[0],
          t = Qe().memoizedState;
        return [typeof e == 'boolean' ? e : Bu(e), t];
      },
      useSyncExternalStore: Uh,
      useId: om,
      useHostTransitionStatus: Bs,
      useFormState: Kh,
      useActionState: Kh,
      useOptimistic: function (e, t) {
        var n = Qe();
        return qh(n, we, e, t);
      },
      useMemoCache: Ds,
      useCacheRefresh: fm,
      useEffectEvent: Wh,
    },
    o1 = {
      readContext: ft,
      use: sc,
      useCallback: am,
      useContext: ft,
      useEffect: Zs,
      useImperativeHandle: lm,
      useInsertionEffect: em,
      useLayoutEffect: tm,
      useMemo: um,
      useReducer: Rs,
      useRef: Fh,
      useState: function () {
        return Rs(Xn);
      },
      useDebugValue: Hs,
      useDeferredValue: function (e, t) {
        var n = Qe();
        return we === null ? ks(n, e, t) : im(n, we.memoizedState, e, t);
      },
      useTransition: function () {
        var e = Rs(Xn)[0],
          t = Qe().memoizedState;
        return [typeof e == 'boolean' ? e : Bu(e), t];
      },
      useSyncExternalStore: Uh,
      useId: om,
      useHostTransitionStatus: Bs,
      useFormState: Jh,
      useActionState: Jh,
      useOptimistic: function (e, t) {
        var n = Qe();
        return we !== null ? qh(n, we, e, t) : ((n.baseState = e), [e, n.queue.dispatch]);
      },
      useMemoCache: Ds,
      useCacheRefresh: fm,
      useEffectEvent: Wh,
    };
  function Ys(e, t, n, a) {
    ((t = e.memoizedState),
      (n = n(a, t)),
      (n = n == null ? t : W({}, t, n)),
      (e.memoizedState = n),
      e.lanes === 0 && (e.updateQueue.baseState = n));
  }
  var Vs = {
    enqueueSetState: function (e, t, n) {
      e = e._reactInternals;
      var a = $t(),
        i = fl(a);
      ((i.payload = t),
        n != null && (i.callback = n),
        (t = dl(e, i, a)),
        t !== null && (Rt(t, e, a), Uu(t, e, a)));
    },
    enqueueReplaceState: function (e, t, n) {
      e = e._reactInternals;
      var a = $t(),
        i = fl(a);
      ((i.tag = 1),
        (i.payload = t),
        n != null && (i.callback = n),
        (t = dl(e, i, a)),
        t !== null && (Rt(t, e, a), Uu(t, e, a)));
    },
    enqueueForceUpdate: function (e, t) {
      e = e._reactInternals;
      var n = $t(),
        a = fl(n);
      ((a.tag = 2),
        t != null && (a.callback = t),
        (t = dl(e, a, n)),
        t !== null && (Rt(t, e, n), Uu(t, e, n)));
    },
  };
  function ym(e, t, n, a, i, c, d) {
    return (
      (e = e.stateNode),
      typeof e.shouldComponentUpdate == 'function'
        ? e.shouldComponentUpdate(a, c, d)
        : t.prototype && t.prototype.isPureReactComponent
          ? !xu(n, a) || !xu(i, c)
          : !0
    );
  }
  function gm(e, t, n, a) {
    ((e = t.state),
      typeof t.componentWillReceiveProps == 'function' && t.componentWillReceiveProps(n, a),
      typeof t.UNSAFE_componentWillReceiveProps == 'function' &&
        t.UNSAFE_componentWillReceiveProps(n, a),
      t.state !== e && Vs.enqueueReplaceState(t, t.state, null));
  }
  function la(e, t) {
    var n = t;
    if ('ref' in t) {
      n = {};
      for (var a in t) a !== 'ref' && (n[a] = t[a]);
    }
    if ((e = e.defaultProps)) {
      n === t && (n = W({}, n));
      for (var i in e) n[i] === void 0 && (n[i] = e[i]);
    }
    return n;
  }
  function bm(e) {
    Yi(e);
  }
  function _m(e) {
    console.error(e);
  }
  function Sm(e) {
    Yi(e);
  }
  function pc(e, t) {
    try {
      var n = e.onUncaughtError;
      n(t.value, { componentStack: t.stack });
    } catch (a) {
      setTimeout(function () {
        throw a;
      });
    }
  }
  function zm(e, t, n) {
    try {
      var a = e.onCaughtError;
      a(n.value, { componentStack: n.stack, errorBoundary: t.tag === 1 ? t.stateNode : null });
    } catch (i) {
      setTimeout(function () {
        throw i;
      });
    }
  }
  function Gs(e, t, n) {
    return (
      (n = fl(n)),
      (n.tag = 3),
      (n.payload = { element: null }),
      (n.callback = function () {
        pc(e, t);
      }),
      n
    );
  }
  function Nm(e) {
    return ((e = fl(e)), (e.tag = 3), e);
  }
  function Em(e, t, n, a) {
    var i = n.type.getDerivedStateFromError;
    if (typeof i == 'function') {
      var c = a.value;
      ((e.payload = function () {
        return i(c);
      }),
        (e.callback = function () {
          zm(t, n, a);
        }));
    }
    var d = n.stateNode;
    d !== null &&
      typeof d.componentDidCatch == 'function' &&
      (e.callback = function () {
        (zm(t, n, a),
          typeof i != 'function' && (_l === null ? (_l = new Set([this])) : _l.add(this)));
        var p = a.stack;
        this.componentDidCatch(a.value, { componentStack: p !== null ? p : '' });
      });
  }
  function f1(e, t, n, a, i) {
    if (((n.flags |= 32768), a !== null && typeof a == 'object' && typeof a.then == 'function')) {
      if (((t = n.alternate), t !== null && Il(t, n, i, !0), (n = dt.current), n !== null)) {
        switch (n.tag) {
          case 31:
          case 13:
          case 19:
            return (
              _t === null ? Zc() : n.alternate === null && Xe === 0 && (Xe = 3),
              (n.flags &= -257),
              (n.flags |= 65536),
              (n.lanes = i),
              a === tc
                ? (n.flags |= 16384)
                : ((t = n.updateQueue),
                  t === null ? (n.updateQueue = new Set([a])) : t.add(a),
                  Ao(e, a, i)),
              !1
            );
          case 22:
            return (
              (n.flags |= 65536),
              a === tc
                ? (n.flags |= 16384)
                : ((t = n.updateQueue),
                  t === null
                    ? ((t = { transitions: null, markerInstances: null, retryQueue: new Set([a]) }),
                      (n.updateQueue = t))
                    : ((n = t.retryQueue), n === null ? (t.retryQueue = new Set([a])) : n.add(a)),
                  Ao(e, a, i)),
              !1
            );
        }
        throw Error(s(435, n.tag));
      }
      return (Ao(e, a, i), Zc(), !1);
    }
    if (oe)
      return (
        (t = dt.current),
        t !== null
          ? ((t.flags & 65536) === 0 && (t.flags |= 256),
            (t.flags |= 65536),
            (t.lanes = i),
            a !== os && ((e = Error(s(422), { cause: a })), Cu(Wt(e, n))))
          : (a !== os && ((t = Error(s(423), { cause: a })), Cu(Wt(t, n))),
            (e = e.current.alternate),
            (e.flags |= 65536),
            (i &= -i),
            (e.lanes |= i),
            (a = Wt(a, n)),
            (i = Gs(e.stateNode, a, i)),
            _s(e, i),
            Xe !== 4 && (Xe = 2)),
        !1
      );
    var c = Error(s(520), { cause: a });
    if (((c = Wt(c, n)), Iu === null ? (Iu = [c]) : Iu.push(c), Xe !== 4 && (Xe = 2), t === null))
      return !0;
    ((a = Wt(a, n)), (n = t));
    do {
      switch (n.tag) {
        case 3:
          return (
            (n.flags |= 65536),
            (e = i & -i),
            (n.lanes |= e),
            (e = Gs(n.stateNode, a, e)),
            _s(n, e),
            !1
          );
        case 1:
          if (
            ((t = n.type),
            (c = n.stateNode),
            (n.flags & 128) === 0 &&
              (typeof t.getDerivedStateFromError == 'function' ||
                (c !== null &&
                  typeof c.componentDidCatch == 'function' &&
                  (_l === null || !_l.has(c)))))
          )
            return (
              (n.flags |= 65536),
              (i &= -i),
              (n.lanes |= i),
              (i = Nm(i)),
              Em(i, e, n, a),
              _s(n, i),
              !1
            );
          break;
        case 22:
          if (n.memoizedState !== null) return ((n.flags |= 65536), !1);
      }
      n = n.return;
    } while (n !== null);
    return !1;
  }
  var Xs = Error(s(461)),
    Pe = !1;
  function nt(e, t, n, a) {
    t.child = e === null ? Oh(t, null, n, a) : ta(t, e.child, n, a);
  }
  function Tm(e, t, n, a, i) {
    n = n.render;
    var c = t.ref;
    if ('ref' in a) {
      var d = {};
      for (var p in a) p !== 'ref' && (d[p] = a[p]);
    } else d = a;
    return (
      Jl(t),
      (a = xs(e, t, n, d, c, i)),
      (p = Os()),
      e !== null && !Pe
        ? (As(e, t, i), Qn(e, t, i))
        : (oe && p && Ki(t), (t.flags |= 1), nt(e, t, a, i), t.child)
    );
  }
  function jm(e, t, n, a, i) {
    if (e === null) {
      var c = n.type;
      return typeof c == 'function' && !is(c) && c.defaultProps === void 0 && n.compare === null
        ? ((t.tag = 15), (t.type = c), xm(e, t, c, a, i))
        : ((e = Qi(n.type, null, a, t, t.mode, i)), (e.ref = t.ref), (e.return = t), (t.child = e));
    }
    if (((c = e.child), !Ws(e, i))) {
      var d = c.memoizedProps;
      if (((n = n.compare), (n = n !== null ? n : xu), n(d, a) && e.ref === t.ref))
        return Qn(e, t, i);
    }
    return ((t.flags |= 1), (e = Bn(c, a)), (e.ref = t.ref), (e.return = t), (t.child = e));
  }
  function xm(e, t, n, a, i) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (xu(c, a) && e.ref === t.ref)
        if (((Pe = !1), (t.pendingProps = a = c), Ws(e, i))) (e.flags & 131072) !== 0 && (Pe = !0);
        else return ((t.lanes = e.lanes), Qn(e, t, i));
    }
    return Qs(e, t, n, a, i);
  }
  function Om(e, t, n, a) {
    var i = a.children,
      c = e !== null ? e.memoizedState : null;
    if (
      (e === null &&
        t.stateNode === null &&
        (t.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      a.mode === 'hidden')
    ) {
      if ((t.flags & 128) !== 0) {
        if (((c = c !== null ? c.baseLanes | n : n), e !== null)) {
          for (a = t.child = e.child, i = 0; a !== null;)
            ((i = i | a.lanes | a.childLanes), (a = a.sibling));
          a = i & ~c;
        } else ((a = 0), (t.child = null));
        return Am(e, t, c, n, a);
      }
      if ((n & 536870912) !== 0)
        ((t.memoizedState = { baseLanes: 0, cachePool: null }),
          e !== null && Wi(t, c !== null ? c.cachePool : null),
          c !== null ? Dh(t, c) : zs(),
          wh(t));
      else return ((a = t.lanes = 536870912), Am(e, t, c !== null ? c.baseLanes | n : n, n, a));
    } else
      c !== null
        ? (Wi(t, c.cachePool), Dh(t, c), pl(), (t.memoizedState = null))
        : (e !== null && Wi(t, null), zs(), pl());
    return (nt(e, t, i, n), t.child);
  }
  function Yu(e, t) {
    return (
      (e !== null && e.tag === 22) ||
        t.stateNode !== null ||
        (t.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      t.sibling
    );
  }
  function Am(e, t, n, a, i) {
    var c = vs();
    return (
      (c = c === null ? null : { parent: Je._currentValue, pool: c }),
      (t.memoizedState = { baseLanes: n, cachePool: c }),
      e !== null && Wi(t, null),
      zs(),
      wh(t),
      e !== null && Il(e, t, a, !0),
      (t.childLanes = i),
      null
    );
  }
  function vc(e, t) {
    return (
      (t = yc({ mode: t.mode, children: t.children }, e.mode)),
      (t.ref = e.ref),
      (e.child = t),
      (t.return = e),
      t
    );
  }
  function Cm(e, t, n) {
    return (
      ta(t, e.child, null, n),
      (e = vc(t, t.pendingProps)),
      (e.flags |= 2),
      Vt(t),
      (t.memoizedState = null),
      e
    );
  }
  function d1(e, t, n) {
    var a = t.pendingProps,
      i = (t.flags & 128) !== 0;
    if (((t.flags &= -129), e === null)) {
      if (oe) {
        if (a.mode === 'hidden')
          return (
            (e = vc(t, a)),
            (t.lanes = 536870912),
            (e.memoizedState = { baseLanes: 0, cachePool: null }),
            Yu(null, e)
          );
        if (
          (Es(t),
          (e = Ue)
            ? ((e = nv(e, nn)),
              (e = e !== null && e.data === '&' ? e : null),
              e !== null &&
                ((t.memoizedState = {
                  dehydrated: e,
                  treeContext: ul !== null ? { id: _n, overflow: Sn } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (n = hh(e)),
                (n.return = t),
                (t.child = n),
                (it = t),
                (Ue = null)))
            : (e = null),
          e === null)
        )
          throw cl(t);
        return ((t.lanes = 536870912), null);
      }
      return vc(t, a);
    }
    var c = e.memoizedState;
    if (c !== null) {
      var d = c.dehydrated;
      if ((Es(t), i))
        if (t.flags & 256) ((t.flags &= -257), (t = Cm(e, t, n)));
        else if (t.memoizedState !== null) ((t.child = e.child), (t.flags |= 128), (t = null));
        else throw Error(s(558));
      else if ((Pe || Il(e, t, n, !1), (i = (n & e.childLanes) !== 0), Pe || i)) {
        if (hl.current === null) {
          if (((a = Re), a !== null && ((d = vd(a, n)), d !== 0 && d !== c.retryLane)))
            throw ((c.retryLane = d), Xl(e, d), Rt(a, e, d), Xs);
          Zc();
        }
        t = Cm(e, t, n);
      } else
        ((e = c.treeContext),
          (Ue = an(d.nextSibling)),
          (it = t),
          (oe = !0),
          (il = null),
          (nn = !1),
          e !== null && vh(t, e),
          (t = vc(t, a)),
          (t.flags |= 134221824));
      return t;
    }
    return (
      (e = Bn(e.child, { mode: a.mode, children: a.children })),
      (e.ref = t.ref),
      (t.child = e),
      (e.return = t),
      e
    );
  }
  function Za(e, t) {
    var n = t.ref;
    if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof n != 'function' && typeof n != 'object') throw Error(s(284));
      (e === null || e.ref !== n) && (t.flags |= 4194816);
    }
  }
  function Qs(e, t, n, a, i) {
    return (
      Jl(t),
      (n = xs(e, t, n, a, void 0, i)),
      (a = Os()),
      e !== null && !Pe
        ? (As(e, t, i), Qn(e, t, i))
        : (oe && a && Ki(t), (t.flags |= 1), nt(e, t, n, i), t.child)
    );
  }
  function Dm(e, t, n, a, i, c) {
    return (
      Jl(t),
      (t.updateQueue = null),
      (n = Mh(t, a, n, i)),
      Rh(e),
      (a = Os()),
      e !== null && !Pe
        ? (As(e, t, c), Qn(e, t, c))
        : (oe && a && Ki(t), (t.flags |= 1), nt(e, t, n, c), t.child)
    );
  }
  function wm(e, t, n, a, i) {
    if ((Jl(t), t.stateNode === null)) {
      var c = ja,
        d = n.contextType;
      (typeof d == 'object' && d !== null && (c = ft(d)),
        (c = new n(a, c)),
        (t.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null),
        (c.updater = Vs),
        (t.stateNode = c),
        (c._reactInternals = t),
        (c = t.stateNode),
        (c.props = a),
        (c.state = t.memoizedState),
        (c.refs = {}),
        gs(t),
        (d = n.contextType),
        (c.context = typeof d == 'object' && d !== null ? ft(d) : ja),
        (c.state = t.memoizedState),
        (d = n.getDerivedStateFromProps),
        typeof d == 'function' && (Ys(t, n, d, a), (c.state = t.memoizedState)),
        typeof n.getDerivedStateFromProps == 'function' ||
          typeof c.getSnapshotBeforeUpdate == 'function' ||
          (typeof c.UNSAFE_componentWillMount != 'function' &&
            typeof c.componentWillMount != 'function') ||
          ((d = c.state),
          typeof c.componentWillMount == 'function' && c.componentWillMount(),
          typeof c.UNSAFE_componentWillMount == 'function' && c.UNSAFE_componentWillMount(),
          d !== c.state && Vs.enqueueReplaceState(c, c.state, null),
          Hu(t, a, c, i),
          Zu(),
          (c.state = t.memoizedState)),
        typeof c.componentDidMount == 'function' && (t.flags |= 4194308),
        (a = !0));
    } else if (e === null) {
      c = t.stateNode;
      var p = t.memoizedProps,
        y = la(n, p);
      c.props = y;
      var j = c.context,
        D = n.contextType;
      ((d = ja), typeof D == 'object' && D !== null && (d = ft(D)));
      var M = n.getDerivedStateFromProps;
      ((D = typeof M == 'function' || typeof c.getSnapshotBeforeUpdate == 'function'),
        (p = t.pendingProps !== p),
        D ||
          (typeof c.UNSAFE_componentWillReceiveProps != 'function' &&
            typeof c.componentWillReceiveProps != 'function') ||
          ((p || j !== d) && gm(t, c, a, d)),
        (ol = !1));
      var E = t.memoizedState;
      ((c.state = E),
        Hu(t, a, c, i),
        Zu(),
        (j = t.memoizedState),
        p || E !== j || ol
          ? (typeof M == 'function' && (Ys(t, n, M, a), (j = t.memoizedState)),
            (y = ol || ym(t, n, y, a, E, j, d))
              ? (D ||
                  (typeof c.UNSAFE_componentWillMount != 'function' &&
                    typeof c.componentWillMount != 'function') ||
                  (typeof c.componentWillMount == 'function' && c.componentWillMount(),
                  typeof c.UNSAFE_componentWillMount == 'function' &&
                    c.UNSAFE_componentWillMount()),
                typeof c.componentDidMount == 'function' && (t.flags |= 4194308))
              : (typeof c.componentDidMount == 'function' && (t.flags |= 4194308),
                (t.memoizedProps = a),
                (t.memoizedState = j)),
            (c.props = a),
            (c.state = j),
            (c.context = d),
            (a = y))
          : (typeof c.componentDidMount == 'function' && (t.flags |= 4194308), (a = !1)));
    } else {
      ((c = t.stateNode),
        bs(e, t),
        (d = t.memoizedProps),
        (D = la(n, d)),
        (c.props = D),
        (M = t.pendingProps),
        (E = c.context),
        (j = n.contextType),
        (y = ja),
        typeof j == 'object' && j !== null && (y = ft(j)),
        (p = n.getDerivedStateFromProps),
        (j = typeof p == 'function' || typeof c.getSnapshotBeforeUpdate == 'function') ||
          (typeof c.UNSAFE_componentWillReceiveProps != 'function' &&
            typeof c.componentWillReceiveProps != 'function') ||
          ((d !== M || E !== y) && gm(t, c, a, y)),
        (ol = !1),
        (E = t.memoizedState),
        (c.state = E),
        Hu(t, a, c, i),
        Zu());
      var C = t.memoizedState;
      d !== M || E !== C || ol || (e !== null && e.dependencies !== null && Fi(e.dependencies))
        ? (typeof p == 'function' && (Ys(t, n, p, a), (C = t.memoizedState)),
          (D =
            ol ||
            ym(t, n, D, a, E, C, y) ||
            (e !== null && e.dependencies !== null && Fi(e.dependencies)))
            ? (j ||
                (typeof c.UNSAFE_componentWillUpdate != 'function' &&
                  typeof c.componentWillUpdate != 'function') ||
                (typeof c.componentWillUpdate == 'function' && c.componentWillUpdate(a, C, y),
                typeof c.UNSAFE_componentWillUpdate == 'function' &&
                  c.UNSAFE_componentWillUpdate(a, C, y)),
              typeof c.componentDidUpdate == 'function' && (t.flags |= 4),
              typeof c.getSnapshotBeforeUpdate == 'function' && (t.flags |= 1024))
            : (typeof c.componentDidUpdate != 'function' ||
                (d === e.memoizedProps && E === e.memoizedState) ||
                (t.flags |= 4),
              typeof c.getSnapshotBeforeUpdate != 'function' ||
                (d === e.memoizedProps && E === e.memoizedState) ||
                (t.flags |= 1024),
              (t.memoizedProps = a),
              (t.memoizedState = C)),
          (c.props = a),
          (c.state = C),
          (c.context = y),
          (a = D))
        : (typeof c.componentDidUpdate != 'function' ||
            (d === e.memoizedProps && E === e.memoizedState) ||
            (t.flags |= 4),
          typeof c.getSnapshotBeforeUpdate != 'function' ||
            (d === e.memoizedProps && E === e.memoizedState) ||
            (t.flags |= 1024),
          (a = !1));
    }
    return (
      (c = a),
      Za(e, t),
      (a = (t.flags & 128) !== 0),
      c || a
        ? ((c = t.stateNode),
          (n = a && typeof n.getDerivedStateFromError != 'function' ? null : c.render()),
          (t.flags |= 1),
          e !== null && a
            ? ((t.child = ta(t, e.child, null, i)), (t.child = ta(t, null, n, i)))
            : nt(e, t, n, i),
          (t.memoizedState = c.state),
          (e = t.child))
        : (e = Qn(e, t, i)),
      e
    );
  }
  function Rm(e, t, n, a) {
    return ($l(), (t.flags |= 256), nt(e, t, n, a), t.child);
  }
  var $s = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
  function Ks(e) {
    return { baseLanes: e, cachePool: zh() };
  }
  function Is(e, t, n) {
    return ((e = e !== null ? e.childLanes & ~n : 0), t && (e |= Qt), e);
  }
  function Mm(e, t, n) {
    var a = t.pendingProps,
      i = !1,
      c = (t.flags & 128) !== 0,
      d;
    if (
      ((d = c) || (d = e !== null && e.memoizedState === null ? !1 : (ht.current & 2) !== 0),
      d && ((i = !0), (t.flags &= -129)),
      (d = (t.flags & 32) !== 0),
      (t.flags &= -33),
      e === null)
    ) {
      if (oe) {
        if (
          (i ? ml(t) : pl(),
          (e = Ue)
            ? ((e = nv(e, nn)),
              (e = e !== null && e.data !== '&' ? e : null),
              e !== null &&
                ((t.memoizedState = {
                  dehydrated: e,
                  treeContext: ul !== null ? { id: _n, overflow: Sn } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (n = hh(e)),
                (n.return = t),
                (t.child = n),
                (it = t),
                (Ue = null)))
            : (e = null),
          e === null)
        )
          throw cl(t);
        return (Io(e) ? (t.lanes = 32) : (t.lanes = 536870912), null);
      }
      return (
        (c = a.children),
        (a = a.fallback),
        i
          ? (pl(),
            (i = t.mode),
            (c = yc({ mode: 'hidden', children: c }, i)),
            (a = Ql(a, i, n, null)),
            (c.return = t),
            (a.return = t),
            (c.sibling = a),
            (t.child = c),
            (a = t.child),
            (a.memoizedState = Ks(n)),
            (a.childLanes = Is(e, d, n)),
            (t.memoizedState = $s),
            Yu(null, a))
          : (ml(t), Js(t, c))
      );
    }
    var p = e.memoizedState;
    if (p !== null) {
      var y = p.dehydrated;
      if (y !== null) return h1(e, t, c, d, a, y, p, n);
    }
    return i
      ? (pl(),
        (i = a.fallback),
        (c = t.mode),
        (p = e.child),
        (y = p.sibling),
        (a = Bn(p, { mode: 'hidden', children: a.children })),
        (a.subtreeFlags = p.subtreeFlags & 1206910976),
        y !== null ? (i = Bn(y, i)) : ((i = Ql(i, c, n, null)), (i.flags |= 2)),
        (i.return = t),
        (a.return = t),
        (a.sibling = i),
        (t.child = a),
        Yu(null, a),
        (a = t.child),
        (i = e.child.memoizedState),
        i === null
          ? (i = Ks(n))
          : ((c = i.cachePool),
            c !== null
              ? ((p = Je._currentValue), (c = c.parent !== p ? { parent: p, pool: p } : c))
              : (c = zh()),
            (i = { baseLanes: i.baseLanes | n, cachePool: c })),
        (a.memoizedState = i),
        (a.childLanes = Is(e, d, n)),
        (t.memoizedState = $s),
        Yu(e.child, a))
      : (ml(t),
        (n = e.child),
        (e = n.sibling),
        (n = Bn(n, { mode: 'visible', children: a.children })),
        (n.return = t),
        (n.sibling = null),
        e !== null &&
          ((d = t.deletions), d === null ? ((t.deletions = [e]), (t.flags |= 16)) : d.push(e)),
        (t.child = n),
        (t.memoizedState = null),
        n);
  }
  function Js(e, t) {
    return ((t = yc({ mode: 'visible', children: t }, e.mode)), (t.return = e), (e.child = t));
  }
  function yc(e, t) {
    return ((e = At(22, e, null, t)), (e.lanes = 0), e);
  }
  function gc(e, t, n) {
    return (
      ta(t, e.child, null, n),
      (e = Js(t, t.pendingProps.children)),
      (e.flags |= 2),
      (t.memoizedState = null),
      e
    );
  }
  function h1(e, t, n, a, i, c, d, p) {
    if (n)
      return t.flags & 256
        ? (ml(t), (t.flags &= -257), gc(e, t, p))
        : t.memoizedState !== null
          ? (pl(), (t.child = e.child), (t.flags |= 128), null)
          : (pl(),
            (c = i.fallback),
            (d = t.mode),
            (i = yc({ mode: 'visible', children: i.children }, d)),
            (c = Ql(c, d, p, null)),
            (c.flags |= 2),
            (i.return = t),
            (c.return = t),
            (i.sibling = c),
            (t.child = i),
            ta(t, e.child, null, p),
            (i = t.child),
            (i.memoizedState = Ks(p)),
            (i.childLanes = Is(e, a, p)),
            (t.memoizedState = $s),
            Yu(null, i));
    if ((ml(t), Io(c))) {
      if (((a = c.nextSibling && c.nextSibling.dataset), a)) var y = a.dgst;
      return (
        (a = y),
        a !== '' &&
          ((i = Error(s(419))),
          (i.stack = ''),
          (i.digest = a),
          Cu({ value: i, source: null, stack: null })),
        gc(e, t, p)
      );
    }
    if ((Pe || Il(e, t, p, !1), (a = (p & e.childLanes) !== 0), Pe || a)) {
      if (hl.current !== null) return gc(e, t, p);
      if (((a = Re), a !== null && ((i = vd(a, p)), i !== 0 && i !== d.retryLane)))
        throw ((d.retryLane = i), Xl(e, i), Rt(a, e, i), Xs);
      return (Ko(c) || Zc(), gc(e, t, p));
    }
    return Ko(c)
      ? ((t.flags |= 192), (t.child = e.child), null)
      : ((e = d.treeContext),
        (Ue = an(c.nextSibling)),
        (it = t),
        (oe = !0),
        (il = null),
        (nn = !1),
        e !== null && vh(t, e),
        (t = Js(t, i.children)),
        (t.flags |= 134221824),
        t);
  }
  function Um(e, t, n) {
    e.lanes |= t;
    var a = e.alternate;
    (a !== null && (a.lanes |= t), Ji(e.return, t, n));
  }
  function Zm(e) {
    for (var t = null; e !== null;) {
      var n = e.alternate;
      (n !== null && uc(n) === null && (t = e), (e = e.sibling));
    }
    return t;
  }
  function bc(e, t, n, a, i, c) {
    var d = e.memoizedState;
    d === null
      ? (e.memoizedState = {
          isBackwards: t,
          rendering: null,
          renderingStartTime: 0,
          last: a,
          tail: n,
          tailMode: i,
          treeForkCount: c,
        })
      : ((d.isBackwards = t),
        (d.rendering = null),
        (d.renderingStartTime = 0),
        (d.last = a),
        (d.tail = n),
        (d.tailMode = i),
        (d.treeForkCount = c));
  }
  function Fs(e) {
    var t = e.child;
    for (e.child = null; t !== null;) {
      var n = t.sibling;
      ((t.sibling = e.child), (e.child = t), (t = n));
    }
  }
  function Ps(e, t, n) {
    var a = t.pendingProps,
      i = a.revealOrder,
      c = a.tail;
    a = a.children;
    var d = ht.current;
    if (t.flags & 128) return (ku(t, d), null);
    var p = (d & 2) !== 0;
    if (
      (p ? ((d = (d & 1) | 2), (t.flags |= 128)) : (d &= 1),
      ku(t, d),
      i === 'backwards' && e !== null ? (Fs(e), nt(e, t, a, n), Fs(e)) : nt(e, t, a, n),
      (a = oe ? Au : 0),
      !p && e !== null && (e.flags & 128) !== 0)
    )
      e: for (e = t.child; e !== null;) {
        if (e.tag === 13) e.memoizedState !== null && Um(e, n, t);
        else if (e.tag === 19) Um(e, n, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null;) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    switch (i) {
      case 'backwards':
        ((n = Zm(t.child)),
          n === null
            ? ((i = t.child), (t.child = null))
            : ((i = n.sibling), (n.sibling = null), Fs(t)),
          bc(t, !0, i, null, c, a));
        break;
      case 'unstable_legacy-backwards':
        for (n = null, i = t.child, t.child = null; i !== null;) {
          if (((e = i.alternate), e !== null && uc(e) === null)) {
            t.child = i;
            break;
          }
          ((e = i.sibling), (i.sibling = n), (n = i), (i = e));
        }
        bc(t, !0, n, null, c, a);
        break;
      case 'together':
        bc(t, !1, null, null, void 0, a);
        break;
      case 'independent':
        t.memoizedState = null;
        break;
      default:
        ((n = Zm(t.child)),
          n === null ? ((i = t.child), (t.child = null)) : ((i = n.sibling), (n.sibling = null)),
          bc(t, !1, i, n, c, a));
    }
    return t.child;
  }
  function Hm(e, t, n) {
    var a = t.pendingProps;
    return (rl(t, t.type, a.value), nt(e, t, a.children, n), t.child);
  }
  function Qn(e, t, n) {
    if (
      (e !== null && (t.dependencies = e.dependencies), (bl |= t.lanes), (n & t.childLanes) === 0)
    )
      if (e !== null) {
        if ((Il(e, t, n, !1), (n & t.childLanes) === 0)) return null;
      } else return null;
    if (e !== null && t.child !== e.child) throw Error(s(153));
    if (t.child !== null) {
      for (e = t.child, n = Bn(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;)
        ((e = e.sibling), (n = n.sibling = Bn(e, e.pendingProps)), (n.return = t));
      n.sibling = null;
    }
    return t.child;
  }
  function Ws(e, t) {
    return (e.lanes & t) !== 0 ? !0 : ((e = e.dependencies), !!(e !== null && Fi(e)));
  }
  function m1(e, t, n) {
    switch (t.tag) {
      case 3:
        (Ei(t, t.stateNode.containerInfo), rl(t, Je, e.memoizedState.cache), $l());
        break;
      case 27:
      case 5:
        jr(t);
        break;
      case 4:
        Ei(t, t.stateNode.containerInfo);
        break;
      case 10:
        rl(t, t.type, t.memoizedProps.value);
        break;
      case 31:
        if (t.memoizedState !== null) return ((t.flags |= 128), Es(t), null);
        break;
      case 13:
        var a = t.memoizedState;
        if (a !== null) {
          if (a.dehydrated !== null) return (ml(t), (t.flags |= 128), null);
          a = Il(e, t, n, !1);
          var i = t.child.childLanes;
          return a || (n & i) !== 0
            ? Mm(e, t, n)
            : (ml(t), (e = Qn(e, t, n)), e !== null ? e.sibling : null);
        }
        ml(t);
        break;
      case 19:
        if (t.flags & 128) return Ps(e, t, n);
        if (
          ((i = (e.flags & 128) !== 0),
          (a = (n & t.childLanes) !== 0),
          a || (Il(e, t, n, !1), (a = (n & t.childLanes) !== 0)),
          i)
        ) {
          if (a) return Ps(e, t, n);
          t.flags |= 128;
        }
        if (
          ((i = t.memoizedState),
          i !== null && ((i.rendering = null), (i.tail = null), (i.lastEffect = null)),
          ku(t, ht.current),
          a)
        )
          break;
        return null;
      case 22:
        return ((t.lanes = 0), Om(e, t, n, t.pendingProps));
      case 24:
        rl(t, Je, e.memoizedState.cache);
    }
    return Qn(e, t, n);
  }
  function km(e, t, n) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps) Pe = !0;
      else {
        if (!Ws(e, n) && (t.flags & 128) === 0) return ((Pe = !1), m1(e, t, n));
        Pe = (e.flags & 131072) !== 0;
      }
    else ((Pe = !1), oe && (t.flags & 1048576) !== 0 && ph(t, Au, t.index));
    switch (((t.lanes = 0), t.tag)) {
      case 16:
        e: {
          var a = t.pendingProps;
          if (((e = Wl(t.elementType)), (t.type = e), typeof e == 'function'))
            is(e)
              ? ((a = la(e, a)), (t.tag = 1), (t = wm(null, t, e, a, n)))
              : ((t.tag = 0), (t = Qs(null, t, e, a, n)));
          else {
            if (e != null) {
              var i = e.$$typeof;
              if (i === G) {
                ((t.tag = 11), (t = Tm(null, t, e, a, n)));
                break e;
              } else if (i === re) {
                ((t.tag = 14), (t = jm(null, t, e, a, n)));
                break e;
              } else if (i === Ie) {
                ((t.tag = 10), (t.type = e), (t = Hm(null, t, n)));
                break e;
              }
            }
            throw ((t = Se(e) || e), Error(s(306, t, '')));
          }
        }
        return t;
      case 0:
        return Qs(e, t, t.type, t.pendingProps, n);
      case 1:
        return ((a = t.type), (i = la(a, t.pendingProps)), wm(e, t, a, i, n));
      case 3:
        e: {
          if ((Ei(t, t.stateNode.containerInfo), e === null)) throw Error(s(387));
          a = t.pendingProps;
          var c = t.memoizedState;
          ((i = c.element), bs(e, t), Hu(t, a, null, n));
          var d = t.memoizedState;
          if (
            ((a = d.cache),
            rl(t, Je, a),
            a !== c.cache && hs(t, [Je], n, !0),
            Zu(),
            (a = d.element),
            c.isDehydrated)
          )
            if (
              ((c = { element: a, isDehydrated: !1, cache: d.cache }),
              (t.updateQueue.baseState = c),
              (t.memoizedState = c),
              t.flags & 256)
            ) {
              t = Rm(e, t, a, n);
              break e;
            } else if (a !== i) {
              ((i = Wt(Error(s(424)), t)), Cu(i), (t = Rm(e, t, a, n)));
              break e;
            } else {
              switch (((e = t.stateNode.containerInfo), e.nodeType)) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === 'HTML' ? e.ownerDocument.body : e;
              }
              for (
                Ue = an(e.firstChild),
                  it = t,
                  oe = !0,
                  il = null,
                  nn = !0,
                  n = Oh(t, null, a, n),
                  t.child = n;
                n;
              )
                ((n.flags = (n.flags & -3) | 134221824), (n = n.sibling));
            }
          else {
            if (($l(), a === i)) {
              t = Qn(e, t, n);
              break e;
            }
            nt(e, t, a, n);
          }
          t = t.child;
        }
        return t;
      case 26:
        return (
          Za(e, t),
          e === null
            ? (n = sv(t.type, null, t.pendingProps, null))
              ? (t.memoizedState = n)
              : oe || (t.stateNode = Yp(t.type, t.pendingProps, el.current, t))
            : (t.memoizedState = sv(t.type, e.memoizedProps, t.pendingProps, e.memoizedState)),
          null
        );
      case 27:
        return (
          jr(t),
          e === null &&
            oe &&
            ((a = t.stateNode = uv(t.type, t.pendingProps, el.current)),
            (it = t),
            (nn = !0),
            (i = Ue),
            Nl(t.type) ? ((Jo = i), (Ue = an(a.firstChild))) : (Ue = i)),
          nt(e, t, t.pendingProps.children, n),
          Za(e, t),
          e === null && (t.flags |= 4194304),
          t.child
        );
      case 5:
        return (
          e === null &&
            oe &&
            ((i = a = Ue) &&
              ((a = rb(a, t.type, t.pendingProps, nn)),
              a !== null
                ? ((t.stateNode = a), (it = t), (Ue = an(a.firstChild)), (nn = !1), (i = !0))
                : (i = !1)),
            i || cl(t)),
          jr(t),
          (i = t.type),
          (c = t.pendingProps),
          (d = e !== null ? e.memoizedProps : null),
          (a = c.children),
          qo(i, c) ? (a = null) : d !== null && qo(i, d) && (t.flags |= 32),
          t.memoizedState !== null && ((i = xs(e, t, l1, null, null, n)), (eu._currentValue = i)),
          Za(e, t),
          nt(e, t, a, n),
          t.child
        );
      case 6:
        return (
          e === null &&
            oe &&
            ((e = n = Ue) &&
              ((n = sb(n, t.pendingProps, nn)),
              n !== null ? ((t.stateNode = n), (it = t), (Ue = null), (e = !0)) : (e = !1)),
            e || cl(t)),
          null
        );
      case 13:
        return Mm(e, t, n);
      case 4:
        return (
          Ei(t, t.stateNode.containerInfo),
          (a = t.pendingProps),
          e === null ? (t.child = ta(t, null, a, n)) : nt(e, t, a, n),
          t.child
        );
      case 11:
        return Tm(e, t, t.type, t.pendingProps, n);
      case 7:
        return ((a = t.pendingProps), Za(e, t), nt(e, t, a, n), t.child);
      case 8:
        return (nt(e, t, t.pendingProps.children, n), t.child);
      case 12:
        return (nt(e, t, t.pendingProps.children, n), t.child);
      case 10:
        return Hm(e, t, n);
      case 9:
        return (
          (i = t.type._context),
          (a = t.pendingProps.children),
          Jl(t),
          (i = ft(i)),
          (a = a(i)),
          (t.flags |= 1),
          nt(e, t, a, n),
          t.child
        );
      case 14:
        return jm(e, t, t.type, t.pendingProps, n);
      case 15:
        return xm(e, t, t.type, t.pendingProps, n);
      case 19:
        return Ps(e, t, n);
      case 31:
        return d1(e, t, n);
      case 22:
        return Om(e, t, n, t.pendingProps);
      case 24:
        return (
          Jl(t),
          (a = ft(Je)),
          e === null
            ? ((i = vs()),
              i === null &&
                ((i = Re),
                (c = ms()),
                (i.pooledCache = c),
                c.refCount++,
                c !== null && (i.pooledCacheLanes |= n),
                (i = c)),
              (t.memoizedState = { parent: a, cache: i }),
              gs(t),
              rl(t, Je, i))
            : ((e.lanes & n) !== 0 && (bs(e, t), Hu(t, null, null, n), Zu()),
              (i = e.memoizedState),
              (c = t.memoizedState),
              i.parent !== a
                ? ((i = { parent: a, cache: a }),
                  (t.memoizedState = i),
                  t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i),
                  rl(t, Je, a))
                : ((a = c.cache), rl(t, Je, a), a !== i.cache && hs(t, [Je], n, !0))),
          nt(e, t, t.pendingProps.children, n),
          t.child
        );
      case 30:
        return (
          t.stateNode === null &&
            (t.stateNode = { autoName: null, paired: null, clones: null, ref: null }),
          (a = t.pendingProps),
          a.name != null && a.name !== 'auto'
            ? (t.flags |= e === null ? 18882560 : 18874368)
            : oe && Ki(t),
          e !== null && e.memoizedProps.name !== a.name ? (t.flags |= 4194816) : Za(e, t),
          nt(e, t, a.children, n),
          t.child
        );
      case 29:
        throw t.pendingProps;
    }
    throw Error(s(156, t.tag));
  }
  function $n(e) {
    e.flags |= 4;
  }
  function eo(e, t, n, a, i) {
    var c;
    if (
      ((c = (e.mode & 32) !== 0) &&
        (c = n === null ? hv(t, a) : hv(t, a) && (a.src !== n.src || a.srcSet !== n.srcSet)),
      c)
    ) {
      if (((e.flags |= 16777216), (i & 335544128) === i))
        if (e.stateNode.complete) e.flags |= 8192;
        else if (bp()) e.flags |= 8192;
        else throw ((ea = tc), ys);
    } else e.flags &= -16777217;
  }
  function Lm(e, t) {
    if (t.type !== 'stylesheet' || (t.state.loading & 4) !== 0) e.flags &= -16777217;
    else if (((e.flags |= 16777216), !mv(t)))
      if (bp()) e.flags |= 8192;
      else throw ((ea = tc), ys);
  }
  function _c(e, t) {
    (t !== null && (e.flags |= 4),
      e.flags & 16384 && ((t = e.tag !== 22 ? hd() : 536870912), (e.lanes |= t), (qa |= t)));
  }
  function Vu(e, t) {
    if (!oe)
      switch (e.tailMode) {
        case 'visible':
          break;
        case 'collapsed':
          for (var n = e.tail, a = null; n !== null;)
            (n.alternate !== null && (a = n), (n = n.sibling));
          a === null
            ? t || e.tail === null
              ? (e.tail = null)
              : (e.tail.sibling = null)
            : (a.sibling = null);
          break;
        default:
          for (t = e.tail, n = null; t !== null;)
            (t.alternate !== null && (n = t), (t = t.sibling));
          n === null ? (e.tail = null) : (n.sibling = null);
      }
  }
  function Ze(e) {
    var t = e.alternate !== null && e.alternate.child === e.child,
      n = 0,
      a = 0;
    if (t)
      for (var i = e.child; i !== null;)
        ((n |= i.lanes | i.childLanes),
          (a |= i.subtreeFlags & 1206910976),
          (a |= i.flags & 1206910976),
          (i.return = e),
          (i = i.sibling));
    else
      for (i = e.child; i !== null;)
        ((n |= i.lanes | i.childLanes),
          (a |= i.subtreeFlags),
          (a |= i.flags),
          (i.return = e),
          (i = i.sibling));
    return ((e.subtreeFlags |= a), (e.childLanes = n), t);
  }
  function p1(e, t, n) {
    var a = t.pendingProps;
    switch ((ss(t), t.tag)) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return (Ze(t), null);
      case 1:
        return (Ze(t), null);
      case 3:
        return (
          (n = t.stateNode),
          (a = null),
          e !== null && (a = e.memoizedState.cache),
          t.memoizedState.cache !== a && (t.flags |= 2048),
          Vn(Je),
          ha(),
          n.pendingContext && ((n.context = n.pendingContext), (n.pendingContext = null)),
          (e === null || e.child === null) &&
            (Aa(t)
              ? $n(t)
              : e === null ||
                (e.memoizedState.isDehydrated && (t.flags & 256) === 0) ||
                ((t.flags |= 1024), fs())),
          Ze(t),
          null
        );
      case 26:
        var i = t.type,
          c = t.memoizedState;
        return (
          e === null
            ? ($n(t), c !== null ? (Ze(t), Lm(t, c)) : (Ze(t), eo(t, i, null, a, n)))
            : c
              ? c !== e.memoizedState
                ? ($n(t), Ze(t), Lm(t, c))
                : (Ze(t), (t.flags &= -16777217))
              : ((e = e.memoizedProps), e !== a && $n(t), Ze(t), eo(t, i, e, a, n)),
          null
        );
      case 27:
        if ((Ti(t), (n = el.current), (i = t.type), e !== null && t.stateNode != null))
          e.memoizedProps !== a && $n(t);
        else {
          if (!a) {
            if (t.stateNode === null) throw Error(s(166));
            return (Ze(t), (t.subtreeFlags &= -33554433), null);
          }
          ((e = gn.current), Aa(t) ? yh(t) : ((e = uv(i, a, n)), (t.stateNode = e), $n(t)));
        }
        return (Ze(t), (t.subtreeFlags &= -33554433), null);
      case 5:
        if ((Ti(t), (i = t.type), e !== null && t.stateNode != null))
          e.memoizedProps !== a && $n(t);
        else {
          if (!a) {
            if (t.stateNode === null) throw Error(s(166));
            return (Ze(t), (t.subtreeFlags &= -33554433), null);
          }
          if (((c = gn.current), Aa(t))) yh(t);
          else {
            var d = ei(el.current);
            switch (c) {
              case 1:
                c = d.createElementNS('http://www.w3.org/2000/svg', i);
                break;
              case 2:
                c = d.createElementNS('http://www.w3.org/1998/Math/MathML', i);
                break;
              default:
                switch (i) {
                  case 'svg':
                    c = d.createElementNS('http://www.w3.org/2000/svg', i);
                    break;
                  case 'math':
                    c = d.createElementNS('http://www.w3.org/1998/Math/MathML', i);
                    break;
                  case 'script':
                    ((c = d.createElement('div')),
                      (c.innerHTML = '<script><\/script>'),
                      (c = c.removeChild(c.firstChild)));
                    break;
                  case 'select':
                    ((c =
                      typeof a.is == 'string'
                        ? d.createElement('select', { is: a.is })
                        : d.createElement('select')),
                      a.multiple ? (c.multiple = !0) : a.size && (c.size = a.size));
                    break;
                  default:
                    c =
                      typeof a.is == 'string'
                        ? d.createElement(i, { is: a.is })
                        : d.createElement(i);
                }
            }
            ((c[ot] = t), (c[Ot] = a));
            e: for (d = t.child; d !== null;) {
              if (d.tag === 5 || d.tag === 6) c.appendChild(d.stateNode);
              else if (d.tag !== 4 && d.tag !== 27 && d.child !== null) {
                ((d.child.return = d), (d = d.child));
                continue;
              }
              if (d === t) break e;
              for (; d.sibling === null;) {
                if (d.return === null || d.return === t) break e;
                d = d.return;
              }
              ((d.sibling.return = d.return), (d = d.sibling));
            }
            t.stateNode = c;
            e: switch ((pt(c, i, a), i)) {
              case 'button':
              case 'input':
              case 'select':
              case 'textarea':
                a = !!a.autoFocus;
                break e;
              case 'img':
                a = !0;
                break e;
              default:
                a = !1;
            }
            a && $n(t);
          }
        }
        return (
          Ze(t),
          (t.subtreeFlags &= -33554433),
          eo(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n),
          null
        );
      case 6:
        if (e && t.stateNode != null) e.memoizedProps !== a && $n(t);
        else {
          if (typeof a != 'string' && t.stateNode === null) throw Error(s(166));
          if (((e = el.current), Aa(t))) {
            if (((e = t.stateNode), (n = t.memoizedProps), (a = null), (i = it), i !== null))
              switch (i.tag) {
                case 27:
                case 5:
                  a = i.memoizedProps;
              }
            ((e[ot] = t),
              (e = !!(
                e.nodeValue === n ||
                (a !== null && a.suppressHydrationWarning === !0) ||
                kp(e.nodeValue, n)
              )),
              e || cl(t, !0));
          } else ((e = ei(e).createTextNode(a)), (e[ot] = t), (t.stateNode = e));
        }
        return (Ze(t), null);
      case 31:
        if (((n = t.memoizedState), e === null || e.memoizedState !== null)) {
          if (((a = Aa(t)), n !== null)) {
            if (e === null) {
              if (!a) throw Error(s(318));
              if (((e = t.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
                throw Error(s(557));
              e[ot] = t;
            } else ($l(), (t.flags & 128) === 0 && (t.memoizedState = null), (t.flags |= 4));
            (Ze(t), (e = !1));
          } else
            ((n = fs()),
              e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n),
              (e = !0));
          if (!e) return t.flags & 256 ? (Vt(t), t) : (Vt(t), null);
          if ((t.flags & 128) !== 0) throw Error(s(558));
        }
        return (Ze(t), null);
      case 13:
        if (
          ((a = t.memoizedState),
          e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
        ) {
          if (((i = Aa(t)), a !== null && a.dehydrated !== null)) {
            if (e === null) {
              if (!i) throw Error(s(318));
              if (((i = t.memoizedState), (i = i !== null ? i.dehydrated : null), !i))
                throw Error(s(317));
              i[ot] = t;
            } else ($l(), (t.flags & 128) === 0 && (t.memoizedState = null), (t.flags |= 4));
            (Ze(t), (i = !1));
          } else
            ((i = fs()),
              e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i),
              (i = !0));
          if (!i) return t.flags & 256 ? (Vt(t), t) : (Vt(t), null);
        }
        return (
          Vt(t),
          (t.flags & 128) !== 0
            ? ((t.lanes = n), t)
            : ((n = a !== null),
              (e = e !== null && e.memoizedState !== null),
              n &&
                ((a = t.child),
                (i = null),
                a.alternate !== null &&
                  a.alternate.memoizedState !== null &&
                  a.alternate.memoizedState.cachePool !== null &&
                  (i = a.alternate.memoizedState.cachePool.pool),
                (c = null),
                a.memoizedState !== null &&
                  a.memoizedState.cachePool !== null &&
                  (c = a.memoizedState.cachePool.pool),
                c !== i && (a.flags |= 2048)),
              n !== e && n && (t.child.flags |= 8192),
              _c(t, t.updateQueue),
              Ze(t),
              null)
        );
      case 4:
        return (
          ha(),
          e === null && Zo(t.stateNode.containerInfo),
          (t.flags |= 67108864),
          Ze(t),
          null
        );
      case 10:
        return (Vn(t.type), Ze(t), null);
      case 19:
        if ((Ts(t), (a = t.memoizedState), a === null)) return (Ze(t), null);
        if (((i = (t.flags & 128) !== 0), (c = a.rendering), c === null))
          if (i) Vu(a, !1);
          else {
            if (Xe !== 0 || (e !== null && (e.flags & 128) !== 0))
              for (e = t.child; e !== null;) {
                if (((c = uc(e)), c !== null)) {
                  for (
                    t.flags |= 128,
                      Vu(a, !1),
                      e = c.updateQueue,
                      t.updateQueue = e,
                      _c(t, e),
                      t.subtreeFlags = 0,
                      e = n,
                      n = t.child;
                    n !== null;
                  )
                    (dh(n, e), (n = n.sibling));
                  return (ku(t, (ht.current & 1) | 2), oe && qn(t, a.treeForkCount), t.child);
                }
                e = e.sibling;
              }
            a.tail !== null &&
              kt() > wc &&
              ((t.flags |= 128), (i = !0), Vu(a, !1), (t.lanes = 4194304));
          }
        else {
          if (!i)
            if (((e = uc(c)), e !== null)) {
              if (
                ((t.flags |= 128),
                (i = !0),
                (e = e.updateQueue),
                (t.updateQueue = e),
                _c(t, e),
                Vu(a, !0),
                a.tail === null &&
                  a.tailMode !== 'collapsed' &&
                  a.tailMode !== 'visible' &&
                  !c.alternate &&
                  !oe)
              )
                return (Ze(t), null);
            } else
              2 * kt() - a.renderingStartTime > wc &&
                n !== 536870912 &&
                ((t.flags |= 128), (i = !0), Vu(a, !1), (t.lanes = 4194304));
          a.isBackwards
            ? ((c.sibling = t.child), (t.child = c))
            : ((e = a.last), e !== null ? (e.sibling = c) : (t.child = c), (a.last = c));
        }
        if (a.tail !== null) {
          e = a.tail;
          e: {
            for (n = e; n !== null;) {
              if (n.alternate !== null) {
                n = !1;
                break e;
              }
              n = n.sibling;
            }
            n = !0;
          }
          return (
            (a.rendering = e),
            (a.tail = e.sibling),
            (a.renderingStartTime = kt()),
            (e.sibling = null),
            (c = ht.current),
            (c = i ? (c & 1) | 2 : c & 1),
            a.tailMode === 'visible' || a.tailMode === 'collapsed' || !n || oe
              ? ku(t, c)
              : ((n = c), Me(dt, t), Me(ht, n), _t === null && (_t = t)),
            oe && qn(t, a.treeForkCount),
            e
          );
        }
        return (Ze(t), null);
      case 22:
      case 23:
        return (
          Vt(t),
          Ns(),
          (a = t.memoizedState !== null),
          e !== null
            ? (e.memoizedState !== null) !== a && (t.flags |= 8192)
            : a && (t.flags |= 8192),
          a
            ? (n & 536870912) !== 0 &&
              (t.flags & 128) === 0 &&
              (Ze(t), t.subtreeFlags & 6 && (t.flags |= 8192))
            : Ze(t),
          (n = t.updateQueue),
          n !== null && _c(t, n.retryQueue),
          (n = null),
          e !== null &&
            e.memoizedState !== null &&
            e.memoizedState.cachePool !== null &&
            (n = e.memoizedState.cachePool.pool),
          (a = null),
          t.memoizedState !== null &&
            t.memoizedState.cachePool !== null &&
            (a = t.memoizedState.cachePool.pool),
          a !== n && (t.flags |= 2048),
          e !== null && st(Pl),
          null
        );
      case 24:
        return (
          (n = null),
          e !== null && (n = e.memoizedState.cache),
          t.memoizedState.cache !== n && (t.flags |= 2048),
          Vn(Je),
          Ze(t),
          null
        );
      case 25:
        return null;
      case 30:
        return ((t.flags |= 33554432), Ze(t), null);
    }
    throw Error(s(156, t.tag));
  }
  function v1(e, t) {
    switch ((ss(t), t.tag)) {
      case 1:
        return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
      case 3:
        return (
          Vn(Je),
          ha(),
          (e = t.flags),
          (e & 65536) !== 0 && (e & 128) === 0 ? ((t.flags = (e & -65537) | 128), t) : null
        );
      case 26:
      case 27:
      case 5:
        return (Ti(t), null);
      case 31:
        if (t.memoizedState !== null) {
          if ((Vt(t), t.alternate === null)) throw Error(s(340));
          $l();
        }
        return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
      case 13:
        if ((Vt(t), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
          if (t.alternate === null) throw Error(s(340));
          $l();
        }
        return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
      case 19:
        return (
          Ts(t),
          (e = t.flags),
          e & 65536
            ? ((t.flags = (e & -65537) | 128),
              (e = t.memoizedState),
              e !== null && ((e.rendering = null), (e.tail = null)),
              (t.flags |= 4),
              t)
            : null
        );
      case 4:
        return (ha(), null);
      case 10:
        return (Vn(t.type), null);
      case 22:
      case 23:
        return (
          Vt(t),
          Ns(),
          e !== null && st(Pl),
          (e = t.flags),
          e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
        );
      case 24:
        return (Vn(Je), null);
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Bm(e, t) {
    switch ((ss(t), t.tag)) {
      case 3:
        (Vn(Je), ha());
        break;
      case 26:
      case 27:
      case 5:
        Ti(t);
        break;
      case 4:
        ha();
        break;
      case 31:
        t.memoizedState !== null && Vt(t);
        break;
      case 13:
        Vt(t);
        break;
      case 19:
        Ts(t);
        break;
      case 10:
        Vn(t.type);
        break;
      case 22:
      case 23:
        (Vt(t), Ns(), e !== null && st(Pl));
        break;
      case 24:
        Vn(Je);
    }
  }
  function Gu(e, t) {
    try {
      var n = t.updateQueue,
        a = n !== null ? n.lastEffect : null;
      if (a !== null) {
        var i = a.next;
        n = i;
        do {
          if ((n.tag & e) === e) {
            a = void 0;
            var c = n.create,
              d = n.inst;
            ((a = c()), (d.destroy = a));
          }
          n = n.next;
        } while (n !== i);
      }
    } catch (p) {
      Ce(t, t.return, p);
    }
  }
  function vl(e, t, n) {
    try {
      var a = t.updateQueue,
        i = a !== null ? a.lastEffect : null;
      if (i !== null) {
        var c = i.next;
        a = c;
        do {
          if ((a.tag & e) === e) {
            var d = a.inst,
              p = d.destroy;
            if (p !== void 0) {
              ((d.destroy = void 0), (i = t));
              var y = n,
                j = p;
              try {
                j();
              } catch (D) {
                Ce(i, y, D);
              }
            }
          }
          a = a.next;
        } while (a !== c);
      }
    } catch (D) {
      Ce(t, t.return, D);
    }
  }
  function qm(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var n = e.stateNode;
      try {
        Ch(t, n);
      } catch (a) {
        Ce(e, e.return, a);
      }
    }
  }
  function Ym(e, t, n) {
    ((n.props = la(e.type, e.memoizedProps)), (n.state = e.memoizedState));
    try {
      n.componentWillUnmount();
    } catch (a) {
      Ce(e, t, a);
    }
  }
  function zn(e, t) {
    try {
      var n = e.ref;
      if (n !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var a = e.stateNode;
            break;
          case 30:
            var i = e.stateNode,
              c = kn(e.memoizedProps, i);
            ((i.ref === null || i.ref.name !== c) && (i.ref = Ip(c)), (a = i.ref));
            break;
          case 7:
            if (e.stateNode === null) {
              var d = new Kt(e);
              (g(e.child, !1, ib, d, void 0, void 0), (e.stateNode = d));
            }
            a = e.stateNode;
            break;
          default:
            a = e.stateNode;
        }
        typeof n == 'function' ? (e.refCleanup = n(a)) : (n.current = a);
      }
    } catch (p) {
      Ce(e, t, p);
    }
  }
  function mt(e, t) {
    var n = e.ref,
      a = e.refCleanup;
    if (n !== null)
      if (typeof a == 'function')
        try {
          a();
        } catch (i) {
          Ce(e, t, i);
        } finally {
          ((e.refCleanup = null), (e = e.alternate), e != null && (e.refCleanup = null));
        }
      else if (typeof n == 'function')
        try {
          n(null);
        } catch (i) {
          Ce(e, t, i);
        }
      else n.current = null;
  }
  function Sc(e, t) {
    if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null)
      for (var n = 0; n < t.length; n++) tv(e.stateNode, t[n]);
  }
  function Vm(e) {
    for (var t = e.return; t !== null && (no(t) && tv(e.stateNode, t.stateNode), !to(t));)
      t = t.return;
  }
  function Xu(e) {
    for (var t = e.return; t !== null && (no(t) && cb(e.stateNode, t.stateNode), !to(t));)
      t = t.return;
  }
  function to(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 27;
  }
  function no(e) {
    return e && e.tag === 7 && e.stateNode !== null;
  }
  function lo(e) {
    var t = e.type,
      n = e.memoizedProps,
      a = e.stateNode;
    try {
      e: switch (t) {
        case 'button':
        case 'input':
        case 'select':
        case 'textarea':
          n.autoFocus && a.focus();
          break e;
        case 'img':
          n.src ? (a.src = n.src) : n.srcSet && (a.srcset = n.srcSet);
      }
    } catch (i) {
      Ce(e, e.return, i);
    }
  }
  function ao(e, t, n) {
    try {
      var a = e.stateNode;
      (Y1(a, e.type, n, t), (a[Ot] = t));
    } catch (i) {
      Ce(e, e.return, i);
    }
  }
  function Gm(e) {
    return (
      e.tag === 5 || e.tag === 3 || e.tag === 26 || (e.tag === 27 && Nl(e.type)) || e.tag === 4
    );
  }
  function uo(e) {
    e: for (;;) {
      for (; e.sibling === null;) {
        if (e.return === null || Gm(e.return)) return null;
        e = e.return;
      }
      for (
        e.sibling.return = e.return, e = e.sibling;
        e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
      ) {
        if ((e.tag === 27 && Nl(e.type)) || e.flags & 2 || e.child === null || e.tag === 4)
          continue e;
        ((e.child.return = e), (e = e.child));
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function io(e, t, n, a) {
    var i = e.tag;
    if (i === 5 || i === 6)
      ((i = e.stateNode),
        t
          ? (n.nodeType === 9
              ? n.body
              : n.nodeName === 'HTML'
                ? n.ownerDocument.body
                : n
            ).insertBefore(i, t)
          : ((t = n.nodeType === 9 ? n.body : n.nodeName === 'HTML' ? n.ownerDocument.body : n),
            t.appendChild(i),
            (n = n._reactRootContainer),
            n != null || t.onclick !== null || (t.onclick = bn)),
        Sc(e, a),
        (ze = !0));
    else if (
      i !== 4 &&
      (i === 27 && (Sc(e, a), (a = null), Nl(e.type) && ((n = e.stateNode), (t = null))),
      (e = e.child),
      e !== null)
    )
      for (io(e, t, n, a), e = e.sibling; e !== null;) (io(e, t, n, a), (e = e.sibling));
  }
  function zc(e, t, n, a) {
    var i = e.tag;
    if (i === 5 || i === 6)
      ((i = e.stateNode), t ? n.insertBefore(i, t) : n.appendChild(i), Sc(e, a), (ze = !0));
    else if (
      i !== 4 &&
      (i === 27 && (Sc(e, a), (a = null), Nl(e.type) && (n = e.stateNode)),
      (e = e.child),
      e !== null)
    )
      for (zc(e, t, n, a), e = e.sibling; e !== null;) (zc(e, t, n, a), (e = e.sibling));
  }
  function Xm(e) {
    var t = e.stateNode,
      n = e.memoizedProps;
    try {
      for (var a = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
      (pt(t, a, n), (t[ot] = e), (t[Ot] = n));
    } catch (c) {
      Ce(e, e.return, c);
    }
  }
  var Nc = !1,
    Gt = null;
  function Qm(e) {
    (e.tag === 30 || (e.subtreeFlags & 33554432) !== 0) && (Nc = !0);
  }
  var Nn = null;
  function $m() {
    var e = Nn;
    return ((Nn = null), e);
  }
  var Ct = 0;
  function Ha(e, t, n, a, i) {
    return ((Ct = 0), Km(e.child, t, n, a, i));
  }
  function Km(e, t, n, a, i) {
    for (var c = !1; e !== null;) {
      if (e.tag === 5) {
        var d = e.stateNode;
        if (a !== null) {
          var p = Go(d);
          (a.push(p), p.view && (c = !0));
        } else c || (Go(d).view && (c = !0));
        ((Nc = !0), $p(d, Ct === 0 ? t : t + '_' + Ct, n), Ct++);
      } else
        (e.tag !== 22 || e.memoizedState === null) &&
          ((e.tag === 30 && i) || (Km(e.child, t, n, a, i) && (c = !0)));
      e = e.sibling;
    }
    return c;
  }
  function En(e, t) {
    for (; e !== null;)
      (e.tag === 5
        ? Kp(e.stateNode, e.memoizedProps)
        : (e.tag !== 22 || e.memoizedState === null) && ((e.tag === 30 && t) || En(e.child, t)),
        (e = e.sibling));
  }
  function Ec(e) {
    if ((e.subtreeFlags & 18874368) !== 0)
      for (e = e.child; e !== null;) {
        if (
          (e.tag !== 22 || e.memoizedState === null) &&
          (Ec(e), e.tag === 30 && (e.flags & 18874368) !== 0 && e.stateNode.paired)
        ) {
          var t = e.memoizedProps;
          if (t.name == null || t.name === 'auto') throw Error(s(544));
          var n = t.name;
          ((t = Ln(t.default, t.share)),
            t !== 'none' && (Ha(e, n, t, null, !1) || En(e.child, !1)));
        }
        e = e.sibling;
      }
  }
  function co(e, t) {
    if (e.tag === 30) {
      var n = e.stateNode,
        a = e.memoizedProps,
        i = kn(a, n),
        c = Ln(a.default, n.paired ? a.share : a.enter);
      c !== 'none'
        ? Ha(e, i, c, null, !1)
          ? (Ec(e), n.paired || t || Xa(e, a.onEnter))
          : En(e.child, !1)
        : Ec(e);
    } else if ((e.subtreeFlags & 33554432) !== 0)
      for (e = e.child; e !== null;) (co(e, t), (e = e.sibling));
    else Ec(e);
  }
  function ro(e) {
    if (Gt !== null && Gt.size !== 0) {
      var t = Gt;
      if ((e.subtreeFlags & 18874368) !== 0)
        for (e = e.child; e !== null;) {
          if (e.tag !== 22 || e.memoizedState === null) {
            if (e.tag === 30 && (e.flags & 18874368) !== 0) {
              var n = e.memoizedProps,
                a = n.name;
              if (a != null && a !== 'auto') {
                var i = t.get(a);
                if (i !== void 0) {
                  var c = Ln(n.default, n.share);
                  if (
                    (c !== 'none' &&
                      (Ha(e, a, c, null, !1)
                        ? ((c = e.stateNode), (i.paired = c), (c.paired = i), Xa(e, n.onShare))
                        : En(e.child, !1)),
                    t.delete(a),
                    t.size === 0)
                  )
                    break;
                }
              }
            }
            ro(e);
          }
          e = e.sibling;
        }
    }
  }
  function so(e) {
    if (e.tag === 30) {
      var t = e.memoizedProps,
        n = kn(t, e.stateNode),
        a = Gt !== null ? Gt.get(n) : void 0,
        i = Ln(t.default, a !== void 0 ? t.share : t.exit);
      (i !== 'none' &&
        (Ha(e, n, i, null, !1)
          ? a !== void 0
            ? ((i = e.stateNode), (a.paired = i), (i.paired = a), Gt.delete(n), Xa(e, t.onShare))
            : Xa(e, t.onExit)
          : En(e.child, !1)),
        Gt !== null && ro(e));
    } else if ((e.subtreeFlags & 33554432) !== 0)
      for (e = e.child; e !== null;) (so(e), (e = e.sibling));
    else Gt !== null && ro(e);
  }
  function Im(e) {
    for (e = e.child; e !== null;) {
      if (e.tag === 30) {
        var t = e.memoizedProps,
          n = kn(t, e.stateNode);
        ((t = Ln(t.default, t.update)),
          (e.flags &= -5),
          t !== 'none' && Ha(e, n, t, (e.memoizedState = []), !1));
      } else (e.subtreeFlags & 33554432) !== 0 && Im(e);
      e = e.sibling;
    }
  }
  function oo(e) {
    if ((e.subtreeFlags & 18874368) !== 0)
      for (e = e.child; e !== null;) {
        if (e.tag !== 22 || e.memoizedState === null) {
          if (e.tag === 30 && (e.flags & 18874368) !== 0) {
            var t = e.stateNode;
            t.paired !== null && ((t.paired = null), En(e.child, !1));
          }
          oo(e);
        }
        e = e.sibling;
      }
  }
  function Tc(e) {
    if (e.tag === 30) ((e.stateNode.paired = null), En(e.child, !1), oo(e));
    else if ((e.subtreeFlags & 33554432) !== 0)
      for (e = e.child; e !== null;) (Tc(e), (e = e.sibling));
    else oo(e);
  }
  function Jm(e) {
    for (e = e.child; e !== null;)
      (e.tag === 30 ? En(e.child, !1) : (e.subtreeFlags & 33554432) !== 0 && Jm(e),
        (e = e.sibling));
  }
  function fo(e, t, n, a, i, c, d) {
    for (var p = !1; t !== null;) {
      if (t.tag === 5) {
        var y = t.stateNode;
        if (c !== null && Ct < c.length) {
          var j = c[Ct],
            D = Go(y);
          (j.view || D.view) && (p = !0);
          var M;
          if ((M = (e.flags & 4) === 0))
            if (D.clip) M = !0;
            else {
              M = j.rect;
              var E = D.rect;
              M = M.y !== E.y || M.x !== E.x || M.height !== E.height || M.width !== E.width;
            }
          (M && (e.flags |= 4),
            D.abs
              ? (D = !j.abs)
              : ((j = j.rect), (D = D.rect), (D = j.height !== D.height || j.width !== D.width)),
            D && (e.flags |= 32));
        } else e.flags |= 32;
        ((e.flags & 4) !== 0 && $p(y, Ct === 0 ? n : n + '_' + Ct, i),
          (p && (e.flags & 4) !== 0) ||
            (Nn === null && (Nn = []), Nn.push(y, Ct === 0 ? a : a + '_' + Ct, t.memoizedProps)),
          Ct++);
      } else
        (t.tag !== 22 || t.memoizedState === null) &&
          (t.tag === 30 && d
            ? (e.flags |= t.flags & 32)
            : fo(e, t.child, n, a, i, c, d) && (p = !0));
      t = t.sibling;
    }
    return p;
  }
  function Fm(e, t) {
    for (e = e.child; e !== null;) {
      if (e.tag === 30) {
        var n = e.memoizedProps,
          a = e.stateNode,
          i = kn(n, a),
          c = Ln(n.default, n.update),
          d;
        ((d = e.memoizedState), (e.memoizedState = null), (a = e));
        var p = e.child;
        ((Ct = 0), (i = fo(a, p, i, i, c, d, !1)), (e.flags & 4) !== 0 && i && Xa(e, n.onUpdate));
      } else (e.subtreeFlags & 33554432) !== 0 && Fm(e);
      e = e.sibling;
    }
  }
  var ct = !1,
    je = !1,
    Tn = !1,
    ho = !1,
    Pm = typeof WeakSet == 'function' ? WeakSet : Set,
    rt = null,
    jn = !1,
    Qu = !1,
    jc = !1,
    mo = !1;
  function y1(e, t, n) {
    if (((e = e.containerInfo), (Lo = tu), (e = nh(e)), Wr(e))) {
      if ('selectionStart' in e) var a = { start: e.selectionStart, end: e.selectionEnd };
      else
        e: {
          a = ((a = e.ownerDocument) && a.defaultView) || window;
          var i = a.getSelection && a.getSelection();
          if (i && i.rangeCount !== 0) {
            a = i.anchorNode;
            var c = i.anchorOffset,
              d = i.focusNode;
            i = i.focusOffset;
            try {
              (a.nodeType, d.nodeType);
            } catch {
              a = null;
              break e;
            }
            var p = 0,
              y = -1,
              j = -1,
              D = 0,
              M = 0,
              E = e,
              C = null;
            t: for (;;) {
              for (
                var Y;
                E !== a || (c !== 0 && E.nodeType !== 3) || (y = p + c),
                  E !== d || (i !== 0 && E.nodeType !== 3) || (j = p + i),
                  E.nodeType === 3 && (p += E.nodeValue.length),
                  (Y = E.firstChild) !== null;
              )
                ((C = E), (E = Y));
              for (;;) {
                if (E === e) break t;
                if (
                  (C === a && ++D === c && (y = p),
                  C === d && ++M === i && (j = p),
                  (Y = E.nextSibling) !== null)
                )
                  break;
                ((E = C), (C = E.parentNode));
              }
              E = Y;
            }
            a = y === -1 || j === -1 ? null : { start: y, end: j };
          } else a = null;
        }
      a = a || { start: 0, end: 0 };
    } else a = null;
    for (
      Bo = { focusedElem: e, selectionRange: a },
        tu = !1,
        n = (n & 335544064) === n,
        rt = t,
        t = n ? 9270 : 1024;
      rt !== null;
    ) {
      if (((e = rt), n && ((a = e.deletions), a !== null)))
        for (c = 0; c < a.length; c++) n && so(a[c]);
      if (e.alternate === null && (e.flags & 2) !== 0) (n && Qm(e), xc(n));
      else {
        if (e.tag === 22) {
          if (((a = e.alternate), e.memoizedState !== null)) {
            (a !== null && a.memoizedState === null && n && so(a), xc(n));
            continue;
          } else if (a !== null && a.memoizedState !== null) {
            (n && Qm(e), xc(n));
            continue;
          }
        }
        ((a = e.child),
          (e.subtreeFlags & t) !== 0 && a !== null
            ? ((a.return = e), (rt = a))
            : (n && Im(e), xc(n)));
      }
    }
    Gt = null;
  }
  function xc(e) {
    for (; rt !== null;) {
      var t = rt,
        n = e,
        a = t.alternate,
        i = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if ((i & 1024) !== 0 && a !== null) {
            ((n = void 0), (i = a.memoizedProps), (a = a.memoizedState));
            var c = t.stateNode;
            try {
              var d = la(t.type, i);
              ((n = c.getSnapshotBeforeUpdate(d, a)), (c.__reactInternalSnapshotBeforeUpdate = n));
            } catch (p) {
              Ce(t, t.return, p);
            }
          }
          break;
        case 3:
          if ((i & 1024) !== 0) {
            if (((a = t.stateNode.containerInfo), (n = a.nodeType), n === 9)) $o(a);
            else if (n === 1)
              switch (a.nodeName) {
                case 'HEAD':
                case 'HTML':
                case 'BODY':
                  $o(a);
                  break;
                default:
                  a.textContent = '';
              }
          }
          break;
        case 5:
        case 26:
        case 27:
        case 6:
        case 4:
        case 17:
          break;
        case 30:
          n &&
            a !== null &&
            ((n = kn(a.memoizedProps, a.stateNode)),
            (i = t.memoizedProps),
            (i = Ln(i.default, i.update)),
            i !== 'none' && Ha(a, n, i, (a.memoizedState = []), !0));
          break;
        default:
          if ((i & 1024) !== 0) throw Error(s(163));
      }
      if (((a = t.sibling), a !== null)) {
        ((a.return = t.return), (rt = a));
        break;
      }
      rt = t.return;
    }
  }
  function Wm(e, t, n) {
    var a = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        (xn(e, n), a & 4 && Gu(5, n));
        break;
      case 1:
        if ((xn(e, n), a & 4))
          if (((e = n.stateNode), t === null))
            try {
              e.componentDidMount();
            } catch (d) {
              Ce(n, n.return, d);
            }
          else {
            var i = la(n.type, t.memoizedProps);
            t = t.memoizedState;
            try {
              e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
            } catch (d) {
              Ce(n, n.return, d);
            }
          }
        (a & 64 && qm(n), a & 512 && zn(n, n.return));
        break;
      case 3:
        if ((xn(e, n), a & 64 && ((e = n.updateQueue), e !== null))) {
          if (((t = null), n.child !== null))
            switch (n.child.tag) {
              case 27:
              case 5:
                t = n.child.stateNode;
                break;
              case 1:
                t = n.child.stateNode;
            }
          try {
            Ch(e, t);
          } catch (d) {
            Ce(n, n.return, d);
          }
        }
        break;
      case 27:
        t === null && a & 4 && Xm(n);
      case 26:
      case 5:
        (xn(e, n), t === null && a & 4 && lo(n), a & 512 && zn(n, n.return));
        break;
      case 12:
        xn(e, n);
        break;
      case 31:
        (xn(e, n), a & 4 && lp(e, n));
        break;
      case 13:
        (xn(e, n),
          a & 4 && ap(e, n),
          a & 64 &&
            ((e = n.memoizedState),
            e !== null && ((e = e.dehydrated), e !== null && ((n = A1.bind(null, n)), ob(e, n)))));
        break;
      case 22:
        if (((a = n.memoizedState !== null || ct), !a)) {
          var c = (t !== null && t.memoizedState !== null) || je;
          ((t = ct),
            (i = je),
            (ct = a),
            (je = c) && !i
              ? ((a = 2), (n.subtreeFlags & 8772) !== 0 && (a |= 1), dn(e, n, a))
              : xn(e, n),
            (ct = t),
            (je = i));
        }
        break;
      case 30:
        (xn(e, n), a & 512 && zn(n, n.return));
        break;
      case 7:
        a & 512 && zn(n, n.return);
      default:
        xn(e, n);
    }
  }
  function po(e, t) {
    for (e = e.child; e !== null;) (ep(e, t), (e = e.sibling));
  }
  function ep(e, t) {
    switch (e.tag) {
      case 5:
      case 26:
        try {
          var n = e.stateNode;
          if (t) {
            var a = n.style;
            typeof a.setProperty == 'function'
              ? a.setProperty('display', 'none', 'important')
              : (a.display = 'none');
          } else {
            var i = e.stateNode,
              c = e.memoizedProps.style,
              d = c != null && c.hasOwnProperty('display') ? c.display : null;
            i.style.display = d == null || typeof d == 'boolean' ? '' : ('' + d).trim();
          }
        } catch (y) {
          Ce(e, e.return, y);
        }
        vo(e, t);
        break;
      case 6:
        try {
          ((e.stateNode.nodeValue = t ? '' : e.memoizedProps), (ze = !0));
        } catch (y) {
          Ce(e, e.return, y);
        }
        break;
      case 18:
        try {
          var p = e.stateNode;
          t ? Qp(p, !0) : Qp(e.stateNode, !1);
        } catch (y) {
          Ce(e, e.return, y);
        }
        break;
      case 22:
      case 23:
        e.memoizedState === null && po(e, t);
        break;
      default:
        po(e, t);
    }
  }
  function vo(e, t) {
    if (e.subtreeFlags & 67108864)
      for (e = e.child; e !== null;) {
        e: {
          var n = e,
            a = t;
          switch (n.tag) {
            case 4:
              ep(n, a);
              break e;
            case 22:
              n.memoizedState === null && vo(n, a);
              break e;
            default:
              vo(n, a);
          }
        }
        e = e.sibling;
      }
  }
  function tp(e) {
    var t = e.alternate;
    (t !== null && ((e.alternate = null), tp(t)),
      (e.child = null),
      (e.deletions = null),
      (e.sibling = null),
      e.tag === 5 && ((t = e.stateNode), t !== null && wi(t)),
      (e.stateNode = null),
      (e.return = null),
      (e.dependencies = null),
      (e.memoizedProps = null),
      (e.memoizedState = null),
      (e.pendingProps = null),
      (e.stateNode = null),
      (e.updateQueue = null));
  }
  var He = null,
    Dt = !1;
  function on(e, t, n) {
    for (n = n.child; n !== null;) (np(e, t, n), (n = n.sibling));
  }
  function np(e, t, n) {
    if (Lt && typeof Lt.onCommitFiberUnmount == 'function')
      try {
        Lt.onCommitFiberUnmount(pu, n);
      } catch {}
    switch (n.tag) {
      case 26:
        (je || mt(n, t),
          on(e, t, n),
          n.memoizedState
            ? n.memoizedState.count--
            : n.stateNode && !je && ((n = n.stateNode), n.parentNode.removeChild(n)));
        break;
      case 27:
        (je || mt(n, t), Xu(n));
        var a = He,
          i = Dt;
        (Nl(n.type) && ((He = n.stateNode), (Dt = !1)),
          on(e, t, n),
          iv(n.stateNode, n.type, n.memoizedProps),
          (He = a),
          (Dt = i));
        break;
      case 5:
        (je || mt(n, t), Xu(n));
      case 6:
        if (
          (n.tag === 6 && Xu(n),
          (a = He),
          (i = Dt),
          (He = null),
          on(e, t, n),
          (He = a),
          (Dt = i),
          He !== null)
        )
          if (Dt)
            try {
              ((He.nodeType === 9
                ? He.body
                : He.nodeName === 'HTML'
                  ? He.ownerDocument.body
                  : He
              ).removeChild(n.stateNode),
                (ze = !0));
            } catch (c) {
              Ce(n, t, c);
            }
          else
            try {
              (He.removeChild(n.stateNode), (ze = !0));
            } catch (c) {
              Ce(n, t, c);
            }
        break;
      case 18:
        He !== null &&
          (Dt
            ? ((e = He),
              Xp(
                e.nodeType === 9 ? e.body : e.nodeName === 'HTML' ? e.ownerDocument.body : e,
                n.stateNode,
              ),
              nu(e))
            : Xp(He, n.stateNode));
        break;
      case 4:
        ((a = He),
          (i = Dt),
          (He = n.stateNode.containerInfo),
          (Dt = !0),
          on(e, t, n),
          (He = a),
          (Dt = i));
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        (vl(2, n, t), je || vl(4, n, t), on(e, t, n));
        break;
      case 1:
        (je ||
          (mt(n, t), (a = n.stateNode), typeof a.componentWillUnmount == 'function' && Ym(n, t, a)),
          on(e, t, n));
        break;
      case 21:
        on(e, t, n);
        break;
      case 22:
        ((je = (a = je) || n.memoizedState !== null), on(e, t, n), (je = a));
        break;
      case 30:
        (mt(n, t), on(e, t, n));
        break;
      case 7:
        (je || mt(n, t), on(e, t, n));
        break;
      default:
        on(e, t, n);
    }
  }
  function lp(e, t) {
    if (
      t.memoizedState === null &&
      ((e = t.alternate), e !== null && ((e = e.memoizedState), e !== null))
    ) {
      e = e.dehydrated;
      try {
        nu(e);
      } catch (n) {
        Ce(t, t.return, n);
      }
    }
  }
  function ap(e, t) {
    if (
      t.memoizedState === null &&
      ((e = t.alternate),
      e !== null && ((e = e.memoizedState), e !== null && ((e = e.dehydrated), e !== null)))
    )
      try {
        nu(e);
      } catch (n) {
        Ce(t, t.return, n);
      }
  }
  function g1(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return (t === null && (t = e.stateNode = new Pm()), t);
      case 22:
        return (
          (e = e.stateNode),
          (t = e._retryCache),
          t === null && (t = e._retryCache = new Pm()),
          t
        );
      default:
        throw Error(s(435, e.tag));
    }
  }
  function Oc(e, t) {
    var n = g1(e);
    t.forEach(function (a) {
      if (!n.has(a)) {
        n.add(a);
        var i = C1.bind(null, e, a);
        a.then(i, i);
      }
    });
  }
  function Et(e, t, n) {
    var a = t.deletions;
    if (a !== null)
      for (var i = 0; i < a.length; i++) {
        var c = a[i],
          d = e,
          p = t,
          y = p;
        e: for (; y !== null;) {
          switch (y.tag) {
            case 27:
              if (Nl(y.type)) {
                ((He = y.stateNode), (Dt = !1));
                break e;
              }
              break;
            case 5:
              ((He = y.stateNode), (Dt = !1));
              break e;
            case 3:
            case 4:
              ((He = y.stateNode.containerInfo), (Dt = !0));
              break e;
          }
          y = y.return;
        }
        if (He === null) throw Error(s(160));
        (np(d, p, c),
          (He = null),
          (Dt = !1),
          (d = c.alternate),
          d !== null && (d.return = null),
          (c.return = null));
      }
    if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) (up(t, e, n), (t = t.sibling));
  }
  var fn = null;
  function up(e, t, n) {
    var a = e.alternate,
      i = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (i & 4 && ((a = e.updateQueue), (a = a !== null ? a.events : null), a !== null))
          for (var c = 0; c < a.length; c++) {
            var d = a[c];
            d.ref.impl = d.nextImpl;
          }
        (Et(t, e, n), Tt(e), i & 4 && (vl(3, e, e.return), Gu(3, e), vl(5, e, e.return)));
        break;
      case 1:
        (Et(t, e, n),
          Tt(e),
          i & 512 && (je || a === null || mt(a, a.return)),
          i & 64 &&
            ct &&
            ((e = e.updateQueue),
            e !== null &&
              ((t = e.callbacks),
              t !== null &&
                ((n = e.shared.hiddenCallbacks),
                (e.shared.hiddenCallbacks = n === null ? t : n.concat(t))))));
        break;
      case 26:
        if (((c = fn), Et(t, e, n), Tt(e), i & 512 && (je || a === null || mt(a, a.return)), i & 4))
          if (((i = a !== null ? a.memoizedState : null), (n = e.memoizedState), a === null))
            if (n === null)
              if (e.stateNode === null)
                if (ct) e.stateNode = Yp(e.type, e.memoizedProps, t.containerInfo, e);
                else {
                  e: {
                    ((t = e.type), (n = e.memoizedProps), (i = c.ownerDocument || c));
                    t: switch (t) {
                      case 'title':
                        ((a = i.getElementsByTagName('title')[0]),
                          (!a ||
                            a[gu] ||
                            a[ot] ||
                            a.namespaceURI === 'http://www.w3.org/2000/svg' ||
                            a.hasAttribute('itemprop')) &&
                            ((a = i.createElement(t)),
                            i.head.insertBefore(a, i.querySelector('head > title'))),
                          pt(a, t, n),
                          (a[ot] = e),
                          ut(a),
                          (t = a));
                        break e;
                      case 'link':
                        if ((c = dv('link', 'href', i).get(t + (n.href || '')))) {
                          for (d = 0; d < c.length; d++)
                            if (
                              ((a = c[d]),
                              a.getAttribute('href') ===
                                (n.href == null || n.href === '' ? null : n.href) &&
                                a.getAttribute('rel') === (n.rel == null ? null : n.rel) &&
                                a.getAttribute('title') === (n.title == null ? null : n.title) &&
                                a.getAttribute('crossorigin') ===
                                  (n.crossOrigin == null ? null : n.crossOrigin))
                            ) {
                              c.splice(d, 1);
                              break t;
                            }
                        }
                        ((a = i.createElement(t)), pt(a, t, n), i.head.appendChild(a));
                        break;
                      case 'meta':
                        if ((c = dv('meta', 'content', i).get(t + (n.content || '')))) {
                          for (d = 0; d < c.length; d++)
                            if (
                              ((a = c[d]),
                              a.getAttribute('content') ===
                                (n.content == null ? null : '' + n.content) &&
                                a.getAttribute('name') === (n.name == null ? null : n.name) &&
                                a.getAttribute('property') ===
                                  (n.property == null ? null : n.property) &&
                                a.getAttribute('http-equiv') ===
                                  (n.httpEquiv == null ? null : n.httpEquiv) &&
                                a.getAttribute('charset') ===
                                  (n.charSet == null ? null : n.charSet))
                            ) {
                              c.splice(d, 1);
                              break t;
                            }
                        }
                        ((a = i.createElement(t)), pt(a, t, n), i.head.appendChild(a));
                        break;
                      default:
                        throw Error(s(468, t));
                    }
                    ((a[ot] = e), ut(a), (t = a));
                  }
                  e.stateNode = t;
                }
              else ct || ef(c, e.type, e.stateNode);
            else e.stateNode = fv(c, n, e.memoizedProps);
          else
            i !== n
              ? (i === null
                  ? ((t = a.stateNode), t === null || je || t.parentNode.removeChild(t))
                  : i.count--,
                n === null ? ct || ef(c, e.type, e.stateNode) : fv(c, n, e.memoizedProps))
              : n === null && e.stateNode !== null && ao(e, e.memoizedProps, a.memoizedProps);
        break;
      case 27:
        (Et(t, e, n),
          Tt(e),
          i & 512 && (je || a === null || mt(a, a.return)),
          a !== null && i & 4 && ao(e, e.memoizedProps, a.memoizedProps));
        break;
      case 5:
        if (
          ((c = Tn),
          (Tn = !1),
          Et(t, e, n),
          (Tn = c),
          Tt(e),
          i & 512 && (je || a === null || mt(a, a.return)),
          e.flags & 32)
        ) {
          t = e.stateNode;
          try {
            (ba(t, ''), (ze = !0));
          } catch (D) {
            Ce(e, e.return, D);
          }
        }
        (i & 4 &&
          e.stateNode != null &&
          ((t = e.memoizedProps), ao(e, t, a !== null ? a.memoizedProps : t)),
          i & 1024 && (ho = !0));
        break;
      case 6:
        if ((Et(t, e, n), Tt(e), i & 4)) {
          if (e.stateNode === null) throw Error(s(162));
          ((t = e.memoizedProps), (n = e.stateNode));
          try {
            ((n.nodeValue = t), (ze = !0));
          } catch (D) {
            Ce(e, e.return, D);
          }
        }
        break;
      case 3:
        if (
          ((ze = !1),
          (Vc = null),
          (c = fn),
          (fn = ti(t.containerInfo)),
          Et(t, e, n),
          (fn = c),
          Tt(e),
          i & 4 && a !== null && a.memoizedState.isDehydrated)
        )
          try {
            nu(t.containerInfo);
          } catch (D) {
            Ce(e, e.return, D);
          }
        (ho && ((ho = !1), ip(e)), (ze = !1));
        break;
      case 4:
        ((i = Tn),
          (Tn = ct),
          (a = jd()),
          (c = fn),
          (fn = ti(e.stateNode.containerInfo)),
          Et(t, e, n),
          Tt(e),
          (fn = c),
          ze && Qu && (jc = !0),
          (ze = a),
          (Tn = i));
        break;
      case 12:
        (Et(t, e, n), Tt(e));
        break;
      case 31:
        (Et(t, e, n),
          Tt(e),
          i & 4 && ((t = e.updateQueue), t !== null && ((e.updateQueue = null), Oc(e, t))));
        break;
      case 13:
        (Et(t, e, n),
          Tt(e),
          e.child.flags & 8192 &&
            (e.memoizedState !== null) != (a !== null && a.memoizedState !== null) &&
            (Dc = kt()),
          i & 4 && ((t = e.updateQueue), t !== null && ((e.updateQueue = null), Oc(e, t))));
        break;
      case 22:
        ((c = e.memoizedState !== null), (d = a !== null && a.memoizedState !== null));
        var p = ct,
          y = je,
          j = Tn;
        ((ct = p || c),
          (Tn = j || c),
          (je = y || d),
          Et(t, e, n),
          (je = y),
          (Tn = j),
          (ct = p),
          Tt(e),
          i & 8192 &&
            ((t = e.stateNode),
            (t._visibility = c ? t._visibility & -2 : t._visibility | 1),
            !c ||
              a === null ||
              d ||
              ct ||
              je ||
              ((t = d || je),
              (n = ct),
              (a = je),
              (ct = c || ct),
              (je = t),
              yl(e, 2),
              (ct = n),
              (je = a)),
            (!c && Tn) || po(e, c)),
          i & 4 &&
            ((t = e.updateQueue),
            t !== null && ((n = t.retryQueue), n !== null && ((t.retryQueue = null), Oc(e, n)))));
        break;
      case 19:
        (Et(t, e, n),
          Tt(e),
          i & 4 && ((t = e.updateQueue), t !== null && ((e.updateQueue = null), Oc(e, t))));
        break;
      case 30:
        (i & 512 && (je || a === null || mt(a, a.return)),
          (i = jd()),
          (c = Qu),
          (d = (n & 335544064) === n),
          (p = e.memoizedProps),
          (Qu = d && Ln(p.default, p.update) !== 'none'),
          Et(t, e, n),
          Tt(e),
          d && a !== null && ze && (e.flags |= 4),
          (Qu = c),
          (ze = i));
        break;
      case 21:
        break;
      case 7:
        (i & 512 && (je || a === null || mt(a, a.return)),
          a && a.stateNode !== null && (a.stateNode._fragmentFiber = e));
      default:
        (Et(t, e, n), Tt(e));
    }
  }
  function Tt(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var n, a = e.return; a !== null;) {
          if (Gm(a)) {
            n = a;
            break;
          }
          a = a.return;
        }
        a = null;
        for (var i = e.return; i !== null;) {
          if (no(i)) {
            var c = i.stateNode;
            a === null ? (a = [c]) : a.push(c);
          }
          if (to(i)) break;
          i = i.return;
        }
        var d = a;
        if (n == null) throw Error(s(160));
        switch (n.tag) {
          case 27:
            var p = n.stateNode,
              y = uo(e);
            zc(e, y, p, d);
            break;
          case 5:
            var j = n.stateNode;
            n.flags & 32 && (ba(j, ''), (n.flags &= -33));
            var D = uo(e);
            zc(e, D, j, d);
            break;
          case 3:
          case 4:
            var M = n.stateNode.containerInfo,
              E = uo(e);
            io(e, E, M, d);
            break;
          default:
            throw Error(s(161));
        }
      } catch (C) {
        Ce(e, e.return, C);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function ip(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null;) {
        var t = e;
        (ip(t),
          t.tag === 5 && t.flags & 1024 && ((t = t.stateNode), (tu = !0), t.reset(), (tu = !1)),
          (e = e.sibling));
      }
  }
  function ka(e, t) {
    if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) (cp(t, e), (t = t.sibling));
    else Fm(t);
  }
  function cp(e, t) {
    var n = e.alternate;
    if (n === null) co(e, !1);
    else
      switch (e.tag) {
        case 3:
          if (((mo = jn = !1), $m(), ka(t, e), !jn && !jc)) {
            if (((e = Nn), e !== null))
              for (var a = 0; a < e.length; a += 3) {
                n = e[a];
                var i = e[a + 1];
                (Kp(n, e[a + 2]),
                  (n = n.ownerDocument.documentElement),
                  n !== null &&
                    n.animate(
                      { opacity: [0, 0], pointerEvents: ['none', 'none'] },
                      {
                        duration: 0,
                        fill: 'forwards',
                        pseudoElement: '::view-transition-group(' + i + ')',
                      },
                    ));
              }
            ((e = t.containerInfo),
              (e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement),
              e !== null &&
                e.style.viewTransitionName === '' &&
                ((e.style.viewTransitionName = 'none'),
                e.animate(
                  { opacity: [0, 0], pointerEvents: ['none', 'none'] },
                  { duration: 0, fill: 'forwards', pseudoElement: '::view-transition-group(root)' },
                ),
                e.animate(
                  { width: [0, 0], height: [0, 0] },
                  { duration: 0, fill: 'forwards', pseudoElement: '::view-transition' },
                )),
              (mo = !0));
          }
          Nn = null;
          break;
        case 5:
          ka(t, e);
          break;
        case 4:
          ((a = jn), (jn = !1), ka(t, e), jn && (jc = !0), (jn = a));
          break;
        case 22:
          e.memoizedState === null && (n.memoizedState !== null ? co(e, !1) : ka(t, e));
          break;
        case 30:
          ((a = jn), (i = $m()), (jn = !1), ka(t, e), jn && (e.flags |= 4));
          var c = e.memoizedProps,
            d = e.stateNode;
          ((t = kn(c, d)), (d = kn(n.memoizedProps, d)));
          var p = Ln(c.default, c.update);
          (p === 'none'
            ? (t = !1)
            : ((c = n.memoizedState),
              (n.memoizedState = null),
              (n = e.child),
              (Ct = 0),
              (t = fo(e, n, t, d, p, c, !0)),
              Ct !== (c === null ? 0 : c.length) && (e.flags |= 32)),
            (e.flags & 4) !== 0 && t
              ? (Xa(e, e.memoizedProps.onUpdate), (Nn = i))
              : i !== null && (i.push.apply(i, Nn), (Nn = i)),
            (jn = (e.flags & 32) !== 0 ? !0 : a));
          break;
        default:
          ka(t, e);
      }
  }
  function xn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null;) (Wm(e, t.alternate, t), (t = t.sibling));
  }
  function yl(e, t) {
    for (e = e.child; e !== null;) {
      var n = e,
        a = t;
      switch (n.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          (vl(4, n, n.return), yl(n, a));
          break;
        case 1:
          mt(n, n.return);
          var i = n.stateNode;
          (typeof i.componentWillUnmount == 'function' && Ym(n, n.return, i), yl(n, a));
          break;
        case 27:
          (a & 2) !== 0 && iv(n.stateNode, n.type, n.memoizedProps);
        case 5:
          (mt(n, n.return), (n.tag !== 5 && n.tag !== 27) || Xu(n), yl(n, a));
          break;
        case 6:
          Xu(n);
          break;
        case 26:
          (mt(n, n.return),
            (i = n.stateNode),
            n.memoizedState !== null || i === null || je || i.parentNode.removeChild(i),
            yl(n, a));
          break;
        case 22:
          n.memoizedState === null && yl(n, a);
          break;
        case 30:
          (mt(n, n.return), yl(n, a));
          break;
        case 7:
          mt(n, n.return);
        default:
          yl(n, a);
      }
      e = e.sibling;
    }
  }
  function dn(e, t, n) {
    for (n = (t.subtreeFlags & 8772) !== 0 ? n : n & -2, t = t.child; t !== null;) {
      var a = t.alternate,
        i = e,
        c = t,
        d = c.flags,
        p = (n & 1) !== 0;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          (dn(i, c, n), Gu(4, c));
          break;
        case 1:
          if ((dn(i, c, n), (a = c), (i = a.stateNode), typeof i.componentDidMount == 'function'))
            try {
              i.componentDidMount();
            } catch (D) {
              Ce(a, a.return, D);
            }
          if (((a = c), (i = a.updateQueue), i !== null)) {
            var y = a.stateNode;
            try {
              var j = i.shared.hiddenCallbacks;
              if (j !== null)
                for (i.shared.hiddenCallbacks = null, i = 0; i < j.length; i++) Ah(j[i], y);
            } catch (D) {
              Ce(a, a.return, D);
            }
          }
          (p && d & 64 && qm(c), zn(c, c.return));
          break;
        case 27:
          (n & 2) !== 0 && Xm(c);
        case 5:
          ((c.tag !== 5 && c.tag !== 27) || Vm(c),
            dn(i, c, n),
            p && a === null && d & 4 && lo(c),
            zn(c, c.return));
          break;
        case 6:
          Vm(c);
          break;
        case 26:
          ((y = c.stateNode),
            c.memoizedState !== null || y === null || ct || ef(ti(y.ownerDocument), c.type, y),
            dn(i, c, n),
            p && a === null && d & 4 && lo(c),
            zn(c, c.return));
          break;
        case 12:
          dn(i, c, n);
          break;
        case 31:
          (dn(i, c, n), p && d & 4 && lp(i, c));
          break;
        case 13:
          (dn(i, c, n), p && d & 4 && ap(i, c));
          break;
        case 22:
          (c.memoizedState === null && dn(i, c, n), zn(c, c.return));
          break;
        case 30:
          (dn(i, c, n), zn(c, c.return));
          break;
        case 7:
          zn(c, c.return);
        default:
          dn(i, c, n);
      }
      t = t.sibling;
    }
  }
  function yo(e, t) {
    var n = null;
    (e !== null &&
      e.memoizedState !== null &&
      e.memoizedState.cachePool !== null &&
      (n = e.memoizedState.cachePool.pool),
      (e = null),
      t.memoizedState !== null &&
        t.memoizedState.cachePool !== null &&
        (e = t.memoizedState.cachePool.pool),
      e !== n && (e != null && e.refCount++, n != null && Du(n)));
  }
  function go(e, t) {
    ((e = null),
      t.alternate !== null && (e = t.alternate.memoizedState.cache),
      (t = t.memoizedState.cache),
      t !== e && (t.refCount++, e != null && Du(e)));
  }
  function ln(e, t, n, a) {
    var i = (n & 335544064) === n;
    if (t.subtreeFlags & (i ? 10262 : 10256))
      for (t = t.child; t !== null;) (rp(e, t, n, a), (t = t.sibling));
    else i && Jm(t);
  }
  function rp(e, t, n, a) {
    var i = (n & 335544064) === n;
    i && t.alternate === null && t.return !== null && t.return.alternate !== null && Tc(t);
    var c = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        (ln(e, t, n, a), c & 2048 && Gu(9, t));
        break;
      case 1:
        ln(e, t, n, a);
        break;
      case 3:
        (ln(e, t, n, a),
          i &&
            mo &&
            ((e = e.containerInfo),
            (e = e.nodeType === 9 ? e.body : e.nodeName === 'HTML' ? e.ownerDocument.body : e),
            e.style.viewTransitionName === 'root' && (e.style.viewTransitionName = ''),
            (e = e.ownerDocument.documentElement),
            e !== null &&
              e.style.viewTransitionName === 'none' &&
              (e.style.viewTransitionName = '')),
          c & 2048 &&
            ((c = null),
            t.alternate !== null && (c = t.alternate.memoizedState.cache),
            (t = t.memoizedState.cache),
            t !== c && (t.refCount++, c != null && Du(c))));
        break;
      case 12:
        if (c & 2048) {
          (ln(e, t, n, a), (c = t.stateNode));
          try {
            var d = t.memoizedProps,
              p = d.id,
              y = d.onPostCommit;
            typeof y == 'function' &&
              y(p, t.alternate === null ? 'mount' : 'update', c.passiveEffectDuration, -0);
          } catch (j) {
            Ce(t, t.return, j);
          }
        } else ln(e, t, n, a);
        break;
      case 31:
        ln(e, t, n, a);
        break;
      case 13:
        ln(e, t, n, a);
        break;
      case 23:
        break;
      case 22:
        ((d = t.stateNode),
          (p = t.alternate),
          t.memoizedState !== null
            ? (i && p !== null && p.memoizedState === null && Tc(p),
              d._visibility & 2 ? ln(e, t, n, a) : $u(e, t))
            : (i && p !== null && p.memoizedState !== null && Tc(t),
              d._visibility & 2
                ? ln(e, t, n, a)
                : ((d._visibility |= 2), La(e, t, n, a, (t.subtreeFlags & 10256) !== 0 || !1))),
          c & 2048 && yo(p, t));
        break;
      case 24:
        (ln(e, t, n, a), c & 2048 && go(t.alternate, t));
        break;
      case 30:
        (i && ((c = t.alternate), c !== null && (En(c.child, !0), En(t.child, !0))),
          ln(e, t, n, a));
        break;
      default:
        ln(e, t, n, a);
    }
  }
  function La(e, t, n, a, i) {
    for (i = i && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null;) {
      var c = e,
        d = t,
        p = n,
        y = a,
        j = d.flags;
      switch (d.tag) {
        case 0:
        case 11:
        case 15:
          (La(c, d, p, y, i), Gu(8, d));
          break;
        case 23:
          break;
        case 22:
          var D = d.stateNode;
          (d.memoizedState !== null
            ? D._visibility & 2
              ? La(c, d, p, y, i)
              : $u(c, d)
            : ((D._visibility |= 2), La(c, d, p, y, i)),
            i && j & 2048 && yo(d.alternate, d));
          break;
        case 24:
          (La(c, d, p, y, i), i && j & 2048 && go(d.alternate, d));
          break;
        default:
          La(c, d, p, y, i);
      }
      t = t.sibling;
    }
  }
  function $u(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null;) {
        var n = e,
          a = t,
          i = a.flags;
        switch (a.tag) {
          case 22:
            ($u(n, a), i & 2048 && yo(a.alternate, a));
            break;
          case 24:
            ($u(n, a), i & 2048 && go(a.alternate, a));
            break;
          default:
            $u(n, a);
        }
        t = t.sibling;
      }
  }
  var aa = 8192;
  function ua(e, t, n) {
    if (e.subtreeFlags & aa) for (e = e.child; e !== null;) (sp(e, t, n), (e = e.sibling));
  }
  function sp(e, t, n) {
    switch (e.tag) {
      case 26:
        (ua(e, t, n),
          e.flags & aa &&
            (e.memoizedState !== null
              ? Eb(n, fn, e.memoizedState, e.memoizedProps)
              : ((e = e.stateNode), (t & 335544128) === t && vv(n, e))));
        break;
      case 5:
        (ua(e, t, n), e.flags & aa && ((e = e.stateNode), (t & 335544128) === t && vv(n, e)));
        break;
      case 3:
      case 4:
        var a = fn;
        ((fn = ti(e.stateNode.containerInfo)), ua(e, t, n), (fn = a));
        break;
      case 22:
        e.memoizedState === null &&
          ((a = e.alternate),
          a !== null && a.memoizedState !== null
            ? ((a = aa), (aa = 16777216), ua(e, t, n), (aa = a))
            : ua(e, t, n));
        break;
      case 30:
        if ((e.flags & aa) !== 0 && ((a = e.memoizedProps.name), a != null && a !== 'auto')) {
          var i = e.stateNode;
          ((i.paired = null), Gt === null && (Gt = new Map()), Gt.set(a, i));
        }
        ua(e, t, n);
        break;
      default:
        ua(e, t, n);
    }
  }
  function op(e) {
    var t = e.alternate;
    if (t !== null && ((e = t.child), e !== null)) {
      t.child = null;
      do ((t = e.sibling), (e.sibling = null), (e = t));
      while (e !== null);
    }
  }
  function Ku(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var a = t[n];
          ((rt = a), dp(a, e));
        }
      op(e);
    }
    if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) (fp(e), (e = e.sibling));
  }
  function fp(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        (Ku(e), e.flags & 2048 && vl(9, e, e.return));
        break;
      case 3:
        Ku(e);
        break;
      case 12:
        Ku(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13)
          ? ((t._visibility &= -3), Ac(e))
          : Ku(e);
        break;
      default:
        Ku(e);
    }
  }
  function Ac(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var a = t[n];
          ((rt = a), dp(a, e));
        }
      op(e);
    }
    for (e = e.child; e !== null;) {
      switch (((t = e), t.tag)) {
        case 0:
        case 11:
        case 15:
          (vl(8, t, t.return), Ac(t));
          break;
        case 22:
          ((n = t.stateNode), n._visibility & 2 && ((n._visibility &= -3), Ac(t)));
          break;
        default:
          Ac(t);
      }
      e = e.sibling;
    }
  }
  function dp(e, t) {
    for (; rt !== null;) {
      var n = rt;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          vl(8, n, t);
          break;
        case 23:
        case 22:
          if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
            var a = n.memoizedState.cachePool.pool;
            a != null && a.refCount++;
          }
          break;
        case 24:
          Du(n.memoizedState.cache);
      }
      if (((a = n.child), a !== null)) ((a.return = n), (rt = a));
      else
        e: for (n = e; rt !== null;) {
          a = rt;
          var i = a.sibling,
            c = a.return;
          if ((tp(a), a === n)) {
            rt = null;
            break e;
          }
          if (i !== null) {
            ((i.return = c), (rt = i));
            break e;
          }
          rt = c;
        }
    }
  }
  var b1 = {
      getCacheForType: function (e) {
        var t = ft(Je),
          n = t.data.get(e);
        return (n === void 0 && ((n = e()), t.data.set(e, n)), n);
      },
      cacheSignal: function () {
        return ft(Je).controller.signal;
      },
    },
    _1 = typeof WeakMap == 'function' ? WeakMap : Map,
    Ee = 0,
    Re = null,
    he = null,
    ve = 0,
    Ae = 0,
    Xt = null,
    gl = !1,
    Ba = !1,
    bo = !1,
    Kn = 0,
    Xe = 0,
    bl = 0,
    ia = 0,
    Cc = 0,
    Qt = 0,
    qa = 0,
    Iu = null,
    wt = null,
    _o = !1,
    Dc = 0,
    hp = 0,
    wc = 1 / 0,
    Rc = null,
    _l = null,
    Le = 0,
    hn = null,
    ca = null,
    On = 0,
    So = 0,
    zo = null,
    mp = null,
    Ya = null,
    Va = null,
    Ga = null,
    Ju = 0,
    Mc = null;
  function $t() {
    return (Ee & 2) !== 0 && ve !== 0 ? ve & -ve : K.T !== null ? wo() : yd();
  }
  function pp() {
    if (Qt === 0)
      if ((ve & 536870912) === 0 || oe) {
        var e = Oi;
        ((Oi <<= 1), (Oi & 3932160) === 0 && (Oi = 262144), (Qt = e));
      } else Qt = 536870912;
    return ((e = dt.current), e !== null && (e.flags |= 32), Qt);
  }
  function Xa(e, t) {
    if (t != null) {
      var n = e.stateNode,
        a = n.ref;
      (a === null && (a = n.ref = Ip(kn(e.memoizedProps, n))),
        Va === null && (Va = []),
        Va.push(t.bind(null, a)));
    }
  }
  function Rt(e, t, n) {
    (((e === Re && (Ae === 2 || Ae === 9)) || e.cancelPendingCommit !== null) &&
      (Qa(e, 0), Sl(e, ve, Qt, !1)),
      yu(e, n),
      ((Ee & 2) === 0 || e !== Re) &&
        (e === Re && ((Ee & 2) === 0 && (ia |= n), Xe === 4 && Sl(e, ve, Qt, !1)), An(e)));
  }
  function vp(e, t, n) {
    if ((Ee & 6) !== 0) throw Error(s(327));
    var a = (!n && (t & 127) === 0 && (t & e.expiredLanes) === 0) || vu(e, t),
      i = a ? N1(e, t) : Eo(e, t, !0),
      c = a;
    do {
      if (i === 0) {
        Ba && !a && Sl(e, t, 0, !1);
        break;
      } else {
        if (((n = e.current.alternate), c && !S1(n))) {
          ((i = Eo(e, t, !1)), (c = !1));
          continue;
        }
        if (i === 2) {
          if (((c = t), e.errorRecoveryDisabledLanes & c)) var d = 0;
          else
            ((d = e.pendingLanes & -536870913), (d = d !== 0 ? d : d & 536870912 ? 536870912 : 0));
          if (d !== 0) {
            t = d;
            e: {
              var p = e;
              i = Iu;
              var y = p.current.memoizedState.isDehydrated;
              if ((y && (Qa(p, d).flags |= 256), (d = Eo(p, d, !1)), d !== 2 && d !== 6)) {
                if (bo && !y) {
                  ((p.errorRecoveryDisabledLanes |= c), (ia |= c), (i = 4));
                  break e;
                }
                ((c = wt), (wt = i), c !== null && (wt === null ? (wt = c) : wt.push.apply(wt, c)));
              }
              i = d;
            }
            if (((c = !1), i !== 2)) continue;
          }
        }
        if (i === 1) {
          (Qa(e, 0), Sl(e, t, 0, !0));
          break;
        }
        e: {
          switch (((a = e), (c = i), c)) {
            case 0:
            case 1:
              throw Error(s(345));
            case 4:
              if ((t & 4194048) !== t && (t & 62914560) !== t) break;
            case 6:
              Sl(a, t, Qt, !gl);
              break e;
            case 2:
              wt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(s(329));
          }
          if ((t & 62914560) === t && ((i = Dc + 300 - kt()), 10 < i)) {
            if ((Sl(a, t, Qt, !gl), Ci(a, 0, !0) !== 0)) break e;
            ((On = t),
              (a.timeoutHandle = Vo(
                yp.bind(null, a, n, wt, Rc, _o, t, Qt, ia, qa, gl, c, 'Throttled', -0, 0),
                i,
              )));
            break e;
          }
          yp(a, n, wt, Rc, _o, t, Qt, ia, qa, gl, c, null, -0, 0);
        }
      }
      break;
    } while (!0);
    An(e);
  }
  function yp(e, t, n, a, i, c, d, p, y, j, D, M, E, C) {
    e.timeoutHandle = -1;
    var Y = t.subtreeFlags,
      Q = (c & 335544064) === c;
    if (
      ((M = null),
      (Q || Y & 8192 || (Y & 16785408) === 16785408) &&
        ((M = {
          stylesheets: null,
          count: 0,
          imgCount: 0,
          imgBytes: 0,
          suspenseyImages: [],
          waitingForImages: !0,
          waitingForViewTransition: !1,
          unsuspend: bn,
        }),
        (Gt = null),
        sp(t, c, M),
        Q &&
          ((Y = M),
          (Q = e.containerInfo),
          (Q = (Q.nodeType === 9 ? Q : Q.ownerDocument).__reactViewTransition),
          Q != null &&
            (Y.count++,
            (Y.waitingForViewTransition = !0),
            (Y = ai.bind(Y)),
            Q.finished.then(Y, Y))),
        (Y = (c & 62914560) === c ? Dc - kt() : (c & 4194048) === c ? hp - kt() : 0),
        (Y = Tb(M, Y)),
        Y !== null))
    ) {
      ((On = c),
        (e.cancelPendingCommit = Y(Tp.bind(null, e, t, c, n, a, i, d, p, y, j, D, M, null, E, C))),
        Sl(e, c, d, !j));
      return;
    }
    Tp(e, t, c, n, a, i, d, p, y, j, D, M);
  }
  function S1(e) {
    for (var t = e; ;) {
      var n = t.tag;
      if (
        (n === 0 || n === 11 || n === 15) &&
        t.flags & 16384 &&
        ((n = t.updateQueue), n !== null && ((n = n.stores), n !== null))
      )
        for (var a = 0; a < n.length; a++) {
          var i = n[a],
            c = i.getSnapshot;
          i = i.value;
          try {
            if (!Yt(c(), i)) return !1;
          } catch {
            return !1;
          }
        }
      if (((n = t.child), t.subtreeFlags & 16384 && n !== null)) ((n.return = t), (t = n));
      else {
        if (t === e) break;
        for (; t.sibling === null;) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        ((t.sibling.return = t.return), (t = t.sibling));
      }
    }
    return !0;
  }
  function Sl(e, t, n, a) {
    ((t = dd(e, t)),
      (t &= ~Cc),
      (t &= ~ia),
      (e.suspendedLanes |= t),
      (e.pingedLanes &= ~t),
      a && (e.warmLanes |= t),
      (a = e.expirationTimes));
    for (var i = t; 0 < i;) {
      var c = 31 - Bt(i),
        d = 1 << c;
      ((a[c] = -1), (i &= ~d));
    }
    n !== 0 && md(e, n, t);
  }
  function Uc() {
    return (Ee & 6) === 0 ? (Fu(0), !1) : !0;
  }
  function No() {
    if (he !== null) {
      if (Ae === 0) var e = he.return;
      else ((e = he), (Yn = Kl = null), Cs(e), (wa = null), (Mu = 0), (e = he));
      for (; e !== null;) (Bm(e.alternate, e), (e = e.return));
      he = null;
    }
  }
  function Qa(e, t) {
    var n = e.timeoutHandle;
    return (
      n !== -1 && ((e.timeoutHandle = -1), X1(n)),
      (n = e.cancelPendingCommit),
      n !== null && ((e.cancelPendingCommit = null), n()),
      (On = 0),
      No(),
      (Re = e),
      (he = n = Bn(e.current, null)),
      (ve = t),
      (Ae = 0),
      (Xt = null),
      (gl = !1),
      (Ba = vu(e, t)),
      (bo = !1),
      (qa = Qt = Cc = ia = bl = Xe = 0),
      (wt = Iu = null),
      (_o = !1),
      (Kn = dd(e, t)),
      Vi(),
      n
    );
  }
  function gp(e, t) {
    ((ie = null),
      (K.H = mc),
      t === Da || t === ec
        ? ((t = Th()), (Ae = 3))
        : t === ys
          ? ((t = Th()), (Ae = 4))
          : (Ae =
              t === Xs
                ? 8
                : t !== null && typeof t == 'object' && typeof t.then == 'function'
                  ? 6
                  : 1),
      (Xt = t),
      he === null && ((Xe = 1), pc(e, Wt(t, e.current))));
  }
  function bp() {
    var e = dt.current;
    return e === null
      ? !0
      : (ve & 4194048) === ve
        ? _t === null
        : (ve & 62914560) === ve || (ve & 536870912) !== 0
          ? e === _t
          : !1;
  }
  function _p() {
    var e = K.H;
    return ((K.H = mc), e === null ? mc : e);
  }
  function Sp() {
    var e = K.A;
    return ((K.A = b1), e);
  }
  function Zc() {
    ((Xe = 4),
      gl || ((ve & 4194048) !== ve && dt.current !== null) || (Ba = !0),
      ((bl & 134217727) === 0 && (ia & 134217727) === 0) || Re === null || Sl(Re, ve, Qt, !1));
  }
  function Eo(e, t, n) {
    var a = Ee;
    Ee |= 2;
    var i = _p(),
      c = Sp();
    ((Re !== e || ve !== t) && ((Rc = null), Qa(e, t)), (t = !1));
    var d = Xe;
    e: do
      try {
        if (Ae !== 0 && he !== null) {
          var p = he,
            y = Xt;
          switch (Ae) {
            case 8:
              (No(), (d = 6));
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              dt.current === null && (t = !0);
              var j = Ae;
              if (((Ae = 0), (Xt = null), $a(e, p, y, j), n && Ba)) {
                d = 0;
                break e;
              }
              break;
            default:
              ((j = Ae), (Ae = 0), (Xt = null), $a(e, p, y, j));
          }
        }
        (z1(), (d = Xe));
        break;
      } catch (D) {
        gp(e, D);
      }
    while (!0);
    return (
      t && e.shellSuspendCounter++,
      (Yn = Kl = null),
      (Ee = a),
      (K.H = i),
      (K.A = c),
      he === null && ((Re = null), (ve = 0), Vi()),
      d
    );
  }
  function z1() {
    for (; he !== null;) zp(he);
  }
  function N1(e, t) {
    var n = Ee;
    Ee |= 2;
    var a = _p(),
      i = Sp();
    Re !== e || ve !== t ? ((Rc = null), (wc = kt() + 500), Qa(e, t)) : (Ba = vu(e, t));
    e: do
      try {
        if (Ae !== 0 && he !== null) {
          t = he;
          var c = Xt;
          t: switch (Ae) {
            case 1:
              ((Ae = 0), (Xt = null), $a(e, t, c, 1));
              break;
            case 2:
            case 9:
              if (Nh(c)) {
                ((Ae = 0), (Xt = null), Np(t));
                break;
              }
              ((t = function () {
                ((Ae !== 2 && Ae !== 9) || Re !== e || (Ae = 7), An(e));
              }),
                c.then(t, t));
              break e;
            case 3:
              Ae = 7;
              break e;
            case 4:
              Ae = 5;
              break e;
            case 7:
              Nh(c) ? ((Ae = 0), (Xt = null), Np(t)) : ((Ae = 0), (Xt = null), $a(e, t, c, 7));
              break;
            case 5:
              var d = null;
              switch (he.tag) {
                case 26:
                  d = he.memoizedState;
                case 5:
                case 27:
                  var p = he;
                  if (d ? mv(d) : p.stateNode.complete) {
                    ((Ae = 0), (Xt = null));
                    var y = p.sibling;
                    if (y !== null) he = y;
                    else {
                      var j = p.return;
                      j !== null ? ((he = j), Hc(j)) : (he = null);
                    }
                    break t;
                  }
              }
              ((Ae = 0), (Xt = null), $a(e, t, c, 5));
              break;
            case 6:
              ((Ae = 0), (Xt = null), $a(e, t, c, 6));
              break;
            case 8:
              (No(), (Xe = 6));
              break e;
            default:
              throw Error(s(462));
          }
        }
        E1();
        break;
      } catch (D) {
        gp(e, D);
      }
    while (!0);
    return (
      (Yn = Kl = null),
      (K.H = a),
      (K.A = i),
      (Ee = n),
      he !== null ? 0 : ((Re = null), (ve = 0), Vi(), Xe)
    );
  }
  function E1() {
    for (; he !== null && !q0();) zp(he);
  }
  function zp(e) {
    var t = km(e.alternate, e, Kn);
    ((e.memoizedProps = e.pendingProps), t === null ? Hc(e) : (he = t));
  }
  function Np(e) {
    var t = e,
      n = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = Dm(n, t, t.pendingProps, t.type, void 0, ve);
        break;
      case 11:
        t = Dm(n, t, t.pendingProps, t.type.render, t.ref, ve);
        break;
      case 5:
        Cs(t);
        var a = t;
        a === it &&
          (oe
            ? (Ii(a), a.tag === 5 && a.stateNode != null && (Ue = a.stateNode))
            : (Ii(a), (oe = !0)));
      default:
        (Bm(n, t), (t = he = dh(t, Kn)), (t = km(n, t, Kn)));
    }
    ((e.memoizedProps = e.pendingProps), t === null ? Hc(e) : (he = t));
  }
  function $a(e, t, n, a) {
    ((Yn = Kl = null), Cs(t), (wa = null), (Mu = 0));
    var i = t.return;
    try {
      if (f1(e, i, t, n, ve)) {
        ((Xe = 1), pc(e, Wt(n, e.current)), (he = null));
        return;
      }
    } catch (c) {
      if (i !== null) throw ((he = i), c);
      ((Xe = 1), pc(e, Wt(n, e.current)), (he = null));
      return;
    }
    t.flags & 32768
      ? (oe || a === 1
          ? (e = !0)
          : Ba || (ve & 536870912) !== 0
            ? (e = !1)
            : ((gl = e = !0),
              (a === 2 || a === 9 || a === 3 || a === 6) &&
                ((a = dt.current), a !== null && a.tag === 13 && (a.flags |= 16384))),
        Ep(t, e))
      : Hc(t);
  }
  function Hc(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        Ep(t, gl);
        return;
      }
      e = t.return;
      var n = p1(t.alternate, t, Kn);
      if (n !== null) {
        he = n;
        return;
      }
      if (((t = t.sibling), t !== null)) {
        he = t;
        return;
      }
      he = t = e;
    } while (t !== null);
    Xe === 0 && (Xe = 5);
  }
  function Ep(e, t) {
    do {
      var n = v1(e.alternate, e);
      if (n !== null) {
        ((n.flags &= 32767), (he = n));
        return;
      }
      if (
        ((n = e.return),
        n !== null && ((n.flags |= 32768), (n.subtreeFlags = 0), (n.deletions = null)),
        !t && ((e = e.sibling), e !== null))
      ) {
        he = e;
        return;
      }
      he = e = n;
    } while (e !== null);
    ((Xe = 6), (he = null));
  }
  function Tp(e, t, n, a, i, c, d, p, y, j, D, M) {
    e.cancelPendingCommit = null;
    do kc();
    while (Le !== 0);
    if ((Ee & 6) !== 0) throw Error(s(327));
    if (t !== null) {
      if (t === e.current) throw Error(s(177));
      (e === Re && ((he = Re = null), (ve = 0)),
        (ca = t),
        (hn = e),
        (On = n),
        (zo = i),
        (mp = a),
        T1(e, t, n, d, p, y, M));
    }
  }
  function T1(e, t, n, a, i, c, d) {
    var p = t.lanes | t.childLanes;
    if (
      ((So = p),
      (p |= as),
      F0(e, n, p, a, i, c),
      (Va = null),
      (n & 335544064) === n ? ((Ga = Wg(e)), (a = 10262)) : ((Ga = null), (a = 10256)),
      (t.subtreeFlags & a) !== 0 || (t.flags & a) !== 0
        ? ((e.callbackNode = null),
          (e.callbackPriority = 0),
          D1(ji, function () {
            return (Oo(), null);
          }))
        : ((e.callbackNode = null), (e.callbackPriority = 0)),
      (Nc = !1),
      (a = (t.flags & 13878) !== 0),
      (t.subtreeFlags & 13878) !== 0 || a)
    ) {
      ((a = K.T), (K.T = null), (i = ne.p), (ne.p = 2), (c = Ee), (Ee |= 4));
      try {
        y1(e, t, n);
      } finally {
        ((Ee = c), (ne.p = i), (K.T = a));
      }
    }
    ((Le = 1), Nc ? (Ya = F1(d, e.containerInfo, Ga, To, jo, x1, xo, Oo, j1)) : (To(), jo(), xo()));
  }
  function j1(e) {
    if (Le !== 0) {
      var t = hn.onRecoverableError;
      t(e, { componentStack: null });
    }
  }
  function x1() {
    Le === 3 && ((Le = 0), cp(ca, hn), (Le = 4));
  }
  function To() {
    if (Le === 1) {
      Le = 0;
      var e = hn,
        t = ca,
        n = On,
        a = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || a) {
        ((a = K.T), (K.T = null));
        var i = ne.p;
        ne.p = 2;
        var c = Ee;
        Ee |= 4;
        try {
          ((Qu = jc = !1), up(t, e, n), (n = Bo));
          var d = nh(e.containerInfo),
            p = n.focusedElem,
            y = n.selectionRange;
          if (d !== p && p && p.ownerDocument && th(p.ownerDocument.documentElement, p)) {
            if (y !== null && Wr(p)) {
              var j = y.start,
                D = y.end;
              if ((D === void 0 && (D = j), 'selectionStart' in p))
                ((p.selectionStart = j), (p.selectionEnd = Math.min(D, p.value.length)));
              else {
                var M = p.ownerDocument || document,
                  E = (M && M.defaultView) || window;
                if (E.getSelection) {
                  var C = E.getSelection(),
                    Y = p.textContent.length,
                    Q = Math.min(y.start, Y),
                    ce = y.end === void 0 ? Q : Math.min(y.end, Y);
                  !C.extend && Q > ce && ((d = ce), (ce = Q), (Q = d));
                  var T = eh(p, Q),
                    z = eh(p, ce);
                  if (
                    T &&
                    z &&
                    (C.rangeCount !== 1 ||
                      C.anchorNode !== T.node ||
                      C.anchorOffset !== T.offset ||
                      C.focusNode !== z.node ||
                      C.focusOffset !== z.offset)
                  ) {
                    var O = M.createRange();
                    (O.setStart(T.node, T.offset),
                      C.removeAllRanges(),
                      Q > ce
                        ? (C.addRange(O), C.extend(z.node, z.offset))
                        : (O.setEnd(z.node, z.offset), C.addRange(O)));
                  }
                }
              }
            }
            for (M = [], C = p; (C = C.parentNode);)
              C.nodeType === 1 && M.push({ element: C, left: C.scrollLeft, top: C.scrollTop });
            for (typeof p.focus == 'function' && p.focus(), p = 0; p < M.length; p++) {
              var R = M[p];
              ((R.element.scrollLeft = R.left), (R.element.scrollTop = R.top));
            }
          }
          ((tu = !!Lo), (Bo = Lo = null));
        } finally {
          ((Ee = c), (ne.p = i), (K.T = a));
        }
      }
      ((e.current = t), (Le = 2));
    }
  }
  function jo() {
    if (Le === 2) {
      Le = 0;
      var e = hn,
        t = ca,
        n = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || n) {
        ((n = K.T), (K.T = null));
        var a = ne.p;
        ne.p = 2;
        var i = Ee;
        Ee |= 4;
        try {
          Wm(e, t.alternate, t);
        } finally {
          ((Ee = i), (ne.p = a), (K.T = n));
        }
      }
      Le = 3;
    }
  }
  function xo() {
    if (Le === 4 || Le === 3) {
      Le = 0;
      var e = Ya;
      ((Ya = null), Y0());
      var t = hn,
        n = ca,
        a = On,
        i = mp,
        c = (a & 335544064) === a ? 10262 : 10256;
      if (
        ((n.subtreeFlags & c) !== 0 || (n.flags & c) !== 0
          ? (Le = 5)
          : ((Le = 0), (ca = hn = null), jp(t, t.pendingLanes)),
        (c = t.pendingLanes),
        c === 0 && (_l = null),
        Ur(a),
        (n = n.stateNode),
        Lt && typeof Lt.onCommitFiberRoot == 'function')
      )
        try {
          Lt.onCommitFiberRoot(pu, n, void 0, (n.current.flags & 128) === 128);
        } catch {}
      if (i !== null) {
        ((n = K.T), (c = ne.p), (ne.p = 2), (K.T = null));
        try {
          for (var d = t.onRecoverableError, p = 0; p < i.length; p++) {
            var y = i[p];
            d(y.value, { componentStack: y.stack });
          }
        } finally {
          ((K.T = n), (ne.p = c));
        }
      }
      if (
        ((i = Va),
        (d = Ga),
        (Ga = null),
        i !== null && ((Va = null), d === null && (d = []), e !== null))
      )
        for (y = 0; y < i.length; y++) ((n = (0, i[y])(d)), n !== void 0 && e.finished.finally(n));
      ((On & 3) !== 0 && kc(),
        An(t),
        (c = t.pendingLanes),
        (a & 261930) !== 0 && (c & 42) !== 0
          ? t === Mc
            ? Ju++
            : ((Ju = 0), (Mc = t))
          : ((Ju = 0), (Mc = null)),
        Fu(0));
    }
  }
  function jp(e, t) {
    (e.pooledCacheLanes &= t) === 0 &&
      ((t = e.pooledCache), t != null && ((e.pooledCache = null), Du(t)));
  }
  function kc() {
    return (Ya !== null && (Ya.skipTransition(), (Ya = null)), To(), jo(), xo(), Oo());
  }
  function Oo() {
    if (Le !== 5) return !1;
    var e = hn,
      t = So;
    So = 0;
    var n = Ur(On),
      a = K.T,
      i = ne.p;
    try {
      ((ne.p = 32 > n ? 32 : n), (K.T = null), (n = zo), (zo = null));
      var c = hn,
        d = On;
      if (((Le = 0), (ca = hn = null), (On = 0), (Ee & 6) !== 0)) throw Error(s(331));
      var p = Ee;
      if (
        ((Ee |= 4),
        fp(c.current),
        rp(c, c.current, d, n),
        (Ee = p),
        Fu(0, !1),
        Lt && typeof Lt.onPostCommitFiberRoot == 'function')
      )
        try {
          Lt.onPostCommitFiberRoot(pu, c);
        } catch {}
      return !0;
    } finally {
      ((ne.p = i), (K.T = a), jp(e, t));
    }
  }
  function xp(e, t, n) {
    ((t = Wt(n, t)),
      (t = Gs(e.stateNode, t, 2)),
      (e = dl(e, t, 2)),
      e !== null && (yu(e, 2), An(e)));
  }
  function Ce(e, t, n) {
    if (e.tag === 3) xp(e, e, n);
    else
      for (; t !== null;) {
        if (t.tag === 3) {
          xp(t, e, n);
          break;
        } else if (t.tag === 1) {
          var a = t.stateNode;
          if (
            typeof t.type.getDerivedStateFromError == 'function' ||
            (typeof a.componentDidCatch == 'function' && (_l === null || !_l.has(a)))
          ) {
            ((e = Wt(n, e)),
              (n = Nm(2)),
              (a = dl(t, n, 2)),
              a !== null && (Em(n, a, t, e), yu(a, 2), An(a)));
            break;
          }
        }
        t = t.return;
      }
  }
  function Ao(e, t, n) {
    var a = e.pingCache;
    if (a === null) {
      a = e.pingCache = new _1();
      var i = new Set();
      a.set(t, i);
    } else ((i = a.get(t)), i === void 0 && ((i = new Set()), a.set(t, i)));
    i.has(n) || ((bo = !0), i.add(n), (e = O1.bind(null, e, t, n)), t.then(e, e));
  }
  function O1(e, t, n) {
    var a = e.pingCache;
    (a !== null && a.delete(t),
      (e.pingedLanes |= e.suspendedLanes & n),
      (e.warmLanes &= ~n),
      Re === e &&
        (ve & n) === n &&
        ((Xe === 4 || (Xe === 3 && (ve & 62914560) === ve && 300 > kt() - Dc)) && (Ee & 2) === 0
          ? Qa(e, 0)
          : (Cc |= n),
        qa === ve && (qa = 0)),
      An(e));
  }
  function Op(e, t) {
    (t === 0 && (t = hd()), (e = Xl(e, t)), e !== null && (yu(e, t), An(e)));
  }
  function A1(e) {
    var t = e.memoizedState,
      n = 0;
    (t !== null && (n = t.retryLane), Op(e, n));
  }
  function C1(e, t) {
    var n = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var a = e.stateNode,
          i = e.memoizedState;
        i !== null && (n = i.retryLane);
        break;
      case 19:
        a = e.stateNode;
        break;
      case 22:
        a = e.stateNode._retryCache;
        break;
      default:
        throw Error(s(314));
    }
    (a !== null && a.delete(t), Op(e, n));
  }
  function D1(e, t) {
    return Dr(e, t);
  }
  var Ka = null,
    Ia = null,
    Co = !1,
    Lc = !1,
    Do = !1,
    zl = 0;
  function An(e) {
    (e !== Ia && e.next === null && (Ia === null ? (Ka = Ia = e) : (Ia = Ia.next = e)),
      (Lc = !0),
      Co || ((Co = !0), R1()));
  }
  function Fu(e, t) {
    if (!Do && Lc) {
      Do = !0;
      do
        for (var n = !1, a = Ka; a !== null;) {
          if (e !== 0) {
            var i = a.pendingLanes;
            if (i === 0) var c = 0;
            else {
              var d = a.suspendedLanes,
                p = a.pingedLanes;
              ((c = (1 << (31 - Bt(42 | e) + 1)) - 1),
                (c &= i & ~(d & ~p)),
                (c = c & 201326741 ? (c & 201326741) | 1 : c ? c | 2 : 0));
            }
            c !== 0 && ((n = !0), wp(a, c));
          } else
            ((c = ve),
              (c = Ci(
                a,
                a === Re ? c : 0,
                a.cancelPendingCommit !== null || a.timeoutHandle !== -1,
              )),
              (c & 3) === 0 || vu(a, c) || ((n = !0), wp(a, c)));
          a = a.next;
        }
      while (n);
      Do = !1;
    }
  }
  function w1() {
    Ap();
  }
  function Ap() {
    Lc = Co = !1;
    var e = 0;
    zl !== 0 && G1() && (e = zl);
    for (var t = kt(), n = null, a = Ka; a !== null;) {
      var i = a.next,
        c = Cp(a, t);
      (c === 0
        ? ((a.next = null), n === null ? (Ka = i) : (n.next = i), i === null && (Ia = n))
        : ((n = a), (e !== 0 || (c & 3) !== 0) && (Lc = !0)),
        (a = i));
    }
    ((Le !== 0 && Le !== 5) || Fu(e), zl !== 0 && (zl = 0));
  }
  function Cp(e, t) {
    for (
      var n = e.suspendedLanes,
        a = e.pingedLanes,
        i = e.expirationTimes,
        c = e.pendingLanes & -62914561;
      0 < c;
    ) {
      var d = 31 - Bt(c),
        p = 1 << d,
        y = i[d];
      (y === -1
        ? ((p & n) === 0 || (p & a) !== 0) && (i[d] = J0(p, t))
        : y <= t && (e.expiredLanes |= p),
        (c &= ~p));
    }
    if (
      ((t = Re),
      (n = ve),
      (n = Ci(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1)),
      (a = e.callbackNode),
      n === 0 || (e === t && (Ae === 2 || Ae === 9)) || e.cancelPendingCommit !== null)
    )
      return (a !== null && a !== null && wr(a), (e.callbackNode = null), (e.callbackPriority = 0));
    if ((n & 3) === 0 || vu(e, n)) {
      if (((t = n & -n), t === e.callbackPriority)) return t;
      switch ((a !== null && wr(a), Ur(n))) {
        case 2:
        case 8:
          n = od;
          break;
        case 32:
          n = ji;
          break;
        case 268435456:
          n = fd;
          break;
        default:
          n = ji;
      }
      return (
        (a = Dp.bind(null, e)),
        (n = Dr(n, a)),
        (e.callbackPriority = t),
        (e.callbackNode = n),
        t
      );
    }
    return (
      a !== null && a !== null && wr(a),
      (e.callbackPriority = 2),
      (e.callbackNode = null),
      2
    );
  }
  function Dp(e, t) {
    if (Le !== 0 && Le !== 5) return ((e.callbackNode = null), (e.callbackPriority = 0), null);
    var n = e.callbackNode;
    if (kc() && e.callbackNode !== n) return null;
    var a = ve;
    return (
      (a = Ci(e, e === Re ? a : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1)),
      a === 0
        ? null
        : (vp(e, a, t),
          Cp(e, kt()),
          e.callbackNode != null && e.callbackNode === n ? Dp.bind(null, e) : null)
    );
  }
  function wp(e, t) {
    if (kc()) return null;
    vp(e, t, !0);
  }
  function R1() {
    Q1(function () {
      (Ee & 6) !== 0 ? Dr(sd, w1) : Ap();
    });
  }
  function wo() {
    if (zl === 0) {
      var e = Fl;
      (e === 0 && ((e = xi), (xi <<= 1), (xi & 261888) === 0 && (xi = 256)), (zl = e));
    }
    return zl;
  }
  function Rp(e) {
    return e == null || typeof e == 'symbol' || typeof e == 'boolean'
      ? null
      : typeof e == 'function'
        ? e
        : Ui(e);
  }
  function M1(e, t, n, a, i) {
    if (t === 'submit' && n && n.stateNode === i) {
      var c = Rp((i[Ot] || null).action),
        d = a.submitter;
      d &&
        ((t = (t = d[Ot] || null) ? Rp(t.formAction) : d.getAttribute('formAction')),
        t !== null && ((c = t), (d = null)));
      var p = new Li('action', 'action', null, a, i);
      e.push({
        event: p,
        listeners: [
          {
            instance: null,
            listener: function () {
              if (a.defaultPrevented) {
                if (zl !== 0) {
                  var y = new FormData(i, d);
                  Ls(n, { pending: !0, data: y, method: i.method, action: c }, null, y);
                }
              } else
                typeof c == 'function' &&
                  (p.preventDefault(),
                  (y = new FormData(i, d)),
                  Ls(n, { pending: !0, data: y, method: i.method, action: c }, c, y));
            },
            currentTarget: i,
          },
        ],
      });
    }
  }
  for (var Ro = 0; Ro < ls.length; Ro++) {
    var Mo = ls[Ro],
      U1 = Mo.toLowerCase(),
      Z1 = Mo[0].toUpperCase() + Mo.slice(1);
    sn(U1, 'on' + Z1);
  }
  (sn(uh, 'onAnimationEnd'),
    sn(ih, 'onAnimationIteration'),
    sn(ch, 'onAnimationStart'),
    sn('dblclick', 'onDoubleClick'),
    sn('focusin', 'onFocus'),
    sn('focusout', 'onBlur'),
    sn(Xg, 'onTransitionRun'),
    sn(Qg, 'onTransitionStart'),
    sn($g, 'onTransitionCancel'),
    sn(rh, 'onTransitionEnd'),
    ya('onMouseEnter', ['mouseout', 'mouseover']),
    ya('onMouseLeave', ['mouseout', 'mouseover']),
    ya('onPointerEnter', ['pointerout', 'pointerover']),
    ya('onPointerLeave', ['pointerout', 'pointerover']),
    Yl('onChange', 'change click focusin focusout input keydown keyup selectionchange'.split(' ')),
    Yl(
      'onSelect',
      'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(
        ' ',
      ),
    ),
    Yl('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste']),
    Yl('onCompositionEnd', 'compositionend focusout keydown keypress keyup mousedown'.split(' ')),
    Yl(
      'onCompositionStart',
      'compositionstart focusout keydown keypress keyup mousedown'.split(' '),
    ),
    Yl(
      'onCompositionUpdate',
      'compositionupdate focusout keydown keypress keyup mousedown'.split(' '),
    ));
  var Pu =
      'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
        ' ',
      ),
    H1 = new Set(
      'beforetoggle cancel close invalid load scroll scrollend toggle'.split(' ').concat(Pu),
    );
  function Mp(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var a = e[n],
        i = a.event;
      a = a.listeners;
      e: {
        var c = void 0;
        if (t)
          for (var d = a.length - 1; 0 <= d; d--) {
            var p = a[d],
              y = p.instance,
              j = p.currentTarget;
            if (((p = p.listener), y !== c && i.isPropagationStopped())) break e;
            ((c = p), (i.currentTarget = j));
            try {
              c(i);
            } catch (D) {
              Yi(D);
            }
            ((i.currentTarget = null), (c = y));
          }
        else
          for (d = 0; d < a.length; d++) {
            if (
              ((p = a[d]),
              (y = p.instance),
              (j = p.currentTarget),
              (p = p.listener),
              y !== c && i.isPropagationStopped())
            )
              break e;
            ((c = p), (i.currentTarget = j));
            try {
              c(i);
            } catch (D) {
              Yi(D);
            }
            ((i.currentTarget = null), (c = y));
          }
      }
    }
  }
  function me(e, t) {
    var n = t[bd];
    n === void 0 && (n = t[bd] = new Set());
    var a = e + '__bubble';
    n.has(a) || (Up(t, e, 2, !1), n.add(a));
  }
  function Uo(e, t, n) {
    var a = 0;
    (t && (a |= 4), Up(n, e, a, t));
  }
  var Bc = '_reactListening' + Math.random().toString(36).slice(2);
  function Zo(e) {
    if (!e[Bc]) {
      ((e[Bc] = !0),
        zd.forEach(function (n) {
          n !== 'selectionchange' && (H1.has(n) || Uo(n, !1, e), Uo(n, !0, e));
        }));
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Bc] || ((t[Bc] = !0), Uo('selectionchange', !1, t));
    }
  }
  function Up(e, t, n, a) {
    switch (Ev(t)) {
      case 2:
        var i = Ab;
        break;
      case 8:
        i = Cb;
        break;
      default:
        i = nf;
    }
    ((n = i.bind(null, t, n, e)),
      (i = void 0),
      !Vr || (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') || (i = !0),
      a
        ? i !== void 0
          ? e.addEventListener(t, n, { capture: !0, passive: i })
          : e.addEventListener(t, n, !0)
        : i !== void 0
          ? e.addEventListener(t, n, { passive: i })
          : e.addEventListener(t, n, !1));
  }
  function Ho(e, t, n, a, i) {
    var c = a;
    if ((t & 1) === 0 && (t & 2) === 0 && a !== null)
      e: for (;;) {
        if (a === null) return;
        var d = a.tag;
        if (d === 3 || d === 4) {
          var p = a.stateNode.containerInfo;
          if (p === i) break;
          if (d === 4)
            for (d = a.return; d !== null;) {
              var y = d.tag;
              if ((y === 3 || y === 4) && d.stateNode.containerInfo === i) return;
              d = d.return;
            }
          for (; p !== null;) {
            if (((d = ql(p)), d === null)) return;
            if (((y = d.tag), y === 5 || y === 6 || y === 26 || y === 27)) {
              a = c = d;
              continue e;
            }
            p = p.parentNode;
          }
        }
        a = a.return;
      }
    Ud(function () {
      var j = c,
        D = qr(n),
        M = [];
      e: {
        var E = sh.get(e);
        if (E !== void 0) {
          var C = Li,
            Y = e;
          switch (e) {
            case 'keypress':
              if (Hi(n) === 0) break e;
            case 'keydown':
            case 'keyup':
              C = Sg;
              break;
            case 'focusin':
              ((Y = 'focus'), (C = $r));
              break;
            case 'focusout':
              ((Y = 'blur'), (C = $r));
              break;
            case 'beforeblur':
            case 'afterblur':
              C = $r;
              break;
            case 'click':
              if (n.button === 2) break e;
            case 'auxclick':
            case 'dblclick':
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
            case 'mouseout':
            case 'mouseover':
            case 'contextmenu':
              C = kd;
              break;
            case 'drag':
            case 'dragend':
            case 'dragenter':
            case 'dragexit':
            case 'dragleave':
            case 'dragover':
            case 'dragstart':
            case 'drop':
              C = sg;
              break;
            case 'touchcancel':
            case 'touchend':
            case 'touchmove':
            case 'touchstart':
              C = jg;
              break;
            case uh:
            case ih:
            case ch:
              C = dg;
              break;
            case rh:
              C = Og;
              break;
            case 'scroll':
            case 'scrollend':
              C = cg;
              break;
            case 'wheel':
              C = Cg;
              break;
            case 'copy':
            case 'cut':
            case 'paste':
              C = mg;
              break;
            case 'gotpointercapture':
            case 'lostpointercapture':
            case 'pointercancel':
            case 'pointerdown':
            case 'pointermove':
            case 'pointerout':
            case 'pointerover':
            case 'pointerup':
              C = Bd;
              break;
            case 'submit':
              C = Eg;
              break;
            case 'toggle':
            case 'beforetoggle':
              C = wg;
          }
          var Q = (t & 4) !== 0,
            ce = !Q && (e === 'scroll' || e === 'scrollend'),
            T = Q ? (E !== null ? E + 'Capture' : null) : E;
          Q = [];
          for (var z = j, O; z !== null;) {
            var R = z;
            if (
              ((O = R.stateNode),
              (R = R.tag),
              (R !== 5 && R !== 26 && R !== 27) ||
                O === null ||
                T === null ||
                ((R = _u(z, T)), R != null && Q.push(Wu(z, R, O))),
              ce)
            )
              break;
            z = z.return;
          }
          0 < Q.length && ((E = new C(E, Y, null, n, D)), M.push({ event: E, listeners: Q }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (
            ((C = e === 'mouseover' || e === 'pointerover'),
            (E = e === 'mouseout' || e === 'pointerout'),
            C && n !== Br && (Y = n.relatedTarget || n.fromElement) && (ql(Y) || Y[ma]))
          )
            break e;
          (E || C) &&
            ((Y =
              D.window === D
                ? D
                : (C = D.ownerDocument)
                  ? C.defaultView || C.parentWindow
                  : window),
            E
              ? ((C = n.relatedTarget || n.toElement),
                (E = j),
                (C = C ? ql(C) : null),
                C !== null &&
                  ((ce = h(C)), (Q = C.tag), C !== ce || (Q !== 5 && Q !== 27 && Q !== 6)) &&
                  (C = null))
              : ((E = null), (C = j)),
            E !== C &&
              ((Q = kd),
              (R = 'onMouseLeave'),
              (T = 'onMouseEnter'),
              (z = 'mouse'),
              (e === 'pointerout' || e === 'pointerover') &&
                ((Q = Bd), (R = 'onPointerLeave'), (T = 'onPointerEnter'), (z = 'pointer')),
              (ce = E == null ? Y : bu(E)),
              (O = C == null ? Y : bu(C)),
              (Y = new Q(R, z + 'leave', E, n, D)),
              (Y.target = ce),
              (Y.relatedTarget = O),
              (R = null),
              ql(D) === j &&
                ((Q = new Q(T, z + 'enter', C, n, D)),
                (Q.target = O),
                (Q.relatedTarget = ce),
                (R = Q)),
              (ce = R),
              (Q = E && C ? ue(E, C, k1) : null),
              E !== null && Zp(M, Y, E, Q, !1),
              C !== null && ce !== null && Zp(M, ce, C, Q, !0)));
        }
        e: {
          if (
            ((E = j ? bu(j) : window),
            (C = E.nodeName && E.nodeName.toLowerCase()),
            C === 'select' || (C === 'input' && E.type === 'file'))
          )
            var X = Kd;
          else if (Qd(E))
            if (Id) X = Yg;
            else {
              X = Bg;
              var ye = Lg;
            }
          else
            ((C = E.nodeName),
              !C || C.toLowerCase() !== 'input' || (E.type !== 'checkbox' && E.type !== 'radio')
                ? j && Lr(j.elementType) && (X = Kd)
                : (X = qg));
          if (X && (X = X(e, j))) {
            $d(M, X, n, D);
            break e;
          }
          ye && ye(e, E, j);
        }
        switch (((ye = j ? bu(j) : window), e)) {
          case 'focusin':
            (Qd(ye) || ye.contentEditable === 'true') && ((Na = ye), (es = j), (Ou = null));
            break;
          case 'focusout':
            Ou = es = Na = null;
            break;
          case 'mousedown':
            ts = !0;
            break;
          case 'contextmenu':
          case 'mouseup':
          case 'dragend':
            ((ts = !1), lh(M, n, D));
            break;
          case 'selectionchange':
            if (Gg) break;
          case 'keydown':
          case 'keyup':
            lh(M, n, D);
        }
        var J;
        if (Ir)
          e: {
            switch (e) {
              case 'compositionstart':
                var te = 'onCompositionStart';
                break e;
              case 'compositionend':
                te = 'onCompositionEnd';
                break e;
              case 'compositionupdate':
                te = 'onCompositionUpdate';
                break e;
            }
            te = void 0;
          }
        else
          za
            ? Gd(e, n) && (te = 'onCompositionEnd')
            : e === 'keydown' && n.keyCode === 229 && (te = 'onCompositionStart');
        (te &&
          (qd &&
            n.locale !== 'ko' &&
            (za || te !== 'onCompositionStart'
              ? te === 'onCompositionEnd' && za && (J = Zd())
              : ((ll = D), (Gr = 'value' in ll ? ll.value : ll.textContent), (za = !0))),
          (ye = qc(j, te)),
          0 < ye.length &&
            ((te = new Ld(te, e, null, n, D)),
            M.push({ event: te, listeners: ye }),
            J ? (te.data = J) : ((J = Xd(n)), J !== null && (te.data = J)))),
          (J = Mg ? Ug(e, n) : Zg(e, n)) &&
            ((te = qc(j, 'onBeforeInput')),
            0 < te.length &&
              ((ye = new Ld('onBeforeInput', 'beforeinput', null, n, D)),
              M.push({ event: ye, listeners: te }),
              (ye.data = J))),
          M1(M, e, j, n, D));
      }
      Mp(M, t);
    });
  }
  function Wu(e, t, n) {
    return { instance: e, listener: t, currentTarget: n };
  }
  function qc(e, t) {
    for (var n = t + 'Capture', a = []; e !== null;) {
      var i = e,
        c = i.stateNode;
      if (
        ((i = i.tag),
        (i !== 5 && i !== 26 && i !== 27) ||
          c === null ||
          ((i = _u(e, n)),
          i != null && a.unshift(Wu(e, i, c)),
          (i = _u(e, t)),
          i != null && a.push(Wu(e, i, c))),
        e.tag === 3)
      )
        return a;
      e = e.return;
    }
    return [];
  }
  function k1(e) {
    if (e === null) return null;
    do e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function Zp(e, t, n, a, i) {
    for (var c = t._reactName, d = []; n !== null && n !== a;) {
      var p = n,
        y = p.alternate,
        j = p.stateNode;
      if (((p = p.tag), y !== null && y === a)) break;
      ((p !== 5 && p !== 26 && p !== 27) ||
        j === null ||
        ((y = j),
        i
          ? ((j = _u(n, c)), j != null && d.unshift(Wu(n, j, y)))
          : i || ((j = _u(n, c)), j != null && d.push(Wu(n, j, y)))),
        (n = n.return));
    }
    d.length !== 0 && e.push({ event: t, listeners: d });
  }
  var L1 = /\r\n?/g,
    B1 = /\u0000|\uFFFD/g;
  function Hp(e) {
    return (typeof e == 'string' ? e : '' + e)
      .replace(
        L1,
        `
`,
      )
      .replace(B1, '');
  }
  function kp(e, t) {
    return ((t = Hp(t)), Hp(e) === t);
  }
  function De(e, t, n, a, i, c) {
    switch (n) {
      case 'children':
        if (typeof a == 'string') t === 'body' || (t === 'textarea' && a === '') || ba(e, a);
        else if (typeof a == 'number' || typeof a == 'bigint') t !== 'body' && ba(e, '' + a);
        else return;
        break;
      case 'className':
        Mi(e, 'class', a);
        break;
      case 'tabIndex':
        Mi(e, 'tabindex', a);
        break;
      case 'dir':
      case 'role':
      case 'viewBox':
      case 'width':
      case 'height':
        Mi(e, n, a);
        break;
      case 'style':
        Rd(e, a, c);
        return;
      case 'data':
        if (t !== 'object') {
          Mi(e, 'data', a);
          break;
        }
      case 'src':
      case 'href':
        if (a === '' && (t !== 'a' || n !== 'href')) {
          e.removeAttribute(n);
          break;
        }
        if (a == null || typeof a == 'function' || typeof a == 'symbol' || typeof a == 'boolean') {
          e.removeAttribute(n);
          break;
        }
        ((a = Ui(a)), e.setAttribute(n, a));
        break;
      case 'action':
      case 'formAction':
        if (typeof a == 'function') {
          e.setAttribute(
            n,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
          );
          break;
        } else
          typeof c == 'function' &&
            (n === 'formAction'
              ? (t !== 'input' && De(e, t, 'name', i.name, i, null),
                De(e, t, 'formEncType', i.formEncType, i, null),
                De(e, t, 'formMethod', i.formMethod, i, null),
                De(e, t, 'formTarget', i.formTarget, i, null))
              : (De(e, t, 'encType', i.encType, i, null),
                De(e, t, 'method', i.method, i, null),
                De(e, t, 'target', i.target, i, null)));
        if (a == null || typeof a == 'symbol' || typeof a == 'boolean') {
          e.removeAttribute(n);
          break;
        }
        ((a = Ui(a)), e.setAttribute(n, a));
        break;
      case 'onClick':
        a != null && (e.onclick = bn);
        return;
      case 'onScroll':
        a != null && me('scroll', e);
        return;
      case 'onScrollEnd':
        a != null && me('scrollend', e);
        return;
      case 'dangerouslySetInnerHTML':
        if (a != null) {
          if (typeof a != 'object' || !('__html' in a)) throw Error(s(61));
          if (((n = a.__html), n != null)) {
            if (i.children != null) throw Error(s(60));
            c?.__html !== n && (e.innerHTML = n);
          }
        }
        break;
      case 'multiple':
        e.multiple = a && typeof a != 'function' && typeof a != 'symbol';
        break;
      case 'muted':
        e.muted = a && typeof a != 'function' && typeof a != 'symbol';
        break;
      case 'suppressContentEditableWarning':
      case 'suppressHydrationWarning':
      case 'defaultValue':
      case 'defaultChecked':
      case 'innerHTML':
      case 'ref':
        break;
      case 'autoFocus':
        break;
      case 'xlinkHref':
        if (a == null || typeof a == 'function' || typeof a == 'boolean' || typeof a == 'symbol') {
          e.removeAttribute('xlink:href');
          break;
        }
        ((n = Ui(a)), e.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', n));
        break;
      case 'contentEditable':
      case 'spellCheck':
      case 'draggable':
      case 'value':
      case 'autoReverse':
      case 'externalResourcesRequired':
      case 'focusable':
      case 'preserveAlpha':
        a != null && typeof a != 'function' && typeof a != 'symbol'
          ? e.setAttribute(n, a)
          : e.removeAttribute(n);
        break;
      case 'inert':
      case 'allowFullScreen':
      case 'async':
      case 'autoPlay':
      case 'controls':
      case 'credentialless':
      case 'default':
      case 'defer':
      case 'disabled':
      case 'disablePictureInPicture':
      case 'disableRemotePlayback':
      case 'formNoValidate':
      case 'hidden':
      case 'loop':
      case 'noModule':
      case 'noValidate':
      case 'open':
      case 'playsInline':
      case 'readOnly':
      case 'required':
      case 'reversed':
      case 'scoped':
      case 'seamless':
      case 'itemScope':
        a && typeof a != 'function' && typeof a != 'symbol'
          ? e.setAttribute(n, '')
          : e.removeAttribute(n);
        break;
      case 'capture':
      case 'download':
        a === !0
          ? e.setAttribute(n, '')
          : a !== !1 && a != null && typeof a != 'function' && typeof a != 'symbol'
            ? e.setAttribute(n, a)
            : e.removeAttribute(n);
        break;
      case 'cols':
      case 'rows':
      case 'size':
      case 'span':
        a != null && typeof a != 'function' && typeof a != 'symbol' && !isNaN(a) && 1 <= a
          ? e.setAttribute(n, a)
          : e.removeAttribute(n);
        break;
      case 'rowSpan':
      case 'start':
        a == null || typeof a == 'function' || typeof a == 'symbol' || isNaN(a)
          ? e.removeAttribute(n)
          : e.setAttribute(n, a);
        break;
      case 'popover':
        (me('beforetoggle', e), me('toggle', e), Ri(e, 'popover', a));
        break;
      case 'xlinkActuate':
        Zn(e, 'http://www.w3.org/1999/xlink', 'xlink:actuate', a);
        break;
      case 'xlinkArcrole':
        Zn(e, 'http://www.w3.org/1999/xlink', 'xlink:arcrole', a);
        break;
      case 'xlinkRole':
        Zn(e, 'http://www.w3.org/1999/xlink', 'xlink:role', a);
        break;
      case 'xlinkShow':
        Zn(e, 'http://www.w3.org/1999/xlink', 'xlink:show', a);
        break;
      case 'xlinkTitle':
        Zn(e, 'http://www.w3.org/1999/xlink', 'xlink:title', a);
        break;
      case 'xlinkType':
        Zn(e, 'http://www.w3.org/1999/xlink', 'xlink:type', a);
        break;
      case 'xmlBase':
        Zn(e, 'http://www.w3.org/XML/1998/namespace', 'xml:base', a);
        break;
      case 'xmlLang':
        Zn(e, 'http://www.w3.org/XML/1998/namespace', 'xml:lang', a);
        break;
      case 'xmlSpace':
        Zn(e, 'http://www.w3.org/XML/1998/namespace', 'xml:space', a);
        break;
      case 'is':
        Ri(e, 'is', a);
        break;
      case 'innerText':
      case 'textContent':
        return;
      default:
        if (!(2 < n.length) || (n[0] !== 'o' && n[0] !== 'O') || (n[1] !== 'n' && n[1] !== 'N'))
          ((n = ug.get(n) || n), Ri(e, n, a));
        else return;
    }
    ze = !0;
  }
  function ko(e, t, n, a, i, c) {
    switch (n) {
      case 'style':
        Rd(e, a, c);
        return;
      case 'dangerouslySetInnerHTML':
        if (a != null) {
          if (typeof a != 'object' || !('__html' in a)) throw Error(s(61));
          if (((n = a.__html), n != null)) {
            if (i.children != null) throw Error(s(60));
            c?.__html !== n && (e.innerHTML = n);
          }
        }
        break;
      case 'children':
        if (typeof a == 'string') ba(e, a);
        else if (typeof a == 'number' || typeof a == 'bigint') ba(e, '' + a);
        else return;
        break;
      case 'onScroll':
        a != null && me('scroll', e);
        return;
      case 'onScrollEnd':
        a != null && me('scrollend', e);
        return;
      case 'onClick':
        a != null && (e.onclick = bn);
        return;
      case 'suppressContentEditableWarning':
      case 'suppressHydrationWarning':
      case 'innerHTML':
      case 'ref':
        return;
      case 'innerText':
      case 'textContent':
        return;
      default:
        if (!Nd.hasOwnProperty(n))
          e: {
            if (
              n[0] === 'o' &&
              n[1] === 'n' &&
              ((i = n.endsWith('Capture')),
              (c = n.slice(2, i ? n.length - 7 : void 0)),
              (t = e[Ot] || null),
              (t = t != null ? t[n] : null),
              typeof t == 'function' && e.removeEventListener(c, t, i),
              typeof a == 'function')
            ) {
              (typeof t != 'function' &&
                t !== null &&
                (n in e ? (e[n] = null) : e.hasAttribute(n) && e.removeAttribute(n)),
                e.addEventListener(c, a, i));
              break e;
            }
            ((ze = !0), n in e ? (e[n] = a) : a === !0 ? e.setAttribute(n, '') : Ri(e, n, a));
          }
        return;
    }
    ze = !0;
  }
  function pt(e, t, n) {
    switch (t) {
      case 'div':
      case 'span':
      case 'svg':
      case 'path':
      case 'a':
      case 'g':
      case 'p':
      case 'li':
        break;
      case 'img':
        (me('error', e), me('load', e));
        var a = !1,
          i = !1,
          c;
        for (c in n)
          if (n.hasOwnProperty(c)) {
            var d = n[c];
            if (d != null)
              switch (c) {
                case 'src':
                  a = !0;
                  break;
                case 'srcSet':
                  i = !0;
                  break;
                case 'children':
                case 'dangerouslySetInnerHTML':
                  throw Error(s(137, t));
                default:
                  De(e, t, c, d, n, null);
              }
          }
        (i && De(e, t, 'srcSet', n.srcSet, n, null), a && De(e, t, 'src', n.src, n, null));
        return;
      case 'input':
        me('invalid', e);
        var p = (c = d = i = null),
          y = null,
          j = null;
        for (a in n)
          if (n.hasOwnProperty(a)) {
            var D = n[a];
            if (D != null)
              switch (a) {
                case 'name':
                  i = D;
                  break;
                case 'type':
                  d = D;
                  break;
                case 'checked':
                  y = D;
                  break;
                case 'defaultChecked':
                  j = D;
                  break;
                case 'value':
                  c = D;
                  break;
                case 'defaultValue':
                  p = D;
                  break;
                case 'children':
                case 'dangerouslySetInnerHTML':
                  if (D != null) throw Error(s(137, t));
                  break;
                default:
                  De(e, t, a, D, n, null);
              }
          }
        Ad(e, c, p, y, j, d, i, !1);
        return;
      case 'select':
        (me('invalid', e), (a = d = c = null));
        for (i in n)
          if (n.hasOwnProperty(i) && ((p = n[i]), p != null))
            switch (i) {
              case 'value':
                c = p;
                break;
              case 'defaultValue':
                d = p;
                break;
              case 'multiple':
                a = p;
              default:
                De(e, t, i, p, n, null);
            }
        ((t = c),
          (n = d),
          (e.multiple = !!a),
          t != null ? ga(e, !!a, t, !1) : n != null && ga(e, !!a, n, !0));
        return;
      case 'textarea':
        (me('invalid', e), (c = i = a = null));
        for (d in n)
          if (n.hasOwnProperty(d) && ((p = n[d]), p != null))
            switch (d) {
              case 'value':
                a = p;
                break;
              case 'defaultValue':
                i = p;
                break;
              case 'children':
                c = p;
                break;
              case 'dangerouslySetInnerHTML':
                if (p != null) throw Error(s(91));
                break;
              default:
                De(e, t, d, p, n, null);
            }
        Dd(e, a, i, c);
        return;
      case 'option':
        for (y in n)
          if (n.hasOwnProperty(y) && ((a = n[y]), a != null))
            switch (y) {
              case 'selected':
                e.selected = a && typeof a != 'function' && typeof a != 'symbol';
                break;
              default:
                De(e, t, y, a, n, null);
            }
        return;
      case 'dialog':
        (me('beforetoggle', e), me('toggle', e), me('cancel', e), me('close', e));
        break;
      case 'iframe':
      case 'object':
        me('load', e);
        break;
      case 'video':
      case 'audio':
        for (a = 0; a < Pu.length; a++) me(Pu[a], e);
        break;
      case 'image':
        (me('error', e), me('load', e));
        break;
      case 'details':
        me('toggle', e);
        break;
      case 'embed':
      case 'source':
      case 'link':
        (me('error', e), me('load', e));
      case 'area':
      case 'base':
      case 'br':
      case 'col':
      case 'hr':
      case 'keygen':
      case 'meta':
      case 'param':
      case 'track':
      case 'wbr':
      case 'menuitem':
        for (j in n)
          if (n.hasOwnProperty(j) && ((a = n[j]), a != null))
            switch (j) {
              case 'children':
              case 'dangerouslySetInnerHTML':
                throw Error(s(137, t));
              default:
                De(e, t, j, a, n, null);
            }
        return;
      default:
        if (Lr(t)) {
          for (D in n)
            n.hasOwnProperty(D) && ((a = n[D]), a !== void 0 && ko(e, t, D, a, n, void 0));
          return;
        }
    }
    for (p in n) n.hasOwnProperty(p) && ((a = n[p]), a != null && De(e, t, p, a, n, null));
  }
  var q1 = {};
  function Y1(e, t, n, a) {
    switch (t) {
      case 'div':
      case 'span':
      case 'svg':
      case 'path':
      case 'a':
      case 'g':
      case 'p':
      case 'li':
        break;
      case 'input':
        var i = null,
          c = null,
          d = null,
          p = null,
          y = null,
          j = null,
          D = null;
        for (C in n) {
          var M = n[C];
          if (n.hasOwnProperty(C) && M != null)
            switch (C) {
              case 'checked':
                break;
              case 'value':
                break;
              case 'defaultValue':
                y = M;
              default:
                a.hasOwnProperty(C) || De(e, t, C, null, a, M);
            }
        }
        for (var E in a) {
          var C = a[E];
          if (((M = n[E]), a.hasOwnProperty(E) && (C != null || M != null)))
            switch (E) {
              case 'type':
                (C !== M && (ze = !0), (c = C));
                break;
              case 'name':
                (C !== M && (ze = !0), (i = C));
                break;
              case 'checked':
                (C !== M && (ze = !0), (j = C));
                break;
              case 'defaultChecked':
                (C !== M && (ze = !0), (D = C));
                break;
              case 'value':
                (C !== M && (ze = !0), (d = C));
                break;
              case 'defaultValue':
                (C !== M && (ze = !0), (p = C));
                break;
              case 'children':
              case 'dangerouslySetInnerHTML':
                if (C != null) throw Error(s(137, t));
                break;
              default:
                C !== M && De(e, t, E, C, a, M);
            }
        }
        Hr(e, d, p, y, j, D, c, i);
        return;
      case 'select':
        C = d = p = E = null;
        for (c in n)
          if (((y = n[c]), n.hasOwnProperty(c) && y != null))
            switch (c) {
              case 'value':
                break;
              case 'multiple':
                C = y;
              default:
                a.hasOwnProperty(c) || De(e, t, c, null, a, y);
            }
        for (i in a)
          if (((c = a[i]), (y = n[i]), a.hasOwnProperty(i) && (c != null || y != null)))
            switch (i) {
              case 'value':
                (c !== y && (ze = !0), (E = c));
                break;
              case 'defaultValue':
                (c !== y && (ze = !0), (p = c));
                break;
              case 'multiple':
                (c !== y && (ze = !0), (d = c));
              default:
                c !== y && De(e, t, i, c, a, y);
            }
        ((t = p),
          (n = d),
          (a = C),
          E != null
            ? ga(e, !!n, E, !1)
            : !!a != !!n && (t != null ? ga(e, !!n, t, !0) : ga(e, !!n, n ? [] : '', !1)));
        return;
      case 'textarea':
        C = E = null;
        for (p in n)
          if (((i = n[p]), n.hasOwnProperty(p) && i != null && !a.hasOwnProperty(p)))
            switch (p) {
              case 'value':
                break;
              case 'children':
                break;
              default:
                De(e, t, p, null, a, i);
            }
        for (d in a)
          if (((i = a[d]), (c = n[d]), a.hasOwnProperty(d) && (i != null || c != null)))
            switch (d) {
              case 'value':
                (i !== c && (ze = !0), (E = i));
                break;
              case 'defaultValue':
                (i !== c && (ze = !0), (C = i));
                break;
              case 'children':
                break;
              case 'dangerouslySetInnerHTML':
                if (i != null) throw Error(s(91));
                break;
              default:
                i !== c && De(e, t, d, i, a, c);
            }
        Cd(e, E, C);
        return;
      case 'option':
        for (var Y in n)
          if (((E = n[Y]), n.hasOwnProperty(Y) && E != null && !a.hasOwnProperty(Y)))
            switch (Y) {
              case 'selected':
                e.selected = !1;
                break;
              default:
                De(e, t, Y, null, a, E);
            }
        for (y in a)
          if (((E = a[y]), (C = n[y]), a.hasOwnProperty(y) && E !== C && (E != null || C != null)))
            switch (y) {
              case 'selected':
                (E !== C && (ze = !0),
                  (e.selected = E && typeof E != 'function' && typeof E != 'symbol'));
                break;
              default:
                De(e, t, y, E, a, C);
            }
        return;
      case 'img':
      case 'link':
      case 'area':
      case 'base':
      case 'br':
      case 'col':
      case 'embed':
      case 'hr':
      case 'keygen':
      case 'meta':
      case 'param':
      case 'source':
      case 'track':
      case 'wbr':
      case 'menuitem':
        for (var Q in n)
          ((E = n[Q]),
            n.hasOwnProperty(Q) && E != null && !a.hasOwnProperty(Q) && De(e, t, Q, null, a, E));
        for (j in a)
          if (((E = a[j]), (C = n[j]), a.hasOwnProperty(j) && E !== C && (E != null || C != null)))
            switch (j) {
              case 'children':
              case 'dangerouslySetInnerHTML':
                if (E != null) throw Error(s(137, t));
                break;
              default:
                De(e, t, j, E, a, C);
            }
        return;
      default:
        if (Lr(t)) {
          for (var ce in n)
            ((E = n[ce]),
              n.hasOwnProperty(ce) &&
                E !== void 0 &&
                !a.hasOwnProperty(ce) &&
                ko(e, t, ce, void 0, a, E));
          for (D in a)
            ((E = a[D]),
              (C = n[D]),
              !a.hasOwnProperty(D) ||
                E === C ||
                (E === void 0 && C === void 0) ||
                ko(e, t, D, E, a, C));
          return;
        }
    }
    for (var T in n)
      ((E = n[T]),
        n.hasOwnProperty(T) && E != null && !a.hasOwnProperty(T) && De(e, t, T, null, a, E));
    for (M in a)
      ((E = a[M]),
        (C = n[M]),
        !a.hasOwnProperty(M) || E === C || (E == null && C == null) || De(e, t, M, E, a, C));
  }
  function Lp(e) {
    switch (e) {
      case 'css':
      case 'script':
      case 'font':
      case 'img':
      case 'image':
      case 'input':
      case 'link':
        return !0;
      default:
        return !1;
    }
  }
  function V1() {
    if (typeof performance.getEntriesByType == 'function') {
      for (
        var e = 0, t = 0, n = performance.getEntriesByType('resource'), a = 0;
        a < n.length;
        a++
      ) {
        var i = n[a],
          c = i.transferSize,
          d = i.initiatorType,
          p = i.duration;
        if (c && p && Lp(d)) {
          for (d = 0, p = i.responseEnd, a += 1; a < n.length; a++) {
            var y = n[a],
              j = y.startTime;
            if (j > p) break;
            var D = y.transferSize,
              M = y.initiatorType;
            D && Lp(M) && ((y = y.responseEnd), (d += D * (y < p ? 1 : (p - j) / (y - j))));
          }
          if ((--a, (t += (8 * (c + d)) / (i.duration / 1e3)), e++, 10 < e)) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && ((e = navigator.connection.downlink), typeof e == 'number')
      ? e
      : 5;
  }
  var Lo = null,
    Bo = null;
  function ei(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Bp(e) {
    switch (e) {
      case 'http://www.w3.org/2000/svg':
        return 1;
      case 'http://www.w3.org/1998/Math/MathML':
        return 2;
      default:
        return 0;
    }
  }
  function qp(e, t) {
    if (e === 0)
      switch (t) {
        case 'svg':
          return 1;
        case 'math':
          return 2;
        default:
          return 0;
      }
    return e === 1 && t === 'foreignObject' ? 0 : e;
  }
  function Yp(e, t, n, a) {
    return ((n = ei(n).createElement(e)), (n[ot] = a), (n[Ot] = t), pt(n, e, t), ut(n), n);
  }
  function qo(e, t) {
    return (
      e === 'textarea' ||
      e === 'noscript' ||
      typeof t.children == 'string' ||
      typeof t.children == 'number' ||
      typeof t.children == 'bigint' ||
      (typeof t.dangerouslySetInnerHTML == 'object' &&
        t.dangerouslySetInnerHTML !== null &&
        t.dangerouslySetInnerHTML.__html != null)
    );
  }
  var Yo = null;
  function G1() {
    var e = window.event;
    return e && e.type === 'popstate' ? (e === Yo ? !1 : ((Yo = e), !0)) : ((Yo = null), !1);
  }
  var Vo = typeof setTimeout == 'function' ? setTimeout : void 0,
    X1 = typeof clearTimeout == 'function' ? clearTimeout : void 0,
    Vp = typeof Promise == 'function' ? Promise : void 0,
    Gp = typeof requestAnimationFrame == 'function' ? requestAnimationFrame : Vo,
    Q1 =
      typeof queueMicrotask == 'function'
        ? queueMicrotask
        : typeof Vp < 'u'
          ? function (e) {
              return Vp.resolve(null).then(e).catch($1);
            }
          : Vo;
  function $1(e) {
    setTimeout(function () {
      throw e;
    });
  }
  function Nl(e) {
    return e === 'head';
  }
  function Xp(e, t) {
    var n = t,
      a = 0;
    do {
      var i = n.nextSibling;
      if ((e.removeChild(n), i && i.nodeType === 8))
        if (((n = i.data), n === '/$' || n === '/&')) {
          if (a === 0) {
            (e.removeChild(i), nu(t));
            return;
          }
          a--;
        } else if (n === '$' || n === '$?' || n === '$~' || n === '$!' || n === '&') a++;
        else if (n === 'html') Fo(e.ownerDocument.documentElement);
        else if (n === 'head') {
          ((n = e.ownerDocument.head), Fo(n));
          for (var c = n.firstChild; c;) {
            var d = c.nextSibling,
              p = c.nodeName;
            (c[gu] ||
              p === 'SCRIPT' ||
              p === 'STYLE' ||
              (p === 'LINK' && c.rel.toLowerCase() === 'stylesheet') ||
              n.removeChild(c),
              (c = d));
          }
        } else n === 'body' && Fo(e.ownerDocument.body);
      n = i;
    } while (n);
    nu(t);
  }
  function Qp(e, t) {
    var n = e;
    e = 0;
    do {
      var a = n.nextSibling;
      if (
        (n.nodeType === 1
          ? t
            ? ((n._stashedDisplay = n.style.display), (n.style.display = 'none'))
            : ((n.style.display = n._stashedDisplay || ''),
              n.getAttribute('style') === '' && n.removeAttribute('style'))
          : n.nodeType === 3 &&
            (t
              ? ((n._stashedText = n.nodeValue), (n.nodeValue = ''))
              : (n.nodeValue = n._stashedText || '')),
        a && a.nodeType === 8)
      )
        if (((n = a.data), n === '/$')) {
          if (e === 0) break;
          e--;
        } else (n !== '$' && n !== '$?' && n !== '$~' && n !== '$!') || e++;
      n = a;
    } while (n);
  }
  function $p(e, t, n) {
    if (
      ((t = CSS.escape(t) !== t ? 'r-' + btoa(t).replace(/=/g, '') : t),
      (e.style.viewTransitionName = t),
      n != null && (e.style.viewTransitionClass = n),
      (n = getComputedStyle(e)),
      n.display === 'inline')
    ) {
      if (((t = e.getClientRects()), t.length === 1)) var a = 1;
      else
        for (var i = (a = 0); i < t.length; i++) {
          var c = t[i];
          0 < c.width && 0 < c.height && a++;
        }
      a === 1 &&
        ((e = e.style),
        (e.display = t.length === 1 ? 'inline-block' : 'block'),
        (e.marginTop = '-' + n.paddingTop),
        (e.marginBottom = '-' + n.paddingBottom));
    }
  }
  function Kp(e, t) {
    ((e = e.style), (t = t.style));
    var n =
      t != null
        ? t.hasOwnProperty('viewTransitionName')
          ? t.viewTransitionName
          : t.hasOwnProperty('view-transition-name')
            ? t['view-transition-name']
            : null
        : null;
    ((e.viewTransitionName = n == null || typeof n == 'boolean' ? '' : ('' + n).trim()),
      (n =
        t != null
          ? t.hasOwnProperty('viewTransitionClass')
            ? t.viewTransitionClass
            : t.hasOwnProperty('view-transition-class')
              ? t['view-transition-class']
              : null
          : null),
      (e.viewTransitionClass = n == null || typeof n == 'boolean' ? '' : ('' + n).trim()),
      e.display === 'inline-block' &&
        (t == null
          ? (e.display = e.margin = '')
          : ((n = t.display),
            (e.display = n == null || typeof n == 'boolean' ? '' : n),
            (n = t.margin),
            n != null
              ? (e.margin = n)
              : ((n = t.hasOwnProperty('marginTop') ? t.marginTop : t['margin-top']),
                (e.marginTop = n == null || typeof n == 'boolean' ? '' : n),
                (t = t.hasOwnProperty('marginBottom') ? t.marginBottom : t['margin-bottom']),
                (e.marginBottom = t == null || typeof t == 'boolean' ? '' : t)))));
  }
  function K1(e, t, n) {
    return (
      (n = n.ownerDocument.defaultView),
      {
        rect: e,
        abs: t.position === 'absolute' || t.position === 'fixed',
        clip:
          t.clipPath !== 'none' ||
          t.overflow !== 'visible' ||
          t.filter !== 'none' ||
          t.mask !== 'none' ||
          t.mask !== 'none' ||
          t.borderRadius !== '0px',
        view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth,
      }
    );
  }
  function Go(e) {
    var t = e.getBoundingClientRect(),
      n = getComputedStyle(e);
    return K1(t, n, e);
  }
  function I1(e) {
    return e.documentElement.clientHeight;
  }
  function J1(e) {
    (this.addEventListener('load', e), this.addEventListener('error', e));
  }
  function F1(e, t, n, a, i, c, d, p, y) {
    var j = t.nodeType === 9 ? t : t.ownerDocument;
    try {
      var D = j.startViewTransition({
        update: function () {
          var E = j.defaultView,
            C = E.navigation && E.navigation.transition,
            Y = j.fonts.status;
          a();
          var Q = [];
          if (
            (Y === 'loaded' && (I1(j), j.fonts.status === 'loading' && Q.push(j.fonts.ready)),
            (Y = Q.length),
            e !== null)
          )
            for (var ce = e.suspenseyImages, T = 0, z = 0; z < ce.length; z++) {
              var O = ce[z];
              if (!O.complete) {
                var R = O.getBoundingClientRect();
                if (0 < R.bottom && 0 < R.right && R.top < E.innerHeight && R.left < E.innerWidth) {
                  if (((T += pv(O)), T > Gc)) {
                    Q.length = Y;
                    break;
                  }
                  ((O = new Promise(J1.bind(O))), Q.push(O));
                }
              }
            }
          if (0 < Q.length)
            return (
              (E = Promise.race([
                Promise.all(Q),
                new Promise(function (X) {
                  return setTimeout(X, 500);
                }),
              ]).then(i, i)),
              (C ? Promise.allSettled([C.finished, E]) : E).then(c, c)
            );
          if ((i(), C)) return C.finished.then(c, c);
          c();
        },
        types: n,
      });
      j.__reactViewTransition = D;
      var M = [];
      return (
        D.ready.then(
          function () {
            for (
              var E = j.documentElement.getAnimations({ subtree: !0 }), C = 0;
              C < E.length;
              C++
            ) {
              var Y = E[C],
                Q = Y.effect,
                ce = Q.pseudoElement;
              if (ce != null && ce.startsWith('::view-transition')) {
                (M.push(Y), (Y = Q.getKeyframes()));
                for (var T = (ce = void 0), z = !0, O = 0; O < Y.length; O++) {
                  var R = Y[O],
                    X = R.width;
                  if (ce === void 0) ce = X;
                  else if (ce !== X) {
                    z = !1;
                    break;
                  }
                  if (((X = R.height), T === void 0)) T = X;
                  else if (T !== X) {
                    z = !1;
                    break;
                  }
                  (delete R.width, delete R.height, R.transform === 'none' && delete R.transform);
                }
                z &&
                  ce !== void 0 &&
                  T !== void 0 &&
                  (Q.setKeyframes(Y),
                  (z = getComputedStyle(Q.target, Q.pseudoElement)),
                  z.width !== ce || z.height !== T) &&
                  ((z = Y[0]),
                  (z.width = ce),
                  (z.height = T),
                  (z = Y[Y.length - 1]),
                  (z.width = ce),
                  (z.height = T),
                  Q.setKeyframes(Y));
              }
            }
            d();
          },
          function (E) {
            j.__reactViewTransition === D && (j.__reactViewTransition = null);
            try {
              if (typeof E == 'object' && E !== null)
                switch (E.name) {
                  case 'InvalidStateError':
                    (E.message ===
                      'View transition was skipped because document visibility state is hidden.' ||
                      E.message ===
                        'Skipping view transition because document visibility state has become hidden.' ||
                      E.message === 'Skipping view transition because viewport size changed.' ||
                      E.message === 'Transition was aborted because of invalid state') &&
                      (E = null);
                }
              E !== null && y(E);
            } finally {
              (a(), i(), d());
            }
          },
        ),
        D.finished.finally(function () {
          for (var E = 0; E < M.length; E++) M[E].cancel();
          (j.__reactViewTransition === D && (j.__reactViewTransition = null), p());
        }),
        D
      );
    } catch {
      return (a(), i(), d(), null);
    }
  }
  function ra(e, t) {
    ((this._scope = document.documentElement),
      (this._selector = '::view-transition-' + e + '(' + t + ')'));
  }
  ((ra.prototype.animate = function (e, t) {
    return (
      (t = typeof t == 'number' ? { duration: t } : W({}, t)),
      (t.pseudoElement = this._selector),
      this._scope.animate(e, t)
    );
  }),
    (ra.prototype.getAnimations = function () {
      for (
        var e = this._scope,
          t = this._selector,
          n = e.getAnimations({ subtree: !0 }),
          a = [],
          i = 0;
        i < n.length;
        i++
      ) {
        var c = n[i].effect;
        c !== null && c.target === e && c.pseudoElement === t && a.push(n[i]);
      }
      return a;
    }),
    (ra.prototype.getComputedStyle = function () {
      return getComputedStyle(this._scope, this._selector);
    }));
  function Ip(e) {
    return {
      name: e,
      group: new ra('group', e),
      imagePair: new ra('image-pair', e),
      old: new ra('old', e),
      new: new ra('new', e),
    };
  }
  function Kt(e) {
    ((this._fragmentFiber = e), (this._observers = this._eventListeners = null));
  }
  Kt.prototype.addEventListener = function (e, t, n) {
    var a = null,
      i = null;
    if (!(
      n != null &&
      typeof n != 'boolean' &&
      ((a = n.signal || null), a !== null && a.aborted)
    )) {
      this._eventListeners === null && (this._eventListeners = []);
      var c = this._eventListeners;
      if (Fp(c, e, t, n) === -1) {
        var d = this,
          p = t;
        (n != null &&
          typeof n != 'boolean' &&
          n.once === !0 &&
          (p = function (y) {
            (d.removeEventListener(e, t, n),
              typeof t == 'function' ? t.call(this, y) : t.handleEvent(y));
          }),
          a !== null &&
            ((i = d.removeEventListener.bind(d, e, t, n)),
            a.addEventListener('abort', i, { once: !0 }),
            (i = a.removeEventListener.bind(a, 'abort', i))),
          (a = Ja(n)),
          c.push({ type: e, listener: t, optionsOrUseCapture: n, attachedListener: p, cleanup: i }),
          g(this._fragmentFiber.child, !1, P1, e, p, a));
      }
      this._eventListeners = c;
    }
  };
  function P1(e, t, n, a) {
    return (B(e).addEventListener(t, n, a), !1);
  }
  Kt.prototype.removeEventListener = function (e, t, n) {
    var a = this._eventListeners;
    if (a !== null && ((t = Fp(a, e, t, n)), t !== -1)) {
      var i = a[t];
      n = i.attachedListener;
      var c = i.cleanup;
      ((i = Ja(i.optionsOrUseCapture)),
        g(this._fragmentFiber.child, !1, W1, e, n, i),
        a.splice(t, 1),
        c !== null && c());
    }
  };
  function W1(e, t, n, a) {
    return (B(e).removeEventListener(t, n, a), !1);
  }
  function Ja(e) {
    return e != null && typeof e != 'boolean' && (e.once === !0 || e.signal instanceof AbortSignal)
      ? { capture: e.capture, passive: e.passive }
      : e;
  }
  function Jp(e) {
    return e == null
      ? 'c=0'
      : typeof e == 'boolean'
        ? 'c=' + (e ? '1' : '0')
        : 'c=' + (e.capture ? '1' : '0');
  }
  function Fp(e, t, n, a) {
    if (e.length === 0) return -1;
    a = Jp(a);
    for (var i = 0; i < e.length; i++) {
      var c = e[i];
      if (c.type === t && c.listener === n && Jp(c.optionsOrUseCapture) === a) return i;
    }
    return -1;
  }
  ((Kt.prototype.dispatchEvent = function (e) {
    var t = A(this._fragmentFiber);
    if (t === null) return !0;
    t = B(t);
    var n = this._eventListeners;
    if ((n !== null && 0 < n.length) || !e.bubbles) {
      var a = t.nodeType === 9 ? t.createComment('') : document.createTextNode('');
      if (n)
        for (var i = 0; i < n.length; i++) {
          var c = n[i];
          a.addEventListener(c.type, c.attachedListener, Ja(c.optionsOrUseCapture));
        }
      if ((t.appendChild(a), (e = a.dispatchEvent(e)), n))
        for (i = 0; i < n.length; i++)
          ((c = n[i]),
            a.removeEventListener(c.type, c.attachedListener, Ja(c.optionsOrUseCapture)));
      return (t.removeChild(a), e);
    }
    return t.dispatchEvent(e);
  }),
    (Kt.prototype.focus = function (e) {
      g(this._fragmentFiber.child, !0, Pp, e, void 0, void 0);
    }));
  function Pp(e, t) {
    return e.tag === 6 ? !1 : ((e = B(e)), fb(e, t));
  }
  Kt.prototype.focusLast = function (e) {
    var t = [];
    g(this._fragmentFiber.child, !0, Xo, t, void 0, void 0);
    for (var n = t.length - 1; 0 <= n && !Pp(t[n], e); n--);
  };
  function Xo(e, t) {
    return (t.push(e), !1);
  }
  Kt.prototype.blur = function () {
    var e = A(this._fragmentFiber);
    e !== null &&
      ((e = B(e)),
      (e = ei(e).activeElement),
      e !== null && g(this._fragmentFiber.child, !1, eb, e, void 0, void 0));
  };
  function eb(e, t) {
    return e.tag === 6 ? !1 : ((e = B(e)), e === t || e.contains(t) ? (t.blur(), !0) : !1);
  }
  Kt.prototype.observeUsing = function (e) {
    (this._observers === null && (this._observers = new Set()),
      this._observers.add(e),
      g(this._fragmentFiber.child, !1, tb, e, void 0, void 0));
  };
  function tb(e, t) {
    return (e.tag === 6 || ((e = B(e)), t.observe(e)), !1);
  }
  Kt.prototype.unobserveUsing = function (e) {
    var t = this._observers;
    if (t !== null && t.has(e)) {
      (t.delete(e), g(this._fragmentFiber.child, !1, nb, e, void 0, void 0));
      for (var n = (t = 0); n < mn.length; n++) {
        var a = mn[n];
        a.fragmentInstance === this && a.observer === e ? e.unobserve(a.instance) : (mn[t++] = a);
      }
      mn.length = t;
    }
  };
  function nb(e, t) {
    return (e.tag === 6 || ((e = B(e)), t.unobserve(e)), !1);
  }
  var mn = [],
    Qo = !1;
  function lb(e, t, n) {
    (mn.push({ fragmentInstance: e, observer: t, instance: n }),
      Qo ||
        ((Qo = !0),
        db(function () {
          Qo = !1;
          var a = mn;
          mn = [];
          for (var i = 0; i < a.length; i++) {
            var c = a[i];
            c.observer.unobserve(c.instance);
          }
        })));
  }
  Kt.prototype.getClientRects = function () {
    var e = [];
    return (g(this._fragmentFiber.child, !1, ab, e, void 0, void 0), e);
  };
  function ab(e, t) {
    if (e.tag === 6) {
      e = e.stateNode;
      var n = e.ownerDocument.createRange();
      (n.selectNodeContents(e), t.push.apply(t, n.getClientRects()));
    } else ((e = B(e)), t.push.apply(t, e.getClientRects()));
    return !1;
  }
  ((Kt.prototype.getRootNode = function (e) {
    var t = A(this._fragmentFiber);
    return t === null ? this : B(t).getRootNode(e);
  }),
    (Kt.prototype.compareDocumentPosition = function (e) {
      var t = A(this._fragmentFiber);
      if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
      var n = [];
      g(this._fragmentFiber.child, !1, Xo, n, void 0, void 0);
      var a = B(t);
      if (n.length === 0) {
        if (((n = a), w(this._fragmentFiber))) {
          e: {
            for (t = this._fragmentFiber.return; t !== null;) {
              if (t.tag === 4) {
                t = t.stateNode.containerInfo;
                break e;
              }
              if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
              t = t.return;
            }
            t = null;
          }
          t != null && (n = t);
        }
        t = this._fragmentFiber;
        var i = (a = n.compareDocumentPosition(e));
        return (
          n === e
            ? (i = Node.DOCUMENT_POSITION_CONTAINS)
            : a & Node.DOCUMENT_POSITION_CONTAINED_BY &&
              ((n = U(t)[1]),
              n === null
                ? (i = Node.DOCUMENT_POSITION_PRECEDING)
                : ((e = B(n).compareDocumentPosition(e)),
                  (i =
                    e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING
                      ? Node.DOCUMENT_POSITION_FOLLOWING
                      : Node.DOCUMENT_POSITION_PRECEDING))),
          (i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC)
        );
      }
      ((t = B(n[0])), (i = B(n[n.length - 1])));
      var c = w(this._fragmentFiber) ? t.parentElement : a;
      if (c == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
      ((a = c.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY),
        (c = c.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY));
      var d = t.compareDocumentPosition(e),
        p = i.compareDocumentPosition(e),
        y = d & Node.DOCUMENT_POSITION_CONTAINED_BY || p & Node.DOCUMENT_POSITION_CONTAINED_BY;
      return (
        (p =
          a && c && d & Node.DOCUMENT_POSITION_FOLLOWING && p & Node.DOCUMENT_POSITION_PRECEDING),
        (t =
          (a && t === e) || (c && i === e) || y || p
            ? Node.DOCUMENT_POSITION_CONTAINED_BY
            : (!a && t === e) || (!c && i === e)
              ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
              : d),
        t & Node.DOCUMENT_POSITION_DISCONNECTED ||
        t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC ||
        ub(t, this._fragmentFiber, n[0], n[n.length - 1], e)
          ? t
          : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
      );
    }));
  function ub(e, t, n, a, i) {
    var c = ql(i);
    if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      if ((n = !!c))
        e: {
          for (; c !== null;) {
            if (c.tag === 7 && (c === t || c.alternate === t)) {
              n = !0;
              break e;
            }
            c = c.return;
          }
          n = !1;
        }
      return n;
    }
    if (e & Node.DOCUMENT_POSITION_CONTAINS) {
      if (c === null)
        return ((c = i.ownerDocument), i === c || i === c.documentElement || i === c.body);
      e: {
        for (c = t, t = A(t); c !== null;) {
          if (!((c.tag !== 5 && c.tag !== 3 && c.tag !== 27) || (c !== t && c.alternate !== t))) {
            c = !0;
            break e;
          }
          c = c.return;
        }
        c = !1;
      }
      return c;
    }
    return e & Node.DOCUMENT_POSITION_PRECEDING
      ? ((t = !!c) &&
          !(t = c === n) &&
          ((t = ue(n, c, fe)),
          t === null ? (t = !1) : (g(t, !0, q, c, n), (c = k), (k = null), (t = c !== null))),
        t)
      : e & Node.DOCUMENT_POSITION_FOLLOWING
        ? ((t = !!c) &&
            !(t = c === a) &&
            ((t = ue(a, c, fe)),
            t === null
              ? (t = !1)
              : (g(t, !0, pe, c, a), (c = k), (ae = k = null), (t = c !== null))),
          t)
        : !1;
  }
  function Wp(e, t) {
    var n = e.ownerDocument.createRange();
    (n.selectNodeContents(e),
      (e = n.getBoundingClientRect()),
      window.scrollTo(
        window.scrollX + e.left,
        t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight,
      ));
  }
  Kt.prototype.scrollIntoView = function (e) {
    if (typeof e == 'object') throw Error(s(566));
    var t = [];
    g(this._fragmentFiber.child, !1, Xo, t, void 0, void 0);
    var n = e !== !1;
    if (t.length === 0) {
      var a = U(this._fragmentFiber);
      if (((a = n ? a[1] || a[0] || A(this._fragmentFiber) : a[0] || a[1]), a === null)) return;
      if (a.tag === 6) {
        ((e = B(a)), Wp(e, n));
        return;
      }
      if (((a = B(a)), a.nodeType !== 9)) {
        if (a.nodeType === 11) {
          ((n = 'host' in a ? a.host : null), n !== null && n.scrollIntoView(e));
          return;
        }
        a.scrollIntoView(e);
      }
    }
    for (a = n ? t.length - 1 : 0; a !== (n ? -1 : t.length);) {
      var i = t[a];
      (i.tag === 6 ? ((i = B(i)), Wp(i, n)) : B(i).scrollIntoView(e), (a += n ? -1 : 1));
    }
  };
  function ib(e, t) {
    return ((e = B(e)), ev(e, t), !1);
  }
  function ev(e, t) {
    (e.reactFragments == null && (e.reactFragments = new Set()), e.reactFragments.add(t));
  }
  function tv(e, t) {
    var n = t._eventListeners;
    if (n !== null)
      for (var a = 0; a < n.length; a++) {
        var i = n[a];
        e.addEventListener(i.type, i.attachedListener, Ja(i.optionsOrUseCapture));
      }
    e.nodeType !== 3 &&
      ((n = t._observers),
      n !== null &&
        n.forEach(function (c) {
          for (var d = 0, p = 0; p < mn.length; p++) {
            var y = mn[p];
            (y.fragmentInstance !== t || y.observer !== c || y.instance !== e) && (mn[d++] = y);
          }
          ((mn.length = d), c.observe(e));
        }),
      ev(e, t));
  }
  function cb(e, t) {
    var n = t._eventListeners;
    if (n !== null)
      for (var a = 0; a < n.length; a++) {
        var i = n[a];
        e.removeEventListener(i.type, i.attachedListener, Ja(i.optionsOrUseCapture));
      }
    e.nodeType !== 3 &&
      ((n = t._observers),
      n !== null &&
        n.forEach(function (c) {
          typeof c.rootMargin == 'string' ? lb(t, c, e) : c.unobserve(e);
        }),
      e.reactFragments != null && e.reactFragments.delete(t));
  }
  function $o(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
      var n = t;
      switch (((t = t.nextSibling), n.nodeName)) {
        case 'HTML':
        case 'HEAD':
        case 'BODY':
          ($o(n), wi(n));
          continue;
        case 'SCRIPT':
        case 'STYLE':
          continue;
        case 'LINK':
          if (n.rel.toLowerCase() === 'stylesheet') continue;
      }
      e.removeChild(n);
    }
  }
  function rb(e, t, n, a) {
    for (; e.nodeType === 1;) {
      var i = n;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!a && (e.nodeName !== 'INPUT' || e.type !== 'hidden')) break;
      } else if (a) {
        if (!e[gu])
          switch (t) {
            case 'meta':
              if (!e.hasAttribute('itemprop')) break;
              return e;
            case 'link':
              if (
                ((c = e.getAttribute('rel')),
                c === 'stylesheet' && e.hasAttribute('data-precedence'))
              )
                break;
              if (
                c !== i.rel ||
                e.getAttribute('href') !== (i.href == null || i.href === '' ? null : i.href) ||
                e.getAttribute('crossorigin') !== (i.crossOrigin == null ? null : i.crossOrigin) ||
                e.getAttribute('title') !== (i.title == null ? null : i.title)
              )
                break;
              return e;
            case 'style':
              if (e.hasAttribute('data-precedence')) break;
              return e;
            case 'script':
              if (
                ((c = e.getAttribute('src')),
                (c !== (i.src == null ? null : i.src) ||
                  e.getAttribute('type') !== (i.type == null ? null : i.type) ||
                  e.getAttribute('crossorigin') !==
                    (i.crossOrigin == null ? null : i.crossOrigin)) &&
                  c &&
                  e.hasAttribute('async') &&
                  !e.hasAttribute('itemprop'))
              )
                break;
              return e;
            default:
              return e;
          }
      } else if (t === 'input' && e.type === 'hidden') {
        var c = i.name == null ? null : '' + i.name;
        if (i.type === 'hidden' && e.getAttribute('name') === c) return e;
      } else return e;
      if (((e = an(e.nextSibling)), e === null)) break;
    }
    return null;
  }
  function sb(e, t, n) {
    if (t === '') return null;
    for (; e.nodeType !== 3;)
      if (
        ((e.nodeType !== 1 || e.nodeName !== 'INPUT' || e.type !== 'hidden') && !n) ||
        ((e = an(e.nextSibling)), e === null)
      )
        return null;
    return e;
  }
  function nv(e, t) {
    for (; e.nodeType !== 8;)
      if (
        ((e.nodeType !== 1 || e.nodeName !== 'INPUT' || e.type !== 'hidden') && !t) ||
        ((e = an(e.nextSibling)), e === null)
      )
        return null;
    return e;
  }
  function Ko(e) {
    return e.data === '$?' || e.data === '$~';
  }
  function Io(e) {
    return e.data === '$!' || (e.data === '$?' && e.ownerDocument.readyState !== 'loading');
  }
  function ob(e, t) {
    var n = e.ownerDocument;
    if (e.data === '$~') e._reactRetry = t;
    else if (e.data !== '$?' || n.readyState !== 'loading') t();
    else {
      var a = function () {
        (t(), n.removeEventListener('DOMContentLoaded', a));
      };
      (n.addEventListener('DOMContentLoaded', a), (e._reactRetry = a));
    }
  }
  function an(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (
          ((t = e.data),
          t === '$' ||
            t === '$!' ||
            t === '$?' ||
            t === '$~' ||
            t === '&' ||
            t === 'F!' ||
            t === 'F')
        )
          break;
        if (t === '/$' || t === '/&') return null;
      }
    }
    return e;
  }
  var Jo = null;
  function lv(e) {
    e = e.nextSibling;
    for (var t = 0; e;) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === '/$' || n === '/&') {
          if (t === 0) return an(e.nextSibling);
          t--;
        } else (n !== '$' && n !== '$!' && n !== '$?' && n !== '$~' && n !== '&') || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function av(e) {
    e = e.previousSibling;
    for (var t = 0; e;) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === '$' || n === '$!' || n === '$?' || n === '$~' || n === '&') {
          if (t === 0) return e;
          t--;
        } else (n !== '/$' && n !== '/&') || t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function fb(e, t) {
    function n() {
      a = !0;
    }
    if (e.ownerDocument.activeElement === e) return !0;
    var a = !1;
    try {
      (e.ownerDocument.addEventListener('focus', n, !0),
        (e.focus || HTMLElement.prototype.focus).call(e, t));
    } finally {
      e.ownerDocument.removeEventListener('focus', n, !0);
    }
    return a;
  }
  function db(e) {
    Gp(function () {
      Gp(function (t) {
        return e(t);
      });
    });
  }
  function uv(e, t, n) {
    switch (((t = ei(n)), e)) {
      case 'html':
        if (((e = t.documentElement), !e)) throw Error(s(452));
        return e;
      case 'head':
        if (((e = t.head), !e)) throw Error(s(453));
        return e;
      case 'body':
        if (((e = t.body), !e)) throw Error(s(454));
        return e;
      default:
        throw Error(s(451));
    }
  }
  function iv(e, t, n) {
    for (var a in n) {
      var i = n[a];
      n.hasOwnProperty(a) && i != null && De(e, t, a, null, q1, i);
    }
    (n.dangerouslySetInnerHTML != null && (e.textContent = ''),
      e.onclick === bn && (e.onclick = null),
      wi(e));
  }
  function Fo(e) {
    for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
    wi(e);
  }
  var un = new Map(),
    cv = new Set();
  function ti(e) {
    if (typeof e.getRootNode == 'function') {
      var t = e.getRootNode();
      if (t.nodeType === 9 || t.nodeType === 11) return t;
    }
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  var In = ne.d;
  ne.d = { f: hb, r: mb, D: pb, C: vb, L: yb, m: gb, X: _b, S: bb, M: Sb };
  function hb() {
    var e = In.f(),
      t = Uc();
    return e || t;
  }
  function mb(e) {
    var t = pa(e);
    t !== null && t.tag === 5 && t.type === 'form' ? sm(t) : In.r(e);
  }
  var Fa = typeof document > 'u' ? null : document;
  function rv(e, t, n) {
    var a = Fa;
    if (a && typeof t == 'string' && t) {
      var i = Ft(t);
      ((i = 'link[rel="' + e + '"][href="' + i + '"]'),
        typeof n == 'string' && (i += '[crossorigin="' + n + '"]'),
        cv.has(i) ||
          (cv.add(i),
          (e = { rel: e, crossOrigin: n, href: t }),
          a.querySelector(i) === null &&
            ((t = a.createElement('link')), pt(t, 'link', e), ut(t), a.head.appendChild(t))));
    }
  }
  function pb(e) {
    (In.D(e), rv('dns-prefetch', e, null));
  }
  function vb(e, t) {
    (In.C(e, t), rv('preconnect', e, t));
  }
  function yb(e, t, n) {
    In.L(e, t, n);
    var a = Fa;
    if (a && e && t) {
      var i = 'link[rel="preload"][as="' + Ft(t) + '"]';
      t === 'image' && n && n.imageSrcSet
        ? ((i += '[imagesrcset="' + Ft(n.imageSrcSet) + '"]'),
          typeof n.imageSizes == 'string' && (i += '[imagesizes="' + Ft(n.imageSizes) + '"]'))
        : (i += '[href="' + Ft(e) + '"]');
      var c = i;
      switch (t) {
        case 'style':
          c = Pa(e);
          break;
        case 'script':
          c = Wa(e);
      }
      if (!(
        un.has(c) ||
        ((e = W(
          { rel: 'preload', href: t === 'image' && n && n.imageSrcSet ? void 0 : e, as: t },
          n,
        )),
        un.set(c, e),
        a.querySelector(i) !== null ||
          (t === 'style' && a.querySelector(ni(c))) ||
          (t === 'script' && a.querySelector(li(c))))
      )) {
        var d = a.createElement('link');
        (pt(d, 'link', e),
          t === 'style' &&
            ((d[Di] = !0),
            (d.onload = d.onerror =
              function () {
                Sd(d);
              })),
          ut(d),
          a.head.appendChild(d));
      }
    }
  }
  function gb(e, t) {
    In.m(e, t);
    var n = Fa;
    if (n && e) {
      var a = t && typeof t.as == 'string' ? t.as : 'script',
        i = 'link[rel="modulepreload"][as="' + Ft(a) + '"][href="' + Ft(e) + '"]',
        c = i;
      switch (a) {
        case 'audioworklet':
        case 'paintworklet':
        case 'serviceworker':
        case 'sharedworker':
        case 'worker':
        case 'script':
          c = Wa(e);
      }
      if (
        !un.has(c) &&
        ((e = W({ rel: 'modulepreload', href: e }, t)), un.set(c, e), n.querySelector(i) === null)
      ) {
        switch (a) {
          case 'audioworklet':
          case 'paintworklet':
          case 'serviceworker':
          case 'sharedworker':
          case 'worker':
          case 'script':
            if (n.querySelector(li(c))) return;
        }
        ((a = n.createElement('link')), pt(a, 'link', e), ut(a), n.head.appendChild(a));
      }
    }
  }
  function bb(e, t, n) {
    In.S(e, t, n);
    var a = Fa;
    if (a && e) {
      var i = va(a).hoistableStyles,
        c = Pa(e);
      t = t || 'default';
      var d = i.get(c);
      if (!d) {
        var p = { loading: 0, preload: null };
        if ((d = a.querySelector(ni(c)))) p.loading = 5;
        else {
          ((e = W({ rel: 'stylesheet', href: e, 'data-precedence': t }, n)),
            (n = un.get(c)) && Po(e, n));
          var y = (d = a.createElement('link'));
          (ut(y),
            pt(y, 'link', e),
            (y._p = new Promise(function (j, D) {
              ((y.onload = j), (y.onerror = D));
            })),
            y.addEventListener('load', function () {
              p.loading |= 1;
            }),
            y.addEventListener('error', function () {
              p.loading |= 2;
            }),
            (p.loading |= 4),
            Yc(d, t, a));
        }
        ((d = { type: 'stylesheet', instance: d, count: 1, state: p }), i.set(c, d));
      }
    }
  }
  function _b(e, t) {
    In.X(e, t);
    var n = Fa;
    if (n && e) {
      var a = va(n).hoistableScripts,
        i = Wa(e),
        c = a.get(i);
      c ||
        ((c = n.querySelector(li(i))),
        c ||
          ((e = W({ src: e, async: !0 }, t)),
          (t = un.get(i)) && Wo(e, t),
          (c = n.createElement('script')),
          ut(c),
          pt(c, 'link', e),
          n.head.appendChild(c)),
        (c = { type: 'script', instance: c, count: 1, state: null }),
        a.set(i, c));
    }
  }
  function Sb(e, t) {
    In.M(e, t);
    var n = Fa;
    if (n && e) {
      var a = va(n).hoistableScripts,
        i = Wa(e),
        c = a.get(i);
      c ||
        ((c = n.querySelector(li(i))),
        c ||
          ((e = W({ src: e, async: !0, type: 'module' }, t)),
          (t = un.get(i)) && Wo(e, t),
          (c = n.createElement('script')),
          ut(c),
          pt(c, 'link', e),
          n.head.appendChild(c)),
        (c = { type: 'script', instance: c, count: 1, state: null }),
        a.set(i, c));
    }
  }
  function sv(e, t, n, a) {
    var i = (i = el.current) ? ti(i) : null;
    if (!i) throw Error(s(446));
    switch (e) {
      case 'meta':
      case 'title':
        return null;
      case 'style':
        return typeof n.precedence == 'string' && typeof n.href == 'string'
          ? ((n = Pa(n.href)),
            (t = va(i).hoistableStyles),
            (a = t.get(n)),
            a || ((a = { type: 'style', instance: null, count: 0, state: null }), t.set(n, a)),
            a)
          : { type: 'void', instance: null, count: 0, state: null };
      case 'link':
        if (
          n.rel === 'stylesheet' &&
          typeof n.href == 'string' &&
          typeof n.precedence == 'string'
        ) {
          e = Pa(n.href);
          var c = va(i).hoistableStyles,
            d = c.get(e);
          if (
            (d ||
              ((i = i.ownerDocument || i),
              (d = {
                type: 'stylesheet',
                instance: null,
                count: 0,
                state: { loading: 0, preload: null },
              }),
              c.set(e, d),
              (c = i.querySelector(ni(e)))
                ? c._p || ((d.instance = c), (d.state.loading = 5))
                : ((c = un.get(e)),
                  c ||
                    ((c = {
                      rel: 'preload',
                      as: 'style',
                      href: n.href,
                      crossOrigin: n.crossOrigin,
                      integrity: n.integrity,
                      media: n.media,
                      hrefLang: n.hrefLang,
                      referrerPolicy: n.referrerPolicy,
                    }),
                    un.set(e, c)),
                  zb(i, e, c, d.state))),
            t && a === null)
          )
            throw Error(s(528, ''));
          return d;
        }
        if (t && a !== null) throw Error(s(529, ''));
        return null;
      case 'script':
        return (
          (t = n.async),
          (n = n.src),
          typeof n == 'string' && t && typeof t != 'function' && typeof t != 'symbol'
            ? ((n = Wa(n)),
              (t = va(i).hoistableScripts),
              (a = t.get(n)),
              a || ((a = { type: 'script', instance: null, count: 0, state: null }), t.set(n, a)),
              a)
            : { type: 'void', instance: null, count: 0, state: null }
        );
      default:
        throw Error(s(444, e));
    }
  }
  function Pa(e) {
    return 'href="' + Ft(e) + '"';
  }
  function ni(e) {
    return 'link[rel="stylesheet"][' + e + ']';
  }
  function ov(e) {
    return W({}, e, { 'data-precedence': e.precedence, precedence: null });
  }
  function zb(e, t, n, a) {
    if ((t = e.querySelector('link[rel="preload"][as="style"][' + t + ']'))) {
      if (t[Di] !== !0) {
        a.loading = 1;
        return;
      }
    } else
      ((t = e.createElement('link')),
        (t[Di] = !0),
        (t.onload = t.onerror = Sd.bind(null, t)),
        pt(t, 'link', n),
        ut(t),
        e.head.appendChild(t));
    ((a.preload = t),
      t.addEventListener('load', function () {
        return (a.loading |= 1);
      }),
      t.addEventListener('error', function () {
        return (a.loading |= 2);
      }));
  }
  function Wa(e) {
    return '[src="' + Ft(e) + '"]';
  }
  function li(e) {
    return 'script[async]' + e;
  }
  function fv(e, t, n) {
    if ((t.count++, t.instance === null))
      switch (t.type) {
        case 'style':
          var a = e.querySelector('style[data-href~="' + Ft(n.href) + '"]');
          if (a) return ((t.instance = a), ut(a), a);
          var i = W({}, n, {
            'data-href': n.href,
            'data-precedence': n.precedence,
            href: null,
            precedence: null,
          });
          return (
            (a = (e.ownerDocument || e).createElement('style')),
            ut(a),
            pt(a, 'style', i),
            Yc(a, n.precedence, e),
            (t.instance = a)
          );
        case 'stylesheet':
          i = Pa(n.href);
          var c = e.querySelector(ni(i));
          if (c) return ((t.state.loading |= 4), (t.instance = c), ut(c), c);
          ((a = ov(n)),
            (i = un.get(i)) && Po(a, i),
            (c = (e.ownerDocument || e).createElement('link')),
            ut(c));
          var d = c;
          return (
            (d._p = new Promise(function (p, y) {
              ((d.onload = p), (d.onerror = y));
            })),
            pt(c, 'link', a),
            (t.state.loading |= 4),
            Yc(c, n.precedence, e),
            (t.instance = c)
          );
        case 'script':
          return (
            (c = Wa(n.src)),
            (i = e.querySelector(li(c)))
              ? ((t.instance = i), ut(i), i)
              : ((a = n),
                (i = un.get(c)) && ((a = W({}, n)), Wo(a, i)),
                (e = e.ownerDocument || e),
                (i = e.createElement('script')),
                ut(i),
                pt(i, 'link', a),
                e.head.appendChild(i),
                (t.instance = i))
          );
        case 'void':
          return null;
        default:
          throw Error(s(443, t.type));
      }
    else
      t.type === 'stylesheet' &&
        (t.state.loading & 4) === 0 &&
        ((a = t.instance), (t.state.loading |= 4), Yc(a, n.precedence, e));
    return t.instance;
  }
  function Yc(e, t, n) {
    for (
      var a = n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),
        i = a.length ? a[a.length - 1] : null,
        c = i,
        d = 0;
      d < a.length;
      d++
    ) {
      var p = a[d];
      if (p.dataset.precedence === t) c = p;
      else if (c !== i) break;
    }
    c
      ? c.parentNode.insertBefore(e, c.nextSibling)
      : ((t = n.nodeType === 9 ? n.head : n), t.insertBefore(e, t.firstChild));
  }
  function Po(e, t) {
    (e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
      e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
      e.title == null && (e.title = t.title));
  }
  function Wo(e, t) {
    (e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
      e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
      e.integrity == null && (e.integrity = t.integrity));
  }
  var Vc = null;
  function dv(e, t, n) {
    if (Vc === null) {
      var a = new Map(),
        i = (Vc = new Map());
      i.set(n, a);
    } else ((i = Vc), (a = i.get(n)), a || ((a = new Map()), i.set(n, a)));
    if (a.has(e)) return a;
    for (a.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
      var c = n[i];
      if (
        !(c[gu] || c[ot] || (e === 'link' && c.getAttribute('rel') === 'stylesheet')) &&
        c.namespaceURI !== 'http://www.w3.org/2000/svg'
      ) {
        var d = c.getAttribute(t) || '';
        d = e + d;
        var p = a.get(d);
        p ? p.push(c) : a.set(d, [c]);
      }
    }
    return a;
  }
  function ef(e, t, n) {
    ((e = e.ownerDocument || e),
      e.head.insertBefore(n, t === 'title' ? e.querySelector('head > title') : null));
  }
  function Nb(e, t, n) {
    if (n === 1 || t.itemProp != null) return !1;
    switch (e) {
      case 'meta':
      case 'title':
        return !0;
      case 'style':
        if (typeof t.precedence != 'string' || typeof t.href != 'string' || t.href === '') break;
        return !0;
      case 'link':
        if (
          typeof t.rel != 'string' ||
          typeof t.href != 'string' ||
          t.href === '' ||
          t.onLoad ||
          t.onError
        )
          break;
        switch (t.rel) {
          case 'stylesheet':
            return ((e = t.disabled), typeof t.precedence == 'string' && e == null);
          default:
            return !0;
        }
      case 'script':
        if (
          t.async &&
          typeof t.async != 'function' &&
          typeof t.async != 'symbol' &&
          !t.onLoad &&
          !t.onError &&
          t.src &&
          typeof t.src == 'string'
        )
          return !0;
    }
    return !1;
  }
  function hv(e, t) {
    return e === 'img' && t.src != null && t.src !== '' && t.onLoad == null && t.loading !== 'lazy';
  }
  function mv(e) {
    return !(e.type === 'stylesheet' && (e.state.loading & 3) === 0);
  }
  function pv(e) {
    return (
      (e.width || 100) *
      (e.height || 100) *
      (typeof devicePixelRatio == 'number' ? devicePixelRatio : 1) *
      0.25
    );
  }
  function vv(e, t) {
    typeof t.decode == 'function' &&
      (e.imgCount++,
      t.complete || ((e.imgBytes += pv(t)), e.suspenseyImages.push(t)),
      (e = jb.bind(e)),
      t.decode().then(e, e));
  }
  function Eb(e, t, n, a) {
    if (
      n.type === 'stylesheet' &&
      (typeof a.media != 'string' || matchMedia(a.media).matches !== !1) &&
      (n.state.loading & 4) === 0
    ) {
      if (n.instance === null) {
        var i = Pa(a.href),
          c = t.querySelector(ni(i));
        if (c) {
          ((t = c._p),
            t !== null &&
              typeof t == 'object' &&
              typeof t.then == 'function' &&
              (e.count++, (e = ai.bind(e)), t.then(e, e)),
            (n.state.loading |= 4),
            (n.instance = c),
            ut(c));
          return;
        }
        ((c = t.ownerDocument || t),
          (a = ov(a)),
          (i = un.get(i)) && Po(a, i),
          (c = c.createElement('link')),
          ut(c));
        var d = c;
        ((d._p = new Promise(function (p, y) {
          ((d.onload = p), (d.onerror = y));
        })),
          pt(c, 'link', a),
          (n.instance = c));
      }
      (e.stylesheets === null && (e.stylesheets = new Map()),
        e.stylesheets.set(n, t),
        (t = n.state.preload) &&
          (n.state.loading & 3) === 0 &&
          (e.count++,
          (n = ai.bind(e)),
          t.addEventListener('load', n),
          t.addEventListener('error', n)));
    }
  }
  var Gc = 0;
  function Tb(e, t) {
    return (
      e.stylesheets && e.count === 0 && Qc(e, e.stylesheets),
      0 < e.count || 0 < e.imgCount
        ? function (n) {
            var a = setTimeout(function () {
              if ((e.stylesheets && Qc(e, e.stylesheets), e.unsuspend)) {
                var c = e.unsuspend;
                ((e.unsuspend = null), c());
              }
            }, 6e4 + t);
            0 < e.imgBytes && Gc === 0 && (Gc = 62500 * V1());
            var i = setTimeout(
              function () {
                if (
                  ((e.waitingForImages = !1),
                  e.count === 0 && (e.stylesheets && Qc(e, e.stylesheets), e.unsuspend))
                ) {
                  var c = e.unsuspend;
                  ((e.unsuspend = null), c());
                }
              },
              (e.imgBytes > Gc ? 50 : 800) + t,
            );
            return (
              (e.unsuspend = n),
              function () {
                ((e.unsuspend = null), clearTimeout(a), clearTimeout(i));
              }
            );
          }
        : null
    );
  }
  function yv(e) {
    if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
      if (e.stylesheets) Qc(e, e.stylesheets);
      else if (e.unsuspend) {
        var t = e.unsuspend;
        ((e.unsuspend = null), t());
      }
    }
  }
  function ai() {
    (this.count--, yv(this));
  }
  function jb() {
    (this.imgCount--, yv(this));
  }
  var Xc = null;
  function Qc(e, t) {
    ((e.stylesheets = null),
      e.unsuspend !== null &&
        (e.count++, (Xc = new Map()), t.forEach(xb, e), (Xc = null), ai.call(e)));
  }
  function xb(e, t) {
    if (!(t.state.loading & 4)) {
      var n = Xc.get(e);
      if (n) var a = n.get(null);
      else {
        ((n = new Map()), Xc.set(e, n));
        for (
          var i = e.querySelectorAll('link[data-precedence],style[data-precedence]'), c = 0;
          c < i.length;
          c++
        ) {
          var d = i[c];
          (d.nodeName === 'LINK' || d.getAttribute('media') !== 'not all') &&
            (n.set(d.dataset.precedence, d), (a = d));
        }
        a && n.set(null, a);
      }
      ((i = t.instance),
        (d = i.getAttribute('data-precedence')),
        (c = n.get(d) || a),
        c === a && n.set(null, i),
        n.set(d, i),
        this.count++,
        (a = ai.bind(this)),
        i.addEventListener('load', a),
        i.addEventListener('error', a),
        c
          ? c.parentNode.insertBefore(i, c.nextSibling)
          : ((e = e.nodeType === 9 ? e.head : e), e.insertBefore(i, e.firstChild)),
        (t.state.loading |= 4));
    }
  }
  var eu = {
    $$typeof: Ie,
    Provider: null,
    Consumer: null,
    _currentValue: Mn,
    _currentValue2: Mn,
    _threadCount: 0,
  };
  function Ob(e, t, n, a, i, c, d, p, y) {
    ((this.tag = 1),
      (this.containerInfo = e),
      (this.pingCache = this.current = this.pendingChildren = null),
      (this.timeoutHandle = -1),
      (this.callbackNode =
        this.next =
        this.pendingContext =
        this.context =
        this.cancelPendingCommit =
          null),
      (this.callbackPriority = 0),
      (this.expirationTimes = Rr(-1)),
      (this.entangledLanes =
        this.shellSuspendCounter =
        this.errorRecoveryDisabledLanes =
        this.expiredLanes =
        this.warmLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = Rr(0)),
      (this.hiddenUpdates = Rr(null)),
      (this.identifierPrefix = a),
      (this.onUncaughtError = i),
      (this.onCaughtError = c),
      (this.onRecoverableError = d),
      (this.pooledCache = null),
      (this.pooledCacheLanes = 0),
      (this.formState = y),
      (this.transitionTypes = null),
      (this.incompleteTransitions = new Map()));
  }
  function gv(e, t, n, a, i, c, d, p, y, j, D, M) {
    return (
      (e = new Ob(e, t, n, d, y, j, D, M, p)),
      (t = 1),
      c === !0 && (t |= 24),
      (c = At(3, null, null, t)),
      (e.current = c),
      (c.stateNode = e),
      (t = ms()),
      t.refCount++,
      (e.pooledCache = t),
      t.refCount++,
      (c.memoizedState = { element: a, isDehydrated: n, cache: t }),
      gs(c),
      e
    );
  }
  function bv(e) {
    return e ? ((e = ja), e) : ja;
  }
  function _v(e, t, n, a, i, c) {
    ((i = bv(i)),
      a.context === null ? (a.context = i) : (a.pendingContext = i),
      (a = fl(t)),
      (a.payload = { element: n }),
      (c = c === void 0 ? null : c),
      c !== null && (a.callback = c),
      (n = dl(e, a, t)),
      n !== null && (Rt(n, e, t), Uu(n, e, t)));
  }
  function Sv(e, t) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function tf(e, t) {
    (Sv(e, t), (e = e.alternate) && Sv(e, t));
  }
  function zv(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Xl(e, 67108864);
      (t !== null && Rt(t, e, 67108864), tf(e, 67108864));
    }
  }
  function Nv(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = $t();
      t = Mr(t);
      var n = Xl(e, t);
      (n !== null && Rt(n, e, t), tf(e, t));
    }
  }
  var tu = !0;
  function Ab(e, t, n, a) {
    var i = K.T;
    K.T = null;
    var c = ne.p;
    try {
      ((ne.p = 2), nf(e, t, n, a));
    } finally {
      ((ne.p = c), (K.T = i));
    }
  }
  function Cb(e, t, n, a) {
    var i = K.T;
    K.T = null;
    var c = ne.p;
    try {
      ((ne.p = 8), nf(e, t, n, a));
    } finally {
      ((ne.p = c), (K.T = i));
    }
  }
  function nf(e, t, n, a) {
    if (tu) {
      var i = lf(a);
      if (i === null) (Ho(e, t, a, $c, n), Tv(e, a));
      else if (wb(i, e, t, n, a)) a.stopPropagation();
      else if ((Tv(e, a), t & 4 && -1 < Db.indexOf(e))) {
        for (; i !== null;) {
          var c = pa(i);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (((c = c.stateNode), c.current.memoizedState.isDehydrated)) {
                  var d = Bl(c.pendingLanes);
                  if (d !== 0) {
                    var p = c;
                    for (p.pendingLanes |= 2, p.entangledLanes |= 2; d;) {
                      var y = 1 << (31 - Bt(d));
                      ((p.entanglements[1] |= y), (d &= ~y));
                    }
                    (An(c), (Ee & 6) === 0 && ((wc = kt() + 500), Fu(0)));
                  }
                }
                break;
              case 31:
              case 13:
                ((p = Xl(c, 2)), p !== null && Rt(p, c, 2), Uc(), tf(c, 2));
            }
          if (((c = lf(a)), c === null && Ho(e, t, a, $c, n), c === i)) break;
          i = c;
        }
        i !== null && a.stopPropagation();
      } else Ho(e, t, a, null, n);
    }
  }
  function lf(e) {
    return ((e = qr(e)), af(e));
  }
  var $c = null;
  function af(e) {
    if ((($c = null), (e = ql(e)), e !== null)) {
      var t = h(e);
      if (t === null) e = null;
      else {
        var n = t.tag;
        if (n === 13) {
          if (((e = m(t)), e !== null)) return e;
          e = null;
        } else if (n === 31) {
          if (((e = v(t)), e !== null)) return e;
          e = null;
        } else if (n === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return (($c = e), null);
  }
  function Ev(e) {
    switch (e) {
      case 'beforetoggle':
      case 'cancel':
      case 'click':
      case 'close':
      case 'contextmenu':
      case 'copy':
      case 'cut':
      case 'auxclick':
      case 'dblclick':
      case 'dragend':
      case 'dragstart':
      case 'drop':
      case 'focusin':
      case 'focusout':
      case 'input':
      case 'invalid':
      case 'keydown':
      case 'keypress':
      case 'keyup':
      case 'mousedown':
      case 'mouseup':
      case 'paste':
      case 'pause':
      case 'play':
      case 'pointercancel':
      case 'pointerdown':
      case 'pointerup':
      case 'ratechange':
      case 'reset':
      case 'seeked':
      case 'submit':
      case 'toggle':
      case 'touchcancel':
      case 'touchend':
      case 'touchstart':
      case 'volumechange':
      case 'change':
      case 'selectionchange':
      case 'textInput':
      case 'compositionstart':
      case 'compositionend':
      case 'compositionupdate':
      case 'beforeblur':
      case 'afterblur':
      case 'beforeinput':
      case 'blur':
      case 'fullscreenchange':
      case 'fullscreenerror':
      case 'focus':
      case 'hashchange':
      case 'popstate':
      case 'select':
      case 'selectstart':
        return 2;
      case 'drag':
      case 'dragenter':
      case 'dragexit':
      case 'dragleave':
      case 'dragover':
      case 'mousemove':
      case 'mouseout':
      case 'mouseover':
      case 'pointermove':
      case 'pointerout':
      case 'pointerover':
      case 'resize':
      case 'scroll':
      case 'touchmove':
      case 'wheel':
      case 'mouseenter':
      case 'mouseleave':
      case 'pointerenter':
      case 'pointerleave':
        return 8;
      case 'message':
        switch (V0()) {
          case sd:
            return 2;
          case od:
            return 8;
          case ji:
          case G0:
            return 32;
          case fd:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var uf = !1,
    El = null,
    Tl = null,
    jl = null,
    ui = new Map(),
    ii = new Map(),
    xl = [],
    Db =
      'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset'.split(
        ' ',
      );
  function Tv(e, t) {
    switch (e) {
      case 'focusin':
      case 'focusout':
        El = null;
        break;
      case 'dragenter':
      case 'dragleave':
        Tl = null;
        break;
      case 'mouseover':
      case 'mouseout':
        jl = null;
        break;
      case 'pointerover':
      case 'pointerout':
        ui.delete(t.pointerId);
        break;
      case 'gotpointercapture':
      case 'lostpointercapture':
        ii.delete(t.pointerId);
    }
  }
  function ci(e, t, n, a, i, c) {
    return e === null || e.nativeEvent !== c
      ? ((e = {
          blockedOn: t,
          domEventName: n,
          eventSystemFlags: a,
          nativeEvent: c,
          targetContainers: [i],
        }),
        t !== null && ((t = pa(t)), t !== null && zv(t)),
        e)
      : ((e.eventSystemFlags |= a),
        (t = e.targetContainers),
        i !== null && t.indexOf(i) === -1 && t.push(i),
        e);
  }
  function wb(e, t, n, a, i) {
    switch (t) {
      case 'focusin':
        return ((El = ci(El, e, t, n, a, i)), !0);
      case 'dragenter':
        return ((Tl = ci(Tl, e, t, n, a, i)), !0);
      case 'mouseover':
        return ((jl = ci(jl, e, t, n, a, i)), !0);
      case 'pointerover':
        var c = i.pointerId;
        return (ui.set(c, ci(ui.get(c) || null, e, t, n, a, i)), !0);
      case 'gotpointercapture':
        return ((c = i.pointerId), ii.set(c, ci(ii.get(c) || null, e, t, n, a, i)), !0);
    }
    return !1;
  }
  function jv(e) {
    var t = ql(e.target);
    if (t !== null) {
      var n = h(t);
      if (n !== null) {
        if (((t = n.tag), t === 13)) {
          if (((t = m(n)), t !== null)) {
            ((e.blockedOn = t),
              gd(e.priority, function () {
                Nv(n);
              }));
            return;
          }
        } else if (t === 31) {
          if (((t = v(n)), t !== null)) {
            ((e.blockedOn = t),
              gd(e.priority, function () {
                Nv(n);
              }));
            return;
          }
        } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Kc(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length;) {
      var n = lf(e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var a = new n.constructor(n.type, n);
        ((Br = a), n.target.dispatchEvent(a), (Br = null));
      } else return ((t = pa(n)), t !== null && zv(t), (e.blockedOn = n), !1);
      t.shift();
    }
    return !0;
  }
  function xv(e, t, n) {
    Kc(e) && n.delete(t);
  }
  function Rb() {
    ((uf = !1),
      El !== null && Kc(El) && (El = null),
      Tl !== null && Kc(Tl) && (Tl = null),
      jl !== null && Kc(jl) && (jl = null),
      ui.forEach(xv),
      ii.forEach(xv));
  }
  function Ic(e, t) {
    e.blockedOn === t &&
      ((e.blockedOn = null),
      uf || ((uf = !0), l.unstable_scheduleCallback(l.unstable_NormalPriority, Rb)));
  }
  var Jc = null;
  function Ov(e) {
    Jc !== e &&
      ((Jc = e),
      l.unstable_scheduleCallback(l.unstable_NormalPriority, function () {
        Jc === e && (Jc = null);
        for (var t = 0; t < e.length; t += 3) {
          var n = e[t],
            a = e[t + 1],
            i = e[t + 2];
          if (typeof a != 'function') {
            if (af(a || n) === null) continue;
            break;
          }
          var c = pa(n);
          c !== null &&
            (e.splice(t, 3),
            (t -= 3),
            Ls(c, { pending: !0, data: i, method: n.method, action: a }, a, i));
        }
      }));
  }
  function nu(e) {
    function t(y) {
      return Ic(y, e);
    }
    (El !== null && Ic(El, e),
      Tl !== null && Ic(Tl, e),
      jl !== null && Ic(jl, e),
      ui.forEach(t),
      ii.forEach(t));
    for (var n = 0; n < xl.length; n++) {
      var a = xl[n];
      a.blockedOn === e && (a.blockedOn = null);
    }
    for (; 0 < xl.length && ((n = xl[0]), n.blockedOn === null);)
      (jv(n), n.blockedOn === null && xl.shift());
    if (((n = (e.ownerDocument || e).$$reactFormReplay), n != null))
      for (a = 0; a < n.length; a += 3) {
        var i = n[a],
          c = n[a + 1],
          d = i[Ot] || null;
        if (typeof c == 'function') d || Ov(n);
        else if (d) {
          var p = null;
          if (c && c.hasAttribute('formAction')) {
            if (((i = c), (d = c[Ot] || null))) p = d.formAction;
            else if (af(i) !== null) continue;
          } else p = d.action;
          (typeof p == 'function' ? (n[a + 1] = p) : (n.splice(a, 3), (a -= 3)), Ov(n));
        }
      }
  }
  function Av() {
    function e(c) {
      c.canIntercept &&
        c.info === 'react-transition' &&
        c.intercept({
          handler: function () {
            return new Promise(function (d) {
              return (i = d);
            });
          },
          focusReset: 'manual',
          scroll: 'manual',
        });
    }
    function t() {
      (i !== null && (i(), (i = null)), a || setTimeout(n, 20));
    }
    function n() {
      if (!a && !navigation.transition) {
        var c = navigation.currentEntry;
        c &&
          c.url != null &&
          navigation.navigate(c.url, {
            state: c.getState(),
            info: 'react-transition',
            history: 'replace',
          });
      }
    }
    if (typeof navigation == 'object') {
      var a = !1,
        i = null;
      return (
        navigation.addEventListener('navigate', e),
        navigation.addEventListener('navigatesuccess', t),
        navigation.addEventListener('navigateerror', t),
        setTimeout(n, 100),
        function () {
          ((a = !0),
            navigation.removeEventListener('navigate', e),
            navigation.removeEventListener('navigatesuccess', t),
            navigation.removeEventListener('navigateerror', t),
            i !== null && (i(), (i = null)));
        }
      );
    }
  }
  function cf(e) {
    this._internalRoot = e;
  }
  ((Fc.prototype.render = cf.prototype.render =
    function (e) {
      var t = this._internalRoot;
      if (t === null) throw Error(s(409));
      var n = t.current,
        a = $t();
      _v(n, a, e, t, null, null);
    }),
    (Fc.prototype.unmount = cf.prototype.unmount =
      function () {
        var e = this._internalRoot;
        if (e !== null) {
          this._internalRoot = null;
          var t = e.containerInfo;
          (_v(e.current, 2, null, e, null, null), Uc(), (t[ma] = null));
        }
      }));
  function Fc(e) {
    this._internalRoot = e;
  }
  Fc.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
      var t = yd();
      e = { blockedOn: null, target: e, priority: t };
      for (var n = 0; n < xl.length && t !== 0 && t < xl[n].priority; n++);
      (xl.splice(n, 0, e), n === 0 && jv(e));
    }
  };
  var Cv = u.version;
  if (Cv !== '19.3.0') throw Error(s(527, Cv, '19.3.0'));
  ne.findDOMNode = function (e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == 'function'
        ? Error(s(188))
        : ((e = Object.keys(e).join(',')), Error(s(268, e)));
    return ((e = S(t)), (e = e !== null ? _(e) : null), (e = e === null ? null : e.stateNode), e);
  };
  var Mb = {
    bundleType: 0,
    version: '19.3.0',
    rendererPackageName: 'react-dom',
    currentDispatcherRef: K,
    reconcilerVersion: '19.3.0',
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
    var Pc = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Pc.isDisabled && Pc.supportsFiber)
      try {
        ((pu = Pc.inject(Mb)), (Lt = Pc));
      } catch {}
  }
  return (
    (si.createRoot = function (e, t) {
      if (!f(e)) throw Error(s(299));
      var n = !1,
        a = '',
        i = bm,
        c = _m,
        d = Sm;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (n = !0),
          t.identifierPrefix !== void 0 && (a = t.identifierPrefix),
          t.onUncaughtError !== void 0 && (i = t.onUncaughtError),
          t.onCaughtError !== void 0 && (c = t.onCaughtError),
          t.onRecoverableError !== void 0 && (d = t.onRecoverableError)),
        (t = gv(e, 1, !1, null, null, n, a, null, i, c, d, Av)),
        (e[ma] = t.current),
        Zo(e),
        new cf(t)
      );
    }),
    (si.hydrateRoot = function (e, t, n) {
      if (!f(e)) throw Error(s(299));
      var a = !1,
        i = '',
        c = bm,
        d = _m,
        p = Sm,
        y = null;
      return (
        n != null &&
          (n.unstable_strictMode === !0 && (a = !0),
          n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
          n.onUncaughtError !== void 0 && (c = n.onUncaughtError),
          n.onCaughtError !== void 0 && (d = n.onCaughtError),
          n.onRecoverableError !== void 0 && (p = n.onRecoverableError),
          n.formState !== void 0 && (y = n.formState)),
        (t = gv(e, 1, !0, t, n ?? null, a, i, y, c, d, p, Av)),
        (t.context = bv(null)),
        (n = t.current),
        (a = $t()),
        (a = Mr(a)),
        (i = fl(a)),
        (i.callback = null),
        dl(n, i, a),
        (n = a),
        (t.current.lanes = n),
        yu(t, n),
        An(t),
        (e[ma] = t.current),
        Zo(e),
        new Fc(t)
      );
    }),
    (si.version = '19.3.0'),
    si
  );
}
var Bv;
function Xb() {
  if (Bv) return of.exports;
  Bv = 1;
  function l() {
    if (!(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
    ))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l);
      } catch (u) {
        console.error(u);
      }
  }
  return (l(), (of.exports = Gb()), of.exports);
}
var Qb = Xb();
const $b = jy(Qb);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Kb = (l) => l.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
  xy = (...l) =>
    l
      .filter((u, r, s) => !!u && u.trim() !== '' && s.indexOf(u) === r)
      .join(' ')
      .trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var Ib = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Jb = $.forwardRef(
  (
    {
      color: l = 'currentColor',
      size: u = 24,
      strokeWidth: r = 2,
      absoluteStrokeWidth: s,
      className: f = '',
      children: h,
      iconNode: m,
      ...v
    },
    b,
  ) =>
    $.createElement(
      'svg',
      {
        ref: b,
        ...Ib,
        width: u,
        height: u,
        stroke: l,
        strokeWidth: s ? (Number(r) * 24) / Number(u) : r,
        className: xy('lucide', f),
        ...v,
      },
      [...m.map(([S, _]) => $.createElement(S, _)), ...(Array.isArray(h) ? h : [h])],
    ),
);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oe = (l, u) => {
  const r = $.forwardRef(({ className: s, ...f }, h) =>
    $.createElement(Jb, { ref: h, iconNode: u, className: xy(`lucide-${Kb(l)}`, s), ...f }),
  );
  return ((r.displayName = `${l}`), r);
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Cn = Oe('Activity', [
  [
    'path',
    {
      d: 'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2',
      key: '169zse',
    },
  ],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kf = Oe('ArrowRight', [
  ['path', { d: 'M5 12h14', key: '1ays0h' }],
  ['path', { d: 'm12 5 7 7-7 7', key: 'xquz4c' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Fb = Oe('BadgeCheck', [
  [
    'path',
    {
      d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      key: '3c2336',
    },
  ],
  ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pb = Oe('Bot', [
  ['path', { d: 'M12 8V4H8', key: 'hb8ula' }],
  ['rect', { width: '16', height: '12', x: '4', y: '8', rx: '2', key: 'enze0r' }],
  ['path', { d: 'M2 14h2', key: 'vft8re' }],
  ['path', { d: 'M20 14h2', key: '4cs60a' }],
  ['path', { d: 'M15 13v2', key: '1xurst' }],
  ['path', { d: 'M9 13v2', key: 'rq6x2g' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Wb = Oe('Box', [
  [
    'path',
    {
      d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
      key: 'hh9hay',
    },
  ],
  ['path', { d: 'm3.3 7 8.7 5 8.7-5', key: 'g66t2b' }],
  ['path', { d: 'M12 22V12', key: 'd0xqtd' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Lf = Oe('Check', [['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const e_ = Oe('ChevronDown', [['path', { d: 'm6 9 6 6 6-6', key: 'qrunsl' }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const t_ = Oe('ClipboardCopy', [
  ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1', key: 'tgr4d6' }],
  ['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2', key: '4jdomd' }],
  ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v4', key: '3hqy98' }],
  ['path', { d: 'M21 14H11', key: '1bme5i' }],
  ['path', { d: 'm15 10-4 4 4 4', key: '5dvupr' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const n_ = Oe('Command', [
  [
    'path',
    { d: 'M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3', key: '11bfej' },
  ],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const mf = Oe('Container', [
  [
    'path',
    {
      d: 'M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z',
      key: '1t2lqe',
    },
  ],
  ['path', { d: 'M10 21.9V14L2.1 9.1', key: 'o7czzq' }],
  ['path', { d: 'm10 14 11.9-6.9', key: 'zm5e20' }],
  ['path', { d: 'M14 19.8v-8.1', key: '159ecu' }],
  ['path', { d: 'M18 17.5V9.4', key: '11uown' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const l_ = Oe('Database', [
  ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3', key: 'msslwz' }],
  ['path', { d: 'M3 5V19A9 3 0 0 0 21 19V5', key: '1wlel7' }],
  ['path', { d: 'M3 12A9 3 0 0 0 21 12', key: 'mv7ke4' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const a_ = Oe('EyeOff', [
  [
    'path',
    {
      d: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
      key: 'ct8e1f',
    },
  ],
  ['path', { d: 'M14.084 14.158a3 3 0 0 1-4.242-4.242', key: '151rxh' }],
  [
    'path',
    {
      d: 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
      key: '13bj9a',
    },
  ],
  ['path', { d: 'm2 2 20 20', key: '1ooewy' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const u_ = Oe('Eye', [
  [
    'path',
    {
      d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
      key: '1nclc0',
    },
  ],
  ['circle', { cx: '12', cy: '12', r: '3', key: '1v7zrd' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const pi = Oe('Fingerprint', [
  ['path', { d: 'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4', key: '1nerag' }],
  ['path', { d: 'M14 13.12c0 2.38 0 6.38-1 8.88', key: 'o46ks0' }],
  ['path', { d: 'M17.29 21.02c.12-.6.43-2.3.5-3.02', key: 'ptglia' }],
  ['path', { d: 'M2 12a10 10 0 0 1 18-6', key: 'ydlgp0' }],
  ['path', { d: 'M2 16h.01', key: '1gqxmh' }],
  ['path', { d: 'M21.8 16c.2-2 .131-5.354 0-6', key: 'drycrb' }],
  ['path', { d: 'M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2', key: '1tidbn' }],
  ['path', { d: 'M8.65 22c.21-.66.45-1.32.57-2', key: '13wd9y' }],
  ['path', { d: 'M9 6.8a6 6 0 0 1 9 5.2v2', key: '1fr1j5' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ef = Oe('KeyRound', [
  [
    'path',
    {
      d: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z',
      key: '1s6t7t',
    },
  ],
  ['circle', { cx: '16.5', cy: '7.5', r: '.5', fill: 'currentColor', key: 'w0ekpg' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const sa = Oe('LoaderCircle', [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56', key: '13zald' }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const i_ = Oe('LockKeyhole', [
  ['circle', { cx: '12', cy: '16', r: '1', key: '1au0dj' }],
  ['rect', { x: '3', y: '10', width: '18', height: '12', rx: '2', key: '6s8ecr' }],
  ['path', { d: 'M7 10V7a5 5 0 0 1 10 0v3', key: '1pqi11' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qv = Oe('LogOut', [
  ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', key: '1uf3rs' }],
  ['polyline', { points: '16 17 21 12 16 7', key: '1gabdz' }],
  ['line', { x1: '21', x2: '9', y1: '12', y2: '12', key: '1uyos4' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const c_ = Oe('Network', [
  ['rect', { x: '16', y: '16', width: '6', height: '6', rx: '1', key: '4q2zg0' }],
  ['rect', { x: '2', y: '16', width: '6', height: '6', rx: '1', key: '8cvhb9' }],
  ['rect', { x: '9', y: '2', width: '6', height: '6', rx: '1', key: '1egb70' }],
  ['path', { d: 'M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3', key: '1jsf9p' }],
  ['path', { d: 'M12 12V8', key: '2874zd' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Yv = Oe('Radio', [
  ['path', { d: 'M4.9 19.1C1 15.2 1 8.8 4.9 4.9', key: '1vaf9d' }],
  ['path', { d: 'M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5', key: 'u1ii0m' }],
  ['circle', { cx: '12', cy: '12', r: '2', key: '1c9p78' }],
  ['path', { d: 'M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5', key: '1j5fej' }],
  ['path', { d: 'M19.1 4.9C23 8.8 23 15.1 19.1 19', key: '10b0cb' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oy = Oe('RefreshCw', [
  ['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', key: 'v9h5vc' }],
  ['path', { d: 'M21 3v5h-5', key: '1q7to0' }],
  ['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', key: '3uifl3' }],
  ['path', { d: 'M8 16H3v5', key: '1cv678' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Wc = Oe('Server', [
  ['rect', { width: '20', height: '8', x: '2', y: '2', rx: '2', ry: '2', key: 'ngkwjq' }],
  ['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2', ry: '2', key: 'iecqi9' }],
  ['line', { x1: '6', x2: '6.01', y1: '6', y2: '6', key: '16zg32' }],
  ['line', { x1: '6', x2: '6.01', y1: '18', y2: '18', key: 'nzw8ys' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const iu = Oe('ShieldAlert', [
  [
    'path',
    {
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      key: 'oel41y',
    },
  ],
  ['path', { d: 'M12 8v4', key: '1got3b' }],
  ['path', { d: 'M12 16h.01', key: '1drbdi' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Dl = Oe('ShieldCheck', [
  [
    'path',
    {
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      key: 'oel41y',
    },
  ],
  ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Tf = Oe('Shield', [
  [
    'path',
    {
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      key: 'oel41y',
    },
  ],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ay = Oe('ShipWheel', [
  ['circle', { cx: '12', cy: '12', r: '8', key: '46899m' }],
  ['path', { d: 'M12 2v7.5', key: '1e5rl5' }],
  ['path', { d: 'm19 5-5.23 5.23', key: '1ezxxf' }],
  ['path', { d: 'M22 12h-7.5', key: 'le1719' }],
  ['path', { d: 'm19 19-5.23-5.23', key: 'p3fmgn' }],
  ['path', { d: 'M12 14.5V22', key: 'dgcmos' }],
  ['path', { d: 'M10.23 13.77 5 19', key: 'qwopd4' }],
  ['path', { d: 'M9.5 12H2', key: 'r7bup8' }],
  ['path', { d: 'M10.23 10.23 5 5', key: 'k2y7lj' }],
  ['circle', { cx: '12', cy: '12', r: '2.5', key: 'ix0uyj' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const r_ = Oe('Sparkles', [
  [
    'path',
    {
      d: 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
      key: '4pj2yx',
    },
  ],
  ['path', { d: 'M20 3v4', key: '1olli1' }],
  ['path', { d: 'M22 5h-4', key: '1gvqau' }],
  ['path', { d: 'M4 17v2', key: 'vumght' }],
  ['path', { d: 'M5 18H3', key: 'zchphs' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const jf = Oe('Terminal', [
  ['polyline', { points: '4 17 10 11 4 5', key: 'akl6gq' }],
  ['line', { x1: '12', x2: '20', y1: '19', y2: '19', key: 'q2wloq' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const bi = Oe('TriangleAlert', [
  [
    'path',
    {
      d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
      key: 'wmoenq',
    },
  ],
  ['path', { d: 'M12 9v4', key: 'juzpu7' }],
  ['path', { d: 'M12 17h.01', key: 'p32p05' }],
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Bf = Oe('X', [
  ['path', { d: 'M18 6 6 18', key: '1bl5f8' }],
  ['path', { d: 'm6 6 12 12', key: 'd8bk6v' }],
]);
function xf(l) {
  const u = Object.values(l).filter((s) => typeof s == 'number');
  return Object.entries(l)
    .filter(([s, f]) => u.indexOf(+s) === -1)
    .map(([s, f]) => f);
}
function Vv(l, u = '|') {
  return l.map((r) => Uy(r)).join(u);
}
function Of(l, u) {
  return typeof u == 'bigint' ? u.toString() : u;
}
class s_ {
  constructor(u) {
    ((this._getter = u), (this._value = void 0));
  }
  get value() {
    const u = this._getter;
    return (u !== void 0 && ((this._value = u()), (this._getter = void 0)), this._value);
  }
}
function qf(l) {
  return new s_(l);
}
function o_(l) {
  return l == null;
}
function Yf(l) {
  const u = l.startsWith('^') ? 1 : 0,
    r = l.endsWith('$') ? l.length - 1 : l.length;
  return l.slice(u, r);
}
function f_(l, u) {
  const r = l / u,
    s = Math.round(r),
    f = 4 * Number.EPSILON * Math.max(Math.abs(r), 1);
  return Math.abs(r - s) < f ? 0 : r - s;
}
function Zl(l, u, r) {
  Object.defineProperty(l, u, { value: r, writable: !0, enumerable: !0, configurable: !0 });
}
function Cy(l) {
  const u = Object.getOwnPropertyDescriptor(l, 'shape');
  return u?.get ? u.get.raw : u?.value;
}
function Wn(l) {
  return Cy(l._zod.def) ?? l._zod.def.shape;
}
function Dy(l, u, r) {
  Object.defineProperty(l, u, {
    get() {
      const s = r();
      return (Zl(this, u, s), s);
    },
    enumerable: !0,
    configurable: !0,
  });
}
function wy(l, u, r) {
  u in l ? Zl(l, u, r) : (l[u] = r);
}
function fa(l, u, r, s) {
  const f = Wn(u);
  for (const h of r) {
    const m = Object.getOwnPropertyDescriptor(f, h);
    m.enumerable &&
      (m.get
        ? Dy(l, h, () => {
            const v = u._zod.def.shape[h];
            return s ? s(v, h) : v;
          })
        : wy(l, h, s ? s(m.value, h) : m.value));
  }
}
function d_(l, u) {
  for (const r of Reflect.ownKeys(u)) {
    const s = Object.getOwnPropertyDescriptor(u, r);
    s.enumerable && (s.get ? Dy(l, r, () => u[r]) : wy(l, r, s.value));
  }
}
function It(...l) {
  const u = {};
  for (const r of l) {
    const s = Object.getOwnPropertyDescriptors(r);
    Object.assign(u, s);
  }
  return Object.defineProperties({}, u);
}
function h_(l) {
  return JSON.stringify(l);
}
function m_(l) {
  return l
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
const Ry = 'captureStackTrace' in Error ? Error.captureStackTrace : (...l) => {};
function fr(l) {
  return typeof l == 'object' && l !== null && !Array.isArray(l);
}
const p_ = qf(() => {
  if (vn.jitless || (typeof navigator < 'u' && navigator?.userAgent?.includes('Cloudflare')))
    return !1;
  try {
    const l = Function;
    return (new l(''), !0);
  } catch {
    return !1;
  }
});
function cu(l) {
  if (fr(l) === !1) return !1;
  const u = l.constructor;
  if (u === void 0 || typeof u != 'function') return !0;
  const r = u.prototype;
  return !(fr(r) === !1 || Object.prototype.hasOwnProperty.call(r, 'isPrototypeOf') === !1);
}
function My(l) {
  return cu(l)
    ? { ...l }
    : Array.isArray(l)
      ? [...l]
      : l instanceof Map
        ? new Map(l)
        : l instanceof Set
          ? new Set(l)
          : l;
}
const v_ = new Set(['string', 'number', 'symbol']);
function ru(l) {
  return l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function Hl(l, u, r) {
  const s = new l._zod.constr(u ?? l._zod.def);
  return ((!u || r?.parent) && (s._zod.parent = l), s);
}
function I(l) {
  const u = l;
  if (!u) return {};
  if (typeof u == 'string') return { error: () => u };
  if (u?.message !== void 0) {
    if (u?.error !== void 0) throw new Error('Cannot specify both `message` and `error` params');
    u.error = u.message;
  }
  return (delete u.message, typeof u.error == 'string' ? { ...u, error: () => u.error } : u);
}
function Uy(l) {
  return typeof l == 'bigint' ? l.toString() + 'n' : typeof l == 'string' ? `"${l}"` : `${l}`;
}
function y_(l) {
  return Object.keys(l).filter(
    (u) => l[u]._zod.optin !== void 0 && l[u]._zod.optout === 'optional',
  );
}
const Zy = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 34028234663852886e22],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
  },
  g_ = {
    int64: [BigInt('-9223372036854775808'), BigInt('9223372036854775807')],
    uint64: [BigInt(0), BigInt('18446744073709551615')],
  };
function b_(l, u) {
  const r = l._zod.def,
    s = r.checks;
  if (s && s.length > 0)
    throw new Error('.pick() cannot be used on object schemas containing refinements');
  const h = {};
  return (fa(h, l, _r(l, u)), Hl(l, It(r, { shape: h, checks: [] })));
}
function _r(l, u) {
  const r = Wn(l),
    s = [];
  for (const f of Reflect.ownKeys(u)) {
    if (!Object.getOwnPropertyDescriptor(r, f)?.enumerable)
      throw new Error(`Unrecognized key: "${String(f)}"`);
    u[f] && s.push(f);
  }
  return s;
}
function __(l, u) {
  const r = l._zod.def,
    s = r.checks;
  if (s && s.length > 0)
    throw new Error('.omit() cannot be used on object schemas containing refinements');
  const h = new Set(_r(l, u)),
    m = {};
  return (
    fa(
      m,
      l,
      Reflect.ownKeys(Wn(l)).filter((v) => !h.has(v)),
    ),
    Hl(l, It(r, { shape: m, checks: [] }))
  );
}
function S_(l, u) {
  if (!cu(u)) throw new Error('Invalid input to extend: expected a plain object');
  const r = l._zod.def.checks;
  if (r && r.length > 0) {
    const f = Wn(l);
    for (const h of Reflect.ownKeys(u))
      if (Object.getOwnPropertyDescriptor(f, h) !== void 0)
        throw new Error(
          'Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.',
        );
  }
  return Hl(l, It(l._zod.def, { shape: Hy(l, u) }));
}
function Hy(l, u) {
  const r = {};
  return (fa(r, l, Reflect.ownKeys(Wn(l))), d_(r, u), r);
}
function z_(l, u) {
  if (!cu(u)) throw new Error('Invalid input to safeExtend: expected a plain object');
  return Hl(l, It(l._zod.def, { shape: Hy(l, u) }));
}
function N_(l, u) {
  if (!u?._zod?.def)
    throw new Error(
      'Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.',
    );
  if (l._zod.def.checks?.length)
    throw new Error(
      '.merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.',
    );
  const r = {};
  (fa(r, l, Reflect.ownKeys(Wn(l))), fa(r, u, Reflect.ownKeys(Wn(u))));
  const s = It(l._zod.def, {
    shape: r,
    get catchall() {
      return u._zod.def.catchall;
    },
    checks: u._zod.def.checks ?? [],
  });
  return Hl(l, s);
}
function Gv(l, u, r, s = 'partial') {
  const h = u._zod.def.checks;
  if (h && h.length > 0)
    throw new Error(`.${s}() cannot be used on object schemas containing refinements`);
  const v = r ? new Set(_r(u, r)) : void 0,
    b = {};
  return (
    fa(
      b,
      u,
      Reflect.ownKeys(Wn(u)),
      l && ((S, _) => (v && !v.has(_) ? S : new l({ type: 'optional', innerType: S }))),
    ),
    Hl(u, It(u._zod.def, { shape: b, checks: [] }))
  );
}
function E_(l, u, r) {
  const s = r ? new Set(_r(u, r)) : void 0,
    f = {};
  return (
    fa(f, u, Reflect.ownKeys(Wn(u)), (h, m) =>
      s && !s.has(m) ? h : new l({ type: 'nonoptional', innerType: h }),
    ),
    Hl(u, It(u._zod.def, { shape: f }))
  );
}
function Jn(l, u = 0) {
  if (l.aborted === !0) return !0;
  for (let r = u; r < l.issues.length; r++) if (l.issues[r]?.continue !== !0) return !0;
  return !1;
}
function T_(l, u = 0) {
  if (l.aborted === !0) return !0;
  for (let r = u; r < l.issues.length; r++) if (l.issues[r]?.continue === !1) return !0;
  return !1;
}
function au(l, u) {
  return u.map((r) => {
    var s;
    return ((s = r).path ?? (s.path = []), r.path.unshift(l), r);
  });
}
function oi(l) {
  return typeof l == 'string' ? l : l?.message;
}
function Xv(l, u, r) {
  var s;
  for (let f = u; f < l.length; f++) (s = l[f]).schema ?? (s.schema = r);
}
function Rl(l, u, r) {
  var s;
  const f = l.inst?._zod?.traits;
  f?.has('$ZodType') &&
    (f.has('$ZodCheck') ? ((s = l).schema ?? (s.schema = l.inst)) : (l.schema = l.inst));
  const h = l.schema !== l.inst ? l.schema?._zod.def?.error : void 0,
    m = l.message
      ? l.message
      : (oi(l.inst?._zod.def?.error?.(l)) ??
        oi(h?.(l)) ??
        oi(u?.error?.(l)) ??
        oi(r.customError?.(l)) ??
        oi(r.localeError?.(l)) ??
        'Invalid input'),
    v = {};
  for (const b of Object.keys(l))
    b === 'inst' ||
      b === 'schema' ||
      b === 'continue' ||
      b === 'input' ||
      b === '__proto__' ||
      (v[b] = l[b]);
  return (v.path ?? (v.path = []), (v.message = m), u?.reportInput && (v.input = l.input), v);
}
const j_ = /[\uD800-\uDBFF]/;
function Vf(l) {
  const u = l.length;
  if (!j_.test(l)) return u;
  let r = u;
  for (let s = 0; s < u - 1; s++)
    (l.charCodeAt(s) & 64512) === 55296 && (l.charCodeAt(s + 1) & 64512) === 56320 && (r--, s++);
  return r;
}
function Gf(l) {
  return Array.isArray(l) ? 'array' : typeof l == 'string' ? 'string' : 'unknown';
}
function x_(l) {
  const u = typeof l;
  switch (u) {
    case 'number':
      return Number.isNaN(l) ? 'nan' : 'number';
    case 'object': {
      if (l === null) return 'null';
      if (Array.isArray(l)) return 'array';
      const r = l;
      if (r && Object.getPrototypeOf(r) !== Object.prototype && 'constructor' in r && r.constructor)
        return r.constructor.name;
    }
  }
  return u;
}
function _i(...l) {
  const [u, r, s] = l;
  return typeof u == 'string' ? { message: u, code: 'custom', input: r, inst: s } : { ...u };
}
function O_(l, u) {
  for (const r in u) {
    const s = Object.getOwnPropertyDescriptor(u, r);
    s.get ? Object.defineProperty(l, r, { ...s, enumerable: !1 }) : A_(l, r, s.value);
  }
}
function Ml(l, u, r, s = !0) {
  return (
    Object.defineProperty(l, u, { configurable: !0, writable: !0, enumerable: s, value: r }),
    r
  );
}
function ky(l, u, r) {
  return Ml(l, u, r, !1);
}
function Ly(l, u) {
  for (const r in l) {
    const s = l[r];
    Object.defineProperty(u, r, {
      configurable: !0,
      enumerable: !0,
      get() {
        return Ml(this, r, s(this));
      },
      set(f) {
        Ml(this, r, f);
      },
    });
  }
  return u;
}
function A_(l, u, r) {
  Object.defineProperty(l, u, {
    configurable: !0,
    get() {
      return this == null ? r : Ml(this, u, r.bind(this));
    },
    set(s) {
      Ml(this, u, s);
    },
  });
}
function C_(l, u) {
  const r = Object.getPrototypeOf(l);
  return u in r ? void 0 : r;
}
let pf,
  Cl = !1;
const D_ = {
  configurable: !0,
  get() {
    Cl = !0;
  },
};
function xe(l, u, r) {
  const s = Object.getPrototypeOf(l._zod);
  if (u in s && pf !== l._zod) {
    pf = void 0;
    return;
  }
  ((pf = l._zod),
    Object.defineProperty(s, u, {
      configurable: !0,
      get() {
        Object.defineProperty(this, u, D_);
        const f = Cl;
        Cl = !1;
        try {
          const h = r(this);
          return (
            Cl
              ? delete this[u]
              : Object.defineProperty(this, u, { configurable: !0, writable: !0, value: h }),
            (Cl = Cl || f),
            h
          );
        } catch (h) {
          throw (delete this[u], (Cl = Cl || f), h);
        }
      },
      set(f) {
        Object.defineProperty(this, u, { configurable: !0, writable: !0, value: f });
      },
    }));
}
function w_(l, u, r, s) {
  const f = C_(l, u);
  f &&
    Object.defineProperty(f, u, {
      configurable: !0,
      get() {
        const h = { configurable: !0, writable: !0, enumerable: s, value: void 0 };
        return (
          Object.defineProperty(this, u, h),
          (h.value = r(this)),
          Object.defineProperty(this, u, h),
          h.value
        );
      },
      set(h) {
        Object.defineProperty(this, u, { configurable: !0, writable: !0, enumerable: s, value: h });
      },
    });
}
const R_ = '~constantCatch';
function M_(l) {
  const u = () => l;
  return ((u[R_] = !0), u);
}
var Qv;
const vf = { value: void 0, enumerable: !1 };
let $v = 'captureStackTrace' in Error ? Error : null;
function U_(l) {
  const u = $v;
  if (u) {
    const r = u.stackTraceLimit;
    if (typeof r == 'number') {
      try {
        u.stackTraceLimit = 0;
      } catch {
        return (($v = null), new l());
      }
      try {
        return new l();
      } finally {
        u.stackTraceLimit = r;
      }
    }
  }
  return new l();
}
function Z(l, u, r, s) {
  const f = {};
  function h(A) {
    ((this.def = A), (this.constr = g), (this.traits = new Set()));
  }
  h.prototype = f;
  const m = r,
    v = m && new WeakSet();
  function b(A, w) {
    if (A._zod) {
      if (A._zod.traits.has(l)) return;
    } else {
      vf.value = new h(w);
      try {
        Object.defineProperty(A, '_zod', vf);
      } finally {
        vf.value = void 0;
      }
    }
    if ((A._zod.traits.add(l), u(A, w), v)) {
      const V = Object.getPrototypeOf(A),
        B = A._zod.constr.prototype;
      let k = V;
      for (; k && k !== B;) k = Object.getPrototypeOf(k);
      const ae = k ?? V;
      v.has(ae) || (v.add(ae), O_(ae, m));
    }
    const U = g.prototype;
    for (const V in U)
      Object.prototype.hasOwnProperty.call(U, V) && (V in A || (A[V] = U[V].bind(A)));
  }
  const S = s?.Parent ?? Object;
  class _ extends S {}
  Object.defineProperty(_, 'name', { value: l });
  function g(A) {
    const w = s?.Parent ? U_(_) : this;
    b(w, A);
    const U = w._zod.deferred;
    if (U) {
      for (const B of U) B();
      w._zod.deferred = void 0;
    }
    const V = globalThis.__zod_globalConfig?.postProcessor;
    return (V && V(w), w);
  }
  return (
    Object.defineProperty(g, 'init', { value: b }),
    Object.defineProperty(g, Symbol.hasInstance, {
      value: (A) => (s?.Parent && A instanceof s.Parent ? !0 : A?._zod?.traits?.has(l)),
    }),
    Object.defineProperty(g, 'name', { value: l }),
    g
  );
}
class oa extends Error {
  constructor() {
    super('Encountered Promise during synchronous parse. Use .parseAsync() instead.');
  }
}
class By extends Error {
  constructor(u) {
    (super(`Encountered unidirectional transform during encode: ${u}`),
      (this.name = 'ZodEncodeError'));
  }
}
(Qv = globalThis).__zod_globalConfig ?? (Qv.__zod_globalConfig = {});
const vn = globalThis.__zod_globalConfig;
function wn(l) {
  return (l && Object.assign(vn, l), vn);
}
function Z_() {
  const l = this._zod;
  return (l.message ?? (l.message = JSON.stringify(l.def, Of, 2)), l.message);
}
function H_(l) {
  this._zod.message = l;
}
const k_ = { get: Z_, set: H_, enumerable: !0, configurable: !0 },
  yf = { value: void 0, enumerable: !1 },
  Kv = new WeakSet([Object.prototype, Error.prototype]),
  L_ = (l, u) => {
    ((l.name = '$ZodError'),
      (yf.value = u),
      Object.defineProperty(l, 'issues', yf),
      (yf.value = void 0),
      Object.defineProperty(l, 'message', k_));
    const r = Object.getPrototypeOf(l);
    Kv.has(r) ||
      (Kv.add(r),
      Object.defineProperty(r, 'toString', {
        configurable: !0,
        enumerable: !1,
        get() {
          const s = () => this.message;
          return (
            Object.defineProperty(this, 'toString', { value: s, configurable: !0, writable: !0 }),
            s
          );
        },
        set(s) {
          Object.defineProperty(this, 'toString', { value: s, configurable: !0, writable: !0 });
        },
      }));
  },
  B_ = Z('$ZodError', L_);
function q_(l, u, r) {
  return (
    Object.prototype.hasOwnProperty.call(l, u) ||
      (u === '__proto__'
        ? Object.defineProperty(l, u, {
            value: r(),
            writable: !0,
            enumerable: !0,
            configurable: !0,
          })
        : (l[u] = r())),
    l[u]
  );
}
function Y_(l, u = (r) => r.message) {
  const r = {},
    s = [];
  for (const f of l.issues)
    f.path.length > 0 ? q_(r, f.path[0], () => []).push(u(f)) : s.push(u(f));
  return { formErrors: s, fieldErrors: r };
}
function V_(l, u = (r) => r.message) {
  const r = { _errors: [] },
    s = (f, h = []) => {
      for (const m of f.issues)
        if (m.code === 'invalid_union' && m.errors.length)
          m.errors.map((v) => s({ issues: v }, [...h, ...m.path]));
        else if (m.code === 'invalid_key') s({ issues: m.issues }, [...h, ...m.path]);
        else if (m.code === 'invalid_element') s({ issues: m.issues }, [...h, ...m.path]);
        else {
          const v = [...h, ...m.path];
          if (v.length === 0) r._errors.push(u(m));
          else {
            let b = r,
              S = 0;
            for (; S < v.length;) {
              const _ = v[S],
                g = S === v.length - 1;
              if (_ === '_errors') {
                (g && b._errors.push(u(m)), S++);
                continue;
              }
              Object.prototype.hasOwnProperty.call(b, _) ||
                Object.defineProperty(b, _, {
                  value: { _errors: [] },
                  enumerable: !0,
                  writable: !0,
                  configurable: !0,
                });
              const A = b[_];
              (g && A._errors.push(u(m)), (b = A), S++);
            }
          }
        }
    };
  return (s(l), r);
}
function Sr(l, u) {
  return { callee: u?.callee ?? l, Err: u?.Err };
}
const Xf = (l) => {
    const u = (r, s, f, h) => {
      const m = f ? { ...f, async: !1 } : { async: !1 },
        v = r._zod.run({ value: s, issues: [] }, m);
      if (v instanceof Promise) throw new oa();
      if (v.issues.length) {
        const b = new (h?.Err ?? l)(v.issues.map((S) => Rl(S, m, wn())));
        throw (Ry(b, h?.callee ?? u), b);
      }
      return v.value;
    };
    return u;
  },
  Qf = (l) => {
    const u = async (r, s, f, h) => {
      const m = f ? { ...f, async: !0 } : { async: !0 };
      let v = r._zod.run({ value: s, issues: [] }, m);
      if ((v instanceof Promise && (v = await v), v.issues.length)) {
        const b = new (h?.Err ?? l)(v.issues.map((S) => Rl(S, m, wn())));
        throw (Ry(b, h?.callee ?? u), b);
      }
      return v.value;
    };
    return u;
  },
  $f = (l) => (u, r, s) => {
    const f = s ? { ...s, async: !1 } : { async: !1 },
      h = u._zod.run({ value: r, issues: [] }, f);
    if (h instanceof Promise) throw new oa();
    return h.issues.length ? qy(l, h.issues, f) : { success: !0, data: h.value };
  };
function qy(l, u, r) {
  let s;
  return {
    success: !1,
    get error() {
      return (s || ((s = new l(u.map((f) => Rl(f, r, wn())))), (u = void 0), (r = void 0)), s);
    },
    set error(f) {
      ((s = f), (u = void 0), (r = void 0));
    },
  };
}
const Kf = (l) => async (u, r, s) => {
    const f = s ? { ...s, async: !0 } : { async: !0 };
    let h = u._zod.run({ value: r, issues: [] }, f);
    return (
      h instanceof Promise && (h = await h),
      h.issues.length ? qy(l, h.issues, f) : { success: !0, data: h.value }
    );
  },
  G_ = Symbol.for('zod.compile.invalid'),
  X_ = Symbol.for('zod.compile.fallback'),
  Q_ = (l, u, r) => {
    const s = l._zod.bag.validator;
    if (s !== void 0) {
      if (s(u) !== G_) return !0;
      if (s.definite === !0 && r === void 0) return !1;
    }
    return $_(l, u, r);
  };
function $_(l, u, r) {
  const s = r ? { ...r, async: !1, abortEarly: !0 } : { async: !1, abortEarly: !0 },
    f = l._zod.bag.fallbackRun;
  let h;
  if (
    (f
      ? ((s[X_] = !0), (h = f({ value: u, issues: [] }, s)))
      : (h = l._zod.run({ value: u, issues: [] }, s)),
    h instanceof Promise)
  )
    throw new oa();
  return h.issues.length === 0;
}
const K_ = async (l, u, r) => {
    const s = r ? { ...r, async: !0, abortEarly: !0 } : { async: !0, abortEarly: !0 };
    let f = l._zod.run({ value: u, issues: [] }, s);
    return (f instanceof Promise && (f = await f), f.issues.length === 0);
  },
  I_ = (l) => {
    const u = Xf(l),
      r = (s, f, h, m) => {
        const v = h ? { ...h, direction: 'backward' } : { direction: 'backward' };
        return u(s, f, v, Sr(r, m));
      };
    return r;
  },
  J_ = (l) => {
    const u = Xf(l),
      r = (s, f, h, m) => u(s, f, h, Sr(r, m));
    return r;
  },
  F_ = (l) => {
    const u = Qf(l),
      r = async (s, f, h, m) => {
        const v = h ? { ...h, direction: 'backward' } : { direction: 'backward' };
        return await u(s, f, v, Sr(r, m));
      };
    return r;
  },
  P_ = (l) => {
    const u = Qf(l),
      r = async (s, f, h, m) => await u(s, f, h, Sr(r, m));
    return r;
  },
  W_ = (l) => (u, r, s) => {
    const f = s ? { ...s, direction: 'backward' } : { direction: 'backward' };
    return $f(l)(u, r, f);
  },
  eS = (l) => (u, r, s) => $f(l)(u, r, s),
  tS = (l) => async (u, r, s) => {
    const f = s ? { ...s, direction: 'backward' } : { direction: 'backward' };
    return Kf(l)(u, r, f);
  },
  nS = (l) => async (u, r, s) => Kf(l)(u, r, s),
  lS = /^[cC][0-9a-z]{6,}$/,
  aS = /^[0-9a-z]+$/,
  uS = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/,
  iS = /^[0-9a-vA-V]{20}$/,
  cS = /^[A-Za-z0-9]{27}$/,
  rS = /^[a-zA-Z0-9_-]{21}$/;
function sS(l) {
  return new RegExp(`^[a-zA-Z0-9_-]{${l}}$`);
}
const oS =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  fS = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  Iv = (l) =>
    l
      ? new RegExp(
          `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${l}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
        )
      : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
  dS =
    /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  hS =
    '^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$';
function mS() {
  return new RegExp(hS, 'u');
}
const pS =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  vS =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  yS =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  gS =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  bS = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  _S = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/,
  SS = /^https?$/,
  zS = /^\+[1-9]\d{6,14}$/,
  Yy =
    '(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))';
function NS(l) {
  return new RegExp(`^${l}$`);
}
const ES = NS(Yy);
function Af(l) {
  const u = '(?:[01]\\d|2[0-3]):[0-5]\\d';
  return typeof l.precision == 'number'
    ? l.precision === -1
      ? `${u}`
      : l.precision === 0
        ? `${u}:[0-5]\\d`
        : `${u}:[0-5]\\d\\.\\d{${l.precision}}`
    : l.seconds
      ? `${u}:[0-5]\\d(?:\\.\\d+)?`
      : `${u}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function TS(l) {
  return new RegExp(`^${Af(l)}$`);
}
function jS(l) {
  const u = ['Z'];
  l.offset && u.push('([+-](?:[01]\\d|2[0-3]):[0-5]\\d)');
  const r = `${Af({ precision: l.precision, seconds: !0 })}(?:${u.join('|')})`,
    s = l.local ? `${r}|${Af({ precision: l.precision })}` : r;
  return new RegExp(`^${Yy}T(?:${s})$`);
}
const xS = /^[\s\S]{0,}$/,
  OS = /^-?\d+$/,
  If = /^-?\d+(?:\.\d+)?$/,
  AS = /^(?:true|false)$/i,
  CS = /^[^A-Z]*$/,
  DS = /^[^a-z]*$/,
  Ut = Z('$ZodCheck', (l, u) => {
    var r;
    (l._zod ?? (l._zod = {}), (l._zod.def = u), (r = l._zod).onattach ?? (r.onattach = []));
  }),
  Jf = (l) => {
    const u = l.value;
    return !o_(u) && u.length !== void 0;
  },
  dr = { number: 'number', bigint: 'bigint', object: 'date' },
  Vy = Z('$ZodCheckLessThan', (l, u) => {
    Ut.init(l, u);
    const r = dr[typeof u.value];
    l._zod.check = (s) => {
      (u.inclusive ? s.value <= u.value : s.value < u.value) ||
        s.issues.push({
          origin: dr[typeof s.value] ?? r,
          code: 'too_big',
          maximum: typeof u.value == 'object' ? u.value.getTime() : u.value,
          input: s.value,
          inclusive: u.inclusive,
          inst: l,
          continue: !u.abort,
        });
    };
  }),
  Gy = Z('$ZodCheckGreaterThan', (l, u) => {
    Ut.init(l, u);
    const r = dr[typeof u.value];
    l._zod.check = (s) => {
      (u.inclusive ? s.value >= u.value : s.value > u.value) ||
        s.issues.push({
          origin: dr[typeof s.value] ?? r,
          code: 'too_small',
          minimum: typeof u.value == 'object' ? u.value.getTime() : u.value,
          input: s.value,
          inclusive: u.inclusive,
          inst: l,
          continue: !u.abort,
        });
    };
  }),
  wS = Z('$ZodCheckMultipleOf', (l, u) => {
    (Ut.init(l, u),
      (l._zod.check = (r) => {
        if (typeof r.value != typeof u.value)
          throw new Error('Cannot mix number and bigint in multiple_of check.');
        (typeof r.value == 'bigint'
          ? u.value !== BigInt(0) && r.value % u.value === BigInt(0)
          : f_(r.value, u.value) === 0) ||
          r.issues.push({
            origin: typeof r.value,
            code: 'not_multiple_of',
            divisor: u.value,
            input: r.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  RS = Z('$ZodCheckNumberFormat', (l, u) => {
    (Ut.init(l, u), (u.format = u.format || 'float64'));
    const r = u.format?.includes('int'),
      s = r ? 'int' : 'number',
      [f, h] = Zy[u.format];
    l._zod.check = (m) => {
      const v = m.value;
      if (r) {
        if (!Number.isInteger(v)) {
          m.issues.push({
            expected: s,
            format: u.format,
            code: 'invalid_type',
            continue: !1,
            input: v,
            inst: l,
          });
          return;
        }
        if (!Number.isSafeInteger(v)) {
          v > 0
            ? m.issues.push({
                input: v,
                code: 'too_big',
                maximum: Number.MAX_SAFE_INTEGER,
                note: 'Integers must be within the safe integer range.',
                inst: l,
                origin: s,
                inclusive: !0,
                continue: !u.abort,
              })
            : m.issues.push({
                input: v,
                code: 'too_small',
                minimum: Number.MIN_SAFE_INTEGER,
                note: 'Integers must be within the safe integer range.',
                inst: l,
                origin: s,
                inclusive: !0,
                continue: !u.abort,
              });
          return;
        }
      }
      (v < f &&
        m.issues.push({
          origin: 'number',
          input: v,
          code: 'too_small',
          minimum: f,
          inclusive: !0,
          inst: l,
          continue: !u.abort,
        }),
        v > h &&
          m.issues.push({
            origin: 'number',
            input: v,
            code: 'too_big',
            maximum: h,
            inclusive: !0,
            inst: l,
            continue: !u.abort,
          }));
    };
  }),
  MS = Z('$ZodCheckMaxLength', (l, u) => {
    var r;
    (Ut.init(l, u),
      (r = l._zod.def).when ?? (r.when = Jf),
      (l._zod.check = (s) => {
        const f = s.value,
          h = f.length;
        if ((typeof f == 'string' && h > u.maximum ? Vf(f) : h) <= u.maximum) return;
        const v = Gf(f);
        s.issues.push({
          origin: v,
          code: 'too_big',
          maximum: u.maximum,
          inclusive: !0,
          input: f,
          inst: l,
          continue: !u.abort,
        });
      }));
  }),
  US = Z('$ZodCheckMinLength', (l, u) => {
    var r;
    (Ut.init(l, u),
      (r = l._zod.def).when ?? (r.when = Jf),
      (l._zod.check = (s) => {
        const f = s.value,
          h = f.length;
        if ((typeof f == 'string' && h >= u.minimum && h < u.minimum * 2 ? Vf(f) : h) >= u.minimum)
          return;
        const v = Gf(f);
        s.issues.push({
          origin: v,
          code: 'too_small',
          minimum: u.minimum,
          inclusive: !0,
          input: f,
          inst: l,
          continue: !u.abort,
        });
      }));
  }),
  ZS = Z('$ZodCheckLengthEquals', (l, u) => {
    var r;
    (Ut.init(l, u),
      (r = l._zod.def).when ?? (r.when = Jf),
      (l._zod.check = (s) => {
        const f = s.value,
          h = f.length,
          m = typeof f == 'string' && h >= u.length && h <= u.length * 2 ? Vf(f) : h;
        if (m === u.length) return;
        const v = Gf(f),
          b = m > u.length;
        s.issues.push({
          origin: v,
          ...(b
            ? { code: 'too_big', maximum: u.length }
            : { code: 'too_small', minimum: u.length }),
          inclusive: !0,
          exact: !0,
          input: s.value,
          inst: l,
          continue: !u.abort,
        });
      }));
  }),
  zr = Z('$ZodCheckStringFormat', (l, u) => {
    var r, s;
    (Ut.init(l, u),
      u.pattern
        ? ((r = l._zod).check ??
          (r.check = (f) => {
            ((u.pattern.lastIndex = 0),
              !u.pattern.test(f.value) &&
                f.issues.push({
                  origin: 'string',
                  code: 'invalid_format',
                  format: u.format,
                  input: f.value,
                  ...(u.pattern ? { pattern: u.pattern.toString() } : {}),
                  inst: l,
                  continue: !u.abort,
                }));
          }))
        : ((s = l._zod).check ?? (s.check = () => {})));
  }),
  HS = Z('$ZodCheckRegex', (l, u) => {
    (zr.init(l, u),
      (l._zod.check = (r) => {
        ((u.pattern.lastIndex = 0),
          !u.pattern.test(r.value) &&
            r.issues.push({
              origin: 'string',
              code: 'invalid_format',
              format: 'regex',
              input: r.value,
              pattern: u.pattern.toString(),
              inst: l,
              continue: !u.abort,
            }));
      }));
  }),
  kS = Z('$ZodCheckLowerCase', (l, u) => {
    (u.pattern ?? (u.pattern = CS), zr.init(l, u));
  }),
  LS = Z('$ZodCheckUpperCase', (l, u) => {
    (u.pattern ?? (u.pattern = DS), zr.init(l, u));
  }),
  BS = Z('$ZodCheckIncludes', (l, u) => {
    Ut.init(l, u);
    const r = ru(u.includes),
      s = new RegExp(typeof u.position == 'number' ? `^.{${u.position},}${r}` : r);
    ((u.pattern = s),
      (l._zod.check = (f) => {
        f.value.includes(u.includes, u.position) ||
          f.issues.push({
            origin: 'string',
            code: 'invalid_format',
            format: 'includes',
            includes: u.includes,
            input: f.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  qS = Z('$ZodCheckStartsWith', (l, u) => {
    Ut.init(l, u);
    const r = new RegExp(`^${ru(u.prefix)}.*`);
    (u.pattern ?? (u.pattern = r),
      (l._zod.check = (s) => {
        s.value.startsWith(u.prefix) ||
          s.issues.push({
            origin: 'string',
            code: 'invalid_format',
            format: 'starts_with',
            prefix: u.prefix,
            input: s.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  YS = Z('$ZodCheckEndsWith', (l, u) => {
    Ut.init(l, u);
    const r = new RegExp(`.*${ru(u.suffix)}$`);
    (u.pattern ?? (u.pattern = r),
      (l._zod.check = (s) => {
        s.value.endsWith(u.suffix) ||
          s.issues.push({
            origin: 'string',
            code: 'invalid_format',
            format: 'ends_with',
            suffix: u.suffix,
            input: s.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  VS = Z('$ZodCheckOverwrite', (l, u) => {
    (Ut.init(l, u),
      (l._zod.check = (r) => {
        r.value = u.tx(r.value);
      }));
  });
class GS {
  constructor(u = [], r = {}) {
    ((this.content = []), (this.indent = 0), (this.args = u), (this.closed = r));
  }
  indented(u) {
    this.indent += 1;
    try {
      u(this);
    } finally {
      this.indent -= 1;
    }
  }
  write(u) {
    if (typeof u == 'function') {
      (u(this, { execution: 'sync' }), u(this, { execution: 'async' }));
      return;
    }
    const s = u
        .split(
          `
`,
        )
        .filter((m) => m),
      f = Math.min(...s.map((m) => m.length - m.trimStart().length)),
      h = s.map((m) => m.slice(f)).map((m) => ' '.repeat(this.indent * 2) + m);
    for (const m of h) this.content.push(m);
  }
  compile() {
    const u = Function,
      r = this?.content ?? [''];
    return new u(
      ...Object.keys(this.closed),
      `return function (${this.args.join(', ')}) {
${r.join(`
`)}
};`,
    )(...Object.values(this.closed));
  }
}
const XS = { major: 4, minor: 6, patch: 5 },
  qe = Z(
    '$ZodType',
    (l, u) => {
      var r;
      (l ?? (l = {}), (l._zod.def = u), (l._zod.bag = l._zod.bag || {}), (l._zod.version = XS));
      const s = l._zod.def.checks,
        f = l._zod.traits.has('$ZodCheck') ? [l, ...(s ?? [])] : s?.length ? [...s] : [];
      for (const h of f) for (const m of h._zod.onattach) m(l);
      if (f.length === 0)
        ((r = l._zod).deferred ?? (r.deferred = []),
          l._zod.deferred?.push(() => {
            l._zod.run = l._zod.parse;
          }));
      else {
        const h = (v, b, S) => {
            if (v.memo) return v;
            let _ = Jn(v),
              g;
            for (const A of b) {
              if (A._zod.def.when) {
                if (T_(v) || !A._zod.def.when(v)) continue;
              } else if (_) continue;
              const w = v.issues.length,
                U = A._zod.check(v);
              if (U instanceof Promise && S?.async === !1) throw new oa();
              if (g || U instanceof Promise)
                g = (g ?? Promise.resolve()).then(async () => {
                  (await U, v.issues.length !== w && (Xv(v.issues, w, l), _ || (_ = Jn(v, w))));
                });
              else {
                if (v.issues.length === w) continue;
                (Xv(v.issues, w, l), _ || (_ = Jn(v, w)));
              }
            }
            return g ? g.then(() => v) : v;
          },
          m = (v, b, S) => {
            if (Jn(v)) return ((v.aborted = !0), v);
            const _ = h(b, f, S);
            if (_ instanceof Promise) {
              if (S.async === !1) throw new oa();
              return _.then((g) => l._zod.parse(g, S));
            }
            return l._zod.parse(_, S);
          };
        l._zod.run = (v, b) => {
          if (b.skipChecks) return l._zod.parse(v, b);
          if (b.direction === 'backward') {
            const _ = l._zod.parse({ value: v.value, issues: [] }, { ...b, skipChecks: !0 });
            return _ instanceof Promise ? _.then((g) => m(g, v, b)) : m(_, v, b);
          }
          const S = l._zod.parse(v, b);
          if (S instanceof Promise) {
            if (b.async === !1) throw new oa();
            return S.then((_) => h(_, f, b));
          }
          return h(S, f, b);
        };
      }
    },
    {
      get '~standard'() {
        return ky(this, '~standard', Qy(this));
      },
      set '~standard'(l) {
        Ml(this, '~standard', l);
      },
    },
  ),
  Xy = (l, u) =>
    l.issues.length ? { issues: l.issues.map((r) => Rl(r, u, wn())) } : { value: l.value };
async function QS(l, u) {
  const r = { async: !0 };
  return Xy(await l._zod.run({ value: u, issues: [] }, r), r);
}
function Qy(l) {
  return {
    validate: (u) => {
      const r = { async: !1 };
      try {
        const s = l._zod.run({ value: u, issues: [] }, r);
        if (!(s instanceof Promise)) return Xy(s, r);
      } catch {}
      return QS(l, u);
    },
    vendor: 'zod',
    version: 1,
  };
}
const Ff = Z('$ZodString', (l, u) => {
    (qe.init(l, u),
      (l._zod.pattern = u.pattern ?? xS),
      (l._zod.parse = (r, s) => {
        if (u.coerce)
          try {
            r.value = String(r.value);
          } catch {}
        return (
          typeof r.value == 'string' ||
            r.issues.push({ expected: 'string', code: 'invalid_type', input: r.value, inst: l }),
          r
        );
      }));
  }),
  ke = Z('$ZodStringFormat', (l, u) => {
    (zr.init(l, u), Ff.init(l, u));
  }),
  $S = Z('$ZodGUID', (l, u) => {
    (u.pattern ?? (u.pattern = fS), ke.init(l, u));
  }),
  KS = Z('$ZodUUID', (l, u) => {
    if (u.version) {
      const s = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[u.version];
      if (s === void 0) throw new Error(`Invalid UUID version: "${u.version}"`);
      u.pattern ?? (u.pattern = Iv(s));
    } else u.pattern ?? (u.pattern = Iv());
    ke.init(l, u);
  }),
  IS = Z('$ZodEmail', (l, u) => {
    (u.pattern ?? (u.pattern = dS), ke.init(l, u));
  }),
  $y = 1,
  hr = 2;
function Ky(l) {
  try {
    return typeof URL < 'u' && typeof URL.canParse == 'function'
      ? URL.canParse(l)
      : (new URL(l), !0);
  } catch {
    return !1;
  }
}
function JS(l, u) {
  return !('normalize' in u) && !('hostname' in u) && !('protocol' in u) ? Ky(l) || hr : FS(l, u);
}
function FS(l, u) {
  if (!u.normalize && u.protocol?.source === SS.source && !/^https?:\/\//i.test(l)) return $y;
  try {
    if (typeof URL < 'u') {
      const r = URL;
      if (typeof r.parse == 'function') return r.parse(l) ?? hr;
    }
    return new URL(l);
  } catch {
    return hr;
  }
}
const PS = /[\t\n\r]/g;
function Jv(l) {
  return l.replace(PS, '');
}
function WS(l, u) {
  return ((u.lastIndex = 0), u.test(l.hostname));
}
function e2(l, u) {
  return (
    (u.lastIndex = 0),
    u.test(l.protocol.endsWith(':') ? l.protocol.slice(0, -1) : l.protocol)
  );
}
const t2 = Z('$ZodURL', (l, u) => {
    (ke.init(l, u),
      (l._zod.check = (r) => {
        try {
          const s = r.value.trim(),
            f = JS(s, u);
          if (f === $y) {
            r.issues.push({
              code: 'invalid_format',
              format: 'url',
              note: 'Invalid URL format',
              input: r.value,
              inst: l,
              continue: !u.abort,
            });
            return;
          }
          if (f === hr) {
            r.issues.push({
              code: 'invalid_format',
              format: 'url',
              input: r.value,
              inst: l,
              continue: !u.abort,
            });
            return;
          }
          if (f === !0) {
            r.value = Jv(s);
            return;
          }
          (u.hostname &&
            !WS(f, u.hostname) &&
            r.issues.push({
              code: 'invalid_format',
              format: 'url',
              note: 'Invalid hostname',
              pattern: u.hostname.source,
              input: r.value,
              inst: l,
              continue: !u.abort,
            }),
            u.protocol &&
              !e2(f, u.protocol) &&
              r.issues.push({
                code: 'invalid_format',
                format: 'url',
                note: 'Invalid protocol',
                pattern: u.protocol.source,
                input: r.value,
                inst: l,
                continue: !u.abort,
              }),
            (r.value = u.normalize ? f.href : Jv(s)));
          return;
        } catch {
          r.issues.push({
            code: 'invalid_format',
            format: 'url',
            input: r.value,
            inst: l,
            continue: !u.abort,
          });
        }
      }));
  }),
  n2 = Z('$ZodEmoji', (l, u) => {
    (u.pattern ?? (u.pattern = mS()), ke.init(l, u));
  }),
  l2 = Z('$ZodNanoID', (l, u) => {
    if (u.length !== void 0 && (!Number.isInteger(u.length) || u.length < 1))
      throw new Error(`Invalid nanoid length: ${u.length}`);
    (u.pattern ?? (u.pattern = u.length === void 0 ? rS : sS(u.length)), ke.init(l, u));
  }),
  a2 = Z('$ZodCUID', (l, u) => {
    (u.pattern ?? (u.pattern = lS), ke.init(l, u));
  }),
  u2 = Z('$ZodCUID2', (l, u) => {
    (u.pattern ?? (u.pattern = aS), ke.init(l, u));
  }),
  i2 = Z('$ZodULID', (l, u) => {
    (u.pattern ?? (u.pattern = uS), ke.init(l, u));
  }),
  c2 = Z('$ZodXID', (l, u) => {
    (u.pattern ?? (u.pattern = iS), ke.init(l, u));
  }),
  r2 = Z('$ZodKSUID', (l, u) => {
    (u.pattern ?? (u.pattern = cS), ke.init(l, u));
  }),
  s2 = Z('$ZodISODateTime', (l, u) => {
    (u.pattern ?? (u.pattern = jS(u)), ke.init(l, u));
  }),
  o2 = Z('$ZodISODate', (l, u) => {
    (u.pattern ?? (u.pattern = ES), ke.init(l, u));
  }),
  f2 = Z('$ZodISOTime', (l, u) => {
    (u.pattern ?? (u.pattern = TS(u)), ke.init(l, u));
  }),
  d2 = Z('$ZodISODuration', (l, u) => {
    (u.pattern ?? (u.pattern = oS), ke.init(l, u));
  }),
  h2 = Z('$ZodIPv4', (l, u) => {
    (u.pattern ?? (u.pattern = pS), ke.init(l, u));
  }),
  m2 = /^[0-9a-fA-F:.]+$/;
function Iy(l) {
  return m2.test(l) ? Ky(`http://[${l}]`) : !1;
}
const p2 = Z('$ZodIPv6', (l, u) => {
    (u.pattern ?? (u.pattern = vS),
      ke.init(l, u),
      (l._zod.check = (r) => {
        Iy(r.value) ||
          r.issues.push({
            code: 'invalid_format',
            format: 'ipv6',
            input: r.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  v2 = Z('$ZodCIDRv4', (l, u) => {
    (u.pattern ?? (u.pattern = yS), ke.init(l, u));
  });
function y2(l) {
  const u = l.split('/');
  if (u.length !== 2) return !1;
  const [r, s] = u;
  if (!s) return !1;
  const f = Number(s);
  return `${f}` !== s || f < 0 || f > 128 ? !1 : Iy(r);
}
const g2 = Z('$ZodCIDRv6', (l, u) => {
  (u.pattern ?? (u.pattern = gS),
    ke.init(l, u),
    (l._zod.check = (r) => {
      y2(r.value) ||
        r.issues.push({
          code: 'invalid_format',
          format: 'cidrv6',
          input: r.value,
          inst: l,
          continue: !u.abort,
        });
    }));
});
function Jy(l) {
  if (l === '') return !0;
  if (/\s/.test(l) || l.length % 4 !== 0) return !1;
  try {
    return (atob(l), !0);
  } catch {
    return !1;
  }
}
const Fy = /^[0-9a-zA-Z+/]*={0,2}$/,
  b2 = Z('$ZodBase64', (l, u) => {
    (u.pattern ?? (u.pattern = Fy),
      ke.init(l, u),
      (l._zod.check = (r) => {
        Jy(r.value) ||
          r.issues.push({
            code: 'invalid_format',
            format: 'base64',
            input: r.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  Pf = /^[A-Za-z0-9_-]*$/;
function _2(l) {
  if (!Pf.test(l)) return !1;
  const u = l.replace(/[-_]/g, (s) => (s === '-' ? '+' : '/')),
    r = u.padEnd(Math.ceil(u.length / 4) * 4, '=');
  return Jy(r);
}
const S2 = Z('$ZodBase64URL', (l, u) => {
    (u.pattern ?? (u.pattern = Pf),
      ke.init(l, u),
      (l._zod.check = (r) => {
        _2(r.value) ||
          r.issues.push({
            code: 'invalid_format',
            format: 'base64url',
            input: r.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  z2 = Z('$ZodE164', (l, u) => {
    (u.pattern ?? (u.pattern = zS), ke.init(l, u));
  });
function N2(l, u = null) {
  try {
    const r = l.split('.');
    if (r.length !== 3) return !1;
    const [s] = r;
    if (!s) return !1;
    const f = JSON.parse(atob(s));
    return !(('typ' in f && f?.typ !== 'JWT') || !f.alg || (u && (!('alg' in f) || f.alg !== u)));
  } catch {
    return !1;
  }
}
const E2 = Z('$ZodJWT', (l, u) => {
    (ke.init(l, u),
      (l._zod.check = (r) => {
        N2(r.value, u.alg) ||
          r.issues.push({
            code: 'invalid_format',
            format: 'jwt',
            input: r.value,
            inst: l,
            continue: !u.abort,
          });
      }));
  }),
  Py = Z('$ZodNumber', (l, u) => {
    (qe.init(l, u),
      (l._zod.pattern = If),
      (l._zod.parse = (r, s) => {
        if (u.coerce)
          try {
            r.value = Number(r.value);
          } catch {}
        const f = r.value;
        if (typeof f == 'number' && !Number.isNaN(f) && Number.isFinite(f)) return r;
        const h =
          typeof f == 'number'
            ? Number.isNaN(f)
              ? 'NaN'
              : Number.isFinite(f)
                ? void 0
                : String(f)
            : void 0;
        return (
          r.issues.push({
            expected: 'number',
            code: 'invalid_type',
            input: f,
            inst: l,
            ...(h ? { received: h } : {}),
          }),
          r
        );
      }));
  }),
  T2 = Z('$ZodNumberFormat', (l, u) => {
    (RS.init(l, u), Py.init(l, u));
  }),
  j2 = Z('$ZodBoolean', (l, u) => {
    (qe.init(l, u),
      (l._zod.pattern = AS),
      (l._zod.parse = (r, s) => {
        if (u.coerce)
          try {
            r.value = !!r.value;
          } catch {}
        const f = r.value;
        return (
          typeof f == 'boolean' ||
            r.issues.push({ expected: 'boolean', code: 'invalid_type', input: f, inst: l }),
          r
        );
      }));
  }),
  x2 = Z('$ZodUnknown', (l, u) => {
    (qe.init(l, u), (l._zod.parse = (r) => r));
  }),
  O2 = Z('$ZodNever', (l, u) => {
    (qe.init(l, u),
      (l._zod.parse = (r, s) => (
        r.issues.push({ expected: 'never', code: 'invalid_type', input: r.value, inst: l }),
        r
      )));
  });
function Fv(l, u, r) {
  (l.issues.length && u.issues.push(...au(r, l.issues)), (u.value[r] = l.value));
}
const A2 = Z('$ZodArray', (l, u) => {
  qe.init(l, u);
  const r = vn.memoizer;
  (r?.attach(l),
    (l._zod.parse = (s, f) => {
      const h = s.value;
      if (!Array.isArray(h))
        return (s.issues.push({ expected: 'array', code: 'invalid_type', input: h, inst: l }), s);
      s.value = r ? r.alloc(l, s, Array(h.length), f) : Array(h.length);
      const m = [],
        v = f?.abortEarly;
      for (let b = 0; b < h.length; b++) {
        const S = h[b],
          _ = u.element._zod.run({ value: S, issues: [] }, f);
        if (_ instanceof Promise) m.push(_.then((g) => Fv(g, s, b)));
        else if ((Fv(_, s, b), v && _.issues.length !== 0 && Jn(_))) break;
      }
      return m.length ? Promise.all(m).then(() => s) : s;
    }));
});
function mr(l, u, r, s, f, h) {
  const m = r in s,
    v = h === 'optional';
  if (!(!m && v && f === 'optional')) {
    if (l.issues.length) {
      if (f !== void 0 && v && !m) return;
      u.issues.push(...au(r, l.issues));
    }
    if (!m && f === void 0) {
      l.issues.length ||
        u.issues.push({ code: 'invalid_type', expected: 'nonoptional', input: void 0, path: [r] });
      return;
    }
    l.value === void 0
      ? (m || (f === 'defaulted' && !v)) && (u.value[r] = void 0)
      : (u.value[r] = l.value);
  }
}
const C2 = [];
function Wy(l) {
  const u = Object.keys(l.shape),
    r = Object.getOwnPropertySymbols(l.shape),
    s = r.length ? r : C2,
    f = s.length ? [...u, ...s] : u;
  for (const m of f)
    if (!l.shape?.[m]?._zod?.traits?.has('$ZodType'))
      throw new Error(`Invalid element at key "${String(m)}": expected a Zod schema`);
  const h = y_(l.shape);
  return {
    ...l,
    allKeys: f,
    symbolKeys: s,
    keySet: new Set(u),
    numKeys: u.length,
    optionalKeys: new Set(h),
  };
}
function e0(l, u, r, s, f, h, m) {
  const v = [],
    b = f.keySet,
    S = f.catchall._zod,
    _ = S.def.type,
    g = S.optin,
    A = S.optout;
  let w = 0;
  for (const U in u) {
    if (m && r.issues.length !== w) {
      if (Jn(r, w)) break;
      w = r.issues.length;
    }
    if (b.has(U)) continue;
    if (U === '__proto__') {
      _ === 'never' && v.push(U);
      continue;
    }
    if (_ === 'never') {
      v.push(U);
      continue;
    }
    const V = S.run({ value: u[U], issues: [] }, s);
    V instanceof Promise ? l.push(V.then((B) => mr(B, r, U, u, g, A))) : mr(V, r, U, u, g, A);
  }
  return (
    v.length &&
      r.issues.push({ code: 'unrecognized_keys', keys: v, input: u, inst: h, continue: !0 }),
    l.length ? Promise.all(l).then(() => r) : r
  );
}
const D2 = Z('$ZodObject', (l, u) => {
    qe.init(l, u);
    const r = Object.getOwnPropertyDescriptor(u, 'shape'),
      s = r?.get ? r.get.raw : (u.shape ?? {});
    if (s) {
      const S = () => {
        const _ = { ...s };
        return (Object.defineProperty(u, 'shape', { value: _ }), (S.raw = _), _);
      };
      ((S.raw = s), Object.defineProperty(u, 'shape', { get: S }));
    }
    const f = qf(() => Wy(u));
    xe(l, 'propValues', (S) => {
      const _ = S.def.shape,
        g = {};
      for (const A in _) {
        const w = _[A]._zod;
        if (w.values) {
          Object.prototype.hasOwnProperty.call(g, A) || Zl(g, A, new Set());
          for (const U of w.values) g[A].add(U);
          w.optin !== void 0 && g[A].add(void 0);
        }
      }
      return g;
    });
    const h = fr,
      m = u.catchall;
    let v;
    const b = vn.memoizer;
    (b?.attach(l),
      (l._zod.parse = (S, _) => {
        v ?? (v = f.value);
        const g = S.value;
        if (!h(g))
          return (
            S.issues.push({ expected: 'object', code: 'invalid_type', input: g, inst: l }),
            S
          );
        S.value = b ? b.alloc(l, S, {}, _) : {};
        const A = [],
          w = v.shape,
          U = _?.abortEarly;
        let V = S.issues.length;
        for (const B of v.allKeys) {
          if (U && S.issues.length !== V) {
            if (Jn(S, V)) break;
            V = S.issues.length;
          }
          if (B === '__proto__') continue;
          const k = w[B],
            ae = k._zod.optin,
            q = k._zod.optout,
            pe = k._zod.run({ value: g[B], issues: [] }, _);
          pe instanceof Promise
            ? A.push(pe.then((fe) => mr(fe, S, B, g, ae, q)))
            : mr(pe, S, B, g, ae, q);
        }
        return m
          ? e0(A, g, S, _, f.value, l, U === !0)
          : A.length
            ? Promise.all(A).then(() => S)
            : S;
      }));
  }),
  w2 = Z('$ZodObjectJIT', (l, u) => {
    D2.init(l, u);
    const r = l._zod.parse,
      s = qf(() => Wy(u)),
      f = vn.memoizer,
      h = (w) => {
        const U = s.value,
          V = U.symbolKeys,
          B = new GS(['payload', 'ctx'], { shape: w, inst: l, memo: f, syms: V }),
          k = (fe) => `shape[${fe}]._zod.run({ value: input[${fe}], issues: [] }, ctx)`,
          ae = (fe, ue) => `
          let ${fe}_ab = false;
          for (let i = 0; i < ${fe}.issues.length; i++) {
            const iss = ${fe}.issues[i];
            iss.path = iss.path ? [${ue}, ...iss.path] : [${ue}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${fe}_ab = true;
          }
          if (${fe}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
        B.write('const input = payload.value;');
        const q = Object.create(null);
        let pe = 0;
        for (const fe of U.allKeys) q[fe] = `key_${pe++}`;
        B.write(
          f ? 'const newResult = memo.alloc(inst, payload, {}, ctx);' : 'const newResult = {};',
        );
        for (const fe of U.allKeys) {
          if (fe === '__proto__') continue;
          const ue = q[fe],
            W = typeof fe == 'symbol' ? `syms[${V.indexOf(fe)}]` : h_(fe),
            se = `${W} in input`,
            bt = w[fe],
            Ke = bt?._zod?.optin,
            lt = Ke !== void 0,
            at = bt?._zod?.optout === 'optional';
          if ((B.write(`const ${ue} = ${k(W)};`), lt && at)) {
            const Zt =
              Ke === 'optional' ? `${ue}_present` : `${ue}.value !== undefined || ${ue}_present`;
            B.write(`
        const ${ue}_present = ${se};
        if (!${ue}.issues.length || ${ue}_present) {
          if (${ue}.issues.length) {${ae(ue, W)}
          }

          if (${Zt}) {
            newResult[${W}] = ${ue}.value;
          }
        }

      `);
          } else
            lt
              ? (B.write(`
        if (${ue}.issues.length) {${ae(ue, W)}
        }
      `),
                Ke === 'defaulted'
                  ? B.write(`newResult[${W}] = ${ue}.value;`)
                  : B.write(`
        if (${ue}.value !== undefined || ${se}) {
          newResult[${W}] = ${ue}.value;
        }
      `))
              : B.write(`
        const ${ue}_present = ${se};
        if (${ue}.issues.length) {${ae(ue, W)}
        }
        if (!${ue}_present && !${ue}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${W}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${ue}_present) {
          newResult[${W}] = ${ue}.value;
        }

      `);
        }
        return (B.write('payload.value = newResult;'), B.write('return payload;'), B.compile());
      };
    let m;
    const v = fr,
      b = !vn.jitless,
      _ = b && p_.value,
      g = u.catchall;
    let A;
    l._zod.parse = (w, U) => {
      A ?? (A = s.value);
      const V = w.value;
      return v(V)
        ? b && _ && U?.async === !1 && U.jitless !== !0
          ? (m || (m = h(u.shape)),
            (w = m(w, U)),
            g ? e0([], V, w, U, A, l, U?.abortEarly === !0) : w)
          : r(w, U)
        : (w.issues.push({ expected: 'object', code: 'invalid_type', input: V, inst: l }), w);
    };
  });
function Pv(l, u, r, s) {
  for (const h of l) if (h.issues.length === 0) return ((u.value = h.value), u);
  const f = l.filter((h) => !Jn(h));
  return f.length === 1
    ? ((u.value = f[0].value), f[0])
    : (u.issues.push({
        code: 'invalid_union',
        input: u.value,
        inst: r,
        errors: l.map((h) => h.issues.map((m) => Rl(m, s, wn()))),
      }),
      u);
}
const R2 = Z('$ZodUnion', (l, u) => {
    (qe.init(l, u),
      xe(l, 'optin', (s) =>
        s.def.options.some((f) => f._zod.optin === 'defaulted')
          ? 'defaulted'
          : s.def.options.some((f) => f._zod.optin !== void 0)
            ? 'optional'
            : void 0,
      ),
      xe(l, 'optout', (s) =>
        s.def.options.some((f) => f._zod.optout === 'optional') ? 'optional' : void 0,
      ),
      xe(l, 'values', (s) => {
        if (s.def.options.every((f) => f._zod.values))
          return new Set(s.def.options.flatMap((f) => Array.from(f._zod.values)));
      }),
      xe(l, 'pattern', (s) => {
        if (s.def.options.every((f) => f._zod.pattern)) {
          const f = s.def.options.map((h) => h._zod.pattern);
          return new RegExp(`^(${f.map((h) => Yf(h.source)).join('|')})$`);
        }
      }));
    const r = u.options.length === 1 ? u.options[0]._zod.run : null;
    l._zod.parse = (s, f) => {
      if (r) return r(s, f);
      let h = !1;
      const m = [];
      for (const v of u.options) {
        const b = v._zod.run({ value: s.value, issues: [] }, f);
        if (b instanceof Promise) (m.push(b), (h = !0));
        else {
          if (b.issues.length === 0) return b;
          m.push(b);
        }
      }
      return h ? Promise.all(m).then((v) => Pv(v, s, l, f)) : Pv(m, s, l, f);
    };
  }),
  M2 = Z('$ZodIntersection', (l, u) => {
    (qe.init(l, u),
      (l._zod.parse = (r, s) => {
        const f = r.value,
          h = u.left._zod.run({ value: f, issues: [] }, s),
          m = u.right._zod.run({ value: f, issues: [] }, s);
        return h instanceof Promise || m instanceof Promise
          ? Promise.all([h, m]).then(([b, S]) => Wv(r, b, S))
          : Wv(r, h, m);
      }));
  });
function Cf(l, u) {
  if (l === u) return { valid: !0, data: l };
  if (l instanceof Date && u instanceof Date && +l == +u) return { valid: !0, data: l };
  if (cu(l) && cu(u)) {
    const r = Object.keys(u),
      s = Object.keys(l).filter((h) => r.indexOf(h) !== -1),
      f = { ...l, ...u };
    Object.prototype.hasOwnProperty.call(f, '__proto__') && delete f.__proto__;
    for (const h of s) {
      if (h === '__proto__') continue;
      const m = Cf(l[h], u[h]);
      if (!m.valid) return { valid: !1, mergeErrorPath: [h, ...m.mergeErrorPath] };
      f[h] = m.data;
    }
    return { valid: !0, data: f };
  }
  if (Array.isArray(l) && Array.isArray(u)) {
    if (l.length !== u.length) return { valid: !1, mergeErrorPath: [] };
    const r = [];
    for (let s = 0; s < l.length; s++) {
      const f = l[s],
        h = u[s],
        m = Cf(f, h);
      if (!m.valid) return { valid: !1, mergeErrorPath: [s, ...m.mergeErrorPath] };
      r.push(m.data);
    }
    return { valid: !0, data: r };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Wv(l, u, r) {
  const s = new Map();
  let f;
  const h = new Map(),
    m = (S, _) => {
      let g;
      if (S.code === 'unrecognized_keys' && !S.path?.length) (f ?? (f = S), (g = S.keys));
      else if (S.code === 'invalid_key' && S.origin === 'record' && S.path?.length === 1) {
        const A = String(S.path[0]);
        (h.has(A) || h.set(A, S), (g = [A]));
      } else return !1;
      for (const A of g) (s.has(A) || s.set(A, {}), (s.get(A)[_] = !0));
      return !0;
    };
  for (const S of u.issues) m(S, 'l') || l.issues.push(S);
  for (const S of r.issues) m(S, 'r') || l.issues.push(S);
  const v = [...s].filter(([, S]) => S.l && S.r).map(([S]) => S);
  if (v.length) {
    const S = f ? v.filter((_) => f.keys.includes(_)) : [];
    S.length && l.issues.push({ ...f, keys: S });
    for (const _ of v) !S.includes(_) && h.has(_) && l.issues.push(h.get(_));
  }
  const b = Cf(u.value, r.value);
  if (!b.valid) {
    if (Jn(l)) return l;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(b.mergeErrorPath)}`);
  }
  return ((l.value = b.data), l);
}
const U2 = Z('$ZodRecord', (l, u) => {
    qe.init(l, u);
    const r = vn.memoizer;
    (r?.attach(l),
      (l._zod.parse = (s, f) => {
        const h = s.value;
        if (!cu(h))
          return (
            s.issues.push({ expected: 'record', code: 'invalid_type', input: h, inst: l }),
            s
          );
        const m = [],
          v = u.keyType._zod.values;
        if (v && !u.partial) {
          s.value = r ? r.alloc(l, s, {}, f) : {};
          const b = new Set();
          for (const _ of v)
            if (typeof _ == 'string' || typeof _ == 'number' || typeof _ == 'symbol') {
              if ((b.add(typeof _ == 'number' ? _.toString() : _), _ === '__proto__')) continue;
              const g = u.keyType._zod.run({ value: _, issues: [] }, f);
              if (g instanceof Promise)
                throw new Error('Async schemas not supported in object keys currently');
              if (g.issues.length) {
                s.issues.push({
                  code: 'invalid_key',
                  origin: 'record',
                  issues: g.issues.map((U) => Rl(U, f, wn())),
                  input: _,
                  path: [_],
                  inst: l,
                });
                continue;
              }
              const A = g.value;
              if (A === '__proto__') continue;
              const w = u.valueType._zod.run({ value: h[_], issues: [] }, f);
              w instanceof Promise
                ? m.push(
                    w.then((U) => {
                      (U.issues.length && s.issues.push(...au(_, U.issues)),
                        (s.value[A] = U.value));
                    }),
                  )
                : (w.issues.length && s.issues.push(...au(_, w.issues)), (s.value[A] = w.value));
            }
          let S;
          for (const _ in h)
            if (!b.has(_))
              if (u.mode === 'loose') {
                if (_ === '__proto__') continue;
                s.value[_] = h[_];
              } else ((S = S ?? []), S.push(_));
          S &&
            S.length > 0 &&
            s.issues.push({ code: 'unrecognized_keys', input: h, inst: l, keys: S, continue: !0 });
        } else {
          s.value = r ? r.alloc(l, s, {}, f) : {};
          let b;
          for (const S of Reflect.ownKeys(h)) {
            if (S === '__proto__' || !Object.prototype.propertyIsEnumerable.call(h, S)) continue;
            let _ = u.keyType._zod.run({ value: S, issues: [] }, f);
            if (_ instanceof Promise)
              throw new Error('Async schemas not supported in object keys currently');
            if (typeof S == 'string' && If.test(S) && _.issues.length) {
              const U = u.keyType._zod.run({ value: Number(S), issues: [] }, f);
              if (U instanceof Promise)
                throw new Error('Async schemas not supported in object keys currently');
              U.issues.length === 0 && (_ = U);
            }
            if (_.issues.length) {
              u.mode === 'loose'
                ? (s.value[S] = h[S])
                : v
                  ? ((b = b ?? []), b.push(S))
                  : s.issues.push({
                      code: 'invalid_key',
                      origin: 'record',
                      issues: _.issues.map((U) => Rl(U, f, wn())),
                      input: S,
                      path: [S],
                      inst: l,
                    });
              continue;
            }
            const A = _.value;
            if (A === '__proto__') continue;
            const w = u.valueType._zod.run({ value: h[S], issues: [] }, f);
            w instanceof Promise
              ? m.push(
                  w.then((U) => {
                    (U.issues.length && s.issues.push(...au(S, U.issues)), (s.value[A] = U.value));
                  }),
                )
              : (w.issues.length && s.issues.push(...au(S, w.issues)), (s.value[A] = w.value));
          }
          b &&
            b.length > 0 &&
            s.issues.push({ code: 'unrecognized_keys', input: h, inst: l, keys: b, continue: !0 });
        }
        return m.length ? Promise.all(m).then(() => s) : s;
      }));
  }),
  Z2 = Z('$ZodEnum', (l, u) => {
    qe.init(l, u);
    const r = xf(u.entries),
      s = new Set(r);
    ((l._zod.values = s),
      xe(l, 'pattern', (f) => {
        const h = xf(f.def.entries).filter((m) => v_.has(typeof m));
        return new RegExp(
          h.length ? `^(${h.map((m) => ru(m.toString())).join('|')})$` : '^[^\\s\\S]$',
        );
      }),
      (l._zod.parse = (f, h) => {
        const m = f.value;
        return (
          s.has(m) || f.issues.push({ code: 'invalid_value', values: r, input: m, inst: l }),
          f
        );
      }));
  }),
  H2 = Z('$ZodLiteral', (l, u) => {
    qe.init(l, u);
    const r = new Set(u.values);
    ((l._zod.values = r),
      xe(l, 'pattern', (s) => {
        const f = s.def.values;
        return new RegExp(
          f.length
            ? `^(${f.map((h) => (typeof h == 'string' ? ru(h) : h ? ru(h.toString()) : String(h))).join('|')})$`
            : '^[^\\s\\S]$',
        );
      }),
      (l._zod.parse = (s, f) => {
        const h = s.value;
        return (
          r.has(h) || s.issues.push({ code: 'invalid_value', values: u.values, input: h, inst: l }),
          s
        );
      }));
  }),
  k2 = Z('$ZodTransform', (l, u) => {
    (qe.init(l, u),
      (l._zod.optin = 'optional'),
      vn.memoizer?.guard(l),
      (l._zod.parse = (r, s) => {
        if (s.direction === 'backward') throw new By(l.constructor.name);
        const f = u.transform(r.value, r);
        if (s.async)
          return (f instanceof Promise ? f : Promise.resolve(f)).then((m) => ((r.value = m), r));
        if (f instanceof Promise) throw new oa();
        return ((r.value = f), r);
      }));
  });
function ey(l, u) {
  return ((l.value = u.issues.length ? void 0 : u.value), l);
}
const t0 = Z('$ZodOptional', (l, u) => {
    (qe.init(l, u),
      xe(l, 'optin', (r) =>
        r.def.innerType._zod.optin === 'defaulted' ? 'defaulted' : 'optional',
      ),
      (l._zod.optout = 'optional'),
      xe(l, 'values', (r) => {
        const s = r.def.innerType._zod.values;
        return s ? new Set([...s, void 0]) : void 0;
      }),
      xe(l, 'pattern', (r) => {
        const s = r.def.innerType._zod.pattern;
        return s ? new RegExp(`^(${Yf(s.source)})?$`) : void 0;
      }),
      (l._zod.parse = (r, s) => {
        if (r.value === void 0) {
          if (u.innerType._zod.optin !== 'defaulted') return r;
          const f = u.innerType._zod.run({ value: r.value, issues: [] }, s);
          return f instanceof Promise ? f.then((h) => ey(r, h)) : ey(r, f);
        }
        return u.innerType._zod.run(r, s);
      }));
  }),
  L2 = Z('$ZodExactOptional', (l, u) => {
    (t0.init(l, u),
      xe(l, 'values', (r) => r.def.innerType._zod.values),
      xe(l, 'pattern', (r) => r.def.innerType._zod.pattern),
      (l._zod.parse = (r, s) => u.innerType._zod.run(r, s)));
  }),
  B2 = Z('$ZodNullable', (l, u) => {
    (qe.init(l, u),
      xe(l, 'optin', (r) => r.def.innerType._zod.optin),
      xe(l, 'optout', (r) => r.def.innerType._zod.optout),
      xe(l, 'pattern', (r) => {
        const s = r.def.innerType._zod.pattern;
        return s ? new RegExp(`^(${Yf(s.source)}|null)$`) : void 0;
      }),
      xe(l, 'values', (r) =>
        r.def.innerType._zod.values ? new Set([...r.def.innerType._zod.values, null]) : void 0,
      ),
      (l._zod.parse = (r, s) => (r.value === null ? r : u.innerType._zod.run(r, s))));
  }),
  q2 = Z('$ZodDefault', (l, u) => {
    (qe.init(l, u),
      (l._zod.optin = 'defaulted'),
      xe(l, 'values', (r) => r.def.innerType._zod.values),
      (l._zod.parse = (r, s) => {
        if (s.direction === 'backward') return u.innerType._zod.run(r, s);
        if (r.value === void 0) return ((r.value = u.defaultValue), r);
        const f = u.innerType._zod.run(r, s);
        return f instanceof Promise ? f.then((h) => ty(h, u)) : ty(f, u);
      }));
  });
function ty(l, u) {
  return (l.value === void 0 && (l.value = u.defaultValue), l);
}
const Y2 = Z('$ZodPrefault', (l, u) => {
    (qe.init(l, u),
      (l._zod.optin = 'defaulted'),
      xe(l, 'values', (r) => r.def.innerType._zod.values),
      (l._zod.parse = (r, s) => (
        s.direction === 'backward' || (r.value === void 0 && (r.value = u.defaultValue)),
        u.innerType._zod.run(r, s)
      )));
  }),
  V2 = Z('$ZodNonOptional', (l, u) => {
    (qe.init(l, u),
      xe(l, 'values', (r) => {
        const s = r.def.innerType._zod.values;
        return s ? new Set([...s].filter((f) => f !== void 0)) : void 0;
      }),
      (l._zod.parse = (r, s) => {
        const f = u.innerType._zod.run(r, s);
        return f instanceof Promise ? f.then((h) => ny(h, l)) : ny(f, l);
      }));
  });
function ny(l, u) {
  return (
    !l.issues.length &&
      l.value === void 0 &&
      l.issues.push({ code: 'invalid_type', expected: 'nonoptional', input: l.value, inst: u }),
    l
  );
}
function ly(l, u, r, s) {
  return u.issues.length
    ? ((l.value = r.catchValue({
        ...u,
        value: l.value,
        error: { issues: u.issues.map((f) => Rl(f, s, wn())) },
        input: l.value,
      })),
      l)
    : ((l.value = u.value), u.memo && (l.memo = !0), l);
}
const G2 = Z('$ZodCatch', (l, u) => {
    (qe.init(l, u),
      xe(l, 'optin', (r) =>
        r.def.innerType._zod.optin === 'defaulted' ? 'defaulted' : 'optional',
      ),
      xe(l, 'optout', (r) => r.def.innerType._zod.optout),
      xe(l, 'values', (r) => r.def.innerType._zod.values),
      (l._zod.parse = (r, s) => {
        if (s.direction === 'backward') return u.innerType._zod.run(r, s);
        const f = u.innerType._zod.run({ value: r.value, issues: [] }, s);
        return f instanceof Promise ? f.then((h) => ly(r, h, u, s)) : ly(r, f, u, s);
      }));
  }),
  X2 = Z('$ZodPipe', (l, u) => {
    (qe.init(l, u),
      xe(l, 'values', (r) => r.def.in._zod.values),
      xe(l, 'optin', (r) => r.def.in._zod.optin),
      xe(l, 'optout', (r) => r.def.out._zod.optout),
      xe(l, 'propValues', (r) => r.def.in._zod.propValues),
      (l._zod.parse = (r, s) => {
        if (s.direction === 'backward') {
          const h = u.out._zod.run(r, s);
          return h instanceof Promise ? h.then((m) => er(m, u.in, s)) : er(h, u.in, s);
        }
        const f = u.in._zod.run(r, s);
        return f instanceof Promise ? f.then((h) => er(h, u.out, s)) : er(f, u.out, s);
      }));
  });
function er(l, u, r) {
  return l.issues.some((s) => s.code !== 'unrecognized_keys')
    ? ((l.aborted = !0), l)
    : u._zod.run({ value: l.value, issues: l.issues }, r);
}
const Q2 = Z('$ZodReadonly', (l, u) => {
  (qe.init(l, u),
    xe(l, 'propValues', (r) => r.def.innerType._zod.propValues),
    xe(l, 'values', (r) => r.def.innerType._zod.values),
    xe(l, 'optin', (r) => r.def.innerType?._zod?.optin),
    xe(l, 'optout', (r) => r.def.innerType?._zod?.optout),
    (l._zod.parse = (r, s) => {
      if (s.direction === 'backward') return u.innerType._zod.run(r, s);
      const f = u.innerType._zod.run(r, s);
      return f instanceof Promise ? f.then(ay) : ay(f);
    }));
});
function ay(l) {
  return (l.memo || (l.value = Object.freeze(l.value)), l);
}
const $2 = Z('$ZodCustom', (l, u) => {
  (Ut.init(l, u),
    qe.init(l, u),
    (l._zod.parse = (r, s) => r),
    (l._zod.check = (r) => {
      const s = r.value,
        f = u.fn(s);
      if (f instanceof Promise) return f.then((h) => uy(h, r, s, l));
      uy(f, r, s, l);
    }));
});
function uy(l, u, r, s) {
  if (!l) {
    const f = {
      code: 'custom',
      input: r,
      inst: s,
      path: [...(s._zod.def.path ?? [])],
      continue: !s._zod.def.abort,
    };
    (s._zod.def.params && (f.params = s._zod.def.params), u.issues.push(_i(f)));
  }
}
class K2 extends Error {
  constructor() {
    (super('Cannot parse a reference cycle that closes through a transform'),
      (this.name = 'ZodCyclicError'));
  }
}
const Df = '~memo',
  iy = [];
function n0(l) {
  return l !== null && typeof l == 'object';
}
function gf(l) {
  return l.map((u) => (u.path ? { ...u, path: u.path.slice() } : { ...u }));
}
const l0 = new WeakMap(),
  di = 0,
  rr = 1,
  vi = 2;
function sr(l, u, r) {
  const s = l0.get(l);
  if (s !== void 0) return s ? vi : di;
  if (u.has(l)) return vi;
  u.add(l);
  let f = di;
  const h = (_) => {
      if (f !== vi && _?._zod) {
        const g = sr(_, u);
        g > f && (f = g);
      }
    },
    m = (_, g) => {
      let A = di;
      for (const w of Reflect.ownKeys(_)) {
        const U = Object.getOwnPropertyDescriptor(_, w);
        if (!U.enumerable) continue;
        const V = U.get ? rr : U.value?._zod ? sr(U.value, u) : di;
        V > A && (A = V);
      }
      return A;
    },
    v = (_) => {
      _ > f && (f = _);
    },
    b = l._zod.def;
  switch (b.type) {
    case 'object': {
      const _ = Cy(b);
      (v(_ ? m(_) : rr), h(b.catchall));
      break;
    }
    case 'array':
      h(b.element);
      break;
    case 'tuple':
      for (const _ of b.items) h(_);
      h(b.rest);
      break;
    case 'record':
    case 'map':
      (h(b.keyType), h(b.valueType));
      break;
    case 'set':
      h(b.valueType);
      break;
    case 'union':
      for (const _ of b.options) h(_);
      break;
    case 'intersection':
      (h(b.left), h(b.right));
      break;
    case 'optional':
    case 'nullable':
    case 'default':
    case 'prefault':
    case 'catch':
    case 'readonly':
    case 'nonoptional':
    case 'promise':
    case 'success':
      h(b.innerType);
      break;
    case 'pipe':
      (h(b.in), h(b.out));
      break;
    case 'function':
      (h(b.input), h(b.output));
      break;
    case 'lazy': {
      const _ = b._cachedInner ?? void 0;
      v(_ ? sr(_, u) : rr);
      break;
    }
    case 'template_literal':
    case 'string':
    case 'number':
    case 'int':
    case 'boolean':
    case 'bigint':
    case 'symbol':
    case 'undefined':
    case 'null':
    case 'void':
    case 'never':
    case 'any':
    case 'unknown':
    case 'date':
    case 'nan':
    case 'enum':
    case 'literal':
    case 'file':
    case 'transform':
    case 'custom':
      break;
    default:
      for (const _ in b) {
        const g = Object.getOwnPropertyDescriptor(b, _);
        if (!g || g.get) continue;
        const A = g.value;
        if (!(!A || typeof A != 'object')) {
          if (A._zod) h(A);
          else if (Array.isArray(A)) for (const w of A) h(w);
        }
      }
  }
  return (u.delete(l), I2(l, f));
}
function I2(l, u) {
  return (u !== rr && l0.set(l, u === vi), u);
}
function J2(l, u) {
  let r = l.buckets.get(u);
  return (r || ((r = new WeakMap()), l.buckets.set(u, r)), r);
}
let tr;
const nr = [],
  F2 = {
    alloc(l, u, r) {
      const s = tr;
      if (!s) return r;
      tr = void 0;
      const f = { value: r, issues: null };
      return (s.set(u.value, f), nr.push(f), r);
    },
    guard(l) {
      var u;
      ((u = l._zod).deferred ?? (u.deferred = []),
        l._zod.deferred.push(() => {
          const r = l._zod.parse,
            s = (f, h) => {
              if (h.direction !== 'backward' && W2(h, f.value)) throw new K2();
              return r(f, h);
            };
          ((l._zod.parse = s), l._zod.run === r && (l._zod.run = s));
        }));
    },
    attach(l) {
      var u;
      let r,
        s = !1,
        f,
        h;
      ((u = l._zod).deferred ?? (u.deferred = []),
        l._zod.deferred.push(() => {
          const m = l._zod.parse,
            v = (b, S) => {
              if (r === void 0) {
                const k = sr(l, new Set());
                if (k === di)
                  return ((l._zod.parse = m), l._zod.run === v && (l._zod.run = m), m(b, S));
                k === vi || s ? (r = !0) : (s = !0);
              }
              const _ = b.value;
              if (!n0(_)) return m(b, S);
              let g = S[Df];
              g || ((g = { buckets: new WeakMap(), backEdges: void 0 }), (S[Df] = g));
              let A;
              f === S ? (A = h) : ((A = J2(g, l)), (f = S), (h = A));
              const w = A.get(_);
              if (w)
                return (
                  (b.value = w.value),
                  w.issues
                    ? w.issues.length && b.issues.push(...gf(w.issues))
                    : ((b.memo = !0),
                      g.backEdges ?? (g.backEdges = new WeakSet()),
                      g.backEdges.add(w.value)),
                  b
                );
              tr = A;
              const U = nr.length,
                V = m(b, S);
              tr = void 0;
              const B = nr.length > U ? nr.pop() : void 0;
              return V instanceof Promise
                ? V.then((k) => (B && (B.issues = k.issues.length ? gf(k.issues) : iy), k))
                : (B && (B.issues = V.issues.length ? gf(V.issues) : iy), V);
            };
          ((l._zod.parse = v), l._zod.run === m && (l._zod.run = v));
        }));
    },
  };
function P2() {
  return F2;
}
function W2(l, u) {
  const r = l[Df]?.backEdges;
  return r !== void 0 && n0(u) && r.has(u);
}
const ez = () => {
  const l = {
    string: { unit: 'characters', verb: 'to have' },
    file: { unit: 'bytes', verb: 'to have' },
    array: { unit: 'items', verb: 'to have' },
    set: { unit: 'items', verb: 'to have' },
    map: { unit: 'entries', verb: 'to have' },
  };
  function u(h) {
    return l[h] ?? null;
  }
  const r = {
      regex: 'input',
      email: 'email address',
      url: 'URL',
      emoji: 'emoji',
      uuid: 'UUID',
      uuidv4: 'UUIDv4',
      uuidv6: 'UUIDv6',
      nanoid: 'nanoid',
      guid: 'GUID',
      cuid: 'cuid',
      cuid2: 'cuid2',
      ulid: 'ULID',
      xid: 'XID',
      ksuid: 'KSUID',
      datetime: 'ISO datetime',
      date: 'ISO date',
      time: 'ISO time',
      duration: 'ISO duration',
      ipv4: 'IPv4 address',
      ipv6: 'IPv6 address',
      mac: 'MAC address',
      cidrv4: 'IPv4 range',
      cidrv6: 'IPv6 range',
      base64: 'base64-encoded string',
      base64url: 'base64url-encoded string',
      json_string: 'JSON string',
      e164: 'E.164 number',
      currency_code: 'currency code',
      credit_card: 'credit card number',
      iban: 'IBAN',
      jwt: 'JWT',
      template_literal: 'input',
    },
    s = { nan: 'NaN' };
  function f(h, m) {
    return h === 'number' && typeof m == 'number' && !Number.isFinite(m) ? String(m) : (s[h] ?? h);
  }
  return (h) => {
    switch (h.code) {
      case 'invalid_type': {
        const m = f(h.expected),
          v = x_(h.input),
          b = f(v, h.input);
        return `Invalid input: expected ${m}, received ${b}`;
      }
      case 'invalid_value':
        return h.values.length === 1
          ? `Invalid input: expected ${Uy(h.values[0])}`
          : `Invalid option: expected one of ${Vv(h.values, '|')}`;
      case 'too_big': {
        const m = h.exact ? 'exactly ' : h.inclusive ? '<=' : '<',
          v = u(h.origin);
        return v
          ? `Too big: expected ${h.origin ?? 'value'} to have ${m}${h.maximum.toString()} ${v.unit ?? 'elements'}`
          : `Too big: expected ${h.origin ?? 'value'} to be ${m}${h.maximum.toString()}`;
      }
      case 'too_small': {
        const m = h.exact ? 'exactly ' : h.inclusive ? '>=' : '>',
          v = u(h.origin);
        return v
          ? `Too small: expected ${h.origin} to have ${m}${h.minimum.toString()} ${v.unit}`
          : `Too small: expected ${h.origin} to be ${m}${h.minimum.toString()}`;
      }
      case 'invalid_format': {
        const m = h;
        return m.format === 'starts_with'
          ? `Invalid string: must start with "${m.prefix}"`
          : m.format === 'ends_with'
            ? `Invalid string: must end with "${m.suffix}"`
            : m.format === 'includes'
              ? `Invalid string: must include "${m.includes}"`
              : m.format === 'regex'
                ? `Invalid string: must match pattern ${m.pattern}`
                : `Invalid ${r[m.format] ?? h.format}`;
      }
      case 'not_multiple_of':
        return `Invalid number: must be a multiple of ${h.divisor}`;
      case 'unrecognized_keys':
        return `Unrecognized key${h.keys.length > 1 ? 's' : ''}: ${Vv(h.keys, ', ')}`;
      case 'invalid_key':
        return `Invalid key in ${h.origin}`;
      case 'invalid_union':
        return h.options && Array.isArray(h.options) && h.options.length > 0
          ? `Invalid discriminator value. Expected ${h.options.map((v) => `'${v}'`).join(' | ')}`
          : h.inclusive === !1
            ? 'Invalid input: more than one option matched'
            : 'Invalid input';
      case 'invalid_element':
        return `Invalid value in ${h.origin}`;
      default:
        return 'Invalid input';
    }
  };
};
function tz() {
  return { localeError: ez() };
}
var cy;
class nz {
  constructor() {
    ((this._map = new WeakMap()), (this._idmap = new Map()));
  }
  add(u, ...r) {
    const s = r[0];
    return (
      this._map.set(u, s),
      s && typeof s == 'object' && 'id' in s && this._idmap.set(s.id, u),
      this
    );
  }
  clear() {
    return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
  }
  remove(u) {
    const r = this._map.get(u);
    return (
      r && typeof r == 'object' && 'id' in r && this._idmap.delete(r.id),
      this._map.delete(u),
      this
    );
  }
  get(u) {
    const r = u._zod.parent;
    if (r) {
      const s = { ...(this.get(r) ?? {}) };
      delete s.id;
      const f = { ...s, ...this._map.get(u) };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(u);
  }
  has(u) {
    return this._map.has(u);
  }
}
function lz() {
  return new nz();
}
(cy = globalThis).__zod_globalRegistry ?? (cy.__zod_globalRegistry = lz());
const hi = globalThis.__zod_globalRegistry;
function Wf(l) {
  return (l.checks && (l.checks = [...l.checks]), l);
}
function az(l, u) {
  return new l(Wf({ type: 'string', ...I(u) }));
}
function a0(l, u) {
  return new l({ type: 'string', format: 'email', check: 'string_format', abort: !1, ...I(u) });
}
function uz(l, u) {
  return new l({ type: 'string', format: 'guid', check: 'string_format', abort: !1, ...I(u) });
}
function u0(l, u) {
  return new l({ type: 'string', format: 'uuid', check: 'string_format', abort: !1, ...I(u) });
}
function iz(l, u) {
  return new l({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: !1,
    version: 'v4',
    ...I(u),
  });
}
function cz(l, u) {
  return new l({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: !1,
    version: 'v6',
    ...I(u),
  });
}
function rz(l, u) {
  return new l({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: !1,
    version: 'v7',
    ...I(u),
  });
}
function sz(l, u) {
  return new l({ type: 'string', format: 'url', check: 'string_format', abort: !1, ...I(u) });
}
function oz(l, u) {
  return new l({ type: 'string', format: 'emoji', check: 'string_format', abort: !1, ...I(u) });
}
function fz(l, u) {
  return new l({ type: 'string', format: 'nanoid', check: 'string_format', abort: !1, ...I(u) });
}
function dz(l, u) {
  return new l({ type: 'string', format: 'cuid', check: 'string_format', abort: !1, ...I(u) });
}
function hz(l, u) {
  return new l({ type: 'string', format: 'cuid2', check: 'string_format', abort: !1, ...I(u) });
}
function mz(l, u) {
  return new l({ type: 'string', format: 'ulid', check: 'string_format', abort: !1, ...I(u) });
}
function pz(l, u) {
  return new l({ type: 'string', format: 'xid', check: 'string_format', abort: !1, ...I(u) });
}
function vz(l, u) {
  return new l({ type: 'string', format: 'ksuid', check: 'string_format', abort: !1, ...I(u) });
}
function yz(l, u) {
  return new l({ type: 'string', format: 'ipv4', check: 'string_format', abort: !1, ...I(u) });
}
function gz(l, u) {
  return new l({ type: 'string', format: 'ipv6', check: 'string_format', abort: !1, ...I(u) });
}
function bz(l, u) {
  return new l({ type: 'string', format: 'cidrv4', check: 'string_format', abort: !1, ...I(u) });
}
function _z(l, u) {
  return new l({ type: 'string', format: 'cidrv6', check: 'string_format', abort: !1, ...I(u) });
}
function Sz(l, u) {
  return new l({ type: 'string', format: 'base64', check: 'string_format', abort: !1, ...I(u) });
}
function zz(l, u) {
  return new l({ type: 'string', format: 'base64url', check: 'string_format', abort: !1, ...I(u) });
}
function Nz(l, u) {
  return new l({ type: 'string', format: 'e164', check: 'string_format', abort: !1, ...I(u) });
}
function Ez(l, u) {
  return new l({ type: 'string', format: 'jwt', check: 'string_format', abort: !1, ...I(u) });
}
function i0(l, u) {
  return new l({
    type: 'string',
    format: 'datetime',
    check: 'string_format',
    offset: !1,
    local: !1,
    precision: null,
    ...I(u),
  });
}
function Tz(l, u) {
  return new l({ type: 'string', format: 'date', check: 'string_format', ...I(u) });
}
function jz(l, u) {
  return new l({
    type: 'string',
    format: 'time',
    check: 'string_format',
    precision: null,
    ...I(u),
  });
}
function xz(l, u) {
  return new l({ type: 'string', format: 'duration', check: 'string_format', ...I(u) });
}
function Oz(l, u) {
  return new l(Wf({ type: 'number', checks: [], ...I(u) }));
}
function Az(l, u) {
  return new l(Wf({ type: 'number', coerce: !0, checks: [], ...I(u) }));
}
function Cz(l, u) {
  return new l({ type: 'number', check: 'number_format', abort: !1, format: 'safeint', ...I(u) });
}
function Dz(l, u) {
  return new l({ type: 'boolean', ...I(u) });
}
function wz(l) {
  return new l({ type: 'unknown' });
}
function Rz(l, u) {
  return new l({ type: 'never', ...I(u) });
}
function ry(l, u) {
  return new Vy({ check: 'less_than', ...I(u), value: l, inclusive: !1 });
}
function bf(l, u) {
  return new Vy({ check: 'less_than', ...I(u), value: l, inclusive: !0 });
}
function sy(l, u) {
  return new Gy({ check: 'greater_than', ...I(u), value: l, inclusive: !1 });
}
function _f(l, u) {
  return new Gy({ check: 'greater_than', ...I(u), value: l, inclusive: !0 });
}
function oy(l, u) {
  return new wS({ check: 'multiple_of', ...I(u), value: l });
}
function c0(l, u) {
  return new MS({ check: 'max_length', ...I(u), maximum: l });
}
function pr(l, u) {
  return new US({ check: 'min_length', ...I(u), minimum: l });
}
function r0(l, u) {
  return new ZS({ check: 'length_equals', ...I(u), length: l });
}
function Mz(l, u) {
  return new HS({ check: 'string_format', format: 'regex', ...I(u), pattern: l });
}
function Uz(l) {
  return new kS({ check: 'string_format', format: 'lowercase', ...I(l) });
}
function Zz(l) {
  return new LS({ check: 'string_format', format: 'uppercase', ...I(l) });
}
function Hz(l, u) {
  return new BS({ check: 'string_format', format: 'includes', ...I(u), includes: l });
}
function kz(l, u) {
  return new qS({ check: 'string_format', format: 'starts_with', ...I(u), prefix: l });
}
function Lz(l, u) {
  return new YS({ check: 'string_format', format: 'ends_with', ...I(u), suffix: l });
}
function fu(l) {
  return new VS({ check: 'overwrite', tx: l });
}
function Bz(l) {
  return fu((u) => u.normalize(l));
}
function qz() {
  return fu((l) => l.trim());
}
function Yz() {
  return fu((l) => l.toLowerCase());
}
function Vz() {
  return fu((l) => l.toUpperCase());
}
function Gz() {
  return fu((l) => m_(l));
}
function Xz(l, u, r) {
  return new l({ type: 'array', element: u, ...I(r) });
}
function Qz(l, u, r) {
  return new l({ type: 'custom', check: 'custom', fn: u, ...I(r) });
}
function $z(l, u) {
  const r = Kz(
    (s) => (
      (s.addIssue = (f) => {
        if (typeof f == 'string') s.issues.push(_i(f, s.value, r._zod.def));
        else {
          const h = f;
          (h.fatal && (h.continue = !1),
            h.code ?? (h.code = 'custom'),
            'input' in h || (h.input = s.value),
            h.inst ?? (h.inst = r),
            h.continue ?? (h.continue = !r._zod.def.abort),
            s.issues.push(_i(h)));
        }
      }),
      l(s.value, s)
    ),
    u,
  );
  return r;
}
function Kz(l, u) {
  const r = new Ut({ check: 'custom', ...I(u) });
  return ((r._zod.check = l), r);
}
function yi(l, ...u) {
  for (const r of u)
    for (const s of Reflect.ownKeys(r))
      Object.prototype.propertyIsEnumerable.call(r, s) && Zl(l, s, r[s]);
  return l;
}
function s0(l) {
  let u = l?.target ?? 'draft-2020-12';
  return (
    u === 'draft-4' && (u = 'draft-04'),
    u === 'draft-7' && (u = 'draft-07'),
    {
      processors: l.processors ?? {},
      metadataRegistry: l?.metadata ?? hi,
      target: u,
      unrepresentable: l?.unrepresentable ?? 'throw',
      override: l?.override ?? (() => {}),
      io: l?.io ?? 'output',
      counter: 0,
      seen: new Map(),
      sharedDefsExtractedFor: void 0,
      sharedEmitDoneFor: void 0,
      cycles: l?.cycles ?? 'ref',
      reused: l?.reused ?? 'inline',
      intersections: [],
      deferred: [],
      external: l?.external ?? void 0,
    }
  );
}
function Ul(l, u, r, s, f) {
  const h =
    typeof u.unrepresentable == 'function'
      ? u.unrepresentable({ zodSchema: l, path: s.path, message: f })
      : u.unrepresentable;
  if (h === 'any') return !1;
  if (h === void 0 || h === 'throw') throw new Error(f);
  return (Object.assign(r, h), !0);
}
function tt(l, u, r = { path: [], schemaPath: [] }) {
  var s;
  const f = l._zod.def,
    h = u.seen.get(l);
  if (h) return (h.count++, r.schemaPath.includes(l) && (h.cycle = r.path), h.schema);
  const m = { schema: {}, count: 1, cycle: void 0, path: r.path };
  (u.seen.set(l, m), (u.sharedDefsExtractedFor = void 0), (u.sharedEmitDoneFor = void 0));
  const v = l._zod.toJSONSchema?.();
  if (v) m.schema = v;
  else {
    const _ = { ...r, schemaPath: [...r.schemaPath, l], path: r.path };
    if (l._zod.processJSONSchema) l._zod.processJSONSchema(u, m.schema, _);
    else {
      const A = m.schema,
        w = u.processors[f.type];
      if (!w) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${f.type}`);
      w(l, u, A, _);
    }
    const g = l._zod.parent;
    g && (m.ref || (m.ref = g), tt(g, u, _), (u.seen.get(g).isParent = !0));
  }
  const b = u.metadataRegistry.get(l);
  return (
    b && yi(m.schema, b),
    u.io === 'input' && xt(l) && (delete m.schema.examples, delete m.schema.default),
    u.io === 'input' &&
      '_prefault' in m.schema &&
      ((s = m.schema).default ?? (s.default = m.schema._prefault)),
    delete m.schema._prefault,
    u.seen.get(l).schema
  );
}
function fy(l) {
  return l.replace(/~/g, '~0').replace(/\//g, '~1');
}
function o0(l, u) {
  const r = l.seen.get(u);
  if (!r) throw new Error('Unprocessed schema. This is a bug in Zod.');
  if (l.external && l.sharedDefsExtractedFor === l.external) return;
  const s = new Map();
  for (const m of l.seen.entries()) {
    const v = l.metadataRegistry.get(m[0])?.id;
    if (v) {
      const b = s.get(v);
      if (b && b !== m[0])
        throw new Error(
          `Duplicate schema id "${v}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      s.set(v, m[0]);
    }
  }
  const f = (m) => {
      const v = l.target === 'draft-2020-12' ? '$defs' : 'definitions';
      if (l.external) {
        const g = l.external.registry.get(m[0])?.id,
          A = l.external.uri ?? ((U) => U);
        if (g) return { ref: A(g) };
        const w = m[1].defId ?? m[1].schema.id ?? `schema${l.counter++}`;
        return ((m[1].defId = w), { defId: w, ref: `${A('__shared')}#/${v}/${fy(w)}` });
      }
      const b = '#',
        S = `${b}/${v}/`;
      if (m[1] === r && !m[1].schema.id) return { ref: b };
      const _ = m[1].schema.id ?? `__schema${l.counter++}`;
      return { defId: _, ref: S + fy(_) };
    },
    h = (m) => {
      if (m[1].schema.$ref) return;
      const v = m[1],
        { ref: b, defId: S } = f(m);
      ((v.def = { ...v.schema }), S && (v.defId = S));
      const _ = v.schema;
      for (const g in _) delete _[g];
      _.$ref = b;
    };
  if (l.cycles === 'throw')
    for (const m of l.seen.entries()) {
      const v = m[1];
      if (v.cycle)
        throw new Error(`Cycle detected: #/${v.cycle?.join('/')}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const m of l.seen.entries()) {
    const v = m[1];
    if (u === m[0]) {
      h(m);
      continue;
    }
    if (l.external) {
      const S = l.external.registry.get(m[0])?.id;
      if (u !== m[0] && S) {
        h(m);
        continue;
      }
    }
    if (l.metadataRegistry.get(m[0])?.id) {
      h(m);
      continue;
    }
    if (v.cycle) {
      h(m);
      continue;
    }
    v.count > 1 && l.reused === 'ref' && h(m);
  }
  l.external && (l.sharedDefsExtractedFor = l.external);
}
function f0(l) {
  const u = l.anyOf;
  if (!Array.isArray(u) || u.length === 0 || l.type !== void 0) return;
  const r = [];
  for (const s of u) {
    if (!s || typeof s != 'object') return;
    f0(s);
    const f = Object.keys(s);
    if (f.length !== 1 || f[0] !== 'type') return;
    const h = s.type;
    for (const m of Array.isArray(h) ? h : [h]) {
      if (typeof m != 'string') return;
      r.includes(m) || r.push(m);
    }
  }
  (delete l.anyOf, (l.type = r.length === 1 ? r[0] : r));
}
const d0 = new Set(['type', 'properties', 'required', 'additionalProperties']),
  dy = ['oneOf', 'anyOf'];
function hy(l) {
  const u = l.additionalProperties;
  return u === void 0 || u === !1 || typeof u != 'object' || u === null
    ? null
    : Object.keys(u).length
      ? u
      : null;
}
function wf(l) {
  const u = [];
  for (const h of l) {
    if (typeof h != 'object' || h.type !== 'object') return null;
    for (const m in h) if (!d0.has(m)) return null;
    u.push(h);
  }
  const r = {},
    s = new Set();
  for (const h of u) {
    for (const m in h.properties) {
      if (Object.prototype.hasOwnProperty.call(r, m)) continue;
      const v = [];
      for (const S of u) {
        const _ = S.properties?.[m] ?? hy(S);
        _ != null && (v.some((g) => JSON.stringify(g) === JSON.stringify(_)) || v.push(_));
      }
      const b = v.length === 1 ? v[0] : (wf(v) ?? { allOf: v });
      Zl(r, m, b);
    }
    for (const m of h.required ?? []) s.add(m);
  }
  const f = { type: 'object', properties: r };
  if ((s.size && (f.required = [...s]), u.every((h) => h.additionalProperties === !1)))
    f.additionalProperties = !1;
  else {
    const h = [];
    for (const m of u) {
      const v = hy(m);
      v && !h.some((b) => JSON.stringify(b) === JSON.stringify(v)) && h.push(v);
    }
    h.length === 1
      ? (f.additionalProperties = h[0])
      : h.length > 1 && (f.additionalProperties = { allOf: h });
  }
  return f;
}
function Iz(l) {
  const u = l.allOf;
  if (!Array.isArray(u) || u.length < 2) return;
  for (const f of d0) if (f in l) return;
  const r = u.filter((f) => dy.some((h) => Array.isArray(f[h])));
  let s = null;
  if (!r.length) s = wf(u);
  else {
    const f = r[0],
      h = dy.find((b) => Array.isArray(f[b]));
    if (Object.keys(f).length !== 1) return;
    const m = u.filter((b) => b !== f),
      v = f[h].map((b) => wf([...m, b]));
    if (v.some((b) => !b)) return;
    s = { [h]: v };
  }
  s && (delete l.allOf, yi(l, s));
}
function h0(l, u) {
  const r = l.seen.get(u);
  if (!r) throw new Error('Unprocessed schema. This is a bug in Zod.');
  const s = (v) => {
    const b = l.seen.get(v);
    if (b.ref === null) return;
    const S = b.def ?? b.schema,
      _ = { ...S },
      g = b.ref;
    if (((b.ref = null), g)) {
      s(g);
      const w = l.seen.get(g),
        U = w.schema;
      if (
        (U.$ref &&
        (l.target === 'draft-07' || l.target === 'draft-04' || l.target === 'openapi-3.0')
          ? ((S.allOf = S.allOf ?? []), S.allOf.push(U))
          : yi(S, U),
        yi(S, _),
        v._zod.parent === g)
      )
        for (const B in S) B === '$ref' || B === 'allOf' || B in _ || delete S[B];
      if (U.$ref && w.def)
        for (const B in S)
          B === '$ref' ||
            B === 'allOf' ||
            (B in w.def && JSON.stringify(S[B]) === JSON.stringify(w.def[B]) && delete S[B]);
    }
    const A = v._zod.parent;
    if (A && A !== g) {
      s(A);
      const w = l.seen.get(A);
      if (w?.schema.$ref && ((S.$ref = w.schema.$ref), w.def))
        for (const U in S)
          U === '$ref' ||
            U === 'allOf' ||
            (U in w.def && JSON.stringify(S[U]) === JSON.stringify(w.def[U]) && delete S[U]);
    }
    l.override({ zodSchema: v, jsonSchema: S, path: b.path ?? [] });
  };
  if (!l.external || l.sharedEmitDoneFor !== l.external) {
    for (const v of [...l.seen.entries()].reverse()) s(v[0]);
    if (l.target !== 'openapi-3.0') for (const v of l.seen.entries()) f0(v[1].def ?? v[1].schema);
    for (const v of l.deferred) v();
    if (l.intersections.length) {
      const v = new Map();
      for (const b of l.seen.values())
        for (const S of [b.schema, b.def]) {
          const _ = S?.allOf;
          if (!Array.isArray(_)) continue;
          const g = v.get(_);
          g ? g.push(S) : v.set(_, [S]);
        }
      for (const b of l.intersections) for (const S of v.get(b) ?? []) Iz(S);
    }
  }
  const f = {};
  if (
    (l.target === 'draft-2020-12'
      ? (f.$schema = 'https://json-schema.org/draft/2020-12/schema')
      : l.target === 'draft-07'
        ? (f.$schema = 'http://json-schema.org/draft-07/schema#')
        : l.target === 'draft-04'
          ? (f.$schema = 'http://json-schema.org/draft-04/schema#')
          : l.target,
    l.external?.uri)
  ) {
    const v = l.external.registry.get(u)?.id;
    if (!v) throw new Error('Schema is missing an `id` property');
    f.$id = l.external.uri(v);
  }
  yi(f, r.defId ? r.schema : (r.def ?? r.schema));
  const h = l.metadataRegistry.get(u)?.id;
  h !== void 0 && f.id === h && delete f.id;
  const m = l.external?.defs ?? {};
  if (!l.external || l.sharedEmitDoneFor !== l.external)
    for (const v of l.seen.entries()) {
      const b = v[1];
      b.def && b.defId && (b.def.id === b.defId && delete b.def.id, Zl(m, b.defId, b.def));
    }
  (l.external && (l.sharedEmitDoneFor = l.external),
    l.external ||
      (Object.keys(m).length > 0 &&
        (l.target === 'draft-2020-12' ? (f.$defs = m) : (f.definitions = m))));
  try {
    const v = JSON.parse(JSON.stringify(f));
    return (
      Object.defineProperty(v, '~standard', {
        value: {
          ...u['~standard'],
          jsonSchema: {
            input: vr(u, 'input', l.processors),
            output: vr(u, 'output', l.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      v
    );
  } catch {
    throw new Error('Error converting schema to JSON.');
  }
}
function xt(l, u) {
  const r = u ?? { seen: new Set() };
  if (r.seen.has(l)) return !1;
  r.seen.add(l);
  const s = l._zod.def;
  if (s.type === 'transform') return !0;
  if (s.type === 'array') return xt(s.element, r);
  if (s.type === 'set') return xt(s.valueType, r);
  if (s.type === 'lazy') return xt(s.getter(), r);
  if (
    s.type === 'promise' ||
    s.type === 'optional' ||
    s.type === 'nonoptional' ||
    s.type === 'nullable' ||
    s.type === 'readonly' ||
    s.type === 'default' ||
    s.type === 'prefault' ||
    s.type === 'catch'
  )
    return xt(s.innerType, r);
  if (s.type === 'intersection') return xt(s.left, r) || xt(s.right, r);
  if (s.type === 'record' || s.type === 'map') return xt(s.keyType, r) || xt(s.valueType, r);
  if (s.type === 'pipe') return l._zod.traits.has('$ZodCodec') ? !0 : xt(s.in, r) || xt(s.out, r);
  if (s.type === 'object') {
    for (const f in s.shape) if (xt(s.shape[f], r)) return !0;
    return !1;
  }
  if (s.type === 'union') {
    for (const f of s.options) if (xt(f, r)) return !0;
    return !1;
  }
  if (s.type === 'tuple') {
    for (const f of s.items) if (xt(f, r)) return !0;
    return !!(s.rest && xt(s.rest, r));
  }
  return !1;
}
const Jz =
    (l, u = {}) =>
    (r) => {
      const s = s0({ ...r, processors: u });
      return (tt(l, s), o0(s, l), h0(s, l));
    },
  vr =
    (l, u, r = {}) =>
    (s) => {
      const { libraryOptions: f, target: h } = s ?? {},
        m = s0({ ...(f ?? {}), target: h, io: u, processors: r });
      return (tt(l, m), o0(m, l), h0(m, l));
    },
  su = (l, u, r) => {
    (l[u] === void 0 || r > l[u]) && (l[u] = r);
  },
  ou = (l, u, r) => {
    (l[u] === void 0 || r < l[u]) && (l[u] = r);
  },
  my = (l, u) => {
    (su(l, 'minimum', u), ou(l, 'maximum', u));
  },
  m0 = (l, u) => {
    (l.multipleOf ?? (l.multipleOf = []), l.multipleOf.includes(u) || l.multipleOf.push(u));
  },
  p0 = (l, u) => {
    (l.patterns ?? (l.patterns = new Set()), l.patterns.add(u));
  },
  v0 = (l, u) => {
    l.mime = l.mime ? l.mime.filter((r) => u.includes(r)) : [...u];
  },
  y0 = (l, u) => {
    ((l.format = u), u.includes('int') && (l.isInt = !0));
  },
  py = (l, u) => su(l, 'minimum', u.minimum),
  vy = (l, u) => ou(l, 'maximum', u.maximum),
  yy = (l) => (u, r) => {
    y0(u, r.format);
    const [s, f] = l[r.format];
    (su(u, 'minimum', s), ou(u, 'maximum', f));
  },
  Fz = {
    greater_than: (l, u) => su(l, u.inclusive ? 'minimum' : 'exclusiveMinimum', u.value),
    less_than: (l, u) => ou(l, u.inclusive ? 'maximum' : 'exclusiveMaximum', u.value),
    multiple_of: (l, u) => m0(l, u.value),
    number_format: yy(Zy),
    bigint_format: yy(g_),
    min_length: py,
    max_length: vy,
    length_equals: (l, u) => my(l, u.length),
    min_size: py,
    max_size: vy,
    size_equals: (l, u) => my(l, u.size),
    string_format: (l, u) => {
      (y0(l, u.format),
        u.pattern && p0(l, u.pattern),
        (u.format === 'base64' || u.format === 'base64url') && (l.contentEncoding = u.format),
        (u.local || u.precision === -1) && (l.laxFormat = !0));
    },
    mime_type: (l, u) => v0(l, u.mime),
  };
function pn(l) {
  const u = {},
    r = l._zod.def,
    s = l._zod.traits.has('$ZodCheck') ? [l, ...(r.checks ?? [])] : (r.checks ?? []);
  for (const h of s) Fz[h._zod.def.check]?.(u, h._zod.def);
  const f = l._zod.bag;
  (f.minimum !== void 0 && su(u, 'minimum', f.minimum),
    f.exclusiveMinimum !== void 0 && su(u, 'exclusiveMinimum', f.exclusiveMinimum),
    f.maximum !== void 0 && ou(u, 'maximum', f.maximum),
    f.exclusiveMaximum !== void 0 && ou(u, 'exclusiveMaximum', f.exclusiveMaximum),
    f.multipleOf !== void 0 && m0(u, f.multipleOf),
    f.format !== void 0 &&
      (u.format ?? (u.format = f.format), f.format.includes('int') && (u.isInt = !0)),
    f.mime && v0(u, f.mime));
  for (const h of f.patterns ?? []) p0(u, h);
  return u;
}
const Pz = {
    guid: 'uuid',
    url: 'uri',
    datetime: 'date-time',
    json_string: 'json-string',
    regex: '',
  },
  Wz = new Map([
    [Fy, bS],
    [Pf, _S],
  ]),
  g0 = (l) => Wz.get(l) ?? l,
  eN = (l, u, r, s) => {
    const f = r;
    f.type = 'string';
    const {
      minimum: h,
      maximum: m,
      format: v,
      patterns: b,
      contentEncoding: S,
      laxFormat: _,
    } = pn(l);
    if (
      (typeof h == 'number' && (f.minLength = h),
      typeof m == 'number' && (f.maxLength = m),
      v &&
        ((f.format = Pz[v] ?? v),
        f.format === '' && delete f.format,
        (v === 'time' || _) && delete f.format),
      S && (f.contentEncoding = S),
      b && b.size > 0)
    ) {
      const g = [...b].map(g0);
      g.length === 1
        ? (f.pattern = g[0].source)
        : g.length > 1 &&
          (f.allOf = [
            ...g.map((A) => ({
              ...(u.target === 'draft-07' || u.target === 'draft-04' || u.target === 'openapi-3.0'
                ? { type: 'string' }
                : {}),
              pattern: A.source,
            })),
          ]);
    }
  },
  tN = (l, u, r, s) => {
    const f = r,
      {
        minimum: h,
        maximum: m,
        multipleOf: v,
        exclusiveMaximum: b,
        exclusiveMinimum: S,
        isInt: _,
      } = pn(l);
    f.type = _ ? 'integer' : 'number';
    const g = typeof S == 'number' && S >= (h ?? Number.NEGATIVE_INFINITY),
      A = typeof b == 'number' && b <= (m ?? Number.POSITIVE_INFINITY),
      w = u.target === 'draft-04' || u.target === 'openapi-3.0';
    if (
      (g
        ? w
          ? ((f.minimum = S), (f.exclusiveMinimum = !0))
          : (f.exclusiveMinimum = S)
        : typeof h == 'number' && (f.minimum = h),
      A
        ? w
          ? ((f.maximum = b), (f.exclusiveMaximum = !0))
          : (f.exclusiveMaximum = b)
        : typeof m == 'number' && (f.maximum = m),
      v)
    ) {
      const U = new Set();
      for (const k of v)
        Number.isFinite(k) && k !== 0
          ? U.add(Math.abs(k))
          : Ul(l, u, f, s, `A multipleOf divisor of ${k} cannot be represented in JSON Schema`);
      const [V, ...B] = U;
      (V !== void 0 && (f.multipleOf = V),
        B.length && (f.allOf = [...(f.allOf ?? []), ...B.map((k) => ({ multipleOf: k }))]));
    }
  },
  nN = (l, u, r, s) => {
    r.type = 'boolean';
  },
  lN = (l, u, r, s) => {
    r.not = {};
  },
  aN = (l, u, r, s) => {},
  uN = (l, u, r, s) => {
    const f = l._zod.def,
      h = xf(f.entries);
    if (h.length === 0) {
      r.not = {};
      return;
    }
    (h.every((m) => typeof m == 'number') && (r.type = 'number'),
      h.every((m) => typeof m == 'string') && (r.type = 'string'),
      (r.enum = h));
  },
  iN = (l, u, r, s) => {
    const f = l._zod.def;
    if (f.values.length === 0) {
      r.not = {};
      return;
    }
    const h = [];
    for (const m of f.values)
      if (m === void 0) {
        if (Ul(l, u, r, s, 'Literal `undefined` cannot be represented in JSON Schema')) return;
      } else if (typeof m == 'bigint') {
        if (Ul(l, u, r, s, 'BigInt literals cannot be represented in JSON Schema')) return;
        h.push(Number(m));
      } else h.push(m);
    if (h.length !== 0)
      if (h.length === 1) {
        const m = h[0];
        ((r.type = m === null ? 'null' : typeof m),
          u.target === 'draft-04' || u.target === 'openapi-3.0' ? (r.enum = [m]) : (r.const = m));
      } else
        (h.every((m) => typeof m == 'number') && (r.type = 'number'),
          h.every((m) => typeof m == 'string') && (r.type = 'string'),
          h.every((m) => typeof m == 'boolean') && (r.type = 'boolean'),
          h.every((m) => m === null) && (r.type = 'null'),
          (r.enum = h));
  },
  cN = (l, u, r, s) => {
    Ul(l, u, r, s, 'Custom types cannot be represented in JSON Schema');
  },
  rN = (l, u, r, s) => {
    Ul(l, u, r, s, 'Transforms cannot be represented in JSON Schema');
  },
  sN = (l, u, r, s) => {
    const f = r,
      h = l._zod.def,
      { minimum: m, maximum: v } = pn(l);
    (typeof m == 'number' && (f.minItems = m),
      typeof v == 'number' && (f.maxItems = v),
      (f.type = 'array'),
      (f.items = tt(h.element, u, { ...s, path: [...s.path, 'items'] })));
  };
function yr(l) {
  const u = l._zod.def;
  return u.type === 'pipe' && u.in._zod.traits.has('$ZodTransform')
    ? yr(u.out)
    : u.type === 'catch'
      ? yr(u.innerType)
      : l._zod.optin;
}
const oN = (l, u, r, s) => {
    const f = r,
      h = l._zod.def,
      m = h.shape;
    if (
      Object.getOwnPropertySymbols(m).length &&
      Ul(l, u, f, s, 'Symbol keys cannot be represented in JSON Schema')
    )
      return;
    ((f.type = 'object'), (f.properties = {}));
    for (const S in m)
      Zl(f.properties, S, tt(m[S], u, { ...s, path: [...s.path, 'properties', S] }));
    const b = [];
    for (const S of Object.keys(m)) {
      const _ = h.shape[S];
      (u.io === 'input' ? yr(_) === void 0 : _._zod.optout === void 0) && b.push(S);
    }
    (b.length > 0 && (f.required = b),
      h.catchall?._zod.def.type === 'never'
        ? (f.additionalProperties = !1)
        : h.catchall
          ? h.catchall &&
            (f.additionalProperties = tt(h.catchall, u, {
              ...s,
              path: [...s.path, 'additionalProperties'],
            }))
          : u.io === 'output' && (f.additionalProperties = !1));
  },
  fN = (l, u, r, s) => {
    const f = l._zod.def,
      h = f.inclusive === !1,
      m = f.options.map((v, b) => tt(v, u, { ...s, path: [...s.path, h ? 'oneOf' : 'anyOf', b] }));
    h ? (r.oneOf = m) : (r.anyOf = m);
  },
  dN = (l, u, r, s) => {
    const f = l._zod.def,
      h = tt(f.left, u, { ...s, path: [...s.path, 'allOf', 0] }),
      m = tt(f.right, u, { ...s, path: [...s.path, 'allOf', 1] }),
      v = (S) => 'allOf' in S && Object.keys(S).length === 1,
      b = [...(v(h) ? h.allOf : [h]), ...(v(m) ? m.allOf : [m])];
    ((r.allOf = b), u.intersections.push(b));
  };
function Rf(l, u, r) {
  if (u.$ref) {
    if (r.has(u)) return u;
    r.add(u);
    const U = l.get(u)?.def;
    if (!U) return u;
    const V = Rf(l, U, r);
    return V === U ? u : V;
  }
  for (const U of ['anyOf', 'oneOf']) {
    const V = u[U];
    if (!Array.isArray(V)) continue;
    const B = V.map((k) => Rf(l, k, r));
    B.some((k, ae) => k !== V[ae]) && (u = { ...u, [U]: B });
  }
  const s = Array.isArray(u.type) ? u.type : [u.type],
    f = !s.includes('string') && s.some((U) => U === 'number' || U === 'integer'),
    h = u.enum ?? (u.const !== void 0 ? [u.const] : void 0);
  if (!f && !h?.some((U) => typeof U == 'number')) return u;
  const {
    minimum: m,
    maximum: v,
    exclusiveMinimum: b,
    exclusiveMaximum: S,
    multipleOf: _,
    format: g,
    id: A,
    ...w
  } = u;
  return (
    w.enum
      ? (w.enum = w.enum.map((U) => (typeof U == 'number' ? String(U) : U)))
      : typeof w.const == 'number' && (w.const = String(w.const)),
    f && ((w.type = 'string'), h || (w.pattern = (s.includes('number') ? If : OS).source)),
    w
  );
}
const Mf = new WeakMap();
function hN(l) {
  const u = new Map();
  for (const s of l.seen.values()) s.def && !u.has(s.schema) && u.set(s.schema, s);
  const r = new Map();
  for (const s of Mf.get(l) ?? []) {
    const f = l.seen.get(s),
      h = (f?.def ?? f?.schema)?.propertyNames;
    if (!h || h === !0 || r.has(h)) continue;
    const m = Rf(u, h, new Set());
    m !== h && r.set(h, m);
  }
  if (r.size)
    for (const s of l.seen.values())
      for (const f of [s.schema, s.def]) {
        const h = f && r.get(f.propertyNames);
        h && (f.propertyNames = h);
      }
}
const mN = (l, u, r, s) => {
    const f = r,
      h = l._zod.def;
    f.type = 'object';
    const m = h.keyType,
      v = pn(m).patterns;
    if (h.mode === 'loose' && v && v.size > 0) {
      const _ = tt(h.valueType, u, { ...s, path: [...s.path, 'patternProperties', '*'] });
      f.patternProperties = {};
      for (const g of v) Zl(f.patternProperties, g0(g).source, _);
    } else {
      if (u.target === 'draft-07' || u.target === 'draft-2020-12') {
        f.propertyNames = tt(h.keyType, u, { ...s, path: [...s.path, 'propertyNames'] });
        let _ = Mf.get(u);
        (_ || ((_ = []), Mf.set(u, _), u.deferred.push(() => hN(u))), _.push(l));
      }
      f.additionalProperties = tt(h.valueType, u, {
        ...s,
        path: [...s.path, 'additionalProperties'],
      });
    }
    const b = m._zod.values,
      S = u.io === 'input' && yr(h.valueType) !== void 0;
    if (b && !h.partial && !S) {
      const _ = [...b].filter((g) => typeof g == 'string' || typeof g == 'number');
      _.length > 0 && (f.required = _.map(String));
    }
  },
  pN = (l, u, r, s) => {
    const f = l._zod.def,
      h = tt(f.innerType, u, s),
      m = u.seen.get(l);
    u.target === 'openapi-3.0'
      ? ((m.ref = f.innerType), (r.nullable = !0))
      : (r.anyOf = [h, { type: 'null' }]);
  },
  vN = (l, u, r, s) => {
    const f = l._zod.def;
    tt(f.innerType, u, s);
    const h = u.seen.get(l);
    h.ref = f.innerType;
  },
  ed = Symbol();
function b0(l, u, r, s, f) {
  let h = !1;
  const m = JSON.stringify(l, (v, b) => (typeof b != 'bigint' ? b : ((h = !0), null)));
  return h
    ? (Ul(u, r, s, f, 'BigInt defaults cannot be represented in JSON Schema'), ed)
    : JSON.parse(m);
}
const yN = (l, u, r, s) => {
    const f = l._zod.def;
    tt(f.innerType, u, s);
    const h = u.seen.get(l);
    h.ref = f.innerType;
    const m = b0(f.defaultValue, l, u, r, s);
    m !== ed && (r.default = m);
  },
  gN = (l, u, r, s) => {
    const f = l._zod.def;
    tt(f.innerType, u, s);
    const h = u.seen.get(l);
    if (((h.ref = f.innerType), u.io !== 'input')) return;
    const m = b0(f.defaultValue, l, u, r, s);
    m !== ed && (r._prefault = m);
  },
  bN = (l, u, r, s) => {
    const f = l._zod.def;
    tt(f.innerType, u, s);
    const h = u.seen.get(l);
    h.ref = f.innerType;
    let m;
    try {
      m = f.catchValue(void 0);
    } catch {
      Ul(l, u, r, s, 'Dynamic catch values are not supported in JSON Schema');
      return;
    }
    r.default = m;
  },
  _N = (l, u, r, s) => {
    const f = l._zod.def,
      h = f.in._zod.traits.has('$ZodTransform'),
      m = u.io === 'input' ? (h ? f.out : f.in) : f.out;
    tt(m, u, s);
    const v = u.seen.get(l);
    v.ref = m;
  },
  SN = (l, u, r, s) => {
    const f = l._zod.def;
    tt(f.innerType, u, s);
    const h = u.seen.get(l);
    ((h.ref = f.innerType), (r.readOnly = !0));
  },
  _0 = (l, u, r, s) => {
    const f = l._zod.def;
    tt(f.innerType, u, s);
    const h = u.seen.get(l);
    h.ref = f.innerType;
  },
  gy = new WeakSet([Object.prototype, Error.prototype]);
function lr(l, u, r) {
  Object.defineProperty(l, u, {
    configurable: !0,
    enumerable: !1,
    get() {
      const s = r(this);
      return (Object.defineProperty(this, u, { value: s, configurable: !0, writable: !0 }), s);
    },
    set(s) {
      Object.defineProperty(this, u, { value: s, configurable: !0, writable: !0 });
    },
  });
}
const zN = (l, u) => {
    (B_.init(l, u), (l.name = 'ZodError'));
    const r = Object.getPrototypeOf(l);
    gy.has(r) ||
      (gy.add(r),
      lr(r, 'format', (s) => (f) => V_(s, f)),
      lr(r, 'flatten', (s) => (f) => Y_(s, f)),
      lr(r, 'addIssue', (s) => (f) => {
        (s.issues.push(f), (s.message = JSON.stringify(s.issues, Of, 2)));
      }),
      lr(r, 'addIssues', (s) => (f) => {
        (s.issues.push(...f), (s.message = JSON.stringify(s.issues, Of, 2)));
      }),
      Object.defineProperty(r, 'isEmpty', {
        configurable: !0,
        enumerable: !1,
        get() {
          return this.issues.length === 0;
        },
      }));
  },
  cn = Z('ZodError', zN, void 0, { Parent: Error }),
  NN = Xf(cn),
  EN = Qf(cn),
  TN = $f(cn),
  jN = Kf(cn),
  xN = I_(cn),
  ON = J_(cn),
  AN = F_(cn),
  CN = P_(cn),
  DN = W_(cn),
  wN = eS(cn),
  RN = tS(cn),
  MN = nS(cn);
function UN() {
  vn.localeError || wn(tz());
}
function Nr() {
  vn.memoizer || wn({ memoizer: P2() });
}
const Ye = Z('ZodType', (l, u) => (UN(), qe.init(l, u), (l.def = u), (l.type = u.type), l), {
    check(...l) {
      const u = this.def;
      return this.clone(
        It(u, {
          checks: [
            ...(u.checks ?? []),
            ...l.map((r) =>
              typeof r == 'function'
                ? { _zod: { check: r, def: { check: 'custom' }, onattach: [] } }
                : r,
            ),
          ],
        }),
        { parent: !0 },
      );
    },
    with(...l) {
      return this.check(...l);
    },
    clone(l, u) {
      return Hl(this, l, u);
    },
    brand() {
      return this;
    },
    register(l, u) {
      return (l.add(this, u), this);
    },
    refine(l, u) {
      return this.check(AE(l, u));
    },
    superRefine(l, u) {
      return this.check(CE(l, u));
    },
    overwrite(l) {
      return this.check(fu(l));
    },
    optional() {
      return Sy(this);
    },
    exactOptional() {
      return vE(this);
    },
    nullable() {
      return zy(this);
    },
    nullish() {
      return Sy(zy(this));
    },
    nonoptional(l) {
      return zE(this, l);
    },
    array() {
      return Jt(this);
    },
    or(l) {
      return oE([this, l]);
    },
    and(l) {
      return dE(this, l);
    },
    transform(l) {
      return Ny(this, pE(l));
    },
    default(l) {
      return bE(this, l);
    },
    prefault(l) {
      return SE(this, l);
    },
    catch(l) {
      return EE(this, l);
    },
    pipe(l) {
      return Ny(this, l);
    },
    readonly() {
      return xE(this);
    },
    describe(l) {
      const u = this.clone();
      return (hi.add(u, { description: l }), u);
    },
    meta(...l) {
      if (l.length === 0) return hi.get(this);
      const u = this.clone();
      return (hi.add(u, l[0]), u);
    },
    isOptional() {
      return this.safeParse(void 0).success;
    },
    isNullable() {
      return this.safeParse(null).success;
    },
    apply(l, ...u) {
      return u.length === 0 ? l(this) : l(this, ...u);
    },
    get '~standard'() {
      return ky(this, '~standard', {
        ...Qy(this),
        jsonSchema: { input: vr(this, 'input'), output: vr(this, 'output') },
      });
    },
    set '~standard'(l) {
      Ml(this, '~standard', l);
    },
    parse: function l(u, r) {
      return NN(this, u, r, { callee: l });
    },
    parseAsync: async function l(u, r) {
      return await EN(this, u, r, { callee: l });
    },
    safeParse(l, u) {
      return TN(this, l, u);
    },
    async safeParseAsync(l, u) {
      return jN(this, l, u);
    },
    get spa() {
      return this?.safeParseAsync;
    },
    set spa(l) {
      Ml(this, 'spa', l);
    },
    validate(l, u) {
      return Q_(this, l, u);
    },
    validateAsync(l, u) {
      return K_(this, l, u);
    },
    encode: function l(u, r) {
      return xN(this, u, r, { callee: l });
    },
    decode: function l(u, r) {
      return ON(this, u, r, { callee: l });
    },
    encodeAsync: async function l(u, r) {
      return await AN(this, u, r, { callee: l });
    },
    decodeAsync: async function l(u, r) {
      return await CN(this, u, r, { callee: l });
    },
    safeEncode(l, u) {
      return DN(this, l, u);
    },
    safeDecode(l, u) {
      return wN(this, l, u);
    },
    async safeEncodeAsync(l, u) {
      return RN(this, l, u);
    },
    async safeDecodeAsync(l, u) {
      return MN(this, l, u);
    },
    toJSONSchema(l) {
      return Jz(this, {})(l);
    },
    get description() {
      return hi.get(this)?.description;
    },
    get _def() {
      return this._zod.def;
    },
  }),
  S0 = Z(
    '_ZodString',
    (l, u) => {
      (Ff.init(l, u), Ye.init(l, u), (l._zod.processJSONSchema = (r, s, f) => eN(l, r, s)));
    },
    Ly(
      {
        format: (l) => pn(l).format ?? null,
        minLength: (l) => pn(l).minimum ?? null,
        maxLength: (l) => pn(l).maximum ?? null,
      },
      {
        regex(...l) {
          return this.check(Mz(...l));
        },
        includes(...l) {
          return this.check(Hz(...l));
        },
        startsWith(...l) {
          return this.check(kz(...l));
        },
        endsWith(...l) {
          return this.check(Lz(...l));
        },
        min(...l) {
          return this.check(pr(...l));
        },
        max(...l) {
          return this.check(c0(...l));
        },
        length(...l) {
          return this.check(r0(...l));
        },
        nonempty(...l) {
          return this.check(pr(1, ...l));
        },
        lowercase(l) {
          return this.check(Uz(l));
        },
        uppercase(l) {
          return this.check(Zz(l));
        },
        trim() {
          return this.check(qz());
        },
        normalize(...l) {
          return this.check(Bz(...l));
        },
        toLowerCase() {
          return this.check(Yz());
        },
        toUpperCase() {
          return this.check(Vz());
        },
        slugify() {
          return this.check(Gz());
        },
      },
    ),
  ),
  ZN = Z(
    'ZodString',
    (l, u) => {
      (Ff.init(l, u), S0.init(l, u));
    },
    {
      email(l) {
        return this.check(a0(N0, l));
      },
      url(l) {
        return this.check(sz(YN, l));
      },
      jwt(l) {
        return this.check(Ez(lE, l));
      },
      emoji(l) {
        return this.check(oz(VN, l));
      },
      guid(l) {
        return this.check(uz(qN, l));
      },
      uuid(l) {
        return this.check(u0(mi, l));
      },
      uuidv4(l) {
        return this.check(iz(mi, l));
      },
      uuidv6(l) {
        return this.check(cz(mi, l));
      },
      uuidv7(l) {
        return this.check(rz(mi, l));
      },
      nanoid(l) {
        return this.check(fz(GN, l));
      },
      cuid(l) {
        return this.check(dz(XN, l));
      },
      cuid2(l) {
        return this.check(hz(QN, l));
      },
      ulid(l) {
        return this.check(mz($N, l));
      },
      base64(l) {
        return this.check(Sz(eE, l));
      },
      base64url(l) {
        return this.check(zz(tE, l));
      },
      xid(l) {
        return this.check(pz(KN, l));
      },
      ksuid(l) {
        return this.check(vz(IN, l));
      },
      ipv4(l) {
        return this.check(yz(JN, l));
      },
      ipv6(l) {
        return this.check(gz(FN, l));
      },
      cidrv4(l) {
        return this.check(bz(PN, l));
      },
      cidrv6(l) {
        return this.check(_z(WN, l));
      },
      e164(l) {
        return this.check(Nz(nE, l));
      },
      datetime(l) {
        return this.check(i0(z0, l));
      },
      date(l) {
        return this.check(Tz(HN, l));
      },
      time(l) {
        return this.check(jz(kN, l));
      },
      duration(l) {
        return this.check(xz(LN, l));
      },
    },
  );
function x(l) {
  return az(ZN, l);
}
const Ve = Z('ZodStringFormat', (l, u) => {
    (ke.init(l, u), S0.init(l, u));
  }),
  z0 = Z('ZodISODateTime', (l, u) => {
    (s2.init(l, u), Ve.init(l, u));
  }),
  HN = Z('ZodISODate', (l, u) => {
    (o2.init(l, u), Ve.init(l, u));
  }),
  kN = Z('ZodISOTime', (l, u) => {
    (f2.init(l, u), Ve.init(l, u));
  }),
  LN = Z('ZodISODuration', (l, u) => {
    (d2.init(l, u), Ve.init(l, u));
  }),
  N0 = Z('ZodEmail', (l, u) => {
    (IS.init(l, u), Ve.init(l, u));
  });
function BN(l) {
  return a0(N0, l);
}
const qN = Z('ZodGUID', (l, u) => {
    ($S.init(l, u), Ve.init(l, u));
  }),
  mi = Z('ZodUUID', (l, u) => {
    (KS.init(l, u), Ve.init(l, u));
  });
function or(l) {
  return u0(mi, l);
}
const YN = Z('ZodURL', (l, u) => {
    (t2.init(l, u), Ve.init(l, u));
  }),
  VN = Z('ZodEmoji', (l, u) => {
    (n2.init(l, u), Ve.init(l, u));
  }),
  GN = Z('ZodNanoID', (l, u) => {
    (l2.init(l, u), Ve.init(l, u));
  }),
  XN = Z('ZodCUID', (l, u) => {
    (a2.init(l, u), Ve.init(l, u));
  }),
  QN = Z('ZodCUID2', (l, u) => {
    (u2.init(l, u), Ve.init(l, u));
  }),
  $N = Z('ZodULID', (l, u) => {
    (i2.init(l, u), Ve.init(l, u));
  }),
  KN = Z('ZodXID', (l, u) => {
    (c2.init(l, u), Ve.init(l, u));
  }),
  IN = Z('ZodKSUID', (l, u) => {
    (r2.init(l, u), Ve.init(l, u));
  }),
  JN = Z('ZodIPv4', (l, u) => {
    (h2.init(l, u), Ve.init(l, u));
  }),
  FN = Z('ZodIPv6', (l, u) => {
    (p2.init(l, u), Ve.init(l, u));
  }),
  PN = Z('ZodCIDRv4', (l, u) => {
    (v2.init(l, u), Ve.init(l, u));
  }),
  WN = Z('ZodCIDRv6', (l, u) => {
    (g2.init(l, u), Ve.init(l, u));
  }),
  eE = Z('ZodBase64', (l, u) => {
    (b2.init(l, u), Ve.init(l, u));
  }),
  tE = Z('ZodBase64URL', (l, u) => {
    (S2.init(l, u), Ve.init(l, u));
  }),
  nE = Z('ZodE164', (l, u) => {
    (z2.init(l, u), Ve.init(l, u));
  }),
  lE = Z('ZodJWT', (l, u) => {
    (E2.init(l, u), Ve.init(l, u));
  }),
  td = Z(
    'ZodNumber',
    (l, u) => {
      (Py.init(l, u),
        Ye.init(l, u),
        (l._zod.processJSONSchema = (r, s, f) => tN(l, r, s, f)),
        (l.isFinite = !0));
    },
    Ly(
      {
        minValue: (l) => {
          const { minimum: u, exclusiveMinimum: r } = pn(l);
          return Math.max(u ?? Number.NEGATIVE_INFINITY, r ?? Number.NEGATIVE_INFINITY);
        },
        maxValue: (l) => {
          const { maximum: u, exclusiveMaximum: r } = pn(l);
          return Math.min(u ?? Number.POSITIVE_INFINITY, r ?? Number.POSITIVE_INFINITY);
        },
        isInt: (l) => {
          const { isInt: u, multipleOf: r } = pn(l);
          return !!u || !!r?.some(Number.isSafeInteger);
        },
        format: (l) => pn(l).format ?? null,
      },
      {
        gt(l, u) {
          return this.check(sy(l, u));
        },
        gte(l, u) {
          return this.check(_f(l, u));
        },
        min(l, u) {
          return this.check(_f(l, u));
        },
        lt(l, u) {
          return this.check(ry(l, u));
        },
        lte(l, u) {
          return this.check(bf(l, u));
        },
        max(l, u) {
          return this.check(bf(l, u));
        },
        int(l) {
          return this.check(by(l));
        },
        safe(l) {
          return this.check(by(l));
        },
        positive(l) {
          return this.check(sy(0, l));
        },
        nonnegative(l) {
          return this.check(_f(0, l));
        },
        negative(l) {
          return this.check(ry(0, l));
        },
        nonpositive(l) {
          return this.check(bf(0, l));
        },
        multipleOf(l, u) {
          return this.check(oy(l, u));
        },
        step(l, u) {
          return this.check(oy(l, u));
        },
        finite() {
          return this;
        },
      },
    ),
  );
function et(l) {
  return Oz(td, l);
}
const aE = Z('ZodNumberFormat', (l, u) => {
  (T2.init(l, u), td.init(l, u));
});
function by(l) {
  return Cz(aE, l);
}
const uE = Z('ZodBoolean', (l, u) => {
  (j2.init(l, u), Ye.init(l, u), (l._zod.processJSONSchema = (r, s, f) => nN(l, r, s)));
});
function Fn(l) {
  return Dz(uE, l);
}
const iE = Z('ZodUnknown', (l, u) => {
  (x2.init(l, u), Ye.init(l, u), (l._zod.processJSONSchema = (r, s, f) => aN()));
});
function St() {
  return wz(iE);
}
const cE = Z('ZodNever', (l, u) => {
  (O2.init(l, u), Ye.init(l, u), (l._zod.processJSONSchema = (r, s, f) => lN(l, r, s)));
});
function E0(l) {
  return Rz(cE, l);
}
const rE = Z(
  'ZodArray',
  (l, u) => {
    (Nr(),
      A2.init(l, u),
      Ye.init(l, u),
      (l._zod.processJSONSchema = (r, s, f) => sN(l, r, s, f)),
      (l.element = u.element));
  },
  {
    min(l, u) {
      return this.check(pr(l, u));
    },
    nonempty(l) {
      return this.check(pr(1, l));
    },
    max(l, u) {
      return this.check(c0(l, u));
    },
    length(l, u) {
      return this.check(r0(l, u));
    },
    unwrap() {
      return this.element;
    },
  },
);
function Jt(l, u) {
  return Xz(rE, l, u);
}
const T0 = Z(
  'ZodObject',
  (l, u) => {
    (Nr(),
      w2.init(l, u),
      Ye.init(l, u),
      (l._zod.processJSONSchema = (r, s, f) => oN(l, r, s, f)),
      w_(l, 'shape', (r) => r._zod.def.shape, !1));
  },
  {
    keyof() {
      return Mt(Object.keys(this._zod.def.shape));
    },
    catchall(l) {
      return this.clone(It(this._zod.def, { catchall: l }));
    },
    passthrough() {
      return this.clone(It(this._zod.def, { catchall: St() }));
    },
    loose() {
      return this.clone(It(this._zod.def, { catchall: St() }));
    },
    strict() {
      return this.clone(It(this._zod.def, { catchall: E0() }));
    },
    strip() {
      return this.clone(It(this._zod.def, { catchall: void 0 }));
    },
    extend(l) {
      return S_(this, l);
    },
    safeExtend(l) {
      return z_(this, l);
    },
    merge(l) {
      return N_(this, l);
    },
    pick(l) {
      return b_(this, l);
    },
    omit(l) {
      return __(this, l);
    },
    partial(...l) {
      return Gv(j0, this, l[0]);
    },
    exactPartial(...l) {
      return Gv(x0, this, l[0], 'exactPartial');
    },
    required(...l) {
      return E_(O0, this, l[0]);
    },
  },
);
function de(l, u) {
  const r = { type: 'object', shape: l ?? {}, ...I(u) };
  return new T0(r);
}
function Te(l, u) {
  return new T0({ type: 'object', shape: l, catchall: E0(), ...I(u) });
}
const sE = Z('ZodUnion', (l, u) => {
  (R2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => fN(l, r, s, f)),
    (l.options = u.options));
});
function oE(l, u) {
  return new sE({ type: 'union', options: l, ...I(u) });
}
const fE = Z('ZodIntersection', (l, u) => {
  (M2.init(l, u), Ye.init(l, u), (l._zod.processJSONSchema = (r, s, f) => dN(l, r, s, f)));
});
function dE(l, u) {
  return new fE({ type: 'intersection', left: l, right: u });
}
const _y = Z('ZodRecord', (l, u) => {
  (Nr(),
    U2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => mN(l, r, s, f)),
    (l.keyType = u.keyType),
    (l.valueType = u.valueType));
});
function gt(l, u, r) {
  return !u || !u._zod
    ? new _y({ type: 'record', keyType: x(), valueType: l, ...I(u) })
    : new _y({ type: 'record', keyType: l, valueType: u, ...I(r) });
}
const Uf = Z('ZodEnum', (l, u) => {
  (Z2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (s, f, h) => uN(l, s, f)),
    (l.enum = u.entries),
    (l.options = [...l._zod.values]));
  const r = new Set(Object.keys(u.entries));
  ((l.extract = (s, f) => {
    const h = {};
    for (const m of s)
      if (r.has(m)) h[m] = u.entries[m];
      else throw new Error(`Key ${m} not found in enum`);
    return new Uf({ ...u, checks: [], ...I(f), entries: h });
  }),
    (l.exclude = (s, f) => {
      const h = { ...u.entries };
      for (const m of s)
        if (r.has(m)) delete h[m];
        else throw new Error(`Key ${m} not found in enum`);
      return new Uf({ ...u, checks: [], ...I(f), entries: h });
    }));
});
function Mt(l, u) {
  const r = Array.isArray(l) ? Object.fromEntries(l.map((s) => [s, s])) : l;
  return new Uf({ type: 'enum', entries: r, ...I(u) });
}
const hE = Z('ZodLiteral', (l, u) => {
  (H2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => iN(l, r, s, f)),
    (l.values = new Set(u.values)),
    Object.defineProperty(l, 'value', {
      get() {
        if (u.values.length > 1)
          throw new Error(
            'This schema contains multiple valid literal values. Use `.values` instead.',
          );
        return u.values[0];
      },
    }));
});
function yt(l, u) {
  return new hE({ type: 'literal', values: Array.isArray(l) ? l : [l], ...I(u) });
}
const mE = Z('ZodTransform', (l, u) => {
  (Nr(),
    k2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => rN(l, r, s, f)),
    (l._zod.parse = (r, s) => {
      if (s.direction === 'backward') throw new By(l.constructor.name);
      r.addIssue = (h) => {
        if (typeof h == 'string') r.issues.push(_i(h, r.value, u));
        else {
          const m = h;
          (m.fatal && (m.continue = !1),
            m.code ?? (m.code = 'custom'),
            'input' in m || (m.input = r.value),
            m.inst ?? (m.inst = l),
            r.issues.push(_i(m)));
        }
      };
      const f = u.transform(r.value, r);
      return f instanceof Promise ? f.then((h) => ((r.value = h), r)) : ((r.value = f), r);
    }));
});
function pE(l) {
  return new mE({ type: 'transform', transform: l });
}
const j0 = Z('ZodOptional', (l, u) => {
  (t0.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => _0(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType));
});
function Sy(l) {
  return new j0({ type: 'optional', innerType: l });
}
const x0 = Z('ZodExactOptional', (l, u) => {
  (L2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => _0(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType));
});
function vE(l) {
  return new x0({ type: 'optional', innerType: l });
}
const yE = Z('ZodNullable', (l, u) => {
  (B2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => pN(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType));
});
function zy(l) {
  return new yE({ type: 'nullable', innerType: l });
}
const gE = Z('ZodDefault', (l, u) => {
  (q2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => yN(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType),
    (l.removeDefault = l.unwrap));
});
function bE(l, u) {
  return new gE({
    type: 'default',
    innerType: l,
    get defaultValue() {
      return typeof u == 'function' ? u() : My(u);
    },
  });
}
const _E = Z('ZodPrefault', (l, u) => {
  (Y2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => gN(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType));
});
function SE(l, u) {
  return new _E({
    type: 'prefault',
    innerType: l,
    get defaultValue() {
      return typeof u == 'function' ? u() : My(u);
    },
  });
}
const O0 = Z('ZodNonOptional', (l, u) => {
  (V2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => vN(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType));
});
function zE(l, u) {
  return new O0({ type: 'nonoptional', innerType: l, ...I(u) });
}
const NE = Z('ZodCatch', (l, u) => {
  (G2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => bN(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType),
    (l.removeCatch = l.unwrap));
});
function EE(l, u) {
  return new NE({ type: 'catch', innerType: l, catchValue: typeof u == 'function' ? u : M_(u) });
}
const TE = Z('ZodPipe', (l, u) => {
  (X2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => _N(l, r, s, f)),
    (l.in = u.in),
    (l.out = u.out));
});
function Ny(l, u) {
  return new TE({ type: 'pipe', in: l, out: u });
}
const jE = Z('ZodReadonly', (l, u) => {
  (Q2.init(l, u),
    Ye.init(l, u),
    (l._zod.processJSONSchema = (r, s, f) => SN(l, r, s, f)),
    (l.unwrap = () => l._zod.def.innerType));
});
function xE(l) {
  return new jE({ type: 'readonly', innerType: l });
}
const OE = Z('ZodCustom', (l, u) => {
  ($2.init(l, u), Ye.init(l, u), (l._zod.processJSONSchema = (r, s, f) => cN(l, r, s, f)));
});
function AE(l, u = {}) {
  return Qz(OE, l, u);
}
function CE(l, u) {
  return $z(l, u);
}
function gr(l) {
  return i0(z0, l);
}
function DE(l) {
  return Az(td, l);
}
const Be = or(),
  zi = x().trim().toLowerCase().pipe(BN().max(254)),
  A0 = yt(1),
  C0 = Mt(['owner', 'admin', 'operator', 'viewer']),
  $e = gr({ offset: !0 }),
  nd = Mt(['read', 'write', 'destructive']),
  D0 = Mt(['success', 'failure', 'denied']),
  wE = Mt(['pending', 'approved', 'rejected', 'expired', 'executed', 'failed']);
Mt([
  'none',
  'authentication',
  'authorization',
  'validation',
  'not_found',
  'conflict',
  'rate_limited',
  'approval_required',
  'internal',
]);
const du = de({
  id: Be,
  name: x(),
  description: x().nullable(),
  agentIdentity: x(),
  permissionLevel: nd,
  tokenPrefix: x(),
  createdByUserId: Be.nullable(),
  createdAt: $e,
  lastUsedAt: $e.nullable(),
  expiresAt: $e.nullable(),
  revokedAt: $e.nullable(),
  disabledAt: $e.nullable(),
  metadata: gt(x(), St()).nullable(),
}).strict();
de({
  name: x().trim().min(1).max(80),
  description: x().trim().max(280).optional(),
  agentIdentity: x().trim().min(1).max(120).optional(),
  permissionLevel: nd,
  expiresInDays: et().int().min(1).max(365).optional(),
  metadata: gt(x(), St()).optional(),
}).strict();
const RE = de({ credential: du, token: x() }).strict(),
  ME = de({ credentials: Jt(du), nextCursor: x().nullable() }).strict(),
  UE = de({ credential: du }).strict();
de({ credential: du }).strict();
de({ credential: du }).strict();
de({ credential: du, token: x() }).strict();
const ZE = de({
  setupRequired: Fn(),
  service: yt('dockpilot-api'),
  protocolVersion: yt(1),
  database: yt('reachable'),
  mcpEnabled: Fn(),
  counts: de({
    users: et().int().nonnegative(),
    activeSessions: et().int().nonnegative(),
    activeAiCredentials: et().int().nonnegative(),
    revokedAiCredentials: et().int().nonnegative(),
    pendingApprovals: et().int().nonnegative(),
    auditEvents24h: et().int().nonnegative(),
  }).strict(),
  serverTime: $e,
}).strict();
de({ id: Be, email: zi, name: x(), role: C0, disabled: Fn(), createdAt: $e }).strict();
de({ id: Be, userId: Be, userEmail: zi, createdAt: $e, expiresAt: $e, lastSeenAt: $e }).strict();
const w0 = de({
    id: Be,
    occurredAt: $e,
    outcome: D0,
    action: x(),
    resourceType: x(),
    resourceId: x().nullable(),
    correlationId: x().nullable(),
    aiCredentialId: Be.nullable(),
    aiCredentialName: x().nullable(),
    agentIdentity: x().nullable(),
    toolName: x().nullable(),
    permissionUsed: x().nullable(),
    targetType: x().nullable(),
    targetId: x().nullable(),
    approvalId: Be.nullable(),
    durationMs: et().int().nonnegative().nullable(),
    sourceIp: x().nullable(),
    userAgent: x().nullable(),
    actorUserId: Be.nullable(),
    errorCategory: x().nullable(),
    inputSummary: gt(x(), St()).nullable(),
    resultSummary: gt(x(), St()).nullable(),
    metadata: gt(x(), St()).nullable(),
  }).strict(),
  HE = de({ events: Jt(w0), nextCursor: x().nullable() }).strict();
de({
  limit: DE().int().min(1).max(100).default(25),
  cursor: x().max(256).optional(),
  aiCredentialId: Be.optional(),
  toolName: x().max(80).optional(),
  action: x().max(100).optional(),
  outcome: D0.optional(),
  targetType: x().max(40).optional(),
  targetId: x().max(255).optional(),
  from: $e.optional(),
  to: $e.optional(),
}).strict();
const R0 = de({
    id: Be,
    toolName: x(),
    actionType: x(),
    permissionLevel: nd,
    targetType: x(),
    targetId: x(),
    arguments: gt(x(), St()),
    justification: x().nullable(),
    status: wE,
    requestedByCredentialId: Be,
    requestedByCredentialName: x().nullable(),
    requestedByAgentIdentity: x().nullable(),
    decidedByUserId: Be.nullable(),
    decidedAt: $e.nullable(),
    decisionNote: x().nullable(),
    executionAuditEventId: Be.nullable(),
    expiresAt: $e,
    createdAt: $e,
  }).strict(),
  kE = de({ approvals: Jt(R0), nextCursor: x().nullable() }).strict();
de({ decision: Mt(['approve', 'reject']), note: x().trim().max(280).optional() }).strict();
const LE = de({ approval: R0 }).strict(),
  BE = Mt(['healthy', 'unhealthy', 'disabled', 'error']),
  ld = de({
    id: Be,
    organizationId: Be,
    createdByUserId: Be.nullable(),
    name: x(),
    description: x().nullable(),
    endpoint: x(),
    status: BE,
    lastErrorAt: $e.nullable(),
    lastError: x().nullable(),
    dockerVersion: x().nullable(),
    labels: gt(x(), x()).nullable(),
    metadata: gt(x(), St()).nullable(),
    lastSeenAt: $e.nullable(),
    createdAt: $e,
    updatedAt: $e,
  }).strict();
de({
  name: x().trim().min(1).max(80),
  description: x().trim().max(280).optional(),
  endpoint: x().trim().min(1).max(255),
  labels: gt(x(), x()).optional(),
  metadata: gt(x(), St()).optional(),
}).strict();
de({ host: ld, token: x() }).strict();
de({ hosts: Jt(ld), nextCursor: x().nullable() }).strict();
de({
  name: x().trim().min(1).max(80).optional(),
  description: x().trim().max(280).nullable().optional(),
  endpoint: x().trim().min(1).max(255).optional(),
  labels: gt(x(), x()).nullable().optional(),
  metadata: gt(x(), St()).nullable().optional(),
}).strict();
de({ host: ld }).strict();
const qE = Mt([
    'created',
    'running',
    'paused',
    'restarting',
    'removing',
    'exited',
    'dead',
    'unknown',
  ]),
  M0 = de({
    id: Be,
    hostId: Be,
    containerId: x(),
    shortId: x().nullable(),
    name: x().nullable(),
    image: x(),
    state: qE,
    status: x(),
    created: x(),
    labels: gt(x(), x()).nullable(),
    ports: Jt(St()).nullable(),
    syncedAt: $e,
  }).strict(),
  YE = de({ log: x(), tty: Fn(), tail: et().int().min(1).max(1e3) }).strict();
de({ containers: Jt(M0), nextCursor: x().nullable() }).strict();
de({ log: YE }).strict();
de({ container: M0 }).strict();
const VE = 1,
  GE = Mt(['read', 'write', 'destructive']),
  fi = et().int().min(1).max(100);
(Te({
  status: yt('ok'),
  service: yt('dockpilot-api'),
  protocolVersion: yt(1),
  mcpContractVersion: yt(VE),
  database: yt('reachable'),
  serverTime: x(),
}),
  Te({
    setupRequired: Fn(),
    organizationId: x(),
    mcpEnabled: Fn(),
    users: et().int().nonnegative(),
    activeSessions: et().int().nonnegative(),
    activeAiCredentials: et().int().nonnegative(),
    revokedAiCredentials: et().int().nonnegative(),
    pendingApprovals: et().int().nonnegative(),
    auditEvents24h: et().int().nonnegative(),
    serverTime: x(),
  }),
  Te({
    users: Jt(Te({ id: x(), email: x(), name: x(), role: x(), disabled: Fn(), createdAt: x() })),
    nextCursor: x().nullable(),
  }),
  Te({
    sessions: Jt(
      Te({ id: x(), userId: x(), userEmail: x(), createdAt: x(), expiresAt: x(), lastSeenAt: x() }),
    ),
    nextCursor: x().nullable(),
  }),
  Te({
    credentials: Jt(
      Te({
        id: x(),
        name: x(),
        description: x().nullable(),
        agentIdentity: x(),
        permissionLevel: x(),
        tokenPrefix: x(),
        createdAt: x(),
        lastUsedAt: x().nullable(),
        expiresAt: x().nullable(),
        revokedAt: x().nullable(),
        disabledAt: x().nullable(),
      }),
    ),
    nextCursor: x().nullable(),
  }),
  Te({
    events: Jt(
      Te({
        id: x(),
        occurredAt: x(),
        outcome: x(),
        action: x(),
        toolName: x().nullable(),
        agentIdentity: x().nullable(),
        aiCredentialId: x().nullable(),
        targetType: x().nullable(),
        targetId: x().nullable(),
        correlationId: x().nullable(),
        durationMs: et().int().nonnegative().nullable(),
        approvalId: x().nullable(),
      }),
    ),
    nextCursor: x().nullable(),
  }),
  Te({
    event: Te({
      id: x(),
      occurredAt: x(),
      outcome: x(),
      action: x(),
      resourceType: x(),
      resourceId: x().nullable(),
      correlationId: x().nullable(),
      aiCredentialId: x().nullable(),
      agentIdentity: x().nullable(),
      toolName: x().nullable(),
      permissionUsed: x().nullable(),
      targetType: x().nullable(),
      targetId: x().nullable(),
      approvalId: x().nullable(),
      durationMs: et().int().nonnegative().nullable(),
      errorCategory: x().nullable(),
      inputSummary: gt(x(), St()).nullable(),
      resultSummary: gt(x(), St()).nullable(),
    }),
  }),
  Te({
    approvals: Jt(
      Te({
        id: x(),
        toolName: x(),
        actionType: x(),
        targetType: x(),
        targetId: x(),
        status: x(),
        justification: x().nullable(),
        createdAt: x(),
        expiresAt: x(),
        decidedAt: x().nullable(),
      }),
    ),
    nextCursor: x().nullable(),
  }),
  Te({
    credential: Te({
      id: x(),
      name: x(),
      description: x().nullable(),
      agentIdentity: x(),
      permissionLevel: x(),
    }),
  }),
  Te({
    approvalRequired: yt(!0),
    approvalId: x(),
    status: yt('pending'),
    targetType: yt('session'),
    targetId: x(),
    expiresAt: x(),
  }),
  Te({
    approvalRequired: yt(!0),
    approvalId: x(),
    status: yt('pending'),
    targetType: yt('ai_credential'),
    targetId: x(),
    expiresAt: x(),
  }));
(Te({}),
  Te({}),
  Te({ limit: fi.optional(), cursor: x().max(256).optional() }),
  Te({ limit: fi.optional(), cursor: x().max(256).optional() }),
  Te({ limit: fi.optional(), cursor: x().max(256).optional() }),
  Te({
    limit: fi.optional(),
    cursor: x().max(256).optional(),
    outcome: Mt(['success', 'failure', 'denied']).optional(),
    action: x().max(100).optional(),
    toolName: x().max(80).optional(),
    targetType: x().max(40).optional(),
    targetId: x().max(255).optional(),
    from: gr({ offset: !0 }).optional(),
    to: gr({ offset: !0 }).optional(),
  }),
  Te({ eventId: or() }),
  Te({
    status: Mt(['pending', 'approved', 'rejected', 'expired', 'executed', 'failed']).optional(),
    limit: fi.optional(),
    cursor: x().max(256).optional(),
  }),
  Te({
    description: x().trim().max(280).nullable().optional(),
    agentIdentity: x().trim().min(1).max(120).optional(),
    metadata: gt(x(), St()).nullable().optional(),
  }),
  Te({ sessionId: or(), justification: x().trim().min(4).max(500) }),
  Te({ credentialId: or(), justification: x().trim().min(4).max(500) }));
const U0 = Mt([
    'dockpilot_health',
    'dockpilot_system_status',
    'dockpilot_list_users',
    'dockpilot_list_sessions',
    'dockpilot_list_ai_credentials',
    'dockpilot_list_audit_events',
    'dockpilot_get_audit_event',
    'dockpilot_list_approvals',
    'dockpilot_update_my_credential',
    'dockpilot_request_session_revocation',
    'dockpilot_request_credential_revocation',
  ]),
  XE = U0.options;
Te({
  contractVersion: et().int(),
  tools: Jt(
    Te({
      name: U0,
      permissionLevel: Mt(['read', 'write', 'destructive']),
      rateCategory: GE,
      actionType: x(),
      destructive: Fn(),
    }),
  ),
});
de({ status: yt('ok'), service: yt('dockpilot-api'), protocolVersion: A0 }).strict();
const QE = de({ setupRequired: Fn() }).strict();
de({
  email: zi,
  password: x()
    .min(12)
    .max(128)
    .refine((l) => $E(l), 'Password must not contain control characters'),
  name: x().trim().min(1).max(80),
  organizationName: x().trim().min(1).max(100),
}).strict();
function $E(l) {
  for (const u of l) {
    const r = u.codePointAt(0);
    if (r !== void 0 && (r <= 31 || r === 127)) return !1;
  }
  return !0;
}
de({ email: zi, password: x().min(1).max(128) }).strict();
const KE = de({ id: Be, email: zi, name: x(), organizationId: Be, role: C0 }).strict(),
  ad = de({ user: KE }).strict();
de({
  protocolVersion: A0,
  agentId: Be,
  hostId: Be,
  sequence: et().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  timestamp: gr({ offset: !0 }),
  payload: gt(x(), St()),
}).strict();
const IE = de({ error: x(), message: x() });
class Pn extends Error {
  constructor(u, r, s) {
    (super(s), (this.status = u), (this.code = r), (this.name = 'ApiError'));
  }
}
async function Z0(l, u, r) {
  const s = await fetch(`/api/v1/auth/${l}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(u),
  });
  if (!s.ok) return hu(s);
  const f = r.safeParse(await s.json());
  if (!f.success)
    throw new Pn(
      502,
      'INVALID_API_RESPONSE',
      'The DockPilot server returned an invalid response. Check its logs.',
    );
  return f.data;
}
async function hu(l) {
  const u = IE.safeParse(await l.json().catch(() => null));
  throw l.status === 429
    ? new Pn(
        l.status,
        'RATE_LIMITED',
        'Too many attempts. Please wait a few minutes and try again.',
      )
    : u.success
      ? new Pn(l.status, u.data.error, u.data.message)
      : new Pn(l.status, 'REQUEST_FAILED', 'The request could not be completed.');
}
async function JE() {
  const l = await fetch('/api/v1/auth/setup-status', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  l.ok || (await hu(l));
  const u = QE.safeParse(await l.json());
  if (!u.success)
    throw new Pn(
      502,
      'INVALID_API_RESPONSE',
      'The DockPilot server returned an invalid setup response.',
    );
  return u.data.setupRequired;
}
async function FE() {
  const l = await fetch('/api/v1/auth/me', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (l.status === 401) return null;
  l.ok || (await hu(l));
  const u = ad.safeParse(await l.json());
  if (!u.success)
    throw new Pn(502, 'INVALID_API_RESPONSE', 'The DockPilot server returned an invalid session.');
  return u.data.user;
}
async function PE() {
  const l = await fetch('/api/v1/health', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  l.ok || (await hu(l));
}
async function WE(l) {
  return (await Z0('setup', l, ad)).user;
}
async function eT(l) {
  return (await Z0('login', l, ad)).user;
}
async function tT() {
  const l = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: '{}',
  });
  l.ok || (await hu(l));
}
async function kl(l, u, r) {
  const s = await fetch(`/api/v1/admin${l}`, {
    method: u.method ?? 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(u.body === void 0 ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(u.body === void 0 ? {} : { body: u.body }),
  });
  if (!s.ok) return hu(s);
  const f = r.safeParse(await s.json());
  if (!f.success)
    throw new Pn(
      502,
      'INVALID_API_RESPONSE',
      'The DockPilot server returned an invalid response. Check its logs.',
    );
  return f.data;
}
function nT() {
  return kl('/system-status', {}, ZE);
}
function Zf(l) {
  const u = l === void 0 ? '' : `?cursor=${encodeURIComponent(l)}`;
  return kl(`/ai-credentials${u}`, {}, ME);
}
function lT(l) {
  return kl('/ai-credentials', { method: 'POST', body: JSON.stringify(l) }, RE);
}
function aT(l) {
  return kl(`/ai-credentials/${encodeURIComponent(l)}/revoke`, { method: 'POST', body: '{}' }, UE);
}
function Ey(l = {}) {
  const u = new URLSearchParams();
  (l.limit !== void 0 && u.set('limit', String(l.limit)),
    l.cursor !== void 0 && l.cursor !== '' && u.set('cursor', l.cursor),
    l.aiCredentialId !== void 0 &&
      l.aiCredentialId !== '' &&
      u.set('aiCredentialId', l.aiCredentialId),
    l.toolName !== void 0 && l.toolName !== '' && u.set('toolName', l.toolName),
    l.action !== void 0 && l.action !== '' && u.set('action', l.action),
    l.outcome !== void 0 && u.set('outcome', l.outcome),
    l.targetType !== void 0 && l.targetType !== '' && u.set('targetType', l.targetType),
    l.targetId !== void 0 && l.targetId !== '' && u.set('targetId', l.targetId),
    l.from !== void 0 && l.from !== '' && u.set('from', l.from),
    l.to !== void 0 && l.to !== '' && u.set('to', l.to));
  const r = u.toString();
  return kl(`/audit-events${r.length > 0 ? `?${r}` : ''}`, {}, HE);
}
function uT(l) {
  return kl(`/audit-events/${encodeURIComponent(l)}`, {}, w0);
}
function Ty(l, u) {
  const r = new URLSearchParams();
  (l !== void 0 && l !== '' && r.set('status', l), u !== void 0 && r.set('cursor', u));
  const s = r.toString();
  return kl(`/approvals${s.length > 0 ? `?${s}` : ''}`, {}, kE);
}
function iT(l, u, r) {
  const s = { decision: u };
  return (
    r !== void 0 && r !== '' && (s.note = r),
    kl(
      `/approvals/${encodeURIComponent(l)}/decision`,
      { method: 'POST', body: JSON.stringify(s) },
      LE,
    )
  );
}
function H0(l) {
  return l.role === 'owner' || l.role === 'admin';
}
function cT({ section: l, user: u }) {
  return H0(u)
    ? l === 'ai-credentials'
      ? o.jsx(dT, {})
      : l === 'audit-log'
        ? o.jsx(hT, {})
        : o.jsx(pT, {})
    : o.jsx(Er, {
        children: o.jsxs('div', {
          className: 'admin-lock',
          children: [
            o.jsx('span', { className: 'admin-lock-icon', children: o.jsx(iu, { size: 20 }) }),
            o.jsx('h2', { children: 'Administrator access required' }),
            o.jsxs('p', {
              children: [
                'AI credentials, the AI activity log and approval decisions are restricted to instance owners and administrators. Your role is ',
                o.jsx('strong', { children: u.role.toUpperCase() }),
                '.',
              ],
            }),
          ],
        }),
      });
}
function Er({ children: l }) {
  return o.jsx('section', { className: 'admin-panel', children: l });
}
function ud({ eyebrow: l, title: u, description: r, icon: s, actions: f }) {
  return o.jsxs('header', {
    className: 'admin-heading',
    children: [
      o.jsxs('div', {
        className: 'admin-heading-copy',
        children: [
          o.jsx('p', { className: 'eyebrow', children: l }),
          o.jsx('h1', { children: u }),
          o.jsx('p', { className: 'admin-heading-detail', children: r }),
        ],
      }),
      o.jsx('span', { className: 'admin-heading-icon', children: o.jsx(s, { size: 18 }) }),
      f !== void 0 && o.jsx('div', { className: 'admin-heading-actions', children: f }),
    ],
  });
}
function uu({ tone: l, children: u }) {
  return o.jsxs('div', {
    className: `admin-notice admin-notice--${l}`,
    role: l === 'error' ? 'alert' : 'note',
    children: [
      l === 'error' ? o.jsx(bi, { size: 15 }) : o.jsx(Dl, { size: 15 }),
      o.jsx('span', { children: u }),
    ],
  });
}
function br({ label: l }) {
  return o.jsxs('div', {
    className: 'admin-loading',
    'aria-busy': 'true',
    children: [o.jsx(sa, { size: 15, className: 'admin-spin' }), ' ', l],
  });
}
function id({ icon: l, title: u, detail: r }) {
  return o.jsxs('div', {
    className: 'quiet-empty',
    children: [
      o.jsx('span', { className: 'quiet-empty-icon', children: o.jsx(l, { size: 17 }) }),
      o.jsxs('span', {
        children: [o.jsx('strong', { children: u }), o.jsx('span', { children: r })],
      }),
      o.jsx('span', { className: 'empty-line' }),
    ],
  });
}
function Dn(l) {
  return l instanceof Pn || l instanceof Error ? l.message : 'The request could not be completed.';
}
function rT({ level: l }) {
  return o.jsx('span', {
    className: `permission-chip permission-chip--${l}`,
    children: l.toUpperCase(),
  });
}
function sT({ outcome: l }) {
  const u = l === 'failure' ? 'FAILED' : l === 'denied' ? 'DENIED' : 'OK';
  return o.jsx('span', { className: `outcome-chip outcome-chip--${l}`, children: u });
}
function oT({ credential: l }) {
  const u = l.expiresAt !== null && Date.parse(l.expiresAt) <= Date.now();
  return l.revokedAt !== null
    ? o.jsx('span', { className: 'state-chip state-chip--red', children: 'REVOKED' })
    : l.disabledAt !== null
      ? o.jsx('span', { className: 'state-chip', children: 'DISABLED' })
      : u
        ? o.jsx('span', { className: 'state-chip state-chip--amber', children: 'EXPIRED' })
        : o.jsx('span', { className: 'state-chip state-chip--green', children: 'ACTIVE' });
}
function wl(l) {
  if (l === null) return '—';
  const u = new Date(l);
  return Number.isNaN(u.getTime()) ? '—' : u.toLocaleString();
}
function gi(l) {
  return l === null ? '—' : l.length > 12 ? `${l.slice(0, 8)}…` : l;
}
function fT({ value: l }) {
  const [u, r] = $.useState(!1);
  async function s() {
    try {
      (await navigator.clipboard.writeText(l), r(!0));
    } catch {
      r(!1);
    }
  }
  return o.jsxs('button', {
    type: 'button',
    className: 'button button--outline button--compact',
    onClick: () => {
      s();
    },
    children: [u ? o.jsx(Lf, { size: 13 }) : o.jsx(t_, { size: 13 }), u ? 'Copied' : 'Copy token'],
  });
}
function dT() {
  const [l, u] = $.useState([]),
    [r, s] = $.useState(null),
    [f, h] = $.useState(null),
    [m, v] = $.useState(!0),
    [b, S] = $.useState(null),
    [_, g] = $.useState(null),
    [A, w] = $.useState(null),
    [U, V] = $.useState(!1),
    [B, k] = $.useState(null),
    [ae, q] = $.useState(null),
    [pe, fe] = $.useState(''),
    [ue, W] = $.useState(''),
    [se, bt] = $.useState(''),
    [Ke, lt] = $.useState('read'),
    [at, Zt] = $.useState(''),
    Ht = $.useCallback(async () => {
      (v(!0), S(null));
      try {
        const [L, re] = await Promise.all([Zf(), nT()]);
        (u(L.credentials), s(L.nextCursor), h(re));
      } catch (L) {
        S(Dn(L));
      } finally {
        v(!1);
      }
    }, []);
  $.useEffect(() => {
    Ht();
  }, [Ht]);
  async function Ie() {
    if (r !== null) {
      v(!0);
      try {
        const L = await Zf(r);
        (u((re) => [...re, ...L.credentials]), s(L.nextCursor));
      } catch (L) {
        S(Dn(L));
      } finally {
        v(!1);
      }
    }
  }
  async function G(L) {
    if ((L.preventDefault(), !U)) {
      (V(!0), w(null));
      try {
        const re = at.trim(),
          _e = await lT({
            name: pe.trim(),
            permissionLevel: Ke,
            ...(ue.trim() === '' ? {} : { description: ue.trim() }),
            ...(se.trim() === '' ? {} : { agentIdentity: se.trim() }),
            ...(re === '' ? {} : { expiresInDays: Number(re) }),
          });
        (g(_e.token), fe(''), W(''), bt(''), Zt(''), lt('read'), await Ht());
      } catch (re) {
        w(Dn(re));
      } finally {
        V(!1);
      }
    }
  }
  async function ee(L) {
    (q(L), S(null));
    try {
      (await aT(L), k(null), await Ht());
    } catch (re) {
      S(Dn(re));
    } finally {
      q(null);
    }
  }
  return o.jsxs(Er, {
    children: [
      o.jsx(ud, {
        eyebrow: 'AI CONTROL',
        title: 'AI credentials',
        description:
          'MCP clients authenticate with a dedicated AI credential, never with a browser session. Permissions are enforced server-side on every tool call.',
        icon: pi,
        actions: o.jsxs('button', {
          type: 'button',
          className: 'button button--outline button--compact',
          onClick: () => {
            Ht();
          },
          disabled: m,
          children: [o.jsx(Oy, { size: 13 }), ' Refresh'],
        }),
      }),
      f !== null &&
        o.jsxs('div', {
          className: 'admin-stats',
          children: [
            o.jsx(lu, { label: 'USERS', value: f.counts.users }),
            o.jsx(lu, { label: 'ACTIVE SESSIONS', value: f.counts.activeSessions }),
            o.jsx(lu, { label: 'ACTIVE AI CREDENTIALS', value: f.counts.activeAiCredentials }),
            o.jsx(lu, { label: 'REVOKED AI CREDENTIALS', value: f.counts.revokedAiCredentials }),
            o.jsx(lu, { label: 'PENDING APPROVALS', value: f.counts.pendingApprovals }),
            o.jsx(lu, { label: 'AUDIT EVENTS (24H)', value: f.counts.auditEvents24h }),
          ],
        }),
      _ !== null &&
        o.jsxs('div', {
          className: 'token-reveal',
          role: 'alert',
          children: [
            o.jsxs('div', {
              className: 'token-reveal-head',
              children: [
                o.jsx('span', {
                  className: 'token-reveal-icon',
                  children: o.jsx(Ef, { size: 16 }),
                }),
                o.jsxs('div', {
                  children: [
                    o.jsx('strong', { children: 'Copy this token now.' }),
                    o.jsx('p', {
                      children:
                        "It is shown once and cannot be retrieved later. Store it in your MCP client's secret store, never in source control.",
                    }),
                  ],
                }),
                o.jsx('button', {
                  type: 'button',
                  className: 'icon-button',
                  'aria-label': 'Hide issued token',
                  onClick: () => {
                    g(null);
                  },
                  children: o.jsx(Bf, { size: 15 }),
                }),
              ],
            }),
            o.jsx('code', { className: 'token-value', children: _ }),
            o.jsxs('div', {
              className: 'token-reveal-actions',
              children: [
                o.jsx(fT, { value: _ }),
                o.jsx('button', {
                  type: 'button',
                  className: 'button button--primary button--compact',
                  onClick: () => {
                    g(null);
                  },
                  children: 'I have stored it',
                }),
              ],
            }),
          ],
        }),
      o.jsxs('form', {
        className: 'admin-form',
        onSubmit: (L) => void G(L),
        children: [
          o.jsx('p', { className: 'panel-eyebrow', children: 'CREATE A CREDENTIAL' }),
          o.jsxs('div', {
            className: 'admin-form-grid',
            children: [
              o.jsxs('label', {
                className: 'admin-field',
                children: [
                  o.jsx('span', { children: 'NAME' }),
                  o.jsx('input', {
                    value: pe,
                    onChange: (L) => {
                      fe(L.target.value);
                    },
                    maxLength: 80,
                    required: !0,
                    placeholder: 'e.g. claude-code-laptop',
                  }),
                ],
              }),
              o.jsxs('label', {
                className: 'admin-field',
                children: [
                  o.jsx('span', { children: 'AGENT IDENTITY' }),
                  o.jsx('input', {
                    value: se,
                    onChange: (L) => {
                      bt(L.target.value);
                    },
                    maxLength: 120,
                    placeholder: 'e.g. claude-code',
                  }),
                ],
              }),
              o.jsxs('label', {
                className: 'admin-field',
                children: [
                  o.jsx('span', { children: 'PERMISSION LEVEL' }),
                  o.jsxs('select', {
                    value: Ke,
                    onChange: (L) => {
                      const re = L.target.value;
                      lt(re === 'write' ? 'write' : re === 'destructive' ? 'destructive' : 'read');
                    },
                    children: [
                      o.jsx('option', { value: 'read', children: 'read — inspect only' }),
                      o.jsx('option', {
                        value: 'write',
                        children: 'write — non-destructive changes',
                      }),
                      o.jsx('option', {
                        value: 'destructive',
                        children: 'destructive — may request irreversible actions',
                      }),
                    ],
                  }),
                ],
              }),
              o.jsxs('label', {
                className: 'admin-field',
                children: [
                  o.jsx('span', { children: 'EXPIRES IN DAYS' }),
                  o.jsx('input', {
                    type: 'number',
                    min: 1,
                    max: 365,
                    value: at,
                    onChange: (L) => {
                      Zt(L.target.value);
                    },
                    placeholder: '1–365, empty means no expiry',
                  }),
                ],
              }),
              o.jsxs('label', {
                className: 'admin-field admin-field--wide',
                children: [
                  o.jsx('span', { children: 'DESCRIPTION' }),
                  o.jsx('input', {
                    value: ue,
                    onChange: (L) => {
                      W(L.target.value);
                    },
                    maxLength: 280,
                    placeholder: 'What this agent is for',
                  }),
                ],
              }),
            ],
          }),
          Ke === 'destructive' &&
            o.jsx(uu, {
              tone: 'info',
              children:
                'Destructive credentials cannot act alone: revocation requests are queued for human approval.',
            }),
          A !== null && o.jsx(uu, { tone: 'error', children: A }),
          o.jsx('button', {
            className: 'button button--primary button--compact',
            type: 'submit',
            disabled: U,
            children: U
              ? o.jsxs(o.Fragment, {
                  children: [o.jsx(sa, { size: 13, className: 'admin-spin' }), ' Creating…'],
                })
              : o.jsxs(o.Fragment, {
                  children: [o.jsx(Ef, { size: 13 }), ' Create AI credential'],
                }),
          }),
        ],
      }),
      b !== null && o.jsx(uu, { tone: 'error', children: b }),
      o.jsxs('div', {
        className: 'admin-table-wrap',
        children: [
          o.jsxs('table', {
            className: 'admin-table',
            children: [
              o.jsx('thead', {
                children: o.jsxs('tr', {
                  children: [
                    o.jsx('th', { scope: 'col', children: 'NAME' }),
                    o.jsx('th', { scope: 'col', children: 'AGENT' }),
                    o.jsx('th', { scope: 'col', children: 'PERMISSION' }),
                    o.jsx('th', { scope: 'col', children: 'TOKEN PREFIX' }),
                    o.jsx('th', { scope: 'col', children: 'CREATED' }),
                    o.jsx('th', { scope: 'col', children: 'LAST USED' }),
                    o.jsx('th', { scope: 'col', children: 'EXPIRES' }),
                    o.jsx('th', { scope: 'col', children: 'STATUS' }),
                    o.jsx('th', { scope: 'col', children: 'ACTION' }),
                  ],
                }),
              }),
              o.jsx('tbody', {
                children: l.map((L) =>
                  o.jsxs(
                    'tr',
                    {
                      children: [
                        o.jsxs('td', {
                          children: [
                            o.jsx('strong', { children: L.name }),
                            L.description !== null &&
                              o.jsx('span', {
                                className: 'admin-cell-detail',
                                children: L.description,
                              }),
                          ],
                        }),
                        o.jsx('td', {
                          children: o.jsx('span', {
                            className: 'admin-mono',
                            children: L.agentIdentity,
                          }),
                        }),
                        o.jsx('td', { children: o.jsx(rT, { level: L.permissionLevel }) }),
                        o.jsx('td', {
                          children: o.jsxs('span', {
                            className: 'admin-mono',
                            children: [L.tokenPrefix, '…'],
                          }),
                        }),
                        o.jsx('td', { children: wl(L.createdAt) }),
                        o.jsx('td', { children: wl(L.lastUsedAt) }),
                        o.jsx('td', { children: wl(L.expiresAt) }),
                        o.jsx('td', { children: o.jsx(oT, { credential: L }) }),
                        o.jsx('td', {
                          children:
                            L.revokedAt !== null
                              ? o.jsx('span', {
                                  className: 'admin-cell-detail',
                                  children: 'already revoked',
                                })
                              : B === L.id
                                ? o.jsxs('span', {
                                    className: 'admin-confirm',
                                    children: [
                                      o.jsxs('button', {
                                        type: 'button',
                                        className: 'button button--danger button--compact',
                                        disabled: ae === L.id,
                                        onClick: () => {
                                          ee(L.id);
                                        },
                                        children: [
                                          ae === L.id
                                            ? o.jsx(sa, { size: 13, className: 'admin-spin' })
                                            : o.jsx(iu, { size: 13 }),
                                          'Confirm revoke',
                                        ],
                                      }),
                                      o.jsx('button', {
                                        type: 'button',
                                        className: 'text-button',
                                        onClick: () => {
                                          k(null);
                                        },
                                        children: 'Cancel',
                                      }),
                                    ],
                                  })
                                : o.jsxs('button', {
                                    type: 'button',
                                    className: 'button button--outline button--compact',
                                    onClick: () => {
                                      k(L.id);
                                    },
                                    children: [o.jsx(iu, { size: 13 }), ' Revoke'],
                                  }),
                        }),
                      ],
                    },
                    L.id,
                  ),
                ),
              }),
            ],
          }),
          m && l.length === 0 && o.jsx(br, { label: 'Loading AI credentials…' }),
          !m &&
            l.length === 0 &&
            b === null &&
            o.jsx(id, {
              icon: pi,
              title: 'No AI credentials yet.',
              detail: 'Create one to let an MCP client control DockPilot with scoped permissions.',
            }),
        ],
      }),
      r !== null &&
        o.jsxs('button', {
          type: 'button',
          className: 'button button--outline button--compact',
          disabled: m,
          onClick: () => {
            Ie();
          },
          children: [
            m ? o.jsx(sa, { size: 13, className: 'admin-spin' }) : o.jsx(pi, { size: 13 }),
            ' Load more',
          ],
        }),
    ],
  });
}
function lu({ label: l, value: u }) {
  return o.jsxs('div', {
    className: 'admin-stat',
    children: [o.jsx('span', { children: l }), o.jsx('strong', { children: u })],
  });
}
const ar = {
  toolName: '',
  action: '',
  outcome: '',
  aiCredentialId: '',
  targetType: '',
  targetId: '',
  from: '',
  to: '',
};
function ur(l) {
  if (l.trim() === '') return;
  const u = new Date(l);
  if (!Number.isNaN(u.getTime())) return u.toISOString();
}
function hT() {
  const [l, u] = $.useState(ar),
    [r, s] = $.useState([]),
    [f, h] = $.useState(null),
    [m, v] = $.useState([]),
    [b, S] = $.useState(!0),
    [_, g] = $.useState(null),
    [A, w] = $.useState(null),
    [U, V] = $.useState(!1),
    B = $.useCallback(async (q) => {
      (S(!0), g(null));
      try {
        const pe = await Ey({
          limit: 25,
          ...(q.toolName.trim() === '' ? {} : { toolName: q.toolName.trim() }),
          ...(q.action.trim() === '' ? {} : { action: q.action.trim() }),
          ...(q.outcome === '' ? {} : { outcome: q.outcome }),
          ...(q.aiCredentialId === '' ? {} : { aiCredentialId: q.aiCredentialId }),
          ...(q.targetType.trim() === '' ? {} : { targetType: q.targetType.trim() }),
          ...(q.targetId.trim() === '' ? {} : { targetId: q.targetId.trim() }),
          ...(ur(q.from) === void 0 ? {} : { from: ur(q.from) }),
          ...(ur(q.to) === void 0 ? {} : { to: ur(q.to) }),
        });
        (s(pe.events), h(pe.nextCursor), w(null));
      } catch (pe) {
        g(Dn(pe));
      } finally {
        S(!1);
      }
    }, []);
  ($.useEffect(() => {
    B(ar);
  }, [B]),
    $.useEffect(() => {
      (async () => {
        try {
          const pe = await Zf();
          v(pe.credentials);
        } catch {
          v([]);
        }
      })();
    }, []));
  async function k() {
    if (f !== null) {
      S(!0);
      try {
        const q = await Ey({ limit: 25, cursor: f });
        (s((pe) => [...pe, ...q.events]), h(q.nextCursor));
      } catch (q) {
        g(Dn(q));
      } finally {
        S(!1);
      }
    }
  }
  async function ae(q) {
    (V(!0), g(null));
    try {
      w(await uT(q));
    } catch (pe) {
      g(Dn(pe));
    } finally {
      V(!1);
    }
  }
  return o.jsxs(Er, {
    children: [
      o.jsx(ud, {
        eyebrow: 'AI CONTROL',
        title: 'AI activity log',
        description:
          'Every MCP tool call is recorded, including denied, invalid and rate-limited attempts. Sensitive values are redacted before they are stored.',
        icon: Cn,
        actions: o.jsxs('button', {
          type: 'button',
          className: 'button button--outline button--compact',
          onClick: () => {
            B(l);
          },
          disabled: b,
          children: [o.jsx(Oy, { size: 13 }), ' Refresh'],
        }),
      }),
      o.jsxs('div', {
        className: 'admin-filter-grid',
        children: [
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'AI CREDENTIAL' }),
              o.jsxs('select', {
                value: l.aiCredentialId,
                onChange: (q) => {
                  u({ ...l, aiCredentialId: q.target.value });
                },
                children: [
                  o.jsx('option', { value: '', children: 'All credentials' }),
                  m.map((q) => o.jsx('option', { value: q.id, children: q.name }, q.id)),
                ],
              }),
            ],
          }),
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'STATUS' }),
              o.jsxs('select', {
                value: l.outcome,
                onChange: (q) => {
                  u({ ...l, outcome: q.target.value });
                },
                children: [
                  o.jsx('option', { value: '', children: 'All outcomes' }),
                  o.jsx('option', { value: 'success', children: 'Success' }),
                  o.jsx('option', { value: 'failure', children: 'Failure' }),
                  o.jsx('option', { value: 'denied', children: 'Denied' }),
                ],
              }),
            ],
          }),
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'TOOL' }),
              o.jsx('input', {
                list: 'audit-tool-names',
                value: l.toolName,
                onChange: (q) => {
                  u({ ...l, toolName: q.target.value });
                },
                placeholder: 'e.g. dockpilot_list_users',
              }),
              o.jsx('datalist', {
                id: 'audit-tool-names',
                children: XE.map((q) => o.jsx('option', { value: q }, q)),
              }),
            ],
          }),
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'ACTION' }),
              o.jsx('input', {
                value: l.action,
                onChange: (q) => {
                  u({ ...l, action: q.target.value });
                },
                placeholder: 'e.g. mcp.health',
              }),
            ],
          }),
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'TARGET TYPE' }),
              o.jsx('input', {
                value: l.targetType,
                onChange: (q) => {
                  u({ ...l, targetType: q.target.value });
                },
                placeholder: 'e.g. session',
              }),
            ],
          }),
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'TARGET ID' }),
              o.jsx('input', {
                value: l.targetId,
                onChange: (q) => {
                  u({ ...l, targetId: q.target.value });
                },
                placeholder: 'resource identifier',
              }),
            ],
          }),
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'FROM' }),
              o.jsx('input', {
                type: 'datetime-local',
                value: l.from,
                onChange: (q) => {
                  u({ ...l, from: q.target.value });
                },
              }),
            ],
          }),
          o.jsxs('label', {
            className: 'admin-field',
            children: [
              o.jsx('span', { children: 'TO' }),
              o.jsx('input', {
                type: 'datetime-local',
                value: l.to,
                onChange: (q) => {
                  u({ ...l, to: q.target.value });
                },
              }),
            ],
          }),
        ],
      }),
      o.jsxs('div', {
        className: 'admin-filter-actions',
        children: [
          o.jsx('button', {
            type: 'button',
            className: 'button button--primary button--compact',
            onClick: () => {
              B(l);
            },
            disabled: b,
            children: 'Apply filters',
          }),
          o.jsx('button', {
            type: 'button',
            className: 'button button--outline button--compact',
            onClick: () => {
              (u(ar), B(ar));
            },
            children: 'Clear',
          }),
        ],
      }),
      _ !== null && o.jsx(uu, { tone: 'error', children: _ }),
      o.jsxs('div', {
        className: 'admin-table-wrap',
        children: [
          o.jsxs('table', {
            className: 'admin-table',
            children: [
              o.jsx('thead', {
                children: o.jsxs('tr', {
                  children: [
                    o.jsx('th', { scope: 'col', children: 'TIME' }),
                    o.jsx('th', { scope: 'col', children: 'AI IDENTITY' }),
                    o.jsx('th', { scope: 'col', children: 'TOOL' }),
                    o.jsx('th', { scope: 'col', children: 'ACTION' }),
                    o.jsx('th', { scope: 'col', children: 'TARGET' }),
                    o.jsx('th', { scope: 'col', children: 'STATUS' }),
                    o.jsx('th', { scope: 'col', children: 'DURATION' }),
                    o.jsx('th', { scope: 'col', children: 'CORRELATION' }),
                  ],
                }),
              }),
              o.jsx('tbody', {
                children: r.map((q) =>
                  o.jsxs(
                    'tr',
                    {
                      className: 'admin-row',
                      onClick: () => {
                        ae(q.id);
                      },
                      children: [
                        o.jsx('td', { children: wl(q.occurredAt) }),
                        o.jsxs('td', {
                          children: [
                            o.jsx('strong', { children: q.agentIdentity ?? 'human' }),
                            q.aiCredentialName !== null &&
                              o.jsx('span', {
                                className: 'admin-cell-detail',
                                children: q.aiCredentialName,
                              }),
                          ],
                        }),
                        o.jsx('td', {
                          children: o.jsx('span', {
                            className: 'admin-mono',
                            children: q.toolName ?? '—',
                          }),
                        }),
                        o.jsx('td', {
                          children: o.jsx('span', { className: 'admin-mono', children: q.action }),
                        }),
                        o.jsx('td', {
                          children:
                            q.targetType === null ? '—' : `${q.targetType}:${gi(q.targetId)}`,
                        }),
                        o.jsxs('td', {
                          children: [
                            o.jsx(sT, { outcome: q.outcome }),
                            q.approvalId !== null &&
                              o.jsx('span', { className: 'admin-flag', children: 'APPROVAL' }),
                          ],
                        }),
                        o.jsx('td', {
                          children: q.durationMs === null ? '—' : `${String(q.durationMs)} ms`,
                        }),
                        o.jsx('td', {
                          children: o.jsx('span', {
                            className: 'admin-mono',
                            children: gi(q.correlationId),
                          }),
                        }),
                      ],
                    },
                    q.id,
                  ),
                ),
              }),
            ],
          }),
          b && r.length === 0 && o.jsx(br, { label: 'Loading the AI activity log…' }),
          !b &&
            r.length === 0 &&
            _ === null &&
            o.jsx(id, {
              icon: Cn,
              title: 'No activity matches these filters.',
              detail: 'MCP tool calls from AI credentials will appear here.',
            }),
        ],
      }),
      f !== null &&
        o.jsxs('button', {
          type: 'button',
          className: 'button button--outline button--compact',
          disabled: b,
          onClick: () => {
            k();
          },
          children: [
            b ? o.jsx(sa, { size: 13, className: 'admin-spin' }) : o.jsx(Cn, { size: 13 }),
            ' Load older events',
          ],
        }),
      U && o.jsx(br, { label: 'Loading audit event…' }),
      A !== null &&
        o.jsx(mT, {
          event: A,
          close: () => {
            w(null);
          },
        }),
    ],
  });
}
function mT({ event: l, close: u }) {
  return o.jsxs('aside', {
    className: 'audit-detail',
    'aria-label': 'Audit event detail',
    children: [
      o.jsxs('header', {
        className: 'audit-detail-head',
        children: [
          o.jsxs('div', {
            children: [
              o.jsx('p', { className: 'panel-eyebrow', children: 'AUDIT EVENT' }),
              o.jsx('h3', { children: l.action }),
            ],
          }),
          o.jsx('button', {
            type: 'button',
            className: 'icon-button',
            'aria-label': 'Close detail',
            onClick: u,
            children: o.jsx(Bf, { size: 15 }),
          }),
        ],
      }),
      o.jsxs('dl', {
        className: 'audit-detail-grid',
        children: [
          o.jsx(jt, { label: 'Event ID', value: l.id }),
          o.jsx(jt, { label: 'Occurred', value: wl(l.occurredAt) }),
          o.jsx(jt, { label: 'Outcome', value: l.outcome }),
          o.jsx(jt, { label: 'Error category', value: l.errorCategory ?? '—' }),
          o.jsx(jt, { label: 'Tool', value: l.toolName ?? '—' }),
          o.jsx(jt, { label: 'Permission used', value: l.permissionUsed ?? '—' }),
          o.jsx(jt, { label: 'AI credential', value: gi(l.aiCredentialId) }),
          o.jsx(jt, { label: 'Agent identity', value: l.agentIdentity ?? '—' }),
          o.jsx(jt, { label: 'Actor user', value: gi(l.actorUserId) }),
          o.jsx(jt, { label: 'Target', value: `${l.targetType ?? '—'}:${l.targetId ?? '—'}` }),
          o.jsx(jt, { label: 'Approval', value: gi(l.approvalId) }),
          o.jsx(jt, { label: 'Correlation ID', value: l.correlationId ?? '—' }),
          o.jsx(jt, {
            label: 'Duration',
            value: l.durationMs === null ? '—' : `${String(l.durationMs)} ms`,
          }),
          o.jsx(jt, { label: 'Source IP', value: l.sourceIp ?? '—' }),
          o.jsx(jt, { label: 'User agent', value: l.userAgent ?? '—' }),
        ],
      }),
      o.jsx(Sf, { title: 'Redacted input', value: l.inputSummary }),
      o.jsx(Sf, { title: 'Redacted result', value: l.resultSummary }),
      o.jsx(Sf, { title: 'Metadata', value: l.metadata }),
    ],
  });
}
function jt({ label: l, value: u }) {
  return o.jsxs('div', {
    className: 'audit-term',
    children: [o.jsx('dt', { children: l.toUpperCase() }), o.jsx('dd', { children: u })],
  });
}
function Sf({ title: l, value: u }) {
  return o.jsxs('section', {
    className: 'audit-summary',
    children: [
      o.jsx('p', { className: 'panel-eyebrow', children: l.toUpperCase() }),
      o.jsx('pre', {
        className: 'audit-json',
        children: u === null ? '—' : JSON.stringify(u, null, 2),
      }),
    ],
  });
}
function pT() {
  const [l, u] = $.useState('pending'),
    [r, s] = $.useState([]),
    [f, h] = $.useState(null),
    [m, v] = $.useState(!0),
    [b, S] = $.useState(null),
    [_, g] = $.useState(null),
    [A, w] = $.useState({}),
    U = $.useCallback(async (k) => {
      (v(!0), S(null));
      try {
        const ae = await Ty(k === '' ? void 0 : k);
        (s(ae.approvals), h(ae.nextCursor));
      } catch (ae) {
        S(Dn(ae));
      } finally {
        v(!1);
      }
    }, []);
  $.useEffect(() => {
    U('pending');
  }, [U]);
  async function V() {
    if (f !== null) {
      v(!0);
      try {
        const k = await Ty(l === '' ? void 0 : l, f);
        (s((ae) => [...ae, ...k.approvals]), h(k.nextCursor));
      } catch (k) {
        S(Dn(k));
      } finally {
        v(!1);
      }
    }
  }
  async function B(k, ae) {
    (g(k), S(null));
    try {
      (await iT(k, ae, A[k]), await U(l));
    } catch (q) {
      S(Dn(q));
    } finally {
      g(null);
    }
  }
  return o.jsxs(Er, {
    children: [
      o.jsx(ud, {
        eyebrow: 'AI CONTROL',
        title: 'Approval inbox',
        description:
          'Destructive AI requests are queued here. Nothing irreversible happens until an administrator approves it, and every decision is recorded.',
        icon: iu,
        actions: o.jsxs('label', {
          className: 'admin-field admin-field--inline',
          children: [
            o.jsx('span', { children: 'STATUS' }),
            o.jsxs('select', {
              value: l,
              onChange: (k) => {
                (u(k.target.value), U(k.target.value));
              },
              children: [
                o.jsx('option', { value: 'pending', children: 'Pending' }),
                o.jsx('option', { value: 'executed', children: 'Executed' }),
                o.jsx('option', { value: 'rejected', children: 'Rejected' }),
                o.jsx('option', { value: 'expired', children: 'Expired' }),
                o.jsx('option', { value: 'failed', children: 'Failed' }),
                o.jsx('option', { value: '', children: 'All' }),
              ],
            }),
          ],
        }),
      }),
      o.jsx(uu, {
        tone: 'info',
        children:
          'Approvals expire one hour after they are requested. Only session revocation and AI credential revocation can be executed.',
      }),
      b !== null && o.jsx(uu, { tone: 'error', children: b }),
      m && r.length === 0 && o.jsx(br, { label: 'Loading approvals…' }),
      !m &&
        r.length === 0 &&
        b === null &&
        o.jsx(id, {
          icon: Fb,
          title: 'Nothing waiting for you.',
          detail: 'Destructive AI requests appear here for review.',
        }),
      o.jsx('div', {
        className: 'approval-list',
        children: r.map((k) =>
          o.jsxs(
            'article',
            {
              className: 'approval-card',
              children: [
                o.jsxs('header', {
                  className: 'approval-card-head',
                  children: [
                    o.jsxs('div', {
                      children: [
                        o.jsx('p', { className: 'panel-eyebrow', children: 'DESTRUCTIVE REQUEST' }),
                        o.jsx('h3', { children: k.actionType }),
                      ],
                    }),
                    o.jsx('span', {
                      className: `state-chip state-chip--${k.status === 'pending' ? 'amber' : k.status === 'executed' ? 'green' : 'red'}`,
                      children: k.status.toUpperCase(),
                    }),
                  ],
                }),
                o.jsxs('div', {
                  className: 'approval-meta',
                  children: [
                    o.jsxs('span', {
                      children: [
                        o.jsx('strong', { children: 'Requested by' }),
                        ' ',
                        k.requestedByCredentialName ?? 'unknown',
                        ' ',
                        k.requestedByAgentIdentity === null
                          ? ''
                          : `(${k.requestedByAgentIdentity})`,
                      ],
                    }),
                    o.jsxs('span', {
                      children: [
                        o.jsx('strong', { children: 'Tool' }),
                        ' ',
                        o.jsx('span', { className: 'admin-mono', children: k.toolName }),
                      ],
                    }),
                    o.jsxs('span', {
                      children: [
                        o.jsx('strong', { children: 'Target' }),
                        ' ',
                        o.jsxs('span', {
                          className: 'admin-mono',
                          children: [k.targetType, ':', k.targetId],
                        }),
                      ],
                    }),
                    o.jsxs('span', {
                      children: [o.jsx('strong', { children: 'Requested' }), ' ', wl(k.createdAt)],
                    }),
                    o.jsxs('span', {
                      children: [o.jsx('strong', { children: 'Expires' }), ' ', wl(k.expiresAt)],
                    }),
                    k.decidedAt !== null &&
                      o.jsxs('span', {
                        children: [o.jsx('strong', { children: 'Decided' }), ' ', wl(k.decidedAt)],
                      }),
                  ],
                }),
                k.justification !== null &&
                  o.jsx('blockquote', {
                    className: 'approval-justification',
                    children: k.justification,
                  }),
                k.status === 'pending'
                  ? o.jsxs('div', {
                      className: 'approval-actions',
                      children: [
                        o.jsx('input', {
                          className: 'approval-note',
                          value: A[k.id] ?? '',
                          onChange: (ae) => {
                            w({ ...A, [k.id]: ae.target.value });
                          },
                          maxLength: 280,
                          placeholder: 'Optional decision note',
                          'aria-label': 'Decision note',
                        }),
                        o.jsxs('button', {
                          type: 'button',
                          className: 'button button--danger button--compact',
                          disabled: _ === k.id,
                          onClick: () => {
                            B(k.id, 'approve');
                          },
                          title: 'Executes the destructive action immediately',
                          children: [
                            _ === k.id
                              ? o.jsx(sa, { size: 13, className: 'admin-spin' })
                              : o.jsx(iu, { size: 13 }),
                            'Approve and execute',
                          ],
                        }),
                        o.jsxs('button', {
                          type: 'button',
                          className: 'button button--outline button--compact',
                          disabled: _ === k.id,
                          onClick: () => {
                            B(k.id, 'reject');
                          },
                          children: [o.jsx(Bf, { size: 13 }), ' Reject'],
                        }),
                      ],
                    })
                  : o.jsx('p', {
                      className: 'admin-cell-detail',
                      children:
                        k.decisionNote === null || k.decisionNote === ''
                          ? 'Decided by an administrator.'
                          : `Note: ${k.decisionNote}`,
                    }),
              ],
            },
            k.id,
          ),
        ),
      }),
      f !== null &&
        o.jsxs('button', {
          type: 'button',
          className: 'button button--outline button--compact',
          disabled: m,
          onClick: () => {
            V();
          },
          children: [
            m ? o.jsx(sa, { size: 13, className: 'admin-spin' }) : o.jsx(Pb, { size: 13 }),
            ' Load more',
          ],
        }),
    ],
  });
}
function vT() {
  const [l, u] = $.useState(null),
    [r, s] = $.useState('setup'),
    [f, h] = $.useState('loading'),
    [m, v] = $.useState('checking'),
    [b, S] = $.useState(null),
    _ = $.useCallback(async () => {
      try {
        (await PE(), v('online'));
      } catch {
        v('offline');
      }
    }, []),
    g = $.useCallback(async () => {
      (h('loading'), S(null));
      try {
        const [A, w] = await Promise.all([JE(), FE()]);
        (await _(), u(w), s(A ? 'setup' : 'login'), h('ready'));
      } catch (A) {
        (S(A instanceof Error ? A.message : 'The DockPilot API could not be reached.'),
          v('offline'),
          h('error'));
      }
    }, [_]);
  return (
    $.useEffect(() => {
      g();
      const A = window.setInterval(() => void _(), 3e4);
      return () => {
        window.clearInterval(A);
      };
    }, [g, _]),
    f === 'loading'
      ? o.jsx(yT, {})
      : f === 'error'
        ? o.jsx(gT, {
            message: b ?? 'The DockPilot API could not be reached.',
            retry: () => {
              g();
            },
          })
        : l
          ? o.jsx(_T, {
              user: l,
              serverStatus: m,
              onLogout: async () => {
                try {
                  (await tT(), u(null), await g());
                } catch (A) {
                  S(A instanceof Error ? A.message : 'Could not sign out.');
                }
              },
              globalError: b,
              clearGlobalError: () => {
                S(null);
              },
            })
          : o.jsx(bT, {
              initialMode: r,
              onAuthenticated: (A) => {
                (u(A), s('login'));
              },
              setGlobalError: S,
              globalError: b,
              serverStatus: m,
              initialize: g,
            })
  );
}
function Si({ small: l = !1 }) {
  return o.jsxs('div', {
    className: `brand-lockup${l ? ' brand-lockup--small' : ''}`,
    children: [
      o.jsx('span', {
        className: 'brand-symbol',
        'aria-hidden': 'true',
        children: o.jsx(Ay, { size: l ? 18 : 22, strokeWidth: 2.25 }),
      }),
      o.jsxs('span', {
        className: 'brand-name',
        children: [
          'dock',
          o.jsx('span', { children: 'pilot' }),
          o.jsx('span', { className: 'brand-dot', children: '.' }),
        ],
      }),
    ],
  });
}
function k0({ status: l }) {
  const u =
    l === 'online' ? 'API connected' : l === 'offline' ? 'API disconnected' : 'Checking API';
  return o.jsxs('span', {
    className: `connection-state connection-state--${l}`,
    children: [o.jsx('span', { className: 'connection-dot' }), u],
  });
}
function yT() {
  return o.jsxs('main', {
    className: 'loading-screen',
    'aria-label': 'Loading DockPilot',
    'aria-busy': 'true',
    children: [
      o.jsx(Si, {}),
      o.jsx('div', { className: 'loading-track', children: o.jsx('span', {}) }),
      o.jsxs('p', {
        children: [
          'Establishing a secure connection',
          o.jsx('span', { className: 'loading-ellipsis', children: '...' }),
        ],
      }),
    ],
  });
}
function gT({ message: l, retry: u }) {
  return o.jsxs('main', {
    className: 'loading-screen',
    children: [
      o.jsx(Si, {}),
      o.jsxs('div', {
        className: 'error-dialog',
        role: 'alert',
        children: [
          o.jsx('span', {
            className: 'alert-icon alert-icon--red',
            children: o.jsx(bi, { size: 20 }),
          }),
          o.jsx('p', { className: 'eyebrow eyebrow--red', children: 'CONNECTION INTERRUPTED' }),
          o.jsx('h1', { children: 'Can’t reach DockPilot.' }),
          o.jsx('p', { className: 'body-muted', children: l }),
          o.jsxs('p', {
            className: 'help-copy',
            children: [
              o.jsx(jf, { size: 14 }),
              ' Make sure the API and PostgreSQL are running. See',
              ' ',
              o.jsx('code', { children: 'README.md' }),
              '.',
            ],
          }),
          o.jsxs('button', {
            className: 'button button--primary button--full',
            onClick: u,
            children: ['Retry connection ', o.jsx(kf, { size: 15 })],
          }),
        ],
      }),
      o.jsxs('footer', {
        className: 'loading-footer',
        children: ['DOCKPILOT ', o.jsx('span', { children: '·' }), ' SELF-HOSTED DOCKER CONTROL'],
      }),
    ],
  });
}
function bT({
  initialMode: l,
  onAuthenticated: u,
  setGlobalError: r,
  globalError: s,
  serverStatus: f,
  initialize: h,
}) {
  const m = l,
    [v, b] = $.useState(!1),
    [S, _] = $.useState(!1),
    [g, A] = $.useState(''),
    [w, U] = $.useState(''),
    [V, B] = $.useState(''),
    [k, ae] = $.useState('');
  async function q(pe) {
    if ((pe.preventDefault(), !v)) {
      (b(!0), r(null));
      try {
        const fe =
          m === 'setup'
            ? await WE({ email: g, password: w, name: V, organizationName: k })
            : await eT({ email: g, password: w });
        (U(''), u(fe));
      } catch (fe) {
        r(
          fe instanceof Pn
            ? fe.message
            : 'The request could not be completed. Check that the API is running.',
        );
      } finally {
        b(!1);
      }
    }
  }
  return o.jsxs('main', {
    className: 'auth-screen',
    children: [
      o.jsxs('div', {
        className: 'auth-left',
        children: [
          o.jsxs('header', {
            className: 'auth-header',
            children: [
              o.jsx(Si, {}),
              o.jsx('span', { className: 'header-caption', children: 'INFRASTRUCTURE, IN FOCUS' }),
            ],
          }),
          o.jsxs('div', {
            className: 'hero-copy',
            children: [
              o.jsxs('p', {
                className: 'eyebrow',
                children: [
                  o.jsx('span', { className: 'eyebrow-line' }),
                  'YOUR INFRASTRUCTURE, DECODED',
                ],
              }),
              o.jsxs('h1', {
                children: [
                  'Stop guessing.',
                  o.jsx('br', {}),
                  o.jsx('span', { children: 'Start knowing.' }),
                ],
              }),
              o.jsx('p', {
                className: 'hero-description',
                children:
                  'One clear view of every container, host and issue. Operate your Docker infrastructure with confidence.',
              }),
              o.jsxs('div', {
                className: 'feature-stack',
                children: [
                  o.jsx(zf, {
                    icon: pi,
                    title: 'Know what’s happening',
                    detail: 'Every host. Every container. One clear picture.',
                  }),
                  o.jsx(zf, {
                    icon: Dl,
                    title: 'Catch trouble early',
                    detail: 'Security, reliability and health at a glance.',
                  }),
                  o.jsx(zf, {
                    icon: Cn,
                    title: 'Act with confidence',
                    detail: 'See what will change before it happens.',
                  }),
                ],
              }),
            ],
          }),
          o.jsxs('footer', {
            className: 'auth-left-footer',
            children: [
              o.jsx('span', { children: 'DOCKER, WITHOUT THE GUESSING.' }),
              o.jsx('span', { children: 'BUILT TO SELF-HOST. OPEN SOURCE BY DESIGN.' }),
            ],
          }),
        ],
      }),
      o.jsxs('div', {
        className: 'auth-right',
        children: [
          o.jsx('span', { className: 'auth-corner auth-corner--top' }),
          o.jsx('span', { className: 'auth-corner auth-corner--bottom' }),
          o.jsxs('div', {
            className: 'auth-card-wrap',
            children: [
              o.jsx('div', { className: 'auth-mobile-brand', children: o.jsx(Si, {}) }),
              o.jsxs('div', {
                className: 'auth-card-top',
                children: [
                  o.jsx('p', {
                    className: 'eyebrow eyebrow--muted',
                    children: m === 'setup' ? 'YOUR PRIVATE INFRASTRUCTURE' : 'WELCOME BACK',
                  }),
                  o.jsx('div', {
                    className: 'auth-api-indicator',
                    children: o.jsx(k0, { status: f }),
                  }),
                ],
              }),
              o.jsxs('div', {
                className: 'auth-card-heading',
                children: [
                  o.jsx('h2', {
                    children: m === 'setup' ? 'Make yourself at home.' : 'Good to have you back.',
                  }),
                  o.jsx('p', {
                    children:
                      m === 'setup'
                        ? 'Create your owner account to get started. Your instance is yours, and yours alone.'
                        : 'Sign in to see what’s happening across your infrastructure.',
                  }),
                ],
              }),
              m === 'setup' &&
                o.jsxs('div', {
                  className: 'secure-callout',
                  children: [
                    o.jsx('span', { className: 'secure-icon', children: o.jsx(i_, { size: 16 }) }),
                    o.jsxs('p', {
                      children: [
                        o.jsx('strong', { children: 'Your account, your control.' }),
                        o.jsx('br', {}),
                        'Your password is never shared with Docker hosts.',
                      ],
                    }),
                    o.jsx('span', { className: 'owner-badge', children: 'OWNER ONLY' }),
                  ],
                }),
              s &&
                o.jsxs('div', {
                  className: 'form-error',
                  role: 'alert',
                  children: [o.jsx(bi, { size: 15 }), o.jsx('span', { children: s })],
                }),
              o.jsxs('form', {
                className: 'auth-form',
                onSubmit: (pe) => {
                  q(pe);
                },
                noValidate: !0,
                children: [
                  m === 'setup' &&
                    o.jsxs(o.Fragment, {
                      children: [
                        o.jsx(Nf, {
                          id: 'full-name',
                          label: 'YOUR NAME',
                          value: V,
                          setValue: B,
                          placeholder: 'e.g. Alex Morgan',
                          autoComplete: 'name',
                          maxLength: 80,
                          required: !0,
                        }),
                        o.jsx(Nf, {
                          id: 'organization-name',
                          label: 'ORGANIZATION',
                          value: k,
                          setValue: ae,
                          placeholder: 'e.g. Homelab',
                          autoComplete: 'organization',
                          maxLength: 100,
                          required: !0,
                        }),
                      ],
                    }),
                  o.jsx(Nf, {
                    id: 'email',
                    label: 'EMAIL ADDRESS',
                    type: 'email',
                    value: g,
                    setValue: A,
                    placeholder: 'you@example.com',
                    autoComplete: 'email',
                    maxLength: 254,
                    required: !0,
                  }),
                  o.jsxs('div', {
                    className: 'form-field',
                    children: [
                      o.jsxs('div', {
                        className: 'field-label-row',
                        children: [
                          o.jsx('label', {
                            htmlFor: 'password',
                            children: m === 'setup' ? 'CREATE PASSWORD' : 'PASSWORD',
                          }),
                          m === 'setup' &&
                            o.jsx('span', {
                              className: 'field-hint',
                              children: '12 CHARACTERS MINIMUM',
                            }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'password-input-wrap',
                        children: [
                          o.jsx('input', {
                            id: 'password',
                            name: 'password',
                            autoComplete: m === 'setup' ? 'new-password' : 'current-password',
                            type: S ? 'text' : 'password',
                            required: !0,
                            minLength: m === 'setup' ? 12 : 1,
                            maxLength: 128,
                            value: w,
                            onChange: (pe) => {
                              U(pe.target.value);
                            },
                            placeholder:
                              m === 'setup' ? 'At least 12 characters' : 'Enter your password',
                            'aria-label': 'Password',
                          }),
                          o.jsx('button', {
                            className: 'password-visibility',
                            type: 'button',
                            onClick: () => {
                              _(!S);
                            },
                            'aria-label': S ? 'Hide password' : 'Show password',
                            children: S ? o.jsx(a_, { size: 16 }) : o.jsx(u_, { size: 16 }),
                          }),
                        ],
                      }),
                      m === 'setup' &&
                        o.jsxs('span', {
                          className: 'field-footnote',
                          children: [
                            o.jsx(Dl, { size: 13 }),
                            ' Encrypted and stored on your own server.',
                          ],
                        }),
                    ],
                  }),
                  o.jsx('button', {
                    className: 'button button--primary button--submit',
                    type: 'submit',
                    disabled: v || (m === 'setup' && w.length < 12),
                    children: v
                      ? o.jsxs(o.Fragment, {
                          children: [
                            o.jsx('span', { className: 'button-spinner' }),
                            m === 'setup' ? 'Securing your account...' : 'Signing in...',
                          ],
                        })
                      : o.jsxs(o.Fragment, {
                          children: [
                            m === 'setup' ? 'Create owner account' : 'Sign in',
                            ' ',
                            o.jsx(kf, { size: 16 }),
                          ],
                        }),
                  }),
                ],
              }),
              m === 'login' &&
                o.jsx('p', {
                  className: 'forgot-copy',
                  children:
                    'Forgot your password? Password recovery is not available in this milestone. Contact your instance administrator.',
                }),
              o.jsxs('div', {
                className: 'auth-divider',
                children: [
                  o.jsx('span', {}),
                  m === 'setup' ? 'ONE SECURE SETUP' : 'PRIVATE BY DESIGN',
                  o.jsx('span', {}),
                ],
              }),
              o.jsxs('p', {
                className: 'auth-terms',
                children: [
                  'By continuing, you agree to operate your Docker infrastructure responsibly.',
                  ' ',
                  o.jsx(Tf, { size: 12 }),
                  ' No data leaves your server.',
                ],
              }),
              m === 'login' &&
                o.jsx('button', {
                  className: 'text-button',
                  onClick: () => {
                    h();
                  },
                  type: 'button',
                  children: 'Refresh setup status',
                }),
            ],
          }),
          o.jsxs('footer', {
            className: 'auth-right-footer',
            children: [
              o.jsxs('span', {
                children: [
                  o.jsx('span', { className: 'footer-status-dot' }),
                  ' SELF-HOSTED & PRIVATE',
                ],
              }),
              o.jsxs('span', {
                children: [
                  o.jsx(n_, { size: 12 }),
                  ' DOCKPILOT',
                  o.jsx('span', { className: 'brand-dot', children: '.' }),
                  ' ',
                  o.jsx('span', { className: 'version-chip', children: '0.1.0' }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function zf({ icon: l, title: u, detail: r }) {
  return o.jsxs('div', {
    className: 'feature-line',
    children: [
      o.jsx('span', {
        className: 'feature-icon',
        children: o.jsx(l, { size: 17, strokeWidth: 1.8 }),
      }),
      o.jsxs('span', {
        className: 'feature-text',
        children: [o.jsx('strong', { children: u }), o.jsx('span', { children: r })],
      }),
      o.jsx(Lf, { className: 'feature-check', size: 15 }),
    ],
  });
}
function Nf({
  id: l,
  label: u,
  value: r,
  setValue: s,
  placeholder: f,
  type: h = 'text',
  autoComplete: m,
  maxLength: v,
  required: b = !1,
}) {
  return o.jsxs('div', {
    className: 'form-field',
    children: [
      o.jsx('label', { htmlFor: l, children: u }),
      o.jsx('input', {
        id: l,
        name: l,
        type: h,
        autoComplete: m,
        maxLength: v,
        required: b,
        value: r,
        onChange: (S) => {
          s(S.target.value);
        },
        placeholder: f,
      }),
    ],
  });
}
function _T({ user: l, serverStatus: u, onLogout: r, globalError: s, clearGlobalError: f }) {
  const [h, m] = $.useState(!1),
    [v, b] = $.useState('overview'),
    S = H0(l);
  async function _() {
    (m(!0), await r(), m(!1));
  }
  return o.jsxs('div', {
    className: 'console-shell',
    children: [
      o.jsxs('aside', {
        className: 'sidebar',
        children: [
          o.jsxs('header', {
            className: 'sidebar-brand',
            children: [
              o.jsx(Si, { small: !0 }),
              o.jsxs('button', {
                className: 'host-selector',
                'aria-label': 'Host selector: all hosts',
                children: [
                  o.jsx('span', {
                    className: 'host-selector-icon',
                    children: o.jsx(Wc, { size: 15 }),
                  }),
                  o.jsxs('span', {
                    className: 'host-selector-copy',
                    children: [
                      o.jsx('span', { children: 'INFRASTRUCTURE' }),
                      o.jsx('strong', { children: 'All hosts' }),
                    ],
                  }),
                  o.jsx(e_, { size: 14, className: 'host-chevron' }),
                ],
              }),
            ],
          }),
          o.jsxs('nav', {
            className: 'sidebar-nav',
            'aria-label': 'Main navigation',
            children: [
              o.jsx('span', { className: 'nav-section-label', children: 'WORKSPACE' }),
              o.jsx(ir, {
                icon: Cn,
                title: 'Overview',
                active: v === 'overview',
                onSelect: () => {
                  b('overview');
                },
              }),
              o.jsx('span', {
                className: 'nav-section-label nav-section-label--spaced',
                children: 'RESOURCES',
              }),
              o.jsx(Al, { icon: Wc, title: 'Hosts' }),
              o.jsx(Al, { icon: mf, title: 'Containers' }),
              o.jsx(Al, { icon: Wb, title: 'Images' }),
              o.jsx(Al, { icon: l_, title: 'Volumes' }),
              o.jsx(Al, { icon: c_, title: 'Networks' }),
              o.jsx('div', { className: 'sidebar-nav-divider' }),
              o.jsx('span', {
                className: 'nav-section-label nav-section-label--spaced',
                children: 'INTELLIGENCE',
              }),
              o.jsx(Al, { icon: r_, title: 'Docker Doctor', badge: 'SOON' }),
              o.jsx(Al, { icon: Dl, title: 'Backups', badge: 'SOON' }),
              o.jsx(Al, { icon: Cn, title: 'Alerts' }),
              S &&
                o.jsxs(o.Fragment, {
                  children: [
                    o.jsx('div', { className: 'sidebar-nav-divider' }),
                    o.jsx('span', {
                      className: 'nav-section-label nav-section-label--spaced',
                      children: 'AI CONTROL',
                    }),
                    o.jsx(ir, {
                      icon: Ef,
                      title: 'AI credentials',
                      active: v === 'ai-credentials',
                      onSelect: () => {
                        b('ai-credentials');
                      },
                    }),
                    o.jsx(ir, {
                      icon: Cn,
                      title: 'AI activity',
                      active: v === 'audit-log',
                      onSelect: () => {
                        b('audit-log');
                      },
                    }),
                    o.jsx(ir, {
                      icon: iu,
                      title: 'Approvals',
                      active: v === 'approvals',
                      onSelect: () => {
                        b('approvals');
                      },
                    }),
                  ],
                }),
            ],
          }),
          o.jsxs('div', {
            className: 'sidebar-bottom',
            children: [
              o.jsxs('div', {
                className: 'agent-empty',
                children: [
                  o.jsx('span', {
                    className: 'agent-empty-icon',
                    children: o.jsx(Yv, { size: 15 }),
                  }),
                  o.jsxs('span', {
                    children: [
                      o.jsx('strong', { children: 'No agents online' }),
                      o.jsx('span', { children: 'Connect a host to get started' }),
                    ],
                  }),
                  o.jsx('span', { className: 'agent-connector-dot' }),
                ],
              }),
              o.jsxs('button', {
                className: 'sidebar-user',
                onClick: () => {
                  _();
                },
                disabled: h,
                'aria-label': `Sign out ${l.name}`,
                children: [
                  o.jsx('span', {
                    className: 'avatar',
                    children: l.name.trim().charAt(0).toUpperCase(),
                  }),
                  o.jsxs('span', {
                    className: 'sidebar-user-info',
                    children: [
                      o.jsx('strong', { children: l.name }),
                      o.jsx('span', { children: l.email }),
                    ],
                  }),
                  o.jsx(qv, { size: 15, className: 'logout-icon' }),
                ],
              }),
            ],
          }),
        ],
      }),
      o.jsxs('main', {
        className: 'main-panel',
        id: 'overview',
        children: [
          o.jsxs('header', {
            className: 'topbar',
            children: [
              o.jsxs('div', {
                className: 'breadcrumb',
                children: [
                  o.jsx('span', { children: 'Workspace' }),
                  o.jsx('span', { className: 'breadcrumb-slash', children: '/' }),
                  o.jsx('strong', { children: ST(v) }),
                ],
              }),
              o.jsxs('div', {
                className: 'topbar-right',
                children: [
                  o.jsx(k0, { status: u }),
                  o.jsx('span', { className: 'topbar-divider' }),
                  o.jsxs('span', {
                    className: 'role-chip',
                    children: [o.jsx(Tf, { size: 12 }), ' ', l.role.toUpperCase()],
                  }),
                  o.jsx('button', {
                    className: 'icon-button user-menu-button',
                    onClick: () => {
                      _();
                    },
                    disabled: h,
                    title: 'Sign out',
                    children: o.jsx(qv, { size: 15 }),
                  }),
                ],
              }),
            ],
          }),
          o.jsxs('div', {
            className: 'dashboard-content',
            children: [
              s &&
                o.jsxs('button', {
                  className: 'console-error-banner',
                  onClick: f,
                  role: 'alert',
                  children: [
                    o.jsx(bi, { size: 15 }),
                    ' ',
                    s,
                    ' ',
                    o.jsx('span', { children: '×' }),
                  ],
                }),
              v === 'overview'
                ? o.jsxs(o.Fragment, {
                    children: [
                      o.jsxs('section', {
                        className: 'page-heading',
                        children: [
                          o.jsxs('div', {
                            children: [
                              o.jsxs('div', {
                                className: 'date-label',
                                children: [
                                  o.jsx('span', { className: 'live-dot' }),
                                  ' YOUR INFRASTRUCTURE',
                                  ' ',
                                  o.jsx('span', { className: 'date-separator', children: '/' }),
                                  ' ',
                                  o.jsx('span', {
                                    className: 'date-local',
                                    children: new Date()
                                      .toLocaleDateString(void 0, {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                      })
                                      .toUpperCase(),
                                  }),
                                ],
                              }),
                              o.jsxs('h1', {
                                children: [
                                  'Good ',
                                  zT(),
                                  ', ',
                                  l.name.split(' ')[0],
                                  o.jsx('span', { className: 'heading-period', children: '.' }),
                                ],
                              }),
                              o.jsx('p', { children: 'Here’s the view from your command center.' }),
                            ],
                          }),
                          o.jsxs('button', {
                            className: 'button button--outline',
                            onClick: () => {
                              window.location.reload();
                            },
                            children: [o.jsx(Cn, { size: 14 }), ' Refresh overview'],
                          }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'stats-grid',
                        children: [
                          o.jsx(cr, {
                            icon: Wc,
                            label: 'CONNECTED HOSTS',
                            value: '—',
                            sub: 'Connect an agent to begin',
                            accent: 'blue',
                          }),
                          o.jsx(cr, {
                            icon: mf,
                            label: 'RUNNING CONTAINERS',
                            value: '—',
                            sub: 'No container data yet',
                            accent: 'green',
                          }),
                          o.jsx(cr, {
                            icon: bi,
                            label: 'NEEDS ATTENTION',
                            value: '—',
                            sub: 'Awaiting host connection',
                            accent: 'amber',
                          }),
                          o.jsx(cr, {
                            icon: Dl,
                            label: 'SECURITY SCORE',
                            value: '—',
                            sub: 'Docker Doctor · awaiting data',
                            accent: 'purple',
                          }),
                        ],
                      }),
                      o.jsxs('section', {
                        className: 'connect-card',
                        children: [
                          o.jsxs('div', {
                            className: 'connect-card-left',
                            children: [
                              o.jsxs('div', {
                                className: 'connect-label',
                                children: [
                                  o.jsx('span', {
                                    className: 'terminal-green',
                                    children: o.jsx(jf, { size: 13 }),
                                  }),
                                  'GETTING STARTED',
                                  o.jsx('span', { className: 'connect-underscore', children: '_' }),
                                ],
                              }),
                              o.jsx('h2', { children: 'Nothing to see. Yet.' }),
                              o.jsx('p', {
                                children:
                                  'DockPilot is connected and ready. Add an agent to a Docker host to bring your infrastructure into focus. Real container and server data will show up here as soon as a host checks in.',
                              }),
                              o.jsxs('button', {
                                className: 'button button--connect',
                                disabled: !0,
                                title: 'Agent enrollment is being built in milestone 2',
                                children: ['Connect a Docker host ', o.jsx(kf, { size: 15 })],
                              }),
                              o.jsxs('span', {
                                className: 'connect-preflight',
                                children: [
                                  o.jsx(Tf, { size: 12 }),
                                  ' Host credentials stay on your own server.',
                                ],
                              }),
                            ],
                          }),
                          o.jsxs('div', {
                            className: 'connect-art',
                            'aria-hidden': 'true',
                            children: [
                              o.jsx('div', { className: 'orbit orbit--outer' }),
                              o.jsx('div', { className: 'orbit orbit--inner' }),
                              o.jsx('div', {
                                className: 'orbit-center',
                                children: o.jsx(Ay, { size: 31, strokeWidth: 1.5 }),
                              }),
                              o.jsx('span', {
                                className: 'orbit-terminal',
                                children: o.jsx(jf, { size: 12 }),
                              }),
                              o.jsx('span', {
                                className: 'orbit-container',
                                children: o.jsx(mf, { size: 12 }),
                              }),
                              o.jsx('span', {
                                className: 'orbit-shield',
                                children: o.jsx(Dl, { size: 12 }),
                              }),
                              o.jsx('span', {
                                className: 'orbit-server',
                                children: o.jsx(Wc, { size: 12 }),
                              }),
                              o.jsx('span', { className: 'orbit-satellite' }),
                            ],
                          }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'lower-grid',
                        children: [
                          o.jsxs('section', {
                            className: 'panel panel--activity',
                            children: [
                              o.jsxs('div', {
                                className: 'panel-header',
                                children: [
                                  o.jsxs('div', {
                                    children: [
                                      o.jsx('p', {
                                        className: 'panel-eyebrow',
                                        children: 'WHAT’S HAPPENING',
                                      }),
                                      o.jsx('h3', { children: 'Recent activity' }),
                                    ],
                                  }),
                                  o.jsx('span', {
                                    className: 'panel-icon',
                                    children: o.jsx(Cn, { size: 16 }),
                                  }),
                                ],
                              }),
                              o.jsxs('div', {
                                className: 'quiet-empty',
                                children: [
                                  o.jsx('span', {
                                    className: 'quiet-empty-icon',
                                    children: o.jsx(Cn, { size: 17 }),
                                  }),
                                  o.jsxs('span', {
                                    children: [
                                      o.jsx('strong', { children: 'The log is quiet.' }),
                                      o.jsx('span', {
                                        children: 'Host and container events will appear here.',
                                      }),
                                    ],
                                  }),
                                  o.jsx('span', { className: 'empty-line' }),
                                ],
                              }),
                            ],
                          }),
                          o.jsxs('section', {
                            className: 'panel panel--health',
                            children: [
                              o.jsxs('div', {
                                className: 'panel-header',
                                children: [
                                  o.jsxs('div', {
                                    children: [
                                      o.jsx('p', {
                                        className: 'panel-eyebrow',
                                        children: 'SYSTEM STATUS',
                                      }),
                                      o.jsx('h3', { children: 'System health' }),
                                    ],
                                  }),
                                  o.jsx('span', {
                                    className: 'panel-icon panel-icon--green',
                                    children: o.jsx(Dl, { size: 16 }),
                                  }),
                                ],
                              }),
                              o.jsxs('div', {
                                className: 'health-row',
                                children: [
                                  o.jsx('span', {
                                    className: 'health-indicator health-indicator--green',
                                  }),
                                  o.jsx('span', {
                                    className: 'health-row-label',
                                    children: 'DockPilot API',
                                  }),
                                  o.jsx('span', {
                                    className: `health-status health-status--${u}`,
                                    children:
                                      u === 'online'
                                        ? 'Connected'
                                        : u === 'offline'
                                          ? 'Disconnected'
                                          : 'Checking',
                                  }),
                                  o.jsx(Lf, {
                                    size: 14,
                                    className: `health-check ${u !== 'online' ? 'health-check--hidden' : ''}`,
                                  }),
                                ],
                              }),
                              o.jsxs('div', {
                                className: 'health-row',
                                children: [
                                  o.jsx('span', {
                                    className: 'health-indicator health-indicator--blue',
                                  }),
                                  o.jsx('span', {
                                    className: 'health-row-label',
                                    children: 'Authentication',
                                  }),
                                  o.jsx('span', {
                                    className: 'health-status health-status--green',
                                    children: 'Secured',
                                  }),
                                  o.jsx(pi, { size: 15, className: 'health-check' }),
                                ],
                              }),
                              o.jsxs('div', {
                                className: 'health-row',
                                children: [
                                  o.jsx('span', {
                                    className: 'health-indicator health-indicator--amber',
                                  }),
                                  o.jsx('span', {
                                    className: 'health-row-label',
                                    children: 'Host agents',
                                  }),
                                  o.jsx('span', {
                                    className: 'health-status health-status--muted',
                                    children: 'Not connected',
                                  }),
                                  o.jsx(Yv, {
                                    size: 14,
                                    className: 'health-check health-check--muted',
                                  }),
                                ],
                              }),
                              o.jsxs('div', {
                                className: 'health-footer',
                                children: [
                                  o.jsx(Dl, { size: 13 }),
                                  ' Your account and session are protected.',
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      o.jsxs('footer', {
                        className: 'dashboard-footer',
                        children: [
                          o.jsxs('span', {
                            children: [
                              'DOCKPILOT',
                              o.jsx('span', { className: 'brand-dot', children: '.' }),
                              ' ',
                              o.jsx('span', {
                                className: 'dashboard-footer-light',
                                children: 'DOCKER, WITHOUT THE GUESSING.',
                              }),
                            ],
                          }),
                          o.jsxs('span', {
                            children: [
                              o.jsx('span', { className: 'live-dot' }),
                              ' API',
                              ' ',
                              u === 'online'
                                ? 'CONNECTED'
                                : u === 'offline'
                                  ? 'OFFLINE'
                                  : 'CONNECTING',
                              ' ',
                              o.jsx('span', { className: 'date-separator', children: '/' }),
                              ' DEVELOPMENT PREVIEW',
                            ],
                          }),
                        ],
                      }),
                    ],
                  })
                : o.jsx(cT, { section: v, user: l }),
            ],
          }),
        ],
      }),
    ],
  });
}
function ST(l) {
  return l === 'ai-credentials'
    ? 'AI credentials'
    : l === 'audit-log'
      ? 'AI activity'
      : l === 'approvals'
        ? 'Approvals'
        : 'Overview';
}
function ir({ icon: l, title: u, active: r, onSelect: s }) {
  return o.jsxs('button', {
    type: 'button',
    className: `nav-item nav-item--button${r ? ' nav-item--active' : ''}`,
    'aria-current': r ? 'page' : void 0,
    onClick: s,
    children: [o.jsx('span', { className: 'nav-icon', children: o.jsx(l, { size: 17 }) }), u],
  });
}
function zT() {
  const l = new Date().getHours();
  return l < 12 ? 'morning' : l < 18 ? 'afternoon' : 'evening';
}
function cr({ icon: l, label: u, value: r, sub: s, accent: f }) {
  return o.jsxs('article', {
    className: `stat-card stat-card--${f}`,
    children: [
      o.jsxs('div', {
        className: 'stat-card-top',
        children: [
          o.jsx('span', { className: 'stat-icon', children: o.jsx(l, { size: 16 }) }),
          o.jsx('span', { className: 'stat-arrow', children: '↗' }),
        ],
      }),
      o.jsx('span', { className: 'stat-label', children: u }),
      o.jsx('strong', { className: 'stat-value', children: r }),
      o.jsx('span', { className: 'stat-sub', children: s }),
    ],
  });
}
function Al({ icon: l, title: u, badge: r }) {
  return o.jsxs('a', {
    className: 'nav-item nav-item--disabled',
    href: '#overview',
    'aria-disabled': 'true',
    onClick: (s) => {
      s.preventDefault();
    },
    children: [
      o.jsx('span', { className: 'nav-icon', children: o.jsx(l, { size: 17 }) }),
      u,
      r && o.jsx('span', { className: 'nav-soon', children: r }),
    ],
  });
}
const L0 = document.getElementById('root');
if (!L0) throw new Error('DockPilot root element #root is missing.');
$b.createRoot(L0).render(o.jsx(Lb.StrictMode, { children: o.jsx(vT, {}) }));
