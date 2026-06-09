const inputBase = {
  width:        "100%",
  padding:      "var(--space-3) var(--space-4)",
  background:   "var(--lilac-pale)",
  border:       "1.5px solid var(--border-purple)",
  borderRadius: "var(--radius-md)",
  fontSize:     ".88rem",
  color:        "var(--text-primary)",
  outline:      "none",
  transition:   "border-color .15s",
};

export default function Input({ value, onChange, placeholder, type = "text", inputMode, onBlur, readOnly }) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      placeholder={placeholder}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...inputBase,
        background: readOnly ? "var(--surface-2)" : inputBase.background,
        cursor: readOnly ? "default" : "text",
      }}
      onFocus={(e) => { e.target.style.borderColor = "var(--purple-mid)"; }}
      onBlur={(e)  => {
        e.target.style.borderColor = "var(--border-purple)";
        if (onBlur) onBlur(e);
      }}
    />
  );
}