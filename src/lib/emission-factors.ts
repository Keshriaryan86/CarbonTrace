export interface EmissionFactor {
  id: string;
  name: string; // keyword to match against AI output
  value: number; // kg CO2e per unit
  unit: 'kg' | 'g' | 'km' | 'mile' | 'hour' | 'kwh' | 'serving';
  description: string;
}

export const emissionFactors: EmissionFactor[] = [
  // Food (per kg)
  { id: 'beef', name: 'beef', value: 27.0, unit: 'kg', description: 'Beef (beef herd)' },
  { id: 'lamb', name: 'lamb', value: 24.0, unit: 'kg', description: 'Lamb & Mutton' },
  { id: 'pork', name: 'pork', value: 12.1, unit: 'kg', description: 'Pig Meat' },
  { id: 'chicken', name: 'chicken', value: 6.9, unit: 'kg', description: 'Poultry Meat' },
  { id: 'fish', name: 'fish', value: 6.1, unit: 'kg', description: 'Farmed Fish' },
  { id: 'cheese', name: 'cheese', value: 13.5, unit: 'kg', description: 'Cheese' },
  { id: 'eggs', name: 'eggs', value: 4.8, unit: 'kg', description: 'Eggs' },
  { id: 'rice', name: 'rice', value: 2.7, unit: 'kg', description: 'Rice' },
  { id: 'tofu', name: 'tofu', value: 2.0, unit: 'kg', description: 'Tofu' },
  { id: 'vegetables', name: 'vegetables', value: 0.7, unit: 'kg', description: 'Vegetables' },
  { id: 'fruits', name: 'fruits', value: 1.1, unit: 'kg', description: 'Fruits' },
  { id: 'coffee', name: 'coffee', value: 17.0, unit: 'kg', description: 'Coffee' },
  { id: 'milk', name: 'milk', value: 1.9, unit: 'kg', description: 'Milk' },

  // Transportation (per km)
  { id: 'car-petrol', name: 'petrol car', value: 0.192, unit: 'km', description: 'Car (petrol)' },
  { id: 'car-diesel', name: 'diesel car', value: 0.171, unit: 'km', description: 'Car (diesel)' },
  { id: 'car-electric', name: 'electric car', value: 0.053, unit: 'km', description: 'Car (electric)' },
  { id: 'bus', name: 'bus', value: 0.105, unit: 'km', description: 'Bus' },
  { id: 'train', name: 'train', value: 0.041, unit: 'km', description: 'Train' },
  { id: 'flight-domestic', name: 'domestic flight', value: 0.255, unit: 'km', description: 'Flight (domestic)' },
  { id: 'flight-short-haul', name: 'short-haul flight', value: 0.156, unit: 'km', description: 'Flight (short-haul international)' },
  { id: 'flight-long-haul', name: 'long-haul flight', value: 0.150, unit: 'km', description: 'Flight (long-haul international)' },
  
  // Electricity (per kWh)
  { id: 'electricity', name: 'electricity', value: 0.475, unit: 'kwh', description: 'Grid electricity' },
  
  // Lifestyle (per item/serving)
  { id: 't-shirt-cotton', name: 'cotton t-shirt', value: 7.0, unit: 'serving', description: 'One cotton t-shirt' },
  { id: 'jeans', name: 'jeans', value: 33.4, unit: 'serving', description: 'One pair of jeans' },
  { id: 'laptop', name: 'laptop', value: 300.0, unit: 'serving', description: 'One laptop (production + avg life)' },
];
