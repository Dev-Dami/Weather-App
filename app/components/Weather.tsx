"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useGeolocation } from "react-use";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface WeatherData {
    current: {
        temp_c: number;
        condition: {
            text: string;
            icon: string;
        };
        humidity: number;
        wind_kph: number;
    };
    forecast: {
        forecastday: {
            date: string;
            day: {
                avgtemp_c: number;
                avgtemp_f: number;
                condition: {
                    text: string;
                    icon: string;
                };
            };
        }[];
    };
}

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
                setCity("Lagos");
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
            setSuggestions(getSuggestedCities(''));
        } else {
            const timer = setTimeout(() => {
                setSuggestions(getSuggestedCities(inputValue));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [inputValue]);

    const handleCityChange = (value: string) => {
        setCity(value);
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

const Weather = () => {
    const [city, setCity] = useState<string>("");
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const API_KEY = "08ec0fca8de542d4a26121119251208";

    const location = useGeolocation();

    const fetchCityFromCoords = async (lat: number, lon: number) => {
        try {
            const res = await axios.get(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const cityName = res.data.city || res.data.locality || res.data.principalSubdivision || "";
            if (cityName) {
                setCity(cityName);
            } else {
                setCity("Lagos");
            }
        } catch (error) {
            console.error("Error fetching city from coordinates:", error);
            setCity("Lagos");
        }
    };

    const fetchWeather = async (cityToFetch: string = city) => {
        if (!cityToFetch) return;
        try {
            const res = await axios.get<WeatherData>(
                `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityToFetch}&days=5&aqi=no&alerts=no`
            );
            setWeather(res.data);
        } catch (err) {
            console.error("Error fetching weather:", err);
        }
    };

    useEffect(() => {
        if (location.latitude && location.longitude) {
            fetchCityFromCoords(location.latitude, location.longitude);
        }
    }, [location.latitude, location.longitude]);

    useEffect(() => {
        fetchWeather();
    }, [city]);

    const formattedDate = new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const chartData =
        weather?.forecast?.forecastday.map((day) => ({
            date: new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
            avgtemp_c: day.day.avgtemp_c,
            avgtemp_f: day.day.avgtemp_f,
        })) || [];

    return (
        <div className="h-screen bg-gradient-to-b from-blue-200 to-blue-500 text-gray-900 p-4 overflow-hidden flex flex-col">
            <h1 className="text-2xl font-bold text-white mb-2">
                Weather Forecast App Dami Project
            </h1>
            <div className="flex flex-1 bg-gray-100 rounded-xl shadow-xl p-4 gap-4 overflow-hidden">
                <div className="w-1/3 flex flex-col justify-start">
                    <CitySearchWithLocation onSearch={fetchWeather} />
                    {weather && (
                        <div className="text-center mt-3">
                            <p className="text-sm font-semibold mb-1">{formattedDate}</p>
                            <img
                                src={weather.current.condition.icon}
                                alt={weather.current.condition.text}
                                className="mx-auto mb-1"
                            />
                            <div className="text-3xl mb-1">
                                {weather.current.temp_c}°C
                            </div>
                            <div className="text-md font-bold mb-2">
                                {weather.current.condition.text}
                            </div>
                            <div className="flex justify-center gap-10 text-xs">
                                <div className="flex flex-col items-center">
                                    <span className="font-semibold">Humidity</span>
                                    <span>{weather.current.humidity}%</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="font-semibold">Wind Speed</span>
                                    <span>{weather.current.wind_kph} km/h</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-2/3 flex flex-col justify-between">
                    <div className="bg-gray-100 rounded-lg p-4 h-3/5">
                        <h2 className="text-md font-semibold mb-2">Temperature Trend</h2>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === "avgtemp_c") return [value, "avg temp (°C)"];
                                        if (name === "avgtemp_f") return [value, "avg temp (°F)"];
                                        return [value, name];
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avgtemp_c"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#3b82f6" }}
                                    name="avgtemp_c"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avgtemp_f"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#f97316" }}
                                    name="avgtemp_f"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 h-2/5 grid grid-cols-4 gap-2 mt-2 overflow-hidden">
                        {weather?.forecast?.forecastday.slice(0, 4).map((day, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 p-2 rounded-lg text-center shadow text-xs"
                            >
                                <p className="font-semibold mb-1">
                                    {new Date(day.date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                                <img
                                    src={day.day.condition.icon}
                                    alt={day.day.condition.text}
                                    className="mx-auto mb-1 w-8 h-8"
                                />
                                <p className="font-bold mb-1">{day.day.condition.text}</p>
                                <p className="font-bold">{day.day.avgtemp_c}°C</p>
                                <p className="text-gray-500">
                                    {day.day.avgtemp_f}°F</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Weather;