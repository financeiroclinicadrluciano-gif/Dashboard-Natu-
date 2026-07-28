/* @ds-bundle: {"format":4,"namespace":"DesignSystemNatu_a3c468","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"BrandMark","sourcePath":"components/brand/BrandMark.jsx"},{"name":"DiagnosticLine","sourcePath":"components/brand/DiagnosticLine.jsx"},{"name":"Eyebrow","sourcePath":"components/brand/Eyebrow.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"StatusMessage","sourcePath":"components/feedback/StatusMessage.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Card","sourcePath":"components/layout/Card.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"8b1b25003a37","components/actions/IconButton.jsx":"8be718590450","components/brand/BrandMark.jsx":"d01e25458608","components/brand/DiagnosticLine.jsx":"97a8ded9f881","components/brand/Eyebrow.jsx":"dd596430d332","components/feedback/Badge.jsx":"f6d8b5dc05bf","components/feedback/StatusMessage.jsx":"466fc78387a9","components/forms/Field.jsx":"38f40c334a3a","components/forms/SegmentedControl.jsx":"469ff64849c4","components/forms/Select.jsx":"40fb82353145","components/forms/Switch.jsx":"c9e8496d377a","components/layout/Card.jsx":"0f1db47884d4","ui_kits/marketing/site.jsx":"4121b4b23cb0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystemNatu_a3c468 = window.DesignSystemNatu_a3c468 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Natuá primary action control. Variants map to the brand's command hierarchy:
 * one primary command per context; accent (gold) only on dark surfaces, decisive moments.
 */
