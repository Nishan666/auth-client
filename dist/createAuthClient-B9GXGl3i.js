import e from "axios";
//#region src/core/constants.js
var t = {
	TOKENS: "auth_tokens",
	USER: "auth_user"
}, n = {
	SIGN_UP: "/auth/signup",
	SIGN_IN: "/auth/signin",
	VERIFY_OTP: "/auth/verify-otp",
	RESEND_OTP: "/auth/resend-otp",
	FORGOT_PASSWORD: "/auth/forgot-password",
	VERIFY_RESET_OTP: "/auth/verify-reset-otp",
	RESET_PASSWORD: "/auth/reset-password",
	CHANGE_PASSWORD: "/auth/change-password",
	DELETE_ACCOUNT: "/auth/delete-account",
	REFRESH: "/auth/refresh",
	LOGOUT: "/auth/logout"
}, r = {
	EMAIL: "email",
	PHONE: "phone"
}, i = {
	AUTH: "auth",
	PASSWORD_RESET: "password-reset"
}, a = 6, o = "auth", s = {
	TOKEN_REFRESHED: "token_refreshed",
	LOGOUT: "logout",
	LOGIN: "login",
	NEED_REFRESH: "need_refresh"
}, c = {
	TOKEN_REFRESHED: "token_refreshed_at",
	LOGOUT: "logout",
	LOGIN: "login_at"
}, l = 30;
//#endregion
//#region src/core/httpClient.js
function u(e = "") {
	return !!(e.includes(n.REFRESH) || e.includes("X-Amz-Signature") || e.includes("X-Amz-Algorithm"));
}
function d({ baseURL: t, tokenStore: n, tokenManager: r, headers: i }) {
	let a = e.create({
		baseURL: t,
		headers: i
	});
	return a.interceptors.request.use(async (e) => {
		if (u(e.url ?? "")) return e;
		let t = await r.getValidToken() ?? n.getIdToken();
		return t && (e.headers = e.headers ?? {}, e.headers.Authorization = `Bearer ${t}`), e;
	}), a.interceptors.response.use((e) => e, async (e) => {
		let t = e.config, n = e.response?.status === 401, i = t?._retry === !0, o = u(t?.url ?? "");
		if (!t || !n || i || o) return Promise.reject(e);
		t._retry = !0;
		try {
			let e = await r.refresh(!0);
			return t.headers = t.headers ?? {}, t.headers.Authorization = `Bearer ${e}`, a(t);
		} catch {
			return Promise.reject(e);
		}
	}), a;
}
//#endregion
//#region src/core/storage.js
function f() {
	let e = /* @__PURE__ */ new Map();
	return {
		getItem: (t) => e.has(t) ? e.get(t) : null,
		setItem: (t, n) => e.set(t, n),
		removeItem: (t) => e.delete(t)
	};
}
function p(e) {
	if (e) return e;
	if (typeof window < "u" && window.localStorage) try {
		let e = "__auth_client_probe__";
		return window.localStorage.setItem(e, "1"), window.localStorage.removeItem(e), window.localStorage;
	} catch {
		return f();
	}
	return f();
}
function m(e) {
	if (!e || typeof e != "object") return null;
	let { id_token: t, idToken: n, access_token: r, accessToken: i, refresh_token: a, refreshToken: o, data: s, ...c } = e.data && typeof e.data == "object" ? {
		...e.data,
		...e
	} : e, l = { ...c }, u = t ?? n, d = r ?? i, f = a ?? o;
	return u !== void 0 && (l.id_token = u), d !== void 0 && (l.access_token = d), f !== void 0 && (l.refresh_token = f), l;
}
function h(e) {
	return e ? {
		idToken: e.id_token ?? null,
		accessToken: e.access_token ?? null,
		refreshToken: e.refresh_token ?? null
	} : {
		idToken: null,
		accessToken: null,
		refreshToken: null
	};
}
function g({ storage: e, keys: n } = {}) {
	let r = {
		...t,
		...n
	}, i = p(e);
	function a(e) {
		try {
			let t = i.getItem(e);
			return t ? JSON.parse(t) : null;
		} catch {
			return null;
		}
	}
	function o(e, t) {
		try {
			i.setItem(e, JSON.stringify(t));
		} catch {}
	}
	return {
		saveTokens(e) {
			let t = m(e);
			if (!t) return null;
			let n = {
				...a(r.TOKENS) || {},
				...t
			};
			return o(r.TOKENS, n), n;
		},
		getTokens() {
			return a(r.TOKENS);
		},
		getIdToken() {
			return a(r.TOKENS)?.id_token ?? null;
		},
		getAccessToken() {
			return a(r.TOKENS)?.access_token ?? null;
		},
		getRefreshToken() {
			return a(r.TOKENS)?.refresh_token ?? null;
		},
		saveUser(e) {
			o(r.USER, e);
		},
		getUser() {
			return a(r.USER);
		},
		clear() {
			Object.values(r).forEach((e) => {
				try {
					i.removeItem(e);
				} catch {}
			});
		},
		isAuthenticated() {
			return !!a(r.TOKENS)?.id_token;
		}
	};
}
//#endregion
//#region src/core/jwt.js
function _(e) {
	let t = e.replace(/-/g, "+").replace(/_/g, "/"), n = t.padEnd(t.length + (4 - t.length % 4) % 4, "="), r = typeof atob == "function" ? atob(n) : globalThis.Buffer.from(n, "base64").toString("binary"), i = Array.from(r, (e) => `%${e.charCodeAt(0).toString(16).padStart(2, "0")}`).join("");
	return JSON.parse(decodeURIComponent(i));
}
function v(e) {
	try {
		let [, t] = String(e).split(".");
		return t ? _(t) : null;
	} catch {
		return null;
	}
}
function y(e) {
	let t = v(e)?.exp;
	return typeof t == "number" ? t - Math.floor(Date.now() / 1e3) : Infinity;
}
function b(e, t = 30) {
	return !e || y(e) <= t;
}
//#endregion
//#region src/core/tokenManager.js
function x({ tokenStore: e, requestRefresh: t, broadcaster: n, onRefreshed: r, onForceLogout: i, expirySkewSeconds: a = 30 }) {
	let o = !1, c = [];
	function l(e, t = null) {
		let n = c;
		c = [], n.forEach(({ resolve: n, reject: r }) => e ? r(e) : n(t));
	}
	async function u(u = !1) {
		if (o) return new Promise((e, t) => c.push({
			resolve: e,
			reject: t
		}));
		o = !0;
		try {
			let i = e.getRefreshToken();
			if (!i) throw Error("No refresh token available");
			let c = e.getIdToken();
			if (!u && c && !b(c, a)) return o = !1, l(null, c), c;
			let d = await t({
				refreshToken: i,
				refresh_token: i
			});
			if (d.error) throw Error(d.message || "Token refresh failed");
			let f = e.saveTokens(d.data?.tokens ?? d.data), p = f?.id_token;
			if (!p) throw Error("Refresh response contained no id_token");
			return n?.post(s.TOKEN_REFRESHED, { tokens: f }), r?.(f), o = !1, l(null, p), p;
		} catch (t) {
			throw o = !1, l(t), b(e.getIdToken(), 0) && (n?.post(s.LOGOUT), i?.()), t;
		}
	}
	return {
		async getValidToken() {
			let t = e.getIdToken();
			if (!t) return null;
			if (!b(t, a)) return t;
			try {
				return await u(!0);
			} catch {
				return null;
			}
		},
		refresh: u,
		expiresIn() {
			let t = e.getIdToken();
			return t ? y(t) : 0;
		},
		get isRefreshing() {
			return o;
		}
	};
}
//#endregion
//#region src/core/broadcast.js
function S({ channelName: e = o, enabled: t = !0 } = {}) {
	let n = /* @__PURE__ */ new Set(), r = null, i = !1;
	function a(e) {
		n.forEach((t) => t(e));
	}
	let l = {
		[c.TOKEN_REFRESHED]: s.TOKEN_REFRESHED,
		[c.LOGOUT]: s.LOGOUT,
		[c.LOGIN]: s.LOGIN
	};
	function u(e) {
		e.data?.type && a(e.data);
	}
	function d(e) {
		if (!e.key || e.newValue === null) return;
		let t = l[e.key];
		t && a({
			type: t,
			viaFallback: !0
		});
	}
	function f() {
		if (t) {
			if (!r && typeof BroadcastChannel < "u") try {
				r = new BroadcastChannel(e), r.addEventListener("message", u);
			} catch {
				r = null;
			}
			!i && typeof window < "u" && (window.addEventListener("storage", d), i = !0);
		}
	}
	function p() {
		if (r) {
			try {
				r.removeEventListener("message", u), r.close();
			} catch {}
			r = null;
		}
		i && typeof window < "u" && (window.removeEventListener("storage", d), i = !1);
	}
	function m(e) {
		if (typeof window > "u" || !window.localStorage) return;
		let t = Object.keys(l).find((t) => l[t] === e);
		if (t) try {
			window.localStorage.setItem(t, String(Date.now()));
		} catch {}
	}
	return f(), {
		open: f,
		close: p,
		post(e, t) {
			try {
				r?.postMessage({
					type: e,
					...t
				});
			} catch {}
			m(e);
		},
		subscribe(e) {
			return n.add(e), () => n.delete(e);
		},
		destroy() {
			p(), n.clear();
		}
	};
}
//#endregion
//#region src/core/handleErrorResponse.js
function C(e) {
	if (e.response) {
		let t = e.response.data;
		return {
			error: !0,
			message: t?.message || t?.error || `Request failed with status ${e.response.status}`,
			status: e.response.status,
			code: t?.code
		};
	}
	return e.request ? {
		error: !0,
		message: "Could not reach the server. Check your connection and try again.",
		code: "NETWORK_ERROR"
	} : {
		error: !0,
		message: e.message || "Something went wrong",
		code: "UNKNOWN"
	};
}
//#endregion
//#region src/core/backends/httpBackend.js
function w(e, { endpoints: t } = {}) {
	let r = {
		...n,
		...t
	};
	async function i(t, n) {
		try {
			let { data: r } = await e.post(t, n);
			return {
				error: !1,
				data: r
			};
		} catch (e) {
			return C(e);
		}
	}
	return {
		signUp: (e) => i(r.SIGN_UP, e),
		signIn: (e) => i(r.SIGN_IN, e),
		verifyOtp: (e) => i(r.VERIFY_OTP, e),
		resendOtp: (e) => i(r.RESEND_OTP, e),
		forgotPassword: (e) => i(r.FORGOT_PASSWORD, e),
		verifyResetOtp: (e) => i(r.VERIFY_RESET_OTP, e),
		resetPassword: (e) => i(r.RESET_PASSWORD, e),
		changePassword: (e) => i(r.CHANGE_PASSWORD, e),
		deleteAccount: (e) => i(r.DELETE_ACCOUNT, e),
		refreshToken: (e) => i(r.REFRESH, e),
		signOut: (e) => i(r.LOGOUT, e)
	};
}
//#endregion
//#region src/core/createAuthClient.js
function T(e = {}) {
	let { baseURL: t, storage: n, storageKeys: r, endpoints: i, headers: a, expirySkewSeconds: o = 30, crossTab: c = !0, onForceLogout: l, onAuthStateChange: u } = e;
	if (!t) throw Error("createAuthClient requires a baseURL — e.g. createAuthClient({ baseURL: \"https://api.example.com/api\" }). Without it every request would go to the current origin.");
	let f = g({
		storage: n,
		keys: r
	}), p = S({ enabled: c }), m = /* @__PURE__ */ new Set();
	function _() {
		let { idToken: e, accessToken: t } = h(f.getTokens());
		return {
			idToken: e,
			accessToken: t
		};
	}
	function v() {
		return {
			isAuthenticated: f.isAuthenticated(),
			user: f.getUser(),
			..._(),
			isLoading: !1,
			error: null
		};
	}
	let y = v();
	function b() {
		return y;
	}
	function C(e) {
		Object.keys(e).some((t) => y[t] !== e[t]) && (y = {
			...y,
			...e
		}, m.forEach((e) => e(y)), u?.(y));
	}
	function T(e) {
		return m.add(e), () => m.delete(e);
	}
	function E() {
		C({
			isAuthenticated: f.isAuthenticated(),
			user: f.getUser(),
			..._()
		});
	}
	function D() {
		f.clear(), C({
			isAuthenticated: !1,
			user: null,
			idToken: null,
			accessToken: null
		});
	}
	function O() {
		D(), l?.();
	}
	async function k(e) {
		C({
			isLoading: !0,
			error: null
		});
		try {
			let t = await e();
			return C({
				isLoading: !1,
				error: t.error ? t.message : null
			}), t;
		} catch (e) {
			let t = e?.message || "Something went wrong";
			return C({
				isLoading: !1,
				error: t
			}), {
				error: !0,
				message: t,
				code: "UNEXPECTED"
			};
		}
	}
	let A, j = x({
		tokenStore: f,
		expirySkewSeconds: o,
		broadcaster: p,
		requestRefresh: (e) => A.refreshToken(e),
		onRefreshed: () => C(_()),
		onForceLogout: O
	});
	A = w(d({
		baseURL: t,
		headers: a,
		tokenStore: f,
		tokenManager: j
	}), { endpoints: i }), p.subscribe((e) => {
		switch (e.type) {
			case s.TOKEN_REFRESHED:
				e.tokens && f.saveTokens(e.tokens), E();
				break;
			case s.LOGOUT:
				D(), l?.();
				break;
			case s.LOGIN:
				E();
				break;
			case s.NEED_REFRESH:
				j.isRefreshing || j.refresh(!0).catch(() => {});
				break;
			default: break;
		}
	});
	function M(e) {
		let { user: t, tokens: n, ...r } = e, i = f.saveTokens(n ?? r);
		return t && f.saveUser(t), C({
			isAuthenticated: !!i?.id_token,
			user: t ?? f.getUser(),
			..._()
		}), i;
	}
	function N(e) {
		return k(() => A.signUp(e));
	}
	function P(e) {
		return k(async () => {
			let t = await A.signIn(e);
			return t.error || (M(t.data), p.post(s.LOGIN)), t;
		});
	}
	function F(e) {
		return k(() => A.verifyOtp(e));
	}
	function I(e) {
		return k(() => A.resendOtp(e));
	}
	function L(e) {
		return k(() => A.forgotPassword(e));
	}
	function R(e) {
		return k(() => A.verifyResetOtp(e));
	}
	function z(e) {
		return k(() => A.resetPassword(e));
	}
	function B(e) {
		return k(() => A.changePassword(e));
	}
	function V(e) {
		return k(async () => {
			let t = await A.deleteAccount(e);
			return t.error || (D(), p.post(s.LOGOUT)), t;
		});
	}
	function H() {
		return k(async () => {
			try {
				return {
					error: !1,
					data: {
						idToken: await j.refresh(!0),
						..._()
					}
				};
			} catch (e) {
				return {
					error: !0,
					message: e.message,
					code: "REFRESH_FAILED"
				};
			}
		});
	}
	function U() {
		return k(async () => {
			let e = await A.signOut({});
			return D(), p.post(s.LOGOUT), e;
		});
	}
	function W() {
		p.close();
	}
	function G() {
		p.open();
	}
	function K() {
		p.destroy(), m.clear();
	}
	return {
		getState: b,
		subscribe: T,
		signUp: N,
		signIn: P,
		login: P,
		verifyOtp: F,
		resendOtp: I,
		forgotPassword: L,
		verifyResetOtp: R,
		resetPassword: z,
		changePassword: B,
		deleteAccount: V,
		signOut: U,
		logout: U,
		refreshToken: H,
		getTokens: () => f.getTokens(),
		getIdToken: () => f.getIdToken(),
		getAccessToken: () => f.getAccessToken(),
		getRefreshToken: () => f.getRefreshToken(),
		getValidToken: () => j.getValidToken(),
		expiresIn: () => j.expiresIn(),
		connect: G,
		disconnect: W,
		destroy: K,
		tokenStore: f,
		__backend: A
	};
}
//#endregion
export { l as _, x as a, a as b, y as c, h as d, d as f, c as g, s as h, S as i, g as l, n as m, w as n, v as o, o as p, C as r, b as s, T as t, m as u, t as v, i as x, r as y };
