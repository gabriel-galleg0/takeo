export default function Field({ label, children, half }) {
  return (
    <div className="form-field-group" style={{ flex: half ? "1 1 45%" : "1 1 100%" }}>
      <label>{label}</label>
      {children}
    </div>
  );
}