function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  iconLeft = null,
  iconRight = null,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const palettes = {
    primary: {
      bg: 'var(--forest-800)',
      bgHover: 'var(--forest-700)',
      fg: 'var(--mineral-0)',
      border: 'transparent'
    },
    secondary: {
      bg: 'transparent',
      bgHover: 'var(--forest-50)',
      fg: 'var(--forest-800)',
      border: 'var(--forest-700)'
    },
    ghost: {
      bg: 'transparent',
      bgHover: 'var(--forest-50)',
      fg: 'var(--forest-700)',
      border: 'transparent'
    },
    accent: {
      bg: 'var(--gold-400)',
      bgHover: 'var(--gold-500)',
      fg: 'var(--forest-950)',
      border: 'transparent'
    },
    'inverse-ghost': {
      bg: 'transparent',
      bgHover: 'rgb(255 255 255 / 8%)',
      fg: 'var(--mineral-50)',
      border: 'var(--border-inverse)'
    }
  };
  const p = palettes[variant] || palettes.primary;
  const sizes = {
    sm: {
      minHeight: 40,
      padding: '0 var(--space-4)',
      fontSize: '0.8125rem'
    },
    md: {
      minHeight: 48,
      padding: '0 var(--space-5)',
      fontSize: '0.875rem'
    },
    lg: {
      minHeight: 56,
      padding: '0 var(--space-8)',
      fontSize: '0.9375rem'
    }
  };
  const s = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      border: `1px solid ${p.border}`,
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      lineHeight: 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      textDecoration: 'none',
      background: hover && !disabled ? p.bgHover : p.bg,
      color: p.fg,
      transform: !disabled && active ? 'translateY(0)' : hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      transition: 'background-color var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
      ...s,
      padding: s.padding,
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Icon-only square control (44px hit target). Use for toolbar / navigation glyphs, never a page's primary action. */
function IconButton({
  label,
  variant = 'default',
  disabled = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const palettes = {
    default: {
      bg: 'transparent',
      bgHover: 'var(--mineral-100)',
      fg: 'inherit',
      border: 'var(--border-default)'
    },
    inverse: {
      bg: 'transparent',
      bgHover: 'rgb(255 255 255 / 8%)',
      fg: 'var(--mineral-50)',
      border: 'var(--border-inverse)'
    }
  };
  const p = palettes[variant] || palettes.default;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
      padding: 0,
      border: `1px solid ${p.border}`,
      borderRadius: 'var(--radius-md)',
      background: hover && !disabled ? p.bgHover : p.bg,
      color: p.fg,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background-color var(--duration-fast) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/brand/BrandMark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Natuá lockup: leaf symbol + wordmark. Symbol inherits `currentColor`
 * (forest on light surfaces, ivory on dark). Protection area ≈ height of the "N".
 * `compact` renders the symbol only.
 */
function BrandMark({
  inverse = false,
  compact = false,
  size = 46,
  style,
  ...rest
}) {
  const color = inverse ? 'var(--mineral-50)' : 'var(--forest-800)';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      color,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 96 96",
    fill: "none",
    "aria-hidden": "true",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M48 88V39",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M48 39C35 30 35 16 48 6C61 16 61 30 48 39Z",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M43 67C25 67 12 56 9 38C27 38 40 49 43 67Z",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M53 67C71 67 84 56 87 38C69 38 56 49 53 67Z",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinejoin: "round"
  })), !compact && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '1.55rem',
      fontWeight: 500
    }
  }, "NATU\xC1"), /*#__PURE__*/React.createElement("small", {
    style: {
      fontSize: '0.55rem',
      fontWeight: 500,
      letterSpacing: '0.34em',
      marginTop: 6,
      paddingLeft: 3
    }
  }, "MED SPA")));
}
Object.assign(__ds_scope, { BrandMark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/BrandMark.jsx", error: String((e && e.message) || e) }); }

// components/brand/DiagnosticLine.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Linha de Diagnóstico — the system's signature. A thin gold line with progression
 * nodes that connects phases/data/decisions. Orientation vertical or horizontal.
 * Never a decorative frame, repeated background, or thick/glowing line.
 */
function DiagnosticLine({
  orientation = 'vertical',
  nodes = 4,
  length = 320,
  active = -1,
  style,
  ...rest
}) {
  const vertical = orientation === 'vertical';
  const positions = Array.from({
    length: nodes
  }, (_, i) => nodes === 1 ? 50 : i / (nodes - 1) * 100);
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "presentation",
    style: {
      position: 'relative',
      ...(vertical ? {
        width: 11,
        height: length
      } : {
        height: 11,
        width: length
      }),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      background: 'var(--gold-500)',
      opacity: 0.6,
      ...(vertical ? {
        left: 5,
        top: 0,
        width: 1,
        height: '100%'
      } : {
        top: 5,
        left: 0,
        height: 1,
        width: '100%'
      })
    }
  }), positions.map((pos, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: 'absolute',
      width: 11,
      height: 11,
      borderRadius: '50%',
      border: '1px solid var(--gold-400)',
      background: i <= active ? 'var(--gold-400)' : 'var(--forest-950)',
      ...(vertical ? {
        left: 0,
        top: `calc(${pos}% - 5px)`
      } : {
        top: 0,
        left: `calc(${pos}% - 5px)`
      })
    }
  })));
}
Object.assign(__ds_scope, { DiagnosticLine });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/DiagnosticLine.jsx", error: String((e && e.message) || e) }); }

