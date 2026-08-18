import { S as e, b as t } from "./createAuthClient-xU2QWm_B.js";
import { t as n } from "./useAuth-Bxdja9ts.js";
import { useCallback as r, useEffect as i, useId as a, useRef as o, useState as s } from "react";
import { Fragment as c, jsx as l, jsxs as u } from "react/jsx-runtime";
//#region src/ui/components/AuthCard/index.jsx
function d({ title: e, subtitle: t, footer: n, children: r }) {
	return /* @__PURE__ */ l("div", {
		className: "ac-root min-h-screen w-full flex items-center justify-center bg-ac-bg px-4 py-10",
		children: /* @__PURE__ */ u("div", {
			className: "w-full max-w-[26rem]",
			children: [/* @__PURE__ */ u("div", {
				className: "bg-ac-surface border border-ac-border rounded-ac-lg shadow-sm px-7 py-8",
				children: [/* @__PURE__ */ u("header", {
					className: "mb-6",
					children: [/* @__PURE__ */ l("h1", {
						className: "text-xl font-semibold tracking-tight text-ac-fg",
						children: e
					}), t && /* @__PURE__ */ l("p", {
						className: "mt-1 text-sm text-ac-muted",
						children: t
					})]
				}), r]
			}), n && /* @__PURE__ */ l("div", {
				className: "mt-4 text-center text-sm text-ac-muted",
				children: n
			})]
		})
	});
}
//#endregion
//#region src/ui/components/FormField/index.jsx
function f(e, t = "") {
	return `w-full h-10 px-3 rounded-ac bg-ac-surface text-sm text-ac-fg
    placeholder:text-ac-muted/70 border transition-colors outline-none
    focus:ring-2 focus:ring-ac-accent/15
    ${e ? "border-ac-danger focus:border-ac-danger focus:ring-ac-danger/15" : "border-ac-border-strong focus:border-ac-accent"}
    ${t}`;
}
function p({ label: e, error: t, hint: n, id: r, ...i }) {
	let o = a(), s = r ?? o, c = `${s}-error`, d = `${s}-hint`;
	return /* @__PURE__ */ u("div", {
		className: "mb-4",
		children: [
			e && /* @__PURE__ */ l("label", {
				htmlFor: s,
				className: "block mb-1.5 text-sm font-medium text-ac-fg",
				children: e
			}),
			/* @__PURE__ */ l("input", {
				id: s,
				"aria-invalid": t ? !0 : void 0,
				"aria-describedby": t ? c : n ? d : void 0,
				className: f(t),
				...i
			}),
			t ? /* @__PURE__ */ l("p", {
				id: c,
				className: "mt-1.5 text-xs text-ac-danger",
				children: t
			}) : n ? /* @__PURE__ */ l("p", {
				id: d,
				className: "mt-1.5 text-xs text-ac-muted",
				children: n
			}) : null
		]
	});
}
//#endregion
//#region src/ui/components/IdentifierInput/index.jsx
var m = [{
	type: t.EMAIL,
	label: "Email"
}, {
	type: t.PHONE,
	label: "Phone"
}];
function h({ type: e, value: n, onChange: r, error: i, onTypeChange: a }) {
	let o = e === t.EMAIL;
	return /* @__PURE__ */ u("div", { children: [/* @__PURE__ */ l("div", {
		role: "tablist",
		"aria-label": "Sign in with",
		className: "flex gap-1 p-1 mb-3 bg-ac-subtle rounded-ac",
		children: m.map((t) => {
			let n = e === t.type;
			return /* @__PURE__ */ l("button", {
				type: "button",
				role: "tab",
				"aria-selected": n,
				onClick: () => a(t.type),
				className: `flex-1 h-8 text-sm font-medium rounded-[calc(var(--ac-radius)-2px)] transition-colors
                ${n ? "bg-ac-surface text-ac-fg shadow-sm" : "text-ac-muted hover:text-ac-fg"}`,
				children: t.label
			}, t.type);
		})
	}), /* @__PURE__ */ l(p, {
		label: o ? "Email" : "Phone number",
		type: o ? "email" : "tel",
		inputMode: o ? "email" : "tel",
		placeholder: o ? "you@example.com" : "+1 234 567 8900",
		value: n,
		onChange: r,
		error: i,
		autoComplete: o ? "email" : "tel"
	})] });
}
//#endregion
//#region src/ui/components/PasswordField/index.jsx
function g() {
	return /* @__PURE__ */ u("svg", {
		width: "16",
		height: "16",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ l("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), /* @__PURE__ */ l("circle", {
			cx: "12",
			cy: "12",
			r: "3"
		})]
	});
}
function _() {
	return /* @__PURE__ */ u("svg", {
		width: "16",
		height: "16",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ l("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" }),
			/* @__PURE__ */ l("path", { d: "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" }),
			/* @__PURE__ */ l("line", {
				x1: "1",
				y1: "1",
				x2: "23",
				y2: "23"
			})
		]
	});
}
function v(e) {
	if (!e || e.length < 8) return 0;
	let t = 1;
	return e.length >= 12 && t++, /[A-Z]/.test(e) && /[a-z]/.test(e) && t++, /\d/.test(e) && /[^A-Za-z0-9]/.test(e) && t++, t;
}
var y = [
	{
		label: "Too short",
		bar: "bg-ac-danger",
		text: "text-ac-danger"
	},
	{
		label: "Weak",
		bar: "bg-ac-danger",
		text: "text-ac-danger"
	},
	{
		label: "Fair",
		bar: "bg-amber-500",
		text: "text-amber-600"
	},
	{
		label: "Good",
		bar: "bg-ac-fg/60",
		text: "text-ac-muted"
	},
	{
		label: "Strong",
		bar: "bg-ac-success",
		text: "text-ac-success"
	}
];
function b({ value: e, describedById: t }) {
	let n = v(e), r = y[n];
	return /* @__PURE__ */ u("div", {
		className: "mt-2",
		id: t,
		children: [/* @__PURE__ */ l("div", {
			className: "flex gap-1",
			"aria-hidden": "true",
			children: [
				1,
				2,
				3,
				4
			].map((e) => /* @__PURE__ */ l("span", { className: `h-0.5 flex-1 rounded-full transition-colors ${e <= n ? r.bar : "bg-ac-border"}` }, e))
		}), /* @__PURE__ */ u("p", {
			className: `mt-1 text-xs ${r.text}`,
			children: [/* @__PURE__ */ l("span", {
				className: "sr-only",
				children: "Password strength: "
			}), r.label]
		})]
	});
}
function x({ label: e, error: t, hint: n, showStrength: r, value: i, onChange: o, id: c, ...d }) {
	let [p, m] = s(!1), h = a(), v = c ?? h, y = `${v}-error`, x = `${v}-hint`, S = `${v}-strength`, C = [
		t ? y : null,
		n && !t ? x : null,
		r && i ? S : null
	].filter(Boolean).join(" ") || void 0;
	return /* @__PURE__ */ u("div", {
		className: "mb-4",
		children: [
			e && /* @__PURE__ */ l("label", {
				htmlFor: v,
				className: "block mb-1.5 text-sm font-medium text-ac-fg",
				children: e
			}),
			/* @__PURE__ */ u("div", {
				className: "relative",
				children: [/* @__PURE__ */ l("input", {
					id: v,
					type: p ? "text" : "password",
					value: i,
					onChange: o,
					"aria-invalid": t ? !0 : void 0,
					"aria-describedby": C,
					className: f(t, "pr-10"),
					...d
				}), /* @__PURE__ */ l("button", {
					type: "button",
					onClick: () => m((e) => !e),
					tabIndex: -1,
					"aria-label": p ? "Hide password" : "Show password",
					className: "absolute inset-y-0 right-0 w-10 flex items-center justify-center text-ac-muted hover:text-ac-fg transition-colors",
					children: l(p ? _ : g, {})
				})]
			}),
			r && i && /* @__PURE__ */ l(b, {
				value: i,
				describedById: S
			}),
			t ? /* @__PURE__ */ l("p", {
				id: y,
				className: "mt-1.5 text-xs text-ac-danger",
				children: t
			}) : n ? /* @__PURE__ */ l("p", {
				id: x,
				className: "mt-1.5 text-xs text-ac-muted",
				children: n
			}) : null
		]
	});
}
//#endregion
//#region src/ui/components/LoadingSpinner/index.jsx
function S({ size: e = "h-4 w-4", className: t = "", label: n = "Loading" }) {
	return /* @__PURE__ */ l("span", {
		role: "status",
		"aria-label": n,
		className: `inline-block ${e} rounded-full border-2 border-current border-t-transparent animate-spin ${t}`
	});
}
//#endregion
//#region src/ui/components/Button/index.jsx
var C = {
	primary: "bg-ac-accent text-ac-accent-fg hover:bg-ac-accent-hover",
	secondary: "bg-ac-surface text-ac-fg border border-ac-border-strong hover:bg-ac-subtle",
	danger: "bg-ac-danger text-white hover:opacity-90"
};
function w({ text: e, children: t, handleClick: n, loading: r, type: i = "button", variant: a = "primary", disabled: o, className: s = "" }) {
	let c = o || r;
	return /* @__PURE__ */ l("button", {
		type: i,
		disabled: c,
		onClick: n,
		"aria-busy": r || void 0,
		className: `w-full h-10 px-4 inline-flex items-center justify-center gap-2 rounded-ac
        text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ac-accent/25 focus-visible:ring-offset-2
        ${C[a] ?? C.primary}
        ${c ? "opacity-50 pointer-events-none" : ""}
        ${s}`,
		children: r ? /* @__PURE__ */ l(S, {}) : t ?? e
	});
}
//#endregion
//#region src/ui/components/Alert/index.jsx
var T = {
	error: "bg-ac-danger-surface border-ac-danger-border text-ac-danger",
	success: "bg-ac-success-surface border-ac-success-border text-ac-success",
	info: "bg-ac-subtle border-ac-border text-ac-muted"
};
function E({ tone: e = "error", children: t }) {
	return t ? /* @__PURE__ */ l("div", {
		role: e === "error" ? "alert" : "status",
		"aria-live": e === "error" ? "assertive" : "polite",
		className: `mb-4 px-3 py-2.5 rounded-ac border text-sm ${T[e] ?? T.info}`,
		children: t
	}) : null;
}
//#endregion
//#region src/ui/constants.js
var D = {
	SIGN_IN: "signin",
	SIGN_UP: "signup",
	OTP: "otp",
	FORGOT_PASSWORD: "forgot-password",
	RESET_PASSWORD_OTP: "reset-password-otp",
	RESET_PASSWORD: "reset-password"
}, O = 8, k = /^\S+@\S+\.\S+$/, A = /^\+?\d{7,15}$/;
function j(e, n) {
	let r = String(e ?? "").trim(), i = n === t.EMAIL;
	return r ? i && !k.test(r) ? "Enter a valid email address" : !i && !A.test(r.replace(/[\s()-]/g, "")) ? "Enter a valid phone number" : "" : i ? "Email is required" : "Phone number is required";
}
function M(e, { label: t = "Password" } = {}) {
	return e ? e.length < 8 ? `${t} must be at least 8 characters` : "" : `${t} is required`;
}
function N(e, t) {
	return t ? e === t ? "" : "Passwords do not match" : "Confirm your password";
}
//#endregion
//#region src/ui/screens/SignIn.jsx
function P({ setFlow: r }) {
	let { signIn: i, isLoading: a, error: o } = n(), [f, p] = s(t.EMAIL), [m, g] = s({
		identifier: "",
		password: ""
	}), [_, v] = s({});
	function y() {
		let e = {}, t = j(m.identifier, f);
		return t && (e.identifier = t), m.password || (e.password = "Password is required"), e;
	}
	async function b(n) {
		n.preventDefault();
		let a = y();
		if (Object.keys(a).length) {
			v(a);
			return;
		}
		v({});
		let o = f === t.EMAIL;
		(await i({
			[o ? "email" : "phone"]: m.identifier,
			password: m.password
		})).error || r({
			pendingIdentifier: m.identifier,
			identifierType: f,
			otpPurpose: e.AUTH,
			screen: D.OTP
		});
	}
	let S = (e) => (t) => g((n) => ({
		...n,
		[e]: t.target.value
	}));
	function C(e) {
		p(e), g((e) => ({
			...e,
			identifier: ""
		})), v({});
	}
	return /* @__PURE__ */ l(d, {
		title: "Sign in",
		subtitle: "Enter your credentials to continue",
		footer: /* @__PURE__ */ u(c, { children: [
			"Don't have an account?",
			" ",
			/* @__PURE__ */ l("button", {
				className: "font-medium text-ac-fg hover:underline underline-offset-4",
				onClick: () => r({ screen: D.SIGN_UP }),
				children: "Create one"
			})
		] }),
		children: /* @__PURE__ */ u("form", {
			onSubmit: b,
			noValidate: !0,
			children: [
				/* @__PURE__ */ l(h, {
					type: f,
					value: m.identifier,
					onChange: S("identifier"),
					error: _.identifier,
					onTypeChange: C
				}),
				/* @__PURE__ */ l(x, {
					label: "Password",
					placeholder: "Enter your password",
					value: m.password,
					onChange: S("password"),
					error: _.password,
					autoComplete: "current-password"
				}),
				/* @__PURE__ */ l("div", {
					className: "flex justify-end -mt-1 mb-4",
					children: /* @__PURE__ */ l("button", {
						type: "button",
						className: "text-xs text-ac-muted hover:text-ac-fg hover:underline underline-offset-4",
						onClick: () => r({ screen: D.FORGOT_PASSWORD }),
						children: "Forgot password?"
					})
				}),
				/* @__PURE__ */ l(E, {
					tone: "error",
					children: o
				}),
				/* @__PURE__ */ l(w, {
					type: "submit",
					text: "Sign in",
					loading: a
				})
			]
		})
	});
}
//#endregion
//#region src/ui/screens/SignUp.jsx
function F({ setFlow: r }) {
	let { signUp: i, isLoading: a, error: o } = n(), [f, m] = s(t.EMAIL), [g, _] = s({
		firstName: "",
		lastName: "",
		identifier: "",
		password: "",
		confirm: ""
	}), [v, y] = s({});
	function b() {
		let e = {};
		g.firstName.trim() || (e.firstName = "First name is required"), g.lastName.trim() || (e.lastName = "Last name is required");
		let t = j(g.identifier, f);
		t && (e.identifier = t);
		let n = M(g.password);
		n && (e.password = n);
		let r = N(g.password, g.confirm);
		return r && (e.confirm = r), e;
	}
	async function S(n) {
		n.preventDefault();
		let a = b();
		if (Object.keys(a).length) {
			y(a);
			return;
		}
		y({});
		let o = f === t.EMAIL;
		(await i({
			firstName: g.firstName.trim(),
			lastName: g.lastName.trim(),
			[o ? "email" : "phone"]: g.identifier.trim(),
			password: g.password
		})).error || r({
			pendingIdentifier: g.identifier.trim(),
			identifierType: f,
			otpPurpose: e.AUTH,
			screen: D.OTP
		});
	}
	let C = (e) => (t) => _((n) => ({
		...n,
		[e]: t.target.value
	}));
	function T(e) {
		m(e), _((e) => ({
			...e,
			identifier: ""
		})), y({});
	}
	return /* @__PURE__ */ l(d, {
		title: "Create account",
		subtitle: "Get started in a couple of steps",
		footer: /* @__PURE__ */ u(c, { children: [
			"Already have an account?",
			" ",
			/* @__PURE__ */ l("button", {
				className: "font-medium text-ac-fg hover:underline underline-offset-4",
				onClick: () => r({ screen: D.SIGN_IN }),
				children: "Sign in"
			})
		] }),
		children: /* @__PURE__ */ u("form", {
			onSubmit: S,
			noValidate: !0,
			children: [
				/* @__PURE__ */ u("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ l(p, {
						label: "First name",
						type: "text",
						placeholder: "Jane",
						value: g.firstName,
						onChange: C("firstName"),
						error: v.firstName,
						autoComplete: "given-name"
					}), /* @__PURE__ */ l(p, {
						label: "Last name",
						type: "text",
						placeholder: "Doe",
						value: g.lastName,
						onChange: C("lastName"),
						error: v.lastName,
						autoComplete: "family-name"
					})]
				}),
				/* @__PURE__ */ l(h, {
					type: f,
					value: g.identifier,
					onChange: C("identifier"),
					error: v.identifier,
					onTypeChange: T
				}),
				/* @__PURE__ */ l(x, {
					label: "Password",
					placeholder: "Create a password",
					hint: "At least 8 characters",
					value: g.password,
					onChange: C("password"),
					error: v.password,
					autoComplete: "new-password",
					showStrength: !0
				}),
				/* @__PURE__ */ l(x, {
					label: "Confirm password",
					placeholder: "Re-enter your password",
					value: g.confirm,
					onChange: C("confirm"),
					error: v.confirm,
					autoComplete: "new-password"
				}),
				/* @__PURE__ */ l(E, {
					tone: "error",
					children: o
				}),
				/* @__PURE__ */ l(w, {
					type: "submit",
					text: "Create account",
					loading: a
				})
			]
		})
	});
}
//#endregion
//#region src/ui/screens/OtpVerify.jsx
var I = 60;
function L({ flow: a, setFlow: c, onAuthenticated: f }) {
	let { verifyOtp: p, verifyResetOtp: m, resendOtp: h, isLoading: g, error: _ } = n(), { pendingIdentifier: v, identifierType: y, otpPurpose: b } = a, [x, S] = s(() => [
		,
		,
		,
		,
		,
		,
	].fill("")), [C, T] = s(I), [O, k] = s(!1), A = o([]), j = o(null), M = r(() => {
		clearInterval(j.current), j.current = setInterval(() => {
			T((e) => e <= 1 ? (clearInterval(j.current), 0) : e - 1);
		}, 1e3);
	}, []);
	i(() => (A.current[0]?.focus(), M(), () => clearInterval(j.current)), [M]);
	let N = r(async (t) => {
		let n = {
			identifier: v,
			otp: t
		};
		if (b === e.PASSWORD_RESET) {
			let e = await m(n);
			e.error || c({
				resetToken: e.data.resetToken,
				screen: D.RESET_PASSWORD
			});
			return;
		}
		let r = await p(n);
		r.error || (c({
			pendingIdentifier: null,
			screen: D.SIGN_IN
		}), f?.(r.data));
	}, [
		v,
		b,
		p,
		m,
		c,
		f
	]);
	function P(e, t) {
		let n = t.replace(/\D/g, "").slice(-1), r = [...x];
		if (r[e] = n, S(r), n) {
			if (e < 5) {
				A.current[e + 1]?.focus();
				return;
			}
			r.every(Boolean) && N(r.join(""));
		}
	}
	function F(e, t) {
		t.key === "Backspace" && !x[e] && e > 0 && A.current[e - 1]?.focus(), t.key === "ArrowLeft" && e > 0 && (t.preventDefault(), A.current[e - 1]?.focus()), t.key === "ArrowRight" && e < 5 && (t.preventDefault(), A.current[e + 1]?.focus());
	}
	function L(e) {
		e.preventDefault();
		let t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
		if (!t) return;
		let n = [
			,
			,
			,
			,
			,
			,
		].fill("");
		t.split("").forEach((e, t) => {
			n[t] = e;
		}), S(n), A.current[Math.min(t.length, 5)]?.focus(), t.length === 6 && N(t);
	}
	function R(e) {
		e.preventDefault();
		let t = x.join("");
		t.length === 6 && N(t);
	}
	async function z() {
		k(!1), !(await h({
			identifier: v,
			purpose: b
		})).error && (S([
			,
			,
			,
			,
			,
			,
		].fill("")), A.current[0]?.focus(), k(!0), T(I), M());
	}
	let B = x.every(Boolean), V = b === e.PASSWORD_RESET, H = y === t.PHONE ? "phone" : "email", U = V ? D.FORGOT_PASSWORD : D.SIGN_IN;
	return /* @__PURE__ */ u(d, {
		title: V ? "Verify to reset" : "Verify your identity",
		subtitle: `Enter the 6-digit code sent to ${v || `your ${H}`}`,
		children: [/* @__PURE__ */ u("form", {
			onSubmit: R,
			children: [
				/* @__PURE__ */ l("div", {
					className: "flex gap-2 justify-between mb-5",
					onPaste: L,
					children: x.map((e, t) => /* @__PURE__ */ l("input", {
						ref: (e) => {
							A.current[t] = e;
						},
						type: "text",
						inputMode: "numeric",
						autoComplete: t === 0 ? "one-time-code" : "off",
						maxLength: 1,
						value: e,
						"aria-label": `Digit ${t + 1} of 6`,
						onChange: (e) => P(t, e.target.value),
						onKeyDown: (e) => F(t, e),
						onFocus: (e) => e.target.select(),
						className: `ac-otp-input w-11 h-12 text-center text-base font-medium rounded-ac
                bg-ac-surface text-ac-fg border outline-none transition-colors
                focus:border-ac-accent focus:ring-2 focus:ring-ac-accent/15
                ${e ? "border-ac-accent" : "border-ac-border-strong"}`
					}, t))
				}),
				O && /* @__PURE__ */ l(E, {
					tone: "success",
					children: "A new code has been sent."
				}),
				/* @__PURE__ */ l(E, {
					tone: "error",
					children: _
				}),
				/* @__PURE__ */ l(w, {
					type: "submit",
					text: "Verify",
					loading: g,
					disabled: !B
				})
			]
		}), /* @__PURE__ */ u("div", {
			className: "flex items-center justify-between mt-5 text-sm",
			children: [/* @__PURE__ */ l("button", {
				type: "button",
				className: "text-ac-muted hover:text-ac-fg hover:underline underline-offset-4",
				onClick: () => c({ screen: U }),
				children: "Back"
			}), C > 0 ? /* @__PURE__ */ u("span", {
				className: "text-ac-muted",
				children: ["Resend in ", /* @__PURE__ */ u("span", {
					className: "tabular-nums",
					children: [C, "s"]
				})]
			}) : /* @__PURE__ */ l("button", {
				type: "button",
				className: "font-medium text-ac-fg hover:underline underline-offset-4 disabled:opacity-50",
				onClick: z,
				disabled: g,
				children: "Resend code"
			})]
		})]
	});
}
//#endregion
//#region src/ui/screens/ForgotPassword.jsx
function R({ setFlow: r }) {
	let { forgotPassword: i, isLoading: a, error: o } = n(), [f, p] = s(t.EMAIL), [m, g] = s(""), [_, v] = s("");
	async function y(n) {
		n.preventDefault();
		let a = j(m, f);
		if (a) {
			v(a);
			return;
		}
		v("");
		let o = f === t.EMAIL;
		(await i({
			identifier: m.trim(),
			identifierType: f,
			[o ? "email" : "phone"]: m.trim()
		})).error || r({
			pendingIdentifier: m.trim(),
			identifierType: f,
			otpPurpose: e.PASSWORD_RESET,
			screen: D.RESET_PASSWORD_OTP
		});
	}
	function b(e) {
		p(e), g(""), v("");
	}
	return /* @__PURE__ */ l(d, {
		title: "Reset password",
		subtitle: "We'll send a verification code to your registered contact",
		footer: /* @__PURE__ */ u(c, { children: [
			"Remembered it?",
			" ",
			/* @__PURE__ */ l("button", {
				className: "font-medium text-ac-fg hover:underline underline-offset-4",
				onClick: () => r({ screen: D.SIGN_IN }),
				children: "Sign in"
			})
		] }),
		children: /* @__PURE__ */ u("form", {
			onSubmit: y,
			noValidate: !0,
			children: [
				/* @__PURE__ */ l(h, {
					type: f,
					value: m,
					onChange: (e) => g(e.target.value),
					error: _,
					onTypeChange: b
				}),
				/* @__PURE__ */ l(E, {
					tone: "error",
					children: o
				}),
				/* @__PURE__ */ l(w, {
					type: "submit",
					text: "Send code",
					loading: a
				})
			]
		})
	});
}
//#endregion
//#region src/ui/screens/ResetPassword.jsx
function z({ flow: e, setFlow: t }) {
	let { resetPassword: r, isLoading: i, error: a } = n(), { pendingIdentifier: o, resetToken: c } = e, [f, p] = s({
		password: "",
		confirm: ""
	}), [m, h] = s({});
	function g() {
		let e = {}, t = M(f.password, { label: "New password" });
		t && (e.password = t);
		let n = N(f.password, f.confirm);
		return n && (e.confirm = n), e;
	}
	async function _(e) {
		e.preventDefault();
		let n = g();
		if (Object.keys(n).length) {
			h(n);
			return;
		}
		h({}), (await r({
			identifier: o,
			resetToken: c,
			newPassword: f.password
		})).error || t({
			screen: D.SIGN_IN,
			resetToken: null,
			pendingIdentifier: null
		});
	}
	let v = (e) => (t) => p((n) => ({
		...n,
		[e]: t.target.value
	}));
	return /* @__PURE__ */ l(d, {
		title: "Set a new password",
		subtitle: "Choose a password you haven't used before",
		children: /* @__PURE__ */ u("form", {
			onSubmit: _,
			noValidate: !0,
			children: [
				/* @__PURE__ */ l(x, {
					label: "New password",
					placeholder: "Enter a new password",
					hint: "At least 8 characters",
					value: f.password,
					onChange: v("password"),
					error: m.password,
					autoComplete: "new-password",
					showStrength: !0
				}),
				/* @__PURE__ */ l(x, {
					label: "Confirm new password",
					placeholder: "Re-enter your new password",
					value: f.confirm,
					onChange: v("confirm"),
					error: m.confirm,
					autoComplete: "new-password"
				}),
				/* @__PURE__ */ l(E, {
					tone: "error",
					children: a
				}),
				/* @__PURE__ */ l(w, {
					type: "submit",
					text: "Reset password",
					loading: i
				})
			]
		})
	});
}
//#endregion
//#region src/ui/AuthFlow.jsx
function B({ initialScreen: n = D.SIGN_IN, onAuthenticated: r }) {
	let [i, a] = s({
		screen: n,
		pendingIdentifier: null,
		identifierType: t.EMAIL,
		otpPurpose: e.AUTH,
		resetToken: null
	});
	function o(e) {
		a((t) => ({
			...t,
			...e
		}));
	}
	let c = {
		flow: i,
		setFlow: o,
		onAuthenticated: r
	};
	switch (i.screen) {
		case D.SIGN_UP: return /* @__PURE__ */ l(F, { ...c });
		case D.OTP:
		case D.RESET_PASSWORD_OTP: return /* @__PURE__ */ l(L, { ...c });
		case D.FORGOT_PASSWORD: return /* @__PURE__ */ l(R, { ...c });
		case D.RESET_PASSWORD: return /* @__PURE__ */ l(z, { ...c });
		default: return /* @__PURE__ */ l(P, { ...c });
	}
}
//#endregion
//#region src/ui/screens/ChangePassword.jsx
function V({ onSuccess: e, onCancel: t }) {
	let { changePassword: r, isLoading: a, error: c } = n(), [f, p] = s({
		current: "",
		password: "",
		confirm: ""
	}), [m, h] = s({}), [g, _] = s(!1), v = o(null);
	i(() => () => clearTimeout(v.current), []);
	function y() {
		let e = {};
		f.current || (e.current = "Current password is required");
		let t = M(f.password, { label: "New password" });
		t ? e.password = t : f.password === f.current && (e.password = "New password must differ from the current one");
		let n = N(f.password, f.confirm);
		return n && (e.confirm = n), e;
	}
	async function b(t) {
		t.preventDefault();
		let n = y();
		if (Object.keys(n).length) {
			h(n);
			return;
		}
		h({}), (await r({
			currentPassword: f.current,
			newPassword: f.password
		})).error || (_(!0), v.current = setTimeout(() => e?.(), 1500));
	}
	let S = (e) => (t) => p((n) => ({
		...n,
		[e]: t.target.value
	}));
	return g ? /* @__PURE__ */ l(d, {
		title: "Password updated",
		subtitle: "Your password has been changed",
		children: /* @__PURE__ */ u("div", {
			className: "flex flex-col items-center py-4 text-center",
			children: [/* @__PURE__ */ l("div", {
				className: "w-10 h-10 rounded-full bg-ac-success-surface border border-ac-success-border flex items-center justify-center mb-3",
				children: /* @__PURE__ */ l("svg", {
					className: "w-5 h-5 text-ac-success",
					fill: "none",
					viewBox: "0 0 24 24",
					stroke: "currentColor",
					strokeWidth: 2.5,
					"aria-hidden": "true",
					children: /* @__PURE__ */ l("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						d: "M5 13l4 4L19 7"
					})
				})
			}), /* @__PURE__ */ l("p", {
				className: "text-sm text-ac-muted",
				children: "Taking you back…"
			})]
		})
	}) : /* @__PURE__ */ l(d, {
		title: "Change password",
		subtitle: "Update the password for your account",
		footer: t && /* @__PURE__ */ l("button", {
			className: "font-medium text-ac-fg hover:underline underline-offset-4",
			onClick: t,
			children: "Cancel"
		}),
		children: /* @__PURE__ */ u("form", {
			onSubmit: b,
			noValidate: !0,
			children: [
				/* @__PURE__ */ l(x, {
					label: "Current password",
					placeholder: "Enter your current password",
					value: f.current,
					onChange: S("current"),
					error: m.current,
					autoComplete: "current-password"
				}),
				/* @__PURE__ */ l(x, {
					label: "New password",
					placeholder: "Enter a new password",
					hint: "At least 8 characters",
					value: f.password,
					onChange: S("password"),
					error: m.password,
					autoComplete: "new-password",
					showStrength: !0
				}),
				/* @__PURE__ */ l(x, {
					label: "Confirm new password",
					placeholder: "Re-enter your new password",
					value: f.confirm,
					onChange: S("confirm"),
					error: m.confirm,
					autoComplete: "new-password"
				}),
				/* @__PURE__ */ l(E, {
					tone: "error",
					children: c
				}),
				/* @__PURE__ */ l(w, {
					type: "submit",
					text: "Update password",
					loading: a
				})
			]
		})
	});
}
//#endregion
//#region src/ui/screens/DeleteAccount.jsx
function H({ onDeleted: e, onCancel: t }) {
	let { deleteAccount: r, isLoading: i, error: a, user: o } = n(), [c, f] = s(""), [p, m] = s(!1), [h, g] = s("");
	async function _(t) {
		if (t.preventDefault(), !c) {
			g("Enter your password to confirm");
			return;
		}
		g(""), (await r({ password: c })).error || e?.();
	}
	let v = o?.email || o?.phone || "your account";
	return /* @__PURE__ */ u(d, {
		title: "Delete account",
		subtitle: "This is permanent and cannot be undone",
		footer: t && /* @__PURE__ */ l("button", {
			className: "font-medium text-ac-fg hover:underline underline-offset-4",
			onClick: t,
			children: "Keep my account"
		}),
		children: [/* @__PURE__ */ u("div", {
			className: "mb-5 px-3.5 py-3 rounded-ac border border-ac-danger-border bg-ac-danger-surface",
			children: [
				/* @__PURE__ */ l("p", {
					className: "text-sm font-medium text-ac-danger",
					children: "You are about to delete"
				}),
				/* @__PURE__ */ l("p", {
					className: "mt-0.5 text-sm text-ac-danger/90 break-all",
					children: v
				}),
				/* @__PURE__ */ l("p", {
					className: "mt-2 text-xs text-ac-danger/80",
					children: "All associated data will be removed immediately. This cannot be reversed."
				})
			]
		}), /* @__PURE__ */ u("form", {
			onSubmit: _,
			noValidate: !0,
			children: [
				/* @__PURE__ */ u("label", {
					className: "flex items-start gap-2.5 mb-4 cursor-pointer select-none",
					children: [/* @__PURE__ */ l("input", {
						type: "checkbox",
						checked: p,
						onChange: (e) => m(e.target.checked),
						className: "mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--ac-danger))] cursor-pointer"
					}), /* @__PURE__ */ l("span", {
						className: "text-sm text-ac-muted",
						children: "I understand this is permanent and want to delete my account"
					})]
				}),
				/* @__PURE__ */ l(x, {
					label: "Confirm your password",
					placeholder: "Enter your password",
					value: c,
					onChange: (e) => f(e.target.value),
					error: h,
					autoComplete: "current-password",
					disabled: !p
				}),
				/* @__PURE__ */ l(E, {
					tone: "error",
					children: a
				}),
				/* @__PURE__ */ l(w, {
					type: "submit",
					text: "Delete my account",
					variant: "danger",
					loading: i,
					disabled: !p || !c
				})
			]
		})]
	});
}
//#endregion
export { x as _, R as a, f as b, P as c, j as d, M as f, S as g, w as h, z as i, O as l, E as m, V as n, L as o, D as p, B as r, F as s, H as t, N as u, h as v, d as x, p as y };
