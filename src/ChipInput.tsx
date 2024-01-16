// ChipInput.tsx
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import './ChipInput.css';

interface Chip {
  id: number;
  label: string;
  imageUrl: string;
}

interface Person {
  name: string;
  email?: string;
}

const ChipInput: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [chips, setChips] = useState<Chip[]>([]);
  const [filteredItems, setFilteredItems] = useState<Person[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastChipIdRef = useRef<number | null>(null);
  const lastBackspaceTimeRef = useRef<number>(0);

  const people: Person[] = [
    { name: 'John Doe', email: 'john.doe@example.com' },
    { name: 'Jane Smith', email: 'jane.smith@example.com' },
    { name: 'Nick Giannopoulos', email: 'nick.g@example.com' },
    // Add more people as needed
  ];

  const hashCode = (str: string) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

  const getProfileImageUrl = (name: string): string => {
    const hash = hashCode(name);
    return `https://robohash.org/${hash}?set=set4&size=30x30`; // Adjust the size as needed
  };

  const filterItems = (value: string) => {
    setFilteredItems(
      people.filter(
        (person) =>
          !chips.some((chip) => chip.label === person.name || chip.label === `${person.name} (${person.email})`) &&
          (person.name.toLowerCase().includes(value.toLowerCase()) || (person.email && person.email.toLowerCase().includes(value.toLowerCase())))
      )
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    filterItems(value);
  };

  const handleItemClick = (person: Person) => {
    const label = person.name;
    const imageUrl = getProfileImageUrl(person.name);
    const newChips = [...chips, { id: chips.length + 1, label, imageUrl }];
    setChips(newChips);
    setFilteredItems(filteredItems.filter((p) => p !== person));
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleChipRemove = (chipId: number) => {
    const removedChip = chips.find((chip) => chip.id === chipId);
    if (removedChip) {
      setChips(chips.filter((chip) => chip.id !== chipId));
      const person = people.find((p) => p.name === removedChip.label || removedChip.label.startsWith(`${p.name} (`));
      if (person) {
        setFilteredItems([...filteredItems, person]);
      }
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (inputValue === '' && chips.length > 0) {
        const currentTime = new Date().getTime();
        if (lastBackspaceTimeRef.current && currentTime - lastBackspaceTimeRef.current < 500) {
          // Double backspace press, remove the last chip
          const lastChipId = chips[chips.length - 1].id;
          handleChipRemove(lastChipId);
        } else {
          // Single backspace press, highlight the last chip
          const lastChipId = chips[chips.length - 1].id;
          const lastChipElement = document.getElementById(`chip-${lastChipId}`);
          if (lastChipElement) {
            lastChipElement.classList.add('highlighted');
            lastChipIdRef.current = lastChipId;
            event.preventDefault();
          }
        }
        lastBackspaceTimeRef.current = currentTime;
      } else {
        // Clear highlight on typing in the input field
        const lastChipId = lastChipIdRef.current;
        if (lastChipId) {
          const lastChipElement = document.getElementById(`chip-${lastChipId}`);
          if (lastChipElement) {
            lastChipElement.classList.remove('highlighted');
          }
          lastChipIdRef.current = null;
        }
      }
    }
  };

  const handleChipClick = (chipId: number) => {
    // Remove the highlighted chip on backspace
    handleChipRemove(chipId);
  };

  useEffect(() => {
    // Remove the highlight effect when the last chip is deleted
    const lastChipId = chips[chips.length - 1]?.id;
    const lastChipElement = document.getElementById(`chip-${lastChipId}`);
    if (lastChipElement) {
      lastChipElement.classList.remove('highlighted');
    }
  }, [chips]);

  return (
    <div className="chip-input">
      <div className="chips">
        {chips.map((chip) => (
          <div key={chip.id} className="chip" id={`chip-${chip.id}`} onClick={() => handleChipClick(chip.id)}>
            <img src={chip.imageUrl} alt="Profile" className="profile-image" />
            <span className="chip-label">{chip.label}</span>
            <span className="chip-remove" onClick={() => handleChipRemove(chip.id)}>
              X
            </span>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        className='input'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder="Type to search..."
      />
      <div className="item-list">
        {filteredItems.map((person) => (
          <div key={person.name} className="item" onClick={() => handleItemClick(person)}>
            <img src={getProfileImageUrl(person.name)} alt="Profile" className="profile-image" />
            <span className="item-label">{person.email ? `${person.name} (${person.email})` : person.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChipInput;