// components/brand/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Uppercase micro-label above headings. `gold` variant for dark surfaces. */
function Eyebrow({
  variant = 'default',
  children,
  style,
  ...rest
}) {
  const color = variant === 'gold' ? 'var(--gold-400)' : 'var(--forest-600)';
  return /*#__PURE__*/React.createElement("p", _extends({
    style: {
      color,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--type-label)',
      fontWeight: 600,
      letterSpacing: '0.14em',
      lineHeight: 1.4,
      textTransform: 'uppercase',
      margin: 0,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Small pill label for status/category. Tone-driven; keep copy to 1–2 words, uppercase handled internally. */
function Badge({
  tone = 'brand',
  children,
  style,
  ...rest
}) {
  const tones = {
    brand: {
      bg: 'var(--forest-800)',
      fg: '#fff',
      border: 'transparent'
    },
    success: {
      bg: 'var(--forest-50)',
      fg: 'var(--forest-700)',
      border: 'var(--forest-100)'
    },
    info: {
      bg: 'var(--blue-100)',
      fg: 'var(--blue-700)',
      border: 'transparent'
    },
    warning: {
      bg: 'var(--gold-50)',
      fg: 'var(--gold-700)',
      border: 'var(--gold-100)'
    },
    neutral: {
      bg: 'var(--mineral-100)',
      fg: 'var(--mineral-800)',
      border: 'var(--border-default)'
    }
  };
  const t = tones[tone] || tones.brand;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minHeight: 28,
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-pill)',
      border: `1px solid ${t.border}`,
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--font-sans)',
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusMessage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Inline callout for status / clinical notices. State never depends on color alone —
 * always carries a title and body. Icon slot optional.
 */
function StatusMessage({
  tone = 'info',
  title,
  icon = null,
  children,
  style,
  ...rest
}) {
  const tones = {
    warning: {
      bg: 'var(--gold-50)',
      border: 'var(--gold-100)',
      fg: 'var(--gold-700)'
    },
    info: {
      bg: 'var(--blue-100)',
      border: '#bcd5da',
      fg: 'var(--blue-700)'
    },
    success: {
      bg: 'var(--forest-50)',
      border: 'var(--forest-100)',
      fg: 'var(--forest-700)'
    },
    danger: {
      bg: 'var(--coral-100)',
      border: '#e6b9b4',
      fg: 'var(--coral-700)'
    }
  };
  const t = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      border: `1px solid ${t.border}`,
      borderRadius: 'var(--radius-md)',
      background: t.bg,
      color: t.fg,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0,
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("span", null, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      display: 'block',
      fontSize: '0.875rem',
      lineHeight: 1.3
    }
  }, title), children && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.8125rem',
      lineHeight: 1.55,
      marginTop: title ? 'var(--space-1)' : 0
    }
  }, children)));
}
Object.assign(__ds_scope, { StatusMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusMessage.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Labeled text input. Label always visible; placeholder never replaces it. Min height 48px. */
function Field({
  label,
  hint,
  error,
  id,
  style,
  ...rest
}) {
  const fid = id || React.useId();
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    "aria-invalid": !!error,
    style: {
      appearance: 'none',
      minHeight: 48,
      width: '100%',
      padding: '0 var(--space-4)',
      background: 'var(--mineral-0)',
      color: 'var(--text-primary)',
      border: `1px solid ${error ? 'var(--coral-500)' : focus ? 'var(--forest-600)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      fontFamily: 'var(--font-sans)'
    }
  }, rest)), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: 'var(--coral-700)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: 'var(--text-secondary)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
/** Squared segmented control for switching between 2–4 mutually exclusive views. */
function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  style
}) {
  const first = defaultValue ?? (options[0] && (options[0].value ?? options[0]));
  const [internal, setInternal] = React.useState(first);
  const active = value !== undefined ? value : internal;
  const select = v => {
    if (value === undefined) setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'inline-flex',
      padding: 3,
      border: '1px solid var(--border-default)',
      ...style
    }
  }, options.map(o => {
    const v = o.value ?? o;
    const label = o.label ?? o;
    const isActive = v === active;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      role: "tab",
      "aria-selected": isActive,
      onClick: () => select(v),
      style: {
        border: 0,
        minHeight: 40,
        padding: '0 var(--space-4)',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.75rem',
        fontWeight: isActive ? 600 : 500,
        cursor: 'pointer',
        background: isActive ? 'var(--forest-800)' : 'transparent',
        color: isActive ? 'var(--mineral-0)' : 'var(--text-secondary)',
        transition: 'background-color var(--duration-fast), color var(--duration-fast)'
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Labeled select. Same footprint as Field. Pass options as [{value,label}] or children. */
function Select({
  label,
  hint,
  id,
  options,
  children,
  style,
  ...rest
}) {
  const fid = id || React.useId();
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      minHeight: 48,
      width: '100%',
      padding: '0 var(--space-8) 0 var(--space-4)',
      background: 'var(--mineral-0)',
      color: 'var(--text-primary)',
      border: `1px solid ${focus ? 'var(--forest-600)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      fontFamily: 'var(--font-sans)',
      cursor: 'pointer'
    }
  }, rest), options ? options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)) : children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: 'var(--space-4)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--text-secondary)',
      fontSize: '0.7rem'
    }
  }, "\u25BE")), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: 'var(--text-secondary)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Binary toggle. Controlled via `checked` + `onChange(next)`, or uncontrolled via `defaultChecked`. */
