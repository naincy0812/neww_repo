import React, { useEffect, useRef, useState } from 'react';

interface Props {
  placeholder?: string;
  fetchSuggestions: (prefix: string) => Promise<string[]>;
  onSelect: (value: string) => void;
}

const TypeaheadInput: React.FC<Props> = ({ placeholder, fetchSuggestions, onSelect }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch suggestions when value changes
  useEffect(() => {
    let active = true;
    (async () => {
      if (!value) {
        setSuggestions([]);
        return;
      }
      const res = await fetchSuggestions(value);
      if (active) setSuggestions(res);
    })();
    return () => {
      active = false;
    };
  }, [value, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (val: string) => {
    setValue(val);
    setOpen(false);
    onSelect(val);
  };

  return (
    <div className="typeahead" ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        style={{ padding: '8px', borderRadius: 4, width: '100%' }}
      />
      {open && suggestions.length > 0 && (
        <ul
          className="typeahead-list"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 4,
            maxHeight: 180,
            overflowY: 'auto',
            zIndex: 999,
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              style={{ padding: '6px 10px', cursor: 'pointer', color: '#e2e8f0' }}
              onMouseDown={() => handleSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TypeaheadInput;
