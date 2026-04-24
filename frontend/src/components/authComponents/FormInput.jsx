import { InputText } from 'primereact/inputtext';

export const FormInput = ({ label, value, onChange, type = 'text', required = false, className = '' }) => {
  return (
    <div className={className}>
      <label className="block text-900 font-medium mb-2">{label}</label>
      <InputText 
        type={type}
        className="w-full" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
};