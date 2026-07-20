/*
==========================================================
| ORDO 5 A Day Assessment Tool
app.js
Version 4.0
==========================================================
*/

"use strict";

/*==========================================================
GLOBAL VARIABLES
==========================================================*/

let ingredientDatabase = [];

/*==========================================================
INITIALISE APPLICATION
==========================================================*/

document.addEventListener("DOMContentLoaded", async () => {

    await loadIngredientDatabase();

    buildIngredientDatalist();

    initialiseWizard();

    initialiseButtons();

    addIngredientRow();

});

/*==========================================================
LOAD INGREDIENT DATABASE
==========================================================*/

async function loadIngredientDatabase(){

    try{

        const response =
            await fetch("data/ingredients.json");

        if(!response.ok){

            throw new Error("Unable to load ingredient database.");

        }

        ingredientDatabase =
            await response.json();

    }

    catch(error){

        console.error(error);

        alert("Unable to load ingredient database.");

    }

}

/*==========================================================
WIZARD
==========================================================*/

function initialiseWizard(){

    showStep(1);

}

function showStep(step){

    document
        .querySelectorAll("section.card")
        .forEach(card=>{

            card.classList.add("hidden");

        });

    document
        .querySelectorAll(".step")
        .forEach(item=>{

            item.classList.remove("active");

        });

    document
        .getElementById("step"+step)
        .classList.remove("hidden");

    document
        .querySelectorAll(".step")[step-1]
        .classList.add("active");

}

/*==========================================================
BUTTONS
==========================================================*/

function initialiseButtons(){

    document
        .getElementById("continueIngredients")
        .addEventListener("click",validateProduct);

    document
        .getElementById("backProduct")
        .addEventListener("click",()=>showStep(1));

    document
        .getElementById("backIngredients")
        .addEventListener("click",()=>showStep(2));

    document
        .getElementById("addIngredient")
        .addEventListener("click",addIngredientRow);

    document
        .getElementById("calculate")
        .addEventListener("click",calculateRecipe);

    document
        .getElementById("downloadReport")
        .addEventListener("click",downloadReport);

}

/*==========================================================
VALIDATE PRODUCT
==========================================================*/

function validateProduct(){

    const productName =
        document
        .getElementById("productName")
        .value
        .trim();

    const servingSize =
        Number(
            document.getElementById("servingSize").value
        );

    const packWeight =
        Number(
            document.getElementById("packWeight").value
        );

    if(productName===""){

        alert("Please enter a product name.");

        return;

    }

    if(isNaN(servingSize) || servingSize<=0){

        alert("Please enter a valid serving size.");

        return;

    }

    if(isNaN(packWeight) || packWeight<=0){

        alert("Please enter a valid pack weight.");

        return;

    }

    showStep(2);

}

/*==========================================================
ADD INGREDIENT ROW
==========================================================*/

function addIngredientRow(){

    const tbody =
        document.getElementById("ingredientBody");

    const row =
        document.createElement("tr");

    row.innerHTML = `

        <td>

            <input
                type="text"
                class="ingredient-name"
                list="ingredient-list"
                placeholder="Start typing ingredient...">

        </td>

        <td class="ingredient-category">

            Unknown

        </td>

        <td>

            <input
                type="number"
                class="ingredient-percent"
                min="0"
                max="100"
                step="0.01"
                placeholder="%">

        </td>

        <td>

            <button
                type="button"
                class="remove-btn">

                ✖

            </button>

        </td>

    `;

    tbody.appendChild(row);

    row
        .querySelector(".ingredient-name")
        .addEventListener("input",()=>{

            updateCategory(row);

        });

    row
        .querySelector(".ingredient-percent")
        .addEventListener("input",()=>{

            updateIngredientTotal();

        });

    row
        .querySelector(".remove-btn")
        .addEventListener("click",()=>{

            row.remove();

            updateIngredientTotal();

        });

}
/*==========================================================
UPDATE CATEGORY
==========================================================*/

