"use client";

import { useMemo, useState } from "react";
import { suggestGermanCities } from "@/lib/german-cities";

export function CityTypeahead({
  id,
  name,
  label,
  defaultValue = "",
  required,
  error,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const suggestions = useMemo(() => suggestGermanCities(value), [value]);
  const listId = `${id}-suggestions`;
  const show = open && suggestions.length > 0;

  function choose(city: string) {
    setValue(city);
    setOpen(false);
  }

  return (
    <div className="field city-typeahead">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(event) => {
          setValue(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(event) => {
          if (!show) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index - 1 + suggestions.length) % suggestions.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            choose(suggestions[active] ?? suggestions[0]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {show ? (
        <ul id={listId} role="listbox" className="city-suggestions">
          {suggestions.map((city, index) => (
            <li key={city} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={index === active ? "active" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(city)}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
