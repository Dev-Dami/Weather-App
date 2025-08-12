import axios from 'axios';
import React, { useState, useEffect } from "react";
import { useGeolocation } from "react-use";

type CityGroups = {
    [region: string]: string[];
};

const getSuggestedCities = (currentInput: string): string[] => {
    const input = currentInput.toLowerCase();

    if (!input) {
        return ["New York", "London", "Tokyo", "Paris", "Sydney", "Dubai", "Singapore"];
    }

    const cityGroups: CityGroups = {
        usa: ["New York", "Los Angeles", "Chicago", "Miami", "San Francisco", "Las Vegas"],
        europe: ["London", "Paris", "Berlin", "Rome", "Madrid", "Amsterdam"],
        asia: ["Tokyo", "Seoul", "Shanghai", "Bangkok", "Hong Kong", "Singapore"],
        middleEast: ["Dubai", "Abu Dhabi", "Doha", "Riyadh", "Tel Aviv"],
        oceania: ["Sydney", "Melbourne", "Auckland", "Brisbane", "Perth"]
    };

    for (const [region, cities] of Object.entries(cityGroups)) {
        if (region.includes(input) || input.includes(region)) {
            return cities;
        }
    }

    const allCities = Object.values(cityGroups).flat();
    const matchedCities = allCities.filter(city =>
        city.toLowerCase().includes(input)
    );

    if (matchedCities.length > 0) {
        return matchedCities.slice(0, 6);
    }

    return ["New York", "London", "Tokyo", "Paris", "Sydney", "Dubai"];
};

interface CitySearchWithLocationProps {
    onSearch: (city: string) => void;
}

const CitySearchWithLocation: React.FC<CitySearchWithLocationProps> = ({ onSearch }) => {
    const [city, setCity] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const location = useGeolocation();

    // Fetch city name from lat/lon using reverse geocoding
    const fetchCityFromCoords = async (lat: number, lon: number) => {
        try {
            const res = await axios.get(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const cityName = res.data.city || res.data.locality || res.data.principalSubdivision || "";
            if (cityName) {
                setCity(cityName);
                setInputValue(cityName);
            } else {
                setCity("Lagos"); // fallback city 
                setInputValue("Lagos");
            }
        } catch (error) {
            console.error("Error fetching city from coordinates:", error);
            setCity("Lagos");
            setInputValue("Lagos");
        }
    };

    useEffect(() => {
        if (location.latitude && location.longitude) {
            fetchCityFromCoords(location.latitude, location.longitude);
        }
    }, [location.latitude, location.longitude]);

    useEffect(() => {
        if (inputValue === '') {
            setSuggestions(getSuggestedCities('')); // Show default suggestions when empty
        } else {
            const timer = setTimeout(() => {
                setSuggestions(getSuggestedCities(inputValue));
            }, 300); // Add slight debounce
            return () => clearTimeout(timer);
        }
    }, [inputValue]);

    const handleCityChange = (value: string) => {
        setCity(value);
        // You can add any additional city change handling here
    };

    const handleSearch = () => {
        onSearch(city);
    };

    return (
        <div className="mt-6">
            <div className="relative">
                <div className="flex flex-col gap-2">
                    <input
                        data-testid="city-search-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInputValue(value);
                            handleCityChange(value);
                        }}
                        placeholder="Search for a city..."
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        Get Weather
                    </button>
                </div>

                {/* Recommendations Dropdown */}
                {inputValue && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        {suggestions.map((suggestedCity) => (
                            <div
                                key={suggestedCity}
                                onClick={() => {
                                    setCity(suggestedCity);
                                    setInputValue(suggestedCity);
                                    setSuggestions([]);
                                }}
                                className="p-2 hover:bg-blue-50 cursor-pointer"
                            >
                                {suggestedCity}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Suggested Cities (always visible) */}
            <div className="mt-4">
                <h2 className="font-semibold mb-2 text-gray-700">Suggested Cities</h2>
                <div className="flex flex-wrap gap-2">
                    {getSuggestedCities('').slice(0, 5).map((suggestedCity) => (
                        <button
                            key={suggestedCity}
                            onClick={() => {
                                setCity(suggestedCity);
                                setInputValue(suggestedCity);
                            }}
                            className={`rounded-full px-3 py-1 text-sm ${city === suggestedCity
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-300 hover:bg-blue-400 text-white'
                                }`}
                        >
                            {suggestedCity}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CitySearchWithLocation;