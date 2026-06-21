export const EMISSION_FACTORS = {
    transportation: {
        car: 0.192,
        bike: 0.103,
        motorbike: 0.103,
        scooty: 0.09,
        bus: 0.089,
        metro: 0.041,
        carpool: 0.096,
        ev: 0.05,
        walking: 0,
        cycling: 0
    },
    electricity: 0.82, // approx 0.82 kg CO2 per kWh
    diet: {
        'Vegetarian': 1.5, // kg CO2 per day approx
        'Eggetarian': 2.0,
        'Non-Vegetarian': 3.3
    },
    shopping: {
        'low': 5, // kg CO2 per month
        'medium': 15,
        'high': 30
    }
};
