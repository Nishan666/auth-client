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
	TOKENS: "/auth/tokens",
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
function d({ baseURL: t, tokenStore: n, tokenManager: r, onForceLogout: i, headers: a }) {
	let o = e.create({
		baseURL: t,
		headers: a
	});
	return o.interceptors.request.use(async (e) => {
		if (u(e.url ?? "")) return e;
		let t = await r.getValidToken() ?? n.getIdToken();
		return t && (e.headers = e.headers ?? {}, e.headers.Authorization = `Bearer ${t}`), e;
	}), o.interceptors.response.use((e) => e, async (e) => {
		let t = e.config, n = e.response?.status === 401, a = t?._retry === !0, s = u(t?.url ?? "");
		if (!t || !n || a || s) return Promise.reject(e);
		t._retry = !0;
		try {
			let e = await r.refresh(!0);
			return t.headers = t.headers ?? {}, t.headers.Authorization = `Bearer ${e}`, o(t);
		} catch {
			return i?.(), Promise.reject(e);
		}
	}), o;
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
		} catch (e) {
			throw o = !1, l(e), n?.post(s.LOGOUT), i?.(), e;
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
		fetchTokens: (e) => i(r.TOKENS, e),
		refreshToken: (e) => i(r.REFRESH, e),
		signOut: (e) => i(r.LOGOUT, e)
	};
}
//#endregion
//#region src/core/backends/mockBackend.js
var T = {
	tokenTTLSeconds: 300,
	refreshTTLSeconds: 3600 * 24 * 30,
	otp: "123456",
	latency: 500,
	seedUsers: [{
		email: "jane@example.com",
		phone: "+11234567890",
		password: "Password123!",
		firstName: "Jane",
		lastName: "Doe"
	}]
}, E = (e) => new Promise((t) => setTimeout(t, e)), D = (e) => ({
	error: !1,
	data: e
}), O = (e, t = 400, n) => ({
	error: !0,
	message: e,
	status: t,
	code: n
});
function k(e) {
	let t = JSON.stringify(e), n = typeof TextEncoder < "u" ? String.fromCharCode(...new TextEncoder().encode(t)) : unescape(encodeURIComponent(t));
	return (typeof btoa == "function" ? btoa(n) : globalThis.Buffer.from(t, "utf8").toString("base64")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var A = 0, j = (e) => `${e}_${Date.now().toString(36)}${(A++).toString(36)}`;
function M(e, t) {
	let n = Math.floor(Date.now() / 1e3), r = {
		alg: "none",
		typ: "JWT"
	}, i = {
		iat: n,
		exp: n + t,
		iss: "auth-client-mock",
		jti: j("jti"),
		...e
	};
	return `${k(r)}.${k(i)}.mock-unsigned`;
}
function N(e) {
	let { password: t, ...n } = e;
	return n;
}
function P(e = {}) {
	let t = {
		...T,
		...e
	}, { otp: n, latency: a } = t, o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = (e) => String(e ?? "").trim().toLowerCase();
	function d(e) {
		e.email && o.set(u(e.email), e), e.phone && o.set(u(e.phone), e);
	}
	t.seedUsers.forEach((e) => {
		d({
			id: j("usr"),
			name: [e.firstName, e.lastName].filter(Boolean).join(" "),
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			...e
		});
	});
	function f(e = {}) {
		return e.identifier ?? e.email ?? e.phone ?? "";
	}
	function p(e) {
		return o.get(u(f(e))) ?? null;
	}
	function m(e, t) {
		let r = {
			identifier: u(e),
			purpose: t,
			otp: n,
			expiresAt: Date.now() + 300 * 1e3,
			attempts: 0
		};
		return c.set(u(e), r), r;
	}
	function h(e, t) {
		let n = u(f(e)), r = c.get(n);
		if (!r || r.purpose !== t) return O("No verification is pending for this account. Request a new code.", 400, "NO_CHALLENGE");
		if (Date.now() > r.expiresAt) return c.delete(n), O("This code has expired. Request a new one.", 410, "OTP_EXPIRED");
		if (r.attempts >= 5) return c.delete(n), O("Too many incorrect attempts. Request a new code.", 429, "OTP_ATTEMPTS_EXCEEDED");
		if (String(e.otp) !== r.otp) {
			r.attempts += 1;
			let e = 5 - r.attempts;
			return O(`Incorrect code. ${e} attempt${e === 1 ? "" : "s"} remaining.`, 400, "OTP_INVALID");
		}
		return c.delete(n), null;
	}
	function g(e) {
		let n = `rt_${j("mock")}`, r = {
			sub: e.id,
			email: e.email ?? null,
			phone: e.phone ?? null,
			name: e.name,
			"custom:user_id": e.id
		};
		return s.set(n, {
			userId: e.id,
			identifier: u(e.email ?? e.phone),
			issuedAt: Date.now(),
			expiresAt: Date.now() + t.refreshTTLSeconds * 1e3
		}), {
			id_token: M(r, t.tokenTTLSeconds),
			access_token: M({
				...r,
				scope: "openid profile email"
			}, t.tokenTTLSeconds),
			refresh_token: n,
			session_token: M({
				sub: e.id,
				privileges: ["read", "write"]
			}, t.refreshTTLSeconds),
			token_type: "Bearer",
			expires_in: t.tokenTTLSeconds
		};
	}
	return {
		async signUp(e) {
			await E(a);
			let t = f(e);
			if (!t) return O("An email or phone number is required", 422, "IDENTIFIER_REQUIRED");
			if (!e.password) return O("A password is required", 422, "PASSWORD_REQUIRED");
			if (String(e.password).length < 8) return O("Password must be at least 8 characters", 422, "PASSWORD_TOO_SHORT");
			if (o.has(u(t))) return O("An account already exists for this identifier", 409, "ACCOUNT_EXISTS");
			let s = !!e.email;
			return d({
				id: j("usr"),
				firstName: e.firstName ?? "",
				lastName: e.lastName ?? "",
				name: [e.firstName, e.lastName].filter(Boolean).join(" ") || t,
				email: s ? t : e.email ?? null,
				phone: s ? e.phone ?? null : t,
				password: e.password,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				verified: !1
			}), m(t, i.AUTH), D({
				message: `Account created. Verification code sent to ${t}.`,
				identifier: t,
				identifierType: s ? r.EMAIL : r.PHONE,
				otpLength: 6,
				debugOtp: n
			});
		},
		async signIn(e) {
			await E(a);
			let t = f(e), r = p(e);
			return !r || r.password !== e.password ? O("Incorrect email/phone or password", 401, "INVALID_CREDENTIALS") : (m(t, i.AUTH), D({
				message: `Verification code sent to ${t}.`,
				identifier: t,
				otpLength: 6,
				debugOtp: n
			}));
		},
		async verifyOtp(e) {
			await E(a);
			let t = h(e, i.AUTH);
			if (t) return t;
			let n = p(e);
			return n ? (n.verified = !0, D({
				...g(n),
				user: N(n)
			})) : O("Account not found", 404, "USER_NOT_FOUND");
		},
		async resendOtp(e) {
			await E(a);
			let t = f(e);
			return o.has(u(t)) ? (m(t, e.purpose ?? i.AUTH), D({
				message: "A new code has been sent.",
				debugOtp: n
			})) : O("Account not found", 404, "USER_NOT_FOUND");
		},
		async forgotPassword(e) {
			await E(a);
			let t = f(e);
			return o.has(u(t)) && m(t, i.PASSWORD_RESET), D({
				message: `If an account exists for ${t}, a reset code has been sent.`,
				identifier: t,
				debugOtp: n
			});
		},
		async verifyResetOtp(e) {
			await E(a);
			let t = h(e, i.PASSWORD_RESET);
			if (t) return t;
			let n = `rst_${j("mock")}`;
			return l.set(n, {
				identifier: u(f(e)),
				expiresAt: Date.now() + 600 * 1e3
			}), D({
				resetToken: n,
				expiresIn: 600
			});
		},
		async resetPassword(e) {
			await E(a);
			let t = l.get(e.resetToken);
			if (!t) return O("This reset link is invalid. Start over.", 401, "RESET_TOKEN_INVALID");
			if (Date.now() > t.expiresAt) return l.delete(e.resetToken), O("This reset link has expired. Start over.", 410, "RESET_TOKEN_EXPIRED");
			let n = e.newPassword ?? e.password;
			if (!n || String(n).length < 8) return O("Password must be at least 8 characters", 422, "PASSWORD_TOO_SHORT");
			let r = o.get(t.identifier);
			return r ? (r.password = n, l.delete(e.resetToken), s.forEach((e, t) => {
				e.userId === r.id && s.delete(t);
			}), D({ message: "Password reset successfully. Sign in with your new password." })) : O("Account not found", 404, "USER_NOT_FOUND");
		},
		async changePassword(e, t = {}) {
			await E(a);
			let n = o.get(u(t.identifier ?? f(e)));
			return n ? n.password === e.currentPassword ? !e.newPassword || String(e.newPassword).length < 8 ? O("New password must be at least 8 characters", 422, "PASSWORD_TOO_SHORT") : e.newPassword === e.currentPassword ? O("New password must differ from the current one", 422, "PASSWORD_UNCHANGED") : (n.password = e.newPassword, D({ message: "Password changed successfully" })) : O("Current password is incorrect", 400, "CURRENT_PASSWORD_INVALID") : O("You must be signed in to change your password", 401, "UNAUTHENTICATED");
		},
		async deleteAccount(e, t = {}) {
			await E(a);
			let n = o.get(u(t.identifier ?? f(e)));
			return n ? n.password === e.password ? (n.email && o.delete(u(n.email)), n.phone && o.delete(u(n.phone)), s.forEach((e, t) => {
				e.userId === n.id && s.delete(t);
			}), D({ message: "Account deleted successfully" })) : O("Incorrect password", 400, "PASSWORD_INVALID") : O("You must be signed in to delete your account", 401, "UNAUTHENTICATED");
		},
		async fetchTokens(e, t = {}) {
			await E(a / 2);
			let n = o.get(u(t.identifier ?? f(e)));
			return n ? D({ tokens: g(n) }) : O("Account not found", 404, "USER_NOT_FOUND");
		},
		async refreshToken(e) {
			await E(a / 2);
			let t = e.refreshToken ?? e.refresh_token, n = s.get(t);
			if (!n) return O("Refresh token is invalid or has been revoked", 401, "REFRESH_TOKEN_INVALID");
			if (Date.now() > n.expiresAt) return s.delete(t), O("Session has expired. Sign in again.", 401, "REFRESH_TOKEN_EXPIRED");
			let r = o.get(n.identifier);
			return r ? (s.delete(t), D({ tokens: g(r) })) : (s.delete(t), O("Account no longer exists", 401, "USER_NOT_FOUND"));
		},
		async signOut(e) {
			await E(a / 3);
			let t = e?.refreshToken ?? e?.refresh_token;
			return t && s.delete(t), D({ message: "Signed out" });
		},
		__inspect() {
			return {
				users: [...new Set(o.values())].map(N),
				activeSessions: s.size,
				pendingChallenges: c.size
			};
		}
	};
}
//#endregion
//#region src/core/createAuthClient.js
function F(e = {}) {
	let { baseURL: t = "", useMock: n = !1, mockOptions: r, storage: i, storageKeys: a, endpoints: o, headers: c, expirySkewSeconds: l = 30, crossTab: u = !0, onForceLogout: f, onAuthStateChange: p } = e, m = g({
		storage: i,
		keys: a
	}), _ = S({ enabled: u }), v = /* @__PURE__ */ new Set();
	function y() {
		let { idToken: e, accessToken: t } = h(m.getTokens());
		return {
			idToken: e,
			accessToken: t
		};
	}
	function b() {
		return {
			isAuthenticated: m.isAuthenticated(),
			user: m.getUser(),
			...y(),
			isLoading: !1,
			error: null
		};
	}
	let C = b();
	function T() {
		return C;
	}
	function E(e) {
		Object.keys(e).some((t) => C[t] !== e[t]) && (C = {
			...C,
			...e
		}, v.forEach((e) => e(C)), p?.(C));
	}
	function D(e) {
		return v.add(e), () => v.delete(e);
	}
	function O() {
		E({
			isAuthenticated: m.isAuthenticated(),
			user: m.getUser(),
			...y()
		});
	}
	function k() {
		m.clear(), E({
			isAuthenticated: !1,
			user: null,
			idToken: null,
			accessToken: null
		});
	}
	function A() {
		k(), f?.();
	}
	async function j(e) {
		E({
			isLoading: !0,
			error: null
		});
		try {
			let t = await e();
			return E({
				isLoading: !1,
				error: t.error ? t.message : null
			}), t;
		} catch (e) {
			let t = e?.message || "Something went wrong";
			return E({
				isLoading: !1,
				error: t
			}), {
				error: !0,
				message: t,
				code: "UNEXPECTED"
			};
		}
	}
	let M, N = n ? P(r) : null, F = x({
		tokenStore: m,
		expirySkewSeconds: l,
		broadcaster: _,
		requestRefresh: (e) => M.refreshToken(e),
		onRefreshed: () => E(y()),
		onForceLogout: A
	});
	M = N ?? w(d({
		baseURL: t,
		headers: c,
		tokenStore: m,
		tokenManager: F,
		onForceLogout: A
	}), { endpoints: o }), _.subscribe((e) => {
		switch (e.type) {
			case s.TOKEN_REFRESHED:
				e.tokens && m.saveTokens(e.tokens), O();
				break;
			case s.LOGOUT:
				k(), f?.();
				break;
			case s.LOGIN:
				O();
				break;
			case s.NEED_REFRESH:
				F.isRefreshing || F.refresh(!0).catch(() => {});
				break;
			default: break;
		}
	});
	function I() {
		let e = m.getUser();
		return {
			identifier: e?.email ?? e?.phone ?? null,
			user: e
		};
	}
	function L(e) {
		let { user: t, tokens: n, ...r } = e, i = m.saveTokens(n ?? r);
		return t && m.saveUser(t), E({
			isAuthenticated: !!i?.id_token,
			user: t ?? m.getUser(),
			...y()
		}), i;
	}
	function R(e) {
		return j(() => M.signUp(e));
	}
	function z(e) {
		return j(() => M.signIn(e));
	}
	function B(e) {
		return j(async () => {
			let t = await M.verifyOtp(e);
			return t.error || (L(t.data), _.post(s.LOGIN)), t;
		});
	}
	function V(e) {
		return j(() => M.resendOtp(e));
	}
	function H(e) {
		return j(() => M.forgotPassword(e));
	}
	function U(e) {
		return j(() => M.verifyResetOtp(e));
	}
	function W(e) {
		return j(() => M.resetPassword(e));
	}
	function G(e) {
		return j(() => M.changePassword(e, I()));
	}
	function K(e) {
		return j(async () => {
			let t = await M.deleteAccount(e, I());
			return t.error || (k(), _.post(s.LOGOUT)), t;
		});
	}
	function q() {
		return j(async () => {
			let e = await M.fetchTokens({}, I());
			return e.error || L(e.data), e;
		});
	}
	function J() {
		return j(async () => {
			try {
				return {
					error: !1,
					data: {
						idToken: await F.refresh(!0),
						...y()
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
	function Y() {
		return j(async () => {
			let e = await M.signOut({ refreshToken: m.getRefreshToken() });
			return k(), _.post(s.LOGOUT), e;
		});
	}
	function X() {
		_.close();
	}
	function Z() {
		_.open();
	}
	function Q() {
		_.destroy(), v.clear();
	}
	return {
		getState: T,
		subscribe: D,
		signUp: R,
		signIn: z,
		login: z,
		verifyOtp: B,
		resendOtp: V,
		forgotPassword: H,
		verifyResetOtp: U,
		resetPassword: W,
		changePassword: G,
		deleteAccount: K,
		signOut: Y,
		logout: Y,
		fetchTokens: q,
		refreshToken: J,
		getTokens: () => m.getTokens(),
		getIdToken: () => m.getIdToken(),
		getAccessToken: () => m.getAccessToken(),
		getRefreshToken: () => m.getRefreshToken(),
		getValidToken: () => F.getValidToken(),
		expiresIn: () => F.expiresIn(),
		connect: Z,
		disconnect: X,
		destroy: Q,
		tokenStore: m,
		__backend: M
	};
}
//#endregion
export { i as S, c as _, S as a, r as b, b as c, m as d, h as f, s as g, n as h, C as i, y as l, o as m, P as n, x as o, d as p, w as r, v as s, F as t, g as u, l as v, a as x, t as y };
