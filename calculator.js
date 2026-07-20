/*
==========================================================
| ORDO 5 A Day Assessment Tool
calculator.js
Version 5.0
==========================================================
*/

"use strict";

/*==========================================================
CATEGORY RULES
==========================================================*/

const CATEGORY_RULES = {

    "Fresh Fruit": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Fresh Vegetable": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Frozen Fruit": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Frozen Vegetable": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Canned Fruit": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Canned Vegetable": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Ready to Eat Fruit": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Ready to Eat Vegetable": {
        eligible: true,
        conversionFactor: 1.0
    },

    "Dried Fruit": {
        eligible: true,
        conversionFactor: 80 / 30
    },

    "Fruit Purée": {
        eligible: true,
        conversionFactor: 80 / 40
    },

    "Vegetable Purée": {
        eligible: true,
        conversionFactor: 80 / 40
    },

    "Tomato Purée": {
        eligible: true,
        conversionFactor: 80 / 27
    },

    "100% Fruit/Vegetable Juice": {
        eligible: true,
        conversionFactor: 80 / 150
    },

    "Smoothie": {
        eligible: true,
        conversionFactor: 80 / 150
    },

    "Beans (Cooked)": {
        eligible: true,
        conversionFactor: 80 / 150
    },

    "Pulses (Cooked)": {
        eligible: true,
        conversionFactor: 80 / 165
    },

    "Potato": {
        eligible: false,
        conversionFactor: 0
    },

    "Cassava": {
        eligible: false,
        conversionFactor: 0
    },

    "Yam": {
        eligible: false,
        conversionFactor: 0
    },

    "Plantain": {
        eligible: false,
        conversionFactor: 0
    },

    "Nuts": {
        eligible: false,
        conversionFactor: 0
    },

    "Seeds": {
        eligible: false,
        conversionFactor: 0
    },

    "Coconut": {
        eligible: false,
        conversionFactor: 0
    },

    "Excluded": {
        eligible: false,
        conversionFactor: 0
    }

};

/*==========================================================
CATEGORY HELPERS
==========================================================*/

function getCategoryRule(category){

    return CATEGORY_RULES[category] ||
           CATEGORY_RULES["Excluded"];

}

/*==========================================================
WEIGHT HELPERS
==========================================================*/

function getIngredientWeight(weight, percentage){

    return weight * (percentage / 100);

}

function calculateEligibleWeight(weight, category){

    const rule = getCategoryRule(category);

    if(!rule.eligible){

        return 0;

    }

    return weight * rule.conversionFactor;

}

function round(value){

    return Number(Number(value).toFixed(2));

}

/*==========================================================
RECIPE VALIDATION
==========================================================*/

function validateRecipe(ingredients){

    if(!Array.isArray(ingredients) || ingredients.length === 0){

        return{

            valid:false,

            message:"Please add at least one ingredient."

        };

    }

    let total = 0;

    for(const ingredient of ingredients){

        if(!ingredient.name){

            return{

                valid:false,

                message:"Each ingredient requires a name."

            };

        }

        if(isNaN(ingredient.percentage)){

            return{

                valid:false,

                message:`${ingredient.name}: Invalid percentage.`

            };

        }

        if(ingredient.percentage < 0){

            return{

                valid:false,

                message:`${ingredient.name}: Percentage cannot be negative.`

            };

        }

        if(ingredient.percentage > 100){

            return{

                valid:false,

                message:`${ingredient.name}: Percentage cannot exceed 100%.`

            };

        }

        total += ingredient.percentage;

    }

    if(Math.abs(total - 100) > 0.5){

        return{

            valid:false,

            message:`Ingredient percentages total ${total.toFixed(2)}%. They must total 100%.`

        };

    }

    return{

        valid:true,

        message:""

    };

}
/*==========================================================
INGREDIENT CALCULATION
==========================================================*/

function calculateIngredient(ingredient, servingSize){

    const ingredientWeight =
        getIngredientWeight(
            servingSize,
            ingredient.percentage
        );

    const actualContribution =
        calculateEligibleWeight(
            ingredientWeight,
            ingredient.category
        );

    // Cap each eligible ingredient at a maximum contribution of 80 g (1 portion)
    const allowedContribution =
        Math.min(actualContribution, 80);

    return{

        name: ingredient.name,

        category: ingredient.category,

        percentage: ingredient.percentage,

        ingredientWeight:
            round(ingredientWeight),

        actualContribution:
            round(actualContribution),

        allowedContribution:
            round(allowedContribution),

        scoreContribution:
            round(allowedContribution / 80),

        status:
            actualContribution > 0
                ? "Included"
                : "Excluded"

    };

}

/*==========================================================
MAIN CALCULATION ENGINE
==========================================================*/

function calculateFiveADay(

    ingredients,
    packWeight,
    servingSize

){

    const calculatedIngredients = [];

    let totalActualContribution = 0;

    let totalAllowedContribution = 0;

    ingredients.forEach(ingredient=>{

        const result =
            calculateIngredient(
                ingredient,
                servingSize
            );

        calculatedIngredients.push(result);

        totalActualContribution +=
            result.actualContribution;

        totalAllowedContribution +=
            result.allowedContribution;

    });

    const actualPerServing =
        totalActualContribution;

    const allowedPerServing =
        totalAllowedContribution;

    const fiveADayScore =
        allowedPerServing / 80;

    return{

        servingSize:
            round(servingSize),

        totalActualContribution:
            round(totalActualContribution),

        totalAllowedContribution:
            round(totalAllowedContribution),

        actualFruitVegPerServing:
            round(actualPerServing),

        totalEligibleContribution:
            round(allowedPerServing),

        portions:
            round(fiveADayScore),

        fiveADayScore:
            round(fiveADayScore),

        ingredients:
            calculatedIngredients

    };

}

/*==========================================================
SUMMARY HELPERS
==========================================================*/

function getSummary(result){

    return{

        totalActualContribution:
            round(result.totalActualContribution),

        totalAllowedContribution:
            round(result.totalAllowedContribution),

        actualFruitVegPerServing:
            round(result.actualFruitVegPerServing),

        eligibleFruitVegPerServing:
            round(result.totalEligibleContribution),

        fiveADayScore:
            round(result.fiveADayScore)

    };

}

/*==========================================================
NUMBER FORMATTERS
==========================================================*/

function formatWeight(value){

    return round(value).toFixed(2);

}

function formatScore(value){

    return round(value).toFixed(2);

}

/*==========================================================
EXPORTS
==========================================================*/

window.calculateFiveADay = calculateFiveADay;

window.validateRecipe = validateRecipe;

window.calculateIngredient = calculateIngredient;

window.calculateEligibleWeight = calculateEligibleWeight;

window.getIngredientWeight = getIngredientWeight;

window.getSummary = getSummary;

window.formatWeight = formatWeight;

window.formatScore = formatScore;