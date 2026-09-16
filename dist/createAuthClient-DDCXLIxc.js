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
function u(e, t) {
	return [t.CHANGE_PASSWORD, t.DELETE_ACCOUNT].some((t) => e.includes(t));
}
function d(e = "") {
	return !!(e.includes(n.REFRESH) || e.includes("X-Amz-Signature") || e.includes("X-Amz-Algorithm"));
}
function f({ baseURL: t, tokenStore: r, tokenManager: i, headers: a, endpoints: o }) {
	let s = {
		...n,
		...o
	}, c = e.create({
		baseURL: t,
		headers: a
	});
	return c.interceptors.request.use(async (e) => {
		if (d(e.url ?? "")) return e;
		let t = await i.getValidToken() ?? r.getIdToken();
		return t && (e.headers = e.headers ?? {}, e.headers.Authorization = `Bearer ${t}`), e;
	}), c.interceptors.response.use((e) => e, async (e) => {
		let t = e.config, n = e.response?.status === 401, r = t?._retry === !0, a = d(t?.url ?? "");
		if (!t || !n || r || a || u(t.url ?? "", s)) return Promise.reject(e);
		t._retry = !0;
		try {
			let e = await i.refresh(!0);
			return t.headers = t.headers ?? {}, t.headers.Authorization = `Bearer ${e}`, c(t);
		} catch {
			return Promise.reject(e);
		}
	}), c;
}
//#endregion
//#region src/core/storage.js
function p() {
	let e = /* @__PURE__ */ new Map();
	return {
		getItem: (t) => e.has(t) ? e.get(t) : null,
		setItem: (t, n) => e.set(t, n),
		removeItem: (t) => e.delete(t)
	};
}
function m(e) {
	if (e) return e;
	if (typeof window < "u" && window.localStorage) try {
		let e = "__auth_client_probe__";
		return window.localStorage.setItem(e, "1"), window.localStorage.removeItem(e), window.localStorage;
	} catch {
		return p();
	}
	return p();
}
function h(e) {
	if (!e || typeof e != "object") return null;
	let { id_token: t, idToken: n, access_token: r, accessToken: i, refresh_token: a, refreshToken: o, data: s, ...c } = e.data && typeof e.data == "object" ? {
		...e.data,
		...e
	} : e, l = { ...c }, u = t ?? n, d = r ?? i, f = a ?? o;
	return u !== void 0 && (l.id_token = u), d !== void 0 && (l.access_token = d), f !== void 0 && (l.refresh_token = f), l;
}
function g(e) {
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
function _({ storage: e, keys: n } = {}) {
	let r = {
		...t,
		...n
	}, i = m(e);
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
			let t = h(e);
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
function v(e) {
	let t = e.replace(/-/g, "+").replace(/_/g, "/"), n = t.padEnd(t.length + (4 - t.length % 4) % 4, "="), r = typeof atob == "function" ? atob(n) : globalThis.Buffer.from(n, "base64").toString("binary"), i = Array.from(r, (e) => `%${e.charCodeAt(0).toString(16).padStart(2, "0")}`).join("");
	return JSON.parse(decodeURIComponent(i));
}
function y(e) {
	try {
		let [, t] = String(e).split(".");
		return t ? v(t) : null;
	} catch {
		return null;
	}
}
function b(e) {
	let t = y(e)?.exp;
	return typeof t == "number" ? t - Math.floor(Date.now() / 1e3) : Infinity;
}
function x(e, t = 30) {
	return !e || b(e) <= t;
}
//#endregion
//#region src/core/tokenManager.js
function S({ tokenStore: e, requestRefresh: t, broadcaster: n, onRefreshed: r, onForceLogout: i, expirySkewSeconds: a = 30 }) {
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
			if (!u && c && !x(c, a)) return o = !1, l(null, c), c;
			let d = await t({
				refreshToken: i,
				refresh_token: i
			});
			if (d.error) throw Error(d.message || "Token refresh failed");
			let f = e.saveTokens(d.data?.tokens ?? d.data), p = f?.id_token;
			if (!p) throw Error("Refresh response contained no id_token");
			return n?.post(s.TOKEN_REFRESHED, { tokens: f }), r?.(f), o = !1, l(null, p), p;
		} catch (t) {
			throw o = !1, l(t), x(e.getIdToken(), 0) && (n?.post(s.LOGOUT), i?.()), t;
		}
	}
	return {
		async getValidToken() {
			let t = e.getIdToken();
			if (!t) return null;
			if (!x(t, a)) return t;
			try {
				return await u(!0);
			} catch {
				return null;
			}
		},
		refresh: u,
		expiresIn() {
			let t = e.getIdToken();
			return t ? b(t) : 0;
		},
		get isRefreshing() {
			return o;
		}
	};
}
//#endregion
//#region src/core/broadcast.js
function C({ channelName: e = o, enabled: t = !0 } = {}) {
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
function w(e) {
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
function T(e, { endpoints: t } = {}) {
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
			return w(e);
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
function E(e = {}) {
	let { baseURL: t, storage: n, storageKeys: r, endpoints: i, headers: a, expirySkewSeconds: o = 30, crossTab: c = !0, onForceLogout: l, onAuthStateChange: u } = e;
	if (!t) throw Error("No API base URL. Set VITE_API_BASE_URL in .env and restart the dev server — Vite only reads .env at startup. Or pass it directly: createAuthClient({ baseURL: \"https://api.example.com/v1\" }).");
	if (t.includes("REPLACE-ME")) throw Error("VITE_API_BASE_URL is still the placeholder. Set it to your authentication API in .env and restart the dev server.");
	let d = _({
		storage: n,
		keys: r
	}), p = C({ enabled: c }), m = /* @__PURE__ */ new Set();
	function h() {
		let { idToken: e, accessToken: t } = g(d.getTokens());
		return {
			idToken: e,
			accessToken: t
		};
	}
	function v() {
		return {
			isAuthenticated: d.isAuthenticated(),
			user: d.getUser(),
			...h(),
			isLoading: !1,
			error: null
		};
	}
	let y = v();
	function b() {
		return y;
	}
	function x(e) {
		Object.keys(e).some((t) => y[t] !== e[t]) && (y = {
			...y,
			...e
		}, m.forEach((e) => e(y)), u?.(y));
	}
	function w(e) {
		return m.add(e), () => m.delete(e);
	}
	function E() {
		x({ error: null });
	}
	function D() {
		x({
			isAuthenticated: d.isAuthenticated(),
			user: d.getUser(),
			...h()
		});
	}
	function O() {
		d.clear(), x({
			isAuthenticated: !1,
			user: null,
			idToken: null,
			accessToken: null
		});
	}
	function k() {
		O(), l?.();
	}
	async function A(e) {
		x({
			isLoading: !0,
			error: null
		});
		try {
			let t = await e();
			return x({
				isLoading: !1,
				error: t.error ? t.message : null
			}), t;
		} catch (e) {
			let t = e?.message || "Something went wrong";
			return x({
				isLoading: !1,
				error: t
			}), {
				error: !0,
				message: t,
				code: "UNEXPECTED"
			};
		}
	}
	let j, M = S({
		tokenStore: d,
		expirySkewSeconds: o,
		broadcaster: p,
		requestRefresh: (e) => j.refreshToken(e),
		onRefreshed: () => x(h()),
		onForceLogout: k
	});
	j = T(f({
		baseURL: t,
		headers: a,
		tokenStore: d,
		tokenManager: M,
		endpoints: i
	}), { endpoints: i }), p.subscribe((e) => {
		switch (e.type) {
			case s.TOKEN_REFRESHED:
				e.tokens && d.saveTokens(e.tokens), D();
				break;
			case s.LOGOUT:
				O(), l?.();
				break;
			case s.LOGIN:
				D();
				break;
			case s.NEED_REFRESH:
				M.isRefreshing || M.refresh(!0).catch(() => {});
				break;
			default: break;
		}
	});
	function N(e) {
		let { user: t, tokens: n, ...r } = e, i = d.saveTokens(n ?? r);
		return t && d.saveUser(t), x({
			isAuthenticated: !!i?.id_token,
			user: t ?? d.getUser(),
			...h()
		}), i;
	}
	function P(e) {
		return A(() => j.signUp(e));
	}
	function F(e) {
		return A(async () => {
			let t = await j.signIn(e);
			return t.error || (N(t.data), p.post(s.LOGIN)), t;
		});
	}
	function I(e) {
		return A(() => j.verifyOtp(e));
	}
	function L(e) {
		return A(() => j.resendOtp(e));
	}
	function R(e) {
		return A(() => j.forgotPassword(e));
	}
	function z(e) {
		return A(() => j.verifyResetOtp(e));
	}
	function B(e) {
		return A(() => j.resetPassword(e));
	}
	function V(e) {
		return A(() => j.changePassword(e));
	}
	function H(e) {
		return A(async () => {
			let t = await j.deleteAccount(e);
			return t.error || (O(), p.post(s.LOGOUT)), t;
		});
	}
	function U() {
		return A(async () => {
			try {
				return {
					error: !1,
					data: {
						idToken: await M.refresh(!0),
						...h()
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
	function W() {
		return A(async () => {
			let e = await j.signOut({});
			return O(), p.post(s.LOGOUT), e;
		});
	}
	function G() {
		p.close();
	}
	function K() {
		p.open();
	}
	function q() {
		p.destroy(), m.clear();
	}
	return {
		getState: b,
		subscribe: w,
		clearError: E,
		signUp: P,
		signIn: F,
		login: F,
		verifyOtp: I,
		resendOtp: L,
		forgotPassword: R,
		verifyResetOtp: z,
		resetPassword: B,
		changePassword: V,
		deleteAccount: H,
		signOut: W,
		logout: W,
		refreshToken: U,
		getTokens: () => d.getTokens(),
		getIdToken: () => d.getIdToken(),
		getAccessToken: () => d.getAccessToken(),
		getRefreshToken: () => d.getRefreshToken(),
		getValidToken: () => M.getValidToken(),
		expiresIn: () => M.expiresIn(),
		connect: K,
		disconnect: G,
		destroy: q,
		tokenStore: d,
		__backend: j
	};
}
//#endregion
export { l as _, S as a, a as b, b as c, g as d, f, c as g, s as h, C as i, _ as l, n as m, T as n, y as o, o as p, w as r, x as s, E as t, h as u, t as v, i as x, r as y };
