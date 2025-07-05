import React, { useState, useEffect } from 'react';
import { Clock, Calculator, ArrowRight } from 'lucide-react';
import { formatMinutesToDuration, convertDurationToMinutes } from '../utils/dateUtils';

export const TimeConverter: React.FC = () => {
  const [inputMinutes, setInputMinutes] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(1);
  const [inputUnit, setInputUnit] = useState<string>('hours');
  const [convertedDuration, setConvertedDuration] = useState<string>('0 minutes');
  const [convertedMinutes, setConvertedMinutes] = useState<number>(0);

  const timeUnits = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' },
  ];

  // Update converted duration when input minutes change
  useEffect(() => {
    setConvertedDuration(formatMinutesToDuration(inputMinutes));
  }, [inputMinutes]);

  // Update converted minutes when input value or unit changes
  useEffect(() => {
    const minutes = convertDurationToMinutes(inputValue, inputUnit);
    setConvertedMinutes(minutes);
  }, [inputValue, inputUnit]);

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    setInputMinutes(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    setInputValue(value);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputUnit(e.target.value);
  };

  const presetValues = [
    { label: '1 Hour', minutes: 60 },
    { label: '8 Hours', minutes: 480 },
    { label: '1 Day', minutes: 1440 },
    { label: '1 Week', minutes: 10080 },
    { label: '1 Month', minutes: 43800 },
    { label: '1 Year', minutes: 525600 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Time Duration Converter
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Convert between different time units and minutes
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Calculator className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Minutes to Duration Converter */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Convert Minutes to Duration
          </h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                value={inputMinutes}
                onChange={handleMinutesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter minutes"
              />
            </div>
            <div className="flex items-center">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Duration
              </label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 min-h-[38px] flex items-center">
                {convertedDuration}
              </div>
            </div>
          </div>
        </div>

        {/* Duration to Minutes Converter */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Convert Duration to Minutes
          </h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Value
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={inputValue}
                onChange={handleValueChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter value"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Unit
              </label>
              <select
                value={inputUnit}
                onChange={handleUnitChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {timeUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Minutes
              </label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 min-h-[38px] flex items-center">
                {Math.round(convertedMinutes).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Quick Presets
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {presetValues.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setInputMinutes(preset.minutes)}
                className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-center"
              >
                <div className="font-medium">{preset.label}</div>
                <div className="text-gray-500">{preset.minutes.toLocaleString()} min</div>
              </button>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Usage Examples
          </h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div>• 90 minutes = {formatMinutesToDuration(90)}</div>
            <div>• 1,440 minutes = {formatMinutesToDuration(1440)}</div>
            <div>• 525,600 minutes = {formatMinutesToDuration(525600)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};