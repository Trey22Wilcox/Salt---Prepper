const resultsDiv = document.getElementById('results');
const ingredientInput = document.getElementById('ingredientInput');
const titleInput = document.getElementById('titleInput');
const searchIngredientBtn = document.getElementById('searchIngredientBtn');
const searchTitleBtn = document.getElementById('searchTitleBtn');

searchIngredientBtn.addEventListener('click', searchIngredient);
searchTitleBtn.addEventListener('click', searchByTitle);

async function searchIngredient() {
    const ingredient = ingredientInput.value.trim();
    if (!ingredient) {
        alert('Please enter an ingredient.');
        return;
    }
    resultsDiv.innerHTML = "<p> Loading... </p>";

    try{
        const response = await fetch(`http://localhost:3000/recipes/search?ingredient=${ingredient}`);
        const data = await response.json();
        displayResults(data);
    }
    catch(error){
        console.error('Error fetching recipes:', error);
        resultsDiv.innerHTML = "<p> Error fetching recipes. Please try again later. </p>";
    }
}

async function searchByTitle() {
    const title = titleInput.value.trim();
    if (!title) return alert("Enter a title");

    resultsDiv.innerHTML = "<p>Loading...</p>";
    try {
        const res = await fetch(`http://localhost:3000/recipes/title?title=${title}`);
        const data = await res.json();
        displayResults(data);
    } catch (err) {
        resultsDiv.innerHTML = `<p>Error fetching recipes: ${err.message}</p>`;
    }
}

function displayResults(recipes) {
    if (!recipes || recipes.length === 0) {
        resultsDiv.innerHTML = "<p> No recipes found. </p>";
        return;
    }
    
    resultsDiv.innerHTML = recipes.map(r => `
        <div class="recipe">
            <h3>${r.title}</h3>
            <p><strong>Ingredients:</strong> ${r.ingredients}</p>
            <p><strong>Instructions:</strong> ${r.instructions}</p>
        </div>
    `).join('');
}