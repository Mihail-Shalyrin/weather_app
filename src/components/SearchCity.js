import React, { useState } from "react";

function SearchCity({ onSearch }) {
  const [city, setCity] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && city.trim()) {
      onSearch(city.trim());
      setCity("");
    }
  };

  return (
    <input
      type="text"
      placeholder="Введите город"
      className="w-full border rounded px-3 py-2 mb-4"
      value={city}
      onChange={(e) => setCity(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}

export default SearchCity;