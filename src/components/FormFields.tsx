import {
  BATTING_HANDS,
  BOWLING_STYLES,
  EXPERIENCE_LEVELS,
  PLAYING_ROLES,
} from "@/lib/types";
import { CityTypeahead } from "./CityTypeahead";

export function TextField(props: {
  id: string;
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  full?: boolean;
  autoComplete?: string;
}) {
  const { id, name, label, type = "text", defaultValue, placeholder, required, error, full, autoComplete } = props;
  return (
    <div className={`field${full ? " full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

export function SelectField(props: {
  id: string;
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  full?: boolean;
}) {
  const { id, name, label, options, defaultValue, placeholder = "Select", required, error, full } = props;
  return (
    <div className={`field${full ? " full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} defaultValue={defaultValue ?? ""} required={required}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

export function CitySelect(props: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  error?: string;
}) {
  return <CityTypeahead {...props} />;
}

export function RoleSelect(props: Omit<Parameters<typeof SelectField>[0], "options">) {
  return <SelectField {...props} options={PLAYING_ROLES} />;
}

export function ExperienceSelect(props: Omit<Parameters<typeof SelectField>[0], "options">) {
  return <SelectField {...props} options={EXPERIENCE_LEVELS} />;
}

export function BattingSelect(props: Omit<Parameters<typeof SelectField>[0], "options" | "required">) {
  return <SelectField {...props} options={BATTING_HANDS} placeholder="Optional" />;
}

export function BowlingSelect(props: Omit<Parameters<typeof SelectField>[0], "options" | "required">) {
  return <SelectField {...props} options={BOWLING_STYLES} placeholder="Optional" />;
}
