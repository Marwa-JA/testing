import { Password } from 'primereact/password';
import 'primeflex/primeflex.css';

export const FormPassword = ({ label, value, onChange, feedback = true, className = '' }) => {
  return (
    <div className={className}>
      <label className="block text-900 font-medium mb-2">{label}</label>
      <Password 
        className="pw-field w-full"  
        inputClassName="w-full" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        feedback={feedback}
        toggleMask
        required
      />
    </div>
  );
};