function updateCategory(row){

    const ingredientName =
        row
        .querySelector(".ingredient-name")
        .value
        .trim()
        .toLowerCase();

    const categoryCell =
        row.querySelector(".ingredient-category");

    const ingredient =
        ingredientDatabase.find(item=>{

            if(item.name.toLowerCase()===ingredientName){

                return true;

            }

            if(Array.isArray(item.aliases)){

                return item.aliases.some(alias=>

                    alias.toLowerCase()===ingredientName

                );

            }

            return false;

        });

    if(ingredient){

        categoryCell.textContent =
            ingredient.category;

    }

    else{

        categoryCell.textContent =
            "Excluded";

    }

}

/*==========================================================
COLLECT INGREDIENTS
==========================================================*/

function collectIngredients(){

    const rows =
        document.querySelectorAll("#ingredientBody tr");

    const ingredients = [];

    rows.forEach(row=>{

        const name =
            row
            .querySelector(".ingredient-name")
            .value
            .trim();

        if(name===""){

            return;

        }

        ingredients.push({

            name: name,

            category:
                row
                .querySelector(".ingredient-category")
                .textContent
                .trim(),

            percentage:
                Number(
                    row
                    .querySelector(".ingredient-percent")
                    .value
                ) || 0

        });

    });

    return ingredients;

}

/*==========================================================
UPDATE INGREDIENT TOTAL
==========================================================*/

function updateIngredientTotal(){

    let total = 0;

    document
        .querySelectorAll(".ingredient-percent")
        .forEach(input=>{

            total += Number(input.value) || 0;

        });

    document.getElementById("ingredientTotal").textContent =
        total.toFixed(2) + "%";

}

/*==========================================================
BUILD INGREDIENT DATALIST
==========================================================*/

function buildIngredientDatalist(){

    let list =
        document.getElementById("ingredient-list");

    if(list){

        list.remove();

    }

    list =
        document.createElement("datalist");

    list.id = "ingredient-list";

    ingredientDatabase.forEach(item=>{

        const option =
            document.createElement("option");

        option.value = item.name;

        list.appendChild(option);

        if(Array.isArray(item.aliases)){

            item.aliases.forEach(alias=>{

                const aliasOption =
                    document.createElement("option");

                aliasOption.value = alias;

                list.appendChild(aliasOption);

            });

        }

    });

    document.body.appendChild(list);

}

/*==========================================================
CALCULATE RECIPE
==========================================================*/

function calculateRecipe(){

    const ingredients = collectIngredients();

    if(ingredients.length===0){

        alert("Please add at least one ingredient.");

        return;

    }

    const validation =
        validateRecipe(ingredients);

    if(!validation.valid){

        alert(validation.message);

        return;

    }

    const packWeight =
        Number(
            document.getElementById("packWeight").value
        );

    const servingSize =
        Number(
            document.getElementById("servingSize").value
        );

    const result =
        calculateFiveADay(

            ingredients,

            packWeight,

            servingSize

        );

    displayAssessment(result);

}
/*==========================================================
DISPLAY ASSESSMENT
==========================================================*/

function displayAssessment(result){

    showStep(3);

    // Summary

    document.getElementById("fvWeight").textContent =
        result.totalEligibleContribution.toFixed(2) + " g";

    document.getElementById("portionResult").textContent =
        result.fiveADayScore.toFixed(2);

    // Ingredient Summary Table

    const tbody =
        document.querySelector("#summaryTable tbody");

    tbody.innerHTML = "";

    result.ingredients.forEach(item=>{

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${item.name}</td>

            <td>${item.category}</td>

            <td>${item.allowedContribution.toFixed(2)} g</td>

            <td>${item.status}</td>

        `;

        tbody.appendChild(row);

    });

}

/*==========================================================
DOWNLOAD REPORT
==========================================================*/

function downloadReport(){

    alert(
        "PDF export will be added in Version 5."
    );

}

/*==========================================================
RESET CALCULATOR
==========================================================*/

function resetCalculator(){

    document.getElementById("productName").value = "";

    document.getElementById("packWeight").value = "";

    document.getElementById("servingSize").value = "";

    document.getElementById("ingredientBody").innerHTML = "";

    document.getElementById("ingredientTotal").textContent = "0.00%";

    addIngredientRow();

    showStep(1);

}

/*==========================================================
HELPER
==========================================================*/

function formatNumber(value){

    return Number(value).toFixed(2);

}