function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  style
}) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = checked !== undefined ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (checked === undefined) setInternal(next);
    onChange && onChange(next);
  };
  const control = /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": on,
    "aria-label": label,
    disabled: disabled,
    onClick: toggle,
    style: {
      width: 50,
      height: 28,
      padding: 3,
      border: 0,
      borderRadius: 'var(--radius-pill)',
      background: on ? 'var(--forest-600)' : 'var(--mineral-200)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background-color var(--duration-base)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transform: on ? 'translateX(22px)' : 'translateX(0)',
      transition: 'transform var(--duration-base) var(--ease-standard)'
    }
  }));
  if (!label) return control;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      ...style
    }
  }, control, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.8125rem',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/layout/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Content container for repeated items — professionals, treatment options,
 * metrics, testimonials, clinical tools. Not for wrapping every section.
 * `interactive` adds a subtle hover lift; `elevated` swaps border for shadow.
 */
function Card({
  interactive = false,
  elevated = false,
  padding = 'var(--space-8)',
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    style: {
      background: 'var(--surface-base)',
      border: elevated ? '1px solid transparent' : '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: elevated ? 'var(--shadow-md)' : hover ? 'var(--shadow-sm)' : 'none',
      padding,
      transform: interactive && hover ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'transform var(--duration-fast) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/site.jsx
try { (() => {
/* Natuá MedSpa — marketing site sections. Composes design-system primitives
   from window.DesignSystemNatu_a3c468. Exports sections to window.NatuaSite. */
const DS = window.DesignSystemNatu_a3c468;
const {
  Button,
  BrandMark,
  Eyebrow,
  DiagnosticLine,
  Card,
  Badge,
  Field,
  Select,
  StatusMessage
} = DS;
function Icon({
  n,
  size = 18,
  color
}) {
  const r = React.useRef(null);
  React.useEffect(() => {
    if (!r.current || !window.lucide || !lucide[n]) return;
    r.current.innerHTML = '';
    const el = lucide.createElement(lucide[n]);
    el.setAttribute('width', size);
    el.setAttribute('height', size);
    if (color) el.setAttribute('stroke', color);
    r.current.appendChild(el);
  }, [n, size, color]);
  return /*#__PURE__*/React.createElement("span", {
    ref: r,
    style: {
      display: 'inline-flex'
    }
  });
}
const NAV = ['Método', 'Plano DOC 365', 'Equipe', 'Fotografia', 'Contato'];
function Nav({
  onBook
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgb(6 19 15 / 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-inverse)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 clamp(20px,5vw,56px)',
      height: 76,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(BrandMark, {
    inverse: true,
    size: 40
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-6)'
    }
  }, NAV.map(n => /*#__PURE__*/React.createElement("a", {
    key: n,
    href: "#",
    style: {
      color: 'rgb(249 247 242 / 0.72)',
      fontSize: '0.8125rem',
      textDecoration: 'none'
    },
    onClick: e => e.preventDefault()
  }, n))), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "sm",
    onClick: onBook,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      n: "ArrowRight",
      size: 16,
      color: "#06130f"
    })
  }, "Agendar avalia\xE7\xE3o")));
}
function Hero({
  onBook
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      background: 'var(--forest-950)',
      color: 'var(--mineral-50)',
      padding: 'clamp(64px,10vw,120px) clamp(20px,5vw,56px)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      gap: 'var(--space-16)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 'clamp(20px,4vw,44px)',
      top: 120,
      bottom: 120
    }
  }, /*#__PURE__*/React.createElement(DiagnosticLine, {
    orientation: "vertical",
    nodes: 4,
    length: 340,
    active: 1
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 520px',
      minWidth: 0,
      paddingLeft: 'clamp(28px,4vw,64px)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    variant: "gold"
  }, "Natu\xE1 MedSpa \xB7 Plano DOC 365"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'var(--type-h1)',
      lineHeight: 1.05,
      margin: 'var(--space-6) 0 0'
    }
  }, "Precis\xE3o que acolhe.", /*#__PURE__*/React.createElement("br", null), "Evolu\xE7\xE3o que permanece."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgb(249 247 242 / 0.7)',
      fontSize: 'var(--type-body-lg)',
      maxWidth: 560,
      margin: 'var(--space-8) 0 0'
    }
  }, "Emagrecer \xE9 uma fase. Sustentar o resultado \xE9 o plano. Investiga\xE7\xE3o, tratamento e acompanhamento coordenados ao longo do ano."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap',
      marginTop: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    onClick: onBook,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      n: "ArrowRight",
      size: 18,
      color: "#06130f"
    })
  }, "Agendar avalia\xE7\xE3o"), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse-ghost"
  }, "Conhecer o m\xE9todo"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 1 340px',
      minWidth: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '4/5',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photography/dr-luciano-detail.jpg",
    alt: "Dr. Luciano em atendimento",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      gap: 'var(--space-6)',
      flexWrap: 'wrap',
      borderTop: '1px solid var(--border-inverse)',
      marginTop: 'var(--space-16)',
      paddingTop: 'var(--space-5)',
      color: 'rgb(249 247 242 / 0.62)',
      fontSize: '0.72rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, ['Investigar', 'Direcionar', 'Acompanhar', 'Sustentar'].map((p, i) => /*#__PURE__*/React.createElement("span", {
    key: p,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "Circle",
    size: 7,
    color: "#b99b4a"
  }), p))));
}
const PHASES = [['01', 'Emagrecimento inicial', 'Reduzir risco e gerar tração de resultado.'], ['02', 'Emagrecimento avançado', 'Continuar a perda de gordura com ajustes.'], ['03', 'Definição e transição', 'Proteger músculo e preparar o corpo.'], ['04', 'Força e condicionamento', 'Construir capacidade para sustentar.'], ['05', 'Manutenção e longevidade', 'Levar o resultado para a vida real.']];
function Method() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--forest-900)',
      color: 'var(--mineral-50)',
      padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,56px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)',
      gap: 'var(--space-16)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    variant: "gold"
  }, "O m\xE9todo"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'var(--type-h2)',
      lineHeight: 1.15,
      margin: 'var(--space-4) 0 0'
    }
  }, "Cinco fases, um plano cont\xEDnuo."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgb(249 247 242 / 0.65)',
      fontSize: 'var(--type-body-lg)',
      margin: 'var(--space-5) 0 0',
      maxWidth: 440
    }
  }, "A manuten\xE7\xE3o n\xE3o come\xE7a quando voc\xEA emagrece. Ela come\xE7a quando o plano \xE9 desenhado.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, PHASES.map(([n, t, c], i) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: 'grid',
      gridTemplateColumns: '32px 1fr',
      gap: 'var(--space-5)',
      alignItems: 'start',
      borderTop: i ? '1px solid var(--border-inverse)' : 0,
      paddingTop: i ? 'var(--space-6)' : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.7rem',
      color: 'var(--gold-400)',
      border: '1px solid var(--gold-400)',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '1.05rem',
      margin: 0
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgb(249 247 242 / 0.6)',
      fontSize: '0.8125rem',
      margin: '6px 0 0'
    }
  }, c)))))));
}
function Doctor() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-base)',
      padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,56px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,0.8fr) minmax(0,1.2fr)',
      gap: 'var(--space-16)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photography/dr-luciano-portrait.jpg",
    alt: "Dr. Luciano Alves Neves",
    style: {
      width: '100%',
      aspectRatio: '4/5',
      objectFit: 'cover',
      objectPosition: 'center 26%'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Dire\xE7\xE3o m\xE9dica"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'var(--type-h2)',
      lineHeight: 1.15,
      margin: 'var(--space-3) 0 0'
    }
  }, "Dr. Luciano Alves Neves"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 'var(--type-body-lg)',
      margin: 'var(--space-5) 0 0',
      maxWidth: 520
    }
  }, "M\xE9dico e fundador da Natu\xE1 MedSpa, criador do plano DOC 365. Na avalia\xE7\xE3o, observamos composi\xE7\xE3o corporal, exames, rotina e resposta do organismo antes de decidir o caminho."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--space-6)',
      margin: 'var(--space-10) 0 0',
      borderTop: '1px solid var(--border-default)',
      paddingTop: 'var(--space-8)'
    }
  }, [['Composição', 'corporal avaliada'], ['Exames', 'e histórico'], ['Rotina', 'e resposta']].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
    key: a
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-display)',
      fontSize: '1.5rem',
      color: 'var(--forest-700)'
    }
  }, a), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: 'var(--text-secondary)'
    }
  }, b)))))));
}
function Plan({
  onBook
}) {
  const items = [['Stethoscope', 'Investigar', 'A causa antes do protocolo.'], ['Activity', 'Acompanhar', 'O plano muda quando o corpo muda.'], ['Dumbbell', 'Fortalecer', 'Músculo também é manutenção.'], ['HeartPulse', 'Sustentar', 'Resultado que cabe na vida real.']];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      color: 'var(--mineral-50)',
      minHeight: 560,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photography/dr-luciano-clinic.jpg",
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: '72% center'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, rgb(6 19 15 / 0.92) 40%, rgb(6 19 15 / 0.4))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 1280,
      margin: '0 auto',
      width: '100%',
      padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,56px)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    variant: "gold"
  }, "Plano DOC 365"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'var(--type-h2)',
      lineHeight: 1.05,
      margin: 'var(--space-4) 0 0',
      maxWidth: 640
    }
  }, "Emagrecer \xE9 uma fase. Sustentar o resultado \xE9 o plano."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 'var(--space-4)',
      margin: 'var(--space-12) 0 0',
      maxWidth: 820
    }
  }, items.map(([ic, t, c]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      borderTop: '1px solid var(--gold-500)',
      paddingTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: ic,
    size: 22,
    color: "#ceb66f"
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '0.95rem',
      margin: 'var(--space-4) 0 0'
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.75rem',
      color: 'rgb(249 247 242 / 0.65)',
      margin: '6px 0 0'
    }
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    onClick: onBook,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      n: "ArrowRight",
      size: 18,
      color: "#06130f"
    })
  }, "Conhe\xE7a o plano"))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--forest-950)',
      color: 'rgb(249 247 242 / 0.5)',
      borderTop: '1px solid var(--border-inverse)',
      padding: 'var(--space-12) clamp(20px,5vw,56px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(BrandMark, {
    inverse: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.72rem',
      maxWidth: 340
    }
  }, "Natu\xE1 MedSpa \xB7 Medicina coordenada, acolhimento adulto e resultado acompanhado. Resultados variam por pessoa."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.66rem'
    }
  }, "\xA9 2026 Natu\xE1")));
}
window.NatuaSite = {
  Icon,
  Nav,
  Hero,
  Method,
  Doctor,
  Plan,
  Footer
};
Object.assign(window, {
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/site.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.BrandMark = __ds_scope.BrandMark;

__ds_ns.DiagnosticLine = __ds_scope.DiagnosticLine;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.StatusMessage = __ds_scope.StatusMessage;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Card = __ds_scope.Card;

})();
