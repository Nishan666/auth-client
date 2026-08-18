import { t as e } from "./createAuthClient-xU2QWm_B.js";
import { createContext as t, useContext as n, useEffect as r, useMemo as i, useState as a, useSyncExternalStore as o } from "react";
import { jsx as s } from "react/jsx-runtime";
//#region src/ui/theme.js
var c = {
	bg: "248 250 252",
	surface: "255 255 255",
	border: "226 232 240",
	"border-strong": "203 213 225",
	fg: "15 23 42",
	muted: "100 116 139",
	subtle: "241 245 249",
	accent: "15 23 42",
	"accent-fg": "255 255 255",
	"accent-hover": "30 41 59",
	danger: "220 38 38",
	"danger-surface": "254 242 242",
	"danger-border": "254 202 202",
	success: "22 163 74",
	"success-surface": "240 253 244",
	"success-border": "187 247 208"
}, l = "--ac-";
function u(e) {
	if (typeof e != "string") return null;
	let t = e.trim(), n = t.match(/^#?([\da-f]{3}|[\da-f]{6})$/i);
	if (n) {
		let e = n[1].length === 3 ? n[1].split("").map((e) => e + e).join("") : n[1], t = parseInt(e, 16);
		return `${t >> 16 & 255} ${t >> 8 & 255} ${t & 255}`;
	}
	let r = t.match(/\d{1,3}/g);
	return r?.length >= 3 ? r.slice(0, 3).join(" ") : null;
}
function d(e, t) {
	let n = t ?? (typeof document < "u" ? document.documentElement : null);
	!n || !e || Object.entries(e).forEach(([e, t]) => {
		if (!(e in c)) return;
		let r = u(t);
		r && n.style.setProperty(`${l}${e}`, r);
	});
}
function f(e) {
	let t = e ?? (typeof document < "u" ? document.documentElement : null);
	t && Object.keys(c).forEach((e) => {
		t.style.removeProperty(`${l}${e}`);
	});
}
//#endregion
//#region src/react/AuthProvider.jsx
var p = t(null);
function m({ client: t, config: n, theme: o, children: c }) {
	let [l] = a(() => t ?? e(n));
	return r(() => (l.connect?.(), () => l.disconnect?.()), [l]), r(() => {
		o && d(o);
	}, [i(() => JSON.stringify(o ?? null), [o])]), /* @__PURE__ */ s(p.Provider, {
		value: l,
		children: c
	});
}
//#endregion
//#region src/react/useAuth.js
function h() {
	let e = n(p);
	if (!e) throw Error("useAuth() must be used within an <AuthProvider>. Wrap your app root in <AuthProvider config={{ ... }}>.");
	return {
		...o(e.subscribe, e.getState, e.getState),
		signUp: e.signUp,
		signIn: e.signIn,
		login: e.login,
		verifyOtp: e.verifyOtp,
		resendOtp: e.resendOtp,
		forgotPassword: e.forgotPassword,
		verifyResetOtp: e.verifyResetOtp,
		resetPassword: e.resetPassword,
		changePassword: e.changePassword,
		deleteAccount: e.deleteAccount,
		signOut: e.signOut,
		logout: e.logout,
		fetchTokens: e.fetchTokens,
		refreshToken: e.refreshToken,
		getTokens: e.getTokens,
		getIdToken: e.getIdToken,
		getAccessToken: e.getAccessToken,
		getRefreshToken: e.getRefreshToken,
		getValidToken: e.getValidToken,
		expiresIn: e.expiresIn,
		client: e
	};
}
//#endregion
export { d as a, c as i, p as n, f as o, m as r, h as t };
